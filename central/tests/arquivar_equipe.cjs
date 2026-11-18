// Central 17/11 (Robert #3067): dá para ARQUIVAR conversa que está com a equipe (assumida) ou com a Ana pausada; qualquer mensagem nova (equipe, lead ou Ana) traz a conversa de volta, com o selo 'Voltou: mensagem da equipe/do lead/da Ana'; sem mensagem, continua arquivada; só 'retomar a Ana' não traz de volta.
// Também: servidor ANTIGO que recusa (409 conversa_precisa_de_gente) => a página mostra o motivo dele e a conversa fica onde estava; servidor antigo SEM voltouEm/ultimaAtividade => a página percebe a mensagem nova pelo ts (fallback) e traz de volta.
// Rodar: node central/tests/arquivar_equipe.cjs <playwright-core> <chromium>   (CENTRAL_URL aponta para a página a testar; nunca a 8802 de outro agente)
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("arquivar_equipe");
const NOW = Date.now(), M = 60000, H = 3600000;
const F = { EQ: "5562900000011", LEAD: "5562900000012", NADA: "5562900000013", PAUSA: "5562900000014", VELHO: "5562900000015", ABERTA: "5562900000016", ESP: "5562900000017", REP: "5562900000018" };
const T_REP = Date.UTC(2026, 10, 17, 2, 55);
function estadoInicial() {
  return {
    srv: "novo",   // 'novo' = servidor da Ana com o contrato (aceita arquivar com a equipe, manda ultimaAtividade/voltouEm); 'recusa' = servidor atual (409 para assumida); 'antigo' = sem campos novos
    posts: [], controles: [],
    itens: {
      [F.EQ]: { fone: F.EQ, nome: "Com Equipe", estagio: "perguntou_cnpj", humano: true, pausado: false, ts: NOW - 30 * M, previa: "pode me ligar", ultimaDe: "lead", ultimaAtividade: NOW - 30 * M },
      [F.LEAD]: { fone: F.LEAD, nome: "Lead Volta", estagio: "perguntou_cnpj", humano: true, pausado: false, ts: NOW - 40 * M, previa: "ok", ultimaDe: "humano", ultimaAtividade: NOW - 40 * M },
      [F.NADA]: { fone: F.NADA, nome: "Fica Quieta", estagio: "perguntou_cnpj", humano: true, pausado: false, ts: NOW - 50 * M, previa: "tchau", ultimaDe: "humano", ultimaAtividade: NOW - 50 * M },
      [F.PAUSA]: { fone: F.PAUSA, nome: "Ana Pausada", estagio: "perguntou_cnpj", humano: false, pausado: true, ts: NOW - 60 * M, previa: "depois eu vejo", ultimaDe: "lead", ultimaAtividade: NOW - 60 * M },
      [F.VELHO]: { fone: F.VELHO, nome: "Servidor Velho", estagio: "perguntou_cnpj", humano: true, pausado: false, ts: NOW - 70 * M, previa: "oi", ultimaDe: "lead" },
      [F.ABERTA]: { fone: F.ABERTA, nome: "Aberta No Chat", estagio: "perguntou_cnpj", humano: false, pausado: false, ts: NOW - 2 * H, previa: "bom dia", ultimaDe: "lead", ultimaAtividade: NOW - 2 * H },
      [F.ESP]: { fone: F.ESP, nome: "Esperando Pessoa", estagio: "aguardando_humano", humano: false, pausado: false, ts: NOW - 3 * H, previa: "quero falar com alguém", ultimaDe: "lead", ultimaAtividade: NOW - 3 * H, repasse: { repassada: true, quem: "Ana", quando: null, motivo: null } },
      [F.REP]: { fone: F.REP, nome: "Repassada Felipe", estagio: "aguardando_humano", humano: false, pausado: false, ts: NOW - 4 * H, previa: "ok, obrigado", ultimaDe: "lead", ultimaAtividade: NOW - 4 * H, repasse: { repassada: true, quem: "Robert", quando: T_REP, motivo: "handoff_manual" } },
    },
  };
}
// servidor NOVO (cdd17e0) manda `atendimento`/`atendimentoProva` por item; o atual não
function comAtendimento(E) { if (E.srv !== "novo") return; const A = (f, a, pr) => { E.itens[f].atendimento = a; E.itens[f].atendimentoProva = pr || null; }; Object.values(E.itens).forEach((it) => { it.atendimento = it.humano ? "com_equipe" : null; it.atendimentoProva = null; }); A(F.ESP, "esperando_pessoa", null); A(F.REP, "repassada_felipe", "nota_manual"); }
const ficha = (f, it) => ({ ok: true, humano: !!(it && it.humano), pausado: !!(it && it.pausado), estagio: (it && it.estagio) || "perguntou_cnpj", pendentes: 0, hist: [{ de: "lead", ts: NOW - 2 * H, texto: "bom dia" }], nome: (it && it.nome) || "", notas: [], log: [], dados: {} });
function novoMock(E) {
  return B.criarMock({
    agentes: () => { comAtendimento(E); const a = B.agentesPadrao(); a.agentes[0].conversas = Object.values(E.itens).map((x) => Object.assign({}, x)); a.agentes[0].auditoria = []; return a; },
    conversa: (url) => { const f = url.searchParams.get("fone"); return ficha(f, E.itens[f]); },
    over: async (u, url, req, body) => {
      if (u === "/agentes/conversa/arquivar" && req.method() === "POST") {
        E.posts.push(body); const it = E.itens[body.fone]; if (!it) return { status: 404, json: { ok: false, erro: "conversa_inexistente" } };
        if (E.srv === "recusa" && body.arquivar !== false && (it.humano || it.estagio === "aguardando_humano")) return { status: 409, json: { ok: false, erro: "conversa_precisa_de_gente", mensagem: it.humano ? "A equipe está atendendo esta conversa: não dá para arquivar." : "Esta conversa está aguardando uma pessoa: não dá para arquivar." } };
        if (body.arquivar === false) { delete it.arquivada; return { json: { ok: true, fone: body.fone, arquivada: false, aplicado: true } }; }
        it.arquivada = { ts: body.ts || Date.now(), quem: "Robert" }; delete it.voltouEm; delete it.voltouMotivo; delete it.voltouDe; return { json: { ok: true, fone: body.fone, arquivada: true, aplicado: true, ts: it.arquivada.ts, quem: "Robert" } };
      }
      if (u === "/agentes/conversa/controle" && req.method() === "POST") { E.controles.push(body); const it = E.itens[body.fone]; if (it && body.acao === "retomar") it.pausado = false; if (it && body.acao === "pausar") it.pausado = true; if (it && body.acao === "assumir") it.humano = true; if (it && body.acao === "devolver") it.humano = false; comAtendimento(E); return { json: { ok: true } }; }
      return null;
    },
  });
}
// o servidor registra uma mensagem nova (de quem for): ts e ultimaAtividade avançam; no servidor novo a marca sai e voltouEm é gravado; no servidor antigo a marca FICA (ele não sabe desarquivar por mensagem da equipe) e não há voltouEm
function mensagem(E, fone, de, texto, quando) {
  const it = E.itens[fone]; it.ts = quando; it.ultimaDe = de; it.previa = texto;
  if (E.srv !== "antigo") { it.ultimaAtividade = quando; if (it.arquivada && quando > it.arquivada.ts) { delete it.arquivada; it.voltouEm = quando + 5; it.voltouMotivo = "nova_mensagem"; it.voltouDe = "arquivada"; it.voltouOrigem = "mensagem"; } }
}
async function abrir(b, E, vp, hash) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: vp.width < 700 }); await ctx.addInitScript(() => { window.__CENTRAL_TESTE = true; });
  const p = await B.novaPagina(ctx, novoMock(E)); await p.clock.install({ time: new Date() }); await B.entrar(p, hash || "#atendimento"); await p.waitForSelector("#atItens .ri", { timeout: 10000 }); await p.waitForTimeout(300);
  await p.clock.fastForward(20000); await p.waitForTimeout(400);   // 1ª atualização da lista (registra o que viu)
  return { ctx, p };
}
const poll = async (p, n = 1) => { for (let i = 0; i < n; i++) { await p.clock.fastForward(20000); await p.waitForTimeout(350); } };
const cards = (p) => p.$$eval("#atItens .ri", (x) => x.map((e) => e.dataset.fone));
const chip = async (p, f) => p.$eval(`#atFiltros button[data-f="${f}"] i`, (e) => e.textContent);
const linha = (p, f) => p.$eval(`#atItens .ri[data-fone="${f}"]`, (e) => e.innerText).catch(() => "");
async function menuArquivar(p, f, rot) { await p.hover(`#atItens .ri[data-fone="${f}"]`).catch(() => {}); await p.click(`#atItens .ri[data-fone="${f}"] .cmb`); await p.waitForSelector(".ax .mm", { timeout: 4000 }); const b = await p.$(`.ax .mm button:has-text("${rot}")`); return b; }
const voltarLista = async (p) => { await p.evaluate(() => { const a = document.querySelector(".ax"); if (a) a.classList.remove("chatAberto", "fichaOn"); try { history.replaceState(null, "", location.pathname + location.search + "#atendimento"); } catch (e) {} }); await p.waitForTimeout(150); };   // no celular a lista some com a conversa aberta: volta para a lista antes de mexer nela
async function arquivarPeloMenu(p, f) { const b = await menuArquivar(p, f, "Arquivar"); S.ok(!!b, "menu da lista oferece 'Arquivar' para " + f); if (b) await b.click(); await p.waitForTimeout(500); }
const cena_ = async (nome, fn) => { try { await fn(); } catch (e) { S.F("EXCEÇÃO no cenário " + nome + ": " + String(e.message).split("\n")[0].slice(0, 200)); } };
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  for (const [vp, nome] of [[{ width: 1440, height: 900 }, "desktop"], [{ width: 390, height: 780 }, "celular"]]) {
    await cena_(nome, async () => {
    const E = estadoInicial(); const { ctx, p } = await abrir(b, E, vp);
    const tag = (m) => nome + ": " + m;
    // ---- 0. servidor novo: `atendimento` manda em 'Precisam de você', no status e no selo REPASSADA ----
    S.ok((await chip(p, "precisa")) === "5", tag("com `atendimento`: Precisam de você = 5 (4 com_equipe + 1 esperando_pessoa; repassada_felipe NÃO conta): " + (await chip(p, "precisa"))));
    const lEsp = await linha(p, F.ESP); S.ok(/Precisa de você/.test(lEsp) && !/REPASSADA/.test(lEsp), tag("esperando_pessoa: 'Precisa de você' e SEM selo REPASSADA (repasse.repassada da Ana não vale sem prova) | " + lEsp.replace(/\n/g, " / ")));
    const lRep = await linha(p, F.REP); S.ok(/REPASSADA AO FELIPE por Robert, 16\/11 23:55/.test(lRep) && /Com o Felipe/.test(lRep) && !/Precisa de você/.test(lRep), tag("repassada_felipe: selo REPASSADA + status 'Com o Felipe', não é 'precisa' | " + lRep.replace(/\n/g, " / ")));
    S.ok(/nota de repasse manual/.test(await p.$eval(`#atItens .ri[data-fone="${F.REP}"] .tg.rep`, (e) => e.title)), tag("dica do selo traz a prova (nota manual)"));
    await p.click('#atFiltros button[data-f="precisa"]'); await p.waitForTimeout(250); const cp = await cards(p); S.ok(cp.includes(F.ESP) && cp.includes(F.EQ) && !cp.includes(F.REP) && !cp.includes(F.ABERTA), tag("filtro 'Precisam de você' com o campo: " + cp.join(","))); await p.click('#atFiltros button[data-f="todos"]'); await p.waitForTimeout(200);
    // arquivar quem está esperando uma pessoa (servidor novo aceita): sai de 'Precisam de você'
    await arquivarPeloMenu(p, F.ESP); S.ok(!(await cards(p)).includes(F.ESP) && (await chip(p, "precisa")) === "4", tag("esperando_pessoa arquivada: saiu da lista e de 'Precisam de você' (" + (await chip(p, "precisa")) + ")"));
    mensagem(E, F.ESP, "lead", "Lead: alguém?", Date.now() + 15000); await poll(p, 1); S.ok((await cards(p)).includes(F.ESP) && (await chip(p, "precisa")) === "5" && /Voltou: mensagem do lead/.test(await linha(p, F.ESP)), tag("o lead escreveu: voltou e conta de novo em 'Precisam de você' (" + (await chip(p, "precisa")) + ")"));
    // ---- 1. arquivar com a equipe atendendo ----
    S.ok((await cards(p)).includes(F.EQ), tag("conversa assumida está na lista principal"));
    await arquivarPeloMenu(p, F.EQ);
    const pEq = E.posts.filter((x) => x.fone === F.EQ); S.ok(pEq.length === 1 && pEq[0].arquivar === true, tag("a página PEDIU ao servidor para arquivar a conversa assumida (antes bloqueava sem pedir): " + JSON.stringify(pEq[0]))); const nPosts = E.posts.length;
    S.ok(!(await cards(p)).includes(F.EQ), tag("conversa com a equipe saiu da lista principal"));
    S.ok((await chip(p, "arq")) === "1", tag("Arquivadas = 1 (" + (await chip(p, "arq")) + ")"));
    const toast1 = await p.$eval("#toast", (e) => e.textContent); S.ok(/arquivada/.test(toast1) && !/não dá para arquivar/.test(toast1), tag("aviso 'arquivada' sem texto de bloqueio: " + toast1));
    await poll(p, 1); S.ok(!(await cards(p)).includes(F.EQ) && (await chip(p, "arq")) === "1", tag("depois da atualização continua arquivada"));
    // ---- 2. mensagem da EQUIPE => volta, com selo e no topo ----
    const tEq = Date.now() + 25000; mensagem(E, F.EQ, "humano", "Equipe: voltei a falar", tEq);
    await p.evaluate(() => { document.getElementById("atItens").scrollTop = 40; window.__st = document.getElementById("atItens").scrollTop; });
    await poll(p, 1);
    const cs2 = await cards(p); S.ok(cs2.includes(F.EQ), tag("mensagem da equipe: a conversa VOLTOU para a lista principal"));
    S.ok(cs2[0] === F.EQ, tag("voltou na posição certa (topo, é a mais recente): " + cs2.slice(0, 3).join(",")));
    const l2 = await linha(p, F.EQ); S.ok(/Voltou: mensagem da equipe/.test(l2), tag("selo 'Voltou: mensagem da equipe' | " + l2.replace(/\n/g, " / ")));
    S.ok((await chip(p, "arq")) === "0", tag("Arquivadas = 0 depois de voltar"));
    S.ok(E.posts.length === nPosts, tag("nenhum POST extra: a volta é só leitura"));
    // ---- 3. mensagem do LEAD => volta ----
    await arquivarPeloMenu(p, F.LEAD); S.ok(!(await cards(p)).includes(F.LEAD), tag("Lead Volta arquivada"));
    mensagem(E, F.LEAD, "lead", "Lead: e aí?", Date.now() + 50000); await poll(p, 1);
    const l3 = await linha(p, F.LEAD); S.ok((await cards(p)).includes(F.LEAD) && /Voltou: mensagem do lead/.test(l3), tag("mensagem do lead: voltou com selo 'Voltou: mensagem do lead' | " + l3.replace(/\n/g, " / ")));
    // ---- 4. nada acontece => continua arquivada (3 ciclos) ----
    await arquivarPeloMenu(p, F.NADA); const n0 = E.posts.length; await poll(p, 3);
    S.ok(!(await cards(p)).includes(F.NADA), tag("sem mensagem nova, 3 atualizações depois: continua arquivada"));
    S.ok(E.posts.length === n0, tag("sem mensagem nova: nenhum pedido novo ao servidor"));
    await p.click('#atFiltros button[data-f="arq"]'); await p.waitForTimeout(250); const arqs = await cards(p); S.ok(arqs.includes(F.NADA) && !arqs.includes(F.EQ) && !arqs.includes(F.LEAD), tag("filtro Arquivadas mostra só a que ficou quieta: " + arqs.join(",")));
    const lN = await linha(p, F.NADA); S.ok(!/Voltou/.test(lN), tag("arquivada quieta não tem selo 'Voltou'")); await p.click('#atFiltros button[data-f="todos"]'); await p.waitForTimeout(200);
    // ---- 5. Ana pausada: arquivar, retomar a Ana (sem mensagem) => continua; Ana responde => volta ----
    await arquivarPeloMenu(p, F.PAUSA); S.ok(!(await cards(p)).includes(F.PAUSA), tag("Ana pausada: arquivou"));
    await p.evaluate((f) => { location.hash = "#atendimento-" + f; }, F.PAUSA); await p.waitForSelector("#atChat .hd", { timeout: 8000 }); await p.waitForTimeout(400);
    if (vp.width >= 700) { const bt = await p.$('#atChat .hd .ac button:has-text("Retomar a Ana")'); const vis = bt ? await bt.evaluate((e) => { const r = e.getBoundingClientRect(); return !!(r.width && r.height); }) : false; S.ok(vis, tag("cabeçalho da pausada tem 'Retomar a Ana' visível")); if (bt && vis) { await bt.click({ timeout: 5000 }); await p.waitForTimeout(500); } }
    else { await p.click("#atChat .hd .mn > button", { timeout: 5000 }); await p.waitForSelector(".mm", { timeout: 4000 }); const it = await p.$('.mm button:has-text("Retomar a Ana")'); S.ok(!!it, tag("no celular, 'Retomar a Ana' está no menu Mais ações")); if (it) { await it.click(); await p.waitForTimeout(500); } }
    S.ok(E.controles.some((c) => c.fone === F.PAUSA && c.acao === "retomar"), tag("retomar foi pedido ao servidor"));
    await voltarLista(p); await poll(p, 1); S.ok(!(await cards(p)).includes(F.PAUSA), tag("só retomar a Ana (sem mensagem nova) NÃO traz de volta"));
    mensagem(E, F.PAUSA, "ana", "Ana: Oi! Retomando por aqui", Date.now() + 90000); await poll(p, 1);
    const l5 = await linha(p, F.PAUSA); S.ok((await cards(p)).includes(F.PAUSA) && /Voltou: mensagem da Ana/.test(l5), tag("a Ana respondeu: voltou com selo 'Voltou: mensagem da Ana' | " + l5.replace(/\n/g, " / ")));
    // a conversa aberta não é redesenhada pela volta das outras (arquiva primeiro, depois abre outra conversa, depois chega a mensagem)
    await arquivarPeloMenu(p, F.LEAD); S.ok(!(await cards(p)).includes(F.LEAD), tag("Lead Volta arquivada de novo"));
    await p.evaluate((f) => { location.hash = "#atendimento-" + f; }, F.ABERTA); await p.waitForSelector("#atChat .hd", { timeout: 8000 }); await p.waitForTimeout(400); await p.evaluate(() => { document.querySelector("#atChat .hd").__m = 1; });
    mensagem(E, F.LEAD, "lead", "Lead: de novo", Date.now() + 130000); await poll(p, 1);
    S.ok(await p.evaluate(() => !!(document.querySelector("#atChat .hd") && document.querySelector("#atChat .hd").__m)), tag("a conversa aberta NÃO foi redesenhada quando outra voltou"));
    S.ok((await cards(p)).includes(F.LEAD), tag("a outra voltou mesmo com uma conversa aberta")); await voltarLista(p);
    // ---- 6. selo some depois de abrir a conversa que voltou ----
    await p.click(`#atItens .ri[data-fone="${F.LEAD}"]`, { timeout: 8000 }); await p.waitForTimeout(500); await voltarLista(p); await p.evaluate(() => window.__centralTeste.desenharLista()); await p.waitForTimeout(100);
    S.ok(!/Voltou/.test(await linha(p, F.LEAD)), tag("depois de aberta, o selo 'Voltou' sai"));
    const sw = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, c: document.documentElement.clientWidth })); S.ok(sw.w <= sw.c + 1, tag("sem rolagem lateral"));
    S.ok(!(p._erros && p._erros.length), tag("console limpo " + JSON.stringify(p._erros))); await ctx.close();
    });
  }
  // ---- 7. servidor ATUAL (recusa 409 para assumida): a página mostra o motivo e a conversa fica onde estava ----
  await cena_("recusa", async () => { const E = estadoInicial(); E.srv = "recusa"; const { ctx, p } = await abrir(b, E, { width: 1440, height: 900 });
    S.ok((await chip(p, "precisa")) === "6", "sem `atendimento` (servidor atual): Precisam de você = 6 (4 humano + 2 aguardando_humano), regra antiga: " + (await chip(p, "precisa")));
    const lE0 = await linha(p, F.ESP); S.ok(/Precisa de você/.test(lE0) && /REPASSADA AO FELIPE por Ana/.test(lE0), "sem campo: aguardando_humano com repasse.repassada da Ana ainda mostra 'REPASSADA AO FELIPE por Ana' (contrato atual) | " + lE0.replace(/\n/g, " / "));
    const lR0 = await linha(p, F.REP); S.ok(/REPASSADA AO FELIPE por Robert/.test(lR0) && /Precisa de você/.test(lR0), "sem campo: repassada manual também conta como 'precisa' (regra antiga, sem prova do servidor)");
    await arquivarPeloMenu(p, F.EQ); await p.waitForTimeout(400);
    S.ok(E.posts.length === 1, "409: a página pediu ao servidor (1 POST)");
    const t = await p.$eval("#toast", (e) => e.textContent); S.ok(/A equipe está atendendo esta conversa/.test(t) && /continua onde estava/.test(t), "409: mostra o motivo do servidor e diz que a conversa continua onde estava: " + t);
    S.ok((await cards(p)).includes(F.EQ) && (await chip(p, "arq")) === "0", "409: a conversa continua na lista principal e Arquivadas = 0");
    await arquivarPeloMenu(p, F.PAUSA); S.ok(!(await cards(p)).includes(F.PAUSA) && E.posts.length === 2, "servidor atual: Ana pausada (sem equipe) arquiva normalmente");
    S.ok(!(p._erros && p._erros.length), "409: console limpo " + JSON.stringify(p._erros)); await ctx.close(); });
  // ---- 8. servidor ANTIGO (sem voltouEm/ultimaAtividade e sem desarquivar por mensagem da equipe): o fallback da página traz de volta pelo ts ----
  await cena_("antigo", async () => { const E = estadoInicial(); E.srv = "antigo"; Object.values(E.itens).forEach((it) => { delete it.ultimaAtividade; }); const { ctx, p } = await abrir(b, E, { width: 1440, height: 900 });
    await arquivarPeloMenu(p, F.VELHO); await poll(p, 1); S.ok(!(await cards(p)).includes(F.VELHO), "antigo: arquivada (marca do servidor, sem campos novos)");
    mensagem(E, F.VELHO, "humano", "Equipe pelo celular", Date.now() + 25000); await poll(p, 1);
    const lv = await linha(p, F.VELHO); S.ok((await cards(p)).includes(F.VELHO), "antigo: a marca continua no servidor, mas o ts avançou: a página traz de volta (fallback)"); S.ok(/Voltou: mensagem da equipe/.test(lv), "antigo: selo pelo autor da última fala | " + lv.replace(/\n/g, " / "));
    await arquivarPeloMenu(p, F.NADA); await poll(p, 2); S.ok(!(await cards(p)).includes(F.NADA), "antigo: sem mensagem nova continua arquivada");
    S.ok(!(p._erros && p._erros.length), "antigo: console limpo " + JSON.stringify(p._erros)); await ctx.close(); });
  S.fim(); await b.close();
})();
