# Integração das 5 branches de páginas (19/11/2026) — NADA publicado

Base: origin/gh-pages 70df1546 (Hoje 17.6B no ar). Branch de integração: `paginas-integracao` (worktree /tmp/pg_integ).
Ordem (merge --no-ff): D painel-rep-refino c92403e4, E dash-ana ead58ccc, B playbook-pagina bf7bb734, C ecossistema-cards de9f1054 (HEAD no momento da mescla; havia mudança NÃO commitada em tools/ecossistema/conteudo3.py no worktree /tmp/pg_eco, que ficou de fora), A central-hub-visual cf50f4be.

## Arquivos tocados por branch (git diff --name-only origin/gh-pages <branch>)
- D: rep/dash/<10 reps>/index.html, source/ (molde, resync, PUBLICAR, tests-rep)
- E: dash/geral/{agentes.js,index.html,telao/index.html,telao/tests/*}
- B: playbook/index.html (único arquivo)
- C: ecossistema/index.html, tests/ecossistema/*, tools/ecossistema/*
- A: central/{cards.json,index.html,instagram_semente.json,docs,tests}, tools/ecossistema/{conteudo2.py,estado.json,slides_conteudo.py}; o diff cru também lista hoje/felipe/index.html, mas isso é só porque A nasceu de gh-pages 667dc4b3 (mais velho): A não tem nenhum commit que toque esse arquivo, e a mescla não o altera (prova abaixo).

## Sobreposição de arquivos entre branches
Só C x A: tools/ecossistema/conteudo2.py, slides_conteudo.py, estado.json. Nenhuma outra. (Links entre páginas não são arquivos em comum: ver PUBLICAR-PAGINAS.md.)

## Conflitos e resolução
- conteudo2.py (módulo 5 "Time e permissões") e slides_conteudo.py (mod 5): C dizia "Tela nova de Usuários... em construção, NÃO no ar"; A dizia "Aba Usuários (só Robert): criar, redefinir senha...". Resolvido ficando com o texto de A (a aba Usuários vai junto na mesma publicação) — se a Central NÃO for publicada junto, reverter esse texto antes de publicar o Ecossistema (regra do Ecossistema: só "no ar" o que está no ar).
- estado.json: mesclou sozinho (A acrescentou 2 itens em "implantacao", ambos "ainda NÃO no ar").
- ecossistema/index.html (gerado) ficou velho após a mescla; regenerado com `python3 tools/ecossistema/montar.py` (commit separado). 
- Armadilha evitada: montar.py/py_compile apagou o `tools/ecossistema/__pycache__/gen.cpython-311.pyc` que está versionado em gh-pages; restaurado (nenhum arquivo apagado no diff final).

## Prova de que nada reverte
`git diff --stat origin/gh-pages HEAD -- hoje/felipe/index.html` = 0 linhas. `git diff --name-status origin/gh-pages HEAD`: 0 apagados (D), 0 renomeados; só A (novos) e M.

## Correção feita na integração (commit próprio)
Após a mescla o teste `tests/ecossistema/estatico.mjs` falhou (41/1): o texto vindo da Central trazia nomes de pessoas ("só Robert", "Hoje do Felipe"), proibidos no HTML do Ecossistema. Trocado por "só o dono" e "Hoje do SDR" em conteudo2.py, slides_conteudo.py, estado.json; página regenerada; 42/0.

## Pendência achada (NÃO corrigida aqui: é da branch A)
`central/tests/sem_artefatos.cjs` falha 1 (a palavra "artefato" em central/index.html, na regra de links do hub: "Nunca endereço de artefato de trabalho"). Falha igual em /tmp/pg_hub isolado; no gh-pages atual passa (4/0). Regressão da branch A.
