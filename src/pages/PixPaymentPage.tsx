import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, CheckCircle2, ShieldCheck, Copy, QrCode, CreditCard,
  AlertCircle, FileCheck, Lock, Check, ArrowRight,
  Shield, User, Mail, Loader2, ExternalLink, LogOut
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { subscriptionService } from '@/services/subscriptionService';
import { paymentService, PixPaymentResult, isValidCpf, formatCpf } from '@/services/paymentService';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { Logo } from '@/components/Logo';
import { COMPANY_CONFIG } from '@/config/companyConfig';

const { offer } = COMPANY_CONFIG;
// "R$ 99,90" → "R$ 99" e "90" (centavos em tamanho menor)
const [priceUnits, priceCents] = offer.priceFormatted.split(',');

export const PixPaymentPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading, signOut, refreshUser } = useAuth();
  usePageMeta('Pagamento', '/pagamento', undefined, { noindex: true });

  // Renovação: quem já tem plano ativo pode pagar de novo; os dias restantes são somados no servidor
  const isRenewal = searchParams.get('renovar') === '1';
  const [initialExpiry] = useState<string | null>(() => user?.subscriptionExpiresAt ?? null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth?tab=register');
  };

  // Visitante sem conta vai para o cadastro; assinante ativo vai para o app (a não ser que esteja renovando)
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      toast({
        title: 'Crie sua conta primeiro',
        description: 'O plano fica vinculado à sua conta.',
      });
      navigate('/auth?tab=register', { replace: true });
      return;
    }

    if (user.hasSubscription && !isRenewal) {
      navigate('/app', { replace: true });
    }
  }, [user, isLoading, isRenewal, navigate, toast]);

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
  const [cardPaymentId, setCardPaymentId] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

  // Status de confirmação
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Chamado pelo Supabase Realtime ou pela consulta de status. O acesso é liberado pelo webhook no
  // servidor; aqui só esperamos o perfil refletir isso (na renovação, o vencimento novo).
  const handlePaymentActivated = useCallback(async () => {
    setPaymentConfirmed(true);

    for (let attempt = 0; attempt < 10; attempt++) {
      const refreshed = await refreshUser();
      const applied = isRenewal
        ? Boolean(refreshed?.subscriptionExpiresAt && refreshed.subscriptionExpiresAt !== initialExpiry)
        : Boolean(refreshed?.hasSubscription);
      if (applied) {
        toast({
          title: 'Pagamento confirmado',
          description: isRenewal ? 'Seu acesso foi renovado.' : `Seu acesso de ${offer.period} foi liberado.`,
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
  }, [toast, refreshUser, navigate, isRenewal, initialExpiry]);

  // Supabase Realtime: na renovação, só reage à cobrança gerada nesta página
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscriptionService.subscribeToRealtimeActivation(user.id, (paymentId) => {
      if (!isRenewal || paymentId === pixPayment?.payment_id || paymentId === cardPaymentId) handlePaymentActivated();
    });
    return () => unsubscribe();
  }, [user?.id, handlePaymentActivated, isRenewal, pixPayment?.payment_id, cardPaymentId]);

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
        handlePaymentActivated();
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
      setCardPaymentId(result.preference_id ?? null);
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
            <span className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5" /> Pagamento processado pelo Asaas
            </span>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive hover:bg-muted text-xs gap-1.5 font-semibold"
                title="Sair ou entrar com outra conta"
              >
                <LogOut className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                <span className="hidden xs:inline">Trocar conta</span>
                <span className="xs:hidden">Sair</span>
              </Button>
            )}
            <Link to="/" aria-label="Voltar ao site">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs gap-1.5 font-semibold">
                <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Voltar ao site</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">

        {/* Estado: Pagamento Confirmado (Comemoração) */}
        {paymentConfirmed ? (
          <Card className="border-0 ring-1 ring-black/5 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-medium bg-card">
            <div className="w-20 h-20 mx-auto rounded-full bg-success text-white flex items-center justify-center shadow-soft">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="border-success/30 bg-success/10 text-success text-xs font-semibold px-4 py-1.5 rounded-full">
                Pagamento confirmado
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight pt-2 text-foreground">
                {isRenewal ? 'Acesso renovado!' : 'Bem-vindo ao ValidaImóvel!'}
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Estamos liberando o seu acesso e levando você para a área de análises...
              </p>
            </div>
            <div className="pt-4">
              <Link to="/app">
                <Button size="lg" className="gap-2">
                  Ir para as análises <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* Coluna Esquerda: Resumo do Plano (5 cols) */}
            {/* No celular o formulário de pagamento vem primeiro; o resumo do plano desce */}
            <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
              
              {/* Card de Oferta */}
              <div className="bg-card ring-1 ring-black/5 rounded-3xl p-7 space-y-4 shadow-soft">
                <p className="text-primary text-sm font-semibold">
                  {isRenewal ? `Renovação • +${offer.durationDays} dias` : `${offer.durationDays} dias de acesso`}
                </p>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                    {isRenewal ? `Renovar o ${offer.planName.toLowerCase()}` : offer.planName}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {isRenewal
                      ? `Os dias que ainda faltam no seu plano atual são somados aos ${offer.durationDays} dias novos.`
                      : 'Análise de matrículas e certidões imobiliárias com inteligência artificial.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-border flex items-baseline justify-between">
                  <span className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground whitespace-nowrap">{priceUnits},<span className="text-2xl">{priceCents}</span></span>
                  <span className="text-sm text-muted-foreground">pagamento único</span>
                </div>
              </div>

              {/* Benefícios */}
              <div className="bg-card ring-1 ring-black/5 rounded-3xl p-7 space-y-3.5 shadow-soft">
                <h3 className="text-sm font-semibold text-foreground">O que está incluído</h3>
                {[
                  `Análises sem cobrança por documento durante ${offer.durationDays} dias (uso justo de até ${offer.fairUseDailyLimit} por dia)`,
                  'Relatório nos 12 módulos registrais, com nota de risco',
                  'Cadeia dominial e proprietários atuais',
                  'Hipotecas, penhoras e indisponibilidades, com o trecho do documento',
                  'Relatório em PDF e histórico das suas análises',
                  'Liberação automática após a confirmação do pagamento',
                ].map((b) => (
                  <div key={b} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* Garantia */}
              <div className="px-2 flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold text-foreground">7 dias para desistir</p>
                  <p className="text-muted-foreground">Se não gostar, peça o reembolso integral em até 7 dias pelo WhatsApp de suporte (direito de arrependimento, art. 49 do CDC).</p>
                </div>
              </div>

            </div>

            {/* Coluna Direita: Checkout Clean (7 cols) */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              
              <Card className="border-0 ring-1 ring-black/5 bg-card text-foreground rounded-3xl shadow-medium overflow-hidden">
                
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
                      <Label className="text-sm font-semibold text-foreground">Dados do titular</Label>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                        <Input
                          type="text"
                          placeholder="Nome completo"
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          className="bg-background border-border text-foreground pl-9 text-xs sm:text-sm h-11 rounded-xl focus:border-primary/30"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                        <Input
                          type="email"
                          placeholder="E-mail"
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
                          placeholder="CPF (000.000.000-00)"
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
                      <div className="p-3.5 bg-secondary rounded-2xl flex items-center text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                          </span>
                          <span className="text-foreground/80">
                            {pixPayment ? 'Aguardando o pagamento. O acesso é liberado automaticamente.' : 'Preencha o CPF para gerar o Pix.'}
                          </span>
                        </div>
                      </div>

                      {/* Estado: Carregando QR Code */}
                      {isGenerating && (
                        <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                          <Loader2 className="w-10 h-10 text-primary animate-spin" />
                          <span className="text-xs font-semibold">Gerando o Pix...</span>
                        </div>
                      )}

                      {/* Estado: QR Code Gerado */}
                      {!isGenerating && pixPayment?.qr_code_base64 && (
                        <div className="flex flex-col items-center gap-4 py-2">
                          <div className="p-4 bg-card rounded-3xl shadow-medium ring-1 ring-black/5 relative group">
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
                        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-2xl text-xs text-destructive">
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
                          <QrCode className="w-4 h-4" /> Gerar Pix de {offer.priceFormatted}
                        </Button>
                      )}

                      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
                        <Lock className="w-3.5 h-3.5" />
                        O acesso é liberado assim que o banco confirma o Pix
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
                          Pague no cartão de crédito, na página do Asaas. O acesso é liberado automaticamente quando a operadora aprovar.
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
    </div>
  );
};

export default PixPaymentPage;
