// Teste dos FLUXOGRAMAS do Ecossistema no Chromium real (20/11/2026, pedido do dono: "bug de arte" em que o rótulo "qualifica" ficava em cima da seta de Perdido).
// Mede a geometria do que foi DESENHADO (não a do gerador): rótulo x caixa, rótulo x rótulo, rótulo x seta alheia, seta que atravessa caixa alheia,
// rótulo longe da própria seta (ambíguo), caixa ou rótulo fora do desenho, texto cortado (scrollWidth > clientWidth) e fluxo que liga "Perdido" a "qualificado/ganho"
// sem a palavra "reabrir". Também confere a página inteira: nada de "segmento diferente" dito ao lead e o papel certo ("especialista" ao lead).
// Mutação: tests/ecossistema/mutacao_fluxos.sh reintroduz o bug e este teste tem de falhar.
import { t, resumo, abrirNavegador, abrirPagina, semRolagemLateral, HTML } from "./_comum.mjs";
const nav = await abrirNavegador();
const MEDIR = () => {
  const out = [], aviso = [];
  const figs = [...document.querySelectorAll("figure.fig")].filter((f) => f.querySelector(".svgd"));
  const visiveis = [];
  figs.forEach((f, k) => { const d = [...f.querySelectorAll(".svgd")].find((x) => getComputedStyle(x).display !== "none"); if (d) visiveis.push([k, f.getAttribute("aria-label") || "fig " + k, d.querySelector("svg")]); });
  const inter = (a, b, m = 0) => a.x < b.x + b.width + m && b.x < a.x + a.width + m && a.y < b.y + b.height + m && b.y < a.y + a.height + m;
  const bb = (e) => { const r = e.getBBox(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
  const distRetPonto = (r, p) => { const dx = Math.max(r.x - p.x, 0, p.x - (r.x + r.width)), dy = Math.max(r.y - p.y, 0, p.y - (r.y + r.height)); return Math.hypot(dx, dy); };
  for (const [k, nome, svg] of visiveis) {
    const vb = svg.viewBox.baseVal;
    const nos = [...svg.querySelectorAll(".nd")].map((g) => ({ id: g.dataset.id, r: bb(g.querySelector("rect")), t: (g.querySelector("text.t") || {}).textContent || "", tudo: [...g.querySelectorAll("text")].map((x) => x.textContent).join(" ") }));
    const porId = Object.fromEntries(nos.map((n) => [n.id, n]));
    const setas = [...svg.querySelectorAll(".eds path")].map((p) => { const L = p.getTotalLength(); const pts = []; for (let s = 0; s <= L; s += 3) { const q = p.getPointAtLength(s); pts.push({ x: q.x, y: q.y }); } const q = p.getPointAtLength(L); pts.push({ x: q.x, y: q.y }); const [a, b] = (p.dataset.e || ">").split(">"); return { e: p.dataset.e, a, b, pts }; });
    const rots = [...svg.querySelectorAll("g.lb")].map((g) => ({ e: g.dataset.e, txt: g.textContent, r: bb(g.querySelector("rect")) }));
    // 1) tudo dentro do desenho
    for (const n of nos) if (n.r.x < 0 || n.r.y < 0 || n.r.x + n.r.width > vb.width + 0.5 || n.r.y + n.r.height > vb.height + 0.5) out.push(`${nome}: caixa "${n.t}" fora do desenho`);
    for (const l of rots) if (l.r.x < 0 || l.r.y < 0 || l.r.x + l.r.width > vb.width + 0.5 || l.r.y + l.r.height > vb.height + 0.5) out.push(`${nome}: rótulo "${l.txt}" fora do desenho`);
    // 2) rótulo x caixa, rótulo x rótulo
    for (const l of rots) { for (const n of nos) if (inter(l.r, n.r)) out.push(`${nome}: rótulo "${l.txt}" SOBRE a caixa "${n.t}"`); }
    for (let i = 0; i < rots.length; i++) for (let j = i + 1; j < rots.length; j++) if (inter(rots[i].r, rots[j].r)) out.push(`${nome}: rótulos "${rots[i].txt}" e "${rots[j].txt}" se sobrepõem`);
    // 3) rótulo x seta alheia (não pode cobrir nem encostar) e rótulo colado na própria seta
    for (const l of rots) {
      const propria = setas.find((s) => s.e === l.e);
      if (!propria) { out.push(`${nome}: rótulo "${l.txt}" sem seta`); continue; }
      const dProp = Math.min(...propria.pts.map((p) => distRetPonto(l.r, p)));
      if (dProp > 10) out.push(`${nome}: rótulo "${l.txt}" longe da própria seta (${dProp.toFixed(0)} px)`);
      for (const s of setas) {
        if (s === propria) continue;
        const d = Math.min(...s.pts.map((p) => distRetPonto(l.r, p)));
        if (d < 0.5) out.push(`${nome}: rótulo "${l.txt}" (${l.e}) em cima da seta ${s.e}`);
        else if (d < dProp) out.push(`${nome}: rótulo "${l.txt}" (${l.e}) mais perto da seta ${s.e} (${d.toFixed(0)} px) do que da própria (${dProp.toFixed(0)} px)`);
      }
    }
    // 4) seta que atravessa caixa que não é a dela
    for (const s of setas) for (const n of nos) { if (n.id === s.a || n.id === s.b) continue; if (s.pts.some((p) => p.x > n.r.x + 1.5 && p.x < n.r.x + n.r.width - 1.5 && p.y > n.r.y + 1.5 && p.y < n.r.y + n.r.height - 1.5)) out.push(`${nome}: seta ${s.e} atravessa a caixa "${n.t}"`); }
    // 5) fluxo que liga Perdido a qualificado/ganho sem "reabrir"
    for (const s of setas) {
      const a = porId[s.a], b = porId[s.b]; if (!a || !b) continue;
      const rot = (rots.find((l) => l.e === s.e) || {}).txt || "";
      if (/^perdid/i.test(a.t) && /qualific|ganho/i.test(b.tudo) && !/reabr/i.test(rot)) out.push(`${nome}: "${a.t}" liga a "${b.t}" (perdido vira qualificado) sem reabrir`);
    }
    // 6) caixa sem nenhuma seta (órfã): toda caixa é origem ou destino de alguma seta
    for (const n of nos) if (!setas.some((s) => s.a === n.id || s.b === n.id)) out.push(`${nome}: caixa "${n.t}" sem seta`);
    aviso.push(`${nome}: ${nos.length} caixas, ${setas.length} setas, ${rots.length} rótulos`);
  }
  return { out, n: visiveis.length, aviso };
};
const CORTE = () => {   // texto cortado: conteúdo mais largo que a caixa que o contém (fora das tabelas de rolagem e dos desenhos)
  const out = [];
  document.querySelectorAll("main *").forEach((e) => {
    if (e.closest("svg") || e.closest(".tw") || e.closest(".sr") || e.closest("thead")) return;
    if (!e.clientWidth || e.tagName === "BR") return;
    const ov = getComputedStyle(e).overflowX;
    if (e.scrollWidth > e.clientWidth + 1 && ov !== "auto" && ov !== "scroll") out.push((e.className || e.tagName) + " " + e.scrollWidth + ">" + e.clientWidth + " «" + (e.textContent || "").trim().slice(0, 24) + "»");
  });
  return out.slice(0, 8);
};
for (const tema of ["light", "dark"]) for (const w of [320, 390, 768, 1440]) {
  const id = `${tema}_${w}`; const { ctx, page } = await abrirPagina(nav, { w, h: 900, tema, touch: false });
  await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true))); await page.waitForTimeout(200);
  const r = await page.evaluate(MEDIR);
  t(`${id}: sem rolagem lateral na página`, await semRolagemLateral(page));
  t(`${id}: 15 desenhos medidos`, r.n === 15, r.n);
  t(`${id}: rótulos, setas e caixas sem colisão nem ambiguidade`, r.out.length === 0, r.out.slice(0, 10));
  const c = await page.evaluate(CORTE); t(`${id}: nenhum texto cortado (scrollWidth > clientWidth)`, c.length === 0, c);
  await ctx.close();
}
await nav.close();
// página inteira: palavra proibida ao lead e papel certo
const texto = HTML.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");
const ruins = []; for (const m of texto.matchAll(/segmento diferente/gi)) { const ant = texto.slice(Math.max(0, m.index - 600), m.index).toLowerCase(); if (!/nunca|não diz|proib|sem dizer|evit/.test(ant)) ruins.push(texto.slice(Math.max(0, m.index - 60), m.index + 40)); }
t("nenhum 'segmento diferente' dito ao lead (só como proibição)", ruins.length === 0, ruins);
t("ao lead se diz 'especialista' (regra 20/11/2026 registrada na página)", /especialista/i.test(texto) && /ao lead sempre se diz "especialista"/i.test(texto));
t("a Ana nunca cria o Arena (regra registrada na jornada)", /A Ana nunca cria (negócio no )?o?\s?Arena/i.test(texto));
t("repasse blindado e Repasse da Ana descritos", /Repasse da Ana/.test(texto) && /blindad/i.test(texto));
t("Reativação pede só o Aprovado Serasa", /Aprovado Serasa/.test(texto));
t("data da última atualização visível e igual à do estado", /Atualizado em <span id="atualizadoEm">\d\d\/\d\d\/2026/.test(HTML));
resumo();
