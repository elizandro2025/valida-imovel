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

  it('separadas por espaço, a vírgula é a casa decimal', () => {
    const { vertices, errors } = geodesyService.parseVertices('P1 288000,00 7464000,50\nP2 288020,00 7464000,00');
    expect(errors).toEqual([]);
    expect(vertices[0]).toMatchObject({ id: 'P1', E: 288000, N: 7464000.5 });
  });

  it('separadas por vírgula continuam aceitas', () => {
    const { vertices } = geodesyService.parseVertices('V01,288000.00,7464000.00\nV02, 288020.5, 7464000');
    expect(vertices[0]).toMatchObject({ id: 'V01', E: 288000, N: 7464000 });
    expect(vertices[1]).toMatchObject({ id: 'V02', E: 288020.5, N: 7464000 });
  });

  it('entende os rótulos dos eixos, como a IA às vezes escreve', () => {
    // Formato real devolvido pela leitura automática no teste com a IA (27/10/2026)
    const raw = 'P1 E 288000,00 N 7464000,00\nP2 E 288020,00 N 7464000,00\nP3 E 288020,00 N 7464030,00\nP4 E 288000,00 N 7464030,00';
    const { vertices, errors } = geodesyService.parseVertices(raw);
    expect(errors).toEqual([]);
    expect(vertices.map(v => [v.id, v.E, v.N])).toEqual([
      ['P1', 288000, 7464000], ['P2', 288020, 7464000], ['P3', 288020, 7464030], ['P4', 288000, 7464030],
    ]);
    const calc = geodesyService.calculatePolygon(vertices);
    expect(calc.areaM2).toBeCloseTo(600, 2);
    expect(calc.perimeter).toBeCloseTo(100, 2);
  });

  it('com rótulos, a ordem N antes de E é respeitada', () => {
    const { vertices } = geodesyService.parseVertices('V1 N=7464000,00 E=288000,00\nV2 N: 7464010 E: 288005');
    expect(vertices[0]).toMatchObject({ id: 'V1', E: 288000, N: 7464000 });
    expect(vertices[1]).toMatchObject({ id: 'V2', E: 288005, N: 7464010 });
  });

  it('um vértice chamado "E" não é confundido com rótulo', () => {
    const { vertices } = geodesyService.parseVertices('E 288000,00 7464000,00');
    expect(vertices[0]).toMatchObject({ id: 'E', E: 288000, N: 7464000 });
  });
});
