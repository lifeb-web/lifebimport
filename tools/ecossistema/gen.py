import textwrap, html
STY={'n':('var(--card)','var(--line)',1,'var(--purple-d)','var(--muted)'),
     'p':('var(--purple-bg)','var(--purple)',2,'var(--purple-d)','var(--purple-d)'),
     'm':('var(--card)','var(--mag)',2,'var(--mag-t)','var(--muted)'),
     'g':('var(--green-bg)','var(--green)',2,'var(--green-t)','var(--green-t)'),
     'x':('var(--gray-bg)','var(--faint)',2,'var(--fg)','var(--muted)')}
W=380; GAP=34
def esc(s): return html.escape(s,quote=False)
def svg(rows, edges, title_id, band=None):
    """rows: list of rows; each row = list of nodes (id,title,sub,style). 1 or 2 nodes per row."""
    pos={}; y=10; out=[]; nodes=[]
    for r in rows:
        n=len(r); w=340 if n==1 else 165
        lines_max=0; prep=[]
        for (nid,t,sub,st) in r:
            cw=int((w-26)/7.7)
            tl=textwrap.wrap(t,max(10,int((w-26)/8.9)))
            sl=textwrap.wrap(sub,cw) if sub else []
            prep.append((nid,tl,sl,st)); lines_max=max(lines_max,len(tl)*18+len(sl)*16)
        h=max(46,lines_max+22)
        for k,(nid,tl,sl,st) in enumerate(prep):
            x=10 if n==1 else (10 if k==0 else 205)
            pos[nid]=(x,y,w,h)
            fill,stroke,sw,tc,sc=STY[st]
            g=f'<g><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
            ty=y+21
            for l in tl: g+=f'<text x="{x+12}" y="{ty}" font-weight="800" fill="{tc}" font-size="14">{esc(l)}</text>'; ty+=18
            for l in sl: g+=f'<text x="{x+12}" y="{ty}" fill="{sc}" font-size="13">{esc(l)}</text>'; ty+=16
            nodes.append(g+'</g>')
        y+=h+GAP
    total=y-GAP+10
    paths=[];labels=[]
    for (a,b,lab) in edges:
        ax,ay,aw,ah=pos[a]; bx,by,bw,bh=pos[b]
        x1=ax+aw/2; y1=ay+ah; x2=bx+bw/2; y2=by
        if abs(x1-x2)<1: d=f'M{x1:.0f} {y1} V{y2}'
        else:
            mid=y1+GAP/2; d=f'M{x1:.0f} {y1} V{mid:.0f} H{x2:.0f} V{y2}'
        paths.append(f'<path d="{d}"/>')
        if lab:
            lx=(x1+x2)/2 if abs(x1-x2)>1 else x1+6
            ly=(y1+y2)/2+4 if abs(x1-x2)<1 else y1+GAP/2-4
            anchor='middle' if abs(x1-x2)>1 else 'start'
            labels.append(f'<text x="{lx:.0f}" y="{ly:.0f}" text-anchor="{anchor}">{esc(lab)}</text>')
    mk=f'm{title_id}'
    s=(f'<svg viewBox="0 0 {W} {total}" xmlns="http://www.w3.org/2000/svg" font-size="13"><defs><marker id="{mk}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--mag)"/></marker></defs>'
       f'<g stroke="var(--mag)" stroke-width="2" fill="none" marker-end="url(#{mk})">{"".join(paths)}</g>'
       f'<g font-weight="700" fill="var(--mag-t)" font-size="12.5">{"".join(labels)}</g>{"".join(nodes)}</svg>')
    return s
