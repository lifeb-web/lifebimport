# Contexto — Dashboard GA4 (Analytics)
Atualizado: 2026-04-27

---

## O que é

Painel de analytics que lê dados do Google Analytics 4 via proxy (Apps Script).
Exibe métricas de tráfego, eventos, leads por página, cidades, fontes e funil de conversão.
Dois arquivos separados — NÃO são o mesmo arquivo.

---

## Arquivos

| Arquivo | Uso | Localização |
|---|---|---|
| `dashboard-ga4.html` | Versão responsiva — celular e desktop | Raiz do gh-pages |
| `dashboard-telao.html` | Versão fixa 1080p — TV/telão | Raiz do gh-pages |

---

## Proxy GA4

- **Arquivo:** `lifeb-ga4-proxy.gs` (Google Apps Script)
- **Property ID GA4:** `532575691`
- **Auth:** `ScriptApp.getOAuthToken()` — OAuth do Google, não API key
- **URL:** separada da URL do proxy de leads (dois Apps Script distintos)
- `muteHttpExceptions: true` em todas as chamadas

### Se der erro de autenticação
Rodar a função `autorizarGA4()` no editor do Apps Script e reimplantar.
Testado em 2026-04-27: retornou 859 active users sem erro.

### Actions disponíveis (parâmetro `action` na query string)
| Action | O que retorna |
|---|---|
| `summary` | activeUsers, sessions, screenPageViews, bounceRate, averageSessionDuration |
| `chart` | activeUsers por dia (ou por hora se período = hoje) |
| `pages` | Top 10 páginas por activeUsers |
| `cities` | Top 20 regiões/cidades por activeUsers |
| `sources` | Top 10 fontes/medium por activeUsers e sessions |
| `events` | Contagem de eventos específicos (Lead_Formulario, ScrollDepth_*, etc.) |
| `leads` | Contagem de Lead_Formulario por dimensão (pagePath, source, region+city) |
| `realtime` | Usuários ativos agora (Realtime API) |

### Parâmetros de período
- `?days=30` → últimos 30 dias (padrão)
- `?days=1` → hoje (chart vira por hora)
- `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` → período customizado

---

## Seções do dashboard

### Mobile (`dashboard-ga4.html`)
- Seletor de período (hoje / 7d / 30d / 90d / customizado)
- Cards KPI: Usuários, Sessões, Visualizações, Bounce Rate, Duração Média
- Comparativo com período anterior (% variação)
- Gráfico de usuários ativos ao longo do tempo (Chart.js ou similar)
- Tabela de fontes/origens
- Tabela de eventos (Lead_Formulario, ScrollDepth, etc.)
- Tabela de leads por página
- Tabela de leads por cidade
- Tabela de páginas mais visitadas

### Telão (`dashboard-telao.html`)
- Mesmo conteúdo em layout fixo 1920×1080
- `scaleToFit()` via zoom CSS para adaptar a qualquer TV
- `renderFunilTelao` — funil visual horizontal exclusivo do telão
- `window.__lifebTelaoEvents` — cache de eventos
- `FORCE_RELOAD=1` e watchdog próprio

---

## Lógica de carga — CRÍTICA (não alterar sem entender)

### Regra absoluta: NUNCA exibir erro visível ao usuário
Qualquer falha de API = `—` nos cards ou linha vazia nas tabelas. Nunca mensagem de erro.
`showError()` não tem chamadas ativas. `errRow()` substituído por `emptyRow()` em todos os catches.

### Causa raiz dos erros históricos
Muitas chamadas paralelas ao GA4 causavam rate limit no Apps Script.
Solução: dividir em 2 blocos sequenciais.

### Estrutura de loadAll (2 blocos sequenciais)
```javascript
// BLOCO 1 — KPIs críticos (máx 4 paralelas)
const [dSumAtual, dSumDuplo, evAtual, evDuplo] = await Promise.all([
  proxy('summary').catch(() => null),
  shouldCompare ? proxy('summary', snapDays*2).catch(() => null) : null,
  proxy('events').catch(() => null),
  shouldCompare ? proxy('events', snapDays*2).catch(() => null) : null,
]);
// aguarda bloco 1 terminar antes de iniciar bloco 2

// BLOCO 2 — Tabelas secundárias (máx 5 paralelas)
const [pLeads, sLeads, cLeads, dPages, dCities] = await Promise.all([
  proxy('leads', pagePath).catch(() => null),
  proxy('leads', source).catch(() => null),
  proxy('leads', region+city).catch(() => null),
  proxy('pages').catch(() => null),
  proxy('cities').catch(() => null),
]);
```

Render-phase adicional (após blocos): `chart` (2 calls) + `sources` (1 call) = 3 concurrent máx.

---

## Commits relevantes desta sessão (2026-04-27)
- `d3dc73f9` — timeout AbortController 25s no proxy()
- `5e6a3e48` — pages e cities movidos para pré-fetch
- `b482032f` — batch split em 2 blocos + zero erros visíveis ao usuário

---

## Regras de deploy

1. Editar no worktree: `/Users/robertmarques/Desktop/lifebimport-jlbv-pages/`
2. `git add dashboard-ga4.html dashboard-telao.html && git commit && git push origin gh-pages`
3. Copiar para pasta local:
   ```
   cp /Users/robertmarques/Desktop/lifebimport-jlbv-pages/dashboard-ga4.html "/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR/dashboard-ga4.html"
   cp /Users/robertmarques/Desktop/lifebimport-jlbv-pages/dashboard-telao.html "/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR/dashboard-telao.html"
   ```
4. Commitar este arquivo de contexto atualizado em `source/`:
   ```
   git add source/contexto-dash-ga4.md && git commit && git push
   ```

---

## Pendências conhecidas (2026-04-27)
Nenhuma pendência crítica. Sistema estável após sessão de 2026-04-27.

---

## Não alterar
- Estrutura de 2 blocos sequenciais no loadAll — foi a solução para rate limit
- Regra de zero erros visíveis — qualquer falha = silêncio ou `—`
- Property ID `532575691`
- Timeout de 25s no AbortController
