const N = require('./navegador.cjs'); const F = require('./fixture.cjs');
(async () => {
  await N.pegarTrava();
  const { chromium } = require(N.PW);
  const b = await chromium.launch({ executablePath: N.EXE, headless: true });
  const out = (n) => '/tmp/rep_shots/estado_' + n + '_390.png';
  try {
    // 1 erro de rede na 1ª carga (sem cache): rota /leads devolve 502
    let c = await N.abrir(b, { leads: () => { throw new Error('x'); } });
    await c.ctx.close();
    c = await N.abrir(b, { leads: () => F.carteira() });
    await c.page.route('**/leads*', r => r.fulfill({ status: 502, headers: { 'access-control-allow-origin': '*' }, body: '{}' }));
    await c.page.reload(); await N.sleep(14000); await c.page.screenshot({ path: out('erro_rede') }); await c.ctx.close();
    // 2 vazio
    c = await N.abrir(b, { leads: () => [] }); await N.sleep(1500); await c.page.screenshot({ path: out('vazio') }); await c.ctx.close();
    // 3 filtro vazio
    c = await N.abrir(b, { leads: () => F.carteira().filter(l => l.dealId !== 103) }); await c.page.waitForSelector('.lead-card'); await c.page.click('.sum-card.s-neg'); await N.sleep(600); await c.page.screenshot({ path: out('filtro_vazio') }); await c.ctx.close();
    // 4 ganho com 429 do servidor
    c = await N.abrir(b, { leads: () => F.carteira(), post: async p => p === '/status' ? { status: 429, body: { ok: false, erro: 'rate' } } : null });
    await c.page.waitForSelector('.lead-card'); await c.page.click('.lead-card[data-row="101"] .lc-status-btn.ganho'); await c.page.type('#sp-valor-101', '8000'); await N.sleep(200);
    await c.page.screenshot({ path: out('valor_preview') });
    await c.page.click('#sp-save-101'); await N.sleep(9000); await c.page.screenshot({ path: out('ganho_429') }); await c.ctx.close();
    // 5 mínimo de fonte em letra normal
    c = await N.abrir(b, { leads: () => F.carteira(), extraStorage: { lifeb_letra_maior: '0' } }); await c.page.waitForSelector('.lead-card'); await N.sleep(500);
    const menores = await c.page.evaluate(() => { const r = []; document.querySelectorAll('main *, header *').forEach(e => { if (!e.childNodes.length) return; const t = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' '); if (!t) return; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return; const px = parseFloat(cs.fontSize) * (parseFloat(getComputedStyle(document.documentElement).zoom) || 1); if (px < 12.9) r.push(Math.round(px * 10) / 10 + 'px ' + t.slice(0, 30)); }); return r; });
    console.log('textos < 13px (letra normal):', JSON.stringify(menores.slice(0, 20)), 'total', menores.length);
    await c.page.screenshot({ path: out('letra_normal') }); await c.ctx.close();
  } finally { await b.close(); N.soltarTrava(); }
})().catch(e => { N.soltarTrava(); console.error(e); process.exit(1); });
