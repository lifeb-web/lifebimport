function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  var nome, telefone, origem, pagina, cnpj, campanha, conjunto, anuncio;
  try {
    var data = JSON.parse(e.postData.contents);
    nome     = String(data.nome     || '').trim();
    telefone = String(data.telefone || '').trim();
    origem   = data.origem   || '';
    pagina   = data.pagina   || '';
    cnpj     = data.cnpj     || '';
    campanha = data.campanha || '';
    conjunto = data.conjunto || '';
    anuncio  = data.anuncio  || '';
    if (!nome || !telefone) {
      lock.releaseLock();
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'erro', error: 'nome e telefone obrigatórios' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LEADS');
    sheet.appendRow([
      data.data,
      nome,
      telefone,
      origem,
      pagina,
      'Aguardando abordagem'
    ]);
    // UTMs nas colunas AC(29), AD(30), AE(31) — separado para não sobrescrever ARRAYFORMULA em AB
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 29, 1, 3).setValues([[
      data.campanha || '',
      data.conjunto || '',
      data.anuncio  || ''
    ]]);
    // CNPJ na coluna N (14)
    if (cnpj) {
      sheet.getRange(lastRow, 14).setValue(String(cnpj).replace(/\D/g, ''));
    }
  } catch (err) {
    lock.releaseLock();
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'erro', error: err.message || String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  lock.releaseLock();

  // GS Engage — FORA do lock, falha silenciosa (não trava o lead se o GS estiver lento/fora)
  try {
    var gsKey = PropertiesService.getScriptProperties().getProperty('GS_API_KEY');
    if (gsKey) {
      _sendLeadToGSEngage(gsKey, nome, telefone, origem, pagina, cnpj, campanha, conjunto, anuncio);
    }
  } catch (_) {}

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GS ENGAGE: cria lead INBOUND e enrola na cadência inbound ────────
function _sendLeadToGSEngage(gsKey, nome, telefone, origem, pagina, cnpj, campanha, conjunto, anuncio) {
  var GS_BASE = 'https://api.gsengage.com/api/v1';
  var INBOUND_ROUTINE_ID = '6a3065cb2e916c2f2e1ce4b2';

  var partes    = nome.split(/\s+/);
  var firstName = partes[0];
  var lastName  = partes.slice(1).join(' ') || '';
  var digits    = telefone.replace(/\D/g, '');
  var fone      = digits.indexOf('55') === 0 ? '+' + digits : '+55' + digits;

  // Campos personalizados no GS (atribuição completa) — nomes batem com os criados no GS Engage.
  var customFields = {};
  if (cnpj)     customFields['CNPJ']     = String(cnpj).replace(/\D/g, '');
  if (origem)   customFields['Origem']   = origem;
  if (pagina)   customFields['Pagina']   = pagina;
  if (campanha) customFields['Campanha'] = campanha;
  if (conjunto) customFields['Conjunto'] = conjunto;
  if (anuncio)  customFields['Anuncio']  = anuncio;

  var leadPayload = {
    firstName:       firstName,
    lastName:        lastName,
    mobiles:         [{ value: fone }],
    sourceType:      'API',
    acquisitionType: 'INBOUND',
    customFields:    customFields
  };

  // User-Agent de browser — foi o que passou no teste (WAF do GS Engage)
  var headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json'
  };

  var respLead = UrlFetchApp.fetch(GS_BASE + '/leads?apiKey=' + gsKey, {
    method:             'post',
    contentType:        'application/json',
    headers:            headers,
    payload:            JSON.stringify(leadPayload),
    muteHttpExceptions: true
  });
  var leadData = JSON.parse(respLead.getContentText());
  var leadId   = (leadData.data && (leadData.data.id || leadData.data._id)) || null;
  if (!leadId) {
    Logger.log('GS Engage lead error (' + respLead.getResponseCode() + '): ' + respLead.getContentText().slice(0, 200));
    return;
  }

  var respProsp = UrlFetchApp.fetch(GS_BASE + '/prospections?apiKey=' + gsKey, {
    method:             'post',
    contentType:        'application/json',
    headers:            headers,
    payload:            JSON.stringify({ leadId: leadId, routineId: INBOUND_ROUTINE_ID }),
    muteHttpExceptions: true
  });
  Logger.log('GS Engage enrolled ' + leadId + ' → status ' + respProsp.getResponseCode());
}

// ── PUSH NOTIFICATION (OneSignal) ────────────────────────────
var OS_APP_ID  = '84b302ec-0b90-48d4-b755-2bce662e6769';
var OS_API_KEY = 'os_v2_app_qszqf3alsbenjn2vfphgmlthngtkjafhf5deku53yseikmcxjoe235ns6yyeqf2h3matiptvdzotn3asciizkw7slg5bmuhageitezy';

function sendLeadNotification(repName, nomeLead) {
  try {
    var REP_URLS = {
      'IRAMAR':       'https://projetojlbv.com.br/rep/dash/iramar/',
      'NATANAEL':     'https://projetojlbv.com.br/rep/dash/natanael/',
      'ROBERT_TESTE': 'https://projetojlbv.com.br/rep/dash/robert-teste/'
    };
    var url = REP_URLS[repName.toUpperCase()] || 'https://projetojlbv.com.br';
    var payload = {
      app_id: OS_APP_ID,
      filters: [{ field: 'tag', key: 'rep', relation: '=', value: repName.toUpperCase() }],
      headings: { en: 'Novo lead 🎯', pt: 'Novo lead 🎯' },
      contents: { en: nomeLead, pt: nomeLead },
      url: url
    };
    UrlFetchApp.fetch('https://onesignal.com/api/v1/notifications', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Basic ' + OS_API_KEY },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch(e) { /* silently fail — não trava o fluxo */ }
}

// ── ATRIBUIÇÃO DE VENDEDOR ────────────────────────────────────
// ATENÇÃO: esta função deve ser instalada como trigger instalável
// (não simples) para poder chamar UrlFetchApp (sendLeadNotification).
// Extensions → Apps Script → Triggers → + Add trigger
// → onLeadEdit → Spreadsheet → On edit
function onLeadEdit(e) {
  const sheet = e.source.getActiveSheet();
  if (sheet.getName() !== 'LEADS') return;

  const row = e.range.getRow();
  const col = e.range.getColumn();
  if (row === 1) return;

  const COL_VENDEDOR    = 7;
  const COL_DATA_ENVIO  = 8;
  const COL_STATUS_SDR  = 6;
  const COL_STATUS_VEND = 19;

  if (col !== COL_VENDEDOR) return;

  const vendedor   = String(e.value || '').trim();
  const statusVend = String(sheet.getRange(row, COL_STATUS_VEND).getValue() || '').trim();
  const statusSdr  = String(sheet.getRange(row, COL_STATUS_SDR).getValue() || '').trim();

  if (vendedor) {
    sheet.getRange(row, COL_DATA_ENVIO).setValue(new Date());
    if (!statusVend) {
      sheet.getRange(row, COL_STATUS_VEND).setValue('Aguardando contato');
    }
    if (statusSdr !== 'Qualificado') {
      sheet.getRange(row, COL_STATUS_SDR).setValue('Qualificado');
    }
    const nomeLead = String(sheet.getRange(row, 2).getValue() || 'Novo lead').trim();
    sendLeadNotification(vendedor, nomeLead);
  } else if (statusVend === 'Aguardando contato') {
    sheet.getRange(row, COL_STATUS_VEND).setValue('');
    sheet.getRange(row, COL_DATA_ENVIO).setValue('');
  }
}
