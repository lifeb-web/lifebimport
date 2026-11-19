// TESTE · cartão "Conferência de origem" (19/11/2026), celular 390 e PC 1280.
// Serve a raiz do site; intercepta SÓ as 2 tabelas novas (mock com casos reais anonimizados); o resto lê a D1 real (GET).
// uso: servidor estático na raiz do site em :8765  ->  node t_origem_recon.mjs
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';
const BASE = process.env.DASH_BASE || 'http://localhost:8765/dash/geral/';
const SHOTS = process.env.SHOTS || '/tmp/recon_shots'; mkdirSync(SHOTS, { recursive: true });
const casos = JSON.parse(readFileSync(process.env.CASOS, 'utf8'));
let falhas = 0; const falha = (m) => { falhas++; console.log('  FALHOU: ' + m); }; const ok = (c, m) => { if (!c) falha(m); };
const agora = Date.now(), dia = 86400000;
// mock: fixas (Arena) + pendentes (9 do 28/10) + eventos 7 dias
const fixas = [], eventos = [];
casos.flip_28out.forEach((c, i) => {
  fixas.push({ deal_id: 90000000 + c.id, title: 'Cliente ' + String(c.id).padStart(5, '0'), funnel_id: c.funil, origin: c.snapshot_15out, especial: null, fonte: 'snapshot', confirmada: 1, decisao_origin: null, pendente: 1, pendente_motivo: 'restaurado do snapshot de 15/10', fixed_at: '2026-10-15T03:08:00Z' });
  if (i < 6) eventos.push({ deal_id: 90000000 + c.id, em: new Date(agora - (i + 1) * dia).toISOString(), tipo: 'crm_mudou', de_origin: c.snapshot_15out, para_origin: c.hoje, fonte: 'origem_deal', funnel_id: c.funil, title: 'Cliente ' + String(c.id).padStart(5, '0'), value: c.valor, nota: '' });
});
eventos.push({ deal_id: 1, em: new Date(agora - 30 * dia).toISOString(), tipo: 'crm_mudou', de_origin: 'inbound', para_origin: 'outbound', funnel_id: '890331', title: 'antigo', value: 1 }); // fora da janela
const ganhos = [{ id: 7001, title: 'Cliente 07001', value: 3200, origin: 'outbound', status: 'won', data_real_evento: '2026-11-17' }, { id: 7002, title: 'Cliente 07002', value: 1800, origin: 'outbound', status: 'won', end_time: '2026-11-16T10:00:00Z' }, { id: 7003, title: 'Cliente 07003 com um nome bem comprido de farmacia', value: 912.5, origin: 'inbound', status: 'won', data_real_evento: '2026-11-15' }];
fixas.push({ deal_id: 7001, title: 'Cliente 07001', funnel_id: '890331', origin: 'outbound', fonte: 'padrao', confirmada: 0, pendente: 0 });
fixas.push({ deal_id: 7003, title: 'Cliente 07003', funnel_id: '890331', origin: 'inbound', fonte: 'origem_deal', confirmada: 1, pendente: 0 });
// 7002 sem linha fixa (ainda não gravada)
const lock = '/tmp/chromium.lock';
const { mkdirSync: mk } = await import('node:fs'); const { rmdirSync } = await import('node:fs');
let tem = false; for (let i = 0; i < 120 && !tem; i++) { try { mk(lock); tem = true; } catch (e) { await new Promise(r => setTimeout(r, 5000)); } }
if (!tem) { console.log('sem lock do Chromium'); process.exit(2); }
try {
  const b = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined });
  for (const [w, h, nome] of [[390, 844, 'cel390'], [1280, 900, 'pc1280'], [360, 780, 'cel360']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
    await p.route(/dash_deal_origem_fixa/, r => { const u = r.request().url(); const pend = /pendente=eq\.1/.test(u); const rows = pend ? fixas.filter(f => f.pendente === 1) : fixas.filter(f => String(f.funnel_id) === '890331'); r.fulfill({ status: 200, contentType: 'application/json', headers: { 'content-range': '0-' + (rows.length - 1) + '/' + rows.length, 'access-control-allow-origin': '*', 'access-control-expose-headers': 'content-range' }, body: JSON.stringify(rows) }); });
    await p.route(/dash_deal_origem_eventos/, r => { const rows = eventos.filter(e => Date.parse(e.em) >= agora - 7 * dia); r.fulfill({ status: 200, contentType: 'application/json', headers: { 'content-range': '0-' + (rows.length - 1) + '/' + rows.length, 'access-control-allow-origin': '*', 'access-control-expose-headers': 'content-range' }, body: JSON.stringify(rows) }); });
    await p.route(/dash_geral_deals\?select=id,title,value,origin,status/, r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'content-range': '0-2/3', 'access-control-allow-origin': '*', 'access-control-expose-headers': 'content-range' }, body: JSON.stringify(ganhos) }));
    await p.goto(BASE, { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('#origem-recon .rc-chip', { timeout: 60000 });
    await p.waitForTimeout(1500);
    const txt = await p.$$eval('#origem-recon .rc-chip', els => els.map(e => e.querySelector('b').textContent + '|' + e.querySelector('span').textContent));
    console.log(nome, JSON.stringify(txt));
    ok(txt[0].startsWith('2|'), nome + ': sem origem confirmada deveria ser 2 (07001 provisória + 07002 sem linha), veio ' + txt[0]);
    ok(txt[1].startsWith('6|'), nome + ': mudaram nos últimos 7 dias deveria ser 6, veio ' + txt[1]);
    ok(txt[2].startsWith('10|'), nome + ': aguardando decisão deveria ser 10, veio ' + txt[2]);
    const ov = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    ok(ov.sw <= ov.cw + 1, nome + ': rolagem horizontal ' + ov.sw + '>' + ov.cw);
    const cartao = await p.$('#origem-recon'); await cartao.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    await cartao.screenshot({ path: SHOTS + '/' + nome + '_cartao.png' });
    const menor = await p.$$eval('#origem-recon *', els => Math.min(...els.filter(e => e.children.length === 0 && e.textContent.trim()).map(e => parseFloat(getComputedStyle(e).fontSize))));
    ok(menor >= 12, nome + ': fonte menor que 12px: ' + menor);
    await p.click('#origem-recon .rc-chip[data-q="mud"]'); await p.waitForTimeout(400);
    const lista = await p.$$eval('#modal-body .mdeal-row', e => e.length); ok(lista === 6, nome + ': lista de mudanças com ' + lista);
    await p.screenshot({ path: SHOTS + '/' + nome + '_lista_mudancas.png' });
    await p.evaluate(() => closeModal());
    await p.click('#origem-recon .rc-chip[data-q="sem"]'); await p.waitForTimeout(300);
    ok((await p.$$eval('#modal-body .mdeal-row', e => e.length)) === 2, nome + ': lista sem origem != 2');
    await p.evaluate(() => closeModal());
    ok(erros.length === 0, nome + ': erros de JS ' + erros.join(' | '));
    await ctx.close();
  }
  // lógica pura
  const p2 = await (await b.newContext()).newPage(); await p2.goto(BASE, { waitUntil: 'domcontentloaded' }); await p2.waitForFunction(() => window.OrigemRecon_);
  const r = await p2.evaluate(() => { const C = window.OrigemRecon_.calcular; const t = Date.now();
    return [C([], [], [], t), C([{ id: 1 }], [], [], t), C([{ id: 1 }], [{ deal_id: 1, confirmada: 1 }], [], t), C([{ id: 1 }], [{ deal_id: 1, confirmada: 0, decisao_origin: 'inbound' }], [], t),
      C([], [], [{ deal_id: 5, em: new Date(t - 8 * 86400000).toISOString(), tipo: 'crm_mudou' }], t), C([], [], [{ deal_id: 5, em: new Date(t - 1000).toISOString(), tipo: 'crm_voltou' }], t),
      C([], [], [{ deal_id: 5, em: new Date(t - 1000).toISOString(), tipo: 'crm_mudou' }, { deal_id: 5, em: new Date(t - 2000).toISOString(), tipo: 'crm_mudou' }], t)].map(x => [x.semOrigem.length, x.mudaram.length, x.aguardando.length].join()); });
  const esp = ['0,0,0', '1,0,0', '0,0,0', '0,0,0', '0,0,0', '0,0,0', '0,1,0'];
  r.forEach((v, i) => ok(v === esp[i], 'calcular caso ' + i + ': ' + v + ' != ' + esp[i]));
  await b.close();
} finally { rmdirSync(lock); }
console.log(falhas ? falhas + ' FALHA(S)' : 'OK recon');
process.exit(falhas ? 1 : 0);
