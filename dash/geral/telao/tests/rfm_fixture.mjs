// Fixture SINTETICO da carteira (nenhum dado real). Deterministico. Devolve { deals, esperado } onde `esperado` e calculado na CONSTRUCAO
// (nao pelo codigo da aba), para os testes conferirem a conta de forma independente.
export function hoje() { return new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10); }
export const addDias = (ymd, n) => new Date(Date.parse(ymd + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
function prng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const NOMES = ['Drogaria Aurora', 'Farma Vida', 'SM Preço Bom', 'Drogaria São José', 'Supermercado Real', 'Farmácia Popular do Zé', 'Drogaria Ideal', 'Mercadinho Central', 'Droga Norte', 'Farmácia Saúde Total',
  'Drogaria Nome Muito Comprido Para Testar Quebra De Linha Em Telas Pequenas Ltda', 'Farmácia <b>Tag</b> & "Aspas"', 'Atacadão Árvore', 'Drogaria Ação', 'Pharma Center', 'Rede Bem Estar'];
const REPS = ['976406', '977487', '977488', '977499', '977506', '983372', '987866', '993185'];
export function fixture(opts = {}) {
  const N = opts.n || 64, rnd = prng(opts.seed || 42), T = hoje();
  const deals = []; let id = 50000000;
  const exp = { clientes: 0, receita: 0, pedidos: 0, compras: 0, porOrigem: { inbound: 0, outbound: 0 }, porOwner: {}, celulas: {}, segs: {} };
  // regra INDEPENDENTE do codigo da aba (copia da tabela do Robert): segmento da celula (F,R)
  const faixa = d => d <= 60 ? 5 : d <= 90 ? 4 : d <= 120 ? 3 : d <= 150 ? 2 : 1;
  const TAB = { 5: ['naoperder', 'naoperder', 'leais', 'leais', 'campeoes'], 4: ['risco', 'risco', 'leais', 'leais', 'campeoes'], 3: ['risco', 'risco', 'atencao', 'potenciais', 'potenciais'], 2: ['perdidos', 'hibernando', 'dormir', 'potenciais', 'potenciais'], 1: ['perdidos', 'hibernando', 'dormir', 'promissores', 'novos'] };
  const conta = (nCompras, ultimaOff, valor) => { const F = Math.min(5, nCompras), R = faixa(ultimaOff), k = F + '|' + R, sg = TAB[F][R - 1]; exp.celulas[k] = exp.celulas[k] || { n: 0, valor: 0 }; exp.celulas[k].n++; exp.celulas[k].valor += valor; exp.segs[sg] = (exp.segs[sg] || 0) + 1; };
  const synced = opts.synced || new Date().toISOString();
  const mk = o => Object.assign({ id: ++id, title: '', value: 0, stage_id: '3771722', stage_name: 'x', funnel_id: '890331', owner_id: 976406, owner_name: 'x', origin: 'outbound', status: 'won', created_at: '2026-01-01T12:00:00.000Z', updated_at: synced, won_at: null, end_time: null, lost_at: null, closed_at: null, description: null, data_real_evento: null, stale: 0, frozen: 0, synced_at: synced, lost_reason_name: null, campanha_ads: null, conjunto_ads: null, anuncio_ads: null, origem_especial: null }, o);
  for (let i = 0; i < N; i++) {
    const nome = (i < NOMES.length ? NOMES[i] : 'Cliente ' + String.fromCharCode(65 + (i % 26)) + ' ' + i) + (i >= NOMES.length ? '' : '');
    const nCompras = i % 9 === 0 ? 1 + Math.floor(rnd() * 6) : (rnd() < 0.7 ? 1 : 2 + Math.floor(rnd() * 3));
    const owner = i % 11 === 5 ? '976405' : i % 13 === 7 ? '973972' : i % 17 === 3 ? '111111' : REPS[i % REPS.length];
    const origem = i % 3 === 0 ? 'inbound' : 'outbound', esp = i % 10 === 4 ? 'superagos' : null;
    const origemEf = esp ? 'outbound' : origem;
    const ultimaOff = Math.floor(3 + rnd() * 260), ciclo = 25 + Math.floor(rnd() * 95);
    const datas = []; for (let k = 0; k < nCompras; k++) datas.unshift(addDias(T, -(ultimaOff + k * ciclo)));
    let prev = null, soma = 0, validas = 0;
    datas.forEach((d, k) => {
      const valor = Math.round((300 + rnd() * rnd() * 9000) * 100) / 100;
      const funil = k === 0 ? '890331' : (k === 2 && i % 4 === 0 ? '909368' : '907387');
      const d1 = mk({ title: k === 0 ? nome : funil === '909368' ? nome + ' — Reativação 75+' : nome + ' — Reposição #' + k, value: valor, funnel_id: funil, owner_id: owner, origin: origem, origem_especial: esp, status: 'won',
        data_real_evento: k % 2 ? d : null, end_time: k % 2 ? d + 'T00:00:00.000Z' : d + 'T15:30:00.000Z', won_at: '2026-11-0' + (1 + (k % 3)) + 'T10:00:00.000Z',
        description: k > 0 && funil === '907387' ? 'Ciclo de reposição. Negócio anterior: https://web.agendor.com.br/sistema/negocios/historico.php?id=' + prev : null });
      deals.push(d1); prev = d1.id; soma += valor; validas++;
    });
    if (i % 7 === 2) { const dd = mk({ title: nome + ' — Reposição #' + nCompras + ' (mesmo dia)', value: 111.11, funnel_id: '907387', owner_id: owner, origin: origem, origem_especial: esp, status: 'won', data_real_evento: datas[datas.length - 1], end_time: datas[datas.length - 1] + 'T00:00:00.000Z', description: 'Ciclo de reposição. Negócio anterior: https://web.agendor.com.br/sistema/negocios/historico.php?id=' + prev }); deals.push(dd); soma += 111.11; validas++; }
    conta(nCompras, ultimaOff, soma);
    exp.clientes++; exp.receita += soma; exp.pedidos += validas; exp.compras += nCompras; exp.porOrigem[origemEf]++; exp.porOwner[owner] = (exp.porOwner[owner] || 0) + 1;
  }
  // fronteiras dos dias (1 compra cada): 60/61, 90/91, 120/121, 150/151
  [0, 59, 60, 61, 90, 91, 120, 121, 150, 151, 400].forEach((off, j) => { const d = addDias(T, -off), v = 1000 + j; deals.push(mk({ title: 'Borda ' + off + ' dias', value: v, funnel_id: '890331', owner_id: 976406, data_real_evento: d, end_time: d + 'T00:00:00.000Z', status: 'won' })); conta(1, off, v); exp.clientes++; exp.receita += v; exp.pedidos++; exp.compras++; exp.porOrigem.outbound++; exp.porOwner['976406'] = (exp.porOwner['976406'] || 0) + 1; });
  // ruido que NAO pode entrar
  for (let k = 0; k < 12; k++) deals.push(mk({ title: 'Lead SDR ' + k + ' (SDR)', value: 0, funnel_id: k % 2 ? '916712' : '916713', status: 'won', data_real_evento: addDias(T, -k), owner_id: 976405 }));
  for (let k = 0; k < 6; k++) deals.push(mk({ title: 'SDR com valor ' + k, value: 5000, funnel_id: '916712', status: 'won', data_real_evento: addDias(T, -k - 1), owner_id: 976405 }));
  for (let k = 0; k < 8; k++) deals.push(mk({ title: 'Perdido ' + k, value: 4000, status: 'lost', funnel_id: '890331', lost_at: addDias(T, -k) + 'T12:00:00.000Z' }));
  for (let k = 0; k < 8; k++) deals.push(mk({ title: 'Aberto ' + k, value: 7000, status: 'ongoing', funnel_id: '907387' }));
  deals.push(mk({ title: 'Ganho simbolico', value: 5, status: 'won', data_real_evento: addDias(T, -20) }));        // < R$ 10: fora
  deals.push(mk({ title: 'Ganho zero', value: 0, status: 'won', data_real_evento: addDias(T, -21) }));            // zero: fora
  deals.push(mk({ title: 'Ganho sem data', value: 900, status: 'won' }));                                          // sem data real nem end_time: fora
  deals.push(mk({ title: 'Ganho Yanmei Shopify', value: 900, funnel_id: '555555', status: 'won', data_real_evento: addDias(T, -5) })); // funil de fora
  return { deals, esperado: exp, hoje: T };
}
