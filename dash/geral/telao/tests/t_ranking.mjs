// TESTE · ranking da aba Vendas (total = venda nova + reposicao), telao e celular.
// uso: servir a raiz do site (python3 -m http.server 8799), DASH_FIXTURES=<pasta mocks> node t_ranking.mjs
// 1) cenarios sinteticos (0, 1, 8, 12 vendedores; nomes longos; numeros enormes) em varias telas: sem corte, sem sobreposicao,
//    sem rolagem horizontal, fonte minima, alvo de toque 44px no celular, detalhe aparece no expandido (telao) e ao tocar (celular);
// 2) matriz periodo x origem com dado real: sem NaN/undefined/erro de JS, e Total = Venda nova + Reposicao em cada linha.
import { abrir, ir, per, ori } from './telao_lib.mjs';
import { chromium } from 'playwright-core';
import { EXE, BASE } from './telao_lib.mjs';
let falhas = 0; const falha = m => { falhas++; console.log('  FALHOU: ' + m); };
const mk = (n, o = {}) => Array.from({ length: n }, (_, i) => ({
  id: 976406 + i, name: o.nome ? o.nome + ' ' + i : ['Iramar', 'Natanael', 'Janeth', 'Sâmilla', 'Washington', 'Flávia', 'Anderson', 'Edgard', 'Felipe', 'Beatriz', 'Carlos', 'Dora'][i % 12],
  ativos: 3, pipeline: o.big ? 9e15 : 1000 * (i + 1), stale: i % 3, ganhoValor: o.big ? 123456789012345 : 5000 * (n - i), ganhoCont: n - i, perdidoCont: 2,
  dealsByStage: { '3771722': 1, '3771723': 1, '3771724': 0, '3771725': 1 }, ticketMedio: 1000, leadsNoPeriodo: 10, conversao: 12.5 + i,
}));
const INJ = `(args) => {
  const [nv, o, alvo] = args; const mk = ${mk.toString()};
  const reps = mk(nv, o);
  window.computeLtvData = () => ({ reps: reps.map(r => Object.assign({}, r, { ganhoValor: o.big ? 98765432109876 : 700 * (r.ganhoCont), ganhoCont: 1 })) });
  if (alvo === 'telao') { document.getElementById('rep-card').style.display = ''; renderLeaderboard(reps, []); } else { renderReps(reps, []); }
}`;
const MEDIDA = `(alvo) => {
  const box = document.getElementById(alvo === 'telao' ? 'lb-rows' : 'reps-list'); if (!box) return { semBox: true };
  const rows = [...box.querySelectorAll(alvo === 'telao' ? '.lb-row' : '.rk-card')];
  const vw = document.documentElement.clientWidth, out = { n: rows.length, h: document.documentElement.scrollWidth - vw, sobre: [], corte: [], fonte: [], toque: [], bad: [] };
  const rs = rows.map(r => r.getBoundingClientRect());
  const cb = box.getBoundingClientRect();
  rows.forEach((r, i) => { for (let j = i + 1; j < rows.length; j++) { const a = rs[i], b = rs[j]; const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (oy > 2 && alvo !== 'telao') out.sobre.push(i + 'x' + j); if (alvo === 'telao' && oy > 2 && box.scrollHeight <= box.clientHeight + 1) out.sobre.push(i + 'x' + j); } });
  box.querySelectorAll('*').forEach(e => {
    const cs = getComputedStyle(e); if (cs.display === 'none' || !e.getClientRects().length) return; const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!own) return;
    if (e.scrollWidth > e.clientWidth + 1 && cs.textOverflow !== 'ellipsis' && cs.overflowX !== 'visible') out.corte.push(e.className + ' ' + e.textContent.trim().slice(0, 20));
    const r = e.getBoundingClientRect(); const pr = (e.closest('.lb-row,.rk-card') || box).getBoundingClientRect(); if (r.right > pr.right + 1 || r.left < pr.left - 1) { if (cs.textOverflow !== 'ellipsis') out.corte.push('vaza ' + e.className); }
    out.fonte.push(parseFloat(cs.fontSize));
  });
  if (alvo !== 'telao') box.querySelectorAll('.rk-head').forEach(e => { const r = e.getBoundingClientRect(); if (r.height < 43.5 || r.width < 43.5) out.toque.push(Math.round(r.width) + 'x' + Math.round(r.height)); });
  out.minFonte = out.fonte.length ? Math.min(...out.fonte) : 99; delete out.fonte;
  if (/NaN|undefined|Infinity|\\[object/.test(box.innerText)) out.bad.push(box.innerText.match(/NaN|undefined|Infinity|\\[object/)[0]);
  out.scrolla = box.scrollHeight > box.clientHeight + 1;
  return out;
}`;
// ---------- telao ----------
for (const [W, H] of [[1366, 768], [1920, 1080], [2560, 1440], [3840, 2160]]) {
  const { b, p, f } = await abrir(W, H, { espera: 7000 });
  await ir(f(), 'vendas');
  for (const [nv, o, nome] of [[0, {}, '0'], [1, {}, '1'], [8, {}, '8'], [12, {}, '12'], [10, { nome: 'Representante com nome muito mais comprido que a coluna', big: true }, 'nome longo+enorme']]) {
    await f().evaluate(eval(INJ), [nv, o, 'telao']); await p.waitForTimeout(500);
    const m = await f().evaluate(eval(MEDIDA), 'telao');
    const esc = Math.min(W / 1920, H / 1080);
    const tag = `telao ${W}x${H} ${nome}`;
    if (m.h > 0) falha(`${tag}: rolagem horizontal ${m.h}`);
    if (m.sobre.length) falha(`${tag}: linhas sobrepostas ${m.sobre.slice(0, 3)}`);
    if (m.corte.length) falha(`${tag}: texto cortado ${m.corte.slice(0, 3)}`);
    if (m.bad.length) falha(`${tag}: ${m.bad}`);
    if (nv && m.minFonte < 9) falha(`${tag}: fonte ${m.minFonte}px`);
    if (nv <= 8 && m.scrolla && H >= 768 && nv > 0) falha(`${tag}: ${nv} vendedores nao cabem sem rolar`);
    // expandido: detalhe visivel
    if (nv === 8) {
      await f().evaluate(() => document.querySelector('#rep-card .expand-btn').click()); await p.waitForTimeout(400);
      const x = await f().evaluate(() => { const d = document.querySelector('#expandModalBody .lb-det'); return { det: !!d && getComputedStyle(d).display !== 'none', n: document.querySelectorAll('#expandModalBody .lb-row').length, h: document.getElementById('expandModalBody').scrollWidth - document.getElementById('expandModalBody').clientWidth }; });
      if (!x.det) falha(`${tag}: detalhe nao aparece no expandido`);
      if (x.n !== 8) falha(`${tag}: expandido com ${x.n} linhas`);
      if (x.h > 2) falha(`${tag}: rolagem horizontal no expandido`);
      await f().evaluate(() => document.getElementById('expandModalClose').click());
    }
    console.log(`  ${tag}: linhas ${m.n} rola=${m.scrolla} fonte min ${m.minFonte}`);
  }
  if (p.errs.filter(e => !/Failed to load|HTTP/.test(e)).length) falha(`telao ${W}x${H}: erros JS ${p.errs.slice(0, 3)}`);
  await b.close();
}
// ---------- celular ----------
for (const [W, H] of [[320, 700], [390, 844], [768, 1024], [1100, 800]]) {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: W < 1000 }); const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message));
  await p.route(/gs-agendor-worker|ga4-dash-cache/, r => r.abort());
  await p.goto(BASE + 'index.html', { waitUntil: 'commit' }); await p.waitForTimeout(7000);
  for (const [nv, o, nome] of [[0, {}, '0'], [1, {}, '1'], [8, {}, '8'], [12, {}, '12'], [10, { nome: 'Representante com nome muito mais comprido que a coluna', big: true }, 'nome longo+enorme']]) {
    await p.evaluate(eval(INJ), [nv, o, 'cel']); await p.waitForTimeout(300);
    const m = await p.evaluate(eval(MEDIDA), 'cel'); const tag = `celular ${W}x${H} ${nome}`;
    if (m.h > 0) falha(`${tag}: rolagem horizontal ${m.h}`);
    if (m.sobre.length) falha(`${tag}: cartoes sobrepostos`);
    if (m.corte.length) falha(`${tag}: texto cortado ${m.corte.slice(0, 3)}`);
    if (m.toque.length) falha(`${tag}: alvo de toque < 44px ${m.toque.slice(0, 2)}`);
    if (m.bad.length) falha(`${tag}: ${m.bad}`);
    if (nv && m.minFonte < 12 - 0.01) falha(`${tag}: fonte ${m.minFonte}px (< 12)`);
    if (nv === 8) {
      await p.click('.rk-card:nth-child(4) .rk-head'); await p.waitForTimeout(150);
      const x = await p.evaluate(() => { const c = document.querySelectorAll('.rk-card')[1]; const d = c.querySelector('.rk-det'); const bt = c.querySelector('.rk-open').getBoundingClientRect(); return { open: c.classList.contains('open'), vis: getComputedStyle(d).display !== 'none', aria: c.querySelector('.rk-head').getAttribute('aria-expanded'), btH: bt.height, h: document.documentElement.scrollWidth - document.documentElement.clientWidth }; });
      if (!x.open || !x.vis || x.aria !== 'true') falha(`${tag}: detalhe nao abriu ao tocar`);
      if (x.btH < 43.5) falha(`${tag}: botao do detalhe ${x.btH}px`);
      if (x.h > 0) falha(`${tag}: rolagem horizontal com detalhe aberto`);
      await p.click('.rk-card:nth-child(4) .rk-head');
    }
    console.log(`  ${tag}: cartoes ${m.n} fonte min ${m.minFonte}`);
  }
  if (p.errs.length) falha(`celular ${W}x${H}: erros JS ${p.errs.slice(0, 3)}`);
  await b.close();
}
// ---------- matriz periodo x origem (dado real, telao): Total = nova + reposicao, sem NaN ----------
{
  const { b, p, f } = await abrir(1920, 1080, { espera: 8000 });
  await ir(f(), 'vendas');
  for (const pr of ['today', 'yesterday', 'week', 'month', 'prev_month', '30d', '60d', '90d', 'total']) for (const o of ['outbound', 'inbound', 'both']) {
    await per(f(), pr); await ori(f(), o); await p.waitForTimeout(900);
    const r = await f().evaluate(() => {
      const rows = [...document.querySelectorAll('#lb-rows .lb-row')]; const parse = s => { const m = String(s).replace(/R\$\s*/, '').replace(/\./g, '').replace(',', '.'); return parseFloat(m); };
      const bad = /NaN|undefined|Infinity/.test(document.getElementById('lb-rows').innerText);
      const dif = rows.map(r => { const t = parse(r.querySelector('.rk-tot').textContent); const d = [...r.querySelectorAll('.lb-det b')].map(b => parse(b.textContent)); return Math.abs(t - (d[0] + d[1])); }).filter(x => x > 0.011);
      return { n: rows.length, bad, dif: dif.length, nota: document.getElementById('rk-nota').textContent };
    });
    if (r.bad) falha(`matriz ${pr}/${o}: NaN/undefined`);
    if (r.dif) falha(`matriz ${pr}/${o}: ${r.dif} linha(s) com total != nova + reposicao`);
    if (o !== 'both' && !/S\u00f3 (Outbound|Inbound)/.test(r.nota)) falha(`matriz ${pr}/${o}: nota de origem ausente`);
  }
  if (p.errs.filter(e => !/Failed to load|HTTP/.test(e)).length) falha('matriz: erros JS ' + p.errs.slice(0, 3));
  await b.close();
}
console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTODOS OS TESTES DO RANKING PASSARAM');
process.exit(falhas ? 1 : 0);
