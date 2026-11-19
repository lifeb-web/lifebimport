// Central 17/11 (pedidos do Robert): selo de JANELA (24 h do WhatsApp) em cada conversa, contagem sem redesenhar, filtro 'Janela fechando (<2 h)', 'Veio do formulário' + nome no cabeçalho, selo 'REPASSADA AO FELIPE por X, dd/mm hh:mm', arquivada/oculta que volta sozinha, ficha em blocos, Passar ao Felipe com resposta imediata, saúde sem 'Carregando…'; contraste AA, alvos de toque, CLS, XSS, rolagem lateral, console limpo; 5 telas em claro/escuro (prints em /tmp/central_prints).
// Rodar: node central/tests/janela_central.cjs <playwright-core> <chromium>   (servidor local na raiz do repositório de páginas, porta 8802 ou CENTRAL_URL)
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("janela_central");
const fs = require("fs"); const PR = process.env.PRINTS || "/tmp/central_prints"; fs.mkdirSync(PR, { recursive: true });
const NOW = Date.now(), H = 3600000, M = 60000, D = 24 * H;
const T_REP = Date.UTC(2026, 10, 17, 2, 55);   // 16/11 23:55 em Brasília
const F = { M: "5562900000019", A: "5562900000001", B: "5562900000002", C: "5544999777680", D: "5562900000004", E: "5562900000005", N: "559992320998", G: "5562900000007", X: "5562900000008" };
const HOSTIL = '<img src=x onerror="window.__xss=1">';
function conversas() {
  const c = [
    { fone: F.A, nome: "Maria Silva", estagio: "perguntou_cnpj", humano: false, pausado: false, ts: NOW - (20 * H + 48 * M), previa: "Pode ser amanhã?", ultimaDe: "lead" },
    { fone: F.B, nome: "João Pereira", estagio: "perguntou_cnpj", humano: false, pausado: false, ts: NOW - 3 * D, previa: "obrigado", ultimaDe: "lead" },
    { fone: F.C, nome: "Diego Alves", estagio: "aguardando_humano", humano: false, pausado: false, ts: NOW - 5 * H, previa: "quero falar com alguém", ultimaDe: "lead", repasse: { repassada: true, quem: "Robert", quando: T_REP, motivo: "handoff_manual" }, janela: { aberta: false, fechouEm: NOW - 2 * D, ultimaDoLead: NOW - 3 * D } },
    { fone: F.D, nome: "Fechando Já", estagio: "perguntou_cnpj", humano: false, pausado: false, ts: NOW - 23 * H, previa: "ok vou ver", ultimaDe: "lead" },
    { fone: F.E, nome: "Número Ruim", estagio: "novo", humano: false, pausado: false, ts: NOW - 4 * D, previa: "Oi", ultimaDe: "ana", numeroInvalido: true, numeroInvalidoCodigo: 131026, janela: { aberta: false, fechouEm: NOW - 4 * D } },
    { fone: F.N, nome: "", estagio: "novo", humano: false, pausado: false, ts: NOW - 2 * H, previa: "Oi, tudo bem?", ultimaDe: "ana", janela: { aberta: true, fechaEm: NOW + 10 * H + 5 * M, ultimaDoLead: NOW - 13 * H } },
    { fone: F.G, nome: "Arquivada Teste", estagio: "perguntou_cnpj", humano: false, pausado: false, ts: NOW - 4 * H, previa: "tchau", ultimaDe: "lead", arquivada: { ts: NOW - 3 * H } },
    { fone: F.M, nome: "Meta Limitou", estagio: "novo", humano: false, pausado: false, ts: NOW - 7 * H, previa: "Oi", ultimaDe: "ana", entrega: { estado: "limitada_meta", codigo: 130472, texto: "A Meta limitou esse número (experimento): reenviando por modelo de utilidade", fase: "reenviando", tentativas: 1, ts: NOW - 7 * H } },
    { fone: F.X, nome: HOSTIL, estagio: "novo", humano: false, pausado: false, ts: NOW - 6 * H, previa: HOSTIL, ultimaDe: "lead", repasse: { repassada: true, quem: HOSTIL, quando: T_REP, motivo: null } },
  ];
  for (let k = 0; k < 40; k++) c.push({ fone: "55629" + String(10000000 + k), nome: "Fila " + k, estagio: "perguntou_cnpj", humano: false, pausado: false, ts: NOW - (30 + k) * M, previa: "msg " + k, ultimaDe: "lead" });
  return c;
}
const base = (extra) => ({ ok: true, humano: false, pausado: false, estagio: "perguntou_cnpj", pendentes: 0, hist: [], nome: "", notas: [], log: [], dados: {}, ...extra });
function fichaDe(f) {
  if (f === F.A) return base({ nome: "Maria Silva", hist: [{ de: "lead", ts: NOW - (20 * H + 48 * M), texto: "Pode ser amanhã?" }, { de: "ana", ts: NOW - (20 * H + 40 * M), texto: "Claro!" }] });
  if (f === F.C) return base({ nome: "Diego Alves", estagio: "aguardando_humano", repasse: { repassada: true, quem: "Robert", quando: T_REP, motivo: "handoff_manual" }, janela: { aberta: false, fechouEm: NOW - 2 * D, ultimaDoLead: NOW - 3 * D }, notas: [{ texto: "Passada manualmente ao Felipe (negócio 4242)", ts: T_REP, quem: "Robert" }], instrucoes: [{ texto: "Não oferecer desconto", ts: NOW - H, quem: "Robert" }], hist: [{ de: "lead", ts: NOW - 3 * D, texto: "quero falar com alguém" }] });
  if (f === F.N) return base({ nome: "", hist: [{ de: "ana", ts: NOW - 2 * H, texto: "Oi, tudo bem?" }], janela: { aberta: true, fechaEm: NOW + 10 * H + 5 * M, ultimaDoLead: NOW - 13 * H }, formulario: { nome: "Natália", telefone: "559992320998", origem: "rede_farma", campanha: null, entrouEm: NOW - 13 * H, campos: { empresaCadastro: "Farma Bem", cnpj: "00.000.000/0001-00", segmentoProvavel: { valor: "farmacia", fonte: "cnpj" }, tentouEm: NOW - 13 * H, origemPagina: "rede_farma", primeiraMensagemDoLead: "Quero saber do projeto", modeloDeAbertura: { modelo: "abertura_v2", texto: "Oi, tudo bem?", ts: NOW - 2 * H }, jaCliente: false, emAtendimento: null } } });
  if (f === F.M) return base({ nome: "Meta Limitou", hist: [{ de: "ana", ts: NOW - 7 * H, tipo: "modelo", texto: "Oi", ent: "failed" }], entrega: { estado: "limitada_meta", codigo: 130472, texto: "A Meta limitou esse número (experimento): reenviando por modelo de utilidade", fase: "reenviando", tentativas: 1, ts: NOW - 7 * H } });
  if (f === F.X) return base({ nome: HOSTIL, hist: [{ de: "lead", ts: NOW - 6 * H, texto: HOSTIL }], repasse: { repassada: true, quem: HOSTIL, quando: T_REP, motivo: null }, formulario: { nome: HOSTIL, origem: HOSTIL, campanha: HOSTIL, campos: { cnpj: HOSTIL, primeiraMensagemDoLead: HOSTIL } } });
  return base({ nome: "Lead", hist: [{ de: "lead", ts: NOW - 3 * D, texto: "oi" }] });
}
async function contraste(p, sel) { return p.$$eval(sel, (els) => { const L = (c) => { const m = c.match(/[\d.]+/g).map(Number); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); }; return els.map((e) => { const cs = getComputedStyle(e); let bg = cs.backgroundColor, n = e; while ((/rgba\(\d+, \d+, \d+, 0\)|transparent/.test(bg)) && n.parentElement) { n = n.parentElement; bg = getComputedStyle(n).backgroundColor; } const a = L(cs.color), b = L(bg); return { t: e.textContent.slice(0, 30), r: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) }; }); }); }
const estado = { conv: null };
function novoMock(extra = {}) {
  estado.conv = conversas();
  return B.criarMock({ agentes: () => { const a = B.agentesPadrao(); a.agentes[0].conversas = estado.conv; a.agentes[0].auditoria = []; return a; }, conversa: (url) => fichaDe(url.searchParams.get("fone")), ...extra });
}
async function abrirPagina(b, vp, tema, mock, hash = "#atendimento", relogio) {
  const ctx = await b.newContext({ viewport: vp, colorScheme: tema, hasTouch: vp.width < 700 }); await ctx.addInitScript(() => { try { localStorage.setItem("central_at_filtros:robert@x.com", "1"); } catch (e) {} }); await ctx.addInitScript(() => { window.__CENTRAL_TESTE = true; window.__PS_INTERVALO_TESTE = 150; window.__cls = 0; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch (e) {} });    // #3143: no celular a barra de filtros nasce recolhida; estes testes usam os chips
  const p = await B.novaPagina(ctx, mock); if (relogio) await p.clock.install({ time: new Date() }); await B.entrar(p, hash); return { ctx, p };
}
async function cena(b, vp, tema, nome) {
  const mock = novoMock(); const { ctx, p } = await abrirPagina(b, vp, tema, mock, "#atendimento", true); const mob = vp.width < 700;
  await p.waitForSelector("#atItens .ri", { timeout: 8000 }); await p.waitForTimeout(400);
  const txt = (f) => p.$eval(`#atItens .ri[data-fone="${f}"]`, (e) => e.innerText).catch(() => "(sem linha)");
  const cls = (f, sel) => p.$eval(`#atItens .ri[data-fone="${f}"] ${sel}`, (e) => e.className).catch(() => "");
  const cls0 = await p.evaluate(() => window.__cls);
  await p.screenshot({ path: `${PR}/1_lista_${nome}.png` });
  // ---- 1. lista: selo de janela em cada conversa ----
  S.ok(/Janela aberta · 3h(0[5-9]|1[0-2])/.test(await txt(F.A)), nome + ": A: janela aberta 3h12 | " + (await txt(F.A)).replace(/\n/g, " / "));
  S.ok(/ok/.test(await cls(F.A, ".jan")) && !/\bpr\b/.test(await cls(F.A, ".jan")), nome + ": A: selo verde");
  S.ok(/Janela fechada · há 2 dias/.test(await txt(F.B)) && /\bpr\b/.test(await cls(F.B, ".jan")), nome + ": B: fechada há 2 dias, vermelho");
  S.ok(/Janela fechada · há 2 dias/.test(await txt(F.C)), nome + ": C (servidor): fechada há 2 dias");
  S.ok(/Janela aberta · (1h0\d|[1-5]?\d min)/.test(await txt(F.D)) && /fch/.test(await cls(F.D, ".jan")), nome + ": D: fechando (1h00), destaque");
  S.ok(/Janela fechada · há 4 dias/.test(await txt(F.E)) && /Número não existe/.test(await txt(F.E)), nome + ": E: fechada + número inválido preservado");
  S.ok(/Janela aberta · (10h0\d|9h5\d)/.test(await txt(F.N)), nome + ": N (servidor): aberta 10h05");
  S.ok(/Janela/.test(await txt("55629" + String(10000000 + 5))), nome + ": linha comum também tem janela");
  S.ok((await p.$$(`#atItens .ri[data-fone="${F.G}"]`)).length === 0, nome + ": arquivada fora da lista principal");
  // ---- 1c. entrega: selo limitadaMeta na lista e texto na ficha ----
  S.ok(/Meta limitou: reenviando por utilidade/.test(await txt(F.M)), nome + ": M: selo 'Meta limitou: reenviando por utilidade' na lista | " + (await txt(F.M)).replace(/\n/g, " / "));
  // ---- 2. repasse ----
  S.ok(/REPASSADA AO FELIPE/.test(await txt(F.C)) && !/por Robert/.test(await txt(F.C)), nome + ": C: na lista so o selo curto REPASSADA AO FELIPE (regra 19/11) | " + (await txt(F.C)).replace(/\n/g, " / "));
  S.ok(/por Robert, 16\/11 23:55/.test(await p.$eval('#atItens .ri[data-fone="' + F.C + '"] .tg.rep', (e) => e.title)), nome + ": C: quem/quando do repasse no title do selo");
  S.ok(/Precisa de você/.test(await txt(F.C)), nome + ": C: 'precisa de você' continua");
  // ---- 3. nome do formulário na lista ----
  S.ok(/Natália|\+55 \(99\) 9232-0998/.test(await txt(F.N)), nome + ": N: lista sem nome do servidor (formulário só vem na ficha): mostra o telefone");
  // ---- 4. contraste AA dos selos novos ----
  for (const sel of ["#atItens .tg.jan.ok", "#atItens .tg.jan.pr", "#atItens .tg.rep", "#atItens .ri time", "#atItens .pv"]) { const r = await contraste(p, sel); S.ok(r.length > 0 && r.every((q) => q.r >= 4.5), nome + ": contraste AA " + sel + " mín " + Math.min(...r.map((q) => q.r)).toFixed(2)); }
  // ---- 5. XSS: nada executa, sem elemento injetado ----
  S.ok(!(await p.evaluate(() => window.__xss)) && (await p.$$("#atItens img")).length === 0, nome + ": lista: nome/prévia/repasse hostis viram texto");
  // ---- 6. contagem sem redesenhar (relógio) ----
  await p.clock.fastForward(20000); await p.waitForTimeout(500);   // 1ª atualização da lista (a primeira sempre pode redesenhar)
  await p.evaluate(() => { document.querySelector('#atItens .ri[data-fone="5562900000001"]').__marca = 1; document.getElementById("atItens").scrollTop = 120; window.__st0 = document.getElementById("atItens").scrollTop; });
  const antes = await p.$eval(`#atItens .ri[data-fone="${F.A}"] .jan`, (e) => e.textContent);
  await p.clock.fastForward(3 * M); await p.waitForTimeout(250);
  const dep = await p.$eval(`#atItens .ri[data-fone="${F.A}"] .jan`, (e) => e.textContent).catch(() => "(linha refeita)");
  const mesma = await p.evaluate(() => { const e = document.querySelector('#atItens .ri[data-fone="5562900000001"]'); return !!(e && e.__marca === 1); });
  S.ok(antes !== dep && /aberta · 3h0[5-9]/.test(dep), nome + ": a contagem andou sem ação do usuário: '" + antes + "' -> '" + dep + "'"); S.ok(mesma, nome + ": a linha NÃO foi redesenhada pela contagem (mesmo nó do DOM)");
  S.ok((await p.evaluate(() => document.getElementById("atItens").scrollTop)) === (await p.evaluate(() => window.__st0)), nome + ": scrollTop da lista preservado");
  // ---- 7. filtro 'Janela fechando' ----
  const chip = await p.$('#atFiltros button[data-f="fechando"]'); S.ok(!!chip, nome + ": existe o filtro 'Janela fechando (<2 h)'");
  if (chip) { const ct = await chip.innerText(); S.ok(/Janela fechando/.test(ct), nome + ": rótulo '" + ct.replace(/\n/g, " ") + "'"); await chip.click(); await p.waitForTimeout(250); const ls = await p.$$eval("#atItens .ri", (x) => x.map((e) => e.dataset.fone)); S.ok(ls.length >= 1 && ls.indexOf(F.D) >= 0 && ls.indexOf(F.B) < 0 && ls.indexOf(F.N) < 0, nome + ": só conversas fechando em <2 h (D sim; B e N não) " + JSON.stringify(ls));
    await p.screenshot({ path: `${PR}/3_filtro_fechando_${nome}.png` }); await p.click('#atFiltros button[data-f="todos"]'); await p.waitForTimeout(200); }
  // ---- 8. ficha da Natália: nome no cabeçalho, 'Veio do formulário', blocos ----
  await p.click(`#atItens .ri[data-fone="${F.N}"]`); await p.waitForSelector("#atChat .hd", { timeout: 6000 }); await p.waitForTimeout(500);
  const hdn = await p.$eval("#atChat .hd .nm b", (e) => e.textContent); S.ok(/Natália/.test(hdn), nome + ": cabeçalho da conversa mostra 'Natália' (era só o telefone) | '" + hdn + "'");
  if (mob) { await p.click("#atChat .hd .ib.fx").catch(() => {}); await p.waitForTimeout(300); }
  const fich = await p.evaluate(() => { const f = document.getElementById("atFicha"); if (!f) return null; return { heads: [...f.querySelectorAll(".fgh")].map((e) => e.textContent), txt: f.innerText, cards: [...f.querySelectorAll(".fc")].map((e) => e.dataset.b + ":" + (e.dataset.card || e.querySelector("h4").textContent)) }; });
  S.ok(fich && fich.heads.join("|") === "Janela e entrada|Instrução da equipe|Dados qualificados|Histórico", nome + ": N: blocos da ficha em ordem " + JSON.stringify(fich && fich.heads));
  S.ok(fich && /VEIO DO FORMULÁRIO|Veio do formulário/i.test(fich.txt) && /rede_farma/.test(fich.txt) && /Farma Bem/.test(fich.txt) && /farmacia \(cnpj\)/.test(fich.txt) && /Quero saber do projeto/.test(fich.txt) && /9232-0998/.test(fich.txt), nome + ": N: bloco 'Veio do formulário' com nome, telefone, origem, campanha, quando e o preenchido");
  S.ok(fich && /Janela ABERTA, fecha em 1\dh|Janela ABERTA, fecha em 10h/.test(fich.txt), nome + ": N: janela na ficha");
  const ordem = fich ? fich.cards.map((c) => c.split(":")[0]) : []; const rank = { jan: 0, rep: 1, ins: 2, dados: 3, hist: 4 }; S.ok(ordem.every((v, i) => i === 0 || rank[ordem[i - 1]] <= rank[v]), nome + ": cartões na ordem dos blocos " + JSON.stringify(ordem));
  const faixaN = await p.$$eval("#atChat .selosHd .tg", (x) => x.map((e) => e.textContent)); S.ok(faixaN.some((t) => /^Janela aberta/.test(t)), nome + ": topo da conversa tem o selo da janela " + JSON.stringify(faixaN));
  await p.screenshot({ path: `${PR}/2_ficha_formulario_${nome}.png` });
  const sc = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, c: document.documentElement.clientWidth, fw: document.getElementById("atFicha") ? document.getElementById("atFicha").scrollWidth - document.getElementById("atFicha").clientWidth : 0 })); S.ok(sc.w <= sc.c + 1 && sc.fw <= 1, nome + ": sem rolagem lateral (página " + sc.w + "/" + sc.c + ", ficha +" + sc.fw + ")");
  await p.evaluate((f) => { location.hash = "#atendimento-" + f; }, F.M); await p.waitForSelector("#atChat .hd", { timeout: 8000 }); await p.waitForTimeout(500); if (mob) await p.click("#atChat .hd .ib.fx").catch(() => {}); await p.waitForTimeout(300);
  { const fm = await p.$eval("#atFicha", (e) => e.innerText); S.ok(/Entrega da mensagem/i.test(fm) && /A Meta limitou esse número \(experimento\)/.test(fm) && /130472/.test(fm), nome + ": M: ficha mostra o texto da entrega e o código"); const topo = await p.$$eval("#atChat .selosHd .tg", (x) => x.map((e) => e.textContent)); S.ok(topo.some((t) => /Meta limitou/.test(t)), nome + ": M: topo da conversa tem o selo " + JSON.stringify(topo)); }
  // ---- 9. ficha do Diego: repasse + janela fechada + instrução da equipe ----
  await p.evaluate((f) => { location.hash = "#atendimento-" + f; }, F.C); await p.waitForTimeout(700); if (mob) await p.click("#atChat .hd .ib.fx").catch(() => {});
  await p.waitForTimeout(300);
  const fc2 = await p.evaluate(() => { const f = document.getElementById("atFicha"); return { heads: [...f.querySelectorAll(".fgh")].map((e) => e.textContent), txt: f.innerText }; });
  S.ok(/REPASSADA AO FELIPE por Robert, 16\/11 23:55/.test(fc2.txt), nome + ": Diego: selo do repasse na ficha"); S.ok(/Janela FECHADA há 2 dias/.test(fc2.txt) && /modelo aprovado/.test(fc2.txt), nome + ": Diego: janela fechada + 'só modelo aprovado'");
  S.ok(fc2.heads.join("|") === "Janela e entrada|Repasse ao Felipe|Instrução da equipe|Dados qualificados|Histórico", nome + ": Diego: os 5 blocos na ordem pedida " + JSON.stringify(fc2.heads));
  S.ok(/Não oferecer desconto/.test(fc2.txt), nome + ": Diego: instrução da equipe no bloco certo");
  const hd2 = await p.$$eval("#atChat .selosHd .tg", (x) => x.map((e) => e.textContent)); S.ok(hd2.some((t) => /REPASSADA AO FELIPE/.test(t)) && hd2.some((t) => /Janela fechada/.test(t)), nome + ": Diego: topo com repasse e janela " + JSON.stringify(hd2));
  await p.screenshot({ path: `${PR}/2_ficha_repasse_${nome}.png` });
  // lead aberto não é redesenhado pela atualização da lista; ficha preserva rolagem
  await p.evaluate(() => { const f = document.getElementById("atFicha"); f.querySelector(".fgh").__m = 1; document.querySelector("#atChat .hd").__m = 1; f.scrollTop = 40; });
  await p.clock.fastForward(30000); await p.waitForTimeout(500);
  S.ok(await p.evaluate(() => !!(document.getElementById("atFicha").querySelector(".fgh").__m && document.querySelector("#atChat .hd").__m)), nome + ": lista atualizou e a conversa/ficha abertas NÃO foram redesenhadas");
  // ---- 10. XSS na ficha ----
  await p.evaluate((f) => { location.hash = "#atendimento-" + f; }, F.X); await p.waitForTimeout(800); if (mob) await p.click("#atChat .hd .ib.fx").catch(() => {}); await p.waitForTimeout(300);
  S.ok(!(await p.evaluate(() => window.__xss)) && (await p.$$("#atChat img, #atFicha img")).length === 0, nome + ": ficha hostil (nome/formulário/repasse/campos) vira texto, nada executa");
  S.ok(/<img src=x/.test(await p.$eval("#atFicha", (e) => e.innerText)), nome + ": o texto hostil aparece LITERAL na ficha");
  // ---- 11. alvos de toque >= 44 px (lista e topo) ----
  const lim = mob ? 43.5 : 32; const peq = await p.evaluate((lim) => { const out = []; document.querySelectorAll("#atFiltros button, #atItens .ri, #atItens .cmb, #atChat .hd .ib, #atFicha button").forEach((e) => { const r = e.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && (r.height < lim || r.width < lim)) out.push((e.className || e.tagName) + " " + Math.round(r.width) + "x" + Math.round(r.height)); }); return out; }, lim);
  S.ok(peq.length === 0, nome + ": alvos de toque (celular >= 44 px, computador >= 32 px) | pequenos: " + JSON.stringify(peq.slice(0, 6)));
  const cls1 = (await p.evaluate(() => window.__cls)) - cls0; S.ok(cls1 < 0.1, nome + ": CLS durante contagem, filtro, abrir ficha e trocar de conversa = " + cls1.toFixed(4) + " (< 0,1)"); console.log("CLS " + nome + " = " + cls1.toFixed(4));
  S.ok(!(p._erros && p._erros.length), nome + ": console limpo " + JSON.stringify(p._erros));
  await ctx.close();
}
// janela que vira FECHADA sozinha (relógio avança 21 h: a sessão pode expirar, por isso cena própria e sem checar console)
async function fecharSozinha(b) {
  const mock = novoMock({ expiraEm: Date.now() + 30 * D }); const { ctx, p } = await abrirPagina(b, { width: 1440, height: 900 }, "light", mock, "#atendimento", true); await p.waitForSelector("#atItens .ri", { timeout: 8000 }); await p.waitForTimeout(300);
  await p.clock.fastForward(20000); await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelector('#atItens .ri[data-fone="5562900000001"]').__marca = 1; });
  await p.clock.fastForward(21 * H + 10 * M); await p.waitForTimeout(300);
  const fe = await p.$eval(`#atItens .ri[data-fone="${F.A}"] .jan`, (e) => ({ t: e.textContent, c: e.className })).catch(() => null);
  S.ok(fe && /Janela fechada · há/.test(fe.t) && /\bpr\b/.test(fe.c) && !/\bok\b/.test(fe.c), "passou de 24 h: virou FECHADA/vermelho sozinha " + JSON.stringify(fe));
  S.ok(await p.evaluate(() => { const e = document.querySelector('#atItens .ri[data-fone="5562900000001"]'); return !!(e && e.__marca === 1); }), "e continuou sem redesenhar a lista");
  await ctx.close();
}
// volta sozinha da arquivada
async function voltar(b, variante) {
  const mock = novoMock(); const { ctx, p } = await abrirPagina(b, { width: 1440, height: 900 }, "light", mock, "#atendimento", true); await p.waitForSelector("#atItens .ri", { timeout: 8000 }); await p.waitForTimeout(300);
  const n = variante; await p.clock.fastForward(20000); await p.waitForTimeout(600);   // 1ª atualização: a página registra o que viu arquivado
  S.ok((await p.$$(`#atItens .ri[data-fone="${F.G}"]`)).length === 0, "volta/" + n + ": arquivada não aparece na lista principal");
  const cnt0 = await p.$eval('#atFiltros button[data-f="arq"] i', (e) => e.textContent); S.ok(cnt0 === "1", "volta/" + n + ": Arquivadas = 1 (" + cnt0 + ")");
  const g = estado.conv.find((c) => c.fone === F.G);
  if (n === "servidor") { g.ts = NOW - M; g.ultimaDe = "humano"; g.ultimaAtividade = NOW - M; delete g.arquivada; g.voltouEm = NOW - M; g.voltouMotivo = "nova_mensagem"; g.voltouDe = "arquivada"; g.voltouOrigem = "mensagem"; }   // só a EQUIPE escreveu; o servidor manda ultimaAtividade e ocultaDesde
  else { g.ts = NOW - M; g.ultimaDe = "ana"; g.previa = "Oi, voltei"; }   // servidor ainda com a marca e sem os campos novos: a página percebe pelo ts
  await p.clock.fastForward(30000); await p.waitForTimeout(700);
  const lin = await p.$(`#atItens .ri[data-fone="${F.G}"]`); S.ok(!!lin, "volta/" + n + ": a conversa VOLTOU sozinha para a lista principal");
  if (lin) { const t = await lin.innerText(); S.ok(/Voltou: mensagem d[ao] (lead|equipe|Ana)/.test(t), "volta/" + n + ": marcada 'Voltou: mensagem da equipe/do lead/da Ana' | " + t.replace(/\n/g, " / ")); await lin.click(); await p.waitForTimeout(600); await p.evaluate(() => document.querySelector(".ax").classList.remove("chatAberto")); await p.evaluate(() => window.__centralTeste.desenharLista()); const t2 = await p.$eval(`#atItens .ri[data-fone="${F.G}"]`, (e) => e.innerText).catch(() => ""); S.ok(!/Voltou:/.test(t2), "volta/" + n + ": depois de aberta, a marca sai"); }
  const cnt1 = await p.$eval('#atFiltros button[data-f="arq"] i', (e) => e.textContent); S.ok(cnt1 === "0", "volta/" + n + ": Arquivadas = 0 (" + cnt1 + ")");
  S.ok(!(p._erros && p._erros.length), "volta/" + n + ": console limpo " + JSON.stringify(p._erros)); await ctx.close();
}
// Passar ao Felipe: resposta imediata e estado vivo
async function passar(b, cenario) {
  let polls = 0; const mock = novoMock({ over: async (u, url, req) => { if (u !== "/agentes/conversa/passar-felipe") return null;
    if (req.method() === "POST") { if (cenario === "409") return { status: 409, json: { ok: false, mensagem: "Negócio já fechado como ganho: não dá para passar." } }; return { status: 202, delay: 250, json: { ok: true, aceito: true, pedido: "p-1", estado: "passando" } }; }
    polls++; if (cenario === "ok") return polls < 3 ? { json: { ok: true, estado: "passando" } } : { json: { ok: true, estado: "ok", sdrDealId: 4242, confirmado: { etapa: "Repasse da Ana", dono: "Felipe" } } };
    if (cenario === "falha") return polls < 2 ? { json: { ok: true, estado: "passando" } } : { json: { ok: true, estado: "falhou", mensagem: "O Agendor não respondeu a tempo.", retentavel: true } };
    if (cenario === "falha_final") return { json: { ok: true, estado: "falhou", mensagem: "Negócio fechado em outro funil.", retentavel: false } }; return null; } });
  const { ctx, p } = await abrirPagina(b, { width: 1440, height: 900 }, "light", mock, "#atendimento-" + F.A); await p.waitForSelector("#atChat .hd", { timeout: 8000 }); await p.waitForTimeout(500);
  await p.evaluate(() => window.__centralTeste.passar()); await p.waitForSelector("#psObs", { timeout: 4000 }); const t0 = Date.now();
  await p.click('#modal button:has-text("Passar ao Felipe")');
  if (cenario === "409") { await p.waitForTimeout(600); const er = await p.$eval("#modal", (e) => e.innerText); S.ok(/Negócio já fechado/.test(er) && !/Toque em Passar ao Felipe para tentar/.test(er), "passar/409: mostra o motivo do servidor e NÃO manda repetir"); S.ok((await p.$$("#psBarra .psLinha")).length === 0, "passar/409: sem faixa de estado"); await ctx.close(); return; }
  await p.waitForSelector("#psBarra .psLinha", { timeout: 3000 }); const dt = Date.now() - t0; const tx = await p.$eval("#psBarra", (e) => e.innerText);
  S.ok(dt < 1500 && (cenario === "falha_final" ? /Falhou|Recebido/ : /Recebido: confirmando no Agendor/).test(tx), "passar/" + cenario + ": resposta imediata (" + dt + " ms): '" + tx.replace(/\n/g, " ") + "'"); S.ok((await p.$$("#modal:not(.hide) #psObs")).length === 0 || !(await p.isVisible("#psObs")), "passar/" + cenario + ": modal fechou (a tela não fica presa)");
  await p.screenshot({ path: `${PR}/4_passar_recebido.png` });
  if (cenario === "ok") { await p.waitForFunction(() => /Conferido no Agendor/.test(document.getElementById("psBarra").innerText), null, { timeout: 6000 }); const t = await p.$eval("#psBarra", (e) => e.innerText); S.ok(/Repasse da Ana/.test(t) && /4242/.test(t), "passar/ok: 'Conferido no Agendor' só quando o servidor confirmou (etapa e negócio)"); S.ok(polls >= 3, "passar/ok: consultou o pedido várias vezes (" + polls + ")"); await p.screenshot({ path: `${PR}/4_passar_conferido.png` }); }
  if (cenario === "falha") { await p.waitForFunction(() => /Falhou/.test(document.getElementById("psBarra").innerText), null, { timeout: 6000 }); const t = await p.$eval("#psBarra", (e) => e.innerText); S.ok(/O Agendor não respondeu/.test(t) && (await p.$$("#psBarra .psTentar")).length === 1, "passar/falha: motivo + botão 'Tentar de novo' (retentável)"); await p.screenshot({ path: `${PR}/4_passar_falhou.png` }); }
  if (cenario === "falha_final") { await p.waitForFunction(() => /Falhou/.test(document.getElementById("psBarra").innerText), null, { timeout: 6000 }); const t = await p.$eval("#psBarra", (e) => e.innerText); S.ok(/outro funil/.test(t) && (await p.$$("#psBarra .psTentar")).length === 0, "passar/falha_final: motivo e SEM 'Tentar de novo' (não adianta repetir)"); }
  S.ok(!(p._erros && p._erros.length), "passar/" + cenario + ": console limpo " + JSON.stringify(p._erros)); await ctx.close();
}
async function saude(b, tema, vp, nome) {
  const ITENS = { rotinas: { nivel: "ok" }, envios: { nivel: "ok" }, agendor: { nivel: "ok" }, fila: { nivel: "ok" } };
  const mock = novoMock({ over: async (u) => (u === "/bia-saude" ? { json: { geral: "ok", ts: Date.now(), itens: ITENS } } : null) }); const { ctx, p } = await abrirPagina(b, vp, tema, mock, "#visao"); await p.waitForTimeout(1500);
  const t = await p.evaluate(() => document.getElementById("conteudo").innerText);
  S.ok(!/Rotinas agendadas pede/i.test(t) && !/Estado: Normal/.test(t) && !/Carregando os detalhes/.test(t) && !/pede atenção/.test(t), "saúde/" + nome + ": tudo ok => sem 'Rotinas agendadas pede atenção', 'Estado: Normal' nem 'Carregando os detalhes…'");
  await p.screenshot({ path: `${PR}/5_saude_${nome}.png` }); S.ok(!(p._erros && p._erros.length), "saúde/" + nome + ": console limpo " + JSON.stringify(p._erros)); await ctx.close();
}
const cena_ = async (nome, fn) => { try { await fn(); } catch (e) { S.F("EXCEÇÃO no cenário " + nome + ": " + String(e.message).split("\n")[0].slice(0, 200)); } };   // um cenário que cai não derruba os demais
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  for (const [vp, tema, nome] of [[{ width: 1440, height: 900 }, "light", "desk_claro"], [{ width: 1440, height: 900 }, "dark", "desk_escuro"], [{ width: 390, height: 780 }, "light", "cel_claro"], [{ width: 390, height: 780 }, "dark", "cel_escuro"]]) { await cena_("cena/" + nome, () => cena(b, vp, tema, nome)); await cena_("saude/" + nome, () => saude(b, tema, vp, nome)); }
  await cena_("fecharSozinha", () => fecharSozinha(b)); await cena_("voltar/cliente", () => voltar(b, "cliente")); await cena_("voltar/servidor", () => voltar(b, "servidor"));
  for (const c of ["ok", "falha", "falha_final", "409"]) await cena_("passar/" + c, () => passar(b, c));
  S.fim(); await b.close();
})();
