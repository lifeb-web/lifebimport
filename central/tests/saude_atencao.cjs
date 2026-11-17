// Central 17/11 (#2348): a Visão NÃO pode listar 'pede atenção' para itens de saúde 'ok' (bug do if sem chaves). Todos ok => lista vazia e 'operando normalmente'; 1 item em atenção => só ele, com detalhe ou 'Detalhes indisponíveis agora'.
// Rodar: node central/tests/saude_atencao.cjs <playwright-core> <chromium>
const B = require("./_base.cjs"); const { chromium } = require(process.argv[2]); const S = B.suite("saude_atencao");
const ITENS_OK = { rotinas: { nivel: "ok" }, envios: { nivel: "ok" }, agendor: { nivel: "ok" }, fila: { nivel: "ok" } };
async function cena(b, nome, saude, detalhe) {
  const ctx = await b.newContext({ viewport: { width: 1366, height: 800 } });
  const mock = B.criarMock({ over: async (u) => { if (u === "/bia-saude") return { json: saude }; if (u === "/saude") return detalhe; return null; } });
  const p = await B.novaPagina(ctx, mock); await B.entrar(p, "#visao"); await p.waitForTimeout(1500);
  const txt = await p.evaluate(() => document.getElementById("conteudo").innerText); await ctx.close(); return { txt, errs: p._erros };
}
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  let r = await cena(b, "todos_ok", { geral: "ok", ts: Date.now(), itens: ITENS_OK });
  S.ok(!/pede atenção/.test(r.txt) && !/Carregando os detalhes/.test(r.txt), "todos ok: nenhum 'pede atenção' / 'Carregando os detalhes' na Visão");
  S.ok(/operando normalmente/i.test(r.txt), "todos ok: mensagem de plataforma normal");
  r = await cena(b, "um_atencao", { geral: "atencao", ts: Date.now(), itens: { ...ITENS_OK, fila: { nivel: "atencao" } } }, { json: { ok: true, pontos: [{ k: "fila", texto: "Fila com 3 itens parados há 20 min." }] } });
  const n1 = (r.txt.match(/pede atenção/g) || []).length; S.ok(n1 === 1 && /Fila com 3 itens parados/.test(r.txt), "1 em atenção: só ele aparece, com o detalhe (" + n1 + ")");
  r = await cena(b, "sem_detalhe", { geral: "atencao", ts: Date.now(), itens: { ...ITENS_OK, fila: { nivel: "atencao" } } }, { status: 500, json: { ok: false } });
  const n2 = (r.txt.match(/pede atenção/g) || []).length; S.ok(n2 === 1 && /Detalhes indisponíveis agora/.test(r.txt) && !/Carregando os detalhes/.test(r.txt), "detalhe falhou: 'Detalhes indisponíveis agora (tentando de novo)', sem 'Carregando…' eterno (" + n2 + ")");
  r = await cena(b, "geral_ok_item_atencao", { geral: "ok", ts: Date.now(), itens: { ...ITENS_OK, envios: { nivel: "falha" } } }, { json: { ok: true, pontos: [{ k: "envios", texto: "Envios falhando." }] } });
  S.ok(/Envios falhando/.test(r.txt) && (r.txt.match(/pede atenção/g) || []).length === 1, "geral=ok mas item em falha: busca o detalhe mesmo assim");
  await b.close(); S.fim();
})();
