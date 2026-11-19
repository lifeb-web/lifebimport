(function () {
  'use strict';
  var D = document, H = D.documentElement, W = window;
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function ss(k, v) { try { if (v === undefined) return W.sessionStorage.getItem(k); if (v === null) W.sessionStorage.removeItem(k); else W.sessionStorage.setItem(k, v); } catch (e) {} return null; }
  function ls(k, v) { try { if (v === undefined) return W.localStorage.getItem(k); if (v === null) W.localStorage.removeItem(k); else W.localStorage.setItem(k, v); } catch (e) {} return null; }
  function dec(s) { try { return decodeURIComponent(s); } catch (e) { return s; } }
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function jump(y) { try { W.scrollTo({ top: y, left: 0, behavior: 'instant' }); } catch (e) { W.scrollTo(0, y); } }

  var emIf = false; try { emIf = W.self !== W.top; } catch (e) { emIf = true; }
  if (emIf) H.classList.add('emif');   /* dentro de um iframe (por exemplo na aba da página Central): sem pulo de rolagem e sem mexer no endereço */
  var main = $('main'), secs = $$('main .sec'), N = secs.length;
  var ids = secs.map(function (s) { return s.id; });
  var side = $('#side'), menuBtn = $('#menuBtn');

  /* ---------- tema ---------- */
  var temaBtn = $('#temaBtn'), TEMAS = ['auto', 'light', 'dark'], NOMES = { auto: 'automático', light: 'claro', dark: 'escuro' };
  function aplicaTema(t) {
    if (t === 'light' || t === 'dark') H.setAttribute('data-theme', t); else H.removeAttribute('data-theme');
    if (temaBtn) { var nm = NOMES[t] || 'automático'; temaBtn.setAttribute('aria-label', 'Tema da página: ' + nm + '. Tocar para alternar.'); temaBtn.setAttribute('title', 'Tema: ' + nm); var s = $('.tx', temaBtn); if (s) s.textContent = nm.charAt(0).toUpperCase() + nm.slice(1); }
  }
  var tema = ls('eco.tema'); if (TEMAS.indexOf(tema) < 0) tema = 'auto';
  aplicaTema(tema);
  if (temaBtn) temaBtn.addEventListener('click', function () { tema = TEMAS[(TEMAS.indexOf(tema) + 1) % 3]; ls('eco.tema', tema); aplicaTema(tema); });

  /* ---------- menu lateral (celular e tablet) ---------- */
  function menu(abrir) {
    if (!side) return;
    side.classList.toggle('open', abrir);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    if (abrir) { var f = $('.busca', side); if (f && W.innerWidth < 1180) f.focus({ preventScroll: true }); }
  }
  /* lateral recolhível no desktop (19/11/2026): botão Menu e tecla M; a escolha fica em localStorage */
  var H_ = D.documentElement, largo = function () { return W.innerWidth >= 1180; };
  function lateral(fora) {
    H_.classList.toggle('side-off', fora); ls('eco.lateral', fora ? 'off' : 'on');
    if (menuBtn) { menuBtn.setAttribute('aria-expanded', fora ? 'false' : 'true'); menuBtn.setAttribute('aria-label', fora ? 'Mostrar o índice de seções' : 'Recolher o índice de seções'); }
  }
  if (ls('eco.lateral') === 'off') lateral(true); else if (menuBtn && largo()) menuBtn.setAttribute('aria-expanded', 'true');
  if (menuBtn) menuBtn.addEventListener('click', function () { if (largo()) lateral(!H_.classList.contains('side-off')); else menu(!side.classList.contains('open')); });
  D.addEventListener('keydown', function (e) {
    if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !e.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '') && !H_.classList.contains('deck-on')) { e.preventDefault(); if (largo()) lateral(!H_.classList.contains('side-off')); else menu(!side.classList.contains('open')); }
  });
  $$('.fechar', side).forEach(function (b) { b.addEventListener('click', function () { menu(false); if (menuBtn) menuBtn.focus(); }); });
  $$('.toc a', side).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && side && side.classList.contains('open')) { menu(false); if (menuBtn) menuBtn.focus(); } });

  /* ---------- busca no índice ---------- */
  var busca = $('.busca'), buscaR = $('.busca-r'), tocLis = $$('.toc li[data-id]');
  var textos = secs.map(function (s) { return norm(s.textContent); });
  if (busca) {
    busca.addEventListener('input', function () {
      var v = norm(busca.value.trim()), n = 0;
      tocLis.forEach(function (li) { var i = ids.indexOf(li.getAttribute('data-id')); var ok = !v || (i >= 0 && textos[i].indexOf(v) > -1); li.classList.toggle('off', !ok); if (ok && v) n++; });
      $$('.toc .gr', side).forEach(function (g) { var nx = g.nextElementSibling, vis = false; while (nx && !nx.classList.contains('gr')) { if (!nx.classList.contains('off')) vis = true; nx = nx.nextElementSibling; } g.classList.toggle('off', !vis); });
      buscaR.textContent = v ? (n ? n + (n === 1 ? ' seção encontrada' : ' seções encontradas') : 'Nada encontrado para essa busca.') : '';
    });
    busca.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var a = $('.toc li:not(.off) a', side); if (a) a.click(); } });
  }

  /* ---------- detalhes abertos: lembrar ---------- */
  var dets = $$('details.fx'), emAp = false;
  function salvaDet() { if (emAp) return; ss('eco.det', JSON.stringify(dets.filter(function (d) { return d.open; }).map(function (d) { return d.id; }))); }
  try { var abertos = JSON.parse(ss('eco.det') || '[]'); dets.forEach(function (d) { if (abertos.indexOf(d.id) > -1) d.open = true; }); } catch (e) {}
  dets.forEach(function (d) { d.addEventListener('toggle', salvaDet); });

  /* ---------- posição: seção atual, hash e não voltar ao topo ---------- */
  try { if ('scrollRestoration' in W.history) W.history.scrollRestoration = 'manual'; } catch (e) {}
  var mastH = function () { var m = $('.mast'); return m ? m.offsetHeight : 0; };
  function secAtual() {
    var ancora = mastH() + Math.min(180, W.innerHeight * 0.3), cur = 0;
    for (var i = 0; i < N; i++) { if (secs[i].getBoundingClientRect().top <= ancora) cur = i; }
    return cur;
  }
  var pronto = false, usuario = false, ultimoHash = '', semHashAte = 0;
  function marcaNav(i) { $$('.toc a', side).forEach(function (a) { var on = a.getAttribute('href') === '#' + ids[i]; if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }
  function salvaPos() {
    if (emAp || !usuario) return;
    var i = secAtual(), s = secs[i];
    ss('eco.pos', JSON.stringify({ id: s.id, off: Math.round(W.scrollY - (s.getBoundingClientRect().top + W.scrollY)), y: Math.round(W.scrollY) }));
  }
  var tmr = null, raf = 0;
  function aoRolar() {
    if (emAp) return;
    if (raf) return;
    raf = W.requestAnimationFrame(function () {
      raf = 0;
      var i = secAtual(); marcaNav(i);
      if (!emIf && pronto && usuario && Date.now() > semHashAte && ids[i] !== ultimoHash) { ultimoHash = ids[i]; try { W.history.replaceState(null, '', '#' + ids[i]); } catch (e) {} }
      clearTimeout(tmr); tmr = setTimeout(salvaPos, 150);
    });
  }
  W.addEventListener('scroll', aoRolar, { passive: true });
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { W.addEventListener(ev, function () { usuario = true; }, { passive: true }); });
  W.addEventListener('pagehide', salvaPos);
  D.addEventListener('visibilitychange', function () { if (D.visibilityState === 'hidden') salvaPos(); });

  var posInicial = null;
  try { posInicial = JSON.parse(ss('eco.pos') || 'null'); } catch (e) {}
  D.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && !emAp) { semHashAte = Date.now() + 1800; ultimoHash = a.getAttribute('href').slice(1); setTimeout(function () { semHashAte = 0; aoRolar(); }, 1900); }
  });
  function secDe(el) { while (el && el !== D.body) { if (el.classList && el.classList.contains('sec')) return el; el = el.parentElement; } return null; }
  function aplicaPosicao() {
    if (emAp || emIf) return;
    var h = dec((W.location.hash || '').slice(1)), st = posInicial;
    var alvo = h ? D.getElementById(h) : null;
    if (st && D.getElementById(st.id) && (!h || st.id === h || (alvo && secDe(alvo) && secDe(alvo).id === st.id))) {
      var s = D.getElementById(st.id);
      jump(s.getBoundingClientRect().top + W.scrollY + st.off);
    } else if (alvo) {
      jump(alvo.getBoundingClientRect().top + W.scrollY - mastH() - 10);
    }
  }
  function marca() { marcaNav(secAtual()); }

  W.addEventListener('hashchange', function () {
    var h = dec((W.location.hash || '').slice(1)); if (!h || /^slide-\d+$/.test(h)) return;
    ultimoHash = h; marca();
  });

  /* ---------- início ---------- */
  if (!/^#slide-\d+$/.test(W.location.hash || '')) {
    aplicaPosicao(); marca();
    var refaz = function () { if (!usuario) aplicaPosicao(); marca(); };
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(refaz);
    W.addEventListener('load', function () { refaz(); setTimeout(function () { pronto = true; }, 50); });
    setTimeout(function () { pronto = true; }, 1200);
  }
  if (D.readyState === 'complete') pronto = true;
  W.__eco = { N: N, ids: ids };
})();
