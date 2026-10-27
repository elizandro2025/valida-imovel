import React, { useCallback, useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { AnalysisReport } from '@/components/AnalysisReport';
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

  const sampleParam = new URLSearchParams(location.search).get('sample');
  const sampleType = sampleParam === 'risk' ? 'risk' : sampleParam === 'safe' || sampleParam === 'true' ? 'safe' : null;
  const isSampleDemo = Boolean(sampleType) || Boolean(analysis.isSample);

  usePageMeta(isSampleDemo ? 'Exemplo de relatório de matrícula' : 'Análise de matrícula', '/app', undefined, { noindex: true });

  const { loadSampleReport } = analysis;
  React.useEffect(() => {
    if (sampleType && !analysis.report && !analysis.isProcessing) loadSampleReport(sampleType);
  }, [sampleType, analysis.report, analysis.isProcessing, loadSampleReport]);

  const { processFile } = analysis;
  const startAnalysis = useCallback((file: File) => {
    processFile(file, { hasSubscription: user?.hasSubscription });
  }, [processFile, user?.hasSubscription]);

  // Depois de uma falha o arquivo continua escolhido: a nova tentativa reaproveita o texto já lido (não conta outra análise)
  const retryFile = !analysis.wrongDocument && !analysis.isProcessing && !analysis.report ? analysis.file : null;
  const retryAnalysis = () => {
    if (!retryFile) return;
    analysis.closeError();
    startAnalysis(retryFile);
  };

  // O relatório não fica salvo: avisa antes de fechar ou recarregar a aba com uma análise real na tela
  const hasUnsavedReport = Boolean(analysis.report) && !isSampleDemo;
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  React.useEffect(() => {
    if (!hasUnsavedReport) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsavedReport]);

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
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
                    <Button size="sm" className="font-semibold">Assinar por {COMPANY_CONFIG.offer.priceFormatted}</Button>
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
                  <span className="hidden sm:inline">Criar conta · {COMPANY_CONFIG.offer.priceFormatted}</span>
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
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Envie a certidão de matrícula em PDF. Em poucos minutos você recebe a nota de risco, os ônus, a cadeia dominial e o parecer dos 12 módulos.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {!isSampleDemo && !analysis.report && (
            <Card className="max-w-2xl mx-auto border-0 ring-1 ring-black/5 shadow-medium rounded-3xl bg-card text-foreground overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                {!analysis.file ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl px-6 py-12 sm:py-14 text-center cursor-pointer transition-colors duration-300
                      ${isDragActive ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-secondary/60'}
                      ${analysis.isProcessing ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Upload className="w-7 h-7 stroke-[1.8]" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                          {isDragActive ? 'Solte a matrícula aqui' : 'Arraste a certidão em PDF'}
                        </h3>
                        <p className="text-sm text-muted-foreground">Digital ou escaneada, até 15 MB</p>
                      </div>
                      <Button disabled={analysis.isProcessing}>
                        Escolher arquivo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileUpload
                      onFileSelect={startAnalysis}
                      selectedFile={analysis.file}
                      onClearFile={analysis.clearFile}
                      isProcessing={analysis.isProcessing}
                    />
                    {retryFile && !analysis.error && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-xs text-muted-foreground">A análise deste arquivo não terminou.</p>
                        <Button onClick={retryAnalysis} className="w-full sm:w-auto">Tentar de novo</Button>
                      </div>
                    )}
                  </div>
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
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDiscard(true)} className="gap-1.5 -ml-2">
                    <ArrowLeft className="w-4 h-4" /> Nova análise
                  </Button>
                  <span className="text-xs text-muted-foreground">Esta análise não fica salva. Exporte o PDF para guardar.</span>
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
            <div className="max-w-2xl mx-auto">
              <AccountPanel />
            </div>
          )}

          {showWorkspaceHome && (
            <div className="max-w-2xl mx-auto pt-6 grid sm:grid-cols-3 gap-6 text-center sm:text-left">
              {[
                { icon: Upload, title: 'Envie o PDF', desc: 'Por conexão segura. O arquivo não fica guardado nos nossos servidores.' },
                { icon: Brain, title: 'A IA analisa', desc: 'Proprietários, ônus e penhoras, conferidos no texto lido.' },
                { icon: FileCheck, title: 'Receba o relatório', desc: 'Nota de risco e relatório em PDF para baixar. A análise não fica guardada.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="space-y-1.5">
                  <Icon className="w-5 h-5 text-primary mx-auto sm:mx-0" />
                  <h4 className="font-semibold text-foreground text-sm">{title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ErrorModal
        isOpen={!!analysis.error}
        onClose={analysis.closeError}
        title={analysis.wrongDocument ? 'Este PDF não é a certidão da matrícula' : 'Não foi possível analisar'}
        message={analysis.error || ''}
        actionLabel={analysis.wrongDocument ? 'Escolher a certidão' : retryFile ? 'Tentar de novo' : 'Fechar'}
        onAction={analysis.wrongDocument ? () => { analysis.closeError(); openFilePicker(); } : retryFile ? retryAnalysis : undefined}
        cancelLabel={!analysis.wrongDocument && retryFile ? 'Fechar' : undefined}
      />

      <ErrorModal
        isOpen={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        title="Começar uma nova análise?"
        message="O relatório atual não fica salvo e vai sair da tela. Se quiser guardá-lo, exporte o PDF antes."
        actionLabel="Começar nova análise"
        onAction={() => { setConfirmDiscard(false); analysis.clearFile(); }}
        cancelLabel="Voltar ao relatório"
      />

      <WhatsAppSupport variant="floating" />
    </div>
  );
};

export { MatriculaAnalysis };
export default MatriculaAnalysis;
