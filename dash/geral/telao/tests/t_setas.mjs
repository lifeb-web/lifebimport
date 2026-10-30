// Setas com nome na rosca (Por origem): existem, não se sobrepõem entre si nem ao anel, e não saem do cartão
import { abrir, ir, per, ori } from './telao_lib.mjs';
const T = [[1920,1080],[1366,768],[2560,1440],[1600,900],[3840,2160]];
let falhas = 0;
for (const [W,H] of T) {
  const { b, p, f } = await abrir(W, H);
  await ir(f(), 'vendas'); await per(f(), 'month'); await ori(f(), 'both'); await p.waitForTimeout(2000);
  const r = await f().evaluate(() => {
    const card = document.querySelector('#origem-card').getBoundingClientRect();
    const tx = [...document.querySelectorAll('#origem-card .orig-lb text')].map(t => t.getBoundingClientRect());
    let sobre = 0; for (let i = 0; i < tx.length; i++) for (let j = i + 1; j < tx.length; j++) { const a = tx[i], c = tx[j]; if (a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom) sobre++; }
    const fora = tx.filter(a => a.left < card.left || a.right > card.right || a.top < card.top || a.bottom > card.bottom).length;
    return { setas: document.querySelectorAll('#origem-card .orig-lb').length, textos: tx.length, sobre, fora };
  });
  const ok = r.setas >= 4 && r.sobre === 0 && r.fora === 0; if (!ok) falhas++;
  console.log(`${ok ? 'OK ' : 'FALHOU'} ${W}x${H}`, JSON.stringify(r)); await b.close();
}
console.log(falhas ? falhas + ' FALHA(S)' : 'SETAS OK'); process.exit(falhas ? 1 : 0);
