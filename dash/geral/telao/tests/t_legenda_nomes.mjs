// 03/11/2026: legenda da rosca (Vendas e LTV, telão) nunca pode cortar nome, sobrepor itens ou vazar do cartão.
// Robert: "por representante dá pra ver nem o nome". Causa: legenda estreita em Vendas + coluna do nome espremida.
// Rodar: servir a raiz do site (python3 -m http.server 8799) e  node t_legenda_nomes.mjs      (usa o dado ao vivo; BASE=https://projetojlbv.com.br/dash/geral/ testa o site real)
import { chromium } from 'playwright-core';
const EXE = process.env.CHROME_BIN || process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const BASE = process.env.BASE || 'http://localhost:8799/dash/geral/';
const FORMATOS = [[1920, 1080], [1366, 768], [1536, 864], [2560, 1440], [1800, 1012]];
const b = await chromium.launch({ executablePath: EXE }); let falhas = 0, estados = 0;
for (const [W, H] of FORMATOS) {
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto(BASE + 'telao/index.html?rot=0&nc=' + Date.now(), { waitUntil: 'commit' }); await p.waitForTimeout(9000);
  const F = () => p.frames().find(x => x !== p.mainFrame()) || p;
  for (const aba of ['vendas', 'ltv']) for (const per of ['today', 'month', '30d', 'total']) for (const vis of ['rep', 'nv', 'ciclo']) {
    await F().evaluate(v => document.querySelector('.pchip[data-p="' + v + '"]')?.click(), per); await p.waitForTimeout(700);
    await F().evaluate(v => document.querySelector('.ochip[data-v="' + v + '"]')?.click(), aba); await p.waitForTimeout(900);
    const ok = await F().evaluate(v => { const e = document.querySelector('.pz-vb[data-pz="' + v + '"]'); if (!e) return false; e.click(); return true; }, vis); if (!ok) continue; await p.waitForTimeout(500);
    const r = await F().evaluate(() => {
      const leg = document.getElementById('origem-legend'); if (!leg || !leg.offsetParent) return null;
      const L = leg.getBoundingClientRect(), its = [...leg.querySelectorAll('.pz-item')], out = { n: its.length, cortados: [], sobrep: [], fora: [] };
      const rs = its.map(i => ({ i, r: i.getBoundingClientRect(), nome: (i.querySelector('.pz-name') || {}).textContent }));
      rs.forEach(x => { const n = x.i.querySelector('.pz-name'); if (n && n.scrollWidth > n.clientWidth + 1) out.cortados.push(x.nome); if (x.r.bottom > L.bottom + 1 || x.r.right > L.right + 1) out.fora.push(x.nome); });
      for (let a = 0; a < rs.length; a++) for (let c = a + 1; c < rs.length; c++) { const A = rs[a].r, C = rs[c].r; if (Math.min(A.right, C.right) - Math.max(A.left, C.left) > 2 && Math.min(A.bottom, C.bottom) - Math.max(A.top, C.top) > 2) out.sobrep.push(rs[a].nome + ' x ' + rs[c].nome); }
      return out;
    });
    if (!r || !r.n) continue; estados++;
    const ruim = r.cortados.length + r.sobrep.length + r.fora.length;
    if (ruim) { falhas++; console.log(`❌ ${W}x${H} ${aba}/${per}/${vis}: cortados=${r.cortados} sobrepostos=${r.sobrep} fora=${r.fora}`); }
  }
  await p.close();
}
console.log(`${falhas ? '❌' : '✅'} legenda da rosca: ${estados} estados verificados, ${falhas} com problema`);
await b.close(); process.exit(falhas ? 1 : 0);
