"""Seções 16 a 22 do Ecossistema."""
VERSAO = "2026-11-17.3"
import json as _j1, os as _o1
DATA_V = _j1.load(open(_o1.path.join(_o1.path.dirname(_o1.path.abspath(__file__)), "estado.json"), encoding="utf-8"))["atualizado_em"]
from comp import *
from diagramas import fig

def s_regras():
    corpo = (
      '<p>Estas regras existem para que o histórico de cada lead e os números do Dash mostrem o que aconteceu de verdade. Quem trabalha pela página Hoje não precisa fazer nada diferente: tudo já é registrado no caminho certo. Quando alguém mexe direto no Agendor, a Bia ajuda a manter o combinado: reorganiza o que ficou fora do lugar e avisa, sem apagar histórico.</p>'
      + '<h3 class="mt">Regras de ouro</h3>'
      + grid([
        card("Tarefas", ul(["Tarefa de negócio sempre com o dono do negócio como responsável.", "Tarefa da cadência vence às 18h, em dia útil.", "Negócio aberto fora do SDR não fica sem tarefa.", "Tarefa de negócio ganho ou perdido é fechada."])),
        card("SDR", ul(["Ganho do SDR é qualificação, não venda.", "No Outbound, em regra, nada começa sozinho: só o botão Iniciar.", "Todo lead qualificado é distribuído, nem que seja para o próprio SDR.", "A distribuição é decisão do SDR, pela página Hoje: nenhuma regra automática por cidade ou região; a Bia não distribui sozinha (regra da gestão de 17/11/2026).", "Na página Hoje, a ação do SDR vale na hora e a tela nunca a mostra revertida por uma leitura atrasada; erro só quando o servidor confirma, com botão de repetir (regra da gestão de 17/11/2026; entra na versão 17.6, em construção).", "Lead perdido, em regra, tem explicação.", "Ligação, em regra, tem resultado."])),
        card("Donos", ul(["A conta Sistema nunca é dona de negócio.", "Atribuição automática só para quem está ativo na equipe.", "Cada SDR só enxerga o que passou por ele."])),
        card("Números e datas", ul(["A origem da empresa nunca muda nas voltas.", "Lead é só negócio do Arena.", "Datas no formato dia/mês, em horário de Brasília."])),
        card("Processo", ul(["Mudou uma regra? Procure em todos os lugares onde ela aparece, inclusive este Ecossistema e a página Central.", "Nada vai ao ar sem a suíte de testes verde e sem auditoria independente quando a mudança é grande.", "Publicação só pelo roteiro único, com cópia de segurança antes. Servidor primeiro, página depois."])),
        card("Automação", ul(["Escreveu? Releia. Só se diz \"confirmado\" quando a leitura bate.", "Em simulação não há escrita nem WhatsApp.", "Se a leitura falhou, a automação não age.", "Cada tipo liga separado, com limite pequeno por padrão."])),
      ], 3)
      + '<h3 class="mt">O caminho da ligação</h3>'
      + '<p>A ligação é a tarefa mais importante da cadência. Cada ligação termina com o resultado registrado, e o time inteiro entende o que aconteceu.</p>'
      + fluxo([("A Bia cria a tarefa", "Ligar para quem decide, vence às 18h."), ("O SDR liga e registra na página Hoje", "Falou com quem decide, caixa postal, número errado...", "m"), ("Resultado guardado", "A página Hoje conclui a tarefa e escreve a nota no negócio.", "g")])
      + fluxo([("Concluiu direto no Agendor, sem resultado?", "Em 15 minutos a Bia devolve a tarefa à página Hoje, marca a concluída como anulada (o Dash não a conta) e avisa o SDR.", "x"), ("O SDR registra", "Ou escolhe \"Não houve ligação\", que fica anotado.", "g")])
      + ul(["Se a tarefa for apagada ou renomeada direto no Agendor, a Bia recria, restaura o nome e avisa. No máximo 3 devoluções da mesma ligação; na segunda, a gestão também recebe o aviso. Quem registrou pela página Hoje nunca recebe aviso."])
      + '<h3 class="mt">O caminho da perda</h3>'
      + fluxo([("O SDR escolhe o motivo", "E conta, em poucas palavras, o que aconteceu."), ("A Bia confere se está claro", "Pede mais detalhe se o texto for genérico, copiado ou sem sentido.", "m"), ("Perda registrada", "Com a explicação na nota do negócio.", "g")])
      + ul(["Só três motivos se explicam sozinhos: Já está sendo atendido(a)/cliente, Restrição de pagamento e Sem retorno. Os demais pedem uma frase curta. Em \"Duplicado\", informar qual é o negócio original.",
            "Perdido direto no Agendor: o lead aparece em vermelho no topo da página Hoje até o SDR contar o que houve; a gestão é avisada se passar de 24 horas. O lead nunca é reaberto.",
            "O lead só volta pela Recuperação depois da explicação."])
      + '<h3 class="mt">Mais proteções contra ação manual</h3>'
      + grid([
        card("Distribuição obrigatória", "<p>Sem distribuição, nenhuma automação age sobre o lead. Depois de duas horas, lembrete com a lista, até 3 leads por vez. O SDR que qualificou fica com acesso nos três níveis.</p>"),
        card("Dono sempre ativo", "<p>Tudo que a Bia atribui só vai para quem está ativo. Em dia útil, de manhã, ela procura negócios abertos cujo dono saiu da equipe ou que estão na conta Sistema e avisa. Não troca dono sozinha.</p>"),
        card("Cadência sem atalho", "<p>Tarefa pode ser adiada uma vez, até o próximo dia útil. Data empurrada direto no Agendor volta ao combinado. Lead arrastado para o fim antes da hora é devolvido. Nunca é fechado como \"Cadência esgotada\" sem cumprir a cadência.</p>"),
        card("Funil sem desvio", "<p>Lead movido à mão para outro funil volta à etapa de antes, com aviso. Excluir um negócio não dá para desfazer, mas a gestão e o SDR são avisados na hora. Congelar exige data (até 180 dias) e motivo; os dias congelados não contam.</p>"),
        card("Na dúvida, não mexe", "<p>O Pós-venda só ajusta data ou tarefa quando ninguém mexeu à mão. A garantia nunca troca o dono. Negócio congelado de propósito não gera cobrança.</p>"),
        card("Livro de mudanças", "<p>Toda mudança direta no Agendor nos leads do SDR (dono, etapa à mão, valor, tarefa da cadência apagada, funil, exclusão, congelamento) fica registrada com o quê, quando e em qual negócio. A gestão recebe um resumo agrupado, no máximo a cada 30 minutos. O livro registra e avisa; não desfaz o que não precisa.</p>"),
      ], 3))
    return sec("regras", "Plataforma", "Regras de ouro e proteções", "As regras que mantêm o histórico verdadeiro e as automações previsíveis.", corpo)

def s_seguranca():
    corpo = (
      '<p>O sistema foi feito para errar pouco e, quando errar, não piorar. Nenhuma senha, chave ou dado pessoal de cliente aparece neste guia.</p>'
      + '<h3 class="mt">O caminho de uma mudança até o ar</h3>' + fig("pipeline")
      + grid([
        card("Trava de segurança do ambiente", "<p>Um cinto de segurança no ambiente de desenvolvimento pede confirmação humana para ações sensíveis: gravar ou apagar segredos, escrever no Agendor, mandar mensagem a número que não seja o de teste da gestão, alterar a Meta, apagar em massa, mudar interruptores de emergência. <b>Publicar fora do roteiro único é bloqueado</b>.</p>", p="ok"),
        card("Deploy só pelo roteiro", "<p>A publicação do servidor só acontece pelo roteiro único, que exige a cópia de segurança, uma linha \"Varredura:\" dizendo o que foi conferido e uma linha \"Antirregressão:\". Sem elas, aborta. Ninguém contorna o roteiro.</p>", p="ok"),
        card("Auditoria independente", "<p>Um revisor separado lê o código sem poder alterá-lo e tenta quebrar a mudança: contradições entre regras, falhas silenciosas, limites da infraestrutura, volume de mensagens e formas de contornar o processo. Quem executa a mudança nunca audita a própria mudança. Os achados são conferidos no código, corrigidos com teste e a rodada seguinte revisa de novo.</p>", p="ok"),
        card("Antirregressão", "<p>Baseline de prints antes e depois com diff visual; conversas reais e fictícias como casos de teste; mutação das travas (quebrar de propósito para provar que o teste falha); teste de volta atrás; piloto antes de todos. Todo erro que escapou vira caso novo.</p>", p="ok"),
        card("Teste de fumaça", "<p>Depois de publicar, a versão no ar é conferida: o fluxo principal roda de ponta a ponta e a gestão recebe o resumo.</p>", p="ok"),
        card("Páginas: publicação protegida", "<p>O roteiro que publica uma página só roda se os testes passarem, leva somente o arquivo daquela página e aborta se o índice do repositório estiver vazio, se algum arquivo for apagado ou se a contagem de arquivos cair, antes ou depois do envio.</p>", p="ok"),
      ], 2)
      + '<h3 class="mt">Testes que protegem o futuro</h3>'
      + ul(["<b>Regras de negócio:</b> cada decisão tem casos de sucesso, de recusa e de erro.",
            "<b>Falhas do mundo real:</b> limite de chamadas, resposta perdida depois de gravar, leitura que falha, memória indisponível. A Bia nunca duplica nem finge que concluiu.",
            "<b>Comparação com a versão anterior:</b> a regra nova e a antiga rodam lado a lado para provar que uma melhoria não mudou o que não devia.",
            "<b>Horário e fuso:</b> datas testadas no fuso universal e no de Brasília.",
            "<b>Telas:</b> páginas abertas em navegador real, de celular a TV, claro e escuro, com prints olhados por uma pessoa.",
            "<b>Ambiente simulado:</b> os testes usam um Agendor e uma memória de mentira, com as peculiaridades reais. Nada de produção é tocado. Teste que envia WhatsApp usa só o número de teste da gestão."])
      + '<h3 class="mt">A varredura de todos os lugares</h3>'
      + '<p>Uma regra costuma morar em muitos lugares: código e testes, mensagens da Bia, páginas Hoje e Lista, Central, este Ecossistema, documentos e artefatos. Se um deles fica para trás, a regra antiga continua viva ou um texto passa a mentir. O roteiro de publicação não aceita a mudança sem a linha \"Varredura:\".</p>'
      + '<h3 class="mt">Mais proteções</h3>'
      + ul(["<b>Uma coisa de cada vez:</b> antes de criar algo, a Bia reserva o direito de fazer, para duas rotinas não agirem ao mesmo tempo.", "<b>Criação sem resposta:</b> a Bia procura se o negócio já existe antes de tentar de novo.", "<b>Aprovações e identidade:</b> avisos a representantes passam por aprovação e a identidade de quem pede cada ação é verificada.", "<b>Interruptores de emergência:</b> a gestão pode pausar a Bia inteira, só os avisos ou cada regra.", "<b>Segredos fora do código:</b> chaves e senhas ficam em cofre e nunca em páginas, documentos ou conversas.", "<b>Dados de clientes:</b> nenhum telefone, CNPJ ou nome de cliente é exibido em guias como este; pedido de não contatar é respeitado e registrado."]))
    return sec("seguranca", "Plataforma", "Segurança e engenharia", "Cinto de segurança, roteiro único de publicação, auditoria independente, antirregressão e fumaça.", corpo)

def s_observ():
    corpo = (
      '<p>Uma falha silenciosa é inaceitável. Cada ponto crítico tem um vigia, uma nova tentativa e um alerta para a gestão.</p>'
      + '<h3 class="mt">Do evento ao aviso enviado, passo a passo</h3>' + fig("avisos")
      + '<h3 class="mt">A camada de entrega</h3>'
      + tabela(["Camada", "O que faz", "Onde aparece"], [
        ["Nova tentativa", "Falha temporária é repetida com pausa crescente, com teto de tentativas. Aviso cujo envio falhou volta a cada 5 minutos por até 24 horas.", "Fila durável"],
        ["Plano B", "IA falhou: texto padrão seguro. Voz falhou: voz reserva e depois a da Bia, e por fim texto. Rota de saída do Agendor bloqueada: rota alternativa.", "Dentro da própria conversa"],
        ["Só conta se saiu", "\"Enviado\" só quando o WhatsApp aceitou.", "Registro de cada tentativa"],
        ["Falha da Meta na abertura da Ana", "Um reenvio por modelo de utilidade; se falhar, espera o lead e cria tarefa humana com alerta. No ar desde 15/11/2026. Prova ao vivo de 17/11/2026: o reenvio agendado foi cancelado pela cadência de abertura, que tomaria a mesma recusa; correção em andamento.", "Central e alerta à gestão"],
        ["Status visível", "Fila por pessoa, avisos pendentes e saúde das rotinas.", "Central e aba BIA do Dash"],
        ["Alerta sem barulho", "Se esgotar, a rotina para de insistir e avisa a gestão; falha passageira só alerta na segunda ocorrência seguida.", "WhatsApp da gestão"],
      ], "", "Camadas de entrega")
      + '<h3 class="mt">Os vigias</h3>'
      + grid([
        card("Dados e rotinas", ul(["Negócio sem tarefa, cadastro incompleto, funil errado, duplicados, tarefa duplicada e congelados.", "Se os avisos do Agendor pararam de chegar, a Bia passa a conferir a cada 2 minutos até normalizar.", "Sincronização do Dash: alerta se parar por mais de 15 minutos."])),
        card("Infraestrutura", ul(["Agendor e automações do n8n nas últimas 24 horas, batimento cardíaco e autoteste.", "Webhook do número da Ana na Meta, a cada 5 minutos.", "Backups: alerta se uma parte passar de 30 horas sem sucesso."])),
        card("Coerência", ul(["Auditor de coerência: lê o que a Bia disse e confere no Agendor se foi feito de verdade; divergência vai à gestão.", ])),
        card("Custo", ul(["Dash, aba Agentes: gasto por modelo, por lead novo, por qualificado e projeção do mês.", "Alerta de custo diário e mensal."])),
      ], 2)
      + aviso("Limites declarados", "Falha de ENVIO entra na fila e é reenviada; falha de ENTREGA recusada pela Meta, nos avisos da Bia, ainda não gera reenvio automático (planejado). Na abertura da Ana o reenvio por utilidade existe, mas no primeiro caso real (17/11/2026) foi cancelado pela cadência; a correção está em andamento. A conferência dos leads do site ainda manda \"chamar pelo WhatsApp\" para número inválido ou de teste; a correção (\"número não existe no WhatsApp: corrigir ou descartar\", contado à parte e sem nova cobrança por 7 dias) está pronta e entra no próximo deploy da Bia. O custo real da Bia ainda não é medido por completo. A conferência do Agendor só enxerga tarefas abertas há menos de 31 dias nas buscas por filtro.", "w"))
    return sec("observ", "Plataforma", "Observabilidade e entrega de avisos", "Vigias, nova tentativa, plano B e status visível na página Central.", corpo)

def s_duvidas():
    faq = [
      ("Por que meu lead não apareceu na página Hoje?", "Use a busca geral no topo: ela procura nos dois funis do SDR por nome, pessoa, CNPJ, telefone, número do negócio ou cidade. Na fila de espera o lead só aparece em \"Começar leads novos\". Lead que entrou depois das 17h30 só começa no próximo dia útil. Se ele não está em um funil do SDR, a página Hoje não o mostra."),
      ("Posso reabrir um lead que ganhei por engano?", "Sim: \"Reabrir lead\" e \"Tirar o Ganho e reabrir\", enquanto o lead ainda não foi entregue ao Arena. Depois do repasse, a Bia não desfaz."),
      ("Por que um lead perdido voltou para a fila?", "É uma das voltas ao SDR. A etiqueta no cartão e a caixa \"De onde veio este lead\" explicam. Ele só começa quando o SDR clica Iniciar."),
      ("Por que a Bia devolveu uma ligação para a página Hoje?", "Porque a ligação foi concluída ou apagada direto no Agendor sem dizer como foi. Abra a página Hoje: se ligou, conclua dizendo o resultado; se não ligou, toque em \"Não houve ligação\"."),
      ("Por que um lead perdido aparece em vermelho?", "Porque foi perdido sem explicação. Escreva em uma frase curta o que aconteceu. O lead continua perdido."),
      ("Por que não chegou a cobrança ao representante?", "O aviso precisa da aprovação da gestão, respeita o intervalo de 20 minutos entre avisos, só sai em dia útil e as cobranças começam às 9h. Lead ainda não distribuído também não gera cobrança."),
      ("A Ana pode prometer preço ou prazo?", "Não. Ela não fala preço, desconto, bonificação nem resultado garantido, e não promete que a Life B fará implantação ou reposição na loja."),
    ]
    gl = [["Agendor", "O sistema de clientes, negócios, tarefas e funis."], ["Ana", "A SDR Inbound virtual do WhatsApp."], ["Bia", "A assistente de operação, que escreve no Agendor e avisa a equipe."],
      ["SDR", "Quem faz o primeiro contato e qualifica o lead."], ["Closer", "Especialista que atende redes e fecha vendas no Arena."], ["Representante", "Vendedor de campo que atende a carteira."], ["Gestão", "Quem aprova, pausa e acompanha o conjunto."],
      ["Lead", "Negócio do Arena."], ["Qualificado", "Lead aprovado pelo SDR e entregue ao Arena (Ganho no SDR)."], ["Cadência", "Sequência de contatos em dias úteis."], ["Dia útil", "Segunda a sexta, sem feriado."],
      ["Fila de espera", "Leads do Outbound sem tarefa, esperando o Iniciar."], ["Fim da cadência", "Etapa depois da última tentativa; três dias úteis antes do fechamento automático."], ["Cadência esgotada", "Motivo usado só pela Bia para quem nunca respondeu."],
      ["Distribuir", "Escolher quem fica com o lead qualificado: um representante ou o próprio SDR."], ["Simulação", "A automação só observa e relata, sem escrever."], ["Com aprovação", "A automação só age depois que a gestão aprova."],
      ["Janela de 24 horas", "Período em que o WhatsApp permite resposta livre, contado da última mensagem do lead."], ["Webhook", "Aviso automático que um sistema manda a outro quando algo acontece."],
      ["RFM", "Recência, frequência e valor de compra do cliente."], ["LTV", "Quanto o cliente vale ao longo do tempo."], ["CNPJ", "Número da empresa na Receita Federal."], ["ERP", "Sistema de faturamento e pedidos da empresa."]]
    corpo = (
      '<h3>Perguntas frequentes</h3>' + "".join(det(q, f"<p>{a}</p>") for q, a in faq)
      + '<h3 class="mt">Quando entrar um novo SDR</h3>'
      + '<p>O sistema foi pensado para crescer: cada SDR terá a própria página Hoje (projetojlbv.com.br/hoje/ seguido do nome) e o próprio painel de vendas, e só enxerga os leads que passaram por ele.</p>'
      + ul(["A equipe técnica cadastra o SDR nas listas do sistema, com nome completo, telefone e conta no Agendor. Uma conferência automática acusa se alguma lista ficar fora de sincronia.", "As regras de ligação com resultado, perda com explicação e dono ativo passam a cobrir o novo SDR depois do cadastro.", "Ele passa a aparecer na lista de distribuição, com a opção \"Fico com este lead\".", "Criar o atalho curto da página e, se ele também vender, o painel dele."])
      + aviso("Situação atual: um único SDR", "A página Hoje funciona com um acesso só. Antes de entrar o segundo SDR é preciso dar a cada um o seu acesso e filtrar a página pelos leads dele. Está na lista de próximos passos.", "w")
      + '<h3 class="mt">Glossário</h3>' + tabela(["Termo", "Quer dizer"], gl, "", "Glossário"))
    return sec("duvidas", "Referência", "Dúvidas, novo SDR e glossário", "Respostas rápidas e o vocabulário da operação.", corpo)

import re as _re
def vis(v):
    """Versão para o leitor: identificadores técnicos de commit ficam só em HISTORICO.md e versoes.json."""
    return "Versão registrada no histórico interno" if _re.search(r"(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])\b[0-9a-f]{8}\b", v) else v

def s_versoes():
    import json, os
    d = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "versoes.json"), encoding="utf-8"))
    rows = []
    for x in d["sistemas"]:
        v = x["verif"]
        est = pill("ok", "No ar") if x["estado"] == "no ar" else pill("te", "Em implantação")
        vf = "<br>".join(f"<b>{k.capitalize() if k!='fumaca' else 'Fumaça'}:</b> {val}" for k, val in v.items())
        rows.append([x["nome"], f"<b>{vis(x['versao'])}</b>" + (f"<br><span class=\"muted\">{x['nota']}</span>" if x["nota"] else ""), x["data"], est + "<br><span class=\"muted\">Fonte: " + x["fonte"] + "</span>", vf])
    ciclo = passos([("Varredura de todos os lugares", "A regra mudada é procurada no código, nas mensagens, nas páginas, na página Central, neste Ecossistema e nos documentos. O roteiro exige a linha \"Varredura:\"."),
        ("Testes", "Suíte principal (cerca de 12 mil verificações) e suítes dos módulos; nas páginas, testes de tela em navegador real, 5 larguras e dois temas."),
        ("Auditoria independente", "Revisor separado, que não corrige o próprio achado, tenta quebrar a mudança. Em páginas, inclui auditoria visual olhando os prints."),
        ("Antirregressão", "Linha \"Antirregressão:\" obrigatória: baseline, conversas reais como casos, mutação das travas, volta atrás testada."),
        ("Publicação pelo roteiro único", "Com cópia de segurança antes. Servidor primeiro, página depois."),
        ("Fumaça", "Depois de publicar, confere a versão no ar e roda o fluxo principal; a gestão recebe o resumo."),
        ("Rollback", "A versão anterior fica guardada e a volta atrás é testada. Registrada aqui, junto da versão e da data.")])
    corpo = (aviso("De onde vêm estes números", "Quando dá, a versão é lida ao vivo (rota de versão ou lista de versões do servidor). Quando não dá, vem do arquivo de dados desta página, atualizado pelo roteiro de deploy de cada sistema. \"A registrar\" significa que a leitura ainda não existe: nada é inventado. Posição de " + d["atualizado_em"] + ".", "n")
      + tabela(["Sistema", "Versão em produção", "Último deploy", "Estado", "Checklist de verificação do último deploy"], rows, "ver", "Versão de cada sistema e verificações do último deploy")
      + '<h3 class="mt">Deploys recentes e o que foi verificado em cada um</h3>' + tabela(["Sistema", "Data", "Verificações"], [[x["sistema"], x["data"], "<br>".join(f"<b>{k}:</b> {x[k]}" for k in ("varredura", "testes", "auditor", "fumaca", "rollback"))] for x in d.get("deploys", [])], "ver", "Deploys recentes")
      + '<h3 class="mt">O que se verifica em todo deploy</h3>' + ciclo
      + grid([card("Atualização automática pelo deploy", "<p>O roteiro de deploy de cada sistema chama a atualização do arquivo de versões depois de publicar (versão, data e resultado de cada verificação) e remonta esta página. Hoje o comando existe; ligá-lo em cada roteiro de deploy é o próximo passo.</p>", p="pl"),
              card("Documentação de cada verificação", "<p>Cada deploy deixa registro: o que foi varrido, quais testes rodaram e o resultado, quem auditou e o veredito, o resultado da fumaça e como voltar atrás. Os registros ficam nos documentos do projeto e as linhas de resumo aparecem aqui.</p>", p="ok")], 2)
      + '<h3 class="mt">Histórico de versões desta página</h3>' + tabela(["Versão", "Data", "O que mudou"], [
        [VERSAO, DATA_V, "Estado de 17/11/2026 (noite): página Hoje 17.5 e servidor da página Hoje no ar; página Central publicada (janela de 24 h, formulário, repasse, Passar ao SDR sem travar a tela); Dash com faixa de dados congelados e rosca sem corte no ar; servidor da Ana em correção (o deploy abortou), com selo próprio; regras da gestão de 17/11/2026 (ação do SDR instantânea, arquivar com volta automática, distribuição manual, topo recolhível); slides novos de como o SDR e a equipe veem as páginas Hoje e Central."],
        ["2026-11-17.2", "17/11/2026", "Estado de 17/11/2026 (04h30): repasse manual da página Central e ficha com início agendado no ar no servidor; contador de chamadas ao Agendor e nota única de repasse preparados e desligados; página Central em implantação (9h às 19h)."],
        ["2026-11-17.1", "17/11/2026", "Estado atualizado para 17/11/2026 (Ana-2a, página Hoje e pacote da página Central em implantação); versões da Ana e da Bia atualizadas; textos sobre a ponte e a página Central ajustados ao que o código garante."],
        ["2026-11-16.2", "16/11/2026", "Rodada 2: seção e slides \"Quem é quem\" (glossário em linguagem simples); modo apresentação com todos os capítulos da página (índice navegável pela tecla G, fluxogramas encaixados em partes, texto que se ajusta sozinho); pacote 1 da Ana e limpeza de avisos da Bia no ar; Central nova ainda em implantação; cópia automática de avisos ao gestor desligada; sem códigos técnicos e contagens voláteis."],
        ["2026-11-16.1", "16/11/2026", "Página atualizada para 16/11/2026: funis Ana, SDR Inbound e Arena (a Ana ganha ao qualificar e o SDR Inbound nasce na etapa Ana qualificou), Hoje sem travas de horário, pacote da Ana no ar, Central nova em implantação, futuros marcados como planejado; novo modo apresentação em slides (tela cheia, sem rolagem, celular em pé); estado por componente em estado.json e data de atualização na página."],
        ["2026-11-15.1", "15/11/2026", "Versões reais de Ana, Bia e Central (lidas do servidor e do git); camada de entrega da Ana no ar; datas alinhadas a 15/11/2026; restaurados o mapa de infraestrutura, a grade de horários dos resumos e a nota do GS Engage legado; Hoje release 1 no ar; registro de deploys e verificações."],
        ["2026-11-14.1", "14/11/2026", "Página refeita, com fluxogramas, modo apresentação, status e checklist."],
        ["2026-11-09", "09/11/2026", "Versão anterior, de 20 seções."]], "", "Histórico"))
    return sec("versoes", "Plataforma", "Versões e verificações por deploy", "A versão de cada sistema, a data do último deploy e o checklist que foi feito.", corpo)

def s_sobre():
    corpo = (
      '<h3>Versão desta página</h3>'
      + f'<p><b>Versão {VERSAO}</b>, de {DATA_V}. A cada entrega que muda uma regra, um processo, uma automação ou o status de algo, esta página é atualizada, o número da versão sobe e uma linha é acrescentada abaixo. O histórico completo fica guardado junto do código da página.</p>'
      + tabela(["Versão", "Data", "O que mudou"], [
        [VERSAO, DATA_V, "Estado de 17/11/2026 (noite): página Hoje 17.5 e servidor da página Hoje no ar; página Central publicada (janela de 24 h, formulário, repasse, Passar ao SDR sem travar a tela); Dash com faixa de dados congelados e rosca sem corte no ar; servidor da Ana em correção (o deploy abortou), com selo próprio; regras da gestão de 17/11/2026 (ação do SDR instantânea, arquivar com volta automática, distribuição manual, topo recolhível); slides novos de como o SDR e a equipe veem as páginas Hoje e Central."],
        ["2026-11-17.2", "17/11/2026", "Estado de 17/11/2026 (04h30): repasse manual da página Central e ficha com início agendado no ar no servidor; contador de chamadas ao Agendor e nota única de repasse preparados e desligados; página Central em implantação (9h às 19h)."],
        ["2026-11-17.1", "17/11/2026", "Estado atualizado para 17/11/2026 (Ana-2a, página Hoje e pacote da página Central em implantação); versões da Ana e da Bia atualizadas; textos sobre a ponte e a página Central ajustados ao que o código garante."],
        ["2026-11-16.2", "16/11/2026", "Rodada 2: seção e slides \"Quem é quem\" (glossário em linguagem simples); modo apresentação com todos os capítulos da página (índice navegável pela tecla G, fluxogramas encaixados em partes, texto que se ajusta sozinho); pacote 1 da Ana e limpeza de avisos da Bia no ar; Central nova ainda em implantação; cópia automática de avisos ao gestor desligada; sem códigos técnicos e contagens voláteis."],
        ["2026-11-16.1", "16/11/2026", "Página atualizada para 16/11/2026: funis Ana, SDR Inbound e Arena (a Ana ganha ao qualificar e o SDR Inbound nasce na etapa Ana qualificou), Hoje sem travas de horário, pacote da Ana no ar, Central nova em implantação, futuros marcados como planejado; novo modo apresentação em slides (tela cheia, sem rolagem, celular em pé); estado por componente em estado.json e data de atualização na página."],
        ["2026-11-15.1", "15/11/2026", "Versões reais de Ana, Bia e Central (lidas do servidor e do git); camada de entrega da Ana no ar; datas alinhadas a 15/11/2026; restaurados o mapa de infraestrutura, a grade de horários dos resumos e a nota do GS Engage legado; Hoje release 1 no ar; registro de deploys e verificações."],
        ["2026-11-14.1", "14/11/2026", "Página refeita: seções navegáveis, status e checklist honestos, fluxogramas com tema claro e escuro, a página Central e suas conexões, modo apresentação e tela cheia, posição preservada ao atualizar e nenhum nome de pessoa. Entra o que mudou desde 09/11/2026: Ana com apresentação em capítulos, Bia com funil da Ana por nome, folga e vínculo de empresa, os 3 destinos, observabilidade e entrega garantida."],
        ["2026-11-09", "09/11/2026", "Versão anterior: 20 seções com vocabulário, funis etapa por etapa, cadência, Hoje e Lista, regras, voltas ao SDR, Bia, Dash, Painel do Representante, Ana, camada do Agendor, testes e segurança."],
      ], "", "Histórico de versões")
      + '<h3 class="mt">Sobre este guia</h3>'
      + '<p>Este guia reflete o sistema em <b>'+DATA_V+'</b>. Regras e prazos podem mudar depois. Em caso de dúvida, o que está ao vivo (aba BIA do Dash e o Agendor) vale mais do que este texto. A cada mudança de regra, esta página é atualizada junto.</p>'
      + '<h3 class="mt">Modo apresentação e tela cheia</h3>'
      + '<p>Toque em <b>Apresentar</b> no topo da página para ver a apresentação em slides: tela cheia, sem rolagem, no computador, no projetor, no tablet e no celular (em pé ou deitado). Os slides se ajustam sozinhos a qualquer tela.</p>'
      + tabela(["Tecla ou gesto", "O que faz"], [
        ["Seta para a direita, Espaço ou Page Down", "Próximo slide"], ["Seta para a esquerda ou Page Up", "Slide anterior"], ["Home e End", "Primeiro e último slide"],
        ["F", "Entra e sai da tela cheia"], ["T", "Alterna o tema claro e escuro"], ["Esc", "Sai da apresentação"],
        ["Deslizar (celular e tablet) ou clicar nas bordas", "Muda de slide"], ["Barra inferior e bolinhas laterais", "Anterior, próximo, tema, tela cheia, sair e ir a um slide"],
      ], "", "Atalhos do modo apresentação")
      + ul(["O indicador mostra o slide atual e o total, e a barra no alto mostra o progresso.", "Se você atualizar a página, ela volta para o mesmo slide (endereço #slide-3, por exemplo).", "O estado de cada componente (no ar, em implantação, planejado) e a data de atualização saem do arquivo estado.json, o mesmo que alimenta os slides."])
      + '<h3 class="mt">Navegação</h3>'
      + ul(["No computador, o índice fica à esquerda; no celular, no botão Menu.", "A busca do índice filtra as seções que contêm o termo.", "Tema claro, escuro ou automático pelo botão de tema no topo.", "Os desenhos dos fluxos se ajustam: versão larga no computador e versão em coluna no celular."]))
    return sec("sobre", "Referência", "Sobre esta página e o modo apresentação", "Como usar, atalhos e o que esta página garante.", corpo)
