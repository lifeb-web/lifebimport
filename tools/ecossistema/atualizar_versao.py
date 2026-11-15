#!/usr/bin/env python3
"""Atualiza versoes.json depois de um deploy (chamado pelo deploy.sh de cada sistema via pos_deploy.sh) e remonta a página em disco.
Uso: atualizar_versao.py <sistema> <versao> "<data dd/mm/aaaa (hh h)>" [varredura=..] [testes=..] [auditor=..] [fumaca=..] [rollback=..] [nota=..] [anterior=<versao anterior>]
Variáveis: ECO_VERSOES (caminho do json; padrão versoes.json ao lado), ECO_NO_MONTAR=1 (não remonta; usado nos testes).
Só altera o arquivo de dados e a página em disco. NÃO publica: a publicação segue pelo tools/ecossistema/publicar.sh."""
import json, os, sys, subprocess
AQUI = os.path.dirname(os.path.abspath(__file__)); F = os.environ.get("ECO_VERSOES") or os.path.join(AQUI, "versoes.json")
if len(sys.argv) < 4: sys.exit(__doc__)
d = json.load(open(F, encoding="utf-8"))
sid, ver, data = sys.argv[1:4]
s = next((x for x in d["sistemas"] if x["id"] == sid), None) or sys.exit("sistema desconhecido: " + sid + " (" + ", ".join(x["id"] for x in d["sistemas"]) + ")")
extra = {}
for kv in sys.argv[4:]:
    k, v = kv.split("=", 1)
    if k in s["verif"]: s["verif"][k] = v
    elif k in ("nota", "anterior", "estado"): extra[k] = v
    else: sys.exit("campo desconhecido: " + k)
anterior = s["versao"]
s["versao"], s["data"] = ver, data
if "nota" in extra: s["nota"] = extra["nota"]
d["atualizado_em"] = data
reg = {"sistema": s["nome"], "versao": ver, "data": data, "anterior": extra.get("anterior") or anterior, **{k: s["verif"][k] for k in ("varredura", "testes", "auditor", "fumaca", "rollback")}}
d.setdefault("deploys", [])
d["deploys"] = [x for x in d["deploys"] if not (x["sistema"] == reg["sistema"] and x["versao"] == ver)]
d["deploys"].insert(0, reg)
d["deploys"] = d["deploys"][:40]
json.dump(d, open(F, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
if not os.environ.get("ECO_NO_MONTAR"):
    subprocess.check_call([sys.executable, os.path.join(AQUI, "montar.py")])
print("versoes.json atualizado:", sid, ver, data)
