"""Componentes de HTML do Ecossistema (sem dependências)."""
import html, re

def e(s):
    return html.escape(s, quote=True)

_det = [0]

# estados de entrega: ok = no ar; te = pronto/em teste; pl = planejado; de = depende de decisão; lm = limite conhecido; of = desligado de propósito
PILL = {"ok": "No ar", "te": "Em implantação", "pl": "Planejado", "de": "Depende de decisão", "lm": "Limite conhecido", "of": "Desligado de propósito", "voo": "Em voo", "sim": "Em simulação", "corr": "Em correção", "ap": "No ar, a provar"}

def pill(k, txt=None):
    return f'<span class="pill p-{k}">{txt or PILL[k]}</span>'

# prefixos de item do estado.json que ganham selo próprio: "Em voo" = deploy em andamento (pronto, publicando agora; ainda não no ar);
# "Em correção" = estava pronto, mas a publicação abortou ou um defeito foi encontrado (não está no ar)
SELOS = {"Em voo: ": "voo", "Em simulação: ": "sim", "Em correção: ": "corr"}

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
    corpo_h = corpo if corpo.lstrip().startswith("<ul") else f"<p>{corpo}</p>"
    return f'<div class="callout c-{k}"><b>{titulo}</b>{corpo_h}</div>'

def stats(lista):
    return '<div class="stats">' + "".join(f'<div class="stat s-{k}"><b>{n}</b><span>{t}</span></div>' for n, t, k in lista) + "</div>"

NAV = []   # (grupo, id, titulo)

def sec(id_, grupo, titulo, lead, corpo, extra=""):
    NAV.append((grupo, id_, titulo))
    n = len(NAV)
    ld = f'<p class="lead">{lead}</p>' if lead else ""
    return (f'<section class="sec" id="{id_}" data-n="{n}" data-t="{e(titulo)}" aria-labelledby="h-{id_}">'
            f'<div class="sec-in"><h2 id="h-{id_}"><span class="num">{n}</span><span class="tt">{titulo}</span>{extra}</h2>{ld}{corpo}</div></section>')


# ---------------------------------------------------------------------------
# 19/11/2026: textos curtos. Nenhum parágrafo, item de lista ou célula passa de ~25 palavras sem virar
# "resumo + Ver mais": o começo fica visível (frase curta) e o restante vai para uma sanfona com
# marcadores. Nada é apagado: o texto completo continua na página (e na busca). Só afeta a página longa.
# ---------------------------------------------------------------------------
_TAGRE = re.compile(r"<[^>]+>")
_PARES = ("b", "strong", "em", "i", "code", "span", "a", "sup", "small")
MAX_PAL = 25

def n_palavras(h):
    return len(_TAGRE.sub("", h).split())

def _balanceado(h):
    for t in _PARES:
        if len(re.findall(r"<%s[\s>]" % t, h)) != len(re.findall(r"</%s>" % t, h)):
            return False
    return True

def _fragmentos(h):
    """Quebra o HTML em frases/orações (após '. ' ou '; '), só onde as marcações estão fechadas e fora de parênteses."""
    pos, ini, prof, out, i = [], 0, 0, [], 0
    for m in re.finditer(r"[.;]\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9\"“(<a-záéíóúâêôãõç])", h):
        corte = m.end()
        pre = h[ini:m.start() + 1]
        if pre.count("(") != pre.count(")") or not _balanceado(pre):
            continue
        if m.group(0)[0] == "." and re.search(r"(\b\d|\bp|\bex|\bnº|\bSr|\bDr)\.$", pre) and n_palavras(pre) < 3:
            continue
        out.append(pre.strip()); ini = corte
    out.append(h[ini:].strip())
    return [f for f in out if f]

def _virgulas(h):
    """Fallback: oração única longa, quebra em vírgulas fora de parênteses (só se marcações fechadas)."""
    out, ini, prof = [], 0, 0
    for k, ch in enumerate(h):
        if ch == "(": prof += 1
        elif ch == ")": prof -= 1
        elif ch == "," and prof == 0 and k + 1 < len(h) and h[k + 1] == " ":
            pre = h[ini:k + 1]
            if _balanceado(pre) and n_palavras(pre) >= 6:
                out.append(pre.strip()); ini = k + 2
    out.append(h[ini:].strip())
    return [f for f in out if f]

def _fim(f):
    f = f.rstrip()
    return f[:-1] + "." if f.endswith((";", ",")) else f

def _por_br(frs):
    """Quebra também em <br>, só onde as marcações estão fechadas."""
    out = []
    for f in frs:
        parts, acc = re.split(r"<br\s*/?>", f), ""
        for p_ in parts:
            acc = (acc + "<br>" + p_) if acc else p_
            if _balanceado(acc) and acc.strip():
                out.append(acc.strip()); acc = ""
        if acc.strip():
            out.append(acc.strip())
    return out

def dividir(h, maximo=MAX_PAL):
    """Devolve (inicio_html, [restos_html]) ou None se não precisa/der para dividir."""
    if n_palavras(h) <= maximo:
        return None
    fr = _por_br(_fragmentos(h))
    fr = [y for f in fr for y in (_virgulas(f) if n_palavras(f) > maximo else [f])]
    if len(fr) == 1:
        return None
    lead, k = [], 0
    for f in fr:
        if lead and n_palavras(" ".join(lead + [f])) > maximo:
            break
        lead.append(f); k += 1
    if k == len(fr):          # coube tudo: só passou pouco do limite
        return None
    ini = _fim(" ".join(lead))
    resto = [_fim(f) for f in fr[k:]]
    return ini, resto

def _sanfona(resto):
    itens = "".join(f"<li>{r}</li>" for r in resto)
    return (f'<details class="mais"><summary><span>Ver mais</span></summary><ul class="mais-l">{itens}</ul></details>')

_BLOCO = re.compile(r"<(p|li|td)((?:\s[^>]*)?)>((?:(?!</?(?:p|li|ul|ol|td|tr|table|div|details|h[1-6]|section|figure|svg)[\s>]).)*)</\1>", re.S)

_re_li = re.compile(r'<li>(.*?)</li>', re.S)

def _topicos(h):
    """Texto corrido com 3 ou mais orações separadas por ';' vira introdução + lista de tópicos (visível, sem esconder nada)."""
    if n_palavras(h) <= 18 or h.count("; ") < 2:
        return None
    fr = []
    for f in re.split(r";\s+", h):
        if fr and not _balanceado(fr[-1]):
            fr[-1] += "; " + f
        else:
            fr.append(f)
    if len(fr) < 3 or not all(_balanceado(f) for f in fr):
        return None
    intro = ""
    k = fr[0].find(": ")
    if 0 < k and n_palavras(fr[0][:k]) <= 14 and fr[0][:k].count("(") == fr[0][:k].count(")"):
        intro = fr[0][:k + 1]; fr[0] = fr[0][k + 2:]
    fr = [f.strip().rstrip(".") + "." if not f.strip().endswith(("?", "!")) else f.strip() for f in fr if f.strip()]
    return (f'<span class="pts-i">{intro}</span>' if intro else "") + '<ul class="pts">' + "".join(f"<li>{f[0].upper() + f[1:] if f[0].islower() else f}</li>" for f in fr) + "</ul>"

from resumos import R as _RES

def encurtar(corpo):
    def troca(m):
        t, attrs, inner = m.group(1), m.group(2), m.group(3)
        if 'class="sr"' in attrs or 'class="full"' in attrs or "<details" in inner:
            return m.group(0)
        plano = "".join(_TAGRE.sub("", inner).split())
        for chave, resumo in _RES.items():
            if plano.lower().startswith("".join(chave.split()).lower()) and n_palavras(inner) > n_palavras(resumo) + 3:
                full = f'<details class="mais"><summary><span>Ver detalhes</span></summary><p class="full">{inner}</p></details>'
                return f"<{t}{attrs}>{resumo}{full}</{t}>" if t != "p" else f"<{t}{attrs}>{resumo}</{t}>{full}"
        pts = _topicos(inner)
        if pts:
            if t == "li" and pts.startswith('<ul class="pts">'):
                return "".join(f"<li{attrs}>{x}</li>" for x in _re_li.findall(pts))
            return f"<{t}{attrs}>{pts}</{t}>"
        r = dividir(inner)
        if not r:
            return m.group(0)
        ini, resto = r
        if t == "p":
            return f"<{t}{attrs}>{ini}</{t}>{_sanfona(resto)}"
        return f"<{t}{attrs}>{ini}{_sanfona(resto)}</{t}>"
    return _BLOCO.sub(troca, corpo)

def curto(txt, maximo=12):
    """Título curto de um item de estado (texto puro): até o primeiro '(', ':' ou ';'; no máximo `maximo` palavras."""
    base = txt
    for pref in SELOS:
        if base.startswith(pref):
            base = base[len(pref):]
    cut = len(base)
    for s in (" (", ": ", "; ", " — "):
        k = base.find(s)
        if 0 < k < cut:
            cut = k
    h = base[:cut].strip().rstrip(",.:;")
    p = h.split()
    if len(p) > maximo:
        h = " ".join(p[:maximo]).rstrip(",.:;") + "…"
    return h

def item_estado(txt, deck=False):
    """Item de estado: título curto visível + texto completo na sanfona (o texto completo nunca some)."""
    c = curto(txt)
    sel = ""
    for pref, k in SELOS.items():
        if txt.startswith(pref):
            cls = f"dp dp-{k}" if deck else f"pill p-{k}"
            sel = f'<span class="{cls}">{PILL[k]}</span><span class="sr">:</span> '
    if curto(txt, 999) == c and n_palavras(txt) <= len(c.split()) + 2:
        return f"{sel}{c}" if sel else txt
    return (f'<span class="it">{sel}{c}</span><details class="mais"><summary><span>Ver o texto completo</span></summary>'
            f'<p class="full">{selo(txt, deck)}</p></details>')


def tabela_curta(heads, rows, cls="", cap="", n=5):
    """19/11/2026: mostra as n linhas mais recentes (a lista já vem do mais novo ao mais antigo) e guarda o resto em 'Ver todas'."""
    if len(rows) <= n:
        return tabela(heads, rows, cls, cap)
    return tabela(heads, rows[:n], cls, cap) + det(f"Ver todas ({len(rows)})", tabela(heads, rows[n:], cls, cap + " (anteriores)"))
