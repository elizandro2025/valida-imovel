import React, { useState, useMemo } from 'react';
import { ProjectData, requiresNeighborTitles } from '@/services/projectConferenceService';
import {
  NeighborRow,
  nominalDiffService,
} from '@/services/nominalDiffService';
import {
  Plus,
  Copy,
  Trash2,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  HelpCircle,
  LayoutGrid,
  Table as TableIcon,
  Compass,
  FileSpreadsheet,
  FileCheck,
  Building,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ConfrontantesTabProps {
  data: ProjectData;
  onUpdate: (updater: (prev: ProjectData) => ProjectData) => void;
}

type ViewMode = 'cards' | 'table';

const NATUREZA_OPTIONS = [
  { value: 'imovel', label: 'Imóvel registrado' },
  { value: 'via', label: 'Via pública' },
  { value: 'agua', label: 'Curso d’água / Rio' },
  { value: 'faixa', label: 'Faixa de domínio' },
  { value: 'posse', label: 'Área de posse' },
  { value: 'outro', label: 'Outro' },
];

export const ConfrontantesTab: React.FC<ConfrontantesTabProps> = ({ data, onUpdate }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const stats = useMemo(() => nominalDiffService.calculateStats(data.neighbors), [data.neighbors]);
  const secondPassAlerts = useMemo(
    () => nominalDiffService.runSecondPass(data.neighbors, { requireNeighborTitles: requiresNeighborTitles(data.info.procedimentos) }),
    [data.neighbors, data.info.procedimentos]
  );
  const petitionText = useMemo(
    () => nominalDiffService.generateRegistryPetition(data.neighbors),
    [data.neighbors]
  );

  const handleAddRow = () => {
    const newRow: NeighborRow = {
      id: `conf-${Date.now()}`,
      trecho: '',
      vertices: '',
      lado: '',
      tipo: 'imovel',
      planta: '',
      quadro: '',
      memTexto: '',
      memTabela: '',
      matPrinc: '',
      matConf: '',
      matNum: '',
      assin: '',
      doc: '',
      obs: '',
    };
    onUpdate(prev => ({ ...prev, neighbors: [...prev.neighbors, newRow] }));
  };

  const handleDuplicateRow = (idx: number) => {
    onUpdate(prev => {
      const target = prev.neighbors[idx];
      const dup: NeighborRow = {
        ...target,
        id: `conf-${Date.now()}`,
        trecho: '',
        vertices: '',
      };
      const updated = [...prev.neighbors];
      updated.splice(idx + 1, 0, dup);
      return { ...prev, neighbors: updated };
    });
  };

  const handleRemoveRow = (id: string) => {
    onUpdate(prev => ({
      ...prev,
      neighbors: prev.neighbors.filter(n => n.id !== id),
    }));
  };

  const handleUpdateField = (id: string, field: keyof NeighborRow, value: string) => {
    onUpdate(prev => ({
      ...prev,
      neighbors: prev.neighbors.map(n => (n.id === id ? { ...n, [field]: value } : n)),
    }));
  };

  const copyPetition = async () => {
    try {
      await navigator.clipboard.writeText(petitionText);
      alert('Texto do pedido de certidões copiado para a área de transferência.');
    } catch {
      alert('Não foi possível copiar.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Estatísticas de Divisas */}
      {/* Header & HUD de Gestão de Vizinhos */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Vizinhos e Divisas Limítrofes
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
              Conferência dos confrontantes em cada segmento do terreno. Cruza a planta, o memorial e as matrículas para garantir que as assinaturas e qualificações estejam 100% corretas.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Seletor de Modo */}
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
              size="sm"
              onClick={handleAddRow}
              className="text-xs gap-1.5 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Vizinho
            </Button>
          </div>
        </div>


        {/* HUD Quantitativo de Confinantes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/50">
          <div className="bg-background/80 border border-border/60 rounded-xl p-3">
            <span className="text-[11px] text-muted-foreground font-medium block">Total de Segmentos</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-foreground">{stats.totalTrechos}</span>
              <span className="text-xs text-muted-foreground">divisas</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Cadastradas no perímetro</span>
          </div>

          <div className="bg-background/80 border border-border/60 rounded-xl p-3">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">Concordância 7D</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{stats.countOk}</span>
              <span className="text-xs text-muted-foreground">congruentes</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Sem discrepâncias</span>
          </div>

          <div className="bg-background/80 border border-border/60 rounded-xl p-3">
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block">Divergências Nominais</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">{stats.countErr}</span>
              <span className="text-xs text-muted-foreground">em alerta</span>
            </div>
            <span className="text-[10px] text-rose-500 font-medium">Nomes ou grafias divergentes</span>
          </div>

          <div className="bg-background/80 border border-border/60 rounded-xl p-3">
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">Pendências de Anuência</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">{stats.countWarn}</span>
              <span className="text-xs text-muted-foreground">a coletar</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Assinatura ou notificação</span>
          </div>
        </div>
      </div>

      {/* MODO 1: CARTÕES DE DIVISAS (MODERNO E ESTRUTURADO) */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {data.neighbors.length === 0 ? (
            <div className="bg-card border border-dashed border-border/80 rounded-2xl p-10 text-center space-y-3">
              <Users className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">
                Nenhuma divisa ou confrontante cadastrado.
              </p>
              <Button size="sm" onClick={handleAddRow} className="text-xs gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Adicionar Primeira Divisa
              </Button>
            </div>
          ) : (
            data.neighbors.map((row, idx) => {
              const evalRes = nominalDiffService.compareRow(row, data.neighbors);
              const isErr = evalRes.level === 'err';
              const isOk = evalRes.level === 'ok';
              const evalLabel = isOk ? 'Congruente 7D' : isErr ? 'Divergência Nominal' : 'Pendente de Certidão';

              return (
                <div
                  key={row.id}
                  className={`bg-card border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-all ${
                    isErr
                      ? 'border-rose-500/30 bg-rose-500/[0.02]'
                      : 'border-border/80 bg-card hover:border-border'
                  }`}
                >
                  {/* Top Bar do Cartão de Divisa */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <Input
                        type="text"
                        value={row.trecho}
                        onChange={(e) => handleUpdateField(row.id, 'trecho', e.target.value)}
                        placeholder="Ex: V01 ➔ V02 (Frente)"
                        className="h-7 w-40 text-xs font-mono font-bold bg-background"
                      />
                      <Input
                        type="text"
                        value={row.lado}
                        onChange={(e) => handleUpdateField(row.id, 'lado', e.target.value)}
                        placeholder="Ex: Face Sul"
                        className="h-7 w-28 text-xs bg-background"
                      />
                      <select
                        value={row.tipo}
                        onChange={(e) => handleUpdateField(row.id, 'tipo', e.target.value)}
                        className="h-7 text-xs px-2 rounded-lg border border-input bg-background font-medium cursor-pointer"
                      >
                        {NATUREZA_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          isOk
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                            : isErr
                            ? 'text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/30'
                            : 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/30'
                        }`}
                      >
                        {isOk && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isErr && <XCircle className="w-3.5 h-3.5" />}
                        <span>{evalLabel}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDuplicateRow(idx)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Duplicar esta divisa"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                        title="Excluir divisa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Grid 3 Pilares Probatórios */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Pilar 1: Peças Técnicas do Imóvel Auditado */}
                    <div className="bg-background border border-border/60 rounded-xl p-3 space-y-2">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-blue-500" />
                        1. Peças Técnicas Auditadas
                      </span>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-medium block">
                          Indicação na Planta Topográfica:
                        </label>
                        <Input
                          type="text"
                          value={row.planta}
                          onChange={(e) => handleUpdateField(row.id, 'planta', e.target.value)}
                          placeholder="Ex: Rua Oscar Freire (Domínio Público PMSP)"
                          className="h-7 text-xs bg-card"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-medium block">
                          Memorial Descritivo (Texto Perimétrico):
                        </label>
                        <Input
                          type="text"
                          value={row.memTexto}
                          onChange={(e) => handleUpdateField(row.id, 'memTexto', e.target.value)}
                          placeholder="Ex: Rua Oscar Freire, confrontando com o leito viário..."
                          className="h-7 text-xs bg-card"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-medium block">
                          Tabela de Vértices do Memorial:
                        </label>
                        <Input
                          type="text"
                          value={row.memTabela}
                          onChange={(e) => handleUpdateField(row.id, 'memTabela', e.target.value)}
                          placeholder="Ex: Rua Oscar Freire"
                          className="h-7 text-xs bg-card"
                        />
                      </div>
                    </div>

                    {/* Pilar 2: Origem Tabular do Imóvel Confinante */}
                    <div className="bg-background border border-border/60 rounded-xl p-3 space-y-2">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-indigo-500" />
                        2. Origem Registral Confinante
                      </span>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-medium block">
                          Nº da Matrícula / Transcrição Vizinha:
                        </label>
                        <Input
                          type="text"
                          value={row.matNum}
                          onChange={(e) => handleUpdateField(row.id, 'matNum', e.target.value)}
                          placeholder="Ex: Matrícula nº 114.893 (14º RI da Capital)"
                          className="h-7 text-xs font-mono bg-card"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-medium block">
                          Titular Tabular Registrado na Matrícula:
                        </label>
                        <Input
                          type="text"
                          value={row.matConf}
                          onChange={(e) => handleUpdateField(row.id, 'matConf', e.target.value)}
                          placeholder="Ex: Roberto Alencar de Oliveira e s/m Sandra Helena de Oliveira"
                          className="h-7 text-xs bg-card"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-medium block">
                          Matrícula Objeto (Título de Origem):
                        </label>
                        <Input
                          type="text"
                          value={row.matPrinc}
                          onChange={(e) => handleUpdateField(row.id, 'matPrinc', e.target.value)}
                          placeholder="Ex: Transcrição nº 45.678 (Livro 3 - Reg. Imóveis SP)"
                          className="h-7 text-xs bg-card"
                        />
                      </div>
                    </div>

                    {/* Pilar 3: Anuência & Regularidade Jurídica */}
                    <div className="bg-background border border-border/60 rounded-xl p-3 space-y-2">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                        3. Anuência & Documentação
                      </span>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-medium block">
                          Termo de Anuência Expressa:
                        </label>
                        <Input
                          type="text"
                          value={row.assin}
                          onChange={(e) => handleUpdateField(row.id, 'assin', e.target.value)}
                          placeholder="Ex: Assinado com firma reconhecida no 14º Tabelião de SP"
                          className="h-7 text-xs bg-card"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-medium block">
                          CPF / RG / Qualificação Civil:
                        </label>
                        <Input
                          type="text"
                          value={row.doc}
                          onChange={(e) => handleUpdateField(row.id, 'doc', e.target.value)}
                          placeholder="Ex: CPF 034.819.294-01 / RG 12.345.678-SP"
                          className="h-7 text-xs font-mono bg-card"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-medium block">
                          Observações Periciais:
                        </label>
                        <Input
                          type="text"
                          value={row.obs}
                          onChange={(e) => handleUpdateField(row.id, 'obs', e.target.value)}
                          placeholder="Ex: Exigir outorga uxória do cônjuge conforme NSCGJ-SP item 287"
                          className="h-7 text-xs bg-card"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alerta de Divergência Nominal Inteligente */}
                  {evalRes.issues.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-[11px] flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{evalRes.issues.map(i => i.message).join(' • ')}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODO 2: GRADE MATRICIAL (TABELA OTIMIZADA) */}
      {viewMode === 'table' && (
        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-10">#</th>
                  <th className="py-2.5 px-3 w-28">Segmento</th>
                  <th className="py-2.5 px-3 w-24">Face</th>
                  <th className="py-2.5 px-3 w-32">Regime</th>
                  <th className="py-2.5 px-3 min-w-[170px]">Planta</th>
                  <th className="py-2.5 px-3 min-w-[170px]">Memorial (Texto)</th>
                  <th className="py-2.5 px-3 min-w-[170px]">Memorial (Tabela)</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Titular Matrícula Vizinha</th>
                  <th className="py-2.5 px-3 w-28">Matrícula</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Anuência</th>
                  <th className="py-2.5 px-3 w-16 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data.neighbors.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2 px-3 text-muted-foreground font-mono">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <Input
                        type="text"
                        value={row.trecho}
                        onChange={(e) => handleUpdateField(row.id, 'trecho', e.target.value)}
                        placeholder="V01 ➔ V02"
                        className="h-7 text-xs font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="text"
                        value={row.lado}
                        onChange={(e) => handleUpdateField(row.id, 'lado', e.target.value)}
                        placeholder="Face"
                        className="h-7 text-xs"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={row.tipo}
                        onChange={(e) => handleUpdateField(row.id, 'tipo', e.target.value)}
                        className="h-7 text-xs px-2 rounded border border-input bg-background"
                      >
                        {NATUREZA_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="text"
                        value={row.planta}
                        onChange={(e) => handleUpdateField(row.id, 'planta', e.target.value)}
                        className="h-7 text-xs"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="text"
                        value={row.memTexto}
                        onChange={(e) => handleUpdateField(row.id, 'memTexto', e.target.value)}
                        className="h-7 text-xs"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="text"
                        value={row.memTabela}
                        onChange={(e) => handleUpdateField(row.id, 'memTabela', e.target.value)}
                        className="h-7 text-xs"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="text"
                        value={row.matConf}
                        onChange={(e) => handleUpdateField(row.id, 'matConf', e.target.value)}
                        className="h-7 text-xs"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="text"
                        value={row.matNum}
                        onChange={(e) => handleUpdateField(row.id, 'matNum', e.target.value)}
                        className="h-7 text-xs font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="text"
                        value={row.assin}
                        onChange={(e) => handleUpdateField(row.id, 'assin', e.target.value)}
                        className="h-7 text-xs"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(idx)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          className="p-1 text-muted-foreground hover:text-rose-600"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cruzamento Reverso & Requerimento de Certidões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alertas de Reciprocidade 2ª Passagem */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Auditoria de Reciprocidade (2ª Passagem Heurística)
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {secondPassAlerts.length} apontamentos
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Verificação de continuidade perimétrica: confrontantes cadastrados sem número de matrícula ou sem documento de anuência expressa.
          </p>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {secondPassAlerts.length === 0 ? (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold p-3 bg-emerald-500/10 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Todas as divisas possuem matrícula e anuência indicadas.
              </div>
            ) : (
              secondPassAlerts.map((alert, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs text-foreground flex items-start gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{alert}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Gerador de Requerimento de Certidões */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              Minuta de Requerimento de Certidões das Divisas
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={copyPetition}
              className="text-xs h-7 gap-1 border-border/80 hover:bg-muted font-medium"
            >
              <Copy className="w-3 h-3" />
              Copiar Minuta
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Texto pronto para peticionamento junto ao Ofício Imobiliário para solicitar as certidões das matrículas confinantes.
          </p>
          <pre className="p-3 bg-muted/40 rounded-xl text-[11px] font-mono text-muted-foreground whitespace-pre-wrap max-h-56 overflow-y-auto border border-border/50">
            {petitionText || 'Cadastre ao menos um confrontante com matrícula para gerar o requerimento.'}
          </pre>
        </div>
      </div>
    </div>
  );
};
