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
# 2) fluxo em que Perdido leva a Arena/qualificado sem reabrir, com o verificador do gerador DESLIGADO: quem tem de matar é o teste no Chromium
D3="$BASE/perdido_vira_qualificado"; mkdir -p "$D3"; cp -R tools/ecossistema/. "$D3/"
python3 - "$D3" <<'PY'
import sys
d=sys.argv[1]
s=open(d+"/diagramas.py",encoding="utf-8").read(); s=s.replace('("per","rec","")],','("per","rec",""),("per","clo","")],',1); open(d+"/diagramas.py","w",encoding="utf-8").write(s)
f=open(d+"/fluxo.py",encoding="utf-8").read(); f=f.replace("    if erros:\n        raise Erro(","    if False:\n        raise Erro(",1); open(d+"/fluxo.py","w",encoding="utf-8").write(f)
PY
python3 "$D3/montar.py" "$D3/pagina.html" >/dev/null 2>&1 && { if PAGINA="$D3/pagina.html" ECO_PRINTS="$D3/prints" node tests/ecossistema/fluxos.mjs >"$D3/saida.txt" 2>&1; then echo "❌ SOBREVIVEU: perdido_vira_qualificado (teste do Chromium não pegou)"; SOBREV=$((SOBREV+1)); elif grep -q "perdido vira qualificado" "$D3/saida.txt"; then echo "✅ morta pelo teste do Chromium (regra Perdido→qualificado): perdido_vira_qualificado"; MORTAS=$((MORTAS+1)); else echo "✅ morta pelo teste do Chromium (outra falha): perdido_vira_qualificado"; MORTAS=$((MORTAS+1)); fi; }
# 2b) etapas: etapa legada no texto e data passada como prevista (teste etapas.mjs, sem navegador)
muta_et() { local D="$BASE/$1"; mkdir -p "$D"; cp -R tools/ecossistema/. "$D/"; python3 - "$D/$2" "$3" "$4" <<'PY' || { echo "❌ mutação $1: trecho não encontrado"; return 2; }
import sys
f,a,b=sys.argv[1:4]; s=open(f,encoding='utf-8').read()
if a not in s: sys.exit(1)
open(f,'w',encoding='utf-8').write(s.replace(a,b,1))
PY
  python3 "$D/montar.py" "$D/pagina.html" >/dev/null 2>&1 || { echo "✅ o gerador derrubou: $1"; MORTAS=$((MORTAS+1)); return 0; }
  if PAGINA="$D/pagina.html" node tests/ecossistema/etapas.mjs >"$D/saida.txt" 2>&1; then echo "❌ SOBREVIVEU: $1"; SOBREV=$((SOBREV+1)); else echo "✅ morta: $1 ($(grep -c FALHOU "$D/saida.txt") falha(s))"; MORTAS=$((MORTAS+1)); fi; }
muta_et etapa_em_conversa conteudo1.py '["Abertura enviada", "A Ana começou' '["Em conversa", "A Ana começou'
muta_et etapa_inexistente_slide slides_conteudo.py 'Com o especialista, Deal breaker, Fim da cadência' 'Repassado, Sem resposta, Encerrado'
muta_et data_passada_prevista dados_status.py 'antes marcada para a semana de 18/11/2026, ainda não foi feita' 'prevista para a semana de 18/11/2026'
muta_et d1_inbound_nome conteudo1.py '["D1 · Abertura e ligação", "WhatsApp' '["D1 · Abertura", "WhatsApp'
# 3) rótulo do celular longe da seta (faixa lateral sem rótulo colado)
muta rotulo_celular_longe fluxo.py "cand.append((lx - tw / 2 + 6, gy + dy))" "cand.append((M + 4 + tw / 2, gy + dy - 60))"
# 4) texto cortado no celular (selo longo sem quebra de linha)
muta selo_estoura estilo.css ".full .pill,p .pill,li .pill,.faixa-i .chip{white-space:normal;max-width:100%}" ".full .pill{white-space:nowrap}"
# 5) papel errado ao lead
muta lead_representante conteudo1.py 'ao lead sempre se diz "especialista"' 'ao lead se diz "representante"'
# 6) tabela de versões por deploy e nomes (estatico.mjs, com jsdom): verificação repetida, fumaça de outra versão, anterior no futuro, nome em minúsculas
muta_es() { local D="$BASE/$1"; mkdir -p "$D"; cp -R tools/ecossistema/. "$D/"; python3 - "$D/$2" "$3" "$4" <<'PY' || { echo "❌ mutação $1: trecho não encontrado"; return 2; }
import sys
f,a,b=sys.argv[1:4]; s=open(f,encoding='utf-8').read()
if a not in s: sys.exit(1)
open(f,'w',encoding='utf-8').write(s.replace(a,b,1))
PY
  python3 "$D/montar.py" "$D/pagina.html" >/dev/null 2>&1 || { echo "✅ o gerador derrubou: $1"; MORTAS=$((MORTAS+1)); return 0; }
  if PAGINA="$D/pagina.html" ECO_VERSOES_TESTE="$D/versoes.json" node tests/ecossistema/estatico.mjs >"$D/saida.txt" 2>&1; then echo "❌ SOBREVIVEU: $1"; SOBREV=$((SOBREV+1)); else echo "✅ morta: $1 ($(grep -c FALHOU "$D/saida.txt") falha(s))"; MORTAS=$((MORTAS+1)); fi; }
muta_es deploy_anterior_no_futuro versoes.json '"anterior": "b8b99806-7643-4883-9931-abf9654dae30"' '"anterior": "719bf381-837e-4cdd-a60f-d795fc0e2255"'
muta_es fumaca_de_outra_versao versoes.json '
   "fumaca": "deploy concluído e fumaça pós-deploy OK no log do próprio deploy;' '
   "fumaca": "fumaça: b8b99806 a 100%; deploy concluído e fumaça pós-deploy OK no log do próprio deploy;'
muta_es nome_em_minusculas conteudo1.py 'a decisão do dono no chat do projeto foi manter assim' 'o felipe decidiu manter assim'
muta_es nome_em_maiusculas dados_status.py 'No ar desde 20/11/2026 (13h48)' 'AVISO ROBERT No ar desde 20/11/2026 (13h48)'
muta_es dash_ligar_pronto conteudo2.py '<b>Ligar ainda não está pronto</b>: falta 1 correção do auditor, 24 horas de simulação e mostrar os números à gestão' '<b>A ponte pode ligar: está pronto e seguro</b>'
muta_es dash_nunca_apaga_por_filtro conteudo2.py 'Só ao ligar a ponte traduz esse apagamento em apagamentos por chave exata, só do que não apareceu no ciclo, e barra apagamento por filtro.' 'A ponte nunca apaga por filtro.'
muta_es central_lista_inteira conteudo2.py 'A checagem das conversas ocultas, o vigia de abertura e a conciliação de números passam a ler a lista inteira' 'A página Central, o vigia de abertura e a conciliação de números passam a ler a lista inteira'
echo "TOTAL: $MORTAS mutantes mortas, $SOBREV sobreviveram"; [ "$SOBREV" -eq 0 ]
