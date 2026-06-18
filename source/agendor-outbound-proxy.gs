// ============================================================
// PROXY — DASH OUTBOUND AGENDOR
// Salvar em: Google Apps Script (novo projeto)
// Deploy: Web App → Execute as: Me → Anyone can access
//
// Script Properties obrigatórias (Project Settings → Properties):
//   AGENDOR_TOKEN   → token do Agendor (Menu → Integrações → Token)
// ============================================================

var AGENDOR_BASE = 'https://api.agendor.com.br/v3';
var STALE_DAYS   = 7;   // dias sem toque = deal "parado"
var CACHE_TTL    = 120; // segundos de cache por período

var STAGES = {
  '3771722': { name: 'Conexão',     color: 'blue',   seq: 1 },
  '3771723': { name: 'Diagnóstico', color: 'purple', seq: 2 },
  '3771724': { name: 'Solução',     color: 'orange', seq: 3 },
  '3771725': { name: 'Negociação',  color: 'green',  seq: 4 }
};

var REPS = {
  '976406': 'Iramar',
  '977487': 'Natanael',
  '977488': 'Janeth',
  '977499': 'Sâmilla',
  '977506': 'Washington'
};

// ── ENTRY POINT ──────────────────────────────────────────────
function doGet(e) {
  try {
    var props   = PropertiesService.getScriptProperties();
    var token   = props.getProperty('AGENDOR_TOKEN');
    var params  = e ? (e.parameter || {}) : {};

    if (!token) return err('AGENDOR_TOKEN não configurado nas Script Properties.');

    // Rota de debug — retorna JSON bruto do Agendor para inspecionar campos
    if (params.action === 'debug') {
      var raw = UrlFetchApp.fetch(AGENDOR_BASE + '/deals?status=ongoing&per_page=2', { headers: { 'Authorization': 'Token ' + token }, muteHttpExceptions: true });
      return jsonOut(raw.getContentText());
    }

    // Rota debug2 — mostra contagens, IDs e dedup para diagnosticar pipeline zerado
    if (params.action === 'debug2') {
      var lookbackD = new Date(); lookbackD.setDate(lookbackD.getDate() - 180);
      var lbs = fmtDate(lookbackD);
      var authH = { 'Authorization': 'Token ' + token };
      var rr = UrlFetchApp.fetchAll([
        { url: AGENDOR_BASE + '/deals?status=ongoing&per_page=100', headers: authH, muteHttpExceptions: true },
        { url: AGENDOR_BASE + '/deals?status=won&per_page=100&createdAtGt=' + lbs, headers: authH, muteHttpExceptions: true },
        { url: AGENDOR_BASE + '/deals?status=lost&per_page=100&createdAtGt=' + lbs, headers: authH, muteHttpExceptions: true }
      ]);
      var ongoingD  = (safeJson(rr[0]).data || []);
      var wonD      = (safeJson(rr[1]).data || []);
      var lostD     = (safeJson(rr[2]).data || []);
      var closedD   = {};
      wonD.forEach(function(d)  { closedD[d.id] = 'won';  });
      lostD.forEach(function(d) { closedD[d.id] = 'lost'; });
      var removedD  = ongoingD.filter(function(d) { return !!closedD[d.id]; });
      var keptD     = ongoingD.filter(function(d) { return !closedD[d.id]; });
      return jsonOut(JSON.stringify({
        ongoingCount: ongoingD.length,
        wonCount:     wonD.length,
        lostCount:    lostD.length,
        ongoingIds:   ongoingD.slice(0,10).map(function(d){ return {id:d.id, title:d.title, wonAt:d.wonAt, lostAt:d.lostAt}; }),
        wonIds:       wonD.slice(0,10).map(function(d){ return {id:d.id, title:d.title}; }),
        lostIds:      lostD.slice(0,10).map(function(d){ return {id:d.id, title:d.title}; }),
        removedFromOngoing: removedD.map(function(d){ return {id:d.id, title:d.title, reason: closedD[d.id]}; }),
        keptOngoing:  keptD.map(function(d){ return {id:d.id, title:d.title, value:d.value}; }),
        lookbackStr:  lbs
      }));
    }

    // Rota debug3 — mostra leadOrigin das pessoas (não vem embutido no deal; busca /people separado)
    if (params.action === 'debug3') {
      var authH3 = { 'Authorization': 'Token ' + token };
      var pr3 = UrlFetchApp.fetch(AGENDOR_BASE + '/people?per_page=20', { headers: authH3, muteHttpExceptions: true });
      var people3 = (safeJson(pr3).data || []);
      var sample = people3.map(function(p) {
        return { id: p.id, name: p.name, leadOrigin: p.leadOrigin || null };
      });
      var origCounts = { inbound: 0, outbound: 0, null_or_empty: 0 };
      sample.forEach(function(s) {
        var o = ((s.leadOrigin && s.leadOrigin.name) || '').toUpperCase();
        if (o === 'INBOUND')  origCounts.inbound++;
        else if (o === 'OUTBOUND') origCounts.outbound++;
        else origCounts.null_or_empty++;
      });
      return jsonOut(JSON.stringify({ sample: sample, origCounts: origCounts }));
    }

    // Filtro de origem: 'outbound' (padrão) ou 'inbound' (para o dash inbound)
    var originFilter = (params.origin || 'outbound').toLowerCase();

    var periodType = params.period || 'month';
    var fromParam  = params.from   || null;
    var toParam    = params.to     || null;
    var period     = getPeriodDates(periodType, fromParam, toParam);

    // Cache por período + origem (bust=1 pula o cache)
    var cache    = CacheService.getScriptCache();
    var cacheKey = 'agendor_v3_' + originFilter + '_' + periodType + '_' + (fromParam||'') + '_' + (toParam||'');
    var forceBust = params.bust === '1';
    if (!forceBust) {
      var cached = cache.get(cacheKey);
      if (cached) return jsonOut(cached);
    }

    var authHdr = { 'Authorization': 'Token ' + token };

    // ── 1. Lookback para won/lost (3× o período mínimo de 90 dias) ──
    var lookback = new Date();
    lookback.setDate(lookback.getDate() - Math.max(180,
      Math.ceil((new Date(period.to) - new Date(period.from)) / 86400000) * 3));
    var lookbackStr = fmtDate(lookback);

    // ── 2. Chamadas paralelas: ongoing + won + lost + people (leadOrigin) ──
    // leadOrigin fica na PESSOA, não no deal embutido — busca /people em paralelo.
    var firstReqs = [
      { url: AGENDOR_BASE + '/deals?status=ongoing&per_page=100',                               headers: authHdr, muteHttpExceptions: true },
      { url: AGENDOR_BASE + '/deals?status=won&per_page=100&createdAtGt='   + lookbackStr,      headers: authHdr, muteHttpExceptions: true },
      { url: AGENDOR_BASE + '/deals?status=lost&per_page=100&createdAtGt='  + lookbackStr,      headers: authHdr, muteHttpExceptions: true },
      { url: AGENDOR_BASE + '/people?per_page=100',                                             headers: authHdr, muteHttpExceptions: true }
    ];
    var firstRes = UrlFetchApp.fetchAll(firstReqs);

    var ongoingRaw = safeJson(firstRes[0]);
    var wonRaw     = safeJson(firstRes[1]);
    var lostRaw    = safeJson(firstRes[2]);
    var peopleRaw  = safeJson(firstRes[3]);

    var ongoing = ongoingRaw.data || [];
    var won     = wonRaw.data     || [];
    var lost    = lostRaw.data    || [];
    var people  = peopleRaw.data  || [];

    // ── 2b. Paginar people se houver mais de 100 (atualmente ~79, mas defensivo) ──
    var peopleMeta  = peopleRaw.meta || {};
    var peopleTotPg = peopleMeta.pages || 1;
    if (peopleTotPg > 1) {
      var ppReqs = [];
      for (var pp = 2; pp <= Math.min(peopleTotPg, 5); pp++) {
        ppReqs.push({ url: AGENDOR_BASE + '/people?per_page=100&page=' + pp, headers: authHdr, muteHttpExceptions: true });
      }
      UrlFetchApp.fetchAll(ppReqs).forEach(function(r) { people = people.concat(safeJson(r).data || []); });
    }

    // ── 2c. Mapa personId → origem (INBOUND/OUTBOUND/null) ──────────────
    var originMap = buildOriginMap(people);

    // ── 3. Paginar ongoing se necessário ─────────────────────────────
    var ongoingMeta = ongoingRaw.meta || {};
    var totalPages  = ongoingMeta.pages || 1;
    if (totalPages > 1) {
      var pageReqs = [];
      for (var p = 2; p <= Math.min(totalPages, 10); p++) {
        pageReqs.push({ url: AGENDOR_BASE + '/deals?status=ongoing&per_page=100&page=' + p, headers: authHdr, muteHttpExceptions: true });
      }
      var pageRes = UrlFetchApp.fetchAll(pageReqs);
      pageRes.forEach(function(r) {
        var d = safeJson(r);
        ongoing = ongoing.concat(d.data || []);
      });
    }

    // ── 4. Paginar won/lost se necessário ────────────────────────────
    var wonPages  = (wonRaw.meta  || {}).pages || 1;
    var lostPages = (lostRaw.meta || {}).pages || 1;
    var extraReqs = [];
    for (var w = 2; w <= Math.min(wonPages, 5); w++) {
      extraReqs.push({ url: AGENDOR_BASE + '/deals?status=won&per_page=100&createdAtGt='  + lookbackStr + '&page=' + w, headers: authHdr, muteHttpExceptions: true });
    }
    for (var l = 2; l <= Math.min(lostPages, 5); l++) {
      extraReqs.push({ url: AGENDOR_BASE + '/deals?status=lost&per_page=100&createdAtGt=' + lookbackStr + '&page=' + l, headers: authHdr, muteHttpExceptions: true });
    }
    if (extraReqs.length > 0) {
      var extraRes = UrlFetchApp.fetchAll(extraReqs);
      var wi = 0;
      for (var w2 = 2; w2 <= Math.min(wonPages, 5); w2++) { won  = won.concat((safeJson(extraRes[wi++]).data) || []); }
      for (var l2 = 2; l2 <= Math.min(lostPages, 5); l2++) { lost = lost.concat((safeJson(extraRes[wi++]).data) || []); }
    }

    // ── 5. Limpar ongoing: remover deals que já têm wonAt ou lostAt preenchido
    //    (o Agendor retorna alguns deals fechados na query status=ongoing)
    ongoing = ongoing.filter(function(d) { return !d.wonAt && !d.lostAt; });

    // ── 5b. Filtrar por origem (INBOUND ou OUTBOUND) usando mapa de pessoas ──
    ongoing = ongoing.filter(function(d) { return filterByOrigin(d, originMap, originFilter); });
    won     = won.filter(function(d)     { return filterByOrigin(d, originMap, originFilter); });
    lost    = lost.filter(function(d)    { return filterByOrigin(d, originMap, originFilter); });

    // ── 6. Filtrar won/lost pelo período selecionado ──────────────────
    var periodFrom = new Date(period.from + 'T00:00:00');
    var periodTo   = new Date(period.to   + 'T23:59:59');

    var periodWon  = won.filter(function(d)  { return inPeriodWon(d,  periodFrom, periodTo); });
    var periodLost = lost.filter(function(d) { return inPeriodLost(d, periodFrom, periodTo); });

    // ── 6b. Contar leads distribuídos no período (criados em createdAt) ──
    var seenLead = {};
    var leadsNoPeriodo = 0;
    var repLeadsMap = {};
    ongoing.concat(won).concat(lost).forEach(function(d) {
      if (!seenLead[d.id] && d.createdAt) {
        seenLead[d.id] = true;
        var c = new Date(d.createdAt);
        if (c >= periodFrom && c <= periodTo) {
          leadsNoPeriodo++;
          var rid = String((d.owner || {}).id || '');
          if (rid) repLeadsMap[rid] = (repLeadsMap[rid] || 0) + 1;
        }
      }
    });

    // ── 7. Agregar ────────────────────────────────────────────────────
    var result = aggregate(ongoing, periodWon, periodLost, period);
    result.kpis.leadsNoPeriodo = leadsNoPeriodo;
    // Conversão correta: ganhos ÷ leads distribuídos (não ganhos ÷ fechados)
    result.kpis.conversao = leadsNoPeriodo > 0 ? Math.round((result.kpis.ganhoCont / leadsNoPeriodo) * 1000) / 10 : 0;
    // Conversão por rep: ganhos_rep ÷ leads_do_rep_no_período
    result.reps.forEach(function(r) {
      var rl = repLeadsMap[String(r.id)] || 0;
      r.leadsNoPeriodo = rl;
      r.conversao = rl > 0 ? Math.round((r.ganhoCont / rl) * 1000) / 10 : null;
    });
    result.ok        = true;
    result.updatedAt = new Date().toISOString();
    result.period    = period;

    var out = JSON.stringify(result);
    cache.put(cacheKey, out, CACHE_TTL);
    return jsonOut(out);

  } catch(ex) {
    return err(ex.message + ' | ' + ex.stack);
  }
}

// ── AGREGA TODOS OS DADOS ─────────────────────────────────────
function aggregate(ongoing, won, lost, period) {
  var now       = new Date();
  var staleCut  = new Date(now.getTime() - STALE_DAYS * 86400000);

  // Rep stats map
  var repMap = {};
  Object.keys(REPS).forEach(function(id) {
    repMap[id] = {
      id: parseInt(id), name: REPS[id],
      ativos: 0, pipeline: 0, stale: 0,
      ganhoValor: 0, ganhoCont: 0, perdidoCont: 0,
      dealsByStage: { '3771722': 0, '3771723': 0, '3771724': 0, '3771725': 0 }
    };
  });

  // Stage stats map
  var stageMap = {};
  Object.keys(STAGES).forEach(function(sid) {
    stageMap[sid] = { stageId: parseInt(sid), name: STAGES[sid].name, color: STAGES[sid].color, seq: STAGES[sid].seq, count: 0, value: 0 };
  });

  var allDeals     = [];
  var pipelineTotal = 0;

  // ── Ongoing ──
  ongoing.forEach(function(d) {
    var rid    = String((d.owner || {}).id || '');
    var sid    = String((d.dealStage || {}).id || '');
    var val    = parseFloat(d.value) || 0;
    var updAt  = d.updatedAt ? new Date(d.updatedAt) : null;
    var isStale = updAt && updAt < staleCut;

    pipelineTotal += val;

    if (stageMap[sid]) { stageMap[sid].count++; stageMap[sid].value += val; }

    if (repMap[rid]) {
      repMap[rid].ativos++;
      repMap[rid].pipeline += val;
      if (isStale) repMap[rid].stale++;
      if (repMap[rid].dealsByStage[sid] !== undefined) repMap[rid].dealsByStage[sid]++;
    }

    allDeals.push({
      id:         d.id,
      title:      d.title || '(sem título)',
      value:      val,
      stage:      (d.dealStage || {}).name || null,
      stageId:    sid,
      stageSeq:   stageMap[sid] ? stageMap[sid].seq : 99,
      stageColor: stageMap[sid] ? stageMap[sid].color : 'muted',
      repId:      (d.owner || {}).id   || null,
      rep:        (d.owner || {}).name || null,
      createdAt:  (d.createdAt  || '').substring(0, 10),
      updatedAt:  (d.updatedAt  || '').substring(0, 10),
      stale:      !!isStale
    });
  });

  // ── Won ──
  var ganhoValor = 0, ganhoCont = 0, totalPrazo = 0, prazoCount = 0;
  var recentWon  = [];

  won.forEach(function(d) {
    var rid = String((d.owner || {}).id || '');
    var val = parseFloat(d.value) || 0;
    ganhoValor += val; ganhoCont++;

    if (d.createdAt && d.wonAt) {
      var days = Math.round((new Date(d.wonAt) - new Date(d.createdAt)) / 86400000);
      if (days >= 0) { totalPrazo += days; prazoCount++; }
    }
    if (repMap[rid]) { repMap[rid].ganhoValor += val; repMap[rid].ganhoCont++; }

    recentWon.push({
      id:       d.id,
      title:    d.title || '(sem título)',
      value:    val,
      repId:    (d.owner || {}).id   || null,
      rep:      (d.owner || {}).name || null,
      closedAt: (d.wonAt || '').substring(0, 10)
    });
  });

  // ── Lost ──
  var perdidoCont = 0;
  var recentLost  = [];

  lost.forEach(function(d) {
    var rid = String((d.owner || {}).id || '');
    perdidoCont++;
    if (repMap[rid]) repMap[rid].perdidoCont++;

    recentLost.push({
      id:       d.id,
      title:    d.title || '(sem título)',
      value:    parseFloat(d.value) || 0,
      repId:    (d.owner || {}).id   || null,
      rep:      (d.owner || {}).name || null,
      closedAt: (d.lostAt || '').substring(0, 10)
    });
  });

  // Ordenar por data desc
  recentWon.sort(function(a,b)  { return b.closedAt.localeCompare(a.closedAt); });
  recentLost.sort(function(a,b) { return b.closedAt.localeCompare(a.closedAt); });
  allDeals.sort(function(a,b)   { return (a.stageSeq - b.stageSeq) || (b.value - a.value); });

  // KPIs
  var convBase = ganhoCont + perdidoCont;
  var conversao   = convBase > 0 ? Math.round((ganhoCont / convBase) * 1000) / 10 : 0;
  var ticketMedio = ganhoCont  > 0 ? Math.round(ganhoValor / ganhoCont) : 0;
  var prazoMedio  = prazoCount > 0 ? Math.round(totalPrazo / prazoCount) : 0;
  var totalStale  = ongoing.filter(function(d) {
    return d.updatedAt && new Date(d.updatedAt) < staleCut;
  }).length;

  // Reps array com conversão
  var repsArr = Object.values(repMap).map(function(r) {
    var tot = r.ganhoCont + r.perdidoCont;
    r.conversao   = tot > 0 ? Math.round((r.ganhoCont / tot) * 1000) / 10 : null;
    r.ticketMedio = r.ganhoCont > 0 ? Math.round(r.ganhoValor / r.ganhoCont) : 0;
    return r;
  }).sort(function(a,b) { return (b.ganhoValor - a.ganhoValor) || (b.ativos - a.ativos); });

  // Funil com drop rate entre etapas
  var funnelArr = Object.keys(stageMap).map(function(k) { return stageMap[k]; })
    .sort(function(a,b) { return a.seq - b.seq; });

  funnelArr.forEach(function(s, i) {
    if (i > 0 && funnelArr[i-1].count > 0) {
      s.dropFrom = Math.round((1 - s.count / funnelArr[i-1].count) * 100);
    } else {
      s.dropFrom = null;
    }
  });

  return {
    kpis: {
      ativos: ongoing.length, pipelineTotal: pipelineTotal,
      ganhoValor: ganhoValor, ganhoCont: ganhoCont, perdidoCont: perdidoCont,
      ticketMedio: ticketMedio, conversao: conversao, prazoMedio: prazoMedio,
      staleTotal: totalStale
    },
    funnel:     funnelArr,
    reps:       repsArr,
    deals:      allDeals,
    recentWon:  recentWon.slice(0, 25),
    recentLost: recentLost.slice(0, 25)
  };
}

// ── PERÍODO ───────────────────────────────────────────────────
function getPeriodDates(type, from, to) {
  var tz    = 'America/Sao_Paulo';
  var now   = new Date();
  var today = fmtDate(now);
  var label, fromDate, toDate;

  if (type === 'week') {
    var dow  = now.getDay() || 7;
    var mon  = new Date(now); mon.setDate(now.getDate() - dow + 1);
    fromDate = fmtDate(mon); toDate = today; label = 'Esta semana';
  } else if (type === 'month') {
    fromDate = today.substring(0,7) + '-01'; toDate = today; label = 'Este mês';
  } else if (type === 'prev_month') {
    var pm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    var ld = new Date(now.getFullYear(), now.getMonth(), 0);
    fromDate = fmtDate(pm); toDate = fmtDate(ld); label = 'Mês anterior';
  } else if (type === '30d') {
    var d30 = new Date(now); d30.setDate(d30.getDate() - 30);
    fromDate = fmtDate(d30); toDate = today; label = 'Últimos 30 dias';
  } else if (type === '90d') {
    var d90 = new Date(now); d90.setDate(d90.getDate() - 90);
    fromDate = fmtDate(d90); toDate = today; label = 'Últimos 90 dias';
  } else if (type === 'custom' && from && to) {
    fromDate = from; toDate = to; label = fmtDisplay(from) + ' → ' + fmtDisplay(to);
  } else {
    fromDate = today.substring(0,7) + '-01'; toDate = today; label = 'Este mês'; type = 'month';
  }
  return { type: type, from: fromDate, to: toDate, label: label };
}

// ── HELPERS ──────────────────────────────────────────────────

// Constrói mapa personId (string) → 'INBOUND' | 'OUTBOUND' | ''
// leadOrigin no Agendor é objeto {id, name} — ex: {id:1, name:"OUTBOUND"}
function buildOriginMap(people) {
  var map = {};
  (people || []).forEach(function(p) {
    if (p && p.id) {
      var o = (p.leadOrigin && p.leadOrigin.name) ? p.leadOrigin.name.toUpperCase() : '';
      map[String(p.id)] = o;
    }
  });
  return map;
}

// Retorna true se o deal pertence ao targetOrigin ('inbound' ou 'outbound').
// Deals sem pessoa ou sem origem no mapa: incluídos apenas no outbound (conservador).
function filterByOrigin(d, originMap, targetOrigin) {
  var pid = (d.person && d.person.id) ? String(d.person.id) : '';
  if (!pid) return targetOrigin === 'outbound';
  var origin = originMap[pid] || '';
  if (!origin) return targetOrigin === 'outbound'; // sem carimbo = outbound antigo
  return origin === targetOrigin.toUpperCase();
}

function inPeriodWon(deal, from, to) {
  if (!deal.wonAt) return false;
  var d = new Date(deal.wonAt);
  return d >= from && d <= to;
}

function inPeriodLost(deal, from, to) {
  if (!deal.lostAt) return false;
  var d = new Date(deal.lostAt);
  return d >= from && d <= to;
}

function fmtDate(d) {
  var y = d.getFullYear();
  var m = String(d.getMonth()+1).padStart(2,'0');
  var day = String(d.getDate()).padStart(2,'0');
  return y + '-' + m + '-' + day;
}

function fmtDisplay(iso) {
  if (!iso) return '';
  var p = iso.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}

function safeJson(response) {
  try { return JSON.parse(response.getContentText()); } catch(e) { return {}; }
}

function jsonOut(str) {
  return ContentService.createTextOutput(str).setMimeType(ContentService.MimeType.JSON);
}

function err(msg) {
  return jsonOut(JSON.stringify({ ok: false, error: msg }));
}
