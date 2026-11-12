import textwrap, html
STY={'n':('var(--card)','var(--line)',1,'var(--purple-d)','var(--muted)'),
     'p':('var(--purple-bg)','var(--purple)',2,'var(--purple-d)','var(--purple-d)'),
     'm':('var(--card)','var(--mag)',2,'var(--mag-t)','var(--muted)'),
     'g':('var(--green-bg)','var(--green)',2,'var(--green-t)','var(--green-t)'),
     'x':('var(--gray-bg)','var(--faint)',2,'var(--fg)','var(--muted)')}
W=360; GAP=64; M=10   # largura do desenho, espaço entre linhas de caixas, margem
def esc(s): return html.escape(s,quote=False)
class Erro(Exception): pass
def svg(rows, edges, title_id):
    """rows: lista de linhas; cada linha tem 1 ou 2 caixas (id,título,subtítulo,estilo). edges: (de,para,rótulo).
    Geometria simétrica: 1 caixa = largura total; 2 caixas = duas colunas iguais com o MESMO limite direito."""
    pos={}; rowof={}; y=M; nodes=[]; inner=W-2*M
    for ri,r in enumerate(rows):
        n=len(r); cg=20; w=inner if n==1 else (inner-cg)//2
        prep=[]; hmax=0
        for (nid,t,sub,st) in r:
            tl=textwrap.wrap(t,max(10,int((w-26)/8.9))); sl=textwrap.wrap(sub,int((w-26)/7.7)) if sub else []
            prep.append((nid,tl,sl,st)); hmax=max(hmax,len(tl)*18+len(sl)*16)
        h=max(48,hmax+24)
        for k,(nid,tl,sl,st) in enumerate(prep):
            x=M if n==1 or k==0 else M+w+cg
            pos[nid]=(x,y,w,h); rowof[nid]=ri
            fill,stroke,sw,tc,sc=STY[st]
            g=f'<g><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
            ty=y+22
            for l in tl: g+=f'<text x="{x+12}" y="{ty}" font-weight="800" fill="{tc}" font-size="14">{esc(l)}</text>'; ty+=18
            for l in sl: g+=f'<text x="{x+12}" y="{ty}" fill="{sc}" font-size="13">{esc(l)}</text>'; ty+=16
            nodes.append(g+'</g>')
        y+=h+GAP
    total=y-GAP+M
    # pontos de ligação distribuídos: cada aresta sai e chega num ponto PRÓPRIO da borda (nada de pontas de seta empilhadas)
    saindo={}; chegando={}
    for i,(a,b,l) in enumerate(edges): saindo.setdefault(a,[]).append(i); chegando.setdefault(b,[]).append(i)
    def ponto(nid,lista,i):
        x,_,w,_=pos[nid]; k=lista.index(i); n=len(lista)
        # ordena por posição do outro extremo para não cruzar: quem vai mais à esquerda sai mais à esquerda
        return x+w*(k+1)/(n+1)
    def ordenar(lista,outro):
        return sorted(lista,key=lambda i:(pos[outro(i)][0]+pos[outro(i)][2]/2))
    sai_o={a:ordenar(l,lambda i:edges[i][1]) for a,l in saindo.items()}
    che_o={b:ordenar(l,lambda i:edges[i][0]) for b,l in chegando.items()}
    # faixas (lanes): arestas em cotovelo entre o mesmo par de linhas usam alturas diferentes
    lanes={}
    for i,(a,b,l) in enumerate(edges):
        ra,rb=rowof[a],rowof[b]
        x1=ponto(a,sai_o[a],i); x2=ponto(b,che_o[b],i)
        if abs(x1-x2)>1: lanes.setdefault((ra,rb),[]).append(i)
    lane_i={}
    for k,l in lanes.items():
        l=sorted(l,key=lambda i:ponto(edges[i][0],sai_o[edges[i][0]],i))
        for j,i in enumerate(l): lane_i[i]=(j+1,len(l))
    segs=[]; paths=[]; rotulos=[]
    for i,(a,b,lab) in enumerate(edges):
        ax,ay,aw,ah=pos[a]; bx,by,bw,bh=pos[b]
        x1=ponto(a,sai_o[a],i); y1=ay+ah; x2=ponto(b,che_o[b],i); y2=by
        if abs(x1-x2)<=1: pts=[(x1,y1),(x1,y2)]
        else:
            j,m=lane_i[i]; ym=y1+GAP*j/(m+1) if rowof[b]==rowof[a]+1 else y1+GAP*j/(m+1)
            pts=[(x1,y1),(x1,ym),(x2,ym),(x2,y2)]
        paths.append('M'+' L'.join(f'{px:.1f} {py:.1f}' for px,py in pts)); segs.append((i,pts))
        if lab:
            tw=len(lab)*8.2+22; rotulos.append((i,tw,lab,pts))
    # ── verificador geométrico: qualquer problema derruba a geração ──
    def tocaCaixa(sx1,sy1,sx2,sy2,box):
        bx,by,bw,bh=box; xa,xb=sorted((sx1,sx2)); ya,yb=sorted((sy1,sy2))
        return xa<bx+bw-1 and xb>bx+1 and ya<by+bh-1 and yb>by+1
    erros=[]
    for i,pts in segs:
        a,b,_=edges[i]
        for (p,q) in zip(pts,pts[1:]):
            for nid,box in pos.items():
                if nid in (a,b): continue
                if tocaCaixa(p[0],p[1],q[0],q[1],box): erros.append(f'aresta {a}->{b} atravessa a caixa {nid}')
    for ii,pi in segs:
        for jj,pj in segs:
            if jj<=ii: continue
            for (p,q) in zip(pi,pi[1:]):
                for (r,s) in zip(pj,pj[1:]):
                    if abs(p[0]-q[0])<1 and abs(r[0]-s[0])<1 and abs(p[0]-r[0])<2.5:
                        lo=max(min(p[1],q[1]),min(r[1],s[1])); hi=min(max(p[1],q[1]),max(r[1],s[1]))
                        if hi-lo>2: erros.append(f'arestas {edges[ii][:2]} e {edges[jj][:2]} se sobrepõem na vertical')
                    if abs(p[1]-q[1])<1 and abs(r[1]-s[1])<1 and abs(p[1]-r[1])<2.5:
                        lo=max(min(p[0],q[0]),min(r[0],s[0])); hi=min(max(p[0],q[0]),max(r[0],s[0]))
                        if hi-lo>2: erros.append(f'arestas {edges[ii][:2]} e {edges[jj][:2]} se sobrepõem na horizontal')
    def colide(rb,i):
        for nid,box in pos.items():
            if tocaCaixa(rb[0],rb[1],rb[0]+rb[2],rb[1]+rb[3],box): return f'caixa {nid}'
        for jj,pj in segs:
            for (r,s2) in zip(pj,pj[1:]):
                if tocaCaixa(r[0],r[1],s2[0],s2[1],rb) and not (jj==i and False): return f'linha {edges[jj][:2]}'
        if rb[0]<2 or rb[0]+rb[2]>W-2: return 'borda do desenho'
        return None
    colocados=[]; lab_svg_l=[]
    def candidatos(pts,tw):
        out=[]; ps=list(zip(pts,pts[1:]))
        ordem=[len(ps)-1]+[k for k in range(len(ps)-1,-1,-1) if k!=len(ps)-1]
        for k in ordem:
            (xa,ya),(xb,yb)=ps[k]
            ultimo=(k==len(ps)-1)
            if abs(xa-xb)<1:   # trecho vertical: rótulo ao lado
                comp=abs(yb-ya); ponta=16 if ultimo else 0
                for lado in (1,-1):
                    for f in (0.5,0.35,0.65,0.25,0.75):
                        cy=min(ya,yb)+(comp-ponta)*f+(0 if (yb>ya) else ponta)
                        out.append((xb+lado*(tw/2+10),cy))
            else:              # trecho horizontal: rótulo acima ou abaixo
                for lado in (-1,1):
                    for f in (0.5,0.3,0.7):
                        cx=min(xa,xb)+abs(xb-xa)*f
                        out.append((cx,ya+lado*18))
        return out
    for (i,tw,lab,pts) in rotulos:
        escolhido=None; motivo=[]
        for (cx,cy) in candidatos(pts,tw):
            rb=(cx-tw/2,cy-11,tw,22); rbm=(rb[0]-5,rb[1]-5,rb[2]+10,rb[3]+10)
            m=colide(rbm,-1)
            if m is None and all(not (rbm[0]<c[0]+c[2] and c[0]<rbm[0]+rbm[2] and rbm[1]<c[1]+c[3] and c[1]<rbm[1]+rbm[3]) for c in colocados): escolhido=(cx,cy,rb); break
            motivo.append(m)
        if not escolhido: erros.append(f'rótulo "{lab}" sem lugar livre ({motivo[:2]})'); continue
        colocados.append((escolhido[2][0]-5,escolhido[2][1]-5,escolhido[2][2]+10,escolhido[2][3]+10)); lab_svg_l.append((escolhido[0],escolhido[1],tw,lab))
    rotulos_final=lab_svg_l
    for b,l in chegando.items():
        xs=[round(ponto(b,che_o[b],i)) for i in l]
        if len(set(xs))!=len(xs): erros.append(f'setas chegam no mesmo ponto de {b}')
    for nid,(x,yy,w,h) in pos.items():
        if x<0 or x+w>W: erros.append(f'caixa {nid} fora da largura')
    if erros: raise Erro('; '.join(sorted(set(erros))))
    mk=f'm{title_id}'
    lab_svg=''.join(f'<g><rect x="{lx-tw/2:.1f}" y="{ly-11:.1f}" width="{tw:.1f}" height="22" rx="11" fill="var(--card)" stroke="var(--line)"/><text x="{lx:.1f}" y="{ly+4.5:.1f}" text-anchor="middle" font-weight="700" fill="var(--mag-t)" font-size="12.5">{esc(lab)}</text></g>' for (lx,ly,tw,lab) in rotulos_final)
    return (f'<svg viewBox="0 0 {W} {total:.0f}" xmlns="http://www.w3.org/2000/svg" font-size="13"><defs><marker id="{mk}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--mag)"/></marker></defs>'
            f'<g stroke="var(--mag)" stroke-width="2" fill="none" stroke-linejoin="round" marker-end="url(#{mk})">'+''.join(f'<path d="{d}"/>' for d in paths)+'</g>'+''.join(nodes)+lab_svg+'</svg>')
