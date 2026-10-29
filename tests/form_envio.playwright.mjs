import { chromium } from "playwright-core";
const pagina = process.argv[2] || "/";
const b = await chromium.launch({ executablePath: process.env.HOME + "/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing", headless: true });
const ctx = await b.newContext(); const p = await ctx.newPage();
const reqs = [];
await p.route(/googletagmanager|facebook\.|google-analytics|fonts\./, (r) => r.abort());
await p.route(/workers\.dev|script\.google\.com/, async (r) => { const q = r.request(); reqs.push({ url: q.url().replace(/.*\/\/([^/]+).*(\/[a-z-]*)$/, "$1$2"), m: q.method(), ct: q.headers()["content-type"], body: q.postData() }); await r.fulfill({ status: 200, headers: { "access-control-allow-origin": "*" }, body: "{}" }); });
ctx.on("page", async (np) => { await np.close().catch(() => {}); }); // window.open do WhatsApp
p.on("pageerror", (e) => console.log("pageerror", e.message));
await p.goto("http://localhost:8765" + pagina + "?utm_campaign=C1&utm_content=J2&utm_term=A3");
await p.waitForTimeout(1200);
const cta = pagina.includes("lifeb") ? p.locator(".js-lead-cta").first() : p.getByText("Quero esse resultado na minha loja").first();
await cta.click(); await p.waitForTimeout(500);
const inputs = await p.evaluate(() => [...document.querySelectorAll("input")].map((i) => i.placeholder + "|" + i.type));
console.log("inputs", inputs.join(" ; "));
// 1) abandono: preenche só telefone e fecha a aba
await p.locator("#leadNome, input[placeholder=\"Seu nome\"]").first().fill("");
const tel = p.locator('input[type="tel"]').first();
await tel.fill("62981112233");
await p.evaluate(() => window.dispatchEvent(new Event("beforeunload")));
await p.waitForTimeout(500);
console.log("APÓS FECHAR A ABA:", JSON.stringify(reqs.filter((r) => /workers/.test(r.url)).map((r) => ({ ct: r.ct, body: r.body }))));
reqs.length = 0;
// 2) envio normal
await p.locator("#leadNome, input[placeholder=\"Seu nome\"]").first().fill("TESTE Playwright");
await tel.fill("62981112233");
await p.locator('#leadForm button[type="submit"], form button[type="submit"]').first().click();
await p.waitForTimeout(1200);
console.log("ENVIO:", JSON.stringify(reqs.map((r) => ({ u: r.url, m: r.m, ct: r.ct, body: r.body && r.body.slice(0, 260) })), null, 1));
await b.close();
