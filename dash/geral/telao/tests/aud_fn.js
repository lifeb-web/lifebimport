(() => {
  const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0'; };
  const inHidden = e => { for (let x = e; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden') return true; } return false; };
  const sel = e => { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; else if (e.className && typeof e.className === 'string') s += '.' + e.className.trim().split(/\s+/).slice(0,2).join('.'); return s; };
  const LAB = /(badge|pill|tag|chip|delta|label|lbl|sub|foot|aviso|hint|note|-l2|-kl|-kt|-kd|-ct|-cs|ttl|title|hd)/i;
  const KPI = /(kc-val|hero-val|ac-val|s2-kv|sc-num|rv-hero-val|hero-big)/;
  const APO = /(funil-n|orig-i-pc|pz-pc)/;
  const z = (() => { let m = 1; try { const pr = window.parent !== window ? window.parent.document.getElementById('palco') : null; if (pr) { const t = (pr.style.transform||'').match(/scale\(([\d.]+)\)/); if (t) m = +t[1]; } } catch (e) {} return m; })();
  const o = { z, vazioCard: [], minLab: 99, minBody: 99, minKpi: 99, minApoio: 99, maxApoio: 0, apoioV: [], grandeV: [], labV: [], bodyV: [], kpiV: [], intV: [], iconV: [], cardV: [], clip: [], over: [], empty: [], bad: [] };
  document.querySelectorAll('body *').forEach(e => {
    if (e.closest('svg,canvas,script,style,.expand-overlay,#modal-overlay,#custom-panel,#month-pick-panel,#lb')) return;
    if (!vis(e) || inHidden(e)) return;
    const own = Array.from(e.childNodes).some(n => n.nodeType === 3 && n.textContent.trim()); if (!own) return;
    const cs = getComputedStyle(e); const f = parseFloat(cs.fontSize); const txt = e.textContent.trim().slice(0, 22);
    const cls = (typeof e.className === 'string' ? e.className : '') + ' ' + (e.id||'');
    if (KPI.test(cls) && /\d/.test(e.textContent)) { o.minKpi = Math.min(o.minKpi, f); if (f < 21) o.kpiV.push(sel(e) + ' ' + f + ' "' + txt + '"'); return; }
    // 3 niveis de numero: KPI hero (>=21 palco = 28px TV) | apoio (>=12 e <=16.6 palco = 16 a 22px TV) | tabela (14 a 16px TV). Numero que nao e KPI nunca passa de 22px TV.
    if (!e.closest('header,#hero,#ltv-hero,#sdr-hero,#ads-hero,#ga4-hero,#bia-hero') && /\d/.test(e.textContent) && !KPI.test(cls)) { if (APO.test(cls)) { o.minApoio = Math.min(o.minApoio, f); o.maxApoio = Math.max(o.maxApoio, f); if (f < 12) o.apoioV.push(sel(e) + ' ' + f + ' "' + txt + '"'); } if (f > 16.6) o.grandeV.push(sel(e) + ' ' + f + ' "' + txt + '"'); }
    const isLab = cs.textTransform === 'uppercase' || e.tagName === 'TH' || LAB.test(cls) || (parseFloat(cs.letterSpacing) > 0.3);
    if (isLab) { o.minLab = Math.min(o.minLab, f); if (f < 9) o.labV.push(sel(e) + ' ' + f + ' "' + txt + '"'); }
    else { o.minBody = Math.min(o.minBody, f); if (f < 10.5) o.bodyV.push(sel(e) + ' ' + f + ' "' + txt + '"'); }
  });
  document.querySelectorAll('svg text').forEach(e => { if (!vis(e) || inHidden(e) || e.closest('.expand-overlay,#modal-overlay')) return; const r = e.getBoundingClientRect(); const f = r.height / 1.25; if (f < 9) o.labV.push('svg-text ' + f.toFixed(1) + ' "' + e.textContent.trim().slice(0,12) + '"'); o.minLab = Math.min(o.minLab, f); });
  document.querySelectorAll('button,a,[onclick],select,input,.pchip,.ochip').forEach(e => { if (!vis(e) || inHidden(e) || e.closest('.expand-overlay,#modal-overlay,#custom-panel,#month-pick-panel')) return; const r = e.getBoundingClientRect(); const mn = Math.min(r.width, r.height); if (mn < 15) o.intV.push(sel(e) + ' ' + r.width.toFixed(0) + 'x' + r.height.toFixed(0) + ' "' + (e.textContent||'').trim().slice(0,10) + '"'); });
  document.querySelectorAll('img,svg').forEach(e => { if (!vis(e) || inHidden(e) || e.closest('.expand-overlay,#modal-overlay,canvas,[id$="chart"],[id$="spark"],.chart,.s2-chart')) return; if (e.tagName === 'svg' && e.getBoundingClientRect().width > 90) return; const r = e.getBoundingClientRect(); if (Math.min(r.width, r.height) < 15 && !e.closest('button')) o.iconV.push(sel(e) + ' ' + r.width.toFixed(0) + 'x' + r.height.toFixed(0)); });
  const cards = Array.from(document.querySelectorAll('.card,.s2-card,.kchip,.achip,.s2-k,#hero,#sdr-hero,#ltv-hero,#ads-hero')).filter(e => vis(e) && !inHidden(e));
  o.nCards = cards.length; o.ratios = [];
  o.placeholders = []; document.querySelectorAll('.lb-ph').forEach(c => { if (c.parentElement && !inHidden(c.parentElement)) o.placeholders.push(sel(c.parentElement) + ' "' + c.textContent + '"'); });
  cards.filter(c => /(^| )(card|s2-card)( |$)/.test(c.className)).forEach(c => { const ch = Array.from(c.children).filter(k => !k.matches('.card-hd,.s2-ch,.expand-btn,.xp-btn')); const tem = ch.some(k => (k.textContent||'').replace(/\s+/g,'').length > 0 || k.querySelector('svg,canvas,img,table,input,button') || k.classList.contains('lb-ph')); if (!tem) o.vazioCard.push(sel(c)); });
  cards.forEach(c => { const r = c.getBoundingClientRect(); const kp = /kchip|achip|s2-k|hero/.test(c.className + c.id); const ratio = r.width / r.height; o.ratios.push(+ratio.toFixed(2));
    if (kp) { if (r.height < 60 || ratio > 3.6 || ratio < 0.9) o.cardV.push('KPI ' + sel(c) + ' ' + r.width.toFixed(0) + 'x' + r.height.toFixed(0) + ' r' + ratio.toFixed(1)); }
    else { if (r.height < 100 || ratio > 5) o.cardV.push('PAINEL ' + sel(c) + ' ' + r.width.toFixed(0) + 'x' + r.height.toFixed(0) + ' r' + ratio.toFixed(1)); }
    const cs = getComputedStyle(c); if (cs.overflowY !== 'visible' && c.scrollHeight > c.clientHeight + 2) o.clip.push(sel(c) + ' sh' + c.scrollHeight + '/ch' + c.clientHeight);
    if (c.scrollWidth > c.clientWidth + 2 && cs.overflowX !== 'visible') o.clip.push('X ' + sel(c) + ' sw' + c.scrollWidth + '/cw' + c.clientWidth);
    // texto cortado por ellipsis/overflow dentro do cartão
    c.querySelectorAll('*').forEach(e => { if (!vis(e)) return; const cs2 = getComputedStyle(e); const ownT = Array.from(e.childNodes).some(n => n.nodeType === 3 && n.textContent.trim()); if (ownT && (cs2.textOverflow === 'ellipsis' || cs2.overflowX === 'hidden') && e.scrollWidth > e.clientWidth + 1 && !e.closest('.expand-overlay')) o.clip.push('TXT ' + sel(e) + ' "' + e.textContent.trim().slice(0,20) + '" ' + e.scrollWidth + '/' + e.clientWidth); });
    // vazio dentro do cartão
    if (r.height > 90) { let maxB = r.top; c.querySelectorAll('*').forEach(ch => { if (!vis(ch)) return; const rr = ch.getBoundingClientRect(); if (rr.height > 0 && rr.bottom > maxB && rr.bottom <= r.bottom + 2) maxB = rr.bottom; }); const pad = parseFloat(cs.paddingBottom) || 0; const emp = r.bottom - maxB - pad; if (emp > 48 && emp > r.height * 0.35) o.empty.push(sel(c) + ' h' + r.height.toFixed(0) + ' vazio' + emp.toFixed(0)); }
  });
  const gr = new Map(); cards.forEach(e => { const pp = e.parentElement; if (!gr.has(pp)) gr.set(pp, []); gr.get(pp).push(e); });
  gr.forEach(arr => { for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) { const a = arr[i].getBoundingClientRect(), bb = arr[j].getBoundingClientRect(); const ox = Math.min(a.right, bb.right) - Math.max(a.left, bb.left), oy = Math.min(a.bottom, bb.bottom) - Math.max(a.top, bb.top); if (ox > 3 && oy > 3 && !arr[i].contains(arr[j]) && !arr[j].contains(arr[i])) o.over.push(sel(arr[i]) + ' x ' + sel(arr[j]) + ' ' + ox.toFixed(0) + 'x' + oy.toFixed(0)); } });
  const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
  cards.forEach(c => { const r = c.getBoundingClientRect(); if (r.right > vw + 1 || r.left < -1 || r.bottom > vh + 1) o.over.push('FORA ' + sel(c) + ' R' + r.right.toFixed(0) + ' B' + r.bottom.toFixed(0) + ' vw' + vw + ' vh' + vh); });
  o.hscroll = document.documentElement.scrollWidth - vw; o.vscroll = document.documentElement.scrollHeight - vh;
  const txt = document.body.innerText; o.bad = (txt.match(/\b(NaN|undefined|null|Infinity|\[object)/g) || []).slice(0, 5);
  o.vw = vw; o.vh = vh;
  o.pages = window.__pg ? window.__pg.count() : 1; o.pg = window.__pg ? window.__pg.cur() : 1;
  return o; })()