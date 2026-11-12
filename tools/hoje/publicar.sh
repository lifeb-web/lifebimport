#!/bin/bash
# Publica a página Hoje SÓ se a bateria passar (regra do Robert 12/11: mesa de trabalho confiável). Uso: tools/hoje/publicar.sh "mensagem"
set -e
MSG="$1"; [ -z "$MSG" ] && { echo "❌ passe a mensagem do commit"; exit 1; }
BIA="$HOME/Desktop/gs-agendor-worker"; PAG="$(cd "$(dirname "$0")/../.." && pwd)/hoje/felipe/index.html"
echo "🧪 1/2 testes da página no jsdom (146+)"; (cd "$BIA" && JSDOM_DIR=/private/tmp/jsd TZ=UTC PAGINA="$PAG" node tests/sdr_hoje.pagina.mjs | tail -2)
(cd "$BIA" && JSDOM_DIR=/private/tmp/jsd TZ=UTC PAGINA="$PAG" node tests/sdr_hoje.pagina.mjs | grep -q "0 falhou") || { echo "❌ ABORTADO: testes da página falharam"; exit 1; }
echo "🖼️ 2/2 teste VISUAL (5 telas, 340 leads): celular e computador"; (cd "$BIA" && PW_DIR="$HOME/.npm/_npx/e41f203b7505f1fb" TZ=UTC PAGINA="$PAG" node tests/hoje_visual.mjs | tail -3)
(cd "$BIA" && PW_DIR="$HOME/.npm/_npx/e41f203b7505f1fb" TZ=UTC PAGINA="$PAG" node tests/hoje_visual.mjs | grep -q " 0 falhou") || { echo "❌ ABORTADO: o teste visual achou problema (prints em /tmp/hoje_prints)"; exit 1; }
cd "$(dirname "$0")/../.."; git add hoje/felipe/index.html; git commit -q -m "$MSG

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"; git push -q origin HEAD:gh-pages; echo "✅ Hoje publicada (testes + visual passaram)"
