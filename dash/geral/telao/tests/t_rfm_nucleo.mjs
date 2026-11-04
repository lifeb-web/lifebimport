// TESTE do nucleo da aba RFM (sem navegador). Uso: node t_rfm_nucleo.mjs            (fixture sintetico)
//                                                    DASH_REAL=1 node t_rfm_nucleo.mjs  (+ dados reais lidos da ponte, SOMENTE LEITURA, e backtest)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixture, hoje, addDias } from './rfm_fixture.mjs';
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const R = createRequire(import.meta.url)(path.join(AQUI, '..', '..', 'rfm.js'));
const C = R._core;
let falhas = 0, ok = 0;
const t = (cond, msg) => { if (cond) ok++; else { falhas++; console.log('  FALHOU: ' + msg); } };
const perto = (a, b, e = 0.01) => Math.abs(a - b) <= e;

// ---------- 1) regras de data ----------
t(C.dataEvento({ data_real_evento: '2026-05-10', end_time: '2026-06-01T00:00:00.000Z', won_at: '2026-09-09T10:00:00Z' }) === '2026-05-10', 'data_real_evento manda sobre end_time e won_at');
t(C.dataEvento({ end_time: '2026-06-01T00:00:00.000Z', won_at: '2026-09-09T10:00:00Z' }) === '2026-06-01', 'end_time sem hora vale como dia');
t(C.dataEvento({ end_time: '2026-06-02T01:30:00.000Z' }) === '2026-06-01', 'end_time com hora converte para Brasilia (01:30Z = 22:30 do dia anterior)');
t(C.dataEvento({ won_at: '2026-09-09T10:00:00Z' }) === null, 'won_at NUNCA e usado');
// ---------- 2) quintis e grade ----------
const q = C.quintil([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], true); t(q.join() === '1,1,2,2,3,3,4,4,5,5', 'quintil 10 valores: ' + q.join());
const qe = C.quintil([1, 1, 1, 1, 1], true); t(new Set(qe).size === 1, 'empate total: todos a mesma nota');
const qr = C.quintil([0.1, 0.5, 1, 2, 3], false); t(qr.join() === '5,4,3,2,1', 'razao menor = nota maior: ' + qr.join());
for (let r = 1; r <= 5; r++) for (let fm = 1; fm <= 5; fm++) t(C.SEGS.some(s => s.k === C.GRADE[r][fm - 1]), 'grade R' + r + ' FM' + fm + ' aponta segmento existente');
t(C.SEGS.length === 11, '11 segmentos');
t(C.segmentoDe(5, 1, 1, 1) === 'novos' && C.segmentoDe(4, 1, 5, 1) === 'novos', 'uma compra recente = Novos');
t(C.segmentoDe(1, 1, 5, 1) === 'naoperder', 'valor maximo muito atrasado = Nao pode perder');
t(C.segmentoDe(5, 5, 5, 6) === 'campeoes' && C.segmentoDe(1, 1, 1, 1) === 'perdidos' && C.segmentoDe(1, 5, 3, 5) === 'naoperder', 'extremos da grade');

// ---------- 3) invariantes (qualquer base) ----------
function invariantes(nome, deals, esp) {
  const T = hoje(), res = C.computeRfm(deals, { asOf: T, origem: 'both' }), L = res.clientes;
  // independente: soma dos ganhos validos nos 3 funis ate hoje, pela data do evento
  let pedidos = 0, receita = 0;
  deals.forEach(d => { if (d.status === 'won' && ['890331', '907387', '909368'].includes(String(d.funnel_id)) && Number(d.value) >= 10) { const dt = C.dataEvento(d); if (dt && dt <= T) { pedidos++; receita += Number(d.value); } } });
  t(L.reduce((s, c) => s + c.n, 0) === pedidos, nome + ': pedidos da carteira (' + L.reduce((s, c) => s + c.n, 0) + ') = ganhos validos nos negocios (' + pedidos + ')');
  t(perto(L.reduce((s, c) => s + c.valor, 0), receita), nome + ': receita da carteira = soma dos ganhos validos (' + receita.toFixed(2) + ')');
  const ag = C.agregar(L, null);
  t(Object.values(ag.bySeg).reduce((s, b) => s + b.n, 0) === L.length, nome + ': soma dos segmentos = clientes (' + L.length + ')');
  t(Object.values(ag.matriz).reduce((s, m) => s + m.n, 0) === L.length, nome + ': soma das celulas da matriz = clientes');
  t(perto(Object.values(ag.matriz).reduce((s, m) => s + m.valor, 0), ag.receita), nome + ': R$ das celulas = receita');
  t(perto(Object.values(ag.bySeg).reduce((s, b) => s + b.valor, 0), ag.receita), nome + ': R$ dos segmentos = receita');
  t(L.every(c => c.R >= 1 && c.R <= 5 && c.F >= 1 && c.F <= 5 && c.M >= 1 && c.M <= 5 && C.SEGS.some(s => s.k === c.seg)), nome + ': notas 1..5 e segmento valido em todos');
  t(L.every(c => c.n >= 1 && c.ultima <= T && c.primeira <= c.ultima && c.dias >= 0 && isFinite(c.razao)), nome + ': datas e razoes coerentes');
  t(L.every(c => c.compras.every(x => x.valor >= 10)), nome + ': nenhuma compra < R$ 10');
  t(L.every(c => c.ciclo >= 30 && c.ciclo <= 180), nome + ': ciclo sempre entre 30 e 180');
  // monotonia: razao menor nunca tem nota R menor
  const ord = L.slice().sort((a, b) => a.razao - b.razao); let mono = true; for (let i = 1; i < ord.length; i++) if (ord[i].R > ord[i - 1].R) mono = false;
  t(mono, nome + ': R cai (ou fica) conforme a razao sobe');
  const ord2 = L.slice().sort((a, b) => a.valor - b.valor); mono = true; for (let i = 1; i < ord2.length; i++) if (ord2[i].M < ord2[i - 1].M) mono = false;
  t(mono, nome + ': M sobe com o valor');
  t(new Set(L.map(c => c.id)).size === L.length, nome + ': nenhum cliente duplicado');
  // ordem das linhas nao muda o resultado
  const emb = deals.slice().reverse(); const r2 = C.computeRfm(emb, { asOf: T, origem: 'both' });
  t(r2.clientes.length === L.length && perto(r2.clientes.reduce((s, c) => s + c.valor, 0), receita), nome + ': ordem das linhas nao muda a conta');
  const mp = {}; L.forEach(c => mp[c.id] = c.seg); t(r2.clientes.every(c => mp[c.id] === c.seg), nome + ': segmentos iguais com linhas embaralhadas');
  // filtros de origem fecham
  const ob = C.computeRfm(deals, { asOf: T, origem: 'outbound' }).clientes.length, ib = C.computeRfm(deals, { asOf: T, origem: 'inbound' }).clientes.length;
  t(ob + ib === L.length, nome + ': Outbound (' + ob + ') + Inbound (' + ib + ') = Ambos (' + L.length + ')');
  // nada de SDR/Yanmei
  const idsOk = new Set(deals.filter(d => ['890331', '907387', '909368'].includes(String(d.funnel_id))).map(d => String(d.id)));
  t(L.every(c => c.compras.every(x => idsOk.has(x.id))), nome + ': so negocios dos funis Arena/Pos-venda/Reativacao');
  // asOf no passado: nada depois da data
  const velho = C.retrato(deals, addDias(T, -60), 'both'); t(velho.lista.every(c => c.ultima <= addDias(T, -60)), nome + ': retrato antigo nao enxerga o futuro');
  // movimento fecha
  const m = res.mov; if (!m.semBase) t(m.novos.length + m.subiram.length + m.desceram.length + m.iguais.length === L.length, nome + ': movimento fecha (novos+subiram+desceram+iguais = clientes)');
  // prova fecha
  const p = res.prova; t(Object.values(p.porSeg).reduce((s, b) => s + b.n, 0) === p.n, nome + ': prova: segmentos somam a carteira antiga');
  t(p.tot.rec <= p.tot.n, nome + ': prova: recompra <= clientes');
  return res;
}
const fx = fixture();
const rs = invariantes('fixture', fx.deals, fx.esperado);
t(rs.clientes.length === fx.esperado.clientes, 'fixture: clientes = ' + fx.esperado.clientes + ' (construidos): achou ' + rs.clientes.length);
t(perto(rs.clientes.reduce((s, c) => s + c.valor, 0), fx.esperado.receita), 'fixture: receita = construida (' + fx.esperado.receita.toFixed(2) + ')');
const rO = C.computeRfm(fx.deals, { asOf: hoje(), origem: 'inbound' }).clientes.length, rB = C.computeRfm(fx.deals, { asOf: hoje(), origem: 'outbound' }).clientes.length;
t(rO === fx.esperado.porOrigem.inbound && rB === fx.esperado.porOrigem.outbound, 'fixture: origens ' + rO + '/' + rB + ' = ' + fx.esperado.porOrigem.inbound + '/' + fx.esperado.porOrigem.outbound + ' (SuperAgos conta como Outbound)');
const por = {}; rs.clientes.forEach(c => por[c.owner] = (por[c.owner] || 0) + 1);
t(Object.keys(fx.esperado.porOwner).every(k => por[k] === fx.esperado.porOwner[k]), 'fixture: clientes por responsavel = construidos');
t(rs.clientes.some(c => c.n >= 4) && rs.clientes.some(c => c.compras.some(x => x.funil === '909368')), 'fixture: tem cadeia longa e reativacao ligada ao cliente (nao virou cliente novo)');
// vazio e lixo
t(C.computeRfm([], { asOf: hoje() }).clientes.length === 0, 'base vazia: 0 clientes sem erro');
t(C.computeRfm([{ id: 1, funnel_id: '890331', status: 'won', value: 'abc' }, { id: 2 }, null && 0].filter(Boolean), { asOf: hoje() }).clientes.length === 0, 'linhas lixo: ignoradas sem erro');

// ---------- 4) dados REAIS (somente leitura) + backtest ----------
if (process.env.DASH_REAL) {
  const html = fs.readFileSync(path.join(AQUI, '..', '..', 'index.html'), 'utf8');
  const key = /SUPABASE_ANON_KEY\s*=\s*'([^']+)'/.exec(html)[1], base = /SUPABASE_URL\s*=\s*'([^']+)'/.exec(html)[1];
  const r = await fetch(base + '/rest/v1/dash_geral_deals?select=*', { headers: { apikey: key, Authorization: 'Bearer ' + key } });
  const real = await r.json();
  console.log('\nDADOS REAIS (leitura): ' + real.length + ' negocios na tabela');
  const res = invariantes('real', real);
  const L = res.clientes, ag = C.agregar(L, null);
  console.log('  clientes: ' + L.length + ' | pedidos: ' + L.reduce((s, c) => s + c.n, 0) + ' | receita: R$ ' + Math.round(ag.receita) + ' | ciclo da carteira: ' + res.cicloCarteira + ' d | com recompra: ' + ag.nCiclo);
  console.log('  distribuicao: ' + C.SEGS.map(s => s.n + '=' + ag.bySeg[s.k].n).join(' | '));
  console.log('  receita em risco: R$ ' + Math.round(ag.risco.valor) + ' (' + ag.risco.n + ' clientes)');
  const dist = {}; L.forEach(c => dist[c.n] = (dist[c.n] || 0) + 1); console.log('  clientes por nº de compras: ' + JSON.stringify(dist));
  // elos: reposicao/reativacao ligadas?
  const solto = L.filter(c => !c.compras.some(x => x.funil === '890331')).length; console.log('  clientes sem negocio Arena na cadeia: ' + solto);
  const nomesDup = {}; L.forEach(c => nomesDup[c.nome.toLowerCase()] = (nomesDup[c.nome.toLowerCase()] || 0) + 1); console.log('  nomes repetidos (podem ser lojas diferentes): ' + Object.entries(nomesDup).filter(([, v]) => v > 1).map(([k, v]) => k + 'x' + v).join(', '));
  console.log('\nBACKTEST (carteira de N dias atras x quem comprou de novo desde entao; so Agendor, amostra pequena):');
  for (const dias of [60, 90, 120]) {
    const p = C.prova(real, hoje(), 'both', dias);
    const grp = (f) => { const a = p.linhas.filter(x => f(x.antes)); return { n: a.length, rec: a.filter(x => x.rec).length }; };
    const pct = g => g.n ? Math.round(g.rec / g.n * 100) + '% (' + g.rec + '/' + g.n + ')' : 'sem clientes';
    const bom = grp(c => ['campeoes', 'leais', 'potenciais', 'novos'].includes(c.seg)), meio = grp(c => ['promissores', 'atencao', 'dormir'].includes(c.seg)), ruim = grp(c => ['risco', 'naoperder', 'hibernando', 'perdidos'].includes(c.seg));
    const med = [...p.linhas.map(x => x.antes.dias)].sort((a, b) => a - b)[Math.floor(p.linhas.length / 2)];
    const crua1 = grp(c => c.dias <= med), crua2 = grp(c => c.dias > med);
    const r15 = grp(c => c.R >= 4), r12 = grp(c => c.R <= 2);
    console.log('  ' + dias + 'd (retrato ' + p.de + ', ' + p.n + ' clientes, recompraram ' + p.tot.rec + ' = ' + Math.round(p.tot.rec / Math.max(1, p.n) * 100) + '%)');
    console.log('     grupo alto (Campeoes/Leais/Potenciais/Novos): ' + pct(bom) + ' | meio: ' + pct(meio) + ' | baixo (Em risco/Nao pode perder/Hibernando/Perdidos): ' + pct(ruim));
    console.log('     R relativo: R4-5 ' + pct(r15) + ' x R1-2 ' + pct(r12) + ' | dias crus: ate ' + med + 'd ' + pct(crua1) + ' x acima ' + pct(crua2));
    console.log('     por segmento: ' + C.SEGS.filter(s => p.porSeg[s.k].n).map(s => s.n + ' ' + p.porSeg[s.k].rec + '/' + p.porSeg[s.k].n).join(', '));
  }
}
console.log('\nt_rfm_nucleo: ' + ok + ' ok, ' + falhas + ' falhas');
process.exit(falhas ? 1 : 0);
