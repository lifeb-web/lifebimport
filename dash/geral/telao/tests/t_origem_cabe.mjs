// A visão "Por origem" (padrão) tem que mostrar TODAS as origens sem cortar, em todos os tamanhos de TV/PC
import { abrir, ir, per, ori } from './telao_lib.mjs';
const T = [[1920,1080],[1366,768],[2560,1440],[1600,900],[1280,720],[3840,2160]];
let falhas = 0;
for (const [W,H] of T) {
  const { b, p, f } = await abrir(W, H);
  await ir(f(), 'vendas'); await per(f(), 'month'); await ori(f(), 'both'); await p.waitForTimeout(2000);
  const r = await f().evaluate(() => {
    const lg = document.querySelector('#origem-card .orig-legend'); if (!lg) return { erro: 'sem legenda' };
    const L = lg.getBoundingClientRect(); const its = [...lg.querySelectorAll('.orig-item')];
    const cortados = its.filter(i => { const r = i.getBoundingClientRect(); return r.top < L.top - 1 || r.bottom > L.bottom + 1; }).length;
    const txtCortado = its.filter(i => [...i.querySelectorAll('.orig-i-name,.orig-i-l2,.orig-i-pc')].some(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).textOverflow === 'ellipsis')).length;
    const fontes = Math.min(...its.flatMap(i => [...i.querySelectorAll('.orig-i-name,.orig-i-l2,.orig-i-pc')].map(e => parseFloat(getComputedStyle(e).fontSize))));
    return { n: its.length, cortados, txtCortado, sc: lg.scrollHeight - lg.clientHeight, fontes };
  });
  const ok = !r.erro && r.cortados === 0 && r.txtCortado === 0 && r.sc <= 1;
  if (!ok) falhas++;
  console.log(`${ok ? 'OK ' : 'FALHOU'} ${W}x${H}`, JSON.stringify(r));
  await b.close();
}
console.log(falhas ? falhas + ' FALHA(S)' : 'TODAS AS ORIGENS CABEM');
process.exit(falhas ? 1 : 0);
