import { afterEach, describe, expect, it } from 'vitest';
import {
  computeAutomaticOpinion, createEmptyProject, finalOpinion, generateReportMarkdown, keepCurrentProject, loadCurrentProject,
  polygonParams, projectConferenceService, projectHasContent,
} from './projectConferenceService';
import { geodesyService } from './geodesyService';
import { projectMemory } from './projectMemory';
import { SAMPLE_PROJECT_DATA } from './projectSampleData';

afterEach(() => projectMemory.clear());

describe('projeto de exemplo', () => {
  const sample = SAMPLE_PROJECT_DATA;
  const { vertices, errors } = geodesyService.parseVertices(sample.polygon.rawCoords, sample.polygon.isGeo, sample.polygon.order);
  const calc = geodesyService.calculatePolygon(vertices, polygonParams(sample.polygon), sample.polygon.declaredSegments);

  it('é marcado como exemplo e não finge ter sido gerado por um modelo de IA', () => {
    expect(sample.isSample).toBe(true);
    expect(sample.ai?.model).toBeNull();
  });

  it('regressão: área e perímetro declarados na planta são os que as coordenadas dão', () => {
    expect(errors).toHaveLength(0);
    expect(calc.areaM2).toBeCloseTo(389313.03, 1);
    expect(calc.perimeter).toBeCloseTo(2349.58, 1);
    expect(polygonParams(sample.polygon).areaPlanta).toBeCloseTo(calc.areaM2, 1);
    expect(polygonParams(sample.polygon).perimPlanta).toBeCloseTo(calc.perimeter, 1);
  });

  it('as medidas declaradas usam as chaves dos lados calculados', () => {
    const keys = calc.segments.map(s => s.key);
    expect(Object.keys(sample.polygon.declaredSegments).every(k => keys.includes(k))).toBe(true);
  });

  it('o relatório exportado avisa que os dados são fictícios', () => {
    expect(generateReportMarkdown(sample)).toContain('EXEMPLO COM DADOS FICTÍCIOS');
  });
});

describe('parecer final', () => {
  it('nunca fica "compatível" com divergências, mesmo que tenha sido escolhido antes', () => {
    const data = { ...SAMPLE_PROJECT_DATA, parecer: { ...SAMPLE_PROJECT_DATA.parecer, final: 'DOCUMENTAÇÃO COMPATÍVEL' } };
    expect(computeAutomaticOpinion(data).blocked).toBe(true);
    expect(finalOpinion(data)).not.toBe('DOCUMENTAÇÃO COMPATÍVEL');
  });

  it('o conferente pode deixar o parecer mais severo que o automático', () => {
    const data = { ...SAMPLE_PROJECT_DATA, parecer: { ...SAMPLE_PROJECT_DATA.parecer, final: 'DOCUMENTAÇÃO INCOMPLETA PARA CONFERÊNCIA' } };
    expect(finalOpinion(data)).toBe('DOCUMENTAÇÃO INCOMPLETA PARA CONFERÊNCIA');
  });
});

describe('relatório em Word', () => {
  it('escapa o texto digitado e monta a tabela sem a linha separadora', () => {
    const html = projectConferenceService.reportHtml('| Nome | Obs |\n|---|---|\n| <b>Ana</b> & cia | **ok** |');
    expect(html).toContain('<table>');
    expect(html).toContain('&lt;b&gt;Ana&lt;/b&gt; &amp; cia');
    expect(html).toContain('<b>ok</b>');
    expect(html).not.toContain('---');
  });
});

describe('projeto aberto', () => {
  it('o título padrão escolhido no Hub não faz o projeto vazio parecer "em andamento"', () => {
    const blank = createEmptyProject();
    expect(projectHasContent({ ...blank, info: { ...blank.info, nome: 'Conferência de Retificação de Área (LRP)' } })).toBe(false);
    expect(projectHasContent({ ...blank, info: { ...blank.info, nome: 'Lote 5 da Rua A' } })).toBe(true);
  });

  it('fica só na memória da aba e sai ao limpar (ao sair da conta)', () => {
    expect(projectHasContent(loadCurrentProject())).toBe(false);
    keepCurrentProject({ ...createEmptyProject(), info: { ...createEmptyProject().info, nome: 'Lote 5' } });
    expect(loadCurrentProject().info.nome).toBe('Lote 5');
    projectMemory.clear();
    expect(loadCurrentProject().info.nome).toBe('');
  });
});

describe('coordenadas', () => {
  it('coordenadas UTM marcadas como latitude/longitude viram erro, não resultado sem sentido', () => {
    const { vertices, errors } = geodesyService.parseVertices('M-01;225410,150;7481200,320\nM-02;225850,590;7481190,650', true);
    expect(vertices).toHaveLength(0);
    expect(errors[0]).toMatch(/não são latitude e longitude/);
  });

  it('aceita coordenadas com separador de milhar', () => {
    const { vertices } = geodesyService.parseVertices('M-01;225.410,150;7.481.200,320\nM-02;225.850,590;7.481.190,650');
    expect(vertices[0].E).toBeCloseTo(225410.15);
    expect(vertices[0].N).toBeCloseTo(7481200.32);
  });
});
