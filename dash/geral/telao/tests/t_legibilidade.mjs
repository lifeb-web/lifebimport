// TESTE 1 · legibilidade e forma dos cartoes. Falha (exit 1) se, em QUALQUER aba/pagina/formato:
//   rotulo < 12px, texto < 14px, numero KPI < 28px, alvo/icone < 20px (equivalentes a TV 1080p; proporcional nos outros formatos),
//   cartao achatado/cortado/sobreposto/fora da tela/vazio, area vazia grande, rolagem da pagina, texto NaN/undefined.
// uso: node t_legibilidade.mjs [W H]   (sem argumentos roda os 6 formatos)
import { abrir, VIEWS, FORMATOS, AUD, ir, per, ori, pagina, nPaginas, violacoes } from './telao_lib.mjs';
import fs from 'node:fs';
const args = process.argv.slice(2);
const formatos = args.length >= 2 ? [[+args[0], +args[1], args[0] + 'x' + args[1]]] : FORMATOS;
let total = 0; const resumo = [];
for (const [W, H, nome] of formatos) {
  const { b, p, f } = await abrir(W, H);
  for (const v of VIEWS) {
    await ir(f(), v); await per(f(), 'month'); await ori(f(), 'both'); await p.waitForTimeout(v === 'sdr' ? 3500 : 2200);
    const n = await nPaginas(f());
    for (let k = 1; k <= n; k++) {
      await pagina(f(), k); await p.waitForTimeout(700);
      const r = await f().evaluate(AUD);
      const viol = violacoes(r, W, H);
      const esc = Math.min(W / 1920, H / 1080), kk = r.z / esc;
      const eq = x => x >= 99 ? '-' : (x * kk).toFixed(1);
      const asp = r.ratios.length ? Math.min(...r.ratios).toFixed(1) + ' a ' + Math.max(...r.ratios).toFixed(1) : '-';
      resumo.push({ formato: nome, aba: v, pagina: k, menorRotulo: eq(r.minLab), menorCorpo: eq(r.minBody), menorKpi: eq(r.minKpi), razaoCartoes: asp, cartoes: r.nCards, violacoes: viol.length });
      console.log(`${nome.padEnd(14)} ${v.padEnd(6)} p${k}/${n}  rotulo ${eq(r.minLab)}  corpo ${eq(r.minBody)}  kpi ${eq(r.minKpi)}  razao L/A ${asp}  cartoes ${r.nCards}  violacoes ${viol.length}`);
      viol.slice(0, 12).forEach(x => console.log('     - ' + x));
      total += viol.length;
    }
  }
  const js = [...new Set(p.errs)].filter(e => !/Failed to load|ERR_FAILED|HTTP4/.test(e));
  if (js.length) { console.log('  erros JS:', js.slice(0, 5)); total += js.length; }
  await b.close();
}
fs.writeFileSync('res_legibilidade.json', JSON.stringify(resumo, null, 1));
console.log(total ? 'FALHOU: ' + total + ' violacoes' : 'TUDO OK');
process.exit(total ? 1 : 0);
