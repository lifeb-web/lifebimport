// util: captura de tela. uso: node shot.mjs <telao|mobile> W H saida.png [view] [clip-selector]
import { abrir, ir, per, ori, mocar, EXE, BASE } from './telao_lib.mjs';
import { chromium } from 'playwright-core';
const [alvo, W, H, out, view = 'vendas', sel] = process.argv.slice(2);
if (alvo === 'telao') {
  const { b, p, f } = await abrir(+W, +H);
  await ir(f(), view); await per(f(), 'month'); await ori(f(), 'both'); await p.waitForTimeout(2500);
  if (sel) { const el = await f().$(sel); await el.screenshot({ path: out }); } else await p.screenshot({ path: out });
  console.log([...new Set(p.errs)].slice(0, 5)); await b.close();
} else {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: +W, height: +H }, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await mocar(p, 'ok'); await p.goto(BASE + 'index.html', { waitUntil: 'commit' }); await p.waitForTimeout(9000);
  if (sel) { const el = await p.$(sel); await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: out }); } else await p.screenshot({ path: out, fullPage: true });
  console.log(errs.slice(0, 5)); await b.close();
}
