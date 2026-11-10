// Suíte visual da Central: loga (API simulada), percorre cada tela em vários tamanhos e temas, mede TODOS os botões e controles
// (altura mínima, texto centralizado, texto cortado, sobreposição, rolagem lateral) e clica nos controles principais.
// Rodar (servidor local na raiz do repositório de páginas, porta 8802):  node central/tests/visual.cjs <caminho playwright-core> <caminho chromium>
const { chromium } = require(process.argv[2]); const fs = require("fs"); const path = require("path");
const fx = JSON.parse(fs.readFileSync(path.join(__dirname, "fixture.json")));
const BASE = process.env.CENTRAL_URL || "http://localhost:8802/central/";
const saude = { geral: "ok", ts: Date.now(), itens: { crons: { nivel: "ok" }, cerebro: { nivel: "ok" }, n8n: { nivel: "ok" }, webhooks: { nivel: "atencao" }, pausa: { nivel: "ok" } } };
const filas = { ok: true, itens: [{ fone: "5562911112222", nome: "Iramar", total: 2, mensagens: [{ ts: Date.now() - 36e5, texto: "Lead novo: Farmácia Central aguardando contato." }, { ts: Date.now() - 72e5, texto: "Tarefa vencida: Retomar contato com SUPER MED" }] }] };
const agentes = { ok: true, agentes: [{ id: "sdr_inbound", nome: "Ana (SDR Inbound)", saude: { ok: true, modo: "sombra", killSwitch: false, responde: false, versao: "0.3.0", segredos: { anthropic: true, openrouter: true, meta_token: false, meta_phone_id: false } }, config: { modo: "sombra", killSwitch: false, qualificacao: { minimoFarmacia: 100000, minimoSupermercado: 300000 }, ritmo: { inicial: 100, teto: 1000 }, cadencia: { maxContatos: 5, janelaDias: 6, horaIni: 8, horaFim: 20 }, humano: { debounceMs: 4000 }, destino: { sdrNome: "Felipe", sdrFone: "556293568997" } }, editaveis: [], conversas: [{ fone: "5562999990000", nome: "Carlos da Drogaria Central com nome bem comprido para testar quebra", estagio: "perguntou_cnpj", humano: false, pausado: false, ts: Date.now() - 6e4 }, { fone: "5562988880000", nome: "Mariana", estagio: "aguardando_humano", humano: true, pausado: false, ts: Date.now() - 36e5 }], auditoria: [{ ts: Date.now() - 9e5, quem: "Robert", para: { modo: "sombra" }, motivo: "começar a sombra" }] }] };
const falhas = []; const aviso = []; let verificados = 0;
const F = (m) => falhas.push(m);
const MEDIDA = () => {
  const out = []; const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
  const ov = [...document.querySelectorAll("#modal,#paleta")].find((x) => !x.classList.contains("hide")); const raiz = ov ? "#" + ov.id : "#app,#login"; const sel = ["button", "a.btn", ".chip", ".switch", "input", "select", ".pill"]; const alvos = [...document.querySelectorAll(raiz.split(",").flatMap((r) => sel.map((q) => r + " " + q)).join(","))].filter(vis);
  for (const e of alvos) {
    const r = e.getBoundingClientRect(); const nome = (e.id ? "#" + e.id : "") + "." + [...e.classList].join(".") + " «" + (e.textContent || e.placeholder || e.getAttribute("aria-label") || "").trim().slice(0, 24) + "»";
    const tipo = e.tagName.toLowerCase(); const ehPill = e.classList.contains("pill");
    const item = { nome, w: Math.round(r.width), h: Math.round(r.height), classe: [...e.classList].join(" "), tipo, pill: ehPill };
    // texto centralizado na vertical (botões e chips): folga acima x abaixo do conteúdo de texto
    if ((tipo === "button" || e.classList.contains("btn")) && !e.classList.contains("switch") && !e.classList.contains("iconbtn") && e.textContent.trim()) {
      const rg = document.createRange(); rg.selectNodeContents(e); const t = rg.getBoundingClientRect(); const cs = getComputedStyle(e);
      const topo = t.top - r.top - parseFloat(cs.borderTopWidth), base = r.bottom - t.bottom - parseFloat(cs.borderBottomWidth); item.desvioV = Math.round(Math.abs(topo - base) * 10) / 10;
      const esq = t.left - r.left, dir = r.right - t.right; item.desvioH = Math.round(Math.abs(esq - dir) * 10) / 10; item.centraH = cs.justifyContent === "center" || cs.textAlign === "center";
    }
    item.cortado = e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== "visible" && tipo !== "input";
    item.vazaPai = (() => { const p = e.parentElement; if (!p) return false; const pr = p.getBoundingClientRect(); return r.right > pr.right + 1.5 && getComputedStyle(p).overflowX === "visible" && p.scrollWidth > p.clientWidth + 1; })();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const topo = document.elementFromPoint(Math.min(cx, innerWidth - 1), Math.min(cy, innerHeight - 1));
    const recortado = (() => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowY; if (o === "auto" || o === "scroll" || o === "hidden") { const ar = a.getBoundingClientRect(); if (cy < ar.top || cy > ar.bottom) return true; } } return false; })();   // fora da área visível de uma lista com rolagem: não conta como coberto
    item.coberto = !recortado && cy >= 0 && cy <= innerHeight && cx >= 0 && cx <= innerWidth && topo && !(e === topo || e.contains(topo) || topo.contains(e));
    out.push(item);
  }
  return { itens: out, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
};
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  const users = [{ usuario: "robert@x.com", nome: "Robert", papel: "robert", ativo: true, ultimoAcesso: Date.now() }, { usuario: "luiz", nome: "Luiz", papel: "admin", ativo: false, ultimoAcesso: null }];
  const TELAS = ["Visão geral", "Controles", "Todas as chaves", "Filas de mensagens", "Calendário", "Agentes", "Histórico", "Atalhos", "Usuários", "Minha conta"];
  const COMBOS = [[1920, 1080, "light"], [1440, 900, "light"], [1440, 900, "dark"], [1280, 800, "light"], [1024, 768, "light"], [768, 1024, "light"], [390, 844, "light"], [390, 844, "dark"], [360, 740, "dark"]];
  for (const [w, h, tema] of COMBOS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema }); const p = await ctx.newPage(); const tag = `${w}x${h}-${tema}`; let erroApi = null;
    p.on("pageerror", (e) => F(`[${tag}] erro de script: ${e}`)); p.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR/.test(m.text())) F(`[${tag}] console: ${m.text()}`); });
    await p.route(/fonts\.(googleapis|gstatic)/, (r) => r.abort());
    await p.route(/workers\.dev/, (r) => { const url = new URL(r.request().url()); const u = url.pathname.replace("/central", ""); const m = r.request().method(); let j = { ok: true };
      if (url.pathname === "/bia-saude") j = saude; else if (u === "/acesso/estado") j = { ok: true, precisaPrimeiroAcesso: false };
      else if (u === "/acesso/entrar") j = { ok: true, token: "t", usuario: "robert@x.com", nome: "Robert", papel: "robert" }; else if (u === "/eu") j = { ok: true, usuario: "robert@x.com", nome: "Robert", papel: "robert" };
      else if (u === "/estado") j = fx.est; else if (u === "/historico") j = fx.h; else if (u === "/filas") j = filas; else if (u === "/calendario") j = { ok: true, hoje: "2026-11-10", dias: ["2026-11-20", "2026-12-24"] };
      else if (u === "/agentes") j = agentes; else if (u === "/agentes/conversa") j = { ok: true, hist: [{ de: "lead", ts: Date.now(), texto: "Oi, vi o formulário" }, { de: "aline", ts: Date.now(), texto: "Oi! Sou a Ana, assistente virtual da Life B." }], dados: { segmento: "farmacia" } }; else if (u === "/usuarios" && m === "GET") j = { ok: true, itens: users };
      r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify(j) }); });
    const medir = async (rotulo) => {
      const r = await p.evaluate(MEDIDA); verificados += r.itens.length;
      if (r.sw > r.cw) F(`[${tag}] ${rotulo}: rolagem lateral (${r.sw} > ${r.cw})`);
      for (const i of r.itens) {
        const onde = `[${tag}] ${rotulo}: ${i.nome} (${i.w}x${i.h})`;
        if (!i.pill && i.tipo !== "input" && !/switch/.test(i.classe) && i.h < 32) F(`${onde} altura pequena demais`);
        if (!i.pill && (i.tipo === "button" || /btn/.test(i.classe)) && !/switch|iconbtn/.test(i.classe) && i.h < 36) F(`${onde} botão com menos de 36px de altura`);
        if (i.desvioV != null && i.desvioV > 2.5) F(`${onde} texto descentralizado na vertical (desvio ${i.desvioV}px)`);
        if (i.desvioH != null && i.desvioH > 3 && i.centraH) F(`${onde} texto descentralizado na horizontal (desvio ${i.desvioH}px)`);
        if (i.cortado) F(`${onde} texto cortado`); if (i.vazaPai) F(`${onde} vaza do contêiner`); if (i.coberto) F(`${onde} coberto por outro elemento`);
      }
      // botões do mesmo tipo e na mesma linha têm a mesma altura
      const g = {}; for (const i of r.itens) { if (/(^| )btn( |$)/.test(i.classe)) { const k = (/sm/.test(i.classe) ? "sm" : "md") + (/ghost/.test(i.classe) ? "g" : "p"); (g[k] = g[k] || new Set()).add(i.h); } }
      for (const [k, s] of Object.entries(g)) if (s.size > 1 && Math.max(...s) - Math.min(...s) > 2) F(`[${tag}] ${rotulo}: botões do tipo ${k} com alturas diferentes (${[...s].join(", ")})`);
    };
    await p.goto(BASE); await p.waitForTimeout(500); await medir("login");
    await p.fill("#usuario", "robert@x.com"); await p.fill("#senha", "x"); await p.click("#btnEntrar"); await p.waitForSelector("#app:not(.hide)"); await p.waitForTimeout(700);
    for (const t of TELAS) {
      await p.click(`nav a:has-text("${t}")`); await p.waitForTimeout(450); await medir(t);
      await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `c-${tag}-${t.replace(/\W/g, "")}.png`), fullPage: true });
      if (t === "Visão geral") {   // cartões clicáveis abrem a lista do que está ligado, em sombra e desligado
        for (let k = 0; k < 3; k++) { const cs = await p.$$(".kpi.clic"); await cs[k].click(); await p.waitForTimeout(200); if (!(await p.$("#modal:not(.hide) .grit, #modal:not(.hide) .vazio"))) F(`[${tag}] cartão ${k} não abriu a lista`); await medir("lista do cartão " + k); await p.screenshot({ path: path.join(process.env.SHOTS || "/tmp", `c-${tag}-cartao${k}.png`) }); await p.keyboard.press("Escape"); await p.waitForTimeout(120); }
      }
      if (t === "Controles") {   // exercita filtros e abre/fecha o modal de um interruptor
        for (const f of ["Risco alto", "Em sombra", "Desligados", "Todos"]) { await p.click(`.chip:has-text("${f}")`); await p.waitForTimeout(120); }
        const sw = await p.$(".switch:not([disabled])"); if (sw) { await sw.click(); await p.waitForTimeout(250); await medir("modal de confirmação"); await p.keyboard.press("Escape"); await p.waitForTimeout(150); if (await p.$("#modal:not(.hide)")) F(`[${tag}] modal não fechou com Esc`); }
      }
      if (t === "Filas de mensagens") { const rm = await p.$("button:has-text('Remover')"); if (rm) { await rm.click(); await p.waitForTimeout(250); await medir("modal remover mensagem"); await p.keyboard.press("Escape"); } }
    }
    await p.keyboard.press("Control+k"); await p.waitForTimeout(250); await medir("paleta"); if (!(await p.$(".pal"))) F(`[${tag}] paleta não abriu`); await p.keyboard.press("Escape");
    await p.click("#btnTema"); await p.waitForTimeout(200); await medir("após trocar tema");
    await ctx.close();
  }
  await b.close();
  const unicas = [...new Set(falhas)];
  console.log(`\nverificações de elementos: ${verificados}; problemas: ${unicas.length}`); unicas.slice(0, 120).forEach((m) => console.log("✗", m));
  process.exit(unicas.length ? 1 : 0);
})();
