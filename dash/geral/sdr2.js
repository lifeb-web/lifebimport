/* ============================================================
 * Dossiê do SDR (Fase 1) - aba SDR nova, atrás da chave ?sdr=2
 * Compartilhado pelo mobile (dash/geral/index.html) e pelo telão
 * (dash/geral/telao/index.html): UM motor de cálculo e UM renderizador,
 * então os dois nunca divergem (paridade).
 *
 * Fonte: tabela dash_geral_deals (D1, via bridge, SOMENTE LEITURA), filtrada
 * pelos funis SDR (lida inteira, com conferência do total). Atividades: rota /sdr-atividades do worker da Bia (agregado diário,
 * só leitura). Etapas: rota /sdr-etapas (aparece só com dado). Entrada no GS: tabela dash_sdr_gs_entrada (opcional). Dados do GS Engage
 * (maio a 19/10) entram como faixa separada e congelada (HIST_GS abaixo).
 *
 * Regras do Robert (28/10/2026):
 *  - "Cadência esgotada" fica FORA da conversão, em cinza (recuperável).
 *  - Conversão: duas visões, a principal sem a cadência esgotada.
 *  - Motivo de perda "Duplicado" (29/10/2026): fora dos perdidos do SDR e da conversão (principal e geral), não vira cadência esgotada;
 *    aparece em cinza na linha "Duplicados (fora da conta)". Perdidos + esgotados + duplicados = total de fechados como perdido.
 *  - Data do ganho = data_real_evento, senão end_time (como DATA); nunca won_at.
 *  - Origem = regra do Dash (origem_especial manda; senão origin).
 *  - Vendas não se repetem aqui (já estão na aba Vendas).
 *  - Só Felipe, mas parametrizado: novo SDR = uma linha em CFG.sdrs.
 * ============================================================ */
(function (w) {
  'use strict';

  // ---------- Configuração (para novos SDRs/funis, mexer só aqui) ----------
  var CFG = {
    sdrs: { '976405': 'Felipe' },                       // id do dono no Agendor -> nome
    funis: {                                            // funis SDR no Agendor
      '916712': { nome: 'Outbound', cor: '#704B9B' },
      '916713': { nome: 'Inbound', cor: '#E92085' }
    },
    perdaSistema: ['cadência esgotada'],                // motivos de perda feitos pelo sistema (recuperáveis)
    etapaFim: /fim\s+d[ao]\s+cad[eê]ncia/i,             // etapa "sala de espera"
    // Contatos migrados do GS em 20/10 (363): created_at não é a entrada real do contato.
    migracao: { de: '2026-10-20T15:00:00Z', ate: '2026-10-20T17:00:00Z' },
    inicioAgendor: '2026-10-20',
    urlNegocio: 'https://web.agendor.com.br/sistema/negocios/historico.php?id=',
    worker: 'https://gs-agendor-worker.robert131196.workers.dev',   // rotas só de leitura: /sdr-atividades, /sdr-etapas e /sdr-iniciados
    iniOutDesde: '2026-10-26',                          // Outbound: o clique em Iniciar só é guardado (marcador/contador) desde o início da cota diária; antes disso o dia de início não existe
    funilInbound: '916713',
    corIni: '#704B9B', corFin: '#0e9aa0',
    atvInicio: '2026-10-20',                            // início do Agendor como fonte (antes disso vale a faixa congelada do GS)
    atrasoSyncMin: 30,
    atrasoAtvMin: 120,
    refreshTelaoMs: 10 * 60 * 1000
  };
  // Origens: as 4 conhecidas têm ordem, rótulo e cor fixos. Qualquer origem NOVA criada no Agendor aparece sozinha (lista derivada dos próprios dados,
  // ver origemKey/origensDe): rótulo legível, cor automática estável (paleta + hash da chave) e depois das conhecidas, em ordem alfabética.
  var ORIGENS_FIXAS = [
    { key: 'outbound',    label: 'Outbound',     cor: '#704B9B' },
    { key: 'superagos',   label: 'SuperAgos',    cor: '#2f7de1' },
    { key: 'recuperacao', label: 'Recuperação',  cor: '#0e9aa0' },
    { key: 'inbound',     label: 'Inbound',      cor: '#E92085' }
  ];
  // rótulos de origens que já existem no Agendor mas ainda não são fixas aqui (chave sem acento -> texto certo)
  var ORIGEM_ROTULOS = { nossa_rede: 'Nossa Rede', indicacao: 'Indicação', reativacao: 'Reativação', recuperacao_sdr: 'Recuperação SDR' };
  var PALETA_ORIGEM = ['#c2410c', '#0f766e', '#a16207', '#6d28d9', '#be123c', '#0369a1', '#4d7c0f', '#9333ea', '#b45309', '#0891b2', '#be185d', '#475569'];
  var ORIGENS = ORIGENS_FIXAS.slice();
  var ORIGEM_BRUTA = {}; // chave -> texto como veio do Agendor (para o rótulo)
  var C_GANHO = '#1baf7a', C_PERDA = '#dc2626', C_CINZA = '#b8b3c8', C_ROXO = '#704B9B';  var C_GANHO = '#1baf7a', C_PERDA = '#dc2626', C_CINZA = '#b8b3c8', C_ROXO = '#704B9B';

  // Faixa congelada do GS Engage (cópia de 17/10 + releitura de 19/10; script da comissão do Felipe).
  // Sistema anterior: cada passo era um registro (inclusive e-mail e pesquisa). Não comparar 1:1.
  var HIST_GS = [
    { m: '2026-05', q: 4,  pm: 751, pa: 0,   at: 1028 },
    { m: '2026-06', q: 53, pm: 774, pa: 0,   at: 1748 },
    { m: '2026-07', q: 62, pm: 324, pa: 0,   at: 2671 },
    { m: '2026-08', q: 63, pm: 323, pa: 0,   at: 2316 },
    { m: '2026-09', q: 51, pm: 421, pa: 144, at: 3025 },
    { m: '2026-10', q: 31, pm: 97,  pa: 47,  at: 1704, parcial: '1 a 19/10' }
  ];

  // ---------- Estado ----------
  var S = { raw: null, rows: [], loading: false, err: null, mode: 'm', root: null, inited: false,
            f: { sdr: '', funil: '', origem: '' }, gran: '', cfg: null, lastFetch: 0, timer: null,
            total: null, dupes: 0, gs: null, atv: null, atvErr: null, ini: null, iniErr: null, etp: null, etpErr: null, byId: {}, etapaNome: {}, w: 'p' };

  // ---------- Utilidades ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dm(iso) { return iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : 'n/d'; }
  function dmy(iso) { return iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(2, 4) : 'n/d'; }
  function num(n) { return Math.round(n).toLocaleString('pt-BR'); }
  function pct(a, b) { return b > 0 ? (Math.round(a / b * 1000) / 10).toString().replace('.', ',') + '%' : 'n/d'; }
  function dec1(n) { return (Math.round(n * 10) / 10).toString().replace('.', ','); }
  function dUTC(iso) { var p = iso.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function isoOf(ms) { var d = new Date(ms); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function addDays(iso, n) { return isoOf(dUTC(iso) + n * 86400000); }
  function diffDays(a, b) { return Math.round((dUTC(b) - dUTC(a)) / 86400000); }
  function mondayOf(iso) { var d = new Date(dUTC(iso)); var dow = d.getUTCDay() || 7; return addDays(iso, 1 - dow); }
  function hojeBRT() { return isoOf(Date.now() - 3 * 3600000); }
  function nomeMes(m) { var n = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']; return n[+m.slice(5, 7) - 1] + '/' + m.slice(2, 4); }

  // Instante ISO -> DATA no fuso de Brasília. O Agendor devolve o fim do negócio ora como data pura
  // (2026-10-23T00:00:00.000Z, que NÃO pode ser deslocada, senão cai no dia anterior), ora como instante.
  function dataBRT(s) {
    if (!s) return null;
    if (/T00:00:00(\.000)?Z?$/.test(s)) return s.slice(0, 10);
    var t = Date.parse(s);
    if (isNaN(t)) return null;
    return isoOf(t - 3 * 3600000);
  }
  function instBRT(s) { // "dd/mm HH:MM"
    var t = Date.parse(s); if (isNaN(t)) return 'n/d';
    var b = new Date(t - 3 * 3600000);
    return pad(b.getUTCDate()) + '/' + pad(b.getUTCMonth() + 1) + ' ' + pad(b.getUTCHours()) + ':' + pad(b.getUTCMinutes());
  }
  function ordemEtapa(nome) {
    if (CFG.etapaFim.test(nome)) return 9999;
    var m = /^D\s*(\d+)/i.exec(nome || '');
    return m ? +m[1] : 5000;
  }
  function slugOrigem(v) { return String(v == null ? '' : v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); }
  var SEM_ORIGEM = { '': 1, null: 1, none: 1, nenhuma: 1, nenhum: 1, undefined: 1, nan: 1, na: 1, n_a: 1, sem_origem: 1, '0': 1 };
  // Regra do Dash: origem_especial manda; senão origin (vazio ou "outbound" = outbound). Diferença só aqui: valor que o Dash ainda não conhece
  // (origem nova) NÃO some em Outbound: vira origem própria (chave sem acento). Nenhum negócio fica sem origem.
  function origemKey(d) {
    var bruto = d.origem_especial, e = slugOrigem(bruto);
    if (!SEM_ORIGEM[e] && e !== 'outbound' && e !== 'inbound') { if (!ORIGEM_BRUTA[e]) ORIGEM_BRUTA[e] = String(bruto).trim(); return e; }
    if (e === 'inbound') return 'inbound';
    var o = slugOrigem(d.origin);
    if (o === 'inbound') return 'inbound';
    if (SEM_ORIGEM[o] || o === 'outbound') return 'outbound';
    if (!ORIGEM_BRUTA[o]) ORIGEM_BRUTA[o] = String(d.origin).trim();
    return o;
  }
  var FIXAS_OUT = { outbound: 1, superagos: 1, recuperacao: 1 };
  // Lado para a barra Outbound / Inbound do Dash: como no Dash, as especiais conhecidas são Outbound; origem nova segue o campo origin do negócio.
  function ladoOrigem(d, key) {
    if (key === 'inbound') return 'inbound';
    if (FIXAS_OUT[key]) return 'outbound';
    return slugOrigem(d.origin) === 'inbound' ? 'inbound' : 'outbound';
  }
  var ORIGEM_LADOS = {}; // chave -> { inbound:true, outbound:true } (lados em que aparece nos dados)
  function registraLados(rows) {
    ORIGEM_LADOS = {};
    (rows || []).forEach(function (d) { if (d && d.origem) { var m = ORIGEM_LADOS[d.origem] || (ORIGEM_LADOS[d.origem] = {}); m[d.lado || (d.origem === 'inbound' ? 'inbound' : 'outbound')] = true; } });
  }
  function origemPassaGlobal(key, glob) {
    if (!glob || glob === 'both') return true;
    var m = ORIGEM_LADOS[key]; if (!m) return glob === 'inbound' ? key === 'inbound' : key !== 'inbound';
    return !!m[glob];
  }
  function rotuloOrigem(k) {
    if (ORIGEM_ROTULOS[k]) return ORIGEM_ROTULOS[k];
    var b = ORIGEM_BRUTA[k] ? String(ORIGEM_BRUTA[k]).replace(/[<>&"']/g, '') : '';
    if (b && /[A-ZÀ-Ý]/.test(b) && !/_/.test(b)) return b; // já veio legível ("Feira Sul")
    return String(b || k).replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/(^|\s)([a-zà-ÿ])/g, function (m, a, c) { return a + c.toUpperCase(); });
  }
  function corOrigem(k) { // estável: depende só da chave
    var h = 5381; for (var i = 0; i < k.length; i++) h = ((h << 5) + h + k.charCodeAt(i)) >>> 0;
    return PALETA_ORIGEM[h % PALETA_ORIGEM.length];
  }
  // Lista de origens a mostrar: as fixas (sempre, nessa ordem) + as encontradas nos dados (alfabética). Atualiza ORIGENS (usado nos rótulos).
  function origensDe(rows) {
    var fixas = {}; ORIGENS_FIXAS.forEach(function (o) { fixas[o.key] = 1; });
    var novas = {}; (rows || []).forEach(function (d) { if (d && d.origem && !fixas[d.origem]) novas[d.origem] = 1; });
    var extra = Object.keys(novas).map(function (k) { return { key: k, label: rotuloOrigem(k), cor: corOrigem(k) }; }).sort(function (a, b) { return a.label < b.label ? -1 : a.label > b.label ? 1 : 0; });
    ORIGENS = ORIGENS_FIXAS.concat(extra);
    registraLados(rows);
    return ORIGENS;
  }
  function origemLabel(k) { for (var i = 0; i < ORIGENS.length; i++) if (ORIGENS[i].key === k) return ORIGENS[i].label; return rotuloOrigem(k); }
  // Duplicado (nome exato no Agendor: "Duplicado"; tolera caixa e acento): fora da conta dos perdidos e da conversão
  function ehDuplicado(motivo) { return String(motivo || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase() === 'duplicado'; }
  function ehSistema(motivo) { return CFG.perdaSistema.indexOf(String(motivo || '').toLowerCase()) >= 0; }

  // ---------- Preparação das linhas ----------
  function prep(rows, gsMap) {
    var out = [];
    rows.forEach(function (d) {
      var oid = String(d.owner_id), fid = String(d.funnel_id);
      if (!CFG.sdrs[oid] || !CFG.funis[fid]) return;
      var e = {
        id: d.id, titulo: d.title || ('Negócio ' + d.id), sdr: oid, funil: fid, status: d.status,
        etapa: d.stage_name || 'Sem etapa', etapaId: String(d.stage_id || ''), motivo: d.lost_reason_name || '',
        origem: origemKey(d), lado: ladoOrigem(d, origemKey(d)), criada: dataBRT(d.created_at), synced: d.synced_at, congelado: !!(d.frozen && +d.frozen)
      };
      var migr = d.created_at && d.created_at >= CFG.migracao.de && d.created_at < CFG.migracao.ate;
      e.migrado = !!migr;
      var g = gsMap && gsMap[d.id]; // data de entrada no GS (tabela dash_sdr_gs_entrada), quando existir
      if (g && g.entrada_gs) { e.entradaGS = String(g.entrada_gs).slice(0, 10); e.confGS = g.confianca; }
      if (d.status === 'won') {
        // data do ganho: data_real_evento, senão end_time (nunca won_at)
        e.data = d.data_real_evento ? String(d.data_real_evento).slice(0, 10) : dataBRT(d.end_time || d.closed_at);
      } else if (d.status === 'lost') {
        e.data = d.data_real_evento ? String(d.data_real_evento).slice(0, 10) : dataBRT(d.end_time || d.lost_at || d.closed_at);
        e.dup = ehDuplicado(d.lost_reason_name);
        e.sistema = !e.dup && ehSistema(d.lost_reason_name);
      }
      if (e.status === 'won' && e.data) {
        if (e.entradaGS) { e.dias = Math.max(0, diffDays(e.entradaGS, e.data)); e.diasGS = true; }
        else if (e.criada && !e.migrado) e.dias = Math.max(0, diffDays(e.criada, e.data));
      }
      out.push(e);
    });
    origensDe(out);
    return out;
  }

  // ---------- Motor de cálculo (puro, testável) ----------
  // Filtro global do Dash (barra Outbound / Inbound / Ambos): no Dash, Outbound inclui SuperAgos e Recuperação.
  function passaGlobal(d, glob) {
    if (!glob || glob === 'both') return true;
    var lado = d.lado || (d.origem === 'inbound' ? 'inbound' : 'outbound');
    return lado === glob;
  }
  function filtra(rows, f) {
    return rows.filter(function (d) {
      return passaGlobal(d, f.glob) && (!f.sdr || d.sdr === f.sdr) && (!f.funil || d.funil === f.funil) && (!f.origem || d.origem === f.origem);
    });
  }
  function noPeriodo(d, from, to) { return d.data && d.data >= from && d.data <= to; }

  function agrega(rows, from, to) {
    var won = [], lostM = [], lostS = [], lostD = [], ong = [], fim = [];
    rows.forEach(function (d) {
      if (d.status === 'won' && noPeriodo(d, from, to)) won.push(d);
      else if (d.status === 'lost' && noPeriodo(d, from, to)) (d.dup ? lostD : d.sistema ? lostS : lostM).push(d);
      else if (d.status === 'ongoing' && !d.congelado) (CFG.etapaFim.test(d.etapa) ? fim : ong).push(d);
    });
    var dias = won.filter(function (d) { return d.dias != null; }).map(function (d) { return d.dias; }).sort(function (a, b) { return a - b; });
    var soma = dias.reduce(function (s, x) { return s + x; }, 0);
    var med = dias.length ? (dias.length % 2 ? dias[(dias.length - 1) / 2] : (dias[dias.length / 2 - 1] + dias[dias.length / 2]) / 2) : null;
    return {
      won: won, lostM: lostM, lostS: lostS, lostD: lostD, ong: ong, fim: fim,
      q: won.length, pm: lostM.length, ps: lostS.length, pd: lostD.length,
      conv: (won.length + lostM.length) > 0 ? won.length / (won.length + lostM.length) : null,
      convGeral: (won.length + lostM.length + lostS.length) > 0 ? won.length / (won.length + lostM.length + lostS.length) : null,
      diasN: dias.length, diasMedia: dias.length ? soma / dias.length : null, diasMed: med,
      migradosGanhos: won.filter(function (d) { return d.migrado && d.dias == null; }).length,
      diasGS: won.filter(function (d) { return d.diasGS; }).length
    };
  }

  function porEtapa(rows, from, to) {
    var res = {};
    Object.keys(CFG.funis).forEach(function (fid) { res[fid] = {}; });
    function get(d) { var m = res[d.funil]; return m[d.etapa] || (m[d.etapa] = { nome: d.etapa, ord: ordemEtapa(d.etapa), agora: 0, q: 0, pm: 0, ps: 0, pd: 0 }); }
    rows.forEach(function (d) {
      if (d.status === 'ongoing') { if (!d.congelado) get(d).agora++; }
      else if (d.status === 'won' && noPeriodo(d, from, to)) get(d).q++;
      else if (d.status === 'lost' && noPeriodo(d, from, to)) { if (d.dup) get(d).pd++; else if (d.sistema) get(d).ps++; else get(d).pm++; }
    });
    var out = {};
    Object.keys(res).forEach(function (fid) {
      out[fid] = Object.keys(res[fid]).map(function (k) { return res[fid][k]; })
        .sort(function (a, b) { return a.ord - b.ord || (a.nome < b.nome ? -1 : 1); });
    });
    return out;
  }

  function motivos(lostM) {
    var m = {};
    lostM.forEach(function (d) { var k = d.motivo || 'Sem motivo informado'; (m[k] || (m[k] = [])).push(d); });
    return Object.keys(m).map(function (k) { return { motivo: k, lista: m[k], n: m[k].length }; }).sort(function (a, b) { return b.n - a.n; });
  }

  // Séries para o gráfico: baldes por dia, semana ou mês, dentro do recorte efetivo
  function serie(rows, from, to, gran) {
    var datas = [];
    rows.forEach(function (d) { if ((d.status === 'won' || d.status === 'lost') && noPeriodo(d, from, to)) datas.push(d.data); });
    if (!datas.length) return { baldes: [], gran: gran, de: from, ate: to };
    datas.sort();
    var de = datas[0] > from ? datas[0] : from;
    var hoje = hojeBRT();
    var ate = to < hoje ? to : hoje;
    var nDias = diffDays(de, ate) + 1;
    gran = gran || (nDias <= 31 ? 'd' : (nDias <= 150 ? 's' : 'm'));
    function chave(iso) { return gran === 'd' ? iso : (gran === 's' ? mondayOf(iso) : iso.slice(0, 7)); }
    var baldes = [], idx = {};
    function mk(k) { var b = { k: k, q: 0, pm: 0, ps: 0, pd: 0 }; idx[k] = b; baldes.push(b); return b; }
    if (gran === 'd') { for (var t = de; t <= ate; t = addDays(t, 1)) mk(t); }
    else if (gran === 's') { for (var s = mondayOf(de); s <= ate; s = addDays(s, 7)) mk(s); }
    else { var y = +de.slice(0, 4), mo = +de.slice(5, 7); var fim = ate.slice(0, 7); while (true) { var k = y + '-' + pad(mo); mk(k); if (k >= fim) break; mo++; if (mo > 12) { mo = 1; y++; } } }
    rows.forEach(function (d) {
      if ((d.status !== 'won' && d.status !== 'lost') || !noPeriodo(d, from, to) || d.data < de || d.data > ate) return;
      var b = idx[chave(d.data)]; if (!b) return;
      if (d.status === 'won') b.q++; else if (d.dup) b.pd++; else if (d.sistema) b.ps++; else b.pm++;
    });
    return { baldes: baldes, gran: gran, de: de, ate: ate };
  }

  // Mesmo critério do Dash (prevRangeOf): período que começa no dia 1 compara com os MESMOS dias do mês
  // anterior (calendário alinhado); os demais comparam com a janela imediatamente anterior, de igual tamanho.
  function periodoAnterior(from, to) {
    if (from <= '2020-01-02') return null; // "Total" não tem comparativo
    if (from.slice(8, 10) === '01') {
      var y = +from.slice(0, 4), m = +from.slice(5, 7);
      var py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1;
      var ultimo = new Date(Date.UTC(y, m - 1, 0)).getUTCDate();
      var dia = Math.min(+to.slice(8, 10), ultimo);
      return { from: py + '-' + pad(pm) + '-01', to: py + '-' + pad(pm) + '-' + pad(dia) };
    }
    var n = diffDays(from, to) + 1;
    var pt = addDays(from, -1);
    return { from: addDays(pt, -(n - 1)), to: pt };
  }


  // ---------- Atividades (rota /sdr-atividades) e etapas (rota /sdr-etapas): motor puro ----------
  var TIPOS = [['lig', 'Ligações'], ['wa', 'WhatsApp'], ['em', 'E-mails'], ['pe', 'Pesquisas'], ['ou', 'Outras']];
  function zeroTipos() { return { lig: 0, wa: 0, em: 0, pe: 0, ou: 0 }; }
  function somaTipos(o) { return (o.lig || 0) + (o.wa || 0) + (o.em || 0) + (o.pe || 0) + (o.ou || 0); }
  // Documento diário -> linhas (SDR x negócio x dia). Origem e funil vêm da MESMA tabela de negócios do resto da aba,
  // então os filtros de funil, origem, SDR e a barra Outbound/Inbound do Dash valem igual para atividades.
  function atvLinhas(docs, byId) {
    var out = [];
    (docs || []).forEach(function (doc) {
      Object.keys(doc.sdr || {}).forEach(function (quem) {
        (doc.sdr[quem] || []).forEach(function (l) {
          var row = byId[l.d], funil = String(l.f);
          out.push({ dia: doc.dia, sdr: String(quem), deal: l.d, funil: funil, origem: row ? row.origem : (funil === '916713' ? 'inbound' : 'outbound'), lado: row ? row.lado : (funil === '916713' ? 'inbound' : 'outbound'), a: l.a || zeroTipos(), j: l.j || zeroTipos() });
        });
      });
    });
    return out;
  }
  function agregaAtv(linhas, from, to) {
    var a = zeroTipos(), j = zeroTipos(), porDia = {};
    linhas.forEach(function (l) {
      if (l.dia < from || l.dia > to) return;
      var pd = porDia[l.dia] || (porDia[l.dia] = { a: 0, j: 0, lig: 0 });
      TIPOS.forEach(function (t) { a[t[0]] += l.a[t[0]] || 0; j[t[0]] += l.j[t[0]] || 0; });
      pd.a += somaTipos(l.a); pd.j += somaTipos(l.j); pd.lig += l.a.lig || 0;
    });
    var diasAtivos = Object.keys(porDia).filter(function (d) { return porDia[d].a > 0; }).length;
    return { a: a, j: j, feitas: somaTipos(a), junto: somaTipos(j), porDia: porDia, diasAtivos: diasAtivos, media: diasAtivos ? somaTipos(a) / diasAtivos : null };
  }
  // Janela do período que o Agendor cobre (a partir de atvInicio, até hoje) e quais dias dela têm agregado.
  function somaObj(o) { var n = 0; Object.keys(o || {}).forEach(function (k) { n += Number(o[k]) || 0; }); return n; }
  function janelaAtv(per, docs, semDado, ultima) {
    var hoje = hojeBRT(), de = per.from < CFG.atvInicio ? CFG.atvInicio : per.from, ate = per.to > hoje ? hoje : per.to;
    var vazio = { lidas: 0, sdr: 0, junto: 0, nc: 0, fora: 0, sis: 0, out: 0, pend: 0 };
    if (ate < de) return { antes: per.to < CFG.atvInicio, de: de, ate: ate, dias: 0, comDado: 0, sem: [], parcial: 0, apur: { ativo: false, dias: [], pend: 0, falha: false }, bruto: vazio };
    var known = {}; (docs || []).forEach(function (d) { known[d.dia] = d; });
    var sem = [], n = 0, com = 0, parcial = 0, apDias = [], pendTot = 0, br = { lidas: 0, sdr: 0, junto: 0, nc: 0, fora: 0, sis: 0, out: 0, pend: 0 };
    for (var t = de; t <= ate; t = addDays(t, 1)) {
      n++;
      var d = known[t];
      if (!d) { sem.push(t); continue; }
      com++;
      var pd = Number(d.pend) || 0;
      if (d.incompleto || d.pendente) parcial++;
      if (pd > 0 || d.pendente || d.incompleto) { apDias.push(t); pendTot += pd; }
      Object.keys(d.sdr || {}).forEach(function (q) { (d.sdr[q] || []).forEach(function (l) { br.sdr += somaObj(l.a); br.junto += somaObj(l.j); }); });
      br.nc += somaObj(d.nc); br.fora += Number(d.fora) || 0; br.sis += Number(d.sis) || 0; br.out += Number(d.out) || 0; br.pend += pd;
    }
    br.lidas = br.sdr + br.junto + br.nc + br.fora + br.sis + br.out + br.pend;
    var falha = !!(ultima && ultima.ok === false);
    return { antes: false, de: de, ate: ate, dias: n, comDado: com, sem: sem, parcial: parcial, apur: { ativo: apDias.length > 0 || falha, dias: apDias, pend: pendTot, falha: falha }, bruto: br };
  }
  function serieAtv(ag, jn, docs) {
    var known = {}; (docs || []).forEach(function (d) { known[d.dia] = 1; });
    var ap = {}; (jn.apur ? jn.apur.dias : []).forEach(function (d) { ap[d] = 1; });
    var out = [];
    if (jn.antes || jn.dias === 0) return out;
    for (var t = jn.de; t <= jn.ate; t = addDays(t, 1)) { var pd = ag.porDia[t]; out.push({ k: t, a: pd ? pd.a : 0, j: pd ? pd.j : 0, lig: pd ? pd.lig : 0, sem: !known[t], ap: !!ap[t] }); }
    return out;
  }
  function etpLinhas(eventos, byId) {
    var out = [];
    (eventos || []).forEach(function (e) {
      var row = byId[e.d], funil = String(e.f);
      out.push({ dia: isoOf(e.ts - 3 * 3600000), sdr: row ? row.sdr : '', funil: funil, origem: row ? row.origem : (funil === '916713' ? 'inbound' : 'outbound'), lado: row ? row.lado : (funil === '916713' ? 'inbound' : 'outbound'), de: e.de, para: e.para, semLinha: !row });
    });
    return out;
  }
  function agregaEtp(linhas, from, to, f, etapaNome) {
    var res = {}, tot = 0;
    linhas.forEach(function (l) {
      if (l.dia < from || l.dia > to) return;
      if (!passaGlobal(l, f.glob) || (f.funil && l.funil !== f.funil) || (f.origem && l.origem !== f.origem)) return;
      if (f.sdr && l.sdr !== f.sdr) return; // sem linha na tabela de negócios não dá para atribuir ao SDR: fica de fora quando há filtro de SDR
      var m = res[l.funil] || (res[l.funil] = {});
      function get(id) { return m[id] || (m[id] = { id: id, nome: etapaNome[id] || ('Etapa ' + id), ord: ordemEtapa(etapaNome[id] || ''), ent: 0, sai: 0 }); }
      get(l.para).ent++; tot++;
      if (l.de != null) get(l.de).sai++;
    });
    var out = {};
    Object.keys(res).forEach(function (fid) { out[fid] = Object.keys(res[fid]).map(function (k) { return res[fid][k]; }).sort(function (a, b) { return a.ord - b.ord || (a.nome < b.nome ? -1 : 1); }); });
    return { porFunil: out, total: tot };
  }


  // ---------- Iniciados e finalizados (30/10/2026) ----------
  // INICIADO = o dia em que o SDR começou a trabalhar o lead.
  //  - Marcador do worker (rota /sdr-iniciados: sdrcad_ini_<negócio> = dia do clique em Iniciar, ou da liberação do Inbound que esperou na fila) SEMPRE manda.
  //  - Sem marcador, Inbound: o lead já nasce em cadência (D0/D1 automático), vale o dia da criação do negócio (migrados do GS ficam de fora: criação não é entrada real).
  //  - Sem marcador, Outbound: não há dia de início guardado (negócio anterior ao controle de cota ou ainda na fila): não conta; aparece em "sem dia de início" na conferência.
  // FINALIZADO = saiu da cadência no período, pela data real do evento (data_real_evento, senão end_time; nunca won_at):
  //  Qualificado (ganho) + Perdido pelo SDR + Cadência esgotada + Duplicado. Duplicado não é decisão do SDR (fora da conversão), mas o lead saiu da cadência: conta como finalizado.
  function iniDia(d, map) {
    var m = map && map[d.id];
    if (m) return { dia: m, fonte: 'marcador' };
    if (d.funil === CFG.funilInbound && d.criada && !d.migrado) return { dia: d.criada, fonte: 'criacao' };
    return null;
  }
  function iniMapa(negocios) { var m = {}; (negocios || []).forEach(function (x) { if (x && x.length >= 2) m[x[0]] = x[1]; }); return m; }
  function iniDesde(f) { return (f.funil === CFG.funilInbound || f.glob === 'inbound' || f.origem === 'inbound') ? CFG.atvInicio : CFG.iniOutDesde; }
  function agregaIni(rows, map, from, to) {
    var lista = [], semOut = 0, abertos = 0, outN = 0, inN = 0, marc = 0, cria = 0;
    rows.forEach(function (d) {
      var i = iniDia(d, map);
      if (!i) { if (d.funil !== CFG.funilInbound) semOut++; return; }
      if (i.dia <= to && d.status === 'ongoing' && !d.congelado) abertos++;
      if (i.dia < from || i.dia > to) return;
      lista.push({ d: d, dia: i.dia, fonte: i.fonte });
      if (d.funil === CFG.funilInbound) inN++; else outN++;
      if (i.fonte === 'marcador') marc++; else cria++;
    });
    return { lista: lista, n: lista.length, outN: outN, inN: inN, marc: marc, cria: cria, semOut: semOut, abertos: abertos };
  }
  function finTotal(a) { return a ? a.q + a.pm + a.ps + a.pd : null; }
  function serieIniFin(base, map, from, to, gran) {
    var hoje = hojeBRT(), ate = to < hoje ? to : hoje, datas = [];
    base.forEach(function (d) {
      var i = iniDia(d, map); if (i && i.dia >= from && i.dia <= ate) datas.push(i.dia);
      if ((d.status === 'won' || d.status === 'lost') && noPeriodo(d, from, ate)) datas.push(d.data);
    });
    if (!datas.length) return { baldes: [], gran: gran, de: from, ate: ate };
    datas.sort();
    var de = datas[0] > from ? datas[0] : from, nDias = diffDays(de, ate) + 1;
    gran = gran || (nDias <= 31 ? 'd' : (nDias <= 150 ? 's' : 'm'));
    function chave(iso) { return gran === 'd' ? iso : (gran === 's' ? mondayOf(iso) : iso.slice(0, 7)); }
    var baldes = [], idx = {};
    function mk(k) { var b = { k: k, i: 0, f: 0 }; idx[k] = b; baldes.push(b); return b; }
    if (gran === 'd') { for (var t = de; t <= ate; t = addDays(t, 1)) mk(t); }
    else if (gran === 's') { for (var s = mondayOf(de); s <= ate; s = addDays(s, 7)) mk(s); }
    else { var y = +de.slice(0, 4), mo = +de.slice(5, 7), fim = ate.slice(0, 7); while (true) { var k = y + '-' + pad(mo); mk(k); if (k >= fim) break; mo++; if (mo > 12) { mo = 1; y++; } } }
    base.forEach(function (d) {
      var i = iniDia(d, map);
      if (i && i.dia >= de && i.dia <= ate) { var b = idx[chave(i.dia)]; if (b) b.i++; }
      if ((d.status === 'won' || d.status === 'lost') && noPeriodo(d, de, ate)) { var b2 = idx[chave(d.data)]; if (b2) b2.f++; }
    });
    return { baldes: baldes, gran: gran, de: de, ate: ate };
  }
  // Conferência (sem filtros locais, só o período): iniciados do Dash x marcadores do KV x soma dos contadores diários; finalizados x partes x contagem direta.
  function conferir(rows, ini, per) {
    var out = { fin: null, ini: null };
    var q = 0, lm = 0, ls = 0, ld = 0, wDir = 0, lDir = 0, semData = 0;
    rows.forEach(function (d) {
      if (d.status !== 'won' && d.status !== 'lost') return;
      if (!d.data) { semData++; return; }
      if (d.data < per.from || d.data > per.to) return;
      if (d.status === 'won') wDir++; else lDir++;
    });
    var ag = agrega(rows, per.from, per.to);
    out.fin = { cartao: finTotal(ag), partes: ag.q + ag.pm + ag.ps + ag.pd, q: ag.q, pm: ag.pm, ps: ag.ps, pd: ag.pd, direto: wDir + lDir, wDir: wDir, lDir: lDir, perdasTab: ag.pm + ag.ps + ag.pd, semData: semData };
    if (ini) {
      var byId = {}; rows.forEach(function (d) { byId[d.id] = d; });
      var ag2 = agregaIni(rows, ini.map, per.from, per.to);
      var marcKv = 0, marcSemNeg = 0, marcInb = 0, cotaSoma = 0, cotaDias = 0, marcDiasCota = 0, marcDiasCotaInb = 0, marcDiasCotaSem = 0;
      var diaCota = {}; (ini.dias || []).forEach(function (x) { if (x.cota != null && x.dia >= per.from && x.dia <= per.to) { diaCota[x.dia] = 1; cotaSoma += Number(x.cota) || 0; cotaDias++; } });
      (ini.negocios || []).forEach(function (x) {
        if (x[1] < per.from || x[1] > per.to) return;
        marcKv++; var d = byId[x[0]];
        if (!d) marcSemNeg++; else if (d.funil === CFG.funilInbound) marcInb++;
        if (diaCota[x[1]]) { marcDiasCota++; if (!d) marcDiasCotaSem++; else if (d.funil === CFG.funilInbound) marcDiasCotaInb++; }
      });
      out.ini = { dash: ag2.n, marcDash: ag2.marc, cria: ag2.cria, outN: ag2.outN, inN: ag2.inN, marcKv: marcKv, marcSemNeg: marcSemNeg, marcInb: marcInb, cotaSoma: cotaSoma, cotaDias: cotaDias,
                  marcDiasCota: marcDiasCota, marcDiasCotaOut: marcDiasCota - marcDiasCotaInb - marcDiasCotaSem, marcDiasCotaSem: marcDiasCotaSem, semOut: ag2.semOut,
                  diasPedidos: diffDays(per.from, per.to < hojeBRT() ? per.to : hojeBRT()) + 1 };
    }
    return out;
  }

  function calcular(rows, per, f, gran, ext) {
    ext = ext || {};
    var base = filtra(rows, f);
    var ag = agrega(base, per.from, per.to);
    var ant = periodoAnterior(per.from, per.to);
    var minData = null;
    rows.forEach(function (d) { if (d.data && (!minData || d.data < minData)) minData = d.data; });
    var agAnt = (ant && minData && ant.to >= minData) ? agrega(base, ant.from, ant.to) : null;
    // tabela cruzada (ignora filtros de funil e origem, respeita SDR)
    var baseSdr = filtra(rows, { sdr: f.sdr, glob: f.glob, funil: '', origem: '' });
    var cruz = [];
    Object.keys(CFG.funis).forEach(function (fid) {
      var a = agrega(baseSdr.filter(function (d) { return d.funil === fid; }), per.from, per.to);
      cruz.push({ tipo: 'funil', key: fid, label: CFG.funis[fid].nome, cor: CFG.funis[fid].cor, a: a });
    });
    var origens = origensDe(rows);
    origens.forEach(function (o) {
      var a = agrega(baseSdr.filter(function (d) { return d.origem === o.key; }), per.from, per.to);
      cruz.push({ tipo: 'origem', key: o.key, label: o.label, cor: o.cor, a: a });
    });
    // atividades e movimento de etapas (mesmos filtros)
    var byId = {}; rows.forEach(function (d) { byId[d.id] = d; });
    var atv = null;
    if (ext.atv) {
      var ls = filtra(atvLinhas(ext.atv.dias, byId), f);
      var jn = janelaAtv(per, ext.atv.dias, ext.atv.semDado, ext.atv.ultimaRodada);
      var agA = agregaAtv(ls, per.from, per.to);
      var agAAnt = null;
      if (ant && ant.to >= CFG.atvInicio) { var jAnt = janelaAtv(ant, ext.atv.dias, null, ext.atv.ultimaRodada); if (jAnt.dias && !jAnt.sem.length && !jAnt.apur.ativo) agAAnt = agregaAtv(ls, ant.from, ant.to); }
      atv = { ag: agA, ant: agAAnt, jn: jn, serie: serieAtv(agA, jn, ext.atv.dias), linhas: ls };
    }
    var ini = null;
    if (ext.ini) {
      var dsd = iniDesde(f), aI = agregaIni(base, ext.ini.map, per.from, per.to);
      var aIAnt = (ant && ant.from >= dsd) ? agregaIni(base, ext.ini.map, ant.from, ant.to) : null;
      ini = { a: aI, ant: aIAnt, desde: dsd, parcial: per.from < dsd, serie: serieIniFin(base, ext.ini.map, per.from, per.to, gran), fin: finTotal(ag), finAnt: finTotal(agAnt),
              conf: conferir(rows, ext.ini, per) };
    }
    var etp = null;
    if (ext.etp && ext.etp.ativo && ext.etp.eventos && ext.etp.eventos.length) {
      etp = agregaEtp(etpLinhas(ext.etp.eventos, byId), per.from, per.to, f, ext.etapaNome || {});
      etp.desde = ext.etp.desde;
    }
    return { per: per, ant: ant, f: f, ag: ag, agAnt: agAnt, etapas: porEtapa(base, per.from, per.to),
             motivos: motivos(ag.lostM), serie: serie(base, per.from, per.to, gran), cruz: cruz, origens: origens, minData: minData, atv: atv, ini: ini, etp: etp };
  }

  // ---------- CSS (injetado uma vez) ----------
  var CSS = [
    '.s2{display:flex;flex-direction:column;gap:8px;font-family:var(--font,Montserrat,sans-serif);color:var(--text,#1a1626)}',
    '.s2 *{box-sizing:border-box}',
    '.s2-hd{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}',
    '.s2-ttl{font-size:11px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:var(--faint,#766e90)}',
    '.s2-ttl b{color:var(--purple,#704B9B);font-weight:800}',
    '.s2-fil{display:flex;gap:6px;flex-wrap:wrap;align-items:center}',
    '.s2-fg{display:flex;gap:3px;align-items:center;flex-wrap:wrap}',
    '.s2-fl{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--faint,#766e90);margin-right:2px}',
    '.s2-c{border:1px solid var(--border,#eae7f2);background:var(--card,#fff);color:var(--muted,#6b6484);font:inherit;font-size:10.5px;font-weight:700;padding:4px 9px;border-radius:999px;cursor:pointer;line-height:1.2}',
    '.s2-c.on{background:var(--purple,#704B9B);border-color:var(--purple,#704B9B);color:#fff}',
    '.s2-ks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
    '.s2-k{background:var(--card,#fff);border:1px solid var(--border,#eae7f2);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:2px;min-width:0;box-shadow:0 1px 3px rgba(26,22,38,.04),0 4px 14px -6px rgba(26,22,38,.08)}',
    '.s2-k[data-go]{cursor:pointer}',
    '.s2-dup{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;padding:7px 12px;border-radius:10px;border:1px dashed var(--border,#eae7f2);background:rgba(184,179,200,.12);color:#756f8c;font-size:11px;font-weight:700;line-height:1.3}',
    '.s2-dup[data-go]{cursor:pointer}',
    '.s2-dup b{font-size:15px;font-weight:800;color:#6b6484;font-variant-numeric:proportional-nums}',
    '.s2-dup .s2-dl{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.5px}',
    '.s2-kl{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--faint,#766e90)}',
    '.s2-kv{font-size:20px;font-weight:800;line-height:1.15;font-variant-numeric:proportional-nums}',
    '.s2-kd{font-size:10px;font-weight:800;margin-left:6px}',
    '.s2-kd.up{color:#15803d}.s2-kd.down{color:#b91c1c}.s2-kd.flat{color:var(--muted,#6b6484)}',
    '.s2-kt{font-size:10px;font-weight:600;color:var(--muted,#6b6484);line-height:1.3}',
    '.s2-k.ap{background:#fffbeb;border-color:#f3d28a}.s2-ap{display:inline-block;margin-left:5px;padding:1px 5px;border-radius:8px;background:#fde7b0;color:#92400e;font-size:9px;font-weight:800;letter-spacing:.2px;vertical-align:middle;white-space:nowrap}.s2-k.ap .s2-kt{color:#92400e}',
    '.s2-ban{background:#fffbeb;border:1px solid #f3d28a;color:#92400e;border-radius:8px;padding:6px 8px;font-size:11px;font-weight:700;margin-bottom:6px}',
    '.s2-k.gr{background:#f4f3f7}.s2-k.gr .s2-kv{color:#756f8c}',
    '.s2-k.gr .s2-kl,.s2-k.gr .s2-kt{color:#756f8c}',
    '.s2-card{background:var(--card,#fff);border:1px solid var(--border,#eae7f2);border-radius:14px;overflow:hidden;min-width:0;display:flex;flex-direction:column;box-shadow:0 1px 3px rgba(26,22,38,.04),0 4px 14px -6px rgba(26,22,38,.08)}',
    '.s2-ch{padding:9px 12px 7px;border-bottom:1px solid var(--border,#eae7f2);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0}',
    '.s2-ct{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--faint,#766e90)}',
    '.s2-cs{font-size:10px;font-weight:700;color:var(--purple,#704B9B)}',
    '.s2-cb{padding:8px 12px 10px;display:flex;flex-direction:column;gap:6px;min-height:0;flex:1}',
    '.s2-tb{width:100%;border-collapse:collapse;font-size:11px}',
    '.s2-tb th{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:var(--faint,#766e90);text-align:right;padding:2px 4px;white-space:nowrap}',
    '.s2-tb th:first-child,.s2-tb td:first-child{text-align:left}',
    '.s2-tb td{padding:4px 4px;text-align:right;font-variant-numeric:tabular-nums;border-top:1px solid #f4f2f8;font-weight:700}',
    '.s2-tb td.s2-sr{max-width:none!important;width:auto!important;white-space:normal!important;border-top:0;text-align:left}',
    '.s2.m .s2-tb.cr th{font-size:8.5px;letter-spacing:.1px;padding:2px 2px}',
    '.s2.m .s2-tb.cr td{padding:4px 2px;font-size:10.5px}',
    '.s2.m .s2-tb.cr td:first-child{width:auto;max-width:27vw;min-width:50px;overflow:hidden;text-overflow:ellipsis}',
    '.s2-tb td:first-child{max-width:0;width:44%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}',
    '.s2-tb tr.gr td{color:#756f8c;font-weight:600}',
    '.s2-tb td.z{color:#c9c5d6;font-weight:600}',
    '.s2-tb td.gc{color:#756f8c}',
    '.s2-tb td.qc{color:#15803d}.s2-tb td.pc{color:#b91c1c}',
    '.s2-tb tr[data-go]{cursor:pointer}.s2-tb tr[data-go]:hover td{background:#f8f6fc}',
    '.s2-sub{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;padding:6px 0 1px;display:flex;align-items:center;gap:6px}',
    '.s2-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;display:inline-block}',
    '.s2-mot{display:flex;flex-direction:column;gap:5px}',
    '.s2-mr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;align-items:center;cursor:pointer;font-size:11px;font-weight:700}',
    '.s2-mr span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.s2-mr i{grid-column:1/3;height:5px;border-radius:3px;background:var(--red,#dc2626);opacity:.75;display:block;min-width:2px}',
    '.s2-mr.gr{color:#756f8c;font-weight:600}.s2-mr.gr i{background:' + C_CINZA + ';opacity:1}',
    '.s2-chart{width:100%;display:block}',
    '.s2-lg{display:flex;gap:10px;flex-wrap:wrap;font-size:10px;font-weight:700;color:var(--muted,#6b6484)}',
    '.s2-lg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}',
    '.s2-nt{font-size:10.5px;line-height:1.4;color:var(--muted,#6b6484);font-weight:600}',
    '.s2-nt b{color:var(--text,#1a1626)}',
    '.s2-nt p{margin:0 0 4px}',
    '.s2-gs{background:#f4f3f7;border-color:#e3e0ec;box-shadow:none}',
    '.s2-gs .s2-ct,.s2-gs .s2-cs{color:#756f8c}',
    '.s2-gs .s2-tb td{color:#6f6a86;border-top-color:#e9e6f1}',
    '.s2-gs .s2-tb th{color:#9b97ac}',
    '.s2-gs .s2-tb td:first-child{width:auto;max-width:none;overflow:visible;text-overflow:clip;white-space:normal}.s2.m .s2-gs .s2-tb th.s2-gsh{font-size:8px;letter-spacing:0;padding-left:1px;padding-right:1px}',
    '.s2-tb th.s2-gsh{white-space:normal;line-height:1.15;vertical-align:bottom;cursor:help}.s2-i{opacity:.65;font-weight:600;text-transform:none}',
    '.s2-st{font-size:10px;font-weight:600;color:var(--muted,#6b6484)}',
    '.s2-st.warn{color:var(--amber,#b45309);font-weight:800}',
    '.s2-empty{padding:14px 10px;text-align:center;color:var(--faint,#766e90);font-size:12px;font-style:italic}',
    '.s2-det summary{cursor:pointer;font-size:11px;font-weight:800;color:var(--purple,#704B9B);padding:2px 0}',
    '.s2-etbar{background:linear-gradient(90deg,rgba(112,75,155,.14) var(--w,0%),transparent var(--w,0%))}',
    '.s2 > details.s2-card{margin-top:0}',
    '.s2-cov{font-size:10px;font-weight:600;color:var(--muted,#6b6484);line-height:1.4;margin-top:-2px}',
    '.s2-cov.warn{color:var(--amber,#b45309);font-weight:700}',
    '.s2-kt button{margin-top:3px}',
    '.s2-conf>summary{cursor:pointer;font-size:11px;font-weight:800;color:var(--purple,#704B9B)}.s2-tb.cf{table-layout:fixed}.s2-tb.cf td:first-child{max-width:none}.s2-tb.cf th{white-space:normal;line-height:1.15;vertical-align:bottom;padding:2px 2px;font-size:8.5px}.s2-tb.cf td{padding:4px 2px;white-space:normal;overflow-wrap:anywhere;font-size:10.5px}.s2-tb.cf th:nth-child(2),.s2-tb.cf th:nth-child(3){width:15%}.s2-tb.cf th:nth-child(4){width:17%}',
    '.s2-tb tr.s2-gsin td{color:#5b5670;background:#ece9f4}',
    '.s2-empty button{font:inherit}',
    /* PC e tablet: colunas que se completam (sem buracos) */
    '.s2.m[data-w="m"] .s2-ks,.s2.m[data-w="g"] .s2-ks{grid-template-columns:repeat(5,minmax(0,1fr))}',
    '.s2.m[data-w="x"] .s2-ks{grid-template-columns:repeat(5,minmax(0,1fr))}',
    '.s2.m[data-w="m"] .s2-body,.s2.m[data-w="g"] .s2-body,.s2.m[data-w="x"] .s2-body{display:block;column-gap:8px;column-fill:balance}',
    '.s2.m[data-w="m"] .s2-body{column-count:2}',
    '.s2.m[data-w="g"] .s2-body,.s2.m[data-w="x"] .s2-body{column-count:3}',
    '.s2.m[data-w="m"] .s2-body>*,.s2.m[data-w="g"] .s2-body>*,.s2.m[data-w="x"] .s2-body>*{break-inside:avoid;margin-bottom:8px;display:flex}',
    '.s2.m .s2-body.pack{display:flex!important;flex-direction:row!important;column-count:auto!important;gap:8px;align-items:stretch}',
    '.s2.m .s2-body.pack>.s2-col{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:8px}',
    '.s2.m .s2-body.pack>.s2-col>*{margin-bottom:0!important}',
    '.s2.m .s2-body.pack>.s2-col>.s2-fill{flex:1 1 auto}',
    '.s2.m .s2-body.pack>.s2-col>.s2-fill>.s2-cb{justify-content:space-between}',
    '.s2.m[data-w="m"] .s2-body>details,.s2.m[data-w="g"] .s2-body>details,.s2.m[data-w="x"] .s2-body>details{display:block}',
    /* mobile estreito: 390px */
    '.s2.m .s2-body{display:flex;flex-direction:column;gap:8px}',
    '.s2.m .s2-tb{font-size:11px}',
    '.s2.m .s2-tb td:first-child{width:38%}',
    '.s2-hs{display:none}.s2-tb td.s2-sub{display:table-cell}',
    '@media (max-width:370px){.s2-hl{display:none}.s2-hs{display:inline}.s2.m .s2-tb.cr{table-layout:fixed}.s2.m .s2-tb.cr th:first-child{width:25%}.s2.m .s2-tb.cr th{font-size:7.5px;letter-spacing:0;padding-left:1px;padding-right:1px}.s2.m .s2-tb.cr td{padding-left:1px;padding-right:1px;font-size:10px}.s2.m .s2-tb.cr td:first-child{min-width:0;width:auto;overflow:hidden;text-overflow:ellipsis}.s2.m .s2-gs .s2-tb{table-layout:fixed}.s2.m .s2-gs .s2-tb th:first-child{width:22%}.s2.m .s2-gs .s2-tb th.s2-gsh{font-size:7.5px}.s2.m .s2-gs .s2-tb .s2-i{display:none}}',
    '@media (max-width:370px){.s2.m .s2-tb{font-size:10px}.s2.m .s2-tb td,.s2.m .s2-tb th{padding-left:2px;padding-right:2px}.s2.m .s2-tb.cr td:first-child{width:27%}.s2.m .s2-cb{padding-left:9px;padding-right:9px}}',
    /* telão (30/10, Robert: letras miúdas e cartões espremidos): nada de encolher fonte.
       Os KPIs ficam sempre na tela (2 linhas x 5, cartões altos); os blocos viram 3 PÁGINAS que trocam sozinhas
       (controladas por legivel.js via data-pg). A densidade só mexe em espaçamento. */
    '.s2.tv{flex:1;min-height:0;gap:8px;overflow:hidden;display:flex;flex-direction:column}',
    '.s2.tv .s2-hd{flex-shrink:0;flex-wrap:nowrap}',
    '.s2.tv .s2-ks{grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;flex-shrink:0}',
    '.s2.tv .s2-k{padding:8px 12px;border-radius:12px;justify-content:center;min-height:68px}',
    '.s2.tv .s2-kv{font-size:22px}',
    '.s2.tv .s2-kt{font-size:10.5px}',
    '.s2.tv .s2-kl{font-size:9px}',
    '.s2.tv .s2-kd{font-size:10.5px}',
    '.s2.tv .s2-dup{margin-top:0;padding:5px 12px;flex-shrink:0;font-size:10.5px}',
    '.s2.tv .s2-dup .s2-dl{font-size:9px}',
    '.s2.tv .s2-body{flex:1;min-height:0;display:block;overflow:hidden}',
    '.s2.tv .s2-pg{height:100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;min-height:0}',
    '.s2.tv .s2-pg>.s2-card{min-height:0}',
    '.s2.tv .s2-card{min-height:0}',
    '.s2.tv .s2-ch{padding:8px 12px 6px}',
    '.s2.tv .s2-ct{font-size:10.5px}',
    '.s2.tv .s2-cs{font-size:10.5px}',
    '.s2.tv .s2-cb{overflow:hidden;padding:8px 12px 10px;gap:6px;justify-content:flex-start}',
    '.s2.tv .s2-tb{font-size:11px}',
    '.s2.tv .s2-tb td{padding:var(--tp,4px) 4px}',
    '.s2.tv .s2-tb th{font-size:9px}',
    '.s2.tv .s2-mot{gap:7px}',
    '.s2.tv .s2-mr{font-size:11px}',
    '.s2.tv .s2-nt{font-size:10.5px}',
    '.s2.tv .s2-lg,.s2.tv .s2-cov,.s2.tv .s2-st{font-size:10.5px}',
    '.s2.tv .s2-fl{font-size:9px}',
    '.s2.tv .s2-c{font-size:10.5px;padding:4px 10px}',
    '.s2.tv .s2-sub{font-size:9px}',
    '.s2.tv .s2-chart{flex-shrink:0}',
    '.s2-card .s2-xp{margin-left:6px}'
  ].join('\n');

  function injetaCss() {
    if (document.getElementById('s2-css')) return;
    var st = document.createElement('style'); st.id = 's2-css'; st.textContent = CSS; document.head.appendChild(st);
  }

  // ---------- Renderização ----------
  function delta(atual, ant, sufixo) {
    if (ant == null) return '';
    var d = atual - ant;
    var cls = d > 0 ? 'up' : (d < 0 ? 'down' : 'flat');
    var seta = d > 0 ? '▲' : (d < 0 ? '▼' : '=');
    return '<span class="s2-kd ' + cls + '" title="vs período anterior equivalente">' + seta + ' ' + (d > 0 ? '+' : '') + num(d) + (sufixo || '') + '</span>';
  }
  function chip(label, val, sub, o) {
    o = o || {};
    return '<div class="s2-k' + (o.cinza ? ' gr' : '') + (o.apur ? ' ap' : '') + '"' + (o.go ? ' data-go="' + o.go + '"' : '') + (o.tip ? ' title="' + esc(o.tip) + '"' : '') + '>' +
      '<span class="s2-kl">' + label + '</span><span class="s2-kv">' + val + (o.delta || '') + '</span>' +
      '<span class="s2-kt">' + sub + '</span></div>';
  }

  // "Em apuração": o Agendor ainda não terminou de atribuir tarefas lidas ao funil (pend), ou o dia está incompleto/pendente,
  // ou a última leitura falhou. Nesse caso o número é parcial e NUNCA é apresentado como final nem comparado com o período anterior.
  function apurTexto(jn) {
    var ap = jn.apur, ds = ap.dias.slice(0, 3).map(dm).join(', ') + (ap.dias.length > 3 ? '...' : '');
    if (ap.pend > 0) return 'faltam ' + num(ap.pend) + (ap.pend === 1 ? ' tarefa' : ' tarefas') + ' a atribuir (' + (ap.dias.length === 1 ? 'dia ' : 'dias ') + ds + ')';
    if (ap.dias.length) return (ap.dias.length === 1 ? 'dia ' : 'dias ') + ds + ' com leitura incompleta do Agendor';
    return 'a última leitura do Agendor falhou; o valor pode estar incompleto';
  }
  var TIP_LIDAS = 'Total lido = tudo que o Agendor devolveu como concluído no período, sem filtros: feitas pelo SDR + fechadas junto + notas e migração do GS (não são trabalho) + tarefas em negócios fora dos funis SDR + tarefas do Sistema (a Bia) + tarefas de outras pessoas + tarefas ainda sem negócio identificado (a atribuir). Só "feitas pelo SDR" entra no cartão Atividades; o resto é lido para conferência e não conta como trabalho do SDR.';
  function chipAtividades(r) {
    var tip = 'Tarefas concluídas no Agendor pelo SDR no período (WhatsApp, ligação, pesquisa...). As encerradas no mesmo instante do ganho/perda do negócio ficam à parte ("fechadas junto") e não entram aqui.';
    if (!S.atv) return S.atvErr ? chip('Atividades', 'n/d', 'não consegui ler agora', { cinza: true, tip: tip }) : chip('Atividades', '…', 'carregando', { cinza: true, tip: tip });
    var t = r.atv;
    if (t.jn.antes) return chip('Atividades', 'n/d', 'Agendor só desde ' + dm(CFG.atvInicio) + ' (antes: faixa do GS)', { cinza: true, tip: tip });
    var a = t.ag, p = t.ant, ap = t.jn.apur;
    // 30/10: ligação é tarefa normal. O detalhe por tipo é só composição (todos os tipos no mesmo pé).
    var porTipo = TIPOS.map(function (x) { return { n: a.a[x[0]] || 0, l: x[1].toLowerCase() }; }).filter(function (x) { return x.n > 0; }).sort(function (u, v) { return v.n - u.n; }).slice(0, 3);
    var sub = (porTipo.length ? 'por tipo: ' + porTipo.map(function (x) { return num(x.n) + ' ' + x.l; }).join(' · ') : 'por tipo: sem tarefas') + (a.junto ? ' · ' + num(a.junto) + ' fechadas junto' : '');
    if (t.jn.sem.length) sub += ' · ' + t.jn.sem.length + (t.jn.sem.length === 1 ? ' dia sem dado' : ' dias sem dado');
    if (ap.ativo) {
      var tipAp = 'EM APURAÇÃO: este valor é parcial e vai subir. ' + apurTexto(t.jn) + '. Total lido no Agendor até agora: ' + num(t.jn.bruto.lidas) + ' tarefas (' + num(t.jn.bruto.pend) + ' ainda a atribuir). ' + tip;
      return chip('Atividades ⓘ', num(a.feitas) + '<span class="s2-ap">em apuração</span>', apurTexto(t.jn) + ' · ' + sub, { tip: tipAp, apur: true });
    }
    return chip('Atividades ⓘ', num(a.feitas), sub, { tip: tip, delta: delta(a.feitas, p ? p.feitas : null) });
  }

  function tipIni() { return 'Leads que o SDR começou a trabalhar no período. Outbound: o dia em que o Felipe clicou em Iniciar (a Bia guarda esse dia num marcador; só existe desde ' + dm(CFG.iniOutDesde) + '). Inbound: o lead já nasce em cadência (D0/D1 automático), então vale o dia da criação do negócio; se o lead esperou na fila e foi liberado à mão, vale o dia da liberação. Segue todos os filtros da aba.'; }
  function iniSub(t) {
    var a = t.a, sub = num(a.outN) + ' Outbound · ' + num(a.inN) + ' Inbound';
    if (t.parcial) sub += ' · Outbound só desde ' + dm(t.desde);
    return sub;
  }
  function chipIniciados(r) {
    var tip = tipIni();
    if (!S.ini) return S.iniErr ? chip('Iniciados', 'n/d', 'não consegui ler agora <button class="s2-c" data-retry="ini">Tentar de novo</button>', { cinza: true, tip: tip }) : chip('Iniciados', '…', 'carregando', { cinza: true, tip: tip });
    var t = r.ini, a = t.a;
    if (S.ini.parcial) {
      return chip('Iniciados ⓘ', num(a.n) + '<span class="s2-ap">em apuração</span>', 'ainda lendo os marcadores do Outbound (a Bia termina na próxima rodada) · ' + iniSub(t), { tip: 'EM APURAÇÃO: o valor é parcial e vai subir. ' + tip, apur: true, go: 'ini' });
    }
    var tipFull = tip + (t.parcial ? ' Neste período o Outbound está incompleto: antes de ' + dm(t.desde) + ' o dia do clique não foi guardado.' : '') + ' Saldo no período (iniciados menos finalizados): ' + (a.n - t.fin >= 0 ? '+' : '') + num(a.n - t.fin) + '.';
    return chip('Iniciados ⓘ', num(a.n), iniSub(t), { tip: tipFull, go: 'ini', delta: delta(a.n, t.ant ? t.ant.n : null) });
  }
  var TIP_FIN = 'Leads que saíram da cadência no período, pela data real do evento (nunca a data de ganho antiga): qualificados (ganho) + perdidos pelo SDR + cadência esgotada + duplicados. O duplicado não é decisão do SDR e fica fora da conversão, mas o lead saiu da cadência, por isso conta aqui. Segue todos os filtros da aba.';
  function chipFinalizados(r) {
    var a = r.ag, p = r.agAnt, tot = finTotal(a);
    var comp = num(a.q) + ' qualif. · ' + num(a.pm) + ' perd. · ' + num(a.ps) + ' esgot. · ' + num(a.pd) + ' dup.';
    return chip('Finalizados ⓘ', num(tot), comp, { tip: TIP_FIN + ' Composição: ' + comp + '.', go: 'fin', delta: delta(tot, p ? finTotal(p) : null) });
  }

  function htmlKpis(r) {
    var a = r.ag, p = r.agAnt;
    var convPct = a.conv == null ? 'n/d' : pct(a.q, a.q + a.pm);
    var convPrev = p && p.conv != null ? p.conv : null;
    var convDelta = '';
    if (convPrev != null && a.conv != null) {
      var dd = Math.round((a.conv - convPrev) * 1000) / 10;
      convDelta = '<span class="s2-kd ' + (dd > 0 ? 'up' : (dd < 0 ? 'down' : 'flat')) + '" title="vs período anterior equivalente">' + (dd > 0 ? '▲ +' : (dd < 0 ? '▼ ' : '= ')) + dec1(dd) + ' p.p.</span>';
    }
    var tempo = a.diasN ? dec1(a.diasMedia) + ' d' : 'n/d';
    var tempoSub = a.diasN ? ('mediana ' + dec1(a.diasMed) + ' d · ' + a.diasN + (a.diasN === 1 ? ' negócio' : ' negócios')) : 'sem negócio com data de entrada';
    if (a.diasGS) tempoSub += ' · ' + a.diasGS + ' com entrada do GS';
    if (a.migradosGanhos) tempoSub += ' · ' + a.migradosGanhos + ' migrados do GS sem data fora';
    return chipIniciados(r) + chipFinalizados(r) +
      chip('Qualificados', num(a.q), 'ganhos no funil SDR', { go: 'won', delta: delta(a.q, p ? p.q : null) }) +
      chip('Perdidos pelo SDR', num(a.pm), 'decisão do SDR (conta na conversão; sem duplicados)', { go: 'lostM', delta: delta(a.pm, p ? p.pm : null) }) +
      chip('Conversão ⓘ', convPct, 'sem esgotada e duplicados · geral: <b>' + (a.convGeral == null ? 'n/d' : pct(a.q, a.q + a.pm + a.ps)) + '</b>',
        { tip: 'Principal: qualificados ÷ (qualificados + perdidos pelo SDR). Fora da conta: cadência esgotada (recuperável) e perdidos com motivo Duplicado (não é decisão do SDR). Geral: inclui também a cadência esgotada; duplicados ficam fora das duas.', delta: convDelta }) +
      chip('Cadência esgotada', num(a.ps), 'sistema, recuperável (fora da conversão)', { cinza: true, go: 'lostS' }) +
      chip('Em cadência agora', num(a.ong.length), 'abertos nas etapas D1 a D10', { go: 'ong' }) +
      chip('Fim da cadência', num(a.fim.length), 'aguardando, recuperáveis', { cinza: true, go: 'fim' }) +
      chip('Tempo até qualificar ⓘ', tempo, tempoSub, { tip: 'Da entrada do contato até o ganho. Contatos migrados do GS usam a data em que entraram na cadência do GS (tabela de carga); os demais, a criação do negócio no Agendor.' }) +
      chipAtividades(r);
  }

  function htmlDuplicados(r) {
    var a = r.ag, p = r.agAnt;
    return '<div class="s2-dup" data-go="lostD" title="Perdidos com motivo Duplicado. Não são decisão do SDR: ficam fora dos perdidos e da conversão. Clique para ver a lista.">' +
      '<span class="s2-dl">Duplicados (fora da conta)</span><b>' + num(a.pd) + '</b>' +
      '<span>' + (a.pd ? 'perdidos como Duplicado no período · clique para ver a lista' : 'nenhum perdido como Duplicado no período') + (p ? ' · período anterior: ' + num(p.pd) : '') + '</span></div>';
  }
  function htmlEtapas(r) {
    var h = '';
    Object.keys(CFG.funis).forEach(function (fid) {
      if (r.f.funil && r.f.funil !== fid) return;
      var linhas = r.etapas[fid] || [];
      var max = 1; linhas.forEach(function (l) { if (l.agora > max) max = l.agora; });
      h += '<div class="s2-sub" style="color:' + CFG.funis[fid].cor + '"><i class="s2-dot" style="background:' + CFG.funis[fid].cor + '"></i>' + esc(CFG.funis[fid].nome) + '</div>';
      if (!linhas.length) { h += '<div class="s2-empty">Sem negócios neste funil</div>'; return; }
      h += '<table class="s2-tb"><thead><tr><th>Etapa</th><th>Agora</th><th>Qualif.</th><th>Perdidos</th><th>Esgot.</th><th title="Duplicados (fora da conta)">Dup.</th></tr></thead><tbody>';
      linhas.forEach(function (l) {
        var fim = CFG.etapaFim.test(l.nome);
        function c(v, cls) { return '<td class="' + (v ? (cls || '') : 'z') + '">' + (v ? num(v) : '·') + '</td>'; }
        h += '<tr' + (fim ? ' class="gr"' : '') + '><td class="s2-etbar" style="--w:' + Math.round(l.agora / max * 100) + '%" title="' + esc(l.nome) + '">' + esc(l.nome) + '</td>' +
          c(l.agora) + c(l.q, 'qc') + c(l.pm, 'pc') + c(l.ps, 'gc') + c(l.pd, 'gc') + '</tr>';
      });
      h += '</tbody></table>';
    });
    h += '<div class="s2-nt s2-xs">Agora = abertos hoje. Qualif., Perdidos, Esgot. e Dup. (duplicados, fora da conta) = o que aconteceu no período, na etapa em que o negócio estava. ' + (r.etp ? 'A passagem entre etapas está no bloco Movimento entre etapas.' : 'O movimento entre etapas aparece aqui assim que houver histórico (avisos do Agendor).') + '</div>';
    return h;
  }

  // telão: a altura do gráfico acompanha a tela (aproveita o espaço sem estourar)
  function alturaGraf() {
    var rw = (S.root && S.root.clientWidth) || 1800;
    var cw = Math.max(300, (rw - 16) * 0.43 - 24);
    return 270; // 30/10: altura fixa, a escala do palco já cuida do tamanho na TV
  }
  function fz(sv, tv) { return tv ? sv.replace(/font-size="([0-9.]+)"/g, function (m, n) { return parseFloat(n) < 10 ? 'font-size="10"' : m; }) : sv; } // 30/10: texto de gráfico >= 10 no telão
  function svgChart(r, tv) {
    var sr = r.serie, b = sr.baldes;
    if (!b.length) return '<div class="s2-empty">Sem qualificados nem perdas neste período</div>';
    var W = tv ? 440 : (S.cw || 340), H = tv ? alturaGraf() : 160, padL = 24, padR = 4, padT = 14, padB = 20;
    var max = 1; b.forEach(function (x) { if (x.q > max) max = x.q; if (x.pm > max) max = x.pm; });
    max = Math.max(max, 2);
    var iw = W - padL - padR, ih = H - padT - padB, gw = iw / b.length;
    var bw = Math.max(2, Math.min(tv ? 22 : 14, gw * 0.36));
    var s = '<svg class="s2-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Qualificados e perdidos pelo SDR por ' + (sr.gran === 'd' ? 'dia' : sr.gran === 's' ? 'semana' : 'mês') + '">';
    [0, 0.5, 1].forEach(function (f) {
      var y = padT + ih - ih * f;
      s += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y + '" y2="' + y + '" stroke="#eae7f2" stroke-width="1"/>' +
        '<text x="' + (padL - 4) + '" y="' + (y + 3) + '" text-anchor="end" font-size="9" fill="#766e90">' + Math.round(max * f) + '</text>';
    });
    var passo = Math.ceil(b.length / (tv ? 14 : 7));
    b.forEach(function (x, i) {
      var cx = padL + gw * i + gw / 2;
      var hq = ih * x.q / max, hp = ih * x.pm / max;
      var rot = sr.gran === 'm' ? nomeMes(x.k + '-01') : dm(x.k);
      var tip = rot + ': ' + x.q + ' qualificados, ' + x.pm + ' perdidos pelo SDR, ' + x.ps + ' cadência esgotada, ' + x.pd + ' duplicados (fora da conta)';
      s += '<g><title>' + esc(tip) + '</title>' +
        '<rect x="' + (cx - bw - 1) + '" y="' + (padT + ih - hq) + '" width="' + bw + '" height="' + Math.max(hq, x.q ? 1 : 0) + '" rx="2" fill="' + C_GANHO + '"/>' +
        '<rect x="' + (cx + 1) + '" y="' + (padT + ih - hp) + '" width="' + bw + '" height="' + Math.max(hp, x.pm ? 1 : 0) + '" rx="2" fill="' + C_PERDA + '" opacity=".8"/>';
      if (b.length <= (tv ? 16 : 11)) {
        if (x.q) s += '<text x="' + (cx - bw / 2 - 1) + '" y="' + (padT + ih - hq - 3) + '" text-anchor="middle" font-size="9" font-weight="800" fill="#15803d">' + x.q + '</text>';
        if (x.pm) s += '<text x="' + (cx + bw / 2 + 1) + '" y="' + (padT + ih - hp - 3) + '" text-anchor="middle" font-size="9" font-weight="800" fill="#b91c1c">' + x.pm + '</text>';
      }
      if (i % passo === 0) s += '<text x="' + cx + '" y="' + (H - 7) + '" text-anchor="middle" font-size="9" fill="#6b6484">' + rot + '</text>';
      s += '</g>';
    });
    s += '</svg>';
    // faixa cinza própria da cadência esgotada (escala separada, para não esmagar o resto)
    var maxS = 0; b.forEach(function (x) { if (x.ps > maxS) maxS = x.ps; });
    if (maxS > 0) {
      var H2 = 34, ih2 = 22;
      var s2 = '<svg class="s2-chart" viewBox="0 0 ' + W + ' ' + H2 + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Cadência esgotada por período">';
      b.forEach(function (x, i) {
        var cx = padL + gw * i + gw / 2, h2 = ih2 * x.ps / maxS;
        s2 += '<g><title>' + esc((sr.gran === 'm' ? nomeMes(x.k + '-01') : dm(x.k)) + ': ' + x.ps + ' cadência esgotada') + '</title><rect x="' + (cx - bw) + '" y="' + (H2 - h2 - 2) + '" width="' + (bw * 2) + '" height="' + Math.max(h2, x.ps ? 1 : 0) + '" rx="2" fill="' + C_CINZA + '"/>' +
          (b.length <= (tv ? 16 : 11) && x.ps ? '<text x="' + cx + '" y="' + (H2 - h2 - 4) + '" text-anchor="middle" font-size="8.5" font-weight="700" fill="#756f8c">' + x.ps + '</text>' : '') + '</g>';
      });
      s2 += '</svg>';
      s += '<div class="s2-esg"><div class="s2-st" style="margin-top:2px">Cadência esgotada por ' + (sr.gran === 'd' ? 'dia' : sr.gran === 's' ? 'semana' : 'mês') + ' (cinza, escala própria, máx. ' + maxS + ')</div>' + s2 + '</div>';
    }
    return fz(s, tv);
  }

  function htmlGrafico(r, tv) {
    var gran = r.serie.gran;
    var tg = tv ? '' : '<div class="s2-fg">' + [['d', 'Dia'], ['s', 'Semana'], ['m', 'Mês']].map(function (g) {
      return '<button class="s2-c' + (gran === g[0] ? ' on' : '') + '" data-gran="' + g[0] + '">' + g[1] + '</button>';
    }).join('') + '</div>';
    return tg + svgChart(r, tv) +
      '<div class="s2-lg"><span><i style="background:' + C_GANHO + '"></i>Qualificados</span><span><i style="background:' + C_PERDA + ';opacity:.8"></i>Perdidos pelo SDR</span><span><i style="background:' + C_CINZA + '"></i>Cadência esgotada</span></div>';
  }


  function svgIniFin(r, tv) {
    var sr = r.ini.serie, b = sr.baldes;
    if (!b.length) return '<div class="s2-empty">Sem iniciados nem finalizados neste período</div>';
    var W = tv ? 440 : (S.cw || 340), H = tv ? Math.round(alturaGraf() * 0.8) : 150, padL = 26, padR = 4, padT = 14, padB = 20;
    var max = 2; b.forEach(function (x) { if (x.i > max) max = x.i; if (x.f > max) max = x.f; });
    var iw = W - padL - padR, ih = H - padT - padB, gw = iw / b.length, bw = Math.max(2, Math.min(tv ? 22 : 14, gw * 0.36));
    var gl = sr.gran === 'd' ? 'dia' : sr.gran === 's' ? 'semana' : 'mês';
    var s = '<svg class="s2-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Iniciados e finalizados por ' + gl + '">';
    [0, 0.5, 1].forEach(function (f) { var y = padT + ih - ih * f; s += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y + '" y2="' + y + '" stroke="#eae7f2" stroke-width="1"/><text x="' + (padL - 4) + '" y="' + (y + 3) + '" text-anchor="end" font-size="9" fill="#766e90">' + num(max * f) + '</text>'; });
    var passo = Math.ceil(b.length / (tv ? 14 : 7));
    b.forEach(function (x, i) {
      var cx = padL + gw * i + gw / 2, hi = ih * x.i / max, hf = ih * x.f / max, rot = sr.gran === 'm' ? nomeMes(x.k + '-01') : dm(x.k);
      s += '<g><title>' + esc(rot + ': ' + x.i + ' iniciados, ' + x.f + ' finalizados') + '</title>' +
        '<rect x="' + (cx - bw - 1) + '" y="' + (padT + ih - hi) + '" width="' + bw + '" height="' + Math.max(hi, x.i ? 1 : 0) + '" rx="2" fill="' + CFG.corIni + '"/>' +
        '<rect x="' + (cx + 1) + '" y="' + (padT + ih - hf) + '" width="' + bw + '" height="' + Math.max(hf, x.f ? 1 : 0) + '" rx="2" fill="' + CFG.corFin + '"/>';
      if (b.length <= (tv ? 16 : 11)) {
        if (x.i) s += '<text x="' + (cx - bw / 2 - 1) + '" y="' + (padT + ih - hi - 3) + '" text-anchor="middle" font-size="9" font-weight="800" fill="' + CFG.corIni + '">' + num(x.i) + '</text>';
        if (x.f) s += '<text x="' + (cx + bw / 2 + 1) + '" y="' + (padT + ih - hf - 3) + '" text-anchor="middle" font-size="9" font-weight="800" fill="#0b7378">' + num(x.f) + '</text>';
      }
      if (i % passo === 0) s += '<text x="' + cx + '" y="' + (H - 7) + '" text-anchor="middle" font-size="9" fill="#6b6484">' + rot + '</text>';
      s += '</g>';
    });
    return fz(s + '</svg>', tv);
  }
  function htmlIniFin(r, tv) {
    if (!S.ini) return S.iniErr ? '<div class="s2-empty">Não consegui ler os iniciados agora.<br><button class="s2-c" data-retry="ini" style="margin-top:6px">Tentar de novo</button></div>' : '<div class="s2-empty">Carregando iniciados…</div>';
    var t = r.ini, a = t.a, gran = t.serie.gran;
    var tg = tv ? '' : '<div class="s2-fg">' + [['d', 'Dia'], ['s', 'Semana'], ['m', 'Mês']].map(function (g) { return '<button class="s2-c' + (gran === g[0] ? ' on' : '') + '" data-gran="' + g[0] + '">' + g[1] + '</button>'; }).join('') + '</div>';
    var saldo = a.n - t.fin;
    var h = tg + svgIniFin(r, tv) + '<div class="s2-lg"><span><i style="background:' + CFG.corIni + '"></i>Iniciados</span><span><i style="background:' + CFG.corFin + '"></i>Finalizados</span></div>' +
      '<div class="s2-nt"><b>Saldo do período:</b> ' + num(a.n) + ' iniciados − ' + num(t.fin) + ' finalizados = <b>' + (saldo > 0 ? '+' : '') + num(saldo) + '</b>' +
      '<span class="s2-xs"> · <b>' + num(a.abertos) + '</b> dos iniciados ainda estão em cadência</span></div>';
    if (t.parcial) h += '<div class="s2-nt s2-xs" style="color:var(--amber,#b45309)">Outbound: o dia do clique em Iniciar só existe desde ' + dmy(t.desde) + '. Antes disso os iniciados do Outbound não aparecem (os finalizados aparecem sempre).</div>';
    return h;
  }
  function celDif(d) { return d === 0 ? '<td class="qc">confere</td>' : '<td class="pc">dif. ' + (d > 0 ? '+' : '') + num(d) + '</td>'; }
  function htmlConferencia(r) {
    var c = r.ini && r.ini.conf; if (!c) return '<div class="s2-empty">Aguardando a leitura dos iniciados…</div>';
    var f = c.fin, i = c.ini;
    var h = '<table class="s2-tb cf"><thead><tr><th>Conferência (sem filtros locais)</th><th>Dash</th><th>Outra fonte</th><th>Situação</th></tr></thead><tbody>';
    function lin(nome, dash, outra, fonte, dif) { return '<tr><td style="white-space:normal;max-width:none;width:46%">' + nome + '<div class="s2-st" style="font-weight:600">' + fonte + '</div></td><td>' + num(dash) + '</td><td>' + (outra == null ? '·' : num(outra)) + '</td>' + (dif == null ? '<td class="z">·</td>' : celDif(dif)) + '</tr>'; }
    h += '<tr><td colspan="4" class="s2-sr s2-sub" style="padding:2px 4px 1px;color:var(--faint)">Iniciados</td></tr>';
    if (i) {
      h += lin('Iniciados com marcador', i.marcDash, i.marcKv, 'negócios do Dash com marcador × marcadores no KV' + (i.marcSemNeg ? ' (' + num(i.marcSemNeg) + ' sem negócio na tabela)' : ''), i.marcDash - (i.marcKv - i.marcSemNeg));
      h += lin('Outbound, dias com contador (' + num(i.cotaDias) + ' de ' + num(i.diasPedidos) + ' dias)', i.marcDiasCotaOut, i.cotaSoma, 'marcadores do Outbound × soma dos contadores diários (o contador só vive 5 dias)', i.cotaDias ? i.marcDiasCotaOut - i.cotaSoma : null);
      h += lin('Inbound sem marcador (pela criação do negócio)', i.cria, null, 'não tem contador nem marcador: nasce em cadência', null);
      h += lin('Iniciados no cartão (sem filtros)', i.dash, i.marcDash + i.cria, 'com marcador + pela criação', i.dash - (i.marcDash + i.cria));
      h += '<tr><td colspan="4" class="s2-nt" style="white-space:normal;border-top:0;font-weight:600">Outbound sem dia de início guardado: <b>' + num(i.semOut) + '</b> (anteriores ao controle de cota ou ainda na fila). Não entram nos iniciados.</td></tr>';
    } else h += '<tr><td colspan="4" class="s2-empty">Iniciados indisponíveis agora</td></tr>';
    h += '<tr><td colspan="4" class="s2-sr s2-sub" style="padding:5px 4px 1px;color:var(--faint)">Finalizados</td></tr>';
    h += lin('Finalizados no cartão', f.cartao, f.partes, 'qualif. ' + num(f.q) + ' + perd. ' + num(f.pm) + ' + esgot. ' + num(f.ps) + ' + dup. ' + num(f.pd), f.cartao - f.partes);
    h += lin('Finalizados × contagem direta', f.cartao, f.direto, 'ganhos ' + num(f.wDir) + ' + perdidos ' + num(f.lDir) + ' com data no período', f.cartao - f.direto);
    h += lin('Perdidos, esgotados e duplicados', f.perdasTab, f.lDir, 'soma das 3 linhas da aba × perdidos contados direto', f.perdasTab - f.lDir);
    h += '<tr><td colspan="4" class="s2-nt" style="white-space:normal;border-top:0;font-weight:600">Fechados sem data de evento (fora de qualquer período): <b>' + num(f.semData) + '</b>.</td></tr>';
    return h + '</tbody></table>';
  }

  function htmlCruzada(r) {
    function linha(c) {
      var a = c.a;
      var conv = (a.q + a.pm) ? pct(a.q, a.q + a.pm) : 'n/d';
      function cel(v, cls) { return '<td class="' + (v ? (cls || '') : 'z') + '">' + (v ? num(v) : '·') + '</td>'; }
      return '<tr data-go="' + c.tipo + ':' + c.key + '"><td title="' + esc(c.label) + '"><i class="s2-dot" style="background:' + c.cor + ';margin-right:5px"></i>' + esc(c.label) + '</td>' +
        cel(a.q, 'qc') + cel(a.pm, 'pc') + cel(a.ps, 'gc') + cel(a.pd, 'gc') + '<td>' + conv + '</td>' + cel(a.ong.length) + '</tr>';
    }
    var h = '<table class="s2-tb cr"><thead><tr><th>&nbsp;</th><th>Qualif.</th><th>Perd.</th><th>Esgot.</th><th title="Duplicados (fora da conta)">Dup.</th><th>Conv.</th><th>Agora</th></tr></thead><tbody>';
    var fun = r.cruz.filter(function (c) { return c.tipo === 'funil'; }), ori = r.cruz.filter(function (c) { return c.tipo === 'origem'; });
    h += '<tr><td colspan="7" class="s2-sr s2-sub" style="padding:2px 4px 1px;color:var(--faint)">Por funil</td></tr>' + fun.map(linha).join('');
    h += '<tr><td colspan="7" class="s2-sr s2-sub" style="padding:5px 4px 1px;color:var(--faint)">Por origem</td></tr>' + ori.map(linha).join('');
    h += '</tbody></table><div class="s2-nt s2-xs">Origem pela regra do Dash. Clique numa linha para filtrar a aba.</div>';
    return h;
  }

  function htmlMotivos(r) {
    var m = r.motivos, a = r.ag;
    var max = 1; m.forEach(function (x) { if (x.n > max) max = x.n; });
    if (a.ps > max) max = Math.max(max, a.ps);
    if (a.pd > max) max = a.pd;
    var h = '<div class="s2-mot">';
    if (!m.length && !a.ps && !a.pd) return '<div class="s2-empty">Sem perdas neste período</div>';
    h += '<div class="s2-sub" style="color:#b91c1c;padding-top:0">Decididos pelo SDR · ' + num(a.pm) + '</div>';
    if (!m.length) h += '<div class="s2-st">nenhuma perda manual no período</div>';
    m.forEach(function (x, i) {
      h += '<div class="s2-mr" data-mot="' + i + '" title="' + esc(x.motivo) + '"><span>' + esc(x.motivo) + '</span><span>' + num(x.n) + ' · ' + pct(x.n, a.pm) + '</span><i style="width:' + Math.max(3, Math.round(x.n / max * 100)) + '%"></i></div>';
    });
    h += '<div class="s2-sub" style="color:#756f8c">Pelo sistema · recuperável</div>';
    h += '<div class="s2-mr gr" data-mot="s" title="Cadência esgotada"><span>Cadência esgotada</span><span>' + num(a.ps) + '</span><i style="width:' + Math.max(3, Math.round(a.ps / max * 100)) + '%"></i></div>';
    h += '<div class="s2-sub" style="color:#756f8c">Fora da conta · não é decisão do SDR</div>';
    h += '<div class="s2-mr gr" data-mot="d" title="Duplicado (fora da conta)"><span>Duplicado (fora da conta)</span><span>' + num(a.pd) + '</span><i style="width:' + (a.pd ? Math.max(3, Math.round(a.pd / max * 100)) : 0) + '%"></i></div>';
    return h + '</div>';
  }

  function htmlGS(r) {
    var per = r && r.per, h = '<table class="s2-tb"><thead><tr><th>Mês</th>' +
      '<th class="s2-gsh" title="Contatos que viraram ganho (qualificados) no GS Engage."><span class="s2-hl">Qualificados</span><span class="s2-hs">Qualif.</span> <span class="s2-i">ⓘ</span></th>' +
      '<th class="s2-gsh" title="Perdidos marcados à mão pelo SDR no GS, com um motivo (sem perfil, sem interesse, duplicado...)."><span class="s2-hl">Perdidos pelo SDR</span><span class="s2-hs">Perd. SDR</span> <span class="s2-i">ⓘ</span></th>' +
      '<th class="s2-gsh" title="Perdidos pelo próprio sistema do GS quando a cadência acabou sem resposta (motivo &quot;perda automática&quot;). O GS só passou a registrar assim em setembro; antes aparece ·."><span class="s2-hl">Cadência esgotada</span><span class="s2-hs">Esgot.</span> <span class="s2-i">ⓘ</span></th>' +
      '<th class="s2-gsh" title="Passos da cadência finalizados no GS. Cada passo era um registro, inclusive e-mail e pesquisa; no Agendor só a tarefa feita conta (por isso não compare 1:1)."><span class="s2-hl">Atividades registradas</span><span class="s2-hs">Ativ.</span> <span class="s2-i">ⓘ</span></th></tr></thead><tbody>';
    var t = { q: 0, pm: 0, pa: 0, at: 0 }, tp = { q: 0, pm: 0, pa: 0, at: 0, n: 0 };
    HIST_GS.forEach(function (x, i) {
      t.q += x.q; t.pm += x.pm; t.pa += x.pa; t.at += x.at;
      var ini = x.m + '-01', fim = x.m + '-31', toca = per && per.from <= fim && per.to >= ini;
      if (toca) { tp.q += x.q; tp.pm += x.pm; tp.pa += x.pa; tp.at += x.at; tp.n++; }
      h += '<tr class="' + (i < HIST_GS.length - 3 ? 's2-gsold ' : '') + (toca ? 's2-gsin' : '') + '"><td title="' + esc(x.parcial || '') + '">' + nomeMes(x.m + '-01') + (x.parcial ? ' <span style="font-weight:600;opacity:.8">(1 a 19)</span>' : '') + '</td><td>' + num(x.q) + '</td><td>' + num(x.pm) + '</td><td>' + (x.pa ? num(x.pa) : '·') + '</td><td>' + num(x.at) + '</td></tr>';
    });
    h += '<tr style="font-weight:800"><td>Total</td><td>' + num(t.q) + '</td><td>' + num(t.pm) + '</td><td>' + num(t.pa) + '</td><td>' + num(t.at) + '</td></tr>';
    if (per && tp.n && tp.n < HIST_GS.length) h += '<tr style="font-weight:800" class="s2-gsin"><td>Meses do período</td><td>' + num(tp.q) + '</td><td>' + num(tp.pm) + '</td><td>' + num(tp.pa) + '</td><td>' + num(tp.at) + '</td></tr>';
    h += '</tbody></table>';
    var nota = !per ? '' : (tp.n ? 'Em destaque: meses que tocam o período (somados inteiros, o GS só tem totais mensais). ' : 'Nenhum mês do GS toca o período escolhido. ');
    return h + '<div class="s2-nt s2-gsnote" style="color:#756f8c">' + nota + 'Congelado em 19/10, não atualiza e não responde aos filtros de funil, origem e SDR. Sistema anterior: cada passo era um registro (inclusive e-mail e pesquisa), por isso não compare 1:1 com o Agendor. A partir de 20/10 vale o Agendor.<br><b>Como ler:</b> Qualificados = viraram ganho · Perdidos pelo SDR = marcados à mão · Cadência esgotada = perdidos pelo sistema ao fim da cadência · Atividades registradas = passos finalizados no GS (inclui e-mail e pesquisa).</div>';
  }

  function svgAtv(r, tv) {
    var b = r.atv.serie; if (!b.length) return '';
    var W = tv ? 440 : (S.cw || 340), H = tv ? 110 : 110, padL = 24, padR = 4, padT = 12, padB = 18;
    var max = 2; b.forEach(function (x) { if (x.a > max) max = x.a; });
    var iw = W - padL - padR, ih = H - padT - padB, gw = iw / b.length, bw = Math.max(2, Math.min(18, gw * 0.62));
    var s = '<svg class="s2-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Atividades feitas por dia"><defs><pattern id="s2hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fffbeb"/><line x1="0" y1="0" x2="0" y2="5" stroke="#d97706" stroke-width="1.6"/></pattern></defs>';
    [0, 1].forEach(function (f) { var y = padT + ih - ih * f; s += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y + '" y2="' + y + '" stroke="#eae7f2"/><text x="' + (padL - 4) + '" y="' + (y + 3) + '" text-anchor="end" font-size="9" fill="#766e90">' + Math.round(max * f) + '</text>'; });
    var passo = Math.ceil(b.length / (tv ? 10 : Math.max(4, Math.floor(iw / 44))));
    b.forEach(function (x, i) {
      var cx = padL + gw * i + gw / 2, hA = ih * x.a / max, hL = 0;
      var tip = dm(x.k) + ': ' + x.a + ' atividades' + (x.j ? ', ' + x.j + ' fechadas junto' : '') + (x.sem ? ' · dia sem dado' : '') + (x.ap ? ' · EM APURAÇÃO (tarefas ainda a atribuir; o valor vai subir)' : '');
      s += '<g><title>' + esc(tip) + '</title>';
      if (x.ap) s += '<rect x="' + (cx - gw / 2 + 0.5) + '" y="' + padT + '" width="' + Math.max(2, gw - 1) + '" height="' + ih + '" fill="url(#s2hatch)" stroke="#d97706" stroke-dasharray="2 2" stroke-width=".8" opacity=".85"/>';
      if (x.sem) s += '<rect x="' + (cx - bw / 2) + '" y="' + (padT + ih - 3) + '" width="' + bw + '" height="3" fill="#e3e0ec"/>';
      else s += '<rect x="' + (cx - bw / 2) + '" y="' + (padT + ih - hA) + '" width="' + bw + '" height="' + Math.max(hA, x.a ? 1 : 0) + '" rx="2" fill="' + C_ROXO + '" opacity=".85"/>';
      if (i % passo === 0) s += '<text x="' + cx + '" y="' + (H - 5) + '" text-anchor="middle" font-size="9" fill="#6b6484">' + dm(x.k) + '</text>';
      s += '</g>';
    });
    return fz(s + '</svg>', tv) + '<div class="s2-lg"><span><i style="background:' + C_ROXO + ';opacity:.85"></i>Atividades</span>' + (b.some(function (x) { return x.ap; }) ? '<span><i style="background:repeating-linear-gradient(45deg,#fffbeb 0 2px,#d97706 2px 3px);border:1px solid #d97706"></i>Em apuração</span>' : '') + '</div>';
  }
  function htmlAtividades(r, tv) {
    if (!S.atv) return S.atvErr ? '<div class="s2-empty">Não consegui ler as atividades agora.<br><button class="s2-c" data-retry="atv" style="margin-top:6px">Tentar de novo</button></div>' : '<div class="s2-empty">Carregando atividades…</div>';
    var t = r.atv, a = t.ag;
    if (t.jn.antes) return '<div class="s2-empty">O Agendor só tem atividades do SDR desde ' + dmy(CFG.atvInicio) + '. Antes disso vale a faixa congelada do GS (abaixo).</div>';
    var h = '', ap = t.jn.apur;
    if (ap.ativo) h += '<div class="s2-ban">EM APURAÇÃO: ' + apurTexto(t.jn) + '. Os números abaixo são parciais, vão subir e não devem ser comparados com outro período.</div>';
    if (t.jn.sem.length) h += '<div class="s2-st warn">' + t.jn.sem.length + (t.jn.sem.length === 1 ? ' dia do período ainda sem dado (' : ' dias do período ainda sem dado (') + t.jn.sem.slice(0, 3).map(dm).join(', ') + (t.jn.sem.length > 3 ? '...' : '') + '). Os totais abaixo são parciais.</div>';
    var linhas = TIPOS.filter(function (x) { return a.a[x[0]] || a.j[x[0]] || x[0] === 'wa'; });
    h += '<table class="s2-tb"><thead><tr><th>Por tipo</th><th>Feitas</th><th title="Encerradas no mesmo instante do ganho/perda do negócio">Fechadas junto</th></tr></thead><tbody>';
    function lin(nome, f, j, cls) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + nome + '</td><td class="' + (f ? '' : 'z') + '">' + (f ? num(f) : '·') + '</td><td class="' + (j ? 'gc' : 'z') + '">' + (j ? num(j) : '·') + '</td></tr>'; }
    linhas.forEach(function (x) { h += lin(x[1], a.a[x[0]], a.j[x[0]]); });
    h += '<tr style="font-weight:800"><td>' + (ap.ativo ? 'Total parcial' : 'Total') + '</td><td>' + num(a.feitas) + '</td><td class="gc">' + num(a.junto) + '</td></tr></tbody></table>';
    h += svgAtv(r, tv);
    var bq = t.jn.bruto;
    h += '<div class="s2-nt' + (tv ? ' s2-xs' : '') + '" title="' + esc(TIP_LIDAS) + '"><b>Lidas no Agendor: ' + num(bq.lidas) + ' tarefas</b> <span class="s2-i">ⓘ</span> (sem filtros) = ' + num(bq.sdr) + ' feitas pelo SDR · ' + num(bq.junto) + ' fechadas junto · ' + num(bq.nc) + ' notas/migração GS · ' + num(bq.out) + ' de outras pessoas · ' + num(bq.sis) + ' do Sistema · ' + num(bq.fora) + ' fora dos funis SDR · ' + num(bq.pend) + ' a atribuir. Só as feitas pelo SDR contam como atividade; o restante não é trabalho do SDR.</div>';
    h += '<div class="s2-nt' + (tv ? ' s2-xs' : '') + '">' + (a.media != null && !ap.ativo ? '<b>' + dec1(a.media) + '</b> por dia com atividade (' + a.diasAtivos + (a.diasAtivos === 1 ? ' dia' : ' dias') + '). ' : '') + '<b>Fechadas junto</b> = tarefas encerradas no mesmo instante em que o negócio foi ganho ou perdido; não são trabalho do dia. <b>Ligação</b> conta como tarefa normal, igual às demais (WhatsApp, e-mail, pesquisa, outras).</div>';
    return h;
  }
  function htmlEtapasMov(r) {
    var e = r.etp; if (!e) return '';
    var h = '';
    Object.keys(CFG.funis).forEach(function (fid) {
      if (r.f.funil && r.f.funil !== fid) return;
      var linhas = e.porFunil[fid] || []; if (!linhas.length) return;
      h += '<div class="s2-sub" style="color:' + CFG.funis[fid].cor + '"><i class="s2-dot" style="background:' + CFG.funis[fid].cor + '"></i>' + esc(CFG.funis[fid].nome) + '</div>';
      h += '<table class="s2-tb"><thead><tr><th>Etapa</th><th>Entraram</th><th>Saíram</th></tr></thead><tbody>';
      linhas.forEach(function (l) { h += '<tr' + (CFG.etapaFim.test(l.nome) ? ' class="gr"' : '') + '><td title="' + esc(l.nome) + '">' + esc(l.nome) + '</td><td class="' + (l.ent ? 'qc' : 'z') + '">' + (l.ent ? num(l.ent) : '·') + '</td><td class="' + (l.sai ? '' : 'z') + '">' + (l.sai ? num(l.sai) : '·') + '</td></tr>'; });
      h += '</tbody></table>';
    });
    return h + '<div class="s2-nt s2-xs">Histórico de etapas registrado desde ' + dmy(e.desde || '') + ' (avisos do Agendor). Antes disso não há registro de passagem por etapa.</div>';
  }
  // Cobertura: o que foi lido e o que cobre (nada some em silêncio).
  function coberturaInfo(r) {
    var partes = [], warn = false;
    var tot = S.total, lidos = S.raw ? S.raw.length : 0;
    if (tot != null && lidos < tot) { partes.push('<b>leitura incompleta</b>: ' + num(lidos) + ' de ' + num(tot) + ' negócios'); warn = true; }
    else partes.push(num(S.rows.length) + ' negócios do SDR' + (tot != null ? ' (' + num(lidos) + ' de ' + num(tot) + ' lidos)' : '') + (r.minData ? ' · Agendor desde ' + dm(CFG.atvInicio) : ''));
    if (S.atv) {
      var jn = r.atv && r.atv.jn;
      if (jn && jn.dias) { partes.push('atividades: ' + jn.comDado + ' de ' + jn.dias + ' dias' + (S.atv.ultimaRodada && S.atv.ultimaRodada.ts ? ' · lidas ' + instBRT(new Date(S.atv.ultimaRodada.ts).toISOString()) : '')); if (jn.sem.length || (S.atv.ultimaRodada && S.atv.ultimaRodada.ok === false)) warn = true; }
      else if (jn && jn.antes) partes.push('atividades: Agendor só desde ' + dm(CFG.atvInicio));
      if (S.atv.ultimaRodada && S.atv.ultimaRodada.ts && (Date.now() - S.atv.ultimaRodada.ts) / 60000 > CFG.atrasoAtvMin) { partes.push('<b>atividades atrasadas</b>'); warn = true; }
    } else if (S.atvErr) { partes.push('<b>atividades indisponíveis</b>'); warn = true; }
    if (S.ini) {
      var cbI = S.ini.cobertura || {};
      partes.push('iniciados: ' + num(cbI.marcadores || 0) + ' marcadores' + (cbI.primeiroMarcador ? ' desde ' + dm(cbI.primeiroMarcador) : '') + (S.ini.ts ? ' · lidos ' + instBRT(new Date(S.ini.ts).toISOString()) : ''));
      if (S.ini.parcial) { partes.push('<b>iniciados em apuração</b>'); warn = true; }
    } else if (S.iniErr) { partes.push('<b>iniciados indisponíveis</b>'); warn = true; }
    if (S.etpErr) { partes.push('<b>etapas indisponíveis</b>'); warn = true; }
    else if (r.etp) {
      partes.push('etapas desde ' + dm(r.etp.desde || ''));
      if (S.etp && S.etp.truncado) { partes.push('<b>etapas incompletas</b> (leitura cortada pelo limite)'); warn = true; }
      else if (S.etp && S.etp.recortado) partes.push('etapas só dos últimos 92 dias');
      if (S.etp && S.etp.semMeta > 0) partes.push(num(S.etp.semMeta) + ' avisos de etapa sem dado');
    }
    var cbA = S.atv && S.atv.cobertura, aguard = cbA ? Number(cbA.aguardandoConfirmacao) || 0 : 0;
    if (aguard > 0) partes.push(aguard + (aguard === 1 ? ' dia recente ainda não confirmado' : ' dias recentes ainda não confirmados'));
    partes.push('GS congelado mai a 19/10');
    return { txt: partes.join(' · '), warn: warn };
  }

  function htmlNotas() {
    return '<p><b>Conversão</b> = qualificados ÷ (qualificados + perdidos pelo SDR). A <b>cadência esgotada</b> é fim automático de cadência, recuperável, e fica fora da conta (o valor geral mostra como ficaria com ela). Negócios perdidos com o motivo <b>Duplicado</b> também ficam fora da conta, tanto dos perdidos quanto da conversão (principal e geral), porque não foram uma decisão do SDR; aparecem em cinza na linha Duplicados (fora da conta). Perdidos + esgotados + duplicados = total de fechados como perdido.</p>' +
      '<p><b>Data do ganho</b> = data real do evento, senão a data de fechamento no Agendor. As <b>vendas</b> geradas ficam na aba Vendas.</p>' +
      '<p><b>Tempo até qualificar</b>: os 363 contatos migrados do GS em 20/10 ficam de fora até a data original ser importada.</p>';
  }

  function card(titulo, sub, corpo, extra) {
    extra = extra || {};
    // 30/10: cartão nunca é desenhado oco (só moldura e título): sem conteúdo, não existe
    if (!String(corpo || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() && !/<(svg|canvas|img|table|button)/i.test(corpo || '')) return '';
    return '<div class="s2-card' + (extra.cls ? ' ' + extra.cls : '') + '"' + (extra.style ? ' style="' + extra.style + '"' : '') + '><div class="s2-ch"><span class="s2-ct">' + titulo + '</span><span class="s2-cs">' + (sub || '') + '</span></div><div class="s2-cb">' + corpo + '</div></div>';
  }

  function htmlFiltros(r) {
    var h = '<div class="s2-fil">';
    var sdrIds = Object.keys(CFG.sdrs);
    if (sdrIds.length > 1) {
      h += '<div class="s2-fg"><span class="s2-fl">SDR</span><button class="s2-c' + (!r.f.sdr ? ' on' : '') + '" data-f="sdr" data-v="">Todos</button>' +
        sdrIds.map(function (id) { return '<button class="s2-c' + (r.f.sdr === id ? ' on' : '') + '" data-f="sdr" data-v="' + id + '">' + esc(CFG.sdrs[id]) + '</button>'; }).join('') + '</div>';
    }
    h += '<div class="s2-fg"><span class="s2-fl">Funil</span><button class="s2-c' + (!r.f.funil ? ' on' : '') + '" data-f="funil" data-v="">Ambos</button>' +
      Object.keys(CFG.funis).map(function (id) { return '<button class="s2-c' + (r.f.funil === id ? ' on' : '') + '" data-f="funil" data-v="' + id + '">' + esc(CFG.funis[id].nome) + '</button>'; }).join('') + '</div>';
    h += '<div class="s2-fg"><span class="s2-fl">Origem</span><button class="s2-c' + (!r.f.origem ? ' on' : '') + '" data-f="origem" data-v="">Todas</button>' +
      (r.origens || ORIGENS).filter(function (o) { return origemPassaGlobal(o.key, r.f.glob); }).map(function (o) { return '<button class="s2-c' + (r.f.origem === o.key ? ' on' : '') + '" data-f="origem" data-v="' + o.key + '">' + esc(o.label) + '</button>'; }).join('') + '</div>';
    if (r.f.glob && r.f.glob !== 'both') h += '<span class="s2-st warn" title="Vem da barra Outbound / Inbound / Ambos do topo do Dash">Filtro do Dash: ' + (r.f.glob === 'inbound' ? 'Inbound' : 'Outbound') + '</span>';
    return h + '</div>';
  }

  function nomeSdrs(r) {
    if (r.f.sdr) return CFG.sdrs[r.f.sdr];
    var ids = Object.keys(CFG.sdrs);
    return ids.length === 1 ? CFG.sdrs[ids[0]] : 'todos os SDRs';
  }

  function frescor() {
    var max = null; S.rows.forEach(function (d) { if (d.synced && (!max || d.synced > max)) max = d.synced; });
    if (!max) return { txt: 'sem sincronização lida', warn: true };
    var min = (Date.now() - Date.parse(max)) / 60000;
    if (S.err) return { txt: 'Agendor · sincronizado em ' + instBRT(max) + ' · a última atualização falhou', warn: true, falha: true };
    return { txt: 'Agendor · sincronizado em ' + instBRT(max), warn: min > CFG.atrasoSyncMin };
  }

  function draw() {
    var root = S.root; if (!root) return;
    var per = S.cfg && S.cfg.getPeriod ? S.cfg.getPeriod() : null;
    if (!per) { root.innerHTML = '<div class="s2-empty">Carregando período…</div>'; return; }
    if (S.err && !S.rows.length) { root.innerHTML = '<div class="s2-empty">Não consegui ler os negócios do SDR agora. Tente de novo em instantes.<br><button class="s2-c" data-retry="deals" style="margin-top:6px">Tentar de novo</button></div>'; return; }
    if (!S.raw) { root.innerHTML = '<div class="s2-empty">Carregando negócios do SDR…</div>'; return; }
    var tv = S.mode === 't';
    var glob = S.cfg.getOrigin ? S.cfg.getOrigin() : 'both';
    if (S.f.origem && !origemPassaGlobal(S.f.origem, glob)) S.f.origem = '';
    var r = calcular(S.rows, per, { sdr: S.f.sdr, funil: S.f.funil, origem: S.f.origem, glob: glob }, S.gran, { atv: S.atv, ini: S.ini, etp: S.etp, etapaNome: Object.assign({}, S.etp && S.etp.nomes, S.etapaNome) });
    S.last = r;
    var fr = frescor(), cv = coberturaInfo(r);
    var topo = '<div class="s2-hd"><div class="s2-ttl">SDR (<b>' + esc(nomeSdrs(r)) + '</b>) · <b>' + esc(per.label || (dm(per.from) + ' a ' + dm(per.to))) + '</b> <span class="s2-st' + (fr.warn ? ' warn' : '') + '" style="text-transform:none;letter-spacing:0">· ' + esc(fr.txt) + (fr.falha ? '' : (fr.warn ? ' (atrasado)' : '')) + '</span></div>' + htmlFiltros(r) + '</div>' +
      '<div class="s2-cov' + (cv.warn ? ' warn' : '') + '" title="O que esta aba leu e o que ela cobre">' + cv.txt + '</div>';
    var kpis = '<div class="s2-ks">' + htmlKpis(r) + '</div>' + htmlDuplicados(r);
    var fl = tv ? 'flex:1' : '';
    var cEtapas = card('Etapas da cadência', 'onde estão e onde terminam', htmlEtapas(r), { style: fl });
    var cMov = r.etp ? card('Movimento entre etapas', 'entradas e saídas no período', htmlEtapasMov(r), { style: tv ? 'flex:0 0 auto' : '' }) : '';
    var cGraf = card('Qualificados e perdidos', esc(r.serie.baldes.length ? dm(r.serie.de) + ' a ' + dm(r.serie.ate) : ''), htmlGrafico(r, tv), { style: tv ? 'flex:0 0 auto' : '' });
    var cCruz = card('Funil e origem', 'período selecionado', htmlCruzada(r), { style: fl });
    var cMot = card('Motivos de perda', 'período selecionado', htmlMotivos(r), { style: fl });
    var cIni = card('Iniciados e finalizados', r.ini ? esc(dm(r.ini.serie.de) + ' a ' + dm(r.ini.serie.ate)) : '', htmlIniFin(r, tv), { cls: 's2-ini', style: tv ? 'flex:0 0 auto' : '' });
    var cConf = tv ? '' : '<details class="s2-det s2-card s2-conf"><summary style="padding:9px 12px">Conferência: iniciados e finalizados</summary><div class="s2-cb">' + htmlConferencia(r) + '</div></details>';
    var cAtv = card('Atividades do SDR', r.atv && !r.atv.jn.antes ? 'tarefas concluídas no Agendor' : 'Agendor', htmlAtividades(r, tv), { style: tv ? 'flex:0 0 auto' : '' });
    var cGS = card('Histórico GS Engage', 'mai a 19/10 · congelado', htmlGS(r), { cls: 's2-gs', style: tv ? 'flex:0 0 auto' : '' });
    var cNotasTv = tv ? card('Como ler', 'regras desta aba', '<div class="s2-nt">' + htmlNotas() + '</div>', { style: 'flex:0 0 auto' }) : '';
    var cNotas = tv ? '' : '<details class="s2-det s2-card"><summary style="padding:9px 12px">Como ler esta aba</summary><div class="s2-cb s2-nt">' + htmlNotas() + '</div></details>';
    var corpo;
    if (tv) {
      corpo = '<div class="s2-body">' +
        '<div class="s2-pg" data-pg="1">' + cGraf + cIni + cAtv + '</div>' +
        '<div class="s2-pg" data-pg="2">' + cEtapas + cMov + cCruz + '</div>' +
        '<div class="s2-pg" data-pg="3">' + cMot + cGS + cNotasTv + '</div></div>';
    } else {
      corpo = '<div class="s2-body">' + cGraf + cIni + cAtv + cEtapas + cMov + cCruz + cMot + cGS + '</div>' + cConf + cNotas;
    }
    root.innerHTML = topo + kpis + corpo;
    root.querySelector('.s2-ks').addEventListener('click', onClick);
    root.querySelector('.s2-dup').addEventListener('click', onClick);
  }

  // Telão: garante que tudo cabe sem rolagem. Se algo estoura, sobe o nível de compactação (0 a 4) até caber.
  function estoura() {
    var cs = S.root.querySelectorAll('.s2-cb'), i;
    for (i = 0; i < cs.length; i++) if (cs[i].scrollHeight > cs[i].clientHeight + 1) return true;
    var cols = S.root.querySelectorAll('.s2-col');
    for (i = 0; i < cols.length; i++) if (cols[i].scrollHeight > cols[i].clientHeight + 1) return true;
    return false;
  }
  function medeLargura() {
    var rw = S.root.clientWidth || 360;
    S.w = rw < 640 ? 'p' : (rw < 1100 ? 'm' : (rw < 1500 ? 'g' : 'x'));
    S.root.setAttribute('data-w', S.w);
    var cols = { p: 1, m: 2, g: 3, x: 3 }[S.w];
    S.cw = Math.max(260, Math.round((rw - (cols - 1) * 8) / cols - 26));
  }
  // PC/tablet: distribui os cartões em colunas com alturas quase iguais (sem buracos); o último cartão de cada coluna preenche o resto.
  function empacota() {
    var body = S.root.querySelector('.s2-body'), n = { m: 2, g: 3, x: 3 }[S.w];
    if (!body || !n) return;
    var cards = [].slice.call(body.children), hs = cards.map(function (c) { return c.offsetHeight + 8; });
    var best = null, asg = [];
    (function rec(i, col) {
      if (i === cards.length) {
        var tot = []; for (var k = 0; k < n; k++) tot.push(0);
        var inv = 0;
        for (var a = 0; a < cards.length; a++) { tot[asg[a]] += hs[a]; for (var b = a + 1; b < cards.length; b++) if (asg[b] < asg[a]) inv++; }
        var cost = (Math.max.apply(null, tot) - Math.min.apply(null, tot)) * 10 + inv * 18 + Math.max.apply(null, tot) * 0.2;
        if (!best || cost < best.cost) best = { cost: cost, asg: asg.slice() };
        return;
      }
      for (var c = 0; c < n; c++) { asg[i] = c; rec(i + 1); }
    })(0);
    var cols = []; for (var k = 0; k < n; k++) { var d = document.createElement('div'); d.className = 's2-col'; cols.push(d); }
    cards.forEach(function (c, i) { cols[best.asg[i]].appendChild(c); });
    body.innerHTML = ''; body.classList.add('pack');
    cols.forEach(function (c) { body.appendChild(c); });
    cols.forEach(function (c) { var vis = [].slice.call(c.children).filter(function (k) { return k.offsetHeight > 0 && k.classList.contains('s2-card'); }); var last = vis[vis.length - 1]; if (last) last.classList.add('s2-fill'); });
  }
  // Telão: 3 colunas de mesma largura; melhor divisão dos cartões (menor coluna mais alta); cabe sem rolagem e sem espaço vazio:
  // a folga que sobra em cada coluna vira respiro nas linhas das tabelas e o último cartão preenche o resto.
  var TP = [8, 5, 3, 2, 2, 1];
  function empacotaTv() {
    var body = S.root.querySelector('.s2-body'); if (!body) return true;
    var H = body.clientHeight, cards = [].slice.call(body.children), n = 3, GAP = 8;
    var hs = cards.map(function (c) { return c.offsetHeight; });
    var best = null, asg = [];
    (function rec(i) {
      if (i === cards.length) {
        var tot = [0, 0, 0], inv = 0;
        for (var a = 0; a < cards.length; a++) { tot[asg[a]] += hs[a] + (tot[asg[a]] ? GAP : 0); for (var b = a + 1; b < cards.length; b++) if (asg[b] < asg[a]) inv++; }
        var mx = Math.max.apply(null, tot), mn = Math.min.apply(null, tot);
        var cost = (mx > H ? 100000 + (mx - H) * 50 : 0) + (mx - mn) * 4 + inv * 25;
        if (!best || cost < best.cost) best = { cost: cost, asg: asg.slice(), mx: mx };
        return;
      }
      for (var c = 0; c < n; c++) { asg[i] = c; rec(i + 1); }
    })(0);
    var cols = [0, 1, 2].map(function () { var d = document.createElement('div'); d.className = 's2-col'; return d; });
    cards.forEach(function (c, i) { cols[best.asg[i]].appendChild(c); });
    body.innerHTML = ''; body.classList.add('pack');
    cols.forEach(function (c) { body.appendChild(c); });
    cols.forEach(function (c) { var vis = [].slice.call(c.children).filter(function (k) { return k.offsetHeight > 0; }); var l = vis[vis.length - 1]; if (l) l.classList.add('s2-fill'); });
    if (best.mx > H) return false;
    // respiro nas linhas: a folga que sobra no último cartão de cada coluna vira altura das linhas (medido, em passos)
    cols.forEach(function (c) {
      var rows = c.querySelectorAll('.s2-tb tbody tr, .s2-mr').length, fill = c.querySelector('.s2-fill'), cb = fill && fill.querySelector('.s2-cb');
      if (!rows || !cb) return;
      function sobra() { var sum = 0; [].slice.call(cb.children).forEach(function (k) { sum += k.offsetHeight; }); return cb.clientHeight - sum - 14 - 4 * Math.max(0, cb.children.length - 1); }
      var rp = 0;
      for (var it = 0; it < 10; it++) {
        var f = sobra(); if (f <= 14 || rp >= 16) break;
        rp = Math.min(16, rp + Math.max(1, Math.floor(f * 0.8 / (rows * 2))));
        c.style.setProperty('--rp', rp + 'px');
      }
      while (rp > 0 && sobra() < 0) { rp--; c.style.setProperty('--rp', rp + 'px'); }
    });
    return true;
  }
  function render() {
    if (!S.root) return;
    if (S.mode !== 't') { medeLargura(); draw(); if (S.w !== 'p') empacota(); return; }
    // 30/10: sem laço de compactação. As páginas já cabem; a densidade só ajusta o respiro das linhas (--tp), nunca a fonte.
    S.dens = 0; S.root.setAttribute('data-d', 0); S.root.setAttribute('data-nc', '0'); S.root.style.setProperty('--tp', '4px');
    draw();
  }

  // ---------- Interação ----------
  function lista(kind) {
    var a = S.last.ag;
    if (kind === 'ini') return (S.last.ini ? S.last.ini.a.lista : []).map(function (x) { return Object.assign({}, x.d, { data: x.dia, rot: 'iniciado em' + (x.fonte === 'criacao' ? ' (criação)' : '') }); });
    if (kind === 'fin') return [].concat(a.won, a.lostM, a.lostS, a.lostD).map(function (d) { return Object.assign({}, d, { rot: 'finalizado em' }); });
    return kind === 'won' ? a.won : kind === 'lostM' ? a.lostM : kind === 'lostS' ? a.lostS : kind === 'lostD' ? a.lostD : kind === 'ong' ? a.ong : kind === 'fim' ? a.fim : [];
  }
  var TIT = { ini: 'Iniciados', fin: 'Finalizados', won: 'Qualificados', lostM: 'Perdidos pelo SDR', lostS: 'Cadência esgotada', lostD: 'Duplicados (fora da conta)', ong: 'Em cadência agora', fim: 'Fim da cadência (aguardando)' };
  function abreLista(titulo, itens, cor) {
    var mt = document.getElementById('modal-title'), mb = document.getElementById('modal-body'), mo = document.getElementById('modal-overlay');
    if (!mt || !mb || !mo) return;
    itens = itens.slice().sort(function (a, b) { return (b.data || '') < (a.data || '') ? -1 : 1; });
    mt.textContent = titulo + ' · ' + itens.length;
    mb.innerHTML = itens.length ? itens.map(function (d) {
      var sub = [CFG.funis[d.funil].nome, origemLabel(d.origem), d.etapa];
      if (d.data) sub.push((d.rot ? d.rot + ' ' : '') + dmy(d.data));
      if (d.dias != null) sub.push(d.dias + ' d até qualificar');
      if (d.migrado && d.status === 'won') sub.push('migrado do GS');
      if (d.motivo) sub.push(d.motivo);
      return '<a class="mdeal-row" href="' + CFG.urlNegocio + d.id + '" target="_blank" rel="noopener"><div class="mdeal-dot" style="background:' + cor + '"></div><div class="mdeal-main"><div class="mdeal-title-line"><span class="mdeal-title">' + esc(d.titulo) + '</span></div><div class="mdeal-sub-line"><span style="font-size:10.5px;color:var(--muted)">' + esc(sub.join(' · ')) + '</span></div></div></a>';
    }).join('') : '<div class="modal-empty">Nada aqui neste período</div>';
    mo.classList.add('show');
  }
  function onClick(ev) {
    var t = ev.target.closest('[data-go]'); if (!t || !S.last) return;
    var go = t.getAttribute('data-go');
    var cor = go === 'won' ? C_GANHO : (go === 'lostM' ? C_PERDA : (go === 'ini' ? CFG.corIni : (go === 'fin' ? CFG.corFin : C_CINZA)));
    if (TIT[go]) return abreLista(TIT[go], lista(go), cor);
  }
  function onRootClick(ev) {
    var rt = ev.target.closest('button[data-retry]');
    if (rt) { var k = rt.getAttribute('data-retry'); if (k === 'atv') { S.atvErr = null; render(); return lerAtividades(); } if (k === 'ini') { S.iniErr = null; render(); return lerIniciados(); } return carregar(true); }
    var b = ev.target.closest('button[data-f]');
    if (b) { S.f[b.getAttribute('data-f')] = b.getAttribute('data-v'); return render(); }
    var g = ev.target.closest('button[data-gran]');
    if (g) { S.gran = g.getAttribute('data-gran'); return render(); }
    var tr = ev.target.closest('tr[data-go]');
    if (tr) {
      var p = tr.getAttribute('data-go').split(':');
      var campo = p[0], key = p[1];
      S.f[campo] = S.f[campo] === key ? '' : key; return render();
    }
    var m = ev.target.closest('[data-mot]');
    if (m && S.last) {
      var k = m.getAttribute('data-mot');
      if (k === 's') return abreLista('Cadência esgotada', S.last.ag.lostS, C_CINZA);
      if (k === 'd') return abreLista('Duplicados (fora da conta)', S.last.ag.lostD, C_CINZA);
      var x = S.last.motivos[+k]; if (x) abreLista(x.motivo, x.lista, C_PERDA);
      return;
    }
    if (ev.target.closest('.s2-ks') || ev.target.closest('.s2-dup')) onClick(ev);
  }

  // ---------- Dados (somente leitura) ----------
  var COLS = 'id,frozen,title,stage_id,stage_name,funnel_id,owner_id,origin,origem_especial,status,created_at,end_time,lost_at,closed_at,data_real_evento,lost_reason_name,synced_at';
  function fetchT(url, opts, ms) {
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = ctl ? setTimeout(function () { ctl.abort(); }, ms || 25000) : null;
    var o = opts || {}; if (ctl) o.signal = ctl.signal;
    return fetch(url, o).then(function (r) { if (t) clearTimeout(t); return r; }, function (e) { if (t) clearTimeout(t); throw e; });
  }
  // Lê TUDO com conferência: o bridge devolve o total em Content-Range; a leitura só termina quando chega ao total (ou a página vem vazia).
  function lerNegocios() {
    var base = S.cfg.bridge, key = S.cfg.key, fids = Object.keys(CFG.funis).join(',');
    var PAGE = 1000, all = [], vistos = {}, total = null, dupes = 0;
    function pagina(from, tentativa) {
      return fetchT(base + '/rest/v1/dash_geral_deals?select=' + COLS + '&funnel_id=in.(' + fids + ')&order=id.asc', {
        headers: { apikey: key, Authorization: 'Bearer ' + key, Range: from + '-' + (from + PAGE - 1), Prefer: 'count=exact' }
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var m = /\/(\d+)\s*$/.exec(res.headers.get('content-range') || ''); if (m) total = +m[1];
        return res.json();
      }).then(function (rows) {
        if (!Array.isArray(rows)) throw new Error('resposta inesperada');
        rows.forEach(function (d) { if (vistos[d.id]) dupes++; else { vistos[d.id] = 1; all.push(d); } });
        if (rows.length && (total == null ? rows.length >= PAGE : from + rows.length < total)) return pagina(from + rows.length, 0);
      }, function (e) { if (tentativa < 2) return new Promise(function (ok) { setTimeout(ok, 800 * (tentativa + 1)); }).then(function () { return pagina(from, tentativa + 1); }); throw e; });
    }
    return pagina(0, 0).then(function () { return { rows: all, total: total, dupes: dupes }; });
  }
  // Data de entrada no GS dos migrados (tabela opcional: se ainda não foi carregada no D1, a aba segue como antes).
  function lerGsEntrada() {
    var base = S.cfg.bridge, key = S.cfg.key, map = {};
    return fetchT(base + '/rest/v1/dash_sdr_gs_entrada?select=deal_id,entrada_gs,confianca&limit=5000', { headers: { apikey: key, Authorization: 'Bearer ' + key } }, 15000)
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (rows) { if (Array.isArray(rows)) rows.forEach(function (x) { if (x && x.deal_id != null) map[x.deal_id] = x; }); return map; })
      .catch(function () { return map; });
  }
  function lerAtividades() {
    if (S.atvLoading) return Promise.resolve();
    S.atvLoading = true;
    return fetchT(CFG.worker + '/sdr-atividades?from=' + CFG.atvInicio + '&to=' + hojeBRT(), {}, 30000).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (j) {
      if (!j || !Array.isArray(j.dias)) throw new Error('resposta inesperada');
      S.atv = j; S.atvErr = null; S.atvTs = Date.now();
    }).catch(function (e) { S.atvErr = e; console.warn('SDR2: atividades falharam', e && e.message); })
      .then(function () { S.atvLoading = false; render(); });
  }
  function lerIniciados() {
    if (S.iniLoading) return Promise.resolve();
    S.iniLoading = true;
    return fetchT(CFG.worker + '/sdr-iniciados?from=' + CFG.atvInicio + '&to=' + hojeBRT(), {}, 30000).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (j) {
      if (!j || j.ok !== true || !Array.isArray(j.negocios) || !Array.isArray(j.dias)) throw new Error('resposta inesperada');
      S.ini = { map: iniMapa(j.negocios), negocios: j.negocios, dias: j.dias, cobertura: j.cobertura || {}, parcial: !!(j.cobertura && j.cobertura.parcial), ts: (j.cobertura && j.cobertura.indiceTs) || null };
      S.iniErr = null; S.iniTs = Date.now();
    }).catch(function (e) { S.iniErr = e; console.warn('SDR2: iniciados falharam', e && e.message); })
      .then(function () { S.iniLoading = false; render(); });
  }
  // O worker aceita no máximo 92 dias por pedido de etapas (mais que isso dá erro 400): o pedido é limitado aqui.
  function etapasDe(ate) {
    var t = new Date(ate + 'T12:00:00Z').getTime() - 91 * 86400000, min = new Date(t).toISOString().slice(0, 10);
    return min > CFG.atvInicio ? min : CFG.atvInicio;
  }
  function lerEtapas() {
    var ate = hojeBRT();
    return fetchT(CFG.worker + '/sdr-etapas?from=' + etapasDe(ate) + '&to=' + ate, {}, 30000).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (j) {
      var cb = (j && j.cobertura) || {};
      S.etp = (j && j.ativo && Array.isArray(j.eventos)) ? { ativo: true, eventos: j.eventos, desde: cb.desde, nomes: j.nomes || {}, truncado: !!cb.truncado, recortado: !!cb.recortado, semMeta: Number(cb.semMetadado) || 0 } : null;
      S.etpErr = (j && j.ok === false && !cb.truncado) ? new Error('parcial') : null;
    }).catch(function (e) { S.etpErr = e; console.warn('SDR2: etapas falharam', e && e.message); })
      .then(function () { render(); });
  }
  function carregar(force) {
    if (S.loading) return Promise.resolve();
    if (!force && S.raw && Date.now() - S.lastFetch < 20000) return Promise.resolve();
    S.loading = true;
    return Promise.all([lerNegocios(), lerGsEntrada()]).then(function (x) {
      var d = x[0]; S.raw = d.rows; S.total = d.total; S.dupes = d.dupes; S.gs = x[1];
      S.rows = prep(d.rows, x[1]); S.err = null; S.lastFetch = Date.now();
      S.byId = {}; S.etapaNome = {};
      S.rows.forEach(function (e) { S.byId[e.id] = e; if (e.etapaId) S.etapaNome[e.etapaId] = e.etapa; });
    }).catch(function (e) {
      S.err = e; console.warn('SDR2: leitura falhou', e && e.message);
      if (S.mode === 't') setTimeout(function () { if (S.cfg.isActive && S.cfg.isActive()) carregar(true); }, 60000);
    }).then(function () {
      S.loading = false; render();
      lerAtividades(); lerEtapas(); lerIniciados();
    });
  }

  // ---------- API pública ----------
  var API = {
    CFG: CFG, HIST_GS: HIST_GS,
    // 30/10: cartão expandido do telão repassa os cliques (linhas clicáveis, filtros) para o mesmo tratador do painel
    click: function (ev) { return onRootClick(ev); },
    // cfg: { root:Element, mode:'m'|'t', getPeriod:()=>({from,to,label}), bridge, key, isActive:()=>bool }
    init: function (cfg) {
      S.cfg = cfg; S.mode = cfg.mode || 'm'; S.root = cfg.root;
      injetaCss();
      S.root.classList.add('s2', S.mode === 't' ? 'tv' : 'm');
      if (!S.inited) {
        S.root.addEventListener('click', onRootClick); S.inited = true;
        var rt; w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (S.cfg.isActive && S.cfg.isActive() && S.raw) render(); }, 200); });
        // PC/tablet: a aba muda de colunas conforme a largura real do bloco (não só da janela)
        if (S.mode !== 't' && typeof ResizeObserver !== 'undefined') {
          var ro = new ResizeObserver(function () { var rw = S.root.clientWidth, k = rw < 640 ? 'p' : (rw < 1100 ? 'm' : (rw < 1500 ? 'g' : 'x')); if (rw > 0 && k !== S.w && S.raw && S.cfg.isActive && S.cfg.isActive()) render(); });
          ro.observe(S.root);
        }
      }
    },
    activate: function () {
      render();
      carregar(false);
      if (S.raw && (!S.atv || Date.now() - (S.atvTs || 0) > 300000)) lerAtividades();
      if (S.raw && (!S.ini || Date.now() - (S.iniTs || 0) > 300000)) lerIniciados();
      if (S.mode === 't' && !S.timer) {
        S.timer = setInterval(function () { if (S.cfg.isActive && S.cfg.isActive()) carregar(true); }, CFG.refreshTelaoMs);
      }
    },
    render: render,
    // núcleo puro, exposto para teste
    _core: { prep: prep, calcular: calcular, dataBRT: dataBRT, origemKey: origemKey, origensDe: origensDe, rotuloOrigem: rotuloOrigem, corOrigem: corOrigem, agrega: agrega, serie: serie, periodoAnterior: periodoAnterior, atvLinhas: atvLinhas, iniDia: iniDia, iniMapa: iniMapa, agregaIni: agregaIni, serieIniFin: serieIniFin, conferir: conferir, agregaAtv: agregaAtv, janelaAtv: janelaAtv, agregaEtp: agregaEtp, etpLinhas: etpLinhas }
  };
  w.SDR2 = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
