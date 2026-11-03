// 03/11/2026: troca RAPIDA de periodo na aba GA4 (Robert: "mudei o periodo e tive que repetir varias vezes").
// Causa: o pedido novo era descartado se ja havia outro em voo, e a tela ficava no periodo antigo. Aqui o 1o pedido e atrasado de proposito.
// Passa se, no fim, o numero na tela for o do ULTIMO periodo clicado. Rodar: servidor local (python3 -m http.server 8799 na raiz do site) e
//   node t_ga4_filtros.mjs            (usa a rede: o worker ga4-dash-cache real; so atrasa as respostas)
import { chromium } from 'playwright-core';
const EXE = process.env.CHROME_BIN || process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const BASE = process.env.DASH_BASE || 'http://localhost:8799/dash/geral/';
const b = await chromium.launch({ executablePath: EXE });
const p = await (await b.newContext({ viewport: { width: 1440, height: 810 } })).newPage();
const servidor = {}; const ATRASO = { mes: 5000, semana: 3000, hoje: 150, '30d': 200 };
await p.route(/ga4-dash-cache.*\/api\/bundle/, async r => {
  const per = new URL(r.request().url()).searchParams.get('periodo') || 'custom';
  const res = await r.fetch(); const txt = await res.text();
  try { const j = JSON.parse(txt); const s = j.bundle && j.bundle.summary; servidor[per] = s && s.rows && s.rows[0] && s.rows[0].metricValues ? s.rows[0].metricValues[0].value : null; } catch (e) {}
  await new Promise(s => setTimeout(s, ATRASO[per] || 0)); await r.fulfill({ response: res, body: txt });
});
await p.goto(BASE + 'telao/index.html?rot=0', { waitUntil: 'commit' }); await p.waitForTimeout(9000);
const F = () => p.frames().find(x => x !== p.mainFrame()) || p;
await F().evaluate(() => document.querySelector('.ochip[data-v="ga4"]').click()); await p.waitForTimeout(4000);
const clicar = per => F().evaluate(per => document.querySelector('.pchip[data-p="' + per + '"]').click(), per);
const tela = async () => (await F().evaluate(() => document.getElementById('ga4-hero-val').textContent)).replace(/\D/g, '');
let falhas = 0; const ok = (nome, cond, det) => { console.log((cond ? '✅ ' : '❌ ') + nome + ' ' + det); if (!cond) falhas++; };
await clicar('month'); await p.waitForTimeout(500); await clicar('today'); await p.waitForTimeout(9000);
ok('mes -> hoje rapido mostra HOJE', (await tela()) === String(servidor.hoje), `tela=${await tela()} servidor.hoje=${servidor.hoje}`);
await clicar('week'); await p.waitForTimeout(400); await clicar('30d'); await p.waitForTimeout(8000);
ok('semana -> 30 dias rapido mostra 30 DIAS', (await tela()) === String(servidor['30d']), `tela=${await tela()} servidor.30d=${servidor['30d']}`);
await clicar('week'); await p.waitForTimeout(300); await clicar('30d'); await p.waitForTimeout(300); await clicar('today'); await p.waitForTimeout(9000);
ok('3 trocas seguidas terminam em HOJE', (await tela()) === String(servidor.hoje), `tela=${await tela()} servidor.hoje=${servidor.hoje}`);
ok('a tela nao fica escurecida (carregando) depois', !(await F().evaluate(() => document.getElementById('ga4-main').classList.contains('ga4-atualizando'))), '');
await b.close(); process.exit(falhas ? 1 : 0);
