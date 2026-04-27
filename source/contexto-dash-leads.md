# Contexto — Dashboard de Leads (Planilha)
Atualizado: 2026-04-27

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

---

## Regras de deploy

1. Editar os arquivos no worktree: `/Users/robertmarques/Desktop/lifebimport-jlbv-pages/`
2. `git add dashboard-leads.html dashboard-leads-telao.html && git commit && git push origin gh-pages`
3. Copiar para pasta local:
   ```
   cp /Users/robertmarques/Desktop/lifebimport-jlbv-pages/dashboard-leads.html "/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR/dashboard-leads.html"
   cp /Users/robertmarques/Desktop/lifebimport-jlbv-pages/dashboard-leads-telao.html "/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR/dashboard-leads-telao.html"
   ```
4. Commitar este arquivo de contexto atualizado:
   ```
   git add source/contexto-dash-leads.md && git commit && git push
   ```
5. Verificar MD5: worktree = pasta local

---

## Commits relevantes
- `b9c2aadb` — active_all com token, scroll infinito (revertido depois)
- `ebefa57d` — revert scroll infinito → showMore/showLess
- `2dc82d45` — mobile: active_all, title 'Dashboard Leads Mobile'
- `1ab6ee34` — taxaQualif%, sort Aguardando-first, auto-carrega histórico
- `6500b1d6` — telão: FORCE_RELOAD=1, retry 15s, watchdog 35min
