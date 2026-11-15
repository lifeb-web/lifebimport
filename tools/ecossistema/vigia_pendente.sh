#!/bin/bash
# Vigia do Ecossistema desatualizado. Rodar de hora em hora (launchd/cron) ou à mão. Alerta o Robert (pela Bia) se há marcador PENDENTE há mais de ECO_HORAS (padrão 6)
# e a página no git não foi publicada depois do marcador. No máximo 1 alerta a cada ECO_HORAS. ECO_DRY=1 só mostra o texto (testes).
MARC="${ECO_MARCADOR:-$HOME/.lifeb/ecossistema_pendente.json}"; HORAS="${ECO_HORAS:-6}"
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
[ -f "$MARC" ] || { echo "sem pendência"; exit 0; }
PUB=$(ECO_PUB_TS="${ECO_PUB_TS:-}" bash -c 'if [ -n "$ECO_PUB_TS" ]; then echo "$ECO_PUB_TS"; else cd "'"$RAIZ"'" && git log -1 --format=%ct -- ecossistema/index.html 2>/dev/null; fi')
python3 - "$MARC" "$HORAS" "${PUB:-0}" "${ECO_DRY:-}" <<'PY'
import json,sys,time,subprocess,os
f,horas,pub,dry=sys.argv[1],float(sys.argv[2]),int(sys.argv[3] or 0),sys.argv[4]
m=json.load(open(f)); agora=int(time.time())
itens=[i for i in m.get("itens",[]) if i["ts"]>pub]   # só o que foi registrado DEPOIS da última publicação da página
if not itens:
    os.remove(f); print("Ecossistema em dia: marcador removido"); sys.exit(0)
idade=(agora-min(i["ts"] for i in itens))/3600
if idade<horas: print(f"pendente há {idade:.1f} h (alerta depois de {horas:g} h)"); sys.exit(0)
if agora-m.get("alertado_ts",0)<horas*3600: print("já alertado há pouco"); sys.exit(0)
lista=", ".join(f"{i['sistema']} {i['versao']}" for i in itens)
txt=f"📘 *Ecossistema desatualizado* há {idade:.0f} h\n\nDeploys sem a página publicada: {lista}.\nA versão já está registrada em disco; falta publicar com tools/ecossistema/publicar.sh (depois do auditor e da auditoria visual)."
if dry: print("ALERTA (simulado):",txt); sys.exit(0)
dest=""
try: dest=open(os.path.expanduser("~/.lifeb/eco_notify_to")).read().strip()
except Exception: pass
if not dest: print("sem destino em ~/.lifeb/eco_notify_to: alerta não enviado"); print(txt); sys.exit(0)
key=subprocess.run(["security","find-generic-password","-s","bia-service-key","-w"],capture_output=True,text=True).stdout.strip()
if not key: print("sem chave de serviço no cofre: alerta não enviado"); sys.exit(0)
import urllib.request
req=urllib.request.Request("https://gs-agendor-worker.robert131196.workers.dev/notify",data=json.dumps({"to":dest,"requesterPhone":dest,"text":txt}).encode(),headers={"x-bia-service-key":key,"content-type":"application/json"})
try: urllib.request.urlopen(req,timeout=20); m["alertado_ts"]=agora; json.dump(m,open(f,"w"),ensure_ascii=False,indent=1); print("Robert avisado")
except Exception as e: print("aviso falhou:",e)
PY
exit 0
