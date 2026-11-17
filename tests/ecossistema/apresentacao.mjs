// Modo apresentação em slides (16/11/2026): sem rolagem em 1920x1080, 1366x768, 1024x768 e celular (390x844 em pé e 844x390 deitado), entrar e sair da tela cheia, setas, toque, tema, nomes proibidos.
import { t, resumo, abrirNavegador, abrirPagina, PRINTS, HTML } from "./_comum.mjs";
const nav = await abrirNavegador();
const TAM0 = [[1920, 1080], [1366, 768], [1024, 768], [390, 844], [360, 640], [844, 390]]; const TAM = process.env.ECO_TAM ? TAM0.filter(([w]) => String(w) === process.env.ECO_TAM) : TAM0;
const est = (page) => page.evaluate(() => window.__deck.estado());
const nSlides = await (async () => { const { ctx, page } = await abrirPagina(nav, { w: 1440, h: 900 }); const n = await page.evaluate(() => window.__deck.N); await ctx.close(); return n; })();
t("de 15 a 35 slides (deck enxuto; os detalhes ficam na página longa)", nSlides >= 15 && nSlides <= 35, nSlides);
{ // nunca nomes de pessoas no HTML do deck nem da página
  const deckHtml = HTML.slice(HTML.indexOf('<div id="deck"'), HTML.indexOf("</body>"));
  t("HTML do deck existe", deckHtml.length > 2000);
  t("nenhum Felipe|Robert|Luiz|Thais|Gabriella (nem outros nomes) no HTML da página e do deck", !/(^|[^\p{L}])(Felipe|Robert|Roberto|Luiz|Thais|Thaís|Gabriella|Gabriela|Cleomar|Giselle|Natan|Bruno|Washington)([^\p{L}]|$)/u.test(HTML.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, " ")));
  t("sem número de telefone, e-mail ou chave no deck", !/(\(\d{2}\)\s?9?\d{4}-?\d{4}|[\w.]+@[\w.]+\.\w+|sk-[A-Za-z0-9]{16,})/.test(deckHtml));
}
{ const { ctx, page } = await abrirPagina(nav, { w: 1440, h: 900 });
  const cob = await page.evaluate(() => { const ids = [...document.querySelectorAll("main .sec")].map((x) => x.id); const cobertas = new Set([...document.querySelectorAll(".slide")].flatMap((x) => (x.getAttribute("data-sec") || "").split(",").filter(Boolean))); return { ids, faltam: ids.filter((i) => !cobertas.has(i)), caps: [...new Set([...document.querySelectorAll(".slide")].map((x) => x.getAttribute("data-cap")))] }; });
  t("cobertura: toda seção da página tem ao menos 1 slide", cob.faltam.length === 0, cob.faltam);
  t("slides agrupados em capítulos (>= 6)", cob.caps.length >= 6, cob.caps);
  t("slide 'Quem é quem' logo no início", await page.evaluate(() => [...document.querySelectorAll(".slide")].slice(0, 4).some((x) => /Quem é quem/.test(x.getAttribute("data-t")))));
  await ctx.close(); }
for (const [w, h] of TAM) {
  const touch = w < 800 || h < 500; const id = `${w}x${h}`;
  const { ctx, page, erros } = await abrirPagina(nav, { w, h, touch });
  await page.click("#apBtn"); await page.waitForTimeout(500); await page.evaluate(() => Promise.all([...document.querySelectorAll(".dlogo img, .capa-logo")].map((i) => (i.decode ? i.decode().catch(() => {}) : null))));
  t(`${id}: Apresentar abre o deck`, await page.evaluate(() => document.documentElement.classList.contains("deck-on") && !document.getElementById("deck").hidden));
  const N = await page.evaluate(() => window.__deck.N);
  const cobre = await page.evaluate(() => { const r = document.getElementById("deck").getBoundingClientRect(); return [r.width, r.height, innerWidth, innerHeight]; });
  t(`${id}: deck cobre a tela inteira`, cobre[0] === cobre[2] && cobre[1] === cobre[3], cobre);
  const sem = await page.evaluate(() => ({ sx: document.documentElement.scrollWidth <= innerWidth + 1, sy: getComputedStyle(document.documentElement).overflow === "hidden", bodyOver: getComputedStyle(document.body).overflow }));
  t(`${id}: página sem rolagem com o deck aberto`, sem.sx && sem.sy && sem.bodyOver === "hidden", sem);
  const svgMin = h < 500 ? 4.5 : w >= 1280 ? 11 : w >= 1000 ? 8.5 : w >= 380 ? 9.3 : 8.4;
  const tamMin = h < 500 ? 5.5 : w >= 1280 ? 11 : w >= 1000 ? 8 : w >= 380 ? 10 : 9; // celular deitado: palco 16:9 reduzido, texto pequeno por natureza (só tela cheia e sem rolagem são exigidos)
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
      if (s.classList.contains("s-capa")) { const cb2 = document.getElementById("dctl").getBoundingClientRect(); const ct = s.querySelector(".capa-t").getBoundingClientRect(); const cg = s.querySelector(".capa-g"); const gb = cg ? cg.getBoundingClientRect() : null; if (innerHeight >= 500 && (ct.bottom > cb2.top - 4 || (gb && gb.bottom > cb2.top - 4))) out.push("capa encosta na barra de controle " + Math.round(ct.bottom - cb2.top)); if (ct.top < 0 || ct.left < 0) out.push("capa fora da tela"); }
      if (s.classList.contains("flow")) { const fig = s.querySelector(".dfig"); const vis = [...fig.querySelectorAll(".svgd")].find((d) => getComputedStyle(d).display !== "none"); const svg = vis && vis.querySelector("svg"); if (!svg) out.push("fluxograma sem desenho visível"); else { const sb = document.getElementById("stage").getBoundingClientRect(), fb = fig.getBoundingClientRect(); const bad = []; svg.querySelectorAll(".nd, .lb, .eds path").forEach((e) => { const b = e.getBoundingClientRect(); if (b.left < sb.left - 1 || b.right > sb.right + 1 || b.top < sb.top - 1 || b.bottom > sb.bottom + 1 || b.left < fb.left - 2 || b.right > fb.right + 2 || b.top < fb.top - 2 || b.bottom > fb.bottom + 2) bad.push("extrapola " + (e.className.baseVal || e.tagName)); }); svg.querySelectorAll(".nd").forEach((g) => { const r = g.querySelector("rect").getBoundingClientRect(); g.querySelectorAll("text").forEach((tx) => { const b = tx.getBoundingClientRect(); if (b.left < r.left - 1 || b.right > r.right + 1 || b.top < r.top - 1 || b.bottom > r.bottom + 1) bad.push("texto fora da caixa"); }); }); out.push(...new Set(bad)); } }
      // sobreposição de cartões irmãos
      const grupos = s.querySelectorAll(".dg2,.dg3,.dsteps,.chain,.funis,.kan,.two,.eq");
      grupos.forEach((g) => { const f = [...g.children].map((c) => c.getBoundingClientRect()); for (let a = 0; a < f.length; a++) for (let b = a + 1; b < f.length; b++) { const A = f[a], B = f[b]; if (A.width && B.width && A.left < B.right - 3 && B.left < A.right - 3 && A.top < B.bottom - 3 && B.top < A.bottom - 3) out.push("sobrepõe em " + g.className); } });
      const logoFixa = (() => { const d = document.querySelector(".dlogo"); const i = [...d.querySelectorAll("img")].find((z) => getComputedStyle(z).display !== "none"); return { dl: getComputedStyle(d).display, ok: !!i && i.complete && i.naturalWidth > 0, w: i ? Math.round(i.getBoundingClientRect().width) : 0 }; })();
      let svgMin = null; s.querySelectorAll("svg.capa-g").forEach(() => {}); s.querySelectorAll(".dfig .svgd svg").forEach((sv) => { if (getComputedStyle(sv.parentElement).display === "none") return; sv.querySelectorAll("text").forEach((tx) => { const fs = parseFloat(getComputedStyle(tx).fontSize) * tx.getScreenCTM().a; if (svgMin === null || fs < svgMin) svgMin = fs; }); });
      return { out: [...new Set(out)].slice(0, 6), min, svgMin, logoFixa, capa: s.classList.contains("s-capa"), id: s.id, vis: getComputedStyle(s).visibility, n: document.querySelectorAll(".slide.on").length };
    });
    if (process.env.ECO_ALLFLOW && await page.evaluate(() => document.querySelector(".slide.on").classList.contains("flow"))) await page.screenshot({ path: `${PRINTS}/flow_${id}_${String(i + 1).padStart(2, "0")}_${r.id.slice(3)}.png` });
    t(`${id} slide ${i + 1} (${r.id}): cabe sem rolagem, nada fora nem sobreposto`, r.out.length === 0 && r.vis === "visible" && r.n === 1, r);
    t(`${id} slide ${i + 1}: menor texto >= ${tamMin}px na tela`, r.min >= tamMin, r.min);
    t(`${id} slide ${i + 1}: logo ${r.capa ? "fixa some na capa (a logo grande aparece)" : "da Life B visível"}`, r.capa ? r.logoFixa.dl === "none" : (r.logoFixa.dl !== "none" && r.logoFixa.ok && r.logoFixa.w > 20), r.logoFixa);
    if (r.svgMin !== null) t(`${id} slide ${i + 1}: texto do fluxograma >= ${svgMin}px na tela`, r.svgMin >= svgMin, r.svgMin);
    if (["capa", "ana", "quem1", "estado", "mapa", "ponte", "jor", "msg", "sdrfluxo", "volta", "autom", "av", "hoje", "cenarq", "cenmod"].some((c) => r.id === "sl-" + c)) await page.screenshot({ path: `${PRINTS}/deck_${id}_${String(i + 1).padStart(2, "0")}.png` });
  }
  // logo (A) e controles (B)
  const lgs = () => page.evaluate(() => { const vis = [...document.querySelectorAll(".dlogo img")].filter((i) => getComputedStyle(i).display !== "none"); const i = vis[0]; const r = i ? i.getBoundingClientRect() : null; const s = document.querySelector(".slide.on"); const textoRects = (el) => { const r = document.createRange(); r.selectNodeContents(el); return [...r.getClientRects()]; }; const alvo = [...[...s.querySelectorAll(".kick, h2")].flatMap(textoRects), ...[...s.querySelectorAll(".sl-b, .sl-b *")].map((e) => e.getBoundingClientRect())].filter((b) => b.width && b.height); const c = document.getElementById("dctl").getBoundingClientRect(); const ov = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1; return { n: vis.length, ok: !!i && i.complete && i.naturalWidth > 0, alt: i ? i.alt : "", h: r ? Math.round(r.height) : 0, sobreConteudo: r ? alvo.some((b) => ov(r, b)) : false, sobreBarra: r ? ov(r, c) : false, dentro: r ? r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight : false, cover: getComputedStyle(document.querySelector(".dlogo")).display }; });
  await page.evaluate(() => { document.getElementById("deck").classList.remove("quieto"); window.__deck.mostra(6); }); await page.waitForTimeout(900);
  const L1 = await lgs();
  t(`${id}: logo da Life B carrega (imagem real), cabe na tela e não cobre conteúdo nem a barra de controle (tema claro)`, L1.n === 1 && L1.ok && L1.alt === "Life B" && L1.h >= (h < 500 ? 22 : 24) && !L1.sobreConteudo && !L1.sobreBarra && L1.dentro, L1);
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark")); await page.waitForTimeout(300);
  const L2 = await lgs(); const darkSrc = await page.evaluate(() => [...document.querySelectorAll(".dlogo img")].find((i) => getComputedStyle(i).display !== "none")?.getAttribute("src"));
  t(`${id}: logo no tema escuro (versão escura) carrega e não cobre nada`, L2.ok && darkSrc === "/logo-lifeb-escuro.png" && !L2.sobreConteudo && !L2.sobreBarra, [L2, darkSrc]);
  await page.evaluate(() => { window.__deck.mostra(0); }); await page.waitForTimeout(700);
  const cv = await page.evaluate(() => { const i = [...document.querySelectorAll("#sl-capa .capa-logo")].find((x) => getComputedStyle(x).display !== "none"); const r = i && i.getBoundingClientRect(); return { ok: !!i && i.complete && i.naturalWidth > 0, h: r ? Math.round(r.height) : 0, dentro: r ? r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight : false, fixo: getComputedStyle(document.querySelector(".dlogo")).display }; });
  t(`${id}: logo maior na capa (carrega, dentro da tela) e a logo fixa some na capa`, cv.ok && cv.dentro && cv.fixo === "none", cv);
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme")); await page.evaluate(() => window.__deck.mostra(6)); await page.waitForTimeout(500);
  const bts = await page.evaluate(() => [...document.querySelectorAll("#dctl .db")].map((b) => { const r = b.getBoundingClientRect(); return { id: b.id, w: Math.round(r.width), h: Math.round(r.height), vis: r.width > 0 }; }));
  const bar = await page.evaluate(() => { const r = document.getElementById("dctl").getBoundingClientRect(); const lis = [...document.querySelectorAll("#dctl .db, #dctl .dind")].map((e) => e.getBoundingClientRect()); const sobrepoe = lis.some((a, k) => lis.some((b, m) => m > k && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1)); const alinhados = Math.max(...lis.map((q) => q.top + q.height / 2)) - Math.min(...lis.map((q) => q.top + q.height / 2)) < 3; return { dentro: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, centro: Math.abs((r.left + r.right) / 2 - innerWidth / 2) < 3, sobrepoe, alinhados }; });
  t(`${id}: barra de controle alinhada, centralizada, sem botões sobrepostos e dentro da tela`, bar.dentro && bar.centro && !bar.sobrepoe && bar.alinhados, bar);
  if (touch) t(`${id}: todos os botões de controle com alvo de toque >= 44px`, bts.filter((b) => b.vis).every((b) => b.w >= 44 && b.h >= 44), bts);
  await page.focus("#dPrev"); await page.keyboard.press("Tab"); const foco = await page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { id: e.id, ow: parseFloat(cs.outlineWidth), os: cs.outlineStyle }; });
  t(`${id}: foco do teclado visível nos botões de controle`, foco.id === "dNext" && foco.ow >= 2 && foco.os !== "none", foco);
  await page.hover("#dIdx"); await page.waitForTimeout(250); const hov = await page.evaluate(() => getComputedStyle(document.getElementById("dIdx")).backgroundColor); await page.mouse.move(5, 5); await page.waitForTimeout(250); const nor = await page.evaluate(() => getComputedStyle(document.getElementById("dIdx")).backgroundColor);
  if (!touch) t(`${id}: estado hover do botão é diferente do normal`, hov !== nor, [hov, nor]);
  // índice (G)
  await page.keyboard.press("g"); await page.waitForTimeout(200);
  const ix1 = await page.evaluate(() => !document.getElementById("didx").hidden && document.querySelectorAll(".ix-b").length === window.__deck.N);
  await page.click(".ix-b[data-i='5']"); await page.waitForTimeout(200);
  const ix2 = await page.evaluate(() => document.getElementById("didx").hidden && window.__deck.estado().i === 5);
  await page.keyboard.press("g"); await page.keyboard.press("Escape"); await page.waitForTimeout(150);
  const ix3 = await page.evaluate(() => document.getElementById("didx").hidden && window.__deck.estado().aberto);
  t(`${id}: índice (G) lista todos os slides, pula para o escolhido e Esc fecha só o índice`, ix1 && ix2 && ix3, [ix1, ix2, ix3]);
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
