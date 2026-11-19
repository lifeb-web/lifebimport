// Fixture do Painel do Representante: leads no formato REAL de GET /leads (campos de _montarUmLead).
// Telefones fictícios (últimos 4 dígitos). Datas relativas ao "agora" para os testes não envelhecerem.
const pad = n => String(n).padStart(2, '0');
function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function dia(offsetDias, hh = '09:00') { return new Date(Date.now() + offsetDias * 86400000 - 3 * 3600000).toISOString().slice(0, 10) + 'T' + hh + ':00'; }   // dia no fuso de Brasília, independente do fuso da máquina
function lead(id, o = {}) {
  return Object.assign({
    dealId: id, incompleto: false, titulo: 'Drogaria ' + id, valor: 0, valorPotencial: 0, funil: 'GM + Arena', funilTag: null,
    segmento: 'Drogaria', superagos: false, etapa: 'Conexão', bucket: 'aguardando', semTarefa: true, tarefaAberta: null, sdrResponsavel: null,
    obsSdr: '', obsRep: '', atualizadoEm: new Date(Date.now() - 2 * 86400000).toISOString(), entradaEm: new Date(Date.now() - 20 * 86400000).toISOString(),
    link: 'https://web.agendor.com.br/x/' + id, empresa: 'Drogaria ' + id, nome: 'Contato ' + id, cidade: 'Goiânia', estado: 'GO', endereco: 'Rua 1', cep: '74000000', cnpj: '', telefone: '62999990000',
    tipoNegocio: 'venda', jaComprou: false,
  }, o);
}
function tarefa(id, tipo, offsetDias, texto) { return { id, texto: texto || 'Ligar para confirmar', dueDate: dia(offsetDias), tipo }; }
function carteira() {
  return [
    lead(101, { empresa: 'Drogaria Central', titulo: 'Drogaria Central', valorPotencial: 8000, valor: 8000, bucket: 'aguardando', tarefaAberta: tarefa(9001, 'LIGACAO', -3) }),
    lead(102, { empresa: 'Farma Vida', titulo: 'Farma Vida — Reposição #2', funil: 'Pós-venda', funilTag: 'reposicao', tipoNegocio: 'reposicao', valorPotencial: 5200, valor: 5200, bucket: 'contato', semTarefa: false, tarefaAberta: tarefa(9002, 'WHATSAPP', 0) }),
    lead(103, { empresa: 'Supermercado Bom Preço', titulo: 'Supermercado Bom Preço', segmento: 'Supermercado', valorPotencial: 30000, valor: 30000, bucket: 'negociacao', etapa: 'Negociação', semTarefa: false, tarefaAberta: tarefa(9003, 'VISITA', 2) }),
    lead(104, { empresa: 'Drogaria Sol', titulo: 'Drogaria Sol — Reativação 75+', funil: 'Reativação 75+', funilTag: 'reativacao75', tipoNegocio: 'reativacao', bucket: 'aguardando' }),
    lead(105, { empresa: 'Farmácia Nova Era', titulo: 'Farmácia Nova Era', jaComprou: true, valorPotencial: 1500, valor: 1500, bucket: 'contato', semTarefa: false, tarefaAberta: tarefa(9005, 'LIGACAO', 1) }),
  ];
}
module.exports = { lead, tarefa, dia, ymd, carteira };
