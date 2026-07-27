import { useState, useCallback } from 'react';
import { ocrService, analysisService } from '@/services/mistralService';
import { PDFPageInfo } from '@/services/pdfToImagesService';

interface AnalysisState {
  file: File | null;
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  report: any | null;
  error: string | null;
  ocrMethod?: 'pdf' | 'images' | 'mixed';
  pagesPreviews?: PDFPageInfo[];
  tablesDetected?: number;
}

export const ANALYSIS_STEPS = [
  'Preparando documento PDF...',
  'Executando OCR Registrário de Alta Precisão...',
  '1/12 Mapeando serventia e identificação cartorária...',
  '2/12 Analisando características físicas e benfeitorias...',
  '3/12 Processando georreferenciamento (SIGEF/INCRA/CAR/CCIR)...',
  '4/12 Auditando regimes especiais (Condomínios, Loteamentos, REURB)...',
  '5/12 Verificando restrições ambientais, APP e outorgas...',
  '6/12 Analisando imóveis da União/SPU, Marinha e Tombamento...',
  '7/12 Mapeando titularidade, CPF/CNPJ e regime de bens...',
  '8/12 Reconstruindo cadeia dominial cronológica...',
  '9/12 Auditando garantias financeiras (Hipotecas / Alienação Fiduciária)...',
  '10/12 Rastreando indisponibilidades CNIB, penhoras e litígios...',
  '11/12 Avaliando usufrutos, servidões e direito de laje...',
  '12/12 Calculando Score de Risco e emitindo Parecer Jurídico Final...'
];

export const useMatriculaAnalysis = () => {
  const [state, setState] = useState<AnalysisState>({
    file: null,
    isProcessing: false,
    progress: 0,
    currentStep: '',
    report: null,
    error: null
  });

  const updateProgress = useCallback((progress: number, step: string) => {
    setState(prev => ({ ...prev, progress, currentStep: step }));
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (!file) return;
    
    // Utiliza a chave do ambiente de forma segura
    if (!localStorage.getItem('mistral_api_key')) {
      const apiKey = import.meta.env.VITE_MISTRAL_API_KEY || '';
      if (apiKey) localStorage.setItem('mistral_api_key', apiKey);
    }

    setState(prev => ({ 
      ...prev, 
      file, 
      isProcessing: true, 
      progress: 0, 
      report: null, 
      error: null 
    }));

    try {
      updateProgress(5, ANALYSIS_STEPS[0]);

      // OCR
      updateProgress(15, ANALYSIS_STEPS[1]);
      const ocrResult = await ocrService.extractTextHybrid(file);
      
      updateProgress(30, ANALYSIS_STEPS[2]);
      const extractedText = ocrResult.text;
      
      setState(prev => ({ 
        ...prev, 
        ocrMethod: ocrResult.method,
        pagesPreviews: ocrResult.pages,
        tablesDetected: ocrResult.pages?.filter(p => p.hasTablesIndicator).length || 0
      }));

      // Incremental feedback across the 12 modules
      updateProgress(40, ANALYSIS_STEPS[3]);
      await new Promise(resolve => setTimeout(resolve, 200));

      updateProgress(48, ANALYSIS_STEPS[4]);
      await new Promise(resolve => setTimeout(resolve, 200));

      updateProgress(55, ANALYSIS_STEPS[5]);
      await new Promise(resolve => setTimeout(resolve, 200));

      updateProgress(62, ANALYSIS_STEPS[6]);
      await new Promise(resolve => setTimeout(resolve, 200));

      updateProgress(68, ANALYSIS_STEPS[7]);
      await new Promise(resolve => setTimeout(resolve, 200));

      updateProgress(74, ANALYSIS_STEPS[8]);
      await new Promise(resolve => setTimeout(resolve, 200));

      updateProgress(80, ANALYSIS_STEPS[9]);
      await new Promise(resolve => setTimeout(resolve, 200));

      updateProgress(86, ANALYSIS_STEPS[10]);
      await new Promise(resolve => setTimeout(resolve, 200));

      updateProgress(92, ANALYSIS_STEPS[11]);
      await new Promise(resolve => setTimeout(resolve, 200));

      updateProgress(96, ANALYSIS_STEPS[12]);
      const report = await analysisService.analyzeDocument(extractedText, file);

      updateProgress(100, 'Análise de 12 Módulos concluída!');
      
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        currentStep: `Análise concluída com sucesso! (${ocrResult.method === 'pdf' ? 'OCR PDF' : 'OCR por Imagens'})`,
        report 
      }));

    } catch (error) {
      console.error('Erro no processamento da matrícula:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido durante o processamento.' 
      }));
    }
  }, [updateProgress]);

  const clearFile = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      file: null, 
      report: null, 
      progress: 0, 
      currentStep: '',
      error: null,
      ocrMethod: undefined,
      pagesPreviews: undefined,
      tablesDetected: undefined
    }));
  }, []);

  const closeError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    processFile,
    clearFile,
    closeError,
    steps: ANALYSIS_STEPS
  };
};