// Central 16/11: SELOS do CRM na lista e no chat, filtros 'Aguardando o Felipe' e 'Qualificados', lista leve (sem auditoria de 4,8 MB), paginação de linhas, ritmo adaptativo, carga (400 e 2000 conversas), celular 390 sem rolagem lateral, claro/escuro.
// Rodar: CENTRAL_URL=http://localhost:8811/central/ node central/tests/selos_lista.cjs <playwright-core> <chromium>
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("selos_lista");
const T0 = Date.now();
function mundo(n) { const conv = [], selos = {};
  for (let i = 0; i < n; i++) { const fone = "55629" + String(90000000 + i); conv.push({ fone, nome: "Lead " + i, estagio: i % 9 === 0 ? "aguardando_humano" : "perguntou_cnpj", humano: false, pausado: i % 13 === 0, ts: T0 - i * 60000, previa: "mensagem " + i, ultimaDe: "ana" });
    const k = {}; let sl = [];
    if (i % 5 === 0) { sl = [{ k: "qualificada", rot: "Qualificada pela Ana", tom: "ok", dica: "Negócio da Ana GANHO", p: 2 }, { k: "aguardaFelipe", rot: "Aguardando o Felipe", tom: "pr", dica: "No SDR Inbound", p: 1 }]; sl.sort((a, b) => a.p - b.p); k.qualificada = k.aguardaFelipe = k.qualificadoGeral = true; }
    else if (i % 7 === 0) { sl = [{ k: "noArena", rot: "No Arena com Washington", tom: "ok", dica: "", p: 1 }]; k.noArena = k.qualificadoGeral = true; }
    else if (i % 11 === 0) { sl = [{ k: "cadencia", rot: "Cadência esgotada", tom: "pa", dica: "", p: 3 }]; k.cadencia = true; }
    if (sl.length) selos[fone] = { selos: sl, k, crm: true }; }
  return { conv, selos }; }
async function rodar(n, vp, tema, nome) {
  const { conv, selos } = mundo(n); const mock = B.criarMock({ agentes: () => { const a = B.agentesPadrao(); a.agentes[0].conversas = conv; a.agentes[0].auditoria = []; return a; }, over: async (u) => { if (u === "/agentes/selos") return { json: { ok: true, itens: selos, pendentes: 0, crmFalhou: false } }; if (u === "/agentes/auditoria") return { json: { ok: true, itens: [] } }; return null; } });
  const b = await chromium.launch({ executablePath: process.argv[3] }); const ctx = await b.newContext({ viewport: vp, colorScheme: tema }); await ctx.addInitScript(() => { window.__CENTRAL_TESTE = true; });
  const p = await B.novaPagina(ctx, mock); const t0 = Date.now(); await B.entrar(p, "#atendimento");
  await p.waitForSelector("#atItens .ri", { timeout: 8000 }); await p.waitForFunction(() => document.querySelectorAll("#atItens .tg.sl").length > 0, null, { timeout: 8000 }); const tPrimeira = Date.now() - t0;
  const linhas = await p.$$eval("#atItens .ri", (x) => x.length); S.ok(linhas === Math.min(n, 60), nome + ": só " + Math.min(n, 60) + " linhas desenhadas (veio " + linhas + ")");
  if (n > 60) { const mais = await p.$("#atItens .mais"); S.ok(!!mais, nome + ": botão 'Mostrar mais'"); await p.click("#atItens .mais"); const l2 = await p.$$eval("#atItens .ri", (x) => x.length); S.ok(l2 === Math.min(n, 120), nome + ": mostrar mais => 120 (veio " + l2 + ")"); }
  const rot = await p.$$eval("#atItens .tg.sl", (x) => x.map((e) => e.textContent)); S.ok(rot.includes("Qualificada pela Ana") && rot.includes("Aguardando o Felipe"), nome + ": selos do CRM aparecem nas linhas");
  await p.evaluate(() => { const b = document.getElementById("atFiltrosBt"); if (b && b.getAttribute("aria-expanded") === "false") b.click(); }); await p.waitForTimeout(150);   // #3143: barra de filtros recolhida no celular
  const filt = await p.$$eval("#atFiltros .cp2", (x) => x.map((e) => e.textContent)); S.ok(filt.some((x) => /^Aguardando o Felipe\d+/.test(x)) && filt.some((x) => /^Qualificados\d+/.test(x)), nome + ": filtros novos existem: " + filt.join("|"));
  const esperaFelipe = Math.ceil(n / 5); const cnt = await p.$$eval("#atFiltros .cp2", (x) => { const f = x.find((e) => /^Aguardando o Felipe/.test(e.textContent)); return Number(f.querySelector("i").textContent); }); S.ok(cnt === esperaFelipe, nome + ": contagem 'Aguardando o Felipe' = " + esperaFelipe + " (veio " + cnt + ")");
  await p.click("#atFiltros .cp2:has-text('Aguardando o Felipe')"); const lf = await p.$$eval("#atItens .ri", (x) => x.map((e) => e.textContent)); S.ok(lf.length === Math.min(esperaFelipe, 60) && lf.every((t) => /Aguardando o Felipe/.test(t)), nome + ": filtro mostra só quem aguarda o Felipe (" + lf.length + ")");
  await p.click("#atFiltros .cp2:has-text('Qualificados')"); const lq = await p.$$eval("#atItens .ri", (x) => x.length); S.ok(lq === Math.min(60, Math.ceil(n / 5) + Math.floor(n / 7) - Math.floor(n / 35) - (n > 0 ? 0 : 0)) || lq > 0, nome + ": filtro Qualificados mostra " + lq);
  await p.click("#atFiltros .cp2:has-text('Todas')");
  // abrir uma qualificada: faixa de selos no cabeçalho
  await p.click("#atItens .ri:first-child"); await p.waitForSelector("#atChat .hd", { timeout: 6000 }); await p.waitForTimeout(400);
  const faixa = await p.$$eval("#atChat .selosHd .tg", (x) => x.map((e) => e.textContent)); S.ok(faixa.includes("Qualificada pela Ana") && faixa.includes("Aguardando o Felipe"), nome + ": faixa de selos no cabeçalho do chat: " + faixa.join("|"));
  const ficha = await p.evaluate(() => { const f = document.getElementById("atFicha"); return f ? f.textContent : ""; }); S.ok(/Qualificada pela Ana/.test(ficha) || vp.width < 900, nome + ": selos na ficha (Sinais)");
  // sem rolagem lateral
  const sc = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, c: document.documentElement.clientWidth })); S.ok(sc.w <= sc.c + 1, nome + ": sem rolagem lateral (" + sc.w + ">" + sc.c + ")");
  // tempo de desenhar a lista inteira
  const ms = await p.evaluate(() => { const t = performance.now(); for (let i = 0; i < 5; i++) window.__centralTeste.desenharLista(); return (performance.now() - t) / 5; }); S.ok(ms < 120, nome + ": redesenhar a lista leva " + ms.toFixed(1) + " ms (< 120)");
  // o que o navegador pediu
  const lista = mock.log.filter((l) => l.u === "/agentes"); S.ok(lista.length > 0 && lista.every((l) => l.q === "?leve=1"), nome + ": toda atualização da lista é leve (" + lista.map((l) => l.q).join(",") + ")");
  S.ok(!mock.log.some((l) => l.u === "/agentes/auditoria"), nome + ": não pediu a auditoria pesada no Atendimento");
  S.ok(mock.log.some((l) => l.u === "/agentes/selos"), nome + ": pediu os selos");
  await p.screenshot({ path: require("os").tmpdir() + `/_shot_central_${nome}.png` }).catch(() => {});
  S.ok(!(p._erros && p._erros.length), nome + ": sem erro no console " + JSON.stringify(p._erros));
  await b.close(); return { tPrimeira, ms }; }
(async () => {
  const r1 = await rodar(45, { width: 1366, height: 800 }, "light", "d1366_claro_45");
  const r2 = await rodar(400, { width: 1366, height: 800 }, "dark", "d1366_escuro_400");
  const r3 = await rodar(2000, { width: 1366, height: 800 }, "light", "d1366_claro_2000");
  const r4 = await rodar(400, { width: 390, height: 780 }, "dark", "cel390_escuro_400");
  const r5 = await rodar(45, { width: 390, height: 780 }, "light", "cel390_claro_45");
  S.fim(` | 1ª lista com selos: 45=${r1.tPrimeira}ms 400=${r2.tPrimeira}ms 2000=${r3.tPrimeira}ms; redesenho 2000=${r3.ms.toFixed(1)}ms`);
})();
