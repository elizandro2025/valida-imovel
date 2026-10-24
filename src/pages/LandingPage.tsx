import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY_CONFIG } from '@/config/companyConfig';
import {
  ShieldCheck, ArrowRight, Sparkles, Brain, ShieldAlert,
  FileText, CheckCircle2, Zap, Clock, Compass, Lock, User, LogOut,
  ChevronRight, CreditCard, Check, Building2, Scale,
  MessageCircle, AlertCircle, TrendingUp, ThumbsUp,
  Search, Layers, UserCheck, AlertTriangle, FileCode, Instagram
} from 'lucide-react';

import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { Logo } from '@/components/Logo';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ScoreRing } from '@/components/ScoreRing';

export const LandingPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  usePageMeta(null, '/');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeModuleCategory, setActiveModuleCategory] = useState<number>(0);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth?tab=register');
  };

  // SEO Meta & Title setup
  useEffect(() => {
    document.title = "ValidaImóvel — Análise de Matrícula Imobiliária com IA";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'Analise matrículas de imóveis com inteligência artificial. Identifique proprietários, cadeia dominial, ônus, penhoras e pontos de atenção e gere um relatório organizado em PDF.'
    );

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', COMPANY_CONFIG.canonicalUrl);
  }, []);

  // Módulos Categorizados
  const moduleCategories = [
    {
      id: 'parecer-risco',
      label: 'Parecer e risco',
      icon: ShieldAlert,
      title: 'Módulo 1–2: Parecer Executivo & Score de Risco Registral',
      items: [
        'Score de Risco Registral (ex: 8/100 — Baixo Risco) com semáforo visual',
        'Diagnóstico em palavras simples para leigos e especialistas',
        'Resumo dos atos críticos identificados no documento',
        'Pontos de atenção priorizados para análise complementar'
      ]
    },
    {
      id: 'imovel-geo',
      label: 'Imóvel e georreferenciamento',
      icon: Compass,
      title: 'Módulo 3–4: Dados do Imóvel & Georreferenciamento Rural/Urbano',
      items: [
        'Descrição da área total, perímetro e confrontações citadas',
        'Identificação de códigos CAR, CCIR/INCRA e certidão SIGEF no texto',
        'Conferência de averbações de habite-se, reformas e desmembramentos',
        'Identificação do responsável técnico e ART/TRT citados no documento'
      ]
    },
    {
      id: 'regimes-direitos',
      label: 'Regimes e direitos reais',
      icon: Layers,
      title: 'Módulo 5–6: Regime de Bens, Usufrutos & Promessas de Venda',
      items: [
        'Regimes de bens dos proprietários (Comunhão, Separação, Participação)',
        'Reserva ou cancelamento de usufruto gravado na matrícula',
        'Promessas ou compromissos de compra e venda registrados',
        'Outorgas uxórias/maritais e cláusulas restritivas (inalienabilidade)'
      ]
    },
    {
      id: 'proprietarios-cadeia',
      label: 'Proprietários e cadeia dominial',
      icon: UserCheck,
      title: 'Módulo 7–8: Proprietários Atuais & Reconstrução dominial',
      items: [
        'Mapeamento dos proprietários vigentes e respectivas frações ideais',
        'Reconstrução histórica em linha do tempo (R-1 ao último registro)',
        'Extratos de escrituras, inventários, partilhas e doações anteriores',
        'Conferência de qualificações pessoais e CPFs/CNPJs citados'
      ]
    },
    {
      id: 'onus-restricoes',
      label: 'Ônus e restrições',
      icon: Lock,
      title: 'Módulo 9–10: Detecção de Ônus, Penhoras & Gravames',
      items: [
        'Mapeamento de alienações fiduciárias e hipotecas anotadas',
        'Identificação de penhoras judiciais, fiscais ou trabalhistas registradas',
        'Verificação de referências a indisponividades (CNIB) no texto',
        'Alertas sobre servidões, tombamentos ou restrições ambientais'
      ]
    },
    {
      id: 'copiloto-ia',
      label: 'Copiloto de IA',
      icon: Brain,
      title: 'Módulo 11–12: Perguntas & Respostas Registrais + Dossiê PDF',
      items: [
        'Copiloto Registral de IA para responder dúvidas sobre o documento',
        'Emissão de Dossiê Executivo formatado em PDF profissional',
        'Copie qualquer campo com um clique',
        'Recomendações objetivas de certidões e verificações de apoio'
      ]
    }
  ];

  // Públicos Atendidos
  const targetAudiences = [
    {
      title: 'Advogados imobiliários',
      icon: Scale,
      benefit: 'Acelere a fase de triagem inicial de Due Diligence, identificando ônus, alienações e a linha do tempo de transmissões antes de redigir pareceres formais.'
    },
    {
      title: 'Corretores e imobiliárias',
      icon: Building2,
      benefit: 'Apresente um parecer estruturado aos clientes na hora da proposta, demonstrando transparência sobre proprietários e pendências da matrícula.'
    },
    {
      title: 'Leiloeiros e investidores',
      icon: TrendingUp,
      benefit: 'Analise cada certidão do edital em poucos minutos e veja penhoras, hipotecas e indisponibilidades antes de dar o lance.'
    },
    {
      title: 'Engenheiros e agrimensores',
      icon: Compass,
      benefit: 'Extraia rapidamente memoriais descritivos, áreas averbadas e referências ao CAR, CCIR/INCRA e certidões SIGEF para regularização fundiária.'
    },
    {
      title: 'Empresas de regularização',
      icon: FileCode,
      benefit: 'Mapeie proprietários anteriores, doações e averbações de desmembramento para instruir processos administrativos e judiciais.'
    },
    {
      title: 'Compradores de imóveis',
      icon: Search,
      benefit: 'Entenda exatamente o que está escrito na certidão do imóvel que você pretende comprar, em linguagem simples e sem jargões indecifráveis.'
    }
  ];

  const faqs = [
    {
      q: 'O sistema aceita PDFs de cartórios digitais ou escaneados?',
      a: 'Sim. O sistema processa certidões digitais nativas e documentos escaneados de cartórios de todo o Brasil através de extração estruturada de texto registral.'
    },
    {
      q: 'A análise substitui a matrícula atualizada do cartório?',
      a: 'Não. O ValidaImóvel é uma ferramenta de triagem automatizada e apoio à due diligence. Para atos formais e lavratura de escrituras, a certidão oficial expedida pelo Cartório de Registro de Imóveis continua sendo exigida por lei.'
    },
    {
      q: 'Como funciona o pagamento de R$ 49,90 e a liberação?',
      a: 'O pagamento é único, via Pix ou cartão, sem renovação automática. Assim que o pagamento é confirmado, o acesso de 3 meses (90 dias) é liberado automaticamente na sua conta. Se renovar antes do fim, os dias que faltavam são somados.'
    },
    {
      q: 'Existe limite de análises durante os 3 meses?',
      a: `Não há cobrança por documento. Para manter o serviço estável para todos, vale o uso justo de até ${COMPANY_CONFIG.offer.fairUseDailyLimit} análises por dia por conta, o que atende com folga o trabalho de escritórios e corretores.`
    },
    {
      q: 'A análise pode errar?',
      a: 'Pode. A leitura é feita por inteligência artificial e o sistema confere automaticamente CPFs, números de atos e trechos citados, avisando o que não conseguiu confirmar. Mesmo assim, confira os pontos decisivos na certidão e, em negócios relevantes, consulte um advogado.'
    },
    {
      q: 'Como meus documentos são tratados?',
      a: 'O PDF é enviado por conexão segura (HTTPS) e lido pela API de IA do Google. O arquivo não fica guardado nos nossos servidores; o relatório gerado fica salvo na sua conta, em "Minhas análises", e você pode apagá-lo quando quiser. Detalhes na Política de Privacidade.'
    }
  ];

  // Schema JSON-LD
  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": COMPANY_CONFIG.name,
        "operatingSystem": "Web",
        "applicationCategory": "BusinessApplication",
        "description": "Copiloto de análise registral e due diligence imobiliária com inteligência artificial.",
        "offers": {
          "@type": "Offer",
          "price": "49.90",
          "priceCurrency": "BRL",
          "availability": "https://schema.org/InStock"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-white pb-20 sm:pb-0 overflow-x-hidden max-w-[100vw] w-full">
      
      {/* Script JSON-LD de SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} />

      {/* 1. BARRA PROMOCIONAL */}
      <div className="w-full bg-card border-b border-border text-center text-[13px] leading-snug text-foreground py-2.5 px-4">
        {COMPANY_CONFIG.offer.period} de acesso por{' '}
        <strong className="font-semibold">{COMPANY_CONFIG.offer.priceFormatted}</strong>, pagamento único
        <Link to="/auth?tab=register" className="text-primary underline underline-offset-2 ml-2 whitespace-nowrap">Começar ›</Link>
      </div>

      {/* 2. CABEÇALHO */}
      <header className="sticky top-0 z-50 glass border-x-0 border-t-0 text-foreground w-full glass border-x-0 border-t-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2 w-full">

          <Logo />

          {/* Navigation Actions */}
          <nav className="flex items-center gap-1 sm:gap-2 shrink-0" aria-label="Conta">
            <a href="#demonstracao" className="hidden md:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-2.5">Demonstração</a>
            <a href="#oferta" className="hidden md:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-2.5">Preço</a>
            {user ? (
              <>
                <button onClick={handleSignOut} className="text-[13px] text-foreground/80 hover:text-foreground px-3 py-2.5 inline-flex items-center gap-1.5" title={`Sair (${user.email})`}>
                  <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sair</span>
                </button>
                <Link to={user.hasSubscription ? "/app" : "/pagamento"}>
                  <Button size="sm">{user.hasSubscription ? 'Minhas análises' : 'Assinar'}</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth?tab=login" className="text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Entrar</Link>
                <Link to="/auth?tab=register">
                  <Button size="sm">Criar conta</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="w-full max-w-full overflow-x-hidden">
        {/* 3. HERO SECTION RESPONSIVA */}
        <section className="relative pt-16 sm:pt-24 pb-16 sm:pb-24 bg-card text-foreground border-b border-border px-4 sm:px-6 w-full">

          <div className="max-w-5xl mx-auto relative space-y-8 sm:space-y-10 text-center w-full">

            {/* Título Principal & Subtítulo */}
            <div className="space-y-4 max-w-3xl mx-auto w-full">
              <p className="text-primary text-sm sm:text-base font-semibold">Inteligência registral para análise imobiliária</p>
              <h1 className="text-[40px] leading-[1.08] sm:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground break-words">
                Entenda uma matrícula em minutos.
              </h1>
              <p className="text-lg sm:text-2xl text-muted-foreground leading-snug max-w-2xl mx-auto">
                Proprietários, ônus, penhoras e cadeia dominial organizados por inteligência artificial.
              </p>
            </div>

            {/* Botões Principais & Sub-informações */}
            <div className="space-y-5 max-w-xl mx-auto w-full">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <Link to="/app?sample=safe" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Testar demonstração gratuita
                  </Button>
                </Link>
                <Link to="/auth?tab=register" className="w-full sm:w-auto">
                  <Button size="lg" variant="link" className="w-full sm:w-auto text-base">
                    Criar minha conta ›
                  </Button>
                </Link>
              </div>

              {/* Informações abaixo dos botões */}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Sem cadastro para testar</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Demonstração guiada</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Resultado em 12 módulos</span>
              </div>
            </div>

            {/* Visual Realista do Relatório no Hero (SCORE 8/100 + ÔNUS LIMPO) */}
            {/* Prévia do produto: janela com o relatório de exemplo */}
            <div className="max-w-4xl mx-auto pt-6 sm:pt-12 w-full">
              <div className="bg-card rounded-[28px] shadow-hard ring-1 ring-black/5 overflow-hidden text-left w-full">
                <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-border bg-secondary/70">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" aria-hidden="true" />
                  <span className="ml-2 sm:ml-4 text-xs text-muted-foreground truncate">Matrícula nº 47.912 — exemplo com dados fictícios</span>
                </div>
                <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-10">
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
                      <dt className="text-sm text-muted-foreground">Cadeia dominial</dt>
                      <dd className="text-sm sm:text-base font-medium text-foreground sm:text-right">3 atos, do R-1 ao R-3</dd>
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

            {/* Aviso Discreto */}
            <p className="max-w-2xl mx-auto text-xs text-muted-foreground leading-relaxed">
              A análise automatizada auxilia a triagem documental e não substitui matrícula atualizada, certidões oficiais ou orientação profissional.
            </p>

          </div>
        </section>

        {/* 4. FAIXA CURTA DE CONFIANÇA */}
        <section className="py-4 sm:py-6 bg-card border-b border-border px-3 w-full">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-xs sm:text-sm text-muted-foreground text-center">
            <span className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              Conexão protegida por HTTPS/TLS e privacidade assegurada
            </span>
            <span className="flex items-center justify-center gap-1.5">
              <Scale className="w-4 h-4 text-primary shrink-0" />
              Análise estruturada considerando informações registrais e referências normativas aplicáveis
            </span>
          </div>
        </section>

        {/* 5. DEMONSTRAÇÃO INTERATIVA */}
        <section id="demonstracao" className="py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 w-full">
            
            <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
              <p className="text-primary text-sm sm:text-base font-semibold">Teste sem cadastro</p>
              <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">
                Demonstração: análise completa de uma matrícula rural
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground">
                Explore a demonstração prática interativa sem precisar criar conta.
              </p>
            </div>

            {/* Três opções visuais de demonstração */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full">
              
              {/* Opção 1 — Imóvel Regular (Disponível) */}
              <Card className="bg-card border-0 ring-2 ring-primary/25 p-6 sm:p-7 rounded-3xl space-y-4 flex flex-col justify-between shadow-medium relative w-full">
                <div className="space-y-2.5 pt-1">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                    <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Imóvel rural regular (450 ha)</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Demonstração completa com georreferenciamento, código CAR, CCIR/INCRA, certidão SIGEF e 12 módulos estruturados.
                  </p>
                </div>
                <div className="pt-1">
                  <Link to="/app?sample=safe" className="block w-full">
                    <Button className="w-full text-white font-semibold text-xs h-10 sm:h-11 gap-1.5 bg-primary">
                      <Sparkles className="w-3.5 h-3.5" /> <span>Explorar relatório demonstrativo</span>
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Opção 2 — Imóvel com Pontos de Atenção */}
              <Card className="relative bg-transparent border border-dashed border-border shadow-none p-6 sm:p-7 rounded-3xl space-y-4 flex flex-col justify-between w-full">
                <Badge variant="outline" className="border-warning/30 text-warning bg-warning/10 font-semibold text-xs sm:text-xs absolute top-4 right-4">
                  Em breve
                </Badge>
                <div className="space-y-2.5 pt-1">
                  <div className="w-11 h-11 rounded-2xl bg-warning/10 text-warning flex items-center justify-center font-semibold">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Imóvel urbano com pontos de atenção</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Demonstração focada na identificação de usufruto gravado e pendência de averbação de reforma.
                  </p>
                </div>
                <div className="pt-1">
                  <Button disabled variant="outline" className="w-full border-border text-muted-foreground text-xs h-10">
                    Em breve
                  </Button>
                </div>
              </Card>

              {/* Opção 3 — Imóvel com Risco Elevado */}
              <Card className="relative bg-card border-0 shadow-soft p-6 sm:p-7 rounded-3xl space-y-4 flex flex-col justify-between w-full">
                <div className="space-y-2.5 pt-1">
                  <div className="w-11 h-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center font-semibold">
                    <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Sítio com risco elevado</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Demonstração com embargo ambiental averbado e hipoteca rural ainda ativa.
                  </p>
                </div>
                <div className="pt-1">
                  <Link to="/app?sample=risk" className="block w-full">
                    <Button variant="outline" className="w-full text-xs h-10 sm:h-11 gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-destructive" /> <span>Ver exemplo com risco</span>
                    </Button>
                  </Link>
                </div>
              </Card>

            </div>

            {/* Explicação de dados fictícios */}
            <p className="text-center text-xs sm:text-xs text-muted-foreground font-medium">
              Os nomes, números, CPFs, matrículas e informações da demonstração são dados fictícios utilizados apenas para apresentar o funcionamento da plataforma.
            </p>

          </div>
        </section>

        {/* 6. PRINCIPAIS RESULTADOS ENTREGUES */}
        <section className="py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
              <p className="text-primary text-sm sm:text-base font-semibold">O que você recebe</p>
              <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">
                Principais entregas da análise automatizada
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground">
                Tudo o que importa na matrícula, organizado para a sua análise.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
              <Card className="bg-secondary border-0 shadow-none p-6 sm:p-7 rounded-3xl space-y-3 w-full">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Organização da matrícula</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Extração estruturada em 12 módulos de análise registral.
                </p>
              </Card>

              <Card className="bg-secondary border-0 shadow-none p-6 sm:p-7 rounded-3xl space-y-3 w-full">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Identificação de proprietários</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Mapeamento dos titulares atuais e qualificações registradas.
                </p>
              </Card>

              <Card className="bg-secondary border-0 shadow-none p-6 sm:p-7 rounded-3xl space-y-3 w-full">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Reconstrução dominial</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Linha do tempo histórica dos atos de transmissão (R-1 ao R-N).
                </p>
              </Card>

              <Card className="bg-secondary border-0 shadow-none p-6 sm:p-7 rounded-3xl space-y-3 w-full">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Ônus e restrições</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Detecção de alienações, hipotecas, penhoras e indisponividades anotadas no texto.
                </p>
              </Card>

              <Card className="bg-secondary border-0 shadow-none p-6 sm:p-7 rounded-3xl space-y-3 w-full">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Dados urbanos e rurais</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Identificação de códigos CAR, CCIR/INCRA, ITR e certidão SIGEF citados.
                </p>
              </Card>

              <Card className="bg-secondary border-0 shadow-none p-6 sm:p-7 rounded-3xl space-y-3 w-full">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Pontos de atenção</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Score de risco registral e sinalização visual de inconsistências.
                </p>
              </Card>

              <Card className="bg-secondary border-0 shadow-none p-6 sm:p-7 rounded-3xl space-y-3 w-full">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Recomendações práticas</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sugestão de certidões e verificações complementares de apoio.
                </p>
              </Card>

              <Card className="bg-secondary border-0 shadow-none p-6 sm:p-7 rounded-3xl space-y-3 w-full">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Relatório em PDF</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Exportação do parecer em PDF formatado para auditoria.
                </p>
              </Card>
            </div>

          </div>
        </section>

        {/* 7. PRÉVIA DOS 12 MÓDULOS REGISTRAIS (ABAS DESLIZÁVEIS MOBILE) */}
        <section id="modulos" className="py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10 w-full">
            
            <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
              <p className="text-primary text-sm sm:text-base font-semibold">Estrutura do relatório</p>
              <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">
                Organização dos 12 módulos do relatório
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground">
                Navegue pelas categorias e veja exatamente o que a inteligência artificial analisa em cada seção.
              </p>
            </div>

            {/* Categorias das Abas - Touch Momentum Scroll com Suporte a Gestos Mobile */}
            <div className="w-full min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar ios-scroll py-2 px-1 max-w-full text-xs snap-x">
                {moduleCategories.map((cat, idx) => {
                  const Icon = cat.icon;
                  const isActive = activeModuleCategory === idx;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveModuleCategory(idx)}
                      className={`px-3.5 py-2 min-h-[44px] sm:min-h-0 rounded-full text-[13px] font-medium transition-colors flex items-center gap-1.5 shrink-0 border snap-start ${
                        isActive
                          ? 'bg-primary text-white border-primary/30 shadow-soft'
                          : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conteúdo da Aba Ativa */}
            <Card className="bg-card border-0 shadow-soft p-6 sm:p-10 rounded-3xl space-y-4 sm:space-y-5 w-full">
              <h3 className="text-base sm:text-xl font-semibold text-foreground flex items-center gap-2 leading-tight">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span>{moduleCategories[activeModuleCategory].title}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1 w-full">
                {moduleCategories[activeModuleCategory].items.map((item, i) => (
                  <div key={i} className="p-3.5 bg-secondary rounded-2xl flex items-start gap-2.5 text-sm text-foreground/80 w-full">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="break-words">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-xs text-muted-foreground pt-2 border-t border-border">
                <strong className="text-muted-foreground font-semibold">Funcionalidade prática:</strong> Copie qualquer campo extraído com um clique e exporte o relatório completo formatado em PDF.
              </p>
            </Card>

          </div>
        </section>

        {/* 8. COPILOTO REGISTRAL DE IA */}
        <section className="py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
              <p className="text-primary text-sm sm:text-base font-semibold">Interatividade</p>
              <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">
                Converse diretamente com os dados da matrícula
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground">
                Tire dúvidas instantâneas sobre atos, proprietários ou restrições em linguagem natural.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center w-full">
              <div className="lg:col-span-5 space-y-3.5 sm:space-y-4 w-full">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">Assistente de IA</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                  Pergunte em português simples e receba respostas vinculadas aos atos registrais encontrados no documento enviado.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> Respostas orientadas estritamente pelas informações presentes no arquivo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> Dados estruturados para facilitar a conferência</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> Disponível durante toda a sessão de análise</li>
                </ul>
                <div className="pt-1">
                  <Link to="/app?sample=safe" className="block w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-primary hover:bg-primary text-white font-semibold text-xs h-10 px-5 gap-2">
                      <MessageCircle className="w-4 h-4 shrink-0" /> <span>Ver na demonstração</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Chat Simulation Card */}
              <div className="lg:col-span-7 w-full">
                <Card className="bg-secondary border-0 p-5 sm:p-7 rounded-3xl space-y-4 shadow-none w-full">
                  <div className="flex items-center gap-2.5 border-b border-border pb-2.5 w-full min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-white font-semibold shrink-0">
                      <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-foreground truncate">Assistente de IA</h4>
                      <span className="text-xs text-primary font-medium block truncate">Consultando Matrícula Rural Nº 47.912</span>
                    </div>
                  </div>
                  <div className="space-y-2.5 text-xs w-full">
                    <div className="p-2.5 sm:p-3 bg-card rounded-xl sm:rounded-2xl border border-border text-foreground break-words">
                      <strong className="text-foreground">Pergunta:</strong> Quais são os proprietários atuais e existe algum ônus gravado no texto?
                    </div>
                    <div className="p-2.5 sm:p-3 bg-primary/5 border border-primary/20 rounded-xl sm:rounded-2xl text-foreground space-y-1 break-words">
                      <strong className="text-primary">Resposta:</strong> De acordo com as informações presentes no documento analisado, os proprietários atuais são Carlos Eduardo Faria (50%) e Mariana Silveira Faria (50%), conforme R-3. Não foram identificados ônus ativos gravados no documento.
                    </div>
                  </div>
                </Card>
              </div>
            </div>

          </div>
        </section>

        {/* 9. COMO FUNCIONA */}
        <section id="como-funciona" className="py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
              <p className="text-primary text-sm sm:text-base font-semibold">Como funciona</p>
              <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">
                Como funciona a análise em 4 passos
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground">
                Sem instalação de software, 100% online no seu navegador.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
              <Card className="bg-card border-0 shadow-soft p-6 sm:p-7 rounded-3xl space-y-3 w-full">
                <span className="block text-4xl font-semibold text-primary tabular-nums leading-none">1</span>
                <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Envie o PDF</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Faça o upload do documento da matrícula em PDF no sistema.
                </p>
              </Card>

              <Card className="bg-card border-0 shadow-soft p-6 sm:p-7 rounded-3xl space-y-3 w-full">
                <span className="block text-4xl font-semibold text-primary tabular-nums leading-none">2</span>
                <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Processamento</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A inteligência artificial estrutura os dados nos 12 módulos registrais.
                </p>
              </Card>

              <Card className="bg-card border-0 shadow-soft p-6 sm:p-7 rounded-3xl space-y-3 w-full">
                <span className="block text-4xl font-semibold text-primary tabular-nums leading-none">3</span>
                <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Diagnóstico</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Veja a nota de risco e os pontos de atenção destacados.
                </p>
              </Card>

              <Card className="bg-card border-0 shadow-soft p-6 sm:p-7 rounded-3xl space-y-3 w-full">
                <span className="block text-4xl font-semibold text-primary tabular-nums leading-none">4</span>
                <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Relatório em PDF</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Exporte o relatório executivo formatado para guardar ou enviar.
                </p>
              </Card>
            </div>

          </div>
        </section>

        {/* 10. PARA QUEM É O SISTEMA (PÚBLICOS ATENDIDOS) */}
        <section id="publicos" className="py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
              <p className="text-primary text-sm sm:text-base font-semibold">Para quem é</p>
              <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">
                Para quem é o ValidaImóvel
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground">
                Desenvolvido para agilizar a rotina de quem lida com documentação imobiliária.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
              {targetAudiences.map((aud, i) => {
                const Icon = aud.icon;
                return (
                  <Card key={i} className="bg-secondary border-0 shadow-none p-6 sm:p-7 rounded-3xl space-y-3 hover:border-primary/30 transition-colors w-full">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">{aud.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{aud.benefit}</p>
                  </Card>
                );
              })}
            </div>

            {/* Mensagem substitutiva */}
            <div className="p-4 sm:p-6 bg-background/80 border border-border rounded-2xl sm:rounded-3xl text-center max-w-2xl mx-auto space-y-2 w-full">
              <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto" />
              <h4 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">Feito para quem precisa entender uma matrícula com mais rapidez e organização.</h4>
              <p className="text-xs text-muted-foreground font-medium">
                Ideal para otimizar o tempo de triagem documental no seu dia a dia.
              </p>
            </div>

          </div>
        </section>

        {/* 11. COMPARATIVO */}
        <section className="py-16 sm:py-28 bg-background px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
              <p className="text-primary text-sm sm:text-base font-semibold">Comparativo</p>
              <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">
                Análise manual ou ValidaImóvel
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
              {/* Lado Tradicional */}
              <Card className="bg-card border-0 shadow-soft p-6 sm:p-8 rounded-3xl space-y-4 w-full">
                <h3 className="text-base sm:text-lg font-semibold text-muted-foreground pb-2 border-b border-border">Processo manual tradicional</h3>
                <div className="space-y-2.5 text-xs text-muted-foreground font-medium">
                  <div className="p-3 sm:p-3.5 bg-secondary rounded-2xl space-y-0.5">
                    <span className="text-xs font-semibold text-muted-foreground block">Tempo de análise</span>
                    <p className="text-muted-foreground font-semibold">Horas ou dias conferindo folha por folha</p>
                  </div>
                  <div className="p-3 sm:p-3.5 bg-secondary rounded-2xl space-y-0.5">
                    <span className="text-xs font-semibold text-muted-foreground block">Custo por documento</span>
                    <p className="text-muted-foreground font-semibold">Custo elevado por análise avulsa contratada</p>
                  </div>
                  <div className="p-3 sm:p-3.5 bg-secondary rounded-2xl space-y-0.5">
                    <span className="text-xs font-semibold text-muted-foreground block">Organização</span>
                    <p className="text-muted-foreground font-semibold">Anotações manuais dispersas em rascunhos</p>
                  </div>
                </div>
              </Card>

              {/* Lado ValidaImóvel */}
              <Card className="bg-card border-0 ring-2 ring-primary/25 p-6 sm:p-8 rounded-3xl space-y-4 shadow-medium w-full">
                <h3 className="text-base sm:text-lg font-semibold text-foreground pb-2 border-b border-primary/30 flex items-center justify-between">
                  <span>ValidaImóvel com IA</span>
                  <Badge className="bg-primary text-white text-xs sm:text-xs">Recomendado</Badge>
                </h3>
                <div className="space-y-2.5 text-xs text-muted-foreground font-medium">
                  <div className="p-2.5 sm:p-3 bg-primary/5 rounded-2xl space-y-0.5">
                    <span className="text-xs font-semibold text-primary block">Tempo de análise</span>
                    <p className="text-foreground font-semibold">Relatório estruturado em poucos minutos</p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-primary/5 rounded-2xl space-y-0.5">
                    <span className="text-xs font-semibold text-primary block">Custo por documento</span>
                    <p className="text-foreground font-semibold">R$ 49,90 por 3 meses, sem cobrança por documento</p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-primary/5 rounded-2xl space-y-0.5">
                    <span className="text-xs font-semibold text-primary block">Organização</span>
                    <p className="text-foreground font-semibold">Relatório executivo completo nos 12 módulos + PDF</p>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </section>

        {/* 12. VÍDEO DEMONSTRATIVO */}
        <section id="video" className="py-16 sm:py-28 bg-card px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 text-center w-full">
            
            <div className="space-y-2 sm:space-y-3 max-w-2xl mx-auto">
              <p className="text-primary text-sm sm:text-base font-semibold">Vídeo</p>
              <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">
                Veja o sistema em funcionamento
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground">
                Assista ao vídeo demonstrativo e confira como a plataforma realiza a leitura e extração das informações da matrícula.
              </p>
            </div>

            <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-hard bg-foreground max-w-full">
              <iframe
                src="https://www.youtube-nocookie.com/embed/QRCzsDTiRd0?rel=0"
                title="Demonstração do Sistema ValidaImóvel"
                className="w-full h-full border-0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

          </div>
        </section>

        {/* 13. OFERTA */}
        <section id="oferta" className="py-16 sm:py-28 bg-background px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto w-full">
            
            <Card className="border-0 p-6 sm:p-14 rounded-[2rem] shadow-medium space-y-6 sm:space-y-8 text-center relative overflow-hidden w-full bg-card">
              
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-2xl min-[380px]:text-3xl sm:text-5xl font-semibold text-foreground tracking-tight">
                  Acesso completo por três meses
                </h2>
                <p className="text-base sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  Sem cobrança por documento: analise as matrículas do seu dia a dia durante 90 dias, com uso justo de até {COMPANY_CONFIG.offer.fairUseDailyLimit} análises por dia.
                </p>
              </div>

              {/* Bloco de Preço Responsivo */}
              <div className="p-4 sm:p-6 bg-background border border-border rounded-2xl sm:rounded-3xl max-w-md mx-auto space-y-1.5 shadow-inner w-full">
                <div className="flex items-baseline justify-center gap-0.5 flex-wrap">
                  <span className="text-3xl min-[360px]:text-4xl sm:text-6xl font-semibold text-foreground">R$ 49</span>
                  <span className="text-lg sm:text-2xl font-semibold text-foreground">,90</span>
                </div>
                <span className="text-xs sm:text-xs text-muted-foreground font-semibold block pt-1">
                  Equivale a {COMPANY_CONFIG.offer.monthlyEquivalentFormatted}/mês • Pagamento único ({COMPANY_CONFIG.offer.paymentMethods}) • Sem renovação automática
                </span>
              </div>

              {/* Inclusões da Oferta Responsivas (Grid de 1 coluna em celular para evitar estouro) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-left text-sm sm:text-base text-muted-foreground max-w-xl mx-auto w-full">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>12 módulos registrais</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>Nota de risco com o trecho que a embasa</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>Reconstrução da cadeia dominial</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>Identificação de proprietários</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>Detecção de ônus e restrições</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>Histórico das suas análises</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>Exportação do relatório em PDF</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>Suporte pelo WhatsApp</span></div>
              </div>

              {/* Botão de Criação de Conta */}
              <div className="space-y-3 pt-1 max-w-md mx-auto w-full">
                <Link to={user ? (user.hasSubscription ? "/app" : "/pagamento-pix") : "/auth?tab=register"} className="block w-full">
                  <Button size="lg" className="w-full max-w-full text-white font-semibold text-xs min-[400px]:text-sm sm:text-base py-3.5 sm:py-5 min-h-[48px] gap-2 h-auto bg-primary">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span>Criar conta e garantir acesso</span>
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-xs text-muted-foreground font-medium flex-wrap">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" /> {COMPANY_CONFIG.offer.guaranteeDays} Dias de Garantia</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-primary shrink-0" /> Liberação Imediata</span>
                </div>
              </div>

            </Card>

          </div>
        </section>

        {/* 14. PERGUNTAS FREQUENTES (FAQ) */}
        <section id="faq" className="py-16 sm:py-28 bg-card border-t border-border px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3">
              <p className="text-primary text-sm sm:text-base font-semibold">Perguntas frequentes</p>
              <h2 className="text-[28px] leading-[1.12] sm:text-5xl font-semibold text-foreground tracking-tight">
                Tire suas dúvidas sobre a plataforma
              </h2>
            </div>

            <div className="space-y-2.5 sm:space-y-3 w-full">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="p-4 sm:p-5 bg-background border border-border rounded-xl sm:rounded-2xl cursor-pointer hover:border-primary/30 transition-colors space-y-2 w-full"
                >
                  <div className="flex items-center justify-between font-semibold text-foreground text-xs sm:text-sm">
                    <span className="pr-2">{faq.q}</span>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${activeFaq === index ? 'rotate-90 text-primary' : ''}`} />
                  </div>
                  {activeFaq === index && (
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border font-medium">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 w-full">
              <WhatsAppSupport variant="card" />
            </div>

          </div>
        </section>

        {/* 15. AVISO DE USO RESPONSÁVEL */}
        <section className="py-8 sm:py-10 bg-background border-t border-border px-3 sm:px-6 w-full">
          <div className="max-w-4xl mx-auto text-center w-full">
            <Card className="bg-card/60 border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-1.5 text-xs sm:text-xs text-muted-foreground font-medium leading-relaxed w-full">
              <span className="font-semibold text-muted-foreground block">⚖️ Uso Responsável e Limites do Sistema</span>
              <p>
                O ValidaImóvel atua como uma ferramenta tecnológica de apoio à due diligence imobiliária. O relatório gerado pela inteligência artificial é estruturado com base estrita no documento em PDF disponibilizado pelo usuário. A plataforma não realiza consultas em tempo real em cartórios de registro ou órgãos públicos e não emite certidões oficiais.
              </p>
            </Card>
          </div>
        </section>

        {/* 16. RODAPÉ RESPONSIVO */}
        <footer className="bg-background text-muted-foreground py-10 sm:py-12 border-t border-border px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full">
            
            {/* Bloco de Proteção de Dados */}
            <div className="p-4 sm:p-6 bg-card/80 border border-border rounded-2xl sm:rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs font-medium text-muted-foreground w-full">
              <div className="space-y-1">
                <span className="font-semibold text-primary block">🔒 Proteção de Conexão</span>
                <p className="text-muted-foreground text-xs sm:text-xs">Conexão protegida por HTTPS/TLS e tratamento dos documentos conforme as práticas descritas na Política de Privacidade.</p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-primary block">🗑️ Exclusão a Pedido</span>
                <p className="text-muted-foreground text-xs sm:text-xs">Solicite a exclusão definitiva dos seus arquivos de análise a qualquer momento.</p>
              </div>
            </div>

            {/* Links e Direitos Autorais */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 pt-4 border-t border-border text-xs w-full">
              <Logo />

              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[13px] text-muted-foreground [&>a]:py-3 [&>a]:inline-flex">
                <a
                  href={COMPANY_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>{COMPANY_CONFIG.instagramHandle}</span>
                </a>
                <Link to="/guia/como-ler-matricula" className="hover:text-foreground transition-colors">Como ler uma matrícula</Link>
                <Link to="/termos" className="hover:text-foreground transition-colors">Termos de Serviço</Link>
                <Link to="/privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
                <Link to="/auth?tab=login" className="hover:text-foreground transition-colors">Já sou usuário</Link>
                <Link to="/auth?tab=register" className="hover:text-foreground transition-colors">Criar conta</Link>
              </div>

              <p className="text-muted-foreground text-center font-medium text-xs sm:text-xs">
                © {new Date().getFullYear()} {COMPANY_CONFIG.legalName}.
              </p>
            </div>

          </div>
        </footer>

        {/* 📌 BARRA FIXA STICKY BOTTOM DE CONVERSÃO NO MOBILE */}
        <div className="fixed bottom-0 left-0 right-0 z-50 glass border-x-0 border-b-0 px-4 py-2.5 sm:hidden flex items-center justify-between gap-3 max-w-full">
          <div className="min-w-0 leading-tight">
            <span className="text-sm font-semibold text-foreground block truncate">R$ 49,90</span>
            <span className="text-xs text-muted-foreground block truncate">3 meses de acesso</span>
          </div>
          <Link to={user ? (user.hasSubscription ? "/app" : "/pagamento") : "/auth?tab=register"} className="shrink-0">
            <Button size="sm">
              {user ? (user.hasSubscription ? 'Minhas análises' : 'Assinar') : 'Criar conta'}
            </Button>
          </Link>
        </div>

        {/* WhatsApp Flutuante */}
        <WhatsAppSupport variant="floating" />

      </main>

    </div>
  );
};

export default LandingPage;