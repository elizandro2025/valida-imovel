/**
 * Prompts da análise de matrícula — ficam só no servidor (o navegador escolhe a tarefa, não o texto do prompt).
 *
 * Regras de formato usadas em todos os módulos:
 * - os nomes de campo são exatamente os que o site lê (src/lib/reportView.ts);
 * - nenhum valor de exemplo: os modelos de JSON trazem apenas o tipo esperado, para não induzir respostas;
 * - campo ausente no documento = null; lista vazia = [].
 */

export const PIPELINE_VERSION = 3;

// Texto máximo aceito por tarefa (o site corta antes, preservando início e fim do documento)
export const MAX_TASK_TEXT = 450_000;

const BASE_RULES =
  'Você analisa certidões de matrícula de imóveis brasileiras (Lei 6.015/73).\n' +
  'REGRAS OBRIGATÓRIAS:\n' +
  '1. Use SOMENTE o que está escrito no documento. Nunca invente, deduza ou complete nomes, CPFs, CNPJs, valores, áreas, datas ou números de atos.\n' +
  '2. Informação que não aparece no documento: null (ou [] para listas). Não escreva "não consta", "N/A" ou textos parecidos no lugar de null.\n' +
  '3. Transcreva números exatamente como no documento (matrícula, CPF, CNPJ, R-/AV-, CCIR, NIRF, coordenadas).\n' +
  '4. Leia todos os registros (R-) e averbações (AV-) do início ao fim. Atos mais recentes ficam no final e prevalecem sobre os anteriores.\n' +
  '5. Um ônus só é CANCELADO quando um ato posterior (normalmente uma AV-) cancela, baixa ou quita aquele ônus de forma expressa; informe esse ato em "ato_cancelamento". Sem isso, o status é ATIVO. Se o documento for ambíguo, use INDEFINIDO.\n' +
  '6. "trecho_origem": copie literalmente um trecho curto (até 200 caracteres) do documento que comprova a informação.\n' +
  '7. Responda apenas com um objeto JSON válido, sem comentários e sem texto fora do JSON.';

const MODULES_EXTRACAO = `
### identificacao_geral (objeto)
{ "matricula": texto, "cartorio_ri": texto, "comarca": texto, "livro": texto, "folha": texto,
  "data_abertura": "DD/MM/AAAA", "tipo_imovel_analisado": "URBANO" | "RURAL" | null,
  "codigo_imovel": texto (inscrição municipal, SQL, IPTU, CCIR ou código INCRA citado),
  "serventia": texto (CNS ou identificação da serventia), "historico_renumeracao": texto,
  "origem_transcricao": texto (matrícula ou transcrição de origem), "codigo_nacional_imovel": texto,
  "data_ultima_atualizacao": "DD/MM/AAAA" (data da certidão ou do último ato),
  "total_registros": número de atos R-, "total_averbacoes": número de atos AV- }

### caracteristicas_fisicas (objeto)
{ "descricao_legal": texto literal da descrição do imóvel, "endereco_completo": texto, "denominacao_imovel": texto,
  "area_total_m2": texto como no documento, "area_total_hectares": texto, "area_outras_unidades": texto (alqueires, fração ideal etc.),
  "area_construida": texto, "area_privativa": texto, "area_comum": texto,
  "perimetros_confrontacoes": texto literal das medidas e confrontações, "benfeitorias": texto (construções e habite-se averbados, com o ato),
  "loteamento_quadra_lote": texto, "numero_pavimentos": texto, "tipo_construtivo": texto, "uso_predominante": texto,
  "zoneamento_mencionado": texto, "matriculas_desmembradas": texto, "matricula_origem_remembramento": texto }

### memorial_descritivo_georreferenciamento (objeto)
{ "possui_georreferenciamento": true | false | null, "ato_averbacao": texto, "data_ato": "DD/MM/AAAA",
  "situacao_certificacao": texto como consta (ex.: certificação SIGEF citada), "codigo_certificacao_sigef": texto,
  "area_certificada": texto, "coordenadas_geograficas": texto literal dos vértices, "sistema_geodesico": texto,
  "numero_vertices": texto, "responsavel_tecnico": texto (nome, CREA/CFT, ART),
  "codigo_car": texto, "situacao_car": texto, "codigo_ccir": texto, "codigo_itr_nirf": texto, "modulo_fiscal": texto }

### regimes_especiais (objeto)
{ "eh_condominio": true | false | null, "incorporacao_imobiliaria": texto, "fracao_ideal": texto, "vaga_garagem": texto,
  "torre_bloco_unidade": texto, "eh_loteamento": true | false | null, "registro_loteamento": texto,
  "eh_reurb": true | false | null, "tipo_reurb": texto, "detalhes_regime": texto }

### registro_ambiental (objeto)
{ "reserva_legal_averbada": texto (ato e área) ou null, "area_preservacao_permanente_app": texto,
  "embargos_ambientais": texto descrevendo embargo ou auto de infração averbado, ou null se o documento não citar nenhum,
  "tac_ambiental": texto, "servidao_ambiental": texto, "outorga_agua": texto, "unidade_conservacao": texto,
  "observacoes_ambientais": texto }

### imoveis_especiais (objeto)
{ "terreno_marinha": true | false | null, "regime_spu": texto (aforamento, ocupação, RIP), "laudemio": texto,
  "faixa_fronteira": true | false | null, "faixa_dominio": texto (faixa de rodovia, ferrovia ou duto citada) ou null,
  "tombamento": texto ou null, "terra_indigena_quilombola": texto ou null, "detalhes_especiais": texto }

### proprietarios_atuais (lista) — quem é dono HOJE, segundo o último ato de transmissão não cancelado
[{ "nome": texto, "cpf_cnpj": texto, "qualificacao": texto (nacionalidade, profissão, endereço),
   "estado_civil": texto, "regime_bens": texto, "percentual_propriedade": texto exatamente como no documento ou null,
   "natureza_propriedade": texto (propriedade plena, nua-propriedade, fiduciante etc.),
   "ato_aquisicao": texto (ex.: o R- que transmitiu), "data_aquisicao": "DD/MM/AAAA" }]

### cadeia_dominial (lista, ordem cronológica, todos os atos de transmissão)
[{ "numero_ato": texto, "data_registro": "DD/MM/AAAA", "tipo_transmissao": texto,
   "transmitentes": texto, "adquirentes": texto, "valor_transacao": texto, "titulo_aquisicao": texto, "observacoes": texto }]

### onus_garantias_financeiras (lista: hipotecas, alienações fiduciárias, cédulas, penhor, cessões — inclusive os já cancelados)
[{ "numero_ato": texto, "tipo": texto, "data": "DD/MM/AAAA", "credor_banco": texto, "devedor": texto,
   "valor_garantia": texto, "ato_cancelamento": texto ou null, "data_cancelamento": "DD/MM/AAAA" ou null,
   "status": "ATIVO" | "CANCELADO" | "INDEFINIDO", "trecho_origem": texto }]

### indisponividades_e_penhoras (lista: penhoras, arrestos, sequestros, indisponibilidades, ações averbadas — inclusive canceladas)
[{ "numero_ato": texto, "tipo": texto, "data": "DD/MM/AAAA", "autor_exequente": texto, "executado": texto,
   "processo_vara": texto (número do processo, vara e comarca), "valor_execucao": texto,
   "ato_cancelamento": texto ou null, "data_cancelamento": "DD/MM/AAAA" ou null,
   "status": "ATIVO" | "CANCELADO" | "INDEFINIDO", "trecho_origem": texto }]

### usufruto_servidoes_e_direitos (lista: usufruto, servidão, superfície, habitação, cláusulas de inalienabilidade/impenhorabilidade)
[{ "numero_ato": texto, "tipo": texto, "data": "DD/MM/AAAA", "beneficiarios": texto, "clausulas_restritivas": texto,
   "ato_cancelamento": texto ou null, "status": "ATIVO" | "CANCELADO" | "INDEFINIDO", "trecho_origem": texto }]

### averbacoes_diversas (lista: demais averbações — construção, casamento, divórcio, óbito, retificação, mudança de numeração etc.)
[{ "numero_averbacao": texto, "tipo": texto, "data": "DD/MM/AAAA", "descricao": texto }]
`;

const MODULE_PARECER = `
### parecer_analise (objeto) — parecer técnico baseado SOMENTE nos fatos do documento
{ "score_risco": número inteiro de 0 a 100, seguindo a régua abaixo,
  "explicacao_descomplicada": texto simples de até 100 palavras para um leigo,
  "resumo_geral": texto de 1 a 2 parágrafos (titularidade, ônus ativos, situação ambiental e de georreferenciamento),
  "riscos_identificados": [{ "tipo_risco": "ALTO" | "MÉDIO" | "BAIXO", "descricao": texto, "numero_ato": texto ou null,
      "trecho_origem": texto literal do documento, "base_legal": texto ou null, "impacto": texto, "acao_recomendada": texto }],
  "pendencias_formais": [texto],
  "regularidades_e_conformidade": [texto],
  "certidoes_complementares_recomendadas": [{ "certidao": texto, "orgao": texto, "motivo": texto }],
  "explicacoes_por_perfil": { "comprador_leigo": texto, "corretor_imoveis": texto, "banco_credito": texto,
      "engenheiro_agronomo": texto, "advogado_parecerista": texto },
  "recomendacao_final": texto objetivo,
  "conclusao_juridica": texto formal com a fundamentação legal aplicável }

RÉGUA DO score_risco:
- 0 a 24: nenhum ônus, penhora, indisponibilidade ou ação ativa; titularidade clara.
- 25 a 49: apenas pendências formais (ex.: construção não averbada, estado civil desatualizado, georreferenciamento pendente) ou direitos de menor impacto ativos (servidão, usufruto).
- 50 a 74: hipoteca, alienação fiduciária, cédula ou cláusula de inalienabilidade/impenhorabilidade ATIVA; ação averbada (art. 828 do CPC).
- 75 a 100: penhora, arresto, sequestro, indisponibilidade ou embargo ambiental ATIVO; divergência grave de titularidade.
Ônus cancelados por ato posterior não aumentam o risco. Cada risco precisa citar o ato e o trecho do documento.
`;

const GEO_MODULE = `
### memorial_descritivo_georreferenciamento (objeto)
{ "ato_averbacao": texto, "data_ato": "DD/MM/AAAA", "situacao_certificacao": texto, "area_total_ha": texto, "perimetro_total": texto,
  "coordenadas_geograficas": [{ "vertice": texto, "latitude": texto, "longitude": texto, "tipo_marco": texto, "descricao": texto }],
  "coordenadas_utm": [{ "vertice": texto, "x_utm": texto, "y_utm": texto, "zona_utm": texto, "tipo_marco": texto, "descricao": texto }],
  "sistema_geodesico": texto, "datum": texto, "zona_utm": texto,
  "responsavel_tecnico": { "nome": texto, "crea_cft": texto, "anotacao_tecnica": texto },
  "observacoes_tecnicas": texto }
Transcreva todos os vértices do memorial, na ordem em que aparecem.
`;

export const OCR_PROMPT =
  'Transcreva INTEGRAL e LITERALMENTE todo o texto deste documento (certidão de matrícula imobiliária). ' +
  'Separe as páginas com a linha "--- Página N ---". Não resuma, não corrija, não interprete e não omita nada: ' +
  'mantenha números de matrícula, R-/AV-, CPFs, CNPJs, datas, valores, áreas e coordenadas exatamente como estão. ' +
  'Trechos ilegíveis: escreva [ilegível]. Responda apenas com a transcrição.';

const CHAT_SYSTEM =
  'Você é o assistente do ValidaImóvel e responde dúvidas sobre UMA matrícula de imóvel já analisada.\n' +
  '1. Responda só com base nos dados do relatório fornecido; cite os atos (R-, AV-) sempre que possível.\n' +
  '2. Se a informação não estiver no relatório, diga que ela não foi identificada na certidão analisada.\n' +
  '3. Linguagem clara e direta, em português do Brasil, sem jargão desnecessário.\n' +
  '4. Lembre, quando for decisivo, que a análise é automatizada e não substitui a certidão atualizada nem um advogado.\n' +
  'Responda em JSON: { "resposta": texto }';

export type AnalysisTask = 'extracao' | 'parecer' | 'geo';
export const ANALYSIS_TASKS: AnalysisTask[] = ['extracao', 'parecer', 'geo'];

interface GeminiRequest {
  systemInstruction?: { parts: Array<{ text: string }> };
  contents: Array<{ role: 'user'; parts: Array<{ text: string }> }>;
  generationConfig: { thinkingConfig: { thinkingLevel: 'low' }; responseMimeType?: string };
}

function jsonRequest(system: string, prompt: string): GeminiRequest {
  return {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { thinkingConfig: { thinkingLevel: 'low' }, responseMimeType: 'application/json' },
  };
}

const TASK_PROMPTS: Record<AnalysisTask, { keys: string[]; modules: string }> = {
  extracao: {
    keys: ['identificacao_geral', 'caracteristicas_fisicas', 'memorial_descritivo_georreferenciamento', 'regimes_especiais',
      'registro_ambiental', 'imoveis_especiais', 'proprietarios_atuais', 'cadeia_dominial', 'onus_garantias_financeiras',
      'indisponividades_e_penhoras', 'usufruto_servidoes_e_direitos', 'averbacoes_diversas'],
    modules: MODULES_EXTRACAO,
  },
  parecer: { keys: ['parecer_analise'], modules: MODULE_PARECER },
  geo: { keys: ['memorial_descritivo_georreferenciamento'], modules: GEO_MODULE },
};

export function buildTaskRequest(task: AnalysisTask, text: string): GeminiRequest {
  const { keys, modules } = TASK_PROMPTS[task];
  const prompt =
    `Devolva UM objeto JSON com exatamente estas chaves de primeiro nível, todas presentes: ${keys.map(k => `"${k}"`).join(', ')}.\n` +
    `Formato de cada chave (os textos entre aspas descrevem o tipo esperado, não são valores):\n${modules}\n` +
    `DOCUMENTO (transcrição da certidão):\n${text}`;
  return jsonRequest(BASE_RULES, prompt);
}

export function buildChatRequest(question: string, context: string): GeminiRequest {
  return jsonRequest(CHAT_SYSTEM, `RELATÓRIO DA MATRÍCULA (JSON):\n${context}\n\nPERGUNTA:\n${question}`);
}

// Corpo do pedido de OCR montado em volta do PDF em base64 sem copiar nem interpretar o arquivo
export function buildOcrRequestParts(): { prefix: string; suffix: string } {
  return {
    prefix: '{"contents":[{"role":"user","parts":[{"inline_data":{"mime_type":"application/pdf","data":"',
    // "low" é o menor nível aceito por todos os modelos da lista ("minimal" dá erro 400 no gemini-flash-latest)
    suffix: `"}},{"text":${JSON.stringify(OCR_PROMPT)}}]}],"generationConfig":{"thinkingConfig":{"thinkingLevel":"low"}}}`,
  };
}
