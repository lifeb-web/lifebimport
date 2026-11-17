// Central 16/11: a aba Ecossistema (iframe) NAO recarrega a cada render()/carga de dados ('piscava'): iframe criado 1 vez, 3 render() seguidos e 60 s simulados (setInterval de 45 s) sem navegacao nova.
// Rodar: node central/tests/eco_piscar.cjs <playwright-core> <chromium>   (servidor local na raiz do repositorio de paginas, porta 8802)
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("eco_piscar");
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] }); const ctx = await b.newContext({ viewport: { width: 1366, height: 800 } });
  const mock = B.criarMock(); await ctx.addInitScript(() => { window.__CENTRAL_TESTE = 1; }); const p = await B.novaPagina(ctx, mock);
  let navEco = 0; p.on("framenavigated", (f) => { if (/\/ecossistema\//.test(f.url())) navEco++; });
  await p.route(/\/ecossistema\//, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>eco</title><body style='height:3000px'>eco</body>" }));
  await B.entrar(p, "#ecossistema"); await p.waitForSelector("#conteudo iframe.frame", { timeout: 8000 }); await p.waitForTimeout(600);
  S.ok(await p.evaluate(() => window.__centralTeste.S.aba) === "eco", "aba eco ativa");
  await p.evaluate(() => { const f = document.querySelector("#conteudo iframe.frame"); f.__marca = "A"; });
  const nav0 = navEco; S.ok(nav0 === 1, "1 navegação inicial do iframe (" + nav0 + ")");
  const h0 = await p.evaluate(() => document.querySelector("#conteudo iframe.frame").getBoundingClientRect().height);
  for (let i = 0; i < 3; i++) { await p.evaluate(() => window.__centralTeste.render({ auto: true })); await p.waitForTimeout(150); }
  await p.evaluate(() => window.__centralTeste.carregar()); await p.waitForTimeout(500);
  S.ok(await p.evaluate(() => document.querySelector("#conteudo iframe.frame").__marca) === "A", "o MESMO iframe sobrevive a 3 render() + carregar()");
  S.ok(await p.evaluate(() => document.querySelectorAll("#conteudo iframe").length) === 1, "só 1 iframe");
  const h1 = await p.evaluate(() => document.querySelector("#conteudo iframe.frame").getBoundingClientRect().height); S.ok(Math.abs(h1 - h0) < 1 && h1 >= 560, "altura estável " + h0 + "->" + h1);
  await p.clock.install(); await p.clock.runFor(60000); await p.waitForTimeout(800);
  S.ok(await p.evaluate(() => document.querySelector("#conteudo iframe.frame").__marca) === "A", "60 s simulados: mesmo iframe");
  S.ok(navEco === nav0, "60 s simulados: nenhuma navegação nova no iframe (" + navEco + ")");
  // trocar de aba e voltar cria de novo (esperado, uma vez)
  await p.evaluate(() => window.__centralTeste.ir("atalhos")); await p.evaluate(() => window.__centralTeste.ir("eco")); await p.waitForSelector("#conteudo iframe.frame"); await p.waitForTimeout(500);
  S.ok(navEco === nav0 + 1, "voltar à aba carrega 1 vez (" + navEco + ")");
  // Atalhos: sem iframe nem mídia pesada; só cartões estáticos
  await p.evaluate(() => window.__centralTeste.ir("atalhos")); S.ok(await p.evaluate(() => document.querySelectorAll("#conteudo iframe,#conteudo img,#conteudo video").length) === 0, "Atalhos não tem iframe/imagem/vídeo (render barato)");
  S.ok(!(p._erros && p._erros.length), "sem erro no console " + JSON.stringify(p._erros));
  await b.close(); S.fim();
})();
