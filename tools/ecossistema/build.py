import sys,re
import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from gen import svg
D1=svg([
 [("lead","Lead","WhatsApp ou cadastro no site","n")],
 [("meta","WhatsApp (Meta)","Número da Ana, janela de 24 h e modelos aprovados","n")],
 [("ana","Ana, serviço próprio","Atende, qualifica e registra, na nuvem, 24 horas por dia","p")],
 [("cer","Cérebro","Regras + IA; texto padrão seguro se a IA falhar","p"),("hist","Histórico","Toda mensagem guardada para sempre","n")],
 [("bia","Bia (ponte)","Única porta para o Agendor e os avisos","m"),("voz","Voz","ElevenLabs; reserva na voz da Bia","n")],
 [("ag","Agendor","Fonte da verdade: negócio, notas e tarefas","g"),("wa","Avisos","Robert, Felipe e dono do negócio, com botão","n")],
],[("lead","meta",""),("meta","ana","mensagem"),("ana","cer",""),("ana","hist","grava"),("cer","bia","pede"),("cer","voz","áudio"),("bia","ag",""),("bia","wa","")],"a1")
D2=svg([
 [("a","Lead escreve","texto, áudio, foto, vídeo ou PDF","n")],
 [("b","Meta avisa a Ana","A mensagem é guardada no histórico antes de qualquer coisa","n")],
 [("c","Junta mensagens seguidas","Espera cerca de 1,5 s. Primeira resposta a um lead novo: 75 a 150 s, como uma pessoa","n")],
 [("d","Entende a mídia","Áudio vira texto; foto e PDF são lidos","n")],
 [("e","Cérebro decide o passo","Cumprimento, segmento, CNPJ, apresentação, dúvida, objeção ou repasse","p")],
 [("f","IA escreve a resposta","No estilo da Ana, com tudo o que já se sabe do lead","p")],
 [("g","Validador confere","Sem termos proibidos, com gancho, tamanho certo e sem repetir","m")],
 [("ok","Aprovou","segue","g"),("no","Reprovou","texto padrão seguro","x")],
 [("h","Envia balões ou áudio","Pausa curta entre balões; áudio se o lead mandou áudio","n")],
 [("i","Registra e confere","Histórico, entrega ✓✓, etapa e nota no Agendor, avisos pela Bia","g")],
],[("a","b",""),("b","c",""),("c","d",""),("d","e",""),("e","f",""),("f","g",""),("g","ok",""),("g","no",""),("ok","h",""),("no","h",""),("h","i","")],"a2")
D3=svg([
 [("a","Ana pede à Bia","Só pedidos fixos e autenticados; nunca fala direto com o Agendor","p")],
 [("b","Bia confere o pedido","Dados válidos, funil da Ana e sem negócio duplicado","m")],
 [("c1","Cria o lead","Negócio no funil da Ana, com pessoa e empresa","n"),("c2","Lê o contexto","Já é cliente? Tem negócio em outro funil?","n")],
 [("d1","Muda a etapa","Novo lead, Em conversa, Retorno combinado, Repassado...","n"),("d2","Grava nota e campos","Nota [Ana], sem sobrescrever o que já existe","n")],
 [("e1","Cria tarefa de retorno","Com a data combinada","n"),("e2","Passa ao time","SDR Inbound (GO e DF) ou Arena (fora)","n")],
 [("f","Camada única do Agendor","Fila com freio, limite de tempo e nova tentativa","p")],
 [("g","Agendor","Recebe a escrita","g")],
 [("h","Bia relê e confirma","Só responde 'feito' depois de ler o Agendor de novo","g")],
 [("i","Ana registra","Se falhou, guarda, tenta de novo e avisa o Robert","n")],
],[("a","b",""),("b","c1",""),("b","c2",""),("c1","d1",""),("c2","d2",""),("d1","e1",""),("d2","e2",""),("e1","f",""),("e2","f",""),("f","g",""),("g","h",""),("h","i","")],"a3")
D4=svg([
 [("a","Evento na conversa","Lead novo, pediu pessoa, qualificado, irritado, sem resposta...","n")],
 [("b","Regras da Ana","Já avisei este lead? Limite por hora? Silêncio da noite?","m")],
 [("c1","Noite e não urgente","Vai para o resumo das 8h e 18h","x"),("c2","Pode enviar","Pede o envio à Bia","p")],
 [("d","Regras da Bia","Destino permitido, sem repetir, no máximo 30 por hora","m")],
 [("e","Bia envia no WhatsApp","Com o botão Abrir conversa","p")],
 [("f","O envio saiu de verdade?","Só 'enviado' ou na fila de reenvio conta","p")],
 [("g1","Sim","Marca como avisado e registra","g"),("g2","Não","Erro: fica na fila durável por 24 h","x")],
 [("h","Vigia a cada 5 minutos","Reenvia até 5 por rodada e volta ao passo da Bia","n")],
],[("a","b",""),("b","c1","noite"),("b","c2","dia"),("c2","d",""),("d","e",""),("e","f",""),("f","g1","sim"),("f","g2","não"),("g2","h","")],"a4")
D5=svg([
 [("a","Backup automático diário","Se uma execução falha, a rotina tenta de novo sozinha até dar certo","p")],
 [("b1","Ana","Histórico completo, memória, código e documentos","n"),("b2","Bia","Memória, fluxos do n8n, documentos e configuração","n")],
 [("c1","Espelho dos documentos","Todo o projeto, sem vídeos e arquivos gigantes","n"),("c2","Backups de deploy","Um a cada publicação (os 60 mais recentes)","n")],
 [("d","Criptografia e teste de restauração","Abre o pacote de volta e confere tudo antes de dar OK","m")],
 [("e","Cópia na nuvem","Fora do ambiente de trabalho, protegida","g")],
 [("f","Falhou ou passou de 30 h?","A Bia avisa o Robert uma vez por dia","x")],
],[("a","b1",""),("a","b2",""),("b1","c1",""),("b2","c2",""),("c1","d",""),("c2","d",""),("d","e",""),("e","f","")],"a5")
def fig(s,label): return f'<div class="svgw v item" role="img" aria-label="{label}">{s}</div>'
H=f'''<section class="sec" id="ana">
<h2><span class="n">16</span>A Ana, a SDR virtual do WhatsApp</h2>
<p class="lead">A Ana é a SDR do inbound: conversa com o lead pelo número dela, a qualquer hora, e tem um objetivo só: <b>qualificar</b>. Ela se apresenta como "Ana, da equipe Life B", apresenta o projeto Mega Vision USA (exposição estratégica, categorizada e personalizada de produtos de alto giro, que trabalha como vendedor silencioso na loja), entende a loja e entrega o lead pronto ao especialista. Esta seção mostra como ela funciona por dentro: quem fala com quem, o caminho de cada mensagem, como ela conversa com o Agendor, como os avisos nunca se perdem e como tudo fica guardado na nuvem.</p>

<h3>Quem fala com quem</h3>
{fig(D1,"Mapa da Ana: o lead escreve no WhatsApp, a Meta entrega à Ana, o cérebro decide e consulta a Bia, que fala com o Agendor e manda os avisos; histórico guardado para sempre e voz por ElevenLabs")}
<p class="dica-svg">O desenho cabe na tela do celular.</p>
<div class="grid g3">
<div class="card item"><h4>Ana</h4><p>Serviço próprio na nuvem, no ar 24 horas por dia. Recebe a mensagem, decide, responde e registra.</p></div>
<div class="card item"><h4>Bia, a ponte</h4><p>A Ana nunca escreve direto no Agendor nem manda aviso por conta própria: pede à Bia, que aplica as regras da casa e confere o resultado.</p></div>
<div class="card item"><h4>Agendor, fonte da verdade</h4><p>Negócio, etapa, notas e tarefas. Se a conversa e o Agendor divergirem, vale o Agendor.</p></div>
</div>

<h3>O caminho de cada mensagem</h3>
{fig(D2,"Caminho de uma mensagem: guardada no histórico, junta mensagens, entende a mídia, o cérebro decide o passo, a IA escreve, o validador confere, envia e registra")}
<p class="dica-svg">Leia de cima para baixo.</p>
<details class="fx" open><summary>O que cada passo garante</summary><ul>
<li><b>Guardar primeiro:</b> a mensagem do lead entra no histórico antes de qualquer outra coisa, mesmo com a Ana parada. Nada se perde.</li>
<li><b>Juntar mensagens:</b> se o lead manda várias seguidas, a Ana espera cerca de 1,5 segundo e responde tudo de uma vez. Só a primeira resposta a um lead novo espera de 75 a 150 segundos, como uma pessoa faria; depois ela responde rápido.</li>
<li><b>Cumprimento primeiro:</b> quem só diz "bom dia" recebe o cumprimento de volta, com o nome, antes de qualquer explicação.</li>
<li><b>Validador:</b> a resposta só sai se não tiver termo proibido, se terminar com um gancho para o lead responder e se couber no tamanho. Se a IA falhar ou reprovar, entra um texto padrão seguro. A Ana nunca fica no vácuo.</li>
<li><b>Honestidade:</b> ela nunca diz que anotou, recebeu ou fez algo que não aconteceu. Se o CNPJ falado em áudio não fechar, ela repete o que entendeu e pergunta se está certo; se estiver errado, pede digitado ou a foto do Cartão CNPJ.</li>
<li><b>Voz:</b> responde em áudio quando o lead manda áudio ou pede. Cascata: voz da Ana, uma versão reserva e, por último, a voz da Bia. "CNPJ" é falado direto, números e siglas por extenso.</li>
</ul></details>

<h3>Da primeira mensagem ao repasse</h3>
<div class="flow item">
<div class="b"><b>1. Abre</b>Cumprimenta, diz que é a Ana, da equipe Life B, e descobre o nome e o que o lead vende.</div><div class="ar">→</div>
<div class="b"><b>2. Segmento e CNPJ</b>Usa o que já existe (Agendor, atividade da empresa, campanha) e só confirma. Drogaria e farmácia são o mesmo canal; supermercado é o canal alimentar. Se o CNPJ é de outro ramo, ela confere com o lead antes de seguir.</div><div class="ar">→</div>
<div class="b m"><b>3. Apresenta o projeto</b>Obrigatório antes de qualquer repasse. Explica o Mega Vision USA de forma estratégica e personalizada e usa exemplos de redes do segmento do lead, sem diminuir ninguém.</div><div class="ar">→</div>
<div class="b"><b>4. Qualifica com valor</b>Faturamento (faixa, aceita recusa), lojas, disposição para investir e quem decide, sempre entregando uma ideia de valor entre as perguntas.</div><div class="ar">→</div>
<div class="b g"><b>5. Passa ao especialista</b>Só no fim vem a condição de pagamento e, para outros segmentos, o pedido a partir de R$ 2 mil. Depois do repasse ela continua respondendo.</div>
</div>

<h3>Como a Ana conversa com o Agendor</h3>
{fig(D3,"Como a Ana conversa com o Agendor: pede à Bia, que confere, executa as ações (criar lead, ler contexto, mudar etapa, gravar nota, tarefa, repasse) pela camada única, e só confirma depois de reler")}
<p class="dica-svg">Cada caixa dupla são ações que acontecem em paralelo.</p>
<div class="grid g2">
<div class="card item"><h4>Sem negócio duplicado</h4><p>Antes de criar, a Bia procura o lead em todos os funis de vendas (Arena, SDR Inbound e Outbound, abertos, ganhos e perdidos). Se já existe, a Ana não cria outro: grava uma nota no negócio existente e avisa quem é o dono.</p></div>
<div class="card item"><h4>Nunca sobrescreve</h4><p>Campos que já têm valor no Agendor não são trocados. Cada escrita é conferida lendo de volta; a Ana só considera feito o que o Agendor confirmou.</p></div>
<div class="card item"><h4>O funil da Ana é o registro da conversa</h4><p>Novo lead, Em conversa, Retorno combinado, Repassado ao time comercial, Sem resposta e Encerrado. A etapa muda sozinha conforme a conversa.</p></div>
<div class="card item"><h4>Para onde vai o lead qualificado</h4><p>Em Goiás e Distrito Federal: SDR Inbound, com o Felipe como dono, e a página Hoje mostra "aguardando representante". Fora de GO e DF: Arena, com o Felipe como dono. A Ana nunca fala com os representantes.</p></div>
</div>
<div class="note item"><strong>Limite do Agendor</strong>O Agendor aceita poucas chamadas por segundo. Todas as chamadas da Ana passam pela mesma fila com freio da Bia (veja a seção "Como a Bia conversa com o Agendor"). Se o Agendor pedir calma, a escrita espera e tenta de novo, sem duplicar.</div>

<h3>Os portões: quem é o foco</h3>
<div class="grid g3">
<div class="card item"><span class="tag t-green">Foco</span><h4>Farmácia, drogaria e supermercado</h4><p>Atendimento completo e acolhedor, sem conversa de valor mínimo.</p></div>
<div class="card item"><span class="tag t-purple">Mais firme</span><h4>Outros segmentos e MEI</h4><p>Todos podem comprar, mas no fim a Ana avisa com educação que o pedido começa em R$ 2 mil e pergunta se o interesse é real.</p></div>
<div class="card item"><span class="tag t-gray">Empresa nova</span><h4>CNPJ com menos de 2 anos</h4><p>Deixa o lead ciente de que o fechamento é à vista ou no cartão, em até 3x sem juros ou 12x com juros. Não dispensa: passa ao Felipe decidir.</p></div>
<div class="card item"><span class="tag t-purple">Rede</span><h4>Quatro ou mais lojas</h4><p>Sem qualificar: repasse direto ao Felipe, com atenção humana.</p></div>
<div class="card item"><span class="tag t-gray">Só empresa</span><h4>Sem CNPJ não há qualificação</h4><p>A Ana explica com educação, continua tirando dúvidas e só repassa com o CNPJ.</p></div>
<div class="card item"><span class="tag t-green">Já é da casa</span><h4>Cliente ou lead de um representante</h4><p>Não requalifica: avisa Robert e Felipe, e o dono do negócio.</p></div>
</div>

<h3>Quando uma pessoa entra na conversa</h3>
<div class="flow item">
<div class="b"><b>Gatilhos</b>Lead pede uma pessoa, mídia ilegível, resposta bloqueada, dúvida fora da base, irritação ou insistência depois do repasse.</div><div class="ar">→</div>
<div class="b"><b>Equipe assume ou instrui</b>Pela Central, no mesmo número. Assumir faz a Ana se calar; instruir faz ela agir sem a equipe assumir.</div><div class="ar">→</div>
<div class="b g"><b>Devolve à Ana</b>Com um clique. Ela relê tudo, inclusive o que a equipe escreveu, e segue.</div>
</div>
<div class="grid g2">
<div class="card item"><h4>Instrução não é mensagem</h4><p>Há dois botões: "Só orientar" (a Ana guarda e usa na próxima resposta) e "Orientar e mandar agora" (ela age na hora). A instrução pode ser digitada ou gravada em áudio, e o lead nunca vê que ela existiu.</p></div>
<div class="card item"><h4>Ficha do lead na Central</h4><p>Mostra onde o lead está: etapa do funil, momento da conversa e cadência (por exemplo, "toque 2 de 5"), o progresso da qualificação (segmento, CNPJ, empresa, projeto apresentado, faturamento, quem decide), sinais, dúvidas e anotações.</p></div>
</div>

<h3>Quando o lead some: retornos e cadência</h3>
<div class="flow item">
<div class="b"><b>Retorno combinado</b>"Me chama amanhã às 10h": a Ana cria a tarefa e volta no horário, ajustado para 8h a 22h.</div><div class="ar">→</div>
<div class="b"><b>Cadência de 5 toques</b>2 h depois, 2º dia útil 9h, mais 3 úteis 15h, mais 5 úteis 10h e mais 8 úteis 14h. Retomada, exemplo, pergunta leve, valor e despedida educada.</div><div class="ar">→</div>
<div class="b g"><b>Sem resposta</b>Qualquer resposta do lead cancela o que falta. No fim, o lead fica em "Sem resposta" no Agendor.</div>
</div>
<div class="note item"><strong>Horários</strong>Quando o lead escreve, a Ana responde a qualquer hora e dia. Quando é ela que toma a iniciativa, só entre 8h e 22h (horário de Brasília), todos os dias. Fora da janela de 24 horas da Meta ela usa um modelo aprovado. Tudo cancela sozinho se o lead voltou, se a equipe assumiu ou se ela está pausada.</div>

<h3>Avisos pela Bia: a rede de segurança</h3>
{fig(D4,"Rede de segurança dos avisos: regras da Ana, regras da Bia, envio, conferência de que o envio saiu de verdade, fila durável e reenvio automático")}
<p class="dica-svg">Cada camada pega o que a anterior deixou escapar.</p>
<div class="grid g2">
<div class="card item"><h4>Quem recebe</h4><p>Robert e Felipe recebem lead novo, qualificado, pediu pessoa, irritado, rede, sem resposta, parou e retorno agendado, na hora, de dia, com o botão "Abrir conversa". O dono do negócio recebe quando o lead já é dele. Os representantes nunca recebem avisos da Ana.</p></div>
<div class="card item"><h4>Noite e urgência</h4><p>De 21h a 7h os avisos viram resumo (8h e 18h), menos os urgentes: falha da Ana, lead sem resposta há mais de 20 minutos e lead novo.</p></div>
<div class="card item"><h4>Só conta se saiu</h4><p>A Bia só responde "enviado" quando o WhatsApp realmente aceitou. Qualquer outro retorno vira erro e o aviso fica na fila para ser reenviado a cada 5 minutos, por 24 horas.</p></div>
<div class="card item"><h4>Rastro</h4><p>Cada tentativa vira registro no histórico. Hoje a falha de entrega da própria Meta ainda não gera um novo reenvio automático: é a próxima melhoria.</p></div>
</div>

<h3>Histórico, segurança e backup</h3>
{fig(D5,"Backup em nuvem: todo dia, a Ana e a Bia, o espelho dos documentos e os backups de cada publicação são copiados criptografados para a nuvem, com teste de restauração, repetição automática e alerta se falhar")}
<p class="dica-svg">O backup existe para recuperar tudo, mesmo se um equipamento for perdido.</p>
<div class="grid g2">
<div class="card item"><h4>Histórico para sempre</h4><p>Toda mensagem, nota e decisão fica num arquivo permanente que só cresce, com fila de segurança se o banco falhar e conferência de hora em hora.</p></div>
<div class="card item"><h4>Excluir conversa, só com controle</h4><p>Só o Robert e quem ele autorizar. Ocultar é reversível; excluir pede motivo, os 4 últimos dígitos do telefone e a senha, e vai para uma lixeira por 30 dias.</p></div>
<div class="card item"><h4>Backup na nuvem, com repetição</h4><p>Todo dia, com repetição automática se a execução falhar. Ana e Bia (memória, fluxos, documentos e configuração) e os backups de cada publicação vão criptografados para a nuvem, e cada pacote é aberto de volta para conferir que dá para restaurar. Se alguma parte ficar mais de 30 horas sem sucesso, a Bia avisa a gestão. A chave de criptografia fica guardada em cofre separado.</p></div>
<div class="card item"><h4>Aprendizado supervisionado</h4><p>Cada 👍 ou 👎 na Central vira exemplo. Uma análise diária propõe melhorias e nada muda sem a aprovação do Robert.</p></div>
</div>

<h3>O que a Ana nunca faz</h3>
<div class="note item"><strong>Limites claros</strong>Falar preço, desconto, bonificação ou resultado garantido (exceto o mínimo de R$ 2 mil para outros segmentos e a condição de pagamento de empresa nova). Citar nomes da equipe ou concorrentes. Dizer que é humana. Escrever por iniciativa própria fora de 8h a 22h. Falar com os representantes. Dizer que fez algo que não fez. Prometer ponto no caixa ou mexer na exposição que a loja já tem.</div>
<div class="note ok item"><strong>Parada de emergência</strong>Na Central, aba Agentes, o Robert desliga a Ana na hora e liga de novo quando quiser.</div>
</section>

<!-- 16 -->'''
import re as _re
def _dg(m):
    esq=m.group(1); dir_=m.group(2)
    dir_=_re.sub(r'<div class="grid g[23]">','<div class="stack">',dir_)
    return f'<div class="dg"><div class="dgs">{esq}</div><div class="dgt">{dir_}</div></div>'
H=_re.sub(r'(<div class="svgw v item".*?</svg></div>\n<p class="dica-svg">.*?</p>)\n(.*?)(?=\n\n<h3>|\n\n<!-- 16 -->)',_dg,H,flags=_re.S)
s=open(''+__import__('os').path.expanduser('~/Desktop/lifebimport-jlbv-pages/ecossistema/index.html')+'').read()
i=s.index('<section class="sec" id="ana">'); j=s.index('<!-- 16 -->',i)+len('<!-- 16 -->')
s=s[:i]+H+s[j:]
css='.svgw.v{max-width:460px;margin:0 auto}.svgw.v svg{min-width:0}\n.dg{display:grid;grid-template-columns:minmax(0,440px) minmax(0,1fr);gap:24px;align-items:start}.dgs{position:sticky;top:76px}.dg .svgw.v{max-width:none;margin:0}.dgt{min-width:0}.stack{display:flex;flex-direction:column;gap:14px}.stack>*{min-width:0}@media (max-width:900px){.dg{grid-template-columns:minmax(0,1fr);gap:14px}.dgs{position:static}.dg .svgw.v{max-width:460px;margin:0 auto}}\ndetails.fx,.fn-t,.fn-t b{min-width:0;overflow-wrap:anywhere}\n.tw td,.tw th,.fn-c summary,.fn-tz,.who{min-width:0;overflow-wrap:anywhere}.fn-t{max-width:100%}.fn-t .who{white-space:normal;max-width:100%}.tw table,.tw tbody,.tw tr{min-width:0;max-width:100%}\n'
import re as _r2
s=_r2.sub(r'\.svgw\.v\{max-width:460px.*?\n(?=\.dica-svg\{display:none\})','',s,flags=_r2.S)
s=s.replace('.dica-svg{display:none}',css+'.dica-svg{display:none}',1)
open(''+__import__('os').path.expanduser('~/Desktop/lifebimport-jlbv-pages/ecossistema/index.html')+'','w').write(s)
print('ok',len(s))
