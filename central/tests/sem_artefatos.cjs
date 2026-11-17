// Central 16/11 (#2294, dono): nenhum link para artefatos na Central. Teste ESTÁTICO: falha se 'claude.ai', '/artifact/' ou 'artefato' aparecer em central/index.html.
// Rodar: node central/tests/sem_artefatos.cjs
const fs = require("fs"); const path = require("path");
const h = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8"); const f = [];
for (const [re, n] of [[/claude\.ai/i, "claude.ai"], [/\/artifact\//i, "/artifact/"], [/artefato/i, "artefato"]]) { const m = h.match(re); if (m) f.push(n + " em central/index.html: …" + h.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\n/g, " ") + "…"); }
const links = (h.match(/https?:\/\/[^'"\s)<>]+/g) || []).filter((u) => /claude|anthropic/i.test(u)); if (links.length) f.push("links suspeitos: " + links.join(", "));
console.log(`sem_artefatos: 4 verificações; falhas: ${f.length}`); f.forEach((x) => console.log(" - " + x)); process.exit(f.length ? 1 : 0);
