import { describe, expect, it } from 'vitest';
import { NeighborRow, nominalDiffService } from './nominalDiffService';
import { PROCEDURE_CHECKLISTS } from './projectChecklists';
import { projectConferenceService, requiresNeighborTitles } from './projectConferenceService';
import { REAL_AI_NEIGHBORS } from './realAiDesdobro.fixture';

const nameErrors = (row: NeighborRow) =>
  nominalDiffService.compareRow(row, REAL_AI_NEIGHBORS).issues.filter(i => i.level === 'err');

describe('comparação de nomes dos vizinhos', () => {
  it('pontuação e "de"/"de propriedade do" entre o lote e o nome não são divergência', () => {
    expect(nominalDiffService.comparableName('Lote 9 - PEDRO TESTE FICTÍCIO')).toBe('Lote 9 PEDRO TESTE FICTÍCIO');
    expect(nominalDiffService.comparableName('Lote 9, de PEDRO TESTE FICTÍCIO')).toBe('Lote 9 PEDRO TESTE FICTÍCIO');
    expect(nominalDiffService.comparableName('Lote 20, de propriedade do Município')).toBe('Lote 20 Município');
    expect(nameErrors(REAL_AI_NEIGHBORS[1])).toEqual([]);
    expect(nameErrors(REAL_AI_NEIGHBORS[2])).toEqual([]);
  });

  it('partículas do próprio nome continuam contando', () => {
    expect(nominalDiffService.comparableName('ANA DA SILVA')).toBe('ANA DA SILVA');
    expect(nominalDiffService.comparableName('Ana da Silva')).toBe('Ana da Silva');
    const row: NeighborRow = { id: 'x', trecho: 'V1-V2', tipo: 'imovel', planta: 'Lote 3 - ANA DA SILVA', memTexto: 'Lote 3, de ANA SILVA' };
    expect(nominalDiffService.compareRow(row).issues.some(i => i.level === 'err' && /omite "DA"/.test(i.message))).toBe(true);
  });

  it('sobrenome a mais e acento diferente continuam sendo divergência, com a explicação', () => {
    const errors = nameErrors(REAL_AI_NEIGHBORS[3]);
    expect(errors).toHaveLength(1);
    expect(errors[0].column).toBe('memTexto');
    expect(errors[0].message).toMatch(/acrescenta "SOUZA"/);
    expect(errors[0].message).toMatch(/"FICTÍCIA" × "FICTICIA"/);
  });

  it('memorial sem tabela de confrontantes não gera "ausente na tabela"', () => {
    const alerts = nominalDiffService.runSecondPass(REAL_AI_NEIGHBORS, { requireNeighborTitles: false });
    expect(alerts).toEqual([]);
    const warns = nominalDiffService.compareRow(REAL_AI_NEIGHBORS[1], REAL_AI_NEIGHBORS).issues.map(i => i.column);
    expect(warns).not.toContain('memTabela');
    expect(warns).not.toContain('quadro');
  });

  it('se o memorial tem tabela, o vizinho que falta nela continua sendo apontado', () => {
    const rows = REAL_AI_NEIGHBORS.map((r, i) => ({ ...r, memTabela: i === 1 ? '' : r.memTexto }));
    expect(nominalDiffService.runSecondPass(rows, { requireNeighborTitles: false }).some(a => /ausente na tabela técnica/.test(a))).toBe(true);
  });
});

describe('matrícula e anuência dos vizinhos', () => {
  it('são cobradas só nos procedimentos cujo checklist fala de confrontantes', () => {
    PROCEDURE_CHECKLISTS.forEach(checklist => {
      const mentions = checklist.items.some(item => /confront/i.test(item.text));
      expect([checklist.key, requiresNeighborTitles([checklist.key])]).toEqual([checklist.key, mentions]);
    });
  });

  it('a lista de documentos esperados segue a mesma regra', () => {
    const tipos = (procs: string[]) => projectConferenceService.getExpectedDocuments(procs, 'urbano').map(d => d.tipo);
    expect(tipos(['desdobro'])).not.toContain('Matrículas Confrontantes');
    expect(tipos(['retificacao'])).toContain('Matrículas Confrontantes');
    expect(tipos(['desdobro'])).toEqual(expect.arrayContaining(['Planta', 'Memorial', 'Matrícula Principal', 'Responsabilidade Técnica']));
  });

  it('sem procedimento marcado, vale a regra mais rigorosa', () => {
    expect(requiresNeighborTitles([])).toBe(true);
    expect(nominalDiffService.runSecondPass(REAL_AI_NEIGHBORS).some(a => /sem certidão de matrícula/.test(a))).toBe(true);
  });
});
