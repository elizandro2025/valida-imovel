import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY_CONFIG } from '@/config/companyConfig';
import {
  ArrowRight, Brain, Check, CheckCircle2, ChevronRight, Clock, Compass, FileCheck, FileSearch, Gauge,
  Gavel, Landmark, LogOut, Quote, Scale, Search, ShieldAlert, ShieldCheck, TrendingUp, TreePine, Upload, Users, XCircle,
  Building2, FileCode, BookOpen,
} from 'lucide-react';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { Logo } from '@/components/Logo';
import { ScoreRing } from '@/components/ScoreRing';
import { SiteFooter } from '@/components/PublicLayout';
import { JsonLd, faqPage } from '@/components/JsonLd';
import { GUIDES } from '@/content/guides';
import { usePageMeta } from '@/hooks/usePageMeta';

const DISCOVERIES = [
  { icon: Users, title: 'Quem é o dono hoje', text: 'Proprietários atuais, a fração de cada um, o estado civil e o registro que transmitiu o imóvel.' },
  { icon: Landmark, title: 'Se o imóvel garante uma dívida', text: 'Hipotecas, alienações fiduciárias e cédulas, separando o que está ativo do que já foi cancelado.' },
  { icon: Gavel, title: 'Se há bloqueio judicial', text: 'Penhoras, indisponibilidades e execuções averbadas, com o número do processo quando consta.' },
  { icon: Clock, title: 'A história do imóvel', text: 'A cadeia dominial completa, do primeiro registro ao último, com datas, valores e partes.' },
  { icon: TreePine, title: 'Restrições e dados rurais', text: 'Usufruto, servidões, cláusulas restritivas, embargo ambiental, CAR, CCIR e georreferenciamento.' },
  { icon: ShieldCheck, title: 'O risco do negócio', text: 'Nota de 0 a 100, os pontos que merecem conferência e as certidões que ainda faltam pedir.' },
];

const TRUST = [
  { icon: Quote, title: 'O trecho da matrícula em cada risco', text: 'Cada risco vem com o texto original que o embasa, marcado como localizado ou não no documento.' },
  { icon: FileSearch, title: 'CPFs e atos conferidos', text: 'CPFs, CNPJs e números de atos (R- e AV-) citados no relatório são procurados no texto lido do PDF.' },
  { icon: XCircle, title: 'Cancelado só com prova', text: 'Um ônus só aparece como cancelado se a matrícula trouxer o ato de cancelamento. Na dúvida, o relatório pede conferência.' },
  { icon: Gauge, title: 'Nota que não esconde ônus', text: 'Com hipoteca ou penhora ativa, a nota de risco nunca fica abaixo do mínimo para aquele caso — e o relatório explica o motivo.' },
];

const STEPS = [
  { title: 'Envie o PDF', text: 'Certidão digital ou escaneada, de qualquer cartório do Brasil, com até 15 MB.' },
  { title: 'A IA lê e confere', text: 'Leitura completa da matrícula, extração dos 12 módulos e conferência com o texto original.' },
  { title: 'Decida com clareza', text: 'Nota de risco, pontos para conferir e relatório em PDF, salvos na sua conta.' },
];

const MODULES = [
  { title: 'Identificação e imóvel', items: ['Matrícula, cartório, comarca, livro e folha', 'Endereço, áreas e confrontações', 'Construções e habite-se averbados'] },
  { title: 'Georreferenciamento e rural', items: ['Certificação SIGEF/INCRA e responsável técnico', 'CAR, CCIR e NIRF/ITR', 'Reserva legal e áreas de preservação'] },
  { title: 'Regimes especiais', items: ['Condomínio, incorporação e fração ideal', 'Loteamento e REURB', 'Marinha, faixa de fronteira e tombamento'] },
  { title: 'Proprietários e cadeia dominial', items: ['Donos atuais, frações e estado civil', 'Transmissões do R-1 ao último ato', 'Valores declarados e títulos'] },
  { title: 'Ônus e restrições', items: ['Hipoteca e alienação fiduciária', 'Penhora, indisponibilidade e execuções', 'Usufruto, servidões e cláusulas'] },
  { title: 'Parecer', items: ['Nota de risco de 0 a 100', 'Explicação para comprador, corretor, banco e advogado', 'Certidões recomendadas para o caso'] },
];

const AUDIENCES = [
  { icon: Scale, title: 'Advogados', text: 'Triagem da matrícula antes do parecer: ônus, cadeia dominial e pontos a investigar, com o ato de cada um.' },
  { icon: Building2, title: 'Corretores e imobiliárias', text: 'Mostre ao cliente, na hora da proposta, quem precisa assinar e o que resolver antes da escritura.' },
  { icon: TrendingUp, title: 'Investidores e leilões', text: 'Veja penhoras, hipotecas e indisponibilidades de cada imóvel do edital antes de dar o lance.' },
  { icon: Compass, title: 'Engenheiros e agrimensores', text: 'Área, confrontações, SIGEF, CAR e CCIR organizados para a regularização fundiária.' },
  { icon: FileCode, title: 'Regularização e despachantes', text: 'Proprietários anteriores, desmembramentos e averbações pendentes para montar o processo.' },
  { icon: Search, title: 'Quem vai comprar', text: 'Entenda, em linguagem simples, o que diz a certidão do imóvel que você quer comprar.' },
];

const FAQS = [
  {
    q: 'O que é a matrícula de um imóvel?',
    a: 'É a ficha oficial do imóvel no Cartório de Registro de Imóveis, com a descrição do imóvel e todos os atos que aconteceram com ele — vendas, heranças, financiamentos, penhoras e cancelamentos — em ordem cronológica.',
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
    a: 'Sim. Há dois relatórios de exemplo, com dados fictícios, que abrem sem cadastro: um imóvel rural regular e um sítio com embargo ambiental e hipoteca ativa.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: `Pagamento único de ${COMPANY_CONFIG.offer.priceFormatted}, via Pix ou cartão, sem renovação automática. O acesso de 3 meses é liberado automaticamente após a confirmação. Se renovar antes do fim, os dias restantes são somados. Você tem 7 dias para desistir com reembolso integral.`,
  },
  {
    q: 'Existe limite de análises?',
    a: `Não há cobrança por documento. Vale o uso justo de até ${COMPANY_CONFIG.offer.fairUseDailyLimit} análises por dia por conta, o que atende com folga a rotina de escritórios e corretores.`,
  },
  {
    q: 'Como meus documentos são tratados?',
    a: 'O PDF é enviado por conexão segura e lido pela API de inteligência artificial do Google. O arquivo não fica guardado nos nossos servidores; o relatório fica salvo na sua conta, em "Minhas análises", e pode ser apagado quando você quiser.',
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
  const ctaLabel = user ? (user.hasSubscription ? 'Minhas análises' : 'Assinar') : 'Criar conta';

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-white pb-16 sm:pb-0 overflow-x-hidden w-full">
      <JsonLd data={{ '@context': 'https://schema.org', ...faqPage(FAQS) }} />

      <div className="w-full bg-card border-b border-border text-center text-[13px] leading-snug text-foreground py-2.5 px-4">
        {COMPANY_CONFIG.offer.period} de acesso por <strong className="font-semibold">{COMPANY_CONFIG.offer.priceFormatted}</strong> — pagamento único, sem renovação automática
        <Link to="/auth?tab=register" className="text-primary underline underline-offset-2 ml-2 whitespace-nowrap">Começar ›</Link>
      </div>

      <header className="sticky top-0 z-50 glass border-x-0 border-t-0 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2 shrink-0" aria-label="Principal">
            <a href="#como-funciona" className="hidden md:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Como funciona</a>
            <Link to="/guia" className="hidden md:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Guias</Link>
            <a href="#preco" className="hidden md:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Preço</a>
            {user ? (
              <button onClick={handleSignOut} className="text-[13px] text-foreground/80 hover:text-foreground px-3 py-3 inline-flex items-center gap-1.5" title={`Sair (${user.email})`}>
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
        {/* Hero */}
        <section className="pt-16 sm:pt-24 pb-16 sm:pb-24 bg-card px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10 text-center">
            <div className="space-y-4 max-w-3xl mx-auto">
              <p className="text-primary text-sm sm:text-base font-semibold">Análise de matrícula de imóvel com IA</p>
              <h1 className="text-[40px] leading-[1.06] sm:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground">
                Entenda qualquer matrícula de imóvel em minutos.
              </h1>
              <p className="text-lg sm:text-2xl text-muted-foreground leading-snug max-w-3xl mx-auto">
                Envie a certidão em PDF e veja quem é o dono hoje, se há hipoteca, alienação fiduciária ou penhora e qual o risco do
                negócio — com o trecho da matrícula que comprova cada ponto.
              </p>
            </div>

            <div className="space-y-5 max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/app?sample=safe" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">Ver exemplo grátis</Button>
                </Link>
                <Link to="/auth?tab=register" className="w-full sm:w-auto">
                  <Button size="lg" variant="link" className="w-full sm:w-auto text-base">Criar conta ›</Button>
                </Link>
              </div>
              <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Exemplo sem cadastro</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Certidões digitais ou escaneadas</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Relatório em PDF</li>
              </ul>
            </div>

            <div className="max-w-4xl mx-auto pt-6 sm:pt-12">
              <div className="bg-card rounded-[28px] shadow-hard ring-1 ring-black/5 overflow-hidden text-left">
                <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-border bg-secondary/70">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" aria-hidden="true" />
                  <span className="ml-2 sm:ml-4 text-xs text-muted-foreground truncate">Matrícula nº 47.912 — exemplo com dados fictícios</span>
                </div>
                <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                  <ScoreRing score={8} level="BAIXO" size={136} />
                  <div className="flex-1 w-full">
                    <dl className="w-full divide-y divide-border">
                      <div className="py-3 first:pt-0 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                        <dt className="text-sm text-muted-foreground">Proprietários atuais</dt>
                        <dd className="text-sm sm:text-base font-medium text-foreground sm:text-right">Carlos E. Faria e Mariana S. Faria <span className="text-muted-foreground font-normal">(R-3)</span></dd>
                      </div>
                      <div className="py-3 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                        <dt className="text-sm text-muted-foreground">Ônus ativos</dt>
                        <dd className="text-sm sm:text-base font-medium text-success sm:text-right">Nenhum identificado</dd>
                      </div>
                      <div className="py-3 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                        <dt className="text-sm text-muted-foreground">Hipoteca de 2014</dt>
                        <dd className="text-sm sm:text-base font-medium text-foreground sm:text-right">Cancelada pela AV-5</dd>
                      </div>
                    </dl>
                    <div className="pt-3 border-t border-border">
                      <Link to="/app?sample=safe" className="inline-flex items-center gap-1 text-primary text-sm sm:text-base font-medium hover:underline py-3">
                        Abrir o relatório completo <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="max-w-2xl mx-auto text-xs text-muted-foreground leading-relaxed">
              Análise automatizada a partir do PDF enviado. Não substitui a certidão atualizada nem a orientação de um advogado.
            </p>
          </div>
        </section>

        {/* O que você descobre */}
        <section id="o-que-descobre" className="py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="O que você descobre"
              title="As respostas que importam antes de fechar negócio."
              subtitle="O ValidaImóvel lê a matrícula inteira, ato por ato, e organiza o que decide uma compra, venda ou financiamento."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {DISCOVERIES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="bg-card rounded-3xl shadow-soft p-6 sm:p-7 space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Diferencial: conferência */}
        <section id="confianca" className="py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Feito para conferir"
              title="Uma IA que mostra de onde tirou cada informação."
              subtitle="Leitura automática não deveria ser um ato de fé. Cada relatório traz as provas e avisa o que não conseguiu confirmar."
            />
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 max-w-5xl mx-auto">
              {TRUST.map(({ icon: Icon, title, text }) => (
                <div key={title} className="bg-secondary rounded-3xl p-6 sm:p-8 flex gap-5">
                  <Icon className="w-7 h-7 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exemplos */}
        <section id="exemplo" className="py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Exemplo gratuito"
              title="Veja um relatório completo antes de assinar."
              subtitle="Dois exemplos com dados fictícios, que abrem sem cadastro."
            />
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="bg-card rounded-3xl shadow-medium ring-2 ring-primary/25 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-success/10 text-success flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">Fazenda regular, 450 ha</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Georreferenciamento certificado, reserva legal averbada e uma hipoteca antiga já cancelada: veja como o relatório separa o que está ativo do que foi quitado.</p>
                </div>
                <Link to="/app?sample=safe"><Button className="w-full">Abrir exemplo</Button></Link>
              </div>
              <div className="bg-card rounded-3xl shadow-soft p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center"><ShieldAlert className="w-5 h-5" /></div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">Sítio com embargo e hipoteca</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Embargo ambiental averbado e hipoteca rural ativa: veja a nota de risco, os riscos identificados e o que fazer antes de comprar.</p>
                </div>
                <Link to="/app?sample=risk"><Button variant="outline" className="w-full">Abrir exemplo com risco</Button></Link>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">Nomes, CPFs e números dos exemplos são fictícios.</p>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader eyebrow="Como funciona" title="Três passos, poucos minutos." />
            <ol className="grid sm:grid-cols-3 gap-8 sm:gap-10">
              {STEPS.map((step, i) => (
                <li key={step.title} className="space-y-3 text-center sm:text-left">
                  <span className="block text-5xl font-semibold text-primary tabular-nums leading-none">{i + 1}</span>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Módulos */}
        <section id="modulos" className="py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Relatório completo"
              title="12 módulos, da identificação ao parecer."
              subtitle="Tudo o que a matrícula informa, organizado em um só lugar — e exportável em PDF."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {MODULES.map(group => (
                <div key={group.title} className="bg-card rounded-3xl shadow-soft p-6 sm:p-7 space-y-3">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{group.title}</h3>
                  <ul className="space-y-2">
                    {group.items.map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Para quem */}
        <section id="para-quem" className="py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader eyebrow="Para quem é" title="Para quem decide com base na matrícula." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {AUDIENCES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="bg-secondary rounded-3xl p-6 sm:p-7 space-y-3">
                  <Icon className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Assistente */}
        <section id="assistente" className="py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-4">
              <p className="text-primary text-sm sm:text-base font-semibold">Assistente</p>
              <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">Pergunte sobre a matrícula. A resposta vem com o ato.</h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Tire dúvidas em português simples — quem precisa assinar, se a hipoteca foi quitada, qual a área — e receba respostas baseadas no relatório daquela matrícula.
              </p>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Cita os registros e averbações sempre que possível</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Avisa quando a informação não está na certidão</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Incluído no plano</li>
              </ul>
            </div>
            <div className="bg-card rounded-3xl shadow-medium p-5 sm:p-7 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0"><Brain className="w-4 h-4" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Assistente da matrícula</p>
                  <p className="text-xs text-muted-foreground truncate">Matrícula nº 47.912 (exemplo)</p>
                </div>
              </div>
              <p className="ml-auto max-w-[85%] w-fit rounded-2xl rounded-tr-md bg-primary text-white px-4 py-2.5 text-sm">Quem precisa assinar a venda?</p>
              <p className="max-w-[92%] rounded-2xl rounded-tl-md bg-secondary px-4 py-3 text-sm text-foreground leading-relaxed">
                Os dois proprietários do R-3, Carlos Eduardo Faria e Mariana Silveira Faria, com 50% cada. Como são casados entre si no regime de comunhão parcial, os dois assinam como vendedores. Não há ônus ativos na matrícula.
              </p>
            </div>
          </div>
        </section>

        {/* Comparativo */}
        <section className="py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader eyebrow="Antes e depois" title="Horas de leitura viram minutos." />
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="bg-secondary rounded-3xl p-6 sm:p-8 space-y-4">
                <h3 className="text-lg font-semibold tracking-tight text-muted-foreground">Leitura manual</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2.5"><XCircle className="w-4 h-4 shrink-0 mt-0.5" /> Folha por folha, muitas vezes em texto datilografado ou manuscrito</li>
                  <li className="flex gap-2.5"><XCircle className="w-4 h-4 shrink-0 mt-0.5" /> Fácil deixar passar uma penhora ou uma averbação de cancelamento</li>
                  <li className="flex gap-2.5"><XCircle className="w-4 h-4 shrink-0 mt-0.5" /> Anotações soltas, difíceis de compartilhar com o cliente</li>
                </ul>
              </div>
              <div className="bg-card rounded-3xl ring-2 ring-primary/25 shadow-medium p-6 sm:p-8 space-y-4">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">Com o ValidaImóvel</h3>
                <ul className="space-y-3 text-sm text-foreground/85">
                  <li className="flex gap-2.5"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Relatório estruturado em poucos minutos</li>
                  <li className="flex gap-2.5"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Cada ônus como ativo, cancelado ou a conferir, com o trecho de origem</li>
                  <li className="flex gap-2.5"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> PDF pronto para compartilhar e histórico salvo na sua conta</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Guias */}
        <section id="guias" className="py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
            <SectionHeader
              eyebrow="Guias"
              title="Aprenda a ler uma matrícula."
              subtitle="Textos curtos sobre o que aparece na certidão e o que conferir antes de assinar."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {GUIDES.map(g => (
                <Link key={g.slug} to={`/guia/${g.slug}`} className="group bg-card rounded-3xl shadow-soft p-6 sm:p-7 space-y-2 hover:ring-1 hover:ring-primary/30 transition-shadow">
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

        {/* Vídeo */}
        <section id="video" className="py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12 text-center">
            <SectionHeader eyebrow="Vídeo" title="Veja o ValidaImóvel em funcionamento." />
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-hard bg-foreground">
              <iframe
                src="https://www.youtube-nocookie.com/embed/QRCzsDTiRd0?rel=0"
                title="Vídeo de demonstração do ValidaImóvel"
                className="w-full h-full border-0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* Preço */}
        <section id="preco" className="py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-[2rem] shadow-medium p-6 sm:p-14 space-y-8 text-center">
              <div className="space-y-3">
                <p className="text-primary text-sm sm:text-base font-semibold">Preço</p>
                <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">Um preço. Três meses. Sem cobrança por documento.</h2>
              </div>
              <div className="space-y-1">
                <p className="text-5xl sm:text-6xl font-semibold tracking-tight text-foreground">{COMPANY_CONFIG.offer.priceFormatted}</p>
                <p className="text-sm text-muted-foreground">
                  pagamento único • equivale a {COMPANY_CONFIG.offer.monthlyEquivalentFormatted}/mês • {COMPANY_CONFIG.offer.paymentMethods}
                </p>
              </div>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-left text-sm text-foreground/85 max-w-xl mx-auto">
                {[
                  `Até ${COMPANY_CONFIG.offer.fairUseDailyLimit} análises por dia, por 90 dias`,
                  'Relatório nos 12 módulos registrais',
                  'Nota de risco com o trecho que a embasa',
                  'Ônus ativos, cancelados e a conferir',
                  'Cadeia dominial e proprietários atuais',
                  'Assistente para perguntas sobre a matrícula',
                  'Relatório em PDF e histórico na conta',
                  'Suporte pelo WhatsApp',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {item}</li>
                ))}
              </ul>
              <div className="space-y-3 max-w-sm mx-auto">
                <Link to={ctaPath} className="block">
                  <Button size="lg" className="w-full gap-2">{user ? ctaLabel : 'Criar conta e assinar'} <ArrowRight className="w-4 h-4" /></Button>
                </Link>
                <p className="text-xs text-muted-foreground">
                  {COMPANY_CONFIG.offer.guaranteeDays} dias para desistir com reembolso integral • Liberação automática após o pagamento • Sem renovação automática
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Perguntas frequentes — respostas sempre no HTML (details) para buscadores e assistentes de IA */}
        <section id="perguntas" className="py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8">
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
      </main>

      <SiteFooter />

      {/* Barra fixa de conversão no celular */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass border-x-0 border-b-0 px-4 py-2.5 sm:hidden flex items-center justify-between gap-3">
        <div className="min-w-0 leading-tight">
          <span className="text-sm font-semibold text-foreground block truncate">{COMPANY_CONFIG.offer.priceFormatted}</span>
          <span className="text-xs text-muted-foreground block truncate">3 meses de acesso</span>
        </div>
        <Link to={ctaPath} className="shrink-0"><Button size="sm">{ctaLabel}</Button></Link>
      </div>

      <WhatsAppSupport variant="floating" className="!bottom-20 sm:!bottom-5" />
    </div>
  );
};

export default LandingPage;
