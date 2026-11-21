// Central: TESTE DE MUTAÇÃO das guardas novas (17/11). Estraga de propósito UMA guarda por vez numa cópia da página e confirma que o teste correspondente FALHA. Se algum teste continuar verde, a guarda não está protegida.
// Rodar: node central/tests/mutacao.cjs <playwright-core> <chromium> [filtro]     (servidor próprio em memória; nada é gravado no repositório)
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
  ["acoes_manuais.cjs", "clique duplo manda 2 pedidos (sem trava de ação em voo)", "if(ACAO_VOO[chave])return {ok:false,ocupado:true,status:0,j:{}};ACAO_VOO[chave]=1;", "ACAO_VOO[chave]=1;"],
  ["acoes_manuais.cjs", "leitura velha em voo sobrescreve o novo estado", "if(!fresco&&AT.vooC&&AT.vooC.fone===fone", "if(AT.vooC&&AT.vooC.fone===fone"],
  ["acoes_manuais.cjs", "leitura de volta não confirma (repete mesmo já feito)", "if(cf===true){conferido=true;", "if(false){conferido=true;"],
  ["acoes_manuais.cjs", "api sem tempo limite (servidor lento trava o botão)", "tm=setTimeout(function(){estourou=true;ac.abort();},lim);", ""],
  ["acoes_manuais.cjs", "rede caída lança exceção (botão fica desligado)", "catch(e){if(tm)clearTimeout(tm);return {status:0,tempo:estourou,", "catch(e){if(tm)clearTimeout(tm);throw e;return {status:0,tempo:estourou,"],
  ["acoes_manuais.cjs", "botão não volta depois da falha", "if(b){b.disabled=false;b.removeAttribute('aria-busy');if(alvo)alvo.textContent=rotOrig;}}", "if(b){b.removeAttribute('aria-busy');}}"],
  ["acoes_manuais.cjs", "409 é repetido sem necessidade", "var incerto=q.status===0||q.status>=500;", "var incerto=true;"],
  ["nomes_curtos.cjs", "empresa corta em conector", "while(c.length>1&&NOME_CONECT[c[c.length-1].toLowerCase()])c.pop();", ""],
  // 20/11 (lista sem corte + 'Sem próximo toque'): rodar com LP_RAPIDO=1 (só 2 larguras) para ser rápido
  ["lista_paradas_20nov.cjs", "lista: o corte volta a ser silencioso", "ag.conversasTruncado===true&&(tot===null||n<tot||!!cur)", "false"],
  ["lista_paradas_20nov.cjs", "lista: Carregar mais não envia o cursor", "'/agentes?leve=1&limite=200&cursor='+encodeURIComponent(cur)", "'/agentes?leve=1&limite=200'"],
  ["lista_paradas_20nov.cjs", "lista: a atualização de 4 s apaga as páginas extras", "S.agCache=false;agGuardaCache(S.ag);atMaisMesclar();atRefrescaLista();}}", "S.agCache=false;agGuardaCache(S.ag);atRefrescaLista();}}"],
  ["lista_paradas_20nov.cjs", "lista: falha ao carregar o resto fica muda", "m.erro='falha';if(S.aba==='atend')atDesenharLista();return;", "return;"],
  ["lista_paradas_20nov.cjs", "lista: erro da Ana (conversasErro) fica mudo", "else if(ag.conversasErro&&!(ag.conversas||[]).length)", "else if(false)"],
  ["lista_paradas_20nov.cjs", "lista: Bia antiga perde o aviso das 200", "else if(ag.conversasTruncado===undefined&&n>=200)", "else if(false)"],
  ["lista_paradas_20nov.cjs", "paradas: #atendimento-paradas não é reconhecido", "if(t==='atendimento-paradas')return", "if(false)return"],
  ["lista_paradas_20nov.cjs", "paradas: o endereço não vira #atendimento-paradas", "if(aba==='atend'&&!fone&&AT.filtro==='paradas')return '#atendimento-paradas';", ""],
  ["lista_paradas_20nov.cjs", "paradas: o filtro não filtra", "if(AT.filtro==='paradas'&&!AT.par.map[x.fone])return false;", ""],
  ["lista_paradas_20nov.cjs", "paradas: o chip não existe", "AT_FILTROS.concat([AT_PARADAS])", "AT_FILTROS"],
  ["lista_paradas_20nov.cjs", "paradas: erro vira lista vazia 'ok'", "P.est=P.itens.length?'ok':'erro';", "P.est='ok';"],
  ["lista_paradas_20nov.cjs", "paradas: não pede o cursor ao conferir mais", "(mais?'&cursor='+encodeURIComponent(P.cursor):'')", "''"],
  ["lista_paradas_20nov.cjs", "paradas: mostra só as já carregadas (sem as mais antigas)", "var ext=P.itens.filter(function(x){return !vis[x.fone];})", "var ext=[].filter(function(x){return !vis[x.fone];})"],
];
const filtro = process.argv[4]; let vivos = [];
// 20/11: o html mutado NUNCA é gravado no repositório (já subiu 2 vezes por engano: 1e2616f6 e 97a9db79). Um servidor local em memória entrega a página mutada em /central/_mut.html e o resto de central/ vem do repositório, só leitura.
const http = require("http"); let SRC = ORIG;
const srv = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split("?")[0]); if (u === "/central/_mut.html") { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(SRC); }
  const f = path.join(RAIZ, u.replace(/^\/central\//, "")); if (!f.startsWith(RAIZ) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end(); } const ext = path.extname(f); res.writeHead(200, { "content-type": ext === ".json" ? "application/json" : ext === ".png" ? "image/png" : "text/plain" }); res.end(fs.readFileSync(f)); });
const rodar = (teste, url) => new Promise((ok) => { const c = require("child_process").spawn("node", [path.join(__dirname, teste), process.argv[2], process.argv[3]], { env: { ...process.env, CENTRAL_URL: url }, stdio: "ignore" }); const tm = setTimeout(() => c.kill(), 420000); c.on("close", (code) => { clearTimeout(tm); ok(code); }); });
(async () => {
  await new Promise((r) => srv.listen(0, "127.0.0.1", r)); const url = "http://127.0.0.1:" + srv.address().port + "/central/_mut.html";
  for (const [teste, nome, de, para, extra] of M) {
    if (filtro && !(teste + nome).includes(filtro)) continue;
    if (!ORIG.includes(de)) { console.log(`?? trecho não encontrado: ${nome}`); vivos.push(`${nome} (trecho não achado)`); continue; }
    SRC = ORIG.replace(de, para); if (extra) SRC = SRC.replace(extra[0], extra[1]);
    const falhou = (await rodar(teste, url)) !== 0; console.log(`${falhou ? "MORTA " : "VIVA  "} [${teste}] ${nome}`); if (!falhou) vivos.push(`${teste}: ${nome}`);
  }
  srv.close(); console.log(`mutações: ${M.length}; sobreviventes: ${vivos.length}`); vivos.forEach((v) => console.log(" - " + v)); process.exit(vivos.length ? 1 : 0);
})();
