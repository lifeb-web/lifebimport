// TESTE · pizza central (Vendas e LTV), telao e celular.
// 1) matriz periodo x origem (dado real): rosca (por representante e Venda nova x Reposicao) = ranking = cartao "Ganho no periodo" + Reposicoes;
// 2) as 3 visoes trocam sem erro de JS; tocar numa fatia seleciona e mostra o detalhe; tocar de novo limpa; so a visao "origem" filtra o painel;
// 3) LTV: rosca por representante = "Ganho em Reposicao"; por ciclo soma o mesmo valor.
// uso: servir a raiz do site, DASH_FIXTURES=<pasta mocks> node t_pizza.mjs
import { abrir, ir, per, ori, EXE, BASE, mocar } from './telao_lib.mjs';
import { chromium } from 'playwright-core';
let falhas = 0; const falha = m => { falhas++; console.log('  FALHOU: ' + m); };
const brl = t => { const s = String(t).replace(/[^\d,]/g, '').replace(',', '.'); return parseFloat(s) || 0; };
const PERIODOS = ['today', 'week', 'month', 'prev_month', '30d', '90d', 'total'];
const MEDE = `() => {
  const money = t => parseFloat(String(t).replace(/[^\\d,]/g, '').replace(',', '.')) || 0;
  const hero = money(document.getElementById('hero-val').textContent);
  const repoRow = document.getElementById('hero-repo-row');
  const total = repoRow && getComputedStyle(repoRow).display !== 'none' ? money(document.getElementById('hero-repo-total-val').textContent) : hero;
  const soma = _pzReps ? _pzReps.reduce((s, r) => s + r.totalValor, 0) : null;
  const somaN = _pzReps ? _pzReps.reduce((s, r) => s + r.novaValor, 0) : null;
  const somaR = _pzReps ? _pzReps.reduce((s, r) => s + r.reposValor, 0) : null;
  const out = { total, hero, soma, somaN, somaR };
  const vis = {};
  ['rep', 'nv', 'orig'].forEach(v => { _pzVis.vendas = v; const bd = pzAtual_(); vis[v] = bd ? Math.round(bd.totalValor * 100) / 100 : null; });
  _pzVis.vendas = 'rep';
  out.vis = vis; out.origemTotal = _origemData ? Math.round(_origemData.bd.totalValor * 100) / 100 : null;
  return out;
}`;
const f2 = (a, b) => Math.abs(a - b) < 0.011;
{
  const { b, p, f } = await abrir(1920, 1080);
  for (const o of ['both', 'outbound', 'inbound']) for (const pe of PERIODOS) {
    await ori(f(), o); await per(f(), pe); await p.waitForTimeout(1800);
    const r = await f().evaluate(eval(MEDE));
    const tag = `telao ${o} ${pe}`;
    // com origem filtrada o cartao do topo e o ranking usam o mesmo filtro; a visao "origem" mostra sempre todos os canais (so no "Ambos" fecha)
    if (!f2(r.soma, r.total)) falha(`${tag}: ranking ${r.soma} != cartao Ganho+Reposicoes ${r.total}`);
    if (!f2(r.vis.rep, r.soma)) falha(`${tag}: rosca por rep ${r.vis.rep} != ranking ${r.soma}`);
    if (!f2(r.vis.nv, r.soma)) falha(`${tag}: rosca nova x reposicao ${r.vis.nv} != ranking ${r.soma}`);
    if (!f2(r.somaN + r.somaR, r.soma)) falha(`${tag}: nova+reposicao ${r.somaN + r.somaR} != total ${r.soma}`);
    if (o === 'both' && !f2(r.vis.orig, r.total)) falha(`${tag}: rosca por origem ${r.vis.orig} != cartao ${r.total}`);
    console.log(`  ${tag}: ranking ${r.soma} | cartao ${r.total} | rep ${r.vis.rep} | nv ${r.vis.nv} | orig ${r.vis.orig}`);
  }
  // interacao
  await ori(f(), 'both'); await per(f(), 'month'); await p.waitForTimeout(1500);
  const seq = await f().evaluate(async () => {
    const out = {}; const esp = ms => new Promise(r => setTimeout(r, ms));
    for (const v of ['nv', 'orig', 'rep']) {
      document.querySelector('.pz-vb[data-pz="' + v + '"]').click(); await esp(200);
      out[v] = { itens: document.querySelectorAll('#origem-legend .orig-item').length, fatias: document.querySelectorAll('#origem-donut .orig-seg').length, centro: document.querySelector('#origem-donut .orig-t2').textContent, foot: document.getElementById('origem-foot').textContent.trim().slice(0, 90) };
    }
    const seg = document.querySelector('#origem-donut .orig-seg'); seg.dispatchEvent(new MouseEvent('click', { bubbles: true })); await esp(200);
    out.sel = { sel: _pzSel, foot: document.getElementById('origem-foot').textContent.trim().slice(0, 140), origemFiltro: _originMode };
    document.querySelector('#origem-donut .orig-seg').dispatchEvent(new MouseEvent('click', { bubbles: true })); await esp(200);
    out.limpo = { sel: _pzSel };
    return out;
  });
  console.log('  visoes:', JSON.stringify(seq));
  if (seq.nv.fatias !== 2) falha('visao nova x reposicao deveria ter 2 fatias: ' + seq.nv.fatias);
  if (!seq.rep.itens) falha('visao por representante sem legenda');
  if (!seq.sel.sel || !/ganho/.test(seq.sel.foot) || !/Venda nova/.test(seq.sel.foot)) falha('detalhe da fatia selecionada incompleto: ' + JSON.stringify(seq.sel));
  if (seq.sel.origemFiltro !== 'both') falha('tocar na fatia de representante nao pode filtrar o painel');
  if (seq.limpo.sel) falha('tocar de novo deveria limpar a selecao');
  // LTV
  await ir(f(), 'ltv'); await p.waitForTimeout(2500);
  const l = await f().evaluate(async () => {
    const esp = ms => new Promise(r => setTimeout(r, ms)); const money = t => parseFloat(String(t).replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const hero = money(document.getElementById('ltv-hero-val').textContent); const o = { hero, tab: _pzTab, noSlot: document.getElementById('pz-slot-ltv').contains(document.getElementById('origem-card')) };
    o.rep = pzBd_() && pzBd_().totalValor; document.querySelector('.pz-vb[data-pz="ciclo"]').click(); await esp(200); const bd = pzBd_(); o.ciclo = bd && bd.totalValor; o.fatias = bd && bd.canais.map(c => c.label + ':' + c.cont).join(' | ');
    return o;
  });
  console.log('  ltv:', JSON.stringify(l));
  if (!l.noSlot) falha('LTV: rosca nao foi para a aba LTV');
  if (!f2(l.rep, l.hero)) falha(`LTV: rosca por rep ${l.rep} != Ganho em Reposicao ${l.hero}`);
  if (!f2(l.ciclo, l.hero)) falha(`LTV: rosca por ciclo ${l.ciclo} != Ganho em Reposicao ${l.hero}`);
  await ir(f(), 'vendas'); await p.waitForTimeout(800);
  if (await f().evaluate(() => !document.getElementById('pz-slot-vendas').contains(document.getElementById('origem-card')))) falha('voltar para Vendas nao devolveu a rosca');
  const js = [...new Set(p.errs)].filter(e => !/Failed to load|ERR_FAILED|HTTP4/.test(e)); if (js.length) falha('erros JS telao: ' + js.slice(0, 3));
  await b.close();
}
// celular
for (const [W, H] of [[320, 700], [390, 844], [768, 1024]]) {
  const b = await chromium.launch({ executablePath: EXE }); const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await mocar(p, 'ok'); await p.goto(BASE + 'index.html', { waitUntil: 'commit' }); await p.waitForTimeout(9000);
  const r = await p.evaluate(eval(MEDE));
  const m = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth, o = { h: document.documentElement.scrollWidth - vw, toque: [], fonte: 99 };
    document.querySelectorAll('.pz-vb,.rkm-sort button,.pz-item,.rk-head').forEach(e => { const r = e.getBoundingClientRect(); if (r.height < 43.5) o.toque.push(e.className + ' ' + Math.round(r.height)); });
    document.querySelectorAll('#pz-slot-vendas *,#reps-list *').forEach(e => { if (!e.getClientRects().length || e.closest('svg') || e.classList.contains('sec-hd')) return; if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 12) (o.peq = o.peq || []).push(e.className + ' ' + fs); o.fonte = Math.min(o.fonte, fs); });
    const ord = [...document.querySelectorAll('.rk-card .rk-tot')].map(e => parseFloat(e.textContent.replace(/[^\d,]/g, '').replace(',', '.')));
    o.ordenado = ord.slice(0, -1).every((v, i, a) => i === a.length - 1 || v >= a[i + 1]) ; // GC no fim pode quebrar a ordem
    return o;
  });
  console.log(`  celular ${W}: ranking ${r.soma} | cartao ${r.total} | rep ${r.vis.rep} | nv ${r.vis.nv} | orig ${r.vis.orig} | hscroll ${m.h} | fonte min ${m.fonte} | toque ruim ${m.toque.length}`);
  if (!f2(r.soma, r.total)) falha(`celular ${W}: ranking != cartao`);
  if (m.h > 0) falha(`celular ${W}: rolagem horizontal ${m.h}`);
  if (m.fonte < 12) falha(`celular ${W}: fonte ${m.fonte} < 12: ${[...new Set(m.peq)].slice(0, 6)}`);
  if (m.toque.length) falha(`celular ${W}: alvos < 44px: ${m.toque.slice(0, 3)}`);
  if (errs.length) falha('erros JS celular: ' + errs.slice(0, 2));
  await b.close();
}
console.log(falhas ? falhas + ' FALHA(S)' : 'TODOS OS TESTES DA PIZZA PASSARAM');
process.exit(falhas ? 1 : 0);
