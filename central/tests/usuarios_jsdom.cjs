// Central 18/11: tela USUÁRIOS (pedido #3407). jsdom + o bloco real extraído de central/index.html (/*USUARIOS-INI*/../*USUARIOS-FIM*/); API simulada. Sem Chromium.
// Rodar: node central/tests/usuarios_jsdom.cjs [caminho-do-jsdom]   (padrão: /tmp/jsd/node_modules/jsdom)
const fs = require("fs"), path = require("path"), vm = require("vm");
const { JSDOM } = require(process.argv[2] || "/tmp/jsd/node_modules/jsdom");
const html = fs.readFileSync(process.env.CENTRAL_HTML || path.join(__dirname, "..", "index.html"), "utf8");
let n = 0; const falhas = [];
const ok = (c, m) => { n++; if (!c) falhas.push(m); };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), m + " | esperado " + JSON.stringify(b) + " veio " + JSON.stringify(a));
const ini = html.indexOf("/*USUARIOS-INI*/"), fim = html.indexOf("/*USUARIOS-FIM*/");
ok(ini > 0 && fim > ini, "bloco delimitado");
const fn = (nome) => { const m = html.match(new RegExp("^function " + nome + "\\(.*$", "m")); if (!m) throw new Error("função não achada: " + nome); return m[0]; };
const bloco = html.slice(ini, fim);
const tick = (ms = 5) => new Promise((r) => setTimeout(r, ms));
async function mundo(opts = {}) {
  const dom = new JSDOM("<!doctype html><body><div id='c'></div><div id='toast'></div></body>", { url: "https://projetojlbv.com.br/central/" });
  const win = dom.window, document = win.document; const copias = [];
  const m = { usuarios: opts.usuarios || [{ usuario: "robert@x.com", nome: "Robert", papel: "robert", ativo: true, ultimoAcesso: Date.UTC(2026, 10, 18, 12, 0) }, { usuario: "felipe", nome: "Felipe", papel: "sdr", ativo: true, ultimoAcesso: null }], chamadas: [], toasts: [], resp: opts.resp || (() => null), rede: opts.rede };
  const sb = { document, window: win, navigator: { clipboard: opts.semClip ? undefined : { writeText: async (t) => { if (opts.clipFalha) throw new Error("negado"); copias.push(t); } } }, console, Date, Math, JSON, Object, Array, String, Number, Uint32Array, setTimeout, TZ_BR: "America/Sao_Paulo",
    S: { eu: opts.eu || { usuario: "robert@x.com", nome: "Robert", papel: "robert" }, usuarios: null }, PAPEL: { robert: "Robert", admin: "Administrador", sdr: "SDR" } };
  sb.toast = (t) => m.toasts.push(t);
  sb.api = async (metodo, caminho, corpo) => { m.chamadas.push({ metodo, caminho, corpo: corpo ? JSON.parse(JSON.stringify(corpo)) : null }); const o = m.resp(metodo, caminho, corpo, m); if (o) return o;
    if (metodo === "POST" && caminho === "/usuarios") { const u = String(corpo.usuario).toLowerCase(); const ex = m.usuarios.find((x) => x.usuario === u); if (ex) { ex.papel = corpo.papel; if (corpo.nome) ex.nome = corpo.nome; } else m.usuarios.push({ usuario: u, nome: corpo.nome || u, papel: corpo.papel, ativo: true, ultimoAcesso: null }); return { status: 200, j: { ok: true, criado: !ex } }; }
    if (metodo === "POST" && caminho === "/usuarios/ativo") { m.usuarios.find((x) => x.usuario === corpo.usuario).ativo = !!corpo.ativo; return { status: 200, j: { ok: true } }; }
    return { status: 404, j: {} }; };
  sb.carregarUsuarios = async () => { sb.S.usuarios = JSON.parse(JSON.stringify(m.usuarios)); };
  sb.render = () => { const c = document.getElementById("c"); c.textContent = ""; sb.telaUsuarios(c); };
  vm.createContext(sb);
  vm.runInContext(["el", "fmtData", "erroTxt", "cartoesMovel", "vazioErro"].map(fn).join("\n") + "\n" + bloco, sb);
  await sb.carregarUsuarios(); sb.render();
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const set = (s, v) => { const e = $(s); e.value = v; };
  const clica = async (s) => { const e = typeof s === "string" ? $(s) : s; e.click(); await tick(); };
  return { sb, m, document, $, $$, set, clica, copias, win };
}
const linha = (W, u) => W.$(`tr[data-usuario="${u}"]`);

(async () => {
  // ---- 1. quem vê ----
  for (const papel of ["admin", "sdr", undefined]) { const W = await mundo({ eu: { usuario: "x", papel } }); ok(W.$("#c").children.length === 0, `papel ${papel}: tela não desenha nada`); ok(!W.document.body.textContent.includes("Novo usuário"), `papel ${papel}: sem 'Novo usuário'`); ok(!W.$("#usuLista"), `papel ${papel}: sem lista`); }
  { const W = await mundo(); ok(!!W.$("#usuNovo") && !!W.$("#usuLista"), "robert vê formulário e lista"); ok(W.$("h4").textContent === "Novo usuário", "título do formulário"); }
  // a aba só aparece para robert (menu) e o hash é barrado: guardas reais no arquivo
  ok((html.match(/if\((a\[0\]|id)==='usuarios'&&S\.eu\.papel!=='robert'\)return( false)?;/g) || []).length === 2, "menu e busca global escondem Usuários para quem não é robert (2 guardas)");
  ok(html.includes("if(aba==='usuarios'&&!(S.eu&&S.eu.papel==='robert'))return false;"), "hash #usuarios barrado para quem não é robert");
  ok(html.includes("if(a[0]==='usuarios'&&S.eu.papel!=='robert')return;if(!abaPermitida(a[0],true))return;itens.push"), "busca global também esconde Usuários (e o que a matriz do papel não libera)");
  // ---- 2. lista ----
  { const W = await mundo();
    eq(W.$$("#usuLista tr").length, 3, "cabeçalho + 2 linhas");
    eq([...W.$$("#usuLista th")].map((x) => x.textContent), ["Usuário", "Nome", "Papel", "Último acesso", "Situação", "Ações"], "colunas");
    ok(/robert@x\.com \(você\)/.test(linha(W, "robert@x.com").textContent), "marca '(você)'");
    ok(linha(W, "felipe").textContent.includes("nunca"), "último acesso 'nunca' quando não há");
    ok(/18\/11/.test(linha(W, "robert@x.com").textContent), "último acesso em dd/mm");
    ok(linha(W, "felipe").querySelector(".pill").textContent === "Ativo", "situação Ativo");
    ok(linha(W, "felipe").querySelector(".usuPapelSel").value === "sdr", "select reflete o papel");
    ok(linha(W, "robert@x.com").querySelector(".usuPapelSel").disabled && linha(W, "robert@x.com").querySelector(".usuRed").disabled && linha(W, "robert@x.com").querySelector(".usuAtivo").disabled, "o próprio usuário não muda papel, nem se desativa, nem redefine aqui");
    ok(!/\b(hash|salt|sal)\b/i.test(W.$("#usuLista").textContent), "lista sem hash/sal"); }
  { const W = await mundo({ usuarios: [] }); ok(/Nenhum usuário carregado/.test(W.$("#usuLista").textContent), "lista vazia tem aviso"); }
  // ---- 3. novo usuário: padrão SDR, regras, geração ----
  { const W = await mundo();
    ok(W.$("#uPapel").value === "sdr", "papel padrão SDR"); eq([...W.$$("#uPapel option")].map((o) => o.value), ["sdr", "admin", "robert"], "opções de papel");
    ok(/mínimo 10/.test(W.$("#usuNovo").textContent) && /letras e números/.test(W.$("#usuNovo").textContent), "indicação das regras de senha");
    ok(W.$("#uSenha").type === "password", "senha começa escondida"); ok(W.$("#uSenhaCopiar").style.display === "none", "Copiar escondido antes de gerar");
    await W.clica("#uSenhaGerar"); const s = W.$("#uSenha").value;
    ok(s.length === 16 && /[A-Za-z]/.test(s) && /[0-9]/.test(s) && !/[0OIl1]/.test(s.replace(/1/g, "")) , "senha gerada: 16, letras e números, sem caracteres ambíguos: " + s);
    ok(W.$("#uSenha").type === "text", "senha gerada fica visível"); eq(W.copias, [s], "copiou a senha gerada"); ok(/aparece só agora/.test(W.$("#uSenhaAviso").textContent), "aviso 'uma vez'"); ok(W.$("#uSenhaCopiar").style.display === "", "botão Copiar aparece");
    await W.clica("#uSenhaCopiar"); eq(W.copias.length, 2, "botão Copiar copia de novo");
    const set1 = new Set(); for (let i = 0; i < 200; i++) { await W.clica("#uSenhaGerar"); set1.add(W.$("#uSenha").value); } ok(set1.size === 200, "200 senhas geradas, todas diferentes");
    let fracas = 0; for (const x of set1) { if (x.length !== 16 || !/[A-Za-z]/.test(x) || !/[0-9]/.test(x)) fracas++; } eq(fracas, 0, "todas as geradas passam nas regras do servidor");
    // sem área de transferência
    const W2 = await mundo({ clipFalha: true }); await W2.clica("#uSenhaGerar"); ok(/Não consegui copiar/.test(W2.$("#uSenhaAviso").textContent), "falha ao copiar: avisa e mantém a senha visível"); ok(W2.$("#uSenha").value.length === 16, "senha segue no campo");
    const W3 = await mundo({ semClip: true }); await W3.clica("#uSenhaGerar"); ok(/Não consegui copiar/.test(W3.$("#uSenhaAviso").textContent), "sem clipboard: avisa");
    // sem crypto
    const W4 = await mundo(); Object.defineProperty(W4.win, "crypto", { value: undefined, configurable: true }); await W4.clica("#uSenhaGerar"); ok(/não gera senha aleatória/.test(W4.$("#uSenhaAviso").textContent) && W4.$("#uSenha").value === "", "sem crypto: mensagem, campo vazio"); }
  // ---- 4. criar: validações no cliente (nada vai ao servidor) ----
  { const W = await mundo();
    const tenta = async (u, s) => { W.set("#uUsuario", u); W.set("#uNome", "N"); W.set("#uSenha", s); await W.clica("#uCriar"); return W.$("#uErro").textContent; };
    ok(/pelo menos 3/.test(await tenta("ab", "Senha2026forte")), "usuário curto"); ok(/pelo menos 3/.test(await tenta("  ", "Senha2026forte")), "usuário vazio");
    ok(/pelo menos 10/.test(await tenta("maria", "curta1")), "senha curta"); ok(/letras e números/.test(await tenta("maria", "somenteletrasaqui")), "só letras"); ok(/letras e números/.test(await tenta("maria", "1234567890123")), "só números");
    ok(/letras e números/.test(await tenta("maria", "aaaaaaaaaaaa")), "repetida (sem número): mesma mensagem do servidor"); ok(/longa demais/.test(await tenta("maria", "a1" + "x".repeat(130))), "longa demais");
    ok(/já existe/.test(await tenta("FELIPE", "Senha2026forte")), "usuário que já existe (sem diferença de maiúscula) é barrado: não sobrescreve por engano");
    ok(/já existe/.test(await tenta("  Félipe ", "Senha2026forte")), "com acento e espaços também é o mesmo usuário (normaliza como o servidor)"); ok(/já existe/.test(await tenta("fe lipe", "Senha2026forte")), "caracteres que o servidor descarta também normalizam");
    ok(/pelo menos 3/.test(await tenta("é!", "Senha2026forte")), "usuário que vira vazio na normalização é barrado");
    eq(W.m.chamadas.length, 0, "nenhuma chamada ao servidor com dado inválido"); }
  // ---- 5. criar SDR (fluxo feliz) ----
  { const W = await mundo(); W.set("#uUsuario", " Maria.Souza@x.com "); W.set("#uNome", "Maria Souza"); await W.clica("#uSenhaGerar"); const s = W.$("#uSenha").value; await W.clica("#uCriar");
    eq(W.m.chamadas.length, 1, "uma chamada"); const c = W.m.chamadas[0]; ok(c.metodo === "POST" && c.caminho === "/usuarios", "POST /usuarios"); eq([c.corpo.usuario, c.corpo.nome, c.corpo.papel, c.corpo.senha, c.corpo.criar], ["Maria.Souza@x.com", "Maria Souza", "sdr", s, true], "corpo com papel SDR padrão e criar:true");
    ok(W.m.toasts.some((t) => /Usuário criado/.test(t) && /troca a senha/.test(t)), "mensagem de sucesso em português");
    ok(!!linha(W, "maria.souza@x.com"), "linha nova na lista"); ok(W.$("#uUsuario").value === "" && W.$("#uNome").value === "" && W.$("#uSenha").value === "", "campos limpos");
    ok(W.$("#uSenha").type === "password", "senha volta a ficar escondida"); ok(W.$("#uPapel").value === "sdr", "papel volta ao padrão");
    ok(!W.document.documentElement.outerHTML.includes(s), "a senha não está em lugar nenhum do DOM depois de salvar");
    ok(!W.m.toasts.some((t) => t.includes(s)), "a senha não vai em mensagem"); ok(!/senha=|"senha"/.test(W.m.toasts.join()), "toast sem campo senha"); }
  // criar como admin/robert, escolhendo papel
  for (const p of ["admin", "robert"]) { const W = await mundo(); W.set("#uUsuario", "pessoa"); W.set("#uSenha", "Senha2026forte"); W.set("#uPapel", p); await W.clica("#uCriar"); ok(W.m.chamadas[0] && W.m.chamadas[0].corpo.papel === p, "cria com papel " + p); }
  // ---- 6. erros do servidor ----
  { const W = await mundo({ resp: (m, c) => (c === "/usuarios" ? { status: 422, j: { ok: false, mensagem: "Use letras e números na senha." } } : null) }); W.set("#uUsuario", "pessoa"); W.set("#uSenha", "Senha2026forte"); await W.clica("#uCriar");
    ok(W.$("#uErro").textContent === "Use letras e números na senha.", "mostra a mensagem do servidor"); ok(!W.$("#uCriar").disabled, "botão volta a funcionar"); ok(W.$("#uSenha").value === "Senha2026forte", "em erro, mantém o que foi digitado"); }
  for (const [st, esp] of [[403, /Só o Robert/], [500, /Erro 500/], [0, /Sem conexão/]]) { const W = await mundo({ resp: () => ({ status: st, j: st === 0 ? { rede: "Sem conexão com o servidor. Confira a internet." } : {} }) }); W.set("#uUsuario", "pessoa"); W.set("#uSenha", "Senha2026forte"); await W.clica("#uCriar"); ok(esp.test(W.$("#uErro").textContent), "erro " + st + " -> " + W.$("#uErro").textContent); }
  { const W = await mundo({ resp: (m, c) => (c === "/usuarios" ? { status: 409, j: { ok: false, erro: "usuario_ja_existe", mensagem: "Esse usuário já existe. Para trocar a senha use Redefinir senha na lista." } } : null) }); W.set("#uUsuario", "novinho"); W.set("#uSenha", "Senha2026forte"); await W.clica("#uCriar"); ok(/já existe/.test(W.$("#uErro").textContent), "409 usuario_ja_existe do servidor aparece na tela"); }
  // ---- 7. redefinir senha ----
  { const W = await mundo(); ok(!W.$("#usuConf"), "sem confirmação aberta no início");
    await W.clica(linha(W, "felipe").querySelector(".usuRed")); ok(!!W.$("#usuConf"), "abre o painel de confirmação"); ok(/Redefinir a senha de Felipe/.test(W.$("#usuConf").textContent), "título com o nome"); ok(/trocar/.test(W.$("#usuConf").textContent), "avisa que a pessoa troca no próximo acesso");
    eq(W.m.chamadas.length, 0, "abrir o painel não chama o servidor");
    await W.clica("#usuConfOk"); ok(/pelo menos 10/.test(W.$("#usuConfErro").textContent), "confirmar sem senha: mensagem"); eq(W.m.chamadas.length, 0, "sem senha, nada enviado");
    W.set("#uRedSenha", "fraca1"); await W.clica("#usuConfOk"); ok(/pelo menos 10/.test(W.$("#usuConfErro").textContent), "senha fraca barrada no cliente");
    W.set("#uRedSenha", "somenteletrasaqui"); await W.clica("#usuConfOk"); ok(/letras e números/.test(W.$("#usuConfErro").textContent), "só letras barrada"); eq(W.m.chamadas.length, 0, "nada enviado com senha fraca");
    await W.clica("#uRedSenhaGerar"); const s = W.$("#uRedSenha").value; eq(W.copias, [s], "redefinir: gera e copia"); ok(W.$("#uRedSenha").type === "text", "visível ao gerar");
    await W.clica("#usuConfOk"); eq(W.m.chamadas.length, 1, "uma chamada"); eq(W.m.chamadas[0].corpo, { usuario: "felipe", senha: s }, "corpo: SÓ usuário e senha (não leva papel nem nome, para não reverter mudança de outra aba)");
    ok(!W.$("#usuConf"), "painel fecha"); ok(W.m.toasts.some((t) => /Senha de Felipe redefinida/.test(t) && /troca no próximo acesso/.test(t)), "toast claro"); ok(!W.document.documentElement.outerHTML.includes(s), "senha redefinida some do DOM"); ok(!W.m.toasts.some((t) => t.includes(s)), "e do toast");
    ok(W.$("#uRedSenha") === null, "campo da senha não existe mais"); }
  { const W = await mundo(); await W.clica(linha(W, "felipe").querySelector(".usuRed")); await W.clica("#usuConfCancelar"); ok(!W.$("#usuConf"), "cancelar fecha"); eq(W.m.chamadas.length, 0, "cancelar não chama o servidor"); }
  { const W = await mundo({ resp: (m, c) => (c === "/usuarios" ? { status: 422, j: { ok: false, mensagem: "Senha fraca demais." } } : null) }); await W.clica(linha(W, "felipe").querySelector(".usuRed")); W.set("#uRedSenha", "Senha2026forte"); await W.clica("#usuConfOk"); ok(W.$("#usuConfErro").textContent === "Senha fraca demais.", "erro do servidor aparece no painel"); ok(!!W.$("#usuConf"), "painel segue aberto para tentar de novo"); ok(!W.$("#usuConfOk").disabled, "botão liberado"); }
  { // senha do admin e do robert (outra pessoa) também redefine, mantendo o papel
    const W = await mundo({ usuarios: [{ usuario: "eu", nome: "Eu", papel: "robert", ativo: true }, { usuario: "adm", nome: "Adm", papel: "admin", ativo: true }, { usuario: "socio", nome: "Sócio", papel: "robert", ativo: true }] }); W.sb.S.eu.usuario = "eu";
    await W.sb.carregarUsuarios(); W.sb.render(); for (const u of ["adm", "socio"]) { await W.clica(linha(W, u).querySelector(".usuRed")); W.set("#uRedSenha", "Senha2026forte"); await W.clica("#usuConfOk"); }
    ok(W.m.chamadas.length === 2 && W.m.chamadas.every((c) => !("papel" in c.corpo) && !("nome" in c.corpo) && c.corpo.senha), "redefinir de admin e de robert: sem papel no corpo"); }
  // ---- 8. mudar papel ----
  { const W = await mundo(); const sel = linha(W, "felipe").querySelector(".usuPapelSel"); sel.value = "admin"; sel.dispatchEvent(new W.win.Event("change")); await tick();
    ok(/Mudar o papel de Felipe/.test(W.$("#usuConf").textContent) && /De SDR para Administrador/.test(W.$("#usuConf").textContent), "pede confirmação mostrando de/para"); eq(W.m.chamadas.length, 0, "ainda não chamou");
    ok(linha(W, "felipe").querySelector(".usuPapelSel").value === "sdr", "o select continua no papel atual até confirmar");
    await W.clica("#usuConfOk"); eq(W.m.chamadas[0].corpo, { usuario: "felipe", nome: "Felipe", papel: "admin" }, "corpo SEM senha (não mexe na senha)"); ok(!("senha" in W.m.chamadas[0].corpo), "sem campo senha");
    ok(linha(W, "felipe").querySelector(".usuPapelSel").value === "admin", "lista mostra o papel novo"); ok(W.m.toasts.some((t) => /agora é Administrador/.test(t)), "toast"); }
  { const W = await mundo(); const sel = linha(W, "felipe").querySelector(".usuPapelSel"); sel.value = "robert"; sel.dispatchEvent(new W.win.Event("change")); await tick(); await W.clica("#usuConfCancelar"); eq(W.m.chamadas.length, 0, "cancelar mudança de papel: nada enviado"); ok(linha(W, "felipe").querySelector(".usuPapelSel").value === "sdr", "volta ao papel"); }
  { const W = await mundo({ usuarios: [{ usuario: "eu", nome: "Eu", papel: "robert", ativo: true }, { usuario: "outro", nome: "Outro", papel: "robert", ativo: true }] }); W.sb.S.eu.usuario = "eu"; await W.sb.carregarUsuarios(); W.sb.render();
    W.m.resp = (m, c) => (c === "/usuarios" ? { status: 409, j: { ok: false, erro: "ultimo_robert", mensagem: "Precisa existir ao menos um usuário com papel Robert." } } : null);
    const sel = linha(W, "outro").querySelector(".usuPapelSel"); sel.value = "sdr"; sel.dispatchEvent(new W.win.Event("change")); await tick(); await W.clica("#usuConfOk"); ok(/ao menos um usuário com papel Robert/.test(W.$("#usuConfErro").textContent), "proteção do último Robert: mensagem do servidor na tela"); }
  // ---- 9. ativar / desativar ----
  { const W = await mundo(); await W.clica(linha(W, "felipe").querySelector(".usuAtivo")); ok(/Desativar Felipe/.test(W.$("#usuConf").textContent) && /perde o acesso na hora/.test(W.$("#usuConf").textContent), "confirmação de desativar"); eq(W.m.chamadas.length, 0, "não chamou ainda");
    await W.clica("#usuConfOk"); eq(W.m.chamadas[0], { metodo: "POST", caminho: "/usuarios/ativo", corpo: { usuario: "felipe", ativo: false } }, "POST /usuarios/ativo ativo:false");
    ok(linha(W, "felipe").querySelector(".pill").textContent === "Desativado", "pílula Desativado"); ok(linha(W, "felipe").querySelector(".usuAtivo").textContent === "Reativar", "botão vira Reativar"); ok(W.m.toasts.some((t) => /Felipe desativado/.test(t)), "toast");
    await W.clica(linha(W, "felipe").querySelector(".usuAtivo")); ok(/Reativar Felipe/.test(W.$("#usuConf").textContent), "confirma reativar"); await W.clica("#usuConfOk"); eq(W.m.chamadas[1].corpo, { usuario: "felipe", ativo: true }, "ativo:true"); ok(linha(W, "felipe").querySelector(".pill").textContent === "Ativo", "volta Ativo"); }
  { const W = await mundo({ resp: (m, c) => (c === "/usuarios/ativo" ? { status: 409, j: { ok: false, erro: "ultimo_robert", mensagem: "Não dá para desativar o último usuário Robert." } } : null) }); await W.clica(linha(W, "felipe").querySelector(".usuAtivo")); await W.clica("#usuConfOk"); ok(/último usuário Robert/.test(W.$("#usuConfErro").textContent), "último robert: mensagem"); ok(linha(W, "felipe").querySelector(".pill").textContent === "Ativo", "lista não mudou"); }
  // ---- 10. XSS ----
  { const ruim = `<img src=x onerror="window.__xss=1">`; const W = await mundo({ usuarios: [{ usuario: "eu", nome: "Eu", papel: "robert", ativo: true }, { usuario: ruim, nome: `<script>window.__xss=2</script>"><svg onload=window.__xss=3>`, papel: "sdr", ativo: true, ultimoAcesso: null }] }); W.sb.S.eu.usuario = "eu"; await W.sb.carregarUsuarios(); W.sb.render();
    ok(W.$$("#usuLista img, #usuLista script, #usuLista svg").length === 0, "nenhuma tag injetada na lista"); ok(W.$("#usuLista").textContent.includes("<script>window.__xss=2</script>"), "nome aparece como texto puro"); ok(W.win.__xss === undefined, "nada executou");
    await W.clica(W.$$(".usuRed")[1]); ok(W.$$("#usuConf img, #usuConf script, #usuConf svg").length === 0 && W.$("#usuConf").textContent.includes("<script>"), "painel de confirmação também escapa o nome"); await W.clica("#usuConfCancelar");
    const sel = W.$$(".usuPapelSel")[1]; sel.value = "admin"; sel.dispatchEvent(new W.win.Event("change")); await tick(); ok(W.$$("#usuConf img, #usuConf svg, #usuConf script").length === 0, "painel de papel escapa"); await W.clica("#usuConfCancelar");
    await W.clica(W.$$(".usuAtivo")[1]); ok(W.$$("#usuConf img, #usuConf svg, #usuConf script").length === 0, "painel de ativo escapa"); ok(W.win.__xss === undefined, "nada executou depois de abrir os painéis");
    ok(W.$$("[data-usuario]").some((e) => e.getAttribute("data-usuario") === ruim), "atributo guarda o texto sem virar HTML");
    const W2 = await mundo(); W2.set("#uUsuario", ruim); W2.set("#uNome", `<b onmouseover=1>x</b>`); W2.set("#uSenha", "Senha2026forte"); W2.m.resp = (m, c, corpo) => ({ status: 422, j: { ok: false, mensagem: `<img src=x onerror="window.__xss=9">` } }); await W2.clica("#uCriar"); ok(W2.$$("#uErro img").length === 0 && W2.win.__xss === undefined, "mensagem de erro do servidor é texto puro"); }
  // ---- 11. clique duplo / bloqueio ----
  { let resolve; const W = await mundo({ resp: (m, c) => (c === "/usuarios" ? new Promise((r) => { resolve = r; }) : null) }); W.set("#uUsuario", "pessoa"); W.set("#uSenha", "Senha2026forte"); W.$("#uCriar").click(); await tick(); ok(W.$("#uCriar").disabled, "botão desligado enquanto envia"); W.$("#uCriar").click(); await tick(); eq(W.m.chamadas.length, 1, "segundo clique não duplica"); resolve({ status: 200, j: { ok: true, criado: true } }); await tick(20); }
  // ---- 12. autocompletar e acessibilidade ----
  { const W = await mundo(); ok(W.$("#uSenha").getAttribute("autocomplete") === "new-password", "senha com autocomplete new-password"); ok(W.$("#uUsuario").getAttribute("autocomplete") === "off", "usuário sem autocomplete"); ok(W.$("#uErro").getAttribute("role") === "alert", "erro com role=alert"); ok(W.$$("label").every((l) => l.htmlFor && W.$("#" + l.htmlFor)), "todo rótulo aponta para um campo"); ok(W.$$("select.usuPapelSel").every((s) => s.getAttribute("aria-label")), "selects com aria-label"); ok(W.$$("button").every((b) => b.type === "button"), "botões type=button (não enviam formulário)"); }
  // ---- 13. nada de senha em log ----
  { const logs = []; const W = await mundo(); const orig = W.sb.console.log; W.sb.console = { log: (...a) => logs.push(a.join(" ")), error: (...a) => logs.push(a.join(" ")), warn: (...a) => logs.push(a.join(" ")) }; W.set("#uUsuario", "pessoa"); W.set("#uSenha", "Senha2026forte"); await W.clica("#uCriar"); ok(!logs.join().includes("Senha2026forte"), "nada de senha no console"); void orig;
    ok(!/console\.(log|error|warn)\([^)]*senha/i.test(bloco), "o bloco não registra senha em console"); ok(!/localStorage|sessionStorage/.test(bloco), "o bloco não guarda nada no navegador"); ok(!/innerHTML|insertAdjacentHTML|document\.write/.test(bloco), "o bloco não usa innerHTML"); }
  // ---- 14. regras da senha iguais às do servidor (lê o servidor se estiver ao lado) ----
  { const W = await mundo(); const f = W.sb.usuRegraSenha; const casos = [["", 1], ["curta1", 1], ["123456789", 1], ["abcdefghij", 1], ["1234567890", 1], ["aaaaaaaaaa", 1], ["a1aaaaaaaa", 0], ["Boa2026senha", 0], ["x".repeat(129) + "1", 1], ["a1" + "x".repeat(126), 0], ["senha com espaço 1", 0], ["Ação2026forte!", 0]];
    casos.forEach(([s, e]) => ok(!!f(s) === !!e, "regra de senha: " + JSON.stringify(s).slice(0, 20) + " erro=" + e));
    const srv = process.env.CENTRAL_ACESSO_JS || "/tmp/bia_usuarios/src/central_acesso.js"; if (fs.existsSync(srv)) { const { senhaForte } = await import(srv); casos.forEach(([s]) => ok(!!f(s) === !!senhaForte(s), "cliente e servidor concordam: " + JSON.stringify(s).slice(0, 20))); for (let i = 0; i < 100; i++) { const g = W.sb.usuGerarSenha(); ok(senhaForte(g) === null, "senha gerada passa no senhaForte do servidor: " + g); } } }
  // ---- 14b. troca obrigatória exigida pelo SERVIDOR (403 trocar_senha) ----
  ok(html.includes("r.status===403&&j&&j.erro==='trocar_senha'&&S.eu&&!S.eu.trocarSenha){S.eu.trocarSenha=true;S.aba='conta';"), "api(): 403 trocar_senha leva para Minha conta");
  ok(html.includes("!(r.j&&r.j.erro==='trocar_senha')){S.erro="), "carregar(): 403 trocar_senha não vira 'Não consegui atualizar'");
  ok(html.includes("S.eu.trocarSenha=false;render();carregar(false);"), "depois de trocar a senha, os dados são recarregados");
  { const apiSrc = html.slice(html.indexOf("async function api(metodo"), html.indexOf("// 16/11: ação manual")); const dom = new JSDOM("<!doctype html><body></body>"); const sb = { S: { tok: "t", eu: { papel: "admin", trocarSenha: false }, aba: "visao" }, API: "x", fetch: async () => ({ status: 403, json: async () => ({ ok: false, erro: "trocar_senha" }) }), AbortController, setTimeout, clearTimeout, console, JSON, hashGravar() { sb.hg = 1; }, renderSoon() { sb.rs = 1; }, sessaoVenceu() { sb.sv = 1; }, fmtAte: () => "", window: {} }; vm.createContext(sb); vm.runInContext(apiSrc, sb); const r = await sb.api("GET", "/estado"); ok(r.status === 403 && sb.S.eu.trocarSenha === true && sb.S.aba === "conta" && sb.rs === 1 && !sb.sv, "api() real: 403 trocar_senha marca a conta e manda para a troca"); void dom; }
  // ---- 15. a página: chama as rotas certas com o cabeçalho certo ----
  ok(/function api\(|async function api\(/.test(html) && html.includes("h['x-central-token']=S.tok"), "api() manda x-central-token");
  ok(html.includes("api('GET','/usuarios')"), "carregarUsuarios lê GET /usuarios"); ok(!/fetch\(/.test(bloco), "a tela usa api() (nunca fetch solto)");
  ok(html.includes("if(S.aba==='usuarios')pOut.push(carregarUsuarios()"), "carrega a lista ao abrir a aba"); ok(/usuarios:telaUsuarios/.test(html), "aba ligada à tela");
  console.log(`usuarios_jsdom: ${n} verificações; falhas: ${falhas.length}`); falhas.forEach((x) => console.log("  FALHOU:", x)); process.exit(falhas.length ? 1 : 0);
})().catch((e) => { console.error("ERRO", e); process.exit(2); });
