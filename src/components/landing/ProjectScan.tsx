import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText } from 'lucide-react';
import { PolygonSketch, StatusChip, ToneIcon, WindowFrame } from './LandingPrimitives';
import type { Tone } from '@/content/landing';

// Demonstração do topo para a conferência de projetos: o projeto de exemplo (/app?sample=desdobro, dados fictícios)
// tem os documentos lidos, a poligonal traçada e as diferenças apontadas. Animação só em CSS, como o MatriculaScan.
const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as React.CSSProperties;

const DOCS = [
  { name: 'Planta topográfica', type: 'Planta' },
  { name: 'Memorial descritivo', type: 'Memorial' },
  { name: 'Matrícula 48.910', type: 'Matrícula' },
  { name: 'Matrículas dos vizinhos', type: 'Confrontantes' },
  { name: 'ART quitada', type: 'Resp. técnica' },
];

const FINDINGS: { at: number; tone: Tone; title: string; detail: string }[] = [
  { at: 1.6, tone: 'ok', title: 'Área confere: 38,9313 ha', detail: 'Calculada pelas 6 coordenadas' },
  { at: 2.1, tone: 'warn', title: 'Lado M-02 → M-03', detail: 'Planta 441,37 m · memorial 441,77 m' },
  { at: 2.6, tone: 'warn', title: 'Vizinho a leste', detail: 'Só Joaquim assinou; falta Maria Leste Fictícia' },
];

export const ProjectScan: React.FC = () => (
  <WindowFrame title="Sítio Bela Vista · retificação e desmembramento · exemplo com dados fictícios">
    <div className="grid md:grid-cols-[0.9fr_1fr_1.1fr]">
      {/* Documentos lidos */}
      <div className="p-5 sm:p-6 md:border-r border-border space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documentos lidos</p>
        <ul className="space-y-2">
          {DOCS.map((doc, i) => (
            <li key={doc.name} className="scan-item flex items-center justify-between gap-2 rounded-xl bg-secondary/70 px-3 py-2" style={delay(0.2 + i * 0.18)}>
              <span className="flex items-center gap-2 min-w-0 text-[13px] text-foreground">
                <FileText className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">{doc.name}</span>
              </span>
              <span className="text-[11px] text-muted-foreground shrink-0">{doc.type}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-muted-foreground pt-1">+ CCIR e CAR (imóvel rural)</p>
      </div>

      {/* Poligonal calculada */}
      <div className="p-5 sm:p-6 md:border-r border-border bg-secondary/40 flex flex-col">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Poligonal pelas coordenadas</p>
        <PolygonSketch animate className="w-full max-w-[260px] mx-auto my-3 flex-1" />
        <dl className="grid grid-cols-2 gap-2 text-center">
          <div className="scan-item rounded-xl bg-card px-2 py-2 shadow-soft" style={delay(1.4)}>
            <dt className="text-[11px] text-muted-foreground">Perímetro calculado</dt>
            <dd className="text-sm font-semibold tabular-nums">2.349,58 m</dd>
          </div>
          <div className="scan-item rounded-xl bg-warning/10 px-2 py-2" style={delay(1.6)}>
            <dt className="text-[11px] text-muted-foreground">No memorial</dt>
            <dd className="text-sm font-semibold tabular-nums text-warning">2.349,98 m</dd>
          </div>
        </dl>
      </div>

      {/* Resultado */}
      <div className="p-5 sm:p-6 flex flex-col gap-2.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">O que precisa de atenção</p>
        {FINDINGS.map(f => (
          <div key={f.title} className="scan-item bg-card rounded-2xl px-3.5 py-2.5 shadow-soft ring-1 ring-black/5 flex items-start gap-2.5" style={delay(f.at)}>
            <ToneIcon tone={f.tone} className="w-4 h-4 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.detail}</p>
            </div>
          </div>
        ))}
        <div className="scan-item rounded-2xl bg-destructive/[0.06] ring-1 ring-destructive/20 px-3.5 py-3 space-y-1" style={delay(3.1)}>
          <StatusChip tone="bad">Veredito</StatusChip>
          <p className="text-sm font-semibold text-foreground">Há diferenças para corrigir antes de levar ao cartório.</p>
        </div>
        <Link to="/app?sample=desdobro" className="scan-item inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline pt-1" style={delay(3.4)}>
          Abrir este projeto completo <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </WindowFrame>
);
