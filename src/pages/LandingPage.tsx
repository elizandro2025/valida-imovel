import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY_CONFIG } from '@/config/companyConfig';
import {
  ArrowRight, Ban, BookOpen, Brain, Building2, Check, CheckCircle2, ChevronRight, Compass, FileCode, FileSearch, Gauge, Gavel,
  Landmark, LogOut, Quote, Scale, ShieldCheck, TrendingUp, Users, XCircle, Split, Layers, FileCheck2, Ruler, Sparkles, AlertTriangle
} from 'lucide-react';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { Logo } from '@/components/Logo';
import { ScoreRing } from '@/components/ScoreRing';
import { SiteFooter } from '@/components/PublicLayout';
import { JsonLd, faqPage } from '@/components/JsonLd';
import { MatriculaScan } from '@/components/landing/MatriculaScan';
import { ProjectConferenceShowcase } from '@/components/landing/ProjectConferenceShowcase';
import { RoiCalculator } from '@/components/landing/RoiCalculator';
import { GUIDES } from '@/content/guides';
import { usePageMeta } from '@/hooks/usePageMeta';

const { offer } = COMPANY_CONFIG;
const PRICE_PER_DAY = (offer.priceValue / offer.durationDays).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const STATS = [
  { value: '2 em 1', label: 'matrículas com IA + conferência de projetos' },
  { value: '12', label: 'módulos registrais auditados na matrícula' },
  { value: '6', label: 'procedimentos cartoriais suportados no Hub' },
  { value: PRICE_PER_DAY, label: 'por dia no plano de 30 dias' },
];

const PROCEDURES = [
  {
    icon: Split,
    title: 'Desdobro e Desmembramento',
    description: 'Divisão de lote urbano ou gleba rural com conferência de frente mínima, áreas resultantes e confrontações.',
    badge: 'Urbano e Rural',
  },
  {
    icon: Scale,
    title: 'Usucapião Extrajudicial',
    description: 'Auditoria de posse, cadeia registral da matrícula e conformidade estrita com o Provimento 65 do CNJ.',
    badge: 'Provimento 65 CNJ',
  },
  {
    icon: Ruler,
    title: 'Retificação de Área',
    description: 'Confronto entre a matrícula antiga e o novo levantamento topográfico (Art. 213 da Lei 6.015/73).',
    badge: 'Art. 213 Lei 6.015',
  },
  {
    icon: Layers,
    title: 'Unificação / Remembramento',
    description: 'Fusão de dois ou mais imóveis contíguos com cálculo de fechamento perimétrico unificado.',
    badge: 'Áreas Contíguas',
  },
  {
    icon: Building2,
    title: 'Instituição de Condomínio',
    description: 'Validação de fração ideal, áreas privativas e de uso comum conforme a Lei 4.591/64.',
    badge: 'Fração Ideal',
  },
  {
    icon: FileCheck2,
    title: 'Regularização Fundiária (REURB)',
    description: 'Conferência técnica e documental de núcleos informais consolidados (REURB-S e REURB-E, Lei 13.465).',
    badge: 'Lei 13.465/17',
  },
];

const TWO_PILLARS = [
  {
    id: 'matricula',
    title: 'Análise e Auditoria de Matrículas',
    eyebrow: 'Due diligence imobiliária com IA',
    description: 'Envie o PDF da certidão de qualquer cartório do Brasil e receba em minutos um raio-x completo do imóvel.',
    items: [
      'Leitura inteligente de certidões digitais e escaneadas (até 15 MB)',
      'Identificação de penhoras, hipotecas, alienações e indisponibilidades',
      'Separação rigorosa de gravames ativos vs. baixados com o ato da baixa',
      'Proprietários atuais, cadeia dominial, estado civil e regime de bens',
      'Nota de risco fundamentada com citação literal do trecho do documento',
      'Assistente de IA para responder dúvidas jurídicas sobre a matrícula',
    ],
    ctaText: 'Ver exemplo de matrícula com risco',
    ctaLink: '/app?sample=risk',
    badge: 'Para Corretores, Investidores e Advogados',
  },
  {
    id: 'projetos',
    title: 'Hub de Procedimentos & Projetos',
    eyebrow: 'Engenharia notarial contra notas devolutivas',
    description: 'Confira desdobros, retificações e unificações antes de protocolar no Cartório de Registro de Imóveis.',
    items: [
      'Confronto automático entre Planta Topográfica e Memorial Descritivo',
      'Área e perímetro calculados pelas coordenadas (fórmula de Gauss) e comparados com os declarados',
      'Mapeamento de confrontantes vizinhos e gestão de cartas de anuência',
      'Checklist automatizado da Lei 6.015/73 e normas da Corregedoria',
      'Detecção de divergências de medidas que causariam nota devolutiva',
      'Relatório de conferência para o responsável técnico revisar, em Word ou impressão',
    ],
    ctaText: 'Conhecer o Hub de Procedimentos',
    ctaLink: '/app',
    badge: 'Para Engenheiros, Agrimensores e Regularizadores',
  },
];

const DEVOLUTIVA_CAUSES = [
  {
    // Numeração, não ranking: não há estatística publicada da frequência de cada causa
    stat: '01',
    title: 'Divergência entre Planta e Memorial',
    desc: 'Um azimute ou distância com diferença de centímetros entre o desenho técnico e o texto do memorial gera devolução imediata pelo registrador.',
  },
  {
    stat: '02',
    title: 'Área ou Perímetro que Não Batem',
    desc: 'Área e perímetro declarados diferentes dos que resultam das coordenadas. O ValidaImóvel calcula os dois pelas coordenadas e compara com a planta e o memorial.',
  },
  {
    stat: '03',
    title: 'Confrontante Omitido ou Sem Anuência',
    desc: 'Falta de qualificação completa ou falta de assinatura do vizinho confrontante (ou seus herdeiros) trava a retificação ou desdobro.',
  },
  {
    stat: '04',
    title: 'Gravame Esquecido na Matrícula Mãe',
    desc: 'Indisponibilidade ou alienação ativa na matrícula mãe impede o registro do procedimento até a devida baixa ou anuência do credor.',
  },
];

const LOSSES = [
  {
    icon: Gavel,
    title: 'A penhora que ninguém viu',
    risk: 'Quem compra um imóvel penhorado pode perdê-lo para a dívida do vendedor (fraude à execução, art. 792 do CPC).',
    shows: 'Cada penhora, o processo e se existe ato de cancelamento.',
  },
  {
    icon: Landmark,
    title: 'O financiamento que não acabou',
    risk: 'Com alienação fiduciária ativa, a propriedade fica com o credor até a quitação (Lei 9.514/97).',
    shows: 'Garantias ativas separadas das baixadas, com o ato da baixa.',
  },
  {
    icon: Ban,
    title: 'O bloqueio judicial',
    risk: 'Imóvel com indisponibilidade averbada não pode ser vendido nem dado em garantia enquanto ela valer.',
    shows: 'Indisponibilidades e ações averbadas, com a origem da ordem.',
  },
  {
    icon: Users,
    title: 'A assinatura que faltou',
    risk: 'A venda precisa de todos os proprietários e, conforme o regime de bens, do cônjuge (art. 1.647 do Código Civil).',
    shows: 'Donos atuais, fração de cada um, estado civil e regime de bens.',
  },
];

const STEPS = [
  {
    title: '1. Escolha o trabalho',
    text: 'Selecione entre analisar uma matrícula em PDF ou validar um procedimento técnico (Desdobro, Usucapião, Retificação, etc.).',
  },
  {
    title: '2. Envie os documentos',
    text: 'Certidão de matrícula, planta topográfica ou memorial descritivo. Arquivos digitais ou escaneados de até 15 MB.',
  },
  {
    title: '3. A IA e os cálculos conferem',
    text: 'Extração dos 12 módulos registrais da matrícula; nos projetos, confronto de medidas e cálculo de área e perímetro pelas coordenadas.',
  },
  {
    title: '4. Decida com o relatório completo',
    text: 'Nota de risco fundamentada, divergências apontadas e relatório para exportar: PDF na análise de matrícula, Word na conferência de projetos.',
  },
];

const MODULES = [
  'Identificação da matrícula', 'Características do imóvel', 'Georreferenciamento', 'Regimes especiais',
  'Registro ambiental', 'Imóveis especiais', 'Proprietários atuais', 'Cadeia dominial',
  'Garantias financeiras', 'Penhoras e indisponibilidades', 'Usufruto e servidões', 'Averbações diversas',
];

const TRUST = [
  { icon: Quote, title: 'O trecho em cada risco', text: 'Cada risco vem com o texto original da matrícula, marcado como localizado ou não no documento.' },
  { icon: FileSearch, title: 'CPFs e atos conferidos', text: 'CPFs, CNPJs e números de atos (R- e AV-) citados no relatório são procurados no texto lido do PDF.' },
  { icon: XCircle, title: 'Cancelado só com prova', text: 'Um ônus só aparece como cancelado se a matrícula trouxer o ato de cancelamento. Na dúvida, o relatório pede conferência.' },
  { icon: Gauge, title: 'Cálculos matemáticos exatos', text: 'Área e perímetro pela fórmula de Gauss e confronto das medidas lado a lado, calculados pelo sistema, não pela IA.' },
];

const AUDIENCES = [
  { icon: TrendingUp, title: 'Investidores e leilões', text: 'Antes do lance, veja penhoras, hipotecas e indisponibilidades de cada imóvel do edital em minutos.' },
  { icon: Building2, title: 'Corretores e imobiliárias', text: 'Leia a matrícula na captação, não na véspera da escritura. Saiba quem precisa assinar e evite cancelamentos.' },
  { icon: Compass, title: 'Engenheiros e agrimensores', text: 'Confronte planta × memorial descritivo, calcule área e perímetro pelas coordenadas e corrija antes de protocolar.' },
  { icon: Scale, title: 'Advogados imobiliários', text: 'Comece a due diligence ou a petição de usucapião com a cadeia dominial e o quadro de confrontantes organizados.' },
  { icon: Landmark, title: 'Crédito e financiamento', text: 'Descubra alienação fiduciária ou hipoteca ativa antes de abrir o processo de financiamento bancário.' },
  { icon: FileCode, title: 'Regularizadores e despachantes', text: 'Monte processos de desdobro, REURB e unificação com checklist cartorial e cartas de anuência prontas.' },
];

const FAQS = [
  {
    q: 'O ValidaImóvel faz apenas análise de certidões ou também confere projetos?',
    a: 'O ValidaImóvel é uma plataforma completa que reúne os dois módulos: (1) Leitura e auditoria de certidões de matrícula em PDF com IA, e (2) Hub de Procedimentos e Conferência de Projetos Técnicos, que cruza plantas topográficas com memoriais descritivos e confere os itens de seis procedimentos: desdobro, retificação de área, unificação, estremação, divisão e REURB.',
  },
  {
    q: 'O que é o confronto entre planta e memorial descritivo?',
    a: 'É a conferência automatizada de cada vértice, distância métrica e azimute desenhados na planta contra o texto redigido no memorial descritivo. O sistema aponta se há discrepância de medidas (por exemplo, 28,10 m na planta e 28,50 m no memorial) e calcula área e perímetro pelas coordenadas para comparar com os valores declarados.',
  },
  {
    q: 'Como saber se um imóvel tem penhora, hipoteca ou alienação fiduciária?',
    a: 'Esses ônus aparecem como registros (R-) ou averbações (AV-) na matrícula. O ValidaImóvel lista cada um, indica se está ativo, cancelado ou se precisa de conferência e mostra o trecho da certidão que comprova. Para a escritura, use uma certidão emitida há no máximo 30 dias.',
  },
  {
    q: 'O ValidaImóvel substitui o Responsável Técnico (RT) ou o advogado?',
    a: 'Não. O ValidaImóvel atua como uma ferramenta avançada de pré-auditoria e inteligência. Ele faz o trabalho braçal de leitura, cálculo e conferência e entrega o relatório com as divergências para que o engenheiro, agrimensor, corretor ou advogado faça a validação final e assine.',
  },
  {
    q: 'Quais documentos e certidões são aceitos?',
    a: 'Certidões de matrícula em PDF de qualquer cartório de registro de imóveis do Brasil (digitais ou escaneadas), além de plantas topográficas e memoriais descritivos nos formatos aceitos (PDF, texto e imagem) com até 15 MB.',
  },
  {
    q: 'Quanto tempo leva uma análise?',
    a: 'A leitura da matrícula leva em geral de 1 a 4 minutos. Na conferência de projetos, a leitura dos documentos pela IA leva alguns minutos; os cálculos e o confronto de medidas aparecem na hora.',
  },
  {
    q: 'Como funciona o pagamento e o acesso?',
    a: `Pagamento único de ${offer.priceFormatted} por ${offer.period} de acesso, via Pix ou cartão, sem renovação automática. O plano dá acesso à análise de matrículas (até ${offer.fairUseDailyLimit} por dia) e à conferência de projetos, com limite diário de uso justo. Você tem ${offer.guaranteeDays} dias para desistir com reembolso integral.`,
  },
  {
    q: 'Como meus documentos são tratados?',
    a: `Os arquivos são transmitidos por conexão criptografada (HTTPS/TLS). Nem o PDF nem o relatório ficam guardados nos nossos servidores após a sessão: a análise é processada e exibida na sua tela, permitindo que você baixe o relatório em PDF e Word (.docx).`,
  },
];

const SectionHeader: React.FC<{ eyebrow: string; title: string; subtitle?: string }> = ({ eyebrow, title, subtitle }) => (
  <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
    <p className="text-primary text-sm sm:text-base font-semibold">{eyebrow}</p>
    <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">{title}</h2>
    {subtitle && <p className="text-base sm:text-xl text-muted-foreground leading-relaxed">{subtitle}</p>}
  </div>
);

export const LandingPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [heroMode, setHeroMode] = useState<'matricula' | 'projeto'>('matricula');
  usePageMeta(null, '/');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const ctaPath = user ? (user.hasSubscription ? '/app' : '/pagamento') : '/auth?tab=register';
  const ctaLabel = user ? (user.hasSubscription ? 'Acessar o Hub' : 'Assinar') : 'Criar conta';
  const buyLabel = user?.hasSubscription ? 'Acessar a plataforma' : `Assinar por ${offer.priceFormatted}`;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-white pb-16 sm:pb-0 overflow-x-hidden w-full">
      <JsonLd data={{ '@context': 'https://schema.org', ...faqPage(FAQS) }} />

      {/* Top Banner de Oferta */}
      <div className="w-full bg-card border-b border-border text-center text-[13px] leading-snug text-foreground py-2.5 px-4">
        <strong className="font-semibold">{offer.priceFormatted}</strong> por {offer.period} · matrículas e projetos · {offer.guaranteeDays} dias para desistir
        <Link to="/app?sample=risk" className="text-primary underline underline-offset-2 ml-2 whitespace-nowrap">Ver demonstração ›</Link>
      </div>

      {/* Header Sticky Glass */}
      <header className="sticky top-0 z-50 glass border-x-0 border-t-0 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2 shrink-0" aria-label="Principal">
            <a href="#pilares" className="hidden md:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">O que faz</a>
            <a href="#procedimentos" className="hidden md:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Procedimentos</a>
            <a href="#como-funciona" className="hidden md:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Como funciona</a>
            <a href="#preco" className="hidden md:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Preço</a>
            <Link to="/guia" className="hidden lg:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Guias</Link>
            {user ? (
              <button onClick={handleSignOut} className="text-[13px] text-foreground/80 hover:text-foreground px-3 py-3 inline-flex items-center gap-1.5" title={`Sair (${user.email})`} aria-label="Sair da conta">
                <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sair</span>
              </button>
            ) : (
              <Link to="/auth?tab=login" className="text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Entrar</Link>
            )}
            <Link to={ctaPath}><Button size="sm">{ctaLabel}</Button></Link>
          </nav>
        </div>
      </header>

      <main className="w-full">
        {/* HERO SECTION */}
        <section className="relative isolate overflow-hidden bg-[#0b0b0f] text-white px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
          <div
            className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(0,113,227,0.38),transparent_70%),radial-gradient(40%_40%_at_85%_80%,rgba(191,90,242,0.16),transparent_70%)]"
            aria-hidden="true"
          />
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
            <div className="text-center space-y-4 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/90 border border-white/15 backdrop-blur-md mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#6cb4ff]" />
                Matrículas e projetos conferidos com IA
              </div>
              <h1 className="text-[36px] leading-[1.08] sm:text-6xl lg:text-7xl font-semibold tracking-tight">
                <span className="block text-white/55">Segurança jurídica e técnica:</span>
                da certidão de matrícula à conferência do projeto.
              </h1>
              <p className="text-lg sm:text-2xl text-white/75 leading-snug max-w-3xl mx-auto">
                Descubra penhoras, hipotecas e proprietários em certidões de qualquer cartório do Brasil e faça o confronto automático entre planta e memorial descritivo. Reduza o risco de fraudes e de notas devolutivas.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link to={ctaPath} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-[#0b0b0f] hover:bg-white/90 gap-2 font-medium">
                    {buyLabel} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/app?sample=risk" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white/35 hover:bg-white/10 hover:text-white">
                    Ver exemplo grátis
                  </Button>
                </Link>
              </div>
              <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-white/70 pt-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" /> Leitura de Matrícula (12 Módulos)</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" /> Confronto Planta × Memorial</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" /> Checklists da Lei 6.015/73</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" /> Sem renovação automática</li>
              </ul>
            </div>

            {/* SELETOR INTERATIVO DE DEMONSTRAÇÃO DO HERO */}
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="inline-flex p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                  <button
                    type="button"
                    onClick={() => setHeroMode('matricula')}
                    className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      heroMode === 'matricula'
                        ? 'bg-white text-[#0b0b0f] shadow-medium'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    1. Análise de Matrícula com IA
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroMode('projeto')}
                    className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      heroMode === 'projeto'
                        ? 'bg-white text-[#0b0b0f] shadow-medium'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    2. Conferência de projetos
                  </button>
                </div>
              </div>

              <div className="max-w-5xl mx-auto">
                {heroMode === 'matricula' ? <MatriculaScan /> : <ProjectConferenceShowcase />}
              </div>
            </div>
          </div>
        </section>

        {/* NÚMEROS CONCRETOS */}
        <section className="bg-card border-b border-border px-4 sm:px-6">
          <dl className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-border lg:divide-x">
            {STATS.map(stat => (
              <div key={stat.label} className="py-7 sm:py-9 px-2 text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground tabular-nums">{stat.value}</dd>
                <dd className="text-[13px] sm:text-sm text-muted-foreground mt-1.5">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* OS DOIS GRANDES PILARES INTEGRADOS */}
        <section id="pilares" className="cv-auto py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
            <SectionHeader
              eyebrow="Ecossistema Completo"
              title="Dois grandes pilares em uma única assinatura."
              subtitle="Leia matrículas e confira projetos antes de levar ao cartório, no mesmo plano."
            />
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {TWO_PILLARS.map(p => (
                <div key={p.id} className="reveal bg-card rounded-3xl p-6 sm:p-9 shadow-soft border border-border flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {p.badge}
                    </span>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground">{p.title}</h3>
                      <p className="text-sm font-medium text-primary mt-0.5">{p.eyebrow}</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                    <ul className="space-y-2.5 pt-2">
                      {p.items.map(item => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/85">
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <Link to={p.ctaLink} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                      {p.ctaText} <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCEDIMENTOS SUPORTADOS */}
        <section id="procedimentos" className="cv-auto py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Hub de Procedimentos"
              title="Os procedimentos notariais mais frequentes na palma da mão."
              subtitle="Fluxos guiados passo a passo para simplificar processos complexos perante o Cartório de Registro de Imóveis."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {PROCEDURES.map(proc => {
                const Icon = proc.icon;
                return (
                  <div key={proc.title} className="reveal bg-secondary/60 rounded-3xl p-6 sm:p-7 border border-border/80 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground bg-background px-2.5 py-0.5 rounded-full border border-border">
                          {proc.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{proc.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{proc.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-5 sm:p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center max-w-3xl mx-auto text-xs sm:text-sm text-foreground">
              Possui um caso técnico específico? O <strong>Modo Especialista</strong> do ValidaImóvel permite navegar diretamente entre 10 abas técnicas completas com autonomia total.
            </div>
          </div>
        </section>

        {/* O PROBLEMA DA NOTA DEVOLUTIVA */}
        <section className="cv-auto py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Segurança Registral"
              title="Por que o cartório devolve o seu projeto?"
              subtitle="Muitos pedidos de desdobro e retificação voltam com nota devolutiva por falhas que dava para ver antes do protocolo: medidas diferentes entre planta e memorial, anuências faltando, documentos vencidos."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {DEVOLUTIVA_CAUSES.map(cause => (
                <div key={cause.title} className="reveal bg-card rounded-3xl p-6 border border-border shadow-soft space-y-3">
                  <span className="text-xs font-bold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full inline-block">
                    {cause.stat}
                  </span>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">{cause.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{cause.desc}</p>
                </div>
              ))}
            </div>
            <div className="max-w-4xl mx-auto rounded-3xl bg-secondary/80 border border-border p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="text-base font-semibold text-foreground">Auditoria prévia antes do protocolo</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Com o ValidaImóvel, você envia os documentos técnicos, vê as divergências de medidas e de confrontantes antes do protocolo e exporta o relatório com o que corrigir em cada documento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* O QUE SE PERDE SEM LER A MATRÍCULA */}
        <section id="riscos" className="cv-auto py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Due Diligence"
              title="Um ato esquecido na matrícula pode custar o imóvel inteiro."
              subtitle="A matrícula guarda toda a história jurídica do imóvel. O problema quase nunca está na primeira página."
            />
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {LOSSES.map(({ icon: Icon, title, risk, shows }) => (
                <div key={title} className="reveal bg-background rounded-3xl shadow-soft p-6 sm:p-8 space-y-4 border border-border">
                  <div className="w-11 h-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
                  <p className="text-[15px] text-muted-foreground leading-relaxed">{risk}</p>
                  <p className="flex items-start gap-2 text-[15px] text-foreground border-t border-border pt-4">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-px" />
                    <span><strong className="font-semibold">O ValidaImóvel mostra:</strong> {shows}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="cv-auto py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader eyebrow="Como funciona" title="Da entrada do documento ao relatório final." />
            <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {STEPS.map((step, i) => (
                <li key={step.title} className="reveal space-y-3 text-center sm:text-left">
                  <span className="block text-4xl sm:text-5xl font-semibold text-primary tabular-nums leading-none">{i + 1}</span>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* EXEMPLOS GRATUITOS */}
        <section id="exemplo" className="cv-auto py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Exemplos Prontos"
              title="Três casos práticos. Três veredictos. Teste em 1 clique."
              subtitle="Relatórios e projetos completos com dados simulados, que abrem sem necessidade de cadastro ou cartão."
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Exemplo 1: Matrícula Regular */}
              <div className="reveal bg-background rounded-3xl shadow-soft p-6 sm:p-7 flex flex-col gap-5 border border-border">
                <div className="flex items-center gap-4">
                  <ScoreRing score={8} level="BAIXO" size={84} />
                  <div>
                    <span className="text-[11px] font-semibold text-success uppercase tracking-wider block">Matrícula Regular</span>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">Fazenda Santa Maria</h3>
                    <p className="text-xs text-muted-foreground">450 hectares, Luís Antônio/SP</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/85 flex-1">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> Henrique e Beatriz Prado, 50% cada (R-3)</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> Cédula rural quitada e baixada (AV-6)</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> Georreferenciamento certificado no SIGEF (AV-5)</li>
                </ul>
                <Link to="/app?sample=safe"><Button variant="outline" className="w-full text-xs">Abrir matrícula sem ônus</Button></Link>
              </div>

              {/* Exemplo 2: Matrícula com Risco Crítico */}
              <div className="reveal bg-background rounded-3xl shadow-medium ring-2 ring-destructive/20 p-6 sm:p-7 flex flex-col gap-5 border border-border">
                <div className="flex items-center gap-4">
                  <ScoreRing score={88} level="CRÍTICO" size={84} />
                  <div>
                    <span className="text-[11px] font-semibold text-destructive uppercase tracking-wider block">Risco Crítico</span>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">Sítio Boa Vista</h3>
                    <p className="text-xs text-muted-foreground">120 hectares, Barretos/SP</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/85 flex-1">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> José Carlos da Silva, 100% (R-1)</li>
                  <li className="flex gap-2"><XCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" /> Cédula rural ativa de R$ 480 mil (R-3)</li>
                  <li className="flex gap-2"><XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" /> Embargo ambiental do IBAMA ativo (AV-4)</li>
                </ul>
                <Link to="/app?sample=risk"><Button className="w-full text-xs">Abrir matrícula com risco</Button></Link>
              </div>

              {/* Exemplo 3: Projeto de Desmembramento Rural no Interior de SP */}
              <div className="reveal bg-background rounded-3xl shadow-soft p-6 sm:p-7 flex flex-col gap-5 border border-border md:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-4">
                  <div className="w-[84px] h-[84px] rounded-2xl bg-primary/10 border border-primary/20 text-primary flex flex-col items-center justify-center shrink-0">
                    <Compass className="w-7 h-7" />
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Rural SP</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">Área Rural (Interior)</span>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">Sítio Bela Vista</h3>
                    <p className="text-xs text-muted-foreground">38,93 ha · Piracicaba/SP · dados fictícios</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/85 flex-1">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> Área de 38,9313 ha conferida pelas coordenadas</li>
                  <li className="flex gap-2"><AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" /> Divergência de 40 cm no M-02 a M-03 (Planta × Memorial)</li>
                  <li className="flex gap-2"><AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" /> Falta a anuência do cônjuge de um confrontante</li>
                </ul>
                <Link to="/app?sample=desdobro"><Button variant="outline" className="w-full text-xs">Abrir o projeto de exemplo</Button></Link>
              </div>
            </div>
          </div>
        </section>

        {/* OS 12 MÓDULOS REGISTRAIS */}
        <section id="modulos" className="cv-auto py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Relatório Completo"
              title="12 módulos registrais lidos. Um parecer claro."
              subtitle="Tudo o que a matrícula informa, organizado em um só lugar, mais a nota de risco de 0 a 100 e as certidões complementares necessárias."
            />
            <ol className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {MODULES.map((name, i) => (
                <li key={name} className="reveal bg-secondary rounded-2xl px-4 py-4 sm:px-5 sm:py-5 flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary tabular-nums w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-sm sm:text-[15px] font-medium text-foreground leading-snug">{name}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CONFIANÇA E AUTORIDADE */}
        <section id="confianca" className="cv-auto py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Transparência Total"
              title="Uma tecnologia que mostra de onde tirou cada informação."
              subtitle="Construído sobre a lógica do registro de imóveis brasileiro (Lei 6.015/73) e as normas de georreferenciamento."
            />
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 max-w-5xl mx-auto">
              {TRUST.map(({ icon: Icon, title, text }) => (
                <div key={title} className="reveal bg-background rounded-3xl shadow-soft p-6 sm:p-8 flex gap-5 border border-border">
                  <Icon className="w-7 h-7 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal max-w-5xl mx-auto rounded-3xl border border-border bg-background p-6 sm:p-8 grid sm:grid-cols-[auto_1fr] gap-4 sm:gap-6 items-start">
              <ShieldCheck className="w-7 h-7 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">O que o ValidaImóvel não faz</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Não consulta cartórios em tempo real, não emite certidões e não substitui a certidão atualizada nem a assinatura final de um
                  Responsável Técnico ou advogado. Ele lê e cruza os documentos que você envia e organiza tudo com rigor analítico, para você protocolar com segurança e velocidade.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CALCULADORA DE RETORNO */}
        <section id="retorno" className="cv-auto py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Retorno Sobre o Investimento"
              title="Faça a conta com os seus números."
              subtitle="Quantas horas voltam para a sua rotina e quanto custa uma nota devolutiva que dava para evitar."
            />
            <RoiCalculator />
          </div>
        </section>

        {/* ASSISTENTE DE IA */}
        <section id="assistente" className="cv-auto py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-4">
              <p className="text-primary text-sm sm:text-base font-semibold">Assistente incluído no plano</p>
              <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">Pergunte sobre a matrícula. A resposta vem com o ato.</h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Quem precisa assinar a escritura, se a hipoteca foi baixada, qual a metragem averbada. Pergunte em português simples e receba a resposta fundamentada no texto do documento.
              </p>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Cita os registros e averbações pertinentes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Avisa quando a informação não consta na certidão</li>
              </ul>
            </div>
            <div className="reveal bg-background rounded-3xl shadow-medium p-5 sm:p-7 space-y-4 border border-border">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0"><Brain className="w-4 h-4" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Assistente de Matrícula</p>
                  <p className="text-xs text-muted-foreground truncate">Fazenda Santa Maria (exemplo com dados simulados)</p>
                </div>
              </div>
              <p className="ml-auto max-w-[85%] w-fit rounded-2xl rounded-tr-md bg-primary text-white px-4 py-2.5 text-sm">Quem precisa assinar a venda?</p>
              <p className="max-w-[92%] rounded-2xl rounded-tl-md bg-secondary px-4 py-3 text-sm text-foreground leading-relaxed">
                Os dois proprietários do R-3, Henrique de Almeida Prado e Beatriz Vasconcelos de Almeida Prado, com 50% cada. Como são casados
                no regime de comunhão parcial, ambos assinam a escritura como vendedores. A cédula rural do Banco do Brasil foi baixada
                pela AV-6 e não há ônus impeditivos ativos.
              </p>
            </div>
          </div>
        </section>

        {/* PARA QUEM É */}
        <section id="para-quem" className="cv-auto py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader eyebrow="Público Alvo" title="Feito para profissionais do setor imobiliário e notarial." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {AUDIENCES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="reveal bg-card rounded-3xl p-6 sm:p-7 space-y-3 border border-border shadow-soft">
                  <Icon className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Quer aprender mais sobre certidões?{' '}
              <Link to="/guia/como-ler-matricula" className="text-primary underline underline-offset-2">Consulte nossos guias gratuitos</Link>.
            </p>
          </div>
        </section>

        {/* PREÇO E PLANO ÚNICO */}
        <section id="preco" className="cv-auto py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-background rounded-[2rem] shadow-medium overflow-hidden border border-border">
              <div className="p-6 sm:p-14 space-y-8 text-center">
                <div className="space-y-3">
                  <p className="text-primary text-sm sm:text-base font-semibold">Plano Completo</p>
                  <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">Um plano para todo o ecossistema.</h2>
                </div>
                <div className="space-y-1">
                  <p className="text-6xl sm:text-7xl font-semibold tracking-tight text-foreground">{offer.priceFormatted}</p>
                  <p className="text-sm text-muted-foreground">{offer.period} de acesso · pagamento único · {offer.paymentMethods} · sem renovação automática</p>
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5 text-left text-sm text-foreground/85 max-w-2xl mx-auto">
                  {[
                    `Até ${offer.fairUseDailyLimit} análises de matrícula por dia`,
                    'Hub Central com 6 procedimentos cartoriais',
                    'Confronto automático Planta × Memorial',
                    'Cálculo de área e perímetro pelas coordenadas',
                    'Mapeamento de confrontantes e cartas de anuência',
                    'Checklist da Lei 6.015/73 e CNJ',
                    'Relatório nos 12 módulos registrais',
                    'Assistente de IA para perguntas do imóvel',
                    'Relatórios em PDF (matrícula) e Word (projetos)',
                    'Suporte prioritário pelo WhatsApp',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {item}</li>
                  ))}
                </ul>
                <div className="space-y-3 max-w-sm mx-auto">
                  <Link to={ctaPath} className="block">
                    <Button size="lg" className="w-full gap-2 font-medium">
                      {user ? (user.hasSubscription ? 'Acessar o Hub agora' : 'Assinar agora') : 'Criar conta e assinar'} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground">Liberação automática após o pagamento · Sem mensalidade automática</p>
                </div>
              </div>
              <div className="bg-secondary px-6 py-6 sm:px-14 sm:py-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left border-t border-border">
                <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0"><ShieldCheck className="w-7 h-7" /></div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{offer.guaranteeDays} dias para desistir</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Teste com as suas matrículas e projetos. Se não atender, peça o reembolso integral em até {offer.guaranteeDays} dias pelo WhatsApp de suporte ou por e-mail (direito de arrependimento, art. 49 do CDC).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PERGUNTAS FREQUENTES */}
        <section id="perguntas" className="cv-auto py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-10">
            <SectionHeader eyebrow="Perguntas frequentes" title="Dúvidas comuns sobre o ValidaImóvel." />
            <div className="space-y-2">
              {FAQS.map((faq, index) => (
                <details key={faq.q} open={index === 0} className="group rounded-2xl bg-card border border-border px-5 open:pb-4 shadow-soft">
                  <summary className="cursor-pointer list-none py-4 flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-foreground">{faq.q}</h3>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-90" aria-hidden="true" />
                  </summary>
                  <p className="text-[15px] text-foreground/80 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
            <WhatsAppSupport variant="card" />
          </div>
        </section>

        {/* GUIAS NOTARIAIS */}
        <section id="guias" className="cv-auto py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Guias gratuitos"
              title="Aprenda a ler certidões e procedimentos."
              subtitle="Conteúdos práticos elaborados conforme a legislação registral brasileira."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {GUIDES.map(g => (
                <Link key={g.slug} to={`/guia/${g.slug}`} className="reveal group bg-background rounded-3xl shadow-soft p-6 sm:p-7 space-y-2 border border-border hover:ring-1 hover:ring-primary/30 transition-shadow">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold tracking-tight text-foreground group-hover:text-primary">{g.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{g.description}</p>
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link to="/guia" className="inline-flex items-center gap-1 text-primary font-medium hover:underline py-3">Ver todos os guias <ChevronRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </section>

        {/* CHAMADA FINAL */}
        <section className="cv-auto relative isolate overflow-hidden bg-[#0b0b0f] text-white px-4 sm:px-6 py-20 sm:py-28">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_100%,rgba(0,113,227,0.35),transparent_70%)]" aria-hidden="true" />
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-[32px] leading-[1.1] sm:text-6xl font-semibold tracking-tight">Tem um imóvel ou projeto para validar agora?</h2>
            <p className="text-lg sm:text-xl text-white/75 leading-relaxed">
              Evite riscos de fraude, penhoras ocultas e notas devolutivas no cartório. Em poucos minutos você lê a matrícula e confere o projeto antes de seguir adiante.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to={ctaPath} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-[#0b0b0f] hover:bg-white/90 gap-2 font-medium">{buyLabel} <ArrowRight className="w-4 h-4" /></Button>
              </Link>
              <Link to="/app?sample=risk" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white/35 hover:bg-white/10 hover:text-white">Ver demonstração grátis</Button>
              </Link>
            </div>
            <p className="text-[13px] text-white/60">{offer.guaranteeDays} dias para desistir com reembolso integral · Sem renovação automática</p>
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* BARRA FIXA DE CONVERSÃO MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass border-x-0 border-b-0 px-4 py-2.5 sm:hidden flex items-center justify-between gap-3">
        <div className="min-w-0 leading-tight">
          <span className="text-sm font-semibold text-foreground block truncate">{offer.priceFormatted}</span>
          <span className="text-xs text-muted-foreground block truncate">{offer.period} · {offer.guaranteeDays} dias para desistir</span>
        </div>
        <Link to={ctaPath} className="shrink-0"><Button size="sm">{ctaLabel}</Button></Link>
      </div>

      <WhatsAppSupport variant="floating" className="!bottom-20 sm:!bottom-5" />
    </div>
  );
};

export default LandingPage;
