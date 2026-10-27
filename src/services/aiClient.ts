/**
 * Chamadas à IA pela API do ValidaImóvel. O servidor guarda a chave do Gemini, os prompts e o limite de uso;
 * o navegador só escolhe a etapa (leitura do PDF, extração, parecer, georreferenciamento ou pergunta).
 */
import { authorizedFetch, SessionExpiredError } from './apiClient';

// Erros de disponibilidade da IA (cota, sobrecarga, sessão) — exibidos ao usuário em vez de um relatório vazio
export class AIServiceError extends Error {}

export type AnalysisTask = 'extracao' | 'parecer' | 'geo' | 'projeto';

export interface AIResult {
  text: string;
  model: string | null;
  finishReason: string | null;
}

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: GeminiPart[] }; finishReason?: string }>;
  promptFeedback?: { blockReason?: string };
  error?: string | { message?: string };
}

// Motivos técnicos do Gemini para uma resposta vazia, em palavras que orientam a próxima ação
const BLOCKED = 'O serviço de IA recusou processar este documento. Tente novamente; se continuar, fale com o suporte.';
const EMPTY_REPLY_MESSAGES: Record<string, string> = {
  SAFETY: BLOCKED,
  PROHIBITED_CONTENT: BLOCKED,
  BLOCKLIST: BLOCKED,
  SPII: BLOCKED,
  RECITATION: BLOCKED,
  MAX_TOKENS: 'A resposta da IA foi interrompida por ser longa demais. Tente novamente.',
};

async function callAI(path: string, body: string, contentType: string, timeoutMs = 300_000): Promise<AIResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await authorizedFetch(path, {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body,
      signal: controller.signal,
    });

    const data: GeminiResponse = await response.json().catch(() => ({}));
    if (!response.ok) {
      // Erros da própria API vêm como texto, já em português; erros repassados do Gemini vêm como objeto, em inglês,
      // e ficam só no console (a pessoa recebe uma orientação)
      if (typeof data.error === 'string' && data.error) throw new AIServiceError(data.error);
      console.warn(`Erro da IA (${response.status}):`, data.error);
      throw new AIServiceError(`Não foi possível concluir a análise agora (erro ${response.status}). Tente novamente em alguns minutos; se continuar, fale com o suporte.`);
    }

    const candidate = data.candidates?.[0];
    const text = (candidate?.content?.parts || []).filter(p => !p.thought).map(p => p.text || '').join('');
    if (!text.trim()) {
      const reason = candidate?.finishReason || data.promptFeedback?.blockReason || 'desconhecido';
      console.warn('A IA não retornou conteúdo:', reason);
      throw new AIServiceError(EMPTY_REPLY_MESSAGES[reason] ?? 'A IA não devolveu resposta desta vez. Tente novamente em alguns minutos.');
    }
    return { text, model: response.headers.get('X-AI-Model'), finishReason: candidate?.finishReason ?? null };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AIServiceError(`Tempo limite na análise (${Math.round(timeoutMs / 60_000)} min). Tente novamente.`);
    }
    if (error instanceof SessionExpiredError) throw new AIServiceError(error.message);
    if (error instanceof TypeError) {
      throw new AIServiceError('Falha de conexão com o serviço de IA. Verifique sua internet e tente novamente.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const aiClient = {
  // Corpo = PDF em base64 (o servidor monta o pedido em volta dele sem copiá-lo)
  ocr: (pdfBase64: string, kind: 'matricula' | 'projeto' = 'matricula') =>
    callAI(kind === 'projeto' ? '/api/ai/ocr?kind=projeto' : '/api/ai/ocr', pdfBase64, 'text/plain'),
  task: (task: AnalysisTask, text: string) => callAI('/api/ai/task', JSON.stringify({ task, text }), 'application/json'),
  chat: (question: string, context: string, scope: 'matricula' | 'projeto' = 'matricula') =>
    callAI('/api/ai/chat', JSON.stringify({ question, context, scope }), 'application/json', 120_000),
};

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
