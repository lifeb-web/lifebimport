// TESTE · ticket medio inteligente (corte bilateral robusto). Roda so a logica (sem navegador): extrai o bloco compartilhado
// do index.html do celular e do telao e confere os dois lados com os mesmos casos.  uso: node t_ticket.mjs
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const AQUI = path.dirname(fileURLToPath(import.meta.url)); let falhas = 0;
const ok = (c, m) => { if (!c) { falhas++; console.log('  FALHOU: ' + m); } };
for (const arq of ['../../index.html', '../index.html']) {
  const src = fs.readFileSync(path.join(AQUI, arq), 'utf8');
  const a = src.indexOf('const TICKET_SIMBOLICO_'), b = src.indexOf('// texto do ⓘ do cartão');
  const ctx = {}; vm.createContext(ctx); vm.runInContext(src.slice(a, b), ctx);
  const tk = vals => { const c = ctx.ticketCorte_(vals); return { c, r: ctx.ticketRobusto_(vals, c) }; };
  const rep = (n, v) => Array(n).fill(v);
  const nome = arq === '../index.html' ? 'telao' : 'celular';
  let x = tk([...rep(9, 5000), 50]);                        ok(x.r.ticket === 5000 && x.r.baixas === 1 && x.r.altas === 0, `${nome}: 1 venda de R$ 50 entre R$ 5.000 (10 vendas) -> ${JSON.stringify(x.r)}`);
  x = tk([...rep(9, 5000), 200000]);                         ok(x.r.ticket === 5000 && x.r.altas === 1 && x.r.baixas === 0, `${nome}: 1 venda de R$ 200.000 entre R$ 5.000 -> ${JSON.stringify(x.r)}`);
  x = tk([5000, 5000, 50]);                                  ok(x.r.ticket === 5000 && x.r.baixas === 1, `${nome}: poucas vendas (3): R$ 50 fora -> ${JSON.stringify(x.r)}`);
  x = tk([5000, 5000, 5000, 5000, 200000]);                  ok(x.r.ticket === 5000 && x.r.altas === 1, `${nome}: 5 vendas, 1 gigante fora -> ${JSON.stringify(x.r)}`);
  x = tk(rep(12, 3000));                                     ok(x.r.ticket === 3000 && x.r.fora === 0, `${nome}: todas iguais, nada fora -> ${JSON.stringify(x.r)}`);
  x = tk([...rep(11, 3000), 3500]);                          ok(x.r.fora === 0 && x.r.ticket === Math.round((3000 * 11 + 3500) / 12), `${nome}: quase iguais (IQR 0) nao corta venda normal -> ${JSON.stringify(x.r)}`);
  x = tk([1000, 9000]);                                      ok(x.r.ticket === 5000 && x.r.fora === 0, `${nome}: 2 vendas = media simples -> ${JSON.stringify(x.r)}`);
  x = tk([7777]);                                            ok(x.r.ticket === 7777, `${nome}: 1 venda -> ${JSON.stringify(x.r)}`);
  x = tk([]);                                                ok(x.r.ticket === 0 && x.r.fora === 0, `${nome}: sem vendas -> ${JSON.stringify(x.r)}`);
  x = tk([0, 0, 0]);                                         ok(x.r.ticket === 0, `${nome}: so zeros -> ${JSON.stringify(x.r)}`);
  x = tk([...rep(9, 4000), 0, 1]);                           ok(x.r.ticket === 4000 && x.r.baixas === 2, `${nome}: zero e simbolico (R$ 1) saem da media e contam como baixas -> ${JSON.stringify(x.r)}`);
  x = tk([...rep(4, 2000), 4000, 6000, 8000, 10000, 30000, 1500]); ok(x.r.altas === 0 && x.r.baixas === 0, `${nome}: distribuicao larga nao corta -> ${JSON.stringify(x.r)}`);
  // reposicao separada de venda nova: cortes independentes
  const nova = [...rep(9, 8000), 150000], repo = [...rep(9, 900), 40];
  const cn = ctx.ticketCorte_(nova), cr = ctx.ticketCorte_(repo);
  ok(ctx.ticketRobusto_(nova, cn).ticket === 8000 && ctx.ticketRobusto_(repo, cr).ticket === 900, `${nome}: reposicao e venda nova com cortes proprios`);
  // corte global: rep com 2 vendas usa o mesmo piso/teto do time
  const time = [...rep(9, 5000), 50, 200000], global = ctx.ticketCorte_(time);
  const repA = ctx.ticketRobusto_([5000, 200000], global);   ok(repA.ticket === 5000 && repA.altas === 1, `${nome}: rep com 2 vendas usa o corte global -> ${JSON.stringify(repA)}`);
  const repB = ctx.ticketRobusto_([200000], global);         ok(repB.ticket === 200000, `${nome}: rep so com atipica mostra a media real -> ${JSON.stringify(repB)}`);
  // listas fora da media
  const won = [...rep(9, 5000), 50, 200000].map((v, i) => ({ id: i, value: v })); const l = ctx.ticketForaListas_(won, global);
  ok(l.baixas.length === 1 && l.baixas[0].value === 50 && l.altas.length === 1 && l.altas[0].value === 200000, `${nome}: listas fora da media`);
  console.log(`  ${nome}: casos de ticket conferidos`);
}
console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTICKET: TODOS OS TESTES PASSARAM'); process.exit(falhas ? 1 : 0);
