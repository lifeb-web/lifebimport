// Rodar: servir a raiz do site (python3 -m http.server 8799), DASH_FIXTURES=<pasta dos json de mock> node t_legibilidade.mjs
// Biblioteca comum dos testes do telao legivel (Playwright). Uso: import { ... } from './telao_lib.mjs'
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const EXE = process.env.CHROME_BIN || process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
export const BASE = process.env.DASH_BASE || 'http://localhost:8799/dash/geral/';
export const FIX = process.env.DASH_FIXTURES || path.join(AQUI, 'fixtures');   // (nao versionada: tem dados do painel) pasta com mock_atv.json, mock_etp.json, mock_ini.json, mock_saude.json, ga4_*.json
export const VIEWS = ['vendas', 'ltv', 'sdr', 'ads', 'ga4', 'bia'];
// minimos (em px do palco 1440x810; equivalem a 12 / 14 / 28 / 20 px numa TV 1080p)
export const MIN = { rotulo: 9, corpo: 10.5, kpi: 21, interativo: 15 };
export const MIN_1080 = { rotulo: 12, corpo: 14, kpi: 28, interativo: 20 };
export const FORMATOS = [[1920, 1080, 'TV 1080p'], [3840, 2160, 'TV 4K'], [1800, 1012, 'telao 1800'], [1366, 768, 'notebook 1366'], [1536, 864, 'notebook 1536'], [2560, 1440, 'PC 2560']];
export const AUD = fs.readFileSync(path.join(AQUI, 'aud_fn.js'), 'utf8');

export async function abrir(W, H, opts = {}) {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: !!opts.touch, reducedMotion: opts.reducedMotion || 'no-preference', colorScheme: opts.colorScheme || 'light' });
  const p = await ctx.newPage(); p.errs = [];
  p.on('response', r => { if (r.status() >= 400) p.errs.push('HTTP' + r.status() + ' ' + r.url().slice(0, 110)); });
  p.on('pageerror', e => p.errs.push('PAGEERROR ' + e.message.slice(0, 150)));
  p.on('console', m => { if (m.type() === 'error') p.errs.push('console ' + m.text().slice(0, 140)); });
  await mocar(p, opts.mock || 'ok');
  if (opts.congelaBia) await p.route(/bia-dash-sync/, r => r.abort());
  await p.goto(BASE + 'telao/index.html?rot=0' + (opts.q || process.env.DASH_Q || ''), { waitUntil: 'commit' });
  await p.waitForTimeout(opts.espera || 9000);
  const frame = () => p.frames().find(x => x !== p.mainFrame()) || p;
  return { b, p, f: frame };
}
export async function mocar(p, mode = 'ok') {
  const cors = { 'access-control-allow-origin': '*' };
  const rd = n => fs.readFileSync(path.join(FIX, n), 'utf8');
  const rota = (re, arq) => p.route(re, r => {
    if (mode === 'rede') return r.abort();
    if (mode === 'err500') return r.fulfill({ status: 500, headers: cors, body: 'erro' });
    return r.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: rd(arq) });
  });
  await rota(/gs-agendor-worker.*\/sdr-atividades/, 'mock_atv.json');
  await rota(/gs-agendor-worker.*\/sdr-etapas/, 'mock_etp.json');
  await rota(/gs-agendor-worker.*\/sdr-iniciados/, 'mock_ini.json');
  await rota(/gs-agendor-worker.*\/bia-saude/, 'mock_saude.json');
  await p.route(/ga4-dash-cache.*\/api\/bundle/, r => {
    if (mode === 'rede') return r.abort();
    if (mode === 'err500') return r.fulfill({ status: 500, headers: cors, body: 'erro' });
    const u = new URL(r.request().url()); const per = u.searchParams.get('periodo');
    return r.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: rd(per === 'hoje' ? 'ga4_hoje.json' : per === 'mes' ? 'ga4_mes.json' : 'ga4_custom.json') });
  });
}
export const ir = async (f, v) => f.evaluate(v => { const b = document.querySelector('.ochip[data-v="' + v + '"]'); if (b) b.click(); }, v);
export const per = async (f, v) => f.evaluate(v => { const b = document.querySelector('.pchip[data-p="' + v + '"]'); if (b) b.click(); }, v);
export const ori = async (f, v) => f.evaluate(v => { const b = document.querySelector('.ochip[data-o="' + v + '"]'); if (b) b.click(); }, v);
export const pagina = async (f, k) => f.evaluate(k => window.__pg && window.__pg.set(k, true), k);
export const nPaginas = async f => f.evaluate(() => window.__pg ? window.__pg.count() : 1);

/** devolve a lista de violacoes de uma medicao AUD (px do palco) */
export function violacoes(r, W, H) {
  const out = [];
  const esc = Math.min(W / 1920, H / 1080), z = r.z || 1, k = z / esc; // css -> "px numa TV 1080p"
  const eq = (css) => +(css * k).toFixed(1);
  r.labV.forEach(x => out.push('rotulo < ' + MIN_1080.rotulo + 'px(1080p): ' + x));
  r.bodyV.forEach(x => out.push('corpo < ' + MIN_1080.corpo + 'px(1080p): ' + x));
  r.kpiV.forEach(x => out.push('numero KPI < ' + MIN_1080.kpi + 'px(1080p): ' + x));
  r.apoioV.forEach(x => out.push('numero de apoio < 16px(1080p): ' + x));
  r.grandeV.forEach(x => out.push('numero grande demais (>22px 1080p) fora de KPI hero: ' + x));
  r.intV.forEach(x => out.push('alvo/icone pequeno: ' + x));
  r.iconV.forEach(x => out.push('icone pequeno: ' + x));
  r.cardV.forEach(x => out.push('cartao achatado/pequeno: ' + x));
  r.clip.forEach(x => out.push('corte: ' + x));
  r.over.forEach(x => out.push('sobreposicao/fora da tela: ' + x));
  r.empty.forEach(x => out.push('area vazia: ' + x));
  if (r.hscroll > 0) out.push('rolagem horizontal ' + r.hscroll);
  if (r.vscroll > 0) out.push('rolagem vertical da pagina ' + r.vscroll);
  (r.vazioCard || []).forEach(x => out.push('cartao vazio (so moldura/titulo): ' + x));
  r.bad.forEach(x => out.push('texto invalido: ' + x));
  return out;
}
