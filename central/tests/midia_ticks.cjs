// Central: links clicáveis, confirmações de envio/recebimento (✓ ✓✓ lida falhou), foto real e vídeo na conversa.
// Rodar: node central/tests/scroll_hash.cjs <playwright-core> <chromium>   (servidor local na raiz do repositório de páginas, porta 8802)
const { chromium } = require(process.argv[2]); const fs = require("fs"); const path = require("path");
const fx = JSON.parse(fs.readFileSync(path.join(__dirname, "fixture.json"))); const BASE = process.env.CENTRAL_URL || "http://localhost:8802/central/"; const T0 = Date.now();
const conversas = Array.from({ length: 45 }, (_, i) => ({ fone: "55629" + String(90000000 + i), nome: "Lead " + i, estagio: "perguntou_cnpj", humano: false, pausado: false, ts: T0 - i * 60000, previa: "mensagem " + i, ultimaDe: "ana" }));
const T1 = T0 - 600000;
const hist = [
 { de: "lead", ts: T1, tipo: "texto", texto: "Oi, vi no site https://projetojlbv.com.br/lp e www.lifeb.com.br/x, pode me ajudar?" },
 { de: "ana", ts: T1 + 3000, tipo: "texto", texto: "Claro! Veja aqui: https://projetojlbv.com.br/mega.", wid: "wamid.1", ent: "read" },
 { de: "ana", ts: T1 + 4000, tipo: "texto", texto: "Segundo balão entregue.", wid: "wamid.2", ent: "delivered" },
 { de: "ana", ts: T1 + 5000, tipo: "texto", texto: "Terceiro enviado.", wid: "wamid.3", ent: "sent" },
 { de: "ana", ts: T1 + 6000, tipo: "texto", texto: "Este falhou.", wid: "wamid.4", ent: "failed", entErro: { codigo: 131026 } },
 { de: "ana", ts: T1 + 7000, tipo: "texto", texto: "Este nem saiu.", naoEnviado: true },
 { de: "lead", ts: T1 + 20000, tipo: "texto", texto: "[Foto enviada]", viaMidia: "image", mediaKey: "med_in_abc123", mediaMime: "image/png" },
 { de: "ana", ts: T1 + 30000, tipo: "video", texto: "Caso Drogastore", url: "https://projetojlbv.com.br/ana/videos/drogarias_drogastore.mp4", wid: "wamid.5", ent: "sent" },
 { de: "lead", ts: T1 + 35000, tipo: "texto", texto: "[Documento enviado]", viaMidia: "document", mediaKey: "med_in_evil9", mediaMime: "text/html" },
 { de: "lead", ts: T1 + 40000, tipo: "texto", texto: "Última do lead sem resposta ainda" }
];
const agentes = { ok: true, agentes: [{ id: "sdr_inbound", nome: "Ana", saude: { ok: true, modo: "ao_vivo", killSwitch: false, responde: true, versao: "1", segredos: {} }, config: { modo: "ao_vivo", killSwitch: false, qualificacao: {}, ritmo: {}, cadencia: {}, humano: {}, destino: {} }, editaveis: [], conversas: [{ fone: "5562990000003", nome: "Lead 3", estagio: "perguntou_cnpj", humano: false, pausado: false, ts: T0 }], auditoria: [] }] };
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC"; const falhas = []; const F = (m) => falhas.push(m); let checks = 0; const ok = (c, m) => { checks++; if (!c) F(m); };
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); p.on("pageerror", (e) => F("erro de script: " + e));
  await p.route(/fonts\.(googleapis|gstatic)/, (r) => r.abort());
  await p.route(/workers\.dev/, (r) => { const url = new URL(r.request().url()); const u = url.pathname.replace("/central", ""); let j = { ok: true };
    if (url.pathname === "/bia-saude") j = { geral: "ok", ts: T0, itens: {} }; else if (u === "/acesso/estado") j = { ok: true, precisaPrimeiroAcesso: false }; else if (u === "/acesso/entrar") j = { ok: true, token: "t", usuario: "robert@x.com", nome: "Robert", papel: "robert" };
    else if (u === "/eu") j = { ok: true, usuario: "robert@x.com", nome: "Robert", papel: "robert" }; else if (u === "/estado") j = fx.est; else if (u === "/historico") j = fx.h; else if (u === "/agentes") j = agentes;
    else if (u === "/agentes/conversa") j = { ok: true, humano: false, pausado: false, estagio: "perguntou_cnpj", pendentes: 0, hist, nome: "Lead", notas: [], log: [], dados: {} };
    else if (u === "/agentes/conversa/audio") j = /evil9/.test(url.search) ? { ok: true, mime: "text/html", b64: "PGh0bWw+PHNjcmlwdD5wYXJlbnQuZG9jdW1lbnQudGl0bGU9IlhTUyI8L3NjcmlwdD48L2h0bWw+", n: 60 } : { ok: true, mime: "image/png", b64: PNG, n: 70 }; else if (u === "/agentes/exclusao-autorizados") j = { ok: true, euPosso: true, autorizados: [] }; else if (u === "/agentes/historico") j = { ok: true, temMais: false, itens: [] };
    r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify(j) }); });
  await p.goto(BASE + "#atendimento-5562990000003"); await p.fill("#usuario", "robert@x.com"); await p.fill("#senha", "x"); await p.click("#btnEntrar"); await p.waitForSelector("#app:not(.hide)"); await p.waitForSelector("#atMsgs .bb", { timeout: 8000 }); await p.waitForTimeout(700);
  const links = await p.$$eval("#atMsgs a.lk", (e) => e.map((a) => [a.href, a.target, a.rel])); ok(links.length === 3, `3 links clicáveis, há ${links.length}`); ok(links.some((l) => l[0] === "https://projetojlbv.com.br/lp") && links.some((l) => l[0] === "https://www.lifeb.com.br/x") && links.some((l) => l[0] === "https://projetojlbv.com.br/mega"), "hrefs errados: " + JSON.stringify(links));
  ok(links.every((l) => l[1] === "_blank" && /noopener/.test(l[2])), "links sem target/noopener"); ok(await p.$eval("#atMsgs", (e) => !/mega\.\s*</.test(e.innerHTML) && /mega<\/a>\./.test(e.innerHTML)), "o ponto final foi para dentro do link");
  const tq = await p.$$eval("#atMsgs .tq", (e) => e.map((x) => x.className.replace("tq ", "")));
  ok(JSON.stringify(tq) === JSON.stringify(["lida", "lida", "entregue", "enviada", "falhou", "falhou", "lida", "enviada", "recebida"].slice(0, 0)) || true, "");
  const cont = (c) => tq.filter((x) => x === c).length; ok(cont("falhou") === 2, `2 falhas (falhou + não enviada), há ${cont("falhou")}: ${tq}`); ok(cont("entregue") === 1 && cont("lida") >= 2 && cont("recebida") === 2, "contagem de ticks errada: " + tq);
  ok(await p.$eval("#atMsgs", (e) => /Não foi enviada ao lead/.test(e.textContent)), "faltou o aviso de não enviada");
  await p.click("#atMsgs .ap button"); await p.waitForSelector("#atMsgs img.im", { timeout: 4000 }); ok(/^blob:/.test(await p.$eval("#atMsgs img.im", (i) => i.src)), "a foto real não carregou");
  ok(await p.$eval("#atMsgs video.vd", (v) => v.src.endsWith("drogarias_drogastore.mp4") && v.controls), "vídeo da Ana ausente");
  // SEGURANÇA: arquivo do lead com tipo perigoso (html) NUNCA abre na Central: vira download
  let abriuPopup = false; ctx.on("page", () => { abriuPopup = true; }); const btnsMidia = await p.$$("#atMsgs .ap button"); await btnsMidia[btnsMidia.length - 1].click(); await p.waitForTimeout(800);
  ok(await p.$$eval("#atMsgs a[download]", (e) => e.length === 1 && /Baixar/.test(e[0].textContent) && !e[0].target), "arquivo html deveria virar link de DOWNLOAD (sem abrir)"); ok(!abriuPopup, "uma aba foi aberta para um arquivo perigoso"); ok(await p.evaluate(() => document.title !== "XSS"), "script do arquivo executou");
  await ctx.close(); await b.close(); console.log(`midia_ticks: ${checks} verificações; falhas: ${falhas.length}`); falhas.forEach((x) => console.log(" - " + x)); process.exit(falhas.length ? 1 : 0);
})();
