#!/bin/bash
# VERIFICAÇÃO DE ESTADO — roda no início de TODA sessão antes de qualquer edição
# Garante que Dropbox e worktree estão sincronizados com GitHub (fonte da verdade)

DROPBOX="/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR"
WK="/tmp/ghpages-hist2"
REPO="/Users/robertmarques/Desktop/lifebimport-jlbv"
OK=true

echo "======================================"
echo " VERIFICAÇÃO DE ESTADO — Life B Reps"
echo "======================================"

# 1. Garantir que worktree existe e está atualizado
echo ""
echo "1. Worktree gh-pages..."
if [ ! -d "$WK" ]; then
  echo "   ⚠️  Worktree ausente — recriando..."
  cd "$REPO" && git worktree prune && git worktree add /tmp/ghpages-hist2 gh-pages
fi
cd "$WK" && git pull origin gh-pages --quiet && echo "   ✓ Worktree atualizado: $(git log --oneline -1)"

# 2. Comparar arquivos críticos: worktree vs Dropbox
echo ""
echo "2. Comparando worktree vs Dropbox..."

check() {
  local label=$1
  local src=$2
  local dst=$3
  if [ ! -f "$src" ]; then echo "   ❌ $label: arquivo ausente no worktree"; OK=false; return; fi
  if [ ! -f "$dst" ]; then echo "   ❌ $label: arquivo ausente no Dropbox"; OK=false; return; fi
  if diff -q "$src" "$dst" > /dev/null 2>&1; then
    echo "   ✓ $label"
  else
    echo "   ❌ $label: DIVERGENTE — sincronizar do worktree pro Dropbox"
    OK=false
  fi
}

check "iramar" "$WK/rep/dash/iramar/index.html" "$DROPBOX/painel reps/dashboard-rep-iramar.html"
check "natanael" "$WK/rep/dash/natanael/index.html" "$DROPBOX/painel reps/dashboard-rep-natanael.html"
check "dashboard-leads (mobile)" "$WK/dashboard-leads.html" "$DROPBOX/dashboard-leads.html"
check "dashboard-leads-telao" "$WK/dashboard-leads-telao.html" "$DROPBOX/dashboard-leads-telao.html"
check "OneSignalSDKWorker.js" "$WK/OneSignalSDKWorker.js" "$DROPBOX/OneSignalSDKWorker.js" 2>/dev/null || echo "   ℹ️  OneSignalSDKWorker.js só no worktree (normal)"

# 3. Resultado
echo ""
if [ "$OK" = true ]; then
  echo "✅ TUDO OK — pode iniciar a sessão"
else
  echo "⚠️  DIVERGÊNCIAS ENCONTRADAS"
  echo "   Execute: cp \"\$WK/arquivo\" \"\$DROPBOX/arquivo\" para cada divergente"
  echo "   NUNCA copie do Dropbox para o worktree — worktree = GitHub = fonte da verdade"
fi
echo "======================================"
