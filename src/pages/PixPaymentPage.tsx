import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, CheckCircle2, ShieldCheck, Copy, QrCode, CreditCard,
  AlertCircle, FileCheck, Zap, Lock, RefreshCw, Check, ArrowRight,
  Shield, User, Mail, Loader2, ExternalLink, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService } from '@/services/subscriptionService';
import { mercadoPagoService, PixPaymentResult } from '@/services/mercadoPagoService';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';

export const PixPaymentPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth?tab=register');
  };

  // 🛡️ Regra Estrita:
  // 1. Visitante não logado -> Redireciona para cadastro
  // 2. Usuário com assinatura ativa -> NUNCA pede PIX novamente, entra direto no sistema!
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      toast({
        title: '🔒 Cadastro Obrigatório',
        description: 'Por favor, crie sua conta primeiro para poder contratar o plano.',
      });
      navigate('/auth?tab=register', { replace: true });
      return;
    }

    const subStatus = subscriptionService.getStatus();
    if (user.hasSubscription || subStatus.active) {
      toast({
        title: '✅ Acesso Liberado',
        description: 'Você já possui uma assinatura ativa! Entrando no sistema...',
      });
      navigate('/app', { replace: true });
    }
  }, [user, isLoading, navigate, toast]);

  const [payerName, setPayerName] = useState(user?.name || '');
  const [payerEmail, setPayerEmail] = useState(user?.email || '');
  const [activeTab, setActiveTab] = useState<'pix' | 'card'>('pix');
  const [copied, setCopied] = useState(false);

  // Estado do pagamento PIX gerado
  const [pixPayment, setPixPayment] = useState<PixPaymentResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Preferência de cartão
  const [cardInitPoint, setCardInitPoint] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

  // Status de confirmação
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [confirmedTxId, setConfirmedTxId] = useState<string | null>(null);

  // Timer de oferta (30 min)
  const [timeLeft, setTimeLeft] = useState({ minutes: 29, seconds: 59 });

  useEffect(() => {
    const endTime = Date.now() + 30 * 60 * 1000;
    const timer = setInterval(() => {
      const distance = endTime - Date.now();
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Callback de ativação — chamado pelo Supabase Realtime ou status check
  const handlePaymentActivated = useCallback(async (txId: string) => {
    setPaymentConfirmed(true);
    setConfirmedTxId(txId);

    // Ativa local e salva sessão atualizada
    await subscriptionService.activate6MonthsUnlimited(txId);

    const savedSession = localStorage.getItem('valida_imovel_vip_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        parsed.hasSubscription = true;
        localStorage.setItem('valida_imovel_vip_session', JSON.stringify(parsed));
      } catch (e) { /* ok */ }
    }

    toast({
      title: '🎉 Pagamento Confirmado!',
      description: 'Seu acesso ilimitado por 6 meses foi liberado instantaneamente!',
    });

    setTimeout(() => {
      window.location.href = '/app';
    }, 1200);
  }, [toast]);

  // Inscreve no Supabase Realtime para confirmação em tempo real
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscriptionService.subscribeToRealtimeActivation(
      user.id,
      handlePaymentActivated
    );
    return () => unsubscribe();
  }, [user?.id, handlePaymentActivated]);

  // Gera QR Code automaticamente se o e-mail estiver preenchido ao carregar
  useEffect(() => {
    if (payerEmail && !pixPayment && !isGenerating && !paymentConfirmed) {
      handleGeneratePixPayment();
    }
  }, [payerEmail]);

  // Polling de verificação de status a cada 8s
  useEffect(() => {
    if (!pixPayment?.payment_id || paymentConfirmed) return;

    const interval = setInterval(async () => {
      const status = await mercadoPagoService.checkPaymentStatus(pixPayment.payment_id);
      if (status.approved) {
        clearInterval(interval);
        await subscriptionService.activate6MonthsUnlimited('TX-' + pixPayment.payment_id);
        handlePaymentActivated('TX-' + pixPayment.payment_id);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [pixPayment?.payment_id, paymentConfirmed, handlePaymentActivated]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: '✓ Copiado!', description: `${label} copiado para a área de transferência.` });
    setTimeout(() => setCopied(false), 3000);
  };

  // Gera QR Code PIX via backend serverless
  const handleGeneratePixPayment = async () => {
    const targetEmail = payerEmail || user?.email;
    if (!targetEmail) {
      toast({ title: 'Por favor, informe seu e-mail', description: 'Digite seu e-mail para vincular a assinatura à sua conta.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    const result = await mercadoPagoService.createPixPayment({
      transaction_amount: 99.90,
      description: 'ValidaImóvel — Plano 6 Meses Ilimitado',
      userId: user?.id,
      payer: {
        email: targetEmail,
        first_name: payerName.split(' ')[0] || 'Cliente',
        last_name: payerName.split(' ').slice(1).join(' ') || 'ValidaImóvel',
      },
    });

    if (result.success && result.qr_code) {
      setPixPayment(result);
    } else {
      setGenerateError(result.error || 'Não foi possível gerar a chave Pix. Tente novamente em instantes.');
    }

    setIsGenerating(false);
  };

  // Gera checkout para cartão de crédito
  const handleGenerateCardPayment = async () => {
    const targetEmail = payerEmail || user?.email;
    if (!targetEmail) {
      toast({ title: 'Por favor, informe seu e-mail', description: 'Digite seu e-mail para continuar.', variant: 'destructive' });
      return;
    }
    setIsGeneratingCard(true);
    const result = await mercadoPagoService.createCardPreference(targetEmail, payerName || 'Cliente');
    if (result.success && result.init_point) {
      setCardInitPoint(result.init_point);
      window.open(result.init_point, '_blank');
    } else {
      toast({ title: 'Erro ao conectar checkout', description: result.error || 'Tente novamente.', variant: 'destructive' });
    }
    setIsGeneratingCard(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header Slim & Seguro */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform font-black">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Valida<span className="text-cyan-400">Imóvel</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant="outline" className="border-blue-500/40 text-cyan-400 bg-blue-500/10 text-xs font-bold px-3 py-1 gap-1.5 hidden md:flex rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Pagamento Criptografado
            </Badge>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-slate-300 hover:text-red-400 hover:bg-slate-800 text-xs gap-1.5 font-bold rounded-xl h-9"
                title="Sair ou entrar com outra conta"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
                <span className="hidden xs:inline">Trocar conta</span>
                <span className="xs:hidden">Sair</span>
              </Button>
            )}
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs gap-1.5 font-bold rounded-xl h-9">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">

        {/* Estado: Pagamento Confirmado (Comemoração) */}
        {paymentConfirmed ? (
          <Card className="border-blue-500/40 bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl text-white">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/30 animate-bounce">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <Badge className="bg-blue-600 text-white text-xs font-black uppercase px-4 py-1.5 rounded-full">
                ✓ Assinatura Ativada
              </Badge>
              <h2 className="text-3xl font-black tracking-tight pt-2 text-white">
                Bem-vindo ao ValidaImóvel!
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Seu plano <strong className="text-cyan-400">6 Meses Ilimitado</strong> foi liberado.<br />
                Redirecionando você para a plataforma de auditoria em instantes...
              </p>
            </div>
            <div className="pt-4">
              <Link to="/app">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-black text-base px-10 py-7 rounded-2xl shadow-xl shadow-blue-600/30 gap-2">
                  Acessar Plataforma Agora <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* Coluna Esquerda: Resumo do Plano (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Card de Oferta */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-500/20 text-cyan-400 border border-blue-500/30 font-extrabold text-xs px-3 py-1">
                    ⚡ Acesso Ilimitado • 180 Dias
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-extrabold">
                    <Zap className="w-4 h-4 fill-amber-400" />
                    <span>Expira em {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Plano 6 Meses Ilimitado
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                    Auditoria completa em matrículas e certidões imobiliárias com IA Registrária Ativa.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 line-through font-bold block">De R$ 599,40</span>
                    <span className="text-3xl sm:text-4xl font-black text-white">R$ 99,<span className="text-xl">90</span></span>
                  </div>
                  <Badge variant="outline" className="border-blue-500/40 text-cyan-400 bg-blue-500/10 font-bold text-xs">
                    Economia de 83% OFF
                  </Badge>
                </div>
              </div>

              {/* Benefícios */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-3.5">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">O que você recebe imediatamente:</h3>
                {[
                  'Uploads ilimitados de certidões PDF por 180 dias',
                  'Auditoria completa nos 12 Módulos Notariais',
                  'Investigação de Cadeia Dominial Cronológica',
                  'Filtro de ônus, penhoras (CNIB) e indisponibilidades',
                  'Dossiê executivo em PDF com Carimbo Registral',
                  'Ativação instantânea pós-pagamento sem burocracia',
                ].map((b) => (
                  <div key={b} className="flex items-start gap-2.5 text-xs text-slate-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* Garantia */}
              <div className="p-4 bg-blue-950/40 border border-blue-800/50 rounded-2xl flex items-center gap-3">
                <Shield className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-white">Garantia Incondicional de 7 Dias</p>
                  <p className="text-slate-400">Teste a plataforma sem riscos. Se não gostar, devolvemos 100% do seu investimento.</p>
                </div>
              </div>

            </div>

            {/* Coluna Direita: Checkout Clean (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <Card className="border-slate-800 bg-slate-900/90 text-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
                
                {/* Selector de Pagamento */}
                <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800">
                  <button
                    onClick={() => setActiveTab('pix')}
                    className={`py-3 min-h-[44px] text-xs sm:text-sm font-black rounded-2xl flex items-center justify-center gap-2 transition-all touch-target ${
                      activeTab === 'pix'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4" /> ⚡ Pix Instantâneo
                  </button>
                  <button
                    onClick={() => setActiveTab('card')}
                    className={`py-3 min-h-[44px] text-xs sm:text-sm font-black rounded-2xl flex items-center justify-center gap-2 transition-all touch-target ${
                      activeTab === 'card'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Cartão de Crédito
                  </button>
                </div>

                <CardContent className="p-5 sm:p-8 space-y-6">

                  {/* Dados de Identificação */}
                  <div className="space-y-3 pb-6 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-cyan-400" /> Titular do Acesso
                      </Label>
                      {user && (
                        <Badge variant="outline" className="border-blue-500/30 text-cyan-400 text-[10px]">
                          Conta Conectada
                        </Badge>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                        <Input
                          type="text"
                          placeholder="Seu Nome Completo"
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          className="bg-slate-950 border-slate-800 text-white pl-9 text-xs sm:text-sm h-11 rounded-xl focus:border-blue-500"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                        <Input
                          type="email"
                          placeholder="seu.email@exemplo.com"
                          value={payerEmail}
                          onChange={(e) => setPayerEmail(e.target.value)}
                          className="bg-slate-950 border-slate-800 text-white pl-9 text-xs sm:text-sm h-11 rounded-xl focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* TAB PIX */}
                  {activeTab === 'pix' ? (
                    <div className="space-y-5">
                      
                      {/* Indicador de Status em Tempo Real */}
                      <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
                          </span>
                          <span className="font-bold text-slate-300">
                            {pixPayment ? 'Aguardando confirmação do Pix...' : 'Digite seu e-mail acima para gerar o Pix'}
                          </span>
                        </div>
                        <Badge className="bg-blue-500/20 text-cyan-400 border border-blue-500/30 text-[10px] font-bold">
                          Ativação em ~5s
                        </Badge>
                      </div>

                      {/* Estado: Carregando QR Code */}
                      {isGenerating && (
                        <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
                          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                          <span className="text-xs font-semibold">Gerando Chave Pix com confirmação automática...</span>
                        </div>
                      )}

                      {/* Estado: QR Code Gerado */}
                      {!isGenerating && pixPayment?.qr_code_base64 && (
                        <div className="flex flex-col items-center gap-4 py-2">
                          <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-blue-500/30 relative group">
                            <img
                              src={pixPayment.qr_code_base64}
                              alt="QR Code PIX"
                              className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                            />
                            <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                              <Badge className="bg-blue-600 text-white text-xs font-bold">Escaneie com o app do seu Banco</Badge>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 font-semibold text-center">
                            Abra a opção <strong className="text-white">Pix</strong> no aplicativo do seu banco e escaneie o código acima.
                          </p>
                        </div>
                      )}

                      {/* Chave Pix Copia e Cola */}
                      {!isGenerating && pixPayment?.qr_code && (
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Chave Pix Copia e Cola</Label>
                          <div className="flex gap-2">
                            <Input
                              readOnly
                              value={pixPayment.qr_code}
                              className="bg-slate-950 border-slate-800 text-slate-300 font-mono text-[11px] h-11 rounded-xl truncate"
                            />
                            <Button
                              onClick={() => copyToClipboard(pixPayment.qr_code!, 'Chave PIX')}
                              className={`${copied ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-500'} text-white font-bold text-xs px-5 h-11 rounded-xl flex-shrink-0 gap-1.5 shadow-md`}
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {copied ? 'Copiado!' : 'Copiar Pix'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Erro ao gerar */}
                      {generateError && (
                        <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-800/50 rounded-2xl text-xs text-red-300">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                          <span>{generateError}</span>
                        </div>
                      )}

                      {/* Botão de Regeneração Manual se necessário */}
                      {!isGenerating && (!pixPayment || generateError) && (
                        <Button
                          onClick={handleGeneratePixPayment}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-sm h-13 rounded-2xl shadow-lg shadow-blue-600/20 gap-2 transition-all"
                        >
                          <QrCode className="w-4 h-4" /> Gerar Chave Pix — R$ 99,90
                        </Button>
                      )}

                      <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
                        <Lock className="w-3.5 h-3.5" />
                        Ambiente seguro com liberação imediata do sistema
                      </p>
                    </div>
                  ) : (
                    /* TAB CARTÃO DE CRÉDITO */
                    <div className="py-6 text-center space-y-5">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400">
                        <CreditCard className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white">Pagamento no Cartão de Crédito</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Parcele a sua licença de 6 meses em até 12x no cartão de crédito com liberação instantânea.
                        </p>
                      </div>

                      {cardInitPoint ? (
                        <a href={cardInitPoint} target="_blank" rel="noopener noreferrer">
                          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-8 py-5 rounded-xl shadow-lg gap-2">
                            Pagar no Cartão de Crédito <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      ) : (
                        <Button
                          onClick={handleGenerateCardPayment}
                          disabled={isGeneratingCard}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-8 py-5 rounded-xl shadow-lg gap-2"
                        >
                          {isGeneratingCard ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Conectando ao checkout...</>
                          ) : (
                            <>Continuar para Pagamento no Cartão <ArrowRight className="w-4 h-4" /></>
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                </CardContent>
              </Card>

            </div>

          </div>
        )}

        {/* Card de Suporte ao Cliente no Checkout */}
        <WhatsAppSupport variant="card" />

      </main>

      {/* Botão Flutuante WhatsApp */}
      <WhatsAppSupport variant="floating" />
    </div>
  );
};

export default PixPaymentPage;
