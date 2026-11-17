// Central 17/11 (Robert #2967: "fica recarregando, bugando, o scroll sai da apresentação"): a aba Ecossistema (iframe) (a) NÃO recarrega em atualização de 45 s, troca de aba e volta (5x), tema, resize e 'Atualizar'; (b) o slide/rolagem DENTRO da apresentação são preservados; (c) rolar dentro do iframe não rola a Central (sem vazamento) e o foco fica no iframe.
// Rodar: node central/tests/eco_ciclos.cjs <playwright-core> <chromium>   (CENTRAL_URL aponta para a página a testar)
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("eco_ciclos");
const DECK = "<!doctype html><title>eco</title><style>body{margin:0;height:6000px;background:linear-gradient(#eef,#fdf)}</style><body>deck<script>window.__slide=1;window.__loads=(window.__loads||0)+1;</script></body>";
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  for (const [vp, nome] of [[{ width: 1366, height: 800 }, "desktop"], [{ width: 390, height: 780 }, "celular"]]) {
    const ctx = await b.newContext({ viewport: vp }); await ctx.addInitScript(() => { window.__CENTRAL_TESTE = 1; }); const mock = B.criarMock({ expiraEm: Date.now() + 30 * 86400000 }); const p = await B.novaPagina(ctx, mock);
    let nav = 0; p.on("framenavigated", (f) => { if (/\/ecossistema\//.test(f.url())) nav++; });
    await p.route(/\/ecossistema\//, (r) => r.fulfill({ status: 200, contentType: "text/html", body: DECK }));
    await p.clock.install({ time: new Date() }); await B.entrar(p, "#ecossistema"); await p.waitForSelector("#ecoHold iframe.frame", { timeout: 10000 }); await p.waitForFunction(() => window.__centralTeste.ECO.cont >= 1, null, { timeout: 10000 });
    const fr = () => p.frames().find((f) => /\/ecossistema\//.test(f.url()));
    S.ok(nav === 1, nome + ": 1 navegação inicial (" + nav + ")");
    await fr().evaluate(() => { window.__slide = 7; document.scrollingElement.scrollTop = 400; }); await p.evaluate(() => { document.querySelector("#ecoHold iframe").__m = "A"; });
    const estaOk = async (rot) => {
      const st = await fr().evaluate(() => ({ s: window.__slide, y: document.scrollingElement.scrollTop, l: window.__loads }));
      S.ok(st.s === 7 && st.y === 400 && st.l === 1, nome + ": " + rot + ": slide 7, rolagem 400, 1 carga " + JSON.stringify(st));
      S.ok(await p.evaluate(() => window.__centralTeste.ECO.cont) === 1 && nav === 1 && (await p.evaluate(() => document.querySelectorAll("iframe").length)) === 1 && (await p.evaluate(() => document.querySelector("#ecoHold iframe").__m)) === "A", nome + ": " + rot + ": mesmo iframe, 1 load (nav " + nav + ")"); };
    // 3 ciclos de poll (45 s) + render automático + carregar
    for (let i = 0; i < 3; i++) { await p.clock.fastForward(60000); await p.waitForTimeout(300); await p.evaluate(() => window.__centralTeste.render({ auto: true })); } await p.evaluate(() => window.__centralTeste.carregar()); await p.waitForTimeout(500); await estaOk("3 ciclos de poll + render + carregar");
    // tema, resize, Atualizar
    await p.click("#btnTema"); await p.waitForTimeout(200); await p.click("#btnTema"); await estaOk("tema 2x");
    await p.setViewportSize({ width: vp.width + 80, height: vp.height - 60 }); await p.waitForTimeout(300); await p.setViewportSize(vp); await p.waitForTimeout(300); await estaOk("resize");
    await p.evaluate(() => document.getElementById("btnAtualizar").click()); await p.waitForTimeout(700); await estaOk("Atualizar");
    // 5x Ecossistema -> Visão -> Ecossistema
    for (let i = 0; i < 5; i++) { await p.evaluate(() => window.__centralTeste.ir("visao")); await p.waitForTimeout(150); const oculto = await p.evaluate(() => getComputedStyle(document.getElementById("ecoHold")).display === "none"); S.ok(oculto, nome + ": ciclo " + (i + 1) + ": na Visão o Ecossistema fica escondido (não destruído)"); await p.evaluate(() => window.__centralTeste.ir("eco")); await p.waitForTimeout(200); const vis = await p.evaluate(() => getComputedStyle(document.getElementById("ecoHold")).display !== "none" && document.getElementById("ecoHold").getBoundingClientRect().height > 300); S.ok(vis, nome + ": ciclo " + (i + 1) + ": voltou visível"); }
    await estaOk("5x troca de aba");
    // (b)/(c) rolar dentro do iframe: a Central não se mexe; foco no iframe; overscroll contido
    const box = await p.evaluate(() => { const r = document.querySelector("#ecoHold iframe").getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + Math.min(r.height / 2, 200) }; });
    const y0 = await p.evaluate(() => window.pageYOffset); await p.mouse.move(box.x, box.y); for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 900); await p.waitForTimeout(40); } await p.waitForTimeout(300);
    const y1 = await p.evaluate(() => window.pageYOffset); const iy = await fr().evaluate(() => document.scrollingElement.scrollTop);
    S.ok(iy > 400, nome + ": a roda do mouse rolou DENTRO da apresentação (" + iy + ")"); S.ok(y1 === y0, nome + ": a Central não rolou atrás do iframe (" + y0 + " -> " + y1 + ")");
    const oc = await fr().evaluate(() => getComputedStyle(document.documentElement).overscrollBehaviorY); S.ok(oc === "contain", nome + ": overscroll-behavior contido dentro do iframe (" + oc + ")");
    S.ok(await p.evaluate(() => document.activeElement && document.activeElement.tagName === "IFRAME"), nome + ": o foco está no iframe (setas/teclas vão para a apresentação)");
    await p.keyboard.press("ArrowDown"); await p.waitForTimeout(150); S.ok((await p.evaluate(() => window.pageYOffset)) === y0, nome + ": seta para baixo não rola a Central");
    S.ok(!(p._erros && p._erros.length), nome + ": console limpo " + JSON.stringify(p._erros)); await ctx.close();
  }
  S.fim(); await b.close();
})();
