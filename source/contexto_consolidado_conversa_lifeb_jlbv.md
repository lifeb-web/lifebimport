# Contexto consolidado da conversa — Life B / Projeto JLBV

## 1. Objetivo geral desta conversa
Esta conversa consolidou quatro frentes principais do projeto Life B / Projeto JLBV:

1. Auditoria e entendimento do dashboard GA4 / telão
2. Análise de campanhas Meta Ads e leitura B2B de performance
3. Estruturação da planilha de leads para operação comercial e análise futura
4. Regras, fórmulas e padronizações para transformar a planilha em base confiável de operação e inteligência

---

## 2. Visão do negócio e contexto do projeto
A Life B trabalha com um projeto B2B focado em lojistas, principalmente:
- farmácias
- drogarias
- supermercados

A proposta do Projeto JLBV / Mega Vision é implantar uma categoria rentável de acessórios dentro da loja, com foco em:
- aumento de ticket médio
- venda por impulso
- baixo investimento
- exposição estratégica
- alto giro

A lógica comercial do projeto é:
- marketing gera o lead
- SDR qualifica
- lead é encaminhado ao representante/vendedor
- vendedor negocia
- parte vira reunião, visita, apresentação, proposta, fechamento

Premissas relevantes desta conversa:
- análise de mídia precisa ser feita com lente B2B, não B2C
- o ciclo comercial não é imediato
- o lead não precisa fechar no mesmo dia para ser considerado bom
- o tempo de maturação até a venda importa
- fase atual ainda é de testes e construção de base, com campanhas, públicos e páginas sendo validados

---

## 3. Dashboard GA4 / Telão — conclusões principais
### 3.1. Estado geral do dashboard
A leitura consolidada foi de que o dashboard está:
- acima da média
- visualmente profissional
- útil para acompanhamento operacional e comercial
- bom para leitura rápida em escritório / telão
- bom para sinalizar padrões, volume, leads, páginas, origens e horários
- limitado para diagnóstico profundo totalmente autônomo

Classificação geral dada ao dashboard:
- profissionalismo visual: muito bom
- utilidade operacional: muito boa
- utilidade analítica: boa
- capacidade diagnóstica: boa, mas não autossuficiente
- maturidade geral: acima da média
- nota geral sincera: cerca de 8/10

### 3.2. Limitação importante do filtro "Hoje"
Foi consolidado que:
- o card "ao vivo" é quase realtime, porque usa o realtime report do GA4
- o restante do filtro "Hoje" não é realtime real
- visitantes, visitas, gráfico, leads, tabelas e parte dos eventos dependem dos relatórios padrão do GA4
- relatórios padrão do GA4 podem atrasar várias horas
- por isso o filtro "Hoje" pode ficar desatualizado
- "Ontem" costuma ficar mais confiável quando o processamento do dia fecha

Conclusão:
- o telão não é 100% realtime no filtro Hoje
- ele é um painel misto: uma parte ao vivo, uma parte quase real-time / processamento parcial

### 3.3. O que ficou entendido sobre GA4
O GA4:
- mostra realtime quase imediatamente para usuários ativos
- pode atrasar horas nos relatórios padrão
- pode normalizar dados apenas depois que o dia vira ou algumas horas depois
- isso explica por que "Hoje" parece incompleto e "Ontem" aparece ajustado depois

### 3.4. Melhor caminho para “tempo real” de verdade
Foi discutido que:
- acelerar refresh do dashboard não faz o GA4 padrão processar mais rápido
- dentro da estrutura atual, o máximo plausível é um "Hoje híbrido" com mais uso de Realtime API
- para um "Hoje" realmente forte e quase realtime em toda a camada analítica, o caminho robusto seria BigQuery
- porém BigQuery aumentaria a complexidade do projeto e não foi considerado necessário agora

Conclusão prática:
- para o estágio atual, faz sentido manter o dashboard como está
- não vale complicar com BigQuery agora
- a forma madura de usar o painel é: dashboard + Meta Ads + inteligência de marketing + análise assistida

### 3.5. Uso inteligente do dashboard
Foi consolidado que o uso correto do painel é:
- usar o dashboard para enxergar melhor do que no GA4 cru
- usar o Meta Ads para entender mídia
- usar raciocínio comercial/marketing para contexto
- usar análise aprofundada para cruzar tudo e tomar decisão

Ou seja:
- o painel não precisa explicar tudo sozinho
- ele precisa organizar a visão e destacar padrões
- ele já cumpre muito bem esse papel

---

## 4. Campanhas Meta Ads — leitura consolidada
### 4.1. Janela e premissas da análise
Período analisado:
- 26/03/2026 a 15/04/2026

Premissas fornecidas:
- somente o Meta Ads estava realmente atualizado
- o dashboard tinha contaminações e limitações
- estávamos avaliando um teste / fase de otimização, não uma operação final
- públicos ainda improvisados
- criativos e páginas ainda em teste
- a base de dados ainda está sendo construída
- quando bater 100 leads qualificados, será criada uma base melhor para LAL qualificado

Convenções passadas:
- c/ = com formulário
- s/ = sem formulário, direto para WhatsApp
- IMG = landing page com imagens no topo
- VD = landing page com vídeo no topo
- MANUS = página criada/testada via Manus, sem formulário, direto pro WhatsApp
- LAL = lookalike
- Luiz Super = LAL criado a partir de lista de supermercados do B2B Leads
- Luiz Farma = LAL criado a partir de lista de farmácias do B2B Leads

### 4.2. Descoberta importante sobre campanhas sem formulário
Foi consolidado que as campanhas s/:
- eram baratas no topo do funil
- inflavam intenção
- geravam muito clique / tentativa de contato
- mas perdiam lead se a pessoa não mandasse mensagem no WhatsApp
- portanto não eram equivalentes a lead real
- a decisão de pausá-las foi considerada correta

Conclusão:
- campanhas s/ não devem ser tratadas como geradoras de lead real comparável às c/
- campanhas c/ são a base real de captura para operação e análise

### 4.3. Leitura B2B correta do projeto
Depois do contexto adicional, a análise passou a considerar que:
- cerca de 90% dos leads das campanhas ativas são qualificados
- os leads são de decisores corretos (donos/gestores de farmácias e supermercados)
- o ciclo comercial é B2B e leva dias
- fechamento não deve ser cobrado com régua de curtíssimo prazo
- CPL entre ~R$20 e R$25 pode ser perfeitamente aceitável para esse contexto

### 4.4. Evolução do pipeline comercial
Foi informado que, além dos 3 fechamentos, havia:
- 1 quase fechando em R$ 1.200
- cerca de 6 reuniões/visitas
- algumas ligações agendadas
- algumas apresentações em andamento

Fechamentos confirmados e tempo médio:
- R$ 4.800 em cerca de 10 dias
- R$ 2.400 em cerca de 15 dias
- R$ 2.000 em cerca de 17 dias

Conclusão:
- o projeto já passou da fase de teste cego
- há validação comercial inicial real
- o funil B2B mostrou capacidade de gerar pipeline e receita
- ainda é cedo para conclusões definitivas agressivas
- a análise correta é por pipeline, não só por fechamento imediato

### 4.5. Decisões de otimização consolidadas
#### Campanhas
Manter:
- IMG c/
- VD c/
- RMK c/

Pausadas corretamente:
- campanhas s/ formulário

#### Sobre IMG c/ vs VD c/
Conclusão:
- IMG c/ parece levemente melhor em eficiência
- VD c/ continua viva e válida
- não há motivo técnico sério para matar VD c/ agora
- o duelo ainda está em aberto no contexto B2B

#### Públicos
Mais promissores:
- Luiz Super LAL 1%
- Luiz Farma LAL 1%
- Interesses Farmácias

Em observação:
- Supermercados
- Interesses Supermercados
- remarketing c/

Mais fraco:
- Clientes LAL 1%

### 4.6. CBO x ABO
Foi esclarecido que as campanhas estavam em CBO.

Conclusões:
- em CBO, não há controle fino de verba por conjunto
- portanto, a otimização correta é:
  - manter campanhas boas
  - remover conjuntos/anúncios claramente fracos
  - deixar a CBO distribuir verba entre os melhores públicos remanescentes
- não houve recomendação para migrar imediatamente tudo para ABO
- CBO ainda faz sentido nesta fase de teste

### 4.7. Leitura de anúncios
Conclusão consolidada:
- ainda não era momento de tomar decisão estratégica pesada por anúncio isolado
- anúncios devem servir mais para poda fina do que para estratégia central
- campanha + conjunto + tipo de página + qualidade comercial continuam sendo mais importantes do que criativo individual

Foi sugerido:
- manter anúncios com entrega e sinal razoável
- pausar anúncios que gastaram e não trouxeram resposta
- observar anúncios com pouca amostra / pouca chance por causa da CBO

### 4.8. Decisão prática temporária
Foi decidido:
- deixar mais anúncios ativos no curto prazo
- não pausar agressivamente durante o período de teste
- pausar apenas os que gastaram muito e não trouxeram leads

---

## 5. Planilha de leads — construção da estrutura
### 5.1. Princípios gerais definidos
A planilha deveria:
- preservar as colunas automáticas da LP sem mexer no script
- adicionar apenas o necessário para análise e operação
- evitar excesso de colunas
- ser escalável para SDR + representantes
- servir tanto para operação quanto para análise futura de mídia + pipeline + venda

As colunas A a E não deveriam ser alteradas, por dependerem do script da landing.

### 5.2. Estrutura automática inicial preservada
As colunas automáticas mantidas foram:
- DIA / HORÁRIO
- NOME
- WHATSAPP
- ORIGEM DO BOTÃO NA LP
- LINK PÁGINA DE ORIGEM

### 5.3. Estrutura final construída
A estrutura final da planilha ficou consolidada assim:

- DIA / HORÁRIO
- NOME
- WHATSAPP
- ORIGEM DO BOTÃO NA LP
- LINK PÁGINA DE ORIGEM
- SEGMENTO
- RESPONSÁVEL
- STATUS
- EMPRESA / LOJA
- CNPJ
- ENDEREÇO
- CIDADE
- ESTADO
- EMPRESA IDENTIFICADA?
- APROVADO PARA BOLETO?
- PAGAMENTO POSSÍVEL
- VALOR POTENCIAL
- DATA DO FECHAMENTO
- DIAS ATÉ FECHAR
- VALOR FECHADO
- MOTIVO DE PERDA
- OBSERVAÇÃO

### 5.4. Decisões importantes sobre colunas
#### STATUS
Foi decidido usar um conjunto enxuto de status:
- Novo lead
- Em contato
- Qualificado
- Reunião agendada
- Em negociação
- Fechado
- Perdido

Isso foi considerado suficiente e mais escalável que uma árvore de microetapas.

#### POSITIVOU?
Foi debatido e removido.
Conclusão:
- se existe VALOR FECHADO, a coluna POSITIVOU? fica redundante
- VALOR FECHADO já sinaliza que houve fechamento

#### CNPJ
Foi debatido e mantido.
Conclusão:
- útil, mas não obrigatório em todos os leads desde o início
- serve para crédito, deduplicação e organização futura
- deve ficar perto de EMPRESA / LOJA

#### Motivo de perda
Foi debatido e mantido.
Conclusão:
- vale a pena
- não pesa demais
- ajuda muito na análise futura

#### Data do fechamento
Foi debatida e considerada necessária.
Conclusão:
- importante para medir tempo até conversão
- ficou perto de valor potencial e valor fechado

#### Dias até fechar
Foi criada como coluna automática por fórmula.
Conclusão:
- mesmo não sendo perfeita para medir só o tempo do vendedor, é muito útil como medida total de lead → venda
- não precisa criar mais datas por enquanto

### 5.5. Separações adicionais que melhoraram a planilha
Foi decidido separar:
- ENDEREÇO
- CIDADE
- ESTADO

Em vez de misturar tudo em um único campo.

Isso melhora:
- análise regional
- organização
- uso futuro em dashboard

---

## 6. Dropdowns / validação de dados
### 6.1. Colunas com dropdown definidas
Foram definidas listas de validação para:
- SEGMENTO
- STATUS
- EMPRESA IDENTIFICADA?
- APROVADO PARA BOLETO?
- PAGAMENTO POSSÍVEL
- MOTIVO DE PERDA

### 6.2. Lista enxuta de motivo de perda
Houve refinamento da lista de motivos de perda.
Foi simplificada para evitar excesso.

Lista final mais enxuta:
- Sem interesse
- Sem retorno
- Restrição de pagamento
- Já possui fornecedor
- Fora do perfil
- Outro

A unificação de “Crédito reprovado” e “Somente à vista” em “Restrição de pagamento” foi considerada melhor para esta fase.

### 6.3. Modo de implementação no Sheets
Foi explicado como criar dropdown manualmente por coluna no Google Sheets usando:
- Dados > Validação de dados
- rejeitar entrada inválida

---

## 7. Proteção e usabilidade da planilha
### 7.1. Linha 1
Foi orientado proteger a linha 1 para impedir que cabeçalhos sejam apagados.

### 7.2. Colunas automáticas A:E
Foi orientado proteger A:E, mas com teste prévio do formulário para confirmar que o Apps Script continuava preenchendo normalmente.
O teste foi feito e funcionou.

### 7.3. Dropdowns
Foi explicado que:
- não vale proteger a coluna inteira do dropdown, porque isso pode impedir uso
- o melhor equilíbrio é:
  - proteger topo
  - proteger A:E
  - rejeitar entrada inválida nas colunas com dropdown

### 7.4. Colunas vazias à direita
Foi orientado apagar colunas vazias depois da última coluna útil para deixar a planilha mais limpa.

### 7.5. Pintura de colunas
Foi debatido pintar colunas conforme responsabilidade:
- campos do SDR
- campos do comercial / vendedor
- campos automáticos neutros

A lógica geral ficou:
- automáticas: neutras
- SDR: qualificação, empresa, status, identificação
- comercial: crédito, pagamento, valores, perda, observações

---

## 8. Fórmulas e automações leves
### 8.1. Fórmula de dias até fechar
Foi criada e explicada a fórmula:

```excel
=SE(OU(A2="";R2="");"";INT(R2)-INT(A2))
```

Lógica:
- se não houver data inicial ou final, deixa em branco
- usa a data/hora da coluna A
- ignora a parte do horário usando INT
- calcula os dias corridos entre a entrada do lead e o fechamento

Foi explicado detalhadamente:
- o papel de SE
- o papel de OU
- o uso de INT
- por que isso ignora o horário
- que o Sheets respeita corretamente meses de 30/31 dias, fevereiro e anos bissextos

### 8.2. Coluna MÊS / ANO
No contexto técnico posterior, também foi consolidado o uso de coluna auxiliar com ARRAYFORMULA para gerar mês/ano a partir da coluna A, sem mexer no script.

---

## 9. Auditoria posterior da planilha preenchida
Depois de a planilha estar populada e com preenchimento dos representantes, foi feita uma revisão mais completa.

### 9.1. Avaliação geral
Conclusão:
- a planilha ficou boa
- profissional
- madura o suficiente para análise séria do projeto
- não é CRM completo, mas já é muito mais do que uma planilha simples

### 9.2. Pontos encontrados
#### Erro real detectado
- houve caso de DATA ENVIO AO VENDEDOR anterior à data do lead
- exemplo encontrado: data digitada em 2024 quando deveria ser 2026

#### Falta de motivo de perda
- havia leads com status Perdido sem MOTIVO DA PERDA

#### Inconsistência de empresa identificada
- havia pelo menos um caso de EMPRESA IDENTIFICADA? = SIM com empresa vazia

#### Baixo uso do CNPJ
- CNPJ ainda aparecia pouco preenchido
- mas a coluna foi considerada útil e mantida

### 9.3. Regras internas sugeridas
Foram sugeridas estas regras de consistência:
- Fechado → precisa ter DATA DO FECHAMENTO e VALOR FECHADO
- Perdido → precisa ter MOTIVO DA PERDA
- EMPRESA IDENTIFICADA? = SIM → precisa ter EMPRESA / LOJA
- APROVADO PARA BOLETO? = SIM → PAGAMENTO POSSÍVEL não pode ficar vazio
- DATA ENVIO AO VENDEDOR não pode ser menor que DIA / HORÁRIO

### 9.4. Como implementar essas regras
Foi orientado usar formatação condicional no Google Sheets, não validação rígida nem script, por ser:
- mais simples
- mais leve
- menos bloqueador da operação

Foram sugeridas fórmulas personalizadas para pintar as células problemáticas.

---

## 10. CRM x planilha
Foi debatido o quanto a planilha se aproxima de um CRM.

Conclusão:
- ainda não é um CRM
- mas já é um mini-CRM operacional
- está acima de uma planilha comum
- para virar CRM de verdade faltariam:
  - histórico de interações
  - tarefas / próxima ação
  - pipeline visual
  - automação
  - visão consolidada por empresa
  - lembretes
  - relatórios nativos

Mesmo assim, foi considerado que:
- a planilha atual já atende muito bem o estágio atual do projeto
- não vale complicar com CRM agora

---

## 11. Valor analítico da base criada
Foi consolidado que a nova estrutura permite análises futuras como:
- leads por campanha
- leads por página
- leads por botão da LP
- qualificação por origem
- taxa de avanço por campanha
- taxa de fechamento por página
- ticket médio por campanha
- prazo médio até fechamento
- motivo de perda por origem
- aprovado para boleto por campanha/página
- comparação por segmento (farmácia vs supermercado)

Conclusão:
- a planilha virou base real de inteligência comercial
- agora existe uma ponte entre tráfego, lead, pipeline e venda

---

## 12. Contexto técnico adicional do projeto
Foi anexado o contexto do projeto em `.md`, com pontos relevantes como:
- o projeto JLBV é uma landing B2B da Life B Import
- público-alvo: lojistas de farmácias, drogarias e supermercados
- fluxo: consultor qualifica o lead → passa para vendedor → follow-up
- páginas ativas:
  - /
  - /direto/
  - /video1/
  - /video1-direto/
  - /rmk/
  - /contato/
- eventos Meta Pixel e GA4 configurados
- webhook da planilha grava A=data, B=nome, C=telefone, D=origem, E=página
- lógica do dashboard GA4 e dashboard telão
- decisões de copy, remarketing, cases e funil da landing

Isso foi utilizado apenas como reforço de contexto técnico e confirmou que:
- a preservação de A:E na planilha estava correta
- o projeto continua totalmente coerente com o fluxo SDR → vendedor → fechamento

---

## 13. Conclusão consolidada da conversa
### Sobre o dashboard
- está bom
- profissional
- útil
- acima da média
- com limitação estrutural no filtro Hoje por causa do GA4

### Sobre as campanhas
- o projeto mostrou validação comercial real
- s/ formulário foi corretamente pausado
- IMG c/ e VD c/ devem continuar
- Luiz Super LAL, Luiz Farma LAL e Interesses Farmácias merecem prioridade
- Clientes LAL está mais fraco
- otimização deve ser feita com calma por causa do ciclo B2B e da CBO

### Sobre a planilha
- ficou enxuta e forte
- bem estruturada
- boa para operação e análise
- não precisa de mais colunas agora
- o foco agora é consistência de preenchimento

### Sobre o próximo nível do projeto
- já dá para pensar em dashboards refinados cruzando:
  - Meta Ads
  - GA4
  - LP / botão / página
  - pipeline comercial
  - fechamento
- mas o principal agora é operar bem a base construída

---

## 14. Recomendação operacional final
1. Não mexer mais na estrutura da planilha
2. Corrigir inconsistências pontuais já identificadas
3. Padronizar preenchimento com os representantes
4. Usar a planilha como base oficial de operação e análise
5. Cruza-la depois com Meta Ads e dashboards para otimizações mais maduras

---

## 15. Painel do Representante (Rep Dashboard)

### 15.1. Objetivo e arquitetura
Foi construído um painel CRM mobile-first voltado exclusivamente para os representantes comerciais (reps) da Life B Import. Cada rep acessa sua própria URL privada e vê apenas seus leads.

Arquitetura:
- **Frontend**: HTML/CSS/JS estático hospedado no GitHub Pages (repositório `lifeb-web/lifebimport`, branch `gh-pages`)
- **Backend / dados**: Google Apps Script (proxy) — mesmo script da planilha de leads, com endpoints adicionais para o painel
- **Planilha**: mesma planilha de leads SDR já existente (SPREADSHEET_ID: `1e9HRi1bnl3fNkE2IjNUYU4mUK7InLmgT_H8NAyfas-4`)
- **Deploy**: worktree git isolado em `/private/tmp/ghpages-wtN` → commit → push para `origin/gh-pages`
- **Arquivo base**: `dashboard-rep-template.html` (na pasta `painel reps/`)
- **Arquivos gerados**: `dist/public/rep/dash/iramar/index.html` e `dist/public/rep/dash/natanael/index.html`
- **Geração**: script Python que substitui `__LOGO_SRC__`, `__REP_NAME__`, `__DISPLAY_NAME__` no template

URLs de acesso:
- Iramar: `https://lifeb-web.github.io/lifebimport/rep/dash/iramar/`
- Natanael: `https://lifeb-web.github.io/lifebimport/rep/dash/natanael/`

### 15.2. Proxy (lifeb-leads-proxy.gs)
Constantes relevantes do proxy:
- `SPREADSHEET_ID`: `1e9HRi1bnl3fNkE2IjNUYU4mUK7InLmgT_H8NAyfas-4`
- `UPDATE_TOKEN`: `c4e09a0994b803ab35d43f3c`
- `PROXY_URL` no template: `https://script.google.com/macros/s/AKfycbyq9KJgWTRoALEEVf8Pu_I82GT0-tTK5yXNg-RsYHj4ywK6Grg9z_jG1-IcTW3LMXfNBg/exec`

Endpoints relevantes para o painel:
- `?action=active` → retorna leads ativos do rep (Aguardando contato, Em contato, Em negociação)
- `?action=rep_history` → retorna Fechado e Perdido para o histórico
- `POST` com `{ token, row, rep, campo, valor }` → atualiza campo na planilha

Campos atualizáveis via POST:
- `STATUS_VENDEDOR` — status do lead
- `OBS_VENDEDOR` — observação do representante
- `VALOR_POTENCIAL` — valor potencial do negócio
- `VALOR_FECHADO` — valor do fechamento (obrigatório ao marcar Fechado)
- `MOTIVO_PERDA` — motivo da perda (obrigatório ao marcar Perdido)

Mapeamento de colunas da planilha (0-based):
- COL_DATA=0, COL_NOME=1, COL_WHATSAPP=2, COL_ORIGEM_BTN=3, COL_LINK_LP=4
- COL_STATUS_SDR=5, COL_VENDEDOR=6, COL_DATA_ENVIO=7, COL_OBS_SDR=8
- COL_SEGMENTO=9, COL_EMPRESA_ID=10, COL_EMPRESA=11, COL_CONTATO_EMP=12
- COL_CNPJ=13, COL_ENDERECO=14, COL_CIDADE=15, COL_CEP=16, COL_ESTADO=17
- COL_STATUS_VEND=18, COL_BOLETO=19, COL_PG_POSS=20, COL_VALOR_POT=21
- COL_DATA_FECH=22, COL_DIAS_FECHAR=23, COL_VALOR_FECH=24, COL_MOTIVO_PERD=25, COL_OBS_VEND=26

Ordenação de leads ativos em `getActive()`:
- Aguardando contato → sempre primeiro (prioridade 0)
- Em contato → prioridade 1
- Em negociação → prioridade 2
- Dentro de cada grupo: data ascendente (mais antigos primeiro)

**Atenção**: para que mudanças no proxy tomem efeito, é obrigatório criar uma nova versão de implantação no Apps Script (Implantar > Gerenciar implantações > editar > Nova versão). Apenas salvar o arquivo não atualiza a URL pública `/exec`.

### 15.3. Funcionalidades implementadas no painel

**Exibição de leads ativos:**
- Cards com empresa, nome do contato, cidade/UF, data de entrada
- Valor potencial editável inline (otimista — salva em background)
- Select de status com classes visuais por estado (ag/cont/neg)
- Confirmação inline antes de mudar status ("Lead vai ao final da fila")
- Barra de loading no topo para feedback visual de rede
- Dot verde piscante + horário da última sincronização

**Painel de contato expansível:**
- Botão de pessoa (👤) abre painel com contato principal, contato da empresa, telefone clicável, endereço, CNPJ
- Botão de WhatsApp → confirmação inline antes de abrir
- Botão de Maps → confirmação inline antes de abrir

**Observação do representante:**
- Leitura e edição inline, com botão Editar/Adicionar
- Salva otimisticamente, reverte em caso de erro
- Separada visualmente da obs do SDR (somente leitura)

**Obs do SDR:**
- Exibida no card expandido, somente leitura

**Fluxo Fechado / Perdido:**
- Ao confirmar Fechado → prompt obrigatório para digitar valor do fechamento
- Ao confirmar Perdido → prompt obrigatório para digitar motivo da perda
- O POST de STATUS_VENDEDOR só é enviado à planilha **após** o rep preencher o campo obrigatório (não antes)
- O card anima e sai do painel ao concluir
- Lead é removido de `_rawLeads` para não reaparecer no próximo render

**Desfazer (Undo):**
- Toast de 8 segundos com botão ↩ Desfazer após cada ação
- Desfazer envia POST de reversão à planilha (campo e valor anterior)
- Para Fechado/Perdido: desfazer reverte **dois campos** (STATUS_VENDEDOR + VALOR_FECHADO ou MOTIVO_PERDA) e restaura o lead no painel ativo
- Para outros status, obs e valor potencial: desfazer single-campo

**Filtros por status:**
- 4 cards de resumo no topo: Aguardando / Em Contato / Negociando / Total
- Clique filtra a lista visível; clique duplo ou segundo clique limpa o filtro
- Filtro re-renderiza todos os leads (não apenas os paginados)

**Paginação:**
- 8 leads por página
- "Ver mais" carrega +8
- "Ver menos" reduz -8 com scroll suave ao topo da lista

**Histórico (Fechados e Perdidos):**
- Seção colapsável no rodapé
- Carregada sob demanda na primeira abertura
- Cards com badge de status, valor fechado ou motivo de perda, botão de WhatsApp

**Performance:**
- Cache em `localStorage` por rep: segunda visita é instantânea (mostra dados cached, atualiza em background)
- `DOMContentLoaded` em vez de `window.load`: não bloqueia na fonte nem na imagem
- Google Fonts assíncrono: preconnect + `media="print" onload` trick
- Poll a cada 60s com deduplicação por `JSON.stringify` (só re-renderiza se dados mudaram)
- Atualizações otimistas: toda ação reflete no UI imediatamente, POST ocorre em background

**Proteções de UX mobile:**
- `user-scalable=no` no viewport
- `touch-action: manipulation` em todos os elementos interativos (impede zoom por duplo toque)

### 15.4. Regras de negócio do painel

- Leads aparecem somente se o campo VENDEDOR na planilha bate exatamente com o `REP_NAME` do arquivo (comparação case-insensitive uppercase)
- `STATUS_PRIO`: Aguardando contato=0, Em contato=1, Em negociação=2 — outros valores recebem prioridade 9 e ficam no final
- Fechado e Perdido saem do painel ativo e aparecem apenas no histórico
- Confirmação de mudança de status é obrigatória para qualquer troca (exceto Fechado/Perdido que além disso exigem campo extra)
- Valor do fechamento e motivo da perda são campos obrigatórios — não existe "pular"
- Durante o preenchimento do prompt de Fechado/Perdido, o poll de 60s não remove o lead nem re-renderiza o painel

### 15.5. Estrutura de variáveis JS críticas

```javascript
const PROXY_URL  = '...'; // URL do Apps Script
const REP_NAME   = '__REP_NAME__'; // substituído no build (ex: 'IRAMAR')
const REP_TOKEN  = 'c4e09a0994b803ab35d43f3c';
const POLL_MS    = 60_000;
const LIMIT      = 8; // leads por página
const CACHE_KEY  = 'lifeb_cache_' + REP_NAME;

let _rawLeads     = []; // todos os leads do rep (ativos)
let _allLeads     = []; // leads do rep filtrados/ordenados
let _visibleCount = 8;  // quantos estão sendo exibidos
let _activeFilter = null; // filtro de status ativo
let _firstLoad    = true;
let _undoPending  = null; // { row, campo, valor } ou { isMulti, leadSnapshot, actions: [...] }
```

### 15.6. Procedimento de deploy

1. Editar o template em `Contexto Paginas SDR/painel reps/dashboard-rep-template.html`
2. Rodar o script Python para gerar os arquivos por rep:
```python
import re, os
with open("dashboard-rep-template.html") as f:
    template = f.read()
with open(".../dist/public/rep/dash/iramar/index.html") as f:
    existing = f.read()
logo_src = re.search(r'src="(data:image[^"]+)"', existing).group(1)
for rep_name, rep_display in [("IRAMAR","Iramar"), ("NATANAEL","Natanael")]:
    out = template.replace("__LOGO_SRC__", logo_src).replace("__REP_NAME__", rep_name).replace("__REP_DISPLAY__", rep_display)
    with open(f".../dist/public/rep/dash/{rep_name.lower()}/index.html", "w") as f:
        f.write(out)
```
3. Fazer deploy via worktree:
```bash
cd /Users/robertmarques/Desktop/lifebimport-jlbv
git worktree add /private/tmp/ghpages-wtN remotes/origin/gh-pages
cp dist/public/rep/dash/iramar/index.html /private/tmp/ghpages-wtN/rep/dash/iramar/index.html
cp dist/public/rep/dash/natanael/index.html /private/tmp/ghpages-wtN/rep/dash/natanael/index.html
cd /private/tmp/ghpages-wtN
git add rep/dash/iramar/index.html rep/dash/natanael/index.html
git commit -m "mensagem do commit"
git push origin HEAD:gh-pages
git worktree remove /private/tmp/ghpages-wtN
```

### 15.7. Para adicionar novo representante

1. Criar pasta `dist/public/rep/dash/{nome_em_minusculo}/`
2. Criar pasta `rep/dash/{nome_em_minusculo}/` no worktree de gh-pages
3. Adicionar o rep ao script Python de geração
4. Na planilha, o campo VENDEDOR do lead precisa ter o nome em uppercase exatamente igual ao `REP_NAME` (ex: `JOAO` para rep_name `JOAO`)
5. Fazer deploy normalmente

### 15.8. Diagnóstico de problemas conhecidos

**WA não aparece no histórico:**
- Causa mais provável: proxy não foi reimplantado após edição
- `getRepHistory()` já retorna `whatsapp: norm(r[COL_WHATSAPP])` no código atual
- Para corrigir: Apps Script > Implantar > Gerenciar implantações > editar > Nova versão > Implantar
- O painel mostra aviso amarelo na seção de histórico se todos os leads vieram sem campo WA
- Se o aviso não aparecer mas os botões sumem mesmo assim: WhatsApp está vazio na planilha para esses leads

**Lead some antes de preencher motivo/valor:**
- CORRIGIDO: `hasPending` guard no `loadData` — poll de 60s não re-renderiza enquanto prompt está aberto
- CORRIGIDO: lead preservado em `_rawLeads` se `sp-{row}` tiver classe `.visible` no momento do poll

**Status mudado antes da hora:**
- CORRIGIDO: para Fechado/Perdido, o POST de STATUS_VENDEDOR só ocorre em `saveStatusExtra`, não em `confirmStatusChange`

**Desfazer não revertia na planilha para Fechado/Perdido:**
- CORRIGIDO: `undoLast` com `isMulti: true` envia dois POSTs sequenciais e restaura o lead no painel

**Zoom por duplo toque no mobile:**
- CORRIGIDO: `user-scalable=no` + `touch-action: manipulation` em todos os interativos
