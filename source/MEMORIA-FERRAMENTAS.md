# Guia de ferramentas — Robert / Projeto JLBV

---

## A pergunta certa para escolher a ferramenta

**"O que precisa acontecer para a mudança ir ao ar?"**

- Se a resposta for "só salvar e subir o arquivo" → **Cowork**
- Se a resposta for "precisa rodar um processo de montagem antes de subir" → **Terminal (Claude Code)**
- Se for só uma dúvida ou conversa → **Chat ou Cowork**

---

## Claude Chat (claude.ai, app mobile)

Para conversar, tirar dúvidas e pedir ideias. Não acessa sua pasta nem faz nada no computador.

Exemplos:
- "Me dá ideias de copy para o hero da /rmk/"
- "Como funciona CBO vs ABO no Meta Ads?"
- "Qual a diferença entre LAL e interesse no Meta?"

---

## Cowork (aqui, este chat)

Para criar ou editar arquivos que vão direto ao ar sem precisar de nenhum processo especial antes. Acessa sua pasta do Dropbox e faz o deploy automaticamente.

Exemplos:
- Atualizar os dashboards GA4 e Telão com correções ou novas funcionalidades
- Atualizar o dashboard Meta Ads com novos dados do período
- Criar relatórios, documentos, planilhas auxiliares, apresentações
- Analisar dados da planilha de leads e gerar insights
- Atualizar os arquivos de contexto do projeto

---

## Terminal (Claude Code)

Para mexer nas páginas do site (projetojlbv.com.br). As páginas são feitas em React — uma tecnologia que precisa de um processo de montagem antes de ir ao ar. Esse processo só roda no seu computador, por isso precisa do terminal.

Exemplos:
- Mudar texto, imagem ou seção de qualquer página do site
- Criar uma nova página
- Adicionar ou corrigir um evento de rastreamento nas páginas
- Fazer o deploy das páginas depois de editar

---

## Instrução para o Claude

Sempre que Robert chegar com uma tarefa, verificar automaticamente se ele está usando a ferramenta certa. Se não estiver, avisar antes de começar. Exemplos:

- Se pedir para editar uma página do site no Cowork → avisar que é no terminal
- Se pedir para atualizar dashboard no terminal → avisar que dá para fazer aqui no Cowork, mais fácil
- Se for só uma dúvida ou conversa → responder normalmente

Não precisa perguntar, só avisar de forma direta e seguir em frente.

---

## Caso especial — Scripts do Google (Apps Script)

Os scripts que rodam dentro do Google (webhook da planilha de leads e proxy do GA4) ficam no Google Apps Script — um editor online em script.google.com.

Tanto o Cowork quanto o terminal escrevem o código e você cola no Google. Pode pedir nos dois — use o que estiver aberto na hora.

---

## Referências rápidas do projeto

- Site: `projetojlbv.com.br`
- Dashboard Meta Ads: `lifeb-web.github.io/lifeb-dashboard/`
- Dashboard GA4: `projetojlbv.com.br/dashboard-ga4.html`
- Dashboard Telão: `projetojlbv.com.br/dashboard-telao.html`
- Planilha de leads: `docs.google.com/spreadsheets/d/1e9HRi1bnl3fNkE2IjNUYU4mUK7InLmgT_H8NAyfas-4`
- Pasta de contexto (Dropbox): `/Users/robertmarques/Dropbox/DOCUMENTOS/LVL IMPORTADORA/Projeto SDR Comercial/Contexto Paginas SDR/`
- Código fonte do site: `/Users/robertmarques/Desktop/lifebimport-jlbv`
