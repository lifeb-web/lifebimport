// Central: (1) o link #atendimento e #atendimento-<fone> abre DIRETO na aba Atendimento; (2) a atualização automática (a cada 4 s) NÃO devolve a rolagem da lista lateral nem da conversa para o topo.
// Rodar: node central/tests/scroll_hash.cjs <playwright-core> <chromium>   (servidor local na raiz do repositório de páginas, porta 8802)
const { chromium } = require(process.argv[2]); const fs = require("fs"); const path = require("path");
const fx = JSON.parse(fs.readFileSync(path.join(__dirname, "fixture.json"))); const BASE = process.env.CENTRAL_URL || "http://localhost:8802/central/"; const T0 = Date.now();
const conversas = Array.from({ length: 45 }, (_, i) => ({ fone: "55629" + String(90000000 + i), nome: "Lead " + i, estagio: "perguntou_cnpj", humano: false, pausado: false, ts: T0 - i * 60000, previa: "mensagem " + i, ultimaDe: "ana" }));
const hist = Array.from({ length: 80 }, (_, i) => ({ de: i % 2 ? "ana" : "lead", ts: T0 - (80 - i) * 60000, texto: "Mensagem número " + i + " da conversa, com texto para ocupar espaço." }));
const agentes = { ok: true, agentes: [{ id: "sdr_inbound", nome: "Ana (SDR Inbound)", saude: { ok: true, modo: "sombra", killSwitch: false, responde: false, versao: "0.3.0", segredos: { anthropic: true, openrouter: true, meta_token: false, meta_phone_id: false } }, config: { modo: "sombra", killSwitch: false, qualificacao: { minimoFarmacia: 100000, minimoSupermercado: 300000 }, ritmo: { inicial: 100, teto: 1000 }, cadencia: { maxContatos: 5, janelaDias: 6, horaIni: 8, horaFim: 20 }, humano: { debounceMs: 4000 }, destino: { sdrNome: "Felipe", sdrFone: "556293568997" } }, editaveis: [], conversas: [{ fone: "5562999990000", nome: "Carlos da Drogaria Central com nome bem comprido para testar quebra", estagio: "perguntou_cnpj", humano: false, pausado: false, ts: Date.now() - 6e4 }, { fone: "5562988880000", nome: "Mariana", estagio: "aguardando_humano", humano: true, pausado: false, ts: Date.now() - 36e5 }], auditoria: [{ ts: Date.now() - 9e5, quem: "Robert", para: { modo: "sombra" }, motivo: "começar a sombra" }] }] };
agentes.agentes[0].conversas = conversas;
const falhas = []; const F = (m) => falhas.push(m); let checks = 0; const ok = (c, m) => { checks++; if (!c) F(m); };
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  for (const [w, h] of [[1440, 900], [390, 844]]) for (const hash of ["", "#atendimento", "#atendimento-55629" + 90000003]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const tag = `${w}x${h} ${hash || "(sem hash)"}`;
    p.on("pageerror", (e) => F(`[${tag}] erro de script: ${e}`));
    await p.route(/fonts\.(googleapis|gstatic)/, (r) => r.abort());
    await p.route(/workers\.dev/, (r) => { const url = new URL(r.request().url()); const u = url.pathname.replace("/central", ""); let j = { ok: true };
      if (url.pathname === "/bia-saude") j = { geral: "ok", ts: T0, itens: {} }; else if (u === "/acesso/estado") j = { ok: true, precisaPrimeiroAcesso: false }; else if (u === "/acesso/entrar") j = { ok: true, token: "t", usuario: "robert@x.com", nome: "Robert", papel: "robert" };
      else if (u === "/eu") j = { ok: true, usuario: "robert@x.com", nome: "Robert", papel: "robert" }; else if (u === "/estado") j = fx.est; else if (u === "/historico") j = fx.h; else if (u === "/agentes") j = agentes;
      else if (u === "/agentes/conversa") j = { ok: true, humano: false, pausado: false, estagio: "perguntou_cnpj", pendentes: 0, hist, nome: "Lead", notas: [], log: [], dados: {} }; else if (u === "/agentes/exclusao-autorizados") j = { ok: true, euPosso: true, autorizados: [] };
      else if (u === "/agentes/historico") j = { ok: true, temMais: false, itens: [] };
      r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify(j) }); });
    await p.goto(BASE + hash); await p.fill("#usuario", "robert@x.com"); await p.fill("#senha", "x"); await p.click("#btnEntrar"); await p.waitForSelector("#app:not(.hide)"); await p.waitForTimeout(900);
    const emAtend = await p.evaluate(() => !!document.querySelector(".ax") ); if (hash) ok(emAtend, `[${tag}] o link não abriu na aba Atendimento`); else ok(!emAtend, `[${tag}] sem hash não deveria forçar Atendimento`);
    if (hash.startsWith("#atendimento-")) { await p.waitForSelector(".ri.sel", { timeout: 4000 }).catch(() => {}); const f = await p.evaluate(() => { const e = document.querySelector(".ri.sel"); return e && e.dataset.fone; }); ok(f === hash.slice(13), `[${tag}] não abriu a conversa certa (${f})`); }
    if (!hash) { await ctx.close(); continue; }
    const soChat = w < 600 && hash.startsWith("#atendimento-");   // no celular, com a conversa aberta, a lista fica escondida
    // rolagem da lista lateral + da conversa + da página: rola, deixa passar 2 atualizações de 4 s e confere que nada voltou ao topo
    if (!soChat) await p.waitForSelector("#atItens .ri", { timeout: 6000 }).catch(async () => { F(`[${tag}] lista de conversas não apareceu; tela: ` + (await p.evaluate(() => document.body.innerText.slice(0, 200).replace(/\n/g, " | ")))); }); const lista = await p.evaluate(() => { const e = document.getElementById("atItens"); if (!e) return { rolavel: false, top: 0 }; const alvo = e.scrollHeight > e.clientHeight ? e : e.parentElement; e.scrollTop = 400; return { rolavel: e.scrollHeight > e.clientHeight, top: e.scrollTop }; });
    const msgs = await p.evaluate(() => { const e = document.getElementById("atMsgs"); if (!e) return null; e.scrollTop = 300; return { top: e.scrollTop, rolavel: e.scrollHeight > e.clientHeight }; });
    if (msgs && msgs.rolavel) { hist.push({ de: "lead", ts: Date.now(), tipo: "texto", texto: "Mensagem NOVA chegando enquanto você lê lá em cima" }); }   // nova mensagem durante a leitura: não pode puxar a tela
    await p.waitForTimeout(9500);
    const depois = await p.evaluate(() => ({ lista: document.getElementById("atItens") && document.getElementById("atItens").scrollTop, msgs: document.getElementById("atMsgs") && document.getElementById("atMsgs").scrollTop, win: window.pageYOffset }));
    if (lista.rolavel) ok(Math.abs(depois.lista - lista.top) <= 2, `[${tag}] a lista lateral voltou ao topo (${lista.top} -> ${depois.lista})`);
    if (msgs && msgs.rolavel) ok(await p.$eval("#atMsgs", (e) => /Mensagem NOVA chegando/.test(e.textContent)), `[${tag}] a mensagem nova NÃO apareceu na conversa (perdida!)`);
    if (msgs && msgs.rolavel) ok(Math.abs(depois.msgs - msgs.top) <= 3, `[${tag}] a conversa voltou ao topo/fundo (${msgs.top} -> ${depois.msgs})`);
    await ctx.close();
  }
  await b.close(); console.log(`scroll_hash: ${checks} verificações; falhas: ${falhas.length}`); falhas.forEach((x) => console.log(" - " + x)); process.exit(falhas.length ? 1 : 0);
})();
