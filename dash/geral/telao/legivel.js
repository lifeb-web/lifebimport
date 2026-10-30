/* ============================================================================
 * TELÃO LEGÍVEL (30/10/2026): páginas que trocam sozinhas + cartão expandido.
 *
 * PÁGINAS: cada aba tem 1 a 3 "páginas". O que é essencial fica sempre na tela, grande; o resto vira
 * página que alterna sozinha (padrão 20 s). Elementos marcados com data-pg="1", "2", "1 2"... aparecem
 * só nas páginas listadas (regra em legivel.css). Indicador no rodapé: setas, pontos clicáveis, pausa.
 *   - passar o mouse ou tocar no painel pausa a troca;
 *   - teclas: seta direita/esquerda trocam de página, espaço pausa/retoma, Esc fecha o expandido;
 *   - URL: ?pagina=2 abre direto na página 2; ?rot=0 desliga a troca automática; ?seg=30 muda os segundos.
 *
 * EXPANDIR: o botão ⤢ (ou clicar/tocar no título do cartão) abre o cartão grande, com a lista COMPLETA,
 * busca e ordenação por coluna. Esc, "x" ou clique fora fecham; o foco volta para o cartão.
 * ========================================================================== */
(function () {
  'use strict';
  var PAGES = { vendas: 1, ltv: 1, sdr: 3, ads: 1, ga4: 2, bia: 2 };
  var NOMES = {
    vendas: ['Painel'],
    ltv: ['Painel'],
    sdr: ['Gráficos e atividades', 'Etapas e origem', 'Motivos e histórico'],
    ads: ['Painel'],
    ga4: ['Conversão e visitantes', 'Cidades, origem e páginas'],
    bia: ['Saúde ao vivo', 'Motor e custos']
  };
  var q = location.search;
  function param(n) { var m = new RegExp('[?&]' + n + '=([^&]*)').exec(q); return m ? decodeURIComponent(m[1]) : null; }
  var SEG = Math.max(5, parseInt(param('seg') || '20', 10) || 20);
  var S = { view: 'vendas', cur: 1, auto: param('rot') !== '0', left: SEG, hold: 0, ext: null };
  var body = document.body;

  function nPages() { return (PAGES[S.view] || 1); }
  function pagerEl() { return document.getElementById('pager'); }

  function montaPager() {
    var f = document.querySelector('footer');
    if (!f || pagerEl()) return;
    f.style.position = 'relative';
    var d = document.createElement('div'); d.id = 'pager'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Páginas do telão');
    f.appendChild(d);
    d.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pg-go]'); if (!b) return;
      var v = b.getAttribute('data-pg-go');
      if (v === 'prev') set(S.cur - 1 < 1 ? nPages() : S.cur - 1, true);
      else if (v === 'next') set(S.cur + 1 > nPages() ? 1 : S.cur + 1, true);
      else set(+v, true);
    });
  }

  function desenha() {
    var d = pagerEl(); if (!d) return;
    var n = nPages();
    body.setAttribute('data-view', S.view);
    body.setAttribute('data-pg', S.cur);
    body.setAttribute('data-npg', n);
    var btn = document.getElementById('tv-toggle');
    if (btn) { btn.textContent = S.auto ? '⏸' : '▶'; btn.classList.toggle('active', !S.auto); btn.setAttribute('aria-pressed', S.auto ? 'false' : 'true'); }
    if (n < 2) { d.style.display = 'none'; return; }
    d.style.display = 'flex';
    var nome = (NOMES[S.view] || [])[S.cur - 1] || '';
    var h = '<button type="button" class="pg-b" data-pg-go="prev" aria-label="Página anterior">‹</button>';
    for (var i = 1; i <= n; i++) h += '<button type="button" class="pg-dot' + (i === S.cur ? ' on' : '') + '" data-pg-go="' + i + '" aria-label="Página ' + i + ' de ' + n + ': ' + ((NOMES[S.view] || [])[i - 1] || '') + '" aria-current="' + (i === S.cur ? 'true' : 'false') + '"><i></i></button>';
    h += '<button type="button" class="pg-b" data-pg-go="next" aria-label="Próxima página">›</button>';
    h += '<span class="pg-t" id="pg-t">' + S.cur + '/' + n + ' · ' + nome + (S.auto ? ' · troca em ' + S.left + 's' : ' · pausado') + '</span>';
    d.innerHTML = h;
  }
  function texto() {
    var t = document.getElementById('pg-t'); if (!t) return;
    var n = nPages(), nome = (NOMES[S.view] || [])[S.cur - 1] || '';
    t.textContent = S.cur + '/' + n + ' · ' + nome + (S.auto ? (S.hold ? ' · pausado (mouse)' : ' · troca em ' + S.left + 's') : ' · pausado');
  }

  function set(k, manual) {
    var n = nPages();
    k = Math.max(1, Math.min(n, +k || 1));
    var mudou = k !== S.cur;
    S.cur = k; S.left = SEG;
    desenha();
    if (mudou || manual) {
      // gráficos e listas que mediram o tamanho enquanto escondidos precisam medir de novo
      try { window.dispatchEvent(new Event('resize')); } catch (e) {}
      try { document.dispatchEvent(new CustomEvent('lbpage', { detail: { view: S.view, page: k } })); } catch (e) {}
    }
  }

  function overlayAberto() {
    return !!document.querySelector('.expand-overlay.show,#modal-overlay.show,#custom-panel.show,#month-pick-panel.show');
  }
  function tick() {
    if (nPages() < 2 || !S.auto) { return; }
    if (S.hold || overlayAberto() || document.hidden) { texto(); return; }
    S.left--;
    if (S.left <= 0) { set(S.cur + 1 > nPages() ? 1 : S.cur + 1, false); } else texto();
  }

  var api = {
    count: function () { return nPages(); },
    cur: function () { return S.cur; },
    set: set,
    view: function () { return S.view; },
    onView: function (v) { if (!PAGES[v]) v = 'vendas'; S.view = v; S.cur = 1; S.left = SEG; desenha(); try { window.dispatchEvent(new Event('resize')); } catch (e) {} },
    toggle: function () { S.auto = !S.auto; S.left = SEG; desenha(); },
    pause: function (on) { S.auto = !on; desenha(); }
  };
  window.LB_PG = api; window.__pg = api;

  function init() {
    montaPager();
    var act = document.querySelector('.ochip[data-v].active');
    S.view = act ? act.getAttribute('data-v') : 'vendas';
    var p0 = parseInt(param('pagina') || '1', 10);
    S.cur = Math.max(1, Math.min(nPages(), p0 || 1));
    desenha();
    var b = document.getElementById('body');
    if (b) {
      b.addEventListener('mouseenter', function () { S.hold = 1; texto(); });
      b.addEventListener('mouseleave', function () { S.hold = 0; S.left = Math.max(S.left, 8); texto(); });
      b.addEventListener('touchstart', function () { S.hold = 1; clearTimeout(S.th); S.th = setTimeout(function () { S.hold = 0; S.left = SEG; }, 40000); }, { passive: true });
    }
    document.addEventListener('keydown', function (e) {
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      if (overlayAberto()) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { set(S.cur + 1 > nPages() ? 1 : S.cur + 1, true); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { set(S.cur - 1 < 1 ? nPages() : S.cur - 1, true); }
      else if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'A') { e.preventDefault(); api.toggle(); }
      else return;
    });
    setInterval(tick, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* ============================================================================
 * CARTÃO EXPANDIDO (30/10/2026)
 * Clique/toque no título do cartão ou no botão ⤢ abre o cartão grande com TUDO que o cartão tem (listas
 * completas, sem corte), busca em listas longas e ordenação clicando no título da coluna das tabelas.
 * Esc, "x" ou clique fora fecham e o foco volta para o cartão. Tab fica preso dentro do expandido.
 * Respeita todos os filtros globais porque clona o que o cartão já desenhou com os filtros aplicados.
 * ========================================================================== */
(function () {
  'use strict';
  var ROWS = 'tbody tr,.lb-row,.feed-row,.abar-row,.funil-row,.bia-motor-row,.stat-row,.s2-mr,.mdeal-row,.orig-item';
  var X = { card: null, opener: null, charts: [], sig: '', timer: null, sort: null, titulo: '' };
  function $(id) { return document.getElementById(id); }
  function norm(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function tituloDe(card) {
    var t = card.querySelector('.card-hd-title,.s2-ct');
    return t ? t.textContent.replace(/\s+/g, ' ').trim() : 'Detalhe';
  }
  function subDe(card) {
    var t = card.querySelector('.card-hd .badge,.card-hd .hd-total,.s2-cs');
    return t ? t.textContent.replace(/\s+/g, ' ').trim() : '';
  }
  function podeExpandir(card) { return !!card.querySelector('.card-hd,.s2-ch'); }

  /* botão ⤢ e foco por teclado nos cabeçalhos (os cartões do SDR são redesenhados a cada filtro) */
  var pend = false;
  function decora() {
    pend = false;
    limpaVazios();
    var hs = document.querySelectorAll('#body .card-hd:not([data-x]),#s2-root .s2-ch:not([data-x])');
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i], card = h.closest('.card,.s2-card');
      if (!card || card.closest('.expand-overlay')) continue;
      h.setAttribute('data-x', '1');
      h.setAttribute('tabindex', '0'); h.setAttribute('role', 'button');
      h.setAttribute('aria-label', 'Expandir: ' + tituloDe(card));
      h.setAttribute('title', 'Clique para expandir');
      if (!card.querySelector('.expand-btn,.xp-btn')) {
        var b = document.createElement('button');
        b.type = 'button'; b.setAttribute('aria-label', 'Expandir: ' + tituloDe(card)); b.title = 'Expandir';
        if (card.classList.contains('s2-card')) { b.className = 'xp-btn'; b.textContent = '⤢'; h.appendChild(b); }
        else { b.className = 'expand-btn xp-auto'; b.textContent = '⤢'; card.appendChild(b); card.classList.add('has-expand'); }
      } else {
        var eb = card.querySelector('.expand-btn,.xp-btn'); eb.setAttribute('aria-label', 'Expandir: ' + tituloDe(card)); eb.setAttribute('title', 'Expandir');
      }
    }
  }
  /* cartão sem nada além do título nunca aparece como moldura oca: ganha uma mensagem ("Carregando…" no começo, depois "Sem dados para mostrar agora") */
  function semConteudo(card) {
    var f = card.children;
    for (var i = 0; i < f.length; i++) {
      var c = f[i];
      if (c.matches('.card-hd,.s2-ch,.expand-btn,.xp-btn,.lb-ph')) continue;
      if ((c.textContent || '').replace(/\s+/g, '').length) return false;
      if (c.querySelector && c.querySelector('svg,canvas,img,table,input,button')) return false;
    }
    return true;
  }
  function limpaVazios() {
    var cs = document.querySelectorAll('#body .card,#s2-root .s2-card');
    for (var i = 0; i < cs.length; i++) {
      var c = cs[i], vazio = semConteudo(c), ph = c.querySelector(':scope > .lb-ph');
      if (vazio && !ph) {
        ph = document.createElement('div'); ph.className = 'lb-ph feed-empty'; c.appendChild(ph);
      }
      if (vazio && ph) { var tx = (performance.now() < 12000) ? 'Carregando…' : 'Sem dados para mostrar agora'; if (ph.textContent !== tx) ph.textContent = tx; }
      if (!vazio && ph) ph.parentNode.removeChild(ph);
    }
  }
  function agenda() { if (pend) return; pend = true; (window.requestAnimationFrame || setTimeout)(decora); }

  function achatar(clone, card) {
    // ids duplicados e regras de altura fixa por id não podem ir junto
    var ids = clone.querySelectorAll('[id]'); for (var i = 0; i < ids.length; i++) ids[i].removeAttribute('id');
    var hid = clone.querySelectorAll('.expand-btn,.xp-btn'); for (var j = 0; j < hid.length; j++) hid[j].parentNode.removeChild(hid[j]);
  }

  function linhas(root) {
    var all = root.querySelectorAll(ROWS), out = [];
    for (var i = 0; i < all.length; i++) {
      var r = all[i], dentro = false, p = r.parentElement;
      while (p && p !== root) { if (p.matches && p.matches(ROWS)) { dentro = true; break; } p = p.parentElement; }
      if (!dentro) out.push(r);
    }
    return out;
  }

  function ferramentas(body, clone) {
    var old = body.parentNode.querySelector('.xp-tools'); if (old) old.parentNode.removeChild(old);
    var rs = linhas(clone);
    if (rs.length < 6) return;
    var t = document.createElement('div'); t.className = 'xp-tools';
    var inp = document.createElement('input'); inp.type = 'search'; inp.placeholder = 'Buscar nesta lista'; inp.setAttribute('aria-label', 'Buscar nesta lista'); inp.autocomplete = 'off';
    var cnt = document.createElement('span'); cnt.className = 'xp-count'; cnt.setAttribute('aria-live', 'polite');
    cnt.textContent = rs.length + ' itens';
    t.appendChild(inp); t.appendChild(cnt);
    body.parentNode.insertBefore(t, body);
    inp.addEventListener('input', function () {
      var q = norm(inp.value).trim(), n = 0;
      rs.forEach(function (r) { var ok = !q || norm(r.textContent).indexOf(q) >= 0; r.style.display = ok ? '' : 'none'; if (ok) n++; });
      cnt.textContent = q ? n + ' de ' + rs.length : rs.length + ' itens';
    });
  }

  function num(t) {
    var s = String(t).replace(/\s/g, '').replace(/R\$|%|d$/g, '');
    if (!/\d/.test(s)) return NaN;
    s = s.replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
    var v = parseFloat(s); return isNaN(v) ? NaN : v;
  }
  function ordenavel(clone) {
    var tbs = clone.querySelectorAll('table');
    tbs.forEach(function (tb) {
      var th = tb.querySelectorAll('thead th'), tbody = tb.tBodies[0];
      if (!th.length || !tbody || tbody.rows.length < 4 || tbody.querySelector('td[colspan]')) return;
      th.forEach(function (h, ci) {
        h.classList.add('xp-sort'); h.setAttribute('tabindex', '0'); h.setAttribute('role', 'button'); h.setAttribute('aria-sort', 'none');
        function go() {
          var dir = h.getAttribute('aria-sort') === 'ascending' ? -1 : 1;
          th.forEach(function (o) { o.setAttribute('aria-sort', 'none'); });
          X.sort = { ti: Array.prototype.indexOf.call(clone.querySelectorAll('table'), tb), ci: ci, dir: dir };
          h.setAttribute('aria-sort', dir === 1 ? 'ascending' : 'descending');
          var rs = Array.prototype.slice.call(tbody.rows);
          rs.sort(function (a, b) {
            var ta = (a.cells[ci] || {}).textContent || '', tb2 = (b.cells[ci] || {}).textContent || '';
            var na = num(ta), nb = num(tb2);
            if (!isNaN(na) && !isNaN(nb)) return (na - nb) * dir;
            return ta.localeCompare(tb2, 'pt-BR') * dir;
          });
          rs.forEach(function (r) { tbody.appendChild(r); });
        }
        h.addEventListener('click', go);
        h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
    });
  }

  /* ---------- ajuste ao tamanho do painel (um só lugar para todos os cartões) ---------- */
  function metricas() {
    var ov = $('expandOverlay'), m = ov && ov.querySelector('.expand-modal');
    var w = (m ? m.clientWidth : window.innerWidth) - 44, h = window.innerHeight - 190;
    return { w: Math.max(200, w), h: Math.max(160, h) };
  }
  /* SVG de gráfico: escala proporcional (nunca deforma), no máximo 1,5x o tamanho do cartão e sempre cabendo no painel;
     o texto interno cresce junto, então o tamanho fica coerente com o resto */
  function ajustaSvgs(clone) {
    var M = metricas(), svgs = clone.querySelectorAll('svg'), n = 0, i;
    for (i = 0; i < svgs.length; i++) if (!svgs[i].parentElement.closest('svg') && svgs[i].getAttribute('viewBox') && !svgs[i].classList.contains('orig-svg')) n++;
    for (i = 0; i < svgs.length; i++) {
      var sv = svgs[i]; if (sv.parentElement.closest('svg') || sv.classList.contains('orig-svg')) continue;
      var vb = (sv.getAttribute('viewBox') || '').split(/[\s,]+/).map(parseFloat);
      if (vb.length !== 4 || !(vb[2] > 0) || !(vb[3] > 0)) continue;
      if (/none/.test(sv.getAttribute('preserveAspectRatio') || '')) { sv.style.width = '100%'; sv.style.height = '96px'; continue; }
      var porGrafico = n > 1 ? M.h * 0.55 : M.h;
      var k = Math.min(1.5, M.w / vb[2], Math.max(porGrafico, 160) / vb[3]);
      sv.removeAttribute('width'); sv.removeAttribute('height');
      sv.style.width = Math.floor(vb[2] * k) + 'px'; sv.style.maxWidth = '100%'; sv.style.height = 'auto';
      sv.style.display = 'block'; sv.style.margin = '0 auto';
    }
    var im = clone.querySelectorAll('img.xp-img');
    for (i = 0; i < im.length; i++) { im[i].style.maxHeight = Math.max(M.h, 200) + 'px'; im[i].style.width = 'auto'; im[i].style.maxWidth = '100%'; im[i].style.margin = '0 auto'; }
  }
  /* tabela mais larga que o painel rola na horizontal SÓ dentro de uma faixa própria */
  function envolveTabelas(clone) {
    var tbs = clone.querySelectorAll('table');
    for (var i = 0; i < tbs.length; i++) {
      var t = tbs[i]; if (t.parentElement.classList.contains('xp-hs')) continue;
      var w = document.createElement('div'); w.className = 'xp-hs'; t.parentNode.insertBefore(w, t); w.appendChild(t);
    }
  }
  /* gráfico do Chart.js: recria ao vivo no tamanho do painel (nitidez e proporção certas), com a mesma configuração do cartão */
  function chartsVivos(clone, card) {
    var src = card.querySelectorAll('canvas'), dst = clone.querySelectorAll('canvas');
    for (var k = 0; k < dst.length && k < src.length; k++) {
      var d = dst[k], ch = null;
      try { ch = window.Chart && Chart.getChart ? Chart.getChart(src[k]) : null; } catch (e) {}
      if (ch) {
        try {
          var cfg = ch.config, wrap = document.createElement('div'), cv = document.createElement('canvas');
          wrap.className = 'xp-cv'; wrap.appendChild(cv);
          var par = d.parentNode; par.replaceChild(wrap, d);
          var ops = Object.assign({}, cfg.options || {}, { responsive: true, maintainAspectRatio: false, animation: false });
          var dados = { labels: (cfg.data.labels || []).slice(), datasets: (cfg.data.datasets || []).map(function (x) { return Object.assign({}, x); }) };
          X.charts.push(new Chart(cv.getContext('2d'), { type: cfg.type, data: dados, options: ops, plugins: cfg._config && cfg._config.plugins ? cfg._config.plugins : (cfg.plugins || []) }));
          continue;
        } catch (e) { /* cai para a imagem abaixo */ }
      }
      try { var im = new Image(); im.src = src[k].toDataURL('image/png'); im.alt = 'Gráfico'; im.className = 'xp-img'; d.parentNode.replaceChild(im, d); } catch (e2) {}
    }
  }
  function mataCharts() { while (X.charts.length) { try { X.charts.pop().destroy(); } catch (e) {} } }
  function assinatura(card) {
    var s = card.innerHTML.length + ':' + (card.textContent || '').length + ':' + card.querySelectorAll('*').length;
    try { var cs = card.querySelectorAll('canvas'); for (var i = 0; i < cs.length; i++) { var c = window.Chart && Chart.getChart ? Chart.getChart(cs[i]) : null; if (c) s += '|' + JSON.stringify(c.config.data.datasets.map(function (d) { return d.data; })) + (c.config.data.labels || []).length; } } catch (e) {}
    return s + '|' + (card.textContent || '').replace(/\s+/g, ' ').slice(0, 4000);
  }
  function montaConteudo(card) {
    var ov = $('expandOverlay'), body = $('expandModalBody');
    mataCharts();
    body.innerHTML = '';
    var clone = document.createElement('div'); clone.className = 'xp' + (X.cls ? ' ' + X.cls : '');
    Array.prototype.forEach.call(card.children, function (ch) {
      if (ch.matches('.card-hd,.s2-ch,.expand-btn,.xp-btn')) return;
      clone.appendChild(ch.cloneNode(true));
    });
    achatar(clone, card);
    body.appendChild(clone);
    chartsVivos(clone, card);
    envolveTabelas(clone);
    ferramentas(body, clone); ordenavel(clone);
    ajustaSvgs(clone);
    X.sig = assinatura(card);
    $('expandModalTitle').textContent = tituloDe(card) + (subDe(card) ? ' · ' + subDe(card) : '');
  }
  function abrirCom(card, opener) {
    var ov = $('expandOverlay'), body = $('expandModalBody'); if (!ov || !body) return;
    var modal = ov.querySelector('.expand-modal');
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'expandModalTitle');
    X.sort = null; X.titulo = tituloDe(card);
    X.opener = opener || document.activeElement;
    document.documentElement.classList.add('xp-open');
    ov.classList.add('show');   // visível antes de montar: os gráficos medem o painel de verdade
    montaConteudo(card);
    body.scrollTop = 0;
    var c = $('expandModalClose'); if (c) c.focus({ preventScroll: true });
    if (X.timer) clearInterval(X.timer);
    X.timer = setInterval(atualiza, 1500);
  }
  /* dados renovaram com o painel aberto: refaz o conteúdo mantendo rolagem, busca e ordenação */
  function atualiza() {
    var ov = $('expandOverlay'); if (!ov || !ov.classList.contains('show')) return;
    var card = X.card;
    if (!card || !document.contains(card)) {
      card = null;
      var cs = document.querySelectorAll('#body .card,#s2-root .s2-card');
      for (var i = 0; i < cs.length; i++) if (cs[i].offsetParent !== null && tituloDe(cs[i]) === X.titulo && podeExpandir(cs[i])) { card = cs[i]; break; }
      if (!card) return;
      X.card = card;
    }
    if (assinatura(card) === X.sig) return;
    var body = $('expandModalBody'), st = body.scrollTop, inp = ov.querySelector('.xp-tools input'), q = inp ? inp.value : '', so = X.sort;
    montaConteudo(card);
    var ni = ov.querySelector('.xp-tools input');
    if (ni && q) { ni.value = q; ni.dispatchEvent(new Event('input')); }
    if (so) { var tb = ov.querySelectorAll('table')[so.ti]; var th = tb && tb.querySelectorAll('thead th')[so.ci]; if (th && th.classList.contains('xp-sort')) { th.click(); if (so.dir === -1) th.click(); } }
    body.scrollTop = st;
  }
  function abrirCard(card) {
    if (!card || !podeExpandir(card)) return;
    X.card = card; X.cls = String(card.className).split(/\s+/).filter(function (c) { return c && c !== 'card' && c !== 's2-card' && c !== 'has-expand'; }).join(' ');
    abrirCom(card, card.querySelector('.expand-btn,.xp-btn') || card);
  }
  function fechar() {
    var ov = $('expandOverlay'); if (!ov || !ov.classList.contains('show')) return;
    ov.classList.remove('show');
    document.documentElement.classList.remove('xp-open');
    if (X.timer) { clearInterval(X.timer); X.timer = null; }
    mataCharts();
    var o = X.opener; X.opener = null; X.card = null;
    try { if (o && document.contains(o)) o.focus({ preventScroll: true }); } catch (e) {}
  }
  window.addEventListener('resize', function () { var ov = $('expandOverlay'); if (ov && ov.classList.contains('show')) { var c = ov.querySelector('.xp'); if (c) ajustaSvgs(c); } });
  window.LB_XP = {
    open: abrirCard, close: fechar,
    openById: function (targetId, title) {
      var t = $(targetId); var card = t && t.closest('.card,.s2-card'); if (card) abrirCard(card);
    },
    isOpen: function () { var ov = $('expandOverlay'); return !!(ov && ov.classList.contains('show')); }
  };

  function init() {
    decora();
    var alvo = [$('body'), $('s2-root')];
    alvo.forEach(function (a) { if (a && window.MutationObserver) new MutationObserver(agenda).observe(a, { childList: true, subtree: true }); });
    document.addEventListener('click', function (e) {
      var ov = $('expandOverlay');
      if (ov && ov.classList.contains('show')) {
        if (e.target === ov) { fechar(); return; }
        // linhas e filtros do SDR dentro do expandido repassam o clique para o tratador do painel
        if (ov.contains(e.target) && window.SDR2 && e.target.closest('[data-go],[data-mot],button[data-f],button[data-gran],button[data-retry]')) {
          var filtro = e.target.closest('button[data-f],button[data-gran],button[data-retry],tr[data-go*=":"]');
          try { window.SDR2.click(e); } catch (err) {}
          if (filtro) fechar();
        }
        return;
      }
      var btn = e.target.closest('.expand-btn,.xp-btn');
      if (btn) { e.preventDefault(); e.stopPropagation(); abrirCard(btn.closest('.card,.s2-card')); return; }
      var hd = e.target.closest('.card-hd[data-x],.s2-ch[data-x]');
      if (hd && !e.target.closest('button,a,input,select,.orig-tog,.orig-filtro')) abrirCard(hd.closest('.card,.s2-card'));
    }, true);
    document.addEventListener('keydown', function (e) {
      var ov = $('expandOverlay'), aberto = ov && ov.classList.contains('show');
      if (e.key === 'Escape' && aberto) {
        var lm = $('modal-overlay'); if (lm && lm.classList.contains('show')) return; // fecha só o modal de cima
        e.stopPropagation(); fechar(); return;
      }
      if (aberto && e.key === 'Tab') {
        var f = ov.querySelectorAll('button,input,a[href],th[tabindex],summary,[tabindex="0"]'), v = [];
        for (var i = 0; i < f.length; i++) if (f[i].offsetParent !== null) v.push(f[i]);
        if (!v.length) return;
        var first = v[0], last = v[v.length - 1];
        if (!ov.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        return;
      }
      if ((e.key === 'Enter' || e.key === ' ') && !aberto) {
        var hd = e.target && e.target.closest && e.target.closest('.card-hd[data-x],.s2-ch[data-x]');
        if (hd && e.target === hd) { e.preventDefault(); abrirCard(hd.closest('.card,.s2-card')); }
      }
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* ============================================================================
 * ROLAGEM AUTOMÁTICA DAS LISTAS (30/10/2026)
 * Lista que não cabe no cartão sobe/desce sozinha, MAS:
 *  - só rola se realmente não cabe (cabendo, fica parada);
 *  - anda por "páginas" alinhadas com o topo de uma linha (nunca corta linha no meio), com pausa de leitura
 *    em cada página e retorno suave ao topo (sem pulo);
 *  - quando os dados renovam (a cada 20/60 s) a posição NÃO volta ao topo: a linha que estava no alto
 *    continua no mesmo lugar (âncora por texto da linha);
 *  - pausa ao passar o mouse, tocar, rolar na mão ou focar com o teclado; retoma depois de 5 s parado;
 *  - um único laço requestAnimationFrame para todas as listas, só mexe nas visíveis (página atual);
 *  - prefers-reduced-motion: não rola sozinha (a lista inteira está no cartão expandido).
 * ========================================================================== */
(function () {
  'use strict';
  var RM = false; try { RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var DWELL_MIN = 4500, DWELL_ROW = 260, DWELL_MAX = 10000, ANIM = 700, TOPANIM = 900, RESUME = 5000;
  var L = {}, ids = [], rafId = 0, last = 0, SC = 1; // SC: escala de tempo (só o teste automatizado mexe)

  function rowsOf(el) {
    var c = el.children;
    if (c.length === 1 && c[0].tagName === 'TABLE') { var tb = c[0].tBodies[0]; return tb ? Array.prototype.slice.call(tb.rows) : []; }
    return Array.prototype.slice.call(c);
  }
  function keyOf(r) { return (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90); }
  function topOf(el, r) { return r.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop; }
  function hdrH(el) { var th = el.querySelector('thead'); return th && getComputedStyle(th.rows ? th.rows[0].cells[0] : th).position === 'sticky' ? th.getBoundingClientRect().height : 0; }

  function plan(st) {
    var el = st.el, ch = el.clientHeight, sh = el.scrollHeight, max = sh - ch;
    if (max <= 2) return [];
    var rows = rowsOf(el); if (!rows.length) return [0, max];
    var hdr = hdrH(el), tops = rows.map(function (r) { return topOf(el, r); }), hs = rows.map(function (r) { return r.getBoundingClientRect().height; });
    var pages = [0], cur = 0, guard = 0;
    while (guard++ < 400) {
      var i = -1;
      for (var k = 0; k < rows.length; k++) if (tops[k] + hs[k] > cur + ch + 1) { i = k; break; }
      if (i < 0) break;
      var next = tops[i] - hdr;
      if (next <= cur + 1) next = cur + Math.max(ch - hdr, 40);
      if (next >= max) { pages.push(max); cur = max; break; }
      pages.push(next); cur = next;
    }
    if (cur < max) {
      var lastTop = max, lt = -1;
      for (var m = 0; m < rows.length; m++) if (tops[m] - hdr >= max - 1) { lt = m; break; }
      if (lt >= 0) lastTop = tops[lt] - hdr;
      if (lastTop > cur + 1) pages.push(Math.min(lastTop, max));
    }
    var out = [pages[0]]; for (var p = 1; p < pages.length; p++) if (pages[p] - out[out.length - 1] > 1) out.push(pages[p]);
    return out.length > 1 ? out : [];
  }
  function dwellFor(st) {
    var vis = Math.max(1, Math.round(st.el.clientHeight / Math.max(20, (rowsOf(st.el)[0] || { getBoundingClientRect: function () { return { height: 40 }; } }).getBoundingClientRect().height)));
    return SC * Math.min(DWELL_MAX, DWELL_MIN + DWELL_ROW * vis);
  }
  function anchorOf(st) {
    var el = st.el, rows = rowsOf(el), base = el.getBoundingClientRect().top, vistos = {};
    for (var i = 0; i < rows.length; i++) {
      var k = keyOf(rows[i]), r = rows[i].getBoundingClientRect();
      if (r.bottom - base > 2) { st.anchor = { key: k, dup: vistos[k] || 0, off: r.top - base, pos: el.scrollTop }; return; }
      vistos[k] = (vistos[k] || 0) + 1;
    }
    st.anchor = null;
  }
  function setTop(st, v) { st.expect = v; st.el.scrollTop = v; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function bind(st) {
    var el = st.el;
    function user() { st.lastUser = performance.now(); }
    el.addEventListener('mouseenter', function () { st.hover = true; });
    el.addEventListener('mouseleave', function () { st.hover = false; st.lastUser = performance.now() - RESUME + 1500; });
    el.addEventListener('wheel', user, { passive: true });
    el.addEventListener('touchstart', user, { passive: true });
    el.addEventListener('touchmove', user, { passive: true });
    el.addEventListener('pointerdown', user, { passive: true });
    el.addEventListener('focusin', function () { st.focus = true; });
    el.addEventListener('focusout', function () { st.focus = false; });
    el.addEventListener('scroll', function () {
      if (Math.abs(el.scrollTop - (st.expect == null ? el.scrollTop : st.expect)) > 2) { user(); st.mode = 'dwell'; st.wait = dwellFor(st); st.expect = el.scrollTop; anchorOf(st); }
    }, { passive: true });
  }

  function register(id, opts) {
    var el = document.getElementById(id); if (!el) return;
    var st = L[id];
    var criou = false;
    if (!st) { st = L[id] = { id: id, el: el, mode: 'dwell', wait: 0, idx: 0, pages: [], lastUser: -1e9, expect: null, anchor: null }; ids.push(id); criou = true; }
    var novo = criou || st.el !== el;
    if (novo) { st.el = el; st.expect = null; bind(st); }
    // restaura a posição depois de a lista ter sido redesenhada (innerHTML novo volta ao topo sozinho)
    var a = st.anchor;
    if (a && !novo) {
      var rows = rowsOf(el), ok = false, vistos = {};
      for (var i = 0; i < rows.length; i++) {
        var k = keyOf(rows[i]);
        if (k === a.key && (vistos[k] || 0) === a.dup) { setTop(st, Math.max(0, topOf(el, rows[i]) - a.off)); ok = true; break; }
        vistos[k] = (vistos[k] || 0) + 1;
      }
      if (!ok) setTop(st, Math.min(a.pos || 0, Math.max(0, el.scrollHeight - el.clientHeight)));
    } else { setTop(st, 0); }
    st.pages = plan(st);
    if (!st.pages.length) { setTop(st, 0); st.anchor = null; st.mode = 'dwell'; }
    else { st.idx = 0; for (var p = st.pages.length - 1; p >= 0; p--) if (st.pages[p] <= el.scrollTop + 2) { st.idx = p; break; } anchorOf(st); if (st.mode !== 'anim') st.wait = Math.max(st.wait, 1500 * SC); }
    if (!rafId) { last = performance.now(); rafId = requestAnimationFrame(frame); }
  }

  function frame(ts) {
    var dt = Math.min(100, ts - last); last = ts; rafId = 0;
    if (!RM && !document.hidden) {
      for (var n = 0; n < ids.length; n++) {
        var st = L[ids[n]], el = st.el;
        if (!document.contains(el)) { delete L[ids[n]]; ids.splice(n, 1); n--; continue; }
        if (!el.clientHeight || el.offsetParent === null) continue;               // escondida (outra página) ou sem tamanho
        if (el.closest('.expand-overlay') || document.documentElement.classList.contains('xp-open')) continue;   // com o painel aberto, a grade por trás fica parada
        var held = st.hover || st.focus || (ts - st.lastUser) < RESUME * SC;
        if (st.mode === 'anim') {
          st.t += dt; var k = Math.min(1, st.t / st.dur); setTop(st, st.from + (st.to - st.from) * ease(k));
          if (k >= 1) { st.mode = 'dwell'; st.wait = dwellFor(st); anchorOf(st); }
          continue;
        }
        if (held) continue;
        st.wait -= dt;
        if (st.wait > 0) continue;
        var pg = plan(st); st.pages = pg;
        if (!pg.length) { st.wait = 3000; continue; }
        var cur = el.scrollTop, nextIdx = -1;
        for (var q = 0; q < pg.length; q++) if (pg[q] > cur + 2) { nextIdx = q; break; }
        var to = nextIdx < 0 ? 0 : pg[nextIdx];
        st.from = cur; st.to = to; st.t = 0; st.dur = SC * (nextIdx < 0 ? Math.max(TOPANIM, Math.min(2600, 500 + Math.abs(cur - to) * 0.7)) : ANIM); st.mode = 'anim';
      }
    }
    if (window.LB_SCROLL && window.LB_SCROLL._frameHook) window.LB_SCROLL._frameHook(ts);
    if (ids.length) rafId = requestAnimationFrame(frame);
  }

  window.LB_SCROLL = { register: register, _scale: function (v) { SC = v; }, _frameHook: null, _state: L, _plan: function (id) { return L[id] ? plan(L[id]) : null; } };
})();
