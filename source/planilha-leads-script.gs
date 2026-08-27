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

// 🔴 27/08 (achados reais, mesmo dia): (1) Adriana Valentim digitou "(21) 09923-2680" no formulário — falta
// o "9" de celular, GS Engage recusa "mobiles[0].value" com razão, e SEM esta correção o lead nunca vinga
// (fila de retentativa tenta pra sempre um telefone que NUNCA vai passar). Robert: "quase todo mundo manda
// mensagem no zap porque além de cadastrar tem o botão de chamar no zap... faz sentido cadastrar mesmo com
// telefone errado porque o SDR corrige o telefone quando o cliente chama; se não chamar, marca como perdido,
// motivo erro na lista." Ou seja: perder o REGISTRO por telefone mal-formatado é pior que ter o registro com
// telefone placeholder — o SDR sempre corrige via o contato real que chega por fora. (2) Wellingta do Prado
// foi cadastrada 2x no GS Engage no mesmo dia — a planilha nunca checava se o lead JÁ existia antes de criar
// (o worker do Cloudflare, rede de segurança, cria de backup depois de ~33min sem achar nada; quando a
// planilha consegue DEPOIS, numa tentativa atrasada, duplica). Corrigido: dedup por telefone (últimos 8
// dígitos, criado nas últimas 24h) ANTES de criar — mesmo critério já usado pelo worker.
function _gsEngageBuscarPorTelefone_(gsKey, telefoneDigits, headers) {
  var f8 = String(telefoneDigits || '').slice(-8);
  if (f8.length !== 8) return null; // telefone curto demais pra buscar — não bloqueia criação
  try {
    for (var pg = 1; pg <= 2; pg++) {
      var url = 'https://api.gsengage.com/api/v1/leads?apiKey=' + gsKey + '&limit=100&page=' + pg + '&search=' + f8;
      var resp = UrlFetchApp.fetch(url, { method: 'get', headers: headers, muteHttpExceptions: true });
      if (resp.getResponseCode() !== 200) return null; // busca falhou → fail-open, não trava a criação
      var data = JSON.parse(resp.getContentText()).data || [];
      for (var i = 0; i < data.length; i++) {
        var lead = data[i];
        var tels = (lead.mobiles || []).concat(lead.phones || []).map(function(t) { return String((t && t.value) || '').replace(/\D/g, ''); });
        var idadeMs = new Date() - new Date(lead.createdAt || 0);
        var bateTelefone = false;
        for (var j = 0; j < tels.length; j++) { if (tels[j].indexOf(f8) !== -1) { bateTelefone = true; break; } }
        if (bateTelefone && idadeMs < 86400000) return lead;
      }
      if (data.length < 100) break;
    }
  } catch (e) {}
  return null;
}
function _gsEngageTelefoneRejeitado_(respText) {
  return /"mobiles"|"phones"/.test(respText || '') && /inv[aá]lido/i.test(respText || '');
}
function _gsEngagePlaceholderMesmoDDD_(foneOriginal) {
  var digitos = String(foneOriginal || '').replace(/\D/g, '').replace(/^55/, '');
  var ddd = digitos.substring(0, 2);
  if (!/^\d{2}$/.test(ddd)) return null; // não deu pra extrair DDD plausível — não arrisca chutar
  return '+55' + ddd + '900000000';
}

// ── GS ENGAGE: cria lead INBOUND e enrola na cadência inbound ────────
// achado 15/07 (Robert: "às vezes cai, às vezes não" — lead sumia sem deixar
// rastro): era 1 tentativa só, e o chamador (doPost) engolia qualquer erro
// num catch vazio. Agora tenta até 3x com pausa curta; se mesmo assim falhar,
// grava numa aba própria (GSEngage_Falhas) pra um trigger reprocessar depois
// — nunca mais perde lead em silêncio. opts.isRetry=true (usado por
// retryGSEngageFalhas) evita registrar uma SEGUNDA entrada na fila.
function _sendLeadToGSEngage(gsKey, nome, telefone, origem, pagina, cnpj, campanha, conjunto, anuncio, opts) {
  opts = opts || {};
  var GS_BASE = 'https://api.gsengage.com/api/v1';
  var INBOUND_ROUTINE_ID = '6a3065cb2e916c2f2e1ce4b2';

  var partes    = nome.split(/\s+/);
  var firstName = partes[0];
  var lastName  = partes.slice(1).join(' ') || '';
  // achado 15/07: telefone com DDD 55 (Rio Grande do Sul) sem código de país
  // (ex: "55991234567", 11 dígitos) era confundido com "já tem +55" só por
  // começar com esse número — virava "+5599..." faltando o código de país de
  // verdade. Corrigido: decide pelo TAMANHO do número (10/11 dígitos = local,
  // sempre ganha +55; 12/13 = já tem código de país), não mais pelo prefixo.
  var digits = String(telefone).replace(/\D/g, '');
  var fone   = (digits.length === 12 || digits.length === 13) ? '+' + digits : '+55' + digits;

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

  // 🔴 27/08: dedup ANTES de criar — se um lead com este telefone já existe (criado nas últimas 24h, pelo
  // worker de backup OU por uma execução anterior desta própria função), não cria de novo. Fail-open: se a
  // busca falhar/der erro, segue pra criação normal (nunca trava um lead legítimo por causa de uma busca
  // instável).
  var _jaExiste = _gsEngageBuscarPorTelefone_(gsKey, digits, headers);
  if (_jaExiste) {
    Logger.log('GS Engage: lead "' + nome + '" já existe (id ' + _jaExiste.id + ', mesmo telefone, <24h) — não duplica.');
    return true;
  }

  var _leadResult = _postToGSEngageWithRetry_(GS_BASE + '/leads?apiKey=' + gsKey, leadPayload, headers, function(respText) {
    try {
      var d = JSON.parse(respText);
      return (d.data && (d.data.id || d.data._id)) || null;
    } catch (_) { return null; }
  });
  var leadId = _leadResult.value;

  // 🔴 27/08: telefone rejeitado por FORMATO (não outro motivo) → tenta de novo com placeholder do mesmo DDD,
  // guardando o telefone original em "Observação SDR" pro SDR corrigir quando o cliente chamar no WhatsApp.
  if (!leadId && _gsEngageTelefoneRejeitado_(_leadResult.lastText)) {
    var _placeholder = _gsEngagePlaceholderMesmoDDD_(fone);
    if (_placeholder) {
      var leadPayloadFallback = JSON.parse(JSON.stringify(leadPayload)); // clone raso, evita mutar o original
      leadPayloadFallback.mobiles = [{ value: _placeholder }];
      leadPayloadFallback.customFields['Observação SDR'] = '⚠️ Telefone do formulário era inválido: "' + fone + '" — aguarda contato real do cliente via WhatsApp (botão da LP) pra corrigir. Se não chamar, marcar perdido (motivo: erro na lista).';
      var _leadResult2 = _postToGSEngageWithRetry_(GS_BASE + '/leads?apiKey=' + gsKey, leadPayloadFallback, headers, function(respText) {
        try { var d = JSON.parse(respText); return (d.data && (d.data.id || d.data._id)) || null; } catch (_) { return null; }
      });
      if (_leadResult2.value) { leadId = _leadResult2.value; Logger.log('GS Engage: telefone inválido, criado com placeholder ' + _placeholder + ' — lead "' + nome + '" preservado (id ' + leadId + ').'); }
    }
  }

  if (!leadId) {
    if (!opts.isRetry) registrarFalhaGSEngage_(nome, telefone, origem, pagina, cnpj, campanha, conjunto, anuncio);
    Logger.log('GS Engage: lead "' + nome + '" falhou após retries' + (opts.isRetry ? ' (reprocessamento)' : '') + ' — ' + (opts.isRetry ? 'segue na fila' : 'gravado em GSEngage_Falhas'));
    return false;
  }

  // 03/08: pequena espera antes de matricular na rotina — achado real (Robert: "sempre que alguem cadastra
  // ta chegando isso", mensagem de "matriculei automatico" do worker aparecendo em TODA matricula da LP).
  // Suspeita: o GS Engage pode nao estar pronto pra aceitar a matricula um instante depois de criar o lead
  // (corrida). O retry de 3x abaixo já ajuda se o GS devolver erro HTTP nessa janela, mas se ele devolver
  // "sucesso" mesmo sem indexar direito (mesma classe de comportamento já vista em outras APIs do projeto —
  // 200 que não persiste de verdade), o retry por erro HTTP não pega isso. Essa espera ANTES da 1ª tentativa
  // reduz a chance de cair bem nesse instante.
  Utilities.sleep(1500);

  var prospOk = _postToGSEngageWithRetry_(GS_BASE + '/prospections?apiKey=' + gsKey, { leadId: leadId, routineId: INBOUND_ROUTINE_ID }, headers, function(_respText, code) {
    return (code >= 200 && code < 300) ? true : null;
  }).value;
  Logger.log('GS Engage enrolled ' + leadId + (prospOk ? '' : ' (lead criado, mas prospecção/cadência falhou — verificar manualmente no GS Engage)'));
  return true;
}

// ── POST com até 3 tentativas (pausas curtas: 0ms, 400ms, 1000ms — total
// ~1,4s no pior caso, aceitável mesmo dentro do doPost síncrono que responde
// o formulário da LP). parseSuccess(bodyText, httpCode) decide se aquela
// tentativa deu certo; retorna {value, lastText, lastCode} — value é o valor
// de sucesso (ex: o leadId) ou null se as 3 tentativas falharam. Usado tanto
// pra criar o lead quanto pra prospecção — nunca lança exceção.
// 🔴 27/08: passou a devolver `lastText`/`lastCode` da ÚLTIMA tentativa (antes só devolvia `value`) — o
// fallback de telefone inválido precisa inspecionar a mensagem de erro real do GS Engage pra saber SE foi
// rejeição de formato de telefone (aí vale tentar de novo com placeholder) ou outro motivo qualquer (aí não
// vale, cai direto pra fila de falha como sempre foi).
function _postToGSEngageWithRetry_(url, payload, headers, parseSuccess) {
  var delays = [0, 400, 1000];
  var lastText = '', lastCode = 0;
  for (var i = 0; i < delays.length; i++) {
    if (delays[i] > 0) Utilities.sleep(delays[i]);
    try {
      var resp = UrlFetchApp.fetch(url, {
        method: 'post', contentType: 'application/json', headers: headers,
        payload: JSON.stringify(payload), muteHttpExceptions: true
      });
      var code = resp.getResponseCode();
      var text = resp.getContentText();
      lastText = text; lastCode = code;
      var ok = parseSuccess(text, code);
      if (ok) return { value: ok, lastText: text, lastCode: code };
      Logger.log('GS Engage tentativa ' + (i + 1) + '/3 falhou (HTTP ' + code + '): ' + text.slice(0, 200));
    } catch (eFetch) {
      Logger.log('GS Engage tentativa ' + (i + 1) + '/3 lançou exceção: ' + eFetch.message);
      lastText = String(eFetch.message || eFetch);
    }
  }
  return { value: null, lastText: lastText, lastCode: lastCode };
}

// ── Fila de reprocessamento — aba "GSEngage_Falhas" na MESMA planilha.
// Criada sozinha na primeira falha, sem setup manual. ──
function registrarFalhaGSEngage_(nome, telefone, origem, pagina, cnpj, campanha, conjunto, anuncio) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('GSEngage_Falhas');
    if (!sheet) {
      sheet = ss.insertSheet('GSEngage_Falhas');
      sheet.appendRow(['Timestamp', 'Nome', 'Telefone', 'Origem', 'Pagina', 'CNPJ', 'Campanha', 'Conjunto', 'Anuncio', 'Tentativas']);
    }
    sheet.appendRow([new Date(), nome, telefone, origem, pagina, cnpj, campanha, conjunto, anuncio, 0]);
  } catch (eReg) {
    Logger.log('ERRO ao registrar falha do GS Engage na fila: ' + eReg.message);
  }
}

// ── Reprocessa a fila — chamado por trigger de tempo (a cada 15min, ver
// instalarRetryGSEngageTrigger). Percorre de BAIXO pra CIMA (deleteRow
// desloca as linhas abaixo pra cima — de cima pra baixo pularia a linha
// seguinte por engano). Remove da fila no sucesso; desiste (loga, mas
// mantém a linha visível pra conferência manual) depois de
// GSENGAGE_MAX_TENTATIVAS — protege contra fila crescendo pra sempre com
// um lead genuinamente inválido (telefone impossível, etc). ──
var GSENGAGE_MAX_TENTATIVAS = 10;
function retryGSEngageFalhas() {
  var gsKey = PropertiesService.getScriptProperties().getProperty('GS_API_KEY');
  if (!gsKey) { Logger.log('retryGSEngageFalhas: GS_API_KEY não configurado.'); return; }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('GSEngage_Falhas');
  if (!sheet) return; // nunca teve falha nenhuma — nada a fazer

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return; // só cabeçalho

  var processados = 0, sucesso = 0, desistidos = 0;

  for (var row = lastRow; row >= 2; row--) {
    var vals = sheet.getRange(row, 1, 1, 10).getValues()[0];
    var nome = vals[1], telefone = vals[2], origem = vals[3], pagina = vals[4],
        cnpj = vals[5], campanha = vals[6], conjunto = vals[7], anuncio = vals[8];
    var tentativas = Number(vals[9]) || 0;

    if (!nome || !telefone) { sheet.deleteRow(row); continue; } // linha corrompida/vazia
    // 🔴 FIX 27/08 (achado real: entrada de 17/07 com 3944 tentativas já — o limite de 10 nunca realmente
    // parava nada, só LOGAVA "desistindo" e continuava chamando `_sendLeadToGSEngage` a cada 15min pra
    // sempre, gastando quota do Apps Script à toa num lead que já provou não vingar). Já esgotou → pula,
    // não tenta de novo (a linha continua visível na aba pra conferência manual, só para de bater na API).
    if (tentativas >= GSENGAGE_MAX_TENTATIVAS) continue;

    processados++;
    var ok = _sendLeadToGSEngage(gsKey, nome, telefone, origem, pagina, cnpj, campanha, conjunto, anuncio, { isRetry: true });
    if (ok) {
      sheet.deleteRow(row);
      sucesso++;
    } else if (tentativas + 1 >= GSENGAGE_MAX_TENTATIVAS) {
      Logger.log('GS Engage: desistindo do lead "' + nome + '" após ' + GSENGAGE_MAX_TENTATIVAS + ' tentativas — verificar manualmente na aba GSEngage_Falhas.');
      sheet.getRange(row, 10).setValue(tentativas + 1);
      desistidos++;
    } else {
      sheet.getRange(row, 10).setValue(tentativas + 1);
    }
  }

  Logger.log('retryGSEngageFalhas: ' + processados + ' processado(s), ' + sucesso + ' com sucesso, ' + desistidos + ' desistido(s) (>= ' + GSENGAGE_MAX_TENTATIVAS + ' tentativas).');
}

// ── Instala o trigger de reprocessamento — rodar 1x manualmente. ──
function instalarRetryGSEngageTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'retryGSEngageFalhas') ScriptApp.deleteTrigger(t);
  });

  ScriptApp.newTrigger('retryGSEngageFalhas')
    .timeBased()
    .everyMinutes(15)
    .create();

  Logger.log('Trigger instalado: retryGSEngageFalhas → a cada 15 minutos.');
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
