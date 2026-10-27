import { describe, expect, it, vi } from 'vitest';

vi.mock('./aiClient', () => ({
  AIServiceError: class AIServiceError extends Error {},
  aiClient: { ocr: vi.fn(), task: vi.fn() },
  fileToBase64: async () => 'JVBERi0xLjc=',
}));

const { appendUploadFiles, buildBundle, guessDocType, mergeAiResult } = await import('./projectAiService');
const { projectConferenceService, computeAutomaticOpinion, consolidateIssues } = await import('./projectConferenceService');

const PLANTA = `--- Página 1 ---
PLANTA TOPOGRÁFICA — Gleba Boa Vista, Município de Chapecó/SC
Proprietário: JOÃO DA SILVA SANTOS
Área: 1.250,00 m² Perímetro: 142,30 m
ART 1234567-8 — Eng. Maria Souza CREA/SC 98765
Confrontante Norte: JOSÉ PEREIRA LIMA
[assinatura ausente]`;
const MEMORIAL = `--- Página 1 ---
MEMORIAL DESCRITIVO — Área: 1.248,00 m² Perímetro: 142,30 m
Proprietário: João da Silva Santos
Ao Norte confronta com José Pereira de Lima.`;

const files = [
  { id: 'a', name: 'planta.pdf', tipo: 'Planta', text: PLANTA },
  { id: 'b', name: 'memorial.pdf', tipo: 'Memorial', text: MEMORIAL },
];

const aiAnswer = {
  info: { nome: 'Gleba Boa Vista', art: '1234567-8', rt: 'Maria Souza', matricula: '99.999' },
  docs: [],
  pm: {
    area: { planta: '1.250,00', memorial: '1.248,00' },
    prop: { planta: 'JOÃO DA SILVA SANTOS', memorial: 'João da Silva Santos' },
  },
  neighbors: [{ trecho: 'V01–V02', lado: 'Norte', planta: 'JOSÉ PEREIRA LIMA', memTexto: 'José Pereira de Lima' }],
  polygon: { coords: '', isGeo: false, order: 'EN' },
  checklists: { retificacao: { 'INEXISTENTE-99': { status: 'CONFORME', evidence: 'x' } } },
  inconsistencias: [{ tipo: 'div', documento: 'Memorial', local: 'Área', erro: 'Área do memorial difere da planta', prio: 'Alta', prov: 'Igualar as áreas' }],
  resumo: 'Resumo neutro.',
};

describe('guessDocType', () => {
  it('classifica pelo nome do arquivo', () => {
    expect(guessDocType('Memorial_Descritivo.pdf')).toBe('Memorial');
    expect(guessDocType('planta topografica.pdf')).toBe('Planta');
    expect(guessDocType('matricula confrontante norte.pdf')).toBe('Matrículas Confrontantes');
    expect(guessDocType('ART quitada.pdf')).toBe('Responsabilidade Técnica');
    expect(guessDocType('xyz.pdf')).toBe('Outro');
  });
});

describe('appendUploadFiles', () => {
  const file = (name: string, size = 10) => new File(['x'.repeat(size)], name);

  it('aceita os formatos lidos, sugere o tipo pelo nome e explica os recusados', () => {
    const { files, problems } = appendUploadFiles([], [file('planta_lote8.pdf'), file('memorial.pdf'), file('contrato.docx')]);
    expect(files.map(f => f.tipo)).toEqual(['Planta', 'Memorial']);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/contrato\.docx.*PDF/);
  });

  it('respeita o limite de arquivos por conferência', () => {
    const many = Array.from({ length: 14 }, (_, i) => file(`doc${i}.pdf`));
    const { files, problems } = appendUploadFiles([], many);
    expect(files).toHaveLength(12);
    expect(problems.some(p => /Limite de 12/.test(p))).toBe(true);
  });
});

describe('buildBundle', () => {
  it('rotula cada documento e inclui os itens do checklist', () => {
    const text = buildBundle(files.map(f => ({ name: f.name, tipo: f.tipo, text: f.text })), ['retificacao']);
    expect(text).toContain('=== DOCUMENTO: Planta — planta.pdf ===');
    expect(text).toContain('[retificacao]');
  });
});

describe('mergeAiResult', () => {
  const base = projectConferenceService.createBlankProject();
  const merged = mergeAiResult({ base, ai: aiAnswer, files, procedimentos: ['retificacao'], model: 'm' });

  it('marca como pendência o dado que a IA citou mas não existe nos documentos', () => {
    const invented = merged.manualIssues.find(i => i.erro.includes('99.999'));
    expect(invented?.origem).toBe('ia');
    expect(invented?.tipo).toBe('pend');
  });

  it('descarta itens de checklist com id inexistente', () => {
    expect(merged.checklists.retificacao['INEXISTENTE-99']).toBeUndefined();
  });

  it('registra como ausentes os documentos exigidos que não foram enviados', () => {
    const ausentes = merged.docs.filter(d => d.status === 'Ausente').map(d => d.tipo);
    expect(ausentes).toContain('Matrícula Principal');
    expect(merged.docs.find(d => d.nome === 'planta.pdf')?.status).toBe('Recebido');
  });

  it('as regras do sistema detectam as divergências entre planta e memorial', () => {
    const issues = consolidateIssues(merged);
    expect(issues.some(i => i.origem === 'Planta × Memorial' && i.local.includes('Área'))).toBe(true);
    expect(issues.some(i => i.origem.includes('Confrontantes'))).toBe(true);
  });

  it('nunca produz parecer positivo com divergências ou pendências', () => {
    expect(computeAutomaticOpinion(merged).opinion).not.toBe('DOCUMENTAÇÃO COMPATÍVEL');
    expect(computeAutomaticOpinion(merged).blocked).toBe(true);
  });

  it('mantém apontamentos manuais ao refazer a conferência', () => {
    const withManual = { ...merged, manualIssues: [...merged.manualIssues, { id: 'm1', tipo: 'pend' as const, cat: 'X', local: 'Y', erro: 'Meu apontamento', risco: '', prio: 'Baixa' as const, prov: '', origem: 'manual' as const }] };
    const again = mergeAiResult({ base: withManual, ai: aiAnswer, files, procedimentos: ['retificacao'], model: 'm' });
    expect(again.manualIssues.some(i => i.erro === 'Meu apontamento')).toBe(true);
    expect(again.manualIssues.filter(i => i.origem === 'ia' && i.erro.includes('99.999')).length).toBe(1);
  });

  it('tolera resposta malformada da IA sem quebrar', () => {
    const bad = mergeAiResult({ base, ai: { info: 'x', pm: [], neighbors: 'y', polygon: null, checklists: 5, inconsistencias: {} }, files, procedimentos: ['retificacao'], model: null });
    expect(bad.neighbors).toEqual([]);
    expect(bad.ai?.files).toHaveLength(2);
  });
});
