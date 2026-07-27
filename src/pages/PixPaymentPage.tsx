import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, CheckCircle2, Clock, ShieldCheck, Copy, QrCode,
  AlertCircle, MessageCircle, FileCheck, Zap, Lock, RefreshCw, Check, Sparkles, ArrowRight, Shield
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { subscriptionService } from '@/services/subscriptionService';
import { pixWebhookService, PixWebhookPayload } from '@/services/pixWebhookService';
import { mercadoPagoService } from '@/services/mercadoPagoService';
import pixQrCode from '@/assets/pix-qrcode.jpeg';

const PixPaymentPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [pixKey] = useState(
    '00020101021126580014br.gov.bcb.pix0136d590019b-ff54-4394-8a51-a00d19638262520400005303986540549.905802BR5922ELIZANDRO FIUZA AQUINO6009SAO PAULO622905251KA1980K3RED4377RADXF0N9C630485CB'
  );

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 59, seconds: 59 });
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [confirmedTxId, setConfirmedTxId] = useState<string | null>(null);

  // Timer de Urgência
  useEffect(() => {
    const endTime = new Date().getTime() + 1 * 60 * 60 * 1000;
    const timer = setInterval(() => {
      const distance = endTime - new Date().getTime();
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ouve atualizações de Webhook em tempo real do Mercado Pago
  useEffect(() => {
    const unsubscribe = pixWebhookService.subscribe((payload: PixWebhookPayload) => {
      setPaymentConfirmed(true);
      setConfirmedTxId(payload.transactionId);
      
      toast({
        title: '🎉 Pagamento Aprovado no Mercado Pago!',
        description: 'Seu acesso ilimitado por 6 meses foi liberado automaticamente sem necessidade de comprovante.'
      });

      // Redireciona automaticamente para o app em 2s
      setTimeout(() => {
        navigate('/app');
      }, 2000);
    });

    return () => unsubscribe();
  }, [toast, navigate]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: `${label} copiado para a área de transferência.` });
  };

  // Simulação de notificação automática vinda do Webhook IPN do Mercado Pago
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
    <div className="min-h-screen bg-slate-50 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-500 transition-colors">
              <FileCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Valida<span className="text-emerald-400">Imóvel</span>
            </span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs gap-1.5 font-bold rounded-xl">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">

        {/* Banner de Sucesso Automático pós-Webhook Mercado Pago */}
        {paymentConfirmed ? (
          <Card className="border-emerald-300 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 p-8 rounded-3xl text-center space-y-4 shadow-xl animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <Badge className="bg-emerald-600 text-white text-xs font-black uppercase px-3.5 py-1">
                ✓ Aprovado via Mercado Pago Webhook
              </Badge>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
                Acesso Ilimitado Ativado por 6 Meses!
              </h2>
              <p className="text-sm text-slate-600 font-medium">
                Transação Mercado Pago: <strong className="font-mono text-emerald-800">{confirmedTxId}</strong>.<br />
                Liberação instantânea concluída sem necessidade de envio de comprovante.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/app">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base px-8 py-6 rounded-2xl shadow-lg gap-2">
                  Entrar na Plataforma Agora <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            {/* Hero */}
            <div className="text-center space-y-4">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 bg-emerald-50 text-xs font-extrabold px-3.5 py-1 gap-1.5 rounded-full shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Mercado Pago: Confirmação Automática Sem Comprovante
              </Badge>

              {/* Countdown */}
              <div className="flex flex-col items-center gap-2.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Oferta expira em:</p>
                <div className="flex gap-3">
                  {[
                    { value: timeLeft.hours, label: 'Horas' },
                    { value: timeLeft.minutes, label: 'Min' },
                    { value: timeLeft.seconds, label: 'Seg' },
                  ].map(({ value, label }) => (
                    <div key={label} className="flex flex-col items-center bg-slate-900 text-white rounded-2xl p-3 sm:p-4 min-w-[72px] sm:min-w-[88px] shadow-md">
                      <span className="text-3xl sm:text-4xl font-black tabular-nums text-emerald-400">
                        {String(value).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                6 Meses de Acesso Ilimitado por R$ 49,90
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-medium leading-relaxed">
                Pague via Pix pelo Mercado Pago. A aprovação é <strong>100% automática em menos de 5 segundos</strong> — você não precisa enviar nenhum comprovante.
              </p>

              {/* Price */}
              <div className="flex flex-col items-center gap-1 pt-2">
                <span className="text-xs text-slate-400 line-through font-bold">De R$ 199,90</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl sm:text-6xl font-black text-slate-900">R$ 49</span>
                  <span className="text-2xl font-bold text-slate-900">,90</span>
                </div>
                <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold text-xs px-3 py-1 mt-1">
                  Acesso Ilimitado durante 6 Meses
                </Badge>
              </div>
            </div>

            {/* Benefits */}
            <Card className="border-slate-200/80 shadow-sm rounded-3xl bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Benefícios com Liberação Automática:
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid sm:grid-cols-2 gap-3 text-sm font-medium">
                  {[
                    'Sem envio de comprovantes: aprovação instantânea pelo Mercado Pago',
                    'Uploads ilimitados de certidões por 6 meses (180 dias)',
                    'Extração automática de proprietários e cadeia dominial',
                    'Detector de penhoras, hipotecas e impedimentos judiciais',
                    'Dossiê em PDF pronto com Carimbo Digital Registral',
                    'Integração via Webhook Mercado Pago 24/7',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* PIX Payment Card */}
            <Card className="border-slate-200/80 shadow-lg rounded-3xl bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 h-2" />
              <CardHeader className="text-center pb-4 pt-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shadow-inner">
                  <QrCode className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-xl font-black text-slate-900">Pagamento Pix via Mercado Pago</CardTitle>
                <p className="text-xs text-slate-500 font-medium">Escaneie o QR Code ou copie a chave PIX no valor de R$ 49,90</p>
                <div className="pt-2">
                  <span className="text-3xl font-black text-emerald-600">R$ 49,90</span>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Plano 6 Meses Ilimitados</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pb-8">
                {/* Status do Webhook Mercado Pago */}
                <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs border border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-slate-300">Aguardando Webhook Mercado Pago...</span>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px]">
                    Auto-Check Ativo
                  </Badge>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                      <img src={pixQrCode} alt="QR Code PIX Valida Imóvel" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Escaneie com o aplicativo do seu banco</p>
                </div>

                {/* PIX Key */}
                <div className="space-y-2">
                  <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Chave PIX — Copia e Cola</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={pixKey}
                      readOnly
                      className="font-mono text-[11px] bg-slate-50 border-slate-200 rounded-xl h-10"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(pixKey, 'Chave PIX')}
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl h-10 w-10 flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Botão de Simulação do Webhook Mercado Pago */}
                <div className="pt-2">
                  <Button
                    onClick={handleSimulateMercadoPagoWebhook}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold rounded-xl text-xs py-5 gap-2 border border-slate-800 shadow-md"
                  >
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Simular Aprovação Mercado Pago (Webhook Instantâneo)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="border-slate-200/80 shadow-sm rounded-3xl bg-white">
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Como funciona o pagamento automático
                </h3>
                <ol className="space-y-2 text-xs sm:text-sm text-slate-600 font-medium">
                  {[
                    'Abra o aplicativo do seu banco e pague o valor de R$ 49,90 via Pix',
                    'O Mercado Pago identifica a transação instantaneamente',
                    'O Webhook envia o sinal de aprovação e libera 6 meses de acesso ilimitado na sua tela',
                    'Não é necessário enviar nenhum comprovante ou mensagem manual!',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* WhatsApp Customer Service */}
            <Card className="border-emerald-200/80 bg-emerald-50/60 shadow-sm rounded-3xl">
              <CardContent className="pt-6 pb-6">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/25">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Suporte ao Cliente</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      A aprovação é 100% automática. Caso tenha qualquer dúvida, nossa equipe está disponível no WhatsApp.
                    </p>
                  </div>
                  <a
                    href="https://api.whatsapp.com/send?phone=5548991325486&text=Ola!%20Tenho%20duvidas%20sobre%20o%20pagamento%20via%20Mercado%20Pago.%20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 px-6 py-5 gap-2.5 text-xs">
                      <MessageCircle className="w-4 h-4" />
                      Falar com Suporte no WhatsApp
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" /> Mercado Pago Protegido
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600" /> Webhook 100% Automático
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero Comprovantes
              </span>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PixPaymentPage;
