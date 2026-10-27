import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, ArrowRight, ArrowLeft, CheckCircle2, X, ShieldCheck,
  Building2, Users, AlertTriangle, Bot, Download
} from 'lucide-react';

export interface TourStep {
  target: string;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  tip: string;
  tabValue?: string;
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tabValue: string) => void;
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: 'step-1',
    title: 'Parecer e nota de risco (0 a 100)',
    badge: 'Passo 1 de 6 • Parecer',
    icon: ShieldCheck,
    tabValue: 'parecer',
    description: 'A IA lê os 12 módulos e dá uma nota de risco de 0 a 100. Nota baixa indica que não foram encontrados ônus ativos; os "pontos para conferir" mostram o que a leitura não conseguiu confirmar.',
    tip: '💡 Dica: cada risco traz o trecho da matrícula que o embasa.'
  },
  {
    target: 'step-2',
    title: 'Dados Cartorários, Áreas & Georreferenciamento (SIGEF/CAR)',
    badge: 'Passo 2 de 6 • Módulos 1, 2 e 3',
    icon: Building2,
    tabValue: 'imovel',
    description: 'Nesta seção você confere o número da matrícula, comarca, livro, folha, área total (hectares e m²), confrontações e homologação no INCRA/SIGEF.',
    tip: '💡 Dica: clique em qualquer campo para copiá-lo.'
  },
  {
    target: 'step-3',
    title: 'Proprietários Atuais & Cadeia Dominial Histórica',
    badge: 'Passo 3 de 6 • Módulos 7 e 8',
    icon: Users,
    tabValue: 'proprietarios',
    description: 'Veja os proprietários atuais com a qualificação que consta na matrícula e a linha do tempo das transmissões (R-1 em diante). CPFs que não aparecem no texto lido são sinalizados.',
    tip: '💡 Dica: A cadeia dominial ajuda a identificar fraudes em escrituras ou partilhas do passado.'
  },
  {
    target: 'step-4',
    title: 'Ônus reais, penhoras e indisponibilidades averbadas',
    badge: 'Passo 4 de 6 • Módulos 9, 10 e 11',
    icon: AlertTriangle,
    tabValue: 'onus',
    description: 'Hipotecas, alienações fiduciárias, penhoras e indisponibilidades encontradas no texto, com o status de cada uma: ativo, cancelado (com o ato que cancelou) ou "conferir".',
    tip: '💡 Dica: a leitura vale para o PDF enviado. Antes de fechar negócio, peça a certidão de ônus atualizada.'
  },
  {
    target: 'step-5',
    title: 'A mesma matrícula, para cada perfil',
    badge: 'Passo 5 de 6 • Visão por perfil',
    icon: Bot,
    tabValue: 'perfil',
    description: 'Explicações para comprador, corretor, banco, engenheiro e advogado. Assinantes também podem tirar dúvidas no botão "Perguntar à IA", no canto inferior direito.',
    tip: '💡 Dica: pergunte, por exemplo, "Quem precisa assinar a venda?".'
  },
  {
    target: 'step-6',
    title: 'Relatório em PDF',
    badge: 'Passo 6 de 6 • PDF',
    icon: Download,
    tabValue: 'parecer',
    description: 'Baixe o relatório em PDF para compartilhar com clientes, compradores ou o seu advogado.',
    tip: '💡 Dica: o PDF traz um código do relatório que muda se qualquer dado for alterado.'
  }
];

export const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose, onSelectTab }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = TOUR_STEPS[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / TOUR_STEPS.length) * 100);

  useEffect(() => {
    if (!isOpen) return;

    if (step.tabValue && onSelectTab) {
      onSelectTab(step.tabValue);
    }

    // Auto-scroll suave para o elemento alvo do tour
    setTimeout(() => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  }, [currentStepIndex, isOpen, step, onSelectTab]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const StepIcon = step.icon;

  return (
    <div className="fixed inset-x-0 bottom-4 sm:bottom-6 z-[60] flex justify-center px-3 sm:px-4 pointer-events-none animate-fade-in-up safe-area-bottom">
      <Card className="max-w-2xl w-full bg-background/95 border-2 border-primary/30 text-foreground p-4 sm:p-6 rounded-3xl shadow-medium backdrop-blur-xl pointer-events-auto relative space-y-4">
        
        {/* Glow Background Indicator */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none hidden" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-xs font-semibold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-1 inline text-primary" /> {step.badge}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted w-9 p-0"
            title="Pular Tour Guiado"
            aria-label="Pular o tour guiado"
          >
            <X className="w-4.5 h-4.5" />
          </Button>
        </div>

        {/* Step Body */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl text-white flex items-center justify-center shadow-medium shrink-0 font-semibold bg-primary">
            <StepIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-sm sm:text-lg font-semibold text-foreground leading-snug">
              {step.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              {step.description}
            </p>
            <div className="pt-1">
              <span className="text-xs sm:text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg inline-block">
                {step.tip}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Navigation Controls */}
        <div className="pt-2 flex items-center justify-between border-t border-border gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-[120px] sm:max-w-[140px]">
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 bg-primary"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono font-semibold">{progressPercent}%</span>
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-semibold h-10 px-3.5 touch-target"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Anterior
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-primary hover:bg-primary text-white font-semibold text-xs h-10 px-4 sm:px-5 gap-1.5 touch-target"
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? (
                <>Concluir Tour <CheckCircle2 className="w-4 h-4" /></>
              ) : (
                <>Próximo <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>

      </Card>
    </div>
  );
};
