// Painel do Representante (molde dashboard-rep-template.html): suíte jsdom, 100% simulada (nenhuma chamada real, nenhuma escrita).
// Rodar: node source/tests-rep/painel_jsdom.cjs      (JSDOM=/caminho/jsdom e WORKER=/tmp/rep_wk/src/index.js opcionais)
// Exporta rodar(html) para a suíte de mutação (mutacao_painel.cjs) provar que os testes pegam defeito de verdade.
const fs = require('fs'); const path = require('path');
const JSDOM_PATH = process.env.JSDOM || '/private/tmp/jsd/node_modules/jsdom';
const { JSDOM, VirtualConsole } = require(JSDOM_PATH);
const F = require('./fixture.cjs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const R = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
function gerar(html0) { return html0.split('__REP_NAME__').join('TESTE').split('__REP_DISPLAY__').join('Teste').split('__REP_TOKEN__').join('tok-teste'); }

function boot(html, { leads, post, storage = {}, ua = 'Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile' } = {}) {
  const erros = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => erros.push(String(e.message || e).slice(0, 200)));
  const posts = []; const gets = [];
  let leadsAtual = leads || (() => F.carteira());
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://projetojlbv.com.br/rep/dash/teste/', virtualConsole: vc,
    beforeParse(w) {
      for (const [k, v] of Object.entries(storage)) w.localStorage.setItem(k, v);
      w.fetch = async (url, o = {}) => {
        const u = new URL(String(url)); const m = (o.method || 'GET').toUpperCase();
        if (m === 'POST') {
          const b = JSON.parse(o.body || '{}'); posts.push({ p: u.pathname, body: b });
          if (post) { const r = await post(u.pathname, b); if (r) return R(r.status || 200, r.body); }
          return R(200, { ok: true, dealId: b.dealId });
        }
        gets.push(u.pathname);
        if (u.pathname === '/leads') return R(200, { ok: true, leads: leadsAtual() });
        if (u.pathname === '/metrics') return R(200, { ok: true, ganhos: 1, valorVendido: 100, ticketMedio: 100 });
        return R(200, { ok: true, itens: [], historico: [] });
      };
      w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
      w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {};
      w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
      Object.defineProperty(w.navigator, 'userAgent', { value: ua, configurable: true });
    },
  });
  const w = dom.window;
  return { dom, w, erros, posts, gets, setLeads: f => { leadsAtual = f; } };
}
const clk = (w, sel) => { const e = w.document.querySelector(sel); if (!e) throw new Error('não achei ' + sel); e.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };

async function rodar(htmlTpl) {
  const html = gerar(htmlTpl);
  let n = 0; const falhas = [];
  const chk = (nome, cond) => { n++; if (!cond) falhas.push(nome); };
  const eq = (nome, a, b) => { n++; if (JSON.stringify(a) !== JSON.stringify(b)) falhas.push(nome + ' got=' + JSON.stringify(a) + ' esp=' + JSON.stringify(b)); };

  // ───────── A. funções puras (tabelas escritas à mão a partir da regra) ─────────
  {
    const { w } = boot(html); await sleep(400);
    const ev = s => w.eval(s);
    const AG = Date.UTC(2026, 10, 19, 15, 0, 0);     // 19/11/2026 12:00 em Brasília
    eq('A hojeBRT', ev(`_hojeBRT(${AG})`), '2026-11-19');
    eq('A hojeBRT 01:00 UTC ainda é o dia anterior', ev(`_hojeBRT(${Date.UTC(2026, 10, 19, 1)})`), '2026-11-18');
    eq('A hojeBRT 02:59 UTC', ev(`_hojeBRT(${Date.UTC(2026, 10, 19, 2, 59)})`), '2026-11-18');
    eq('A hojeBRT 03:00 UTC vira o dia', ev(`_hojeBRT(${Date.UTC(2026, 10, 19, 3, 0)})`), '2026-11-19');
    const U = (l) => ev(`JSON.stringify(_urgenciaDe(${JSON.stringify(l)}, '2026-11-19'))`);
    const tabelaU = [
      [{ tarefaAberta: null }, 0], [{}, 0], [{ tarefaAberta: { dueDate: '2026-11-18T09:00:00' } }, 0], [{ tarefaAberta: { dueDate: '2026-01-01' } }, 0],
      [{ tarefaAberta: { dueDate: '2026-11-19T08:00:00' } }, 1], [{ tarefaAberta: { dueDate: '2026-11-19' } }, 1], [{ tarefaAberta: { dueDate: '2026-11-20T09:00:00' } }, 2],
      [{ tarefaAberta: { dueDate: '2027-02-01' } }, 2], [{ tarefaAberta: { id: 1 } }, 1], [{ tarefaAberta: { dueDate: 'lixo' } }, 1], [{ tarefaAberta: { dueDate: '' } }, 1],
    ];
    tabelaU.forEach(([l, f], i) => eq('A faixa ' + i, JSON.parse(U(l)).faixa, f));
    const T = (l, ms) => JSON.parse(ev(`JSON.stringify(_urgenciaTexto(${JSON.stringify(l)}, ${ms}))`));
    eq('A texto sem tarefa', T({ tarefaAberta: null }, AG).texto, 'Sem tarefa marcada. Marque o próximo contato.');
    eq('A texto atrasada 1 dia', T({ tarefaAberta: { dueDate: '2026-11-18T09:00:00' } }, AG).texto, 'Tarefa atrasada há 1 dia.');
    eq('A texto atrasada 3 dias', T({ tarefaAberta: { dueDate: '2026-11-16T09:00:00' } }, AG).texto, 'Tarefa atrasada há 3 dias.');
    eq('A texto atrasada 30 dias', T({ tarefaAberta: { dueDate: '2026-10-20' } }, AG).texto, 'Tarefa atrasada há 30 dias.');
    eq('A texto hoje com hora', T({ tarefaAberta: { dueDate: '2026-11-19T14:30:00' } }, AG).texto, 'Tarefa para hoje às 14:30.');
    eq('A texto hoje sem hora', T({ tarefaAberta: { dueDate: '2026-11-19' } }, AG).texto, 'Tarefa para hoje.');
    eq('A texto futura dd/mm/aaaa', T({ tarefaAberta: { dueDate: '2026-12-02T09:00:00' } }, AG).texto, 'Próxima tarefa em 02/12/2026.');
    eq('A texto sem data', T({ tarefaAberta: { id: 3 } }, AG).texto, 'Tarefa sem data. Confira quando fazer.');
    chk('A texto nunca mostra data ISO', !/\d{4}-\d{2}-\d{2}/.test(T({ tarefaAberta: { dueDate: '2026-12-02' } }, AG).texto));
    eq('A dataBR', ev(`_dataBR('2026-01-05')`), '05/01/2026'); eq('A dataBR inválida', ev(`_dataBR('x')`), ''); eq('A dataBR vazia', ev(`_dataBR('')`), '');
    // modos do quadro
    const M = l => ev(`_tipoGanhoModo(${JSON.stringify(l)})`);
    eq('A modo reposição', M({ tipo_negocio: 'reposicao' }), 'reposicao'); eq('A modo reativação', M({ tipo_negocio: 'reativacao' }), 'reativacao');
    eq('A modo já comprou', M({ tipo_negocio: 'venda', ja_comprou: true }), 'jacomprou'); eq('A modo venda comum', M({ tipo_negocio: 'venda', ja_comprou: false }), null);
    eq('A modo só com funil_tag (cache de versão antiga)', M({ funil_tag: 'reposicao' }), 'reposicao'); eq('A modo funil_tag reativacao75', M({ funil_tag: 'reativacao75' }), 'reativacao'); eq('A modo funil_tag vazio', M({ funil_tag: '' }), null);
    eq('A modo lead nulo', ev('_tipoGanhoModo(null)'), null); eq('A modo ja_comprou string não vale', M({ ja_comprou: 'true' }), null); eq('A modo reposição vence jacomprou', M({ tipo_negocio: 'reposicao', ja_comprou: true }), 'reposicao');
    // erros em português claro
    const E = (m, s) => ev(`_erroAmigavel(${JSON.stringify(m)}, ${s})`);
    chk('A erro 429', /ocupado/.test(E('Erro 429', 429))); chk('A erro 502', /fora do ar/.test(E('Erro 502', 502))); chk('A erro 503 texto', /fora do ar/.test(E('HTTP 503', undefined)));
    chk('A erro timeout', /Sem sinal/.test(E('Tempo esgotado', undefined))); chk('A erro rede', /Sem sinal/.test(E('Sem conexão', undefined))); chk('A erro 403', /permissão/.test(E('x', 403)));
    chk('A erro 404', /não foi encontrado/.test(E('x', 404))); chk('A erro Agendor não confirmou', /não confirmou/.test(E('Agendor nao confirmou o ganho na releitura', 502)) && !/Agendor/.test(E('Agendor nao confirmou o ganho na releitura', 502)));
    eq('A erro sinal interno intocado', E('operacao_em_andamento', 409), 'operacao_em_andamento'); chk('A erro troca Agendor por CRM', E('falha no Agendor X', 400) === 'falha no CRM X');
    chk('A erro vazio não lança', E('', undefined) === '' && E(null, undefined) === '');
    // modal: texto
    const fat = { cliente: 'Farma Vida', valor: 'R$ 5.200', data: '19/11/2026' };
    const H = (modo, tela) => ev(`_tipoModalHtml(${JSON.stringify(modo)}, ${JSON.stringify(fat)}, ${JSON.stringify(tela)})`);
    const hr = H('reposicao', 'pergunta');
    chk('A modal reposição: título', /Isto é uma REPOSIÇÃO/.test(hr)); chk('A modal: pergunta', /Confirma que é reposição e não uma venda nova\?/.test(hr));
    chk('A modal: botão Sim', /Sim, é reposição/.test(hr)); chk('A modal: botão Não', /Não, é venda nova/.test(hr));
    chk('A modal: mostra cliente, valor e data', /Farma Vida/.test(hr) && /R\$ 5\.200/.test(hr) && /19\/11\/2026/.test(hr));
    chk('A modal: cliente que já comprou', /Cliente que já comprou/.test(hr));
    const hv = H('reativacao', 'pergunta'); chk('A modal reativação', /REATIVAÇÃO/.test(hv) && /Sim, é reativação/.test(hv));
    const hj = H('jacomprou', 'pergunta'); chk('A modal já comprou: pergunta', /venda nova ou uma reposição/.test(hj)); chk('A modal já comprou: 2 botões', /data-acao="venda_nova"/.test(hj) && /data-acao="reposicao"/.test(hj));
    const hn = H('reposicao', 'nada'); chk('A modal nada: diz que nada foi marcado', /Nada foi marcado/.test(hn) && /Entendi/.test(hn));
    chk('A modal nunca cita Agendor', !/Agendor/i.test(hr + hv + hj + hn));
    const hx = ev(`_tipoModalHtml('reposicao', {cliente:'<img src=x onerror=alert(1)>', valor:'R$ 1', data:'x'}, 'pergunta')`); chk('A modal escapa HTML do cliente', !/<img/.test(hx));
    // próximo
    const L = (row, extra) => Object.assign({ row, status: 'Aguardando contato', pot: 0, tarefaAberta: null }, extra);
    const P = (ls, ms) => JSON.parse(ev(`JSON.stringify(_proximoDaFila(_ordenarFilaLocal(${JSON.stringify(ls)}, ${ms}), ${ms}))`));
    const p1 = P([L(1, { tarefaAberta: { dueDate: '2026-11-25' } }), L(2, { tarefaAberta: { dueDate: '2026-11-17' } }), L(3, { tarefaAberta: { dueDate: '2026-11-19T10:00:00' } })], AG);
    eq('A próximo = o mais atrasado', p1.lead.row, 2); eq('A contagem atrasados', p1.atrasados, 1); eq('A contagem hoje', p1.hoje, 1);
    const p2 = P([L(1, { tarefaAberta: { dueDate: '2026-11-25' } }), L(2, { tarefaAberta: { dueDate: '2026-12-01' } })], AG);
    eq('A nada urgente → sem próximo', p2.lead, null); eq('A próxima tarefa em', p2.proxTarefa, '25/11/2026');
    eq('A lista vazia', P([], AG).lead, null);
    eq('A sem tarefa vira próximo', P([L(9)], AG).lead.row, 9);
    eq('A SuperAgos futuro não é "próximo" falso', P([L(1, { superagos: true, tarefaAberta: { dueDate: '2026-12-25' } }), L(2, { tarefaAberta: { dueDate: '2026-11-10' } })], AG).lead.row, 2);
    // ordenação: tabela
    const O = (ls, ms) => JSON.parse(ev(`JSON.stringify(_ordenarFilaLocal(${JSON.stringify(ls)}, ${ms}).map(l=>l.row))`));
    eq('A ordem: sem tarefa, atrasada, hoje, futura', O([L(1, { tarefaAberta: { dueDate: '2026-11-30' } }), L(2, { tarefaAberta: { dueDate: '2026-11-19T15:00:00' } }), L(3, { tarefaAberta: { dueDate: '2026-11-10' } }), L(4)], AG), [4, 3, 2, 1]);
    eq('A ordem: mais atrasada primeiro', O([L(1, { tarefaAberta: { dueDate: '2026-11-15' } }), L(2, { tarefaAberta: { dueDate: '2026-11-01' } })], AG), [2, 1]);
    eq('A ordem: empate do dia → maior valor', O([L(1, { pot: 100, tarefaAberta: { dueDate: '2026-11-15' } }), L(2, { pot: 900, tarefaAberta: { dueDate: '2026-11-15' } })], AG), [2, 1]);
    eq('A ordem: hoje por horário', O([L(1, { tarefaAberta: { dueDate: '2026-11-19T16:00:00' } }), L(2, { tarefaAberta: { dueDate: '2026-11-19T09:00:00' } })], AG), [2, 1]);
    eq('A ordem: SuperAgos sempre no topo', O([L(1), L(2, { superagos: true, tarefaAberta: { dueDate: '2026-12-30' } })], AG), [2, 1]);
    eq('A ordem: negociação atrasada sobe', O([L(1, { tarefaAberta: { dueDate: '2026-11-25' } }), L(2, { status: 'Em negociação', pot: 50000, tarefaAberta: { dueDate: '2026-11-10' } })], AG), [2, 1]);
    eq('A ordem: empate total → row crescente (estável)', O([L(5), L(3), L(4)], AG), [3, 4, 5]);
    eq('A ordem: não muta a entrada', JSON.parse(ev(`(function(){const a=[{row:2,tarefaAberta:null},{row:1,tarefaAberta:{dueDate:'2026-11-10'}}];_ordenarFilaLocal(a, ${AG});return JSON.stringify(a.map(x=>x.row))})()`)), [2, 1]);
    eq('A ordem: vazio', O([], AG), []); eq('A ordem: undefined', JSON.parse(ev(`JSON.stringify(_ordenarFilaLocal(undefined, ${AG}))`)), []);
    w.close();
  }

  // ───────── B. cópia idêntica ao servidor: 1500 sequências aleatórias (semente fixa) ─────────
  {
    let ordenarFila = null;
    try { ordenarFila = (await import(process.env.WORKER || '/tmp/rep_wk/src/index.js')).ordenarFila; } catch (e) { falhas.push('B não consegui importar o servidor: ' + e.message); }
    if (ordenarFila) {
      const { w } = boot(html); await sleep(300);
      let sd = 12345; const rnd = () => { sd = (sd * 1664525 + 1013904223) % 4294967296; return sd / 4294967296; };
      const AG = Date.UTC(2026, 10, 19, 15, 0, 0);
      const dias = ['2026-11-01', '2026-11-18', '2026-11-19', '2026-11-20', '2026-12-10'];
      let difs = 0;
      for (let k = 0; k < 1500; k++) {
        const nn = 2 + Math.floor(rnd() * 8); const ls = [];
        for (let i = 0; i < nn; i++) {
          const temT = rnd() > 0.2; const d = dias[Math.floor(rnd() * dias.length)]; const hh = rnd() > 0.5 ? 'T' + String(8 + Math.floor(rnd() * 10)).padStart(2, '0') + ':00:00' : '';
          const neg = rnd() > 0.7; const valor = Math.floor(rnd() * 4) * 1000; const sa = rnd() > 0.92; const upd = 1.7e12 + Math.floor(rnd() * 5) * 86400000;
          ls.push({ id: 100 + i, t: temT ? d + hh : null, neg, valor, sa, upd });
        }
        const srv = ls.map(x => ({ dealId: x.id, bucket: x.neg ? 'negociacao' : 'aguardando', superagos: x.sa, valorPotencial: x.valor, atualizadoEm: new Date(x.upd).toISOString(), tarefaAberta: x.t ? { dueDate: x.t } : null }));
        const cli = ls.map(x => ({ row: x.id, status: x.neg ? 'Em negociação' : 'Aguardando contato', superagos: x.sa, pot: x.valor, ts_vend: x.upd, tarefaAberta: x.t ? { dueDate: x.t } : null }));
        const a = ordenarFila(srv, AG).map(l => l.dealId).join(); const b = w.eval(`_ordenarFilaLocal(${JSON.stringify(cli)}, ${AG}).map(l=>l.row).join()`);
        n++; if (a !== b) { difs++; if (difs <= 2) falhas.push('B servidor≠página: ' + a + ' | ' + b); }
      }
      if (difs) falhas.push('B total de divergências: ' + difs);
      w.close();
    }
  }

  // ───────── C. fluxos de ganho / reposição ─────────
  async function ganhar(opts, row, valor, depois) {
    const ctx = boot(html, opts); await sleep(450);
    ctx.w._confirmarComJanela = (key, o) => { ctx.w._ultimaJanela = o; return o.executar(); };   // sem esperar os 6 s do Desfazer
    clk(ctx.w, `.lead-card[data-row="${row}"] .lc-status-btn.ganho`); await sleep(50);
    ctx.w.document.getElementById('sp-valor-' + row).value = String(valor);
    clk(ctx.w, '#sp-save-' + row); await sleep(150);
    await depois(ctx); ctx.w.close();
  }
  await ganhar({}, 102, 5200, async c => {
    const m = c.w.document.getElementById('tipo-modal');
    chk('C reposição: quadro aparece', !!m); chk('C reposição: role=dialog + aria-modal', m && m.getAttribute('role') === 'dialog' && m.getAttribute('aria-modal') === 'true');
    chk('C reposição: título ligado ao dialog', m && !!m.querySelector('#tm-titulo') && m.getAttribute('aria-labelledby') === 'tm-titulo');
    chk('C reposição: nada enviado ANTES da resposta', c.posts.length === 0);
    chk('C reposição: mostra Farma Vida', /Farma Vida/.test(m.textContent)); chk('C reposição: mostra valor', /R\$\s?5\.200/.test(m.textContent)); chk('C reposição: mostra data dd/mm/aaaa', /\d{2}\/\d{2}\/\d{4}/.test(m.textContent));
    chk('C reposição: foco dentro do quadro', m.contains(c.w.document.activeElement));
    clk(c.w, '#tipo-modal [data-acao="reposicao"]'); await sleep(200);
    const pst = c.posts.filter(p => p.p === '/status');
    eq('C Sim → 1 envio', pst.length, 1); eq('C Sim → tipoConfirmado reposicao', pst[0] && pst[0].body.tipoConfirmado, 'reposicao'); eq('C Sim → valor certo', pst[0] && pst[0].body.valor, 5200); eq('C Sim → acao ganho', pst[0] && pst[0].body.acao, 'ganho');
    chk('C quadro fechou', !c.w.document.getElementById('tipo-modal'));
  });
  await ganhar({}, 102, 5200, async c => {
    clk(c.w, '#tipo-modal [data-acao="venda_nova"]'); await sleep(100);
    const m = c.w.document.getElementById('tipo-modal'); chk('C Não → mostra "Nada foi marcado"', m && /Nada foi marcado/.test(m.textContent)); eq('C Não → ZERO envio', c.posts.length, 0);
    clk(c.w, '#tipo-modal [data-acao="entendi"]'); await sleep(100);
    eq('C Entendi → ZERO envio', c.posts.length, 0); chk('C Entendi fecha', !c.w.document.getElementById('tipo-modal'));
    chk('C Entendi: caixinha de valor fechou', !c.w.document.getElementById('sp-102').classList.contains('visible'));
  });
  await ganhar({}, 102, 5200, async c => {
    c.w.document.dispatchEvent(new c.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await sleep(100);
    chk('C Escape fecha o quadro', !c.w.document.getElementById('tipo-modal')); eq('C Escape → ZERO envio', c.posts.length, 0);
    chk('C Escape: valor digitado continua', c.w.document.getElementById('sp-valor-102').value === '5200' && c.w.document.getElementById('sp-102').classList.contains('visible'));
  });
  await ganhar({}, 102, 5200, async c => {
    clk(c.w, '#tipo-modal [data-acao="cancelar"]'); await sleep(100); eq('C ✕ → ZERO envio', c.posts.length, 0);
    chk('C ✕: valor digitado continua', c.w.document.getElementById('sp-valor-102').value === '5200');
  });
  await ganhar({}, 102, 5200, async c => {
    const ov = c.w.document.getElementById('tipo-modal'); ov.dispatchEvent(new c.w.MouseEvent('click', { bubbles: true })); await sleep(100);
    eq('C toque fora → ZERO envio', c.posts.length, 0); chk('C toque fora fecha', !c.w.document.getElementById('tipo-modal'));
  });
  await ganhar({}, 104, 3000, async c => {   // reativação
    const m = c.w.document.getElementById('tipo-modal'); chk('C reativação: quadro', m && /REATIVAÇÃO/.test(m.textContent) && /Sim, é reativação/.test(m.textContent));
    clk(c.w, '#tipo-modal [data-acao="reposicao"]'); await sleep(150); eq('C reativação Sim → tipoConfirmado', (c.posts.find(p => p.p === '/status') || { body: {} }).body.tipoConfirmado, 'reposicao');
  });
  await ganhar({}, 105, 1500, async c => {   // já comprou
    const m = c.w.document.getElementById('tipo-modal'); chk('C já comprou: quadro inverso', m && /já comprou antes/.test(m.textContent) && /venda nova ou uma reposição/.test(m.textContent));
    chk('C já comprou: 2 botões de peso igual', m.querySelectorAll('.tm-btn.igual').length === 2);
    clk(c.w, '#tipo-modal [data-acao="venda_nova"]'); await sleep(150);
    eq('C já comprou + venda nova → envia', (c.posts.find(p => p.p === '/status') || { body: {} }).body.tipoConfirmado, 'venda_nova');
  });
  await ganhar({}, 105, 1500, async c => {
    clk(c.w, '#tipo-modal [data-acao="reposicao"]'); await sleep(150);
    eq('C já comprou + reposição → envia reposicao', (c.posts.find(p => p.p === '/status') || { body: {} }).body.tipoConfirmado, 'reposicao');
  });
  await ganhar({}, 101, 8000, async c => {   // venda comum
    chk('C venda comum: SEM quadro', !c.w.document.getElementById('tipo-modal'));
    const pst = c.posts.find(p => p.p === '/status'); chk('C venda comum: envia direto', !!pst); chk('C venda comum: sem tipoConfirmado', pst && !('tipoConfirmado' in pst.body));
  });
  await ganhar({}, 103, 30000, async c => { chk('C negociação comum: SEM quadro', !c.w.document.getElementById('tipo-modal')); });
  // valor inválido nunca abre o quadro
  {
    const c = boot(html); await sleep(400);
    clk(c.w, '.lead-card[data-row="102"] .lc-status-btn.ganho'); await sleep(50); c.w.document.getElementById('sp-valor-102').value = '0'; clk(c.w, '#sp-save-102'); await sleep(100);
    chk('C valor zero não abre o quadro', !c.w.document.getElementById('tipo-modal')); eq('C valor zero não envia', c.posts.length, 0);
    c.w.document.getElementById('sp-valor-102').value = ''; clk(c.w, '#sp-save-102'); await sleep(100); chk('C valor vazio não abre o quadro', !c.w.document.getElementById('tipo-modal'));
    // 2 cliques rápidos não empilham 2 quadros
    c.w.document.getElementById('sp-valor-102').value = '5200'; clk(c.w, '#sp-save-102'); clk(c.w, '#sp-save-102'); await sleep(100);
    eq('C duplo clique → 1 quadro só', c.w.document.querySelectorAll('#tipo-modal').length, 1); c.w.close();
  }

  // ───────── C2. valor suspeito (campo "de banco": 5200 vira R$ 52,00) ─────────
  {
    const { w } = boot(html); await sleep(300);
    const V = (v, p) => w.eval(`_valorSuspeito(${v}, ${p})`);
    [[52, 5200, true], [99, 0, true], [100, 0, false], [150, 0, false], [5200, 5200, false], [8000, 8000, false], [60000, 5200, true], [52000, 5200, true], [51999, 5200, false], [30000, 5200, false], [520, 5200, true], [521, 5200, false], [0, 5200, false], [-5, 100, false], [NaN, 100, false], [1e6, 0, false], [100, 100000, true]].forEach(([v, p, e], i) => eq('C2 suspeito ' + i + ' (' + v + ' / ' + p + ')', V(v, p), e));
    w.close();
  }
  await ganhar({}, 102, 52, async c => {
    const m = c.w.document.getElementById('tipo-modal'); chk('C2 valor 100x menor: quadro "O valor está certo?"', m && /O valor está certo\?/.test(m.textContent));
    chk('C2 mostra o digitado e o estimado', /R\$\s?52/.test(m.textContent) && /R\$\s?5\.200/.test(m.textContent)); chk('C2 explica os centavos', /centavos/.test(m.textContent));
    eq('C2 nada enviado antes da resposta', c.posts.length, 0);
    clk(c.w, '#tipo-modal [data-acao="corrigir"]'); await sleep(120);
    eq('C2 Corrigir → ZERO envio', c.posts.length, 0); chk('C2 Corrigir: valor continua na caixinha', c.w.document.getElementById('sp-valor-102').value === '52' && c.w.document.getElementById('sp-102').classList.contains('visible'));
    chk('C2 Corrigir: não abriu o quadro de reposição ainda', !c.w.document.getElementById('tipo-modal'));
  });
  await ganhar({}, 102, 52, async c => {
    clk(c.w, '#tipo-modal [data-acao="certo"]'); await sleep(150);
    const m = c.w.document.getElementById('tipo-modal'); chk('C2 "Está certo" segue para a pergunta de reposição', m && /Isto é uma REPOSIÇÃO/.test(m.textContent));
    clk(c.w, '#tipo-modal [data-acao="reposicao"]'); await sleep(150);
    const p = c.posts.find(x => x.p === '/status'); eq('C2 envia o valor confirmado', p && p.body.valor, 52); eq('C2 envia o tipo', p && p.body.tipoConfirmado, 'reposicao');
  });
  await ganhar({}, 101, 80, async c => {
    c.w.document.dispatchEvent(new c.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await sleep(100);
    eq('C2 Escape no quadro de valor → ZERO envio', c.posts.length, 0);
  });
  await ganhar({}, 101, 80, async c => {
    clk(c.w, '#tipo-modal [data-acao="certo"]'); await sleep(150);
    const p = c.posts.find(x => x.p === '/status'); chk('C2 venda comum com valor baixo confirmado: envia, sem tipoConfirmado', p && p.body.valor === 80 && !('tipoConfirmado' in p.body));
  });
  // rótulos do cartão
  {
    const c = boot(html); await sleep(450); const d = c.w.document;
    chk('C cartão reposição: aviso visível', /Reposição: cliente que já comprou/.test(d.querySelector('.lead-card[data-row="102"]').textContent));
    chk('C cartão reativação: aviso', /Reativação: cliente antigo/.test(d.querySelector('.lead-card[data-row="104"]').textContent));
    chk('C cartão já comprou: aviso', /já comprou antes/.test(d.querySelector('.lead-card[data-row="105"]').textContent));
    chk('C cartão comum: SEM aviso de ciclo', !d.querySelector('.lead-card[data-row="101"] .lc-ciclo-aviso'));
    chk('C botão da reposição diz "Ganho da reposição"', /Ganho da reposição/.test(d.querySelector('.lead-card[data-row="102"] .lc-status-btn.ganho').textContent));
    chk('C botão comum diz "Marcar Ganho"', /Marcar Ganho/.test(d.querySelector('.lead-card[data-row="101"] .lc-status-btn.ganho').textContent));
    eq('C sem erro de script', c.erros, []); c.w.close();
  }

  // ───────── D. erros do servidor / rede ─────────
  {
    const c = boot(html, { post: async (p, b) => p === '/status' ? { status: 409, body: { ok: false, erro: 'confirmacao_divergente', mensagem: 'Este negócio é de REPOSIÇÃO (cliente que já comprou), mas você disse que é venda nova. Nada foi gravado.' } } : null }); await sleep(450);
    c.w._confirmarComJanela = (k, o) => o.executar();
    clk(c.w, '.lead-card[data-row="102"] .lc-status-btn.ganho'); c.w.document.getElementById('sp-valor-102').value = '5200'; clk(c.w, '#sp-save-102'); await sleep(50); clk(c.w, '#tipo-modal [data-acao="reposicao"]'); await sleep(600);
    const t = c.w.document.getElementById('toast').textContent; chk('D 409: toast mostra a mensagem em português', /Nada foi gravado/.test(t)); chk('D 409: não diz Agendor', !/Agendor/.test(t)); chk('D 409: não diz "Erro 409"', !/Erro 409/.test(t));
    c.w.close();
  }
  {
    const c = boot(html, { post: async (p) => p === '/status' ? { status: 502, body: { ok: false, erro: 'Agendor nao confirmou o ganho na releitura — nada foi dado como certo' } } : null }); await sleep(450);
    c.w._confirmarComJanela = (k, o) => o.executar();
    // 502 é "tentar de novo": não vira erro na hora; entra na fila e o painel segue
    clk(c.w, '.lead-card[data-row="101"] .lc-status-btn.ganho'); c.w.document.getElementById('sp-valor-101').value = '8000'; clk(c.w, '#sp-save-101'); await sleep(500);
    chk('D 502: fica na fila do aparelho (não perde)', Object.keys(c.w.localStorage).some(k => k.startsWith('lifeb_op_v2_TESTE_')));
    c.w.close();
  }

  // ───────── E. livro de confirmados recentes ─────────
  {
    const comTarefa = () => F.carteira();
    const c = boot(html, { leads: comTarefa }); await sleep(450);
    c.w.eval(`_recAdd({id:'x1', path:'/task/finish', ts:Date.now(), body:{dealId:101, taskId:9001}})`);
    c.w.eval('_rawLeads = _ordenarFilaLocal(_obAplicarPendencias(_rawLeads)); renderLeads(_rawLeads)'); await sleep(100);
    const card = c.w.document.querySelector('.lead-card[data-row="101"]');
    chk('E tarefa concluída não volta (servidor ainda a lista)', card && !/Ligar para confirmar/.test(card.textContent));
    c.w.eval(`_recentes[0].tsConf = Date.now() - 5*60000`);   // passou do prazo de 4 min: o livro solta o registro
    chk('E depois de 5 min o registro expira', c.w.eval('_recAtivos().length') === 0);
    c.w.eval(`localStorage.removeItem(REC_KEY)`); c.w.close();
  }
  {
    const c = boot(html); await sleep(450);
    c.w.eval(`_recAdd({id:'g1', path:'/status', ts:Date.now(), body:{dealId:101, acao:'ganho', valor:1}})`);
    chk('E ganho confirmado esconde o negócio (deals pendentes)', c.w.eval(`_obDealsPendentes('/status').has(101)`));
    c.w.eval(`_recentes[0].tsConf = Date.now() - 16*60000`); chk('E depois de 16 min deixa de esconder', !c.w.eval(`_obDealsPendentes('/status').has(101)`));
    c.w.eval(`_recAdd({id:'t1', path:'/task/create', ts:Date.now(), body:{dealId:102}})`); chk('E criar tarefa NÃO entra no livro', !c.w.eval(`_recentes.some(r=>r.path==='/task/create')`));
    c.w.eval(`_recAdd({id:'p1', path:'/pipeline', ts:Date.now(), body:{dealId:101, valor:777}})`);
    const l = c.w.eval(`JSON.stringify(_obAplicarPendencias([{row:101,pot:1,tarefaAberta:null,status:'Aguardando contato'}])[0].pot)`); eq('E valor do pipeline recém-confirmado vale por cima do cache velho', l, '777');
    c.w.eval(`localStorage.removeItem(REC_KEY)`); c.w.close();
  }
  {   // persiste e recarrega
    const rec = JSON.stringify([{ id: 'p', path: '/status', ts: Date.now(), tsConf: Date.now(), body: { dealId: 101, acao: 'ganho', valor: 1 }, st: 'recente' }]);
    const c = boot(html, { storage: { lifeb_rec_v1_TESTE: rec } }); await sleep(500);
    chk('E ao recarregar a página o ganho recente continua escondido', !c.w.document.querySelector('.lead-card[data-row="101"]'));
    c.w.close();
    const velho = JSON.stringify([{ id: 'p', path: '/status', ts: 1, tsConf: Date.now() - 20 * 60000, body: { dealId: 101, acao: 'ganho', valor: 1 }, st: 'recente' }]);
    const c2 = boot(html, { storage: { lifeb_rec_v1_TESTE: velho } }); await sleep(500);
    chk('E registro velho (20 min) é descartado', !!c2.w.document.querySelector('.lead-card[data-row="101"]')); c2.w.close();
    const c3 = boot(html, { storage: { lifeb_rec_v1_TESTE: '{lixo' } }); await sleep(500); chk('E registro corrompido não derruba a página', !!c3.w.document.querySelector('.lead-card[data-row="101"]')); c3.w.close();
  }

  {   // de ponta a ponta: concluir tarefa de verdade (fila → servidor confirma) e a lista velha do servidor NÃO a traz de volta
    const c = boot(html); await sleep(450);
    const r = await c.w.apiPost('/task/finish', { dealId: 101, taskId: 9001, relato: 'ok' }); await sleep(100);
    chk('E fluxo real: servidor confirmou', r && r.ok === true && !r.queued);
    chk('E fluxo real: o livro guardou a confirmação', c.w.eval(`_recAtivos().some(r => r.path === '/task/finish' && r.body.taskId === 9001)`));
    c.w.eval('_isLoading = false'); await c.w.eval('loadData()'); await sleep(200);
    const card = c.w.document.querySelector('.lead-card[data-row="101"]');
    chk('E fluxo real: servidor ainda lista a tarefa, mas ela não volta na tela', card && !/Ligar para confirmar/.test(card.textContent));
    c.w.close();
  }
  {   // ganho confirmado de verdade some da lista mesmo que o servidor ainda o liste como aberto
    const c = boot(html); await sleep(450); c.w._confirmarComJanela = (k, o) => o.executar();
    clk(c.w, '.lead-card[data-row="101"] .lc-status-btn.ganho'); c.w.document.getElementById('sp-valor-101').value = '8000'; clk(c.w, '#sp-save-101'); await sleep(500);
    chk('E fluxo real: ganho confirmado → entrou no livro', c.w.eval(`_recAtivos().some(r => r.path === '/status')`));
    c.w.eval('_isLoading = false'); await c.w.eval('loadData()'); await sleep(200);
    chk('E fluxo real: o negócio ganho não volta para a lista de abertos (a tela fica no passo da observação até o representante terminar)', !c.w.eval('_rawLeads.some(l => l.row === 101)')); c.w.close();
  }

  // ───────── F. letra maior ─────────
  {
    const c = boot(html); await sleep(300); const d = c.w.document;
    chk('F padrão: letra maior LIGADA', d.documentElement.classList.contains('lm')); eq('F botão aria-pressed', d.getElementById('lm-btn').getAttribute('aria-pressed'), 'true');
    clk(c.w, '#lm-btn'); chk('F 1 toque desliga', !d.documentElement.classList.contains('lm')); eq('F lembrado no aparelho', c.w.localStorage.getItem('lifeb_letra_maior'), '0'); eq('F aria-pressed false', d.getElementById('lm-btn').getAttribute('aria-pressed'), 'false');
    clk(c.w, '#lm-btn'); chk('F 1 toque liga de novo', d.documentElement.classList.contains('lm')); eq('F lembrado 1', c.w.localStorage.getItem('lifeb_letra_maior'), '1'); c.w.close();
    const c2 = boot(html, { storage: { lifeb_letra_maior: '0' } }); await sleep(300); chk('F preferência "normal" respeitada na abertura', !c2.w.document.documentElement.classList.contains('lm')); c2.w.close();
    const vp = (html.match(/<meta name="viewport"[^>]*>/) || [''])[0]; chk('F zoom do navegador liberado', !/user-scalable=no/.test(vp) && !/maximum-scale/.test(vp));
  }

  // ───────── G. Próximo + filas na tela ─────────
  {
    const c = boot(html); await sleep(450); const d = c.w.document; const b = d.getElementById('proximo-banner');
    chk('G banner Próximo visível', b.classList.contains('visible')); chk('G Próximo = Drogaria Sol (sem tarefa vem antes da atrasada)', /Drogaria Sol/.test(b.textContent));
    chk('G motivo em português', /Sem tarefa marcada\. Marque o próximo contato\./.test(b.textContent)); chk('G contagem simples', /Precisam de você/.test(b.textContent));
    chk('G botão grande "Abrir este cliente"', !!b.querySelector('.px-btn'));
    eq('G 1 só card marcado PRÓXIMO', d.querySelectorAll('.lead-card.lc-proximo').length, 1); eq('G o card marcado é o primeiro', d.querySelector('.lead-card.lc-proximo').dataset.row, d.querySelector('.lead-card').dataset.row);
    const ordem = [...d.querySelectorAll('.lead-card')].map(x => x.dataset.row);
    chk('G atrasada vem antes de hoje e futura', ordem.indexOf('101') < ordem.indexOf('102') && ordem.indexOf('102') < ordem.indexOf('105') && ordem.indexOf('105') < ordem.indexOf('103'));
    chk('G sem tarefa vem antes da atrasada', ordem.indexOf('104') < ordem.indexOf('101'));
    // filtro esconde o banner e filtro vazio explica
    c.w.eval(`toggleFilter(document.querySelector('.sum-card.s-neg'))`); await sleep(50); chk('G com filtro o banner some', !b.classList.contains('visible'));
    c.w.eval(`_activeFilter='Em contato'; _rawLeads=_rawLeads.filter(l=>l.status!=='Em contato'); renderLeads(_rawLeads)`); await sleep(50);
    chk('G filtro vazio: mensagem clara', /Ninguém nesta lista/.test(d.getElementById('leads-list').textContent)); chk('G filtro vazio: botão para ver todos', !!d.querySelector('#leads-list .es-btn'));
    clk(c.w, '#leads-list .es-btn'); await sleep(50); chk('G "Ver todos" limpa o filtro', c.w.eval('_activeFilter') === null); c.w.close();
  }
  {   // nada urgente
    const calmo = () => F.carteira().map(l => Object.assign({}, l, { bucket: 'contato', semTarefa: false, tarefaAberta: F.tarefa(l.dealId * 10, 'LIGACAO', 5) }));
    const c = boot(html, { leads: calmo }); await sleep(450); const b = c.w.document.getElementById('proximo-banner');
    chk('G calmo: banner "Tudo em dia"', b.classList.contains('calmo') && /Tudo em dia/.test(b.textContent)); chk('G calmo: nenhum card PRÓXIMO', c.w.document.querySelectorAll('.lc-proximo').length === 0); chk('G calmo: diz a próxima tarefa em dd/mm/aaaa', /\d{2}\/\d{2}\/\d{4}/.test(b.textContent)); chk('G calmo: sem botão', !b.querySelector('.px-btn'));
    c.w.close();
  }
  {   // lista vazia
    const c = boot(html, { leads: () => [] }); await sleep(450);
    chk('G vazio: banner escondido', !c.w.document.getElementById('proximo-banner').classList.contains('visible')); chk('G vazio: mensagem simples', /Nenhum cliente na sua fila agora/.test(c.w.document.getElementById('leads-list').textContent)); c.w.close();
  }
  {   // busca esconde
    const c = boot(html); await sleep(400); c.w.eval(`handleSearch('farma')`); await sleep(500);
    chk('G busca esconde o banner', !c.w.document.getElementById('proximo-banner').classList.contains('visible')); c.w.close();
  }

  // ───────── H. velocidade / polling ─────────
  {
    const c = boot(html); await sleep(450); const antes = c.gets.filter(x => x === '/leads').length;
    Object.defineProperty(c.w.document, 'visibilityState', { value: 'hidden', configurable: true });
    c.w.eval('_cargaPeriodica()'); await sleep(100); eq('H aba escondida: NÃO consulta o servidor', c.gets.filter(x => x === '/leads').length, antes);
    Object.defineProperty(c.w.document, 'visibilityState', { value: 'visible', configurable: true });
    c.w._isLoading = false; c.w.eval('_isLoading=false; _cargaPeriodica()'); await sleep(200); chk('H aba visível: consulta', c.gets.filter(x => x === '/leads').length === antes + 1);
    chk('H preconnect ao servidor', /rel="preconnect" href="https:\/\/lifeb-rep-painel/.test(html));
    c.w.close();
    // cache local pinta antes da rede: servidor LENTO (nunca responde) e a lista já aparece
    const lead0 = { row: 101, empresa: 'Cache Rápido', nome: 'X', status: 'Aguardando contato', pot: 0, tarefaAberta: null, tipo_negocio: 'venda', ja_comprou: false, funil_tag: '', superagos: false, segmento: '', cidade: '', estado: '', whatsapp: '', obs_sdr: '', obs_rep: '', data: '', ts_vend: 0 };
    const c2 = boot(html, { leads: () => { return new Promise(() => {}); }, storage: { lifeb_cache_TESTE: JSON.stringify({ rep: 'TESTE', leads: [lead0], ts: Date.now() }) } });
    await sleep(250); chk('H cache local pinta a lista antes da rede responder', /Cache Rápido/.test(c2.w.document.getElementById('leads-list').textContent)); c2.w.close();
  }

  // ───────── I. texto simples / português ─────────
  {
    const c = boot(html); await sleep(450); const cl = c.w.document.body.cloneNode(true); cl.querySelectorAll('script,style').forEach(e => e.remove()); const txt = cl.textContent;
    chk('I nenhum "Agendor" visível', !/Agendor/.test(txt)); chk('I nenhum "lead" visível', !/\blead\b/i.test(txt)); chk('I nenhum "pipeline" visível', !/pipeline/i.test(txt));
    chk('I nenhuma data ISO visível', !/\b\d{4}-\d{2}-\d{2}\b/.test(txt));
    c.w.close();
  }
  return { n, falhas };
}
module.exports = { rodar, gerar };
if (require.main === module) {
  const tpl = fs.readFileSync(path.join(__dirname, '..', 'dashboard-rep-template.html'), 'utf8');
  rodar(tpl).then(({ n, falhas }) => { console.log(`painel_jsdom: ${n - falhas.length} passou / ${falhas.length} falhou (de ${n})`); falhas.forEach(f => console.log('FALHOU', f)); process.exit(falhas.length ? 1 : 0); }).catch(e => { console.error(e); process.exit(1); });
}
