// Página Hoje: o aviso de rede diz a verdade (rede x servidor lento x servidor com erro) e uma chamada lenta (3 tentativas) conta como UMA falha.
import { readFileSync } from "node:fs"; import vm from "node:vm";
const html = readFileSync(new URL("../hoje/felipe/index.html", import.meta.url), "utf8");
const ini = html.indexOf("var REDE = {"); const fim = html.indexOf("\n}\n", html.indexOf("async function api(")) + 3; const codigo = html.slice(ini, fim);
let ok = 0, f = 0; const t = (n, c, x) => { if (c) ok++; else { f++; console.log("FALHOU:", n, x !== undefined ? JSON.stringify(x) : ""); } };
function novo({ fetchImpl, online = true }) {
  const faixas = {}; const ctx = { console, setTimeout, clearTimeout, Date, Promise, Math, JSON, Object, Error, AbortController, Number, S: { token: "t" }, API: "https://x", navigator: { onLine: online }, jitter: () => 0, $: () => null, el: () => ({}), document: { getElementById: () => null },
    faixa: (id, texto) => { if (texto) faixas[id] = texto; else delete faixas[id]; }, fetch: fetchImpl };
  vm.createContext(ctx); vm.runInContext(codigo + "\nthis.__api = api; this.__REDE = REDE; this.__marca = marcaRede; this.faixa = faixa;", ctx); ctx.faixa = (id, texto) => { if (texto) faixas[id] = texto; else delete faixas[id]; }; ctx.__REDE.escala = 0.001; return { ctx, faixas };
}
const resp = (status, corpo = {}) => ({ status, json: async () => corpo, headers: { get: () => null } });
{ const w = novo({ fetchImpl: async () => { throw new TypeError("Failed to fetch"); }, online: false }); await w.ctx.__api("/fila"); t("H1 uma chamada com 3 tentativas falhas conta UMA falha (sem aviso ainda)", w.ctx.__REDE.falhas === 1 && !w.faixas.rede, { f: w.ctx.__REDE.falhas, fx: w.faixas });
  await w.ctx.__api("/fila"); t("H2 offline de verdade, 2ª chamada: 'Sem conexão, tentando de novo...'", /Sem conexão, tentando de novo/.test(w.faixas.rede || ""), w.faixas); }
{ const w = novo({ fetchImpl: async () => resp(500, { erro: "x" }) }); await w.ctx.__api("/fila"); await w.ctx.__api("/fila"); t("H3 erro 500 do servidor: o aviso culpa o SERVIDOR, não a conexão", /servidor não está respondendo direito/.test(w.faixas.rede || "") && !/Sem conexão/.test(w.faixas.rede || ""), w.faixas); }
{ const w = novo({ fetchImpl: async () => { throw new TypeError("Failed to fetch"); }, online: true }); await w.ctx.__api("/fila"); await w.ctx.__api("/fila"); t("H4 internet ok mas o servidor não responde (erro de rede com navigator online): culpa o servidor", /servidor/.test(w.faixas.rede || ""), w.faixas); }
{ let n = 0; const w = novo({ fetchImpl: async () => (++n <= 6 ? resp(503) : resp(200, { ok: true })) }); await w.ctx.__api("/a"); await w.ctx.__api("/b"); t("H5 falhou 2 chamadas: aviso aparece", !!w.faixas.rede, w.faixas); const r = await w.ctx.__api("/c"); t("H6 voltou a responder: aviso some e contador zera", r.ok === true && !w.faixas.rede && w.ctx.__REDE.falhas === 0, { fx: w.faixas, f: w.ctx.__REDE.falhas }); }
{ const w = novo({ fetchImpl: async (u, i) => new Promise((_, rej) => { i.signal.addEventListener("abort", () => rej(Object.assign(new Error("abort"), { name: "AbortError" }))); }) }); await w.ctx.__api("/lenta"); await w.ctx.__api("/lenta"); t("H7 servidor que não responde a tempo (timeout): 'O servidor está lento'", /servidor está lento/.test(w.faixas.rede || ""), w.faixas); }
{ const w = novo({ fetchImpl: async () => resp(429) }); const r = await w.ctx.__api("/x"); t("H8 429 (limite) NÃO acende aviso de conexão (o servidor respondeu)", !w.faixas.rede && w.ctx.__REDE.falhas === 0, { fx: w.faixas, r: r._status }); }
console.log(`hoje_rede: ${ok} ok, ${f} falhas`); process.exit(f ? 1 : 0);
