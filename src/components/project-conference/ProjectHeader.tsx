import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectData, computeAutomaticOpinion } from '@/services/projectConferenceService';
import {
  Compass,
  FolderOpen,
  Save,
  PlusCircle,
  ArrowLeft,
  Moon,
  Sun,
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
  lastSavedText: string;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  data,
  onUpdate,
  onReset,
  onLoadSample,
  lastSavedText,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

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
        const parsed = JSON.parse(evt.target?.result as string);
        onUpdate(() => parsed);
      } catch (err) {
        alert(
          'Arquivo JSON inválido: ' +
            (err instanceof Error ? err.message : String(err))
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const { opinion } = computeAutomaticOpinion(data);

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
                <span>ValidaImóvel Pericial</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  IA Autônoma
                </span>
              </h1>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {data.info.nome
                ? `${data.info.nome} · Matr. ${data.info.matricula || 'S/N'}`
                : 'Auditoria Técnica, Geodésica & Registral Integrada · ABNT NBR 17047 & Normas CGJ'}
            </p>
          </div>
        </div>

        {/* Status Pericial & Ações de Topo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Badge Dinâmico */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              opinion === 'DOCUMENTAÇÃO COMPATÍVEL'
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
            <span>{opinion}</span>
          </div>

          {/* Botão de Demonstração Pericial */}
          {onLoadSample && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadSample}
              className="text-xs h-8 gap-1.5 px-3 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary shadow-2xs font-semibold"
              title="Carregar caso modelo pericial completo de São Paulo (SP) — Oscar Freire / 14º RI da Capital"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Simular Dados SP</span>
            </Button>
          )}

          {/* Botão Portal */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app')}
            className="text-xs h-8 gap-1.5 px-2.5 text-muted-foreground hover:text-foreground"
            title="Voltar ao portal principal"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portal</span>
          </Button>

          {/* Botão Novo */}
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-xs h-8 gap-1 px-2.5"
            title="Limpar e iniciar um novo projeto"
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
            title="Abrir arquivo de auditoria (.json)"
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

          {/* Toggle Tema Claro / Escuro */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            aria-label="Alternar tema"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </div>
  );
};
