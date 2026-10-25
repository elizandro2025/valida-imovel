import React from 'react';

type Level = 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO' | 'INDEFINIDO';

const COLORS: Record<Level, string> = {
  BAIXO: 'text-success',
  MÉDIO: 'text-warning',
  ALTO: 'text-warning',
  CRÍTICO: 'text-destructive',
  INDEFINIDO: 'text-muted-foreground',
};

interface ScoreRingProps {
  score: number | null;
  level: Level;
  size?: number;
  label?: string;
}

// Nota de risco em anel (0 a 100), no estilo dos anéis de atividade da Apple
export const ScoreRing: React.FC<ScoreRingProps> = ({ score, level, size = 112, label = 'Nota de risco' }) => {
  const stroke = Math.round(size * 0.09);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score === null ? 0 : Math.min(100, Math.max(0, score)) / 100;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${score ?? 'não avaliada'} de 100, risco ${level.toLowerCase()}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.max(progress, 0.02))}
          className={`${COLORS[level]} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-semibold tracking-tight text-foreground tabular-nums" style={{ fontSize: size * 0.3 }}>
          {score ?? '-'}
        </span>
        <span className={`mt-1 font-semibold uppercase tracking-wide ${COLORS[level]}`} style={{ fontSize: Math.max(10, size * 0.095) }}>
          {level === 'INDEFINIDO' ? 'sem nota' : level}
        </span>
      </div>
    </div>
  );
};
