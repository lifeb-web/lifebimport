# Publicar as 5 páginas (19/11/2026) — roteiro. NADA foi publicado.

Base atual no ar: gh-pages 70df1546. Árvore pronta: branch `paginas-integracao` (/tmp/pg_integ), 5 merges + regeneração do Ecossistema; `hoje/felipe/index.html` idêntico ao do ar (diff = 0).

## 1. Workers primeiro (a página nunca pode chamar rota que ainda não existe)
1. Bia (gs-agendor-worker) deploy 2: rotas da Central novas (`/central/playbook`, `/usuarios`, `/usuarios/ativo`, `/acesso/senha`, `/hub/config`, `/instagram/{fila,decisao,post,reabrir,metricas}`). Fumaça sem token: cada rota responde 401 (não 404). Atenção: hoje QUALQUER /central/* sem token responde 401 (provado), então 401 sozinho NÃO prova que a rota nova existe: conferir com sessão do Robert (200 em /central/playbook).
2. Ana deploy 2 + worker do Dash (números por lead / sem testes usados por `dash/geral/agentes.js`).
3. Servidor do painel (lifeb-rep-painel) A PARTIR DA branch `painel-rep-refino-wk` (nunca da main; conferir `git diff --stat a57bb7b HEAD` e a versão no ar, ver source/PUBLICAR-painel-rep-refino-19nov.md). Compatível com a página antiga. A trava `flag_exige_confirma_tipo` só DEPOIS das páginas.
Cada worker: deploy.sh, "Deploy concluído" visto, GET de prova.

## 2. Páginas: UMA publicação só (recomendado), não cinco
Motivos: (a) os arquivos são disjuntos exceto Ecossistema x Central (já resolvido), então o risco de uma junta é igual ao das separadas; (b) o texto do Ecossistema sobre a aba Usuários foi escrito supondo a Central junto; (c) um único rollback. Exceção: se algum worker (item 1) não subir, tirar a página dependente com `git revert -m 1 <merge>` do respectivo merge ANTES de publicar (Central e playbook dependem do Bia deploy 2; Painel do Rep do servidor do painel; Dash da Ana/Dash worker; Ecossistema não depende de worker, mas fala da Usuários: se a Central ficar de fora, reverter o texto, ver MERGE-PAGINAS.md).
Cada página sozinha, se preferir, na ordem Painel Rep, Dash, Playbook, Ecossistema, Central (ver comandos abaixo).

## 3. Comando exato (sem force; só avança)
```
cd /tmp/pg_integ
git fetch origin gh-pages && git merge-base --is-ancestor origin/gh-pages HEAD && echo DESCENDE   # tem que imprimir DESCENDE
[ "$(git rev-parse origin/gh-pages)" = 70df15462283ac70cd01f71962dee7bc0e26dbea ] || echo "gh-pages MUDOU: refazer merge sobre o novo"
git diff --stat origin/gh-pages HEAD -- hoje/felipe/index.html      # tem que ser vazio
git diff --name-status origin/gh-pages HEAD | grep -E '^(D|R)'      # tem que ser vazio
git push origin HEAD:gh-pages                                        # SEM --force
```
Se a gh-pages andou (ex.: nova versão da Hoje): `git merge origin/gh-pages` na árvore, rerodar as suítes e só então empurrar. Publicar uma por vez (alternativa): `git push origin <merge-da-página>:gh-pages` na ordem acima, cada um descendendo do anterior.

## 4. Links entre páginas (verificado na árvore integrada)
- `central/cards.json`: 47 cartões; todo cartão com caminho interno (/dash/geral/, /hoje/felipe/, /ecossistema/, kits, LPs...) aponta para arquivo que existe. 
- Playbook: o cartão `playbook-comercial` está `em_publicacao` SEM url, e a Central não tem nenhum link para /playbook/. Ou seja, publicar a Central antes do worker/da página do playbook mostra o cartão amarelo "Em publicação" sem link (o usuário não consegue clicar em nada quebrado; a regra de links do hub ainda reprova url em cartão fora de no_ar). Depois que /playbook/ estiver no ar e o worker responder, 2º commit pequeno: cartão vira `no_ar` + `"url":"/playbook/"` (rodar `node central/tests/hub_jsdom.cjs`).
- Painel do Representante: cartão `painel-rep` está `a_confirmar` sem url (o endereço é do worker, por pessoa). As páginas /rep/dash/<nome>/ existem. Nada a mudar.
- Se /playbook/ for publicada ANTES do worker (ou sem Bia deploy 2): a página abre e mostra "Não foi possível abrir o playbook" (3 tentativas, botão Tentar de novo), ou "Entre na Central" se não houver sessão; o conteúdo do playbook NUNCA está na página (só vem do worker com a sessão da Central). Hoje /playbook/ responde 404 no ar (provado).
- Ecossistema ("/ecossistema/", cartão no_ar) já existe no ar e continua.

## 5. Fumaça pós-publicação (esperar ~1-2 min do Pages)
```
for u in /central/ /playbook/ /ecossistema/ /dash/geral/ /dash/geral/telao/ /hoje/felipe/ /rep/dash/felipe/ /lista/; do printf "%s " $u; curl -s -o /dev/null -w '%{http_code}\n' "https://projetojlbv.com.br$u"; done      # todos 200
curl -s https://projetojlbv.com.br/central/ | grep -c 'instagram/fila'            # >0 (Central nova)
curl -s https://projetojlbv.com.br/playbook/ | grep -c 'central/playbook'          # >0
curl -s https://projetojlbv.com.br/ecossistema/ | grep -c 'Aba Usuários'           # >0 (texto novo)
curl -s https://projetojlbv.com.br/dash/geral/agentes.js | grep -c 'porLead\|_core' # >0
curl -s https://projetojlbv.com.br/rep/dash/felipe/ | grep -c 'milh'               # >0 (teto de R$ 1 milhão do refino)
curl -s https://projetojlbv.com.br/hoje/felipe/ | md5; git -C /tmp/pg_integ show origin/gh-pages:hoje/felipe/index.html | md5   # iguais
```
Comparar cada resposta com o arquivo da árvore (`curl ... | cmp - arquivo`) quando o Pages já tiver atualizado. Depois: sessão real do Robert abre Central > Início, Usuários, Instagram, e /playbook/ com conteúdo.

## 6. Rollback
`git push origin 70df15462283ac70cd01f71962dee7bc0e26dbea:gh-pages --force-with-lease=gh-pages:<hash-novo>` (é o único caso de push que recua; só com OK do Robert), ou preferível: `git revert -m 1 <merge>` por página e push normal. Workers: versão anterior pelo wrangler (`versions`/`rollback`) de cada um.
