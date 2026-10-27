import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, ClipboardList, Compass, Download, FileSearch, Info, Loader2, MessageSquare, Ruler,
  Send, ShieldCheck, Upload, Users, XCircle,
} from 'lucide-react';
import { ProjectData, exportToWord } from '@/services/projectConferenceService';
import { askAboutProject } from '@/services/projectAiService';
import { buildProjectSummary } from '@/services/projectSummary';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { WorkspaceTab } from './ProjectConferenceWorkspace';

interface ProjectResultSummaryProps {
  data: ProjectData;
  // Abre o passo a passo na aba indicada (revisar e editar em detalhes)
  onOpenDetails: (tab: WorkspaceTab) => void;
  // Volta à tela de envio para mandar mais documentos e conferir de novo
  onSendMore: () => void;
}

const fmt = (value: number, digits = 2) => value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const TONE = {
  ok: { icon: ShieldCheck, box: 'bg-success/10 text-success', badge: 'border-success/30 bg-success/10 text-success' },
  warn: { icon: AlertTriangle, box: 'bg-warning/10 text-warning', badge: 'border-warning/30 bg-warning/10 text-warning' },
  bad: { icon: XCircle, box: 'bg-destructive/10 text-destructive', badge: 'border-destructive/30 bg-destructive/10 text-destructive' },
};

const ITEM = {
  div: { icon: XCircle, color: 'text-destructive', label: 'Corrigir' },
  pend: { icon: AlertTriangle, color: 'text-warning', label: 'Pendente' },
  prov: { icon: Info, color: 'text-primary', label: 'Providência' },
};

/**
 * Resultado da conferência de projeto, no mesmo formato do relatório da matrícula: veredito em palavras simples,
 * o que foi recebido, medidas, o que precisa de atenção (com o que fazer) e próximos passos. Os detalhes completos
 * (todas as abas) continuam no passo a passo.
 */
export const ProjectResultSummary: React.FC<ProjectResultSummaryProps> = ({ data, onOpenDetails, onSendMore }) => {
  const { user } = useAuth();
  const summary = buildProjectSummary(data);
  const tone = TONE[summary.tone];
  const ToneIcon = tone.icon;
  const [showAll, setShowAll] = useState(false);
  const visibleAttention = showAll ? summary.attention : summary.attention.slice(0, 6);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<{ q: string; a: string } | null>(null);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const ask = async () => {
    const q = question.trim();
    if (!q || asking) return;
    setAsking(true);
    setAskError(null);
    try {
      setAnswer({ q, a: await askAboutProject(q, data) });
      setQuestion('');
    } catch (e) {
      setAskError(e instanceof Error && e.message ? e.message : 'Não foi possível responder agora. Tente novamente.');
    } finally {
      setAsking(false);
    }
  };

  const m = summary.measures;

  return (
    <div className="space-y-6">
      {/* Veredito */}
      <Card className="border-0 ring-1 ring-black/5 shadow-medium rounded-3xl bg-card text-foreground">
        <CardContent className="p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${tone.box}`}>
              <ToneIcon className="w-7 h-7" />
            </div>
            <div className="space-y-2 min-w-0">
              <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border ${tone.badge}`}>{summary.opinion}</span>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{summary.headline}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{summary.explanation}</p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-semibold">{summary.divergencias} para corrigir</span>
                <span className="px-2.5 py-1 rounded-full bg-warning/10 text-warning font-semibold">{summary.pendencias} pendência(s)</span>
                {data.info.nome && <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground truncate max-w-full">{data.info.nome}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button onClick={() => exportToWord(data)} className="gap-1.5"><Download className="w-4 h-4" /> Exportar relatório (Word)</Button>
            <Button variant="outline" onClick={() => onOpenDetails('parecer')} className="gap-1.5"><FileSearch className="w-4 h-4" /> Revisar em detalhes</Button>
            <Button variant="outline" onClick={onSendMore} className="gap-1.5"><Upload className="w-4 h-4" /> Enviar mais documentos</Button>
          </div>
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            Conferência automatizada a partir dos documentos enviados. Não substitui a validação do responsável técnico nem a
            análise do Oficial de Registro de Imóveis. Este resultado não fica salvo: exporte o relatório para guardar.
          </p>
        </CardContent>
      </Card>

      {/* O que recebemos · Medidas · Vizinhos */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 ring-1 ring-black/5 shadow-soft rounded-3xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><ClipboardList className="w-4 h-4 text-primary" /> O que recebemos</h3>
            {summary.received.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum documento lido ainda.</p>
            ) : (
              <ul className="space-y-1.5 text-xs">
                {summary.received.map(r => (
                  <li key={r.name} className="flex items-start gap-1.5">
                    {r.legivel ? <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />}
                    <span className="min-w-0"><span className="font-medium text-foreground">{r.tipo}</span> · <span className="text-muted-foreground break-all">{r.name}</span>
                      {!r.legivel && <span className="text-warning"> (pouco texto legível)</span>}</span>
                  </li>
                ))}
              </ul>
            )}
            {summary.missing.length > 0 && (
              <p className="text-xs text-destructive">Faltou: {summary.missing.map(d => d.label.toLowerCase()).join(', ')}.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 ring-1 ring-black/5 shadow-soft rounded-3xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> Medidas</h3>
            {m.hasCoords && m.areaM2 !== null && m.perimeter !== null ? (
              <dl className="text-xs space-y-1.5">
                <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Área calculada</dt><dd className="font-semibold text-right">{fmt(m.areaM2)} m² ({fmt(m.areaM2 / 10000, 4)} ha)</dd></div>
                {m.areaDeclared !== null && <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Área na planta</dt><dd className="text-right">{fmt(m.areaDeclared)} m²</dd></div>}
                <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Perímetro calculado</dt><dd className="font-semibold text-right">{fmt(m.perimeter)} m</dd></div>
                {m.perimDeclared !== null && <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Perímetro na planta</dt><dd className="text-right">{fmt(m.perimDeclared)} m</dd></div>}
              </dl>
            ) : (
              <p className="text-xs text-muted-foreground">As coordenadas não foram encontradas nos documentos, então a área não pôde ser calculada.</p>
            )}
            <Button variant="link" size="sm" className="px-0 h-auto text-xs" onClick={() => onOpenDetails('poligonal')}>Ver medidas lado a lado</Button>
          </CardContent>
        </Card>

        <Card className="border-0 ring-1 ring-black/5 shadow-soft rounded-3xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Vizinhos (confrontantes)</h3>
            <p className="text-xs text-muted-foreground">
              {summary.neighbors > 0
                ? `${summary.neighbors} divisa(s) identificada(s). Os nomes foram comparados entre planta, memorial, matrículas e anuências.`
                : 'Nenhuma divisa identificada nos documentos.'}
            </p>
            <Button variant="link" size="sm" className="px-0 h-auto text-xs" onClick={() => onOpenDetails('confrontantes')}>Ver vizinhos e assinaturas</Button>
          </CardContent>
        </Card>
      </div>

      {/* O que precisa de atenção */}
      <Card className="border-0 ring-1 ring-black/5 shadow-soft rounded-3xl">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-semibold flex items-center gap-2"><Compass className="w-4 h-4 text-primary" /> O que precisa de atenção</h3>
          {summary.attention.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma divergência ou pendência encontrada nos documentos conferidos.</p>
          ) : (
            <ul className="space-y-3">
              {visibleAttention.map((item, i) => {
                const kind = ITEM[item.tipo];
                const Icon = kind.icon;
                return (
                  <li key={`${item.titulo}-${i}`} className="rounded-2xl border border-border p-3.5 space-y-1.5">
                    <p className="text-sm font-medium text-foreground flex items-start gap-2">
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${kind.color}`} aria-label={kind.label} />
                      <span>{item.titulo}</span>
                    </p>
                    <p className="text-xs text-muted-foreground pl-6">
                      {item.onde && <>Onde: {item.onde}</>}{item.onde && item.documento && ' · '}{item.documento && <>Documento: {item.documento}</>}
                    </p>
                    {item.oQueFazer && <p className="text-xs text-foreground pl-6"><strong className="font-semibold">O que fazer:</strong> {item.oQueFazer}</p>}
                  </li>
                );
              })}
            </ul>
          )}
          {summary.attention.length > 6 && (
            <Button variant="outline" size="sm" onClick={() => setShowAll(v => !v)}>
              {showAll ? 'Mostrar menos' : `Ver todos (${summary.attention.length})`}
            </Button>
          )}
          {summary.checklistPending > 0 && (
            <div className="rounded-2xl bg-secondary/60 p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>{summary.checklistPending} item(ns) do checklist do procedimento não puderam ser confirmados pela leitura e precisam da sua resposta.</span>
              <Button size="sm" variant="outline" onClick={() => onOpenDetails('checklists')}>Responder o checklist</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximos passos */}
      <Card className="border-0 ring-1 ring-black/5 shadow-soft rounded-3xl">
        <CardContent className="p-5 sm:p-6 space-y-3">
          <h3 className="text-base font-semibold">Próximos passos</h3>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-foreground">
            {summary.nextSteps.map(step => <li key={step}>{step}</li>)}
          </ol>
        </CardContent>
      </Card>

      {/* Pergunta à IA (só com o plano: a resposta usa a IA) */}
      {user?.hasSubscription && !data.isSample && (
        <Card className="border-0 ring-1 ring-black/5 shadow-soft rounded-3xl">
          <CardContent className="p-5 sm:p-6 space-y-3">
            <h3 className="text-base font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> Pergunte sobre este resultado</h3>
            <div className="flex gap-2">
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void ask(); }}
                maxLength={2000}
                placeholder="Ex.: Como resolver a anuência que falta?"
                aria-label="Pergunta sobre o resultado da conferência"
                className="flex-1 text-sm rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <Button onClick={ask} disabled={asking || !question.trim()} className="gap-1.5" aria-label="Enviar pergunta">
                {asking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            {askError && <p role="alert" className="text-xs text-destructive">{askError}</p>}
            {answer && (
              <div className="rounded-xl border border-border bg-background p-3 text-sm space-y-1">
                <p className="text-xs text-muted-foreground">Pergunta: {answer.q}</p>
                <p className="whitespace-pre-wrap text-foreground">{answer.a}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
