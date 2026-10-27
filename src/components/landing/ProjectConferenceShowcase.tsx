import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, FileText, Ruler, Compass, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ProjectConferenceShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'confronto' | 'fechamento' | 'confrontantes'>('confronto');

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
            Conferência de Projeto Rural: Desmembramento e Retificação (Piracicaba/SP)
          </span>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex p-1 bg-background/80 rounded-xl border border-border text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('confronto')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'confronto' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Planta × Memorial
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fechamento')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'fechamento' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Fechamento de Gauss
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('confrontantes')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'confrontantes' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Confrontantes
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-7">
        {activeTab === 'confronto' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-primary" />
                  Confronto de Medidas: Sítio Bela Vista — 48,50 ha (Piracicaba/SP)
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Conferência automatizada entre a Planta Georreferenciada e o Memorial Descritivo (SIRGAS 2000).
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/15 text-warning border border-warning/30">
                1 Divergência Detectada
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Segmento M-01 → M-02</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                </div>
                <p className="text-xs text-foreground/90 font-mono">440,55 m · Az 89°12&apos;15&quot;</p>
                <p className="text-[11px] text-success font-medium">Frente Estrada PIR-040: 100% compatível</p>
              </div>

              <div className="bg-warning/10 border border-warning/40 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-warning">
                  <span className="font-semibold text-foreground">Segmento M-02 → M-03</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                </div>
                <p className="text-xs text-foreground/90 font-mono">Planta: 444,28 m · Mem: 444,68 m</p>
                <p className="text-[11px] text-warning font-semibold">Divergência de 0,40 m (40 cm)</p>
              </div>

              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Segmento M-03 → M-04</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                </div>
                <p className="text-xs text-foreground/90 font-mono">313,40 m · Az 358°40&apos;10&quot;</p>
                <p className="text-[11px] text-success font-medium">Divisa Fazenda Morro Vermelho: OK</p>
              </div>
            </div>

            <div className="p-3 bg-secondary/50 rounded-xl border border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Divergência de 40 cm identificada antes do protocolo no 1º RI de Piracicaba/SP, evitando nota devolutiva.
              </span>
              <span className="text-primary font-semibold hidden sm:inline">Auditoria em 2 segundos</span>
            </div>
          </div>
        )}

        {activeTab === 'fechamento' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary" />
                  Fechamento Perimétrico de Gauss (Georreferenciamento Rural INCRA)
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Coordenadas UTM SIRGAS 2000 Fuso 23S conforme a 3ª Edição da NTGIR / INCRA e NSCGJ-SP.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/30">
                Polígono Fechado
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Perímetro Total</p>
                <p className="text-base font-bold text-foreground font-mono mt-1">2.840,50 m</p>
              </div>
              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Área Georreferenciada</p>
                <p className="text-base font-bold text-foreground font-mono mt-1">48,50 ha</p>
              </div>
              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Erro Linear (fs)</p>
                <p className="text-base font-bold text-success font-mono mt-1">0,004 m</p>
              </div>
              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Precisão Relativa</p>
                <p className="text-base font-bold text-success font-mono mt-1">1 : 46.125</p>
              </div>
            </div>

            <div className="p-3 bg-secondary/50 rounded-xl border border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Tolerância máxima permitida pelo INCRA para vértices rurais tipo M: 1 : 10.000. O imóvel atende com folga.
              </span>
              <span className="text-success font-semibold">Aprovado para Registro</span>
            </div>
          </div>
        )}

        {activeTab === 'confrontantes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Mapeamento de Confrontantes Rurais e Anuências (Piracicaba/SP)
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Controle de anuências e notificações conforme o Art. 213 da LRP e item 287 das NSCGJ-SP.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                4 Divisas Rurais
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Frente: Estrada Municipal PIR-040</p>
                  <p className="text-[11px] text-muted-foreground">Domínio Público Municipal (Dispensa anuência de vizinho)</p>
                </div>
                <span className="text-[11px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Regular</span>
              </div>

              <div className="bg-warning/10 border border-warning/40 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Leste: Fazenda Morro Vermelho — Dr. Roberto Alencar</p>
                  <p className="text-[11px] text-warning font-medium">Matrícula 42.180 · Falta anuência do cônjuge Sandra Helena</p>
                </div>
                <span className="text-[11px] font-semibold text-warning bg-warning/20 px-2 py-0.5 rounded-full">Outorga Pendente</span>
              </div>

              <div className="bg-warning/10 border border-warning/40 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Fundos: Córrego das Pedras / Fazenda Santa Helena</p>
                  <p className="text-[11px] text-warning font-medium">Matrícula 38.912 · Espólio de Waldir Penteado (Notificação RI)</p>
                </div>
                <span className="text-[11px] font-semibold text-warning bg-warning/20 px-2 py-0.5 rounded-full">Notificação RI</span>
              </div>

              <div className="bg-secondary/70 border border-border/80 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Oeste: Sítio São Pedro — Carlos Eduardo Neves</p>
                  <p className="text-[11px] text-muted-foreground">Matrícula 41.950 · Termo assinado com firma reconhecida</p>
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
          Minuta do Laudo Pericial de Desmembramento Rural pronta para o Responsável Técnico (Word e PDF).
        </span>
        <Link to="/app?sample=desdobro">
          <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 bg-background">
            Abrir exemplo de Piracicaba/SP <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
