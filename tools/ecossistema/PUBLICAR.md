# Publicar a revisão do Ecossistema de 20/11/2026 (versão 2026-11-20.1)

Branch: `ecossistema-20nov` (repositório de páginas, a partir de `origin/gh-pages` = 5bc673ce). NADA foi publicado nem escrito no Agendor ou no KV; os valores "ao vivo" abaixo foram só LIDOS em 20/11/2026.

## O que mudou
1. Arte: `tools/ecossistema/fluxo.py` (cotovelos das setas em camadas, faixas laterais aninhadas, rótulo sempre colado à própria seta e longe das outras, sem "sumir em silêncio" no celular). Corrige o bug "qualifica em cima de perdido" nas cadências Outbound e Inbound (o rótulo "qualifica" caía sobre a seta de Perdido) e os rótulos soltos do celular (jornada, funis, mensagem).
2. CSS: selo longo em texto corrido passa a quebrar linha (no celular passava de 1.200 px e era cortado).
3. Regras conferidas contra o código e os documentos (REGRAS-VIGENTES, REVISAO-FUNIL-ANA-20nov): jornada com Repasse da Ana, ao lead "especialista", repasse blindado, lead do closer com controle completo (Hoje 17.8), Reativação só com Serasa, Hoje 2026-11-20.1, Central versão final, Playbook, origem do Dash, feriados, vigia do repasse em modo SIMULAR.
4. Estado e versões (estado.json, versoes.json, dados_status.py, slides) em 20/11/2026.
5. Teste novo `tests/ecossistema/fluxos.mjs` (mede colisões no Chromium) e `tests/ecossistema/mutacao_fluxos.sh` (6 mutantes, todas mortas); `publicar.sh` ganhou o passo 2b.

## Ordem de publicação (só com liberação do dono; nada disto foi executado)
1. `git -C /tmp/eco_pg fetch origin gh-pages` e conferir que `origin/gh-pages` ainda é 5bc673ce ou descendente (se avançou, `git rebase origin/gh-pages` e remontar).
2. `python3 tools/ecossistema/montar.py` e `cmp` com `ecossistema/index.html` (o publicar.sh já faz isso).
3. Segurar a trava do Chromium e rodar UM teste por vez, com `TZ=UTC JSDOM_DIR=<pasta com jsdom>`: `estatico.mjs`, `etapas.mjs` (ECO_ETAPAS_AO_VIVO=1 relê o Agendor, só GET), `visual.mjs` (agora com 320 px), `fluxos.mjs` (320, 390, 768, 1440; caixa sem seta), `interacao.mjs`, `iframe.mjs`, `apresentacao.mjs`, `pos_deploy.test.sh`, depois `bash tests/ecossistema/mutacao_fluxos.sh`.
4. Auditor independente + auditoria visual dos prints (`/tmp/ecossistema_prints`), depois `ECO_AUDITOR_OK=sim tools/ecossistema/publicar.sh "Ecossistema 2026-11-20.1: revisão de arte e regras"` (dois commits, um push `HEAD:gh-pages` sem force; trava de caminhos: só `ecossistema/`, `tools/ecossistema/`, `tests/ecossistema/`).
5. Fumaça no ar: abrir https://projetojlbv.com.br/ecossistema/ (versão 2026-11-20.1 no topo e "Atualizado em 20/11/2026"), os fluxos "Do lead novo ao destino final" e "Cadência do SDR Outbound" em 390 e 1440 px, e o modo Apresentar. A aba Ecossistema da Central carrega a mesma página (iframe).
6. Depois: `node tools/ecossistema/conferir_estado.mjs` (avisa se algum deploy novo deixou o Ecossistema para trás) e atualizar `versoes.json` com `atualizar_versao.py ecossistema 2026-11-20.1 "<data>"` se a hora da publicação for registrada.

## Rollback
`git checkout 5bc673ce -- ecossistema/ tools/ecossistema tests/ecossistema`, commitar e publicar de novo (versão 2026-11-19.1). A página é estática: voltar o arquivo `ecossistema/index.html` basta para o site; os testes e a fonte voltam junto.

## Lido ao vivo em 20/11/2026 (somente leitura, ~03h50 BRT)
Bia 3cfccc9b (20/11 03h19), Ana 64ab8c96 (20/11 03h34); chaves: modo do vigia do repasse e fechamento da Ana no repasse ausentes (vigia SIMULAR, Ana aberta); destino do qualificado = etapa_ana; trava de identidade ligada; trava de notificações ligada; trava de CRM de um representante desligada (0). Hoje (hoje/felipe) e Central ao vivo são byte a byte iguais ao repositório e a página Hoje traz 2026-11-20.1.

## O que NÃO foi verificado
Dash "sync só do que mudou" (só vi o registro de origem fixa e o cartão de conferência no código da página); funcionamento real do vigia do repasse (está em simulação); página Central e Hoje em uso real por usuários; slides do celular em pé além do teste automático; prints de claro/escuro de TODOS os 15 desenhos foram conferidos só para os que mudaram ou estavam suspeitos (ver relatório).

## Atualização de 20/11/2026 (correções do auditor)
Etapas reais do funil da Ana e do SDR (fixture `tests/ecossistema/etapas_agendor.json`, lido ao vivo); versões das fichas geradas de `versoes.json` (`pecas.py`); datas vencidas como 'prevista' removidas e testadas; feriados móveis citados; Central estreita com setas; 320 px sem rolagem lateral; `tests/ecossistema/auditoria_largura.cjs` (movido de tests/ecossistema_auditoria.cjs, que a trava de caminhos do publicar.sh barrava) agora falha se medir nada (antes media outro servidor na porta 8803 e dava 0 em branco; use `ECO_URL`). Mutação: 10 de 10 mortas.

## Reauditoria (20/11/2026)
`versoes_ao_vivo.mjs` lê `wrangler deployments list` (gs-agendor-worker, lifeb-agente-sdr, lifeb-canal, bia-dash-sync, lifeb-rep-painel) e atualiza `versoes.json` com `--aplicar`; `conferir_estado.mjs` também compara as versões ao vivo. O `publicar.sh` agora roda `etapas.mjs` com leitura ao vivo do Agendor e aborta se `versoes.json` estiver defasado. Rodar `node tools/ecossistema/versoes_ao_vivo.mjs --aplicar` e remontar imediatamente antes de publicar (a Ana e a Bia podem ter novo deploy).
