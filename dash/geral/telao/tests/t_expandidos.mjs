// 03/11/2026: cartões EXPANDIDOS (⤢) de todas as abas do telão: nada sobreposto, nada cortado sem querer, sem rolagem lateral, sem modal vazio, sem erro de JS.
// Robert: "em cards expansíveis as infos ficaram sobrepostas ou não funcionam bem". Rodar: servir a raiz do site (python3 -m http.server 8799) e node t_expandidos.mjs
// Variáveis: BASE (site real), FORMATOS="1920x1080,1366x768", PERIODOS="month,total", ABAS="vendas,ltv,sdr,ads,ga4,bia"
import { chromium } from 'playwright-core';
const EXE = process.env.CHROME_BIN || process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const BASE = process.env.BASE || 'http://localhost:8799/dash/geral/';
const FORMATOS = (process.env.FORMATOS || '1920x1080,1366x768').split(',').map(x => x.split('x').map(Number));
const PERIODOS = (process.env.PERIODOS || 'month,total').split(','); const ABAS = (process.env.ABAS || 'vendas,ltv,sdr,ads,ga4,bia').split(',');
const b = await chromium.launch({ executablePath: EXE }); let cards = 0, falhas = 0; const erros = [];
const medir = () => {
  const body = document.getElementById('expandModalBody'); if (!body) return { erro: 'sem #expandModalBody' };
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const B = body.getBoundingClientRect(), out = { texto: (body.innerText || '').trim().length, hscroll: body.scrollWidth > body.clientWidth + 2, sobrep: [], cortados: [], semTamanho: 0 };
  const recortado = e => { const r = e.getBoundingClientRect(); let a = e.parentElement; while (a && a !== body) { const cs = getComputedStyle(a); if (/(hidden|auto|scroll|clip)/.test(cs.overflowY + cs.overflowX)) { const q = a.getBoundingClientRect(); if (Math.min(r.right, q.right) - Math.max(r.left, q.left) < r.width - 1 || Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top) < r.height - 1) return true; } a = a.parentElement; } return false; };
  const els = [...body.querySelectorAll('*')].filter(e => vis(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && !e.closest('svg') && !e.closest('canvas') && !recortado(e));
  const textoRect = e => { const L = []; for (const n of e.childNodes) { if (n.nodeType !== 3 || !n.textContent.trim()) continue; const g = document.createRange(); g.selectNodeContents(n); for (const q of g.getClientRects()) if (q.width > 1 && q.height > 1) L.push(q); } return { linhas: L, width: L.length }; };  // uma caixa por LINHA de texto (texto quebrado em 2 linhas não vira falso positivo)
  const rs = els.map(e => ({ e, r: textoRect(e), t: e.textContent.trim().slice(0, 22) })).filter(x => x.r.width > 0);
  for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) { const A = rs[i], C = rs[j]; if (A.e.contains(C.e) || C.e.contains(A.e)) continue; let bate = false; for (const a1 of A.r.linhas) { for (const c1 of C.r.linhas) { const w = Math.min(a1.right, c1.right) - Math.max(a1.left, c1.left), h = Math.min(a1.bottom, c1.bottom) - Math.max(a1.top, c1.top); if (w > 3 && h > 3 && w * h > 0.25 * Math.min(a1.width * a1.height, c1.width * c1.height)) { bate = true; break; } } if (bate) break; } if (bate) out.sobrep.push(A.t + ' x ' + C.t); }
  for (const e of els) { const cs = getComputedStyle(e); if (cs.textOverflow === 'ellipsis' && /(hidden|clip)/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1) out.cortados.push(e.textContent.trim().slice(0, 28)); }
  out.semTamanho = [...body.querySelectorAll('canvas,img.xp-img')].filter(c => c.getBoundingClientRect().width < 4 || c.getBoundingClientRect().height < 4).length;
  return out;
};
for (const [W, H] of FORMATOS) {
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message.slice(0, 120)));
  await p.goto(BASE + 'telao/index.html?rot=0&nc=' + Date.now(), { waitUntil: 'commit' }); await p.waitForTimeout(9000);
  const F = () => p.frames().find(x => x !== p.mainFrame()) || p;
  for (const per of PERIODOS) for (const aba of ABAS) {
    await F().evaluate(v => document.querySelector('.pchip[data-p="' + v + '"]')?.click(), per); await p.waitForTimeout(800);
    await F().evaluate(v => document.querySelector('.ochip[data-v="' + v + '"]')?.click(), aba); await p.waitForTimeout(aba === 'ga4' || aba === 'bia' ? 3500 : 1500);
    const cartoes = () => [...document.querySelectorAll('.card,.s2-card')].filter(c => c.offsetParent && c.getBoundingClientRect().width > 0 && !c.closest('.expand-overlay') && (c.querySelector('.expand-btn,.xp-btn') || c.querySelector('.card-hd[data-x],.s2-ch[data-x]')));
    const n = await F().evaluate(`(${cartoes.toString()})().length`);
    for (let i = 0; i < n; i++) {
      const info = await F().evaluate(`(${((i, listar) => { const c = listar()[i]; if (!c) return null; const h = c.querySelector('.card-hd[data-x],.s2-ch[data-x],.card-hd,.s2-ch'); const t = ((h || c).textContent || '?').replace(/\s+/g, ' ').trim().slice(0, 40); const b = c.querySelector('.expand-btn,.xp-btn'); if (b && b.offsetParent) b.click(); else (c.querySelector('.card-hd[data-x],.s2-ch[data-x]') || c).click(); return t; }).toString()})(${i}, ${cartoes.toString()})`);
      if (info == null) continue; await p.waitForTimeout(900); cards++;
      const r = await F().evaluate(medir); const grafico = await F().evaluate(() => [...document.querySelectorAll('#expandModalBody canvas,#expandModalBody img.xp-img,#expandModalBody svg')].some(c => c.getBoundingClientRect().width > 20)); if (r.texto < 5 && grafico) r.texto = 99; const ruim = r.erro || r.hscroll || r.sobrep.length || r.cortados.length || r.semTamanho || r.texto < 5;
      if (ruim) { falhas++; erros.push(`${W}x${H} ${aba}/${per} · "${info}": ${r.erro || ''}${r.hscroll ? ' ROLAGEM-LATERAL' : ''}${r.texto < 5 ? ' VAZIO' : ''}${r.sobrep.length ? ' SOBREPOSTO[' + [...new Set(r.sobrep)].slice(0, 3).join(' | ') + ']' : ''}${r.cortados.length ? ' CORTADO[' + [...new Set(r.cortados)].slice(0, 4).join(' | ') + ']' : ''}${r.semTamanho ? ' GRAFICO-SEM-TAMANHO' : ''}`); }
      await F().evaluate(() => { const c = document.getElementById('expandModalClose'); if (c) c.click(); }); await p.waitForTimeout(250);
    }
  }
  if (pe.length) erros.push(`${W}x${H} ERROS DE JS: ${[...new Set(pe)].slice(0, 3).join(' | ')}`);
  await p.close();
}
const agr = new Map(); for (const e of erros) { const k = e.replace(/^\d+x\d+ /, ''); agr.set(k, (agr.get(k) || 0) + 1); }
for (const [k, n] of agr) console.log(`${n}x ${k}`);
console.log(`${falhas || erros.length ? '❌' : '✅'} cartões expandidos: ${cards} abertos, ${falhas} com problema${erros.length > falhas ? ', mais erros de JS' : ''}`);
await b.close(); process.exit(falhas || erros.length ? 1 : 0);
