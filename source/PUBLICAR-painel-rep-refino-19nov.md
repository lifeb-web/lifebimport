# Publicar: Painel do Representante, refino de 19/11/2026

## ATENÇÃO MÁXIMA: de onde sai o deploy do servidor
O servidor do painel (`~/Desktop/lifeb-rep-painel`) tem 807 linhas **sem remoto** na branch `wip/preservar-17nov-painel` (contador de chamadas ao CRM, prewarm do cron, TTL de 5 dias, trabalho de 14/11).
**O deploy DEVE sair da branch `painel-rep-refino-wk` (worktree `/tmp/rep_wk`), que contém a wip. NUNCA da `main` (f7b8be4): isso REVERTERIA o que já está no ar.**
Antes de subir, comparar o que está no ar com o que vai subir:
```
cd /tmp/rep_wk && git log --oneline -6          # tem que mostrar a wip a57bb7b por baixo dos commits do refino
git diff --stat a57bb7b HEAD                     # só src/index.js e tests do refino
npx wrangler deployments list                    # versão atual no ar e data
npx wrangler versions view <id-da-versão-atual>  # conferir que o código no ar = wip a57bb7b (se divergir, PARAR e avisar o dono)
npm test                                         # 743 + tipo_ganho
```

NADA disto foi publicado. Ordem obrigatória (servidor primeiro, página depois, trava por último):

1. **Servidor** (ver o quadro acima; repositório `~/Desktop/lifeb-rep-painel`, branch `painel-rep-refino-wk`, parte da `wip/preservar-17nov-painel`, que já tem 807 linhas sem remoto: decidir se entra no `main`). Rodar `npm test` (743 + 101), depois o deploy do próprio projeto. Compatível com a página antiga (a trava fica desligada).
2. **Página**: `git -C /tmp/pg_rep` (branch `painel-rep-refino`, base gh-pages 70df1546). Os 10 painéis já foram regenerados por `python3 source/resync-paineis.py` (conferido: antes todos eram idênticos ao molde antigo, então o único diff é este refino). Rodar `node source/tests-rep/painel_jsdom.cjs` e `node source/tests-rep/mutacao_painel.cjs` antes de empurrar. Rollback: gh-pages 70df1546.
3. **Trava de reposição** (só depois de conferir que os painéis novos abrem): no KV `LEADS_CACHE` do worker `lifeb-rep-painel`, chave `flag_exige_confirma_tipo` = `1`. Desligar = apagar a chave. Com ela ligada o servidor recusa ganho de Pós-venda/Reativação sem resposta (painel velho em cache de celular quebraria nesse ganho: por isso por último).

## O que muda para o representante
- Ao marcar ganho de reposição/reativação (ou de cliente que já tem reposição aberta): quadro grande com cliente, valor, data e 2 botões. A resposta vai numa nota no negócio e no aviso que já existe.
- Valor 100x diferente do estimado (campo conta centavos: 5200 vira R$ 52,00) pergunta "o valor está certo?".
- Fila por urgência (sem tarefa/atrasada, hoje, futura), banner "Próximo atendimento", letra maior ligada por padrão (botão Aa), zoom do navegador liberado, lista recente não volta atrás, aviso de reagendamento com data dd/mm/aaaa.

## Decisões do dono antes de publicar
1. Letra maior ligada por padrão para todos? (muda bastante o visual; 1 toque desliga.)
2. "Não, é venda nova" em negócio de reposição: hoje bloqueia o ganho e manda falar com o escritório. Alternativa: deixar passar e avisar o escritório.
3. Negociação com tarefa atrasada passa a subir na fila (antes Negociação ficava sempre no fim).
4. Ligar a trava `flag_exige_confirma_tipo`.
5. Texto "via Painel do Rep" nos avisos de WhatsApp ficou como está (outro sistema pode ler esse texto).

## Notas técnicas
- Dinheiro: o campo agora entende REAIS (5200 = R$ 5.200,00; 5.200; 5.200,50; 5,2k). Antes contava centavos. Mostra "Valor entendido: R$ ..." ao lado; recusa negativo, letras e acima de R$ 99.999.999,99; nunca corta dígito.
- Tipo do negócio no servidor passou a usar o ID do funil (890331 Aquisição, 907387 Pós-venda, 909368 Reativação, como o Dash). Funil nulo ou desconhecido = "indefinido": a página pergunta; com a flag ligada o servidor recusa sem resposta.
- CSP (meta Content-Security-Policy): NÃO adicionada. O molde depende de `onclick` e scripts inline (exigiria `unsafe-inline`, o que tira quase todo o ganho) e do OneSignal (domínios, iframe e service worker não verificados ao vivo: uma CSP errada derrubaria as notificações em silêncio). Fazer depois, em separado, com teste real de notificação.
