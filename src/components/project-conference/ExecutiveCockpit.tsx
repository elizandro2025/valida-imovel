import React, { useMemo } from 'react';
import { ProjectData, ConsolidatedIssue, polygonParams } from '@/services/projectConferenceService';
import { geodesyService } from '@/services/geodesyService';
import { PROCEDURE_CHECKLISTS } from '@/services/projectChecklists';
import { WorkspaceTab } from './ProjectConferenceWorkspace';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Compass,
  Users,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Wand2,
  Layers,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExecutiveCockpitProps {
  data: ProjectData;
  onNavigateTab: (tab: WorkspaceTab) => void;
  onLoadSample: () => void;
  allIssues: ConsolidatedIssue[];
  opinion: string;
}

export const ExecutiveCockpit: React.FC<ExecutiveCockpitProps> = ({
  data,
  onNavigateTab,
  onLoadSample,
  allIssues,
  opinion,
}) => {
  // Cálculo de Gauss reativo para os KPIs
  const polyResult = useMemo(() => {
    const { vertices } = geodesyService.parseVertices(
      data.polygon.rawCoords,
      data.polygon.isGeo,
      data.polygon.order
    );
    return geodesyService.calculatePolygon(vertices, polygonParams(data.polygon), data.polygon.declaredSegments);
  }, [data.polygon]);

  // Contagens dos Checklists
  const activeChecklists = PROCEDURE_CHECKLISTS.filter((p) =>
    data.info.procedimentos.includes(p.key)
  );
  const totalQuestions = activeChecklists.reduce(
    (acc, p) => acc + p.items.length,
    0
  );

  const answeredQuestions = activeChecklists.reduce((acc, p) => {
    const answers = data.checklists[p.key] || {};
    const answeredInProc = p.items.filter(
      (item) => answers[item.id] && answers[item.id].status
    ).length;
    return acc + answeredInProc;
  }, 0);

  const criticalIssuesCount = allIssues.filter((i) => i.tipo === 'div').length;
  const pendingIssuesCount = allIssues.filter((i) => i.tipo !== 'div').length;

  const neighborsPendingSignature = data.neighbors.filter(
    (n) =>
      !n.assin ||
      n.assin.toLowerCase().includes('pendente') ||
      n.assin.toLowerCase().includes('ausente')
  ).length;

  return (
    <div className="space-y-4">
      {/* 1. Barra de Ação Rápida de Automação & IA */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-soft space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                Assistente de Conferência
              </span>
              <span className="text-xs text-muted-foreground">Leitura Rápida com IA</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
              Conferência Técnica de Projetos Imobiliários
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Arraste a planta, o memorial descritivo e as certidões. O sistema executa o cálculo de fechamento de medidas, validação de confrontantes e os requisitos das normas da Corregedoria.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <Button
              onClick={() => onNavigateTab('ia')}
              size="sm"
              className="gap-2 font-semibold"
            >
              <Wand2 className="w-4 h-4" />
              Executar com IA
            </Button>

            <Button
              onClick={onLoadSample}
              variant="outline"
              size="sm"
              className="gap-2"
              title="Abrir um projeto de exemplo, com dados fictícios"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Ver exemplo (dados fictícios)
            </Button>

            <Button
              onClick={() => onNavigateTab('parecer')}
              variant="ghost"
              size="sm"
              className="gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Ver Laudo
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Pipeline Stepper das 5 Fases Periciais */}
        <div className="pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] shrink-0">
              1
            </span>
            <span className="truncate">Documentos do Trabalho</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] shrink-0">
              2
            </span>
            <span className="truncate">Medidas e Áreas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] shrink-0">
              3
            </span>
            <span className="truncate">Planta × Memorial</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] shrink-0">
              4
            </span>
            <span className="truncate">Vizinhos e Divisas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] shrink-0">
              5
            </span>
            <span className="truncate">Requisitos da Lei</span>
          </div>
        </div>
      </div>

      {/* 2. Grid de 4 KPIs Executivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Parecer Global */}
        <div
          onClick={() => onNavigateTab('parecer')}
          className="cursor-pointer group bg-card hover:border-primary/40 border border-border rounded-2xl p-4 shadow-soft transition-all duration-200"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Diagnóstico do Trabalho
            </span>
            <div
              className={`p-1.5 rounded-xl ${
                opinion === 'DOCUMENTAÇÃO COMPATÍVEL'
                  ? 'bg-success/10 text-success'
                  : opinion === 'DOCUMENTAÇÃO COM DIVERGÊNCIAS'
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-warning/10 text-warning'
              }`}
            >
              {opinion === 'DOCUMENTAÇÃO COMPATÍVEL' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : opinion === 'DOCUMENTAÇÃO COM DIVERGÊNCIAS' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <FileCheck2 className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {opinion}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                criticalIssuesCount > 0 ? 'bg-destructive' : 'bg-success'
              }`}
            />
            <span className="truncate">
              {criticalIssuesCount > 0
                ? `${criticalIssuesCount} divergência(s) encontrada(s)`
                : 'Nenhuma pendência impeditiva'}
            </span>
          </p>
        </div>

        {/* KPI 2: Geometria de Gauss */}
        <div
          onClick={() => onNavigateTab('poligonal')}
          className="cursor-pointer group bg-card hover:border-primary/40 border border-border rounded-2xl p-4 shadow-soft transition-all duration-200"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Conferência de Medidas e Áreas
            </span>
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-semibold text-foreground font-mono group-hover:text-primary transition-colors">
            {polyResult.vertices.length >= 3
              ? `${polyResult.areaM2.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} m²`
              : 'Não calculada'}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                polyResult.vertices.length >= 3 ? 'bg-primary' : 'bg-warning'
              }`}
            />
            <span className="truncate">
              {polyResult.vertices.length >= 3
                ? `${polyResult.vertices.length} vértices apurados`
                : 'Aguardando coordenadas'}
            </span>
          </p>
        </div>

        {/* KPI 3: Confrontantes */}
        <div
          onClick={() => onNavigateTab('confrontantes')}
          className="cursor-pointer group bg-card hover:border-primary/40 border border-border rounded-2xl p-4 shadow-soft transition-all duration-200"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Vizinhos e Divisas Limítrofes
            </span>
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {data.neighbors.length > 0
              ? `${data.neighbors.length} vizinhos mapeados`
              : 'Nenhum vizinho cadastrado'}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                neighborsPendingSignature > 0 ? 'bg-warning' : 'bg-success'
              }`}
            />
            <span className="truncate">
              {neighborsPendingSignature > 0
                ? `${neighborsPendingSignature} pendência(s) de assinatura`
                : 'Anuências regulares'}
            </span>
          </p>
        </div>

        {/* KPI 4: Checklists Requisitos */}
        <div
          onClick={() => onNavigateTab('checklists')}
          className="cursor-pointer group bg-card hover:border-primary/40 border border-border rounded-2xl p-4 shadow-soft transition-all duration-200"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Requisitos da Lei e Cartório
            </span>
            <div className="p-1.5 rounded-xl bg-success/10 text-success">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {totalQuestions > 0
              ? `${answeredQuestions} de ${totalQuestions} conferidos`
              : 'Nenhum rito selecionado'}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                answeredQuestions === totalQuestions && totalQuestions > 0
                  ? 'bg-success'
                  : 'bg-warning'
              }`}
            />
            <span className="truncate">
              {activeChecklists.length} procedimento(s) ativo(s)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

