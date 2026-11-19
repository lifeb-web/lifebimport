"""Seções 9 a 15 do Ecossistema."""
from comp import *
from diagramas import fig

def s_cadencia():
    corpo = (
      '<p>Cadência é a sequência de contatos com um lead em dias combinados. Os dias contam sempre como <b>dias úteis</b>: segunda a sexta, sem feriado.</p>'
      + '<h3 class="mt">Outbound: a escada de dias</h3>' + fig("cad_out")
      + '<h3 class="mt">Inbound: cadência curta, só WhatsApp</h3>' + fig("cad_in")
      + '<h3 class="mt">O que a Bia cria em cada dia</h3>'
      + grid([
        card("Outbound", tabela(["Dia", "Tarefas"], [["D1", "Pesquisar a empresa (Google, Instagram, CNPJ), primeira mensagem no WhatsApp e ligar para quem decide"], ["D3", "WhatsApp de novo contato e WhatsApp com uma novidade, sem pedir nada"], ["D5", "Ligar e WhatsApp de novo contato"], ["D8", "Ligar e WhatsApp com novidade ou exemplo de loja parecida"], ["D10", "Ligar e WhatsApp de última tentativa, avisando que vai encerrar"]], "", "Tarefas do Outbound")),
        card("Inbound", tabela(["Dia", "Tarefas"], [["D0", "O lead chega e a Bia cria o negócio"], ["D1", "WhatsApp: primeira mensagem"], ["D2", "WhatsApp: novo contato"], ["D3", "WhatsApp: novo contato"], ["D4", "WhatsApp: última tentativa"]], "", "Tarefas do Inbound")),
      ], 2)
      + aviso("Horário das tarefas", "Toda tarefa da cadência vence às 18h, em dia útil. O texto começa com a etapa, por exemplo \"[OUT D3]\", e termina com o nome da loja.", "n")
      + '<h3 class="mt">Como o lead começa</h3>'
      + ul(["<b>Fila de espera (Outbound).</b> O lead da lista chega sem nenhuma tarefa. Em regra, nada começa sozinho.",
            "<b>Botão Iniciar.</b> O SDR escolhe quais leads começar, na página Hoje. Ao clicar, a Bia cria as tarefas do primeiro dia. Não existe meta diária imposta pelo sistema.",
            "<b>Contagem dos dias.</b> O primeiro dia é o primeiro dia útil em que a cadência pode começar; lead iniciado depois das 17h30 começa no próximo dia útil. A etapa só avança, nunca volta."])
      + '<h3 class="mt">O fim da cadência</h3>'
      + ul(["Passou o último dia sem resposta: o lead vai para o <b>Fim da cadência</b>. Na página Hoje, a coluna se chama \"Tentativas acabaram\".",
            "Três dias úteis de espera. O SDR pode marcar Ganho (respondeu e qualifica), Perdido (respondeu e não serve) ou Voltar para a cadência, escolhendo de qual etapa recomeçar.",
            "Sem ação em três dias úteis completos, a Bia relê o negócio e, se ninguém agiu, fecha como Perdido com o motivo \"Cadência esgotada\". Esse motivo é só da Bia.",
            "Se alguém leva o lead de volta para uma etapa anterior direto no Agendor, a Bia refaz a contagem a partir dali, com um limite diário."])
      + aviso("Cadência esgotada não é rejeição", "Quer dizer apenas que o lead nunca respondeu. Ele pode voltar, mas só pela Recuperação SDR.", "n")
      + '<h3 class="mt">Quando o lead é qualificado</h3>'
      + passos([("O SDR marca Ganho", "No SDR, isso significa \"lead qualificado\", e não venda."),
                ("A Bia confere se está completo", "Nome, CNPJ, segmento, aprovação de crédito, quantidade de lojas, faturamento, mais de 2 anos, disposição para investir, endereço e a observação do SDR. Se faltar algo, reabre o negócio e avisa o que falta."),
                ("Cria o negócio no Arena", "Uma única vez, com trava. Empresa, pessoa e negócio nascem no nome do SDR que qualificou, que continua com acesso nos três níveis."),
                ("O SDR distribui", "Pelo WhatsApp ou pela página Hoje, escolhe um representante ou fica com o lead. Até lá, nenhuma automação mexe nele. Passadas duas horas, a Bia manda um lembrete."),
                ("A Bia passa o negócio ao escolhido", "Empresa, pessoa e negócio mudam de dono, o SDR continua enxergando e a tarefa de primeiro contato nasce no nome do novo dono.")])
      + '<p class="legenda">Rede de segurança: a cada minuto a Bia confere se existe algum Ganho sem repasse e tenta de novo, com intervalos crescentes (1, 2, 4, 8 e 15 minutos), até dar certo ou avisar a gestão.</p>'
      + '<h3 class="mt">Motivos de perda</h3>'
      + grid([card("Podem voltar", "<p>Desistência, Prazo, Preço, Sem interesse e Sem retorno. Voltam ao SDR depois de um prazo.</p>"),
              card("Nunca voltam", "<p>Fora do perfil, Restrição de pagamento, Já está sendo atendido(a) ou já é cliente, Duplicado, Erro na construção da lista e pedido de não contato.</p>")], 2))
    return sec("cadencia", "Funis e cadência", "Cadência do SDR", "A escada de dias, o fim da cadência e o caminho até o representante.", corpo)

def s_recuperacao():
    corpo = (
      '<p>Quatro rotinas devolvem negócios ao SDR. Cada uma tem nome, regra e origem próprios, para o SDR nunca ficar em dúvida de onde veio o lead.</p>'
      + fig("volta")
      + tabela(["", "Recuperação SDR", "Recuperação", "Reativação"], [
        ["Quem volta", "Lead do próprio SDR que foi perdido e nunca foi para representante", "Negócio que um representante perdeu no Arena", "Cliente do Pós-venda que não repôs no prazo"],
        ["Quando", "14 dias depois da perda", "Depende do motivo: Sem retorno 14 dias, Prazo 21, Preço 30, Sem interesse e Desistência 60, outros recuperáveis 10", "75 dias sem repor nas drogarias; 45 nos supermercados"],
        ["Motivos aceitos", "Os que podem voltar e também Cadência esgotada", "Só os que podem voltar", "Não depende de motivo"],
        ["Limite por dia", "Poucos por vez e um teto por dia, para nunca despejar uma lista grande no SDR", "Idem", "Idem"],
      ], "", "As três voltas")
      + aviso("Segunda onda da Reativação", "Cliente perdido na Reativação por motivo que pode voltar volta ao SDR depois de 30 dias, com limite de 2 por rodada e 5 por dia.", "n")
      + '<h3 class="mt">O que é igual nas três</h3>'
      + ul(["O lead volta como <b>negócio novo</b> no SDR Outbound, na fila de espera, com o SDR como responsável. Em regra, nada começa sozinho: o SDR clica Iniciar.",
            "A cadência é curta e só de WhatsApp: retomar a conversa, novo contato e última tentativa.",
            "A nota do negócio conta de onde veio: quem perdeu, quando, o motivo e o link do negócio antigo. O negócio antigo nunca é reaberto.",
            "Uma empresa não recebe outra volta por 180 dias, nem outro cadastro com o mesmo CNPJ.",
            "Não volta quem tem negócio aberto, quem comprou depois ou quem já recebeu volta recentemente.",
            "Um lead perdido sem explicação do SDR espera ele contar o que houve.",
            "O aviso ao SDR é agrupado e só sai em dia útil, das 8h às 18h."])
      + '<h3 class="mt">Voltas encadeadas</h3>'
      + '<p>Se o negócio que voltou for perdido de novo por um motivo que pode voltar, ele pode voltar outra vez, com espera cada vez maior a cada tentativa sem resposta. Se o lead respondeu em alguma volta, a contagem recomeça. Em regra, o lead não é esquecido, só espaçado.</p>'
      + '<h3 class="mt">Como a Reativação nasce</h3>'
      + passos([("O Pós-venda conta os dias", "60 dias de espera mais 15 de janela para o representante repor: 75 nas drogarias; 45 nos supermercados (30 mais 15)."),
                ("Passou do prazo sem reposição", "A Bia cria o negócio novo no SDR Outbound, na fila, com a origem Reativação e a nota de onde veio."),
                ("Se o SDR qualificar", "O negócio vai ao funil de Reativação com o representante original, se ele ainda estiver no time. Se não estiver, fica com o SDR, que escolhe quem assume. O ciclo aberto do Pós-venda é fechado."),
                ("O representante é avisado", "Com aviso de lead novo, depois da aprovação da gestão, e a Bia cria a tarefa de primeiro contato no nome dele.")])
      + aviso("Em revisão", "Os prazos de Recuperação e as cadências curtas serão revistos com dados reais na semana de 18/11/2026. Esta página será atualizada junto.", "w"))
    return sec("recuperacao", "Funis e cadência", "Recuperação e reativação", "Quando e por que um lead perdido ou um cliente parado volta ao SDR.", corpo)

def s_bia():
    corpo = (
      '<p>A Bia é o conjunto de rotinas automáticas que opera o dia a dia comercial. Tem duas metades que trabalham juntas: um programa que roda continuamente na nuvem, verificando o Agendor a cada minuto e executando as regras no horário certo, e uma conversa por WhatsApp, em que a equipe pede informações e ações em linguagem natural.</p>'
      + grid([
        card("Escreve no Agendor", "<p>Cria tarefas, move etapas, passa o negócio ao representante que o SDR escolheu e fecha ciclos. Só diz \"feito\" depois de reler.</p>"),
        card("Avisa a equipe", "<p>WhatsApp para gestão, SDR e representantes, cada um com o que lhe cabe; muitos avisos trazem botões.</p>"),
        card("Confere", "<p>Compara o que foi feito com o Agendor e mantém o combinado, sem apagar histórico.</p>"),
        card("Tem modo e interruptor", "<p>Cada automação é desligada, só observa (simulação) ou vale de verdade, e pode ser pausada individualmente.</p>"),
      ], 4)
      + '<h3 class="mt">Funil da Ana por nome e vínculo de empresa</h3>'
      + grid([
        card("Funil da Ana por nome", "<p>A Bia identifica as etapas do funil da Ana pelo <b>nome</b>, e não por código. Se alguém renomear ou apagar uma etapa, ela não escreve em uma etapa errada. Há uma chave de emergência: desligada, a Bia só grava nota e não move nada.</p>", p="ok"),
        card("Vínculo de empresa", "<p>Se a empresa já existe no Agendor (mesmo CNPJ), a Bia vincula o negócio à empresa existente, em vez de dar erro ou duplicar.</p>", p="ok"),
        card("Reabertura e lead repetido", "<p>Lead que volta é tratado por status e nome: ganho é duplicata (avisa o SDR); perdido reabre; encerrado e sem resposta reabrem e a Ana retoma. Falha ao reabrir é erro com nova tentativa; nunca cria um segundo negócio da Ana.</p>", p="ok"),
        card("Fila durável de avisos", "<p>Aviso cujo envio falha entra em uma fila que dura 24 horas e é reenviada a cada 5 minutos, até 5 por rodada. Só conta como enviado quando o WhatsApp aceitou.</p>", p="ok"),
      ], 2)
      + '<h3 class="mt">Folga e horários: quem nunca é segurado</h3>'
      + ul(["Mensagem proativa a <b>representante</b> só sai em dia útil, das 8h às 18h (cobranças a partir das 9h). Feriados e dias extras de folga, marcados na página Central, valem para o envio.",
            "A <b>gestão, os administradores e o SDR nunca são segurados pela trava de folga</b>: avisos de lead e da Ana chegam em regra.",
            "A cutucada para manter a janela do WhatsApp aberta respeita o horário de cada um: o SDR nunca recebe de madrugada (0h às 6h); administradores entre 6h e 20h; a gestão sem limite.",
            "Quando o WhatsApp de alguém está com a janela fechada, as mensagens esperam em uma fila, visível na página Central por pessoa, com cópia guardada por 7 dias."])
      + '<h3 class="mt">Agendas e resumos</h3>'
      + tabela(["Quando", "O quê", "Para quem"], [
        ["6h", "Briefing do dia", "Gestão"], ["10h35", "Resumo da madrugada", "Gestão e SDR"], ["18h05", "Bloco do fim do dia", "Gestão e SDR"], ["19h", "Resumo do dia", "Gestão, SDR e time"], ["8h (dia útil)", "\"Seu dia no SDR\": novos do Inbound, follow-ups, tentativas que acabaram e quantos esperam o Iniciar. Para o representante, o bom dia com \"Abrir carteira\"", "SDR e representantes"],
        ["8h e 18h", "Resumo dos avisos retidos à noite", "Gestão e SDR"], ["10h", "Negócio sem tarefa: a Bia cria a próxima e avisa", "Representante dono"],
        ["18h", "Relatório do dia: movimento do time, leads parados e uso do assistente", "Gestão"],
      ], "", "Agendas da Bia")
      + '<h3 class="mt">Quem recebe o quê</h3>'
      + tabela(["Quando acontece", "SDR", "Representante", "Gestão"], [
        ["Lead Inbound novo", "Aviso com contato, empresa, anúncio, origem e prazo", "Nada", "Sem cópia automática (desligada em 16/11/2026)"],
        ["Lead qualificado", "\"Novo lead para distribuir\", com a lista de representantes", "Tarefa de primeiro contato; aviso de lead novo depois da aprovação", "Aprovação do aviso ao representante (sem cópia automática)"],
        ["Lead sem distribuir há mais de 2 horas", "Lembrete com a lista", "Nada", "Sem cópia automática (desligada em 16/11/2026)"],
        ["Tarefa vencida (Arena, Reposição, Reativação)", "Nada", "Aviso com botões, depois da aprovação", "Aprova os avisos"],
        ["Negócio do Arena há 5 dias úteis sem resposta", "Aviso diário, uma vez por negócio", "Nada novo", "Sem cópia automática (desligada em 16/11/2026)"],
        ["Lead perdido sem explicação", "Aviso e fila vermelha na página Hoje", "Nada", "Aviso se passar de 24 horas"],
        ["Ligação concluída ou apagada sem registro", "Aviso de que a tarefa voltou para a página Hoje", "Nada", "Aviso na repetição"],
        ["Dono que saiu da equipe", "Lista com o motivo e as opções", "Nada", "Sem cópia automática (desligada em 16/11/2026)"],
        ["Mudança direto no Agendor (dono, etapa, valor, tarefa da cadência apagada)", "Nada", "Nada", "Resumo agrupado, no máximo a cada 30 minutos"],
        ["Lead congelado", "Nada", "Nada", "Aviso com funil, etapa, motivo e data para descongelar"],
      ], "", "Quem recebe cada aviso")
      + '<p class="legenda">Falha de automação vai só para a gestão, em regra nunca para o time.</p>')
    return sec("bia", "Bia e automações", "Bia: avisos, agendas e folga", "O que a Bia faz, para quem avisa, quando avisa e quem nunca é segurado.", corpo)

def s_automacoes():
    corpo = (
      '<h3>Quem dispara, o que faz no CRM e com que regra</h3>' + fig("autom")
      + '<p class="legenda">Cada automação tem um modo: desligada, em sombra (só simula e relata, sem escrever) ou ao vivo. O estado de cada uma está na tabela abaixo; onde o estado ao vivo não foi conferido, a tabela diz.</p>'
      + tabela(["Automação", "Quem dispara", "O que faz no CRM", "Regra e limite", "Estado"], [
        ["Cadência do SDR", "Relógio, por minuto", "Avança a etapa por dias úteis e cria a tarefa do dia, uma por vez", "Dias úteis; cota diária opcional de liberação", pill("ok", "No ar desde 20/10/2026")],
        ["Repasse SDR para Arena", "Relógio, por minuto", "Cria o negócio no Arena quando o SDR qualifica pela página Hoje e avisa", "Só depois da qualificação; relê para confirmar", pill("ok", "No ar desde 20/10/2026")],
        ["Guardas do SDR", "Relógio e eventos do Agendor", "Devolve a ligação sem resultado, pede explicação em lead perdido, confere dono ativo e registra mudança direta", "Cada guarda tem chave de emergência", pill("ok", "No ar (blindagem do SDR)")],
        ["Fechamento e garantia de tarefa", "Relógio e eventos", "Fecha tarefa de negócio ganho ou perdido; cria tarefa faltante e corrige o responsável", "Nunca troca o dono; teto por rodada e por dia", pill("ok", "No ar (conforme esta página)")],
        ["Motor Proativo (Arena)", "Relógio, a cada 5 min em horário comercial", "Detecta tarefa vencida e lead parado e envia o card de cobrança ao representante", "Aprovação da gestão; 1 card por vez; sem repetir em 20 minutos", pill("ok", "No ar")],
        ["Pós-venda e reposição", "Relógio, a cada 30 min", "Mantém um negócio por ciclo de reposição, cria o primeiro contato e fecha o ciclo passada a janela", "Prazos por segmento; corrige ação manual sem quebrar o ciclo", pill("ok", "No ar")],
        ["Recuperação SDR, Recuperação e Reativação", "Relógio, diário e a cada 30 min", "Cria negócio novo no SDR Outbound para perdidos antigos e clientes que não repuseram", "Uma volta por empresa a cada 180 dias; limite por dia", pill("ok", "Em operação; prazos em revisão")],
        ["Motores de Reposição e Reativação +75 (cards ao representante)", "Relógio", "Cobrança ao representante nos funis de Pós-venda e Reativação", "Aprovação da gestão; isolados do Arena", pill("de", "Estado ao vivo não verificado: estavam em modo sombra (só simulavam) em 27/09/2026, com a camada de entrega construída; não verificado desde então")],
        ["Ana: abertura", "Relógio, 5 minutos depois do cadastro", "Pede à Bia o negócio no funil da Ana e a nota", "Só dentro do horário de contato (8h às 22h em dia útil; 9h às 20h em fim de semana e feriado); cancela se o lead escrever antes", pill("ok", "No ar")],
        ["Ana: retomada por abandono", "Relógio, dias úteis", "Pede à Bia a etapa Sem resposta no fim dos toques", "Toques em dias úteis; qualquer resposta cancela o que falta", pill("ok", "No ar")],
        ["Ana: retorno combinado e vigias", "Relógio", "Cria a tarefa de retorno com a data pedida; vigia webhook, conversas sem resposta e custo", "Retorno ajustado ao horário de contato; vigia a cada 5 minutos", pill("ok", "No ar")],
        ["Ana: cadência de 3 toques com mensagens de utilidade", "—", "—", "—", pill("pl", "Planejado")],
      ], "ver", "Automações da Bia e da Ana, com disparo, regra e estado")
      + '<h3 class="mt">Rotinas e quando cada uma roda</h3>'
      + tabela(["Rotina", "Quando", "O que faz"], [
        ["Motor Proativo", "A cada 5 min na janela comercial, 1 card por representante por vez", "Detecta tarefa vencida e lead parado, monta o card, escada de cobrança, aviso ao SDR sem resposta"],
        ["Aprovação de avisos", "Ao aprovar ou negar pelo WhatsApp; expiradas limpas nos minutos 5 e 35 de cada hora", "Nada vai ao time sem aprovação; pendência vencida é limpa"],
        ["Cadência do SDR", "A cada minuto, nos minutos terminados em 2", "Avança a etapa por dias úteis e libera 1 tarefa por vez dentro da cota"],
        ["Repasse SDR para Arena", "Varredura a cada minuto", "Cria o negócio no Arena e avisa"],
        ["Guardas do SDR", "Rotação por minuto; dono inativo, diário", "Detecta mudança direta no Agendor, desfaz o que precisa, registra o autor e avisa"],
        ["Voltas ao SDR", "Diário, 8h, e a cada 30 min", "Cria negócio novo no SDR Outbound para perdidos antigos e clientes sem comprar"],
        ["Pós-venda e Reposição", "A cada 30 min", "Matricula ganhos no ciclo, cobra reposição, conferência diária, corrige ganho manual indevido"],
        ["Garantia de tarefa e fechamento", "Duas vezes por hora e por evento", "Cria tarefa faltante, corrige o responsável e fecha tarefas de negócio ganho ou perdido"],
        ["Entrada de lead Inbound", "Evento e conciliação a cada 30 min", "Registra, enriquece por CNPJ, cria o negócio e concilia entradas com o Agendor"],
        ["Janela de 24 horas", "A cada 30 min", "Mantém a janela aberta e re-cutuca o modelo não aberto"],
        ["Vigias de saúde", "Minutos 5 e 35 e diário", "Agendor, n8n nas últimas 24 horas, backup, batimento cardíaco, sincronização do Dash e autoteste"],
        ["Sincronização de acessos e donos", "2h e 5h", "Corrige o dono de contato e empresa e a lista de acessos do SDR"],
        ["Backup e exportação", "Diário, 8h e 2h", "Cópia da memória no armazenamento e na nuvem, exportação de negócios e cópia a cada publicação no repositório e na nuvem"],
      ], "", "Rotinas da Bia")
      + '<h3 class="mt">Cobranças aos representantes ' + pill("ok") + '</h3>'
      + ul(["Quando uma tarefa vence, o representante recebe um aviso no WhatsApp com botões como \"Já concluí\", \"Reagendar\" e \"Mais opções\". Há também aviso 40 minutos antes de uma visita e cobrança 40 minutos depois.",
            "Só em dia útil: mensagens a partir das 8h e cobranças a partir das 9h. No máximo um aviso por representante a cada 20 minutos.",
            "A gestão aprova cada aviso antes de ele ir ao representante. Aviso parado há mais de 72 horas na fila é descartado e a gestão é avisada.",
            "A Bia só escreve no Agendor quando o representante toca em um botão, e o toque é consumido uma única vez.",
            "Não cobra lead que ainda não foi distribuído e não manda aviso se o dono do negócio mudou depois da aprovação."])
      + '<h3 class="mt">Nunca deixar negócio aberto sem tarefa ' + pill("ok") + '</h3>'
      + '<p>Vale para Arena, Pós-venda e Reativação. Nos funis do SDR a própria cadência cria as tarefas. Quatro camadas, todas ligadas:</p>'
      + ul(["<b>Vigia de negócio sem tarefa</b>, todo dia útil às 10h: procura negócios abertos sem tarefa e cria a próxima, relendo antes e ignorando congelados.",
            "<b>Próxima tarefa ao concluir</b>: ao concluir ou anotar uma tarefa, a Bia já garante a seguinte.",
            "<b>Primeiro contato na distribuição</b>: a tarefa nasce no nome do novo dono.",
            "<b>Garantia de tarefa</b>, entre 11h e 18h em dia útil: negócio aberto sem tarefa recebe uma coerente com o funil e a etapa, e tarefa com responsável diferente do dono passa para o dono. Tem teto por rodada e por dia."])
      + '<p class="legenda">A garantia nunca troca o dono do negócio, não manda mensagem ao representante e não mexe em lead que espera distribuição. O texto da tarefa recebe uma frase de contexto quando há histórico recente; se a frase citar algo que não está no histórico, é descartada.</p>'
      + '<h3 class="mt">Pós-venda: ciclos de reposição ' + pill("ok") + '</h3>'
      + grid([card("Como funciona", "<p>Mantém um negócio por ciclo. O primeiro contato é marcado 60 dias depois da compra (30 no supermercado), com 15 dias de janela para repor. Passada a janela, o ciclo fecha e nasce a Reativação.</p>"),
              card("Proteção contra ação manual", "<p>Se alguém desganha por engano, apaga o ciclo seguinte ou troca o dono, a Bia confere e corrige sem quebrar a reposição. Não cria um segundo ciclo enquanto o primeiro está aberto e não desfaz data ou tarefa que alguém mexeu à mão. Um resumo diário vai à gestão.</p>")], 2)
      + '<h3 class="mt">Mais automações que a Bia mantém ' + pill("ok") + '</h3>'
      + grid([
        card("Fechamento de tarefas", "<p>Toda tarefa aberta de negócio ganho ou perdido, em qualquer funil, é fechada com a conta Sistema (que não conta como trabalho do SDR). Ganho do SDR espera o repasse completar; passando de 48 horas sem repasse, fecha mesmo assim e avisa a gestão.</p>"),
        card("Dados da empresa pelo CNPJ", "<p>Quando o CNPJ é adicionado ou trocado, a Bia completa os dados da empresa e deixa uma nota; na troca, a nota mostra o CNPJ antigo e o novo. O repasse confere os dígitos do CNPJ.</p>"),
        card("Origem do negócio", "<p>Preenche a origem quando ficou vazia, herdando do negócio de origem, da empresa ou da pessoa. Não mexe em negócio dos funis do SDR e avisa a gestão quando não consegue determinar.</p>"),
        card("Ganho com valor e releitura", "<p>Quando o valor vem junto no pedido de ganho, a Bia grava e confere o valor antes de marcar o ganho. Antes de criar uma tarefa, relê o Agendor, porque o representante pode ter criado uma nos minutos anteriores.</p>"),
        card("Números honestos", "<p>Atividades do SDR contam tudo que ele conclui, inclusive tarefa criada por ele (destacada na coluna \"Manuais\" do Dash). Negócios antigos da conta técnica entram como Grandes Contas: contam em todas as métricas, mas ficam fora da disputa do ranking.</p>"),
        card("Carimbo de autoria", "<p>Toda escrita da Bia no Agendor é identificada, para o histórico mostrar o que foi automático e o que foi feito por uma pessoa. A conta Sistema nunca é dona de negócio nem fica com tarefa; a Bia avisa quando algum aparece.</p>"),
      ], 3)
      + '<h3 class="mt">O que a Bia faz na conversa</h3>'
      + ul(["Buscar e listar leads, detalhes, contexto, ganhos e perdidos.", "Criar lead com anti-duplicata e rascunho de sugestão antes de gravar.", "Tarefas: criar, listar (inclui vencidas), editar data e hora, excluir e concluir.", "Registrar atividade e observação no negócio.", "Mudar etapa, valor, nome e responsável, com checagem de identidade de quem pede.", "Marcar ganho, perdido ou reabrir, sempre com motivo.", "Notificar pessoa e fazer comunicado, respeitando a janela de 24 horas.", "Lembretes, consultas de apoio, áudio e imagem, e resposta em voz."], "dois"))
    return sec("automacoes", "Bia e automações", "Bia: rotinas automáticas", "As rotinas que rodam sozinhas, e os limites que cada uma respeita.", corpo)

def s_crm():
    corpo = (
      '<p>O Agendor é o sistema em que ficam empresas, pessoas, negócios, tarefas e funis. Toda decisão da Bia e da Ana parte do que está nele e todo resultado volta para ele. Se a conversa e o Agendor divergirem, <b>vale o Agendor</b>. Os painéis e as páginas de trabalho são visões sobre esse mesmo dado.</p>'
      + grid([card("Como o dado é organizado", ul(["Cada negócio está em um funil e em uma etapa, tem um dono e uma origem.", "A empresa guarda a origem de onde veio e ela nunca muda; o negócio guarda a própria origem.", "Nos funis do SDR, empresa, pessoa e negócio têm o SDR como responsável, nunca a conta \"Sistema\"."])),
              card("Sem negócio duplicado, sem sobrescrever", ul(["Antes de criar, a Bia procura o lead em todos os funis de vendas (abertos, ganhos e perdidos). Se existe, nota no negócio atual e aviso ao dono.", "Campos que já têm valor não são trocados. Cada escrita é conferida lendo de volta."]))], 2)
      + '<h3 class="mt">Ana decide, Bia escreve</h3>' + fig("escrita")
      + '<h3 class="mt">A camada única de conversa com o Agendor</h3>'
      + '<p>Toda leitura e escrita passa por uma camada única de proteção. O Agendor aceita poucas chamadas por segundo e pode demorar ou falhar; a camada garante que a operação continue sem duplicar nem perder nada.</p>'
      + fig("camada")
      + tabela(["Tipo de chamada", "O que faz", "Se der limite (429)", "Se der falha temporária"], [
        ["Leitura", "Consulta dados", "Espera e repete", "Repete, até 3 tentativas, com pausa crescente"],
        ["Alteração", "Muda um dado existente", "Espera e repete", "Repete (alterar duas vezes dá o mesmo resultado)"],
        ["Exclusão", "Apaga um registro", "Espera e repete", "Repete (apagar duas vezes dá o mesmo resultado)"],
        ["Criação", "Cria negócio, pessoa, empresa ou tarefa", "Espera e repete", "Nunca repete às cegas: confere antes se o registro já existe e o adota"],
      ], "", "Regras por tipo de chamada")
      + grid([
        card("Travas antes de sair", ul(["Escrita em identificador zero é bloqueada sem tocar no Agendor.", "Mudança de etapa que trocaria o negócio de funil sem querer: a camada lê o funil real e só deixa passar se for o mesmo. Funil desconhecido bloqueia."])),
        card("Fila com freio adaptativo", ul(["Todas as rotinas passam por uma fila única. Cada resposta de limite desacelera todas juntas; depois de um tempo sem erro, o ritmo volta sozinho.", "O clique de uma pessoa pula a fila de varreduras em lote."])),
        card("Confirmação", ul(["A Bia só diz que algo foi feito depois de ler o Agendor de novo.", "Marcar antes, conferir depois: o pior caso é \"não fez hoje\", nunca \"fez duas vezes\".", "Reserva única: duas rotinas no mesmo instante nunca criam o mesmo registro.", "Se a leitura necessária falhou, a rotina não age."])),
        card("Limites conhecidos do Agendor", ul(["Aceita poucas chamadas por segundo; acima disso responde 429 sem dizer quando tentar de novo.", "Tarefa aberta e vencida há mais de 31 dias, nunca alterada, não aparece nas buscas.", "A lista de negócios muitas vezes não traz a empresa: ela vem da pessoa vinculada.", "O recorte por funil é feito pela própria Bia."]), p="lm"),
      ], 2))
    return sec("crm", "Bia e automações", "CRM como fonte da verdade", "O Agendor manda. Todo o resto lê, escreve com cuidado e confere.", corpo)

def s_hoje():
    corpo = (
      '<p>A página Hoje é a mesa de trabalho do SDR: ele vê o lead inteiro, completa dados, liga, marca Perdido ou Ganho, escolhe o representante e cuida das tarefas sem abrir o Agendor. É uma página para computador.</p>'
      + aviso("Versão no ar", "Versão 2026-11-18.6B, no ar desde 19/11/2026 (01h14): livro local de ações (concluir, adiar e criar nunca voltam na tela por leitura velha), cabeçalho recolhível (recolhido por padrão), colunas que se ajustam à tela e a raia Closer. Quem já estava com a página aberta precisa recarregar a aba. A base é a mesa do SDR sem travas de horário, a fila por listas e a qualificação que cria o negócio no funil certo (SDR Inbound e depois Arena).", "n")
      + '<h3 class="mt">Do lead na fila ao Arena</h3>' + fig("hoje")
      + '<h3 class="mt">Como o SDR vê a página</h3>'
      + fluxo([("Abre o lead", "Cartão com empresa, origem, etapa e próxima tarefa. Lead novo aparece em até 30 segundos."), ("Trabalha", "Liga, anota, conclui tarefas, completa dados. Não há mais Minimizar: Fechar guarda o rascunho por 3 dias.", "m"), ("Fechar", "Se a fila mudou enquanto o lead estava aberto, um ponto discreto acende no botão Fechar. Nada se move com o lead aberto.", "m"), ("A fila entra", "Ao fechar o lead, ou no teto de 3 minutos. A faixa \"Há atualização da fila\" saiu de vez.", "g"), ("Se der erro", "Limite do Agendor não desloga. O erro 502 é confirmado por releitura antes de repetir; erro só quando o servidor confirma, com botão de repetir.", "x")])
      + grid([
        card("Regras da gestão para a página Hoje (17/11/2026)", ul(["Toda ação do SDR é instantânea e nunca pode parecer revertida na tela por uma leitura atrasada: o servidor grava a ação no estado da página na hora; erro só quando o servidor confirmar falha, com botão de repetir (no ar na versão 2026-11-18.6B, com o livro local de ações).", "A distribuição do lead continua manual, pelo SDR: nenhuma regra automática por cidade ou região; a Bia não distribui sozinha.", "O cabeçalho é recolhível e abre recolhido por padrão; as colunas se ajustam à tela (versão 2026-11-18.6B, no ar). Mudança no topo continua com prévia para aprovação antes de construir.", "A faixa de atualização da fila saiu: com lead aberto, silêncio; ao fechar, a fila entra na hora; teto de 3 minutos mantido."]), p="ok"),
        card("No celular", ul(["Topo não grudado; cabeçalho fixo só no computador.", "Alvos de toque de 44 px.", "Tela estável ao abrir o lead: nada pula (rodapé com esqueleto de mesma altura).", "Status para leitor de tela quando o ponto do Fechar acende."]), p="ok"),
      ], 2)
      + '<h3 class="mt">A fila e o kanban</h3>'
      + grid([
        card("No topo", ul(["Números do dia e do mês.", "Busca geral por nome da loja ou da pessoa, CNPJ, telefone, número do negócio ou cidade, nos dois funis do SDR.", "Filtro por origem e opção de esconder o que já foi feito.", "Atalhos para Subir lista, Dash Geral, Como funciona e Meu painel.", "Aviso vermelho quando algum lead foi perdido sem explicação."]), p="ok"),
        card("As colunas do dia", ul(["Inbound novo: lead quente que acabou de chegar.", "Aberturas novas e 2º, 3º e 4º contato; Última tentativa.", "Tentativas acabaram: leads no fim da cadência.", "Atrasadas e Iniciados hoje.", "Começar leads novos: a fila de espera, com os botões Iniciar."]), p="ok"),
        card("Fila completa em linhas por lista", "<p>Mostra a contagem real da fila, carrega rápido e traz o restante por trás, com \"Mostrar mais\". Cada lista é uma linha que abre e fecha. Sem \"Iniciar TODOS\" e com limite de leads por clique; quem acabou de ser iniciado some da fila na hora.</p>", p="ok"),
        card("Hoje 2026-11-18.6B", "<p>No ar desde 19/11/2026 (01h14): livro local de ações, cabeçalho recolhido por padrão, colunas que se ajustam à tela e raia Closer.</p>", p="ok"),
        card("Hoje 2.0", "<p>Nova geração da página, lendo de um espelho dos dados (hoje em modo sombra, só copiando e comparando). Futuro: ainda não existe para o SDR.</p>", p="pl"),
        card("Raia Closer", "<p>No ar na versão 2026-11-18.6B: negócios do Arena em que o SDR é dono, escolhidos pelo identificador do dono, nunca pelo nome.</p>", p="ok"),
      ], 2)
      + '<h3 class="mt">O cartão e o painel do lead</h3>'
      + grid([
        card("No cartão", ul(["Empresa, origem do negócio em destaque, etapa e próxima tarefa.", "Etiqueta quando o lead voltou ao SDR (Recuperação, Reativação ou Recuperação SDR), com uma linha dizendo de onde veio.", "Selo \"Atrasado\" e aviso \"Falta o resultado da ligação\".", "WhatsApp clicável e copiável."])),
        card("Ao abrir o lead", ul(["Dados da empresa (CNPJ, segmento, lojas, faturamento, endereço).", "Pessoas e telefones: troca do contato principal, adicionar e retirar contatos. Se o WhatsApp já existe em outra pessoa, nada é salvo sem o SDR confirmar.", "Troca ou inclusão de CNPJ: a Bia completa os dados da empresa sozinha.", "Ações: concluir tarefas, Perdido (com motivo e explicação), Ganho, escolher representante, reabrir lead e \"tirar o Ganho e reabrir\" (enquanto não foi para o Arena)."])),
      ], 2)
      + grid([
        card("Observação do SDR", "<p>Campo curto (até 150 letras) que o representante recebe no cartão ao receber o lead. Ele abre sempre vazio e é do SDR: qualificar fica travado sem ele. O contexto automático (recuperação, reativação, origem, resumo da Ana) aparece em um balão lilás separado. Desde 17/11/2026 o servidor grava exatamente o que o SDR escreveu, sem colar texto automático.</p>", p="ok"),
        card("Notas livres", "<p>Pelo botão Anotar, o SDR escreve uma nota a qualquer hora, em qualquer lead dos funis do SDR, mesmo depois de Ganho ou Perdido. A nota fica no histórico do Agendor, não cria tarefa, não muda etapa e não conta como atividade.</p>", p="ok"),
        card("Fechar e rascunho", "<p>O botão Minimizar saiu. Fechar guarda o que foi digitado por 3 dias e, ao reabrir o lead, o rascunho está lá; rascunho vazio ou vencido não conta. Esc fecha. Um ponto discreto no Fechar avisa que a fila mudou; Sair e o botão Atualizar limpam o ponto.</p>", p="ok"),
        card("Rede de segurança", "<p>Clique repetido nunca duplica; sem internet a ação fica numa caixa de saída; uma chave de emergência desliga a gravação pela página. Também: o limite de chamadas do Agendor (429) não desloga; o erro 502 em ganho, nota ou tarefa é confirmado por releitura antes de repetir (campos, perdido e retirar contato repetem direto; nota e pessoa nova são desduplicadas pelo servidor); 502 com erro nomeado do servidor mostra a mensagem em vez de repetir.</p>", p="ok"),
      ], 2)
      + '<h3 class="mt">Página Lista</h3>'
      + '<p>Recebe a planilha ou o cadastro digitado, até 300 leads por vez. O SDR dá um nome à lista, vê a prévia e a Bia cria os negócios no funil certo pela origem: Inbound no D0, Outbound na fila de espera. Endereço sem número tem uma caixinha \"sem número\".</p>')
    return sec("hoje", "Páginas e sistemas", "Página Hoje", "Fila, kanban, observação do SDR, como o SDR vê a página e as regras da gestão.", corpo)

def s_central():
    corpo = (
      '<p>A página Central é o painel de controle da plataforma, protegido por usuário e senha. A gestão vê e muda tudo; administradores mudam só o que tem risco baixo ou médio; o SDR hoje só lê (no plano de 09/11/2026, depois, só o que é dele).</p>'
      + '<h3 class="mt">Como a página Central se conecta ao resto</h3>' + fig("central")
      + tabela(["Peça", "O que a página Central faz com ela", "Estado"], [
        ["Ana", "Central de atendimento (lista de conversas com selos de situação, conversa completa com histórico, áudios e fotos), assumir, responder por texto ou voz da Ana, devolver, passar ao time comercial, pausar, instruir por texto ou áudio, parada de emergência, voz, base de conhecimento editável e aprendizado por 👍/👎.", pill("ok")],
        ["Bia", "Interruptores de cada automação, filas de mensagens por pessoa, calendário de folga, histórico de mudanças com quem fez e desfazer.", pill("ok")],
        ["Agendor", "A página Central não escreve direto: o que ela pede (ganho, perdido, repasse, no pacote futuro) passa pela Bia, que escreve e relê. Hoje ela lê o Agendor para mostrar o estado do lead.", pill("ok")],
        ["Hoje", "Atalho para a mesa do SDR e para a fila; a página Central mostra a saúde do que a página Hoje depende.", pill("ok")],
        ["Dash Geral", "Atalho; a aba Agentes mostra custo e métricas da Ana e da Bia.", pill("ok")],
        ["Canal", "Atalho para a conversa da gestão com o assistente de engenharia, usada para decidir mudanças e acompanhar publicações.", pill("ok")],
        ["Life B Solicita", "Atalho a partir do Atendimento.", pill("ok")],
        ["Botões manuais (repasse hoje; ganho e perdido planejados)", "Passam pela Bia e pelo Agendor, com confirmação e leitura de volta antes de dizer que deu certo. Passar ao SDR não trava a tela: mostra \"Passando…\" até o servidor responder; desde o servidor da Ana de 17/11/2026 (23h40), a resposta vem na hora e a página consulta o resultado. Ganho e perdido pela página Central são planejados.", pill("ok")],
      ], "", "Conexões da página Central")
      + grid([
        card("Atendimento da Ana", ul(["Conversa da Ana com cada lead, com ficha e sinais.", "Assumir, instruir (texto ou áudio), devolver e pausar; 👍 ou 👎 em cada resposta.", "Tela cheia e link direto para cada conversa.", "Atalho para o Life B Solicita."]), p="ok"),
        card("Controle", ul(["Visão geral da saúde da plataforma.", "Interruptores de cada proteção e automação, em três níveis de risco. Cada mudança pede um motivo, aparece no histórico com quem fez e <b>pode ser desfeita</b>.", "Aba Agentes: parada de emergência da Ana e custo.", "Filas de mensagens por pessoa e calendário de folga."]), p="ok"),
        card("Pacote de 15/11/2026", ul(["Link por aba e rolagem preservada ao atualizar.", "Exportar conversa.", "Simulador em formato de chat.", "Login que persiste no celular."]), p="ok"),
        card("Pacote de 17/11/2026 (página publicada)", ul(["Botões de ação com confirmação: mostram \"fazendo\", têm limite de tempo e leem a conversa de volta antes de dizer que deu certo.", "Selos do CRM na lista e no atendimento (qualificada, aguardando o SDR, no Arena, já cliente, no SDR, não contatar, perdido) e selo de início agendado, com data e hora.", "Lista leve: carrega menos dados e desenha 60 conversas por vez. Auditoria enxuta na aba da Ana. Erro 409 explicado na tela.", "Aba Ecossistema sem recarregar ao trocar de aba; saúde sem \"pede atenção\" falso.", "O calendário real, os controles da Ana e o menu reorganizado ainda não foram construídos (ficam no plano)."]), p="ok"),
        card("Janela de 24 horas, formulário e repasse, como a equipe vê (17/11/2026)", ul(["Selo fixo em cada conversa, na lista e na ficha: \"ABERTA, fecha em 3h 20m\" ou \"FECHADA há 2 d\" (última mensagem do lead mais 24 horas, horário de Brasília).", "Filtro \"Janela fechando\": conversas que fecham em menos de 2 horas.", "Selos \"Veio do formulário\" (com o que o lead preencheu) e \"Repassado ao time comercial\" (com quem e quando).", "Passar ao SDR: a tela não trava; \"Passando…\" até o servidor responder; repetir é seguro. Erro 409 não sugere repetir."]), p="ok"),
        card("No ar desde 17/11/2026 (23h40): a parte do servidor da Ana", ul(["Os dados da janela, do formulário e do repasse que a página mostra.", "Conversa oculta ou arquivada volta sozinha para a lista com qualquer mensagem nova, do lead ou da equipe, marcada \"voltou: nova mensagem\"; vale também para conversa com a equipe.", "Passar ao SDR em segundo plano: resposta imediata e consulta do pedido até terminar, com cancelar.", "Resumo do dia da Ana: \"Esperando uma pessoa agora\" só sem prova de repasse; \"Já repassadas (no CRM)\"; \"Com a equipe agora\".", "O primeiro deploy da noite abortou por uma regressão em teste de simulação; o pacote corrigido subiu às 23h40 com \"Deploy concluído\"."]), p="ok"),
        card("Regra da gestão (17/11/2026): arquivar", ul(["Pode-se arquivar qualquer conversa, inclusive com a equipe ou com a Ana pausada.", "Qualquer mensagem nova, do lead ou da equipe, traz a conversa de volta sozinha.", "Ocultar continua reversível (Desarquivar e lista de ocultas)."]), p="ok"),
        card("Planejado: controles manuais completos", ul(["Dar ganho, dar perdido com motivo e repassar ao SDR Inbound, sem precisar instruir nem assumir.", "Editar nome, empresa, CNPJ, segmento, lojas e decisor, com registro de quem fez e a Ana enxergando a edição; desfazer e apagar em tudo; cancelar toques.", "Alertas com botão para abrir o atendimento; retomada por modelo após 24 horas; instrução à Ana com pré-visualização.", "Origem: levantamento de 16/11/2026 e registro de decisões (o desenho será mostrado antes de publicar). Central 2.0 aguarda decisões da gestão."]), p="pl"),
      ], 2)
      + '<h3 class="mt">Propósito e os 12 módulos do plano da página Central</h3>'
      + '<p>O plano da página Central (09/11/2026) a define como a plataforma de operação: um painel único para operar a Bia, as automações, as páginas Hoje e Lista, os motores proativos, o time e os prazos, sem abrir o terminal. A página Central muda <b>valores</b> (ligado ou desligado, número, horário, lista); não muda a lógica das regras (código com teste), os segredos (guardados no servidor) nem os limites de terceiros (Agendor, WhatsApp). Cada mudança passa por validação e permissão, pede motivo, é registrada com autor e valor anterior e pode ser desfeita. Se uma chave não existe, vale o padrão seguro do código.</p>'
      + tabela(["Módulo", "No ar hoje", "Planejado (fase do plano)"], [
        ["1. Estado ao vivo", "Aba Visão geral: saúde da Bia e da Ana ao vivo.", "—"],
        ["2. Interruptores", "Aba da Bia e automações: desligado, só observa ou ao vivo, com motivo e nível de risco.", "Fase 3: aprovar cada tipo de aviso pela página Central (fila de pendências)."],
        ["3. Números e prazos", "Números com limite nos controles.", "Fase 2: prazos de reposição e cota do SDR."],
        ["4. Calendário e horários", "Aba Calendário: dias de folga marcados à mão.", "Fase 2: calendário único e horários por pessoa e por tipo de aviso."],
        ["5. Time e permissões", "Aba de acessos: já no ar.", "Tela nova de Usuários e papéis (com Instagram e hub): em construção, NÃO no ar. Fase 3: lista única de SDRs, representantes e gestão."],
        ["6. Mensagens e botões", "—", "Fase 4: editar textos, botões e listas dos avisos, com prévia, aprovação e versão."],
        ["7. Histórico e desfazer", "Aba Histórico: quem mudou o quê, com motivo e desfazer.", "—"],
        ["8. Saúde e alertas", "Visão geral e aba Filas (mensagens esperando, por pessoa).", "Fase 2: absorver a aba da Bia no Dash (rotinas, portões, agendas, avisos pendentes)."],
        ["9. Cadência e funis", "—", "Fase 5: dias, passos e textos da cadência do SDR (delicado)."],
        ["10. Hoje e Lista", "Interruptor que permite à página Hoje escrever no Agendor.", "Fase 3: editar colunas, cota, fila, textos, regras de ligação e perda e campos exigidos."],
        ["11. Intensidade de cobrança", "—", "Fase 2: semanas em que a Bia aumenta a cobrança (mais lembretes, intervalo menor, horário estendido)."],
        ["12. Dias off e feriados", "Dias de folga marcados à mão, lidos pela trava de folga.", "Fase 2: adicionar por empresa, cidade ou pessoa; todas as rotinas leem o mesmo calendário."],
      ], "", "Os 12 módulos do plano da página Central e o estado de cada um")
      + aviso("Fases do plano", "Fase 0: fundamentos e segurança (registro de configuração único com versão e trilha). Fase 1: interruptores com trava, histórico e desfazer (base no ar). Fase 2: aprovação por tipo, números, calendário, intensidade de cobrança e saúde. Fase 3: time e permissões, páginas Hoje e Lista editáveis, acesso por usuário. Fase 4: mensagens, botões e notificações novas. Fase 5: cadência e funis. O que a página Central tem além dos 12 módulos já está no ar: atendimento da Ana e aba da Ana. Central 2.0 aguarda decisões da gestão.", "n")
      + '<h3 class="mt">Controle de acesso e exclusão</h3>'
      + ul(["Excluir conversa: só a gestão e quem ela autorizar. Ocultar e arquivar são reversíveis, e qualquer mensagem nova traz a conversa de volta; excluir pede motivo, os 4 últimos dígitos do telefone e a senha, e vai para uma lixeira por 30 dias.", "Fila de mensagens por pessoa: remover uma mensagem ou limpar tudo, com cópia guardada por 7 dias.", "Calendário de folga: dias extras marcados valem como feriado para o envio de mensagens."]))
    return sec("central", "Páginas e sistemas", "Central", "Atendimento, controle e desfazer: o painel da gestão.", corpo)

def s_outras():
    corpo = ('<h3>Dash: de onde vêm os números</h3>' + fig("dash") + '<p class="legenda">O Dash expandido (mais indicadores do SDR e da Ana) é planejado: ainda não existe.</p>' + grid([
      card("Painel do Representante", "<p>Página individual de cada representante, ligada ao Agendor ao vivo. Mostra a carteira em andamento, o valor vendido e os ganhos do mês; cada negócio cai em Negociação, Aguardando (sem tarefa, tarefa sem data ou vencida) ou Contato (tarefa com data futura).</p><p>Permite criar, concluir e reagendar tarefas, anotar, marcar Ganho ou Perdido com motivo, corrigir o valor e ver o histórico. Toda ação confere o dono do negócio e relê o Agendor antes de confirmar; ações feitas sem internet ficam guardadas e seguem quando a conexão volta. Todo dia útil às 8h a Bia manda um bom dia com o botão \"Abrir carteira\".</p><p class=\"muted\">Correção em teste: recarga só no horário comercial e só de quem abriu a página.</p>", p="ok"),
      card("Dash Geral e telão", "<p>Painel de números da empresa, em versão celular e versão TV. Abas: Vendas (ganhos, ranking e rosca Origem das Vendas), LTV, RFM, SDR, ADS, GA4 e BIA (saúde das rotinas da Bia). Os números vêm de um banco próprio, atualizado a cada 5 minutos e na hora quando há ganho, perda ou mudança de valor; se parar por mais de 15 minutos, a gestão é alertada.</p><ul><li>A data do ganho é a data real do evento, nunca a de importação.</li><li>Lead é negócio do Arena; ganho do SDR é qualificação e não entra em vendas.</li><li>Ticket médio tira valores atípicos; venda sem valor ou abaixo de R$ 10 fica fora da média, mas conta como venda.</li><li>O número do ERP inteiro e o número só do Agendor nunca se misturam.</li></ul><p>Desde 17/11/2026 (21h42): faixa vermelha quando os dados congelam, com nova tentativa e último dado bom, e rosca Origem das Vendas sem corte de nomes. Só visual e aviso; nenhuma regra ou cálculo mudou. Fase 2 do Dash: em correção, sem data.</p>", p="ok"),
      card("Canal", "<p>Aplicativo web de conversa da gestão com o assistente de engenharia que cuida da plataforma. É o canal principal de conversa; a Bia fica para alertas, avisos e novidades.</p>", p="ok"),
      card("Mineração de leads", "<p>Busca de empresas por cidade e segmento em bases públicas, com foco em WhatsApp e celular, sem custo. Duplicidade e cliente existente são decididos por CNPJ ou telefone, nunca só pelo nome. A reativação de listas é feita por cidade.</p>", p="pl"),
      card("Life B Solicita", "<p>Aplicativo de pedidos de material, comodato e promotoria, com atalho dentro da página Central.</p>", p="ok"),
      card("Análise mensal ERP e Agendor", "<p>Rotina que cruza as vendas do ERP do mês com os negócios do Agendor e gera uma página de análise. Só lê; nada é escrito no Agendor. O ERP não é integrado ao Agendor.</p>", p="ok"),
      card("Páginas de captação, kits e SuperAgos", "<p>Páginas de anúncio que geram leads, kits e apresentações comerciais para farmácias e supermercados, e a origem de negócio própria da feira SuperAgos (no Dash, conta como Outbound, com fatia própria na rosca).</p>", p="ok"),
    ], 2))
    return sec("outras", "Páginas e sistemas", "Painel do Representante, Dash e demais sistemas", "As outras peças que a equipe usa.", corpo)

def s_meta():
    full = [
      "A Ana e a Bia usam números de WhatsApp diferentes. O webhook do número da Ana na Meta é vigiado a cada 5 minutos e recolocado se sumir.",
      "Dentro de 24 horas da última mensagem do lead, a Ana responde livremente. Fora dela, só modelos aprovados. A janela só reabre quando a pessoa responde; por isso a Bia manda, antes de fechar, um \"tá tudo certo?\" com botões, em dia útil, das 8h às 18h, sem empilhar mensagens.",
      "Aberturas usam modelos de marketing, com texto humano; modelos utilitários só para retorno com data. Os modelos de \"cadastro recebido\" ficam como reserva, sem uso. Arquivar modelos antigos só depois de os novos estarem estáveis.",
      "Conservador de propósito, para proteger a qualidade do número: aviso da Bia a representantes, no máximo 1 a cada 20 minutos por pessoa e 30 por hora no total; a Ana só toma a iniciativa dentro do horário de contato (8h às 22h em dia útil; 9h às 20h em fim de semana e feriado); cada aviso tem regra de não repetir; nada vai a um lead real em teste.",
      "A Bia só considera \"enviado\" quando o WhatsApp aceitou. Qualquer outro retorno vira erro e o aviso entra na fila durável.",
      "Nos avisos da Bia, a falha de ENTREGA recusada pela Meta fica registrada, mas ainda não gera reenvio automático (planejado); a falha de ENVIO entra na fila e é reenviada. O reenvio por utilidade da abertura da Ana foi corrigido em 17/11/2026 (23h40): no ar; resultado em caso real ainda a provar (18/11/2026).",
    ]
    def cartao(t, topicos, k, p=None):
        return card(t, ul(topicos) + det("Texto completo", "<p class=\"full\">" + full[k] + "</p>"), p=p)
    corpo = (grid([
      cartao("Números separados", ["Ana e Bia usam números diferentes", "Webhook da Ana vigiado a cada 5 min", "Se sumir, é recolocado"], 0),
      cartao("Janela de 24 horas", ["Até 24 h da última fala: a Ana responde livre", "Depois: só modelos aprovados", "A Bia pergunta \"tá tudo certo?\" antes de fechar"], 1),
      cartao("Modelos aprovados", ["Abertura: modelo de marketing, texto humano", "Retorno com data: modelo utilitário", "Arquivar os antigos só com os novos estáveis"], 2, "pl"),
      cartao("Ritmo e limites", ["Aviso a representante: 1 a cada 20 min por pessoa", "No máximo 30 por hora no total", "Nada vai a lead real em teste"], 3),
      cartao("Entrega", ["\"Enviado\" só se o WhatsApp aceitou", "Outro retorno vira erro", "O aviso entra na fila durável"], 4, "ok"),
      cartao("Falha de entrega da Meta", ["Entrega recusada: registrada, sem reenvio automático", "Envio com falha: fila e reenvio", "Abertura da Ana: 1 reenvio por utilidade (no ar, a provar)"], 5),
    ], 2))
    return sec("meta", "Plataforma", "WhatsApp e Meta", "Modelos, janela de 24 horas e limites que protegem o número.", corpo)
