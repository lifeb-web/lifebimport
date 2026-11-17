# Atualizar o Ecossistema a cada deploy (passo a passo curto)
O Ecossistema é uma APRESENTAÇÃO de como tudo funciona. Ele só pode dizer "no ar" do que foi conferido em produção. Sem nomes de pessoas (use papéis: time comercial, SDR, representantes, diretoria).

## Onde editar (1 lugar por tipo de mudança)
| Mudou... | Edite | Efeito |
|---|---|---|
| Estado de um componente (no ar, em implantação, planejado) e a data | `tools/ecossistema/estado.json` (campos `no_ar`, `implantacao`, `planejado`, `estado`, `data`; e `atualizado_em` no topo) | Os slides (selos, slide "No ar e o que vem", capa), o "Atualizado em dd/mm/aaaa" da página e o rodapé |
| Versão, data e verificações de um deploy | `tools/ecossistema/pos_deploy.sh <sistema> <versão> "<data>" varredura=.. testes=.. auditor=.. fumaca=.. rollback=..` | `versoes.json`, seção "Versões", marcador PENDENTE |
| Regra, texto ou fluxo | `conteudo1.py`, `conteudo2.py`, `conteudo3.py`, `diagramas.py` (fluxogramas), `dados_status.py` (checklist) | Seções e fluxogramas da página longa |
| Texto dos slides | `tools/ecossistema/slides_conteudo.py` (cada slide tem `sec=` com as seções da página que cobre) | Modo apresentação |
| Fluxogramas dos slides | `tools/ecossistema/slides_fluxos.py` (partes dos desenhos de `diagramas.py`; mudou o desenho da página, revise as partes) | Modo apresentação |
| Visual e comportamento dos slides | `deck.css`, `deck.js` (ajuste de texto, índice G) | Modo apresentação |
Nunca editar `ecossistema/index.html` à mão: ele é gerado por `python3 tools/ecossistema/montar.py`.

## O que revisar a cada deploy
1. **Ana** (agente-sdr): mudou regra de conversa, cadência, voz, fora do perfil, repasse? Atualize `estado.json` (ana), `dados_status.py`, seções Ana, Funis e Cadência, e o fluxograma `jornada`/`msg`.
2. **Bia**: avisos, motores proativos, trava de folga, camada do Agendor, painel do representante? `estado.json` (bia), seção Bia/Automações, fluxograma `avisos`/`escrita`/`camada`.
3. **Central**: botões, selos do CRM, interruptores, atendimento? `estado.json` (central), seção Central, fluxograma `central`.
4. **Hoje**: fila, travas de horário, tarefas atrasadas, qualificação? `estado.json` (hoje), seção Hoje, fluxograma `hoje`.
5. **Dash / Agendor / funis**: `estado.json` (dash, agendor), seção Funis e CRM, fluxogramas `funis` e `dash`.
6. Mudou REGRA: varrer todos os lugares (conteudo*.py, diagramas.py, slides.py, dados_status.py, estado.json) e conferir contra o código real. Planejado nunca vira "no ar" sem prova; pacote pronto e não publicado é "em implantação".
7. Subir `VERSAO` em `conteudo3.py` e acrescentar a linha no histórico (`HISTORICO.md` e tabela da seção Sobre).

## Testes (um por vez; o Mac é lento)
```
cd <raiz do repositório de páginas>; export TZ=UTC
python3 tools/ecossistema/montar.py
node tests/ecossistema/estatico.mjs      # estrutura, nomes proibidos, segredos, estado.json, deck no jsdom
node tests/ecossistema/visual.mjs        # 5 larguras, claro e escuro, fluxogramas legíveis
node tests/ecossistema/interacao.mjs     # menu, hash, posição ao atualizar
node tests/ecossistema/apresentacao.mjs  # slides: sem rolagem em CADA slide nas 6 telas, tamanho mínimo de texto, cobertura de todas as seções, índice (G), setas, toque, tema, Esc (use ECO_TAM=1920 para uma tela só)
bash tests/ecossistema/pos_deploy.test.sh
```
Todos precisam terminar com `0 falhou`. Publicar só com `tools/ecossistema/publicar.sh "mensagem"` (roda os testes, pede a liberação do auditor independente e faz um único push).

## Último passo de todo deploy: conferir se o Ecossistema ficou para trás
```
node tools/ecossistema/conferir_estado.mjs     # somente leitura; opcional: caminho do repositório da Bia
```
Lê os commits `deploy:` de origin/main (repositório gs-agendor-worker) e a data de `estado.json` e avisa "Ecossistema pode estar desatualizado" se Ana, Bia, Hoje ou Central tiveram deploy depois dessa data. Se avisar: revise `estado.json` (o estado e a data valem para a página longa e para a apresentação ao mesmo tempo), rode os testes e publique.

## Uma fonte só (página e apresentação)
- Estado por componente e data: `estado.json` (a seção Status da página e o slide de estado leem o mesmo arquivo).
- O teste `estatico.mjs` falha se um componente do `estado.json` não aparece na apresentação ou na página, se algum item de estado diverge entre os dois, ou se "atualizado em" difere entre a capa da página, o rodapé, a capa da apresentação e o `estado.json`.
- Textos que falam do mesmo assunto (por exemplo a Central) existem na página longa (`conteudo*.py`) e nos slides (`slides_conteudo.py`): ao mudar um, revise o outro. O teste de terminologia e o de papéis (a IA não vende) varrem os dois.
- Testes com Chromium: use a trava global `until mkdir /tmp/chromium.lock 2>/dev/null; do sleep 20; done` antes e `rmdir /tmp/chromium.lock` depois; um teste por vez.
