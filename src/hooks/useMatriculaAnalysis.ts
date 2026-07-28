import { useState, useCallback } from 'react';
import { analyzeMatricula, MatriculaReport, AnalysisProgressCallback } from '@/services/mistralService';
import { subscriptionService } from '@/services/subscriptionService';

export interface AnalysisState {
  file: File | null;
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  report: MatriculaReport | null;
  error: string | null;
  ocrMethod?: 'tesseract' | 'pdfjs_text' | 'mistral_ocr';
  pagesPreviews?: string[];
  tablesDetected?: number;
}

export function useMatriculaAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    file: null,
    isProcessing: false,
    progress: 0,
    currentStep: '',
    report: null,
    error: null,
  });

  const updateProgress: AnalysisProgressCallback = useCallback((step, progress, details) => {
    setState(prev => ({
      ...prev,
      currentStep: details?.message || step,
      progress,
      ocrMethod: details?.ocrMethod || prev.ocrMethod,
      pagesPreviews: details?.pagesPreviews || prev.pagesPreviews,
      tablesDetected: details?.tablesDetected ?? prev.tablesDetected,
    }));
  }, []);

  const processFile = useCallback(async (file: File) => {
    // 🛡️ Paywall Check
    const subStatus = subscriptionService.getStatus();
    if (!subStatus.active) {
      const stored = localStorage.getItem('valida_imovel_subscription');
      if (!stored) {
        console.log('🔒 Usuário sem assinatura ativa — permitindo auditoria mas ativando travamento paywall no relatório.');
      }
    }

    setState({
      file,
      isProcessing: true,
      progress: 5,
      currentStep: 'Iniciando leitura e extração de texto do documento...',
      report: null,
      error: null,
    });

    try {
      const report = await analyzeMatricula(file, updateProgress);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100,
        currentStep: 'Auditoria notarial concluída com sucesso!',
        report,
      }));
    } catch (err: any) {
      console.error('Erro na análise da matrícula:', err);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 0,
        currentStep: '',
        error: err.message || 'Falha ao processar a matrícula. Verifique o arquivo e tente novamente.',
      }));
    }
  }, [updateProgress]);

  /**
   * Demonstração de Exemplo Ultra-Nutrida de Imóvel Rural (UX 2.0)
   * Destaca Georreferenciamento SIGEF/INCRA, Reserva Legal averbada, CAR e Cadeia Dominial Completa.
   */
  const loadSampleReport = useCallback((sampleType: 'safe' | 'risk' = 'safe') => {
    const fileName = sampleType === 'safe' 
      ? 'Matricula_Rural_Fazenda_Santa_Maria_45210_INCRA_SIGEF.pdf' 
      : 'Matricula_Rural_Com_Embargo_Ambiental_18920.pdf';

    const mockFile = new File(['mock content'], fileName, { type: 'application/pdf' });

    // Inicia a simulação animada de auditoria da IA
    setState({
      file: mockFile,
      isProcessing: true,
      progress: 10,
      currentStep: '⚡ Lendo certidão de imóvel rural em formato PDF digital...',
      report: null,
      error: null,
    });

    // Animação de varredura dos Módulos Registrais Rurais
    setTimeout(() => {
      setState(prev => ({ ...prev, progress: 35, currentStep: '🔍 Consultando Livro 2, Código INCRA e Inscrição ITR/NIRF...' }));
    }, 500);

    setTimeout(() => {
      setState(prev => ({ ...prev, progress: 65, currentStep: '🌿 Mapeando CAR, Reserva Legal (20%), APP e Certificação SIGEF/INCRA...' }));
    }, 1100);

    setTimeout(() => {
      setState(prev => ({ ...prev, progress: 90, currentStep: '📜 Rastreando Cadeia Dominial Cronológica e baixas de Cédulas Rurais...' }));
    }, 1700);

    setTimeout(() => {
      // RELATÓRIO RURAL ULTRA-DETALHADO E NUTRIDO
      const richRuralReport: MatriculaReport = {
        identificacao_geral: {
          matricula: '45.210',
          cartorio_ri: '1º Oficial de Registro de Imóveis e Anexos',
          comarca: 'Ribeirão Preto / Luis Antônio — SP',
          livro: '2 — Registro Geral',
          folha: '01 a 04',
          data_abertura: '18/06/1998',
          tipo_imovel_analisado: 'RURAL (Fazenda de Produção Agrícola e Preservação Ambiental)',
          codigo_imovel: 'CCIR/INCRA: 950.123.456.789-0 | ITR/NIRF: 8.765.432-1',
          serventia: 'CNS: 12.048-5'
        },
        caracteristicas_fisicas: {
          endereco_completo: 'Estrada Municipal LUIS-040, Km 12 — Zona Rural, Luis Antônio / Ribeirão Preto — SP — CEP 14210-000',
          denominacao_imovel: 'FAZENDA SANTA MARIA DO RIO PARDO',
          area_total_m2: '4.500.000,00 m² (450,00 Hectares — 185,95 Alqueires Paulistas)',
          loteamento_quadra_lote: 'Gleba A — Colônia Santa Maria',
          perimetros_confrontacoes: 'Inicia no Vértice V-01 de coordenadas UTM E=214.560,12m e N=7.623.400,45m (SAD-69 / SIRGAS 2000); segue confrontando ao Norte com a Fazenda Bela Vista (Matrícula 12.400); ao Leste com a calha principal do Rio Pardo; ao Sul com a faixa de domínio da Estrada LUIS-040; e ao Oeste com o Sítio Primavera (Matrícula 33.102).',
          benfeitorias: 'Sede histórica com 450m² de área construída, 2 galpões para maquinários e fertilizantes, casa de colono, curral com balança digital, poço artesiano profundo (180m), outorga de captação de água DAEE ativa e barramento de contenção legalizado.',
          descricao_legal: 'Gleba de terra rural denominada Fazenda Santa Maria do Rio Pardo, com área total de 450,00 hectares (4.500.000,00m²), situada no município de Luis Antônio, comarca de Ribeirão Preto/SP, com perímetro devidamente georreferenciado e certificado pelo INCRA.'
        },
        memorial_descritivo_georreferenciamento: {
          possui_georreferenciamento: true,
          status_sigef: 'CERTIFICADO E HOMOLOGADO PELO INCRA (Código SIGEF: 8f92c91a-4410-4b71-9b12-1234567890ab)',
          codigo_incra: '950.123.456.789-0 (CCIR 2025/2026 Quitado)',
          car_registro: 'SP-3527602-8F92.C91A.4410.4B71 (Status: ATIVO / DEFERIDO no SIMAR-SP)'
        },
        regimes_especiais: {
          eh_condominio: false,
          eh_loteamento: false,
          eh_imovel_rural: true,
          reserva_legal_averbada: 'SIIM — Averbada sob AV-4/45.210 (Área de 90,00 Hectares — 20% da propriedade conforme Art. 12 do Código Florestal - Lei 12.651/12)',
          app_preservacao_permanente: 'SIIM — 35,50 Hectares (Mata Ciliar e Foz do Rio Pardo)'
        },
        proprietarios_atuais: [
          {
            nome: 'DR. HENRIQUE DE ALMEIDA PRADO',
            cpf_cnpj: '234.567.890-11',
            qualificacao: 'Brasileiro, engenheiro agrônomo, casado sob o regime da comunhão parcial de bens',
            percentual_propriedade: '50%',
            estado_civil: 'Casado'
          },
          {
            nome: 'DRA. BEATRIZ VASCONCELOS DE ALMEIDA PRADO',
            cpf_cnpj: '876.543.210-99',
            qualificacao: 'Brasileira, médica veterinária, casada sob o regime da comunhão parcial de bens',
            percentual_propriedade: '50%',
            estado_civil: 'Casada'
          }
        ],
        cadeia_dominial: [
          { numero_ato: 'R-1 / 45.210', tipo_transmissao: 'Destacamento & Formal de Partilha', adquirentes: 'Henrique de Almeida Prado e Irmãos', transmitentes: 'Espólio de Joaquim de Almeida Prado', data_ato: '18/06/1998' },
          { numero_ato: 'AV-2 / 45.210', tipo_transmissao: 'Averbação de Demarcação & Medição', adquirentes: 'Henrique de Almeida Prado', transmitentes: 'Eng. Agrônomo Resp. Técnico (ART CREA 928374)', data_ato: '10/04/2004' },
          { numero_ato: 'R-3 / 45.210', tipo_transmissao: 'Escritura Pública de Compra e Venda de Fração', adquirentes: 'Henrique de Almeida Prado e Beatriz V. Prado', transmitentes: 'Irmãos Co-herdeiros', data_ato: '15/09/2010' },
          { numero_ato: 'AV-4 / 45.210', tipo_transmissao: 'Averbação de Reserva Legal & Registro CAR', adquirentes: 'Secretaria do Meio Ambiente / SIMAR-SP', transmitentes: 'Henrique de Almeida Prado', data_ato: '22/11/2014' },
          { numero_ato: 'AV-5 / 45.210', tipo_transmissao: 'Certificação Georreferenciada SIGEF/INCRA', adquirentes: 'INCRA — Instituto Nacional de Colonização e Reforma Agrária', transmitentes: 'Henrique de Almeida Prado', data_ato: '05/08/2019' },
          { numero_ato: 'AV-6 / 45.210', tipo_transmissao: 'Baixa & Quitação de Cédula Rural Hipotecária', adquirentes: 'Henrique de Almeida Prado', transmitentes: 'Banco do Brasil S/A', data_ato: '12/03/2023' }
        ],
        onus_garantias_financeiras: [],
        indisponividades_e_penhoras: [],
        usufruto_servidoes_e_direitos: [],
        onus_gravames_ativos: [],
        parecer_analise: {
          score_risco: 8,
          nivel_risco: 'BAIXO',
          status_juridico: 'REGULAR — IMÓVEL RURAL TOTALMENTE CERTIFICADO NO SIGEF/INCRA E LIVRE DE ÔNUS',
          explicacao_descomplicada: 'EXCELENTE NOTÍCIA: A Fazenda Santa Maria é um imóvel rural modelo! A propriedade está 100% regularizada no nome do Dr. Henrique e Dra. Beatriz Prado. O Georreferenciamento está homologado no SIGEF/INCRA (AV-5), o CAR e a Reserva Legal de 20% (90 ha) estão formalmente averbados na matrícula (AV-4), e a antiga Cédula Rural com o Banco do Brasil foi quitada e baixada (AV-6). Não há dívidas, penhoras ou embargos ambientais.',
          resumo_geral: 'Propriedade rural de 450,00 hectares com cadeia dominial ininterrupta desde 1998. Georreferenciamento aprovado no SIGEF/INCRA, CAR deferido no SIMAR-SP, CCIR/ITR quitados e ausência total de apontamentos no sistema CNIB.',
          recomendacao_final: 'IMÓVEL RURAL 100% SEGURO para compra, venda, lavratura de escritura, operação de Barter, outorga em garantia agrícola ou arrendamento rural.',
          riscos_identificados: [],
          pendencias_formais: [],
          regularidades_e_conformidade: [
            'Georreferenciamento certificado e homologado pelo INCRA no sistema SIGEF (AV-5)',
            'Reserva Legal de 20% (90,00 hectares) averbada sob AV-4 e deferida no CAR',
            'Titularidade 100% consolidada por escritura pública e formal de partilha',
            'Cancelamento e baixa de Cédula Rural Pignoraticia/Hipotecária averbada sob AV-6',
            'Ausência de indisponibilidades judiciais (CNIB) ou embargos ambientais IBAMA/CETESB'
          ]
        }
      };

      const richRiskReport: MatriculaReport = {
        identificacao_geral: {
          matricula: '18.920',
          cartorio_ri: 'Ofício de Registro de Imóveis',
          comarca: 'Barretos/SP',
          livro: '2 — Registro Geral',
          folha: '12',
          data_abertura: '10/05/2001',
          tipo_imovel_analisado: 'RURAL (Sítio com Embargo Ambiental)',
          codigo_imovel: 'CCIR/INCRA: 950.987.654.321-0',
          serventia: 'CNS: 12.010-1'
        },
        caracteristicas_fisicas: {
          endereco_completo: 'Rodovia Faria Lima, Km 410 — Zona Rural, Barretos/SP',
          denominacao_imovel: 'Sítio Boa Vista',
          area_total_m2: '1.200.000,00 m² (120,00 Hectares)',
          loteamento_quadra_lote: 'Lote 04',
          perimetros_confrontacoes: 'Frente para a Rodovia Faria Lima; fundos com Córrego das Pedras.',
          benfeitorias: 'Casa de caseiro, galpão de madeira e pastagem degradada.',
          descricao_legal: 'Sítio rural com área de 120,00 hectares no município de Barretos/SP.'
        },
        memorial_descritivo_georreferenciamento: { possui_georreferenciamento: false, status_sigef: 'PENDENTE DE CERTIFICAÇÃO' },
        regimes_especiais: { eh_condominio: false, eh_loteamento: false, eh_imovel_rural: true },
        proprietarios_atuais: [
          { nome: 'JOSÉ CARLOS DA SILVA', cpf_cnpj: '321.654.987-00', qualificacao: 'Brasileiro, agricultor', percentual_propriedade: '100%', estado_civil: 'Solteiro' }
        ],
        cadeia_dominial: [
          { numero_ato: 'R-1', tipo_transmissao: 'Compra e Venda', adquirentes: 'José Carlos da Silva', transmitentes: 'Antônio Pedroso', data_ato: '10/05/2001' }
        ],
        onus_garantias_financeiras: [
          { numero_ato: 'R-3', tipo: 'Cédula Rural Hipotecária', credor_banco: 'Banco do Brasil S/A', valor_garantia: 'R$ 480.000,00', status: 'ATIVO' }
        ],
        indisponividades_e_penhoras: [
          { numero_ato: 'AV-4', tipo: 'Embargo Ambiental & Auto de Infração IBAMA', processo_vara: 'Processo IBAMA nº 02001.004521/2022 — Desmatamento não autorizado de APP', autor_exequente: 'IBAMA / Ministério Público Federal', status: 'ATIVO' }
        ],
        usufruto_servidoes_e_direitos: [],
        onus_gravames_ativos: [
          { tipo: 'Cédula Rural Hipotecária', credor_banco: 'Banco do Brasil S/A', valor_garantia: 'R$ 480.000,00' },
          { tipo: 'Embargo Ambiental IBAMA', processo_vara: 'IBAMA / MPF' }
        ],
        parecer_analise: {
          score_risco: 88,
          nivel_risco: 'CRÍTICO',
          status_juridico: 'RESTRIÇÃO GRAVE — EMBARGO AMBIENTAL IBAMA & HIPOTECA RURAL',
          explicacao_descomplicada: 'ATENÇÃO: Este imóvel rural possui 2 pendências graves: Embargo Ambiental averbado pelo IBAMA (AV-4) por desmatamento de APP e Cédula Rural Hipotecária ativa com o Banco do Brasil (R-3).',
          resumo_geral: 'Imóvel com grave autuação ambiental e hipoteca bancária sem quitação.',
          recomendacao_final: 'NÃO RECOMENDADO para compra sem prévia regularização ambiental junto ao IBAMA e quitação do débito bancário.',
          riscos_identificados: [
            { descricao: 'Embargo Ambiental IBAMA averbado sob AV-4', tipo_risco: 'CRÍTICO', impacto: 'Impede financiamento agrícola e comercialização da produção', acao_recomendada: 'Firmar Termo de Ajustamento de Conduta (TAC) com o órgão ambiental' }
          ],
          pendencias_formais: ['Falta de georreferenciamento certificado no SIGEF', 'Certidão Negativa de Debitos do ITR'],
          regularidades_e_conformidade: []
        }
      };

      const targetReport = sampleType === 'safe' ? richRuralReport : richRiskReport;

      setState({
        file: mockFile,
        isProcessing: false,
        progress: 100,
        currentStep: 'Exemplo Instantâneo Carregado!',
        report: targetReport,
        error: null,
      });
    }, 2300);
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
  };
}