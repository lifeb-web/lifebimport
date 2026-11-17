#!/usr/bin/env node
// Confere se o Ecossistema pode estar desatualizado (somente leitura). Uso: node tools/ecossistema/conferir_estado.mjs [caminho-do-repo-da-Bia]
// Lê os commits "deploy:" de origin/main do repositório da Bia e da Ana (gs-agendor-worker) e a data de estado.json; imprime quais componentes (Ana, Bia, Hoje, Central) tiveram deploy DEPOIS dessa data.
// Último passo de todo deploy (ver ATUALIZAR-A-CADA-DEPLOY.md). Sai com código 0; o aviso é só informativo.
import { execFileSync } from "node:child_process"; import fs from "node:fs"; import path from "node:path"; import os from "node:os";
const AQUI = path.dirname(new URL(import.meta.url).pathname);
const estado = JSON.parse(fs.readFileSync(path.join(AQUI, "estado.json"), "utf8"));
const [dd, mm, aaaa] = estado.atualizado_em.split("/").map(Number); const limite = new Date(aaaa, mm - 1, dd, 23, 59, 59);   // fim do dia de atualização
const candidatos = [process.argv[2], "/tmp/saude_codigo", "/private/tmp/ana_pacote1", path.join(os.homedir(), "Desktop/gs-agendor-worker")].filter(Boolean);
const repo = candidatos.find((r) => { try { return fs.existsSync(path.join(r, ".git")) || fs.existsSync(r + "/.git"); } catch { return false; } });
if (!repo) { console.log("Nenhum repositório do worker encontrado; informe o caminho como argumento. Não foi possível conferir."); process.exit(0); }
let saida = ""; try { saida = execFileSync("git", ["-C", repo, "log", "origin/main", "--grep=^deploy:", "--format=%cI%x1f%B%x1e", "-n", "60"], { encoding: "utf8" }); } catch (e) { console.log("Falha ao ler o git (somente leitura):", String(e.message).slice(0, 120)); process.exit(0); }
const ultimo = {};   // componente -> { quando, resumo }
for (const bloco of saida.split("\x1e")) {
  const [quando, msg] = bloco.trim().split("\x1f"); if (!quando || !msg) continue; const d = new Date(quando);
  const comp = new Set(); const m = /mudou na (Bia|Ana|Central|Hoje)/i.exec(msg); if (m) comp.add(m[1][0].toUpperCase() + m[1].slice(1).toLowerCase());
  if (/p[áa]gina Hoje|\bHoje\b/i.test(msg)) comp.add("Hoje"); if (/\bCentral\b/.test(msg)) comp.add("Central"); if (/agente-sdr/.test(msg.split("\n").slice(0, 6).join(" "))) comp.add("Ana");
  for (const c of comp) if (!ultimo[c] || d > ultimo[c].quando) ultimo[c] = { quando: d, resumo: msg.split("\n").slice(0, 2).join(" ").replace(/\s+/g, " ").slice(0, 110) };
}
console.log(`Estado do Ecossistema: atualizado em ${estado.atualizado_em}. Repositório lido: ${repo} (origin/main, somente leitura).`);
let atrasado = false;
for (const c of ["Ana", "Bia", "Hoje", "Central"]) {
  const u = ultimo[c]; if (!u) { console.log(`  ${c}: nenhum deploy encontrado nos últimos commits.`); continue; }
  const depois = u.quando > limite; atrasado ||= depois;
  console.log(`  ${c}: último deploy em ${u.quando.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}${depois ? "  <-- DEPOIS da data do estado.json" : ""}\n      ${u.resumo}`);
}
console.log(atrasado ? "AVISO: Ecossistema pode estar desatualizado. Revise estado.json e os textos (ver ATUALIZAR-A-CADA-DEPLOY.md)." : "Nenhum deploy depois da data do estado.json.");
