// Varredura (03/11/2026): para cada aba x periodo x origem, procura erro de JS, rolagem horizontal, texto sobreposto dentro de cartao e "NaN/undefined/null" na tela.
// Rodar: servidor local na raiz do site, depois  node t_varredura.mjs "telao/index.html?rot=0" 1920 1080   (celular: node t_varredura.mjs index.html 390 844)
// VIEWS=vendas,ltv  limita as abas; BASE=https://projetojlbv.com.br/dash/geral/ testa o site real (SDR e Bia exigem isso: o CORS do worker so aceita o dominio real). Ignora lista com rolagem automatica (recortada).
import { chromium } from 'playwright-core';
const EXE = process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const [,, rota, W, H, saida] = process.argv;
const VIEWS = (process.env.VIEWS || 'vendas,ltv,sdr,ads,ga4,bia').split(',');
const PERIODS = ['today', 'yesterday', 'week', 'month', 'lastmonth', '30d', '60d', '90d', 'total'];
const ORIG = ['both', 'outbound', 'inbound'];
const b = await chromium.launch({ executablePath: EXE });
const p = await (await b.newContext({ viewport: { width: +W, height: +H } })).newPage();
const erros = []; p.on('pageerror', e => erros.push('PAGEERROR ' + e.message.slice(0, 140))); p.on('console', m => { if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource/.test(m.text())) erros.push('console ' + m.text().slice(0, 140)); });
await p.goto((process.env.BASE || 'http://localhost:8799/dash/geral/') + rota, { waitUntil: 'commit' }); await p.waitForTimeout(10000);
const F = () => p.frames().find(x => x !== p.mainFrame()) || p;
const achados = [];
const medir = () => F().evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
  const ativo = [...document.querySelectorAll('.view, [id$="-view"], section')].find(x => vis(x) && x.id) || document.body;
  const out = { hscroll: document.documentElement.scrollWidth > innerWidth + 2 || document.body.scrollWidth > innerWidth + 2, sobrep: [], ruim: [] };
  const txt = document.body.innerText || ''; const m = txt.match(/\b(NaN|undefined|null|\[object Object\])\b/); if (m) out.ruim.push(m[0]);
  // texto sobreposto dentro do mesmo cartao
  for (const card of document.querySelectorAll('.card, .kchip')) {
    if (!vis(card)) continue;
    const cr = card.getBoundingClientRect();
    const els = [...card.querySelectorAll('*')].filter(e => vis(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0) && !e.closest('svg') && !e.closest('canvas'));
    const recortado = e => { const r = e.getBoundingClientRect(); let a = e.parentElement; while (a && a !== card) { const cs = getComputedStyle(a); if (/(hidden|auto|scroll|clip)/.test(cs.overflowY + cs.overflowX)) { const q = a.getBoundingClientRect(); const vw = Math.min(r.right, q.right) - Math.max(r.left, q.left), vh = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top); if (vw < r.width - 1 || vh < r.height - 1) return true; } a = a.parentElement; } return false; };
    const rs = els.filter(e => !recortado(e)).map(e => { const r = e.getBoundingClientRect(); return { e, r, t: e.textContent.trim().slice(0, 24) }; }).filter(x => x.r.bottom > cr.top && x.r.top < cr.bottom && x.r.right > cr.left && x.r.left < cr.right);
    // ignora o que esta recortado por rolagem (lista automatica): so olha elementos totalmente dentro do cartao
    const dentro = rs.filter(x => x.r.top >= cr.top - 1 && x.r.bottom <= cr.bottom + 1 && x.r.left >= cr.left - 1 && x.r.right <= cr.right + 1);
    for (let i = 0; i < dentro.length; i++) for (let j = i + 1; j < dentro.length; j++) {
      const a = dentro[i], c = dentro[j]; if (a.e.contains(c.e) || c.e.contains(a.e)) continue;
      const w = Math.min(a.r.right, c.r.right) - Math.max(a.r.left, c.r.left), h = Math.min(a.r.bottom, c.r.bottom) - Math.max(a.r.top, c.r.top);
      if (w > 3 && h > 3) { const ar = Math.min(a.r.width * a.r.height, c.r.width * c.r.height); if (w * h > 0.25 * ar) out.sobrep.push((card.id || card.className.split(' ')[0]) + ': "' + a.t + '" x "' + c.t + '"'); }
    }
  }
  return out;
});
for (const v of VIEWS) {
  await F().evaluate(v => document.querySelector('.ochip[data-v="' + v + '"]')?.click(), v); await p.waitForTimeout(1500);
  for (const o of ORIG) {
    await F().evaluate(o => document.querySelector('.ochip[data-o="' + o + '"]')?.click(), o); await p.waitForTimeout(500);
    for (const per of PERIODS) {
      const n0 = erros.length;
      await F().evaluate(per => document.querySelector('.pchip[data-p="' + per + '"]')?.click(), per); await p.waitForTimeout(v === 'ga4' || v === 'bia' ? 2800 : 1200);
      const m = await medir();
      const rot = `${v}/${o}/${per}`;
      if (m.hscroll) achados.push(rot + ' ROLAGEM-LATERAL');
      for (const s of [...new Set(m.sobrep)].slice(0, 4)) achados.push(rot + ' SOBREPOSICAO ' + s);
      for (const s of m.ruim) achados.push(rot + ' TEXTO-RUIM ' + s);
      for (const e of erros.slice(n0)) achados.push(rot + ' ' + e);
    }
  }
}
if (!process.env.NO_EXIT) process.on('exit', c => {}); console.log('estados varridos:', VIEWS.length * ORIG.length * PERIODS.length, '| achados:', achados.length);
const agr = {}; for (const a of achados) { const k = a.replace(/^[^ ]+ /, ''); (agr[k] = agr[k] || []).push(a.split(' ')[0]); }
for (const [k, l] of Object.entries(agr).slice(0, 40)) console.log(l.length + 'x', k.slice(0, 150), '| ex:', l.slice(0, 2).join(','));
await b.close(); process.exit(achados.filter(a => !/CORS|Access to fetch/.test(a)).length ? 1 : 0);
