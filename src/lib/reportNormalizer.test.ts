import { describe, expect, it } from 'vitest';
import {
  IncompleteAnalysisError, normalizeReport, parseAIJson, prepareText, resolveLienStatus, riskFloor, verifyAgainstSource,
} from './reportNormalizer';

const SOURCE = `--- Página 1 ---
MATRÍCULA 19.028 — 1º Cartório de Registro de Imóveis
PROPRIETÁRIOS: JAIME JOÃO FRANCHINI, CPF 016.765.718-68.
R-3/19.028 — HIPOTECA em favor do Banco do Brasil S/A, valor R$ 100.000,00.
AV-5/19.028 — PENHORA determinada pela 2ª Vara Cível, processo 1000123-45.2024.8.26.0564.`;

const baseExtraction = () => ({
  identificacao_geral: { matricula: '19.028' },
  caracteristicas_fisicas: {}, memorial_descritivo_georreferenciamento: {}, regimes_especiais: {},
  registro_ambiental: { embargos_ambientais: null }, imoveis_especiais: {},
  proprietarios_atuais: [{ nome: 'JAIME JOÃO FRANCHINI', cpf_cnpj: '016.765.718-68' }],
  cadeia_dominial: [], onus_garantias_financeiras: [], indisponividades_e_penhoras: [],
  usufruto_servidoes_e_direitos: [], averbacoes_diversas: [],
});

const meta = { source: SOURCE, models: ['gemini-flash-latest'], truncated: false, omittedChars: 0 };

describe('prepareText', () => {
  it('mantém documentos curtos inteiros', () => {
    expect(prepareText('abc', 10)).toEqual({ text: 'abc', truncated: false, omittedChars: 0 });
  });

  it('em documentos longos preserva o começo e principalmente o fim (atos mais recentes)', () => {
    const full = `INICIO${'x'.repeat(1000)}FIM-ATO-RECENTE`;
    const result = prepareText(full, 200);
    expect(result.truncated).toBe(true);
    expect(result.text.startsWith('INICIO')).toBe(true);
    expect(result.text.endsWith('FIM-ATO-RECENTE')).toBe(true);
    expect(result.omittedChars).toBe(full.length - 200);
  });
});

describe('parseAIJson', () => {
  it('aceita JSON válido com as chaves exigidas', () => {
    expect(parseAIJson('```json\n{"a":1,"b":[]}\n```', ['a', 'b'])).toEqual({ a: 1, b: [] });
  });

  it('JSON quebrado vira erro (nunca um relatório vazio "sem ônus")', () => {
    expect(() => parseAIJson('{"a": [1, 2', ['a'])).toThrow(IncompleteAnalysisError);
  });

  it('chave ausente vira erro, com a seção no registro técnico e não na mensagem', () => {
    let error: unknown;
    try { parseAIJson('{"a":1}', ['a', 'parecer_analise']); } catch (e) { error = e; }
    expect(error).toBeInstanceOf(IncompleteAnalysisError);
    expect((error as IncompleteAnalysisError).missing).toEqual(['parecer_analise']);
    expect((error as Error).message).not.toMatch(/parecer_analise/);
  });
});

describe('resolveLienStatus', () => {
  it('sem prova de cancelamento, o ônus é ATIVO', () => {
    expect(resolveLienStatus({ tipo: 'Hipoteca', status: 'ATIVO' })).toBe('ATIVO');
    expect(resolveLienStatus({ tipo: 'Hipoteca' })).toBe('ATIVO');
  });

  it('regressão: "não consta" no campo de cancelamento não cancela a hipoteca', () => {
    expect(resolveLienStatus({ tipo: 'Hipoteca', ato_cancelamento: 'Não consta', status: 'ATIVO' })).toBe('ATIVO');
  });

  it('regressão: palavras como "liberado" ou "quitação" na descrição não cancelam o ônus', () => {
    expect(resolveLienStatus({ tipo: 'Alienação fiduciária', valor_garantia: 'R$ 300 mil liberados', trecho_origem: 'até a quitação' }))
      .toBe('ATIVO');
  });

  it('com o ato de cancelamento, o ônus é CANCELADO', () => {
    expect(resolveLienStatus({ tipo: 'Hipoteca', ato_cancelamento: 'AV-7/19.028', status: 'CANCELADO' })).toBe('CANCELADO');
    expect(resolveLienStatus({ tipo: 'Penhora', data_cancelamento: '10/03/2023' })).toBe('CANCELADO');
  });

  it('IA diz "cancelado" sem citar o ato: fica INDEFINIDO (conferir)', () => {
    expect(resolveLienStatus({ tipo: 'Hipoteca', status: 'CANCELADO' })).toBe('INDEFINIDO');
  });
});

describe('riskFloor', () => {
  const report = (overrides: Record<string, unknown>) => ({ ...baseExtraction(), ...overrides });

  it('penhora ativa exige nota mínima 75', () => {
    expect(riskFloor(report({ indisponividades_e_penhoras: [{ tipo: 'Penhora', status: 'ATIVO' }] })).minimum).toBe(75);
  });

  it('hipoteca ativa exige nota mínima 50', () => {
    expect(riskFloor(report({ onus_garantias_financeiras: [{ tipo: 'Hipoteca', status: 'ATIVO' }] })).minimum).toBe(50);
  });

  it('ônus "a conferir" conta como ativo', () => {
    expect(riskFloor(report({ onus_garantias_financeiras: [{ tipo: 'Hipoteca', status: 'INDEFINIDO' }] })).minimum).toBe(50);
  });

  it('ônus cancelados não elevam a nota', () => {
    expect(riskFloor(report({ onus_garantias_financeiras: [{ tipo: 'Hipoteca', status: 'CANCELADO' }] })).minimum).toBe(0);
  });

  it('embargo ambiental eleva para 75; frase de ausência não', () => {
    expect(riskFloor(report({ registro_ambiental: { embargos_ambientais: 'Embargo IBAMA averbado na AV-4' } })).minimum).toBe(75);
    expect(riskFloor(report({ registro_ambiental: { embargos_ambientais: 'Não consta embargo' } })).minimum).toBe(0);
  });
});

describe('verifyAgainstSource', () => {
  it('confirma CPF e ato presentes no texto e sinaliza os ausentes', () => {
    const report = {
      ...baseExtraction(),
      proprietarios_atuais: [
        { nome: 'JAIME', cpf_cnpj: '016.765.718-68' },
        { nome: 'INVENTADO', cpf_cnpj: '123.456.789-09' },
      ],
      onus_garantias_financeiras: [
        { tipo: 'Hipoteca', numero_ato: 'R-3', trecho_origem: 'HIPOTECA em favor do Banco do Brasil S/A' },
        { tipo: 'Hipoteca', numero_ato: 'R-9', trecho_origem: 'texto que não existe no documento original' },
      ],
    };
    const warnings = verifyAgainstSource(report, SOURCE);
    expect(report.proprietarios_atuais[0]).not.toHaveProperty('_cpf_nao_confirmado');
    expect(report.proprietarios_atuais[1]).toHaveProperty('_cpf_nao_confirmado', true);
    expect(report.onus_garantias_financeiras[0]).toMatchObject({ _trecho_confirmado: true });
    expect(report.onus_garantias_financeiras[1]).toMatchObject({ _ato_nao_confirmado: true, _trecho_confirmado: false });
    expect(warnings).toHaveLength(2);
  });
});

describe('normalizeReport', () => {
  it('regressão: parecer sem nota de risco vira erro, não "baixo risco"', () => {
    expect(() => normalizeReport({ extracao: baseExtraction(), parecer: { parecer_analise: {} } }, meta))
      .toThrow(IncompleteAnalysisError);
  });

  it('eleva a nota quando a extração encontra ônus ativo e explica o motivo', () => {
    const extracao = { ...baseExtraction(), indisponividades_e_penhoras: [{ tipo: 'Penhora', numero_ato: 'AV-5', status: 'ATIVO' }] };
    const report = normalizeReport({ extracao, parecer: { parecer_analise: { score_risco: 10 } } }, meta);
    expect(report.parecer_analise.score_risco).toBe(75);
    expect(report.parecer_analise.nivel_risco).toBe('CRÍTICO');
    expect(report.detector_inconsistencias[0]).toMatch(/elevada de 10 para 75/);
  });

  it('mantém a nota da IA quando não há ônus ativos e registra os metadados', () => {
    const report = normalizeReport({ extracao: baseExtraction(), parecer: { parecer_analise: { score_risco: 12 } } },
      { ...meta, models: ['gemini-flash-latest', 'gemini-flash-lite-latest'], truncated: true, omittedChars: 500 });
    expect(report.parecer_analise.score_risco).toBe(12);
    expect(report.parecer_analise.status_juridico).toBe('REGULAR');
    expect(report._meta).toMatchObject({ modo_economico: true, texto_truncado: true, caracteres_omitidos: 500 });
    expect(report.detector_inconsistencias.some((p: string) => p.includes('muito longo'))).toBe(true);
  });

  it('não cancela hipoteca por palavra solta e sinaliza a ausência de proprietários', () => {
    const extracao = {
      ...baseExtraction(),
      proprietarios_atuais: [],
      onus_garantias_financeiras: [{ tipo: 'Hipoteca', numero_ato: 'R-3', ato_cancelamento: 'não há', status: 'ATIVO' }],
    };
    const report = normalizeReport({ extracao, parecer: { parecer_analise: { score_risco: 5 } } }, meta);
    expect(report.onus_garantias_financeiras[0].status).toBe('ATIVO');
    expect(report.parecer_analise.score_risco).toBe(50);
    expect(report.detector_inconsistencias).toContain('Nenhum proprietário atual foi identificado na leitura.');
  });
});
