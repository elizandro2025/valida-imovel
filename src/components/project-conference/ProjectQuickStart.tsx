import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { ArrowRight, CheckCircle2, Circle, ClipboardCheck, FileSearch, Sparkles, Trash2, Upload } from 'lucide-react';
import { ProjectData, createEmptyProject } from '@/services/projectConferenceService';
import {
  PROJECT_DOC_TYPES, PROJECT_LIMITS, ProjectUploadFile, appendUploadFiles, runProjectConference, validateProjectFile,
} from '@/services/projectAiService';
import { PLAIN_PROCEDURES, recommendedDocTypes } from '@/services/projectSummary';
import { projectMemory } from '@/services/projectMemory';
import { useAuth } from '@/contexts/AuthContext';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { ErrorModal } from '@/components/ErrorModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectQuickStartProps {
  data: ProjectData;
  onUpdate: (updater: (prev: ProjectData) => ProjectData) => void;
  // Conferência concluída: abre o resultado
  onFinished: () => void;
  onLoadSample: () => void;
  // Preencher à mão (passo a passo com todas as abas)
  onOpenDetails: () => void;
}

const PROGRESS_STEPS = ['Leitura dos documentos', 'Cruzamento de planta, memorial e matrículas', 'Cálculo da área e conferência', 'Resultado pronto'];

/**
 * Entrada da conferência de projetos no mesmo formato da análise de matrícula: a pessoa diz o procedimento (já vem
 * marcado quando escolhido no início), envia os documentos e o sistema faz o resto (leitura com IA, cálculos e
 * regras). A lista "O que enviar" mostra o que já chegou e o que falta.
 */
export const ProjectQuickStart: React.FC<ProjectQuickStartProps> = ({ data, onUpdate, onFinished, onLoadSample, onOpenDetails }) => {
  const { user } = useAuth();
  const canRun = Boolean(user?.hasSubscription);

  // A lista de arquivos fica na memória da aba (a mesma da aba "Leitura com IA" e a que recebe o arquivo do Hub)
  const [files, setFiles] = useState<ProjectUploadFile[]>(() => projectMemory.getFiles());
  useEffect(() => { projectMemory.setFiles(files); }, [files]);
  const [uploadProblems, setUploadProblems] = useState<string[]>([]);

  const procedimentos = data.info.procedimentos.length ? data.info.procedimentos : ['desdobro'];
  const natureza = data.info.natureza === 'rural' ? 'rural' : 'urbano';
  const [observacoes, setObservacoes] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ step: '', value: 0 });
  const [error, setError] = useState<string | null>(null);

  const toggleProcedure = (key: string) => onUpdate(prev => {
    const current = prev.info.procedimentos;
    const next = current.includes(key) ? current.filter(k => k !== key) : [...current, key];
    return { ...prev, info: { ...prev.info, procedimentos: next.length ? next : [key] } };
  });
  const setNatureza = (value: 'urbano' | 'rural') => onUpdate(prev => ({ ...prev, info: { ...prev.info, natureza: value } }));

  const addFiles = (accepted: File[]) => {
    const { files: next, problems } = appendUploadFiles(files, accepted);
    setFiles(next);
    setUploadProblems(problems);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: addFiles,
    // Formatos fora da lista não chegam ao onDrop: explica o motivo em vez de ignorar o arquivo em silêncio
    onDropRejected: rejections => setUploadProblems(
      rejections.map(r => validateProjectFile(r.file) || `"${r.file.name}": formato não aceito.`),
    ),
    accept: {
      'application/pdf': ['.pdf'], 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'],
      'text/plain': ['.txt', '.csv', '.tsv', '.kml', '.dxf', '.xml'], 'text/csv': ['.csv'],
      'application/vnd.google-earth.kml+xml': ['.kml'],
    },
    disabled: running,
  });

  const checklist = recommendedDocTypes(procedimentos, natureza).map(doc => ({
    ...doc,
    received: files.some(f => f.tipo === doc.tipo),
  }));
  const missingRequired = checklist.filter(d => d.required && !d.received);

  const run = async () => {
    setRunning(true);
    setError(null);
    setProgress({ step: 'Preparando os documentos...', value: 3 });
    try {
      // Documentos reais nunca se misturam com o exemplo: a leitura parte de um projeto em branco
      const base = data.isSample ? createEmptyProject() : data;
      const merged = await runProjectConference(
        { files, procedimentos, base: { ...base, info: { ...base.info, natureza } }, observacoes },
        (step, value) => setProgress({ step, value }),
      );
      onUpdate(() => ({ ...merged, isSample: false }));
      onFinished();
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Não foi possível concluir a conferência. Tente novamente.');
    } finally {
      setRunning(false);
    }
  };

  if (running) {
    return (
      <AnalysisProgress
        progress={progress.value}
        currentStep={progress.step}
        steps={PROGRESS_STEPS}
        title="Conferindo o projeto"
        hint="Leva alguns minutos, conforme o número de documentos. Não feche nem recarregue esta aba até terminar."
        eta="2 a 6 min"
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-8">
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-2xl sm:text-4xl font-semibold text-foreground tracking-tight leading-tight">Conferência de projeto</h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Envie os documentos do trabalho. O sistema lê cada um, compara planta, memorial e matrículas, calcula a área e
          mostra o que precisa ser corrigido antes de levar ao cartório.
        </p>
      </div>

      <Card className="border-0 ring-1 ring-black/5 shadow-medium rounded-3xl bg-card text-foreground overflow-hidden">
        <CardContent className="p-5 sm:p-7 space-y-7">
          {/* 1. Procedimento */}
          <section className="space-y-3" aria-labelledby="qs-proc">
            <h2 id="qs-proc" className="text-sm font-semibold text-foreground">1. O que você vai levar ao cartório?</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {Object.entries(PLAIN_PROCEDURES).map(([key, proc]) => {
                const on = procedimentos.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleProcedure(key)}
                    className={`text-left rounded-2xl border px-3.5 py-2.5 transition-colors ${
                      on ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-secondary/60'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      {on ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />}
                      {proc.label}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5 pl-6">{proc.hint}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">O imóvel é:</span>
              {(['urbano', 'rural'] as const).map(value => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={natureza === value}
                  onClick={() => setNatureza(value)}
                  className={`px-3 py-1.5 rounded-full border font-semibold ${
                    natureza === value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {value === 'urbano' ? 'Urbano' : 'Rural'}
                </button>
              ))}
            </div>
          </section>

          {/* 2. Documentos */}
          <section className="space-y-3" aria-labelledby="qs-docs">
            <h2 id="qs-docs" className="text-sm font-semibold text-foreground">2. Envie os documentos</h2>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl px-6 py-10 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary/60 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-secondary/60'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 stroke-[1.8]" />
              </div>
              <p className="text-base font-semibold text-foreground">
                {isDragActive ? 'Solte os arquivos aqui' : 'Escolha os arquivos do projeto'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, foto (JPG/PNG) ou coordenadas (TXT, CSV, KML, DXF) · até 15 MB cada · até {PROJECT_LIMITS.maxFiles} arquivos
                <span className="hidden sm:inline"> · ou arraste para cá</span>
              </p>
              <Button type="button" className="mt-4">Escolher arquivos</Button>
            </div>

            {uploadProblems.length > 0 && (
              <div role="alert" className="p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive space-y-1">
                {uploadProblems.map(p => <p key={p}>{p}</p>)}
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">O tipo de cada arquivo foi sugerido pelo nome. Corrija se estiver errado.</p>
                <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                  {files.map(f => (
                    <li key={f.id} className="flex flex-wrap items-center gap-3 px-3 py-2 bg-background">
                      <span className="text-sm text-foreground truncate flex-1 min-w-[160px]">{f.file.name}</span>
                      <select
                        value={f.tipo}
                        onChange={e => setFiles(prev => prev.map(x => (x.id === f.id ? { ...x, tipo: e.target.value } : x)))}
                        className="text-xs rounded-lg border border-border bg-card px-2 py-1.5"
                        aria-label={`Tipo do documento ${f.file.name}`}
                      >
                        {PROJECT_DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))}
                        className="p-1.5 text-muted-foreground hover:text-destructive"
                        aria-label={`Remover ${f.file.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* O que enviar: marca o que já chegou */}
            <div className="rounded-2xl bg-secondary/60 p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-primary" /> O que enviar
              </p>
              <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {checklist.map(doc => (
                  <li key={doc.tipo} className="flex items-start gap-2 text-xs">
                    {doc.received
                      ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-label="Recebido" />
                      : <Circle className="w-4 h-4 text-muted-foreground shrink-0" aria-label="Ainda não enviado" />}
                    <span className={doc.received ? 'text-foreground' : 'text-muted-foreground'}>
                      {doc.label}
                      {!doc.received && <span className="text-[11px]">{doc.required ? ' · essencial' : ' · se houver'}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-xs font-semibold text-primary">Quer dar alguma informação a mais? (opcional)</summary>
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value.slice(0, 2000))}
                rows={3}
                aria-label="Informações adicionais para a conferência"
                placeholder="Ex.: o confrontante da frente é a via pública; falta a anuência do vizinho do lado direito..."
                className="mt-2 w-full text-sm rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </details>
          </section>

          {/* 3. Conferir */}
          <section className="space-y-2 border-t border-border pt-5">
            {canRun ? (
              <>
                <Button size="lg" onClick={run} disabled={files.length === 0} className="w-full sm:w-auto gap-2">
                  <FileSearch className="w-5 h-5" /> Conferir documentos
                </Button>
                <p className="text-xs text-muted-foreground">
                  {files.length === 0
                    ? 'Envie pelo menos um documento (o ideal é a planta, o memorial e a matrícula).'
                    : missingRequired.length > 0
                      ? `Dá para conferir assim, mas sem ${missingRequired.map(d => d.label.toLowerCase()).join(', ')} parte da conferência fica como pendência.`
                      : 'Tudo pronto. A conferência leva alguns minutos.'}
                </p>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto gap-2">
                  <Link to={user ? '/pagamento' : '/auth?tab=register'}>
                    {user ? 'Assinar para conferir' : 'Criar conta para conferir'} <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground">A conferência com leitura automática faz parte do plano.</p>
              </>
            )}
          </section>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
        <Button variant="outline" onClick={onLoadSample} className="gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" /> Ver um exemplo pronto (dados fictícios)
        </Button>
        <Button variant="ghost" onClick={onOpenDetails}>Prefiro preencher à mão</Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 text-center sm:text-left">
        {[
          { icon: Upload, title: 'Envie os documentos', desc: 'Planta, memorial, matrículas e o que tiver. Nada fica guardado.' },
          { icon: FileSearch, title: 'O sistema confere', desc: 'Lê os documentos, calcula a área e compara nomes e medidas.' },
          { icon: ClipboardCheck, title: 'Receba o resultado', desc: 'O que está certo, o que corrigir em cada documento e o relatório.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="space-y-1.5">
            <Icon className="w-5 h-5 text-primary mx-auto sm:mx-0" />
            <h3 className="font-semibold text-foreground text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <ErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        title="Não foi possível conferir"
        message={error || ''}
        actionLabel="Tentar de novo"
        onAction={() => { setError(null); run(); }}
        cancelLabel="Fechar"
      />
    </div>
  );
};
