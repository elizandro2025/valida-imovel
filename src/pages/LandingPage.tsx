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
      role: 'Advogado Especialista em Direito Imobiliário',
      content: 'O Valida Imóvel reduziu o tempo de Due Diligence da minha equipe de 4 dias para segundos. O Dossiê PDF gerado é impecável e passa extrema segurança aos nossos clientes.',
      rating: 5
    },
    {
      name: 'Mariana Silveira',
      role: 'Corretora de Imóveis (CRECI 42.190-SP)',
      content: 'Antes eu perdia vendas porque o cliente tinha medo de pendências escondidas na matrícula. Agora apresento o parecer do Valida Imóvel na hora da proposta!',
      rating: 5
    },
    {
      name: 'Carlos Eduardo Faria',
      role: 'Investidor Imobiliário & Arrematante',
      content: 'Em leilões e compra de imóveis, segundos valem ouro. A detecção automática de penhoras CNIB e alienação me salvou de um prejuízo gigantesco.',
      rating: 5
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
      
      {/* 🔴 CRO BANNER SUPERIOR DE URGÊNCIA & OFERTA */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs sm:text-sm font-extrabold py-2.5 px-4 text-center shadow-lg flex items-center justify-center gap-2 flex-wrap">
        <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
        <span>OFERTA DE LANÇAMENTO: 6 MESES ILIMITADOS POR APENAS R$ 49,90</span>
        <div className="bg-slate-950/40 px-2.5 py-0.5 rounded-full text-amber-300 font-mono text-xs flex items-center gap-1 border border-amber-400/30">
          <Timer className="w-3.5 h-3.5" />
          <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>

      {/* 🟢 HEADER / NAVBAR SLIM & FIXO */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <FileCheck className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-tight">
                Valida<span className="text-emerald-400">Imóvel</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block -mt-1">
                IA Registrária Ativa
              </span>
            </div>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-xs sm:text-sm px-3 sm:px-4 rounded-xl">
                Entrar
              </Button>
            </Link>

            <Link to="/pagamento-pix">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm px-4 sm:px-6 shadow-lg shadow-emerald-600/30 rounded-xl transition-all hover:scale-105">
                <span>Analisar Matrícula</span>
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 🚀 HERO SECTION (PRIMEIRA DOBRA DE ALTA CONVERSÃO) */}
      <section className="relative pt-12 sm:pt-16 lg:pt-20 pb-20 overflow-hidden bg-slate-950 text-white border-b border-slate-800/80">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-25">
          <div className="absolute -top-20 left-1/4 w-96 h-96 bg-emerald-500/50 rounded-full blur-3xl" />
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-teal-500/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge de Confiança CNJ & Lei 6.015/73 */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-extrabold shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Auditoria Registrária de Due Diligence com IA</span>
              </div>

              {/* Headline Principal Focada no Benefício Central */}
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                  Audite Matrículas Imobiliárias em{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
                    Segundos sem Risco de Evicção.
                  </span>
                </h1>
                <p className="text-base sm:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Faça o upload do PDF da certidão. Nossa Inteligência Registrária varre <strong>100% das páginas</strong>, detecta penhoras, hipotecas e gera o parecer completo em menos de 30 segundos.
                </p>
              </div>

              {/* CTAs Principais e Widget de Ação Direta */}
              <div className="pt-2 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link to="/app" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base sm:text-lg px-8 py-7 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.03]">
                      <Upload className="mr-2.5 h-5 w-5 stroke-[2.5]" />
                      Testar Matrícula Agora
                      <ArrowRight className="ml-2.5 h-5 w-5" />
                    </Button>
                  </Link>

                  <Link to="/pagamento-pix" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:text-white font-bold text-base px-6 py-7 rounded-2xl">
                      <CreditCard className="mr-2 h-5 w-5 text-emerald-400" />
                      Assinar 6 Meses (R$ 49,90)
                    </Button>
                  </Link>
                </div>

                {/* Selos de Confiança Próximos ao CTA */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-400 font-semibold pt-3">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <div className="flex text-amber-400"><Star className="w-3.5 h-3.5 fill-amber-400" /><Star className="w-3.5 h-3.5 fill-amber-400" /><Star className="w-3.5 h-3.5 fill-amber-400" /><Star className="w-3.5 h-3.5 fill-amber-400" /><Star className="w-3.5 h-3.5 fill-amber-400" /></div>
                    <strong className="text-white">4.9/5</strong> (1.840+ avaliações)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Lei nº 6.015/73 & Provimento CNJ 89/19
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    Sigilo Registral LGPD
                  </span>
                </div>
              </div>

              {/* Métricas de Prova Social no Hero */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
                {metrics.map((m, i) => (
                  <div key={i}>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">{m.value}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{m.label}</div>
                  </div>
                ))}
              </div>

            </div>

            {/* Hero Right Visual: Demo Card Interativo da Matrícula em IA */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Aura Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-3xl blur-2xl opacity-30 animate-pulse" />

                {/* Card de Demonstração Registral */}
                <div className="relative bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden text-white p-5 space-y-4">
                  
                  {/* Status Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">
                        Motor OCR & IA Registrária
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
                      12 Módulos Ativos
                    </Badge>
                  </div>

                  {/* Documento Simulado com Scanner */}
                  <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-[11px] leading-relaxed text-slate-300 overflow-hidden shadow-inner">
                    <div className="text-center border-b border-slate-800 pb-2 space-y-0.5">
                      <div className="font-bold text-white uppercase text-[10px] tracking-wider">
                        CARTÓRIO DO 1º REGISTRO DE IMÓVEIS — COMARCA DA CAPITAL
                      </div>
                      <div className="text-emerald-400 font-extrabold text-xs">
                        MATRÍCULA Nº 142.890 — LIVRO 2 (REGISTRO GERAL)
                      </div>
                    </div>

                    <div className="space-y-2 text-[10px] leading-snug">
                      <p className="text-slate-400">
                        <strong className="text-slate-200">IMÓVEL:</strong> Lote de terreno nº 12 da Quadra B, com área total de <span className="bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">480,00 m²</span>.
                      </p>

                      <div className="p-2 bg-slate-900 border border-emerald-500/40 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-emerald-400 font-bold text-[10px]">
                          <span>R-3 / 142.890 — TRANSMISSÃO DE PROPRIEDADE</span>
                          <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.5 rounded">EXTRAÍDO VIA IA</span>
                        </div>
                        <p className="text-slate-200 text-[10px]">
                          <strong>Adquirente:</strong> MARCOS VINÍCIUS DOS SANTOS (CPF nº 123.456.789-00).
                        </p>
                      </div>

                      <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-[10px]">
                        <span className="text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Matrícula Auditada — Livre de Ônus
                        </span>
                        <span className="text-slate-400 text-[9px]">Zero Penhoras CNIB</span>
                      </div>
                    </div>
                  </div>

                  {/* Micro Cards */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Titular Atual</span>
                        <span className="text-white font-bold text-[11px] truncate block">Marcos V. Santos</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Score de Risco</span>
                        <span className="text-emerald-400 font-bold text-[11px] block">Baixo (15/100)</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/app" className="block pt-1">
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl py-4 gap-2 shadow-lg shadow-emerald-600/30">
                      <FileCheck className="w-4 h-4" /> Testar Auditoria Agora
                    </Button>
                  </Link>

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
                  <span className="text-xs text-slate-500">Lenta, cara e sujeita a erros humanos</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                  ❌
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
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Segurança Jurídica</span>
                  <span className="font-bold text-red-400">Risco de omitir penhoras em certidões de 20 páginas</span>
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
                  <span className="font-bold text-emerald-300 text-base">Apenas R$ 49,90 (6 Meses Ilimitados)</span>
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

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-slate-900 border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed font-medium">
                    "{t.content}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-inner">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{t.role}</p>
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
              ⚡ Oferta Especial de Lançamento
            </Badge>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Acesso Ilimitado por 6 Meses
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-medium">
                Analise quantas matrículas quiser por 180 dias. Sem mensalidades recorrentes, sem pegadinhas.
              </p>
            </div>

            <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl max-w-md mx-auto space-y-4 shadow-inner">
              <div className="text-xs text-slate-400 line-through font-bold">De R$ 199,90</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl sm:text-6xl font-black text-white">R$ 49</span>
                <span className="text-2xl font-extrabold text-white">,90</span>
              </div>
              <span className="text-xs text-emerald-400 font-extrabold block">Pagamento Único via Pix ou Cartão (Ativação em 5 seg)</span>
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
          <span className="text-[11px] font-extrabold text-emerald-400 block">Apenas R$ 49,90</span>
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