// origem_recon.js — CARTÃO DE RECONCILIAÇÃO DE ORIGEM (19/11/2026), aba Vendas do Dash Geral.
// Responde ao que o dono pediu: ver "N vendas sem origem confirmada", "N mudaram de origem nos últimos 7 dias" e "N aguardando decisão",
// com a lista de cada uma. Lê duas tabelas que o sync grava (dash_deal_origem_fixa e dash_deal_origem_eventos) + os ganhos do Arena.
// A origem que o Dash mostra é a GRAVADA no primeiro toque; mudança no CRM depois disso aparece aqui, não nos números.
// Independente do resto da página: se a tabela ainda não existe (sync antigo), mostra um aviso curto e não quebra nada.
(function () {
  'use strict';
  var ARENA = '890331';
  var _st = { dados: null, erro: null, ts: 0 };
  var NOME = { inbound: 'Inbound', outbound: 'Outbound', superagos: 'SuperAgos', recuperacao: 'Recuperação' };
  var FONTE_TXT = { padrao: 'sem origem em lugar nenhum (assumido Outbound)', nome: 'só pelo nome da empresa', pessoa: 'só pelo cadastro da pessoa', empresa: 'só pelo cadastro da empresa', herdado_pessoa: 'herdada da pessoa', herdado_empresa: 'herdada da empresa', herdado_nome: 'herdada pelo nome', herdado_cadastro_empresa: 'herdada da empresa', legado_erro: 'erro na regra (assumido Outbound)' };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(v) { var n = Number(v); if (!isFinite(n)) return ''; try { return esc(typeof fmtMoney === 'function' ? fmtMoney(n) : 'R$ ' + n.toFixed(2)); } catch (_) { return 'R$ ' + esc(String(n)); } }   // 19/11 (revisão de segurança): valor SEMPRE numérico e escapado antes de ir para innerHTML
  function dataBr(iso) { if (!iso) return '—'; var m = String(iso).match(/(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] : '—'; }
  function nomeOrigem(o, e) { return NOME[e] || NOME[o] || (o || '—'); }
  function seteDiasAtras() { var d = new Date(Date.now() - 7 * 86400000); return d.toISOString(); }

  // Pura (testada em tests/t_origem_recon.mjs): junta ganhos do Arena + linhas gravadas + eventos e devolve os três grupos.
  function calcular(ganhos, fixas, eventos, agoraMs) {
    var fx = {}; (fixas || []).forEach(function (f) { fx[String(f.deal_id)] = f; });
    var corte = (agoraMs || Date.now()) - 7 * 86400000;
    var semOrigem = [], aguardando = [];
    (ganhos || []).forEach(function (g) {
      var f = fx[String(g.id)];
      if (!f) { semOrigem.push({ id: g.id, title: g.title, value: g.value, data: g.data_real_evento || g.end_time, origem: g.origin, motivo: 'ainda não gravada no registro de origem' }); return; }
      if (Number(f.confirmada) !== 1 && !f.decisao_origin) semOrigem.push({ id: g.id, title: g.title, value: g.value, data: g.data_real_evento || g.end_time, origem: f.origin, especial: f.especial, motivo: FONTE_TXT[f.fonte] || ('fonte fraca: ' + f.fonte) });
    });
    (fixas || []).forEach(function (f) { if (Number(f.pendente) === 1) aguardando.push({ id: f.deal_id, title: f.title, origem: f.origin, especial: f.especial, motivo: f.pendente_motivo || 'aguardando decisão', data: f.fixed_at }); });
    var porDeal = {};
    (eventos || []).forEach(function (e) {
      var t = Date.parse(e.em); if (!(t >= corte)) return;
      if (e.tipo !== 'crm_mudou' && e.tipo !== 'provisoria_mudou' && e.tipo !== 'decisao') return;   // só o que MUDOU no Dash (o Dash segue o Agendor); leitura fraca ignorada não conta
      var k = String(e.deal_id); var atual = porDeal[k];
      if (!atual || Date.parse(atual.em) < t) porDeal[k] = e;
    });
    var mudaram = Object.keys(porDeal).map(function (k) { var e = porDeal[k]; return { id: e.deal_id, title: e.title, value: e.value, de: e.de_origin, para: e.para_origin, tipo: e.tipo, em: e.em, nota: e.nota, funnel: e.funnel_id }; });
    mudaram.sort(function (a, b) { return Date.parse(b.em) - Date.parse(a.em); });
    return { semOrigem: semOrigem, mudaram: mudaram, aguardando: aguardando };
  }

  function linhaHTML(d, extra) {
    var link = (typeof AGENDOR_DEAL !== 'undefined' ? AGENDOR_DEAL : 'https://web.agendor.com.br/sistema/negocios/historico.php?id=') + d.id;
    return '<a class="mdeal-row" href="' + esc(link) + '" target="_blank" rel="noopener">' +
      '<div class="mdeal-dot" style="background:var(--amber)"></div>' +
      '<span class="mdeal-title"><span class="og-title-text">' + esc(d.title || ('Negócio ' + String(d.id).slice(-5))) + '</span></span>' +
      '<span class="mdeal-rep">' + extra + '</span>' +
      '<span class="mdeal-val">' + (d.value ? money(d.value) : '') + '</span><span class="mdeal-open">↗</span></a>';
  }

  function abrir(qual) {
    var r = _st.dados; if (!r) return;
    var tit, lista, corpo;
    if (qual === 'sem') {
      tit = 'Vendas sem origem confirmada · ' + r.semOrigem.length;
      corpo = r.semOrigem.map(function (d) { return linhaHTML(d, esc(nomeOrigem(d.origem, d.especial)) + ' · ' + esc(d.motivo) + ' · ' + dataBr(d.data)); }).join('');
    } else if (qual === 'mud') {
      tit = 'Mudaram de origem nos últimos 7 dias · ' + r.mudaram.length;
      corpo = '<div style="font-size:12.5px;line-height:1.45;color:var(--muted);padding:6px 14px 8px">O Dash segue o Agendor: estas vendas mudaram de origem lá e o Dash acompanhou. Leitura incompleta do sistema nunca rebaixa uma origem já gravada.</div>' +
        r.mudaram.map(function (d) { return linhaHTML(d, esc(nomeOrigem(d.de)) + ' → ' + esc(nomeOrigem(d.para)) + ' · ' + dataBr(d.em)); }).join('');
    } else {
      tit = 'Aguardando decisão do dono · ' + r.aguardando.length;
      corpo = r.aguardando.map(function (d) { return linhaHTML(d, 'mostrando ' + esc(nomeOrigem(d.origem, d.especial)) + ' · ' + esc(d.motivo)); }).join('');
    }
    if (!corpo) corpo = '<div class="modal-empty">Nada aqui</div>';
    var t = $('modal-title'), b = $('modal-body'), o = $('modal-overlay');
    if (t && b && o) { t.textContent = tit; b.innerHTML = corpo; o.classList.add('show'); }
  }

  function chip(cls, n, rotulo, qual, dica) {
    return '<button type="button" class="rc-chip ' + cls + (n > 0 ? ' tem' : '') + '" data-q="' + qual + '" title="' + esc(dica) + '"><b>' + n + '</b><span>' + rotulo + '</span></button>';
  }

  function pintar() {
    var box = $('origem-recon'); if (!box) return;
    var h = '<div class="orig-card rc-card"><div class="orig-hd"><span class="orig-title">Conferência de origem</span><span class="rc-sub" id="rc-sub"></span></div>';
    if (_st.erro && !_st.dados) {
      h += '<div class="rc-aviso">' + (_st.erro === 'sem_tabela' ? 'O registro de origem congelada ainda não foi ativado no servidor. Nada muda nos números até lá.' : 'Não consegui ler a conferência agora. Tento de novo sozinho em alguns minutos.') + '</div></div>';
      box.innerHTML = h; return;
    }
    if (!_st.dados) { box.innerHTML = h + '<div class="rc-aviso">Carregando…</div></div>'; return; }
    var r = _st.dados;
    h += '<div class="rc-chips">' +
      chip('rc-a', r.semOrigem.length, r.semOrigem.length === 1 ? 'venda sem origem confirmada' : 'vendas sem origem confirmada', 'sem', 'Ganhos do Arena cuja origem ainda não veio de um campo certo') +
      chip('rc-b', r.mudaram.length, r.mudaram.length === 1 ? 'mudou de origem nos últimos 7 dias' : 'mudaram de origem nos últimos 7 dias', 'mud', 'O Agendor mudou e o Dash acompanhou') +
      chip('rc-c', r.aguardando.length, r.aguardando.length === 1 ? 'aguardando decisão' : 'aguardando decisão', 'dec', 'Origem restaurada à espera do dono') +
      '</div><div class="rc-foot">O Dash segue o origem_deal do Agendor. Sem ele, vale a origem já gravada. Toque num número para ver a lista.</div></div>';
    box.innerHTML = h;
    var sub = $('rc-sub'); if (sub && _st.ts) { var d = new Date(_st.ts); sub.textContent = 'lido ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
    Array.prototype.forEach.call(box.querySelectorAll('.rc-chip'), function (b) { b.addEventListener('click', function () { abrir(b.getAttribute('data-q')); }); });
  }

  function carregar() {
    if (typeof _fetchRestAll_ !== 'function' || typeof SUPABASE_URL === 'undefined') { setTimeout(carregar, 1500); return; }
    var corte = encodeURIComponent(seteDiasAtras());
    Promise.all([
      _fetchRestAll_('dash_geral_deals', 'select=id,title,value,origin,status,data_real_evento,end_time&status=eq.won&funnel_id=eq.' + ARENA + '&order=id'),
      _fetchRestAll_('dash_deal_origem_fixa', 'select=deal_id,title,funnel_id,origin,especial,fonte,confirmada,decisao_origin,pendente,pendente_motivo,fixed_at&funnel_id=eq.' + ARENA + '&order=deal_id'),
      _fetchRestAll_('dash_deal_origem_fixa', 'select=deal_id,title,funnel_id,origin,especial,fonte,confirmada,decisao_origin,pendente,pendente_motivo,fixed_at&pendente=eq.1&order=deal_id'),
      _fetchRestAll_('dash_deal_origem_eventos', 'select=deal_id,em,tipo,de_origin,para_origin,fonte,funnel_id,title,value,nota&em=gte.' + corte + '&order=em.desc')
    ]).then(function (r) {
      var vistos = {}, todas = r[1].concat(r[2]).filter(function (f) { var k = String(f.deal_id); if (vistos[k]) return false; vistos[k] = 1; return true; });
      _st.dados = calcular(r[0], todas, r[3], Date.now()); _st.erro = null; _st.ts = Date.now(); pintar();
    }).catch(function (e) {
      _st.erro = (e && e.status >= 400 && e.status < 500) ? 'sem_tabela' : 'rede'; pintar();
    });
  }

  window.OrigemRecon_ = { calcular: calcular, abrir: abrir, recarregar: carregar };
  // auditoria 19/11 (custo no D1): atualiza a cada 10 min SÓ com a aba visível; ao voltar à aba, relê se passou de 10 min.
  function iniciar() {
    pintar(); carregar();
    setInterval(function () { if (!document.hidden) carregar(); }, 10 * 60000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && Date.now() - _st.ts > 10 * 60000) carregar(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
