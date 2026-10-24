import { useEffect } from 'react';

const SITE = 'https://validaimovel.com';
const DEFAULT_TITLE = 'ValidaImóvel — Análise de Matrícula Imobiliária com IA';

// Título da aba e URL canônica por página (o index.html traz os valores da página inicial)
export function usePageMeta(title: string | null, path: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ValidaImóvel` : DEFAULT_TITLE;

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${SITE}${path}`;

    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previous = meta?.content;
    if (meta && description) meta.content = description;

    return () => {
      if (meta && description && previous) meta.content = previous;
    };
  }, [title, path, description]);
}
