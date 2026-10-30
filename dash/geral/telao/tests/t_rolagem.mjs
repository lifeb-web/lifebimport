// node tl/scrollall.mjs [W H]  -> roda a rolagem automatica de TODA lista do telao por varios ciclos; falha em qualquer salto
import { chromium } from 'playwright-core';
import { EXE, BASE, mocar as mocks, ir as setV, per as setP } from './telao_lib.mjs';
const novo = async vp => { const b = await chromium.launch({ executablePath: EXE }); const p = await (await b.newContext({ viewport: vp })).newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); return { b, p }; };
import fs from 'node:fs';
const W = +(process.argv[2] || 1920), H = +(process.argv[3] || 1080), RM = process.argv[4] === 'rm';
const LISTAS = [['vendas', 1, 'lb-rows', 'Vendas · Ranking'], ['vendas', 1, 'motivos-perda-rows', 'Vendas · Motivos de perda'], ['ltv', 1, 'ltv-motivos-perda-rows', 'LTV · Motivos de perda'], ['ltv', 1, 'ltv-lb-rows', 'LTV · Ranking'], ['ltv', 1, 'ltv-won-rows', 'LTV · Recompras fechadas'], ['ltv', 1, 'ltv-lost-rows', 'LTV · Ciclos perdidos'],
  ['ads', 1, 'ads-campanhas-rows', 'Ads · Campanhas'], ['ads', 1, 'ads-anuncios-rows', 'Ads · Anúncios'], ['ga4', 2, 'ga4-cities-scroll', 'GA4 · Estado/cidade'], ['ga4', 2, 'ga4-sources-scroll', 'GA4 · Origem do tráfego'], ['ga4', 2, 'ga4-pages-scroll', 'GA4 · Por página'],
  ['bia', 2, 'bia-motor-breakdown', 'Bia · Resumo do motor'], ['bia', 2, 'bia-motor-feed', 'Bia · Eventos recentes']];
const { b, p } = await novo({ width: W, height: H });
if (RM) await p.emulateMedia({ reducedMotion: 'reduce' });
await mocks(p, 'ok');
await p.goto(BASE + 'telao/index.html?rot=0', { waitUntil: 'commit' }); await p.waitForTimeout(9000);
const f = () => p.frames().find(x => x !== p.mainFrame()) || p;
for (const v0 of ['vendas','ltv','sdr','ads']) { await setV(f(), v0); await p.waitForTimeout(2500); }
await p.route(/dash-geral-bridge|bia-dash-sync|script\.google(usercontent)?\.com|supabase/, r => r.abort()); // congela os dados: o teste controla a renovacao
let falhas = 0; const linhas = [];
const SO = process.argv[5]; for (const [v, pg, id, nome] of LISTAS) {
  if (SO && !nome.includes(SO)) continue;
  await setV(f(), v); await setP(f(), v === 'ga4' || v === 'bia' ? 'today' : 'month'); await p.waitForTimeout(1800); await f().evaluate(k => window.__pg.set(k, true), pg); await p.waitForTimeout(500);
  if (id.startsWith('bia-')) await f().evaluate(() => { const base = Date.now(); const evs = Array.from({ length: 70 }, (_, i) => ({ repNome: ['Washington', 'Iramar', 'Flávia'][i % 3], estagio: 'cobranca_dia_util', resultado: ['ciclo_escalada', 'atraso_detectado', 'recobranca_1'][i % 3], dealId: 40000000 + i, ts: base - i * 60000 })); const pr = {}; evs.forEach(e => { pr[e.resultado] = (pr[e.resultado] || 0) + 1; }); _biaSnap = Object.assign({}, window._biaSnap || {}, { motorRecentes: evs, motorPorResultado: Object.assign(pr, { sinalizado: 1, escalada: 2, pendencia_critica: 3, recobranca_2: 4, cancelado: 1, aguardando: 2, atraso_x: 3 }), motorProativoHoje: 70 }); renderBiaMotorSection_(_biaSnap); });
  const prep = await f().evaluate(id => {
    const e = document.getElementById(id); if (!e) return { erro: 'sem elemento' };
    const alvo = e.children.length === 1 && e.children[0].tagName === 'TABLE' ? e.children[0].tBodies[0] : e;
    const orig = alvo.children.length; if (!orig) return { erro: 'lista vazia' };
    const mol = Array.from(alvo.children); let i = 0;
    while (e.scrollHeight < e.clientHeight * 2.4 && i < 120) { alvo.appendChild(mol[i % mol.length].cloneNode(true)); i++; }
    autoScrollIfNeeded(id);
    return { orig, total: alvo.children.length, sh: e.scrollHeight, ch: e.clientHeight };
  }, id);
  if (prep.erro) { linhas.push([nome, v, 'NAO TESTADO: ' + prep.erro]); continue; }
  if (RM) { await p.waitForTimeout(3000); const t = await f().evaluate(id => document.getElementById(id).scrollTop, id); const okk = t === 0; if (!okk) falhas++; linhas.push([nome, v, okk ? 'ok (reduzir movimento: parada)' : 'FALHOU rolou com reduzir movimento']); continue; }
  await f().evaluate(() => LB_SCROLL._scale(0.12));
  await f().evaluate(id => { window.__rec = []; LB_SCROLL._frameHook = ts => { const st = LB_SCROLL._state[id]; const e = st.el; window.__rec.push([Math.round(ts), st.mode, e.scrollTop, st.from, st.to]); }; }, id);
  await p.waitForTimeout(16000);
  const rec = await f().evaluate(() => { LB_SCROLL._frameHook = null; return window.__rec; });
  let saltos = 0, ciclos = 0, maxd = 0, anims = 0; let ult = null;
  for (let i = 1; i < rec.length; i++) {
    const [t, m, top, from, to] = rec[i], [t0, m0, top0] = rec[i - 1], d = top - top0; maxd = Math.max(maxd, Math.abs(d));
    if (m === 'anim' && m0 === 'dwell') anims++;
    if (m === 'dwell' && m0 === 'dwell' && Math.abs(d) > 1.5) saltos++;                 // mexeu parado
    if (m === 'anim' && m0 === 'anim' && Math.abs(to - from) > 0 && Math.abs(d) > 0.5 * Math.abs(to - from) + 20) saltos++; // salto dentro da animacao
    if (m === 'dwell' && m0 === 'anim' && rec[i - 1][4] === 0 && rec[i - 1][3] > 50) ciclos++;
  }
  const fim = await f().evaluate(id => { const e = document.getElementById(id); return { n: (e.children.length === 1 && e.children[0].tagName === 'TABLE' ? e.children[0].tBodies[0] : e).children.length, st: e.scrollTop }; }, id);
  // renovacao com o mesmo HTML nao pode mexer na posicao
  await f().evaluate(id => { const e = document.getElementById(id); }, id);
  let ok1 = true, pos0 = null, pos1 = null;
  for (let tent = 0; tent < 40 && pos0 === null; tent++) { await p.waitForTimeout(250); const s = await f().evaluate(id => { const st = LB_SCROLL._state[id]; return { m: st.mode, top: st.el.scrollTop }; }, id); if (s.m === 'dwell' && s.top > 40) pos0 = s.top; }
  if (pos0 !== null) { await f().evaluate(id => { const e = document.getElementById(id); e.innerHTML = e.innerHTML; autoScrollIfNeeded(id); }, id); pos1 = await f().evaluate(id => document.getElementById(id).scrollTop, id); ok1 = Math.abs(pos1 - pos0) < 8; }
  // pausa com mouse em cima
  await f().evaluate(id => document.getElementById(id).dispatchEvent(new MouseEvent('mouseenter')), id); await p.waitForTimeout(1500);
  const h1 = await f().evaluate(id => document.getElementById(id).scrollTop, id); await p.waitForTimeout(5000);
  const h2 = await f().evaluate(id => document.getElementById(id).scrollTop, id); const okh = Math.abs(h2 - h1) < 2;
  await f().evaluate(id => document.getElementById(id).dispatchEvent(new MouseEvent('mouseleave')), id);
  const okDup = fim.n === prep.total;
  const okAll = saltos === 0 && ciclos >= 1 && okh && ok1 && okDup && anims >= 3;
  if (!okAll) falhas++;
  linhas.push([nome, v, (okAll ? 'ok' : 'FALHOU') + ` | ${prep.orig} linhas (+clones ate ${prep.total}) · saltos ${saltos} · voltas ao topo ${ciclos} · passos ${anims} · maior passo/quadro ${Math.round(maxd)}px · renovar mantem posicao ${pos0 === null ? 'n/a' : ok1 ? 'sim' : 'NAO ' + pos0 + '->' + pos1} · pausa no mouse ${okh ? 'sim' : 'NAO'} · duplicados no loop ${okDup ? 0 : 'SIM'}`]);
}
console.log(`== ROLAGEM AUTOMATICA ${W}x${H}${RM ? ' (reduzir movimento)' : ''}`);
for (const l of linhas) console.log(l.join(' | '));
console.log('erros JS: ', [...new Set(p.errs)].filter(e => !/Failed to load|ERR_FAILED|HTTP4|net::/.test(e)));
console.log(falhas ? 'FALHAS: ' + falhas : 'TUDO OK');
await b.close(); process.exit(falhas ? 1 : 0);
