// Service for Mistral AI integration with 12 Dedicated Modules & Strict Anti-Hallucination Directives
import { pdfToImagesService, PDFPageInfo } from './pdfToImagesService';
import { tableAnalysisService, CoordinatePoint } from './tableAnalysisService';
import { ocrCacheService } from './ocrCacheService';

const OCR_ENDPOINT = "https://api.mistral.ai/v1/ocr";
const CHAT_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";

const STRICT_ANTI_HALLUCINATION_SYSTEM = 
  "SISTEMA ANTI-ALUCINAÇÃO REGISTRÁRIA ABSOLUTO:\n" +
  "Você é um Auditor Registrário Infalível. REGRA MANDATÓRIA E INVIOLÁVEL:\n" +
  "1. Extraia APENAS e EXCLUSIVAMENTE dados que estejam literalmente gravados no texto da matrícula imobiliária fornecida.\n" +
  "2. NUNCA invente, presuma, deduza, suponha ou fabrique nomes, CPFs, CNPJs, valores, áreas, datas, livros, folhas, serventias ou ônus.\n" +
  "3. Se uma informação não constar explicitamente no documento, você DEVE retornar obrigatoriamente \"\" (string vazia) ou null.\n" +
  "4. NUNCA utilize dados genéricos, exemplos ou placeholders.";

const getApiKey = (): string => {
  const envKey = import.meta.env.VITE_MISTRAL_API_KEY;
  const localKey = localStorage.getItem('mistral_api_key');
  return envKey || localKey || 'OOS8gD1hWs5Mndq7ySdBSnjGTuZZz2fl';
};

export interface OCRResponse {
  pages: Array<{
    markdown: string;
  }>;
}

export interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason?: string;
  }>;
}

// Helper de higienização e auto-reparo de JSON truncado
export const safeParseJSON = (str: string): any => {
  let cleaned = str.replace(/```json|```/g, "").trim();
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    cleaned = "{" + cleaned;
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    let repaired = cleaned;
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;

    for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += "]";
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += "}";

    try {
      return JSON.parse(repaired);
    } catch {
      return {};
    }
  }
};

// Helper otimizado para chamadas JSON com temperatura 0.0 (Zero Aleatoriedade)
export const chatJSON = async (
  messages: any[], 
  maxTokens: number = 4000, 
  retries: number = 2, 
  model: string = "mistral-small-latest"
): Promise<any> => {
  const apiKey = getApiKey();
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate, br"
        },
        body: JSON.stringify({
          model: model,
          messages,
          max_tokens: maxTokens,
          temperature: 0.0, // TEMPERATURA 0.0: Zero aleatoriedade, resposta estritamente literal e determinística
          response_format: { "type": "json_object" }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      const content = data?.choices?.[0]?.message?.content || "";
      const finishReason = data?.choices?.[0]?.finish_reason;

      if (finishReason === "length" && attempt < retries) {
        const continuationMessages = [...messages, 
          { role: "assistant", content },
          { role: "user", content: "Continue o JSON de onde parou, completando a estrutura estritamente em JSON válido baseando-se APENAS no texto." }
        ];
        const continuation = await chatJSON(continuationMessages, maxTokens, 0, model);
        return { ...safeParseJSON(content), ...continuation };
      }

      return safeParseJSON(content);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (attempt === retries) {
        if (error.name === 'AbortError') {
          throw new Error("Tempo limite na análise (90s)");
        }
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
};

export const ocrService = {
  async extractText(base64PDF: string): Promise<string> {
    const apiKey = getApiKey();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const response = await fetch(OCR_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate, br"
        },
        body: JSON.stringify({
          model: "mistral-ocr-latest",
          document: {
            type: "document_url",
            document_url: `data:application/pdf;base64,${base64PDF}`
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro no OCR: ${response.status} - ${errorText}`);
      }

      const data: OCRResponse = await response.json();
      const extractedText = data.pages.map(page => page.markdown).join("\n");
      
      if (!extractedText || extractedText.trim().length < 100) {
        throw new Error("Texto extraído muito curto ou vazio. Verifique a qualidade do PDF.");
      }
      
      return extractedText;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error("Tempo limite excedido no OCR (90s)");
      }
      console.error('Erro detalhado no OCR:', error);
      throw error;
    }
  },

  async extractImageText(base64Image: string): Promise<string> {
    const apiKey = getApiKey();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(OCR_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistral-ocr-latest",
          document: {
            type: "image_url",
            image_url: `data:image/jpeg;base64,${base64Image}`
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro no OCR da imagem: ${response.status} - ${errorText}`);
      }

      const data: OCRResponse = await response.json();
      return data.pages.map(p => p.markdown).join("\n");
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error("Tempo limite excedido no OCR (60s)");
      }
      throw error;
    }
  },

  async extractFromImages(base64Images: string[]): Promise<string> {
    const texts = await Promise.all(
      base64Images.map(async (img, i) => {
        try {
          console.log(`Extraindo OCR da página ${i + 1}/${base64Images.length}`);
          return await this.extractImageText(img);
        } catch (e) {
          console.error(`Erro na página ${i + 1}:`, e);
          return "";
        }
      })
    );

    const fullText = texts.join("\n\n").trim();

    if (!fullText || fullText.length < 100) {
      throw new Error("Texto extraído é muito curto ou vazio. Verifique as imagens.");
    }

    return fullText;
  },

  async extractTextHybrid(file: File): Promise<{ text: string; method: 'pdf' | 'images' | 'mixed'; pages?: PDFPageInfo[] }> {
    try {
      console.log("Iniciando OCR direto via PDF...");
      const base64PDF = await fileUtils.toBase64(file);
      const pdfText = await this.extractText(base64PDF);
      
      if (pdfText && pdfText.length > 200 && !this.hasLowQualityIndicators(pdfText)) {
        console.log("OCR do PDF bem-sucedido");
        return { text: pdfText, method: 'pdf' };
      }
      
      console.log("Qualidade do OCR do PDF baixa, tentando conversão para imagens...");
      throw new Error("PDF OCR quality too low");
      
    } catch (pdfError) {
      console.log("OCR do PDF falhou, convertendo páginas para imagens...");
      
      try {
        const arrayBuffer = await pdfToImagesService.fileToArrayBuffer(file);
        const pages = await pdfToImagesService.convertToImages(arrayBuffer, {
          scale: 2.0,
          quality: 0.9
        });
        
        const sortedPages = pages.sort((a, b) => {
          if (a.hasTablesIndicator && !b.hasTablesIndicator) return -1;
          if (!a.hasTablesIndicator && b.hasTablesIndicator) return 1;
          return a.pageNumber - b.pageNumber;
        });
        
        const imageTexts = await this.extractFromImages(sortedPages.map(p => p.base64));
        
        return { 
          text: imageTexts, 
          method: 'images',
          pages: sortedPages
        };
        
      } catch (imageError) {
        console.error("Ambos os métodos de OCR falharam:", { pdfError, imageError });
        throw new Error(`OCR falhou em ambos os métodos.`);
      }
    }
  },

  hasLowQualityIndicators(text: string): boolean {
    const lowQualityPatterns = [
      /[^\w\s\.\,\-\(\)\[\]]/g,
      /\s{5,}/g,
      /(.)\1{4,}/g,
    ];
    const specialCharCount = (text.match(lowQualityPatterns[0]) || []).length;
    return (specialCharCount / text.length) > 0.2 ||
           lowQualityPatterns.slice(1).some(pattern => pattern.test(text));
  }
};

export const analysisService = {
  async analyzeWithGeoreferencing(extractedText: string): Promise<any> {
    const { georreferenciamentoService } = await import('./georreferenciamentoService');
    
    try {
      const [geoResults, dedicatedResults] = await Promise.all([
        georreferenciamentoService.analyzeGeoreferencing(extractedText),
        this.analyzeWith12DedicatedPrompts(extractedText)
      ]);

      const merged = {
        ...dedicatedResults,
        memorial_descritivo_georreferenciamento: {
          ...dedicatedResults.memorial_descritivo_georreferenciamento,
          ...geoResults.memorial_descritivo_georreferenciamento
        }
      };

      return this.normalizeReport(merged);
    } catch (error) {
      console.error('Falha no paralelismo de análise, executando fallback por prompts:', error);
      const raw = await this.analyzeWith12DedicatedPrompts(extractedText);
      return this.normalizeReport(raw);
    }
  },

  // 🏛️ PROMPTS DEDICADOS COM DIRETIVAS RÍGIDAS ANTI-ALUCINAÇÃO & PARÂMETROS ENRIQUECIDOS DE ALTO VALOR
  async analyzeWith12DedicatedPrompts(extractedText: string): Promise<any> {
    const textChunk = extractedText.substring(0, 22000);
    
    const dedicatedPrompts = [

      // 1. IDENTIFICAÇÃO REGISTRÁRIA E CARTORÁRIA ENRIQUECIDA
      {
        name: "identificacao_geral",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Oficial Registrador de Imóveis sênior.",
        prompt: `EXAMINADOR CARTORÁRIO: Extraia a IDENTIFICAÇÃO DA MATRÍCULA E CARTÓRIO presentes no texto.

Retorne este JSON:
{
  "identificacao_geral": {
    "matricula": "Número exato da matrícula",
    "cartorio_ri": "Nome oficial do Cartório de Registro de Imóveis (CRI)",
    "comarca": "Município e UF da comarca",
    "livro": "Livro de registro (ex: Livro 2 - Registro Geral)",
    "folha": "Número da folha",
    "data_abertura": "Data de abertura da matrícula (DD/MM/AAAA)",
    "tipo_imovel_analisado": "Urbano ou Rural",
    "codigo_imovel": "Inscrição imobiliária (IPTU/SQL) ou Código INCRA/CCIR",
    "serventia": "Código CNS ou serventia registral",
    "historico_renumeracao": "Histórico de renumeração ou fusão da matrícula",
    "origem_transcricao_anterior": "Origem registraria anterior (Transcrição anterior nº, Livro 3, etc.)",
    "codigo_nacional_imovel": "Código Nacional de Imóvel CNI se houver",
    "natureza_serventia": "Oficial ou Privatizado/Privado",
    "tipo_documental": "Matrícula, Transcrição ou Livro Auxiliar",
    "data_ultima_atualizacao": "Data da certidão/última averbação"
  }
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 2. CARACTERIZAÇÃO FÍSICA E BENFEITORIAS ENRIQUECIDA
      {
        name: "caracteristicas_fisicas",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Perito Engenheiro Imobiliário.",
        prompt: `PERITO ENGENHEIRO: Extraia as CARACTERÍSTICAS FÍSICAS, BENFEITORIAS E ESTRUTURA CONSTRUTIVA no texto.

Retorne este JSON:
{
  "caracteristicas_fisicas": {
    "descricao_legal": "Transcrição literal da descrição legal do imóvel",
    "area_total_m2": "Área total em m²",
    "area_construida_m2": "Área construída total averbada",
    "area_privativa_m2": "Área privativa / útil",
    "area_comum_m2": "Área comum de divisão proporcional",
    "area_total_hectares": "Área em hectares (ha) se for rural",
    "area_outras_unidades": "Alqueires ou fração ideal",
    "endereco_completo": "Logradouro, número, bairro, CEP, cidade e UF",
    "denominacao_imovel": "Nome da fazenda/sítio ou edifício/condomínio",
    "perimetros_confrontacoes": "Descrição literal das divisas e confrontantes",
    "benfeitorias": "Construções, Habite-se e benfeitorias averbadas",
    "loteamento_quadra_lote": "Lote, Quadra e Bairro/Loteamento",
    "numero_pavimentos": "Número de pavimentos ou andares",
    "tipo_construtivo": "Alvenaria, concreto armado, metálica, mista",
    "uso_predominante": "Residencial, Comercial, Industrial ou Misto",
    "zoneamento_mencionado": "Zoneamento urbano ou diretriz citada",
    "coordenadas_memorial": "Coordenadas descritas no memorial físico",
    "observacoes_tecnicas": "Observações relevantes gravadas no texto"
  }
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 3. GEORREFERENCIAMENTO & REGISTRO AGRÁRIO ENRIQUECIDO (SIGEF / INCRA / CAR)
      {
        name: "memorial_descritivo_georreferenciamento",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Especialista em Georreferenciamento Rural.",
        prompt: `ESPECIALISTA AGRÁRIO: Extraia dados de GEORREFERENCIAMENTO, SIGEF, CAR E CCIR no texto.

Retorne este JSON:
{
  "memorial_descritivo_georreferenciamento": {
    "ato_averbacao": "Identificador da averbação (ex: AV-3, AV-5)",
    "data_ato": "Data do registro do georreferenciamento",
    "situacao_certificacao": "CERTIFICADO NO SIGEF, PENDENTE ou NÃO CONSTA",
    "codigo_certificacao_sigef": "Código de certificação do INCRA/SIGEF",
    "area_certificada": "Área geo-certificada",
    "coordenadas_geograficas": "Latitude e Longitude dos vértices principais",
    "sistema_geodesico": "SIRGAS 2000, SAD-69 ou WGS-84",
    "sistema_projecao_cartografica": "Projeção UTM e fuso cartográfico",
    "precisao_posicional": "Precisão posicional declarada (ex: +/- 0,10m)",
    "numero_vertices": "Quantidade de vértices do perímetro",
    "memorial_georreferenciamento_completo": "Síntese dos azimutes e distâncias",
    "confrontantes_georreferenciados": "Proprietários e matrículas confrontantes no geo",
    "data_certificacao_sigef": "Data de homologação no SIGEF",
    "responsavel_tecnico": "Nome do Engenheiro/Agrimensor e registro CREA",
    "codigo_car": "Número de Inscrição no Cadastro Ambiental Rural (CAR)",
    "situacao_car": "ATIVO, PENDENTE, DEFERIDO ou CANCELADO",
    "sobreposicao_declarada": "Sobreposição com terras indígenas, quilombolas ou UCs",
    "codigo_ccir": "Código CCIR/SNCR do INCRA",
    "codigo_itr_nirf": "Número NIRF/ITR na Receita Federal"
  }
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 4. REGIMES ESPECIAIS: CONDOMÍNIOS, LOTEAMENTOS & REURB ENRIQUECIDO
      {
        name: "regimes_especiais",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Advogado Registrador Especialista em Condomínios e Loteamentos.",
        prompt: `ESPECIALISTA EM REGIMES ESPECIAIS: Extraia dados de CONDOMÍNIO, LOTEAMENTO OU REURB presentes no texto.

Retorne este JSON:
{
  "regimes_especiais": {
    "e_condominio_edilicio": true/false,
    "incorporacao_imobiliaria": "Registro da incorporação ou convenção de condomínio",
    "numero_registro_incorporacao": "Número do R- da Incorporação (Lei 4.591/64)",
    "fracao_ideal": "Fração ideal do terreno pertencente à unidade",
    "fracao_ideal_percentual": "Percentual da fração ideal (%)",
    "area_comum_vinculada": "Área comum proporcional vinculada",
    "vaga_garagem": "Vaga autônoma ou vinculada e número",
    "tipo_vaga": "Demarcada, indeterminada, coberta, descoberta, presa",
    "deposito_autonomo": "Depósito privativo autônomo ou vinculado",
    "torre_bloco_unidade": "Identificação de Torre, Bloco e Unidade Autônoma",
    "e_loteamento": true/false,
    "registro_loteamento": "Número do registro do loteamento (Lei 6.766/79)",
    "e_reurb": true/false,
    "tipo_reurb": "REURB-S (Social) ou REURB-E (Específica - Lei 13.465/17)",
    "situacao_reurb": "Certidão de Regularização Fundiária (CRF) averbada",
    "detalhes_regime": "Detalhes adicionais sobre o regime especial"
  }
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 5. AMBIENTAL & RECURSOS HÍDRICOS ENRIQUECIDO
      {
        name: "registro_ambiental",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Perito em Direito Ambiental Imobiliário.",
        prompt: `PERITO AMBIENTAL: Extraia informações de RESERVA LEGAL, APP, EMBARGOS E RECURSOS HÍDRICOS no texto.

Retorne este JSON:
{
  "registro_ambiental": {
    "tem_reserva_legal": true/false,
    "reserva_legal_averbada": "Número do ato ou código CAR da Reserva Legal",
    "reserva_legal_compensada": "Indicação se a Reserva Legal é compensada fora da propriedade",
    "area_preservacao_permanente_app": "Área de APP declarada",
    "area_consolidada_ha": "Área antrópica consolidada (ha)",
    "vegetacao_nativa_declarada": "Área de vegetação nativa preservada",
    "passivo_ambiental": "Passivo ambiental a recuperar indicado",
    "tac_ambiental": "Termo de Ajustamento de Conduta (TAC) averbado",
    "servidao_ambiental": "Servidão ambiental instituída",
    "app_recuperada": "Programa de Recuperação de Área Degradada (PRADA)",
    "area_embargada": "Embargo do IBAMA, ICMBio ou órgão estadual",
    "outorga_agua": "Outorga de direito de uso de recursos hídricos",
    "unidade_conservacao": "Sobreposição com Unidade de Conservação ou Zona de Amortecimento",
    "observacoes_ambientais": "Resumo das restrições ecológicas"
  }
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 6. IMÓVEIS ESPECIAIS: MARINHA, UNIÃO, FRONTEIRA & TOMBAMENTO ENRIQUECIDO
      {
        name: "imoveis_especiais",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Especialista em Direito Imobiliário Público.",
        prompt: `ESPECIALISTA EM DIREITO PÚBLICO: Identifique se o imóvel possui REGIME ESPECIAL DA UNIÃO/SPU, MARINHA, FRONTEIRA OU TOMBAMENTO gravado no texto.

Retorne este JSON:
{
  "imoveis_especiais": {
    "terreno_marinha": true/false,
    "terreno_acrescido_marinha": "Declaração de terreno acrescido de marinha",
    "regime_spu": "Aforamento, Ocupação, RIP ou Terreno Acrescido de Marinha",
    "laudemic_inscrito": "Pagamento de laudêmio SPU registrado",
    "faixa_fronteira": true/false,
    "area_militar_aeroportuaria": "Sobreposição com área militar ou gabarito de aeroporto",
    "faixa_nao_edificavel": "Faixa não edificável de rodovia, ferrovia ou duto",
    "patrimonio_arqueologico": "Sítio arqueológico cadastrado no IPHAN",
    "area_quilombola_indigena": "Área quilombola ou terra indígena homologada",
    "tombamento": "Tombamento por patrimônio histórico (IPHAN/CONDEPHAAT)",
    "detalhes_especiais": "Outras restrições de direito público"
  }
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 7. PROPRIETÁRIOS ATUAIS E REGIME DE BENS ENRIQUECIDO (COM MASCARAMENTO LGPD)
      {
        name: "proprietarios_atuais",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Advogado Especialista em Direitos Reais.",
        prompt: `ADVOGADO REGISTRADOR: Identifique a TITULARIDADE ATUAL COMPLETA gravada no último ato de transmissão do texto.

Retorne este JSON:
{
  "proprietarios_atuais": [
    {
      "nome": "Nome completo da pessoa física ou Razão Social da empresa",
      "cpf_cnpj": "CPF ou CNPJ formatado",
      "cpf_mascarado_lgpd": "CPF mascarado para LGPD (ex: ***.456.789-**)",
      "nacionalidade": "Nacionalidade (ex: brasileiro, portuguesa)",
      "profissao": "Profissão declarada no título",
      "endereco_declarado": "Endereço residencial/sede constante no ato",
      "estado_civil": "Solteiro(a), Casado(a), Divorciado(a), Viúvo(a)",
      "regime_bens": "Comunhão Parcial, Comunhão Universal, Separação de Bens, etc.",
      "pacto_antenupcial": "Registro de pacto antenupcial se houver",
      "cadeia_alteracao_estado_civil": "Averbações de casamento, separação ou divórcio",
      "percentual_propriedade": "Fração ideal ou % (ex: 100%, 50%, 1/2)",
      "tipo_aquisicao": "Compra e Venda, Partilha, Doação, Usucapião",
      "natureza_propriedade": "Pleno Proprietário, Nulo-Proprietário ou Usufrutuário",
      "participacao_usufruto": "Participação em reserva de usufruto",
      "regime_sucessorio": "Direito sucessório ou herança declarada",
      "ato_aquisicao": "Número do registro de aquisição (ex: R-4, R-6)",
      "data_aquisicao": "Data em que adquiriu o imóvel"
    }
  ]
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 8. CADEIA DOMINIAL CRONOLÓGICA ENRIQUECIDA (HISTÓRICO INTELIGENTE)
      {
        name: "cadeia_dominial",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Historiador Registrário.",
        prompt: `HISTORIADOR REGISTRÁRIO: Extraia a CADEIA DOMINIAL COMPLETA presente no texto (todos os atos R- e AV- de transferência em ordem cronológica).

Retorne este JSON:
{
  "cadeia_dominial": [
    {
      "numero_ato": "Ex: R-1, R-2, R-3",
      "data_registro": "Data oficial do registro",
      "tipo_transmissao": "Compra e Venda, Doação, Formal de Partilha, Permuta, Usucapião",
      "transmitentes": "Nome de quem vendeu/doou",
      "adquirentes": "Nome de quem comprou/recebeu",
      "valor_transacao": "Valor declarado da transação em R$",
      "evolucao_area": "Variação de área descrita no ato",
      "observacoes": "Título de aquisição (Escritura, Formal, etc.)"
    }
  ]
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 9. ÔNUS REAIS & GARANTIAS FINANCEIRAS ENRIQUECIDO
      {
        name: "onus_garantias_financeiras",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Auditor de Garantias Financeiras.",
        prompt: `AUDITOR FINANCEIRO: Identifique GARANTIAS, HIPOTECAS E ALIENÇÕES FIDUCIÁRIAS registradas no texto.

Retorne este JSON:
{
  "onus_garantias_financeiras": [
    {
      "tipo": "Hipoteca, Alienação Fiduciária em Garantia, Cessão Fiduciária, Cédula Rural/CPR, Penhor",
      "numero_ato": "Ex: R-3, R-5",
      "data": "Data do registro",
      "credor_banco": "Nome da instituição financeira ou credor",
      "credores_multiplos": "Outros co-credores vinculados",
      "valor_garantia": "Valor da dívida ou contrato",
      "limite_garantia": "Teto máximo da garantia declarada",
      "atualizacao_monetaria": "Índice de correção (CDI, IPCA, TR)",
      "garantias_cruzadas": "Menção a garantias prestadas em outras matrículas",
      "ranking_garantias": "Grau da garantia (ex: 1º Grau, 2º Grau)",
      "status": "ATIVO, PARCIALMENTE BAIXADO ou CANCELADO"
    }
  ]
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 10. INDISPONIBILIDADES & RESTRIÇÕES JUDICIAIS ENRIQUECIDO
      {
        name: "indisponividades_e_penhoras",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Auditor de Penhoras e Indisponibilidades.",
        prompt: `AUDITOR PROCESSUAL: Identifique PENHORAS, INDISPONIBILIDADES (CNIB), ARRESTOS E AÇÕES REGISTRADAS no texto.

Retorne este JSON:
{
  "indisponividades_e_penhoras": [
    {
      "tipo": "Penhora Judicial, Indisponibilidade CNIB, Arresto, Sequestro, Ação Execução Art. 828",
      "numero_ato": "Ex: AV-4, R-7",
      "data": "Data do ato",
      "autor_exequente": "Autor da ação judicial ou credor exequente",
      "processo_vara": "Número do processo, Vara Cível/Trabalhista/Fiscal e Comarca",
      "origem_acao": "Justiça do Trabalho, Justiça Federal, Estadual, Execução Fiscal",
      "classe_processual": "Execução de Título, Reclamação Trabalhista, Ação Civil Pública",
      "tribunal_vara_especializada": "Tribunal e Vara de origem",
      "prioridade_registral": "Ordem de preferência de penhora",
      "valor_execucao": "Valor da causa/execução se houver",
      "status": "ATIVO ou CANCELADO"
    }
  ]
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 11. USUFRUTO, SERVIDÕES & DIREITOS REAIS ENRIQUECIDO
      {
        name: "usufruto_servidoes_e_direitos",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Especialista em Direitos Reais.",
        prompt: `ESPECIALISTA EM DIREITOS REAIS: Identifique USUFRUTO, SERVIDÕES, DIREITO DE SUPERFÍCIE, HABITAÇÃO, LAJE E ENFITEUSE gravados no texto.

Retorne este JSON:
{
  "usufruto_servidoes_e_direitos": [
    {
      "tipo": "Usufruto, Habitação, Servidão, Direito de Superfície, Enfiteuse, Laje, Cláusula Reversão/Resolutiva",
      "numero_ato": "Ex: R-2, AV-6",
      "data": "Data do registro",
      "beneficiarios": "Nomes dos usufrutuários ou beneficiários",
      "clausulas_restritivas": "Inalienabilidade, Impenhorabilidade, Incomunicabilidade",
      "servidao_administrativa": "Servidão administrativa de concessionária (energia, gás, água)",
      "direito_minerario": "Citação a Alvará de Pesquisa ou Lavra ANM",
      "concessao_uso": "Concessão de Direito Real de Uso (CDRU)",
      "status": "ATIVO ou CANCELADO"
    }
  ]
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 12. PARECER TÉCNICO-JURÍDICO & IA EXPLICA MULTI-PERFIL (DUE DILIGENCE MULTIDIMENSIONAL)
      {
        name: "parecer_analise",
        model: "mistral-large-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Advogado Sênior parecerista e Perito em Due Diligence Notarial.",
        prompt: `PARECERISTA JURÍDICO SÊNIOR: Elabore o PARECER TÉCNICO-JURÍDICO E MULTI-PERFIL baseado EXCLUSIVAMENTE nos fatos da matrícula.

Retorne este JSON com todas as seções:
{
  "parecer_analise": {
    "score_risco": 15,
    "nivel_risco": "BAIXO / MÉDIO / ALTO / CRÍTICO",
    "semaforo_visual": "SEGURO / ATENÇÃO / REVISÃO JURÍDICA / ALTO RISCO",
    "status_juridico": "REGULAR / RESTRIÇÃO ATIVA / RESTRIÇÃO GRAVE / EM ANÁLISE",
    "scores_por_categoria": {
      "titularidade": 95,
      "cadeia_dominial": 90,
      "gravames_financeiros": 100,
      "ambiental": 85,
      "georreferenciamento": 90,
      "urbanistico_condominial": 95,
      "judicial_penhoras": 100,
      "liquidez_juridica": 92
    },
    "checklist_due_diligence": {
      "proprietario_identificado": true,
      "cadeia_dominial_integra": true,
      "sem_penhora_ativa": true,
      "sem_hipoteca_ativa": true,
      "sem_indisponibilidade_cnib": true,
      "reserva_legal_regular": true,
      "georreferenciamento_valido": true,
      "matricula_atualizada": true
    },
    "explicacoes_por_perfil": {
      "comprador_leigo": "Explicação extremamente clara, simples e amigável sobre a segurança de comprar o imóvel e cuidados práticos",
      "corretor_imoveis": "Orientação comercial focada na segurança do negócio, garantias da comissão e agilidade na documentação",
      "banco_credito": "Análise técnica para concessão de financiamento habitacional/agrícola, avaliação de garantia fiduciária e LTV",
      "engenheiro_agronomo": "Análise física, de área, zoneamento urbano, habite-se, SIGEF, CAR e Reserva Legal",
      "advogado_parecerista": "Parecer jurídico formal fundamentado na Lei 6.015/73, Código Civil, jurisprudência notarial e mitigações"
    },
    "resumo_geral": "Síntese executiva diagnóstica baseada unicamente no texto",
    "explicacao_descomplicada": "Resumo simples do imóvel",
    "riscos_identificados": [
      {
        "tipo_risco": "ALTO / MÉDIO / BAIXO",
        "descricao": "Vulnerabilidade jurídica extraída da matrícula",
        "impacto": "Impacto financeiro ou jurídico na compra/garantia",
        "acao_recomendada": "Como mitigar ou sanar a pendência"
      }
    ],
    "pendencias_formais": ["Pendências documentais ou cadastrais constatadas no texto"],
    "regularidades_e_conformidade": ["Pontos de conformidade identificados"],
    "recomendacao_final": "Orientação objetiva baseada nos dados",
    "conclusao_juridica": "Parecer conclusivo formal"
  }
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      }
    ];

    const results: any = {};
    
    const sectionPromises = dedicatedPrompts.map(async (sec) => {
      try {
        const messages = [
          { role: "system", content: sec.system },
          { role: "user", content: sec.prompt }
        ];
        return await chatJSON(messages, 4000, 1, sec.model);
      } catch (err) {
        console.error(`Aviso no módulo ${sec.name}:`, err);
        return {};
      }
    });

    const settled = await Promise.allSettled(sectionPromises);
    settled.forEach(res => {
      if (res.status === 'fulfilled' && res.value) {
        Object.assign(results, res.value);
      }
    });

    return results;
  },

  normalizeReport(rawReport: any): any {
    const report = { ...rawReport };

    if (!report.identificacao_geral) report.identificacao_geral = {};
    report.identificacao_geral.matricula = report.identificacao_geral.matricula || "Não identificada";
    report.identificacao_geral.cartorio_ri = report.identificacao_geral.cartorio_ri || "Registro de Imóveis";
    report.identificacao_geral.tipo_imovel_analisado = report.identificacao_geral.tipo_imovel_analisado || "Urbano / Rural";

    if (!report.caracteristicas_fisicas) report.caracteristicas_fisicas = {};
    if (!report.regimes_especiais) report.regimes_especiais = {};
    if (!report.registro_ambiental) report.registro_ambiental = {};
    if (!report.imoveis_especiais) report.imoveis_especiais = {};

    if (!Array.isArray(report.proprietarios_atuais)) report.proprietarios_atuais = [];
    if (!Array.isArray(report.cadeia_dominial)) report.cadeia_dominial = [];
    if (!Array.isArray(report.onus_garantias_financeiras)) report.onus_garantias_financeiras = [];
    if (!Array.isArray(report.indisponividades_e_penhoras)) report.indisponividades_e_penhoras = [];
    if (!Array.isArray(report.usufruto_servidoes_e_direitos)) report.usufruto_servidoes_e_direitos = [];

    if (!Array.isArray(report.onus_gravames_ativos)) {
      const garantias = report.onus_garantias_financeiras || [];
      const penhoras = report.indisponividades_e_penhoras || [];
      report.onus_gravames_ativos = [...garantias, ...penhoras];
    }

    if (!report.parecer_analise) report.parecer_analise = {};

    const gravamesAtivos = report.onus_gravames_ativos.filter(
      (g: any) => String(g.status || '').toUpperCase() !== 'CANCELADO'
    );

    if (typeof report.parecer_analise.score_risco !== 'number') {
      let score = 10;
      if (gravamesAtivos.length > 0) score += gravamesAtivos.length * 25;
      if (report.parecer_analise.riscos_identificados?.length > 0) {
        score += report.parecer_analise.riscos_identificados.length * 15;
      }
      report.parecer_analise.score_risco = Math.min(Math.max(score, 8), 95);
    }

    const score = report.parecer_analise.score_risco;
    if (score >= 75) {
      report.parecer_analise.nivel_risco = 'CRÍTICO';
      report.parecer_analise.semaforo_visual = 'ALTO RISCO';
      report.parecer_analise.status_juridico = 'RESTRIÇÃO GRAVE';
    } else if (score >= 50) {
      report.parecer_analise.nivel_risco = 'ALTO';
      report.parecer_analise.semaforo_visual = 'REVISÃO JURÍDICA';
      report.parecer_analise.status_juridico = 'RESTRIÇÃO ATIVA';
    } else if (score >= 25) {
      report.parecer_analise.nivel_risco = 'MÉDIO';
      report.parecer_analise.semaforo_visual = 'ATENÇÃO';
      report.parecer_analise.status_juridico = 'EM ANÁLISE / PENDÊNCIA';
    } else {
      report.parecer_analise.nivel_risco = 'BAIXO';
      report.parecer_analise.semaforo_visual = 'SEGURO';
      report.parecer_analise.status_juridico = 'REGULAR';
    }

    // 🧠 CAMADA TRANSVERSAL DE INTELIGÊNCIA NOTARIAL
    // 1. Matriz de Scores por Categoria
    if (!report.parecer_analise.scores_por_categoria) {
      const hasPenhoras = report.indisponividades_e_penhoras.some((p: any) => String(p.status || '').toUpperCase() !== 'CANCELADO');
      const hasGarantias = report.onus_garantias_financeiras.some((g: any) => String(g.status || '').toUpperCase() !== 'CANCELADO');
      const hasAmbiental = String(report.registro_ambiental.embargos_ambientais || '').length > 3;

      report.parecer_analise.scores_por_categoria = {
        titularidade: report.proprietarios_atuais.length > 0 ? 95 : 60,
        cadeia_dominial: report.cadeia_dominial.length > 0 ? 92 : 70,
        gravames_financeiros: hasGarantias ? 35 : 100,
        judicial_penhoras: hasPenhoras ? 10 : 100,
        ambiental: hasAmbiental ? 30 : 90,
        georreferenciamento: report.memorial_descritivo_georreferenciamento.possui_georreferenciamento ? 95 : 75,
        urbanistico_condominial: report.regimes_especiais.eh_condominio ? 95 : 85,
        liquidez_juridica: Math.max(10, 100 - score)
      };
    }

    // 2. Checklist Automático de Due Diligence
    if (!report.parecer_analise.checklist_due_diligence) {
      const hasPenhoras = report.indisponividades_e_penhoras.some((p: any) => String(p.status || '').toUpperCase() !== 'CANCELADO');
      const hasGarantias = report.onus_garantias_financeiras.some((g: any) => String(g.status || '').toUpperCase() !== 'CANCELADO');
      
      report.parecer_analise.checklist_due_diligence = {
        proprietario_identificado: report.proprietarios_atuais.length > 0,
        cadeia_dominial_integra: report.cadeia_dominial.length > 0,
        sem_penhora_ativa: !hasPenhoras,
        sem_hipoteca_ativa: !hasGarantias,
        sem_indisponibilidade_cnib: !hasPenhoras,
        reserva_legal_regular: String(report.registro_ambiental.reserva_legal_averbada || '').length > 3 || Boolean(report.registro_ambiental.tem_reserva_legal),
        georreferenciamento_valido: Boolean(report.memorial_descritivo_georreferenciamento.possui_georreferenciamento),
        matricula_atualizada: Boolean(report.identificacao_geral.data_abertura || report.identificacao_geral.matricula)
      };
    }

    // 3. IA Explica por Perfil (Fallbacks caso o prompt não preencha)
    if (!report.parecer_analise.explicacoes_por_perfil) {
      report.parecer_analise.explicacoes_por_perfil = {
        comprador_leigo: report.parecer_analise.explicacao_descomplicada || "Imóvel analisado. Verifique o score de risco antes da compra.",
        corretor_imoveis: `Documentação do imóvel analisada. Status: ${report.parecer_analise.status_juridico}. Facilidade para lavratura de escritura estimada.`,
        banco_credito: `Score financeiro/garantia: ${report.parecer_analise.scores_por_categoria?.gravames_financeiros || 90}/100. Restrições ativas: ${gravamesAtivos.length}.`,
        engenheiro_agronomo: `Área declarada: ${report.caracteristicas_fisicas.area_total_m2 || 'Ver certidão'}. Georreferenciamento: ${report.memorial_descritivo_georreferenciamento.possui_georreferenciamento ? 'Certificado SIGEF' : 'Urbano/Pendente'}.`,
        advogado_parecerista: report.parecer_analise.conclusao_juridica || report.parecer_analise.resumo_geral || "Parecer notarial completo embasado na Lei 6.015/73."
      };
    }

    // 4. Detector de Inconsistências Notariais Transversal
    if (!Array.isArray(report.detector_inconsistencias)) {
      const inconsistencias: string[] = [];
      if (!report.identificacao_geral.matricula || report.identificacao_geral.matricula === 'Não identificada') {
        inconsistencias.push('Número da matrícula não identificado na leitura.');
      }
      if (report.proprietarios_atuais.length === 0) {
        inconsistencias.push('Ausência de titular atual explicitamente qualificado no último registro.');
      }
      if (gravamesAtivos.length > 0) {
        inconsistencias.push(`Constatação de ${gravamesAtivos.length} gravame(s)/ônus ativo(s) pendente(s) de cancelamento.`);
      }
      report.detector_inconsistencias = inconsistencias;
    }

    return report;
  },


  async analyzeDocument(extractedText: string, file?: File): Promise<any> {
    try {
      if (file) {
        const fileHash = await ocrCacheService.computeHash(file);
        const cachedReport = ocrCacheService.getCachedReport(fileHash);
        if (cachedReport) {
          return cachedReport;
        }

        console.log("Executando matriz de 12 módulos com diretivas anti-alucinação...");
        const report = await this.analyzeWithGeoreferencing(extractedText);
        
        ocrCacheService.setCachedReport(fileHash, report);
        return report;
      }

      return await this.analyzeWithGeoreferencing(extractedText);
    } catch (error) {
      console.error("Falha na matriz de 12 módulos:", error);
      return this.normalizeReport({
        identificacao_geral: { 
          matricula: "Extraída com observação", 
          cartorio_ri: "Consulte o documento PDF original",
          tipo_imovel_analisado: "Não classificado"
        },
        parecer_analise: { 
          score_risco: 50,
          recomendacao_final: "ANÁLISE MANUAL NECESSÁRIA - Falha técnica no processamento.", 
          conclusao_juridica: "Recomendamos revisão direta do PDF." 
        }
      });
    }
  }
};

export const fileUtils = {
  toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

export type AnalysisProgressCallback = (step: string, progress: number, details?: any) => void;
export type MatriculaReport = any;

export async function analyzeMatricula(file: File, onProgress?: AnalysisProgressCallback): Promise<MatriculaReport> {
  onProgress?.('Extraindo texto do documento...', 20);
  const hybrid = await ocrService.extractTextHybrid(file);
  onProgress?.('Auditando os 12 Módulos Notariais com IA...', 60);
  const report = await analysisService.analyzeDocument(hybrid.text, file);
  onProgress?.('Análise concluída com sucesso!', 100);
  return report;
}
