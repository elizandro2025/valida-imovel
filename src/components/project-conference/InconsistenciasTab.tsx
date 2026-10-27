import React, { useState, useMemo } from 'react';
import {
  ProjectData,
  projectConferenceService,
  ConsolidatedIssue,
} from '@/services/projectConferenceService';
import {
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Filter,
  Search,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  FileText,
  Download,
  LayoutGrid,
  Table as TableIcon,
  Copy,
  Check,
  Tag,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InconsistenciasTabProps {
  data: ProjectData;
  onUpdate: (updater: (prev: ProjectData) => ProjectData) => void;
}

type ViewMode = 'cards' | 'table';

const DOC_OPTIONS = [
  'Planta',
  'Memorial descritivo',
  'Matrícula principal',
  'Matrículas dos confrontantes',
  'Documentos pessoais',
  'Contratos, procurações e anuências',
  'Responsabilidade técnica',
  'Outros documentos',
];

export const InconsistenciasTab: React.FC<InconsistenciasTabProps> = ({ data, onUpdate }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showManualModal, setShowManualModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrigem, setFilterOrigem] = useState<string>('all');
  const [filterTipo, setFilterTipo] = useState<'all' | 'div' | 'pend'>('all');
  const [filterDoc, setFilterDoc] = useState<string>('all');
  const [pageSize, setPageSize] = useState<number>(30);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Formulário de nova inconsistência manual
  const [manualForm, setManualForm] = useState({
    tipo: 'div' as 'div' | 'pend' | 'prov',
    docACorrigir: 'Memorial descritivo',
    pagina: '',
    local: '',
    erro: '',
    risco: 'Risco de nota devolutiva registral',
    prio: 'Alta' as 'Alta' | 'Média' | 'Baixa',
    prov: '',
  });

  const allIssues = useMemo(() => {
    return projectConferenceService.consolidateIssues(data);
  }, [data]);

  const automaticIssues = useMemo(() => {
    return allIssues.filter(
      i =>
        i.origem !== 'Apontamento Manual do Conferente' &&
        i.origem !== 'Conferência Automática por IA'
    );
  }, [allIssues]);

  const manualIssuesList = data.manualIssues || [];

  const filteredAuto = useMemo(() => {
    return automaticIssues.filter(item => {
      if (filterTipo === 'div' && item.tipo !== 'div') return false;
      if (filterTipo === 'pend' && item.tipo === 'div') return false;

      if (filterOrigem !== 'all') {
        if (filterOrigem === 'Checklist' && !item.origem.startsWith('Checklist')) return false;
        if (filterOrigem !== 'Checklist' && !item.origem.includes(filterOrigem)) return false;
      }

      if (filterDoc !== 'all' && item.docACorrigir !== filterDoc) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          item.origem.toLowerCase().includes(q) ||
          item.docACorrigir.toLowerCase().includes(q) ||
          item.local.toLowerCase().includes(q) ||
          item.erro.toLowerCase().includes(q) ||
          item.providencia.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [automaticIssues, filterTipo, filterOrigem, filterDoc, searchTerm]);

  const totalPages = pageSize === 0 ? 1 : Math.ceil(filteredAuto.length / pageSize) || 1;
  const displayedAuto = useMemo(() => {
    if (pageSize === 0) return filteredAuto;
    const start = (currentPage - 1) * pageSize;
    return filteredAuto.slice(start, start + pageSize);
  }, [filteredAuto, currentPage, pageSize]);

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.erro.trim()) {
      alert('Por favor, descreva a divergência constatada.');
      return;
    }

    const newIssue = {
      id: `manual-${Date.now()}`,
      tipo: manualForm.tipo,
      cat: 'Apontamento Manual do Conferente',
      docACorrigir: manualForm.docACorrigir,
      pagina: manualForm.pagina,
      local: manualForm.local,
      erro: manualForm.erro,
      risco: manualForm.risco,
      prio: manualForm.prio,
      prov: manualForm.prov,
      origem: 'manual' as const,
    };

    onUpdate(prev => ({
      ...prev,
      manualIssues: [...(prev.manualIssues || []), newIssue],
    }));

    setManualForm({
      tipo: 'div',
      docACorrigir: 'Memorial descritivo',
      pagina: '',
      local: '',
      erro: '',
      risco: 'Risco de nota devolutiva registral',
      prio: 'Alta',
      prov: '',
    });
    setShowManualModal(false);
  };

  const handleRemoveManual = (id: string) => {
    onUpdate(prev => ({
      ...prev,
      manualIssues: (prev.manualIssues || []).filter(i => i.id !== id),
    }));
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert('Falha ao copiar.');
    }
  };

  const totalDivergencias = allIssues.filter(i => i.tipo === 'div').length;
  const totalPendencias = allIssues.filter(i => i.tipo !== 'div').length;

  return (
    <div className="space-y-6">
      {/* Header & Gestão de Pendências */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Diferenças e Pendências Encontradas
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
              Lista consolidada de todas as diferenças de medidas, confrontantes divergentes e requisitos pendentes encontrados na conferência técnica.
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
              onClick={() => setShowManualModal(true)}
              className="text-xs gap-1.5 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Pendência
            </Button>
          </div>
        </div>


        {/* HUD Quantitativo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/50">
          <div className="bg-background/80 border border-border/60 rounded-xl p-3">
            <span className="text-[11px] text-muted-foreground font-medium block">Total Consolidado</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-foreground">{allIssues.length}</span>
              <span className="text-xs text-muted-foreground">apontamentos</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Em todo o processo</span>
          </div>

          <div className="bg-background/80 border border-border/60 rounded-xl p-3">
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block">Divergências Críticas</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">{totalDivergencias}</span>
              <span className="text-xs text-muted-foreground">bloqueantes</span>
            </div>
            <span className="text-[10px] text-rose-500 font-medium">Nota Devolutiva iminente</span>
          </div>

          <div className="bg-background/80 border border-border/60 rounded-xl p-3">
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">Pendências Sanáveis</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">{totalPendencias}</span>
              <span className="text-xs text-muted-foreground">diligências</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Ausência de documentos</span>
          </div>

          <div className="bg-background/80 border border-border/60 rounded-xl p-3">
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold block">Apontamentos Manuais</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{manualIssuesList.length}</span>
              <span className="text-xs text-muted-foreground">periciais</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Inseridos pelo auditor</span>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar apontamento, matrícula de SP (ex: 114.892), confrontante, vértice..."
              className="h-8 pl-8 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Tipo:
            </span>
            <button
              onClick={() => {
                setFilterTipo('all');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                filterTipo === 'all'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:border-border'
              }`}
            >
              Todos ({allIssues.length})
            </button>
            <button
              onClick={() => {
                setFilterTipo('div');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                filterTipo === 'div'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:border-rose-500/40'
              }`}
            >
              Divergências ({totalDivergencias})
            </button>
            <button
              onClick={() => {
                setFilterTipo('pend');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                filterTipo === 'pend'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:border-amber-500/40'
              }`}
            >
              Pendências ({totalPendencias})
            </button>
          </div>
        </div>
      </div>

      {/* APONTAMENTOS MANUAIS DO AUDITOR (SE HOUVER) */}
      {manualIssuesList.length > 0 && (
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Apontamentos Manuais Registrados ({manualIssuesList.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {manualIssuesList.map(item => (
              <div
                key={item.id}
                className="bg-background border border-border/70 rounded-xl p-3.5 space-y-2 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                      Manual
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {item.docACorrigir}
                    </span>
                    {item.local && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {item.local}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveManual(item.id)}
                    className="text-muted-foreground hover:text-rose-600 transition-colors p-1"
                    title="Excluir apontamento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-foreground font-semibold leading-relaxed">
                  {item.erro}
                </p>

                {item.prov && (
                  <div className="p-2 rounded bg-muted/40 border border-border/40 text-[11px] text-muted-foreground space-y-0.5">
                    <span className="font-bold text-foreground block">Conduta Requerida:</span>
                    <span>{item.prov}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODO 1: PAINEL DE RISCOS (CARDS LINEAR STREAM) */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          {displayedAuto.length === 0 ? (
            <div className="bg-card border border-border/80 rounded-2xl p-10 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">
                Nenhum apontamento ou inconsistência para os filtros selecionados.
              </p>
            </div>
          ) : (
            displayedAuto.map((iss, idx) => {
              const globalIdx = pageSize === 0 ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
              const isDiv = iss.tipo === 'div';
              const cardId = `auto-card-${globalIdx}`;

              return (
                <div
                  key={idx}
                  className={`bg-card border rounded-2xl p-4 sm:p-5 shadow-sm transition-all space-y-3 ${
                    isDiv
                      ? 'border-l-4 border-l-rose-500 border-border/80'
                      : 'border-l-4 border-l-amber-500 border-border/80'
                  }`}
                >
                  {/* Top Bar do Card de Risco */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        #{globalIdx}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                          isDiv
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {isDiv ? <XCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{isDiv ? 'Divergência Notarial' : 'Pendência de Documento'}</span>
                      </span>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        Origem: {iss.origem}
                      </span>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        Peça: {iss.docACorrigir || iss.categoria}
                      </span>

                      {iss.local && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                          Local: {iss.local}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          iss.prioridade === 'Alta'
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                            : iss.prioridade === 'Média'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            : 'bg-slate-500/15 text-slate-700 dark:text-slate-400'
                        }`}
                      >
                        Gravidade {iss.prioridade}
                      </span>
                    </div>
                  </div>

                  {/* Discrepância Apurada */}
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">
                      Discrepância / Inconsistência Constatada:
                    </span>
                    <p className="text-xs text-foreground font-semibold leading-relaxed">
                      {iss.erro}
                    </p>
                  </div>

                  {/* Conduta Recomendada / Saneadora com Botão de Cópia */}
                  <div className="bg-muted/40 border border-border/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-foreground/80 uppercase tracking-wide block">
                        Conduta Técnica & Notarial Sugerida para o Laudo:
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {iss.providencia}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(iss.providencia, cardId)}
                      className="text-xs h-7 gap-1.5 shrink-0 border-border/70 hover:bg-background font-medium"
                    >
                      {copiedId === cardId ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 font-semibold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-muted-foreground" />
                          <span>Copiar Conduta</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODO 2: GRADE TABULAR */}
      {viewMode === 'table' && (
        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 w-36">Origem</th>
                  <th className="py-2.5 px-3 w-28">Tipo</th>
                  <th className="py-2.5 px-3 w-40">Peça Sujeita a Ajuste</th>
                  <th className="py-2.5 px-3 w-28">Local</th>
                  <th className="py-2.5 px-3 min-w-[280px]">Discrepância</th>
                  <th className="py-2.5 px-3 w-20 text-center">Gravidade</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Providência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {displayedAuto.map((iss, idx) => {
                  const globalIdx = pageSize === 0 ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-3 text-center text-muted-foreground font-mono font-medium">
                        {globalIdx}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-foreground">{iss.origem}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            iss.tipo === 'div'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {iss.tipo === 'div' ? '❌ Divergência' : '⚠ Pendência'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-foreground font-medium">{iss.docACorrigir || iss.categoria}</td>
                      <td className="py-2.5 px-3 font-mono text-xs">{iss.local}</td>
                      <td className="py-2.5 px-3 text-foreground leading-relaxed">{iss.erro}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            iss.prioridade === 'Alta'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                              : iss.prioridade === 'Média'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                              : 'bg-slate-500/15 text-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {iss.prioridade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{iss.providencia}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginação */}
      {pageSize > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <div>
            Mostrando {displayedAuto.length} de {filteredAuto.length} itens (Página {currentPage} de {totalPages})
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="h-7 w-7 p-0 text-xs"
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal / Diálogo de Inconsistência Manual */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Registrar Apontamento Pericial Manual
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManual} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Classificação:</label>
                  <select
                    value={manualForm.tipo}
                    onChange={e => setManualForm({ ...manualForm, tipo: e.target.value as any })}
                    className="w-full h-8 px-2.5 rounded-lg border border-input bg-background font-medium"
                  >
                    <option value="div">❌ Divergência Notarial</option>
                    <option value="pend">⚠ Pendência Formal</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Gravidade:</label>
                  <select
                    value={manualForm.prio}
                    onChange={e => setManualForm({ ...manualForm, prio: e.target.value as any })}
                    className="w-full h-8 px-2.5 rounded-lg border border-input bg-background font-medium"
                  >
                    <option value="Alta">Alta (Impugnação Registral)</option>
                    <option value="Média">Média (Diligência Sanável)</option>
                    <option value="Baixa">Baixa (Ajuste Formal)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Documento a Corrigir:</label>
                  <select
                    value={manualForm.docACorrigir}
                    onChange={e => setManualForm({ ...manualForm, docACorrigir: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-input bg-background font-medium"
                  >
                    {DOC_OPTIONS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-medium block">Vértice / Página:</label>
                  <Input
                    type="text"
                    value={manualForm.local}
                    onChange={e => setManualForm({ ...manualForm, local: e.target.value })}
                    placeholder="Ex: Fls. 02, V02–V04 (Divisa Leste)"
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium block">
                  Descrição Detalhada do Erro / Divergência:
                </label>
                <textarea
                  value={manualForm.erro}
                  onChange={e => setManualForm({ ...manualForm, erro: e.target.value })}
                  placeholder="Ex: Divergência entre Planta e Memorial: Matrícula 114.893 (14º RI de SP) consta cônjuge Sandra Helena mas falta termo de anuência..."
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium block">
                  Conduta Corretiva / Diligência Requerida:
                </label>
                <Input
                  type="text"
                  value={manualForm.prov}
                  onChange={e => setManualForm({ ...manualForm, prov: e.target.value })}
                  placeholder="Ex: Apresentar aditamento com firma reconhecida no 14º Tabelião de SP ou notificação pelo Oficial do RI (art. 213, §2º LRP)..."
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualModal(false)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="text-xs gap-1.5 font-semibold">
                  <Plus className="w-3.5 h-3.5" />
                  Salvar Apontamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
