#!/bin/bash
# Publica a página Ecossistema SÓ se a bateria passar. Mesmo padrão seguro de tools/hoje/publicar.sh. Uso: tools/ecossistema/publicar.sh "mensagem"
# Faz DOIS commits, só com caminhos permitidos: (1) a fonte do gerador (tools/ecossistema, tests/ecossistema) e (2) a página (ecossistema/index.html); um único push.
set -e
MSG="$1"; [ -z "$MSG" ] && { echo "❌ passe a mensagem do commit"; exit 1; }
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"; PAG="$RAIZ/ecossistema/index.html"; REL="ecossistema/index.html"
export TZ=UTC JSDOM_DIR="${JSDOM_DIR:-/private/tmp/jsd}" PW_DIR="${PW_DIR:-$HOME/.npm/_npx/e41f203b7505f1fb}" PAGINA="$PAG"
cd "$RAIZ"
[ "$(git rev-parse --abbrev-ref HEAD)" = "gh-pages" ] || { echo "❌ ABORTADO: a branch atual não é gh-pages"; exit 1; }
echo "🔧 0/4 a página em disco é a que o montador gera (nada editado à mão)"
python3 tools/ecossistema/montar.py /tmp/eco_conferencia.html >/dev/null; cmp -s /tmp/eco_conferencia.html "$PAG" || { echo "❌ ABORTADO: ecossistema/index.html não bate com o montador. Rode python3 tools/ecossistema/montar.py e refaça os testes."; exit 1; }
roda() { local n="$1" f="$2" out; echo "$n"; out="$(node "tests/ecossistema/$f" 2>&1)" || true; echo "$out" | tail -3; echo "$out" | grep -q "TOTAL: .* 0 falhou" || { echo "❌ ABORTADO: $f falhou (prints em /tmp/ecossistema_prints)"; exit 1; }; }
roda "🧪 1/4 estrutura, links, nomes proibidos, segredos e JS (jsdom)" estatico.mjs
roda "🖼️ 2/4 visual no Chromium: 5 larguras, claro e escuro, sem rolagem lateral, contraste, desenhos" visual.mjs
roda "🕹️ 3/4 interação: menu, hash, posição ao atualizar, modo apresentação, tela cheia, teclado" interacao.mjs
echo "♿ 4/4 liberação manual: o auditor independente e a auditoria visual dos prints liberaram?"; [ "${ECO_AUDITOR_OK:-}" = "sim" ] || { read -r -p "(responda sim) > " R; [ "$R" = "sim" ] || { echo "❌ ABORTADO: sem liberação do auditor"; exit 1; }; }
# ---- TRAVAS DE GIT ----
N0=$(git ls-files | wc -l | tr -d ' '); [ "$N0" -gt 0 ] || { echo "❌❌❌ ABORTADO: o índice do git está VAZIO (git ls-files = 0). Nada foi commitado."; exit 1; }
[ -z "$(git diff --cached --name-only)" ] || { echo "❌ ABORTADO: já há arquivos preparados no índice:"; git diff --cached --name-only | head; exit 1; }
ANTES=$(git ls-tree -r HEAD --name-only | wc -l | tr -d ' ')
commita() { # $1 = mensagem; demais = caminhos permitidos (prefixos)
  local m="$1"; shift
  git add -- "$@" ':(exclude)*__pycache__*' ':(exclude)*.pyc'
  local apag; apag=$(git diff --cached --name-status | grep -c '^D' || true); [ "$apag" -eq 0 ] || { echo "❌❌❌ ABORTADO: o commit APAGARIA $apag arquivo(s)."; git diff --cached --name-status | grep '^D' | head; git reset -q; exit 1; }
  local fora; fora=$(git diff --cached --name-only | grep -v -E "^($(printf '%s|' "$@" | sed 's/|$//'))" || true); [ -z "$fora" ] || { echo "❌❌❌ ABORTADO: arquivos fora dos caminhos permitidos:"; echo "$fora" | head; git reset -q; exit 1; }
  if [ -z "$(git diff --cached --name-only)" ]; then echo "(nada novo em $*)"; return 0; fi
  git commit -q -m "$m

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" -- "$@" || { echo "❌ ABORTADO: git commit falhou"; exit 1; }
  local dep; dep=$(git ls-tree -r HEAD --name-only | wc -l | tr -d ' ')
  if [ "$dep" -lt "$ANTES" ]; then echo "❌❌❌ PERIGO: o commit REDUZIU os arquivos ($ANTES -> $dep). NÃO FIZ PUSH. Desfaça com: git reset --soft HEAD~1"; exit 1; fi
}
commita "$MSG (fonte do gerador e testes)" tools/ecossistema tests/ecossistema
commita "$MSG" "$REL"
git push -q origin HEAD:gh-pages || { echo "❌ ABORTADO: push falhou (os commits ficaram só locais)"; exit 1; }
FIM=$(git ls-tree -r HEAD --name-only | wc -l | tr -d ' '); [ "$FIM" -ge "$ANTES" ] || { echo "❌❌❌ ALERTA MÁXIMO: depois do push a contagem caiu ($ANTES -> $FIM). Avise a gestão agora."; exit 1; }
echo "✅ Ecossistema publicado (testes + visual + interação passaram; $FIM arquivos no repositório, nenhum a menos). Agora: fumaça (abrir a página no ar, conferir a versão e o modo apresentação)."
