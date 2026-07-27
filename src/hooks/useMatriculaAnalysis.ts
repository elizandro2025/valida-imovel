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

  const loadSampleReport = useCallback((sampleType: 'safe' | 'risk' = 'safe') => {
    const mockFile = new File(['mock content'], sampleType === 'safe' ? 'Matricula_Exemplo_Segura_142890.pdf' : 'Matricula_Exemplo_Com_Penhora_88420.pdf', { type: 'application/pdf' });

    const safeReport = {
      identificacao_geral: {
        matricula: '142.890',
        cartorio_ri: '1º Oficial de Registro de Imóveis',
        comarca: 'São Paulo/SP',
        livro: '2 - Registro Geral',
        folha: '01',
        data_abertura: '14/03/2012',
        tipo_imovel_analisado: 'Urbano (Apartamento Residencial)',
        codigo_imovel: 'SQL: 012.345.0678-9',
        serventia: 'CNS: 11.223-4'
      },
      caracteristicas_fisicas: {
        endereco_completo: 'Rua Oscar Freire, nº 1.050, Apto 102 — Cerqueira César, São Paulo/SP',
        denominacao_imovel: 'Edifício Horizon Tower',
        area_total_m2: '142,50',
        loteamento_quadra_lote: 'Quadra 14, Lote 5',
        perimetros_confrontacoes: 'Frente para a Rua Oscar Freire; lado direito com o lote 6; lado esquerdo com o lote 4.',
        benfeitorias: 'Apartamento residencial com 3 suítes, 2 vagas de garagem demarcadas nº 34A e 34B.',
        descricao_legal: 'Apartamento nº 102 localizado no 10º andar do Edifício Horizon Tower, com área privativa de 142,50m².'
      },
      memorial_descritivo_georreferenciamento: {
        possui_georreferenciamento: false,
        status_sigef: 'Não aplicável (Imóvel Urbano)',
        codigo_incra: 'N/A',
        car_registro: 'N/A'
      },
      regimes_especiais: {
        eh_condominio: true,
        nome_condominio: 'Condomínio Edifício Horizon Tower',
        convencao_registrada: 'R-2 / 142.890',
        eh_loteamento: false
      },
      proprietarios_atuais: [
        {
          nome: 'CARLOS EDUARDO FARIA',
          cpf_cnpj: '123.456.789-00',
          qualificacao: 'Brasileiro, empresário, casado no regime de comunhão parcial de bens',
          percentual_propriedade: '50%',
          estado_civil: 'Casado'
        },
        {
          nome: 'MARIANA SILVEIRA FARIA',
          cpf_cnpj: '987.654.321-11',
          qualificacao: 'Brasileira, advogada, casada',
          percentual_propriedade: '50%',
          estado_civil: 'Casada'
        }
      ],
      cadeia_dominial: [
        { numero_ato: 'R-1', tipo_transmissao: 'Compra e Venda', adquirentes: 'Construtora Horizon S/A', transmitentes: 'Loteadora Jardins Ltda', data_ato: '10/01/2010' },
        { numero_ato: 'R-3', tipo_transmissao: 'Escritura Pública de Compra e Venda', adquirentes: 'Carlos Eduardo Faria e Mariana Silveira Faria', transmitentes: 'Construtora Horizon S/A', data_ato: '15/05/2018' }
      ],
      onus_garantias_financeiras: [],
      indisponividades_e_penhoras: [],
      usufruto_servidoes_e_direitos: [],
      onus_gravames_ativos: [],
      parecer_analise: {
        score_risco: 15,
        nivel_risco: 'BAIXO',
        status_juridico: 'REGULAR — LIVRE DE ÔNUS',
        explicacao_descomplicada: 'O imóvel está 100% regular, no nome dos proprietários Carlos Eduardo e Mariana Faria. Não há dívidas, hipotecas ou impedimentos registrados na matrícula.',
        resumo_geral: 'Imóvel residencial totalmente quitado e sem restrições. Cadeia dominial perfeita sem interrupções.',
        recomendacao_final: 'Imóvel seguro para compra, venda ou financiamento bancário.',
        riscos_identificados: [],
        pendencias_formais: [],
        regularidades_e_conformidade: [
          'Matrícula com 100% de clareza registrária',
          'Ausência total de penhoras judiciais ou apontamentos CNIB',
          'Titularidade perfeitamente individualizada'
        ]
      }
    };

    const riskReport = {
      identificacao_geral: {
        matricula: '88.420',
        cartorio_ri: '3º Oficial de Registro de Imóveis',
        comarca: 'Rio de Janeiro/RJ',
        livro: '2 - Registro Geral',
        folha: '45',
        data_abertura: '08/09/2005',
        tipo_imovel_analisado: 'Urbano (Prédio Comercial)',
        codigo_imovel: 'IPTU: 0.123.456-7',
        serventia: 'CNS: 09.876-5'
      },
      caracteristicas_fisicas: {
        endereco_completo: 'Rua Voluntários da Pátria, nº 240 — Botafogo, Rio de Janeiro/RJ',
        denominacao_imovel: 'Prédio Comercial Botafogo Business',
        area_total_m2: '320,00',
        loteamento_quadra_lote: 'Lote 12',
        perimetros_confrontacoes: 'Frente para a Rua Voluntários da Pátria; fundos com morro de São João.',
        benfeitorias: 'Prédio comercial de 2 pavimentos com recepção, 6 salas e estacionamento privativo.',
        descricao_legal: 'Prédio comercial edificado no lote 12 com área construída de 320,00m².'
      },
      memorial_descritivo_georreferenciamento: { possui_georreferenciamento: false, status_sigef: 'N/A' },
      regimes_especiais: { eh_condominio: false, eh_loteamento: false },
      proprietarios_atuais: [
        { nome: 'ROBERTO MAGALHÃES SOBRINHO', cpf_cnpj: '456.789.123-44', qualificacao: 'Brasileiro, divorciado', percentual_propriedade: '100%', estado_civil: 'Divorciado' }
      ],
      cadeia_dominial: [
        { numero_ato: 'R-2', tipo_transmissao: 'Compra e Venda', adquirentes: 'Roberto Magalhães Sobrinho', transmitentes: 'Empreendimentos Carioca Ltda', data_ato: '22/11/2012' }
      ],
      onus_garantias_financeiras: [
        { numero_ato: 'R-4', tipo: 'Alienação Fiduciária em Garantia', credor_banco: 'Banco Itaú Unibanco S/A', valor_garantia: 'R$ 650.000,00', status: 'ATIVO' }
      ],
      indisponividades_e_penhoras: [
        { numero_ato: 'AV-5', tipo: 'Indisponibilidade de Bens (CNIB)', processo_vara: 'Processo nº 0012345-67.2023.8.19.0001 — 2ª Vara de Execuções Fiscais/RJ', autor_exequente: 'Fazenda Nacional', status: 'ATIVO' },
        { numero_ato: 'R-6', tipo: 'Penhora Judicial Trabalhista', processo_vara: 'Processo TRT-1 nº 0098765-12.2022.5.01.0004 — 4ª Vara do Trabalho/RJ', autor_exequente: 'Sindicato dos Trabalhadores', valor_garantia: 'R$ 120.000,00', status: 'ATIVO' }
      ],
      usufruto_servidoes_e_direitos: [],
      onus_gravames_ativos: [
        { tipo: 'Alienação Fiduciária', credor_banco: 'Banco Itaú Unibanco S/A', valor_garantia: 'R$ 650.000,00' },
        { tipo: 'Indisponibilidade CNIB', processo_vara: '2ª Vara de Execuções Fiscais' },
        { tipo: 'Penhora Trabalhista', processo_vara: '4ª Vara do Trabalho/RJ' }
      ],
      parecer_analise: {
        score_risco: 85,
        nivel_risco: 'CRÍTICO',
        status_juridico: 'EXIGE ATENÇÃO JURÍDICA E DEVIDA DILIGÊNCIA',
        explicacao_descomplicada: 'ATENÇÃO: Este imóvel possui 3 restrições sérias: Alienação Fiduciária ao Banco Itaú, Penhora Trabalhista e Indisponibilidade de Bens registrada no sistema CNIB.',
        resumo_geral: 'Imóvel com grave comprometimento patrimonial. Há gravames financeiros e indisponibilidade decretada por juízo federal e trabalhista.',
        recomendacao_final: 'NÃO RECOMENDADO para aquisição direta sem prévia quitação judicial dos processos averbados.',
        riscos_identificados: [
          { descricao: 'Indisponibilidade Geral de Bens CNIB averbada sob AV-5', tipo_risco: 'CRÍTICO', impacto: 'Impossibilita a lavratura de escritura pública válida', acao_recomendada: 'Verificar cancelamento da indisponibilidade junto à 2ª Vara de Execuções Fiscais' },
          { descricao: 'Alienação Fiduciária bancária pendente sob R-4 (R$ 650.000,00)', tipo_risco: 'ALTO', impacto: 'Propriedade fiduciária pertence à instituição financeira', acao_recomendada: 'Solicitar termo de quitação fiduciária' }
        ],
        pendencias_formais: [
          'Necessidade de Certidão Negativa de Feitos Trabalhistas (CNDT)',
          'Certidão de Objeto e Pé dos processos averbados'
        ],
        regularidades_e_conformidade: []
      }
    };

    const targetReport = sampleType === 'safe' ? safeReport : riskReport;

    setState({
      file: mockFile,
      isProcessing: false,
      progress: 100,
      currentStep: `Exemplo Instantâneo Carregado (${sampleType === 'safe' ? 'Imóvel Seguro' : 'Imóvel com Penhoras'})`,
      report: targetReport,
      error: null
    });
  }, []);

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
    loadSampleReport,
    clearFile,
    closeError,
    steps: ANALYSIS_STEPS
  };
};