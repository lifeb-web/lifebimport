# Projeto JLBV — Life B Import
Landing page B2B para o Projeto JLBV da Life B Import, focada em lojistas de farmácias, drogarias e supermercados.

## Negócio
- **Produto**: acessórios de higiene e beleza (Life B Import / LVL Importadora LTDA)
- **CNPJ**: 33.751.598/0001-00
- **Produto detalhe**: acessórios de higiene e beleza como escovas de cabelo, buchas de banho, protetores de seios, entre outros. Alta compra por impulso — cliente não pesquisa preço como faz com remédio, leite ou arroz.
- **Projeto JLBV**: modelo de exposição estratégica dos produtos dentro das lojas dos clientes (gôndolas organizadas por categoria). A Life B fornece, organiza e dá suporte. O lojista paga pelos produtos, mas sem custo de implantação. Os cases de crescimento (+300%, +450%, +500%) são sempre referentes à categoria de acessórios de higiene e beleza.
- **Público**: lojistas B2B — farmácias, drogarias, supermercados, perfumarias, lojas de conveniência (Goiás e Distrito Federal)
- **99,9% tráfego mobile**
- **Budget de anúncios**: R$100/dia divididos entre campanhas de teste
- **Fluxo**: consultor qualifica o lead → passa para vendedor → follow-up
- **Cases reais**: Droga Center DF (R$27k → R$160k, +500%), Super Couto GO (R$3k → R$12k, +300%), Drogarias Distrital DF (R$15k → R$80k, +450%)

## Stack
- React + Vite + TypeScript + Tailwind CSS + shadcn/ui + framer-motion
- Hospedagem: GitHub Pages (repositório: lifeb-web/lifebimport, branch: gh-pages)
- Domínio: projetojlbv.com.br (DNS na Hostinger)
- Imagens: CloudFront (d2xsxph8kpxj0f.cloudfront.net)

## Páginas ativas
| URL | Descrição |
|-----|-----------|
| `projetojlbv.com.br/` | Principal — imagens + formulário |
| `projetojlbv.com.br/direto/` | Imagens + CTA direto ao WhatsApp |
| `projetojlbv.com.br/video1/` | Vídeo supermercado (Vimeo) no hero + formulário |
| `projetojlbv.com.br/video1-direto/` | Vídeo no hero + CTA direto ao WhatsApp |
| `projetojlbv.com.br/video2/` | Vídeo farmácia (YouTube) no hero + formulário — vídeos invertidos em relação ao /video1/ |
| `projetojlbv.com.br/rmk/` | Remarketing — curta, sem vídeo, formulário, foco em objeção |
| `projetojlbv.com.br/contato/` | Igual à principal mas sem redirecionamento para WhatsApp — formulário coleta dados e envia para planilha, follow-up feito pelo consultor por ligação |

Todas as páginas são variantes do componente `Home` em `client/src/pages/Home.tsx`:
- `<Home />` → página principal
- `<Home directMode />` → sem formulário, evento Contato_WhatsApp
- `<Home variant="video1" />` → vídeo supermercado (Vimeo) no hero; seção depoimentos mostra só farmácia (YouTube)
- `<Home variant="video1" directMode />` → vídeo no hero + sem formulário
- `<Home variant="video2" />` → vídeo farmácia (YouTube) no hero; seção depoimentos mostra só supermercado (Vimeo)
- `<Home variant="rmk" />` → página de remarketing
- `<Home variant="contato" />` → igual à principal, mas sem WhatsApp — botão vira "Enviar", sem link para WhatsApp, consultor faz follow-up por ligação. Flag interna: `noWhatsapp = true`

## Estrutura da página /rmk
1. Hero — FOMO + urgência regional + CTA + trust bar (vagas limitadas por região)
2. Quebra de objeção — fundo branco, sem custo extra de implantação, sem risco, sem compromisso
3. Cases — 3 cards com logos dos clientes, contadores animados, antes/depois, ícone TrendingUp
4. Por que acessórios — 3 cards visuais explicando o comportamento de compra por impulso
5. Como funciona — versão comprimida, 3 passos curtos
6. CTA final forte — gradiente roxo/magenta, "Pronto para ter o JLBV na sua loja?", botão "Quero implantar na minha loja"
7. Footer com WhatsApp
8. Botão flutuante WhatsApp

## Copy da /rmk — decisões importantes
- H1: "Enquanto você avalia, outra loja da sua região pode estar implantando primeiro." (FOMO, não dor)
- Subtítulo hero: "Mais de 2.000 lojistas já decidiram. O que está segurando você?"
- Trust bar hero: "✓ Vagas limitadas por região · resposta em minutos"
- Nunca dizer "a implantação não custa nada" — usar "sem custo extra de implantação" ou "a implantação não tem custo adicional ao pedido"
- CTA hero/meio: "Quero esse resultado na minha loja"
- CTA final: "Quero implantar na minha loja"
- Logos dos clientes: /logos/droga-center.png, /logos/super-couto.png, /logos/drogaria-distrital.png (imagens recortadas sem espaço branco)
- Página gerou 2 leads nos primeiros dias após otimização para remarketing

## Decisões de copy importantes
- Nunca usar "SDR" — público não entende
- Nunca usar "investimento inicial" — passa ideia errada (o lojista paga pelos produtos)
- Usar "sem custo de implantação" (nunca "sem taxa de adesão" — remete a plano de celular)
- Evitar travessões grandes (—) — remetem a IA
- Botões sempre com "Quero esse resultado na minha loja" como CTA principal
- Urgência por disponibilidade regional (verdadeira): "Nosso time atende por região"
- "Sua loja" em vez de "sua farmácia/supermercado" — mais inclusivo

## Eventos Meta Pixel (ID: 1659173615439958)
| Evento | Quando dispara |
|--------|---------------|
| `PageView` | Ao carregar a página |
| `Abrir_Formulario` | Qualquer botão CTA (com source indicando qual botão) |
| `Preencheu_Formulario` | Ao digitar qualquer coisa no formulário (dispara 1x por abertura) |
| `Lead_Formulario` | Ao enviar o formulário com nome + telefone (clicou em "Continuar para o WhatsApp") |
| `Pular_Formulario` | Ao clicar no link "Pular e ir direto para o WhatsApp" (texto pequeno abaixo do botão de envio) |
| `Abandonou_Formulario` | Ao fechar o modal clicando no X — dispara sempre, independente de ter preenchido ou não. Se tiver telefone válido preenchido, também salva na planilha |
| `Contato_WhatsApp` | CTAs nas páginas directMode |
| `ScrollDepth_25/50/75/100` | Ao rolar a página |

### Lógica do funil de eventos
- Todo `Lead`, `Abandonou` e `Pular` obrigatoriamente passou por um `Abrir_Formulario` antes
- `Abrir_Formulario >= Lead + Abandonou + Pular` (sempre)
- `Preencheu_Formulario` dispara no GA4 e Meta mas **não aparece no dashboard** (removido para não confundir)
- Os eventos de scroll afetam a taxa de rejeição: qualquer evento durante a sessão já a marca como "engajada" no GA4

### Fix 13/04/2026 — Pular_Formulario não dispara Abandonou_Formulario
**Bug**: ao clicar em "Pular e ir direto para o WhatsApp", o modal fechava com `submittedRef.current = false`, fazendo o `useEffect` do Abandonou disparar junto com o Pular. Lógica incorreta — quem pulou não abandonou.

**Correção**: o botão "Pular" dentro do `LeadModal` agora seta `submittedRef.current = true` antes de chamar `onSkip()`. Isso faz com que o `useEffect` do Abandonou ignore o fechamento provocado pelo Pular.

```jsx
onClick={() => { submittedRef.current = true; onSkip(); }}
```

**Lógica correta após fix**: `Pular_Formulario` e `Abandonou_Formulario` são mutuamente exclusivos. Nunca disparam juntos.

---

### Fix 13/04/2026 — Eventos GA4 desacoplados do Meta Pixel (Lead e Preencheu)
**Bug**: `Lead_Formulario` e `Preencheu_Formulario` no GA4 dependiam do Meta Pixel estar disponível. Se fbq não estivesse carregado (ad blocker, falha de rede), o `gtag` também não disparava. Os outros eventos (Abrir, Abandonou, Pular, ScrollDepth, Contato_WhatsApp) já estavam corretos.

**Correção**: em ambos os eventos, o `gtag` foi movido para antes da verificação de `fbq`, garantindo que dispara independente do Meta Pixel. Padrão adotado: GA4 sempre primeiro, Meta Pixel depois com seu próprio `if (fbq)`.

**Estado correto de todos os eventos após 13/04/2026**:
- `Lead_Formulario`: gtag dispara antes, fbq depois (com hashing async)
- `Preencheu_Formulario`: gtag dispara antes, fbq depois (com eventID)
- `Abrir_Formulario`, `Abandonou_Formulario`, `Pular_Formulario`, `ScrollDepth_*`, `Contato_WhatsApp`: já estavam corretos (gtag e fbq em ifs separados)

### Fix 13/04/2026 — Abandonou_Formulario disparando em todo carregamento de página
**Bug**: o `useEffect` que dispara `Abandonou_Formulario` rodava na montagem do componente com `isOpen = false` e `submittedRef = false` (estados iniciais), fazendo o evento disparar em 100% dos carregamentos de página sem o formulário ter sido aberto. Visível nos dados: 4 Abandonou vs 1 Abrir no mesmo lote de eventos do dia.

**Correção**: adicionado `hasOpenedRef = useRef(false)` no componente `LeadModal`. O ref passa para `true` apenas quando `isOpen` se torna `true` (modal realmente aberto). O useEffect do Abandonou passou a verificar `hasOpenedRef.current` antes de disparar — garantindo que só dispara após o modal ter sido aberto de verdade.

**Impacto nos dados históricos**: os dados de `Abandonou_Formulario` anteriores a 13/04/2026 estão inflados (cada visita gerava 1 Abandonou). Os dados de `Abrir_Formulario` estão corretos. A partir do deploy (13/04/2026), a relação `Abrir >= Abandonou + Pular + Lead` volta a ser respeitada.

### Comportamento do localStorage (jlbv_lead)
- Salva nome + telefone após envio (`Lead_Formulario`) ou abandono com telefone válido
- Na segunda visita o formulário aparece pré-preenchido com os dados salvos
- **Atenção**: se `jlbv_lead` estiver definido no browser, o botão CTA vai direto para o WhatsApp sem abrir o formulário (comportamento de "lead retornante"). Limpar localStorage para testar como novo visitante: `localStorage.removeItem('jlbv_lead')`

## WhatsApp
- Número: 5562996437218
- Link: `https://api.whatsapp.com/send/?phone=5562996437218&text=Ol%C3%A1%2C+sou+lojista+e+quero+conhecer+o+projeto+JLBV+da+Life+B.&type=phone_number&app_absent=0`

## Leads — Google Sheets
- Webhook: Google Apps Script (URL salva como `SHEETS_WEBHOOK_URL` em Home.tsx)
- URL atual: `https://script.google.com/macros/s/AKfycbxf8BCiia3qwZUh0wUX8pg7xKD-0-p_6ssf7SJAPvCZJjmpJMniwcuAQVFkRl9Mb8wf/exec`
- URL antiga (inativa): `https://script.google.com/macros/s/AKfycbyLJ0T9RmRjI9Um9t4kmUg6GW7he3vCUu-7efnjmSChI2vcrtwFjYRcNCKz5m0RXdEW/exec`
- Colunas: A=data, B=nome, C=telefone, D=origem (botão clicado), E=pagina (URL completa)
- `origem` para leads normais: nome do botão (ex: `hero_cta`, `Botão Flutuante`)
- `origem` para leads abandonados: `{botão} (Abandonou_Formulario)` (ex: `hero_cta (Abandonou_Formulario)`)
- `pagina` usa `window.location.href` — funciona automaticamente para qualquer página nova

## Comportamento do formulário
- `autoComplete="name"` e `autoComplete="tel"` nos campos — browser/celular sugere dados salvos
- **localStorage (`jlbv_lead`)**: salva nome + telefone após envio ou abandono com telefone válido. Na segunda visita o formulário já aparece pré-preenchido. Se o dado estiver salvo, o botão CTA vai direto ao WhatsApp sem abrir o form (lead retornante).
- Leads que preenchem tudo mas não clicam em enviar são capturados automaticamente na planilha com origem `(Abandonou_Formulario)`
- **Fix 12/04/2026**: `Abandonou_Formulario` passou a disparar em qualquer fechamento do X, não apenas quando havia telefone válido preenchido. A planilha e localStorage ainda só salvam com telefone válido.

## Apps Script (Google Sheets webhook)
```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.data,
    data.nome,
    data.telefone,
    data.origem,
    data.pagina,
    "Aguardando abordagem"
  ]);
  // UTMs nas colunas AC(29), AD(30), AE(31) — separado para não sobrescrever ARRAYFORMULA em AB
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 29, 1, 3).setValues([[
    data.campanha || '',
    data.conjunto || '',
    data.anuncio  || ''
  ]]);
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Vídeos
- Supermercado: Vimeo `1178399214` (YouTube foi bloqueado)
- Farmácia: YouTube `aOR4aUSp-zE`
- Vídeo supermercado no hero da /video1: autoplay mudo + toggle de som sem pausar

## Campanhas Meta Ads x Páginas

| Campanha (nome no dashboard) | Página usada | Conversão medida |
|------------------------------|--------------|------------------|
| Página Direta — sem formulário | `/direto/` | Clique no botão WhatsApp (`Contato_WhatsApp`) |
| Página com Imagens — com formulário | `/` | Preenchimento do formulário (`Lead_Formulario`) |
| Página com Vídeo — com formulário | `/video1/` | Preenchimento do formulário (`Lead_Formulario`) |

### Públicos ativos (5 por campanha)
1. Farmácias *(Interesse)*
2. Supermercados *(Interesse)*
3. Similar a clientes Luiz Farma *(LAL 1%)*
4. Similar a clientes (base geral) *(LAL 1%)*
5. Similar a clientes Luiz Super *(LAL 1%)*

## Deploy
Build: `pnpm exec vite build` a partir da raiz do projeto.
O vite.config.ts gera automaticamente após cada build:
- `dist/public/CNAME` → projetojlbv.com.br
- `dist/public/404.html` → cópia do index.html para SPA routing
- `dist/public/.nojekyll` → desativa Jekyll no GitHub Pages
- `dist/public/direto/index.html`
- `dist/public/video1/index.html`
- `dist/public/video1-direto/index.html`
- `dist/public/rmk/index.html`

Deploy da landing page (após build):
```bash
cd /Users/robertmarques/Desktop/lifebimport-jlbv
npx vite build  # gera dist/public/
# copiar dashboard-ga4.html atualizado para dist/public/ antes do deploy
cp /caminho/dashboard-ga4.html dist/public/dashboard-ga4.html
GIT_AUTHOR_NAME="lifeb-web" GIT_AUTHOR_EMAIL="lifeb@lifebimport.com.br" \
GIT_COMMITTER_NAME="lifeb-web" GIT_COMMITTER_EMAIL="lifeb@lifebimport.com.br" \
npx gh-pages -d dist/public -m "mensagem do deploy"
```
**Atenção**: o `pnpm build` falha no esbuild do servidor — usar `npx vite build` que compila só o frontend. O `gh-pages` sempre inclui o `dashboard-ga4.html` junto para não perder o painel.

**Arquivo de edição do dashboard GA4**: `/Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/dashboard-ga4.html`
**Arquivo de edição do dashboard Telão**: `/Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/dashboard-telao.html`

**Backup**: `/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR/` — `dashboard-ga4.html` e `dashboard-telao.html` (atualizados em 14/04/2026)

As páginas precisam ser acessadas **com barra no final** no GitHub Pages.

## Estrutura de arquivos principais
- `client/src/pages/Home.tsx` → componente principal (todas as variantes)
- `client/src/App.tsx` → rotas
- `client/index.html` → Meta Pixel, preconnect Vimeo, fonts
- `client/public/fachada.png` → foto do galpão
- `vite.config.ts` → build config + plugin que gera CNAME/404/nojekyll/rotas

## Identidade visual
- Roxo: `#704B9B`
- Magenta: `#E92085`
- Verde: `#22C35D`
- Texto: `#221B32`

## Dashboard Meta Ads
- Link público: https://lifeb-web.github.io/lifeb-dashboard/
- Repositório: `lifeb-web/lifeb-dashboard` (branch `gh-pages`)
- Arquivo local: `/Users/robertmarques/Downloads/Dashboard Projeto SDR/dashboard-lifeb-meta-ads.html`
- Contexto completo do dashboard: `/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Dashboard Projeto SDR Meta Ads/CONTEXTO-DASHBOARD.md`
- Para atualizar: enviar CSVs exportados do Meta Ads + arquivo de contexto do dashboard ao Claude Code
- Receita e reuniões agendadas são informados manualmente (não vêm do CSV)

## Google Analytics 4 (GA4)
- **Measurement ID**: `G-DX8FW7ZTJ3`
- **Property ID**: `532575691`
- **Conta Google**: lifebimports@gmail.com
- **Nome da propriedade**: Life B - Projeto JLBV
- Instalado em `client/index.html` com tag `gtag.js` padrão
- Todos os eventos do Meta Pixel foram espelhados para o GA4 via `gtag("event", ...)` em `client/src/pages/Home.tsx`
- Os eventos GA4 rodam em paralelo com o fbq — nunca substituem

### Eventos GA4 configurados
| Evento GA4 | Equivalente Meta Pixel |
|-----------|----------------------|
| `Lead_Formulario` | `Lead_Formulario` |
| `Contato_WhatsApp` | `Contato_WhatsApp` |
| `Abrir_Formulario` | `Abrir_Formulario` |
| `Preencheu_Formulario` | `Preencheu_Formulario` |
| `Pular_Formulario` | `Pular_Formulario` |
| `Abandonou_Formulario` | `Abandonou_Formulario` |
| `ScrollDepth_25/50/75/100` | `ScrollDepth_25/50/75/100` |

## Painel de Resultados GA4 (dashboard)
- **URL pública**: `projetojlbv.com.br/dashboard-ga4.html`
- **Arquivo no repositório**: `dashboard-ga4.html` (raiz do gh-pages)
- **Arquivo de edição local**: `/Users/robertmarques/Downloads/dashboard-ga4.html` (sempre editar aqui e fazer deploy via git)
- **Acesso**: sem login — abre direto, sem autenticação
- **Como funciona**: o dashboard chama o Apps Script via `fetch()` com CORS. O Apps Script usa `ScriptApp.getOAuthToken()` para autenticar com o GA4 como dono do script (lifebimports@gmail.com)

### Apps Script (Proxy GA4)
- **Projeto**: Life B | Proxy GA4 (script.google.com, conta lifebimports@gmail.com)
- **URL**: `https://script.google.com/macros/s/AKfycbxGFDgwJhRVHFUYuOc6KRpZgRQ8CLyeNocnmIZqVASQSUt6350m11RzSdvJcWSMnTYzyw/exec`
- **Versão atual**: reimplantada em 13/04/2026 com fix de startDate/endDate
- **Executar como**: USER_DEPLOYING (lifebimports@gmail.com) | **Acesso**: ANYONE_ANONYMOUS
- **Serviço adicionado**: Google Analytics Data API (AnalyticsData, v1beta)
- **Código de referência**: `lifeb-ga4-proxy.gs` nesta pasta (atualizado)
- **appsscript.json**: oauthScopes inclui `analytics.readonly` e `script.external_request`
- **Autorização**: foi concedida executando `autorizarGA4()` uma vez no editor após revogar o acesso antigo em myaccount.google.com/permissions
- **Actions suportadas**: `summary`, `chart`, `pages`, `cities`, `sources`, `events`, `leads`, `realtime`
- **Action `leads`**: aceita parâmetro `dim` (ex: `pagePath`, `sessionSourceMedium`, `region,city`) — filtra evento `Lead_Formulario` e agrupa pela dimensão

### Se precisar recriar o Apps Script do zero
1. Acessar script.google.com com lifebimports@gmail.com
2. Novo projeto, nome: "Life B | Proxy GA4"
3. Colar o código de `lifeb-ga4-proxy.gs` no Código.gs
4. Em appsscript.json, garantir os oauthScopes (analytics.readonly + script.external_request) e webapp (USER_DEPLOYING, ANYONE_ANONYMOUS)
5. Adicionar serviço: Google Analytics Data API (v1beta)
6. Selecionar função `autorizarGA4` e executar — autorizar com lifebimports@gmail.com
7. Implantar como App da Web (Nova versão)
8. Atualizar PROXY_URL no dashboard-ga4.html com a nova URL

### O que o painel mostra
- Visitantes ativos ao vivo (tempo real, atualiza a cada 60s)
- Total de visitantes únicos, visitas e páginas abertas (filtros: Hoje / Ontem / 7 / 14 / 30 dias / Esse mês / Mês passado / 60 / 90 dias)
- Gráfico de visitantes por dia (hoje: por hora; outros períodos: por data)
- Visitantes por página (/, /video1/, /rmk/, /contato/, etc.) + coluna Leads por página
- Cidade e estado dos visitantes + coluna Leads por cidade
- Origem do tráfego traduzida (Facebook Ads, Acesso direto, etc.) + coluna Leads por origem
- Funil de eventos: Abrir, Abandonou, Pular, Lead + ScrollDepth 25/50/75/100

### Métricas e como são calculadas
- **Visitantes únicos**: `activeUsers` do GA4
- **Visitas**: `sessions` do GA4
- **Taxa de conversão**: calculada no dashboard (`Lead_Formulario / activeUsers × 100`) — não vem do GA4
- **Leads**: contagem do evento `Lead_Formulario` buscado separadamente via action=events
- **Leads por tabela**: buscados via action=leads com parâmetro dim (pagePath, sessionSourceMedium, region,city). Zero leads exibem traço pequeno muted (—)
- **Taxa de rejeição**: `bounceRate` do GA4 (0.0~1.0), exibido como %. Afetado pelos eventos: qualquer evento durante a sessão marca como "engajada" (não rejeitada). Nota: taxa alta nos primeiros dias é normal — eventos de scroll só passaram a disparar corretamente em 12/04/2026. No GA4, sessão bounced tem duração = 0, então taxa alta pode coexistir com tempo médio elevado (puxado pelas poucas sessões engajadas)
- **Tempo médio**: `averageSessionDuration` do GA4 em segundos, convertido para min/seg
- **Deltas (↑↓)**: estratégia de período duplo — busca `days` e `days*2`, subtrai para obter período anterior, calcula variação percentual. Ocultos no filtro "Hoje"

### Limites de uso do dashboard
- Apps Script: ~20.000 req/dia gratuitas. Dashboard faz cerca de 10 chamadas por `loadAll` no filtro Hoje/dia único e cerca de 12 chamadas em períodos com comparativo, agora a cada 3 min + 1 chamada de realtime por minuto. Estimativa: ~6.240 a ~7.200 req/dia com 1 tela aberta; ~12.480 a ~14.400 req/dia com 2 telas abertas 24h.
- GA4 Data API: 200.000 tokens/dia — praticamente ilimitado para esse uso
- **Atenção**: em 13/04/2026 o limite foi atingido por testes intensivos. Com os intervalos atuais (realtime 60s, dados 3min) isso não se repete no uso normal com 1 ou 2 telas.
- **Intervalos atuais**: `fetchRealtime` a cada 60s, `loadAll` a cada 180s (3min). Visível no footer do dashboard.

### Filtros de período — lógica de datas
- Filtros numéricos (7, 14, 30, 60, 90 dias): usam parâmetro `days=N` no Apps Script
- **Hoje**: `days=1` — GA4 interpreta como `startDate: 'today', endDate: 'today'`
- **Ontem**: `startDate=YYYY-MM-DD, endDate=YYYY-MM-DD` (data exata do dia anterior)
- **Esse mês**: `days=N` onde N = dia atual do mês (ex: dia 13 = days=13)
- **Mês passado**: `startDate=1º do mês anterior, endDate=último dia do mês anterior`
- **Filtros "dias" incluem hoje**: 7 dias = hoje + 6 dias anteriores. Coerente com GA4 (`7daysAgo` to `today`).
- Comparativos (setas ↑↓) são ocultados para Ontem e Mês passado pois o período duplo não faz sentido nesses casos
- No mobile os botões ficam em scroll horizontal com fade na borda direita

### Fix 13/04/2026 — Conversão zerada na primeira carga
**Bug**: na primeira abertura do dashboard (rede lenta ou Apps Script demorando), o prefetch de eventos (`evAtual`) podia falhar e chegar como `null` para `loadSummaryWithCompare`. A função calculava leads = 0 e exibia "Taxa de Conversão: 0.0%". O card "Leads Gerados" tinha fallback para re-buscar, mas a conversão não tinha.

**Correção**: `loadSummaryWithCompare` agora verifica se `dEvAtual` é null e re-busca os eventos antes de calcular:
```javascript
const evAtualFinal = dEvAtual ?? await proxy('events', undefined, undefined, snap).catch(() => null);
const leadsAtual = +(evAtualFinal?.rows?.find(...) ?? 0);
```
Agora a conversão sempre mostra o valor correto, mesmo na primeira carga com rede lenta.

### Fix 13/04/2026 — Bug UTC em resolvePeriod (datas locais)
**Bug**: `resolvePeriod()` usava `d.toISOString().slice(0,10)` para formatar datas. `toISOString()` converte para UTC antes de formatar. No Brasil (UTC-3), após as 21h o UTC já virou o próximo dia. Resultado: filtros "Hoje", "Ontem", "Mês passado" consultavam o dia errado no GA4 nesse horário.

**Correção**: substituído por formatação local:
```javascript
const fmt = d => {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dy}`;
};
```
Crédito: identificado via análise do GPT-4o.

### Fix 13/04/2026 — Apps Script: suporte a startDate/endDate
**Bug**: o Apps Script ignorava os parâmetros `startDate` e `endDate` em todas as actions. Quando "Ontem" ou "Mês passado" eram selecionados, o parâmetro `days` chegava como `undefined` e o script usava o fallback `days=30`. Resultado: "Ontem" e "Mês passado" mostravam dados dos últimos 30 dias em todos os cards.

**Correção** (linhas iniciais do `doGet`):
```javascript
let dateRange;
let isToday = false;
if (e.parameter.startDate && e.parameter.endDate) {
  dateRange = [{ startDate: e.parameter.startDate, endDate: e.parameter.endDate }];
} else {
  const days = parseInt(e.parameter.days || '30', 10);
  isToday    = (days === 1);
  dateRange  = isToday
    ? [{ startDate: 'today', endDate: 'today' }]
    : [{ startDate: days + 'daysAgo', endDate: 'today' }];
}
```
Agora todas as actions (summary, events, leads, chart, pages, cities, sources) usam `startDate/endDate` quando fornecidos.

**Arquivo atualizado**: `lifeb-ga4-proxy.gs` nesta pasta. Versão reimplantada em 13/04/2026.

### Header e footer do dashboard
- Header: relógio ao vivo + "· atualizado HH:MM" após cada carregamento de dados
- Footer: "Visitantes ao vivo: 1 min · Dados: 3 min · Google Analytics 4 · projetojlbv.com.br"

### Eventos no funil — o que aparece e o que não aparece
- Aparece: `Lead_Formulario`, `Abrir_Formulario`, `Abandonou_Formulario`, `Pular_Formulario`, `ScrollDepth_25/50/75/100`
- Não aparece: `Preencheu_Formulario` (dispara no GA4 e Meta mas não é exibido no painel — removido para não confundir)
- Qualquer evento retornado pelo GA4 que não esteja no `EVENTOS_META` do dashboard é ignorado automaticamente via `flatMap` com early return

### Coluna Leads nas tabelas
- Todas as 3 tabelas (Por Página, Origem do Tráfego, Estado/Cidade) têm coluna Leads
- Por Página: substitui coluna Visualizações. Leads buscados com `dim=pagePath`
- Origem: substitui coluna Visitas. Leads buscados com `dim=sessionSourceMedium`
- Estado/Cidade: 4a coluna adicionada, tabela com `overflow-x:auto` para mobile. Leads buscados com `dim=region,city`
- Lookup por chave: pagePath para páginas, sessionSourceMedium para origens, `region||city` para cidades
- `buildLeadsMap(d, keyFn)` — helper que constrói Map dimensão→contagem a partir da resposta do proxy
- Apps Script action `leads`: filtra `Lead_Formulario` via `stringFilter`, agrupa pela dimensão passada em `dim`

### Eventos principais (conversões) no GA4
Marcados como "evento principal" em GA4 Admin → Exibição de dados → Eventos (12/04/2026):
- `Abrir_Formulario` — qualquer interação com o formulário conta como sessão engajada
- `Abandonou_Formulario`
- `Preencheu_Formulario`
- `Pular_Formulario`
- `Lead_Formulario`

Motivo: no GA4, apenas `user_engagement` (sessão > 10s), conversões ou 2+ pageviews reduzem o bounce rate. Eventos custom sozinhos não contam. Marcando esses 5 como eventos principais, qualquer sessão com interação no formulário passa a ser "engajada".

### Filtros de período — estado atual (13/04/2026)
9 filtros implementados como botões horizontais com scroll no mobile:
**Hoje | Ontem | 7 dias | 14 dias | 30 dias | Esse mês | Mês passado | 60 dias | 90 dias**
- Mobile: scroll horizontal com fade na borda direita
- Desktop: todos visíveis em linha

### Comportamento do "Hoje" — atraso de processamento GA4
- O GA4 processa dados dos relatórios padrão em lotes a cada algumas horas (atraso típico 4-8h)
- O filtro "Hoje" pode aparecer zerado de manhã cedo (ex.: às 7h) e popular automaticamente por volta das 9h-10h — isso é normal, não é bug
- O painel já é 100% automático: busca dados do GA4 a cada abertura ou troca de período, sem ação manual
- O card de "usuários ativos ao vivo" usa `runRealtimeReport` e sempre é imediato — não sofre deste atraso
- Não há como eliminar o atraso do lado do painel: é uma limitação da API de relatórios padrão do GA4

### Melhorias de UX aplicadas — 13/04/2026
- **Taxa de Rejeição**: subtítulo alterado para "sessões sem engajamento · métrica auxiliar" — deixa claro que é métrica secundária influenciada pela configuração de eventos GA4
- **Aviso "Hoje"**: texto discreto aparece abaixo do título "Visão Geral | hoje" apenas quando o filtro "Hoje" está ativo: "Dados de hoje podem ter atraso de processamento no GA4." Some automaticamente ao trocar de filtro.

### Auditoria completa do dashboard — 13/04/2026

Duas auditorias completas foram realizadas (linha a linha). Todos os problemas encontrados foram corrigidos:

| Fix | Descrição |
|-----|-----------|
| `snap` em todas as funções | `loadAll` captura um snapshot do período no início e passa para todas as sub-funções (`loadSummaryWithCompare`, `loadChart`, `loadPages`, `loadCities`, `loadSources`, `loadEvents`). Garante que mesmo se o usuário trocar o filtro durante o carregamento, todos os dados vêm do mesmo período |
| `proxy()` aceita `snap` | 4º parâmetro opcional. Todas as 13 chamadas ao proxy dentro do ciclo de `loadAll` passam `snap` — sem exceção |
| Período duplo com `snap` | `proxy('summary', snapDays * 2, undefined, snap)` — o comparativo também usa o snapshot |
| `/dashboard-ga4.html` filtrado | A tabela "Por Página" ignora a própria URL do dashboard com `.filter(r => r.dimensionValues[0].value !== '/dashboard-ga4.html')` |
| Optional chaining | `dAtual?.rows`, `dDuplo?.rows` — evita crash quando GA4 retorna null para períodos sem dados |
| Apps Script startDate/endDate | Fix descrito acima — "Ontem" e "Mês passado" agora retornam dados corretos |

**Estado após 13/04/2026**: sem bugs conhecidos. Dashboard auditado e coerente com GA4.

---

### Dashboard Telão — 14/04/2026
Criado `dashboard-telao.html` para exibição em TV 4K (1920x1080 fixo) no escritório.

**Características**:
- Layout fixo 1920x1080px, escala automática para qualquer tamanho de tela via `zoom` CSS (não `transform:scale` — zoom re-renderiza na resolução nativa, transform apenas estica pixels)
- `window._telaoScale` armazena o fator de escala atual
- `devicePixelRatio: Math.max(Math.ceil(window._telaoScale || 1), window.devicePixelRatio || 1)` passado ao Chart.js para gráficos nítidos em 4K
- `window.traduzEstado` sobrescrito para retornar siglas (SP, GO, DF...) ao invés dos nomes completos — mais compacto na TV
- Seção "Funil de Conversão" renomeada para "Eventos de Conversão" (mesma mudança no ga4)
- Renderização do funil: `renderFunilTelao()` chamada via patch sobre `loadAll` para garantir exibição após carregamento dos dados
- URL pública: `projetojlbv.com.br/dashboard-telao.html`

---

### Auditoria completa dos dashboards — 14/04/2026

**Bugs encontrados e corrigidos**:

| Fix | Arquivo | Descrição |
|-----|---------|-----------|
| `fmt()` global | ga4 + telão | `fmt` estava definida como `const` local dentro de `resolvePeriod`. Código de `loadChart` chamava `fmt` de fora e gerava `fmt is not defined`. Extraída para função global `function fmt(d)` |
| `traduzEstado` NFD | ga4 + telão | GA4 retorna estados sem acentos ("Piaui", "Goias"). Adicionado fallback com `normalize('NFD').replace(/\p{Diacritic}/gu, '')` para lookup case-insensitive sem acento |
| `clip: false` | ga4 + telão | Bolinhas de lead no topo do gráfico eram cortadas pela borda do plot area. Adicionado `clip: false` nos datasets de leads |
| `devicePixelRatio` | ga4 | Chart.js não recebia `devicePixelRatio` no dashboard ga4 — gráficos borrados em tela retina. Adicionado `devicePixelRatio: window.devicePixelRatio \|\| 1` nas options dos dois charts |
| `null guard` em `getElementById` | ga4 + telão | `_loadingStart`, `_loadingEnd`, `showError`, loop `deltaIds` e catch de `loadSummaryWithCompare` acessavam elementos DOM sem verificar null. Adicionado `if (!el) return` em todos |
| Cap 100% abandono | ga4 + telão | GA4 tem delay intraday de 2-8h: `Abandonou_Formulario` pode ser processado antes do `Abrir_Formulario` da mesma sessão, gerando taxa >100% matematicamente impossível. Corrigido com `Math.min(Math.round(raw), 100)` |
| Aviso dado parcial | ga4 + telão | Quando filtro "Hoje" e `somaDependentes > abrir`, mostra asterisco `*` na pill de Abandono e nota: "GA4 ainda processando eventos de hoje. Dados se normalizam em até 8h." |
| Bolinha lead no gráfico | ga4 + telão | Adicionado dataset `type:'line', showLine:false` com pontos magenta `#E92085` nos horários/dias com leads. Guard `hasLeads` evita dataset vazio quando não há leads no período |
| Hora atual em magenta | ga4 + telão | Modo horário: barra da hora atual destacada em `rgba(233,32,133,.8)` e borda `#E92085`. Modo diário: barra do dia atual (hoje) destacada igual |
| "Eventos de Conversão" | ga4 + telão | Seção renomeada de "Funil de Conversão" — nome anterior passava ideia de hierarquia que não existe |
| Deploy branch errado | contexto | Claude estava deployando no branch `main` em vez do `gh-pages`. GitHub Pages serve exclusivamente do `gh-pages`. Fluxo correto documentado acima |

**Estado após 14/04/2026**: auditoria linha a linha concluída, zero bugs conhecidos, dois dashboards em produção.

### Comportamento GA4 — delay intraday (importante entender)
O GA4 processa eventos em lotes com atraso de 2-8h para dados do dia atual. Isso pode causar:
- Eventos `Abandonou_Formulario` aparecerem antes dos `Abrir_Formulario` da mesma sessão (resultado: taxa de abandono >100% temporariamente)
- Leads de horas recentes não aparecerem ainda no painel
- Pelo mesmo motivo, leads do Meta Ads que convertem no site podem demorar horas para aparecer no painel

Isso é limitação do GA4 — não é bug do código. Os dados se normalizam ao final do dia. O aviso `*` no painel sinaliza quando isso está ocorrendo.

### Auditoria GA4 — 13/04/2026 (tudo verificado e ok)
| Item | Status | Detalhe |
|------|--------|---------|
| Property ID | OK | `532575691` bate com o proxy |
| Timezone | OK | GMT-03:00 Horário São Paulo |
| Moeda | OK | Real brasileiro |
| Stream | OK | `projetojlbv.com.br` — recebendo tráfego nas últimas 48h |
| Tag do site | OK | Status "Dados em transferência" — Measurement ID `G-DX8FW7ZTJ3` |
| Métricas otimizadas | OK | Ativas: page_view, scroll, cliques de saída + 4 mais |
| Eventos principais | OK | 5 eventos marcados com estrela |
| Eventos recentes | OK | 15 eventos todos do stream correto, funil completo presente |
| Retenção de eventos | Ajustado | Era 2 meses, alterado para **14 meses** em 13/04/2026 |
| Retenção de usuários | OK | Já estava em 14 meses |
| Filtro Internal Traffic | Informação | Existe filtro para excluir tráfego interno, estado **Teste** (não está ativo). Para ativar: configurar IP da empresa no GTM e mudar estado para Ativo |

### Identidade visual do painel
- Header branco com logo Life B color (roxo + magenta)
- Cores: roxo `#704B9B`, magenta `#E92085`, verde `#22C35D`
- Logo embutida como base64 no HTML (nunca quebra)
- Sem jargões técnicos — textos em português simples para gestores leigos
- Padrão: filtro **"Hoje"** ativo ao abrir

### Deploy do dashboard
Os arquivos `dashboard-ga4.html` e `dashboard-telao.html` NÃO são gerados pelo build do Vite. Deploy direto no branch `gh-pages` via GitHub API (método atual — não requer git local funcionando):

```bash
# Pega o SHA atual do arquivo no gh-pages (necessário para update via API)
SHA=$(gh api "repos/lifeb-web/lifebimport/contents/dashboard-ga4.html?ref=gh-pages" --jq '.sha')

# Sobe o arquivo atualizado
CONTENT=$(base64 -i /Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/dashboard-ga4.html)
gh api "repos/lifeb-web/lifebimport/contents/dashboard-ga4.html" \
  --method PUT \
  -f message="descrição da mudança" \
  -f content="$CONTENT" \
  -f sha="$SHA" \
  -f branch="gh-pages"

# Repetir para dashboard-telao.html
```

**ATENÇÃO CRÍTICA**: o GitHub Pages serve do branch `gh-pages`, não do `main`. Sempre subir para `gh-pages`. O `main` é apenas código-fonte da landing page React — não afeta o link.

Após o deploy via API, o workflow `pages-build-deployment` roda automaticamente e publica em ~1-2min. Fazer Cmd+Shift+R no browser para limpar cache.

**Dropbox**: copiar os dois arquivos para `/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR/` após cada deploy.

---

### Ajuste de atualização e quota — 16/04/2026

Contexto da decisão: o dashboard é usado em 1 ou 2 telas, com prioridade para leitura simples e atualização o mais próxima possível do tempo real. A métrica de conversão continua sendo apenas `Lead_Formulario`; não separar "WhatsApp Direto" nem "Conversões Totais", pois a jornada atual usa formulário e o evento antigo direto não é mais usado. `Preencheu_Formulario` permanece fora do painel para não confundir a equipe.

Alterações aplicadas:
- `loadAll` passou de 5 min para 3 min nos dois dashboards (`300_000` → `180_000`).
- Footer do `dashboard-ga4.html` atualizado para "Dados: 3 min".
- Comparativos duplos (`events` e `summary` com `days*2`) deixam de ser buscados quando o filtro é "Hoje"/dia único, porque os deltas ficam ocultos nesse cenário.
- `dashboard-telao.html` passou a reaproveitar os eventos já buscados no ciclo principal para renderizar o funil do telão, evitando uma chamada duplicada de `events`. Mantido fallback: se o cache não bater com o período atual, busca novamente.
- Barras de eventos agora calculam o máximo apenas com eventos exibidos em `EVENTOS_META`, evitando distorção por eventos ocultos como `Preencheu_Formulario`.
- Documentação de quota atualizada: cerca de 10 chamadas por ciclo no filtro Hoje/dia único e cerca de 12 em períodos com comparativo, a cada 3 min, mais realtime a cada 60s. Estimativa: ~6.240 a ~7.200 req/dia com 1 tela; ~12.480 a ~14.400 req/dia com 2 telas 24h.

Arquivos locais atualizados:
- Dropbox/contexto: `dashboard-ga4.html`, `dashboard-telao.html`, `paginassdr.md`
- Repo local: `/Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/dashboard-ga4.html`
- Repo local: `/Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/dashboard-telao.html`
- Repo local: `/Users/robertmarques/Desktop/lifebimport-jlbv/paginassdr.md`

Validação antes do deploy:
- Scripts dos dois HTMLs compilados com `vm.Script` sem erro de sintaxe.
- Busca confirmou ausência de `300_000`, "Dados: 5 min", "5min" e documentação antiga de 11 chamadas nos arquivos principais.
- Não houve alteração no `lifeb-ga4-proxy.gs` nem no Apps Script publicado.

Deploy concluído em 16/04/2026:
- `dashboard-ga4.html` enviado para `gh-pages` via GitHub API. Commit: `a3515e2948545c9da7c330174335f92ec956186a`.
- `dashboard-telao.html` enviado para `gh-pages` via GitHub API. Commit: `6fe8eb073587d61e9ccabd78227bf8c6f480a97e`.
- Workflow `pages build and deployment` finalizado com sucesso para o commit `6fe8eb073587d61e9ccabd78227bf8c6f480a97e`.
- Validação pública confirmou `Dados: 3 min`, `180_000`, `shouldCompare` e cache `__lifebTelaoEvents` nos links publicados.

Esclarecimento de eventos após deploy:
- Eventos de scroll permanecem intactos no painel e no telão: `ScrollDepth_25`, `ScrollDepth_50`, `ScrollDepth_75`, `ScrollDepth_100`.
- `Pular_Formulario` é evento ativo e deve permanecer exibido. Significa que a pessoa abriu o formulário e clicou em "pular formulário / ir direto para o WhatsApp".
- `Abandonou_Formulario` é diferente de `Pular_Formulario`. Significa que a pessoa abriu o formulário e fechou sem enviar e sem pular.
- `Lead_Formulario` continua sendo a conversão real do painel: formulário enviado com contato.
- `Preencheu_Formulario` existe no GA4/proxy, mas segue oculto no painel para a equipe não confundir etapa intermediária com lead.
- O filtro visual por `EVENTOS_META` não remove eventos do GA4 nem do proxy; ele só impede eventos ocultos de influenciarem a escala das barras de eventos exibidos.

### Fix 17/04/2026 — Webhook do Sheets parou de funcionar

**Problema**: o script antigo (`AKfycbyLJ...`) era standalone (não vinculado a nenhuma planilha) e perdeu acesso à planilha. Nenhum `doPost` aparecia no log de execuções — as requisições chegavam ao script mas falhavam silenciosamente.

**Solução**: criado novo Apps Script diretamente pela planilha de leads (Extensões → Apps Script), garantindo vínculo direto. `getActiveSpreadsheet()` funciona sem precisar de ID. Nova URL implantada e `SHEETS_WEBHOOK_URL` atualizado em `Home.tsx` + deploy feito.

**Planilha de leads**: `https://docs.google.com/spreadsheets/d/1e9HRi1bnl3fNkE2IjNUYU4mUK7InLmgT_H8NAyfas-4/edit`
- Conta dona do script: `robert131196@gmail.com`
- Leads chegam no final da planilha (`appendRow`) — usar Ctrl+End para ver os mais recentes
- Se o webhook parar de funcionar novamente: verificar em Execuções se aparecem entradas `doPost`. Se não aparecer nenhuma, o script perdeu vínculo — recriar pelo menu Extensões → Apps Script dentro da planilha.

---

## Princípio geral do projeto
**Tudo online, nada local.** Código funcional, scripts e arquivos ativos ficam sempre em serviços online (GitHub, Google Apps Script, etc.) — nunca dependentes de um PC específico. Este arquivo de contexto no Dropbox é apenas documentação de referência.

---

### Fix 17/04/2026 — Dashboards aparecendo na tabela Por Página

**Problema**: a tabela "Por Página" excluía apenas o caminho exato `/dashboard-ga4.html`. Quando outro dashboard ou variação de URL aparecia no GA4, como `/dashboardga4-telao4.html`, ele entrava na tabela como se fosse landing page.

**Correção**: `dashboard-ga4.html` e `dashboard-telao.html` agora usam o helper `isDashboardPath(path)`, que remove qualquer path contendo `dashboard` antes de renderizar a tabela Por Página.

```javascript
function isDashboardPath(path) {
  return /dashboard/i.test(path || '');
}
```

Arquivos atualizados:
- `/Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/dashboard-ga4.html`
- `/Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/dashboard-telao.html`
- Dropbox/contexto: `dashboard-ga4.html`, `dashboard-telao.html`, `paginassdr.md`

Deploy concluído em 17/04/2026 via GitHub API no branch `gh-pages`.
- `dashboard-telao.html`: commit `86e0e5f309a344f489f49fa1170e7d558745010c`
- `dashboard-ga4.html`: commit final `b88d33bcb68620f9027a1016fb4eedca4b866332`
- Workflow `pages build and deployment` finalizado com sucesso para `b88d33bcb68620f9027a1016fb4eedca4b866332`
- Validação pública confirmou `function isDashboardPath` presente e filtro antigo exato ausente nos dois links.

---

### Atalhos dos representantes — 18/04/2026

Criados redirects estáticos para os links filtrados da planilha de leads dos representantes. Os arquivos são HTML puro, fora do React, sem GA4, sem Meta Pixel e com `noindex,nofollow`, para não contaminar eventos das landings nem o dashboard.

Links públicos:
- Iramar: `https://projetojlbv.com.br/rep/iramar/`
- Natanael: `https://projetojlbv.com.br/rep/natanael/`
- Geral/leitor: `https://projetojlbv.com.br/interno/geral/`

Destino atual do redirect:
- Iramar: `https://docs.google.com/spreadsheets/d/1e9HRi1bnl3fNkE2IjNUYU4mUK7InLmgT_H8NAyfas-4/edit?gid=0#gid=0&fvid=622287122`
- Natanael: `https://docs.google.com/spreadsheets/d/1e9HRi1bnl3fNkE2IjNUYU4mUK7InLmgT_H8NAyfas-4/edit?gid=0#gid=0&fvid=558368184`

Arquivos locais:
- `/Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/rep/iramar/index.html`
- `/Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/rep/natanael/index.html`
- `/Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/interno/geral/index.html`

Deploy concluído via GitHub API no branch `gh-pages`.
- Natanael: commit `236fc25c9c28767630122e576e060ddbc40d833e`
- Iramar / commit final: `48760acb118d56db14deafc45e4a0ed403920e7a`
- Workflow `pages build and deployment` finalizado com sucesso para `48760acb118d56db14deafc45e4a0ed403920e7a`
- Validação pública confirmou: `hasDocs: true`, `hasGtag: false`, `hasFbq: false`, `hasNoindex: true`.

Atualização extra em 18/04/2026:
- `dashboard-ga4.html` e `dashboard-telao.html` passaram a ignorar também caminhos internos na tabela "Por Página".
- Helper atual:

```javascript
function isInternalPath(path) {
  const p = path || '';
  return /dashboard/i.test(p) || /^\/rep(\/|$)/i.test(p) || /^\/interno(\/|$)/i.test(p);
}
```

- Geral/leitor criado em `/interno/geral/` com o link compartilhado da planilha.
- Deploy final: `2fa466ac8ace9b7d5e75db9cbf9f16cee445556e`.
- Workflow `pages build and deployment` finalizado com sucesso para `2fa466ac8ace9b7d5e75db9cbf9f16cee445556e`.
- Validação pública confirmou `/interno/geral/` sem `gtag` e sem `fbq`, e os dois dashboards com `isInternalPath` filtrando `dashboard`, `/rep/` e `/interno/`.

---

### Planilha de leads — visualizações, colunas e fórmulas auxiliares — 19/04/2026

Contexto: a planilha de leads recebe dados automaticamente pelo Apps Script/webhook da LP. Existem visualizações/filtros por representante no campo de responsável para facilitar a rotina comercial.

Decisões operacionais:
- Colunas técnicas como origem do botão na LP, página/link de origem e URL completa podem ficar ocultas para todos. Ocultar coluna no Google Sheets não impede o Apps Script de continuar preenchendo os dados via `appendRow`.
- Não excluir, mover ou inserir colunas no meio da estrutura sem revisar o Apps Script, porque o webhook grava por posição. Ocultar é seguro; mudar ordem pode quebrar o mapeamento.
- Para deixar a planilha mais limpa para os representantes, ocultar as colunas técnicas em vez de removê-las.
- As 3 primeiras colunas devem ficar congeladas para facilitar navegação: Google Sheets → Ver → Congelar → Até a coluna C.

Limite das visualizações de filtro:
- Visualização de filtro no Google Sheets não é segurança por representante. Se todos têm acesso de editor ao mesmo arquivo, um representante pode acessar outra visualização salva em Dados → Visualizações de filtro.
- Para impedir de verdade que um representante veja dados/colunas de outro, seria necessário separar por abas/arquivos com permissões próprias ou criar arquivos espelho. Por enquanto, a decisão foi manter o modelo simples com filtros no mesmo arquivo.

Fórmula auxiliar de mês/ano:
- Objetivo: criar uma coluna no final que leia a data/hora da coluna A e retorne apenas mês/ano, para filtrar o mês sem alterar o script.
- Como a coluna A é reconhecida como data real no Sheets, usar na primeira linha de dados da nova coluna:

```gs
=ARRAYFORMULA(SE(A2:A="";;TEXTO(A2:A;"MM/yyyy")))
```

Exemplo:
- Entrada em A: `27/03/2026 10:14:57`
- Saída: `03/2026`

Observação: em Google Sheets PT-BR, `AAAA` retornou literalmente `04/AAAA`; o formato correto testado foi `yyyy`.

Fórmula auxiliar de diferença de dias:
- Fórmula original linha a linha:

```gs
=IF(OR(A2="";T2="");"";INT(T2)-INT(A2))
```

- Versão automática com `ARRAYFORMULA`:

```gs
=ARRAYFORMULA(SE((A2:A="")+(T2:T="");"";INT(T2:T)-INT(A2:A)))
```

Uso:
- Colocar a fórmula apenas na primeira linha de dados da coluna auxiliar, por exemplo `U2`.
- Deixar todas as células abaixo vazias. Se houver conteúdo em `U3` ou abaixo, o Sheets mostra erro: "O resultado da matriz não foi expandido porque substituiria os dados em U3".
- Para corrigir esse erro, apagar o conteúdo da coluna auxiliar abaixo da fórmula e manter apenas o cabeçalho + a fórmula.

---

### Auditoria geral do projeto — 19/04/2026

Auditoria feita em todo o conjunto ativo:
- Landing pages React/Vite: `/`, `/direto/`, `/video1/`, `/video1-direto/`, `/rmk/`, `/contato/`
- Atalhos internos/representantes: `/rep/iramar/`, `/rep/natanael/`, `/interno/geral/`
- Dashboards: `/dashboard-ga4.html`, `/dashboard-telao.html`
- Proxy GA4 Apps Script
- Webhook da planilha de leads
- Build local e TypeScript

Resultados dos testes:
- Todos os links públicos retornaram `HTTP 200` após o deploy final.
- `pnpm exec vite build --emptyOutDir false` passou.
- `pnpm exec tsc --noEmit` inicialmente falhou e foi corrigido; depois passou sem erros.
- Dashboard GA4 e Dashboard Telão renderizaram em Chrome headless com dados reais.
- Proxy GA4 respondeu corretamente para `summary`, `events`, `leads` e `realtime`.
- Link público da planilha respondeu `HTTP 200`.
- Webhook da planilha respondeu `{"status":"ok"}` via `fetch` POST, que é o comportamento equivalente ao envio real da landing.

Dados GA4 observados no teste de 7 dias:
- `activeUsers`: 378
- `sessions`: 416
- `screenPageViews`: 495
- Eventos: `Abrir_Formulario` 89, `Lead_Formulario` 36, `Pular_Formulario` 6, `Abandonou_Formulario` 48, scroll events presentes.
- Realtime no momento do teste: 4 visitantes ativos.

Correções aplicadas:
- Removido do `client/index.html` o script Umami quebrado com placeholders `%VITE_ANALYTICS_ENDPOINT%` e `%VITE_ANALYTICS_WEBSITE_ID%`. Esse script gerava requisição inválida no HTML público, mas não afetava GA4/Meta.
- Corrigida tipagem da rota raiz em `client/src/App.tsx` (`component={() => <Home />}`).
- Corrigido `AnimatedSection` em `client/src/pages/Home.tsx` para aceitar e aplicar `style`, necessário nos cards animados da `/rmk`.
- Corrigido `client/src/const.ts` para não depender de `@shared/const`, módulo inexistente no projeto atual.

Deploy:
- Branch publicado: `gh-pages`
- Commit publicado: `410786417e376b3c0ab5ea1d50e036fbc3430563`
- GitHub Pages build: `built`, sem erro.
- Validação pós-deploy confirmou que o HTML público agora referencia `/assets/index-DNHNGMHr.js` e não contém mais `umami` nem `%VITE_ANALYTICS_*%`.

Observação sobre o teste da planilha:
- Foram criadas 3 linhas de teste no final da planilha para validar o webhook:
  - `TESTE AUDITORIA CODEX - PODE APAGAR` / origem `auditoria_codex_webhook`
  - `TESTE AUDITORIA CODEX - PODE APAGAR` / origem `auditoria_codex_webhook_post302`
  - `TESTE AUDITORIA NODE - PODE APAGAR` / origem `auditoria_codex_node_fetch`
- As três linhas receberam a fórmula auxiliar de mês/ano retornando `04/2026`, confirmando que a fórmula da coluna final está expandindo para novos leads.

---

### Nova página /video2 — 21/04/2026

Criada variante `video2` com os vídeos invertidos em relação ao `/video1/`:

| Posição | /video1/ | /video2/ |
|---------|----------|----------|
| Hero (topo) | Vimeo `1178399214` — Supermercado | YouTube `aOR4aUSp-zE` — Farmácia |
| Seção "Quem implantou" | YouTube `aOR4aUSp-zE` — Farmácia | Vimeo `1178399214` — Supermercado |

**Lógica de exibição na seção "Quem implantou":**
- Vimeo supermercado: `{variant !== "video1" && ...}` — oculto em video1 (já está no topo), visível em video2
- YouTube farmácia: `{variant !== "video2" && ...}` — oculto em video2 (já está no topo), visível em video1

**Todos os eventos iguais às outras páginas com formulário** — nenhuma linha de rastreamento alterada.

**Rota:** `App.tsx` → `<Route path="/video2" component={() => <Home variant="video2" />} />`

**Build:** `vite.config.ts` gera `dist/public/video2/index.html` automaticamente.

---

### Fix 21/04/2026 — autoplay YouTube no VideoEmbed

**Bug:** o componente `VideoEmbed` com `autoplayMuted` só adicionava os parâmetros de autoplay para Vimeo. Para YouTube, os parâmetros não eram inseridos, então o vídeo não iniciava. Detectado ao criar a `/video2/` com YouTube no hero.

**Causa:** linha em `Home.tsx`:
```js
if (autoplayMuted && isVimeo) embedSrc += "&autoplay=1&muted=1&loop=1";
```

**Correção:** tratamento separado por plataforma:
```js
if (autoplayMuted) {
  if (isVimeo) {
    embedSrc += "&autoplay=1&muted=1&loop=1";
  } else {
    const videoId = src.match(/embed\/([^?]+)/)?.[1] ?? "";
    embedSrc += `&autoplay=1&mute=1&loop=1&playlist=${videoId}`;
  }
}
```

**Diferenças YouTube vs Vimeo:**
- YouTube usa `mute=1` (Vimeo usa `muted=1`)
- YouTube exige `playlist=<videoId>` para o loop funcionar no autoplay

Deploy concluído em 21/04/2026 via `gh-pages`. GitHub Pages build: `completed / success`.

---

### Correções nos dashboards GA4 e Telão — 21/04/2026

**Problema 1 — `/video2` e `/video2/` aparecendo como duas linhas na tabela Por Página**

GA4 retorna às vezes o path sem barra final. Ambos apontam para a mesma página.

**Correção**: `loadPages` agora normaliza o path com `normPath = p => p && !p.endsWith('/') ? p + '/' : (p || '/')` antes de qualquer lookup. Linhas com o mesmo path normalizado são agregadas (soma `u` e `s`). O mapa de leads também é construído com chaves normalizadas, acumulando se houver duplicata.

**Problema 2 — Rótulo `/video2/` ausente**

A página `/video2/` não estava no `PAGINAS_LEGENDAS`, então aparecia como caminho bruto.

**Correção**: adicionado nos dois dashboards:
```js
'/video2/': 'Página com Vídeo - Farmácia',
```

**Problema 3 — "Facebook" aparecendo mais de uma vez na tabela Origem do Tráfego**

Diferentes valores brutos do GA4 (ex: `facebook / referral`, `facebook / (none)`) eram traduzidos para o mesmo rótulo "Facebook" mas renderizados como linhas separadas.

**Correção**: `loadSources` agora agrega por nome traduzido usando um `Map`. Linhas com mesmo `src` após `traduzOrigem` somam visitantes e leads antes de renderizar.

**Problema 4 — "Facebook (gerenciador)" aparecendo na tabela**

Tráfego de `eventsmanager.facebook.com` / `business.facebook.com` gerava linha própria com rótulo confuso.

**Correção**: `traduzOrigem` passou a retornar `'Facebook'` para esse padrão (em vez de `'Facebook (gerenciador)'`). Com a agregação acima, esse tráfego é automaticamente mesclado na linha "Facebook".

**Mudança de layout — Estado/Cidade subiu para o topo da coluna**

A tabela "Estado / Cidade" foi movida para a primeira posição na coluna de tabelas (antes era a terceira). Nova ordem: Estado/Cidade → Origem do Tráfego → Por Página. Aplicado nos dois dashboards sem alterar estilos ou lógica.

**Deploy 21/04/2026**:
- `dashboard-ga4.html`: commit `bc5b72552a536aeaa2c4b356d75ecc285730f584` (cancelado pelo push seguinte)
- `dashboard-telao.html`: commit `5eb31dcaa52a84cfe454e1e27dff71420c7498be`
- Workflow `pages build and deployment`: `completed / success` para `5eb31dcaa52a84cfe454e1e27dff71420c7498be`
- Backup Dropbox atualizado.

---

## Redirect /rep/iramar/tratar/ — 21/04/2026

Criado atalho para visualização de filtro "IRAMAR TRATAR" (leads ativos do Iramar — STATUS_VENDEDOR != Fechado/Perdido).
- URL pública: `projetojlbv.com.br/rep/iramar/tratar/`
- Destino: planilha `1e9HRi1bnl3fNkE2IjNUYU4mUK7InLmgT_H8NAyfas-4` com `fvid=661691714`
- Arquivo local: `/Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/rep/iramar/tratar/index.html`
- Sem GA4, sem Meta Pixel, `noindex,nofollow`
- Deploy: commit `61bfa9e1d87a389c23c301c82f6a4155493a3e8e`

### Todos os atalhos de planilha ativos
| URL pública | Filtro | fvid |
|-------------|--------|------|
| `/rep/iramar/` | Todos os leads do Iramar | 622287122 |
| `/rep/iramar/tratar/` | Leads ativos Iramar (≠ Fechado/Perdido) | 661691714 |
| `/rep/natanael/` | Todos os leads do Natanael | 558368184 |
| `/interno/geral/` | Visão geral (leitura) | — |

---

## Dashboard de Leads (Planilha Sheets) — estado atual em 22/04/2026

Dois dashboards em produção para exibir dados da planilha de leads em tempo real.

### URLs públicas
- **Mobile/desktop**: `projetojlbv.com.br/dashboard-leads.html`
- **Telão TV**: `projetojlbv.com.br/dashboard-leads-telao.html`

### Arquivos locais de edição
- `/Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/dashboard-leads.html`
- `/Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/dashboard-leads-telao.html`
- Backup Dropbox: `dashboard-leads.html`, `dashboard-leads-telao.html` (esta pasta)

### Deploy
Via GitHub API no branch `gh-pages` do repo `lifeb-web/lifebimport`:
```bash
SHA=$(gh api "repos/lifeb-web/lifebimport/contents/dashboard-leads-telao.html?ref=gh-pages" --jq '.sha')
CONTENT=$(base64 -i /Users/.../dashboard-leads-telao.html | tr -d '\n')
gh api --method PUT "repos/lifeb-web/lifebimport/contents/dashboard-leads-telao.html" \
  -f message="descrição" -f content="$CONTENT" -f sha="$SHA" -f branch="gh-pages"
# repetir para dashboard-leads.html
```

---

### Os dois scripts do projeto — diferença importante

O projeto tem **dois scripts Google Apps Script distintos**, com funções completamente diferentes:

| | Script da planilha | Script proxy (dash) |
|---|---|---|
| **Arquivo** | `planilha-leads-script.gs` | `lifeb-leads-proxy.gs` |
| **Onde fica** | Vinculado à planilha de leads (Extensões → Apps Script dentro da planilha) | Script independente em script.google.com |
| **O que faz** | Recebe leads via webhook (`doPost`) + automações ao editar (`onEdit`) | Lê a planilha e serve dados para os dashboards via HTTP |
| **Precisa de deploy?** | `doPost` sim (Web App). `onEdit` não — só salvar | Sim, sempre que mudar o código |
| **URL pública?** | Webhook de entrada de leads (não divulgar) | URL do proxy usado pelos dashboards |

---

### Apps Script proxy (lifeb-leads-proxy.gs)
- **Conta**: `robert131196@gmail.com`
- **Spreadsheet ID**: `1e9HRi1bnl3fNkE2IjNUYU4mUK7InLmgT_H8NAyfas-4`
- **URL do proxy**: `https://script.google.com/macros/s/AKfycbyq9KJgWTRoALEEVf8Pu_I82GT0-tTK5yXNg-RsYHj4ywK6Grg9z_jG1-IcTW3LMXfNBg/exec`
- **Executar como**: Eu (robert131196@gmail.com) | **Acesso**: Qualquer pessoa (anônimo)
- **Arquivo de referência**: `lifeb-leads-proxy.gs` nesta pasta
- **Actions suportadas**: `summary`, `by_rep`, `funnel`, `active`, `closed`, `latest`, `ads`, `chart`
- **Como reimplantar**: Apps Script → Implantar → Gerenciar implantações → lápis → Nova versão → Implantar. URL não muda.

#### Decisões técnicas importantes no proxy
- `getRows()` usa `getSheets()[0]` (primeira aba por índice, não por nome) — renomear a aba é seguro
- `getAds()` lê a aba `ADS` (segunda aba) e soma TODOS os valores da coluna C — total acumulado, não filtrado por mês
- `getLatest()` retorna os 10 leads mais recentes por data de entrada
- `getActive()` ordena: Em negociação → Reunião agendada → Em contato → Aguardando contato
- Funil SDR filtra itens com valor 0 (status inativo oculto). Funil Vendedor mostra todos os 6 estágios mesmo com 0 — zero informa que a etapa está sem movimento.

---

### Estrutura da planilha — aba 1 (leads, colunas 0-indexed)
| Col | Campo | Preenchimento |
|-----|-------|--------------|
| 0 | DIA/HORÁRIO | Automático (webhook LP) |
| 1 | NOME | Automático |
| 2 | WHATSAPP | Automático |
| 3 | ORIGEM DO BOTÃO NA LP | Automático |
| 4 | LINK PÁGINA DE ORIGEM | Automático |
| 5 | STATUS SDR | Manual |
| 6 | VENDEDOR | Manual |
| 7 | DATA ENVIO AO VENDEDOR | Manual |
| 8 | OBSERVAÇÃO SDR | Manual |
| 9 | SEGMENTO | Manual |
| 10 | EMPRESA IDENTIFICADA? | Manual |
| 11 | EMPRESA/LOJA | Manual |
| 12 | CONTATO EMPRESA | Manual |
| 13 | CNPJ | Manual |
| 14 | ENDEREÇO | Manual |
| 15 | CIDADE | Manual |
| 16 | CEP | Manual |
| 17 | ESTADO | Manual |
| 18 | STATUS VENDEDOR | Manual |
| 19 | BOLETO | Manual |
| 20 | PG POSSÍVEL | Manual |
| 21 | VALOR POTENCIAL | Manual |
| 22 | DATA DO FECHAMENTO | Manual |
| 23 | DIAS ATÉ FECHAR | Manual |
| 24 | VALOR FECHADO | Manual |
| 25 | MOTIVO DA PERDA | Manual |
| 26 | OBS VENDEDOR | Manual |

### Estrutura da planilha — aba 2 (ADS)
Criada em 22/04/2026 para alimentar os cards de Investimento ADS e ROAS.
| Col | Campo | Observação |
|-----|-------|-----------|
| A | DATA | Data de referência do lançamento (só para controle) |
| B | PLATAFORMA | Meta Ads, Google Ads, etc. |
| C | VALOR | Valor investido naquele lançamento |

- Cada linha é um **lançamento incremental** — o card soma tudo
- Acumulado começa em 26/03/2026 (data do primeiro lead)
- O `toNum()` do proxy aceita qualquer formato: `1500`, `1.500`, `R$ 1.500,00`, etc.
- **Não requer reimplantação** ao adicionar linhas — só editar a planilha

---

### Valores de status (exatos, case-sensitive)
**STATUS SDR**: `Aguardando abordagem`, `Em abordagem`, `Qualificado`, `Sem retorno SDR`, `Fora do perfil`, `Não identificado`
**STATUS VENDEDOR**: `Aguardando contato`, `Em contato`, `Reunião agendada`, `Em negociação`, `Fechado`, `Perdido`
**VENDEDOR**: `IRAMAR`, `NATANAEL` (ou qualquer nome — o proxy agrupa por valor da célula)

---

### Cards — o que cada um mostra
| Card | Fonte | Fórmula |
|------|-------|---------|
| Total de Leads | `summary.total` | Total de linhas na planilha |
| Qualificados | `summary.sdr.qualif` | STATUS_SDR = Qualificado |
| Em Tratativa | `summary.vend` | ag_cont + em_cont + reun + em_neg |
| Fechamentos | `summary.vend.fechado` | STATUS_VENDEDOR = Fechado; subtítulo: X perdidos ou "nenhum perdido" |
| Receita Total | `summary.receita` | Soma VALOR_FECHADO dos Fechados; subtítulo: média R$X · Yd p/ fechar |
| Taxa de Conversão | calculado | fechados / qualificados × 100% |
| Potencial em Aberto | `summary.pipeline` | Soma VALOR_POTENCIAL de leads não Fechado/Perdido |
| Investimento ADS | `ads.investimento` | Soma total da aba ADS coluna C |
| ROAS | calculado | Receita Total ÷ Investimento ADS |

---

### Sistema de polling inteligente (telão e mobile)
- `checkForUpdates()` roda a cada 60s
- Detecta mudança via `lastModified` (DriveApp.getFileById → getLastUpdated)
- Força reload a cada 3 polls (3 min) mesmo sem mudança detectada — fallback de segurança
- `loadAllData()` só é chamado quando: primeira carga OU planilha mudou OU forcedCycle
- Timestamp "· atualizado HH:MM" no header usa sempre a hora real da planilha, nunca `new Date()`
- Banner verde "Planilha atualizada" aparece quando mudança é detectada mid-session

---

### Seções do telão (dashboard-leads-telao.html)
Layout fixo sem scroll, tudo visível em uma tela:
- **Faixa de cards** (topo): Total de Leads + 8 cards métricos em linha
- **Coluna esquerda**: Funil SDR + Funil Vendedor (com subtítulos "Status SDR" e "Status Vendedor")
- **Coluna centro**: Funil Por Representante (9 colunas: Rep, Tot., Ag., Cont., Reun., Neg., Fech., Perd., Receita) + Fechamentos + Últimos Leads
- **Coluna direita**: Leads Ativos (5 colunas: Empresa, Cidade/UF, Rep, Status, Potencial)

### Seções do mobile (dashboard-leads.html)
Layout em scroll vertical, grid responsivo:
- Cards em grid 2 colunas (mobile) / 3 colunas (tablet) / 9 colunas (desktop)
- Funil SDR + Funil Vendedor
- Por Representante | Últimos Leads | Leads Ativos | Fechamentos

---

### Últimos Leads
Exibe os 10 leads mais recentes por data de entrada, com scroll. Colunas: Nome/Empresa | Entrada (data + hora compacta) | Status SDR com badge colorido.
- Telão: posicionado na coluna centro, abaixo de Fechamentos
- Mobile: posicionado após Por Representante, antes de Leads Ativos
- Fonte: `proxy('latest')` → `getLatest()` no proxy

---

### Identidade visual
- Roxo: `#704B9B` | Magenta: `#E92085` | Verde: `#22C35D`
- Card Receita Total: destaque especial com `accent-highlight` (borda roxa 6px telão / 5px mobile, gradiente lilás mais saturado, card ~30% mais largo no telão)
- Badges STATUS SDR: tons discretos — laranja (Aguardando), azul (Em abordagem), verde (Qualificado), cinza (Sem retorno), vermelho (Fora do perfil)
- Badges STATUS VENDEDOR: amarelo (Ag.Contato), azul (Em Contato), roxo (Em Neg.), verde (Fechado), vermelho (Perdido)
- `toTitleCase()`: primeira letra maiúscula por palavra, exceto preposições PT-BR (de, do, da, e, em, a, o, no, na, ao, por, etc.)

---

### Mapeamento visualizações Sheets → Dashboard
| Filtro no Sheets | Equivalente no dashboard |
|-----------------|--------------------------|
| AGUARDANDO CONTATO SDR | Funil SDR → Aguardando abordagem |
| AGUARDANDO CONTATO VENDEDOR | Funil Vendedor → Aguardando contato |
| EM CONTATO | Funil Vendedor → Em contato |
| REUNIÃO AGENDADA | Funil Vendedor → Reunião agendada |
| EM NEGOCIAÇÃO | Funil Vendedor → Em negociação |
| FECHADOS | Funil Vendedor → Fechado + tabela Fechamentos |
| IRAMAR | Tabela Por Representante → linha IRAMAR |
| NATANAEL | Tabela Por Representante → linha NATANAEL |
| POTENCIAL | Leads com VALOR POTENCIAL > 0 |
| SDR TRATANDO | Funil SDR → Em abordagem |
| SEM RETORNO SDR | Funil SDR → Sem retorno SDR |

---

## Sessão 22/04/2026 — Melhorias e Correções

### Correções aplicadas nos dashboards (auditoria)
Foram lidas duas auditorias externas + uma própria. Itens aplicados:

**dashboard-leads.html e dashboard-leads-telao.html:**
- `_isLoading` guard em `checkForUpdates()`: evita chamadas paralelas ao proxy se poll anterior ainda não terminou
  ```javascript
  let _isLoading = false;
  // no início da função:
  if (_isLoading) return;
  _isLoading = true;
  // no finally:
  _isLoading = false;
  ```
- `_inFlight` corrigido: `_inFlight = Math.max(0, _inFlight - 1);` — impede contagem negativa se promises rejeitam
- Clock interval com cleanup: `const _clockInterval = setInterval(update, 1000); window.addEventListener('beforeunload', () => clearInterval(_clockInterval));`
- Badge **"Indefinido"** no Funil SDR: CSS `.badge-sdr-nao { background:#f3f4f6; color:#6b7280; }` + case em `statusBadgeSdr()` + entrada no array de `renderFunnel()`. Label exibido: "Indefinido" (não "Não identificado" — evita confusão com a coluna EMPRESA IDENTIFICADA)

**Itens NÃO aplicados (falsos positivos):**
- `getDataRange()` já lê apenas células usadas — não precisa de otimização
- `getSheets()[0]` é decisão intencional documentada (sempre lê a primeira aba)

---

### Badge de período no header
Exibe o intervalo de datas dos leads de forma discreta no header de ambos os dashboards.

**HTML (ambos os dashboards):**
```html
<span id="header-period" style="display:none;font-size:11px;font-weight:600;padding:3px 11px;border-radius:20px;background:rgba(112,75,155,.08);color:var(--purple);border:1px solid rgba(112,75,155,.25);letter-spacing:.3px;white-space:nowrap;opacity:.85"></span>
```
- No telão: inserido dentro do `.h-brand`, após "Planilha Life B | "
- No mobile: inserido no header ao lado do título

**JS em `renderSummary()`:**
```javascript
const periodEl = document.getElementById('header-period');
if (periodEl && data.firstDate) {
  const meses = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
  const [,m,d] = data.firstDate.split('-').map(Number);
  periodEl.textContent = `PERÍODO: ${d} ${meses[m-1]} – HOJE`;
  periodEl.style.display = '';
}
```
- Calcula automaticamente a partir do lead mais antigo na planilha
- Atualiza a cada ciclo de polling (60s)

---

### Proxy: firstDate em getSummary()
`lifeb-leads-proxy.gs` — `getSummary()` passou a calcular e retornar a data do lead mais antigo:

```javascript
let firstDate = '';
// dentro do rows.forEach:
const d = fmtDate(r[COL_DATA]);
if (d && (!firstDate || d < firstDate)) firstDate = d;
// no objeto de retorno:
firstDate: firstDate,
```

---

### Proxy: ordenação secundária em getActive()
Leads Ativos agora ordenam por status (ascendente) e, em caso de empate, por potencial (descendente):

```javascript
if (oa !== ob) return oa - ob;
return b.pot - a.pot;
```

---

### Proxy: timezone fixo em getAds()
Timezone alterado de `Session.getScriptTimeZone()` para `'America/Sao_Paulo'` — garante agrupamento correto independente de onde o script está hospedado.

---

### Coluna CONTATO EMPRESA adicionada na planilha
Nova coluna inserida entre EMPRESA/LOJA e CNPJ. Posição final (0-indexed no proxy):

```javascript
const COL_SEGMENTO    = 9;   // corrigido (estava trocado com EMPRESA_ID)
const COL_EMPRESA_ID  = 10;  // corrigido
const COL_EMPRESA     = 11;
const COL_CONTATO_EMP = 12;  // NOVA COLUNA — coluna M na planilha
const COL_CNPJ        = 13;
const COL_ENDERECO    = 14;
const COL_CIDADE      = 15;
const COL_CEP         = 16;
const COL_ESTADO      = 17;
const COL_STATUS_VEND = 18;
const COL_BOLETO      = 19;
const COL_PG_POSS     = 20;
const COL_VALOR_POT   = 21;
const COL_DATA_FECH   = 22;
const COL_DIAS_FECHAR = 23;
const COL_VALOR_FECH  = 24;
const COL_MOTIVO_PERD = 25;
const COL_OBS_VEND    = 26;
```

**Atenção:** COL_SEGMENTO e COL_EMPRESA_ID estavam trocados no proxy anterior — corrigidos nesta sessão (confirmado com CSV real da planilha).

**Nome da coluna na planilha:** pode ser renomeado livremente — o proxy lê por índice posicional, não por nome.

**Proteção de colunas:** bloqueio de movimentação foi configurado diretamente nas permissões da planilha (Dados → Intervalos protegidos).

---

### Script da planilha (planilha-leads-script.gs) — onEdit auto-fill

**Arquivo de referência:** `planilha-leads-script.gs` nesta pasta (também em `/Users/robertmarques/Downloads/webhook-leads.gs`)

Automações do `onEdit` ao editar a coluna VENDEDOR (col G = 7):

- Preencheu VENDEDOR + STATUS VENDEDOR vazio → STATUS VENDEDOR = `"Aguardando contato"`
- Preencheu VENDEDOR + STATUS SDR não é status final → STATUS SDR = `"Qualificado"` (automático — garante funil SDR fechado sem depender da disciplina do SDR)
- Apagou VENDEDOR + STATUS VENDEDOR era `"Aguardando contato"` → STATUS VENDEDOR limpa

Único status SDR não sobrescrito: `Qualificado` (já está correto). Qualquer outro status — inclusive `Sem retorno SDR` e `Fora do perfil` — vira `Qualificado` ao selecionar vendedor, porque selecionar vendedor É o ato de qualificar.

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.data, data.nome, data.telefone, data.origem, data.pagina, "Aguardando abordagem"
  ]);
  return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);
}

function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  if (sheet.getIndex() !== 1) return;
  const row = e.range.getRow();
  const col = e.range.getColumn();
  if (row === 1) return;
  const COL_VENDEDOR    = 7;   // coluna G (1-indexed)
  const COL_STATUS_SDR  = 6;   // coluna F (1-indexed)
  const COL_STATUS_VEND = 19;  // coluna S (1-indexed)
  if (col !== COL_VENDEDOR) return;
  const vendedor   = String(e.value || '').trim();
  const statusVend = String(sheet.getRange(row, COL_STATUS_VEND).getValue() || '').trim();
  const statusSdr  = String(sheet.getRange(row, COL_STATUS_SDR).getValue() || '').trim();
  if (vendedor) {
    if (!statusVend) sheet.getRange(row, COL_STATUS_VEND).setValue('Aguardando contato');
    const statusFinaisSdr = ['Qualificado', 'Fora do perfil', 'Sem retorno SDR'];
    if (!statusFinaisSdr.includes(statusSdr)) sheet.getRange(row, COL_STATUS_SDR).setValue('Qualificado');
  } else if (statusVend === 'Aguardando contato') {
    sheet.getRange(row, COL_STATUS_VEND).setValue('');
  }
}
```

**Como aplicar:** substituir o código completo no editor Apps Script vinculado à planilha e salvar. Não precisa de redeploy — `onEdit` dispara automaticamente.

---

### Funil SDR — "Indefinido" removido

A categoria "Indefinido" (fallback para STATUS SDR vazio) foi removida do funil SDR em ambos os dashboards. O fluxo é fechado: todo lead entra com "Aguardando abordagem" via webhook e o `onEdit` garante que leads passados ao vendedor ficam como "Qualificado". Nenhum lead deveria ter STATUS SDR vazio.

---

## Sessão 22/04/2026 (continuação) — Melhorias de exibição e UX

### "Reunião agendada" removida do Funil Vendedor e Por Representante
Removida de ambos os dashboards (mobile e telão):
- Funil Vendedor: entrada `{ label: 'Reunião agendada', value: vend.reun ... }` deletada
- Tabela Por Representante: coluna `Reun.` removida do `<thead>` e do template de linha; colspan atualizado de 9 para 8
- Não precisa mexer no proxy — o campo `vend.reun` continua existindo, só não é exibido

### Scroll interno nos cards de tabela (mobile e telão)
Todos os cards com tabelas agora têm scroll vertical interno para suportar volume crescente:

**Mobile** — classes `ts-reps`, `ts-fechados`, `ts-ativos` no `ts-wrap`:
```css
.ts-ativos .table-scroll, .ts-reps .table-scroll, .ts-fechados .table-scroll { max-height: 300px; overflow-y: auto; }
```

**Telão** — `max-height:178px;overflow-y:auto;flex:none` inline nos divs `.table-scroll.table-body` de:
- Últimos Leads (já existia)
- Fechamentos (adicionado)
- Funil Por Representante (adicionado)

### Mobile — ajustes de layout (header e cards)
- **Header fixo**: `position: fixed; top: 0; left: 0; right: 0` + `body { padding-top: 56px }` no mobile — funciona no iOS Safari (contorna bug do `overflow-x: hidden` que quebra `sticky`)
- **"· atualizado HH:MM" oculto no mobile**: `#last-refresh { display: none }` — libera espaço no header
- **Período centralizado no mobile**: `#header-period { position: absolute; left: 50%; transform: translateX(-50%) }` — flutua no centro sem empurrar logo nem relógio
- **Logo menor no mobile**: `height: 26px`, separador oculto, gap reduzido para 8px
- **Card Potencial em Aberto**: `font-size:20px` adicionado inline para igualar com Receita Total
- **Ordem das seções mobile**: Por Representante → Últimos Leads → Fechamentos → **Leads Ativos** (Leads Ativos movido pro final)
- **Indicador de scroll horizontal**: `.ts-wrap::after` com gradiente fade branco na borda direita, some via JS quando chegou ao fim (`--ts-fade` CSS variable)

### Telão — badges informativos nos headers dos cards
Todos os badges usam a classe `.badge` padrão do dash. Atualizam a cada ciclo de polling (60s).

| Card | Badge | Fonte |
|---|---|---|
| Leads Ativos | `TOTAL: N ATIVOS` | `leads.length` em `renderAtivos` |
| Leads Ativos | `IRAMAR: X \| NATANAEL: Y` | agrupamento por `l.rep` em `renderAtivos` — dinâmico, funciona com N representantes |
| Últimos Leads | `MÉDIA: X LEADS/DIA` | `total / dias_desde_firstDate` em `renderSummary` |
| Fechamentos | `CAC MÉDIO: R$ X` | `rAds.investimento / rClosed.fechamentos.length` em `loadAllData` — some se não houver ADS ou fechamentos |
| Funil Por Representante | `TEMPO MÉDIO DE FECHAMENTO: X DIAS` | `summaryData.media_dias` em `renderSummary` — some se for 0 |

**Nota sobre media_dias**: calculado no proxy como `Math.round(totalDias / countFechadoComDias)` — média dos deals que têm `DIAS_FECHAR` preenchido. Para calcular automaticamente pelas datas (`DATA_FECH - DATA`), seria possível sem novas colunas, mas não foi necessário por ora.

### Mobile — badges portados do telão (paridade)
Todos os badges do telão foram portados para o mobile com labels compactos:

| Card | Badge mobile | Badge telão |
|---|---|---|
| Por Representante | `FECH: 18d` | `TEMPO MÉDIO DE FECHAMENTO: 18 DIAS` |
| Últimos Leads | `1.2/DIA` | `MÉDIA: 1.2 LEADS/DIA` |
| Fechamentos | `CAC: R$ 516` | `CAC MÉDIO: R$ 516` |
| Leads Ativos | `41 ATIVOS` | `TOTAL: 41 ATIVOS` |

Badge texto no mobile usa `window.innerWidth < 640` para versão curta. `ativos-reps-summary` oculto no mobile (`display:none`) — já era ilegível truncado.

### Mobile — fix header card Leads Ativos (23/04/2026)
Título "LEADS ATIVOS" quebrava em 2 linhas no mobile por falta de espaço. Correções no `@media (max-width: 639px)`:
```css
.card-hd-title { font-size: 11px; letter-spacing: .3px; white-space: nowrap; }
#ativos-reps-summary { display: none; }
```
Badge compactado via JS: `window.innerWidth < 640 ? \`${n} ATIVOS\` : \`TOTAL: ${n} ATIVOS\``

### Telão — badges individuais por representante em Leads Ativos (23/04/2026)
Substituiu o span único `ativos-reps-summary` (texto plano "IRAMAR: 33 | NATANAEL: 8") por badges individuais dinâmicos:

**HTML:**
```html
<div id="ativos-reps-container" style="display:flex;align-items:center;gap:6px"></div>
<span class="badge" id="ativos-badge">—</span>
```

**JS em `renderAtivos`:**
```javascript
const counts = {};
leads.forEach(l => { const r = (l.rep || '').toUpperCase(); if (r) counts[r] = (counts[r] || 0) + 1; });
repsContainer.innerHTML = Object.entries(counts).sort((a,b) => b[1]-a[1])
  .map(([r,c]) => `<span class="badge">${r}: ${c}</span>`).join('');
```
Funciona com N representantes — cada novo rep ganha badge automaticamente.

---

## UTM Tracking — Rastreamento por Anúncio (23/04/2026)

### Objetivo
Saber de qual campanha, conjunto e anúncio do Meta Ads cada lead veio — não só qual página converteu.

### Configuração no Meta Ads
Campo "Parâmetros de URL" de cada anúncio (não altera otimização):
```
utm_campaign={{campaign.name}}&utm_content={{adset.name}}&utm_term={{ad.name}}
```
O Meta substitui os `{{}}` automaticamente com os nomes reais no clique. Editar só esse campo não reseta aprendizado.

### Planilha — colunas novas
| Coluna | Nome | Preenchimento |
|--------|------|--------------|
| AC (29) | CAMPANHA | Automático via webhook |
| AD (30) | CONJUNTO | Automático via webhook |
| AE (31) | ANÚNCIO | Automático via webhook |

Leads sem UTM (orgânico, WhatsApp, acesso direto) ficam com essas colunas vazias — normal.
Coluna AB (MÊS/ANO — ARRAYFORMULA) não é afetada pois o webhook usa `getRange` separado para AC-AE.

### Landing page (Home.tsx)
Função `getUtms()` adicionada após `SHEETS_WEBHOOK_URL`:
```typescript
function getUtms() {
  const p = new URLSearchParams(window.location.search);
  return {
    campanha: p.get('utm_campaign') || '',
    conjunto: p.get('utm_content')  || '',
    anuncio:  p.get('utm_term')     || '',
  };
}
```
Campos enviados em todos os payloads: `saveLeadToSheets` (Lead e Abandonou) e `sendBeacon` (Fechou a Página).

### Webhook (planilha-leads-script.gs) — versão atual completa
```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.data, data.nome, data.telefone, data.origem, data.pagina, "Aguardando abordagem"
  ]);
  // UTMs separados para não sobrescrever ARRAYFORMULA em AB
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 29, 1, 3).setValues([[
    data.campanha || '', data.conjunto || '', data.anuncio || ''
  ]]);
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  if (sheet.getIndex() !== 1) return;
  const row = e.range.getRow();
  const col = e.range.getColumn();
  if (row === 1) return;
  const COL_VENDEDOR    = 7;
  const COL_STATUS_SDR  = 6;
  const COL_STATUS_VEND = 19;
  if (col !== COL_VENDEDOR) return;
  const vendedor   = String(e.value || '').trim();
  const statusVend = String(sheet.getRange(row, COL_STATUS_VEND).getValue() || '').trim();
  const statusSdr  = String(sheet.getRange(row, COL_STATUS_SDR).getValue() || '').trim();
  if (vendedor) {
    if (!statusVend) sheet.getRange(row, COL_STATUS_VEND).setValue('Aguardando contato');
    if (statusSdr !== 'Qualificado') sheet.getRange(row, COL_STATUS_SDR).setValue('Qualificado');
  } else if (statusVend === 'Aguardando contato') {
    sheet.getRange(row, COL_STATUS_VEND).setValue('');
  }
}
```
**Importante:** `doPost` precisa de nova versão de implantação para pegar mudanças no código. `onEdit` não precisa — só salvar.

### Incidente 23/04/2026 — proxy colocado no script errado
O código do `lifeb-leads-proxy.gs` foi acidentalmente colado no script vinculado à planilha ("Planilha de Leads SDR"), substituindo o `doPost`. Leads pararam de chegar na planilha.

**Correção:** restaurar o código correto (`planilha-leads-script.gs`) no script da planilha → salvar → criar nova versão de implantação.

**Como identificar:** se abrir o script da planilha (Extensões → Apps Script) e ver `doGet` / `getSummary` em vez de `doPost`, o código errado está lá.

**Os dois scripts nunca devem ser mesclados** — têm URLs e funções completamente diferentes.

### Incidente 23/04/2026 — JS bundle não subiu junto com HTMLs
Após build do Vite, o hash do bundle JS mudou (`index-DNHNGMHr.js` → `index-DaW81Dp4.js`). Os HTMLs foram deployados referenciando o novo arquivo mas o arquivo JS novo não foi enviado ao gh-pages. Resultado: todas as páginas em branco.

**Correção:** subir o novo arquivo JS (`dist/public/assets/index-*.js`) para gh-pages além dos HTMLs.

**Prevenção:** sempre que fizer build e deploy, subir também a pasta `assets/` se o nome do bundle mudar.

---

### Arquivo de referência UTM
`/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR/utm-parametros-meta-ads.txt` — contém o parâmetro pronto para copiar e colar no Meta Ads.

---

## Badge "HOJE: X LEADS" no telão (23/04/2026)

Adicionado badge no header do card Últimos Leads no telão, antes do badge de média/dia.

**Proxy — `getSummary()`**: novo campo `todayCount` calculado durante o `forEach` existente (custo zero):
```javascript
let todayCount = 0;
const today = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
// dentro do forEach:
if (d === today) todayCount++;
// no return:
todayCount: todayCount,
```
Requer nova versão de implantação no proxy para ativar.

**HTML (telão):**
```html
<div style="display:flex;align-items:center;gap:6px">
  <span id="latest-hoje" class="badge" style="white-space:nowrap"></span>
  <span id="latest-media-dia" class="badge" style="white-space:nowrap"></span>
</div>
```

**JS em `renderSummary()`:**
```javascript
const hojeEl = document.getElementById('latest-hoje');
if (hojeEl) hojeEl.textContent = `HOJE: ${data.todayCount || 0}`;
```

Atualiza a cada 60s com o polling normal. Mostra `HOJE: 0` quando não há leads no dia — informação válida.

---

## Badge CPL médio no telão (23/04/2026)

Adicionado badge `CPL: R$ X` no header do card Últimos Leads, após HOJE e MÉDIA/DIA.

**Cálculo:** `investimento ADS ÷ total de leads` (acumulado desde o início da operação). Some se não houver ADS ou leads.

**HTML:**
```html
<span id="latest-cpl" class="badge" style="white-space:nowrap"></span>
```

**JS em `loadAllData()`** — reutiliza `inv` já calculado para o CAC:
```javascript
const inv = rAds.status === 'fulfilled' && rAds.value ? +rAds.value.investimento || 0 : 0;

const cplEl = document.getElementById('latest-cpl');
if (cplEl) {
  const nLeads = summaryData.total || 0;
  cplEl.textContent = (inv > 0 && nLeads > 0) ? `CPL: ${cur(Math.round(inv / nLeads))}` : '';
}
```

Header final de Últimos Leads no telão:
```
[HOJE: 3]  [MÉDIA: 3.2/DIA]  [CPL: R$ 27]
```

---

## Incidente — regressão badges rep em Leads Ativos (23/04/2026)

Ao deployar o CPL usando o arquivo do Dropbox, os badges individuais por rep (`ativos-reps-container`) foram sobrescritos pela versão antiga que ainda tinha `ativos-reps-summary` (texto plano). Restaurado no mesmo deploy.

**Causa raiz:** arquivo do Dropbox estava desatualizado em relação ao gh-pages. A partir daqui o Dropbox é a fonte de verdade — sempre editar lá antes de deployar.

**Estado correto do header Leads Ativos:**
```html
<div style="display:flex;align-items:center;gap:6px;min-width:0">
  <div id="ativos-reps-container" style="display:flex;align-items:center;gap:6px"></div>
  <span class="badge" id="ativos-badge">—</span>
</div>
```
```javascript
const repsContainer = document.getElementById('ativos-reps-container');
if (repsContainer) {
  const counts = {};
  leads.forEach(l => { const r = (l.rep || '').toUpperCase(); if (r) counts[r] = (counts[r] || 0) + 1; });
  repsContainer.innerHTML = Object.entries(counts).sort((a,b) => b[1]-a[1])
    .map(([r,c]) => `<span class="badge">${r}: ${c}</span>`).join('');
}
```

---

## Sessão 24/04/2026 — Melhorias visuais e estruturais (mobile + telão)

### Destaque visual nos badges (ambos os dashboards)

`.badge` atualizado em `dashboard-leads.html` e `dashboard-leads-telao.html`:
```css
.badge {
  font-size: 9px/10px; font-weight: 700; padding: 2px 8-10px;
  border-radius: 20px;
  border: 1px solid rgba(112,75,155,.22);
  color: var(--purple);
  background: rgba(112,75,155,.07);
  box-shadow: 0 1px 3px rgba(112,75,155,.10);
  white-space: nowrap;
}
```
Efeito: fundo levemente roxo, borda roxa suave, texto roxo, sombra sutil. Antes era cinza/transparente.

---

### Fix header Funil Vendedor no telão

Problema: "FUNIL VENDEDOR" e "64 com vendedor" quebravam linha em telas menores.

Correções:
- `white-space: nowrap` adicionado em `.card-hd-title` e `.badge`
- Texto adaptativo por resolução via CSS:
```css
.vend-txt-sm { display:none; }
@media (max-width:1400px) { .vend-txt-lg { display:none; } .vend-txt-sm { display:inline; } }
```
```javascript
if (vendBadge) vendBadge.innerHTML = `${n(totalVend)} <span class="vend-txt-lg">com vendedor</span><span class="vend-txt-sm">c/ vendedor</span>`;
```
- >1400px mostra "com vendedor", ≤1400px mostra "c/ vendedor"

---

### Mobile — card Leads Ativos dividido por representante

**Arquivo:** `dashboard-leads.html`

Card único "Leads Ativos" substituído por dois cards independentes: **Iramar** e **Natanael**.

**CSS adicionado — cores de linha e badges coerentes:**
```css
.row-ag-cont { background: rgba(220,38,38,.07); }
.row-ag-cont td:first-child { border-left: 3px solid rgba(220,38,38,.35); }
.row-em-cont { background: rgba(217,119,6,.07); }
.row-em-cont td:first-child { border-left: 3px solid rgba(217,119,6,.35); }
.row-em-neg  { background: rgba(22,163,74,.07); }
.row-em-neg  td:first-child { border-left: 3px solid rgba(22,163,74,.35); }
.badge-row-red   { background: rgba(220,38,38,.15);  color: #b91c1c; }
.badge-row-amber { background: rgba(217,119,6,.15);  color: #b45309; }
.badge-row-green { background: rgba(22,163,74,.15);  color: #15803d; }
```

**HTML:**
```html
<!-- Card Iramar -->
<div class="card">
  <div class="card-hd">
    <div class="card-hd-title">Iramar</div>
    <span class="badge" id="ativos-badge-iramar">—</span>
  </div>
  <div class="ts-wrap ts-ativos">
    <div class="table-scroll">
      <table>
        <thead><tr>
          <th class="td-left" style="text-align:left">Empresa</th>
          <th class="td-left" style="text-align:left">Status</th>
          <th>Entrada</th>
        </tr></thead>
        <tbody id="tb-ativos-iramar">...</tbody>
      </table>
    </div>
  </div>
</div>
<!-- Card Natanael — mesmo padrão, IDs: ativos-badge-natanael / tb-ativos-natanael -->
```

**JS — funções:**
```javascript
function statusBadgeAtivos(s) {
  if (s === 'Aguardando contato') return `<span class="status-badge badge-row-red">${esc(s)}</span>`;
  if (s === 'Em contato')         return `<span class="status-badge badge-row-amber">${esc(s)}</span>`;
  if (s === 'Em negociação')      return `<span class="status-badge badge-row-green">${esc(s)}</span>`;
  return `<span class="status-badge" style="background:#f3f4f6;color:#6b7280">${esc(s) || '—'}</span>`;
}

function renderAtivos(data) {
  const leads = data.leads || [];
  function rowClass(status) {
    if (status === 'Aguardando contato') return 'row-ag-cont';
    if (status === 'Em contato')         return 'row-em-cont';
    if (status === 'Em negociação')      return 'row-em-neg';
    return '';
  }
  function fmtEntrada(d) {
    if (!d) return '—';
    const p = d.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0].slice(2)}` : d;
  }
  function renderRepCard(repName, tbodyId, badgeId) {
    // filtra por rep, sort ascendente por l.data (mais antigo primeiro)
    // badge: "X ATIVOS"
    // linha com rowClass + statusBadgeAtivos + fmtEntrada
    // colunas: Empresa | Status | Entrada
  }
  renderRepCard('IRAMAR',   'tb-ativos-iramar',   'ativos-badge-iramar');
  renderRepCard('NATANAEL', 'tb-ativos-natanael', 'ativos-badge-natanael');
}
```

**Regras:**
- Ordenação: mais antigo primeiro (`a.data.localeCompare(b.data)`)
- Linha pintada com cor sutil + faixa esquerda colorida
- Badge de status com cor coerente com a linha (sem azul/roxo)
- Colunas: Empresa · Status · Entrada (DD/MM/AA)

---

### Mobile — card principal: label e CUSTO POR LEAD

```html
<div class="rt-label">Total de Leads Registrados</div>
<div class="rt-sub" id="rt-cpl-sdr">CUSTO POR LEAD: —</div>
```

JS em `loadAllData`:
```javascript
const rtCplSdr = document.getElementById('rt-cpl-sdr');
if (rtCplSdr) {
  const inv = rAds.status === 'fulfilled' && rAds.value ? +rAds.value.investimento || 0 : 0;
  const total = summaryData.total || 0;
  rtCplSdr.textContent = (inv > 0 && total > 0)
    ? `CUSTO POR LEAD: ${cur(Math.round(inv / total))}`
    : 'CUSTO POR LEAD: —';
}
```
Fórmula: investimento total ÷ total de leads registrados. Exibido no subtítulo do card roxo principal.

---

### Telão — Leads Ativos dividido por representante

**Arquivo:** `dashboard-leads-telao.html`

Card único em `#col-center` substituído por dois cards empilhados com `flex:1` cada.

**CSS adicionado:**
```css
.badge-row-red   { background:rgba(220,38,38,.15);  color:#b91c1c; }
.badge-row-amber { background:rgba(217,119,6,.15);  color:#b45309; }
.badge-row-green { background:rgba(22,163,74,.15);  color:#15803d; }
```

**HTML — cada card:**
```html
<div class="card card-table" style="flex:1;min-height:0">
  <div class="card-hd">
    <div class="card-hd-title">Leads Ativos — Iramar</div>
    <div style="display:flex;align-items:center;gap:6px">
      <span class="badge" id="ativos-ag-iramar">—</span>
      <span class="badge" id="ativos-cont-iramar">—</span>
      <span class="badge" id="ativos-neg-iramar">—</span>
      <span class="badge" id="ativos-badge-iramar">—</span>
    </div>
  </div>
  <div class="table-scroll table-body">
    <table style="table-layout:fixed;width:100%;font-size:11px">
      <colgroup>
        <col style="width:27%"><col style="width:22%">
        <col style="width:22%"><col style="width:16%"><col style="width:13%">
      </colgroup>
      <thead><tr>
        <th>Empresa</th>
        <th class="td-left" style="text-align:left">Cidade / UF</th>
        <th style="text-align:center">Status</th>
        <th style="text-align:right">Potencial</th>
        <th style="text-align:right">Entrada</th>
      </tr></thead>
      <tbody id="tb-ativos-iramar">...</tbody>
    </table>
  </div>
</div>
<!-- Natanael — mesmo padrão, IDs: ativos-ag-natanael / ativos-cont-natanael / ativos-neg-natanael / ativos-badge-natanael / tb-ativos-natanael -->
```

**JS:**
```javascript
function statusBadgeAtivos(s) {
  if (s === 'Aguardando contato') return `<span class="status-badge badge-row-red">${esc(s)}</span>`;
  if (s === 'Em contato')         return `<span class="status-badge badge-row-amber">${esc(s)}</span>`;
  if (s === 'Em negociação')      return `<span class="status-badge badge-row-green">${esc(s)}</span>`;
  return `<span class="status-badge" style="background:#f3f4f6;color:#6b7280">${esc(s) || '—'}</span>`;
}

function renderAtivos(data) {
  const leads = data.leads || [];
  function fmtEntrada(d) {
    if (!d) return '—';
    const p = d.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0].slice(2)}` : d;
  }
  function renderRepCard(repName, tbodyId, badgeId, negId, agId, contId) {
    const repLeads = leads
      .filter(l => (l.rep || '').toUpperCase() === repName)
      .sort((a, b) => (a.data || '').localeCompare(b.data || ''));
    // badges header:
    agEl.textContent   = `AGUARDANDO: ${n(repLeads.filter(l => l.status === 'Aguardando contato').length)}`;
    contEl.textContent = `EM CONTATO: ${n(repLeads.filter(l => l.status === 'Em contato').length)}`;
    negEl.textContent  = `NEGOCIANDO: ${n(repLeads.filter(l => l.status === 'Em negociação').length)}`;
    badge.textContent  = `TOTAL: ${n(repLeads.length)} ATIVOS`;
    // linha: Empresa | Cidade/UF | statusBadgeAtivos | Potencial | fmtEntrada
    // SEM pintura de fundo de linha (só o badge de status é colorido)
  }
  renderRepCard('IRAMAR',   'tb-ativos-iramar',   'ativos-badge-iramar',   'ativos-neg-iramar',   'ativos-ag-iramar',   'ativos-cont-iramar');
  renderRepCard('NATANAEL', 'tb-ativos-natanael', 'ativos-badge-natanael', 'ativos-neg-natanael', 'ativos-ag-natanael', 'ativos-cont-natanael');
}
```

**Regras telão:**
- Sem pintura de linha (só o badge de status é colorido)
- Ordenação: mais antigo primeiro
- 5 colunas: Empresa · Cidade/UF · Status · Potencial · Entrada
- Header: `[AGUARDANDO: X] [EM CONTATO: X] [NEGOCIANDO: X] [TOTAL: X ATIVOS]`
- Cada card ocupa metade exata da coluna central (`flex:1`)

---

### Commits desta sessão (gh-pages)

| Commit | Descrição |
|---|---|
| `6559ce55` | fix: nowrap badge e título Funil Vendedor |
| `b850cb61` | feat: destaque visual badges (roxo sutil) |
| `9a9a17de` | feat: split Leads Ativos mobile por rep + cores de status + sort por data |
| `d64ac942` | fix: sort mais antigo primeiro, coluna Entrada, cores status coerentes |
| `25dad8dc` | feat: label Total de Leads Registrados + CUSTO POR LEAD dinâmico |
| `9ece39f8` | fix: simplifica CPL para total de leads |
| `54bc34f6` | fix: renomeia para CUSTO POR LEAD |
| `1323fa46` | feat: badge Funil Vendedor adaptativo por resolução |
| `9bf216de` | feat: split Leads Ativos telão por rep, badges coloridos, sort data |
| `d72961dd` | feat: coluna Entrada no telão (5 colunas) |
| `006ca312` | feat: mini cards AGUARDANDO e EM CONTATO no header telão |

---

## Sessão 24/04/2026 (continuação) — Ordenação e Auditoria

### Nova regra de ordenação nos cards Leads Ativos (mobile + telão)

**Regra anterior:** ordenação simples por data de entrada, mais antigo primeiro.

**Nova regra (prioridade por status + data):**
1. **Aguardando contato** → aparecem primeiro, mais antigos primeiro dentro do grupo
2. **Em contato / Em negociação** → aparecem depois (misturados), mais antigos primeiro

**Lógica JS aplicada nos dois arquivos:**
```javascript
.sort((a, b) => {
  const pa = a.status === 'Aguardando contato' ? 0 : 1;
  const pb = b.status === 'Aguardando contato' ? 0 : 1;
  if (pa !== pb) return pa - pb;
  return (a.data || '').localeCompare(b.data || '');
});
```

Commits:
- `5ce5f1f1` — feat: ordenação Leads Ativos — Aguardando contato primeiro, depois demais por data

---

### Auditoria completa dos dashboards de leads — 24/04/2026

Auditoria linha a linha dos dois dashboards (`dashboard-leads.html` e `dashboard-leads-telao.html`). 7 bugs encontrados e corrigidos:

| # | Arquivo | Bug | Fix |
|---|---------|-----|-----|
| 1 | Mobile | `renderFunilBar`: hack frágil `emptyRow(1).replace(...)` para montar `<div>` em container não-table | Substituído por `innerHTML` direto: `'<div style="...">Sem dados</div>'` |
| 2 | Mobile | `errRow(9)` em `renderReps` — tabela tem 8 colunas | `errRow(8)` |
| 3 | Mobile | `renderFechados`: `esc(c.rep)` sem `toTitleCase` — nome do rep podia aparecer em CAIXA ALTA | `esc(toTitleCase(c.rep) \|\| c.rep)` |
| 4 | Telão | `colspan="4"` nos tbody iniciais dos cards Ativos (Iramar e Natanael) — tabela tem 5 colunas | `colspan="5"` (ambos) |
| 5 | Telão | `errRow(9)` em `renderReps` — mesma inconsistência | `errRow(8)` |
| 6 | Telão | `body { display:flex; flex-direction:column }` declarado duas vezes no CSS (linhas 28 e 66) | Mergeado na regra única da linha 28, regra duplicada removida |
| 7 | Telão | `renderFechados`: `toTitleCase(c.empresa \|\| c.nome)` calculado duas vezes; `c.rep` sem formatação; comentário duplicado antes de `loadAllData` | Refatorado com variáveis locais `empresa` e `rep`, `toTitleCase` aplicado ao rep, comentário duplicado removido |

**Nenhuma vulnerabilidade XSS encontrada** — todas as interpolações de dados usam `esc()` corretamente.

Commit:
- `3b02832d` — fix: auditoria — 7 bugs corrigidos (errRow colspan, colspan ativos, body duplicate, renderFunilBar, toTitleCase rep, renderFechados refactor, comentário duplicado)

**Estado após 24/04/2026:** zero bugs conhecidos nos dois dashboards de leads.

---

## Painel CRM dos Representantes — 25/04/2026

### O que é

Um dashboard HTML estático por representante, servido pelo GitHub Pages, que permite ao rep visualizar seus leads ativos, atualizar status, registrar observações e consultar o histórico de fechados/perdidos — tudo em tempo real via proxy GAS + Sheets. É distinto dos atalhos de planilha (`/rep/iramar/` etc.) criados em 18/04: aqueles redirecionavam para a planilha do Google; este é um CRM completo com UX própria.

### Arquitetura

```
GitHub Pages (CDN)
  └── /rep/dash/iramar/index.html
  └── /rep/dash/natanael/index.html
        ↕ GET  PROXY_URL?action=active&rep=REP&token=TOKEN
        ↕ GET  PROXY_URL?action=rep_history&rep=REP&token=TOKEN
        ↕ POST PROXY_URL { token, row, rep, campo, valor }
  Google Apps Script (lifeb-leads-proxy.gs)
        ↕
  Google Sheets (planilha de leads)
```

### Arquivos

| Papel | Caminho |
|-------|---------|
| Template canônico | `/Contexto Paginas SDR/painel reps/dashboard-rep-template.html` |
| Proxy GAS | `/Contexto Paginas SDR/lifeb-leads-proxy.gs` |
| Dist Iramar | `/Desktop/lifebimport-jlbv/dist/public/rep/dash/iramar/index.html` |
| Dist Natanael | `/Desktop/lifebimport-jlbv/dist/public/rep/dash/natanael/index.html` |
| Repositório | `/Desktop/lifebimport-jlbv` (branch `main`) |
| Worktree gh-pages | `/tmp/ghpages-hist2` (branch `gh-pages`) |

### Placeholders do template (substituídos pelo Python em build time)

| Placeholder | Valor |
|-------------|-------|
| `__LOGO_SRC__` | `https://projetojlbv.com.br/assets/img/logo-lifeb.png` |
| `__REP_DISPLAY__` | Nome legível ("Iramar", "Natanael") |
| `__REP_NAME__` | Nome em maiúsculas ("IRAMAR", "NATANAEL") — usado no proxy e na chave de cache |
| `__REP_TOKEN__` | Token individual do rep |

### Tokens dos reps

| Rep | Token |
|-----|-------|
| IRAMAR | `d0e817db520c063b14be0b04a7e0` |
| NATANAEL | `634cb38cdf39c5b9971e83b51f07` |

### URLs de produção

- Iramar: `https://projetojlbv.com.br/rep/dash/iramar/`
- Natanael: `https://projetojlbv.com.br/rep/dash/natanael/`

### Como gerar e fazer deploy

```bash
# 1. Editar o template
# 2. Rodar Python inline para substituir os 4 placeholders
python3 - <<'PYEOF'
import re, os
TEMPLATE = "/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR/painel reps/dashboard-rep-template.html"
LOGO = "https://projetojlbv.com.br/assets/img/logo-lifeb.png"
reps = [
    {"slug":"iramar",   "display":"Iramar",   "name":"IRAMAR",   "token":"d0e817db520c063b14be0b04a7e0"},
    {"slug":"natanael", "display":"Natanael", "name":"NATANAEL", "token":"634cb38cdf39c5b9971e83b51f07"},
]
with open(TEMPLATE, encoding="utf-8") as f: tmpl = f.read()
for r in reps:
    out = tmpl.replace("__LOGO_SRC__",LOGO).replace("__REP_DISPLAY__",r["display"]).replace("__REP_NAME__",r["name"]).replace("__REP_TOKEN__",r["token"])
    dist = f"/Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/rep/dash/{r['slug']}/index.html"
    os.makedirs(os.path.dirname(dist), exist_ok=True)
    open(dist,"w",encoding="utf-8").write(out)
    print(f"✓ {r['slug']}")
PYEOF

# 3. Copiar para o worktree e fazer deploy
cp /Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/rep/dash/iramar/index.html   /tmp/ghpages-hist2/rep/dash/iramar/index.html
cp /Users/robertmarques/Desktop/lifebimport-jlbv/dist/public/rep/dash/natanael/index.html /tmp/ghpages-hist2/rep/dash/natanael/index.html
cd /tmp/ghpages-hist2 && git add rep/dash/iramar/index.html rep/dash/natanael/index.html
git commit -m "descrição"
git push origin gh-pages
```

### Funcionalidades implementadas

#### Leads ativos
- Cards com borda colorida por status: vermelho (Aguardando contato), âmbar (Em contato), verde (Em negociação)
- Filtros por status nos cards de resumo — clicar em card filtra; clicar de novo limpa
- **Filtro pagina dentro do conjunto filtrado**: `toShow = _allLeads.filter(status)`, `visible = toShow.slice(0, _visibleCount)`, Ver mais/Ver menos funcionam normalmente dentro do filtro
- Paginação: 8 leads por vez (`LIMIT = 8`), "Ver mais ▾" / "▴ Ver menos"
- Ordenação: Aguardando → Em contato → Em negociação, depois por data dentro de cada grupo

#### Interação com status
- Select de status → overlay de confirmação (ícone dinâmico + mensagem contextual)
- **Fechado e Perdido: status NÃO muda na UI até o formulário ser completado** — update otimista só ocorre em `saveStatusExtra` após form completo
- Fechado: **dois passos separados**: passo 1 = valor (R$ com preview em tempo real), passo 2 = data (pré-preenchida com hoje)
- Perdido: prompt de motivo (select)
- Em negociação: prompt opcional de valor potencial + botão Pular
- Após qualquer conclusão: concluding mode — obs obrigatória antes de sair da fila
- Timestamp "Atualizado: DD/MM - HH:MM" exibido abaixo do select de status

#### Undo otimista
- `_pendingUndoByRow[row]`: acumula ações durante concluding mode; toast aparece após `concludeCard`
- Reverte: status + valor/motivo + data_fech + valor_potencial + timestamp

#### Painel de contato
- Nomes clicáveis → overlay de confirmação antes de abrir WhatsApp
- CNPJ formatado `XX.XXX.XXX/XXXX-XX`
- Botões WA e Maps → overlay de confirmação

#### One-card-at-a-time
- `closeOtherCardUi(exceptRow)`: ao abrir qualquer UI num card, fecha todos os outros

#### Cache e polling
- `CACHE_KEY = 'lifeb_cache___REP_NAME__'` — string literal substituída em build time (não concatenação JS)
- Cache salvo com `{ rep: REP_NAME, leads, ts }` — leitura valida `cached.rep === REP_NAME` para evitar contaminação cruzada entre reps (mesmo domínio, mesmo localStorage)
- `POLL_MS = 60000ms`; `visibilitychange` força refresh ao voltar à aba
- Retry silencioso 2× antes de mostrar banner de erro

#### Logo
- `onclick="location.reload()"` + `cursor:pointer` — clique na logo = refresh completo

#### Histórico
- Colapsa em qualquer clique fora de `#historico-section`
- Guard `document.contains(e.target)`: evita colapso quando o click target é removido do DOM pelo próprio onclick (bug do `setHistTab` que substituía o `body.innerHTML`)
- IntersectionObserver vigia `#leads-list`: se rep rola de volta → 3s delay → colapsa
- Tabs Fechados/Perdidos com contadores; ordenado do mais recente para o mais antigo
- Adição otimista: lead aparece no histórico imediatamente ao marcar Fechado/Perdido
- Paginação: 5 por página, "Ver mais ▾" / "▲ Ver menos"
- WA nos cards do histórico com overlay de confirmação

### Colunas do proxy relevantes para este painel

| Constante | Índice (0-based) | Campo na planilha |
|-----------|------------------|-------------------|
| `COL_STATUS_VEND` | 18 | STATUS_VENDEDOR |
| `COL_VALOR_POT` | 21 | VALOR_POTENCIAL |
| `COL_DATA_FECH` | 22 | DATA_FECH |
| `COL_VALOR_FECH` | 24 | VALOR_FECHADO |
| `COL_MOTIVO_PERD` | 25 | MOTIVO_PERDA |
| `COL_OBS_VEND` | 26 | OBS_VENDEDOR |

### Histórico de commits gh-pages (painel rep)

| Commit | Descrição |
|--------|-----------|
| primeiros commits | Estrutura inicial, confirmações de status, painel de contato |
| `b980ca9f` | Cache isolado por rep, guard document.contains, histórico |
| `b2bd3f0a` | Correções do histórico, timestamps, undo |
| `36425204` | Fechamento em dois passos (valor → data), logo clicável |
| `af7f095f` | Fix status prematuro Fechado/Perdido; fix filtro com paginação; fix lead2.status Perdido |
| `3d5c89ff` | Timestamp fallback: cards sem histórico mostram "Entrada: DD/MM/AA" |
| `32691e57` | Update atômico (`update_lead`) + sync cross-device de timestamp via COL_TIMESTAMP_VEND |
| `a12c8cae` | Rollback visual em falha de `update_lead` + proxy valida updates rigorosamente |
| `d5c6ff99` | Título/subtítulo empresa+contato nos cards (fix incorreto — contato tinha telefone) |
| `d2542bc0` | Fix: subtítulo usa nome do lead (`l.nome`), não `l.contato` |

### Bugs corrigidos em 25/04/2026

**1. Status prematuro ao selecionar Fechado/Perdido**
- Sintoma: card mostrava "Fechado"/"Perdido" antes do rep completar o formulário; se cancelasse, ficava errado até o próximo poll
- Causa: `confirmStatusChange` aplicava `raw.status = valor` e atualizava a UI antes de qualquer formulário
- Fix: Fechado/Perdido entram em early-return antes do bloco de update otimista; update só ocorre em `saveStatusExtra` após form completo

**2. Timestamp "Atualizado: DD/MM - HH:MM" não aparecia**
- Causa: consequência do bug 1 — `confirmStatusChange` setava o status mas nunca chamava `setLeadTs()`
- Fix: corrigido como efeito colateral do bug 1

**3. lead2.status = 'Perdido' faltando em saveStatusExtra**
- Causa: o bloco Perdido não setava `lead2.status` antes do snapshot (o bloco Fechado já tinha sido corrigido)
- Fix: adicionado `if (lead2) lead2.status = 'Perdido'` antes do snapshot

**4. Lista infinita ao filtrar (sem botão Ver mais / Ver menos)**
- Causa: `renderLeads` renderizava `_allLeads` inteiro quando filtro ativo; `applyFilter` escondia o show-more-wrap via CSS
- Fix: filtro feito em JS com `toShow = _allLeads.filter(l => l.status === _activeFilter)`; `visible = toShow.slice(0, _visibleCount)`; botões Ver mais/menos calculados com `toShow.length`; `toggleFilter`/`clearFilter` resetam `_visibleCount = LIMIT`; `applyFilter` virou no-op

### Novas funcionalidades (sessão final 25/04/2026)

**1. Update atômico — `action: 'update_lead'`**
- Fechado e Perdido agora enviam 1 único POST com todos os campos (`STATUS_VENDEDOR`, `VALOR_FECHADO`, `DATA_FECH`, `MOTIVO_PERDA`, `VALOR_POTENCIAL`) em vez de 3–4 POSTs sequenciais
- Proxy usa `LockService.getScriptLock()` — gravação atômica com mutex
- Servidor retorna `{ ok: true, ts: <epoch_ms> }`; frontend atualiza `_tsMap[row]` com o valor autoritativo do servidor

**2. Timestamp cross-device (`COL_TIMESTAMP_VEND = 31` — coluna AF)**
- A cada gravação o proxy escreve `Date.now()` na coluna AF da planilha (epoch ms)
- `getActive` retorna `ts_vend: Number(r[31]) || 0` por lead
- `loadData` mescla `l.ts_vend` do servidor em `_tsMap` local (prefere o mais recente)
- Rep nunca perde o horário de última atualização ao trocar de dispositivo

**3. Timestamp fallback (commit `3d5c89ff`)**
- Leads sem histórico de ação (sem entrada em `_tsMap`) mostram "Entrada: DD/MM/AA" (data de entrada do lead)
- Antes: campo ficava vazio — rep perdia referência de quando o lead chegou

**Colunas novas na planilha**
| Constante | Índice 0-based | Coluna Sheets |
|-----------|---------------|---------------|
| `COL_TIMESTAMP_VEND` | 31 | AF |

**Estado do proxy após esta sessão**
- Arquivo salvo em `/Contexto Paginas SDR/lifeb-leads-proxy.gs`
- **REIMPLANTADO E CONFIRMADO** em produção — `update_lead` testado com `{ ok:true, ts:... }`

### Webhook de captura de leads — `planilha-leads-script.gs`

Correções aplicadas (reimplantado em 25/04/2026):
- `LockService` envolve todo o `doPost` — `appendRow` + `setValues` atômicos
- `try/catch` retorna `{ status:'erro', error:'...' }` em vez de crashar
- Validação: `nome` e `telefone` obrigatórios — POST vazio rejeitado sem inserir linha

Testado: vazio → erro, lead válido → ok, linha inserida corretamente.

### Pendentes conhecidos (não solicitados)

- Responsividade do `dashboard-leads.html` no mobile (fora de escopo)
- Autenticação real (OAuth/JWT) se uso deixar de ser apenas interno
- `dashboard_data` consolidado (reduz leituras paralelas do dashboard/telão — baixa prioridade agora)
- Deduplicação no webhook (SDR marca manualmente como "Duplicado" por enquanto)
