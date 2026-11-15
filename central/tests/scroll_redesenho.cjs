// Central: PULO PARA O TOPO ao atualizar (17/11). Em TODAS as abas, cada redesenho (automático ou manual) preserva rolagem da página, de caixas roláveis, foco, seleção de texto e texto digitado; ação do usuário (salvar) ainda limpa o campo.
// Rodar: node central/tests/scroll_redesenho.cjs <playwright-core> <chromium>
const { chromium } = require(process.argv[2]); const B = require("./_base.cjs"); const T = B.suite("scroll_redesenho");
const atualizar = (p) => p.evaluate(() => document.getElementById("btnAtualizar").click());   // clique por script: o clique do Playwright rola a página até o botão e embaralharia a medida
const ABAS = ["visao", "bia", "chaves", "filas", "calendario", "atendimento", "ana", "historico", "atalhos", "ecossistema", "usuarios", "conta"];
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  let rolaveis = 0, abasRolaveis = 0;
  for (const [w, h] of [[390, 500], [1440, 420]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const mock = B.criarMock(); const p = await B.novaPagina(ctx, mock); await B.entrar(p, "");
    await p.addStyleTag({ content: "#conteudo .card,#conteudo .pn,#conteudo .it,#conteudo .tw,#conteudo .list{max-height:110px!important;overflow:auto!important}" });   // força caixas roláveis dentro das telas para provar que a rolagem INTERNA também volta
    await p.evaluate(() => { window.__ys = []; window.addEventListener("scroll", () => window.__ys.push(window.pageYOffset), { passive: true }); });
    for (const hs of ABAS) {
      await p.evaluate((x) => { location.hash = "#" + x; }, hs); await p.waitForTimeout(500); if (hs === "atendimento") continue;   // o Atendimento tem o próprio mecanismo (scroll_hash.cjs / scroll_leitura.cjs)
      const info = await p.evaluate(() => { const max = document.documentElement.scrollHeight - window.innerHeight; const y = Math.max(0, Math.min(Math.floor(max * 0.6), max)); window.scrollTo(0, y);
        const cx = document.getElementById("conteudo"); const rol = []; cx.querySelectorAll("*").forEach((e, i) => { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 20) { e.scrollTop = 25; rol.push(i); } else if (/(auto|scroll)/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 20) { e.scrollLeft = 20; rol.push(i); } });
        const sel = (() => { const ps = cx.querySelectorAll("p,td,span,h4,h3"); for (const e of ps) if (e.firstChild && e.firstChild.nodeType === 3 && e.firstChild.length > 12) { const r = document.createRange(); r.setStart(e.firstChild, 2); r.setEnd(e.firstChild, 9); const s = getSelection(); s.removeAllRanges(); s.addRange(r); return s.toString(); } return ""; })();
        return { max, y: window.pageYOffset, rol, sel, n: cx.querySelectorAll("*").length }; });
      if (info.max > 40) abasRolaveis++; rolaveis += info.rol.length;
      for (let i = 0; i < 3; i++) {
        await p.evaluate(() => { window.__ys = []; }); await atualizar(p); await p.waitForTimeout(700);
        const dep = await p.evaluate((rol) => { const cx = document.getElementById("conteudo"); const all = cx.querySelectorAll("*"); return { y: window.pageYOffset, min: Math.min(...window.__ys, window.pageYOffset), rol: rol.map((i) => all[i] ? [all[i].scrollTop, all[i].scrollLeft] : null), sel: getSelection().toString() }; }, info.rol);
        T.ok(Math.abs(dep.y - info.y) <= 2, `[${w}] #${hs} atualização ${i + 1}: rolagem ${info.y} -> ${dep.y}`);
        T.ok(dep.min >= info.y - 2, `[${w}] #${hs} atualização ${i + 1}: a página PULOU (mín. ${dep.min}, antes ${info.y})`);
        dep.rol.forEach((r, k) => T.ok(r && (r[0] >= 20 || r[1] >= 15), `[${w}] #${hs}: caixa rolável #${info.rol[k]} voltou ao topo (${JSON.stringify(r)})`));
        if (info.sel) T.ok(dep.sel === info.sel, `[${w}] #${hs}: seleção de texto perdida ("${info.sel}" -> "${dep.sel}")`);
      }
    }
    // mesmo clicando no item do menu da aba atual (redesenho manual) o link não deve estar quebrado e a tela troca normalmente de aba
    T.ok(!(p._erros || []).length, `[${w}] erros de script: ${p._erros}`); await ctx.close();
  }
  // foco + texto digitado + seleção do cursor sobrevivem à atualização automática (Calendário: dia/motivo; Minha conta: senhas)
  for (const [w, h] of [[390, 700], [1440, 800]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const mock = B.criarMock(); const p = await B.novaPagina(ctx, mock); await B.entrar(p, "#calendario"); await p.waitForSelector("#calMot");
    await p.fill("#calMot", "Recesso da equipe de fim de ano"); await p.focus("#calMot"); await p.evaluate(() => document.getElementById("calMot").setSelectionRange(8, 14)); await p.fill("#calDia", "2030-01-05"); await p.focus("#calMot"); await p.evaluate(() => document.getElementById("calMot").setSelectionRange(8, 14));
    for (let i = 0; i < 4; i++) { await atualizar(p); await p.waitForTimeout(600); }
    const r = await p.evaluate(() => { const e = document.getElementById("calMot"); return { v: e.value, d: document.getElementById("calDia").value, foco: document.activeElement && document.activeElement.id, a: e.selectionStart, f: e.selectionEnd }; });
    T.ok(r.v === "Recesso da equipe de fim de ano", `[${w}] texto digitado sumiu: "${r.v}"`); T.ok(r.d === "2030-01-05", `[${w}] data digitada sumiu: ${r.d}`); T.ok(r.foco === "calMot", `[${w}] foco saiu do campo: ${r.foco}`); T.ok(r.a === 8 && r.f === 14, `[${w}] seleção do cursor mudou: ${r.a}-${r.f}`);
    // ação do usuário (salvar) continua limpando o campo: o POST responde 200 e a tela se refaz "limpa"
    mock.handler; await p.click("button:has-text('Marcar folga')"); await p.waitForTimeout(900); const dep = await p.evaluate(() => ({ v: document.getElementById("calMot").value, d: document.getElementById("calDia").value })); T.ok(dep.v === "" && dep.d === "", `[${w}] depois de salvar o campo deveria nascer limpo: ${JSON.stringify(dep)}`);
    await p.goto(B.BASE + "#conta"); await p.waitForSelector("#cNova"); await p.fill("#cNova", "SenhaNova123"); await p.focus("#cNova"); for (let i = 0; i < 3; i++) { await atualizar(p); await p.waitForTimeout(600); }
    T.ok((await p.inputValue("#cNova")) === "SenhaNova123", `[${w}] senha digitada sumiu na atualização`); T.ok(await p.evaluate(() => document.activeElement.id) === "cNova", `[${w}] foco da senha perdido`);
    T.ok(!(p._erros || []).length, "erros: " + p._erros); await ctx.close();
  }
  // a atualização de 45 s (temporizador de verdade) também preserva: acelera o relógio da página
  { const ctx = await b.newContext({ viewport: { width: 390, height: 500 } }); await ctx.addInitScript(() => { const si = window.setInterval; window.setInterval = (f, ms, ...a) => si(f, ms === 45000 ? 700 : ms, ...a); }); const mock = B.criarMock(); const p = await B.novaPagina(ctx, mock); await B.entrar(p, "#bia");
    const y = await p.evaluate(() => { const max = document.documentElement.scrollHeight - innerHeight; window.scrollTo(0, Math.floor(max / 2)); return pageYOffset; }); const n0 = mock.log.filter((x) => x.u === "/estado").length; await p.waitForTimeout(3500); const n1 = mock.log.filter((x) => x.u === "/estado").length;
    T.ok(n1 - n0 >= 3, "o temporizador acelerado não rodou (" + (n1 - n0) + ")"); T.ok(y > 100, "a aba Bia deveria ser rolável (y=" + y + ")"); T.ok(Math.abs((await p.evaluate(() => pageYOffset)) - y) <= 2, "atualização automática moveu a rolagem"); await ctx.close(); }
  await b.close(); T.fim(` (abas roláveis testadas: ${abasRolaveis}; caixas roláveis internas: ${rolaveis})`);
})();
