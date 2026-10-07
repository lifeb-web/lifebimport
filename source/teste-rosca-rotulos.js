const fs=require('fs'),vm=require('vm');
const f=process.argv[2];
const html=fs.readFileSync(f,'utf8');
const sc=[...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).sort((a,b)=>b.length-a.length)[0];
const mk=()=>new Proxy(function(){}, {get:(t,p)=>p===Symbol.toPrimitive?()=>'':mk(),apply:()=>mk(),set:()=>true,construct:()=>mk()});
const ctx={console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},fetch:async()=>({ok:true,json:async()=>[],text:async()=>''}),localStorage:{getItem:()=>null,setItem(){}},sessionStorage:{getItem:()=>null,setItem(){}},navigator:{userAgent:''},location:{hash:'',search:'',href:''},addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){},addListener(){}}),requestAnimationFrame:()=>0,Intl,Date,Math,JSON,URL,URLSearchParams};
ctx.document=new Proxy({},{get:(t,p)=>p==='querySelector'||p==='getElementById'||p==='querySelectorAll'||p==='createElement'?()=>mk():mk(),set:()=>true});
ctx.window=ctx; vm.createContext(ctx);
try{vm.runInContext(sc,ctx,{timeout:5000});}catch(e){}
const keys=['outbound','superagos','recuperacao','inbound','reposicao','reativacao'];
const labels={outbound:'Outbound',superagos:'SuperAgos',recuperacao:'Recuperação',inbound:'Inbound',reposicao:'Reposição',reativacao:'Reativação'};
let seed=12345; const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296};
const donut=vm.runInContext('origemDonutSVG_',ctx);
let bad=0,total=0,ex=[];
for(const [w,h] of [[1200,900],[390,800]]){
  ctx.innerWidth=w; ctx.innerHeight=h; const soPct=w<520, gap=soPct?12:22;
  const VB=soPct?[-40,-10,280,220]:[-74,-10,348,220];
  for(let it=0;it<4000;it++){
    const vals=keys.map(()=>rnd()<0.25?0:Math.pow(rnd(),2.2)*100000);
    if(rnd()<0.3){ // casos com várias fatias pequenas juntas
      for(let i=0;i<keys.length;i++) if(rnd()<0.6) vals[i]=rnd()*1500; }
    const tot=vals.reduce((a,b)=>a+b,0); if(tot<=0) continue;
    const bd={canais:keys.map((k,i)=>({key:k,label:labels[k],color:'#000',tx:'#000',sub:'',valor:vals[i],cont:Math.round(vals[i]/3000),wins:[]})),totalValor:tot,totalCont:vals.reduce((a,b)=>a+Math.round(b/3000),0)};
    const svg=String(donut(bd,'v',null,false)); total++;
    const L=[...svg.matchAll(/class="orig-lb" data-k="(\w+)"[^>]*><polyline[^>]*points="([^"]+)"[^>]*><\/polyline><text x="([-\d.]+)" y="([-\d.]+)" text-anchor="(\w+)"/g)].map(m=>({k:m[1],x:+m[3],y:+m[4],anchor:m[5],pts:m[2].trim().split(' ').map(p=>p.split(',').map(Number))}));
    const boxes=L.map(l=>{const wd=soPct?14:(labels[l.k].length*5.8);const x0=l.anchor==='end'?l.x-wd:l.x;return {k:l.k,x0,x1:x0+wd,y0:l.y-8.5,y1:l.y+(soPct?4:13.5),l}});
    let err=null;
    for(const b of boxes){
      // dentro do viewBox
      if(b.x0<VB[0]-1||b.x1>VB[0]+VB[2]+1||b.y0<VB[1]-2||b.y1>VB[1]+VB[3]+2) err='fora do viewBox '+b.k;
      // fora do anel (distância do retângulo ao centro >= 87)
      const cx=Math.min(Math.max(100,b.x0),b.x1), cy=Math.min(Math.max(100,b.y0),b.y1);
      if(Math.hypot(cx-100,cy-100)<88) err=err||('dentro do anel '+b.k);
    }
    for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j]; if(a.x0<b.x1-0.6&&b.x0<a.x1-0.6&&a.y0<b.y1-0.6&&b.y0<a.y1-0.6) err=err||('sobrepoem '+a.k+'/'+b.k);}
    const segHit=(p,q,b)=>{for(let t=0;t<=1;t+=0.02){const x=p[0]+(q[0]-p[0])*t,y=p[1]+(q[1]-p[1])*t; if(x>b.x0+0.6&&x<b.x1-0.6&&y>b.y0+0.6&&y<b.y1-0.6) return true;} return false};
    for(const a of boxes)for(const b of boxes){ if(a===b) continue; const P=a.l.pts; for(let i=0;i<P.length-1;i++) if(segHit(P[i],P[i+1],b)) err=err||('linha de '+a.k+' cruza texto de '+b.k);}
    if(err){bad++; if(ex.length<4) ex.push({w,err,vals:vals.map(v=>Math.round(v/tot*100))});}
  }
}
console.log(f,'casos',total,'com problema',bad); ex.forEach(e=>console.log(JSON.stringify(e)));
// detalhe dos 3 primeiros erros por tipo
{ ctx.innerWidth=1200; ctx.innerHeight=900; seed=777; const seen={};
  for(let it=0;it<6000;it++){
    const vals=keys.map(()=>rnd()<0.25?0:Math.pow(rnd(),2.2)*100000); if(rnd()<0.3)for(let i=0;i<keys.length;i++) if(rnd()<0.6) vals[i]=rnd()*1500;
    const tot=vals.reduce((a,b)=>a+b,0); if(tot<=0) continue;
    const bd={canais:keys.map((k,i)=>({key:k,label:labels[k],color:'#000',tx:'#000',sub:'',valor:vals[i],cont:Math.round(vals[i]/3000),wins:[]})),totalValor:tot,totalCont:1};
    const svg=String(donut(bd,'v',null,false));
    const L=[...svg.matchAll(/class="orig-lb" data-k="(\w+)"[^>]*><polyline[^>]*points="([^"]+)"[^>]*><\/polyline><text x="([-\d.]+)" y="([-\d.]+)" text-anchor="(\w+)"/g)].map(m=>({k:m[1],x:+m[3],y:+m[4],a:m[5]}));
    for(const l of L){const wd=labels[l.k].length*5.8,x0=l.a==='end'?l.x-wd:l.x,x1=x0+wd; if(x0<-74||x1>274){const t='vb'; seen[t]=(seen[t]||0)+1; if(seen[t]<=3)console.log('VB',l.k,Math.round(x0),Math.round(x1),'y',Math.round(l.y),'pct',vals.map(v=>Math.round(v/tot*100)).join('/'));}}
  }
}
{ ctx.innerWidth=1200; ctx.innerHeight=900;
  for (const vals of [[0,0,8,5,78,9],[2,12,1,2,2,81],[9,3,39,16,1,30]]) {
    const tot=vals.reduce((a,b)=>a+b,0);
    const bd={canais:keys.map((k,i)=>({key:k,label:labels[k],color:'#000',tx:'#000',sub:'',valor:vals[i],cont:1,wins:[]})),totalValor:tot,totalCont:6};
    const svg=String(donut(bd,'v',null,false));
    console.log('CASO',vals.join('/'));
    [...svg.matchAll(/class="orig-lb" data-k="(\w+)"[^>]*><polyline[^>]*points="([^"]+)"[^>]*><\/polyline><text x="([-\d.]+)" y="([-\d.]+)" text-anchor="(\w+)"/g)].forEach(m=>console.log('  ',m[1],'x',m[3],'y',m[4],m[5],'pts',m[2]));
  }
}
