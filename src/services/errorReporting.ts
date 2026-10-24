/**
 * Envia erros do navegador para o log da API (Workers Logs), para sabermos quando algo quebra para o cliente.
 * Sem dados pessoais: só mensagem, pilha, página e navegador. No máximo 5 envios por carregamento de página.
 */
import { API_BASE_URL } from './apiClient';

let sent = 0;

export function reportClientError(error: unknown, context = '') {
  if (sent >= 5 || typeof window === 'undefined' || window.location.hostname === 'localhost') return;
  sent++;

  const err = error instanceof Error ? error : new Error(String(error));
  const body = JSON.stringify({
    context,
    message: err.message.slice(0, 500),
    stack: (err.stack || '').slice(0, 2000),
    page: window.location.pathname,
    userAgent: navigator.userAgent.slice(0, 200),
  });

  try {
    fetch(`${API_BASE_URL}/api/client-error`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, keepalive: true })
      .catch(() => undefined);
  } catch {
    // registro de erro nunca pode causar outro erro
  }
}

export function installGlobalErrorReporting() {
  window.addEventListener('error', event => reportClientError(event.error ?? event.message, 'window.onerror'));
  window.addEventListener('unhandledrejection', event => reportClientError(event.reason, 'unhandledrejection'));
}
