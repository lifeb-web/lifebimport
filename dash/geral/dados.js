// dados.js — política de DADOS do Dash Geral, compartilhada pelo painel (index.html) e pelo telão (telao/index.html).
// 17/11/2026 (Robert: números "diferentes toda hora" e erros intermitentes; auditoria da fase 1).
//
// Carregado ANTES do script principal de cada página. Lê SUPABASE_URL / SUPABASE_ANON_KEY (constantes do script
// principal) só em tempo de chamada, nunca no carregamento — por isso pode vir primeiro.
//
// Regras (iguais nas duas páginas):
//  1. REST da D1 com 3 retentativas e espera crescente (erro de pedido 4xx não retenta).
//  2. Se ainda falhar, NUNCA cai em silêncio na ponte KV (/api/table), que é um snapshot CONGELADO (sem
//     origem_especial, mês corrente vazio): o erro sobe marcado como erro de REDE e o loadData() da página decide:
//     último dado bom em memória → último dado bom salvo (localStorage) → só então a ponte, em modo emergência,
//     sempre com a faixa #dados-banner visível e sem gravar esse dado como "último bom".
//  3. Erro de CÓDIGO (compute/render, qualquer exceção que não veio da rede) ganha faixa própria e NÃO entra no
//     loop de recuperação (recarregar a página é o remédio; deploy novo recarrega sozinho via checkForUpdate).
//  4. Recuperação automática com espera crescente (15 s → 2 min) e teto de parede: depois de 30 min em falha,
//     passa a tentar a cada 5 min (não martela a D1 fora do ar por horas).
//  5. Snapshot "último dado bom": se o localStorage estourar a cota, guarda pelo menos um resumo compacto
//     (dado calculado + carimbo) e avisa no console — nunca fica sem nada em silêncio.
//
// Ganchos de teste (só quando a página de teste define): window.__DASH_RETRY_MS__ (esperas entre retentativas),
// __DASH_RECOVER_MS__ (espera base da recuperação), __DASH_RECOVER_TETO_MS__ (teto de parede),
// __DASH_RECOVER_LONGO_MS__ (espera depois do teto), __recDelays_ (lista que recebe cada espera escolhida).

// Ponte de emergência (08-09/09) — worker isolado (dash-geral-bridge) só lê de um KV Cloudflare, nunca fala com
// Postgres/Supabase direto. Quem alimenta o KV é um script à parte (refresh-snapshot.mjs, roda fora do site).
// Ver [[project_dash_geral_egress_incidente_0709]]. Hoje (17/11) o carimbo do KV é de 15/10/2026.
const BRIDGE_URL_ = 'https://dash-geral-bridge.robert131196.workers.dev/api/table';
let _bridgeSyncedAt_ = null;   // carimbo REAL do snapshot da ponte (mostrado na faixa de emergência)
let _forceBridge_ = false;     // ligado só pelo loadData() quando não existe NENHUM dado bom

function _marcaRede_(e) { try { if (e && typeof e === 'object') e.rede = true; } catch (_) {} return e; }

async function _fetchViaStaticBridge_(table, query) {
  try {
    // dash_ads_daily serve 2 propósitos com filtros diferentes: card de Investimento em Vendas (só
    // entity_type=campaign) e a aba ADS/hierarquia (tudo) — nunca misturar os dois (somar todos os níveis juntos
    // dobra/triplica o gasto real), por isso vira uma 2ª chave no KV.
    let key = table;
    if (table === 'dash_ads_daily' && !(query || '').includes('entity_type=eq.campaign')) key = 'dash_ads_daily_all';
    const res = await fetch(BRIDGE_URL_ + '?name=' + key + '&_=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('ponte HTTP ' + res.status);
    const payload = await res.json();
    const rows = payload.rows || [];
    if (payload.syncedAt) _bridgeSyncedAt_ = payload.syncedAt;
    // dash_ads_daily vem do Postgres direto (não do PostgREST) nesse caminho — coluna `date` chega como timestamp
    // completo em vez de só a data; corta pro mesmo formato YYYY-MM-DD que o resto do painel espera.
    if (table === 'dash_ads_daily') rows.forEach(r => { if (r.date) r.date = String(r.date).slice(0, 10); });
    return rows;
  } catch (e) { throw _marcaRede_(e); }
}

function _retryWaits_() { return (typeof window !== 'undefined' && window.__DASH_RETRY_MS__) || [1000, 2500, 6000]; }

async function _fetchRestAll_(table, query) {
  const PAGE = 1000;
  let all = [];
  let from = 0;
  while (true) {
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + query, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
        Range: from + '-' + (from + PAGE - 1),
        Prefer: 'count=exact'
      }
    });
    if (!res.ok) { const er = new Error('Supabase HTTP ' + res.status + ' (' + table + ')'); er.status = res.status; throw er; }
    const chunk = await res.json();
    all = all.concat(chunk);
    const cr = res.headers.get('content-range');
    const total = (cr && cr.indexOf('/') !== -1) ? parseInt(cr.split('/')[1], 10) : chunk.length;
    if (all.length >= total || chunk.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

// Busca uma tabela inteira (paginada) na D1. Lança erro MARCADO (e.rede = true) depois das retentativas;
// quem chama decide o que fazer (nunca cai sozinho na ponte, exceto em _forceBridge_).
async function _fetchTablePage_(table, query) {
  if (_forceBridge_) return _fetchViaStaticBridge_(table, query);
  const waits = _retryWaits_();
  let lastErr;
  for (let a = 0; a <= waits.length; a++) {
    try { return await _fetchRestAll_(table, query); }
    catch (e) {
      lastErr = _marcaRede_(e);
      // erro de pedido (400/401/403/404...) não melhora tentando de novo; rede, 408, 429 e 5xx sim
      const st = e && e.status;
      if (st && st < 500 && st !== 408 && st !== 429) break;
      if (a < waits.length) { console.warn('D1 REST falhou (' + table + '), nova tentativa ' + (a + 1) + '/' + waits.length + ':', e && e.message); await new Promise(r => setTimeout(r, waits[a])); }
    }
  }
  throw lastErr;
}

// Depois de um período em fallback (último dado bom velho ou ponte de emergência) o dado em memória NÃO é confiável
// pra merge incremental — cada tabela volta a ser buscada INTEIRA (cold) quando o REST voltar. Por tabela, pra uma
// falha parcial não repetir a busca inteira das outras.
let _needCold_ = { deals: false, ads: false, leads: false };
function _markAllCold_() { _needCold_ = { deals: true, ads: true, leads: true }; }

// ── FAIXA DE ESTADO DOS DADOS (#dados-banner em cada página) ──
let _dadosEstado_ = null;   // null = dados de hoje (D1) | 'stale' = último dado bom | 'emergencia' = ponte KV congelada | 'codigo' = erro na tela
let _staleSince_ = null;    // quando foi o último dado bom (ms)
let _lastGoodAt_ = null;
let _partialFail_ = [];     // tabelas secundárias que não atualizaram (anúncios/leads)
let _recTimer_ = null, _recN_ = 0, _recInicio_ = null;
let _erroCodigo_ = null;    // mensagem técnica do último erro de código (vai no title da faixa)
const _MESES_PT_ = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
function _p2_(n) { return String(n).padStart(2, '0'); }
function _stampBR_(ms) {
  const d = new Date(ms), hoje = new Date();
  const hm = _p2_(d.getHours()) + ':' + _p2_(d.getMinutes());
  return d.toDateString() === hoje.toDateString() ? hm : _p2_(d.getDate()) + '/' + _p2_(d.getMonth() + 1) + ' às ' + hm;
}
function dadosErroDeRede_(e) { return !!(e && e.rede); }

// Dados de hoje chegaram pela D1: limpa estado, zera a recuperação.
// O backoff/teto de parede só zera quando o ciclo foi TOTALMENTE limpo (sem falha parcial de anúncios/leads): com falha
// parcial persistente, a recuperação continua com espera crescente e entra no teto de 30 min normalmente.
function dadosMarcarBom_() { _dadosEstado_ = null; _lastGoodAt_ = Date.now(); if (!_partialFail_.length) { _recN_ = 0; _recInicio_ = null; } }

// Erro de CÓDIGO (qualquer exceção que não veio da rede): faixa própria, console.error completo, aviso externo se a
// página tiver (window.alertError), e NENHUMA recuperação em loop — repetir o mesmo cálculo a cada 2 min não conserta
// código. O poll de fundo continua no ritmo normal; deploy novo recarrega a página sozinho (checkForUpdate).
function dadosErroDeCodigo_(e) {
  _erroCodigo_ = (e && (e.stack || e.message)) || String(e);
  console.error('Dash Geral: erro de CÓDIGO ao montar os dados (não é rede):', e);
  if (_recTimer_) { clearTimeout(_recTimer_); _recTimer_ = null; }
  _dadosEstado_ = 'codigo';
  try { if (typeof window.alertError === 'function') window.alertError('dash-geral erro de código: ' + ((e && e.message) || e)); } catch (_) {}
  renderDadosBanner_();
}

function renderDadosBanner_() {
  const b = document.getElementById('dados-banner'); if (!b) return;
  let txt = '', cls = '', btnTxt = 'Tentar de novo', btnAcao = function () { loadData(true); }, title = '';
  if (_dadosEstado_ === 'codigo') {
    txt = 'Erro na tela ao montar os dados. Recarregue a página; se persistir, avise o Robert.';
    cls = 'codigo'; btnTxt = 'Recarregar a página'; btnAcao = function () { location.reload(); }; title = String(_erroCodigo_ || '').slice(0, 400);
  } else if (_dadosEstado_ === 'emergencia') {
    const t = _bridgeSyncedAt_ ? new Date(_bridgeSyncedAt_) : null;
    const dia = t && !isNaN(t) ? _p2_(t.getDate()) + '/' + _p2_(t.getMonth() + 1) : 'data antiga';
    txt = 'Sem conexão com os dados de hoje. Mostrando dados de ' + dia + ' (modo emergência). Os números NÃO são de ' + _MESES_PT_[new Date().getMonth()] + '.';
    cls = 'emerg';
  } else if (_dadosEstado_ === 'stale') {
    txt = 'Sem conexão com os dados de hoje. Mostrando o último dado bom: dados de ' + _stampBR_(_staleSince_ || Date.now()) + '. Tentando de novo automaticamente.';
    cls = 'stale';
  } else if (_partialFail_.length) {
    txt = 'Não deu para atualizar: ' + _partialFail_.join(' e ') + '. Investimento/CPL podem estar desatualizados.';
    cls = 'stale';
  }
  document.body.classList.toggle('modo-emerg', cls === 'emerg');
  if (!txt) { b.className = ''; b.textContent = ''; b.title = ''; return; }
  b.className = 'show ' + cls; b.textContent = ''; b.title = title;
  const t = document.createElement('span'); t.textContent = '⚠ ' + txt + ' ';
  const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'err-retry'; bt.textContent = btnTxt;
  bt.onclick = btnAcao;
  b.appendChild(t); b.appendChild(bt);
}

// Retentativa automática enquanto estiver em fallback/erro de rede: espera crescente (15 s, 30 s, 60 s, teto 2 min).
// Teto de parede: depois de 30 min seguidos em falha, passa a tentar a cada 5 min. Volta sozinho quando a D1 volta.
function armaRecuperacao_() {
  if (_recTimer_) return;
  if (_dadosEstado_ === 'codigo') return; // erro de código não entra em loop
  if (!_recInicio_) _recInicio_ = Date.now();
  const teto = window.__DASH_RECOVER_TETO_MS__ || 30 * 60 * 1000;
  const longo = Date.now() - _recInicio_ > teto;
  const base = window.__DASH_RECOVER_MS__ || Math.min((window.__DASH_RECOVER_BASE_MS__ || 15000) * Math.pow(2, _recN_), window.__DASH_RECOVER_CAP_MS__ || 120000);
  const d = longo ? (window.__DASH_RECOVER_LONGO_MS__ || 5 * 60 * 1000) : base;
  if (window.__recDelays_) window.__recDelays_.push(d);
  _recN_++;
  _recTimer_ = setTimeout(async () => {
    _recTimer_ = null;
    await loadData(true, true);
    if (_dadosEstado_ === 'codigo') return;
    if (_dadosEstado_ || _partialFail_.length || window.__lbErr) armaRecuperacao_(); else { _recN_ = 0; _recInicio_ = null; }
  }, d);
}

// Grava o "último dado bom". Se estourar a cota do localStorage (dados crus de milhares de negócios), grava ao menos
// o resumo compacto (dado calculado + carimbo) — a página consegue reexibir os números, só não recalcula por filtro.
// Se nem isso couber, avisa no console (nunca falha em silêncio).
function dadosSalvarSnapshot_(key, montarCompleto, montarCompacto) {
  try { localStorage.setItem(key, JSON.stringify(montarCompleto())); return 'completo'; }
  catch (e1) {
    try { localStorage.setItem(key, JSON.stringify(montarCompacto())); console.warn('Dash Geral: sem espaço para o último dado bom completo (' + key + '); guardado só o resumo compacto:', e1 && e1.message); return 'compacto'; }
    catch (e2) { console.warn('Dash Geral: sem espaço para guardar o último dado bom (' + key + '); sem fallback local:', e2 && e2.message); return null; }
  }
}
