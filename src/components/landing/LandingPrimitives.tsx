import React from 'react';
import { AlertTriangle, CheckCircle2, Circle, XCircle } from 'lucide-react';
import type { SampleRow, Tone } from '@/content/landing';
import { SAMPLE_VERTICES } from '@/content/landing';

// Peças visuais da página inicial: títulos de seção, selos de status, moldura de janela e a poligonal do exemplo.

export const SectionHeader: React.FC<{ eyebrow: string; title: string; subtitle?: string; align?: 'center' | 'left'; dark?: boolean }> = ({
  eyebrow, title, subtitle, align = 'center', dark = false,
}) => (
  <div className={`space-y-3 sm:space-y-4 max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
    <p className={`text-[13px] sm:text-sm font-semibold tracking-wide uppercase ${dark ? 'text-[#6cb4ff]' : 'text-primary'}`}>{eyebrow}</p>
    <h2 className={`text-[28px] leading-[1.12] sm:text-[44px] sm:leading-[1.08] font-semibold tracking-tight ${dark ? 'text-white' : 'text-foreground'}`}>{title}</h2>
    {subtitle && <p className={`text-base sm:text-lg leading-relaxed ${dark ? 'text-white/70' : 'text-muted-foreground'}`}>{subtitle}</p>}
  </div>
);

const TONE_TEXT: Record<Tone, string> = {
  ok: 'text-success',
  warn: 'text-warning',
  bad: 'text-destructive',
  neutral: 'text-foreground',
};

const TONE_CHIP: Record<Tone, string> = {
  ok: 'bg-success/10 text-success',
  warn: 'bg-warning/10 text-warning',
  bad: 'bg-destructive/10 text-destructive',
  neutral: 'bg-secondary text-foreground/80',
};

const TONE_ICON: Record<Tone, React.ElementType> = { ok: CheckCircle2, warn: AlertTriangle, bad: XCircle, neutral: Circle };

export const StatusChip: React.FC<{ tone?: Tone; children: React.ReactNode; className?: string }> = ({ tone = 'neutral', children, className = '' }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${TONE_CHIP[tone]} ${className}`}>
    {children}
  </span>
);

export const ToneIcon: React.FC<{ tone?: Tone; className?: string }> = ({ tone = 'neutral', className = 'w-4 h-4' }) => {
  const Icon = TONE_ICON[tone];
  return <Icon className={`${className} shrink-0 ${tone === 'neutral' ? 'text-muted-foreground' : TONE_TEXT[tone]}`} aria-hidden="true" />;
};

// Linhas de resultado como aparecem nos relatórios (rótulo à esquerda, valor com a cor do status)
export const ResultRows: React.FC<{ rows: SampleRow[] }> = ({ rows }) => (
  <ul className="divide-y divide-border">
    {rows.map(row => (
      <li key={row.label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
        <span className="flex items-center gap-2 min-w-0 text-foreground/80">
          {row.tone && <ToneIcon tone={row.tone} />}
          <span className="truncate">{row.label}</span>
        </span>
        <span className={`shrink-0 text-right font-medium tabular-nums ${row.tone ? TONE_TEXT[row.tone] : 'text-foreground'}`}>{row.value}</span>
      </li>
    ))}
  </ul>
);

// Moldura de janela de aplicativo para as demonstrações
export const WindowFrame: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
  <div className={`bg-card rounded-[24px] shadow-hard ring-1 ring-black/5 overflow-hidden text-left ${className}`}>
    <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-border bg-secondary/70">
      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" aria-hidden="true" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" aria-hidden="true" />
      <span className="ml-2 sm:ml-3 text-xs text-muted-foreground truncate">{title}</span>
    </div>
    {children}
  </div>
);

// Poligonal do projeto de exemplo, desenhada a partir das coordenadas UTM (Norte para cima, escala 1:1)
const PAD = 14;
const E = SAMPLE_VERTICES.map(v => v[1]);
const N = SAMPLE_VERTICES.map(v => v[2]);
const SCALE = 140 / Math.max(Math.max(...E) - Math.min(...E), Math.max(...N) - Math.min(...N));
const POINTS = SAMPLE_VERTICES.map(([id, e, n]) => ({
  id,
  x: PAD + (e - Math.min(...E)) * SCALE,
  y: PAD + (Math.max(...N) - n) * SCALE,
}));
const VIEW_W = PAD * 2 + (Math.max(...E) - Math.min(...E)) * SCALE;
const VIEW_H = PAD * 2 + (Math.max(...N) - Math.min(...N)) * SCALE;

export const PolygonSketch: React.FC<{ highlight?: [string, string]; animate?: boolean; className?: string }> = ({
  highlight = ['M-02', 'M-03'], animate = false, className = '',
}) => {
  const a = POINTS.find(p => p.id === highlight[0]);
  const b = POINTS.find(p => p.id === highlight[1]);
  return (
    <svg viewBox={`0 0 ${VIEW_W.toFixed(1)} ${VIEW_H.toFixed(1)}`} className={className} role="img"
      aria-label={`Poligonal do exemplo com ${POINTS.length} vértices; lado ${highlight[0]} a ${highlight[1]} em destaque`}>
      <polygon
        points={POINTS.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
        pathLength={1}
        className={`fill-primary/[0.07] stroke-primary ${animate ? 'scan-draw' : ''}`}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      {a && b && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-warning" strokeWidth={3} strokeLinecap="round" />}
      {POINTS.map(p => (
        <g key={p.id}>
          <circle cx={p.x} cy={p.y} r={2.6} className="fill-card stroke-primary" strokeWidth={1.4} />
          <text x={p.x} y={p.y < VIEW_H / 2 ? p.y - 5 : p.y + 10} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 7 }}>{p.id}</text>
        </g>
      ))}
    </svg>
  );
};
