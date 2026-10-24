import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EXTRACTION_KEYS } from '@/lib/reportNormalizer';

const ai = vi.hoisted(() => ({ ocr: vi.fn(), task: vi.fn() }));

vi.mock('./aiClient', () => ({
  AIServiceError: class AIServiceError extends Error {},
  aiClient: { ocr: ai.ocr, task: ai.task },
  fileToBase64: async () => 'JVBERi0xLjc=',
}));
// O nome do arquivo serve de hash: cada teste começa sem leitura guardada
vi.mock('./ocrCacheService', () => ({
  ocrCacheService: { computeHash: async (file: File) => file.name, getCachedReport: () => null, setCachedReport: () => undefined },
}));
vi.mock('./georreferenciamentoService', () => ({ georreferenciamentoService: { analyzeGeoreferencing: async () => null } }));

const { analyzeMatricula, AIServiceError } = await import('./aiService');

const CERTIDAO = `--- Página 1 ---
MATRÍCULA 19.028 — 1º Cartório de Registro de Imóveis
PROPRIETÁRIOS: JAIME JOÃO FRANCHINI, CPF 016.765.718-68.
R-3/19.028 — COMPRA E VENDA. AV-4/19.028 — CONSTRUÇÃO AVERBADA.`;

const LIST_KEYS = ['proprietarios_atuais', 'cadeia_dominial', 'onus_garantias_financeiras', 'indisponividades_e_penhoras',
  'usufruto_servidoes_e_direitos', 'averbacoes_diversas'];
const extracao = (omit?: string) => {
  const full: Record<string, unknown> = Object.fromEntries(EXTRACTION_KEYS.map(key => [key, LIST_KEYS.includes(key) ? [] : {}]));
  full.identificacao_geral = { matricula: '19.028' };
  if (omit) delete full[omit];
  return { text: JSON.stringify(full), model: 'gemini-flash-latest', finishReason: 'STOP' };
};
const parecer = { text: JSON.stringify({ parecer_analise: { score_risco: 10 } }), model: 'gemini-flash-latest', finishReason: 'STOP' };
const pdf = (name: string, content = '%PDF-1.7\n/Producer (Cartorio Digital)\nBT (MATRICULA 19.028) Tj ET') =>
  new File([content], name, { type: 'application/pdf' });

beforeEach(() => {
  ai.ocr.mockReset().mockResolvedValue({ text: CERTIDAO, model: 'gemini-flash-latest', finishReason: 'STOP' });
  ai.task.mockReset();
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

describe('analyzeMatricula', () => {
  it('repete uma vez a etapa que veio sem uma seção e entrega o relatório', async () => {
    let extracoes = 0;
    ai.task.mockImplementation(async (task: string) =>
      task === 'parecer' ? parecer : (++extracoes === 1 ? extracao('indisponividades_e_penhoras') : extracao()));

    const report = await analyzeMatricula(pdf('repete.pdf'));
    expect(report.indisponividades_e_penhoras).toEqual([]);
    expect(extracoes).toBe(2);
  });

  it('se a seção faltar de novo, mostra erro sem nomes técnicos (nunca um relatório "sem penhoras")', async () => {
    ai.task.mockImplementation(async (task: string) => (task === 'parecer' ? parecer : extracao('indisponividades_e_penhoras')));

    const failure = analyzeMatricula(pdf('falha.pdf'));
    await expect(failure).rejects.toBeInstanceOf(AIServiceError);
    await expect(failure).rejects.toThrow(/não devolveu todas as partes/);
    await expect(failure).rejects.not.toThrow(/indisponividades_e_penhoras/);
    expect(ai.task.mock.calls.filter(([task]) => task === 'extracao')).toHaveLength(2);
  });

  it('recusa o relatório exportado pelo ValidaImóvel antes de gastar a leitura por IA', async () => {
    const report = pdf('Analise_Matricula_19028.pdf', '%PDF-1.3\nBT (ValidaIm\\363vel) Tj ET\n/Producer (jsPDF 4.2.1)\n%%EOF');

    await expect(analyzeMatricula(report)).rejects.toThrow(/relatório gerado pelo ValidaImóvel/);
    expect(ai.ocr).not.toHaveBeenCalled();
  });

  it('recusa o relatório impresso e escaneado depois da leitura, sem rodar a análise', async () => {
    ai.ocr.mockResolvedValue({
      text: `--- Página 1 ---\nValidaImóvel — análise automatizada • Matrícula 19.028\n${CERTIDAO}`, model: 'gemini-flash-latest', finishReason: 'STOP',
    });

    await expect(analyzeMatricula(pdf('escaneado.pdf'))).rejects.toThrow(/relatório gerado pelo ValidaImóvel/);
    expect(ai.task).not.toHaveBeenCalled();
  });
});
