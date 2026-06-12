# Contexto — Dashboard Meta Ads · Projeto JLBV

## O que é este arquivo

Guia completo para atualizar o dashboard de campanhas do Projeto JLBV com precisão.
Sempre que for atualizar, envie este arquivo + o HTML + os CSVs exportados do Meta Ads ao Claude Code.

---

## Link público (fixo, nunca muda)

**https://lifeb-web.github.io/lifeb-dashboard/**

Repositório: `lifeb-web/lifeb-dashboard` (branch `gh-pages`)
Arquivo principal: `index.html`

---

## Como atualizar

1. Exporte do Meta Ads Manager:
   - **Campanhas**: período → exportar como CSV
   - **Conjuntos de anúncios**: mesmo período → exportar como CSV
2. Abra o Claude Code na pasta `/Users/robertmarques/Downloads/Dashboard Projeto SDR`
3. Arraste ou mencione os CSVs + este arquivo de contexto
4. Diga: *"atualiza o dashboard com esses dados"*
5. O Claude atualiza o HTML e faz o deploy automaticamente — link continua o mesmo

---

## Estrutura do dashboard (o que atualizar a cada período)

### Cabeçalho
```
Período analisado: XX xxx – XX xxx AAAA
Última atualização: DD de mês de AAAA
```

### Resumo executivo (4 cards)
| Campo | Onde está no HTML | Dados de onde vêm |
|-------|-------------------|-------------------|
| ROAS | `data-target="10.8"` no `.num-xl` | Receita total ÷ Investimento total |
| Total investido | `data-target="443"` no `.num-lg.purple` | Soma de gasto das 3 campanhas |
| Receita gerada | `data-target="4800"` no `.num-lg.green` | Informado manualmente (vendas fechadas) |
| Reuniões | `.num-lg.normal` — texto livre | Informado manualmente |

> **Receita e Reuniões não vêm do CSV** — são informados por você com base no que o SDR/vendedor fechou.

### Cards de campanha (3 campanhas)
Para cada campanha, atualizar:
- Número de contatos/leads gerados (`data-target` no `.result-num`)
- Gasto total
- Custo por contato/lead
- CPM
- CTR
- Taxa de conversão na página
- Largura da barra (`data-width` no `.bar-fill`) — valor relativo 0–100 baseado no volume

### Tabelas de audiência (3 tabelas, 5 linhas cada)
Colunas: Público | Tipo | Gasto | Contatos/Leads | Custo/contato ou lead | CTR

Marcar o melhor público de cada tabela com `class="best-row"` na `<tr>` e adicionar `<span class="best-badge">★ Melhor</span>` na célula do nome.

---

## As 3 campanhas (nomes fixos)

| # | Nome no dashboard | Tipo de conversão medida |
|---|-------------------|--------------------------|
| 1 | Página Direta — sem formulário | Clique no botão WhatsApp |
| 2 | Página com Imagens — com formulário | Preenchimento do formulário |
| 3 | Página com Vídeo — com formulário | Preenchimento do formulário |

---

## Os 5 públicos de cada campanha (nomes fixos)

1. Farmácias *(Interesse)*
2. Supermercados *(Interesse)*
3. Similar a clientes Luiz Farma *(LAL 1%)*
4. Similar a clientes (base geral) *(LAL 1%)*
5. Similar a clientes Luiz Super *(LAL 1%)*

---

## Identidade visual (não alterar)

| Cor | Hex | Uso |
|-----|-----|-----|
| Roxo principal | `#564B99` | Header, bordas, labels |
| Roxo claro | `#7B6FC4` | Acentos secundários |
| Magenta | `#DA2F8A` | ROAS, destaques principais |
| Verde | `#16A34A` | Resultados positivos, melhor público |
| Âmbar | `#D97706` | Resultados medianos, atenção |
| Vermelho | `#DC2626` | Resultados negativos |

---

## Onde fica o deploy

- Repositório GitHub: `github.com/lifeb-web/lifeb-dashboard`
- Branch: `gh-pages`
- Arquivo: `index.html`
- Deploy local: `/tmp/lifeb-dashboard/` (o Claude recria se necessário)
- Conta GitHub: `lifeb-web` (autenticada via gh CLI)

Comando de deploy (o Claude executa automaticamente):
```bash
cd /tmp/lifeb-dashboard
cp "caminho/dashboard-lifeb-meta-ads.html" index.html
git add index.html
git commit -m "Atualização: período XX/XX – XX/XX"
git push origin gh-pages
```

---

## Notas importantes

- **Receita** não vem do Meta — você informa manualmente com base nas vendas fechadas
- **ROAS** = Receita ÷ Investimento (calcule antes de informar ao Claude, ou deixe o Claude calcular)
- O número de "reuniões agendadas" é texto livre — informe o status atual
- O campo "Em andamento" no card de reuniões pode virar um número quando tiver dados
- Sempre informar o período exato (datas de início e fim)
- Se uma campanha for pausada/substituída, descrever a mudança para o Claude adaptar o layout

---

## Exportando do Meta Ads Manager

1. Acesse **Gerenciador de Anúncios** → selecione o período
2. Nível **Campanhas** → botão Exportar → CSV
3. Nível **Conjuntos de anúncios** → botão Exportar → CSV
4. Colunas mínimas necessárias:
   - Nome da campanha / conjunto
   - Valor gasto
   - Resultados (cliques no link / leads)
   - CPM
   - CTR (todos)
   - Custo por resultado
   - Alcance / Impressões (opcional)
