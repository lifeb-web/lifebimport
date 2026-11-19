"""Definições dos fluxogramas do Ecossistema (conteúdo conferido em 14/11/2026 nos artefatos e no código)."""
from fluxo import figura

def N(i, t, s, st, c, r, span=1):
    return dict(id=i, t=t, s=s, st=st, c=c, r=r, span=span)

D = {}

D["mapa"] = dict(cols=4, titulo="Mapa do ecossistema: quem escreve onde",
 desc="O lead escreve no WhatsApp e a Ana decide o passo. A Bia escreve no Agendor e envia os avisos; as páginas de trabalho leem o Agendor ao vivo.",
 nodes=[N("lead","Lead","Anúncio, site, lista ou WhatsApp direto","n",0,0),
  N("meta","WhatsApp (Meta)","Número da Ana, janela de 24 h e modelos aprovados","n",1,0),
  N("ana","Ana, SDR Inbound virtual","A IA entende e responde; regras fixas travam. Nunca escreve no Agendor","p",2,0,2),
  N("hist","Histórico","Toda mensagem é guardada antes de qualquer ação","n",0,1),
  N("bia","Bia, quem escreve no CRM","Confere as regras, escreve no Agendor, relê para confirmar e avisa a equipe","m",1,1,3),
  N("ag","Agendor, a fonte da verdade","Empresa, pessoa, negócio, etapa, notas e tarefas","g",0,2,2),
  N("av","Avisos no WhatsApp","Gestão, SDR e representantes; muitos com botão","n",2,2,2),
  N("pag","Páginas de trabalho","Hoje, Central, Painel do Representante e Dash leem o Agendor ao vivo","n",0,3,2)],
 edges=[("lead","meta",""),("meta","ana",""),("ana","hist","grava"),("ana","bia","pede"),("bia","ag","escreve"),("bia","av","avisa"),("ag","pag","lê")])

D["jornada"] = dict(cols=4, titulo="Jornada do lead novo até o destino final",
 desc="Ao qualificar, o negócio da Ana vira Ganho e nasce no SDR Inbound. O Arena só nasce pela página Hoje. Quem some recebe retomada.",
 nodes=[N("lead","Lead novo","Anúncio, site ou WhatsApp direto","n",0,0),
  N("ana","Ana conversa","Nome, segmento, CNPJ e apresentação completa do projeto","p",1,0,2),
  N("som","Lead some","Lead some: retorno combinado ou toques; qualquer resposta cancela o que falta","x",3,0),
  N("qual","Qualificação","Segmento, CNPJ, lojas e quem decide. Portões: foco, rede, empresa nova, já é cliente","m",1,1,2),
  N("sem","Sem resposta","Fim dos toques: etapa de encerramento por silêncio","x",3,1),
  N("gan","Ganho na Ana","Ao qualificar, o negócio da Ana vira Ganho (qualificação)","g",0,2),
  N("rep","SDR Inbound","Novo negócio na etapa Ana qualificou, com o SDR como dono","p",1,2,2),
  N("per","Perdido, com motivo","Sem interesse, não contatar ou fora do perfil","x",3,2),
  N("clo","Arena","Só nasce quando o SDR qualifica pela página Hoje; ganho aqui é venda","g",0,3,2),
  N("sdr","SDR na página Hoje","Cadência D0 a D4, ligação e qualificação","n",2,3),
  N("rec","Recuperação","Volta depois de 14 dias, se o motivo permitir","n",3,3)],
 edges=[("lead","ana",""),("ana","qual",""),("ana","som",""),("som","sem",""),("qual","gan","qualificou"),("qual","rep","novo negócio"),("qual","per","descarta"),("rep","sdr","trabalha"),("sdr","clo",""),("per","rec","")],
 ordem_narrow=["lead","ana","qual","rep","sdr","gan","clo","per","rec"])

D["msg"] = dict(cols=4, titulo="O caminho de cada mensagem dentro da Ana",
 desc="A mensagem é guardada, juntada e entendida; o cérebro decide e a IA escreve. O validador confere; se reprovar, vai um texto padrão seguro.",
 nodes=[N("a","Lead escreve","Texto, áudio, foto, vídeo ou PDF","n",0,0),
  N("b","Guardar primeiro","A mensagem entra no histórico antes de tudo","n",1,0),
  N("c","Juntar mensagens","Espera 8 s sem mensagem nova (máx. 20 s); lead novo: 75 a 150 s, como uma pessoa","n",2,0),
  N("d","Entender a mídia","Áudio vira texto; foto e PDF são lidos","n",3,0),
  N("e","Cérebro decide o passo","Regras fixas e IA: cumprimento, segmento, CNPJ, apresentação, dúvida, objeção ou repasse","p",0,1),
  N("f","IA escreve","No estilo da Ana, com o que já se sabe do lead","p",1,1),
  N("g","Validador confere","Sem termo proibido, com gancho, tamanho certo e sem repetir","m",2,1),
  N("h","Envia","Balões com pausa curta; áudio se o lead mandou áudio","n",3,1),
  N("x","Reprovou: texto padrão seguro","A Ana nunca fica no vácuo","x",2,2),
  N("i","Registra e pede à Bia","A Ana guarda histórico e entrega; a Bia grava etapa e nota no Agendor e envia os avisos","g",3,2)],
 edges=[("a","b",""),("b","c",""),("c","d",""),("d","e",""),("e","f",""),("f","g",""),("g","h",""),("g","x","reprovou"),("x","i",""),("h","i","")])

D["escrita"] = dict(cols=4, titulo="Ana decide, Bia escreve no Agendor",
 desc="A Ana faz pedidos fixos e autenticados; a Bia confere, escreve no Agendor, relê e só então confirma. Se falhar, a Ana guarda, tenta de novo e avisa a gestão.",
 nodes=[N("a","Ana decide","Pede à Bia só pedidos fixos e autenticados; nunca fala direto com o Agendor","p",0,0,2),
  N("b","Bia confere o pedido","Dados válidos, funil da Ana e sem negócio duplicado","m",0,1,2),
  N("c","Bia lê o contexto","Já é cliente? Tem negócio em outro funil?","n",2,1,2),
  N("d","Camada única do Agendor","Fila com freio, limite de tempo e nova tentativa segura","p",0,2,4),
  N("e","Agendor","Recebe a escrita","g",0,3,2),
  N("f","Bia relê e confirma","Só diz feito depois de ler o Agendor de novo","g",2,3,2),
  N("g","Ana registra","Se falhou: guarda, tenta de novo e avisa a gestão","n",2,4,2)],
 edges=[("a","b",""),("b","c",""),("b","d","escreve"),("d","e",""),("e","f",""),("f","g","")])

D["cad_out"] = dict(cols=6, titulo="Cadência do SDR Outbound",
 desc="Seis etapas em dias úteis, de D1 a Fim da cadência. O fim espera três dias úteis e acaba em ganho, perdido ou cadência esgotada.",
 nodes=[N("d1","D1","Abertura","n",0,0),N("d3","D3","Follow-up","n",1,0),N("d5","D5","Ligação e follow-up 2","n",2,0),
  N("d8","D8","Follow-up 3","n",3,0),N("d10","D10","Deal breaker","n",4,0),N("fim","Fim","3 dias úteis de espera","m",5,0),
  N("g","Ganho","Qualificado: vai ao Arena","g",0,1,2),N("p","Perdido","Com motivo e explicação","x",2,1,2),N("e","Cadência esgotada","Sem ação em 3 dias úteis: fecha como perdido","x",4,1,2)],
 edges=[("d1","d3",""),("d3","d5",""),("d5","d8",""),("d8","d10",""),("d10","fim",""),("fim","e","sem ação"),("fim","g","qualifica"),("fim","p","não serve")])

D["cad_in"] = dict(cols=6, titulo="Cadência do SDR Inbound",
 desc="Seis etapas: D0, D1, D2, D3, D4 e Fim da cadência, tudo por WhatsApp.",
 nodes=[N("d0","D0","Novo lead","n",0,0),N("d1","D1","Abertura","n",1,0),N("d2","D2","Follow-up","n",2,0),
  N("d3","D3","Follow-up 2","n",3,0),N("d4","D4","Deal breaker","n",4,0),N("fim","Fim","3 dias úteis de espera","m",5,0),
  N("g","Ganho","Qualificado: vai ao Arena","g",0,1,2),N("p","Perdido","Com motivo e explicação","x",2,1,2),N("e","Cadência esgotada","Sem ação em 3 dias úteis: fecha como perdido","x",4,1,2)],
 edges=[("d0","d1",""),("d1","d2",""),("d2","d3",""),("d3","d4",""),("d4","fim",""),("fim","e","sem ação"),("fim","g","qualifica"),("fim","p","não serve")])

D["volta"] = dict(cols=4, titulo="Recuperação e reativação: quando o lead volta ao SDR",
 desc="Quatro origens devolvem negócios ao SDR: recuperação do SDR, dos representantes, reativação do pós-venda e segunda onda. Nasce um negócio novo na fila do Outbound e o SDR clica Iniciar.",
 nodes=[N("s1","Recuperação SDR","Lead do SDR perdido: volta 14 dias depois","n",0,0),
  N("s2","Recuperação","Perdido por representante no Arena: 10 a 60 dias, conforme o motivo","n",1,0),
  N("s3","Reativação","Cliente sem repor: 75 dias (drogaria) ou 45 (supermercado)","n",2,0),
  N("s4","Segunda onda","Perdido na Reativação por motivo recuperável: 30 dias","n",3,0),
  N("reg","Regras comuns","Uma volta por empresa a cada 180 dias; sem negócio aberto nem compra posterior; limite por dia; aviso agrupado em dia útil","m",0,1,4),
  N("fila","Negócio novo na fila do SDR Outbound","Origem Recuperação ou Reativação, com nota de onde veio. O negócio antigo nunca reabre","p",0,2,2),
  N("cad","SDR clica Iniciar","Cadência curta, só WhatsApp: retomar, novo contato e última tentativa","n",2,2,2),
  N("ok","Se qualificar","Vai ao Arena, ou à Reativação com o representante original","g",0,3,2),
  N("no","Se perder de novo","Pode voltar com espera maior a cada nova perda","x",2,3,2)],
 edges=[("s1","reg",""),("s2","reg",""),("s3","reg",""),("s4","reg",""),("reg","fila",""),("fila","cad",""),("cad","ok",""),("cad","no","")])

D["avisos"] = dict(cols=4, titulo="Aviso: da regra à confirmação de entrega",
 desc="Um evento passa pelas regras e só conta como enviado se saiu. Envio que falha fica numa fila por 24 h, reenviado a cada 5 min.",
 nodes=[N("ev","Evento na conversa","Lead novo, pediu pessoa, qualificado, irritado, sem resposta","n",0,0,2),
  N("ra","Regras da Ana","Já avisei este lead? Limite por hora? Silêncio da noite?","m",2,0,2),
  N("no","Noite e não urgente","Vai para o resumo das 8h e das 18h","x",0,1,2),
  N("pd","Pode enviar","Pede o envio à Bia","p",2,1,2),
  N("rb","Regras da Bia","Destino permitido, sem repetir e no máximo 30 por hora","m",2,2,2),
  N("en","Bia envia no WhatsApp","Com o botão Abrir conversa","p",2,3,2),
  N("sa","O envio saiu de verdade?","Só conta como enviado se o WhatsApp aceitou; senão vai à fila","p",2,4,2),
  N("si","Sim","Marca como avisado e registra","g",0,5,2),
  N("nao","Não: erro","O aviso fica na fila durável por 24 horas","x",2,5,2),
  N("vi","Vigia a cada 5 minutos","Reenvia até 5 por rodada e volta ao passo da Bia","n",2,6,2)],
 edges=[("ev","ra",""),("ra","no","noite"),("ra","pd","dia"),("pd","rb",""),("rb","en",""),("en","sa",""),("sa","si","sim"),("sa","nao","não"),("nao","vi","")])

D["funis"] = dict(cols=4, titulo="Mapa dos funis do Agendor",
 desc="A Ana registra a conversa; ao qualificar, nasce um negócio no SDR Inbound. O SDR leva ao Arena pela página Hoje; depois vem o Pós-venda.",
 nodes=[N("ana","Ana SDR IA","Registro da conversa. Ao qualificar, vira Ganho e nasce o negócio no SDR Inbound","p",1,0,2),
  N("inb","SDR Inbound","D0 a D4 e Fim. O lead chega sozinho e o SDR atende pela página Hoje","n",0,1,2),
  N("out","SDR Outbound","D1 a D10 e Fim. A Life B vai buscar; o SDR trabalha pela página Hoje","n",2,1,2),
  N("are","Arena","Conexão, Diagnóstico/Solução, Negociação. Ganho aqui é venda de verdade","g",1,2,2),
  N("pv","Pós-venda","Ciclo Ativo, Contato e Negociação de Reposição","n",0,3,2),
  N("rea","Reativação","Cliente que não repôs no prazo; se perder, volta ao SDR. Conexão, Diagnóstico/Solução, Negociação","n",2,3,2)],
 edges=[("ana","inb","qualificou"),("inb","are","qualificado"),("out","are","qualificado"),("are","pv","venda"),("pv","rea",""),("rea","out","volta ao SDR")])

D["pipeline"] = dict(cols=3, titulo="O caminho de uma mudança até o ar",
 desc="Nove passos: testes (módulo, principal e de tela), varredura, auditoria independente, cópia de segurança, publicação pelo roteiro único e teste de fumaça.",
 nodes=[N("a","1. Código e testes","Cada regra chega com testes do que deve e do que não deve acontecer","n",0,0),
  N("b","2. Suítes dos módulos","Mais de 50 conjuntos, um por assunto","n",1,0),
  N("c","3. Suíte principal","Cerca de 12 mil verificações; se uma falhar, bloqueia","p",2,0),
  N("d","4. Testes de tela","Navegador real, 5 larguras, claro e escuro, prints olhados","n",0,1),
  N("e","5. Varredura","Toda regra mudada é procurada em todos os lugares onde aparece","n",1,1),
  N("f","6. Auditoria independente","Um revisor separado tenta quebrar a mudança","m",2,1),
  N("g","7. Cópia de segurança","O estado anterior é guardado antes de publicar","n",0,2),
  N("h","8. Publicação","Só pelo roteiro único, sem atalhos","p",1,2),
  N("i","9. Fumaça e aviso","Conferência no ar, resumo à gestão","g",2,2)],
 edges=[("a","b",""),("b","c",""),("c","d",""),("d","e",""),("e","f",""),("f","g",""),("g","h",""),("h","i","")])

D["camada"] = dict(cols=3, titulo="Como a Bia conversa com o Agendor",
 desc="Há travas antes de cada chamada. Depois vem uma fila única com freio adaptativo, confirmação por releitura e, se esgotar, alerta à gestão.",
 nodes=[N("a","1. Travas antes de sair","Bloqueia escrita com id zero e troca de funil sem querer","m",0,0),
  N("b","2. Fila com freio","Um único ritmo para todas as rotinas; o clique de uma pessoa tem prioridade","p",1,0),
  N("c","3. Limite de tempo","15 s por tentativa; regra própria por tipo de chamada","n",2,0),
  N("d","4. Confirmação","Relê o Agendor; marca antes, confere depois; reserva única","g",0,1),
  N("e","5. Se esgotar","Para de insistir e avisa a gestão, na segunda ocorrência seguida","x",1,1,2)],
 edges=[("a","b",""),("b","c",""),("c","d",""),("d","e","")])

D["central"] = dict(cols=6, titulo="A página Central e como ela se conecta",
 desc="A página Central controla a Ana (assumir, instruir, pausar) e a Bia (interruptores, filas, folga, histórico). A Ana pede e a Bia escreve no Agendor.",
 nodes=[N("c","Central","Painel de controle da gestão, com login. Cada mudança pede motivo, fica no histórico e pode ser desfeita","p",0,0,6),
  N("ana","Ana","Atendimento: assumir, instruir, devolver, pausar","n",0,1),
  N("bia","Bia","Chaves, filas, folga e histórico","m",1,1),
  N("hoje","Hoje","Atalho para a mesa do SDR","n",2,1),
  N("dash","Dash","Atalho; custo e saúde","n",3,1),
  N("canal","Canal","Conversa da gestão com o assistente","n",4,1),
  N("sol","Solicita","Atalho para pedidos","n",5,1),
  N("ag","Agendor, a fonte da verdade","A Ana pede à Bia; a Bia escreve; a página Central e a página Hoje leem","g",0,2,3)],
 edges=[("c","ana","controla",),("c","bia","controla","w"),("c","hoje","","w"),("c","dash","","w"),("c","canal","","w"),("c","sol","","w"),("ana","bia",""),("bia","ag","escreve"),("hoje","ag","lê","w")],
 ordem_narrow=["c","ana","bia","ag","hoje","dash","canal","sol"])

def fig(k):
    d = D[k]
    return figura(k, d["titulo"], d["desc"], d["nodes"], d["edges"], d["cols"], d.get("ordem_narrow"))

if __name__ == "__main__":
    import sys
    ok = 0
    for k in D:
        try:
            fig(k); ok += 1; print("ok", k)
        except Exception as e:
            print("ERRO", k, e)
    print(ok, "/", len(D))

D["hoje"] = dict(cols=4, titulo="Hoje: da fila do SDR ao negócio no Arena",
 desc="O SDR trabalha a fila da página Hoje, por listas. Ao qualificar, a Bia cria o negócio no Arena; quem não serve vai a perdido.",
 nodes=[N("fila","Fila por listas","Leads do SDR Inbound e Outbound; tarefas atrasadas lidas aos poucos","n",0,0,2),
  N("sdr","SDR trabalha na página Hoje","Liga, anota, completa dados e decide, sem horário travado","p",2,0,2),
  N("q","Qualificou","Pela Hoje, com representante escolhido","g",0,1,2),
  N("per","Perdido, com motivo","Sai da fila e o motivo é registrado","x",2,1,2),
  N("bia","Bia cria o negócio","No funil certo, e relê o Agendor para confirmar","m",0,2,2),
  N("rec","Volta depois","Motivo recuperável: nasce negócio novo no prazo","n",2,2,2),
  N("are","Arena","O representante de campo recebe o lead e vende","g",0,3,2)],
 edges=[("fila","sdr",""),("sdr","q","qualifica"),("sdr","per","descarta"),("q","bia",""),("per","rec",""),("bia","are","")],
 ordem_narrow=["fila","sdr","q","bia","are","per","rec"])

D["dash"] = dict(cols=4, titulo="Dash: de onde vêm os números",
 desc="O Agendor, os anúncios e os agentes Ana e Bia alimentam o Dash Geral, que mostra vendas, SDR, anúncios e custo dos agentes.",
 nodes=[N("ag","Agendor","Negócios, funis e vendas","g",0,0),
  N("ads","Anúncios","Origem e custo dos leads","n",1,0),
  N("agt","Ana e Bia","Uso e custo dos agentes","p",2,0),
  N("rep","Representantes e SDR","Atividade do dia","n",3,0),
  N("dash","Dash Geral","Reúne tudo em um só lugar, lido ao vivo","m",0,1,4),
  N("v","Vendas","Ganhos e clientes","n",0,2),
  N("s","SDR","Funil e cadência","n",1,2),
  N("a","Anúncios","Resultado das campanhas","n",2,2),
  N("g","Agentes","Custo e métricas da Ana e da Bia","n",3,2)],
 edges=[("ag","dash",""),("ads","dash",""),("agt","dash",""),("rep","dash",""),("dash","v",""),("dash","s",""),("dash","a",""),("dash","g","")])


D["autom"] = dict(cols=4, titulo="Automações no CRM: quem dispara, o que faz e com que regra",
 desc="Um relógio, um evento do Agendor ou uma ação da página Hoje dispara a automação; regras e modo (desligada, sombra, ao vivo) decidem se age. A Bia escreve, relê e avisa.",
 nodes=[N("t","Dispara","Relógio (a cada minuto, 5 minutos ou diário), evento do Agendor ou ação da página Hoje","n",0,0,2),
  N("m","Modo e regras","Desligada, em sombra (só simula e relata) ou ao vivo; horário, dia útil e limites por rodada e por dia","m",2,0,2),
  N("b","Bia age no CRM","Cria e fecha tarefas, move etapa, cria negócio e distribui; relê o Agendor para confirmar","p",2,1,2),
  N("a","Avisa e registra","Aviso a quem precisa agir, com registro do autor","n",0,1,2),
  N("g","Alerta à gestão","Se a rotina falhar ou esgotar as tentativas","x",0,2,4)],
 edges=[("t","m",""),("m","b",""),("b","a",""),("a","g","")])
