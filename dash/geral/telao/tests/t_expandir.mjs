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
      const tokensCard = await f().evaluate(sel => { const c = document.querySelector(sel).closest('.card,.s2-card'); const out = new Set(), w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const e = n.parentElement; if (e.closest('.card-hd,.s2-ch,.expand-btn,.xp-btn,.lb-ph,script,style')) continue; const t = n.textContent.replace(/\s+/g, ''); if (t.length > 1) out.add(t); } return [...out]; }, sel);
      // abre pelo teclado (foco + Enter)
      await f().press(sel, 'Enter'); await p.waitForTimeout(350);
      const st = await f().evaluate(() => {
        const ov = document.getElementById('expandOverlay'); if (!ov.classList.contains('show')) return { aberto: false };
        const m = ov.querySelector('.expand-modal'), body = document.getElementById('expandModalBody');
        const fontes = []; body.querySelectorAll('*').forEach(e => { const own = [...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim()); if (!own || e.closest('svg')) return; const cs = getComputedStyle(e); if (cs.display === 'none') return; fontes.push(parseFloat(cs.fontSize)); });
        const rows = body.querySelectorAll('tbody tr,.lb-row,.feed-row,.abar-row,.funil-row,.bia-motor-row,.stat-row,.s2-mr,.mdeal-row,.orig-item').length;
        const vw = window.innerWidth, vh = window.innerHeight, R = e => e.getBoundingClientRect();
        const mr = R(m), orr = R(ov), hd = m.querySelector('.expand-modal-hd'), hr = R(hd), br = R(body), cs = getComputedStyle(ov);
        const topo = [[2, 2], [vw - 3, 2], [2, vh - 3], [vw - 3, vh - 3], [vw / 2, vh - 3], [vw / 2, 2]].map(([x, y]) => { const e = document.elementFromPoint(x, y); return !!(e && ov.contains(e)); }).every(Boolean);
        const centro = (() => { const e = document.elementFromPoint(mr.x + mr.width / 2, mr.y + mr.height / 2); return !!(e && m.contains(e)); })();
        let vaza = 0, vazaEl = ''; body.querySelectorAll('*').forEach(e => { if (e.closest('svg') && e.tagName !== 'svg') return; const r = R(e); if (r.width < 1 || getComputedStyle(e).display === 'none') return; if (e.closest('.ga4-table-scroll,.xp-hs')) return; const ex = Math.max(r.right - br.right, br.left - r.left); if (ex > 2 && ex > vaza) { vaza = ex; vazaEl = e.tagName + '.' + String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className).slice(0, 25); } });
        const folhas = []; body.querySelectorAll('*').forEach(e => { if (e.closest('svg')) return; if (![...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim())) return; const r = R(e), c2 = getComputedStyle(e); if (r.width < 2 || r.height < 2 || c2.display === 'none' || c2.visibility === 'hidden') return; folhas.push([e, r]); });
        let sobre = 0, sobreEx = ''; for (let i = 0; i < folhas.length && i < 500; i++) for (let j = i + 1; j < folhas.length && j < 500; j++) { const [a, ra] = folhas[i], [b2, rb] = folhas[j]; if (a.contains(b2) || b2.contains(a)) continue; const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top); if (w > 3 && h > 3 && w * h > 30) { sobre++; if (!sobreEx) sobreEx = (a.textContent.trim().slice(0, 18) + ' x ' + b2.textContent.trim().slice(0, 18)); } }
        let img = ''; body.querySelectorAll('svg,img,canvas').forEach(e => { if (e.parentElement.closest('svg')) return; const r = R(e); if (!r.width) return; if (r.right - br.right > 2 || r.left - br.left < -2) img = 'grafico passa da borda lateral'; if (r.height > body.clientHeight + 1 && !e.closest('.orig-ring')) img = 'grafico maior que a area visivel do painel (' + Math.round(r.height) + ' > ' + body.clientHeight + ')'; const nw = e.naturalWidth, nh = e.naturalHeight; if (nw && nh && Math.abs(r.width / r.height - nw / nh) / (nw / nh) > 0.08) img = 'imagem deformada'; const vb = e.tagName === 'svg' && e.getAttribute('viewBox'); if (vb && !/none/.test(e.getAttribute('preserveAspectRatio') || '')) { const q = vb.split(/[\s,]+/).map(Number); if (q[2] && q[3] && !e.classList.contains('orig-svg')) { const esc = r.width / q[2]; if (esc > 1.65) img = 'texto do grafico ampliado ' + esc.toFixed(2) + 'x'; if (Math.abs(r.height / r.width - q[3] / q[2]) / (q[3] / q[2]) > 0.05) img = 'svg deformado'; } } if (e.tagName === 'CANVAS' && r.width > 0 && (r.height < 120)) img = 'canvas espremido'; });
        const grade = []; for (let gx = 1; gx < 6; gx++) for (let gy = 1; gy < 5; gy++) { const e = document.elementFromPoint(vw * gx / 6, vh * gy / 5); if (!(e && ov.contains(e))) grade.push(gx + ',' + gy); }
        const vazio = body.scrollHeight < 40;
        return { vw, vh, modal: [Math.round(mr.left), Math.round(mr.top), Math.round(mr.right), Math.round(mr.bottom)], dentro: mr.left >= 0 && mr.top >= 0 && mr.right <= vw + 0.5 && mr.bottom <= vh + 0.5, margem: Math.min(mr.left, mr.top, vw - mr.right, vh - mr.bottom), cobre: orr.width >= vw - 1 && orr.height >= vh - 1 && cs.position === 'fixed', topo, centro, hdFixo: Math.abs(hr.top - mr.top) < 2 && hr.height > 20, scrollInterno: body.scrollHeight > body.clientHeight + 1 ? getComputedStyle(body).overflowY : 'cabe', vaza, vazaEl, sobre, sobreEx, img, bodyH: Math.round(br.height), grade: grade.length, canvasEmBranco: [...body.querySelectorAll('canvas')].some(c => { try { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4 * 97) if (d[i]) return false; return true; } catch (e) { return false; } }), aberto: true, titulo: document.getElementById('expandModalTitle').textContent, conteudo: body.textContent.trim().length + 50 * body.querySelectorAll('svg,img,canvas').length, hscroll: body.scrollWidth - body.clientWidth, menorFonte: Math.min(...fontes, 99), rows, busca: !!ov.querySelector('.xp-tools input'), sort: ov.querySelectorAll('.xp-sort').length, modalH: Math.round(m.getBoundingClientRect().height), foco: ov.contains(document.activeElement) };
      });
      if (st.aberto) { const falta = await f().evaluate(tk => { const t = (document.getElementById('expandModalTitle').textContent + document.getElementById('expandModalBody').textContent).replace(/\s+/g, ''); return tk.filter(w => t.indexOf(w) < 0); }, tokensCard); if (falta.length) falha(`${v} p${k} "${c.nome}": expandido nao traz o que o cartao mostra (faltam ${falta.length}: ${falta.slice(0, 4).join(' ')})`); }
      if (!st.aberto) { falha(`${v} p${k} "${c.nome}": nao abriu pelo teclado`); continue; }
      if (!st.dentro) falha(`${v} p${k} "${c.nome}": painel ${st.modal} passa da tela ${st.vw}x${st.vh}`);
      if (st.margem < 4) falha(`${v} p${k} "${c.nome}": painel sem margem (${st.margem}px)`);
      if (!st.cobre) falha(`${v} p${k} "${c.nome}": fundo nao cobre a tela toda`);
      if (!st.topo) falha(`${v} p${k} "${c.nome}": algo fica por cima do fundo/painel (z-index)`);
      if (st.grade) falha(`${v} p${k} "${c.nome}": ${st.grade} pontos da tela com elemento de fora por cima do painel`);
      if (st.canvasEmBranco) falha(`${v} p${k} "${c.nome}": grafico em branco no painel`);
      if (!st.centro) falha(`${v} p${k} "${c.nome}": centro do painel coberto por outro elemento`);
      if (!st.hdFixo) falha(`${v} p${k} "${c.nome}": cabecalho do painel nao esta fixo no topo`);
      if (st.bodyH < 60) falha(`${v} p${k} "${c.nome}": corpo do painel espremido (${st.bodyH}px)`);
      if (st.scrollInterno !== 'cabe' && !/auto|scroll/.test(st.scrollInterno)) falha(`${v} p${k} "${c.nome}": conteudo maior que o painel sem rolagem interna`);
      if (st.vaza > 2) falha(`${v} p${k} "${c.nome}": ${st.vazaEl} passa ${Math.round(st.vaza)}px da borda do painel`);
      if (st.sobre > 0) falha(`${v} p${k} "${c.nome}": ${st.sobre} textos sobrepostos (${st.sobreEx})`);
      if (st.img) falha(`${v} p${k} "${c.nome}": ${st.img}`);
      if (st.conteudo < 3) falha(`${v} p${k} "${c.nome}": expandido sem conteudo`);
      if (st.hscroll > 2) falha(`${v} p${k} "${c.nome}": rolagem horizontal no expandido (${st.hscroll}px)`);
      if (st.menorFonte < 9 - 0.01) falha(`${v} p${k} "${c.nome}": fonte ${st.menorFonte}px no expandido`);
      if (!st.foco) falha(`${v} p${k} "${c.nome}": foco nao foi para o expandido`);
      const def = await p.evaluate(() => { const fr = document.getElementById('palco'); if (!fr) return null; const r = fr.getBoundingClientRect(); return { sx: r.width / fr.offsetWidth, sy: r.height / fr.offsetHeight, dentro: r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 }; });
      if (def && (Math.abs(def.sx - def.sy) > 0.01 || !def.dentro)) falha(`${v} p${k} "${c.nome}": palco deformado/fora da tela (${def.sx.toFixed(3)} x ${def.sy.toFixed(3)})`);
      const trava = await f().evaluate(() => { const y0 = scrollY; scrollBy(0, 400); const mexeu = scrollY !== y0; scrollTo(0, y0); return { mexeu }; });
      if (trava.mexeu) falha(`${v} p${k} "${c.nome}": a pagina por tras rola com o painel aberto`);
      const cadeia = await f().evaluate(() => { const sc = [...document.querySelectorAll('*')].filter(e => !e.closest('#expandOverlay') && e.scrollHeight > e.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(e).overflowY)); return { n: sc.length, y0: scrollY, tops: sc.map(e => e.scrollTop) }; });
      const mr0 = await f().evaluate(() => { const r = document.querySelector('#expandOverlay .expand-modal').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
      const fr = await p.evaluate(() => { const e = document.getElementById('palco'); if (!e) return [0, 0, 1]; const r = e.getBoundingClientRect(); return [r.left, r.top, r.width / e.offsetWidth]; });
      await p.mouse.move(fr[0] + mr0[0] * fr[2], fr[1] + mr0[1] * fr[2]); await p.mouse.wheel(0, 4000); await p.waitForTimeout(150);
      const cadeia2 = await f().evaluate(() => { const sc = [...document.querySelectorAll('*')].filter(e => !e.closest('#expandOverlay') && e.scrollHeight > e.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(e).overflowY)); return { y0: scrollY, tops: sc.map(e => e.scrollTop) }; });
      if (cadeia.y0 !== cadeia2.y0 || cadeia.tops.join() !== cadeia2.tops.join()) falha(`${v} p${k} "${c.nome}": rolar o painel rola a pagina/lista por tras`);
      await f().evaluate(() => { document.getElementById('expandModalBody').scrollTop = 0; });
      // busca e ordenacao
      if (st.busca && st.rows >= 6) {
        const r = await f().evaluate(() => { const ov = document.getElementById('expandOverlay'), inp = ov.querySelector('.xp-tools input'), cnt = ov.querySelector('.xp-count'); inp.value = 'zzzz_nada'; inp.dispatchEvent(new Event('input')); const vazio = cnt.textContent; inp.value = ''; inp.dispatchEvent(new Event('input')); return { vazio, cheio: cnt.textContent }; });
        if (!/^0 de /.test(r.vazio)) falha(`${v} "${c.nome}": busca sem resultado nao zerou (${r.vazio})`);
      }
      if (st.sort) {
        const r = await f().evaluate(() => { const th = document.querySelector('#expandOverlay .xp-sort'); const tb = th.closest('table').tBodies[0]; const a = [...tb.rows].map(x => x.textContent); th.click(); const b2 = [...tb.rows].map(x => x.textContent); return { mudou: a.join('|') !== b2.join('|'), aria: th.getAttribute('aria-sort'), mesmoTotal: a.length === b2.length }; });
        if (!r.aria || r.aria === 'none' || !r.mesmoTotal) falha(`${v} "${c.nome}": ordenar por coluna nao funcionou`);
      }
      if (st.rows >= 6 && st.busca) {
        const lv = await f().evaluate(async sel => {
          const body = document.getElementById('expandModalBody'), inp = document.querySelector('#expandOverlay .xp-tools input');
          inp.value = 'a'; inp.dispatchEvent(new Event('input')); body.scrollTop = Math.min(40, body.scrollHeight - body.clientHeight);
          const st0 = body.scrollTop, card = document.querySelector(sel).closest('.card,.s2-card');
          const alvo = [...card.querySelectorAll('*')].reverse().find(e => !e.children.length && /\S/.test(e.textContent) && !e.closest('.card-hd,.s2-ch,.expand-btn,.xp-btn,.lb-ph'));
          if (!alvo) return { ok: true, sem: true };
          const orig = alvo.textContent; alvo.textContent = orig + ' zz9';
          let visto = false; for (let i = 0; i < 14 && !visto; i++) { await new Promise(r => setTimeout(r, 200)); visto = body.textContent.indexOf('zz9') >= 0; }
          const renovou = !card.contains(alvo) || alvo.textContent.indexOf('zz9') < 0; if (alvo.textContent.indexOf('zz9') >= 0) alvo.textContent = orig;
          return { ok: visto || renovou, scroll: Math.abs(body.scrollTop - st0) <= 1, busca: inp.isConnected ? true : document.querySelector('#expandOverlay .xp-tools input').value === 'a' };
        }, sel);
        if (!lv.ok) falha(`${v} p${k} "${c.nome}": dados renovados com o painel aberto nao aparecem no painel`);
        if (lv.scroll === false) falha(`${v} p${k} "${c.nome}": painel perdeu a rolagem ao renovar os dados`);
        if (lv.busca === false) falha(`${v} p${k} "${c.nome}": painel perdeu a busca ao renovar os dados`);
      }
      await f().evaluate(({ sel, nome }) => { if (document.querySelector(sel)) return; const h = [...document.querySelectorAll('.card-hd[data-x],.s2-ch[data-x]')].find(x => x.offsetParent !== null && x.textContent.trim().startsWith(nome.slice(0, 12))); if (h) h.setAttribute('data-tid', sel.match(/"(.*)"/)[1]); }, { sel, nome: c.nome });
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
