#!/usr/bin/env python3
"""Monta o HTML do modo apresentação (deck). Conteúdo em slides_conteudo.py, fluxogramas em slides_fluxos.py, estado em estado.json.
Palco 1920x1080 (paisagem) ou 1080x1920 (celular em pé), escalado pelo deck.js sem rolagem; índice navegável (tecla G)."""
import slides_base as B
from slides_base import ESTADO, ATUAL, REG
import slides_conteudo as C
from comp import e, dividir, n_palavras
import re as _re

_LI = _re.compile(r"<li>((?:(?!</?(?:li|ul|details)[\s>]).)*)</li>", _re.S)
_PP = _re.compile(r"<p>((?:(?!</?(?:p|ul|details)[\s>]).)*)</p>", _re.S)
_KV = _re.compile(r'(<div class="kv"><b>.*?</b><span>)(.*?)(</span></div>)', _re.S)

def _res(h, maximo):
    r = dividir(h, maximo)
    return r[0] if r else h

def condensa(sl):
    """19/11/2026: slides densos viram resumo (a ideia sozinha, até ~14 palavras por item); o detalhe completo fica na página longa."""
    ini = sl[:200]
    if 'class="slide' not in ini or "dense" not in ini or "estado" in ini:
        return sl
    sl = _LI.sub(lambda m: "<li>" + _res(m.group(1), 14) + "</li>", sl)
    sl = _PP.sub(lambda m: "<p>" + _res(m.group(1), 18) + "</p>", sl)
    sl = _KV.sub(lambda m: m.group(1) + _res(m.group(2), 14) + m.group(3), sl)
    return sl

def deck():
    B._n[0] = 0; REG.clear()
    S = [condensa(x) for x in C.todos()]; N = len(S)
    ic_x = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
    ic_p = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
    ic_n = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
    ic_f = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'
    ic_t = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>'
    ic_g = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>'
    # índice por capítulos
    caps = []
    for n, chave, titulo, cap, sec in REG:
        if not caps or caps[-1][0] != cap:
            caps.append((cap, []))
        caps[-1][1].append((n, titulo))
    idx = "".join(f'<section class="ix-c"><h3>{e(cap)}</h3><div class="ix-l">' + "".join(f'<button type="button" class="ix-b" data-i="{n-1}"><b>{n}</b><span>{t}</span></button>' for n, t in itens) + '</div></section>' for cap, itens in caps)
    # trilha de capítulos na barra de progresso
    segs = "".join(f'<i data-cap="{e(cap)}" style="flex:{len(itens)}"></i>' for cap, itens in caps)
    return (f'<div id="deck" class="deck" role="dialog" aria-modal="true" aria-label="Apresentação do Ecossistema Life B" hidden data-n="{N}">'
        f'<div class="stage" id="stage">{"".join(S)}</div>'
        '<div class="dlogo" aria-hidden="true"><img class="lc" src="/logo-lifeb.png" alt="Life B" width="112" height="50"><img class="le" src="/logo-lifeb-escuro.png" alt="Life B" width="112" height="50"></div>'
        f'<div class="dprog" aria-hidden="true"><i></i></div><div class="dcaps" aria-hidden="true">{segs}</div>'
        f'<div class="dtoast" id="dToast" role="status" aria-live="polite" hidden></div><div class="dctl" id="dctl"><button type="button" class="db" id="dPrev" aria-label="Slide anterior">{ic_p}</button>'
        f'<span class="dind" id="dInd" aria-live="polite">1 / {N}</span><button type="button" class="db" id="dNext" aria-label="Próximo slide">{ic_n}</button>'
        f'<span class="dsep"></span><button type="button" class="db" id="dIdx" aria-label="Índice de slides (G)" aria-expanded="false">{ic_g}</button>'
        f'<button type="button" class="db" id="dTema" aria-label="Alternar tema claro e escuro">{ic_t}</button>'
        f'<button type="button" class="db" id="dFs" aria-label="Tela cheia (F)" aria-pressed="false" title="Tela cheia (F)">{ic_f}<span class="dbt">Tela cheia</span></button>'
        f'<button type="button" class="db" id="dExit" aria-label="Sair da apresentação (Esc)">{ic_x}</button></div>'
        f'<div class="didx" id="didx" role="dialog" aria-label="Índice de slides" hidden><div class="ix-top"><h2>Índice</h2><button type="button" class="db" id="ixFecha" aria-label="Fechar o índice">{ic_x}</button></div><div class="ix-in">{idx}</div></div></div>')

if __name__ == "__main__":
    print(len(deck()))
