// Central: LINK POR ABA (17/11). Cada aba tem hash próprio; abrir o link abre a aba; botão voltar/avançar funciona; hashchange tratado; hash estranho/aba proibida não quebra nada.
// Rodar: node central/tests/link_aba.cjs <playwright-core> <chromium>
const { chromium } = require(process.argv[2]); const B = require("./_base.cjs"); const T = B.suite("link_aba");
const ABAS = { visao: ["visao", "Visão geral"], estado: ["bia", "Bia e automações"], leitura: ["chaves", "Todas as chaves"], filas: ["filas", "Filas de mensagens"], cal: ["calendario", "Calendário"], atend: ["atendimento", "Atendimento"], agentes: ["ana", "Ana"], hist: ["historico", "Histórico"], atalhos: ["atalhos", "Atalhos"], eco: ["ecossistema", "Ecossistema"], usuarios: ["usuarios", "Usuários"], conta: ["conta", "Minha conta"] };
const titulo = (p) => p.evaluate(() => document.getElementById("titulo").firstChild.nodeValue);
const hash = (p) => p.evaluate(() => location.hash);
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  // 1) cada hash abre a aba certa (antes do login: o link sobrevive ao login)
  for (const [w, h] of [[1440, 900], [390, 844]]) for (const k of Object.keys(ABAS)) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const mock = B.criarMock(); const p = await B.novaPagina(ctx, mock);
    await B.entrar(p, "#" + ABAS[k][0]); const tt = await titulo(p);
    T.ok(tt === ABAS[k][1], `[${w}] #${ABAS[k][0]} abriu "${tt}" (esperava ${ABAS[k][1]})`);
    T.ok((await hash(p)) === "#" + ABAS[k][0], `[${w}] hash mudou sozinho: ${await hash(p)}`);
    T.ok(!(p._erros || []).length, `[${w}] #${k}: erros de script ${p._erros}`);
    await ctx.close();
  }
  // 2) navegar pelo menu grava hash e o voltar/avançar percorre as abas
  { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const mock = B.criarMock(); const p = await B.novaPagina(ctx, mock); await B.entrar(p, "");
    T.ok((await titulo(p)) === "Visão geral", "sem hash deveria abrir a Visão geral");
    const seq = ["estado", "filas", "agentes", "hist", "conta"]; const nomes = { estado: "Bia e automações", filas: "Filas de mensagens", agentes: "Ana", hist: "Histórico", conta: "Minha conta" };
    for (const k of seq) { await p.click(`#nav a:has-text("${nomes[k]}")`); await p.waitForTimeout(150); T.ok((await hash(p)) === "#" + ABAS[k][0], `clique em ${k}: hash ${await hash(p)}`); T.ok((await titulo(p)) === nomes[k], `clique em ${k}: título ${await titulo(p)}`); }
    for (let i = seq.length - 2; i >= 0; i--) { await p.goBack(); await p.waitForTimeout(200); T.ok((await titulo(p)) === nomes[seq[i]], `voltar -> esperava ${nomes[seq[i]]}, veio ${await titulo(p)}`); T.ok((await hash(p)) === "#" + ABAS[seq[i]][0], `voltar: hash ${await hash(p)}`); }
    await p.goBack(); await p.waitForTimeout(200); T.ok((await titulo(p)) === "Visão geral", "voltar até a primeira entrada = Visão geral (veio " + (await titulo(p)) + ")");
    await p.goForward(); await p.waitForTimeout(200); T.ok((await titulo(p)) === "Bia e automações", "avançar -> Bia e automações (veio " + (await titulo(p)) + ")");
    // o item do menu fica marcado
    T.ok(await p.evaluate(() => document.querySelector("#nav a.on span").textContent) === "Bia e automações", "menu não marcou a aba atual após avançar");
    // 3) mudar o hash na barra de endereço (hashchange) e apelidos
    for (const [hh, esp] of [["#ecossistema", "Ecossistema"], ["#config", "Bia e automações"], ["#agentes", "Ana"], ["#HISTORICO", "Histórico"], ["#cal", "Calendário"], ["#atend", "Atendimento"]]) { await p.evaluate((x) => { location.hash = x; }, hh); await p.waitForTimeout(250); T.ok((await titulo(p)) === esp, `hashchange ${hh} -> ${await titulo(p)} (esperava ${esp})`); }
    // 4) hash desconhecido: nada estranho (fica onde está e o endereço é corrigido)
    const antes = await titulo(p);
    for (const lixo of ["#lixo", "#__proto__", "#constructor", "#toString", "#%E0%A4%A", "#atendimento-123", "#atendimento-5562999990000x", "#<img src=x onerror=alert(1)>"]) { await p.evaluate((x) => { location.hash = x; }, lixo); await p.waitForTimeout(150); T.ok((await titulo(p)) === antes, `hash ${lixo} mudou a tela para ${await titulo(p)}`); const hh = await hash(p); T.ok(/^#(atendimento|ana|calendario|bia|visao|historico|ecossistema|chaves|filas|atalhos|conta|usuarios)(-55\d{10,11})?$/.test(hh) || hh === "", `hash ${lixo} não foi corrigido: ${hh}`); }
    T.ok(!(p._erros || []).length, "erros de script na navegação: " + p._erros); await ctx.close(); }
  // 5) Atendimento com conversa: #atendimento-<fone> abre a conversa; "voltar" da conversa vira #atendimento; menu para outra aba e volta
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const mock = B.criarMock(); const p = await B.novaPagina(ctx, mock); await B.entrar(p, "#atendimento-" + B.FONE);
    await p.waitForSelector(".ri.sel", { timeout: 5000 }).catch(() => {}); T.ok((await hash(p)) === "#atendimento-" + B.FONE, "hash da conversa: " + (await hash(p)));
    T.ok(await p.evaluate(() => !!document.querySelector(".ax.chatAberto")), "conversa não abriu no celular");
    await p.click(".ax .hd .vo"); await p.waitForTimeout(250); T.ok((await hash(p)) === "#atendimento", "voltar da conversa deveria deixar #atendimento, veio " + (await hash(p)));
    T.ok(await p.evaluate(() => !document.querySelector(".ax.chatAberto")), "lista deveria aparecer após voltar");
    await p.click("#nav a:has-text('Calendário')"); await p.waitForTimeout(200); await p.goBack(); await p.waitForTimeout(300); T.ok((await titulo(p)) === "Atendimento", "voltar do Calendário deveria retornar ao Atendimento"); T.ok(!(p._erros || []).length, "erros: " + p._erros); await ctx.close(); }
  // 6) permissão: SDR não entra em #usuarios; senha provisória prende na aba Minha conta
  { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const mock = B.criarMock({ papel: "sdr" }); const p = await B.novaPagina(ctx, mock); await B.entrar(p, "#usuarios");
    T.ok((await titulo(p)) !== "Usuários", "SDR conseguiu abrir Usuários pelo link"); T.ok((await hash(p)) !== "#usuarios", "hash proibido ficou na barra: " + (await hash(p)));
    await p.evaluate(() => { location.hash = "#usuarios"; }); await p.waitForTimeout(250); T.ok((await titulo(p)) !== "Usuários", "SDR abriu Usuários por hashchange"); await ctx.close(); }
  { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const mock = B.criarMock({ trocarSenha: true }); const p = await B.novaPagina(ctx, mock); await B.entrar(p, "#historico");
    T.ok((await titulo(p)) === "Minha conta", "senha provisória deveria prender em Minha conta, abriu " + (await titulo(p))); await p.evaluate(() => { location.hash = "#ana"; }); await p.waitForTimeout(250); T.ok((await titulo(p)) === "Minha conta", "senha provisória: hashchange escapou para " + (await titulo(p))); T.ok((await hash(p)) === "#conta", "hash deveria voltar a #conta: " + (await hash(p))); await p.click("#nav a:has-text('Histórico')"); await p.waitForTimeout(250); T.ok((await titulo(p)) === "Minha conta", "senha provisória: clique no menu escapou para " + (await titulo(p))); await ctx.close(); }
  // 7) sem ciclo de recarga: trocar de aba 20 vezes não gera pedidos em excesso nem erro
  { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const mock = B.criarMock(); const p = await B.novaPagina(ctx, mock); await B.entrar(p, ""); const n0 = mock.log.length;
    for (let i = 0; i < 20; i++) { await p.evaluate((h) => { location.hash = h; }, i % 2 ? "#bia" : "#ecossistema"); await p.waitForTimeout(40); }
    await p.waitForTimeout(400); T.ok(mock.log.length - n0 < 60, "trocar de aba gerou pedidos demais: " + (mock.log.length - n0)); T.ok(!(p._erros || []).length, "erros: " + p._erros); await ctx.close(); }
  await b.close(); T.fim();
})();
