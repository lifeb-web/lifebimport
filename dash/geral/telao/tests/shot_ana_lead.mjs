// Prints da aba SDR (Ana) com os números por lead (19/11). uso: DASH_FIXTURES=... DASH_BASE=... node shot_ana_lead.mjs <pasta de saída>
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
import { EXE, BASE, mocar } from './telao_lib.mjs';
import { makeAna, AGORA_ISO } from './ana_fixture.mjs';
const OUT = process.argv[2] || '/tmp'; const FX = JSON.parse(readFileSync(new URL('./porlead_real_19nov.json', import.meta.url), 'utf8')); const DL = JSON.parse(readFileSync(new URL('./deals_ana_19nov.json', import.meta.url), 'utf8'));
const cors = { 'access-control-allow-origin': '*' };
const browser = await chromium.launch({ executablePath: EXE });
for (const [W, H, nome, tv] of [[390, 844, 'celular390', false], [1280, 900, 'desktop1280', false]]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: W < 600, colorScheme: 'light' }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 160))); await p.clock.setFixedTime(new Date(AGORA_ISO)); await mocar(p, 'ok');
  const ana = makeAna(); ana.porLead = FX;
  await p.route(/gs-agendor-worker.*\/ana-painel/, r => r.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify(ana) }));
  const lista = rows => r => r.fulfill({ status: 200, headers: { ...cors, 'content-range': '0-' + (rows.length - 1) + '/' + rows.length, 'access-control-expose-headers': 'content-range' }, contentType: 'application/json', body: JSON.stringify(rows) });
  await p.route(/dash_geral_deals.*funnel_id=eq\.916713.*Ana%20qualificou/, lista(DL.sdr.filter(r => r.stage_name === 'Ana qualificou')));
  await p.route(/dash_geral_deals.*funnel_id=eq\.916713.*Repasse%20da%20Ana/, lista(DL.sdr.filter(r => r.stage_name === 'Repasse da Ana')));
  await p.route(/dash_geral_deals.*funnel_id=eq\.919856/, lista(DL.ana));
  await p.goto(BASE + 'index.html', { waitUntil: 'commit' }); await p.waitForTimeout(8000);
  await p.evaluate(() => { const b = document.querySelector('.ochip[data-v="sdr"]'); if (b) b.click(); }); await p.waitForTimeout(1500);
  await p.evaluate(() => { const b = document.querySelector('button[data-ag="ana"]'); if (b) b.click(); }); await p.waitForTimeout(2500);
  await p.evaluate(() => { const b = document.querySelector('.pchip[data-p="30d"]') || document.querySelector('.pchip[data-p="30"]'); if (b) b.click(); }); await p.waitForTimeout(2000);
  const info = await p.evaluate(() => ({ kpis: [...document.querySelectorAll('#s2-root .s2-k')].map(k => k.innerText.replace(/\n+/g, ' | ')), hs: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
  console.log(nome, 'rolagem lateral', info.hs, '\n  ' + info.kpis.join('\n  '), '\n  erros:', JSON.stringify(errs));
  await p.screenshot({ path: `${OUT}/ana_${nome}_topo.png`, fullPage: false });
  await p.evaluate(() => { const r = document.querySelector('#s2-root'); if (r) r.scrollIntoView(); }); await p.screenshot({ path: `${OUT}/ana_${nome}_cheio.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
