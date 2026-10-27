import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectData, computeAutomaticOpinion, createEmptyProject, projectHasContent } from '@/services/projectConferenceService';
import {
  Compass,
  FolderOpen,
  PlusCircle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectHeaderProps {
  data: ProjectData;
  onUpdate: (updater: (prev: ProjectData) => ProjectData) => void;
  onReset: () => void;
  onLoadSample?: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  data,
  onUpdate,
  onReset,
  onLoadSample,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (data.info.nome || 'projeto_pericial_validaimovel')
      .toLowerCase()
      .replace(/\s+/g, '_');
    a.href = url;
    a.download = `${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 400);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string) as Partial<ProjectData>;
        // Arquivo exportado por esta tela: completa o que faltar com um projeto em branco para nenhuma aba quebrar
        if (!parsed || typeof parsed !== 'object' || typeof parsed.info !== 'object' || typeof parsed.polygon !== 'object') {
          throw new Error('formato inesperado');
        }
        const blank = createEmptyProject();
        onUpdate(() => ({
          ...blank,
          ...parsed,
          info: { ...blank.info, ...parsed.info },
          polygon: { ...blank.polygon, ...parsed.polygon },
          parecer: { ...blank.parecer, ...parsed.parecer },
        }));
        setImportError(null);
      } catch (err) {
        console.warn('Projeto não importado:', err);
        setImportError('Este arquivo não é um projeto exportado pelo ValidaImóvel. Escolha o arquivo .json gerado pelo botão Exportar.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const { opinion } = computeAutomaticOpinion(data);
  // Projeto vazio ainda não tem parecer: mostra "Projeto novo" em vez de "incompleto"
  const isNewProject = !projectHasContent(data);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Lado Esquerdo: Identidade Exclusiva ValidaImóvel Pericial */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2 truncate">
                <span>Conferência de projeto</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  {data.isSample ? 'Exemplo' : 'Conferência assistida'}
                </span>
              </h1>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {data.info.nome
                ? `${data.info.nome} · Matr. ${data.info.matricula || 'S/N'}`
                : 'Planta, memorial e documentos conferidos antes do cartório'}
            </p>
          </div>
        </div>

        {/* Status Pericial & Ações de Topo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Badge Dinâmico */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isNewProject
                ? 'bg-primary/10 text-primary border-primary/20'
                : opinion === 'DOCUMENTAÇÃO COMPATÍVEL'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : opinion === 'DOCUMENTAÇÃO COM DIVERGÊNCIAS'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
            }`}
          >
            {opinion === 'DOCUMENTAÇÃO COMPATÍVEL' ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : opinion === 'DOCUMENTAÇÃO COM DIVERGÊNCIAS' ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <FileCheck2 className="w-3.5 h-3.5" />
            )}
            <span>{isNewProject ? 'Projeto novo' : opinion}</span>
          </div>

          {/* Botão de Demonstração Pericial */}
          {onLoadSample && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadSample}
              className="text-xs h-8 gap-1.5 px-3 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary shadow-2xs font-semibold"
              title="Abrir um projeto de exemplo, com dados fictícios"
              aria-label="Ver exemplo com dados fictícios"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Ver exemplo</span>
            </Button>
          )}

          {/* Botão Portal */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app')}
            className="text-xs h-8 gap-1.5 px-2.5 text-muted-foreground hover:text-foreground"
            title="Voltar ao início"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Início</span>
          </Button>

          {/* Botão Novo */}
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-xs h-8 gap-1 px-2.5"
            title="Limpar e iniciar um novo projeto"
            aria-label="Novo projeto"
          >
            <PlusCircle className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Novo</span>
          </Button>

          {/* Abrir JSON */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs h-8 gap-1 px-2.5"
            title="Abrir um projeto exportado (.json)"
            aria-label="Abrir projeto exportado"
          >
            <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Abrir</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />

          {/* Salvar JSON */}
          <Button
            size="sm"
            onClick={handleExportJson}
            className="text-xs h-8 gap-1.5 px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs font-semibold"
            title="Exportar arquivo de auditoria (.json)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>
      {importError && (
        <p role="alert" className="mt-3 text-xs text-destructive">{importError}</p>
      )}
    </div>
  );
};
