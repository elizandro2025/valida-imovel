import { describe, expect, it } from 'vitest';
import { getReportView, statusOf } from './reportView';

describe('getReportView', () => {
  it('regressão: lê o embargo e os regimes gravados com os nomes antigos dos prompts', () => {
    const view = getReportView({
      registro_ambiental: { area_embargada: 'Embargo IBAMA (AV-4)' },
      regimes_especiais: { e_condominio_edilicio: true },
      caracteristicas_fisicas: { area_construida_m2: '120 m²' },
    });
    expect(view.ambiental.embargos_ambientais).toBe('Embargo IBAMA (AV-4)');
    expect(view.temEmbargo).toBe(true);
    expect(view.regimes.eh_condominio).toBe(true);
    expect(view.carac.area_construida).toBe('120 m²');
  });

  it('sem nota de risco, o nível é INDEFINIDO (nunca "baixo" por padrão)', () => {
    const view = getReportView({ parecer_analise: {} });
    expect(view.score).toBeNull();
    expect(view.nivelRisco).toBe('INDEFINIDO');
    expect(view.statusJuridico).toBe('NÃO AVALIADO');
  });

  it('separa ônus ativos dos cancelados', () => {
    const view = getReportView({
      onus_garantias_financeiras: [{ tipo: 'Hipoteca', status: 'CANCELADO' }, { tipo: 'Alienação fiduciária', status: 'ATIVO' }],
      indisponividades_e_penhoras: [{ tipo: 'Penhora', status: 'INDEFINIDO' }],
      parecer_analise: { score_risco: 80 },
    });
    expect(view.onusTodos).toHaveLength(3);
    expect(view.onusAtivos).toHaveLength(2);
    expect(view.nivelRisco).toBe('CRÍTICO');
  });

  it('statusOf trata as variações de texto da IA', () => {
    expect(statusOf({ status: 'Cancelada' })).toBe('CANCELADO');
    expect(statusOf({ status: 'BAIXADO' })).toBe('CANCELADO');
    expect(statusOf({ status: 'indefinido' })).toBe('INDEFINIDO');
    expect(statusOf({})).toBe('ATIVO');
  });
});
