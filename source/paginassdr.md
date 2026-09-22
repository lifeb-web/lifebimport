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
| URL | Status | Descrição |
|-----|--------|-----------|
| `projetojlbv.com.br/` | ✅ ativa | Principal — imagens + formulário |
| `projetojlbv.com.br/video1/` | ✅ ativa | Vídeo supermercado (Vimeo) no hero + formulário |
| `projetojlbv.com.br/video2/` | ✅ ativa | Vídeo farmácia (YouTube) no hero + formulário |
| `projetojlbv.com.br/redefarma/` | ✅ ativa (desde 2026-08-15) | Clone de `/video2/` focado em REDES de farmácia/drogaria — badge "Exclusivo para redes com 20+ lojas" |
| `projetojlbv.com.br/redesuper/` | ✅ ativa (desde 2026-08-15) | Clone de `/video1/` focado em REDES de supermercado — badge "Exclusivo para redes com 10+ lojas" |
| `projetojlbv.com.br/superagos/` | ✅ ativa (desde 2026-09-22) | Clone de `/video1/` exclusivo pro estande da Life B na feira SuperAgos 2026 — badge com a logo da feira, headline/subtítulo do evento, WhatsApp com mensagem própria. Ver seção dedicada mais abaixo |
| `projetojlbv.com.br/rmk/` | ✅ ativa | Remarketing — curta, sem vídeo, formulário, foco em objeção |
| `projetojlbv.com.br/apresentacao-super/` | ✅ ativa | Rep usa com cliente — sem botões, OG por segmento |
| `projetojlbv.com.br/apresentacao-farma/` | ✅ ativa | Rep usa com cliente — sem botões, OG por segmento |
| `projetojlbv.com.br/lifeb/` | ✅ ativa | Site institucional da Life B (não é LP de anúncio) — HTML/CSS/JS puro, fora do build React. Ver seção "LP institucional /lifeb/" mais abaixo |
| `projetojlbv.com.br/contato/` | 🚫 removida | **Removida em 2026-06-09** — rota, build e toda lógica `noWhatsapp` deletados do código |
| `projetojlbv.com.br/direto/` | 🚫 desativada | Redirecionada para `/` — era CTA direto ao WhatsApp sem formulário |
| `projetojlbv.com.br/video1-direto/` | 🚫 desativada | Redirecionada para `/video1/` — era vídeo + CTA direto ao WhatsApp |

**Por que /direto/ e /video1-direto/ foram desativadas (2026-04-27, commit `ba02409d`):**
Essas páginas mandavam o lead direto para o WhatsApp sem passar pelo formulário, sem salvar na planilha, sem disparar `Lead_Formulario`. Um contato chegou no WA sem aparecer na planilha — investigação mostrou que nenhuma execução do GAS ocorreu no horário, confirmando que a pessoa não passou pelo formulário. A hipótese mais provável é que veio pela `/direto/` com Meta Pixel bloqueado (ad blocker, Firefox), o que impede o evento `Contato_WhatsApp` de disparar no Meta mas não impede o clique no WA. Com as páginas desativadas, todo tráfego passa pelo formulário e entra na planilha.

Todas as páginas são variantes do componente `Home` em `client/src/pages/Home.tsx`:
- `<Home />` → página principal
- `<Home directMode />` → sem formulário, evento Contato_WhatsApp
- `<Home variant="video1" />` → vídeo supermercado (Vimeo) no hero; seção depoimentos mostra só farmácia (YouTube)
- `<Home variant="video1" directMode />` → vídeo no hero + sem formulário
- `<Home variant="video2" />` → vídeo farmácia (YouTube) no hero; seção depoimentos mostra só supermercado (Vimeo)
- `<Home variant="redefarma" />` → clone de video2 focado em REDES de farmácia/drogaria (ver seção dedicada "Sessão 15/08/2026")
- `<Home variant="redesuper" />` → clone de video1 focado em REDES de supermercado (ver seção dedicada "Sessão 15/08/2026")
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
| `Pular_Formulario` | **Removido em 2026-04-27** — botão "Pular e ir direto para o WhatsApp" retirado de todas as páginas (< 3% de uso, lead chegava sem entrar na planilha) |
| `Abandonou_Formulario` | Ao fechar o modal clicando no X — dispara sempre, independente de ter preenchido ou não. Se tiver telefone válido preenchido, também salva na planilha |
| `Contato_WhatsApp` | CTAs nas páginas directMode |
| `ScrollDepth_25/50/75/100` | Ao rolar a página |

### Lógica do funil de eventos
- Todo `Lead` e `Abandonou` obrigatoriamente passou por um `Abrir_Formulario` antes
- `Abrir_Formulario >= Lead + Abandonou` (sempre — `Pular` foi removido)
- `Preencheu_Formulario` dispara no GA4 e Meta mas **não aparece no dashboard** (removido para não confundir)
- Os eventos de scroll afetam a taxa de rejeição: qualquer evento durante a sessão já a marca como "engajada" no GA4

> **`Pular_Formulario` foi removido em 2026-04-27** — botão "Pular e ir direto para o WhatsApp" retirado de todas as páginas. Motivo: < 3% de uso, lead chegava no WA sem entrar na planilha, sem rastreamento, mais desqualificado. Era útil só para entender o comportamento inicial das campanhas — esse objetivo já foi cumprido.

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
- Link: `https://api.whatsapp.com/send/?phone=5562996437218&text=Ol%C3%A1!+Vi+o+Projeto+JLBV+da+Life+B+e+quero+saber+mais.&type=phone_number&app_absent=0`
- Texto decodificado: "Olá! Vi o Projeto JLBV da Life B e quero saber mais."

## Leads — Google Sheets
- Webhook: Google Apps Script (URL salva como `SHEETS_WEBHOOK_URL` em Home.tsx)
- URL atual: `https://script.google.com/macros/s/AKfycbxf8BCiia3qwZUh0wUX8pg7xKD-0-p_6ssf7SJAPvCZJjmpJMniwcuAQVFkRl9Mb8wf/exec`
- URL antiga (inativa): `https://script.google.com/macros/s/AKfycbyLJ0T9RmRjI9Um9t4kmUg6GW7he3vCUu-7efnjmSChI2vcrtwFjYRcNCKz5m0RXdEW/exec`
- Colunas: A=data, B=nome, C=telefone, D=origem (botão clicado), E=pagina (URL completa)
- `origem` para leads normais: nome do botão (ex: `hero_cta`, `Botão Flutuante`)
- `origem` para leads abandonados: `{botão} (Abandonou_Formulario)` (ex: `hero_cta (Abandonou_Formulario)`)
- `pagina` usa `window.location.href` — funciona automaticamente para qualquer página nova

## Comportamento do formulário

### Estado atual (2026-04-28)

**Campos:**
- Nome (`required`) e Telefone (`required`) — nenhum campo opcional
- `autoComplete="name"` e `autoComplete="tel"` — browser/celular sugere dados salvos

**Botão CTA:**
- Sempre verde/ativo, sem estado `disabled` — padrão de mercado comprovado para reduzir abandono
- Validação ocorre no submit via `handleSubmit`:
  - Se `phoneValid = false` (ex: "55" + menos de 12 dígitos), retorna silenciosamente
  - Campos `required` ativam validação nativa do browser para campos vazios

**Validação do telefone (função `formatPhone`):**
- Remove tudo que não é dígito
- Auto-strip do código de país: se começar com "55" E tiver ≥ 4 dígitos, remove os dois primeiros (ex: "5562..." → "62...")
- Máscara: `(XX) XXXX-XXXX` (fixo, 10 dígitos) ou `(XX) XXXXX-XXXX` (celular, 11 dígitos)
- `phoneValid`: exige 12 dígitos se começar com "55", senão 10 dígitos

**Validação visual no blur:**
- Ao sair do campo de telefone (`onBlur`) com algo digitado mas inválido → aparece "Número incompleto." em vermelho abaixo do campo
- Não aparece durante digitação — só após o usuário sair do campo
- Não aparece se o campo foi deixado vazio

**Campo +55 visual:**
- Flag 🇧🇷 + "+55" exibidos como prefixo fixo à esquerda do campo — prevenção visual contra digitação do código de país
- Sem aviso reativo quando a pessoa digita "55" — o auto-strip já resolve, o prefixo visual previne

**Fechar o modal:**
- X visível em todas as telas (cinza claro, sutil — `text-gray-400`)
- Swipe down (mobile)
- Clicar fora do modal
- Múltiplas saídas = padrão de maior conversão (usuário não se sente preso)

**Microcopy abaixo do botão:**
- Versão WhatsApp: "Nosso consultor responde em instantes."
- Versão noWhatsapp (`/contato/`): "Nosso consultor entra em contato rapidamente."
- Fonte pequena, cinza, centralizado — não compete com o CTA

**localStorage (`jlbv_lead`):**
- Salva nome + telefone após envio ou abandono com telefone válido
- Na segunda visita o formulário aparece pré-preenchido
- Se o dado estiver salvo, o botão CTA vai direto ao WhatsApp sem abrir o form (lead retornante)
- Para testar como novo visitante: `localStorage.removeItem('jlbv_lead')`

**Captura de abandono:**
- Leads que preenchem tudo mas fecham o modal são capturados na planilha com origem `(Abandonou_Formulario)`
- Beacon `beforeunload` captura quem fecha a aba com o form aberto e preenchido

**Copy do modal — estado final (2026-04-28):**
- H1: `"Fale agora com um consultor"` (WhatsApp) / `"Fale com um consultor"` (noWhatsapp)
- H2: **removido** — modal pós-clique não precisa reexplicar, a landing page já convenceu
- Palavra unificada: "consultor" em todo o modal (H1 + microcopy) — "especialista" foi descartado por soar como barreira para lojistas pequenos e arrogante para lojistas grandes

### Decisões de UX (2026-04-28)
- **H2 removido**: padrão de mercado para modal pós-clique é headline único. H2 adicionava texto desnecessário antes dos campos e era redundante com o microcopy abaixo do botão.
- **"Consultor" unificado**: testado "especialista" — descartado. Público B2B misto (pequeno e grande lojista) responde melhor a "consultor" que é neutro, acessível e não hierárquico.
- **Botão "Pular" removido**: era usado em < 3% dos casos, lead chegava sem entrar na planilha. Removido em 2026-04-27.
- **Nome obrigatório**: adicionado `required` em 2026-04-28. Era opcional antes.
- **Botão sempre ativo**: pesquisa de mercado confirmou que botão desabilitado é um dos maiores causadores de abandono — usuário não entende por que não funciona.
- **Blur validation**: padrão de mercado (Luke Wroblewski, 22% de melhora em conclusão de form). Não interrompe digitação, só valida ao sair do campo.

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

### Script de deploy (deploy.sh) — fluxo atual desde 2026-04-27

```bash
cd /Users/robertmarques/Desktop/lifebimport-jlbv
bash deploy.sh
```

O `deploy.sh` faz tudo automaticamente:
1. `npx vite build` — gera `dist/public/`
2. `rm -rf $PAGES/assets` — limpa assets antigos (hashes mudam a cada build)
3. `rsync -a --exclude='.git' dist/public/ $PAGES/` — copia build para o worktree sem apagar arquivos manuais
4. Restaura redirects das páginas desativadas (`/direto/` e `/video1-direto/`)
5. `git add -A && git commit && git push origin gh-pages` no worktree

**Por que rsync e não `npx gh-pages`:** o `npx gh-pages -d dist/public` faz force-push e substitui o branch inteiro pelo conteúdo de `dist/public/`, destruindo todos os arquivos manuais (dashboards, `rep/dash/`, `source/`). O rsync copia apenas os arquivos do build por cima, preservando o restante.

**Worktree do gh-pages:** `/Users/robertmarques/Desktop/lifebimport-jlbv-pages/`

O vite.config.ts gera automaticamente em cada build:
- `dist/public/CNAME` → projetojlbv.com.br
- `dist/public/404.html` → cópia do index.html para SPA routing
- `dist/public/.nojekyll` → desativa Jekyll no GitHub Pages
- Subpastas de rota: `direto/`, `video1/`, `video1-direto/`, `rmk/`, `contato/`

**Atenção**: o `pnpm build` falha no esbuild do servidor — usar sempre `npx vite build` (só compila o frontend).

### Arquivos manuais no gh-pages — nunca sobrescritos pelo deploy.sh
- `dashboard-leads.html` — dashboard de leads mobile/desktop
- `dashboard-leads-telao.html` — dashboard telão TV
- `dashboard-ga4.html` — painel GA4
- `dashboard-telao.html` — telão antigo (legado)
- `rep/dash/` — painéis individuais de representante
- `source/` — arquivos de contexto e scripts
- `direto/index.html` e `video1-direto/index.html` — redirects (restaurados pelo deploy.sh após cada build)

### Deploy de dashboards (dashboard-leads.html / telão)
Esses arquivos vivem no worktree e são deployados diretamente via git — sem passar pelo build React:
```bash
cd /Users/robertmarques/Desktop/lifebimport-jlbv-pages
git add dashboard-leads.html dashboard-leads-telao.html
git commit -m "dash: descrição da mudança"
git push origin gh-pages
```
Depois copiar para Dropbox:
```bash
cp dashboard-leads.html "/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR/dashboard-leads.html"
cp dashboard-leads-telao.html "/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR/dashboard-leads-telao.html"
```

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

---

## Diagnóstico — Lead que chegou no WA sem entrar na planilha

### Como investigar um lead sumido
1. Verificar horário exato que a mensagem chegou no WA
2. Abrir Apps Script do webhook da planilha → menu **Execuções** → filtrar pelo horário
3. Se houver execução com erro → webhook foi chamado mas falhou → ver mensagem de erro
4. Se não houver execução → webhook nunca foi chamado → a pessoa não passou pelo formulário

### Causas confirmadas / descartadas

| Causa | Status | Motivo |
|---|---|---|
| Bug no `doPost` | ❌ descartada | Código correto, testado — se o webhook é chamado, salva |
| Falha silenciosa no webhook (fetch falhou no frontend) | ⚠️ possível | Sem execução no GAS = não chegou; mas person ainda vai pro WA |
| Pessoa veio pela `/direto/` ou `/video1-direto/` | ✅ provável (caso 2026-04-27) | Páginas sem formulário, sem webhook — meta pixel bloqueado = nenhum evento disparou |
| Contato direto no WA (número compartilhado) | ⚠️ possível | Nenhuma página envolvida — mensagem padrão do botão é a mesma |

### Caso investigado em 2026-04-27
Contato chegou às 18:28 com a mensagem padrão do botão WA. Sem nenhuma execução no GAS nesse horário. Conclusão: webhook nunca foi chamado. Hipótese mais provável — pessoa veio pela `/direto/` (ativa na época) com Meta Pixel bloqueado no dispositivo, então `Contato_WhatsApp` não disparou no Meta e a pessoa não apareceu em eventos nem na planilha.

**Resolução:** `/direto/` e `/video1-direto/` foram desativadas em 2026-04-27 (commit `ba02409d`) — agora redirecionam para as versões com formulário. Esse buraco está fechado.

### Mensagem padrão do WA (igual em todos os caminhos)
```
Olá, sou lojista e quero conhecer o projeto JLBV da Life B.
```
Não é possível determinar a origem do lead pela mensagem — ela é a mesma para form, direto e links compartilhados.

---

## Páginas de Apresentação (rep/SDR usa COM o cliente) — criado 2026-06-03

Páginas que o representante/SDR usa **com o cliente** (morno, já em conversa) como material de convencimento. **Não são anúncio** e **não capturam lead** — quem fecha é o rep, a página é o apoio visual.

| Página | URL (com barra no final) | Segmento |
|--------|--------------------------|----------|
| Apresentação Supermercado | `projetojlbv.com.br/apresentacao-super/` | Supermercado (vídeo Vimeo + fotos super) |
| Apresentação Farmácia | `projetojlbv.com.br/apresentacao-farma/` | Farmácia/Drogaria (vídeo YouTube + fotos farma) |

### Diferença vs páginas de anúncio
| | Anúncio (`/`, `/video1`, `/rmk`) | Apresentação |
|---|---|---|
| Público | Frio (Meta Ads) | Morno (rep já está falando com ele) |
| Objetivo | Capturar lead (form/WhatsApp) | Convencer / quebrar objeção |
| CTA | A própria página | O rep conduz — **sem botões** |

### Como funcionam no código
- Rotas em `client/src/App.tsx`: `<Home variant="apresentacao-super" />` e `<Home variant="apresentacao-farma" />`
- Flag `isApresentacao` em `client/src/pages/Home.tsx` controla tudo: `carouselImages` filtrado por segmento, vídeo do hero por segmento (super=Vimeo `1178399214`, farma=YouTube `aOR4aUSp-zE`), vídeo interativo (não autoplay mudo), badge extra "+2.000 lojas já implantaram o projeto" no hero.
- Pixel Meta (`1659173615439958`) + GA4 (`G-DX8FW7ZTJ3`) disparam normalmente (mesmo `index.html`): `PageView` + `ScrollDepth_25/50/75/100`. Sem eventos de form (não há form).

### O que foi feito em 2026-06-03 (commits `4ab2b446` e `a4cfab33`)
**1. Removidos TODOS os botões/CTAs no modo apresentação:**
- Cases, Galeria: botão WhatsApp removido
- FAQ: texto "Ainda tem dúvidas?..." + botão removidos
- CTA Final: virou **fechamento sem botão** — h2 "Transforme a sua loja com o Projeto JLBV." + badge "+2.000 lojas"
- Footer: telefone `(62) 9920-4961` agora é **texto** (não link clicável)
- Header CTA e botão flutuante já eram escondidos (`!isApresentacao`)
- **Mantidos** (não são CTA): setas/bolinhas do carrossel, zoom de imagem (lightbox), controle de vídeo
- `WHATSAPP_APRESENTACAO_LINK` ficou sem uso → o Vite removeu do bundle (tree-shake)

**2. Páginas estáticas + OG por segmento (preview de link bonito no WhatsApp):**
- `vite.config.ts` (closeBundle) agora gera `apresentacao-super/index.html` e `apresentacao-farma/index.html` com `<title>`, `description`, `og:title`, `og:description`, `og:image` e `og:url` **próprios por segmento**. Persiste em todo build futuro.
- `og:image`: foto de gôndola do segmento (super=`super_1_...jpg`, farma=`farm_1_...jpg` no CloudFront).
- Descrição usa enquadramento **factual**: "Cases reais de +300% a +500% na categoria" (NÃO usa "garantido").
- Resultado: as rotas agora retornam **HTTP 200** (pararam de depender do fallback `404.html`).
- ⚠️ Cache de preview do WhatsApp: a 1ª vez que um link é compartilhado, o WhatsApp guarda o OG. Se foi compartilhado antes do fix, forçar atualização em `developers.facebook.com/tools/debug` (Scrape Again).

### Decisões já tomadas
- Seção final = fechamento **sem botão** (confirmado por Robert)
- **Cases fica na 2ª dobra** (dado real: converte bem nos anúncios, Robert está testando assim)
- Vídeo do hero mantido por segmento
- Copy de vídeo **neutra** — nunca afirmar "ouça do dono" (nos vídeos nem sempre é o dono; pode ser comprador ou contratado)

### Refino PENDENTE (próxima sessão)
1. **Estrutura** (proposta validada em wireframe, ainda NÃO aplicada): `Hero → Cases → Método → Vídeo → Galeria → Quem Somos → FAQ → Fechamento`. Única mudança vs hoje = **descer "Quem Somos"** (hoje está na 3ª posição, interrompe entre o número e o método).
2. **"garantido"** → trocar por factual ("cases de +300% a +500%") em 3 lugares: bullet do hero (`Home.tsx` ~linha 1214), `meta description` e `og:description` do `client/index.html` base. ⚠️ É **compartilhado com as páginas de anúncio** — decidir: trocar em todo lugar (recomendado, e o Meta reprova promessa de ganho garantido) ou só apresentação.
3. **Vídeos por segmento** — Robert vai mandar os links (super e farma) p/ colocar na seção "Resultados em vídeo" (hoje ela mostra o vídeo do segmento OPOSTO). Header neutro: "Veja o Projeto JLBV funcionando em lojas reais" ou "Depoimentos de lojas que já implantaram".
4. **Pixel** — adicionar evento custom `Viu_Apresentacao` (ou por segmento) no load → criar Público Personalizado de remarketing de quem viu o pitch.
5. (opcional) Banner OG desenhado 1200×630 (Canva) no lugar da foto da gôndola.

### Mensagem enviada ao time de reps (45–60 anos) — 2026-06-03
Enviada em 3 mensagens separadas (cada link isolado p/ não confundir):
1. Explicação: "...duas páginas pra ajudar a apresentar o Projeto JLBV pro cliente... ela não fecha a venda no seu lugar, é o apoio..."
2. `🛒 Cliente de SUPERMERCADO → projetojlbv.com.br/apresentacao-super/`
3. `💊 Cliente de FARMÁCIA/DROGARIA → projetojlbv.com.br/apresentacao-farma/`

---

## Estado atual do código — 2026-06-15

### Alterações feitas em 2026-06-15 (commits `a3004caa`, `dba8886a`, `eac8ce29`)

**Vídeo Case de Sucesso — apresentacao-super:**
- Antes: `https://www.youtube.com/embed/CcwM50GkJUU`
- Depois: `https://www.youtube.com/embed/-GbxfQbUTrY` (YouTube Shorts)

**Carrossel apresentacao-super — array separado das landings:**
- Novo array `superApresentacaoImages` em `client/src/pages/Home.tsx`
- 16 fotos em `client/public/fotos-apresentacao-super/apres-super-01.jpg` a `apres-super-16.jpg`
- Origem: `/Users/robertmarques/Downloads/supermercados/`
- Landings (`/`, `/video1/`, `/video2/`) continuam usando `superImages` (fotos-super/) — intactas

**Carrossel apresentacao-farma — array separado das landings:**
- Novo array `farmaApresentacaoImages` em `client/src/pages/Home.tsx`
- 25 fotos em `client/public/fotos-apresentacao-farma/apres-farma-01.jpg` a `apres-farma-25.jpg`
- Origem: `/Users/robertmarques/Downloads/farmacias/`
- Landings continuam usando `farmImages` (fotos-farma/) — intactas

**Lógica do carrossel (carouselImages) após 2026-06-15:**
```tsx
const carouselImages = variant === "apresentacao-farma"
  ? farmaApresentacaoImages.map(src => ({ src, label: "Farmácia" }))
  : variant === "apresentacao-super"
  ? superApresentacaoImages.map(src => ({ src, label: "Supermercado" }))
  : allCarouselImages;
```

---

## Estado atual do código — 2026-06-21 (sessão noite)

### Ajuste pontual de headline nas landings

**Rotas afetadas:**
- `/`
- `/video1/`
- `/video2/`

**Headline hero nas 3 LPs de anúncio:**
- Restaurada para: "Transforme Acessórios em **Lucro** para Sua Loja!"
- Destaque verde voltou a ficar só em "**Lucro**"

**Páginas de apresentação:**
- `/apresentacao-super/` e `/apresentacao-farma/` **não** foram alteradas
- Mantêm: "Transforme sua loja em uma máquina de gerar **Lucro e Encantamento**!"

**Motivo da reversão:**
- Robert avaliou que a versão antiga era mais direta e provavelmente converte melhor no tráfego frio
- "Acessórios" + "Lucro" deixa a oferta mais clara já na primeira dobra
- Evitado mexer em CTA, subtítulo, bullets ou layout nesta rodada

**Observação operacional:**
- O `pnpm exec vite build` estava lento/inconclusivo na sessão
- Para não arriscar deploy amplo, a correção foi feita de forma cirúrgica no worktree do `gh-pages`
- Commit publicado no `gh-pages`: `bcac8cc3` (`fix: restaura headline das landing pages`)
- O `curl` logo após o push ainda mostrou o asset antigo por cache, mas Robert confirmou depois que "deu bom"

---

## Estado atual do código — 2026-06-12 (sessão tarde)

### Alterações feitas nesta sessão (commits `fdad3942` e `83c682e4`)

**H1 hero — todas as 5 páginas (`/`, `/video1/`, `/video2/`, `/apresentacao-super/`, `/apresentacao-farma/`):**
- Antes (landing): "Transforme Acessórios em **Lucro** para Sua Loja!"
- Antes (apresentação): "Transforme sua loja em uma máquina de gerar lucro e encantamento!"
- Depois (todas): "Transforme sua loja em uma máquina de gerar **Lucro e Encantamento**!"
- Decisão de posicionamento: "Acessórios" no H1 commoditiza — posiciona como mais um fornecedor. O produto vendido é o método JLBV, não o acessório.

**Fechamento — landing pages (`/`, `/video1/`, `/video2/`):**
- Antes: "Quer implantar o Projeto JLBV na sua loja?"
- Depois: "Quer transformar sua loja em uma máquina de gerar **Lucro e Encantamento**?"
- Mantém linguagem do hero, vira pergunta de fechamento/decisão

**Fechamento — apresentações:**
- Apenas maiúsculas corrigidas: "lucro e encantamento" → "**Lucro e Encantamento**"

**CTAs — botões que mencionavam "catálogo":**
- Hero: "Receber catálogo no WhatsApp" → "Quero esse resultado!"
- Quem Somos: "Quero receber o catálogo" → "Quero esse resultado!"
- Motivo: SDR não envia catálogo — promessa falsa e linguagem de fornecedor comum
- FAQ (resposta sobre como contato funciona): removida menção a "catálogo completo"

**Backup:** `Home.tsx.backup-20260612-HHMMSS` salvo no Dropbox/Contexto Paginas SDR/

---

## Estado atual do código — 2026-06-12 (sessão manhã)

### Alterações feitas em 2026-06-12 (commit `d640b645`)

**Carrossel:**
- `super-01.jpg` removida do `superImages` → landing 21→20 fotos, apresentacao-super 8→7 fotos
- Array atual: `super-03.jpg` a `super-09.jpg` (7 fotos). `super-01.jpg` era AI-generated sem overlay real.

**Vídeo apresentacao-super:**
- Poster `/thumb-super-mega.png` removido da seção "Case de Sucesso" → vídeo abre direto sem capa

**Espaços excessivos corrigidos no `isApresentacao`:**
- Hero container: `py-10 sm:py-14 md:py-20 lg:py-28` → `py-8 sm:py-10 md:py-12 lg:py-16`
- `pt-2` vazio no hero (onde era CTA) → removido com wrapper `!isApresentacao`
- Grid 6 cards: `mb-10 sm:mb-12` removido quando isApresentacao
- AnimatedSection vazia após cards JLBV → wrapped com `!isApresentacao`
- AnimatedSection vazia após Case de Sucesso → wrapped com `!isApresentacao`

**Incidente recuperado:**
- Deploy manual com `rsync --delete` apagou dashboards, rep/dash/, kit/, source/ do gh-pages → restaurados via `git checkout d0e95d4f -- <arquivos>` no mesmo deploy (commits `b12ce813` apagou, `60d394af` restaurou). **REGRA: nunca usar rsync --delete na pasta lifebimport-jlbv-pages/. Usar SEMPRE `bash deploy.sh`.**

---

## Estado atual do código — 2026-06-09

### Alterações feitas nesta sessão
- `/contato/` removida completamente: rota do `App.tsx`, geração de pasta no `vite.config.ts`, e toda a lógica `noWhatsapp` do `Home.tsx` (prop, state `showSuccess`, todos os ternários). TypeScript limpo.
- Variantes ativas no `Home.tsx`: `"video1"`, `"video2"`, `"rmk"`, `"apresentacao-super"`, `"apresentacao-farma"`.

### Mudanças radicais planejadas (próxima sessão)
Robert quer redesenhar as páginas de forma significativa. Detalhes a definir na próxima sessão. **Antes de qualquer alteração: ler este arquivo completo e fazer backup do `Home.tsx` atual.**

### Integração LP → GS Engage (planejada)
- Lead do formulário vai cair simultaneamente no Sheets (já funciona) e no GS Engage (a implementar)
- API do GS funciona: `POST https://api.gsengage.com/api/v1/leads?apiKey=...` cria lead
- Key não pode ficar no frontend — será chamada via novo endpoint `POST /gs-inbound` no Cloudflare Worker
- Limitação: associar à cadência via API não funciona ainda — resolver via automação dentro do GS Engage
- 4 cadências planejadas: Inbound Quente / Recuperação Inbound SDR / Recuperação Inbound Pós-closer / Recuperação Outbound Pós-closer
- Pendente: Robert criar cadências no GS e confirmar se há regra de automação por fonte de lead

---

## Estado atual do código — 2026-06-22/23

### Alterações feitas nesta sessão (commits `a97f6086`, `6597c968`, `8fe5c3c8`, `7e81704b`, `7613ebce`)

**Vídeo "Case de Sucesso" — /video1/ e /apresentacao-super/:**
- Antes (apresentacao-super): `https://www.youtube.com/embed/-GbxfQbUTrY`
- Antes (video1): mostrava o vídeo farmácia `aOR4aUSp-zE` (super já estava no hero)
- Depois (ambas): `https://www.youtube.com/embed/4NsS7DIlM20` (YouTube Shorts supermercado)
- Lógica: bloco unificado `(variant === "apresentacao-super" || variant === "video1")` mostra o novo vídeo; bloco farmácia excluído de video1 com `variant !== "video1"`

**Carrossel apresentacao-super — 2026-06-22:**
- Removidas: apres-super-01 a 07, 13, 16 (9 fotos)
- Adicionadas: apres-super-17 a apres-super-28 (12 fotos novas do OneDrive: `ARQUIVOS MAC/LVL IMPORTADORA/LIFE B/Imagens Supermercado/`)
- Mantidas: apres-super-08 a 12, 14, 15 (7 fotos)
- Total atual: 19 fotos (08–12, 14–15, 17–28)

**OG image apresentacao-super — 2026-06-22:**
- Antes: `https://d2xsxph8kpxj0f.cloudfront.net/.../super_1_0a938658.jpg`
- Depois: `https://projetojlbv.com.br/fotos-apresentacao-super/apres-super-27.jpg`
- Para forçar atualização do preview no WhatsApp: `https://developers.facebook.com/tools/debug/?q=https://projetojlbv.com.br/apresentacao-super/` → Scrape Again

**Carrossel apresentacao-farma — 2026-06-23:**
- Removidas: apres-farma-14 a 25 (12 fotos)
- Reorganização: apres-farma-03 movida para posição 1 (capa)
- Adicionadas: apres-farma-26 a apres-farma-30 (5 fotos novas do `/Users/robertmarques/Downloads/farmacias/NOVAS/`)
- Ordem final: 03, 26, 27, 28, 29, 30, 01, 02, 04–13
- Total atual: 18 fotos

---

## Estado atual do código — 2026-07-05/06

### Alterações feitas em 2026-07-05 (deploy `8f016816`)

**Vídeo "Case de Sucesso" — apresentacao-super:**
- Antes: YouTube Shorts `4NsS7DIlM20` (desde 22/06)
- Depois: Vimeo `1178399214`
- O vídeo YouTube Short que estava no Case subiu para o Hero — swap completo entre as duas seções.

### Alterações feitas em 2026-07-06, sessão da tarde (commit `fccc1f7a`)

**Hero (topo) — apresentacao-super:**
- Antes: YouTube Short `Sg2U60QIlOU` (vindo do swap de 07-05)
- Depois: Vimeo `1207541000`
- Motivo: o YouTube Short foi **bloqueado no YouTube**.
- Aparece 2x no `Home.tsx` (bloco mobile e bloco desktop do hero) — as duas ocorrências mudam juntas.
- Publicado via patch direto no bundle já publicado (`assets/index-*.js`), pulando o `vite build`: o Mac estava com RAM/swap no limite e o build travou minutos em "transforming...".

### Alterações feitas em 2026-07-06, sessão da noite (commit `a6803942`)

**Remoção do overlay de título/autor do vídeo Vimeo do hero:**
- Robert reportou que o título do vídeo (overlay que o player do Vimeo mostra por padrão sobre o vídeo) estava incomodando.
- Adicionado `&title=0&byline=0&portrait=0` na URL do embed do Vimeo do hero (`1207541000`), nas duas ocorrências (mobile + desktop) em `Home.tsx` e no bundle publicado.
- Publicado direto via **GitHub Contents API** (`gh api`), sem passar pelo git local nem por rebuild: o `git commit` local também travou pela mesma causa de RAM (Mac com ~154MB livres, swap 17,3/18,4GB usado), e o processo cancelado deixou um `index.lock` órfão no worktree (`lifebimport-jlbv-pages/.git`) que bloqueava qualquer operação git seguinte até ser removido manualmente.
- Repo local sincronizado depois com `git fetch origin gh-pages` + `git reset --hard origin/gh-pages`.
- Confirmado ao vivo em produção (`projetojlbv.com.br/assets/index-*.js`) sem overlay de título/autor.

---

## LP `/lifeb/` — criada e integrada em 2026-07-14

**⚠️ Correção (15/07): essa página NÃO é institucional.** O projeto JLBV não tem nenhuma página institucional — é uma LP de anúncio igual a `/`, `/video1/`, `/video2/`, `/rmk/`. O rótulo "institucional" usado abaixo (14/07) foi suposição errada da extração inicial, nunca confirmada com o Robert. As únicas páginas de propósito diferente no projeto são as 2 de apresentação (`/apresentacao-super/`, `/apresentacao-farma/` — uso do rep com cliente morno, sem captura de lead). Tratar `/lifeb/` com as mesmas táticas de copy/conversão/compliance das outras LPs de anúncio — ver seção "Sessão 15/07" mais abaixo pro levantamento completo.

### O que é
Site institucional da Life B (não é LP de anúncio, não faz parte do fluxo de tráfego pago dos SDRs) — mas publicado dentro do mesmo repositório/domínio do projeto JLBV porque é o mesmo negócio, mesma equipe de tráfego, e reaproveita a mesma infra de tracking e captura de lead.

**URL pública:** `https://projetojlbv.com.br/lifeb/`

### Origem
Feito por um web designer terceirizado, repositório GitHub privado `fykos/lifeb` (dono: Elis Nunes Ficos). É HTML/CSS/JS puro (sem PHP/MySQL) — o freelancer tinha construído um admin completo (login + banco MySQL, upload de banners/depoimentos/vídeos) mas **removeu tudo no último commit** porque a hospedagem contratada só aceita HTML estático. Resultado: **não existe mais painel admin** — qualquer troca de foto/texto exige editar `lifeb/index.html` direto (sem CMS).

### Onde vive
- Clonado do `fykos/lifeb` e colocado como subpasta `/lifeb/` dentro do worktree `~/Desktop/lifebimport-jlbv-pages` (repo `lifeb-web/lifebimport`, branch `gh-pages` — o MESMO repo de todas as outras LPs desta página de contexto).
- **Fora do build React/Vite** — igual aos dashboards (`dashboard-leads.html` etc.), é editado e deployado direto no worktree via `git add/commit/push origin gh-pages`, sem passar por `deploy.sh`/`vite build`.
- `.htaccess`, `manifest.json`, `sitemap.xml`, `robots.txt` próprios da subpasta.

### Integração feita (14/07/2026) — para ficar igual às outras LPs do projeto
- **Meta Pixel** `1659173615439958` + **GA4** `G-DX8FW7ZTJ3` (mesmos IDs das outras páginas). Antes: placeholders falsos (`xxx` / `G-xxx`), zero rastreio real.
- **Modal de captura de lead** (nome + telefone) nos 5 botões de WhatsApp da página — antes só linkava direto pro WhatsApp, sem formulário, sem cair em planilha nenhuma.
- Lead vai pro **mesmo webhook** (`SHEETS_WEBHOOK_URL`) e cai na **mesma planilha** de leads dos vendedores — `pagina` grava como `https://projetojlbv.com.br/lifeb/`, então dá pra filtrar/segmentar por origem na planilha.
- Eventos GA4 + Pixel: `Abrir_Formulario`, `Lead_Formulario`/`Lead`, `Abandonou_Formulario`, `Contato_WhatsApp`, `ScrollDepth_25/50/75/100` — mesmos nomes usados nas outras LPs.
- `localStorage` usa a MESMA chave `jlbv_lead` — lead que já preencheu formulário em qualquer outra página do projeto (`/`, `/video1/` etc.) pula o formulário aqui também, e vice-versa.

### Bugs reais corrigidos nessa sessão
- Comentário CSS quebrado (`/* ... * /` com espaço em vez de `*/`) desativava um bloco inteiro de regras responsivas.
- `.pillars-grid` sem `display:grid` (a config de colunas não fazia nada) + `.pillar-card` com largura fixa de 363px que estourava em qualquer tela <411px de largura.
- `.hero` sem padding horizontal (só top/bottom) enquanto todas as outras seções tinham 24px.
- Bug de validação de telefone: DDD **55** (Santa Maria/RS) era sempre rejeitado no formulário — a lógica de remover código de país (`+55`) cortava o DDD por engano, já que a máscara do campo sempre entrega exatamente 11 dígitos (nunca inclui código de país). Achado pela auditoria de código antes do deploy, corrigido e testado (casos DDD 55, DDD 62, número colado com +55, número incompleto).
- `<meta charset="UTF-8">` passou de 1024 bytes depois que os scripts de Pixel/GA4 foram inseridos antes dele → Chrome não detectava o encoding a tempo → acentos quebravam (mojibake, ex: "acessórios" virava "acessÃ³rios"). Corrigido movendo o charset pro topo do `<head>`, antes de qualquer script.
- SEO: `og:url`, `og:image` e `sitemap.xml` estavam com caminho relativo (preview de link quebrava no WhatsApp/Facebook) → trocados para absolutos.
- 37 imagens sem `alt` ganharam texto alternativo; duas tags `<h4>...</p>` mal fechadas corrigidas para `<h4>...</h4>`.

### Pendências conhecidas (não bloqueantes)
- ~1,2MB de imagens órfãs em `uploads/` (sobras do período em que existia admin/CMS, não usadas no HTML atual) — não removidas, baixo risco/baixo ganho.
- `fb:app_id content="xxx"` ainda placeholder (Pixel não usa esse campo, inofensivo).
- Sem CMS: qualquer atualização futura de conteúdo (trocar banner, depoimento, texto) exige editar `lifeb/index.html`/`lifeb/uploads/` direto e fazer novo commit — não tem mais painel.
- Durante o teste do webhook (14/07), algumas linhas **"TESTE Claude Code..."** caíram na planilha real de leads — seguem a convenção já estabelecida no projeto (nome com "TESTE", seguras pra apagar).
- Auditoria de código (code-reviewer) rodada antes do deploy — achou só o bug do DDD 55, resto sem ressalvas (sem XSS, sem duplicação de eventos, CTAs coerentes).

### Commits (worktree `lifebimport-jlbv-pages`, branch `gh-pages`)
- `2f0be22d` — publicação inicial da pasta `/lifeb/` (cópia crua do repo do freelancer)
- `f5d89609` — integração Pixel/GA4/formulário + fix dos bugs de CSS/SEO/DDD55/charset

---

## Sessão 15/07/2026 — modal refeito, bug crítico de visibilidade, QA geral

Continuação direta da sessão de 14/07. Resumo completo em `handoff.md` nesta mesma pasta — ler esse arquivo primeiro, ele tem a versão mais enxuta e atualizada. Aqui vai o registro histórico detalhado.

### 1. Modal de lead refeito (v1 estava "merdinha")
Robert reclamou que o modal publicado em 14/07 não estava igual ao das outras LPs — visual genérico, não o componente React de verdade. Reescrito comparando linha a linha com `LeadModal` em `client/src/pages/Home.tsx`:
- Sheet mobile (sobe de baixo, cantos arredondados só em cima, swipe fecha) / centralizado no desktop
- Logo Life B, ícone SVG do WhatsApp no botão, campo CNPJ opcional (`XX.XXX.XXX/XXXX-XX`), máscara de telefone ao vivo enquanto digita (porta 1:1 da função `formatPhone` do React)
- Cores de marca corrigidas: v1 usava `#6a1b9a`/`#25d366` (roxo/verde do CSS do freelancer, nunca foram as cores certas do projeto) → trocado pro roxo/verde reais (`#704B9B`/`#22C35D`)
- Testado isolado em Node (headless Chrome não confiável nessa sessão, ver seção de gotcha técnico) — máscara de telefone e CNPJ batem byte a byte com a função canônica, incluindo o caso do DDD 55

**Bug real achado nessa reescrita**: CSS global do freelancer `div img { width:100%; height:100% }` conflitava com `.lead-modal-logo` (que só definia `height`, não `width`) → logo ficava esticada numa faixa larga e achatada em vez de pequena/proporcional. Reproduzido isolado (arquivo de teste com só a regra conflitante) antes e depois do fix — confirmado. Fix: `width: auto` adicionado na regra do modal.

### 2. GS Engage — falso alarme meu, não bug real
Testei o endpoint errado (`gs-agendor-worker.../gs-inbound`, Cloudflare Worker) e achei que leads não estavam chegando no GS Engage. Essa rota **sempre foi bloqueada por WAF do GS Engage desde 16/06/2026** (doc antiga, ver [[project_lp_gs_agendor_integracao]] na memória) — não é o caminho real de entrega. O caminho que funciona de verdade é `planilha-leads-script.gs` (Google Apps Script, roda no IP do Google, que o WAF não bloqueia). `/lifeb/` sempre usou esse webhook corretamente desde a publicação — nunca teve gap de entrega ao GS Engage. Lição: sempre checar documentação/memória por gotcha já conhecido antes de testar integração externa ao vivo (perdi tempo real repetindo uma descoberta de 16/06).

### 2b. Incidente de cota compartilhada (achado do Robert, não meu)
`agendor-outbound-proxy.gs` (proxy do Dashboard Geral) rodava na MESMA conta Google (`robert131196@gmail.com`) que o webhook de leads. Cota diária de `UrlFetchApp` é por conta, não por script — meus testes pesados no Dashboard Geral (~19h de 14/07) estouraram a cota, e isso travou a entrega de lead pro GS Engage por algumas horas (lead caía na planilha normal via SpreadsheetApp, que não usa a cota, mas não repassava pro CRM). **Resolvido na madrugada de 15/07**: `agendor-outbound-proxy.gs` migrado pra conta separada (`cel.lvlimportadora@gmail.com`). Confirmado estável desde então (inclusive um respingo residual de 2 minutos exatamente na janela em que a migração estava terminando de se assentar, 08:42-08:44 de 15/07 — testado e fechado).

### 3. Otimização geral de mídia
Pedido do Robert: "traz tudo de bom das outras LPs, mantendo a identidade visual dessa, melhora mídias, tudo."
- 7 backgrounds de seção (`bg-01` a `bg-08`, PNG fotográfico pesado) convertidos pra WebP — primeira tentativa em qualidade 82 (ficou ~90%+ menor, mas arriscado demais), **recomprimido pra qualidade 95** depois do relato de "qualidade péssima" do Robert (ainda ~40-45% menor que o PNG original, margem de segurança grande contra artefato)
- Botão flutuante de WhatsApp adicionado (faltava — todas as outras LPs têm)
- `loading="lazy"` + `decoding="async"` em 42 das 44 imagens (só logo do header e 1ª imagem do hero ficaram eager, pra não prejudicar LCP)
- SweetAlert removido (CSS+JS carregados via CDN mas nunca chamados no código — peso morto)
- 152KB de thumbnails órfãos do CMS removido (`_thumb_*`, confirmado zero referências) movidos pra fora do deploy
- **Revertido**: tentei converter as fotos de `uploads/banners/` e `uploads/napratica/` pra WebP também. Eram JPEGs já bem comprimidos pelo processo original — em qualidade segura (88-95) ficavam do MESMO tamanho ou MAIORES que o JPEG original em vários casos (double-compression penalty). Sem ganho real, com risco de qualidade à toa — revertido pro `.jpeg` original.
- Achados extras de órfãos do CMS removido durante a limpeza: pasta `uploads/videos/` inteira (2 imagens, nunca referenciadas — o vídeo real usa thumbnail do próprio Vimeo/YouTube via CDN) + 2 banners extras + 2 napratica extras. **Não removidos** — o guard de destructive-action do Claude Code bloqueou mover/apagar por não terem sido nomeados explicitamente pelo Robert. Inofensivos (não carregados por ninguém), só peso morto no repo.

### 4. 🔴 BUG CRÍTICO — conteúdo inteiro invisível pra qualquer visitante
QA geral pré-tráfego (pedido do Robert: "revisada geral mobile e desktop... vamos deixar ela pronta pra receber tráfego") revelou que **Resultados** (3 cards de stats de clientes), **Conheça Projeto JLBV** (6 pilares), **Garantia** (4 diferenciais) e os **2 vídeos de depoimento reais** ficavam permanentemente invisíveis — travados em `opacity:0` desde sempre.

**Causa**: o freelancer usa um `IntersectionObserver` (linha ~776 do `index.html`) pra revelar esse conteúdo com fade-in ao rolar a página. Container observado dispara animação em cascata nos filhos. Só que esse observer **nunca disparava** pra `.results-grid`, `.video-grid` (testimonials), `.features-grid` e `.pillars-grid` — ficavam eternamente com `opacity:0`. O único motivo do hero (`.banners`) parecer funcionar é que ele TEM uma regra CSS redundante (`animation: fadeUp .8s ease both` direto no CSS, linha ~991 do `site.css`) que dispara sozinha independente do JS — mascarou o problema ali por acidente, mas os outros containers não tinham esse fallback.

Confirmado com teste real: rolei a página inteira via CDP (scroll incremental com pausa, disparando qualquer lazy-load/intersection possível) e o conteúdo continuava em `opacity:0` — não era timing, era o observer genuinamente nunca disparando pra esses containers específicos. Provavelmente bug PRÉ-EXISTENTE do freelancer desde a criação original, não algo introduzido nessa sessão — testei remover `loading="lazy"` como hipótese de causa (pensei que pudesse estar afetando o cálculo de largura do carrossel `reorganizaq()` antes do observer rodar), não resolveu sozinho, então não é essa a causa raiz — a causa raiz específica do porquê o observer não dispara pra esses containers não foi 100% identificada, só contornada.

**Fix aplicado**: rede de segurança via `setTimeout` de 1.5s logo após o setup do observer — busca qualquer elemento ainda com `opacity: 0` inline no style e força pra `opacity: 1` sem animação, independente do observer ter disparado ou não. Sacrifica o efeito de fade-in pra conteúdo abaixo da dobra em troca de garantir que nada fica invisível pra sempre — mesmo padrão de segurança que já existe informalmente no `.napratica-card` (nunca foi wireado nesse sistema de animação, sempre visível, sempre funcionou).

Testado localmente (`python3 -m http.server`, sem depender de rede/CDN) em mobile (~500px, limite técnico da sessão) e desktop (1440px), com e sem scroll, antes de publicar. Reconfirmado ao vivo em produção depois do deploy: `opacity:1` em todos os elementos antes travados, zero erro de console.

### 5. QA geral completo — o que passou
- Zero erro de console em toda a sessão de testes (mobile ~500px + desktop 1440px), incluindo interação com menu, modal, validação de formulário vazio, lightbox de vídeo (Fancybox), FAQ accordion, botão flutuante
- Zero scroll horizontal / overflow em nenhuma largura testada
- Zero recurso local quebrado (40 arquivos checados via HEAD request)
- Meta tags, favicon, OG — todos presentes e corretos
- Peso total ~1,97MB (HTML+CSS+imagens referenciadas), maior parte só carrega quando o visitante rola até lá (lazy loading)

### 6. ⚠️ PENDENTE — bug relatado no iPhone (Safari), não localizado
Robert testou no iPhone real (Safari) e reportou: "não tá carregando direito no mobile, tudo quebrado ou cortado ou algo impedindo o carregamento." Investigação extensa não conseguiu reproduzir nem confirmar a causa raiz — ver `handoff.md` seção específica pra lista completa do que já foi descartado (`position:sticky`, `100vh`, padding do header) e o que já foi corrigido mas ainda não é certeza de ser a causa (`backdrop-filter` sem prefixo `-webkit-` no `.banner` do hero — corrigido no arquivo local, não deployado ainda).

**Causa raiz real ainda não identificada.** Próximo passo obrigatório: ver o problema com os próprios olhos — print real do iPhone (cai sozinho no Desktop do Robert) ou teste em dispositivo real antes de tentar qualquer fix novo. Chutar mais correção sem ver o problema é desperdício.

### 7. Gotcha técnico da sessão — CDP trava sob pressão de memória
A máquina do Robert ficou com <100MB de RAM livre boa parte dessa sessão (ele mantém 50-70 processos Chrome próprios abertos normalmente). Nesse estado, `Emulation.setDeviceMetricsOverride` do Chrome DevTools Protocol trava `Runtime.evaluate` por dezenas de segundos (às vezes >90s), mesmo numa página já carregada — não é bug da página sendo testada, é o comando de resize em si ficando caro sob swap pesado, piora bastante especificamente com essa página (jQuery+Fancybox+GA+Pixel+44 imagens).
- **Workaround que funciona pra desktop/larguras médias**: iniciar Chrome headless já no tamanho certo via flag `--window-size=W,H` (não redimensionar em runtime), conectar direto na aba já existente sem chamar `Emulation.setDeviceMetricsOverride`. Só emula um mínimo de ~500px de largura nessa técnica (piso do próprio SO/Chrome headless nessa máquina) — não serve pra reproduzir largura real de iPhone.
- **Pra mobile real (390px/320px)**: `Emulation.setDeviceMetricsOverride` funciona quando a máquina tem um momento de folga (funcionou instantâneo numa tentativa isolada), mas trava na maioria das tentativas quando há concorrência de recursos. Não dá pra depender disso de forma confiável nessa máquina específica.
- Sem Xcode/`simctl` instalado — sem Simulador iOS disponível como alternativa.

### 8. Pendente — melhorias de copy/conversão (levantamento aprovado, aguardando aplicar)
Comparação com padrões já validados nas outras LPs de anúncio do projeto (agora que ficou confirmado que `/lifeb/` é LP de anúncio, não institucional):

1. **🔴 Prioridade alta — risco de reprovação de anúncio**: seção Garantia diz *"o projeto JLBV **garante** um crescimento mínimo na categoria de 300%"* — Meta reprova promessa de resultado garantido. Trocar por factual: *"cases reais de +300% a +500% na categoria"*.
2. **Erro de gramática real no subtítulo do hero**: *"...deixa seus concorrentes por impulso a diferença entre os seus concorrentes."* — frase sem sentido, precisa reescrever.
3. **CTAs inconsistentes** — 5 textos de botão diferentes ("Fale com um consultor" / "Quero esse resultado na minha loja" / "Quero saber mais informações" / "Quero implantar na minha loja" / "Falar com consultor agora"). Padrão validado: **"Quero esse resultado na minha loja"** (topo/meio) + **"Quero implantar na minha loja"** (fechamento). Só 2 dos 5 já batem.
4. **Headline genérico**: "Transforme acessórios em lucro pra sua loja" — falta a urgência FOMO que a `/rmk` comprovou converter melhor.
5. **Sem trust bar de urgência**: outras LPs têm "✓ Vagas limitadas por região · resposta em minutos" no hero, `/lifeb/` não tem.
6. **Hero com carrossel de imagem, não vídeo** — `/video1/`/`/video2/` usam vídeo autoplay mudo (métrica comprovada). Mudança estrutural maior, confirmar com Robert antes de aplicar.

### Commits desta sessão (worktree `lifebimport-jlbv-pages`, branch `gh-pages`)
- `596574e7` — perf: otimização geral de mídia + botão flutuante WhatsApp
- `3e76a01f` — fix: logo do formulário esticada + reverte webp de uploads (risco de qualidade)
- `1f62b00f` — fix: conteúdo inteiro invisível pra visitantes reais (bug crítico da opacity)

---

## Sessão 16/07/2026 — copy de conversão aplicada, bug do modal corrigido, iPhone ainda pendente

Continuação direta da sessão de 15/07. Handoff atualizado em `handoff.md` — ler esse primeiro.

### 0. Tangente — investigação de "nenhum lead real desde ontem" (fora do escopo, não mexido)

Robert reportou no meio da sessão que nenhum lead real parecia estar entrando desde a noite de 14/07, mas pediu explicitamente pra não mexer na integração de leads/GS Engage porque outra sessão estava trabalhando nisso em paralelo ("pega leve aí"). Investigação leve, só leitura, antes dele pedir pra parar:
- Meta Ads confirmou tráfego/gasto normal nas campanhas ativas (LP+, LP+ DF, LP VD, LP IMG) — nada de campanha pausada por engano.
- Exportei a planilha real de leads via CSV público (`docs.google.com/.../export?format=csv`) e cruzei com gaps históricos: o buraco de ~17h sem lead real (14/07 21:31 → teste do Robert em 15/07) é MENOR que 4 outros gaps dos últimos 45 dias (29h, 25h, 24.7h, 24.4h) sem que nenhum deles tenha sido um bug real. Não é anomalia.
- Testei o webhook (`planilha-leads-script.gs`) direto via curl com a técnica correta (POST→302→GET no echo do Google, sem preservar o método) — confirmado funcionando (grava na planilha E chega no GS Engage, validado via API do GS Engage direto, técnica da última página).
- **Gotcha real reencontrado**: `curl -L` sem `--postXXX` às vezes ainda dá 405 "Não foi possível abrir o arquivo" nessa configuração específica — não confiar cegamente nisso, sempre conferir o header `Location` do 302 e seguir manualmente como GET se o `-L` automático falhar.
- Conclusão repassada ao Robert: mecanismo tá são, o "buraco" parece variância normal — se persistir por muito mais tempo com anúncio continuando a gastar, aí sim escalar.

### 1. Erro de processo — pkill/porta batendo na sessão paralela

Durante teste de screenshot, `pkill -f "chrome-profile-"` (com hífen no final) foi usado, e por sorte NÃO bateu num processo Chrome de outra sessão ativa (`.../audit/chrome-profile`, sem hífen) rodando em paralelo (porta CDP 9333) — mas quase. Puro acaso de padrão de string. **Lição**: com sessões concorrentes confirmadas, `pkill -f` por substring é arriscado mesmo tentando ser específico; melhor matar por PID exato sempre que houver qualquer chance de sessão paralela ativa.

Também aconteceu: subi `python3 -m http.server` numa porta que JÁ estava ocupada por um servidor da outra sessão (dashboard "Painel Geral") — o `http.server` falhou em background (`Address already in use`), mas o `curl` de verificação bateu no servidor ERRADO e voltou 200, mascarando o erro. Só percebi porque um screenshot mostrou o dashboard errado em vez do `/lifeb/`. **Lição**: sempre `lsof -i :PORTA` antes de confiar que um servidor subiu, principalmente com outra sessão ativa em paralelo.

### 2. Copy de conversão — aplicada, com correção de rumo no meio

Apliquei os 6 itens do levantamento de 15/07 (ver seção anterior). No item 4 (headline FOMO), copiei a frase EXATA do `/rmk` ("Enquanto você avalia, outra loja da sua região pode estar implantando primeiro"). Robert pediu pra reverter: `/rmk` não é mais usado (campanhas pausadas, custo ficou alto — confirmado também via Meta Ads: campanhas `[RMK]`/`[OFF EDIT] [RMK]` todas `PAUSED`). Ele queria o `/lifeb/` parecido com as páginas **realmente ativas**.

Fui direto no `Home.tsx` (`~/Desktop/lifebimport-jlbv/client/src/pages/Home.tsx`) conferir o hero DEFAULT (fora do bloco `if (variant === "rmk")`, usado por `/`, `/video1/`, `/video2/`, linha ~1292): headline real é "Transforme Acessórios em Lucro para Sua Loja!", subtítulo "Com o Projeto Exclusivo JLBV, você aumenta o ticket médio, encanta o público feminino, estimula compras por impulso e se diferencia dos seus concorrentes.", prova social "+2.000 lojas já implantaram o projeto" (não "vagas limitadas", que só existe no CTA final específico do `/rmk`). Apliquei isso no lugar — e de quebra resolveu o item 2 (erro de gramática) de vez, porque o subtítulo quebrado do `/lifeb/` era claramente uma corrupção desse texto certo (dá pra ver a palavra "impulso" e "concorrentes" sobrevivendo no meio da bagunça).

**Erro meu que o Robert pegou**: antes de checar o `Home.tsx`, eu tinha assumido (só pela doc/handoff) que era certo usar o framing do rmk. Não conferi contra o código real antes de aplicar. Aconteceu de novo mais tarde no mesmo dia (ver item 4).

### 3. Achados extras de QA, corrigidos sem estarem na lista aprovada original

- Subtítulo da seção "Veja o projeto JLBV funcionando na prática" tinha texto corrompido: *"...atribui soluções, empíra asfaltam rendas de vendas, maxima a rentabilidade..."* — reescrito pra "...aplica soluções comprovadas que impulsionam as vendas, maximiza a rentabilidade...". Mesma classe de corrupção do subtítulo do hero (achado 2).
- `.pillars-grid` (seção "Conheça Projeto JLBV", 6 itens) usava `grid-template-columns: repeat(auto-fit, minmax(200px,1fr))` — com o container de 1100px isso força 5 colunas de ~200px, títulos quebrando letra por letra ("Exposiçã/o"). Trocado o floor pra `260px` → 4 colunas confortáveis. Confirmado visualmente antes/depois via screenshot.
- CTA do header estourava em telas estreitas (~390px) depois que o texto padronizado ficou mais comprido ("Quero esse resultado na minha loja" vs "Fale com um consultor" antigo). Fix: escondido o texto abaixo de 420px, só ícone do WhatsApp fica visível — mesmo padrão já usado nas LPs React (`<span className="hidden sm:inline">`).

### 4. Hero: carrossel de imagem → vídeo autoplay mudo

Reaproveitado o MESMO vídeo Vimeo (`1178399214`, "Projeto JLBV — Supermercado") já usado no hero do `/video1/`, com os mesmos parâmetros de embed (`autoplay=1&muted=1&loop=1`). Container novo (`.hero-video`, `aspect-ratio:9/16`) com o mesmo estilo glass (`border`+`backdrop-filter`+`box-shadow`) do `.banner` antigo, pra manter identidade visual. JS do carrossel antigo (`reorganizaq`/`paginaProxima`/etc., compartilhado com outras 3 seções da página) foi deixado intacto — todas as funções fazem no-op seguro em jQuery quando o elemento `.banners` não existe mais no DOM (confirmado lendo o código, `$('.banners')` vazio não lança exceção em nenhum ponto).

**Limitação de teste**: Vimeo bloqueia o embed em teste local/headless (erro "couldn't verify security of your connection", provavelmente restrição de domínio + detecção de bot). Não deu pra confirmar reprodução real localmente — só validado que o HTML/CSS do embed é idêntico ao que já roda ao vivo no `/video1/`. Se o vídeo não tocar em produção, é a primeira coisa a checar (config de domínio permitido no player Vimeo).

### 5. 🔴 Bug real corrigido — modal pulava direto pro WhatsApp (achado do Robert)

Robert: "o formulário só funciona quando abro em guia anônima". Causa encontrada lendo o próprio JS (linhas ~978-993 do `index.html`): o handler de clique dos `.js-lead-cta` checava `localStorage.getItem('jlbv_lead')` e, se já existisse nome+telefone salvos de visita anterior, **pulava `preventDefault()`/`openModal()` inteiramente** e deixava o `<a href="wa.me/...">` nativo navegar direto — só disparava o evento `Contato_WhatsApp` antes. Isso tinha sido escrito (provavelmente) na reescrita do modal em 15/07, mas **não corresponde ao componente React canônico**: no `Home.tsx`/`LeadModal`, o `localStorage` só é lido dentro do `openModal()` pra PRÉ-PREENCHER os campos — o modal SEMPRE abre. O único "pula direto pro zap" que existe lá é `directMode`, uma prop estática por variant de página (ex.: uma página configurada como "sem formulário"), não uma checagem de visitante retornante.

Como o próprio Robert testou o formulário várias vezes nos últimos dias (incluindo os 2 testes desta sessão, nomes "teste 14:42"/"teste 15hrs"), o `jlbv_lead` já estava salvo no navegador normal dele — daí toda aba comum pular reto pro Zap, e só a guia anônima (localStorage sempre vazio) mostrar o modal.

**Erro meu**: quando ele reportou o sintoma, eu expliquei o mecanismo real (achei certo) mas errei ao dizer "é assim em todas as LPs, comportamento esperado, compartilhado" — não tinha conferido o `Home.tsx` antes de afirmar isso. Ele questionou ("nenhuma pula o formulário, ta louco?"), fui conferir e ele tinha razão. **Fix**: removida a ramificação de early-return; agora sempre `preventDefault()`+`openModal()`, que já pré-preenche sozinho via `getLocalLead()`. Testado sintaxe (`vm.Script`), deployado, confirmado ao vivo (grep no HTML de produção confirma a ramificação sumiu).

**Padrão que se repetiu 2x na mesma sessão**: tanto no headline do rmk quanto nesse bug do modal, eu respondi baseado em doc/memória/suposição em vez de ler o código-fonte real primeiro. Nas duas vezes o Robert pegou o erro. Lição pra manter: **sempre conferir `Home.tsx` (ou o arquivo fonte relevante) antes de declarar "é assim nas outras páginas"**, nunca confiar só na documentação anterior.

### 6. Bug do iPhone Safari — sem progresso

Nenhum print novo chegou no `~/Desktop` durante a sessão (um PNG apareceu mas era 1x1px vazio, arquivo de 1KB — provavelmente captura falha/cancelada). A pedido do Robert ("vamos sem print mesmo"), a investigação ficou pausada — retomar só com print real ou descrição específica do sintoma (tela branca? layout quebrado? botão não funciona? scroll horizontal?).

### Commits desta sessão (worktree `lifebimport-jlbv-pages`, branch `gh-pages`)
- `0fd866d1` — feat(lifeb): copy de conversão aprovada (headline FOMO do rmk, na 1ª tentativa) + hero em vídeo + fixes de layout
- `acabd59c` — fix(lifeb): modal de lead nunca deve pular pra WhatsApp direto
- `1c4420d2` — fix(lifeb): volta headline/subtítulo/trust-bar pro padrão das páginas ativas (reverte o framing do rmk)
- (fix do `-webkit-backdrop-filter` no `.banner` do hero: aplicado no arquivo local, ainda não commitado/deployado — fica pra próxima rodada junto com os pendentes de copy)

---

## Sessão 15/08/2026 — Novas páginas `/redefarma/` e `/redesuper/` (foco em REDES)

Pedido do Robert: clonar `/video1/` e `/video2/` focando especificamente em REDES de lojas (não lojista único), com um filtro de qualificação visível no anúncio ("só interessa se a rede tiver X+ lojas") e uma mensagem de WhatsApp que o Felipe (SDR) consiga identificar de cara qual segmento/porte o lead representa, sem precisar abrir a planilha.

### Mapeamento
- `/redesuper/` = clone de `/video1/` (hero Vimeo Supermercado `1178399214`) — badge **"Exclusivo para redes com 10+ lojas"**
- `/redefarma/` = clone de `/video2/` (hero YouTube Farmácia `aOR4aUSp-zE`) — badge **"Exclusivo para redes com 20+ lojas"**
- Vídeo da seção "Case de Sucesso" herdado 1:1 do respectivo original (redesuper mostra o YouTube Short `4NsS7DIlM20`, igual video1; redefarma mostra o Vimeo supermercado `1178399214`, igual video2) — testado que não duplica nem falta vídeo em nenhuma das duas.

### Copy alterada (só nas 2 variantes novas, via flag `isRedes` em `Home.tsx`)
- **Badge topo do hero**: troca "Projeto Exclusivo JLBV" por "Exclusivo para redes com {20|10}+ lojas" — e passa a ficar sempre visível (mobile+desktop), diferente do comportamento padrão de video1/video2 que escondia esse badge no mobile.
- **H1**: "Transforme sua rede em uma máquina de gerar Lucro e Encantamento!" — reaproveita o texto já usado em `/apresentacao-super/` e `/apresentacao-farma/` (trocando "loja"→"rede"). Confirmado no `script de vendas Life b.pdf` (Dropbox `LVL IMPORTADORA/LIFE B/`) que essa frase é literalmente o título oficial do discurso comercial da empresa.
- **Subtítulo hero**: "Com o Projeto Exclusivo JLBV, sua rede padroniza a exposição em todas as lojas, aumenta o ticket médio, encanta o público feminino e ganha um mix que já provou resultado em escala."
- **Bullet extra** (6º item, some para as demais variantes): "Garantia de troca dos produtos sem giro após 150 dias da implantação" — achado no `script de vendas Life b.pdf`, argumento de baixo risco que ainda não estava em nenhuma landing page do projeto.
- **Subtítulo da seção "Método Exclusivo"**: "...aumentar o faturamento e o lucro da **sua rede**, padronizar a exposição em todas as lojas e encantar..."
- **CTAs**: todos os botões que diziam "...minha loja" viram "...minha rede" (Cases, Resultados, Galeria); CTA final do H2 vira "Quer transformar sua rede em uma máquina de gerar Lucro e Encantamento?"
- Cases (Droga Center / Super Couto / Drogarias Distrital) **não precisaram mudar** — já falam de "Rede de Drogarias..." / "Rede de Supermercado..." no texto original, coerente por acaso com o novo público.

### Mensagem de WhatsApp diferenciada (pedido explícito — Felipe precisa identificar de cara)
Antes, `WHATSAPP_LINK` era uma constante única e genérica ("Olá! Vi o Projeto JLBV da Life B e quero saber mais.") usada em TODAS as variantes. Agora:
- `WHATSAPP_LINK_REDEFARMA`: *"Olá! Sou de uma rede de farmácias/drogarias (20+ lojas) e vi o Projeto JLBV. Quero saber mais."*
- `WHATSAPP_LINK_REDESUPER`: *"Olá! Sou de uma rede de supermercados (10+ lojas) e vi o Projeto JLBV. Quero saber mais."*

Implementação: `LeadModal` passou a receber `whatsappLink` como prop (calculada em `Home` a partir da `variant`) em vez de importar a constante fixa direto — `/`, `/video1/`, `/video2/`, `/rmk/` continuam usando a mensagem genérica de sempre, comportamento 100% preservado.

### O que ficou de fora (decisão consciente, não aplicado sem confirmar)
- **FAQ**, o card "Alta Rentabilidade da **loja**" (seção 6 cards "Conheça o Projeto JLBV") e os `stats` (Projetos Implantados etc.) são arrays **compartilhados** com `/`, `/video1/`, `/video2/` e as apresentações — mudar isso afetaria todas as páginas do projeto, não só as de redes. Não alterado.
- Bullet "Crescimento mínimo garantido na categoria: 300%" mantido igual às demais landings — é risco de compliance do Meta (promessa de resultado garantido) já existente desde antes, não introduzido nesta sessão.
- Sem OG customizado (title/description/og:image por segmento) — seguiu o padrão simples de video1/video2/rmk (cópia direta do `index.html` base), diferente do que existe pras páginas `/apresentacao-*/`.

### Pesquisa de apoio (Dropbox `LVL IMPORTADORA/LIFE B/`)
- `script de vendas Life b.pdf` — confirma H1 oficial + garantia de 150 dias + dado "mulheres decidem 96% das compras do lar" (Nielsen/Amis, Katar) — não usado ainda, pode virar bullet numa próxima rodada.
- `lifeb-apresentacao-drogarias.pdf` / `lifeb-apresentacao-supermercados.pdf` — decks genéricos, sem diferenciação real por segmento, sem dado novo de redes.
- Não existe documentação prévia do threshold 20+/10+ lojas nem cases de redes maiores que as 3 já usadas no site — o corte foi definido nesta sessão pelo Robert.

### Arquivos alterados
- `client/src/pages/Home.tsx` — variantes `redefarma`/`redesuper`, flag `isRedes`, `redesMinLojas`, `whatsappLink` prop no `LeadModal`
- `client/src/App.tsx` — rotas `/redefarma` e `/redesuper`
- `vite.config.ts` — geração das pastas estáticas `dist/public/redefarma/` e `dist/public/redesuper/` (padrão simples, igual video1/video2)

### Validação antes do deploy
- `pnpm exec tsc --noEmit` — limpo
- `pnpm exec vite build` — limpo, gerou `redefarma/index.html` e `redesuper/index.html`
- Screenshots via Chrome headless (mobile 430px + desktop 1440px) das duas páginas novas, comparadas lado a lado com `/video1/`/`/video2/` — confirmado zero regressão nas páginas originais e zero duplicação de vídeo nas novas

### Deploy (1ª rodada)
Publicado via `bash deploy.sh` em 2026-08-15 01:04. Commit `e9da5fd0` no branch `gh-pages` do repo `lifeb-web/lifebimport`. Confirmado `HTTP 200` em produção para `projetojlbv.com.br/redefarma/` e `projetojlbv.com.br/redesuper/` após propagação do GitHub Pages.

Nota: esse mesmo deploy também subiu para o `gh-pages` alguns arquivos `.webp` de `lifeb/uploads/` (banners/napratica/videos) que já estavam presentes no worktree local mas ainda não tinham sido commitados — resíduo de uma sessão anterior de otimização de mídia da `/lifeb/`, não é algo introduzido por esta sessão.

### Correções da 2ª rodada (mesma sessão, 2026-08-15)
Depois do primeiro deploy, o Robert pediu mais 4 ajustes — todos aplicados, testados (mobile 390px real via Chrome headless, comparado lado a lado com `/apresentacao-super/`/`/apresentacao-farma/`/`/video1/`/`/video2/`) e publicados no commit `ebb7c95a`:

1. **Vídeos de `/redesuper/` viraram idênticos aos de `/apresentacao-super/`** (antes clonava `/video1/`): hero passou a usar Vimeo `1207541000` (com `&title=0&byline=0&portrait=0`, sem overlay) em vez de `1178399214`; seção "Case de Sucesso" passou a mostrar o Vimeo `1178399214` em vez do YouTube Short `4NsS7DIlM20`. `/video1/` não foi tocado — continua com seus vídeos originais.
2. **Vídeo próprio no "Case de Sucesso" de `/redefarma/`**: novo bloco dedicado (`variant === "redefarma"`) mostrando `https://www.youtube.com/embed/qs_-yVCcfWg` (era `https://youtube.com/shorts/qs_-yVCcfWg`). Antes `/redefarma/` caía no catchall que mostrava o Vimeo de supermercado (igual `/video2/`) — agora tem vídeo próprio de farmácia. Bloco catchall de supermercado foi ajustado pra excluir `redefarma` (evita duplicar vídeo).
3. **Carrossel "Na Prática"**: `/redefarma/` passou a usar `farmaApresentacaoImages` (as 18 fotos de `/apresentacao-farma/`) em vez de `farmImages`/`allCarouselImages` genérico; `/redesuper/` passou a usar `superApresentacaoImages` (as 19 fotos de `/apresentacao-super/`). `/`, `/video1/`, `/video2/` continuam com `allCarouselImages` — intactos.
4. **Reforço visual do filtro de qualificação** (pedido do Robert, para afunilar melhor o público nos anúncios): badge do topo do hero passou de pill translúcido pra fundo verde sólido (`#22C35D`) com ícone 🏢 quando `isRedes` — mais contraste contra o gradiente roxo/magenta. Adicionado também um 1º bullet reforçando a mesma condição: "Feito para redes com {20|10}+ lojas", antes dos demais bullets. Sugestão dada ao Robert (ainda não aplicada, fora do escopo do código): replicar a condição "redes com X+ lojas" no próprio texto/criativo do anúncio no Meta Ads — filtra antes do clique, economiza CPC com clique desqualificado, o que o badge na LP sozinho não resolve.

### Pendência identificada e corrigida nesta sessão: dashboards não reconheciam as rotas novas
Auditoria (a pedido do Robert: "espero que tenha colocado todo o trackeamento... revisado tudo") encontrou que `PAGINAS_LEGENDAS` em `dashboard-ga4.html` e `dashboard-telao.html` (Dropbox + worktree `lifebimport-jlbv-pages`) não tinha entradas para `/redefarma/` nem `/redesuper/` — apareceriam como path bruto na tabela "Por Página" em vez de rótulo legível. Corrigido nos dois arquivos:
```js
'/redefarma/':     'Página Redes - Farmácia (20+ lojas)',
'/redesuper/':     'Página Redes - Supermercado (10+ lojas)',
```
Validado com `node --check` (sintaxe ok) antes de publicar. Publicado automaticamente junto com o deploy das landing pages (o `deploy.sh` faz `git add -A` no worktree, então pegou os dashboards que já estavam copiados lá). Confirmado em produção via `curl` no HTML publicado dos dois dashboards.

**Confirmado que o resto do tracking (Meta Pixel `1659173615439958`, GA4 `G-DX8FW7ZTJ3`, eventos PageView/Abrir_Formulario/Lead_Formulario/Abandonou_Formulario/ScrollDepth, UTMs, webhook da planilha) funciona automaticamente em `/redefarma/` e `/redesuper/` sem nenhuma alteração de código** — são carregados no `client/index.html` base (compartilhado por todas as rotas do SPA) e os handlers em `Home.tsx`/`LeadModal` não dependem de `variant` para disparar. `pagina` grava `window.location.href`, então a planilha e os dashboards já diferenciam a origem automaticamente pela URL.

### Deploy final (2ª rodada)
Commit `ebb7c95a` no branch `gh-pages`, publicado em 2026-08-15 01:41. Validado em produção via `curl` no bundle JS publicado: as 3 mensagens de WhatsApp (genérica + redefarma + redesuper) presentes corretamente, vídeo `qs_-yVCcfWg` presente, `fotos-apresentacao-farma` presente, vídeo `1207541000` presente, textos "Exclusivo para redes com" e "Feito para redes" presentes.

### Fix 15/08/2026 (manhã) — badge verde confundia com botão de CTA
Robert reportou que o selo "Exclusivo para redes com X+ lojas" (fundo verde `#22C35D` sólido) ficava parecendo clicável, porque é **exatamente a mesma cor** dos botões de WhatsApp CTA do site. Trocado para **fundo branco sólido + texto roxo `#704B9B` bold** (mesma cor de marca, mas visualmente inconfundível com um botão de ação) — mantido o ícone 🏢 e o formato pill. Testado mobile 390px antes de publicar. Deploy: commit `ac21d5fd`, `gh-pages`, 2026-08-15 11:24. Confirmado em produção via `curl` no bundle publicado.

## Sessão 25-26/08/2026 — Logo quebrada (bug crítico), reorganização de vídeos/fotos por página, otimização de performance

Sessão longa, começou com um pedido urgente (Robert ia apresentar as páginas) e evoluiu pra uma rodada grande de ajustes de conteúdo pedidos aos poucos, ao vivo, conforme ele revisava cada página. Fechou com auditoria de performance antes de dormir.

### 🔴 Bug crítico corrigido — logo quebrada em TODAS as páginas
Causa raiz: `LOGO_URL` em `Home.tsx` apontava pra uma URL externa de CloudFront/S3 (`d2xsxph8kpxj0f.cloudfront.net/.../LifeB_78863297.png`) que passou a devolver **403** (link de terceiro expirado, não era arquivo do próprio projeto). Como é uma constante única usada em 6 lugares diferentes do componente (header, footer, modal etc.), quebrou a logo em TODAS as variantes de uma vez só — inclusive nas 2 páginas de apresentação.

Fix: baixada a logo oficial do Dropbox (`LOGOS LVL/lifeb_logos_transparentes/lifeb_logo_principal_transparente.png`), salva como `client/public/logo-lifeb.png`, `LOGO_URL` trocado pra path local `/logo-lifeb.png`. `og:image` (preview de compartilhamento) tinha o mesmo problema em 9 HTMLs estáticos publicados — corrigido também no `client/index.html` fonte (pra não voltar no próximo build) e direto nos HTMLs já publicados.

Publicado inicialmente via **patch direto no bundle JS já publicado** (achar a string da URL quebrada e substituir, sem rodar build) pra resolver em minutos antes da apresentação — só depois, com calma, foi feito um build limpo de verdade que consolidou tudo.

### 🔧 Descoberta técnica importante — iCloud Drive no Desktop trava operações git
Toda a sessão começou MUITO lenta: `git status`/`git commit` no repo fonte (`~/Desktop/lifebimport-jlbv`) travavam minutos ou ficavam pendurados indefinidamente (0% CPU, sem progresso). Causa raiz encontrada via `brctl status`: **a pasta Desktop está sincronizada com iCloud Drive**, e o `.git/objects/` tem milhares de arquivos pequenos — o iCloud tenta sincronizar/materializar cada um sob demanda, e qualquer operação git que percorre o objeto do repo (status, commit, `vite build` lendo `node_modules`) fica refém desse processo, que pode levar minutos por operação. Isso é DIFERENTE do problema de RAM/swap já documentado antes (`feedback_build_lento_patch_bundle` — memória do Claude Code) — aqui é especificamente contenção de I/O do provedor de arquivos do iCloud, não memória.

**Solução que funcionou**: qualquer trabalho de build/commit pesado deve rodar **fora da pasta Desktop** (que é iCloud), num diretório local puro (ex: `/tmp` ou scratchpad da sessão). Fluxo usado no resto da sessão:
1. `rsync` do código-fonte (`client/`, config, SEM `node_modules`/`.git`/`dist`) pro diretório local
2. `pnpm install` + `pnpm exec vite build` ali (fora do iCloud → build em <1s a poucos segundos, sem travar)
3. `rsync` do `dist/public/` gerado de volta pro worktree publicado (`lifebimport-jlbv-pages`, também no Desktop, mas só recebendo poucos arquivos por vez — operação leve)
4. `git add/commit/push` no worktree publicado — ainda passa pelo iCloud, mas como só mexe em poucos arquivos (não o repo inteiro), funciona rodando em background com paciência (pode levar de alguns segundos a ~1-2min, não trava de vez)

Locks órfãos (`index.lock`) de sessões anteriores travadas também apareceram e precisaram ser removidos manualmente antes de qualquer operação git funcionar de novo — sinal de que travamentos assim já aconteceram antes nesse Mac.

### Vídeos — mudanças por página (resumo final, estado atual)

| Página | Topo (hero) | Case(s) de Sucesso |
|---|---|---|
| `/` (principal) | Vídeo/foto original, intocado | **Cases** (2): Supermercado = vídeo do topo da apresentacao-super (`1207541000`); Farmácia = Farmagyn (`a1XS8c7_VcA`) |
| `/video1/` | Vimeo `1207541000` (padrão apresentacao-super, já trocado em rodada anterior) | **Case** (1, singular): agora o MESMO vídeo Vimeo `1178399214` que a apresentacao-super usa no dela (antes era um YouTube Short `4NsS7DIlM20` diferente) |
| `/video2/` | Farmagyn `a1XS8c7_VcA` (subiu do Case pro topo) | **Cases** (3): "Ultra Popular" (`aOR4aUSp-zE`, era rotulado genérico "Farmácia", renomeado); Drogastore (`qs_-yVCcfWg`); Mais Econômica (`lx1Jm1WO6M4`, trazido de dentro de apresentacao-farma) |
| `/apresentacao-farma/` | Farmagyn `a1XS8c7_VcA` (trocado, era o genérico `aOR4aUSp-zE`) | **Cases** (2): Drogaria/Mais Econômica original (`lx1Jm1WO6M4`, label intocado) + Farmácia genérica (`aOR4aUSp-zE`, que estava no topo antes) |
| `/apresentacao-super/`, `/redefarma/`, `/redesuper/` | Intocados | Intocados (continuam 1 vídeo cada) |

Título da seção virou **"Cases de Sucesso"** (plural) automaticamente em qualquer página com 2+ vídeos ali (`video2`, `apresentacao-farma`, principal); continua **"Case de Sucesso"** (singular) nas páginas com só 1 vídeo (`video1`, `apresentacao-super`, `redesuper`, `redefarma`).

Layout do container de vídeos do Case (`flex flex-row`) ganhou `flex-wrap` pra páginas com 3 vídeos (video2) não espremerem tudo numa linha só no mobile — quebra pra 2+1 em telas estreitas.

### Fotos — carrosséis "Na Prática" reorganizados
- `/` (principal): antes usava fotos genéricas antigas (`farmImages`/`superImages`, arrays só com 13+7 fotos, desatualizadas). Agora usa as fotos das páginas de apresentação (`farmaApresentacaoImages` + `superApresentacaoImages`, 18+19 fotos, mais recentes) — motivo dado pelo Robert: as fotos atualizadas de verdade estão nas páginas de apresentação, a principal estava desatualizada.
- `/video1/`: carrossel restrito só às fotos de `apresentacao-super` (antes usava o mix genérico) — página é de supermercado, não faz sentido mostrar foto de farmácia.
- `/video2/`: carrossel restrito só às fotos de `apresentacao-farma` (mesmo raciocínio, página é de farmácia).
- Foto do topo (hero) da principal, card "Supermercado": substituída por uma foto nova entregue pelo Robert em `~/Downloads/fotos/apres-super-10.jpg`, salva como `client/public/fotos-super/super-novo-hero.jpg`. Card "Farmácia" do topo da principal foi mantido intocado (Robert confirmou que já estava boa).
- Os arrays antigos `farmImages`/`superImages` **não foram apagados** — ainda alimentam essas 2 fotos do topo da principal (índice `[0]` de cada array), só pararam de alimentar o carrossel de baixo.

### Performance — otimização pedida antes de dormir (mobile-first, sem quebrar nada)
1. **Lazy loading em todos os vídeos**: `<iframe>` do `VideoEmbed` (componente compartilhado por todas as páginas) não tinha nenhum atributo de carregamento tardio — TODO vídeo da página carregava de cara ao renderizar, mesmo os que ficam mais embaixo (Case de Sucesso). Adicionado `loading="lazy"` no iframe — nativo do navegador, zero mudança de comportamento visual/funcional, só adia o carregamento de rede até o vídeo estar perto da tela. Maior ganho nas páginas com mais vídeos na tela (video2 agora tem 4 iframes na página: 1 hero + 3 case).
2. **Preconnect pro YouTube**: o `client/index.html` já tinha `preconnect`/`dns-prefetch` pro Vimeo, mas nenhum pro YouTube — apesar do YouTube ter virado o serviço mais usado hoje (Farmagyn, Drogastore, Ultra Popular, Mais Econômica são todos YouTube). Adicionado `preconnect` pra `www.youtube.com` e `i.ytimg.com` + `dns-prefetch` pra `www.youtube-nocookie.com`, logo depois do bloco do Vimeo no `<head>`.
3. Imagens já estavam OK: carrossel já usava `loading="lazy"`, fotos do hero já usavam `loading="eager"` corretamente (acima da dobra) — não precisou mexer.

### Validação feita antes de cada publicação
Todo build passou por `node --check` no bundle JS gerado (sintaxe válida) antes do deploy. Depois de cada push, conferido via `raw.githubusercontent.com` (sem cache de CDN) que: todas as páginas retornam 200, todas apontam pro mesmo bundle mais recente (nenhuma página ficou desatualizada em relação às outras), e as strings-chave de cada vídeo/texto novo estavam presentes no bundle publicado.

### Commits desta sessão (worktree `lifebimport-jlbv-pages`, branch `gh-pages`, repo `lifeb-web/lifebimport`)
Em ordem cronológica:
1. `b5f79c2d` — fix: logo quebrada (patch direto no bundle, resolvido em minutos)
2. `bd134f3c` — fix: og:image nos 9 HTMLs estáticos
3. `2c215676` — fix: hero video1 + Case de Sucesso video2=Farmagyn (patch direto no bundle)
4. `9e95dc66` — primeiro build limpo de verdade (consolida tudo acima via `vite build` real, fora do iCloud)
5. `23ea3acc` — adiciona vídeo Drogastore no Case de Sucesso do video2
6. `f25430aa` — bullet de garantia 150 dias em video1/video2/principal
7. `07aa4ff4` — apresentacao-farma hero=Farmagyn + Case com 2 vídeos; video2 Case ganha Mais Econômica; layout mobile-first
8. `13845ee1` — principal: Case de Sucesso usa vídeo da apresentacao-super (Supermercado) + Farmagyn (Farmácia)
9. `05308daf` — principal: carrossel usa fotos das páginas de apresentação; foto do hero Supermercado atualizada
10. `463ac15a` — título "Cases" plural; label "Ultra Popular"; carrossel do video2 restrito a farmácia
11. `88e6086b` — carrossel do video1 restrito a supermercado
12. `9e0b3f4f` — Case de Sucesso do video1 = mesmo vídeo da apresentacao-super; lazy-load + preconnect YouTube

Repo fonte (`~/Desktop/lifebimport-jlbv`, branch `main`) ficou **atrasado** em relação ao que está publicado — as edições foram feitas nos arquivos locais (`Home.tsx`, `index.html`) mas o `git commit`/`push` desse repo especificamente travou repetidamente por causa do problema de iCloud descrito acima e não foi retentado até o fim da sessão (não bloqueia nada, é só histórico de commit; os arquivos em si estão corretos no disco, idênticos ao que foi buildado e publicado). **Pendência pra próxima sessão**: rodar `git add -A && git commit && git push origin main` nesse repo (de preferência via o mesmo truque do rsync-pro-scratchpad se travar de novo).

---

## 2026-09-11 — Troca de vídeos: apresentacao-farma e apresentacao-super + causa raiz do travamento reconfirmada

Pedido do Robert: trocar vídeos de posição nas duas páginas de apresentação (material que o rep usa com cliente morno, sem CTA), mantendo as capas existentes.

### apresentacao-farma
- **Hero (topo)**: era o vídeo genérico "Farmácia" (`a1XS8c7_VcA`), sem capa → agora é **Ultra Popular** (`aOR4aUSp-zE`), com a capa `/thumb-ultra-popular.jpg` que ela já usava nos Cases.
- **Cases**: "Ultra Popular" saiu de lá e subiu pro topo; entrou **FarmaGyn** (`a1XS8c7_VcA`, sem capa, mesmo tratamento que "Drogastore" já tinha). "Drogastore" (`qs_-yVCcfWg`) continua intocado.

### apresentacao-super
- **Hero (topo)**: era Vimeo `1207541000` ("Supermercado" genérico) → agora é vídeo novo do YouTube `v9zuWJEnCss` (link enviado pelo Robert, convertido de `/shorts/` pra `/embed/`).
- **Cases**: antes só tinha 1 vídeo ("Supermercado", Vimeo `1178399214`); agora tem **2**: o vídeo que saiu do topo ganhou legenda **"Super Sul"**, e o que já estava lá (o mesmo Vimeo `1178399214`) ganhou legenda **"Rede Economia"** (antes "Supermercado" genérico).
- Título da seção mudou de "Case de Sucesso" (singular) pra "**Cases** de Sucesso" (plural), já que agora tem 2 vídeos — mesma regra que `apresentacao-farma`/`video2`/principal já seguiam.

### Cuidado técnico: páginas compartilhavam o mesmo bloco de código compilado
- `apresentacao-farma` compartilhava literalmente o mesmo bloco de Hero no JS minificado com `/video2/`, porque o conteúdo era idêntico texto-a-texto antes da mudança — o bundler tinha fundido as duas condições num só `t===\`video2\`||t===\`apresentacao-farma\`?`. Resolvido separando a condição no código-fonte (`Home.tsx`), cada variante agora tem seu próprio bloco. `/video2/` conferida intocada (ainda mostra o vídeo genérico "Farmácia" que sempre mostrou, nada mudou).
- Mesma situação entre `apresentacao-super` e `/redesuper/` (página de rede). Separado do mesmo jeito; `/redesuper/` conferida intocada (1 vídeo só, Vimeo `1207541000`, "Supermercado").
- `/video1/`, `/redefarma/`, `/rmk/` e a página principal (`/`) não foram tocadas — conferido que só o hash do bundle mudou (normal em todo build), nenhuma string de vídeo/legenda mudou.

### 🔧 Causa raiz do travamento (reconfirmada — mesma de 26/08, 3 semanas atrás) — iCloud Drive no Desktop
Sessão de hoje começou com `git status` / `vite build` / até `ls` travando minutos a fio (0% CPU, zero progresso) dentro de `~/Desktop/lifebimport-jlbv`. Mesma causa já documentada aqui em 26/08: a pasta Desktop está sincronizada com iCloud Drive, e qualquer operação que toque muitos arquivos pequenos (`.git/objects`, `node_modules`) fica refém do daemon do iCloud (`bird`/`cloudd`).

**Reforço descoberto hoje**: reiniciar o daemon (`killall bird cloudd`) ajuda, mas **não é garantido** — travou de novo mais de uma vez mesmo recém-reiniciado, inclusive pra operações simples. A solução que funcionou de forma CONSISTENTE: copiar o código-fonte (sem `.git`, sem `node_modules`, sem `dist`) pra uma pasta fora do iCloud (ex: `/private/tmp/.../scratchpad`), rodar `pnpm install` + `pnpm exec vite build` ali — local, puro, build em 3-40s, nunca travou — e só trazer o resultado (`dist/public/`) de volta pro worktree publicado via `rsync`. `git add/commit/push` no worktree PUBLICADO (`lifebimport-jlbv-pages`) funcionou bem hoje depois disso.

**O repo FONTE (`lifebimport-jlbv`, branch `main`) continua travando até pra um `git commit` simples** — mesma pendência já registrada em 26/08, ainda não resolvida. Ver status exato no final desta entrada.

**Recomendação pra resolver de vez (não feita hoje, precisa decisão do Robert)**: tirar `~/Desktop/lifebimport-jlbv` do alcance do iCloud Drive — mover a pasta pra fora do Desktop, ou desativar a sincronização de "Desktop e Documentos" nas Preferências do Sistema/iCloud. Enquanto continuar sincronizado, esse travamento deve voltar em toda sessão que fizer build ou muitos commits de uma vez.

### ⚠️ Discrepância encontrada na documentação de 26/08 (registrada aqui pra não repetir confusão)
A tabela "estado final" de 26/08, registrada nesse mesmo arquivo, dizia que `apresentacao-farma` devia estar com Hero=FarmaGyn e Cases="Mais Econômica"+"Farmácia genérica". O estado REAL do código no início da sessão de hoje (antes de eu tocar em qualquer coisa) era: Hero=vídeo genérico("Farmácia", `a1XS8c7_VcA`) e Cases="Ultra Popular"(`aOR4aUSp-zE`)+"Drogastore"(`qs_-yVCcfWg`) — bem diferente do que a tabela de 26/08 registrava. Ou seja, algo mudou nessa página entre 26/08 e hoje sem atualizar este documento (ou aquele commit específico nunca foi consolidado de fato). **Lição pra próxima sessão**: não confiar cegamente nessa tabela pra uma página específica sem conferir o `Home.tsx` atual primeiro.

### Commits (worktree `lifebimport-jlbv-pages`, branch `gh-pages`, repo `lifeb-web/lifebimport`)
1. `602c842c` — fix: troca vídeo hero/case na apresentacao-farma (patch direto no bundle JS já publicado, pra resolver rápido enquanto o build travava)
2. `feb77972` — deploy: apresentacao-super (hero novo + 2 vídeos em cases) e apresentacao-farma — build limpo de verdade (consolida o patch acima), feito fora do iCloud

### Verificação feita antes de publicar
- Sintaxe do `Home.tsx` validada via `esbuild` antes do build.
- Bundle comparado campo a campo: confirmado que `video1`, `video2`, `redefarma`, `redesuper` e os fallbacks da principal/`rmk` não mudaram nenhuma string de vídeo/legenda — só o hash do arquivo.
- As 7 páginas testadas ao vivo (`curl`): todas HTTP 200, todas servindo o bundle novo.
- Renderização real (Chrome headless, JS executado) confirmada nas 2 páginas que mudaram: vídeos certos aparecem no DOM renderizado, sem erro de JS no console.

### Pendência real em aberto
- Repo fonte `~/Desktop/lifebimport-jlbv` (branch `main`) **não está commitado** com as mudanças de hoje — `Home.tsx` no disco já está correto (idêntico ao que foi buildado e publicado), só o histórico de commit local que ficou atrasado, por causa do travamento do iCloud descrito acima. Não bloqueia o site (que já está no ar correto), é só bookkeeping local pendente. Tentar de novo na próxima sessão, de preferência já direto com o truque do rsync-pro-scratchpad se travar.

### Complemento 2026-09-11 (mesma sessão, achado depois de publicar) — vídeo "Rede Economia" mostrando título/autor do Vimeo

Robert reportou que na `apresentacao-super`, Cases, o vídeo "Rede Economia" (Vimeo `1178399214`) estava com o overlay de título/autor do Vimeo aparecendo — o "Super Sul" (mesmo Vimeo `1207541000` do hero antigo) já tinha esse overlay removido (`&title=0&byline=0&portrait=0`, herdado de quando era vídeo do hero), mas "Rede Economia" nunca tinha recebido esse tratamento porque sempre foi só o vídeo original do Cases (nunca precisou antes).

**Fix**: adicionado `&title=0&byline=0&portrait=0` na URL do Vimeo `1178399214` especificamente no bloco `apresentacao-super` (linha do `Home.tsx` com legenda "Rede Economia") — **não** no bloco equivalente do `/video1/` nem `/redesuper/`, que usam o mesmo vídeo mas não foram tocados (mantém overlay padrão do Vimeo lá, como sempre foi).

Build feito de novo pelo mesmo método (fora do iCloud, `/tmp` scratch), verificado campo a campo que só essa string mudou, publicado e confirmado na origem (`raw.githubusercontent.com`, sem cache de CDN) antes de avisar o Robert.

**Commit**: `67846e59` (worktree `lifebimport-jlbv-pages`, branch `gh-pages`).


### Complemento 2026-09-15 — Copy "Cases de Sucesso" ajustada (não implica que são todos os clientes) + fluxo de deploy virou padrão

Robert: seção "Depoimentos em Vídeo" mostrava só 2-3 vídeos sob o título "Cases de Sucesso"/"Case de Sucesso", dando a entender que era a lista completa de clientes. Ajustado pra deixar claro que é amostra:
- Título plural (`video2`, `apresentacao-farma`, `apresentacao-super`, default `/`): "Cases de Sucesso" → **"Alguns Cases de Sucesso"**.
- Título singular (`video1`, `redesuper`, `redefarma`, `rmk`): "Case de Sucesso" → **"Um dos Cases de Sucesso"**.
- Mudança feita em UM lugar só do `Home.tsx` (a condição já existia, só trocou o texto) — cobre as 8 variantes React automaticamente.
- `/lifeb/` (página HTML solta, fora do React): subtítulo da seção "Resultados Reais" trocado de "Quem implantou o JLBV comprova" pra **"Alguns clientes que já implantaram o Projeto JLBV"**.

Commit `92fcd793`, publicado e conferido na origem (raw.githubusercontent.com, sem cache de CDN) antes de avisar o Robert.

**Por que essa publicação saiu rápida** (Robert notou e pediu "sempre seja assim"): usado o MESMO fluxo já documentado acima (seção "Descoberta técnica — iCloud Drive no Desktop") — build rodado inteiro na pasta scratch fora do iCloud (`/private/tmp/.../scratchpad/jlbv-build`, com `node_modules` já instalado de uma sessão anterior no mesmo dia), só sincronizando o arquivo que mudou (`rsync` de um arquivo só) antes de buildar. Build terminou em <1s. **Esse agora é o fluxo padrão pra qualquer edição nas páginas do projeto JLBV — não é mais só um workaround pra quando o iCloud trava, é a forma de sempre fazer.** Ver [[feedback_build_lento_patch_bundle]] (memória do Claude Code) — atualizada pra registrar isso como procedimento padrão, não só emergência.


---

## 2026-09-22 — Nova LP `/superagos/` exclusiva pro estande na feira SuperAgos 2026

Pedido do Robert em cima da hora (ele estava indo pro estande, precisava da página pronta rápido): a Life B tem estande na SuperAgos 2026 (22-24/09, Centro de Convenções de Goiânia — maior feira de varejo alimentar do Centro-Oeste, promovida pela AGOS, 200+ marcas, R$343mi de negócios projetados). Pedido: clonar `/video1/` (vídeos de supermercado preservados), criar página que "sinta exclusiva pro evento", manter formulário/tracking padrão, só trocar a mensagem do WhatsApp, usar a logo da SuperAgos (entregue em `~/Downloads/SuperAgos Logo/Logo SuperAgos.png`) pra reforçar exclusividade. Mobile-first.

### O que foi feito
- **Nova variante `superagos`** em `Home.tsx`/`App.tsx` — comportamento idêntico a `/video1/` (mesmos vídeos: hero Vimeo `1207541000`, case Vimeo `1178399214` "Supermercado"; mesmo carrossel `superApresentacaoImages`; mesmo formulário/modal de lead; mesmos eventos GA4/Pixel padrão).
- **Faixa do evento** no topo da página (acima do header, fundo escuro `#1a1625`): logo da SuperAgos + "Life B no estande · 22 a 24/09 · Centro de Convenções Goiânia".
- **Badge do hero**: em vez do pill genérico "Projeto Exclusivo JLBV", mostra a logo da SuperAgos + "Exclusivo para visitantes da feira" (pill branco, sempre visível, mobile e desktop — diferente do `/video1/` que esconde o badge no mobile).
- **Headline**: "Transforme Sua Visita na SuperAgos em Lucro para Sua Loja!" (variação do padrão já usado no resto do site).
- **Subtítulo**: menciona estar na maior feira de supermercados do Centro-Oeste.
- **Bullet extra** (1º da lista, mesmo padrão do bullet de redes): "Condição especial para quem visita nosso estande na SuperAgos 2026" — texto genérico proposital, **sem inventar desconto/valor específico** (não foi passada nenhuma condição concreta pelo Robert; se ele quiser oferecer algo específico no estande, ajustar esse texto depois).
- **Bullet "garantia 150 dias"**: incluída também pra essa variante (mesma condição de video1/video2/redes).
- **Chip abaixo do vídeo**: "Ao vivo na SuperAgos 2026" em vez do genérico "Supermercados" (fundo amarelo `#FCE83A`, cor da SuperAgos).
- **WhatsApp**: nova constante `WHATSAPP_LINK_SUPERAGOS` — "Olá! Estou na SuperAgos 2026 e vi o Projeto JLBV no estande da Life B. Quero saber como aumentar o faturamento da minha loja!" — passada via prop `whatsappLink` pro `LeadModal`, igual ao padrão já usado em redefarma/redesuper. Confirmado no bundle publicado (`encodeURIComponent` foi constant-folded no build, string aparece 100% correta e urlencoded).
- **Evento de remarketing novo**: `Visitou_SuperAgos` (GA4 + Pixel, dispara no load, sem parâmetro) — pra montar público de remarketing de quem visitou a página do estande. Segue o mesmo padrão do `Viu_Apresentacao` já existente.
- **OG próprio** (`vite.config.ts`, bloco dedicado fora do array `apresentacoes`): título "Projeto JLBV na SuperAgos 2026 | Life B Import", descrição mencionando a feira, imagem = mesma foto usada no OG de `/apresentacao-super/` (`apres-super-27.jpg`). Rota estática `dist/public/superagos/index.html` gerada no build igual às outras (`rmk`, `redefarma` etc.).
- **Logo da SuperAgos**: copiada pra `client/public/superagos-logo.png` (arquivo original em `~/Downloads/SuperAgos Logo/`, fundo transparente, branco+amarelo — combina com o gradiente roxo/magenta do hero).

### Pesquisa sobre a feira (WebSearch, 22/09)
SuperAgos 2026: 22-24/09/2026, Centro de Convenções de Goiânia. Maior evento de negócios do varejo supermercadista do Centro-Oeste, promovido pela AGOS (Associação Goiana de Supermercados). +200 marcas confirmadas, projeção de R$343 milhões em negócios (+10% vs 2025), atrai público de DF/TO/MT/MS/MG. Tema: "Experiência que transforma: inspirar, conectar, evoluir".

### Validação antes de publicar
- `npx vite build` limpo (0 erros TS/JSX) — rodado no fluxo padrão fora do iCloud (`scratchpad/jlbv-build`, `pnpm install` 27s + build <1s).
- Bundle publicado conferido via `raw.githubusercontent.com` (sem cache): título/OG corretos, headline "Transforme Sua Visita na SuperAgos" presente, faixa "Ao vivo na SuperAgos 2026" presente, bullet do estande presente, mensagem de WhatsApp presente e corretamente urlencoded.
- Todas as outras 8 páginas (`/`, `/video1/`, `/video2/`, `/redesuper/`, `/redefarma/`, `/rmk/`, `/apresentacao-super/`, `/apresentacao-farma/`) reconferidas em produção — zero regressão, todas HTTP 200 servindo o bundle novo.
- Logo da SuperAgos e imagem do OG confirmadas HTTP 200 em produção.

### Deploy
Fluxo padrão (scratch fora do iCloud → `pnpm install` + `vite build` → `rsync` no worktree `lifebimport-jlbv-pages` → redirects de `/direto/` e `/video1-direto/` restaurados manualmente → `git add` só dos arquivos do deploy, excluindo `.wrangler/` (pasta não relacionada, presente no worktree de outra sessão) → commit `dfaaa85a` → `git push origin gh-pages`). Confirmado HTTP 200 em produção para `projetojlbv.com.br/superagos/`.

### Pendente
- **Repo fonte** (`~/Desktop/lifebimport-jlbv`, branch `main`) ainda não commitado com essa mudança — mesma pendência crônica de iCloud já registrada em 26/08 e 11/09. Os arquivos no disco já estão corretos (idênticos ao que foi buildado e publicado). Tentar `git add -A && git commit` numa próxima sessão, de preferência já com o truque do rsync-pro-scratchpad se travar.
- **Sem condição/oferta específica pro estande** — o bullet "Condição especial" ficou genérico de propósito. Se o Robert quiser anunciar algo concreto (desconto, brinde, prioridade), é só pedir pra ajustar esse texto.
- **Número do estande/local exato dentro do pavilhão** não foi incluído em lugar nenhum (não foi informado) — se o Robert quiser, dá pra adicionar na faixa do topo ou no header.
