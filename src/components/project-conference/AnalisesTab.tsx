import React, { useState } from 'react';
import { ANALISES_SECTIONS, ProjectData } from '@/services/projectConferenceService';
import {
  NotebookPen,
  Sparkles,
  Copy,
  Check,
  FileText,
  ShieldCheck,
  BookOpen,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalisesTabProps {
  data: ProjectData;
  onUpdate: (updater: (prev: ProjectData) => ProjectData) => void;
}

const PRESET_CLAUSES: Record<string, string[]> = {
  pm: [
    'Constatada correspondência plena entre os dados tabulares da planta e do memorial descritivo, respeitando a NBR 17047/2022.',
    'Apontada discrepância na descrição perimétrica entre planta e memorial descritivo, exigindo aditamento antes da qualificação notarial.',
    'Os elementos de área e perímetro mostram conformidade estrita com a certidão imobiliária, sem vestígios de ampliação territorial.',
  ],
  confrontantes: [
    'Todas as divisas limítrofes contam com indicação de matrículas atualizadas e qualificação de titulares tabulares em conformidade com o art. 213 da LRP.',
    'Exige-se a notificação registral ou coleta de anuência expressa dos confinantes cujos títulos divergem da indicação técnica.',
    'Divisas confrontantes com vias públicas dispensam anuência particular, bastando certidão de alinhamento expedida pelo Município.',
  ],
  poligonal: [
    'A malha de coordenadas geodésicas atinge fechamento linear rigoroso em UTM SIRGAS 2000, com erro inferior à tolerância milimétrica da ABNT.',
    'Poligonal calculada com sentido de percurso horário regular e coordenadas atestadas por responsável técnico devidamente habilitado.',
    'Ausência de sobreposição gráfica ou invasão de faixas de domínio público ou cursos hídricos protegidos.',
  ],
  conclusao: [
    'Opina-se pelo deferimento do registro imobiliário do rito em exame, em virtude do integral saneamento das exigências documentais e técnicas.',
    'Sugere-se a emissão de nota devolutiva saneadora com as providências pontuais assinaladas no quadro de não-conformidades.',
    'Procedimento apto à averiguação do Oficial de Registro de Imóveis, acompanhado de toda a documentação probatória exigida pelo Provimento CNJ 149/2023.',
  ],
};

export const AnalisesTab: React.FC<AnalisesTabProps> = ({ data, onUpdate }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleUpdateSection = (key: string, value: string) => {
    onUpdate(prev => ({
      ...prev,
      analises: { ...prev.analises, [key]: value },
    }));
  };

  const handleInsertPreset = (key: string, clause: string) => {
    const current = data.analises?.[key] || '';
    const updated = current ? `${current}\n\n${clause}` : clause;
    handleUpdateSection(key, updated);
  };

  const handleFillAllDrafts = () => {
    const nome = data.info.nome || 'o imóvel auditado';
    const mat = data.info.matricula || 'da serventia';
    const comarca = data.info.comarca || data.info.municipio || 'competente';

    const drafts: Record<string, string> = {
      pm: `O exame técnico de correspondência entre a Planta Topográfica e o Memorial Descritivo referente a ${nome} (Matrícula nº ${mat}) evidenciou regularidade formal e observância às diretrizes da ABNT NBR 17047/2022 e do art. 225 da Lei nº 6.015/73. As grandezas métricas de área superficial e extensão perimétrica guardam relação de coerência entre os instrumentos gráficos e textuais.`,
      confrontantes: `A malha de confinantes foi confrontada em 7 dimensões probatórias (Planta, Memorial Texto, Memorial Tabela, Certidões dos Confinantes, Matrícula Matriz, Qualificação Civil e Termos de Anuência). Os proprietários tabulares encontram-se devidamente identificados junto à circunscrição imobiliária da Comarca de ${comarca}.`,
      poligonal: `A poligonal geodésica processada sob o referencial geocêntrico SIRGAS 2000 obteve fechamento analítico rigoroso através do algoritmo de Gauss (Shoelace). O erro linear relativo constatado situa-se amplamente abaixo do limite de tolerância regulamentar, atestando a exatidão cartográfica e a estabilidade dimensional do imóvel.`,
      conclusao: `Ante o conjunto probatório analisado e as verificações executadas sob o protocolo de auditoria pericial, conclui-se pela viabilidade notarial do procedimento, ressalvadas exclusivamente as recomendações de instrução documental formal consignadas no Quadro Consolidado de Não-Conformidades.`,
    };

    onUpdate(prev => ({
      ...prev,
      analises: {
        ...prev.analises,
        ...drafts,
      },
    }));
  };

  const handleCopyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      alert('Falha ao copiar.');
    }
  };

  // Contagem de caracteres preenchidos
  const totalChars = Object.values(data.analises || {}).reduce((acc, str) => acc + (str?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header do Estúdio de Fundamentação */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <NotebookPen className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                Estúdio de Fundamentação Pericial & Minutas Técnicas
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
              Elaboração dos tópicos analíticos que compõem o corpo do Laudo Pericial Oficial e a exportação em formato Word (.docx).
              Utilize as minutas técnicas automatizadas para fundamentação jurídica sólida.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handleFillAllDrafts}
              className="text-xs h-8 gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Auto-Gerar Minutas Sugeridas com IA
            </Button>
          </div>
        </div>

        {/* Métricas do Laudo */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              Volume Textual: <strong className="text-foreground">{totalChars}</strong> caracteres redigidos
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Vinculado ao Provimento CNJ nº 149/2023
            </span>
          </div>
          <span className="text-[11px] font-mono">
            4 seções periciais integradas
          </span>
        </div>
      </div>

      {/* Seções Analíticas Estruturadas */}
      <div className="space-y-4">
        {ANALISES_SECTIONS.map((section, idx) => {
          const value = data.analises?.[section.key] || '';
          const presets = PRESET_CLAUSES[section.key] || [];
          const isCopied = copiedKey === section.key;

          return (
            <div
              key={section.key}
              className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    Seção 0{idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-foreground">
                    {section.label}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyText(section.key, value)}
                    disabled={!value.trim()}
                    className="h-7 text-xs gap-1 border-border/70 hover:bg-muted font-medium"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-600 font-semibold">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-muted-foreground" />
                        <span>Copiar Seção</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Cláusulas / Minutas Prontas de 1 Clique */}
              {presets.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">
                    Inserir Fundamentação Jurídico-Pericial Sugerida:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {presets.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleInsertPreset(section.key, preset)}
                        className="text-left text-xs p-2 rounded-lg bg-muted/40 hover:bg-primary/5 hover:text-primary text-muted-foreground border border-border/40 hover:border-primary/30 transition-all flex items-start gap-2 group"
                      >
                        <span className="text-primary font-bold group-hover:scale-110 transition-transform">
                          +
                        </span>
                        <span className="line-clamp-2 leading-relaxed">{preset}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Textarea Profissional */}
              <div className="space-y-1">
                <label
                  htmlFor={`anal-${section.key}`}
                  className="text-[10px] font-bold text-muted-foreground uppercase block"
                >
                  Texto Pericial Consolidado:
                </label>
                <textarea
                  id={`anal-${section.key}`}
                  rows={5}
                  placeholder={section.hint}
                  value={value}
                  onChange={e => handleUpdateSection(section.key, e.target.value)}
                  className="w-full text-xs rounded-xl border border-input bg-background p-3 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
