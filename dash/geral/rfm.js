/* ============================================================
 * Aba RFM do Dash Geral (04/11/2026): matriz Recencia x Frequencia da carteira B2B do Agendor, no PADRAO da "Matriz RFM Geral Life B" (ERP).
 * Compartilhado pelo celular (dash/geral/index.html) e pelo telao (dash/geral/telao/index.html): UM motor e UM desenho (paridade).
 *
 * FONTE: a MESMA tabela dash_geral_deals que o dash ja le (cfg.getRows() devolve o _rawDeals). Nenhuma fonte nova, nenhuma escrita. SO AGENDOR.
 * ESCOPO: ganhos dos funis Arena 890331, Pos-venda 907387 e Reativacao +75 909368. Fora: SDR e Yanmei.
 * CLIENTE: a tabela nao traz empresa/CNPJ. Cliente = cadeia de negocios (Reposicao #N aponta "Negocio anterior" ate o Arena de origem;
 *   Reativacao 75+ casa pelo nome quando unico).
 * DATA do evento = data_real_evento, senao end_time (dia BRT); NUNCA won_at. Ganho < R$ 10 nao entra.
 * COMPRA = dia com pedido ganho para o cliente (varios negocios no mesmo dia contam como UMA compra; os valores somam).
 * METODO (padrao da matriz do Robert):
 *   R = faixa FIXA de dias desde a ultima compra: R5 0-60, R4 61-90, R3 91-120, R2 121-150, R1 151+.
 *   F = nº de compras: 1, 2, 3, 4, 5+ (F5 = 5 ou mais). Dinheiro NAO e eixo: aparece em R$ na celula e nos KPIs.
 *   Segmento = funcao da celula (F,R), tabela GRADE abaixo. Sem quintil, sem nota de valor.
 *   O ciclo de recompra do cliente continua so como informacao secundaria (lista e KPI "Ciclo de recompra").
 * ============================================================ */
(function (w) {
  'use strict';

  var CFG = {
    funis: { '890331': 'Arena', '907387': 'Pós-venda', '909368': 'Reativação +75' },
    minValor: 10,                 // ganho < R$ 10 e simbolico: nao entra (mesma regra do ticket inteligente)
    cicloMin: 30, cicloMax: 180, cicloPadrao: 75,
    ativoDias: 90,                // "ativo" = ultima compra ha ate 90 dias (R4 e R5)
    faixas: [60, 90, 120, 150],   // limites dos dias para R5, R4, R3, R2 (acima de 150 = R1)
    movDias: 30,                  // movimento entre segmentos: hoje x 30 dias atras
    provaDias: 90,                // prova: segmentos de 90 dias atras x quem recomprou depois
    atrasoSyncMin: 30,
    urlNegocio: 'https://web.agendor.com.br/sistema/negocios/historico.php?id=',
    campo: ['976406', '977487', '977488', '977499', '977506', '983372', '987866', '993185'],
    nomes: { '976406': 'Iramar', '977487': 'Natanael', '977488': 'Janeth', '977499': 'Sâmilla', '977506': 'Washington', '983372': 'Flávia', '987866': 'Anderson', '993185': 'Edgard', '976405': 'Felipe', '973972': 'Grandes Contas' },
    grandes: '973972'
  };

  // ---------- segmentos (ordem de exibicao) ----------
  var SEGS = [
    { k: 'campeoes', n: 'Campeões', c: '#2f9e6b', regra: '4 ou 5+ compras e última compra há até 60 dias.', acao: 'Agradecer, manter o ritmo e pedir indicação.' },
    { k: 'leais', n: 'Leais', c: '#5fae8c', regra: '4 ou 5+ compras e última compra entre 61 e 120 dias.', acao: 'Ofertar mix novo e reposição fixa.' },
    { k: 'potenciais', n: 'Potenciais leais', c: '#4f93d4', regra: '2 ou 3 compras e última compra há até 90 dias.', acao: 'Subir o pedido médio com combos e firmar o ritmo.' },
    { k: 'novos', n: 'Novos', c: '#a3a85c', regra: '1 compra, feita há até 60 dias.', acao: 'Acompanhar a entrega e garantir a 2ª compra.' },
    { k: 'promissores', n: 'Promissores', c: '#b9bf78', regra: '1 compra, feita entre 61 e 90 dias.', acao: 'Contato de reposição antes de esfriar.' },
    { k: 'atencao', n: 'Precisam de atenção', c: '#dcb25a', regra: '3 compras e última compra entre 91 e 120 dias.', acao: 'Ligar e oferecer reposição antes que atrasem mais.' },
    { k: 'dormir', n: 'Quase dormindo', c: '#cfa08f', regra: '1 ou 2 compras e última compra entre 91 e 120 dias.', acao: 'Mensagem de reativação leve, com condição especial.' },
    { k: 'risco', n: 'Em risco', c: '#df6d72', regra: '3 ou 4 compras e última compra há mais de 120 dias.', acao: 'Ligar hoje: entender o motivo e recuperar o pedido.' },
    { k: 'naoperder', n: 'Não pode perder', c: '#d4485a', regra: '5+ compras e última compra há mais de 120 dias.', acao: 'Prioridade máxima: ligação do rep e do gestor.' },
    { k: 'hibernando', n: 'Hibernando', c: '#a4aaa8', regra: '1 ou 2 compras e última compra entre 121 e 150 dias.', acao: 'Campanha de reativação em massa.' },
    { k: 'perdidos', n: 'Perdidos', c: '#7f8c89', regra: '1 ou 2 compras e última compra há mais de 150 dias.', acao: 'Só campanhas baratas; não gastar tempo de rep.' }
  ];
  var SEG = {}; SEGS.forEach(function (s, i) { SEG[s.k] = s; s.i = i; });
  var RISCO = { risco: 1, naoperder: 1 };
  // grade do Robert: GRADE[F][R] (F de 5 a 1; R de 1 a 5)
  var GRADE = {
    5: { 1: 'naoperder', 2: 'naoperder', 3: 'leais', 4: 'leais', 5: 'campeoes' },
    4: { 1: 'risco', 2: 'risco', 3: 'leais', 4: 'leais', 5: 'campeoes' },
    3: { 1: 'risco', 2: 'risco', 3: 'atencao', 4: 'potenciais', 5: 'potenciais' },
    2: { 1: 'perdidos', 2: 'hibernando', 3: 'dormir', 4: 'potenciais', 5: 'potenciais' },
    1: { 1: 'perdidos', 2: 'hibernando', 3: 'dormir', 4: 'promissores', 5: 'novos' }
  };
  // ordem "do melhor para o pior" (para dizer se um cliente subiu ou desceu entre dois retratos)
  var ORDEM = { campeoes: 10, leais: 9, potenciais: 8, novos: 8, promissores: 7, atencao: 6, dormir: 5, risco: 4, naoperder: 4, hibernando: 3, perdidos: 2 };

  // ---------- utilidades ----------
  var DIA = 86400000;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function utc(ymd) { var p = String(ymd).slice(0, 10).split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function diasEntre(a, b) { return Math.round((utc(b) - utc(a)) / DIA); }
  function addDias(ymd, n) { return new Date(utc(ymd) + n * DIA).toISOString().slice(0, 10); }
  function hojeBRT() { return new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 10); }
  function dmy(ymd) { if (!ymd) return ''; var p = String(ymd).slice(0, 10).split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function dm(ymd) { if (!ymd) return ''; var p = String(ymd).slice(0, 10).split('-'); return p[2] + '/' + p[1]; }
  function hhmmBRT(iso) { var t = Date.parse(iso); if (isNaN(t)) return ''; var d = new Date(t - 3 * 3600000); return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0'); }
  function nf(n, d) { return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function brl(v) { return 'R$ ' + nf(Math.round(v), 0); }
  function brlK(v) {
    v = Math.round(v);
    if (v >= 1000000) return nf(v / 1000000, 1) + ' mi';
    if (v >= 10000) return nf(Math.round(v / 1000), 0) + ' mil';
    if (v >= 1000) return nf(v / 1000, 1) + ' mil';
    return nf(v, 0);
  }
  // "R$ 373 mil", "R$ 79,3 mil", "R$ 2,48 mi" (3 algarismos significativos, como na matriz do Robert)
  function brlM(v, curto) {
    var p = curto ? '' : 'R$ ';
    v = Math.round(v);
    if (v >= 1000000) { var m = v / 1000000; return p + nf(m, m >= 100 ? 0 : m >= 10 ? 1 : 2) + ' mi'; }
    if (v >= 1000) { var k = v / 1000; return p + nf(k, k >= 100 ? 0 : k >= 10 ? 1 : 2) + ' mil'; }
    return p + nf(v, 0);
  }
  function norm(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function mediana(a) { if (!a.length) return null; var s = a.slice().sort(function (x, y) { return x - y; }), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
  function hexRgb(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgba(h, a) { var c = hexRgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  // ---------- NUCLEO (puro, testavel em node) ----------
  function dataEvento(d) {
    if (d.data_real_evento) return String(d.data_real_evento).slice(0, 10);
    var e = d.end_time; if (!e) return null; e = String(e);
    if (/T00:00:00(\.\d+)?(Z|\+00:00)?$/.test(e)) return e.slice(0, 10);   // data sem hora: vale como esta
    var t = Date.parse(e); if (isNaN(t)) return e.slice(0, 10);
    return new Date(t - 3 * 3600000).toISOString().slice(0, 10);          // instante: converte para o dia em Brasilia
  }
  function funilDe(d) { return String(d.funnel_id == null ? '' : d.funnel_id); }
  function origemDe(d) {
    var e = String(d.origem_especial || '').toLowerCase();
    if (e === 'superagos' || e === 'recuperacao') return 'outbound';
    return d.origin === 'inbound' ? 'inbound' : 'outbound';
  }
  function limpaNome(t) { return String(t || '').replace(/\s+[—–-]\s+(Reposição|Reposicao)\s*#\d+\s*$/i, '').replace(/\s+[—–-]\s+(Reativação|Reativacao)\s*75\+?\s*$/i, '').replace(/\s+/g, ' ').trim(); }
  function anteriorDe(d) { var m = /Neg[óo]cio anterior:[^\n]*?id=(\d+)/i.exec(d.description || ''); return m ? m[1] : null; }

  // R pela faixa fixa de dias desde a ultima compra
  function faixaR(dias) { var f = CFG.faixas; return dias <= f[0] ? 5 : dias <= f[1] ? 4 : dias <= f[2] ? 3 : dias <= f[3] ? 2 : 1; }
  function segmentoDe(F, R) { return GRADE[Math.max(1, Math.min(5, F))][Math.max(1, Math.min(5, R))]; }

  // Monta os clientes (cadeias de negocios) e as compras validas ate `asOf` (YYYY-MM-DD).
  function clientes(rows, asOf) {
    var no = { semData: 0, semValor: 0 };
    var porId = {}, pai = {};
    function ach(a) { while (pai[a] !== a) { pai[a] = pai[pai[a]]; a = pai[a]; } return a; }
    function une(a, b) { a = ach(a); b = ach(b); if (a !== b) pai[a] = b; }
    var deals = [];
    (rows || []).forEach(function (d) { if (CFG.funis[funilDe(d)]) { var id = String(d.id); porId[id] = d; pai[id] = id; deals.push(d); } });
    deals.forEach(function (d) { var a = anteriorDe(d); if (a && porId[a]) une(String(d.id), a); });
    // Reativacao/Reposicao sem elo: casa pelo nome limpo, so se houver um unico grupo Arena com esse nome
    var arenaPorNome = {}, temArena = {};
    deals.forEach(function (d) { if (funilDe(d) === '890331') { var k = norm(limpaNome(d.title)), g = ach(String(d.id)); (arenaPorNome[k] = arenaPorNome[k] || {})[g] = 1; } });
    deals.forEach(function (d) { if (funilDe(d) === '890331') temArena[ach(String(d.id))] = 1; });
    deals.forEach(function (d) {
      if (funilDe(d) === '890331') return;
      var g = ach(String(d.id)); if (temArena[g]) return;
      var cand = arenaPorNome[norm(limpaNome(d.title))];
      if (cand) { var ks = Object.keys(cand); if (ks.length === 1) { une(String(d.id), ks[0]); } }
    });
    var grupos = {};
    deals.forEach(function (d) {
      if (d.status !== 'won') return;
      var data = dataEvento(d); if (!data) { no.semData++; return; }
      if (data > asOf) return;
      var v = Number(d.value) || 0; if (!(v >= CFG.minValor)) { no.semValor++; return; }
      var g = ach(String(d.id));
      (grupos[g] = grupos[g] || { id: g, compras: [] }).compras.push({ id: String(d.id), data: data, valor: v, funil: funilDe(d), owner: String(d.owner_id == null ? '' : d.owner_id), d: d });
    });
    var lista = Object.keys(grupos).map(function (g) {
      var c = grupos[g]; c.compras.sort(function (a, b) { return a.data < b.data ? -1 : a.data > b.data ? 1 : (+a.id) - (+b.id); });
      c.nNegocios = c.compras.length;
      // COMPRA = dia com pedido ganho: negocios do mesmo dia viram uma compra so (valores somam; guarda o ultimo id do dia)
      var dias = [];
      c.compras.forEach(function (x) { var u = dias[dias.length - 1]; if (u && u.data === x.data) { u.valor += x.valor; u.id = x.id; u.d = x.d; u.negocios++; if (x.funil === '890331') u.funil = x.funil; } else dias.push({ id: x.id, data: x.data, valor: x.valor, funil: x.funil, owner: x.owner, d: x.d, negocios: 1 }); });
      c.negocios = c.compras; c.compras = dias;
      // cabeca da cadeia: o 1o negocio Arena (mais antigo); sem Arena, a 1a compra
      var arena = c.negocios.filter(function (x) { return x.funil === '890331'; })[0] || c.negocios[0];
      var ult = c.compras[c.compras.length - 1];
      c.nome = limpaNome(arena.d.title) || ('Negócio ' + arena.id);
      c.origem = origemDe(arena.d);
      c.owner = ult.owner; c.ultimoId = ult.id; c.primeiroId = arena.id;
      c.n = c.compras.length; c.valor = c.compras.reduce(function (s, x) { return s + x.valor; }, 0);
      c.primeira = c.compras[0].data; c.ultima = ult.data;
      var ints = []; for (var i = 1; i < c.n; i++) { var dd = diasEntre(c.compras[i - 1].data, c.compras[i].data); if (dd > 0) ints.push(dd); }
      c.cicloProprio = ints.length ? Math.min(CFG.cicloMax, Math.max(CFG.cicloMin, mediana(ints))) : null;
      return c;
    });
    var proprios = lista.filter(function (c) { return c.cicloProprio != null; }).map(function (c) { return c.cicloProprio; });
    var cicloCarteira = proprios.length ? mediana(proprios) : CFG.cicloPadrao;
    lista.forEach(function (c) {
      c.ciclo = c.cicloProprio != null ? c.cicloProprio : cicloCarteira;
      c.dias = Math.max(0, diasEntre(c.ultima, asOf));
      c.razao = c.dias / c.ciclo;
    });
    return { lista: lista, cicloCarteira: cicloCarteira, descartes: no };
  }

  function pontuar(lista) {
    lista.forEach(function (c) { c.R = faixaR(c.dias); c.F = Math.min(5, c.n); c.seg = segmentoDe(c.F, c.R); });
    return {};
  }

  // Retrato completo da carteira em `asOf`
  function retrato(rows, asOf, origem) {
    var cl = clientes(rows, asOf);
    var lista = cl.lista.filter(function (c) { return !origem || origem === 'both' || c.origem === origem; });
    var p = pontuar(lista);
    return { asOf: asOf, lista: lista, cicloCarteira: cl.cicloCarteira, descartes: cl.descartes };
  }

  // Backtest: pega a carteira em (asOf - dias), agrupa por segmento e conta quem COMPROU DE NOVO depois (ate asOf).
  function prova(rows, asOf, origem, dias) {
    var T = addDias(asOf, -dias), ret = retrato(rows, T, origem), depois = clientes(rows, asOf).lista, mapa = {};
    depois.forEach(function (c) { mapa[c.id] = c; });
    var porSeg = {}, tot = { n: 0, rec: 0, valor: 0 }, linhas = [];
    SEGS.forEach(function (s) { porSeg[s.k] = { n: 0, rec: 0, valor: 0 }; });
    ret.lista.forEach(function (c) {
      var d = mapa[c.id], novas = d ? d.compras.filter(function (x) { return x.data > T; }) : [];
      var rec = novas.length > 0, v = novas.reduce(function (s, x) { return s + x.valor; }, 0);
      var g = porSeg[c.seg]; g.n++; tot.n++; if (rec) { g.rec++; tot.rec++; } g.valor += v; tot.valor += v;
      linhas.push({ c: d || c, antes: c, rec: rec });
    });
    return { de: T, ate: asOf, dias: dias, n: ret.lista.length, porSeg: porSeg, tot: tot, linhas: linhas };
  }

  // Calcula tudo que a tela mostra. opts: {asOf, origem}
  function computeRfm(rows, opts) {
    opts = opts || {};
    var asOf = opts.asOf || hojeBRT();
    var cur = retrato(rows, asOf, opts.origem);
    var out = { asOf: asOf, clientes: cur.lista, cicloCarteira: cur.cicloCarteira, descartes: cur.descartes };
    // movimento: o mesmo retrato 30 dias atras
    var antes = retrato(rows, addDias(asOf, -CFG.movDias), opts.origem), mapa = {};
    antes.lista.forEach(function (c) { mapa[c.id] = c; });
    var mov = { dias: CFG.movDias, de: antes.asOf, novos: [], subiram: [], desceram: [], iguais: [], fluxos: {} };
    cur.lista.forEach(function (c) {
      var a = mapa[c.id]; c.segAntes = a ? a.seg : null;
      if (!a) { mov.novos.push(c); return; }
      if (a.seg === c.seg) { mov.iguais.push(c); return; }
      var k = a.seg + '>' + c.seg; (mov.fluxos[k] = mov.fluxos[k] || { de: a.seg, para: c.seg, lista: [] }).lista.push(c);
      (ORDEM[c.seg] > ORDEM[a.seg] ? mov.subiram : mov.desceram).push(c);
    });
    mov.lista = Object.keys(mov.fluxos).map(function (k) { return mov.fluxos[k]; }).sort(function (a, b) { return b.lista.length - a.lista.length; });
    mov.semBase = !antes.lista.length;
    out.mov = mov;
    out.prova = prova(rows, asOf, opts.origem, CFG.provaDias);
    return out;
  }

  // Agregados para a tela, sobre a lista JA filtrada (segmento/rep).
  function agregar(lista, ticketFn) {
    var a = { n: lista.length, receita: 0, ativos: 0, risco: { n: 0, valor: 0 }, bySeg: {}, matriz: {} };
    SEGS.forEach(function (s) { a.bySeg[s.k] = { n: 0, valor: 0, lista: [] }; });
    var vals = [], ciclos = [];
    lista.forEach(function (c) {
      a.receita += c.valor;
      if (c.dias <= CFG.ativoDias) a.ativos++;
      var b = a.bySeg[c.seg]; b.n++; b.valor += c.valor; b.lista.push(c);
      if (RISCO[c.seg]) { a.risco.n++; a.risco.valor += c.valor; }
      c.compras.forEach(function (x) { vals.push(x.valor); });
      if (c.cicloProprio != null) ciclos.push(c.cicloProprio);
      var k = c.F + '|' + c.R, m = a.matriz[k] = a.matriz[k] || { R: c.R, F: c.F, n: 0, valor: 0, compras: 0, lista: [], seg: c.seg };
      m.n++; m.valor += c.valor; m.compras += c.n; m.lista.push(c);
    });
    a.ticket = vals.length ? (ticketFn ? ticketFn(vals) : vals.reduce(function (s, v) { return s + v; }, 0) / vals.length) : null;
    a.nCompras = vals.length;
    a.ciclo = ciclos.length ? mediana(ciclos) : null; a.nCiclo = ciclos.length;
    a.pctAtivos = a.n ? a.ativos / a.n : null;
    return a;
  }

  // ---------- estado e desenho ----------
  var S = { cfg: null, root: null, mode: 'm', mostrar: 'n', seg: '', rep: '', met: 'n', acaoN: 10, info: {}, repSort: { k: 'camp', dir: -1 }, res: null, sig: '', cache: null, ov: { lista: [], titulo: '', sub: '', q: '', sort: 'valor', dir: -1 }, inited: false, opener: null };

  function getRows() { return (S.cfg && S.cfg.getRows && S.cfg.getRows()) || null; }
  function origemAtual() { var o = S.cfg && S.cfg.getOrigin ? S.cfg.getOrigin() : 'both'; return o === 'inbound' || o === 'outbound' ? o : 'both'; }
  function ultimoSync(rows) { var m = null; (rows || []).forEach(function (d) { if (d.synced_at && (!m || d.synced_at > m)) m = d.synced_at; }); return m; }
  function nomeRep(id) { id = String(id); return (S.cfg && S.cfg.reps && S.cfg.reps[id]) || CFG.nomes[id] || ('Responsável ' + id); }
  function ehCampo(id) { return CFG.campo.indexOf(String(id)) >= 0; }
  function ticketFn() { return S.cfg && S.cfg.ticketFn ? S.cfg.ticketFn : null; }

  function calcular() {
    var rows = getRows(); if (!rows) return null;
    var key = rows.length + '|' + ultimoSync(rows) + '|' + origemAtual() + '|' + hojeBRT();
    if (S.cache && S.cache.key === key) return S.cache.res;
    var res = computeRfm(rows, { asOf: hojeBRT(), origem: origemAtual() });
    res.sync = ultimoSync(rows); res.nLinhas = rows.length;
    S.cache = { key: key, res: res };
    return res;
  }
  function filtrada(res, ignora) {
    return res.clientes.filter(function (c) { return (ignora === 'seg' || !S.seg || c.seg === S.seg) && (ignora === 'rep' || !S.rep || c.owner === S.rep); });
  }

  var CSS = [
    '.rf{display:flex;flex-direction:column;gap:8px;font-family:var(--font,Montserrat,sans-serif);color:var(--text,#1a1626);min-width:0}',
    '.rf *{box-sizing:border-box}',
    '.rf button{font-family:inherit}',
    '.rf-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:6px 10px;flex-wrap:wrap}',
    '.rf-ttl{font-size:11px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:var(--faint,#766e90)}',
    '.rf-ttl b{color:var(--purple,#704B9B);font-weight:800}',
    '.rf-st{font-size:11px;font-weight:600;color:var(--muted,#6b6484);text-transform:none;letter-spacing:0}',
    '.rf-st.warn{color:var(--amber,#b45309);font-weight:800}',
    '.rf-nota{font-size:11px;font-weight:600;color:var(--muted,#6b6484);line-height:1.4}',
    '.rf-fil{display:flex;gap:6px;flex-wrap:wrap;align-items:center}',
    '.rf-chip{border:1px solid var(--purple,#704B9B);background:rgba(112,75,155,.08);color:var(--purple,#704B9B);font-size:11px;font-weight:800;padding:5px 10px;border-radius:999px;cursor:pointer;line-height:1.2;min-height:28px;display:inline-flex;align-items:center;gap:6px}',
    '.rf-chip.sec{border-color:var(--border,#eae7f2);background:var(--card,#fff);color:var(--muted,#6b6484)}',
    '.rf-chip.on{background:var(--purple,#704B9B);border-color:var(--purple,#704B9B);color:#fff}',
    '.rf-ks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
    '.rf-k{background:var(--card,#fff);border:1px solid var(--border,#eae7f2);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:2px;min-width:0;cursor:pointer;text-align:left;font:inherit;color:inherit;box-shadow:0 1px 3px rgba(26,22,38,.04),0 4px 14px -6px rgba(26,22,38,.08)}',
    '.rf-k:hover{border-color:var(--purple-l,#8f6ab5)}',
    '.rf-kl{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--faint,#766e90)}',
    '.rf-kv{font-size:22px;font-weight:800;line-height:1.15;font-variant-numeric:proportional-nums;overflow-wrap:anywhere}',
    '.rf-kt{font-size:11px;font-weight:600;color:var(--muted,#6b6484);line-height:1.3}',
    '.rf-k.alerta{background:#fef2f2;border-color:#f3b4b4}.rf-k.alerta .rf-kv{color:#b91c1c}',
    '.rf-body{display:flex;flex-direction:column;gap:8px;min-width:0}',
    '.rf-card{container-type:inline-size;container-name:rfc;background:var(--card,#fff);border:1px solid var(--border,#eae7f2);border-radius:14px;overflow:hidden;min-width:0;display:flex;flex-direction:column;box-shadow:0 1px 3px rgba(26,22,38,.04),0 4px 14px -6px rgba(26,22,38,.08)}',
    '.rf-ch{padding:9px 12px 7px;border-bottom:1px solid var(--border,#eae7f2);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;flex-wrap:wrap}',
    '.rf-ct{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--faint,#766e90)}',
    '.rf-cs{font-size:11px;font-weight:700;color:var(--purple,#704B9B)}',
    '.rf-cb{padding:8px 12px 10px;display:flex;flex-direction:column;gap:6px;min-height:0;flex:1}',
    '.rf-note{font-size:11px;line-height:1.4;color:var(--muted,#6b6484);font-weight:600}',
    '.rf-note b{color:var(--text,#1a1626)}',
    '.rf-empty{padding:14px 10px;text-align:center;color:var(--faint,#766e90);font-size:12px;font-style:italic}',
    '.rf-empty button{font:inherit;margin-top:6px}',
    /* matriz */
    '.rf-mhd{display:flex;align-items:center;justify-content:space-between;gap:6px 10px;flex-wrap:wrap}',
    '.rf-msub{font-size:11px;font-weight:700;color:var(--muted,#6b6484);line-height:1.35;flex:1 1 180px}',
    '.rf-mostrar{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--muted,#6b6484)}',
    '.rf-mostrar select{font:inherit;font-size:12px;font-weight:700;padding:5px 8px;border:1px solid var(--border,#eae7f2);border-radius:8px;background:var(--card,#fff);color:var(--text,#1a1626);min-height:30px}',
    '.rf-mx{display:grid;grid-template-columns:minmax(54px,auto) repeat(5,minmax(0,1fr));gap:4px;align-items:stretch;flex:1;min-height:0}',
    '.rf-mxh{font-size:10px;font-weight:700;color:var(--muted,#6b6484);text-align:center;line-height:1.2;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2px 1px}',
    '.rf-mxh b{font-size:12px;color:var(--text,#1a1626);font-weight:800}',
    '.rf-mxc{align-items:flex-start;text-align:left;font-size:10px;justify-content:flex-end;padding-left:2px}',
    '.rf-mxr{align-items:flex-end;text-align:right;padding-right:4px}',
    '.rf-hs{display:none}',
    '.rf-cel{border:1px solid transparent;border-radius:8px;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:1px;min-height:74px;padding:6px 8px;cursor:pointer;font:inherit;color:var(--text,#1a1626);min-width:0;text-align:left}',
    '.rf-cel:hover,.rf-cel:focus-visible{border-color:var(--purple,#704B9B);outline:none}',
    '.rf-cn{font-size:11px;font-weight:800;line-height:1.15;color:#2b2540}',
    '.rf-cel b{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:19px;font-weight:700;line-height:1.15;font-variant-numeric:tabular-nums;margin-top:2px;white-space:nowrap}',
    '.rf-cel i{font-style:normal;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;font-weight:600;color:#4a4560;line-height:1.15;white-space:nowrap;margin-top:auto}',
    '.rf-cel.vz{cursor:default;background:rgba(184,179,200,.1);color:#9a95ad}.rf-cel.vz .rf-cn{color:#9a95ad;font-weight:700}.rf-cel.vz b{color:#b3aec4}',
    '.rf-lgd{display:none;flex-wrap:wrap;gap:4px 10px;font-size:10.5px;font-weight:700;color:var(--muted,#6b6484)}',
    '.rf-lgd span{display:inline-flex;align-items:center;gap:4px}',
    '.xp .rf-mostrar{display:none}',
    /* segmentos */
    '.rf-sg{display:flex;flex-direction:column;gap:5px}',
    '.rf-sr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;align-items:center;padding:3px 4px;border-radius:8px}',
    '.rf-sr:hover{background:rgba(112,75,155,.06)}',
    '.rf-sr.on{background:rgba(112,75,155,.12);box-shadow:inset 0 0 0 1px var(--purple,#704B9B)}',
    '.rf-sr.off{opacity:.5}',
    '.rf-sn{font-size:12px;font-weight:800;display:flex;align-items:center;gap:6px;min-width:0}',
    '.rf-sb{all:unset;cursor:pointer;display:flex;align-items:center;gap:6px;min-width:0;font:inherit;font-weight:800;overflow-wrap:anywhere}',
    '.rf-sb:focus-visible{outline:2px solid var(--purple,#704B9B);outline-offset:2px;border-radius:4px}',
    '.rf-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;display:inline-block}',
    '.rf-sv{font-size:12px;font-weight:800;font-variant-numeric:tabular-nums;text-align:right}',
    '.rf-sv small{font-size:10px;font-weight:700;color:var(--muted,#6b6484);margin-left:4px}',
    '.rf-bar{grid-column:1/3;height:6px;border-radius:3px;background:rgba(184,179,200,.2);overflow:hidden}',
    '.rf-bar i{display:block;height:100%;border-radius:3px;min-width:2px}',
    '.rf-i{border:1px solid var(--border,#eae7f2);background:var(--card,#fff);color:var(--purple,#704B9B);width:22px;height:22px;border-radius:50%;font-size:12px;font-weight:800;line-height:1;cursor:pointer;padding:0;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center}',
    '.rf-regra{grid-column:1/3;font-size:11px;font-weight:600;line-height:1.35;color:var(--muted,#6b6484);padding:2px 4px 4px 28px}',
    '.rf-regra b{color:var(--text,#1a1626)}',
    '.rf-tog{display:flex;gap:4px}',
    /* tabelas */
    '.rf-tb{width:100%;border-collapse:collapse;font-size:12px}',
    '.rf-tb th{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.3px;color:var(--faint,#766e90);text-align:right;padding:3px 4px;line-height:1.15;vertical-align:bottom;cursor:pointer}',
    '.rf-tb th:first-child,.rf-tb td:first-child{text-align:left}',
    '.rf-tb td{padding:6px 4px;text-align:right;font-variant-numeric:tabular-nums;border-top:1px solid #f4f2f8;font-weight:700}',
    '.rf-tb td:first-child{overflow-wrap:anywhere}',
    '.rf-tb tr[data-rf]{cursor:pointer}.rf-tb tr[data-rf]:hover td{background:#f8f6fc}',
    '.rf-tb tr.on td{background:rgba(112,75,155,.12)}',
    '.rf-tb.pv{table-layout:fixed}.rf-tb.pv th{cursor:default;white-space:normal;text-transform:none;letter-spacing:0;font-size:10px}.rf-tb.pv th:first-child,.rf-tb.pv td:first-child{width:40%}.rf-tb.pv th:not(:first-child),.rf-tb.pv td:not(:first-child){width:20%}',
    '.rf-oc{display:none!important}.xp .rf-oc{display:grid!important}.xp .rf-trim{display:none}',
    '.rf-sub2{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--faint,#766e90);padding:8px 0 2px;border-top:1px dashed var(--border,#eae7f2);margin-top:4px}',
    '.rf-tb.rp{table-layout:fixed}.rf-tb.rp th{cursor:pointer;white-space:normal;overflow-wrap:normal;text-transform:none;letter-spacing:0;font-size:10px}.rf-tb.rp th:first-child,.rf-tb.rp td:first-child{width:34%}.rf-tb.rp th:not(:first-child),.rf-tb.rp td:not(:first-child){width:22%}.rf-tb.rp td:first-child{overflow-wrap:normal}.rf-sub{font-size:10px;font-weight:600;color:var(--muted,#6b6484);white-space:normal;line-height:1.2}',
    '.rf-tb tr.gc td{color:#756f8c;font-weight:600}',
    '.rf-tb td.r{color:#b91c1c}.rf-tb td.p{color:#be185d}.rf-tb td.g{color:#15803d}.rf-tb td.z{color:#9a95ad;font-weight:600}',
    /* linhas de cliente */
    '.rf-lst{display:flex;flex-direction:column}',
    '.rf-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:2px 8px;align-items:start;padding:7px 4px;border-top:1px solid #f4f2f8;text-decoration:none;color:inherit}',
    '.rf-row:first-child{border-top:0}',
    'a.rf-row:hover{background:#f8f6fc}',
    '.rf-pos{font-size:11px;font-weight:800;color:var(--faint,#766e90);min-width:18px;padding-top:2px}',
    '.rf-nm{font-size:13px;font-weight:800;overflow-wrap:anywhere;line-height:1.25}',
    '.rf-mt{font-size:11px;font-weight:600;color:var(--muted,#6b6484);line-height:1.5;overflow-wrap:anywhere}',
    '.rf-vl{font-size:13px;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}',
    '.rf-tag{display:inline-block;font-size:10px;font-weight:800;padding:1px 7px;border-radius:999px;color:#fff;line-height:1.5;white-space:nowrap}',
    '.rf-mov{display:flex;flex-direction:column;gap:2px}',
    '.rf-mv{display:flex;align-items:center;gap:6px;flex-wrap:wrap;border:0;background:transparent;font:inherit;color:inherit;text-align:left;padding:5px 4px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;width:100%}',
    '.rf-mv:hover{background:rgba(112,75,155,.06)}',
    '.rf-mv b{font-variant-numeric:tabular-nums;margin-left:auto}',
    '.rf-resumo{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}',
    '.rf-rs{border:1px solid var(--border,#eae7f2);border-radius:10px;padding:6px 8px;display:flex;flex-direction:column;gap:1px;background:transparent;font:inherit;color:inherit;text-align:left;cursor:pointer;min-width:0}',
    '.rf-rs b{font-size:18px;font-weight:800;line-height:1.15}.rf-rs span{font-size:10px;font-weight:700;color:var(--muted,#6b6484);line-height:1.2}',
    '.rf-rs.up b{color:#15803d}.rf-rs.dn b{color:#b91c1c}',
    /* painel de lista */
    '#rf-ov{display:none;position:fixed;inset:0;background:rgba(26,22,38,.55);z-index:9000;align-items:center;justify-content:center;padding:16px}',
    '#rf-ov.show{display:flex}',
    '#rf-ov .rf-pn{background:var(--card,#fff);color:var(--text,#1a1626);border-radius:16px;width:min(860px,100%);max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);display:flex;flex-direction:column;box-shadow:0 20px 50px -10px rgba(26,22,38,.5);font-family:var(--font,Montserrat,sans-serif);overflow:hidden}',
    '#rf-ov *{box-sizing:border-box}',
    '#rf-ov .rf-ph{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:12px 14px 8px;border-bottom:1px solid var(--border,#eae7f2)}',
    '#rf-ov .rf-pt{font-size:15px;font-weight:800;line-height:1.25;overflow-wrap:anywhere}',
    '#rf-ov .rf-ps{font-size:11px;font-weight:600;color:var(--muted,#6b6484);margin-top:2px;line-height:1.35;overflow-wrap:anywhere}',
    '#rf-ov .rf-x{border:1px solid var(--border,#eae7f2);background:var(--card,#fff);color:var(--muted,#6b6484);width:36px;height:36px;border-radius:10px;font-size:16px;cursor:pointer;flex-shrink:0}',
    '#rf-ov .rf-tools{display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:8px 14px;border-bottom:1px solid var(--border,#eae7f2)}',
    '#rf-ov .rf-tools input{flex:1 1 140px;min-width:0;font:inherit;font-size:13px;padding:7px 10px;border:1px solid var(--border,#eae7f2);border-radius:10px;background:var(--card,#fff);color:inherit}',
    '#rf-ov .rf-ord{display:flex;gap:4px;flex-wrap:wrap;align-items:center;font-size:10px;font-weight:800;color:var(--faint,#766e90);text-transform:uppercase}',
    '#rf-ov .rf-lb{overflow:auto;padding:4px 10px 12px;flex:1;min-height:0;-webkit-overflow-scrolling:touch}',
    '#rf-ov .rf-row{grid-template-columns:minmax(0,1fr) auto}',
    '#rf-ov .rf-pos{display:none}',
    /* telao */
    '.rf.tv{flex:1;min-height:0;gap:8px;overflow:hidden}',
    '.rf.tv .rf-hd{flex-shrink:0;flex-wrap:nowrap;align-items:center}',
    '.rf.tv .rf-nota{flex-shrink:0}',
    '.rf.tv .rf-ks{grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;flex-shrink:0}',
    '.rf.tv .rf-k{padding:8px 12px;min-height:68px;justify-content:center}',
    '.rf.tv .rf-kl{font-size:9.5px}.rf.tv .rf-kv{font-size:22px}.rf.tv .rf-kt{font-size:10.5px}',
    '.rf.tv .rf-body{flex:1;min-height:0;display:block;overflow:hidden}',
    '.rf.tv .rf-pg{height:100%;display:grid;gap:8px;min-height:0}',
    '.rf.tv .rf-pg>.rf-card{min-height:0}',
    '.rf.tv .rf-ch{padding:8px 12px 6px}',
    '.rf.tv .rf-ct,.rf.tv .rf-cs{font-size:10.5px}',
    '.rf.tv .rf-cb{overflow:hidden;padding:8px 12px 10px}',
    '.rf.tv .rf-note,.rf.tv .rf-mt,.rf.tv .rf-regra,.rf.tv .rf-nota,.rf.tv .rf-st,.rf.tv .rf-eixo{font-size:10.5px}',
    '.rf.tv .rf-tb{font-size:11.5px}.rf.tv .rf-tb th{font-size:9.5px}',
    '.rf.tv .rf-chip{font-size:10.5px;min-height:22px;padding:3px 10px}',
    '.rf.tv .rf-ttl{font-size:10.5px}',
    '.rf.tv .rf-cel b{font-size:22px}.rf.tv .rf-cel i{font-size:11px}.rf.tv .rf-cn{font-size:11px}.rf.tv .rf-cel{padding:5px 8px}',
    '.rf.tv .rf-mxh{font-size:10.5px}.rf.tv .rf-mxh b{font-size:12px}.rf.tv .rf-msub,.rf.tv .rf-mostrar{font-size:10.5px}.rf.tv .rf-mostrar select{font-size:11px;min-height:24px}.rf.tv .rf-sub{font-size:10.5px}.rf.tv .rf-sv small{font-size:10.5px}',
    '.rf.tv .rf-cel{min-height:0}',
    '.rf.tv .rf-sn,.rf.tv .rf-sv{font-size:11.5px}',
    '.rf.tv .rf-nm{font-size:12.5px}.rf.tv .rf-vl{font-size:12.5px}',
    '.rf.tv .rf-row{padding:5px 4px}',
    '.rf.tv .rf-i{width:20px;height:20px;font-size:11px}',
    '.rf.tv .rf-tag{font-size:9.5px}',
    '.rf.tv .rf-rs b{font-size:17px}.rf.tv .rf-rs span{font-size:10.5px}',
    '.rf.tv .rf-pg1{grid-template-columns:minmax(0,1.15fr) minmax(0,1fr)}',
    '.rf.tv .rf-pg2{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)}',
    '.rf.tv .rf-pg3{grid-template-columns:repeat(2,minmax(0,1fr))}',
    '.rf.tv .rf-pg4{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)}',
    '.rf.tv .rf-pg3,.rf.tv .rf-pg4{display:none}', // 04/11 (Robert: nada de página desnecessária): no telão só 2 páginas (matriz+segmentos e ação). Movimento, prova e método ficam no celular/PC.
    '.rf.tv .rf-pg4 #rf-c-rg .rf-lst{display:block;column-count:2;column-gap:16px}.rf.tv .rf-pg4 #rf-c-rg .rf-row{break-inside:avoid}',
    /* celular / PC: colunas que se completam */
    '@media (min-width:700px){.rf.m .rf-ks{grid-template-columns:repeat(3,minmax(0,1fr))}.rf.m .rf-body{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}}',
    '@media (min-width:1100px){.rf.m .rf-ks{grid-template-columns:repeat(6,minmax(0,1fr))}}',
    '@container rfc (max-width:520px){.rf-hl{display:none}.rf-hs{display:inline}.rf-mx{grid-template-columns:minmax(34px,auto) repeat(5,minmax(0,1fr));gap:3px}.rf-cn{display:none}.rf-lgd{display:flex}.rf-cel{min-height:50px;padding:4px 2px;align-items:center;justify-content:center;text-align:center}.rf-cel b{font-size:14px;margin-top:0}.rf-cel i{font-size:10px;margin-top:0}.rf-mxh b{font-size:11px}.rf-mxh{font-size:10px}}',
    '@container rfc (max-width:300px){.rf-cel b{font-size:12px}.rf-cel i{font-size:10px}}',
    '@media (max-width:370px){.rf-cb{padding-left:9px;padding-right:9px}.rf-kv{font-size:20px}}'
  ].join('\n');

  function injetaCss() {
    if (document.getElementById('rf-css')) return;
    var st = document.createElement('style'); st.id = 'rf-css'; st.textContent = CSS; document.head.appendChild(st);
  }

  function card(titulo, sub, corpo, o) {
    o = o || {};
    return '<div class="rf-card"' + (o.id ? ' id="' + o.id + '"' : '') + '><div class="rf-ch"><span class="rf-ct">' + esc(titulo) + '</span>' + (sub ? '<span class="rf-cs">' + esc(sub) + '</span>' : '') + '</div><div class="rf-cb">' + corpo + '</div></div>';
  }
  function tag(seg) { var s = SEG[seg]; return '<span class="rf-tag" style="background:' + s.c + '">' + esc(s.n) + '</span>'; }

  // ----- pedacos -----
  function htmlKpis(ag) {
    var k = [];
    var pct = ag.pctAtivos == null ? '—' : nf(ag.pctAtivos * 100, 0) + '%';
    k.push(['all', 'Clientes na carteira', nf(ag.n), 'compraram ao menos 1 vez']);
    k.push(['ativos', 'Ativos', pct, nf(ag.ativos) + ' compraram há até ' + CFG.ativoDias + ' dias']);
    k.push(['all', 'Receita comprada', brl(ag.receita), nf(ag.nCompras) + ' compras (dias com pedido)']);
    k.push(['risco', 'Receita em risco', brl(ag.risco.valor), nf(ag.risco.n) + ' clientes Em risco ou Não pode perder', ag.risco.n ? 'alerta' : '']);
    k.push(['all', 'Ticket médio', ag.ticket == null ? '—' : brl(ag.ticket), 'por pedido, sem valores atípicos']);
    k.push(['ciclo', 'Ciclo de recompra', ag.ciclo == null ? '—' : nf(Math.round(ag.ciclo)) + ' dias', ag.nCiclo ? 'mediana de ' + nf(ag.nCiclo) + ' que recompraram' : 'ninguém recomprou ainda']);
    return '<div class="rf-ks">' + k.map(function (x) {
      return '<button type="button" class="rf-k ' + (x[4] || '') + '" data-rf="kpi:' + x[0] + '"><span class="rf-kl">' + esc(x[1]) + '</span><span class="rf-kv">' + esc(x[2]) + '</span><span class="rf-kt">' + esc(x[3]) + '</span></button>';
    }).join('') + '</div>';
  }

  var RLAB = { 1: ['+151', '+151 dias'], 2: ['121–150', '121–150 dias'], 3: ['91–120', '91–120 dias'], 4: ['61–90', '61–90 dias'], 5: ['0–60', '0–60 dias'] };
  var FLAB = { 5: ['5+', '5+ compras'], 4: ['4', '4 compras'], 3: ['3', '3 compras'], 2: ['2', '2 compras'], 1: ['1', '1 compra'] };
  var MOSTRAR = [['n', 'nº de clientes'], ['v', 'receita (R$)'], ['t', 'ticket médio'], ['p', '% da carteira']];
  function valorCel(m, tot) {
    return S.mostrar === 'v' ? m.valor : S.mostrar === 't' ? (m.compras ? m.valor / m.compras : 0) : S.mostrar === 'p' ? (tot ? m.n / tot : 0) : m.n;
  }
  function brlC(v) {
    v = Math.round(v);
    if (v >= 1000000) { var m = v / 1000000; return nf(m, m >= 100 ? 0 : m >= 10 ? 1 : 2) + 'M'; }
    if (v >= 1000) { var k = v / 1000; return nf(k, k >= 100 ? 0 : k >= 10 ? 1 : 2) + 'k'; }
    return nf(v, 0);
  }
  // [numero grande longo, numero grande curto, linha de baixo longa, linha de baixo curta]; curto = celula estreita (29,5k = 29,5 mil; 2,48M = 2,48 milhoes)
  function textoCel(m, tot) {
    var v = valorCel(m, tot), cl = nf(m.n) + (m.n === 1 ? ' cliente' : ' clientes');
    if (S.mostrar === 'v' || S.mostrar === 't') return [brlM(v), brlC(v), cl, nf(m.n)];
    if (S.mostrar === 'p') { var p = nf(v * 100, v * 100 < 10 ? 1 : 0) + '%'; return [p, p, brlM(m.valor), brlC(m.valor)]; }
    return [nf(m.n), nf(m.n), brlM(m.valor), brlC(m.valor)];
  }
  function dataHojeBR(res) { return dmy(res.asOf); }
  function htmlMatriz(res, ag) {
    var max = 0, tot = ag.n; Object.keys(ag.matriz).forEach(function (k) { var v = valorCel(ag.matriz[k], tot); if (v > max) max = v; });
    var sel = '<label class="rf-mostrar">Mostrar <select data-rf-sel="mostrar" aria-label="Mostrar na matriz">' + MOSTRAR.map(function (o) { return '<option value="' + o[0] + '"' + (S.mostrar === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>';
    var h = '<div class="rf-mhd"><span class="rf-msub">Só Agendor: Arena, Pós-venda e Reativação, sem SDR. Não compare com a matriz do ERP.</span>' + sel + '</div>';
    h += '<div class="rf-mx" role="group" aria-label="Matriz de frequência por recência">';
    h += '<div class="rf-mxh rf-mxc"><span>Frequência ↓</span><span>Recência →</span></div>';
    for (var r = 1; r <= 5; r++) h += '<div class="rf-mxh"><b>R' + r + '</b><span class="rf-hl">' + RLAB[r][1] + '</span><span class="rf-hs">' + RLAB[r][0] + '</span></div>';
    for (var f = 5; f >= 1; f--) {
      h += '<div class="rf-mxh rf-mxr"><b>F' + f + '</b><span class="rf-hl">' + FLAB[f][1] + '</span><span class="rf-hs">' + FLAB[f][0] + '</span></div>';
      for (var g = 1; g <= 5; g++) {
        var sg = segmentoDe(f, g), m = ag.matriz[f + '|' + g], nome = SEG[sg].n;
        if (!m) { h += '<div class="rf-cel vz" aria-label="' + esc(nome) + ', F' + f + ' R' + g + ': nenhum cliente"><span class="rf-cn">' + esc(nome) + '</span><b>–</b></div>'; continue; }
        var al = 0.16 + 0.46 * (max ? valorCel(m, tot) / max : 0), tx = textoCel(m, tot);
        h += '<button type="button" class="rf-cel" data-rf="cel:' + f + ':' + g + '" style="background:' + rgba(SEG[sg].c, al) + '" aria-label="' + esc(nome) + ', F' + f + ' R' + g + ': ' + m.n + ' clientes, ' + esc(brl(m.valor)) + '"><span class="rf-cn">' + esc(nome) + '</span><b><span class="rf-hl">' + esc(tx[0]) + '</span><span class="rf-hs">' + esc(tx[1]) + '</span></b><i><span class="rf-hl">' + esc(tx[2]) + '</span><span class="rf-hs">' + esc(tx[3]) + '</span></i></button>';
      }
    }
    h += '</div>';
    h += '<div class="rf-lgd" aria-label="Cores dos segmentos">' + SEGS.map(function (s) { return '<span><i class="rf-dot" style="background:' + s.c + '"></i>' + esc(s.n) + '</span>'; }).join('') + '<span class="rf-lgk">k = mil, M = milhão</span></div>';
    h += '<div class="rf-note">Compra = dia com pedido ganho para o cliente (vários negócios no mesmo dia contam como uma compra). Dias contados até ' + dataHojeBR(res) + '. Só Agendor. Clique numa célula para ver os clientes.</div>';
    return h;
  }

  function htmlSegmentos(agSeg) {
    var tot = agSeg.n || 1, maxV = 1, maxN = 1;
    SEGS.forEach(function (s) { var b = agSeg.bySeg[s.k]; if (b.valor > maxV) maxV = b.valor; if (b.n > maxN) maxN = b.n; });
    var h = '<div class="rf-tog" role="group" aria-label="Medir por"><button type="button" class="rf-chip sec' + (S.met === 'n' ? ' on' : '') + '" data-rf="met:n">Clientes</button><button type="button" class="rf-chip sec' + (S.met === 'v' ? ' on' : '') + '" data-rf="met:v">Receita</button></div>';
    h += '<div class="rf-sg">';
    SEGS.forEach(function (s) {
      var b = agSeg.bySeg[s.k], on = S.seg === s.k, off = S.seg && !on;
      var w = S.met === 'n' ? b.n / maxN : b.valor / maxV;
      h += '<div class="rf-sr' + (on ? ' on' : '') + (off ? ' off' : '') + '">' +
        '<div class="rf-sn"><button type="button" class="rf-i" data-rf="info:' + s.k + '" aria-label="Regra de ' + esc(s.n) + '" aria-expanded="' + (!!S.info[s.k]) + '">ⓘ</button>' +
        '<button type="button" class="rf-sb" data-rf="seg:' + s.k + '" aria-pressed="' + on + '"><span class="rf-dot" style="background:' + s.c + '"></span><span>' + esc(s.n) + '</span></button></div>' +
        '<div class="rf-sv">' + nf(b.n) + '<small>' + nf(b.n / tot * 100, 0) + '% · ' + esc(brlK(b.valor)) + '</small></div>' +
        '<div class="rf-bar"><i style="width:' + ((b.n || b.valor) ? Math.max(2, Math.round(w * 100)) : 0) + '%;background:' + s.c + '"></i></div>' +
        (S.info[s.k] ? '<div class="rf-regra"><b>Regra:</b> ' + esc(s.regra) + '<br><b>O que fazer:</b> ' + esc(s.acao) + '</div>' : '') +
        '</div>';
    });
    h += '</div>';
    h += '<div class="rf-note">Clique no nome para filtrar a aba toda. Clique no ⓘ para ver a regra. Valores em R$.</div>';
    return h;
  }

  function linhaCliente(c, i) {
    var meta = [];
    meta.push('última compra ' + dm(c.ultima) + ' (há ' + nf(c.dias) + ' d)');
    meta.push(nf(c.n) + (c.n === 1 ? ' compra' : ' compras'));
    if (c.cicloProprio != null) meta.push('ciclo ' + nf(Math.round(c.ciclo)) + ' d');
    meta.push(nomeRep(c.owner));
    return '<a class="rf-row" href="' + CFG.urlNegocio + c.ultimoId + '" target="_blank" rel="noopener"><span class="rf-pos">' + (i != null ? (i + 1) : '') + '</span><div><div class="rf-nm">' + esc(c.nome) + '</div><div class="rf-mt">' + tag(c.seg) + ' ' + esc(meta.join(' · ')) + '</div></div><span class="rf-vl">' + esc(brl(c.valor)) + '</span></a>';
  }

  function listaAcao(lista) {
    var base, titulo;
    if (S.seg) { base = lista.slice(); titulo = SEG[S.seg].n; }
    else { base = lista.filter(function (c) { return RISCO[c.seg]; }); titulo = 'Em risco e Não pode perder'; }
    base.sort(function (a, b) { return b.valor - a.valor; });
    return { base: base, titulo: titulo };
  }
  function htmlAcao(lista) {
    var la = listaAcao(lista), top = la.base.slice(0, S.acaoN);
    var h = '<div class="rf-fil" role="group" aria-label="Quantos clientes mostrar">' + [5, 10, 20].map(function (n) { return '<button type="button" class="rf-chip sec' + (S.acaoN === n ? ' on' : '') + '" data-rf="acaoN:' + n + '">' + n + '</button>'; }).join('') + '<button type="button" class="rf-chip" data-rf="acaoTodos">Ver os ' + nf(la.base.length) + '</button></div>';
    if (!top.length && S.seg) return h + '<div class="rf-empty">Nenhum cliente neste segmento.</div>';
    h += '<div class="rf-lst">' + top.map(function (c, i) { return linhaCliente(c, i); }).join('') + '</div>';
    if (!top.length) h += '<div class="rf-empty">Nenhum cliente Em risco ou Não pode perder agora (esses segmentos pedem 3 ou mais compras).</div>';
    if (!S.seg && top.length < S.acaoN) {
      var viga = lista.filter(function (c) { return c.seg === 'atencao' || c.seg === 'dormir' || c.seg === 'hibernando'; }).sort(function (a, b) { return b.valor - a.valor; }).slice(0, S.acaoN - top.length);
      if (viga.length) h += '<div class="rf-sub2">Para vigiar: Precisam de atenção, Quase dormindo e Hibernando, os maiores</div><div class="rf-lst">' + viga.map(function (c, i) { return linhaCliente(c, top.length + i); }).join('') + '</div>';
    }
    h += '<div class="rf-note">Maior valor já comprado primeiro. Toque no cliente para abrir o negócio no Agendor.</div>';
    return h;
  }

  function repsDados(res) {
    var lista = filtrada(res, 'rep'), por = {}, outros = 0;
    function vazio(id) { return { id: id, n: 0, camp: 0, risco: 0, npp: 0, valor: 0, valorRisco: 0 }; }
    lista.forEach(function (c) {
      var id = c.owner;
      if (!ehCampo(id) && id !== CFG.grandes) { outros++; return; }
      var r = por[id] = por[id] || vazio(id);
      r.n++; r.valor += c.valor;
      if (c.seg === 'campeoes') r.camp++;
      if (c.seg === 'risco') r.risco++;
      if (c.seg === 'naoperder') r.npp++;
      if (RISCO[c.seg]) r.valorRisco += c.valor;
    });
    var rows = CFG.campo.map(function (id) { return por[id] || vazio(id); });
    var k = S.repSort.k, dir = S.repSort.dir;
    rows.sort(function (a, b) { var d = (a[k] - b[k]) * dir; if (d) return d; return (b.n - a.n) || (b.valor - a.valor) || (a.id < b.id ? -1 : 1); });
    return { rows: rows, gc: por[CFG.grandes] || vazio(CFG.grandes), outros: outros };
  }
  function htmlReps(res) {
    var d = repsDados(res);
    function th(k, t) { return '<th data-rf="rsort:' + k + '" aria-sort="' + (S.repSort.k === k ? (S.repSort.dir === -1 ? 'descending' : 'ascending') : 'none') + '">' + t + (S.repSort.k === k ? (S.repSort.dir === -1 ? ' ▼' : ' ▲') : '') + '</th>'; }
    function tr(r, gc) {
      var on = S.rep === r.id;
      return '<tr data-rf="rep:' + r.id + '" class="' + (on ? 'on ' : '') + (gc ? 'gc' : '') + '"><td>' + esc(nomeRep(r.id)) + '<div class="rf-sub">' + (r.valorRisco ? esc(brl(r.valorRisco)) + ' em risco' : 'sem valor em risco') + '</div></td><td>' + nf(r.n) + '</td><td class="' + (r.camp ? 'g' : 'z') + '">' + nf(r.camp) + '</td><td class="' + (r.risco ? 'r' : 'z') + '">' + nf(r.risco) + '</td><td class="' + (r.npp ? 'p' : 'z') + '">' + nf(r.npp) + '</td></tr>';
    }
    var h = '<table class="rf-tb rp"><thead><tr><th data-rf="rsort:n" style="text-align:left">Rep.</th>' + th('n', 'Clientes') + th('camp', 'Campeões') + th('risco', 'Em risco') + th('npp', 'Não pode perder') + '</tr></thead><tbody>' +
      d.rows.map(function (r) { return tr(r, false); }).join('') + tr(d.gc, true) + '</tbody></table>';
    h += '<div class="rf-note">Os 8 representantes de campo; Grandes Contas por último, fora da comparação. Clique numa linha para filtrar a aba por representante.' + (d.outros ? ' ' + nf(d.outros) + ' clientes ficam com outro responsável (Felipe ou ex-time) e só aparecem nos totais.' : '') + '</div>';
    return h;
  }

  function htmlMov(res) {
    var m = res.mov;
    if (m.semBase) return '<div class="rf-empty">Ainda não há carteira de ' + nf(m.dias) + ' dias atrás para comparar.</div>';
    var lista = filtrada(res), ids = {}; lista.forEach(function (c) { ids[c.id] = 1; });
    function so(a) { return a.filter(function (c) { return ids[c.id]; }); }
    var up = so(m.subiram), dn = so(m.desceram), nv = so(m.novos), ig = so(m.iguais);
    var h = '<div class="rf-resumo">' +
      '<button type="button" class="rf-rs up" data-rf="movl:subiram"><b>' + nf(up.length) + '</b><span>melhoraram de segmento</span></button>' +
      '<button type="button" class="rf-rs dn" data-rf="movl:desceram"><b>' + nf(dn.length) + '</b><span>pioraram</span></button>' +
      '<button type="button" class="rf-rs" data-rf="movl:novos"><b>' + nf(nv.length) + '</b><span>entraram na carteira</span></button></div>';
    var fl = m.lista.map(function (f, idx) { return { f: f, idx: idx, l: so(f.lista) }; }).filter(function (x) { return x.l.length; });
    h += '<div class="rf-mov">' + (fl.length ? fl.slice(0, 5).map(function (x) {
      return '<button type="button" class="rf-mv" data-rf="fluxo:' + x.idx + '">' + tag(x.f.de) + ' <span>→</span> ' + tag(x.f.para) + '<b>' + nf(x.l.length) + '</b></button>';
    }).join('') : '<div class="rf-empty">Ninguém mudou de segmento neste filtro.</div>') + '</div>';
    h += '<div class="rf-note">Comparado com a carteira de ' + dmy(m.de) + ' (' + nf(m.dias) + ' dias atrás). ' + nf(ig.length) + ' ficaram no mesmo segmento. As notas são relativas à carteira de cada dia, então parte do movimento é só a régua mudando.</div>';
    return h;
  }

  function htmlProva(res) {
    var p = res.prova;
    if (!p.n) return '<div class="rf-empty">Ainda não há carteira de ' + nf(p.dias) + ' dias atrás para testar.</div>';
    var base = p.tot.n ? p.tot.rec / p.tot.n : 0;
    var h = '<table class="rf-tb pv"><thead><tr><th style="text-align:left;cursor:default">Segmento há ' + nf(p.dias) + ' dias</th><th style="cursor:default">Clientes</th><th style="cursor:default">Recompraram</th><th style="cursor:default">%</th></tr></thead><tbody>';
    SEGS.forEach(function (s) {
      var g = p.porSeg[s.k]; if (!g.n) return;
      h += '<tr data-rf="prova:' + s.k + '"><td><span class="rf-dot" style="background:' + s.c + ';margin-right:6px"></span>' + esc(s.n) + '</td><td>' + nf(g.n) + '</td><td>' + nf(g.rec) + '</td><td>' + nf(g.rec / g.n * 100, 0) + '%</td></tr>';
    });
    h += '<tr><td><b>Carteira toda</b></td><td>' + nf(p.tot.n) + '</td><td>' + nf(p.tot.rec) + '</td><td>' + nf(base * 100, 0) + '%</td></tr></tbody></table>';
    h += '<div class="rf-note">Retrato de ' + dmy(p.de) + ' contra quem comprou de novo até ' + dmy(p.ate) + '. ' + (p.n < 60 ? '<b>Amostra pequena (' + nf(p.n) + ' clientes): leia como tendência, não como prova.</b> ' : '') + 'Se a régua funciona, Campeões e Leais recompram mais que Em risco e Perdidos.</div>';
    return h;
  }

  function htmlRegras() {
    return '<div class="rf-lst">' + SEGS.map(function (s) {
      return '<div class="rf-row" style="grid-template-columns:auto minmax(0,1fr)"><span class="rf-dot" style="background:' + s.c + ';margin-top:4px"></span><div><div class="rf-nm">' + esc(s.n) + '</div><div class="rf-mt">' + esc(s.regra) + ' <b>Fazer:</b> ' + esc(s.acao) + '</div></div></div>';
    }).join('') + '</div>';
  }
  function htmlMetodo(res) {
    return '<div class="rf-note"><p style="margin:0 0 5px"><b>Só Agendor.</b> Clientes com ganho nos funis Arena, Pós-venda ou Reativação +75, sem SDR e sem Yanmei. A matriz geral do ERP tem mais vendas e números maiores: não compare.</p>' +
      '<p style="margin:0 0 5px"><b>Quem é cliente.</b> A tabela não tem CNPJ: a reposição é ligada ao negócio original pelo elo "negócio anterior" e a reativação pelo nome.</p>' +
      '<p style="margin:0 0 5px"><b>Compra</b> = dia com pedido ganho para o cliente. Vários negócios no mesmo dia contam como uma compra.</p>' +
      '<p style="margin:0 0 5px"><b>Recência (colunas)</b> = dias desde a última compra, em faixas fixas: R5 até 60, R4 61 a 90, R3 91 a 120, R2 121 a 150, R1 151 ou mais.</p>' +
      '<p style="margin:0 0 5px"><b>Frequência (linhas)</b> = número de compras: F1 uma, F2 duas, F3 três, F4 quatro, F5 cinco ou mais.</p>' +
      '<p style="margin:0 0 5px"><b>Segmento</b> = cada célula tem o seu (nome no topo da célula). O dinheiro não é eixo: aparece em R$ na célula e nos KPIs.</p>' +
      '<p style="margin:0"><b>Filtros.</b> A origem do topo vale (pela origem da primeira compra). O período não se aplica: é a foto de hoje (' + dataHojeBR(res) + '). Datas pela data real do evento, nunca pela data do ganho.</p></div>';
  }

  function rotuloFiltro() {
    var t = [];
    if (S.seg) t.push(SEG[S.seg].n);
    if (S.rep) t.push(nomeRep(S.rep));
    return t;
  }

  function htmlTopo(res, ag) {
    var tv = S.mode === 't';
    var sync = res.sync, atraso = sync ? (Date.now() - Date.parse(sync)) / 60000 : null;
    var st = sync ? 'Agendor sincronizado às ' + hhmmBRT(sync) + (atraso > CFG.atrasoSyncMin ? ' (atrasado)' : '') : 'sem horário de sincronização';
    var errMsg = S.cfg.getErr ? S.cfg.getErr() : null;
    var fil = rotuloFiltro();
    var h = '<div class="rf-hd"><div class="rf-ttl">RFM · carteira de clientes · <b>só Agendor</b> <span class="rf-st' + (atraso > CFG.atrasoSyncMin || errMsg ? ' warn' : '') + '">· ' + esc(st) + (errMsg ? ' · última atualização falhou' : '') + '</span></div>' +
      '<div class="rf-fil">' + fil.map(function (t) { return '<span class="rf-chip">' + esc(t) + '</span>'; }).join('') + (fil.length ? '<button type="button" class="rf-chip sec" data-rf="limpa">Limpar filtro ✕</button>' : '') + '</div></div>';
    h += '<div class="rf-nota">' + (tv ? 'Foto de hoje' : 'Foto da carteira de hoje (o período do topo não se aplica)') + ' · origem: ' + esc({ both: 'Ambos', inbound: 'Inbound', outbound: 'Outbound' }[origemAtual()]) + ' · Arena, Pós-venda e Reativação +75, sem SDR · ' + nf(res.clientes.length) + ' clientes' + (fil.length ? ', ' + nf(ag.n) + ' no filtro' : '') + '</div>';
    return h;
  }

  function msgEstado(txt, botao) {
    return '<div class="rf-empty">' + txt + (botao ? '<br><button type="button" class="rf-chip" data-rf="retry">Tentar de novo</button>' : '') + '</div>';
  }

  function draw() {
    var root = S.root; if (!root) return;
    var rows = getRows();
    if (!rows) {
      var e0 = S.cfg.getErr ? S.cfg.getErr() : null;
      root.innerHTML = e0 ? msgEstado('Não consegui ler os negócios agora. Tente de novo em instantes.', true) : msgEstado('Carregando a carteira de clientes…');
      return;
    }
    var res = calcular();
    S.res = res;
    var tv = S.mode === 't';
    var lista = filtrada(res), ag = agregar(lista, ticketFn());
    if (!res.clientes.length) {
      root.innerHTML = htmlTopo(res, ag) + msgEstado('Nenhum cliente com compra na origem escolhida.');
      return;
    }
    var topo = htmlTopo(res, ag), kpis = htmlKpis(ag);
    if (!lista.length) { root.innerHTML = topo + kpis + msgEstado('Nenhum cliente neste filtro.<br><button type="button" class="rf-chip" data-rf="limpa">Limpar filtro</button>'); return; }
    var agSeg = agregar(filtrada(res, 'seg'), null);       // barras de segmento ignoram o filtro de segmento
    var cMx = card('Recência × Frequência · só Agendor', 'clique numa célula', htmlMatriz(res, ag), { id: 'rf-c-mx' });
    var cSg = card('Segmentos', S.met === 'n' ? 'por clientes' : 'por receita', htmlSegmentos(agSeg), { id: 'rf-c-sg' });
    var cAc = S.seg ? card('Clientes: ' + SEG[S.seg].n, 'maior valor primeiro', htmlAcao(lista), { id: 'rf-c-ac' }) : card('Ligar hoje', 'Em risco e Não pode perder', htmlAcao(lista), { id: 'rf-c-ac' });
    var cRp = card('Representantes', 'carteira de cada um', htmlReps(res), { id: 'rf-c-rp' });
    var cMv = card('Movimento entre segmentos', 'hoje contra ' + CFG.movDias + ' dias atrás', htmlMov(res), { id: 'rf-c-mv' });
    var cPv = card('Prova: quem recomprou', 'retrato de ' + CFG.provaDias + ' dias atrás', htmlProva(res), { id: 'rf-c-pv' });
    var cRg = card('Regra de cada segmento', 'e o que fazer', htmlRegras(), { id: 'rf-c-rg' });
    var cMt = card('Como ler', 'método', htmlMetodo(res), { id: 'rf-c-mt' });
    var corpo;
    if (tv) {
      corpo = '<div class="rf-body">' +
        '<div class="rf-pg rf-pg1" data-pg="1">' + cMx + cSg + '</div>' +
        '<div class="rf-pg rf-pg2" data-pg="2">' + cAc + cRp + '</div>' +
        '<div class="rf-pg rf-pg3" data-pg="3">' + cMv + cPv + '</div>' +
        '<div class="rf-pg rf-pg4" data-pg="4">' + cRg + cMt + '</div></div>';
    } else {
      corpo = '<div class="rf-body">' + cMx + cSg + cAc + cRp + cMv + cPv + cRg + cMt + '</div>';
    }
    root.innerHTML = topo + kpis + corpo;
    if (tv) fitLista();
  }

  // Telão não rola: se a lista de ação não cabe, esconde as últimas linhas (continuam no ⤢ expandido e em "Ver os N").
  function fitLista() {
    var root = S.root, cb = root && root.querySelector('#rf-c-ac .rf-cb'); if (!cb || !cb.clientHeight) return;
    var rows = [].slice.call(cb.querySelectorAll('a.rf-row')), i;
    rows.forEach(function (r) { r.classList.remove('rf-oc'); });
    var nt = cb.querySelector('.rf-trim'); if (nt) nt.parentNode.removeChild(nt);
    var sub = cb.querySelector('.rf-sub2'); if (sub) sub.classList.remove('rf-oc');
    var oc = 0, nota = cb.querySelector('.rf-note:not(.rf-trim)'); if (nota) nota.classList.remove('rf-oc');
    if (nota && cb.scrollHeight > cb.clientHeight + 1) nota.classList.add('rf-oc');
    for (i = rows.length - 1; i >= 0 && cb.scrollHeight > cb.clientHeight + 1; i--) { rows[i].classList.add('rf-oc'); oc++; }
    if (sub && sub.nextElementSibling && !sub.nextElementSibling.querySelector('a.rf-row:not(.rf-oc)')) sub.classList.add('rf-oc');
    if (oc) { var n = document.createElement('div'); n.className = 'rf-note rf-trim'; n.textContent = 'Mostrando ' + (rows.length - oc) + ' de ' + rows.length + '. Clique em ⤢ ou em "Ver os" para ver todos.'; cb.appendChild(n); while (cb.scrollHeight > cb.clientHeight + 1 && i >= 0) { rows[i].classList.add('rf-oc'); i--; } }
  }

  // ---------- painel de lista (clicavel) ----------
  var ORDS = [['valor', 'Valor'], ['ultima', 'Última compra'], ['atraso', 'Atraso'], ['n', 'Compras'], ['nome', 'Nome'], ['rep', 'Rep.']];
  function ensureOv() {
    var o = document.getElementById('rf-ov'); if (o) return o;
    o = document.createElement('div'); o.id = 'rf-ov'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'rf-pt');
    o.innerHTML = '<div class="rf-pn"><div class="rf-ph"><div><div class="rf-pt" id="rf-pt"></div><div class="rf-ps" id="rf-ps"></div></div><button type="button" class="rf-x" id="rf-x" aria-label="Fechar">✕</button></div>' +
      '<div class="rf-tools"><input type="search" id="rf-q" placeholder="Buscar cliente ou representante" aria-label="Buscar cliente ou representante" autocomplete="off"><div class="rf-ord" id="rf-ord"></div></div><div class="rf-lb" id="rf-lb"></div></div>';
    document.documentElement.appendChild(o);   // fora do <body>: o celular aplica zoom 1,08 no body e o painel estourava a tela
    o.addEventListener('click', function (e) {
      if (e.target === o || e.target.closest('#rf-x')) return fechaOv();
      var b = e.target.closest('[data-rfo]'); if (b) { var k = b.getAttribute('data-rfo'); if (S.ov.sort === k) S.ov.dir = -S.ov.dir; else { S.ov.sort = k; S.ov.dir = (k === 'nome' || k === 'rep') ? 1 : -1; } desenhaOv(); }
    });
    o.querySelector('#rf-q').addEventListener('input', function (e) { S.ov.q = e.target.value; desenhaOv(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && o.classList.contains('show')) { e.stopPropagation(); fechaOv(); } }, true);
    return o;
  }
  function valorOrd(c, k) { return k === 'valor' ? c.valor : k === 'ultima' ? utc(c.ultima) : k === 'atraso' ? c.dias : k === 'n' ? c.n : k === 'nome' ? norm(c.nome) : norm(nomeRep(c.owner)); }
  function desenhaOv() {
    var o = ensureOv(), L = S.ov, q = norm(L.q);
    var itens = L.lista.filter(function (c) { return !q || norm(c.nome + ' ' + nomeRep(c.owner) + ' ' + SEG[c.seg].n).indexOf(q) >= 0; });
    itens.sort(function (a, b) { var x = valorOrd(a, L.sort), y = valorOrd(b, L.sort); return (x < y ? -1 : x > y ? 1 : 0) * L.dir; });
    o.querySelector('#rf-pt').textContent = L.titulo + ' · ' + nf(itens.length) + (q ? ' de ' + nf(L.lista.length) : '');
    var tot = itens.reduce(function (s, c) { return s + c.valor; }, 0);
    o.querySelector('#rf-ps').textContent = L.sub + (itens.length ? ' · ' + brl(tot) + ' comprados no total' : '');
    o.querySelector('#rf-ord').innerHTML = '<span>Ordenar:</span>' + ORDS.map(function (x) { return '<button type="button" class="rf-chip sec' + (L.sort === x[0] ? ' on' : '') + '" data-rfo="' + x[0] + '">' + x[1] + (L.sort === x[0] ? (L.dir === -1 ? ' ▼' : ' ▲') : '') + '</button>'; }).join('');
    o.querySelector('#rf-lb').innerHTML = itens.length ? '<div class="rf-lst">' + itens.map(function (c) { return linhaCliente(c, null); }).join('') + '</div>' : '<div class="rf-empty">Nenhum cliente encontrado.</div>';
  }
  function abreOv(titulo, sub, lista, sort) {
    var o = ensureOv();
    S.ov = { lista: lista.slice(), titulo: titulo, sub: sub || '', q: '', sort: sort || 'valor', dir: -1 };
    o.querySelector('#rf-q').value = '';
    desenhaOv();
    S.opener = document.activeElement;
    o.classList.add('show');
    var x = o.querySelector('#rf-x'); if (x) x.focus({ preventScroll: true });
    o.querySelector('#rf-lb').scrollTop = 0;
  }
  function fechaOv() {
    var o = document.getElementById('rf-ov'); if (!o) return;
    o.classList.remove('show');
    try { if (S.opener && document.contains(S.opener)) S.opener.focus({ preventScroll: true }); } catch (e) {}
  }

  // ---------- cliques ----------
  function onClick(ev) {
    var t = ev.target.closest('[data-rf]'); if (!t || !S.res) return;
    var a = t.getAttribute('data-rf').split(':'), k = a[0], v = a[1];
    var res = S.res, lista = filtrada(res);
    function rerender() { S.sig = ''; draw(); }
    if (k === 'retry') { if (S.cfg.retry) S.cfg.retry(); return; }
    if (k === 'limpa') { S.seg = ''; S.rep = ''; return rerender(); }
    if (k === 'seg') { S.seg = S.seg === v ? '' : v; return rerender(); }
    if (k === 'rep') { S.rep = S.rep === v ? '' : v; return rerender(); }
    if (k === 'met') { S.met = v; return rerender(); }
    if (k === 'info') { S.info[v] = !S.info[v]; return rerender(); }
    if (k === 'acaoN') { S.acaoN = +v; return rerender(); }
    if (k === 'acaoTodos') { var la = listaAcao(lista); return abreOv(la.titulo, 'maior valor já comprado primeiro', la.base, 'valor'); }
    if (k === 'rsort') { if (S.repSort.k === v) S.repSort.dir = -S.repSort.dir; else S.repSort = { k: v, dir: -1 }; return rerender(); }
    if (k === 'cel') {
      var m = agregar(lista, null).matriz[v + '|' + a[2]]; if (!m) return;
      return abreOv(SEG[segmentoDe(+v, +a[2])].n + ' · F' + v + ' (' + FLAB[v][1] + ') e R' + a[2] + ' (' + RLAB[a[2]][1] + ')', 'só Agendor' + (S.seg || S.rep ? ' · filtro: ' + rotuloFiltro().join(' · ') : ''), m.lista, 'valor');
    }
    if (k === 'kpi') {
      if (v === 'ativos') return abreOv('Clientes ativos', 'compraram há até ' + CFG.ativoDias + ' dias', lista.filter(function (c) { return c.dias <= CFG.ativoDias; }), 'ultima');
      if (v === 'risco') return abreOv('Receita em risco', 'Em risco e Não pode perder', lista.filter(function (c) { return RISCO[c.seg]; }), 'valor');
      if (v === 'ciclo') return abreOv('Clientes que recompraram', 'base do ciclo de recompra', lista.filter(function (c) { return c.cicloProprio != null; }), 'n');
      return abreOv('Clientes na carteira', 'todos os clientes do filtro', lista, 'valor');
    }
    var ids = {}; lista.forEach(function (c) { ids[c.id] = 1; });
    if (k === 'movl') {
      var tit = { subiram: 'Melhoraram de segmento', desceram: 'Pioraram de segmento', novos: 'Entraram na carteira' }[v];
      return abreOv(tit, 'desde ' + dmy(res.mov.de), res.mov[v].filter(function (c) { return ids[c.id]; }), 'valor');
    }
    if (k === 'fluxo') {
      var f = res.mov.lista[+v]; if (!f) return;
      return abreOv(SEG[f.de].n + ' para ' + SEG[f.para].n, 'desde ' + dmy(res.mov.de), f.lista.filter(function (c) { return ids[c.id]; }), 'valor');
    }
    if (k === 'prova') {
      var p = res.prova, arr2 = p.linhas.filter(function (x) { return x.antes.seg === v; });
      return abreOv('Há ' + nf(p.dias) + ' dias: ' + SEG[v].n, nf(arr2.filter(function (x) { return x.rec; }).length) + ' de ' + nf(arr2.length) + ' compraram de novo depois. Segmento mostrado: o de hoje', arr2.map(function (x) { return x.c; }), 'valor');
    }
  }

  // ---------- API ----------
  var API = {
    CFG: CFG, SEGS: SEGS,
    click: function (ev) { return onClick(ev); },
    // cfg: { root, mode:'m'|'t', getRows:()=>[], getOrigin:()=>'both'|'inbound'|'outbound', getErr:()=>string|null, isActive:()=>bool, ticketFn:(vals)=>numero, reps:{id:nome}, retry:()=>void }
    init: function (cfg) {
      S.cfg = cfg; S.mode = cfg.mode || 'm'; S.root = cfg.root;
      injetaCss();
      S.root.classList.add('rf', S.mode === 't' ? 'tv' : 'm');
      if (!S.inited) {
        S.inited = true; S.root.addEventListener('click', onClick);
        S.root.addEventListener('change', function (e) { var t = e.target.closest('[data-rf-sel]'); if (t && t.getAttribute('data-rf-sel') === 'mostrar') { S.mostrar = t.value; S.sig = ''; draw(); } });
        var rt; function refit() { clearTimeout(rt); rt = setTimeout(function () { if (S.mode === 't' && S.cfg.isActive && S.cfg.isActive() && S.res) { S.sig = ''; API.render(); } }, 120); }
        document.addEventListener('lbpage', refit); w.addEventListener('resize', refit);
      }
    },
    activate: function () { S.sig = ''; this.render(); },
    render: function () {
      if (!S.root) return;
      var rows = getRows(), err = S.cfg.getErr ? S.cfg.getErr() : null;
      var sig = (rows ? rows.length + '|' + ultimoSync(rows) : 'x') + '|' + origemAtual() + '|' + S.seg + '|' + S.rep + '|' + S.met + '|' + S.mostrar + '|' + S.acaoN + '|' + (err || '') + '|' + hojeBRT() + '|' + Object.keys(S.info).filter(function (k) { return S.info[k]; }).join(',') + '|' + S.repSort.k + S.repSort.dir;
      if (sig === S.sig) return;
      S.sig = sig; draw();
    },
    _state: S,
    _core: { computeRfm: computeRfm, retrato: retrato, clientes: clientes, pontuar: pontuar, faixaR: faixaR, segmentoDe: segmentoDe, dataEvento: dataEvento, agregar: agregar, prova: prova, limpaNome: limpaNome, GRADE: GRADE, SEGS: SEGS, CFG: CFG }
  };
  w.RFM = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
