// TESTE 2 · matriz de filtros: periodo x origem x aba (x pagina). Falha em: erro de JS, NaN/undefined/null/Infinity em texto,
// cartao cortado/sobreposto/fora da tela/vazio, rolagem da pagina. Inclui Mes especifico e Personalizado, e os modos de erro de rede.
// uso: node t_matriz.mjs [W H] [modo: ok|err500|rede]
import { abrir, VIEWS, AUD, ir, per, ori, pagina, nPaginas, violacoes } from './telao_lib.mjs';
const W = +(process.argv[2] || 1920), H = +(process.argv[3] || 1080), modo = process.argv[4] || 'ok';
const PERIODOS = ['today', 'yesterday', 'week', 'month', 'prev_month', '30d', '60d', '90d', 'total', 'month_pick', 'custom'];
const ORIGENS = ['outbound', 'inbound', 'both'];
const { b, p, f } = await abrir(W, H, { mock: modo });
let falhas = 0, combos = 0; const vistos = new Map();
async function aplicaPeriodo(pr) {
  if (pr === 'month_pick') { await per(f(), 'month_pick'); await p.waitForTimeout(250); await f().evaluate(() => { const bs = [...document.querySelectorAll('#month-pick-panel .mp-month-btn:not(.mp-future)')]; const alvo = bs.find(x => !x.classList.contains('mp-selected') && !x.classList.contains('mp-current')) || bs[0]; if (alvo) alvo.click(); }); await p.waitForTimeout(250); return; }
  if (pr === 'custom') { await per(f(), 'custom'); await p.waitForTimeout(250); await f().evaluate(() => { const ds = [...document.querySelectorAll('#custom-panel .cp-day:not(.cp-empty):not(.cp-future)')]; if (ds.length > 6) { ds[1].click(); ds[5].click(); } }); await p.waitForTimeout(250); return; }
  await per(f(), pr);
}
for (const v of VIEWS) for (const pr of PERIODOS) for (const o of ORIGENS) {
  await ir(f(), v); await aplicaPeriodo(pr); await ori(f(), o); await p.waitForTimeout(v === 'sdr' ? 1500 : 800);
  const n = await nPaginas(f());
  for (let k = 1; k <= n; k++) {
    await pagina(f(), k); await p.waitForTimeout(250);
    const r = await f().evaluate(AUD); combos++;
    // na matriz so conta o que e logica/dado: NaN, corte, sobreposicao, fora da tela, vazio, rolagem; fonte e tratada no teste 1
    const viol = violacoes(r, W, H).filter(x => !/^(rotulo|corpo|numero KPI|alvo|icone|cartao achatado|area vazia)/.test(x));
    if (viol.length) { falhas++; const key = v + ' ' + viol[0].replace(/\d+/g, 'N'); if (!vistos.has(key)) { vistos.set(key, []); console.log(`FALHA ${v} p${k} periodo=${pr} origem=${o}: ${viol.slice(0, 3).join(' | ')}`); } vistos.get(key).push(pr + '/' + o); }
  }
}
const js = [...new Set(p.errs)].filter(e => !/Failed to load|ERR_FAILED|HTTP4|HTTP5|net::|script\.google\.com/.test(e));
if (js.length) { falhas += js.length; console.log('erros JS:', js.slice(0, 8)); }
console.log(`matriz ${W}x${H} modo ${modo}: ${combos} combinacoes, ${falhas ? 'FALHAS ' + falhas : 'sem NaN, sem erro de JS, sem corte'}`);
await b.close(); process.exit(falhas ? 1 : 0);
