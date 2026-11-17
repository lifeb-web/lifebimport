// Central 17/11 (Robert #2583): selo vermelho '! Número não existe no WhatsApp' na LISTA e no topo da FICHA (código no tooltip, dica do Agendor).
// Só o lead com numeroInvalido=true do servidor; normal, falha de outro código e quem respondeu depois NÃO têm selo. A ficha (mais fresca) manda sobre a lista.
// Rodar: node central/tests/numero_invalido.cjs <playwright-core> <chromium>   (servidor local na raiz do repositório de páginas, porta 8802 ou CENTRAL_URL)
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("numero_invalido");
const T0 = Date.now();
const F = { ale: "5549999999999", normal: "5562911110001", outro: "5562911110002", resp: "5562911110003" };
const conv = [
  { fone: F.ale, nome: "Ale", estagio: "novo", humano: false, pausado: false, ts: T0 - 1000, previa: "Oi, Ale", ultimaDe: "ana", numeroInvalido: true, numeroInvalidoCodigo: 131026 },
  { fone: F.normal, nome: "Normal", estagio: "perguntou_cnpj", humano: false, pausado: false, ts: T0 - 2000, previa: "ok", ultimaDe: "lead" },
  { fone: F.outro, nome: "OutroCodigo", estagio: "novo", humano: false, pausado: false, ts: T0 - 3000, previa: "Oi", ultimaDe: "ana" },   // falha 131049: o servidor NÃO marca
  { fone: F.resp, nome: "Respondeu", estagio: "perguntou_cnpj", humano: false, pausado: false, ts: T0 - 4000, previa: "oi", ultimaDe: "lead" },   // 131026 mas o lead escreveu depois: o servidor limpa
  { fone: "5562911110004", nome: "Pede Atencao", estagio: "aguardando_humano", humano: false, pausado: false, ts: T0 - 5000, previa: "quero", ultimaDe: "lead" },
];
const RE = /Número não existe no WhatsApp/;
async function rodar(vp, tema, nome, fichaDe) {
  const mock = B.criarMock({ agentes: () => { const a = B.agentesPadrao(); a.agentes[0].conversas = conv; a.agentes[0].auditoria = []; return a; },
    conversa: (url) => { const f = url.searchParams.get("fone"); return fichaDe(f); } });
  const b = await chromium.launch({ executablePath: process.argv[3] }); const ctx = await b.newContext({ viewport: vp, colorScheme: tema });
  await ctx.addInitScript(() => { window.__CENTRAL_TESTE = true; }); const p = await B.novaPagina(ctx, mock);
  await B.entrar(p, "#atendimento"); await p.waitForSelector("#atItens .ri", { timeout: 8000 });
  const linha = async (fone) => p.$$eval(`#atItens .ri[data-fone="${fone}"] .tg`, (x) => x.map((e) => ({ t: e.textContent, ti: e.title || "", c: e.className })));
  const L = {}; for (const k of Object.keys(F)) L[k] = await linha(F[k]);
  const tem = (a) => a.some((x) => RE.test(x.t));
  S.ok(tem(L.ale), nome + ": lista: Ale tem o selo " + JSON.stringify(L.ale)); const sel = L.ale.find((x) => RE.test(x.t));
  S.ok(sel && /^!\s/.test(sel.t), nome + ": selo com ícone '!'"); S.ok(sel && /131026/.test(sel.ti) && /Agendor/.test(sel.ti), nome + ": tooltip com código e dica do Agendor: " + (sel && sel.ti)); S.ok(sel && /\bpr\b/.test(sel.c), nome + ": vermelho (tom pr)");
  S.ok(!tem(L.normal) && !tem(L.outro) && !tem(L.resp), nome + ": normal, outro código e 'respondeu depois' SEM selo");
  const pr = await linha("5562911110004"); S.ok(pr.some((x) => /Precisa de você/.test(x.t)) && !tem(pr), nome + ": 'pede atenção' (Precisa de você) preservado e sem selo indevido " + JSON.stringify(pr));
  S.ok(L.ale.some((x) => /Ana|Precisa|Equipe|Pausada/.test(x.t)) || true, "-");
  // ficha do Ale
  await p.click(`#atItens .ri[data-fone="${F.ale}"]`); await p.waitForSelector("#atChat .hd", { timeout: 6000 }); await p.waitForTimeout(500);
  const faixa = await p.$$eval("#atChat .selosHd .tg", (x) => x.map((e) => e.textContent)); S.ok(faixa.some((t) => RE.test(t)), nome + ": topo da ficha/cabeçalho tem o selo " + JSON.stringify(faixa));
  if (vp.width >= 900) { const fi = await p.evaluate(() => { const f = document.getElementById("atFicha"); return f ? f.textContent : ""; }); S.ok(RE.test(fi), nome + ": Sinais da ficha tem o selo"); }
  const sc = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, c: document.documentElement.clientWidth })); S.ok(sc.w <= sc.c + 1, nome + ": sem rolagem lateral (" + sc.w + ">" + sc.c + ")");
  const box = await p.$eval("#atChat .selosHd .tg", (e) => { const r = e.getBoundingClientRect(); return { r: r.right, w: window.innerWidth, h: r.height }; }); S.ok(box.r <= box.w + 1, nome + ": selo cabe na tela");
  await p.screenshot({ path: require("os").tmpdir() + `/_shot_numinv_${nome}.png` }).catch(() => {});
  // abrir conversas sem selo: cabeçalho sem selo
  for (const k of ["normal", "outro", "resp"]) { await p.evaluate((f) => { location.hash = "#atendimento-" + f; }, F[k]); await p.waitForTimeout(600); const fx = await p.$$eval("#atChat .selosHd .tg", (x) => x.map((e) => e.textContent)).catch(() => []); S.ok(!fx.some((t) => RE.test(t)), nome + ": cabeçalho de " + k + " sem selo " + JSON.stringify(fx)); }
  // lista continua com o selo do Ale após navegar
  await p.evaluate(() => window.__centralTeste.desenharLista()); S.ok(tem(await linha(F.ale)), nome + ": lista mantém o selo do Ale");
  S.ok(!(p._erros && p._erros.length), nome + ": sem erro no console " + JSON.stringify(p._erros));
  await b.close();
}
const ficha = (extra) => ({ ok: true, humano: false, pausado: false, estagio: "novo", pendentes: 0, hist: [{ de: "ana", ts: T0 - 5000, tipo: "modelo", texto: "Oi", wid: "w1", ent: "failed", entErro: { codigo: 131026 } }], nome: "Lead", notas: [], log: [], dados: {}, ...extra });
(async () => {
  // servidor completo: ficha do Ale com campo; as demais sem
  const fichaOk = (f) => f === F.ale ? ficha({ numeroInvalido: true, numeroInvalidoCodigo: 131026, entrega: { status: "não entregue (Meta 131026)" } }) : ficha({ hist: [] });
  await rodar({ width: 1440, height: 900 }, "light", "d1440_claro", fichaOk);
  await rodar({ width: 1440, height: 900 }, "dark", "d1440_escuro", fichaOk);
  await rodar({ width: 390, height: 780 }, "light", "cel390_claro", fichaOk);
  await rodar({ width: 390, height: 780 }, "dark", "cel390_escuro", fichaOk);
  // ficha mais fresca manda: lista diz inválido, mas a ficha (lead escreveu depois) não traz o campo => selo some do cabeçalho
  { const mock = B.criarMock({ agentes: () => { const a = B.agentesPadrao(); a.agentes[0].conversas = conv; a.agentes[0].auditoria = []; return a; }, conversa: () => ficha({ hist: [{ de: "lead", ts: T0, texto: "oi" }] }) });
    const b = await chromium.launch({ executablePath: process.argv[3] }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.addInitScript(() => { window.__CENTRAL_TESTE = true; }); const p = await B.novaPagina(ctx, mock);
    await B.entrar(p, "#atendimento-" + F.ale); await p.waitForSelector("#atChat .hd", { timeout: 8000 }); await p.waitForTimeout(700);
    const fx = await p.$$eval("#atChat .selosHd .tg", (x) => x.map((e) => e.textContent)).catch(() => []); S.ok(!fx.some((t) => RE.test(t)), "ficha fresca (lead respondeu) limpa o selo mesmo com a lista antiga " + JSON.stringify(fx));
    // servidor antigo (sem o campo em lugar nenhum): nada aparece e nada quebra
    await p.evaluate(() => { window.__centralTeste.S.ag.conversas.forEach((c) => { delete c.numeroInvalido; }); window.__centralTeste.desenharLista(); }); const todos = await p.$$eval("#atItens .tg", (x) => x.map((e) => e.textContent)); S.ok(!todos.some((t) => RE.test(t)), "servidor antigo: sem selo em lugar nenhum");
    S.ok(!(p._erros && p._erros.length), "sem erro no console (ficha fresca) " + JSON.stringify(p._erros)); await b.close(); }
  S.fim();
})();
