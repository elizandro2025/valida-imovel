import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, FileText, Brain, ShieldCheck, Sparkles, Loader2, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalysisProgressProps {
  progress: number;
  currentStep: string;
  steps?: string[];
}

const DEFAULT_STEPS = [
  'Leitura e Extração de Texto da Certidão (OCR)',
  'Identificação de Cartório, Livro e Matrícula',
  'Varredura dos 12 Módulos Registrais (Titularidade, CNIB, Penhoras)',
  'Compilação do Parecer Técnico de IA & Due Diligence'
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  progress,
  currentStep,
  steps = DEFAULT_STEPS
}) => {
  const safeSteps = Array.isArray(steps) && steps.length > 0 ? steps : DEFAULT_STEPS;
  // Tempo estimado em segundos com base no progresso atual
  const secondsLeft = Math.max(1, Math.ceil((100 - progress) / 12));

  return (
    <Card className="max-w-3xl mx-auto border-blue-500/40 bg-slate-900 shadow-2xl rounded-3xl overflow-hidden animate-fade-in text-white">
      {/* Accent line top */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 h-2" />
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner border border-blue-500/20">
              <Brain className="w-6 h-6 animate-pulse text-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Analisando Matrícula em Tempo Real
                </h3>
                <Badge variant="outline" className="border-blue-500/40 text-cyan-400 bg-blue-500/10 text-[10px] font-bold shrink-0">
                  Motor IA Ativo
                </Badge>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-tight mt-0.5">
                Auditoria registrária completa dos 12 módulos notariais...
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 tabular-nums">
              {Math.round(progress)}%
            </div>
            <Badge className="bg-slate-950 text-cyan-400 border border-blue-500/30 text-[10px] font-extrabold gap-1 px-2.5 py-0.5 sm:mt-1 rounded-full shrink-0">
              <Timer className="w-3 h-3 text-cyan-400 animate-spin" /> ~{secondsLeft}s restantes
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3.5 bg-slate-950 rounded-full" />
          <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-400 font-semibold gap-1 pt-1">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
              <span className="truncate">{currentStep || 'Processando extração...'}</span>
            </span>
            <span className="text-slate-500 text-[11px] sm:text-xs">Leitura Registrária Conectada</span>
          </div>
        </div>

        {/* Steps Grid / List */}
        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          {safeSteps.map((step, index) => {
            const stepProgress = ((index + 1) / safeSteps.length) * 100;
            const isCompleted = progress >= stepProgress;
            const isCurrent = !isCompleted && progress >= stepProgress - (100 / safeSteps.length);

            return (
              <div
                key={index}
                className={`
                  flex items-center gap-3 p-3 rounded-2xl border text-xs font-semibold transition-all duration-300 min-w-0 w-full
                  ${isCompleted 
                    ? 'bg-blue-950/60 border-blue-500/40 text-cyan-300 shadow-xs' 
                    : isCurrent 
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-200 shadow-md scale-[1.01]' 
                      : 'bg-slate-950/50 border-slate-800 text-slate-500'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-700 shrink-0" />
                )}
                <span className="break-words leading-tight flex-1 min-w-0">{step}</span>
              </div>
            );
          })}
        </div>

        {/* Informative notice */}
        <div className="p-3.5 bg-slate-950 text-white border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="leading-tight">Mapeando titularidade, cadeia dominial, gravames e indisponividades (CNIB).</span>
          </div>
          <Badge variant="outline" className="border-blue-500/30 text-cyan-300 bg-blue-500/10 text-[10px] hidden sm:inline-flex shrink-0">
            Sem Erros
          </Badge>
        </div>

      </CardContent>
    </Card>
  );
};