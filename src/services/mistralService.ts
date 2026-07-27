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
        return { ...JSON.parse(content), ...continuation };
      }

      // Algoritmo de higienização e auto-reparo de JSON
      let cleaned = content.replace(/```json|```/g, "").trim();
      if (!cleaned.startsWith("{")) cleaned = "{" + cleaned;
      if (!cleaned.endsWith("}")) cleaned = cleaned + "}";

      return JSON.parse(cleaned);
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

  // 🏛️ PROMPTS DEDICADOS COM DIRETIVAS RÍGIDAS ANTI-ALUCINAÇÃO
  async analyzeWith12DedicatedPrompts(extractedText: string): Promise<any> {
    const textChunk = extractedText.substring(0, 22000);
    
    const dedicatedPrompts = [

      // 1. IDENTIFICAÇÃO REGISTRÁRIA E CARTORÁRIA
      {
        name: "identificacao_geral",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Oficial Registrador de Imóveis sênior.",
        prompt: `EXAMINADOR CARTORÁRIO: Extraia APENAS a IDENTIFICAÇÃO DA MATRÍCULA E CARTÓRIO presentes no texto.

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
    "serventia": "Código CNS ou serventia registral"
  }
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 2. CARACTERIZAÇÃO FÍSICA E BENFEITORIAS
      {
        name: "caracteristicas_fisicas",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Perito Engenheiro Imobiliário.",
        prompt: `PERITO ENGENHEIRO: Extraia APENAS as CARACTERÍSTICAS FÍSICAS E BENFEITORIAS gravadas no texto.

Retorne este JSON:
{
  "caracteristicas_fisicas": {
    "descricao_legal": "Transcrição literal da descrição legal do imóvel",
    "area_total_m2": "Área total em m²",
    "area_total_hectares": "Área em hectares (ha) se for rural",
    "area_outras_unidades": "Alqueires ou fração ideal",
    "endereco_completo": "Logradouro, número, bairro, CEP, cidade e UF",
    "denominacao_imovel": "Nome da fazenda/sítio ou edifício/condomínio",
    "perimetros_confrontacoes": "Descrição literal das divisas e confrontantes",
    "benfeitorias": "Construções, Habite-se e benfeitorias averbadas",
    "loteamento_quadra_lote": "Lote, Quadra e Bairro/Loteamento",
    "observacoes_tecnicas": "Observações relevantes gravadas no texto"
  }
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 3. GEORREFERENCIAMENTO & REGISTRO AGRÁRIO (SIGEF / INCRA / CAR / CCIR)
      {
        name: "memorial_descritivo_georreferenciamento",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Especialista em Georreferenciamento Rural.",
        prompt: `ESPECIALISTA AGRÁRIO: Extraia APENAS dados de GEORREFERENCIAMENTO, SIGEF, CAR E CCIR presentes no texto.

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
    "responsavel_tecnico": "Nome do Engenheiro/Agrimensor e registro CREA",
    "codigo_car": "Número de Inscrição no Cadastro Ambiental Rural (CAR)",
    "codigo_ccir": "Código CCIR/SNCR do INCRA",
    "codigo_itr_nirf": "Número NIRF/ITR na Receita Federal"
  }
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 4. REGIMES ESPECIAIS: CONDOMÍNIOS, LOTEAMENTOS & REURB
      {
        name: "regimes_especiais",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Advogado Registrador Especialista em Condomínios e Loteamentos.",
        prompt: `ESPECIALISTA EM REGIMES ESPECIAIS: Extraia APENAS dados de CONDOMÍNIO, LOTEAMENTO OU REURB presentes no texto.

Retorne este JSON:
{
  "regimes_especiais": {
    "e_condominio_edilicio": true/false,
    "incorporacao_imobiliaria": "Registro da incorporação ou convenção de condomínio",
    "fracao_ideal": "Fração ideal do terreno pertencente à unidade",
    "vaga_garagem": "Vaga autônoma ou vinculada e depósito",
    "e_loteamento": true/false,
    "registro_loteamento": "Número do registro do loteamento (Lei 6.766/79)",
    "e_reurb": true/false,
    "tipo_reurb": "REURB-S (Social) ou REURB-E (Específica - Lei 13.465/17)",
    "detalhes_regime": "Detalhes adicionais sobre o regime especial"
  }
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 5. AMBIENTAL & RECURSOS HÍDRICOS
      {
        name: "registro_ambiental",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Perito em Direito Ambiental Imobiliário.",
        prompt: `PERITO AMBIENTAL: Extraia APENAS informações de RESERVA LEGAL, APP, EMBARGOS E RECURSOS HÍDRICOS presentes no texto.

Retorne este JSON:
{
  "registro_ambiental": {
    "tem_reserva_legal": true/false,
    "reserva_legal_averbada": "Número do ato ou código CAR da Reserva Legal",
    "area_preservacao_permanente_app": "Área de APP declarada",
    "embargos_ambientais": "Menção a embargos IBAMA, ICMBio ou estadual",
    "outorga_agua": "Outorga de direito de uso de recursos hídricos",
    "unidade_conservacao": "Sobreposição com Unidade de Conservação ou Zona de Amortecimento",
    "observacoes_ambientais": "Resumo das restrições ecológicas"
  }
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 6. IMÓVEIS ESPECIAIS: MARINHA, UNIÃO, FRONTEIRA & TOMBAMENTO
      {
        name: "imoveis_especiais",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Especialista em Direito Imobiliário Público.",
        prompt: `ESPECIALISTA EM DIREITO PÚBLICO: Identifique APENAS se o imóvel possui REGIME ESPECIAL DA UNIÃO/SPU, MARINHA, FRONTEIRA OU TOMBAMENTO gravado no texto.

Retorne este JSON:
{
  "imoveis_especiais": {
    "terreno_marinha": true/false,
    "regime_spu": "Aforamento, Ocupação, RIP ou Terreno Acrescido de Marinha",
    "laudemic_inscrito": "Pagamento de laudêmio SPU",
    "faixa_fronteira": true/false,
    "faixa_dominio": "Sobreposição com Faixa de Domínio de Rodovia/Ferrovia",
    "terra_indigena_quilombola": "Mencionada sobreposição FUNAI ou INCRA",
    "tombamento": "Tombamento por patrimônio histórico (IPHAN/CONDEPHAAT)",
    "detalhes_especiais": "Outras restrições de direito público"
  }
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 7. PROPRIETÁRIOS ATUAIS E REGIME DE BENS
      {
        name: "proprietarios_atuais",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Advogado Especialista em Direitos Reais.",
        prompt: `ADVOGADO REGISTRADOR: Identifique APENAS a TITULARIDADE ATUAL COMPLETA gravada no último ato de transmissão do texto.

Retorne este JSON:
{
  "proprietarios_atuais": [
    {
      "nome": "Nome completo da pessoa física ou Razão Social da empresa",
      "cpf_cnpj": "CPF ou CNPJ formatado",
      "estado_civil": "Solteiro(a), Casado(a), Divorciado(a), Viúvo(a)",
      "regime_bens": "Comunhão Parcial, Comunhão Universal, Separação de Bens, etc.",
      "pacto_antenupcial": "Registro de pacto antenupcial se houver",
      "percentual_propriedade": "Fração ideal ou % (ex: 100%, 50%, 1/2)",
      "natureza_propriedade": "Pleno Proprietário, Nulo-Proprietário ou Usufrutuário",
      "ato_aquisicao": "Número do registro de aquisição (ex: R-4, R-6)",
      "data_aquisicao": "Data em que adquiriu o imóvel"
    }
  ]
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 8. CADEIA DOMINIAL CRONOLÓGICA (HISTÓRICO)
      {
        name: "cadeia_dominial",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Historiador Registrário.",
        prompt: `HISTORIADOR REGISTRÁRIO: Extraia APENAS a CADEIA DOMINIAL COMPLETA presente no texto (todos os atos R- e AV- de transferência em ordem cronológica).

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
      "observacoes": "Título de aquisição (Escritura, Formal, etc.)"
    }
  ]
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 9. ÔNUS REAIS, GARANTIAS & GRAVAMES FINANCEIROS
      {
        name: "onus_garantias_financeiras",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Auditor de Garantias Financeiras.",
        prompt: `AUDITOR FINANCEIRO: Identifique APENAS GARANTIAS, HIPOTECAS E ALIENÇÕES FIDUCIÁRIAS registradas no texto.

Retorne este JSON:
{
  "onus_garantias_financeiras": [
    {
      "tipo": "Hipoteca, Alienação Fiduciária em Garantia, Cédula Rural/CPR, Penhor",
      "numero_ato": "Ex: R-3, R-5",
      "data": "Data do registro",
      "credor_banco": "Nome da instituição financeira ou credor",
      "valor_garantia": "Valor da dívida ou contrato",
      "status": "ATIVO ou CANCELADO"
    }
  ]
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 10. INDISPONIBILIDADES & RESTRIÇÕES JUDICIAIS
      {
        name: "indisponividades_e_penhoras",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Auditor de Penhoras e Indisponibilidades.",
        prompt: `AUDITOR PROCESSUAL: Identifique APENAS PENHORAS, INDISPONIBILIDADES (CNIB), ARRESTOS E AÇÕES REGISTRADAS no texto.

Retorne este JSON:
{
  "indisponividades_e_penhoras": [
    {
      "tipo": "Penhora Judicial, Indisponibilidade CNIB, Arresto, Sequestro, Ação Execução Art. 828",
      "numero_ato": "Ex: AV-4, R-7",
      "data": "Data do ato",
      "autor_exequente": "Autor da ação judicial ou credor exequente",
      "processo_vara": "Número do processo, Vara Cível/Trabalhista/Fiscal e Comarca",
      "valor_execucao": "Valor da causa/execução se houver",
      "status": "ATIVO ou CANCELADO"
    }
  ]
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 11. USUFRUTO, SERVIDÕES & DIREITO REAL DE LAJE
      {
        name: "usufruto_servidoes_e_direitos",
        model: "mistral-small-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Especialista em Direitos Reais.",
        prompt: `ESPECIALISTA EM DIREITOS REAIS: Identifique APENAS USUFRUTO, SERVIDÕES, DIREITO DE SUPERFÍCIE E LAJE gravados no texto.

Retorne este JSON:
{
  "usufruto_servidoes_e_direitos": [
    {
      "tipo": "Usufruto Vitalício/Temporário, Servidão de Passagem/Eletroduto, Direito de Superfície, Laje",
      "numero_ato": "Ex: R-2, AV-6",
      "data": "Data do registro",
      "beneficiarios": "Nomes dos usufrutuários ou beneficiários da servidão",
      "clausulas_restritivas": "Inalienabilidade, Impenhorabilidade, Incomunicabilidade",
      "status": "ATIVO ou CANCELADO"
    }
  ]
}

DOCUMENTO DE ORIGEM:
${textChunk}`
      },

      // 12. PARECER TÉCNICO-JURÍDICO & DUE DILIGENCE (BASEADO ESTRITAMENTE NOS FATOS EXTRAÍDOS)
      {
        name: "parecer_analise",
        model: "mistral-large-latest",
        system: STRICT_ANTI_HALLUCINATION_SYSTEM + "\nVocê é um Advogado Sênior parecerista.",
        prompt: `PARECERISTA JURÍDICO SÊNIOR: Elabore o PARECER TÉCNICO-JURÍDICO FINAL baseado EXCLUSIVAMENTE nos fatos da matrícula.

Calcule o SCORE DE RISCO (0 a 100):
- 0 a 25: RISCO BAIXO (Matrícula limpa)
- 26 a 50: RISCO MÉDIO (Pendências cadastrais ou averbações secundárias)
- 51 a 75: RISCO ALTO (Hipotecas pendentes ou restrições parciais)
- 76 a 100: RISCO CRÍTICO (Penhora ativa, indisponibilidade CNIB, litígio)

Retorne este JSON:
{
  "parecer_analise": {
    "score_risco": 15,
    "nivel_risco": "BAIXO / MÉDIO / ALTO / CRÍTICO",
    "status_juridico": "REGULAR / RESTRIÇÃO ATIVA / RESTRIÇÃO GRAVE / EM ANÁLISE",
    "resumo_geral": "Síntese executiva diagnóstica baseada unicamente no texto",
    "explicacao_descomplicada": "Explicação clara e extremamente simples em português para leigos/compradores sem juridiquês, dizendo em palavras simples se o imóvel pode ser comprado e quais são os cuidados básicos",
    "resumo_para_leigos": {
      "quem_e_o_dono": "Explicação simples de quem é a pessoa legalmente autorizada a vender",
      "tem_divida_ou_bloqueio": "Explicação simples sobre a existência ou não de dívidas, hipotecas ou restrições",
      "o_que_fazer_agora": "Passo a passo simples e direto para o comprador ou corretor"
    },
    "situacao_atual_propriedade": "Diagnóstico sobre a titularidade constante na matrícula",
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
      report.parecer_analise.score_risco = Math.min(Math.max(score, 10), 95);
    }

    const score = report.parecer_analise.score_risco;
    if (score >= 75) {
      report.parecer_analise.nivel_risco = 'CRÍTICO';
      report.parecer_analise.status_juridico = 'RESTRIÇÃO GRAVE';
    } else if (score >= 50) {
      report.parecer_analise.nivel_risco = 'ALTO';
      report.parecer_analise.status_juridico = 'RESTRIÇÃO ATIVA';
    } else if (score >= 25) {
      report.parecer_analise.nivel_risco = 'MÉDIO';
      report.parecer_analise.status_juridico = 'EM ANÁLISE / PENDÊNCIA';
    } else {
      report.parecer_analise.nivel_risco = 'BAIXO';
      report.parecer_analise.status_juridico = 'REGULAR';
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
