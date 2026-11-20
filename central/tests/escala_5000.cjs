// Central 20/11 (Robert #3685 'escalável para milhares'): 5.000 conversas no Atendimento e 400 atalhos/300 representantes no Início. Mede abrir, filtrar, buscar (com debounce) e uma atualização geral; falha se passar do teto.
// Rodar: node central/tests/escala_5000.cjs <playwright-core> <chromium>   (CENTRAL_URL próprio; PRINTS=pasta)
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("escala_5000"); const fs = require("fs");
const PR = process.env.PRINTS || "/tmp/central_final_prints/escala"; fs.mkdirSync(PR, { recursive: true });
const NOW = Date.now(), N = 5000;
const conv = Array.from({ length: N }, (_, i) => ({ fone: "55629" + String(10000000 + i), nome: (i % 7 === 0 ? "Maria " : "Lead ") + i, estagio: i % 11 === 0 ? "aguardando_humano" : "perguntou_cnpj", humano: i % 13 === 0, pausado: false, ts: NOW - i * 45000, previa: "mensagem " + i, ultimaDe: i % 3 ? "lead" : "ana", janela: { aberta: i % 5 !== 0, fechaEm: NOW + 3600000 * (i % 40), ultimaDoLead: NOW - i * 45000 } }));
const reps = Array.from({ length: 300 }, (_, i) => ({ nome: "Representante " + String(i).padStart(3, "0"), primeiro: "Rep" + i, slug: "rep" + i, url: "/rep/dash/rep" + i + "/" }));
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  for (const [w, h] of [[1440, 900], [390, 780]]) {
    const t = w + ": ";
    const mock = B.criarMock({ expiraEm: NOW + 30 * 864e5, agentes: () => { const a = B.agentesPadrao(); a.agentes[0].conversas = conv; return a; }, over: async (u) => { if (u === "/hub/representantes") return { status: 200, json: { ok: true, itens: reps } }; if (u === "/agentes/selos") return { status: 200, json: { ok: true, pendentes: 0, itens: {} } }; return null; } });
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: "light", hasTouch: w < 500 }); await ctx.addInitScript(() => { window.__CENTRAL_TESTE = true; });
    const p = await B.novaPagina(ctx, mock);
    const t0 = Date.now(); await B.entrar(p, "#atendimento"); await p.waitForSelector("#atItens .ri", { timeout: 20000 }); const tAbrir = Date.now() - t0;
    const nLinhas = await p.$$eval("#atItens .ri", (x) => x.length);
    S.ok(nLinhas <= 60, t + "lista desenha no máximo 60 linhas de 5.000: " + nLinhas); S.ok(tAbrir < 6000, t + "abrir com 5.000 conversas < 6 s: " + tAbrir + " ms");
    const med = await p.evaluate(() => { const T = window.__centralTeste; const r = {}; let a = performance.now(); T.desenharLista(); r.desenhar = performance.now() - a; a = performance.now(); T.filtrar(T.S.ag.conversas); r.filtrar = performance.now() - a; a = performance.now(); T.contagens(T.S.ag.conversas); r.contagens = performance.now() - a; a = performance.now(); T.refresca(); r.refresca = performance.now() - a; return r; });
    console.log(t + "abrir " + tAbrir + " ms; " + JSON.stringify(Object.fromEntries(Object.entries(med).map(([k, v]) => [k, Math.round(v) + " ms"]))));
    S.ok(med.desenhar < 250, t + "redesenhar a lista < 250 ms: " + Math.round(med.desenhar)); S.ok(med.refresca < 300, t + "atualização geral (assinatura) < 300 ms: " + Math.round(med.refresca)); S.ok(med.contagens < 150, t + "contagens dos filtros < 150 ms: " + Math.round(med.contagens));
    // busca: digitar 6 letras seguidas; com debounce a lista é redesenhada poucas vezes e o último termo vale
    await p.evaluate(() => { window.__dr = 0; new MutationObserver((m) => { window.__dr += m.filter((x) => x.removedNodes.length).length ? 1 : 0; }).observe(document.getElementById("atItens"), { childList: true }); });
    const ts = Date.now(); await p.click("#atBusca"); await p.keyboard.type("Maria", { delay: 15 }); await p.waitForTimeout(700); const tBusca = Date.now() - ts;
    const dr = await p.evaluate(() => window.__dr); const achou = await p.$$eval("#atItens .ri", (x) => x.length);
    S.ok(dr <= 2, t + "digitar 5 letras redesenha a lista no máximo 2 vezes (debounce): " + dr); S.ok(achou === 60, t + "busca 'Maria' acha 60 na 1ª página (de 715): " + achou);
    // filtro 'Precisam de você'
    const tf = await p.evaluate(() => { const T = window.__centralTeste; const a = performance.now(); T.filtroSet("precisa"); T.desenharLista(); return performance.now() - a; }); S.ok(tf < 300, t + "trocar de filtro < 300 ms: " + Math.round(tf));
    await p.evaluate(() => { const T = window.__centralTeste; T.filtroSet("todos"); T.desenharLista(); });
    // rolar a lista: 20 rolagens seguidas
    const tr = await p.evaluate(async () => { const box = document.getElementById("atItens"); const a = performance.now(); for (let i = 0; i < 20; i++) { box.scrollTop += 400; await new Promise((r) => requestAnimationFrame(r)); } return performance.now() - a; }); S.ok(tr < 2500, t + "20 rolagens < 2,5 s: " + Math.round(tr));
    // "Mostrar mais" cresce de 60 em 60
    await p.evaluate(() => { const T = window.__centralTeste; document.getElementById("atBusca").value = ""; T.AT.busca = ""; T.AT.lim = 60; T.desenharLista(); }); const mais = await p.$("#atItens .mais"); S.ok(!!mais, t + "botão Mostrar mais existe"); if (mais) { await mais.click(); await p.waitForTimeout(200); S.ok((await p.$$eval("#atItens .ri", (x) => x.length)) === 120, t + "Mostrar mais soma 60"); }
    await p.screenshot({ path: PR + "/atendimento_5000_" + w + ".png" });
    // Início: 300 representantes
    await p.evaluate(() => window.__centralTeste.ir("inicio")); await p.waitForSelector("[data-card=painel-rep]", { timeout: 10000 });
    await p.click("[data-card=painel-rep] .hmain"); await p.waitForSelector("#hubRepBusca", { timeout: 8000 }); const nRep = await p.$$eval("#hubRepLista a", (x) => x.length);
    S.ok(nRep === 30, t + "300 representantes: desenha 30 por vez: " + nRep);
    await p.fill("#hubRepBusca", "Representante 2"); await p.waitForTimeout(200); S.ok((await p.$$eval("#hubRepLista a", (x) => x.length)) === 30, t + "busca de representante pagina");
    await p.fill("#hubRepBusca", "Representante 299"); await p.waitForTimeout(150); const un = await p.$$eval("#hubRepLista a", (x) => x.map((e) => e.getAttribute("href"))); S.ok(un.length === 1 && un[0] === "/rep/dash/rep299/", t + "busca exata acha o painel certo: " + un.join());
    const sx = await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1); S.ok(sx, t + "sem rolagem lateral no Início com a lista aberta");
    await p.screenshot({ path: PR + "/inicio_reps_300_" + w + ".png" });
    S.ok(!(p._erros || []).length, t + "sem erro de JS: " + (p._erros || []).slice(0, 2).join(" | "));
    await ctx.close();
  }
  await b.close(); S.fim();
})();
