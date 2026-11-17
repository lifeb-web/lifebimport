// Central 17/11: janela de 24 h, repasse ao Felipe, 'veio do formulário', nome, voltar de arquivada/oculta. jsdom + funções reais extraídas de central/index.html (nada reescrito aqui).
// Rodar: node central/tests/janela_jsdom.cjs [caminho-do-jsdom]   (padrão: /tmp/jsd/node_modules/jsdom)
const fs = require("fs"), path = require("path"), vm = require("vm");
const { JSDOM } = require(process.argv[2] || "/tmp/jsd/node_modules/jsdom");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
let n = 0; const falhas = [];
const ok = (c, m) => { n++; if (!c) falhas.push(m); };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), m + " | esperado " + JSON.stringify(b) + " veio " + JSON.stringify(a));
// bloco puro
const ini = html.indexOf("/*JANELA-INI*/"), fim = html.indexOf("/*JANELA-FIM*/");
ok(ini > 0 && fim > ini, "bloco puro delimitado");
const dom = new JSDOM("<!doctype html><body></body>"); const document = dom.window.document;
const FIXO = { t: Date.UTC(2026, 10, 17, 15, 0, 0) };
const FD = class extends Date { constructor(...a) { if (a.length) super(...a); else super(FIXO.t); } static now() { return FIXO.t; } };
const sandbox = { document, Date: FD, Math, JSON, Object, Array, String, Number, isFinite, console, S: { ag: { conversas: [] } }, AT: { fone: null, conv: null, vistos: {}, arqVisto: {}, ultLead: {}, arqLocal: {}, filtro: "todos", busca: "" } };
vm.createContext(sandbox);
const fn = (nome) => { const m = html.match(new RegExp("^function " + nome + "\\(.*$", "m")); if (!m) throw new Error("função não achada: " + nome); return m[0]; };
let codigo = html.slice(ini, fim);
["el", "fmtData", "atQuando", "atConvLista", "atPrecisaGente", "atArqSrv", "atJanelaDe", "atJanelaEl", "atRepasseEl", "atVoltou", "atVoltouEl", "atArqRastrear", "atStatus", "atSeloK", "axContagens", "atArqEf", "atFiltrar"].forEach((f) => { codigo += "\n" + fn(f); });
codigo = "var TZ_BR='America/Sao_Paulo';function atSelosDe(){return [];}function atArqLimpa(){}\n" + codigo;
vm.runInContext(codigo, sandbox);
const J = (nome) => sandbox[nome];
const H = 3600000, M = 60000, D = 24 * H, AG = Date.UTC(2026, 10, 17, 15, 0, 0);

// ---------- 1. janInfo: bordas ----------
const casos = [ // [ultimaDoLead atrás (ms), aberta esperada, texto esperado]
  [0, true, "Janela ABERTA, fecha em 24h00"], [1, true, "Janela ABERTA, fecha em 23h59"], [M, true, "Janela ABERTA, fecha em 23h59"], [59 * M, true, "Janela ABERTA, fecha em 23h01"],
  [H, true, "Janela ABERTA, fecha em 23h00"], [20 * H + 48 * M, true, "Janela ABERTA, fecha em 3h12"], [22 * H, true, "Janela ABERTA, fecha em 2h00"],
  [22 * H + M, true, "Janela ABERTA, fecha em 1h59"], [23 * H, true, "Janela ABERTA, fecha em 1h00"], [23 * H + 5 * M, true, "Janela ABERTA, fecha em 55 min"], [23 * H + 59 * M, true, "Janela ABERTA, fecha em 1 min"],
  [24 * H - 30000, true, "Janela ABERTA, fecha em menos de 1 min"], [24 * H - 1, true, "Janela ABERTA, fecha em menos de 1 min"],
  [24 * H, false, "Janela FECHADA há menos de 1 min"], [24 * H + 1, false, "Janela FECHADA há menos de 1 min"], [24 * H + 59 * 1000, false, "Janela FECHADA há menos de 1 min"], [24 * H + M, false, "Janela FECHADA há 1 min"],
  [24 * H + 59 * M, false, "Janela FECHADA há 59 min"], [25 * H, false, "Janela FECHADA há 1h"], [25 * H + 5 * M, false, "Janela FECHADA há 1h05"], [47 * H, false, "Janela FECHADA há 23h"], [48 * H, false, "Janela FECHADA há 1 dia"],
  [72 * H, false, "Janela FECHADA há 2 dias"], [26 * D, false, "Janela FECHADA há 25 dias"], [24 * H + 25 * H, false, "Janela FECHADA há 1 dia"],
];
casos.forEach(([atras, ab, txt]) => {
  const ult = AG - atras; const x = { fone: "5562", ultimaDe: "lead", ts: ult };
  const i = J("janInfo")(x, null, AG); ok(i && i.aberta === ab, "janInfo(" + atras + ") aberta=" + ab + " veio " + (i && i.aberta));
  eq(J("janTexto")(i, AG), txt, "texto atrás=" + atras);
  ok(i.origem === "cliente", "origem cliente atrás=" + atras); ok(i.ultimaDoLead === ult, "ultimaDoLead atrás=" + atras);
  ok(i.fechando === (ab && (24 * H - atras) < 2 * H), "fechando atrás=" + atras + " (" + i.fechando + ")");
  ok(i.fechaEm === ult + D, "fechaEm atrás=" + atras);
});
// fechando: exatamente 2h NÃO é fechando (<2h)
ok(J("janInfo")({ ultimaDe: "lead", ts: AG - 22 * H }, null, AG).fechando === false, "exatamente 2h restantes não é 'fechando'");
ok(J("janInfo")({ ultimaDe: "lead", ts: AG - 22 * H - 1 }, null, AG).fechando === true, "2h menos 1 ms é 'fechando'");
// ---------- 1b. varredura minuto a minuto (contagem regressiva) ----------
for (let m = 1; m <= 150; m++) { const i = J("janInfo")({ ultimaDe: "lead", ts: AG - (24 * H - m * M) }, null, AG); const t = J("janTexto")(i, AG); const esp = m < 60 ? "Janela ABERTA, fecha em " + m + " min" : "Janela ABERTA, fecha em " + Math.floor(m / 60) + "h" + String(m % 60).padStart(2, "0"); if (t !== esp) falhas.push("minuto " + m + ": " + t + " != " + esp); n++; if (m % 10 === 0) ok(i.fechando === (m < 120), "fechando no minuto " + m); }
for (let h = 25; h <= 24 * 40; h += 7) { const i = J("janInfo")({ ultimaDe: "lead", ts: AG - h * H }, null, AG); ok(i.aberta === false && /^Janela FECHADA há /.test(J("janTexto")(i, AG)), "fechada há " + (h - 24) + "h"); }
// ---------- 2. servidor manda: vale o dado do servidor; estado sai da HORA ----------
{ const sv = { janela: { aberta: true, fechaEm: AG + 3 * H + 12 * M, ultimaDoLead: AG - 20 * H } }; const i = J("janInfo")(sv, null, AG);
  ok(i.origem === "servidor", "servidor: origem"); eq(J("janTexto")(i, AG), "Janela ABERTA, fecha em 3h12", "servidor aberta 3h12");
  const dep = J("janInfo")(sv, null, AG + 4 * H); ok(dep.aberta === false, "servidor: 'aberta' velho mas hora passou => FECHADA"); eq(J("janTexto")(dep, AG + 4 * H), "Janela FECHADA há 48 min", "servidor: fechada há 48 min");
  const sv2 = { janela: { aberta: false, fechouEm: AG - 2 * D, ultimaDoLead: AG - 3 * D } }; const i2 = J("janInfo")(sv2, null, AG); ok(i2.aberta === false, "servidor fechouEm: fechada"); eq(J("janTexto")(i2, AG), "Janela FECHADA há 2 dias", "servidor fechouEm 2 dias");
  const sv3 = { janela: { aberta: true } }; const i3 = J("janInfo")(sv3, null, AG); ok(i3 && i3.aberta === true && !i3.fechaEm, "servidor só boolean aberta"); eq(J("janTexto")(i3, AG), "Janela ABERTA", "só boolean: sem contagem inventada");
  const sv4 = { janela: { aberta: false } }; ok(J("janInfo")(sv4, null, AG).aberta === false, "servidor só boolean fechada");
  ok(J("janInfo")({ janela: {} }, null, AG) === null, "janela vazia: desconhecida"); ok(J("janInfo")({ janela: "x" }, null, AG) === null, "janela string: ignorada");
  // ficha mais fresca manda sobre a lista
  const lista = { janela: { aberta: true, fechaEm: AG + H }, ts: AG }; const ficha = { ok: true, janela: { aberta: true, fechaEm: AG + 5 * H }, hist: [] };
  ok(J("janInfo")(lista, ficha, AG).fechaEm === AG + 5 * H, "ficha manda sobre a lista"); ok(J("janInfo")(lista, { ok: false, janela: { aberta: true, fechaEm: AG + 9 * H } }, AG).fechaEm === AG + H, "ficha com erro (ok:false) NÃO manda");
  ok(J("janInfo")(lista, { ok: true, hist: [] }, AG).fechaEm === AG + H, "ficha sem janela cai para a lista"); }
// ---------- 3. cliente: ficha, lista, memória ----------
{ ok(J("janInfo")({ ultimaDe: "ana", ts: AG - H }, null, AG) === null, "lista: Ana falou por último e ninguém sabe a fala do lead => sem selo (não inventa)");
  ok(J("janInfo")({ ultimaDe: "ana", ts: AG - H }, null, AG, AG - 5 * H).fechaEm === AG - 5 * H + D, "memória local da última fala do lead");
  const v = { ok: true, hist: [{ de: "lead", ts: AG - 10 * H }, { de: "ana", ts: AG - 9 * H }, { de: "humano", ts: AG - 8 * H }] };
  ok(J("janInfo")({ ultimaDe: "humano", ts: AG - 8 * H }, v, AG).ultimaDoLead === AG - 10 * H, "ficha: última fala do LEAD (não da Ana/equipe)"); eq(J("janTexto")(J("janInfo")({}, v, AG), AG), "Janela ABERTA, fecha em 14h00", "ficha: 14h00");
  const v2 = { ok: true, hist: [{ de: "ana", ts: AG - 3 * H, tipo: "modelo" }] }; const i = J("janInfo")({}, v2, AG); ok(i && i.semLead && !i.aberta, "ficha curta sem fala do lead: FECHADA, lead nunca escreveu"); eq(J("janTexto")(i, AG), "Janela FECHADA: o lead ainda não escreveu", "texto sem lead");
  const hist60 = []; for (let k = 0; k < 60; k++) hist60.push({ de: "ana", ts: AG - k * M }); ok(J("janInfo")({}, { ok: true, hist: hist60 }, AG) === null, "60 mensagens sem lead: histórico pode estar cortado => desconhecida");
  ok(J("janInfo")({}, { ok: true, hist: [] }, AG) === null, "histórico vazio: desconhecida"); ok(J("janInfo")(null, null, AG) === null, "tudo nulo"); ok(J("janInfo")(undefined, undefined) === null, "tudo indefinido");
  ok(J("janInfo")({ ultimaLeadTs: AG - 2 * H, ultimaDe: "ana", ts: AG }, null, AG).ultimaDoLead === AG - 2 * H, "campo ultimaLeadTs da lista"); }
// valores sujos
[NaN, "abc", -5, 0, null, undefined, Infinity, {}, []].forEach((sujo, k) => { let r; try { r = J("janInfo")({ janela: { aberta: true, fechaEm: sujo, ultimaDoLead: sujo, fechouEm: sujo } }, null, AG); ok(r === null || typeof r.aberta === "boolean", "valor sujo " + k + " não quebra"); } catch (e) { ok(false, "valor sujo " + k + " lançou " + e.message); } });
// ---------- 4. janRecalc / dica ----------
{ const i = J("janInfo")({ ultimaDe: "lead", ts: AG - 21 * H }, null, AG); const a = J("janRecalc")(i, AG + 61 * M); ok(a.aberta === true && a.fechando === true, "recalc: 1h59 restantes: aberta e fechando"); const a0 = J("janRecalc")(i, AG + 59 * M); ok(a0.aberta === true && a0.fechando === false, "recalc: 2h01 restantes: aberta e NÃO fechando"); const b = J("janRecalc")(i, AG + 3 * H + 1); ok(b.aberta === false && b.fechouEm === i.fechaEm && b.fechando === false, "recalc: virou FECHADA"); ok(i.aberta === true, "recalc não muta o original");
  ok(/FECHADA/.test(J("janDica")(b)) && /modelo aprovada/.test(J("janDica")(b)), "dica fechada fala de modelo"); ok(/aberta/.test(J("janDica")(a)), "dica aberta"); eq(J("janDica")(null), "", "dica nula"); ok(/nunca escreveu/.test(J("janDica")({ semLead: true })), "dica sem lead"); }
// ---------- 5. DOM: selo da janela ----------
const poe = (c, ficha) => { sandbox.S.ag.conversas = c; sandbox.AT.fone = ficha ? ficha.fone : null; sandbox.AT.conv = ficha ? { v: ficha.v } : null; };
{ const lista = [{ fone: "5562900000001", nome: "A", ts: AG - 20 * H - 48 * M, ultimaDe: "lead" }, { fone: "5562900000002", nome: "B", ts: AG - 3 * D, ultimaDe: "lead" }, { fone: "5562900000003", nome: "C", ts: AG - H, ultimaDe: "ana" }, { fone: "5562900000004", nome: "D", ts: AG - 23 * H, ultimaDe: "lead" }];
  poe(lista);
  const a = J("atJanelaEl")("5562900000001"); ok(a && a.className.indexOf("jan") >= 0 && a.className.indexOf(" ok") >= 0 && a.className.indexOf("pr") < 0, "selo A verde"); eq(a.textContent, "Janela ABERTA, fecha em 3h12", "selo A texto"); ok(a.dataset.jan === "5562900000001" && /24 h/.test(a.title), "selo A data-jan + dica");
  const b = J("atJanelaEl")("5562900000002"); ok(b.className.indexOf(" pr") >= 0 && b.className.indexOf(" ok") < 0, "selo B vermelho"); eq(b.textContent, "Janela FECHADA há 2 dias", "selo B texto"); ok(/modelo aprovada/.test(b.title), "selo B dica modelo");
  ok(J("atJanelaEl")("5562900000003") === null, "selo C ausente (sem dado)"); const d = J("atJanelaEl")("5562900000004"); ok(d.className.indexOf("fch") >= 0, "selo D marcado 'fechando'"); eq(d.textContent, "Janela ABERTA, fecha em 1h00", "selo D texto");
  ok(J("atJanelaEl")("5562900000001", "gd").className.indexOf(" gd") >= 0, "classe extra");
  // filtro e contagem
  sandbox.AT.filtro = "fechando"; const f = J("atFiltrar")(lista); eq(f.map((x) => x.nome), ["D"], "filtro 'fechando' só D"); sandbox.AT.filtro = "todos"; eq(J("axContagens")(lista).fechando, 1, "contagem fechando=1");
  // ordenar por quem fecha primeiro
  const l2 = lista.concat([{ fone: "5562900000005", nome: "E", ts: AG - 22 * H - 30 * M, ultimaDe: "lead" }, { fone: "5562900000006", nome: "F", ts: AG - 23 * H - 30 * M, ultimaDe: "lead" }]); poe(l2); sandbox.AT.filtro = "fechando"; eq(J("atFiltrar")(l2).map((x) => x.nome), ["F", "D", "E"], "ordem: fecha primeiro vem primeiro"); sandbox.AT.filtro = "todos";
  // ---------- 6. repasse ----------
  const T = Date.UTC(2026, 10, 17, 2, 55); // 16/11 23:55 em Brasília
  const rl = [{ fone: "5544999777680", nome: "Diego", estagio: "aguardando_humano", ts: AG, repasse: { repassada: true, quem: "Robert", quando: T, motivo: "handoff_manual" } }, { fone: "5544000000001", nome: "Sem", ts: AG }];
  poe(rl); const r = J("atRepasseEl")("5544999777680"); eq(r.textContent, "REPASSADA AO FELIPE por Robert, 16/11 23:55", "selo repasse Diego"); ok(r.className.indexOf("rep") >= 0, "classe rep"); ok(J("atRepasseEl")("5544000000001") === null, "sem repasse: sem selo");
  eq(J("repasseTexto")({ por: "", ts: T, para: "Felipe" }, J("fmtData")), "REPASSADA AO FELIPE, 16/11 23:55", "sem 'por'"); eq(J("repasseTexto")({ por: "Ana Paula", ts: 0, para: "Felipe" }, J("fmtData")), "REPASSADA AO FELIPE por Ana Paula", "sem hora"); eq(J("repasseTexto")(null), "", "nulo");
  // fallback pela nota da ficha
  poe(rl, { fone: "5544000000001", v: { ok: true, hist: [], notas: [{ texto: "oi", ts: 1 }, { texto: "Passada manualmente ao Felipe (negócio 12)", ts: T, quem: "Robert" }] } }); eq(J("atRepasseEl")("5544000000001").textContent, "REPASSADA AO FELIPE por Robert, 16/11 23:55", "fallback pela nota");
  const ri = J("repasseInfo")({}, { ok: true, notas: [{ texto: "Passada manualmente ao Felipe", ts: 5, quem: "X" }, { texto: "Passada manualmente ao Felipe", ts: 9, quem: "Y" }] }); ok(ri.ts === 9 && ri.por === "Y", "pega a nota MAIS RECENTE");
  ok(J("repasseInfo")({}, { ok: true, notas: [] }) === null && J("repasseInfo")(null, null) === null && J("repasseInfo")({}, { ok: true, notas: [{ texto: "outra coisa" }] }) === null, "sem repasse");
  ok(J("repasseInfo")({ repasse: { repassada: true, quem: "Ana", quando: null, motivo: null } }, null).por === "Ana" && J("repasseInfo")({ repasse: { repassada: true, quem: "Ana", quando: null, motivo: null } }, null).ts === 0, "repasse da Ana sem hora (contrato: pode ser null)"); eq(J("repasseTexto")({ por: "Ana", ts: 0, para: "Felipe" }), "REPASSADA AO FELIPE por Ana", "texto sem hora"); ok(J("repasseInfo")({ repasse: { repassada: false, quem: null, quando: null, motivo: null } }, { ok: true, notas: [] }) === null, "repassada:false => nenhum selo"); ok(J("repasseInfo")({ repasse: { repassada: true, quem: null, quando: null, motivo: null } }, null).por === "", "repassada:true derivado só do estágio (quem null)"); eq(J("repasseTexto")(J("repasseInfo")({ repasse: { repassada: true, quem: null, quando: null } }, null)), "REPASSADA AO FELIPE", "texto mínimo");
  // XSS: tudo entra por textContent
  const hostil = [{ fone: "5544000000009", nome: "<img src=x onerror=alert(1)>", ts: AG, repasse: { repassada: true, quem: "<script>alert(2)</script>", quando: T, motivo: null } }]; poe(hostil); const rh = J("atRepasseEl")("5544000000009"); ok(rh.children.length === 0 && /<script>/.test(rh.textContent), "repasse hostil vira texto"); ok(rh.innerHTML.indexOf("<script>") < 0, "innerHTML escapado");
  // ---------- 7. formulário e nome ----------
  const CF = { ok: true, formulario: { nome: "Natália", telefone: "559992320998", origem: "rede_farma", campanha: null, entrouEm: T, campos: { empresaCadastro: "Farma Bem", cnpj: "00.000.000/0001-00", segmentoProvavel: { valor: "farmacia", fonte: "cnpj" }, tentouEm: T, origemPagina: "rede_farma", primeiraMensagemDoLead: "Quero saber do projeto", modeloDeAbertura: { modelo: "abertura_v2", texto: "Oi Natália!", ts: T }, jaCliente: false, emAtendimento: null } } };
  const fi = J("formInfo")({}, CF); ok(fi.nome === "Natália" && fi.telefone === "559992320998" && fi.origem === "rede_farma" && fi.campanha === "" && fi.entrouEm === T, "contrato: formulário principal (campanha null vira vazio)");
  const cm = Object.fromEntries(fi.campos); eq(cm["Empresa no cadastro"], "Farma Bem", "campo empresaCadastro"); eq(cm["Segmento provável"], "farmacia (cnpj)", "segmentoProvavel{valor,fonte}"); eq(cm["Já é cliente"], "Não", "jaCliente false mostra 'Não'"); ok(!("Em atendimento com" in cm), "emAtendimento null some"); ok(/Oi Natália!/.test(cm["Abertura enviada pela Ana"]) && /abertura_v2/.test(cm["Abertura enviada pela Ana"]), "modeloDeAbertura"); eq(cm["Tentou o cadastro em"], "16/11 23:55", "tentouEm formatado"); eq(cm["Primeira mensagem do lead"], "Quero saber do projeto", "primeira mensagem");
  eq(J("formInfo")({}, { ok: true, formulario: { nome: "X", campos: { emAtendimento: { dono: "Felipe" }, jaCliente: true } } }).campos, [["Em atendimento com", "Felipe"], ["Já é cliente", "Sim"]], "emAtendimento{dono} e jaCliente true");
  ok(J("formInfo")({}, null) === null && J("formInfo")(null, null) === null && J("formInfo")({ nome: "só nome" }, { ok: true }) === null, "sem formulário nem origem: nenhum bloco"); ok(J("formInfo")({}, { ok: true, formulario: { nome: null, telefone: null, origem: null, campanha: null, entrouEm: null, campos: { empresaCadastro: null, cnpj: null, segmentoProvavel: null, jaCliente: null } } }) === null, "formulário todo null: nenhum bloco");
  ok(J("formInfo")({ origem: "WhatsApp direto" }, { ok: true }).origem === "WhatsApp direto", "só origem solta basta (servidor antigo)"); ok(J("formInfo")({}, { ok: false, formulario: { nome: "X" } }) === null, "ficha com erro não manda");
  const longo = "z".repeat(900); const fl = J("formInfo")({}, { ok: true, formulario: { nome: longo, campos: { cnpj: longo } } }); ok(fl.nome.length === 80 && fl.campos[0][1].length === 300, "corta textos enormes"); const mui = {}; for (let k = 0; k < 60; k++) mui["c" + k] = "v"; ok(J("formInfo")({}, { ok: true, formulario: { campos: mui } }).campos.length === 24, "no máximo 24 campos");
  ok(J("formInfo")({}, { ok: true, formulario: { nome: "A", campos: [1, 2] } }).campos.length === 0, "campos como lista é ignorado sem quebrar");
  // ---------- CONTRATO: 3 cenários ----------
  { // (a) servidor novo completo
    const lista = { fone: "5544999777680", estagio: "aguardando_humano", ts: AG - 3 * D, ultimaDe: "lead", janela: { aberta: false, fechaEm: AG - 2 * D, fechouEm: AG - 2 * D, ultimaDoLead: AG - 3 * D }, repasse: { repassada: true, quem: "Robert", quando: T, motivo: "handoff_manual" }, ultimaAtividade: AG - H, ocultaDesde: null, voltouEm: AG - M, voltouMotivo: "nova_mensagem", voltouDe: "arquivada", voltouOrigem: "mensagem" };
    poe([lista]); eq(J("atJanelaEl")(lista.fone).textContent, "Janela FECHADA há 2 dias", "contrato(a): janela"); eq(J("atRepasseEl")(lista.fone).textContent, "REPASSADA AO FELIPE por Robert, 16/11 23:55", "contrato(a): repasse"); ok(J("atVoltouEl")(lista.fone) !== null, "contrato(a): voltouEm sem arquivada => selo");
    ok(J("voltouInfo")({ voltouEm: AG, arquivada: { ts: AG + 1 } }, 0, null) === false, "contrato(a): voltouEm <= arquivada.ts => sem selo"); ok(J("voltouInfo")({ voltouEm: AG, arquivada: { ts: AG - 1 } }, 0, null) === true, "contrato(a): voltouEm > arquivada.ts => selo"); ok(J("voltouInfo")({ voltouEm: AG }, AG, null) === false, "contrato(a): depois de aberta some"); sandbox.S.ag.conversas = [Object.assign({}, lista, { voltouOrigem: "falha_entrega" })]; ok(/falha de entrega/.test(J("atVoltouEl")(lista.fone).textContent), "contrato(a): voltou por falha de entrega"); }
  { // (b) servidor antigo: nenhum campo novo
    const velho = { fone: "5562911", nome: "Velho", estagio: "perguntou_cnpj", ts: AG - 5 * H, ultimaDe: "lead" }; poe([velho]);
    eq(J("atJanelaEl")(velho.fone).textContent, "Janela ABERTA, fecha em 19h00", "contrato(b): sem janela do servidor, calcula local"); ok(J("atRepasseEl")(velho.fone) === null && J("atVoltouEl")(velho.fone) === null, "contrato(b): sem repasse nem 'voltou'");
    const velhoAna = { fone: "5562922", nome: "Velho2", estagio: "perguntou_cnpj", ts: AG - 5 * H, ultimaDe: "ana" }; poe([velhoAna]); ok(J("atJanelaEl")(velhoAna.fone) === null, "contrato(b): Ana por último, sem dado: selo some (não inventa)"); ok(J("formInfo")(velhoAna, { ok: true, hist: [] }) === null && J("repasseInfo")(velhoAna, { ok: true, hist: [] }) === null, "contrato(b): ficha antiga sem blocos"); ok(J("axContagens")([velho, velhoAna]).fechando === 0, "contrato(b): contagem não quebra"); }
  { // (c) parcialmente nulos
    const nulo = { fone: "5562933", estagio: "novo", ts: AG - H, ultimaDe: "ana", janela: { aberta: false, fechaEm: null, fechouEm: null, ultimaDoLead: null }, repasse: { repassada: false, quem: null, quando: null, motivo: null }, ultimaAtividade: null, ocultaDesde: null, voltouEm: null, voltouMotivo: null, voltouDe: null, voltouOrigem: null }; poe([nulo]);
    eq(J("atJanelaEl")(nulo.fone).textContent, "Janela FECHADA: o lead ainda não escreveu", "contrato(c): sem fala do lead"); ok(J("atRepasseEl")(nulo.fone) === null && J("atVoltouEl")(nulo.fone) === null, "contrato(c): repassada:false e voltouEm null => nada");
    const p1 = { fone: "5562944", ts: AG, janela: { aberta: true, fechaEm: AG + 3 * H, fechouEm: null, ultimaDoLead: null } }; poe([p1]); eq(J("atJanelaEl")(p1.fone).textContent, "Janela ABERTA, fecha em 3h00", "contrato(c): só fechaEm"); const p2 = { fone: "5562955", ts: AG, janela: { aberta: null, fechaEm: null, fechouEm: null, ultimaDoLead: null }, ultimaDe: "lead" }; poe([p2]); eq(J("atJanelaEl")(p2.fone).textContent, "Janela ABERTA, fecha em 24h00", "contrato(c): janela toda null cai no cálculo local");
    ok(J("janInfo")({ janela: { aberta: false, fechaEm: null, fechouEm: null, ultimaDoLead: null } }, { ok: true, hist: [{ de: "lead", ts: AG - H }] }, AG).aberta === true, "contrato(c): ficha com histórico do lead vence janela vazia da lista... "); }
  // nome: Natália 559992320998
  eq(J("nomeDe")({ nome: "" }, { nome: "", formulario: { nome: "Natália" } }), "Natália", "nome do formulário quando lista e ficha não têm"); eq(J("nomeDe")({ nome: "Ana" }, { formulario: { nome: "Natália" } }), "Ana", "nome da lista manda");
  eq(J("nomeDe")({}, { dados: { nome: "Beto" } }), "Beto", "nome em dados"); eq(J("nomeDe")({ nome: "5562999990000" }, { formulario: { nome: "Natália" } }), "Natália", "telefone como nome perde para nome de verdade"); eq(J("nomeDe")({ nome: "5562999990006" }, {}), "5562999990006", "só telefone: mantém (teste nomes_curtos)"); eq(J("nomeDe")({ nome: "+55 (62) 99999-0000" }, {}), "+55 (62) 99999-0000", "só há telefone como nome: devolve como antes"); eq(J("nomeDe")({ nome: "   " }, {}), "", "só espaços"); eq(J("nomeDe")(null, null), "", "nulo"); eq(J("nomeDe")({ nome: 5 }, {}), "", "nome numérico ignorado");
  eq(J("nomeDe")({ nomeFormulario: "Zé" }, {}), "Zé", "nomeFormulario na lista");
  // ---------- 8. oculta/arquivada volta sozinha ----------
  const Td = 1000000, A = (ts, extra) => Object.assign({ fone: "5562911", ts, arquivada: { ts: Td } }, extra || {});
  ok(J("arqServidor")(A(Td - 5)) === true, "arquivada, sem nada novo: continua"); ok(J("arqServidor")(A(Td)) === true, "ts == arquivada: continua"); ok(J("arqServidor")(A(Td + 1)) === true, "só ts novo e sem av: sem ultimaAtividade não decide (servidor ainda manda a marca)");
  ok(J("arqServidor")(A(Td - 5, { ultimaAtividade: Td + 1 })) === false, "ultimaAtividade > arquivada.ts: VOLTA"); ok(J("arqServidor")(A(Td - 5, { ultimaAtividade: Td })) === true, "ultimaAtividade == : continua"); ok(J("arqServidor")(A(Td - 5, { ultimaAtividade: Td - 1 })) === true, "ultimaAtividade antes: continua");
  ok(J("arqServidor")({ fone: "x", oculta: true, ocultaDesde: Td, ultimaAtividade: Td + 9 }) === false, "oculta + atividade nova: VOLTA"); ok(J("arqServidor")({ fone: "x", oculta: true, ocultaDesde: Td, ultimaAtividade: Td - 9 }) === true, "oculta sem nada novo: continua"); ok(J("arqServidor")({ fone: "x" }) === false && J("arqServidor")(null) === false, "não arquivada");
  ok(J("arqServidor")(A(Td + 50), { a: Td, ts: Td }) === false, "memória do cliente: ts maior que o visto ao arquivar => VOLTA (mensagem da Ana ou equipe)"); ok(J("arqServidor")(A(Td + 50), { a: Td + 7, ts: Td }) === true, "memória de OUTRO arquivamento não vale"); ok(J("arqServidor")(A(Td), { a: Td, ts: Td }) === true, "mesmo ts: continua arquivada");
  ["lead", "ana", "humano"].forEach((q) => ok(J("arqServidor")(A(Td - 5, { ultimaDe: q, ultimaAtividade: Td + 100 })) === false, "qualquer parte traz de volta: " + q));
  // voltouInfo: selo 'Voltou: nova mensagem'
  ok(J("voltouInfo")(A(Td - 5, { ultimaAtividade: Td + 10 }), 0, null) === true, "voltou: servidor"); ok(J("voltouInfo")(A(Td - 5, { ultimaAtividade: Td + 10 }), Td + 10, null) === false, "voltou: já visto => some"); ok(J("voltouInfo")(A(Td - 5, { ultimaAtividade: Td + 10 }), Td + 9, null) === true, "visto antes da mensagem => ainda marca");
  ok(J("voltouInfo")({ fone: "q", ts: Td + 5 }, 0, { a: 0, ts: Td }) === true, "voltou: pela memória do cliente"); ok(J("voltouInfo")({ fone: "q", ts: Td }, 0, { a: 0, ts: Td }) === false, "sem mensagem nova: não voltou"); ok(J("voltouInfo")({ fone: "q", ts: Td + 5 }, 0, null) === false, "nunca arquivada: não é 'voltou'"); ok(J("voltouInfo")(null, 0, null) === false, "nulo");
  // rastreamento (atArqRastrear) ponta a ponta no navegador-fake
  sandbox.AT.arqVisto = {}; sandbox.AT.vistos = {}; const it = { fone: "5562977", nome: "Q", ts: Td, ultimaDe: "lead", arquivada: { ts: Td } }; J("atArqRastrear")([it]); ok(sandbox.AT.arqVisto["5562977"] && sandbox.AT.arqVisto["5562977"].ts === Td, "rastreia o ts de quando viu arquivada");
  poe([it]); ok(J("atArqSrv")(it) === true, "arquivada na lista"); const it2 = Object.assign({}, it, { ts: Td + 60000, ultimaDe: "ana" }); poe([it2]); ok(J("atArqSrv")(it2) === false, "Ana respondeu (servidor ainda com a marca): volta"); ok(J("atVoltouEl")("5562977") && /Voltou: nova mensagem/.test(J("atVoltouEl")("5562977").textContent), "selo 'Voltou: nova mensagem'");
  sandbox.AT.vistos["5562977"] = Td + 60000; ok(J("atVoltouEl")("5562977") === null, "depois de aberta, o selo some");
  const it3 = Object.assign({}, it2, { arquivada: { ts: Td + 120000 }, ts: Td + 60000 }); J("atArqRastrear")([it3]); ok(sandbox.AT.arqVisto["5562977"].a === Td + 120000, "re-arquivada: memória nova"); poe([it3]); ok(J("atArqSrv")(it3) === true, "re-arquivada continua arquivada");
  // conversa que precisa de gente nunca fica arquivada
  const pg = { fone: "5562988", ts: Td, humano: true, arquivada: { ts: Td } }; poe([pg]); ok(J("atArqSrv")(pg) === false, "precisa de gente: nunca arquivada");
  // ---------- 9. limpeza ----------
  }
// ---------- 10. varredura estática da página ----------
ok(/data-b|dataset\.b/.test(html) && html.indexOf("AX_BLOCOS") > 0, "blocos da ficha presentes");
["Janela e entrada", "Repasse ao Felipe", "Instrução da equipe", "Dados qualificados", "Histórico"].forEach((t) => ok(html.indexOf("'" + t + "'") > 0, "bloco '" + t + "' na ficha"));
ok(html.indexOf("Veio do formulário") > 0, "cartão 'Veio do formulário'"); ok(html.indexOf("Recebido: confirmando no Agendor") > 0, "Passar ao Felipe: 'Recebido: confirmando no Agendor…'");
ok(!/\.innerHTML\s*=[^=]*(nome|formulario|repasse|campos)/.test(html.slice(ini - 200, fim + 20000)), "nenhum innerHTML com nome/formulário/repasse perto do código novo");
ok((html.slice(ini, fim).match(/innerHTML/g) || []).length === 0, "bloco puro sem innerHTML");
console.log("janela_jsdom: " + n + " verificações, " + falhas.length + " falhas"); falhas.slice(0, 40).forEach((f) => console.log(" X " + f)); process.exit(falhas.length ? 1 : 0);
