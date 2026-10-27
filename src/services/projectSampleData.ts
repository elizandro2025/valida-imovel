/**
 * Projeto de exemplo da conferência de projetos, com DADOS FICTÍCIOS (isSample: true).
 *
 * Caso didático: retificação de área e desmembramento de gleba rural em Piracicaba/SP. As pessoas, CPFs, registros e
 * documentos não existem; a tela e os relatórios exportados avisam isso. Os números são coerentes entre si: área,
 * perímetro e lados foram calculados a partir das coordenadas abaixo (UTM SIRGAS 2000, fuso 23S), e as diferenças do
 * exemplo são as que o caso quer mostrar (40 cm a mais no memorial no lado M-02 → M-03 e anuência pendente).
 */

import { ProjectData } from './projectConferenceService';

// Calculados pelas coordenadas de polygon.rawCoords (fórmula do laço e distância entre vértices)
const AREA_M2 = '389.313,03';
const AREA_HA = '38,9313';
const PERIMETRO = '2.349,58';

export const SAMPLE_PROJECT_DATA: ProjectData = {
  isSample: true,
  info: {
    nome: 'Exemplo — Retificação de área e desmembramento de gleba rural (Sítio Bela Vista)',
    cliente: 'Pedro Exemplo Fictício e Paula Exemplo Fictícia',
    matricula: '48.910',
    cartorio: 'Registro de Imóveis de Piracicaba - SP (exemplo)',
    municipio: 'Piracicaba',
    comarca: 'Piracicaba',
    uf: 'SP',
    natureza: 'rural',
    rt: 'Responsável técnico fictício',
    prof: 'Engenheiro agrimensor (exemplo)',
    reg: 'CREA-SP 0000000000 (exemplo)',
    art: 'ART 0000000000 (exemplo)',
    conferente: 'Exemplo ValidaImóvel',
    data: new Date().toISOString().slice(0, 10),
    procedimentos: ['retificacao', 'desdobro'],
    modoMax: true,
  },
  docs: [
    {
      id: 'doc-1',
      nome: 'Planta topográfica georreferenciada (escala 1:2.500)',
      tipo: 'Planta Topográfica',
      status: 'Recebido',
      paginas: 'Prancha 01/01',
      obs: 'Vértices M-01 a M-06, assinada pelo responsável técnico.',
    },
    {
      id: 'doc-2',
      nome: 'Memorial descritivo georreferenciado',
      tipo: 'Memorial Perimétrico',
      status: 'Recebido',
      paginas: 'Fls. 1–4',
      obs: 'Quadro de coordenadas UTM SIRGAS 2000, fuso 23S, MC 45°W, e descrição das confrontações.',
    },
    {
      id: 'doc-3',
      nome: 'Certidão de inteiro teor da matrícula nº 48.910',
      tipo: 'Matrícula Principal (Objeto)',
      status: 'Recebido',
      paginas: 'Fls. 1–3',
      obs: 'Certidão recente do Registro de Imóveis.',
    },
    {
      id: 'doc-4',
      nome: 'Certidões das matrículas dos confrontantes (42.180 e 41.950)',
      tipo: 'Matrículas dos Confrontantes',
      status: 'Incompleto',
      paginas: 'Matrs. 42.180 e 41.950',
      obs: 'Falta a certidão atualizada da matrícula 38.912 (confrontante dos fundos, espólio).',
    },
    {
      id: 'doc-5',
      nome: 'Anotação de Responsabilidade Técnica (ART) quitada',
      tipo: 'Anotação de Resp. Técnica (ART/RRT)',
      status: 'Recebido',
      paginas: 'ART 0000000000 (exemplo)',
      obs: 'Quitada.',
    },
    {
      id: 'doc-6',
      nome: 'Certificado de Cadastro de Imóvel Rural (CCIR) do exercício vigente',
      tipo: 'CCIR (INCRA)',
      status: 'Recebido',
      paginas: 'Código 000.000.000.000-0 (exemplo)',
      obs: 'Taxa quitada.',
    },
    {
      id: 'doc-7',
      nome: 'Recibo de inscrição no Cadastro Ambiental Rural (CAR)',
      tipo: 'CAR (Cadastro Ambiental Rural)',
      status: 'Recebido',
      paginas: 'Registro SP-0000000 (exemplo)',
      obs: 'APP de 4,20 ha e Reserva Legal de 20% (7,79 ha).',
    },
  ],
  pm: {
    area: { planta: `${AREA_HA} ha (${AREA_M2} m²)`, memorial: `${AREA_HA} ha (${AREA_M2} m²)` },
    // O memorial soma os 40 cm a mais do lado M-02 → M-03
    perim: { planta: `${PERIMETRO} m`, memorial: '2.349,98 m' },
    nvert: { planta: '6', memorial: '6' },
    vini: { planta: 'M-01', memorial: 'M-01' },
    seq: { planta: 'M-01 - M-02 - M-03 - M-04 - M-05 - M-06', memorial: 'M-01 - M-02 - M-03 - M-04 - M-05 - M-06' },
    sist: { planta: 'SIRGAS 2000', memorial: 'SIRGAS 2000' },
    proj: { planta: 'UTM Fuso 23S (MC 45°W)', memorial: 'UTM Fuso 23S (MC 45°W)' },
    matr: { planta: '48.910', memorial: '48.910' },
    cns: { planta: 'Registro de Imóveis de Piracicaba/SP', memorial: 'Registro de Imóveis de Piracicaba/SP' },
    prop: { planta: 'Pedro Exemplo Fictício e Paula Exemplo Fictícia', memorial: 'Pedro Exemplo Fictício e Paula Exemplo Fictícia' },
    cpfp: { planta: '000.000.001-91 e 000.000.002-72', memorial: '000.000.001-91 e 000.000.002-72' },
    local: { planta: 'Estrada Municipal PIR-040, km 8', memorial: 'Estrada Municipal PIR-040, km 8' },
    bairro: { planta: 'Zona rural', memorial: 'Zona rural' },
    mun: { planta: 'Piracicaba', memorial: 'Piracicaba' },
    comarca: { planta: 'Piracicaba', memorial: 'Piracicaba' },
    ident: { planta: 'Sítio Bela Vista — Gleba A e Gleba B', memorial: 'Sítio Bela Vista — Gleba A e Gleba B' },
  },
  // Cada coluna traz o NOME do confrontante como aparece naquela fonte (é o que o comparador de nomes confere):
  // planta, memorial (texto e tabela), titular na matrícula e quem assinou a anuência.
  neighbors: [
    {
      id: 'viz-1',
      trecho: 'Frente (Sul)',
      vertices: 'M-01–M-02',
      lado: 'Frente / Alinhamento',
      tipo: 'via',
      planta: 'Estrada Municipal PIR-040',
      memTexto: 'Estrada Municipal PIR-040',
      memTabela: 'Estrada Municipal PIR-040',
      matConf: 'Estrada Municipal PIR-040',
      matNum: 'Via pública',
      doc: 'N/A (domínio público)',
      assin: 'Estrada Municipal PIR-040',
      obs: 'Via pública municipal: a anuência segue as normas locais para o Município.',
    },
    {
      id: 'viz-2',
      trecho: 'Lateral Direita (Leste)',
      vertices: 'M-02–M-03',
      lado: 'Leste / Direita',
      tipo: 'imovel',
      planta: 'Joaquim Leste Fictício e Maria Leste Fictícia',
      memTexto: 'Joaquim Leste Fictício e Maria Leste Fictícia',
      memTabela: 'Joaquim Leste Fictício e Maria Leste Fictícia',
      matConf: 'Joaquim Leste Fictício e Maria Leste Fictícia',
      matNum: '42.180',
      doc: '000.000.003-53',
      // Só o titular assinou: falta a anuência do cônjuge (pendência que o exemplo quer mostrar)
      assin: 'Joaquim Leste Fictício',
      obs: 'Só o titular assinou a planta; falta a anuência do cônjuge.',
    },
    {
      id: 'viz-3',
      trecho: 'Fundos (Norte)',
      vertices: 'M-03–M-05',
      lado: 'Norte / Fundos',
      tipo: 'imovel',
      planta: 'Espólio de Antônio Norte Fictício',
      memTexto: 'Espólio de Antônio Norte Fictício',
      memTabela: 'Espólio de Antônio Norte Fictício',
      matConf: 'Espólio de Antônio Norte Fictício',
      matNum: '38.912',
      doc: 'Pendente: termo de compromisso do inventariante',
      assin: '',
      obs: 'Sem a anuência do espólio, pedir a notificação do confrontante pelo Oficial (art. 213 da Lei 6.015/73).',
    },
    {
      id: 'viz-4',
      trecho: 'Lateral Esquerda (Oeste)',
      vertices: 'M-05–M-06–M-01',
      lado: 'Oeste / Esquerda',
      tipo: 'imovel',
      planta: 'Carlos Oeste Fictício e Ana Oeste Fictícia',
      memTexto: 'Carlos Oeste Fictício e Ana Oeste Fictícia',
      memTabela: 'Carlos Oeste Fictício e Ana Oeste Fictícia',
      matConf: 'Carlos Oeste Fictício e Ana Oeste Fictícia',
      matNum: '41.950',
      doc: '000.000.004-34',
      assin: 'Carlos Oeste Fictício e Ana Oeste Fictícia',
      obs: 'Anuência dos dois cônjuges, com firma reconhecida.',
    },
  ],
  polygon: {
    rawCoords: `M-01;225410,150;7481200,320
M-02;225850,590;7481190,650
M-03;226120,210;7481540,100
M-04;225980,400;7481820,900
M-05;225520,120;7481840,400
M-06;225340,800;7481510,110`,
    // Coordenadas planas (UTM, em metros), não latitude/longitude
    isGeo: false,
    order: 'EN',
    areaPlanta: '389313,03',
    areaMemorial: '389313,03',
    perimPlanta: '2349,58',
    perimMemorial: '2349,98',
    tolDist: '0,10',
    tolArea: '5,00',
    tolAz: '0,05',
    // Chaves no formato do motor de geodésia (`${de}>${para}`). O memorial traz 40 cm a mais em M-02 → M-03.
    declaredSegments: {
      'M-01>M-02': { distPlanta: 440.55, distMemorial: 440.55 },
      'M-02>M-03': { distPlanta: 441.37, distMemorial: 441.77 },
      'M-03>M-04': { distPlanta: 313.68, distMemorial: 313.68 },
      'M-04>M-05': { distPlanta: 460.69, distMemorial: 460.69 },
      'M-05>M-06': { distPlanta: 375.83, distMemorial: 375.83 },
      'M-06>M-01': { distPlanta: 317.46, distMemorial: 317.46 },
    },
  },
  checklists: {
    desdobro: {
      'des-01': {
        status: 'CONFORME',
        evidence: 'Certidão de confrontação com a Estrada Municipal PIR-040 emitida pela Prefeitura (exemplo).',
        correction: '',
      },
      'des-02': {
        status: 'CONFORME',
        evidence: 'Gleba A com 22,93 ha e Gleba B com 16,00 ha (total de 38,93 ha), ambas acima da fração mínima de parcelamento informada no CCIR.',
        correction: '',
      },
      'des-03': {
        status: 'CONFORME',
        evidence: 'Requerimento de desmembramento assinado pelos proprietários, com firmas reconhecidas.',
        correction: '',
      },
      'des-04': {
        status: 'CONFORME',
        evidence: 'CCIR e CAR atualizados anexados.',
        correction: '',
      },
    },
    retificacao: {
      'ret-01': {
        status: 'CONFORME',
        evidence: 'A matrícula descrevia "aproximadamente 16 alqueires paulistas (38,72 ha)"; o levantamento apurou 38,9313 ha.',
        correction: '',
      },
      'ret-02': {
        status: 'DIVERGENTE',
        evidence: 'Falta a anuência do cônjuge do confrontante leste (matrícula 42.180).',
        correction: 'Colher a anuência do cônjuge com firma reconhecida ou pedir a notificação pelo Registro de Imóveis (art. 213 da Lei 6.015/73).',
      },
      'ret-03': {
        status: 'PENDENTE',
        evidence: 'Falta a certidão atualizada da matrícula 38.912 (confrontante dos fundos).',
        correction: 'Pedir a certidão de inteiro teor atualizada no Registro de Imóveis.',
      },
    },
  },
  amarracoes: [
    {
      id: 'am-1',
      seg: 'M-01–M-02',
      mat: 'Estrada PIR-040',
      descObj: 'Frente com a Estrada Municipal PIR-040 por 440,55 m',
      descConf: 'Estrada municipal oficial',
      comp: 'Compatível com o cadastro municipal de estradas (exemplo)',
      status: 'CONFORME',
      prioridade: 'Baixa',
      providencia: 'Nenhuma.',
      critico: false,
    },
    {
      id: 'am-2',
      seg: 'M-02–M-03',
      mat: '42.180',
      descObj: 'Extensão de 441,37 m confrontando com a Fazenda Morro Vermelho',
      descConf: 'A matrícula do confrontante descreve a divisa com 441,40 m',
      comp: 'Diferença de 0,03 m, dentro da tolerância de 0,10 m adotada no exemplo',
      status: 'CONFORME',
      prioridade: 'Baixa',
      providencia: 'Nenhuma.',
      critico: false,
    },
    {
      id: 'am-3',
      seg: 'M-03–M-05',
      mat: '38.912',
      descObj: 'Fundos confrontando com o Córrego das Pedras e a Fazenda Santa Helena',
      descConf: 'Certidão da matrícula 38.912 ainda não apresentada',
      comp: 'Sem a certidão não é possível conferir a descrição da divisa pelo córrego',
      status: 'PENDENTE',
      prioridade: 'Alta',
      providencia: 'Pedir a certidão de inteiro teor no Registro de Imóveis.',
      critico: true,
    },
  ],
  // Chaves de ANALISES_SECTIONS (projectConferenceService)
  analises: {
    a3: `Planta e memorial coincidem na área (${AREA_HA} ha) e nos vértices. O perímetro difere em 0,40 m porque o memorial descreve o lado M-02 → M-03 com 441,77 m, enquanto a planta e as coordenadas dão 441,37 m. A diferença deve ser corrigida no memorial antes do protocolo.`,
    a9: 'A testada com a Estrada PIR-040 e a divisa oeste (Sítio São Pedro) estão regulares. Na divisa leste (matrícula 42.180) falta a anuência do cônjuge do confrontante. Para os fundos (matrícula 38.912), sem a anuência do espólio, cabe pedir a notificação pelo Oficial do Registro de Imóveis.',
    a12: `As coordenadas UTM SIRGAS 2000 (fuso 23S) dos 6 vértices resultam em ${AREA_HA} ha (${AREA_M2} m²) e ${PERIMETRO} m de perímetro, os mesmos valores declarados na planta.`,
    aH: 'A documentação pode seguir para o Registro de Imóveis depois de duas providências: corrigir o lado M-02 → M-03 no memorial (441,37 m) e juntar a anuência do cônjuge do confrontante leste.',
  },
  // Sem apontamentos manuais: a diferença de 40 cm e a anuência faltante são detectadas pelo próprio sistema
  manualIssues: [],
  // Resultado ilustrativo: não foi gerado por IA (a aba de leitura com IA avisa isso quando isSample = true)
  ai: {
    ranAt: new Date().toISOString(),
    files: [
      { name: 'Exemplo_Planta_Sitio_Bela_Vista.pdf', tipo: 'Planta', chars: 5120, legivel: true },
      { name: 'Exemplo_Memorial_Descritivo.pdf', tipo: 'Memorial', chars: 6890, legivel: true },
      { name: 'Exemplo_Certidao_Matricula_48910.pdf', tipo: 'Matrícula Principal', chars: 8420, legivel: true },
      { name: 'Exemplo_ART.pdf', tipo: 'Responsabilidade Técnica', chars: 2100, legivel: true },
      { name: 'Exemplo_CCIR.pdf', tipo: 'Cadastro Rural', chars: 1840, legivel: true },
    ],
    resumo: `Exemplo com dados fictícios. Poligonal de 6 vértices em UTM SIRGAS 2000 (fuso 23S) com ${AREA_HA} ha; planta e memorial diferem em 0,40 m no lado M-02 → M-03, e falta a anuência do cônjuge do confrontante leste.`,
    model: null,
    notas: [
      `Área e perímetro calculados pelas coordenadas: ${AREA_HA} ha e ${PERIMETRO} m.`,
      'O desmembramento gera a Gleba A (22,93 ha) e a Gleba B (16,00 ha).',
      'Retificação (art. 213 da Lei 6.015/73): pronta para protocolo depois de corrigir os 40 cm e juntar a anuência.',
    ],
  },
  parecer: {
    final: 'DOCUMENTAÇÃO COM DIVERGÊNCIAS',
    resumo: 'Exemplo com dados fictícios. Os cálculos da poligonal conferem com a planta. Há uma divergência de 0,40 m no lado M-02 → M-03 entre planta e memorial e uma pendência de anuência do cônjuge do confrontante da matrícula 42.180; as duas devem ser resolvidas antes do protocolo no Registro de Imóveis.',
    exigenciaCartorio: true,
    validacaoRT: true,
    validacaoJuridica: false,
    depSoftware: 'Conferência de sobreposição com os confrontantes em software de geoprocessamento (QGIS/SIGEF).',
    depJuridica: 'Notificação do confrontante dos fundos, se não houver anuência (art. 213 da Lei 6.015/73).',
    depDocumento: 'Memorial corrigido (441,37 m) e anuência do cônjuge do confrontante leste.',
  },
};
