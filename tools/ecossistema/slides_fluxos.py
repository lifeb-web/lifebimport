"""Fluxogramas do modo apresentação (16/11/2026). Uma figura por slide; cada uma tem a versão larga (paisagem) e a versão vertical (celular em pé, no máximo 5 caixas,
uma por linha, para o texto continuar legível). Mesmo gerador e mesmo verificador geométrico da página (fluxo.py): seta que atravessa caixa ou rótulo sem lugar derruba a geração.
Todo texto aqui foi conferido no código e nos documentos; o que não foi conferido não entra."""
import re
from fluxo import desenhar, Erro, esc

def N(i, t, s, st, c, r, span=1):
    return dict(id=i, t=t, s=s, st=st, c=c, r=r, span=span)

PARTES = {}

def parte(chave, titulo, desc, cols, nodes, edges, nodes_n=None, edges_n=None):
    PARTES[chave] = dict(titulo=titulo, desc=desc, cols=cols, nodes=nodes, edges=edges, nodes_n=nodes_n or nodes, edges_n=edges_n if edges_n is not None else edges)

# ---- mapa
parte("mapa", "Como as peças se conectam", "O lead escreve no WhatsApp. A Meta entrega à Ana, que conversa e pede à Bia. A Bia escreve no Agendor e envia os avisos.", 3,
  [N("lead", "Lead", "Anúncio, site, lista ou WhatsApp direto", "n", 0, 0), N("meta", "WhatsApp (Meta)", "Número da Ana, janela de 24 horas e modelos aprovados", "n", 1, 0), N("ana", "Ana", "Conversa, qualifica e guarda o histórico", "p", 2, 0),
   N("bia", "Bia", "Aplica as regras, escreve no Agendor, relê para confirmar e avisa a equipe", "m", 0, 1, 3), N("ag", "Agendor (CRM)", "Empresas, negócios, funis e tarefas", "g", 0, 2), N("av", "Avisos no WhatsApp", "Gestão, SDR, closer e representantes", "n", 2, 2)],
  [("lead", "meta", ""), ("meta", "ana", ""), ("ana", "bia", "pede"), ("bia", "ag", "escreve"), ("bia", "av", "avisa")],
  nodes_n=[N("lead", "Lead e WhatsApp (Meta)", "Chega por anúncio, site, lista ou WhatsApp direto", "n", 0, 0), N("ana", "Ana", "Conversa, qualifica e guarda o histórico", "p", 0, 1), N("bia", "Bia", "Aplica as regras, escreve no Agendor, relê e avisa a equipe", "m", 0, 2),
           N("ag", "Agendor (CRM) e avisos", "A Bia grava empresas, negócios, funis e tarefas e envia os avisos no WhatsApp a gestão, SDR, closer e representantes", "g", 0, 3)],
  edges_n=[("lead", "ana", ""), ("ana", "bia", "pede"), ("bia", "ag", "escreve e avisa")])

# ---- a ponte: só a Bia escreve no CRM
parte("ponte", "Quem escreve no CRM: a Bia", "Por desenho, a Ana pede à Bia por uma ponte autenticada com chave própria e não tem o acesso do Agendor. A ponte só aceita pedidos sobre negócios do funil da Ana. A página Hoje e a página Central também agem pela Bia. A Bia grava, lê de volta e só então confirma.", 4,
  [N("ana", "Ana", "Conversa com o lead e decide o próximo passo", "p", 0, 0, 2), N("ponte", "Ponte autenticada", "Pedidos fixos: lead, etapa, nota, escalar, não contatar e contexto. Chave própria. Só aceita negócios do funil da Ana", "m", 2, 0, 2),
   N("pag", "Páginas Hoje e Central", "As páginas de trabalho também pedem à Bia; não escrevem direto", "n", 0, 1, 2), N("bia", "Bia", "Confere o pedido e as regras e escreve com fila e freio", "m", 2, 1, 2),
   N("ag", "Agendor", "Recebe a escrita", "g", 2, 2, 2), N("conf", "Confirmação", "A Bia relê o Agendor e só então devolve ok", "g", 0, 2, 2)],
  [("ana", "ponte", ""), ("ponte", "bia", ""), ("pag", "bia", ""), ("bia", "ag", "escreve"), ("ag", "conf", "")],
  nodes_n=[N("ana", "Ana", "Conversa com o lead e decide o próximo passo", "p", 0, 0), N("ponte", "Ponte autenticada", "Pedidos fixos, com chave própria. Só aceita negócios do funil da Ana", "m", 0, 1),
           N("bia", "Bia", "Confere o pedido e escreve. As páginas Hoje e Central também pedem à Bia", "m", 0, 2), N("ag", "Agendor", "Recebe a escrita", "g", 0, 3), N("conf", "Confirmação", "A Bia relê o Agendor e só então devolve ok", "g", 0, 4)],
  edges_n=[("ana", "ponte", ""), ("ponte", "bia", ""), ("bia", "ag", "escreve"), ("ag", "conf", "relê")])

# ---- jornada do lead
parte("jor", "Jornada do lead", "O lead conversa com a Ana. Ao qualificar, o negócio dela vira Ganho e nasce um negócio no SDR Inbound, com o SDR como dono. O SDR atende pela página Hoje e, ao qualificar, nasce o negócio no Arena.", 4,
  [N("lead", "Lead", "WhatsApp, anúncio ou site", "n", 0, 0), N("ana", "Ana conversa", "Segmento, lojas, decisor e CNPJ", "p", 1, 0, 2), N("per", "Fora do perfil", "Encerra com educação, com motivo registrado", "x", 3, 0),
   N("inb", "SDR Inbound", "Negócio nasce na etapa Ana qualificou, com o SDR como dono", "g", 0, 1, 2), N("hoje", "SDR na página Hoje", "Atende, liga e confirma o perfil", "p", 2, 1, 2), N("are", "Arena", "Nasce quando o SDR qualifica pela página Hoje. O representante de campo vende", "g", 2, 2, 2)],
  [("lead", "ana", ""), ("ana", "per", ""), ("ana", "inb", "qualificou"), ("inb", "hoje", ""), ("hoje", "are", "qualifica")],
  nodes_n=[N("lead", "Lead", "WhatsApp, anúncio ou site", "n", 0, 0), N("ana", "Ana conversa", "Segmento, lojas, decisor e CNPJ. Fora do perfil: encerra com educação", "p", 0, 1),
           N("inb", "SDR Inbound", "Nasce na etapa Ana qualificou, com o SDR como dono", "g", 0, 2), N("hoje", "SDR na página Hoje", "Atende, liga e confirma o perfil", "p", 0, 3), N("are", "Arena", "Nasce quando o SDR qualifica. O representante de campo vende", "g", 0, 4)],
  edges_n=[("lead", "ana", ""), ("ana", "inb", "qualificou"), ("inb", "hoje", ""), ("hoje", "are", "qualifica")])

# ---- caminho da mensagem na Ana
parte("msg", "O caminho de cada mensagem na Ana", "A mensagem é guardada primeiro, mensagens seguidas são juntadas, a IA escreve a resposta, o validador confere e, se reprovar, entra um texto padrão seguro. Depois envia e pede à Bia.", 3,
  [N("a", "Guardar primeiro", "A mensagem entra no histórico antes de tudo", "n", 0, 0), N("b", "Juntar e entender", "Junta mensagens seguidas; áudio vira texto; foto e PDF são lidos", "n", 1, 0), N("c", "Cérebro decide", "Regras fixas e IA: cumprimento, segmento, CNPJ, apresentação, dúvida ou repasse", "p", 2, 0),
   N("d", "IA escreve", "No estilo da Ana, com o que já se sabe do lead", "p", 2, 1), N("e", "Validador confere", "Termos proibidos, gancho, tamanho e repetição. Se reprovar: texto padrão seguro", "m", 1, 1), N("f", "Envia, registra e pede à Bia", "Balões ou áudio; histórico; a Bia grava no Agendor", "g", 0, 1)],
  [("a", "b", ""), ("b", "c", ""), ("c", "d", ""), ("d", "e", ""), ("e", "f", "")],
  nodes_n=[N("a", "Guardar e juntar", "Guarda a mensagem antes de tudo e junta mensagens seguidas; mídia é entendida", "n", 0, 0), N("c", "Cérebro decide", "Regras fixas e IA: cumprimento, segmento, CNPJ, apresentação, dúvida ou repasse", "p", 0, 1),
           N("d", "IA escreve", "No estilo da Ana, com o que já se sabe do lead", "p", 0, 2), N("e", "Validador confere", "Se reprovar, entra um texto padrão seguro", "m", 0, 3), N("f", "Envia e pede à Bia", "Balões ou áudio; histórico; a Bia grava no Agendor", "g", 0, 4)],
  edges_n=[("a", "c", ""), ("c", "d", ""), ("d", "e", ""), ("e", "f", "")])

# ---- SDR: da lista ao representante
parte("sdr", "O SDR: da lista ao representante", "A lista do Outbound sobe pela página Lista e fica na fila de espera da página Hoje. O SDR clica Iniciar, a Bia cria as tarefas da cadência, o SDR registra os resultados e decide. Ao qualificar, a Bia cria o negócio no Arena.", 3,
  [N("lista", "Lista do Outbound", "Planilha na página Lista, com prévia, origem obrigatória e sem duplicar", "n", 0, 0), N("fila", "Fila de espera", "Na página Hoje: negócios em D1, sem tarefas, por ordem de urgência; pode haver cota diária", "n", 1, 0),
   N("ini", "SDR clica Iniciar", "A Bia cria as tarefas da cadência: ligação e WhatsApp, em dias úteis", "p", 2, 0), N("res", "Resultado registrado", "Cada ligação termina com o resultado anotado na página Hoje", "n", 2, 1),
   N("dec", "SDR decide", "Qualifica e escolhe o representante, perde com motivo ou congela", "m", 1, 1), N("are", "Arena", "A Bia cria o negócio e o representante de campo vende", "g", 0, 1)],
  [("lista", "fila", ""), ("fila", "ini", ""), ("ini", "res", ""), ("res", "dec", ""), ("dec", "are", "")],
  nodes_n=[N("lista", "Lista do Outbound", "Planilha na página Lista, com prévia e origem obrigatória", "n", 0, 0), N("fila", "Fila de espera", "Na página Hoje: negócios em D1, sem tarefas, por ordem de urgência", "n", 0, 1),
           N("ini", "SDR clica Iniciar", "A Bia cria as tarefas da cadência, em dias úteis", "p", 0, 2), N("dec", "SDR registra e decide", "Resultado de cada ligação; qualifica, perde com motivo ou congela", "m", 0, 3), N("are", "Arena", "A Bia cria o negócio e o representante de campo vende", "g", 0, 4)],
  edges_n=[("lista", "fila", ""), ("fila", "ini", ""), ("ini", "dec", ""), ("dec", "are", "qualifica")])

# ---- voltas ao SDR
parte("volta", "Voltas ao SDR", "Três rotinas devolvem negócios ao SDR como negócio novo, na fila de espera do Outbound, com a nota de onde vieram.", 3,
  [N("o1", "Recuperação SDR", "Lead do SDR perdido: volta 14 dias depois", "n", 0, 0), N("o2", "Recuperação", "Perdido por representante no Arena: o prazo depende do motivo", "n", 1, 0), N("o3", "Reativação", "Cliente do Pós-venda que não repôs no prazo", "n", 2, 0),
   N("reg", "Regras comuns", "Uma volta por empresa a cada 180 dias; sem negócio aberto nem compra posterior; limite por dia", "m", 0, 1, 3), N("neg", "Negócio novo no SDR Outbound", "Na fila de espera, com o SDR como responsável e nota de origem. O negócio antigo nunca reabre", "p", 0, 2, 3)],
  [("o1", "reg", ""), ("o2", "reg", ""), ("o3", "reg", ""), ("reg", "neg", "")],
  nodes_n=[N("o", "Três origens", "Recuperação SDR (lead do SDR perdido, volta em 14 dias); Recuperação (perdido por representante no Arena, prazo conforme o motivo); Reativação (cliente do Pós-venda que não repôs)", "n", 0, 0),
           N("reg", "Regras comuns", "Uma volta por empresa a cada 180 dias; sem negócio aberto nem compra posterior; limite por dia", "m", 0, 1), N("neg", "Negócio novo no SDR Outbound", "Na fila de espera, com o SDR como responsável e nota de origem. O negócio antigo nunca reabre", "p", 0, 2)],
  edges_n=[("o", "reg", ""), ("reg", "neg", "")])

# ---- avisos
parte("av", "Do evento ao aviso enviado", "Um evento passa pelas regras da Ana e da Bia. A Bia envia no WhatsApp e só conta como enviado se o WhatsApp aceitou. Se o envio falhar, o aviso fica numa fila e é reenviado.", 3,
  [N("ev", "Evento", "Lead novo, qualificado, pediu pessoa, tarefa vencida", "n", 0, 0), N("reg", "Regras da Ana e da Bia", "Sem repetir, limite por hora, silêncio da noite, destino permitido", "m", 1, 0), N("env", "Bia envia no WhatsApp", "Muitos avisos trazem botão para abrir a conversa", "p", 2, 0),
   N("conf", "Saiu de verdade?", "Só conta como enviado se o WhatsApp aceitou; então registra. Se não aceitou, vai para a fila", "g", 2, 1), N("fila", "Fila de reenvio", "Se o envio falhou, o aviso fica na fila e volta a cada poucos minutos; se a Meta recusar a entrega, ainda não há reenvio automático", "x", 1, 1)],
  [("ev", "reg", ""), ("reg", "env", ""), ("env", "conf", ""), ("conf", "fila", "")],
  nodes_n=[N("ev", "Evento", "Lead novo, qualificado, pediu pessoa, tarefa vencida", "n", 0, 0), N("reg", "Regras da Ana e da Bia", "Sem repetir, limite por hora, silêncio da noite, destino permitido", "m", 0, 1), N("env", "Bia envia no WhatsApp", "Muitos avisos trazem botão para abrir a conversa", "p", 0, 2),
           N("conf", "Saiu de verdade?", "Só conta como enviado se o WhatsApp aceitou", "g", 0, 3), N("fila", "Fila de reenvio", "Se o envio falhou, o aviso volta a cada poucos minutos", "x", 0, 4)],
  edges_n=[("ev", "reg", ""), ("reg", "env", ""), ("env", "conf", ""), ("conf", "fila", "não")])

# ---- Central: propósito e arquitetura (plano da Central, 09/11)
parte("cen", "Central: como ela controla a plataforma", "Pessoas com papéis usam a página Central. A API de controle valida, pede motivo e confirmação, grava o histórico e relê. Os valores ficam num registro de configuração que a Bia, a Ana e as páginas Hoje e Lista leem a cada uso.", 4,
  [N("pes", "Pessoas e papéis", "A gestão muda tudo; administradores só risco baixo ou médio; SDR: hoje só lê (no plano, depois, só o que é dele)", "n", 0, 0, 2), N("pag", "Página Central", "Atendimento, controles, histórico, filas, calendário e usuários", "p", 2, 0, 2),
   N("reg", "Registro de configuração", "Chaves e valores lidos a cada uso. Chave ausente: vale o padrão seguro do código", "g", 0, 1, 2), N("api", "API de controle", "Valida valor e permissão, pede motivo, grava o histórico e relê para confirmar", "m", 2, 1, 2),
   N("sis", "Bia, Ana e páginas Hoje e Lista", "Leem os valores a cada uso. A página Central muda valores, não a lógica das regras nem segredos", "n", 0, 2, 4)],
  [("pes", "pag", ""), ("pag", "api", ""), ("api", "reg", ""), ("reg", "sis", "")],
  nodes_n=[N("pes", "Pessoas e papéis", "Gestão muda tudo; administrador, risco baixo e médio; SDR só lê hoje", "n", 0, 0), N("pag", "Página Central", "Atendimento, controles, histórico, filas, calendário e usuários", "p", 0, 1),
           N("api", "API de controle", "Valida, pede motivo, grava o histórico e relê", "m", 0, 2), N("reg", "Registro de configuração", "Valores lidos a cada uso; chave ausente: padrão seguro", "g", 0, 3), N("sis", "Bia, Ana e páginas Hoje e Lista", "Leem os valores. A página Central não muda a lógica das regras", "n", 0, 4)],
  edges_n=[("pes", "pag", ""), ("pag", "api", ""), ("api", "reg", ""), ("reg", "sis", "")])

# ---- automações no CRM
parte("autom", "Automações no CRM: quem dispara, o que faz e com que regra", "Um relógio, um evento do Agendor ou uma ação da página Hoje dispara a automação. O modo e as regras decidem se ela age. A Bia escreve no Agendor e relê para confirmar, avisa quem precisa agir e alerta a gestão se falhar.", 4,
  [N("t", "Dispara", "Relógio (a cada minuto, 5 minutos ou diário), evento do Agendor ou ação da página Hoje", "n", 0, 0, 2), N("m", "Modo e regras", "Desligada, em sombra (só simula e relata) ou ao vivo; horário, dia útil e limites por rodada e por dia", "m", 2, 0, 2),
   N("b", "Bia age no CRM", "Cria e fecha tarefas, move etapa, cria negócio e distribui; relê o Agendor para confirmar", "p", 2, 1, 2), N("a", "Avisa e registra", "Aviso a quem precisa agir, com registro do autor", "n", 0, 1, 2),
   N("g", "Alerta à gestão", "Se a rotina falhar ou esgotar as tentativas", "x", 0, 2, 4)],
  [("t", "m", ""), ("m", "b", ""), ("b", "a", ""), ("a", "g", "")],
  nodes_n=[N("t", "Dispara", "Relógio, evento do Agendor ou ação da página Hoje", "n", 0, 0), N("m", "Modo e regras", "Desligada, em sombra (só simula) ou ao vivo; horário e limites", "m", 0, 1), N("b", "Bia age no CRM", "Cria e fecha tarefas, move etapa, cria negócio; relê para confirmar", "p", 0, 2),
           N("a", "Avisa e registra", "Aviso a quem precisa agir, com o autor", "n", 0, 3), N("g", "Alerta à gestão", "Se a rotina falhar", "x", 0, 4)],
  edges_n=[("t", "m", ""), ("m", "b", ""), ("b", "a", ""), ("a", "g", "")])

def _vb(svg):
    m = re.search(r'viewBox="0 0 (\d+) (\d+)"', svg)
    return int(m.group(1)), int(m.group(2))

def svgs(chave, alvo=0.34):
    p = PARTES[chave]; melhor = None
    for W in range(620, 1401, 20):
        try:
            s = desenhar("s" + chave + "w", [dict(n) for n in p["nodes"]], p["edges"], W, p["cols"])
        except Erro:
            continue
        w, h = _vb(s); sc = abs(h / w - alvo)
        if melhor is None or sc < melhor[0]:
            melhor = (sc, s)
    if melhor is None:
        raise Erro(f"nenhuma largura serve para {chave}")
    import fluxo
    ordem = [n["id"] for n in sorted(p["nodes_n"], key=lambda n: (n["r"], n["c"]))]
    gy0 = fluxo.GY
    try:
        fluxo.GY = 40
        est = desenhar("s" + chave + "n", [dict(n) for n in p["nodes_n"]], p["edges_n"], 400, p["cols"], narrow=True, ordem_narrow=ordem)
    except Erro:
        fluxo.GY = gy0
        est = desenhar("s" + chave + "n", [dict(n) for n in p["nodes_n"]], p["edges_n"], 400, p["cols"], narrow=True, ordem_narrow=ordem)
    finally:
        fluxo.GY = gy0
    return melhor[1], est, p

if __name__ == "__main__":
    ok = 0
    for k in PARTES:
        try:
            w, n, p = svgs(k); print("ok", k, _vb(w), _vb(n)); ok += 1
        except Exception as ex:
            print("ERRO", k, ex)
    print(ok, "/", len(PARTES))
