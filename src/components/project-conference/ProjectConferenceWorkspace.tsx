import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ProjectData,
  createEmptyProject,
  loadProjectFromStorage,
  saveProjectToStorage,
  consolidateIssues,
  computeAutomaticOpinion,
} from '../../services/projectConferenceService';
import { ProjectHeader } from './ProjectHeader';
import { ProjectInfoTab } from './ProjectInfoTab';
import { PlantaMemorialTab } from './PlantaMemorialTab';
import { PoligonalTab } from './PoligonalTab';
import { ConfrontantesTab } from './ConfrontantesTab';
import { ChecklistTab } from './ChecklistTab';
import { InconsistenciasTab } from './InconsistenciasTab';
import { ParecerRelatorioTab } from './ParecerRelatorioTab';
import { AiConferenceTab } from './AiConferenceTab';
import { AmarracaoTab } from './AmarracaoTab';
import { AnalisesTab } from './AnalisesTab';
import { ExecutiveCockpit } from './ExecutiveCockpit';
import { SAMPLE_PROJECT_DATA } from '@/services/projectSampleData';
import { PROCEDURE_CHECKLISTS } from '@/services/projectChecklists';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  FileSpreadsheet,
  Compass,
  Pentagon,
  CheckSquare,
  AlertOctagon,
  Award,
  Sparkles,
  Wand2,
  Link2,
  NotebookPen,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  LayoutGrid,
  Route as RouteIcon,
  HelpCircle,
  FileCheck2,
  ChevronRight,
  Check,
  Printer,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type WorkspaceTab =
  | 'info'
  | 'planta_memorial'
  | 'confrontantes'
  | 'poligonal'
  | 'checklists'
  | 'amarracao'
  | 'analises'
  | 'inconsistencias'
  | 'parecer'
  | 'ia';

export type MacroStage = 'geometria' | 'confronto' | 'laudo';
export type WizardStep = 1 | 2 | 3 | 4;

interface TabConfig {
  id: WorkspaceTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: { count: number | string; variant: 'danger' | 'warning' | 'info' | 'success' };
}

interface ProjectConferenceWorkspaceProps {
  onBackToHub?: () => void;
  initialProcedure?: string;
}

export const ProjectConferenceWorkspace: React.FC<ProjectConferenceWorkspaceProps> = ({
  onBackToHub,
  initialProcedure,
}) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData>(() => loadProjectFromStorage());
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('info');
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [viewMode, setViewMode] = useState<'wizard' | 'expert'>('wizard');
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Autosave to localStorage on project state change
  const handleProjectUpdate = useCallback(
    (updater: (prev: ProjectData) => ProjectData) => {
      setSaveStatus('saving');
      setProject((prev) => {
        const next = updater(prev);
        saveProjectToStorage(next);
        return next;
      });
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus('saved'), 350);
    },
    []
  );

  // Se houver procedimento inicial solicitado via Hub, parametriza se o projeto estiver novo
  useEffect(() => {
    if (initialProcedure) {
      handleProjectUpdate(prev => {
        if (prev.info.procedimentos.length === 1 && prev.info.procedimentos[0] === initialProcedure) {
          return prev;
        }

        const procedureNames: Record<string, string> = {
          desdobro: 'Conferência de Desdobro de Lote Urbano',
          retificacao: 'Conferência de Retificação de Área (LRP)',
          unificacao: 'Conferência de Unificação de Lotes',
          estremacao: 'Conferência de Estremação de Parcela (Prov. CNJ 149)',
          divisao: 'Conferência de Divisão e Extinção de Condomínio',
          reurb: 'Conferência de Regularização Fundiária (REURB-S)',
        };

        const defaultTitle = procedureNames[initialProcedure] || 'Conferência Pericial Técnica';
        const isDefaultOrEmptyTitle = !prev.info.nome || Object.values(procedureNames).includes(prev.info.nome);

        return {
          ...prev,
          info: {
            ...prev.info,
            procedimentos: [initialProcedure],
            nome: isDefaultOrEmptyTitle ? defaultTitle : prev.info.nome,
          },
        };
      });
    }
  }, [initialProcedure, handleProjectUpdate]);

  // Periodic visual clock for "salvo há X minutos/segundos"
  const [timeAgoText, setTimeAgoText] = useState('agora mesmo');
  useEffect(() => {
    const interval = setInterval(() => {
      const diffSec = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      if (diffSec < 5) setTimeAgoText('agora mesmo');
      else if (diffSec < 60) setTimeAgoText(`há ${diffSec}s`);
      else setTimeAgoText(`há ${Math.floor(diffSec / 60)}min`);
    }, 5000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  // Derived metrics for tabs badges
  const allIssues = consolidateIssues(project);
  const criticalCount = allIssues.filter((i) => i.tipo === 'div').length;
  const missingDocsCount = project.docs.filter((d) =>
    ['Ausente', 'Ilegível', 'Incompleto'].includes(d.status)
  ).length;
  const { opinion } = computeAutomaticOpinion(project);
  const totalChecklistItems = PROCEDURE_CHECKLISTS
    .filter((p) => project.info.procedimentos.includes(p.key))
    .reduce((acc, p) => acc + p.items.length, 0);

  const handleLoadSample = useCallback(() => {
    handleProjectUpdate(() => SAMPLE_PROJECT_DATA);
    setActiveTab('parecer');
    setWizardStep(4);
  }, [handleProjectUpdate]);

  const tabConfigs: Record<WorkspaceTab, TabConfig> = useMemo(() => ({
    ia: {
      id: 'ia',
      label: 'Leitura Automática com IA',
      shortLabel: 'Leitura IA',
      icon: Wand2,
      badge: project.ai ? { count: 'OK', variant: 'success' } : { count: 'Auto', variant: 'info' },
    },
    info: {
      id: 'info',
      label: 'Documentos do Trabalho',
      shortLabel: 'Documentos',
      icon: FolderKanban,
      badge:
        missingDocsCount > 0
          ? { count: missingDocsCount, variant: 'warning' }
          : undefined,
    },
    poligonal: {
      id: 'poligonal',
      label: 'Conferência de Medidas e Áreas',
      shortLabel: 'Medidas & Área',
      icon: Pentagon,
      badge:
        project.polygon.rawCoords.trim().length > 0
          ? { count: 'Gauss OK', variant: 'info' }
          : undefined,
    },
    planta_memorial: {
      id: 'planta_memorial',
      label: 'Confronto Planta × Memorial',
      shortLabel: 'Planta × Memorial',
      icon: FileSpreadsheet,
      badge:
        allIssues.filter((i) => i.origem.includes('Planta × Memorial')).length > 0
          ? {
              count: allIssues.filter((i) => i.origem.includes('Planta × Memorial')).length,
              variant: 'danger',
            }
          : undefined,
    },
    confrontantes: {
      id: 'confrontantes',
      label: 'Vizinhos e Divisas Limítrofes',
      shortLabel: 'Vizinhos & Divisas',
      icon: Compass,
      badge:
        project.neighbors.length > 0
          ? { count: project.neighbors.length, variant: 'info' }
          : undefined,
    },
    checklists: {
      id: 'checklists',
      label: 'Checklist de Requisitos da Lei',
      shortLabel: 'Requisitos Legais',
      icon: CheckSquare,
      badge:
        totalChecklistItems > 0
          ? { count: totalChecklistItems, variant: 'danger' }
          : undefined,
    },
    amarracao: {
      id: 'amarracao',
      label: 'Amarração e Relação de Divisas',
      shortLabel: 'Amarrações',
      icon: Link2,
      badge:
        project.amarracoes.length > 0
          ? { count: project.amarracoes.length, variant: 'info' }
          : undefined,
    },
    analises: {
      id: 'analises',
      label: 'Minuta de Descrição do Imóvel',
      shortLabel: 'Minuta Pericial',
      icon: NotebookPen,
      badge:
        Object.values(project.analises || {}).filter(Boolean).length > 0
          ? { count: 'Redigido', variant: 'success' }
          : undefined,
    },
    inconsistencias: {
      id: 'inconsistencias',
      label: 'Diferenças e Pendências Encontradas',
      shortLabel: 'Diferenças',
      icon: AlertOctagon,
      badge:
        criticalCount > 0
          ? { count: criticalCount, variant: 'danger' }
          : allIssues.length > 0
          ? { count: allIssues.length, variant: 'warning' }
          : undefined,
    },
    parecer: {
      id: 'parecer',
      label: 'Resultado da Análise & Laudo',
      shortLabel: 'Resultado Final',
      icon: Award,
      badge:
        opinion === 'DOCUMENTAÇÃO COMPATÍVEL'
          ? { count: 'Apto', variant: 'success' }
          : opinion === 'DOCUMENTAÇÃO COM DIVERGÊNCIAS'
          ? { count: 'Risco', variant: 'danger' }
          : { count: 'Incompleto', variant: 'warning' },
    },
  }), [project, missingDocsCount, allIssues, criticalCount, totalChecklistItems, opinion]);

  // Definição dos 4 Passos do Fluxo Guiado
  const WIZARD_STEPS_CONFIG = [
    {
      step: 1 as WizardStep,
      title: 'Documentos do Trabalho',
      description: 'Identificação do imóvel e envio das peças do projeto',
      icon: FolderKanban,
      defaultTab: 'info' as WorkspaceTab,
      allowedTabs: ['info'] as WorkspaceTab[],
      badge: missingDocsCount > 0 ? `${missingDocsCount} pendente(s)` : 'Documentos OK',
      isComplete: Boolean(project.info.nome && project.info.matricula),
    },
    {
      step: 2 as WizardStep,
      title: 'Conferência de Medidas e Áreas',
      description: 'Cálculo perimétrico e confronto entre Planta e Memorial',
      icon: Pentagon,
      defaultTab: 'ia' as WorkspaceTab,
      allowedTabs: ['ia', 'poligonal', 'planta_memorial'] as WorkspaceTab[],
      badge: project.polygon.rawCoords.trim() ? 'Medidas Validadas' : 'Aguardando Medidas',
      isComplete: Boolean(project.polygon.rawCoords.trim()),
    },
    {
      step: 3 as WizardStep,
      title: 'Vizinhos e Diferenças Encontradas',
      description: 'Divisas limítrofes, anuências e prevenção de notas devolutivas',
      icon: Compass,
      defaultTab: 'confrontantes' as WorkspaceTab,
      allowedTabs: ['confrontantes', 'inconsistencias', 'checklists', 'amarracao'] as WorkspaceTab[],
      badge: criticalCount > 0 ? `${criticalCount} diferença(s)` : 'Sem divergências',
      isComplete: project.neighbors.length > 0,
    },
    {
      step: 4 as WizardStep,
      title: 'Resultado da Análise & Laudo',
      description: 'Parecer conclusivo e emissão de relatório em Word e PDF',
      icon: Award,
      defaultTab: 'parecer' as WorkspaceTab,
      allowedTabs: ['parecer', 'analises'] as WorkspaceTab[],
      badge: opinion,
      isComplete: Boolean(project.parecer?.final || opinion),
    },
  ];

  // Sincroniza passo do wizard quando o usuário muda de aba no modo wizard
  const handleSelectTabInWizard = (tabId: WorkspaceTab) => {
    setActiveTab(tabId);
    const stepObj = WIZARD_STEPS_CONFIG.find(s => s.allowedTabs.includes(tabId));
    if (stepObj && stepObj.step !== wizardStep) {
      setWizardStep(stepObj.step);
    }
  };

  const handleGoToStep = (stepNumber: WizardStep) => {
    setWizardStep(stepNumber);
    const targetConfig = WIZARD_STEPS_CONFIG.find(s => s.step === stepNumber);
    if (targetConfig) {
      if (!targetConfig.allowedTabs.includes(activeTab)) {
        setActiveTab(targetConfig.defaultTab);
      }
    }
  };

  // 3 Macro Estágios Legados para o Modo Especialista
  const stages: {
    id: MacroStage;
    number: string;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    tabs: WorkspaceTab[];
    statusBadge: { label: string; variant: 'success' | 'danger' | 'warning' | 'neutral' };
  }[] = useMemo(() => [
    {
      id: 'geometria',
      number: '01',
      title: 'Peças & Geometria',
      subtitle: 'Dossiê técnico, serventia e malha Gauss',
      icon: Pentagon,
      tabs: ['info', 'poligonal'],
      statusBadge:
        missingDocsCount === 0 && project.polygon.rawCoords.trim().length > 0
          ? { label: 'Concluído', variant: 'success' }
          : missingDocsCount > 0
          ? { label: `${missingDocsCount} docs pendentes`, variant: 'warning' }
          : { label: 'Aguardando Coordenadas', variant: 'neutral' },
    },
    {
      id: 'confronto',
      number: '02',
      title: 'Auditoria & Matriz 7D',
      subtitle: 'Planta × Memorial, divisas e quesitos CGJ',
      icon: Compass,
      tabs: ['planta_memorial', 'confrontantes', 'amarracao', 'checklists'],
      statusBadge:
        criticalCount > 0
          ? { label: `${criticalCount} divergências`, variant: 'danger' }
          : { label: 'Conferência Ativa', variant: 'neutral' },
    },
    {
      id: 'laudo',
      number: '03',
      title: 'Riscos, IA & Laudo',
      subtitle: 'Auditor IA, não-conformidades e minuta',
      icon: Award,
      tabs: ['ia', 'inconsistencias', 'analises', 'parecer'],
      statusBadge:
        opinion === 'DOCUMENTAÇÃO COMPATÍVEL'
          ? { label: 'Apto p/ Registro', variant: 'success' }
          : opinion === 'DOCUMENTAÇÃO COM DIVERGÊNCIAS'
          ? { label: 'Risco Registral', variant: 'danger' }
          : { label: 'Em Análise', variant: 'warning' },
    },
  ], [missingDocsCount, project.polygon.rawCoords, criticalCount, opinion]);

  const activeStageId = stages.find((s) => s.tabs.includes(activeTab))?.id || 'geometria';

  const handleStageSelect = (stageId: MacroStage) => {
    const targetStage = stages.find((s) => s.id === stageId);
    if (!targetStage) return;
    if (!targetStage.tabs.includes(activeTab)) {
      setActiveTab(targetStage.tabs[0]);
    }
  };

  const currentStageTabs = stages.find((s) => s.id === activeStageId)?.tabs || [];
  const currentWizardStepConfig = WIZARD_STEPS_CONFIG.find(s => s.step === wizardStep) || WIZARD_STEPS_CONFIG[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col transition-colors">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-indigo-950">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (onBackToHub) onBackToHub();
              else navigate('/app');
            }}
            className="flex items-center gap-1.5 text-indigo-200 hover:text-white font-semibold transition-colors mr-2 pr-2 border-r border-indigo-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hub de Procedimentos</span>
          </button>
          <span className="font-semibold tracking-wide hidden sm:inline">
            ValidaImóvel PRO: Auditoria Pericial & Notarial
          </span>
          <span className="hidden md:inline text-indigo-300">
            • ABNT NBR 17047 / Lei 6.015/73 / NSCGJ-SP
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-indigo-200">
          {/* Seletor de Modo: Fluxo Guiado vs Modo Especialista */}
          <div className="flex items-center bg-indigo-950/80 p-0.5 rounded-lg border border-indigo-800/80">
            <button
              type="button"
              onClick={() => setViewMode('wizard')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'wizard'
                  ? 'bg-white text-blue-950 shadow-2xs font-bold'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <RouteIcon className="w-3 h-3" />
              <span>Fluxo Guiado</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('expert')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'expert'
                  ? 'bg-white text-blue-950 shadow-2xs font-bold'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Grade Técnica (10 Abas)</span>
            </button>
          </div>

          <span className="hidden sm:inline">
            {saveStatus === 'saving' ? (
              <span className="text-amber-300 font-semibold animate-pulse">Salvando...</span>
            ) : (
              <span>Salvo {timeAgoText}</span>
            )}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col space-y-6">
        {/* Project Header Component */}
        <ProjectHeader
          data={project}
          onUpdate={handleProjectUpdate}
          onReset={() => {
            const empty = createEmptyProject();
            handleProjectUpdate(() => empty);
            setWizardStep(1);
            setActiveTab('info');
          }}
          onLoadSample={handleLoadSample}
          lastSavedText={timeAgoText}
        />

        {/* ------------------------------------------------------------- */}
        {/* EXPERIÊNCIA 1: FLUXO GUIADO PASSO A PASSO (WIZARD RECOMENDADO) */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'wizard' ? (
          <div className="space-y-6">
            {/* Stepper Superior dos 4 Passos com Indicador Visual */}
            <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {WIZARD_STEPS_CONFIG.map((s) => {
                  const isCurrent = s.step === wizardStep;
                  const isPast = s.step < wizardStep;
                  const StepIcon = s.icon;

                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => handleGoToStep(s.step)}
                      className={`text-left p-3.5 rounded-xl border transition-all duration-200 relative flex items-start gap-3 group ${
                        isCurrent
                          ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/30'
                          : isPast
                          ? 'bg-card border-border hover:border-primary/40'
                          : 'bg-muted/20 border-border/50 text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                          isCurrent
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : isPast
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : <StepIcon className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                            Passo 0{s.step}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              isCurrent
                                ? 'bg-primary/10 text-primary'
                                : isPast
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {isCurrent ? 'Em Andamento' : isPast ? 'Concluído' : 'Próximo'}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                          {s.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
                          {s.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sub-Navegação focada apenas nas ferramentas da etapa atual */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-muted-foreground font-semibold mr-1">
                    Visualizando:
                  </span>
                  {currentWizardStepConfig.allowedTabs.map((tabId) => {
                    const tab = tabConfigs[tabId];
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-foreground text-background shadow-xs'
                            : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                        {tab.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                              tab.badge.variant === 'danger'
                                ? 'bg-rose-500 text-white'
                                : tab.badge.variant === 'warning'
                                ? 'bg-amber-500 text-white'
                                : tab.badge.variant === 'success'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {tab.badge.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Banner resumo rápido de conformidade */}
                <div className="flex items-center gap-2 text-xs">
                  <div className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 ${
                    opinion === 'DOCUMENTAÇÃO COMPATÍVEL'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : opinion === 'DOCUMENTAÇÃO COM DIVERGÊNCIAS'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {opinion === 'DOCUMENTAÇÃO COMPATÍVEL' ? (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    ) : opinion === 'DOCUMENTAÇÃO COM DIVERGÊNCIAS' ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <FileCheck2 className="w-3.5 h-3.5" />
                    )}
                    <span>{opinion}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo da Ferramenta Ativa */}
            <div className="flex-1">
              {activeTab === 'info' && (
                <ProjectInfoTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'planta_memorial' && (
                <PlantaMemorialTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'confrontantes' && (
                <ConfrontantesTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'poligonal' && (
                <PoligonalTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'checklists' && (
                <ChecklistTab
                  data={project}
                  onUpdate={handleProjectUpdate}
                  onNavigateToAi={() => setActiveTab('ia')}
                />
              )}
              {activeTab === 'amarracao' && (
                <AmarracaoTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'analises' && (
                <AnalisesTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'inconsistencias' && (
                <InconsistenciasTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'parecer' && (
                <ParecerRelatorioTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'ia' && (
                <AiConferenceTab
                  data={project}
                  onUpdate={handleProjectUpdate}
                  onFinished={() => {
                    setWizardStep(3);
                    setActiveTab('confrontantes');
                  }}
                />
              )}
            </div>

            {/* Barra Inferior com Ações de Continuidade do Fluxo Guiado */}
            <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-4 z-20 backdrop-blur-md bg-card/95">
              <div>
                {wizardStep > 1 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGoToStep((wizardStep - 1) as WizardStep)}
                    className="gap-2 text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar ao Passo 0{wizardStep - 1}</span>
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (onBackToHub) onBackToHub();
                      else navigate('/app');
                    }}
                    className="gap-2 text-xs text-muted-foreground"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar ao Hub de Procedimentos</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {wizardStep < 4 ? (
                  <Button
                    onClick={() => handleGoToStep((wizardStep + 1) as WizardStep)}
                    size="sm"
                    className="gap-2 text-xs font-semibold bg-primary hover:bg-primary/95 text-primary-foreground shadow-xs h-9 px-4"
                  >
                    <span>Continuar para Passo 0{wizardStep + 1}: {WIZARD_STEPS_CONFIG[wizardStep].title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => window.print()}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-9"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir / PDF</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab('parecer')}
                      size="sm"
                      className="gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs h-9 px-4"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Concluir e Baixar Laudo Oficial</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* EXPERIÊNCIA 2: MODO ESPECIALISTA (GRADE TÉCNICA CLÁSSICA 10 ABAS) */
          /* ------------------------------------------------------------- */
          <div className="space-y-6">
            {/* Executive Cockpit Hero */}
            <ExecutiveCockpit
              data={project}
              onNavigateTab={setActiveTab}
              onLoadSample={handleLoadSample}
              allIssues={allIssues}
              opinion={opinion}
            />

            {/* 3 Macro Estágios */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {stages.map((stage) => {
                  const isActiveStage = stage.id === activeStageId;
                  const StageIcon = stage.icon;

                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => handleStageSelect(stage.id)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 relative overflow-hidden group ${
                        isActiveStage
                          ? 'bg-card border-primary/60 shadow-md ring-2 ring-primary/20'
                          : 'bg-card/70 border-border/70 hover:border-border hover:bg-card hover:shadow-xs'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isActiveStage
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground group-hover:text-foreground'
                        }`}
                      >
                        <StageIcon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase">
                            Estágio {stage.number}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              stage.statusBadge.variant === 'danger'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : stage.statusBadge.variant === 'warning'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : stage.statusBadge.variant === 'success'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {stage.statusBadge.label}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-foreground truncate">
                          {stage.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {stage.subtitle}
                        </p>
                      </div>

                      {isActiveStage && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sub-barra de todas as abas */}
              <div className="bg-card border border-border/80 rounded-2xl p-2 shadow-xs flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentStageTabs.map((tabId) => {
                    const tab = tabConfigs[tabId];
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                        {tab.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                              tab.badge.variant === 'danger'
                                ? 'bg-rose-500 text-white'
                                : tab.badge.variant === 'warning'
                                ? 'bg-amber-500 text-white'
                                : tab.badge.variant === 'success'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {tab.badge.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="shrink-0 pl-2 border-l border-border/50">
                  <button
                    type="button"
                    onClick={() => setActiveTab('parecer')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'parecer'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Emitir Laudo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content Display */}
            <div className="flex-1">
              {activeTab === 'info' && (
                <ProjectInfoTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'planta_memorial' && (
                <PlantaMemorialTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'confrontantes' && (
                <ConfrontantesTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'poligonal' && (
                <PoligonalTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'checklists' && (
                <ChecklistTab
                  data={project}
                  onUpdate={handleProjectUpdate}
                  onNavigateToAi={() => setActiveTab('ia')}
                />
              )}
              {activeTab === 'amarracao' && (
                <AmarracaoTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'analises' && (
                <AnalisesTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'inconsistencias' && (
                <InconsistenciasTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'parecer' && (
                <ParecerRelatorioTab data={project} onUpdate={handleProjectUpdate} />
              )}
              {activeTab === 'ia' && (
                <AiConferenceTab
                  data={project}
                  onUpdate={handleProjectUpdate}
                  onFinished={() => setActiveTab('parecer')}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
