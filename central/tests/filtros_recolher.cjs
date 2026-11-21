// Central 17/11 (Robert #3143): barra de filtros RECOLHIVEL (nasce recolhida no celular, lembrada por usuario) e filtros 'Janela aberta/fechada' combinaveis. Chromium.
// Rodar: node central/tests/filtros_recolher.cjs <playwright-core> <chromium>   (CENTRAL_URL proprio; nunca a 8802 de outro agente)
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("filtros_recolher");
const NOW = Date.now(), H = 3600000, D = 24 * H;
const conv = [{ fone: "5562900000001", nome: "Aberta", ts: NOW - 3 * H, ultimaDe: "lead", estagio: "perguntou_cnpj" }, { fone: "5562900000002", nome: "Fechada", ts: NOW - 3 * D, ultimaDe: "lead", estagio: "perguntou_cnpj" }, { fone: "5562900000003", nome: "Fechando", ts: NOW - 23 * H, ultimaDe: "lead", estagio: "perguntou_cnpj" }, { fone: "5562900000004", nome: "Precisa e fechada", ts: NOW - 4 * D, ultimaDe: "lead", estagio: "aguardando_humano" }];
const mock = () => B.criarMock({ agentes: () => { const a = B.agentesPadrao(); a.agentes[0].conversas = conv.map((x) => ({ humano: false, pausado: false, previa: "oi", ...x })); a.agentes[0].auditoria = []; return a; } });
const cards = (p) => p.$$eval("#atItens .ri", (x) => x.map((e) => e.dataset.fone));
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  for (const [vp, nome, mob] of [[{ width: 1440, height: 900 }, "desktop", false], [{ width: 390, height: 780 }, "celular", true]]) for (const tema of ["light", "dark"]) {
    try {
      const ctx = await b.newContext({ viewport: vp, colorScheme: tema, hasTouch: mob }); await ctx.addInitScript(() => { window.__CENTRAL_TESTE = true; }); const p = await B.novaPagina(ctx, mock()); await B.entrar(p, "#atendimento"); await p.waitForSelector("#atItens .ri", { timeout: 10000 }); const t = nome + "/" + tema + ": ";
      const aberta = async () => (await p.getAttribute("#atFiltrosBt", "aria-expanded")) === "true";
      S.ok((await aberta()) === !mob, t + "estado inicial: " + (mob ? "recolhida no celular" : "aberta no computador"));
      if (mob) { const n = await p.$$eval("#atFiltros button", (x) => x.length); S.ok(n === 1, t + "recolhida mostra so o filtro ativo (" + n + ")"); const h = await p.$eval("#atFiltrosBox", (e) => e.getBoundingClientRect().height); S.ok(h < 80, t + "recolhida ocupa pouca altura (" + Math.round(h) + " px)"); await p.click("#atFiltrosBt"); await p.waitForTimeout(200); }
      S.ok(await aberta(), t + "aberta mostra todos os filtros"); S.ok((await p.$$("#atFiltros button")).length === 11, t + "11 chips (8 situacao, com 'Sem proximo toque' desde 20/11, + 3 janela)");
      await p.click('#atFiltros button[data-f="fechada"]'); await p.waitForTimeout(200); S.ok((await cards(p)).sort().join() === "5562900000002,5562900000004", t + "Janela fechada: " + (await cards(p)).join());
      await p.click('#atFiltros button[data-f="precisa"]'); await p.waitForTimeout(200); S.ok((await cards(p)).join() === "5562900000004", t + "Precisam de voce E Janela fechada: " + (await cards(p)).join());
      await p.click('#atFiltros button[data-f="aberta"]'); await p.waitForTimeout(200); S.ok((await cards(p)).length === 0, t + "Precisam E aberta = vazio");
      await p.click('#atFiltros button[data-f="todos"]'); await p.waitForTimeout(200); S.ok((await cards(p)).length === 4, t + "Todas limpa os dois eixos");
      const peq = await p.evaluate((m) => { const o = []; document.querySelectorAll("#atFiltrosBt, #atFiltros button").forEach((e) => { const r = e.getBoundingClientRect(); if (r.height < (m ? 43.5 : 32)) o.push(e.dataset.f + ":" + Math.round(r.height)); }); return o; }, mob); S.ok(peq.length === 0, t + "alvos de toque " + (mob ? ">= 44" : ">= 32") + " px: " + JSON.stringify(peq));
      await p.click("#atFiltrosBt"); await p.waitForTimeout(150); S.ok(!(await aberta()), t + "botao recolhe"); await p.reload(); await p.waitForSelector("#atItens .ri", { timeout: 10000 }).catch(async () => { await B.entrar(p, "#atendimento"); await p.waitForSelector("#atItens .ri"); }); S.ok(!(await aberta()), t + "lembra 'recolhida' depois de recarregar (por usuario)");
      await p.focus("#atFiltrosBt"); await p.keyboard.press("Enter"); await p.waitForTimeout(150); S.ok(await aberta(), t + "teclado: Enter abre"); const sw = await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1); S.ok(sw, t + "sem rolagem lateral");
      await p.screenshot({ path: (process.env.PRINTS || "/tmp/central_prints") + "/7_filtros_" + nome + "_" + tema + ".png" }); S.ok(!(p._erros && p._erros.length), t + "console limpo " + JSON.stringify(p._erros)); await ctx.close();
    } catch (e) { S.F("EXCECAO " + nome + "/" + tema + ": " + String(e.message).split("\n")[0].slice(0, 200)); }
  }
  S.fim(); await b.close();
})();
