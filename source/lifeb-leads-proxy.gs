// ============================================================
// lifeb-leads-proxy.gs
// Google Apps Script — Web App anônimo (ANYONE_ANONYMOUS)
// Projeto SDR JLBV – Life B Import
// Deploy: Publicar > Implantar como app da Web > Qualquer pessoa (anônimo)
// ============================================================

const SPREADSHEET_ID = '1e9HRi1bnl3fNkE2IjNUYU4mUK7InLmgT_H8NAyfas-4';

// Tokens individuais por representante (GET e POST)
const REP_TOKENS = {
  'IRAMAR':       'd0e817db520c063b14be0b04a7e0',
  'NATANAEL':     '634cb38cdf39c5b9971e83b51f07',
  'ROBERT_TESTE': 'lifeb_teste_2026_rt',
};

// Token de leitura para telão e mobile (active_all)
const TELAO_TOKEN = '0ef82354c11e4f518d90fe5c3935b767';

// Status válidos para o campo STATUS_VENDEDOR
const STATUS_VEND_VALIDOS = [
  'Aguardando contato',
  'Em contato',
  'Em negociação',
  'Fechado',
  'Perdido',
];

// Índices de colunas (0-based)
const COL_DATA          = 0;
const COL_NOME          = 1;
const COL_WHATSAPP      = 2;
const COL_ORIGEM_BTN    = 3;
const COL_LINK_LP       = 4;
const COL_STATUS_SDR    = 5;
const COL_VENDEDOR      = 6;
const COL_DATA_ENVIO    = 7;
const COL_OBS_SDR       = 8;
const COL_SEGMENTO      = 9;
const COL_EMPRESA_ID    = 10;
const COL_EMPRESA       = 11;
const COL_CONTATO_EMP   = 12;
const COL_CNPJ          = 13;
const COL_ENDERECO      = 14;
const COL_CIDADE        = 15;
const COL_CEP           = 16;
const COL_ESTADO        = 17;
const COL_STATUS_VEND   = 18;
const COL_BOLETO        = 19;
const COL_PG_POSS       = 20;
const COL_VALOR_POT     = 21;
const COL_DATA_FECH     = 22;
const COL_DIAS_FECHAR   = 23;
const COL_VALOR_FECH    = 24;
const COL_MOTIVO_PERD   = 25;
const COL_OBS_VEND      = 26;
// AB=27 MÊS/ANO  AC=28 CAMPANHA  AD=29 CONJUNTO  AE=30 ANÚNCIO
const COL_TIMESTAMP_VEND = 31; // AF — última atualização pelo vendedor

// Campos que o painel do rep pode gravar via POST.
// TIMESTAMP_VEND NÃO está aqui — é gerenciado automaticamente pelo proxy em cada write.
// Exceção: campo 'TIMESTAMP_VEND' via single-field path é aceito EXCLUSIVAMENTE para
// operações de undo (reverter o timestamp pro valor anterior). Ver doPost abaixo.
const ALLOWED_WRITE = {
  STATUS_VENDEDOR: COL_STATUS_VEND,
  OBS_VENDEDOR:    COL_OBS_VEND,
  VALOR_POTENCIAL: COL_VALOR_POT,
  VALOR_FECHADO:   COL_VALOR_FECH,
  MOTIVO_PERDA:    COL_MOTIVO_PERD,
  DATA_FECH:       COL_DATA_FECH,
};

// ── ENTRY POINT ──────────────────────────────────────────────
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'summary';
  let result;
  try {
    switch (action) {
      case 'summary':  result = getSummary();  break;
      case 'by_rep':   result = getByRep();    break;
      case 'funnel':   result = getFunnel();   break;
      case 'active': {
        const repA = ((e.parameter||{}).rep   || '').trim().toUpperCase();
        const tokA = ((e.parameter||{}).token || '').trim();
        if (!repA || REP_TOKENS[repA] !== tokA) { result = { error: 'token inválido' }; break; }
        result = getActive(repA);
        break;
      }
      case 'rep_history': {
        const repH = ((e.parameter||{}).rep   || '').trim().toUpperCase();
        const tokH = ((e.parameter||{}).token || '').trim();
        if (!repH || REP_TOKENS[repH] !== tokH) { result = { error: 'token inválido' }; break; }
        result = getRepHistory(repH);
        break;
      }
      case 'active_all': {
        var tokT = ((e.parameter || {}).token || '').trim();
        if (tokT !== TELAO_TOKEN) { result = { error: 'token inválido' }; break; }
        result = getActiveAll();
        break;
      }
      case 'closed':   result = getClosed();   break;
      case 'chart':    result = getChart();    break;
      case 'latest':   result = getLatest();   break;
      case 'ads':      result = getAds();      break;
      default:         result = { error: 'action inválida: ' + action };
    }
  } catch (err) {
    result = { error: err.message || String(err) };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GRAVAÇÃO (chamado pelo painel do representante) ───────────
function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const token  = String(body.token  || '').trim();
    const row    = parseInt(body.row,   10);
    const rep    = String(body.rep    || '').trim().toUpperCase();
    const action = String(body.action || '').trim(); // 'update_lead' ou vazio

    // 1. Token
    if (!rep || REP_TOKENS[rep] !== token) {
      return jsonResponse({ ok: false, error: 'token inválido' });
    }

    // 2. Row
    if (isNaN(row) || row < 2) {
      return jsonResponse({ ok: false, error: 'row inválido' });
    }

    // 3. Abrir planilha e validar que o lead pertence ao rep
    const sheet   = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
    const lastRow = sheet.getLastRow();
    if (row > lastRow) {
      return jsonResponse({ ok: false, error: 'row fora do intervalo' });
    }
    const repNaPlanilha = String(sheet.getRange(row, COL_VENDEDOR + 1).getValue() || '').trim().toUpperCase();
    if (repNaPlanilha !== rep) {
      return jsonResponse({ ok: false, error: 'lead não pertence a este representante' });
    }

    // Timestamp padrão para esta requisição (epoch ms).
    // Sheets não converte número para Date automaticamente — gravamos como número mesmo.
    const now = Date.now();

    // ── update_lead: gravação atômica de múltiplos campos ─────
    // Usado por Fechado, Perdido e qualquer ação que precise gravar > 1 campo de uma vez.
    // LockService evita que dois dispositivos do mesmo rep gravem simultaneamente e se sobreponham.
    if (action === 'update_lead') {
      const updates = body.updates || {};
      const validKeys = Object.keys(updates).filter(function(k) { return ALLOWED_WRITE.hasOwnProperty(k); });
      if (validKeys.length === 0) {
        return jsonResponse({ ok: false, error: 'updates sem campos permitidos' });
      }
      for (var i = 0; i < validKeys.length; i++) {
        var k = validKeys[i];
        if (k === 'STATUS_VENDEDOR' && STATUS_VEND_VALIDOS.indexOf(String(updates[k])) < 0) {
          return jsonResponse({ ok: false, error: 'STATUS_VENDEDOR inválido: ' + updates[k] });
        }
      }
      var lock = LockService.getScriptLock();
      lock.waitLock(10000);
      try {
        for (var j = 0; j < validKeys.length; j++) {
          var key = validKeys[j];
          var val = updates[key];
          if (key === 'OBS_VENDEDOR')  val = String(val).slice(0, 1000);
          if (key === 'MOTIVO_PERDA')  val = String(val).slice(0, 500);
          if (key === 'VALOR_POTENCIAL' || key === 'VALOR_FECHADO') {
            var nv = parseFloat(String(val).replace(/[^\d,.-]/g, '').replace(',', '.'));
            if (isNaN(nv) || nv < 0) return jsonResponse({ ok: false, error: 'valor inválido em ' + key });
            val = nv;
          }
          // getRange usa 1-based — por isso +1 em todos os índices COL_*
          sheet.getRange(row, ALLOWED_WRITE[key] + 1).setValue(val);
        }
        // Timestamp: usa valor explícito se informado (undo), senão agora
        var tsWrite = now;
        if (updates.hasOwnProperty('TIMESTAMP_VEND')) {
          var explicitTs = parseInt(String(updates['TIMESTAMP_VEND']));
          if (!isNaN(explicitTs) && explicitTs >= 0) tsWrite = explicitTs;
        }
        sheet.getRange(row, COL_TIMESTAMP_VEND + 1).setValue(tsWrite);
        SpreadsheetApp.flush();
      } finally {
        lock.releaseLock();
      }
      return jsonResponse({ ok: true, ts: tsWrite });
    }

    // ── campo único: gravação simples ────────────────────────
    // Compatibilidade com todos os POSTs de status, obs e pot do painel rep.
    // LockService também aqui: rep pode ter dois abas abertas no celular.
    const campo = String(body.campo || '').trim();
    const valor = String(body.valor || '').trim();

    // ── TIMESTAMP_VEND: path exclusivo de undo ────────────────
    // Só aceito quando o cliente precisa reverter o timestamp pro valor anterior.
    // NÃO use este campo para gravações normais — o timestamp é sempre auto-gerenciado.
    if (campo === 'TIMESTAMP_VEND') {
      var tsVal = parseInt(valor);
      if (isNaN(tsVal) || tsVal < 0) return jsonResponse({ ok: false, error: 'timestamp inválido' });
      var lkTs = LockService.getScriptLock();
      lkTs.waitLock(10000);
      try {
        sheet.getRange(row, COL_TIMESTAMP_VEND + 1).setValue(tsVal);
        SpreadsheetApp.flush();
      } finally {
        lkTs.releaseLock();
      }
      return jsonResponse({ ok: true, ts: tsVal });
    }

    if (!ALLOWED_WRITE.hasOwnProperty(campo)) {
      return jsonResponse({ ok: false, error: 'campo não permitido' });
    }
    if (campo === 'STATUS_VENDEDOR' && STATUS_VEND_VALIDOS.indexOf(valor) < 0) {
      return jsonResponse({ ok: false, error: 'valor inválido: ' + valor });
    }
    if (campo === 'OBS_VENDEDOR' && valor.length > 1000) {
      return jsonResponse({ ok: false, error: 'obs muito longa (máx 1000 caracteres)' });
    }
    if (campo === 'MOTIVO_PERDA' && valor.length > 500) {
      return jsonResponse({ ok: false, error: 'motivo muito longo (máx 500 caracteres)' });
    }
    var valorEscrito = valor;
    if (campo === 'VALOR_POTENCIAL' || campo === 'VALOR_FECHADO') {
      var n = parseFloat(String(valor).replace(/[^\d,.-]/g, '').replace(',', '.'));
      if (isNaN(n) || n < 0) return jsonResponse({ ok: false, error: 'valor inválido' });
      valorEscrito = n;
    }

    var lockSingle = LockService.getScriptLock();
    lockSingle.waitLock(10000);
    try {
      sheet.getRange(row, ALLOWED_WRITE[campo] + 1).setValue(valorEscrito); // +1: colunas são 1-based no GAS
      sheet.getRange(row, COL_TIMESTAMP_VEND + 1).setValue(now);            // sempre atualiza AF com timestamp atual
      SpreadsheetApp.flush();
    } finally {
      lockSingle.releaseLock();
    }

    return jsonResponse({ ok: true, ts: now });

  } catch (err) {
    return jsonResponse({ ok: false, error: err.message || String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── HELPERS ──────────────────────────────────────────────────

/** Abre a planilha e retorna as linhas de dados (sem cabeçalho). */
function getRows() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  const data  = sheet.getDataRange().getValues();
  data.shift();
  return data;
}

/** Retorna o timestamp ISO da última modificação da planilha via DriveApp. */
function getLastModified() {
  try {
    return Utilities.formatDate(
      DriveApp.getFileById(SPREADSHEET_ID).getLastUpdated(),
      'America/Sao_Paulo',
      "yyyy-MM-dd'T'HH:mm:ss"
    );
  } catch(_) {
    return '';
  }
}

/**
 * Converte qualquer representação de data para milissegundos.
 * Suporta: Date object, número serial Excel/Sheets, ISO YYYY-MM-DD,
 *          ISO com hora YYYY-MM-DDTHH:MM, formato brasileiro DD/MM/YYYY [HH:MM[:SS]].
 * Strings ISO date-only são tratadas como data LOCAL (não UTC) para evitar shift de fuso.
 */
function _parseDateToMs(v) {
  if (!v) return 0;
  if (v instanceof Date) return isNaN(v.getTime()) ? 0 : v.getTime();
  if (typeof v === 'number') return new Date(Date.UTC(1899, 11, 30) + v * 86400000).getTime();
  var str = String(v).trim();
  // ISO date-only: YYYY-MM-DD — local midnight (sem shift UTC)
  var isoOnly = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoOnly) return new Date(+isoOnly[1], +isoOnly[2] - 1, +isoOnly[3]).getTime();
  // Formato brasileiro: DD/MM/YYYY [, HH:MM[:SS]]
  var br = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]\s*(\d{1,2}):(\d{2})(?::\d{2})?)?/);
  if (br) return new Date(+br[3], +br[2] - 1, +br[1], +(br[4]||0), +(br[5]||0)).getTime();
  // Outros formatos (ISO com hora, etc.)
  var p = new Date(str);
  return isNaN(p.getTime()) ? 0 : p.getTime();
}

/**
 * Formata uma célula de data.
 * Aceita qualquer formato (Date object, serial numérico, ISO, brasileiro).
 * Retorna string 'YYYY-MM-DD' ou '' se inválido.
 */
function fmtDate(v) {
  if (!v) return '';
  try {
    if (v instanceof Date) {
      if (isNaN(v.getTime())) return '';
      return Utilities.formatDate(v, 'America/Sao_Paulo', 'yyyy-MM-dd');
    }
    if (typeof v === 'number') {
      var d = new Date(Date.UTC(1899, 11, 30) + v * 86400000);
      return Utilities.formatDate(d, 'America/Sao_Paulo', 'yyyy-MM-dd');
    }
    var str = String(v).trim();
    if (!str) return '';
    // ISO date-only: YYYY-MM-DD — parse local para evitar shift UTC→SP
    var isoOnly = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoOnly) {
      var d = new Date(+isoOnly[1], +isoOnly[2] - 1, +isoOnly[3]);
      return Utilities.formatDate(d, 'America/Sao_Paulo', 'yyyy-MM-dd');
    }
    // Formato brasileiro: DD/MM/YYYY [, HH:MM[:SS]]
    var br = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]\s*(\d{1,2}):(\d{2})(?::\d{2})?)?/);
    if (br) {
      var d = new Date(+br[3], +br[2] - 1, +br[1], +(br[4]||0), +(br[5]||0));
      return Utilities.formatDate(d, 'America/Sao_Paulo', 'yyyy-MM-dd');
    }
    // Fallback: ISO com hora ou outro formato reconhecível
    var parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return Utilities.formatDate(parsed, 'America/Sao_Paulo', 'yyyy-MM-dd');
    }
    return '';
  } catch (_) {
    return '';
  }
}

/**
 * Formata hora de uma célula de data/hora.
 * Retorna 'HH:mm' ou '' se sem informação de hora (ex: ISO date-only).
 */
function fmtTime(v) {
  if (!v) return '';
  try {
    var d;
    if (v instanceof Date) {
      d = v;
    } else if (typeof v === 'number') {
      d = new Date(Date.UTC(1899, 11, 30) + v * 86400000);
    } else {
      var str = String(v).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return ''; // ISO date-only: sem hora
      // Formato brasileiro com hora: DD/MM/YYYY, HH:MM[:SS]
      var br = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[,\s]\s*(\d{1,2}):(\d{2})(?::\d{2})?/);
      if (br) {
        d = new Date(+br[3], +br[2] - 1, +br[1], +br[4], +br[5]);
      } else {
        d = new Date(str);
      }
    }
    if (!d || isNaN(d.getTime())) return '';
    var h = Utilities.formatDate(d, 'America/Sao_Paulo', 'HH:mm');
    return h === '00:00' ? '' : h;
  } catch (_) {
    return '';
  }
}

/** Converte valor monetário de célula para número. */
function toNum(v) {
  if (!v) return 0;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/[R$\s.]/g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/** Normaliza string: trim + lowercase para comparações seguras. */
function norm(v) {
  return String(v || '').trim();
}

/** Retorna true se o lead é de teste — exclui dos cálculos do dashboard. */
function isTesteLead(r) {
  var re = /\btestes?\b/i;
  return re.test(String(r[COL_NOME] || '')) || re.test(String(r[COL_EMPRESA] || ''));
}

// ── ACTIONS ──────────────────────────────────────────────────

/**
 * getSummary
 * Retorna totais gerais: contagens por status SDR, status vendedor, receita, pipeline, media_dias.
 */
function getSummary() {
  const rows = getRows().filter(function(r) { return !isTesteLead(r); });

  const sdr   = { qualif: 0, sem_ret: 0, em_abord: 0, ag_abord: 0, fora: 0, nao_id: 0 };
  const vend  = { ag_cont: 0, em_cont: 0, reun: 0, em_neg: 0, fechado: 0, perdido: 0, sem: 0 };
  let receita = 0;
  let pipeline = 0;
  let totalDias = 0;
  let countFechadoComDias = 0;
  let firstDate = '';
  let todayCount = 0;
  const today = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');

  rows.forEach(function(r) {
    const statusSDR  = norm(r[COL_STATUS_SDR]);
    const statusVend = norm(r[COL_STATUS_VEND]);

    if      (statusSDR === 'Qualificado')          sdr.qualif++;
    else if (statusSDR === 'Sem retorno SDR')       sdr.sem_ret++;
    else if (statusSDR === 'Em abordagem')          sdr.em_abord++;
    else if (statusSDR === 'Aguardando abordagem')  sdr.ag_abord++;
    else if (statusSDR === 'Fora do perfil')        sdr.fora++;
    else if (statusSDR === 'Não identificado')      sdr.nao_id++;

    if      (statusVend === 'Aguardando contato')  vend.ag_cont++;
    else if (statusVend === 'Em contato')          vend.em_cont++;
    else if (statusVend === 'Reunião agendada')    vend.reun++;
    else if (statusVend === 'Em negociação')       vend.em_neg++;
    else if (statusVend === 'Fechado')             vend.fechado++;
    else if (statusVend === 'Perdido')             vend.perdido++;
    else                                           vend.sem++;

    if (statusVend === 'Fechado') {
      receita += toNum(r[COL_VALOR_FECH]);
      const dias = toNum(r[COL_DIAS_FECHAR]);
      if (dias > 0) { totalDias += dias; countFechadoComDias++; }
    }

    if (statusVend !== '' && statusVend !== 'Fechado' && statusVend !== 'Perdido') {
      pipeline += toNum(r[COL_VALOR_POT]);
    }

    const d = fmtDate(r[COL_DATA]);
    if (d && (!firstDate || d < firstDate)) firstDate = d;
    if (d === today) todayCount++;
  });

  const media_dias = countFechadoComDias > 0 ? Math.round(totalDias / countFechadoComDias) : 0;

  return {
    total: rows.length,
    sdr: sdr,
    vend: vend,
    receita: receita,
    pipeline: pipeline,
    media_dias: media_dias,
    firstDate: firstDate,
    todayCount: todayCount,
    lastModified: getLastModified(),
  };
}

/**
 * getByRep
 * Retorna métricas por vendedor: total atribuído, ag_cont, em_cont, em_neg, fechados, receita.
 */
function getByRep() {
  const rows = getRows().filter(function(r) { return !isTesteLead(r); });
  const reps = {};

  rows.forEach(function(r) {
    const vendedor   = norm(r[COL_VENDEDOR]) || 'Sem vendedor';
    const statusVend = norm(r[COL_STATUS_VEND]);

    if (!reps[vendedor]) {
      reps[vendedor] = { rep: vendedor, total: 0, ag_cont: 0, em_cont: 0, reun: 0, em_neg: 0, fechado: 0, perdido: 0, receita: 0 };
    }
    const rep = reps[vendedor];
    rep.total++;

    if      (statusVend === 'Aguardando contato')  rep.ag_cont++;
    else if (statusVend === 'Em contato')          rep.em_cont++;
    else if (statusVend === 'Reunião agendada')    rep.reun++;
    else if (statusVend === 'Em negociação')       rep.em_neg++;
    else if (statusVend === 'Fechado')             { rep.fechado++; rep.receita += toNum(r[COL_VALOR_FECH]); }
    else if (statusVend === 'Perdido')             rep.perdido++;
  });

  const list = Object.values(reps).sort(function(a, b) {
    if (a.rep === 'Sem vendedor') return 1;
    if (b.rep === 'Sem vendedor') return -1;
    return b.total - a.total;
  });

  return { reps: list };
}

/**
 * getFunnel
 * Retorna contagens para montar os funis SDR e Vendedor.
 */
function getFunnel() {
  const rows = getRows().filter(function(r) { return !isTesteLead(r); });

  const sdr  = { ag_abord: 0, em_abord: 0, qualif: 0, sem_ret: 0, fora: 0, nao_id: 0 };
  const vend = { ag_cont: 0, em_cont: 0, reun: 0, em_neg: 0, fechado: 0, perdido: 0 };

  rows.forEach(function(r) {
    const statusSDR  = norm(r[COL_STATUS_SDR]);
    const statusVend = norm(r[COL_STATUS_VEND]);

    if      (statusSDR === 'Aguardando abordagem')  sdr.ag_abord++;
    else if (statusSDR === 'Em abordagem')          sdr.em_abord++;
    else if (statusSDR === 'Qualificado')           sdr.qualif++;
    else if (statusSDR === 'Sem retorno SDR')       sdr.sem_ret++;
    else if (statusSDR === 'Fora do perfil')        sdr.fora++;
    else if (statusSDR === 'Não identificado')      sdr.nao_id++;

    if      (statusVend === 'Aguardando contato')   vend.ag_cont++;
    else if (statusVend === 'Em contato')           vend.em_cont++;
    else if (statusVend === 'Reunião agendada')     vend.reun++;
    else if (statusVend === 'Em negociação')        vend.em_neg++;
    else if (statusVend === 'Fechado')              vend.fechado++;
    else if (statusVend === 'Perdido')              vend.perdido++;
  });

  return { total: rows.length, sdr: sdr, vend: vend };
}

/**
 * getActive
 * Leads ativos do representante especificado (filtro no servidor).
 * Retorna ts_vend (ISO string) para sincronização cross-device do timestamp.
 * Limite de 200 aplicado APÓS o filtro — cada rep pode ter até 200 leads ativos.
 */
function getActive(rep) {
  const rows = getRows();
  const EXCLUIDOS = ['Fechado', 'Perdido', ''];
  const result = [];

  rows.forEach(function(r, i) {
    const statusVend = norm(r[COL_STATUS_VEND]);
    if (EXCLUIDOS.indexOf(statusVend) >= 0) return;
    if (norm(r[COL_VENDEDOR]).toUpperCase() !== rep) return;

    result.push({
      row:      i + 2,
      nome:     norm(r[COL_NOME]),
      empresa:  norm(r[COL_EMPRESA]),
      cidade:   norm(r[COL_CIDADE]),
      estado:   norm(r[COL_ESTADO]),
      segmento: norm(r[COL_SEGMENTO]),
      rep:      norm(r[COL_VENDEDOR]) || '—',
      status:   statusVend,
      pot:      toNum(r[COL_VALOR_POT]),
      data:     fmtDate(r[COL_DATA]),
      obs:      norm(r[COL_OBS_VEND]),
      obs_sdr:  norm(r[COL_OBS_SDR]),
      whatsapp: norm(r[COL_WHATSAPP]),
      contato:  norm(r[COL_CONTATO_EMP]),
      cnpj:     norm(r[COL_CNPJ]),
      endereco: norm(r[COL_ENDERECO]),
      ts_vend:  Number(r[COL_TIMESTAMP_VEND]) || 0, // epoch ms — sincronização cross-device
    });
  });

  const ordem = { 'Aguardando contato': 0, 'Em contato': 1, 'Em negociação': 2 };
  result.sort(function(a, b) {
    const oa = (ordem[a.status] !== undefined) ? ordem[a.status] : 9;
    const ob = (ordem[b.status] !== undefined) ? ordem[b.status] : 9;
    if (oa !== ob) return oa - ob;
    return (a.data || '').localeCompare(b.data || '');
  });

  return { leads: result.slice(0, 200) };
}

/**
 * getRepHistory
 * Histórico (Fechados e Perdidos) do representante especificado.
 * Limite de 200 aplicado APÓS o filtro por rep.
 */
function getRepHistory(rep) {
  const rows = getRows();
  const result = [];

  rows.forEach(function(r, i) {
    const statusVend = norm(r[COL_STATUS_VEND]);
    if (statusVend !== 'Fechado' && statusVend !== 'Perdido') return;
    if (norm(r[COL_VENDEDOR]).toUpperCase() !== rep) return;

    result.push({
      row:      i + 2,
      nome:     norm(r[COL_NOME]),
      empresa:  norm(r[COL_EMPRESA]),
      cidade:   norm(r[COL_CIDADE]),
      estado:   norm(r[COL_ESTADO]),
      rep:      norm(r[COL_VENDEDOR]) || '—',
      status:   statusVend,
      pot:      toNum(r[COL_VALOR_POT]),
      valor:    toNum(r[COL_VALOR_FECH]),
      data:     fmtDate(r[COL_DATA]),
      data_f:   fmtDate(r[COL_DATA_FECH]),
      motivo:   norm(r[COL_MOTIVO_PERD]),
      whatsapp: norm(r[COL_WHATSAPP]),
    });
  });

  result.sort(function(a, b) {
    if (a.status !== b.status) return a.status === 'Fechado' ? -1 : 1;
    return (b.data_f || b.data || '').localeCompare(a.data_f || a.data || '');
  });

  return { history: result.slice(0, 200) };
}

/**
 * getActiveAll
 * Todos os leads ativos (qualquer vendedor) — sem autenticação, para uso no telão interno.
 * Não expõe dados pessoais (sem whatsapp, cnpj, endereço, obs).
 */
function getActiveAll() {
  const rows = getRows();
  const EXCLUIDOS = ['Fechado', 'Perdido', ''];
  const result = [];

  rows.forEach(function(r, i) {
    if (isTesteLead(r)) return;
    const statusVend = norm(r[COL_STATUS_VEND]);
    if (EXCLUIDOS.indexOf(statusVend) >= 0) return;
    const vendedor = norm(r[COL_VENDEDOR]);
    if (!vendedor) return;

    result.push({
      row:      i + 2,
      nome:     norm(r[COL_NOME]),
      empresa:  norm(r[COL_EMPRESA]),
      cidade:   norm(r[COL_CIDADE]),
      estado:   norm(r[COL_ESTADO]),
      segmento: norm(r[COL_SEGMENTO]),
      rep:      vendedor,
      status:   statusVend,
      pot:      toNum(r[COL_VALOR_POT]),
      data:     fmtDate(r[COL_DATA]),
    });
  });

  const ordem = { 'Aguardando contato': 0, 'Em contato': 1, 'Em negociação': 2 };
  result.sort(function(a, b) {
    const oa = (ordem[a.status] !== undefined) ? ordem[a.status] : 9;
    const ob = (ordem[b.status] !== undefined) ? ordem[b.status] : 9;
    if (oa !== ob) return oa - ob;
    return (a.data || '').localeCompare(b.data || '');
  });

  return { leads: result };
}

/**
 * getClosed
 * Leads com STATUS VENDEDOR = Fechado.
 */
function getClosed() {
  const rows = getRows().filter(function(r) { return !isTesteLead(r); });
  const result = [];

  rows.forEach(function(r) {
    const statusVend = norm(r[COL_STATUS_VEND]);
    if (statusVend !== 'Fechado') return;

    result.push({
      nome:    norm(r[COL_NOME]),
      empresa: norm(r[COL_EMPRESA]),
      cidade:  norm(r[COL_CIDADE]),
      estado:  norm(r[COL_ESTADO]),
      rep:     norm(r[COL_VENDEDOR]) || '—',
      valor:   toNum(r[COL_VALOR_FECH]),
      dias:    toNum(r[COL_DIAS_FECHAR]),
      data_f:  fmtDate(r[COL_DATA_FECH]),
    });
  });

  result.sort(function(a, b) { return (b.data_f || '').localeCompare(a.data_f || ''); });
  return { fechamentos: result.slice(0, 100) };
}

/**
 * getChart
 * Leads por dia (chave YYYY-MM-DD): total, qualificados, fechados.
 */
function getChart() {
  const rows = getRows().filter(function(r) { return !isTesteLead(r); });
  const byDay = {};

  rows.forEach(function(r) {
    const dia = fmtDate(r[COL_DATA]);
    if (!dia) return;
    const statusSDR  = norm(r[COL_STATUS_SDR]);
    const statusVend = norm(r[COL_STATUS_VEND]);

    if (!byDay[dia]) byDay[dia] = { total: 0, qualif: 0, fechado: 0 };
    byDay[dia].total++;
    if (statusSDR === 'Qualificado')  byDay[dia].qualif++;
    if (statusVend === 'Fechado')     byDay[dia].fechado++;
  });

  const labels  = Object.keys(byDay).sort();
  const total   = labels.map(function(d) { return byDay[d].total;   });
  const qualif  = labels.map(function(d) { return byDay[d].qualif;  });
  const fechado = labels.map(function(d) { return byDay[d].fechado; });

  return { labels: labels, total: total, qualif: qualif, fechado: fechado };
}

/**
 * getLatest
 * Retorna os 10 leads mais recentes (por data de entrada).
 */
function getLatest() {
  const rows = getRows().filter(function(r) { return !isTesteLead(r); });

  const withDate = rows.filter(function(r) { return r[COL_DATA]; });
  withDate.sort(function(a, b) {
    return _parseDateToMs(b[COL_DATA]) - _parseDateToMs(a[COL_DATA]);
  });

  const leads = withDate.slice(0, 10).map(function(r) {
    return {
      nome:        norm(r[COL_NOME]),
      empresa:     norm(r[COL_EMPRESA]),
      data:        fmtDate(r[COL_DATA]),
      hora:        fmtTime(r[COL_DATA]),
      status_sdr:  norm(r[COL_STATUS_SDR]),
      status_vend: norm(r[COL_STATUS_VEND]),
    };
  });

  return { leads: leads };
}

/**
 * getAds
 * Lê a aba "ADS" e retorna o total acumulado de investimento.
 */
function getAds() {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('ADS');
    if (!sheet) return { investimento: 0 };

    const data = sheet.getDataRange().getValues();
    data.shift();

    let total = 0;
    let ultimaData = null;
    data.forEach(function(row) {
      const valor = toNum(row[2]);
      if (valor > 0) {
        total += valor;
        if (row[0]) ultimaData = row[0];
      }
    });

    let dataStr = null;
    if (ultimaData) {
      const d = ultimaData instanceof Date ? ultimaData : new Date(ultimaData);
      if (!isNaN(d.getTime())) {
        dataStr = Utilities.formatDate(d, 'America/Sao_Paulo', 'dd/MM/yyyy');
      }
    }

    return { investimento: total, ultimaData: dataStr };
  } catch(_) {
    return { investimento: 0 };
  }
}
