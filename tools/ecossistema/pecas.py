"""19/11/2026: estado por peça em CARDS (nome, selo, versão, data, 2 a 4 tópicos curtos) e figura simples dos papéis e das entradas.
Os tópicos são resumos escritos a partir dos itens de estado.json (nada novo); o texto completo de cada item fica na linha do tempo recolhível."""
import json, os
from comp import e, pill, selo, curto, n_palavras
AQUI = os.path.dirname(os.path.abspath(__file__))
EST = json.load(open(os.path.join(AQUI, "estado.json"), encoding="utf-8"))
COMP = {c["id"]: c for c in EST["componentes"]}
# ordem por área e tópicos curtos (resumo dos itens "no_ar" de estado.json)
AREAS = [
  ("Atendimento", ["ana"]), ("SDR e Hoje", ["hoje"]), ("Central", ["central"]), ("Agentes", ["bia"]), ("Números e CRM", ["dash", "agendor"]),
]
TOPICOS = {
  "ana": ["Atende lojistas do inbound no WhatsApp", "Qualifica e repassa ao SDR", "Retoma quem some; encerra fora do perfil com educação", "Responde áudio com áudio"],
  "bia": ["Avisa a equipe no WhatsApp, muitos com botão", "Escreve no Agendor e relê para confirmar", "Motores proativos e painel do representante", "Repasse manual e nota de handoff"],
  "hoje": ["Mesa do SDR sem travas de horário", "Fila por listas; atrasadas lidas aos poucos", "Qualificação cria o negócio no funil certo", "Servidor traz lead novo em até 30 s"],
  "central": ["Atendimento: conversas com selos, histórico e áudios", "Assumir, devolver, repassar, pausar, instruir", "Controles da Bia com desfazer, filas, folga e custo", "Selo da janela de 24 h e filtros"],
  "dash": ["Vendas, SDR, anúncios e agentes", "Faixa vermelha quando os dados congelam", "Rosca sem corte"],
  "agendor": ["Funis: Ana, SDR Inbound e Arena", "A Ana ganha ao qualificar", "O Arena só nasce quando o SDR qualifica pela página Hoje"],
}
VERSAO = {"ana": "pacote de 17/11/2026", "bia": "atualização de 17/11/2026", "hoje": "página 2026-11-17.5", "central": "publicada em 17/11/2026", "dash": "página de 17/11/2026", "agendor": "sem versão própria"}

def palavras(x, n):
    for pref in ("Em voo: ", "Em correção: "):
        if x.startswith(pref): x = x[len(pref):]
    w = x.split()
    return " ".join(w[:n]).rstrip(",.:;") + ("…" if len(w) > n else "")

def peca(c, deck=False, area=None):
    i = c["id"]; nome = c["nome"]
    tops = "".join(f"<li>{e(t)}</li>" for t in TOPICOS[i])
    extra = ""
    for k, rot, cl in (("implantacao", "Em implantação", "te"), ("planejado", "Planejado", "pl")):
        if c[k]:
            extra += f'<div class="pc-x"><span class="pill p-{cl}">{rot}</span><ul>' + "".join(f"<li>{e(palavras(x, 12))}</li>" for x in c[k][:3]) + "</ul></div>"
    PK = {"no_ar": ("ok", "No ar"), "implantacao": ("te", "Em implantação"), "planejado": ("pl", "Planejado")}
    linha = "".join(f'<li class="full"><span class="pill p-{PK[k][0]}">{PK[k][1]}</span> {selo(x, deck)}</li>' for k in ("no_ar", "implantacao", "planejado") for x in c[k])
    tl = f'<details class="mais pc-tl"><summary><span>Histórico de versões (linha do tempo)</span></summary><ol class="tl">{linha}</ol></details>'
    kick = f'<span class="peca-k">{e(area)}</span>' if area else ""
    return (f'<div class="peca">{kick}<div class="peca-h"><b>{nome}</b>{pill("ok" if c["estado"] == "no ar" else "te")}</div>'
            f'<p class="peca-m">{e(c["papel"])} · versão: {e(VERSAO[i])} · {c["data"]}</p><ul class="peca-t">{tops}</ul>{extra}{tl}</div>')

def extras():
    return [
      ("Painel do Representante (nova recarga)", "ok", "Painel no ar; o pacote novo (recarga em horário comercial) aguarda auditoria", "09/11/2026"),
      ("Este Ecossistema", "te", "Atualizado, com apresentação em slides; publica depois do teste visual e do auditor", "19/11/2026"),
      ("Plataforma", "pl", "Mineração de leads; arquivar modelos antigos da Meta; revisão das cadências com dados reais", "[A CONFIRMAR]"),
    ]

def peca_extra(n, k, t, d):
    return (f'<div class="peca"><div class="peca-h"><b>{n}</b>{pill(k)}</div><p class="peca-m">{d}</p><ul class="peca-t"><li>{e(t)}</li></ul></div>')

def figura_papeis():
    """Os 3 papéis e os 4 jeitos de entrada (fonte: pedido do dono em 19/11/2026 e seções Ana/Outbound desta página)."""
    ent = [("Anúncio", "ana"), ("Site (formulário)", "ana"), ("WhatsApp direto", "ana"), ("Lista (planilha)", "sdr")]
    ch = lambda t, k: f'<div class="fp-e fp-{k}">{t}</div>'
    return ('<figure class="fp" role="group" aria-label="Quatro jeitos de entrada e os três papéis: Ana, SDR humano e representante"><div class="fp-g">'
      '<div class="fp-c"><h4>4 jeitos de entrada</h4>' + "".join(ch(t, k) for t, k in ent) + '</div>'
      '<div class="fp-a" aria-hidden="true">→</div>'
      '<div class="fp-c"><h4>Quem atende</h4>'
      '<div class="fp-r fp-ana"><b>Ana</b><span>SDR IA do inbound: anúncio, site e WhatsApp direto</span></div>'
      '<div class="fp-r fp-sdr"><b>SDR (humano)</b><span>Lista (outbound) e continua o que a Ana qualifica ou repassa</span></div></div>'
      '<div class="fp-a" aria-hidden="true">→</div>'
      '<div class="fp-c"><h4>Quem fecha</h4><div class="fp-r fp-rep"><b>Representante (closer)</b><span>Vendedor de campo: atende a carteira e fecha a venda</span></div></div>'
      '</div><figcaption class="sr">Anúncio, site e WhatsApp direto entram pela Ana. Lista entra pelo SDR humano. O SDR continua o que a Ana qualifica ou repassa. O representante, que é o closer, fecha a venda.</figcaption></figure>')

CSS = '''
.peca{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px;min-width:0;box-shadow:var(--shadow)}
.peca-h .pill{white-space:nowrap;flex:none}
.peca-h{display:flex;align-items:center;justify-content:space-between;gap:8px}.peca-h b{font-size:19px;color:var(--purple-d)}
.peca-k{display:block;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);font-weight:800;margin-bottom:2px}
.peca-m{margin:2px 0 8px;font-size:13.5px;color:var(--muted)}
.peca-t{margin:0 0 6px;padding-left:1.1em}.peca-t li{margin:3px 0}
.pc-x{margin:6px 0;font-size:14px}.pc-x ul{margin:4px 0 0;padding-left:1.1em}
.tl{margin:6px 0 2px;padding-left:1.2em;font-size:14px;color:var(--muted)}.tl li{margin:4px 0}
.areas h3{margin:22px 0 8px}
.fp{margin:14px 0}.fp-g{display:grid;grid-template-columns:1fr auto 1.3fr auto 1fr;gap:10px;align-items:stretch}
.fp-c{display:flex;flex-direction:column;gap:8px}.fp-c h4{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);margin:0}
.fp-a{align-self:center;font-size:28px;color:var(--mag);font-weight:800}
.fp-e,.fp-r{border:1.5px solid var(--line);border-radius:12px;padding:10px 12px;background:var(--card);font-weight:700}
.fp-r b{display:block;font-size:17px;color:var(--purple-d)}.fp-r span{font-size:14px;color:var(--muted);font-weight:500}
.fp-ana{border-color:var(--purple)}.fp-sdr{border-color:var(--mag)}.fp-rep{border-color:var(--green-l)}
@media (max-width:820px){.fp-g{grid-template-columns:1fr}.fp-a{transform:rotate(90deg);justify-self:center}}
'''
