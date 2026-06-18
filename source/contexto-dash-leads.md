# Contexto — Dashboard de Leads (Planilha + Agendor CRM)
Atualizado: 2026-06-18

---

## ⚡ REDESIGN 2026-06-01 — Cockpit por Representante (LER PRIMEIRO)

O dashboard virou **cockpit de gestão pra diretoria**: telão no escritório pra analisar, decidir e COBRAR os reps. Objetivo: menos dado de lead, tudo sobre todos os reps + funis, fechamentos mantidos. Aplicado em mobile + telão + proxy.

### Estrutura final
- **KPIs (13, todos mantidos + 1 novo)**: Total de Leads (+ custo por lead), **Aguardando SDR** (novo — leads `Aguardando abordagem`, repõe o valor do "Últimos Leads" removido), Qualificados, Em Tratativa, Fechamentos, Receita, Conversão, Potencial, Invest. ADS, ROAS, ACOS, CAC, Speed to Lead (global). Nada foi cortado do topo.
- **Saúde da Carteira** — semáforo de idade dos leads ativos por DATA DE ENTRADA: 🟢 ≤15d · 🟡 16–30d · 🔴 >30d ("esfriando"). Mobile: strip de 3 células. Telão: banda no topo da coluna central. Card vermelho **pulsa** (`.alert`) quando >0.
- **Desempenho por Representante (CORAÇÃO)** — formato **placar/ranking** (ordenado por receita desc, 🥇🥈🥉 + `.top` destacado no 1º):
  - Mobile: cards empilhados em `#rep-grid` (1/2/3 col). Telão: cards em `#rep-scoreboard` que preenchem a coluna central (`flex:1 1 0` cada — acaba o vazio da tabela fina antiga).
  - Cada card: conversão, **mini-funil próprio** (Ag/Cont/Neg/Fech/Perd em `.rep-funnel`/`.rf-seg`), aging 🟢🟡🔴 + ativos, receita, ticket médio, prazo médio de fechamento, 1º contato médio.
- **Funil SDR + Funil Vendedor** globais (mantidos).
- **Fechamentos Recentes** (mantido — única lista lead-a-lead).
- **REMOVIDO**: Leads Ativos GO/DF/Outros, Últimos Leads. Funções `renderAtivos`, `renderLatest`, `statusBadge`, `statusBadgeSdr` deletadas.

### ⭐ TUDO É CALCULADO CLIENT-SIDE (não depende de reimplantar o proxy)
`loadAllData` chama `funnel`, `by_rep`, `active_all`, `closed`, `ads` (5). Helper `buildRepData(rByRep, rActive, rClosed)` enriquece no cliente:
- **aging** (verde/amarelo/vermelho/ativos) ← contado de `active_all` pela `data` (entrada) via `ageDaysFromIso()`.
- **ticket_medio** ← `receita / fechado` (de `by_rep`).
- **prazo_medio** ← média de `dias` dos fechamentos do rep (de `closed`).
- Carteira global = soma dos baldes dos reps (`renderCarteira(reps)`).
- `active_all` volta ao fluxo mas SÓ pra agregação — nenhuma lista de lead é exibida.
- **Único campo que precisa do proxy:** `speed_medio` (1º contato por rep) — `COL_DELTA_CONTATO` não é exposto por lead. Mostra "—" até reimplantar o proxy; resto enche na hora.

### Proxy — `getByRep` enxugado
Voltou a só: total/ag_cont/em_cont/reun/em_neg/fechado/perdido/receita + `speed_medio` (média `COL_DELTA_CONTATO`). Aging/ticket/prazo saíram do proxy (agora client-side). **Reimplantar o proxy só acende a coluna "1º contato por rep"** — todo o resto já funciona com o proxy atual.

### Polimento 2026-06-01 (commit `8b02ca67`)
- **Fechamentos**: deixou de ser lista de nomes → **resumo agregado** (`renderFechados` popula `#fechados-resumo`): Total fechado / Nº negócios / Ticket médio + 🏆 maior negócio (único nome exibido) + **tendência por mês** (barras `.fch-month`/`.fcm-bar`, agrupado por `data_f`). Tabela `tb-fechados` removida.
- **Card "Aguardando SDR" (estava 0) → "Leads Hoje"** (`card-leads-hoje` = `todayCount`, sub = média/dia). Cor `.accent-sky` (#0284c7).
- **Disciplina de cor**: vermelho só p/ alerta. Conversão por rep `< 10%` → pílula vermelha `.rep-conv-low` (cobrança).
- **Mini-funil por rep**: caixinhas → **barra empilhada proporcional** (`.rf-bar`/`.rf-seg` flex=count) + legenda (`.rf-legend`/`.rf-lg`).

### Refino visual 2026-06-01 (anti-poluição)
- **KPIs paleta calma**: removidas as bordas/fundos coloridos (eram 13 cores = arco-íris). Regra CSS `#telao-cards .card-metric` / `.cards-row .card-stat` neutraliza borda+fundo; só Total (card-rt herói) e Receita (`.accent-highlight`) ficam coloridos. Cor reservada p/ onde significa: carteira, funis, alerta de conversão.
- **Fechamentos sem repetição**: tirados "Total fechado" (=KPI Receita), "Negócios" (=KPI Fechamentos) e badge CAC (=KPI CAC). Card agora = **Ticket médio · Este mês (mês corrente) · Maior negócio + 🏆 empresa + tendência por mês**.
- **PROXY**: ⚠️ o `source/lifeb-leads-proxy.gs` estava DEFASADO (faltava bloco Meta Ads que Robert adicionou direto no GAS). Corrigido — agora repo = versão real (1000 linhas, Meta Ads + `speed_medio`). REGRA: nunca entregar `.gs` sem confirmar versão deployada. Ver [[feedback_proxy_drift]].
- **1º contato por rep**: proxy reimplantado por Robert — `by_rep` retorna `speed_medio` por rep (testado ao vivo: IRAMAR 45min, NATANAEL 36min). Meta Ads automação confirmada intacta (`ads` retornou dados de 31/05).

### Leaderboard escalável (TELÃO) 2026-06-01 (commit `745c0ae9`)
Problema: cards verticais de rep com `flex:1` não escalavam — com 6-8 reps viravam fatias ilegíveis num telão sem scroll. E o centro estava colorido demais + coluna direita vazia.
- **Centro = LEADERBOARD de linhas** (`#rep-scoreboard` → `.lb-head` header de colunas fixo + `.lb-rows` com `.lb-row` `flex:1 1 0`). Com 3 reps linhas altas, com 8 reps linhas baixas — **escala de 2 a 10+ sem scroll** (renderizado por `repRowHTML`, validado com 3 e 8 reps). Grid `.lb-grid`: rank·nome·conv·carteira(idade 🟢🟡🔴)·funil(barra)·receita·ticket·prazo·1ºcontato. Linha do 1º lugar com borda dourada (`.lb-row.top`). Conv <10% em vermelho (`.lb-conv.low`).
- **Saúde da Carteira movida p/ coluna DIREITA** (vertical, `.cart-band` flex-column, 3 células com borda-esquerda colorida) acima dos Fechamentos → enche o vazio da direita + limpa o centro.
- **Grid telão**: `20fr 50fr 30fr` (funis | leaderboard | carteira+fechamentos).
- **Menos cor**: legenda do funil sem quadradinhos coloridos (só a barra colorida + header como legenda); aging com emoji 🟢🟡🔴 + número escuro.
- **MOBILE** continua em cards empilhados (`#rep-grid`/`repCardHTML`) — escala via scroll natural; legenda do funil também virou texto cinza.

### Preenchimento + pipeline 2026-06-01 (commit `5b882aad`)
- **Linha do leaderboard vira 2 níveis** (`.lb-row` flex-column: `.lb-grid` + `.lb-sub`) → enche o espaço vazio das linhas altas quando há poucos reps. 2ª linha (`.lb-sub`): **R$ X em pipeline · N ativos · N perdidos**.
- **Pipeline por rep** (novo): `buildRepData` soma `pot` dos leads ativos (de `active_all`) → `r.pipeline`. Mostrado no telão (sub) e no mobile (linha de ativos do card).
- **Fechamentos "Este mês" → "Últimos 30 dias"** (rolling, filtro por `data_f >= hoje-30d`) — evita zerar no dia 1º do mês.

### Auditoria (2026-06-01)
Sintaxe JS (mobile+telão+proxy) OK · 0 IDs do JS sem `id=` no HTML · `<div>` balanceados · runtime sem erros (proxy novo/antigo/vazio) · `buildRepData` validado (ranking, aging, ticket, prazo) · `renderFechados` agregado validado (total/maior/tendência) · alerta de conversão baixa OK.

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
| `ads` | Investimento Meta Ads (investimento, ultimaData) — atualizado manualmente |

---

## Seções de cada dashboard

### Mobile (`dashboard-leads.html`)
1. **12 cards KPI** (grid 2 colunas mobile / 4-6 colunas desktop):
   - Total de Leads, Qualificados SDR, Em Tratativa, Fechamentos, Receita Total,
     Taxa de Conversão, Potencial em Aberto, Investimento ADS, ROAS, ACOS, CAC, **Speed to Lead**
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

### Clareza p/ diretoria não-técnica 2026-06-01 (commit `797515f9`)
Régua nova: **diretor sem conhecimento técnico tem que bater o olho e entender.**
- **Linha "TOTAL DA EQUIPE"** no rodapé do leaderboard (`totalRowHTML`, `.lb-total` flex:none) — receita/fechados/pipeline/conv média do time. Bottom line executiva.
- **Funis com % por etapa** (`renderFunilBar` → `.funil-pct`) + badges de taxa: **"X% QUALIFICAM"** (SDR) e **"X% FECHAM"** (Vendedor = fechado/total com vendedor). Adicionado `vend-total-badge` no header do Funil Vendedor do telão.
- **Carteira em %** (`renderCarteira` preenche `cart-*-pct`): "X% da carteira esfriando" — alerta com leitura direta.
- **Destaque verde**: receita do rep ≥ média do time fica verde (`.lb-num.good` / `.rm-val.good`); top continua com linha dourada.
- **Labels claros**: header do leaderboard "Idade dos leads" / "Funil de vendas" / "Conversão".
- Pipeline mantido (Robert confirmou que reps atualizam o valor potencial — dado real).

### Clicável / expansível — overview → detalhe (2026-06-01, commit `22a1bb14`)
Padrão "visão limpa por cima, detalhe ao clicar". Modal reutilizável `#detail-modal` (✕/ESC/clicar-fora fecha). `loadAllData` guarda `_activeLeads` (active_all) e `_closedList` (closed) pros modais. Delegação de clique única (`document` listener) roteia por `data-drill` + KPI cards.
- **Clicar num rep** (`.lb-row`/`.rep-card` com `data-drill="rep:NOME"`) → `showRep`: leads ativos (mais antigo no topo) + fechamentos do rep.
- **Clicar na carteira** (`.cart-cell` com `data-drill="carteira:verde|amarelo|vermelho"`) → `showCarteira`: leads daquela faixa de idade (com coluna Rep).
- **Clicar em Fechamentos** (`data-drill="fechados"`) → `showFechados`: lista completa (maiores primeiro) — detalhe lead-a-lead volta SOB DEMANDA.
- **Clicar em qualquer KPI** (delegação acha `[id^=card-]` dentro do card) → `showKpiHelp` com `KPI_HELP`: explicação em português claro p/ diretor não-técnico (ex: "ROAS 7x = pra cada R$1 de anúncio, voltaram R$7").
- Helpers: `dmOpen/dmClose`, `statusPill`, `fmtDataBR`, `leadsTable`, `closedTable`. CSS `.dm-*`, `.clickable`, cursor:pointer nos elementos clicáveis.
- Telão também é clicável (funciona em desktop/touch; na TV é passivo, sem prejuízo).

### KPI clicável → info rica (2026-06-01, commit `ecc4f5e4`)
Clicar num card do topo deixou de mostrar só a frase de ajuda — agora abre **explicação curta + DADOS por trás** (`showKpi(id)`, helper `repBreak`). Guarda `_summary`/`_reps`/`_ads` no loadAllData.
- Total/Qualificados → leads por etapa do SDR (com %). Em Tratativa → lista completa de ativos. Receita/Fechamentos → receita por rep + negócios fechados. Conversão → conversão por rep. Potencial → pipeline por rep + maiores em aberto. Speed to Lead → 1º contato por rep. ROAS/ACOS/CAC/ADS → o cálculo com os números reais (ex: "Receita ÷ Investimento = 7,04x"). `KPI_HELP` mantém a explicação em PT claro.

### Auditoria + refino (2026-06-01, commit `1cabd46f`)
- **TOTAL DA EQUIPE** redesenhado: era grade que cortava o nome + tinha "Σ" estranho → agora linha full-width (`.lb-total` flex, `totalRowHTML` sem grid) com Receita/Fechados/Conversão/Pipeline/Ativos.
- **Leads Hoje (modal)**: `active_all` só tem leads atribuídos, então não listava os de hoje. Trazido `proxy('latest')` de volta (`_latest`), `latestTable` lista os de hoje (Empresa/Hora/Status SDR) + números (entraram hoje / total).
- **Travessões removidos**: todos os `—` (em-dash) e `–` (en-dash) trocados por `-`/`:` nos 2 HTMLs (pedido do Robert — "cara de IA"). Manter assim.
- **Linhas do leaderboard**: `justify-content: space-between` (conteúdo topo+base) — menos vazio.
- **Fechamentos**: `.fch-trend` com `flex:1` preenche a altura (acaba vazio da direita no telão).
- **NOVO — faturamento mês a mês POR REP**: clicar num rep mostra `monthlyTrendHTML(fechs)` (barras dos últimos 6 meses do rep) + total no topo, antes dos leads ativos e fechamentos.

---

## ⚡ MIGRAÇÃO INBOUND → AGENDOR CRM (2026-06-18)

### Contexto da migração
Todos os leads inbound foram migrados para o Agendor CRM (reps operam via Bia). A planilha virou **histórico imutável** — não é mais atualizada com novos leads inbound. O dashboard inbound agora faz **merge Sheets (histórico) + Agendor (live)**.

### GAS Proxy — agendor-outbound-proxy.gs (novo arquivo)
Proxy separado do proxy da planilha. Suporta `?origin=inbound|outbound`. Arquivo em:
`/Users/robertmarques/Dropbox/.../agendor-outbound-proxy.gs`

URL do proxy:
`https://script.google.com/macros/s/AKfycbxIkdzKQX1ioaaFg3p70ekootWk7eB57dux91h9afLWV9MxVGlU0gvteMoDazWfn5A6fg/exec`

**Parâmetros:** `?origin=inbound|outbound&period=90d&bust=TIMESTAMP`

**Resposta:**
```json
{
  "ok": true,
  "kpis": { "ativos", "pipelineTotal", "ganhoValor", "ganhoCont", "perdidoCont", "conversao", "prazoMedio", "staleTotal", "leadsNoPeriodo" },
  "funnel": [ { "stageId", "name", "color", "seq", "count", "value", "dropFrom" } ],
  "reps": [ { "id", "name", "ativos", "pipeline", "ganhoValor", "ganhoCont", "perdidoCont", "conversao", "ticketMedio" } ],
  "deals": [ { "id", "title", "value", "stage", "stageId", "stageSeq", "stageColor", "repId", "rep", "createdAt", "updatedAt", "stale" } ],
  "recentWon": [...],
  "recentLost": [...]
}
```

**Filtro origin:** `leadOrigin` fica no PERSON (não no deal). Proxy busca `/people?per_page=100` separado, monta `{personId → origin}`. Deals sem person ou sem origin → default OUTBOUND (grandfathered).

**Stages inbound:**
- 3771722 = Conexão (seq 1)
- 3771723 = Diagnóstico (seq 2)
- 3771724 = Solução (seq 3)
- 3771725 = Negociação (seq 4)

### Merge Sheets + Agendor no dashboard inbound
Planilha carrega primeiro → salva `_sheetsFechados/_sheetsReceita/_sheetsQualif` → renderiza cards. Agendor carrega em paralelo via `loadAgendorInbound()` → `_mergeAgendorKpis(k)` soma por cima.

```javascript
const AGENDOR_PROXY = 'https://script.google.com/.../exec';
let _agDeals = [];        // todos os deals ativos (para drill por etapa)
let _agKpisMerged = null; // kpis do Agendor (para re-merge quando Sheets chegar depois)
let _agLoading = false;
let _sheetsFechados = 0, _sheetsReceita = 0, _sheetsQualif = 0;
```

`_mergeAgendorKpis(k)` atualiza:
- `card-fechados` = `_sheetsFechados + k.ganhoCont`
- `card-receita` = `_sheetsReceita + k.ganhoValor`
- `card-potencial` = `k.pipelineTotal`
- `card-conv` = `(totalFech / _sheetsQualif) * 100`
- `card-fechados-sub` = N perdidos

### Funil SDR removido
Migrado para GS Engage. `renderFunilBar('funil-sdr', ...)` removido. Card HTML "Funil SDR" removido em ambos os arquivos. Comentário preservado: `// SDR funnel removido — migrado pro GS Engage`.

### Funil CRM (substituiu Funil Vendedor)
`renderAgendorFunil(funnel)` renderiza etapas live do Agendor no container `#funil-vend`.

Visual por etapa: dot colorido (azul/roxo/âmbar/verde por seq) + nome + valor da etapa + badge de drop rate + barra + count + %.

**Clicável (2026-06-18):** cada etapa tem `data-stage-id` e `onclick="_showStageDrillInbound(stageId, stageName)"`. Abre `detail-modal` com lista de deals daquela etapa, ordenados por valor desc, cada deal é link para `https://app.agendor.com.br/negocio/${d.id}`.

```javascript
function _showStageDrillInbound(stageId, stageName) {
  const deals = _agDeals.filter(d => String(d.stageId) === String(stageId));
  // ... dmOpen com lista de deal-row clicáveis para Agendor
}
```

### Telão 13" a 100% de zoom — breakpoint 1380px
Breakpoints reordenados (cascata max-width correta: 1450 → 1380 → 1250 → 1050):
- `@media (max-width: 1380px)`: grid 18fr/53fr/29fr, m-val 22px, funil-nome 90px, telao-cards 96px, header comprimido
- A 90% de zoom o viewport é ~1518px (não ativa nenhum breakpoint) — a 100% ativa o 1380px

### Commits 2026-06-18
- `6eda1041` — funil CRM ao vivo (Agendor), removeu funil SDR, mobile + telão
- `07122683` — funil CRM clicável + drill por etapa + layout melhorado + fix 13" 100% zoom

---

### Polish de sofisticação (2026-06-01, commit `d2de10e4`)
- **Hover premium** nos clicáveis: KPIs/rep-cards/fechados elevam (`translateY(-2/-3px)` + sombra roxa); linhas do leaderboard e células da carteira com feedback. Transições .15s.
- **Modal**: entrada suave (`@keyframes dm-in` fade+scale) + `backdrop-filter: blur(3px)` no fundo + hover nas linhas das tabelas (`.dm-table tbody tr:hover`).
- **Números alinhados**: `font-variant-numeric: tabular-nums` nos valores (m-val/rt-num/lb-num/cart-num/fch-val/etc).
- Auditoria completa: 0 erros em TODOS os renders e modais (rep/carteira/fechados/13 KPIs), 0 órfãos, divs balanceados, 0 travessões.

### UX/UI refino + melhorias (2026-06-01, commit `dad3a77d`)
- **Leaderboard sem vão**: `.lb-row` virou `flex:0 0 auto` + min-height 60px (altura natural, conteúdo centrado); `.lb-rows` com `justify-content: space-evenly` (linhas + TOTAL espalhados uniformemente). Acabou o "buraco no meio" do space-between.
- **Barra de receita comparativa por rep** (telão): `.lb-recbar`/`.lb-recfill` mostra a receita do rep relativa ao líder (`maxRec`) - ouro no 1º (`.gold`), verde acima da média (`.good`). Preenche a linha + ranking visual.
- **Alerta de 1º contato lento**: `speed_medio > 60min` fica vermelho (`.lb-num.bad` / `.rm-val.bad`), igual ao alerta de conversão < 10%.
- Polish anterior (mesma data): hover premium (elevação+sombra nos clicáveis), modal com fade+scale+blur, `tabular-nums`.
