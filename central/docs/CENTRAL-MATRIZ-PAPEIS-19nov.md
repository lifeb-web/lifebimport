# Central Life B: matriz papel x aba x ação (19/11/2026)

Fonte da regra: servidor (`src/central_papeis.js`, `MATRIZ_BASE`) e página (`PAPEIS_PADRAO` em `central/index.html`). Os dois têm a mesma tabela, conferida por teste (`central/tests/papeis_jsdom.cjs` e `tests/central_papeis.test.mjs`).

## Abas

| Aba | robert | admin | sdr | papel novo |
|---|---|---|---|---|
| Início e atalhos | sim | sim | sim | sempre |
| Visão geral | sim | sim | sim | se marcada |
| Bia e automações | sim | sim | sim | se marcada |
| Todas as chaves | sim | sim | sim | se marcada |
| Filas de mensagens | sim | sim | sim | se marcada |
| Calendário | sim | sim | sim | se marcada |
| Atendimento | sim | sim | sim | se marcada |
| Ana | sim | sim | sim | se marcada |
| Histórico | sim | sim | sim | se marcada |
| Instagram | sim | sim | não | nunca |
| Ecossistema | sim | sim | sim | se marcada |
| Playbook comercial | sim | sim | sim | se marcada |
| Usuários | sim | não | não | nunca |
| Minha conta | sim | sim | sim | sempre |

## Ações

| Ação | robert | admin | sdr | papel novo |
|---|---|---|---|---|
| Mudar controle de risco baixo/médio | sim | sim | não | não |
| Mudar controle de risco alto | sim | não | não | não |
| Criar/redefinir usuário, mudar papel | sim | não | não | não |
| Criar/editar/remover papel novo | sim | não | não | não |
| Definir quem vê cada atalho do Início | sim | não | não | não |
| Ver fila do Instagram | sim | sim | não | não |
| Criar/editar post, pedir ajuste, rejeitar, reabrir | sim | sim | não | não |
| Aprovar post (sessão de pessoa) | sim | não | não | não |
| Registrar resultado de publicação | só a chave técnica (agente local) | não | não | não |
| Gravar métricas do Instagram | sim | não | não | não |

## Regras de papel novo

- Só leitura: nenhum POST além de trocar a própria senha e sair.
- O servidor barra a rota de qualquer aba que o papel não tem (403 `sem_acesso_a_aba`); papel apagado da configuração = 403 `papel_desconhecido`; KV da configuração fora = 503 (nunca libera).
- Áreas do hub (Vendas, Atendimento, Marketing, Dados, Sistemas, Documentos): o papel só vê cartões das áreas marcadas. `"@area"` na lista de papéis de um cartão libera para qualquer papel NOVO que tenha a área do cartão; robert, admin e sdr seguem a lista explícita.
- Atalho não é controle de acesso: cada sistema tem o seu próprio login.

## Regra de ouro do Instagram

Aprovar na Central só registra a decisão do dono. A publicação é só do agente local (token no Keychain) e só se `GET /central/instagram/verificar` disser `publicar:true`: aprovação do dono, de pessoa (não da chave técnica), com o hash do conteúdo atual (tipo, legenda, texto alternativo, mídias na ordem, miniatura, dia, hora e links). Qualquer edição derruba a aprovação.
