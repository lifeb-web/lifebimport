# Contexto — Dashboard de Leads (Planilha)
Atualizado: 2026-04-28

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
| `summary` | KPIs gerais: total, sdr{}, vend{}, receita, pipeline, media_dias, firstDate, todayCount, lastModified |
| `funnel` | Contagens por status SDR e vendedor |
| `by_rep` | Totais por representante (total, ag_cont, em_cont, em_neg, fechado, perdido, receita) |
| `active_all` | Leads ativos de todos os reps — requer token `0ef82354c11e4f518d90fe5c3935b767` |
| `closed` | Lista de fechamentos com empresa, rep, valor, dias, data_f |
| `latest` | Últimos leads cadastrados (nome, empresa, data, hora, status_sdr) |
| `ads` | Investimento Meta Ads (investimento, ultimaData) — atualizado manualmente |

---

## Seções de cada dashboard

### Mobile (`dashboard-leads.html`)
1. **9 cards KPI** (grid 2 colunas mobile / 9 colunas desktop):
   - Total de Leads, Qualificados SDR, Em Tratativa, Fechamentos, Receita Total,
     Taxa de Conversão, Potencial em Aberto, Investimento ADS, ROAS
2. **Funil SDR** + **Funil Vendedor** (barras horizontais com %)
3. **Tabelas** (scroll horizontal em mobile):
   - Por Representante (Rep, Total, Ag., Cont., Neg., Fech., Perd., Receita)
   - Últimos Leads (Nome/Empresa, Entrada, Status SDR) — últimos 10
   - Fechamentos (Empresa, Rep, Valor, Dias, Data)
   - Leads Ativos Iramar (Empresa, Status, Entrada)
   - Leads Ativos Natanael (Empresa, Status, Entrada)

### Telão (`dashboard-leads-telao.html`)
1. **Mesmos 9 cards KPI** em faixa horizontal no topo (altura fixa 112px)
2. **Layout 3 colunas** (`grid-template-columns: 21fr 45fr 34fr`):
   - **Esquerda:** Funil SDR + Funil Vendedor
   - **Centro:** Leads Ativos Iramar + Leads Ativos Natanael
     - Tabela mais rica: 5 colunas (Empresa, Cidade/UF, Status, Potencial, Entrada)
     - Badges separados por status: Ag. / Cont. / Neg. / Total
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

**Por que `getActive` e `getRepHistory` não filtram:** o rep de teste (ex: `robert-teste`) precisa ver seus próprios leads de teste no painel dele para poder trabalhar/testar o sistema.

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
