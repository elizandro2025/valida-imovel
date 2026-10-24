import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { PublicLayout } from '@/components/PublicLayout';
import { JsonLd, breadcrumb } from '@/components/JsonLd';
import { GUIDES } from '@/content/guides';
import { usePageMeta, SITE_URL } from '@/hooks/usePageMeta';

const GuidesIndexPage: React.FC = () => {
  usePageMeta(
    'Guias sobre matrícula de imóvel',
    '/guia',
    'Guias práticos para entender a matrícula de imóvel: registro e averbação, alienação fiduciária, penhora, certidão de ônus reais e documentos para comprar com segurança.',
  );

  return (
    <PublicLayout>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            name: 'Guias sobre matrícula de imóvel',
            url: `${SITE_URL}/guia`,
            inLanguage: 'pt-BR',
            hasPart: GUIDES.map(g => ({ '@type': 'Article', headline: g.title, url: `${SITE_URL}/guia/${g.slug}` })),
          },
          breadcrumb([{ name: 'Início', path: '/' }, { name: 'Guias', path: '/guia' }]),
        ],
      }} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-10">
        <header className="max-w-2xl space-y-3">
          <p className="text-primary text-sm font-semibold">Guias</p>
          <h1 className="text-[32px] leading-[1.1] sm:text-5xl font-semibold tracking-tight text-foreground">Entenda a matrícula antes de fechar negócio</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Textos curtos e diretos sobre o que aparece na certidão do imóvel e o que conferir antes de comprar, vender ou financiar.
          </p>
        </header>
        <div className="grid sm:grid-cols-2 gap-4">
          {GUIDES.map(g => (
            <Link key={g.slug} to={`/guia/${g.slug}`} className="group rounded-3xl bg-card ring-1 ring-black/5 shadow-soft p-6 sm:p-7 space-y-2 hover:ring-primary/30 transition-shadow">
              <h2 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary">{g.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{g.description}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1"><Clock className="w-3.5 h-3.5" /> {g.readingMinutes} min de leitura</p>
            </Link>
          ))}
        </div>
      </main>
    </PublicLayout>
  );
};

export default GuidesIndexPage;
