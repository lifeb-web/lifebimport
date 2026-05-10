# Contexto — Dashboard de Leads (Planilha)
Atualizado: 2026-05-10

---

## O que é

Painel de gestão que lê dados da planilha Google Sheets via proxy (Apps Script).
Exibe KPIs, funis, tabelas de leads ativos, fechamentos e últimos leads.
Dois arquivos separados para usos diferentes — NÃO são o mesmo arquivo.

---

## Arquivos

| Arquivo | Uso | Localização |
|---|---|---|
| `dashboard-leads.html` | Versão responsiva — celular e desktop | Raiz do gh-pages |
| `dashboard-leads-telao.html` | Versão fixa 1080p — TV/telão da equipe | Raiz do gh-pages |

URLs publicadas:
- Mobile: `https://projetojlbv.com.br/dashboard-leads.html` (ou `lifeb-web.github.io/lifebimport/dashboard-leads.html`)
- Telão: `https://projetojlbv.com.br/dashboard-leads-telao.html`

---

## Proxy de dados

- **Arquivo:** `lifeb-leads-proxy.gs` (Google Apps Script)
- **Fonte:** Planilha Google Sheets (aba LEADS)
- **Mesma URL** para mobile e telão

### Actions disponíveis no proxy
| Action | O que retorna |
|---|---|
| `summary` | KPIs gerais: total, sdr{}, vend{}, receita, pipeline, media_dias, media_speed_to_lead, firstDate, todayCount, lastModified |
| `funnel` | Contagens por status SDR e vendedor |
| `by_rep` | Totais por representante (total, ag_cont, em_cont, em_neg, fechado, perdido, receita) |
| `active_all` | Leads ativos de todos os reps — requer token `0ef82354c11e4f518d90fe5c3935b767` |
| `closed` | Lista de fechamentos com empresa, rep, valor, dias, data_f |
| `latest` | Últimos leads cadastrados (nome, empresa, data, hora, status_sdr) |
| `ads` | Investimento Meta Ads — aba ADS da planilha, uma linha por dia: `DATA \| PLATAFORMA \| VALOR`, atualizado automaticamente pelo Manus IA |

---

## Seções de cada dashboard

### Mobile (`dashboard-leads.html`)
1. **12 cards KPI** (grid 2 colunas mobile / 4-6 colunas desktop):
   - Total de Leads, Qualificados SDR, Em Tratativa, Fechamentos, Receita Total,
     Taxa de Conversão, Potencial em Aberto, Investimento ADS, ROAS, ACOS, CAC, **Speed to Lead**
2. **Funil SDR** + **Funil Vendedor** (barras horizontais com %)
3. **Tabelas** (scroll horizontal em mobile):
   - Por Representante (Rep, Total, Ag., Cont., Neg., Fech., Perd., Receita) — **dinâmico, sem hardcode**
   - Últimos Leads (Nome/Empresa, Entrada, Status SDR) — últimos 10
   - Fechamentos (Empresa, Rep, Valor, Dias, Data)
   - **Leads Ativos — Goiás** (Empresa, **Rep** em negrito, Status) — filtra `estado === 'GO'`
   - **Leads Ativos — DF** (Empresa, **Rep** em negrito, Status) — filtra `estado === 'DF'`
   - **Leads Ativos — Outros** (Empresa + (UF), **Rep** em negrito, Status) — filtra outros estados, **oculto quando vazio**

### Telão (`dashboard-leads-telao.html`)
1. **12 cards KPI** em faixa horizontal no topo
2. **Layout 3 colunas** (`grid-template-columns: 21fr 45fr 34fr`):
   - **Esquerda:** Funil SDR + Funil Vendedor
   - **Centro:** Cards de leads ativos por território (flex coluna, `flex:1` cada)
     - **Leads Ativos — Goiás**: 5 colunas `Empresa | Cidade | Status | Rep (negrito) | Potencial`
     - **Leads Ativos — DF**: mesma estrutura
     - **Leads Ativos — Outros**: coluna Cidade mostra `Cidade / UF`; oculto quando vazio
     - Colgroup: `27% | 21% | 22% | 16% | 14%`
     - Badges no header: Aguardando / Em Contato / Negociando / Total
   - **Direita:** Últimos Leads + Fechamentos + Por Representante
3. Relógio ao vivo (HH:MM:SS) no header

---

## Lógica de atualização

### Mobile
- `POLL_INTERVAL_MS = 60.000ms` (1 min)
- `FORCE_RELOAD_POLLS = 3` — recarrega dados a cada 3 polls (~3 min) como fallback
- Detecta mudança na planilha via `lastModified` — recarrega só quando planilha muda
- `visibilitychange` — força atualização ao voltar à aba
- Mostra banner verde "Planilha atualizada" quando detecta mudança

### Telão
- `POLL_INTERVAL_MS = 60.000ms` (1 min)
- `FORCE_RELOAD_POLLS = 1` — recarrega a cada poll (sempre atualiza)
- `AUTO_RELOAD_MS = 35min` — watchdog: recarrega página inteira se sem dados por 35min
- `visibilitychange` — força atualização ao voltar à aba

### Sequência de carga (ambos)
```
checkForUpdates() → proxy('summary') → se mudou → loadAllData()
loadAllData(): renderSummary() + Promise.allSettled([
  proxy('funnel'),
  proxy('by_rep'),
  proxy('active_all', { token: '0ef82354c11e4f518d90fe5c3935b767' }),
  proxy('closed'),
  proxy('ads'),
  proxy('latest'),
])
```

---

## Status dos dados de Ads
O campo `ads` (Investimento ADS e ROAS) é atualizado **manualmente** na planilha.
Não vem do Meta automaticamente. Quando não há dados, os cards mostram `—`.

---

## Ordenação dos leads ativos (ambos os dashboards)
Aguardando contato primeiro → demais por data de entrada ascendente.
```javascript
const pa = a.status === 'Aguardando contato' ? 0 : 1;
const pb = b.status === 'Aguardando contato' ? 0 : 1;
if (pa !== pb) return pa - pb;
return (a.data || '').localeCompare(b.data || '');
```

---

## Erros e tratamento

- `showError(msg)` — exibe banner vermelho por 7s (não bloqueia tela)
- `emptyRow(cols)` — "Sem dados" quando tabela vazia
- `errRow(cols)` — "Erro ao carregar" quando fetch falha
- Proxy com `AbortController` timeout de 25s
- Falhas individuais de tabela não impedem as demais de carregar (`Promise.allSettled`)

---

## Pendências conhecidas (2026-04-27)

### Alta prioridade
- **Responsividade mobile do `dashboard-leads.html`**: cards KPI e tabelas estouram horizontalmente em telas pequenas. Problema documentado desde as primeiras sessões, sempre adiado. A correção envolve revisar o grid dos cards e o scroll das tabelas no mobile.

### Média prioridade
- **`correcao-dashboard.md` — Correção 3**: caminho legado de campo único no proxy sem LockService. Baixo risco pois undo usa campo único com pouca concorrência, mas deveria ter lock.

### Baixa prioridade
- **Unificação de chamadas ao proxy**: hoje são 6 chamadas paralelas por carga. Sugestão de criar action `dashboard_data` que retorna tudo em 1 chamada. Relevante se escalar para mais reps ou o proxy começar a atingir limites.

### Já resolvidas (não refazer)
- Race condition polling (`_isLoading`) ✅
- `_inFlight` pode ficar negativo ✅
- `visibilitychange` em ambos ✅
- Token `active_all` ✅ (já passa `0ef82354c11e4f518d90fe5c3935b767`)
- `statusBadgeSdr` sem classe para "Não identificado" ✅
- Relógio sem referência salva ✅
- Leads de teste excluídos dos cálculos e exibições compartilhadas ✅ (commits `000177c9`, `4f0ef8b1`, `9d0e7ea4`)
- Funil vendedor ocultava zeros inconsistentemente vs funil SDR ✅ (commit `238e531f`)
- Fechamento sem data_f sumia da tabela ✅ (commit `0076c965`)

---

## Regra do filtro de teste — ESTADO FINAL (não alterar sem entender)

**Função:** `isTesteLead(r)` em `lifeb-leads-proxy.gs`

```javascript
function isTesteLead(r) {
  var re = /\btestes?\b/i;
  return re.test(String(r[COL_NOME] || '')) || re.test(String(r[COL_EMPRESA] || ''));
}
```

**Lógica:** palavra exata "teste" ou "testes" (case-insensitive, com borda de palavra `\b`) no nome OU empresa do lead. "Protestech" não é filtrado — "Empresa Teste Ltda" é.

**Onde se aplica:**

| Função | Filtro? | Motivo |
|---|---|---|
| `getSummary` | ✅ sim | KPIs gerais — views compartilhadas |
| `getByRep` | ✅ sim | Tabela por rep — views compartilhadas |
| `getFunnel` | ✅ sim | Funis SDR/Vendedor — views compartilhadas |
| `getActiveAll` | ✅ sim | Leads ativos no telão/mobile — views compartilhadas |
| `getClosed` | ✅ sim | Tabela fechamentos — views compartilhadas |
| `getChart` | ✅ sim | Gráfico por dia — views compartilhadas |
| `getLatest` | ✅ sim | Últimos leads — views compartilhadas |
| `getActive` | ❌ não | Painel individual do rep — rep vê seus próprios leads |
| `getRepHistory` | ❌ não | Histórico individual do rep — rep vê seu histórico |
| `doPost` | ❌ não | Escrita — leads de teste ainda são atualizados na planilha |

**Por que o filtro fica no proxy e não no frontend:** o frontend recebe dados já agregados (totais, contagens). Não tem como filtrar leads individuais dos KPIs sem refazer os cálculos no servidor.

---

## Regra de exclusão por STATUS_SDR inválido — ESTADO FINAL (2026-05-05)

**Função:** `isExcluido(r)` em `lifeb-leads-proxy.gs`

```javascript
function isExcluido(r) {
  var s = String(r[COL_STATUS_SDR] || '').trim();
  return s === 'Duplicado' || s === 'Número incorreto';
}
```

**Lógica:** leads com STATUS_SDR igual a `Duplicado` ou `Número incorreto` são excluídos de todos os cálculos e exibições.

**Onde se aplica:**

| Função | Filtro? |
|---|---|
| `getSummary` | ✅ sim — junto com isTesteLead |
| `getByRep` | ✅ sim — junto com isTesteLead |
| `getFunnel` | ✅ sim — junto com isTesteLead |
| `getActiveAll` | ✅ sim — dentro do forEach |
| `getClosed` | ✅ sim — junto com isTesteLead |
| `getChart` | ✅ sim — junto com isTesteLead |
| `getLatest` | ✅ sim — junto com isTesteLead |
| `getActive` | ✅ sim — rep não vê leads inválidos |
| `getRepHistory` | ✅ sim — rep não vê leads inválidos |
| `doPost` | ❌ não — escrita ainda permitida |

**ATENÇÃO — regra de implementação:** `getActive` e `getRepHistory` filtram `isExcluido` DENTRO do forEach (não como pré-filtro do getRows()). Se o filtro for aplicado antes do forEach, os índices `i` ficam errados e `row: i + 2` aponta para a linha errada na planilha. Isso causa falha no doPost.

---

## Regra do sort de fechamentos — ESTADO FINAL

`getClosed` ordena por `data_f` (data de fechamento) decrescente. Se `data_f` estiver vazia, usa `data` (data de entrada) como fallback. Isso garante que fechamentos sem data de fechamento preenchida **não somem** da tabela — aparecem ordenados pela data de entrada.

```javascript
result.sort(function(a, b) {
  return (b.data_f || b.data || '').localeCompare(a.data_f || a.data || '');
});
```

O objeto retornado por `getClosed` inclui o campo `data` para viabilizar esse fallback.

---

## Regra dos funis — ESTADO FINAL

Ambos os funis (SDR e Vendedor), em mobile e telão, ocultam etapas com valor 0. Etapas vazias não aparecem. Implementado com `.filter(i => i.value > 0)` na lista de itens antes de chamar `renderFunilBar`.

---

## Regras de deploy

**Atenção:** o `deploy.sh` das landing pages (React/Vite) NÃO afeta os dashboards — eles vivem no worktree e são deployados diretamente via git.

1. Editar os arquivos no worktree: `/Users/robertmarques/Desktop/lifebimport-jlbv-pages/`
2. Commitar e publicar:
   ```bash
   cd /Users/robertmarques/Desktop/lifebimport-jlbv-pages
   git add dashboard-leads.html dashboard-leads-telao.html
   git commit -m "dash: descrição da mudança"
   git push origin gh-pages
   ```
3. Copiar para Dropbox (backup local):
   ```bash
   cp dashboard-leads.html "/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR/dashboard-leads.html"
   cp dashboard-leads-telao.html "/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR/dashboard-leads-telao.html"
   ```
4. Commitar o arquivo de contexto atualizado:
   ```bash
   git add source/contexto-dash-leads.md && git commit -m "docs: atualiza contexto dash leads" && git push origin gh-pages
   ```

**Por que Dropbox é necessário:** o `deploy.sh` das landing pages usa `rsync` e preserva os dashboards, mas o Dropbox é o único backup local caso o worktree seja corrompido ou recriado.

---

## Commits relevantes
- `b9c2aadb` — active_all com token, scroll infinito (revertido depois)
- `ebefa57d` — revert scroll infinito → showMore/showLess
- `2dc82d45` — mobile: active_all, title 'Dashboard Leads Mobile'
- `1ab6ee34` — taxaQualif%, sort Aguardando-first, auto-carrega histórico
- `6500b1d6` — telão: FORCE_RELOAD=1, retry 15s, watchdog 35min
- `000177c9` — proxy: isTesteLead() adicionado — exclui leads de teste das views compartilhadas
- `4f0ef8b1` — proxy: isTesteLead removido de getActive e getRepHistory (painéis individuais de rep)
- `9d0e7ea4` — proxy: isTesteLead refinado com regex `/\btestes?\b/i` (palavra exata, evita "Protestech")
- `238e531f` — dash: funil vendedor oculta etapas com 0 (consistente com funil SDR) — mobile e telão
- `0076c965` — proxy: getClosed ordena com fallback data_f → data de entrada (fechamento sem data não some)

---

## Cards de métricas de anúncio — ACOS e CAC (2026-04-30)

Adicionados em `dashboard-leads.html` (mobile) e `dashboard-leads-telao.html`.
Os dados de investimento já eram puxados da aba 2 da planilha via proxy — sem mudança de backend.

### ACOS (Advertising Cost of Sale)
- **Fórmula:** `investimento / receita × 100` → exibido como `"X.X%"`
- **Cor:** amber (`#b45309`), classe `.accent-amber`
- **Onde calcula:** `renderAds(inv, rec)` — já tinha `inv` e `rec` disponíveis
- **Fallback:** exibe `"—"` quando `inv = 0` ou `rec = 0`

### CAC (Custo de Aquisição de Cliente)
- **Fórmula:** `investimento / nFechamentos` → exibido em R$ via `cur()`
- **Cor:** violet (`#7c3aed`), classe `.accent-violet`
- **Onde calcula:** `loadAllData()` — reutiliza o bloco `cacEl` já existente, extraindo `cacInv` e `cacNFech` como variáveis compartilhadas (o badge `fechados-cac` no header continua intacto)
- **Fallback:** exibe `"—"` quando `inv = 0` ou `nFechamentos = 0`

### Grid mobile (dashboard-leads.html)
- 11 cards no total
- `< 640px`: 2 colunas — `card-rt` ocupa `span 2`, restante em pares (ACOS e CAC ficam juntos na última linha)
- `640px+`: `repeat(4, 1fr)`
- `1024px+`: `repeat(6, 1fr)`

### Telão (dashboard-leads-telao.html)
- Faixa de cards é `display:flex` — 11 cards com `flex:1` se ajustam automaticamente

---

## Responsividade do telão para 13" — max-height breakpoints (2026-05-01)

O telão usa `height:100vh; overflow:hidden` — sem scroll, tudo deve caber na tela.
Adicionados breakpoints de ALTURA (não largura) pois o gargalo em 13" é vertical (~800px lógico).

### `@media (max-height: 820px)` — notebooks 13" típicos
- `header`: 58px → 46px
- `#telao-cards`: 112px → 88px
- `.m-val`: 28px → 21px / `.rt-num`: 32px → 26px / `.funil-num`: 20px → 16px
- Padding e gap reduzidos; footer comprimido
- Libera ~50px extras para o conteúdo principal

### `@media (max-height: 700px)` — telas muito pequenas
- `header`: 40px / `#telao-cards`: 76px / fontes menores ainda

Telão de TV (height > 820px): layout original intacto, nenhuma mudança.

---

## Card Fechamentos — fill height (2026-05-01)

O `table-scroll` do card FECHAMENTOS no telão tinha `max-height:178px;flex:none`.
Isso deixava espaço em branco quando o card era maior que 178px.

**Fix:** trocado para `flex:1;min-height:0;overflow-y:auto`
O scroll continua ativo quando a lista cresce além do espaço disponível.

---

## Commits relevantes (atualizado 2026-05-01)
- `b9c2aadb` — active_all com token, scroll infinito (revertido depois)
- `ebefa57d` — revert scroll infinito → showMore/showLess
- `2dc82d45` — mobile: active_all, title 'Dashboard Leads Mobile'
- `1ab6ee34` — taxaQualif%, sort Aguardando-first, auto-carrega histórico
- `6500b1d6` — telão: FORCE_RELOAD=1, retry 15s, watchdog 35min
- `000177c9` — proxy: isTesteLead() adicionado
- `4f0ef8b1` — proxy: isTesteLead removido de getActive e getRepHistory
- `9d0e7ea4` — proxy: isTesteLead refinado com regex `/\btestes?\b/i`
- `238e531f` — dash: funil vendedor oculta etapas com 0
- `0076c965` — proxy: getClosed ordena com fallback data_f → data de entrada
- `288682ed` — feat: card ACOS nos dois dashboards (mobile e telão)
- `fec9c616` — feat: card CAC nos dois dashboards (mobile e telão)
- `8117fb45` — telão: fechamentos table fill card height (flex:1 ao invés de max-height fixo)
- `ee710e19` — telão: media queries max-height 820px/700px para notebooks 13"
- `8146a3ce` — auditoria: sessão 2026-05-01 documentada
- `12127a1a` — fix: labels telão não cortam mais (m-label wrap 2 linhas, labels longos abreviados)
- `f58afb14` — feat: isExcluido() — leads Duplicado e Número incorreto fora de todos os cálculos e funis

---

## Captura de Primeiro Contato WhatsApp (2026-05-02)

### Objetivo
Registrar o momento exato do primeiro contato do rep com o lead via WhatsApp,
para calcular tempo médio de primeiro contato no dashboard futuramente.

### Coluna AG — PRIMEIRO CONTATO VEND
- Tipo: Date object (gravado como `new Date(now)` — legível no Sheets)
- Gravada **uma única vez** — proxy verifica se célula está vazia antes de gravar
- Invisível pro rep — disparo silencioso em background (fire-and-forget)
- Leads anteriores à feature: coluna AG vazia (não há como recuperar retroativamente)

### Pontos de captura no template
Dois fluxos cobrem todos os caminhos de abertura do WhatsApp:

1. **`doContactWa(row)`** — "Abrir WhatsApp" no overlay do painel de contatos
   - Cobre: contato principal, contato empresa, telefone no painel Info
2. **`doConfirmLink(id)`** quando `conf.classList.contains('link-wa')`
   - Cobre: ícone WhatsApp do card principal
   - Não captura Maps (classe `link-maps`)

### Função helper no template
```js
function trackPrimeiroContato(row) {
  fetch(PROXY_URL, { method:'POST', headers:{'Content-Type':'text/plain'},
    body: JSON.stringify({ token:REP_TOKEN, row, rep:REP_NAME, action:'set_primeiro_contato' }) })
    .catch(() => {});
}
```

### Proxy — action set_primeiro_contato
```js
const COL_PRIMO_CONTATO = 32; // AG (0-based)
// Em doPost:
if (action === 'set_primeiro_contato') {
  const jaRegistrado = sheet.getRange(row, COL_PRIMO_CONTATO + 1).getValue();
  if (jaRegistrado) return jsonResponse({ ok: true, skip: true });
  // grava com LockService...
  sheet.getRange(row, COL_PRIMO_CONTATO + 1).setValue(new Date(now));
}
```

### Coluna AH — DELTA CONTATO MIN ✅ FUNCIONANDO
- Tipo: inteiro (minutos)
- `Math.ceil((now - tsEntrada.getTime()) / 60000)` — arredonda pra cima
- `Math.max(1, deltaMin)` — mínimo 1 min (garante preenchimento mesmo com delta < 30s)
- `tsEntrada` lido da coluna H (DATA ENVIO AO VENDEDOR) — momento que o lead foi enviado ao rep
- `now` = mesmo timestamp gravado em AG — logo: AH = AG − H em minutos

### Card Speed to Lead nos dashboards ✅ FUNCIONANDO
- ID: `card-speed-to-lead`, classe `.accent-indigo`
- Dado: `media_speed_to_lead` retornado por `getSummary` (média da coluna AH, ignorando zeros)
- Display: `Xh Ymin` se ≥ 60 min, senão `Xmin`
- Grid mobile: `.card-speed { grid-column: span 2 }` em < 640px (12 cards = 6 linhas perfeitas)
- Telão: `flex:1` auto-ajusta como os demais cards

### Proxy getSummary — Speed to Lead
```js
const delta = toNum(r[COL_DELTA_CONTATO]);
if (delta > 0) { totalSpeed += delta; countSpeed++; }
// ...
const media_speed_to_lead = countSpeed > 0 ? Math.round(totalSpeed / countSpeed) : 0;
```

### Fix colateral: TIMESTAMP_VEND (coluna AF)
Antes gravava epoch ms bruto (número). Agora grava `new Date(now)` — legível no Sheets.
Leitura via `Number(r[COL_TIMESTAMP_VEND])` permanece compatível (`Number(Date)` = epoch ms).

### Commits Speed to Lead (2026-05-02)
- `82b51a5c` — proxy: set_primeiro_contato, COL_PRIMO_CONTATO=32, COL_DELTA_CONTATO=33
- `71cbe237` — fix: ≈ (U+2248) removido do proxy (causava SyntaxError linha 21)
- `e45f8e89` — fix: AH usa Math.ceil + Math.max(1) — sempre preenche mesmo delta < 30s
- `5d230c99` — fix: token ROBERT_TESTE corrigido nos painéis gerados

---

## Auditoria completa (2026-05-05) — commits 6e313cb5 + dfbb612d

### Bug crítico corrigido: row index errado em getActive e getRepHistory

**Causa:** `isExcluido()` filtrava rows ANTES do `forEach(r, i)`. O `i` virava índice do array filtrado, não da planilha. `row: i + 2` apontava pra linha errada → proxy rejeitava com "lead não pertence a este representante" → rep não conseguia salvar nada.

**Fix (6e313cb5):** filtro `isExcluido(r)` movido pra dentro do `forEach`, preservando índice original.

```js
// ANTES (bug):
const rows = getRows().filter(r => !isExcluido(r));
rows.forEach(function(r, i) { result.push({ row: i + 2 ... }) });

// DEPOIS (correto):
const rows = getRows(); // sem filtro — índices preservados
rows.forEach(function(r, i) {
  if (isExcluido(r)) return; // skip interno
  result.push({ row: i + 2 ... });
});
```

**Impacto:** qualquer planilha com leads Duplicado/Número incorreto antes de leads ativos do rep causava o erro. Natanael não conseguia alterar status de nenhum lead que tivesse leads excluídos antes na planilha.

### Robustez do proxy (dfbb612d)
- `getRows()` e `doPost` agora usam `getSheetByName('LEADS')` com fallback para `getSheets()[0]` — imune a reordenação de abas
- `set_primeiro_contato`: verificação `jaRegistrado` movida para dentro do lock — elimina race condition entre dois cliques simultâneos

### Visibilidade de erros no template (dfbb612d)
Todos os `catch(_)` críticos foram convertidos para `catch(err)` + `console.error`. Erros agora aparecem no console do DevTools para facilitar diagnóstico futuro.

| Função | Antes | Depois |
|---|---|---|
| `trackPrimeiroContato` | `.catch(() => {})` | `.catch(err => console.error(...))` |
| `savePot` | `catch(_)` silencioso | `catch(err)` + `console.error('savePot failed:', err)` |
| `saveObs` | `catch(_)` silencioso | `catch(err)` + `console.error('saveObs failed:', err)` |
| `saveStatusExtra Fechado` | `catch(_)` silencioso | `catch(err)` + `console.error(...)` |
| `saveStatusExtra Perdido` | `catch(_)` silencioso | `catch(err)` + `console.error(...)` |
| `confirmStatusChange` | `catch(_)` silencioso | AbortController 25s + `catch(err)` + `console.error(...)` |

### Commits desta auditoria
- `6e313cb5` — fix: row index incorreto em getActive/getRepHistory quando há leads excluídos
- `dfbb612d` — fix: auditoria completa — proxy robusto + erros visíveis no console

---

## Leads Ativos por Território — arquitetura (2026-05-10, commits c327401b + 016a3f17)

### Lógica de filtragem
- Dados vêm de `active_all` (já retorna campo `estado` via `COL_ESTADO=17`)
- **Nenhuma mudança no proxy** — filtragem 100% no frontend
- Função: `renderEstadoCard(estadoSigla, tbodyId, badgeId[, negId, agId, contId][, cardId])`
  - Filtra `leads` por `(l.estado||'').toUpperCase().trim() === estadoSigla`
  - Para `'OUTROS'`: filtra leads cujo estado NÃO é `GO` nem `DF`
  - Card Outros: `card.style.display = estadoLeads.length ? '' : 'none'`

### IDs dos elementos — mobile
| Card | tbodyId | badgeId | cardId |
|---|---|---|---|
| Goiás | `tb-ativos-go` | `ativos-badge-go` | — |
| DF | `tb-ativos-df` | `ativos-badge-df` | — |
| Outros | `tb-ativos-outros` | `ativos-badge-outros` | `card-ativos-outros` |

### IDs dos elementos — telão (badges adicionais)
| Card | ag | cont | neg | total | cardId |
|---|---|---|---|---|---|
| Goiás | `ativos-ag-go` | `ativos-cont-go` | `ativos-neg-go` | `ativos-badge-go` | — |
| DF | `ativos-ag-df` | `ativos-cont-df` | `ativos-neg-df` | `ativos-badge-df` | — |
| Outros | `ativos-ag-outros` | `ativos-cont-outros` | `ativos-neg-outros` | `ativos-badge-outros` | `card-ativos-outros` |

### UF no card Outros
- **Mobile**: `(UF)` em span muted após o nome da empresa (`font-size:10px;color:var(--muted);font-weight:600`)
- **Telão**: coluna Cidade mostra `Cidade / UF` (`cidadeFmt + ' / ' + l.estado.toUpperCase()`); header do card Outros tem "Cidade / UF"; GO e DF têm só "Cidade"
- Implementado via `estadoSigla === 'OUTROS'` dentro do `.map()` — sem duplicação de função

### Rep em negrito
- Mobile: `font-weight:700` na `<td>` do Rep
- Telão: `font-weight:700` na `<td>` do Rep
- Facilita scan visual rápido de quem está atendendo cada lead

### Ordem das colunas — telão
`Empresa | Cidade[/UF] | Status | Rep | Potencial` — Status entre Cidade e Rep cria separação visual, espaço para UF no card Outros

---

## Feature planejada — Filtros de Período (2026-05-08)

### Decisão de design (pesquisa + discussão)
Pesquisa em Pipedrive, HubSpot, Salesforce, Bitrix24, RD Station e literatura de UX/sales ops confirmou:
- **Sem toggle global de "data de entrada / data de fechamento"** — nenhum CRM de referência usa isso no dashboard principal. Gera desconfiança nos dados.
- **Padrão da indústria**: filtro por data de entrada para métricas de pipeline; receita/fechamentos por data de fechamento — comportamento automático por seção, invisível ao usuário.
- **Default recomendado**: "Esse mês" (calendário fixo, não rolling 30d) — mais natural para acompanhamento de metas mensais.

### Botões de período
`Hoje | 7d | 30d | Esse mês (padrão) | Mês ant. | 90d | Total`

Aplicados a **ambos os arquivos**: `dashboard-leads.html` (mobile/desktop) e `dashboard-leads-telao.html` (usado ativamente no desktop, com interação).

### Comportamento por seção

| Seção | Critério de data |
|---|---|
| Total leads, Qualificados SDR, Em tratativa | Data de entrada (`COL_DATA`) |
| Funil SDR + Funil Vendedor | Data de entrada (cohort) |
| Speed to Lead | Data de entrada |
| Por Representante | Data de entrada |
| Últimos Leads | Data de entrada |
| **Receita, Fechamentos** | **Data de fechamento (`COL_DATA_FECH`)** |
| **ROAS, ACOS, CAC** | **Data da despesa ADS** (ver estrutura abaixo) |
| Potencial em aberto | **Não filtra** — snapshot atual |
| Leads Ativos Iramar / Natanael | **Não filtra** — snapshot atual |

### Estrutura dos dados de ADS
Aba `ADS` na planilha Google Sheets com colunas: `DATA | PLATAFORMA | VALOR`
- Uma linha por dia por plataforma (Meta, etc.)
- O proxy precisará de uma nova action ou parâmetros `startDate`/`endDate` no `getAds` atual para agregar VALOR por intervalo de data
- ROAS/ACOS/CAC calculados com: investimento = soma de VALOR da aba ADS no período; receita = soma de fechamentos por `COL_DATA_FECH` no período

### Mudanças necessárias no proxy
Todas as actions que recebem filtro de período precisam aceitar `startDate` + `endDate` (formato `YYYY-MM-DD`):
- `summary` — filtra por `COL_DATA` (entrada); receita e fechamentos filtram por `COL_DATA_FECH`
- `funnel` — filtra por `COL_DATA`
- `by_rep` — filtra por `COL_DATA`
- `closed` — filtra por `COL_DATA_FECH`
- `latest` — filtra por `COL_DATA`
- `ads` — filtra aba ADS por DATA, soma VALOR no intervalo
- `active_all`, `active`, `rep_history` — **não filtram** (estado atual)

### Mudanças no frontend (ambos os dashboards)
- Barra de filtros sticky abaixo do header com botões de período
- `resolvePeriod(range)` → `{ startDate, endDate, label }` (mesmo padrão do telão GA4)
- `setRange(range, btn)` → atualiza período ativo e dispara `loadAllData()`
- Todas as chamadas ao proxy incluem `startDate` e `endDate` como query params ou no body
- Mobile: barra com scroll horizontal
- Labels dos cards de Receita/Fechamentos indicam visualmente que usam data de fechamento (a definir: subtexto pequeno ou não)

### Status
**PLANEJADO** — a implementar. Há mudanças a fazer no dash antes desta feature (a definir pelo usuário).
