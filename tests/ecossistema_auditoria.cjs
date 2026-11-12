const { chromium } = require(process.argv[2]);
const VPS=[[320,640],[360,740],[390,844],[430,932],[768,1024],[1024,768],[1366,768],[1920,1080]];
(async()=>{const b=await chromium.launch({executablePath:process.argv[3]});let total=0;
for(const [w,h] of VPS){const p=await b.newPage({viewport:{width:w,height:h}});
await p.goto('http://localhost:8803/ecossistema/');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(2500);console.log(await p.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').length+' fontes carregadas'));
// abre todos os details para medir o conteúdo escondido
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));await p.waitForTimeout(300);
const r=await p.evaluate(()=>{
 const out=[];const vw=document.documentElement.clientWidth;
 if(document.documentElement.scrollWidth>vw+1) out.push(['PAGINA rola de lado',document.documentElement.scrollWidth,vw]);
 const id=(e)=>{let s=e.tagName.toLowerCase();if(e.id)s+='#'+e.id;if(e.className&&typeof e.className==='string')s+='.'+e.className.trim().split(/\s+/).join('.');const sec=e.closest('section');return s+(sec?' @'+sec.id:'')+' "'+(e.textContent||'').trim().slice(0,40)+'"'};
 // 1) elemento de texto cujo conteúdo estoura a própria caixa
 document.querySelectorAll('section *').forEach(e=>{ if(e.closest('svg')||e.closest('.tw')||e.closest('pre')||e.closest('.svgw')) return; const cs=getComputedStyle(e); if(cs.display==='inline'||cs.display==='none') return; if(e.scrollWidth>e.clientWidth+2 && !/auto|scroll/.test(cs.overflowX)) out.push(['ESTOURA largura',id(e),e.scrollWidth,e.clientWidth]); });
 // 2) filho que passa da borda do card/pai
 document.querySelectorAll('.card, .note, .flow .b, .step, details, .grid > *').forEach(c=>{const cr=c.getBoundingClientRect(); if(cr.width===0) return; c.querySelectorAll('*').forEach(e=>{ if(e.closest('svg')||e.closest('.tw')||e.closest('pre')) return; const r=e.getBoundingClientRect(); if(r.width===0||r.height===0) return; if(r.right>cr.right+2||r.left<cr.left-2) out.push(['FORA do card',id(c),id(e),Math.round(r.right-cr.right)]);});});
 // 3) cards vizinhos que se sobrepõem
 document.querySelectorAll('.grid, .flow').forEach(g=>{const k=[...g.children].map(x=>x.getBoundingClientRect());for(let i=0;i<k.length;i++)for(let j=i+1;j<k.length;j++){const a=k[i],c=k[j];if(a.width&&c.width&&a.left<c.right-2&&c.left<a.right-2&&a.top<c.bottom-2&&c.top<a.bottom-2)out.push(['SOBREPOE irmãos',id(g.children[i]),id(g.children[j])]);}});
 // 4) SVG: texto fora do retângulo do nó e texto sobrepondo texto
 document.querySelectorAll('.svgw svg').forEach((svg,si)=>{const gs=[...svg.querySelectorAll(':scope > g')].filter(g=>g.querySelector('rect')&&g.querySelector('rect').getBBox().height>30&&!g.querySelector(':scope > text[transform]'));   // caixas de verdade (os rótulos com fundo, de 20-22 px, não são caixas)gs.forEach(g=>{const rc=g.querySelector('rect').getBBox();g.querySelectorAll('text').forEach(t=>{const bb=t.getBBox();if(bb.x<rc.x+2||bb.x+bb.width>rc.x+rc.width-2||bb.y<rc.y||bb.y+bb.height>rc.y+rc.height)out.push(['SVG texto fora do nó','svg'+si,t.textContent.slice(0,40),Math.round(bb.x+bb.width-(rc.x+rc.width))]);});});
   const ts=[...svg.querySelectorAll('text')].map(t=>({t,b:t.getBBox()}));for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){const a=ts[i].b,c=ts[j].b;if(a.x<c.x+c.width-1&&c.x<a.x+a.width-1&&a.y<c.y+c.height-3&&c.y<a.y+a.height-3)out.push(['SVG texto sobrepõe texto','svg'+si,ts[i].t.textContent.slice(0,25),ts[j].t.textContent.slice(0,25)]);}
   const vb=svg.viewBox.baseVal;ts.forEach(o=>{if(o.t.hasAttribute('transform'))return;if(o.b.x<0||o.b.x+o.b.width>vb.width||o.b.y+o.b.height>vb.height)out.push(['SVG texto fora da tela do desenho','svg'+si,o.t.textContent.slice(0,40)]);});});
 // 5) tabelas/overflow-x devem estar contidas
 document.querySelectorAll('.tw').forEach(t=>{const r=t.getBoundingClientRect();if(r.right>vw+1)out.push(['TABELA passa da tela',id(t),Math.round(r.right-vw)]);});
 // 6) fonte pequena demais
 let menor=99;document.querySelectorAll('section p,section li,section td,section h3,section h4,.card *').forEach(e=>{if(e.children.length||!e.textContent.trim()||e.closest('svg'))return;const f=parseFloat(getComputedStyle(e).fontSize);if(f<menor)menor=f;});out.push(['INFO menor fonte html',menor]);
 return out;});
const uniq=[...new Set(r.map(x=>JSON.stringify(x)))].map(x=>JSON.parse(x));const probs=uniq.filter(x=>x[0]!=='INFO menor fonte html');total+=probs.length;
console.log(`${w}x${h}: ${probs.length} problemas`,uniq.filter(x=>x[0]==='INFO menor fonte html').map(x=>'menor fonte '+x[1]).join(''));probs.slice(0,14).forEach(x=>console.log('  ',JSON.stringify(x).slice(0,230)));await p.close();}
await b.close();console.log('TOTAL',total)})();
