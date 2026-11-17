// Central: AÇÕES MANUAIS que não travam (16/11, Robert: "os botões travam todos, inclusive assumir e repassar ao Felipe").
// Prova no Chromium, com servidor falso: lento, erro 500, 409, rede caída, resposta que se perde; estado "fazendo…", sem clique duplo,
// leitura de volta, tela atualiza na hora (não reaproveita leitura velha) e NUNCA rolagem horizontal no celular.
// Rodar: CENTRAL_URL=http://localhost:8892/central/ node central/tests/acoes_manuais.cjs <playwright-core> <chromium>
const { chromium } = require(process.argv[2]); const B = require("./_base.cjs"); const T = B.suite("acoes_manuais");
const FONE = "5562999990000";
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  async function cenario(nome, viewport, fn) {
    const estado = { humano: false, pausado: false, estagio: "perguntou_cnpj", notas: [] }; const chamadas = []; const ctl = { modo: "ok", atraso: 0, convAtraso: 0, listaAtraso: 0, controleSecoes: 0, passarModo: "ok" };
    const mock = B.criarMock({
      conversa: () => ({ ok: true, humano: estado.humano, pausado: estado.pausado, estagio: estado.estagio, pendentes: 0, hist: [{ de: "lead", ts: B.T0 - 60000, tipo: "texto", texto: "oi" }], nome: "Lead", notas: estado.notas, log: [], dados: {} }),
      over: async (u, url, req, body) => {
        if (u === "/agentes") { if (ctl.listaAtraso) return { delay: ctl.listaAtraso }; return null; }
        if (u === "/agentes/conversa" && ctl.convAtraso) return { delay: ctl.convAtraso };
        if (u === "/agentes/conversa/controle") {
          chamadas.push(body); ctl.controleSecoes++;
          if (ctl.modo === "lento") { await new Promise((r) => setTimeout(r, ctl.atraso)); }
          if (ctl.modo === "pendura") { await new Promise((r) => setTimeout(r, 7000)); return { abort: true }; }
          if (ctl.modo === "500") return { status: 500, json: { ok: false, erro: "falhou" } };
          if (ctl.modo === "409") return { status: 409, json: { ok: false, mensagem: "A conversa mudou." } };
          if (ctl.modo === "rede") return { abort: true };
          if (ctl.modo === "perde") { aplica(body); return { abort: true }; }   // o servidor FEZ, mas a resposta não chegou
          if (ctl.modo === "500uma") { ctl.modo = "ok"; return { status: 502, json: { ok: false } }; }
          aplica(body); return { json: { ok: true } };
        }
        if (u === "/agentes/conversa/passar-felipe") {
          chamadas.push({ passar: body });
          if (ctl.passarModo === "500") { estado.notas.push({ ts: Date.now(), quem: "Robert", texto: "Passada manualmente ao Felipe por Robert." }); return { status: 502, json: { ok: false, erro: "falhou", mensagem: "Não consegui passar agora. Nada foi enviado ao lead." } }; }
          if (ctl.passarModo === "lento") await new Promise((r) => setTimeout(r, ctl.atraso));
          estado.humano = true; estado.notas.push({ ts: Date.now(), quem: "Robert", texto: "Passada manualmente ao Felipe por Robert." }); return { json: { ok: true, sdrDealId: 47055493 } };
        }
        return null;
      },
    });
    function aplica(c) { if (c.acao === "assumir") estado.humano = true; if (c.acao === "devolver") estado.humano = false; if (c.acao === "pausar") estado.pausado = true; if (c.acao === "retomar") estado.pausado = false; }
    const ctx = await b.newContext({ viewport }); await ctx.addInitScript(() => { window.__CENTRAL_TESTE = true; });
    const p = await B.novaPagina(ctx, mock);
    await B.entrar(p, "#atendimento-" + FONE); await p.waitForSelector("#atMsgs .bb", { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(400);
    try { await fn({ p, estado, chamadas, ctl, mock }); } catch (e) { T.F(nome + ": exceção do teste: " + e.message); }
    const erros = p._erros || []; T.ok(!erros.length, nome + ": erros na página: " + erros.join(" | "));
    const horiz = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1 || document.body.scrollWidth > window.innerWidth + 1); T.ok(!horiz, nome + ": rolagem horizontal na tela");
    await ctx.close();
  }
  const txtBtn = (p, rot) => p.locator(`#atChat button:has-text("${rot}")`).first();
  const toastTxt = async (p) => p.$eval("#toast", (e) => e.textContent).catch(() => "");
  for (const [vn, vp] of [["desktop", { width: 1440, height: 900 }], ["celular", { width: 390, height: 780 }]]) {
    // 1) assumir normal: aparece "Assumindo…", vira "Devolver à Ana" na hora e uma só chamada mesmo com clique duplo
    await cenario(vn + " assumir ok", vp, async ({ p, chamadas, ctl, estado }) => {
      ctl.modo = "lento"; ctl.atraso = 700; const bt = await p.$('#atChat .hd button.pr'); T.ok(!!bt, "botão Assumir do topo deve existir");
      await bt.click(); await bt.click({ force: true, timeout: 500 }).catch(() => {}); await p.waitForTimeout(150);
      const em = await bt.evaluate((e) => ({ dis: e.disabled, busy: e.getAttribute("aria-busy"), t: e.textContent.trim() })).catch(() => null); T.ok(em && em.dis && em.busy === "true" && /Assumindo/.test(em.t), vn + ": durante a ação o botão deve mostrar 'Assumindo…' e ficar desligado: " + JSON.stringify(em));
      await p.waitForTimeout(1500); T.ok(chamadas.filter((c) => c.acao === "assumir").length === 1, vn + ": clique duplo mandou mais de uma chamada: " + chamadas.length);
      T.ok(await p.locator('#atChat button:has-text("Devolver à Ana")').count() >= 1, vn + ": depois de assumir deve aparecer 'Devolver à Ana'"); T.ok(/assumiu/i.test(await toastTxt(p)), vn + ": aviso de sucesso");
    });
    // 2) leitura velha em voo NÃO pode desfazer o resultado: a conversa lenta iniciada antes do clique devolvia o estado antigo
    await cenario(vn + " leitura velha", vp, async ({ p, ctl, estado }) => {
      ctl.convAtraso = 2500; await p.evaluate(() => { __centralTeste.AT.vooC = null; __centralTeste.buscar(); }); await p.waitForTimeout(100);   // leitura antiga em voo (estado: Ana atendendo)
      await p.locator('#atChat button.pr:has-text("Assumir")').first().click(); await p.waitForTimeout(500); ctl.convAtraso = 0;
      T.ok(await p.locator('#atChat button:has-text("Devolver à Ana")').count() >= 1, vn + ": tela voltou ao estado antigo por causa de leitura em voo");
      await p.waitForTimeout(3000); await p.evaluate(() => { __centralTeste.desenhar(true); }); await p.waitForTimeout(300); T.ok(await p.locator('#atChat button:has-text("Devolver à Ana")').count() >= 1 && (await p.evaluate(() => __centralTeste.AT.conv.v.humano)) === true, vn + ": a leitura velha terminou depois e sobrescreveu o novo estado");
    });
    // 3) erro 500 em tudo: mensagem clara, botão volta, repetiu 1 vez (idempotente), tela não muda
    await cenario(vn + " erro 500", vp, async ({ p, chamadas, ctl }) => {
      ctl.modo = "500"; const bt = await p.$('#atChat .hd button.pr'); await bt.click(); await p.waitForTimeout(2600);
      T.ok(chamadas.length === 2, vn + ": 500 deve repetir uma vez só (idempotente), chamadas=" + chamadas.length); T.ok(/servidor falhou|Toque de novo/i.test(await toastTxt(p)), vn + ": mensagem clara no 500: " + await toastTxt(p));
      const e = await bt.evaluate((x) => ({ dis: x.disabled, t: x.textContent.trim() })); T.ok(!e.dis && /Assumir/.test(e.t), vn + ": botão deve voltar a funcionar: " + JSON.stringify(e));
    });
    // 4) 409: resposta definitiva, não repete
    await cenario(vn + " 409", vp, async ({ p, chamadas, ctl }) => { ctl.modo = "409"; await p.locator('#atChat button.pr:has-text("Assumir")').first().click(); await p.waitForTimeout(800); T.ok(chamadas.length === 1, vn + ": 409 não deve repetir"); T.ok(/mudou/i.test(await toastTxt(p)), vn + ": mensagem do 409: " + await toastTxt(p)); });
    // 5) rede caída: mensagem, botão volta
    await cenario(vn + " rede caída", vp, async ({ p, chamadas, ctl }) => {
      ctl.modo = "rede"; const bt = await p.$('#atChat .hd button.pr'); await bt.click(); await p.waitForTimeout(3000);
      T.ok(/Sem conexão|conexão/i.test(await toastTxt(p)), vn + ": mensagem de rede: " + await toastTxt(p)); const e = await bt.evaluate((x) => ({ dis: x.disabled, t: x.textContent.trim() })); T.ok(!e.dis && /Assumir/.test(e.t), vn + ": botão volta depois da queda: " + JSON.stringify(e));
    });
    // 6) resposta perdida mas o servidor fez: a leitura de volta confirma e NÃO repete
    await cenario(vn + " resposta perdida", vp, async ({ p, chamadas, ctl, estado }) => {
      ctl.modo = "perde"; await p.locator('#atChat button.pr:has-text("Assumir")').first().click(); await p.waitForTimeout(1800);
      T.ok(chamadas.length === 1, vn + ": se a leitura de volta confirmou, não repete: " + chamadas.length); T.ok(/assumiu/i.test(await toastTxt(p)), vn + ": deve contar como feito: " + await toastTxt(p)); T.ok(await p.locator('#atChat button:has-text("Devolver à Ana")').count() >= 1, vn + ": tela mostra assumida");
    });
    // 7) falha passageira (502 e depois ok): o retry automático resolve sozinho
    await cenario(vn + " retry resolve", vp, async ({ p, chamadas, ctl }) => { ctl.modo = "500uma"; await p.locator('#atChat button.pr:has-text("Assumir")').first().click(); await p.waitForTimeout(2800); T.ok(chamadas.length === 2, vn + ": 1 falha + 1 retry: " + chamadas.length); T.ok(/assumiu/i.test(await toastTxt(p)), vn + ": retry deve concluir: " + await toastTxt(p)); });
    // 8) servidor lento (>8 s): mostra "Ainda fazendo…" e termina
    await cenario(vn + " servidor lento", vp, async ({ p, ctl }) => { ctl.modo = "lento"; ctl.atraso = 9500; const bt = await p.$('#atChat .hd button.pr'); await bt.click(); await p.waitForTimeout(8600); T.ok(/Ainda fazendo/.test(await bt.evaluate((x) => x.textContent)), vn + ": deve avisar que ainda está fazendo"); await p.waitForTimeout(1800); T.ok(await p.locator('#atChat button:has-text("Devolver à Ana")').count() >= 1, vn + ": termina quando o servidor responde"); });
    // 8b) servidor que NÃO responde (pendura): o tempo limite solta o botão e diz o que houve (limite encurtado para 1,5 s só no teste)
    await cenario(vn + " servidor pendurado", vp, async ({ p, ctl, chamadas }) => { await p.evaluate(() => { window.__API_LIM_TESTE = 1500; }); ctl.modo = "pendura"; const bt = await p.$('#atChat .hd button.pr'); await bt.click(); await p.waitForTimeout(5200);
      const e = await bt.evaluate((x) => ({ dis: x.disabled, t: x.textContent.trim() })); T.ok(!e.dis && /Assumir/.test(e.t), vn + ": o tempo limite deve soltar o botão: " + JSON.stringify(e)); T.ok(/demorou|conexão/i.test(await toastTxt(p)), vn + ": mensagem do tempo esgotado: " + await toastTxt(p)); });
    // 9) pausar / retomar / devolver pelo mesmo caminho
    await cenario(vn + " pausar e devolver", vp, async ({ p, chamadas, estado }) => {
      await p.locator('#atChat button.pr:has-text("Assumir")').first().click(); await p.waitForTimeout(900);
      const bp = p.locator('#atChat button:has-text("Pausar a Ana")').first(); if (await bp.count() && await bp.isVisible()) { await bp.click(); await p.waitForTimeout(900); T.ok(estado.pausado === true, vn + ": pausou"); }
      await p.locator('#atChat button.pr:has-text("Devolver à Ana")').first().click(); await p.waitForTimeout(900); T.ok(estado.humano === false, vn + ": devolveu"); T.ok(await p.locator('#atChat button.pr:has-text("Assumir")').count() >= 1, vn + ": voltou a mostrar Assumir");
    });
    // 10) passar ao Felipe: sucesso (mostra o negócio), 502 (mensagem + botão volta + aviso 'já passada'), lento, rede
    await cenario(vn + " passar ao Felipe", vp, async ({ p, chamadas, ctl, estado }) => {
      await p.evaluate(() => { __centralTeste.passar(); }); await p.waitForSelector('#modal button:has-text("Passar ao Felipe")', { timeout: 3000 });
      ctl.passarModo = "500"; const ok1 = await p.$('#modal .acoes button:last-child'); await ok1.click(); await p.waitForTimeout(700);
      T.ok(/Não consegui passar/i.test(await p.$eval("#modal .erro", (e) => e.textContent)), vn + ": erro do repasse aparece no modal"); const e1 = await ok1.evaluate((x) => ({ dis: x.disabled, t: x.textContent.trim() })); T.ok(!e1.dis && /Passar ao Felipe/.test(e1.t), vn + ": botão do repasse volta: " + JSON.stringify(e1));
      ctl.passarModo = "lento"; ctl.atraso = 900; await ok1.click(); await p.waitForTimeout(250); const e2 = await ok1.evaluate((x) => ({ dis: x.disabled, t: x.textContent.trim() })); T.ok(e2.dis && /Passando/.test(e2.t), vn + ": 'Passando…' durante: " + JSON.stringify(e2));
      await ok1.click({ force: true, timeout: 300 }).catch(() => {}); await p.waitForTimeout(1500);
      T.ok(chamadas.filter((c) => c.passar).length === 2, vn + ": 1 erro + 1 sucesso (sem clique duplo): " + chamadas.filter((c) => c.passar).length); T.ok(/47055493/.test(await toastTxt(p)), vn + ": aviso com o número do negócio: " + await toastTxt(p));
      T.ok(await p.locator("#modal.hide").count() === 1 || !(await p.$eval("#modal", (m) => !m.classList.contains("hide"))), vn + ": modal fecha no sucesso"); T.ok(await p.locator('#atChat button:has-text("Devolver à Ana")').count() >= 1, vn + ": conversa aparece assumida depois do repasse");
      await p.evaluate(() => { __centralTeste.passar(); }); await p.waitForSelector("#modal .hint", { timeout: 2000 }); T.ok(/já foi passada ao Felipe/i.test(await p.$eval("#modal", (m) => m.textContent)), vn + ": aviso de repasse anterior");
    });
    await cenario(vn + " passar rede caída", vp, async ({ p, ctl }) => {
      await p.route(/passar-felipe/, (r) => r.abort()); await p.evaluate(() => { __centralTeste.passar(); }); await p.waitForSelector('#modal button:has-text("Passar ao Felipe")', { timeout: 3000 });
      const ok1 = await p.$('#modal .acoes button:last-child'); await ok1.click(); await p.waitForTimeout(1500); const er = await p.$eval("#modal .erro", (e) => e.textContent); T.ok(/Sem conexão/.test(er) && /confira/i.test(er), vn + ": mensagem de rede no repasse: " + er); const e1 = await ok1.evaluate((x) => x.disabled); T.ok(!e1, vn + ": botão do repasse volta depois da queda");
    });
  }
  await b.close(); T.fim();
})();
