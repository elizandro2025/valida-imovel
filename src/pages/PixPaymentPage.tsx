import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, CheckCircle2, ShieldCheck, Copy, QrCode, CreditCard,
  AlertCircle, FileCheck, Zap, Lock, RefreshCw, Check, Sparkles, ArrowRight, Shield, User, Mail
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService } from '@/services/subscriptionService';
import { pixWebhookService, PixWebhookPayload } from '@/services/pixWebhookService';
import { mercadoPagoService } from '@/services/mercadoPagoService';
import pixQrCode from '@/assets/pix-qrcode.jpeg';

export const PixPaymentPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [payerName, setPayerName] = useState(user?.name || '');
  const [payerEmail, setPayerEmail] = useState(user?.email || '');
  const [activeTab, setActiveTab] = useState<'pix' | 'card'>('pix');
  const [copied, setCopied] = useState(false);

  const [pixKey] = useState(
    '00020101021126580014br.gov.bcb.pix0136d590019b-ff54-4394-8a51-a00d19638262520400005303986540549.905802BR5922ELIZANDRO FIUZA AQUINO6009SAO PAULO622905251KA1980K3RED4377RADXF0N9C630485CB'
  );

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 29, seconds: 59 });
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [confirmedTxId, setConfirmedTxId] = useState<string | null>(null);

  // Timer de Oferta Especial (30 min)
  useEffect(() => {
    const endTime = new Date().getTime() + 30 * 60 * 1000;
    const timer = setInterval(() => {
      const distance = endTime - new Date().getTime();
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          hours: 0,
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ouve confirmações do Webhook Mercado Pago em Tempo Real
  useEffect(() => {
    const unsubscribe = pixWebhookService.subscribe((payload: PixWebhookPayload) => {
      setPaymentConfirmed(true);
      setConfirmedTxId(payload.transactionId);
      
      toast({
        title: '🎉 Pagamento Aprovado no Mercado Pago!',
        description: 'Seu acesso ilimitado por 6 meses foi liberado automaticamente sem envio de comprovante.'
      });

      setTimeout(() => {
        navigate('/app');
      }, 2000);
    });

    return () => unsubscribe();
  }, [toast, navigate]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: '✓ Copiado!', description: `${label} copiado para a área de transferência.` });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSimulateMercadoPagoWebhook = () => {
    mercadoPagoService.handleWebhookNotification({
      id: Math.floor(100000000 + Math.random() * 900000000),
      live_mode: true,
      type: 'payment',
      date_created: new Date().toISOString(),
      user_id: 1234567,
      api_version: 'v1',
      action: 'payment.created',
      data: { id: Math.floor(1000000000 + Math.random() * 9000000000).toString() }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-500 transition-colors">
              <FileCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Valida<span className="text-emerald-400">Imóvel</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs font-bold px-3 py-1 gap-1.5 hidden sm:flex rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Mercado Pago SSL 256-bit
            </Badge>
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs gap-1.5 font-bold rounded-xl">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        
        {/* State Banner: Payment Confirmed */}
        {paymentConfirmed ? (
          <Card className="border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-8 rounded-3xl text-center space-y-6 shadow-2xl animate-fade-in text-white">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <Badge className="bg-emerald-600 text-white text-xs font-black uppercase px-4 py-1.5 rounded-full">
                ✓ Aprovado via Mercado Pago Webhook
              </Badge>
              <h2 className="text-3xl font-black tracking-tight pt-2 text-white">
                Acesso Ilimitado Ativado por 6 Meses!
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                ID da Transação Mercado Pago: <strong className="font-mono text-emerald-400">{confirmedTxId}</strong>.<br />
                Sua licença foi liberada automaticamente sem necessidade de envio de comprovantes.
              </p>
            </div>
            <div className="pt-4">
              <Link to="/app">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base px-10 py-7 rounded-2xl shadow-xl shadow-emerald-600/30 gap-2">
                  Acessar Plataforma Agora <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Offer & Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Offer Badge */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold text-xs px-3 py-1">
                    ⚡ Licença 6 Meses
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
                    Auditoria ilimitada de certidões e matrículas imobiliárias com IA Registrária Ativa.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 line-through font-bold block">De R$ 199,90</span>
                    <span className="text-3xl sm:text-4xl font-black text-white">R$ 49,<span className="text-xl">90</span></span>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-bold text-xs">
                    Economia de 75%
                  </Badge>
                </div>
              </div>

              {/* Benefits Checklist */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-3.5">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">O que está incluído no seu acesso:</h3>
                {[
                  'Uploads ilimitados de certidões PDF por 180 dias',
                  'Auditoria completa nos 12 Módulos Notariais',
                  'Investigação de Cadeia Dominial Cronológica',
                  'Filtro de ônus, penhoras (CNIB) e indisponibilidades',
                  'Dossiê executivo em PDF com Carimbo Registral',
                  'Confirmação 100% automática via Webhook Mercado Pago',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2.5 text-xs text-slate-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Guarantee Box */}
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl flex items-center gap-3">
                <Shield className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-white">Garantia de Confiança Mercado Pago</p>
                  <p className="text-slate-400">Processamento oficial com criptografia bancária de ponta a ponta.</p>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Checkout (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <Card className="border-slate-800 bg-slate-900/90 text-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
                
                {/* Top Tab Bar */}
                <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800">
                  <button
                    onClick={() => setActiveTab('pix')}
                    className={`py-3 text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition-all ${
                      activeTab === 'pix'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4" /> ⚡ Pix Instantâneo
                  </button>
                  <button
                    onClick={() => setActiveTab('card')}
                    className={`py-3 text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition-all ${
                      activeTab === 'card'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Cartão Mercado Pago
                  </button>
                </div>

                <CardContent className="p-6 sm:p-8 space-y-6">

                  {/* Customer Identification */}
                  <div className="space-y-3 pb-6 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-400" /> Titular do Acesso
                      </Label>
                      {user && (
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                          Autenticado
                        </Badge>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <Input
                          type="text"
                          placeholder="Seu Nome Completo"
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          className="bg-slate-950 border-slate-800 text-white pl-9 text-xs h-10 rounded-xl focus:border-emerald-500"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <Input
                          type="email"
                          placeholder="seu.email@exemplo.com"
                          value={payerEmail}
                          onChange={(e) => setPayerEmail(e.target.value)}
                          className="bg-slate-950 border-slate-800 text-white pl-9 text-xs h-10 rounded-xl focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {activeTab === 'pix' ? (
                    <div className="space-y-6">
                      
                      {/* Live Auto-Check Indicator */}
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="font-bold text-slate-300">Monitorando Webhook Mercado Pago 24/7...</span>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          Liberação &lt; 5s
                        </Badge>
                      </div>

                      {/* QR Code Container */}
                      <div className="flex flex-col items-center gap-4 py-2">
                        <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-emerald-500/30 relative group">
                          <img src={pixQrCode} alt="QR Code PIX Mercado Pago" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
                          <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                            <Badge className="bg-emerald-600 text-white text-xs font-bold">Escaneie pelo App do seu Banco</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold text-center">
                          Abra a opção <strong className="text-white">Pix</strong> no seu banco e escaneie o código acima.
                        </p>
                      </div>

                      {/* Copia e Cola Key */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Chave Pix Copia e Cola</Label>
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value={pixKey}
                            className="bg-slate-950 border-slate-800 text-slate-300 font-mono text-[11px] h-11 rounded-xl truncate"
                          />
                          <Button
                            onClick={() => copyToClipboard(pixKey, 'Chave PIX')}
                            className={`${
                              copied ? 'bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-500'
                            } text-white font-bold text-xs px-5 h-11 rounded-xl flex-shrink-0 gap-1.5 shadow-md`}
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copiado!' : 'Copiar Pix'}
                          </Button>
                        </div>
                      </div>

                      {/* Fast Simulation Trigger Button */}
                      <div className="pt-2">
                        <Button
                          onClick={handleSimulateMercadoPagoWebhook}
                          variant="outline"
                          className="w-full border-dashed border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs h-11 rounded-xl gap-2"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Testar Liberação Instantânea (Simular Mercado Pago)
                        </Button>
                      </div>

                    </div>
                  ) : (
                    /* Credit Card Tab Placeholder */
                    <div className="py-8 text-center space-y-4">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
                        <CreditCard className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white">Checkout Transparente de Cartão</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Se você prefere parcelar em até 12x no cartão de crédito, utilize nosso gateway seguro do Mercado Pago.
                        </p>
                      </div>
                      <Button
                        onClick={() => window.open(`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=VAL-IMV-4990`, '_blank')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-5 rounded-xl shadow-lg gap-2"
                      >
                        Pagar no Cartão via Mercado Pago <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                </CardContent>
              </Card>

            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default PixPaymentPage;
