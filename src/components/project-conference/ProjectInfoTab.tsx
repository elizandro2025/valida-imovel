import React, { useState, useMemo } from 'react';
import { ProjectData, projectConferenceService, ProjectDocItem } from '@/services/projectConferenceService';
import { PROCEDURE_CHECKLISTS } from '@/services/projectChecklists';
import { PROJECT_LIMITS, guessDocType, validateProjectFile } from '@/services/projectAiService';
import { projectMemory } from '@/services/projectMemory';
import { useDropzone } from 'react-dropzone';
import {
  Plus,
  Sparkles,
  Trash2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Building,
  MapPin,
  Compass,
  FileCheck,
  Tag,
  Check,
  Calendar,
  User,
  Layers,
  Filter,
  Scissors,
  Combine,
  Divide,
  Home,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function mapToDocTypeLabel(guessed: string): string {
  if (guessed === 'Planta') return 'Planta Topográfica';
  if (guessed === 'Memorial') return 'Memorial Perimétrico';
  if (guessed === 'Matrícula Principal') return 'Matrícula Principal (Objeto)';
  if (guessed === 'Matrículas Confrontantes') return 'Matrículas dos Confrontantes';
  if (guessed === 'Responsabilidade Técnica') return 'Anotação de Resp. Técnica (ART/RRT)';
  if (guessed === 'Documentos Pessoais') return 'Documentos Pessoais & Qualificação';
  if (guessed === 'Certidão Municipal') return 'Certidão Municipal de Diretrizes';
  if (guessed === 'Anuência') return 'Termo de Anuência Notarial';
  if (guessed === 'Requerimento') return 'Requerimento com Firma Reconhecida';
  return 'Outro Documento Probatório';
}

interface ProjectInfoTabProps {
  data: ProjectData;
  onUpdate: (updater: (prev: ProjectData) => ProjectData) => void;
}

const DOC_STATUS_OPTIONS: ('Recebido' | 'Ausente' | 'Ilegível' | 'Incompleto')[] = [
  'Recebido',
  'Ausente',
  'Ilegível',
  'Incompleto',
];

const DOC_TYPES = [
  'Planta Topográfica',
  'Memorial Perimétrico',
  'Matrícula Principal (Objeto)',
  'Matrículas dos Confrontantes',
  'Anotação de Resp. Técnica (ART/RRT)',
  'Documentos Pessoais & Qualificação',
  'Certidão de Ônus Reais',
  'Certidão Municipal de Diretrizes',
  'Termo de Anuência Notarial',
  'Requerimento com Firma Reconhecida',
  'Outro Documento Probatório',
];

const SUGGESTED_TITLES = [
  'Retificação de Área Intra Muros — Cerqueira César / Jardins, São Paulo - SP',
  'Desdobro de Lote Urbano — PMSP / Lote 08, Quadra 12',
  'Unificação de Glebas Urbanas — Comarca da Capital (SP)',
  'Estremação de Fração Ideal em Condomínio Pró-Diviso (Prov. CNJ 149)',
  'Regularização Fundiária Urbana — REURB-S (PMSP / SEHAB)',
  'Divisão Amigável de Quinhões e Extinção de Condomínio',
];

const PROCEDURE_METADATA: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  legalBasis: string;
  tag: string;
}> = {
  desdobro: {
    icon: Scissors,
    legalBasis: 'Lei nº 6.766/79, Art. 2º',
    tag: 'Fracionamento Urbano',
  },
  retificacao: {
    icon: Compass,
    legalBasis: 'Lei nº 6.015/73, Art. 213, II',
    tag: 'Adequação Consensual',
  },
  unificacao: {
    icon: Combine,
    legalBasis: 'Lei nº 6.015/73, Art. 234',
    tag: 'Fusão de Matrículas',
  },
  estremacao: {
    icon: Layers,
    legalBasis: 'Provimento CNJ nº 149/2023',
    tag: 'Localização de Parcela',
  },
  divisao: {
    icon: Divide,
    legalBasis: 'Código Civil, Art. 1.320',
    tag: 'Extinção de Condomínio',
  },
  reurb: {
    icon: Home,
    legalBasis: 'Lei Federal nº 13.465/2017',
    tag: 'Regularização Fundiária',
  },
};

export const ProjectInfoTab: React.FC<ProjectInfoTabProps> = ({ data, onUpdate }) => {
  const [docFilter, setDocFilter] = useState<'all' | 'Recebido' | 'Ausente' | 'Pendentes'>('all');

  const updateInfo = (field: keyof ProjectData['info'], value: unknown) => {
    onUpdate(prev => ({
      ...prev,
      info: { ...prev.info, [field]: value },
    }));
  };

  const toggleProcedure = (procKey: string) => {
    onUpdate(prev => {
      const current = prev.info.procedimentos;
      const updated = current.includes(procKey)
        ? current.filter(p => p !== procKey)
        : [...current, procKey];
      return {
        ...prev,
        info: { ...prev.info, procedimentos: updated },
      };
    });
  };

  const handleAddExpectedDocs = () => {
    const expected = projectConferenceService.getExpectedDocuments(
      data.info.procedimentos,
      data.info.natureza
    );
    onUpdate(prev => {
      const existingNames = new Set(prev.docs.map(d => d.nome.toLowerCase()));
      const toAdd = expected.filter(e => !existingNames.has(e.nome.toLowerCase()));
      return {
        ...prev,
        docs: [...prev.docs, ...toAdd],
      };
    });
  };

  const handleAddDoc = () => {
    const newDoc: ProjectDocItem = {
      id: `doc-${Date.now()}`,
      nome: '',
      tipo: 'Outro Documento Probatório',
      status: 'Recebido',
      paginas: '1',
      obs: '',
    };
    onUpdate(prev => ({ ...prev, docs: [...prev.docs, newDoc] }));
  };

  const handleUpdateDoc = (id: string, field: keyof ProjectDocItem, value: string) => {
    onUpdate(prev => ({
      ...prev,
      docs: prev.docs.map(d => (d.id === id ? { ...d, [field]: value } : d)),
    }));
  };

  const handleRemoveDoc = (id: string) => {
    onUpdate(prev => ({
      ...prev,
      docs: prev.docs.filter(d => d.id !== id),
    }));
  };

  const onDropFiles = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Esta lista só registra o que foi recebido; quem lê o conteúdo é a Leitura com IA, que já recebe os arquivos
    const readable = acceptedFiles
      .filter(file => !validateProjectFile(file))
      .map((file, i) => ({ id: `doc-up-${Date.now()}-${i}`, file, tipo: guessDocType(file.name) }));
    projectMemory.setFiles([...projectMemory.getFiles(), ...readable].slice(0, PROJECT_LIMITS.maxFiles));

    onUpdate(prev => {
      const newDocs: ProjectDocItem[] = acceptedFiles.map(file => {
        const guessed = guessDocType(file.name);
        const mappedType = mapToDocTypeLabel(guessed);
        const sizeFormatted = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(0)} KB`;

        return {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          nome: file.name,
          tipo: mappedType,
          status: 'Recebido' as const,
          paginas: sizeFormatted,
          obs: `Arquivo anexado: ${file.name}`,
        };
      });

      let updatedNome = prev.info.nome;
      let updatedMatricula = prev.info.matricula;

      acceptedFiles.forEach(file => {
        const matchMatr = file.name.match(/(?:matr[ií]cula|matr|mat)[\s._-]*(\d+[\d.]*)/i);
        if (matchMatr && matchMatr[1] && (!updatedMatricula || updatedMatricula.trim() === '')) {
          updatedMatricula = matchMatr[1];
        }
        if ((!updatedNome || updatedNome.trim() === '') && /desdobro/i.test(file.name)) {
          updatedNome = 'Conferência de Desdobro de Lote Urbano';
        } else if ((!updatedNome || updatedNome.trim() === '') && /retific/i.test(file.name)) {
          updatedNome = 'Conferência de Retificação de Área (LRP)';
        }
      });

      return {
        ...prev,
        info: {
          ...prev.info,
          nome: updatedNome,
          matricula: updatedMatricula,
        },
        docs: [...prev.docs, ...newDocs],
      };
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropFiles,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/plain': ['.txt', '.csv', '.tsv', '.kml', '.dxf', '.xml'],
    },
  });

  // Estatísticas de Documentos
  const totalDocs = data.docs.length;
  const docsRecebidos = data.docs.filter(d => d.status === 'Recebido').length;
  const docsAusentes = data.docs.filter(d => d.status === 'Ausente').length;
  const docsIncompletos = data.docs.filter(d => d.status === 'Ilegível' || d.status === 'Incompleto').length;

  const filteredDocs = useMemo(() => {
    return data.docs.filter(d => {
      if (docFilter === 'Recebido') return d.status === 'Recebido';
      if (docFilter === 'Ausente') return d.status === 'Ausente';
      if (docFilter === 'Pendentes') return d.status === 'Ilegível' || d.status === 'Incompleto';
      return true;
    });
  }, [data.docs, docFilter]);

  return (
    <div className="space-y-6">
      {/* 1. HERO HUD: PASSAPORTE IMOBILIÁRIO & QUALIFICAÇÃO NOTARIAL */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Building className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                Passaporte Imobiliário & Qualificação Dominial
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Ofício Notarial Vinculado
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              Identificação pericial do fólio real, ofício imobiliário competente, ritos normativos aplicáveis e dados do responsável técnico.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Rigor Registral:
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 ${
              data.info.modoMax
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                : 'bg-muted text-muted-foreground'
            }`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              {data.info.modoMax ? 'Tolerância Zero Ativada' : 'Rigor Notarial Padrão'}
            </span>
          </div>
        </div>

        {/* GRADE ESTRUTURADA DE IDENTIFICAÇÃO (3 COLUNAS TEMÁTICAS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Identificação do Fólio Real */}
          <div className="bg-background border border-border/70 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wide border-b border-border/50 pb-2">
              <FileCheck className="w-4 h-4" />
              <span>1. Identificação Dominial</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                <span>Matrícula Imobiliária (Nº):</span>
                <span className="text-[10px] font-mono text-muted-foreground">Fólio Real</span>
              </label>
              <Input
                type="text"
                placeholder="Ex: 114.892 (Livro 2 - Reg. Geral)"
                value={data.info.matricula}
                onChange={e => updateInfo('matricula', e.target.value)}
                className="h-9 text-xs font-mono font-bold bg-card"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground block">
                Denominação da Operação Pericial:
              </label>
              <Input
                type="text"
                placeholder="Ex: Retificação de Área Intra Muros e Desdobro — Cerqueira César / Jardins"
                value={data.info.nome}
                onChange={e => updateInfo('nome', e.target.value)}
                className="h-9 text-xs bg-card font-medium"
              />
              <div className="flex items-center gap-1 flex-wrap pt-1">
                {SUGGESTED_TITLES.slice(0, 2).map(title => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => updateInfo('nome', title)}
                    className="text-[10px] text-muted-foreground hover:text-primary transition-colors truncate max-w-full"
                  >
                    + {title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground block">
                Interessado(s) / Requerente(s):
              </label>
              <Input
                type="text"
                placeholder="Ex: Dr. Marcelo Prado Botelho e Dra. Camila Siqueira Prado Botelho"
                value={data.info.cliente}
                onChange={e => updateInfo('cliente', e.target.value)}
                className="h-9 text-xs bg-card"
              />
            </div>
          </div>

          {/* Card 2: Serventia & Circunscrição Notarial */}
          <div className="bg-background border border-border/70 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-wide border-b border-border/50 pb-2">
              <Building className="w-4 h-4" />
              <span>2. Ofício Registral & Comarca</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground block">
                Ofício de Registro de Imóveis (Cartório / CNS):
              </label>
              <Input
                type="text"
                placeholder="Ex: 14º Oficial de Registro de Imóveis da Capital - SP (CNS: 11.134-4)"
                value={data.info.cartorio}
                onChange={e => updateInfo('cartorio', e.target.value)}
                className="h-9 text-xs bg-card"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground block">
                  Município:
                </label>
                <Input
                  type="text"
                  placeholder="Ex: São Paulo"
                  value={data.info.municipio}
                  onChange={e => updateInfo('municipio', e.target.value)}
                  className="h-9 text-xs bg-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground block">
                  Comarca:
                </label>
                <Input
                  type="text"
                  placeholder="Ex: São Paulo (Capital)"
                  value={data.info.comarca}
                  onChange={e => updateInfo('comarca', e.target.value)}
                  className="h-9 text-xs bg-card"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground block">
                  Estado (UF):
                </label>
                <Input
                  type="text"
                  maxLength={2}
                  placeholder="UF"
                  value={data.info.uf}
                  onChange={e => updateInfo('uf', e.target.value.toUpperCase())}
                  className="h-9 text-xs uppercase font-bold bg-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground block">
                  Regime Territorial:
                </label>
                <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 h-9">
                  <button
                    type="button"
                    onClick={() => updateInfo('natureza', 'urbano')}
                    className={`flex-1 h-full rounded text-xs font-semibold transition-all ${
                      data.info.natureza === 'urbano'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Urbano
                  </button>
                  <button
                    type="button"
                    onClick={() => updateInfo('natureza', 'rural')}
                    className={`flex-1 h-full rounded text-xs font-semibold transition-all ${
                      data.info.natureza === 'rural'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Rural
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Responsabilidade Profissional & Vistoria */}
          <div className="bg-background border border-border/70 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wide border-b border-border/50 pb-2">
              <User className="w-4 h-4" />
              <span>3. Responsabilidade Técnica & Perícia</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground block">
                Profissional Responsável Técnico (RT):
              </label>
              <Input
                type="text"
                placeholder="Ex: Eng. Agrimensor Rodrigo Mendonça Ribeiro (CREA-SP 506.284/D)"
                value={data.info.rt}
                onChange={e => updateInfo('rt', e.target.value)}
                className="h-9 text-xs bg-card"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground block">
                Perito / Auditor Responsável:
              </label>
              <Input
                type="text"
                placeholder="Ex: Auditoria Notarial Especializada — Normas CGJ-SP"
                value={data.info.conferente || ''}
                onChange={e => updateInfo('conferente', e.target.value)}
                className="h-9 text-xs bg-card"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                <span>Data da Auditoria / Vistoria:</span>
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              </label>
              <Input
                type="date"
                value={data.info.data}
                onChange={e => updateInfo('data', e.target.value)}
                className="h-9 text-xs bg-card font-mono"
              />
            </div>
          </div>
        </div>

        {/* 2. RITOS REGISTRAIS: CARDS INTERATIVOS DE ALTA PERFORMANCE */}
        <div className="space-y-3 pt-3 border-t border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-foreground block">
                Enquadramento do Procedimento Registral (Rito Operacional)
              </span>
              <p className="text-[11px] text-muted-foreground">
                Selecione os ritos aplicáveis para parametrizar automaticamente os quesitos e documentos exigidos.
              </p>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">
              {data.info.procedimentos.length} procedimento(s) ativo(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PROCEDURE_CHECKLISTS.map(proc => {
              const isSelected = data.info.procedimentos.includes(proc.key);
              const meta = PROCEDURE_METADATA[proc.key] || {
                icon: Layers,
                legalBasis: 'Normas de Serviço da Corregedoria',
                tag: 'Procedimento',
              };
              const ProcIcon = meta.icon;

              return (
                <button
                  key={proc.key}
                  type="button"
                  onClick={() => toggleProcedure(proc.key)}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-150 flex items-start gap-3 relative overflow-hidden ${
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/30'
                      : 'bg-background hover:bg-muted/40 border-border/70 hover:border-border'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <ProcIcon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-foreground truncate">
                        {proc.name}
                      </span>
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-3" />
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          {meta.tag}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-primary/80 block mt-0.5">
                      {meta.legalBasis}
                    </span>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">
                      {proc.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* BANNER DE RIGOR REGISTRAL / TOLERÂNCIA ZERO */}
          <div
            onClick={() => updateInfo('modoMax', !data.info.modoMax)}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 select-none ${
              data.info.modoMax
                ? 'bg-rose-500/10 border-rose-500/30 ring-1 ring-rose-500/20'
                : 'bg-muted/30 border-border/70 hover:border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  data.info.modoMax ? 'bg-rose-600 text-white shadow-sm' : 'bg-muted text-muted-foreground'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  Protocolo de Tolerância Zero Notarial (ABNT NBR 17047 / Normas CGJ)
                  {data.info.modoMax && (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-500 text-white uppercase">
                      Ativo
                    </span>
                  )}
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Apontamento rigoroso de pequenas divergências ortográficas, patronímicos abreviados, discrepâncias milimétricas e certidões com prazo superior a 30 dias para evitar emissão de Nota Devolutiva.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <div
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                  data.info.modoMax ? 'bg-rose-600 justify-end' : 'bg-muted justify-start border border-border'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COFRE DE PEÇAS TÉCNICAS & INVENTÁRIO PROBATÓRIO */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Cofre de Peças Técnicas & Inventário Probatório
            </h3>
            <p className="text-xs text-muted-foreground">
              Mapeamento de higidez probatória, legibilidade e autenticidade das peças e certidões apresentadas.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddExpectedDocs}
              className="text-xs h-8 gap-1.5 border-border/80 hover:bg-muted font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Auto-Carregar Peças Obrigatórias do Rito
            </Button>
            <Button
              size="sm"
              onClick={handleAddDoc}
              className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              + Nova Peça
            </Button>
          </div>
        </div>

        {/* Dropzone de Upload e Reconhecimento Automático de Peças */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all duration-200 select-none ${
            isDragActive
              ? 'border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20'
              : 'border-border/80 hover:border-primary/50 hover:bg-muted/30 bg-card/60'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-2xs">
              <Upload className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                {isDragActive
                  ? 'Solte as peças técnicas aqui...'
                  : 'Arraste e solte as peças do projeto aqui'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                PDF, JPG/PNG, KML, TXT ou DXF (Planta, Memorial, Matrícula, ART, Alvará) · O tipo é sugerido pelo nome do
                arquivo; o conteúdo é lido na etapa Leitura com IA, onde os arquivos já ficam na lista
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8 font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5 pointer-events-none mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Selecionar Arquivos do Computador</span>
            </Button>
          </div>
        </div>

        {/* HUD e Filtros de Peças Técnicas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Exibir:
            </span>
            <button
              onClick={() => setDocFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                docFilter === 'all'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:border-border'
              }`}
            >
              Todas ({totalDocs})
            </button>
            <button
              onClick={() => setDocFilter('Recebido')}
              className={`px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                docFilter === 'Recebido'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}
            >
              Recebidas ({docsRecebidos})
            </button>
            <button
              onClick={() => setDocFilter('Ausente')}
              className={`px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                docFilter === 'Ausente'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}
            >
              Ausentes ({docsAusentes})
            </button>
            <button
              onClick={() => setDocFilter('Pendentes')}
              className={`px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                docFilter === 'Pendentes'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}
            >
              Incompletas ({docsIncompletos})
            </button>
          </div>

          <div className="text-[11px] font-medium text-muted-foreground">
            {docsAusentes > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {docsAusentes} documento(s) faltante(s) bloqueiam o registro
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Todas as peças essenciais foram apresentadas
              </span>
            )}
          </div>
        </div>

        {/* LISTA DE CARTÕES DE PEÇAS TÉCNICAS (DESIGN MODERNO) */}
        {filteredDocs.length === 0 ? (
          <div className="bg-muted/10 border border-dashed border-border/80 rounded-2xl p-8 text-center space-y-3">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">
              Nenhuma peça técnica listada para o filtro atual.
            </p>
            <Button size="sm" variant="outline" onClick={handleAddExpectedDocs} className="text-xs gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Carregar Peças Obrigatórias do Rito
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDocs.map((doc, idx) => {
              const isRecebido = doc.status === 'Recebido';
              const isAusente = doc.status === 'Ausente';

              return (
                <div
                  key={doc.id}
                  className={`bg-background border rounded-xl p-4 space-y-3 transition-all ${
                    isAusente
                      ? 'border-rose-500/30 bg-rose-500/[0.02]'
                      : isRecebido
                      ? 'border-border/70 hover:border-border'
                      : 'border-amber-500/30 bg-amber-500/[0.02]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2.5">
                    <div className="flex-1 min-w-0 space-y-1">
                      <Input
                        type="text"
                        value={doc.nome}
                        onChange={e => handleUpdateDoc(doc.id, 'nome', e.target.value)}
                        placeholder="Ex: Memorial Descritivo com Coordenadas UTM SIRGAS 2000 (Fuso 23S)..."
                        className="h-8 text-xs font-bold bg-card"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <select
                          value={doc.tipo}
                          onChange={e => handleUpdateDoc(doc.id, 'tipo', e.target.value)}
                          className="h-6 text-[10px] font-semibold px-2 rounded-md border border-input bg-card text-muted-foreground cursor-pointer"
                        >
                          {DOC_TYPES.map(t => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Págs/Fólios:
                        </span>
                        <Input
                          type="text"
                          value={doc.paginas}
                          onChange={e => handleUpdateDoc(doc.id, 'paginas', e.target.value)}
                          placeholder="Fls. 1–3"
                          className="h-6 w-16 text-[10px] text-center font-mono bg-card p-0"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1 rounded-md text-muted-foreground hover:text-rose-600 transition-colors"
                      title="Excluir peça técnica"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Segmented Status Pill Selector de 1 Clique */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">
                      Situação Probatória:
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      {DOC_STATUS_OPTIONS.map(st => {
                        const isStActive = doc.status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateDoc(doc.id, 'status', st)}
                            className={`py-1 text-[10px] font-semibold rounded-md transition-all text-center ${
                              isStActive
                                ? st === 'Recebido'
                                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                                  : st === 'Ausente'
                                  ? 'bg-rose-600 text-white shadow-2xs font-bold'
                                  : 'bg-amber-600 text-white shadow-2xs font-bold'
                                : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Observação / Finalidade Probatória */}
                  <div className="space-y-1">
                    <Input
                      type="text"
                      value={doc.obs}
                      onChange={e => handleUpdateDoc(doc.id, 'obs', e.target.value)}
                      placeholder="Ex: Certidão com negativa de ônus expedida há menos de 30 dias pelo 14º RI da Capital, sem gravames pendentes."
                      className="h-7 text-[11px] bg-card text-muted-foreground"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
