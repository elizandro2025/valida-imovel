import React, { useRef, useMemo } from 'react';
import { ProjectData } from '@/services/projectConferenceService';
import { geodesyService, CalculatedSegment } from '@/services/geodesyService';
import { PolygonVisualizer } from './PolygonVisualizer';
import { SAMPLE_PROJECT_DATA } from '@/services/projectSampleData';
import {
  Compass,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PoligonalTabProps {
  data: ProjectData;
  onUpdate: (updater: (prev: ProjectData) => ProjectData) => void;
}

export const PoligonalTab: React.FC<PoligonalTabProps> = ({ data, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updatePoly = (field: keyof ProjectData['polygon'], value: unknown) => {
    onUpdate(prev => ({
      ...prev,
      polygon: { ...prev.polygon, [field]: value },
    }));
  };

  const updateSegmentDeclared = (
    key: string,
    field: 'distPlanta' | 'distMemorial' | 'azPlanta' | 'azMemorial',
    value: string
  ) => {
    onUpdate(prev => {
      const segs = { ...prev.polygon.declaredSegments };
      const current = segs[key] || {};
      segs[key] = {
        ...current,
        [field]: field.startsWith('dist') ? parseFloat(value.replace(',', '.')) || undefined : value,
      };
      return {
        ...prev,
        polygon: { ...prev.polygon, declaredSegments: segs },
      };
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      updatePoly('rawCoords', text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Cálculo reativo da poligonal
  const polyResult = useMemo(() => {
    const { vertices, notes, errors } = geodesyService.parseVertices(
      data.polygon.rawCoords,
      data.polygon.isGeo,
      data.polygon.order
    );

    const calc = geodesyService.calculatePolygon(
      vertices,
      {
        areaPlanta: parseFloat(data.polygon.areaPlanta.replace(',', '.')),
        areaMemorial: parseFloat(data.polygon.areaMemorial.replace(',', '.')),
        perimPlanta: parseFloat(data.polygon.perimPlanta.replace(',', '.')),
        perimMemorial: parseFloat(data.polygon.perimMemorial.replace(',', '.')),
        tolDist: parseFloat(data.polygon.tolDist.replace(',', '.')),
        tolArea: parseFloat(data.polygon.tolArea.replace(',', '.')),
        tolAz: parseFloat(data.polygon.tolAz.replace(',', '.')),
      },
      data.polygon.declaredSegments
    );

    return { ...calc, parseNotes: notes, parseErrors: errors };
  }, [data.polygon]);

  const handleDownloadCsv = () => {
    if (!polyResult.segments.length) return;
    const csv = geodesyService.exportSegmentsCsv(polyResult.segments, polyResult.vertices);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.info.nome || 'poligonal').toLowerCase().replace(/\s+/g, '_')}_segmentos.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 400);
  };

  const loadSampleCoordinates = () => {
    onUpdate(prev => ({
      ...prev,
      polygon: {
        ...prev.polygon,
        rawCoords: SAMPLE_PROJECT_DATA.polygon.rawCoords,
        areaPlanta: SAMPLE_PROJECT_DATA.polygon.areaPlanta,
        areaMemorial: SAMPLE_PROJECT_DATA.polygon.areaMemorial,
        perimPlanta: SAMPLE_PROJECT_DATA.polygon.perimPlanta,
        perimMemorial: SAMPLE_PROJECT_DATA.polygon.perimMemorial,
        declaredSegments: SAMPLE_PROJECT_DATA.polygon.declaredSegments,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Entrada de Coordenadas */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary" />
              Conferência de Medidas, Áreas e Fechamento do Terreno
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-4xl leading-relaxed">
              Cálculo de área e perímetro pela fórmula de Gauss, conferindo se o desenho fecha perfeitamente e se a área calculada coincide com a planta e o memorial. Suporta TXT, CSV, DXF e KML.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleCoordinates}
              className="text-xs gap-1.5 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Carregar Exemplo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs gap-1.5 font-medium"
            >
              <Upload className="w-3.5 h-3.5 text-primary" />
              Importar Vértices
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.dat,.kml,.kmz,.xlsx"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>


        <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-border/40">
          <label className="flex items-center gap-1.5 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={data.polygon.isGeo}
              onChange={e => updatePoly('isGeo', e.target.checked)}
              className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span>Coordenadas geográficas (lat, long)</span>
          </label>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Ordem</span>
            <select
              value={data.polygon.order}
              onChange={e => updatePoly('order', e.target.value as 'EN' | 'NE')}
              className="px-2 py-1 rounded-lg border border-input bg-background text-xs font-mono"
            >
              <option value="EN">ID - E - N</option>
              <option value="NE">ID - N - E</option>
            </select>
          </div>
        </div>

        <textarea
          rows={6}
          value={data.polygon.rawCoords}
          onChange={e => updatePoly('rawCoords', e.target.value)}
          placeholder={`V01;330412,150;7391200,320\nV02;330448,590;7391192,650\nV03;330475,210;7391228,100\nV04;330462,400;7391264,900\n...`}
          className="w-full px-3 py-2.5 rounded-xl border border-input bg-muted/10 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
        />

        {/* Parâmetros Técnicos & Critérios de Tolerância */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Painel 1: Valores Declarados nas Peças Técnicas */}
          <div className="bg-background border border-border/70 rounded-xl p-3.5 space-y-3">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 border-b border-border/40 pb-2">
              <Compass className="w-3.5 h-3.5 text-primary" />
              1. Valores Declarados nas Peças Técnicas
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-foreground block">
                  Área na Planta (m²):
                </label>
                <Input
                  type="text"
                  value={data.polygon.areaPlanta}
                  onChange={e => updatePoly('areaPlanta', e.target.value)}
                  placeholder="Ex: 1.840,50"
                  className="h-8 text-xs font-mono bg-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-foreground block">
                  Área no Memorial (m²):
                </label>
                <Input
                  type="text"
                  value={data.polygon.areaMemorial}
                  onChange={e => updatePoly('areaMemorial', e.target.value)}
                  placeholder="Ex: 1.840,50"
                  className="h-8 text-xs font-mono bg-card"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-foreground block">
                  Perímetro na Planta (m):
                </label>
                <Input
                  type="text"
                  value={data.polygon.perimPlanta}
                  onChange={e => updatePoly('perimPlanta', e.target.value)}
                  placeholder="Ex: 176,80"
                  className="h-8 text-xs font-mono bg-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-foreground block">
                  Perímetro no Memorial (m):
                </label>
                <Input
                  type="text"
                  value={data.polygon.perimMemorial}
                  onChange={e => updatePoly('perimMemorial', e.target.value)}
                  placeholder="Ex: 176,80"
                  className="h-8 text-xs font-mono bg-card"
                />
              </div>
            </div>
          </div>

          {/* Painel 2: Tolerâncias Normativas da Serventia (NBR 17047) */}
          <div className="bg-background border border-border/70 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                2. Tolerâncias Admissíveis da Serventia
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    updatePoly('tolDist', '0.05');
                    updatePoly('tolArea', '0.50');
                    updatePoly('tolAz', '0.05');
                  }}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground font-semibold transition-colors"
                >
                  Urbana Estrita
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updatePoly('tolDist', '0.50');
                    updatePoly('tolArea', '5.00');
                    updatePoly('tolAz', '0.20');
                  }}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground font-semibold transition-colors"
                >
                  Rural INCRA
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-foreground block">
                  Linear Fechamento (m):
                </label>
                <Input
                  type="text"
                  value={data.polygon.tolDist}
                  onChange={e => updatePoly('tolDist', e.target.value)}
                  className="h-8 text-xs font-mono text-center bg-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-foreground block">
                  Superficial (m²):
                </label>
                <Input
                  type="text"
                  value={data.polygon.tolArea}
                  onChange={e => updatePoly('tolArea', e.target.value)}
                  className="h-8 text-xs font-mono text-center bg-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-foreground block">
                  Angular / Azimute (°):
                </label>
                <Input
                  type="text"
                  value={data.polygon.tolAz}
                  onChange={e => updatePoly('tolAz', e.target.value)}
                  className="h-8 text-xs font-mono text-center bg-card"
                />
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
              Parâmetros da ABNT NBR 17047/2022. Discrepâncias acima destes limites configuram apontamento no Laudo.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
          Cálculo no plano UTM. Se a área declarada estiver em Sistema Geodésico Local (SGL/NBR 17047) ou com fator de escala, pequenas diferenças são esperadas — ajuste a tolerância e registre a justificativa técnica.
        </p>
      </div>

      {/* 2. Visualizador Cartográfico Interativo da Poligonal */}
      <PolygonVisualizer
        vertices={polyResult.vertices}
        segments={polyResult.segments}
        areaM2={polyResult.areaM2}
        perimeter={polyResult.perimeter}
        isClockwise={polyResult.isClockwise}
        onLoadSample={loadSampleCoordinates}
      />

      {/* Alerta de Coordenadas Ausentes ou Incompletas */}
      {data.polygon.rawCoords.trim().length === 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Ausente ou incompleto</strong> — não é possível verificar fechamento nem sobreposição somente por leitura visual. Lance ou importe as coordenadas (ou use QGIS, SIGEF, Métrica, AutoCAD/Civil 3D).
          </span>
        </div>
      )}

      {/* 3. KPIs de Cálculo Geométrico */}
      {polyResult.vertices.length >= 3 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] font-medium text-muted-foreground block">Vértices Calculados</span>
            <span className="text-xl font-bold text-foreground font-mono mt-1 block">
              {polyResult.vertices.length}
            </span>
            <span className="text-[11px] text-muted-foreground">Polígono fechado</span>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] font-medium text-muted-foreground block">Área Calculada (Gauss)</span>
            <span className="text-xl font-bold text-primary font-mono mt-1 block">
              {polyResult.areaM2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              ({polyResult.areaHa.toFixed(4)} hectares)
            </span>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] font-medium text-muted-foreground block">Perímetro Calculado</span>
            <span className="text-xl font-bold text-foreground font-mono mt-1 block">
              {polyResult.perimeter.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m
            </span>
            <span className="text-[11px] text-muted-foreground">Soma euclidiana dos lados</span>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] font-medium text-muted-foreground block">Sentido de Percurso</span>
            <span
              className={`text-xl font-bold font-mono mt-1 block ${
                polyResult.isClockwise ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {polyResult.isClockwise ? 'Horário' : 'Anti-horário'}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {polyResult.isClockwise ? 'ABNT NBR 17047 ok' : 'NBR 17047 pede horário'}
            </span>
          </div>
        </div>
      )}

      {/* 3. Alertas e Notas da Poligonal */}
      {(polyResult.parseNotes.length > 0 || polyResult.issues.length > 0) && (
        <div className="space-y-2">
          {polyResult.parseNotes.map((note, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-800 dark:text-sky-300 text-xs flex items-center gap-2"
            >
              <Info className="w-4 h-4 shrink-0 text-sky-600" />
              <span>{note}</span>
            </div>
          ))}

          {polyResult.issues.map((iss, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                iss.type === 'err'
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300'
                  : iss.type === 'warn'
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {iss.type === 'err' ? (
                <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
              ) : iss.type === 'warn' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              )}
              <span>{iss.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* 4. Tabela de Segmentos Calculados */}
      {polyResult.segments.length > 0 && (
        <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Segmentos Calculados — Informe as medidas declaradas para comparar
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Valores calculados automaticamente a partir das coordenadas geodésicas.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCsv}
              className="text-xs h-8 gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Segmentos (CSV)
            </Button>
          </div>

          <div className="overflow-x-auto border border-border/60 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold font-mono">
                <tr>
                  <th className="py-2.5 px-3">Segmento</th>
                  <th className="py-2.5 px-3">Dist. Calc. (m)</th>
                  <th className="py-2.5 px-3">Azimute Calc.</th>
                  <th className="py-2.5 px-3 w-32">Dist. Planta</th>
                  <th className="py-2.5 px-3 w-32">Dist. Mem.</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {polyResult.segments.map(s => {
                  const decl = data.polygon.declaredSegments[s.key] || {};
                  return (
                    <tr key={s.key} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2 px-3 font-bold text-foreground">
                        {s.fromId}–{s.toId}
                      </td>
                      <td className="py-2 px-3">{s.distance.toFixed(3)}</td>
                      <td className="py-2 px-3">{s.azimuthDms}</td>
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          value={decl.distPlanta ?? ''}
                          onChange={e => updateSegmentDeclared(s.key, 'distPlanta', e.target.value)}
                          placeholder="m"
                          className="w-full px-2 py-1 bg-background border border-input rounded text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          value={decl.distMemorial ?? ''}
                          onChange={e => updateSegmentDeclared(s.key, 'distMemorial', e.target.value)}
                          placeholder="m"
                          className="w-full px-2 py-1 bg-background border border-input rounded text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 font-sans">
                        {s.results.length > 0 ? (
                          s.results.map((r, i) => (
                            <span
                              key={i}
                              className={`inline-block mr-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                                r.status === 'ok'
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : 'bg-rose-500/10 text-rose-600'
                              }`}
                            >
                              {r.message}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
