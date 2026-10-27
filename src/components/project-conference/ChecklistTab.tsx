import React, { useState, useMemo } from 'react';
import { ProjectData } from '@/services/projectConferenceService';
import {
  PROCEDURE_CHECKLISTS,
  ChecklistStatus,
  ChecklistItem,
} from '@/services/projectChecklists';
import {
  CheckSquare,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MinusCircle,
  FileSearch,
  Tag,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChecklistTabProps {
  data: ProjectData;
  onUpdate: (updater: (prev: ProjectData) => ProjectData) => void;
  onNavigateToAi?: () => void;
}

const QUICK_EVIDENCE_CHIPS = [
  'Memorial Descritivo fls. 01–03 (NSCGJ-SP)',
  'Planta Escala 1:250 (NBR 17047)',
  'ART CREA-SP Quitada & Vinculada',
  'Certidão 14º RI da Capital (válida 30d)',
  'Alvará de Desdobro PMSP / SEHAB',
  'Ausente no Dossiê Probatório',
];

const QUICK_CORRECTION_CHIPS = [
  'Colher outorga uxória do confrontante no 14º Tabelião de SP',
  'Requerer notificação pessoal pelo Oficial do RI (art. 213, §2º LRP)',
  'Solicitar certidão vintenária atualizada no RI da Capital',
  'Retificar memorial descritivo adequando aos padrões da NSCGJ-SP',
  'Apresentar alvará urbanístico expedido pela PMSP',
];

const STATUS_BUTTONS: {
  status: ChecklistStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
  badgeClass: string;
}[] = [
  {
    status: 'CONFORME',
    label: 'Conforme',
    icon: CheckCircle2,
    activeClass: 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-700 font-semibold',
    badgeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    status: 'DIVERGENTE',
    label: 'Divergente',
    icon: XCircle,
    activeClass: 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-700 font-semibold',
    badgeClass: 'text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/30',
  },
  {
    status: 'PENDENTE',
    label: 'Pendência',
    icon: Clock,
    activeClass: 'bg-amber-600 text-white shadow-xs ring-1 ring-amber-700 font-semibold',
    badgeClass: 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/30',
  },
  {
    status: 'NÃO APLICÁVEL',
    label: 'Dispensado (N/A)',
    icon: MinusCircle,
    activeClass: 'bg-slate-700 text-white shadow-xs ring-1 ring-slate-800 font-semibold',
    badgeClass: 'text-slate-700 dark:text-slate-300 bg-slate-500/10 border-slate-500/30',
  },
  {
    status: 'NÃO VERIFICÁVEL',
    label: 'Não Verificável',
    icon: FileSearch,
    activeClass: 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-700 font-semibold',
    badgeClass: 'text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
  },
];

export const ChecklistTab: React.FC<ChecklistTabProps> = ({
  data,
  onUpdate,
  onNavigateToAi,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | ChecklistStatus>('TODOS');
  const [expandedHelp, setExpandedHelp] = useState<Record<string, boolean>>({});

  const toggleHelp = (id: string) => {
    setExpandedHelp(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeProcs = useMemo(() => {
    return PROCEDURE_CHECKLISTS.filter(p =>
      data.info.procedimentos.includes(p.key)
    );
  }, [data.info.procedimentos]);

  const handleUpdateAnswer = (
    procKey: string,
    itemId: string,
    field: 'status' | 'evidence' | 'correction',
    value: string
  ) => {
    onUpdate(prev => {
      const procAnswers = prev.checklists[procKey] || {};
      const currentAnswer = procAnswers[itemId] || {
        status: 'PENDENTE' as ChecklistStatus,
        evidence: '',
        correction: '',
      };

      return {
        ...prev,
        checklists: {
          ...prev.checklists,
          [procKey]: {
            ...procAnswers,
            [itemId]: {
              ...currentAnswer,
              [field]: value,
            },
          },
        },
      };
    });
  };

  const handleInsertEvidence = (procKey: string, itemId: string, text: string) => {
    const current = data.checklists[procKey]?.[itemId]?.evidence || '';
    const updated = current ? `${current} • ${text}` : text;
    handleUpdateAnswer(procKey, itemId, 'evidence', updated);
  };

  const handleInsertCorrection = (procKey: string, itemId: string, text: string) => {
    const current = data.checklists[procKey]?.[itemId]?.correction || '';
    const updated = current ? `${current}. ${text}` : text;
    handleUpdateAnswer(procKey, itemId, 'correction', updated);
  };

  const handleFillUnanswered = (procKey: string) => {
    const checklist = PROCEDURE_CHECKLISTS.find(c => c.key === procKey);
    if (!checklist) return;

    onUpdate(prev => {
      const procAnswers = { ...(prev.checklists[procKey] || {}) };
      checklist.items.forEach(item => {
        if (!procAnswers[item.id] || !procAnswers[item.id].status) {
          procAnswers[item.id] = {
            status: 'NÃO VERIFICÁVEL',
            evidence: 'Documento não apresentado para conferência na serventia.',
            correction: 'Apresentar documento hábil para averiguação pericial.',
          };
        }
      });

      return {
        ...prev,
        checklists: {
          ...prev.checklists,
          [procKey]: procAnswers,
        },
      };
    });
  };

  if (activeProcs.length === 0) {
    return (
      <div className="bg-card border border-border/80 rounded-2xl p-10 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          Nenhum Procedimento Registral Selecionado
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Para carregar os quesitos de conformidade notarial, acesse o{' '}
          <strong className="text-foreground">Dossiê do Procedimento</strong> e selecione ao menos um procedimento:
          Estremação, Retificação de Área, Desdobro, Divisão, REURB ou Unificação.
        </p>
      </div>
    );
  }

  // Estatísticas Globais
  let totalAuditItems = 0;
  let totalAnswered = 0;
  let totalConforme = 0;
  let totalDivergente = 0;
  let totalPendente = 0;

  activeProcs.forEach(p => {
    const answers = data.checklists[p.key] || {};
    p.items.forEach(it => {
      totalAuditItems += 1;
      const status = answers[it.id]?.status;
      if (status) totalAnswered += 1;
      if (status === 'CONFORME') totalConforme += 1;
      if (status === 'DIVERGENTE') totalDivergente += 1;
      if (status === 'PENDENTE') totalPendente += 1;
    });
  });

  const progressPercent = totalAuditItems > 0 ? Math.round((totalAnswered / totalAuditItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* HUD Executivo de Auditoria */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Checklist de Requisitos da Lei e Cartório
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              Conferência dos requisitos formais e legais para registro de imóveis (Lei 6.015/73 e provimentos do CNJ). Os itens conferidos alimentam diretamente o laudo e resultado final.
            </p>
          </div>

          {onNavigateToAi && (
            <Button
              onClick={onNavigateToAi}
              className="gap-2 shrink-0 font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              Preenchimento com IA
            </Button>
          )}
        </div>

        {/* Barra de Progresso e Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
          <div className="bg-secondary/60 border border-border rounded-xl p-3">
            <span className="text-xs text-muted-foreground font-medium block">Progresso do Checklist</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-foreground">{progressPercent}%</span>
              <span className="text-xs text-muted-foreground">({totalAnswered}/{totalAuditItems} quesitos)</span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-secondary/60 border border-border rounded-xl p-3">
            <span className="text-xs text-success font-semibold block">Conformes</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-success">{totalConforme}</span>
              <span className="text-xs text-muted-foreground">validados</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Documentação regular</span>
          </div>

          <div className="bg-secondary/60 border border-border rounded-xl p-3">
            <span className="text-xs text-destructive font-semibold block">Divergências</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-destructive">{totalDivergente}</span>
              <span className="text-xs text-muted-foreground">reprovados</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Exigem correção</span>
          </div>

          <div className="bg-secondary/60 border border-border rounded-xl p-3">
            <span className="text-xs text-warning font-semibold block">Pendências</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-warning">{totalPendente}</span>
              <span className="text-xs text-muted-foreground">a sanar</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Aguardando certidão/peça</span>
          </div>
        </div>


        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filtrar quesito por palavra-chave ou artigo..."
              className="h-8 pl-8 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Juízo:
            </span>
            <button
              onClick={() => setStatusFilter('TODOS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === 'TODOS'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:border-border'
              }`}
            >
              Todos ({totalAuditItems})
            </button>
            <button
              onClick={() => setStatusFilter('DIVERGENTE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === 'DIVERGENTE'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:border-rose-500/40'
              }`}
            >
              Divergências ({totalDivergente})
            </button>
            <button
              onClick={() => setStatusFilter('PENDENTE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === 'PENDENTE'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:border-amber-500/40'
              }`}
            >
              Pendências ({totalPendente})
            </button>
            <button
              onClick={() => setStatusFilter('CONFORME')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === 'CONFORME'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40'
              }`}
            >
              Conformes ({totalConforme})
            </button>
          </div>
        </div>
      </div>

      {/* Procedimentos Ativos e seus Quesitos */}
      {activeProcs.map(proc => {
        const procAnswers = data.checklists[proc.key] || {};
        const totalItems = proc.items.length;
        const answeredCount = proc.items.filter(it => Boolean(procAnswers[it.id]?.status)).length;

        const filteredItems = proc.items.filter(item => {
          const ans = procAnswers[item.id];
          const matchesStatus =
            statusFilter === 'TODOS' ||
            (statusFilter === ans?.status);

          const matchesSearch =
            !searchTerm ||
            item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.help && item.help.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.originalLabel && item.originalLabel.toLowerCase().includes(searchTerm.toLowerCase())) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase());

          return matchesStatus && matchesSearch;
        });

        return (
          <div
            key={proc.key}
            className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
          >
            {/* Cabeçalho do Procedimento */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-foreground">
                    Quesitos Técnicos: {proc.name}
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {answeredCount}/{totalItems} auditados
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{proc.description}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFillUnanswered(proc.key)}
                className="text-xs h-8 gap-1.5 border-border/80 hover:bg-muted font-medium shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Marcar Restantes como Não Verificáveis
              </Button>
            </div>

            {/* Lista dos Quesitos */}
            <div className="space-y-3.5">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs bg-muted/10 rounded-xl border border-dashed border-border/60">
                  Nenhum quesito encontrado para os filtros selecionados.
                </div>
              ) : (
                filteredItems.map(item => {
                  const ans = procAnswers[item.id] || {
                    status: '' as ChecklistStatus,
                    evidence: '',
                    correction: '',
                  };

                  const isExpanded = Boolean(expandedHelp[item.id]);
                  const isDivergente = ans.status === 'DIVERGENTE';
                  const isPendente = ans.status === 'PENDENTE';
                  const isConforme = ans.status === 'CONFORME';

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        isConforme
                          ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                          : isDivergente
                          ? 'border-rose-500/30 bg-rose-500/[0.03]'
                          : isPendente
                          ? 'border-amber-500/30 bg-amber-500/[0.02]'
                          : ans.status
                          ? 'border-border/80 bg-muted/10'
                          : 'border-border/60 bg-background hover:border-border'
                      }`}
                    >
                      {/* Top Bar do Quesito */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black tracking-wider text-primary font-mono uppercase bg-primary/10 px-2 py-0.5 rounded">
                            {(item.originalLabel || item.id).replace(/ITEM\s*/i, 'QUESITO ')}
                          </span>
                          {item.category && (
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider bg-muted/60 px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>

                        {item.help && (
                          <button
                            type="button"
                            onClick={() => toggleHelp(item.id)}
                            className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-primary/70" />
                            <span>{isExpanded ? 'Ocultar Norma' : 'Ver Norma'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Texto da Questão Pericial */}
                      <p className="text-xs text-foreground font-semibold leading-relaxed">
                        {item.text}
                      </p>

                      {/* Caixa expansível de orientações normativas */}
                      {item.help && isExpanded && (
                        <div className="bg-muted/40 border border-border/50 rounded-lg p-3 text-[11px] text-muted-foreground space-y-1 animate-in fade-in-50 duration-150">
                          <div className="font-semibold text-foreground/80 mb-1 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                            Fundamentação Técnica e Normativa:
                          </div>
                          {item.help.split('\n').map((line, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="text-primary shrink-0 font-bold">•</span>
                              <span>{line.trim()}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Segmented Control de Status de 1 Clique */}
                      <div className="pt-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1.5">
                          Juízo Notarial Conclusivo:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {STATUS_BUTTONS.map(btn => {
                            const isSelected = ans.status === btn.status;
                            const BtnIcon = btn.icon;

                            return (
                              <button
                                key={btn.status}
                                type="button"
                                onClick={() =>
                                  handleUpdateAnswer(
                                    proc.key,
                                    item.id,
                                    'status',
                                    btn.status
                                  )
                                }
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                                  isSelected
                                    ? btn.activeClass
                                    : 'bg-background hover:bg-muted text-muted-foreground border border-input'
                                }`}
                              >
                                <BtnIcon className="w-3.5 h-3.5" />
                                <span>{btn.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Campo de Evidência Probatória com Chips Rápidos */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground font-medium flex items-center gap-1">
                            <Tag className="w-3 h-3 text-primary/70" />
                            Fundamentação & Peça Probatória:
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Clique nos chips para preenchimento rápido
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {QUICK_EVIDENCE_CHIPS.map(chip => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => handleInsertEvidence(proc.key, item.id, chip)}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground border border-border/40 transition-colors"
                            >
                              + {chip}
                            </button>
                          ))}
                        </div>

                        <Input
                          type="text"
                          value={ans.evidence}
                          onChange={e =>
                            handleUpdateAnswer(proc.key, item.id, 'evidence', e.target.value)
                          }
                          placeholder="Ex: Certidão 14º RI da Capital, Alvará PMSP nº 1.429/2026, Memorial fls. 02, ART CREA-SP..."
                          className="h-8 text-xs bg-background"
                        />
                      </div>

                      {/* Plano de Saneamento / Diligência (Aparece em Divergências e Pendências) */}
                      {(isDivergente || isPendente) && (
                        <div className={`p-3 rounded-lg border space-y-2 animate-in fade-in-50 duration-150 ${
                          isDivergente
                            ? 'bg-rose-500/10 border-rose-500/20'
                            : 'bg-amber-500/10 border-amber-500/20'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                              isDivergente ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              <AlertCircle className="w-3.5 h-3.5" />
                              {isDivergente
                                ? 'Conduta Retificadora Obrigatória (Evitar Nota Devolutiva):'
                                : 'Diligência Requerida para Conclusão do Registro:'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Inserção automática no Laudo
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {QUICK_CORRECTION_CHIPS.map(chip => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => handleInsertCorrection(proc.key, item.id, chip)}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-background/80 hover:bg-background text-foreground/80 border border-border/60 transition-colors"
                              >
                                + {chip}
                              </button>
                            ))}
                          </div>

                          <Input
                            type="text"
                            value={ans.correction || ''}
                            onChange={e =>
                              handleUpdateAnswer(proc.key, item.id, 'correction', e.target.value)
                            }
                            placeholder="Ex: Colher aditamento com firma reconhecida no 14º Tabelião de SP ou notificação pelo Oficial do 14º RI..."
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
