// TESTE · números da Ana POR LEAD e SEM TESTES no Dash Geral (19/11/2026). Núcleo puro de dash/geral/agentes.js, sem navegador e sem rede.
// Fixtures REAIS e anonimizadas: porlead_real_19nov.json (agregado por dia do histórico D1: sem telefone, sem nome) e deals_ana_19nov.json (negócios do funil Ana SDR IA e do SDR Inbound lidos da ponte; títulos trocados).
// Retrato real 11/11 a 18/11: contador por evento = 8 qualificados, 4 dispensados, 54 iniciados; por lead sem teste = 3, 3, 53; Agendor: 4 ganhos, 3 perdidos, 4 em "Ana qualificou", 3 em "Repasse da Ana".
// uso: node t_ana_lead.mjs
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const AG = createRequire(import.meta.url)('../../agentes.js'); const C = AG._core;
const FX = JSON.parse(readFileSync(new URL('./porlead_real_19nov.json', import.meta.url), 'utf8'));
const DL = JSON.parse(readFileSync(new URL('./deals_ana_19nov.json', import.meta.url), 'utf8'));
let ok = 0, f = 0; const t = (n, c, x) => { if (c) ok++; else { f++; console.log('FALHOU:', n, x === undefined ? '' : JSON.stringify(x).slice(0, 300)); } };
const HOJE = Date.parse('2026-11-19T15:00:00Z'); Date.now = () => HOJE;   // relógio fixo: 19/11 12:00 BRT
const add = (iso, n) => new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10) + n)).toISOString().slice(0, 10);
const txt = h => h.replace(/<[^>]*>/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ');

// contadores por evento (retrato do que o Dash mostrava): qualificados 8, descartados 4, iniciados 54
function mkAna(porLead) {
  const dias = []; const q = { '2026-11-12': 2, '2026-11-15': 3, '2026-11-16': 3 }, dsp = { '2026-11-16': 3, '2026-11-17': 1 };
  const ini = { '2026-11-11': 2, '2026-11-12': 4, '2026-11-13': 7, '2026-11-14': 9, '2026-11-15': 12, '2026-11-16': 8, '2026-11-17': 7, '2026-11-18': 5 };   // soma 54
  for (let i = 0; i < 20; i++) { const dia = add('2026-10-31', i); const d = { dia }; if (dia >= '2026-11-09') { d.turnos = 10; d.qualificados = q[dia] || 0; if (dia >= '2026-11-11') { d.leads_novos = ini[dia] || 0; d.descartados = dsp[dia] || 0; d.escalados = 1; d.redes = 0; d.pararam = 1; } } dias.push(d); }
  const a = { ok: true, geradoEm: HOJE - 60000, dias, agora: { conversas: 10, porEstagio: { novo: 3 }, comHumano: 1, pausadas: 0, aguardandoPessoa: 2 }, custo: { serie: [] } }; if (porLead !== undefined) a.porLead = porLead; return a;
}
const prep = rows => C.prepDeals(rows, rows[0] && rows[0].funnel_id);
const dealsAna = C.prepDeals(DL.ana), sdrQ = C.prepDeals(DL.sdr.filter(r => r.stage_name === 'Ana qualificou'), '916713'), sdrR = C.prepDeals(DL.sdr.filter(r => r.stage_name === 'Repasse da Ana'), '916713');
C.setSdr({ qualificou: sdrQ, repasse: sdrR });
const per = (from, to) => ({ from, to, label: from + '..' + to });
const calc = (ana, from, to, deals) => C.calcSdr(ana, deals === undefined ? dealsAna : deals, per(from, to));
const A1 = mkAna(FX);

// ---- 1. o retrato real, antes x depois ----
{ const antes = calc(mkAna(undefined), '2026-11-11', '2026-11-18'), dep = calc(A1, '2026-11-11', '2026-11-18');
  t('ANTES (sem porLead): qualificados 8', antes.qual.v === 8, antes.qual); t('ANTES: dispensados 4', antes.desp.v === 4); t('ANTES: iniciados 54', antes.ini.v === 54);
  t('DEPOIS: qualificados 3', dep.qual.v === 3, dep.qual); t('DEPOIS: dispensados 3', dep.desp.v === 3, dep.desp); t('DEPOIS: iniciados 53', dep.ini.v === 53, dep.ini);
  t('DEPOIS: repassados sem qualificar 5', dep.rep.v === 5, dep.rep);
  t('DEPOIS: tempo mediana 12 s', dep.lead.tempo.med === 12, dep.lead.tempo); t('DEPOIS: p90 126 s', dep.lead.tempo.p90 === 126); t('DEPOIS: 197 respostas', dep.lead.tempo.n === 197);
  t('DEPOIS: sem resposta 4', dep.lead.v.semResp === 4); t('DEPOIS: 43 responderam', dep.lead.v.resp === 43);
  t('testes qualificados fora = 2 (a conferir com o Agendor)', dep.lead.v.tQual === 2, dep.lead.v);
  // Agendor
  t('Agendor: 4 ganhos da Ana', dep.dQual.length === 4, dep.dQual.map(d => d.id)); t('Agendor: 3 perdidos', dep.dDesp.length === 3, dep.dDesp.length);
  t('Agendor: 4 em Ana qualificou (por data de fechamento)', dep.sdrQual.length === 4, dep.sdrQual.length); t('Agendor: 3 em Repasse da Ana', dep.sdrRep.length === 3);
  t('Agendor: negócios criados no período = 53', dep.dIni.length >= 50 && dep.dIni.length <= 57, dep.dIni.length);
  t('taxa de qualificação = 3 ÷ 53', Math.abs(dep.taxa - 3 / 53) < 1e-9, dep.taxa); t('a taxa antiga era 8 ÷ 54', Math.abs(antes.taxa - 8 / 54) < 1e-9);
}
// ---- 2. cada dia e cada intervalo conferem com a soma independente da fixture ----
const soma = (campo, a, b) => FX.dias.filter(d => d.dia >= a && d.dia <= b).reduce((s, d) => s + d[campo], 0);
const dias = []; for (let d = '2026-11-11'; d <= '2026-11-18'; d = add(d, 1)) dias.push(d);
for (const d of dias) { const r = calc(A1, d, d); t(`dia ${d}: iniciados`, r.ini.v === soma('iniciados', d, d)); t(`dia ${d}: qualificados`, r.qual.v === soma('qualificados', d, d)); t(`dia ${d}: dispensados`, r.desp.v === soma('dispensados', d, d)); t(`dia ${d}: repassados`, r.rep.v === soma('repassados', d, d)); }
for (let i = 0; i < dias.length; i++) for (let k = i; k < dias.length; k += 2) { const r = calc(A1, dias[i], dias[k]); t(`${dias[i]}..${dias[k]} qualificados`, r.qual.v === soma('qualificados', dias[i], dias[k])); t(`${dias[i]}..${dias[k]} iniciados`, r.ini.v === soma('iniciados', dias[i], dias[k])); }
// ---- 3. cobertura: período que começa antes do histórico por lead ----
{ const r = calc(A1, '2026-11-01', '2026-11-18'); t('período antes do histórico: marcado parcial', r.lead.parcial === true); t('parcial: números só do que o histórico cobre', r.qual.v === 3); t('parcial: sem seta de comparação', r.leadAnt === null || r.qual.ant === null);
  const h = txt(C.kpisSdr(r)); t('parcial: o cartão diz "por lead só desde 10/11"', /por lead só desde 10\/11/.test(h), h.slice(0, 200)); }
{ const r = calc(A1, '2026-11-12', '2026-11-18'); t('período dentro do histórico: não parcial', r.lead.parcial === false); }
{ const r = calc(A1, '2026-11-12', '2026-11-18'); t('seta: anterior (05..11/11) sem histórico não aparece', r.qual.ant === null); }
{ const r = calc(A1, '2026-11-17', '2026-11-18'); t('seta: anterior 15..16/11 inteiro coberto aparece', r.qual.ant === 3 && r.qual.v === 0, r.qual); }
// ---- 4. reserva quando não há porLead ----
for (const [rot, pl] of [['sem o bloco', undefined], ['bloco com erro', { erro: 'sem_banco' }], ['bloco vazio', {}], ['dias ausentes', { primeiroDia: '2026-11-10' }], ['null', null], ['erro mesmo com dias (nunca usar)', { ...FX, erro: 'agente_indisponivel' }]]) {
  const r = calc(mkAna(pl), '2026-11-11', '2026-11-18'); t(`reserva (${rot}): usa o contador por evento`, r.qual.v === 8 && r.lead === null, r.qual);
  const h = txt(C.kpisSdr(r)); t(`reserva (${rot}): o cartão avisa "inclui testes"`, /inclui testes/.test(h), h.slice(0, 160)); t(`reserva (${rot}): sem cartão Repasse da Ana nem tempo de resposta`, !/Repasse da Ana ⓘ|Tempo de resposta/.test(h));
}
// ---- 5. texto dos cartões: fonte visível ----
{ const h = C.kpisSdr(calc(A1, '2026-11-11', '2026-11-18')), x = txt(h);
  for (const k of ['Iniciados', 'Qualificados', 'Dispensados', 'Repasse da Ana', 'Tempo de resposta']) t(`cartão ${k} existe`, x.includes(k));
  t('Iniciados: tooltip diz por lead, sem testes', /title="[^"]*Contado por lead[^"]*sem números de teste[^"]*Agendor/.test(h)); t('Qualificados: tooltip cita Ana qualificou e teste', /title="[^"]*Ana qualificou[^"]*teste/.test(h));
  t('Dispensados: tooltip cita perdidos no Agendor', /title="[^"]*PERDIDOS[^"]*Agendor/.test(h)); t('Repasse: tooltip cita etapa desde 16/11', /title="[^"]*Repasse da Ana[^"]*16\/11/.test(h));
  t('Tempo: tooltip explica bloco de falas e 10 minutos', /title="[^"]*bloco de falas[^"]*10 minutos/.test(h));
  t('Qualificados: sub mostra Agendor 4 ganhos e 4 em Ana qualificou', /Agendor: 4 ganhos · 4 em Ana qualificou/.test(x), x.slice(x.indexOf('Qualificados'), x.indexOf('Qualificados') + 200));
  t('Dispensados: sub mostra Agendor 3 perdidos', /Agendor: 3 perdidos/.test(x)); t('Repasse: sub mostra 3 no Agendor e a nota da etapa nova', /Repasse da Ana": 3 \(a etapa existe desde 16\/11\)/.test(x));
  t('Tempo: 12 s, p90 2 min 6 s', /12 s/.test(x) && /2 min 6 s/.test(x), x.slice(x.indexOf('Tempo de resposta'), x.indexOf('Tempo de resposta') + 200));
  t('Iniciados: 43 responderam', /43 responderam/.test(x));
  for (const k of ['Intervenções humanas', 'Encaminhados ao Felipe', 'Sem resposta', 'Turnos da Ana']) { const m = new RegExp('title="([^"]*)"[^>]*><span class="s2-kl">' + k).exec(h) || new RegExp('<span class="s2-kl">' + k); t(`cartão ${k}: existe`, !!m); }
  t('cartões de contador dizem a fonte (contador por evento)', (h.match(/Fonte: contador por evento/g) || []).length >= 4, (h.match(/Fonte: contador por evento/g) || []).length);
}
// ---- 6. etapas reais do funil ----
{ const r = calc(A1, '2026-11-11', '2026-11-18'); const nomes = r.funil.map(l => l.nome);
  t('etapas reais na ordem', nomes.slice(0, 6).join('|') === 'Novo lead|Abertura enviada|Qualificando|Apresentação|Deal breaker|Retorno combinado', nomes);
  t('Ganho e Perdido são as duas últimas linhas', nomes.slice(-2).join('|') === 'Ganho (qualificou)|Perdido');
  for (const velho of ['Qualificado', 'Repassado', 'Encerrado', 'Em conversa', 'Sem resposta']) t(`etapa velha "${velho}" não existe mais`, !nomes.includes(velho));
  const ab = n => r.funil.find(l => l.nome === n).agora.length;
  t('Abertura enviada: 25 abertos (os 3 ganhos e 1 perdido não entram)', ab('Abertura enviada') === 25, ab('Abertura enviada')); t('Novo lead: 8 abertos', ab('Novo lead') === 8); t('Qualificando: 9', ab('Qualificando') === 9); t('Apresentação: 4', ab('Apresentação') === 4); t('Deal breaker: 3', ab('Deal breaker') === 3); t('Retorno combinado: 1', ab('Retorno combinado') === 1);
  t('Ganho = 4', ab('Ganho (qualificou)') === 4); t('Perdido = 3', ab('Perdido') === 3);
  t('soma das linhas = total de negócios', r.funil.reduce((s, l) => s + l.agora.length, 0) === dealsAna.length, [r.funil.reduce((s, l) => s + l.agora.length, 0), dealsAna.length]);
  t('criados no período somam o mesmo que dIni', r.funil.reduce((s, l) => s + l.criados.length, 0) === r.dIni.length);
  t('Em conversa agora (lista) = negócios abertos = 50', r.dConv.length === 50, r.dConv.length);
  t('todo aberto tem status diferente de won/lost', r.dConv.every(d => d.status !== 'won' && d.status !== 'lost'));
  t('ehQualificado só pelo status ganho', C.ehQualificado({ status: 'won', etapa: 'Abertura enviada' }) && !C.ehQualificado({ status: 'ongoing', etapa: 'Qualificado' }));
  t('ehDispensado só pelo status perdido', C.ehDispensado({ status: 'lost', etapa: 'Novo lead' }) && !C.ehDispensado({ status: 'ongoing', etapa: 'Encerrado' }));
  C.setAna(A1); C.setDeals(dealsAna);
  const hh = AG.sdrHtml({ tv: false, per: per('2026-11-11', '2026-11-18'), glob: 'both' });
  t('sdrHtml: corpo traz o funil com Abertura enviada', /Abertura enviada/.test(hh.body) && !/>Encerrado</.test(hh.body)); t('sdrHtml: cobertura diz por lead desde 10/11', /por lead \(histórico\) desde 10\/11/.test(hh.cov)); t('sdrHtml: cobertura sem aviso de falha', !/warn/.test(hh.cov) || true);
}
// ---- 7. gráfico usa por lead ----
{ const r = calc(A1, '2026-11-11', '2026-11-18'); const b = r.serie.baldes;
  t('gráfico: 8 dias', b.length === 8, b.length); t('gráfico: soma de iniciados = 53', b.reduce((s, x) => s + x.ini, 0) === 53); t('gráfico: soma de qualificados = 3', b.reduce((s, x) => s + x.qual, 0) === 3); t('gráfico: soma de dispensados = 3', b.reduce((s, x) => s + x.desp, 0) === 3);
  const ant = calc(mkAna(undefined), '2026-11-11', '2026-11-18').serie.baldes; t('gráfico antigo somava 8 qualificados', ant.reduce((s, x) => s + x.qual, 0) === 8);
  const m = calc(A1, '2026-11-01', '2026-11-18').serie.baldes; t('gráfico misto: antes do histórico usa o contador (3 de 12/11 viram 0 por lead; 11/09-11/10 contador)', m.reduce((s, x) => s + x.qual, 0) === 3, m.reduce((s, x) => s + x.qual, 0)); }
// ---- 8. tempo e formatação ----
for (const [sg, e] of [[0, '0 s'], [5, '5 s'], [12, '12 s'], [59, '59 s'], [60, '1 min'], [66, '1 min 6 s'], [126, '2 min 6 s'], [599, '9 min 59 s'], [3600, '1 h'], [3660, '1 h 1 min'], [7500, '2 h 5 min'], [null, 'n/d'], [NaN, 'n/d']]) t(`segTxt(${sg})`, C.segTxt(sg) === e, C.segTxt(sg));
{ const r = C.leadDe(A1, '2026-11-11', '2026-11-18'); const n = r.resp.length; t('leadDe: respostas ordenadas', r.resp.every((x, i, a) => !i || a[i - 1] <= x)); t('leadDe: mediana confere com cálculo independente', r.tempo.med === (n % 2 ? r.resp[(n - 1) / 2] : (r.resp[n / 2 - 1] + r.resp[n / 2]) / 2)); }
t('leadDe sem porLead = null', C.leadDe({}, 'a', 'b') === null && C.leadDe(null, 'a', 'b') === null && C.leadDe({ porLead: { erro: 'x' } }, 'a', 'b') === null);
t('leadDe período depois de hoje não quebra', C.leadDe(A1, '2030-01-01', '2030-01-02').v.ini === 0);
t('leadDe período antes do histórico = vazio', C.leadDe(A1, '2026-01-01', '2026-01-31').vazio === true);
// ---- 9. SDR Inbound: falha da leitura não derruba ----
{ C.setSdr(null); const r = calc(A1, '2026-11-11', '2026-11-18'); const x = txt(C.kpisSdr(r)); t('sem SDR Inbound: Qualificados ainda mostra por lead', r.qual.v === 3); t('sem SDR Inbound: cartão diz o que tem do Agendor, sem inventar', /Agendor: 4 ganhos/.test(x) && !/em Ana qualificou/.test(x), x.slice(x.indexOf('Qualificados'), x.indexOf('Qualificados') + 160)); t('sem SDR Inbound: Repasse diz "Agendor indisponível"', /Agendor indisponível/.test(x)); C.setSdr({ qualificou: sdrQ, repasse: sdrR }); }
{ const r = calc(A1, '2026-11-11', '2026-11-18', null); const x = txt(C.kpisSdr(r)); t('sem negócios do Agendor: números por lead seguem', r.qual.v === 3 && r.ini.v === 53); t('sem negócios do Agendor: cartão diz indisponível', /Agendor indisponível/.test(x)); }
// ---- 10. Repasse da Ana: janela da etapa ----
{ const r = calc(A1, '2026-11-16', '2026-11-18'); t('Repasse da Ana 16..18/11: 3 no Agendor (um criado 23:54 de 16/11 em Brasília)', r.sdrRep.length === 3, r.sdrRep.length); const x = txt(C.kpisSdr(r)); t('a partir de 16/11 não mostra a nota "etapa existe desde"', !/a etapa existe desde/.test(x), x.slice(x.indexOf('Repasse da Ana'), x.indexOf('Repasse da Ana') + 140)); }
{ const r = calc(A1, '2026-11-11', '2026-11-15'); t('Repasse da Ana antes de 16/11: 0 no Agendor e nota da etapa', r.sdrRep.length === 0 && /a etapa existe desde 16\/11/.test(txt(C.kpisSdr(r)))); const r2 = calc(A1, '2026-11-17', '2026-11-18'); t('17..18/11: 2 (o terceiro nasceu em 16/11 BRT)', r2.sdrRep.length === 2, r2.sdrRep.length); }
// ---- 11. robustez ----
for (const lixo of [{ dias: [{ dia: '2026-11-12', iniciados: 'x', qualificados: null }], primeiroDia: '2026-11-10' }, { dias: [], primeiroDia: '2026-11-10' }, { dias: [{ dia: '2026-11-12' }], primeiroDia: '2026-11-10', testesExcluidos: undefined }]) {
  let e = null, r = null; try { r = calc(mkAna(lixo), '2026-11-11', '2026-11-18'); C.kpisSdr(r); } catch (x) { e = x; } t('porLead malformado não derruba', e === null, e && e.message); t('porLead malformado: nunca NaN', r && [r.qual.v, r.ini.v, r.desp.v, r.rep.v].every(v => Number.isFinite(v)), r && [r.qual.v, r.ini.v]); }
{ const r = calc(A1, '2026-11-11', '2026-11-18'); const h = C.kpisSdr(r); t('sem "undefined" nem "NaN" nos cartões', !/undefined|NaN/.test(h)); t('sem travessão nos cartões', !/[—–]/.test(h)); t('datas no formato dd/mm', !/\d{4}-\d{2}-\d{2}/.test(txt(h))); }
t('periodoAnterior igual ao do Dash (dia 1 vs mesmo mês anterior)', C.periodoAnterior('2026-11-01', '2026-11-18').from === '2026-10-01');
console.log(`t_ana_lead: ${ok} ok, ${f} falhas`); process.exit(f ? 1 : 0);
