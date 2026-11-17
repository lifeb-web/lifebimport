/* Modo apresentação em slides (16/11/2026): tela cheia, sem rolagem, escala o palco 16:9 (ou 9:16 no celular em pé). */
(function () {
  'use strict';
  var D = document, H = D.documentElement, W = window;
  var deck = D.getElementById('deck'); if (!deck) return;
  var stage = D.getElementById('stage'), slides = [].slice.call(D.querySelectorAll('.slide')), N = slides.length;
  var dots = [].slice.call(D.querySelectorAll('.dot')), ind = D.getElementById('dInd'), prog = D.querySelector('.dprog i');
  var bPrev = D.getElementById('dPrev'), bNext = D.getElementById('dNext'), bFs = D.getElementById('dFs'), bTema = D.getElementById('dTema'), bExit = D.getElementById('dExit');
  var aberto = false, cur = 0, quietoT = 0, fsEstava = false, fsManter = false, voltaFoco = null;
  var temFs = !!(H.requestFullscreen || H.webkitRequestFullscreen);
  var fsEl = function () { return D.fullscreenElement || D.webkitFullscreenElement; };
  function dec(s) { try { return decodeURIComponent(s); } catch (e) { return s; } }

  function ajusta() {
    var w = W.innerWidth, h = W.innerHeight, port = h > w;
    var sw = port ? 1080 : 1920, sh = port ? 1920 : 1080;
    stage.classList.toggle('port', port);
    var k = Math.min(w / sw, h / sh);
    stage.style.transform = 'translate(' + Math.round((w - sw * k) / 2) + 'px,' + Math.round((h - sh * k) / 2) + 'px) scale(' + k + ')';
    stage.style.setProperty('--ctl', Math.ceil(84 / k) + 'px');
    deck.setAttribute('data-escala', k.toFixed(3));
  }
  function mostra(i, dir) {
    i = Math.max(0, Math.min(N - 1, i));
    slides.forEach(function (s, k) {
      var on = k === i; s.classList.toggle('on', on); s.setAttribute('aria-hidden', on ? 'false' : 'true');
      s.classList.toggle('sai', k < i);
    });
    cur = i;
    ind.textContent = (i + 1) + ' / ' + N;
    prog.style.width = ((i + 1) / N * 100).toFixed(1) + '%';
    dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    bPrev.disabled = i === 0; bNext.disabled = i === N - 1;
    try { W.history.replaceState(null, '', '#slide-' + (i + 1)); } catch (e) {}
  }
  function acorda() {
    deck.classList.remove('quieto'); clearTimeout(quietoT);
    quietoT = setTimeout(function () { if (aberto && !D.activeElement.closest('.dctl')) deck.classList.add('quieto'); }, 3000);
  }
  function tentaFs() {
    var f = H.requestFullscreen || H.webkitRequestFullscreen; if (!f) return;
    try { var p = f.call(H); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }
  function saiFs() { if (fsEl()) { var x = D.exitFullscreen || D.webkitExitFullscreen; try { var p = x.call(D); if (p && p.catch) p.catch(function () {}); } catch (e) {} } }
  function alternaFs() { if (!temFs) return; fsManter = true; if (fsEl()) saiFs(); else tentaFs(); setTimeout(function () { fsManter = false; }, 700); }
  function onFs() {
    var agora = !!fsEl();
    if (aberto && fsEstava && !agora && !fsManter) fecha();
    fsEstava = agora; bFs.setAttribute('aria-pressed', agora ? 'true' : 'false');
  }
  D.addEventListener('fullscreenchange', onFs); D.addEventListener('webkitfullscreenchange', onFs);

  function abre(i, opt) {
    if (aberto) return; opt = opt || {};
    voltaFoco = D.activeElement;
    aberto = true; deck.hidden = false; H.classList.add('deck-on');
    ajusta(); mostra(i || 0); acorda();
    var bt = D.querySelectorAll('[data-apres]'); [].forEach.call(bt, function (b) { b.setAttribute('aria-pressed', 'true'); });
    if (!opt.semFs) tentaFs();
    try { deck.setAttribute('tabindex', '-1'); deck.focus({ preventScroll: true }); } catch (e) {}
  }
  function fecha() {
    if (!aberto) return; aberto = false; deck.hidden = true; H.classList.remove('deck-on');
    var bt = D.querySelectorAll('[data-apres]'); [].forEach.call(bt, function (b) { b.setAttribute('aria-pressed', 'false'); });
    saiFs(); clearTimeout(quietoT);
    try { W.history.replaceState(null, '', W.location.pathname + W.location.search); } catch (e) {}
    try { if (voltaFoco && voltaFoco.focus) voltaFoco.focus({ preventScroll: true }); } catch (e) {}
  }
  function prox() { if (cur < N - 1) mostra(cur + 1); }
  function ant() { if (cur > 0) mostra(cur - 1); }

  [].forEach.call(D.querySelectorAll('[data-apres]'), function (b) { b.addEventListener('click', function () { if (aberto) fecha(); else abre(0); }); });
  bPrev.addEventListener('click', ant); bNext.addEventListener('click', prox); bExit.addEventListener('click', fecha); bFs.addEventListener('click', alternaFs);
  if (!temFs) bFs.hidden = true;
  dots.forEach(function (d) { d.addEventListener('click', function () { mostra(parseInt(d.getAttribute('data-i'), 10)); }); });
  // tema claro/escuro (mesmo botão e mesma memória da página)
  bTema.addEventListener('click', function () {
    var atual = H.getAttribute('data-theme') || (W.matchMedia && W.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var novo = atual === 'dark' ? 'light' : 'dark'; H.setAttribute('data-theme', novo); try { W.localStorage.setItem('eco.tema', novo); } catch (e) {}
  });
  // clique no palco: terço direito avança, terço esquerdo volta
  stage.addEventListener('click', function (e) {
    if (e.target.closest('a,button')) return;
    var x = e.clientX / W.innerWidth; if (x > 0.66) prox(); else if (x < 0.25) ant();
  });
  D.addEventListener('keydown', function (e) {
    if (!aberto || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key; acorda();
    if (k === 'Escape') { e.preventDefault(); fecha(); }
    else if (k === 'ArrowRight' || k === 'PageDown' || k === 'ArrowDown' || (k === ' ' && !e.shiftKey && e.target.tagName !== 'BUTTON')) { e.preventDefault(); prox(); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'ArrowUp' || (k === ' ' && e.shiftKey)) { e.preventDefault(); ant(); }
    else if (k === 'Home') { e.preventDefault(); mostra(0); }
    else if (k === 'End') { e.preventDefault(); mostra(N - 1); }
    else if (k === 'f' || k === 'F') { e.preventDefault(); alternaFs(); }
    else if (k === 't' || k === 'T') { e.preventDefault(); bTema.click(); }
  });
  // toque: deslizar
  var tx = 0, ty = 0, tt = 0;
  deck.addEventListener('touchstart', function (e) { if (e.touches.length !== 1) return; tx = e.touches[0].clientX; ty = e.touches[0].clientY; tt = Date.now(); acorda(); }, { passive: true });
  deck.addEventListener('touchend', function (e) {
    if (!e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Date.now() - tt < 900 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) { if (dx < 0) prox(); else ant(); }
    else if (Date.now() - tt < 900 && Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.4) { if (dy < 0) prox(); else ant(); }
  }, { passive: true });
  deck.addEventListener('mousemove', acorda);
  W.addEventListener('resize', function () { if (aberto) ajusta(); });
  W.addEventListener('orientationchange', function () { setTimeout(function () { if (aberto) ajusta(); }, 150); });
  W.addEventListener('hashchange', function () {
    var m = /^#slide-(\d+)$/.exec(dec(W.location.hash || ''));
    if (m && !aberto) abre(parseInt(m[1], 10) - 1, { semFs: true }); else if (m && aberto) mostra(parseInt(m[1], 10) - 1);
  });
  var m0 = /^#slide-(\d+)$/.exec(dec(W.location.hash || ''));
  if (m0) abre(parseInt(m0[1], 10) - 1, { semFs: true });
  W.__deck = { N: N, estado: function () { return { aberto: aberto, i: cur }; }, mostra: mostra, abre: abre, fecha: fecha };
})();
