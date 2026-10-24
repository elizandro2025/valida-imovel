import { describe, expect, it } from 'vitest';
import { GUIDES } from './index';
import { GUIDE_CONTENT } from './content';

describe('guias (SEO e GEO)', () => {
  it('cada guia listado tem conteúdo, e cada conteúdo está listado', () => {
    expect(Object.keys(GUIDE_CONTENT).sort()).toEqual(GUIDES.map(g => g.slug).sort());
  });

  it('slugs e textos de listagem dentro dos limites dos buscadores', () => {
    for (const g of GUIDES) {
      expect(g.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(`${g.title} | ValidaImóvel`.length).toBeLessThanOrEqual(90);
      expect(g.description.length).toBeGreaterThanOrEqual(110);
      expect(g.description.length).toBeLessThanOrEqual(170);
      expect(g.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('resposta rápida citável, seções, perguntas e relacionados válidos', () => {
    const slugs = new Set(GUIDES.map(g => g.slug));
    for (const [slug, content] of Object.entries(GUIDE_CONTENT)) {
      expect(content.summary.length, slug).toBeGreaterThanOrEqual(150);
      expect(content.summary.length, slug).toBeLessThanOrEqual(520);
      expect(content.sections.length, slug).toBeGreaterThanOrEqual(3);
      expect(new Set(content.sections.map(s => s.id)).size, slug).toBe(content.sections.length);
      expect(content.faq.length, slug).toBeGreaterThanOrEqual(3);
      for (const related of content.related) {
        expect(slugs.has(related), `${slug} → ${related}`).toBe(true);
        expect(related).not.toBe(slug);
      }
    }
  });
});
