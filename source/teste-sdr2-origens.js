// Teste do núcleo do painel SDR (dash/geral/sdr2.js): origens novas aparecem sozinhas e a soma por origem fecha com o total.
// Rodar: node source/teste-sdr2-origens.js
const S = require('../dash/geral/sdr2.js'); const C = S._core;
let ok = 0, falhas = 0;
const check = (n, c, x) => { if (c) ok++; else { falhas++; console.log('FALHOU:', n, x === undefined ? '' : JSON.stringify(x)); } };
let id = 1;
const mk = (o) => Object.assign({ id: id++, title: 'N' + id, stage_id: 1, stage_name: 'D1 · Primeiro contato', funnel_id: '916712', owner_id: '976405', origin: 'outbound', origem_especial: null, status: 'ongoing', created_at: '2026-10-21T13:00:00Z', end_time: null, lost_reason_name: null, synced_at: '2026-10-29T14:00:00Z' }, o || {});
const ganho = (o) => mk(Object.assign({ status: 'won', data_real_evento: '2026-10-27', end_time: '2026-10-27T15:00:00Z' }, o));
const perdido = (o) => mk(Object.assign({ status: 'lost', data_real_evento: '2026-10-27', end_time: '2026-10-27T15:00:00Z', lost_reason_name: 'Sem interesse' }, o));
const esgotado = (o) => perdido(Object.assign({ lost_reason_name: 'Cadência esgotada' }, o));

// classificação: as conhecidas não mudam
check('outbound padrão', C.origemKey({ origin: 'outbound' }) === 'outbound' && C.origemKey({}) === 'outbound' && C.origemKey({ origin: null, origem_especial: '' }) === 'outbound');
check('inbound', C.origemKey({ origin: 'inbound' }) === 'inbound');
check('superagos e recuperação (origem_especial manda)', C.origemKey({ origin: 'outbound', origem_especial: 'superagos' }) === 'superagos' && C.origemKey({ origin: 'outbound', origem_especial: 'Recuperação' }) === 'recuperacao');
check('valores vazios nunca viram origem', ['null', 'None', 'nenhuma', ' ', 'N/A'].every((v) => C.origemKey({ origin: 'outbound', origem_especial: v }) === 'outbound'));
// origem nova
check('origem nova em origem_especial vira origem própria', C.origemKey({ origin: 'outbound', origem_especial: 'Feira Sul' }) === 'feira_sul');
check('origem nova em origin (valor desconhecido) também', C.origemKey({ origin: 'Nossa Rede' }) === 'nossa_rede');
check('rótulo legível', C.rotuloOrigem('feira_sul') === 'Feira Sul' && C.rotuloOrigem('nossa_rede') === 'Nossa Rede' && C.rotuloOrigem('indicacao') === 'Indicação' && C.rotuloOrigem('recuperacao_sdr') === 'Recuperação SDR', [C.rotuloOrigem('feira_sul')]);
const c1 = C.corOrigem('feira_sul'), c2 = C.corOrigem('feira_sul');
check('cor automática estável e fora das fixas', c1 === c2 && /^#[0-9a-f]{6}$/i.test(c1) && !['#704B9B', '#2f7de1', '#0e9aa0', '#E92085', '#1baf7a'].map((x) => x.toLowerCase()).includes(c1.toLowerCase()), c1);
check('cores diferentes para chaves diferentes (na maioria)', new Set(['a_b', 'feira_sul', 'nossa_rede', 'x1', 'expo_norte', 'parceiro_z']).size === 6 && new Set(['feira_sul', 'nossa_rede', 'expo_norte', 'parceiro_z', 'zeta', 'kappa'].map(C.corOrigem)).size >= 4);

// dados com uma origem fictícia nova ("Feira Sul") + uma segunda ("Expo Norte") só no Inbound
const brutas = [
  ganho(), ganho({ origem_especial: 'superagos' }), ganho({ origem_especial: 'Feira Sul' }), ganho({ origem_especial: 'Feira Sul' }),
  perdido({ origem_especial: 'Feira Sul' }), esgotado({ origem_especial: 'Feira Sul' }), mk({ origem_especial: 'Feira Sul' }),
  perdido(), esgotado({ origem_especial: 'recuperacao' }),
  ganho({ funnel_id: '916713', origin: 'inbound' }), perdido({ funnel_id: '916713', origin: 'inbound' }), ganho({ funnel_id: '916713', origin: 'inbound', origem_especial: 'Expo Norte' }),
  ganho({ origin: 'Nossa Rede' })
];
const rows = C.prep(brutas, {});
check('nenhum negócio sai na preparação', rows.length === brutas.length, [rows.length, brutas.length]);
const per = { from: '2026-10-20', to: '2026-10-29', label: 'teste' };
for (const glob of ['both', 'outbound', 'inbound']) {
  for (const sdr of ['', '976405']) {
    for (const funil of ['', '916712', '916713']) {
      const f = { sdr, funil, origem: '', glob };
      const r = C.calcular(rows, per, f, 'd', {});
      const ori = r.cruz.filter((c) => c.tipo === 'origem'), fun = r.cruz.filter((c) => c.tipo === 'funil');
      const chaves = ori.map((c) => c.key);
      check(`[${glob}/${sdr}/${funil}] origens fixas primeiro, na ordem, depois as novas`, chaves.slice(0, 4).join() === 'outbound,superagos,recuperacao,inbound' && chaves.includes('feira_sul') && chaves.includes('expo_norte') && chaves.includes('nossa_rede'), chaves);
      check(`[${glob}/${sdr}/${funil}] origens novas vêm depois, em ordem alfabética`, chaves.slice(4).join() === ['expo_norte', 'feira_sul', 'nossa_rede'].join(), chaves);
      const somaQ = ori.reduce((s, c) => s + c.a.q, 0), somaPm = ori.reduce((s, c) => s + c.a.pm, 0), somaPs = ori.reduce((s, c) => s + c.a.ps, 0), somaOng = ori.reduce((s, c) => s + c.a.ong.length, 0);
      const filtrado = (funil ? fun.filter((c) => c.key === funil) : fun);
      // a tabela cruzada ignora o filtro de funil e de origem: soma por origem == soma por funil == total do SDR/global
      const totQ = fun.reduce((s, c) => s + c.a.q, 0), totPm = fun.reduce((s, c) => s + c.a.pm, 0), totPs = fun.reduce((s, c) => s + c.a.ps, 0), totOng = fun.reduce((s, c) => s + c.a.ong.length, 0);
      check(`[${glob}/${sdr}/${funil}] soma por origem fecha com o total (qualificados, perdidos, esgotados, em andamento)`, somaQ === totQ && somaPm === totPm && somaPs === totPs && somaOng === totOng, { somaQ, totQ, somaPm, totPm, somaPs, totPs, somaOng, totOng });
      check(`[${glob}/${sdr}/${funil}] cada origem tem rótulo e cor`, ori.every((c) => c.label && /^#/.test(c.cor)));
      const nova = ori.find((c) => c.key === 'feira_sul');
      check(`[${glob}/${sdr}/${funil}] Feira Sul: 2 qualificados, 1 perdido, 1 esgotado, 1 em andamento (quando visível)`, glob === 'inbound' ? nova.a.q === 0 : (nova.a.q === 2 && nova.a.pm === 1 && nova.a.ps === 1 && nova.a.ong.length === 1), [glob, nova.a.q, nova.a.pm, nova.a.ps, nova.a.ong.length]);
      check(`[${glob}] r.origens traz a lista completa para os filtros`, Array.isArray(r.origens) && r.origens.length === 7);
    }
  }
}
// barra global do Dash: origem nova segue o campo origin do negócio (Expo Norte veio de negócio Inbound; Feira Sul de Outbound)
{
  const q = (glob, k) => C.calcular(rows, per, { sdr: '', funil: '', origem: '', glob }, 'd', {}).cruz.find((c) => c.tipo === 'origem' && c.key === k).a.q;
  check('Expo Norte (negócio Inbound) conta no global Inbound e não no Outbound', q('inbound', 'expo_norte') === 1 && q('outbound', 'expo_norte') === 0 && q('both', 'expo_norte') === 1);
  check('Feira Sul (negócio Outbound) conta no global Outbound e não no Inbound', q('outbound', 'feira_sul') === 2 && q('inbound', 'feira_sul') === 0);
  check('linhas carregam o lado', rows.filter((x) => x.origem === 'expo_norte').every((x) => x.lado === 'inbound') && rows.filter((x) => x.origem === 'feira_sul').every((x) => x.lado === 'outbound') && rows.filter((x) => x.origem === 'superagos').every((x) => x.lado === 'outbound'));
}
// filtro por origem nova
{
  const r = C.calcular(rows, per, { sdr: '', funil: '', origem: 'feira_sul', glob: 'both' }, 'd', {});
  check('filtro Origem = Feira Sul: só os 5 negócios dela', r.ag.q === 2 && r.ag.pm === 1 && r.ag.ps === 1 && r.ag.ong.length === 1, [r.ag.q, r.ag.pm, r.ag.ps]);
  const t = C.calcular(rows, per, { sdr: '', funil: '', origem: '', glob: 'both' }, 'd', {});
  const somaOrigens = t.cruz.filter((c) => c.tipo === 'origem').reduce((s, c) => s + c.a.q, 0);
  check('total geral = soma das origens (nada escondido em "sem origem")', t.ag.q === somaOrigens && t.ag.q === 7, [t.ag.q, somaOrigens]);
}
// origem sem nenhum negócio: some da lista, só as 4 fixas permanecem
{
  const r = C.calcular(C.prep([ganho(), perdido()], {}), per, { sdr: '', funil: '', origem: '', glob: 'both' }, 'd', {});
  check('sem origem nova nos dados: continuam só as 4 fixas', r.origens.length === 4 && r.cruz.filter((c) => c.tipo === 'origem').length === 4);
}
// rótulo no cartão de negócios (origemLabel) funciona para chave nova
check('texto do rótulo sem HTML solto', !/[<>&"]/.test(C.rotuloOrigem(C.origemKey({ origin: 'outbound', origem_especial: 'Feira <b>Sul</b> & "Cia"' }))), C.rotuloOrigem(C.origemKey({ origin: 'outbound', origem_especial: 'Feira <b>Sul</b> & "Cia"' })));
console.log(`\nsdr2 origens: ${ok} passou / ${falhas} falhou`);
process.exit(falhas ? 1 : 0);
