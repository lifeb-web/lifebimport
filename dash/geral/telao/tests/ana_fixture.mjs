// Fixture SINTETICA da Ana (sem dado real) para os testes offline da aba SDR (agente Ana) e da aba Agentes (Ana).
// Relogio fixo dos testes: 20/11/2026 12:00 BRT. A rota /ana-painel tem 60 dias; contadores novos so desde 11/11.
export const HOJE = '2026-11-20';
export const AGORA_ISO = '2026-11-20T15:00:00Z';
export const NOVOS_DESDE = '2026-11-11';
const add = (iso, n) => new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10) + n)).toISOString().slice(0, 10);
const MOD = ['claude-sonnet', 'claude-haiku', 'openrouter-reserva'];

export function makeAna(opts = {}) {
  const dias = [], serie = [];
  for (let i = 0; i < 60; i++) {
    const dia = add(HOJE, i - 59), d = { dia };
    const semDado = i < 5;                    // primeiros dias da janela sem registro (so {dia})
    if (!semDado) {
      const turnos = 20 + (i % 6), padrao = 1 + (i % 3 === 0 ? 1 : 0);
      Object.assign(d, { turnos, turnos_ia: turnos - padrao - 1, turnos_padrao: padrao, mensagens: turnos * 2, tts_caracteres: i % 4 === 0 ? 800 : 0 });
      if (i % 4 === 0) d.qualificados = 1 + (i % 8 === 0 ? 1 : 0);
      if (i % 7 === 0) d.alerta_humano = 1;
      MOD.forEach((m, k) => {
        if (m === 'openrouter-reserva' && i % 11 !== 0) return;
        d['ia_in_' + m] = 1000 * (i % 9 + 1) * (k + 1); d['ia_out_' + m] = 300 * (i % 5 + 1) * (k + 1);
        d['ia_cacheR_' + m] = m === 'openrouter-reserva' ? 0 : 4000 * (i % 7 + 1); d['ia_chamadas_' + m] = 3 + (i % 4);
      });
      if (dia >= NOVOS_DESDE) {
        const assumiu = i % 5 === 0 ? 1 : 0, pediram = i % 4 === 1 ? 1 : 0, redes = i % 2, esc = 1 + (i % 2);
        d.leads_novos = 2 + (i % 3);
        if (i % 3 === 0) d.descartados = 1;
        if (assumiu) d.assumiu = assumiu; if (assumiu && i % 2 === 0) d.devolveu = 1; if (i % 6 === 2) d.pausou = 1;
        if (pediram) d.pediram_humano = pediram;
        if (assumiu + pediram) d.intervencoes = assumiu + pediram;
        d.escalados = esc; if (redes) d.redes = redes;
        if (i % 6 === 0) d.pararam = 1;
      }
    }
    dias.push(d);
    const s = { dia, total: 0, porModelo: {}, tts: { caracteres: 0, usd: 0 }, leads: d.leads_novos || 0, qualificados: d.qualificados || 0, turnos: d.turnos || 0 };
    if (!semDado) {
      const so = +(0.2 + (i % 7) * 0.05).toFixed(4), ha = +(0.03 + (i % 5) * 0.01).toFixed(4), re = i % 11 === 0 ? 0.01 : 0, tt = i % 4 === 0 ? 0.02 : 0;
      s.porModelo = { 'claude-sonnet': so, 'claude-haiku': ha }; if (re) s.porModelo['openrouter-reserva'] = re;
      s.tts = { caracteres: i % 4 === 0 ? 800 : 0, usd: tt };
      s.total = +(so + ha + re + tt).toFixed(4);
    }
    serie.push(s);
  }
  return {
    ok: true, geradoEm: opts.geradoEm || Date.parse(AGORA_ISO) - 2 * 60000, modo: opts.modo || 'ao_vivo', killSwitch: !!opts.killSwitch, vozLigada: opts.voz !== undefined ? opts.voz : true,
    dias, custo: { serie, total: {}, projecaoMesUsd: 12.3456 },
    agora: { conversas: 6, porEstagio: { perguntou_faturamento: 3, aguardando_humano: 1, perguntou_segmento: 2 }, comHumano: 1, pausadas: 1, aguardandoPessoa: 1 },
    arquivo: { mensagens: 999, conversas: 40 }
  };
}

// negocios do funil 919856 (linhas como a ponte devolve)
export function makeDeals() {
  const mk = (id, titulo, etapa, status, criada, fim) => ({ id, title: titulo, stage_name: etapa, funnel_id: 919856, status, origin: 'WhatsApp (Ana)', origem_especial: 'WhatsApp (Ana)', created_at: criada + 'T15:00:00.000Z', end_time: fim ? fim + 'T15:00:00.000Z' : null, closed_at: null, lost_at: null, data_real_evento: null });
  return [
    mk(9001, 'Mercadinho Alfa', 'Novo lead', 'ongoing', '2026-11-19'),
    mk(9002, 'Padaria Beta', 'Em conversa', 'ongoing', '2026-11-18'),
    mk(9003, 'Empório Gama com um nome bem comprido para testar quebra de linha na lista', 'Em conversa', 'ongoing', '2026-11-12'),
    mk(9004, 'Casa Delta', 'Qualificado', 'won', '2026-11-12', '2026-11-14'),
    mk(9005, 'Loja Épsilon', 'Repassado', 'won', '2026-11-13', '2026-11-17'),
    mk(9006, 'Bar Zeta', 'Sem resposta', 'ongoing', '2026-11-11'),
    mk(9007, 'Rede Eta', 'Encerrado', 'lost', '2026-11-10', '2026-11-12'),
    mk(9008, 'Mini Theta', 'Encerrado', 'lost', '2026-11-15', '2026-11-16'),
    mk(9009, 'Mercado Iota', 'Qualificado', 'won', '2026-10-30', '2026-11-02'),
    mk(9010, 'Armazém Kappa', 'Novo lead', 'ongoing', '2026-11-20')
  ];
}
