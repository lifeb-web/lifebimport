// lista numeros "grandes" (>= 15px no palco) que NAO sao KPI hero: candidatos a numero de apoio grande demais
import { abrir, VIEWS, ir, per, ori, pagina, nPaginas } from './telao_lib.mjs';
const { b, p, f } = await abrir(1920, 1080);
const KPI = /(kc-val|hero-val|ac-val|s2-kv|sc-num|rv-hero-val|hero-big)/;
for (const v of VIEWS) {
  await ir(f(), v); await per(f(), 'month'); await ori(f(), 'both'); await p.waitForTimeout(2500);
  const n = await nPaginas(f());
  for (let k = 1; k <= n; k++) {
    await pagina(f(), k); await p.waitForTimeout(500);
    const r = await f().evaluate((src) => { const KPI = new RegExp(src); const z = (() => { let m = 1; try { const pr = window.parent.document.getElementById('palco'); const t = (pr.style.transform||'').match(/scale\(([\d.]+)\)/); if (t) m = +t[1]; } catch (e) {} return m; })(); const out = {};
      document.querySelectorAll('body *').forEach(e => { if (e.closest('svg,.expand-overlay,#modal-overlay,header')) return; const r = e.getBoundingClientRect(); if (!r.width || !r.height) return; if (!Array.from(e.childNodes).some(n => n.nodeType === 3 && /\d/.test(n.textContent))) return; const cls = (e.className||'') + ' ' + e.id; if (KPI.test(cls)) return; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs >= 15) { const k = (e.className||e.tagName) + ' ' + fs; out[k] = (out[k]||0) + 1; } }); return { z, out }; }, KPI.source);
    console.log(v, 'p' + k, 'z=' + r.z.toFixed(2), JSON.stringify(r.out));
  }
}
await b.close();
