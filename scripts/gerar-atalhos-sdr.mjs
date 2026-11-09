// Endereço de cada SDR: a página real fica em /hoje/<slug>/ (hoje só existe /hoje/felipe/). /hoje/ é só um redirecionador para o SDR padrão, para links e mensagens antigas continuarem funcionando.
// Para um NOVO SDR: copiar hoje/felipe/index.html para hoje/<slug>/ e incluir o SDR na lista abaixo. ATENÇÃO: a página ainda usa um acesso único (ver BLINDAGEM-SDR-09nov.md, seção "Novo SDR"): antes do 2º SDR é preciso o acesso por SDR e o filtro por dono.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SDRS = [{ slug: "felipe", nome: "Felipe Cassiano", padrao: true }];
export function paginaRedireciona(slug) {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Hoje | SDR</title>
<meta http-equiv="refresh" content="0;url=/hoje/${slug}/">
<script>location.replace('/hoje/${slug}/' + location.search + location.hash);</script>
</head><body style="font-family:system-ui,sans-serif;padding:24px">Abrindo a página Hoje… <a href="/hoje/${slug}/">toque aqui se não abrir</a>.</body></html>
`;
}
const padrao = SDRS.find((s) => s.padrao) || SDRS[0];
writeFileSync(join(RAIZ, "hoje", "index.html"), paginaRedireciona(padrao.slug));
console.log("ok /hoje/ -> /hoje/" + padrao.slug + "/");
