// Service for SHA-256 File Hashing and Cache Management
export const ocrCacheService = {
  // Generate SHA-256 hash of a file
  async computeHash(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      console.warn('Crypto API error, falling back to name/size hash:', err);
      return `${file.name}_${file.size}_${file.lastModified}`;
    }
  },

  // Get cached report by hash
  getCachedReport(hash: string): any | null {
    try {
      const cached = localStorage.getItem(`valida_cache_${hash}`);
      if (cached) {
        console.log('⚡ Cache Hit! Carregando resultado instantâneo para o hash:', hash);
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Erro ao ler cache:', e);
    }
    return null;
  },

  // Save report to cache
  setCachedReport(hash: string, report: any): void {
    try {
      localStorage.setItem(`valida_cache_${hash}`, JSON.stringify(report));
    } catch (e) {
      console.warn('Erro ao salvar no cache (espaço limite atingido):', e);
    }
  },

  // Clear cache
  clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.startsWith('valida_cache_')) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {
      console.warn('Erro ao limpar cache:', e);
    }
  }
};
