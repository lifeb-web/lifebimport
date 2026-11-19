// Ajuda comum aos testes em Chromium: trava /tmp/chromium.lock (mkdir/rmdir, nunca remove trava alheia),
// serve o painel gerado a partir do molde e simula o servidor (GET /leads etc.) por interceptação de rede.
const fs = require('fs'); const path = require('path');
const PW = process.env.PW_CORE || '/Users/robertmarques/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core';
const EXE = process.env.CHROMIUM || '/Users/robertmarques/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const LOCK = '/tmp/chromium.lock';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let tenhoTrava = false;
async function pegarTrava(maxMs = 20 * 60000) {
  const t0 = Date.now();
  for (;;) {
    try { fs.mkdirSync(LOCK); tenhoTrava = true; return; } catch (e) { if (e.code !== 'EEXIST') throw e; }
    if (Date.now() - t0 > maxMs) throw new Error('trava do Chromium ocupada por mais de ' + maxMs / 1000 + 's');
    await sleep(5000);
  }
}
function soltarTrava() { if (tenhoTrava) { try { fs.rmdirSync(LOCK); } catch (_) {} tenhoTrava = false; } }
process.on('exit', soltarTrava); process.on('SIGINT', () => { soltarTrava(); process.exit(1); });
function paginaGerada(rep = 'TESTE', display = 'Teste', token = 'tok-teste') {
  const src = fs.readFileSync(path.join(__dirname, '..', 'dashboard-rep-template.html'), 'utf8');
  return src.split('__REP_NAME__').join(rep).split('__REP_DISPLAY__').join(display).split('__REP_TOKEN__').join(token);
}
// leads: função () => array do servidor; opts.posts recebe as escritas. Resposta de POST configurável.
async function abrir(browser, { largura = 390, altura = 844, leads, post, metrics, extraStorage, dpr = 2 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: dpr, isMobile: largura < 700, hasTouch: largura < 700, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
  const page = await ctx.newPage();
  const posts = []; const reqs = [];
  await page.route('**/*', async route => {
    const req = route.request(); const url = new URL(req.url());
    if (url.hostname === 'lifeb-rep-painel.robert131196.workers.dev') {
      reqs.push({ m: req.method(), p: url.pathname });
      const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      let status = 200, body = { ok: true };
      if (req.method() === 'POST') {
        let b = {}; try { b = JSON.parse(req.postData() || '{}'); } catch (_) {}
        posts.push({ p: url.pathname, body: b });
        if (post) { const r = await post(url.pathname, b); if (r) { status = r.status || 200; body = r.body; } }
        else body = { ok: true, dealId: b.dealId };
      } else if (url.pathname === '/leads') body = { ok: true, leads: leads ? leads() : [] };
      else if (url.pathname === '/metrics') body = metrics || { ok: true, ganhos: 3, valorVendido: 42000, ticketMedio: 14000 };
      else if (url.pathname === '/historico') body = { ok: true, itens: [], historico: [] };
      return route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    }
    if (url.protocol === 'about:' || url.href === 'https://projetojlbv.com.br/rep/dash/teste/') return route.fulfill({ status: 200, contentType: 'text/html', body: paginaGerada() });
    if (url.hostname === 'projetojlbv.com.br') return route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC', 'base64') });
    return route.abort();
  });
  if (extraStorage) await page.addInitScript(s => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, extraStorage);
  const erros = []; page.on('pageerror', e => erros.push(String(e.message).slice(0, 200)));
  await page.goto('https://projetojlbv.com.br/rep/dash/teste/', { waitUntil: 'domcontentloaded' });
  return { ctx, page, posts, reqs, erros };
}
module.exports = { PW, EXE, pegarTrava, soltarTrava, abrir, paginaGerada, sleep };
