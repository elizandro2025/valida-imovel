import React from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FileSearch,
  Compass,
  Scissors,
  Layers,
  Home,
  Combine,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
  FileCheck2,
  CheckCircle2,
  Zap,
  Upload,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ProcedureType =
  | 'matricula'
  | 'desdobro'
  | 'retificacao'
  | 'unificacao'
  | 'estremacao'
  | 'divisao'
  | 'reurb';

interface SavedProjectSummary {
  nome: string;
  matricula: string;
  cartorio: string;
  data: string;
  issuesCount: number;
}

interface ProcedureLauncherHubProps {
  onSelectProcedure: (proc: ProcedureType) => void;
  onLoadSampleProject: () => void;
  onLoadSampleMatricula: (type: 'risk' | 'safe') => void;
  savedProject?: SavedProjectSummary | null;
  onOpenSavedProject?: () => void;
  onDropFile?: (file: File) => void;
  userName?: string;
}

export const ProcedureLauncherHub: React.FC<ProcedureLauncherHubProps> = ({
  onSelectProcedure,
  onLoadSampleProject,
  onLoadSampleMatricula,
  savedProject,
  onOpenSavedProject,
  onDropFile,
  userName,
}) => {
  const [showAssistant, setShowAssistant] = React.useState(false);
  // Os cartões grandes são <div> clicáveis: Enter e espaço também abrem o procedimento (acesso pelo teclado)
  const cardProps = (proc: ProcedureType) => ({
    role: 'button' as const,
    tabIndex: 0,
    onClick: () => onSelectProcedure(proc),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelectProcedure(proc);
      }
    },
  });
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted: File[]) => {
      if (accepted.length > 0 && onDropFile) {
        onDropFile(accepted[0]);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/plain': ['.txt', '.csv', '.tsv', '.kml', '.dxf', '.xml'],
    },
    multiple: false,
  });
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 animate-fade-in">
      {/* 1. Header Hero com Pergunta Central de Produto */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Matrículas e projetos imobiliários</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
          {userName ? `Olá, ${userName.split(' ')[0]}. ` : ''}O que você precisa fazer?
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Escolha uma opção abaixo. Em cada etapa o sistema mostra o que fazer a seguir, até o relatório final.
        </p>
      </div>

      {/* 1.1 Dropzone Inteligente de Identificação de Procedimento */}
      <div
        {...getRootProps()}
        className={`max-w-3xl mx-auto border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 select-none ${
          isDragActive
            ? 'border-primary bg-primary/10 shadow-md ring-4 ring-primary/20 scale-[1.01]'
            : 'border-border/80 hover:border-primary/50 hover:bg-muted/30 bg-card/40 shadow-xs'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
            <Upload className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              {isDragActive
                ? 'Solte o arquivo aqui...'
                : 'Não sabe por onde começar? Envie seu documento aqui'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Pelo nome do arquivo, o sistema escolhe o caminho: a certidão da matrícula abre a análise de matrícula; planta,
              memorial e arquivos de coordenadas (KML, DXF, TXT) abrem a conferência de projetos, já com o arquivo na lista.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-8 font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5 pointer-events-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Escolher arquivo</span>
          </Button>
        </div>
      </div>

      {/* 1.2 Assistente de Decisão Rápida para Iniciantes */}
      <div className="max-w-3xl mx-auto">
        {!showAssistant ? (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowAssistant(true)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-1.5 px-3.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Não sabe qual escolher? Veja um guia rápido</span>
            </button>
          </div>
        ) : (
          <div className="bg-card border border-primary/30 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wide">
                <HelpCircle className="w-4 h-4" />
                <span>O que você tem em mãos e o que deseja fazer?</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAssistant(false)}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-0.5 rounded hover:bg-muted"
              >
                Fechar ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSelectProcedure('matricula')}
                className="p-3 rounded-xl border border-border/80 hover:border-primary/50 hover:bg-muted/40 transition-all text-left space-y-1 group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-foreground group-hover:text-primary">
                  <FileSearch className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Analisar Certidão de Matrícula</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  "Tenho o PDF da certidão e quero saber se o imóvel tem dívidas, penhoras, usufruto ou problemas para compra/venda."
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectProcedure('desdobro')}
                className="p-3 rounded-xl border border-border/80 hover:border-primary/50 hover:bg-muted/40 transition-all text-left space-y-1 group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-foreground group-hover:text-primary">
                  <Scissors className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Dividir ou Fracionar Terreno (Desdobro)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  "Tenho a planta e memorial para desmembrar um lote urbano em dois ou mais terrenos com frente para rua oficial."
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectProcedure('retificacao')}
                className="p-3 rounded-xl border border-border/80 hover:border-primary/50 hover:bg-muted/40 transition-all text-left space-y-1 group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-foreground group-hover:text-primary">
                  <Compass className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Corrigir Medidas e Área (Retificação)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  "As medidas reais do terreno não batem com o que está escrito na matrícula e preciso adequar consensual no cartório."
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectProcedure('unificacao')}
                className="p-3 rounded-xl border border-border/80 hover:border-primary/50 hover:bg-muted/40 transition-all text-left space-y-1 group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-foreground group-hover:text-primary">
                  <Combine className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Juntar Terrenos em Um Só (Unificação)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  "Tenho dois ou mais lotes contíguos e quero juntar tudo em uma única matrícula no cartório de imóveis."
                </p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Dossiê em Andamento (Se houver projeto salvo para retomar) */}
      {savedProject && onOpenSavedProject && (
        <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-background border border-primary/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-primary/15 text-primary shrink-0 mt-0.5">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Trabalho em Andamento
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" /> {savedProject.data || 'Recente'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground truncate">
                {savedProject.nome || 'Projeto Pericial Sem Título'}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {savedProject.cartorio || 'Cartório de Registro de Imóveis'} · Matrícula nº {savedProject.matricula || 'S/N'}
                {savedProject.issuesCount > 0 && (
                  <span className="ml-2 font-semibold text-amber-600 dark:text-amber-400">
                    ({savedProject.issuesCount} item(ns) a revisar)
                  </span>
                )}
              </p>
            </div>
          </div>

          <Button
            onClick={onOpenSavedProject}
            size="sm"
            className="shrink-0 gap-1.5 font-semibold text-xs shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4"
          >
            <span>Continuar projeto</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* 3. Os 3 Procedimentos Principais (Cards de Alta Prioridade) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Procedimento 1: Auditoria de Matrícula */}
        <div
          {...cardProps('matricula')}
          className="group relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-card hover:bg-card/90 border border-border/80 hover:border-primary/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-5"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <FileSearch className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Mais Utilizado
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                Analisar a matrícula de um imóvel
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Envie a certidão em PDF e veja quem são os donos, se há dívidas, penhoras ou bloqueios e o nível de risco, antes de comprar, vender ou financiar.
              </p>
            </div>

            <div className="pt-2 border-t border-border/40 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Nota de risco e resumo em palavras simples</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Pergunte à IA sobre qualquer ponto da certidão</span>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            className="w-full gap-2 font-semibold text-xs h-9 bg-primary group-hover:bg-primary/95 text-primary-foreground shadow-xs"
          >
            <span>Analisar matrícula</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>

        {/* Procedimento 2: Conferência de Desdobro */}
        <div
          {...cardProps('desdobro')}
          className="group relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-card hover:bg-card/90 border border-border/80 hover:border-indigo-500/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-5"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Scissors className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Dividir lote
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Desdobro de lote
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Dividir um lote urbano em dois ou mais: confere medidas, documentos e regras do município antes de protocolar (Lei 6.766/79).
              </p>
            </div>

            <div className="pt-2 border-t border-border/40 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Tamanho mínimo do lote e da frente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Planta comparada com o memorial descritivo</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 font-semibold text-xs h-9 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 group-hover:border-indigo-500 shadow-2xs"
          >
            <span>Conferir desdobro</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>

        {/* Procedimento 3: Conferência de Retificação de Área */}
        <div
          {...cardProps('retificacao')}
          className="group relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-card hover:bg-card/90 border border-border/80 hover:border-emerald-500/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-5"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Corrigir área
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Retificação de área
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Corrigir medidas ou a área registrada na matrícula: confere planta, memorial, cálculos e as assinaturas dos vizinhos (art. 213 da Lei 6.015/73).
              </p>
            </div>

            <div className="pt-2 border-t border-border/40 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Área e perímetro calculados pelas coordenadas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Assinaturas dos vizinhos e dos cônjuges (anuências)</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 font-semibold text-xs h-9 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 group-hover:border-emerald-500 shadow-2xs"
          >
            <span>Conferir retificação</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>

      {/* 4. Outros Procedimentos Especiais (Barra de Acesso Direto de 1 Clique) */}
      <div className="bg-card border border-border/70 rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div>
            <span className="text-xs font-bold text-foreground block">
              Outros procedimentos
            </span>
            <p className="text-[11px] text-muted-foreground">
              Também com checklist próprio e conferência dos documentos:
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            Checklist próprio
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => onSelectProcedure('unificacao')}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-muted/40 transition-all text-left text-xs group"
          >
            <Combine className="w-4 h-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <span className="font-semibold text-foreground block truncate">Unificação de Lotes</span>
              <span className="text-[10px] text-muted-foreground block truncate">Art. 234 da LRP</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectProcedure('estremacao')}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-muted/40 transition-all text-left text-xs group"
          >
            <Layers className="w-4 h-4 text-indigo-500 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <span className="font-semibold text-foreground block truncate">Estremação de Fração</span>
              <span className="text-[10px] text-muted-foreground block truncate">Prov. CNJ nº 149/2023</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectProcedure('divisao')}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-muted/40 transition-all text-left text-xs group"
          >
            <Zap className="w-4 h-4 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <span className="font-semibold text-foreground block truncate">Divisão Consensual</span>
              <span className="text-[10px] text-muted-foreground block truncate">Art. 1.320 CC</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectProcedure('reurb')}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-muted/40 transition-all text-left text-xs group"
          >
            <Home className="w-4 h-4 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <span className="font-semibold text-foreground block truncate">REURB-S (Social)</span>
              <span className="text-[10px] text-muted-foreground block truncate">Lei Federal 13.465</span>
            </div>
          </button>
        </div>
      </div>

      {/* 5. Ações Rápidas de Simulação e Estudo (Casos Prontos de São Paulo) */}
      <div className="border border-dashed border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Quer ver como funciona antes de usar?</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Abra um exemplo pronto, com dados fictícios. Não usa a IA nem o seu limite diário.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadSampleProject}
            className="text-xs h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary font-semibold shadow-2xs"
            title="Abrir um projeto de exemplo, com dados fictícios"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Ver exemplo de projeto</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onLoadSampleMatricula('risk')}
            className="text-xs h-8 gap-1.5 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold shadow-2xs"
            title="Carregar certidão com penhora e indisponibilidade"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Ver exemplo de matrícula</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
