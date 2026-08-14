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
  MapPin, Search, Layers, UserCheck, AlertTriangle, FileCode
} from 'lucide-react';

import { WhatsAppSupport } from '@/components/WhatsAppSupport';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white pb-20 sm:pb-0 overflow-x-hidden max-w-[100vw] w-full">
      
      {/* Script JSON-LD de SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} />

      {/* 1. BARRA PROMOCIONAL (PROMO BAR ultra-responsiva) */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white text-[10px] min-[360px]:text-xs sm:text-sm font-black py-2 px-3 text-center shadow-xl flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap relative z-50 border-b border-cyan-400/30 w-full max-w-full leading-snug">
        <div className="flex items-center gap-1 bg-amber-400/20 px-2 py-0.5 rounded-full text-amber-300 border border-amber-400/40 shrink-0">
          <Flame className="w-3 h-3 text-amber-300 fill-amber-400 shrink-0" />
          <span>ACESSO COMPLETO</span>
        </div>
        <span className="tracking-wide">
          DE <span className="line-through opacity-75">{COMPANY_CONFIG.offer.originalPriceFormatted}</span> POR APENAS <strong className="text-amber-300 font-mono text-xs sm:text-sm underline decoration-amber-300 underline-offset-2">{COMPANY_CONFIG.offer.priceFormatted}</strong> ({COMPANY_CONFIG.offer.period.toUpperCase()} ILIMITADOS)
        </span>
        <div className="bg-slate-950/60 px-2.5 py-0.5 rounded-full text-amber-300 font-sans text-[10px] sm:text-xs font-bold border border-amber-400/40 shadow-inner hidden min-[540px]:inline-flex">
          <span>Condição especial de lançamento por tempo limitado</span>
        </div>
      </div>

      {/* 2. CABEÇALHO (NAVBAR RESPONSIVA) */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/80 text-white shadow-2xl w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 w-full">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md shadow-blue-500/30 font-black">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <span className="text-base min-[380px]:text-lg sm:text-xl font-black tracking-tight text-white block">
              Valida<span className="text-cyan-400">Imóvel</span>
            </span>
            <Badge variant="outline" className="border-cyan-400/50 text-cyan-300 bg-blue-500/20 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full hidden md:inline-flex">
              IA Registrária
            </Badge>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <WhatsAppSupport variant="banner" className="hidden lg:inline-flex" />
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg sm:rounded-xl max-w-[100px] min-[360px]:max-w-[150px] sm:max-w-[240px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-300 truncate" title={user.email}>
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    title="Sair"
                    className="text-slate-400 hover:text-red-400 transition-colors p-0.5 rounded hover:bg-slate-800 shrink-0"
                  >
                    <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
                <Link to={user.hasSubscription ? "/app" : "/pagamento-pix"}>
                  <Button className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-[11px] sm:text-sm px-2.5 sm:px-5 h-8 sm:h-10 shadow-lg shadow-blue-500/30 rounded-lg sm:rounded-xl gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-white stroke-[2]" />
                    <span>{user.hasSubscription ? "Workspace" : "Garantir"}</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link to="/auth?tab=login">
                  <Button variant="ghost" className="text-slate-300 hover:text-white font-bold text-[11px] sm:text-xs px-2 sm:px-3 h-8 sm:h-9 rounded-lg sm:rounded-xl border border-slate-800 hover:border-slate-700">
                    <User className="w-3.5 h-3.5 text-cyan-400 shrink-0 mr-1 hidden min-[380px]:inline" />
                    <span>Entrar</span>
                  </Button>
                </Link>
                <Link to="/auth?tab=register">
                  <Button className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-[11px] sm:text-sm px-2.5 sm:px-5 h-8 sm:h-10 shadow-xl shadow-blue-500/30 rounded-lg sm:rounded-xl gap-1">
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
        <section className="relative pt-6 min-[400px]:pt-10 sm:pt-14 lg:pt-16 pb-14 sm:pb-20 overflow-hidden bg-[#040809] text-white border-b border-slate-900 px-3 sm:px-6 w-full">
          
          {/* Background Ambient Effects */}
          <div 
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-30 scale-105"
            style={{ backgroundImage: "url('/hero_matricula_bg.png')" }}
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#040809]/80 via-[#040809]/60 to-[#040809]" />
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[90vw] sm:w-[700px] h-[300px] sm:h-[400px] bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10 space-y-6 sm:space-y-8 text-center w-full">
            
            {/* Selo Superior */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full bg-slate-900/90 border border-blue-500/40 text-cyan-300 text-[10px] sm:text-xs font-black shadow-md backdrop-blur-md max-w-[92vw] leading-tight">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Inteligência registral aplicada à análise imobiliária</span>
            </div>

            {/* Título Principal & Subtítulo */}
            <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto px-1 w-full">
              <h1 className="text-2xl min-[360px]:text-3xl min-[500px]:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight break-words">
                Entenda uma matrícula de imóvel em segundos
              </h1>
              <p className="text-xs min-[360px]:text-sm sm:text-lg text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
                Identifique proprietários, ônus, penhoras, cadeia dominial, dados do imóvel e pontos de atenção com uma análise estruturada por inteligência artificial.
              </p>
            </div>

            {/* Botões Principais & Sub-informações */}
            <div className="space-y-3 sm:space-y-4 max-w-xl mx-auto pt-1 sm:pt-2 w-full">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full">
                <Link to="/app?sample=safe" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs min-[400px]:text-sm py-3.5 sm:py-5 px-4 sm:px-7 rounded-xl sm:rounded-2xl shadow-xl shadow-blue-500/30 gap-2 h-auto">
                    <Sparkles className="w-4 h-4 fill-white shrink-0" />
                    <span>Testar demonstração gratuita</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Button>
                </Link>
                <Link to="/auth?tab=register" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 font-extrabold text-xs min-[400px]:text-sm py-3.5 sm:py-5 px-4 sm:px-6 rounded-xl sm:rounded-2xl gap-2 h-auto">
                    <User className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Criar minha conta</span>
                  </Button>
                </Link>
              </div>

              {/* Informações abaixo dos botões */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[10px] sm:text-xs text-slate-400 font-medium pt-1">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Sem necessidade de cadastro para testar</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Demonstração guiada</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Resultado em 12 módulos</span>
              </div>
            </div>

            {/* Aviso Discreto */}
            <div className="max-w-2xl mx-auto pt-1 w-full">
              <p className="text-[10px] min-[380px]:text-[11px] text-slate-400 bg-slate-900/60 p-2.5 sm:p-3 rounded-xl border border-slate-800/80 leading-relaxed font-medium">
                ⚠️ <strong className="text-slate-300 font-semibold">Nota responsável:</strong> A análise automatizada auxilia a triagem documental e não substitui matrícula atualizada, certidões oficiais ou orientação profissional.
              </p>
            </div>

            {/* Visual Realista do Relatório no Hero (SCORE 8/100 + ÔNUS LIMPO) */}
            <div className="max-w-4xl mx-auto pt-2 sm:pt-4 w-full">
              <div className="p-3 sm:p-6 bg-slate-900/95 border-2 border-blue-500/40 shadow-2xl shadow-blue-500/20 rounded-2xl sm:rounded-3xl backdrop-blur-xl text-left space-y-3.5 w-full">
                
                {/* Header da Prévia ultra-responsivo */}
                <div className="flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center justify-between gap-2 border-b border-slate-800 pb-2.5 w-full">
                  <div className="flex items-center gap-2 min-w-0 max-w-full">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider truncate">Dossiê Registral • Matrícula Nº 47.912</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[9px] sm:text-[11px] font-black px-2 py-0.5 shrink-0 self-start min-[480px]:self-auto">
                    Score de Risco: 8/100 — Baixo Risco
                  </Badge>
                </div>

                {/* Grid Visual de Atos Extraídos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs w-full">
                  
                  {/* Card Proprietários */}
                  <div className="p-2.5 sm:p-3 bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl space-y-1">
                    <span className="text-[9px] sm:text-[10px] font-black text-cyan-400 uppercase tracking-wider block">Proprietários (R-3)</span>
                    <p className="font-bold text-white text-[11px] sm:text-xs break-words">Carlos Eduardo Faria (50%)</p>
                    <p className="font-bold text-white text-[11px] sm:text-xs break-words">Mariana Silveira Faria (50%)</p>
                  </div>

                  {/* Card Ônus */}
                  <div className="p-2.5 sm:p-3 bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl space-y-1">
                    <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Ônus & Restrições</span>
                    <p className="font-bold text-emerald-300 text-[11px] sm:text-xs break-words">Ônus ativos: nenhum identificado no documento analisado</p>
                  </div>

                  {/* Card Cadeia Dominial & CTA */}
                  <div className="p-2.5 sm:p-3 bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-black text-cyan-400 uppercase tracking-wider block">Cadeia Dominial</span>
                      <p className="font-semibold text-slate-300 text-[11px] sm:text-xs break-words">Reconstrução dos atos do R-1 ao R-3</p>
                    </div>
                    <div className="pt-1">
                      <Link to="/app?sample=safe" className="block w-full">
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] h-7 rounded-lg gap-1">
                          <FileText className="w-3 h-3 shrink-0" /> <span>Explorar Relatório</span>
                        </Button>
                      </Link>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 4. FAIXA CURTA DE CONFIANÇA */}
        <section className="py-4 sm:py-6 bg-slate-900 border-b border-slate-800 px-3 w-full">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-[11px] sm:text-xs font-bold text-slate-300 text-center">
            <span className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              Conexão protegida por HTTPS/TLS e privacidade assegurada
            </span>
            <span className="flex items-center justify-center gap-1.5">
              <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
              Análise estruturada considerando informações registrais e referências normativas aplicáveis
            </span>
          </div>
        </section>

        {/* 5. DEMONSTRAÇÃO INTERATIVA */}
        <section id="demonstracao" className="py-12 sm:py-20 bg-slate-950 border-b border-slate-900 px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-blue-500/30 text-cyan-400 bg-blue-500/10 px-3 py-1 font-extrabold text-[10px] sm:text-xs uppercase">
                Teste Sem Cadastro
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-black text-white tracking-tight">
                Demonstração: análise completa de uma matrícula rural
              </h2>
              <p className="text-xs sm:text-base text-slate-300 font-medium">
                Explore a demonstração prática interativa sem precisar criar conta.
              </p>
            </div>

            {/* Três opções visuais de demonstração */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full">
              
              {/* Opção 1 — Imóvel Regular (Disponível) */}
              <Card className="bg-slate-900 border-2 border-cyan-500/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3.5 flex flex-col justify-between shadow-xl relative w-full">
                <Badge className="bg-cyan-500 text-slate-950 font-black text-[9px] sm:text-[10px] uppercase absolute top-4 right-4">
                  Disponível Agora ⚡
                </Badge>
                <div className="space-y-2.5 pt-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">Imóvel Rural Regular (1.450 Ha)</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Demonstração completa com georreferenciamento, código CAR, CCIR/INCRA, certidão SIGEF e 12 módulos estruturados.
                  </p>
                </div>
                <div className="pt-1">
                  <Link to="/app?sample=safe" className="block w-full">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs h-10 sm:h-11 rounded-xl gap-1.5 shadow-lg shadow-blue-500/20">
                      <Sparkles className="w-3.5 h-3.5" /> <span>Explorar relatório demonstrativo</span>
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Opção 2 — Imóvel com Pontos de Atenção */}
              <Card className="bg-slate-900/50 border border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3.5 flex flex-col justify-between opacity-80 w-full">
                <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-500/10 font-bold text-[9px] sm:text-[10px] uppercase absolute top-4 right-4">
                  Em breve
                </Badge>
                <div className="space-y-2.5 pt-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-200">Imóvel Urbano com Pontos de Atenção</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Demonstração focada na identificação de usufruto gravado e pendência de averbação de reforma.
                  </p>
                </div>
                <div className="pt-1">
                  <Button disabled variant="outline" className="w-full border-slate-800 text-slate-500 text-xs h-10 rounded-xl">
                    Em breve
                  </Button>
                </div>
              </Card>

              {/* Opção 3 — Imóvel com Risco Elevado */}
              <Card className="bg-slate-900/50 border border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3.5 flex flex-col justify-between opacity-80 w-full">
                <Badge variant="outline" className="border-red-500/40 text-red-300 bg-red-500/10 font-bold text-[9px] sm:text-[10px] uppercase absolute top-4 right-4">
                  Em breve
                </Badge>
                <div className="space-y-2.5 pt-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-200">Gleba com Risco Elevado</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Demonstração contendo averbações de penhora judicial e ação de execução anotada no texto.
                  </p>
                </div>
                <div className="pt-1">
                  <Button disabled variant="outline" className="w-full border-slate-800 text-slate-500 text-xs h-10 rounded-xl">
                    Em breve
                  </Button>
                </div>
              </Card>

            </div>

            {/* Explicação de dados fictícios */}
            <p className="text-center text-[11px] sm:text-xs text-slate-400 font-medium">
              ℹ️ Os nomes, números, CPFs, matrículas e informações da demonstração são dados fictícios utilizados apenas para apresentar o funcionamento da plataforma.
            </p>

          </div>
        </section>

        {/* 6. PRINCIPAIS RESULTADOS ENTREGUES */}
        <section className="py-12 sm:py-20 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-blue-500/30 text-cyan-400 bg-blue-500/10 px-3 py-1 font-extrabold text-[10px] sm:text-xs uppercase">
                Capacidades do Sistema
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-black text-white tracking-tight">
                Principais entregas da análise automatizada
              </h2>
              <p className="text-xs sm:text-base text-slate-300 font-medium">
                Estruturação completa das informações essenciais para apoiar a Due Diligence.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
              <Card className="bg-slate-950 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">Organização da Matrícula</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Extração estruturada em 12 módulos de análise registral.
                </p>
              </Card>

              <Card className="bg-slate-950 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">Identificação de Proprietários</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Mapeamento dos titulares atuais e qualificações registradas.
                </p>
              </Card>

              <Card className="bg-slate-950 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">Reconstrução Dominial</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Linha do tempo histórica dos atos de transmissão (R-1 ao R-N).
                </p>
              </Card>

              <Card className="bg-slate-950 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">Ônus & Restrições</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Detecção de alienações, hipotecas, penhoras e indisponividades anotadas no texto.
                </p>
              </Card>

              <Card className="bg-slate-950 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">Dados Urbanos & Rurais</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Identificação de códigos CAR, CCIR/INCRA, ITR e certidão SIGEF citados.
                </p>
              </Card>

              <Card className="bg-slate-950 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">Pontos de Atenção</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Score de risco registral e sinalização visual de inconsistências.
                </p>
              </Card>

              <Card className="bg-slate-950 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">Recomendações Práticas</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Sugestão de certidões e verificações complementares de apoio.
                </p>
              </Card>

              <Card className="bg-slate-950 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">Dossiê Executivo em PDF</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Exportação do parecer em PDF formatado para auditoria.
                </p>
              </Card>
            </div>

          </div>
        </section>

        {/* 7. PRÉVIA DOS 12 MÓDULOS REGISTRAIS (ABAS DESLIZÁVEIS MOBILE) */}
        <section id="modulos" className="py-12 sm:py-20 bg-slate-950 border-b border-slate-900 px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-blue-500/30 text-cyan-400 bg-blue-500/10 px-3 py-1 font-extrabold text-[10px] sm:text-xs uppercase">
                Estrutura Registral
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-black text-white tracking-tight">
                Organização dos 12 Módulos do Relatório
              </h2>
              <p className="text-xs sm:text-base text-slate-300 font-medium">
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
                      className={`px-3.5 py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border snap-start ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
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
            <Card className="bg-slate-900 border-slate-800 p-4 sm:p-8 rounded-2xl sm:rounded-3xl space-y-3.5 sm:space-y-4 w-full">
              <h3 className="text-base sm:text-xl font-black text-white flex items-center gap-2 leading-tight">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
                <span>{moduleCategories[activeModuleCategory].title}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1 w-full">
                {moduleCategories[activeModuleCategory].items.map((item, i) => (
                  <div key={i} className="p-3 sm:p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl sm:rounded-2xl flex items-start gap-2 text-xs sm:text-sm text-slate-300 font-medium w-full">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="break-words">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                💡 <strong className="text-slate-300 font-semibold">Funcionalidade prática:</strong> Copie qualquer campo extraído com um clique e exporte o relatório completo formatado em PDF.
              </p>
            </Card>

          </div>
        </section>

        {/* 8. COPILOTO REGISTRAL DE IA */}
        <section className="py-12 sm:py-20 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-blue-500/30 text-cyan-400 bg-blue-500/10 px-3 py-1 font-extrabold text-[10px] sm:text-xs uppercase">
                Interatividade
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-black text-white tracking-tight">
                Converse diretamente com os dados da matrícula
              </h2>
              <p className="text-xs sm:text-base text-slate-300 font-medium">
                Tire dúvidas instantâneas sobre atos, proprietários ou restrições em linguagem natural.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center w-full">
              <div className="lg:col-span-5 space-y-3.5 sm:space-y-4 w-full">
                <h3 className="text-lg sm:text-xl font-extrabold text-white">Copiloto Registral de IA</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  Pergunte em português simples e receba respostas vinculadas aos atos registrais encontrados no documento enviado.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Respostas orientadas estritamente pelas informações presentes no arquivo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Dados estruturados para facilitar a conferência</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Disponível durante toda a sessão de análise</li>
                </ul>
                <div className="pt-1">
                  <Link to="/app?sample=safe" className="block w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-10 px-5 rounded-xl gap-2">
                      <MessageCircle className="w-4 h-4 shrink-0" /> <span>Experimentar Copiloto</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Chat Simulation Card */}
              <div className="lg:col-span-7 w-full">
                <Card className="bg-slate-950 border-2 border-blue-500/40 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3.5 shadow-xl w-full">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2.5 w-full min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shrink-0">
                      <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white truncate">Copiloto Registral de IA</h4>
                      <span className="text-[10px] text-cyan-400 font-medium block truncate">Consultando Matrícula Rural Nº 47.912</span>
                    </div>
                  </div>
                  <div className="space-y-2.5 text-xs w-full">
                    <div className="p-2.5 sm:p-3 bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-800 text-slate-200 break-words">
                      💬 <strong className="text-white">Pergunta:</strong> Quais são os proprietários atuais e existe algum ônus gravado no texto?
                    </div>
                    <div className="p-2.5 sm:p-3 bg-blue-950/60 border border-blue-500/30 rounded-xl sm:rounded-2xl text-slate-200 space-y-1 break-words">
                      🤖 <strong className="text-cyan-400">Resposta:</strong> De acordo com as informações presentes no documento analisado, os proprietários atuais são Carlos Eduardo Faria (50%) e Mariana Silveira Faria (50%), conforme R-3. Não foram identificados ônus ativos gravados no documento.
                    </div>
                  </div>
                </Card>
              </div>
            </div>

          </div>
        </section>

        {/* 9. COMO FUNCIONA */}
        <section id="como-funciona" className="py-12 sm:py-20 bg-slate-950 border-b border-slate-900 px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-blue-500/30 text-cyan-400 bg-blue-500/10 px-3 py-1 font-extrabold text-[10px] sm:text-xs uppercase">
                Fluxo Simples
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-black text-white tracking-tight">
                Como funciona a análise em 4 passos
              </h2>
              <p className="text-xs sm:text-base text-slate-300 font-medium">
                Sem instalação de software, 100% online no seu navegador.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
              <Card className="bg-slate-900 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <span className="text-[10px] sm:text-xs font-mono font-black text-cyan-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30 inline-block">PASSO 01</span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">Envie o PDF</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Faça o upload do documento da matrícula em PDF no sistema.
                </p>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <span className="text-[10px] sm:text-xs font-mono font-black text-cyan-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30 inline-block">PASSO 02</span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">Processamento</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  A inteligência artificial estrutura os dados nos 12 módulos registrais.
                </p>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <span className="text-[10px] sm:text-xs font-mono font-black text-cyan-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30 inline-block">PASSO 03</span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">Diagnóstico</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Veja o Score de risco e os pontos de atenção destacados.
                </p>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 w-full">
                <span className="text-[10px] sm:text-xs font-mono font-black text-cyan-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30 inline-block">PASSO 04</span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">Dossiê PDF</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Exporte o relatório executivo formatado para guardar ou enviar.
                </p>
              </Card>
            </div>

          </div>
        </section>

        {/* 10. PARA QUEM É O SISTEMA (PÚBLICOS ATENDIDOS) */}
        <section id="publicos" className="py-12 sm:py-20 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-blue-500/30 text-cyan-400 bg-blue-500/10 px-3 py-1 font-extrabold text-[10px] sm:text-xs uppercase">
                Perfis Atendidos
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-black text-white tracking-tight">
                Para quem é o ValidaImóvel
              </h2>
              <p className="text-xs sm:text-base text-slate-300 font-medium">
                Desenvolvido para agilizar a rotina de quem lida com documentação imobiliária.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
              {targetAudiences.map((aud, i) => {
                const Icon = aud.icon;
                return (
                  <Card key={i} className="bg-slate-950 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2.5 hover:border-blue-500/40 transition-colors w-full">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center font-bold">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white">{aud.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{aud.benefit}</p>
                  </Card>
                );
              })}
            </div>

            {/* Mensagem substitutiva */}
            <div className="p-4 sm:p-6 bg-slate-950/80 border border-slate-800 rounded-2xl sm:rounded-3xl text-center max-w-2xl mx-auto space-y-2 w-full">
              <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 mx-auto" />
              <h4 className="text-sm sm:text-base font-extrabold text-white">Feito para quem precisa entender uma matrícula com mais rapidez e organização.</h4>
              <p className="text-xs text-slate-400 font-medium">
                Ideal para otimizar o tempo de triagem documental no seu dia a dia.
              </p>
            </div>

          </div>
        </section>

        {/* 11. COMPARATIVO */}
        <section className="py-12 sm:py-20 bg-slate-950 border-b border-slate-900 px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-blue-500/30 text-cyan-400 bg-blue-500/10 px-3 py-1 font-extrabold text-[10px] sm:text-xs uppercase">
                Comparativo
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-black text-white tracking-tight">
                Análise Manual vs ValidaImóvel
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
              {/* Lado Tradicional */}
              <Card className="bg-slate-900 border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 w-full">
                <h3 className="text-base sm:text-lg font-black text-slate-300 pb-2 border-b border-slate-800">Processo Manual Tradicional</h3>
                <div className="space-y-2.5 text-xs text-slate-400 font-medium">
                  <div className="p-2.5 sm:p-3 bg-slate-950 rounded-xl space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Tempo de Análise</span>
                    <p className="text-slate-300 font-semibold">Horas ou dias conferindo folha por folha</p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-slate-950 rounded-xl space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Custo por Documento</span>
                    <p className="text-slate-300 font-semibold">Custo elevado por análise avulsa contratada</p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-slate-950 rounded-xl space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Organização</span>
                    <p className="text-slate-300 font-semibold">Anotações manuais dispersas em rascunhos</p>
                  </div>
                </div>
              </Card>

              {/* Lado ValidaImóvel */}
              <Card className="bg-slate-900 border-2 border-blue-500/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 shadow-xl w-full">
                <h3 className="text-base sm:text-lg font-black text-white pb-2 border-b border-blue-500/30 flex items-center justify-between">
                  <span>ValidaImóvel com IA</span>
                  <Badge className="bg-blue-600 text-white text-[9px] sm:text-[10px]">Recomendado</Badge>
                </h3>
                <div className="space-y-2.5 text-xs text-slate-300 font-medium">
                  <div className="p-2.5 sm:p-3 bg-blue-950/40 border border-blue-500/20 rounded-xl space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-cyan-400 block">Tempo de Análise</span>
                    <p className="text-white font-bold">Processamento estruturado em segundos</p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-blue-950/40 border border-blue-500/20 rounded-xl space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-cyan-400 block">Custo por Documento</span>
                    <p className="text-white font-bold">Apenas R$ 49,90 por 3 meses de análises ilimitadas</p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-blue-950/40 border border-blue-500/20 rounded-xl space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-cyan-400 block">Organização</span>
                    <p className="text-white font-bold">Relatório executivo completo nos 12 módulos + PDF</p>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </section>

        {/* 12. VÍDEO DEMONSTRATIVO */}
        <section id="video" className="py-12 sm:py-20 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 text-center w-full">
            
            <div className="space-y-2 sm:space-y-3 max-w-2xl mx-auto">
              <Badge variant="outline" className="border-blue-500/30 text-cyan-400 bg-blue-500/10 px-3 py-1 font-extrabold text-[10px] sm:text-xs uppercase">
                Demonstração em Vídeo
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-black text-white tracking-tight">
                Veja o sistema em funcionamento
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Assista ao vídeo demonstrativo e confira como a plataforma realiza a leitura e extração das informações da matrícula.
              </p>
            </div>

            <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-blue-500/40 shadow-2xl bg-slate-950 max-w-full">
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
        <section id="oferta" className="py-12 sm:py-20 bg-slate-950 px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto w-full">
            
            <Card className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-blue-500/60 p-4 sm:p-12 rounded-2xl sm:rounded-3xl shadow-2xl space-y-6 sm:space-y-8 text-center relative overflow-hidden w-full">
              
              <div className="space-y-2 sm:space-y-3">
                <Badge className="bg-blue-600 text-white font-black text-[10px] sm:text-xs uppercase px-3 py-1 rounded-full mx-auto">
                  Oferta de Lançamento
                </Badge>
                <h2 className="text-2xl min-[380px]:text-3xl sm:text-5xl font-black text-white tracking-tight">
                  Acesso completo por três meses
                </h2>
                <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
                  Analise quantas matrículas precisar durante 90 dias e utilize todos os recursos disponíveis na plataforma.
                </p>
              </div>

              {/* Bloco de Preço Responsivo */}
              <div className="p-4 sm:p-6 bg-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-md mx-auto space-y-1.5 shadow-inner w-full">
                <div className="text-xs text-slate-400 line-through font-bold">De {COMPANY_CONFIG.offer.originalPriceFormatted}</div>
                <div className="flex items-baseline justify-center gap-0.5 flex-wrap">
                  <span className="text-3xl min-[360px]:text-4xl sm:text-6xl font-black text-white">R$ 49</span>
                  <span className="text-lg sm:text-2xl font-extrabold text-white">,90</span>
                </div>
                <span className="text-[11px] sm:text-xs text-cyan-400 font-extrabold block pt-1">
                  Economia de {COMPANY_CONFIG.offer.savingsFormatted} • Pagamento Único ({COMPANY_CONFIG.offer.paymentMethods})
                </span>
              </div>

              {/* Inclusões da Oferta Responsivas (Grid de 1 coluna em celular para evitar estouro) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-left text-xs sm:text-sm text-slate-300 font-medium max-w-xl mx-auto w-full">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> <span>12 módulos registrais</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> <span>Score de risco registral</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> <span>Reconstrução da cadeia dominial</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> <span>Identificação de proprietários</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> <span>Detecção de ônus e restrições</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> <span>Copiloto Registral de IA</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> <span>Exportação do relatório em PDF</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> <span>Suporte pelo WhatsApp</span></div>
              </div>

              {/* Botão de Criação de Conta */}
              <div className="space-y-3 pt-1 max-w-md mx-auto w-full">
                <Link to={user ? (user.hasSubscription ? "/app" : "/pagamento-pix") : "/auth?tab=register"} className="block w-full">
                  <Button size="lg" className="w-full max-w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs min-[400px]:text-sm sm:text-base py-3.5 sm:py-5 min-h-[48px] rounded-xl sm:rounded-2xl shadow-xl shadow-blue-500/30 gap-2 h-auto">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span>Criar conta e garantir acesso</span>
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-slate-400 font-medium flex-wrap">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> {COMPANY_CONFIG.offer.guaranteeDays} Dias de Garantia</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Liberação Imediata</span>
                </div>
              </div>

            </Card>

          </div>
        </section>

        {/* 14. PERGUNTAS FREQUENTES (FAQ) */}
        <section id="faq" className="py-12 sm:py-20 bg-slate-900 border-t border-slate-800 px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 w-full">
            
            <div className="text-center space-y-2 sm:space-y-3">
              <Badge variant="outline" className="border-blue-500/30 text-cyan-400 bg-blue-500/10 px-3 py-1 font-extrabold text-[10px] sm:text-xs uppercase">
                Perguntas Frequentes
              </Badge>
              <h2 className="text-xl min-[380px]:text-2xl sm:text-4xl font-black text-white tracking-tight">
                Tire suas dúvidas sobre a plataforma
              </h2>
            </div>

            <div className="space-y-2.5 sm:space-y-3 w-full">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="p-4 sm:p-5 bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl cursor-pointer hover:border-blue-500/40 transition-colors space-y-2 w-full"
                >
                  <div className="flex items-center justify-between font-bold text-white text-xs sm:text-sm">
                    <span className="pr-2">{faq.q}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${activeFaq === index ? 'rotate-90 text-cyan-400' : ''}`} />
                  </div>
                  {activeFaq === index && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80 font-medium">
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
        <section className="py-8 sm:py-10 bg-slate-950 border-t border-slate-900 px-3 sm:px-6 w-full">
          <div className="max-w-4xl mx-auto text-center w-full">
            <Card className="bg-slate-900/60 border border-slate-800/80 p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-1.5 text-[11px] sm:text-xs text-slate-400 font-medium leading-relaxed w-full">
              <span className="font-bold text-slate-300 block">⚖️ Uso Responsável e Limites do Sistema</span>
              <p>
                O ValidaImóvel atua como uma ferramenta tecnológica de apoio à due diligence imobiliária. O relatório gerado pela inteligência artificial é estruturado com base estrita no documento em PDF disponibilizado pelo usuário. A plataforma não realiza consultas em tempo real em cartórios de registro ou órgãos públicos e não emite certidões oficiais.
              </p>
            </Card>
          </div>
        </section>

        {/* 16. RODAPÉ RESPONSIVO */}
        <footer className="bg-slate-950 text-slate-400 py-10 sm:py-12 border-t border-slate-900 px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full">
            
            {/* Bloco de Proteção de Dados */}
            <div className="p-4 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs font-medium text-slate-300 w-full">
              <div className="space-y-1">
                <span className="font-bold text-cyan-400 block">🔒 Proteção de Conexão</span>
                <p className="text-slate-400 text-[11px] sm:text-xs">Conexão protegida por HTTPS/TLS e tratamento dos documentos conforme as práticas descritas na Política de Privacidade.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-cyan-400 block">🗑️ Exclusão a Pedido</span>
                <p className="text-slate-400 text-[11px] sm:text-xs">Solicite a exclusão definitiva dos seus arquivos de análise a qualquer momento.</p>
              </div>
            </div>

            {/* Links e Direitos Autorais */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 pt-4 border-t border-slate-900 text-xs w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                </div>
                <span className="text-base font-black text-white">
                  Valida<span className="text-cyan-400">Imóvel</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-semibold text-[11px] sm:text-xs">
                <Link to="/termos" className="hover:text-white transition-colors">Termos de Serviço</Link>
                <Link to="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
                <Link to="/auth?tab=login" className="hover:text-white transition-colors">Já sou usuário</Link>
                <Link to="/auth?tab=register" className="hover:text-white transition-colors">Criar Conta</Link>
              </div>

              <p className="text-slate-500 text-center font-medium text-[11px] sm:text-xs">
                © {new Date().getFullYear()} {COMPANY_CONFIG.legalName}.
              </p>
            </div>

          </div>
        </footer>

        {/* 📌 BARRA FIXA STICKY BOTTOM DE CONVERSÃO NO MOBILE */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800 p-2.5 sm:hidden shadow-2xl backdrop-blur-md flex items-center justify-between gap-2 max-w-full">
          <div className="min-w-0">
            <span className="text-[11px] font-black text-white block truncate">ValidaImóvel (3 Meses)</span>
            <span className="text-[10px] font-extrabold text-cyan-400 block truncate">R$ 49,90 • Acesso Ilimitado</span>
          </div>
          <Link to={user ? (user.hasSubscription ? "/app" : "/pagamento-pix") : "/auth?tab=register"} className="shrink-0">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] px-3 py-2 rounded-xl shadow-md h-9">
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