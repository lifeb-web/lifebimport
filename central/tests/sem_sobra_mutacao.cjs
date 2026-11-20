// Guarda (20/11): nenhum arquivo de sobra de teste de mutação pode estar versionado nem existir em central/ (subiria PÚBLICO em /central/). Já aconteceu 2x (1e2616f6, 97a9db79). node central/tests/sem_sobra_mutacao.cjs
const { execSync } = require("child_process"); const fs = require("fs"); const path = require("path");
const raiz = path.join(__dirname, "..", ".."); let ruins = [];
const ruim = (f) => /(^|\/)(_?mut[^\/]*\.html|_mut[^\/]*|[^\/]*\.mut\.[^\/]*)$/i.test(f) && !/^central\/tests\/[a-z_]*mutacao\.cjs$/.test(f);
for (const f of execSync("git ls-files central", { cwd: raiz, encoding: "utf8" }).split("\n").filter(Boolean)) if (ruim(f)) ruins.push("versionado: " + f);
for (const f of fs.readdirSync(path.join(raiz, "central"))) if (ruim("central/" + f)) ruins.push("na pasta: central/" + f);
// o teste de mutação não pode gravar html dentro do repositório
const m = fs.readFileSync(path.join(__dirname, "mutacao.cjs"), "utf8"); if (/writeFileSync\([^)]*RAIZ/.test(m) || /writeFileSync\(arq/.test(m)) ruins.push("mutacao.cjs grava dentro do repositório");
console.log(`sem_sobra_mutacao: ${ruins.length ? "FALHOU" : "ok"}; ${ruins.length} problema(s)`); ruins.forEach((r) => console.log(" - " + r)); process.exit(ruins.length ? 1 : 0);
