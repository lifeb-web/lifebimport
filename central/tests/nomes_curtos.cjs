// Central: NOMES CURTOS (Robert #1053). Pessoa = no máx. 2 palavras (primeiro + último); empresa = até 4 palavras com corte inteligente; empresa aparece no card e no cabeçalho assim que existir (CNPJ já no cadastro ou passado na conversa). Layout em 390/768/1024/1440, claro e escuro, nomes absurdos.
// Rodar: node central/tests/nomes_curtos.cjs <playwright-core> <chromium> [pasta-prints]
const { chromium } = require(process.argv[2]); const B = require("./_base.cjs"); const T = B.suite("nomes_curtos"); const fs = require("fs"); const path = require("path");
const OUT = process.argv[4] || process.env.NOMES_OUT || "/tmp/central-prints-nomes"; fs.mkdirSync(OUT, { recursive: true });
const DOZE = "Joao Pedro Carlos Eduardo Maria Silva Santos Souza Lima Costa Pereira Ferreira";
const CASOS = [ // [fone, nome, empresa, esperaNome, esperaEmpresa]
  ["5562999990001", "Erick Ricardo Marques de Oliveira", "Drogaria Central de Goiânia Ltda ME", "Erick Oliveira", "Drogaria Central de Goiânia…"],
  ["5562999990002", "Maria", "Farmácia do Povo de Anápolis e Região", "Maria", "Farmácia do Povo…"],
  ["5562999990003", DOZE, "Mercado Bom Preço", "Joao Ferreira", "Mercado Bom Preço"],
  ["5562999990004", "😀 Fulano de Tal 😀", "Casa 😀 do Pão", "😀 😀", "Casa 😀 do Pão"],
  ["5562999990005", "", "", "+55 (62) 99999-0005", ""],
  ["5562999990006", "5562999990006", "Super", "5562999990006", "Super"],
  ["5562999990007", "  Ana    Paula  ", "A".repeat(80), "Ana Paula", "A".repeat(80)],
  ["5562999990008", "Ricardo" + "o".repeat(70), "Rede de Farmácias e Drogarias Popular do Brasil", "Ricardo" + "o".repeat(70), "Rede de Farmácias…"],
  ["5562999990009", "Ana de Souza", "Padaria Estrela do Sul", "Ana Souza", "Padaria Estrela do Sul"],
];
const comEmpresa = new Set(["5562999990001", "5562999990002", "5562999990003", "5562999990004", "5562999990006", "5562999990007", "5562999990008", "5562999990009"]);
function agentes() { return B.agentesPadrao({ conversas: CASOS.map((c, i) => ({ fone: c[0], nome: c[1], estagio: "perguntou_cnpj", humano: false, pausado: false, ts: B.T0 - i * 60000, previa: "mensagem " + i, ultimaDe: "lead", ...(i % 2 === 0 && c[2] ? { empresa: { fantasia: c[2] } } : {}) })) }); }
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  for (const tema of ["light", "dark"]) for (const [w, h] of [[390, 844], [768, 1024], [1024, 768], [1440, 900]]) {
    const tag = `[${w} ${tema}]`; const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema }); await ctx.addInitScript((t) => { try { localStorage.setItem("central_tema", t); } catch (e) {} }, tema);
    let chegouCnpj = false;
    const m = B.criarMock({ agentes: agentes, conversa: (url) => { const f = url.searchParams.get("fone"); const c = CASOS.find((x) => x[0] === f) || CASOS[0]; const emp = comEmpresa.has(f) ? (f === "5562999990002" && !chegouCnpj ? null : { fantasia: c[2], razao: c[2].toUpperCase() + " LTDA", municipio: "Goiânia", uf: "GO" }) : null; return { ok: true, humano: false, pausado: false, estagio: "perguntou_cnpj", pendentes: 0, hist: [{ de: "lead", ts: B.T0 - 1000, texto: "oi" }], nome: c[1], notas: [], log: [], dados: { cnpj: emp ? "12345678000190" : null }, empresa: emp }; } });
    const p = await B.novaPagina(ctx, m); await B.entrar(p, "#atendimento"); await p.waitForSelector("#atItens .ri", { timeout: 8000 }); await p.waitForTimeout(400);
    const rows = await p.$$eval("#atItens .ri", (rs) => rs.map((r) => ({ fone: r.dataset.fone, nome: r.querySelector(".l1 b").textContent, empresa: (r.querySelector(".emp") || {}).textContent || null, empTitle: (r.querySelector(".emp") || {}).title || null, nomeTitle: r.querySelector(".l1 b").title, sw: r.scrollWidth, cw: r.clientWidth, rect: (() => { const q = r.getBoundingClientRect(); const l = document.getElementById("atItens").getBoundingClientRect(); return q.right <= l.right + 1 && q.left >= l.left - 1; })(), b: (() => { const e = r.querySelector(".l1 b"); return e.scrollWidth <= e.clientWidth + 1 || getComputedStyle(e).textOverflow === "ellipsis"; })() })));
    for (const c of CASOS) { const r = rows.find((x) => x.fone === c[0]); if (!r) { T.F(`${tag} linha ${c[0]} ausente`); continue; }
      T.ok(r.nome === c[3], `${tag} nome "${c[1]}" -> "${r.nome}" (esperado "${c[3]}")`); if (c[1] && r.nome !== c[1].replace(/\s+/g, " ").trim()) T.ok(r.nomeTitle === c[1].replace(/\s+/g, " ").trim(), `${tag} nome completo no tooltip: "${r.nomeTitle}"`);
      const esperaEmp = (Number(c[0].slice(-1)) % 2 === 1 ? c[0] : null) && null; // empresa só vem na lista dos pares; os demais aparecem depois de abrir a conversa
      if (r.empresa !== null) { T.ok(r.empresa === c[4], `${tag} empresa "${c[2]}" -> "${r.empresa}" (esperado "${c[4]}")`); if (c[4].endsWith("…")) T.ok(r.empTitle === c[2], `${tag} empresa completa no tooltip: "${r.empTitle}"`); T.ok(r.empresa.split(" ").length <= 4 || c[2].length > 40, `${tag} empresa com mais de 4 palavras`); T.ok(!/\s(de|da|do|das|dos|e)…$/i.test(r.empresa), `${tag} empresa cortada num conector: ${r.empresa}`); }
      T.ok(r.sw <= r.cw + 1, `${tag} linha ${c[0]} estourou a largura (${r.sw} > ${r.cw})`); T.ok(r.rect, `${tag} linha ${c[0]} fora da lista`); T.ok(r.b, `${tag} nome ${c[0]} sem corte de segurança`); }
    T.ok(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `${tag} rolagem lateral na lista`);
    await p.screenshot({ path: path.join(OUT, `lista-${w}-${tema}.png`) });
    // abrir cada conversa: cabeçalho curto, empresa no cabeçalho, tooltips, sem estourar
    for (const c of CASOS) { await p.evaluate((f) => { location.hash = "#atendimento-" + f; }, c[0]); await p.waitForFunction((f) => document.querySelector(".ax .hd .nm b") && /./.test(document.querySelector(".ax .hd .nm b").textContent), c[0]); await p.waitForTimeout(450);
      if (c[0] === "5562999990002") { chegouCnpj = true; await p.waitForTimeout(5200); }   // o lead "passou o CNPJ": a empresa aparece sozinha no próximo ciclo
      const hd = await p.evaluate(() => { const n = document.querySelector(".ax .hd .nm"); const b = n.querySelector("b"), s = n.querySelector("span"); const hd = document.querySelector(".ax .hd").getBoundingClientRect(); const r = n.getBoundingClientRect(); return { nome: b.textContent, sub: s.textContent, bt: b.title, st: s.title, dentro: r.right <= hd.right + 1, lateral: document.documentElement.scrollWidth > innerWidth, altura: Math.round(hd.height) }; });
      T.ok(hd.nome === c[3], `${tag} cabeçalho de "${c[1]}": "${hd.nome}"`); T.ok(hd.dentro && !hd.lateral, `${tag} cabeçalho de ${c[0]} estoura: ${JSON.stringify(hd)}`); if (comEmpresa.has(c[0])) T.ok(hd.sub.startsWith(c[4]), `${tag} cabeçalho sem a empresa "${c[4]}": "${hd.sub}"`); else T.ok(!/Ltda|undefined|null/i.test(hd.sub), `${tag} cabeçalho sem empresa estranho: ${hd.sub}`);
      if (comEmpresa.has(c[0]) && c[4].endsWith("…")) T.ok(hd.st.includes(c[2]), `${tag} tooltip do cabeçalho sem a empresa completa`); if (c[2] && c[0] === CASOS[0][0]) await p.screenshot({ path: path.join(OUT, `cabecalho-${w}-${tema}.png`) }); }
    // depois de abrir, a empresa aparece também na LISTA para as que não vinham com ela
    if (w >= 1024) { await p.evaluate(() => { location.hash = "#atendimento"; }); await p.waitForTimeout(300); }
    const aposAbrir = await p.$$eval("#atItens .ri", (rs) => rs.map((r) => ({ fone: r.dataset.fone, empresa: (r.querySelector(".emp") || {}).textContent || null }))); const faltam = CASOS.filter((c) => comEmpresa.has(c[0])).filter((c) => !(aposAbrir.find((r) => r.fone === c[0]) || {}).empresa); if (w >= 1024) T.ok(!faltam.length, `${tag} empresa não apareceu na lista após abrir: ${faltam.map((c) => c[0])}`);
    T.ok(!aposAbrir.some((r) => r.fone === "5562999990005" && r.empresa), `${tag} lead sem empresa ganhou empresa`);
    if (w >= 1024) await p.screenshot({ path: path.join(OUT, `lista-depois-${w}-${tema}.png`) }); T.ok(!(p._erros || []).length, `${tag} erros: ${p._erros}`); await ctx.close();
  }
  await b.close(); T.fim(" · prints em " + OUT);
})();
