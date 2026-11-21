#!/usr/bin/env node
// Lê AO VIVO (somente leitura) a versão em produção de cada Worker com `wrangler deployments list` e atualiza versoes.json (20/11/2026).
// Uso: node tools/ecossistema/versoes_ao_vivo.mjs [--aplicar]   (sem --aplicar só mostra o que mudaria)
// Variáveis: ECO_WRANGLER_CWD (pasta de um projeto com wrangler; padrão: pasta temporária), ECO_VERSOES (caminho do json).
// Não publica nada e não escreve em nenhum serviço: só `deployments list`. Depois de aplicar, rode python3 tools/ecossistema/montar.py.
import { execFileSync } from "node:child_process"; import fs from "node:fs"; import path from "node:path"; import os from "node:os";
const AQUI = path.dirname(new URL(import.meta.url).pathname);
const ARQ = process.env.ECO_VERSOES || path.join(AQUI, "versoes.json");
const CWD = process.env.ECO_WRANGLER_CWD || os.tmpdir();
const APLICAR = process.argv.includes("--aplicar");
// sistema (id em versoes.json) -> Worker
export const WORKERS = { bia: "gs-agendor-worker", ana: "lifeb-agente-sdr", canal: "lifeb-canal", dash: "bia-dash-sync", painel: "lifeb-rep-painel" };
// 21/11/2026: o Dash tem dois Workers: o vigia/sincronizador (bia-dash-sync) e a ponte de escrita (dash-geral-bridge)
export const PONTE_DASH = "dash-geral-bridge";
export function ultima(texto) {   // última implantação a 100%: { versao, quando(Date UTC) }
  const blocos = texto.split(/\n(?=Created:\s)/); let r = null;
  for (const b of blocos) { const c = /^Created:\s+(\S+)/m.exec(b), v = /Version\(s\):\s+\(100%\)\s+([0-9a-f-]{36})/m.exec(b); if (c && v) r = { versao: v[1], quando: new Date(c[1]) }; }
  return r;
}
function lerWorker(worker) { try { return execFileSync("wrangler", ["deployments", "list", "--name", worker], { cwd: CWD, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { return null; } }
const brt = (d) => { const p = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d).reduce((o, x) => (o[x.type] = x.value, o), {}); return `${p.day}/${p.month}/${p.year} (${p.hour}h${p.minute})`; };
if (import.meta.url === "file://" + process.argv[1]) {
  const v = JSON.parse(fs.readFileSync(ARQ, "utf8")); let mudou = 0;
  for (const [id, worker] of Object.entries(WORKERS)) {
    let saida; try { saida = execFileSync("npx", ["--no-install", "wrangler", "deployments", "list", "--name", worker], { cwd: CWD, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { try { saida = execFileSync("wrangler", ["deployments", "list", "--name", worker], { cwd: CWD, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); } catch (e2) { console.log(`  ${id} (${worker}): NÃO foi possível ler (${String(e2.message).split("\n")[0].slice(0, 80)})`); continue; } }
    const u = ultima(saida); if (!u) { console.log(`  ${id} (${worker}): sem implantação a 100% na lista`); continue; }
    const s = v.sistemas.find((x) => x.id === id); if (!s) continue;
    let ponte = null; if (id === "dash") { const tp = lerWorker(PONTE_DASH); ponte = tp && ultima(tp); if (!ponte) console.log(`  dash (${PONTE_DASH}): NÃO foi possível ler`); }
    const pag = (/página:? (?:commit )?([0-9a-f]{8})/.exec(s.versao) || [, "e5b11994"])[1];
    const novaV = id === "dash" ? `ponte ${ponte ? ponte.versao.slice(0, 8) : "?"} · sincronizador ${u.versao.slice(0, 8)} · página ${pag}` : u.versao;
    const novaD = id === "dash" ? `ponte ${ponte ? brt(ponte.quando) : "?"} · sincronizador ${brt(u.quando)} · página 19/11/2026 (16h20)` : brt(u.quando);
    const igual = s.versao === novaV && s.data === novaD;
    console.log(`  ${id} (${worker}): ${novaV.slice(0, 60)} em ${novaD}${igual ? "  (igual ao json)" : "  <-- ATUALIZA"}`);
    if (!igual && APLICAR) { s.versao = novaV; s.data = novaD; s.fonte = "leitura ao vivo da lista de versões do servidor (" + brt(new Date()) + ")"; mudou++; }
  }
  if (APLICAR && mudou) { fs.writeFileSync(ARQ, JSON.stringify(v, null, 1)); console.log(`versoes.json atualizado (${mudou}).`); } else console.log(APLICAR ? "Nada a atualizar." : "Sem --aplicar: nada foi escrito.");
}
