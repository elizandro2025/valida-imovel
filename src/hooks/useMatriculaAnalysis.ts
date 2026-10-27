import { useState, useCallback } from 'react';
import { analyzeMatricula, MatriculaReport, AnalysisProgressCallback, WrongDocumentError } from '@/services/aiService';

// O servidor aceita até 20 MB em base64, o que equivale a cerca de 15 MB de PDF
export const MAX_PDF_BYTES = 15 * 1024 * 1024;

export interface AnalysisState {
  file: File | null;
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  report: MatriculaReport | null;
  error: string | null;
  wrongDocument?: boolean;    // o PDF enviado não é a certidão (o arquivo é descartado para escolher outro)
  fileName?: string | null;   // nome do PDF analisado
  isSample?: boolean;         // relatório de demonstração (sem conta)
}

interface ProcessOptions {
  hasSubscription?: boolean;
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

  const updateProgress: AnalysisProgressCallback = useCallback((step, progress) => {
    setState(prev => ({ ...prev, currentStep: step, progress }));
  }, []);

  // O relatório fica só no estado da tela: não é guardado no servidor nem no navegador
  const processFile = useCallback(async (file: File, { hasSubscription }: ProcessOptions = {}) => {
    // Paywall — status vindo do AuthContext (perfil no Supabase). A API de IA confere de novo no servidor.
    if (hasSubscription !== true) {
      setState(prev => ({
        ...prev,
        file: null,
        isProcessing: false,
        error: 'É necessário ter o plano ativo para analisar matrículas. Redirecionando para o pagamento...',
      }));
      setTimeout(() => {
        window.location.href = '/pagamento';
      }, 2000);
      return;
    }

    if (file.type && file.type !== 'application/pdf') {
      setState(prev => ({ ...prev, error: 'Envie a certidão em PDF.' }));
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setState(prev => ({ ...prev, error: 'O PDF tem mais de 15 MB. Gere a certidão novamente com resolução menor ou envie só as páginas da matrícula.' }));
      return;
    }

    setState({
      file,
      fileName: file.name,
      isProcessing: true,
      progress: 5,
      currentStep: 'Preparando o documento...',
      report: null,
      error: null,
      isSample: false,
    });

    try {
      const report = await analyzeMatricula(file, updateProgress);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100,
        currentStep: 'Análise concluída.',
        report,
      }));
    } catch (err) {
      const wrongDocument = err instanceof WrongDocumentError;
      if (!wrongDocument) console.error('Erro na análise da matrícula:', err);
      setState(prev => ({
        ...prev,
        // Arquivo errado: descarta para a tela voltar à escolha do PDF
        ...(wrongDocument && { file: null, fileName: null }),
        wrongDocument,
        isProcessing: false,
        progress: 0,
        currentStep: '',
        error: err instanceof Error && err.message ? err.message : 'Falha ao processar a matrícula. Verifique o arquivo e tente novamente.',
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

    // O exemplo é um relatório pronto, com dados fictícios: abre na hora, sem simular uma análise de IA que não acontece
    setState({
      file: mockFile,
      fileName,
      isSample: true,
      isProcessing: true,
      progress: 60,
      currentStep: 'Abrindo o exemplo (dados fictícios)...',
      report: null,
      error: null,
    });

    setTimeout(() => {
      // RELATÓRIO RURAL ULTRA-DETALHADO E NUTRIDO (100% DOS CAMPOS PREENCHIDOS)
      const richRuralReport: MatriculaReport = {
        identificacao_geral: {
          matricula: '45.210',
          cartorio_ri: '1º Oficial de Registro de Imóveis e Anexos',
          comarca: 'Ribeirão Preto / Luís Antônio, SP',
          livro: '2, Registro Geral',
          folha: '01 a 04',
          data_abertura: '18/06/1998',
          tipo_imovel_analisado: 'RURAL (Fazenda de Produção Agrícola e Preservação Ambiental)',
          codigo_imovel: 'CCIR/INCRA: 950.123.456.789-0 | ITR/NIRF: 8.765.432-1',
          serventia: 'CNS: 12.048-5 (Serventia Notarial e Registral de Luis Antônio)',
          historico_renumeracao: 'Origem da Matrícula 12.840 do 1º RI de Ribeirão Preto/SP',
          origem_transcricao: 'Transcrição Anterior nº 12.840 (Livro 3-B, fl. 142)',
          codigo_nacional_imovel: 'CNI 10293847561',
          natureza_serventia: 'Registro de Imóveis Privatizado / Provido por Concurso Público',
          tipo_documental: 'Matrícula Digitalizada (Livro 2-RG)',
          data_ultima_atualizacao: '28/07/2026'
        },
        caracteristicas_fisicas: {
          endereco_completo: 'Estrada Municipal LUIS-040, km 12, zona rural, Luís Antônio/SP, CEP 14210-000',
          denominacao_imovel: 'FAZENDA SANTA MARIA DO RIO PARDO',
          area_total_m2: '4.500.000,00 m² (450,00 hectares ou 185,95 alqueires paulistas)',
          area_total_hectares: '450,00 Hectares',
          area_outras_unidades: '185,95 Alqueires Paulistas (2,42 ha/alq)',
          loteamento_quadra_lote: 'Gleba A, Colônia Santa Maria (gleba agrícola autônoma)',
          perimetros_confrontacoes: 'Inicia no Vértice V-01 de coordenadas UTM E=214.560,12m e N=7.623.400,45m (SIRGAS 2000 Fuso 22S); segue confrontando ao Norte com a Fazenda Bela Vista (Matrícula 12.400); ao Leste com a calha principal do Rio Pardo; ao Sul com a faixa de domínio da Estrada LUIS-040; e ao Oeste com o Sítio Primavera (Matrícula 33.102).',
          benfeitorias: 'Sede histórica de 450m² de área construída, 2 galpões industriais para maquinários e fertilizantes, casa de colono, curral completo com balança digital, poço artesiano profundo (180m), outorga de captação de água DAEE ativa e barramento de contenção legalizado.',
          descricao_legal: 'Gleba de terra rural denominada Fazenda Santa Maria do Rio Pardo, com área total de 450,00 hectares (4.500.000,00m²), situada no município de Luis Antônio, comarca de Ribeirão Preto/SP, com perímetro devidamente georreferenciado e certificado pelo INCRA.',
          area_construida: '450,00 m² (Casa Sede + Galpão Agrícola)',
          area_privativa: '450,00 Hectares (100% Gleba Autônoma)',
          area_comum: '0,00 m² (Gleba com Acesso Público Direto)',
          numero_pavimentos: '2 Pavimentos (Sede Principal)',
          tipo_construtivo: 'Alvenaria Estrutural com Cobertura Colonial e Madeira Nobre',
          uso_predominante: 'Agropecuário (Cultura de Cana-de-Açúcar, Citricultura e Preservação)',
          zoneamento_mencionado: 'Zona de Proteção Ambiental e Agrícola ZPA-1 (Plano Diretor Municipal)'
        },
        memorial_descritivo_georreferenciamento: {
          possui_georreferenciamento: true,
          situacao_certificacao: 'CERTIFICADO E HOMOLOGADO PELO INCRA (Código SIGEF: 8f92c91a-4410-4b71-9b12-1234567890ab)',
          status_sigef: 'CERTIFICADO E HOMOLOGADO PELO INCRA (Código SIGEF: 8f92c91a-4410-4b71-9b12-1234567890ab)',
          codigo_incra: '950.123.456.789-0',
          codigo_ccir: '950.123.456.789-0',
          car_registro: 'SP-3527602-8F92.C91A.4410.4B71 (citado na AV-4)',
          codigo_car: 'SP-3527602-8F92.C91A.4410.4B71',
          codigo_itr_nirf: '8.765.432-1',
          responsavel_tecnico: 'Eng. Agrônomo Roberto Carlos Mendes (CREA-SP 506.123/D, ART nº 928374)',
          sistema_geodesico: 'SIRGAS 2000 (elipsoide GRS80, fuso 22S)',
          coordenadas_geograficas: '18 Vértices UTM (V-01 a V-18). V-01: E=214.560,12m / N=7.623.400,45m | V-05: E=215.110,80m / N=7.624.010,12m | Azimute Principal: 42°15\'30".'
        },
        regimes_especiais: {
          eh_condominio: false,
          eh_loteamento: false,
          eh_imovel_rural: true,
          reserva_legal_averbada: 'Sim, averbada sob AV-4/45.210: 90,00 hectares (20% da propriedade, art. 12 do Código Florestal, Lei 12.651/12)',
          app_preservacao_permanente: 'Sim, 35,50 hectares (mata ciliar do Rio Pardo, faixa mínima de 50 metros)',
          detalhes_regime: 'Propriedade Agrícola Privada não sujeita a Condomínio ou Loteamento'
        },
        imoveis_especiais_spu_marinha: {
          terreno_marinha: false,
          regime_spu: 'NÃO CONSTA (Imóvel Alodial de Domínio Privado)',
          faixa_fronteira: false,
          faixa_dominio: 'Sim, faixa de domínio da Estrada LUIS-040 averbada (AV-2/45.210)',
          tombamento: false,
          terra_indigena_quilombola: false,
          laudemic_inscrito: false
        },
        registro_ambiental_recursos_hidricos: {
          reserva_legal_averbada: 'Sim, 90,00 hectares (20%) averbados sob AV-4',
          area_preservacao_permanente_app: 'Sim, 35,50 hectares (mata ciliar do Rio Pardo)',
          embargos_ambientais: 'Nenhum embargo averbado na matrícula',
          outorga_agua: 'Sim, Portaria DAEE nº 45.109/2024 para captação superficial no Rio Pardo (vazão de 120 m³/h)'
        },
        proprietarios_atuais: [
          {
            nome: 'DR. HENRIQUE DE ALMEIDA PRADO',
            cpf_cnpj: '234.567.890-11',
            qualificacao: 'Brasileiro, engenheiro agrônomo, casado sob o regime da comunhão parcial de bens',
            percentual_propriedade: '50%',
            estado_civil: 'Casado',
            regime_bens: 'Comunhão Parcial de Bens',
            natureza_propriedade: 'Proprietário Titular (Escritura de Compra e Venda R-3)',
            ato_aquisicao: 'R-3 / 45.210'
          },
          {
            nome: 'DRA. BEATRIZ VASCONCELOS DE ALMEIDA PRADO',
            cpf_cnpj: '876.543.210-99',
            qualificacao: 'Brasileira, médica veterinária, casada sob o regime da comunhão parcial de bens',
            percentual_propriedade: '50%',
            estado_civil: 'Casada',
            regime_bens: 'Comunhão Parcial de Bens',
            natureza_propriedade: 'Proprietária Titular (Escritura de Compra e Venda R-3)',
            ato_aquisicao: 'R-3 / 45.210'
          }
        ],
        cadeia_dominial: [
          { numero_ato: 'R-1 / 45.210', tipo_transmissao: 'Destacamento & Formal de Partilha', adquirentes: 'Henrique de Almeida Prado e Irmãos', transmitentes: 'Espólio de Joaquim de Almeida Prado', data_registro: '18/06/1998', valor_transacao: 'R$ 850.000,00', observacoes: 'Partilha homologada na 2ª Vara de Família de Ribeirão Preto' },
          { numero_ato: 'AV-2 / 45.210', tipo_transmissao: 'Averbação de Demarcação & Medição', adquirentes: 'Henrique de Almeida Prado', transmitentes: 'Eng. Agrônomo Resp. Técnico (ART CREA 928374)', data_registro: '10/04/2004', valor_transacao: 'N/A (Ato sem valor declaratório)', observacoes: 'Regularização perimétrica e retificação de área' },
          { numero_ato: 'R-3 / 45.210', tipo_transmissao: 'Escritura Pública de Compra e Venda de Fração', adquirentes: 'Henrique de Almeida Prado e Beatriz V. Prado', transmitentes: 'Irmãos Co-herdeiros (Luiz e Carlos Prado)', data_registro: '15/09/2010', valor_transacao: 'R$ 2.400.000,00', observacoes: 'Consolidação de 100% da propriedade no casal' },
          { numero_ato: 'AV-4 / 45.210', tipo_transmissao: 'Averbação de Reserva Legal & Registro CAR', adquirentes: 'Secretaria do Meio Ambiente / SIMAR-SP', transmitentes: 'Henrique de Almeida Prado', data_registro: '22/11/2014', valor_transacao: 'N/A (Compromisso Ambiental)', observacoes: 'Formalização de 90ha de Reserva Legal Florestal' },
          { numero_ato: 'AV-5 / 45.210', tipo_transmissao: 'Certificação Georreferenciada SIGEF/INCRA', adquirentes: 'INCRA (Instituto Nacional de Colonização e Reforma Agrária)', transmitentes: 'Henrique de Almeida Prado', data_registro: '05/08/2019', valor_transacao: 'N/A (Homologação Técnica)', observacoes: 'Aprovação definitiva no sistema SIGEF/INCRA' },
          { numero_ato: 'AV-6 / 45.210', tipo_transmissao: 'Baixa & Quitação de Cédula Rural Hipotecária', adquirentes: 'Henrique de Almeida Prado', transmitentes: 'Banco do Brasil S/A', data_registro: '12/03/2023', valor_transacao: 'R$ 1.200.000,00 (Quitação Total)', observacoes: 'Termo de quitação emitido pela Gerência Agro do BB' }
        ],
        onus_garantias_financeiras: [
          {
            numero_ato: 'AV-6 / 45.210', tipo: 'Cédula Rural Hipotecária', credor_banco: 'Banco do Brasil S/A', valor_garantia: 'R$ 1.200.000,00',
            ato_cancelamento: 'AV-6 / 45.210', data_cancelamento: '12/03/2023', status: 'CANCELADO',
            trecho_origem: 'AV-6/45.210. Fica cancelada a cédula rural hipotecária em favor do Banco do Brasil S/A, em virtude de quitação.',
            _trecho_confirmado: true,
          }
        ],
        indisponividades_e_penhoras: [],
        usufruto_servidoes_e_direitos: [
          { numero_ato: 'AV-2 / 45.210', tipo: 'Servidão Administrativa de Passagem de Linha de Transmissão', status: 'ATIVO', beneficiarios: 'CPFL Paulista (Companhia Paulista de Força e Luz)', clausulas_restritivas: 'Faixa de segurança de 15 metros de largura ao longo do limite Sul da propriedade', trecho_origem: 'AV-2/45.210. Servidão administrativa de passagem de linha de transmissão em favor da CPFL Paulista, faixa de 15 metros ao longo do limite Sul.', _trecho_confirmado: true }
        ],
        onus_gravames_ativos: [],
        averbacoes_diversas: [
          { numero_averbacao: 'AV-2 / 45.210', tipo: 'Averbação de Demarcação & Georreferenciamento', data: '10/04/2004', descricao: 'Averbação do perímetro georreferenciado e ART CREA 928374.' },
          { numero_averbacao: 'AV-4 / 45.210', tipo: 'Averbação de Reserva Legal (20%)', data: '22/11/2014', descricao: 'Averbação de 90 Hectares de Reserva Legal conforme Código Florestal.' },
          { numero_averbacao: 'AV-6 / 45.210', tipo: 'Cancelamento de Hipoteca Rural BB', data: '12/03/2023', descricao: 'Quitação integral de Cédula Rural e liberação total do imóvel.' }
        ],
        parecer_analise: {
          score_risco: 8,
          nivel_risco: 'BAIXO',
          status_juridico: 'Regular: georreferenciamento certificado e sem ônus ativos na matrícula',
          explicacao_descomplicada: 'Boa notícia: a matrícula não mostra ônus ativos. A Fazenda Santa Maria está em nome de Henrique e Beatriz Prado, 50% cada (R-3). O georreferenciamento foi certificado no SIGEF/INCRA (AV-5), a reserva legal de 90 ha está averbada (AV-4) e a cédula rural com o Banco do Brasil foi quitada e baixada (AV-6). Não aparecem penhoras, indisponibilidades ou embargos averbados.',
          resumo_geral: 'Propriedade rural de 450,00 hectares com cadeia dominial contínua desde 1998, georreferenciamento certificado no SIGEF/INCRA, reserva legal averbada e nenhuma penhora, indisponibilidade ou embargo averbado na matrícula.',
          recomendacao_final: 'Matrícula sem ônus ativos. Antes da escritura, peça a certidão atualizada da matrícula e as certidões pessoais dos vendedores.',
          riscos_identificados: [],
          pendencias_formais: [],
          regularidades_e_conformidade: [
            'Georreferenciamento certificado e homologado pelo INCRA no sistema SIGEF (AV-5)',
            'Reserva Legal de 20% (90,00 hectares) averbada sob AV-4 e deferida no CAR',
            'Titularidade 100% consolidada por escritura pública e formal de partilha',
            'Cancelamento e baixa de Cédula Rural Pignoraticia/Hipotecária averbada sob AV-6',
            'Nenhuma penhora, indisponibilidade ou embargo ambiental averbado na matrícula'
          ]
        }
      };

      const richRiskReport: MatriculaReport = {
        identificacao_geral: {
          matricula: '18.920',
          cartorio_ri: 'Ofício de Registro de Imóveis',
          comarca: 'Barretos/SP',
          livro: '2, Registro Geral',
          folha: '12',
          data_abertura: '10/05/2001',
          tipo_imovel_analisado: 'RURAL (Sítio com Embargo Ambiental)',
          codigo_imovel: 'CCIR/INCRA: 950.987.654.321-0',
          serventia: 'CNS: 12.010-1'
        },
        caracteristicas_fisicas: {
          endereco_completo: 'Rodovia Faria Lima, km 410, zona rural, Barretos/SP',
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
          {
            numero_ato: 'R-3', tipo: 'Cédula Rural Hipotecária', credor_banco: 'Banco do Brasil S/A', valor_garantia: 'R$ 480.000,00', status: 'ATIVO',
            trecho_origem: 'R-3/18.920. Cédula rural hipotecária em favor do Banco do Brasil S/A, valor de R$ 480.000,00.',
            _trecho_confirmado: true,
          }
        ],
        indisponividades_e_penhoras: [
          { numero_ato: 'AV-4', tipo: 'Embargo Ambiental & Auto de Infração IBAMA', processo_vara: 'Processo IBAMA nº 02001.004521/2022, desmatamento não autorizado de APP', autor_exequente: 'IBAMA / Ministério Público Federal', status: 'ATIVO', trecho_origem: 'AV-4/18.920. Embargo ambiental determinado pelo IBAMA, processo 02001.004521/2022, por desmatamento não autorizado de APP.', _trecho_confirmado: true }
        ],
        usufruto_servidoes_e_direitos: [],
        onus_gravames_ativos: [
          { tipo: 'Cédula Rural Hipotecária', credor_banco: 'Banco do Brasil S/A', valor_garantia: 'R$ 480.000,00' },
          { tipo: 'Embargo Ambiental IBAMA', processo_vara: 'IBAMA / MPF' }
        ],
        parecer_analise: {
          score_risco: 88,
          nivel_risco: 'CRÍTICO',
          status_juridico: 'Restrição grave: embargo ambiental do IBAMA e hipoteca rural ativa',
          explicacao_descomplicada: 'ATENÇÃO: Este imóvel rural possui 2 pendências graves: Embargo Ambiental averbado pelo IBAMA (AV-4) por desmatamento de APP e Cédula Rural Hipotecária ativa com o Banco do Brasil (R-3).',
          resumo_geral: 'Imóvel com grave autuação ambiental e hipoteca bancária sem quitação.',
          recomendacao_final: 'NÃO RECOMENDADO para compra sem prévia regularização ambiental junto ao IBAMA e quitação do débito bancário.',
          riscos_identificados: [
            {
              descricao: 'Embargo ambiental do IBAMA averbado sob AV-4', tipo_risco: 'ALTO', numero_ato: 'AV-4',
              trecho_origem: 'AV-4/18.920. Embargo ambiental determinado pelo IBAMA, processo 02001.004521/2022, por desmatamento não autorizado de APP.',
              _trecho_confirmado: true,
              impacto: 'Impede financiamento agrícola e comercialização da produção', acao_recomendada: 'Firmar Termo de Ajustamento de Conduta (TAC) com o órgão ambiental',
            },
            {
              descricao: 'Cédula rural hipotecária ativa em favor do Banco do Brasil (R-3)', tipo_risco: 'ALTO', numero_ato: 'R-3',
              trecho_origem: 'R-3/18.920. Cédula rural hipotecária em favor do Banco do Brasil S/A, valor de R$ 480.000,00.',
              _trecho_confirmado: true,
              impacto: 'O imóvel garante a dívida; sem a baixa, o banco pode executar a garantia mesmo depois da venda',
              acao_recomendada: 'Exigir a quitação e a averbação de cancelamento da cédula antes da escritura',
            },
          ],
          pendencias_formais: ['Falta de georreferenciamento certificado no SIGEF', 'Certidão Negativa de Debitos do ITR'],
          regularidades_e_conformidade: []
        }
      };

      const targetReport = sampleType === 'safe' ? richRuralReport : richRiskReport;

      setState({
        file: mockFile,
        fileName,
        isSample: true,
        isProcessing: false,
        progress: 100,
        currentStep: 'Exemplo carregado.',
        report: targetReport,
        error: null,
      });
    }, 300);
  }, []);

  const clearFile = useCallback(() => {
    setState(prev => ({
      ...prev,
      file: null,
      fileName: null,
      report: null,
      progress: 0,
      currentStep: '',
      error: null,
    }));
  }, []);

  const closeError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, wrongDocument: false }));
  }, []);

  const showError = useCallback((message: string) => {
    setState(prev => ({ ...prev, error: message }));
  }, []);

  return {
    ...state,
    processFile,
    showError,
    loadSampleReport,
    clearFile,
    closeError,
  };
}