// Central: "cadastrou um número e chamou a Ana de outro" (Robert 13/11, caso Natan). A conversa vazia do cadastro aponta para a conversa real e vice-versa; a lista marca as duas.
// Rodar: node central/tests/vinculo.cjs <playwright-core> <chromium>   (servidor local na raiz do repositório de páginas, porta 8802)
const { chromium } = require(process.argv[2]); const fs = require("fs"); const path = require("path");
const fx = JSON.parse(fs.readFileSync(path.join(__dirname, "fixture.json"))); const BASE = process.env.CENTRAL_URL || "http://localhost:8802/central/"; const T0 = Date.now();
const FORM = "5561985470106", REAL = "556193671569"; let checks = 0; const falhas = []; const ok = (c, m) => { checks++; if (!c) falhas.push(m); }; const F = (m) => { checks++; falhas.push(m); };
let vincForm = null, vincReal = null, pedidos = [];
const lista = () => [{ fone: REAL, nome: "Natan", estagio: "perguntou_segmento", humano: false, pausado: false, ts: T0 - 60000, previa: "Que tipo de loja é a sua?", ultimaDe: "ana", ...(vincReal ? { vinculo: vincReal } : {}) }, { fone: FORM, nome: "Natan", estagio: "novo", humano: false, pausado: false, ts: T0 - 90000, previa: "", ultimaDe: null, ...(vincForm ? { vinculo: vincForm } : {}) }, { fone: "5562985444780", nome: "Nagdae", estagio: "perguntou_segmento", humano: false, pausado: false, ts: T0 - 5e6, previa: "oi", ultimaDe: "ana" }];
const agentes = () => ({ ok: true, agentes: [{ id: "sdr_inbound", nome: "Ana", saude: { ok: true, modo: "ao_vivo", killSwitch: false, responde: true, versao: "1", segredos: {} }, config: { modo: "ao_vivo", killSwitch: false, qualificacao: {}, ritmo: {}, cadencia: {}, humano: {}, destino: {} }, editaveis: [], conversas: lista(), auditoria: [] }] });
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); p.on("pageerror", (e) => F("erro de script: " + e));
  await p.route(/fonts\.(googleapis|gstatic)/, (r) => r.abort());
  await p.route(/workers\.dev/, (r) => { const url = new URL(r.request().url()); const u = url.pathname.replace("/central", ""); let j = { ok: true };
    if (url.pathname === "/bia-saude") j = { geral: "ok", ts: T0, itens: {} }; else if (u === "/acesso/estado") j = { ok: true, precisaPrimeiroAcesso: false }; else if (u === "/acesso/entrar") j = { ok: true, token: "t", usuario: "robert@x.com", nome: "Robert", papel: "robert" };
    else if (u === "/eu") j = { ok: true, usuario: "robert@x.com", nome: "Robert", papel: "robert" }; else if (u === "/estado") j = fx.est; else if (u === "/historico") j = fx.h; else if (u === "/agentes") j = agentes();
    else if (u === "/agentes/conversa") { const f = url.searchParams.get("fone"); pedidos.push(f); const isForm = f === FORM; j = { ok: true, humano: false, pausado: false, estagio: isForm ? "novo" : "perguntou_segmento", pendentes: 0, hist: isForm ? [] : [{ de: "lead", ts: T0 - 120000, tipo: "texto", texto: "Olá! Vi o Projeto JLBV da Life B e quero saber mais." }, { de: "ana", ts: T0 - 60000, tipo: "texto", texto: "Que tipo de loja é a sua?" }], nome: "Natan", notas: [], log: [], dados: {}, ...((f === FORM ? vincForm : f === REAL ? vincReal : null) ? { vinculo: f === FORM ? vincForm : vincReal } : {}) }; }
    else if (u === "/agentes/exclusao-autorizados") j = { ok: true, euPosso: true, autorizados: [] };
    r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify(j) }); });
  async function abrir(fone) { pedidos = []; await p.goto(BASE + "#atendimento-" + fone); await p.reload(); await p.waitForTimeout(700); if (await p.isVisible("#usuario")) { await p.fill("#usuario", "robert@x.com"); await p.fill("#senha", "x"); await p.click("#btnEntrar"); } await p.waitForSelector("#app:not(.hide)"); await p.waitForSelector("#atMsgs", { timeout: 8000 }); await p.waitForTimeout(500); }
  const banner = () => p.$eval("#atVinc", (e) => ({ t: e.textContent, forte: e.classList.contains("fr"), btn: (e.querySelector("button") || {}).textContent || "" })).catch(() => null);
  const FV = { papel: "formulario", com: REAL, comNome: "Natan", forca: "forte", estado: "ativo", aberturaCancelada: true, motivo: "x", ts: T0 }, WV = { papel: "whatsapp", com: FORM, comNome: "Natan", forca: "forte", estado: "ativo", aberturaCancelada: true, motivo: "x", ts: T0 };
  // 1) sem vínculo: nada aparece
  await abrir(FORM); ok((await banner()) === null, "1: sem vínculo não deve haver aviso"); ok(!(await p.$$eval(".ri .tg.vc", (e) => e.length)), "1: lista sem marca");
  // 2) conversa vazia do cadastro, vínculo forte
  vincForm = FV; vincReal = WV; await abrir(FORM); let b2 = await banner(); ok(b2 && /já está conversando com a Ana em outro número/.test(b2.t) && /\(61\) 9367-1569/.test(b2.t), "2: aviso do cadastro com o número da conversa real: " + JSON.stringify(b2)); ok(b2 && /abertura deste número foi cancelada/.test(b2.t), "2: diz que a abertura foi cancelada"); ok(b2 && b2.forte, "2: estilo forte"); ok(b2 && /Abrir a conversa do outro número/.test(b2.btn), "2: botão certo");
  // 3) o botão abre a conversa real
  await p.click("#atVinc button"); await p.waitForTimeout(900); ok(pedidos.includes(REAL), "3: o botão pede a conversa real: " + JSON.stringify(pedidos)); ok(/#atendimento-556193671569/.test(await p.evaluate(() => location.hash)) || (await p.$eval("#atMsgs", (e) => e.textContent)).includes("Vi o Projeto JLBV"), "3: abriu a conversa real");
  // 4) conversa real mostra o cadastro
  await abrir(REAL); let b4 = await banner(); ok(b4 && /também se cadastrou no formulário com o número (\+55 )?\(61\) 98547-0106/.test(b4.t), "4: aviso da conversa real: " + JSON.stringify(b4)); ok(b4 && /Abrir o cadastro do formulário/.test(b4.btn), "4: botão do cadastro");
  // 5) lista marca as duas
  ok((await p.$$eval(".ri .tg.vc", (e) => e.map((x) => x.textContent))).filter((x) => /Mesmo lead em outro número/.test(x)).length === 2, "5: a lista marca as DUAS conversas e só elas");
  // 6) médio: texto de confirmação, sem dizer que cancelou
  vincForm = { ...FV, forca: "medio", aberturaCancelada: false }; vincReal = { ...WV, forca: "medio", aberturaCancelada: false }; await abrir(FORM); let b6 = await banner(); ok(b6 && /pode estar conversando/.test(b6.t) && /Confirme antes de agir/.test(b6.t) && !/cancelada/.test(b6.t) && !b6.forte, "6: médio pede confirmação e não diz que cancelou: " + JSON.stringify(b6));
  // 7) confirmado vale como forte
  vincForm = { ...FV, forca: "medio", estado: "confirmado" }; await abrir(FORM); let b7 = await banner(); ok(b7 && b7.forte && /já está conversando/.test(b7.t), "7: confirmado pela equipe aparece como forte");
  // 8) desfeito: some
  vincForm = { ...FV, estado: "desfeito" }; vincReal = { ...WV, estado: "desfeito" }; await abrir(FORM); ok((await banner()) === null && !(await p.$$eval(".ri .tg.vc", (e) => e.length)), "8: vínculo desfeito não aparece nem na lista");
  // 9) absurdos do servidor: vínculo sem 'com', texto estranho, HTML no nome
  vincForm = { papel: "formulario", forca: "forte" }; await abrir(FORM); ok((await banner()) === null, "9: vínculo sem 'com' não quebra nem aparece");
  vincForm = { ...FV, comNome: "<img src=x onerror=window.__x=1>", com: "55619<b>9" }; await abrir(FORM); ok((await p.evaluate(() => window.__x)) === undefined && !(await p.$$eval("#atVinc img", (e) => e.length)), "9: nada do servidor vira HTML");
  // 10) outra conversa sem vínculo não ganha aviso
  vincForm = FV; vincReal = WV; await abrir("5562985444780"); ok((await banner()) === null, "10: conversa sem relação não ganha aviso");
  // 11) mobile 390: sem rolagem horizontal e botão alcançável
  await p.setViewportSize({ width: 390, height: 800 }); await abrir(FORM); ok(!(await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)), "11: sem rolagem horizontal no celular"); ok(await p.$eval("#atVinc button", (e) => { const r = e.getBoundingClientRect(); return r.height >= 30 && r.width > 80 && r.right <= innerWidth + 1; }), "11: botão do aviso cabe e é tocável");
  // 12) o aviso sobrevive ao redesenho automático (a lista é refeita a cada 4 s)
  vincForm = FV; await abrir(FORM); await p.waitForTimeout(4500); ok((await banner()) !== null, "12: o aviso continua depois do redesenho automático");
  await ctx.close(); await b.close(); console.log(`vinculo: ${checks} verificações; falhas: ${falhas.length}`); falhas.forEach((x) => console.log(" - " + x)); process.exit(falhas.length ? 1 : 0);
})();
