// Base comum dos testes novos da Central (17/11): servidor falso + login + contadores.
// Uso: const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]);
const fs = require("fs"); const path = require("path");
const fx = JSON.parse(fs.readFileSync(path.join(__dirname, "fixture.json")));
const BASE = process.env.CENTRAL_URL || "http://localhost:8802/central/";
const T0 = Date.now();
const FONE = "5562999990000";
function agentesPadrao(extra = {}) {
  return { ok: true, agentes: [{ id: "sdr_inbound", nome: "Ana (SDR Inbound)", saude: { ok: true, modo: "sombra", killSwitch: false, responde: false, versao: "0.3.0", segredos: { anthropic: true, openrouter: true, meta_token: false, meta_phone_id: false } }, config: { modo: "sombra", killSwitch: false, qualificacao: { minimoFarmacia: 100000, minimoSupermercado: 300000 }, ritmo: { inicial: 100, teto: 1000 }, cadencia: { maxContatos: 5, janelaDias: 6, horaIni: 8, horaFim: 20 }, humano: { debounceMs: 4000 }, destino: { sdrNome: "Felipe", sdrFone: "556293568997" } }, editaveis: [], conversas: [{ fone: FONE, nome: "Carlos da Drogaria Central", estagio: "perguntou_cnpj", humano: false, pausado: false, ts: T0 - 6e4 }, { fone: "5562988880000", nome: "Mariana", estagio: "aguardando_humano", humano: true, pausado: false, ts: T0 - 36e5 }], auditoria: [] , ...extra }] };
}
// opts: papel, expiraEm, usuario, over(path,url,req)->{status,json}|null, trocarSenha
function criarMock(opts = {}) {
  const log = []; const papel = opts.papel || "robert";
  const handler = async (route) => {
    const req = route.request(); const url = new URL(req.url()); const u = url.pathname.replace("/central", ""); let body = null; try { body = req.postData() ? JSON.parse(req.postData()) : null; } catch (e) {}
    log.push({ m: req.method(), u, q: url.search, body, tok: req.headers()["x-central-token"] || null });
    let status = 200, j = { ok: true };
    if (url.pathname === "/bia-saude") j = { geral: "ok", ts: Date.now(), itens: {} };
    else if (u === "/acesso/estado") j = { ok: true, precisaPrimeiroAcesso: false };
    else if (u === "/acesso/entrar") j = { ok: true, token: "tok-" + (opts.usuario || "robert"), usuario: opts.usuario || "robert@x.com", nome: "Robert", papel, trocarSenha: !!opts.trocarSenha, expiraEm: opts.expiraEm === undefined ? Date.now() + 12 * 3600e3 : opts.expiraEm || undefined };
    else if (u === "/acesso/sair") j = { ok: true };
    else if (u === "/eu") j = { ok: true, usuario: opts.usuario || "robert@x.com", nome: "Robert", papel, trocarSenha: !!opts.trocarSenha };
    else if (u === "/estado") j = { ...fx.est, agora: Date.now() };
    else if (u === "/historico") j = fx.h;
    else if (u === "/agentes") j = (opts.agentes || agentesPadrao)();
    else if (u === "/agentes/conversa") j = (opts.conversa ? opts.conversa(url) : { ok: true, humano: false, pausado: false, estagio: "perguntou_cnpj", pendentes: 0, hist: [], nome: "Lead", notas: [], log: [], dados: {} });
    else if (u === "/agentes/exclusao-autorizados") j = { ok: true, euPosso: true, autorizados: [] };
    else if (u === "/agentes/historico") j = { ok: true, temMais: false, itens: [] };
    else if (u === "/filas") j = { ok: true, itens: [] };
    else if (u === "/calendario") j = { ok: true, hoje: new Date().toISOString().slice(0, 10), dias: [] };
    else if (u === "/usuarios") j = { ok: true, itens: [{ usuario: "robert@x.com", nome: "Robert", papel: "robert", ativo: true }] };
    if (opts.over) { const o = await opts.over(u, url, req, body, log); if (o) { if (o.abort) return route.abort(); if (o.delay) await new Promise((r) => setTimeout(r, o.delay)); status = o.status || 200; j = o.json === undefined ? j : o.json; } }
    route.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" }, body: JSON.stringify(j) });
  };
  return { handler, log };
}
async function novaPagina(ctx, mock) { const p = await ctx.newPage(); p.on("pageerror", (e) => { (p._erros = p._erros || []).push(String(e)); }); p.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR/.test(m.text())) (p._erros = p._erros || []).push("console: " + m.text()); }); await p.route(/fonts\.(googleapis|gstatic)/, (r) => r.abort()); await p.route(/workers\.dev/, (r) => { if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } }); return mock.handler(r); }); return p; }
async function entrar(p, hash = "", manter) { await p.goto(BASE + hash); await p.waitForSelector("#usuario", { state: "visible", timeout: 8000 }); await p.fill("#usuario", "robert@x.com"); await p.fill("#senha", "x"); if (manter !== undefined) await p.setChecked("#manter", manter); await p.click("#btnEntrar"); await p.waitForSelector("#app:not(.hide)", { timeout: 8000 }); await p.waitForTimeout(500); }
function suite(nome) { const falhas = []; let checks = 0; return { ok(c, m) { checks++; if (!c) falhas.push(m); }, F(m) { falhas.push(m); }, fim(extra = "") { console.log(`${nome}: ${checks} verificações; falhas: ${falhas.length}${extra}`); falhas.forEach((x) => console.log(" - " + x)); process.exitCode = falhas.length ? 1 : 0; }, get falhas() { return falhas; }, get checks() { return checks; } }; }
module.exports = { fx, BASE, T0, FONE, agentesPadrao, criarMock, novaPagina, entrar, suite };
