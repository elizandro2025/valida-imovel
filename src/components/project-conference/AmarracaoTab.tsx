import React, { useState } from 'react';
import { ProjectData } from '@/services/projectConferenceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Trash2,
  Wand2,
  Link2,
  ShieldAlert,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Compass,
  Building,
} from 'lucide-react';

interface AmarracaoTabProps {
  data: ProjectData;
  onUpdate: (updater: (prev: ProjectData) => ProjectData) => void;
}

type Amarracao = ProjectData['amarracoes'][number];
const STATUSES = ['', 'COMPATÍVEL', 'DIVERGENTE', 'NÃO VERIFICÁVEL'];
const PRIOS: Amarracao['prioridade'][] = ['Alta', 'Média', 'Baixa'];

let counter = 0;
const newRow = (patch: Partial<Amarracao> = {}): Amarracao => ({
  id: `am-${Date.now()}-${++counter}`,
  seg: '',
  mat: '',
  descObj: '',
  descConf: '',
  comp: '',
  status: '',
  prioridade: 'Média',
  providencia: '',
  critico: false,
  ...patch,
});

export const AmarracaoTab: React.FC<AmarracaoTabProps> = ({ data, onUpdate }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const rows = data.amarracoes;

  const setRow = (id: string, patch: Partial<Amarracao>) =>
    onUpdate(prev => ({
      ...prev,
      amarracoes: prev.amarracoes.map(r => (r.id === id ? { ...r, ...patch } : r)),
    }));

  const generate = () =>
    onUpdate(prev => {
      const existing = new Set(prev.amarracoes.map(r => `${r.seg}|${r.mat}`));
      const created = prev.neighbors
        .filter(n => !n.tipo || n.tipo === 'imovel')
        .map(n =>
          newRow({
            seg: [n.trecho, n.vertices ? `(${n.vertices})` : ''].filter(Boolean).join(' '),
            mat: n.matNum || '',
            descObj: [n.lado, n.memTexto || n.planta].filter(Boolean).join(': '),
            descConf: n.matConf ? `Titular na matrícula do confrontante: ${n.matConf}` : '',
            providencia: n.matNum ? '' : 'Apresentar certidão de inteiro teor da matrícula confinante.',
          })
        )
        .filter(r => !existing.has(`${r.seg}|${r.mat}`));
      return { ...prev, amarracoes: [...prev.amarracoes, ...created] };
    });

  const countCompativel = rows.filter(r => r.status === 'COMPATÍVEL').length;
  const countDivergente = rows.filter(r => r.status === 'DIVERGENTE').length;
  const countCritico = rows.filter(r => r.critico).length;

  return (
    <div className="space-y-6">
      {/* Header & HUD de Reciprocidade */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Link2 className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                Auditoria de Reciprocidade Tabular & Continuidade de Divisas
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
              Conferência pericial de espelhamento registral: confronto entre a descrição perimétrica do imóvel auditado e as transcrições das matrículas lindeiras.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Seletor de Modo */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cartões</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Grade</span>
              </button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={generate}
              className="text-xs h-8 gap-1.5 border-border/80 hover:bg-muted font-medium"
            >
              <Wand2 className="w-3.5 h-3.5 text-primary" />
              Sincronizar a Partir dos Confinantes
            </Button>
            <Button
              size="sm"
              onClick={() => onUpdate(p => ({ ...p, amarracoes: [...p.amarracoes, newRow()] }))}
              className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              + Nova Amarra
            </Button>
          </div>
        </div>

        {/* Métricas de Reciprocidade */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/50">
          <div className="bg-background/80 border border-border/60 rounded-xl p-3">
            <span className="text-[11px] text-muted-foreground font-medium block">Total de Amarras</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-foreground">{rows.length}</span>
              <span className="text-xs text-muted-foreground">divisas</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Limites cadastrados</span>
          </div>

          <div className="bg-background/80 border border-border/60 rounded-xl p-3">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">Compatíveis</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{countCompativel}</span>
              <span className="text-xs text-muted-foreground">espelhadas</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Divisas sem sobreposição</span>
          </div>

          <div className="bg-background/80 border border-border/60 rounded-xl p-3">
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block">Divergências</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">{countDivergente}</span>
              <span className="text-xs text-muted-foreground">em alerta</span>
            </div>
            <span className="text-[10px] text-rose-500 font-medium">Medidas não conferem</span>
          </div>

          <div className="bg-background/80 border border-border/60 rounded-xl p-3">
            <span className="text-[11px] text-destructive font-semibold block">Risco Crítico</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-destructive">{countCritico}</span>
              <span className="text-xs text-muted-foreground">bloqueantes</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Potencial invasão/lapso</span>
          </div>
        </div>
      </div>

      {/* MODO 1: CARTÕES DE RECIPROCIDADE */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {rows.length === 0 ? (
            <div className="bg-card border border-dashed border-border/80 rounded-2xl p-10 text-center space-y-3">
              <Link2 className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">
                Nenhuma amarra ou divisa perimétrica cadastrada.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button size="sm" variant="outline" onClick={generate} className="text-xs gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-primary" /> Sincronizar dos Confinantes
                </Button>
                <Button
                  size="sm"
                  onClick={() => onUpdate(p => ({ ...p, amarracoes: [...p.amarracoes, newRow()] }))}
                  className="text-xs gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Limite Manual
                </Button>
              </div>
            </div>
          ) : (
            rows.map((r, i) => {
              const isDiv = r.status === 'DIVERGENTE';
              const isComp = r.status === 'COMPATÍVEL';

              return (
                <div
                  key={r.id}
                  className={`bg-card border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-all ${
                    r.critico
                      ? 'border-destructive/40 bg-destructive/[0.02] ring-1 ring-destructive/20'
                      : isDiv
                      ? 'border-rose-500/30 bg-rose-500/[0.02]'
                      : 'border-border/80 bg-card hover:border-border'
                  }`}
                >
                  {/* Header do Cartão de Amarra */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        #{i + 1}
                      </span>
                      <Input
                        type="text"
                        value={r.seg}
                        onChange={e => setRow(r.id, { seg: e.target.value })}
                        placeholder="Ex: V01 ➔ V02 (Frente)"
                        className="h-7 w-40 text-xs font-mono font-bold bg-background"
                      />
                      <Input
                        type="text"
                        value={r.mat}
                        onChange={e => setRow(r.id, { mat: e.target.value })}
                        placeholder="Ex: 114.893 (14º RI Capital - SP)"
                        className="h-7 w-48 text-xs font-mono bg-background"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {STATUSES.filter(Boolean).map(st => {
                          const isStActive = r.status === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setRow(r.id, { status: st })}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                isStActive
                                  ? st === 'COMPATÍVEL'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : st === 'DIVERGENTE'
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'bg-indigo-600 text-white shadow-2xs'
                                  : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                              }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setRow(r.id, { critico: !r.critico })}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                          r.critico
                            ? 'bg-destructive/15 text-destructive border-destructive/30'
                            : 'bg-muted/40 text-muted-foreground border-transparent hover:border-border'
                        }`}
                        title="Marcar como risco crítico de invasão"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>Crítico</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdate(p => ({
                            ...p,
                            amarracoes: p.amarracoes.filter(x => x.id !== r.id),
                          }))
                        }
                        className="p-1 rounded text-muted-foreground hover:text-destructive"
                        title="Excluir amarra"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Confronto Lado a Lado de Textos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-background border border-border/60 rounded-xl p-3 space-y-1.5">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-blue-500" />
                        Teor na Peça Técnica Auditada (Planta / Memorial):
                      </span>
                      <textarea
                        rows={2}
                        value={r.descObj}
                        onChange={e => setRow(r.id, { descObj: e.target.value })}
                        placeholder="Ex: Frente com a Rua Oscar Freire por 37,24 m..."
                        className="w-full p-2 rounded-lg border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="bg-background border border-border/60 rounded-xl p-3 space-y-1.5">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-indigo-500" />
                        Teor na Matrícula / Registro do Confinante:
                      </span>
                      <textarea
                        rows={2}
                        value={r.descConf}
                        onChange={e => setRow(r.id, { descConf: e.target.value })}
                        placeholder="Ex: Matrícula confinante nº 114.893 (14º RI da Capital) indica divisa por 37,24 m..."
                        className="w-full p-2 rounded-lg border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Exame de Reciprocidade & Conduta Sanadora */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground/80 uppercase block">
                        Exame Pericial de Reciprocidade Tabular:
                      </label>
                      <textarea
                        rows={2}
                        value={r.comp}
                        onChange={e => setRow(r.id, { comp: e.target.value })}
                        placeholder="Ex: Coerência dimensional e azimutal perfeita dentro das normas da NSCGJ-SP..."
                        className="w-full p-2 rounded-lg border border-input bg-background text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground/80 uppercase block">
                        Conduta Sanadora Recomendada para o Laudo:
                      </label>
                      <textarea
                        rows={2}
                        value={r.providencia}
                        onChange={e => setRow(r.id, { providencia: e.target.value })}
                        placeholder="Ex: Obter termo de anuência com firma reconhecida no 14º Tabelião de SP ou notificação pelo Oficial do RI (art. 213, §2º LRP)..."
                        className="w-full p-2 rounded-lg border border-input bg-background text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODO 2: GRADE COMPARATIVA (TABELA) */}
      {viewMode === 'table' && (
        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/70 text-muted-foreground font-semibold">
                <tr>
                  <th className="p-2.5 w-10 text-center">#</th>
                  <th className="p-2.5 min-w-[130px]">Segmento</th>
                  <th className="p-2.5 min-w-[130px]">Matrícula</th>
                  <th className="p-2.5 min-w-[180px]">Peça Auditada</th>
                  <th className="p-2.5 min-w-[180px]">Matrícula Vizinha</th>
                  <th className="p-2.5 min-w-[180px]">Exame de Reciprocidade</th>
                  <th className="p-2.5 w-28">Juízo</th>
                  <th className="p-2.5 w-20 text-center">Crítico</th>
                  <th className="p-2.5 min-w-[180px]">Conduta Sanadora</th>
                  <th className="p-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r, i) => (
                  <tr key={r.id} className={r.status === 'DIVERGENTE' ? 'bg-destructive/5' : ''}>
                    <td className="p-2 text-center text-muted-foreground font-mono">{i + 1}</td>
                    <td className="p-2">
                      <Input
                        value={r.seg}
                        onChange={e => setRow(r.id, { seg: e.target.value })}
                        placeholder="V01 ➔ V02"
                        className="h-7 text-xs font-mono"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={r.mat}
                        onChange={e => setRow(r.id, { mat: e.target.value })}
                        placeholder="114.893 (14º RI SP)"
                        className="h-7 text-xs font-mono"
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        rows={2}
                        value={r.descObj}
                        onChange={e => setRow(r.id, { descObj: e.target.value })}
                        placeholder="Frente com Rua Oscar Freire por 37,24 m..."
                        className="w-full p-1.5 rounded border border-input text-xs bg-background"
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        rows={2}
                        value={r.descConf}
                        onChange={e => setRow(r.id, { descConf: e.target.value })}
                        placeholder="Matrícula confinante indica confrontação por 37,24 m..."
                        className="w-full p-1.5 rounded border border-input text-xs bg-background"
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        rows={2}
                        value={r.comp}
                        onChange={e => setRow(r.id, { comp: e.target.value })}
                        placeholder="Conforme NBR 17047 e NSCGJ-SP..."
                        className="w-full p-1.5 rounded border border-input text-xs bg-background"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={r.status}
                        onChange={e => setRow(r.id, { status: e.target.value })}
                        className="h-7 text-xs rounded border border-input bg-background"
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>
                            {s || '— selecione —'}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={!!r.critico}
                        onChange={e => setRow(r.id, { critico: e.target.checked })}
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        rows={2}
                        value={r.providencia}
                        onChange={e => setRow(r.id, { providencia: e.target.value })}
                        placeholder="Aditamento no 14º Tabelião de SP..."
                        className="w-full p-1.5 rounded border border-input text-xs bg-background"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdate(p => ({
                            ...p,
                            amarracoes: p.amarracoes.filter(x => x.id !== r.id),
                          }))
                        }
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
