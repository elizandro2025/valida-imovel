import React from 'react';

// Dados estruturados (schema.org). O "<" é escapado para o JSON não fechar a tag <script> por engano.
export const JsonLd: React.FC<{ data: object }> = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
);

export const ORGANIZATION_ID = 'https://validaimovel.com/#organization';

export const breadcrumb = (items: Array<{ name: string; path: string }>) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `https://validaimovel.com${item.path}`,
  })),
});

export const faqPage = (faq: Array<{ q: string; a: string }>) => ({
  '@type': 'FAQPage',
  mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});
