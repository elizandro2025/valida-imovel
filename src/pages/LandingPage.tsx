import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, BookOpen, Check, ChevronRight, Compass, FileSearch, Lock, Ruler, ShieldCheck, Sparkles, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY_CONFIG } from '@/config/companyConfig';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { ScoreRing } from '@/components/ScoreRing';
import { SiteFooter } from '@/components/PublicLayout';
import { JsonLd, faqPage } from '@/components/JsonLd';
import { MatriculaScan } from '@/components/landing/MatriculaScan';
import { ProjectScan } from '@/components/landing/ProjectScan';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FeatureExplorer } from '@/components/landing/FeatureExplorer';
import { AudiencePicker } from '@/components/landing/AudiencePicker';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { SectionHeader, StatusChip } from '@/components/landing/LandingPrimitives';
import {
  BEFORE_AFTER, FAQS, LANDING_PROCEDURES, LOGIN_OPTIONS, METHOD_LABELS, PLAN_INCLUDES, PRICE_FACTS, VERIFICATION_GROUPS,
} from '@/content/landing';
import type { Method, ModuleId } from '@/content/landing';
import { GUIDES } from '@/content/guides';
import { usePageMeta } from '@/hooks/usePageMeta';

const { offer } = COMPANY_CONFIG;
const PRICE_PER_DAY = (offer.priceValue / offer.durationDays).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const METHOD_STYLE: Record<Method, string> = {
  ia: 'bg-[#bf5af2]/10 text-[#8e3dbf]',
  calculo: 'bg-primary/10 text-primary',
  regra: 'bg-success/10 text-success',
};

const MODULE_CARDS: { id: ModuleId; icon: React.ElementType; title: string; text: string; outputs: string[]; sample: { to: string; label: string } }[] = [
  {
    id: 'matricula',
    icon: FileSearch,
    title: 'Análise de matrícula',
    text: 'Envie a certidão em PDF e saiba quem é dono, o que pesa sobre o imóvel e qual o risco, com o trecho que comprova cada ponto.',
    outputs: ['Donos atuais, fração e regime de bens', 'Hipotecas, penhoras e indisponibilidades ativas ou canceladas', 'Nota de risco de 0 a 100 e relatório em PDF'],
    sample: { to: '/app?sample=risk', label: 'Ver uma matrícula com risco' },
  },
  {
    id: 'projeto',
    icon: Ruler,
    title: 'Conferência de projetos',
    text: 'Envie planta, memorial, matrícula e coordenadas e veja o que o cartório pode exigir antes de protocolar.',
    outputs: ['Área e perímetro calculados pelas coordenadas', 'Planta × memorial e nomes dos vizinhos comparados', 'Checklist do procedimento e relatório em Word'],
    sample: { to: '/app?sample=desdobro', label: 'Ver o projeto de exemplo' },
  },
];

const SAMPLES = [
  {
    to: '/app?sample=safe',
    score: 8, level: 'BAIXO' as const, tag: 'Matrícula regular', tagClass: 'text-success',
    title: 'Fazenda Santa Maria', place: '450 ha · Luís Antônio/SP',
    items: [
      { tone: 'ok', text: 'Henrique e Beatriz Prado, 50% cada (R-3)' },
      { tone: 'ok', text: 'Cédula rural quitada e baixada (AV-6)' },
      { tone: 'ok', text: 'Georreferenciamento certificado no SIGEF (AV-5)' },
    ],
    cta: 'Abrir a matrícula regular',
  },
  {
    to: '/app?sample=risk',
    score: 88, level: 'CRÍTICO' as const, tag: 'Risco crítico', tagClass: 'text-destructive',
    title: 'Sítio Boa Vista', place: '120 ha · Barretos/SP',
    items: [
      { tone: 'ok', text: 'José Carlos da Silva, 100% (R-1)' },
      { tone: 'warn', text: 'Cédula rural ativa de R$ 480 mil (R-3)' },
      { tone: 'bad', text: 'Embargo ambiental do IBAMA ativo (AV-4)' },
    ],
    cta: 'Abrir a matrícula com risco',
  },
];

const TRUST_COLUMNS = [
  {
    icon: Sparkles,
    title: 'Como cada resultado é feito',
    items: [
      'A IA do Google (API Gemini) lê e interpreta os documentos.',
      'Regras e cálculos do próprio sistema conferem a leitura: atos e CPFs no texto, cancelamentos, nota mínima, área, perímetro, medidas e nomes.',
      'Cada apontamento mostra a origem: o trecho do documento, os dois valores comparados ou o item do checklist.',
    ],
  },
  {
    icon: Lock,
    title: 'O que acontece com os documentos',
    items: [
      'Envio por conexão segura (HTTPS), leitura pela IA do Google; o processamento pode ocorrer fora do Brasil.',
      'O ValidaImóvel não guarda o arquivo nem o relatório. O projeto fica só na aba aberta; para guardar, exporte.',
      'Ficam guardados a conta, os pagamentos e a contagem de uso diário (data e tipo, sem o conteúdo). A exclusão pode ser pedida a qualquer momento.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Os limites da análise',
    items: [
      'Não consulta cartórios nem emite certidões: confere o que você envia. Para escritura, use uma certidão atualizada.',
      'A IA pode ler errado, sobretudo em cópias ruins. Por isso cada ponto traz a origem e os avisos de leitura incompleta.',
      'Não substitui o responsável técnico, o advogado nem a qualificação do Oficial de Registro.',
    ],
  },
];

const HOW_TO_START = [
  { title: 'Crie a conta', text: `${LOGIN_OPTIONS.charAt(0).toUpperCase()}${LOGIN_OPTIONS.slice(1)}.` },
  { title: 'Pague por Pix ou cartão', text: 'O acesso é liberado assim que o pagamento é confirmado.' },
  { title: 'Envie o primeiro documento', text: 'A matrícula ou os documentos do projeto.' },
];

export const LandingPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [heroMode, setHeroMode] = useState<ModuleId>('matricula');
  usePageMeta(null, '/');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Cada visitante vai para o próximo passo do fluxo que já existe: cadastro, pagamento ou o app
  const ctaPath = user ? (user.hasSubscription ? '/app' : '/pagamento') : '/auth?tab=register';
  const ctaShort = user ? (user.hasSubscription ? 'Abrir o app' : 'Assinar') : 'Criar conta';
  const ctaLong = user ? (user.hasSubscription ? 'Abrir o ValidaImóvel' : `Assinar por ${offer.priceFormatted}`) : 'Criar conta e começar';

  const primaryCta = ({ dark = false, className = '' }: { dark?: boolean; className?: string } = {}) => (
    <Link to={ctaPath} className={`w-full sm:w-auto ${className}`}>
      <Button size="lg" className={`w-full sm:w-auto gap-2 font-medium ${dark ? 'bg-white text-[#0b0b0f] hover:bg-white/90' : ''}`}>
        {ctaLong} <ArrowRight className="w-4 h-4" />
      </Button>
    </Link>
  );

  return (
    // overflow-x-clip (e não hidden): hidden transformaria a página num contêiner de rolagem e o cabeçalho deixaria de ficar fixo
    <div className="min-h-screen bg-background text-foreground font-sans antialiased pb-16 sm:pb-0 overflow-x-clip w-full">
      <JsonLd data={{ '@context': 'https://schema.org', ...faqPage(FAQS) }} />
      <LandingHeader ctaPath={ctaPath} ctaLabel={ctaShort} userEmail={user?.email ?? null} onSignOut={handleSignOut} />

      <main className="w-full">
        {/* TOPO: o que é, para quem, e o produto funcionando */}
        <section className="relative isolate overflow-hidden bg-[#0b0b0f] text-white px-4 sm:px-6 pt-10 sm:pt-16 pb-16 sm:pb-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(0,113,227,0.36),transparent_70%),radial-gradient(40%_40%_at_90%_85%,rgba(191,90,242,0.14),transparent_70%)]" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 hero-grid" aria-hidden="true" />
          <div className="max-w-6xl mx-auto space-y-9 sm:space-y-12">
            <div className="text-center space-y-5 max-w-4xl mx-auto">
              <p className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/90 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-[#6cb4ff]" aria-hidden="true" />
                Análise de matrículas e projetos com IA
              </p>
              <h1 className="text-[34px] leading-[1.08] sm:text-6xl lg:text-[62px] font-semibold tracking-tight">
                Matrículas e projetos imobiliários conferidos <span className="text-white/55">antes de assinar ou protocolar.</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/75 leading-relaxed max-w-3xl mx-auto">
                Envie a certidão de matrícula ou os documentos do projeto. A IA lê cada página, o sistema confere e calcula, e você recebe
                um relatório com donos, ônus, diferenças entre planta e memorial e o que corrigir, com a origem de cada informação.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                {primaryCta({ dark: true })}
                <a href="#como-funciona" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white/35 hover:bg-white/10 hover:text-white">
                    Ver como funciona
                  </Button>
                </a>
              </div>
              <p className="text-[13px] text-white/60">
                {offer.priceFormatted} por {offer.period} · pagamento único, sem renovação automática · {offer.guaranteeDays} dias para desistir
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-white/60">Veja o que acontece com um documento de exemplo:</p>
                <div className="inline-flex p-1 bg-white/10 rounded-2xl border border-white/15" role="group" aria-label="Demonstração">
                  {([['matricula', 'Análise de matrícula'], ['projeto', 'Conferência de projeto']] as const).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={heroMode === id}
                      onClick={() => setHeroMode(id)}
                      className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors min-h-[40px] ${heroMode === id ? 'bg-white text-[#0b0b0f]' : 'text-white/70 hover:text-white'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-w-5xl mx-auto">
                {heroMode === 'matricula' ? <MatriculaScan /> : <ProjectScan />}
              </div>
              <p className="text-center text-[13px] text-white/55 max-w-3xl mx-auto">
                Para corretores, advogados, compradores e investidores, engenheiros, agrimensores, topógrafos e profissionais de regularização.
              </p>
            </div>
          </div>
        </section>

        {/* OS DOIS MÓDULOS, EM UMA LINHA CADA */}
        <section className="bg-card border-b border-border px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-5 sm:gap-6">
            {MODULE_CARDS.map(({ id, icon: Icon, title, text, outputs, sample }) => (
              <div key={id} className="rounded-3xl bg-secondary/60 p-6 sm:p-8 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Icon className="w-5 h-5" aria-hidden="true" /></span>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
                </div>
                <p className="text-[15px] text-foreground/80 leading-relaxed">{text}</p>
                <ul className="space-y-2 flex-1">
                  {outputs.map(o => (
                    <li key={o} className="flex items-start gap-2 text-sm text-foreground"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />{o}</li>
                  ))}
                </ul>
                <Link to={sample.to} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  {sample.label}, sem cadastro <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="scroll-mt-16 py-16 sm:py-24 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
            <SectionHeader
              eyebrow="Como funciona"
              title="Do documento enviado ao que precisa ser corrigido, em quatro etapas."
              subtitle="Escolha o módulo e toque em cada etapa para ver o que a tela mostra. Os dados são dos exemplos fictícios, que você pode abrir inteiros."
            />
            <HowItWorks />
          </div>
        </section>

        {/* RECURSOS */}
        <section id="recursos" className="scroll-mt-16 cv-auto py-16 sm:py-24 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
            <SectionHeader
              eyebrow="Recursos"
              title="Tudo o que cada módulo entrega."
              subtitle="Cada recurso com o problema que resolve, como funciona e o resultado que aparece no relatório."
            />
            <FeatureExplorer />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {primaryCta()}
              <Link to="/app?sample=desdobro" className="text-sm font-semibold text-primary hover:underline py-2">Abrir o projeto de exemplo</Link>
            </div>
          </div>
        </section>

        {/* O QUE É VERIFICADO */}
        <section id="verificacoes" className="scroll-mt-16 cv-auto py-16 sm:py-24 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
            <SectionHeader
              eyebrow="O que é verificado"
              title="Cada conferência diz quem a fez."
              subtitle="A IA lê; as conferências mais sensíveis são regras e cálculos do próprio sistema, que dão o mesmo resultado toda vez."
            />
            <ul className="flex flex-wrap justify-center gap-2" aria-label="Legenda">
              {(Object.keys(METHOD_LABELS) as Method[]).map(m => (
                <li key={m} className={`rounded-full px-3 py-1 text-xs font-semibold ${METHOD_STYLE[m]}`}>{METHOD_LABELS[m]}</li>
              ))}
            </ul>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {VERIFICATION_GROUPS.map(group => (
                <div key={group.title} className="reveal bg-card rounded-3xl p-6 shadow-soft ring-1 ring-black/5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">{group.title}</h3>
                    <span className="text-[11px] font-medium text-muted-foreground">{group.module === 'matricula' ? 'Matrícula' : 'Projeto'}</span>
                  </div>
                  <ul className="space-y-3">
                    {group.items.map(item => (
                      <li key={item.text} className="space-y-1">
                        <p className="text-sm text-foreground/85 leading-snug">{item.text}</p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${METHOD_STYLE[item.method]}`}>{METHOD_LABELS[item.method]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ANTES E DEPOIS */}
        <section className="cv-auto py-16 sm:py-24 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
            <SectionHeader
              eyebrow="Antes e depois"
              title="O trabalho repetitivo fica com o sistema. A decisão continua com você."
            />
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="rounded-3xl bg-secondary/60 p-6 sm:p-8 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Conferência manual</h3>
                <ul className="space-y-3">
                  {BEFORE_AFTER.before.map(t => (
                    <li key={t} className="flex items-start gap-2.5 text-[15px] text-foreground/75"><XCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-1" aria-hidden="true" />{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-card p-6 sm:p-8 space-y-4 ring-2 ring-primary/25 shadow-medium">
                <h3 className="text-lg font-semibold text-foreground">Com o ValidaImóvel</h3>
                <ul className="space-y-3">
                  {BEFORE_AFTER.after.map(t => (
                    <li key={t} className="flex items-start gap-2.5 text-[15px] text-foreground"><Check className="w-4 h-4 text-primary shrink-0 mt-1" aria-hidden="true" />{t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
              O sistema organiza e aponta; a revisão final, a assinatura e a responsabilidade continuam com o profissional.
            </p>
          </div>
        </section>

        {/* EXEMPLOS PRONTOS */}
        <section id="exemplos" className="scroll-mt-16 cv-auto py-16 sm:py-24 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
            <SectionHeader
              eyebrow="Resultados na prática"
              title="Três casos completos para abrir agora."
              subtitle="Relatórios e projeto inteiros, com dados fictícios, que abrem sem cadastro. Navegue pelas abas como faria com os seus documentos."
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SAMPLES.map(s => (
                <div key={s.to} className="reveal bg-card rounded-3xl shadow-soft ring-1 ring-black/5 p-6 sm:p-7 flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <ScoreRing score={s.score} level={s.level} size={80} />
                    <div className="min-w-0">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider block ${s.tagClass}`}>{s.tag}</span>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{s.title}</h3>
                      <p className="text-xs text-muted-foreground">{s.place} · dados fictícios</p>
                    </div>
                  </div>
                  <ul className="space-y-2.5 text-sm text-foreground/85 flex-1">
                    {s.items.map(item => (
                      <li key={item.text} className="flex gap-2">
                        {item.tone === 'ok' ? <Check className="w-4 h-4 text-success shrink-0 mt-0.5" aria-hidden="true" /> : <XCircle className={`w-4 h-4 shrink-0 mt-0.5 ${item.tone === 'bad' ? 'text-destructive' : 'text-warning'}`} aria-hidden="true" />}
                        {item.text}
                      </li>
                    ))}
                  </ul>
                  <Link to={s.to}><Button variant="outline" className="w-full">{s.cta}</Button></Link>
                </div>
              ))}
              <div className="reveal bg-card rounded-3xl shadow-soft ring-1 ring-black/5 p-6 sm:p-7 flex flex-col gap-5 md:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0">
                    <Compass className="w-7 h-7" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Projeto</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider block text-warning">Diferenças a corrigir</span>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">Sítio Bela Vista</h3>
                    <p className="text-xs text-muted-foreground">38,93 ha · Piracicaba/SP · dados fictícios</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-foreground/85 flex-1">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" aria-hidden="true" />Área de 38,9313 ha conferida pelas coordenadas</li>
                  <li className="flex gap-2"><XCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />40 cm de diferença no lado M-02 → M-03 (planta × memorial)</li>
                  <li className="flex gap-2"><XCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />Anuência incompleta de dois vizinhos</li>
                </ul>
                <Link to="/app?sample=desdobro"><Button variant="outline" className="w-full">Abrir o projeto de exemplo</Button></Link>
              </div>
            </div>
          </div>
        </section>

        {/* PARA QUEM É */}
        <section id="para-quem" className="scroll-mt-16 cv-auto py-16 sm:py-24 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
            <SectionHeader
              eyebrow="Para quem é"
              title="Escolha a sua atividade."
              subtitle="Cada profissão usa o ValidaImóvel de um jeito. Veja o problema que ele ataca no seu dia a dia e por onde começar."
            />
            <AudiencePicker />
          </div>
        </section>

        {/* CONFIANÇA E LIMITES */}
        <section id="confianca" className="scroll-mt-16 cv-auto py-16 sm:py-24 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
            <SectionHeader
              eyebrow="Confiança, limites e responsabilidade"
              title="Uma ferramenta de apoio que mostra de onde tirou cada informação."
            />
            <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
              {TRUST_COLUMNS.map(({ icon: Icon, title, items }) => (
                <div key={title} className="reveal bg-card rounded-3xl p-6 sm:p-7 shadow-soft ring-1 ring-black/5 space-y-4">
                  <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                  <ul className="space-y-3">
                    {items.map(t => <li key={t} className="text-sm text-foreground/80 leading-relaxed">{t}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Detalhes na <Link to="/privacidade" className="text-primary underline underline-offset-2">Política de Privacidade</Link> e nos{' '}
              <Link to="/termos" className="text-primary underline underline-offset-2">Termos de uso</Link>.
            </p>
          </div>
        </section>

        {/* PREÇO */}
        <section id="preco" className="scroll-mt-16 cv-auto py-16 sm:py-24 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
            <SectionHeader eyebrow="Preço" title="Um plano, os dois módulos, sem mensalidade automática." />
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-5 sm:gap-6 items-stretch">
              <div className="bg-background rounded-[2rem] shadow-medium ring-1 ring-black/5 p-6 sm:p-10 flex flex-col gap-7">
                <div className="space-y-2">
                  <StatusChip tone="neutral">{offer.planName}</StatusChip>
                  <p className="text-6xl sm:text-7xl font-semibold tracking-tight text-foreground tabular-nums">{offer.priceFormatted}</p>
                  <p className="text-[15px] text-muted-foreground">
                    {offer.period} de acesso · pagamento único · cerca de {PRICE_PER_DAY} por dia
                  </p>
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-foreground/85">
                  {PLAN_INCLUDES.map(item => (
                    <li key={item} className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />{item}</li>
                  ))}
                </ul>
                <div className="space-y-3 mt-auto">
                  {primaryCta({ className: 'block' })}
                  <p className="text-xs text-muted-foreground">
                    Quer ver antes? <Link to="/app?sample=risk" className="text-primary underline underline-offset-2">Abra um exemplo pronto</Link>, sem cadastro.
                  </p>
                </div>
              </div>
              <div className="space-y-5">
                <dl className="bg-background rounded-[2rem] ring-1 ring-black/5 divide-y divide-border">
                  {PRICE_FACTS.map(f => (
                    <div key={f.title} className="px-6 py-4 sm:px-7 grid grid-cols-[96px_1fr] gap-3">
                      <dt className="text-sm font-semibold text-foreground">{f.title}</dt>
                      <dd className="text-sm text-foreground/80 leading-relaxed">{f.text}</dd>
                    </div>
                  ))}
                </dl>
                <div className="bg-background rounded-[2rem] ring-1 ring-black/5 p-6 sm:p-7 space-y-4">
                  <h3 className="text-base font-semibold text-foreground">Como começar</h3>
                  <ol className="space-y-3">
                    {HOW_TO_START.map((s, i) => (
                      <li key={s.title} className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0 tabular-nums">{i + 1}</span>
                        <span className="text-sm text-foreground/80"><strong className="text-foreground font-semibold">{s.title}.</strong> {s.text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="flex items-start gap-3 px-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-5 h-5 text-success shrink-0" aria-hidden="true" />
                  <span>{offer.guaranteeDays} dias para desistir com reembolso integral, pelo WhatsApp de suporte ou por e-mail.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DÚVIDAS */}
        <section id="duvidas" className="scroll-mt-16 cv-auto py-16 sm:py-24 bg-background px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-10">
            <SectionHeader eyebrow="Dúvidas" title="Perguntas frequentes." />
            <div className="space-y-2">
              {FAQS.map((faq, index) => (
                <details key={faq.q} open={index === 0} className="group rounded-2xl bg-card ring-1 ring-black/5 px-5 open:pb-4">
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

        {/* GUIAS */}
        <section id="guias" className="cv-auto py-16 sm:py-20 bg-card px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
            <SectionHeader eyebrow="Guias gratuitos" title="Aprenda a ler a matrícula e a preparar o projeto." />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GUIDES.map(g => (
                <Link key={g.slug} to={`/guia/${g.slug}`} className="group bg-background rounded-3xl p-6 space-y-2 ring-1 ring-black/5 hover:ring-primary/30 transition-shadow">
                  <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
                  <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary">{g.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{g.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CHAMADA FINAL */}
        <section className="cv-auto relative isolate overflow-hidden bg-[#0b0b0f] text-white px-4 sm:px-6 py-20 sm:py-28">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_100%,rgba(0,113,227,0.35),transparent_70%)]" aria-hidden="true" />
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-[32px] leading-[1.1] sm:text-5xl font-semibold tracking-tight">Tem uma matrícula ou um projeto para conferir?</h2>
            <p className="text-lg text-white/75 leading-relaxed">
              Abra um exemplo pronto agora ou crie a conta e envie o primeiro documento. Em poucos minutos você vê o que está certo e o que precisa de atenção.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {primaryCta({ dark: true })}
              <Link to="/app?sample=risk" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white/35 hover:bg-white/10 hover:text-white">Ver um exemplo pronto</Button>
              </Link>
            </div>
            <p className="text-[13px] text-white/60">
              {offer.priceFormatted} por {offer.period} · {LANDING_PROCEDURES.length} procedimentos de projeto · {offer.guaranteeDays} dias para desistir
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* Barra fixa de conversão no celular */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass border-x-0 border-b-0 px-4 py-2.5 sm:hidden flex items-center justify-between gap-3">
        <div className="min-w-0 leading-tight">
          <span className="text-sm font-semibold text-foreground block truncate">{offer.priceFormatted} · {offer.period}</span>
          <span className="text-xs text-muted-foreground block truncate">Pagamento único · {offer.guaranteeDays} dias para desistir</span>
        </div>
        <Link to={ctaPath} className="shrink-0"><Button size="sm">{ctaShort}</Button></Link>
      </div>

      <WhatsAppSupport variant="floating" className="!bottom-20 sm:!bottom-5" />
    </div>
  );
};

export default LandingPage;
