// Central 18/11: mutação da tela Usuários (jsdom). Estraga UMA guarda por vez numa cópia e confirma que usuarios_jsdom.cjs FALHA.
// Fora da lista de propósito: 'a senha fica no campo depois de salvar' é mutante equivalente (a tela se refaz inteira e o campo deixa de existir; o teste confere o DOM).
// Rodar: node central/tests/usuarios_mutacao.cjs [caminho-do-jsdom]
const fs = require("fs"), path = require("path"), os = require("os"), { spawnSync } = require("child_process");
const ORIG = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const M = [
  ["tela não confere o papel robert", "if(!S.eu||S.eu.papel!=='robert')return;\n  var lista", "var lista"],
  ["hash #usuarios liberado a todos", "if(aba==='usuarios'&&!(S.eu&&S.eu.papel==='robert'))return false;", ""],
  ["menu mostra Usuários a todos", "if(a[0]==='usuarios'&&S.eu.papel!=='robert')return;\n    ", ""],
  ["redefinir não valida senha fraca", "var e=usuRegraSenha(campoSenha.value);if(e){er.textContent=e;return;}", "var e=null;"],
  ["criar não valida senha fraca", "else e=usuRegraSenha(cs.value);", "else e=null;"],
  ["criar sobrescreve usuário existente", "else if(lista.some(function(x){return usuNorm(x.usuario)===un;}))e='Esse usuário já existe.", "else if(false)e='Esse usuário já existe."],
  ["papel padrão deixa de ser SDR", "papeis(cp,'sdr');", "papeis(cp,'admin');"],
  ["mudar papel sem confirmação", "USU.acao={tipo:'papel',usuario:u.usuario,nome:u.nome,de:u.papel,papel:sp.value};render();", "api('POST','/usuarios',{usuario:u.usuario,nome:u.nome,papel:sp.value});"],
  ["desativar sem confirmação", "USU.acao={tipo:'ativo',usuario:u.usuario,nome:u.nome,ativo:!u.ativo};render();", "api('POST','/usuarios/ativo',{usuario:u.usuario,ativo:!u.ativo});"],
  ["nome entra como HTML", "r.appendChild(el('td',null,u.nome||''));", "var tdn=el('td');tdn.innerHTML=u.nome||'';r.appendChild(tdn);"],
  ["redefinir manda papel/nome (reverte outra aba)", "enviar({usuario:A.usuario,senha:s},'/usuarios'", "enviar({usuario:A.usuario,nome:A.nome,papel:A.papelAtual,senha:s},'/usuarios'"],
  ["criar sem criar:true", "senha:s,criar:true}", "senha:s}"],
  ["duplicata não normaliza (só minúsculas)", "return usuNorm(x.usuario)===un;", "return String(x.usuario).toLowerCase()===u.toLowerCase();"],
  ["normalização não tira acento", "function usuNorm(u){return String(u||'').trim().toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')", "function usuNorm(u){return String(u||'').trim().toLowerCase()"],
  ["403 trocar_senha ignorado na tela", "r.status===403&&j&&j.erro==='trocar_senha'&&S.eu&&!S.eu.trocarSenha", "false"],
  ["depois da troca não recarrega", "S.eu.trocarSenha=false;render();carregar(false);", "S.eu.trocarSenha=false;render();"],
  ["mudar papel manda senha", "enviar({usuario:A.usuario,nome:A.nome,papel:A.papel},'/usuarios'", "enviar({usuario:A.usuario,nome:A.nome,papel:A.papel,senha:'Senha2026forte'},'/usuarios'"],
  ["próprio usuário pode se desativar", "if(eu){b2.disabled=true;", "if(false){b2.disabled=true;"],
  ["gerador fraco (só 6 caracteres)", "while(a.length<16)", "while(a.length<6)"],
  ["gerar não copia", "var ok=await usuCopiar(s);av.textContent=ok?", "var ok=false;av.textContent=ok?"],
  ["botão não desliga durante o envio", "async function enviar(corpo,caminho,er,bt,ok){er.textContent='';bt.disabled=true;", "async function enviar(corpo,caminho,er,bt,ok){er.textContent='';"],
  ["erro do servidor engolido", "er.textContent=(r.j&&r.j.mensagem)||(r.status===403", "er.textContent=(r.status===403"],
  ["ativar chama rota errada", "'/usuarios/ativo',er,bt", "'/usuarios',er,bt"],
];
let vivos = 0;
M.forEach(([nome, de, para]) => { if (!ORIG.includes(de)) { console.log("MUTAÇÃO NÃO ENCONTRADA:", nome); vivos++; return; } const f = path.join(os.tmpdir(), "usu_mut_" + process.pid + ".html"); fs.writeFileSync(f, ORIG.replace(de, para));
  const r = spawnSync("nice", ["-n", "19", "node", path.join(__dirname, "usuarios_jsdom.cjs"), ...(process.argv[2] ? [process.argv[2]] : [])], { env: { ...process.env, CENTRAL_HTML: f }, encoding: "utf8" }); fs.unlinkSync(f);
  const pegou = r.status !== 0; if (!pegou) vivos++; console.log((pegou ? "pegou   " : "VIVA!   ") + nome); });
console.log(`usuarios_mutacao: ${M.length} mutações; vivas: ${vivos}`); process.exit(vivos ? 1 : 0);
