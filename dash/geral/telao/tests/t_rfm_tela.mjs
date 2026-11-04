// TESTE da aba RFM no navegador (celular + telao). Uso (servidor local na raiz do repo: python3 -m http.server 8801):
//   DASH_BASE=http://localhost:8801/dash/geral/ node t_rfm_tela.mjs            (fixture sintetico, ponte simulada)
//   DASH_BASE=... DASH_REAL=1 node t_rfm_tela.mjs                               (dados reais da ponte, SOMENTE LEITURA)
// Mede texto REAL por linha (Range), nao caixas: corte, sobreposicao, fonte minima, rolagem horizontal/vertical, contas que fecham,
// cliques (celula, segmento, representante, KPI), filtros de origem, estados (carregando, vazio, erro, atrasado) e atualizacao.
import { chromium } from 'playwright-core';
import { EXE, BASE } from './telao_lib.mjs';
import { fixture, hoje } from './rfm_fixture.mjs';
const REAL = !!process.env.DASH_REAL;
const FX = fixture();
let falhas = 0, ok = 0;
const t = (c, m) => { if (c) ok++; else { falhas++; console.log('  FALHOU: ' + m); } };
let wd = null, ultimo = '';
const log = m => { ultimo = m; console.log('>> ' + m); clearTimeout(wd); wd = setTimeout(() => { console.log('TRAVOU 150s depois de: ' + ultimo); process.exit(3); }, 150000); };

const cors = { 'access-control-allow-origin': '*', 'access-control-expose-headers': 'content-range' };
async function mocar(p, o = {}) {
  await p.route(/dash-geral-bridge.*\/rest\/v1\/dash_geral_deals/, r => {
    if (REAL) return r.continue();
    if (o.demora) return new Promise(res => setTimeout(res, o.demora)).then(() => r.fulfill({ status: 200, headers: { ...cors, 'content-range': '0-0/0' }, contentType: 'application/json', body: '[]' }));
    if (o.erro) return r.fulfill({ status: 500, headers: cors, body: 'erro' });
    const rows = o.rows || FX.deals;
    return r.fulfill({ status: 200, headers: { ...cors, 'content-range': rows.length ? '0-' + (rows.length - 1) + '/' + rows.length : '*/0' }, contentType: 'application/json', body: JSON.stringify(rows) });
  });
  await p.route(/dash-geral-bridge.*\/api\/table/, r => r.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ rows: o.erro ? [] : (o.rows || FX.deals) }) }));
  await p.route(/dash-geral-bridge.*\/rest\/v1\/(?!dash_geral_deals)/, r => r.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: '[]' }));
  await p.route(/gs-agendor-worker|ga4-dash-cache|bia-dash-sync/, r => r.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: '{}' }));
}
async function abrir(W, H, tv, o = {}) {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: !tv && W < 800 });
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push('PAGEERROR ' + e.message.slice(0, 160)));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED|net::/.test(m.text())) p.errs.push('console ' + m.text().slice(0, 140)); });
  await mocar(p, o);
  await p.goto(BASE + (tv ? 'telao/index.html?rot=0' : 'index.html'), { waitUntil: 'commit' });
  const f = () => p.frames().find(x => x !== p.mainFrame()) || p;
  await p.waitForTimeout(o.espera || 6500);
  await f().evaluate(() => document.querySelector('.ochip[data-v="rfm"]').click());
  await p.waitForTimeout(o.depois || 1200);
  return { b, p, f };
}
const pagina = (f, k) => f.evaluate(k => window.__pg && window.__pg.set(k, true), k);

// ---- medicao de texto real (Range por linha) ----
const MEDE = `(tv) => {
  const root = document.getElementById('rf-root'); if (!root) return { semRoot: true };
  const out = { corte: [], sobre: [], fonte: [], hscroll: document.documentElement.scrollWidth - document.documentElement.clientWidth, bad: [], n: 0 };
  const visivel = e => { for (let x = e; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } return true; };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const linhas = []; let nd;
  while ((nd = walker.nextNode())) {
    const tx = nd.textContent; if (!tx.trim()) continue; const el = nd.parentElement; if (!visivel(el)) continue;
    const cs = getComputedStyle(el), r = document.createRange(); r.selectNodeContents(nd);
    const rects = [...r.getClientRects()].filter(q => q.width > 0.5 && q.height > 0.5); if (!rects.length) continue;
    out.n++;
    const fs = parseFloat(cs.fontSize); out.fonte.push([fs, cs.textTransform === 'uppercase' || el.closest('th,.rf-kl,.rf-ct,.rf-cs,.rf-tag,.rf-ttl,.rf-sub2,.rf-sub'), tx.trim().slice(0, 24)]);
    // clip: ancestrais com overflow != visible
    const anc = []; for (let x = el; x && x !== document.documentElement; x = x.parentElement) { const c2 = getComputedStyle(x); if (c2.overflowX !== 'visible' || c2.overflowY !== 'visible') anc.push(x); }
    rects.forEach(q => {
      anc.forEach(a => { const ar = a.getBoundingClientRect(); if (q.left < ar.left - 1.5 || q.right > ar.right + 1.5 || q.top < ar.top - 1.5 || q.bottom > ar.bottom + 1.5) out.corte.push((el.className || el.tagName) + ' "' + tx.trim().slice(0, 24) + '" em ' + (a.id || a.className).toString().slice(0, 24)); });
      const vw = document.documentElement.clientWidth; if (q.right > vw + 1.5 || q.left < -1.5) out.corte.push('fora da tela: "' + tx.trim().slice(0, 24) + '"');
      linhas.push({ q, el, tx: tx.trim().slice(0, 24) });
    });
    if (/NaN|undefined|Infinity|\\[object/.test(tx)) out.bad.push(tx.trim().slice(0, 40));
  }
  for (let i = 0; i < linhas.length; i++) for (let j = i + 1; j < linhas.length; j++) {
    const a = linhas[i], b = linhas[j]; if (a.el === b.el || a.el.contains(b.el) && false) continue;
    const ox = Math.min(a.q.right, b.q.right) - Math.max(a.q.left, b.q.left), oy = Math.min(a.q.bottom, b.q.bottom) - Math.max(a.q.top, b.q.top);
    if (ox > 2 && oy > 3) out.sobre.push('"' + a.tx + '" x "' + b.tx + '"');
  }
  out.minFonte = out.fonte.length ? Math.min(...out.fonte.map(x => x[0])) : 99;
  out.minCorpo = Math.min(99, ...out.fonte.filter(x => !x[1]).map(x => x[0]));
  out.baixas = out.fonte.filter(x => x[0] < (tv ? 9 : 10)).map(x => x[0] + ' ' + x[2]).slice(0, 4);
  out.baixasCorpo = out.fonte.filter(x => !x[1] && x[0] < (tv ? 10.5 : 10)).map(x => x[0] + ' ' + x[2]).slice(0, 4);
  return out;
}`;
const CARTOES = `(tv) => { // cartoes sem corte de conteudo (telao nao rola) e sem rolagem vertical da pagina
  const bad = []; document.querySelectorAll('#rf-root .rf-card').forEach(c => { if (!c.offsetParent) return; if (c.scrollHeight > c.clientHeight + 1.5) bad.push(c.id + ' sh' + c.scrollHeight + '/ch' + c.clientHeight); const cb = c.querySelector('.rf-cb'); if (tv && cb && cb.scrollHeight > cb.clientHeight + 1.5) bad.push(c.id + ' corpo sh' + cb.scrollHeight + '/ch' + cb.clientHeight); });
  const b = document.querySelector('#rf-root .rf-body'); if (tv && b && b.scrollHeight > b.clientHeight + 1.5) bad.push('body ' + b.scrollHeight + '/' + b.clientHeight);
  const r = document.getElementById('rf-root'); if (tv && r.scrollHeight > r.clientHeight + 1.5) bad.push('root ' + r.scrollHeight + '/' + r.clientHeight);
  if (tv && document.documentElement.scrollHeight > innerHeight + 1) bad.push('pagina rola ' + document.documentElement.scrollHeight + '/' + innerHeight);
  return bad; }`;
const num = s => parseInt(String(s).replace(/\D/g, ''), 10);

async function contas(f, tag, esperadoClientes) {
  const d = await f.evaluate(() => {
    const res = RFM._state.res, rows = [...document.querySelectorAll('#rf-c-sg .rf-sv')].map(e => parseInt(e.firstChild.textContent.replace(/\D/g, ''), 10));
    const cels = [...document.querySelectorAll('#rf-root .rf-cel[data-rf]')].map(e => parseInt(e.querySelector('b').textContent.replace(/\D/g, ''), 10));
    const kpi = [...document.querySelectorAll('#rf-root .rf-kv')].map(e => e.textContent);
    return { n: res.clientes.length, seg: rows.reduce((s, x) => s + x, 0), cel: cels.reduce((s, x) => s + x, 0), kpi, receita: res.clientes.reduce((s, c) => s + c.valor, 0), kpiN: parseInt(kpi[0].replace(/\D/g, ''), 10), kpiRec: parseInt(kpi[2].replace(/\D/g, ''), 10) };
  });
  t(d.seg === d.n, tag + ': soma dos segmentos na tela (' + d.seg + ') = clientes (' + d.n + ')');
  t(d.cel === d.n, tag + ': soma das celulas da matriz na tela (' + d.cel + ') = clientes');
  t(d.kpiN === d.n, tag + ': KPI Clientes (' + d.kpiN + ') = clientes');
  t(Math.abs(d.kpiRec - Math.round(d.receita)) <= 1, tag + ': KPI Receita (' + d.kpiRec + ') = soma dos negocios (' + Math.round(d.receita) + ')');
  if (esperadoClientes != null) t(d.n === esperadoClientes, tag + ': clientes (' + d.n + ') = construidos na fixture (' + esperadoClientes + ')');
  return d;
}

// ================= 1) MEDIDAS em todas as telas =================
const TELAS = [[320, 700, 0], [360, 740, 0], [390, 844, 0], [430, 932, 0], [768, 1024, 0], [1366, 768, 0], [1920, 1080, 0], [1800, 1012, 1], [1366, 768, 1], [1920, 1080, 1]];
const SO = process.env.DASH_TELAS ? process.env.DASH_TELAS.split(',').map(Number) : null; // ex.: DASH_TELAS=320,360 repete so essas larguras (etapa 1)
for (const [W, H, tv] of TELAS.filter(x => !process.env.DASH_PULA1 && (!SO || SO.includes(x[0])))) {
  const tag = (tv ? 'telao ' : 'celular/PC ') + W + 'x' + H; log(tag);
  const { b, p, f } = await abrir(W, H, !!tv);
  await contas(f(), tag, REAL ? null : FX.esperado.clientes);
  const paginas = tv ? [1, 2] : [0];
  for (const k of paginas) {
    if (tv) { await pagina(f(), k); await p.waitForTimeout(500); }
    log(tag + ' medindo' + (tv ? ' pag ' + k : ''));
    const m = await f().evaluate(eval(MEDE), !!tv), tg = tag + (tv ? ' pag ' + k : '');
    t(!m.semRoot && m.n > 20, tg + ': texto visivel medido (' + m.n + ' trechos)');
    t(m.hscroll <= 0, tg + ': sem rolagem horizontal (' + m.hscroll + ')');
    t(!m.corte.length, tg + ': nenhum texto cortado ' + m.corte.slice(0, 3).join(' | '));
    t(!m.sobre.length, tg + ': nenhum texto sobreposto ' + m.sobre.slice(0, 3).join(' | '));
    t(!m.bad.length, tg + ': sem NaN/undefined ' + m.bad);
    t(!m.baixas.length, tg + ': fonte minima ok (' + m.minFonte + 'px) ' + m.baixas.join(' | '));
    t(!m.baixasCorpo.length, tg + ': corpo >= ' + (tv ? '10,5' : '10') + 'px ' + m.baixasCorpo.join(' | '));
    const cv = await f().evaluate(eval(CARTOES), !!tv);
    t(!cv.length, tg + ': cartoes sem conteudo cortado ' + cv.slice(0, 3).join(' | '));
  }
  t(!p.errs.length, tag + ': sem erro de JS/console ' + p.errs.slice(0, 3).join(' | '));
  await b.close();
}

if (SO) { console.log('\nt_rfm_tela (so etapa 1, larguras ' + SO + '): ' + ok + ' ok, ' + falhas + ' falhas'); process.exit(falhas ? 1 : 0); }
// ================= 2) CLIQUES, FILTROS, ORIGEM (celular 390 e telao 1920) =================
const FASE2 = process.env.DASH_CLIQUES ? process.env.DASH_CLIQUES.split(',').map(Number) : null; // ex.: DASH_CLIQUES=1920
for (const [W, H, tv] of [[390, 844, 0], [1920, 1080, 1], [1366, 768, 0]].filter(x => !FASE2 || FASE2.includes(x[0]))) {
  const tag = (tv ? 'telao ' : 'celular ') + W; log('cliques ' + tag);
  const { b, p, f } = await abrir(W, H, !!tv);
  const F = f();
  if (tv) await pagina(F, 1);
  // cada celula abre a lista certa
  log('celulas');
  const cels = await F.evaluate(() => [...document.querySelectorAll('#rf-root .rf-cel[data-rf]')].map(e => ({ k: e.getAttribute('data-rf'), n: parseInt(e.querySelector('b').textContent.replace(/\D/g, ''), 10) })));
  t(cels.length >= 5, tag + ': ha celulas clicaveis (' + cels.length + ')');
  let certas = 0;
  for (const c of cels) {
    await F.evaluate(k => document.querySelector('#rf-root [data-rf="' + k + '"]').click(), c.k);
    const r = await F.evaluate(() => { const o = document.getElementById('rf-ov'); return { show: o.classList.contains('show'), t: o.querySelector('#rf-pt').textContent, rows: o.querySelectorAll('#rf-lb a.rf-row').length, hrefs: [...o.querySelectorAll('#rf-lb a.rf-row')].map(a => a.href), vis: o.querySelector('#rf-lb').getBoundingClientRect().height > 40 }; });
    const [, R, Fc] = c.k.split(':');
    const esp = await F.evaluate(([R, Fc]) => RFM._state.res.clientes.filter(x => x.R === +R && x.F === +Fc).map(x => x.ultimoId), [R, Fc]);
    const idsLista = r.hrefs.map(h => h.split('id=')[1]);
    if (r.show && r.rows === c.n && esp.length === c.n && idsLista.slice().sort().join() === esp.slice().sort().join() && r.hrefs.every(h => h.includes('web.agendor.com.br/sistema/negocios/historico.php?id='))) certas++; else console.log('  celula ' + c.k + ': lista com ' + r.rows + ' esperado ' + c.n);
    await p.keyboard.press('Escape'); await p.waitForTimeout(60);
    const fechou = await F.evaluate(() => !document.getElementById('rf-ov').classList.contains('show')); if (!fechou) t(false, tag + ': Esc nao fechou');
  }
  t(certas === cels.length, tag + ': todas as ' + cels.length + ' celulas abrem a lista certa (' + certas + ')');
  log('painel');
  await F.evaluate(k => document.querySelector('#rf-root [data-rf="' + k + '"]').click(), cels.slice().sort((a, b) => b.n - a.n)[0].k);
  const nome = await F.evaluate(() => document.querySelector('#rf-lb .rf-nm').textContent);
  await F.fill('#rf-q', nome.slice(0, 5)); await p.waitForTimeout(100);
  const busca = await F.evaluate(() => ({ t: document.getElementById('rf-pt').textContent, n: document.querySelectorAll('#rf-lb a.rf-row').length }));
  t(busca.n >= 1 && busca.n <= cels.slice().sort((a, b) => b.n - a.n)[0].n, tag + ': busca filtra a lista (' + busca.t + ')');
  await F.fill('#rf-q', 'zzzz-nao-existe'); await p.waitForTimeout(100);
  t(await F.evaluate(() => /Nenhum cliente/.test(document.getElementById('rf-lb').textContent)), tag + ': busca sem resultado mostra aviso');
  await F.fill('#rf-q', '');
  await F.evaluate(() => document.querySelector('[data-rfo="nome"]').click());
  const ordem = await F.evaluate(() => [...document.querySelectorAll('#rf-lb .rf-nm')].map(e => e.textContent.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
  t(ordem.every((v, i) => !i || ordem[i - 1] <= v), tag + ': ordenar por nome funciona');
  await F.evaluate(() => document.querySelector('[data-rfo="valor"]').click());
  const vals = await F.evaluate(() => [...document.querySelectorAll('#rf-lb .rf-vl')].map(e => parseInt(e.textContent.replace(/\D/g, ''), 10)));
  t(vals.every((v, i) => !i || vals[i - 1] >= v) || vals.every((v, i) => !i || vals[i - 1] <= v), tag + ': ordenar por valor funciona');
  const mo = await F.evaluate(eval(`(tv) => { const o = document.getElementById('rf-ov'); const pn = o.querySelector('.rf-pn').getBoundingClientRect(); return { dentro: pn.left >= -1 && pn.right <= innerWidth + 1 && pn.top >= -1 && pn.bottom <= innerHeight + 1, h: document.documentElement.scrollWidth - document.documentElement.clientWidth }; }`), !!tv);
  t(mo.dentro, tag + ': painel de lista cabe na tela');
  await p.keyboard.press('Escape');
  log('segmentos');
  const segs = await F.evaluate(() => RFM.SEGS.map(s => s.k));
  let segOk = 0, tot = 0;
  for (const s of segs) {
    const esp = await F.evaluate(k => RFM._state.res.clientes.filter(c => c.seg === k).length, s);
    if (!esp) continue; tot++;
    await F.evaluate(k => document.querySelector('#rf-root [data-rf="seg:' + k + '"]').click(), s);
    const r = await F.evaluate(() => ({ kpi: parseInt(document.querySelector('#rf-root .rf-kv').textContent.replace(/\D/g, ''), 10), cel: [...document.querySelectorAll('#rf-root .rf-cel[data-rf]')].reduce((a, e) => a + parseInt(e.querySelector('b').textContent.replace(/\D/g, ''), 10), 0), chip: [...document.querySelectorAll('#rf-root .rf-fil .rf-chip')].map(e => e.textContent).join('|'), on: !!document.querySelector('#rf-c-sg .rf-sr.on') }));
    if (r.kpi === esp && r.cel === esp && r.on && /Limpar/.test(r.chip)) segOk++; else console.log('  segmento ' + s + ': kpi ' + r.kpi + ' cel ' + r.cel + ' esperado ' + esp);
    await F.evaluate(k => document.querySelector('#rf-root [data-rf="seg:' + k + '"]').click(), s);
  }
  t(segOk === tot, tag + ': clicar em cada segmento filtra KPIs e matriz (' + segOk + '/' + tot + ')');
  log('reps');
  const rep = await F.evaluate(() => { const tr = [...document.querySelectorAll('#rf-c-rp tr[data-rf]')].find(x => parseInt(x.cells[1].textContent, 10) > 0); return tr ? { k: tr.getAttribute('data-rf'), n: parseInt(tr.cells[1].textContent, 10) } : null; });
  if (rep) {
    await F.evaluate(k => document.querySelector('#rf-c-rp [data-rf="' + k + '"]').click(), rep.k);
    const r = await F.evaluate(() => parseInt(document.querySelector('#rf-root .rf-kv').textContent.replace(/\D/g, ''), 10));
    t(r === rep.n, tag + ': filtrar por representante (' + r + ' = ' + rep.n + ')');
    await F.evaluate(() => document.querySelector('#rf-root [data-rf="limpa"]').click());
    t(await F.evaluate((n) => parseInt(document.querySelector('#rf-root .rf-kv').textContent.replace(/\D/g, ''), 10) === n, FX.esperado.clientes) || REAL, tag + ': Limpar filtro volta ao total');
  }
  // representantes: so os 8 de campo + Grandes Contas por ultimo
  const reps = await F.evaluate(() => [...document.querySelectorAll('#rf-c-rp tbody tr')].map(tr => tr.cells[0].firstChild.textContent));
  t(reps.length === 9 && reps[8] === 'Grandes Contas' && !reps.includes('Felipe'), tag + ': ranking tem 8 de campo + Grandes Contas por ultimo, sem Felipe/ex-time (' + reps.join(',') + ')');
  log('kpis');
  for (const k of ['all', 'ativos', 'risco', 'ciclo']) {
    await F.evaluate(k => document.querySelector('#rf-root [data-rf="kpi:' + k + '"]').click(), k);
    const o = await F.evaluate(() => document.getElementById('rf-ov').classList.contains('show')); t(o, tag + ': KPI ' + k + ' abre lista');
    await p.keyboard.press('Escape');
  }
  // acao: Em risco / Nao pode perder
  if (tv) await pagina(F, 2);
  const ac = await F.evaluate(() => { const rows = [...document.querySelectorAll('#rf-c-ac .rf-lst')][0]; const L = [...(rows ? rows.querySelectorAll('a.rf-row') : [])]; const v = L.map(a => parseInt(a.querySelector('.rf-vl').textContent.replace(/\D/g, ''), 10)); const tags = L.map(a => a.querySelector('.rf-tag').textContent); return { v, tags }; });
  t(ac.tags.every(x => /Em risco|Não pode perder/.test(x)), tag + ': lista de acao so tem Em risco/Nao pode perder');
  t(ac.v.every((x, i) => !i || ac.v[i - 1] >= x), tag + ': lista de acao em ordem de maior valor');
  log('origem');
  const cont = {};
  for (const o of ['inbound', 'outbound', 'both']) {
    await F.evaluate(o => document.querySelector('.ochip[data-o="' + o + '"]').click(), o); await p.waitForTimeout(700);
    cont[o] = await F.evaluate(() => parseInt(document.querySelector('#rf-root .rf-kv').textContent.replace(/\D/g, ''), 10));
  }
  t(cont.inbound + cont.outbound === cont.both, tag + ': origem Inbound ' + cont.inbound + ' + Outbound ' + cont.outbound + ' = Ambos ' + cont.both);
  if (!REAL) t(cont.inbound === FX.esperado.porOrigem.inbound && cont.outbound === FX.esperado.porOrigem.outbound, tag + ': origens = construidas na fixture');
  await contas(F, tag + ' (apos filtros)', null);
  t(!p.errs.length, tag + ': sem erro de JS apos os cliques ' + p.errs.slice(0, 3).join(' | '));
  await b.close();
}

// ================= 3) ESTADOS e ATUALIZACAO =================
if (!REAL) for (const [W, H, tv] of [[390, 844, 0], [1920, 1080, 1]]) {
  const tag = (tv ? 'telao ' : 'celular ') + W;
  let r1 = await abrir(W, H, !!tv, { rows: [], espera: 6500 });
  t(await r1.f().evaluate(() => /Nenhum cliente|Carregando/.test(document.getElementById('rf-root').textContent)), tag + ': estado vazio tem mensagem');
  t(!r1.p.errs.length, tag + ': estado vazio sem erro de JS ' + r1.p.errs.join('|'));
  await r1.b.close();
  r1 = await abrir(W, H, !!tv, { erro: true, espera: 8000 });
  const txtErro = await r1.f().evaluate(() => document.getElementById('rf-root').textContent);
  t(/Não consegui|Nenhum cliente|Carregando/.test(txtErro), tag + ': estado de erro tem mensagem (' + txtErro.slice(0, 60) + ')');
  await r1.b.close();
  // atrasado: sincronizado ha 2h
  const velho = new Date(Date.now() - 2 * 3600e3).toISOString();
  r1 = await abrir(W, H, !!tv, { rows: fixture({ synced: velho }).deals });
  t(await r1.f().evaluate(() => /atrasado/.test(document.getElementById('rf-root').textContent) && !!document.querySelector('#rf-root .rf-st.warn')), tag + ': dado velho aparece como atrasado');
  const hh = await r1.f().evaluate(() => (document.querySelector('#rf-root .rf-st') || {}).textContent); t(/às \d\d:\d\d/.test(hh || ''), tag + ': mostra "sincronizado às HH:MM" (' + hh + ')');
  await r1.b.close();
  // atualizacao: troca a fonte e forca o ciclo do dash (loadData) -> a aba muda sozinha
  const b = await chromium.launch({ executablePath: EXE }); const ctx = await b.newContext({ viewport: { width: W, height: H } }); const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message));
  let rows = fixture({ n: 30 }).deals; const o = { get rows() { return rows; } };
  await p.route(/dash-geral-bridge.*\/rest\/v1\/dash_geral_deals/, r => r.fulfill({ status: 200, headers: { ...cors, 'content-range': '0-' + (rows.length - 1) + '/' + rows.length }, contentType: 'application/json', body: JSON.stringify(rows) }));
  await p.route(/dash-geral-bridge.*\/api\/table/, r => r.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ rows }) }));
  await p.route(/dash-geral-bridge.*\/rest\/v1\/(?!dash_geral_deals)/, r => r.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: '[]' }));
  await p.route(/gs-agendor-worker|ga4-dash-cache|bia-dash-sync/, r => r.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: '{}' }));
  await p.goto(BASE + (tv ? 'telao/index.html?rot=0' : 'index.html'), { waitUntil: 'commit' }); await p.waitForTimeout(6500);
  const F = () => p.frames().find(x => x !== p.mainFrame()) || p;
  await F().evaluate(() => document.querySelector('.ochip[data-v="rfm"]').click()); await p.waitForTimeout(1000);
  const antes = await F().evaluate(() => parseInt(document.querySelector('#rf-root .rf-kv').textContent.replace(/\D/g, ''), 10));
  rows = fixture({ n: 45, synced: new Date().toISOString() }).deals;
  await F().evaluate(() => { _lastDealsSyncedAt_ = null; _rawDeals = null; return loadData(true); }); await p.waitForTimeout(2500);
  const depois = await F().evaluate(() => parseInt(document.querySelector('#rf-root .rf-kv').textContent.replace(/\D/g, ''), 10));
  t(antes === 30 && depois === 45, tag + ': a aba atualiza quando os dados mudam (' + antes + ' para ' + depois + ')');
  t(!p.errs.length, tag + ': atualizacao sem erro de JS');
  await b.close();
}
console.log('\nt_rfm_tela' + (REAL ? ' (DADOS REAIS)' : '') + ': ' + ok + ' ok, ' + falhas + ' falhas');
process.exit(falhas ? 1 : 0);
