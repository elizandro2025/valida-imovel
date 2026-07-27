import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  FileCheck, ShieldCheck, Upload, ArrowRight, Sparkles, Brain, ShieldAlert,
  FileText, CheckCircle2, Zap, Clock, Compass, MapPin, Users, Layers, Lock,
  ChevronRight, Star, Award, CreditCard, Check, FileUp, AlertTriangle, CheckCircle,
  Building2, Scale, FileSearch, HelpCircle, XCircle, DollarSign, MessageCircle, AlertCircle,
  Timer, Flame, CheckSquare, Sparkle, ArrowDown
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const painPoints = [
    {
      title: 'Documentos Extensos & Leitura Complexa',
      desc: 'Certidões com registros antigos, carimbos históricos e linguagem jurídica especializada que demandam análise detalhada.',
      icon: Clock,
    },
    {
      title: 'Elevada Carga Horária de Análise',
      desc: 'Horas preciosas dedicadas ao exame minucioso de cada folha para averiguar a existência de pendências ou gravames.',
      icon: Timer,
    },
    {
      title: 'Necessidade de Precisão Absoluta',
      desc: 'A existência de um gravame em página secundária requer atenção total para assegurar a tranquilidade da operação.',
      icon: AlertTriangle,
    },
  ];

  const automationBenefits = [
    {
      title: 'Upload Prático do PDF',
      desc: 'Basta enviar o arquivo da certidão. O sistema processa o documento de forma imediata sem necessidade de digitação.',
      icon: Upload,
    },
    {
      title: 'Processamento Automatizado Completo',
      desc: 'Nossa Inteligência Registrária analisa o documento integralmente, consolidando proprietários, histórico e ônus.',
      icon: Brain,
    },
    {
      title: 'Relatório Estruturado em Segundos',
      desc: 'Receba um diagnóstico em linguagem clara e acessível, pronto para salvar em PDF ou compartilhar no WhatsApp.',
      icon: Zap,
    },
  ];

  const steps = [
    {
      step: '01',
      icon: FileUp,
      title: 'Envio do PDF da Matrícula',
      description: 'Insira o arquivo da certidão de qualquer cartório do Brasil. Processamento seguro com sigilo registral.',
    },
    {
      step: '02',
      icon: Brain,
      title: 'Auditoria Automatizada',
      description: 'O motor inteligente examina as 12 camadas do documento, estruturando o histórico de titularidade e pendências.',
    },
    {
      step: '03',
      icon: ShieldCheck,
      title: 'Recebimento do Diagnóstico',
      description: 'Acesse instantaneamente o parecer em formato claro e exporte o relatório auditado em PDF.',
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Roberto Magalhães',
      role: 'Advogado Imobiliário',
      content:
        'A plataforma otimizou expressivamente nosso fluxo de análise notarial. O relatório é gerado em segundos com excelente precisão.',
      rating: 5,
    },
    {
      name: 'Mariana Silveira',
      role: 'Compradora de Imóvel',
      content:
        'O diagnóstico me deu total clareza sobre a situação da certidão de forma simples e direta antes da assinatura do contrato.',
      rating: 5,
    },
    {
      name: 'Carlos Eduardo Faria',
      role: 'Corretor de Imóveis (CRECI 45.120)',
      content:
        'Excelente ferramenta para apresentar transparência e segurança jurídica aos clientes no momento da proposta.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'O sistema realiza a leitura integral da certidão?',
      a: 'Sim! Nosso motor de inteligência analisa 100% das páginas do documento, consolidando titulares, transmissões, ônus e averbações em um relatório único.',
    },
    {
      q: 'O relatório é acessível para quem não possui formação jurídica?',
      a: 'Sim! O relatório apresenta uma síntese em linguagem clara, destacando os pontos principais de titularidade, pendências e recomendações de forma direta.',
    },
    {
      q: 'Qual é a economia de tempo com a automação?',
      a: 'O processamento automatizado reduz o tempo de análise documental para aproximadamente 10 segundos, proporcionando elevada eficiência.',
    },
    {
      q: 'O modelo de pagamento requer assinatura?',
      a: 'Não. O sistema funciona no modelo por uso (análise avulsa via Pix por R$ 49,90), sem mensalidades obrigatórias.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Banner Informativo de Eficiência */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white text-xs sm:text-sm font-bold py-2.5 px-4 text-center shadow-md flex items-center justify-center gap-2">
        <Timer className="w-4 h-4 text-emerald-300 animate-pulse" />
        <span>EFICIÊNCIA EM ANÁLISE REGISTRAL: Diagnóstico Completo Automatizado em 10 Segundos</span>
        <Badge variant="outline" className="border-emerald-300 text-emerald-100 bg-emerald-700/50 text-[10px] hidden md:inline-flex">
          Elevada Otimização de Tempo
        </Badge>
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <FileCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                Valida<span className="text-emerald-400">Imóvel</span>
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 border-emerald-500/40 bg-emerald-500/10 py-0 px-1.5">
                  Automação Registral
                </Badge>
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:block">Análise Inteligente e Auditada</span>
            </div>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-sm px-3 sm:px-4 rounded-xl">
                Entrar
              </Button>
            </Link>

            <Link to="/auth">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm px-4 sm:px-6 shadow-lg shadow-emerald-600/30 rounded-xl transition-all hover:scale-105">
                <span className="hidden sm:inline">Analisar Matrícula Agora</span>
                <span className="sm:hidden">Analisar</span>
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Elegante & Corporativa */}
      <section className="relative pt-12 sm:pt-16 md:pt-20 pb-20 md:pb-28 overflow-hidden bg-slate-900 text-white border-b border-slate-800">
        
        {/* Background Radial Lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-30">
          <div className="absolute -top-20 left-1/4 w-96 h-96 bg-emerald-500/40 rounded-full blur-3xl" />
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-teal-500/40 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              
              {/* Badge Institucional */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-extrabold shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Plataforma Profissional de Diagnóstico Notarial</span>
              </div>

              {/* Headline Principal Elegante */}
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                  Automatize a Auditoria de Matrículas Imobiliárias.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
                    O Valida Imóvel Processa Tudo Por Você.
                  </span>
                </h1>
                <p className="text-base sm:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Faça o upload do documento em PDF. Em <strong>10 segundos</strong> nossa Inteligência Registrária analisa todas as folhas, mapeia titulares, identifica ônus e gera um relatório auditado em linguagem clara.
                </p>
              </div>

              {/* Botões e Widget de Envio Rápido de PDF no Hero */}
              <div className="pt-2 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link to="/app" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base sm:text-lg px-8 py-7 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.03] active:scale-[0.98]">
                      <Upload className="mr-2.5 h-5 w-5 stroke-[2.5]" />
                      Analisar Matrícula Agora
                      <ArrowRight className="ml-2.5 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/pagamento-pix" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-800 hover:text-white font-bold text-base px-6 py-7 rounded-2xl">
                      <CreditCard className="mr-2 h-5 w-5 text-emerald-400" />
                      6 Meses Ilimitados (R$ 49,90)
                    </Button>
                  </Link>
                </div>

                {/* Box de Envio Rápido Direto no Hero */}
                <Link to="/app" className="block pt-1">
                  <div className="p-4 bg-slate-800/60 border border-dashed border-emerald-500/40 hover:border-emerald-400 hover:bg-slate-800/90 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 text-left group shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                        <FileUp className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">Envio Rápido de Certidão em PDF</span>
                        <span className="text-[11px] text-slate-400 font-medium block">Clique para abrir o painel de auditoria notarial instantânea</span>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-extrabold uppercase shrink-0">
                      Acesso Imediato
                    </Badge>
                  </div>
                </Link>

                {/* Selos de Agilidade */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-slate-400 font-medium pt-2">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Elevada otimização de tempo
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Linguagem Clara e Estruturada
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Relatório em PDF Auditado
                  </span>
                </div>
              </div>

              {/* Estatísticas de Tempo Salvo */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">98%</div>
                  <div className="text-xs text-slate-400 font-medium">Redução no Tempo de Análise</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">10 seg</div>
                  <div className="text-xs text-slate-400 font-medium">Diagnóstico Automatizado</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">12</div>
                  <div className="text-xs text-slate-400 font-medium">Módulos Auditados</div>
                </div>
              </div>

            </div>

            {/* Hero Right Visual: Mockup de Matrícula Real sendo Analisada por IA em Tempo Real */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Aura Glow de Fundo */}
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-3xl blur-2xl opacity-40 animate-pulse" />

                {/* Mockup Principal da Folha da Matrícula */}
                <div className="relative bg-slate-950 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden text-white p-5 space-y-4">
                  
                  {/* Status Bar do Scanner de IA */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">
                        Scanner de IA Registrária Ativo
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
                      Processando 12 Módulos
                    </Badge>
                  </div>

                  {/* Documento Registral Simulado (Folha de Matrícula) com Scanner Laser Animado */}
                  <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-[11px] leading-relaxed text-slate-300 overflow-hidden shadow-inner">
                    
                    {/* Linha de Feixe Laser Animado (Scanner Efect) */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981] z-20 animate-pulse pointer-events-none" />

                    {/* Cabeçalho Cartorário */}
                    <div className="text-center border-b border-slate-800 pb-2 space-y-0.5">
                      <div className="font-bold text-white uppercase text-[10px] tracking-wider">
                        CARTÓRIO DO 1º REGISTRO DE IMÓVEIS — COMARCA DA CAPITAL
                      </div>
                      <div className="text-emerald-400 font-extrabold text-xs">
                        MATRÍCULA Nº 142.890 — LIVRO 2 (REGISTRO GERAL)
                      </div>
                    </div>

                    {/* Linhas do Texto Registral com Realce de IA */}
                    <div className="space-y-2 text-[10px] leading-snug">
                      <p className="text-slate-400">
                        <strong className="text-slate-200">IMÓVEL:</strong> Lote de terreno sob nº 12 da Quadra B, situado à Av. Paulista, com área total de <span className="bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">480,00 m²</span>.
                      </p>

                      <div className="p-2 bg-slate-800/90 border border-emerald-500/40 rounded-xl space-y-1 relative">
                        <div className="flex items-center justify-between text-emerald-400 font-bold text-[10px]">
                          <span>R-3 / 142.890 — TRANSMISSÃO DE PROPRIEDADE</span>
                          <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.5 rounded">DETECTADO POR IA</span>
                        </div>
                        <p className="text-slate-200 text-[10px]">
                          <strong>Adquirente:</strong> MARCOS VINÍCIUS DOS SANTOS, brasileiro, casado, engenheiro, portador do CPF nº 123.456.789-00.
                        </p>
                      </div>

                      <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-[10px]">
                        <span className="text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Válida e Livre de Ônus
                        </span>
                        <span className="text-slate-400 text-[9px]">Zero Penhoras / CNIB</span>
                      </div>
                    </div>

                  </div>

                  {/* Micro-cards Flutuantes de Extração em Tempo Real */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-slate-950/80 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Titular Atual</span>
                        <span className="text-white font-extrabold text-[11px] truncate block">Marcos V. Santos</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-950/80 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Status de Risco</span>
                        <span className="text-emerald-400 font-extrabold text-[11px] block">Risco Baixo (15/100)</span>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Teste Imediato */}
                  <Link to="/auth" className="block pt-1">
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl py-4 gap-2 shadow-lg shadow-emerald-600/30">
                      <FileCheck className="w-4 h-4" /> Experimentar com Sua Matrícula Agora
                    </Button>
                  </Link>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Seção da Otimização da Análise Notarial */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-12">
            <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 px-3 py-1 font-bold text-xs">
              Otimização de Processos
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Os Desafios da Análise Manual de Certidões
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium">
              Compreenda como o Valida Imóvel transforma tarefas complexas de leitura notarial em diagnósticos ágeis e estruturados.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {painPoints.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="border-slate-200/80 bg-slate-50/70 p-6 rounded-3xl space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                </Card>
              );
            })}
          </div>

          {/* Seta de Transição */}
          <div className="text-center my-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
              <ArrowDown className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          {/* Benefícios da Automação Registral */}
          <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-black uppercase">
                Automação Especializada
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Como o Valida Imóvel Processa Suas Matrículas:
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-4">
              {automationBenefits.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-white text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* Seção Especializada: Investigação Completa da Cadeia Dominial */}
      <section className="py-20 bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs font-black uppercase px-3.5 py-1">
                🔗 Investigação de Histórico Registral
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Rastreio 100% Automatizado da Cadeia Dominial do Imóvel.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                Uma das etapas mais complexas da Due Diligence é reconstituir todas as transmissões passadas (R-1, R-2, R-3... R-N) para garantir que nenhuma venda anterior possui vícios que possam causar a perda do imóvel por evicção.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs sm:text-sm">Rastreamento da Linha de Proprietários</h4>
                    <p className="text-xs text-slate-400 font-medium">Mapeia instantaneamente todos os vendedores e compradores históricos, escrituras, doações e partilhas.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs sm:text-sm">Prevenção contra Nulidades e Evicção</h4>
                    <p className="text-xs text-slate-400 font-medium">Identifica se houve transferência irregular, usufrutos não baixados ou fraudes contra credores no passado.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs sm:text-sm">Evolução de Valores Registrados</h4>
                    <p className="text-xs text-slate-400 font-medium">Consolida o valor declarado em cada transação histórica para análise patrimonial e de mercado.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Timeline Mockup */}
            <div className="lg:col-span-6">
              <Card className="bg-slate-950 border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                  <span className="font-black text-emerald-400 uppercase tracking-wider text-[11px]">
                    Cadeia Dominial Cronológica Reconstruída
                  </span>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10 text-[10px]">
                    Histórico 100% Mapeado
                  </Badge>
                </div>

                {/* Vertical Timeline Nodes */}
                <div className="relative pl-6 space-y-4 text-xs before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500/40">
                  
                  {/* Node 1 */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                      1
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between font-bold text-white text-[11px]">
                        <span>R-1 / 142.890 — Compra e Venda (2010)</span>
                        <span className="text-slate-400 text-[10px]">R$ 250.000</span>
                      </div>
                      <p className="text-slate-400 text-[10px]">Vendedor: Construtora Alfa Ltda ➔ Comprador: João Alves Pereira</p>
                    </div>
                  </div>

                  {/* Node 2 */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                      2
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between font-bold text-white text-[11px]">
                        <span>AV-2 / 142.890 — Averbação de Construção (2015)</span>
                        <span className="text-emerald-400 text-[10px]">Averbada</span>
                      </div>
                      <p className="text-slate-400 text-[10px]">Averbada construção de residência unifamiliar de 220 m²</p>
                    </div>
                  </div>

                  {/* Node 3 */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                      3
                    </div>
                    <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-xl space-y-1">
                      <div className="flex items-center justify-between font-bold text-emerald-300 text-[11px]">
                        <span>R-3 / 142.890 — Transmissão Atual (2022)</span>
                        <span className="text-emerald-400 text-[10px]">R$ 850.000</span>
                      </div>
                      <p className="text-slate-200 text-[10px]">Vendedor: João Alves Pereira ➔ Comprador: Marcos V. Santos (Titular)</p>
                    </div>
                  </div>

                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-300 font-medium">
                  ✓ Nenhuma ruptura ou doação irregular identificada no histórico.
                </div>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* Como Funciona em 3 Passos */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 px-3 py-1 font-bold text-xs">
              Fluxo Simplificado
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Processo de Auditoria em 3 Passos
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Envie o documento e receba a análise notarial em poucos segundos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="bg-white border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6 stroke-[2]" />
                      </div>
                      <span className="text-3xl font-black text-slate-300 group-hover:text-emerald-500 transition-colors">
                        {item.step}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{item.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Seção Credibilidade, Confiança e Segurança Total */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 px-3.5 py-1 font-extrabold text-xs uppercase tracking-wider">
              Segurança & Confiança Institucional
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Por que Você Pode Confiar no Valida Imóvel?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Desenvolvido sob rígidas normas de sigilo registral, conformidade com a LGPD e precisão notarial de 99.8%.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-50/70 border-slate-200/80 p-6 rounded-3xl space-y-3 hover:border-emerald-400 transition-colors shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Lock className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Criptografia SSL 256-bit</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Padrão de segurança bancário. Seus documentos são encriptados no envio e processados sob total confidencialidade.
              </p>
            </Card>

            <Card className="bg-slate-50/70 border-slate-200/80 p-6 rounded-3xl space-y-3 hover:border-emerald-400 transition-colors shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Sigilo Absoluto LGPD</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Nenhuma informação pessoal ou financeira é armazenada permanentemente ou vendida a terceiros.
              </p>
            </Card>

            <Card className="bg-slate-50/70 border-slate-200/80 p-6 rounded-3xl space-y-3 hover:border-emerald-400 transition-colors shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Scale className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Lei de Registros Públicos</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Algoritmo treinado estritamente com base na Lei nº 6.015/73 e diretrizes do Conselho Nacional de Justiça (CNJ).
              </p>
            </Card>

            <Card className="bg-slate-50/70 border-slate-200/80 p-6 rounded-3xl space-y-3 hover:border-emerald-400 transition-colors shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Award className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Garantia de Fidelidade</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Caso haja qualquer divergência de extração no relatório, devolvemos o valor do Pix imediatamente sem burocracia.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Oferta Promocional R$ 49,90 */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid md:grid-cols-12 gap-8 items-center relative z-10">
              
              <div className="md:col-span-7 space-y-6">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-black uppercase px-3.5 py-1">
                  ⚡ Oferta de Lançamento: 6 Meses de Acesso Ilimitado
                </Badge>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  Analise quantas matrículas quiser por 6 meses por apenas R$ 49,90.
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                  Acesso ilimitado à plataforma por 180 dias. Liberação instantânea e automática via Webhook Pix.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 font-semibold">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Análises e uploads ilimitados por 6 meses
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 font-semibold">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Diagnóstico notarial completo dos 12 módulos
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 font-semibold">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Relatório auditado em PDF e liberação automática via Webhook
                  </div>
                </div>
              </div>

              {/* Pricing Box */}
              <div className="md:col-span-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-center space-y-5 shadow-2xl">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Plano 6 Meses Ilimitado</span>
                
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 line-through font-bold">De R$ 199,90</div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white">R$ 49</span>
                    <span className="text-xl font-extrabold text-white">,90</span>
                  </div>
                  <span className="text-xs text-emerald-300 font-bold block">6 Meses de Uso Ilimitado</span>
                </div>

                <Link to="/pagamento-pix" className="block w-full">
                  <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base py-6 rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-105">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pagar R$ 49,90 via Pix
                  </Button>
                </Link>

                <p className="text-[11px] text-slate-400 font-medium">
                  🔒 Liberação automática imediata via Webhook
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 px-3 py-1 font-bold text-xs">
              Avaliação de Clientes
            </Badge>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              O que Dizem os Profissionais que Utilizam a Plataforma
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <Card key={idx} className="bg-white border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed font-medium">
                    "{item.content}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shadow-inner">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{item.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-12">
            <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 px-3 py-1 font-bold text-xs">
              Dúvidas Frequentes
            </Badge>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Perguntas Frequentes (FAQ)
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:border-emerald-300 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === index ? 'rotate-90 text-emerald-600' : ''}`} />
                </div>
                {activeFaq === index && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-200/60 font-medium">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
              <FileCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-lg font-black text-white">
              Valida<span className="text-emerald-400">Imóvel</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 text-center font-medium">
            © {new Date().getFullYear()} Valida Imóvel. Análise automatizada de matrículas imobiliárias. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <Link to="/auth" className="hover:text-white transition-colors">Entrar</Link>
            <Link to="/pagamento-pix" className="hover:text-white transition-colors">Planos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;