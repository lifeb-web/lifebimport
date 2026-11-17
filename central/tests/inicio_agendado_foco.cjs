// Central 16/11 (#20 e #5): 'Início agendado: dd/mm às hh:mm' no lugar do selo genérico/'Fora do foco'; 'Fora do foco' só com segmento CONHECIDO; desconhecido = 'Segmento não informado'. Defensivo: sem o campo, comportamento antigo.
// Rodar: node central/tests/inicio_agendado_foco.cjs <playwright-core> <chromium>
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("inicio_agendado_foco");
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  let extra = {};
  const mock = B.criarMock({ conversa: () => ({ ok: true, humano: false, pausado: false, estagio: "perguntou_cnpj", pendentes: 0, hist: [], nome: "Lead", notas: [], log: [], dados: {}, ...extra }) });
  await ctx.addInitScript(() => { window.__CENTRAL_TESTE = 1; }); const p = await B.novaPagina(ctx, mock);
  await B.entrar(p, "#atendimento-" + B.FONE);
  const tags = async () => { await p.waitForSelector("#atFicha .tg", { timeout: 6000 }).catch(() => {}); return p.$$eval("#atFicha .tg", (e) => e.map((x) => x.textContent)); };
  const abrir = async (e) => { extra = e; await p.goto(B.BASE + "?t=" + Date.now() + "#atendimento-" + B.FONE); await p.waitForTimeout(400); if (await p.isVisible("#usuario")) { await p.fill("#usuario", "robert@x.com"); await p.fill("#senha", "x"); await p.click("#btnEntrar"); await p.waitForSelector("#app:not(.hide)"); } await p.waitForTimeout(900); return tags(); };
  const ms = Date.UTC(2026, 10, 17, 12, 30); // 17/11 09:30 BRT
  let t = await abrir({ dados: { segmento: "outro" }, foco: { foco: false, motivo: "outro_segmento" } }); S.ok(t.includes("Fora do foco"), "segmento conhecido fora do foco: 'Fora do foco' " + t);
  t = await abrir({ dados: {}, foco: { foco: false, motivo: "segmento_desconhecido" } }); S.ok(!t.includes("Fora do foco") && t.includes("Segmento não informado"), "segmento desconhecido (servidor): neutro " + t);
  t = await abrir({ dados: {} }); S.ok(!t.includes("Fora do foco") && t.includes("Segmento não informado"), "sem segmento e sem campo foco: neutro " + t);
  t = await abrir({ dados: { segmento: "farmacia" }, foco: { foco: true, motivo: "segmento_confirmado" } }); S.ok(!t.includes("Fora do foco") && !t.includes("Segmento não informado"), "foco confirmado: nem um nem outro " + t);
  t = await abrir({ dados: {}, foco: { foco: false, motivo: "segmento_desconhecido" }, inicioAgendado: { quandoMs: ms, quandoBR: "17/11 às 09:30", motivo: "fora do expediente" } }); S.ok(t.includes("Início agendado: 17/11 às 09:30") && !t.includes("Fora do foco") && !t.includes("Segmento não informado"), "início agendado aparece no lugar (BRT, via quandoMs) " + t);
  t = await abrir({ dados: { segmento: "outro" }, foco: { foco: false, motivo: "outro_segmento" }, inicioAgendado: { quandoBR: "18/11 às 08:05" } }); S.ok(t.includes("Início agendado: 18/11 às 08:05") && !t.includes("Fora do foco"), "só quandoBR: usa o texto; substitui Fora do foco " + t);
  t = await abrir({ dados: { segmento: "outro" }, foco: { foco: false, motivo: "outro_segmento" }, inicioAgendado: {} }); S.ok(!t.some((x) => /Início agendado/.test(x)) && t.includes("Fora do foco"), "campo vazio: comportamento antigo " + t);
  // lista/cabeçalho: selos do servidor + início agendado
  const r = await p.evaluate((ms) => { window.__centralTeste.S.selos = { "5562999990000": { selos: [{ k: "emAtendimento", rot: "Ana", tom: "an" }, { k: "x", rot: "Outro", tom: "an" }], inicioAgendado: { quandoMs: ms } } }; return window.__centralTeste.atSelosDe("5562999990000").map((g) => g.rot); }, ms);
  S.ok(r[0] === "Início agendado: 17/11 às 09:30" && !r.includes("Ana") && r.includes("Outro"), "atSelosDe: início agendado primeiro, 'Ana' genérico some " + r);
  S.ok(!(p._erros && p._erros.length), "sem erro no console " + JSON.stringify(p._erros));
  await b.close(); S.fim();
})();
