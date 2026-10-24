import React, { useCallback, useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { AnalysisReport } from '@/components/AnalysisReport';
import { AnalysisHistory } from '@/components/AnalysisHistory';
import { AccountPanel, daysLeft } from '@/components/AccountPanel';
import { ErrorModal } from '@/components/ErrorModal';
import { useMatriculaAnalysis, MAX_PDF_BYTES } from '@/hooks/useMatriculaAnalysis';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Upload, FileCheck, Brain, ArrowRight, ArrowLeft, LogOut, CalendarClock } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { Logo } from '@/components/Logo';
import { COMPANY_CONFIG } from '@/config/companyConfig';

const MatriculaAnalysis: React.FC = () => {
  const analysis = useMatriculaAnalysis();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [historyKey, setHistoryKey] = useState(0);

  const sampleParam = new URLSearchParams(location.search).get('sample');
  const sampleType = sampleParam === 'risk' ? 'risk' : sampleParam === 'safe' || sampleParam === 'true' ? 'safe' : null;
  const isSampleDemo = Boolean(sampleType) || Boolean(analysis.isSample);

  usePageMeta(isSampleDemo ? 'Demonstração' : 'Análise de matrícula', '/app');

  const { loadSampleReport } = analysis;
  React.useEffect(() => {
    if (sampleType && !analysis.report && !analysis.isProcessing) loadSampleReport(sampleType);
  }, [sampleType, analysis.report, analysis.isProcessing, loadSampleReport]);

  const { processFile } = analysis;
  const startAnalysis = useCallback((file: File) => {
    processFile(file, {
      hasSubscription: user?.hasSubscription,
      userId: user?.id,
      onSaved: () => setHistoryKey(k => k + 1),
    });
  }, [processFile, user?.hasSubscription, user?.id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted: File[]) => { if (accepted.length > 0) startAnalysis(accepted[0]); },
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: MAX_PDF_BYTES,
    onDropRejected: (rejections) => analysis.showError(
      rejections[0]?.errors[0]?.code === 'file-too-large'
        ? 'O PDF tem mais de 15 MB. Gere a certidão novamente com resolução menor ou envie só as páginas da matrícula.'
        : 'Envie a certidão em PDF.',
    ),
    disabled: analysis.isProcessing,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const left = user?.role === 'admin' ? null : daysLeft(user?.subscriptionExpiresAt ?? null);
  const showExpiryNotice = !isSampleDemo && user?.hasSubscription && left !== null && left <= 7;
  const showWorkspaceHome = !isSampleDemo && !analysis.file && !analysis.isProcessing && !analysis.report;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-white">
      <header className="sticky top-0 z-50 text-foreground glass border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="text-[13px] text-muted-foreground hidden sm:inline">
              {isSampleDemo ? 'Demonstração' : 'Análises'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                {user.hasSubscription ? (
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-xs hidden sm:flex gap-1.5 px-3 py-1 font-semibold rounded-full">
                    Plano ativo
                  </Badge>
                ) : (
                  <Link to="/pagamento">
                    <Button size="sm" className="font-semibold">Assinar — {COMPANY_CONFIG.offer.priceFormatted}</Button>
                  </Link>
                )}
                <span className="text-xs text-muted-foreground hidden md:block truncate max-w-[180px] font-medium">{user.email}</span>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5">
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </Button>
              </>
            )}

            {isSampleDemo && !user && (
              <Link to="/auth?tab=register">
                <Button size="sm" className="font-semibold">
                  <span className="sm:hidden">Assinar</span>
                  <span className="hidden sm:inline">Criar conta — {COMPANY_CONFIG.offer.priceFormatted}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 sm:py-10 space-y-8">

        {showExpiryNotice && (
          <div className="max-w-2xl mx-auto p-4 rounded-2xl border border-warning/30 bg-warning/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 text-foreground font-medium">
              <CalendarClock className="w-4 h-4 text-warning shrink-0" />
              Seu acesso termina em {left} dia{left === 1 ? '' : 's'}. Renove agora: os dias restantes são somados.
            </span>
            <Link to="/pagamento?renovar=1" className="shrink-0"><Button size="sm">Renovar</Button></Link>
          </div>
        )}

        {showWorkspaceHome && (
          <div className="text-center space-y-2 animate-fade-in pt-2">
            <h1 className="text-2xl sm:text-4xl font-semibold text-foreground tracking-tight leading-tight">
              Análise de matrícula
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
              Envie a certidão de matrícula em PDF. Em poucos minutos você recebe a nota de risco, os ônus, a cadeia dominial e o parecer dos 12 módulos.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {!isSampleDemo && !analysis.report && (
            <Card className="max-w-2xl mx-auto border-border shadow-medium rounded-3xl bg-card text-foreground overflow-hidden">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Upload className="w-3.5 h-3.5 stroke-[2]" />
                    </div>
                    Enviar matrícula em PDF
                  </CardTitle>
                  <span className="text-xs font-semibold text-muted-foreground">PDF • até 15 MB</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {!analysis.file ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-colors duration-300
                      ${isDragActive ? 'border-primary/40 bg-primary/10' : 'border-border hover:border-primary/30 hover:bg-background/60'}
                      ${analysis.isProcessing ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <div className="space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Upload className="w-7 h-7 stroke-[1.8]" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground">
                          {isDragActive ? 'Solte a matrícula aqui' : 'Arraste ou selecione a certidão em PDF'}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">Aceita certidões digitais e digitalizadas (escaneadas)</p>
                      </div>
                      <Button size="sm" disabled={analysis.isProcessing}>
                        Selecionar PDF
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <FileUpload
                    onFileSelect={startAnalysis}
                    selectedFile={analysis.file}
                    onClearFile={analysis.clearFile}
                    isProcessing={analysis.isProcessing}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {analysis.isProcessing && (
            <section className="animate-fade-in-up">
              <AnalysisProgress progress={analysis.progress} currentStep={analysis.currentStep} />
            </section>
          )}

          {analysis.report && !analysis.isProcessing && (
            <section className="animate-fade-in-up space-y-4">
              {!isSampleDemo && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button variant="ghost" size="sm" onClick={analysis.clearFile} className="gap-1.5 -ml-2">
                    <ArrowLeft className="w-4 h-4" /> Nova análise
                  </Button>
                  {analysis.historyId && (
                    <span className="text-xs text-muted-foreground">Salva em "Minhas análises"</span>
                  )}
                </div>
              )}
              <AnalysisReport
                report={analysis.report}
                autoStartTour={sampleType === 'safe'}
                isSampleDemo={isSampleDemo}
              />
            </section>
          )}

          {showWorkspaceHome && user && (
            <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-4">
              <div className="md:col-span-3">
                <AnalysisHistory refreshKey={historyKey} onOpen={analysis.openFromHistory} />
              </div>
              <div className="md:col-span-2">
                <AccountPanel />
              </div>
            </div>
          )}

          {showWorkspaceHome && (
            <div className="max-w-4xl mx-auto pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground text-center">Como funciona</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { num: '01', icon: Upload, title: 'Envio do PDF', desc: 'Conexão segura (HTTPS). O arquivo não fica guardado nos nossos servidores.' },
                  { num: '02', icon: Brain, title: 'Leitura e análise por IA', desc: 'Proprietários, ônus, penhoras e georreferenciamento, com conferência no texto lido.' },
                  { num: '03', icon: FileCheck, title: 'Relatório e PDF', desc: 'Nota de risco, pontos para conferir e relatório em PDF, salvos na sua conta.' },
                ].map(({ num, icon: Icon, title, desc }) => (
                  <div key={num} className="p-4 rounded-2xl bg-card border border-border space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                        {num}
                      </span>
                      <Icon className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-foreground text-xs">{title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <ErrorModal
        isOpen={!!analysis.error}
        onClose={analysis.closeError}
        title="Não foi possível analisar"
        message={analysis.error || ''}
      />

      <WhatsAppSupport variant="floating" />
    </div>
  );
};

export { MatriculaAnalysis };
export default MatriculaAnalysis;
