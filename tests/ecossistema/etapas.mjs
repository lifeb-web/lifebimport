// Etapas dos funis e datas "previstas" (20/11/2026, auditor): o Ecossistema NUNCA pode citar etapa que não existe no Agendor,
// e nenhuma data PASSADA pode aparecer como "prevista".
// Fonte das etapas: tests/ecossistema/etapas_agendor.json (lido ao vivo em 20/11/2026, GET /v3/funnels). Com ECO_ETAPAS_AO_VIVO=1 o teste lê de novo
// (SOMENTE GET; token do Keychain 'agendor-api-token', nunca impresso) e compara com o fixture: se o Agendor mudou, falha e pede para atualizar fixture e página.
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process";
import { t, resumo, HTML, RAIZ } from "./_comum.mjs";
const fx = JSON.parse(fs.readFileSync(path.join(RAIZ, "tests/ecossistema/etapas_agendor.json"), "utf8"));
const ANA = fx.funis["919856"].etapas, INB = fx.funis["916713"].etapas, OUT = fx.funis["916712"].etapas;
if (process.env.ECO_ETAPAS_AO_VIVO === "1") {
  const tok = execFileSync("security", ["find-generic-password", "-s", "agendor-api-token", "-w"]).toString().trim();
  const r = await fetch("https://api.agendor.com.br/v3/funnels", { headers: { Authorization: "Token " + tok } });
  t("leitura ao vivo do Agendor respondeu 200", r.status === 200, r.status);
  const j = await r.json(); const lista = j.data || j;
  for (const [id, f] of Object.entries(fx.funis)) { const v = lista.find((x) => String(x.id) === id); const nomes = v ? [...v.dealStages].sort((a, b) => a.sequence - b.sequence).map((s) => s.name) : null; t(`fixture igual ao Agendor ao vivo: ${f.nome}`, JSON.stringify(nomes) === JSON.stringify(f.etapas), nomes); }
}
const limpo = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const tabela = (leg) => { const i = HTML.indexOf(`<caption class="sr">${leg}</caption>`); if (i < 0) return null; const fim = HTML.indexOf("</table>", i); return [...HTML.slice(i, fim).matchAll(/<td class="k"[^>]*>(.*?)<\/td>/g)].map((m) => limpo(m[1])); };
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
t("tabela 'Etapas do funil da Ana' = etapas reais do Agendor", igual(tabela("Etapas do funil da Ana"), ANA), tabela("Etapas do funil da Ana"));
t("tabela 'Etapas do SDR Inbound' = etapas reais", igual(tabela("Etapas do SDR Inbound"), INB.filter((e) => !/Ana qualificou|Repasse da Ana/.test(e))), tabela("Etapas do SDR Inbound"));
t("tabela 'Etapas do SDR Outbound' = etapas reais", igual(tabela("Etapas do SDR Outbound"), OUT), tabela("Etapas do SDR Outbound"));
for (const [leg, id] of [["Etapas do Arena", "890331"], ["Etapas do Pós-venda", "907387"], ["Etapas da Reativação", "909368"]]) t(`tabela '${leg}' = etapas reais`, igual(tabela(leg), fx.funis[id].etapas), tabela(leg));
const texto = limpo(HTML.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " "));
// listas "Funil da Ana: a, b, c" (slides e texto)
for (const m of texto.matchAll(/Funil da Ana: ([^"]{10,200}?)(?:\.|SDR Inbound:|$| Funil)/g)) { const l = m[1].split(/,\s*/).map((x) => x.trim()).filter(Boolean); t("lista 'Funil da Ana: ...' só com etapas reais: " + l.join(" | "), l.every((e) => ANA.includes(e)), l); }
// etapas legadas que não existem mais, citadas COMO etapa
for (const re of [/\bEm conversa\b/, /etapa Encerrado/i, /etapa Sem resposta/i, /etapa "?Repassado"?(?! ao)/i, /\bEncerrado\b(?! com educação)/, /\bRepassado,/]) { const m = texto.match(re); t(`nenhuma etapa inexistente citada: ${re}`, !m, m ? texto.slice(Math.max(0, m.index - 60), m.index + 60) : ""); }
// toda etapa citada entre aspas depois de "etapa" existe em algum funil
const todas = new Set(Object.values(fx.funis).flatMap((f) => f.etapas));
for (const m of texto.matchAll(/etapa(?:s)? "([^"]{3,40})"/g)) t(`etapa citada existe no Agendor: "${m[1]}"`, todas.has(m[1]), m[1]);
// datas passadas como "prevista"
const hoje = new Date(Date.UTC(...(() => { const [d, mm, a] = (HTML.match(/Atualizado em <span id="atualizadoEm">(\d\d)\/(\d\d)\/(\d{4})/) || []).slice(1).map(Number); return [a, mm - 1, d]; })()));
const velhas = []; for (const m of texto.matchAll(/(prevista?s?|previsto|marcada para|serão revist\w+|em revisão na)[^.]{0,90}?(\d\d)\/(\d\d)\/(\d{4})/gi)) { const d = new Date(Date.UTC(+m[4], +m[3] - 1, +m[2])); if (d < hoje && !/ainda não foi feita|antes marcada/.test(m[0] + texto.slice(m.index, m.index + 200))) velhas.push(m[0].slice(0, 120)); }
t("nenhuma data passada aparece como 'prevista'", velhas.length === 0, velhas);
resumo();
