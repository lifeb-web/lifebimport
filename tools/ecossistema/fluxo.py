"""Gerador de fluxogramas SVG do Ecossistema (14/11/2026).
Cada desenho tem duas versões do MESMO conteúdo: larga (computador, grade de colunas) e estreita (celular, uma coluna).
Cores vêm de classes CSS (tema claro/escuro). Um verificador geométrico derruba a geração se uma seta atravessar uma caixa,
se setas se sobrepuserem ou se um rótulo cair sobre uma caixa."""
import html, textwrap

class Erro(Exception):
    pass

def esc(s):
    return html.escape(s, quote=False)

M = 10          # margem do desenho
GY = 54         # espaço vertical entre linhas de caixas
GX = 34         # espaço horizontal entre colunas
TIER0, TIER = 14, 11   # primeira corrida horizontal a 14 px da caixa; camadas a cada 11 px
CT, CS = 8.6, 7.4   # largura média (px) por caractere: título 14 negrito, subtítulo 12,5 (Montserrat, conservador)

def _wrap(txt, w, per):
    n = max(8, int((w - 24) / per))
    return textwrap.wrap(txt, n) or [""]

def _prep(nodes, W, cols, gutter):
    """calcula posições. nodes: lista de dicts id,t,s,st,c,r,span"""
    inner = W - 2 * M - gutter
    cw = (inner - (cols - 1) * GX) / cols
    rows = {}
    for n in nodes:
        span = n.get("span", 1)
        w = cw * span + GX * (span - 1)
        n["w"] = w
        n["tl"] = _wrap(n["t"], w, CT)
        n["sl"] = _wrap(n["s"], w, CS) if n.get("s") else []
        n["h"] = max(52, len(n["tl"]) * 18 + len(n["sl"]) * 16 + 26)
        rows.setdefault(n["r"], []).append(n)
    y = M
    ypos = {}
    for r in sorted(rows):
        h = max(n["h"] for n in rows[r])
        ypos[r] = (y, h)
        y += h + GY
    for n in nodes:
        y0, h = ypos[n["r"]]
        n["y"], n["h"] = y0, h
        n["x"] = M + n["c"] * (cw + GX)
    total = y - GY + M
    return total

def _seg_hits(p, q, n, tol=1):
    xa, xb = sorted((p[0], q[0]))
    ya, yb = sorted((p[1], q[1]))
    return xa < n["x"] + n["w"] - tol and xb > n["x"] + tol and ya < n["y"] + n["h"] - tol and yb > n["y"] + tol

def desenhar(uid, nodes, edges, W, cols, narrow=False, ordem_narrow=None):
    # aresta com 4º item "w" só aparece na versão larga
    edges = [e for e in edges if not (narrow and len(e) > 3 and e[3] == "w")]
    nodes = [dict(n) for n in nodes]
    if narrow and ordem_narrow:
        manter = set(ordem_narrow)
        nodes = [n for n in nodes if n["id"] in manter]
        edges = [e for e in edges if e[0] in manter and e[1] in manter]
        for n in nodes:
            n["r"], n["c"] = ordem_narrow.index(n["id"]), 0
    by = {n["id"]: n for n in nodes}
    if narrow:
        # uma caixa por linha, na ordem (linha, coluna); setas que não são entre vizinhos vão por faixas laterais
        ordem = sorted(nodes, key=lambda n: (n["r"], n["c"]))
        for i, n in enumerate(ordem):
            n["r"], n["c"], n["span"] = i, 0, 1
        pos_ordem = {n["id"]: i for i, n in enumerate(ordem)}
        lat = [e for e in edges if pos_ordem[e[1]] - pos_ordem[e[0]] != 1]
        gutter = 12 * len(lat) + (6 if lat else 0)
        cols = 1
    else:
        lat = [e for e in edges if by[e[0]]["r"] > by[e[1]]["r"]]
        gutter = (14 * len(lat) + 8) if lat else 0
    total = _prep(nodes, W, cols, gutter)
    by = {n["id"]: n for n in nodes}
    # distribuição dos pontos de saída/entrada
    outs, ins = {}, {}
    segs = []
    meta = []
    # 20/11/2026: faixas aninhadas: a de menor extensão fica mais à esquerda (interna) e a maior mais à direita; o rótulo de uma faixa se estende para a esquerda e não cruza a faixa de ninguém
    lat_ord = sorted(lat, key=lambda e: abs(by[e[1]]["y"] - by[e[0]]["y"]))
    lane_i = {id(e): k for k, e in enumerate(lat_ord)}
    for i, e in enumerate(edges):
        a, b = by[e[0]], by[e[1]]
        lane = id(e) in lane_i
        same = (a["r"] == b["r"]) and not lane
        if lane or (a["r"] > b["r"]):
            kind = "lane"
        elif same:
            kind = "h"
        else:
            kind = "v"
        meta.append(kind)
        if kind == "v":
            outs.setdefault(a["id"], []).append(i)
            ins.setdefault(b["id"], []).append(i)

    def fx(n, lst, i, other):
        lst2 = sorted(lst, key=lambda j: by[edges[j][other]]["x"] + by[edges[j][other]]["w"] / 2)
        k = lst2.index(i)
        return n["x"] + n["w"] * (k + 1) / (len(lst2) + 1)

    # pontos distintos na lateral direita de cada caixa para as setas em faixa
    lados = {}
    for i, e in enumerate(edges):
        if meta[i] == "lane":
            lados.setdefault(e[0], []).append((i, "a", by[e[1]]["y"]))
            lados.setdefault(e[1], []).append((i, "b", by[e[0]]["y"]))
    slot = {}
    for nid, lst in lados.items():
        lst.sort(key=lambda t: t[2])
        for k, (i, w, _) in enumerate(lst):
            slot[(i, w)] = (k + 1) / (len(lst) + 1)
    # 20/11/2026: camada de cada cotovelo. Seta que sai do mesmo caixa e vai para a esquerda: a que sai mais à direita gira mais embaixo
    # (não cruza a vertical da outra); para a direita: a que sai mais à esquerda gira mais embaixo. Assim as corridas horizontais ficam
    # separadas por TIER px e cada rótulo cabe ao lado da sua própria linha.
    tier = {}
    for nid, lst in outs.items():
        a = by[nid]
        esq, dire = [], []
        for j in lst:
            b = by[edges[j][1]]
            xa = fx(a, outs[nid], j, 1); xb = fx(b, ins[b["id"]], j, 0)
            if abs(xa - xb) < 1: tier[j] = 0
            elif xb < xa: esq.append((xa, j))
            else: dire.append((xa, j))
        for k, (_, j) in enumerate(sorted(esq)): tier[j] = k
        for k, (_, j) in enumerate(sorted(dire, reverse=True)): tier[j] = k
    paths, pts_all, labels = [], [], []
    nlane = len(lat)
    for i, e in enumerate(edges):
        a, b = by[e[0]], by[e[1]]
        lab = e[2] if len(e) > 2 else ""
        kind = meta[i]
        if kind == "v":
            x1, y1 = fx(a, outs[a["id"]], i, 1), a["y"] + a["h"]
            x2, y2 = fx(b, ins[b["id"]], i, 0), b["y"]
            if abs(x1 - x2) < 1:
                pts = [(x1, y1), (x1, y2)]
            else:
                ym = y1 + TIER0 + tier[i] * TIER
                pts = [(x1, y1), (x1, ym), (x2, ym), (x2, y2)]
        elif kind == "h":
            ya = a["y"] + a["h"] / 2
            if a["x"] < b["x"]:
                pts = [(a["x"] + a["w"], ya), (b["x"], ya)]
            else:
                pts = [(a["x"], ya), (b["x"] + b["w"], ya)]
        else:
            # faixa lateral à direita
            k = lane_i.get(id(e), 0)
            lx = W - M - 6 - (12 if narrow else 14) * (nlane - 1 - k)
            ya = a["y"] + a["h"] * slot[(i, "a")]
            yb = b["y"] + b["h"] * slot[(i, "b")]
            pts = [(a["x"] + a["w"], ya), (lx, ya), (lx, yb), (b["x"] + b["w"], yb)]
        pts_all.append(pts)
        paths.append("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts))
        if lab:
            labels.append((i, lab, pts))
    erros = []
    # setas não podem atravessar caixas que não são as suas
    for i, pts in enumerate(pts_all):
        a, b = edges[i][0], edges[i][1]
        for p, q in zip(pts, pts[1:]):
            for n in nodes:
                if n["id"] in (a, b):
                    continue
                if _seg_hits(p, q, n):
                    erros.append(f"seta {a}->{b} atravessa {n['id']}")
    # sobreposição colinear
    for i in range(len(pts_all)):
        for j in range(i + 1, len(pts_all)):
            for p, q in zip(pts_all[i], pts_all[i][1:]):
                for r, s in zip(pts_all[j], pts_all[j][1:]):
                    if abs(p[0] - q[0]) < 1 and abs(r[0] - s[0]) < 1 and abs(p[0] - r[0]) < 3:
                        lo = max(min(p[1], q[1]), min(r[1], s[1])); hi = min(max(p[1], q[1]), max(r[1], s[1]))
                        if hi - lo > 2: erros.append(f"setas {edges[i][:2]} e {edges[j][:2]} sobrepostas (vertical)")
                    if abs(p[1] - q[1]) < 1 and abs(r[1] - s[1]) < 1 and abs(p[1] - r[1]) < 3:
                        lo = max(min(p[0], q[0]), min(r[0], s[0])); hi = min(max(p[0], q[0]), max(r[0], s[0]))
                        if hi - lo > 2: erros.append(f"setas {edges[i][:2]} e {edges[j][:2]} sobrepostas (horizontal)")
    # rótulos (20/11/2026): cada rótulo fica colado na SUA seta e longe das outras; nunca some em silêncio (antes, no celular, o rótulo caía longe
    # da seta e parecia de outra: "descarta" ao lado de "Ganho"). Sem lugar livre derruba a geração, na versão larga e na estreita.
    def toca_seta(rb, ignorar, folga):
        for j, pj in enumerate(pts_all):
            if j == ignorar: continue
            for p, q in zip(pj, pj[1:]):
                xa, xb = sorted((p[0], q[0])); ya, yb = sorted((p[1], q[1]))
                if xa < rb[0] + rb[2] + folga and xb > rb[0] - folga and ya < rb[1] + rb[3] + folga and yb > rb[1] - folga: return True
        return False
    def livre(rb, placed, nodes):
        if rb[0] < 1 or rb[0] + rb[2] > W - 1 or rb[1] < 0: return False
        if any(rb[0] < n["x"] + n["w"] and n["x"] < rb[0] + rb[2] and rb[1] < n["y"] + n["h"] and n["y"] < rb[1] + rb[3] for n in nodes): return False
        if any(rb[0] < c[0] + c[2] and c[0] < rb[0] + rb[2] and rb[1] < c[1] + c[3] and c[1] < rb[1] + rb[3] for c in placed): return False
        return True
    placed, lab_svg = [], []
    for i, lab, pts in labels:
        tw = len(lab) * 7.4 + 20
        sg = list(zip(pts, pts[1:]))
        ordem_seg = sorted(range(len(sg)), key=lambda k: (-(k == len(sg) - 1), -abs(sg[k][0][0] - sg[k][1][0]) - abs(sg[k][0][1] - sg[k][1][1])))
        cand = []
        if narrow and meta[i] == "lane":
            # faixa lateral: o rótulo vai no vão entre caixas, encostado na faixa, do lado do destino (depois do lado da origem)
            lx = pts[1][0]; a, b = by[edges[i][0]], by[edges[i][1]]
            gaps = []
            for n_, sentido in ((b, 1 if a["y"] < b["y"] else -1), (a, 1 if b["y"] < a["y"] else -1)):
                gaps.append(n_["y"] - GY / 2 if sentido == 1 else n_["y"] + n_["h"] + GY / 2)
            for gy in gaps:
                for dy in (0, -12, 12): cand.append((lx - tw / 2 + 6, gy + dy))
        for k in ordem_seg:
            (xa, ya), (xb, yb) = sg[k]
            for f in (0.5, 0.3, 0.7):
                cx, cy = xa + (xb - xa) * f, ya + (yb - ya) * f
                if abs(xa - xb) < 1: cand += [(cx + tw / 2 + 8, cy), (cx - tw / 2 - 8, cy)]
                else: cand += [(cx, cy - 15), (cx, cy + 15), (cx, cy)]
        ok = None
        for folga in (5, 1, -99):   # 1ª passada: longe de outras setas; 2ª: sem tocar; 3ª: só no estreito, cruzando faixa alheia
            if folga == -99 and not narrow: break
            for cx, cy in cand:
                rb = (cx - tw / 2, cy - 11, tw, 22)
                if not livre(rb, placed, nodes): continue
                if folga != -99 and toca_seta(rb, i, folga): continue
                ok = (cx, cy, rb); break
            if ok: break
        if not ok:
            erros.append(f'rótulo "{lab}" sem lugar livre colado à sua seta')
            continue
        placed.append(ok[2])
        lab_svg.append(f'<g class="lb" data-e="{edges[i][0]}>{edges[i][1]}"><rect x="{ok[0]-tw/2:.1f}" y="{ok[1]-11:.1f}" width="{tw:.1f}" height="22" rx="11"/><text x="{ok[0]:.1f}" y="{ok[1]+4.5:.1f}" text-anchor="middle">{esc(lab)}</text></g>')
    for n in nodes:
        if n["x"] < 0 or n["x"] + n["w"] > W:
            erros.append(f"caixa {n['id']} fora da largura")
    if erros:
        raise Erro(f"[{uid}] " + "; ".join(sorted(set(erros))))
    out = []
    for n in nodes:
        g = f'<g class="nd nd-{n.get("st","n")}" data-id="{n["id"]}"><rect x="{n["x"]:.1f}" y="{n["y"]:.1f}" width="{n["w"]:.1f}" height="{n["h"]:.1f}" rx="12"/>'
        ty = n["y"] + 23
        for l in n["tl"]:
            g += f'<text class="t" x="{n["x"]+12:.1f}" y="{ty:.1f}">{esc(l)}</text>'
            ty += 18
        for l in n["sl"]:
            g += f'<text class="s" x="{n["x"]+12:.1f}" y="{ty:.1f}">{esc(l)}</text>'
            ty += 16
        out.append(g + "</g>")
    mk = f"mk{uid}"
    return (f'<svg viewBox="0 0 {W} {total:.0f}" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">'
            f'<defs><marker id="{mk}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="mk"/></marker></defs>'
            f'<g class="eds" marker-end="url(#{mk})">' + "".join(f'<path data-e="{edges[k][0]}>{edges[k][1]}" d="{d}"/>' for k, d in enumerate(paths)) + "</g>" + "".join(out) + "".join(lab_svg) + "</svg>")

def figura(uid, titulo, descricao, nodes, edges, cols=4, ordem_narrow=None):
    """devolve <figure> com as duas versões. descricao: texto para leitores de tela (alt longo)."""
    ordem = [dict(n) for n in nodes]
    larga = desenhar(uid + "w", ordem, edges, 900, cols)
    estreita = desenhar(uid + "n", ordem, edges, 400, cols, narrow=True, ordem_narrow=ordem_narrow)
    return (f'<figure class="fig" role="group" aria-label="{esc(titulo)}"><figcaption class="sr">{esc(descricao)}</figcaption>'
            f'<div class="svgd v-wide">{larga}</div><div class="svgd v-narrow">{estreita}</div></figure>')
