# Regra de projeto: o Ecossistema acompanha toda entrega (Robert, 09/11 e 14/11/2026)
O Ecossistema (projetojlbv.com.br/ecossistema/) é o coração do projeto: mostra como tudo se conecta. Toda mudança de processo, regra, blindagem, automação, status ou versão de sistema entra nele, no mesmo dia, para celular e desktop.
1. Fonte: `tools/ecossistema/` (conteudo1..3.py, diagramas.py, dados_status.py, versoes.json). Montar: `python3 tools/ecossistema/montar.py`. Nunca editar o HTML gerado à mão.
2. Mudou regra: varrer todos os lugares (código, mensagens, Hoje, Central, Ecossistema, docs) e atualizar texto + fluxograma + checklist.
3. Deploy de qualquer sistema: `python3 tools/ecossistema/atualizar_versao.py <sistema> <versão> "<data>" varredura=.. testes=.. auditor=.. fumaca=.. rollback=..`.
4. Subir `VERSAO` e acrescentar a linha em `HISTORICO.md` e na seção de versões.
5. Sem nomes de pessoas, telefones, chaves ou dados de lead (o teste `tests/ecossistema/estatico.mjs` varre isso).
6. Publicar só com `tools/ecossistema/publicar.sh "mensagem"` (testes, auditor e auditoria visual antes).
7. A fonte (tools/ecossistema e tests/ecossistema) é versionada: o publicar.sh faz um commit só desses caminhos (sem __pycache__) antes do commit da página, com as mesmas travas (índice não vazio, sem apagar, só caminhos permitidos, contagem de arquivos não cai) e um único push.
8. Fatos de versão: ler do real (wrangler deployments list --name <worker>, git log da página, PAGINA_VERSAO), nunca de memória; o que não der para ler fica "a registrar".
