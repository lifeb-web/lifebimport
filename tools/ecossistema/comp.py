"""Componentes de HTML do Ecossistema (sem dependências)."""
import html, re

def e(s):
    return html.escape(s, quote=True)

_det = [0]

# estados de entrega: ok = no ar; te = pronto/em teste; pl = planejado; de = depende de decisão; lm = limite conhecido; of = desligado de propósito
PILL = {"ok": "No ar", "te": "Em implantação", "pl": "Planejado", "de": "Depende de decisão", "lm": "Limite conhecido", "of": "Desligado de propósito", "voo": "Em voo", "corr": "Em correção", "ap": "No ar, a provar"}

def pill(k, txt=None):
    return f'<span class="pill p-{k}">{txt or PILL[k]}</span>'

# prefixos de item do estado.json que ganham selo próprio: "Em voo" = deploy em andamento (pronto, publicando agora; ainda não no ar);
# "Em correção" = estava pronto, mas a publicação abortou ou um defeito foi encontrado (não está no ar)
SELOS = {"Em voo: ": "voo", "Em correção: ": "corr"}

def selo(txt, deck=False):
    """Item de estado: se começa com um prefixo de SELOS, o prefixo vira um selo (o texto lido por máquina continua igual, com os dois pontos escondidos)."""
    for pref, k in SELOS.items():
        if txt.startswith(pref):
            cls = f"dp dp-{k}" if deck else f"pill p-{k}"
            return f'<span class="{cls}">{PILL[k]}</span><span class="sr">:</span> {txt[len(pref):]}'
    return txt

def ul(items, cls=""):
    c = f' class="{cls}"' if cls else ""
    return f"<ul{c}>" + "".join(f"<li>{i}</li>" for i in items) + "</ul>"

def card(h, body, cls="", p=None, tag="h3"):
    ph = f" {pill(p)}" if p else ""
    return f'<div class="card {cls}"><{tag}>{h}{ph}</{tag}>{body}</div>'

def grid(items, n=2):
    return f'<div class="grid g{n}">' + "".join(items) + "</div>"

def tabela(heads, rows, cls="", cap=""):
    th = "".join(f"<th scope=\"col\">{h}</th>" for h in heads)
    out = []
    for r in rows:
        tds = []
        for i, c in enumerate(r):
            k = ' class="k"' if i == 0 else ""
            tds.append(f'<td{k} data-l="{e(heads[i])}">{c}</td>')
        out.append("<tr>" + "".join(tds) + "</tr>")
    cp = f"<caption class=\"sr\">{cap}</caption>" if cap else ""
    return f'<div class="tw"><table class="{cls}">{cp}<thead><tr>{th}</tr></thead><tbody>{"".join(out)}</tbody></table></div>'

def det(titulo, corpo, aberto=False, cls=""):
    _det[0] += 1
    a = " open" if aberto else ""
    return f'<details class="fx {cls}" id="d{_det[0]}"{a}><summary>{titulo}</summary><div class="dc">{corpo}</div></details>'

def fluxo(passos):
    """passos: lista de (titulo, texto, estilo) em linha com setas; empilha no celular."""
    out = []
    for i, p in enumerate(passos):
        t, x = p[0], p[1]
        st = p[2] if len(p) > 2 else ""
        if i:
            out.append('<div class="ar" aria-hidden="true">→</div>')
        out.append(f'<div class="b {st}"><b>{t}</b>{x}</div>')
    return '<div class="flow">' + "".join(out) + "</div>"

def passos(lista):
    out = []
    for i, (t, x) in enumerate(lista, 1):
        out.append(f'<li><span class="sn" aria-hidden="true">{i}</span><div><h4>{t}</h4><p>{x}</p></div></li>')
    return '<ol class="steps">' + "".join(out) + "</ol>"

def aviso(titulo, corpo, k="n"):
    return f'<div class="callout c-{k}"><b>{titulo}</b><p>{corpo}</p></div>'

def stats(lista):
    return '<div class="stats">' + "".join(f'<div class="stat s-{k}"><b>{n}</b><span>{t}</span></div>' for n, t, k in lista) + "</div>"

NAV = []   # (grupo, id, titulo)

def sec(id_, grupo, titulo, lead, corpo, extra=""):
    NAV.append((grupo, id_, titulo))
    n = len(NAV)
    ld = f'<p class="lead">{lead}</p>' if lead else ""
    return (f'<section class="sec" id="{id_}" data-n="{n}" data-t="{e(titulo)}" aria-labelledby="h-{id_}">'
            f'<div class="sec-in"><h2 id="h-{id_}"><span class="num">{n}</span><span class="tt">{titulo}</span>{extra}</h2>{ld}{corpo}</div></section>')
