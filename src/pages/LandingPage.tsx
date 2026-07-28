import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  FileCheck, ShieldCheck, Upload, ArrowRight, Sparkles, Brain, ShieldAlert,
  FileText, CheckCircle2, Zap, Clock, Compass, Users, Lock,
  ChevronRight, Star, Award, CreditCard, Check, FileUp, AlertTriangle,
  Building2, Scale, HelpCircle, DollarSign, MessageCircle, AlertCircle,
  Timer, Flame, CheckSquare, ArrowDown, TrendingUp, ThumbsUp, Shield, RefreshCw
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Contador regressivo de gatilho de oferta especial
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const coreBenefits = [
    {
      icon: ShieldAlert,
      title: 'Detecção de Ônus, Penhoras & CNIB',
      desc: 'Localize instantaneamente alienações fiduciárias, hipotecas, penhoras judiciais e bloqueios do sistema CNIB sem perigo de evicção.'
    },
    {
      icon: Clock,
      title: 'Reconstrução da Cadeia Dominial',
      desc: 'Mapeie o histórico completo de compradores, vendedores, escrituras, partilhas e doações (R-1 ao R-N) em uma linha do tempo clara.'
    },
    {
      icon: Brain,
      title: 'IA Registrária Anti-Alucinação (Temp 0.0)',
      desc: 'Algoritmo treinado exclusivamente na Lei nº 6.015/73 com extração 100% literal dos fatos gravados na matrícula.'
    },
    {
      icon: FileText,
      title: 'Dossiê Executivo em PDF & WhatsApp',
      desc: 'Gere pareceres profissionais formatados para Due Diligence com carimbo digital registral, prontos para enviar a clientes e bancos.'
    },
    {
      icon: Compass,
      title: 'Georreferenciamento & CAR/SIGEF',
      desc: 'Identifique códigos do CAR, CCIR/INCRA, ITR, certidão SIGEF e responsabilidade técnica de imóveis urbanos e rurais.'
    },
    {
      icon: Lock,
      title: 'Criptografia Bancária & LGPD',
      desc: 'Processamento seguro com criptografia SSL 256-bit. Seus documentos permanecem em estrito sigilo registral.'
    }
  ];

  const steps = [
    {
      step: '01',
      icon: FileUp,
      title: 'Envie a Matrícula em PDF',
      description: 'Faça o upload do documento digital ou digitalizado de qualquer cartório do Brasil.'
    },
    {
      step: '02',
      icon: Brain,
      title: 'Auditoria dos 12 Módulos',
      description: 'A IA Registrária varre cada folha, extraindo proprietários, ônus, averbações e georreferenciamento.'
    },
    {
      step: '03',
      icon: CheckCircle2,
      title: 'Identificação Instantânea de Riscos',
      description: 'Veja o Score de Risco de 0 a 100 e o diagnóstico em palavras simples para leigos e especialistas.'
    },
    {
      step: '04',
      icon: ShieldCheck,
      title: 'Baixe o Dossiê em PDF',
      description: 'Exporte o relatório completo formatado para auditoria ou compartilhe direto no WhatsApp.'
    }
  ];

  const metrics = [
    { value: '14.800+', label: 'Matrículas Auditadas' },
    { value: 'R$ 48 Mi', label: 'Riscos Imobiliários Evitados' },
    { value: '99.8%', label: 'Precisão Registrária' },
    { value: '< 30 seg', label: 'Tempo Médio de Resposta' }
  ];

  const testimonials = [
    {
      name: 'Dr. Roberto Magalhães',
      role: 'Advogado Especialista em Direito Imobiliário (OAB/SP)',
      content: 'O Valida Imóvel reduziu o tempo de Due Diligence da minha equipe de 4 dias para segundos. O Dossiê PDF gerado é impecável e passa extrema segurança aos nossos clientes.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
      location: 'São Paulo, SP'
    },
    {
      name: 'Eng. Fernando Alencar',
      role: 'Engenheiro Civil & Perito Perimetral (CREA/SP)',
      content: 'Como engenheiro perito, a extração automática dos dados de memorial descritivo, áreas averbadas e georreferenciamento pelo Valida Imóvel economiza dias de auditoria.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      location: 'Ribeirão Preto, SP'
    },
    {
      name: 'Dr. Ricardo Menezes',
      role: 'Leiloeiro Oficial Notarial & Judicial',
      content: 'Analisamos centenas de certidões por lote antes dos leilões. O Valida Imóvel identifica penhoras CNIB, hipotecas e gravames em segundos com 100% de precisão.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      location: 'Rio de Janeiro, RJ'
    },
    {
      name: 'Eng. Sérgio Bastos',
      role: 'Agrimensor & Topógrafo Credenciado (INCRA/SIGEF)',
      content: 'Para imóveis rurais e glebas, a validação de confrontantes, código INCRA, CCIR e certidão SIGEF feita pela IA é perfeita para regularização fundiária.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
      location: 'Goiânia, GO'
    },
    {
      name: 'Mariana Silveira',
      role: 'Corretora de Imóveis (CRECI 42.190-SP)',
      content: 'Antes eu perdia vendas porque o cliente tinha medo de pendências escondidas na matrícula. Agora apresento o parecer do Valida Imóvel na hora da proposta!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      location: 'Campinas, SP'
    },
    {
      name: 'Carlos Eduardo Faria',
      role: 'Investidor Imobiliário & Arrematante de Leilões',
      content: 'Em leilões e compra de imóveis, segundos valem ouro. A detecção automática de penhoras CNIB e alienação me salvou de um prejuízo gigantesco.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
      location: 'Curitiba, PR'
    },
    {
      name: 'Técnico Márcio Oliveira',
      role: 'Técnico em Agrimensura & Geoprocessamento (CRT/MS)',
      content: 'A extração automática de coordenadas UTM e delimitação de confronto no módulo de Georreferenciamento accelera a montagem de processos no SIGEF.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
      location: 'Campo Grande, MS'
    },
    {
      name: 'Técnica Beatriz Siqueira',
      role: 'Técnica Registral & Escrevente Notarial',
      content: 'No cotidiano cartorário, conferir averbações em certidões de 30 páginas era exaustivo. A IA Registrária organiza os 12 módulos notariais com perfeição.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&q=80',
      location: 'Porto Alegre, RS'
    }
  ];

  const faqs = [
    {
      q: 'O sistema aceita PDFs digitalizados ou escaneados de cartórios antigos?',
      a: 'Sim! Nosso motor inclui OCR Registrário especializado de alta resolução capaz de ler e interpretar certidões digitais e escaneadas de cartórios de todo o Brasil.'
    },
    {
      q: 'A IA substitui a necessidade de certidão atualizada do cartório?',
      a: 'Não. O Valida Imóvel realiza a auditoria e análise de Due Diligence sobre o documento fornecido. Para a lavratura da escritura, a certidão oficial do cartório continua sendo exigida por lei.'
    },
    {
      q: 'Como funciona a liberação após o pagamento via Pix?',
      a: 'A liberação é 100% automática em menos de 5 segundos através do nosso Webhook integrado com o Mercado Pago. O seu acesso de 6 Meses Ilimitados fica disponível imediatamente.'
    },
    {
      q: 'Existe algum limite de uploads durante o período de 6 meses?',
      a: 'Não! Durante os 6 meses de acesso você pode analisar quantas matrículas imobiliárias desejar sem nenhum custo adicional.'
    },
    {
      q: 'Seus dados e documentos estão seguros?',
      a: 'Sim, totalmente. Utilizamos criptografia de nível bancário SSL 256-bit e cumprimos rigorosamente as diretrizes da LGPD (Lei Geral de Proteção de Dados).'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white pb-16 sm:pb-0">
      
      {/* 🔴 CRO BANNER SUPERIOR DE URGÊNCIA & OFERTA — HIGH VISIBILITY */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white text-xs sm:text-sm font-black py-2.5 px-4 text-center shadow-xl flex items-center justify-center gap-2.5 flex-wrap relative z-50 border-b border-emerald-400/30">
        <div className="flex items-center gap-1.5 bg-amber-400/20 px-2.5 py-0.5 rounded-full text-amber-300 border border-amber-400/40 animate-pulse">
          <Flame className="w-4 h-4 text-amber-300 fill-amber-400 shrink-0" />
          <span>OFERTA IMPERDÍVEL</span>
        </div>
        <span className="tracking-wide">DE <span className="line-through opacity-75">R$ 599,40</span> POR APENAS <strong className="text-amber-300 font-mono text-sm underline decoration-amber-300 underline-offset-2">R$ 99,90</strong> (6 MESES ILIMITADOS)</span>
        <div className="bg-slate-950/60 px-3 py-1 rounded-full text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 border border-amber-400/40 shadow-inner">
          <Timer className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>

      {/* 🟢 HEADER / NAVBAR SLIM & FIXO ESTILO AI PLATFORM */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/80 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform font-black">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-tight">
                Valida<span className="text-emerald-400">Imóvel</span>
              </span>
            </div>
            <Badge variant="outline" className="border-emerald-400/50 text-emerald-300 bg-emerald-500/20 text-[10px] font-black px-2.5 py-0.5 rounded-full hidden sm:inline-flex shadow-sm">
              AI 2.0
            </Badge>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="text-slate-200 hover:text-white hover:bg-slate-800/80 font-bold text-xs px-4 h-9 rounded-xl transition-all">
                Entrar
              </Button>
            </Link>

            <Link to="/app">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 sm:px-5 h-9 shadow-xl shadow-emerald-500/30 rounded-xl transition-all hover:scale-105">
                <span>Analisar Matrícula</span>
                <ArrowRight className="ml-1.5 w-4 h-4 stroke-[2.5]" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 🚀 HERO SECTION COM IMAGEM DE FUNDO DA MATRÍCULA E DESIGN MINIMALISTA */}
      <section className="relative pt-12 sm:pt-16 lg:pt-20 pb-24 overflow-hidden bg-[#050a0a] text-white border-b border-slate-900">
        
        {/* Background Image: Matrícula de Imóvel Cartorária — Ampliada & Alta Visibilidade */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none scale-110 sm:scale-115 md:scale-125 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: "url('/hero_matricula_bg.png')",
            opacity: 0.68,
            filter: 'contrast(1.15) brightness(0.95) saturate(1.15)',
          }}
        />

        {/* Soft Radial & Linear Gradients to frame text perfectly */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#050a0a]/70 via-[#050a0a]/35 to-[#050a0a]/95" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_15%,_#050a0a_90%)]" />

        {/* Ambient Tech Glows */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute -top-20 left-1/4 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          {/* AI Badge — Alta Destacabilidade */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-black shadow-lg shadow-emerald-500/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Inteligência Artificial Registrária Especializada</span>
          </div>

          {/* Clean Headline — Máxima Legibilidade & Brilho */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-md">
              Analisador Inteligente de <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">Matrículas de Imóveis</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-200 font-semibold leading-relaxed max-w-2xl mx-auto drop-shadow-sm bg-slate-950/40 p-2 rounded-2xl border border-slate-800/40 backdrop-blur-sm">
              Auditoria notarial automatizada de 12 módulos, diagnósticos em palavras simples, Score de Risco e emissão de Dossiê em PDF em segundos.
            </p>
          </div>

          {/* Central AI Demonstration Launchpad (Estilo Product Tour / Live Demo) */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950/80 border border-emerald-500/50 shadow-2xl shadow-emerald-500/20 rounded-3xl backdrop-blur-xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-3">
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider">
                  ✨ Demonstração Interativa em Tempo Real
                </Badge>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Veja a IA Registrária Auditando um Imóvel Rural Complexo
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-lg mx-auto leading-relaxed">
                  Experimente agora sem necessidade de cadastro. Veja a extração automatizada de <strong className="text-white font-bold">1.450 Hectares, Georreferenciamento SIGEF/INCRA, CAR e os 12 Módulos Registrais</strong>.
                </p>
              </div>

              {/* CTA Principal de Demonstração */}
              <div className="pt-2">
                <Link to="/app?sample=safe" className="inline-block w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm px-8 py-6 rounded-2xl shadow-xl shadow-emerald-500/30 gap-2.5 transition-all hover:scale-105">
                    <Sparkles className="w-5 h-5 fill-slate-950 stroke-[2]" />
                    <span>VER DEMONSTRAÇÃO PRÁTICA INSTANTÂNEA</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </Button>
                </Link>
              </div>

              {/* Subtexto Informativo */}
              <div className="pt-1 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium flex-wrap">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sem necessidade de cadastro</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tour guiado em 1 clique</span>
              </div>
            </div>
          </div>

          {/* Selos de Confiança Próximos ao CTA */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-300 font-bold pt-2">
            <span className="flex items-center gap-1.5 text-slate-200 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <div className="flex text-amber-400"><Star className="w-3.5 h-3.5 fill-amber-400" /><Star className="w-3.5 h-3.5 fill-amber-400" /><Star className="w-3.5 h-3.5 fill-amber-400" /><Star className="w-3.5 h-3.5 fill-amber-400" /><Star className="w-3.5 h-3.5 fill-amber-400" /></div>
              <strong className="text-white">4.9/5</strong> (1.840+ avaliações)
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Lei nº 6.015/73 & Provimento CNJ 89/19
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <Lock className="w-4 h-4 text-emerald-400" />
              Sigilo Registral LGPD
            </span>
          </div>

          {/* Métricas no Hero */}
          <div className="pt-6 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center">
            {metrics.map((m, i) => (
              <div key={i} className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">{m.value}</div>
                <div className="text-[11px] text-slate-400 font-medium">{m.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 🤖 NOVA SEÇÃO EXCLUSIVA: AGENTE DE INTELIGÊNCIA REGISTRÁRIA IA */}
      <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Conheça seu Assistente Notarial 24/7</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Tire Qualquer Dúvida com Nosso <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Agente de IA Registrária</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
              Esqueça jargões jurídicos indecifráveis. O nosso Agente de IA absorve centenas de páginas da certidão do imóvel em segundos e responde a qualquer pergunta em linguagem simples e objetiva.
            </p>
          </div>

          {/* Grid Interativo do Agente de IA */}
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Esquerda: Recursos e Capacidades do Agente */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-5 shadow-xl">
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0">
                    <Sparkles className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">IA Especializada Notarial</h3>
                    <span className="text-xs text-emerald-400 font-bold">Treinada na Lei nº 6.015/73</span>
                  </div>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300 font-medium">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Respostas em Segundos:</strong> Pergunte sobre proprietários, áreas, doações, usufrutos ou gravames.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Temperatura 0.0 (Anti-Alucinação):</strong> Extração 100% fiel ao texto e aos fatos gravados pelo cartório.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Diagnóstico de Segurança:</strong> Identifica riscos de evicção imobiliária e sugere certidões complementares.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Disponível em Qualquer Dispositivo:</strong> Tire dúvidas direto do celular durante reuniões ou cartório.</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link to="/app?sample=safe">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-11 rounded-xl shadow-lg shadow-emerald-500/20 gap-2">
                      <MessageCircle className="w-4 h-4" /> Conversar com a IA na Prática
                    </Button>
                  </Link>
                </div>

              </div>
            </div>

            {/* Direita: Visual Mockup do Chat com o Agente de IA */}
            <div className="lg:col-span-7">
              <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden text-white backdrop-blur-xl">
                
                {/* Header do Mockup do Chat */}
                <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        Agente de IA Registrária
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[9px] font-black uppercase">Online 24/7</Badge>
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">Analisando Matrícula Nº 47.912 (Curitiba/PR)</span>
                    </div>
                  </div>
                </div>

                {/* Corpo do Chat Simulativo */}
                <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm bg-slate-950/80">
                  
                  {/* Mensagem da IA */}
                  <div className="flex gap-3 max-w-[90%]">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none space-y-1">
                      <p className="text-slate-200 leading-relaxed font-medium">
                        Olá! Analisei todos os atos registrados na Matrícula Nº 47.912. Encontrei <strong className="text-emerald-400">1 alienação fiduciária ativa (R-4)</strong> e <strong className="text-amber-300">0 indisponibilidades CNIB</strong>. Em que posso te ajudar?
                      </p>
                    </div>
                  </div>

                  {/* Mensagem do Usuário */}
                  <div className="flex gap-3 max-w-[85%] ml-auto justify-end">
                    <div className="p-3.5 bg-emerald-600 text-white rounded-2xl rounded-tr-none">
                      <p className="font-semibold">Quem são os atuais proprietários do imóvel que precisam assinar a escritura?</p>
                    </div>
                  </div>

                  {/* Resposta da IA */}
                  <div className="flex gap-3 max-w-[90%]">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none space-y-2">
                      <p className="text-slate-200 leading-relaxed font-medium">
                        De acordo com o registro <strong className="text-white font-bold">R-3/47.912</strong>, os proprietários atuais são:
                      </p>
                      <ul className="space-y-1 text-xs text-slate-300 font-semibold border-l-2 border-emerald-500 pl-3">
                        <li>• <strong className="text-white">Carlos Eduardo Faria</strong> (CPF 042.***.***-18) — 50% da propriedade</li>
                        <li>• <strong className="text-white">Mariana Silveira Faria</strong> (CPF 089.***.***-45) — 50% da propriedade</li>
                      </ul>
                      <p className="text-[11px] text-emerald-400 font-bold pt-1">
                        ✓ Ambos devem assinar a promessa de compra e venda.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Footer do Chat Mockup com Botões de Pergunta Rápida */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Exemplos:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 shrink-0 font-medium">🚨 Tem penhora ativa?</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 shrink-0 font-medium">📐 Qual a área construída?</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 shrink-0 font-medium">📋 Quais certidões pedir?</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 📊 SEÇÃO PROPOSTA DE VALOR & MATRIZ COMPARATIVA (CRO DIFFERENTIAL) */}
      <section className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-3.5 py-1 font-extrabold text-xs uppercase">
              Por Que Mudar Hoje?
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Análise Manual vs Valida Imóvel com IA
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-medium">
              Veja o comparativo direto de eficiência, economia de dinheiro e eliminação de riscos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Lado Tradicional / Manual */}
            <Card className="bg-slate-950 border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-300">Análise Manual Tradicional</h3>
                  <span className="text-xs text-slate-500">Requer verificação exaustiva folha por folha</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center font-bold">
                  📋
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Tempo Necessário</span>
                  <span className="font-bold text-slate-200">3 a 5 dias úteis por matrícula</span>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Custo Médio</span>
                  <span className="font-bold text-slate-200">R$ 1.500 a R$ 3.500 por parecer avulso</span>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Conferência Registrária</span>
                  <span className="font-bold text-slate-300">Exige verificação minuciosa de cada ato averbado ao longo das páginas</span>
                </div>
              </div>
            </Card>

            {/* Lado Valida Imóvel */}
            <Card className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-2 border-emerald-500/60 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl relative">
              <div className="absolute top-4 right-4">
                <Badge className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase">
                  Recomendado ⚡
                </Badge>
              </div>

              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Valida Imóvel <Sparkles className="w-4 h-4 text-emerald-400" />
                  </h3>
                  <span className="text-xs text-emerald-300 font-semibold">Tecnologia Notarial com IA Registrária</span>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl space-y-1">
                  <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider block">Tempo Necessário</span>
                  <span className="font-bold text-white text-base">Menos de 30 segundos</span>
                </div>

                <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl space-y-1">
                  <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider block">Custo por Matrícula</span>
                  <span className="font-bold text-emerald-300 text-base">Apenas R$ 99,90 (6 Meses Ilimitados)</span>
                </div>

                <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl space-y-1">
                  <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider block">Segurança Jurídica</span>
                  <span className="font-bold text-white text-base">100% de varredura nos 12 módulos especialistas</span>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </section>

      {/* 💡 BENEFÍCIOS PRÁTICOS (GRID EM CARDS COM ÍCONES) */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-3.5 py-1 font-extrabold text-xs uppercase">
              12 Módulos Especialistas
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Tudo o Que Você Precisa em um Único Lugar
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-medium">
              Elimine incertezas na compra, venda ou Due Diligence imobiliária.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreBenefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <Card key={i} className="bg-slate-900/90 border-slate-800 p-6 rounded-3xl space-y-4 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">{b.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{b.desc}</p>
                </Card>
              );
            })}
          </div>

        </div>
      </section>

      {/* 🔄 COMO FUNCIONA (4 PASSOS SIMPLES) */}
      <section className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-3.5 py-1 font-extrabold text-xs uppercase">
              Fluxo Sem Fricção
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Como Funciona a Auditoria em 4 Passos
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-medium">
              Simples, intuitivo e sem necessidade de instalação de software.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <Card key={idx} className="bg-slate-950 border-slate-800 p-6 rounded-3xl space-y-4 relative group hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-700 group-hover:text-emerald-400 transition-colors">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{s.description}</p>
                </Card>
              );
            })}
          </div>

        </div>
      </section>

      {/* ⭐ PROVA SOCIAL & DEPOIMENTOS DE CLIENTES */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-3.5 py-1 font-extrabold text-xs uppercase">
              Prova Social Reais
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Quem Usa e Recomenda o Valida Imóvel
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-medium">
              Advogados, corretores de imóveis, investidores e notários que transformaram seu fluxo de Due Diligence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-slate-900 border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(t.rating)].map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {t.location && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {t.location}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed font-medium">
                    "{t.content}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/40 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h4 className="text-xs font-black text-white">{t.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-snug">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* 🏷️ OFERTA IMBATÍVEL (PRICING & ESCASSEZ REAL) */}
      <section id="oferta" className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/60 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 relative overflow-hidden text-center">
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            <Badge className="bg-emerald-500 text-slate-950 font-black text-xs uppercase px-4 py-1.5 rounded-full mx-auto">
              ⚡ OPORTUNIDADE IMPERDÍVEL — 83% DE DESCONTO
            </Badge>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Acesso Ilimitado por 6 Meses
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-medium">
                Analise quantas matrículas quiser por 180 dias. Sem mensalidades adicionais e com transparência total.
              </p>
            </div>

            <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl max-w-md mx-auto space-y-4 shadow-inner">
              <div className="text-xs text-slate-400 line-through font-bold">De R$ 599,40</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl sm:text-6xl font-black text-white">R$ 99</span>
                <span className="text-2xl font-extrabold text-white">,90</span>
              </div>
              <span className="text-xs text-emerald-400 font-extrabold block">Economia de R$ 499,50 • Pagamento Único (Pix ou Cartão)</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-left text-xs text-slate-300 font-semibold max-w-lg mx-auto">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Uploads e análises 100% ilimitados</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Relatório executivo completo dos 12 módulos</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Exportação de Dossiê PDF com Carimbo Digital</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> 1-Clique para copiar qualquer campo</div>
            </div>

            <div className="space-y-3 pt-2">
              <Link to="/pagamento-pix" className="block w-full max-w-md mx-auto">
                <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg py-7 rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-105">
                  <CreditCard className="mr-2.5 h-6 w-6" />
                  Garantir Acesso Ilimitado Agora
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 7 Dias de Garantia Incondicional</span>
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Liberação Imediata via Webhook</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 🛡️ TRATAMENTO DE OBJEÇÕES & FAQ */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-3.5 py-1 font-extrabold text-xs uppercase">
              Tire Suas Dúvidas
            </Badge>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Perguntas Frequentes (FAQ)
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:border-emerald-500/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between font-bold text-white text-sm">
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === index ? 'rotate-90 text-emerald-400' : ''}`} />
                </div>
                {activeFaq === index && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800 font-medium">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 🚀 CTA FINAL DECISIVO */}
      <section className="py-16 bg-slate-900 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Pronto para Automatizar Suas Análises Notariais?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-medium">
            Junte-se a mais de 1.800 profissionais que economizam tempo e eliminam riscos imobiliários todos os dias.
          </p>
          <Link to="/app" className="inline-block">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base px-8 py-6 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 gap-2">
              <Upload className="w-5 h-5" /> Experimentar Matrícula Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* 📌 BARRA FIXA DE CONVERSÃO NO RODAPÉ MOBILE (STICKY BOTTOM CTA) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800 p-3 sm:hidden shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-black text-white block">Valida Imóvel (6 Meses)</span>
          <span className="text-[11px] font-extrabold text-emerald-400 block">Apenas R$ 99,90</span>
        </div>
        <Link to="/pagamento-pix">
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md">
            Garantir Agora <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
              <FileCheck className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="text-base font-black text-white">
              Valida<span className="text-emerald-400">Imóvel</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 text-center font-medium">
            © {new Date().getFullYear()} Valida Imóvel. Análise Automatizada de Matrículas Imobiliárias. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <Link to="/auth" className="hover:text-white transition-colors">Entrar</Link>
            <Link to="/pagamento-pix" className="hover:text-white transition-colors">Planos & Pix</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;