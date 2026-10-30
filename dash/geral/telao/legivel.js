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
