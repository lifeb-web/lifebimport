// 03/11/2026: celular. Legenda da rosca (Vendas e LTV, visões Por representante / Venda nova x Reposição / Por origem / Por ciclo) sem nome cortado,
// e ranking com os detalhes abertos sem texto sobreposto, em 320, 390, 430 e 768 de largura. Rodar: servidor local na raiz do site (porta 8799) e  node t_celular_legenda.mjs
// BASE=https://projetojlbv.com.br/dash/geral/ testa o site real.
import { chromium } from 'playwright-core';
const EXE = process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const BASE = process.env.BASE || 'http://localhost:8799/dash/geral/';
const b = await chromium.launch({ executablePath: EXE }); let ruins = 0;
for (const [W, H] of [[320, 640], [390, 844], [430, 932], [768, 1024]]) {
  const p = await (await b.newContext({ viewport: { width: W, height: H }, hasTouch: true })).newPage();
  await p.goto(BASE + "index.html?nc=" + Date.now(), { waitUntil: 'commit' }); await p.waitForTimeout(9000);
  for (const per of ['total', 'month']) for (const aba of ['vendas', 'ltv']) {
    await p.evaluate(v => document.querySelector('.pchip[data-p="' + v + '"]')?.click(), per); await p.waitForTimeout(700);
    await p.evaluate(v => (document.querySelector('.ochip[data-v="' + v + '"]'))?.click(), aba); await p.waitForTimeout(1200);
    for (const vis of ['rep', 'nv', 'orig', 'ciclo']) {
      const ok = await p.evaluate(v => { const e = document.querySelector('.pz-vb[data-pz="' + v + '"]'); if (!e || !e.offsetParent) return false; e.click(); return true; }, vis); if (!ok) continue; await p.waitForTimeout(500);
      const r = await p.evaluate(() => {
        const out = { itens: 0, cortados: [], sobrep: [], hscroll: document.documentElement.scrollWidth > innerWidth + 2 };
        const its = [...document.querySelectorAll('#origem-legend .pz-item, #origem-legend .orig-item')].filter(i => i.offsetParent);
        out.itens = its.length;
        its.forEach(i => { const n = i.querySelector('.pz-name,.orig-i-name'); if (n && (n.scrollWidth > n.clientWidth + 1) && /(hidden|clip)/.test(getComputedStyle(n).overflowX)) out.cortados.push(n.textContent.trim().slice(0, 20)); const pc = i.querySelector('.pz-pc,.orig-i-pc'); if (n && pc) { const g = document.createRange(); g.selectNodeContents(n); const q = pc.getBoundingClientRect(); for (const a of g.getClientRects()) if (Math.min(a.right, q.right) - Math.max(a.left, q.left) > 2 && Math.min(a.bottom, q.bottom) - Math.max(a.top, q.top) > 2) out.cortados.push('nome sobre %: ' + n.textContent.trim().slice(0, 16)); } });
        const rs = its.map(i => i.getBoundingClientRect()); for (let a = 0; a < rs.length; a++) for (let c = a + 1; c < rs.length; c++) if (Math.min(rs[a].right, rs[c].right) - Math.max(rs[a].left, rs[c].left) > 2 && Math.min(rs[a].bottom, rs[c].bottom) - Math.max(rs[a].top, rs[c].top) > 2) out.sobrep.push(a + '/' + c);
        return out;
      });
      if (r.itens && (r.cortados.length || r.sobrep.length || r.hscroll)) { ruins++; console.log(`❌ ${W}x${H} ${aba}/${per}/${vis}:`, JSON.stringify(r)); }
    }
    if (aba !== 'vendas') continue;   // o ranking com detalhes (.rk-card) é da aba Vendas; a LTV do celular não tem essa lista
    // abre todos os detalhes do ranking (toque) e procura texto sobreposto
    await p.evaluate(() => document.querySelectorAll('.rk-head').forEach(r => { try { r.click(); } catch (e) {} })); await p.waitForTimeout(500);
    let nCards = 0; const ov = await p.evaluate(() => {
      const vis = e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(e).visibility !== 'hidden'; };
      const rows = [...document.querySelectorAll('.rk-card')].filter(vis).slice(0, 12); const out = [];
      for (const row of rows) { const els = [...row.querySelectorAll('*')].filter(e => vis(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
        const lines = els.map(e => { const L = []; for (const n of e.childNodes) { if (n.nodeType !== 3 || !n.textContent.trim()) continue; const g = document.createRange(); g.selectNodeContents(n); for (const q of g.getClientRects()) if (q.width > 1) L.push(q); } return { e, L, t: e.textContent.trim().slice(0, 18) }; });
        for (let a = 0; a < lines.length; a++) for (let c = a + 1; c < lines.length; c++) { if (lines[a].e.contains(lines[c].e) || lines[c].e.contains(lines[a].e)) continue; for (const x of lines[a].L) for (const y of lines[c].L) if (Math.min(x.right, y.right) - Math.max(x.left, y.left) > 3 && Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 3) out.push(lines[a].t + ' x ' + lines[c].t); }
      } for (const n of document.querySelectorAll('.rk-name')) if (vis(n) && n.scrollWidth > n.clientWidth + 1) out.push('NOME CORTADO: ' + n.textContent.trim().slice(0, 20)); const u = [...new Set(out.filter(x => !/ x \d+ ganho/.test(x) || /NOME/.test(x)))].slice(0, 4); if (!rows.length && !document.querySelector('.lb-row,.ltv-rk,#ltv-lb-rows *')) u.push('NENHUM .rk-card encontrado (teste cego)'); return u; });
    if (ov.length) { ruins++; console.log(`❌ ${W}x${H} ${aba}/${per} ranking com detalhes abertos: ${ov.join(' | ')}`); }
  }
  await p.close();
}
console.log(ruins ?  `❌ ${ruins} estados com problema` : '✅ celular: legenda da rosca e ranking com detalhes abertos sem problema (4 tamanhos)'); await b.close(); process.exit(ruins ? 1 : 0);
