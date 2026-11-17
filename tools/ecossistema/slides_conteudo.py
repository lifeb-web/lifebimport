"""Conteúdo dos slides (16/11/2026): deck enxuto (cerca de 20 slides) que explica COMO TUDO FUNCIONA E SE CONECTA. A página longa traz todos os detalhes; cada slide cita as seções.
Tom sóbrio: sem métricas de resultado, sem adjetivos de venda, só o que foi conferido no código e nos documentos. Sem nomes de pessoas (papéis: SDR, representante, closer, gestão).
Estado (no ar, em implantação, planejado) vem de estado.json. Terminologia: página Hoje, página Central (Central só como nome próprio em títulos)."""
from comp import e
import slides_base as B
from slides_base import slide, card, li, pill, ic, faixa_estado, COMP, ESTADO, ATUAL
import slides_fluxos as F

def g(items, n=3):
    return f'<div class="dg{n} dgx">' + "".join(items) + "</div>"

def kv(pares, n=2):
    return f'<div class="kvg k{n}">' + "".join(f'<div class="kv"><b>{a}</b><span>{b}</span></div>' for a, b in pares) + "</div>"

def band(t):
    return f'<div class="band">{t}</div>'

def fx(chave, nota=None):
    w, n, p = F.svgs(chave)
    d = f'<figure class="dfig" role="img" aria-label="{e(p["titulo"])}. {e(p["desc"])}"><div class="svgd dw">{w}</div><div class="svgd dn">{n}</div></figure>'
    return d + (band(nota) if nota else "")

def cat(titulo, itens, icone="check"):
    return f'<div class="dcard"><div class="dcardh">{ic(icone)}<h3>{titulo}</h3></div>{li(itens)}</div>'

def todos():
    S = []
    A = S.append
    LG = '<img class="capa-logo lc" src="/logo-lifeb.png" alt="Life B" width="230" height="102"><img class="capa-logo le" src="/logo-lifeb-escuro.png" alt="Life B" width="230" height="102">'

    # ================= COMECE AQUI =================
    C = "Comece aqui"
    orb = ''.join(f'<g class="orb o{k}"><circle cx="{x}" cy="{y}" r="50"/><text x="{x}" y="{y+6}" text-anchor="middle">{t}</text></g>' for k, (x, y, t) in enumerate([(300, 70, "Ana"), (500, 200, "Bia"), (460, 420, "Hoje"), (140, 440, "Central"), (100, 210, "Dash")]))
    capa = ('<div class="capa"><div class="capa-t">' + LG + '<span class="kick">Life B Importadora</span><h1>Ecossistema <em>Life B</em></h1>'
            '<p class="sub">Como o lead chega, é atendido pela Ana (SDR Inbound), qualificado pelo SDR e passa aos representantes de campo, que vendem.</p>'
            '<p class="sub2">Ana (assistente de IA no WhatsApp), Bia (agente interno), página Hoje (mesa do SDR), página Central (atendimento e controle da Ana) e Dash (números), todas ligadas ao Agendor (o CRM da empresa).</p>'
            f'<div class="dchips"><span class="dchip">Atualizado em {ATUAL}</span><span class="dchip">{pill("no ar")}</span><span class="dchip">{pill("em implantação")}</span><span class="dchip">{pill("planejado")}</span></div>'
            '<p class="dica">Setas, toque ou clique para avançar. G abre o índice. Esc sai.</p></div>'
            '<svg class="capa-g" viewBox="0 0 600 520" role="img" aria-label="Ana no centro, ligada à Bia, Hoje, Central e Dash"><g class="lnk">'
            + "".join(f'<line x1="300" y1="260" x2="{x}" y2="{y}"/>' for x, y in [(300, 70), (500, 200), (460, 420), (140, 440), (100, 210)])
            + f'</g><circle class="core" cx="300" cy="260" r="86"/><text x="300" y="250" text-anchor="middle" class="ct1">Life B</text><text x="300" y="286" text-anchor="middle" class="ct2">Ecossistema</text>{orb}</svg></div>')
    A(slide("capa", "Ecossistema Life B", C, capa, "s-capa nofit", "inicio"))

    quem = g([
        card("chat", "Ana", "IA que atua como SDR Inbound: conversa com o lojista no WhatsApp, qualifica e passa o lead ao time comercial. Não vende.", pill(COMP["ana"]["estado"])),
        card("bot", "Bia", "Agente interno: fala com o time no WhatsApp, escreve no CRM, avisa quem precisa agir e confere.", pill(COMP["bia"]["estado"])),
        card("mesa", "Página Hoje", "Mesa de trabalho do SDR: fila de leads, ligações, anotações e a decisão de qualificar.", pill(COMP["hoje"]["estado"])),
        card("ctrl", "Página Central", "Atendimento e controle da Ana: a equipe acompanha as conversas, assume ou orienta e configura regras.", pill(COMP["central"]["estado"])),
        card("dash", "Dash", "Painel de números: vendas, SDR, anúncios e custo da Ana e da Bia.", pill(COMP["dash"]["estado"])),
        card("crm", "Agendor (CRM)", "Cadastro da empresa: clientes, negócios, tarefas e funis. Fonte da verdade.", pill(COMP["agendor"]["estado"])),
    ], 3)
    A(slide("quem1", "Quem é quem: as seis peças", C, quem, "", "quem,visao"))

    termos = kv([
        ("SDR", "Pré-venda: faz o primeiro contato e qualifica. A Ana é o SDR Inbound virtual (IA). O SDR do time comercial trabalha as listas do Outbound e qualifica o Inbound repassado pela Ana."),
        ("Qualificar e repassar", "Confirmar segmento, lojas, decisor e CNPJ ativo e entregar o lead ao time comercial, com o contexto."),
        ("CRM, funil e etapa", "CRM é o cadastro. Funil é o caminho em etapas que um negócio percorre. Ana, SDR Inbound, SDR Outbound e Arena são funis."),
        ("Cadência", "Sequência combinada de contatos em dias úteis (segunda a sexta, sem feriado)."),
        ("Arena", "Funil de vendas dos representantes de campo (e do closer, em redes). A IA não vende: a venda é feita por pessoas."),
        ("Closer e representante", "Closer: especialista que atende redes e fecha vendas. Representante: vendedor de campo, que atende a carteira."),
        ("Juízes de IA", "Planejado: revisores automáticos que conferem cada resposta da Ana em tempo real. Ainda não existem."),
    ], 3)
    A(slide("quem2", "Quem é quem: os termos", C, termos, "dense", "quem,duvidas,visao"))

    cols = {"no_ar": [], "implantacao": [], "planejado": []}
    for c in ESTADO["componentes"]:
        for k in cols:
            if c[k]:
                cols[k].append(f'<li><b>{c["nome"]}</b> {"; ".join(c[k])}</li>')
    est = ('<div class="dg3 est dgx">'
        f'<div class="ec e-ok"><h3>{pill("no ar")}</h3><ul>{"".join(cols["no_ar"])}</ul></div>'
        f'<div class="ec e-te"><h3>{pill("em implantação")}</h3><ul>{"".join(cols["implantacao"]) or "<li>Nada pendente de entrada neste momento.</li>"}</ul></div>'
        f'<div class="ec e-pl"><h3>{pill("planejado")}</h3><ul>{"".join(cols["planejado"])}</ul></div></div>'
        + band(f'Posição de {ATUAL}. No ar: conferido em produção. Em implantação: pronto, ainda não no ar. Planejado: futuro. Checklist completo na página.'))
    A(slide("estado", "Estado de cada peça", C, est, "dense", "status,checklist"))

    # ================= COMO SE CONECTA =================
    C = "Como se conecta"
    A(slide("mapa", "Como as peças se conectam", C, fx("mapa", "A Ana pede; a Bia escreve e avisa. A Ana nunca escreve direto no Agendor nem manda aviso por conta própria. Na página: Como tudo se conecta."), "flow", "visao,entrada"))
    A(slide("ponte", "Quem escreve no CRM: a Bia", C, fx("ponte", "Por desenho, a Ana pede e a Bia escreve; a ponte recusa negócios fora do funil da Ana, e repetir o pedido de repasse não cria um segundo negócio. Na página: CRM como fonte da verdade."), "flow", "crm,visao,bia"))
    A(slide("jor", "Jornada do lead", C, fx("jor", "Quem some entra nos toques de retomada. Ganho na Ana é qualificação, nunca venda. Depois da venda, o representante cuida do Pós-venda e da Reativação. Na página: Ana; Funis do Agendor."), "flow", "ana,destinos,entrada"))

    # ================= ANA =================
    C = "Ana"
    ana1 = g([
        cat("O que faz", ["Atende lojistas no WhatsApp (farmácias, supermercados, conveniências e outros) e qualifica: segmento, lojas, decisor e CNPJ ativo", "Apresenta o projeto Mega Vision USA e repassa ao time comercial", "Responde em áudio quando o lead manda áudio; mostra digitando e faz pausas", "Retoma quem some, com toques em dias úteis"], "chat"),
        cat("Como trata cada caso", ["Foco (farmácia, drogaria, supermercado): atendimento completo", "Outros segmentos e MEI: aviso educado de pedido mínimo", "Empresa nova: informa a condição de pagamento; o especialista decide", "Rede: repasse direto ao closer", "Fora do perfil, incluindo vendedor de sistema: encerra com educação"], "list"),
    ], 2) + band("Na página: Ana; Ana: a conversa.") + faixa_estado("ana")
    A(slide("ana", "Ana: o que faz e como trata cada caso", C, ana1, "dense", "ana"))
    ana2 = g([
        cat("O que nunca faz", ["Falar preço, desconto ou resultado garantido, ou prometer implantação na loja", "Negar ser inteligência artificial; falar com quem pediu para parar", "Escrever direto no Agendor ou marcar ganho ou perdido por conta própria", "Escrever por iniciativa própria fora de 8h a 22h"], "lock"),
        cat("Quando a equipe entra", ["Pela página Central: assume, instrui, devolve ou pausa", "A instrução da equipe pode mandar e encerrar, quando é o caso", "Parada de emergência para a Ana inteira"], "user"),
    ], 2) + band("A IA entende e escreve; regras fixas decidem o que pode sair. Na página: Ana: entendimento, travas e monitoria.")
    A(slide("ana_limites", "Ana: limites e intervenção da equipe", C, ana2, "dense", "ana-seguranca"))
    A(slide("msg", "O caminho de cada mensagem", C, fx("msg", "A IA entende e escreve; regras fixas decidem o que pode sair. Na página: Ana: a conversa."), "flow", "ana,ana-seguranca"))

    # ================= SDR =================
    C = "O SDR"
    sdr1 = g([
        cat("Quem é e o que recebe", ["Profissional de pré-venda do time comercial: trabalha as listas do Outbound e qualifica o Inbound repassado pela Ana, pela página Hoje", "Recebe leads qualificados pela Ana, leads de anúncio e site, listas do Outbound e negócios que voltam por Recuperação ou Reativação", "Decide: qualificar e escolher o representante, perder com motivo e explicação, ou congelar com data e motivo"], "user"),
        cat("Inbound e Outbound", ["Inbound: o lead chega sozinho (anúncio, site, WhatsApp). É atendido na hora, fora da fila e da cota", "Outbound: a Life B vai atrás, a partir de listas. O lead fica na fila de espera até o SDR clicar em Iniciar", "A página Hoje filtra por origem"], "mix"),
    ], 2) + band("Na página: Como o lead entra; Cadência do SDR; Página Hoje.")
    A(slide("sdr", "O SDR: papel, Inbound e Outbound", C, sdr1, "dense", "entrada,hoje,cadencia"))
    sdr2 = g([
        cat("Listas do Outbound", ["A lista sobe pela página Lista: prévia antes de criar, origem obrigatória e conferência de CNPJ, telefone e empresa com negócio aberto; nada duplica", "Cria o negócio no funil SDR Outbound, etapa D1, sem tarefas"], "list"),
        cat("Fila de espera e cota", ["A fila ordena por urgência: origens quentes (indicação, recuperação, reativação), feira, Outbound com bom sinal e o restante; dentro do nível, quem espera há mais tempo", "A cota diária de liberação é ajustável; sem cota, nada é limitado"], "clock"),
    ], 2) + band("<b>A Bia, por lead:</b> cria as tarefas da cadência (ligação e WhatsApp, em dias úteis), avisa lead novo, devolve à página Hoje a ligação concluída sem resultado e exige explicação em lead perdido.")
    A(slide("sdr_listas", "O SDR: listas, fila e o que a Bia faz", C, sdr2, "dense", "entrada,hoje,cadencia"))
    A(slide("sdrfluxo", "Da lista ao representante", C, fx("sdr", "O Inbound não passa pela fila: entra como negócio novo e é atendido primeiro. Na página: Cadência do SDR."), "flow", "hoje,cadencia,entrada"))
    fun1 = g([
        cat("Ana e SDR Inbound", ["Funil da Ana: Novo lead, Em conversa, Retorno combinado, Repassado, Sem resposta, Encerrado", "SDR Inbound: Ana qualificou (SDR como dono), D0 a D4 e Fim da cadência, tudo por WhatsApp"], "chat"),
        cat("SDR Outbound", ["D1 Abertura, D3 Follow-up, D5 Ligação, D8 Follow-up 3, D10 Última tentativa", "Fim da cadência: 3 dias úteis de espera; sem ação, fecha como cadência esgotada", "Tarefas criadas pela Bia: pesquisar, ligar e mandar WhatsApp"], "list"),
    ], 2) + band("Os dias contam sempre como dias úteis. Os prazos das cadências curtas serão revistos com dados reais na semana de 18/11. Na página: Funis do Agendor; Cadência do SDR.")
    A(slide("funis", "Funis do SDR e cadências", C, fun1, "dense", "destinos,cadencia"))
    fun2 = g([
        cat("Arena, Pós-venda e Reativação", ["Arena: Conexão, Diagnóstico/Solução e Negociação; ganho é venda e exige o valor", "Pós-venda: ciclos de reposição, com janela para repor", "Reativação: cliente que não repôs no prazo"], "crm"),
        cat("Voltas ao SDR", ["Recuperação SDR, Recuperação e Reativação criam negócio novo na fila de espera do Outbound, com nota de origem", "Uma volta por empresa a cada 180 dias; prazos em revisão na semana de 18/11"], "git"),
    ], 2) + band("Quem vende no Arena são os representantes de campo (e o closer, em redes). Na página: Funis do Agendor; Recuperação e reativação.")
    A(slide("funis2", "Arena, Pós-venda e voltas ao SDR", C, fun2, "dense", "destinos,recuperacao"))
    A(slide("volta", "Voltas ao SDR", C, fx("volta", "Cada rotina tem nome e origem próprios. Na página: Recuperação e reativação."), "flow", "recuperacao"))

    # ================= BIA =================
    C = "Bia"
    A(slide("autom", "Automações no CRM: quem dispara e com que regra", C, fx("autom", "Cada automação tem um modo (desligada, em sombra ou ao vivo). Na sombra, só simula e relata, sem escrever. Na página: Automações da Bia e da Ana."), "flow", "automacoes,bia"))
    bia = g([
        cat("No ar (conforme a página)", ["Cadência do SDR e repasse ao Arena, desde 20/10", "Guardas do SDR: ligação com resultado, perda com explicação, dono ativo", "Fechamento e garantia de tarefa; motor proativo do Arena, com aprovação da gestão", "Pós-venda e reposição, a cada 30 minutos; vigias de saúde"], "rocket"),
        cat("Em operação, com prazos em revisão", ["Recuperação SDR, Recuperação e Reativação: criam negócio novo no SDR Outbound para perdidos antigos e clientes que não repuseram", "Uma volta por empresa a cada 180 dias, com limite por dia"], "git"),
        cat("Estado ao vivo não verificado", ["Motores de Reposição e Reativação +75 (cards ao representante nos funis de Pós-venda e Reativação): a memória de 27/09 os registra em sombra, com a camada de entrega construída"], "eye"),
    ], 3) + band("Em sombra, a automação só simula e relata. Na página: Automações da Bia e da Ana; Bia: avisos, agendas e folga.") + faixa_estado("bia")
    A(slide("bia", "Automações da Bia e estado de cada uma", C, bia, "dense", "bia,automacoes"))
    ana_a = g([
        cat("Quando o lead escreve", ["Responde na hora, a qualquer hora, juntando mensagens seguidas", "Retorno combinado: volta na hora pedida, ajustada a 8h-22h", "Instrução da equipe pela página Central"], "chat"),
        cat("Quando a Ana toma a iniciativa", ["Só entre 8h e 22h, todos os dias", "Abertura: 5 minutos depois do cadastro, se o lead não escreveu antes", "Retomada por abandono: toques em dias úteis; qualquer resposta cancela o que falta", "Lead que escreveu e ficou sem resposta: um vigia a cada 5 minutos faz a Ana voltar"], "clock"),
        cat("Vigias e planejado", ["Webhook do número da Ana, conversas sem resposta e custo diário e mensal", "Avisos à equipe de 7h às 21h; à noite viram resumo", "Planejado: cadência de 3 toques com mensagens de utilidade"], "eye"),
    ], 3) + band("Fonte: horários e regras da Ana (docs do agente, 11/11) e página. O número exato de toques de retomada não é citado aqui. Na página: Automações da Bia e da Ana; Ana: a conversa.")
    A(slide("autom_ana", "Automações da Ana", C, ana_a, "dense", "automacoes,ana"))
    A(slide("av", "Do evento ao aviso enviado", C, fx("av", "A falha de envio entra na fila. A falha de entrega recusada pela Meta ainda não é reenviada (planejado). Na página: Observabilidade e entrega de avisos."), "flow", "bia,observ"))

    # ================= PÁGINAS =================
    C = "Páginas de trabalho"
    hoje1 = g([
        cat("Fila e kanban", ["Números do dia, busca geral (nome, CNPJ, telefone, negócio ou cidade) e filtro por origem", "Colunas: Inbound novo, aberturas e follow-ups, última tentativa, tentativas que acabaram, atrasadas e iniciados hoje", "Fila de espera em linhas por lista; sem travas de horário"], "list"),
        cat("Lead e ações", ["Cartão com empresa, origem, etapa, próxima tarefa e selos", "Dados, pessoas, telefones e CNPJ; observação do SDR e notas livres", "Concluir tarefas, marcar perdido com motivo e explicação, qualificar e escolher o representante, reabrir"], "doc"),
    ], 2) + band("Na página: Página Hoje.") + faixa_estado("hoje")
    A(slide("hoje", "Página Hoje: fila, kanban e lead", C, hoje1, "dense", "hoje"))
    hoje2 = g([
        cat("Cuidados", ["Clique repetido nunca duplica", "Ação que bate no limite do Agendor fica numa fila e é tentada de novo, com teto de tentativas e alerta", "Chave de emergência desliga a gravação pela página"], "shield"),
        cat("Qualificar e o que vem", ["Qualificar pela página Hoje cria o negócio no funil certo, pela Bia", "A leitura de tarefas atrasadas é incremental", "Planejado: versão 2.0, lendo de um espelho dos dados (hoje só em teste)"], "rocket"),
    ], 2) + band("Na página: Página Hoje.")
    A(slide("hoje2", "Página Hoje: cuidados e o que vem", C, hoje2, "dense", "hoje"))
    A(slide("cenarq", "Central: propósito e arquitetura", C, fx("cen", "A página Central é a plataforma de operação: o objetivo é operar a Bia, as automações, as páginas Hoje e Lista e o time sem abrir o terminal. Ela escreve sempre pela Bia. Na página: Central."), "flow", "central"))
    def mod(n, nome, est, txt):
        return (f"{n}. {nome} " + pill(est[0]), txt)
    def mod(n, nome, est, txt):
        return (f"{n}. {nome} " + pill(est[0]), txt)
    m1 = kv([
        mod(1, "Estado ao vivo", ("no ar",), "Aba Visão geral: saúde da Bia e da Ana ao vivo."),
        mod(2, "Interruptores", ("no ar",), "Aba da Bia: desligado, só observa ou ao vivo, com motivo. Planejado (fase 3): aprovar avisos por tipo pela página Central."),
        mod(3, "Números e prazos", ("no ar",), "Números com limite nos controles. Planejado (fase 2): prazos de reposição e cota do SDR."),
        mod(4, "Calendário e horários", ("no ar",), "Dias de folga. Planejado (fase 2): horários por pessoa e por tipo de aviso."),
        mod(5, "Time e permissões", ("no ar",), "Usuários e papéis. Planejado (fase 3): lista única de SDRs e representantes."),
        mod(6, "Mensagens e botões", ("planejado",), "Fase 4: editar textos, botões e listas dos avisos, com prévia, aprovação e versão."),
    ], 2) + band("Os 12 módulos vêm do plano da página Central de 09/11/2026. Fora dos módulos, já no ar: atendimento da Ana e aba da Ana. Na página: Central.")
    A(slide("cenmod", "Central: módulos 1 a 6 do plano e o estado de cada um", C, m1, "dense", "central"))
    m2 = kv([
        mod(7, "Histórico e desfazer", ("no ar",), "Cada mudança com autor, motivo e desfazer."),
        mod(8, "Saúde e alertas", ("no ar",), "Visão geral e filas por pessoa. Planejado (fase 2): absorver a aba da Bia no Dash."),
        mod(9, "Cadência e funis", ("planejado",), "Fase 5: dias, passos e textos da cadência do SDR."),
        mod(10, "Hoje e Lista", ("planejado",), "Fase 3: editar colunas, cota, textos e regras das páginas. Hoje há o interruptor de escrita da página Hoje."),
        mod(11, "Intensidade de cobrança", ("planejado",), "Fase 2: semanas em que a Bia aumenta a cobrança."),
        mod(12, "Dias off e feriados", ("no ar",), "Dias de folga marcados à mão. Planejado (fase 2): por empresa, cidade ou pessoa."),
    ], 2) + band("A página Central controla valores, não a lógica das regras, segredos nem limites de terceiros. Na página: Central.")
    A(slide("cenmod2", "Central: módulos 7 a 12 do plano e o estado de cada um", C, m2, "dense", "central"))
    cen1 = g([
        cat("No ar: atendimento", ["Lista de conversas com selos de situação do lead; conversa completa com histórico, áudios e fotos", "Assumir, responder por texto ou pela voz da Ana, devolver, passar ao time comercial e pausar", "Instruir a Ana por texto ou áudio"], "chat"),
        cat("No ar: a Ana", ["Aba da Ana: modo, parada de emergência, voz e base de conhecimento editável, com versões", "Aprendizado por polegar para cima ou para baixo, com análise que a gestão aprova"], "ctrl"),
    ], 2) + band("Por desenho, a página Central pede à Bia e não escreve direto no Agendor. Na página: Central.")
    A(slide("central", "Página Central: atendimento e a Ana", C, cen1, "dense", "central"))
    cen2 = g([
        cat("Em implantação (ainda não no ar)", ["Prevista para 17/11 às 9h", "Botões com confirmação, que leem de volta antes de dizer que deu certo", "Selos do CRM e do início agendado; lista leve; auditoria enxuta"], "rocket"),
        cat("Planejado (origem: levantamento de 16/11 e decisão 2)", ["Dar ganho, dar perdido com motivo e repassar ao SDR Inbound", "Editar dados do lead (nome, empresa, CNPJ, segmento, lojas, decisor), com autor registrado e a Ana enxergando", "Alertas com botão, retomada por modelo após 24 h e instrução com pré-visualização"], "clock"),
    ], 2) + band("O desenho dos controles manuais será mostrado antes de publicar. Na página: Central.")
    A(slide("central2", "Página Central: pacote em implantação e o planejado", C, cen2, "dense", "central"))
    outras = g([
        cat("Dash Geral", ["Abas: Vendas, LTV, RFM, SDR, anúncios, GA4 e saúde da Bia", "Lê o Agendor; a data do ganho é a do evento real; lead é negócio do Arena", "Dash expandido: planejado"], "dash"),
        cat("Painel do Representante", ["Carteira ao vivo, ações do dia e valor vendido", "Cada ação confere o dono do negócio e relê o Agendor", "Nova recarga em horário comercial: aguarda auditoria"], "user"),
        cat("WhatsApp e Meta", ["A Ana e a Bia usam números diferentes", "Janela de 24 horas: fora dela, só modelos aprovados", "A Bia só conta como enviado se o WhatsApp aceitou"], "chat"),
    ], 3) + band("Também: Canal (conversa da gestão com o assistente de engenharia) e Life B Solicita (pedidos de material). Na página: Painel, Dash e demais sistemas; WhatsApp e Meta.")
    A(slide("outras", "Dash, painel do representante e Meta", C, outras, "dense", "outras,meta"))

    # ================= PROTEÇÃO =================
    C = "Segurança e testes"
    t1 = g([
        cat("Ana", ["181 arquivos de teste, mais 14 suítes de conversa (contagem em 16/11/2026)", "O deploy roda tudo e aborta se algo falhar; exige as linhas Varredura e Antirregressão e faz backup do código antes", "Teste de fumaça depois de publicar, com conversas canônicas no simulador"], "chat"),
        cat("Bia", ["96 arquivos de teste (contagem em 16/11/2026), incluindo o portão gates.test.mjs", "O deploy bloqueia se o portão não estiver 100% verde e exige a linha Varredura", "Se o código muda, é preciso um teste novo ou alterado com 100 ou mais verificações"], "bot"),
    ], 2) + band("Na página: Segurança e engenharia.")
    A(slide("testes", "Como Ana e Bia são testadas", C, t1, "dense", "seguranca,versoes"))
    t2 = g([
        cat("Páginas", ["Hoje: o roteiro de publicação roda os testes da página (jsdom) e o teste visual em celular e computador", "Central: 35 scripts de teste da página, com tamanhos e temas (contagem em 16/11/2026)", "Ecossistema: testes estático, visual, de interação, de iframe e da apresentação"], "doc"),
        cat("Antes de subir", ["Auditor independente revisa as mudanças grandes", "Publicação só por script, nunca por atalho", "Cada deploy registra o que foi conferido e a data"], "shield"),
    ], 2) + band("Na página: Segurança e engenharia; Versões e verificações por deploy.")
    A(slide("testes2", "Como as páginas são testadas e publicadas", C, t2, "dense", "seguranca,versoes"))
    regras = g([
        cat("Regras fixas", ["Escreveu, releia: só se diz confirmado quando a leitura bate", "Em regra, nada começa sozinho no Outbound", "Dono ativo, ligação com resultado, perda com explicação", "Mudança direta no Agendor fica registrada, e a gestão recebe um resumo"], "lock"),
        cat("Vigias", ["Negócio sem tarefa, cadastro incompleto, funil errado, duplicados", "Agendor, automações, webhook da Ana e backups", "Sincronização do Dash: alerta se parar por mais de 15 minutos", "Custo diário e mensal"], "eye"),
        cat("Plano B", ["IA falhou: texto padrão seguro", "Voz falhou: voz reserva e depois texto", "Falha de envio: fila de reenvio, com teto e alerta à gestão", "Interruptores de emergência para a Ana, a Bia e cada regra"], "shield"),
    ], 3) + band("Na página: Regras de ouro e proteções; Observabilidade e entrega de avisos.")
    A(slide("regras", "Regras fixas, vigias e plano B", C, regras, "dense", "regras,observ,sobre"))
    return S
