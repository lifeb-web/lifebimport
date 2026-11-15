# Central: o que a página já faz e o que o servidor (Bia / Ana) precisa fazer

Escrito em 17/11/2026. Nada abaixo foi publicado. A página só usa rotas que já existem.

## 1. Login que persiste (parte do servidor)

**Página (pronta):** caixa "Manter conectado neste aparelho" (marcada por padrão no app instalado; no navegador comum vem desmarcada e lembra a última escolha). Marcada: o acesso fica em `localStorage` (`central_t_p`). Desmarcada: `sessionStorage` (some ao fechar a aba). Só 401, 403 e 404 de `/eu` apagam o acesso; rede caída, 429 e 5xx NÃO desconectam (aparece "Tentar de novo"). "Sair" chama `/acesso/sair`, limpa tudo e, se o servidor não confirmou, avisa na tela de login. A tela mostra "Conectado até <hora>" (barra lateral, rodapé do topo e Minha conta) usando o campo `expiraEm` que o login já devolve; ao vencer, volta ao login com a mensagem "A sua sessão acabou <hora>".

**Servidor (pendente, `central_acesso.js`):**
- `POST /acesso/entrar` já recebe `manter: true|false` no corpo (a página manda; hoje é ignorado).
- Com `manter: true`: sessão de **30 dias** (`SESSAO_S = 30*86400`, TTL do KV igual) e `expiraEm` coerente. Sem `manter`: continua 12 h.
- Renovação deslizante é opcional (cada uso estende até o teto de 30 dias); sem ela, o app pede senha a cada 30 dias.
- `POST /acesso/sair` já apaga a sessão no KV (nada a mudar).
- Recomendado: ao trocar a senha, apagar as outras sessões do usuário (hoje a sessão antiga continua valendo).
- `/eu` devolver também `expiraEm` (a página hoje só sabe a validade pelo que o login devolveu; no app migrado de sessionStorage, mostra "Conectado" sem hora).
- Risco aceito: o token em `localStorage` pode ser lido por qualquer script da página (a Central não carrega scripts de terceiros). Por isso a caixa vem desmarcada em navegador comum.

## 2. Simulador como chat (parte do servidor)

**Página (pronta):** chat com balões, "digitando", vários balões por resposta, histórico (guardado no aparelho, até 15 conversas, apagado ao sair), Reiniciar, limite visível, erro com "Tentar de novo".

**Limite da rota atual (`POST /agentes/simular`, `{mensagens:[...]}`):** ela NÃO guarda a conversa. A cada mensagem a página reenvia todas as mensagens do lead desde o começo e o servidor refaz tudo (IA real a cada turno anterior). Consequências: custo cresce em escada (n chamadas de IA por mensagem n), teto de 12 mensagens, 60 simulações por hora (cada mensagem enviada conta uma), e a Ana pode responder diferente nos turnos antigos. A página avisa quando isso acontece ("respondeu diferente em N mensagens anteriores").

**O que faltaria, sem criar um produto novo:**
- Aceitar `{historico:[{lead, ana:[...]}], nova:"texto"}` (ou devolver um `estado` opaco da conversa simulada e aceitá-lo de volta) para rodar só o turno novo.
- Elevar ou remover o teto de 12 e contar 1 simulação por turno novo.
- Opcional: devolver tempo sugerido de "digitando" por balão (hoje a página calcula pelo tamanho do texto).

## 3. Outros pontos já tratados só na página
- Link por aba, volta do navegador, rolagem e foco preservados, exportar conversa (texto e PDF): não dependem do servidor. A exportação usa `/agentes/historico` (100 por página, `antes=<ts>`), já existente.
- Nome do lead curto (2 palavras) e nome da empresa (até 4 palavras): a lista só mostra a empresa se `/agentes` trouxer `empresa` (string ou `{fantasia,razao}`) por conversa; hoje a empresa de um card aparece depois que a conversa é aberta uma vez (vem de `/agentes/conversa`). Pedido ao servidor: incluir `empresa:{fantasia,razao}` na lista de conversas assim que o CNPJ for consultado.
