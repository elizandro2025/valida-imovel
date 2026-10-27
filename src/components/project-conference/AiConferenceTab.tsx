import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  ProjectData,
  createEmptyProject,
} from '@/services/projectConferenceService';
import { projectMemory } from '@/services/projectMemory';
import { PROCEDURE_CHECKLISTS } from '@/services/projectChecklists';
import {
  PROJECT_DOC_TYPES, PROJECT_LIMITS, ProjectUploadFile, askAboutProject, guessDocType, runProjectConference, validateProjectFile,
} from '@/services/projectAiService';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, ArrowRight, CheckCircle2, FileUp, Loader2, MessageSquare, Send, Sparkles, Trash2, Wand2,
} from 'lucide-react';

interface AiConferenceTabProps {
  data: ProjectData;
  onUpdate: (updater: (prev: ProjectData) => ProjectData) => void;
  onFinished: () => void;
}

let fileCounter = 0;

export const AiConferenceTab: React.FC<AiConferenceTabProps> = ({ data, onUpdate, onFinished }) => {
  // A lista fica na memória da aba: sobrevive à troca de aba e recebe o arquivo solto no Hub
  const [files, setFiles] = useState<ProjectUploadFile[]>(() => projectMemory.getFiles());
  useEffect(() => { projectMemory.setFiles(files); }, [files]);
  const [procedimentos, setProcedimentos] = useState<string[]>(
    data.info.procedimentos.length ? data.info.procedimentos : ['retificacao'],
  );
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ step: '', value: 0 });
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<{ q: string; a: string } | null>(null);
  const [asking, setAsking] = useState(false);

  const addFiles = useCallback((accepted: File[]) => {
    setError(null);
    const problems: string[] = [];
    const valid: ProjectUploadFile[] = [];
    accepted.forEach(file => {
      const problem = validateProjectFile(file);
      if (problem) problems.push(problem);
      else valid.push({ id: `up-${++fileCounter}`, file, tipo: guessDocType(file.name) });
    });
    setFiles(prev => {
      const merged = [...prev, ...valid];
      if (merged.length > PROJECT_LIMITS.maxFiles) {
        problems.push(`Limite de ${PROJECT_LIMITS.maxFiles} arquivos por conferência.`);
        return merged.slice(0, PROJECT_LIMITS.maxFiles);
      }
      return merged;
    });
    if (problems.length) setError(problems.join(' '));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: addFiles,
    accept: {
      'application/pdf': ['.pdf'], 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'],
      'text/plain': ['.txt', '.csv', '.tsv', '.kml', '.dxf', '.xml'], 'text/csv': ['.csv'],
      'application/vnd.google-earth.kml+xml': ['.kml'],
    },
    disabled: running,
  });

  const toggleProc = (key: string) =>
    setProcedimentos(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));

  const run = async () => {
    setRunning(true);
    setError(null);
    setFinished(false);
    setProgress({ step: 'Iniciando...', value: 2 });
    try {
      // Documentos reais nunca se misturam com o exemplo: a leitura parte de um projeto em branco
      const base = data.isSample ? createEmptyProject() : data;
      const merged = await runProjectConference(
        { files, procedimentos, base, observacoes },
        (step, value) => setProgress({ step, value }),
      );
      onUpdate(() => ({ ...merged, isSample: false }));
      setFinished(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível concluir a conferência. Tente novamente.');
    } finally {
      setRunning(false);
    }
  };

  const ask = async () => {
    const q = question.trim();
    if (!q || asking) return;
    setAsking(true);
    setError(null);
    try {
      setAnswer({ q, a: await askAboutProject(q, data) });
      setQuestion('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível responder agora. Tente novamente.');
    } finally {
      setAsking(false);
    }
  };

  const hasTypes = (tipo: string) => files.some(f => f.tipo === tipo);
  const missingCore = ['Planta', 'Memorial', 'Matrícula Principal'].filter(t => !hasTypes(t));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><Wand2 className="w-5 h-5" /></div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Leitura dos documentos com IA</h2>
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed mt-0.5">
              A IA lê e organiza a planta, o memorial, as matrículas e os demais documentos. Depois, o sistema calcula a
              área e o perímetro pelas coordenadas, compara planta e memorial, confere os nomes dos confrontantes e os itens
              dos procedimentos escolhidos, e aponta o que corrigir em cada documento. O resultado deve ser validado pelo
              responsável técnico.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">1. Procedimento do Trabalho</h3>
          <div className="flex flex-wrap gap-2">
            {PROCEDURE_CHECKLISTS.map(c => {
              const on = procedimentos.includes(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  disabled={running}
                  onClick={() => toggleProc(c.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    on ? 'bg-primary text-primary-foreground border-primary shadow-soft' : 'bg-background text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  {c.name.split('(')[0].trim()} ({c.items.length} itens)
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">2. Documentos e Peças Técnicas</h3>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl px-6 py-10 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary/60 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-secondary/60'
            } ${running ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            <FileUp className="w-8 h-8 mx-auto text-primary mb-2 stroke-[1.8]" />
            <p className="text-sm font-semibold text-foreground">
              {isDragActive ? 'Solte os arquivos aqui' : 'Arraste os documentos do trabalho (Planta, Memorial, Matrículas) ou clique para escolher'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, PNG, JPG, TXT, CSV, KML ou DXF · até 15 MB cada · até {PROJECT_LIMITS.maxFiles} arquivos por conferência.
            </p>
          </div>


          {files.length > 0 && (
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border overflow-hidden">
              {files.map(f => (
                <li key={f.id} className="flex flex-wrap items-center gap-3 px-3 py-2 bg-background">
                  <span className="text-sm text-foreground truncate flex-1 min-w-[160px]">{f.file.name}</span>
                  <select
                    value={f.tipo}
                    disabled={running}
                    onChange={e => setFiles(prev => prev.map(x => (x.id === f.id ? { ...x, tipo: e.target.value } : x)))}
                    className="text-xs rounded-lg border border-border bg-card px-2 py-1.5"
                    aria-label={`Tipo do documento ${f.file.name}`}
                  >
                    {PROJECT_DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button
                    type="button"
                    disabled={running}
                    onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))}
                    className="p-1.5 text-muted-foreground hover:text-destructive"
                    aria-label={`Remover ${f.file.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {files.length > 0 && missingCore.length > 0 && (
            <p className="mt-2 text-xs text-warning flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Sem {missingCore.join(', ')}: a conferência cruzada correspondente ficará como pendência.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">3. Observações para esta conferência (opcional)</h3>
          <textarea
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            disabled={running}
            rows={3}
            placeholder="Ex.: retificação de área e desdobro; o confrontante da frente é a via pública; falta a anuência do cônjuge do confrontante leste..."
            className="w-full text-sm rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <label className="mt-2 flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={data.info.modoMax}
              disabled={running}
              onChange={e => onUpdate(prev => ({ ...prev, info: { ...prev.info, modoMax: e.target.checked } }))}
              className="mt-0.5"
            />
            <span><strong className="text-foreground">Modo conferência máxima:</strong> apontar também erros de digitação, acentuação, datas, campos em branco e qualquer pequeno problema que possa gerar exigência.</span>
          </label>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive">
            {error}
          </div>
        )}

        {running && (
          <div className="space-y-2" aria-live="polite">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> {progress.step}
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress.value}%` }} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={run} disabled={running || files.length === 0} className="gap-2 font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
            {running ? 'Lendo e conferindo os documentos...' : data.ai && !data.isSample ? 'Ler e conferir de novo' : 'Ler e conferir os documentos'}
          </Button>
          <span className="text-xs text-muted-foreground">
            {data.isSample
              ? 'Com documentos reais, a leitura começa um projeto novo: os dados do exemplo não são usados.'
              : 'A nova leitura atualiza os dados extraídos; os apontamentos que você lançou são mantidos.'}
          </span>
        </div>
      </section>

      {(finished || data.ai) && data.ai && (
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">
              {data.isSample
                ? 'Resultado de exemplo (ilustrativo, não foi gerado por IA)'
                : `Última conferência automática — ${new Date(data.ai.ranAt).toLocaleString('pt-BR')}`}
            </h3>
          </div>
          {data.ai.resumo && <p className="text-sm text-muted-foreground leading-relaxed">{data.ai.resumo}</p>}
          <ul className="text-xs text-muted-foreground grid sm:grid-cols-2 gap-1">
            {data.ai.files.map(f => (
              <li key={f.name} className="flex items-center gap-1.5">
                {f.legivel ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                <span className="truncate">{f.tipo} — {f.name}{f.legivel ? '' : ' (pouco texto legível)'}</span>
              </li>
            ))}
          </ul>
          {data.ai.notas.length > 0 && (
            <ul className="text-xs text-warning space-y-1">
              {data.ai.notas.map(n => <li key={n} className="flex gap-1.5"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{n}</li>)}
            </ul>
          )}
          <div className="p-3 rounded-xl bg-muted/60 text-xs text-muted-foreground">
            A leitura é automática e pode conter erros. Dados que a IA não encontrou literalmente nos documentos foram
            marcados como pendência. O parecer é calculado pelas regras do sistema, nunca pela IA, e o responsável
            técnico deve validar antes do protocolo.
          </div>
          <div className="space-y-2 pt-1">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> Pergunta complementar</h4>
            <div className="flex gap-2">
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void ask(); }}
                maxLength={2000}
                placeholder="Ex.: Como suprir a anuência do confrontante leste?"
                className="flex-1 text-sm rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label="Pergunta complementar sobre a conferência"
              />
              <Button onClick={ask} disabled={asking || !question.trim()} className="gap-1.5">
                {asking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Enviar
              </Button>
            </div>
            {answer && (
              <div className="rounded-xl border border-border bg-background p-3 text-sm space-y-1">
                <p className="text-xs text-muted-foreground">Pergunta: {answer.q}</p>
                <p className="whitespace-pre-wrap text-foreground">{answer.a}</p>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={onFinished} className="gap-2">
            Ver parecer e correções <ArrowRight className="w-4 h-4" />
          </Button>
        </section>
      )}
    </div>
  );
};
