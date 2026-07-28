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
    title: 'Diagnóstico & Score de Risco Registral (0-100)',
    badge: 'Passo 1 de 6 • Módulo 12',
    icon: ShieldCheck,
    tabValue: 'parecer',
    description: 'A IA Registrária faz a varredura nos 12 Módulos e gera a Nota de Risco do imóvel (0 a 100). Imóveis com score baixo (<20) possuem situação juridicamente segura.',
    tip: '💡 Dica: Veja o parecer em palavras simples, formatado especialmente para leigos e Due Diligence.'
  },
  {
    target: 'step-2',
    title: 'Dados Cartorários, Áreas & Georreferenciamento (SIGEF/CAR)',
    badge: 'Passo 2 de 6 • Módulos 1, 2 e 3',
    icon: Building2,
    tabValue: 'imovel',
    description: 'Nesta seção você confere o número da matrícula, comarca, livro, folha, área total (hectares e m²), confrontações e homologação no INCRA/SIGEF.',
    tip: '💡 Dica: O código do CAR e a certificação georreferenciada SIRGAS 2000 são identificados automaticamente.'
  },
  {
    target: 'step-3',
    title: 'Proprietários Atuais & Cadeia Dominial Histórica',
    badge: 'Passo 3 de 6 • Módulos 7 e 8',
    icon: Users,
    tabValue: 'proprietarios',
    description: 'Veja os proprietários atuais com qualificação completa (CPF/CNPJ mascarados por LGPD) e a linha do tempo cronológica das transmissões (R-1 ao R-N).',
    tip: '💡 Dica: A cadeia dominial ajuda a identificar fraudes em escrituras ou partilhas do passado.'
  },
  {
    target: 'step-4',
    title: 'Ônus Reais, Penhoras & Restrições Judiciais (CNIB)',
    badge: 'Passo 4 de 6 • Módulos 9, 10 e 11',
    icon: AlertTriangle,
    tabValue: 'onus',
    description: 'A auditoria localiza imediatamente alienações fiduciárias, hipotecas bancárias, penhoras judiciais, indisponividades CNIB e usufrutos averbados.',
    tip: '💡 Dica: Imóveis com "✓ Nada Consta" possuem certidão negativa comprovada na matrícula.'
  },
  {
    target: 'step-5',
    title: 'Assistente Copiloto de IA Registrária',
    badge: 'Passo 5 de 6 • IA Interativa',
    icon: Bot,
    tabValue: 'perfil',
    description: 'Utilize o chat de IA no canto inferior direito para tirar dúvidas sobre a matrícula em tempo real. A IA cita os números exatos dos atos da certidão (R-1, AV-4, etc).',
    tip: '💡 Dica: Teste perguntar: "Qual a área total do imóvel?" ou "Quem são os proprietários atuais?".'
  },
  {
    target: 'step-6',
    title: 'Exportação de Dossiê Executivo em PDF & Impressão',
    badge: 'Passo 6 de 6 • Dossiê PDF',
    icon: Download,
    tabValue: 'parecer',
    description: 'Baixe um Dossiê em PDF pronto para enviar a bancos, compradores, investidores ou anexar ao processo de Due Diligence.',
    tip: '💡 Dica: O PDF inclui carimbo digital registral e matriz de risco visual.'
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
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none animate-fade-in-up">
      <Card className="max-w-2xl w-full bg-slate-950/95 border-2 border-emerald-500/80 text-white p-5 sm:p-6 rounded-3xl shadow-2xl backdrop-blur-xl pointer-events-auto relative space-y-4">
        
        {/* Glow Background Indicator */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs font-black px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> {step.badge}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8 p-0 rounded-xl"
            title="Pular Tour Guiado"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Step Body */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
            <StepIcon className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
              {step.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {step.description}
            </p>
            <div className="pt-1">
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg inline-block">
                {step.tip}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Navigation Controls */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-[140px]">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-mono font-bold">{progressPercent}%</span>
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-bold h-9 px-3"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Anterior
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-9 px-4 rounded-xl shadow-lg shadow-emerald-500/20 gap-1.5"
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
