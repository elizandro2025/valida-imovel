/**
 * Análise de matrícula: leitura do PDF (OCR) → extração + parecer (+ georreferenciamento) em paralelo
 * → regras de segurança e conferência com o texto lido (src/lib/reportNormalizer.ts).
 */
import { AIServiceError, aiClient, fileToBase64 } from './aiClient';
import { ocrCacheService } from './ocrCacheService';
import { georreferenciamentoService } from './georreferenciamentoService';
import {
  EXTRACTION_KEYS, IncompleteAnalysisError, normalizeReport, parseAIJson, prepareText,
} from '@/lib/reportNormalizer';

export { AIServiceError };

/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- o relatório vem da IA e tem forma livre */
export type MatriculaReport = Record<string, any>;
export type AnalysisProgressCallback = (step: string, progress: number) => void;

const GEO_HINT = /georreferenc|SIGEF|SIRGAS|UTM|v[ée]rtice/i;

// Última leitura do PDF: se a análise falhar depois do OCR, a nova tentativa não lê (nem conta) o arquivo de novo
let lastOcr: { hash: string; text: string; model: string | null; cut: boolean } | null = null;

export async function analyzeMatricula(file: File, onProgress?: AnalysisProgressCallback): Promise<MatriculaReport> {
  const hash = await ocrCacheService.computeHash(file);

  // Matrícula já analisada neste navegador: não gasta a cota da IA de novo
  const cachedReport = ocrCacheService.getCachedReport(hash);
  if (cachedReport) return cachedReport;

  try {
    let ocr = lastOcr?.hash === hash ? lastOcr : null;
    if (!ocr) {
      onProgress?.('Lendo o documento com IA (OCR)...', 15);
      const result = await aiClient.ocr(await fileToBase64(file));
      if (result.text.trim().length < 100) {
        throw new AIServiceError('Não foi possível ler texto suficiente no PDF. Verifique se é a certidão completa e legível.');
      }
      ocr = { hash, text: result.text, model: result.model, cut: result.finishReason === 'MAX_TOKENS' };
      lastOcr = ocr;
    }

    onProgress?.('Analisando titularidade, ônus e restrições...', 45);
    const prepared = prepareText(ocr.text);
    const [extracao, parecer, geo] = await Promise.all([
      aiClient.task('extracao', prepared.text),
      aiClient.task('parecer', prepared.text),
      // Georreferenciamento é complementar: se falhar, o relatório sai sem os vértices detalhados
      GEO_HINT.test(prepared.text) ? georreferenciamentoService.analyzeGeoreferencing(prepared.text).catch(() => null) : null,
    ]);

    onProgress?.('Conferindo os dados com o documento...', 85);
    const report = normalizeReport(
      {
        extracao: parseAIJson(extracao.text, EXTRACTION_KEYS),
        parecer: parseAIJson(parecer.text, ['parecer_analise']),
        geo,
      },
      {
        source: ocr.text,
        models: [ocr.model, extracao.model, parecer.model],
        truncated: prepared.truncated,
        omittedChars: prepared.omittedChars,
        ocrCut: ocr.cut,
      },
    );

    ocrCacheService.setCachedReport(hash, report);
    lastOcr = null;
    onProgress?.('Análise concluída.', 100);
    return report;
  } catch (error) {
    if (error instanceof IncompleteAnalysisError) throw new AIServiceError(error.message);
    throw error;
  }
}

// Pergunta ao assistente sobre um relatório já gerado
export async function askAboutReport(question: string, report: MatriculaReport): Promise<string> {
  const { _meta, ...content } = report;
  const result = await aiClient.chat(question, JSON.stringify(content).slice(0, 60_000));
  try {
    const answer = parseAIJson(result.text, ['resposta']).resposta;
    return typeof answer === 'string' && answer.trim() ? answer : result.text;
  } catch {
    return result.text;
  }
}
