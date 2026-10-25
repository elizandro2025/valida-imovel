import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ScoreRing } from '@/components/ScoreRing';

// Demonstração do topo da página: a matrícula do exemplo com risco (/app?sample=risk) é lida e o relatório se monta ao lado.
// Animação só em CSS (index.css, ".scan-*"): roda no HTML pré-renderizado e, com "reduzir movimento", mostra o estado final.
// Os dados são os mesmos do exemplo em src/hooks/useMatriculaAnalysis.ts; se mudar um, mude o outro.
const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as React.CSSProperties;

// Mesma conta do ScoreRing: a animação enche o anel a partir da circunferência inteira (anel vazio)
const RING_SIZE = 84;
const RING_CIRCUMFERENCE = 2 * Math.PI * ((RING_SIZE - Math.round(RING_SIZE * 0.09)) / 2);

const FINDINGS = [
  { at: 1.1, label: 'Proprietário atual', value: 'José Carlos da Silva, 100%', act: 'R-1', tone: 'text-foreground' },
  { at: 1.7, label: 'Cédula rural hipotecária', value: 'Ativa, Banco do Brasil, R$ 480 mil', act: 'R-3', tone: 'text-warning' },
  { at: 2.3, label: 'Embargo ambiental do IBAMA', value: 'Ativo, desmatamento em APP', act: 'AV-4', tone: 'text-destructive' },
];

export const MatriculaScan: React.FC = () => (
  <div className="bg-card rounded-[28px] shadow-hard ring-1 ring-white/10 overflow-hidden text-left">
    <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-border bg-secondary/70">
      <span className="w-3 h-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
      <span className="w-3 h-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
      <span className="w-3 h-3 rounded-full bg-[#28c840]" aria-hidden="true" />
      <span className="ml-2 sm:ml-4 text-xs text-muted-foreground truncate">matricula-18920.pdf · exemplo com dados fictícios</span>
    </div>

    <div className="grid md:grid-cols-[1.15fr_1fr]">
      {/* A certidão sendo lida */}
      <div className="relative overflow-hidden p-5 sm:p-7 text-[12.5px] sm:text-[13px] leading-relaxed text-foreground/75 font-serif lining-nums bg-card md:border-r border-border space-y-2.5">
        <div className="scan-bar" aria-hidden="true" />
        <p className="font-sans font-semibold text-foreground tracking-wide text-[12px] uppercase">Matrícula nº 18.920 · Livro 2 · Barretos/SP</p>
        <p><strong className="text-foreground">Imóvel:</strong> Sítio Boa Vista, área de 120,00 hectares, Rodovia Faria Lima, km 410, zona rural.</p>
        <p><strong className="text-foreground">R-1/18.920</strong>, 10/05/2001. Compra e venda. Transmitente: Antônio Pedroso. Adquirente: José Carlos da Silva, agricultor, solteiro.</p>
        <p>
          <mark className="scan-mark" style={delay(1.6)}>
            <strong className="text-foreground">R-3/18.920.</strong> Cédula rural hipotecária em favor do Banco do Brasil S/A, valor de R$ 480.000,00.
          </mark>
        </p>
        <p>
          <mark className="scan-mark scan-mark-danger" style={delay(2.2)}>
            <strong className="text-foreground">AV-4/18.920.</strong> Embargo ambiental determinado pelo IBAMA, processo 02001.004521/2022, por desmatamento não autorizado de APP.
          </mark>
        </p>
        {/* Continuação da certidão (o resto das páginas) */}
        <div className="space-y-2 pt-3" aria-hidden="true">
          <div className="h-2 rounded-full bg-secondary w-11/12" />
          <div className="h-2 rounded-full bg-secondary w-full" />
          <div className="h-2 rounded-full bg-secondary w-4/5" />
          <div className="h-2 rounded-full bg-secondary w-2/3" />
        </div>
        <p className="font-sans text-[11px] text-muted-foreground pt-2">Página 1 de 3</p>
      </div>

      {/* O relatório se montando */}
      <div className="p-5 sm:p-7 bg-secondary/60 flex flex-col gap-3">
        {FINDINGS.map(f => (
          <div key={f.act} className="scan-item bg-card rounded-2xl px-4 py-3 shadow-soft flex items-start justify-between gap-3" style={delay(f.at)}>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{f.label}</p>
              <p className={`text-sm font-semibold ${f.tone}`}>{f.value}</p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-muted-foreground bg-secondary rounded-full px-2.5 py-1">{f.act}</span>
          </div>
        ))}
        <div className="scan-item bg-card rounded-2xl p-4 shadow-soft flex items-center gap-4" style={delay(2.8)}>
          <div className="scan-ring" style={{ ...delay(2.8), '--ring-c': RING_CIRCUMFERENCE } as React.CSSProperties}>
            <ScoreRing score={88} level="CRÍTICO" size={RING_SIZE} />
          </div>
          <p className="text-sm text-foreground/80 leading-snug">
            <strong className="text-foreground">Não recomendado</strong> sem quitar a hipoteca e regularizar o embargo.
          </p>
        </div>
        <Link to="/app?sample=risk" className="scan-item inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline pt-1" style={delay(3.2)}>
          Abrir este relatório completo <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </div>
);
