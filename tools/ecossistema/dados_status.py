"""Checklist de entregas do Ecossistema, posição de 14/11/2026 (17h). Fonte: pendências mestre e artefatos de status (Ana, Hoje, Central).
Estados: ok = no ar e conferido; te = pronto, em teste ou aguardando auditoria; pl = planejado; de = depende de decisão da gestão.
Regra da casa: nada aparece como "no ar" se ainda tem pendência declarada; a pendência vai na coluna "Prova ou pendência"."""

# (grupo, entrega, estado, prova ou pendência)
CHECK = [
 ("Ana", "Conversa completa: abertura, apresentação em capítulos, qualificação e repasse", "ok", "No ar desde 13/11. Pendência conhecida: o endereço (rua e CEP) não grava no repasse; a correção está pronta e espera a publicação da Bia."),
 ("Ana", "Voz: responde em áudio quando o lead manda ou pede", "ok", "No ar, com voz reserva e queda para texto se algo falhar."),
 ("Ana", "Assumir, instruir e devolver pela Central (texto ou áudio), pausa e 👍/👎", "ok", "No ar. Desfazer do 👍/👎 está em teste."),
 ("Ana", "Monitoria: leitura de cada resposta em conversa real, com correção orientando a próxima", "ok", "Ligada. Revisão independente e prova ao vivo da orientação estão na fila."),
 ("Ana", "Vigia do webhook do número da Ana na Meta (confere a cada 5 minutos e recoloca se sumir)", "ok", "No ar. Nasceu do desaparecimento do webhook ocorrido em 12/11: se sumir de novo, o vigia recoloca e avisa."),
 ("Ana", "Fase 1 de correções: especialista só quando é closer, CNPJ confirmado uma vez, baixada/inapta e inválido, instrução \"agora\" uma única vez, dados editáveis", "te", "Pronta em disco. Falta rodada completa de testes, auditoria independente e publicação."),
 ("Ana", "Texto pronto das páginas conta só como saudação, mesmo emendado", "pl", "Na fila, atrás de chave desligada."),
 ("Ana", "Objeções entendidas por IA, e não por lista de palavras", "pl", "Na fila."),
 ("Ana", "Imagem e áudio nunca viram fala do lead", "pl", "Na fila."),
 ("Ana", "Prova social por estado (uma vez, de forma proativa)", "de", "A lista de clientes por estado precisa de confirmação de grafia e de quais são clientes."),
 ("Ana", "Personalização pelo CNPJ: segmento, loja nova, estado e filiais", "pl", "Na fila."),
 ("Ana", "Cadência de retomada em 3 toques com agrupamento de mensagens seguidas", "pl", "Hoje valem até 5 toques."),
 ("Ana", "Treino comercial da diretoria (frases aprovadas, só público foco)", "of", "Pronto e desligado. Só liga depois de revisão, simulação com IA real e OK da diretoria."),
 ("Ana", "Ganho automático em rede qualificada e repasse que troca o mesmo negócio de funil", "de", "Desenho aguarda confirmação da gestão; a Bia já aceita os motivos de encerramento."),
 ("Bia", "Trava de folga não segura gestão, administradores e SDR; cutucada respeita o horário de cada um", "ok", "No ar desde 14/11."),
 ("Bia", "Funil da Ana mapeado por nome de etapa, com chave de emergência", "ok", "No ar desde 14/11."),
 ("Bia", "Empresa que já existe (CNPJ duplicado) é vinculada, sem erro", "ok", "No ar desde 14/11."),
 ("Bia", "Avisos da Ana ao SDR entre 7h e 21h, também em fim de semana", "ok", "No ar desde 14/11."),
 ("Bia", "Fechamento automático \"Cadência esgotada\" do funil da Ana", "of", "Implementado e DESLIGADO de propósito, até fechar a lista de proteções do auditor."),
 ("Bia", "Observação do SDR só do SDR (Lista, repasse da Ana, Recuperação e webhook param de gravar texto automático)", "pl", "Próximo deploy da Bia."),
 ("Bia", "Teto de 50 por clique imposto no servidor e rota da fila do espelho", "pl", "Próximo deploy da Bia."),
 ("Bia", "Reenvio automático quando a própria Meta falha a entrega", "lm", "Hoje a falha de entrega da Meta fica registrada, mas não gera novo reenvio automático."),
 ("Bia", "Backup da memória da Bia fora do ambiente de trabalho", "pl", "Na fila."),
 ("Bia", "Motor Proativo com \"tentar até dar certo\" e \"não houve ligação\" gravando nota", "pl", "Na fila."),
 ("Hoje", "Release 1 da página (versão 2026-11-14.1): fila de 1.138+ em linhas por lista, teto de 50 por clique sem Iniciar TODOS, minimizar o lead, observação do SDR e balão lilás", "ok", "No ar desde 14/11 às 17h42. O SDR precisa recarregar a aba. As partes que dependem do servidor estão em linhas próprias da Bia."),
 ("Hoje", "Espelho do Hoje 2.0 em modo sombra", "ok", "Desde 14/11. Só copia e compara; a página passa a ler dele quando a divergência ficar abaixo de 0,5% por 5 dias úteis."),
 ("Hoje", "Release 2: blindagem de erros e modo foco (tela cheia da página)", "pl", "Na fila."),
 ("Hoje", "Release 3: raia do closer no kanban, com ganho exigindo valor e data", "pl", "Na fila; antes, estudo do kanban atual."),
 ("Central", "Atendimento: tela cheia, atalho para o Life B Solicita, link direto por conversa", "ok", "No ar desde 13/11."),
 ("Central", "Arquivar conversas, cancelar toques, áudio da equipe, sinal \"Fora do foco\" pela regra da Ana", "te", "Pacote pronto em disco. Só publica depois dos deploys da Ana e da Bia."),
 ("Central", "3 botões manuais: dar ganho, dar perdido (com motivo) e repassar", "pl", "Na fila. Substitui o botão antigo de passar ao especialista."),
 ("Central", "Link por aba, sem pulo ao topo, login que persiste no celular, exportar conversa, silenciar a Bia por pessoa", "pl", "Na fila; causas dos bugs já provadas."),
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
 "Confirmar o desenho de ganho automático para rede qualificada (ganho na Ana e segundo negócio no Arena).",
 "Confirmar a grafia e quais empresas citar na prova social por estado.",
 "Decidir o que fazer com o negócio da Ana que nunca fecha (hoje fica aberto em Repassado, Encerrado e Sem resposta).",
 "Renovar, se a gestão quiser, a trava de segurança do ambiente de desenvolvimento, que tem prazo de validade.",
]

def contagem():
    c = {"ok": 0, "te": 0, "pl": 0, "de": 0, "lm": 0, "of": 0}
    for g, i, s, p in CHECK:
        c[s] += 1
    return c
