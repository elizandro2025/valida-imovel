import { describe, expect, it } from 'vitest';
import { buildProjectSummary, recommendedDocTypes } from './projectSummary';
import { SAMPLE_PROJECT_DATA } from './projectSampleData';
import { ProjectData, createEmptyProject } from './projectConferenceService';
import { REAL_AI_COORDS, REAL_AI_NEIGHBORS } from './realAiDesdobro.fixture';

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

describe('desdobro lido pela IA real (arquivos fictícios de teste, 27/10/2026)', () => {
  const base = createEmptyProject();
  const project: ProjectData = {
    ...base,
    info: { ...base.info, procedimentos: ['desdobro'], natureza: 'urbano' },
    neighbors: REAL_AI_NEIGHBORS,
    polygon: {
      ...base.polygon,
      rawCoords: REAL_AI_COORDS,
      areaPlanta: '600,00 m²', areaMemorial: '600,00 m²', perimPlanta: '100,00 m', perimMemorial: '100,40 m',
      declaredSegments: {
        'P1>P2': { distPlanta: 20, distMemorial: 20 }, 'P2>P3': { distPlanta: 30, distMemorial: 30.4 },
        'P3>P4': { distPlanta: 20, distMemorial: 20 }, 'P4>P1': { distPlanta: 30, distMemorial: 30 },
      },
    },
  };
  const summary = buildProjectSummary(project);
  const titles = summary.attention.map(a => a.titulo).join('\n');

  it('calcula área e perímetro pelas coordenadas', () => {
    expect(summary.measures.hasCoords).toBe(true);
    expect(summary.measures.areaM2).toBeCloseTo(600, 2);
    expect(summary.measures.perimeter).toBeCloseTo(100, 2);
  });

  it('aponta os três erros plantados: lado P2-P3, perímetro do memorial e nome da vizinha', () => {
    expect(summary.tone).toBe('bad');
    expect(titles).toMatch(/P2.{0,3}P3/);
    expect(titles).toMatch(/Perímetro do memorial: declarado 100,4 m, calculado 100 m/);
    expect(titles).toMatch(/SOUZA/);
  });

  it('não gera alarme falso por pontuação, por tabela que o memorial não tem, nem cobra documentos de vizinhos no desdobro', () => {
    expect(titles).not.toMatch(/PEDRO TESTE FICTÍCIO" —/);
    expect(titles).not.toMatch(/ausente na tabela técnica/);
    expect(titles).not.toMatch(/sem certidão de matrícula|Matrícula do confrontante/);
  });
});
