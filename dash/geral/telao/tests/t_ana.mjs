// TESTE · agente Ana no Dash Geral (11/11): aba SDR com seletor Felipe | Ana e aba Agentes com seletor Bia | Ana (saude e custo).
// Offline para a Ana (rota /ana-painel e negocios do funil 919856 vem de ana_fixture.mjs, relogio fixo em 20/11/2026 12:00 BRT);
// o resto do Dash le a ponte real, como os outros testes.
// Cobre: celular 320/360/390/430/768/1366/1920 e telao 1800x1012, 1366x768, 1920x1080, 4K: nenhum texto cortado, sem rolagem lateral,
// minimos de tipografia, seletores, filtros (periodo e origem), numeros conferindo com a fixture, estados (erro, atrasado, sem dado), listas com link do Agendor.
// uso: servir a raiz do site (python3 -m http.server 8801), DASH_FIXTURES=<pasta dos mocks> DASH_BASE=http://localhost:8801/dash/geral/ node t_ana.mjs [rapido]
import { chromium } from 'playwright-core';
import { EXE, BASE, AUD, mocar, violacoes } from './telao_lib.mjs';
import { makeAna, makeDeals, HOJE, AGORA_ISO, NOVOS_DESDE } from './ana_fixture.mjs';

const RAPIDO = process.argv.includes('rapido');
let falhas = 0, checks = 0; const sec = {};
const ok = (c, m) => { checks++; if (!c) { falhas++; console.log('  FALHOU: ' + m); } };
const cab = t => console.log('\n== ' + t);
const add = (iso, n) => new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10) + n)).toISOString().slice(0, 10);
const diff = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

const browser = await chromium.launch({ executablePath: EXE });
const FX = { ana: makeAna(), deals: makeDeals(), modo: 'ok' };

async function abrir(W, H, tv, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: !tv, colorScheme: 'light' });
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push('PAGEERROR ' + e.message.slice(0, 160)));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) p.errs.push('console ' + m.text().slice(0, 140)); });
  await p.clock.setFixedTime(new Date(AGORA_ISO));
  await mocar(p, 'ok');
  const cors = { 'access-control-allow-origin': '*' };
  p.fx = { ana: opts.ana || FX.ana, deals: opts.deals || FX.deals, modo: opts.modo || 'ok' };
  await p.route(/gs-agendor-worker.*\/ana-painel/, r => {
    if (p.fx.modo === 'rede') return r.abort();
    if (p.fx.modo === 'err500') return r.fulfill({ status: 500, headers: cors, body: 'erro' });
    return r.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify(p.fx.ana) });
  });
  await p.route(/dash_geral_deals.*funnel_id=eq\.919856/, r => {
    if (p.fx.modo === 'dealserr') return r.fulfill({ status: 500, headers: cors, body: 'erro' });
    return r.fulfill({ status: 200, headers: { ...cors, 'content-range': '0-' + (p.fx.deals.length - 1) + '/' + p.fx.deals.length, 'access-control-expose-headers': 'content-range' }, contentType: 'application/json', body: JSON.stringify(p.fx.deals) });
  });
  await p.goto(BASE + (tv ? 'telao/index.html?rot=0' : 'index.html'), { waitUntil: 'commit' });
  await p.waitForTimeout(opts.espera || 7500);
  const f = () => (tv ? (p.frames().find(x => x !== p.mainFrame()) || p) : p);
  return { ctx, p, f, tv };
}
const clica = (f, sel) => f().evaluate(s => { const b = document.querySelector(s); if (b) { b.click(); return true; } return false; }, sel);
const ir = (f, v) => clica(f, '.ochip[data-v="' + v + '"]');
const per = (f, v) => clica(f, '.pchip[data-p="' + v + '"]');
const ori = (f, v) => clica(f, '.ochip[data-o="' + v + '"]');
const periodo = f => f().evaluate(() => ({ from: _data.period.from, to: _data.period.to, label: _data.period.label }));
async function agente(f, a) { await clica(f, 'button[data-ag="' + a + '"]'); }
async function aba(f, a) { await clica(f, '#ag-bar [data-ag-pick="' + a + '"]'); }
const kpis = f => f().evaluate((sel) => { const root = document.querySelector(sel); const o = {}; if (!root) return o; root.querySelectorAll('.s2-k').forEach(k => { const l = (k.querySelector('.s2-kl') || {}).textContent || ''; o[l.replace(/\s*ⓘ\s*/g, '').trim()] = { v: (k.querySelector('.s2-kv') || {}).textContent || '', t: (k.querySelector('.s2-kt') || {}).textContent || '', go: k.getAttribute('data-ag-go') }; }); return o; }, null);
const kpisEm = (f, sel) => f().evaluate((sel) => { const root = document.querySelector(sel); const o = {}; if (!root) return o; root.querySelectorAll('.s2-k').forEach(k => { const l = (k.querySelector('.s2-kl') || {}).textContent || ''; o[l.replace(/\s*ⓘ\s*/g, '').trim()] = { v: (k.querySelector('.s2-kv') || {}).textContent || '', t: (k.querySelector('.s2-kt') || {}).textContent || '', go: k.getAttribute('data-ag-go') }; }); return o; }, sel);
const nint = s => { const m = /^[^0-9n]*([0-9.]+)/.exec(s.trim()); return m ? parseInt(m[1].replace(/\./g, ''), 10) : null; };
const fU = n => 'US$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: n >= 1 ? 2 : 4, maximumFractionDigits: n >= 1 ? 2 : 4 });
const fR = n => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: n >= 1 ? 2 : 4, maximumFractionDigits: n >= 1 ? 2 : 4 });
const dec1 = n => (Math.round(n * 10) / 10).toString().replace('.', ',');
const COT = 5.5;

// ---------- esperado, calculado de forma independente a partir da fixture ----------
function prevPer(from, to) {
  if (from.slice(8, 10) === '01') { const y = +from.slice(0, 4), m = +from.slice(5, 7); const py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1; const ult = new Date(Date.UTC(y, m - 1, 0)).getUTCDate(); return { from: py + '-' + String(pm).padStart(2, '0') + '-01', to: py + '-' + String(pm).padStart(2, '0') + '-' + String(Math.min(+to.slice(8, 10), ult)).padStart(2, '0') }; }
  const n = diff(from, to) + 1, pt = add(from, -1); return { from: add(pt, -(n - 1)), to: pt };
}
function esperado(ana, from, to0) {
  const to = to0 > HOJE ? HOJE : to0, dias = ana.dias, primeiro = dias[0].dia;
  const ini = from > primeiro ? from : primeiro;
  const ds = dias.filter(d => d.dia >= ini && d.dia <= to);
  const novos = ds.filter(d => d.dia >= NOVOS_DESDE && Object.keys(d).length > 1), comDado = ds.filter(d => Object.keys(d).length > 1);
  const s = (arr, k) => arr.reduce((a, d) => a + (d[k] || 0), 0);
  const nNovos = novos.length, nAnt = comDado.length;
  const e = { n: ds.length, nNovos, nAnt, recortado: from < primeiro };
  e.ini = nNovos ? s(novos, 'leads_novos') : null; e.desp = nNovos ? s(novos, 'descartados') : null; e.interv = nNovos ? s(novos, 'intervencoes') : null;
  e.assumiu = nNovos ? s(novos, 'assumiu') : null; e.pediu = nNovos ? s(novos, 'pediram_humano') : null; e.esc = nNovos ? s(novos, 'escalados') : null; e.redes = nNovos ? s(novos, 'redes') : null; e.pararam = nNovos ? s(novos, 'pararam') : null;
  e.qual = nAnt ? s(comDado, 'qualificados') : null; e.turnos = nAnt ? s(comDado, 'turnos') : null; e.turnosIa = nAnt ? s(comDado, 'turnos_ia') : null; e.padrao = nAnt ? s(comDado, 'turnos_padrao') : null;
  e.completoNovo = !e.recortado && nNovos === ds.length && ds.length === diff(from, to) + 1;
  e.completoAnt = !e.recortado && nAnt === ds.length && ds.length === diff(from, to) + 1;
  // custo
  const sc = ana.custo.serie.filter(x => x.dia >= ini && x.dia <= to);
  e.usd = sc.reduce((a, x) => a + x.total, 0); e.sTurnos = sc.reduce((a, x) => a + x.turnos, 0); e.sQual = sc.reduce((a, x) => a + x.qualificados, 0);
  const scN = sc.filter(x => x.dia >= NOVOS_DESDE); e.usdN = scN.reduce((a, x) => a + x.total, 0); e.leadsN = scN.reduce((a, x) => a + x.leads, 0);
  e.tts = sc.reduce((a, x) => a + x.tts.usd, 0); e.ttsChars = sc.reduce((a, x) => a + x.tts.caracteres, 0);
  e.mod = {}; sc.forEach(x => Object.entries(x.porModelo).forEach(([k, v]) => { e.mod[k] = (e.mod[k] || 0) + v; }));
  let tin = 0, tc = 0; ds.forEach(d => Object.keys(d).forEach(k => { if (k.startsWith('ia_in_')) tin += d[k]; if (k.startsWith('ia_cacheR_')) tc += d[k]; }));
  e.cache = tin + tc > 0 ? tc / (tin + tc) : null; e.tin = tin; e.tc = tc;
  return e;
}

// ---------- medicao de forma (celular e telao) ----------
const MEDE = `(sel) => {
  const root = document.querySelector(sel); if (!root) return { semRoot: true };
  const vw = document.documentElement.clientWidth, out = { h: document.documentElement.scrollWidth - vw, clip: [], vaza: [], bad: [], minFonte: 99, btnPeq: [], n: 0 };
  const R = root.getBoundingClientRect();
  root.querySelectorAll('*').forEach(e => {
    if (e.closest('svg') && e.tagName !== 'svg') return;
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
    const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!own) return;
    out.n++;
    if ((e.scrollWidth > e.clientWidth + 1 && cs.display !== 'inline' && cs.overflowX !== 'visible') || (cs.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth)) out.clip.push((e.className || e.tagName) + ': ' + e.textContent.trim().slice(0, 30));
    if (cs.overflowY !== 'visible' && e.scrollHeight > e.clientHeight + 2 && cs.display !== 'inline') out.clip.push('altura ' + (e.className || e.tagName) + ': ' + e.textContent.trim().slice(0, 30));
    if (r.right > R.right + 1 || r.left < R.left - 1) out.vaza.push((e.className || e.tagName) + ' ' + Math.round(r.right - R.right));
    out.minFonte = Math.min(out.minFonte, parseFloat(cs.fontSize));
  });
  root.querySelectorAll('button').forEach(b => { const r = b.getBoundingClientRect(); if (r.width && r.height && (r.height < 20 || r.width < 20)) out.btnPeq.push(b.textContent.trim().slice(0, 15) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); });
  const tx = root.textContent || ''; const m = /NaN|undefined|Infinity|\\[object|null/.exec(tx); if (m) out.bad.push(m[0]);
  return out;
}`;
async function mede(f, sel, tag, minFonte = 8.5, minTexto = 10) {
  const m = await f().evaluate(eval(MEDE), sel);
  if (m.semRoot) { ok(false, tag + ': bloco ' + sel + ' nao existe'); return; }
  ok(m.h <= 0, tag + ': rolagem lateral ' + m.h);
  ok(m.clip.length === 0, tag + ': texto cortado ' + m.clip.slice(0, 3).join(' | '));
  ok(m.vaza.length === 0, tag + ': conteudo vaza do bloco ' + m.vaza.slice(0, 3).join(' | '));
  ok(m.bad.length === 0, tag + ': texto invalido ' + m.bad);
  ok(m.minFonte >= minFonte, tag + ': fonte minima ' + m.minFonte + 'px');
  ok(m.btnPeq.length === 0, tag + ': alvo pequeno ' + m.btnPeq.join(','));
  ok(m.n > minTexto, tag + ': quase sem texto (' + m.n + ')');
}
async function meTv(f, p, W, H, tag) { // mesma auditoria dos testes do telao (3 niveis de tipografia, cortes, sobreposicao), por pagina
  const n = await f().evaluate(() => window.__pg ? window.__pg.count() : 1);
  for (let k = 1; k <= n; k++) {
    await f().evaluate(k => window.__pg && window.__pg.set(k, true), k); await p.waitForTimeout(700);
    const r = await f().evaluate(AUD); const v = violacoes(r, W, H).filter(x => !/Como funci/.test(x)); // link "Como funciona" do rodape: pre-existente em todas as abas
    ok(v.length === 0, tag + ' p' + k + '/' + n + ': ' + v.slice(0, 4).join(' | '));
  }
  return n;
}

// =====================================================================================
// 1) NUMEROS, SELETORES E FILTROS (celular 390 e telao 1800x1012)
// =====================================================================================
for (const [W, H, tv] of [[390, 844, false], [1800, 1012, true]]) {
  const nome = (tv ? 'telao ' : 'celular ') + W + 'x' + H;
  cab('numeros, seletores e filtros: ' + nome);
  const { ctx, p, f } = await abrir(W, H, tv);
  await ir(f, 'sdr'); await p.waitForTimeout(3500);
  // Felipe continua como era
  let kf = await kpisEm(f, '#s2-root');
  ok(['Iniciados', 'Finalizados', 'Qualificados', 'Perdidos pelo SDR', 'Conversão', 'Cadência esgotada', 'Em cadência agora', 'Fim da cadência', 'Tempo até qualificar', 'Atividades'].every(k => k in kf), nome + ': cartoes do Felipe mudaram: ' + Object.keys(kf).join(','));
  ok(await f().evaluate(() => !![...document.querySelectorAll('#s2-root button[data-ag]')].length && document.querySelector('#s2-root button[data-ag="felipe"].on') !== null), nome + ': seletor Felipe | Ana nao aparece ou Felipe nao e o padrao');
  await agente(f, 'ana'); await p.waitForTimeout(1500);
  const rotulos = ['Iniciados', 'Qualificados', 'Dispensados', 'Taxa de qualificação', 'Em conversa agora', 'Intervenções humanas', 'Encaminhados ao Felipe', 'Sem resposta', 'Tempo até qualificar', 'Turnos da Ana'];
  let ka = await kpisEm(f, '#s2-root');
  ok(rotulos.every(k => k in ka), nome + ': faltam cartoes da Ana: ' + rotulos.filter(k => !(k in ka)).join(','));
  ok(await f().evaluate(() => document.querySelector('#s2-root button[data-ag="ana"].on') !== null), nome + ': Ana nao ficou marcada');
  const cabec = await f().evaluate(() => document.querySelector('#s2-root .s2-ttl').textContent);
  ok(/SDR \(Ana\)/.test(cabec), nome + ': titulo ' + cabec);
  for (const pd of ['today', 'month', 'prev_month', '30d', 'week', 'yesterday', 'total']) {
    await per(f, pd); await p.waitForTimeout(1500);
    const pp = await periodo(f); const e = esperado(FX.ana, pp.from, pp.to); const pv = prevPer(pp.from, pp.to > HOJE ? HOJE : pp.to);
    const ep = pp.from <= '2020-01-02' ? null : esperado(FX.ana, pv.from, pv.to);
    ka = await kpisEm(f, '#s2-root'); const tag = nome + ' [' + pd + ' ' + pp.from + ' a ' + pp.to + ']';
    const val = (k) => nint(ka[k].v);
    ok(e.ini == null ? /^n\/d/.test(ka['Iniciados'].v.trim()) : val('Iniciados') === e.ini, tag + ': Iniciados ' + ka['Iniciados'].v + ' esperado ' + e.ini);
    ok(e.qual == null ? /^n\/d/.test(ka['Qualificados'].v.trim()) : val('Qualificados') === e.qual, tag + ': Qualificados ' + ka['Qualificados'].v + ' esperado ' + e.qual);
    ok(e.desp == null ? /^n\/d/.test(ka['Dispensados'].v.trim()) : val('Dispensados') === e.desp, tag + ': Dispensados ' + ka['Dispensados'].v + ' esperado ' + e.desp);
    ok(e.interv == null ? /^n\/d/.test(ka['Intervenções humanas'].v.trim()) : val('Intervenções humanas') === e.interv, tag + ': Intervencoes ' + ka['Intervenções humanas'].v + ' esperado ' + e.interv);
    ok(e.esc == null ? /^n\/d/.test(ka['Encaminhados ao Felipe'].v.trim()) : val('Encaminhados ao Felipe') === e.esc, tag + ': Encaminhados ' + ka['Encaminhados ao Felipe'].v + ' esperado ' + e.esc);
    ok(e.pararam == null ? /^n\/d/.test(ka['Sem resposta'].v.trim()) : val('Sem resposta') === e.pararam, tag + ': Sem resposta ' + ka['Sem resposta'].v + ' esperado ' + e.pararam);
    ok(e.turnos == null ? /^n\/d/.test(ka['Turnos da Ana'].v.trim()) : val('Turnos da Ana') === e.turnos, tag + ': Turnos ' + ka['Turnos da Ana'].v + ' esperado ' + e.turnos);
    // taxa de qualificacao = qual / ini
    const taxa = e.ini > 0 && e.qual != null ? (Math.round(e.qual / e.ini * 1000) / 10).toString().replace('.', ',') + '%' : 'n/d';
    ok(ka['Taxa de qualificação'].v.trim().startsWith(taxa), tag + ': Taxa ' + ka['Taxa de qualificação'].v + ' esperado ' + taxa);
    // em conversa agora vem da rota (nao muda com o periodo)
    ok(val('Em conversa agora') === FX.ana.agora.conversas, tag + ': Em conversa agora ' + ka['Em conversa agora'].v);
    // cobertura / sem dado nunca vira zero inventado
    if (e.nNovos === 0) ok(/n\/d/.test(ka['Iniciados'].v) && /existe desde 11\/11|sem registro/.test(ka['Iniciados'].t), tag + ': sem dado ainda deveria dizer "existe desde 11/11": ' + ka['Iniciados'].t);
    if (e.nNovos > 0 && e.nNovos < e.n) ok(/só desde 11\/11|registro em/.test(ka['Iniciados'].t), tag + ': cobertura parcial nao avisada: ' + ka['Iniciados'].t);
    // setinha so com periodo anterior completo
    const dIni = /[▲▼=]/.test(ka['Iniciados'].v), dQ = /[▲▼=]/.test(ka['Qualificados'].v);
    const okPrevNovo = ep && e.completoNovo && ep.completoNovo, okPrevAnt = ep && e.completoAnt && ep.completoAnt;
    ok(dIni === !!okPrevNovo, tag + ': seta de Iniciados ' + dIni + ' esperado ' + !!okPrevNovo);
    ok(dQ === !!okPrevAnt, tag + ': seta de Qualificados ' + dQ + ' esperado ' + !!okPrevAnt);
    if (okPrevNovo && dIni) { const d = e.ini - ep.ini; ok(new RegExp('[▲▼=]\\s*' + (d > 0 ? '\\+' : '') + d + '$').test(ka['Iniciados'].v.trim()), tag + ': delta Iniciados ' + ka['Iniciados'].v + ' esperado ' + d); }
    if (okPrevAnt && dQ) { const d = e.qual - ep.qual; ok(new RegExp('[▲▼=]\\s*' + (d > 0 ? '\\+' : '') + d + '$').test(ka['Qualificados'].v.trim()), tag + ': delta Qualificados ' + ka['Qualificados'].v + ' esperado ' + d); }
    if (pd === 'month' || pd === 'today') console.log('  ' + tag + ' Iniciados ' + ka['Iniciados'].v.trim() + ' | Qualificados ' + ka['Qualificados'].v.trim() + ' | Dispensados ' + ka['Dispensados'].v.trim() + ' | Taxa ' + ka['Taxa de qualificação'].v.trim());
  }
  // lista com link do Agendor (periodo mes)
  await per(f, 'month'); await p.waitForTimeout(1500);
  const pm = await periodo(f);
  for (const [go, filtro] of [['ini', d => d.created_at.slice(0, 10) >= pm.from && d.created_at.slice(0, 10) <= pm.to], ['qual', d => ['Qualificado', 'Repassado'].includes(d.stage_name) && (d.end_time || d.created_at).slice(0, 10) >= pm.from && (d.end_time || d.created_at).slice(0, 10) <= pm.to], ['conv', d => ['Novo lead', 'Em conversa'].includes(d.stage_name)]]) {
    await f().evaluate(() => document.getElementById('modal-overlay') && document.getElementById('modal-overlay').classList.remove('show'));
    await f().evaluate(g => { const k = document.querySelector('#s2-root .s2-k[data-ag-go="' + g + '"]'); if (k) k.click(); }, go); await p.waitForTimeout(500);
    const m = await f().evaluate(() => ({ show: document.getElementById('modal-overlay').classList.contains('show'), hrefs: [...document.querySelectorAll('#modal-body a.mdeal-row')].map(a => a.getAttribute('href')), title: document.getElementById('modal-title').textContent }));
    const esp = FX.deals.filter(filtro).length;
    ok(m.show, nome + ': lista ' + go + ' nao abriu'); ok(m.hrefs.length === esp, nome + ': lista ' + go + ' com ' + m.hrefs.length + ' negocios, esperado ' + esp);
    ok(m.hrefs.every(h => /^https:\/\/web\.agendor\.com\.br\/sistema\/negocios\/historico\.php\?id=\d+$/.test(h)), nome + ': link do Agendor invalido ' + m.hrefs[0]);
    const mo = await f().evaluate(() => { const b = document.getElementById('modal-body'); return { h: b.scrollWidth - b.clientWidth }; }); ok(mo.h <= 1, nome + ': lista ' + go + ' com rolagem lateral');
  }
  await f().evaluate(() => document.getElementById('modal-overlay').classList.remove('show'));
  // funil por etapa: contagens e clique na etapa
  const funil = await f().evaluate(() => [...document.querySelectorAll('#s2-root tr[data-ag-go^="et:"]')].map(tr => ({ nome: tr.children[0].textContent.trim(), agora: tr.children[1].textContent.trim(), criados: tr.children[2].textContent.trim() })));
  const ETAPAS = ['Novo lead', 'Em conversa', 'Qualificado', 'Repassado', 'Sem resposta', 'Encerrado'];
  ok(funil.length === 6 && ETAPAS.every((n, i) => funil[i] && funil[i].nome === n), nome + ': funil por etapa fora de ordem/incompleto ' + JSON.stringify(funil.map(x => x.nome)));
  ETAPAS.forEach((n, i) => { const ag = FX.deals.filter(d => d.stage_name === n).length; const cr = FX.deals.filter(d => d.stage_name === n && d.created_at.slice(0, 10) >= pm.from && d.created_at.slice(0, 10) <= pm.to).length; if (funil[i]) { ok((funil[i].agora === '·' ? 0 : nint(funil[i].agora)) === ag, nome + ': funil ' + n + ' agora ' + funil[i].agora + ' esperado ' + ag); ok((funil[i].criados === '·' ? 0 : nint(funil[i].criados)) === cr, nome + ': funil ' + n + ' criados ' + funil[i].criados + ' esperado ' + cr); } });
  // tempo ate qualificar: deals qualificados no periodo com data de fechamento
  const tq = FX.deals.filter(d => ['Qualificado', 'Repassado'].includes(d.stage_name) && d.end_time && d.end_time.slice(0, 10) >= pm.from && d.end_time.slice(0, 10) <= pm.to).map(d => diff(d.created_at.slice(0, 10), d.end_time.slice(0, 10)));
  ka = await kpisEm(f, '#s2-root');
  ok(tq.length ? ka['Tempo até qualificar'].v.trim() === dec1(tq.reduce((a, b) => a + b, 0) / tq.length) + ' d' : /n\/d/.test(ka['Tempo até qualificar'].v), nome + ': tempo ate qualificar ' + ka['Tempo até qualificar'].v + ' esperado media de ' + JSON.stringify(tq));
  // filtro de origem do topo
  await ori(f, 'outbound'); await p.waitForTimeout(1200);
  let txt = await f().evaluate(() => document.querySelector('#s2-root').innerText);
  ok(/Outbound/.test(txt) && /não há números dela/.test(txt) && !(await f().evaluate(() => !!document.querySelector('#s2-root .s2-k'))), nome + ': Outbound deveria mostrar aviso e nenhum cartao');
  await ori(f, 'inbound'); await p.waitForTimeout(1200);
  const kIn = await kpisEm(f, '#s2-root'); ok(JSON.stringify(Object.values(kIn).map(x => x.v)) === JSON.stringify(Object.values(ka).map(x => x.v)), nome + ': Inbound deveria ser igual a Ambos');
  await ori(f, 'both'); await p.waitForTimeout(800);
  // gran (so celular)
  if (!tv) {
    await f().evaluate(() => { const b = document.querySelector('#s2-root button[data-ag-gran="s"]'); if (b) b.click(); }); await p.waitForTimeout(500);
    ok(await f().evaluate(() => /por semana/.test(document.querySelector('#s2-root svg.s2-chart').getAttribute('aria-label'))), nome + ': botao Semana nao trocou o grafico');
    await f().evaluate(() => { const b = document.querySelector('#s2-root button[data-ag-gran="m"]'); if (b) b.click(); }); await p.waitForTimeout(500);
    ok(await f().evaluate(() => /por mês/.test(document.querySelector('#s2-root svg.s2-chart').getAttribute('aria-label'))), nome + ': botao Mes nao trocou o grafico');
  }
  // volta ao Felipe: tudo como antes
  await agente(f, 'felipe'); await p.waitForTimeout(1500);
  kf = await kpisEm(f, '#s2-root'); ok('Perdidos pelo SDR' in kf && !('Dispensados' in kf), nome + ': voltar ao Felipe nao restaurou a visao dele');
  await agente(f, 'ana'); await p.waitForTimeout(800); await agente(f, 'felipe');

  // ---- aba Agentes ----
  await ir(f, 'bia'); await p.waitForTimeout(2500);
  const bar = await f().evaluate(() => { const b = document.getElementById('ag-bar'); const r = b && b.getBoundingClientRect(); return { vis: !!r && r.height > 0, txt: b ? b.innerText : '', ativo: b && b.querySelector('.ochip.active') ? b.querySelector('.ochip.active').textContent : '' }; });
  ok(bar.vis && /Bia/.test(bar.txt) && /Ana/.test(bar.txt) && bar.ativo === 'Bia', nome + ': seletor Bia | Ana nao aparece com Bia ativa: ' + JSON.stringify(bar));
  ok(await f().evaluate(() => document.querySelector('.ochip[data-v="bia"]').textContent.trim() === 'AGENTES'), nome + ': aba nao foi renomeada para AGENTES');
  const biaVis = () => f().evaluate((tvv) => { const e = document.getElementById(tvv ? 'bia-hero-row' : 'bia-view'); const r = e.getBoundingClientRect(); return r.height > 0 && getComputedStyle(e).display !== 'none'; }, tv);
  ok(await biaVis(), nome + ': conteudo da Bia sumiu com a aba Agentes');
  await aba(f, 'ana'); await per(f, 'month'); await p.waitForTimeout(2000);
  ok(!(await biaVis()), nome + ': conteudo da Bia continua visivel na visao da Ana');
  ok(await f().evaluate(() => { const r = document.getElementById('ag-root').getBoundingClientRect(); return r.height > 0; }), nome + ': painel da Ana nao apareceu');
  for (const pd of ['today', 'month', 'prev_month', '30d', 'total']) {
    await per(f, pd); await p.waitForTimeout(1500);
    const pp = await periodo(f), e = esperado(FX.ana, pp.from, pp.to), kk = await kpisEm(f, '#ag-root'), tag = nome + ' saude [' + pd + ' ' + pp.from + ' a ' + pp.to + ']';
    ok(kk['Custo no período'].v.trim() === fU(e.usd), tag + ': custo ' + kk['Custo no período'].v + ' esperado ' + fU(e.usd));
    ok(kk['Custo em reais'].v.trim() === fR(e.usd * COT), tag + ': custo em reais ' + kk['Custo em reais'].v + ' esperado ' + fR(e.usd * COT));
    ok(/estimativa/.test(kk['Custo em reais'].t), tag + ': reais sem rotulo de estimativa');
    ok(e.sTurnos > 0 ? kk['Por turno'].v.trim() === fU(e.usd / e.sTurnos) : /n\/d/.test(kk['Por turno'].v), tag + ': por turno ' + kk['Por turno'].v);
    ok(e.sQual > 0 ? kk['Por qualificado'].v.trim() === fU(e.usd / e.sQual) : /n\/d/.test(kk['Por qualificado'].v), tag + ': por qualificado ' + kk['Por qualificado'].v);
    ok(e.nNovos > 0 && e.leadsN > 0 ? kk['Por lead novo'].v.trim() === fU(e.usdN / e.leadsN) : /n\/d/.test(kk['Por lead novo'].v), tag + ': por lead ' + kk['Por lead novo'].v);
    ok(kk['Projeção do mês'].v.trim() === fU(12.3456), tag + ': projecao ' + kk['Projeção do mês'].v);
    ok(e.cache == null ? /n\/d/.test(kk['Acerto de cache'].v) : kk['Acerto de cache'].v.trim() === dec1(e.cache * 100) + '%', tag + ': cache ' + kk['Acerto de cache'].v + ' esperado ' + (e.cache && dec1(e.cache * 100)));
    ok(e.turnos > 0 ? kk['Escritos pela IA'].v.trim() === (Math.round(e.turnosIa / e.turnos * 1000) / 10).toString().replace('.', ',') + '%' : /n\/d/.test(kk['Escritos pela IA'].v), tag + ': escritos pela IA ' + kk['Escritos pela IA'].v);
    ok(nint(kk['Conversas agora'].v) === FX.ana.agora.conversas, tag + ': conversas agora');
    ok(/Ao vivo/.test(kk['Situação'].v) && /voz ligada/.test(kk['Situação'].t), tag + ': situacao ' + kk['Situação'].v + ' / ' + kk['Situação'].t);
    // custo por modelo (tabela) e voz
    const tab = await f().evaluate(() => [...document.querySelectorAll('#ag-root .s2-card')].filter(c => /custo por modelo/i.test(c.textContent)).map(c => [...c.querySelectorAll('tbody tr')].map(tr => [...tr.children].map(td => td.textContent.trim())))[0] || []);
    const mapa = { 'Claude Sonnet 5.5': 'claude-sonnet', 'Claude Haiku 5.5': 'claude-haiku', 'Reserva (OpenRouter)': 'openrouter-reserva' };
    tab.forEach(row => { const k = mapa[row[0]]; if (k) ok(row[1] === fU(e.mod[k] || 0).replace('US$ ', ''), tag + ': modelo ' + row[0] + ' ' + row[1] + ' esperado ' + fU(e.mod[k] || 0)); else if (/Voz/.test(row[0])) ok(row[1] === fU(e.tts).replace('US$ ', ''), tag + ': voz ' + row[1] + ' esperado ' + fU(e.tts)); });
    ok(tab.length === 4, tag + ': tabela de modelos com ' + tab.length + ' linhas');
    const chars = await f().evaluate(() => (/([\d.]+) caracteres falados/.exec(document.querySelector('#ag-root').textContent) || [])[1]);
    ok(chars && parseInt(chars.replace(/\./g, ''), 10) === (e.n && FX.ana.dias.filter(d => d.dia >= (pp.from > FX.ana.dias[0].dia ? pp.from : FX.ana.dias[0].dia) && d.dia <= (pp.to > HOJE ? HOJE : pp.to)).reduce((a, d) => a + (d.tts_caracteres || 0), 0)), tag + ': caracteres falados ' + chars);
    // grafico diario de custo: uma barra por dia do periodo
    const nb = await f().evaluate(() => { const c = [...document.querySelectorAll('#ag-root .s2-card')].find(x => /custo por dia/i.test(x.textContent)); return c ? c.querySelectorAll('svg rect').length : -1; });
    const ds = e.n > 31 ? Math.ceil(e.n / 7) : e.n; ok(nb >= 1 && nb <= e.n + 1, tag + ': barras do grafico de custo ' + nb + ' (periodo ' + e.n + ' dias)');
    // intervencao e turnos: assumiu / devolveu
    const iv = await f().evaluate(() => { const tr = [...document.querySelectorAll('#ag-root tr')].find(x => /Equipe assumiu a conversa/.test(x.children[0].textContent)); return tr ? tr.children[1].textContent.trim() : undefined; });
    const esAss = FX.ana.dias.filter(d => d.dia >= pp.from && d.dia <= (pp.to > HOJE ? HOJE : pp.to) && d.dia >= NOVOS_DESDE).reduce((a, d) => a + (d.assumiu || 0), 0);
    ok(iv !== undefined && (e.nNovos ? nint(iv) === esAss : /n\/d/.test(iv)), tag + ': assumiu ' + iv + ' esperado ' + esAss);
  }
  // volta a Bia: conteudo de sempre
  await aba(f, 'bia'); await p.waitForTimeout(1200);
  ok(await biaVis(), nome + ': voltar a Bia nao restaurou o conteudo');
  ok(await f().evaluate(() => document.getElementById('ag-root').getBoundingClientRect().height === 0), nome + ': painel da Ana continua visivel na Bia');
  // outra aba: nada da Ana vaza
  await ir(f, 'vendas'); await p.waitForTimeout(1200);
  ok(await f().evaluate(() => !document.body.classList.contains('ag-ana') && document.getElementById('ag-root').getBoundingClientRect().height === 0 && document.getElementById('ag-bar').getBoundingClientRect().height === 0), nome + ': Ana vazou para a aba Vendas');
  const jsErr = [...new Set(p.errs)]; ok(jsErr.length === 0, nome + ': erros JS ' + jsErr.slice(0, 3).join(' | '));
  await ctx.close();
}

// =====================================================================================
// 2) ESTADOS: erro, atrasado, parada de emergencia, sombra, sem dado, negocios indisponiveis
// =====================================================================================
for (const [W, H, tv] of [[390, 844, false], [1800, 1012, true]]) {
  const nome = (tv ? 'telao ' : 'celular ') + W + 'x' + H;
  cab('estados: ' + nome);
  // erro 500 na rota da Ana, depois recupera pelo botao
  let s = await abrir(W, H, tv, { modo: 'err500', espera: 5000 }); let { p, f } = s;
  await ir(f, 'sdr'); await p.waitForTimeout(2500); await agente(f, 'ana'); await p.waitForTimeout(2500);
  let t = await f().evaluate(() => document.querySelector('#s2-root').innerText);
  ok(/Não consegui ler os dados da Ana/.test(t) && /Tentar de novo/.test(t), nome + ': erro sem mensagem/botao: ' + t.slice(0, 120));
  p.fx.modo = 'ok'; await clica(f, '#s2-root button[data-ag-retry="ana"]'); await p.waitForTimeout(2500);
  ok(await f().evaluate(() => !!document.querySelector('#s2-root .s2-k')), nome + ': "Tentar de novo" nao recuperou');
  await ir(f, 'bia'); await aba(f, 'ana'); await per(f, 'month'); await p.waitForTimeout(1500);
  ok(await f().evaluate(() => !!document.querySelector('#ag-root .s2-k')), nome + ': Agentes Ana nao reaproveitou a leitura recuperada');
  await s.ctx.close();
  // Agentes > Ana com erro na rota
  s = await abrir(W, H, tv, { modo: 'err500', espera: 5000 }); ({ p, f } = s);
  await ir(f, 'bia'); await aba(f, 'ana'); await p.waitForTimeout(2500);
  t = await f().evaluate(() => document.querySelector('#ag-root').innerText);
  ok(/Não consegui ler os dados da Ana/.test(t) && /Tentar de novo/.test(t), nome + ': Agentes Ana com erro sem mensagem/botao: ' + t.slice(0, 120));
  await mede(f, '#ag-root', nome + ' Agentes Ana erro', 8.5, 2);
  p.fx.modo = 'ok'; await clica(f, '#ag-root button[data-ag-retry="ana"]'); await p.waitForTimeout(2500);
  ok(await f().evaluate(() => !!document.querySelector('#ag-root .s2-k')), nome + ': Agentes Ana "Tentar de novo" nao recuperou');
  await s.ctx.close();
  // atrasado (3 h)
  s = await abrir(W, H, tv, { ana: makeAna({ geradoEm: Date.parse(AGORA_ISO) - 3 * 3600000 }), espera: 5000 }); ({ p, f } = s);
  await ir(f, 'sdr'); await p.waitForTimeout(2000); await agente(f, 'ana'); await p.waitForTimeout(2000);
  t = await f().evaluate(() => document.querySelector('#s2-root .s2-ttl').innerText);
  ok(/atrasado/.test(t), nome + ': dado de 3h nao aparece como atrasado: ' + t);
  await ir(f, 'bia'); await aba(f, 'ana'); await p.waitForTimeout(1500);
  t = await f().evaluate(() => document.querySelector('#ag-root .s2-ttl').innerText); ok(/atrasado/.test(t), nome + ': painel de saude sem aviso de atrasado');
  await s.ctx.close();
  // parada de emergencia, voz desligada
  s = await abrir(W, H, tv, { ana: makeAna({ killSwitch: true, voz: false }), espera: 5000 }); ({ p, f } = s);
  await ir(f, 'bia'); await aba(f, 'ana'); await p.waitForTimeout(2000);
  let kk = await kpisEm(f, '#ag-root'); ok(/Parada de emergência/.test(kk['Situação'].v) && /voz desligada/.test(kk['Situação'].t), nome + ': parada de emergencia ' + JSON.stringify(kk['Situação']));
  await s.ctx.close();
  // sombra
  s = await abrir(W, H, tv, { ana: makeAna({ modo: 'sombra' }), espera: 5000 }); ({ p, f } = s);
  await ir(f, 'bia'); await aba(f, 'ana'); await p.waitForTimeout(2000);
  kk = await kpisEm(f, '#ag-root'); ok(/Sombra/.test(kk['Situação'].v), nome + ': modo sombra ' + kk['Situação'].v);
  await s.ctx.close();
  // API sem nenhum dado (dias so com {dia}) e sem custo: nunca zero inventado, nada de NaN
  const vazio = { ok: true, geradoEm: Date.parse(AGORA_ISO), modo: 'ao_vivo', killSwitch: false, vozLigada: false, dias: makeAna().dias.map(d => ({ dia: d.dia })), custo: { serie: makeAna().custo.serie.map(x => ({ dia: x.dia, total: 0, porModelo: {}, tts: { caracteres: 0, usd: 0 }, leads: 0, qualificados: 0, turnos: 0 })), total: { usd: 0 }, projecaoMesUsd: 0 }, agora: { conversas: 0, porEstagio: {}, comHumano: 0, pausadas: 0, aguardandoPessoa: 0 }, arquivo: { mensagens: 0, conversas: 0 } };
  s = await abrir(W, H, tv, { ana: vazio, deals: [], espera: 5000 }); ({ p, f } = s);
  await ir(f, 'sdr'); await p.waitForTimeout(2000); await agente(f, 'ana'); await per(f, 'month'); await p.waitForTimeout(2000);
  let ka = await kpisEm(f, '#s2-root');
  ok(['Iniciados', 'Qualificados', 'Dispensados', 'Intervenções humanas', 'Turnos da Ana'].every(k => /^n\/d/.test(ka[k].v.trim())), nome + ': sem dado deveria ser n/d, nunca zero: ' + JSON.stringify(Object.fromEntries(Object.entries(ka).map(([k, v]) => [k, v.v.trim()]))));
  await mede(f, '#s2-root', nome + ' sem dado SDR');
  await ir(f, 'bia'); await aba(f, 'ana'); await per(f, 'month'); await p.waitForTimeout(2000);
  kk = await kpisEm(f, '#ag-root'); ok(/sem uso/.test(kk['Custo no período'].t) || /US\$ 0,0000/.test(kk['Custo no período'].v), nome + ': custo sem uso ' + JSON.stringify(kk['Custo no período']));
  ok(['Por lead novo', 'Por qualificado', 'Por turno'].every(k => /n\/d/.test(kk[k].v)), nome + ': divisao por zero deveria ser n/d: ' + JSON.stringify(['Por lead novo', 'Por qualificado', 'Por turno'].map(k => kk[k].v)));
  await mede(f, '#ag-root', nome + ' sem dado saude');
  ok([...new Set(p.errs)].length === 0, nome + ': erros JS ' + [...new Set(p.errs)].slice(0, 3).join(' | '));
  await s.ctx.close();
  // negocios do funil indisponiveis: funil mostra erro, KPIs da API seguem
  s = await abrir(W, H, tv, { modo: 'dealserr', espera: 5000 }); ({ p, f } = s);
  await ir(f, 'sdr'); await p.waitForTimeout(2000); await agente(f, 'ana'); await per(f, 'month'); await p.waitForTimeout(3500);
  t = await f().evaluate(() => document.querySelector('#s2-root').innerText);
  ok(/Não consegui ler os negócios do funil da Ana/.test(t) && /Tentar de novo/.test(t), nome + ': falha dos negocios do funil sem aviso');
  ka = await kpisEm(f, '#s2-root'); ok(nint(ka['Iniciados'].v) !== null, nome + ': KPIs da API deveriam seguir com o funil fora');
  await s.ctx.close();
}

// =====================================================================================
// 3) FORMA: nada cortado, sem rolagem lateral, tipografia (celular 320 a 1920; telao 4 formatos x 2 paginas)
// =====================================================================================
const CELULARES = [[320, 700], [360, 740], [390, 844], [430, 932], [768, 1024], [1366, 768], [1920, 1080]];
for (const [W, H] of (RAPIDO ? [[320, 700], [768, 1024]] : CELULARES)) {
  const nome = 'celular ' + W + 'x' + H; cab('forma: ' + nome);
  const { ctx, p, f } = await abrir(W, H, false, { espera: 6500 });
  await ir(f, 'sdr'); await p.waitForTimeout(2500); await agente(f, 'ana');
  for (const pd of ['month', 'today', 'prev_month']) {
    await per(f, pd); await p.waitForTimeout(1800);
    await mede(f, '#s2-root', nome + ' SDR Ana ' + pd, 8.5);
  }
  // detalhe: tabela de funil e grafico dentro do bloco, cartoes sem espaco vazio gigante
  const cards = await f().evaluate(() => [...document.querySelectorAll('#s2-root div.s2-card')].map(c => { const r = c.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), t: (c.querySelector('.s2-ct') || {}).textContent }; }));
  ok(cards.length >= 5, nome + ': cartoes da Ana ' + cards.length);
  ok(cards.every(c => c.h > 60 && c.w > 140), nome + ': cartao achatado/estreito ' + JSON.stringify(cards.filter(c => !(c.h > 60 && c.w > 140))));
  await ir(f, 'bia'); await aba(f, 'ana');
  for (const pd of ['month', 'today', '30d']) {
    await per(f, pd); await p.waitForTimeout(1800);
    await mede(f, '#ag-root', nome + ' Agentes Ana ' + pd, 8.5);
  }
  const cards2 = await f().evaluate(() => [...document.querySelectorAll('#ag-root .s2-card')].map(c => { const r = c.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; }));
  ok(cards2.length === 6 && cards2.every(c => c.h > 60 && c.w > 140), nome + ': cartoes da saude ' + JSON.stringify(cards2));
  // barra do seletor Bia | Ana e abas do topo sem estouro
  const topo = await f().evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); ok(topo <= 0, nome + ': rolagem lateral da pagina ' + topo);
  const modo = await f().evaluate(() => { const b = document.getElementById('ag-bar').getBoundingClientRect(); return b.right <= document.documentElement.clientWidth + 1; }); ok(modo, nome + ': seletor Bia|Ana fora da tela');
  ok([...new Set(p.errs)].length === 0, nome + ': erros JS ' + [...new Set(p.errs)].slice(0, 3).join(' | '));
  await ctx.close();
}
for (const [W, H] of (RAPIDO ? [[1800, 1012], [1366, 768]] : [[1800, 1012], [1366, 768], [1920, 1080], [3840, 2160]])) {
  const nome = 'telao ' + W + 'x' + H; cab('forma: ' + nome);
  const { ctx, p, f } = await abrir(W, H, true, { espera: 7000 });
  await ir(f, 'sdr'); await p.waitForTimeout(2500); await agente(f, 'ana'); await p.waitForTimeout(1500);
  ok(await f().evaluate(() => window.__pg.count()) === 2, nome + ': SDR Ana deveria ter 2 paginas');
  for (const pd of ['month', 'today']) { await per(f, pd); await p.waitForTimeout(1800); await mede(f, '#s2-root', nome + ' SDR Ana ' + pd, 8.5); await meTv(f, p, W, H, nome + ' SDR Ana ' + pd); }
  await agente(f, 'felipe'); await p.waitForTimeout(1500);
  ok(await f().evaluate(() => window.__pg.count()) === 3, nome + ': voltar ao Felipe deveria restaurar 3 paginas');
  await ir(f, 'bia'); await aba(f, 'ana'); await p.waitForTimeout(1500);
  ok(await f().evaluate(() => window.__pg.count()) === 2, nome + ': Agentes Ana deveria ter 2 paginas');
  for (const pd of ['month', 'today']) { await per(f, pd); await p.waitForTimeout(1800); await mede(f, '#ag-root', nome + ' Agentes Ana ' + pd, 8.5); await meTv(f, p, W, H, nome + ' Agentes Ana ' + pd); }
  // nomes das paginas no rodape
  await f().evaluate(() => window.__pg.set(1, true)); await p.waitForTimeout(400);
  ok(await f().evaluate(() => /Custo e modelos/.test(document.getElementById('pg-t') ? document.getElementById('pg-t').textContent : '')), nome + ': nome da pagina 1 de Agentes Ana');
  // cartao expandido (telao): abre, tem a lista completa, fecha
  await f().evaluate(() => window.__pg.set(1, true)); await p.waitForTimeout(500);
  const abriu = await f().evaluate(() => { const b = document.querySelector('#ag-root .s2-card .xp-btn'); if (!b) return false; b.click(); return true; }); await p.waitForTimeout(700);
  ok(abriu && await f().evaluate(() => document.getElementById('expandOverlay').classList.contains('show') && document.getElementById('expandModalBody').scrollWidth <= document.getElementById('expandModalBody').clientWidth + 1), nome + ': cartao expandido da Ana nao abriu ou tem rolagem lateral');
  await f().evaluate(() => window.LB_XP && LB_XP.close());
  ok([...new Set(p.errs)].length === 0, nome + ': erros JS ' + [...new Set(p.errs)].slice(0, 3).join(' | '));
  await ctx.close();
}

await browser.close();
console.log('\n' + checks + ' verificacoes, ' + falhas + ' falha(s)');
console.log(falhas ? 'FALHOU' : 'TUDO OK');
process.exit(falhas ? 1 : 0);
