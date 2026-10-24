import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Brain, ShieldCheck, Loader2, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalysisProgressProps {
  progress: number;
  currentStep: string;
  steps?: string[];
}

// Mesmas etapas de src/services/aiService.ts (15% leitura, 45% análise, 85% conferência)
const DEFAULT_STEPS = [
  'Leitura do PDF por IA (OCR)',
  'Extração dos dados da matrícula',
  'Parecer e nota de risco',
  'Conferência com o texto do documento'
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  progress,
  currentStep,
  steps = DEFAULT_STEPS
}) => {
  const safeSteps = Array.isArray(steps) && steps.length > 0 ? steps : DEFAULT_STEPS;

  return (
    <Card className="max-w-3xl mx-auto border-primary/30 bg-card shadow-medium rounded-3xl overflow-hidden animate-fade-in text-foreground">
      {/* Accent line top */}
      <div className="h-2 bg-primary" />
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner border border-primary/20">
              <Brain className="w-6 h-6 animate-pulse text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  Analisando a matrícula
                </h3>
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-tight mt-0.5">
                Costuma levar de 1 a 4 minutos. Você pode deixar esta aba aberta.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
            <div className="text-2xl sm:text-3xl font-semibold text-primary tabular-nums">
              {Math.round(progress)}%
            </div>
            <Badge className="bg-background text-primary border border-primary/30 text-xs font-semibold gap-1 px-2.5 py-0.5 sm:mt-1 rounded-full shrink-0">
              <Timer className="w-3 h-3 text-primary" /> 1 a 4 min
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3.5 bg-background rounded-full" />
          <div className="flex flex-col sm:flex-row justify-between text-xs text-muted-foreground font-semibold gap-1 pt-1">
            <span className="flex items-center gap-1.5 text-primary">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
              <span className="truncate">{currentStep || 'Processando...'}</span>
            </span>
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
                    ? 'bg-primary/10 border-primary/30 text-primary shadow-xs' 
                    : isCurrent 
                      ? 'bg-warning/10 border-warning/30 text-warning shadow-soft scale-[1.01]' 
                      : 'bg-background/50 border-border text-muted-foreground'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-warning animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
                )}
                <span className="break-words leading-tight flex-1 min-w-0">{step}</span>
              </div>
            );
          })}
        </div>

        {/* Informative notice */}
        <div className="p-3.5 bg-background text-foreground border border-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span className="leading-tight">Ao final, CPFs, números de atos e trechos citados são conferidos no texto lido do PDF.</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};