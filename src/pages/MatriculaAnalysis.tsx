import React, { useCallback } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { AnalysisReport } from '@/components/AnalysisReport';
import { ErrorModal } from '@/components/ErrorModal';
import { useMatriculaAnalysis } from '@/hooks/useMatriculaAnalysis';
import { Upload, FileText, FileCheck, ShieldCheck, Brain, ArrowRight, LogOut, Sparkles, Zap, Lock } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { Logo } from '@/components/Logo';

const MatriculaAnalysis: React.FC = () => {
  const analysis = useMatriculaAnalysis();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const hasSampleParam = params.get('sample') === 'safe' || params.get('sample') === 'true';

  // Modo de demonstração interativo
  const isSampleDemo = hasSampleParam || Boolean(analysis.report && !analysis.file?.size);

  React.useEffect(() => {
    if (hasSampleParam && !analysis.report && !analysis.isProcessing) {
      analysis.loadSampleReport('safe');
    }
  }, [hasSampleParam, analysis.report, analysis.isProcessing]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) analysis.processFile(acceptedFiles[0], user?.hasSubscription);
  }, [analysis.processFile, user?.hasSubscription]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: analysis.isProcessing,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-white">
      {/* Glassmorphic App Header Estilo AI Platform */}
      <header className="sticky top-0 z-50 text-foreground glass border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="text-[13px] text-muted-foreground hidden sm:inline">
              {isSampleDemo ? 'Demonstração' : 'Workspace'}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Só mostra controles de assinatura/logout quando usuário está logado */}
            {user && (
              <>
                {(() => {
                  if (user.hasSubscription) {
                    return (
                      <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-xs hidden sm:flex gap-1.5 px-3 py-1 font-semibold rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Plano 3 Meses Ilimitado (Ativo)
                      </Badge>
                    );
                  }
                  return (
                    <Link to="/pagamento-pix">
                      <Button size="sm" className="text-white font-semibold text-xs px-3.5 gap-1.5 bg-primary">
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>Garantir 3 Meses por R$ 49,90</span>
                      </Button>
                    </Link>
                  );
                })()}
                <span className="text-xs text-muted-foreground hidden md:block truncate max-w-[180px] font-medium">{user.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-semibold gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </Button>
              </>
            )}

            {/* Se for demo pública (não logado), mostra CTA de cadastro */}
            {isSampleDemo && (
              <Link to="/auth">
                <Button size="sm" className="text-white font-semibold text-xs px-4 gap-1.5 bg-primary">
                  <span className="sm:hidden">Assinar</span>
                  <span className="hidden sm:inline">Criar conta — R$ 49,90</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 sm:py-10 space-y-8">



        {/* Hero Title & Subtitle — só para workspace real */}
        {!isSampleDemo && (
          <div className="text-center space-y-2 animate-fade-in pt-2">
            <Badge variant="outline" className="border-border text-primary bg-card text-xs font-semibold px-3.5 py-1 rounded-full shadow-inner">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary inline" /> Plataforma de Auditoria Registrária Automatizada
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-semibold text-foreground tracking-tight leading-tight">
              Análise de Matrícula Imobiliária em Tempo Real
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
              Arraste ou selecione a certidão de matrícula em PDF para emissão instantânea do parecer de Due Diligence dos 12 Módulos Registrais.
            </p>
          </div>
        )}

        {/* Direct Upload & Analysis Flow — só para workspace real (usuário logado) */}
        <div className="space-y-8">
          {!isSampleDemo && (
            <Card className="max-w-2xl mx-auto border-border shadow-medium rounded-3xl bg-card text-foreground overflow-hidden">
              <CardHeader className="pb-3 border-b border-border bg-background/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                      <Upload className="w-3.5 h-3.5 stroke-[2]" />
                    </div>
                    Upload da Matrícula em PDF
                  </CardTitle>
                  <span className="text-xs font-semibold text-muted-foreground">PDF • Máx 10MB</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {!analysis.file ? (
                  <div
                    {...getRootProps()}
                    className={`
                      border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 group
                      ${isDragActive
                        ? 'border-primary/30 bg-primary/10 scale-[0.99]'
                        : 'border-border hover:border-primary/30 hover:bg-background/60'
                      }
                      ${analysis.isProcessing ? 'pointer-events-none opacity-50' : ''}
                    `}
                  >
                    <input {...getInputProps()} />
                    <div className="space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-inner transition-transform">
                        <Upload className="w-7 h-7 stroke-[1.8]" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground">
                          {isDragActive ? 'Solte a matrícula aqui' : 'Arraste ou selecione a certidão em PDF'}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">Suporta matrículas digitalizadas, escaneadas ou nativas em PDF</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary text-white font-semibold text-xs px-5 transition-all"
                        disabled={analysis.isProcessing}
                      >
                        Selecionar Arquivo PDF
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <FileUpload
                    onFileSelect={(f) => analysis.processFile(f, user?.hasSubscription)}
                    selectedFile={analysis.file}
                    onClearFile={analysis.clearFile}
                    isProcessing={analysis.isProcessing}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Progress Section */}
          {analysis.isProcessing && (
            <section className="animate-fade-in-up">
              <AnalysisProgress
                progress={analysis.progress}
                currentStep={analysis.currentStep}
                steps={analysis.steps}
              />
            </section>
          )}

          {/* Report Section */}
          {analysis.report && !analysis.isProcessing && (
            <section className="animate-fade-in-up">
              <AnalysisReport
                report={analysis.report}
                autoStartTour={isSampleDemo}
                isSampleDemo={isSampleDemo}
              />
            </section>
          )}

          {/* Fluxo de Funcionamento Limpo — só para usuários logados sem análise ativa */}
          {!isSampleDemo && !analysis.file && !analysis.isProcessing && !analysis.report && (
            <div className="max-w-4xl mx-auto pt-4 space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-semibold text-muted-foreground">Como Funciona a Auditoria Automatizada</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { num: '01', icon: Upload, title: 'Upload Confidencial', desc: 'Envio seguro com criptografia bancária e sigilo LGPD.' },
                  { num: '02', icon: Brain, title: 'Extração dos 12 Módulos', desc: 'Processamento de proprietários, ônus, penhoras e georreferenciamento.' },
                  { num: '03', icon: FileCheck, title: 'Parecer & Exportação PDF', desc: 'Score de Risco, Semáforo Notarial e Dossiê em PDF completo.' },
                ].map(({ num, icon: Icon, title, desc }) => (
                  <div key={num} className="p-4 rounded-2xl bg-card/60 border border-border space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center border border-primary/30">
                        {num}
                      </span>
                      <h4 className="font-semibold text-foreground text-xs">{title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium pl-8">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Error Modal */}
      <ErrorModal
        isOpen={!!analysis.error}
        onClose={analysis.closeError}
        message={analysis.error || ''}
      />

      {/* Botão Flutuante de Suporte via WhatsApp */}
      <WhatsAppSupport variant="floating" />
    </div>
  );
};

export { MatriculaAnalysis };
export default MatriculaAnalysis;