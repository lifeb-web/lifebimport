#!/usr/bin/env python3
"""Base dos slides (helpers, ícones, selos, estado). Slides do modo apresentação do Ecossistema (16/11/2026). Gera o HTML do deck a partir de estado.json (fonte única do estado).
Cada slide é uma <section class="slide"> dentro de #deck > .stage (1920x1080 na horizontal, 1080x1920 na vertical; o JS escala sem rolagem).
Sem nomes de pessoas: só papéis (time comercial, SDR, representantes, diretoria)."""
import json, os
from comp import e, selo
AQUI = os.path.dirname(os.path.abspath(__file__))
ESTADO = json.load(open(os.path.join(AQUI, "estado.json"), encoding="utf-8"))
COMP = {c["id"]: c for c in ESTADO["componentes"]}
ATUAL = ESTADO["atualizado_em"]
PILL = {"no ar": ("ok", "No ar"), "em implantação": ("te", "Em implantação"), "planejado": ("pl", "Planejado")}

def pill(est):
    k, t = PILL[est]
    return f'<span class="dp dp-{k}">{t}</span>'

def ic(nome):
    P = {
     "chat": '<path d="M4 5h16v11H9l-5 4z"/>',
     "bot": '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 16h6"/>',
     "mesa": '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4M7 9h5M7 12h8"/>',
     "ctrl": '<path d="M5 6h14M5 12h14M5 18h14"/><circle cx="9" cy="6" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="8" cy="18" r="2" fill="currentColor"/>',
     "dash": '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
     "crm": '<path d="M4 6h6v5H4zM14 6h6v5h-6zM9 15h6v5H9z"/><path d="M7 11v2h10v-2M12 13v2"/>',
     "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
     "mix": '<path d="M4 5h16M4 12h10M4 19h16"/>',
     "eye": '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
     "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
     "shield": '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5L16 9"/>',
     "lock": '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
     "rocket": '<path d="M5 19c0-3 1-5 3-7l5-5c3-3 6-3 7-3 0 1 0 4-3 7l-5 5c-2 2-4 3-7 3z"/><path d="M9 15l-4 4"/>',
     "mic": '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
     "bell": '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>',
     "list": '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
     "check": '<path d="M5 12l4 4 10-10"/>',
     "doc": '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
     "git": '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5v7M8.5 6c5 0 7 2 7 4"/>',
    }
    return f'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">{P[nome]}</svg>'

def li(items):
    return "<ul>" + "".join(f"<li>{x}</li>" for x in items) + "</ul>"

def card(icone, titulo, corpo, extra="", cls=""):
    return f'<div class="dcard {cls}"><div class="dcardh">{ic(icone)}<h3>{titulo}</h3>{extra}</div><p>{corpo}</p></div>'

_n = [0]
REG = []   # registro de slides: (n, chave, titulo, capitulo, secoes)

def slide(chave, titulo, cap, corpo, cls="", sec="", parte=None):
    """Um slide. cap = capítulo (agrupa no índice). sec = ids de seções da página longa que este slide cobre. parte = (i, total) para fluxos em várias partes."""
    _n[0] += 1; n = _n[0]
    kick = e(cap) + (f" · parte {parte[0]}/{parte[1]}" if parte else "")
    REG.append((n, chave, titulo, cap, sec))
    ptxt = f" (parte {parte[0]} de {parte[1]})" if parte else ""
    return (f'<section class="slide {cls}" id="sl-{chave}" data-t="{e(titulo)}" data-cap="{e(cap)}" data-sec="{e(sec)}" aria-label="Slide {n}: {e(titulo)}{ptxt}" aria-hidden="true">'
            f'<div class="sl-in"><header class="sl-h"><span class="kick">{kick}</span><h2>{titulo}</h2></header><div class="sl-b">{corpo}</div></div><span class="sl-n" aria-hidden="true">{n}</span></section>')

def estado_barra(*ids):
    """Linha com o estado de cada componente citado, lida de estado.json."""
    return '<div class="ebar">' + "".join(f'<span class="eb"><b>{COMP[i]["nome"]}</b>{pill(COMP[i]["estado"])}</span>' for i in ids) + "</div>"

def faixa_estado(i):
    c = COMP[i]; out = []
    if c["implantacao"]:
        out.append('<div class="dfx dfx-te">' + pill("em implantação") + "<span>" + "; ".join(selo(__import__("pecas").palavras(x, 16), deck=True) for x in c["implantacao"]) + ". Ainda não está no ar.</span></div>")
    if c["planejado"]:
        out.append('<div class="dfx dfx-pl">' + pill("planejado") + "<span>" + "; ".join(selo(__import__("pecas").palavras(x, 16), deck=True) for x in c["planejado"]) + ".</span></div>")
    return '<div class="dfxs">' + "".join(out) + "</div>"

