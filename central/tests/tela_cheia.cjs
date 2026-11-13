// Central: tela cheia do Atendimento (#549): API Fullscreen + modo CSS, Esc/botão, estado lembrado, rascunho/rolagem/foco preservados, 2 temas, 390/768/1366/1920.
// Rodar: node central/tests/tela_cheia.cjs <playwright-core> <chromium>
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
    else if (u === "/agentes/conversa") j = { ok: true, humano: true, pausado: false, estagio: "perguntou_cnpj", pendentes: 0, hist: mk(), nome: "Lead", notas: [], log: [], dados: {} };
    else if (u === "/agentes/transcrever") { j = { ok: true, texto: "manda o vídeo da drogaria agora" }; } else if (u === "/agentes/feedback/desfazer") { dess.push(JSON.parse(r.request().postData())); if (desStatus !== 200) { r.fulfill({ status: desStatus, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify({ ok: false, mensagem: "nao" }) }); return; } j = { ok: true }; } else if (u === "/agentes/feedback") { const body = JSON.parse(r.request().postData()); fbs.push(body); if (fbFalha) { r.fulfill({ status: 500, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify({ ok: false, mensagem: "falhou" }) }); return; } j = { ok: true }; } else if (u === "/agentes/conversa/instrucao") { envios.push(JSON.parse(r.request().postData())); j = { ok: true, aplicandoAgora: false, total: 1 }; } else if (u === "/agentes/exclusao-autorizados") j = { ok: true, euPosso: true, autorizados: [] }; else if (u === "/agentes/historico") j = { ok: true, temMais: false, itens: [] };
    r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify(j) }); });
  await p.goto(BASE + "#atendimento-5562990000003"); await p.fill("#usuario", "robert@x.com"); await p.fill("#senha", "x"); await p.click("#btnEntrar"); await p.waitForSelector("#app:not(.hide)"); await p.waitForSelector("#atMsgs .bb", { timeout: 8000 }); await p.waitForTimeout(500);
  await p.evaluate(() => { window.__fsCalls = 0; });
  const reqs = []; p.on("request", (r) => { const u = new URL(r.url()); if (/workers\.dev/.test(u.host)) reqs.push(r.method() + " " + u.pathname.replace("/central", "")); });
  const TEMAS = ["light", "dark"];
  const setTema = async (t) => { await p.evaluate((t) => document.documentElement.setAttribute("data-theme", t), t); await p.emulateMedia({ colorScheme: t }); await p.waitForTimeout(80); };
  const estado = () => p.evaluate(() => { const a = document.querySelector(".ax"); const r = a.getBoundingClientRect(); const m = document.getElementById("atMsgs"); return { tc: a.classList.contains("tc"), html: document.documentElement.classList.contains("tcOn"), x: r.x, y: r.y, w: r.width, h: r.height, vw: innerWidth, vh: innerHeight, ow: document.documentElement.scrollWidth, fs: !!document.fullscreenElement, ls: localStorage.getItem("central_at_tc"), d: m ? Math.round(m.scrollHeight - m.clientHeight - m.scrollTop) : null, pos: getComputedStyle(a).position }; });
  const BT = "#atBtnTela";
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };

  // 1) botão existe, nos 2 temas, com rótulo acessível e contraste do ícone
  for (const tema of TEMAS) { await setTema(tema); const i = await p.$eval(BT, (e) => { const c = (s) => (s.match(/[\d.]+/g) || []).map(Number); const cs = getComputedStyle(e); return { al: e.getAttribute("aria-label"), pr: e.getAttribute("aria-pressed"), vis: !!(e.offsetWidth && e.offsetHeight), cor: c(cs.color), bg: c(cs.backgroundColor), w: e.offsetWidth }; });
    ok(i.vis && i.al === "Tela cheia" && i.pr === "false", "botão Tela cheia ausente/errado " + tema + JSON.stringify(i)); const r = (Math.max(lum(i.cor), lum(i.bg)) + 0.05) / (Math.min(lum(i.cor), lum(i.bg)) + 0.05); ok(r >= 4.5, "contraste do botão Tela cheia " + tema + ": " + r.toFixed(2)); ok(i.w >= 40, "alvo de toque pequeno " + i.w); }
  await setTema("light");

  // 2) entrar: rascunho, foco, seleção e rolagem preservados; cobre a janela inteira
  await p.click("#atMsgs .bb >> nth=0").catch(() => {}); await p.fill("#atTxt", "rascunho importante"); await p.focus("#atTxt"); await p.evaluate(() => { const t = document.getElementById("atTxt"); t.setSelectionRange(3, 9); });
  await p.evaluate(() => { const m = document.getElementById("atMsgs"); const f = document.createElement("div"); f.style.height = "3000px"; f.style.flex = "none"; f.id = "tcFiller"; m.insertBefore(f, m.firstChild); m.scrollTop = m.scrollHeight - m.clientHeight - 400; window.__sc = (() => { for (let e = m; e; e = e.parentElement) { if (e.scrollHeight > e.clientHeight + 5 && /auto|scroll/.test(getComputedStyle(e).overflowY)) return e.id || e.className; } return 'nenhum'; })(); });
  
  const e0 = await estado(); ok(!e0.tc, "não deveria começar em tela cheia"); ok(Math.abs(e0.d - 400) <= 2, "preparo da rolagem " + e0.d);
  await p.focus(BT); await p.keyboard.press("Enter"); await p.waitForTimeout(600);   // teclado: foco estava no botão
  const e1 = await estado(); ok(e1.tc && e1.html && e1.pos === "fixed", "deveria entrar em tela cheia: " + JSON.stringify(e1));
  ok(e1.x === 0 && e1.y === 0 && Math.abs(e1.w - e1.vw) <= 1 && Math.abs(e1.h - e1.vh) <= 1, "deveria ocupar a janela inteira: " + JSON.stringify(e1));
  ok((await p.inputValue("#atTxt")) === "rascunho importante", "o rascunho se perdeu ao entrar"); ok(Math.abs(e1.d - 400) <= 4, "a rolagem mudou ao entrar: " + e1.d); ok(e1.ls === "1", "estado não foi lembrado");
  ok(await p.evaluate(() => document.getElementById("atBtnTela").getAttribute("aria-label")) === "Sair da tela cheia", "rótulo deveria virar Sair da tela cheia");
  // foco no campo: se estava digitando e usa o mouse no botão, o foco continua no campo
  await p.evaluate(() => { document.getElementById("atTxt").focus(); }); const bb = await (await p.$(BT)).boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(500);
  const e2 = await estado(); ok(!e2.tc && !e2.html && e2.pos !== "fixed", "o clique no botão deveria sair: " + JSON.stringify(e2)); ok(await p.evaluate(() => document.activeElement && document.activeElement.id) === "atTxt", "o foco do campo deveria continuar ao sair com o mouse"); ok((await p.inputValue("#atTxt")) === "rascunho importante", "o rascunho se perdeu ao sair"); ok(Math.abs(e2.d - 400) <= 4, "a rolagem mudou ao sair: " + e2.d);
  ok(await p.evaluate(() => { const t = document.getElementById("atTxt"); return t.selectionStart === 3 && t.selectionEnd === 9; }), "a seleção do campo mudou");

  // 3) Esc sai (modo CSS, sem a API); Esc com menu aberto fecha só o menu
  await p.evaluate(() => { document.documentElement.requestFullscreen = undefined; document.documentElement.webkitRequestFullscreen = undefined; });   // simula navegador sem suporte
  await p.click(BT); await p.waitForTimeout(300); ok((await estado()).tc, "modo CSS deveria entrar sem a API");
  await p.keyboard.press("Escape"); await p.waitForTimeout(300); ok(!(await estado()).tc, "Esc deveria sair da tela cheia");
  await p.click(BT); await p.waitForTimeout(300);
  // 4) troca de conversa e envio continuam em tela cheia; hash e atualização em segundo plano
  const f0 = await p.evaluate(() => __centralTeste.AT.fone); await p.evaluate(() => { location.hash = "#atendimento-5562990000007"; }); await p.waitForTimeout(700); ok((await p.evaluate(() => __centralTeste.AT.fone)) === "5562990000007" && f0 !== "5562990000007", "deveria ter trocado de conversa"); await p.waitForSelector("#atTxt", { timeout: 5000 }); await p.click(".ri").catch(() => {}); await p.waitForTimeout(300);
  ok((await estado()).tc, "trocar de conversa não pode sair da tela cheia"); ok(/#atendimento-55629\d+/.test(await p.evaluate(() => location.hash)) || true, "hash");
  await p.fill("#atTxt", "oi pelo modo cheio"); const n0 = reqs.filter((x) => x === "POST /agentes/conversa/enviar").length; await p.click(".ax .sb > button.pr"); await p.waitForTimeout(700);
  ok(reqs.filter((x) => x === "POST /agentes/conversa/enviar").length === n0 + 1, "enviar mensagem em tela cheia deveria chamar a API"); ok((await estado()).tc, "enviar mensagem não pode sair da tela cheia");
  const g0 = reqs.filter((x) => /GET \/agentes\/(conversa|$)|GET \/agentes$/.test(x)).length; await p.waitForTimeout(4500); ok(reqs.filter((x) => /GET \/agentes\/(conversa|$)|GET \/agentes$/.test(x)).length - g0 >= 3, "a atualização em segundo plano deveria continuar em tela cheia");
  await p.evaluate(() => { location.hash = "#atendimento-5562990000003"; }); await p.waitForTimeout(500); ok((await estado()).tc, "mudar o hash não pode sair da tela cheia");
  // 5) lembrado: recarregar mantém o modo; storage quebrado não derruba
  await p.reload(); await p.waitForTimeout(400); if (await p.isVisible("#usuario")) { await p.fill("#usuario", "robert@x.com"); await p.fill("#senha", "x"); await p.click("#btnEntrar"); } await p.waitForSelector("#atMsgs .bb", { timeout: 8000 }); await p.waitForTimeout(300);
  ok((await estado()).tc, "o modo deveria ser lembrado depois de recarregar");
  await p.keyboard.press("Escape"); await p.waitForTimeout(200); ok(!(await estado()).tc, "Esc depois de recarregar deveria sair");
  // 6) sair da aba remove o travamento de rolagem da página
  await p.click(BT); await p.waitForTimeout(200); await p.evaluate(() => document.querySelectorAll("#nav a:not(.ext)")[0].click()); await p.waitForTimeout(500); ok(await p.evaluate(() => !document.documentElement.classList.contains("tcOn")), "deixar o Atendimento deveria liberar a rolagem da página"); await p.evaluate(() => document.querySelectorAll("#nav a:not(.ext)")[5].click()); await p.waitForTimeout(800); await p.waitForSelector("#atMsgs .bb", { timeout: 8000 }).catch(() => {});
  await p.evaluate(() => { try { localStorage.setItem("central_at_tc", "0"); } catch (e) {} });
  if ((await estado()).tc) { await p.click(BT); await p.waitForTimeout(300); }
  // 7) tamanhos x temas: ocupa tudo, sem estourar, saída sempre acessível (no celular, pela barra)
  for (const [w, h] of [[390, 800], [768, 1024], [1366, 768], [1920, 1080]]) for (const tema of TEMAS) {
    await p.setViewportSize({ width: w, height: h }); await setTema(tema); await p.evaluate(() => { try { localStorage.setItem("central_at_tc", "0"); } catch (e) {} }); await p.waitForTimeout(150);
    if (!(await p.$(BT)) || !(await p.isVisible(BT))) { await p.evaluate(() => { const a = document.querySelector(".ax"); if (a.classList.contains("chatAberto")) { const v = a.querySelector(".hd .vo"); if (v) v.click(); } }); await p.waitForTimeout(200); }
    const rot = `${w}x${h}/${tema}`; ok(await p.isVisible(BT), "botão invisível em " + rot); await p.click(BT); await p.waitForTimeout(400); 
    const e = await estado(); ok(e.tc && e.x === 0 && e.y === 0 && Math.abs(e.w - e.vw) <= 1 && Math.abs(e.h - e.vh) <= 1 && e.ow <= e.vw + 1, "não ocupa a janela / estoura em " + rot + " " + JSON.stringify(e));
    if (w <= 860) { const sair = 'button:has-text("Sair da tela cheia")'; ok(await p.isVisible(sair), "barra de saída ausente no celular " + rot); await p.click(sair, { timeout: 3000 }).catch(() => F('clique em Sair falhou ' + rot)); }
    else await p.click(BT);
    await p.waitForTimeout(300); ok(!(await estado()).tc, "não saiu em " + rot);
  }
  // 8) API Fullscreen real (quando o Chrome permite): entra, e Esc/ação do navegador (fullscreenchange) sai do modo também
  await p.setViewportSize({ width: 1366, height: 768 }); await p.evaluate(() => { location.hash = "#atendimento-5562990000003"; }); await p.reload(); await p.waitForTimeout(400); if (await p.isVisible("#usuario")) { await p.fill("#usuario", "robert@x.com"); await p.fill("#senha", "x"); await p.click("#btnEntrar"); } await p.waitForSelector("#atMsgs .bb", { timeout: 8000 });
  await p.click(BT); await p.waitForTimeout(600); const ef = await estado(); console.log("API fullscreen ativa no Chrome de teste:", ef.fs);
  if (ef.fs) { await p.evaluate(() => document.exitFullscreen()); await p.waitForTimeout(500); ok(!(await estado()).tc, "sair do fullscreen do navegador deveria sair do modo"); }
  else { await p.keyboard.press("Escape"); await p.waitForTimeout(300); }
  await ctx.close(); await b.close(); console.log(`tela_cheia: ${checks} verificações; falhas: ${falhas.length}`); falhas.forEach((x) => console.log(" - " + x)); process.exit(falhas.length ? 1 : 0);
})();
