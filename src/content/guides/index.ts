/**
 * Guias públicos (SEO e GEO): só os dados de listagem ficam aqui, para a página inicial e o rodapé
 * não carregarem o texto completo. O conteúdo de cada guia está em ./content.tsx.
 */
export interface GuideMeta {
  slug: string;
  title: string;
  /** Título curto para cartões e links */
  shortTitle: string;
  description: string;
  updated: string; // AAAA-MM-DD
  readingMinutes: number;
}

export const GUIDES: GuideMeta[] = [
  {
    slug: 'como-ler-matricula',
    title: 'Como ler a matrícula de um imóvel',
    shortTitle: 'Como ler uma matrícula',
    description: 'Guia prático para entender a certidão de matrícula: registros e averbações, quem é o dono hoje, hipotecas, penhoras e o que conferir antes de comprar.',
    updated: '2026-10-24',
    readingMinutes: 6,
  },
  {
    slug: 'registro-e-averbacao',
    title: 'Registro e averbação na matrícula: qual a diferença',
    shortTitle: 'Registro x averbação',
    description: 'O que significam R-1, AV-2 e os demais atos da matrícula, quando cada um é usado e por que a compra só vale depois do registro.',
    updated: '2026-10-24',
    readingMinutes: 4,
  },
  {
    slug: 'alienacao-fiduciaria-na-matricula',
    title: 'Alienação fiduciária na matrícula: o que é e como ver se foi quitada',
    shortTitle: 'Alienação fiduciária',
    description: 'Entenda o registro de alienação fiduciária, quem é o dono enquanto o financiamento não termina e como identificar o cancelamento na matrícula.',
    updated: '2026-10-24',
    readingMinutes: 5,
  },
  {
    slug: 'penhora-na-matricula',
    title: 'Penhora na matrícula do imóvel: o que é e quais os riscos',
    shortTitle: 'Penhora na matrícula',
    description: 'O que significa uma penhora, indisponibilidade ou execução averbada na matrícula, os riscos para quem compra e como confirmar o cancelamento.',
    updated: '2026-10-24',
    readingMinutes: 5,
  },
  {
    slug: 'certidao-de-onus-reais',
    title: 'Certidão de ônus reais: o que é, validade e como pedir',
    shortTitle: 'Certidão de ônus reais',
    description: 'Para que serve a certidão de ônus reais, a diferença para a certidão de inteiro teor, o prazo de 30 dias para escritura e como pedir pela internet.',
    updated: '2026-10-24',
    readingMinutes: 4,
  },
  {
    slug: 'documentos-para-comprar-imovel',
    title: 'Documentos e certidões para comprar um imóvel com segurança',
    shortTitle: 'Checklist de compra',
    description: 'Checklist das certidões do imóvel e dos vendedores, o que a concentração na matrícula mudou e os cuidados com imóveis rurais e em condomínio.',
    updated: '2026-10-24',
    readingMinutes: 6,
  },
  {
    slug: 'desdobro-de-lote',
    title: 'Como fazer desdobro e desmembramento de lote sem cair em exigência',
    shortTitle: 'Desdobro de lote',
    description: 'Guia prático para desdobro e desmembramento: requisitos da Lei 6.766, frente mínima, documentos e como evitar exigências no cartório.',
    updated: '2026-10-26',
    readingMinutes: 5,
  },
  {
    slug: 'retificacao-de-area',
    title: 'Retificação de área de imóvel pela Lei 6.015/73: passo a passo',
    shortTitle: 'Retificação de área',
    description: 'Como fazer a retificação de área amigável no Cartório de Registro de Imóveis: planta, memorial descritivo, anuência de confrontantes e prazos.',
    updated: '2026-10-26',
    readingMinutes: 6,
  },
  {
    slug: 'usucapiao-extrajudicial',
    title: 'Usucapião extrajudicial em cartório: documentos, prazos e regras',
    shortTitle: 'Usucapião em cartório',
    description: 'Entenda o passo a passo da usucapião extrajudicial pelo Provimento 65 do CNJ: ata notarial, planta, confrontantes e quando vale a pena fazer.',
    updated: '2026-10-26',
    readingMinutes: 6,
  },
];

export const findGuide = (slug: string | undefined) => GUIDES.find(g => g.slug === slug);
