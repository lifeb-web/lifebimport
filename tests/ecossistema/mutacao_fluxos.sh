#!/bin/bash
# Mutação do teste dos fluxogramas (20/11/2026): reintroduz cada bug numa CÓPIA do gerador e confere que tests/ecossistema/fluxos.mjs FALHA.
# Uso (um processo pesado por vez; segure a trava do Chromium antes): bash tests/ecossistema/mutacao_fluxos.sh
# Nada é publicado e a página real não é tocada: tudo roda em /tmp/eco_mut_*.
set -u
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"; export TZ=UTC; cd "$RAIZ"
BASE="$(mktemp -d /tmp/eco_mut_XXXXXX)"   # pasta nova a cada rodada (nada é apagado)
muta() { # $1 = nome, $2 = arquivo, $3 = trecho antigo, $4 = trecho novo
  local D="$BASE/$1"; mkdir -p "$D"; cp -R tools/ecossistema/. "$D/"
  python3 - "$D/$2" "$3" "$4" <<'PY' || { echo "❌ mutação $1: trecho não encontrado em $2 (o teste de mutação ficou desatualizado)"; return 2; }
import sys
f,a,b=sys.argv[1:4]; s=open(f,encoding='utf-8').read()
if a not in s: sys.exit(1)
open(f,'w',encoding='utf-8').write(s.replace(a,b,1))
PY
  python3 "$D/montar.py" "$D/pagina.html" >/dev/null 2>"$D/erro.txt" || { echo "✅ mutação $1: o próprio gerador derrubou ($(tail -1 "$D/erro.txt" | cut -c1-120))"; MORTAS=$((MORTAS+1)); return 0; }
  if PAGINA="$D/pagina.html" ECO_PRINTS="$D/prints" node tests/ecossistema/fluxos.mjs >"$D/saida.txt" 2>&1; then echo "❌ SOBREVIVEU: $1 (o teste passou com o bug reintroduzido)"; SOBREV=$((SOBREV+1)); else echo "✅ morta: $1 ($(grep -c FALHOU "$D/saida.txt") falha(s))"; MORTAS=$((MORTAS+1)); fi
}
MORTAS=0; SOBREV=0
# 1) o bug original: cotovelos das setas no mesmo nível e rótulo sem checar a seta alheia ("qualifica" em cima da seta de Perdido)
muta rotulo_sobre_seta fluxo.py "ym = y1 + TIER0 + tier[i] * TIER" "ym = y1 + GY / 2 + (i % 3 - 1) * 7"
D2="$BASE/rotulo_sobre_seta"; python3 - "$D2/fluxo.py" <<'PY'
import sys
f=sys.argv[1]; s=open(f,encoding='utf-8').read()
s=s.replace("    def toca_seta(rb, ignorar, folga):\n","    def toca_seta(rb, ignorar, folga):\n        return False\n",1); open(f,'w',encoding='utf-8').write(s)
PY
python3 "$D2/montar.py" "$D2/pagina.html" >/dev/null 2>&1 && { if PAGINA="$D2/pagina.html" ECO_PRINTS="$D2/prints" node tests/ecossistema/fluxos.mjs >"$D2/saida.txt" 2>&1; then echo "❌ SOBREVIVEU: rotulo_sobre_seta (cotovelo + toca_seta desligados)"; SOBREV=$((SOBREV+1)); else echo "✅ morta: rotulo_sobre_seta com a checagem de seta alheia desligada ($(grep -c FALHOU "$D2/saida.txt") falha(s))"; MORTAS=$((MORTAS+1)); fi; }
# 2) fluxo em que Perdido leva a qualificado sem reabrir
muta perdido_vira_qualificado diagramas.py '("per","rec","")],' '("per","rec",""),("per","gan","")],'
# 3) rótulo do celular longe da seta (faixa lateral sem rótulo colado)
muta rotulo_celular_longe fluxo.py "cand.append((lx - tw / 2 + 6, gy + dy))" "cand.append((M + 4 + tw / 2, gy + dy - 60))"
# 4) texto cortado no celular (selo longo sem quebra de linha)
muta selo_estoura estilo.css ".full .pill,p .pill,li .pill{white-space:normal;max-width:100%}" ".full .pill{white-space:nowrap}"
# 5) papel errado ao lead
muta lead_representante conteudo1.py 'ao lead sempre se diz "especialista"' 'ao lead se diz "representante"'
echo "TOTAL: $MORTAS mutantes mortas, $SOBREV sobreviveram"; [ "$SOBREV" -eq 0 ]
