// Central 19/11 (dono #3481/#3494 'nao fez nada na Central de ATENDIMENTO'): prova por ponto, no Chromium real, de: (1) barra de filtros recolhivel (estado inicial, contagem), (2) 'Janela aberta/fechada' filtram certo, (3) etiquetas PEQUENAS de 1 linha na lista e na faixa (390/768/1024/1440, claro/escuro), (4) faixa de selos nao cobre a bolha, (5) arquivar equipe/aguardando, (6) selo da Meta limitada + degradacao sem x.atendimento, (7) sem 'servidor ainda nao mandou'.
// Rodar: node central/tests/atend_19nov.cjs <playwright-core> <chromium>   (CENTRAL_URL proprio; PRINTS=pasta dos prints)
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("atend_19nov");
const fs = require("fs"); const PR = process.env.PRINTS || "/tmp/central_atend_prints/atend_19nov"; fs.mkdirSync(PR, { recursive: true });
const NOW = Date.now(), H = 3600000, D = 24 * H;
const F = { ABR: "5562900000101", FEC: "5562900000102", FCH: "5562900000103", EQP: "5562900000104", AGU: "5562900000105", MET: "5562900000106", REP: "5562900000107", CALC: "5562900000108" };
const j = (ult) => ({ aberta: NOW < ult + D, fechaEm: ult + D, fechouEm: NOW < ult + D ? null : ult + D, ultimaDoLead: ult });
const conv = [
  { fone: F.ABR, nome: "Aberta Silva", estagio: "perguntou_cnpj", ts: NOW - 5 * H, previa: "Pode ser amanha?", ultimaDe: "lead", janela: j(NOW - 5 * H) },
  { fone: F.FEC, nome: "Fechada Souza", estagio: "perguntou_cnpj", ts: NOW - 3 * D, previa: "Obrigado", ultimaDe: "lead", janela: j(NOW - 3 * D) },
  { fone: F.FCH, nome: "Fechando Lima", estagio: "perguntou_cnpj", ts: NOW - 23 * H, previa: "ok", ultimaDe: "lead", janela: j(NOW - 23 * H) },
  { fone: F.EQP, nome: "Equipe Atendendo", estagio: "perguntou_cnpj", humano: true, ts: NOW - 2 * H, previa: "Vou te ajudar", ultimaDe: "humano", janela: j(NOW - 2 * H) },
  { fone: F.AGU, nome: "Aguardando Pessoa", estagio: "aguardando_humano", ts: NOW - 4 * H, previa: "quero falar com alguem", ultimaDe: "lead", janela: j(NOW - 4 * H) },
  { fone: F.MET, nome: "Meta Limitou", estagio: "novo", ts: NOW - 7 * H, previa: "Oi", ultimaDe: "ana", entrega: { estado: "limitada_meta", codigo: 130472, texto: "A Meta limitou esse numero (experimento): reenviando por modelo de utilidade", fase: "reenviando", tentativas: 1, ts: NOW - 7 * H }, janela: { aberta: false, fechaEm: null, fechouEm: null, ultimaDoLead: null } },
  { fone: F.REP, nome: "Repassada Diego", estagio: "aguardando_humano", ts: NOW - 6 * H, previa: "quero falar", ultimaDe: "lead", atendimento: "repassada_felipe", atendimentoProva: "nota_manual", repasse: { repassada: true, quem: "Robert", quando: NOW - 5 * H, motivo: "handoff_manual" }, janela: j(NOW - 6 * H) },
];
conv.push({ fone: F.CALC, nome: "Sem Dado Pronto", estagio: "perguntou_cnpj", ts: NOW - 6 * H, previa: "oi", ultimaDe: "lead" });   // sem item.janela: a pagina calcula (era onde aparecia 'o servidor ainda nao mandou')
for (let k = 0; k < 8; k++) conv.push({ fone: "55629" + String(20000000 + k), nome: "Fila " + k, estagio: "perguntou_cnpj", ts: NOW - (30 + k) * 60000, previa: "msg " + k, ultimaDe: "lead", janela: j(NOW - (4 + k) * H) });
const hist = (it) => { const o = []; for (let i = 0; i < 14; i++) o.push({ de: i % 2 ? "ana" : "lead", ts: NOW - (30 - i) * 60000 * 20, tipo: "texto", texto: (i % 2 ? "Resposta da Ana numero " : "Mensagem do lead numero ") + i + " com um texto razoavelmente longo para ocupar a largura da bolha e quebrar em mais de uma linha no celular." }); return o; };
const fichaDe = (f) => { const it = conv.find((c) => c.fone === f) || {}; return { ok: true, humano: !!it.humano, pausado: false, estagio: it.estagio || "novo", pendentes: 0, hist: hist(it), nome: it.nome || "", notas: [], log: [], dados: {}, janela: it.janela, atendimento: it.atendimento, atendimentoProva: it.atendimentoProva, repasse: it.repasse, entrega: it.entrega }; };
const mkSrv = () => { const arqPost = []; const srv = { arqPost, arq: {} };
  srv.mock = B.criarMock({ expiraEm: NOW + 30 * D, agentes: () => { const a = B.agentesPadrao(); a.agentes[0].conversas = conv.map((x) => ({ humano: false, pausado: false, ...x, arquivada: srv.arq[x.fone] ? { ts: srv.arq[x.fone] } : undefined })); a.agentes[0].auditoria = []; return a; }, conversa: (url) => fichaDe(url.searchParams.get("fone")),
    over: async (u, url, req, body) => { if (u === "/agentes/selos") { await new Promise((r) => setTimeout(r, 1800)); return { status: 200, json: { ok: true, pendentes: 0, itens: { [F.REP]: { selos: [{ k: "qualificadoGeral", rot: "Qualificado pela Ana", tom: "ok", dica: "x" }, { k: "outro", rot: "Origem: formulario do site", tom: "" }], k: { qualificadoGeral: true } } } } }; }
      if (u === "/agentes/conversa/arquivar" && req.method() === "POST") { arqPost.push(body); if (body.arquivar) srv.arq[body.fone] = Date.now(); else delete srv.arq[body.fone]; return { status: 200, json: { ok: true } }; } return null; } });
  return srv; };
const cards = (p) => p.$$eval("#atItens .ri", (x) => x.map((e) => e.dataset.fone));
const VPS = [[390, 780, true], [768, 900, false], [1024, 800, false], [1440, 900, false]].filter((v) => !process.env.ATEND_RAPIDO || v[0] === 390 || v[0] === 1440);
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  for (const [w, h, mob] of VPS) for (const tema of process.env.ATEND_RAPIDO ? [w === 390 ? "dark" : "light"] : ["light", "dark"]) {
    const t = w + "/" + tema + ": ";
    try {
      const srv = mkSrv(); const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema, hasTouch: mob }); await ctx.addInitScript((tm) => { window.__CENTRAL_TESTE = true; try { localStorage.setItem("central_tema", tm); } catch (e) {} }, tema);
      const p = await B.novaPagina(ctx, srv.mock); await B.entrar(p, "#atendimento"); await p.waitForSelector("#atItens .ri", { timeout: 10000 });
      // (1) estado inicial da barra + contagem
      const exp = async () => (await p.getAttribute("#atFiltrosBt", "aria-expanded")) === "true";
      S.ok((await exp()) === (w > 860), t + "(1) barra de filtros: estado inicial " + (w > 860 ? "aberta (computador)" : "recolhida (celular/tablet estreito)"));
      await p.screenshot({ path: PR + "/lista_inicial_" + w + "_" + tema + ".png" });
      if (!(await exp())) { const alt = await p.$eval("#atFiltrosBox", (e) => e.getBoundingClientRect().height); S.ok(alt < 90, t + "(1) recolhida ocupa pouca altura " + Math.round(alt)); await p.click("#atFiltrosBt"); await p.waitForTimeout(200); }
      const cnt = await p.$$eval("#atFiltros button", (x) => Object.fromEntries(x.map((e) => [e.dataset.f, e.querySelector("i").textContent])));
      S.ok(cnt.todos === String(conv.length) && cnt.precisa === "2" && cnt.fechada === "2" && cnt.aberta === "14" && cnt.fechando === "1", t + "(1) contagem nos chips " + JSON.stringify(cnt));
      await p.screenshot({ path: PR + "/lista_filtros_abertos_" + w + "_" + tema + ".png" });
      // (2) Janela aberta / fechada
      await p.click('#atFiltros button[data-f="aberta"]'); await p.waitForTimeout(200); let c = await cards(p); S.ok(c.length === 14 && c.includes(F.ABR) && c.includes(F.FCH) && c.includes(F.REP) && !c.includes(F.FEC) && !c.includes(F.MET), t + "(2) Janela aberta so as abertas (" + c.length + ")");
      await p.click('#atFiltros button[data-f="fechada"]'); await p.waitForTimeout(200); c = await cards(p); S.ok(c.length === 2 && c.includes(F.FEC) && c.includes(F.MET) && !c.includes(F.ABR) && !c.includes(F.REP), t + "(2) Janela fechada so as fechadas (inclui lead que nunca escreveu) " + c.join());
      await p.click('#atFiltros button[data-f="todos"]'); await p.waitForTimeout(200);
      // (3) etiquetas pequenas, 1 linha
      const med = await p.evaluate(() => { const o = []; document.querySelectorAll("#atItens .ri .tg.jan, #atItens .ri .tg.rep").forEach((e) => { const r = e.getBoundingClientRect(); if (!r.width) return; const cs = getComputedStyle(e); const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5; o.push({ t: e.textContent.slice(0, 30), h: Math.round(r.height), fs: parseFloat(cs.fontSize), linhas: Math.round(r.height / lh), cortado: e.scrollWidth > e.clientWidth + 1 }); }); return o; });
      S.ok(med.length > 10, t + "(3) achou etiquetas na lista " + med.length);
      const ruins = med.filter((x) => x.h > 24 || x.fs > 12 || x.linhas > 1 || x.cortado); S.ok(ruins.length === 0, t + "(3) etiquetas da lista: <=24px, fonte <=12, 1 linha, sem corte " + JSON.stringify(ruins.slice(0, 3)));
      const jan = await p.$$eval("#atItens .ri .tg.jan", (x) => x.length); S.ok(jan >= 14, t + "(3) selo da janela em cada conversa (" + jan + ")");
      // (4) abre conversa: faixa nao cobre a bolha
      await p.click('#atItens .ri[data-fone="' + F.REP + '"]'); await p.waitForSelector("#atChat .gp, #atChat .bl, #atChat .ms > *", { timeout: 8000 }); await p.waitForTimeout(600);
      const faixa = await p.$$eval("#atChat .selosHd .tg", (x) => x.map((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { t: e.textContent.slice(0, 40), h: Math.round(r.height), fs: parseFloat(cs.fontSize), cortado: e.scrollWidth > e.clientWidth + 1 }; }));
      S.ok(faixa.length >= 2, t + "(3) faixa do chat tem etiquetas " + JSON.stringify(faixa.map((x) => x.t)));
      S.ok(faixa.every((x) => x.h <= 24 && x.fs <= 12 && !x.cortado), t + "(3) etiquetas da faixa pequenas e inteiras " + JSON.stringify(faixa));
      await p.waitForTimeout(3500); const tarde = await p.evaluate(() => { const ms = document.querySelector("#atChat .ms"), fx = document.querySelector("#atChat .selosHd"); return { tags: [...fx.querySelectorAll(".tg")].map((e) => e.textContent), fim: Math.round(ms.scrollHeight - ms.scrollTop - ms.clientHeight), fxB: Math.round(fx.getBoundingClientRect().bottom), msT: Math.round(ms.getBoundingClientRect().top) }; });
      S.ok(tarde.tags.some((x) => /Qualificado pela Ana/.test(x)), t + "(4) selos do CRM que chegam depois entram na faixa " + JSON.stringify(tarde.tags)); S.ok(tarde.fim <= 4, t + "(4) com a faixa chegando depois, a conversa continua no fim (ultima mensagem visivel) fim=" + tarde.fim); S.ok(tarde.fxB <= tarde.msT + 1, t + "(4) faixa maior depois ainda nao entra na area das mensagens " + JSON.stringify(tarde));
      const geo = await p.evaluate(() => { const ms = document.querySelector("#atChat .ms"), fx = document.querySelector("#atChat .selosHd"); if (!ms || !fx) return { erro: "sem .ms ou .selosHd" }; ms.scrollTop = 0; const fr = fx.getBoundingClientRect(), mr = ms.getBoundingClientRect(), hr = document.querySelector("#atChat .hd").getBoundingClientRect(); const bs = [...ms.children].filter((e) => { const r = e.getBoundingClientRect(); return r.height > 20 && r.bottom > mr.top; }); const sobre = []; bs.slice(0, 4).forEach((e) => { const r = e.getBoundingClientRect(); const cx = r.left + Math.min(r.width / 2, 40), cy = Math.max(r.top, mr.top) + 4; if (cy >= mr.bottom) return; const top = document.elementFromPoint(cx, cy); if (top && !e.contains(top) && !ms.contains(top)) sobre.push(top.className + ":" + (top.textContent || "").slice(0, 20)); }); return { fxTop: Math.round(fr.top), hdBottom: Math.round(hr.bottom), fxBottom: Math.round(fr.bottom), msTop: Math.round(mr.top), sobre, n: bs.length }; });
      S.ok(!geo.erro && geo.fxBottom <= geo.msTop + 1 && geo.fxTop >= geo.hdBottom - 1 && geo.sobre.length === 0, t + "(4) faixa nao cobre a primeira bolha " + JSON.stringify(geo));
      await p.screenshot({ path: PR + "/chat_" + w + "_" + tema + ".png" });
      // (7) texto defasado nunca aparece (lista + chat + ficha)
      await p.evaluate((x) => document.querySelector('#atItens .ri[data-fone="' + x + '"]').click(), F.CALC); await p.waitForTimeout(700);
      if (w <= 1024) await p.evaluate(() => { const b = [...document.querySelectorAll("#atChat button")].find((x) => /ficha|dados|detalhes/i.test((x.getAttribute("aria-label") || "") + x.textContent)); if (b) b.click(); }); await p.waitForTimeout(500);
      S.ok(/Janela do WhatsApp/i.test(await p.evaluate(() => document.querySelector("#atFicha").innerText)), t + "(7) a ficha da conversa sem dado pronto abriu (cartao da janela calculada)");
      const corpo = await p.evaluate(() => document.body.innerText); S.ok(!/servidor ainda n[aã]o mandou/i.test(corpo), t + "(7) sem 'servidor ainda nao mandou'");
      await p.evaluate(() => document.querySelector("#atChat")); S.ok(!(p._erros && p._erros.length), t + "console limpo " + JSON.stringify(p._erros));
      await ctx.close();
    } catch (e) { S.F("EXCECAO " + t + String(e.message).split("\n")[0].slice(0, 220)); }
  }
  // (5) arquivar qualquer conversa + (6) selo Meta e degradacao (computador, claro)
  try {
    const srv = mkSrv(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.addInitScript(() => { window.__CENTRAL_TESTE = true; });
    const p = await B.novaPagina(ctx, srv.mock); await B.entrar(p, "#atendimento"); await p.waitForSelector("#atItens .ri", { timeout: 10000 });
    await p.waitForTimeout(3500); for (const [f, rot] of [[F.EQP, "equipe atendendo"], [F.AGU, "aguardando pessoa"]]) {
      await p.evaluate((x) => document.querySelector('#atItens .ri[data-fone="' + x + '"]').scrollIntoView({ block: "center" }), f); await p.waitForTimeout(500); await p.click('#atItens .ri[data-fone="' + f + '"] .cmb'); await p.waitForSelector(".ax .mm button", { timeout: 4000 }); const ach = await p.$('.ax .mm button:has-text("Arquivar")'); if (!ach) console.log("DBG menu:", await p.evaluate(() => [...document.querySelectorAll(".ax .mm")].map((m) => m.innerText).join(" || ")));S.ok(!!ach, "(5) menu do cartao oferece Arquivar para " + rot);
      if (ach) { await ach.click(); await p.waitForTimeout(500); S.ok(srv.arqPost.some((x) => x.fone === f && x.arquivar === true), "(5) POST arquivar enviado para " + rot); S.ok(!(await cards(p)).includes(f), "(5) " + rot + " saiu da lista principal"); }
    }
    await p.click('#atFiltros button[data-f="arq"]'); await p.waitForTimeout(300); const ac = await cards(p); S.ok(ac.includes(F.EQP) && ac.includes(F.AGU), "(5) as duas aparecem em Arquivadas " + ac.join());
    const met = await p.$eval('#atItens .ri[data-fone="' + F.MET + '"]', (e) => e.textContent).catch(() => null); await p.click('#atFiltros button[data-f="todos"]'); await p.waitForTimeout(300);
    const met2 = await p.$eval('#atItens .ri[data-fone="' + F.MET + '"]', (e) => [...e.querySelectorAll(".tg")].map((x) => x.textContent).join(" | ")); S.ok(/Meta limitou: reenviando por utilidade/.test(met2), "(6) selo da Meta limitada na lista: " + met2.replace(/\s+/g, " ").slice(0, 120));
    S.ok(!/undefined|\[object|NaN|erro/i.test(await p.evaluate(() => document.querySelector("#atItens").innerText)), "(6) sem x.atendimento a lista funciona sem texto de erro");
    const rp = await p.$eval('#atItens .ri[data-fone="' + F.REP + '"]', (e) => e.textContent); S.ok(/REPASSADA AO FELIPE/.test(rp), "(6) com x.atendimento=repassada_felipe o selo aparece");
    await ctx.close();
  } catch (e) { S.F("EXCECAO arquivar/meta: " + String(e.message).split("\n")[0].slice(0, 220)); }
  S.fim(); await b.close();
})();
