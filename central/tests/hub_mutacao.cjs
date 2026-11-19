// Mutação da página Início/Instagram/Papéis (19/11): estraga uma regra por vez numa CÓPIA do index.html e exige que as suítes jsdom FALHEM. node central/tests/hub_mutacao.cjs
const fs = require("fs"), path = require("path"), os = require("os"), { spawnSync } = require("child_process");
const orig = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const M = [
  ["domínio de artefato na lista de permitidos", "var HUB_HOSTS=['projetojlbv.com.br',", "var HUB_HOSTS=['claude.ai','projetojlbv.com.br',"],
  ["guarda de artefato + lista aberta", [["if(/(^|\\.)claude\\.ai$/.test(h))return false;", ""], ["return HUB_HOSTS.indexOf(h)>=0||", "return true||HUB_HOSTS.indexOf(h)>=0||"]], null],
  ["http permitido", "if(x.protocol!=='https:'||x.username||x.password||x.port)return false;", "if(x.username)return false;"],
  ["protocolo relativo permitido", "return u.charAt(1)!=='/'&&u.indexOf('\\\\')<0;", "return true;"],
  ["em publicação com url", "else if((c.status==='em_publicacao'||c.status==='a_confirmar')&&c.url!=null)", "else if(false)"],
  ["no ar sem url", "else if(c.status==='no_ar'&&c.url==null)", "else if(false)"],
  ["id repetido", "else if(vistos[c.id])", "else if(false)"],
  ["aba interna inexistente", "(abasConhecidas&&abasConhecidas.indexOf(c.aba)<0)", "false"],
  ["robert filtrado pela lista", "if(ctx.papel!=='robert'){var p=hubPapeis", "if(true){var p=hubPapeis"],
  ["oculto ignorado", "if(hubOculto(card,ctx.cfg))return false;", ""],
  ["área ignorada", "if(ctx.areas&&ctx.areas.indexOf(card.area)<0)return false;}", "}"],
  ["aba do cartão ignorada", "if(card.aba&&ctx.abas&&ctx.abas.indexOf(card.aba)<0)return false;", ""],
  ["@area vale para embutidos", "var base=papel==='robert'||papel==='admin'||papel==='sdr';", "var base=false;"],
  ["busca sem normalizar acento", "function hubNorm(t){return String(t==null?'':t).toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');}", "function hubNorm(t){return String(t==null?'':t).toLowerCase();}"],
  ["busca com OU em vez de E", "return ts.every(function(t){return h.indexOf(t)>=0;});", "return ts.some(function(t){return h.indexOf(t)>=0;});"],
  ["favorito sem try/catch", "try{var v=JSON.parse(localStorage.getItem(hubChaveFav(usuario))||'[]');return Array.isArray(v)?v.filter(function(x){return typeof x==='string';}).slice(0,60):[];}catch(e){return [];}", "var v=JSON.parse(localStorage.getItem(hubChaveFav(usuario))||'[]');return v;"],
  ["favorito de outra pessoa", "return 'central_hub_fav_'+hubNorm(usuario)", "return 'central_hub_fav_'+hubNorm('x')"],
  ["overrides sempre", "if(difere){var lista=['robert'];", "if(true){var lista=['robert'];"],
  ["semáforo verde por falta de dado", "var n=it[k]&&it[k].nivel;return n==='ok'||n==='atencao'||n==='falha'?n:'desconhecido';", "var n=it[k]&&it[k].nivel;return n||'ok';"],
  ["semáforo ignora dado velho", "var velho=!saude||!saude.ts||agora-Number(saude.ts)>15*60000;", "var velho=false;"],
  ["parada de emergência da Ana", "else if(ana.saude.killSwitch)an='atencao';", ""],
  ["pior = primeiro", "if(o[n]>o[m])m=n;", "if(m==='ok')m=n;"],
  ["link sem noopener", "corpo.target='_blank';corpo.rel='noopener noreferrer';", "corpo.target='_blank';"],
  ["apresentação com URL externa (3 guardas)", [["||c.url.charAt(0)!=='/')return;", ")return;"], ["apresenta:c.apresenta===true&&typeof c.url==='string'&&c.url.charAt(0)==='/'", "apresenta:c.apresenta===true"], ["if(c.url&&c.url.charAt(0)==='/'&&c.apresenta)", "if(c.url&&c.apresenta)"]], null],
  ["gerenciar: sem versão", "var corpo={v:HUB.cfg.v,cards:hubMontarOverrides", "var corpo={cards:hubMontarOverrides"],
  ["erro do cards.json engolido", "if(!j.ok){if(HUB.estado!=='ok'){HUB.estado='erro';HUB.erro=j.erro;}else{toast(j.erro);}}", "if(!j.ok){}"],
  ["Instagram: aprovar sem hash", "if(dec==='aprovar')corpo.hash=p.hash;", ""],
  ["Instagram: ajuste sem comentário", "if(dec==='ajuste'&&com.length<3)", "if(false)"],
  ["Instagram: admin pode aprovar", "ap.disabled=!IG.euPosso;", "ap.disabled=false;"],
  ["Instagram: sem versão na decisão", "var corpo={id:p.id,v:p.v,decisao:dec,comentario:com};", "var corpo={id:p.id,decisao:dec,comentario:com};"],
  ["Instagram: exemplo sem selo", "IG.metricas=s;IG.exemplo=true;", "IG.metricas=s;IG.exemplo=false;"],
  ["Instagram: WhatsApp inventado", "return n==null?'não coletado':", "return n==null?'0':"],
  ["Instagram: falhou ocupa vaga", "p.status!=='rejeitado'&&p.status!=='falhou';}).length;out.push", "true;}).length;out.push"],
  ["Instagram: novo post manda id", "if(p){corpo.id=p.id;corpo.v=p.v;corpo.links=p.links||[];}", "corpo.id='ig_x1';corpo.v=p?p.v:undefined;"],
  ["Instagram: 409 não recarrega", "if(r.status===409){igCarregar();}}};", "}};"],
  ["Instagram: miniatura sem checagem https", "if(p.miniatura&&igUrlHttps(p.miniatura))", "if(p.miniatura)"],
  ["Instagram: permalink sem checagem", "if(p.publicacao.permalink&&igUrlHttps(p.publicacao.permalink))", "if(p.publicacao.permalink)"],
  ["Instagram: publicado editável", "if(p.status!=='publicado'){var ed=el('button','btn ghost sm','Editar');", "if(true){var ed=el('button','btn ghost sm','Editar');"],
  ["atualização automática refaz a tela", "if(auto&&((S.aba==='inicio'&&c.querySelector('.hub'))||(S.aba==='instagram'&&c.querySelector('.ig'))))return;", ""],
  ["modo claro por padrão", "t==='light'||t==='dark'?t:'dark'", "t==='light'||t==='dark'?t:'light'"],
  ["sdr com Instagram na matriz", "sdr:['inicio','visao','estado','leitura','filas','cal','atend','agentes','hist','eco','conta']", "sdr:['inicio','visao','estado','leitura','filas','cal','atend','agentes','hist','instagram','eco','conta']"],
  ["admin com Usuários na matriz", "admin:['inicio','visao','estado','leitura','filas','cal','atend','agentes','hist','instagram','eco','conta']", "admin:['inicio','visao','estado','leitura','filas','cal','atend','agentes','hist','instagram','eco','usuarios','conta']"],
  ["papel novo oferece Instagram", "return l.filter(function(a){return a.id!=='usuarios'&&a.id!=='instagram'&&PAP_ABAS_FIXAS.indexOf(a.id)<0;});", "return l;"],
  ["remover papel sem confirmação", "if(bt.getAttribute('data-confirma')!=='1'){", "if(false){"],
  ["criar papel sem validar código", "if(!ed&&!/^[a-z][a-z0-9_]{2,19}$/.test(id)){", "if(false){"],
  ["papel novo some do select", "if(!p.embutido&&base.every(function(b){return b[0]!==p.id;}))base.push([p.id,p.nome]);", ""],
  ["papel removido some do select", "if(!l.some(function(x){return x[0]===atual;}))l.push([atual,usuPapelNome(atual)]);", ""],
  ["bloco de papéis para não-robert", "if(!S.eu||S.eu.papel!=='robert')return;\n  var sec=el('div','sec');sec.appendChild(el('h3',null,'Papéis e áreas'));", "var sec=el('div','sec');sec.appendChild(el('h3',null,'Papéis e áreas'));"],
];
let vivos = 0; const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hubmut-")); const alvo = path.join(dir, "index.html");
for (const [nome, de, para] of M) {
  const pares = Array.isArray(de) ? de : [[de, para]]; let src = orig; let semAlvo = false;
  for (const [a, b] of pares) { if (!src.includes(a)) { semAlvo = true; break; } src = src.replace(a, b); }
  if (semAlvo) { console.log("MUTAÇÃO SEM ALVO:", nome); vivos++; continue; }
  fs.writeFileSync(alvo, src); let morreu = false;
  for (const s of ["hub_jsdom.cjs", "papeis_jsdom.cjs"]) { const r = spawnSync("node", [path.join(__dirname, s)], { env: { ...process.env, CENTRAL_HTML: alvo }, encoding: "utf8", timeout: 120000 }); if (r.status !== 0) { morreu = true; break; } }
  if (!morreu) { vivos++; console.log("SOBREVIVEU:", nome); }
}
console.log(`mutações: ${M.length}; sobreviventes: ${vivos}`); process.exit(vivos ? 1 : 0);
