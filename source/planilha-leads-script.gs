function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = JSON.parse(e.postData.contents);
    var nome     = String(data.nome     || '').trim();
    var telefone = String(data.telefone || '').trim();
    if (!nome || !telefone) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'erro', error: 'nome e telefone obrigatórios' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LEADS');
    sheet.appendRow([
      data.data,
      nome,
      telefone,
      data.origem  || '',
      data.pagina  || '',
      'Aguardando abordagem'
    ]);
    // UTMs nas colunas AC(29), AD(30), AE(31) — separado para não sobrescrever ARRAYFORMULA em AB
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 29, 1, 3).setValues([[
      data.campanha || '',
      data.conjunto || '',
      data.anuncio  || ''
    ]]);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'erro', error: err.message || String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
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
  if (sheet.getIndex() !== 1) return;

  const row = e.range.getRow();
  const col = e.range.getColumn();
  if (row === 1) return;

  const COL_VENDEDOR    = 7;
  const COL_STATUS_SDR  = 6;
  const COL_STATUS_VEND = 19;

  if (col !== COL_VENDEDOR) return;

  const vendedor   = String(e.value || '').trim();
  const statusVend = String(sheet.getRange(row, COL_STATUS_VEND).getValue() || '').trim();
  const statusSdr  = String(sheet.getRange(row, COL_STATUS_SDR).getValue() || '').trim();

  if (vendedor) {
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
  }
}
