#!/usr/bin/env python3
"""Regenera os painéis de representante (rep/dash/<slug>/index.html) a partir do molde source/dashboard-rep-template.html,
mantendo o nome, o nome de tela e o token que cada painel já tem. Resolve a pendência "editar o molde não atualiza quem está no ar".
Uso: python3 source/resync-paineis.py [--conferir]   (--conferir só diz quais painéis ficariam diferentes, sem escrever)
Pula robert-teste (formato diferente). Nunca imprime o token."""
import os, re, sys
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOLDE = open(os.path.join(RAIZ, 'source', 'dashboard-rep-template.html'), encoding='utf-8').read()
conferir = '--conferir' in sys.argv
mudou = 0
for slug in sorted(os.listdir(os.path.join(RAIZ, 'rep', 'dash'))):
    p = os.path.join(RAIZ, 'rep', 'dash', slug, 'index.html')
    if slug == 'robert-teste' or not os.path.isfile(p): continue
    atual = open(p, encoding='utf-8').read()
    v = {}
    for k, rx in (('__REP_NAME__', r"const REP_NAME\s*=\s*'([^']+)'"), ('__REP_DISPLAY__', r"const REP_DISPLAY\s*=\s*'([^']+)'"), ('__REP_TOKEN__', r"const REP_TOKEN\s*=\s*'([^']+)'")):
        m = re.search(rx, atual)
        if not m: sys.exit('ERRO: não achei %s em %s' % (k, p))
        v[k] = m.group(1)
    novo = MOLDE
    for k, val in v.items(): novo = novo.replace(k, val)
    if any(k in novo for k in v): sys.exit('ERRO: sobrou marcador sem trocar em ' + slug)
    if novo != atual:
        mudou += 1
        print(('diferente: ' if conferir else 'atualizado: ') + slug)
        if not conferir: open(p, 'w', encoding='utf-8').write(novo)
    else: print('igual: ' + slug)
print('%d painel(is) %s' % (mudou, 'diferentes' if conferir else 'atualizados'))
