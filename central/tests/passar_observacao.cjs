// Central 17/11 (#2330/#2331): 'Passar ao Felipe' tem campo OPCIONAL 'Observação para o Felipe' (vai no corpo como observacao); sucesso só com texto de confirmação lida de volta quando o servidor confirma; erro de leitura de volta aparece claro.
// Rodar: node central/tests/passar_observacao.cjs <playwright-core> <chromium>
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("passar_observacao");
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.addInitScript(() => { window.__CENTRAL_TESTE = true; });
  let resp = { status: 200, json: { ok: true, sdrDealId: 4242, confirmado: { etapa: "Repasse da Ana", dono: "Felipe" } } };
  const mock = B.criarMock({ over: async (u) => (u === "/agentes/conversa/passar-felipe" ? resp : null) }); const p = await B.novaPagina(ctx, mock);
  await B.entrar(p, "#atendimento-" + B.FONE); await p.waitForSelector("#atChat .hd", { timeout: 8000 }); await p.waitForTimeout(500);
  const abrir = async () => { await p.evaluate(() => window.__centralTeste.passar()); await p.waitForSelector("#psObs", { timeout: 4000 }); };
  await abrir(); const ph = await p.$eval("#psObs", (e) => ({ tag: e.tagName, ph: e.placeholder, max: e.maxLength })); S.ok(ph.tag === "TEXTAREA" && /resumo da conversa/.test(ph.ph) && ph.max === 600, "campo opcional com a explicação do resumo automático " + JSON.stringify(ph));
  await p.fill("#psObs", "  Pediu orçamento de mercearia; ligar depois das 14h.  "); await p.click('#modal button:has-text("Passar ao Felipe")'); await p.waitForTimeout(900);
  let l = mock.log.filter((x) => x.u === "/agentes/conversa/passar-felipe"); S.ok(l.length === 1 && l[0].body.observacao === "Pediu orçamento de mercearia; ligar depois das 14h." && l[0].body.fone === B.FONE, "observação enviada (aparada) " + JSON.stringify(l.map((x) => x.body)));
  const toast = await p.evaluate(() => (document.getElementById("toast") || document.querySelector(".toast") || {}).textContent || document.body.innerText); S.ok(/conferida no Agendor/.test(toast) && /Repasse da Ana/.test(toast) && /4242/.test(toast), "sucesso com confirmação lida de volta: " + toast.slice(0, 120));
  // vazio
  await p.waitForTimeout(500); await abrir(); await p.click('#modal button:has-text("Passar ao Felipe")'); await p.waitForTimeout(900);
  l = mock.log.filter((x) => x.u === "/agentes/conversa/passar-felipe"); S.ok(l.length === 2 && l[1].body.observacao === "", "sem observação: vai vazia (o servidor escreve o resumo)");
  // servidor não confirmou
  resp = { status: 502, json: { ok: false, erro: "etapa_nao_confere", mensagem: "O repasse não foi confirmado no Agendor (etapa_nao_confere). Toque de novo; repetir é seguro." } };
  await p.waitForTimeout(500); await abrir(); await p.click('#modal button:has-text("Passar ao Felipe")'); await p.waitForTimeout(1200);
  const er = await p.evaluate(() => (document.getElementById("modal") || document.body).innerText); S.ok(/não foi confirmado no Agendor/.test(er), "leitura de volta que não confere: erro claro, modal continua aberto " + er.slice(0, 160));
  S.ok(await p.evaluate(() => document.querySelectorAll("#psObs").length) === 1, "modal segue aberto com a observação para repetir");
  S.ok(!(p._erros && p._erros.length), "sem erro no console " + JSON.stringify(p._erros));
  await b.close(); S.fim();
})();
