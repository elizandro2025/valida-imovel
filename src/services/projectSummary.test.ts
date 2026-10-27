import { describe, expect, it } from 'vitest';
import { buildProjectSummary, recommendedDocTypes } from './projectSummary';
import { SAMPLE_PROJECT_DATA } from './projectSampleData';
import { createEmptyProject } from './projectConferenceService';

describe('o que enviar em cada procedimento', () => {
  it('planta, memorial e matrícula são sempre obrigatórios', () => {
    const required = recommendedDocTypes(['desdobro'], 'urbano').filter(d => d.required).map(d => d.tipo);
    expect(required).toEqual(['Planta', 'Memorial', 'Matrícula Principal']);
  });

  it('retificação pede os vizinhos; desdobro pede a prefeitura; imóvel rural pede CCIR/CAR', () => {
    expect(recommendedDocTypes(['retificacao'], 'urbano').map(d => d.tipo)).toEqual(expect.arrayContaining(['Matrículas Confrontantes', 'Anuência']));
    expect(recommendedDocTypes(['desdobro'], 'urbano').map(d => d.tipo)).toContain('Certidão Municipal');
    expect(recommendedDocTypes(['desdobro'], 'rural').map(d => d.tipo)).toContain('Documento Rural');
  });
});

describe('resultado da conferência', () => {
  const summary = buildProjectSummary(SAMPLE_PROJECT_DATA);

  it('o exemplo mostra divergências, com as correções primeiro', () => {
    expect(summary.tone).toBe('bad');
    expect(summary.divergencias).toBeGreaterThan(0);
    expect(summary.attention[0].tipo).toBe('div');
    expect(summary.attention.some(a => /0,40|441/.test(a.titulo))).toBe(true);
  });

  it('itens do checklist não respondidos viram um número, não uma lista enorme', () => {
    expect(summary.checklistPending).toBeGreaterThan(0);
    expect(summary.attention.length).toBeLessThan(summary.divergencias + summary.pendencias);
  });

  it('as medidas vêm do cálculo pelas coordenadas, não da IA', () => {
    expect(summary.measures.hasCoords).toBe(true);
    expect(summary.measures.areaM2).toBeCloseTo(389313.03, 0);
    expect(summary.measures.areaDeclared).toBeCloseTo(389313.03, 0);
  });

  it('o exemplo recebeu os documentos obrigatórios; o próximo passo sempre inclui o responsável técnico', () => {
    expect(summary.missing).toHaveLength(0);
    expect(summary.nextSteps.at(-1)).toMatch(/responsável técnico/);
  });

  it('projeto sem documentos nem coordenadas: aponta o que falta enviar, sem inventar resultado', () => {
    const blank = buildProjectSummary(createEmptyProject());
    expect(blank.tone).not.toBe('ok');
    expect(blank.missing.map(m => m.tipo)).toEqual(['Planta', 'Memorial', 'Matrícula Principal']);
    expect(blank.measures.hasCoords).toBe(false);
    expect(blank.nextSteps.some(s => /coordenadas/.test(s))).toBe(true);
  });
});
