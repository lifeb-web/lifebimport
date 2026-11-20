"""Seções 1 a 8 do Ecossistema."""
from comp import *
from diagramas import fig
import dados_status as S

import json as _j0, os as _o0
DATA = _j0.load(open(_o0.path.join(_o0.path.dirname(_o0.path.abspath(__file__)), "estado.json"), encoding="utf-8"))["atualizado_em"]

def s_inicio():
    c = S.contagem()
    corpo = (
      '<div class="faixa-i"><span class="chip">Versão '+__import__("conteudo3").VERSAO+' · atualizado em '+DATA+'</span><span class="chip">Sem dados pessoais de clientes</span><span class="chip">Conferido no código e nos painéis</span>'
      '<span class="faixa-t">Mapa da operação comercial: como o lead chega, quem atende, onde fica cada informação e quais regras seguram tudo.</span>'
      '<a class="btn pri" href="#status">Ver o status de hoje</a></div>'
      + stats([(c["ok"], "entregas no ar e conferidas", "ok"), (c["te"], "prontas e em implantação (ainda não no ar)", "te"), (c["pl"] + c["of"] + c["lm"] + c["ap"], "planejadas, desligadas de propósito, com limite conhecido ou no ar com resultado a provar", "pl"), (c["de"], "dependem de decisão da gestão", "de")])
      + '<h3 class="mt">Em 1 minuto</h3>'
      + grid([
        card("A conversa", ul(["A <b>Ana</b> atende leads no WhatsApp, 24 horas por dia, apresenta o projeto, qualifica e passa ao time comercial.", "Quem entende o lead é a IA; quem trava o que pode ser dito e feito são regras fixas, que não dependem da IA.", "Quem some recebe toques de retomada; qualquer resposta cancela o que falta."])),
        card("O registro", ul(["O <b>Agendor</b> (CRM) é a fonte da verdade: se está lá, é o que vale.", "A Ana decide e pede; por desenho, a <b>Bia</b> escreve no Agendor, e só diz \"feito\" depois de reler.", "Quando a Ana qualifica, o negócio dela vira Ganho e nasce um negócio no SDR Inbound (etapa \"Ana qualificou\", dono SDR). O Arena só nasce quando o SDR qualifica pela página Hoje."])),
        card("O trabalho", ul(["O SDR trabalha na página <b>Hoje</b>; a gestão controla pela página <b>Central</b>; o representante usa o <b>Painel do Representante</b>; os números ficam no <b>Dash</b>.", "A Bia avisa a equipe pelo WhatsApp, com botões, no horário certo."])),
        card("A segurança", ul(["Nada vai ao ar sem testes, auditoria independente, cópia de segurança e o roteiro único de publicação.", "Falha de envio de aviso entra numa fila durável e é reenviada sozinha; falha de entrega recusada pela Meta ainda não (planejado).", "A gestão tem interruptores de emergência em cada regra."])),
      ]))
    NAV.append(("Começar", "inicio", "Capa e resumo"))
    return (f'<section class="sec sec-capa" id="inicio" data-n="1" data-t="Capa e resumo" aria-labelledby="h-inicio"><div class="sec-in">'
            f'<h2 id="h-inicio" class="sr">Capa e resumo do Ecossistema Life B</h2>{corpo}</div></section>')

def s_status():
    import pecas as P
    cards = [P.peca(P.COMP[i], area=nome) for nome, ids in P.AREAS for i in ids] + [P.peca_extra(*x) for x in P.extras()]
    area = grid(cards, 3)
    corpo = (f'<div class="areas">{area}</div>'
      + '<h3 class="mt">Depende de decisão da gestão</h3>' + ul(S.DEPENDE)
      + aviso("Como ler este status", "\"No ar\": conferido em produção, sem pendência declarada. \"Em implantação\": pronto, ainda não no ar. \"Planejado\": futuro. \"Em voo\": publicando agora. \"Em correção\": publicação abortou ou achou-se defeito; não está no ar.", "n"))
    return sec("status", "Começar", "Status: no ar, em teste e planejado", f"Posição de {DATA}. Uma ficha por peça, em ordem por área; a linha do tempo de cada ficha guarda o texto completo.", corpo)

def s_checklist():
    grupos = {}
    for g, i, st, p in S.CHECK:
        grupos.setdefault(g, []).append([g, i, pill(st), p])
    blocos = "".join(det(f"{g} ({len(rows)} itens)", tabela(["Área", "Entrega", "Estado", "Prova ou pendência"], rows, "ck", f"Checklist de entregas: {g}"), aberto=(k == 0)) for k, (g, rows) in enumerate(grupos.items()))
    corpo = (aviso("Checklist honesto", "Uma entrega só entra como \"No ar\" quando foi conferida em produção. Quando existe pendência, ela é escrita na última coluna e o item não é tratado como concluído. Cada área abre e fecha.", "n") + blocos)
    return sec("checklist", "Começar", "Checklist de entregas", f"Cada entrega, o estado dela em {DATA} e o que ainda falta. Atualizado a cada publicação.", corpo)

def s_visao():
    import pecas as P
    vocab = [
      ["Life B Importadora", "Importadora que vende para drogarias e supermercados, por meio de representantes de campo."],
      ["Representante", "Vendedor de campo: atende as lojas, negocia e fecha pedidos."],
      ["SDR", "Profissional de pré-venda: faz os primeiros contatos, descobre quem tem interesse e entrega ao time de vendas. A <b>Ana</b> é o SDR Inbound virtual (IA) do WhatsApp."],
      ["Lead e lead qualificado", "Lead é a empresa com interesse ou potencial de compra; entra por anúncio, site, lista ou WhatsApp direto. Qualificado é o que confirmou interesse e foi entregue ao time de vendas."],
      ["Cadência", "Sequência de contatos em dias úteis combinados."],
      ["Inbound e lista", "Inbound: o lead chega por anúncio, site (formulário) ou WhatsApp direto e é atendido pela Ana. Lista (outbound): a Life B vai atrás do lead; quem trabalha as listas é o SDR humano."],
      ["Funil e etapa", "Sequência de etapas pela qual um negócio avança no Agendor."],
      ["Arena", "O funil de vendas dos representantes (closers). A IA não vende: a venda é feita por pessoas."],
      ["Agendor", "O CRM da empresa (clientes, negócios e tarefas). É a fonte da verdade."],
      ["Bia", "A assistente de operação: aplica as regras, escreve no Agendor, avisa a equipe pelo WhatsApp e faz o trabalho repetitivo."],
      ["Central, Hoje, Painel do Representante e Dash", "As páginas de trabalho: controle, mesa do SDR, carteira de cada representante e painel de números."],
    ]
    pecas = [
      ["Agendor", "Clientes, negócios, tarefas e funis. Fonte da verdade.", "SDR, representantes e gestão"],
      ["Ana", "SDR Inbound virtual que conversa pelo WhatsApp, qualifica e registra. Serviço próprio na nuvem, 24 horas.", "Leads (quem conversa); gestão (quem controla)"],
      ["Bia", "Por desenho, quem escreve no Agendor e envia os avisos. Roda o tempo todo e conversa com a equipe pelo WhatsApp.", "Gestão, SDR e representantes"],
      ["Hoje e Lista", "Mesa de trabalho do SDR e envio de listas de empresas.", "SDR"],
      ["Central", "Painel de controle com login: saúde, interruptores, atendimento da Ana, filas e calendário de folga.", "Gestão (muda tudo), administradores (risco baixo e médio), SDR (só lê)"],
      ["Painel do Representante", "Carteira ao vivo, com as ações do dia.", "Representantes e SDR que também vende"],
      ["Dash Geral e telão", "Números: vendas, reposição, SDR, anúncios, visitas e saúde da Bia.", "Gestão e equipe comercial"],
      ["Canal", "Aplicativo web de conversa da gestão com o assistente de engenharia.", "Gestão"],
      ["Páginas de captação", "Páginas de anúncio que geram leads.", "Público externo"],
    ]
    papeis = [
      ["Gestão", "Decide o que a Bia e a Ana podem fazer, aprova avisos sensíveis, vê todos os números e é avisada quando algo precisa de atenção.", "WhatsApp, Central, Dash, Agendor"],
      ["SDR", "Primeiro contato, qualificação e distribuição do lead qualificado.", "Hoje, Lista, WhatsApp"],
      ["Representante", "Vende no Arena e cuida do Pós-venda e da Reativação.", "WhatsApp, Painel do Representante, Agendor"],
      ["Administrador", "Acompanha e muda só o que tem risco baixo ou médio.", "Central"],
      ["Conta técnica \"Sistema\"", "Conta que a Bia usa para escrever no Agendor. Em regra, nenhuma pessoa a usa e ela não deve ser dona de um negócio.", "Só a Bia"],
    ]
    corpo = (grid([card("Resumo", '<p>A Life B vende para drogarias e supermercados por meio de representantes de campo. Em volta dessa venda existe um conjunto de peças que conversam entre si. Este guia mostra cada peça, o caminho do lead e as regras que mantêm tudo em ordem.</p>')], 1)
      + '<h3 class="mt">Quem escreve onde</h3>' + fig("mapa")
      + '<p class="legenda">Setas cheias: dados e avisos. A Ana nunca escreve direto no Agendor nem manda aviso por conta própria: pede à Bia, que aplica as regras e confere.</p>'
      + '<h3 class="mt">Infraestrutura em uma tabela</h3>' + tabela(["Camada", "O que é", "Onde"], [
        ["Gatilhos", "Mensagem no WhatsApp, clique em botão, aviso do Agendor, formulário de anúncio e relógios de 1 minuto, 5 minutos, 24 horas e diários.", "WhatsApp (Meta), Agendor, páginas"],
        ["Cérebro operacional", "O programa da Bia: regras, travas de envio (qualidade, janela de 24 horas, aprovação), Motor Proativo, operação do SDR, Pós-venda e Reativação, guardas, garantia de tarefa e vigias.", "Worker da Bia (nuvem)"],
        ["Agente de conversa", "Entende o WhatsApp, usa o contexto e a memória e passa pelo proxy do modelo de IA.", "Fluxo do n8n (Bia) e serviço próprio (Ana)"],
        ["IA", "Modelos de linguagem, com modelos reserva se o principal falhar.", "Provedor de IA e reserva"],
        ["Memória", "Conhecimento, histórico das conversas e estado do dia a dia.", "Banco de dados (Supabase)"],
        ["Estado e filas", "Interruptores, filas, reservas e números do Dash.", "KV, Durable Objects e D1 (Cloudflare)"],
        ["Cópias e vigia externo", "Backups criptografados e cópia do código a cada publicação.", "Dropbox, GitHub e Drive"],
        ["Destinos", "Agendor (fonte da verdade), WhatsApp (texto, botões e listas), representantes, SDR e gestão (alertas e relatórios).", "Agendor, Meta"],
      ], "", "Infraestrutura")
      + '<h3 class="mt">As peças e quem usa cada uma</h3>' + tabela(["Peça", "O que é", "Quem usa"], pecas, "", "Peças do ecossistema")
      + '<h3 class="mt">Quem faz o quê, por papel</h3>' + tabela(["Papel", "O que faz", "Onde trabalha"], papeis, "", "Papéis")
      + '<h3 class="mt">Quem atende cada entrada</h3>' + P.figura_papeis()
      + det("Vocabulário essencial (toque para abrir)", tabela(["Termo", "Quer dizer"], vocab, "", "Vocabulário")))
    return sec("visao", "Entender", "Como tudo se conecta", "As peças, quem usa cada uma e onde cada informação é escrita.", corpo)

def s_entrada():
    corpo = (grid([
      card("Inbound: anúncio e site", ul([
        "As páginas de captação ficam em projetojlbv.com.br. Quando alguém preenche o formulário, a Bia cria empresa, pessoa e negócio no começo do funil SDR Inbound, sem duplicar quem já existe.",
        "O aviso ao SDR traz contato, empresa, anúncio de origem e o prazo: 15 minutos em dia útil, das 8h às 18h. Fora do horário, o lead espera na página Hoje até o próximo dia útil às 8h.",
        "Quando o link do anúncio chega sem a campanha, o aviso diz \"campanha não identificada\" em vez de inventar.",
        "A campanha de Redes pergunta o número de lojas; nas demais, a Ana presume uma loja."]), p="ok"),
      card("WhatsApp direto para a Ana", ul([
        "Quem chama o número da Ana é atendido na hora, a qualquer hora.",
        "A Ana procura o telefone em todos os funis antes de criar algo. Se o lead já existe, ela não cria outro: grava uma nota no negócio existente e avisa o dono.",
        "Quem se cadastrou e não escreveu recebe uma abertura da Ana cerca de 5 minutos depois, se o lead não escrever antes."]), p="ok"),
      card("Outbound: lista do SDR", ul([
        "O SDR sobe a planilha na página Lista (até 300 por vez), dá um nome à lista e vê a prévia antes de criar.",
        "A Bia confere CNPJ, telefone e empresa com negócio aberto antes de criar, e guarda de qual lista cada lead veio.",
        "Os leads do Outbound ficam na <b>fila de espera</b>: em regra nada começa sozinho; o SDR escolhe quando Iniciar."]), p="ok"),
      card("Volta ao SDR", ul([
        "Três rotinas devolvem negócios ao SDR: Recuperação SDR, Recuperação e Reativação, esta com uma segunda onda para quem foi perdido na Reativação (seção Recuperação e reativação).",
        "O negócio que volta nasce novo, na fila, com a nota de onde veio."]), p="ok"),
    ], 2)
    + '<h3 class="mt">Telefones padronizados</h3>'
    + '<p>A Bia padroniza todo telefone do mesmo jeito: celular digitado sem o 9 ganha o 9, zero na frente e código de operadora são removidos, e só valem números com 10 ou 11 dígitos. Se o telefone já existe em um negócio aberto de outra empresa, o negócio novo é criado separado e o aviso conta isso.</p>'
    + aviso("Origem do negócio", "Cada negócio guarda de onde veio: Inbound, Outbound, Recuperação, Reativação, Recuperação SDR, SuperAgos, Nossa Rede ou Indicação. A origem da empresa e da pessoa nunca muda; a origem do negócio pertence ao negócio. As origens de volta nascem só de automações.", "n")
    + aviso("Ferramenta antiga encerrada", "A antiga ferramenta de prospecção (GS Engage) foi encerrada em 19/10/2026. Nenhuma automação cria lead nela; só o histórico dela aparece nos números.", "n"))
    return sec("entrada", "Entender", "Como o lead entra", "Três caminhos de entrada, e uma regra para todos: nunca duplicar quem já existe.", corpo)

def s_ana():
    capitulos = "Impulso, modelo sem caixa fechada, espaço, público feminino, case, implantação, acompanhamento do giro e indústria. Nunca repete um capítulo."
    corpo = (
      '<p>A Ana é o SDR Inbound virtual (IA) da Life B. Conversa com o lead pelo número dela e tem um objetivo só: <b>qualificar</b>. Ela se apresenta como \"Ana, da equipe Life B\", apresenta o projeto Mega Vision USA (exposição categorizada e personalizada de produtos de alto giro na loja), entende a loja e entrega o lead pronto ao especialista.</p>'
      + '<h3 class="mt">Do lead novo ao destino</h3>' + fig("jornada")
      + '<p class="legenda">Quando a Ana qualifica, o negócio dela vira Ganho (qualificação, nunca venda) e nasce um negócio no SDR Inbound, na etapa "Ana qualificou", com o SDR como dono. Quem pede uma pessoa ou traz um caso que a Ana não resolve, sem qualificar, não ganha nem perde: o mesmo negócio muda para a etapa "Repasse da Ana" do SDR Inbound. A Ana nunca cria negócio no Arena: ele só nasce quando o SDR qualifica pela página Hoje e escolhe o representante (o closer); ao lead sempre se diz "especialista". Quem não serve vai a perdido com motivo (e um perdido só volta a ser qualificado se for reaberto); quem some entra nos toques de retomada. Os detalhes estão na seção Funis do Agendor.</p>'
      + '<h3 class="mt">O fluxo da conversa</h3>'
      + fluxo([("1. Nome e tipo de loja", "Pergunta o nome e o segmento."), ("2. CNPJ", "Pede uma vez; se o lead só responde \"sim\", pede de outro jeito, no máximo 2 vezes."), ("3. Apresentação completa", "8 capítulos curtos, 2 por turno, com uma pergunta leve de reação. Pergunta ou objeção do lead é respondida primeiro.", "m"), ("4. Lojas e decisor", "Lojas só na campanha de Redes; nas demais, presume uma. O decisor vem no fim."), ("5. Repasse", "Diz o que acontece a seguir e passa ao especialista.", "g")])
      + '<p class="legenda">Capítulos da apresentação: ' + capitulos + ' Respostas sobre implantação e reposição dizem que o projeto prevê isso e que o especialista avalia como seria na loja: a Ana não promete que a Life B vai fazer.</p>'
      + '<h3 class="mt">O caminho de cada mensagem</h3>' + fig("msg")
      + grid([
        card("Guardar primeiro", "<p>A mensagem do lead entra no histórico antes de qualquer outra coisa, mesmo com a Ana parada. Nada se perde.</p>"),
        card("Juntar mensagens", "<p>Se o lead está escrevendo, a Ana espera 8 segundos sem mensagem nova (no máximo 20 segundos desde a primeira do grupo) e responde tudo de uma vez. Só a primeira resposta a um lead novo espera de 75 a 150 segundos, como uma pessoa faria.</p>"),
        card("Cumprimento primeiro", "<p>Quem só diz \"bom dia\" recebe o cumprimento de volta, com o nome, antes de qualquer explicação.</p>"),
        card("Voz", "<p>Responde em áudio quando o lead manda áudio ou pede. Cascata: voz da Ana, uma versão reserva e, por último, a voz da Bia. Se tudo falhar, vai em texto.</p>"),
      ], 2)
      + '<h3 class="mt">Os portões: quem é o foco</h3>'
      + tabela(["Situação", "Como a Ana trata"], [
        ["Foco: farmácia, drogaria e supermercado", "Atendimento completo e acolhedor, sem conversa de valor mínimo."],
        ["Outros segmentos e MEI", "Todos podem comprar, mas no fim a Ana avisa com educação que o pedido começa em R$ 2 mil e pergunta se o interesse é real. " + pill("te", "Em teste: perguntar se quer testar com um primeiro pedido, sem valor em reais")],
        ["Empresa nova (CNPJ com menos de 2 anos)", "Deixa o lead ciente de que o fechamento é à vista ou no cartão, em até 3x sem juros ou 12x com juros. Não dispensa: passa ao especialista decidir."],
        ["Rede (quatro ou mais lojas)", "Sem qualificar: repasse direto ao time comercial, com atenção humana, e continua respondendo."],
        ["Só empresa, sem CNPJ", "Explica com educação, continua tirando dúvidas e só repassa com o CNPJ."],
        ["Já é da casa (cliente com negócio ganho ou em Pós-venda, ou lead em atendimento)", "Não requalifica: avisa a gestão e o dono do negócio e aguarda a equipe."],
        ["Fora de Goiás e do Distrito Federal", "O lead qualificado vai ao Arena."],
      ], "", "Portões de segmento e porte")
      + '<h3 class="mt">Quando o lead some ou pede para voltar</h3>'
      + fluxo([("Retorno combinado", "\"Me chama amanhã às 10h\": a Ana cria a tarefa e volta no horário, ajustado ao horário de contato da Ana."), ("Toques de retomada", "<ul class=\"pts\"><li>Quem para no meio: o 1º toque vem poucas horas depois; os seguintes, em dias úteis e horário comercial.</li><li>Fora do foco recebe menos toques.</li><li>Cadastrou e nunca escreveu: poucos toques (abertura, caso ou pergunta, valor, encerramento).</li><li>Retorno combinado: poucas tentativas.</li></ul>", "m"), ("Sem resposta", "Qualquer resposta do lead cancela o que falta. No fim, o negócio vai para a etapa Deal breaker.", "x")])
      + '<p class="legenda">Quando o lead escreve, a Ana responde a qualquer hora e dia. Quando a iniciativa é dela, só dentro do horário de contato (horário de Brasília): 8h às 22h em dia útil e 9h às 20h em fim de semana e feriado. Fora da janela de 24 horas da Meta ela usa um modelo aprovado. Tudo cancela sozinho se o lead voltou, se a equipe assumiu ou se a Ana está pausada. ' + '</p>'
      + aviso("Um toque por dia e autocura da cadência parada (20/11/2026)", "A Ana manda no máximo 1 toque automático por lead por dia e nunca 2 em 5 horas; o que passar disso é adiado para o dia útil seguinte (teto de 10 por dia). \"Por enquanto não\" ou \"ainda não\" recebe 1 despedida e retorno em 20 dias úteis (valor a confirmar). A autocura da cadência parada, que recria os toques cancelados por engano, está em modo SIMULAR: só lê e manda 1 resumo por dia; só passa a agir se a gestão ligar a chave dela.", "n")
      + '<h3 class="mt">Quando uma pessoa entra na conversa</h3>'
      + fluxo([("Gatilhos", "Lead pede uma pessoa, mídia ilegível, resposta bloqueada, dúvida fora da base, irritação ou insistência depois do repasse."), ("Equipe assume ou instrui", "Pela Central, no mesmo número. Assumir faz a Ana se calar; instruir faz ela agir sem a equipe assumir.", "m"), ("Devolve à Ana", "Com um clique. Ela relê tudo, inclusive o que a equipe escreveu, e segue.", "g")])
      + grid([
        card("Instrução não é mensagem", "<p>Há dois botões: \"Só orientar\" (a Ana guarda e usa na próxima resposta) e \"Orientar e mandar agora\" (age na hora, uma única vez). A instrução pode ser digitada ou gravada em áudio, e, em regra, o lead não percebe que ela existiu.</p>", p="ok"),
        card("Ficha do lead na página Central", "<p>Mostra onde o lead está: etapa do funil, momento da conversa e cadência (por exemplo, \"toque 2\"), progresso da qualificação (segmento, CNPJ, empresa, projeto apresentado, quem decide), sinais, dúvidas e anotações.</p>", p="ok"),
      ], 2))
    return sec("ana", "Ana, o SDR Inbound virtual (IA)", "Ana: a conversa", "Fluxo, apresentação, qualificação, portões, retomada e intervenção da equipe.", corpo)

def s_ana2():
    ia = tabela(["Quem", "O que faz", "Estado"], [
      ["IA (entende)", "Lê a mensagem, entende a intenção, transcreve e lê mídia, redige a resposta no estilo da Ana usando o que já se sabe do lead.", pill("ok")],
      ["Regras fixas (travam)", "Decidem se a resposta pode sair: termos proibidos, gancho no fim, tamanho, repetição, horário, quem é foco, o que a Ana nunca diz e o que ela nunca escreve no Agendor. Não dependem da IA.", pill("ok")],
      ["Texto padrão seguro", "Se a IA falhar ou o validador reprovar, entra um texto seguro. A Ana nunca fica no vácuo.", pill("ok")],
      ["Objeções entendidas por IA", "Hoje parte do entendimento ainda usa listas de palavras. O desenho novo entrega a objeção à IA e mantém as travas.", pill("pl")],
      ["Texto pronto só saudação", "Texto pronto de página ou botão nunca é declaração do lead: não gera segmento, rede nem número de lojas, mesmo emendado com palavras do lead.", pill("pl")],
      ["Mídia nunca vira fala", "Imagem e áudio não são tratados como frase do lead para efeito de conclusões.", pill("pl")],
    ], "", "Entendimento por IA e travas determinísticas")
    corpo = (
      aviso("O princípio", "A IA entende e escreve. Quem decide o que pode acontecer são regras que não dependem da IA: o que a Ana pode dizer, o que pode gravar e quando pode falar. Assim, um erro de interpretação não vira promessa nem escrita errada no CRM.", "n")
      + '<h3 class="mt">Entendimento por IA e travas determinísticas</h3>' + ia
      + '<h3 class="mt">O que a Ana nunca faz</h3>'
      + grid([
        card("Nas conversas", ul(["Falar preço de produto, desconto, bonificação ou resultado garantido (exceto o mínimo de R$ 2 mil para outros segmentos e a condição de pagamento da empresa nova).", "Dizer que a Life B faz a implantação ou a reposição na loja do lead.", "Falar em proposta, investimento ou orçamento, ou perguntar faturamento.", "Dizer segmento diferente ou \"fora do perfil\".", "Negar ser uma inteligência artificial quando perguntam.", "Prometer áudio, ligação ou horário que não vai cumprir.", "Falar com quem pediu para parar.", "Citar concorrentes."])),
        card("Nas ações", ul(["Escrever por iniciativa própria fora do horário de contato (8h às 22h em dia útil; 9h às 20h em fim de semana e feriado).", "Passar o número do time sem o lead pedir.", "Falar com os representantes.", "Dizer que anotou, recebeu ou fez algo que não aconteceu. Se o CNPJ falado em áudio não fechar, ela repete o que entendeu e pergunta se está certo.", "Escrever direto no Agendor: só pede à Bia.", "Marcar ganho ou perdido por conta própria: hoje ela só muda a etapa do próprio funil, cria tarefa de retorno e escreve nota.", "Mandar apresentação ou convite nos pedidos reconhecidos como vaga ou currículo: a Ana avisa que o canal é para lojistas e, se a pessoa escrever de novo, fica em silêncio e alerta a equipe; só conta como loja própria quem diz com palavras próprias, quem diz que é lojista reabre a conversa, e um \"tem vaga?\" curto cai na pergunta neutra (20/11/2026).", "Descartar quem pede para comprar ou pede valor duas vezes: isso vira repasse ao especialista, sem preço (a Ana pede o CNPJ uma vez e, na segunda, repassa). Falar preço, \"o pedido começa em R$\", \"à vista\" ou valor por extenso é barrado pelo filtro de saída (20/11/2026).", "Sobrescrever campo que já tem valor no Agendor."])),
      ], 2)
      + '<h3 class="mt">Avisos que a equipe recebe sobre a Ana</h3>'
      + tabela(["Evento", "Quem recebe", "Como"], [
        ["Lead novo, qualificado, pediu pessoa, irritado, rede, sem resposta, parou e retorno agendado", "Gestão e SDR; o dono do negócio quando o lead já é dele", "Na hora, de dia, com o botão \"Abrir conversa\""],
        ["Falha da Ana", "Só a gestão", "Imediato"],
        ["Noite (21h às 7h)", "Gestão e SDR", "Viram resumo às 8h e 18h, menos os urgentes: falha da Ana, lead sem resposta há mais de 20 minutos e lead novo"],
        ["Representantes", "Nunca", "A Ana não gera aviso para representantes"],
      ], "", "Avisos da Ana")
      + '<h3 class="mt">Monitoria e aprendizado</h3>'
      + grid([
        card("Monitoria", "<p>Cada resposta da Ana em conversa real é lida e, se preciso, corrigida orientando a próxima resposta. Revisão independente e prova ao vivo da orientação estão na fila.</p>", p="ok"),
        card("Aprendizado supervisionado", "<p>Cada 👍 ou 👎 na página Central vira exemplo. Uma análise diária propõe melhorias e nada muda sem a aprovação da gestão.</p>", p="ok"),
        card("Treino comercial da diretoria", "<p>Frases aprovadas pela diretoria comercial, guardadas palavra por palavra, em dois níveis (leve e pleno), só para o público foco e nunca com datas ou reforma tributária. O interruptor está desligado até revisão, simulação com IA real e OK da diretoria.</p>", p="of"),
        card("Parada de emergência", "<p>Na página Central, na aba Agentes, a gestão desliga a Ana na hora e liga de novo quando quiser.</p>", p="ok"),
      ], 2)
      + '<h3 class="mt">Histórico, exclusão e backup</h3>'
      + grid([
        card("Histórico para sempre", "<p>Toda mensagem, nota e decisão fica num arquivo permanente que só cresce, com fila de segurança se o banco falhar e conferência de hora em hora.</p>"),
        card("Excluir conversa, só com controle", "<p>Só a gestão e quem ela autorizar. Ocultar é reversível; excluir pede motivo, os 4 últimos dígitos do telefone e a senha, e vai para uma lixeira por 30 dias.</p>"),
        card("Backup na nuvem", "<p>Diariamente, com nova tentativa automática se a execução falhar. Os dados da Ana e da Bia vão criptografados para a nuvem, e cada pacote é aberto de volta para provar que dá para restaurar. Se alguma parte ficar mais de 30 horas sem sucesso, a gestão é avisada. A chave de criptografia fica guardada em um cofre separado, nunca junto dos pacotes.</p>"),
      ], 3))
    return sec("ana-seguranca", "Ana, o SDR Inbound virtual (IA)", "Ana: entendimento, travas e monitoria", "Onde a IA decide e onde as regras fixas mandam. O que a Ana nunca faz.", corpo)

def s_destinos():
    etapas = [
      ["Novo lead", "Primeira mensagem."], ["Abertura enviada", "A Ana começou a falar e aguarda a resposta. A Bia nunca rebaixa um negócio que já está em Qualificando, Apresentação ou Com o especialista."],
      ["Qualificando", "A Ana está colhendo segmento, CNPJ, lojas e decisor."], ["Apresentação", "A Ana está apresentando o projeto."],
      ["Retorno combinado", "O lead pediu para chamar depois; a Ana criou a tarefa com a data."],
      ["Com o especialista", "Etapa para o lead já passado ao especialista (hoje a Bia não move para ela no repasse: o repasse é Ganho da Ana ou nota)."],
      ["Deal breaker", "Toques de retomada sem resposta: a Ana pede esta etapa no fim dos toques (sem resposta)."], ["Fim da cadência", "Final do funil, reservado ao fechamento automático por Cadência esgotada (desligado no funil da Ana)."]]
    out = [
      ["D1 · Abertura", "Pesquisar a empresa (Google, Instagram, CNPJ), mandar a primeira mensagem no WhatsApp e ligar para quem decide.", "3º dia útil, sozinho"],
      ["D3 · Follow-up", "WhatsApp de novo contato e WhatsApp com uma novidade, sem pedir nada.", "5º dia útil"],
      ["D5 · Ligação e follow-up 2", "Ligar para quem decide e mandar WhatsApp de novo contato.", "8º dia útil"],
      ["D8 · Follow-up 3", "Ligar e WhatsApp com novidade ou exemplo de loja parecida.", "10º dia útil"],
      ["D10 · Deal breaker", "Ligar e WhatsApp avisando que vai encerrar o contato (\"Última tentativa\" na página Hoje).", "Depois do D10, vai ao Fim"],
      ["Fim da cadência", "Sala de espera de 3 dias úteis (\"Tentativas acabaram\" na página Hoje): Ganho, Perdido ou Voltar para a cadência.", "Sem ação em 3 dias úteis, fecha como Cadência esgotada"]]
    inb = [
      ["D0 · Novo lead", "Lead quente: atender primeiro, antes de qualquer outra fila.", "Dia útil seguinte"],
      ["D1 · Abertura e ligação", "WhatsApp com a primeira mensagem.", "Dia útil seguinte"], ["D2 · Follow-up", "WhatsApp de novo contato.", "Dia útil seguinte"],
      ["D3 · Follow-up 2", "WhatsApp de novo contato.", "Dia útil seguinte"], ["D4 · Deal breaker", "WhatsApp de última tentativa.", "Depois do D4, vai ao Fim"],
      ["Fim da cadência", "Igual ao Outbound: 3 dias úteis de espera.", "Sem ação, fecha como Cadência esgotada"]]
    arena = [
      ["Conexão", "Primeiro contato com o lead qualificado: apresentar a Life B e entender quem decide.", "Quando entende a necessidade"],
      ["Diagnóstico/Solução", "Levantar necessidades, montar sugestão de pedido e condições.", "Quando há proposta na mesa"],
      ["Negociação", "Preço, condições e fechamento. Ao dar Ganho, informar o valor da venda.", "Ganho (venda) ou Perdido, com motivo"]]
    pv = [
      ["Ciclo Ativo", "O cliente comprou e o relógio da próxima reposição está correndo. A tarefa já nasce agendada.", "Sozinho, no dia do contato"],
      ["Contato de Reposição", "Chegou a hora de falar com o cliente e oferecer a reposição.", "Compra (novo ciclo) ou, passada a janela, Reativação"],
      ["Negociação de Reposição", "Conversa de pedido em andamento. A Bia nunca move para cá sozinha.", "Ganho (novo ciclo) ou Perdido"]]
    rea = [
      ["Conexão", "Retomada do contato com o cliente antigo, descobrindo o que mudou.", "Quando o contato é retomado"],
      ["Diagnóstico/Solução", "Entender por que parou de repor e montar a nova proposta.", "Quando há proposta na mesa"],
      ["Negociação", "Condições da nova compra.", "Ganho (volta ao Pós-venda) ou Perdido"]]
    H = ["Etapa", "O que se faz", "Avança quando"]
    corpo = (
      '<h3>O mapa dos funis</h3>' + fig("funis")
      + '<p class="legenda">Funil é uma sequência de etapas pela qual o negócio caminha. Por regra, a Bia confere o funil antes de mover uma etapa. \"Lead\", nos números da empresa, é somente negócio do Arena; ganho no SDR é qualificação, e não venda.</p>'
      + '<h3 class="mt">Os caminhos de um negócio da Ana</h3>'
      + grid([
        card("Qualificou", "<p>O negócio da Ana vira <b>Ganho</b> (qualificação, nunca venda) e nasce um negócio no <b>SDR Inbound</b>, na etapa \"Ana qualificou\", com o SDR como dono.</p><p class=\"muted\">O Arena só nasce depois, quando o SDR completa os dados e qualifica o lead pela página Hoje, escolhendo o representante.</p>", p="ok"),
        card("Repasse (pediu uma pessoa)", "<p>Sem qualificar: o <b>mesmo negócio</b> muda do funil da Ana para a etapa \"Repasse da Ana\" do SDR Inbound, com nota, resumo da Ana e observação. O repasse manual (\"Passar ao SDR\") só conclui depois de ler de volta a nota, o resumo e o campo de observação; um vigia confere os que ficaram incompletos (hoje em modo simulado). Desde 20/11/2026 (18h11) o repasse manual também cancela os toques pendentes da Ana. As etapas \"Ana qualificou\" e \"Repasse da Ana\" têm raia própria na página Hoje e ficam fora da cadência de tarefas: regra vigente desde 15/11/2026; em 20/11/2026 a gestão confirmou manter assim e reavaliar se o volume crescer.</p>", p="ok"),
        card("Perdido, com motivo", "<p>Sem interesse, não contatar (pediu para parar) ou fora do perfil, incluindo quem vende sistema. O motivo é buscado por nome na lista do Agendor e relido.</p><p class=\"muted\">Fora do perfil inclui vendedor de sistema, e CNPJ baixado é tratado (no ar desde 16/11/2026).</p>", p="ok"),
        card("Sem resposta", "<p>Fim dos toques de retomada: o negócio vai para a etapa Deal breaker e segue aberto. Se o lead voltar a escrever, a Ana retoma.</p>", p="ok"),
      ], 2)
      + tabela(["Quem", "Marca", "Observação"], [
        ["Ana", "Ganho ao qualificar; encerra quem é fora do perfil", "Cria o negócio no SDR Inbound (etapa \"Ana qualificou\"), tarefa de retorno e nota."],
        ["SDR", "Ganho = qualificação do lead; perdido com motivo", "Ao qualificar pela página Hoje nasce o negócio no Arena (o SDR completa os dados e distribui). Ganho do SDR não é venda."],
        ["Bia", "Perdido: Cadência esgotada, depois do Fim", "Automático, em dia útil. No funil da Ana, o fechamento automático está desligado."],
        ["Representante (closer)", "Ganho e perda de venda no Arena", "Aí é venda de verdade; o ganho vale quando o representante confirma. Na página Hoje, o lead do closer tem controle completo (tarefa, nota, dados, ganho com valor, perdido com motivo)."],
      ], "", "Quem marca ganho e perdido")
      + aviso("Pendência declarada", "Ao qualificar, o negócio da Ana vira Ganho. Quem parou de responder fica aberto na etapa Deal breaker e a etapa Fim da cadência não é usada (o fechamento automático está desligado); quem a Ana encerra por falta de interesse vira Perdido com motivo. Na leitura ao vivo do Agendor em 20/11/2026, \"Com o especialista\" e \"Fim da cadência\" tinham 0 negócios e \"Deal breaker\" tinha 3. Também na revisão do funil da Ana de 20/11/2026: repasses manuais antigos deixaram o negócio da Ana aberto (o padrão de hoje mantém assim até a gestão ligar o fechamento como Ganho) e há negócios de pessoas que não são lojistas ainda abertos. A decisão sobre fechar esses negócios está com a gestão.", "w")
      + '<h3 class="mt">Funil da Ana (Ana SDR IA)</h3>' + '<p>Registro da conversa. A etapa muda sozinha conforme a conversa, e a Bia lê de volta para confirmar. O sem resposta vai para a etapa Deal breaker; o fechamento automático por Cadência esgotada está implementado e desligado.</p>'
      + tabela(["Etapa", "Quando o negócio fica nela"], etapas, "", "Etapas do funil da Ana")
      + '<h3 class="mt">Etapa por etapa dos outros funis</h3>'
      + det("SDR Outbound: a Life B vai buscar (10 dias úteis, mais 3 de espera)", tabela(H, out, "", "Etapas do SDR Outbound"))
      + det("SDR Inbound: o lead chega sozinho (5 dias úteis, tudo por WhatsApp)", tabela(H, inb, "", "Etapas do SDR Inbound"))
      + det("Arena: onde o representante vende (ganho aqui é venda)", tabela(H, arena, "", "Etapas do Arena") + "<p class=\"legenda\">Ao dar Ganho no Arena, a Bia confere o valor e abre o primeiro ciclo no Pós-venda. Perdido leva um motivo; alguns podem voltar ao SDR depois do prazo.</p>")
      + det("Pós-venda: o cliente que já comprou", tabela(H, pv, "", "Etapas do Pós-venda") + "<p class=\"legenda\">Prazos: drogaria 60 dias até o contato mais 15 de janela (75); supermercado 30 mais 15 (45). Cada compra seguinte abre um novo ciclo.</p>")
      + det("Reativação: o cliente que parou de repor", tabela(H, rea, "", "Etapas da Reativação") + "<p class=\"legenda\">Passado o prazo sem reposição, o cliente volta ao SDR. Se o SDR qualificar, o negócio vem para este funil com o representante que já o conhecia, se ele ainda está no time.</p>")
      + '<h3 class="mt">Os finais possíveis</h3>'
      + grid([card("Vira cliente", "<p>A venda no Arena leva ao Pós-venda. Cada reposição abre um novo ciclo; sem reposição no prazo, o cliente passa pela Reativação e volta ao SDR.</p>"),
              card("Perdido sem volta", "<p>Motivo que nunca volta: duplicado, erro na lista, fora do perfil, já atendido, LGPD, restrição de pagamento. O caminho termina ali.</p>"),
              card("Espera a volta", "<p>Motivo que pode voltar: passado o prazo, nasce um negócio novo na fila do SDR e a cadência recomeça. O SDR também pode congelar um lead, com data e motivo.</p>")], 3))
    return sec("destinos", "Funis e cadência", "Funis do Agendor e os caminhos do lead", "Ana SDR IA, SDR Inbound, SDR Outbound, Arena, Pós-venda e Reativação, e como um negócio termina.", corpo)


def s_quem():
    pecas = [
      ("Ana", "A assistente de IA que conversa com o lojista no WhatsApp, descobre se ele tem interesse, e passa o lead pronto ao time comercial.", "ok"),
      ("Bia", "O agente interno: fala com o time pelo WhatsApp, escreve no CRM, avisa quem precisa agir e confere o que foi feito.", "ok"),
      ("Hoje", "A mesa de trabalho do SDR: a fila de leads do dia, ligações, anotações e a decisão de qualificar ou descartar.", "ok"),
      ("Central", "A central de atendimento e o painel de controle da Ana: a equipe acompanha as conversas, assume ou orienta, e configura regras, voz e conhecimento.", "ok"),
      ("Dash", "O painel de números: vendas, atendimento, anúncios e custo dos agentes, em um só lugar.", "ok"),
      ("Agendor (CRM)", "O sistema de cadastro da empresa: clientes, negócios, tarefas e funis. É a fonte da verdade.", "ok"),
    ]
    termos = [
      ("CRM", "Sistema que guarda clientes, negócios e tarefas. Aqui, o Agendor."),
      ("Funil e etapa", "Caminho em etapas pelo qual um negócio avança no CRM, do primeiro contato à venda."),
      ("SDR", "Profissional de pré-venda: faz o primeiro contato e qualifica o lead. A Ana é o SDR Inbound virtual (IA)."),
      ("Qualificar", "Confirmar que o lojista tem perfil e interesse (segmento, lojas, quem decide, CNPJ ativo)."),
      ("Repasse", "Entregar o lead qualificado ao time comercial, com o contexto da conversa."),
      ("Cadência", "Sequência combinada de contatos em dias úteis, para não deixar o lead esfriar."),
      ("Arena", "O funil de vendas dos representantes (closers). A IA não vende: a venda é feita por pessoas."),
      ("Meta (WhatsApp)", "A empresa dona do WhatsApp Business. Define as regras de mensagens e modelos aprovados."),
      ("Representante (closer)", "Vendedor de campo: atende a carteira e FECHA a venda."),
      ("Juízes de IA", "Planejado: revisores automáticos que conferem cada resposta da Ana em tempo real, como guarda-corpo."),
    ]
    corpo = ('<h3>As seis peças</h3>' + grid([card(n, f"<p>{d}</p>", p=p) for n, d, p in pecas], 3)
      + '<h3 class="mt">Termos que aparecem neste guia</h3>'
      + '<dl class="quem">' + "".join(f"<div><dt>{a}</dt><dd>{b}</dd></div>" for a, b in termos) + '</dl>')
    return sec("quem", "Começar", "Quem é quem", "Em linguagem simples: o que cada peça faz e o que cada termo quer dizer.", corpo)
