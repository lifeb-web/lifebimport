// Central: contraste (texto x fundo) dos botões em TODOS os estados e temas (13/11, bug #530: "Enviar" do feedback ficava branco sobre branco) + atalho Life B Solicita (#536). Falha se < 4,5.
// Rodar: node central/tests/contraste_botoes.cjs <playwright-core> <chromium>
// Rodar: node central/tests/scroll_hash.cjs <playwright-core> <chromium>   (servidor local na raiz do repositório de páginas, porta 8802)
const { chromium } = require(process.argv[2]); const fs = require("fs"); const path = require("path");
const fx = JSON.parse(fs.readFileSync(path.join(__dirname, "fixture.json"))); const BASE = process.env.CENTRAL_URL || "http://localhost:8802/central/"; const T0 = Date.now();
const conversas = Array.from({ length: 45 }, (_, i) => ({ fone: "55629" + String(90000000 + i), nome: "Lead " + i, estagio: "perguntou_cnpj", humano: false, pausado: false, ts: T0 - i * 60000, previa: "mensagem " + i, ultimaDe: "ana" }));
const T1 = T0 - 600000;
const mk = (humano) => [{ de: "lead", ts: T1, tipo: "texto", texto: "oi" }, { de: "ana", ts: T1 + 3000, tipo: "texto", texto: "Olá!", wid: "w1", ent: "read" }];
let humano = true; const agentes = { ok: true, agentes: [{ id: "sdr_inbound", nome: "Ana", saude: { ok: true, modo: "ao_vivo", killSwitch: false, responde: true, versao: "1", segredos: {} }, config: { modo: "ao_vivo", killSwitch: false, qualificacao: {}, ritmo: {}, cadencia: {}, humano: {}, destino: {} }, editaveis: [], conversas: [{ fone: "5562990000003", nome: "Lead 3", estagio: "perguntou_cnpj", humano: true, pausado: false, ts: T0 }], auditoria: [] }] };
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC", "base64"); const falhas = []; const F = (m) => falhas.push(m); let checks = 0; const ok = (c, m) => { checks++; if (!c) F(m); };
const fbs = []; let fbFalha = false; const dess = []; let desStatus = 200;
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.addInitScript(() => { window.__FB_JANELA_MS = 1500; window.__CENTRAL_TESTE = true; navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [{ stop() {} }] }); window.MediaRecorder = class { constructor() { this.mimeType = "audio/webm"; } start() { setTimeout(() => this.ondataavailable && this.ondataavailable({ data: new Blob([new Uint8Array(500)]) }), 20); } stop() { setTimeout(() => this.onstop && this.onstop(), 40); } }; }); const p = await ctx.newPage(); p.on("pageerror", (e) => F("erro de script: " + e)); const envios = [];
  await p.route(/fonts\.(googleapis|gstatic)/, (r) => r.abort());
  await p.route(/workers\.dev/, (r) => { const url = new URL(r.request().url()); const u = url.pathname.replace("/central", ""); let j = { ok: true };
    if (url.pathname === "/bia-saude") j = { geral: "ok", ts: T0, itens: {} }; else if (u === "/acesso/estado") j = { ok: true, precisaPrimeiroAcesso: false }; else if (u === "/acesso/entrar") j = { ok: true, token: "t", usuario: "robert@x.com", nome: "Robert", papel: "robert" };
    else if (u === "/eu") j = { ok: true, usuario: "robert@x.com", nome: "Robert", papel: "robert" }; else if (u === "/estado") j = fx.est; else if (u === "/historico") j = fx.h; else if (u === "/agentes") { const a = JSON.parse(JSON.stringify(agentes)); a.agentes[0].conversas[0].humano = false; j = a; }
    else if (u === "/agentes/conversa") j = { ok: true, humano: false, pausado: false, estagio: "perguntou_cnpj", pendentes: 0, hist: mk(), nome: "Lead", notas: [], log: [], dados: {} };
    else if (u === "/agentes/transcrever") { j = { ok: true, texto: "manda o vídeo da drogaria agora" }; } else if (u === "/agentes/feedback/desfazer") { dess.push(JSON.parse(r.request().postData())); if (desStatus !== 200) { r.fulfill({ status: desStatus, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify({ ok: false, mensagem: "nao" }) }); return; } j = { ok: true }; } else if (u === "/agentes/feedback") { const body = JSON.parse(r.request().postData()); fbs.push(body); if (fbFalha) { r.fulfill({ status: 500, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify({ ok: false, mensagem: "falhou" }) }); return; } j = { ok: true }; } else if (u === "/agentes/conversa/instrucao") { envios.push(JSON.parse(r.request().postData())); j = { ok: true, aplicandoAgora: false, total: 1 }; } else if (u === "/agentes/exclusao-autorizados") j = { ok: true, euPosso: true, autorizados: [] }; else if (u === "/agentes/historico") j = { ok: true, temMais: false, itens: [] };
    r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify(j) }); });
  await p.goto(BASE + "#atendimento-5562990000003"); await p.fill("#usuario", "robert@x.com"); await p.fill("#senha", "x"); await p.click("#btnEntrar"); await p.waitForSelector("#app:not(.hide)"); await p.waitForSelector("#atMsgs .bb", { timeout: 8000 }); await p.waitForTimeout(500);
  // ---- medição no navegador: cor efetiva do texto e do fundo (compondo ancestrais e opacidade) ----
  const MEDIR = () => {
    const pr = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return [0, 0, 0, 0]; const a = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [a[0], a[1], a[2], a.length > 3 ? a[3] : 1]; };
    const mix = (top, bot) => { const a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; };
    const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    window.__medir = (el, fundoFixo) => {
      const cadeia = []; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); cadeia.push({ bg: pr(cs.backgroundColor), img: cs.backgroundImage !== "none", op: parseFloat(cs.opacity) }); }
      let pai = [255, 255, 255, 1]; for (let i = cadeia.length - 1; i >= 1; i--) pai = mix(cadeia[i].bg, pai);
      let semFundo = false; for (const c of cadeia) { if (c.img) { semFundo = true; break; } if (c.bg[3] >= 0.99) break; }
      const cs = getComputedStyle(el); let txt = pr(cs.color); const op = cadeia[0].op;
      let bg = mix(cadeia[0].bg, pai); txt = mix(txt, bg);
      if (op < 1) { bg = mix([bg[0], bg[1], bg[2], op], pai); txt = mix([txt[0], txt[1], txt[2], op], pai); }
      if (fundoFixo) { bg = pr(fundoFixo); txt = mix(pr(cs.color), bg); } const L1 = lum(txt), L2 = lum(bg); const r = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      return { r: Math.round(r * 100) / 100, img: semFundo, txt: txt.map(Math.round).join(","), bg: bg.map(Math.round).join(","), t: (el.textContent || "").trim().slice(0, 24), cls: String(el.className), vis: !!(el.offsetWidth && el.offsetHeight) };
    };
  };
  await p.evaluate(MEDIR);
  const TEMAS = ["light", "dark"], TELAS = [{ w: 1440, h: 900, n: "desktop" }, { w: 390, h: 800, n: "celular" }];
  const setTema = async (t) => { await p.evaluate((t) => document.documentElement.setAttribute("data-theme", t), t); await p.emulateMedia({ colorScheme: t }); await p.waitForTimeout(80); };
  const med = (sel) => p.$eval(sel, (e) => window.__medir(e));
  const LIM = 4.5; const piores = {};
  const chk = (rot, m, lim) => { checks++; const l = lim || LIM; const k = rot.split(" ")[0].split("/")[0] + " " + (rot.split(" ")[1] || ""); piores[k] = Math.min(piores[k] || 99, m.r); if (m.r < l) F(`contraste ${m.r} < ${l} em ${rot} [texto rgb(${m.txt}) fundo rgb(${m.bg}) cls=${m.cls} "${m.t}"]`); };

  // ===== 1) botão "Enviar" do feedback 👎: todos os estados x 2 temas x 2 telas =====
  for (const tela of TELAS) for (const tema of TEMAS) {
    await p.setViewportSize({ width: tela.w, height: tela.h }); await setTema(tema);
    await p.evaluate(() => { __centralTeste.AT.fbFeito = {}; try { localStorage.clear(); } catch (e) {} __centralTeste.desenhar(true); }); await p.waitForTimeout(200);
    const BDN = '#atMsgs button[aria-label="Resposta ruim, sugerir a certa"]'; await p.click(BDN); await p.waitForSelector("textarea.fbTa");
    const ENV = '#atMsgs .fb button.btn:not(.ghost)'; const rot = `Enviar/${tela.n}/${tema}`;
    await p.mouse.move(2, 2); await p.waitForTimeout(250);
    const n = await med(ENV); ok(n.vis, "Enviar invisível " + rot); chk(rot + " normal", n);
    await p.focus(ENV); await p.waitForTimeout(250); chk(rot + " focus", await med(ENV));
    await p.evaluate(() => document.activeElement.blur());
    const bx = await (await p.$(ENV)).boundingBox(); await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.down(); await p.waitForTimeout(250); chk(rot + " active", await med(ENV));
    await p.mouse.move(2, 2); await p.mouse.up(); await p.waitForTimeout(250); chk(rot + " depois-do-toque", await med(ENV));
    await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.waitForTimeout(250); chk(rot + " hover", await med(ENV));
    await p.mouse.move(2, 2);
    await p.$eval(ENV, (e) => { e.disabled = true; }); await p.waitForTimeout(250); chk(rot + " disabled", await med(ENV), 3);
    await p.$eval(ENV, (e) => { e.disabled = false; });
    // depois de clicar de verdade: os botões que restarem (Desfazer etc.) também precisam ler
    await p.click(ENV); await p.waitForTimeout(250); await p.mouse.move(2, 2); await p.waitForTimeout(250);
    for (const bt of await p.$$("#atMsgs .fb button")) { const m = await bt.evaluate((e) => window.__medir(e)); if (m.vis) chk(`pos-clique/${tela.n}/${tema} pos`, m); }
    await p.waitForTimeout(1700);
  }

  // ===== 2) varredura: TODOS os botões visíveis de cada aba, normal + foco + pressionado (solta fora: não dispara clique), 2 temas x 2 telas =====
  const nAbas = await p.$$eval("#nav a:not(.ext)", (a) => a.length); const abas = Array.from({ length: nAbas }, (_, i) => i);
  let total = 0;
  for (const tela of TELAS) for (const tema of TEMAS) {
    await p.setViewportSize({ width: tela.w, height: tela.h }); await setTema(tema);
    for (const ab of abas) {
      await p.evaluate((i) => document.querySelectorAll("#nav a:not(.ext)")[i].click(), ab); await p.waitForTimeout(500);
      const n = await p.$$eval("button", (bs) => bs.length);
      for (let i = 0; i < Math.min(n, 80); i++) {
        const el = (await p.$$("button"))[i]; if (!el) break;
        const vis = await el.evaluate((e) => !!(e.offsetWidth && e.offsetHeight) && !e.closest(".hide")); if (!vis) continue; const lab = `varredura/${ab}/${tela.n}/${tema}`;
        const m0 = await el.evaluate((e) => window.__medir(e)); total++; if (!m0.img && m0.t) chk(lab + " normal", m0);
        try { await el.focus(); await p.waitForTimeout(30); const m1 = await el.evaluate((e) => window.__medir(e)); if (!m1.img && m1.t) chk(lab + " focus", m1); await el.evaluate((e) => e.blur()); } catch (e) {}
        try { const bb = await el.boundingBox(); if (bb && bb.y >= 0 && bb.y < tela.h - 4 && bb.x >= 0 && bb.x < tela.w - 4) { await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.waitForTimeout(30); const m2 = await el.evaluate((e) => window.__medir(e)); if (!m2.img && m2.t) chk(lab + " active", m2); await p.mouse.move(2, 2); await p.mouse.up(); } } catch (e) {}
      }
    }
  }
  // ===== 3) atalho Life B Solicita (#536) =====
  for (const tela of [{ w: 320, h: 700 }, { w: 390, h: 800 }, { w: 1366, h: 768 }]) for (const tema of TEMAS) {
    await p.setViewportSize({ width: tela.w, height: tela.h }); await setTema(tema); await p.waitForTimeout(200);
    const L = await p.$("#nav a.ext"); ok(!!L, "atalho Life B Solicita deveria existir");
    if (L) { const i = await L.evaluate((e) => ({ h: e.getAttribute("href"), t: e.target, r: e.rel, tx: e.textContent, vis: !!(e.offsetWidth && e.offsetHeight) })); await L.scrollIntoViewIfNeeded(); const bb = await L.boundingBox();
      ok(i.h === "https://lifeb-solicita-staging.robert131196.workers.dev", "URL errada " + i.h); ok(i.t === "_blank" && /noopener/.test(i.r), "deveria abrir em nova aba com noopener"); ok(/Life B Solicita/.test(i.tx), "rótulo errado"); ok(i.vis && bb.width > 40, "atalho invisível em " + tela.w);
      ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), "estourou a largura em " + tela.w);
      chk(`atalho/${tela.w}/${tema} normal`, await L.evaluate((e) => window.__medir(e, getComputedStyle(document.documentElement).getPropertyValue("--side2").trim() || "#34216a"))); }
  }
  ok(total > 100, "varredura deveria cobrir > 100 botões, cobriu " + total);
  console.log("botões varridos:", total, "| piores contrastes:", JSON.stringify(piores));
  await ctx.close(); await b.close(); console.log(`contraste_botoes: ${checks} verificações; falhas: ${falhas.length}`); falhas.slice(0, 400).forEach((x) => console.log(" - " + x)); process.exit(falhas.length ? 1 : 0);
})();
