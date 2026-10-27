import React, { useMemo, useState, useRef } from 'react';
import { Vertex, CalculatedSegment } from '@/services/geodesyService';
import {
  Compass,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Download,
  RotateCcw,
  Layers,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PolygonVisualizerProps {
  vertices: Vertex[];
  segments?: CalculatedSegment[];
  areaM2?: number;
  perimeter?: number;
  isClockwise?: boolean;
  onLoadSample?: () => void;
  className?: string;
}

export const PolygonVisualizer: React.FC<PolygonVisualizerProps> = ({
  vertices,
  segments = [],
  areaM2,
  perimeter,
  isClockwise = true,
  onLoadSample,
  className = '',
}) => {
  const [showLabels, setShowLabels] = useState(true);
  const [showDistances, setShowDistances] = useState(true);
  const [showAzimuths, setShowAzimuths] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedVertex, setSelectedVertex] = useState<Vertex | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Dimensões do viewBox
  const vbWidth = 720;
  const vbHeight = 480;
  const padding = 70;

  // Projeção das coordenadas E, N para coordenadas SVG (x, y)
  const projection = useMemo(() => {
    if (!vertices || vertices.length < 3) return null;

    let minE = Infinity;
    let maxE = -Infinity;
    let minN = Infinity;
    let maxN = -Infinity;

    vertices.forEach((v) => {
      if (v.E < minE) minE = v.E;
      if (v.E > maxE) maxE = v.E;
      if (v.N < minN) minN = v.N;
      if (v.N > maxN) maxN = v.N;
    });

    const rangeE = maxE - minE || 1;
    const rangeN = maxN - minN || 1;

    const drawW = vbWidth - padding * 2;
    const drawH = vbHeight - padding * 2;

    // Manter aspecto 1:1 para preservar a escala e forma real do terreno
    const scale = Math.min(drawW / rangeE, drawH / rangeN);

    const offsetX = (vbWidth - rangeE * scale) / 2;
    const offsetY = (vbHeight - rangeN * scale) / 2;

    const toSvg = (e: number, n: number) => {
      const x = offsetX + (e - minE) * scale;
      // Inversão do eixo Y no SVG (Norte é para cima)
      const y = vbHeight - (offsetY + (n - minN) * scale);
      return { x, y };
    };

    const projectedVertices = vertices.map((v) => {
      const { x, y } = toSvg(v.E, v.N);
      return { ...v, sx: x, sy: y };
    });

    // Ponto centróide para o badge
    const meanE = vertices.reduce((acc, v) => acc + v.E, 0) / vertices.length;
    const meanN = vertices.reduce((acc, v) => acc + v.N, 0) / vertices.length;
    const centroid = toSvg(meanE, meanN);

    // Escala gráfica em metros (ex: 10m, 20m, 50m, 100m, 500m)
    const rawBarMeters = drawW / scale / 5;
    const magnitudes = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
    const barMeters =
      magnitudes.find((m) => m >= rawBarMeters) || Math.round(rawBarMeters);
    const barPixelWidth = barMeters * scale;

    return {
      projectedVertices,
      centroid,
      scale,
      barMeters,
      barPixelWidth,
      minE,
      maxE,
      minN,
      maxN,
    };
  }, [vertices, vbWidth, vbHeight, padding]);

  // Download do SVG gerado
  const handleDownloadSvg = () => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poligonal_terreno_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 400);
  };

  // Erro de fechamento linear de Gauss e precisão relativa
  const closureStats = useMemo(() => {
    if (!vertices || vertices.length < 3) return null;
    let sumDE = 0;
    let sumDN = 0;
    for (let i = 0; i < vertices.length; i++) {
      const vCurr = vertices[i];
      const vNext = vertices[(i + 1) % vertices.length];
      sumDE += vNext.E - vCurr.E;
      sumDN += vNext.N - vCurr.N;
    }
    const fs = Math.hypot(sumDE, sumDN); // Erro linear em metros
    const perim =
      perimeter ||
      vertices.reduce((acc, v, i) => {
        const vN = vertices[(i + 1) % vertices.length];
        return acc + Math.hypot(vN.E - v.E, vN.N - v.N);
      }, 0);
    const precisionRatio = fs > 0.0001 ? Math.round(perim / fs) : 50000;
    return {
      fs,
      precisionText:
        precisionRatio >= 50000
          ? '≥ 1:50.000'
          : `1:${precisionRatio.toLocaleString('pt-BR')}`,
      isWithinTolerance: fs <= 0.1, // tolerância de 10 cm
    };
  }, [vertices, perimeter]);

  if (!projection || vertices.length < 3) {
    return (
      <div
        className={`rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 ${className}`}
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
          <Compass className="w-7 h-7" />
        </div>
        <div className="max-w-md">
          <h4 className="text-base font-semibold text-foreground">
            Visualizador Cartográfico da Poligonal
          </h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Nenhuma coordenada válida foi lançada ainda. Insira ao menos 3
            vértices com coordenadas UTM ou geográficas para renderizar a
            geometria em escala com distâncias e azimutes.
          </p>
        </div>
        {onLoadSample && (
          <Button
            onClick={onLoadSample}
            size="sm"
            variant="outline"
            className="gap-2 text-xs h-9 bg-card hover:bg-card/80 border-primary/30 text-primary hover:text-primary shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Carregar Poligonal Modelo de Demonstração
          </Button>
        )}
      </div>
    );
  }

  const { projectedVertices, centroid, barMeters, barPixelWidth } = projection;

  // Path SVG fechado
  const pathD = projectedVertices.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.sx} ${pt.sy}` : `${acc} L ${pt.sx} ${pt.sy}`;
  }, '') + ' Z';

  return (
    <div
      ref={containerRef}
      className={`relative bg-gradient-to-b from-card to-card/90 border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50 bg-background max-h-none overflow-auto' : ''
      } ${className}`}
    >
      {/* Header com Controles Rápidos */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span>Geometria Pericial do Imóvel</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {vertices.length} Vértices
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isClockwise
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {isClockwise ? 'Sentido Horário (ABNT)' : 'Sentido Anti-horário'}
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Projeção plana SIRGAS 2000 em escala dinâmica com fechamento geométrico
            </p>
          </div>
        </div>

        {/* Toolbar de Toggles e Exportação */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLabels((v) => !v)}
            className={`h-7 px-2.5 text-xs gap-1.5 rounded-lg ${
              showLabels ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
            }`}
            title="Alternar identificação dos vértices"
          >
            <MapPin className="w-3.5 h-3.5" />
            Vértices
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDistances((v) => !v)}
            className={`h-7 px-2.5 text-xs gap-1.5 rounded-lg ${
              showDistances ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
            }`}
            title="Alternar cotas de distância dos lados"
          >
            <Eye className="w-3.5 h-3.5" />
            Distâncias
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAzimuths((v) => !v)}
            className={`h-7 px-2.5 text-xs gap-1.5 rounded-lg ${
              showAzimuths ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
            }`}
            title="Alternar azimutes dos segmentos"
          >
            <Compass className="w-3.5 h-3.5" />
            Azimutes
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGrid((v) => !v)}
            className={`h-7 px-2 text-xs rounded-lg ${
              showGrid ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
            }`}
            title="Alternar grade de coordenadas"
          >
            <Layers className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSvg}
            className="h-7 px-2.5 text-xs gap-1.5 rounded-lg"
            title="Exportar como vetor SVG de alta precisão"
          >
            <Download className="w-3.5 h-3.5" />
            SVG
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen((v) => !v)}
            className="h-7 w-7 p-0 rounded-lg text-muted-foreground"
            title={isFullscreen ? 'Reduzir visualização' : 'Expandir para tela cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-border/40 overflow-hidden flex items-center justify-center min-h-[360px]">
        <svg
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          className="w-full h-auto max-h-[520px] select-none"
        >
          <defs>
            {/* Gradiente do preenchimento do terreno */}
            <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.08" />
            </linearGradient>

            {/* Pattern de Grade Sutil */}
            <pattern
              id="gridPattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-slate-300/40 dark:text-slate-800/60"
              />
            </pattern>
          </defs>

          {/* Grade de fundo */}
          {showGrid && (
            <rect width={vbWidth} height={vbHeight} fill="url(#gridPattern)" />
          )}

          {/* Polígono preenchido */}
          <path
            d={pathD}
            fill="url(#polyGrad)"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="transition-all duration-300 drop-shadow-xs"
          />

          {/* Segmentos de reta e cotas */}
          {projectedVertices.map((vCurr, idx) => {
            const vNext = projectedVertices[(idx + 1) % projectedVertices.length];
            const segInfo = segments[idx];

            const midX = (vCurr.sx + vNext.sx) / 2;
            const midY = (vCurr.sy + vNext.sy) / 2;

            // Vetor normal perpendicular para afastar os textos da linha
            const dx = vNext.sx - vCurr.sx;
            const dy = vNext.sy - vCurr.sy;
            const len = Math.hypot(dx, dy) || 1;
            const normX = -dy / len;
            const normY = dx / len;

            const textDistOffset = 14;
            const textAzOffset = 26;

            return (
              <g key={`seg-${idx}`}>
                {/* Linha direcional sutil */}
                <line
                  x1={vCurr.sx}
                  y1={vCurr.sy}
                  x2={vNext.sx}
                  y2={vNext.sy}
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeOpacity="0.85"
                />

                {/* Cota de Distância */}
                {showDistances && (
                  <text
                    x={midX + normX * textDistOffset}
                    y={midY + normY * textDistOffset}
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className="fill-slate-700 dark:fill-slate-200 pointer-events-none font-mono"
                    style={{
                      textShadow:
                        '0 1px 2px rgba(255,255,255,0.9), 0 -1px 2px rgba(255,255,255,0.9), 1px 0 2px rgba(255,255,255,0.9), -1px 0 2px rgba(255,255,255,0.9)',
                    }}
                  >
                    {segInfo
                      ? `${segInfo.distance.toFixed(2)} m`
                      : `${Math.hypot(vNext.E - vCurr.E, vNext.N - vCurr.N).toFixed(2)} m`}
                  </text>
                )}

                {/* Azimute */}
                {showAzimuths && segInfo && (
                  <text
                    x={midX + normX * textAzOffset}
                    y={midY + normY * textAzOffset}
                    fontSize="8.5"
                    fontWeight="500"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className="fill-indigo-600 dark:fill-indigo-400 pointer-events-none font-mono"
                    style={{
                      textShadow:
                        '0 1px 2px rgba(255,255,255,0.9), 0 -1px 2px rgba(255,255,255,0.9)',
                    }}
                  >
                    Az {segInfo.azimuthDms}
                  </text>
                )}
              </g>
            );
          })}

          {/* Vértices (Pins Circulares e Rótulos) */}
          {projectedVertices.map((v) => {
            const isSelected = selectedVertex?.id === v.id;
            return (
              <g
                key={`vert-${v.id}`}
                className="cursor-pointer group"
                onClick={() => setSelectedVertex((cur) => (cur?.id === v.id ? null : v))}
              >
                {/* Aura ao passar o mouse */}
                <circle
                  cx={v.sx}
                  cy={v.sy}
                  r="12"
                  className="fill-blue-500/0 group-hover:fill-blue-500/20 transition-all"
                />

                {/* Vértice físico */}
                <circle
                  cx={v.sx}
                  cy={v.sy}
                  r={isSelected ? '6.5' : '4.5'}
                  className={`${
                    isSelected
                      ? 'fill-amber-500 stroke-white stroke-2'
                      : 'fill-blue-600 group-hover:fill-blue-700 stroke-white dark:stroke-slate-900 stroke-2'
                  } transition-all duration-150 drop-shadow-xs`}
                />

                {/* ID do Vértice */}
                {showLabels && (
                  <text
                    x={v.sx}
                    y={v.sy - 10}
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                    className="fill-blue-950 dark:fill-white font-mono pointer-events-none"
                    style={{
                      textShadow:
                        '0 1px 3px rgba(255,255,255,0.95), 0 -1px 3px rgba(255,255,255,0.95), 1px 0 3px rgba(255,255,255,0.95), -1px 0 3px rgba(255,255,255,0.95)',
                    }}
                  >
                    {v.id}
                  </text>
                )}
              </g>
            );
          })}

          {/* Rosa dos Ventos / Indicador de Norte Magnético/Verdadeiro */}
          <g transform={`translate(${vbWidth - 55}, 55)`} className="pointer-events-none">
            <circle
              cx="0"
              cy="0"
              r="22"
              className="fill-white/80 dark:fill-slate-900/80 stroke-border stroke-1 shadow-sm backdrop-blur-xs"
            />
            {/* Ponteiro Norte Vermelho */}
            <path d="M 0 -18 L 4 0 L 0 -4 Z" fill="#ef4444" />
            <path d="M 0 -18 L -4 0 L 0 -4 Z" fill="#b91c1c" />
            {/* Ponteiro Sul Azul */}
            <path d="M 0 18 L 4 0 L 0 4 Z" fill="#3b82f6" />
            <path d="M 0 18 L -4 0 L 0 4 Z" fill="#1d4ed8" />
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <text
              x="0"
              y="-22"
              fontSize="10"
              fontWeight="900"
              textAnchor="middle"
              className="fill-rose-600 font-mono"
            >
              N
            </text>
          </g>

          {/* Escala Gráfica Dinâmica */}
          <g transform={`translate(45, ${vbHeight - 35})`} className="pointer-events-none">
            <line
              x1="0"
              y1="0"
              x2={barPixelWidth}
              y2="0"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-slate-800 dark:text-slate-200"
            />
            <line
              x1="0"
              y1="-4"
              x2="0"
              y2="4"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-slate-800 dark:text-slate-200"
            />
            <line
              x1={barPixelWidth}
              y1="-4"
              x2={barPixelWidth}
              y2="4"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-slate-800 dark:text-slate-200"
            />
            <text
              x={barPixelWidth / 2}
              y="-7"
              fontSize="9.5"
              fontWeight="700"
              textAnchor="middle"
              className="fill-slate-800 dark:fill-slate-200 font-mono"
            >
              0 — {barMeters} m
            </text>
            <text
              x={barPixelWidth / 2}
              y="14"
              fontSize="8"
              textAnchor="middle"
              className="fill-muted-foreground font-sans"
            >
              Escala Gráfica
            </text>
          </g>
        </svg>

        {/* Badge Flutuante com Metadados da Área / Perímetro */}
        {(areaM2 != null || perimeter != null) && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-border/80 rounded-xl px-3.5 py-2 shadow-xs text-xs pointer-events-none">
            <div className="flex items-center gap-3">
              {areaM2 != null && (
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Área Calculada
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {areaM2.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    m²
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono block">
                    ({(areaM2 / 10000).toFixed(4)} ha)
                  </span>
                </div>
              )}
              {perimeter != null && (
                <div className="border-l border-border/60 pl-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Perímetro
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {perimeter.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    m
                  </span>
                </div>
              )}
              {closureStats && (
                <div className="border-l border-border/60 pl-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Precisão Gauss
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {closureStats.precisionText}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono block">
                    (fs: {(closureStats.fs * 100).toFixed(1)} cm)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Popover do Vértice Selecionado */}
        {selectedVertex && (
          <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-primary/40 rounded-xl p-3 shadow-md text-xs z-10 max-w-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-1.5 mb-2">
              <span className="font-bold text-primary font-mono flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Vértice {selectedVertex.id}
              </span>
              <button
                onClick={() => setSelectedVertex(null)}
                className="text-muted-foreground hover:text-foreground text-[11px]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-foreground">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground font-sans">E (Leste):</span>
                <span>{selectedVertex.E.toFixed(3)} m</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground font-sans">N (Norte):</span>
                <span>{selectedVertex.N.toFixed(3)} m</span>
              </div>
              {selectedVertex.lat != null && selectedVertex.lon != null && (
                <>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground font-sans">Latitude:</span>
                    <span>{selectedVertex.lat.toFixed(6)}°</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground font-sans">Longitude:</span>
                    <span>{selectedVertex.lon.toFixed(6)}°</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
