// Utilitários dos testes do Ecossistema (14/11/2026). Rodar sempre com TZ=UTC e a página em disco.
import { createRequire } from "node:module"; import fs from "node:fs"; import path from "node:path"; import os from "node:os";
export const HOME = os.homedir();
export const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
export const PAGINA = process.env.PAGINA || path.join(RAIZ, "ecossistema/index.html");
export const HTML = fs.readFileSync(PAGINA, "utf8");
export const PRINTS = process.env.ECO_PRINTS || "/tmp/ecossistema_prints";
fs.mkdirSync(PRINTS, { recursive: true });
export const PW_DIR = process.env.PW_DIR || path.join(HOME, ".npm/_npx/e41f203b7505f1fb");
export const EXE = process.env.CHROME_EXE || path.join(HOME, "Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
export const URL_PAGINA = "https://projetojlbv.com.br/ecossistema/";
export let ok = 0, falhas = 0;
export const t = (nome, cond, extra = "") => { if (cond) ok++; else { falhas++; console.log("  FALHOU:", nome, typeof extra === "string" ? extra : JSON.stringify(extra).slice(0, 600)); } };
export const resumo = () => { console.log(`\nTOTAL: ${ok} passou, ${falhas} falhou`); process.exit(falhas ? 1 : 0); };
export async function abrirNavegador() {
  const require = createRequire(PW_DIR + "/node_modules/"); const { chromium } = require("playwright-core");
  return chromium.launch({ executablePath: EXE, headless: true });
}
// abre a página como se estivesse no endereço real (para hash, sessionStorage e fontes funcionarem)
export async function abrirPagina(nav, { w = 1440, h = 900, tema = "light", touch = false, hash = "", ctx: ctxOpt = {} } = {}) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, colorScheme: tema, hasTouch: touch, isMobile: touch && w < 800, timezoneId: "America/Sao_Paulo", deviceScaleFactor: 1, ...ctxOpt });
  const page = await ctx.newPage(); const erros = [];
  page.on("pageerror", (e) => erros.push("pageerror: " + String(e.message).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR|fonts\.g/.test(m.text())) erros.push("console: " + m.text().slice(0, 200)); });
  await page.route("https://projetojlbv.com.br/ecossistema/**", (r) => r.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: HTML }));
  await page.route("https://projetojlbv.com.br/*.png", (r) => { const f = path.join(RAIZ, new URL(r.request().url()).pathname); fs.existsSync(f) ? r.fulfill({ status: 200, contentType: "image/png", body: fs.readFileSync(f) }) : r.fulfill({ status: 404, body: "" }); });
  await page.route("https://projetojlbv.com.br/favicon*", (r) => r.fulfill({ status: 204, body: "" }));
  await page.goto(URL_PAGINA + hash, { waitUntil: "load" });
  try { await page.evaluate(() => document.fonts.ready); } catch (e) {}
  await page.waitForTimeout(350);
  return { ctx, page, erros };
}
export const semRolagemLateral = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
