import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY_CONFIG } from '@/config/companyConfig';
import {
  FileCheck, ShieldCheck, Upload, ArrowRight, Sparkles, Brain, ShieldAlert,
  FileText, CheckCircle2, Zap, Clock, Compass, Lock, User, LogOut,
  ChevronRight, CreditCard, Check, FileUp, Building2, Scale, HelpCircle,
  MessageCircle, AlertCircle, Flame, TrendingUp, ThumbsUp, Shield, Play,
  MapPin, Search, Layers, UserCheck, AlertTriangle, FileCode, Instagram
} from 'lucide-react';

import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { Logo } from '@/components/Logo';

export const LandingPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
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
      title: 'Módulo 7–8: Proprietários Atuais & Reconstrução Dominial',
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
      title: 'Advogados Imobiliários',
      icon: Scale,
      benefit: 'Acelere a fase de triagem inicial de Due Diligence, identificando ônus, alienações e a linha do tempo de transmissões antes de redigir pareceres formais.'
    },
    {
      title: 'Corretores & Imobiliárias',
      icon: Building2,
      benefit: 'Apresente um parecer estruturado aos clientes na hora da proposta, demonstrando transparência sobre proprietários e pendências da matrícula.'
    },
    {
      title: 'Leiloeiros & Investidores',
      icon: TrendingUp,
      benefit: 'Filtre dezenas de certidões por lote em minutos, identificando instantaneamente penhoras, hipotecas e gravames antes de arrematar.'
    },
    {
      title: 'Engenheiros & Agrimensores',
      icon: Compass,
      benefit: 'Extraia rapidamente memoriais descritivos, áreas averbadas e referências ao CAR, CCIR/INCRA e certidões SIGEF para regularização fundiária.'
    },
    {
      title: 'Empresas de Regularização',
      icon: FileCode,
      benefit: 'Mapeie proprietários anteriores, doações e averbações de desmembramento para instruir processos administrativos e judiciais.'
    },
    {
      title: 'Compradores de Imóveis',
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
      a: 'O pagamento é único via Pix ou cartão. Após a confirmação, o acesso ilimitado por 3 meses (90 dias) é liberado imediatamente na sua conta.'
    },
    {
      q: 'Existe limite de uploads durante o período de 3 meses?',
      a: 'Não. Durante os 90 dias de acesso ativo você pode enviar e analisar quantas matrículas imobiliárias precisar, sem custos adicionais por documento.'
    },
    {
      q: 'Como é garantida a segurança e privacidade dos meus documentos?',
      a: 'A conexão é protegida por HTTPS/TLS e o tratamento dos documentos segue estritamente as práticas descritas na Política de Privacidade.'
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
        Lançamento: {COMPANY_CONFIG.offer.period} de acesso ilimitado por{' '}
        <strong className="font-semibold">{COMPANY_CONFIG.offer.priceFormatted}</strong>{' '}
        <span className="text-muted-foreground line-through">{COMPANY_CONFIG.offer.originalPriceFormatted}</span>
        <Link to="/auth?tab=register" className="text-primary hover:underline ml-2 whitespace-nowrap">Garantir agora ›</Link>
      </div>

      {/* 2. CABEÇALHO */}
      <header className="sticky top-0 z-50 glass border-x-0 border-t-0 text-foreground w-full glass border-x-0 border-t-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2 w-full">

          <Logo />

          {/* Navigation Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <a
              href={COMPANY_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-[900px]:inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground px-2 py-1.5 text-[13px] transition-colors"
              title="Siga o ValidaImóvel no Instagram"
            >
              <Instagram className="w-4 h-4" />
              <span>{COMPANY_CONFIG.instagramHandle}</span>
            </a>
            <WhatsAppSupport variant="banner" className="hidden lg:inline-flex" />
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1 bg-card border border-border px-2 py-1 rounded-lg sm:rounded-xl max-w-[100px] min-[360px]:max-w-[150px] sm:max-w-[240px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                  <span className="text-xs sm:text-xs font-semibold text-muted-foreground truncate" title={user.email}>
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    title="Sair"
                    className="text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded hover:bg-muted shrink-0"
                  >
                    <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
                <Link to={user.hasSubscription ? "/app" : "/pagamento-pix"}>
                  <Button className="text-white font-semibold text-xs sm:text-sm px-2.5 sm:px-5 sm:h-10 gap-1 bg-primary">
                    <Sparkles className="w-3.5 h-3.5 fill-white stroke-[2]" />
                    <span>{user.hasSubscription ? "Workspace" : "Garantir"}</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link to="/auth?tab=login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-semibold text-xs sm:text-xs px-2 sm:px-3 sm:h-9 border border-border hover:border-border">
                    <User className="w-3.5 h-3.5 text-primary shrink-0 mr-1 hidden min-[380px]:inline" />
                    <span>Entrar</span>
                  </Button>
                </Link>
                <Link to="/auth?tab=register">
                  <Button className="text-white font-semibold text-xs sm:text-sm px-2.5 sm:px-5 sm:h-10 gap-1 bg-primary">
                    <Sparkles className="w-3.5 h-3.5 fill-white stroke-[2]" />
                    <span>Criar Conta</span>
                    <ArrowRight className="w-3.5 h-3.5 hidden sm:inline-block" />
                  </Button>
                </Link>
              </>
            )}
          </div>
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
                Entenda uma matrícula em segundos.
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
            <div className="max-w-4xl mx-auto pt-4 sm:pt-8 w-full">
              <div className="p-4 sm:p-6 bg-card border border-border shadow-hard rounded-3xl text-left space-y-4 w-full">
                
                {/* Header da Prévia ultra-responsivo */}
                <div className="flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center justify-between gap-2 border-b border-border pb-2.5 w-full">
                  <div className="flex items-center gap-2 min-w-0 max-w-full">
                    <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shrink-0" />
                    <span className="text-xs sm:text-xs font-semibold text-foreground truncate">Dossiê Registral • Matrícula Nº 47.912</span>
                  </div>
                  <Badge className="bg-success/20 text-success border-success/30 text-xs sm:text-xs font-semibold px-2 py-0.5 shrink-0 self-start min-[480px]:self-auto">
                    Score de Risco: 8/100 — Baixo Risco
                  </Badge>
                </div>

                {/* Grid Visual de Atos Extraídos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs w-full">
                  
                  {/* Card Proprietários */}
                  <div className="p-2.5 sm:p-3 bg-background border border-border rounded-xl sm:rounded-2xl space-y-1">
                    <span className="text-xs sm:text-xs font-semibold text-primary block">Proprietários (R-3)</span>
                    <p className="font-semibold text-foreground text-xs sm:text-xs break-words">Carlos Eduardo Faria (50%)</p>
                    <p className="font-semibold text-foreground text-xs sm:text-xs break-words">Mariana Silveira Faria (50%)</p>
                  </div>

                  {/* Card Ônus */}
                  <div className="p-2.5 sm:p-3 bg-background border border-border rounded-xl sm:rounded-2xl space-y-1">
                    <span className="text-xs sm:text-xs font-semibold text-success block">Ônus & Restrições</span>
                    <p className="font-semibold text-success text-xs sm:text-xs break-words">Ônus ativos: nenhum identificado no documento analisado</p>
                  </div>

                  {/* Card Cadeia Dominial & CTA */}
                  <div className="p-2.5 sm:p-3 bg-background border border-border rounded-xl sm:rounded-2xl space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-xs sm:text-xs font-semibold text-primary block">Cadeia Dominial</span>
                      <p className="font-semibold text-muted-foreground text-xs sm:text-xs break-words">Reconstrução dos atos do R-1 ao R-3</p>
                    </div>
                    <div className="pt-1">
                      <Link to="/app?sample=safe" className="block w-full">
                        <Button size="sm" className="w-full bg-primary hover:bg-primary text-white font-semibold text-xs gap-1">
                          <FileText className="w-3 h-3 shrink-0" /> <span>Explorar Relatório</span>
                        </Button>
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
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-xs sm:text-xs font-semibold text-muted-foreground text-center">
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
        <section id="demonstracao" className="py-12 sm:py-20 bg-background border-b border-border px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1 font-semibold text-xs sm:text-xs">
                Teste Sem Cadastro
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Demonstração: análise completa de uma matrícula rural
              </h2>
              <p className="text-xs sm:text-base text-muted-foreground font-medium">
                Explore a demonstração prática interativa sem precisar criar conta.
              </p>
            </div>

            {/* Três opções visuais de demonstração */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full">
              
              {/* Opção 1 — Imóvel Regular (Disponível) */}
              <Card className="bg-card border-2 border-primary/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3.5 flex flex-col justify-between shadow-medium relative w-full">
                <Badge className="bg-primary text-white font-semibold text-xs sm:text-xs absolute top-4 right-4">
                  Disponível Agora ⚡
                </Badge>
                <div className="space-y-2.5 pt-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                    <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">Imóvel Rural Regular (1.450 Ha)</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
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
              <Card className="relative bg-card/50 border border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3.5 flex flex-col justify-between opacity-80 w-full">
                <Badge variant="outline" className="border-warning/30 text-warning bg-warning/10 font-semibold text-xs sm:text-xs absolute top-4 right-4">
                  Em breve
                </Badge>
                <div className="space-y-2.5 pt-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center font-semibold">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">Imóvel Urbano com Pontos de Atenção</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
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
              <Card className="relative bg-card/50 border border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3.5 flex flex-col justify-between opacity-80 w-full">
                <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10 font-semibold text-xs sm:text-xs absolute top-4 right-4">
                  Em breve
                </Badge>
                <div className="space-y-2.5 pt-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center font-semibold">
                    <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">Gleba com Risco Elevado</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Demonstração contendo averbações de penhora judicial e ação de execução anotada no texto.
                  </p>
                </div>
                <div className="pt-1">
                  <Button disabled variant="outline" className="w-full border-border text-muted-foreground text-xs h-10">
                    Em breve
                  </Button>
                </div>
              </Card>

            </div>

            {/* Explicação de dados fictícios */}
            <p className="text-center text-xs sm:text-xs text-muted-foreground font-medium">
              ℹ️ Os nomes, números, CPFs, matrículas e informações da demonstração são dados fictícios utilizados apenas para apresentar o funcionamento da plataforma.
            </p>

          </div>
        </section>

        {/* 6. PRINCIPAIS RESULTADOS ENTREGUES */}
        <section className="py-12 sm:py-20 bg-card border-b border-border px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1 font-semibold text-xs sm:text-xs">
                Capacidades do Sistema
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Principais entregas da análise automatizada
              </h2>
              <p className="text-xs sm:text-base text-muted-foreground font-medium">
                Estruturação completa das informações essenciais para apoiar a Due Diligence.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
              <Card className="bg-background border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Organização da Matrícula</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Extração estruturada em 12 módulos de análise registral.
                </p>
              </Card>

              <Card className="bg-background border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Identificação de Proprietários</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Mapeamento dos titulares atuais e qualificações registradas.
                </p>
              </Card>

              <Card className="bg-background border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Reconstrução Dominial</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Linha do tempo histórica dos atos de transmissão (R-1 ao R-N).
                </p>
              </Card>

              <Card className="bg-background border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Ônus & Restrições</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Detecção de alienações, hipotecas, penhoras e indisponividades anotadas no texto.
                </p>
              </Card>

              <Card className="bg-background border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Dados Urbanos & Rurais</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Identificação de códigos CAR, CCIR/INCRA, ITR e certidão SIGEF citados.
                </p>
              </Card>

              <Card className="bg-background border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Pontos de Atenção</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Score de risco registral e sinalização visual de inconsistências.
                </p>
              </Card>

              <Card className="bg-background border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Recomendações Práticas</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Sugestão de certidões e verificações complementares de apoio.
                </p>
              </Card>

              <Card className="bg-background border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Dossiê Executivo em PDF</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Exportação do parecer em PDF formatado para auditoria.
                </p>
              </Card>
            </div>

          </div>
        </section>

        {/* 7. PRÉVIA DOS 12 MÓDULOS REGISTRAIS (ABAS DESLIZÁVEIS MOBILE) */}
        <section id="modulos" className="py-12 sm:py-20 bg-background border-b border-border px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1 font-semibold text-xs sm:text-xs">
                Estrutura Registral
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Organização dos 12 Módulos do Relatório
              </h2>
              <p className="text-xs sm:text-base text-muted-foreground font-medium">
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
            <Card className="bg-card border-border p-4 sm:p-8 rounded-2xl sm:rounded-3xl space-y-3.5 sm:space-y-4 w-full">
              <h3 className="text-base sm:text-xl font-semibold text-foreground flex items-center gap-2 leading-tight">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span>{moduleCategories[activeModuleCategory].title}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1 w-full">
                {moduleCategories[activeModuleCategory].items.map((item, i) => (
                  <div key={i} className="p-3 sm:p-3.5 bg-background border border-border rounded-xl sm:rounded-2xl flex items-start gap-2 text-xs sm:text-sm text-muted-foreground font-medium w-full">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="break-words">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-xs text-muted-foreground pt-2 border-t border-border">
                💡 <strong className="text-muted-foreground font-semibold">Funcionalidade prática:</strong> Copie qualquer campo extraído com um clique e exporte o relatório completo formatado em PDF.
              </p>
            </Card>

          </div>
        </section>

        {/* 8. COPILOTO REGISTRAL DE IA */}
        <section className="py-12 sm:py-20 bg-card border-b border-border px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1 font-semibold text-xs sm:text-xs">
                Interatividade
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Converse diretamente com os dados da matrícula
              </h2>
              <p className="text-xs sm:text-base text-muted-foreground font-medium">
                Tire dúvidas instantâneas sobre atos, proprietários ou restrições em linguagem natural.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center w-full">
              <div className="lg:col-span-5 space-y-3.5 sm:space-y-4 w-full">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">Copiloto Registral de IA</h3>
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
                      <MessageCircle className="w-4 h-4 shrink-0" /> <span>Experimentar Copiloto</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Chat Simulation Card */}
              <div className="lg:col-span-7 w-full">
                <Card className="bg-background border-2 border-primary/30 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3.5 shadow-medium w-full">
                  <div className="flex items-center gap-2.5 border-b border-border pb-2.5 w-full min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-white font-semibold shrink-0">
                      <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-foreground truncate">Copiloto Registral de IA</h4>
                      <span className="text-xs text-primary font-medium block truncate">Consultando Matrícula Rural Nº 47.912</span>
                    </div>
                  </div>
                  <div className="space-y-2.5 text-xs w-full">
                    <div className="p-2.5 sm:p-3 bg-card rounded-xl sm:rounded-2xl border border-border text-foreground break-words">
                      💬 <strong className="text-foreground">Pergunta:</strong> Quais são os proprietários atuais e existe algum ônus gravado no texto?
                    </div>
                    <div className="p-2.5 sm:p-3 bg-primary/5 border border-primary/20 rounded-xl sm:rounded-2xl text-foreground space-y-1 break-words">
                      🤖 <strong className="text-primary">Resposta:</strong> De acordo com as informações presentes no documento analisado, os proprietários atuais são Carlos Eduardo Faria (50%) e Mariana Silveira Faria (50%), conforme R-3. Não foram identificados ônus ativos gravados no documento.
                    </div>
                  </div>
                </Card>
              </div>
            </div>

          </div>
        </section>

        {/* 9. COMO FUNCIONA */}
        <section id="como-funciona" className="py-12 sm:py-20 bg-background border-b border-border px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1 font-semibold text-xs sm:text-xs">
                Fluxo Simples
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Como funciona a análise em 4 passos
              </h2>
              <p className="text-xs sm:text-base text-muted-foreground font-medium">
                Sem instalação de software, 100% online no seu navegador.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
              <Card className="bg-card border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <span className="text-xs sm:text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30 inline-block">PASSO 01</span>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Envie o PDF</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Faça o upload do documento da matrícula em PDF no sistema.
                </p>
              </Card>

              <Card className="bg-card border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <span className="text-xs sm:text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30 inline-block">PASSO 02</span>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Processamento</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  A inteligência artificial estrutura os dados nos 12 módulos registrais.
                </p>
              </Card>

              <Card className="bg-card border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <span className="text-xs sm:text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30 inline-block">PASSO 03</span>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Diagnóstico</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Veja o Score de risco e os pontos de atenção destacados.
                </p>
              </Card>

              <Card className="bg-card border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <span className="text-xs sm:text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30 inline-block">PASSO 04</span>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Dossiê PDF</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Exporte o relatório executivo formatado para guardar ou enviar.
                </p>
              </Card>
            </div>

          </div>
        </section>

        {/* 10. PARA QUEM É O SISTEMA (PÚBLICOS ATENDIDOS) */}
        <section id="publicos" className="py-12 sm:py-20 bg-card border-b border-border px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1 font-semibold text-xs sm:text-xs">
                Perfis Atendidos
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Para quem é o ValidaImóvel
              </h2>
              <p className="text-xs sm:text-base text-muted-foreground font-medium">
                Desenvolvido para agilizar a rotina de quem lida com documentação imobiliária.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
              {targetAudiences.map((aud, i) => {
                const Icon = aud.icon;
                return (
                  <Card key={i} className="bg-background border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 hover:border-primary/30 transition-colors w-full">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">{aud.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{aud.benefit}</p>
                  </Card>
                );
              })}
            </div>

            {/* Mensagem substitutiva */}
            <div className="p-4 sm:p-6 bg-background/80 border border-border rounded-2xl sm:rounded-3xl text-center max-w-2xl mx-auto space-y-2 w-full">
              <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto" />
              <h4 className="text-sm sm:text-base font-semibold text-foreground">Feito para quem precisa entender uma matrícula com mais rapidez e organização.</h4>
              <p className="text-xs text-muted-foreground font-medium">
                Ideal para otimizar o tempo de triagem documental no seu dia a dia.
              </p>
            </div>

          </div>
        </section>

        {/* 11. COMPARATIVO */}
        <section className="py-12 sm:py-20 bg-background border-b border-border px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1 font-semibold text-xs sm:text-xs">
                Comparativo
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Análise Manual vs ValidaImóvel
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
              {/* Lado Tradicional */}
              <Card className="bg-card border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 w-full">
                <h3 className="text-base sm:text-lg font-semibold text-muted-foreground pb-2 border-b border-border">Processo Manual Tradicional</h3>
                <div className="space-y-2.5 text-xs text-muted-foreground font-medium">
                  <div className="p-2.5 sm:p-3 bg-background rounded-xl space-y-0.5">
                    <span className="text-xs font-semibold text-muted-foreground block">Tempo de Análise</span>
                    <p className="text-muted-foreground font-semibold">Horas ou dias conferindo folha por folha</p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-background rounded-xl space-y-0.5">
                    <span className="text-xs font-semibold text-muted-foreground block">Custo por Documento</span>
                    <p className="text-muted-foreground font-semibold">Custo elevado por análise avulsa contratada</p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-background rounded-xl space-y-0.5">
                    <span className="text-xs font-semibold text-muted-foreground block">Organização</span>
                    <p className="text-muted-foreground font-semibold">Anotações manuais dispersas em rascunhos</p>
                  </div>
                </div>
              </Card>

              {/* Lado ValidaImóvel */}
              <Card className="bg-card border-2 border-primary/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 shadow-medium w-full">
                <h3 className="text-base sm:text-lg font-semibold text-foreground pb-2 border-b border-primary/30 flex items-center justify-between">
                  <span>ValidaImóvel com IA</span>
                  <Badge className="bg-primary text-white text-xs sm:text-xs">Recomendado</Badge>
                </h3>
                <div className="space-y-2.5 text-xs text-muted-foreground font-medium">
                  <div className="p-2.5 sm:p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-0.5">
                    <span className="text-xs font-semibold text-primary block">Tempo de Análise</span>
                    <p className="text-foreground font-semibold">Processamento estruturado em segundos</p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-0.5">
                    <span className="text-xs font-semibold text-primary block">Custo por Documento</span>
                    <p className="text-foreground font-semibold">Apenas R$ 49,90 por 3 meses de análises ilimitadas</p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-0.5">
                    <span className="text-xs font-semibold text-primary block">Organização</span>
                    <p className="text-foreground font-semibold">Relatório executivo completo nos 12 módulos + PDF</p>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </section>

        {/* 12. VÍDEO DEMONSTRATIVO */}
        <section id="video" className="py-12 sm:py-20 bg-card border-b border-border px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 text-center w-full">
            
            <div className="space-y-2 sm:space-y-3 max-w-2xl mx-auto">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1 font-semibold text-xs sm:text-xs">
                Demonstração em Vídeo
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Veja o sistema em funcionamento
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Assista ao vídeo demonstrativo e confira como a plataforma realiza a leitura e extração das informações da matrícula.
              </p>
            </div>

            <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-primary/30 shadow-medium bg-background max-w-full">
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
        <section id="oferta" className="py-12 sm:py-20 bg-background px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto w-full">
            
            <Card className="border-2 border-primary/30 p-4 sm:p-12 rounded-2xl sm:rounded-3xl shadow-medium space-y-6 sm:space-y-8 text-center relative overflow-hidden w-full bg-background">
              
              <div className="space-y-2 sm:space-y-3">
                <Badge className="bg-primary text-white font-semibold text-xs sm:text-xs px-3 py-1 rounded-full mx-auto">
                  Oferta de Lançamento
                </Badge>
                <h2 className="text-2xl min-[380px]:text-3xl sm:text-5xl font-semibold text-foreground tracking-tight">
                  Acesso completo por três meses
                </h2>
                <p className="text-xs sm:text-base text-muted-foreground max-w-xl mx-auto font-medium leading-relaxed">
                  Analise quantas matrículas precisar durante 90 dias e utilize todos os recursos disponíveis na plataforma.
                </p>
              </div>

              {/* Bloco de Preço Responsivo */}
              <div className="p-4 sm:p-6 bg-background border border-border rounded-2xl sm:rounded-3xl max-w-md mx-auto space-y-1.5 shadow-inner w-full">
                <div className="text-xs text-muted-foreground line-through font-semibold">De {COMPANY_CONFIG.offer.originalPriceFormatted}</div>
                <div className="flex items-baseline justify-center gap-0.5 flex-wrap">
                  <span className="text-3xl min-[360px]:text-4xl sm:text-6xl font-semibold text-foreground">R$ 49</span>
                  <span className="text-lg sm:text-2xl font-semibold text-foreground">,90</span>
                </div>
                <span className="text-xs sm:text-xs text-primary font-semibold block pt-1">
                  Economia de {COMPANY_CONFIG.offer.savingsFormatted} • Pagamento Único ({COMPANY_CONFIG.offer.paymentMethods})
                </span>
              </div>

              {/* Inclusões da Oferta Responsivas (Grid de 1 coluna em celular para evitar estouro) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-left text-xs sm:text-sm text-muted-foreground font-medium max-w-xl mx-auto w-full">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>12 módulos registrais</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>Score de risco registral</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>Reconstrução da cadeia dominial</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>Identificação de proprietários</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>Detecção de ônus e restrições</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <span>Copiloto Registral de IA</span></div>
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
        <section id="faq" className="py-12 sm:py-20 bg-card border-t border-border px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1 font-semibold text-xs sm:text-xs">
                Perguntas Frequentes
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-semibold text-foreground tracking-tight">
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
                <Link to="/termos" className="hover:text-foreground transition-colors">Termos de Serviço</Link>
                <Link to="/privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
                <Link to="/auth?tab=login" className="hover:text-foreground transition-colors">Já sou usuário</Link>
                <Link to="/auth?tab=register" className="hover:text-foreground transition-colors">Criar Conta</Link>
              </div>

              <p className="text-muted-foreground text-center font-medium text-xs sm:text-xs">
                © {new Date().getFullYear()} {COMPANY_CONFIG.legalName}.
              </p>
            </div>

          </div>
        </footer>

        {/* 📌 BARRA FIXA STICKY BOTTOM DE CONVERSÃO NO MOBILE */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 border-t border-border p-2.5 sm:hidden shadow-medium backdrop-blur-md flex items-center justify-between gap-2 max-w-full">
          <div className="min-w-0">
            <span className="text-xs font-semibold text-foreground block truncate">ValidaImóvel (3 Meses)</span>
            <span className="text-xs font-semibold text-primary block truncate">R$ 49,90 • Acesso Ilimitado</span>
          </div>
          <Link to={user ? (user.hasSubscription ? "/app" : "/pagamento-pix") : "/auth?tab=register"} className="shrink-0">
            <Button size="sm" className="bg-primary hover:bg-primary text-white font-semibold text-xs px-3 py-2">
              <span>{user ? (user.hasSubscription ? "Workspace" : "Garantir") : "Criar Conta"}</span>
              <ArrowRight className="ml-1 w-3 h-3" />
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