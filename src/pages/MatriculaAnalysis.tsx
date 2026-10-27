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
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { Logo } from '@/components/Logo';
import { COMPANY_CONFIG } from '@/config/companyConfig';
import { ProjectConferenceWorkspace } from '@/components/project-conference/ProjectConferenceWorkspace';
import { FileSearch, Compass, Home } from 'lucide-react';
import { ProcedureLauncherHub, ProcedureType } from '@/components/hub/ProcedureLauncherHub';
import {
  loadCurrentProject,
  keepCurrentProject,
  projectHasContent,
  consolidateIssues,
} from '@/services/projectConferenceService';
import { SAMPLE_PROJECT_DATA } from '@/services/projectSampleData';
import { guessDocType } from '@/services/projectAiService';
import { projectMemory } from '@/services/projectMemory';

const MatriculaAnalysis: React.FC = () => {
  const analysis = useMatriculaAnalysis();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const moduloParam = searchParams.get('modulo') || searchParams.get('tab');
  const sampleParam = searchParams.get('sample');
  const isProjectSample = sampleParam === 'desdobro' || sampleParam === 'projeto';
  const sampleType = sampleParam === 'risk' ? 'risk' : sampleParam === 'safe' || sampleParam === 'true' ? 'safe' : null;
  const isSampleDemo = Boolean(sampleType) || isProjectSample || Boolean(analysis.isSample);

  // Procedimento inicial quando acionado pelo Hub
  const [initialProcedure, setInitialProcedure] = React.useState<string | undefined>(
    searchParams.get('proc') || (isProjectSample ? 'desdobro' : undefined)
  );

  // Módulo Ativo:
  // - 'projeto': Conferência Técnica de Projetos
  // - 'matricula': Auditoria de Certidão em PDF
  // - 'hub': Hub Central Orientado a Procedimentos (Padrão para novos acessos)
  // O Hub escolhido explicitamente (?modulo=hub) vale mesmo com um relatório de matrícula em memória: ao voltar para
  // a matrícula, o relatório continua lá
  const activeModule: 'hub' | 'matricula' | 'projeto' =
    moduloParam === 'hub'
      ? 'hub'
      : moduloParam === 'projeto' || isProjectSample
      ? 'projeto'
      : moduloParam === 'matricula' || analysis.file || analysis.report || analysis.isProcessing || sampleType
      ? 'matricula'
      : 'hub';

  const setModule = (mod: 'hub' | 'matricula' | 'projeto') => {
    const nextParams = new URLSearchParams(location.search);
    if (mod === 'hub') {
      nextParams.set('modulo', 'hub');
      nextParams.delete('proc');
      nextParams.delete('sample');
    } else if (mod === 'projeto') {
      nextParams.set('modulo', 'projeto');
    } else {
      nextParams.set('modulo', 'matricula');
    }
    navigate({ search: nextParams.toString() }, { replace: true });
  };

  usePageMeta(
    activeModule === 'hub'
      ? 'Hub de Procedimentos & Auditoria Imobiliária'
      : activeModule === 'projeto'
      ? 'Conferência Técnica de Projetos (Topografia & Cartório)'
      : isSampleDemo
      ? 'Exemplo de relatório de matrícula'
      : 'Análise de matrícula',
    '/app',
    undefined,
    { noindex: true }
  );

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

  // Projeto aberto nesta aba (só na memória) para o Hub oferecer a retomada
  const savedProjectData = React.useMemo(() => {
    void activeModule; // recalcula ao voltar para o Hub
    try {
      const saved = loadCurrentProject();
      if (!projectHasContent(saved)) return null;
      return {
        nome: saved.info.nome || 'Projeto Sem Título',
        matricula: saved.info.matricula || 'S/N',
        cartorio: saved.info.cartorio || 'Cartório de Registro de Imóveis',
        data: saved.info.data || 'Recente',
        issuesCount: consolidateIssues(saved).length,
      };
    } catch {
      return null;
    }
  }, [activeModule]);


  // Manipuladores de ação rápida no Hub
  const handleSelectProcedure = (proc: ProcedureType) => {
    if (proc === 'matricula') {
      setModule('matricula');
    } else {
      setInitialProcedure(proc);
      const nextParams = new URLSearchParams(location.search);
      nextParams.set('modulo', 'projeto');
      nextParams.set('proc', proc);
      navigate({ search: nextParams.toString() }, { replace: true });
    }
  };

  const openSampleProject = () => {
    keepCurrentProject(SAMPLE_PROJECT_DATA);
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('modulo', 'projeto');
    navigate({ search: nextParams.toString() }, { replace: true });
  };
  // O exemplo substitui o projeto aberto: com um projeto real em andamento, pede confirmação
  const [confirmSampleProject, setConfirmSampleProject] = useState(false);
  const handleLoadSampleProject = () => {
    const current = loadCurrentProject();
    if (!current.isSample && projectHasContent(current)) setConfirmSampleProject(true);
    else openSampleProject();
  };

  const handleLoadSampleMatricula = (type: 'risk' | 'safe') => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('modulo', 'matricula');
    nextParams.set('sample', type);
    navigate({ search: nextParams.toString() }, { replace: true });
    loadSampleReport(type);
  };

  // Arquivo solto no Hub: o nome do arquivo decide o caminho. Certidão de matrícula (ou PDF sem pista de projeto) vai
  // para a análise de matrícula; planta, memorial e arquivos de coordenadas abrem a conferência de projetos já com o
  // arquivo na lista da leitura com IA.
  const handleHubDropFile = (file: File) => {
    const nameLower = file.name.toLowerCase();
    const isMatricula = /matr[ií]cula|certid[ãa]o|inteiro.?teor|\bmat\b/i.test(nameLower);
    const isTopography = !isMatricula &&
      (/planta|memorial|desdobro|retific|unific|poligonal|levantamento|\.(kml|dxf|txt|csv|png|jpe?g)$/i.test(nameLower));

    if (isTopography) {
      let proc: ProcedureType = 'desdobro';
      if (/retific/i.test(nameLower)) proc = 'retificacao';
      else if (/unific/i.test(nameLower)) proc = 'unificacao';

      projectMemory.setFiles([
        ...projectMemory.getFiles(),
        { id: `hub-${Date.now()}`, file, tipo: guessDocType(file.name) },
      ]);
      handleSelectProcedure(proc);
    } else {
      setModule('matricula');
      startAnalysis(file);
    }
  };

  const left = user?.role === 'admin' ? null : daysLeft(user?.subscriptionExpiresAt ?? null);
  const showExpiryNotice = !isSampleDemo && user?.hasSubscription && left !== null && left <= 7;
  const showWorkspaceHome = !isSampleDemo && !analysis.file && !analysis.isProcessing && !analysis.report;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-white">
      <header className="sticky top-0 z-50 text-foreground glass border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <Logo />
            <span className="text-[13px] text-muted-foreground hidden lg:inline">
              {isSampleDemo ? 'Demonstração' : 'Workspace'}
            </span>
          </div>

          {/* Module Switcher - Desktop */}
          <nav aria-label="Módulos da Plataforma" className="hidden sm:flex items-center gap-1 p-1 bg-secondary rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setModule('hub')} disabled={analysis.isProcessing}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeModule === 'hub'
                  ? 'bg-card text-foreground shadow-soft border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-primary" />
              <span>Hub Central</span>
            </button>
            <button
              type="button"
              onClick={() => setModule('matricula')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeModule === 'matricula'
                  ? 'bg-card text-foreground shadow-soft border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5 text-primary" />
              <span>Análise de Matrícula</span>
            </button>
            <button
              type="button"
              onClick={() => setModule('projeto')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeModule === 'projeto'
                  ? 'bg-card text-foreground shadow-soft border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-primary" />
              <span>Conferência de Projetos</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Passo a Passo
              </span>
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {user && (
              <>
                {user.hasSubscription ? (
                  <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-xs hidden sm:flex gap-1.5 px-3 py-1 font-semibold rounded-full">
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

      {/* Module Switcher - Mobile */}
      <nav aria-label="Navegação rápida no celular" className="sm:hidden px-3 py-2 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => setModule('hub')} disabled={analysis.isProcessing}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeModule === 'hub'
              ? 'bg-primary text-primary-foreground shadow-soft'
              : 'bg-secondary text-muted-foreground'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          Hub
        </button>
        <button
          type="button"
          onClick={() => setModule('matricula')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeModule === 'matricula'
              ? 'bg-primary text-primary-foreground shadow-soft'
              : 'bg-secondary text-muted-foreground'
          }`}
        >
          <FileSearch className="w-3.5 h-3.5" />
          Matrícula
        </button>
        <button
          type="button"
          onClick={() => setModule('projeto')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeModule === 'projeto'
              ? 'bg-primary text-primary-foreground shadow-soft'
              : 'bg-secondary text-muted-foreground'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Projetos
        </button>
      </nav>

      {activeModule === 'hub' ? (
        <ProcedureLauncherHub
          onSelectProcedure={handleSelectProcedure}
          onLoadSampleProject={handleLoadSampleProject}
          onLoadSampleMatricula={handleLoadSampleMatricula}
          savedProject={savedProjectData}
          onOpenSavedProject={() => setModule('projeto')}
          onDropFile={handleHubDropFile}
          userName={user?.name}
        />
      ) : activeModule === 'projeto' ? (
        <ProjectConferenceWorkspace
          onBackToHub={() => setModule('hub')}
          initialProcedure={initialProcedure}
          startWithSample={isProjectSample}
        />
      ) : (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 sm:py-10 space-y-8">
          {/* Breadcrumb e navegação de retorno ao Hub */}
          <nav aria-label="Você está em" className="flex items-center justify-between text-xs text-muted-foreground">
            <ol className="flex items-center gap-1.5 font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => setModule('hub')} disabled={analysis.isProcessing}
                  className="hover:text-foreground inline-flex items-center gap-1 py-1"
                >
                  <Home className="w-3 h-3 text-primary" /> Hub Central
                </button>
              </li>
              <li aria-hidden="true">›</li>
              <li className="text-foreground font-semibold">Análise de Matrícula</li>
            </ol>
            <button
              type="button"
              onClick={() => setModule('hub')} disabled={analysis.isProcessing}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors py-1 px-2.5 rounded-lg hover:bg-secondary"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Hub</span>
            </button>
          </nav>


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
      )}

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

      <ErrorModal
        isOpen={confirmSampleProject}
        onClose={() => setConfirmSampleProject(false)}
        title="Abrir o exemplo no lugar do seu projeto?"
        message="O exemplo substitui o projeto aberto nesta aba, que não fica salvo. Se quiser guardá-lo, abra o projeto e use Exportar antes."
        actionLabel="Abrir o exemplo"
        onAction={() => { setConfirmSampleProject(false); openSampleProject(); }}
        cancelLabel="Cancelar"
      />

      <WhatsAppSupport variant="floating" />
    </div>
  );
};

export { MatriculaAnalysis };
export default MatriculaAnalysis;
