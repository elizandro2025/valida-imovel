import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Download, FileText, MessageCircle, Upload } from 'lucide-react';
import { ScoreRing } from '@/components/ScoreRing';
import type { ModuleId, Tone } from '@/content/landing';
import { PolygonSketch, ResultRows, StatusChip, ToneIcon, WindowFrame } from './LandingPrimitives';

// "Como funciona": as quatro etapas reais de cada módulo, com o que a tela mostra em cada uma.
// Os valores são os dos exemplos fictícios (/app?sample=risk e /app?sample=desdobro).

interface Step { title: string; text: string; visual: React.ReactNode }

const Check: React.FC<{ tone: Tone; children: React.ReactNode }> = ({ tone, children }) => (
  <li className="flex items-start gap-2.5 rounded-xl bg-secondary/70 px-3.5 py-2.5 text-sm text-foreground">
    <ToneIcon tone={tone} className="w-4 h-4 mt-0.5" />
    <span>{children}</span>
  </li>
);

const Dropzone: React.FC<{ hint: string; files: { name: string; type: string }[] }> = ({ hint, files }) => (
  <div className="space-y-3">
    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.03] px-5 py-6 text-center space-y-1.5">
      <Upload className="w-6 h-6 text-primary mx-auto" aria-hidden="true" />
      <p className="text-sm font-semibold text-foreground">Arraste os arquivos ou toque para escolher</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
    <ul className="space-y-2">
      {files.map(f => (
        <li key={f.name} className="flex items-center justify-between gap-2 rounded-xl bg-card ring-1 ring-black/5 px-3.5 py-2.5">
          <span className="flex items-center gap-2 min-w-0 text-sm text-foreground">
            <FileText className="w-4 h-4 text-primary shrink-0" aria-hidden="true" /><span className="truncate">{f.name}</span>
          </span>
          <StatusChip tone="ok">{f.type}</StatusChip>
        </li>
      ))}
    </ul>
  </div>
);

const MATRICULA_STEPS: Step[] = [
  {
    title: 'Envie a certidão',
    text: 'O PDF da matrícula, de qualquer cartório do Brasil, digital ou escaneado, com até 15 MB.',
    visual: <Dropzone hint="PDF digital ou escaneado · até 15 MB" files={[{ name: 'matricula-18920.pdf', type: 'Matrícula' }]} />,
  },
  {
    title: 'A IA lê cada página',
    text: 'Transcreve o documento inteiro e classifica cada registro e averbação: quem é dono, o que é dívida ou restrição, o que descreve o imóvel.',
    visual: (
      <ResultRows rows={[
        { label: 'R-1 · Compra e venda', value: 'Proprietário atual' },
        { label: 'R-3 · Cédula rural hipotecária', value: 'Garantia', tone: 'warn' },
        { label: 'AV-4 · Embargo ambiental do IBAMA', value: 'Restrição', tone: 'bad' },
        { label: 'Imóvel', value: 'Sítio Boa Vista, 120 ha' },
      ]} />
    ),
  },
  {
    title: 'O sistema confere a leitura',
    text: 'Regras fixas, que não dependem da IA, conferem o resultado: atos e CPFs procurados no texto, cancelamento só com o ato, nota mínima quando há restrição ativa.',
    visual: (
      <ul className="space-y-2">
        <Check tone="ok">R-3 e AV-4 encontrados no texto lido do PDF</Check>
        <Check tone="warn">Nenhum ato cancela a cédula do R-3: ela continua ativa</Check>
        <Check tone="bad">Embargo ativo: a nota de risco não pode ficar abaixo de 75</Check>
      </ul>
    ),
  },
  {
    title: 'Receba o relatório',
    text: 'Nota de risco, donos, dívidas e restrições com o trecho de origem, certidões recomendadas e explicações para cada perfil. Exporte, compartilhe ou pergunte ao assistente.',
    visual: (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <ScoreRing score={88} level="CRÍTICO" size={84} />
          <p className="text-sm text-foreground/85 leading-snug">
            <strong className="text-foreground">Não recomendado</strong> sem quitar a cédula rural (R-3) e regularizar o embargo (AV-4).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[{ icon: Download, label: 'Exportar PDF' }, { icon: MessageCircle, label: 'Resumo para WhatsApp' }, { icon: Bot, label: 'Perguntar ao assistente' }].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
              <Icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />{label}
            </span>
          ))}
        </div>
      </div>
    ),
  },
];

const PROJECT_STEPS: Step[] = [
  {
    title: 'Escolha o procedimento e envie',
    text: 'Desdobro, retificação, unificação, estremação, divisão ou REURB. Envie até 12 arquivos de uma vez: o sistema reconhece o tipo de cada um e mostra o que ainda falta.',
    visual: (
      <Dropzone
        hint="PDF, PNG, JPG, TXT, CSV, KML ou DXF · até 12 arquivos de 15 MB"
        files={[
          { name: 'planta-sitio-bela-vista.pdf', type: 'Planta' },
          { name: 'memorial-descritivo.pdf', type: 'Memorial' },
          { name: 'matricula-48910.pdf', type: 'Matrícula' },
        ]}
      />
    ),
  },
  {
    title: 'A IA lê e organiza',
    text: 'Os documentos são lidos e os dados vão para o lugar certo: imóvel, responsável técnico, medidas da planta e do memorial, vizinhos de cada divisa e as respostas do checklist.',
    visual: (
      <ResultRows rows={[
        { label: 'Matrícula', value: '48.910 · Piracicaba/SP' },
        { label: 'Área na planta e no memorial', value: '38,9313 ha' },
        { label: 'Perímetro no memorial', value: '2.349,98 m' },
        { label: 'Divisas encontradas', value: '4 (6 vértices)' },
      ]} />
    ),
  },
  {
    title: 'O sistema calcula e cruza',
    text: 'Área e perímetro pelas coordenadas, cada lado comparado entre planta e memorial, os 16 campos dos dois documentos e o nome de cada vizinho em até 7 fontes.',
    visual: (
      <div className="grid sm:grid-cols-[0.9fr_1.1fr] gap-4 items-center">
        <PolygonSketch className="w-full max-w-[220px] mx-auto" />
        <ResultRows rows={[
          { label: 'Área calculada', value: '38,9313 ha', tone: 'ok' },
          { label: 'Perímetro', value: '+0,40 m no memorial', tone: 'warn' },
          { label: 'Lado M-02 → M-03', value: '441,37 × 441,77 m', tone: 'warn' },
          { label: 'Vizinho a leste', value: 'Falta uma assinatura', tone: 'warn' },
        ]} />
      </div>
    ),
  },
  {
    title: 'Veja o que corrigir',
    text: 'Um veredito em linguagem simples e a lista do que precisa de atenção, com o documento e o que fazer. Exporte em Word para o responsável técnico ou abra os detalhes.',
    visual: (
      <div className="space-y-3">
        <div className="rounded-2xl bg-destructive/[0.06] ring-1 ring-destructive/20 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Há diferenças para corrigir antes de levar ao cartório</p>
        </div>
        <ul className="space-y-2">
          <Check tone="warn">Memorial, lado M-02 → M-03: 441,77 m, contra 441,37 m pelas coordenadas</Check>
          <Check tone="warn">Vizinho a leste: só Joaquim assinou a anuência; falta Maria Leste Fictícia</Check>
          <Check tone="warn">Vizinho ao norte (espólio): falta a assinatura da anuência</Check>
        </ul>
      </div>
    ),
  },
];

const STEPS: Record<ModuleId, Step[]> = { matricula: MATRICULA_STEPS, projeto: PROJECT_STEPS };
const SAMPLE_LINK: Record<ModuleId, { to: string; label: string }> = {
  matricula: { to: '/app?sample=risk', label: 'Abrir o relatório de exemplo' },
  projeto: { to: '/app?sample=desdobro', label: 'Abrir o projeto de exemplo' },
};

export const HowItWorks: React.FC = () => {
  const [module, setModule] = useState<ModuleId>('matricula');
  const [step, setStep] = useState(0);
  const steps = STEPS[module];

  const chooseModule = (next: ModuleId) => {
    setModule(next);
    setStep(0);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-muted rounded-2xl" role="group" aria-label="Escolha o módulo">
          {([['matricula', 'Análise de matrícula'], ['projeto', 'Conferência de projeto']] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={module === id}
              onClick={() => chooseModule(id)}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${module === id ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-6 lg:gap-10 items-start">
        <ol className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3">
          {steps.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                aria-pressed={step === i}
                aria-controls="etapa-visual"
                onClick={() => setStep(i)}
                className={`w-full h-full text-left rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 transition-colors border ${step === i ? 'bg-card border-primary/40 shadow-medium' : 'bg-transparent border-border hover:bg-card/70'}`}
              >
                <span className={`block text-xs font-semibold tabular-nums ${step === i ? 'text-primary' : 'text-muted-foreground'}`}>Etapa {i + 1}</span>
                <span className="block text-[15px] font-semibold text-foreground mt-0.5">{s.title}</span>
                <span className="hidden lg:block text-sm text-muted-foreground leading-relaxed mt-1">{s.text}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="space-y-4">
          <p className="lg:hidden text-sm text-muted-foreground leading-relaxed">{steps[step].text}</p>
          <WindowFrame title={`Etapa ${step + 1} de 4 · ${steps[step].title} · dados fictícios`}>
            <div id="etapa-visual" className="p-5 sm:p-7 min-h-[300px] bg-secondary/30" aria-live="polite">
              {steps[step].visual}
            </div>
          </WindowFrame>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to={SAMPLE_LINK[module].to} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline py-2">
              {SAMPLE_LINK[module].label}, sem cadastro <ArrowRight className="w-4 h-4" />
            </Link>
            {step < steps.length - 1 && (
              <button type="button" onClick={() => setStep(step + 1)} className="text-sm font-medium text-foreground/80 hover:text-foreground py-2 px-1">
                Próxima etapa →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
