import { useEffect } from 'react';

export const SITE_URL = 'https://validaimovel.com';
export const DEFAULT_TITLE = 'Análise de matrícula e conferência de projetos com IA | ValidaImóvel';
export const DEFAULT_DESCRIPTION =
  'Envie a matrícula em PDF e veja donos, hipotecas, penhoras e a nota de risco. Confira planta, memorial, área e vizinhos do projeto antes do cartório.';

interface PageMetaOptions {
  type?: 'website' | 'article';
  /** Telas de conta e pagamento: fora dos buscadores */
  noindex?: boolean;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/**
 * Título, descrição, canonical, Open Graph, Twitter e robots por página.
 * No build, as páginas públicas são pré-renderizadas com estes valores (scripts/prerender.mjs),
 * então buscadores e assistentes de IA recebem o HTML certo sem executar JavaScript.
 */
export function usePageMeta(title: string | null, path: string, description?: string, options: PageMetaOptions = {}) {
  const { type = 'website', noindex = false } = options;

  useEffect(() => {
    const fullTitle = title ? `${title} | ValidaImóvel` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = `${SITE_URL}${path === '/' ? '/' : path}`;

    document.title = fullTitle;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
  }, [title, path, description, type, noindex]);
}
