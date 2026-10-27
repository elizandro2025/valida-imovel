import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, FileText, Ruler, Compass, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Vitrine da conferência de projetos na página inicial. Mostra o projeto de exemplo (dados fictícios, ver
// src/services/projectSampleData.ts) com os mesmos números que o exemplo abre no app.
export const ProjectConferenceShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'confronto' | 'fechamento' | 'confrontantes'>('confronto');

  const tabClass = (tab: typeof activeTab) =>
    `px-3 py-1 rounded-lg transition-all ${
      activeTab === tab ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <div className="bg-card rounded-[28px] shadow-hard ring-1 ring-border/80 overflow-hidden text-left max-w-5xl mx-auto border border-border">
      {/* Header macOS-style */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-border bg-secondary/60">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" aria-hidden="true" />
          <span className="ml-2 text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Exemplo com dados fictícios: desmembramento e retificação de gleba rural
          </span>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex p-1 bg-background/80 rounded-xl border border-border text-xs font-medium">
          <button type="button" aria-pressed={activeTab === 'confronto'} onClick={() => setActiveTab('confronto')} className={tabClass('confronto')}>
            Planta × Memorial
          </button>
          <button type="button" aria-pressed={activeTab === 'fechamento'} onClick={() => setActiveTab('fechamento')} className={tabClass('fechamento')}>
            Área e perímetro
          </button>
          <button type="button" aria-pressed={activeTab === 'confrontantes'} onClick={() => setActiveTab('confrontantes')} className={tabClass('confrontantes')}>
            Confrontantes
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-7">
        {activeTab === 'confronto' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-primary" />
                  Confronto de medidas: Sítio Bela Vista, 38,93 ha
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cada lado da planta comparado com o memorial descritivo e com as coordenadas (UTM SIRGAS 2000).
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/15 text-warning border border-warning/30 shrink-0">
                1 divergência
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Lado M-01 → M-02</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                </div>
                <p className="text-xs text-foreground/90 font-mono">440,55 m</p>
                <p className="text-[11px] text-success font-medium">Planta e memorial iguais</p>
              </div>

              <div className="bg-warning/10 border border-warning/40 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-warning">
                  <span className="font-semibold text-foreground">Lado M-02 → M-03</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                </div>
                <p className="text-xs text-foreground/90 font-mono">Planta: 441,37 m · Memorial: 441,77 m</p>
                <p className="text-[11px] text-warning font-semibold">Diferença de 0,40 m (40 cm)</p>
              </div>

              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Lado M-03 → M-04</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                </div>
                <p className="text-xs text-foreground/90 font-mono">313,68 m</p>
                <p className="text-[11px] text-success font-medium">Planta e memorial iguais</p>
              </div>
            </div>

            <div className="p-3 bg-secondary/50 rounded-xl border border-border text-xs text-muted-foreground">
              A diferença de 40 cm aparece antes do protocolo, com a indicação do documento a corrigir (o memorial).
            </div>
          </div>
        )}

        {activeTab === 'fechamento' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary" />
                  Área e perímetro calculados pelas coordenadas
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Seis vértices em UTM SIRGAS 2000, fuso 23S, comparados com os valores declarados.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/30 shrink-0">
                Área confere
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Vértices</p>
                <p className="text-base font-bold text-foreground font-mono mt-1">6</p>
              </div>
              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Área calculada</p>
                <p className="text-base font-bold text-foreground font-mono mt-1">38,9313 ha</p>
              </div>
              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Perímetro calculado</p>
                <p className="text-base font-bold text-foreground font-mono mt-1">2.349,58 m</p>
              </div>
              <div className="bg-warning/10 border border-warning/40 rounded-2xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Perímetro no memorial</p>
                <p className="text-base font-bold text-warning font-mono mt-1">2.349,98 m</p>
              </div>
            </div>

            <div className="p-3 bg-secondary/50 rounded-xl border border-border text-xs text-muted-foreground">
              A área declarada na planta confere com a calculada; o perímetro do memorial tem os mesmos 40 cm a mais.
            </div>
          </div>
        )}

        {activeTab === 'confrontantes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Confrontantes e anuências
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Quem assinou, quem falta e quando cabe notificação pelo Registro de Imóveis (art. 213 da Lei 6.015/73).
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
                4 divisas
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">Frente: Estrada Municipal PIR-040</p>
                  <p className="text-[11px] text-muted-foreground">Via pública</p>
                </div>
                <span className="text-[11px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Regular</span>
              </div>

              <div className="bg-warning/10 border border-warning/40 rounded-2xl p-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">Leste: Fazenda Morro Vermelho</p>
                  <p className="text-[11px] text-warning font-medium">Matrícula 42.180 · Falta a anuência do cônjuge</p>
                </div>
                <span className="text-[11px] font-semibold text-warning bg-warning/20 px-2 py-0.5 rounded-full">Pendente</span>
              </div>

              <div className="bg-warning/10 border border-warning/40 rounded-2xl p-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">Fundos: Córrego das Pedras / Fazenda Santa Helena</p>
                  <p className="text-[11px] text-warning font-medium">Matrícula 38.912 · Espólio: pedir notificação</p>
                </div>
                <span className="text-[11px] font-semibold text-warning bg-warning/20 px-2 py-0.5 rounded-full">Notificação</span>
              </div>

              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">Oeste: Sítio São Pedro</p>
                  <p className="text-[11px] text-muted-foreground">Matrícula 41.950 · Anuência com firma reconhecida</p>
                </div>
                <span className="text-[11px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Anuência OK</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-5 py-3.5 bg-secondary/80 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-primary" />
          Relatório de conferência em Word ou impressão, para o responsável técnico revisar.
        </span>
        <Button asChild size="sm" variant="outline" className="text-xs h-8 gap-1.5 bg-background">
          <Link to="/app?sample=desdobro">
            Abrir o exemplo (dados fictícios) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
