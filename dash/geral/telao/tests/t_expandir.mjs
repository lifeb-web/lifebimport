// TESTE 3 · cartao expandivel. Para TODO cartao de TODA aba/pagina: abre pelo titulo (clique e teclado) e pelo botao, confere conteudo,
// fonte minima dentro do expandido, sem rolagem horizontal, Esc/x/clique fora fecham, o foco volta, e a grade NAO se mexe (nenhum cartao muda de lugar).
// Listas longas: busca filtra e ordenacao por coluna ordena. uso: node t_expandir.mjs [W H]
import { abrir, VIEWS, ir, per, ori, pagina, nPaginas } from './telao_lib.mjs';
const W = +(process.argv[2] || 1920), H = +(process.argv[3] || 1080);
const { b, p, f } = await abrir(W, H);
let falhas = 0, testados = 0; const lin = [];
const falha = (m) => { falhas++; console.log('  FALHOU: ' + m); };
const rects = () => f().evaluate(() => [...document.querySelectorAll('#body .card,#s2-root .s2-card,.kchip,.achip,.s2-k')].filter(e => e.offsetParent !== null).map(e => { const r = e.getBoundingClientRect(); return [e.id || e.className.slice(0, 20), Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(':'); }).join('|'));
for (const v of VIEWS) {
  await ir(f(), v); await per(f(), v === 'ga4' || v === 'bia' ? 'today' : 'month'); await ori(f(), 'both'); await p.waitForTimeout(v === 'sdr' ? 3500 : 2200);
  const n = await nPaginas(f());
  for (let k = 1; k <= n; k++) {
    await pagina(f(), k); await p.waitForTimeout(600);
    const cards = await f().evaluate(() => { document.querySelectorAll('[data-tid]').forEach(e => e.removeAttribute('data-tid')); return [...document.querySelectorAll('#body .card-hd[data-x],#s2-root .s2-ch[data-x]')].filter(h => h.offsetParent !== null && h.closest('.card,.s2-card').offsetParent !== null).map((h, i) => { h.setAttribute('data-tid', 't' + i); return { tid: 't' + i, nome: h.closest('.card,.s2-card').querySelector('.card-hd-title,.s2-ct').textContent.trim() }; }); });
    for (const c of cards) {
      testados++;
      const antes = await rects();
      const sel = `[data-tid="${c.tid}"]`;
      // abre pelo teclado (foco + Enter)
      await f().press(sel, 'Enter'); await p.waitForTimeout(350);
      const st = await f().evaluate(() => {
        const ov = document.getElementById('expandOverlay'); if (!ov.classList.contains('show')) return { aberto: false };
        const m = ov.querySelector('.expand-modal'), body = document.getElementById('expandModalBody');
        const fontes = []; body.querySelectorAll('*').forEach(e => { const own = [...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim()); if (!own || e.closest('svg')) return; const cs = getComputedStyle(e); if (cs.display === 'none') return; fontes.push(parseFloat(cs.fontSize)); });
        const rows = body.querySelectorAll('tbody tr,.lb-row,.feed-row,.abar-row,.funil-row,.bia-motor-row,.stat-row,.s2-mr,.mdeal-row,.orig-item').length;
        return { aberto: true, titulo: document.getElementById('expandModalTitle').textContent, conteudo: body.textContent.trim().length + 50 * body.querySelectorAll('svg,img,canvas').length, hscroll: body.scrollWidth - body.clientWidth, menorFonte: Math.min(...fontes, 99), rows, busca: !!ov.querySelector('.xp-tools input'), sort: ov.querySelectorAll('.xp-sort').length, modalH: Math.round(m.getBoundingClientRect().height), foco: ov.contains(document.activeElement) };
      });
      if (!st.aberto) { falha(`${v} p${k} "${c.nome}": nao abriu pelo teclado`); continue; }
      if (st.conteudo < 3) falha(`${v} p${k} "${c.nome}": expandido sem conteudo`);
      if (st.hscroll > 2) falha(`${v} p${k} "${c.nome}": rolagem horizontal no expandido (${st.hscroll}px)`);
      if (st.menorFonte < 9 - 0.01) falha(`${v} p${k} "${c.nome}": fonte ${st.menorFonte}px no expandido`);
      if (!st.foco) falha(`${v} p${k} "${c.nome}": foco nao foi para o expandido`);
      // busca e ordenacao
      if (st.busca && st.rows >= 6) {
        const r = await f().evaluate(() => { const ov = document.getElementById('expandOverlay'), inp = ov.querySelector('.xp-tools input'), cnt = ov.querySelector('.xp-count'); inp.value = 'zzzz_nada'; inp.dispatchEvent(new Event('input')); const vazio = cnt.textContent; inp.value = ''; inp.dispatchEvent(new Event('input')); return { vazio, cheio: cnt.textContent }; });
        if (!/^0 de /.test(r.vazio)) falha(`${v} "${c.nome}": busca sem resultado nao zerou (${r.vazio})`);
      }
      if (st.sort) {
        const r = await f().evaluate(() => { const th = document.querySelector('#expandOverlay .xp-sort'); const tb = th.closest('table').tBodies[0]; const a = [...tb.rows].map(x => x.textContent); th.click(); const b2 = [...tb.rows].map(x => x.textContent); return { mudou: a.join('|') !== b2.join('|'), aria: th.getAttribute('aria-sort'), mesmoTotal: a.length === b2.length }; });
        if (!r.aria || r.aria === 'none' || !r.mesmoTotal) falha(`${v} "${c.nome}": ordenar por coluna nao funcionou`);
      }
      // Esc fecha e devolve o foco
      await f().press('#expandModalClose', 'Escape'); await p.waitForTimeout(250);
      const fim = await f().evaluate(s => ({ aberto: document.getElementById('expandOverlay').classList.contains('show'), foco: document.activeElement && document.activeElement.closest && !!document.activeElement.closest('.card,.s2-card') }), sel);
      if (fim.aberto) falha(`${v} "${c.nome}": Esc nao fechou`);
      if (!fim.foco) falha(`${v} "${c.nome}": foco nao voltou ao cartao`);
      // grade intacta
      const depois = await rects(); if (antes !== depois) falha(`${v} p${k} "${c.nome}": abrir/fechar mexeu na grade`);
      lin.push([v, k, c.nome, st.rows, st.busca ? 'busca' : '-', st.sort ? 'ordena' : '-', st.menorFonte]);
    }
    // botao e clique fora (1 por pagina)
    if (cards.length) {
      await f().evaluate(() => document.querySelector('[data-tid="t0"]').closest('.card,.s2-card').querySelector('.expand-btn,.xp-btn').click()); await p.waitForTimeout(300);
      let abriu = await f().evaluate(() => document.getElementById('expandOverlay').classList.contains('show')); if (!abriu) falha(`${v} p${k}: botao ⤢ nao abriu`);
      await f().evaluate(() => document.getElementById('expandModalClose').click()); await p.waitForTimeout(200);
      await f().evaluate(() => document.querySelector('[data-tid="t0"]').click()); await p.waitForTimeout(300);
      await f().evaluate(() => document.getElementById('expandOverlay').dispatchEvent(new MouseEvent('click', { bubbles: true }))); await p.waitForTimeout(200);
      abriu = await f().evaluate(() => document.getElementById('expandOverlay').classList.contains('show')); if (abriu) falha(`${v} p${k}: clique fora nao fechou`);
    }
  }
}
const js = [...new Set(p.errs)].filter(e => !/Failed to load|ERR_FAILED|HTTP4|HTTP5/.test(e));
if (js.length) { falhas += js.length; console.log('erros JS:', js.slice(0, 5)); }
console.log(lin.map(l => l.join(' | ')).join('\n'));
console.log(`${testados} cartoes expandidos: ${falhas ? 'FALHAS ' + falhas : 'TUDO OK'}`);
await b.close(); process.exit(falhas ? 1 : 0);
