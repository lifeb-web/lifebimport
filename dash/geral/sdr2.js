/* ============================================================
 * Dossiê do SDR (Fase 1) - aba SDR nova, atrás da chave ?sdr=2
 * Compartilhado pelo mobile (dash/geral/index.html) e pelo telão
 * (dash/geral/telao/index.html): UM motor de cálculo e UM renderizador,
 * então os dois nunca divergem (paridade).
 *
 * Fonte: tabela dash_geral_deals (D1, via bridge, SOMENTE LEITURA), filtrada
 * pelos funis SDR. Zero chamada nova ao Agendor. Dados do GS Engage
 * (maio a 19/10) entram como faixa separada e congelada (HIST_GS abaixo).
 *
 * Regras do Robert (28/10/2026):
 *  - "Cadência esgotada" fica FORA da conversão, em cinza (recuperável).
 *  - Conversão: duas visões, a principal sem a cadência esgotada.
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
    atrasoSyncMin: 30,
    refreshTelaoMs: 10 * 60 * 1000
  };
  var ORIGENS = [
    { key: 'outbound',    label: 'Outbound',     cor: '#704B9B' },
    { key: 'superagos',   label: 'SuperAgos',    cor: '#2f7de1' },
    { key: 'recuperacao', label: 'Recuperação',  cor: '#0e9aa0' },
    { key: 'inbound',     label: 'Inbound',      cor: '#E92085' }
  ];
  var C_GANHO = '#1baf7a', C_PERDA = '#dc2626', C_CINZA = '#b8b3c8', C_ROXO = '#704B9B';

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
            f: { sdr: '', funil: '', origem: '' }, gran: '', cfg: null, lastFetch: 0, timer: null };

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
  function origemKey(d) { // mesma regra do Dash: origem_especial manda; senão origin (default outbound)
    var e = String(d.origem_especial || '').toLowerCase();
    if (e === 'superagos' || e === 'recuperacao') return e;
    return d.origin === 'inbound' ? 'inbound' : 'outbound';
  }
  function origemLabel(k) { for (var i = 0; i < ORIGENS.length; i++) if (ORIGENS[i].key === k) return ORIGENS[i].label; return k; }
  function ehSistema(motivo) { return CFG.perdaSistema.indexOf(String(motivo || '').toLowerCase()) >= 0; }

  // ---------- Preparação das linhas ----------
  function prep(rows) {
    var out = [];
    rows.forEach(function (d) {
      var oid = String(d.owner_id), fid = String(d.funnel_id);
      if (!CFG.sdrs[oid] || !CFG.funis[fid]) return;
      var e = {
        id: d.id, titulo: d.title || ('Negócio ' + d.id), sdr: oid, funil: fid, status: d.status,
        etapa: d.stage_name || 'Sem etapa', etapaId: String(d.stage_id || ''), motivo: d.lost_reason_name || '',
        origem: origemKey(d), criada: dataBRT(d.created_at), synced: d.synced_at, congelado: !!(d.frozen && +d.frozen)
      };
      var migr = d.created_at && d.created_at >= CFG.migracao.de && d.created_at < CFG.migracao.ate;
      e.migrado = !!migr;
      if (d.status === 'won') {
        // data do ganho: data_real_evento, senão end_time (nunca won_at)
        e.data = d.data_real_evento ? String(d.data_real_evento).slice(0, 10) : dataBRT(d.end_time || d.closed_at);
      } else if (d.status === 'lost') {
        e.data = d.data_real_evento ? String(d.data_real_evento).slice(0, 10) : dataBRT(d.end_time || d.lost_at || d.closed_at);
        e.sistema = ehSistema(d.lost_reason_name);
      }
      if (e.status === 'won' && e.data && e.criada && !e.migrado) e.dias = Math.max(0, diffDays(e.criada, e.data));
      out.push(e);
    });
    return out;
  }

  // ---------- Motor de cálculo (puro, testável) ----------
  // Filtro global do Dash (barra Outbound / Inbound / Ambos): no Dash, Outbound inclui SuperAgos e Recuperação.
  function passaGlobal(d, glob) {
    if (!glob || glob === 'both') return true;
    return glob === 'inbound' ? d.origem === 'inbound' : d.origem !== 'inbound';
  }
  function filtra(rows, f) {
    return rows.filter(function (d) {
      return passaGlobal(d, f.glob) && (!f.sdr || d.sdr === f.sdr) && (!f.funil || d.funil === f.funil) && (!f.origem || d.origem === f.origem);
    });
  }
  function noPeriodo(d, from, to) { return d.data && d.data >= from && d.data <= to; }

  function agrega(rows, from, to) {
    var won = [], lostM = [], lostS = [], ong = [], fim = [];
    rows.forEach(function (d) {
      if (d.status === 'won' && noPeriodo(d, from, to)) won.push(d);
      else if (d.status === 'lost' && noPeriodo(d, from, to)) (d.sistema ? lostS : lostM).push(d);
      else if (d.status === 'ongoing' && !d.congelado) (CFG.etapaFim.test(d.etapa) ? fim : ong).push(d);
    });
    var dias = won.filter(function (d) { return d.dias != null; }).map(function (d) { return d.dias; }).sort(function (a, b) { return a - b; });
    var soma = dias.reduce(function (s, x) { return s + x; }, 0);
    var med = dias.length ? (dias.length % 2 ? dias[(dias.length - 1) / 2] : (dias[dias.length / 2 - 1] + dias[dias.length / 2]) / 2) : null;
    return {
      won: won, lostM: lostM, lostS: lostS, ong: ong, fim: fim,
      q: won.length, pm: lostM.length, ps: lostS.length,
      conv: (won.length + lostM.length) > 0 ? won.length / (won.length + lostM.length) : null,
      convGeral: (won.length + lostM.length + lostS.length) > 0 ? won.length / (won.length + lostM.length + lostS.length) : null,
      diasN: dias.length, diasMedia: dias.length ? soma / dias.length : null, diasMed: med,
      migradosGanhos: won.filter(function (d) { return d.migrado; }).length
    };
  }

  function porEtapa(rows, from, to) {
    var res = {};
    Object.keys(CFG.funis).forEach(function (fid) { res[fid] = {}; });
    function get(d) { var m = res[d.funil]; return m[d.etapa] || (m[d.etapa] = { nome: d.etapa, ord: ordemEtapa(d.etapa), agora: 0, q: 0, pm: 0, ps: 0 }); }
    rows.forEach(function (d) {
      if (d.status === 'ongoing') { if (!d.congelado) get(d).agora++; }
      else if (d.status === 'won' && noPeriodo(d, from, to)) get(d).q++;
      else if (d.status === 'lost' && noPeriodo(d, from, to)) { if (d.sistema) get(d).ps++; else get(d).pm++; }
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
    function mk(k) { var b = { k: k, q: 0, pm: 0, ps: 0 }; idx[k] = b; baldes.push(b); return b; }
    if (gran === 'd') { for (var t = de; t <= ate; t = addDays(t, 1)) mk(t); }
    else if (gran === 's') { for (var s = mondayOf(de); s <= ate; s = addDays(s, 7)) mk(s); }
    else { var y = +de.slice(0, 4), mo = +de.slice(5, 7); var fim = ate.slice(0, 7); while (true) { var k = y + '-' + pad(mo); mk(k); if (k >= fim) break; mo++; if (mo > 12) { mo = 1; y++; } } }
    rows.forEach(function (d) {
      if ((d.status !== 'won' && d.status !== 'lost') || !noPeriodo(d, from, to) || d.data < de || d.data > ate) return;
      var b = idx[chave(d.data)]; if (!b) return;
      if (d.status === 'won') b.q++; else if (d.sistema) b.ps++; else b.pm++;
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

  function calcular(rows, per, f, gran) {
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
    ORIGENS.forEach(function (o) {
      var a = agrega(baseSdr.filter(function (d) { return d.origem === o.key; }), per.from, per.to);
      cruz.push({ tipo: 'origem', key: o.key, label: o.label, cor: o.cor, a: a });
    });
    return { per: per, ant: ant, f: f, ag: ag, agAnt: agAnt, etapas: porEtapa(base, per.from, per.to),
             motivos: motivos(ag.lostM), serie: serie(base, per.from, per.to, gran), cruz: cruz, minData: minData };
  }

  // ---------- CSS (injetado uma vez) ----------
  var CSS = [
    '.s2{display:flex;flex-direction:column;gap:8px;font-family:var(--font,Montserrat,sans-serif);color:var(--text,#1a1626)}',
    '.s2 *{box-sizing:border-box}',
    '.s2-hd{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}',
    '.s2-ttl{font-size:11px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:var(--faint,#9b93b0)}',
    '.s2-ttl b{color:var(--purple,#704B9B);font-weight:800}',
    '.s2-fil{display:flex;gap:6px;flex-wrap:wrap;align-items:center}',
    '.s2-fg{display:flex;gap:3px;align-items:center;flex-wrap:wrap}',
    '.s2-fl{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--faint,#9b93b0);margin-right:2px}',
    '.s2-c{border:1px solid var(--border,#eae7f2);background:var(--card,#fff);color:var(--muted,#6b6484);font:inherit;font-size:10.5px;font-weight:700;padding:4px 9px;border-radius:999px;cursor:pointer;line-height:1.2}',
    '.s2-c.on{background:var(--purple,#704B9B);border-color:var(--purple,#704B9B);color:#fff}',
    '.s2-ks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
    '.s2-k{background:var(--card,#fff);border:1px solid var(--border,#eae7f2);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:2px;min-width:0;box-shadow:0 1px 3px rgba(26,22,38,.04),0 4px 14px -6px rgba(26,22,38,.08)}',
    '.s2-k[data-go]{cursor:pointer}',
    '.s2-kl{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--faint,#9b93b0)}',
    '.s2-kv{font-size:20px;font-weight:800;line-height:1.15;font-variant-numeric:proportional-nums}',
    '.s2-kd{font-size:10px;font-weight:800;margin-left:6px}',
    '.s2-kd.up{color:#15803d}.s2-kd.down{color:#b91c1c}.s2-kd.flat{color:var(--muted,#6b6484)}',
    '.s2-kt{font-size:10px;font-weight:600;color:var(--muted,#6b6484);line-height:1.3}',
    '.s2-k.gr{background:#f4f3f7}.s2-k.gr .s2-kv{color:#8a859c}',
    '.s2-k.gr .s2-kl,.s2-k.gr .s2-kt{color:#8a859c}',
    '.s2-card{background:var(--card,#fff);border:1px solid var(--border,#eae7f2);border-radius:14px;overflow:hidden;min-width:0;display:flex;flex-direction:column;box-shadow:0 1px 3px rgba(26,22,38,.04),0 4px 14px -6px rgba(26,22,38,.08)}',
    '.s2-ch{padding:9px 12px 7px;border-bottom:1px solid var(--border,#eae7f2);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0}',
    '.s2-ct{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--faint,#9b93b0)}',
    '.s2-cs{font-size:10px;font-weight:700;color:var(--purple,#704B9B)}',
    '.s2-cb{padding:8px 12px 10px;display:flex;flex-direction:column;gap:6px;min-height:0;flex:1}',
    '.s2-tb{width:100%;border-collapse:collapse;font-size:11px}',
    '.s2-tb th{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:var(--faint,#9b93b0);text-align:right;padding:2px 4px;white-space:nowrap}',
    '.s2-tb th:first-child,.s2-tb td:first-child{text-align:left}',
    '.s2-tb td{padding:4px 4px;text-align:right;font-variant-numeric:tabular-nums;border-top:1px solid #f4f2f8;font-weight:700}',
    '.s2-tb td.s2-sr{max-width:none!important;width:auto!important;white-space:normal!important;border-top:0;text-align:left}',
    '.s2.m .s2-tb.cr th{font-size:8.5px;letter-spacing:.1px;padding:2px 2px}',
    '.s2.m .s2-tb.cr td{padding:4px 2px;font-size:10.5px}',
    '.s2.m .s2-tb.cr td:first-child{width:auto;max-width:none;min-width:70px}',
    '.s2-tb td:first-child{max-width:0;width:44%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}',
    '.s2-tb tr.gr td{color:#8a859c;font-weight:600}',
    '.s2-tb td.z{color:#c9c5d6;font-weight:600}',
    '.s2-tb td.gc{color:#8a859c}',
    '.s2-tb td.qc{color:#15803d}.s2-tb td.pc{color:#b91c1c}',
    '.s2-tb tr[data-go]{cursor:pointer}.s2-tb tr[data-go]:hover td{background:#f8f6fc}',
    '.s2-sub{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;padding:6px 0 1px;display:flex;align-items:center;gap:6px}',
    '.s2-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;display:inline-block}',
    '.s2-mot{display:flex;flex-direction:column;gap:5px}',
    '.s2-mr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;align-items:center;cursor:pointer;font-size:11px;font-weight:700}',
    '.s2-mr span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.s2-mr i{grid-column:1/3;height:5px;border-radius:3px;background:var(--red,#dc2626);opacity:.75;display:block;min-width:2px}',
    '.s2-mr.gr{color:#8a859c;font-weight:600}.s2-mr.gr i{background:' + C_CINZA + ';opacity:1}',
    '.s2-chart{width:100%;display:block}',
    '.s2-lg{display:flex;gap:10px;flex-wrap:wrap;font-size:10px;font-weight:700;color:var(--muted,#6b6484)}',
    '.s2-lg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}',
    '.s2-nt{font-size:10.5px;line-height:1.4;color:var(--muted,#6b6484);font-weight:600}',
    '.s2-nt b{color:var(--text,#1a1626)}',
    '.s2-nt p{margin:0 0 4px}',
    '.s2-gs{background:#f4f3f7;border-color:#e3e0ec;box-shadow:none}',
    '.s2-gs .s2-ct,.s2-gs .s2-cs{color:#8a859c}',
    '.s2-gs .s2-tb td{color:#7a7590;border-top-color:#e9e6f1}',
    '.s2-gs .s2-tb th{color:#9b97ac}',
    '.s2-st{font-size:10px;font-weight:600;color:var(--muted,#6b6484)}',
    '.s2-st.warn{color:var(--amber,#b45309);font-weight:800}',
    '.s2-empty{padding:14px 10px;text-align:center;color:var(--faint,#9b93b0);font-size:12px;font-style:italic}',
    '.s2-det summary{cursor:pointer;font-size:11px;font-weight:800;color:var(--purple,#704B9B);padding:2px 0}',
    '.s2-etbar{background:linear-gradient(90deg,rgba(112,75,155,.14) var(--w,0%),transparent var(--w,0%))}',
    /* mobile estreito: 390px */
    '.s2.m .s2-body{display:flex;flex-direction:column;gap:8px}',
    '.s2.m .s2-tb{font-size:11px}',
    '.s2.m .s2-tb td:first-child{width:38%}',
    '@media (max-width:370px){.s2.m .s2-tb{font-size:10px}.s2.m .s2-tb td,.s2.m .s2-tb th{padding-left:2px;padding-right:2px}.s2.m .s2-tb.cr td:first-child{width:27%}.s2.m .s2-cb{padding-left:9px;padding-right:9px}}',
    /* telão: tudo cabe sem rolagem, proporcional à altura */
    '.s2.tv{flex:1;min-height:0;gap:7px;overflow:hidden}',
    '.s2.tv .s2-hd{flex-shrink:0;flex-wrap:nowrap}',
    '.s2.tv .s2-ks{grid-template-columns:repeat(8,minmax(0,1fr));gap:7px;flex-shrink:0}',
    '.s2.tv .s2-k{padding:7px 11px;border-radius:11px}',
    '.s2.tv .s2-kv{font-size:clamp(18px,3.1vh,28px)}',
    '.s2.tv .s2-kt{font-size:clamp(9px,1.25vh,11px)}',
    '.s2.tv .s2-kl{font-size:clamp(8.5px,1.2vh,10px)}',
    '.s2.tv .s2-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,27fr) minmax(0,43fr) minmax(0,30fr);gap:8px;overflow:hidden}',
    '.s2.tv .s2-col{display:flex;flex-direction:column;gap:8px;min-height:0;min-width:0}',
    '.s2.tv .s2-card{min-height:0}',
    '.s2.tv .s2-cb{overflow:hidden;padding:6px 11px 8px;gap:4px}',
    '.s2.tv .s2-tb{font-size:clamp(10px,1.45vh,12.5px)}',
    '.s2.tv .s2-tb td{padding:clamp(2px,.8vh,10px) 4px}',
    '.s2.tv .s2-mot{gap:clamp(5px,1.1vh,14px)}',
    '.s2.tv .s2-cb{justify-content:flex-start}',
    '@media (max-height:820px){.s2.tv .s2-xs{display:none}.s2.tv .s2-tb td{padding:clamp(2px,.45vh,4px) 4px}.s2.tv .s2-mot{gap:4px}.s2.tv{gap:5px}.s2.tv .s2-body{gap:6px}}',
    '.s2.tv .s2-mr{font-size:clamp(10px,1.45vh,12.5px)}',
    '.s2.tv .s2-nt{font-size:clamp(9.5px,1.3vh,11.5px)}',
    '.s2.tv .s2-c{font-size:10px;padding:3px 8px}',
    '.s2.tv[data-d="1"] .s2-xs,.s2.tv[data-d="2"] .s2-xs,.s2.tv[data-d="3"] .s2-xs,.s2.tv[data-d="4"] .s2-xs{display:none}',
    '.s2.tv[data-d="1"] .s2-tb td,.s2.tv[data-d="2"] .s2-tb td{padding:3px 4px}',
    '.s2.tv[data-d="2"] .s2-gsold,.s2.tv[data-d="3"] .s2-gsold,.s2.tv[data-d="4"] .s2-gsold{display:none}',
    '.s2.tv[data-d="3"] .s2-kt,.s2.tv[data-d="4"] .s2-kt{display:none}',
    '.s2.tv[data-d="3"] .s2-tb td,.s2.tv[data-d="4"] .s2-tb td{padding:2px 4px}',
    '.s2.tv[data-d="3"] .s2-mot,.s2.tv[data-d="4"] .s2-mot{gap:3px}',
    '.s2.tv[data-d="4"] .s2-lg,.s2.tv[data-d="4"] .s2-esg{display:none}',
    '.s2.tv[data-d="4"] .s2-tb,.s2.tv[data-d="4"] .s2-mr{font-size:9.5px}'
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
    return '<div class="s2-k' + (o.cinza ? ' gr' : '') + '"' + (o.go ? ' data-go="' + o.go + '"' : '') + (o.tip ? ' title="' + esc(o.tip) + '"' : '') + '>' +
      '<span class="s2-kl">' + label + '</span><span class="s2-kv">' + val + (o.delta || '') + '</span>' +
      '<span class="s2-kt">' + sub + '</span></div>';
  }

  function htmlKpis(r) {
    var a = r.ag, p = r.agAnt;
    var rotPer = r.per.label || '';
    var convPct = a.conv == null ? 'n/d' : pct(a.q, a.q + a.pm);
    var convPrev = p && p.conv != null ? p.conv : null;
    var convDelta = '';
    if (convPrev != null && a.conv != null) {
      var dd = Math.round((a.conv - convPrev) * 1000) / 10;
      convDelta = '<span class="s2-kd ' + (dd > 0 ? 'up' : (dd < 0 ? 'down' : 'flat')) + '" title="vs período anterior equivalente">' + (dd > 0 ? '▲ +' : (dd < 0 ? '▼ ' : '= ')) + dec1(dd) + ' p.p.</span>';
    }
    var tempo = a.diasN ? dec1(a.diasMedia) + ' d' : 'n/d';
    var tempoSub = a.diasN ? ('mediana ' + dec1(a.diasMed) + ' d · ' + a.diasN + (a.diasN === 1 ? ' negócio' : ' negócios')) : 'sem negócio com data de entrada';
    if (a.migradosGanhos) tempoSub += ' · ' + a.migradosGanhos + ' migrados do GS fora';
    return chip('Qualificados', num(a.q), 'ganhos no funil SDR', { go: 'won', delta: delta(a.q, p ? p.q : null) }) +
      chip('Perdidos pelo SDR', num(a.pm), 'decisão do SDR (conta na conversão)', { go: 'lostM', delta: delta(a.pm, p ? p.pm : null) }) +
      chip('Conversão ⓘ', convPct, 'sem cadência esgotada · geral: <b>' + (a.convGeral == null ? 'n/d' : pct(a.q, a.q + a.pm + a.ps)) + '</b>',
        { tip: 'Principal: qualificados ÷ (qualificados + perdidos pelo SDR). Geral: inclui também a cadência esgotada, que é recuperável e por isso fica fora da principal.', delta: convDelta }) +
      chip('Cadência esgotada', num(a.ps), 'sistema, recuperável (fora da conversão)', { cinza: true, go: 'lostS' }) +
      chip('Em cadência agora', num(a.ong.length), 'abertos nas etapas D1 a D10', { go: 'ong' }) +
      chip('Fim da cadência', num(a.fim.length), 'aguardando, recuperáveis', { cinza: true, go: 'fim' }) +
      chip('Tempo até qualificar', tempo, tempoSub, { tip: 'Da criação do negócio no Agendor até o ganho. Contatos migrados do GS em 20/10 ficam de fora porque a data de entrada original ainda não foi importada.' }) +
      chip('Atividades', 'em breve', 'tarefas concluídas entram na Fase 3', { cinza: true });
  }

  function htmlEtapas(r) {
    var h = '';
    Object.keys(CFG.funis).forEach(function (fid) {
      if (r.f.funil && r.f.funil !== fid) return;
      var linhas = r.etapas[fid] || [];
      var max = 1; linhas.forEach(function (l) { if (l.agora > max) max = l.agora; });
      h += '<div class="s2-sub" style="color:' + CFG.funis[fid].cor + '"><i class="s2-dot" style="background:' + CFG.funis[fid].cor + '"></i>' + esc(CFG.funis[fid].nome) + '</div>';
      if (!linhas.length) { h += '<div class="s2-empty">Sem negócios neste funil</div>'; return; }
      h += '<table class="s2-tb"><thead><tr><th>Etapa</th><th>Agora</th><th>Qualif.</th><th>Perdidos</th><th>Esgot.</th></tr></thead><tbody>';
      linhas.forEach(function (l) {
        var fim = CFG.etapaFim.test(l.nome);
        function c(v, cls) { return '<td class="' + (v ? (cls || '') : 'z') + '">' + (v ? num(v) : '·') + '</td>'; }
        h += '<tr' + (fim ? ' class="gr"' : '') + '><td class="s2-etbar" style="--w:' + Math.round(l.agora / max * 100) + '%" title="' + esc(l.nome) + '">' + esc(l.nome) + '</td>' +
          c(l.agora) + c(l.q, 'qc') + c(l.pm, 'pc') + c(l.ps, 'gc') + '</tr>';
      });
      h += '</tbody></table>';
    });
    h += '<div class="s2-nt s2-xs">Agora = abertos hoje. Qualif., Perdidos e Esgot. = o que aconteceu no período, na etapa em que o negócio estava. A entrada em cada etapa (avanço entre etapas) depende do histórico de etapas, Fase 2.</div>';
    return h;
  }

  // telão: a altura do gráfico acompanha a tela (aproveita o espaço sem estourar)
  function alturaGraf() {
    var rw = (S.root && S.root.clientWidth) || 1800;
    var cw = Math.max(300, (rw - 16) * 0.43 - 24);
    var alvo = (w.innerHeight || 940) * 0.27 * [1, 1, .85, .72, .6][S.dens || 0];
    return Math.round(Math.max(150, Math.min(340, alvo / (cw / 640))));
  }
  function svgChart(r, tv) {
    var sr = r.serie, b = sr.baldes;
    if (!b.length) return '<div class="s2-empty">Sem qualificados nem perdas neste período</div>';
    var W = tv ? 640 : 340, H = tv ? alturaGraf() : 150, padL = 24, padR = 4, padT = 14, padB = 20;
    var max = 1; b.forEach(function (x) { if (x.q > max) max = x.q; if (x.pm > max) max = x.pm; });
    max = Math.max(max, 2);
    var iw = W - padL - padR, ih = H - padT - padB, gw = iw / b.length;
    var bw = Math.max(2, Math.min(tv ? 22 : 14, gw * 0.36));
    var s = '<svg class="s2-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Qualificados e perdidos pelo SDR por ' + (sr.gran === 'd' ? 'dia' : sr.gran === 's' ? 'semana' : 'mês') + '">';
    [0, 0.5, 1].forEach(function (f) {
      var y = padT + ih - ih * f;
      s += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y + '" y2="' + y + '" stroke="#eae7f2" stroke-width="1"/>' +
        '<text x="' + (padL - 4) + '" y="' + (y + 3) + '" text-anchor="end" font-size="9" fill="#9b93b0">' + Math.round(max * f) + '</text>';
    });
    var passo = Math.ceil(b.length / (tv ? 14 : 7));
    b.forEach(function (x, i) {
      var cx = padL + gw * i + gw / 2;
      var hq = ih * x.q / max, hp = ih * x.pm / max;
      var rot = sr.gran === 'm' ? nomeMes(x.k + '-01') : dm(x.k);
      var tip = rot + ': ' + x.q + ' qualificados, ' + x.pm + ' perdidos pelo SDR, ' + x.ps + ' cadência esgotada';
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
          (b.length <= (tv ? 16 : 11) && x.ps ? '<text x="' + cx + '" y="' + (H2 - h2 - 4) + '" text-anchor="middle" font-size="8.5" font-weight="700" fill="#8a859c">' + x.ps + '</text>' : '') + '</g>';
      });
      s2 += '</svg>';
      s += '<div class="s2-esg"><div class="s2-st" style="margin-top:2px">Cadência esgotada por ' + (sr.gran === 'd' ? 'dia' : sr.gran === 's' ? 'semana' : 'mês') + ' (cinza, escala própria, máx. ' + maxS + ')</div>' + s2 + '</div>';
    }
    return s;
  }

  function htmlGrafico(r, tv) {
    var gran = r.serie.gran;
    var tg = tv ? '' : '<div class="s2-fg">' + [['d', 'Dia'], ['s', 'Semana'], ['m', 'Mês']].map(function (g) {
      return '<button class="s2-c' + (gran === g[0] ? ' on' : '') + '" data-gran="' + g[0] + '">' + g[1] + '</button>';
    }).join('') + '</div>';
    return tg + svgChart(r, tv) +
      '<div class="s2-lg"><span><i style="background:' + C_GANHO + '"></i>Qualificados</span><span><i style="background:' + C_PERDA + ';opacity:.8"></i>Perdidos pelo SDR</span><span><i style="background:' + C_CINZA + '"></i>Cadência esgotada</span></div>';
  }

  function htmlCruzada(r) {
    function linha(c) {
      var a = c.a;
      var conv = (a.q + a.pm) ? pct(a.q, a.q + a.pm) : 'n/d';
      function cel(v, cls) { return '<td class="' + (v ? (cls || '') : 'z') + '">' + (v ? num(v) : '·') + '</td>'; }
      return '<tr data-go="' + c.tipo + ':' + c.key + '"><td title="' + esc(c.label) + '"><i class="s2-dot" style="background:' + c.cor + ';margin-right:5px"></i>' + esc(c.label) + '</td>' +
        cel(a.q, 'qc') + cel(a.pm, 'pc') + cel(a.ps, 'gc') + '<td>' + conv + '</td>' + cel(a.ong.length) + '</tr>';
    }
    var h = '<table class="s2-tb cr"><thead><tr><th>&nbsp;</th><th>Qualif.</th><th>Perd.</th><th>Esgot.</th><th>Conv.</th><th>Agora</th></tr></thead><tbody>';
    var fun = r.cruz.filter(function (c) { return c.tipo === 'funil'; }), ori = r.cruz.filter(function (c) { return c.tipo === 'origem'; });
    h += '<tr><td colspan="6" class="s2-sr s2-sub" style="padding:2px 4px 1px;color:var(--faint)">Por funil</td></tr>' + fun.map(linha).join('');
    h += '<tr><td colspan="6" class="s2-sr s2-sub" style="padding:5px 4px 1px;color:var(--faint)">Por origem</td></tr>' + ori.map(linha).join('');
    h += '</tbody></table><div class="s2-nt s2-xs">Origem pela regra do Dash. Clique numa linha para filtrar a aba.</div>';
    return h;
  }

  function htmlMotivos(r) {
    var m = r.motivos, a = r.ag;
    var max = 1; m.forEach(function (x) { if (x.n > max) max = x.n; });
    if (a.ps > max) max = Math.max(max, a.ps);
    var h = '<div class="s2-mot">';
    if (!m.length && !a.ps) return '<div class="s2-empty">Sem perdas neste período</div>';
    h += '<div class="s2-sub" style="color:#b91c1c;padding-top:0">Decididos pelo SDR · ' + num(a.pm) + '</div>';
    if (!m.length) h += '<div class="s2-st">nenhuma perda manual no período</div>';
    m.forEach(function (x, i) {
      h += '<div class="s2-mr" data-mot="' + i + '" title="' + esc(x.motivo) + '"><span>' + esc(x.motivo) + '</span><span>' + num(x.n) + ' · ' + pct(x.n, a.pm) + '</span><i style="width:' + Math.max(3, Math.round(x.n / max * 100)) + '%"></i></div>';
    });
    h += '<div class="s2-sub" style="color:#8a859c">Pelo sistema · recuperável</div>';
    h += '<div class="s2-mr gr" data-mot="s" title="Cadência esgotada"><span>Cadência esgotada</span><span>' + num(a.ps) + '</span><i style="width:' + Math.max(3, Math.round(a.ps / max * 100)) + '%"></i></div>';
    return h + '</div>';
  }

  function htmlGS() {
    var h = '<table class="s2-tb"><thead><tr><th>Mês</th><th>Qualif.</th><th>Perdidos</th><th>Auto.</th><th>Ativ.</th></tr></thead><tbody>';
    var t = { q: 0, pm: 0, pa: 0, at: 0 };
    HIST_GS.forEach(function (x, i) {
      t.q += x.q; t.pm += x.pm; t.pa += x.pa; t.at += x.at;
      h += '<tr' + (i < HIST_GS.length - 3 ? ' class="s2-gsold"' : '') + '><td title="' + esc(x.parcial || '') + '">' + nomeMes(x.m + '-01') + (x.parcial ? ' <span style="font-weight:600;opacity:.8">(1 a 19)</span>' : '') + '</td><td>' + num(x.q) + '</td><td>' + num(x.pm) + '</td><td>' + (x.pa ? num(x.pa) : '·') + '</td><td>' + num(x.at) + '</td></tr>';
    });
    h += '<tr style="font-weight:800"><td>Total</td><td>' + num(t.q) + '</td><td>' + num(t.pm) + '</td><td>' + num(t.pa) + '</td><td>' + num(t.at) + '</td></tr></tbody></table>';
    return h + '<div class="s2-nt" style="color:#8a859c">Congelado em 19/10, não atualiza. Sistema anterior: cada passo era um registro (inclusive e-mail e pesquisa), por isso não compare 1:1 com o Agendor. A partir de 20/10 vale o Agendor.</div>';
  }

  function htmlNotas() {
    return '<p><b>Conversão</b> = qualificados ÷ (qualificados + perdidos pelo SDR). A <b>cadência esgotada</b> é fim automático de cadência, recuperável, e fica fora da conta (o valor geral mostra como ficaria com ela).</p>' +
      '<p><b>Data do ganho</b> = data real do evento, senão a data de fechamento no Agendor. As <b>vendas</b> geradas ficam na aba Vendas.</p>' +
      '<p><b>Tempo até qualificar</b>: os 363 contatos migrados do GS em 20/10 ficam de fora até a data original ser importada.</p>';
  }

  function card(titulo, sub, corpo, extra) {
    extra = extra || {};
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
      ORIGENS.filter(function (o) { return passaGlobal({ origem: o.key }, r.f.glob); }).map(function (o) { return '<button class="s2-c' + (r.f.origem === o.key ? ' on' : '') + '" data-f="origem" data-v="' + o.key + '">' + o.label + '</button>'; }).join('') + '</div>';
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
    if (S.err && !S.rows.length) { root.innerHTML = '<div class="s2-empty">Não consegui ler os negócios do SDR agora. Tente de novo em instantes.</div>'; return; }
    if (!S.raw) { root.innerHTML = '<div class="s2-empty">Carregando negócios do SDR…</div>'; return; }
    var tv = S.mode === 't';
    var glob = S.cfg.getOrigin ? S.cfg.getOrigin() : 'both';
    if (S.f.origem && !passaGlobal({ origem: S.f.origem }, glob)) S.f.origem = '';
    var r = calcular(S.rows, per, { sdr: S.f.sdr, funil: S.f.funil, origem: S.f.origem, glob: glob }, S.gran);
    S.last = r;
    var fr = frescor();
    var topo = '<div class="s2-hd"><div class="s2-ttl">SDR (<b>' + esc(nomeSdrs(r)) + '</b>) · <b>' + esc(per.label || (dm(per.from) + ' a ' + dm(per.to))) + '</b> <span class="s2-st' + (fr.warn ? ' warn' : '') + '" style="text-transform:none;letter-spacing:0">· ' + esc(fr.txt) + (fr.falha ? '' : (fr.warn ? ' (atrasado)' : '')) + '</span></div>' + htmlFiltros(r) + '</div>';
    var kpis = '<div class="s2-ks">' + htmlKpis(r) + '</div>';
    var cEtapas = card('Etapas da cadência', 'onde estão e onde terminam', htmlEtapas(r), { style: tv ? 'flex:1' : '' });
    var cGraf = card('Qualificados e perdidos', esc(r.serie.baldes.length ? dm(r.serie.de) + ' a ' + dm(r.serie.ate) : ''), htmlGrafico(r, tv), { style: tv ? 'flex:0 0 auto' : '' });
    var cCruz = card('Funil e origem', 'período selecionado', htmlCruzada(r), { style: tv ? 'flex:1' : '' });
    var cMot = card('Motivos de perda', 'período selecionado', htmlMotivos(r), { style: tv ? 'flex:1' : '' });
    var cGS = card('Histórico GS Engage', 'mai a 19/10 · congelado', htmlGS(), { cls: 's2-gs', style: tv ? 'flex:0 0 auto' : '' });
    var cNotasTv = tv ? card('Como ler', '', '<div class="s2-nt">' + htmlNotas() + '</div>', { cls: 's2-xs', style: 'flex:0 0 auto' }) : '';
    var cNotas = tv ? '' : '<details class="s2-det s2-card"><summary style="padding:9px 12px">Como ler esta aba</summary><div class="s2-cb s2-nt">' + htmlNotas() + '</div></details>';
    var corpo;
    if (tv) {
      corpo = '<div class="s2-body"><div class="s2-col">' + cEtapas + cNotasTv + '</div><div class="s2-col">' + cGraf + cCruz + '</div><div class="s2-col">' + cMot + cGS + '</div></div>';
    } else {
      corpo = '<div class="s2-body">' + cGraf + cEtapas + cCruz + cMot + cGS + cNotas + '</div>';
    }
    root.innerHTML = topo + kpis + corpo;
    root.querySelector('.s2-ks').addEventListener('click', onClick);
  }

  // Telão: garante que tudo cabe sem rolagem. Se algo estoura, sobe o nível de compactação (0 a 4) até caber.
  function estoura() {
    var cs = S.root.querySelectorAll('.s2-cb'), i;
    for (i = 0; i < cs.length; i++) if (cs[i].scrollHeight > cs[i].clientHeight + 1) return true;
    var cols = S.root.querySelectorAll('.s2-col');
    for (i = 0; i < cols.length; i++) if (cols[i].scrollHeight > cols[i].clientHeight + 1) return true;
    return false;
  }
  function render() {
    if (!S.root) return;
    if (S.mode !== 't') { draw(); return; }
    for (var d = 0; d <= 4; d++) {
      S.dens = d; S.root.setAttribute('data-d', d);
      draw();
      if (!S.last || !S.root.querySelector('.s2-body') || !estoura()) break;
    }
  }

  // ---------- Interação ----------
  function lista(kind) {
    var a = S.last.ag;
    return kind === 'won' ? a.won : kind === 'lostM' ? a.lostM : kind === 'lostS' ? a.lostS : kind === 'ong' ? a.ong : kind === 'fim' ? a.fim : [];
  }
  var TIT = { won: 'Qualificados', lostM: 'Perdidos pelo SDR', lostS: 'Cadência esgotada', ong: 'Em cadência agora', fim: 'Fim da cadência (aguardando)' };
  function abreLista(titulo, itens, cor) {
    var mt = document.getElementById('modal-title'), mb = document.getElementById('modal-body'), mo = document.getElementById('modal-overlay');
    if (!mt || !mb || !mo) return;
    itens = itens.slice().sort(function (a, b) { return (b.data || '') < (a.data || '') ? -1 : 1; });
    mt.textContent = titulo + ' · ' + itens.length;
    mb.innerHTML = itens.length ? itens.map(function (d) {
      var sub = [CFG.funis[d.funil].nome, origemLabel(d.origem), d.etapa];
      if (d.data) sub.push(dmy(d.data));
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
    var cor = go === 'won' ? C_GANHO : (go === 'lostM' ? C_PERDA : C_CINZA);
    if (TIT[go]) return abreLista(TIT[go], lista(go), cor);
  }
  function onRootClick(ev) {
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
      var x = S.last.motivos[+k]; if (x) abreLista(x.motivo, x.lista, C_PERDA);
      return;
    }
    if (ev.target.closest('.s2-ks')) onClick(ev);
  }

  // ---------- Dados (somente leitura) ----------
  var COLS = 'id,frozen,title,stage_id,stage_name,funnel_id,owner_id,origin,origem_especial,status,created_at,end_time,lost_at,closed_at,data_real_evento,lost_reason_name,synced_at';
  function carregar(force) {
    if (S.loading) return Promise.resolve();
    if (!force && S.raw && Date.now() - S.lastFetch < 20000) return Promise.resolve();
    S.loading = true;
    var base = S.cfg.bridge, key = S.cfg.key;
    var fids = Object.keys(CFG.funis).join(',');
    var PAGE = 1000, all = [];
    function pagina(from) {
      return fetch(base + '/rest/v1/dash_geral_deals?select=' + COLS + '&funnel_id=in.(' + fids + ')', {
        headers: { apikey: key, Authorization: 'Bearer ' + key, Range: from + '-' + (from + PAGE - 1) }
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then(function (rows) {
        all = all.concat(rows);
        if (rows.length >= PAGE) return pagina(from + PAGE);
      });
    }
    return pagina(0).then(function () {
      S.raw = all; S.rows = prep(all); S.err = null; S.lastFetch = Date.now();
    }).catch(function (e) {
      S.err = e; console.warn('SDR2: leitura falhou', e && e.message);
      if (S.mode === 't') setTimeout(function () { if (S.cfg.isActive && S.cfg.isActive()) carregar(true); }, 60000);
    }).then(function () { S.loading = false; render(); });
  }

  // ---------- API pública ----------
  var API = {
    CFG: CFG, HIST_GS: HIST_GS,
    // cfg: { root:Element, mode:'m'|'t', getPeriod:()=>({from,to,label}), bridge, key, isActive:()=>bool }
    init: function (cfg) {
      S.cfg = cfg; S.mode = cfg.mode || 'm'; S.root = cfg.root;
      injetaCss();
      S.root.classList.add('s2', S.mode === 't' ? 'tv' : 'm');
      if (!S.inited) {
        S.root.addEventListener('click', onRootClick); S.inited = true;
        var rt; w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (S.cfg.isActive && S.cfg.isActive() && S.raw) render(); }, 200); });
      }
    },
    activate: function () {
      render();
      carregar(false);
      if (S.mode === 't' && !S.timer) {
        S.timer = setInterval(function () { if (S.cfg.isActive && S.cfg.isActive()) carregar(true); }, CFG.refreshTelaoMs);
      }
    },
    render: render,
    // núcleo puro, exposto para teste
    _core: { prep: prep, calcular: calcular, dataBRT: dataBRT, origemKey: origemKey, agrega: agrega, serie: serie, periodoAnterior: periodoAnterior }
  };
  w.SDR2 = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
