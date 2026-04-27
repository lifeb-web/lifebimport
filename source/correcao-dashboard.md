# Correções e Melhorias — Life B | Sistema de Painéis SDR

## Histórico de versões
- **v1** — Correções críticas pós-primeira auditoria (race condition, timezone)
- **v2** — Correções pós-segunda auditoria (Não identificado, _inFlight, relógio, statusBadge)
- **v3** — Esta versão: auditoria completa do painel de representantes + proxy

---

## STATUS DAS CORREÇÕES ANTERIORES (v1 e v2)

| # | Correção | Arquivo | Status |
|---|----------|---------|--------|
| Race condition polling (`_isLoading`) | dashboard-leads.html + telão | ✅ Aplicado |
| Timezone `getAds()` (`America/Sao_Paulo`) | lifeb-leads-proxy.gs | ✅ Aplicado |
| "Não identificado" ausente no funil SDR mobile | dashboard-leads.html | ✅ Aplicado |
| `statusBadgeSdr` sem classe para "Não identificado" | ambos HTML | ✅ Aplicado |
| `setInterval` relógio sem referência salva | ambos HTML | ✅ Aplicado |
| `_inFlight` pode ficar negativo | ambos HTML | ✅ Aplicado |

---

## CORREÇÕES v3 — PAINEL DE REPRESENTANTES + PROXY

### Arquivos a corrigir nesta rodada
- `painel reps/dashboard-rep-template.html` — template canônico (gera os painéis de cada rep)
- `lifeb-leads-proxy.gs` — proxy Google Apps Script

---

## CORREÇÃO 1 — localStorage vs ts_vend do servidor (MÉDIO)

**Arquivo:** `painel reps/dashboard-rep-template.html`

**Problema:** O timestamp de "última atualização" de cada lead é lido exclusivamente do `localStorage`. Se o rep usar o painel em dois dispositivos diferentes (celular + computador), os timestamps ficam dessincronizados — cada dispositivo mostra um horário diferente para a mesma atualização.

O proxy já retorna `ts_vend` (epoch ms) para cada lead no `getActive()`. Esse valor é a fonte de verdade do servidor. O código deveria usar o **maior entre os dois** — local ou servidor — para sempre mostrar o mais recente.

**Localização:** Função `getLeadTs(row, dataEntrada)` no template. Encontre:

```javascript
function getLeadTs(row, dataEntrada) {
  const ts = _tsMap[row];
  if (ts) {
```

**Substitua por:**

```javascript
function getLeadTs(row, dataEntrada, tsServidor) {
  // Usa o maior entre localStorage e ts_vend do servidor
  const tsLocal   = _tsMap[row] || 0;
  const tsRemoto  = tsServidor  || 0;
  const ts        = Math.max(tsLocal, tsRemoto);
  if (ts) {
```

**E onde `getLeadTs` é chamado** para renderizar o timestamp de cada lead, passe o `ts_vend` do lead como terceiro argumento:

```javascript
// Antes:
getLeadTs(l.row, l.data)

// Depois:
getLeadTs(l.row, l.data, l.ts_vend)
```

Isso garante que quando o rep abre o painel num segundo dispositivo, ele vê o timestamp correto que está na planilha — não um timestamp vazio ou defasado do localStorage vazio daquele dispositivo.

---

## CORREÇÃO 2 — `active_all` sem autenticação no proxy (MÉDIO)

**Arquivo:** `lifeb-leads-proxy.gs`

**Problema:** O endpoint `action=active_all` retorna todos os leads ativos de todos os representantes sem exigir nenhum token. A URL do proxy está hardcoded no HTML público (GitHub Pages), então qualquer pessoa que encontrar a URL consegue chamar:

```
?action=active_all
```

E receber nome, empresa, cidade, segmento e status de todo o pipeline.

**O que fazer:**

1. Adicione um token de leitura para o telão nas constantes do proxy, junto com `REP_TOKENS`:

```javascript
const TELAO_TOKEN = 'lifeb_telao_2026'; // troque por um valor aleatório de sua escolha
```

2. No `doGet`, adicione validação ao case `active_all`:

```javascript
case 'active_all': {
  const tokT = ((e.parameter||{}).token || '').trim();
  if (tokT !== TELAO_TOKEN) { result = { error: 'token inválido' }; break; }
  result = getActiveAll();
  break;
}
```

3. No HTML do telão (`dashboard-leads-telao.html` e `dashboard-telao.html`), atualize a chamada ao proxy para incluir o token:

```javascript
// Antes:
proxy('active_all')

// Depois:
proxy('active_all', { token: 'lifeb_telao_2026' })
```

Ou se o proxy usa query string diretamente:
```javascript
const url = PROXY_URL + '?action=active_all&token=lifeb_telao_2026';
```

**Após implementar:** reimplantar o proxy no Apps Script (nova versão de implantação).

---

## CORREÇÃO 3 — Campo único legado sem LockService (BAIXO)

**Arquivo:** `lifeb-leads-proxy.gs`

**Problema:** O `doPost` tem dois caminhos de gravação:
- `update_lead` — atômico, com `LockService` ✅
- Campo único legado (compatibilidade) — **sem** `LockService` ⚠️

Se dois POSTs de campo único chegarem ao mesmo tempo para a mesma linha (ex: rep salva obs e status em paralelo), podem sobrescrever um ao outro.

**Localização:** No `doPost`, após o bloco `if (action === 'update_lead') { ... }`, encontre o início do caminho legado:

```javascript
// ── campo único: gravação simples (compatibilidade com POSTs existentes) ──
const campo = String(body.campo || '').trim();
```

**Envolva toda essa seção com LockService:**

```javascript
// ── campo único: gravação simples (compatibilidade com POSTs existentes) ──
const campo = String(body.campo || '').trim();
const valor = String(body.valor || '').trim();

if (!ALLOWED_WRITE.hasOwnProperty(campo)) {
  return jsonResponse({ ok: false, error: 'campo não permitido' });
}
// ... validações existentes ...

var lockSingle = LockService.getScriptLock();
lockSingle.waitLock(10000);
try {
  sheet.getRange(row, ALLOWED_WRITE[campo] + 1).setValue(valorEscrito);
  sheet.getRange(row, COL_TIMESTAMP_VEND + 1).setValue(now);
  SpreadsheetApp.flush();
} finally {
  lockSingle.releaseLock();
}

return jsonResponse({ ok: true, ts: now });
```

**Observação:** A longo prazo, quando o frontend não usar mais o campo único (todos os POSTs usando `update_lead`), esse bloco legado pode ser removido inteiramente. Mas enquanto existir, precisa de lock.

---

## MELHORIA 4 — Paginação por scroll infinito no mobile (BAIXO — implementar antes de escalar)

**Arquivo:** `painel reps/dashboard-rep-template.html`

**Problema atual:** O painel usa paginação manual com botões "ver mais" / "ver menos". Com 51 leads do Iramar hoje, o rep precisa clicar múltiplas vezes e a página cresce indefinidamente pra baixo. O botão "ver menos" força um scroll automático pra cima, que é uma UX estranha em mobile.

**Comportamento ideal:** scroll infinito — quando o rep chega no final da lista scrollando, mais leads carregam automaticamente. É o mesmo comportamento do WhatsApp, Instagram. Nenhum botão necessário.

**Como implementar:**

**Passo 1:** Adicione o elemento sentinela no HTML, logo após `<div id="show-more-wrap"></div>`:

```html
<div id="scroll-sentinel" style="height:1px;margin-bottom:16px;"></div>
```

**Passo 2:** Substitua a lógica de `showMore` / `showLess` por um `IntersectionObserver`. Localize no script onde `showMore` e `showLess` são definidos e substitua por:

```javascript
// ── SCROLL INFINITO (substitui showMore/showLess) ─────────────
let _observer = null;

function initScrollObserver() {
  if (_observer) _observer.disconnect();
  const sentinel = document.getElementById('scroll-sentinel');
  if (!sentinel) return;

  _observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    const filtered = _activeFilter
      ? _allLeads.filter(l => l.status === _activeFilter && _matchesSearch(l))
      : _allLeads.filter(l => _matchesSearch(l));
    if (_visibleCount >= filtered.length) return; // já mostrou tudo
    _visibleCount += LIMIT;
    renderLeads(_rawLeads);
  }, { rootMargin: '120px' }); // dispara 120px antes do fim

  _observer.observe(sentinel);
}
```

**Passo 3:** Remova os botões "ver mais" e "ver menos" do HTML (dentro de `<div id="show-more-wrap">`).

**Passo 4:** Chame `initScrollObserver()` após cada `renderLeads()` que possa ter adicionado novos itens.

**Passo 5:** Resete `_visibleCount = LIMIT` ao trocar de filtro ou ao receber dados novos do servidor (já acontece em `clearFilter()` e `toggleFilter()` — conferir).

**Por que o `rootMargin: '120px'`:** dispara o load antes do usuário bater no fim da lista, eliminando qualquer percepção de delay. É o mesmo truque usado por apps de feed.

**Compatibilidade:** `IntersectionObserver` é suportado por 97%+ dos browsers modernos. Sem necessidade de polyfill para o perfil de usuário deste sistema.

---

## O que NÃO alterar
- Design, cores, identidade visual
- Lógica de negócio (cálculo de receita, pipeline, conversão)
- Fluxo de Fechado/Perdido com dois passos (valor → data)
- Lógica de undo otimista (`_pendingUndoByRow`)
- Tokens dos representantes (`REP_TOKENS`)
- Estrutura de `ALLOWED_WRITE` no proxy

---

## Ordem recomendada de implementação

1. **Correção 2** (active_all + token telão) — proxy + reimplantar
2. **Correção 1** (localStorage vs servidor) — template
3. **Correção 3** (lock no campo legado) — proxy + reimplantar
4. **Melhoria 4** (scroll infinito) — template — implementar antes de escalar para mais reps

---

## Validação após correções

1. Abrir o painel do Iramar em dois dispositivos diferentes → atualizar um status em um dispositivo → recarregar no outro → timestamp deve aparecer igual nos dois
2. Chamar `?action=active_all` sem token → deve retornar `{"error":"token inválido"}`
3. Chamar `?action=active_all&token=lifeb_telao_2026` → deve retornar os leads normalmente
4. Verificar que o telão continua funcionando após adicionar o token na chamada
5. (Melhoria 4) Scrollar até o final da lista no mobile → novos leads devem carregar automaticamente sem nenhum toque em botão
