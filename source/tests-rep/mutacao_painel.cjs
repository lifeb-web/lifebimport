// Mutação: estraga de propósito o molde (uma coisa por vez) e exige que a suíte painel_jsdom.cjs FALHE. Mutante que sobrevive = teste fraco.
// Rodar: node source/tests-rep/mutacao_painel.cjs        (3 em paralelo, nice do chamador)
const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
const TPL = path.join(__dirname, '..', 'dashboard-rep-template.html');
const M = [
  ['não envia tipoConfirmado', "(_tipoG === 'reposicao' || _tipoG === 'venda_nova') ? { tipoConfirmado: _tipoG } : {}", '{}'],
  ['pula o quadro de reposição', "const _tipoG = await _perguntarTipoGanho(_leadG, n);", "const _tipoG = 'sem';"],
  ['"Não, é venda nova" ainda envia', "if (_tipoG === 'bloqueado') { prompt.classList.remove('visible'); return; }", ''],
  ['fechar o quadro ainda envia', "if (_tipoG === 'cancelar') return;", ''],
  ['reposição não detectada', "if (tipo === 'reposicao') return 'reposicao';", ''],
  ['cache antigo sem tipo ignora funil_tag', "(l.funil_tag === 'reposicao' ? 'reposicao' : (l.funil_tag === 'reativacao75' ? 'reativacao' : ''))", "''"],
  ['cliente que já comprou ignorado', "if (l.ja_comprou === true) return 'jacomprou';", ''],
  ['faixa de urgência invertida', "if (ua.faixa !== ub.faixa) return ua.faixa - ub.faixa;", "if (ua.faixa !== ub.faixa) return ub.faixa - ua.faixa;"],
  ['SuperAgos deixa de ir ao topo', "if (!!a.superagos !== !!b.superagos) return a.superagos ? -1 : 1;\n    const ua", "const ua"],
  ['desempate por valor invertido', "return ((Number(b.pot) || 0) - (Number(a.pot) || 0)) || ((Number(a.row) || 0) - (Number(b.row) || 0));", "return ((Number(a.pot) || 0) - (Number(b.pot) || 0)) || ((Number(a.row) || 0) - (Number(b.row) || 0));"],
  ['"hoje" sem fuso de Brasília', "function _hojeBRT(agoraMs) { return new Date((agoraMs == null ? Date.now() : agoraMs) - 3 * 3600000)", "function _hojeBRT(agoraMs) { return new Date((agoraMs == null ? Date.now() : agoraMs) - 0 * 3600000)"],
  ['livro de recentes não alimentado', "    _recAdd(op);\n    _obApagar(op); _obBanner();", "    _obApagar(op); _obBanner();"],
  ['recentes nunca expiram', "function _recTtl(path) { return path === '/status' ? 15 * 60000 : 4 * 60000; }", "function _recTtl(path) { return 1e15; }"],
  ['criar tarefa entra no livro', "['/task/finish', '/task/reschedule', '/obs', '/pipeline', '/status']", "['/task/finish', '/task/reschedule', '/obs', '/pipeline', '/status', '/task/create']"],
  ['recentes não aplicados na tela', ".concat(_recAtivos()).sort", ".sort"],
  ['ganho recente não esconde o negócio', "_recAtivos().forEach(o => { if ((!path || o.path === path) && o.body) s.add(o.body.dealId); }); return s;", "return s;"],
  ['zoom do navegador bloqueado de novo', '<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">'],
  ['letra maior desligada por padrão', "return v === null ? true : v === '1'; } catch (_) { return true; }", "return v === null ? false : v === '1'; } catch (_) { return false; }"],
  ['letra maior não é lembrada', "try { localStorage.setItem(LM_KEY, on ? '1' : '0'); } catch (_) {}", ''],
  ['aba escondida continua consultando', "function _cargaPeriodica() { if (document.visibilityState === 'hidden') return; loadData(); }", "function _cargaPeriodica() { loadData(); }"],
  ['"Próximo" finge urgência', "if (!proximo && f <= 1) proximo = l;", "if (!proximo && f <= 2) proximo = l;"],
  ['erro 429 sem tradução', "if (status === 429 || /\\b429\\b/.test(t)) return", "if (false) return"],
  ['Escape não fecha o quadro', "if (e.key === 'Escape') { e.preventDefault();", "if (e.key === 'Escape_') { e.preventDefault();"],
  ['quadro sem escapar HTML', "<div><span>Cliente</span><b>' + esc(f.cliente) + '</b>", "<div><span>Cliente</span><b>' + f.cliente + '</b>"],
  ['filtro vazio sem mensagem', "if (!searchActive && !toShow.length) {", "if (false) {"],
  ['aviso de reposição no cartão some', "'<div class=\"lc-ciclo-aviso\">🔁 Reposição: cliente que já comprou</div>'", "''"],
  ['"Entendi" não encerra o fluxo', "if (a === 'entendi') return { resolve: 'bloqueado' };", "if (a === 'entendi') return { resolve: 'cancelar' };"],
  ['mensagem do servidor ignorada', "(data.mensagem || data.erro || data.error || data.aviso)", "(data.erro || data.error || data.aviso)"],
  ['página não ordena a carga', "newLeads = _ordenarFilaLocal(_obAplicarPendencias(newLeads));", "newLeads = _obAplicarPendencias(newLeads);"],
  ['data do quadro em formato ISO', "function _dataHojeBR(agoraMs) { return _dataBR(_hojeBRT(agoraMs)); }", "function _dataHojeBR(agoraMs) { return _hojeBRT(agoraMs); }"],
  ['quadro não mostra o valor', "<div><span>Valor</span><b>' + esc(f.valor) + '</b></div>", ""],
  ['botão da reposição igual ao comum', "${l.tipo_negocio === 'reposicao' ? 'Ganho da reposição' : 'Marcar Ganho'}", "Marcar Ganho"],
  ['valor 100x menor passa sem perguntar', "if ((await _perguntarValor(_leadG, n)) !== 'ok') { if (valorIn) valorIn.focus(); return; }", ''],
  ['piso sem valor estimado frouxo', "return v < 500;", "return v < 5;"],
  ['"Corrigir o valor" ainda envia', "if ((await _perguntarValor(_leadG, n)) !== 'ok') { if (valorIn) valorIn.focus(); return; }", "await _perguntarValor(_leadG, n);"],
  ['dinheiro volta a contar centavos', "else if (/^\\d+$/.test(t)) num = parseFloat(t);", "else if (/^\\d+$/.test(t)) num = parseFloat(t) / 100;"],
  ['milhar com ponto lido como decimal', "else if (/^\\d{1,3}(\\.\\d{3})+$/.test(t)) num = parseFloat(t.replace(/\\./g, ''));", "else if (/^\\d{1,3}(\\.\\d{3})+$/.test(t)) num = parseFloat(t);"],
  ['negativo aceito', "if (/^[-−–(]/.test(t)) return", "if (false) return"],
  ['limite máximo some', "if (num > VALOR_MAX) return", "if (false) return"],
  ['sufixo k ignorado', "else if (/k$/.test(t)) { mult = 1000; t = t.slice(0, -1); }", ""],
  ['pipeline sem conferência de valor', "if ((await _perguntarValor(_leadP, n)) !== 'ok') { if (valorIn) valorIn.focus(); return; }", ""],
  ['jaComprou null zera o que a tela sabia', "ja_comprou: l.jaComprou == null ? _jaComprouAnterior(l.dealId) : l.jaComprou === true,", "ja_comprou: l.jaComprou === true,"],
  ['outra aba não é ouvida', "if (e.key === REC_KEY) { try { _recMesclar(JSON.parse(e.newValue || '[]')); } catch (_) {} }", ""],
  ['rótulo abreviado volta', '<div class="sum-label">Aguardando</div>', '<div class="sum-label">Aguard.</div>'],
  ['preview do valor some', "el.textContent = r.ok ? 'Valor entendido: ' + fmtReais(r.valor) : r.erro;", "el.textContent = '';"],
  ['tipo indefinido não pergunta', "if (tipo === 'indefinido') return 'indefinido';", ''],
  ['indefinido + venda nova bloqueia', "modo !== 'jacomprou' && modo !== 'indefinido') return { tela: 'nada' };", "modo !== 'jacomprou') return { tela: 'nada' };"],
  ['teto de R$ 1 milhão some', "if (v > 1000000) return true;", ''],
  ['banner Próximo some', "const _proxRow = _renderProximo(_allLeads);", "const _proxRow = null;"],
  ['reativação tratada como venda', "if (tipo === 'reativacao') return 'reativacao';", ''],
];
function um(i) {
  const [nome, de, para] = M[i]; const tpl = fs.readFileSync(TPL, 'utf8');
  if (tpl.split(de).length !== 2) return Promise.resolve({ i, nome, estado: 'MUTAÇÃO NÃO APLICÁVEL (trecho não achado ou ambíguo)' });
  const mut = tpl.replace(de, () => para);
  const f = path.join(require('os').tmpdir(), 'mut_painel_' + process.pid + '_' + i + '.html'); fs.writeFileSync(f, mut);
  return new Promise(res => {
    const p = spawn(process.execPath, ['-e', `const {rodar}=require(${JSON.stringify(path.join(__dirname, 'painel_jsdom.cjs'))});rodar(require('fs').readFileSync(${JSON.stringify(f)},'utf8')).then(r=>{console.log(JSON.stringify({f:r.falhas.length,p:r.falhas.slice(0,2)}));process.exit(0)}).catch(e=>{console.log(JSON.stringify({f:1,p:['exceção '+e.message]}));process.exit(0)})`], { env: process.env });
    let out = ''; p.stdout.on('data', d => out += d); p.on('close', () => { try { fs.unlinkSync(f); } catch (_) {} let r = null; try { r = JSON.parse(out.trim().split('\n').pop()); } catch (_) {} res({ i, nome, estado: r && r.f > 0 ? 'MORTO' : 'SOBREVIVEU', por: r && r.p }); });
  });
}
(async () => {
  const res = []; let prox = 0;
  await Promise.all([0, 1, 2].map(async () => { for (;;) { const i = prox++; if (i >= M.length) return; res.push(await um(i)); } }));
  res.sort((a, b) => a.i - b.i); let ruins = 0;
  res.forEach(r => { console.log((r.estado === 'MORTO' ? 'ok  ' : 'RUIM') + ' ' + r.nome + ' → ' + r.estado + (r.por && r.por[0] ? ' (' + String(r.por[0]).slice(0, 60) + ')' : '')); if (r.estado !== 'MORTO') ruins++; });
  console.log(`mutação: ${res.length - ruins}/${res.length} mortos`); process.exit(ruins ? 1 : 0);
})();
