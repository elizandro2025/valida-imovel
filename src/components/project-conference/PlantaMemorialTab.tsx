import React, { useState, useMemo } from 'react';
import {
  ProjectData,
  PM_COMPARE_FIELDS,
  PlantaMemorialField,
} from '@/services/projectConferenceService';
import { nominalDiffService } from '@/services/nominalDiffService';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  FileText,
  Compass,
  ArrowLeftRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PlantaMemorialTabProps {
  data: ProjectData;
  onUpdate: (updater: (prev: ProjectData) => ProjectData) => void;
}

type FilterMode = 'all' | 'divergencias' | 'pendencias' | 'conformes';
type ViewMode = 'cards' | 'table';

const PM_FIELD_PLACEHOLDERS: Record<string, { planta: string; memorial: string }> = {
  area: { planta: 'Ex: 1.840,50 m²', memorial: 'Ex: 1.840,50 m²' },
  perim: { planta: 'Ex: 176,80 m', memorial: 'Ex: 176,80 m' },
  nvert: { planta: 'Ex: 6', memorial: 'Ex: 6' },
  vini: { planta: 'Ex: V01', memorial: 'Ex: V01' },
  seq: { planta: 'Ex: V01 - V02 - V03 - V04 - V05 - V06', memorial: 'Ex: V01 - V02 - V03 - V04 - V05 - V06' },
  sist: { planta: 'Ex: SIRGAS 2000', memorial: 'Ex: SIRGAS 2000' },
  proj: { planta: 'Ex: UTM Fuso 23S (MC 45°W)', memorial: 'Ex: UTM Fuso 23S (MC 45°W)' },
  matr: { planta: 'Ex: 114.892 (Livro 2)', memorial: 'Ex: 114.892' },
  cns: { planta: 'Ex: 14º Oficial de Registro de Imóveis de SP', memorial: 'Ex: 14º RI da Capital - SP' },
  prop: { planta: 'Ex: Dr. Marcelo Prado Botelho e cônjuge', memorial: 'Ex: Dr. Marcelo Prado Botelho e Dra. Camila S. Botelho' },
  cpfp: { planta: 'Ex: 098.412.348-15 e 145.892.418-22', memorial: 'Ex: 098.412.348-15 e 145.892.418-22' },
  local: { planta: 'Ex: Rua Oscar Freire, nº 1.420', memorial: 'Ex: Rua Oscar Freire, nº 1.420 - Cerqueira César' },
  bairro: { planta: 'Ex: Cerqueira César / Jardins', memorial: 'Ex: Cerqueira César / Jardins' },
  mun: { planta: 'Ex: São Paulo', memorial: 'Ex: São Paulo' },
  comarca: { planta: 'Ex: São Paulo (Capital)', memorial: 'Ex: São Paulo (Capital)' },
  ident: { planta: 'Ex: Lote 08, Quadra 12, Cerqueira César', memorial: 'Ex: Lote 08, Quadra 12' },
};

export const PlantaMemorialTab: React.FC<PlantaMemorialTabProps> = ({ data, onUpdate }) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const handleUpdateField = (key: string, source: 'planta' | 'memorial', value: string) => {
    onUpdate((prev) => ({
      ...prev,
      pm: {
        ...prev.pm,
        [key]: {
          ...prev.pm[key],
          [source]: value,
        },
      },
    }));
  };

  const copyPlantaToMemorial = (key: string) => {
    const val = data.pm[key]?.planta || '';
    handleUpdateField(key, 'memorial', val);
  };

  const copyMemorialToPlanta = (key: string) => {
    const val = data.pm[key]?.memorial || '';
    handleUpdateField(key, 'planta', val);
  };

  const syncMissingFields = () => {
    onUpdate((prev) => {
      const nextPm = { ...prev.pm };
      PM_COMPARE_FIELDS.forEach((f) => {
        const row = nextPm[f.key] || {};
        const p = (row.planta || '').trim();
        const m = (row.memorial || '').trim();
        if (p && !m) {
          nextPm[f.key] = { ...row, memorial: p };
        } else if (m && !p) {
          nextPm[f.key] = { ...row, planta: m };
        }
      });
      return { ...prev, pm: nextPm };
    });
  };

  const evaluateRow = (field: PlantaMemorialField, pVal = '', mVal = '') => {
    const p = nominalDiffService.normalizeSpace(pVal);
    const m = nominalDiffService.normalizeSpace(mVal);

    if (!p && !m) {
      return {
        status: 'empty',
        label: 'Não informado nas duas peças',
        badgeClass: 'text-muted-foreground bg-muted/40 border-border/40',
        diffNote: null,
      };
    }
    if (!p) {
      return {
        status: 'warn',
        label: 'Ausente na Planta Técnica',
        badgeClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
        diffNote: 'Elemento presente no Memorial Descritivo mas omitido na representação gráfica da Planta.',
      };
    }
    if (!m) {
      return {
        status: 'warn',
        label: 'Ausente no Memorial Perimétrico',
        badgeClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
        diffNote: 'Elemento assinalado na Planta Topográfica mas não transcrito no texto do Memorial.',
      };
    }

    if (field.isNumeric) {
      const numP = parseFloat(p.replace(/\./g, '').replace(',', '.'));
      const numM = parseFloat(m.replace(/\./g, '').replace(',', '.'));
      if (isFinite(numP) && isFinite(numM)) {
        const diff = Math.abs(numP - numM);
        if (diff < 0.001) {
          return {
            status: 'ok',
            label: 'Valores Idênticos',
            badgeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
            diffNote: null,
          };
        }
        return {
          status: 'err',
          label: `Divergência Numérica (Δ ${diff.toFixed(3)})`,
          badgeClass: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30',
          diffNote: `Discrepância de ${diff.toFixed(3)} entre Planta (${p}) e Memorial (${m}). Risco de Nota Devolutiva no Registro de Imóveis.`,
        };
      }
    }

    if (p === m) {
      return {
        status: 'ok',
        label: 'Perfeitamente Coincidente',
        badgeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        diffNote: null,
      };
    }

    if (p.toLowerCase() === m.toLowerCase()) {
      return {
        status: 'ok',
        label: 'Coincidente (Variação de Caixa)',
        badgeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        diffNote: null,
      };
    }

    const diffDesc = nominalDiffService.describeDiff(p, m, 'planta', 'memorial');
    return {
      status: 'err',
      label: `Divergência Textual: ${diffDesc}`,
      badgeClass: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30',
      diffNote: `Divergência descritiva: Planta aponta "${p}" enquanto o Memorial indica "${m}".`,
    };
  };

  const rowResults = useMemo(() => {
    return PM_COMPARE_FIELDS.map((f) => {
      const row = data.pm[f.key] || {};
      const evalRes = evaluateRow(f, row.planta, row.memorial);
      return { field: f, row, evalRes };
    });
  }, [data.pm]);

  const countDivergencias = rowResults.filter((r) => r.evalRes.status === 'err').length;
  const countPendencias = rowResults.filter((r) => r.evalRes.status === 'warn').length;
  const countConformes = rowResults.filter((r) => r.evalRes.status === 'ok').length;

  const filteredRows = useMemo(() => {
    return rowResults.filter((r) => {
      if (filterMode === 'divergencias') return r.evalRes.status === 'err';
      if (filterMode === 'pendencias') return r.evalRes.status === 'warn';
      if (filterMode === 'conformes') return r.evalRes.status === 'ok';
      return true;
    });
  }, [rowResults, filterMode]);

  return (
    <div className="space-y-6">
      {/* HUD Executivo do Confronto Gráfico x Texto */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Confronto Planta × Memorial Descritivo
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              Conferência direta entre os dados do desenho e o texto do memorial. Diferenças entre a planta e o memorial são os principais motivos de nota devolutiva no cartório.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Seletor de Modo de Visualização */}
            <div className="flex items-center bg-secondary p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-card text-foreground shadow-soft border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-card text-foreground shadow-soft border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5 text-primary" />
                <span>Tabela</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={syncMissingFields}
              className="text-xs gap-1.5 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Preencher campos vazios
            </Button>
          </div>
        </div>


        {/* Filtros e Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Exibir:
            </span>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg font-semibold border transition-all ${
                filterMode === 'all'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:border-border'
              }`}
            >
              Todos ({PM_COMPARE_FIELDS.length})
            </button>
            <button
              onClick={() => setFilterMode('divergencias')}
              className={`px-3 py-1 rounded-lg font-semibold border transition-all ${
                filterMode === 'divergencias'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:border-rose-500/40'
              }`}
            >
              Divergências ({countDivergencias})
            </button>
            <button
              onClick={() => setFilterMode('pendencias')}
              className={`px-3 py-1 rounded-lg font-semibold border transition-all ${
                filterMode === 'pendencias'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:border-amber-500/40'
              }`}
            >
              Pendências ({countPendencias})
            </button>
            <button
              onClick={() => setFilterMode('conformes')}
              className={`px-3 py-1 rounded-lg font-semibold border transition-all ${
                filterMode === 'conformes'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40'
              }`}
            >
              Conformes ({countConformes})
            </button>
          </div>

          <div className="text-[11px] font-medium">
            {countDivergencias === 0 && countPendencias === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 100% de coerência entre planta e memorial
              </span>
            ) : countDivergencias > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> {countDivergencias} divergência(s) com risco de nota devolutiva
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> {countPendencias} campo(s) pendente(s) de transcrição
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MODO 1: PAINEL DE CARTÕES DIFF (MODERNO E ELEGANTE) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 gap-4">
          {filteredRows.map(({ field, row, evalRes }) => {
            const isErr = evalRes.status === 'err';
            const isWarn = evalRes.status === 'warn';
            const isOk = evalRes.status === 'ok';

            return (
              <div
                key={field.key}
                className={`bg-card border rounded-2xl p-4 sm:p-5 shadow-sm transition-all space-y-3 ${
                  isErr
                    ? 'border-rose-500/30 bg-rose-500/[0.02]'
                    : isWarn
                    ? 'border-amber-500/30 bg-amber-500/[0.02]'
                    : 'border-border/80 bg-card hover:border-border'
                }`}
              >
                {/* Header do Parâmetro */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {field.label}
                    </span>
                    {field.isNumeric && (
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                        Métrico / Numérico
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${evalRes.badgeClass}`}
                    >
                      {isOk && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isErr && <XCircle className="w-3.5 h-3.5" />}
                      {isWarn && <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>{evalRes.label}</span>
                    </span>
                  </div>
                </div>

                {/* Confronto Lado a Lado (Planta vs Memorial) */}
                <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                  {/* Bloco Planta */}
                  <div className="md:col-span-5 bg-background border border-border/60 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-blue-500" />
                        Planta Topográfica
                      </span>
                      <button
                        type="button"
                        onClick={() => copyPlantaToMemorial(field.key)}
                        className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 font-semibold transition-colors"
                        title="Copiar para o Memorial"
                      >
                        <span>Copiar p/ Memorial</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <Input
                      type="text"
                      value={row.planta || ''}
                      onChange={(e) => handleUpdateField(field.key, 'planta', e.target.value)}
                      placeholder={PM_FIELD_PLACEHOLDERS[field.key]?.planta || 'Transcrição na planta...'}
                      className={`h-9 text-xs font-mono font-medium bg-background ${
                        isErr ? 'border-rose-400 focus:border-rose-500' : ''
                      }`}
                    />
                  </div>

                  {/* Sincronizador Central */}
                  <div className="md:col-span-1 flex md:flex-col items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => copyPlantaToMemorial(field.key)}
                      className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Copiar Planta ➔ Memorial"
                    >
                      <ArrowRight className="w-3.5 h-3.5 hidden md:block" />
                      <ArrowRight className="w-3.5 h-3.5 md:hidden" />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyMemorialToPlanta(field.key)}
                      className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Copiar Memorial ➔ Planta"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 hidden md:block" />
                      <ArrowLeft className="w-3.5 h-3.5 md:hidden" />
                    </button>
                  </div>

                  {/* Bloco Memorial */}
                  <div className="md:col-span-5 bg-background border border-border/60 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        Memorial Descritivo
                      </span>
                      <button
                        type="button"
                        onClick={() => copyMemorialToPlanta(field.key)}
                        className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 font-semibold transition-colors"
                        title="Copiar para a Planta"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Copiar p/ Planta</span>
                      </button>
                    </div>
                    <Input
                      type="text"
                      value={row.memorial || ''}
                      onChange={(e) => handleUpdateField(field.key, 'memorial', e.target.value)}
                      placeholder={PM_FIELD_PLACEHOLDERS[field.key]?.memorial || 'Transcrição no memorial...'}
                      className={`h-9 text-xs font-mono font-medium bg-background ${
                        isErr ? 'border-rose-400 focus:border-rose-500' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Nota Explicativa / Justificativa Pericial de Divergência */}
                {evalRes.diffNote && (
                  <div className={`p-2.5 rounded-lg text-[11px] flex items-center gap-2 ${
                    isErr
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                  }`}>
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{evalRes.diffNote}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODO 2: GRADE TÉCNICA ANALÍTICA (TABELA TRADICIONAL OTIMIZADA) */}
      {viewMode === 'table' && (
        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-2.5 px-4 min-w-[200px]">Parâmetro Pericial</th>
                  <th className="py-2.5 px-4 min-w-[240px]">Planta Topográfica</th>
                  <th className="py-2.5 px-4 min-w-[240px]">Memorial Descritivo</th>
                  <th className="py-2.5 px-4 min-w-[200px]">Diagnóstico</th>
                  <th className="py-2.5 px-3 w-20 text-center">Sincronia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredRows.map(({ field, row, evalRes }) => {
                  const isErr = evalRes.status === 'err';
                  const isOk = evalRes.status === 'ok';

                  return (
                    <tr
                      key={field.key}
                      className={`hover:bg-muted/20 transition-colors ${
                        isErr ? 'bg-rose-500/5' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <span>{field.label}</span>
                          {field.isNumeric && (
                            <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.2 rounded">
                              numérico
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <Input
                          type="text"
                          value={row.planta || ''}
                          onChange={(e) => handleUpdateField(field.key, 'planta', e.target.value)}
                          placeholder={PM_FIELD_PLACEHOLDERS[field.key]?.planta || 'Planta...'}
                          className="h-8 text-xs font-mono bg-background"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <Input
                          type="text"
                          value={row.memorial || ''}
                          onChange={(e) => handleUpdateField(field.key, 'memorial', e.target.value)}
                          placeholder={PM_FIELD_PLACEHOLDERS[field.key]?.memorial || 'Memorial...'}
                          className="h-8 text-xs font-mono bg-background"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold border ${evalRes.badgeClass}`}
                        >
                          {evalRes.label}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => copyPlantaToMemorial(field.key)}
                            className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                            title="Planta ➔ Memorial"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => copyMemorialToPlanta(field.key)}
                            className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                            title="Memorial ➔ Planta"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
