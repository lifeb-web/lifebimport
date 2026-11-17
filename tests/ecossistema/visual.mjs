// Teste visual do Ecossistema no Chromium real (14/11/2026): 5 larguras x claro/escuro, sem rolagem lateral, sem corte, SVG dentro das caixas, contraste >= 4,5, prints.
import { t, resumo, abrirNavegador, abrirPagina, semRolagemLateral, PRINTS } from "./_comum.mjs";
const nav = await abrirNavegador();
const TAM = [[390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]];
const CONTRASTE = () => {
  const rgb = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c || ""); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const fundo = (e) => { let acc = { r: 255, g: 255, b: 255 }; const cad = []; for (let x = e; x; x = x.parentElement) cad.push(x); cad.reverse(); for (const x of cad) { const c = rgb(getComputedStyle(x).backgroundColor); if (c && c.a > 0) acc = { r: c.r * c.a + acc.r * (1 - c.a), g: c.g * c.a + acc.g * (1 - c.a), b: c.b * c.a + acc.b * (1 - c.a) }; } return acc; };
  const ruins = []; let n = 0;
  const w = document.createTreeWalker(document.querySelector("main"), NodeFilter.SHOW_TEXT);
  const vistos = new Set();
  while (w.nextNode()) {
    const nd = w.currentNode; if (!nd.textContent.trim()) continue; const e = nd.parentElement; if (!e || vistos.has(e) || e.closest("svg") || e.closest(".hero-b") || e.closest(".sr")) continue; vistos.add(e);
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(e); if (cs.visibility === "hidden") continue;
    const fg = rgb(cs.color), bg = fundo(e); const L1 = lum(fg), L2 = lum(bg); const cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); n++;
    if (cr < 4.5) ruins.push((e.className || e.tagName) + " «" + nd.textContent.trim().slice(0, 28) + "» " + cr.toFixed(2));
  }
  // textos dos desenhos: cor do texto contra a cor da caixa
  document.querySelectorAll(".svgd .nd").forEach((g) => { const rc = g.querySelector("rect"); const bgc = rgb(getComputedStyle(rc).fill); if (!bgc) return; g.querySelectorAll("text").forEach((tx) => { const fg = rgb(getComputedStyle(tx).fill); const L1 = lum(fg), L2 = lum(bgc); const cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); n++; if (cr < 4.5) ruins.push("svg «" + tx.textContent.slice(0, 24) + "» " + cr.toFixed(2)); }); });
  return { n, ruins };
};
for (const tema of ["light", "dark"]) for (const [w, h] of TAM) {
  const id = `${tema}_${w}`; const { ctx, page, erros } = await abrirPagina(nav, { w, h, tema, touch: w < 800 });
  t(`${id}: sem erro de JS no console`, erros.length === 0, erros);
  t(`${id}: sem rolagem lateral na página`, await semRolagemLateral(page));
  t(`${id}: 23 seções, 14 desenhos, fonte Montserrat carregada`, await page.evaluate(() => document.querySelectorAll("main .sec").length === 23 && document.querySelectorAll("figure.fig").length === 14 && document.fonts.check("700 14px Montserrat")), await page.evaluate(() => [document.querySelectorAll("main .sec").length, document.querySelectorAll("figure.fig").length, document.fonts.check("700 14px Montserrat")]));
  await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true))); await page.waitForTimeout(150);
  // 1) nada passa da largura da tela (exceto rolagem interna das tabelas largas)
  const estouro = await page.evaluate(() => { const vw = document.documentElement.clientWidth, out = []; document.querySelectorAll("main *").forEach((e) => { if (e.closest("svg") || e.closest(".sr") || e.closest(".tw")) return; const r = e.getBoundingClientRect(); if (r.width && r.right > vw + 1) out.push((e.className || e.tagName) + " +" + Math.round(r.right - vw)); }); return out.slice(0, 8); });
  t(`${id}: nenhum elemento passa da largura da tela`, estouro.length === 0, estouro);
  const tabelas = await page.evaluate(() => [...document.querySelectorAll(".tw")].filter((e) => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1).length);
  t(`${id}: tabelas contidas na tela`, tabelas === 0);
  // 2) texto que estoura o próprio cartão
  const corte = await page.evaluate(() => { const out = []; document.querySelectorAll(".card, .col, .stat, .flow .b, .callout, .steps li, .hero-b").forEach((c) => { const cr = c.getBoundingClientRect(); c.querySelectorAll("*").forEach((e) => { if (e.closest("svg") || e.closest("thead")) return; const r = e.getBoundingClientRect(); if (r.width && (r.right > cr.right + 1 || r.left < cr.left - 1)) out.push((c.className || "") + ">" + (e.className || e.tagName) + " " + Math.round(r.right - cr.right)); }); }); return [...new Set(out)].slice(0, 8); });
  t(`${id}: nada passa da borda do cartão`, corte.length === 0, corte);
  // 3) desenhos: um só visível por figura, texto dentro da caixa, setas dentro do desenho
  const svg = await page.evaluate(() => { const out = []; let vis = 0; document.querySelectorAll("figure.fig").forEach((f, k) => { const vs = [...f.querySelectorAll(".svgd")].filter((d) => getComputedStyle(d).display !== "none"); if (vs.length !== 1) out.push("fig " + k + " visíveis=" + vs.length); else { vis++; const svg = vs[0].querySelector("svg"); const sr = svg.getBoundingClientRect(); if (sr.right > document.documentElement.clientWidth + 1) out.push("fig " + k + " passa da tela"); svg.querySelectorAll(".nd").forEach((g) => { const rc = g.querySelector("rect").getBBox(); g.querySelectorAll("text").forEach((tx) => { const b = tx.getBBox(); if (b.x < rc.x + 2 || b.x + b.width > rc.x + rc.width - 2 || b.y + b.height > rc.y + rc.height + 1) out.push("fig " + k + " texto fora da caixa: " + tx.textContent.slice(0, 30) + " (" + Math.round(b.x + b.width - rc.x - rc.width) + ")"); }); }); const sz = [...svg.querySelectorAll("text.s")].map((x) => x.getBoundingClientRect().height); } }); return { out, vis }; });
  t(`${id}: desenhos legíveis (uma versão visível, texto dentro das caixas)`, svg.out.length === 0 && svg.vis === 14, svg);
  // tamanho real do texto dos desenhos na tela (>= 9 px)
  const tamTxt = await page.evaluate(() => { let min = 99; document.querySelectorAll("figure.fig").forEach((f) => { const d = [...f.querySelectorAll(".svgd")].find((x) => getComputedStyle(x).display !== "none"); const svg = d.querySelector("svg"); const esc = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width; min = Math.min(min, 12.5 * esc); }); return min; });
  t(`${id}: texto menor dos desenhos >= 11 px na tela`, tamTxt >= 11, tamTxt);
  const ct = await page.evaluate(CONTRASTE); t(`${id}: contraste >= 4,5 em ${ct.n} textos`, ct.ruins.length === 0, ct.ruins.slice(0, 8));
  // prints: topo, e seções-chave
  const sec = async (nome, sid) => { await page.evaluate((s) => { const e = document.getElementById(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - 70, behavior: "instant" }); }, sid); await page.waitForTimeout(120); await page.screenshot({ path: `${PRINTS}/${id}_${nome}.png` }); };
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(150); await page.screenshot({ path: `${PRINTS}/${id}_0topo.png` });
  for (const [n, s] of [["1status", "status"], ["2visao", "visao"], ["3ana", "ana"], ["4destinos", "destinos"], ["5cadencia", "cadencia"], ["6volta", "recuperacao"], ["7observ", "observ"], ["8check", "checklist"]]) await sec(n, s);
  await ctx.close();
}
await nav.close(); resumo();
