// 19/11 (Robert #3636 'tudo deve estar na Central'): a aba Playbook comercial da Central.
// Rodar: TZ=UTC JSDOM_DIR=/private/tmp/jsd node central/tests/aba_playbook.cjs
const B = require("./_base.cjs"); const fs = require("fs"); const path = require("path");
const T = B.suite("aba_playbook"); const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
// 1) estático: a aba existe, com hash próprio, nos 3 papéis padrão, e o iframe aponta para /playbook/ (domínio nosso, nunca artefato)
T.ok(/\['playbook','Playbook comercial'/.test(html), "A1 aba 'Playbook comercial' declarada em ABAS");
T.ok(/playbook:'playbook'/.test(html), "A2 hash #playbook mapeado");
for (const papel of ["robert", "admin", "sdr"]) { const m = html.match(new RegExp(papel + ":\\[([^\\]]*)\\]")); T.ok(m && /'playbook'/.test(m[1]), `A3 papel ${papel} vê a aba playbook`); }
T.ok(/var PB=\{f:null,box:null,src:'\/playbook\/'\}/.test(html), "A4 o iframe aponta para /playbook/ (domínio do projeto)");
T.ok(!/claude\.ai\/artifact/.test(html.match(/var PB=[\s\S]{0,900}/)[0]), "A5 nenhum link de artefato na aba");
T.ok(/telaPlaybook/.test(html) && /playbook:telaPlaybook/.test(html), "A6 despachante de telas inclui a aba");
T.ok(/body\.aba-playbook \.top/.test(html) && /body\.aba-playbook \.frame/.test(html), "A7 faixa de cima escondida e quadro com a altura toda, como o Ecossistema");
T.ok(/pbMostrar\(S\.aba==='playbook'\)/.test(html), "A8 o iframe é guardado e só escondido ao trocar de aba (não recarrega)");
T.fim();
