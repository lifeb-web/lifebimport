// Central: instrução na Central: "Só orientar" x "Orientar e mandar agora" (quando=orientar/agora), sugestão automática e nenhum envio sem escolha explícita.
// Rodar: node central/tests/scroll_hash.cjs <playwright-core> <chromium>   (servidor local na raiz do repositório de páginas, porta 8802)
const { chromium } = require(process.argv[2]); const fs = require("fs"); const path = require("path");
const fx = JSON.parse(fs.readFileSync(path.join(__dirname, "fixture.json"))); const BASE = process.env.CENTRAL_URL || "http://localhost:8802/central/"; const T0 = Date.now();
const conversas = Array.from({ length: 45 }, (_, i) => ({ fone: "55629" + String(90000000 + i), nome: "Lead " + i, estagio: "perguntou_cnpj", humano: false, pausado: false, ts: T0 - i * 60000, previa: "mensagem " + i, ultimaDe: "ana" }));
const T1 = T0 - 600000;
const mk = (humano) => [{ de: "lead", ts: T1, tipo: "texto", texto: "oi" }, { de: "ana", ts: T1 + 3000, tipo: "texto", texto: "Olá!", wid: "w1", ent: "read" }];
let humano = true; const agentes = { ok: true, agentes: [{ id: "sdr_inbound", nome: "Ana", saude: { ok: true, modo: "ao_vivo", killSwitch: false, responde: true, versao: "1", segredos: {} }, config: { modo: "ao_vivo", killSwitch: false, qualificacao: {}, ritmo: {}, cadencia: {}, humano: {}, destino: {} }, editaveis: [], conversas: [{ fone: "5562990000003", nome: "Lead 3", estagio: "perguntou_cnpj", humano: true, pausado: false, ts: T0 }], auditoria: [] }] };
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC", "base64"); const falhas = []; const F = (m) => falhas.push(m); let checks = 0; const ok = (c, m) => { checks++; if (!c) F(m); };
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); p.on("pageerror", (e) => F("erro de script: " + e)); const envios = [];
  await p.route(/fonts\.(googleapis|gstatic)/, (r) => r.abort());
  await p.route(/workers\.dev/, (r) => { const url = new URL(r.request().url()); const u = url.pathname.replace("/central", ""); let j = { ok: true };
    if (url.pathname === "/bia-saude") j = { geral: "ok", ts: T0, itens: {} }; else if (u === "/acesso/estado") j = { ok: true, precisaPrimeiroAcesso: false }; else if (u === "/acesso/entrar") j = { ok: true, token: "t", usuario: "robert@x.com", nome: "Robert", papel: "robert" };
    else if (u === "/eu") j = { ok: true, usuario: "robert@x.com", nome: "Robert", papel: "robert" }; else if (u === "/estado") j = fx.est; else if (u === "/historico") j = fx.h; else if (u === "/agentes") { const a = JSON.parse(JSON.stringify(agentes)); a.agentes[0].conversas[0].humano = false; j = a; }
    else if (u === "/agentes/conversa") j = { ok: true, humano: false, pausado: false, estagio: "perguntou_cnpj", pendentes: 0, hist: mk(), nome: "Lead", notas: [], log: [], dados: {} };
    else if (u === "/agentes/conversa/instrucao") { envios.push(JSON.parse(r.request().postData())); j = { ok: true, aplicandoAgora: false, total: 1 }; } else if (u === "/agentes/exclusao-autorizados") j = { ok: true, euPosso: true, autorizados: [] }; else if (u === "/agentes/historico") j = { ok: true, temMais: false, itens: [] };
    r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify(j) }); });
  await p.goto(BASE + "#atendimento-5562990000003"); await p.fill("#usuario", "robert@x.com"); await p.fill("#senha", "x"); await p.click("#btnEntrar"); await p.waitForSelector("#app:not(.hide)"); await p.waitForSelector("#atMsgs .bb", { timeout: 8000 }); await p.waitForTimeout(500);
  const abrir = async () => { if (await p.$("#modal:not(.hide)")) { await p.keyboard.press("Escape"); await p.waitForTimeout(300); } await p.click('button:has-text("Instruir a Ana")'); await p.waitForSelector('button:has-text("Só orientar")'); };
  await abrir(); await p.fill('textarea[aria-label="Instrução para a Ana"]', "ele é cliente antigo, seja mais direta"); ok(/orienta/i.test(await p.$eval("#insSug", (e) => e.textContent)), "sugestão deveria ser 'Só orientar'");
  await p.click('button:has-text("Só orientar")'); await p.waitForTimeout(600); ok(envios.length === 1 && envios[0].quando === "orientar" && /cliente antigo/.test(envios[0].texto), "só orientar: " + JSON.stringify(envios));
  await abrir(); await p.fill('textarea[aria-label="Instrução para a Ana"]', "manda um áudio retomando o contato"); ok(/ação|agora/i.test(await p.$eval("#insSug", (e) => e.textContent)), "sugestão deveria ser 'mandar agora'");
  await p.click('button:has-text("Orientar e mandar agora")'); await p.waitForTimeout(600); ok(envios.length === 2 && envios[1].quando === "agora", "mandar agora: " + JSON.stringify(envios));
  await abrir(); await p.fill('textarea[aria-label="Instrução para a Ana"]', "não mande áudio para ele"); ok(/orienta/i.test(await p.$eval("#insSug", (e) => e.textContent)), "negação deve sugerir 'Só orientar'");
  ok(envios.length === 2, "nada pode ser enviado sem clicar em um dos botões");
  await ctx.close(); await b.close(); console.log(`instruir_ui: ${checks} verificações; falhas: ${falhas.length}`); falhas.forEach((x) => console.log(" - " + x)); process.exit(falhas.length ? 1 : 0);
})();
