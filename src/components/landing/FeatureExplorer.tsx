import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { LANDING_PROCEDURES, MATRICULA_FEATURES, PROJECT_FEATURES } from '@/content/landing';
import type { Feature, ModuleId } from '@/content/landing';
import { ResultRows } from './LandingPrimitives';

// "Recursos": cada módulo com os seus recursos, um de cada vez (problema, como funciona, o que entrega e um exemplo).
// Todos os detalhes ficam no HTML (só o escolhido aparece), para buscadores e leitores de tela.

const MODULES: Record<ModuleId, { label: string; intro: string; features: Feature[] }> = {
  matricula: {
    label: 'Análise de matrícula',
    intro: 'Para quem compra, vende, financia ou assessora a compra de um imóvel: o que a certidão diz, organizado e conferido.',
    features: MATRICULA_FEATURES,
  },
  projeto: {
    label: 'Conferência de projetos',
    intro: 'Para quem prepara processos para o Registro de Imóveis: planta, memorial, matrícula e vizinhos conferidos antes do protocolo.',
    features: PROJECT_FEATURES,
  },
};

const FeatureDetail: React.FC<{ feature: Feature }> = ({ feature }) => (
  <div className="space-y-5">
    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">{feature.name}</h3>
    <dl className="space-y-4 text-[15px] leading-relaxed">
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Por que importa</dt>
        <dd className="text-foreground/85 mt-1">{feature.problem}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Como funciona</dt>
        <dd className="text-foreground/85 mt-1">{feature.how}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">O que você recebe</dt>
        <dd className="text-foreground/85 mt-1">{feature.delivers}</dd>
      </div>
    </dl>
    <figure className="rounded-2xl bg-secondary/60 px-4 pt-3 pb-1">
      <figcaption className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{feature.sample.caption}</figcaption>
      <ResultRows rows={feature.sample.rows} />
    </figure>
  </div>
);

export const FeatureExplorer: React.FC = () => {
  const [module, setModule] = useState<ModuleId>('matricula');
  const [selected, setSelected] = useState<Record<ModuleId, string>>({ matricula: MATRICULA_FEATURES[0].id, projeto: PROJECT_FEATURES[0].id });

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-muted rounded-2xl" role="group" aria-label="Escolha o módulo">
          {(Object.keys(MODULES) as ModuleId[]).map(id => (
            <button
              key={id}
              type="button"
              aria-pressed={module === id}
              onClick={() => setModule(id)}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${module === id ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {MODULES[id].label}
            </button>
          ))}
        </div>
      </div>

      {(Object.keys(MODULES) as ModuleId[]).map(id => (
        <div key={id} hidden={module !== id} className="space-y-6">
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">{MODULES[id].intro}</p>
          <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-5 lg:gap-8 items-start">
            <ul className="space-y-2" aria-label={`Recursos: ${MODULES[id].label}`}>
              {MODULES[id].features.map(f => {
                const active = selected[id] === f.id;
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      aria-controls={`recurso-${f.id}`}
                      onClick={() => setSelected(prev => ({ ...prev, [id]: f.id }))}
                      className={`w-full text-left rounded-2xl px-4 py-3.5 border transition-colors flex items-center justify-between gap-3 ${active ? 'bg-card border-primary/40 shadow-medium' : 'border-transparent hover:bg-card/70'}`}
                    >
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold text-foreground">{f.name}</span>
                        <span className="text-[13px] text-muted-foreground line-clamp-1">{f.problem}</span>
                      </span>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="bg-card rounded-3xl shadow-medium ring-1 ring-black/5 p-6 sm:p-8">
              {MODULES[id].features.map(f => (
                <div key={f.id} id={`recurso-${f.id}`} hidden={selected[id] !== f.id}>
                  <FeatureDetail feature={f} />
                </div>
              ))}
            </div>
          </div>
          {id === 'projeto' && (
            <ul className="flex flex-wrap justify-center gap-2" aria-label="Procedimentos com checklist">
              {LANDING_PROCEDURES.map(p => (
                <li key={p.key} className="rounded-full bg-card ring-1 ring-black/5 px-3.5 py-1.5 text-[13px] text-foreground" title={p.hint}>
                  {p.label} <span className="text-muted-foreground tabular-nums">· {p.items} itens</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};
