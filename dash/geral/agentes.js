/* ============================================================
 * Agentes (11/11/2026): a Ana (SDR virtual de WhatsApp) dentro do Dash Geral.
 * Compartilhado pelo celular (dash/geral/index.html) e pelo telão (dash/geral/telao/index.html), como o sdr2.js.
 *
 *  1) Aba SDR, agente "Ana": cartões, gráfico, funil e blocos no mesmo estilo do Felipe (sdr2.js chama sdrHtml()).
 *  2) Aba Agentes, "Ana": painel de saúde e CUSTO (initSaude()).
 *
 * Fontes (só leitura):
 *  - GET <worker>/ana-painel?dias=N  (CORS aberto, N até 60): contadores por dia, custo por dia, conversas agora.
 *  - Negócios do funil "Ana SDR IA" (919856) na tabela dash_geral_deals (mesma ponte do SDR), para o funil por etapa e as listas com link do Agendor.
 *
 * Regras:
 *  - Contadores novos (iniciados, qualificados por turno, dispensados, intervenções, encaminhados...) só existem desde NOVOS_DESDE (11/11):
 *    antes disso é "sem dados ainda", nunca zero inventado; a cobertura aparece escrita; a seta de comparação só aparece com o período
 *    anterior completo.
 *  - A Ana atende conversas que chegam por WhatsApp (lado Inbound do Dash). Com a barra do topo em Outbound não há números dela.
 *  - Datas dd/mm, fuso de Brasília, sem travessão.
 * ============================================================ */
(function (w) {
  'use strict';

  // ---------- Configuração (mexer só aqui) ----------
  var COTACAO_BRL = 5.5;                 // R$ por US$ (estimativa fixa; os valores em reais são sempre rotulados como estimativa)
  var NOVOS_DESDE = '2026-11-11';        // os contadores novos da Ana só existem a partir deste dia
  var CFG = {
    cotacao: COTACAO_BRL,
    novosDesde: NOVOS_DESDE,
    worker: 'https://gs-agendor-worker.robert131196.workers.dev',
    funil: '919856',                      // funil "Ana SDR IA" no Agendor
    diasApi: 60,                          // a rota guarda até 60 dias
    urlNegocio: 'https://web.agendor.com.br/sistema/negocios/historico.php?id=',
    refreshMs: 5 * 60 * 1000,
    atrasoMin: 30,                        // dado da rota mais velho que isso = "atrasado"
    etapas: ['Novo lead', 'Em conversa', 'Qualificado', 'Repassado', 'Sem resposta', 'Encerrado'],
    corEtapa: { 'Novo lead': '#b09bd6', 'Em conversa': '#9260c8', 'Qualificado': '#1baf7a', 'Repassado': '#0e9aa0', 'Sem resposta': '#b8b3c8', 'Encerrado': '#dc2626' },
    modelos: [
      { k: 'claude-sonnet', nome: 'Claude Sonnet 5.5', cor: '#704B9B' },
      { k: 'claude-haiku', nome: 'Claude Haiku 5.5', cor: '#0e9aa0' },
      { k: 'openrouter-reserva', nome: 'Reserva (OpenRouter)', cor: '#b8b3c8' }
    ],
    corIni: '#704B9B', corQual: '#1baf7a', corDesp: '#dc2626', corCusto: '#E92085'
  };
  var C_GANHO = '#1baf7a', C_PERDA = '#dc2626', C_CINZA = '#b8b3c8';
  var ESTAGIOS_ROTULO = {
    perguntou_faturamento: 'Perguntou o faturamento', perguntou_segmento: 'Perguntou o segmento', perguntou_cidade: 'Perguntou a cidade',
    aguardando_humano: 'Aguardando uma pessoa', novo: 'Conversa nova', qualificado: 'Qualificado', repassado: 'Repassado ao Felipe',
    com_humano: 'Com a equipe', pausada: 'Pausada'
  };

  // ---------- Estado ----------
  var S = { ana: null, anaErr: null, anaLoading: false, anaTs: 0, deals: null, dealsErr: null, dealsLoading: false, gran: '',
            bridge: null, key: null, cbs: [], inited: false, timer: null };
  var H = { root: null, mode: 'm', cfg: null, w: 'p', inited: false };

  // ---------- Utilidades ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dm(iso) { return iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : 'n/d'; }
  function dmy(iso) { return iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(2, 4) : 'n/d'; }
  function num(n) { return Math.round(n).toLocaleString('pt-BR'); }
  function compacto(n) { n = Number(n) || 0; return n >= 1e6 ? dec1(n / 1e6) + ' mi' : (n >= 1e4 ? dec1(n / 1e3) + ' mil' : num(n)); }
  function dec1(n) { return (Math.round(n * 10) / 10).toString().replace('.', ','); }
  function pct(a, b) { return b > 0 ? (Math.round(a / b * 1000) / 10).toString().replace('.', ',') + '%' : 'n/d'; }
  function dUTC(iso) { var p = iso.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function isoOf(ms) { var d = new Date(ms); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function addDays(iso, n) { return isoOf(dUTC(iso) + n * 86400000); }
  function diffDays(a, b) { return Math.round((dUTC(b) - dUTC(a)) / 86400000); }
  function mondayOf(iso) { var d = new Date(dUTC(iso)); var dow = d.getUTCDay() || 7; return addDays(iso, 1 - dow); }
  function hojeBRT() { return isoOf(Date.now() - 3 * 3600000); }
  function nomeMes(m) { var n = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']; return n[+m.slice(5, 7) - 1] + '/' + m.slice(2, 4); }
  function dataBRT(s) {
    if (!s) return null;
    if (/T00:00:00(\.000)?Z?$/.test(s)) return s.slice(0, 10);
    var t = Date.parse(s); if (isNaN(t)) return null;
    return isoOf(t - 3 * 3600000);
  }
  function instBRT(ms) { // "dd/mm HH:MM" no fuso de Brasília
    if (!isFinite(ms)) return 'n/d';
    var b = new Date(ms - 3 * 3600000);
    return pad(b.getUTCDate()) + '/' + pad(b.getUTCMonth() + 1) + ' ' + pad(b.getUTCHours()) + ':' + pad(b.getUTCMinutes());
  }
  function semAcento(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
  function usd(n) { if (n == null || !isFinite(n)) return 'n/d'; var a = Math.abs(n); return 'US$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: a >= 1 ? 2 : 4, maximumFractionDigits: a >= 1 ? 2 : 4 }); }
  function brl(n) { if (n == null || !isFinite(n)) return 'n/d'; var a = Math.abs(n); return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: a >= 1 ? 2 : 4, maximumFractionDigits: a >= 1 ? 2 : 4 }); }
  function brlDe(u) { return u == null ? null : u * CFG.cotacao; }
  function rotuloEstagio(k) {
    if (ESTAGIOS_ROTULO[k]) return ESTAGIOS_ROTULO[k];
    var t = String(k).replace(/[_\-]+/g, ' ').trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Sem etapa';
  }
  // mesmo critério do Dash (prevRangeOf): período que começa no dia 1 compara com os MESMOS dias do mês anterior; os demais, com a janela anterior de igual tamanho
  function periodoAnterior(from, to) {
    if (from <= '2020-01-02') return null;
    if (from.slice(8, 10) === '01') {
      var y = +from.slice(0, 4), m = +from.slice(5, 7);
      var py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1;
      var ultimo = new Date(Date.UTC(y, m - 1, 0)).getUTCDate();
      var dia = Math.min(+to.slice(8, 10), ultimo);
      return { from: py + '-' + pad(pm) + '-01', to: py + '-' + pad(pm) + '-' + pad(dia) };
    }
    var n = diffDays(from, to) + 1, pt = addDays(from, -1);
    return { from: addDays(pt, -(n - 1)), to: pt };
  }

  // ---------- Núcleo puro (testável) ----------
  function temDado(d) { for (var k in d) if (k !== 'dia' && Object.prototype.hasOwnProperty.call(d, k)) return true; return false; }
  // Cobertura de um período: dias que a rota cobre dentro dele, dias com registro e dias em que os contadores novos já existem.
  function janela(ana, from, to, hoje) {
    hoje = hoje || hojeBRT();
    var dias = (ana && ana.dias) || [], primeiro = dias.length ? dias[0].dia : hoje;
    var ini = from > primeiro ? from : primeiro, fim = to < hoje ? to : hoje;
    var r = { ini: ini, fim: fim, n: 0, comDado: 0, novos: 0, recortado: from < primeiro, ds: [], de: from, ate: to };
    if (fim < ini) return r;
    r.n = diffDays(ini, fim) + 1;
    // dias com contador novo = dias a partir de 11/11 que têm registro (dia só com {dia} = ainda sem dado, nunca vira zero)
    dias.forEach(function (d) { if (d.dia >= ini && d.dia <= fim) { r.ds.push(d); if (temDado(d)) { r.comDado++; if (d.dia >= NOVOS_DESDE) r.novos++; } } });
    return r;
  }
  function numOuZero(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  // fam 'novo' = contador que só existe desde 11/11; 'antigo' = já existia antes. Devolve null quando não há dado (nunca zero inventado).
  function soma(j, campo, fam) {
    if (fam === 'novo' ? j.novos === 0 : j.comDado === 0) return null;
    var s = 0; j.ds.forEach(function (d) { if (fam === 'novo' && d.dia < NOVOS_DESDE) return; s += numOuZero(d[campo]); });
    return s;
  }
  function somaTodos(j, campos, fam) { // soma vários campos; null só se nenhum tiver dado
    var v = soma(j, campos[0], fam); if (v == null) return null;
    for (var i = 1; i < campos.length; i++) v += soma(j, campos[i], fam) || 0;
    return v;
  }
  function periodoCompleto(j, per, fam) { // a seta só aparece quando o período anterior está inteiro coberto
    if (!j || j.recortado) return false;
    if (j.n !== diffDays(per.from, per.to) + 1) return false;
    return fam === 'novo' ? j.novos === j.n : j.comDado === j.n;
  }
  // período efetivo: o fim nunca passa de hoje (mês corrente termina hoje, não no dia 30)
  function periodoEf(per) { var hoje = hojeBRT(); return { from: per.from, to: per.to > hoje ? hoje : per.to, label: per.label }; }

  function normEtapa(nome) {
    var k = semAcento(nome);
    for (var i = 0; i < CFG.etapas.length; i++) if (semAcento(CFG.etapas[i]) === k) return CFG.etapas[i];
    return nome || 'Sem etapa';
  }
  function prepDeals(rows) {
    var out = [];
    (rows || []).forEach(function (d) {
      if (String(d.funnel_id) !== CFG.funil) return;
      var e = { id: d.id, titulo: d.title || ('Negócio ' + d.id), etapa: normEtapa(d.stage_name), status: d.status, criada: dataBRT(d.created_at), origem: d.origem_especial || d.origin || '' };
      var fim = d.data_real_evento ? String(d.data_real_evento).slice(0, 10) : dataBRT(d.end_time || d.closed_at || d.lost_at);
      e.fim = fim || null;                  // data explícita de fechamento (pode não existir)
      e.data = fim || e.criada;             // data usada para pôr o negócio num período
      if (e.fim && e.criada) e.dias = Math.max(0, diffDays(e.criada, e.fim));
      out.push(e);
    });
    return out;
  }
  function ehQualificado(d) { return d.etapa === 'Qualificado' || d.etapa === 'Repassado' || d.status === 'won'; }
  function ehDispensado(d) { return d.etapa === 'Encerrado' || d.status === 'lost'; }
  function noPer(iso, from, to) { return !!iso && iso >= from && iso <= to; }

  // Negócios do funil por etapa: "agora" (onde estão hoje) e "criados no período"
  function funilEtapas(deals, from, to) {
    var m = {};
    function get(n) { return m[n] || (m[n] = { nome: n, agora: [], criados: [] }); }
    CFG.etapas.forEach(get);
    (deals || []).forEach(function (d) { get(d.etapa).agora.push(d); if (noPer(d.criada, from, to)) get(d.etapa).criados.push(d); });
    var extra = Object.keys(m).filter(function (k) { return CFG.etapas.indexOf(k) < 0; }).sort();
    return CFG.etapas.concat(extra).map(function (k) { return m[k]; });
  }

  // Baldes por dia, semana ou mês dentro da janela coberta
  function serie(ana, j, gran) {
    if (!j.n || !j.ds.length) return { baldes: [], gran: gran || 'd', de: j.ini, ate: j.fim };
    var nDias = j.n;
    gran = gran || (nDias <= 31 ? 'd' : (nDias <= 150 ? 's' : 'm'));
    function chave(iso) { return gran === 'd' ? iso : (gran === 's' ? mondayOf(iso) : iso.slice(0, 7)); }
    var baldes = [], idx = {};
    function mk(k) { var b = { k: k, ini: 0, qual: 0, desp: 0, tem: false }; idx[k] = b; baldes.push(b); return b; }
    var de = j.ini, ate = j.fim;
    if (gran === 'd') { for (var t = de; t <= ate; t = addDays(t, 1)) mk(t); }
    else if (gran === 's') { for (var s = mondayOf(de); s <= ate; s = addDays(s, 7)) mk(s); }
    else { var y = +de.slice(0, 4), mo = +de.slice(5, 7), fim = ate.slice(0, 7); while (true) { var k = y + '-' + pad(mo); mk(k); if (k >= fim) break; mo++; if (mo > 12) { mo = 1; y++; } } }
    j.ds.forEach(function (d) {
      var b = idx[chave(d.dia)]; if (!b) return;
      if (d.dia >= NOVOS_DESDE) { b.ini += numOuZero(d.leads_novos); b.desp += numOuZero(d.descartados); b.tem = true; }
      b.qual += numOuZero(d.qualificados);
      if (temDado(d)) b.tem = true;
    });
    return { baldes: baldes, gran: gran, de: de, ate: ate };
  }

  // Todos os números da aba SDR (Ana) para um período
  function calcSdr(ana, deals, per) {
    var pe = periodoEf(per), j = janela(ana, pe.from, pe.to);
    var pa = periodoAnterior(pe.from, pe.to), ja = pa ? janela(ana, pa.from, pa.to) : null;
    function par(campos, fam) {
      campos = [].concat(campos);
      return { v: somaTodos(j, campos, fam), ant: ja && periodoCompleto(ja, pa, fam) ? somaTodos(ja, campos, fam) : null, parcial: fam === 'novo' && j.novos > 0 && j.novos < j.n };
    }
    var r = { per: pe, j: j, pa: pa, ja: ja };
    r.ini = par('leads_novos', 'novo');
    r.qual = par('qualificados', 'antigo');
    r.desp = par('descartados', 'novo');
    r.interv = par('intervencoes', 'novo');
    r.assumiu = par('assumiu', 'novo'); r.pediu = par('pediram_humano', 'novo'); r.devolveu = par('devolveu', 'novo'); r.pausou = par('pausou', 'novo');
    r.redes = par('redes', 'novo'); r.escalados = par('escalados', 'novo');
    r.pararam = par('pararam', 'novo');
    r.midia = par('midia_nao_entendida', 'novo');
    if (!j.ds.some(function (d) { return d.midia_nao_entendida != null; })) r.midia = { v: null, ant: null, parcial: false }; // campo que a rota ainda não traz: não vira zero
    r.alerta = par('alerta_humano', 'antigo');
    r.turnos = par('turnos', 'antigo'); r.turnosIa = par('turnos_ia', 'antigo'); r.turnosPadrao = par('turnos_padrao', 'antigo');
    r.taxa = (r.ini.v != null && r.qual.v != null && r.ini.v > 0) ? r.qual.v / r.ini.v : null;
    r.taxaAnt = (r.ini.ant != null && r.qual.ant != null && r.ini.ant > 0) ? r.qual.ant / r.ini.ant : null;
    r.agora = ana && ana.agora ? ana.agora : null;
    r.serie = serie(ana, j, S.gran);
    // negócios do Agendor
    r.deals = deals || null;
    if (deals) {
      r.dIni = deals.filter(function (d) { return noPer(d.criada, pe.from, pe.to); });
      r.dQual = deals.filter(function (d) { return ehQualificado(d) && noPer(d.data, pe.from, pe.to); });
      r.dDesp = deals.filter(function (d) { return ehDispensado(d) && noPer(d.data, pe.from, pe.to); });
      r.dConv = deals.filter(function (d) { return d.etapa === 'Novo lead' || d.etapa === 'Em conversa'; });
      r.funil = funilEtapas(deals, pe.from, pe.to);
      var tq = r.dQual.filter(function (d) { return d.dias != null; }).map(function (d) { return d.dias; }).sort(function (a, b) { return a - b; });
      r.tempo = tq.length ? { n: tq.length, media: tq.reduce(function (s, x) { return s + x; }, 0) / tq.length, med: tq.length % 2 ? tq[(tq.length - 1) / 2] : (tq[tq.length / 2 - 1] + tq[tq.length / 2]) / 2 } : null;
    }
    return r;
  }

  // Todos os números do painel de saúde e custo para um período
  function numModelo(v) { if (v == null) return 0; if (typeof v === 'number') return isFinite(v) ? v : 0; if (typeof v === 'object') return numOuZero(v.usd != null ? v.usd : (v.custo != null ? v.custo : v.total)); return numOuZero(v); }
  function calcSaude(ana, per) {
    var pe = periodoEf(per), j = janela(ana, pe.from, pe.to);
    var r = { per: pe, j: j, temCusto: !!(ana && ana.custo && Array.isArray(ana.custo.serie)) };
    var serieC = r.temCusto ? ana.custo.serie.filter(function (s) { return s.dia >= j.ini && s.dia <= j.fim; }) : [];
    r.serieC = serieC;
    var tot = 0, tts = 0, ttsChars = 0, leads = 0, qual = 0, turnos = 0, totNovos = 0, mod = {};
    CFG.modelos.forEach(function (m) { mod[m.k] = 0; });
    serieC.forEach(function (s) {
      tot += numOuZero(s.total); tts += numOuZero(s.tts && s.tts.usd); ttsChars += numOuZero(s.tts && s.tts.caracteres);
      qual += numOuZero(s.qualificados); turnos += numOuZero(s.turnos);
      if (s.dia >= NOVOS_DESDE) { leads += numOuZero(s.leads); totNovos += numOuZero(s.total); }
      var pm = s.porModelo || {};
      Object.keys(pm).forEach(function (k) { mod[k] = (mod[k] || 0) + numModelo(pm[k]); });
    });
    r.usd = tot; r.tts = tts; r.ttsChars = ttsChars; r.leads = leads; r.qual = qual; r.turnos = turnos; r.mod = mod;
    r.usdLead = j.novos > 0 && leads > 0 ? totNovos / leads : null;
    r.usdQual = qual > 0 ? tot / qual : null;
    r.usdTurno = turnos > 0 ? tot / turnos : null;
    r.projecao = r.temCusto && ana.custo.projecaoMesUsd != null ? numOuZero(ana.custo.projecaoMesUsd) : null;
    // tokens
    var tok = {}, tIn = 0, tCache = 0, tOut = 0, tCh = 0;
    CFG.modelos.forEach(function (m) {
      var o = { i: 0, o: 0, c: 0, n: 0 };
      j.ds.forEach(function (d) { o.i += numOuZero(d['ia_in_' + m.k]); o.o += numOuZero(d['ia_out_' + m.k]); o.c += numOuZero(d['ia_cacheR_' + m.k]); o.n += numOuZero(d['ia_chamadas_' + m.k]); });
      tok[m.k] = o; tIn += o.i; tOut += o.o; tCache += o.c; tCh += o.n;
    });
    r.tok = tok; r.tIn = tIn; r.tOut = tOut; r.tCache = tCache; r.tCh = tCh;
    r.cachePct = (tIn + tCache) > 0 ? tCache / (tIn + tCache) : null;
    // turnos e voz
    r.turnosN = soma(j, 'turnos', 'antigo'); r.turnosIa = soma(j, 'turnos_ia', 'antigo'); r.turnosPadrao = soma(j, 'turnos_padrao', 'antigo');
    r.mensagens = soma(j, 'mensagens', 'antigo');
    r.ttsCharsDias = soma(j, 'tts_caracteres', 'antigo');
    r.queda = (r.turnosN != null && r.turnosN > 0 && r.turnosPadrao != null) ? r.turnosPadrao / r.turnosN : null;
    // intervenção humana
    r.assumiu = soma(j, 'assumiu', 'novo'); r.devolveu = soma(j, 'devolveu', 'novo'); r.pausou = soma(j, 'pausou', 'novo'); r.pediu = soma(j, 'pediram_humano', 'novo');
    r.interv = soma(j, 'intervencoes', 'novo'); r.alerta = soma(j, 'alerta_humano', 'antigo'); r.pararam = soma(j, 'pararam', 'novo');
    r.leadsNovos = soma(j, 'leads_novos', 'novo');
    r.agora = ana && ana.agora ? ana.agora : null;
    // série diária de custo (um balde por dia, também os dias sem uso)
    r.dias = [];
    if (j.n) { var m = {}; serieC.forEach(function (s) { m[s.dia] = numOuZero(s.total); }); for (var t = j.ini; t <= j.fim; t = addDays(t, 1)) r.dias.push({ k: t, v: m[t] || 0 }); }
    return r;
  }

  // ---------- Renderização (HTML no mesmo estilo dos cartões do SDR: classes s2-*) ----------
  function delta(atual, ant, sufixo) {
    if (ant == null || atual == null) return '';
    var d = atual - ant, cls = d > 0 ? 'up' : (d < 0 ? 'down' : 'flat'), seta = d > 0 ? '▲' : (d < 0 ? '▼' : '=');
    return '<span class="s2-kd ' + cls + '" title="vs período anterior equivalente">' + seta + ' ' + (d > 0 ? '+' : '') + num(d) + (sufixo || '') + '</span>';
  }
  function deltaPct(atual, ant) {
    if (ant == null || atual == null) return '';
    var d = Math.round((atual - ant) * 1000) / 10, cls = d > 0 ? 'up' : (d < 0 ? 'down' : 'flat');
    return '<span class="s2-kd ' + cls + '" title="vs período anterior equivalente">' + (d > 0 ? '▲ +' : (d < 0 ? '▼ ' : '= ')) + dec1(d) + ' p.p.</span>';
  }
  function chip(label, val, sub, o) {
    o = o || {};
    return '<div class="s2-k' + (o.cinza ? ' gr' : '') + (o.apur ? ' ap' : '') + '"' + (o.go ? ' data-ag-go="' + o.go + '"' : '') + (o.tip ? ' title="' + esc(o.tip) + '"' : '') + '>' +
      '<span class="s2-kl">' + label + '</span><span class="s2-kv">' + val + (o.delta || '') + '</span><span class="s2-kt">' + sub + '</span></div>';
  }
  function card(titulo, sub, corpo, extra) {
    extra = extra || {};
    if (!String(corpo || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() && !/<(svg|canvas|img|table|button)/i.test(corpo || '')) return '';
    return '<div class="s2-card' + (extra.cls ? ' ' + extra.cls : '') + '"' + (extra.style ? ' style="' + extra.style + '"' : '') + '><div class="s2-ch"><span class="s2-ct">' + titulo + '</span><span class="s2-cs">' + (sub || '') + '</span></div><div class="s2-cb">' + corpo + '</div></div>';
  }
  var SEM = 'sem dados ainda';
  function semDadoSub(j, fam) { return fam === 'novo' && j.fim < NOVOS_DESDE ? 'contador novo, existe desde ' + dm(NOVOS_DESDE) : 'sem registro da Ana neste período'; }
  function nv(x) { return x == null ? 'n/d' : num(x); }
  function parcialTxt(p, j) { return p.parcial ? (j.ini < NOVOS_DESDE ? ' · só desde ' + dm(NOVOS_DESDE) + ' (' + j.novos + ' de ' + j.n + ' dias)' : ' · registro em ' + j.novos + ' de ' + j.n + ' dias') : ''; }

  function estadoGeral(opts) { // devolve html de estado (carregando, erro...) ou ''
    if (S.anaErr && !S.ana) return '<div class="s2-empty">Não consegui ler os dados da Ana agora. Tente de novo em instantes.<br><button class="s2-c" data-ag-retry="ana" style="margin-top:6px">Tentar de novo</button></div>';
    if (!S.ana) return '<div class="s2-empty">Carregando os dados da Ana…</div>';
    return '';
  }
  function atrasoInfo() {
    if (!S.ana) return { txt: 'sem leitura', warn: true };
    var t = Number(S.ana.geradoEm), min = isFinite(t) ? (Date.now() - t) / 60000 : null;
    var txt = 'Ana · lido em ' + (isFinite(t) ? instBRT(t) : 'n/d');
    if (S.anaErr) return { txt: txt + ' · a última atualização falhou', warn: true, falha: true };
    return { txt: txt, warn: min != null && min > CFG.atrasoMin, atrasado: min != null && min > CFG.atrasoMin };
  }

  // ---- gráficos ----
  function fz(sv, tv) { return tv ? sv.replace(/font-size="([0-9.]+)"/g, function (m, n) { return parseFloat(n) < 10 ? 'font-size="10"' : m; }) : sv; }
  function barras(b, series, o) { // series: [{campo,cor,rot,fmt}]; b: baldes com campos numéricos
    var tv = o.tv, W = tv ? 440 : (o.cw || 340), Hh = o.h || (tv ? 230 : 160), padL = o.padL || 28, padR = 4, padT = 14, padB = 20;
    var max = 0; b.forEach(function (x) { series.forEach(function (s) { if (x[s.campo] > max) max = x[s.campo]; }); });
    max = Math.max(max, o.minMax || 2);
    var iw = W - padL - padR, ih = Hh - padT - padB, gw = iw / b.length, ns = series.length;
    var bw = Math.max(2, Math.min(tv ? 22 : 14, gw * 0.8 / ns));
    var s = '<svg class="s2-chart" viewBox="0 0 ' + W + ' ' + Hh + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(o.aria) + '">';
    [0, 0.5, 1].forEach(function (f) {
      var y = padT + ih - ih * f;
      s += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y + '" y2="' + y + '" stroke="#eae7f2" stroke-width="1"/><text x="' + (padL - 4) + '" y="' + (y + 3) + '" text-anchor="end" font-size="9" fill="#766e90">' + esc(o.eixo(max * f)) + '</text>';
    });
    var passo = Math.ceil(b.length / (tv ? 14 : 7)), rotulos = b.length <= (tv ? 16 : 11);
    b.forEach(function (x, i) {
      var cx = padL + gw * i + gw / 2, rot = o.gran === 'm' ? nomeMes(x.k + '-01') : dm(x.k);
      var tip = rot + ': ' + series.map(function (sr) { return sr.fmt(x[sr.campo]) + ' ' + sr.rot; }).join(', ');
      s += '<g><title>' + esc(tip) + '</title>';
      series.forEach(function (sr, si) {
        var h = ih * x[sr.campo] / max, bx = cx - (ns * bw + (ns - 1) * 2) / 2 + si * (bw + 2);
        s += '<rect x="' + bx + '" y="' + (padT + ih - h) + '" width="' + bw + '" height="' + Math.max(h, x[sr.campo] ? 1 : 0) + '" rx="2" fill="' + sr.cor + '"' + (sr.op ? ' opacity="' + sr.op + '"' : '') + '/>';
        if (rotulos && x[sr.campo] && o.valores !== false) s += '<text x="' + (bx + bw / 2) + '" y="' + (padT + ih - h - 3) + '" text-anchor="middle" font-size="9" font-weight="800" fill="' + sr.cor + '">' + esc(sr.fmt(x[sr.campo])) + '</text>';
      });
      if (i % passo === 0) s += '<text x="' + cx + '" y="' + (Hh - 7) + '" text-anchor="middle" font-size="9" fill="#6b6484">' + rot + '</text>';
      s += '</g>';
    });
    return fz(s + '</svg>', tv);
  }
  function granBtns(gran, tv) {
    if (tv) return '';
    return '<div class="s2-fg">' + [['d', 'Dia'], ['s', 'Semana'], ['m', 'Mês']].map(function (g) { return '<button class="s2-c' + (gran === g[0] ? ' on' : '') + '" data-ag-gran="' + g[0] + '">' + g[1] + '</button>'; }).join('') + '</div>';
  }

  // ---- aba SDR (Ana) ----
  function kpisSdr(r) {
    var j = r.j, h = '';
    var tipIni = 'Conversas novas que a Ana começou no período (a pessoa mandou a primeira mensagem). Contador novo: só existe desde ' + dm(NOVOS_DESDE) + '. Clique para ver os negócios criados no período no Agendor.';
    h += chip('Iniciados ⓘ', nv(r.ini.v), r.ini.v == null ? semDadoSub(j, 'novo') : (r.dIni ? num(r.dIni.length) + ' com negócio no Agendor' : 'conversas novas') + parcialTxt(r.ini, j), { tip: tipIni, go: 'ini', delta: delta(r.ini.v, r.ini.ant), cinza: r.ini.v == null });
    var tipQ = 'Conversas que a Ana qualificou e passou para a equipe (handoffs) no período. Clique para ver os negócios nas etapas Qualificado e Repassado.';
    h += chip('Qualificados ⓘ', nv(r.qual.v), r.qual.v == null ? semDadoSub(j, 'antigo') : 'passados à equipe (handoffs)' + (r.dQual ? ' · ' + num(r.dQual.length) + ' no Agendor' : ''), { tip: tipQ, go: 'qual', delta: delta(r.qual.v, r.qual.ant), cinza: r.qual.v == null });
    h += chip('Dispensados ⓘ', nv(r.desp.v), r.desp.v == null ? semDadoSub(j, 'novo') : 'conversas encerradas sem qualificar' + parcialTxt(r.desp, j), { tip: 'Conversas que a Ana encerrou sem qualificar (fora do perfil, sem interesse e parecidos). Contador novo desde ' + dm(NOVOS_DESDE) + '.', go: 'desp', delta: delta(r.desp.v, r.desp.ant), cinza: r.desp.v == null });
    h += chip('Taxa de qualificação ⓘ', r.taxa == null ? 'n/d' : pct(r.qual.v, r.ini.v), r.taxa == null ? (r.ini.v === 0 ? 'nenhuma conversa nova no período' : SEM) : num(r.qual.v) + ' qualificados de ' + num(r.ini.v) + ' iniciados', { tip: 'Qualificados ÷ iniciados do mesmo período. Como uma conversa pode ser qualificada dias depois de iniciada, a taxa de períodos curtos oscila.', delta: deltaPct(r.taxa, r.taxaAnt), cinza: r.taxa == null });
    var ag = r.agora;
    h += chip('Em conversa agora ⓘ', ag ? num(ag.conversas || 0) : 'n/d', ag ? (num(ag.aguardandoPessoa || 0) + ' aguardando pessoa · ' + num(ag.comHumano || 0) + ' com a equipe') : SEM, { tip: 'Conversas abertas neste momento (não depende do período). Clique para ver os negócios nas etapas Novo lead e Em conversa.', go: 'conv' });
    var intervSub = r.interv.v == null ? semDadoSub(j, 'novo') : 'equipe assumiu ' + nv(r.assumiu.v) + ' · pediu pessoa ' + nv(r.pediu.v) + (r.midia.v != null ? ' · mídia não entendida ' + num(r.midia.v) : (r.alerta.v != null ? ' · alertas à equipe ' + num(r.alerta.v) : '')) + parcialTxt(r.interv, j);
    h += chip('Intervenções humanas ⓘ', nv(r.interv.v), intervSub, { tip: 'Vezes em que a equipe precisou entrar na conversa: a equipe assumiu, a pessoa pediu para falar com alguém ou a Ana não entendeu uma mídia. Contador novo desde ' + dm(NOVOS_DESDE) + '.', delta: delta(r.interv.v, r.interv.ant), cinza: r.interv.v == null });
    var enc = r.escalados.v != null ? r.escalados.v : r.redes.v;
    var encSub = enc == null ? semDadoSub(j, 'novo') : 'redes ' + nv(r.redes.v) + (r.escalados.v != null && r.redes.v != null && r.escalados.v >= r.redes.v ? ' · fora de GO/DF e outros ' + num(r.escalados.v - r.redes.v) : '') + parcialTxt(r.escalados.v != null ? r.escalados : r.redes, j);
    h += chip('Encaminhados ao Felipe ⓘ', nv(enc), encSub, { tip: 'Redes de supermercado e contatos de fora de GO e DF não são atendidos pela Ana: ela encaminha direto ao Felipe. Contador novo desde ' + dm(NOVOS_DESDE) + '.', delta: delta(enc, r.escalados.v != null ? r.escalados.ant : r.redes.ant), cinza: enc == null });
    h += chip('Sem resposta ⓘ', nv(r.pararam.v), r.pararam.v == null ? semDadoSub(j, 'novo') : 'pararam de responder' + parcialTxt(r.pararam, j), { tip: 'Conversas em que a pessoa parou de responder à Ana.', delta: delta(r.pararam.v, r.pararam.ant), cinza: r.pararam.v == null });
    var t = r.tempo;
    h += chip('Tempo até qualificar ⓘ', t ? dec1(t.media) + ' d' : 'n/d', t ? 'mediana ' + dec1(t.med) + ' d · ' + t.n + (t.n === 1 ? ' negócio' : ' negócios') : (r.deals ? 'sem negócio qualificado com data de fechamento' : SEM), { tip: 'Do primeiro contato (criação do negócio no Agendor) até a qualificação, nos negócios qualificados no período que têm data de fechamento. Só aparece quando houver esse dado.', cinza: !t });
    var tu = r.turnos.v, tia = r.turnosIa.v;
    h += chip('Turnos da Ana ⓘ', nv(tu), tu == null ? semDadoSub(j, 'antigo') : (tia != null ? num(tia) + ' escritos pela IA' : '') + (r.turnosPadrao.v != null ? ' · ' + num(r.turnosPadrao.v) + ' texto padrão' : ''), { tip: 'Cada resposta da Ana a uma mensagem da pessoa é um turno. Texto padrão = a IA não respondeu e entrou uma mensagem pronta.', delta: delta(tu, r.turnos.ant), cinza: tu == null });
    return h;
  }
  function graficoSdr(r, tv, cw) {
    var sr = r.serie, b = sr.baldes;
    if (!b.length) return '<div class="s2-empty">Sem registros da Ana neste período</div>';
    var novos = r.j.novos > 0;
    var series = [{ campo: 'ini', cor: CFG.corIni, rot: 'iniciados', fmt: num }, { campo: 'qual', cor: CFG.corQual, rot: 'qualificados', fmt: num }, { campo: 'desp', cor: CFG.corDesp, rot: 'dispensados', fmt: num, op: 0.8 }];
    var gl = sr.gran === 'd' ? 'dia' : sr.gran === 's' ? 'semana' : 'mês';
    return granBtns(sr.gran, tv) + barras(b, series, { tv: tv, cw: cw, gran: sr.gran, aria: 'Iniciados, qualificados e dispensados pela Ana por ' + gl, eixo: function (v) { return num(v); }, h: tv ? 330 : 160 }) +
      '<div class="s2-lg"><span><i style="background:' + CFG.corIni + '"></i>Iniciados</span><span><i style="background:' + CFG.corQual + '"></i>Qualificados</span><span><i style="background:' + CFG.corDesp + ';opacity:.8"></i>Dispensados</span></div>' +
      (novos && r.j.novos < r.j.n ? '<div class="s2-nt s2-xs">Iniciados e dispensados só existem desde ' + dm(NOVOS_DESDE) + '; antes disso a barra fica vazia por falta de contador, não por zero.</div>' : (!novos ? '<div class="s2-nt s2-xs">Iniciados e dispensados só existem desde ' + dm(NOVOS_DESDE) + ': neste período só os qualificados têm dado.</div>' : ''));
  }
  function funilSdr(r) {
    if (!r.deals) return S.dealsErr ? '<div class="s2-empty">Não consegui ler os negócios do funil da Ana.<br><button class="s2-c" data-ag-retry="deals" style="margin-top:6px">Tentar de novo</button></div>' : '<div class="s2-empty">Carregando negócios do funil Ana SDR IA…</div>';
    var max = 1; r.funil.forEach(function (l) { if (l.agora.length > max) max = l.agora.length; });
    var h = '<table class="s2-tb ag-tb"><thead><tr><th>Etapa</th><th>Agora</th><th>Criados no período</th></tr></thead><tbody>';
    r.funil.forEach(function (l, i) {
      var cor = CFG.corEtapa[l.nome] || '#9b93b0';
      function c(v) { return '<td class="' + (v ? '' : 'z') + '">' + (v ? num(v) : '·') + '</td>'; }
      h += '<tr data-ag-go="et:' + i + '" title="Clique para ver os negócios desta etapa"><td class="s2-etbar" style="--w:' + Math.round(l.agora.length / max * 100) + '%"><i class="s2-dot" style="background:' + cor + ';margin-right:6px"></i>' + esc(l.nome) + '</td>' + c(l.agora.length) + c(l.criados.length) + '</tr>';
    });
    h += '</tbody></table><div class="s2-nt s2-xs">Funil "Ana SDR IA" no Agendor (' + num(r.deals.length) + ' negócios). Agora = onde estão hoje; Criados = negócios novos no período. Origem dos negócios: WhatsApp (Ana).</div>';
    return h;
  }
  function agoraSdr(r) {
    var ag = r.agora;
    if (!ag) return '<div class="s2-empty">Sem leitura das conversas agora</div>';
    var pe = ag.porEstagio || {}, ks = Object.keys(pe).filter(function (k) { return numOuZero(pe[k]) > 0; }).sort(function (a, b) { return pe[b] - pe[a]; });
    var max = 1; ks.forEach(function (k) { if (pe[k] > max) max = pe[k]; });
    var h = '<table class="s2-tb ag-tb"><thead><tr><th>Etapa da conversa</th><th>Agora</th></tr></thead><tbody>';
    if (!ks.length) h += '<tr><td class="z">Nenhuma conversa aberta agora</td><td class="z">·</td></tr>';
    ks.forEach(function (k) { h += '<tr><td class="s2-etbar" style="--w:' + Math.round(pe[k] / max * 100) + '%" title="' + esc(rotuloEstagio(k)) + '">' + esc(rotuloEstagio(k)) + '</td><td>' + num(pe[k]) + '</td></tr>'; });
    h += '</tbody></table>';
    h += '<div class="s2-nt"><b>' + num(ag.conversas || 0) + '</b> conversas abertas · <b>' + num(ag.comHumano || 0) + '</b> com a equipe · <b>' + num(ag.pausadas || 0) + '</b> pausadas · <b>' + num(ag.aguardandoPessoa || 0) + '</b> aguardando uma pessoa</div>';
    return h;
  }
  function linhasDetalhe(r, linhas, vazio) { // linhas: [rotulo, {v}, dica]
    var tem = linhas.some(function (l) { return l[1].v != null; });
    if (!tem) return '<div class="s2-empty">' + vazio + '</div>';
    var h = '<table class="s2-tb ag-tb"><thead><tr><th>Quantas vezes</th><th>No período</th><th>Período anterior</th></tr></thead><tbody>';
    linhas.forEach(function (l) {
      h += '<tr title="' + esc(l[2] || '') + '"><td>' + esc(l[0]) + '</td><td>' + (l[1].v == null ? 'n/d' : num(l[1].v)) + '</td><td class="gc">' + (l[1].ant == null ? 'n/d' : num(l[1].ant)) + '</td></tr>';
    });
    return h + '</tbody></table>';
  }
  function intervSdr(r) {
    var j = r.j, h = linhasDetalhe(r, [
      ['Equipe assumiu a conversa', r.assumiu, 'a equipe entrou na conversa'],
      ['Pediram para falar com uma pessoa', r.pediu, 'a pessoa pediu atendimento humano'],
      ['Mídia não entendida', r.midia, 'áudio, foto ou arquivo que a Ana não entendeu'],
      ['Alertas à equipe', r.alerta, 'avisos que a Ana mandou para a equipe'],
      ['Devolvidas à Ana', r.devolveu, 'a equipe devolveu a conversa para a Ana'],
      ['Pausadas', r.pausou, 'conversas pausadas']
    ].filter(function (l) { return l[1].v != null || l[0] !== 'Mídia não entendida'; }), 'Sem dados ainda: estes contadores existem desde ' + dm(NOVOS_DESDE));
    if (j.novos > 0 && j.novos < j.n) h += '<div class="s2-nt s2-xs">Contadores novos: valem só de ' + dm(NOVOS_DESDE) + ' em diante e dos dias com registro (' + j.novos + ' de ' + j.n + ' dias do período).</div>';
    return h;
  }
  function encSdr(r) {
    var j = r.j, h = linhasDetalhe(r, [
      ['Redes de supermercado', r.redes, 'redes são atendidas pelo Felipe'],
      ['Total encaminhado ao Felipe', r.escalados, 'inclui redes e contatos de fora de GO e DF']
    ], 'Sem dados ainda: estes contadores existem desde ' + dm(NOVOS_DESDE));
    if (r.redes.v != null && r.escalados.v != null && r.escalados.v >= r.redes.v) h += '<div class="s2-nt"><b>' + num(r.escalados.v - r.redes.v) + '</b> fora de GO e DF (ou outros motivos), além das redes.</div>';
    h += '<div class="s2-nt s2-xs">A Ana atende só GO e DF e não atende redes: esses contatos vão direto para o Felipe.</div>';
    return h;
  }
  function coberturaSdr(r) {
    var j = r.j, partes = [];
    partes.push('Ana: ' + (j.n ? num(j.comDado) + ' de ' + num(j.n) + ' dias com registro (' + dm(j.ini) + ' a ' + dm(j.fim) + ')' : 'o período não tem dias cobertos pela rota'));
    partes.push('contadores novos desde ' + dm(NOVOS_DESDE) + (j.novos ? ': ' + num(j.novos) + ' de ' + num(j.n) + ' dias com registro' : ': nenhum dia deste período com registro'));
    if (j.recortado) partes.push('a rota guarda só os últimos ' + CFG.diasApi + ' dias');
    if (r.deals) partes.push(num(r.deals.length) + ' negócios no funil Ana SDR IA'); else if (S.dealsErr) partes.push('<b>negócios do funil indisponíveis</b>');
    return { txt: partes.join(' · '), warn: !j.n || !!S.dealsErr };
  }
  function notasSdr() {
    return '<p><b>Iniciados</b> = conversas novas que a Ana começou. <b>Qualificados</b> = conversas que a Ana passou para a equipe (handoffs). <b>Dispensados</b> = encerradas sem qualificar.</p>' +
      '<p><b>Taxa de qualificação</b> = qualificados ÷ iniciados do período. <b>Em conversa agora</b> e o funil por etapa mostram o momento atual e não mudam com o período.</p>' +
      '<p>Contadores novos só existem desde ' + dm(NOVOS_DESDE) + ': antes disso aparece "n/d", nunca zero. A seta de comparação só aparece quando o período anterior está completo.</p>' +
      '<p>A Ana atende o lado Inbound (WhatsApp). Com o filtro do topo em Outbound não há números dela.</p>';
  }

  // HTML completo da aba SDR (Ana): KPIs + corpo. opts: { tv, per, glob, cw }
  function sdrHtml(opts) {
    var tv = !!opts.tv, per = opts.per, glob = opts.glob || 'both';
    var est = estadoGeral();
    if (est) return { kpis: '', body: est, cov: '', status: atrasoInfo() };
    if (glob === 'outbound') {
      return { kpis: '', cov: '', status: atrasoInfo(), body: '<div class="s2-empty">O filtro do Dash está em Outbound. A Ana atende conversas que chegam por WhatsApp (Inbound), então não há números dela para Outbound.<br>Troque a barra do topo para Inbound ou Ambos.</div>' };
    }
    var r = calcSdr(S.ana, S.deals, per); S.last = r;
    var cv = coberturaSdr(r);
    var kpis = '<div class="s2-ks ag-ks">' + kpisSdr(r) + '</div>';
    var fl = tv ? 'flex:1' : '', fx = tv ? 'flex:0 0 auto' : '';
    var cGraf = card('Iniciados, qualificados e dispensados', esc(r.serie.baldes.length ? dm(r.serie.de) + ' a ' + dm(r.serie.ate) : ''), graficoSdr(r, tv, opts.cw), { style: fx });
    var cFunil = card('Funil por etapa', 'Ana SDR IA no Agendor', funilSdr(r), { style: fl });
    var cAgora = card('Em conversa agora', 'momento atual', agoraSdr(r), { style: fl });
    var cInterv = card('Intervenções humanas', 'a equipe entrou na conversa', intervSdr(r), { style: fl });
    var cEnc = card('Encaminhados ao Felipe', 'redes e fora de GO/DF', encSdr(r), { style: fl });
    var cNotas = tv ? card('Como ler', 'regras desta aba', '<div class="s2-nt">' + notasSdr() + '</div>', { style: fl })
                    : '<details class="s2-det s2-card"><summary style="padding:9px 12px">Como ler esta aba</summary><div class="s2-cb s2-nt">' + notasSdr() + '</div></details>';
    var body;
    if (tv) body = '<div class="s2-body"><div class="s2-pg" data-pg="1">' + cGraf + cFunil + cAgora + '</div><div class="s2-pg" data-pg="2">' + cInterv + cEnc + cNotas + '</div></div>';
    else body = '<div class="s2-body">' + cGraf + cFunil + cAgora + cInterv + cEnc + '</div>' + cNotas;
    return { kpis: kpis, body: body, cov: '<div class="s2-cov' + (cv.warn ? ' warn' : '') + '" title="O que esta aba leu e o que ela cobre">' + cv.txt + '</div>', status: atrasoInfo() };
  }

  // ---- listas (modal do Dash, com link do Agendor) ----
  function abreLista(titulo, itens, cor, aviso) {
    var mt = document.getElementById('modal-title'), mb = document.getElementById('modal-body'), mo = document.getElementById('modal-overlay');
    if (!mt || !mb || !mo) return;
    itens = (itens || []).slice().sort(function (a, b) { return (b.data || '') < (a.data || '') ? -1 : 1; });
    mt.textContent = titulo + ' · ' + itens.length;
    mb.innerHTML = (aviso ? '<div class="modal-empty">' + esc(aviso) + '</div>' : '') + (itens.length ? itens.map(function (d) {
      var sub = [d.etapa];
      if (d.criada) sub.push('criado em ' + dmy(d.criada));
      if (d.fim) sub.push('fechado em ' + dmy(d.fim));
      if (d.dias != null) sub.push(d.dias + ' d até fechar');
      return '<a class="mdeal-row" href="' + CFG.urlNegocio + d.id + '" target="_blank" rel="noopener"><div class="mdeal-dot" style="background:' + cor + '"></div><div class="mdeal-main"><div class="mdeal-title-line"><span class="mdeal-title">' + esc(d.titulo) + '</span></div><div class="mdeal-sub-line"><span style="font-size:10.5px;color:var(--muted)">' + esc(sub.join(' · ')) + '</span></div></div></a>';
    }).join('') : (aviso ? '' : '<div class="modal-empty">Nada aqui neste período</div>'));
    mo.classList.add('show');
  }
  function lista(go) {
    var r = S.last; if (!r) return null;
    if (!r.deals) return { t: 'Negócios', l: [], cor: C_CINZA, aviso: S.dealsErr ? 'Não consegui ler os negócios do funil da Ana agora.' : 'Os negócios do funil ainda estão carregando.' };
    if (go === 'ini') return { t: 'Iniciados (negócios criados no período)', l: r.dIni, cor: CFG.corIni };
    if (go === 'qual') return { t: 'Qualificados e repassados', l: r.dQual, cor: C_GANHO };
    if (go === 'desp') return { t: 'Dispensados', l: r.dDesp, cor: C_PERDA };
    if (go === 'conv') return { t: 'Em conversa agora', l: r.dConv, cor: CFG.corIni };
    var m = /^et:(\d+)$/.exec(go); if (m && r.funil[+m[1]]) return { t: r.funil[+m[1]].nome + ' (agora)', l: r.funil[+m[1]].agora, cor: CFG.corEtapa[r.funil[+m[1]].nome] || C_CINZA };
    return null;
  }
  // Tratador de cliques compartilhado: devolve true se o clique era da Ana
  function click(ev) {
    var rt = ev.target.closest('button[data-ag-retry]');
    if (rt) { var k = rt.getAttribute('data-ag-retry'); if (k === 'deals') { S.dealsErr = null; avisa(); lerDeals(); } else carregar(true); return true; }
    var g = ev.target.closest('button[data-ag-gran]');
    if (g) { S.gran = g.getAttribute('data-ag-gran'); avisa(); return true; }
    var t = ev.target.closest('[data-ag-go]');
    if (t) { var l = lista(t.getAttribute('data-ag-go')); if (l) abreLista(l.t, l.l, l.cor, l.aviso); return true; }
    return false;
  }

  // ---- painel de saúde e custo (aba Agentes, Ana) ----
  function modoInfo(a) {
    if (!a) return { t: 'n/d', cor: 'warn', sub: 'sem leitura' };
    if (a.killSwitch) return { t: 'Parada de emergência', cor: 'crit', sub: 'a Ana está desligada de propósito' };
    var m = semAcento(a.modo);
    if (m === 'ao_vivo' || m === 'aovivo') return { t: 'Ao vivo', cor: 'ok', sub: 'respondendo as pessoas' };
    if (m === 'sombra') return { t: 'Sombra', cor: 'warn', sub: 'só observa, não envia' };
    return { t: a.modo ? rotuloEstagio(a.modo) : 'n/d', cor: 'warn', sub: 'modo informado pela Ana' };
  }
  function kpisSaude(r, ana) {
    var j = r.j, mo = modoInfo(ana), semUso = r.temCusto && r.serieC.length && r.usd === 0 && !(r.turnos > 0);
    var h = '';
    h += chip('Situação ⓘ', '<span style="color:' + (mo.cor === 'ok' ? '#15803d' : mo.cor === 'crit' ? '#b91c1c' : '#b45309') + '">' + esc(mo.t) + '</span>', mo.sub + ' · voz ' + (ana && ana.vozLigada ? 'ligada' : 'desligada'), { tip: 'Modo da Ana: ao vivo (responde), sombra (só observa) ou parada de emergência. A voz é o áudio falado nas respostas.' });
    h += chip('Custo no período ⓘ', r.temCusto ? usd(r.usd) : 'n/d', r.temCusto ? (semUso ? 'sem uso da IA neste período' : brl(brlDe(r.usd)) + ' (estimativa, cotação R$ ' + String(CFG.cotacao).replace('.', ',') + ')') : 'sem dado de custo', { tip: 'Soma do custo da IA e da voz no período. O valor em reais é uma estimativa com cotação fixa de R$ ' + String(CFG.cotacao).replace('.', ',') + ' por dólar.', cinza: !r.temCusto || semUso });
    h += chip('Custo em reais ⓘ', r.temCusto ? brl(brlDe(r.usd)) : 'n/d', 'estimativa · US$ ' + String(CFG.cotacao).replace('.', ',') + ' = R$ 1', { tip: 'Estimativa: dólar multiplicado pela cotação fixa de R$ ' + String(CFG.cotacao).replace('.', ',') + '. Não é o valor da fatura.', cinza: !r.temCusto });
    h += chip('Por lead novo ⓘ', r.usdLead == null ? 'n/d' : usd(r.usdLead), r.usdLead == null ? (j.novos === 0 ? 'contador de leads novo, existe desde ' + dm(NOVOS_DESDE) : 'nenhum lead novo no período') : brl(brlDe(r.usdLead)) + ' est. · ' + num(r.leads) + ' leads' + (j.novos < j.n ? ' (em ' + j.novos + ' de ' + j.n + ' dias com registro)' : ''), { tip: 'Custo ÷ conversas novas, contando só os dias em que o contador de leads novos existe (desde ' + dm(NOVOS_DESDE) + ').', cinza: r.usdLead == null });
    h += chip('Por qualificado ⓘ', r.usdQual == null ? 'n/d' : usd(r.usdQual), r.usdQual == null ? 'nenhum qualificado no período' : brl(brlDe(r.usdQual)) + ' est. · ' + num(r.qual) + ' qualificados', { tip: 'Custo ÷ conversas qualificadas (handoffs) no período.', cinza: r.usdQual == null });
    h += chip('Por turno ⓘ', r.usdTurno == null ? 'n/d' : usd(r.usdTurno), r.usdTurno == null ? 'nenhum turno no período' : brl(brlDe(r.usdTurno)) + ' est. · ' + num(r.turnos) + ' turnos', { tip: 'Custo ÷ turnos (respostas da Ana).', cinza: r.usdTurno == null });
    h += chip('Projeção do mês ⓘ', r.projecao == null ? 'n/d' : usd(r.projecao), r.projecao == null ? 'sem projeção' : brl(brlDe(r.projecao)) + ' est. · não muda com o período', { tip: 'Quanto o mês corrente deve custar no ritmo atual. Não muda com o período escolhido.', cinza: r.projecao == null });
    h += chip('Acerto de cache ⓘ', r.cachePct == null ? 'n/d' : dec1(r.cachePct * 100) + '%', r.cachePct == null ? 'sem entrada de IA no período' : num(r.tCache) + ' de ' + num(r.tIn + r.tCache) + ' tokens de entrada lidos do cache', { tip: 'Parte da entrada da IA que veio do cache (mais barata). Quanto maior, menor o custo.', cinza: r.cachePct == null });
    h += chip('Escritos pela IA ⓘ', r.turnosN == null ? 'n/d' : (r.turnosIa == null || !(r.turnosN > 0) ? 'n/d' : pct(r.turnosIa, r.turnosN)), r.turnosN == null ? 'sem registro no período' : num(r.turnosIa || 0) + ' pela IA · ' + num(r.turnosPadrao || 0) + ' texto padrão · queda ' + (r.queda == null ? 'n/d' : pct(r.turnosPadrao, r.turnosN)), { tip: 'Dos turnos, quantos a IA escreveu. Os outros caem no texto padrão (mensagem pronta) quando a IA falha ou demora. Queda no texto padrão = turnos de texto padrão ÷ turnos.', cinza: r.turnosN == null });
    var ag = r.agora;
    h += chip('Conversas agora ⓘ', ag ? num(ag.conversas || 0) : 'n/d', ag ? num(ag.comHumano || 0) + ' com a equipe · ' + num(ag.pausadas || 0) + ' pausadas · ' + num(ag.aguardandoPessoa || 0) + ' aguardando pessoa' : 'sem leitura', { tip: 'Conversas abertas neste momento. Não muda com o período.', cinza: !ag });
    return h;
  }
  function graficoCusto(r, tv, cw) {
    if (!r.temCusto) return '<div class="s2-empty">Sem dado de custo da Ana</div>';
    if (!r.dias.length) return '<div class="s2-empty">O período não tem dias cobertos pela rota</div>';
    var gran = r.dias.length > 31 ? 's' : 'd', b = r.dias;
    if (gran === 's') { var m = {}, o = []; b.forEach(function (x) { var k = mondayOf(x.k); if (!m[k]) { m[k] = { k: k, v: 0 }; o.push(m[k]); } m[k].v += x.v; }); b = o; }
    b = b.map(function (x) { return { k: x.k, v: x.v }; });
    var tudoZero = b.every(function (x) { return !x.v; });
    return barras(b, [{ campo: 'v', cor: CFG.corCusto, rot: '(' + (gran === 's' ? 'semana' : 'dia') + ')', fmt: function (v) { return usd(v); } }], { tv: tv, cw: cw, gran: 'd', aria: 'Custo da Ana por ' + (gran === 's' ? 'semana' : 'dia') + ' em dólares', eixo: function (v) { return v >= 1 ? v.toFixed(0) : v.toFixed(2).replace('.', ','); }, h: tv ? 330 : 160, minMax: 0.01, valores: false, padL: 34 }) +
      '<div class="s2-lg"><span><i style="background:' + CFG.corCusto + '"></i>Custo por ' + (gran === 's' ? 'semana' : 'dia') + ' em US$ (passe o mouse ou toque: R$ estimado ' + String(CFG.cotacao).replace('.', ',') + ')</span></div>' +
      (tudoZero ? '<div class="s2-nt s2-xs">Sem custo registrado neste período.</div>' : '<div class="s2-nt s2-xs">Total: <b>' + usd(r.usd) + '</b> · ' + brl(brlDe(r.usd)) + ' (estimativa)</div>');
  }
  function modelosSaude(r) {
    if (!r.temCusto) return '<div class="s2-empty">Sem dado de custo da Ana</div>';
    var tot = r.usd, h = '<table class="s2-tb ag-tb"><thead><tr><th>Modelo</th><th>US$</th><th>R$ est.</th><th>%</th></tr></thead><tbody>';
    CFG.modelos.forEach(function (m) {
      var v = r.mod[m.k] || 0;
      h += '<tr><td title="' + esc(m.nome) + '"><i class="s2-dot" style="background:' + m.cor + ';margin-right:6px"></i>' + esc(m.nome) + '</td><td>' + usd(v).replace('US$ ', '') + '</td><td>' + brl(brlDe(v)).replace('R$ ', '') + '</td><td class="gc">' + (tot > 0 ? pct(v, tot) : 'n/d') + '</td></tr>';
    });
    h += '<tr><td><i class="s2-dot" style="background:#E92085;margin-right:6px"></i>Voz (falada)</td><td>' + usd(r.tts).replace('US$ ', '') + '</td><td>' + brl(brlDe(r.tts)).replace('R$ ', '') + '</td><td class="gc">' + (tot > 0 ? pct(r.tts, tot) : 'n/d') + '</td></tr>';
    h += '</tbody></table>';
    var chars = r.ttsCharsDias != null ? r.ttsCharsDias : r.ttsChars;
    h += '<div class="s2-nt"><b>Voz:</b> ' + num(chars || 0) + ' caracteres falados no período · voz ' + (S.ana && S.ana.vozLigada ? 'ligada' : 'desligada') + '. Valores em US$ e, ao lado, R$ estimado (cotação fixa).</div>';
    return h;
  }
  function tokensSaude(r) {
    var tem = r.tCh > 0 || r.tIn > 0 || r.tOut > 0 || r.tCache > 0;
    if (!tem) return '<div class="s2-empty">Sem uso da IA neste período</div>';
    var h = '<table class="s2-tb ag-tb"><thead><tr><th>Modelo</th><th>Entrada</th><th>Saída</th><th>Cache</th><th>Chamadas</th></tr></thead><tbody>';
    CFG.modelos.forEach(function (m) { var o = r.tok[m.k]; h += '<tr><td title="' + esc(m.nome) + '"><i class="s2-dot" style="background:' + m.cor + ';margin-right:6px"></i>' + esc(m.nome) + '</td><td title="' + num(o.i) + '">' + compacto(o.i) + '</td><td title="' + num(o.o) + '">' + compacto(o.o) + '</td><td title="' + num(o.c) + '">' + compacto(o.c) + '</td><td class="gc">' + compacto(o.n) + '</td></tr>'; });
    h += '<tr><td><b>Total</b></td><td><b>' + compacto(r.tIn) + '</b></td><td><b>' + compacto(r.tOut) + '</b></td><td><b>' + compacto(r.tCache) + '</b></td><td class="gc"><b>' + compacto(r.tCh) + '</b></td></tr></tbody></table>';
    h += '<div class="s2-nt"><b>Acerto de cache:</b> ' + (r.cachePct == null ? 'n/d' : dec1(r.cachePct * 100) + '%') + ' da entrada veio do cache. Entrada, saída e cache são tokens (pedaços de texto) lidos e escritos pela IA.</div>';
    return h;
  }
  function turnosSaude(r) {
    if (r.turnosN == null) return '<div class="s2-empty">Sem registro de turnos neste período</div>';
    var tot = r.turnosN || 0, ia = r.turnosIa || 0, pd = r.turnosPadrao || 0, outros = Math.max(0, tot - ia - pd);
    function barra(rot, v, cor) { return '<div class="s2-mr"><span>' + esc(rot) + '</span><span>' + num(v) + (tot > 0 ? ' · ' + pct(v, tot) : '') + '</span><i style="width:' + (tot > 0 ? Math.max(2, Math.round(v / tot * 100)) : 0) + '%;background:' + cor + ';opacity:1"></i></div>'; }
    var h = '<div class="s2-mot ag-mot">' + barra('Turnos no total', tot, '#9260c8') + barra('Escritos pela IA', ia, '#1baf7a') + barra('Texto padrão (a IA não respondeu)', pd, '#b45309') + (outros ? barra('Outros (sem classificação)', outros, '#b8b3c8') : '') + '</div>';
    h += '<div class="s2-nt"><b>Queda no texto padrão:</b> ' + (r.queda == null ? 'n/d' : pct(pd, tot)) + ' dos turnos. ' + (r.mensagens != null ? '<b>' + num(r.mensagens) + '</b> mensagens trocadas no período.' : '') + '</div>';
    return h;
  }
  function agoraSaude(r) {
    var ag = r.agora; if (!ag) return '<div class="s2-empty">Sem leitura das conversas agora</div>';
    var pe = ag.porEstagio || {}, ks = Object.keys(pe).filter(function (k) { return numOuZero(pe[k]) > 0; }).sort(function (a, b) { return pe[b] - pe[a]; });
    var max = 1; ks.forEach(function (k) { if (pe[k] > max) max = pe[k]; });
    var h = '<table class="s2-tb ag-tb"><thead><tr><th>Etapa da conversa</th><th>Agora</th></tr></thead><tbody>';
    if (!ks.length) h += '<tr><td class="z">Nenhuma conversa aberta agora</td><td class="z">·</td></tr>';
    ks.forEach(function (k) { h += '<tr><td class="s2-etbar" style="--w:' + Math.round(pe[k] / max * 100) + '%" title="' + esc(rotuloEstagio(k)) + '">' + esc(rotuloEstagio(k)) + '</td><td>' + num(pe[k]) + '</td></tr>'; });
    h += '</tbody></table><div class="s2-nt"><b>' + num(ag.conversas || 0) + '</b> abertas · <b>' + num(ag.comHumano || 0) + '</b> com a equipe · <b>' + num(ag.pausadas || 0) + '</b> pausadas · <b>' + num(ag.aguardandoPessoa || 0) + '</b> aguardando uma pessoa</div>';
    if (S.ana && S.ana.arquivo) h += '<div class="s2-nt s2-xs">Arquivo guardado: ' + num(numOuZero(S.ana.arquivo.mensagens)) + ' mensagens em ' + num(numOuZero(S.ana.arquivo.conversas)) + ' conversas.</div>';
    return h;
  }
  function intervSaude(r) {
    var j = r.j;
    function lin(rot, v, dica) { return [rot, { v: v, ant: null }, dica]; }
    var linhas = [lin('Equipe assumiu a conversa', r.assumiu, 'a equipe entrou na conversa'), lin('Devolvidas à Ana', r.devolveu, 'a equipe devolveu a conversa para a Ana'), lin('Pediram para falar com uma pessoa', r.pediu, 'a pessoa pediu atendimento humano'), lin('Pausadas', r.pausou, 'conversas pausadas'), lin('Alertas à equipe', r.alerta, 'avisos da Ana para a equipe'), lin('Sem resposta (pararam)', r.pararam, 'a pessoa parou de responder')];
    if (!linhas.some(function (l) { return l[1].v != null; })) return '<div class="s2-empty">Sem dados ainda: estes contadores existem desde ' + dm(NOVOS_DESDE) + '</div>';
    var h = '<table class="s2-tb ag-tb"><thead><tr><th>Quantas vezes</th><th>No período</th></tr></thead><tbody>';
    linhas.forEach(function (l) { h += '<tr title="' + esc(l[2]) + '"><td>' + esc(l[0]) + '</td><td>' + (l[1].v == null ? 'n/d' : num(l[1].v)) + '</td></tr>'; });
    h += '</tbody></table>';
    if (r.assumiu != null && r.devolveu != null) h += '<div class="s2-nt"><b>Saldo:</b> a equipe assumiu ' + num(r.assumiu) + ' e devolveu ' + num(r.devolveu) + (r.assumiu - r.devolveu > 0 ? ', ' + num(r.assumiu - r.devolveu) + ' ainda com a equipe.' : '.') + '</div>';
    if (j.novos > 0 && j.novos < j.n) h += '<div class="s2-nt s2-xs">Contadores novos: valem só de ' + dm(NOVOS_DESDE) + ' em diante e dos dias com registro (' + j.novos + ' de ' + j.n + ' dias do período).</div>';
    return h;
  }
  function coberturaSaude(r) {
    var j = r.j, p = [];
    p.push('Ana: ' + (j.n ? num(j.comDado) + ' de ' + num(j.n) + ' dias com registro (' + dm(j.ini) + ' a ' + dm(j.fim) + ')' : 'o período não tem dias cobertos'));
    p.push('contadores novos desde ' + dm(NOVOS_DESDE) + (j.novos ? ': ' + num(j.novos) + ' de ' + num(j.n) + ' dias com registro' : ': nenhum dia deste período com registro'));
    if (j.recortado) p.push('a rota guarda só os últimos ' + CFG.diasApi + ' dias');
    p.push('reais em estimativa (cotação fixa R$ ' + String(CFG.cotacao).replace('.', ',') + ')');
    p.push('esta aba mostra a Ana inteira: não muda com Outbound/Inbound');
    return { txt: p.join(' · '), warn: !j.n };
  }
  function saudeHtml(opts) {
    var tv = !!opts.tv, est = estadoGeral();
    if (est) return { head: '', kpis: '', body: est };
    var r = calcSaude(S.ana, opts.per); S.lastSaude = r;
    var cv = coberturaSaude(r), fl = tv ? 'flex:1' : '', fx = tv ? 'flex:0 0 auto' : '';
    var kpis = '<div class="s2-ks ag-ks">' + kpisSaude(r, S.ana) + '</div>';
    var cCusto = card('Custo por dia', esc(r.dias.length ? dm(r.j.ini) + ' a ' + dm(r.j.fim) : ''), graficoCusto(r, tv, opts.cw), { style: fx });
    var cMod = card('Custo por modelo', 'US$ e R$ estimado', modelosSaude(r), { style: fl });
    var cTok = card('Tokens e cache', 'entrada, saída e cache', tokensSaude(r), { style: fl });
    var cTur = card('Turnos: IA x texto padrão', 'quem escreveu a resposta', turnosSaude(r), { style: fl });
    var cAg = card('Conversas agora', 'momento atual', agoraSaude(r), { style: fl });
    var cInt = card('Intervenção humana', 'equipe assume e devolve', intervSaude(r), { style: fl });
    var body;
    if (tv) body = '<div class="s2-body"><div class="s2-pg" data-pg="1">' + cCusto + cMod + cTok + '</div><div class="s2-pg" data-pg="2">' + cTur + cAg + cInt + '</div></div>';
    else body = '<div class="s2-body">' + cCusto + cMod + cTok + cTur + cAg + cInt + '</div>';
    return { kpis: kpis, body: body, cov: '<div class="s2-cov' + (cv.warn ? ' warn' : '') + '">' + cv.txt + '</div>' };
  }

  // painel de saúde: desenho no próprio bloco (aba Agentes)
  function saudeStatusHtml(mo, ana) {
    var corCls = { ok: 'bia-status-ok', warn: 'bia-status-warn', crit: 'bia-status-crit' }[mo.cor] || 'bia-status-load';
    return '<div class="bia-status ' + corCls + '" style="margin-bottom:0">Ana: ' + esc(mo.t) + ' (' + esc(mo.sub) + ') · voz ' + (ana && ana.vozLigada ? 'ligada' : 'desligada') + '</div>';
  }
  function medeLarguraH() {
    var rw = H.root.clientWidth || 360; H.w = rw < 640 ? 'p' : (rw < 1100 ? 'm' : (rw < 1500 ? 'g' : 'x'));
    H.root.setAttribute('data-w', H.w); H.cw = Math.max(260, Math.round((rw - ({ p: 0, m: 8, g: 16, x: 16 }[H.w])) / ({ p: 1, m: 2, g: 3, x: 3 }[H.w]) - 26));
  }
  function desenhaSaude() {
    var root = H.root; if (!root) return;
    var per = H.cfg.getPeriod ? H.cfg.getPeriod() : null;
    if (!per) { root.innerHTML = '<div class="s2-empty">Carregando período…</div>'; return; }
    var tv = H.mode === 't';
    medeLarguraH();
    var x = saudeHtml({ tv: tv, per: per, cw: H.cw }), at = atrasoInfo(), mo = modoInfo(S.ana);
    var topo = '<div class="s2-hd"><div class="s2-ttl">Agentes · Ana · <b>' + esc(per.label || (dm(per.from) + ' a ' + dm(per.to))) + '</b> <span class="s2-st' + (at.warn ? ' warn' : '') + '" style="text-transform:none;letter-spacing:0">· ' + esc(at.txt) + (at.falha ? '' : (at.atrasado ? ' (atrasado)' : '')) + '</span></div></div>';
    root.innerHTML = topo + (S.ana ? saudeStatusHtml(mo, S.ana) : '') + (x.cov || '') + (x.kpis || '') + x.body;
    if (!tv && H.w !== 'p' && w.SDR2 && w.SDR2.layoutIn) w.SDR2.layoutIn(root);
  }

  // ---------- Dados ----------
  function fetchT(url, opts, ms) {
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = ctl ? setTimeout(function () { ctl.abort(); }, ms || 25000) : null;
    var o = opts || {}; if (ctl) o.signal = ctl.signal;
    return fetch(url, o).then(function (r) { if (t) clearTimeout(t); return r; }, function (e) { if (t) clearTimeout(t); throw e; });
  }
  function avisa() { S.cbs.forEach(function (f) { try { f(); } catch (e) { console.warn('AGENTES: render falhou', e && e.message); } }); }
  function lerAna() {
    if (S.anaLoading) return Promise.resolve();
    S.anaLoading = true;
    return fetchT(CFG.worker + '/ana-painel?dias=' + CFG.diasApi, {}, 25000).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (j) {
      if (!j || j.ok !== true || !Array.isArray(j.dias)) throw new Error('resposta inesperada');
      S.ana = j; S.anaErr = null; S.anaTs = Date.now();
    }).catch(function (e) { S.anaErr = e; console.warn('AGENTES: Ana falhou', e && e.message); })
      .then(function () { S.anaLoading = false; avisa(); });
  }
  function lerDeals() {
    if (S.dealsLoading || !S.bridge || !S.key) return Promise.resolve();
    S.dealsLoading = true;
    var COLS = 'id,title,stage_name,funnel_id,status,origin,origem_especial,created_at,end_time,closed_at,lost_at,data_real_evento', PAGE = 1000, all = [], vistos = {}, total = null;
    function pagina(from, tent) {
      return fetchT(S.bridge + '/rest/v1/dash_geral_deals?select=' + COLS + '&funnel_id=eq.' + CFG.funil + '&order=id.asc', { headers: { apikey: S.key, Authorization: 'Bearer ' + S.key, Range: from + '-' + (from + PAGE - 1), Prefer: 'count=exact' } }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var m = /\/(\d+)\s*$/.exec(res.headers.get('content-range') || ''); if (m) total = +m[1];
        return res.json();
      }).then(function (rows) {
        if (!Array.isArray(rows)) throw new Error('resposta inesperada');
        rows.forEach(function (d) { if (!vistos[d.id]) { vistos[d.id] = 1; all.push(d); } });
        if (rows.length && (total == null ? rows.length >= PAGE : from + rows.length < total)) return pagina(from + rows.length, 0);
      }, function (e) { if (tent < 2) return new Promise(function (ok) { setTimeout(ok, 800 * (tent + 1)); }).then(function () { return pagina(from, tent + 1); }); throw e; });
    }
    return pagina(0, 0).then(function () { S.deals = prepDeals(all); S.dealsErr = null; }).catch(function (e) { S.dealsErr = e; console.warn('AGENTES: negócios falharam', e && e.message); })
      .then(function () { S.dealsLoading = false; avisa(); });
  }
  function carregar(force) {
    if (!force && S.ana && Date.now() - S.anaTs < 60000) return Promise.resolve();
    S.anaErr = null; if (force) S.dealsErr = null;
    return Promise.all([lerAna(), (force || !S.deals) ? lerDeals() : Promise.resolve()]);
  }

  // ---------- CSS ----------
  var CSS = [
    '.ag-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 8px;flex-shrink:0}',
    '.ag-bar .ag-l{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--faint,#766e90)}',
    '.ag-bar .oseg .ochip.active{background:var(--purple,#704B9B);color:#fff;box-shadow:0 2px 6px -1px rgba(112,75,155,.35)}',
    '.ag-bar .oseg .ochip{min-height:30px}',
    '#ag-root{min-width:0}',
    '.s2.tv .s2-ks.ag-ks .s2-k{min-height:78px}',
    '.s2.tv .ag-tb{flex:1 1 auto}',
    '.s2.tv .ag-mot{flex:1 1 auto;justify-content:space-around}',
    '.ag-tb td:first-child{max-width:none!important;width:auto!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;overflow-wrap:anywhere}',
    '.ag-tb th{white-space:normal;line-height:1.15;vertical-align:bottom}',
    '.ag-mot .s2-mr span:first-child{white-space:normal;overflow:visible;text-overflow:clip}',
    '.ag-mot .s2-mr{align-items:end}',
    '.s2-etbar{min-width:0}',
    '#ag-root.s2.tv{flex:1;min-height:0}'
  ].join('\n');
  function injetaCss() {
    if (document.getElementById('ag-css')) return;
    var st = document.createElement('style'); st.id = 'ag-css'; st.textContent = CSS; document.head.appendChild(st);
  }
  function barra(el, atual, rotulos) { // seletor de agente da aba Agentes: Bia | Ana
    injetaCss();
    el.innerHTML = '<span class="ag-l">Agente</span><div class="oseg" role="group" aria-label="Agente">' + rotulos.map(function (r) { return '<button type="button" class="ochip' + (atual === r[0] ? ' active' : '') + '" data-ag-pick="' + r[0] + '" aria-pressed="' + (atual === r[0]) + '">' + esc(r[1]) + '</button>'; }).join('') + '</div>';
  }

  // ---------- API pública ----------
  var API = {
    CFG: CFG, click: click, sdrHtml: sdrHtml, barra: barra, carregar: carregar,
    // chamada pelo sdr2.js (aba SDR) e pelas páginas
    init: function (cfg) {
      if (cfg.bridge) S.bridge = cfg.bridge; if (cfg.key) S.key = cfg.key;
      if (cfg.onChange && S.cbs.indexOf(cfg.onChange) < 0) S.cbs.push(cfg.onChange);
      injetaCss();
    },
    // painel de saúde (aba Agentes): { root, mode:'m'|'t', getPeriod, bridge, key, isActive }
    initSaude: function (cfg) {
      H.cfg = cfg; H.root = cfg.root; H.mode = cfg.mode || 'm';
      if (cfg.bridge) S.bridge = cfg.bridge; if (cfg.key) S.key = cfg.key;
      injetaCss();
      if (w.SDR2 && w.SDR2.ensureCss) w.SDR2.ensureCss();
      H.root.classList.add('s2', H.mode === 't' ? 'tv' : 'm');
      if (!H.inited) {
        H.inited = true;
        var f = function () { if (H.cfg.isActive && H.cfg.isActive()) desenhaSaude(); };
        if (S.cbs.indexOf(f) < 0) S.cbs.push(f);
        H.root.addEventListener('click', click);
        var rt; w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(f, 200); });
        if (H.mode !== 't' && typeof ResizeObserver !== 'undefined') {
          var ro = new ResizeObserver(function () { var rw = H.root.clientWidth, k = rw < 640 ? 'p' : (rw < 1100 ? 'm' : (rw < 1500 ? 'g' : 'x')); if (rw > 0 && k !== H.w && H.cfg.isActive && H.cfg.isActive()) desenhaSaude(); });
          ro.observe(H.root);
        }
        if (H.mode === 't' && !S.timer) S.timer = setInterval(function () { if (H.cfg.isActive && H.cfg.isActive()) carregar(true); }, CFG.refreshMs);
      }
    },
    activateSaude: function () { desenhaSaude(); carregar(false); },
    renderSaude: desenhaSaude,
    state: S,
    // núcleo puro, exposto para teste
    _core: { janela: janela, soma: soma, calcSdr: calcSdr, calcSaude: calcSaude, prepDeals: prepDeals, serie: serie, periodoAnterior: periodoAnterior, funilEtapas: funilEtapas, setAna: function (a) { S.ana = a; }, setDeals: function (d) { S.deals = d; }, ehQualificado: ehQualificado, ehDispensado: ehDispensado, usd: usd, brl: brl, rotuloEstagio: rotuloEstagio }
  };
  w.AGENTES = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
