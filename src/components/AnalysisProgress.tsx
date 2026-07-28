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
    <Card className="max-w-3xl mx-auto border-emerald-200/80 bg-white shadow-xl rounded-3xl overflow-hidden animate-fade-in">
      {/* Accent line top */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 h-2" />
      <CardContent className="p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  Analisando Matrícula em Tempo Real
                </h3>
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 text-[10px] font-bold">
                  Motor IA Ativo
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Auditoria registrária completa dos 12 módulos notariais...
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="text-3xl font-black text-emerald-600 tabular-nums">
              {Math.round(progress)}%
            </div>
            <Badge className="bg-slate-900 text-emerald-400 text-[10px] font-extrabold gap-1 px-2.5 py-0.5 mt-1 rounded-full">
              <Timer className="w-3 h-3 text-emerald-400 animate-spin" /> ~{secondsLeft}s restantes
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3.5 bg-slate-100 rounded-full" />
          <div className="flex justify-between text-xs text-slate-600 font-semibold pt-1">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              {currentStep || 'Processando extração...'}
            </span>
            <span className="text-slate-400">Leitura Registrária Conectada</span>
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
                  flex items-center gap-3 p-3 rounded-2xl border text-xs font-semibold transition-all duration-300
                  ${isCompleted 
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 shadow-xs' 
                    : isCurrent 
                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-md scale-[1.01]' 
                      : 'bg-slate-50/50 border-slate-200/60 text-slate-400'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                )}
                <span className="truncate">{step}</span>
              </div>
            );
          })}
        </div>

        {/* Informative notice */}
        <div className="p-3.5 bg-slate-900 text-white border border-slate-800 rounded-2xl flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Mapeando titularidade, cadeia dominial, gravames e indisponibilidades (CNIB).</span>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10 text-[10px] hidden sm:inline-flex">
            Sem Erros
          </Badge>
        </div>

      </CardContent>
    </Card>
  );
};