# Central: Desfazer 👍/👎 (13/11/2026)

Pedido do Robert: deu 👍 sem querer numa mensagem da Ana e não havia como desfazer (o 👍 vira exemplo de aprendizado e passa a influenciar as respostas).

## O que já funciona só na Central (sem mudar servidor)
- Ao marcar 👍 ou 👎 (com ou sem correção), o feedback **só é enviado depois de 8 s**. Nesse tempo aparece "Feedback registrado. Será enviado em instantes." com o botão **Desfazer**. Se desfizer a tempo, **nada vai ao servidor** (o 👎 volta ao campo com o texto digitado).
- Se a página for ocultada ou fechada durante os 8 s, o feedback pendente é enviado na hora (nada se perde).
- Depois de enviado aparece "Anotado" + **Desfazer** (guardado no aparelho por 7 dias, sobrevive a recarregar a página).

## O que falta no servidor para o Desfazer DEPOIS de enviado funcionar
Hoje, se a rota não existir, a tela avisa com clareza ("Ainda não dá para desfazer um feedback já enviado por aqui") e **não finge** que desfez.

### 1) `POST /agentes/feedback` (já existe) deve devolver o id
Resposta: `{ ok: true, id: "<chave fb_...>" }`.

### 2) Nova rota na Bia (proxy, mesma autenticação e mesmo papel do feedback): `POST /agentes/feedback/desfazer`
Corpo enviado pela Central: `{ fone, id|null, nota (1 ou -1), ana (texto da Ana), lead (texto do lead), correcao }`.
Repassa para o Worker da Ana: `POST /admin/feedback/desfazer` (x-admin-key).

### 3) Comportamento no Worker da Ana (`/admin/feedback/desfazer`)
1. Achar o registro `fb_*` por `id`; se não vier id, pela combinação mais recente de `nota` + texto da Ana + texto do lead.
2. **Backup antes de apagar** (como `scripts/neutralizar_exemplo.py`: arquivo/chave com o conteúdo, para desfazer o desfazer).
3. Apagar o `fb_*`.
4. Se a nota foi 👍 (origem "aprovado") ou 👎 com correção (origem "correção"), **remover também o exemplo correspondente de `ex_todos`** (casar pelo texto da Ana) e invalidar o cache dos exemplos.
5. Idempotente: repetir devolve `{ ok: true, removido: { fb: 0, exemplos: 0 } }`.
6. Resposta: `{ ok: true, removido: { fb: n, exemplos: n }, backup: "<onde>" }`; auditoria registrando quem desfez.
7. Erros: 404 se nada casar (a Central mostra "não achei esse feedback"); 4xx/5xx com `mensagem` em português.

## Também no `/agentes/config` da Bia
A Central agora edita estes campos da Ana (todos já aceitos pelo `config.js` do Worker da Ana; conferir que a lista de campos permitidos do proxy da Bia também aceita): `qualificacao.perguntarFaturamento`, `qualificacao.lojasSoRedes`, `qualificacao.apresentacaoTurnosMax`, `qualificacao.capitulosPorTurno`, `identidade.ligada`, `identidade.alerta`, `identidade.central`, `identidade.cancelarAbertura`, `identidade.janelaH`, `identidade.ativoH`. O campo `qualificacao.perguntarDisposicao` foi de propósito **deixado fora** da tela (a Ana não usa mais "investir").
