// Interação do Ecossistema no Chromium real (14/11/2026): menu, busca, hash, posição ao atualizar, tema, teclado, modo apresentação (entrar, avançar, voltar, sair, Esc, atualizar, deslizar).
import { t, resumo, abrirNavegador, abrirPagina, semRolagemLateral, PRINTS, HTML, URL_PAGINA } from "./_comum.mjs";
const nav = await abrirNavegador();
const secVisiveis = (page) => page.evaluate(() => [...document.querySelectorAll("main .sec")].filter((s) => getComputedStyle(s).display !== "none").map((s) => s.id));
const topoDe = (page, id) => page.evaluate((i) => Math.round(document.getElementById(i).getBoundingClientRect().top), id);
const est = (page) => page.evaluate(() => window.__eco.estado());
// em seção longa a seta rola por partes antes de trocar: repete até trocar de seção (máx. 25 toques)
const passo = async (page, tecla) => { const a = (await est(page)).i; for (let k = 0; k < 25; k++) { await page.keyboard.press(tecla); await page.waitForTimeout(120); const b = (await est(page)).i; if (b !== a) return b; } return a; };
for (const [w, h] of [[390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]]) {
  const touch = w < 800; const id = String(w);
  // ---------- navegação, hash, busca, tema ----------
  { const { ctx, page, erros } = await abrirPagina(nav, { w, h, touch });
    const lateral = w >= 1180;
    if (!lateral) {
      t(`${id}: índice começa fechado`, await page.evaluate(() => !document.getElementById("side").classList.contains("open")));
      await page.click("#menuBtn");
      t(`${id}: botão Menu abre o índice (aria-expanded)`, await page.evaluate(() => document.getElementById("menuBtn").getAttribute("aria-expanded") === "true" && document.getElementById("side").classList.contains("open")));
    }
    await page.fill("#busca", "recuperação");
    t(`${id}: busca filtra o índice`, await page.evaluate(() => { const v = [...document.querySelectorAll(".toc li[data-id]")].filter((l) => !l.classList.contains("off")).length; return v > 0 && v < 23; }));
    await page.fill("#busca", "");
    await page.click('.toc a[href="#cadencia"]'); await page.waitForTimeout(2600);
    t(`${id}: link do índice leva à seção e atualiza o endereço`, (await page.evaluate(() => location.hash)) === "#cadencia" && Math.abs(await topoDe(page, "cadencia")) < 140, [await page.evaluate(() => location.hash), await topoDe(page, "cadencia")]);
    t(`${id}: menu fecha ao escolher (celular e tablet)`, lateral || (await page.evaluate(() => !document.getElementById("side").classList.contains("open"))));
    t(`${id}: item atual do índice marcado (aria-current)`, await page.evaluate(() => document.querySelector('.toc a[aria-current="true"]')?.getAttribute("href") === "#cadencia"), await page.evaluate(() => document.querySelector('.toc a[aria-current="true"]')?.getAttribute("href")));
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await page.waitForTimeout(300);
    const th = () => page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    const t0 = await th(); await page.click("#temaBtn"); const t1 = await th(); await page.click("#temaBtn"); const t2 = await th(); await page.click("#temaBtn"); const t3 = await th();
    t(`${id}: botão de tema alterna automático, claro, escuro`, t0 === null && t1 === "light" && t2 === "dark" && t3 === null, [t0, t1, t2, t3]);
    t(`${id}: sem erro de JS`, erros.length === 0, erros); await ctx.close();
  }
  // ---------- hash na abertura ----------
  { const { ctx, page } = await abrirPagina(nav, { w, h, touch, hash: "#destinos" }); await page.waitForTimeout(500);
    t(`${id}: abrir com #destinos cai na seção Funis`, Math.abs(await topoDe(page, "destinos")) < 130, await topoDe(page, "destinos")); await ctx.close(); }
  // ---------- posição ao atualizar (bug de voltar ao topo) ----------
  { const { ctx, page } = await abrirPagina(nav, { w, h, touch });
    await page.evaluate(() => { const s = document.getElementById("ana"); scrollTo({ top: s.getBoundingClientRect().top + scrollY + 900, behavior: "instant" }); window.dispatchEvent(new Event("wheel")); });
    await page.waitForTimeout(700);
    const antes = await page.evaluate(() => ({ y: scrollY, id: location.hash }));
    await page.reload({ waitUntil: "load" }); await page.waitForTimeout(900);
    const depois = await page.evaluate(() => ({ y: scrollY, id: location.hash }));
    t(`${id}: atualizar a página NÃO volta ao topo e mantém o lugar (±40px)`, antes.y > 500 && Math.abs(depois.y - antes.y) <= 40, { antes, depois });
    await page.evaluate(() => history.replaceState(null, "", location.pathname)); await page.reload({ waitUntil: "load" }); await page.waitForTimeout(900);
    const d2 = await page.evaluate(() => scrollY);
    t(`${id}: atualizar sem hash na barra também mantém o lugar (±40px)`, Math.abs(d2 - antes.y) <= 40, { antes: antes.y, d2 });
    await page.evaluate(() => { document.querySelector("#destinos details.fx").open = true; }); await page.waitForTimeout(100);
    await page.reload({ waitUntil: "load" }); await page.waitForTimeout(700);
    t(`${id}: bloco aberto continua aberto depois de atualizar`, await page.evaluate(() => document.querySelector("#destinos details.fx").open === true));
    await ctx.close(); }
  // ---------- modo apresentação ----------
  { const { ctx, page, erros } = await abrirPagina(nav, { w, h, touch }); const N = await page.evaluate(() => window.__eco.N);
    await page.click("#apBtn"); await page.waitForTimeout(350);
    const v = await secVisiveis(page);
    t(`${id}: apresentação abre com UMA seção visível`, v.length === 1 && await page.evaluate(() => document.documentElement.classList.contains("apres")), v);
    t(`${id}: barra de controle, progresso e título visíveis`, await page.evaluate(() => { const b = document.getElementById("apbar").getBoundingClientRect(); const p = document.querySelector(".approg").getBoundingClientRect(); return b.height > 30 && b.bottom <= innerHeight + 1 && p.height > 2 && document.getElementById("apT").textContent.length > 2; }));
    t(`${id}: topo da página (menu e logo) escondido em apresentação`, await page.evaluate(() => getComputedStyle(document.querySelector(".mast")).display === "none"));
    t(`${id}: sem rolagem lateral em apresentação`, await semRolagemLateral(page));
    const i0 = (await est(page)).i;
    const i1 = await passo(page, "ArrowRight");
    const i2 = await passo(page, "Space");
    const i3 = await passo(page, "ArrowLeft");
    t(`${id}: setas e espaço avançam e voltam`, i1 === i0 + 1 && i2 === i0 + 2 && i3 === i0 + 1, [i0, i1, i2, i3]);
    await page.keyboard.press("End"); await page.waitForTimeout(150); const ie = (await est(page)).i; await page.evaluate(() => { const m = document.querySelector("main"); m.scrollTop = m.scrollHeight; }); await page.keyboard.press("ArrowRight"); await page.waitForTimeout(150); const ie2 = (await est(page)).i;
    await page.waitForTimeout(500); const nextDis = await page.evaluate(() => document.getElementById("apNext").disabled === true);
    await page.keyboard.press("Home"); await page.waitForTimeout(80); const ih = (await est(page)).i;
    t(`${id}: End vai ao fim e não passa dele; Home volta ao começo`, ie === N - 1 && ie2 === N - 1 && ih === 0, [ie, ie2, ih]);
    t(`${id}: botões Anterior (na primeira) e Próxima (na última) ficam desabilitados`, nextDis && await page.evaluate(() => document.getElementById("apPrev").disabled === true));
    { let k = 0; while ((await est(page)).i === 0 && k++ < 25) { await page.click("#apNext"); await page.waitForTimeout(150); } t(`${id}: botão Próxima funciona (rola por partes e depois troca de seção)`, (await est(page)).i === 1, k); }
    { let k = 0; while ((await est(page)).i === 1 && k++ < 25) { await page.click("#apPrev"); await page.waitForTimeout(150); } t(`${id}: botão Anterior funciona`, (await est(page)).i === 0, k); }
    t(`${id}: seção longa mostra "parte x de y"`, await page.evaluate(() => /parte \d+ de \d+/.test(document.getElementById("apC").textContent) || document.querySelector("main").scrollHeight <= document.querySelector("main").clientHeight + 20));
    const prog = await page.evaluate(() => [document.querySelector(".approg").getAttribute("aria-valuenow"), document.querySelector(".approg i").style.width]);
    t(`${id}: indicador de progresso acompanha`, prog[0] === "1" && parseFloat(prog[1]) > 0, prog);
    await page.keyboard.press("?"); await page.waitForTimeout(80); const aj1 = await page.evaluate(() => !document.getElementById("aphelp").hidden);
    await page.keyboard.press("Escape"); await page.waitForTimeout(80); const aj2 = await page.evaluate(() => [!document.getElementById("aphelp").hidden, document.documentElement.classList.contains("apres")]);
    t(`${id}: ? abre os atalhos e Esc fecha só os atalhos`, aj1 && aj2[0] === false && aj2[1] === true, [aj1, aj2]);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press("End"); await page.waitForTimeout(150); await page.keyboard.press("Home"); await passo(page, "ArrowRight"); await passo(page, "ArrowRight"); await passo(page, "ArrowRight"); await page.waitForTimeout(100);
    const antes = await page.evaluate(() => ({ i: window.__eco.estado().i, h: location.hash }));
    await page.reload({ waitUntil: "load" }); await page.waitForTimeout(700);
    const dep = await page.evaluate(() => ({ ap: document.documentElement.classList.contains("apres"), i: window.__eco.estado().i, h: location.hash }));
    t(`${id}: atualizar mantém o modo apresentação na mesma seção`, dep.ap && dep.i === antes.i && dep.h === antes.h, { antes, dep });
    if (touch) {
      await page.keyboard.press("Home"); await page.waitForTimeout(80); const i_a = (await est(page)).i;
      await page.evaluate(({ w, h }) => { const m = document.querySelector("main"); const mk = (x, y) => new Touch({ identifier: 1, target: m, clientX: x, clientY: y }); m.dispatchEvent(new TouchEvent("touchstart", { touches: [mk(w * 0.8, h / 2)], changedTouches: [mk(w * 0.8, h / 2)], bubbles: true })); m.dispatchEvent(new TouchEvent("touchend", { touches: [], changedTouches: [mk(w * 0.2, h / 2 + 10)], bubbles: true })); }, { w, h });
      await page.waitForTimeout(100); const i_b = (await est(page)).i;
      t(`${id}: deslizar para a esquerda avança a seção`, i_b === i_a + 1, [i_a, i_b]);
    }
    await page.keyboard.press("Home"); await passo(page, "ArrowRight"); await passo(page, "ArrowRight"); await page.waitForTimeout(250); await page.screenshot({ path: `${PRINTS}/apres_${id}_a.png` });
    await page.keyboard.press("?"); await page.waitForTimeout(150); await page.screenshot({ path: `${PRINTS}/apres_${id}_ajuda.png` }); await page.keyboard.press("Escape");
    const idAtual = await page.evaluate(() => window.__eco.ids[window.__eco.estado().i]);
    await page.keyboard.press("Escape"); await page.waitForTimeout(400);
    const sai = await page.evaluate((ida) => ({ ap: document.documentElement.classList.contains("apres"), vis: [...document.querySelectorAll("main .sec")].filter((s) => getComputedStyle(s).display !== "none").length, top: Math.round(document.getElementById(ida).getBoundingClientRect().top), mast: getComputedStyle(document.querySelector(".mast")).display }), idAtual);
    t(`${id}: Esc sai da apresentação e volta à mesma seção`, !sai.ap && sai.vis === 23 && Math.abs(sai.top) < 140 && sai.mast !== "none", sai);
    t(`${id}: sem erro de JS (apresentação)`, erros.length === 0, erros);
    await page.click("#apBtn"); await page.waitForTimeout(250); await page.click("#apExit"); await page.waitForTimeout(250);
    t(`${id}: botão Sair da barra também sai`, await page.evaluate(() => !document.documentElement.classList.contains("apres")));
    await ctx.close(); }
}
// ---------- hash malformado e logo que falha ----------
{ const { ctx, page, erros } = await abrirPagina(nav, { w: 1440, h: 900, hash: "#%E0%A4%A" }); await page.waitForTimeout(400);
  t("hash malformado (#%E0%A4%A) não gera erro de JS e a página abre", erros.length === 0 && (await page.evaluate(() => document.querySelectorAll("main .sec").length)) === 23, erros);
  await page.click("#apBtn"); await page.waitForTimeout(200); t("hash malformado: apresentação ainda abre", await page.evaluate(() => document.documentElement.classList.contains("apres"))); await ctx.close(); }
for (const w of [640, 700, 740, 770]) { const ctx = await nav.newContext({ viewport: { width: w, height: 900 } }); const p = await ctx.newPage();
  await p.route("https://projetojlbv.com.br/ecossistema/**", (r) => r.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: HTML }));
  await p.route("https://projetojlbv.com.br/*.png", (r) => r.abort()); await p.goto(URL_PAGINA, { waitUntil: "load" }); await p.waitForTimeout(500);
  t(`logo que falha em ${w}px: cabeçalho sem rolagem lateral`, await semRolagemLateral(p)); await ctx.close(); }
// ---------- tela cheia real (quando o navegador permite) ----------
{ const { ctx, page } = await abrirPagina(nav, { w: 1440, h: 900 });
  await page.click("#apBtn"); await page.waitForTimeout(600);
  const fs = await page.evaluate(() => !!document.fullscreenElement);
  console.log("  (informativo) tela cheia nativa no Chromium headless:", fs);
  if (fs) { await page.keyboard.press("f"); await page.waitForTimeout(500); t("tela cheia: tecla F sai da tela cheia sem sair da apresentação", await page.evaluate(() => !document.fullscreenElement && document.documentElement.classList.contains("apres"))); await page.keyboard.press("f"); await page.waitForTimeout(500); }
  await page.keyboard.press("Escape"); await page.waitForTimeout(500);
  t("Esc sai da apresentação (com ou sem tela cheia)", await page.evaluate(() => !document.documentElement.classList.contains("apres")));
  await ctx.close(); }
// ---------- sem API de tela cheia (iPhone): apresentação cobre a janela ----------
{ const ctx2 = await nav.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const p2 = await ctx2.newPage(); const er = [];
  p2.on("pageerror", (e) => er.push(String(e.message)));
  await p2.addInitScript(() => { Object.defineProperty(Element.prototype, "requestFullscreen", { value: undefined, configurable: true }); Object.defineProperty(Element.prototype, "webkitRequestFullscreen", { value: undefined, configurable: true }); });
  await p2.route("https://projetojlbv.com.br/**", (r) => /ecossistema/.test(r.request().url()) ? r.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: HTML }) : r.fulfill({ status: 204, body: "" }));
  await p2.goto(URL_PAGINA, { waitUntil: "load" }); await p2.waitForTimeout(400);
  await p2.click("#apBtn"); await p2.waitForTimeout(300);
  t("sem tela cheia no navegador: apresentação abre, botão de tela cheia some e o aviso aparece nos atalhos", await p2.evaluate(() => document.documentElement.classList.contains("apres") && document.getElementById("apFs").hidden === true && document.getElementById("semFs").hidden === false) && er.length === 0, er);
  await p2.screenshot({ path: `${PRINTS}/apres_semfs_390.png` }); await ctx2.close(); }
// ---------- teclado e acessibilidade ----------
{ const { ctx, page } = await abrirPagina(nav, { w: 1440, h: 900 });
  await page.keyboard.press("Tab"); t("a11y: primeiro Tab vai para o link 'Pular para o conteúdo'", await page.evaluate(() => document.activeElement.className === "skip"));
  const foco = []; for (let k = 0; k < 8; k++) { await page.keyboard.press("Tab"); const r = await page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { n: (e.id || e.className || e.tagName), vis: (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2) }; }); if (!r.vis) foco.push(r.n); }
  t("a11y: foco do teclado visível nos primeiros 8 controles", foco.length === 0, foco);
  const nomes = await page.evaluate(() => [...document.querySelectorAll("button, a, input, summary")].filter((e) => !(e.getAttribute("aria-label") || e.textContent.trim() || e.getAttribute("title") || e.labels?.length)).map((e) => e.outerHTML.slice(0, 80)));
  t("a11y: todo botão, link e campo tem nome acessível", nomes.length === 0, nomes);
  const alvo = await page.evaluate(() => [...document.querySelectorAll(".mast .btn")].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.height < 40 || r.width < 40); }).length);
  t("a11y: botões do topo têm alvo >= 40 px", alvo === 0, alvo);
  await ctx.close(); }
await nav.close(); resumo();
