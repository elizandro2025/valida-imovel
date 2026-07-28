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
import { subscriptionService } from '@/services/subscriptionService';

const MatriculaAnalysis: React.FC = () => {
  const analysis = useMatriculaAnalysis();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('sample') === 'safe' || params.get('sample') === 'true') {
      analysis.loadSampleReport('safe');
    }
  }, [location.search]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) analysis.processFile(acceptedFiles[0]);
  }, [analysis.processFile]);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Glassmorphic App Header Estilo AI Platform */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform font-black">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-tight">
                Valida<span className="text-emerald-400">Imóvel</span>
              </span>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] font-extrabold px-2 py-0.5 rounded-full hidden sm:inline-flex">
              AI Workspace
            </Badge>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Dynamic Subscription Status Badge or Upgrade CTA */}
            {(() => {
              const sub = subscriptionService.getStatus();
              if (sub.active) {
                return (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs hidden sm:flex gap-1.5 px-3 py-1 font-extrabold rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Plano 6 Meses Ilimitado (Ativo)
                  </Badge>
                );
              }
              return (
                <Link to="/pagamento-pix">
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3.5 h-8 rounded-xl shadow-md gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Garantir 6 Meses por R$ 99,90</span>
                  </Button>
                </Link>
              );
            })()}
            {user && (
              <span className="text-xs text-slate-400 hidden md:block truncate max-w-[180px] font-medium">{user.email}</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-bold gap-1.5 h-9"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">

        {/* Hero Title & Subtitle */}
        <div className="text-center space-y-2 animate-fade-in pt-2">
          <Badge variant="outline" className="border-slate-800 text-emerald-400 bg-slate-900 text-[11px] font-extrabold px-3.5 py-1 rounded-full shadow-inner">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400 inline" /> Plataforma de Auditoria Registrária Automatizada
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Análise de Matrícula Imobiliária em Tempo Real
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
            Arraste ou selecione a certidão de matrícula em PDF para emissão instantânea do parecer de Due Diligence dos 12 Módulos Registrais.
          </p>
        </div>

        {/* Direct Upload & Analysis Flow */}
        <div className="space-y-8">
          {/* Upload Container Minimalista */}
          <Card className="max-w-2xl mx-auto border-slate-800 shadow-2xl rounded-3xl bg-slate-900 text-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-extrabold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <Upload className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  Upload da Matrícula em PDF
                </CardTitle>
                <span className="text-[11px] font-bold text-slate-400">PDF • Máx 10MB</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!analysis.file ? (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer
                    transition-all duration-300 group
                    ${isDragActive
                      ? 'border-emerald-500 bg-emerald-500/10 scale-[0.99]'
                      : 'border-slate-800 hover:border-emerald-500/60 hover:bg-slate-950/60'
                    }
                    ${analysis.isProcessing ? 'pointer-events-none opacity-50' : ''}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7 stroke-[1.8]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm sm:text-base font-extrabold text-white">
                        {isDragActive ? 'Solte a matrícula aqui' : 'Arraste ou selecione a certidão em PDF'}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">Suporta matrículas digitalizadas, escaneadas ou nativas em PDF</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs h-9 px-5 shadow-lg shadow-emerald-500/20 transition-all"
                      disabled={analysis.isProcessing}
                    >
                      Selecionar Arquivo PDF
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <FileUpload
                  onFileSelect={analysis.processFile}
                  selectedFile={analysis.file}
                  onClearFile={analysis.clearFile}
                  isProcessing={analysis.isProcessing}
                />
              )}
            </CardContent>
          </Card>

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
                autoStartTour={Boolean(analysis.file?.name.includes('Fazenda'))}
              />
            </section>
          )}

          {/* Fluxo de Funcionamento Limpo */}
          {!analysis.file && !analysis.isProcessing && (
            <div className="max-w-4xl mx-auto pt-4 space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider">Como Funciona a Auditoria Automatizada</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { num: '01', icon: Upload, title: 'Upload Confidencial', desc: 'Envio seguro com criptografia bancária e sigilo LGPD.' },
                  { num: '02', icon: Brain, title: 'Extração dos 12 Módulos', desc: 'Processamento de proprietários, ônus, penhoras e georreferenciamento.' },
                  { num: '03', icon: FileCheck, title: 'Parecer & Exportação PDF', desc: 'Score de Risco, Semáforo Notarial e Dossiê em PDF completo.' },
                ].map(({ num, icon: Icon, title, desc }) => (
                  <div key={num} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center border border-emerald-500/30">
                        {num}
                      </span>
                      <h4 className="font-extrabold text-white text-xs">{title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium pl-8">{desc}</p>
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
    </div>
  );
};

export { MatriculaAnalysis };
export default MatriculaAnalysis;