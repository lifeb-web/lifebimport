// A página Ecossistema dentro de um iframe (como na aba Ecossistema da Central): sem recarregar sozinha, sem mexer no endereço de quem a embute, sem tela cheia automática, com slides navegáveis.
import { t, resumo, abrirNavegador, HTML, URL_PAGINA } from "./_comum.mjs";
const nav = await abrirNavegador();
for (const [w, h] of [[1280, 720], [390, 844]]) {
  const ctx = await nav.newContext({ viewport: { width: w + 40, height: h + 40 } }); const page = await ctx.newPage(); const erros = [];
  page.on("pageerror", (e) => erros.push(String(e.message).slice(0, 160)));
  await page.route("https://projetojlbv.com.br/ecossistema/**", (r) => r.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: HTML }));
  await page.route("https://projetojlbv.com.br/central/host", (r) => r.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: `<!doctype html><body style="margin:0"><iframe id="f" src="/ecossistema/" style="width:${w}px;height:${h}px;border:0"></iframe></body>` }));
  await page.route("https://projetojlbv.com.br/*.png", (r) => r.fulfill({ status: 204, body: "" }));
  await page.route("https://projetojlbv.com.br/favicon*", (r) => r.fulfill({ status: 204, body: "" }));
  let navegacoes = 0; page.on("framenavigated", (f) => { if (f !== page.mainFrame()) navegacoes++; });
  await page.goto("https://projetojlbv.com.br/central/host", { waitUntil: "load" });
  const hashPai0 = await page.evaluate(() => location.href);
  await page.waitForTimeout(1500); const fr = page.frames().find((f) => f !== page.mainFrame());
  await fr.waitForSelector("#apBtn");
  t(`${w}x${h}: dentro do iframe a página marca o modo iframe`, await fr.evaluate(() => document.documentElement.classList.contains("emif")));
  await fr.click("#apBtn"); await page.waitForTimeout(600);
  t(`${w}x${h}: Apresentar no iframe abre o deck sem tela cheia automática`, await fr.evaluate(() => window.__deck.estado().aberto && !document.fullscreenElement && document.getElementById("dFs").hidden === true));
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight"); await page.waitForTimeout(300);
  t(`${w}x${h}: navegar slides dentro do iframe funciona`, (await fr.evaluate(() => window.__deck.estado().i)) === 2);
  const sem = await fr.evaluate(() => ({ sx: document.documentElement.scrollWidth <= innerWidth + 1, hash: location.hash }));
  t(`${w}x${h}: sem rolagem lateral e o endereço do iframe não é alterado`, sem.sx && sem.hash === "", sem);
  await page.keyboard.press("Escape"); await page.waitForTimeout(300);
  // rolagem da página longa dentro do iframe: não salta sozinha
  const y0 = await fr.evaluate(() => scrollY); await page.waitForTimeout(2500); const y1 = await fr.evaluate(() => scrollY);
  t(`${w}x${h}: a rolagem não salta sozinha`, y0 === y1, [y0, y1]);
  await page.waitForTimeout(10000);
  t(`${w}x${h}: não pisca: o iframe carregou 1 vez em 10 s (sem recarga)`, navegacoes === 1, navegacoes);
  t(`${w}x${h}: o endereço da página que embute não mudou`, (await page.evaluate(() => location.href)) === hashPai0);
  t(`${w}x${h}: sem erro de JS`, erros.length === 0, erros);
  await ctx.close();
}
await nav.close(); resumo();
