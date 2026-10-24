import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, CheckCircle2, ShieldCheck, Copy, QrCode, CreditCard,
  AlertCircle, FileCheck, Zap, Lock, RefreshCw, Check, ArrowRight,
  Shield, User, Mail, Loader2, ExternalLink, Sparkles, LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService } from '@/services/subscriptionService';
import { paymentService, PixPaymentResult, isValidCpf, formatCpf } from '@/services/paymentService';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { Logo } from '@/components/Logo';

export const PixPaymentPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading, signOut, refreshUser } = useAuth();

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

    if (user.hasSubscription) {
      toast({
        title: '✅ Acesso Liberado',
        description: 'Você já possui uma assinatura ativa! Entrando no sistema...',
      });
      navigate('/app', { replace: true });
    }
  }, [user, isLoading, navigate, toast]);

  const [payerName, setPayerName] = useState(user?.name || '');
  const [payerEmail, setPayerEmail] = useState(user?.email || '');
  const [payerCpf, setPayerCpf] = useState('');
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

  // Callback de ativação — chamado pelo Supabase Realtime ou pela consulta de status.
  // O acesso é liberado pelo webhook no servidor; aqui só esperamos o perfil refletir isso.
  const handlePaymentActivated = useCallback(async (txId: string) => {
    setPaymentConfirmed(true);
    setConfirmedTxId(txId);

    for (let attempt = 0; attempt < 10; attempt++) {
      const refreshed = await refreshUser();
      if (refreshed?.hasSubscription) {
        toast({
          title: '🎉 Pagamento Confirmado!',
          description: 'Seu acesso ilimitado por 3 meses foi liberado!',
        });
        navigate('/app', { replace: true });
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    toast({
      title: 'Pagamento recebido',
      description: 'Estamos concluindo a liberação do seu acesso. Recarregue a página em instantes ou fale com o suporte.',
    });
  }, [toast, refreshUser, navigate]);

  // Inscreve no Supabase Realtime para confirmação em tempo real
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscriptionService.subscribeToRealtimeActivation(
      user.id,
      handlePaymentActivated
    );
    return () => unsubscribe();
  }, [user?.id, handlePaymentActivated]);

  // Gera QR Code automaticamente quando e-mail e CPF válido estiverem preenchidos
  useEffect(() => {
    if (activeTab === 'pix' && payerEmail && isValidCpf(payerCpf) && !pixPayment && !isGenerating && !paymentConfirmed) {
      handleGeneratePixPayment();
    }
  }, [payerEmail, payerCpf, activeTab]);

  // Polling de verificação de status a cada 8s
  useEffect(() => {
    if (!pixPayment?.payment_id || paymentConfirmed) return;

    const interval = setInterval(async () => {
      const status = await paymentService.checkPaymentStatus(pixPayment.payment_id);
      if (status.approved) {
        clearInterval(interval);
        handlePaymentActivated(pixPayment.payment_id);
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
    if (!isValidCpf(payerCpf)) {
      toast({ title: 'Por favor, informe seu CPF', description: 'O CPF do titular é exigido para emitir a cobrança.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    const result = await paymentService.createPixPayment({
      name: payerName,
      email: targetEmail,
      cpf: payerCpf,
      userId: user?.id,
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
    if (!isValidCpf(payerCpf)) {
      toast({ title: 'Por favor, informe seu CPF', description: 'O CPF do titular é exigido para emitir a cobrança.', variant: 'destructive' });
      return;
    }
    setIsGeneratingCard(true);
    const result = await paymentService.createCardPayment({
      name: payerName,
      email: targetEmail,
      cpf: payerCpf,
      userId: user?.id,
    });
    if (result.success && result.init_point) {
      setCardInitPoint(result.init_point);
      window.open(result.init_point, '_blank');
    } else {
      toast({ title: 'Erro ao conectar checkout', description: result.error || 'Tente novamente.', variant: 'destructive' });
    }
    setIsGeneratingCard(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl hidden" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl hidden" />
      </div>

      {/* Header Slim & Seguro */}
      <header className="sticky top-0 z-50 glass border-x-0 border-t-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-xs font-semibold px-3 py-1 gap-1.5 hidden md:flex rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Pagamento Criptografado
            </Badge>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive hover:bg-muted text-xs gap-1.5 font-semibold h-9"
                title="Sair ou entrar com outra conta"
              >
                <LogOut className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                <span className="hidden xs:inline">Trocar conta</span>
                <span className="xs:hidden">Sair</span>
              </Button>
            )}
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs gap-1.5 font-semibold h-9">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">

        {/* Estado: Pagamento Confirmado (Comemoração) */}
        {paymentConfirmed ? (
          <Card className="border-primary/40 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-medium text-white bg-primary">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-primary text-white flex items-center justify-center shadow-medium animate-bounce">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <Badge className="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                ✓ Assinatura Ativada
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight pt-2 text-foreground">
                Bem-vindo ao ValidaImóvel!
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Seu plano <strong className="text-primary">3 Meses Ilimitado</strong> foi liberado.<br />
                Redirecionando você para a plataforma de auditoria em instantes...
              </p>
            </div>
            <div className="pt-4">
              <Link to="/app">
                <Button size="lg" className="bg-primary hover:bg-primary text-white font-semibold text-base px-10 py-7 gap-2">
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
              <div className="bg-card/90 border border-border rounded-3xl p-6 space-y-4 shadow-medium">
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/20 text-primary border border-primary/30 font-semibold text-xs px-3 py-1">
                    ⚡ Acesso Ilimitado • 90 Dias
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-warning font-semibold">
                    <Zap className="w-4 h-4 fill-warning" />
                    <span>Expira em {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                    Plano 3 Meses Ilimitado
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                    Auditoria completa em matrículas e certidões imobiliárias com IA Registrária Ativa.
                  </p>
                </div>

                <div className="pt-2 border-t border-border flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground line-through font-semibold block">De R$ 299,70</span>
                    <span className="text-3xl sm:text-4xl font-semibold text-foreground whitespace-nowrap">R$ 49,<span className="text-xl">90</span></span>
                  </div>
                  <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 font-semibold text-xs">
                    Economia de 83% OFF
                  </Badge>
                </div>
              </div>

              {/* Benefícios */}
              <div className="bg-card/60 border border-border rounded-3xl p-6 space-y-3.5">
                <h3 className="text-xs font-semibold text-muted-foreground">O que você recebe imediatamente:</h3>
                {[
                  'Uploads ilimitados de certidões PDF por 90 dias',
                  'Auditoria completa nos 12 Módulos Notariais',
                  'Investigação de Cadeia Dominial Cronológica',
                  'Filtro de ônus, penhoras (CNIB) e indisponibilidades',
                  'Dossiê executivo em PDF com Carimbo Registral',
                  'Ativação instantânea pós-pagamento sem burocracia',
                ].map((b) => (
                  <div key={b} className="flex items-start gap-2.5 text-xs text-muted-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* Garantia */}
              <div className="p-4 bg-card border border-border rounded-2xl flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-foreground">Garantia Incondicional de 7 Dias</p>
                  <p className="text-muted-foreground">Teste a plataforma sem riscos. Se não gostar, devolvemos 100% do seu investimento.</p>
                </div>
              </div>

            </div>

            {/* Coluna Direita: Checkout Clean (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <Card className="border-border bg-card/90 text-foreground rounded-3xl shadow-medium overflow-hidden backdrop-blur-sm">
                
                {/* Selector de Pagamento */}
                <div className="grid grid-cols-2 p-1 m-4 mb-0 bg-muted/70 rounded-xl">
                  <button
                    onClick={() => setActiveTab('pix')}
                    className={`py-2 min-h-[40px] text-[13px] sm:text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors touch-target ${
                      activeTab === 'pix'
                        ? 'bg-card text-foreground shadow-soft'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <QrCode className="w-4 h-4" /> Pix
                  </button>
                  <button
                    onClick={() => setActiveTab('card')}
                    className={`py-2 min-h-[40px] text-[13px] sm:text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors touch-target ${
                      activeTab === 'card'
                        ? 'bg-card text-foreground shadow-soft'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Cartão de crédito
                  </button>
                </div>

                <CardContent className="p-5 sm:p-8 space-y-6">

                  {/* Dados de Identificação */}
                  <div className="space-y-3 pb-6 border-b border-border">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" /> Titular do Acesso
                      </Label>
                      {user && (
                        <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                          Conta Conectada
                        </Badge>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                        <Input
                          type="text"
                          placeholder="Seu Nome Completo"
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          className="bg-background border-border text-foreground pl-9 text-xs sm:text-sm h-11 rounded-xl focus:border-primary/30"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                        <Input
                          type="email"
                          placeholder="seu.email@exemplo.com"
                          value={payerEmail}
                          onChange={(e) => setPayerEmail(e.target.value)}
                          className="bg-background border-border text-foreground pl-9 text-xs sm:text-sm h-11 rounded-xl focus:border-primary/30"
                        />
                      </div>
                      <div className="relative sm:col-span-2">
                        <FileCheck className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="CPF do titular (000.000.000-00)"
                          value={payerCpf}
                          onChange={(e) => setPayerCpf(formatCpf(e.target.value))}
                          className="bg-background border-border text-foreground pl-9 text-xs sm:text-sm h-11 rounded-xl focus:border-primary/30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* TAB PIX */}
                  {activeTab === 'pix' ? (
                    <div className="space-y-5">
                      
                      {/* Indicador de Status em Tempo Real */}
                      <div className="p-3.5 bg-background border border-border rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                          </span>
                          <span className="font-semibold text-muted-foreground">
                            {pixPayment ? 'Aguardando confirmação do Pix...' : 'Preencha e-mail e CPF acima para gerar o Pix'}
                          </span>
                        </div>
                        <Badge className="bg-primary/20 text-primary border border-primary/30 text-xs font-semibold">
                          Ativação em ~5s
                        </Badge>
                      </div>

                      {/* Estado: Carregando QR Code */}
                      {isGenerating && (
                        <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                          <Loader2 className="w-10 h-10 text-primary animate-spin" />
                          <span className="text-xs font-semibold">Gerando Chave Pix com confirmação automática...</span>
                        </div>
                      )}

                      {/* Estado: QR Code Gerado */}
                      {!isGenerating && pixPayment?.qr_code_base64 && (
                        <div className="flex flex-col items-center gap-4 py-2">
                          <div className="p-4 bg-card rounded-3xl shadow-medium border-4 border-primary/30 relative group">
                            <img
                              src={pixPayment.qr_code_base64}
                              alt="QR Code PIX"
                              className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                            />
                            <div className="absolute inset-0 bg-card/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                              <Badge className="bg-primary text-white text-xs font-semibold">Escaneie com o app do seu Banco</Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground font-semibold text-center">
                            Abra a opção <strong className="text-foreground">Pix</strong> no aplicativo do seu banco e escaneie o código acima.
                          </p>
                        </div>
                      )}

                      {/* Chave Pix Copia e Cola */}
                      {!isGenerating && pixPayment?.qr_code && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground">Chave Pix Copia e Cola</Label>
                          <div className="flex gap-2">
                            <Input
                              readOnly
                              value={pixPayment.qr_code}
                              className="bg-background border-border text-muted-foreground font-mono text-xs h-11 rounded-xl truncate"
                            />
                            <Button
                              onClick={() => copyToClipboard(pixPayment.qr_code!, 'Chave PIX')}
                              className="bg-primary hover:bg-primary/90 text-white font-medium text-xs px-5 h-11 flex-shrink-0 gap-1.5"
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {copied ? 'Copiado!' : 'Copiar Pix'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Erro ao gerar */}
                      {generateError && (
                        <div className="flex items-start gap-2 p-3 bg-destructive/40 border border-destructive/50 rounded-2xl text-xs text-destructive">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-destructive" />
                          <span>{generateError}</span>
                        </div>
                      )}

                      {/* Botão de Regeneração Manual se necessário */}
                      {!isGenerating && (!pixPayment || generateError) && (
                        <Button
                          onClick={handleGeneratePixPayment}
                          className="w-full bg-primary hover:bg-primary text-white font-semibold text-sm gap-2 transition-all"
                        >
                          <QrCode className="w-4 h-4" /> Gerar Chave Pix — R$ 49,90
                        </Button>
                      )}

                      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
                        <Lock className="w-3.5 h-3.5" />
                        Ambiente seguro com liberação imediata do sistema
                      </p>
                    </div>
                  ) : (
                    /* TAB CARTÃO DE CRÉDITO */
                    <div className="py-6 text-center space-y-5">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-background border border-border flex items-center justify-center text-primary">
                        <CreditCard className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground">Pagamento no Cartão de Crédito</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Pague a sua licença de 3 meses no cartão de crédito, na página segura do Asaas, com liberação automática.
                        </p>
                      </div>

                      {cardInitPoint ? (
                        <a href={cardInitPoint} target="_blank" rel="noopener noreferrer">
                          <Button className="bg-primary hover:bg-primary text-white font-semibold text-xs px-8 gap-2">
                            Pagar no Cartão de Crédito <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      ) : (
                        <Button
                          onClick={handleGenerateCardPayment}
                          disabled={isGeneratingCard}
                          className="bg-primary hover:bg-primary text-white font-semibold text-xs px-8 gap-2"
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
