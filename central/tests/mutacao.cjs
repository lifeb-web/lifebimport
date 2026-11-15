// Central: TESTE DE MUTAÇÃO das guardas novas (17/11). Estraga de propósito UMA guarda por vez numa cópia da página e confirma que o teste correspondente FALHA. Se algum teste continuar verde, a guarda não está protegida.
// Rodar: node central/tests/mutacao.cjs <playwright-core> <chromium> [filtro]     (precisa do servidor local na porta 8802)
const fs = require("fs"); const path = require("path"); const { spawnSync } = require("child_process");
const RAIZ = path.join(__dirname, ".."); const ORIG = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
// Fora da lista de propósito (camadas REDUNDANTES, provado em 15/11): tirar só a trava de altura, ou só as restaurações finais de rolagem, não muda nada porque cada camada sozinha basta (o DOM é refeito sem layout intermediário). A proteção que importa (uiRepor: foco/campos/caixas internas) e a largura fixa do topo estão cobertas abaixo.
const M = [
  ["scroll_redesenho.cjs", "não devolve rolagem/foco/campos (uiRepor vira nada)", "if(snap)uiRepor(c,snap,auto);", ""],
  ["scroll_redesenho.cjs", "não devolve texto digitado em atualização automática", "if(auto)s.campos.forEach(", "if(false)s.campos.forEach("],
  ["scroll_redesenho.cjs", "ação do usuário passa a restaurar campo antigo", "if(auto)s.campos.forEach(", "if(true)s.campos.forEach("],
  ["scroll_redesenho.cjs", "barra do topo muda de altura (largura do 'agora')", "min-width:104px;white-space:nowrap}", "}"],
  ["link_aba.cjs", "ir() não grava hash", "if(!op.deHash)hashGravar(aba,aba==='atend'?AT.fone:null,false);", ""],
  ["link_aba.cjs", "hashchange/popstate ignorados", "window.addEventListener('hashchange',aplicarHash);window.addEventListener('popstate',aplicarHash);", ""],
  ["link_aba.cjs", "SDR pode abrir Usuários", "if(aba==='usuarios'&&!(S.eu&&S.eu.papel==='robert'))return false;", ""],
  ["link_aba.cjs", "senha provisória deixa sair de Minha conta", "if(S.eu&&S.eu.trocarSenha&&aba!=='conta')return false;", ""],
  ["link_aba.cjs", "hash desconhecido muda a tela", "if(h.aba==='?'){hashGravar(S.aba,S.aba==='atend'?AT.fone:null,true);return;}", "if(h.aba==='?'){ir('visao',{deHash:true});return;}"],
  ["login_persistente.cjs", "'manter' não grava em localStorage", "if(manter){try{localStorage.setItem(SESS_P,", "if(false){try{localStorage.setItem(SESS_P,"],
  ["login_persistente.cjs", "falha temporária (5xx/rede) desconecta", "else{   // rede caída, servidor fora ou limite", "else if(false){"],
  ["login_persistente.cjs", "401 não limpa o acesso", "if(r.status===401||r.status===403||r.status===404){S.tok=null;", "if(r.status===999){S.tok=null;"],
  ["login_persistente.cjs", "Sair não revoga no servidor", "var rs=await fetch(API+'/acesso/sair'", "var rs=await fetch(API+'/acesso/sair-x'"],
  ["login_persistente.cjs", "vencimento pelo relógio ignorado", "if(S.ate&&agoraSrv()>=S.ate){sessaoVenceu(", "if(false){sessaoVenceu("],
  ["login_persistente.cjs", "Sair não limpa o localStorage", "function limparSessaoGravada(){try{localStorage.removeItem(SESS_P);}catch(e){}", "function limparSessaoGravada(){"],
  ["exportar.cjs", "exportação não busca páginas antigas", "while(temMais&&pag<300){", "while(false){"],
  ["exportar.cjs", "falha no meio finge conversa completa", "incompleto=true;motivo=(r.status===0?", "incompleto=false;motivo=(r.status===0?"],
  ["exportar.cjs", "ordem cronológica quebrada", "sort(function(a,b){return ((a.q.ts||0)-(b.q.ts||0))||(a.i-b.i);})", "sort(function(a,b){return a.i-b.i;})"],
  ["exportar.cjs", "usa UTC em vez de Brasília", "timeZone:TZ_BR});}\nfunction exDiaLongo", "timeZone:'UTC'});}\nfunction exDiaLongo"],
  ["simulador_chat.cjs", "conversa não é contínua (manda só a última mensagem)", "mensagens:msgs}", "mensagens:msgs.slice(-1)}"],
  ["simulador_chat.cjs", "erro some em silêncio", "t.estado='erro';t.msgErro=", "t.estado='ok';t.msgErro="],
  ["simulador_chat.cjs", "limite de 12 não trava o campo", "u.ta.disabled=n>=SIM_MAX&&", "u.ta.disabled=false&&"],
  ["dados_editaveis.cjs", "limpar não vai em limpar[]", "if(lim.length)c.limpar=lim;", ""],
  ["dados_editaveis.cjs", "manda também dado que não mudou (CNPJ)", "if(val.replace(/\\D/g,'')!==String(atual||''))c.cnpj=val;return;", "c.cnpj=val;return;"],
  ["dados_editaveis.cjs", "sem 'editado por' na janela", "ee.appendChild(tx);", ""],
  ["dados_editaveis.cjs", "Sair mantém rascunhos de lead", "/^(ctr_sim_|ctr_ins_|ctr_susp_nao_|ctr_fb_|ctr_fbok_)/).test(k))ks.push(k);}ks.forEach", "/^(ctr_sim_)/).test(k))ks.push(k);}ks.forEach"],
  ["dados_editaveis.cjs", "limpar e valor novo vão juntos", "if(limpar[f.k]){lim.push(f.k);return;}", "if(limpar[f.k]){lim.push(f.k);}"],
  ["dados_editaveis.cjs", "campos voltam a 15px no celular", "select,textarea{font-size:16px!important}}", "select,textarea{font-size:15px!important}}"],
  ["dados_editaveis.cjs", "erro do servidor fica mudo", "else er.textContent=(q.j&&q.j.mensagem)||(q.status===0?'Sem conexão com o servidor. Nada foi salvo.'", "else er.textContent=''||(q.status===0?'Sem conexão com o servidor. Nada foi salvo.'"],
  ["dados_editaveis.cjs", "desfazer pede o campo errado", "campos:{desfazer:k}}", "campos:{desfazer:'x'}}"],
  ["dados_editaveis.cjs", "aviso da fase 2 some", "c7.appendChild(el('h4',null,'Em construção'));", "c7.appendChild(el('h4',null,'Outros'));"],
  ["nomes_curtos.cjs", "nome de pessoa não é encurtado", "return w[0]+' '+w[w.length-1];}", "return w.join(' ');}"],
  ["nomes_curtos.cjs", "empresa corta em conector", "while(c.length>1&&NOME_CONECT[c[c.length-1].toLowerCase()])c.pop();", ""],
];
const filtro = process.argv[4]; let vivos = [];
for (const [teste, nome, de, para, extra] of M) {
  if (filtro && !(teste + nome).includes(filtro)) continue;
  if (!ORIG.includes(de)) { console.log(`?? trecho não encontrado: ${nome}`); vivos.push(`${nome} (trecho não achado)`); continue; }
  const arq = path.join(RAIZ, "_mut.html"); let src = ORIG.replace(de, para); if (extra) src = src.replace(extra[0], extra[1]); fs.writeFileSync(arq, src);
  const r = spawnSync("node", [path.join(__dirname, teste), process.argv[2], process.argv[3]], { env: { ...process.env, CENTRAL_URL: "http://localhost:8802/central/_mut.html" }, encoding: "utf8", timeout: 420000 });
  const falhou = r.status !== 0; console.log(`${falhou ? "MORTA " : "VIVA  "} [${teste}] ${nome}`); if (!falhou) vivos.push(`${teste}: ${nome}`);
}
try { fs.unlinkSync(path.join(RAIZ, "_mut.html")); } catch (e) {}
console.log(`mutações: ${M.length}; sobreviventes: ${vivos.length}`); vivos.forEach((v) => console.log(" - " + v)); process.exit(vivos.length ? 1 : 0);
