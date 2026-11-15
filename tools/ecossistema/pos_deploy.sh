#!/bin/bash
# Chamado no FIM do deploy.sh de cada sistema (Ana, Bia, e o que vier: Central, Hoje, Canal...).
# Uso: pos_deploy.sh <sistema> <versao> ["data"] [varredura=..] [testes=..] [auditor=..] [fumaca=..] [rollback=..]
# 1) atualiza versoes.json e remonta a página em disco; 2) grava o marcador PENDENTE (Ecossistema desatualizado até o publicar.sh rodar).
# Nunca derruba o deploy: sempre sai 0. NÃO publica nada.
SIS="${1:-}"; VER="${2:-}"
if [ -z "$SIS" ] || [ -z "${VER// }" ]; then echo "⚠️ Ecossistema: sistema ou versão vazios (uso: pos_deploy.sh <sistema> <versao> [data] [campos]); nada foi registrado. O deploy NÃO foi afetado."; exit 0; fi
shift 2
DATA="${1:-}"; if [ -z "$DATA" ] || [[ "$DATA" == *=* ]]; then DATA="$(date '+%d/%m/%Y (%Hh%M)')"; else shift; fi
AQUI="$(cd "$(dirname "$0")" && pwd)"; MARC="${ECO_MARCADOR:-$HOME/.lifeb/ecossistema_pendente.json}"
mkdir -p "$(dirname "$MARC")" 2>/dev/null
if python3 "$AQUI/atualizar_versao.py" "$SIS" "$VER" "$DATA" "$@"; then
  python3 - "$MARC" "$SIS" "$VER" "$DATA" <<'PY'
import json,sys,time,os
f,sis,ver,data=sys.argv[1:5]
try: m=json.load(open(f))
except Exception: m={"itens":[]}
m["itens"]=[i for i in m.get("itens",[]) if i["sistema"]!=sis]+[{"sistema":sis,"versao":ver,"data":data,"ts":int(time.time())}]
m.setdefault("primeiro_ts",int(time.time())); m["alertado_ts"]=m.get("alertado_ts",0)
json.dump(m,open(f,"w"),ensure_ascii=False,indent=1)
PY
  echo "📘 Ecossistema: versão de $SIS registrada ($VER). PENDENTE: publicar com tools/ecossistema/publicar.sh (o alerta sai se passar de ${ECO_HORAS:-6} h)."
else
  echo "⚠️ Ecossistema: não consegui atualizar a versão de $SIS (rode pos_deploy.sh à mão). O deploy NÃO foi afetado."
fi
exit 0
