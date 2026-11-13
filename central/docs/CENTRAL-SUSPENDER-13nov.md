# Central: suspender e liberar envios por instrução (13/11/2026)

A Ana, quando uma instrução da equipe é um pedido INEQUÍVOCO de suspender ("não chama", "segura esse lead"), já suspende sozinha. Quando o pedido PARECE suspensão mas não é inequívoco, ela NÃO pausa: marca `pedidoSuspensao` e a Central pergunta.

## O que a Central mostra (feito)
- `enviosSuspensos` na visão da conversa: faixa âmbar "Envios automáticos suspensos por instrução" (com quem pediu, quando e o texto) e o botão **Liberar envios**.
- `pedidoSuspensao` (sem `enviosSuspensos`): faixa "Isto parece um pedido para suspender os envios. Confirmar?" com **Suspender envios** e **Não é isso** (o "Não é isso" só esconde o aviso neste aparelho, por pedido).
- A faixa aparece/some sozinha quando a visão muda (assinatura do redesenho inclui os dois campos).

## Contrato com o servidor
Visão `GET /agentes/conversa?fone=` (Bia, vinda de `ConversaDO.visao()` da Ana) já traz:
`enviosSuspensos: { ts, quem, texto } | null` e `pedidoSuspensao: { ts, quem, texto } | null`.

Controle `POST /agentes/conversa/controle { fone, acao }`:
- **Liberar envios** usa `acao: "retomar"` (já aceita no proxy da Bia; no Worker da Ana `retomar` zera `enviosSuspensos`/`pedidoSuspensao`, despausa e marca a instrução como resolvida).
- **Suspender envios** usa `acao: "suspender"`. O Worker da Ana (`/admin/conversa/controle`) já aceita. **O proxy da Bia ainda NÃO**: `src/central_agentes.js` (rota `/agentes/conversa/controle`) só permite `["assumir","devolver","pausar","retomar"]`. **Falta acrescentar `"suspender"` nessa lista** (um item) e repassar sem mudança.

## Degradação enquanto o proxy da Bia não aceita "suspender"
Se a resposta for 400 `pedido_invalido`, a Central tenta `pausar` e avisa: "Pausei a Ana nesta conversa, mas o servidor ainda não suspende os envios automáticos (falta atualizar a Bia). Os avisos agendados ainda podem sair." (pausar não cancela os retornos agendados; só `suspender` faz isso).
