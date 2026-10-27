/**
 * Conteúdo da página inicial. Tudo aqui descreve o que o sistema faz hoje; landing.test.ts confere os pontos que
 * podem ficar desatualizados (procedimentos, itens dos checklists, preço e limites) contra o código real.
 * Exemplos citados vêm dos dados fictícios que abrem em /app?sample=... (useMatriculaAnalysis.ts e projectSampleData.ts).
 */
import { COMPANY_CONFIG } from '@/config/companyConfig';

const { offer } = COMPANY_CONFIG;

// Mesma chave do botão "Continuar com Google" (AuthPage): sem ela, a página não cita o login com Google
export const LOGIN_OPTIONS = import.meta.env.VITE_GOOGLE_LOGIN === 'true' ? 'com e-mail e senha ou com a conta Google' : 'com e-mail e senha';

export type Tone = 'ok' | 'warn' | 'bad' | 'neutral';
export type ModuleId = 'matricula' | 'projeto';

// Procedimentos da conferência de projetos (mesmas chaves de PROCEDURE_CHECKLISTS e PLAIN_PROCEDURES)
export const LANDING_PROCEDURES: { key: string; label: string; hint: string; items: number }[] = [
  { key: 'desdobro', label: 'Desdobro de lote', hint: 'Dividir um lote urbano em dois ou mais', items: 16 },
  { key: 'retificacao', label: 'Retificação de área', hint: 'Corrigir as medidas ou a área registradas na matrícula', items: 28 },
  { key: 'unificacao', label: 'Unificação', hint: 'Juntar imóveis vizinhos do mesmo dono em uma matrícula', items: 15 },
  { key: 'estremacao', label: 'Estremação', hint: 'Separar a parte de quem tem fração de uma área maior', items: 29 },
  { key: 'divisao', label: 'Divisão de condomínio', hint: 'Dividir um imóvel entre os coproprietários', items: 17 },
  { key: 'reurb', label: 'REURB', hint: 'Regularização fundiária urbana', items: 11 },
];

// Vértices (UTM SIRGAS 2000, fuso 23S) do projeto de exemplo, para o desenho da poligonal
export const SAMPLE_VERTICES: [string, number, number][] = [
  ['M-01', 225410.15, 7481200.32],
  ['M-02', 225850.59, 7481190.65],
  ['M-03', 226120.21, 7481540.1],
  ['M-04', 225980.4, 7481820.9],
  ['M-05', 225520.12, 7481840.4],
  ['M-06', 225340.8, 7481510.11],
];

export interface SampleRow { label: string; value: string; tone?: Tone }

export interface Feature {
  id: string;
  name: string;
  problem: string;
  how: string;
  delivers: string;
  sample: { caption: string; rows: SampleRow[] };
}

export const MATRICULA_FEATURES: Feature[] = [
  {
    id: 'leitura',
    name: 'Leitura da certidão inteira',
    problem: 'Matrículas antigas têm dezenas de atos e páginas escaneadas. O problema quase nunca está na primeira página.',
    how: 'A IA transcreve todas as páginas do PDF, digital ou escaneado, e organiza cada registro (R-) e averbação (AV-) em 12 grupos de informação.',
    delivers: 'Identificação da matrícula, características do imóvel, georreferenciamento, regimes especiais, situação ambiental e imóveis especiais (marinha, faixa de domínio).',
    sample: {
      caption: 'Exemplo com risco · dados fictícios',
      rows: [
        { label: 'Matrícula', value: '18.920 · Barretos/SP' },
        { label: 'Imóvel', value: 'Sítio Boa Vista, 120,00 ha' },
        { label: 'Atos lidos', value: 'R-1 · R-3 · AV-4' },
      ],
    },
  },
  {
    id: 'donos',
    name: 'Donos atuais e histórico',
    problem: 'A venda precisa de todos os proprietários e, conforme o regime de bens, do cônjuge (art. 1.647 do Código Civil).',
    how: 'Lista quem é dono hoje, com a fração de cada um, o estado civil e o regime de bens, e a sequência de transmissões (cadeia dominial).',
    delivers: 'Quem precisa assinar e de onde veio a propriedade.',
    sample: {
      caption: 'Exemplo regular · dados fictícios',
      rows: [
        { label: 'Henrique de Almeida Prado', value: '50% · R-3' },
        { label: 'Beatriz V. de Almeida Prado', value: '50% · R-3' },
        { label: 'Regime de bens', value: 'Comunhão parcial' },
        { label: 'Cadeia dominial', value: '6 atos, de 1998 a 2023' },
      ],
    },
  },
  {
    id: 'onus',
    name: 'Dívidas, penhoras e restrições',
    problem: 'Penhora, hipoteca ou indisponibilidade ativa pode impedir a venda ou fazer o comprador perder o imóvel (fraude à execução, art. 792 do CPC).',
    how: 'Separa hipotecas, alienações fiduciárias, cédulas, penhoras, indisponibilidades, usufrutos e servidões, e marca cada uma como ativa ou cancelada.',
    delivers: 'Um ônus só aparece como cancelado se a matrícula trouxer o ato de cancelamento. Sem ele, fica ativo ou marcado para conferir.',
    sample: {
      caption: 'Exemplo com risco · dados fictícios',
      rows: [
        { label: 'R-3 · Cédula rural hipotecária', value: 'Ativa · R$ 480 mil', tone: 'warn' },
        { label: 'AV-4 · Embargo ambiental (IBAMA)', value: 'Ativo', tone: 'bad' },
        { label: 'Ato de cancelamento', value: 'Não encontrado', tone: 'warn' },
      ],
    },
  },
  {
    id: 'nota',
    name: 'Nota de risco com o trecho de origem',
    problem: 'Um parecer sem fonte não ajuda a decidir: é preciso saber de onde saiu cada conclusão.',
    how: 'Nota de 0 a 100. Cada risco cita o trecho da certidão, marcado como localizado ou não no texto lido. Com penhora, indisponibilidade ou embargo ativo, a nota nunca fica abaixo de 75.',
    delivers: 'Nível de risco, pendências, certidões complementares recomendadas e explicações para comprador, corretor, banco, engenheiro e advogado.',
    sample: {
      caption: 'Exemplo com risco · dados fictícios',
      rows: [
        { label: 'Nota de risco', value: '88 · Crítico', tone: 'bad' },
        { label: 'Trecho do AV-4', value: 'Localizado no documento', tone: 'ok' },
        { label: 'Explicações', value: '5 perfis de leitor' },
      ],
    },
  },
  {
    id: 'assistente',
    name: 'Assistente para perguntas',
    problem: 'Quem precisa assinar? A hipoteca foi baixada? Achar a resposta em várias páginas leva tempo.',
    how: 'Pergunte em português simples. A resposta usa só os dados da matrícula analisada e cita os atos. Se a informação não estiver lá, o assistente diz que não foi identificada.',
    delivers: 'Respostas curtas, com o número do ato, sem sair do relatório.',
    sample: {
      caption: 'Ilustração com o exemplo regular · dados fictícios',
      rows: [
        { label: 'Pergunta', value: 'Quem precisa assinar a venda?' },
        { label: 'Resposta', value: 'Os dois proprietários do R-3, com 50% cada.' },
      ],
    },
  },
  {
    id: 'exportar',
    name: 'Relatório para guardar e enviar',
    problem: 'A análise precisa chegar ao cliente, ao advogado ou ao banco, e não fica salva no sistema.',
    how: 'Exporte o relatório em PDF, copie os dados ou gere um resumo pronto para o WhatsApp. Um tour guiado explica cada aba.',
    delivers: 'Um documento para arquivar e compartilhar, com o aviso de que a análise é automatizada.',
    sample: {
      caption: 'Ações do relatório',
      rows: [
        { label: 'Exportar PDF', value: 'Assinantes' },
        { label: 'Resumo para WhatsApp', value: 'Copiar' },
        { label: 'Copiar dados', value: 'Copiar' },
      ],
    },
  },
];

export const PROJECT_FEATURES: Feature[] = [
  {
    id: 'envio',
    name: 'Leitura automática dos documentos',
    problem: 'Um desdobro ou uma retificação junta planta, memorial, matrícula, ART e arquivos de coordenadas, cada um em um formato.',
    how: 'Envie até 12 arquivos de uma vez (PDF, PNG, JPG, TXT, CSV, KML ou DXF, até 15 MB cada). O sistema reconhece o tipo de cada um pelo nome e a IA lê todos.',
    delivers: 'Dados do imóvel, do responsável técnico e da ART preenchidos, com a lista do que chegou e do que falta para o procedimento.',
    sample: {
      caption: 'Documentos recebidos · ilustração',
      rows: [
        { label: 'planta-gleba.pdf', value: 'Planta', tone: 'ok' },
        { label: 'memorial.pdf', value: 'Memorial', tone: 'ok' },
        { label: 'coordenadas.csv', value: 'Coordenadas', tone: 'ok' },
      ],
    },
  },
  {
    id: 'medidas',
    name: 'Área e perímetro pelas coordenadas',
    problem: 'Área ou perímetro declarados que não batem com as coordenadas costumam virar exigência do cartório.',
    how: 'O sistema calcula a área (fórmula de Gauss), o perímetro e a distância e o azimute de cada lado. Converte coordenadas geográficas para UTM SIRGAS 2000 e acusa poligonal que se cruza. A conta é do sistema, não da IA.',
    delivers: 'Os valores da planta e do memorial comparados com o cálculo, dentro da tolerância, e o desenho da poligonal em escala.',
    sample: {
      caption: 'Exemplo de projeto · dados fictícios',
      rows: [
        { label: 'Área calculada', value: '38,9313 ha', tone: 'ok' },
        { label: 'Perímetro calculado', value: '2.349,58 m' },
        { label: 'Perímetro no memorial', value: '2.349,98 m', tone: 'warn' },
      ],
    },
  },
  {
    id: 'planta-memorial',
    name: 'Planta × memorial',
    problem: 'Centímetros de diferença entre o desenho e o texto bastam para o cartório devolver o pedido.',
    how: 'Compara 16 campos entre a planta e o memorial (área, perímetro, vértices, datum, projeção, matrícula, proprietários, CPF, endereço, município, comarca e outros) e a distância de cada lado.',
    delivers: 'Cada diferença com os dois valores lado a lado e o documento a corrigir.',
    sample: {
      caption: 'Exemplo de projeto · dados fictícios',
      rows: [
        { label: 'Lado M-01 → M-02', value: '440,55 m nos dois', tone: 'ok' },
        { label: 'Lado M-02 → M-03', value: '441,37 m × 441,77 m', tone: 'warn' },
        { label: 'Datum e projeção', value: 'SIRGAS 2000 · UTM 23S', tone: 'ok' },
      ],
    },
  },
  {
    id: 'vizinhos',
    name: 'Confrontantes (vizinhos)',
    problem: 'Nome do vizinho escrito diferente em cada documento, ou anuência faltando, trava a retificação.',
    how: 'Compara o nome de cada vizinho em até 7 fontes: desenho e quadro da planta, texto e tabela do memorial, matrícula do imóvel, matrícula do vizinho e assinatura da anuência. Ignora pontuação e aponta sobrenome a mais, acento diferente e assinatura que falta.',
    delivers: 'O que corrigir em cada divisa e o texto do pedido de certidões dos vizinhos ao Registro de Imóveis.',
    sample: {
      caption: 'Exemplo de projeto · dados fictícios',
      rows: [
        { label: 'Oeste · Carlos e Ana Oeste', value: 'Anuência dos dois', tone: 'ok' },
        { label: 'Leste · Joaquim e Maria Leste', value: 'Só Joaquim assinou', tone: 'warn' },
        { label: 'Norte · Espólio de Antônio Norte', value: 'Sem anuência', tone: 'warn' },
      ],
    },
  },
  {
    id: 'checklist',
    name: 'Checklist do procedimento',
    problem: 'Um requisito esquecido (requerimento, anuência do credor, aprovação municipal) vira nota devolutiva.',
    how: 'Cada procedimento tem seu checklist de requisitos, de 11 a 29 itens. A IA responde cada item com a evidência encontrada: conforme, divergente, pendente, não aplicável ou não verificável.',
    delivers: 'O que já está atendido, o que falta e o que fazer, item por item.',
    sample: {
      caption: 'Itens do checklist de desdobro · ilustrativo',
      rows: [
        { label: 'ART e comprovante de pagamento', value: 'Conforme', tone: 'ok' },
        { label: 'Conferência do memorial e da planta', value: 'Divergente', tone: 'bad' },
        { label: 'Aprovação municipal', value: 'Pendente', tone: 'warn' },
      ],
    },
  },
  {
    id: 'resultado',
    name: 'Resultado e relatório',
    problem: 'Os apontamentos precisam virar uma lista de correções que o responsável técnico consiga seguir.',
    how: 'Veredito em linguagem simples, o que precisa de atenção com o que fazer em cada item, documentos que faltam e próximos passos. Para ir além: relatório em Word, perguntas à IA e os Detalhes, com passo a passo e 10 abas técnicas.',
    delivers: 'Uma lista de correções antes do protocolo, para o responsável técnico revisar.',
    sample: {
      caption: 'Exemplo de projeto · dados fictícios',
      rows: [
        { label: 'Veredito', value: 'Há diferenças para corrigir', tone: 'bad' },
        { label: 'Memorial, lado M-02 → M-03', value: 'Corrigir 0,40 m', tone: 'warn' },
        { label: 'Relatório', value: 'Word (.docx)' },
      ],
    },
  },
];

// Cada verificação diz quem a faz: a IA (leitura), o cálculo do sistema ou uma regra fixa do sistema
export type Method = 'ia' | 'calculo' | 'regra';
export const METHOD_LABELS: Record<Method, string> = {
  ia: 'Leitura por IA',
  calculo: 'Cálculo do sistema',
  regra: 'Regra do sistema',
};

export const VERIFICATION_GROUPS: { title: string; module: ModuleId; items: { text: string; method: Method }[] }[] = [
  {
    title: 'Quem é dono',
    module: 'matricula',
    items: [
      { text: 'Proprietários atuais, fração, estado civil e regime de bens', method: 'ia' },
      { text: 'Cadeia dominial: a sequência de transmissões', method: 'ia' },
      { text: 'Aviso quando o proprietário ou o número da matrícula não é encontrado', method: 'regra' },
    ],
  },
  {
    title: 'Dívidas e restrições',
    module: 'matricula',
    items: [
      { text: 'Hipotecas, alienações fiduciárias, cédulas, penhoras, indisponibilidades, usufrutos e servidões', method: 'ia' },
      { text: 'Cancelado só com o ato de cancelamento identificado', method: 'regra' },
      { text: 'Nota mínima de 75 com penhora, indisponibilidade ou embargo ativo; 50 com garantia ativa', method: 'regra' },
    ],
  },
  {
    title: 'Fidelidade ao documento',
    module: 'matricula',
    items: [
      { text: 'CPFs, CNPJs e números de atos procurados no texto lido do PDF', method: 'regra' },
      { text: 'Trecho de cada risco marcado como localizado ou não', method: 'regra' },
      { text: 'Aviso de documento longo demais e de arquivo que não parece uma matrícula', method: 'regra' },
    ],
  },
  {
    title: 'Medidas e geometria',
    module: 'projeto',
    items: [
      { text: 'Área (fórmula de Gauss) e perímetro calculados pelas coordenadas', method: 'calculo' },
      { text: 'Distância e azimute de cada lado, comparados com a planta e o memorial', method: 'calculo' },
      { text: 'Poligonal que se cruza, lado de distância nula e conversão para UTM', method: 'calculo' },
    ],
  },
  {
    title: 'Planta × memorial',
    module: 'projeto',
    items: [
      { text: '16 campos comparados entre os dois documentos', method: 'regra' },
      { text: 'Valores lidos pela IA que não aparecem nos documentos são sinalizados', method: 'regra' },
      { text: 'Dados do imóvel, do responsável técnico e da ART extraídos', method: 'ia' },
    ],
  },
  {
    title: 'Vizinhos e requisitos',
    module: 'projeto',
    items: [
      { text: 'Nome de cada vizinho comparado em até 7 fontes', method: 'regra' },
      { text: 'Checklist do procedimento respondido com a evidência encontrada', method: 'ia' },
      { text: 'Documentos que faltam e parecer que nunca é "compatível" com divergência aberta', method: 'regra' },
    ],
  },
];

export const BEFORE_AFTER = {
  before: [
    'Ler a certidão página por página atrás de cada R- e AV-',
    'Conferir à mão cada lado da planta contra o memorial',
    'Recalcular área e perímetro numa planilha à parte',
    'Procurar o nome de cada vizinho em vários documentos',
    'Montar a lista de pendências num arquivo separado',
  ],
  after: [
    'Atos separados por tipo, com status e o trecho de origem',
    'Cada lado comparado, com as diferenças destacadas',
    'Área e perímetro calculados pelas coordenadas',
    'Nomes comparados em até 7 fontes, com a diferença explicada',
    'Lista do que corrigir, com o documento e o que fazer',
  ],
};

export interface Audience {
  id: string;
  label: string;
  problem: string;
  help: string;
  features: string[];
  example: { label: string; to: string };
}

export const AUDIENCES: Audience[] = [
  {
    id: 'corretores',
    label: 'Corretores e imobiliárias',
    problem: 'Descobrir na véspera da escritura que falta a assinatura de um cônjuge ou que existe uma penhora.',
    help: 'Leia a matrícula já na captação: donos, regime de bens e ônus ativos em minutos, com um resumo pronto para enviar ao cliente.',
    features: ['Donos atuais e histórico', 'Dívidas, penhoras e restrições', 'Resumo para WhatsApp'],
    example: { label: 'Ver uma matrícula regular', to: '/app?sample=safe' },
  },
  {
    id: 'advogados',
    label: 'Advogados imobiliários',
    problem: 'A due diligence começa com horas de leitura de certidões antes de qualquer análise jurídica.',
    help: 'Cadeia dominial, ônus com o ato de cancelamento e o trecho de origem já organizados. O assistente responde perguntas pontuais citando os atos.',
    features: ['Nota de risco com o trecho de origem', 'Assistente para perguntas', 'Relatório em PDF'],
    example: { label: 'Ver uma matrícula com risco', to: '/app?sample=risk' },
  },
  {
    id: 'investidores',
    label: 'Compradores e investidores',
    problem: 'Avaliar vários imóveis, inclusive de leilão, sem tempo para ler cada matrícula com atenção.',
    help: 'Penhoras, hipotecas e indisponibilidades de cada matrícula, com uma nota de risco para priorizar o que merece análise mais funda.',
    features: ['Dívidas, penhoras e restrições', 'Nota de risco', 'Explicação para quem não é da área'],
    example: { label: 'Ver uma matrícula com risco', to: '/app?sample=risk' },
  },
  {
    id: 'engenheiros',
    label: 'Engenheiros, agrimensores e topógrafos',
    problem: 'Uma diferença de centímetros entre planta e memorial, ou um perímetro somado errado, volta como exigência.',
    help: 'Área e perímetro recalculados pelas coordenadas, cada lado comparado entre planta e memorial e os vizinhos conferidos antes do protocolo.',
    features: ['Área e perímetro pelas coordenadas', 'Planta × memorial', 'Confrontantes'],
    example: { label: 'Ver o projeto de exemplo', to: '/app?sample=desdobro' },
  },
  {
    id: 'regularizacao',
    label: 'Regularização e despachantes',
    problem: 'Cada procedimento tem a sua lista de requisitos e documentos, e um item esquecido atrasa o processo.',
    help: 'Checklists de desdobro, retificação, unificação, estremação, divisão e REURB, com o que falta e o que fazer em cada item.',
    features: ['Checklist do procedimento', 'Documentos que faltam', 'Relatório em Word'],
    example: { label: 'Ver o projeto de exemplo', to: '/app?sample=desdobro' },
  },
  {
    id: 'credito',
    label: 'Crédito e correspondentes',
    problem: 'Descobrir no meio do financiamento que o imóvel já está dado em garantia.',
    help: 'Alienação fiduciária, hipoteca e cédulas ativas logo de início, com uma explicação escrita para o perfil de banco.',
    features: ['Dívidas, penhoras e restrições', 'Explicação para o banco', 'Relatório em PDF'],
    example: { label: 'Ver uma matrícula com risco', to: '/app?sample=risk' },
  },
];

const fairUse = `até ${offer.fairUseDailyLimit} análises de matrícula por dia`;

export const PRICE_FACTS: { title: string; text: string }[] = [
  { title: 'Pagamento', text: `Único, por ${offer.paymentMethods}. Sem renovação automática.` },
  { title: 'Acesso', text: `${offer.period} a partir da confirmação do pagamento. Renovar antes do fim soma os dias que restam.` },
  { title: 'Uso', text: `Uso justo: ${fairUse}. A leitura de projetos e o assistente também têm limite diário.` },
  { title: 'Desistência', text: `${offer.guaranteeDays} dias para desistir, com reembolso integral (art. 49 do CDC).` },
];

export const PLAN_INCLUDES = [
  'Análise de matrícula com nota de risco',
  'Conferência de projetos nos 6 procedimentos',
  'Área e perímetro pelas coordenadas',
  'Planta × memorial e confrontantes',
  'Assistente para perguntas',
  'Relatórios em PDF (matrícula) e Word (projetos)',
  'Suporte pelo WhatsApp e por e-mail',
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'O que é o ValidaImóvel?',
    a: 'Uma plataforma web com dois módulos: análise de matrícula de imóvel e conferência de projetos para o Registro de Imóveis. A IA lê os documentos; o sistema confere, calcula e cruza as informações; você recebe um relatório com o que está certo, o que diverge e o que conferir.',
  },
  {
    q: 'Para quem ele foi feito?',
    a: 'Para quem lida com documentação de imóveis no trabalho: corretores, advogados imobiliários, compradores e investidores, engenheiros, agrimensores, topógrafos, profissionais de regularização e de crédito imobiliário.',
  },
  {
    q: 'Quais documentos posso enviar?',
    a: 'Na análise de matrícula, a certidão em PDF, digital ou escaneada, de até 15 MB. Na conferência de projetos, até 12 arquivos por vez em PDF, PNG, JPG, TXT, CSV, KML ou DXF, de até 15 MB cada. DWG, KMZ, XLSX e DOCX não são lidos diretamente: exporte para PDF ou, no caso de coordenadas, para CSV, TXT ou KML.',
  },
  {
    q: 'Como a inteligência artificial é usada?',
    a: 'A IA do Google (API Gemini) transcreve e interpreta os documentos. As conferências são feitas pelo próprio sistema, com regras e cálculos que não dependem da IA: CPFs e atos procurados no texto, cancelamento só com o ato, nota mínima por ônus ativo, área e perímetro pelas coordenadas, comparação de medidas e de nomes.',
  },
  {
    q: 'Que tipo de inconsistência ele encontra?',
    a: 'Na matrícula: ônus ativos, cancelamentos sem o ato correspondente, dados que a leitura não encontrou no texto e pontos para conferir. No projeto: diferenças entre planta e memorial, área ou perímetro que não batem com as coordenadas, nomes de vizinhos escritos de forma diferente, anuências faltando, requisitos do procedimento não atendidos e documentos que faltam.',
  },
  {
    q: 'O resultado substitui a revisão técnica ou jurídica?',
    a: 'Não. O ValidaImóvel organiza e aponta o que encontrou, sempre com a origem, para apoiar o seu trabalho. A validação do responsável técnico, a orientação de um advogado e a qualificação do Oficial de Registro continuam necessárias. Para escritura, use uma certidão de matrícula atualizada.',
  },
  {
    q: 'Quanto custa e por quanto tempo tenho acesso?',
    a: `${offer.priceFormatted} por ${offer.period} de acesso aos dois módulos, com pagamento único por ${offer.paymentMethods}, sem renovação automática. Se renovar antes do fim, os dias que restam são somados ao novo período.`,
  },
  {
    q: 'Existe limite de uso?',
    a: `Sim, um limite de uso justo: ${fairUse}. A leitura de documentos na conferência de projetos e as perguntas ao assistente também têm limite diário. Os limites renovam à meia-noite (horário de Brasília).`,
  },
  {
    q: 'Como acesso depois de pagar?',
    a: `O acesso é liberado automaticamente quando o pagamento é confirmado. Entre ${LOGIN_OPTIONS} e envie o primeiro documento.`,
  },
  {
    q: 'Posso ver como funciona antes de pagar?',
    a: `Sim. Os exemplos prontos (duas matrículas e um projeto, com dados fictícios) abrem sem cadastro. Depois de assinar, você tem ${offer.guaranteeDays} dias para desistir com reembolso integral.`,
  },
  {
    q: 'Como meus documentos são tratados?',
    a: 'Os arquivos são enviados por conexão segura (HTTPS) e lidos pela IA do Google (API Gemini). O ValidaImóvel não guarda o arquivo nem o relatório: a análise fica só na sua tela e o projeto só na aba aberta. Para guardar, exporte o relatório. Os detalhes estão na Política de Privacidade.',
  },
  {
    q: 'Quanto tempo leva uma análise?',
    a: 'Em geral de 1 a 4 minutos por matrícula. Na conferência de projetos, alguns minutos, conforme o número e o tamanho dos documentos. Os cálculos aparecem assim que a leitura termina.',
  },
];
