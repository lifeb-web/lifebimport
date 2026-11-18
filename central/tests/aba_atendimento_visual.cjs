// Central 18/11 (Robert #3216): AUDITORIA VISUAL da aba Atendimento inteira (lista, filtros recolhiveis, ficha com selos e cartoes) em 1440, 1280, 1024 e celular, claro e escuro. Mede o que esta CORTADO, SOBREPOSTO, sem CONTRASTE ou estourando a tela, e tira prints. Falha se achar algo fora da lista de truncamentos intencionais (nomes/previas com reticencias).
// Rodar: node central/tests/aba_atendimento_visual.cjs <playwright-core> <chromium>   (CENTRAL_URL proprio; PRINTS=pasta dos prints; AUDIT_JSON=arquivo com o relatorio)
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("aba_atendimento_visual");
const fs = require("fs"); const PR = process.env.PRINTS || "/tmp/central_prints/audit_depois"; fs.mkdirSync(PR, { recursive: true });
const NOW = Date.now(), H = 3600000, D = 24 * H, T_REP = Date.UTC(2026, 10, 17, 2, 55);
const F = { SEM: "5562900000021", REP: "5544999777680", NAT: "559992320998", MET: "5562900000023", LONGO: "5562900000024", ABERTA: "5562900000025", INV: "5562900000026" };
const LONGO = "Maria Aparecida de Souza e Silva Albuquerque Cavalcanti Nogueira da Fonseca";
const conv = [
  { fone: F.SEM, nome: "Sem Fala do Lead", estagio: "novo", humano: false, pausado: false, ts: NOW - 3 * H, previa: "Oi, tudo bem?", ultimaDe: "ana", janela: { aberta: false, fechaEm: null, fechouEm: null, ultimaDoLead: null } },
  { fone: F.REP, nome: "Diego Alves", estagio: "aguardando_humano", humano: false, pausado: false, ts: NOW - 5 * H, previa: "quero falar com alguem", ultimaDe: "lead", atendimento: "repassada_felipe", atendimentoProva: "nota_manual", repasse: { repassada: true, quem: "Robert", quando: T_REP, motivo: "handoff_manual" }, janela: { aberta: false, fechaEm: NOW - 2 * D, fechouEm: NOW - 2 * D, ultimaDoLead: NOW - 3 * D } },
  { fone: F.NAT, nome: "", estagio: "novo", humano: false, pausado: false, ts: NOW - 2 * H, previa: "Oi, tudo bem?", ultimaDe: "ana", janela: { aberta: true, fechaEm: NOW + 10 * H, fechouEm: null, ultimaDoLead: NOW - 14 * H } },
  { fone: F.MET, nome: "Meta Limitou", estagio: "novo", humano: false, pausado: false, ts: NOW - 7 * H, previa: "Oi", ultimaDe: "ana", entrega: { estado: "limitada_meta", codigo: 130472, texto: "A Meta limitou esse numero (experimento): reenviando por modelo de utilidade", fase: "reenviando", tentativas: 1, ts: NOW - 7 * H }, janela: { aberta: false, fechaEm: null, fechouEm: null, ultimaDoLead: null } },
  { fone: F.LONGO, nome: LONGO, empresa: "Distribuidora de Alimentos e Bebidas Vale do Sol Importacao e Exportacao Ltda", estagio: "perguntou_cnpj", humano: true, pausado: false, ts: NOW - 20 * H, previa: "Gostaria de saber mais sobre o projeto de comodato e as condicoes de pagamento para a minha rede de farmacias", ultimaDe: "lead", janela: { aberta: true, fechaEm: NOW + 4 * H, fechouEm: null, ultimaDoLead: NOW - 20 * H } },
  { fone: F.ABERTA, nome: "Aberta", estagio: "perguntou_cnpj", humano: false, pausado: true, ts: NOW - 1 * H, previa: "bom dia", ultimaDe: "lead", janela: { aberta: true, fechaEm: NOW + 23 * H, fechouEm: null, ultimaDoLead: NOW - H } },
  { fone: F.INV, nome: "Numero Invalido", estagio: "novo", humano: false, pausado: false, ts: NOW - 4 * D, previa: "Oi", ultimaDe: "ana", numeroInvalido: true, numeroInvalidoCodigo: 131026, janela: { aberta: false, fechaEm: null, fechouEm: null, ultimaDoLead: null } },
];
for (let k = 0; k < 8; k++) conv.push({ fone: "55629" + String(10000000 + k), nome: "Fila " + k, estagio: "perguntou_cnpj", humano: false, pausado: false, ts: NOW - (30 + k) * 60000, previa: "msg " + k, ultimaDe: "lead", janela: { aberta: true, fechaEm: NOW + (20 - k) * H, fechouEm: null, ultimaDoLead: NOW - (4 + k) * H } });
const base = (x) => ({ ok: true, humano: false, pausado: false, estagio: "novo", pendentes: 0, hist: [], nome: "", notas: [], log: [], dados: {}, ...x });
const fichaDe = (f) => { const it = conv.find((c) => c.fone === f) || {}; const x = { nome: it.nome, humano: it.humano, pausado: it.pausado, estagio: it.estagio, janela: it.janela, atendimento: it.atendimento, atendimentoProva: it.atendimentoProva, repasse: it.repasse, entrega: it.entrega, empresa: it.empresa ? { razao: it.empresa, fantasia: it.empresa, municipio: "Goiania", uf: "GO", idadeAnos: 8, situacao: "ATIVA", cnaeDescricao: "Comercio atacadista de produtos alimenticios em geral" } : null };
  if (f === F.NAT) { x.formulario = { nome: "Natalia", telefone: "559992320998", origem: "rede_farma", campanha: null, entrouEm: NOW - 14 * H, campos: { empresaCadastro: "Farma Bem Drogaria e Perfumaria Ltda", cnpj: "00.000.000/0001-00", segmentoProvavel: { valor: "farmacia", fonte: "cnpj" }, tentouEm: NOW - 14 * H, origemPagina: "rede_farma", primeiraMensagemDoLead: "Quero saber mais sobre o projeto Mega Vision USA para a minha rede de farmacias em Goiania e regiao", modeloDeAbertura: { modelo: "abertura_v2", texto: "Oi Natalia! Aqui e a Ana, da Life B.", ts: NOW - 2 * H }, jaCliente: false, emAtendimento: null } }; x.hist = [{ de: "ana", ts: NOW - 2 * H, texto: "Oi, tudo bem?" }]; }
  else if (f === F.REP) { x.notas = [{ texto: "Passada manualmente ao Felipe (negocio 4242)", ts: T_REP, quem: "Robert" }]; x.instrucoes = [{ texto: "Nao oferecer desconto antes da proposta", ts: NOW - H, quem: "Robert" }]; x.hist = [{ de: "lead", ts: NOW - 3 * D, texto: "quero falar com alguem" }]; }
  else if (f === F.LONGO) { x.hist = [{ de: "lead", ts: NOW - 20 * H, texto: it.previa }, { de: "humano", quem: "Felipe Cassiano", ts: NOW - 19 * H, texto: "Ola! Vou te ajudar com isso agora mesmo." }]; x.dados = { segmento: "farmacia", cnpj: "00.000.000/0001-00", faturamento: 250000, decisor: true }; }
  else x.hist = it.ultimaDe === "lead" ? [{ de: "lead", ts: it.ts, texto: it.previa }] : [{ de: "ana", ts: it.ts, texto: it.previa, tipo: "modelo", ent: it.entrega || it.numeroInvalido ? "failed" : "read" }];
  return base(x); };
const mock = () => B.criarMock({ expiraEm: Date.now() + 30 * D, agentes: () => { const a = B.agentesPadrao(); a.agentes[0].conversas = conv.map((x) => Object.assign({}, x)); a.agentes[0].auditoria = []; return a; }, conversa: (url) => fichaDe(url.searchParams.get("fone")) });
// auditoria dentro da pagina: devolve listas de problemas
const AUDITORIA = () => {
  const ax = document.querySelector(".ax"); if (!ax) return { erro: "sem .ax" };
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
  const nome = (e) => (e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (e.className && typeof e.className === "string" ? "." + e.className.trim().split(/\s+/).slice(0, 3).join(".") : "")) + " «" + (e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40) + "»";
  const INTENC = /(^|\.)(l1|emp|pv|sub2|fn|nm)(\.|$| )/;   // truncamento por reticencias de nome/empresa/previa/telefone: decisao de projeto (com title)
  const out = { cortado: [], estouro: [], sobreposto: [], contraste: [], alvo: [], vertical: [] };
  const ROLAVEIS = new Set(["rows", "ms", "fi", "fl", "lst", "ch", "mm"]);
  ax.querySelectorAll("*").forEach((e) => {
    if (!vis(e) || e.closest("svg") || e.closest(".mm") && false) return; const cs = getComputedStyle(e);
    if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0 && (cs.overflowX === "hidden" || cs.overflowX === "clip") && !(e.tagName === "I" || e.tagName === "SVG")) { const intenc = INTENC.test(nome(e).replace(/ «.*/, "")) || (e.parentElement && INTENC.test(nome(e.parentElement).replace(/ «.*/, ""))) || e.tagName === "B" && e.parentElement.className === "l1"; if (!intenc) out.cortado.push(nome(e) + " scrollW=" + e.scrollWidth + " clientW=" + e.clientWidth + " ov=" + cs.overflowX + " te=" + cs.textOverflow); }
    if (e.scrollHeight > e.clientHeight + 2 && e.clientHeight > 0 && (cs.overflowY === "hidden" || cs.overflowY === "clip") && !ROLAVEIS.has(String(e.className).split(" ")[0])) out.vertical.push(nome(e) + " scrollH=" + e.scrollHeight + " clientH=" + e.clientHeight);
  });
  // estouro: filhos que passam da borda direita/esquerda do painel rolavel onde estao
  [".fi", ".lst", ".ch"].forEach((sel) => { const p = ax.querySelector(sel); if (!p || !vis(p)) return; const pr = p.getBoundingClientRect(); p.querySelectorAll("*").forEach((e) => { if (!vis(e) || e.closest("svg")) return; const r = e.getBoundingClientRect(); if (r.right > pr.right + 1.5 && !e.closest(".fl.min") && !e.closest("#atFiltros") ) out.estouro.push(sel + " > " + nome(e) + " dir=" + Math.round(r.right - pr.right)); if (r.left < pr.left - 1.5) out.estouro.push(sel + " > " + nome(e) + " esq=" + Math.round(pr.left - r.left)); }); });
  const dw = document.documentElement.scrollWidth - document.documentElement.clientWidth; if (dw > 1) out.estouro.push("PAGINA com rolagem lateral +" + dw);
  // sobreposicao entre irmaos visiveis
  ax.querySelectorAll(".hd, .selosHd, .l1, .l3, .l4, .fl, .flw, .fh, .kv, .cb, .ac").forEach((pai) => { if (!vis(pai)) return; const k = [...pai.children].filter((c) => vis(c) && getComputedStyle(c).position !== "absolute"); for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) { const a = k[i].getBoundingClientRect(), b = k[j].getBoundingClientRect(); const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (w > 2 && h > 2) out.sobreposto.push(nome(pai).replace(/ «.*/, "") + ": " + nome(k[i]) + "  x  " + nome(k[j]) + " (" + Math.round(w) + "x" + Math.round(h) + ")"); } });
  // contraste de texto
  const L = (c) => { const m = c.match(/[\d.]+/g).map(Number); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); };
  const fundo = (e) => { let n = e; while (n) { const bg = getComputedStyle(n).backgroundColor; const m = bg.match(/[\d.]+/g); if (m && (m.length === 3 || Number(m[3]) > 0.95)) return bg; n = n.parentElement; } return "rgb(255,255,255)"; };
  const visto = new Set();
  const w = document.createTreeWalker(ax, NodeFilter.SHOW_TEXT); let tn; while ((tn = w.nextNode())) { const t = tn.textContent.trim(); if (!t) continue; const e = tn.parentElement; if (!vis(e) || e.closest("svg") || e.closest("textarea,input")) continue; const cs = getComputedStyle(e); const a = L(cs.color), b = L(fundo(e)); const r = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); const grande = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && Number(cs.fontWeight) >= 700); if (r < (grande ? 3 : 4.5)) { const key = nome(e).replace(/ «.*/, "") + r.toFixed(1); if (!visto.has(key)) { visto.add(key); out.contraste.push(nome(e) + " razao=" + r.toFixed(2)); } } }
  return out; };
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] }); const rel = {};
  for (const [w, h, nomeVp] of [[1440, 900, "1440"], [1280, 800, "1280"], [1024, 768, "1024"], [390, 780, "cel390"]]) for (const tema of ["light", "dark"]) {
    const rot = nomeVp + "_" + tema; const mob = w < 700;
    try {
      const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema, hasTouch: mob }); await ctx.addInitScript(() => { window.__CENTRAL_TESTE = true; try { localStorage.setItem("central_at_filtros:robert@x.com", "1"); } catch (e) {} });
      const p = await B.novaPagina(ctx, mock()); await B.entrar(p, "#atendimento"); await p.waitForSelector("#atItens .ri", { timeout: 12000 }); await p.waitForTimeout(500); const r = {};
      r.lista = await p.evaluate(AUDITORIA); await p.screenshot({ path: `${PR}/lista_${rot}.png` });
      // filtros recolhidos (se existir a barra; na pagina antiga nao existe)
      const temBarra = await p.$("#atFiltrosBt"); if (temBarra) { await p.click("#atFiltrosBt"); await p.waitForTimeout(250); r.listaRecolhida = await p.evaluate(AUDITORIA); await p.screenshot({ path: `${PR}/lista_filtros_recolhidos_${rot}.png` }); await p.click("#atFiltrosBt"); await p.waitForTimeout(200); }
      for (const [fone, rotulo] of [[F.SEM, "ficha_sem_fala"], [F.NAT, "ficha_formulario"], [F.REP, "ficha_repassada"], [F.MET, "ficha_meta"], [F.LONGO, "ficha_nome_longo"], [F.INV, "ficha_numero_invalido"]]) {
        await p.evaluate((f) => { location.hash = "#atendimento-" + f; }, fone); await p.waitForSelector("#atChat .hd", { timeout: 8000 }); await p.waitForTimeout(500);
        if (w <= 1320) { const fx = await p.$("#atChat .hd .ib.fx"); if (fx) { await fx.click(); await p.waitForTimeout(350); } }
        r[rotulo] = await p.evaluate(AUDITORIA); await p.screenshot({ path: `${PR}/${rotulo}_${rot}.png` });
        if (w <= 1320) await p.evaluate(() => document.querySelector(".ax").classList.remove("fichaOn"));
        const fch = await p.$("#atFicha"); if (fch && (await fch.isVisible()) && fone === F.SEM) { await fch.screenshot({ path: `${PR}/ficha_so_o_painel_${rot}.png` }).catch(() => {}); }
        await p.evaluate(() => { const a = document.querySelector(".ax"); if (a) a.classList.remove("chatAberto"); });
      }
      rel[rot] = r; await ctx.close();
    } catch (e) { S.F("EXCECAO " + rot + ": " + String(e.message).split("\n")[0].slice(0, 200)); }
  }
  // consolida
  let total = 0; const tipos = {}; for (const [rot, r] of Object.entries(rel)) for (const [tela, o] of Object.entries(r)) for (const [tipo, arr] of Object.entries(o || {})) if (Array.isArray(arr)) { total += arr.length; tipos[tipo] = (tipos[tipo] || 0) + arr.length; arr.slice(0, 6).forEach((m) => S.ok(false, `[${rot}] ${tela}: ${tipo}: ${m}`)); S.ok(arr.length === 0, `[${rot}] ${tela}: ${tipo} = ${arr.length}`); }
  if (process.env.AUDIT_JSON) fs.writeFileSync(process.env.AUDIT_JSON, JSON.stringify(rel, null, 1)); console.log("AUDITORIA: " + Object.keys(rel).length + " combinacoes; problemas por tipo: " + JSON.stringify(tipos) + "; total " + total);
  S.fim(); await b.close();
})();
