#!/bin/bash
# Testa pos_deploy.sh + atualizar_versao.py + vigia_pendente.sh em arquivos temporários (nada de produção, sem WhatsApp, sem remontar a página).
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"; T="$(mktemp -d)"; ok=0; bad=0
t() { if eval "$2"; then ok=$((ok+1)); else bad=$((bad+1)); echo "  FALHOU: $1"; fi; }
export ECO_VERSOES="$T/versoes.json" ECO_MARCADOR="$T/marcador.json" ECO_NO_MONTAR=1
cp "$RAIZ/tools/ecossistema/versoes.json" "$ECO_VERSOES"
P="$RAIZ/tools/ecossistema/pos_deploy.sh"; V="$RAIZ/tools/ecossistema/vigia_pendente.sh"
OUT=$("$P" ana abcd1234 "15/11/2026 (05h17)" varredura=feita testes="175 de 175" auditor="pode subir" fumaca=feita rollback="versao anterior guardada" 2>&1); RC=$?
t "pos_deploy sai 0" "[ $RC -eq 0 ]"
t "versoes.json recebeu a versão nova da Ana" "python3 -c \"import json;d=json.load(open('$ECO_VERSOES'));s=[x for x in d['sistemas'] if x['id']=='ana'][0];assert s['versao']=='abcd1234' and s['verif']['auditor']=='pode subir' and d['deploys'][0]['versao']=='abcd1234'\""
t "marcador PENDENTE gravado" "python3 -c \"import json;m=json.load(open('$ECO_MARCADOR'));assert m['itens'][0]['sistema']=='ana'\""
t "mensagem diz PENDENTE e como publicar" "echo \"\$OUT\" | grep -q 'PENDENTE'"
"$P" bia 99887766 "15/11/2026 (06h00)" >/dev/null 2>&1
t "segundo sistema entra no mesmo marcador (2 itens)" "python3 -c \"import json;assert len(json.load(open('$ECO_MARCADOR'))['itens'])==2\""
"$P" ana abcd1234 "15/11/2026 (05h17)" >/dev/null 2>&1
t "repetir o mesmo deploy não duplica" "python3 -c \"import json;d=json.load(open('$ECO_VERSOES'));assert len([x for x in d['deploys'] if x['versao']=='abcd1234'])==1\""
OUT=$("$P" sistemaquenaoexiste zzz 2>&1); RC=$?
t "sistema desconhecido: não derruba o deploy (sai 0) e avisa" "[ $RC -eq 0 ] && echo \"\$OUT\" | grep -q 'NÃO foi afetado'"
t "sistema desconhecido não cria pendência" "python3 -c \"import json;assert all(i['sistema']!='sistemaquenaoexiste' for i in json.load(open('$ECO_MARCADOR'))['itens'])\""
N0=$(python3 -c "import json;print(len(json.load(open('$ECO_MARCADOR'))['itens']))")
OUT=$("$P" ana "" 2>&1); RC=$?; t "versão vazia: sai 0, avisa e não registra" "[ $RC -eq 0 ] && echo \"\$OUT\" | grep -q 'vazios'"
OUT=$("$P" 2>&1); RC=$?; t "sem argumentos: sai 0 e não registra" "[ $RC -eq 0 ]"
t "versão vazia não mexeu no marcador nem no json" "python3 -c \"import json;assert len(json.load(open('$ECO_MARCADOR'))['itens'])==$N0;d=json.load(open('$ECO_VERSOES'));assert [x for x in d['sistemas'] if x['id']=='ana'][0]['versao']=='abcd1234'\""
# vigia
OUT=$(ECO_HORAS=6 ECO_DRY=1 ECO_PUB_TS=0 "$V" 2>&1); t "vigia: pendência recente (< 6 h) não alerta" "echo \"\$OUT\" | grep -q 'pendente há' && ! echo \"\$OUT\" | grep -q ALERTA"
OUT=$(ECO_HORAS=0 ECO_DRY=1 ECO_PUB_TS=0 "$V" 2>&1); t "vigia: acima do limite alerta (simulado) com os sistemas" "echo \"\$OUT\" | grep -q 'ALERTA' && echo \"\$OUT\" | grep -q 'ana abcd1234'"
OUT=$(ECO_HORAS=100 ECO_DRY=1 ECO_PUB_TS=0 "$V" 2>&1); t "controle negativo: limite alto não alerta" "! echo \"\$OUT\" | grep -q ALERTA"
OUT=$(ECO_HORAS=0 ECO_DRY=1 ECO_PUB_TS=4102444800 "$V" 2>&1); t "vigia: página publicada depois do marcador = em dia e marcador removido" "echo \"\$OUT\" | grep -q 'em dia' && [ ! -f \"$ECO_MARCADOR\" ]"
OUT=$(ECO_DRY=1 "$V" 2>&1); t "vigia: sem marcador, sem pendência" "echo \"\$OUT\" | grep -q 'sem pendência'"
echo "TOTAL: $ok passou, $bad falhou"; [ $bad -eq 0 ]
