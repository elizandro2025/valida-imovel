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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

        {/* Hero Title & Subtitle */}
        <div className="text-center space-y-3 animate-fade-in">
          <Badge variant="outline" className="border-slate-800 text-emerald-400 bg-slate-900 text-xs font-extrabold px-3.5 py-1 rounded-full shadow-inner">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400 inline" /> Auditoria Registrária Automatizada em Tempo Real
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Análise Inteligente de Matrícula Imobiliária
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Plataforma de inteligência jurídica para auditoria e emissão de parecer de Due Diligence em matrículas de imóveis com Inteligência Artificial Registrária.
          </p>
        </div>

        {/* Direct Upload & Analysis Flow */}
        <div className="space-y-8">
          {/* Upload Card Estilo AI Workspace */}
          <Card className="max-w-2xl mx-auto border-slate-800 shadow-2xl rounded-3xl bg-slate-900 text-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-extrabold text-white flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <Upload className="w-4 h-4 stroke-[2]" />
                  </div>
                  Upload da Matrícula em PDF
                </CardTitle>
                <span className="text-xs font-bold text-slate-400">PDF • até 10MB</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!analysis.file ? (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-2xl p-10 sm:p-12 text-center cursor-pointer
                    transition-all duration-300 group
                    ${isDragActive
                      ? 'border-emerald-500 bg-emerald-500/10 scale-[0.99]'
                      : 'border-slate-800 hover:border-emerald-500/60 hover:bg-slate-950/60'
                    }
                    ${analysis.isProcessing ? 'pointer-events-none opacity-50' : ''}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 stroke-[1.8]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-white">
                        {isDragActive ? 'Solte a matrícula aqui' : 'Arraste ou selecione a matrícula'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 font-medium">Suporta arquivos PDF digitalizados ou pesquisáveis</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs h-10 px-5 shadow-lg shadow-emerald-500/20 transition-all"
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
              <AnalysisReport report={analysis.report} />
            </section>
          )}

          {/* How it works */}
          {!analysis.file && !analysis.isProcessing && (
            <Card className="max-w-4xl mx-auto border-slate-200/80 shadow-md rounded-3xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-base font-extrabold text-slate-900 text-center">Como funciona a auditoria registral</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    { num: '01', icon: Upload, title: 'Upload Seguro', desc: 'Envio confidencial do PDF da matrícula imobiliária com criptografia de ponta a ponta.' },
                    { num: '02', icon: Brain, title: 'Auditoria de 12 Módulos', desc: 'Processamento paralelo via IA Registrária examinando histórico, proprietários, ônus e georreferenciamento.' },
                    { num: '03', icon: FileCheck, title: 'Parecer Conclusivo', desc: 'Emissão de relatório auditado completo com Score de Risco, Chat Interativo e exportação em PDF.' },
                  ].map(({ num, icon: Icon, title, desc }) => (
                    <div key={num} className="text-center space-y-3 group p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="relative mx-auto w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-colors shadow-sm">
                        <Icon className="w-6 h-6 text-emerald-600 stroke-[1.8] group-hover:text-white transition-colors" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                          {num.replace('0', '')}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-900 text-sm">{title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center gap-3 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    <strong className="text-slate-900">Tecnologia Avançada:</strong> Utilizamos inteligência artificial especialidade registrária para análises precisas, confiáveis e seguras de documentos jurídicos imobiliários.
                  </p>
                </div>
              </CardContent>
            </Card>
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