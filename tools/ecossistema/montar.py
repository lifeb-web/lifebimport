#!/usr/bin/env python3
"""Monta ecossistema/index.html (página única, tudo embutido). Uso: python3 tools/ecossistema/montar.py [saida]
"""
import os, sys, re, json
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from comp import NAV, e, encurtar
import conteudo1 as c1, conteudo2 as c2, conteudo3 as c3
VERSAO = c3.VERSAO

HEX = r'(?:(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{8}|\d{8})'
def sem_hashes(h):
    """A página pública não mostra identificadores técnicos de commit ou versão (ficam só em HISTORICO.md e versoes.json)."""
    h = re.sub(r'\s*\((?:commit |versão )?' + HEX + r'\b[^)]*\)', '', h)
    h = re.sub(r'(?:versão anterior|anterior|commit|versão)\s+' + HEX + r'\b( guardada| no git)?', lambda x: 'versão anterior guardada' if ('anterior' in x.group(0) or x.group(1)) else '', h)
    h = re.sub(r'(?<![\w-])' + HEX + r'\b', '', h)
    h = re.sub(r'\s*\(\s*\)', '', h)
    return h

def montar():
    NAV.clear()
    corpo = [c1.s_inicio(), c1.s_quem(), c1.s_status(), c1.s_checklist(), c1.s_visao(), c1.s_entrada(), c1.s_ana(), c1.s_ana2(), c1.s_destinos(),
             c2.s_cadencia(), c2.s_recuperacao(), c2.s_bia(), c2.s_automacoes(), c2.s_crm(), c2.s_hoje(), c2.s_central(), c2.s_outras(), c2.s_meta(),
             c3.s_regras(), c3.s_seguranca(), c3.s_versoes(), c3.s_observ(), c3.s_duvidas(), c3.s_sobre()]
    # a capa foi registrada no NAV depois de status (ordem de chamada); reordena para a ordem real do documento
    ordem = ["inicio", "quem", "status", "checklist", "visao", "entrada", "ana", "ana-seguranca", "destinos", "cadencia", "recuperacao", "bia", "automacoes", "crm", "hoje", "central", "outras", "meta", "regras", "seguranca", "versoes", "observ", "duvidas", "sobre"]
    d = {i: (g, i, t) for g, i, t in NAV}
    nav = [d[i] for i in ordem]
    # números das seções = posição real
    html_corpo = "".join(corpo)
    html_corpo = encurtar(html_corpo)
    html_corpo = sem_hashes(html_corpo)
    for pos, i in enumerate(ordem, 1):
        html_corpo = re.sub(r'(<section class="sec[^"]*" id="%s" data-n=")\d+(")' % re.escape(i), r'\g<1>%d\g<2>' % pos, html_corpo)
        html_corpo = re.sub(r'(<section class="sec" id="%s" data-n="%d"[^>]*>.*?<span class="num">)\d+(</span>)' % (re.escape(i), pos), r'\g<1>%d\g<2>' % pos, html_corpo, count=1, flags=re.S) if i != "inicio" else html_corpo
    toc = []
    ult = None
    for pos, (g, i, t) in enumerate(nav, 1):
        if g != ult:
            toc.append(f'<li class="gr" role="presentation">{e(g)}</li>'); ult = g
        toc.append(f'<li data-id="{i}"><a href="#{i}"><span class="n">{pos}</span><span>{e(t)}</span></a></li>')
    css = open(os.path.join(AQUI, "estilo.css"), encoding="utf-8").read()
    js = open(os.path.join(AQUI, "app.js"), encoding="utf-8").read()
    css += "\n" + open(os.path.join(AQUI, "deck.css"), encoding="utf-8").read()
    djs = open(os.path.join(AQUI, "deck.js"), encoding="utf-8").read()
    import slides as SL
    deck = SL.deck()
    # o bloco "aguardam_deploy_ana" (marcação interna do que vira "no ar" depois de um deploy) não vai para a página
    estado_json = json.dumps({k: v for k, v in SL.ESTADO.items() if k != "aguardam_deploy_ana"}, ensure_ascii=False).replace("</", "<\\/")
    N = len(nav)
    ic_menu = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>'
    ic_tema = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4v16"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>'
    ic_ap = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="M10 8.5l4 1.5-4 1.5z" fill="currentColor"/></svg>'
    ic_fs = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'
    ic_prev = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
    ic_next = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
    ic_x = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
    ic_q = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/></svg>'
    head = f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Ecossistema Life B</title>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="noindex,nofollow,noarchive">
<meta name="versao" content="{VERSAO}">
<meta name="description" content="Como a operação comercial da Life B funciona: Ana (SDR Inbound virtual), Bia, Agendor, funis, cadência, páginas de trabalho, segurança e status das entregas.">
<link rel="icon" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script>try{{var t=localStorage.getItem('eco.tema');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}}catch(e){{}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&amp;display=swap">
<style>
{css}
</style>
</head>
<body>
<script type="application/json" id="estado-eco">{estado_json}</script>
<a class="skip" href="#inicio">Pular para o conteúdo</a>
<header class="mast" role="banner"><div class="mast-in">
<button type="button" class="btn" id="menuBtn" aria-expanded="false" aria-controls="side" aria-label="Abrir o índice de seções">{ic_menu}<span class="tx">Menu</span></button>
<a class="logo" href="#inicio" aria-label="Life B, ir ao início"><img class="logo-claro" src="/logo-lifeb.png" alt="" width="72" height="32"><img class="logo-escuro" src="/logo-lifeb-escuro.png" alt="" width="72" height="32"></a>
<span class="nm">Ecossistema <span>Life B</span> <small class="ver">v{VERSAO}</small></span>
<span class="grow"></span>
<button type="button" class="btn" id="temaBtn" aria-label="Tema da página: automático. Tocar para alternar.">{ic_tema}<span class="tx">Automático</span></button>
<button type="button" class="btn pri" id="apBtn" data-apres aria-pressed="false" aria-label="Modo apresentação em tela cheia">{ic_ap}<span class="tx">Apresentar</span></button>
</div></header>
<div class="shell">
<nav class="side" id="side" aria-label="Seções do guia">
<div class="side-h"><b>Índice</b><button type="button" class="btn fechar" aria-label="Fechar o índice">{ic_x}</button></div>
<label class="sr" for="busca">Buscar nas seções</label>
<input class="busca" id="busca" type="search" placeholder="Buscar (atalho /)" autocomplete="off">
<div class="busca-r" aria-live="polite"></div>
<ul class="toc">
{"".join(toc)}
</ul>
</nav>
<main id="conteudo" aria-label="Conteúdo do guia">
{html_corpo}
<footer class="foot"><b>Ecossistema Life B</b> · Versão {VERSAO} · Atualizado em <span id="atualizadoEm">{SL.ATUAL}</span>. Este guia reflete o sistema nessa data. Regras e prazos podem mudar depois; em caso de dúvida, vale o que está ao vivo (aba BIA do Dash e o Agendor).</footer>
</main>
</div>
{deck}
<script>
{js}
</script>
<script>
{djs}
</script>
</body>
</html>
'''
    return head

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, "..", "..", "ecossistema", "index.html")
    h = montar()
    open(out, "w", encoding="utf-8").write(h)
    print("escrito", os.path.abspath(out), len(h), "bytes")
