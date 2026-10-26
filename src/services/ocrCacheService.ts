// Identificação do PDF (SHA-256) e limpeza de relatórios que versões anteriores guardavam no navegador.
// As análises não são guardadas: nem no servidor nem no navegador.

const PREFIX = 'valida_cache_';

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

  // Apaga relatórios guardados no navegador por versões anteriores do site (chamado ao abrir o site e ao sair da conta)
  clearCache(): void {
    try {
      Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k));
    } catch {
      // armazenamento indisponível (modo privado): nada a limpar
    }
  },
};
