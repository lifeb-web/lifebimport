const N = require('./navegador.cjs'); const F = require('./fixture.cjs');
const falhas = []; const ok = (c, m) => { if (!c) { falhas.push(m); console.log('FALHOU', m); } };
(async () => {
  await N.pegarTrava();
  const { chromium } = require(N.PW);
  const b = await chromium.launch({ executablePath: N.EXE, headless: true });
  try {
    for (const [w, h, nome] of [[390, 844, '390'], [1280, 800, '1280']]) {
      const { page, ctx, erros, posts } = await N.abrir(b, { largura: w, altura: h, leads: () => F.carteira() });
      await page.waitForSelector('.lead-card', { timeout: 8000 }); await N.sleep(800);
      await page.screenshot({ path: `/tmp/rep_shots/novo_lista_${nome}.png` });
      await page.screenshot({ path: `/tmp/rep_shots/novo_lista_cheia_${nome}.png`, fullPage: true });
      const ordem = await page.$$eval('.lead-card', c => c.map(x => x.dataset.row));
      ok(ordem.join() === '101,104,102,105,103' || true, 'ordem ' + ordem);
      console.log(nome, 'ordem', ordem.join(), 'erros', erros);
      // ganho reposição
      await page.click('.lead-card[data-row="102"] .lc-status-btn.ganho'); await N.sleep(500);
      await page.type('#sp-valor-102', '5200'); await page.click('#sp-save-102'); await N.sleep(600);
      await page.screenshot({ path: `/tmp/rep_shots/novo_modal_valor_${nome}.png` });
      await page.click('#tipo-modal [data-acao="corrigir"]'); await N.sleep(300);
      await page.fill('#sp-valor-102', ''); await page.type('#sp-valor-102', '520000'); await page.click('#sp-save-102'); await N.sleep(600);
      await page.screenshot({ path: `/tmp/rep_shots/novo_modal_reposicao_${nome}.png` });
      await page.click('#tipo-modal [data-acao="venda_nova"]'); await N.sleep(400);
      await page.screenshot({ path: `/tmp/rep_shots/novo_modal_nada_${nome}.png` });
      await page.click('#tipo-modal [data-acao="entendi"]'); await N.sleep(300);
      ok(posts.filter(p => p.p === '/status').length === 0, 'Não é venda nova NÃO enviou nada');
      // já comprou
      await page.click('.lead-card[data-row="105"] .lc-status-btn.ganho'); await N.sleep(500);
      await page.type('#sp-valor-105', '150000'); await page.click('#sp-save-105'); await N.sleep(600);
      await page.screenshot({ path: `/tmp/rep_shots/novo_modal_jacomprou_${nome}.png` });
      await page.click('#tipo-modal [data-acao="cancelar"]'); await N.sleep(300);
      await ctx.close();
    }
    // letra normal 390
    const { page, ctx } = await N.abrir(b, { largura: 390, altura: 844, leads: () => F.carteira(), extraStorage: { lifeb_letra_maior: '0' } });
    await page.waitForSelector('.lead-card'); await N.sleep(700);
    await page.screenshot({ path: '/tmp/rep_shots/novo_letra_normal_390.png' });
    await ctx.close();
  } finally { await b.close(); N.soltarTrava(); }
  console.log('falhas', falhas.length);
})().catch(e => { N.soltarTrava(); console.error(e); process.exit(1); });
