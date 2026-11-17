// Modo apresentação em slides (16/11/2026): sem rolagem em 1920x1080, 1366x768, 1024x768 e celular (390x844 em pé e 844x390 deitado), entrar e sair da tela cheia, setas, toque, tema, nomes proibidos.
import { t, resumo, abrirNavegador, abrirPagina, PRINTS, HTML } from "./_comum.mjs";
const nav = await abrirNavegador();
const TAM0 = [[1920, 1080], [1366, 768], [1024, 768], [390, 844], [360, 640], [844, 390]]; const TAM = process.env.ECO_TAM ? TAM0.filter(([w]) => String(w) === process.env.ECO_TAM) : TAM0;
const est = (page) => page.evaluate(() => window.__deck.estado());
const nSlides = await (async () => { const { ctx, page } = await abrirPagina(nav, { w: 1440, h: 900 }); const n = await page.evaluate(() => window.__deck.N); await ctx.close(); return n; })();
t("de 12 a 16 slides", nSlides >= 12 && nSlides <= 16, nSlides);
{ // nunca nomes de pessoas no HTML do deck nem da página
  const deckHtml = HTML.slice(HTML.indexOf('<div id="deck"'), HTML.indexOf("</div></div>", HTML.indexOf('class="ddots"')) + 12);
  t("HTML do deck existe", deckHtml.length > 2000);
  t("nenhum Felipe|Robert|Luiz|Thais|Gabriella (nem outros nomes) no HTML da página e do deck", !/(^|[^\p{L}])(Felipe|Robert|Roberto|Luiz|Thais|Thaís|Gabriella|Gabriela|Cleomar|Giselle|Natan|Bruno|Washington)([^\p{L}]|$)/u.test(HTML.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, " ")));
  t("sem número de telefone, e-mail ou chave no deck", !/(\(\d{2}\)\s?9?\d{4}-?\d{4}|[\w.]+@[\w.]+\.\w+|sk-[A-Za-z0-9]{16,})/.test(deckHtml));
}
for (const [w, h] of TAM) {
  const touch = w < 800 || h < 500; const id = `${w}x${h}`;
  const { ctx, page, erros } = await abrirPagina(nav, { w, h, touch });
  await page.click("#apBtn"); await page.waitForTimeout(500);
  t(`${id}: Apresentar abre o deck`, await page.evaluate(() => document.documentElement.classList.contains("deck-on") && !document.getElementById("deck").hidden));
  const N = await page.evaluate(() => window.__deck.N);
  const cobre = await page.evaluate(() => { const r = document.getElementById("deck").getBoundingClientRect(); return [r.width, r.height, innerWidth, innerHeight]; });
  t(`${id}: deck cobre a tela inteira`, cobre[0] === cobre[2] && cobre[1] === cobre[3], cobre);
  const sem = await page.evaluate(() => ({ sx: document.documentElement.scrollWidth <= innerWidth + 1, sy: getComputedStyle(document.documentElement).overflow === "hidden", bodyOver: getComputedStyle(document.body).overflow }));
  t(`${id}: página sem rolagem com o deck aberto`, sem.sx && sem.sy && sem.bodyOver === "hidden", sem);
  const tamMin = h < 500 ? 5.5 : w >= 1280 ? 11 : w >= 1000 ? 9 : w >= 380 ? 10.5 : 10; // celular deitado: palco 16:9 reduzido, texto pequeno por natureza (só tela cheia e sem rolagem são exigidos)
  for (let i = 0; i < N; i++) {
    await page.evaluate((k) => window.__deck.mostra(k), i); await page.waitForTimeout(1100);
    const r = await page.evaluate(() => {
      const st = document.getElementById("stage").getBoundingClientRect(); const esc = parseFloat(document.getElementById("deck").getAttribute("data-escala"));
      const s = document.querySelector(".slide.on"); const inn = s.querySelector(".sl-in"); const out = []; let min = 99;
      if (inn.scrollHeight > inn.clientHeight + 1 || inn.scrollWidth > inn.clientWidth + 1) out.push("estoura sl-in " + inn.scrollHeight + ">" + inn.clientHeight + " / " + inn.scrollWidth + ">" + inn.clientWidth);
      const ib = inn.getBoundingClientRect();
      s.querySelectorAll("*").forEach((e) => { if (e.closest(".sr") || e.closest(".sl-h") && s.classList.contains("s-capa")) return; const b = e.getBoundingClientRect(); if (!b.width || !b.height) return;
        if (b.right > ib.right + 2 || b.left < ib.left - 2 || b.bottom > ib.bottom + 2 || b.top < ib.top - 2) out.push("fora " + (e.className.baseVal ?? e.className) + " " + Math.round(b.bottom - ib.bottom));
        if (e.children.length === 0 && e.textContent.trim() && !(e instanceof SVGElement)) { const fs = parseFloat(getComputedStyle(e).fontSize) * esc; if (fs < min) min = fs; } });
      // título nunca sobrepõe o conteúdo, e o conteúdo respeita a folga da barra de controle
      const h = s.querySelector(".sl-h"); if (h && getComputedStyle(h).clip === "auto") { const hb = h.getBoundingClientRect().bottom; const tops = [...s.querySelector(".sl-b").querySelectorAll("*")].map((e) => e.getBoundingClientRect()).filter((r) => r.width && r.height).map((r) => r.top); if (tops.length && Math.min(...tops) < hb + 4) out.push("título sobrepõe o conteúdo " + Math.round(hb - Math.min(...tops))); const cb = document.getElementById("dctl").getBoundingClientRect(); const bots = [...s.querySelector(".sl-b").querySelectorAll("*")].map((e) => e.getBoundingClientRect()).filter((r) => r.width && r.height).map((r) => r.bottom); if (innerHeight >= 500 && bots.length && Math.max(...bots) > cb.top - 6 && Math.max(...bots) > 0) out.push("conteúdo encosta na barra de controle " + Math.round(Math.max(...bots) - cb.top)); }
      // sobreposição de cartões irmãos
      const grupos = s.querySelectorAll(".dg2,.dg3,.dsteps,.chain,.funis,.kan,.two,.eq");
      grupos.forEach((g) => { const f = [...g.children].map((c) => c.getBoundingClientRect()); for (let a = 0; a < f.length; a++) for (let b = a + 1; b < f.length; b++) { const A = f[a], B = f[b]; if (A.width && B.width && A.left < B.right - 3 && B.left < A.right - 3 && A.top < B.bottom - 3 && B.top < A.bottom - 3) out.push("sobrepõe em " + g.className); } });
      return { out: [...new Set(out)].slice(0, 6), min, id: s.id, vis: getComputedStyle(s).visibility, n: document.querySelectorAll(".slide.on").length };
    });
    t(`${id} slide ${i + 1} (${r.id}): cabe sem rolagem, nada fora nem sobreposto`, r.out.length === 0 && r.vis === "visible" && r.n === 1, r);
    t(`${id} slide ${i + 1}: menor texto >= ${tamMin}px na tela`, r.min >= tamMin, r.min);
    if (i === 0 || [5, 7, 10, 12].includes(i) || i === N - 1) await page.screenshot({ path: `${PRINTS}/deck_${id}_${String(i + 1).padStart(2, "0")}.png` });
  }
  // navegação
  await page.evaluate(() => window.__deck.mostra(0)); await page.waitForTimeout(100);
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("Space"); const a = (await est(page)).i;
  await page.keyboard.press("ArrowLeft"); const b = (await est(page)).i;
  t(`${id}: setas e espaço avançam e voltam`, a === 2 && b === 1, [a, b]);
  await page.keyboard.press("End"); const fim = (await est(page)).i; await page.keyboard.press("ArrowRight"); const fim2 = (await est(page)).i; await page.keyboard.press("Home"); const ini = (await est(page)).i; await page.keyboard.press("ArrowLeft");
  t(`${id}: End, Home e limites`, fim === N - 1 && fim2 === N - 1 && ini === 0 && (await est(page)).i === 0, [fim, fim2, ini]);
  t(`${id}: indicador "n / N" e hash acompanham`, await page.evaluate(() => document.getElementById("dInd").textContent === `${window.__deck.estado().i + 1} / ${window.__deck.N}` && location.hash === `#slide-${window.__deck.estado().i + 1}`));
  await page.evaluate(() => { document.getElementById("dctl").classList.remove("x"); document.getElementById("deck").classList.remove("quieto"); });
  await page.click("#dNext"); await page.waitForTimeout(80); t(`${id}: botão Próximo`, (await est(page)).i === 1);
  await page.click("#dPrev"); await page.waitForTimeout(80); t(`${id}: botão Anterior`, (await est(page)).i === 0);
  const ctl = await page.evaluate(() => { const r = document.getElementById("dctl").getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight && r.height >= 40; });
  t(`${id}: barra de controle cabe na tela`, ctl);
  if (touch) {
    const sw = async (dx) => { await page.evaluate(({ dx, w, h }) => { const d = document.getElementById("deck"); const mk = (x) => new Touch({ identifier: 1, target: d, clientX: x, clientY: h / 2 }); d.dispatchEvent(new TouchEvent("touchstart", { touches: [mk(w / 2)], changedTouches: [mk(w / 2)], bubbles: true })); d.dispatchEvent(new TouchEvent("touchend", { touches: [], changedTouches: [mk(w / 2 + dx)], bubbles: true })); }, { dx, w, h }); await page.waitForTimeout(100); };
    await sw(-120); const s1 = (await est(page)).i; await sw(120); const s2 = (await est(page)).i;
    t(`${id}: deslizar avança e volta`, s1 === 1 && s2 === 0, [s1, s2]);
  }
  // tema
  const t0 = await page.evaluate(() => getComputedStyle(document.getElementById("deck")).backgroundColor); await page.click("#dTema"); const t1 = await page.evaluate(() => getComputedStyle(document.getElementById("deck")).backgroundColor); await page.click("#dTema");
  t(`${id}: botão de tema muda o fundo`, t0 !== t1, [t0, t1]);
  // escuro e claro: print do slide 7
  await page.evaluate(() => { document.documentElement.setAttribute("data-theme", "dark"); window.__deck.mostra(6); }); await page.waitForTimeout(700); await page.screenshot({ path: `${PRINTS}/deck_${id}_escuro_07.png` });
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  // tela cheia e Esc
  const fs = await page.evaluate(() => !!document.fullscreenElement); console.log(`  (informativo) ${id}: tela cheia nativa:`, fs);
  await page.keyboard.press("Escape"); await page.waitForTimeout(500);
  t(`${id}: Esc sai da apresentação e da tela cheia`, await page.evaluate(() => !document.documentElement.classList.contains("deck-on") && document.getElementById("deck").hidden && !document.fullscreenElement));
  t(`${id}: página volta a rolar normalmente`, await page.evaluate(() => getComputedStyle(document.body).overflow !== "hidden"));
  await page.click("#apBtn"); await page.waitForTimeout(250); await page.click("#dExit"); await page.waitForTimeout(250);
  t(`${id}: botão X sai`, await page.evaluate(() => document.getElementById("deck").hidden));
  t(`${id}: sem erro de JS`, erros.length === 0, erros);
  await ctx.close();
}
// atualizar a página dentro do deck mantém o slide
{ const { ctx, page } = await abrirPagina(nav, { w: 1440, h: 900, hash: "#slide-4" }); await page.waitForTimeout(500);
  t("abrir com #slide-4 abre o deck no 4º slide", (await est(page)).aberto && (await est(page)).i === 3);
  await page.keyboard.press("ArrowRight"); await page.waitForTimeout(100); await page.reload({ waitUntil: "load" }); await page.waitForTimeout(600);
  t("atualizar mantém o slide", (await est(page)).aberto && (await est(page)).i === 4, await est(page)); await ctx.close(); }
// data de atualização e estado.json na página
{ const { ctx, page } = await abrirPagina(nav, { w: 1440, h: 900 });
  const r = await page.evaluate(() => { const j = JSON.parse(document.getElementById("estado-eco").textContent); return { j: j.atualizado_em, txt: document.body.textContent.includes("Atualizado em " + j.atualizado_em) || document.body.textContent.includes("atualizado em " + j.atualizado_em), slide: document.getElementById("sl-capa").textContent.includes(j.atualizado_em), n: j.componentes.length }; });
  t("a data 'atualizado em' da página e do deck vem do estado.json", r.txt && r.slide && /^\d{2}\/\d{2}\/\d{4}$/.test(r.j) && r.n >= 5, r); await ctx.close(); }
await nav.close(); resumo();
