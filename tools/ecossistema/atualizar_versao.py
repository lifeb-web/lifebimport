#!/usr/bin/env python3
"""Atualiza versoes.json (usado pelo deploy.sh de cada sistema, depois do deploy) e remonta a página.
Uso: python3 tools/ecossistema/atualizar_versao.py ana 1a2b3c4d "14/11/2026 20h" varredura=feita testes=feitos auditor=feito fumaca=feita rollback="cópia guardada"
Não publica nada: só altera o arquivo de dados e a página em disco. A publicação segue pelo tools/ecossistema/publicar.sh."""
import json, os, sys, subprocess
AQUI = os.path.dirname(os.path.abspath(__file__)); F = os.path.join(AQUI, "versoes.json")
d = json.load(open(F, encoding="utf-8"))
if len(sys.argv) < 4: sys.exit(__doc__)
sid, ver, data = sys.argv[1:4]
s = next((x for x in d["sistemas"] if x["id"] == sid), None) or sys.exit("sistema desconhecido: " + sid + " (" + ", ".join(x["id"] for x in d["sistemas"]) + ")")
s["versao"], s["data"] = ver, data
for kv in sys.argv[4:]:
    k, v = kv.split("=", 1)
    if k not in s["verif"]: sys.exit("verificação desconhecida: " + k)
    s["verif"][k] = v
d["atualizado_em"] = data
json.dump(d, open(F, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
subprocess.check_call([sys.executable, os.path.join(AQUI, "montar.py")])
