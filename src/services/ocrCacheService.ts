// Relatórios já analisados neste navegador, por SHA-256 do PDF e pela versão da análise
/* eslint-disable @typescript-eslint/no-explicit-any -- o relatório vem da IA e tem forma livre */
import { PIPELINE_VERSION } from '@/lib/reportNormalizer';

const PREFIX = 'valida_cache_';
const versionedKey = (hash: string) => `${PREFIX}v${PIPELINE_VERSION}_${hash}`;

export const ocrCacheService = {
  async computeHash(file: File): Promise<string> {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      console.warn('Crypto API indisponível, usando nome/tamanho do arquivo:', err);
      return `${file.name}_${file.size}_${file.lastModified}`;
    }
  },

  getCachedReport(hash: string): any | null {
    try {
      const cached = localStorage.getItem(versionedKey(hash));
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  // Guarda o novo e descarta relatórios de versões anteriores da análise (regras e prompts mudaram)
  setCachedReport(hash: string, report: any): void {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX) && !k.startsWith(`${PREFIX}v${PIPELINE_VERSION}_`))
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem(versionedKey(hash), JSON.stringify(report));
    } catch (e) {
      console.warn('Relatório não guardado no navegador (espaço insuficiente):', e);
    }
  },

  clearCache(): void {
    try {
      Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k));
    } catch {
      // armazenamento indisponível (modo privado): nada a limpar
    }
  },
};
