"""Checklist de entregas do Ecossistema, posição de 14/11/2026 (17h). Fonte: pendências mestre e artefatos de status (Ana, Hoje, Central).
Estados: ok = no ar e conferido; te = pronto, em teste ou aguardando auditoria; pl = planejado; de = depende de decisão da gestão.
Regra da casa: nada aparece como "no ar" se ainda tem pendência declarada; a pendência vai na coluna "Prova ou pendência"."""

# (grupo, entrega, estado, prova ou pendência)
CHECK = [
 ("Ana", "Conversa completa: abertura, apresentação em capítulos, qualificação e repasse", "ok", "No ar desde 13/11. Pendência conhecida: o endereço (rua e CEP) não grava no repasse; a correção está pronta e espera a publicação da Bia."),
 ("Ana", "Voz: responde em áudio quando o lead manda ou pede", "ok", "No ar, com voz reserva e queda para texto se algo falhar."),
 ("Ana", "Assumir, instruir e devolver pela página Central (texto ou áudio), pausa e 👍/👎", "ok", "No ar. Desfazer do 👍/👎 está em teste."),
 ("Ana", "Monitoria: leitura de cada resposta em conversa real, com correção orientando a próxima", "ok", "Ligada. Revisão independente e prova ao vivo da orientação estão na fila."),
 ("Ana", "Vigia do webhook do número da Ana na Meta (confere a cada 5 minutos e recoloca se sumir)", "ok", "No ar. Nasceu do desaparecimento do webhook ocorrido em 12/11: se sumir de novo, o vigia recoloca e avisa."),
 ("Ana", "Primeiros ajustes de conversa: número do time só quando o lead pede, lojista nunca descartado por engano, pergunta direta de compra barrada, toques sem repetir modelo, CNPJ inexistente avisa uma vez", "ok", "No ar desde 15/11."),
 ("Ana", "Camada de entrega para falha da Meta na abertura: um reenvio por modelo de utilidade; se falhar, espera o lead e cria tarefa humana com alerta", "ok", "No ar desde 15/11; fumaça ok e auditor independente liberou. O primeiro caso real já gerou o reenvio agendado; o resultado do envio ainda será confirmado."),
 ("Ana", "Pacote 1: instrução da equipe que manda e encerra; fora do perfil inclui vendedor de sistema; CNPJ baixado ou inapta tratado", "ok", "No ar desde a noite de 16/11."),
 ("Ana", "Cadência de 3 toques com mensagens de utilidade", "pl", "Planejado: ainda não existe."),
 ("Ana", "Juízes de IA como guarda-corpo em tempo real", "pl", "Planejado: ainda não existe."),
 ("Ana", "Texto pronto das páginas conta só como saudação, mesmo emendado", "pl", "Na fila, atrás de chave desligada."),
 ("Ana", "Objeções entendidas por IA, e não por lista de palavras", "pl", "Na fila."),
 ("Ana", "Imagem e áudio nunca viram fala do lead", "pl", "Na fila."),
 ("Ana", "Prova social por estado (uma vez, de forma proativa)", "de", "A lista de clientes por estado precisa de confirmação de grafia e de quais são clientes."),
 ("Ana", "Personalização pelo CNPJ: segmento, loja nova, estado e filiais", "pl", "Na fila."),
 ("Ana", "Cadência de abertura em poucos toques (abertura, caso ou pergunta, valor, encerramento) e agrupamento de mensagens seguidas", "ok", "No ar no patch 1.2. Quem para de responder no meio da conversa recebe toques de retomada; fora do foco, menos."),
 ("Ana", "Treino comercial da diretoria (frases aprovadas, só público foco)", "of", "Pronto e desligado. Só liga depois de revisão, simulação com IA real e OK da diretoria."),
 ("Ana", "Qualificou: o negócio da Ana vira Ganho e nasce o negócio no SDR Inbound (etapa \"Ana qualificou\", dono SDR); o Arena só nasce quando o SDR qualifica pela página Hoje", "ok", "Modelo de funis em vigor em 16/11. Confirmar no ar a cada deploy da Ana e da Bia."),
 ("Bia", "Trava de folga não segura gestão, administradores e SDR; cutucada respeita o horário de cada um", "ok", "No ar desde 14/11."),
 ("Bia", "Funil da Ana mapeado por nome de etapa, com chave de emergência", "ok", "No ar desde 14/11."),
 ("Bia", "Empresa que já existe (CNPJ duplicado) é vinculada, sem erro", "ok", "No ar desde 14/11."),
 ("Bia", "Avisos da Ana ao SDR entre 7h e 21h, também em fim de semana", "ok", "No ar desde 14/11."),
 ("Bia", "Fechamento automático \"Cadência esgotada\" do funil da Ana", "of", "Implementado e DESLIGADO de propósito, até fechar a lista de proteções do auditor."),
 ("Bia", "Observação do SDR só do SDR (Lista, repasse da Ana, Recuperação e webhook param de gravar texto automático)", "pl", "Próximo deploy da Bia."),
 ("Bia", "Servidor do Hoje 2.0 (rota da fila do espelho) e limite por clique", "of", "Código no ar na Bia de 15/11 às 04h49; o limite no servidor está DESLIGADO e o espelho segue em sombra, sem uso real."),
 ("Bia", "Limpeza de avisos (menos ruído); cópia automática de avisos ao gestor desligada", "ok", "No ar desde a noite de 16/11."),
 ("Bia", "Aviso NOVO LEAD com vigia de reenvio e pacote do Arena", "ok", "No ar na Bia de 15/11 às 04h49. Achado médio da auditoria: o vigia enxerga só os 100 primeiros registros; correção prevista."),
 ("Bia", "Reenvio automático quando a Meta recusa a ENTREGA do aviso", "lm", "Falha de ENVIO entra na fila e é reenviada; falha de ENTREGA recusada pela Meta fica registrada e ainda não gera reenvio automático (planejado)."),
 ("Bia", "Backup da memória da Bia fora do ambiente de trabalho", "pl", "Na fila."),
 ("Bia", "Motor Proativo com \"tentar até dar certo\" e \"não houve ligação\" gravando nota", "pl", "Na fila."),
 ("Hoje", "Release 1 da página: fila completa em linhas por lista, limite por clique sem Iniciar TODOS, minimizar o lead, observação do SDR e balão lilás", "ok", "No ar desde 14/11 às 17h42. O SDR precisa recarregar a aba. As partes que dependem do servidor estão em linhas próprias da Bia."),
 ("Hoje", "Espelho do Hoje 2.0 em modo sombra, sem uso real", "ok", "Desde 14/11. Só copia e compara; a página passa a ler dele quando a divergência ficar abaixo de 0,5% por 5 dias úteis."),
 ("Hoje", "Mesa do SDR sem travas de horário, fila por listas, leitura incremental de tarefas atrasadas e qualificação que cria o negócio no funil certo", "ok", "No ar."),
 ("Hoje", "Hoje 2.0 (página lendo do espelho) e release 2: blindagem de erros e modo foco", "pl", "Planejado."),
 ("Dash", "Dash expandido", "pl", "Planejado: ainda não existe."),
 ("Hoje", "Release 3: raia do closer no kanban, com ganho exigindo valor e data", "pl", "Na fila; antes, estudo do kanban atual."),
 ("Central", "Atendimento: tela cheia, atalho para o Life B Solicita, link direto por conversa", "ok", "No ar desde 13/11."),
 ("Central", "Pacote de 15/11: link por aba, rolagem preservada, exportar conversa, simulador em chat e login que persiste", "ok", "No ar desde 15/11 ."),
 ("Central", "Arquivar conversas, cancelar toques, áudio da equipe, sinal \"Fora do foco\" pela regra da Ana", "pl", "A conferir no commit de 15/11; não consta nesta lista como entregue."),
 ("Central", "Pacote Central: botões com confirmação que leem de volta, selos do CRM e do início agendado, lista leve e auditoria enxuta", "te", "Pronto, em implantação: ainda não está no ar; entrada prevista para 17/11 às 9h."),
 ("Central", "Controles manuais completos: dar ganho, dar perdido com motivo, repassar ao SDR Inbound e editar dados do lead (nome, empresa, CNPJ, segmento, lojas, decisor) com registro de quem fez e a Ana enxergando", "pl", "Planejado (origem: levantamento de 16/11 e registro de decisões). O desenho será mostrado antes de publicar."),
 ("Central", "Silenciar a Bia por pessoa", "pl", "Na fila."),
 ("Painel do Representante", "Painel ao vivo da carteira com ações do dia", "ok", "No ar. Correções de recarga em horário comercial estão prontas e aguardam auditoria."),
 ("SDR e cadência", "Cadência por dia útil, repasse com trava, inbound direto, Subir lista e enriquecimento por CNPJ", "ok", "No ar desde 20/10."),
 ("SDR e cadência", "Recuperação SDR, Recuperação e Reativação", "ok", "Em operação; revisão dos prazos prevista para a semana de 18/11, junto com a revisão das cadências com dados reais."),
 ("Plataforma", "Roteiro único de publicação com cópia de segurança, varredura e antirregressão", "ok", "No ar. A exigência de antirregressão da Ana espera o primeiro deploy para ser exercitada."),
 ("Plataforma", "Este Ecossistema refeito (estrutura, fluxogramas, modo apresentação)", "te", "Pronto em disco; publica depois do teste visual e do auditor independente."),
 ("Plataforma", "Mineração de leads (itens de qualidade e duplicidade)", "pl", "Em evolução, na fila."),
 ("Plataforma", "Meta: arquivar modelos antigos de mensagem", "pl", "Só depois de os modelos novos ficarem estáveis."),
]

# o que depende da gestão (sem nomes)
DEPENDE = [
  "Confirmar a grafia e quais empresas citar na prova social por estado.",
 "Decidir o que fazer com o negócio da Ana que nunca fecha (hoje fica aberto em Encerrado e Sem resposta).",
 "Renovar, se a gestão quiser, a trava de segurança do ambiente de desenvolvimento, que tem prazo de validade.",
]

def contagem():
    c = {"ok": 0, "te": 0, "pl": 0, "de": 0, "lm": 0, "of": 0}
    for g, i, s, p in CHECK:
        c[s] += 1
    return c
