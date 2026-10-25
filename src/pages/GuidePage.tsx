import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/components/PublicLayout';
import { JsonLd, ORGANIZATION_ID, breadcrumb, faqPage } from '@/components/JsonLd';
import { GUIDES, findGuide } from '@/content/guides';
import { GUIDE_CONTENT } from '@/content/guides/content';
import { usePageMeta, SITE_URL } from '@/hooks/usePageMeta';
import NotFound from './NotFound';

const formatDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

const GuidePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const meta = findGuide(slug);
  const content = slug ? GUIDE_CONTENT[slug] : undefined;
  usePageMeta(meta?.title ?? 'Guia não encontrado', `/guia/${slug ?? ''}`, meta?.description, { type: 'article', noindex: !meta });

  if (!meta || !content) return <NotFound />;

  const path = `/guia/${meta.slug}`;
  const related = content.related.map(s => findGuide(s)).filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <PublicLayout>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            headline: meta.title,
            description: meta.description,
            abstract: content.summary,
            inLanguage: 'pt-BR',
            datePublished: meta.updated,
            dateModified: meta.updated,
            author: { '@id': ORGANIZATION_ID },
            publisher: { '@id': ORGANIZATION_ID },
            mainEntityOfPage: `${SITE_URL}${path}`,
            image: `${SITE_URL}/og-image.png`,
          },
          breadcrumb([{ name: 'Início', path: '/' }, { name: 'Guias', path: '/guia' }, { name: meta.shortTitle, path }]),
          faqPage(content.faq),
        ],
      }} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <nav aria-label="Você está em" className="text-xs text-muted-foreground mb-6">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link to="/" className="hover:text-foreground py-3 inline-block">Início</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link to="/guia" className="hover:text-foreground py-3 inline-block">Guias</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-foreground truncate max-w-[60vw]">{meta.shortTitle}</li>
          </ol>
        </nav>

        <article className="space-y-8">
          <header className="space-y-4">
            <h1 className="text-[32px] leading-[1.1] sm:text-5xl font-semibold tracking-tight text-foreground">{meta.title}</h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">{meta.description}</p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" /> {meta.readingMinutes} min de leitura • Atualizado em <time dateTime={meta.updated}>{formatDate(meta.updated)}</time> • Equipe ValidaImóvel
            </p>
          </header>

          <section aria-label="Resposta rápida" className="rounded-3xl bg-card ring-1 ring-black/5 shadow-soft p-6 sm:p-7 space-y-2">
            <p className="text-sm font-semibold text-primary">Resposta rápida</p>
            <p className="text-base sm:text-[17px] leading-relaxed text-foreground">{content.summary}</p>
          </section>

          <nav aria-label="Neste guia" className="text-sm">
            <p className="font-semibold text-foreground mb-2">Neste guia</p>
            <ol className="list-decimal pl-5 space-y-0.5 text-muted-foreground">
              {content.sections.map(s => (
                <li key={s.id}><a href={`#${s.id}`} className="hover:text-primary inline-block py-2.5">{s.title}</a></li>
              ))}
              <li><a href="#perguntas" className="hover:text-primary inline-block py-2.5">Perguntas frequentes</a></li>
            </ol>
          </nav>

          <div className="space-y-10 text-[16px] sm:text-[17px] leading-relaxed text-foreground/85 [&_p+p]:mt-3">
            {content.sections.map(s => (
              <section key={s.id} id={s.id} className="space-y-3 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">{s.title}</h2>
                {s.body}
              </section>
            ))}
          </div>

          <section id="perguntas" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Perguntas frequentes</h2>
            <div className="space-y-2">
              {content.faq.map(f => (
                <details key={f.q} className="group rounded-2xl bg-card ring-1 ring-black/5 px-5 open:pb-4">
                  <summary className="cursor-pointer list-none py-4 font-semibold text-foreground flex items-center justify-between gap-3">
                    <h3 className="text-base">{f.q}</h3>
                    <span className="text-muted-foreground transition-transform group-open:rotate-90" aria-hidden="true">›</span>
                  </summary>
                  <p className="text-[15px] text-foreground/80 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <p className="text-xs text-muted-foreground border-t border-border pt-4">
            Conteúdo informativo, não é orientação jurídica para um caso concreto. Em negócios relevantes, consulte um advogado.
          </p>
        </article>

        <aside className="mt-12 rounded-3xl bg-foreground text-background p-7 sm:p-10 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Tem uma matrícula para analisar?</h2>
          <p className="text-background/80 leading-relaxed">
            Envie o PDF e veja em minutos o dono atual, os ônus ativos e a nota de risco, com o trecho da matrícula que comprova cada ponto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/app?sample=safe"><Button size="lg" className="w-full sm:w-auto bg-background text-foreground hover:bg-background/90">Ver exemplo grátis</Button></Link>
            <Link to="/auth?tab=register" className="inline-flex items-center justify-center gap-1 text-background/90 hover:text-background py-3 px-2">
              Criar conta <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </aside>

        {related.length > 0 && (
          <section className="mt-12 space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Leia também</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {related.map(g => (
                <Link key={g.slug} to={`/guia/${g.slug}`} className="rounded-2xl bg-card ring-1 ring-black/5 p-5 hover:ring-primary/30 transition-shadow space-y-1.5">
                  <p className="font-semibold text-foreground leading-snug">{g.shortTitle}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{g.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </PublicLayout>
  );
};

export default GuidePage;
