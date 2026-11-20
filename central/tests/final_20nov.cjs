// Central 20/11 (Robert #3719/#3720/#3729): prova no Chromium real de login, menu em grupos, atalhos por aparelho, painéis dos representantes e Troca com o designer; 360/390/1440, claro e escuro, sem rolagem lateral, prints.
// Rodar: node central/tests/final_20nov.cjs <playwright-core> <chromium>   (CENTRAL_URL próprio; PRINTS=pasta)
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("final_20nov"); const fs = require("fs");
const PR = process.env.PRINTS || "/tmp/central_final_prints/final"; fs.mkdirSync(PR, { recursive: true });
const NOW = Date.now();
const reps = Array.from({ length: 12 }, (_, i) => ({ nome: "Representante Exemplo " + String(i + 1).padStart(2, "0"), primeiro: "Rep" + i, slug: "rep" + i, url: "/rep/dash/rep" + i + "/" }));
const rodadas = [{ id: "r1", v: 1, n: 1, ts: NOW - 3600000, titulo: "Rodada 1: direção de capa", pedido: "Claude: preciso de 3 caminhos de capa para o carrossel de drogarias. Público: dono de drogaria e de supermercado. Sem rosto de consumidor.", resposta: "Codex: três caminhos.\n1) Capa limpa: uma pergunta ao dono de loja.\n2) Capa número: 7 perguntas.\n3) Capa antes e depois da gôndola.", opcoes: [{ id: "A", titulo: "Capa limpa", texto: "Fundo claro, uma pergunta." }, { id: "B", titulo: "Capa número", texto: "Número 7 grande." }, { id: "C", titulo: "Antes e depois", texto: "Gôndola vazia e cheia." }], hash: "abc12345", decisoes: [], publica: false }, { id: "r2", v: 2, n: 2, ts: NOW - 7200000, titulo: "Rodada 2: paleta", pedido: "Claude: confira a paleta.", resposta: "Codex: paleta roxo e magenta.", opcoes: [], hash: "def", decisoes: [{ tipo: "correcao", comentario: "menos magenta", por: "robert", ts: NOW - 3000000 }], publica: false }];
const sobra = (p) => p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  const VPS = [[360, 740, true], [390, 780, true], [1440, 900, false]];
  for (const [w, h, mob] of VPS) for (const tema of ["light", "dark"]) {
    const t = w + "/" + tema + ": ";
    const mock = B.criarMock({ expiraEm: NOW + 30 * 864e5, over: async (u, url, req, body) => {
      if (u === "/acesso/entrar" && body && body.senha === "errada") return { status: 401, json: { ok: false, mensagem: "Usuário ou senha incorretos." } };
      if (u === "/acesso/entrar" && body && body.senha === "lenta") return { delay: 900, status: 401, json: { ok: false, mensagem: "Usuário ou senha incorretos." } };
      if (u === "/hub/representantes") return { status: 200, json: { ok: true, itens: reps } };
      if (u === "/instagram/troca") return { status: 200, json: { ok: true, euPossoAprovar: true, itens: rodadas } };
      if (u === "/instagram/fila") return { status: 200, json: { ok: true, hoje: "2026-11-20", teto: 2, euPossoAprovar: true, contagem: {}, itens: [] } };
      if (u === "/instagram/metricas") return { status: 200, json: { ok: true, metricas: null } };
      return null; } });
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema, hasTouch: mob, isMobile: mob && w < 500 }); await ctx.addInitScript((tm) => { window.__CENTRAL_TESTE = true; try { localStorage.setItem("central_tema", tm); } catch (e) {} }, tema);
    const p = await B.novaPagina(ctx, mock);
    // ---- LOGIN ----
    await p.goto(B.BASE); await p.waitForSelector("#usuario", { state: "visible", timeout: 10000 }); await p.waitForTimeout(300);
    S.ok(await p.evaluate(() => document.activeElement && document.activeElement.id === "usuario"), t + "login: foco automático no usuário");
    S.ok((await sobra(p)) <= 0, t + "login: sem rolagem lateral (" + (await sobra(p)) + ")");
    await p.screenshot({ path: PR + "/login_" + w + "_" + tema + ".png" });
    await p.fill("#usuario", "robert@x.com"); await p.fill("#senha", "segredo123");
    S.ok((await p.getAttribute("#senha", "type")) === "password", t + "login: senha oculta por padrão");
    await p.click("#btnVerSenha"); S.ok((await p.getAttribute("#senha", "type")) === "text" && (await p.getAttribute("#btnVerSenha", "aria-pressed")) === "true" && /Ocultar/.test(await p.textContent("#btnVerSenha")), t + "login: Mostrar senha funciona");
    await p.click("#btnVerSenha"); S.ok((await p.getAttribute("#senha", "type")) === "password", t + "login: Ocultar volta");
    S.ok((await p.$eval("#btnVerSenha", (e) => e.getBoundingClientRect().height)) >= 36, t + "login: botão de mostrar com alvo de toque");
    await p.fill("#senha", "lenta"); await p.click("#btnEntrar"); await p.waitForTimeout(250);
    S.ok((await p.getAttribute("#btnEntrar", "aria-busy")) === "true" && /Entrando/.test(await p.textContent("#btnEntrar")) && (await p.isDisabled("#btnEntrar")), t + "login: estado 'Entrando...' e botão travado (sem clique duplo)");
    await p.screenshot({ path: PR + "/login_carregando_" + w + "_" + tema + ".png" });
    await p.waitForTimeout(1100);
    S.ok(/incorretos/.test(await p.textContent("#loginErro")) && (await p.getAttribute("#senha", "aria-invalid")) === "true" && (await p.evaluate(() => document.activeElement.id)) === "senha", t + "login: erro curto, campo marcado e foco volta na senha");
    S.ok(!(await p.isDisabled("#btnEntrar")) && /^Entrar$/.test((await p.textContent("#btnEntrar")).trim()), t + "login: botão volta ao normal depois do erro");
    await p.screenshot({ path: PR + "/login_erro_" + w + "_" + tema + ".png" });
    S.ok(await p.evaluate(() => { const l = document.querySelector('label[for="usuario"]'), l2 = document.querySelector('label[for="senha"]'); return !!l && !!l2 && document.getElementById("loginErro").getAttribute("role") === "alert"; }), t + "login: rótulos ligados aos campos e erro com role=alert");
    await p.click("#btnVerSenha"); await p.fill("#senha", "certa"); await p.keyboard.press("Enter"); await p.waitForSelector("#app:not(.hide)", { timeout: 8000 }); await p.waitForTimeout(600);
    S.ok((await p.getAttribute("#senha", "type")) === "password", t + "login: depois de entrar a senha volta a ficar oculta");
    // ---- MENU ----
    const grupos = await p.$$eval("#nav .grp", (x) => x.map((e) => e.textContent)); S.ok(grupos.join("|") === "Atendimento|Marketing e vendas|Sistema|Guias|Administração", t + "menu: grupos na ordem " + grupos.join("|"));
    const itens = await p.$$eval("#nav a:not(.ext)", (x) => x.map((e) => e.textContent.replace(/\d+$/, ""))); S.ok(itens[0] === "Início e atalhos" && itens.length === 14, t + "menu: Início primeiro e 14 itens (" + itens.length + ")");
    S.ok(new Set(itens).size === itens.length, t + "menu: nomes sem repetição");
    S.ok((await sobra(p)) <= 0, t + "app: sem rolagem lateral");
    if (!mob) { await p.focus("#nav a"); await p.keyboard.press("Tab"); S.ok(await p.evaluate(() => document.activeElement.closest("#nav") !== null), t + "menu: alcançável por Tab"); await p.keyboard.press("Space"); await p.waitForTimeout(300); S.ok(/#atendimento/.test(p.url()), t + "menu: Espaço abre o item (" + p.url().split("#")[1] + ")"); await p.evaluate(() => window.__centralTeste.ir("inicio")); await p.waitForTimeout(300); }
    S.ok((await p.$$eval("#nav a.on", (x) => x.length)) === 1 && (await p.$eval("#nav a.on", (e) => e.getAttribute("aria-current"))) === "page", t + "menu: um só item ativo com aria-current");
    // ---- INÍCIO ----
    await p.evaluate(() => window.__centralTeste.ir("inicio")); await p.waitForSelector("[data-card=hoje]", { timeout: 8000 }); await p.waitForTimeout(500);
    const ids = await p.$$eval("[data-card]", (x) => x.map((e) => e.dataset.card));
    S.ok(!ids.includes("dash-outbound") && !ids.includes("hoje-felipe") && !ids.includes("dash-leads") && ids.filter((i) => i === "hoje").length === 1, t + "início: sem Dash Outbound, sem Hoje duplicado");
    S.ok(mob ? !ids.includes("dash-telao") && !!(await p.$("#hubVerTodos")) : ids.includes("dash-telao"), t + "início: " + (mob ? "celular esconde o telão e oferece Ver todos" : "computador mostra o telão"));
    S.ok((await sobra(p)) <= 0, t + "início: sem rolagem lateral");
    await p.screenshot({ path: PR + "/inicio_" + w + "_" + tema + ".png" });
    if (mob) { await p.click("#hubVerTodos"); await p.waitForTimeout(250); S.ok((await p.$$eval("[data-card]", (x) => x.length)) > ids.length, t + "início: Ver todos mostra mais"); await p.click("#hubVerTodos"); await p.waitForTimeout(150); }
    // reps
    await p.click("[data-card=painel-rep] .hmain"); await p.waitForSelector("#hubRepBusca", { timeout: 6000 }); await p.waitForTimeout(200);
    S.ok((await p.$$eval("#hubRepLista a", (x) => x.length)) === 12, t + "reps: 12 links"); S.ok((await sobra(p)) <= 0, t + "reps: sem rolagem lateral com a lista aberta");
    await p.fill("#hubRepBusca", "Exemplo 07"); await p.waitForTimeout(150); S.ok((await p.$$eval("#hubRepLista a", (x) => x.map((e) => e.getAttribute("href")))).join() === "/rep/dash/rep6/", t + "reps: busca acha o painel certo");
    S.ok((await p.$eval("#hubRepBusca", (e) => e.getBoundingClientRect().height)) >= 44, t + "reps: campo de busca com 44 px"); await p.fill("#hubRepBusca", "");
    await p.screenshot({ path: PR + "/reps_" + w + "_" + tema + ".png" });
    S.ok(await p.evaluate(() => { const a = [...document.querySelectorAll("#hubRepLista a")]; return a.every((x) => { const r = x.getBoundingClientRect(); return r.height >= 44 && r.right <= window.innerWidth; }); }), t + "reps: cada link com 44 px de altura e dentro da tela");
    // ---- INSTAGRAM: Troca ----
    await p.evaluate(() => window.__centralTeste.ir("instagram")); await p.waitForSelector(".igtab", { timeout: 6000 }); await p.click(".igtab:nth-of-type(4)"); await p.waitForSelector(".igtc", { timeout: 6000 }); await p.waitForTimeout(300);
    S.ok((await p.$$eval(".igtc", (x) => x.length)) === 2 && (await p.$$eval(".igto", (x) => x.length)) === 3, t + "troca: 2 rodadas, 3 opções na aberta"); S.ok(await p.$eval(".igt-aprovar", (e) => e.disabled), t + "troca: Aprovar travado até escolher");
    S.ok((await sobra(p)) <= 0, t + "troca: sem rolagem lateral");
    await p.screenshot({ path: PR + "/troca_" + w + "_" + tema + ".png" });
    await p.click(".igto:nth-of-type(1) input"); S.ok(!(await p.$eval(".igt-aprovar", (e) => e.disabled)), t + "troca: escolher liga o Aprovar");
    S.ok(await p.evaluate(() => [...document.querySelectorAll(".igtbt .btn, .igto")].every((e) => e.getBoundingClientRect().height >= 40)), t + "troca: botões e opções com altura de toque");
    await p.evaluate(() => window.__centralTeste.sair()); await p.waitForSelector("#usuario", { state: "visible", timeout: 8000 }); await p.waitForTimeout(300);
    S.ok((await p.getAttribute("#senha", "type")) === "password" && /Mostrar/.test(await p.textContent("#btnVerSenha")) && (await p.getAttribute("#btnVerSenha", "aria-pressed")) === "false", t + "login: depois de sair a senha continua oculta");
    S.ok(!(p._erros || []).length, t + "sem erro de JS: " + (p._erros || []).slice(0, 2).join(" | "));
    await ctx.close();
  }
  await b.close(); S.fim();
})();
