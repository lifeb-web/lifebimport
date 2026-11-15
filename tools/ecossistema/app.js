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
  if (menuBtn) menuBtn.addEventListener('click', function () { menu(!side.classList.contains('open')); });
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
      if (pronto && usuario && Date.now() > semHashAte && ids[i] !== ultimoHash) { ultimoHash = ids[i]; try { W.history.replaceState(null, '', '#' + ids[i]); } catch (e) {} }
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
    if (emAp) return;
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

  /* ---------- modo apresentação ---------- */
  var apBar = $('#apbar'), apTit = $('#apT'), apCont = $('#apC'), apProg = $('.approg'), apHelp = $('#aphelp');
  var apI = 0, fsPediu = false, fsEstava = false, fsManter = false, apBtns = $$('[data-apres]');
  var temFs = !!(H.requestFullscreen || H.webkitRequestFullscreen);
  var fsEl = function () { return D.fullscreenElement || D.webkitFullscreenElement; };
  function setBtns(on) { apBtns.forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); }
  function tentaFs() {
    var f = H.requestFullscreen || H.webkitRequestFullscreen;
    if (!f) return;
    try { var p = f.call(H); fsPediu = true; if (p && p.catch) p.catch(function () { fsPediu = false; }); } catch (e) { fsPediu = false; }
  }
  function saiFs() { if (fsEl()) { var x = D.exitFullscreen || D.webkitExitFullscreen; try { var p = x.call(D); if (p && p.catch) p.catch(function () {}); } catch (e) {} } }
  function alternaFs() { if (!temFs) return; fsManter = true; if (fsEl()) saiFs(); else tentaFs(); setTimeout(function () { fsManter = false; }, 600); }
  function onFs() {
    var agora = !!fsEl();
    if (emAp && fsEstava && !agora && !fsManter) sairAp();
    fsEstava = agora;
    var b = $('#apFs'); if (b) b.setAttribute('aria-pressed', agora ? 'true' : 'false');
  }
  D.addEventListener('fullscreenchange', onFs); D.addEventListener('webkitfullscreenchange', onFs);

  function mostra(i, alvoEl) {
    i = Math.max(0, Math.min(N - 1, i)); apI = i;
    secs.forEach(function (s, k) { s.classList.toggle('atual', k === i); });
    main.scrollTop = 0;
    var s = secs[i], t = s.getAttribute('data-t');
    apTit.textContent = t; apCont.textContent = (i + 1) + ' de ' + N;
    apProg.setAttribute('aria-valuenow', String(i + 1)); apProg.firstElementChild.style.width = ((i + 1) / N * 100).toFixed(1) + '%';
    setTimeout(rotulo, 30);
    try { W.history.replaceState(null, '', '#' + s.id); } catch (e) {}
    ultimoHash = s.id; ss('eco.apIdx', String(i)); marcaNav(i);
    if (alvoEl && s.contains(alvoEl) && alvoEl !== s) { try { alvoEl.scrollIntoView({ block: 'start' }); } catch (e) {} }
  }
  function sobra() { return main.scrollHeight - main.clientHeight - main.scrollTop; }
  function partes() { var ch = main.clientHeight || 1, tot = Math.max(1, Math.ceil((main.scrollHeight - 10) / (ch * 0.85))); var p = Math.min(tot, Math.floor(main.scrollTop / (ch * 0.85)) + 1); return [p, tot]; }
  function rotulo() { if (!emAp) return; var pt = partes(), n = (apI + 1) + ' de ' + N; apCont.textContent = pt[1] > 1 ? n + ' · parte ' + pt[0] + ' de ' + pt[1] : n; $('#apPrev').disabled = apI === 0 && main.scrollTop < 8; $('#apNext').disabled = apI === N - 1 && sobra() < 16; }
  function proximo() { if (sobra() > 24) { main.scrollBy({ top: Math.round(main.clientHeight * 0.85), behavior: 'smooth' }); } else if (apI < N - 1) mostra(apI + 1); }
  function anterior() { if (main.scrollTop > 8) { main.scrollBy({ top: -Math.round(main.clientHeight * 0.85), behavior: 'smooth' }); } else if (apI > 0) mostra(apI - 1); }
  main.addEventListener('scroll', function () { if (emAp) rotulo(); }, { passive: true });
  W.addEventListener('resize', rotulo);
  function entraAp(i, opt) {
    if (emAp) return;
    opt = opt || {};
    menu(false);
    emAp = true; dets.forEach(function (d) { d.open = true; });
    H.classList.add('apres'); ss('eco.ap', '1'); setBtns(true);
    apBar.hidden = false;
    mostra(i);
    if (!opt.semFs) tentaFs();
    try { main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); } catch (e) {}
  }
  function sairAp() {
    if (!emAp) return;
    var i = apI; emAp = false;
    fechaAjuda();
    H.classList.remove('apres'); ss('eco.ap', null); setBtns(false);
    secs.forEach(function (s) { s.classList.remove('atual'); });
    try { var ab = JSON.parse(ss('eco.det') || '[]'); dets.forEach(function (d) { d.open = ab.indexOf(d.id) > -1; }); } catch (e) {}
    saiFs();
    jump(secs[i].getBoundingClientRect().top + W.scrollY - mastH() - 4);
    usuario = true; ultimoHash = ''; salvaPos(); marca();
    var b = $('#apBtn'); if (b) b.focus({ preventScroll: true });
  }
  function abreAjuda() { if (apHelp) { apHelp.hidden = false; var c = $('button', apHelp); if (c) c.focus(); } }
  function fechaAjuda() { if (apHelp && !apHelp.hidden) { apHelp.hidden = true; var b = $('#apHelpBtn'); if (b && emAp) b.focus({ preventScroll: true }); } }
  apBtns.forEach(function (b) { b.addEventListener('click', function () { if (emAp) sairAp(); else entraAp(secAtual()); }); });
  $('#apPrev').addEventListener('click', anterior);
  $('#apNext').addEventListener('click', proximo);
  $('#apExit').addEventListener('click', sairAp);
  $('#apHelpBtn').addEventListener('click', function () { if (apHelp.hidden) abreAjuda(); else fechaAjuda(); });
  $('#apFs').addEventListener('click', alternaFs);
  if (!temFs) { var fsb = $('#apFs'); fsb.hidden = true; var nf = $('#semFs'); if (nf) nf.hidden = false; }
  $('.fecha-ajuda', apHelp).addEventListener('click', fechaAjuda);
  apHelp.addEventListener('click', function (e) { if (e.target === apHelp) fechaAjuda(); });

  D.addEventListener('keydown', function (e) {
    var t = e.target, tag = t && t.tagName, campo = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable);
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!emAp) { if (e.key === '/' && !campo && busca) { e.preventDefault(); if (W.innerWidth < 1180) menu(true); busca.focus(); } return; }
    if (campo) return;
    var k = e.key;
    if (k === 'Escape') { e.preventDefault(); if (apHelp && !apHelp.hidden) fechaAjuda(); else sairAp(); return; }
    if (apHelp && !apHelp.hidden) { if (k === '?' || k === 'h' || k === 'H') { e.preventDefault(); fechaAjuda(); } return; }
    var botao = tag === 'BUTTON' || tag === 'A' || tag === 'SUMMARY';
    if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !botao && !e.shiftKey)) { e.preventDefault(); proximo(); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || (k === ' ' && !botao && e.shiftKey)) { e.preventDefault(); anterior(); }
    else if (k === 'Home') { e.preventDefault(); mostra(0); }
    else if (k === 'End') { e.preventDefault(); mostra(N - 1); }
    else if (k === 'f' || k === 'F') { e.preventDefault(); alternaFs(); }
    else if (k === '?' || k === 'h' || k === 'H') { e.preventDefault(); abreAjuda(); }
  });
  var tx = 0, ty = 0, tt = 0;
  main.addEventListener('touchstart', function (e) { if (!emAp || e.touches.length !== 1) return; tx = e.touches[0].clientX; ty = e.touches[0].clientY; tt = Date.now(); }, { passive: true });
  main.addEventListener('touchend', function (e) {
    if (!emAp || !e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Date.now() - tt < 800 && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) mostra(apI + (dx < 0 ? 1 : -1));
  }, { passive: true });

  W.addEventListener('hashchange', function () {
    var h = dec((W.location.hash || '').slice(1)); if (!h) return;
    var el = D.getElementById(h), s = secDe(el);
    if (emAp) { if (s) { var i = secs.indexOf(s); if (i !== apI) mostra(i, el); else if (el !== s) { try { el.scrollIntoView({ block: 'start' }); } catch (e) {} } } }
    else { ultimoHash = h; marca(); }
  });

  /* ---------- início ---------- */
  var h0 = dec((W.location.hash || '').slice(1)), s0 = h0 ? secDe(D.getElementById(h0)) : null;
  if (ss('eco.ap') === '1') {
    var i0 = s0 ? secs.indexOf(s0) : parseInt(ss('eco.apIdx') || '0', 10) || 0;
    entraAp(i0, { semFs: true });
    if (s0 && D.getElementById(h0) !== s0) { try { D.getElementById(h0).scrollIntoView({ block: 'start' }); } catch (e) {} }
  } else {
    aplicaPosicao(); marca();
    var refaz = function () { if (!usuario && !emAp) aplicaPosicao(); marca(); };
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(refaz);
    W.addEventListener('load', function () { refaz(); setTimeout(function () { pronto = true; }, 50); });
    setTimeout(function () { pronto = true; }, 1200);
  }
  if (D.readyState === 'complete') pronto = true;
  W.__eco = { N: N, ids: ids, mostra: mostra, entraAp: entraAp, sairAp: sairAp, estado: function () { return { ap: emAp, i: apI }; } };
})();
