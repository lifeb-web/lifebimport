#!/usr/bin/env python3
"""Slides do modo apresentação do Ecossistema (16/11/2026). Gera o HTML do deck a partir de estado.json (fonte única do estado).
Cada slide é uma <section class="slide"> dentro de #deck > .stage (1920x1080 na horizontal, 1080x1920 na vertical; o JS escala sem rolagem).
Sem nomes de pessoas: só papéis (time comercial, SDR, representantes, diretoria)."""
import json, os
from comp import e
AQUI = os.path.dirname(os.path.abspath(__file__))
ESTADO = json.load(open(os.path.join(AQUI, "estado.json"), encoding="utf-8"))
COMP = {c["id"]: c for c in ESTADO["componentes"]}
ATUAL = ESTADO["atualizado_em"]
PILL = {"no ar": ("ok", "No ar"), "em implantação": ("te", "Em implantação"), "planejado": ("pl", "Planejado")}

def pill(est):
    k, t = PILL[est]
    return f'<span class="dp dp-{k}">{t}</span>'

def ic(nome):
    P = {
     "chat": '<path d="M4 5h16v11H9l-5 4z"/>',
     "bot": '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 16h6"/>',
     "mesa": '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4M7 9h5M7 12h8"/>',
     "ctrl": '<path d="M5 6h14M5 12h14M5 18h14"/><circle cx="9" cy="6" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="8" cy="18" r="2" fill="currentColor"/>',
     "dash": '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
     "crm": '<path d="M4 6h6v5H4zM14 6h6v5h-6zM9 15h6v5H9z"/><path d="M7 11v2h10v-2M12 13v2"/>',
     "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
     "mix": '<path d="M4 5h16M4 12h10M4 19h16"/>',
     "eye": '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
     "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
     "shield": '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5L16 9"/>',
     "lock": '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
     "rocket": '<path d="M5 19c0-3 1-5 3-7l5-5c3-3 6-3 7-3 0 1 0 4-3 7l-5 5c-2 2-4 3-7 3z"/><path d="M9 15l-4 4"/>',
     "mic": '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
     "bell": '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>',
     "list": '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
     "check": '<path d="M5 12l4 4 10-10"/>',
     "doc": '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
     "git": '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5v7M8.5 6c5 0 7 2 7 4"/>',
    }
    return f'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">{P[nome]}</svg>'

def li(items):
    return "<ul>" + "".join(f"<li>{x}</li>" for x in items) + "</ul>"

def card(icone, titulo, corpo, extra="", cls=""):
    return f'<div class="dcard {cls}"><div class="dcardh">{ic(icone)}<h3>{titulo}</h3>{extra}</div><p>{corpo}</p></div>'

_n = [0]

def slide(n, chave, titulo, kick, corpo, cls=""):
    _n[0] += 1; n = _n[0]
    return (f'<section class="slide {cls}" id="sl-{chave}" data-t="{e(titulo)}" aria-label="Slide {n}: {e(titulo)}" aria-hidden="true">'
            f'<div class="sl-in"><header class="sl-h"><span class="kick">{kick}</span><h2>{titulo}</h2></header><div class="sl-b">{corpo}</div></div></section>')

def estado_barra(*ids):
    """Linha com o estado de cada componente citado, lida de estado.json."""
    return '<div class="ebar">' + "".join(f'<span class="eb"><b>{COMP[i]["nome"]}</b>{pill(COMP[i]["estado"])}</span>' for i in ids) + "</div>"

def faixa_estado(i):
    c = COMP[i]; out = []
    if c["implantacao"]:
        out.append('<div class="dfx dfx-te">' + pill("em implantação") + "<span>" + "; ".join(c["implantacao"]) + ". Ainda não está no ar.</span></div>")
    if c["planejado"]:
        out.append('<div class="dfx dfx-pl">' + pill("planejado") + "<span>" + "; ".join(c["planejado"]) + ".</span></div>")
    return '<div class="dfxs">' + "".join(out) + "</div>"

def slides():
    S = []; _n[0] = 0
    # 1 capa
    orb = ''.join(f'<g class="orb o{k}"><circle cx="{x}" cy="{y}" r="46"/><text x="{x}" y="{y+6}" text-anchor="middle">{t}</text></g>' for k, (x, y, t) in enumerate([(300, 70, "Ana"), (500, 200, "Bia"), (460, 420, "Hoje"), (140, 440, "Central"), (100, 210, "Dash")]))
    capa = (f'<div class="capa"><div class="capa-t"><span class="kick">Life B Importadora</span><h1>Ecossistema <em>Life B</em></h1>'
            f'<p class="sub">Atendimento comercial com inteligência artificial, do primeiro contato do lojista até a venda.</p>'
            f'<div class="dchips"><span class="dchip">Atualizado em {ATUAL}</span><span class="dchip">{pill("no ar")}</span><span class="dchip">{pill("em implantação")}</span><span class="dchip">{pill("planejado")}</span></div>'
            f'<p class="dica">Use as setas, o toque ou o clique para avançar. Esc para sair.</p></div>'
            f'<svg class="capa-g" viewBox="0 0 600 520" role="img" aria-label="Ana no centro, ligada à Bia, Hoje, Central e Dash"><g class="lnk">'
            + "".join(f'<line x1="300" y1="260" x2="{x}" y2="{y}"/>' for x, y in [(300, 70), (500, 200), (460, 420), (140, 440), (100, 210)])
            + f'</g><circle class="core" cx="300" cy="260" r="86"/><text x="300" y="250" text-anchor="middle" class="ct1">Life B</text><text x="300" y="286" text-anchor="middle" class="ct2">Ecossistema</text>{orb}</svg></div>')
    S.append(slide(1, "capa", "Ecossistema Life B", "Capa", capa, "s-capa"))
    # 2 visão geral
    vis = ('<div class="dg3">'
        + card("chat", "Ana", "SDR virtual: conversa com o lojista no WhatsApp, qualifica e repassa.", pill(COMP["ana"]["estado"]))
        + card("bot", "Bia", "Agente interno: fala com o time e o CRM, avisa e age no momento certo.", pill(COMP["bia"]["estado"]))
        + card("mesa", "Hoje", "A mesa de trabalho do SDR: fila, ligações e qualificação.", pill(COMP["hoje"]["estado"]))
        + card("ctrl", "Central", "Controle da Ana: assumir conversa, instruir e ligar ou desligar regras.", pill(COMP["central"]["estado"]))
        + card("dash", "Dash", "Os indicadores da operação em um só lugar.", pill(COMP["dash"]["estado"]))
        + card("crm", "Agendor (CRM)", "A fonte da verdade: empresas, negócios, funis e tarefas.", pill(COMP["agendor"]["estado"]))
        + '</div>')
    S.append(slide(2, "visao", "Seis peças, uma operação", "Visão geral", vis))
    # 2b conexões
    def no(t, d, k=""):
        return f'<div class="dno {k}"><b>{t}</b><span>{d}</span></div>'
    con = ('<div class="chain">' + no("Lead", "WhatsApp, anúncio ou site") + '<i class="dar">→</i>' + no("Ana", "Conversa e qualifica", "n-p") + '<i class="dar">→</i>' + no("Bia", "Única que escreve no CRM", "n-p") + '<i class="dar">→</i>' + no("Agendor", "Fonte da verdade", "n-g") + '</div>'
        '<div class="lbl">Todas as páginas leem o Agendor ao vivo</div>'
        '<div class="chain c4">' + no("Hoje", "Mesa do SDR") + no("Central", "Controle da Ana") + no("Dash", "Indicadores") + no("Painel do representante", "Carteira do dia") + '</div>'
        '<div class="band">A Ana decide o que falar; a Bia escreve e confere; as páginas mostram o mesmo dado para cada papel.</div>')
    S.append(slide(0, "conexoes", "Como as peças se conectam", "Arquitetura", con))
    # 3 problema
    prob = ('<div class="dg2">'
        + card("clock", "Lead esfria rápido", "O lojista escreve a qualquer hora. Quem demora a responder perde a atenção dele.")
        + card("mix", "Qualificação desigual", "Cada atendimento pergunta uma coisa. Faltam dados para o time decidir.")
        + card("list", "Informação espalhada", "Conversa em um lugar, cadastro em outro, tarefa em outro.")
        + card("eye", "Pouca visibilidade", "Difícil saber o que foi feito, por quem e o que está parado.")
        + '</div><div class="band"><b>Resultado:</b> oportunidades perdidas e um time comercial gastando tempo no que não vende.</div>')
    S.append(slide(3, "problema", "O problema", "Por que mudar", prob))
    # 4 solução
    sol = ('<div class="dg3">'
        + card("chat", "A IA conversa", "A Ana atende, qualifica e entrega o lead pronto ao time comercial.")
        + card("lock", "Regras travam", "O que pode ser dito e feito é decidido por regras fixas, não pela IA.")
        + card("crm", "O CRM manda", "Tudo fica registrado no Agendor. Se está lá, é o que vale.")
        + '</div><div class="eq"><span>Ana qualifica</span><i>→</i><span>SDR confirma</span><i>→</i><span>Representante vende</span></div>')
    S.append(slide(4, "solucao", "A solução", "Como resolvemos", sol))
    # 5 jornada
    passos = [("1", "Lead chega", "Anúncio, site ou WhatsApp"), ("2", "Ana conversa", "Segmento, lojas, decisor e CNPJ"), ("3", "Ana qualifica", "Repassa ao time comercial"), ("4", "SDR na Hoje", "Confirma e qualifica"), ("5", "Arena", "O representante vende"), ("6", "Pós-venda", "Reposição e reativação")]
    jor = ('<div class="dsteps">' + "".join(f'<div class="stp"><span class="n">{n}</span><h3>{t}</h3><p>{d}</p></div>' for n, t, d in passos) + '</div>'
        '<div class="band">Cada passo é registrado no Agendor. Quem para de responder recebe toques de retomada; qualquer resposta cancela o que falta.</div>')
    S.append(slide(5, "jornada", "A jornada do lead", "Do primeiro contato à venda", jor))
    # 6 ana
    chat = ('<div class="phone" role="img" aria-label="Ilustração de uma conversa no WhatsApp"><div class="ph-top">WhatsApp · ilustração</div>'
        '<div class="msg l">Oi, vi o anúncio da Life B.</div><div class="msg a">Olá! Sou a Ana, da equipe Life B. Qual é o nome da sua loja?</div>'
        '<div class="msg l">Farmácia, tenho 3 lojas.</div><div class="msg a">Que bom! Você é quem decide as compras?</div><div class="msg dig">digitando...</div></div>')
    ana = ('<div class="two"><div class="dcol">' + li([
        "Atende lojistas no WhatsApp: farmácias, supermercados, conveniências e outros",
        "Qualifica: segmento, lojas, decisor e CNPJ ativo",
        "Apresenta o projeto Mega Vision USA",
        "Repassa ao time comercial",
        "Responde em áudio (ElevenLabs) quando o lead manda áudio",
        "Humaniza: mostra digitando e faz pausas",
        "Retoma quem some e encerra com educação quem está fora do perfil",
        "Usa mensagens modelo aprovadas na Meta; a equipe a instrui pela Central"]) + faixa_estado("ana") + '</div>' + chat + '</div>')
    S.append(slide(6, "ana", "Ana: SDR inbound por WhatsApp", "Atendimento", ana))
    # 7 bia
    bia = ('<div class="dg2">'
        + card("bot", "Agente interno", "Conversa com o time pelo WhatsApp e age no CRM Agendor.")
        + card("bell", "Avisos ao time", "Lead novo, retorno combinado, tarefa vencida: com botão para abrir.")
        + card("rocket", "Motores proativos", "Cobram o que está parado, no horário certo de cada pessoa.")
        + card("user", "Painel do representante", "A carteira ao vivo e as ações do dia, no celular.")
        + '</div><div class="band"><b>Regra de ouro:</b> a Bia é a única que escreve no CRM e só confirma depois de ler de volta.</div>')
    S.append(slide(7, "bia", "Bia: o agente interno", "Operação", bia))
    # 7b avisos
    av = ('<div class="chain c5">' + no("Evento", "Lead novo, qualificou, pediu pessoa") + '<i class="dar">→</i>' + no("Regras da Ana", "Sem repetir, limite por hora, silêncio da noite", "n-p") + '<i class="dar">→</i>' + no("Regras da Bia", "Destino permitido, sem repetir", "n-p") + '<i class="dar">→</i>' + no("WhatsApp", "Aviso com botão para abrir a conversa", "n-g") + '<i class="dar">→</i>' + no("Confirmação", "Só conta como enviado se saiu de verdade", "n-g") + '</div>'
        '<div class="band"><b>Se o envio falhar:</b> o aviso fica numa fila durável e um vigia reenvia sozinho. Aviso à noite e não urgente vai para o resumo.</div>')
    S.append(slide(0, "avisos", "Avisos que não se perdem", "Fluxo", av))
    # 8 hoje
    kan = ('<div class="kan" role="img" aria-label="Ilustração de colunas da página Hoje">' + "".join(
        f'<div class="kc"><b>{t}</b>' + '<i></i><i class="s"></i><i></i>' + '</div>' for t in ["Inbound novo", "Aberturas", "Atrasadas", "Iniciados hoje"]) + '</div>')
    hoje = ('<div class="two"><div class="dcol">' + li([
        "Mesa do SDR sem travas de horário",
        "Fila organizada por listas",
        "Leitura incremental de tarefas atrasadas",
        "Qualificação que cria o negócio no funil certo",
        "Ligar, anotar, marcar perdido e escolher o representante sem abrir o CRM"]) + faixa_estado("hoje") + '</div>' + kan + '</div>')
    S.append(slide(8, "hoje", "Hoje: a mesa do SDR", "Trabalho do dia", hoje))
    # 9 central
    tog = ('<div class="panel" role="img" aria-label="Ilustração de interruptores da Central">' + "".join(
        f'<div class="row"><span>{t}</span><i class="tg {"on" if o else ""}"></i></div>' for t, o in [("Ana respondendo", 1), ("Avisos ao time", 1), ("Toques de retomada", 1), ("Regra em revisão", 0)]) + '</div>')
    cen = ('<div class="two"><div class="dcol">' + li([
        "Acompanhar cada conversa da Ana com ficha e sinais",
        "Assumir, instruir (texto ou áudio), devolver e pausar",
        "Ligar ou desligar regras, em níveis de risco",
        "Toda mudança pede motivo, aparece no histórico e pode ser desfeita"]) + faixa_estado("central") + '</div>' + tog + '</div>')
    S.append(slide(9, "central", "Central: o controle da Ana", "Governança do dia a dia", cen))
    # 10 dash
    bars = ('<div class="chart" role="img" aria-label="Ilustração de gráfico de barras"><div class="bars">' + "".join(f'<i style="--h:{h}%"></i>' for h in [38, 52, 44, 66, 58, 80, 72]) + '</div><small>Ilustração</small></div>')
    das = ('<div class="two"><div class="dcol">' + li([
        "Vendas e clientes",
        "Desempenho do SDR e dos representantes",
        "Anúncios e origem dos leads",
        "Custo e métricas da Ana e da Bia",
        "Números lidos do Agendor, a mesma fonte da operação"]) + faixa_estado("dash") + '</div>' + bars + '</div>')
    S.append(slide(10, "dash", "Dash: os indicadores", "Visibilidade", das))
    # 11 crm
    crm = ('<div class="funis"><div class="fn f1"><b>Funil Ana</b><p>O negócio da Ana vira <u>Ganho</u> ao qualificar (qualificação, não venda).</p><div class="et"><span>Novo lead</span><span>Em conversa</span><span>Retorno combinado</span><span>Repassado</span></div></div><i class="dar">→</i>'
        '<div class="fn f2"><b>SDR Inbound</b><p>Nasce na etapa "Ana qualificou", com o SDR como dono.</p><div class="et"><span>Ana qualificou</span><span>Cadência por dias úteis</span><span>Qualificado</span></div></div><i class="dar">→</i>'
        '<div class="fn f3"><b>Arena</b><p>Só nasce quando o SDR qualifica pela Hoje. Ganho aqui é venda.</p><div class="et"><span>Conexão</span><span>Diagnóstico</span><span>Negociação</span><span>Ganho</span></div></div></div>'
        '<div class="band">Depois da venda: Pós-venda, com ciclos de reposição, e Reativação para quem parou de comprar. O Agendor é a fonte da verdade.</div>')
    S.append(slide(11, "crm", "CRM e funis no Agendor", "Para onde cada lead vai", crm))
    # 12 segurança
    seg = ('<div class="dg2">'
        + card("shield", "Auditores independentes", "Antes de ir ao ar, uma revisão separada de quem construiu confere o trabalho.")
        + card("lock", "Travas que não dependem da IA", "Limites e permissões fixos. Em caso de dúvida, a regra bloqueia e avisa.")
        + card("git", "Deploy só por script", "Cópia de segurança, testes e varredura antes de publicar, sempre pelo mesmo roteiro.")
        + card("ctrl", "Interruptores e registro", "A diretoria liga e desliga regras, tudo com histórico e desfazer.")
        + '</div>')
    S.append(slide(12, "seguranca", "Segurança e governança", "Confiança", seg))
    # 13 estado (lido de estado.json)
    cols = {"no_ar": [], "implantacao": [], "planejado": []}
    for c in ESTADO["componentes"]:
        for k in cols:
            if c[k]:
                cols[k].append(f'<li><b>{c["nome"]}</b> {"; ".join(c[k])}</li>')
    est = ('<div class="dg3 est">'
        f'<div class="ec e-ok"><h3>{pill("no ar")}</h3><ul>{"".join(cols["no_ar"])}</ul></div>'
        f'<div class="ec e-te"><h3>{pill("em implantação")}</h3><ul>{"".join(cols["implantacao"])}</ul></div>'
        f'<div class="ec e-pl"><h3>{pill("planejado")}</h3><ul>{"".join(cols["planejado"])}</ul></div></div>'
        f'<div class="band">Posição de {ATUAL}. "No ar" foi conferido em produção; "em implantação" está pronto, mas ainda não no ar; "planejado" é futuro.</div>')
    S.append(slide(13, "estado", "O que está no ar e o que vem", "Situação", est))
    # 14 encerramento
    fim = ('<div class="capa"><div class="capa-t"><span class="kick">Em resumo</span><h2 class="big">Uma operação conectada, do primeiro contato à venda</h2>'
        '<ul class="resumo"><li>IA atende e qualifica, pessoas decidem e vendem</li><li>Regras fixas e auditoria independente protegem a operação</li><li>Tudo registrado no CRM e medido no Dash</li></ul>'
        f'<div class="dchips"><span class="dchip">Atualizado em {ATUAL}</span></div></div></div>')
    S.append(slide(14, "fim", "Obrigado", "Encerramento", fim, "s-capa s-fim"))
    return S

def deck():
    S = slides(); N = len(S)
    ic_x = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
    ic_p = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
    ic_n = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
    ic_f = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'
    ic_t = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>'
    dots = "".join(f'<button type="button" class="dot" data-i="{i}" aria-label="Ir ao slide {i+1}"></button>' for i in range(N))
    return (f'<div id="deck" class="deck" role="dialog" aria-modal="true" aria-label="Apresentação do Ecossistema Life B" hidden data-n="{N}">'
        f'<div class="stage" id="stage">{"".join(S)}</div>'
        f'<div class="dprog" aria-hidden="true"><i></i></div>'
        f'<div class="dctl" id="dctl"><button type="button" class="db" id="dPrev" aria-label="Slide anterior">{ic_p}</button>'
        f'<span class="dind" id="dInd" aria-live="polite">1 / {N}</span><button type="button" class="db" id="dNext" aria-label="Próximo slide">{ic_n}</button>'
        f'<span class="dsep"></span><button type="button" class="db" id="dTema" aria-label="Alternar tema claro e escuro">{ic_t}</button>'
        f'<button type="button" class="db" id="dFs" aria-label="Alternar tela cheia" aria-pressed="false">{ic_f}</button>'
        f'<button type="button" class="db" id="dExit" aria-label="Sair da apresentação (Esc)">{ic_x}</button></div>'
        f'<div class="ddots" aria-hidden="true">{dots}</div></div>')

if __name__ == "__main__":
    print(len(deck()))
