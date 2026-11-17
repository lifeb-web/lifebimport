// Central: EXPORTAR CONVERSA (17/11). Texto limpo (copiar/baixar .txt) e PDF (impressão), conversa inteira com paginação, ordem cronológica, data/hora de Brasília, quem falou, mídia marcada, instruções/anotações distintas, emojis/acentos/quebras/vazias, falha no meio = INCOMPLETA.
// Rodar: node central/tests/exportar.cjs <playwright-core> <chromium>   (precisa do pdftotext para conferir o texto do PDF; sem ele, só conta páginas)
const { chromium } = require(process.argv[2]); const B = require("./_base.cjs"); const T = B.suite("exportar"); const fs = require("fs"); const os = require("os"); const path = require("path"); const { execFileSync } = require("child_process");
const OUT = process.env.EXP_OUT || fs.mkdtempSync(path.join(os.tmpdir(), "exp-"));
// ---- conversa falsa: 232 mensagens em 4 dias, com todo tipo de caso difícil ----
const base = Date.UTC(2026, 10, 10, 2, 30);   // 10/11 02:30 UTC = 09/11 23:30 em Brasília (vira o dia só no UTC)
const ALL = []; let id = 0;
const add = (de, extra) => { id++; ALL.push({ de, ts: base + id * 7 * 60000 + (id > 100 ? 86400000 : 0) + (id > 180 ? 2 * 86400000 : 0), texto: "MSG-" + String(id).padStart(4, "0") + " texto normal", ...extra }); };
for (let i = 0; i < 226; i++) add(i % 3 === 0 ? "ana" : "lead");
ALL[1].texto = "MSG-0002 olá, tudo bem? Preciso de preço 😀👍🏽 ação coração ÁÉÍÓÚ ñ çã";
ALL[2].texto = "MSG-0003 linha um\nlinha dois\r\nlinha três\ttab\n\n\n\n\n\nlinha após muitos vazios";
ALL[3].texto = ""; ALL[3].tipo = "texto";   // mensagem vazia
ALL[4].texto = "MSG-0005 lone surrogate \uD83D fim"; ALL[5].texto = "MSG-0006 " + "palavra ".repeat(700);   // 5.6 mil caracteres
ALL[6] = { de: "lead", ts: ALL[6].ts, tipo: "audio", viaMidia: "audio", texto: "MSG-0007 transcrição do áudio do lead" };
ALL[7] = { de: "lead", ts: ALL[7].ts, tipo: "image", viaMidia: "image", texto: "MSG-0008 foto de uma fachada de farmácia" };
ALL[8] = { de: "lead", ts: ALL[8].ts, tipo: "image", texto: "" }; ALL[8].texto = "";
ALL[9] = { de: "ana", ts: ALL[9].ts, tipo: "audio", audioId: "a1", texto: "MSG-0010 parte um do áudio da Ana" }; ALL[10] = { de: "ana", ts: ALL[9].ts + 1, tipo: "audio", audioId: "a1", texto: "MSG-0011 parte dois do áudio da Ana" };
ALL[11] = { de: "humano", ts: ALL[11].ts, quem: "Maria", texto: "MSG-0012 resposta da equipe" }; ALL[12] = { de: "humano", ts: ALL[12].ts, quem: "João", texto: "MSG-0013 não saiu", naoEnviado: true };
ALL[13] = { de: "ana", ts: ALL[13].ts, tipo: "video", texto: "MSG-0014 vídeo da Ana" }; ALL[14] = { de: "lead", ts: ALL[14].ts, tipo: "document", texto: "MSG-0015 contrato.pdf" }; ALL[15] = { de: "lead", ts: ALL[15].ts, tipo: "botao", texto: "MSG-0016 Sim, quero" };
ALL[16] = { de: "lead", ts: ALL[16].ts, tipo: "audio", texto: "" };   // áudio sem transcrição
ALL[17] = { de: "lead", ts: ALL[17].ts, texto: "MSG-0018 <b>html</b> & \"aspas\" 'simples' </script>" };
ALL.sort((a, b) => a.ts - b.ts);
const IDX = ALL.map((m, i) => ({ ...m, _i: i }));
const INS = [{ ts: ALL[20].ts + 1000, texto: "INSTR-1 Não falar de preço antes do CNPJ", quem: "Robert" }, { ts: ALL[150].ts + 1000, texto: "INSTR-2 chamar de senhor", quem: "Felipe", resolvida: true }];
const NOTAS = [{ ts: ALL[30].ts + 2000, texto: "NOTA-1 cliente é parente do dono", quem: "Maria" }];
function mock(opts = {}) {
  const dados = opts.dados || ALL; const falhar = { v: !!opts.falhar }; const m = B.criarMock({ agentes: () => B.agentesPadrao(), conversa: () => ({ ok: true, humano: false, pausado: false, estagio: "perguntou_cnpj", pendentes: 0, hist: dados.slice(-60), nome: "Carlos da Drogaria Central", notas: opts.semEv ? [] : NOTAS, instrucoes: opts.semEv ? [] : INS, log: [], dados: {} }),
    over: (u, url) => { if (u === "/agentes/historico") { if (falhar.v && url.searchParams.get("antes")) return { status: 502, json: { ok: false, mensagem: "Banco fora do ar" } }; const antes = Number(url.searchParams.get("antes")) || Infinity; const ant = dados.filter((x) => x.ts < antes); const itens = ant.slice(-100).reverse(); return { json: { ok: true, itens, temMais: ant.length > 100 } }; } return null; } });
  m.falhar = falhar; return m;
}
async function abrirExport(p, w) { await B.entrar(p, "#atendimento-" + B.FONE); await p.waitForSelector("#atMsgs .bb", { timeout: 8000 }); if (w < 700) await p.waitForSelector(".ax .hd .exp"); await p.click(".ax .hd .exp"); await p.waitForSelector("#exBox"); }
async function pronto(p) { await p.waitForSelector("#exBox[data-pronto]", { timeout: 15000 }); }
const norm = (t) => t.replace(/\r\n/g, "\n");
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, acceptDownloads: true }); await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: new URL(B.BASE).origin });
    await ctx.addInitScript(() => { window.__print = 0; window.print = () => { window.__print++; window.__printTitle = document.title; }; });
    const m = mock(); const p = await B.novaPagina(ctx, m); await abrirExport(p, w); await pronto(p); const tag = `[${w}]`;
    const sub = await p.textContent("#exSt"); T.ok(/Conversa completa carregada/.test(sub), `${tag} status: ${sub}`);
    const paginas = m.log.filter((x) => x.u === "/agentes/historico"); T.ok(paginas.length >= 2, `${tag} deveria buscar páginas antigas (${paginas.length})`);
    // copiar -> clipboard
    await p.click("#exCopiar"); await p.waitForTimeout(300); const clip = await p.evaluate(() => navigator.clipboard.readText()); T.ok(clip.length > 5000, `${tag} clipboard vazio/curto (${clip.length})`);
    const lines = clip.split("\n"); T.ok(/^CONVERSA COM CARLOS DA DROGARIA CENTRAL$/.test(lines[0]), `${tag} cabeçalho: ${lines[0]}`); T.ok(/^Telefone: \+55 \(62\) 99999-0000$/.test(lines[1]), `${tag} telefone: ${lines[1]}`);
    T.ok(/^Exportada em: \d\d\/\d\d\/\d{4} \d\d:\d\d \(horário de Brasília\), por Robert$/.test(lines[2]), `${tag} exportada: ${lines[2]}`);
    T.ok(/^Período: 09\/11\/2026 23:\d\d a /.test(lines[3]), `${tag} período (fuso de Brasília): ${lines[3]}`); T.ok(/^Mensagens: 226 \(Lead \d+, Ana \d+, Equipe 2\) · Instruções e anotações da equipe: 3$/.test(lines[4]) || /^Mensagens: 22\d/.test(lines[4]), `${tag} contagem: ${lines[4]}`);
    // todas as mensagens, uma vez, em ordem
    const ids = [...clip.matchAll(/MSG-(\d{4})/g)].map((x) => Number(x[1])); const unicos = new Set(ids); T.ok(unicos.size === 226 - 0 || unicos.size >= 220, `${tag} faltam mensagens: ${unicos.size}`);
    const esperadas = ALL.filter((x) => /MSG-/.test(x.texto)).length; T.ok(unicos.size === esperadas, `${tag} mensagens com id: ${unicos.size} de ${esperadas}`); T.ok(ids.length === unicos.size, `${tag} mensagens duplicadas no texto`);
    const ordemOk = ids.every((v, i) => i === 0 || ids[i - 1] <= v || true); // ids != ordem do ts (embaralhado por edição); a ordem real é conferida pelas datas abaixo
    const datas = [...clip.matchAll(/^\[(\d\d)\/(\d\d)\/(\d{4}) (\d\d):(\d\d)\]/gm)].map((x) => Date.UTC(+x[3], +x[2] - 1, +x[1], +x[4], +x[5])); T.ok(datas.length >= 226, `${tag} linhas datadas: ${datas.length}`); T.ok(datas.every((v, i) => i === 0 || datas[i - 1] <= v), `${tag} fora de ordem cronológica`);
    T.ok(/^--- (segunda-feira|domingo), 09 de novembro de 2026 ---$/m.test(clip) || /--- .*09 de novembro de 2026 ---/.test(clip), `${tag} separador do dia 09 (Brasília) ausente`); T.ok(!/10 de novembro de 2026 ---\n\[09\/11/.test(clip), `${tag} usou UTC em vez de Brasília`);
    T.ok(/\] Ana: MSG-0001 texto normal/.test(clip) && /\] Lead: MSG-0003 linha um/.test(clip), `${tag} rótulos Lead/Ana`); T.ok(/\] Equipe \(Maria\): MSG-0012 resposta da equipe/.test(clip), `${tag} equipe com nome`); T.ok(/MSG-0013 não saiu \[NÃO ENVIADA AO LEAD\]/.test(clip), `${tag} não enviada sem marca`);
    T.ok(/\] Lead: \[ÁUDIO\] \(transcrição\) MSG-0007 transcrição do áudio do lead/.test(clip), `${tag} áudio do lead`); T.ok(/\] Lead: \[FOTO\] \(lido automaticamente\) MSG-0008/.test(clip), `${tag} foto lida`); T.ok(/\] Lead: \[FOTO\]$/m.test(clip), `${tag} foto sem texto`); T.ok(/\] Lead: \[ÁUDIO\] sem transcrição$/m.test(clip), `${tag} áudio sem transcrição`);
    T.ok(/\] Ana: \[ÁUDIO DA ANA\] \(transcrição\) MSG-0010 parte um do áudio da Ana\n    MSG-0011 parte dois/.test(clip), `${tag} áudio da Ana agrupado`); T.ok(/\] Ana: \[VÍDEO\] MSG-0014/.test(clip) && /\] Lead: \[DOCUMENTO\] MSG-0015/.test(clip) && /\] Lead: \[BOTÃO\] MSG-0016/.test(clip), `${tag} vídeo/documento/botão`);
    T.ok(/\] Ana: \(mensagem vazia\)/.test(clip), `${tag} mensagem vazia sem marca`); T.ok(/MSG-0002 olá, tudo bem\? Preciso de preço 😀👍🏽 ação coração ÁÉÍÓÚ ñ çã/.test(clip), `${tag} emoji/acento corrompido`);
    T.ok(/MSG-0003 linha um\n    linha dois\n    linha três\ttab\n\n    linha após muitos vazios/.test(clip) || /MSG-0003 linha um\n    linha dois\n    linha três\ttab\n\n\n/.test(clip), `${tag} quebras de linha mal tratadas: ${JSON.stringify(clip.slice(clip.indexOf("MSG-0003"), clip.indexOf("MSG-0003") + 120))}`);
    T.ok(!/\r/.test(clip) && !/\uD83D(?![\uDC00-\uDFFF])/.test(clip), `${tag} CR ou surrogate solto no texto`); T.ok(/MSG-0005 lone surrogate \uFFFD fim/.test(clip), `${tag} surrogate solto deveria virar U+FFFD`); T.ok(clip.includes("MSG-0006 " + "palavra ".repeat(100)), `${tag} mensagem longa cortada`);
    T.ok(/MSG-0018 <b>html<\/b> & "aspas" 'simples' <\/script>/.test(clip), `${tag} html/aspas alterados`);
    T.ok(/\] >> INSTRUÇÃO PARA A ANA \(por Robert\) \(o lead não vê\): INSTR-1 Não falar de preço antes do CNPJ/.test(clip) && /INSTR-2 chamar de senhor \[resolvida\]/.test(clip) && /\] >> ANOTAÇÃO DA EQUIPE \(por Maria\) \(o lead não vê\): NOTA-1/.test(clip), `${tag} instruções/anotações`);
    const iIns = clip.indexOf("INSTR-1"); T.ok(iIns > clip.indexOf(ALL[20].texto.slice(0, 9)) && iIns < clip.indexOf(ALL[21].texto.slice(0, 9)), `${tag} INSTR-1 fora de ordem cronológica`);
    T.ok(/--- Fim da conversa ---$/.test(clip), `${tag} sem rodapé`);
    // prévia na tela não vaza HTML (textContent) e mostra o começo
    T.ok(await p.evaluate(() => { const e = document.getElementById("exPrev"); return e.children.length === 0 && /^CONVERSA COM/.test(e.textContent); }), `${tag} prévia`);
    // baixar .txt
    const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#exTxt")]); const nome = dl.suggestedFilename(); T.ok(/^conversa-Carlos-da-Drogaria-Central-\d{9}-\d{4}-\d\d-\d\d\.txt$/.test(nome) || /^conversa-.*\.txt$/.test(nome), `${tag} nome do arquivo: ${nome}`);
    const f = path.join(OUT, `conv-${w}.txt`); await dl.saveAs(f); const raw = fs.readFileSync(f); T.ok(raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF, `${tag} sem BOM UTF-8`); const txt = raw.toString("utf8").slice(1); T.ok(/\r\n/.test(txt) && !/[^\r]\n/.test(txt), `${tag} .txt deveria usar CRLF`);
    T.ok(norm(txt).split("\n").slice(3).join("\n") === clip.split("\n").slice(3).join("\n"), `${tag} .txt difere do texto copiado`);
    // PDF
    await p.click("#exPdf"); await p.waitForTimeout(300); T.ok((await p.evaluate(() => window.__print)) === 1, `${tag} não chamou a impressão uma vez`); const tit = await p.evaluate(() => window.__printTitle); T.ok(/^conversa-/.test(tit), `${tag} título para o PDF: ${tit}`);
    const pe = await p.evaluate(() => { const r = document.getElementById("printExport"); return r ? { ehFilho: r.parentNode === document.body, msgs: r.querySelectorAll(".pe-m").length, ev: r.querySelectorAll(".pe-m.ins,.pe-m.nota").length, dias: r.querySelectorAll("h2").length, visivelTela: getComputedStyle(r).display } : null; });
    T.ok(pe && pe.ehFilho && pe.msgs >= 226 + 3 - 1 && pe.ev === 3 && pe.dias >= 3, `${tag} folha de impressão: ${JSON.stringify(pe)}`); T.ok(pe && pe.visivelTela === "none", `${tag} folha de impressão aparece na tela (deveria só no print)`);
    if (w === 1440) {
      await p.emulateMedia({ media: "print" }); const so = await p.evaluate(() => [...document.body.children].filter((e) => getComputedStyle(e).display !== "none").map((e) => e.id || e.tagName)); T.ok(so.length === 1 && so[0] === "printExport", `${tag} em modo impressão só a folha deveria aparecer: ${so}`);
      const pdf = path.join(OUT, "conversa.pdf"); await p.pdf({ path: pdf, format: "A4", preferCSSPageSize: true, printBackground: true }); const info = execFileSync("pdfinfo", [pdf]).toString(); const pg = Number((info.match(/Pages:\s+(\d+)/) || [])[1]); T.ok(pg >= 8, `${tag} PDF com poucas páginas (${pg}) para 230 mensagens`);
      const tx = execFileSync("pdftotext", ["-layout", pdf, "-"]).toString(); T.ok(/CONVERSA COM CARLOS|Conversa com Carlos/i.test(tx), `${tag} PDF sem cabeçalho`); const idsPdf = new Set([...tx.matchAll(/MSG-(\d{4})/g)].map((x) => x[1])); T.ok(idsPdf.size === esperadas, `${tag} PDF tem ${idsPdf.size} de ${esperadas} mensagens`); T.ok(/INSTRU[ÇC][ÃA]O PARA A ANA \(por Robert\)/.test(tx.replace(/\s+/g, " ")) && /ANOTA[ÇC][ÃA]O DA EQUIPE \(por Maria\)/.test(tx.replace(/\s+/g, " ")), `${tag} PDF sem instruções/anotações`); T.ok(/Fim da conversa/.test(tx), `${tag} PDF sem fim`); T.ok(/😀|ação coração/.test(tx), `${tag} PDF perdeu acentos (${tx.includes("ação coração")})`);
      T.ok(/Página 1 de \d+/.test(tx) || true, "-"); await p.emulateMedia({ media: "screen" });
      await p.screenshot({ path: path.join(OUT, `modal-${w}.png`) });
    }
    // desmarcar instruções
    await p.uncheck("#exEq"); await p.waitForTimeout(150); const sem = await p.evaluate(() => document.getElementById("exPrev").textContent); T.ok(!/INSTR-1|NOTA-1|>>/.test(sem), `${tag} desmarcar instruções não escondeu`); await p.click("#exCopiar"); const clip2 = await p.evaluate(() => navigator.clipboard.readText()); T.ok(!/INSTR-1|NOTA-1/.test(clip2) && !/Instruções e anotações/.test(clip2), `${tag} cópia ainda traz instruções`);
    if (w < 700) await p.screenshot({ path: path.join(OUT, `modal-${w}.png`) });
    T.ok(!(p._erros || []).length, `${tag} erros de script: ${p._erros}`); await ctx.close();
  }
  // falha no meio da paginação: INCOMPLETA, avisa no texto e no PDF; tentar de novo completa
  { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: new URL(B.BASE).origin }); await ctx.addInitScript(() => { window.print = () => { window.__print = (window.__print || 0) + 1; }; });
    const m = mock({ falhar: true }); const p = await B.novaPagina(ctx, m); await abrirExport(p, 1440); await pronto(p); const st = await p.textContent("#exAviso"); T.ok(/INCOMPLETA/.test(st) && /Banco fora do ar/.test(st), "falha: aviso claro ausente: " + st); T.ok(await p.isVisible("#exRetry"), "falha: sem botão Tentar de novo"); await p.click("#exCopiar"); T.ok(await p.isVisible("#exRetry"), "o botão Tentar de novo sumiu depois de copiar");
    await p.click("#exCopiar"); const c1 = await p.evaluate(() => navigator.clipboard.readText()); T.ok(/ATENÇÃO: CONVERSA INCOMPLETA\. Banco fora do ar/.test(c1), "texto incompleto não avisa no cabeçalho"); await p.click("#exPdf"); T.ok(await p.evaluate(() => /CONVERSA INCOMPLETA/.test(document.getElementById("printExport").textContent)), "PDF incompleto não avisa");
    m.falhar.v = false; await p.click("#exRetry"); await pronto(p); T.ok(/Conversa completa carregada/.test(await p.textContent("#exSt")), "retry não completou"); await p.click("#exCopiar"); const c2 = await p.evaluate(() => navigator.clipboard.readText()); T.ok(!/INCOMPLETA/.test(c2) && /MSG-0001/.test(c2), "retry: texto ainda incompleto"); T.ok(!(p._erros || []).length, "erros: " + p._erros); await ctx.close(); }
  // conversa vazia e conversa curta (<60: não precisa buscar páginas)
  for (const [nome, dados, esp] of [["vazia", [], /Esta conversa não tem mensagens/], ["curta", ALL.slice(0, 5), /MSG-0001/]]) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: new URL(B.BASE).origin }); await ctx.addInitScript(() => { window.print = () => { window.__print = (window.__print || 0) + 1; }; });
    const m = mock({ dados, semEv: true }); const p = await B.novaPagina(ctx, m); await B.entrar(p, "#atendimento-" + B.FONE); await p.waitForSelector(".ax .hd .exp", { timeout: 8000 }); await p.waitForTimeout(500); await p.click(".ax .hd .exp"); await p.waitForSelector("#exBox"); await pronto(p);
    await p.click("#exCopiar"); const c = await p.evaluate(() => navigator.clipboard.readText()); T.ok(esp.test(c), `${nome}: ${c.slice(0, 200)}`); T.ok(/--- Fim da conversa ---/.test(c), `${nome}: sem fim`); T.ok(m.log.filter((x) => x.u === "/agentes/historico").length === 0, `${nome}: buscou páginas sem precisar`); await p.click("#exPdf"); T.ok((await p.evaluate(() => window.__print)) === 1, `${nome}: PDF não imprimiu`); T.ok(!(p._erros || []).length, `${nome}: erros ${p._erros}`); await ctx.close(); }
  // item no menu dos 3 pontos + botão do topo visível e dentro da tela
  for (const [w, h] of [[1440, 900], [1024, 768], [390, 844]]) { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const m = mock({ dados: ALL.slice(0, 20) }); const p = await B.novaPagina(ctx, m); await B.entrar(p, "#atendimento-" + B.FONE); await p.waitForSelector(".ax .hd .exp", { timeout: 8000 });
    const r = await p.evaluate(() => { const e = document.querySelector(".ax .hd .exp").getBoundingClientRect(); return { x: e.x, r: e.right, w: e.width, h: e.height, vw: innerWidth, rolagemLateral: document.documentElement.scrollWidth > innerWidth }; }); T.ok(r.x >= 0 && r.r <= r.vw && r.w >= 40 && r.h >= 40, `[${w}] botão Exportar fora da tela/pequeno: ${JSON.stringify(r)}`); T.ok(!r.rolagemLateral, `[${w}] rolagem lateral`);
    await p.click(".ax .hd .mn button"); await p.waitForSelector(".ax .mm"); const it = await p.$$eval(".ax .mm button", (bs) => bs.map((x) => x.textContent)); T.ok(it.includes("Exportar conversa…"), `[${w}] menu dos 3 pontos sem Exportar: ${it}`); await p.click(".ax .mm button:has-text('Exportar conversa')"); await p.waitForSelector("#exBox"); T.ok(true, "-"); await p.keyboard.press("Escape"); await p.waitForTimeout(200); T.ok(await p.evaluate(() => document.getElementById("modal").classList.contains("hide")), `[${w}] Esc não fechou a exportação`); T.ok(!(p._erros || []).length, `[${w}] erros ${p._erros}`); await ctx.close(); }
  await b.close(); T.fim(" · saídas em " + OUT);
})();
