import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY_CONFIG } from '@/config/companyConfig';
import {
  ArrowRight, Ban, BookOpen, Brain, Building2, Check, CheckCircle2, ChevronRight, Compass, FileCode, FileSearch, Gauge, Gavel,
  Landmark, LogOut, Quote, Scale, ShieldCheck, TrendingUp, Users, XCircle,
} from 'lucide-react';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { Logo } from '@/components/Logo';
import { ScoreRing } from '@/components/ScoreRing';
import { SiteFooter } from '@/components/PublicLayout';
import { JsonLd, faqPage } from '@/components/JsonLd';
import { MatriculaScan } from '@/components/landing/MatriculaScan';
import { RoiCalculator } from '@/components/landing/RoiCalculator';
import { GUIDES } from '@/content/guides';
import { usePageMeta } from '@/hooks/usePageMeta';

const { offer } = COMPANY_CONFIG;
const PRICE_PER_DAY = (offer.priceValue / offer.durationDays).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Textos da página: só o que o produto faz hoje (ver docs/vendas/kit-de-vendas.md, seção 1). Sem travessões.
const STATS = [
  { value: '12', label: 'módulos da matrícula analisados' },
  { value: '1 a 4 min', label: 'por análise, em geral' },
  { value: String(offer.fairUseDailyLimit), label: 'análises por dia no plano' },
  { value: PRICE_PER_DAY, label: 'por dia de acesso' },
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
  { title: 'Envie o PDF', text: 'Certidão digital ou escaneada, de qualquer cartório do Brasil, com até 15 MB.' },
  { title: 'A IA lê ato por ato', text: 'Registros, averbações e cancelamentos, do primeiro ao último, conferidos com o texto do documento.' },
  { title: 'Decida com o relatório', text: 'Nota de risco, o que está ativo, o que conferir e as certidões que ainda faltam pedir.' },
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
  { icon: Gauge, title: 'Nota que não esconde ônus', text: 'Com hipoteca ou penhora ativa, a nota de risco nunca fica abaixo do mínimo para o caso, e o relatório explica o motivo.' },
];

const AUDIENCES = [
  { icon: TrendingUp, title: 'Investidores e leilões', text: 'Antes do lance, veja penhoras, hipotecas e indisponibilidades de cada imóvel do edital.' },
  { icon: Building2, title: 'Corretores e imobiliárias', text: 'Leia a matrícula na captação, não na escritura. Saiba quem precisa assinar e o que resolver antes.' },
  { icon: Scale, title: 'Advogados', text: 'Comece o parecer com a cadeia dominial e os ônus organizados, cada um com o ato e o trecho.' },
  { icon: Landmark, title: 'Crédito e financiamento', text: 'Descubra alienação fiduciária ou hipoteca ativa antes de montar o processo.' },
  { icon: Compass, title: 'Engenheiros e agrimensores', text: 'Área, confrontações, SIGEF, CAR e CCIR organizados para a regularização.' },
  { icon: FileCode, title: 'Regularização e despachantes', text: 'Proprietários anteriores, desmembramentos e averbações pendentes para montar o processo.' },
];

const FAQS = [
  {
    q: 'O que é a matrícula de um imóvel?',
    a: 'É a ficha oficial do imóvel no Cartório de Registro de Imóveis. Ela traz a descrição do imóvel e todos os atos que aconteceram com ele, como vendas, heranças, financiamentos, penhoras e cancelamentos, em ordem cronológica.',
  },
  {
    q: 'Como saber se um imóvel tem penhora, hipoteca ou alienação fiduciária?',
    a: 'Esses ônus aparecem como registros ou averbações na matrícula. O ValidaImóvel lista cada um, indica se está ativo, cancelado ou se precisa de conferência e mostra o trecho da certidão que comprova. Para a escritura, use uma certidão emitida há no máximo 30 dias.',
  },
  {
    q: 'O ValidaImóvel substitui a certidão atualizada ou um advogado?',
    a: 'Não. É uma análise automatizada do PDF que você envia, para ganhar tempo e saber o que investigar. O sistema não consulta cartórios em tempo real nem emite certidões. Confira os pontos decisivos na certidão original e, em negócios relevantes, consulte um advogado.',
  },
  {
    q: 'Quais certidões são aceitas?',
    a: 'Certidões de matrícula em PDF de qualquer cartório do Brasil, digitais ou escaneadas, com até 15 MB. Quanto mais legível o arquivo, melhor a leitura.',
  },
  {
    q: 'Quanto tempo leva a análise?',
    a: 'Em geral de 1 a 4 minutos, conforme o tamanho da matrícula e a demanda do serviço de inteligência artificial.',
  },
  {
    q: 'A análise pode errar?',
    a: 'Pode. A leitura é feita por inteligência artificial e o sistema confere automaticamente CPFs, números de atos e trechos citados, avisando o que não conseguiu confirmar. Mesmo assim, confira os pontos decisivos na certidão.',
  },
  {
    q: 'Posso ver um exemplo antes de pagar?',
    a: 'Sim. Há dois relatórios de exemplo, com dados fictícios, que abrem sem cadastro: uma fazenda sem ônus ativos e um sítio com hipoteca rural e embargo ambiental ativos.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: `Pagamento único de ${offer.priceFormatted} por ${offer.period} de acesso, via Pix ou cartão, sem renovação automática. O acesso é liberado automaticamente após a confirmação. Se renovar antes do fim, os dias restantes são somados. Você tem ${offer.guaranteeDays} dias para desistir com reembolso integral.`,
  },
  {
    q: 'Existe limite de análises?',
    a: `Não há cobrança por documento. Vale o uso justo de até ${offer.fairUseDailyLimit} análises por dia por conta, o que atende com folga a rotina de escritórios e corretores.`,
  },
  {
    q: 'Vale a pena se eu analiso poucas matrículas?',
    a: `Nos ${offer.durationDays} dias você analisa quantas matrículas quiser dentro do uso justo, inclusive a certidão atualizada antes da escritura. Quem analisa várias por mês paga poucos reais por matrícula; use a calculadora desta página com os seus números.`,
  },
  {
    q: 'Como meus documentos são tratados?',
    a: `O PDF é enviado por conexão segura e lido pela API de inteligência artificial do Google${COMPANY_CONFIG.dataPolicy.aiProviderMayUseContent ? '' : ', no plano pago, em que o Google não usa seus documentos para treinar a IA'}. Nem o PDF nem o relatório ficam guardados: a análise aparece só na sua tela e, se quiser guardar, você exporta o relatório em PDF.`,
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
  usePageMeta(null, '/');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const ctaPath = user ? (user.hasSubscription ? '/app' : '/pagamento') : '/auth?tab=register';
  const ctaLabel = user ? (user.hasSubscription ? 'Analisar matrícula' : 'Assinar') : 'Criar conta';
  const buyLabel = user?.hasSubscription ? 'Analisar uma matrícula' : `Assinar por ${offer.priceFormatted}`;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-white pb-16 sm:pb-0 overflow-x-hidden w-full">
      <JsonLd data={{ '@context': 'https://schema.org', ...faqPage(FAQS) }} />

      <div className="w-full bg-card border-b border-border text-center text-[13px] leading-snug text-foreground py-2.5 px-4">
        Plano mensal: <strong className="font-semibold">{offer.priceFormatted}</strong> por {offer.period} · {offer.guaranteeDays} dias para desistir com reembolso integral
        <Link to="/app?sample=risk" className="text-primary underline underline-offset-2 ml-2 whitespace-nowrap">Ver exemplo grátis ›</Link>
      </div>

      <header className="sticky top-0 z-50 glass border-x-0 border-t-0 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2 shrink-0" aria-label="Principal">
            <a href="#como-funciona" className="hidden md:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Como funciona</a>
            <a href="#exemplo" className="hidden md:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Exemplos</a>
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
        {/* Topo: promessa + demonstração animada com os dados do exemplo com risco */}
        <section className="relative isolate overflow-hidden bg-[#0b0b0f] text-white px-4 sm:px-6 pt-14 sm:pt-24 pb-16 sm:pb-24">
          <div
            className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(0,113,227,0.38),transparent_70%),radial-gradient(40%_40%_at_85%_80%,rgba(191,90,242,0.16),transparent_70%)]"
            aria-hidden="true"
          />
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <div className="text-center space-y-5 max-w-4xl mx-auto">
              <p className="text-[#6cb4ff] text-sm sm:text-base font-semibold">Análise de matrícula de imóvel com IA</p>
              <h1 className="text-[38px] leading-[1.06] sm:text-6xl lg:text-7xl font-semibold tracking-tight">
                <span className="block text-white/55">Penhora. Hipoteca. Bloqueio.</span>
                Saiba em minutos o que a matrícula do imóvel diz.
              </h1>
              <p className="text-lg sm:text-2xl text-white/75 leading-snug max-w-3xl mx-auto">
                Envie o PDF da certidão e veja quem é o dono hoje, cada ônus ativo ou cancelado e a nota de risco do negócio.
                Tudo com o trecho da matrícula que comprova.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link to="/app?sample=risk" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-[#0b0b0f] hover:bg-white/90 gap-2">
                    Ver exemplo grátis <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to={ctaPath} className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white/35 hover:bg-white/10 hover:text-white">
                    {buyLabel}
                  </Button>
                </Link>
              </div>
              <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-white/70 pt-1">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" /> Exemplo sem cadastro</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" /> Qualquer cartório do Brasil</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" /> {offer.guaranteeDays} dias para desistir</li>
              </ul>
            </div>

            <div className="max-w-5xl mx-auto">
              <MatriculaScan />
            </div>
          </div>
        </section>

        {/* Números concretos */}
        <section className="bg-card border-b border-border px-4 sm:px-6">
          <dl className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-border lg:divide-x">
            {STATS.map(stat => (
              <div key={stat.label} className="py-8 sm:py-10 px-2 text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground tabular-nums">{stat.value}</dd>
                <dd className="text-[13px] sm:text-sm text-muted-foreground mt-1.5">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* O que se perde sem ler a matrícula */}
        <section id="riscos" className="cv-auto py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="O custo de não ler"
              title="Um ato esquecido na matrícula pode custar o imóvel inteiro."
              subtitle="A matrícula guarda toda a história jurídica do imóvel. O problema quase nunca está na primeira página."
            />
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {LOSSES.map(({ icon: Icon, title, risk, shows }) => (
                <div key={title} className="reveal bg-card rounded-3xl shadow-soft p-6 sm:p-8 space-y-4">
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

        {/* Como funciona */}
        <section id="como-funciona" className="cv-auto py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader eyebrow="Como funciona" title="Do PDF à decisão em poucos minutos." />
            <ol className="grid sm:grid-cols-3 gap-8 sm:gap-10">
              {STEPS.map((step, i) => (
                <li key={step.title} className="reveal space-y-3 text-center sm:text-left">
                  <span className="block text-5xl font-semibold text-primary tabular-nums leading-none">{i + 1}</span>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Exemplos gratuitos: os mesmos relatórios de /app?sample=safe e /app?sample=risk */}
        <section id="exemplo" className="cv-auto py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Exemplos gratuitos"
              title="Dois imóveis. Dois veredictos. Veja antes de pagar."
              subtitle="Relatórios completos com dados fictícios, que abrem sem cadastro."
            />
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="reveal bg-card rounded-3xl shadow-soft p-6 sm:p-8 flex flex-col gap-6">
                <div className="flex items-center gap-5">
                  <ScoreRing score={8} level="BAIXO" size={96} />
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">Fazenda Santa Maria</h3>
                    <p className="text-sm text-muted-foreground">450 hectares, Luís Antônio/SP</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-foreground/85 flex-1">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> Henrique e Beatriz Prado, 50% cada (R-3)</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> Cédula rural do Banco do Brasil quitada e baixada (AV-6)</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> Georreferenciamento certificado no SIGEF (AV-5)</li>
                </ul>
                <Link to="/app?sample=safe"><Button variant="outline" className="w-full">Abrir o relatório sem ônus</Button></Link>
              </div>
              <div className="reveal bg-card rounded-3xl shadow-medium ring-2 ring-destructive/20 p-6 sm:p-8 flex flex-col gap-6">
                <div className="flex items-center gap-5">
                  <ScoreRing score={88} level="CRÍTICO" size={96} />
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">Sítio Boa Vista</h3>
                    <p className="text-sm text-muted-foreground">120 hectares, Barretos/SP</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-foreground/85 flex-1">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> José Carlos da Silva, 100% (R-1)</li>
                  <li className="flex gap-2"><XCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" /> Cédula rural hipotecária ativa, R$ 480 mil (R-3)</li>
                  <li className="flex gap-2"><XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" /> Embargo ambiental do IBAMA ativo (AV-4)</li>
                </ul>
                <Link to="/app?sample=risk"><Button className="w-full">Abrir o relatório com risco</Button></Link>
              </div>
            </div>
          </div>
        </section>

        {/* Os 12 módulos */}
        <section id="modulos" className="cv-auto py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Relatório completo"
              title="12 módulos lidos. Um parecer claro."
              subtitle="Tudo o que a matrícula informa, organizado em um só lugar, mais uma nota de risco de 0 a 100, a explicação para cada perfil e as certidões recomendadas."
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

        {/* Conferência: autoridade pela transparência */}
        <section id="confianca" className="cv-auto py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Feito para conferir"
              title="Uma IA que mostra de onde tirou cada informação."
              subtitle="Construído sobre a lógica do registro de imóveis brasileiro (Lei 6.015/73): registros, averbações e cancelamentos, do primeiro ao último ato."
            />
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 max-w-5xl mx-auto">
              {TRUST.map(({ icon: Icon, title, text }) => (
                <div key={title} className="reveal bg-card rounded-3xl shadow-soft p-6 sm:p-8 flex gap-5">
                  <Icon className="w-7 h-7 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal max-w-5xl mx-auto rounded-3xl border border-border bg-card/60 p-6 sm:p-8 grid sm:grid-cols-[auto_1fr] gap-4 sm:gap-6 items-start">
              <ShieldCheck className="w-7 h-7 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">O que o ValidaImóvel não faz</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Não consulta cartórios em tempo real, não emite certidões e não substitui a certidão atualizada nem a orientação de um
                  advogado. Ele lê o PDF que você envia e organiza o que está escrito ali, para você decidir mais rápido e saber exatamente o que conferir.
                  E não guarda nada: nem o PDF nem o relatório ficam salvos depois da análise.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Calculadora de retorno */}
        <section id="retorno" className="cv-auto py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Retorno"
              title="Faça a conta com os seus números."
              subtitle="Quanto custa cada matrícula, quantas horas voltam para você e com quantas análises o plano se paga."
            />
            <RoiCalculator />
            <p className="text-center text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              E a conta que mais importa: uma comissão de 6% sobre um imóvel de R$ 400 mil são R$ 24 mil. Se uma venda cai na escritura por um
              problema na matrícula, esse valor pagaria mais de 20 anos de plano.
            </p>
          </div>
        </section>

        {/* Assistente: conversa com os dados do exemplo sem ônus */}
        <section id="assistente" className="cv-auto py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-4">
              <p className="text-primary text-sm sm:text-base font-semibold">Assistente incluído no plano</p>
              <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">Pergunte sobre a matrícula. A resposta vem com o ato.</h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Quem precisa assinar, se a hipoteca foi quitada, qual a área. Pergunte em português simples e receba a resposta baseada no
                relatório daquela matrícula.
              </p>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Cita os registros e averbações sempre que possível</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Avisa quando a informação não está na certidão</li>
              </ul>
            </div>
            <div className="reveal bg-card rounded-3xl shadow-medium p-5 sm:p-7 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0"><Brain className="w-4 h-4" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Assistente da matrícula</p>
                  <p className="text-xs text-muted-foreground truncate">Fazenda Santa Maria (exemplo com dados fictícios)</p>
                </div>
              </div>
              <p className="ml-auto max-w-[85%] w-fit rounded-2xl rounded-tr-md bg-primary text-white px-4 py-2.5 text-sm">Quem precisa assinar a venda?</p>
              <p className="max-w-[92%] rounded-2xl rounded-tl-md bg-secondary px-4 py-3 text-sm text-foreground leading-relaxed">
                Os dois proprietários do R-3, Henrique de Almeida Prado e Beatriz Vasconcelos de Almeida Prado, com 50% cada. Eles são casados
                entre si no regime de comunhão parcial, então os dois assinam como vendedores. A cédula rural do Banco do Brasil foi baixada
                pela AV-6 e não há ônus ativos.
              </p>
            </div>
          </div>
        </section>

        {/* Para quem */}
        <section id="para-quem" className="cv-auto py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader eyebrow="Para quem é" title="Para quem decide com base na matrícula." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {AUDIENCES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="reveal bg-secondary rounded-3xl p-6 sm:p-7 space-y-3">
                  <Icon className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Vai comprar um imóvel e quer entender a certidão?{' '}
              <Link to="/guia/como-ler-matricula" className="text-primary underline underline-offset-2">Comece pelo guia gratuito</Link> e veja os exemplos acima.
            </p>
          </div>
        </section>

        {/* Preço e garantia */}
        <section id="preco" className="cv-auto py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-[2rem] shadow-medium overflow-hidden">
              <div className="p-6 sm:p-14 space-y-8 text-center">
                <div className="space-y-3">
                  <p className="text-primary text-sm sm:text-base font-semibold">Preço</p>
                  <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">Um plano mensal. Sem cobrança por documento.</h2>
                </div>
                <div className="space-y-1">
                  <p className="text-6xl sm:text-7xl font-semibold tracking-tight text-foreground">{offer.priceFormatted}</p>
                  <p className="text-sm text-muted-foreground">{offer.period} de acesso · pagamento único · {offer.paymentMethods} · menos de R$ 3,40 por dia</p>
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5 text-left text-sm text-foreground/85 max-w-2xl mx-auto">
                  {[
                    `Até ${offer.fairUseDailyLimit} análises por dia, por ${offer.durationDays} dias`,
                    'Relatório nos 12 módulos registrais',
                    'Nota de risco com o trecho que a embasa',
                    'Ônus ativos, cancelados e a conferir',
                    'Cadeia dominial e proprietários atuais',
                    'Assistente para perguntas sobre a matrícula',
                    'Relatório em PDF para baixar',
                    'Suporte pelo WhatsApp',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {item}</li>
                  ))}
                </ul>
                <div className="space-y-3 max-w-sm mx-auto">
                  <Link to={ctaPath} className="block">
                    <Button size="lg" className="w-full gap-2">{user ? (user.hasSubscription ? 'Analisar uma matrícula' : 'Assinar agora') : 'Criar conta e assinar'} <ArrowRight className="w-4 h-4" /></Button>
                  </Link>
                  <p className="text-xs text-muted-foreground">Liberação automática após o pagamento · Sem renovação automática</p>
                </div>
              </div>
              <div className="bg-secondary px-6 py-6 sm:px-14 sm:py-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0"><ShieldCheck className="w-7 h-7" /></div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">Garantia de {offer.guaranteeDays} dias</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Teste com as suas matrículas. Se não servir para você, peça o reembolso em até {offer.guaranteeDays} dias e receba 100% do valor de volta.
                    E como não há renovação automática, você nunca é cobrado sem pedir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Perguntas frequentes: respostas sempre no HTML (details) para buscadores e assistentes de IA */}
        <section id="perguntas" className="cv-auto py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-10">
            <SectionHeader eyebrow="Perguntas frequentes" title="Dúvidas sobre matrícula e sobre o ValidaImóvel." />
            <div className="space-y-2">
              {FAQS.map((faq, index) => (
                <details key={faq.q} open={index === 0} className="group rounded-2xl bg-secondary px-5 open:pb-4">
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

        {/* Guias */}
        <section id="guias" className="cv-auto py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Guias gratuitos"
              title="Aprenda a ler uma matrícula."
              subtitle="Textos curtos sobre o que aparece na certidão e o que conferir antes de assinar."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {GUIDES.map(g => (
                <Link key={g.slug} to={`/guia/${g.slug}`} className="reveal group bg-card rounded-3xl shadow-soft p-6 sm:p-7 space-y-2 hover:ring-1 hover:ring-primary/30 transition-shadow">
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

        {/* Chamada final: urgência real (a certidão para escritura vale 30 dias) */}
        <section className="cv-auto relative isolate overflow-hidden bg-[#0b0b0f] text-white px-4 sm:px-6 py-20 sm:py-28">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_100%,rgba(0,113,227,0.35),transparent_70%)]" aria-hidden="true" />
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-[32px] leading-[1.1] sm:text-6xl font-semibold tracking-tight">Tem uma matrícula na mesa agora?</h2>
            <p className="text-lg sm:text-xl text-white/75 leading-relaxed">
              A certidão para escritura vale 30 dias e o negócio não espera. Em poucos minutos você sabe o que ela diz e o que precisa
              resolver antes de assinar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to={ctaPath} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-[#0b0b0f] hover:bg-white/90 gap-2">{buyLabel} <ArrowRight className="w-4 h-4" /></Button>
              </Link>
              <Link to="/app?sample=risk" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white/35 hover:bg-white/10 hover:text-white">Ver exemplo grátis</Button>
              </Link>
            </div>
            <p className="text-[13px] text-white/60">{offer.guaranteeDays} dias para desistir com reembolso integral · Sem renovação automática</p>
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* Barra fixa de conversão no celular */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass border-x-0 border-b-0 px-4 py-2.5 sm:hidden flex items-center justify-between gap-3">
        <div className="min-w-0 leading-tight">
          <span className="text-sm font-semibold text-foreground block truncate">{offer.priceFormatted}</span>
          <span className="text-xs text-muted-foreground block truncate">{offer.period} · {offer.guaranteeDays} dias de garantia</span>
        </div>
        <Link to={ctaPath} className="shrink-0"><Button size="sm">{ctaLabel}</Button></Link>
      </div>

      <WhatsAppSupport variant="floating" className="!bottom-20 sm:!bottom-5" />
    </div>
  );
};

export default LandingPage;
