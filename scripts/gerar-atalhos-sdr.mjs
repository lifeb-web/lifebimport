// Gera o atalho curto de cada SDR: /hoje/<slug>/ -> /hoje/ (mesma página, mesmo aparelho, mesmo login guardado).
// O Felipe continua usando /hoje/ como sempre; o atalho existe para os PRÓXIMOS SDRs (basta incluir na lista abaixo e rodar: node scripts/gerar-atalhos-sdr.mjs).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SDRS = [
  { slug: "felipe", nome: "Felipe Cassiano" },
  // { slug: "novo-sdr", nome: "Nome Sobrenome" },
];
export function paginaAtalho(nome) {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Hoje | ${nome}</title>
<meta http-equiv="refresh" content="0;url=/hoje/">
<script>location.replace('/hoje/' + location.search + location.hash);</script>
</head><body style="font-family:system-ui,sans-serif;padding:24px">Abrindo a página Hoje… <a href="/hoje/">toque aqui se não abrir</a>.</body></html>
`;
}
for (const s of SDRS) {
  if (!/^[a-z0-9-]+$/.test(s.slug)) throw new Error("slug inválido: " + s.slug);
  mkdirSync(join(RAIZ, "hoje", s.slug), { recursive: true });
  writeFileSync(join(RAIZ, "hoje", s.slug, "index.html"), paginaAtalho(s.nome));
  console.log("ok /hoje/" + s.slug + "/");
}
