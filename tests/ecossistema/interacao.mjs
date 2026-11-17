// Interação do Ecossistema no Chromium real (14/11/2026): menu, busca, hash, posição ao atualizar, tema, teclado, (o modo apresentação em slides é testado em apresentacao.mjs).
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
}
// ---------- hash malformado e logo que falha ----------
{ const { ctx, page, erros } = await abrirPagina(nav, { w: 1440, h: 900, hash: "#%E0%A4%A" }); await page.waitForTimeout(400);
  t("hash malformado (#%E0%A4%A) não gera erro de JS e a página abre", erros.length === 0 && (await page.evaluate(() => document.querySelectorAll("main .sec").length)) === 23, erros);
  await page.click("#apBtn"); await page.waitForTimeout(300); t("hash malformado: a apresentação ainda abre", await page.evaluate(() => document.documentElement.classList.contains("deck-on"))); await ctx.close(); }
for (const w of [640, 700, 740, 770]) { const ctx = await nav.newContext({ viewport: { width: w, height: 900 } }); const p = await ctx.newPage();
  await p.route("https://projetojlbv.com.br/ecossistema/**", (r) => r.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: HTML }));
  await p.route("https://projetojlbv.com.br/*.png", (r) => r.abort()); await p.goto(URL_PAGINA, { waitUntil: "load" }); await p.waitForTimeout(500);
  t(`logo que falha em ${w}px: cabeçalho sem rolagem lateral`, await semRolagemLateral(p)); await ctx.close(); }
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
