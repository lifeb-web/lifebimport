const N = require('./navegador.cjs'); const F = require('./fixture.cjs');
(async () => {
  await N.pegarTrava();
  const { chromium } = require(N.PW);
  const b = await chromium.launch({ executablePath: N.EXE, headless: true });
  try {
    for (const [w, h, nome] of [[390, 844, 'base_390'], [1280, 800, 'base_1280']]) {
      const { page, ctx, erros } = await N.abrir(b, { largura: w, altura: h, leads: () => F.carteira() });
      await page.waitForSelector('.lead-card', { timeout: 8000 }); await N.sleep(700);
      await page.screenshot({ path: '/tmp/rep_shots/' + nome + '.png' });
      if (w === 390) { await page.click('.lead-card[data-row="102"] .lc-status-btn.ganho'); await N.sleep(700); await page.locator('.lead-card[data-row="102"]').screenshot({ path: '/tmp/rep_shots/base_ganho_reposicao_390.png' }); }
      console.log(nome, 'erros', erros);
      await ctx.close();
    }
  } finally { await b.close(); N.soltarTrava(); }
})().catch(e => { console.error(e); process.exit(1); });
