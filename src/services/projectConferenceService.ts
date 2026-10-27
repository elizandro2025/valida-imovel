/**
 * Serviço de Gerenciamento da Conferência de Projetos — ValidaImóvel
 * 
 * Gerencia o estado do projeto, consolidação de inconsistências,
 * cálculo automático de parecer (DOCUMENTAÇÃO COMPATÍVEL / COM DIVERGÊNCIAS / INCOMPLETA),
 * exportação para Word (.doc) e geração do relatório técnico completo.
 */

import { geodesyService, Vertex } from './geodesyService';
import { NeighborRow, nominalDiffService } from './nominalDiffService';
import { PROCEDURE_CHECKLISTS, ChecklistAnswer } from './projectChecklists';

export interface ProjectInfo {
  nome: string;
  cliente: string;
  matricula: string;
  cartorio: string;
  municipio: string;
  comarca: string;
  uf: string;
  natureza: 'urbano' | 'rural' | '';
  rt: string;
  prof: string;
  reg: string;
  art: string;
  conferente: string;
  data: string;
  procedimentos: string[];
  modoMax: boolean;
}

export interface ProjectDocItem {
  id: string;
  nome: string;
  tipo: string;
  status: 'Recebido' | 'Ausente' | 'Ilegível' | 'Incompleto';
  paginas: string;
  obs: string;
}

export interface PlantaMemorialField {
  key: string;
  label: string;
  isNumeric?: boolean;
}

export const PM_COMPARE_FIELDS: PlantaMemorialField[] = [
  { key: 'area', label: 'Área Superficial Apurada (m²)', isNumeric: true },
  { key: 'perim', label: 'Extensão Perimétrica Total (m)', isNumeric: true },
  { key: 'nvert', label: 'Total de Vértices Limítrofes', isNumeric: true },
  { key: 'vini', label: 'Vértice de Partida / Amarração Inicial (V01)', isNumeric: false },
  { key: 'seq', label: 'Sequenciamento e Sentido Perimétrico', isNumeric: false },
  { key: 'sist', label: 'Sistema Geodésico de Referência (Datum)', isNumeric: false },
  { key: 'proj', label: 'Parâmetros Cartográficos (Projeção / Fuso / MC)', isNumeric: false },
  { key: 'matr', label: 'Matrícula Imobiliária / Fólio Real', isNumeric: false },
  { key: 'cns', label: 'Serventia Registral Notarial (CNS)', isNumeric: false },
  { key: 'prop', label: 'Titularidade Dominial / Requerente(s)', isNumeric: false },
  { key: 'cpfp', label: 'Cadastro de Pessoa Física / Jurídica (CPF/CNPJ)', isNumeric: false },
  { key: 'local', label: 'Endereçamento Predial / Logradouro Oficial', isNumeric: false },
  { key: 'bairro', label: 'Bairro / Circunscrição Urbana', isNumeric: false },
  { key: 'mun', label: 'Município de Situação', isNumeric: false },
  { key: 'comarca', label: 'Comarca Jurisdicional Competente', isNumeric: false },
  { key: 'ident', label: 'Identificação Cadastral (Lote, Quadra, Gleba)', isNumeric: false },
];

/** Seções das análises descritivas (texto livre, entram no relatório) */
export const ANALISES_SECTIONS: { key: string; label: string; hint: string }[] = [
  { key: 'a3', label: 'Confronto Técnico: Planta Topográfica versus Memorial Descritivo', hint: 'Análise de coerência entre área, perímetro, vértices, sequência, coordenadas, azimutes, distâncias, segmentos e confrontações.' },
  { key: 'a4', label: 'Conferência Gráfica da Planta (Legendas, Escalas e Selo Técnico)', hint: 'Representação cartográfica × nomes nas divisas × quadro de confrontantes × quadro de áreas × legenda × tabela de vértices × selo técnico e ART/RRT.' },
  { key: 'a5', label: 'Conferência Descritiva do Memorial (Qualificação e Perímetro)', hint: 'Cabeçalho, qualificação do imóvel e proprietário, descrição perimétrica, encerramento de vértices, tabelas e declarações de anuência.' },
  { key: 'a8', label: 'Qualificação Registral e Titularidade do Imóvel Objeto', hint: 'Nomes completos, CPF, estado civil, cônjuge, regime de bens, coproprietários, titular atual versus anterior, espólio e procurações.' },
  { key: 'a9', label: 'Titularidade e Qualificação dos Confrontantes Tabulares', hint: 'Nomes, CPFs, matrículas e assinaturas de cada confrontante; titularidade atual comprovada por certidão; coproprietários e sucessores.' },
  { key: 'a10', label: 'Compatibilidade Registral e Descrição Tabular das Áreas', hint: 'Compatibilidade entre matrícula principal e imóvel descrito (localização, área, lote/quadra/gleba, origem registral); reciprocidade das confrontações.' },
  { key: 'aD', label: 'Análise Dominial da Matrícula Objeto — Cadeia e Especialidade', hint: 'Transcrições de origem, área titulada, averbações, destaques, remanescentes, retificações, desmembramentos, unificações, títulos aquisitivos, gravames e ônus.' },
  { key: 'a11', label: 'Documentos Pessoais, Contratos e Procurações', hint: 'Validade formal, legibilidade, reconhecimento de firma, poderes específicos e prazo de procurações, representação societária de PJ.' },
  { key: 'a12', label: 'Georreferenciamento, Datum e Sobreposição Espacial', hint: 'Sistema geodésico de referência (SIRGAS 2000), datum, projeção UTM, fuso, precisão métrica de fechamento e dependência de software GIS.' },
  { key: 'a13', label: 'Exigências Específicas do Procedimento Registral', hint: 'Conformidade com os ritos de Estremação (Provimento CNJ nº 149/2023 / NSCGJ-SP), Retificação de Área (art. 213 LRP), Desdobro (Lei 6.766/79) ou REURB (Lei 13.465/17).' },
  { key: 'aH', label: 'Conclusão Pericial e Recomendações Notariais', hint: 'Parecer conclusivo indicando aptidão para ingresso registral ou suspensão preventiva para saneamento de inconsistências.' },
];

export interface ConsolidatedIssue {
  id?: string;
  origem: string;
  tipo: 'div' | 'pend' | 'prov';
  categoria: string;
  docACorrigir: string;
  local: string;
  pagina?: string;
  erro: string;
  risco?: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  providencia: string;
}

export interface ProjectData {
  info: ProjectInfo;
  docs: ProjectDocItem[];
  pm: Record<string, { planta?: string; memorial?: string }>;
  neighbors: NeighborRow[];
  polygon: {
    rawCoords: string;
    isGeo: boolean;
    order: 'EN' | 'NE';
    areaPlanta: string;
    areaMemorial: string;
    perimPlanta: string;
    perimMemorial: string;
    tolDist: string;
    tolArea: string;
    tolAz: string;
    declaredSegments: Record<
      string,
      { distPlanta?: number; distMemorial?: number; azPlanta?: string; azMemorial?: string }
    >;
  };
  checklists: Record<string, Record<string, ChecklistAnswer>>;
  amarracoes: {
    id: string;
    seg: string;
    mat: string;
    descObj: string;
    descConf: string;
    comp: string;
    status: string;
    prioridade: 'Alta' | 'Média' | 'Baixa';
    providencia: string;
    critico?: boolean;
  }[];
  /** Análises descritivas (texto livre por seção) que entram no relatório */
  analises: Record<string, string>;
  manualIssues: {
    id: string;
    tipo: 'div' | 'pend' | 'prov';
    cat: string;
    docACorrigir?: string;
    pagina?: string;
    local: string;
    erro: string;
    risco: string;
    prio: 'Alta' | 'Média' | 'Baixa';
    prov: string;
    /** 'ia' = apontamento gerado pela conferência automática; ausente = lançado pelo conferente */
    origem?: 'ia' | 'manual';
  }[];
  /** Resultado da última conferência automática por IA */
  ai?: {
    ranAt: string;
    files: { name: string; tipo: string; chars: number; legivel: boolean }[];
    resumo: string;
    model: string | null;
    notas: string[];
  };
  parecer: {
    final: string;
    resumo: string;
    exigenciaCartorio: boolean;
    validacaoRT: boolean;
    validacaoJuridica: boolean;
    depSoftware: string;
    depJuridica: string;
    depDocumento: string;
  };
}

const STORAGE_KEY = 'valida_imovel_project_conf_v1';

export const projectConferenceService = {
  createBlankProject(): ProjectData {
    return {
      info: {
        nome: '',
        cliente: '',
        matricula: '',
        cartorio: '',
        municipio: '',
        comarca: '',
        uf: 'SP',
        natureza: 'urbano',
        rt: '',
        prof: '',
        reg: '',
        art: '',
        conferente: '',
        data: new Date().toISOString().slice(0, 10),
        procedimentos: ['desdobro'],
        modoMax: true,
      },
      docs: [],
      pm: {},
      neighbors: [],
      polygon: {
        rawCoords: '',
        isGeo: false,
        order: 'EN',
        areaPlanta: '',
        areaMemorial: '',
        perimPlanta: '',
        perimMemorial: '',
        tolDist: '0,01',
        tolArea: '1,00',
        tolAz: '1',
        declaredSegments: {},
      },
      checklists: {},
      amarracoes: [],
      analises: {},
      manualIssues: [],
      parecer: {
        final: '',
        resumo: '',
        exigenciaCartorio: true,
        validacaoRT: true,
        validacaoJuridica: false,
        depSoftware: 'Conferência de sobreposição espacial com confrontantes em software técnico (QGIS/SIGEF)',
        depJuridica: '',
        depDocumento: '',
      },
    };
  },

  saveToLocalStorage(data: ProjectData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Erro ao salvar projeto localmente:', e);
    }
  },

  loadFromLocalStorage(): ProjectData {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const blank = projectConferenceService.createBlankProject();
        const merged = { ...blank, ...parsed };
        if (!merged.info?.procedimentos || merged.info.procedimentos.length === 0) {
          merged.info = {
            ...merged.info,
            procedimentos: ['desdobro'],
          };
        }
        return merged;
      }
    } catch (e) {
      console.warn('Erro ao carregar projeto salvo:', e);
    }
    return projectConferenceService.createBlankProject();
  },

  /**
   * Sugere os documentos obrigatórios conforme os procedimentos selecionados
   */
  getExpectedDocuments(procedimentos: string[], natureza: string): ProjectDocItem[] {
    const list: ProjectDocItem[] = [
      {
        id: 'doc-1',
        nome: 'Planta topográfica assinada com firma reconhecida',
        tipo: 'Planta',
        status: 'Ausente',
        paginas: '',
        obs: 'Assinada pelo RT, proprietários e confrontantes conforme o rito.',
      },
      {
        id: 'doc-2',
        nome: 'Memorial descritivo (ABNT NBR 17047/2022)',
        tipo: 'Memorial',
        status: 'Ausente',
        paginas: '',
        obs: 'Cabeçalho, tabela de vértices, coordenadas e descrição perimétrica.',
      },
      {
        id: 'doc-3',
        nome: 'Certidão atualizada da matrícula objeto',
        tipo: 'Matrícula Principal',
        status: 'Ausente',
        paginas: '',
        obs: 'Emitida em até 30 dias para comprovação de titularidade e gravames.',
      },
      {
        id: 'doc-4',
        nome: 'Certidões de matrícula de todos os confrontantes',
        tipo: 'Matrículas Confrontantes',
        status: 'Ausente',
        paginas: '',
        obs: 'Uma para cada confrontante tabular para atestar a titularidade atual.',
      },
      {
        id: 'doc-5',
        nome: 'ART / RRT / TRT quitada com comprovante',
        tipo: 'Responsabilidade Técnica',
        status: 'Ausente',
        paginas: '',
        obs: 'Vinculada expressamente ao levantamento e memorial descritivo.',
      },
      {
        id: 'doc-6',
        nome: 'Cópia autenticada do RG/CPF e Certidão de Estado Civil dos proprietários',
        tipo: 'Documentos Pessoais',
        status: 'Ausente',
        paginas: '',
        obs: 'Pacto antenupcial se casado em comunhão universal ou separação total.',
      },
    ];

    if (natureza === 'rural') {
      list.push(
        {
          id: 'doc-car',
          nome: 'Recibo de Inscrição no CAR (Cadastro Ambiental Rural)',
          tipo: 'Documento Rural',
          status: 'Ausente',
          paginas: '',
          obs: '',
        },
        {
          id: 'doc-ccir',
          nome: 'CCIR (Certificado de Cadastro de Imóvel Rural) quitado',
          tipo: 'Documento Rural',
          status: 'Ausente',
          paginas: '',
          obs: '',
        },
        {
          id: 'doc-itr',
          nome: 'Certidão Negativa de Débitos do ITR (CND)',
          tipo: 'Documento Rural',
          status: 'Ausente',
          paginas: '',
          obs: 'Dentro do prazo de validade.',
        }
      );
    }

    if (procedimentos.includes('retificacao')) {
      list.push({
        id: 'doc-req-ret',
        nome: 'Requerimento de retificação com declaração intra-muros',
        tipo: 'Requerimento',
        status: 'Ausente',
        paginas: '',
        obs: 'Subscrito por todos os interessados e pelo responsável técnico.',
      });
    }

    if (procedimentos.includes('estremacao') || procedimentos.includes('retificacao')) {
      list.push({
        id: 'doc-anuencias',
        nome: 'Termos de anuência expressa dos confrontantes',
        tipo: 'Anuência',
        status: 'Ausente',
        paginas: '',
        obs: 'Ou requerimento para notificação pelo Oficial do Registro de Imóveis.',
      });
    }

    return list;
  },

  /**
   * Consolida todos os erros e pendências automáticas de todas as abas
   */
  consolidateIssues(data: ProjectData): ConsolidatedIssue[] {
    const list: ConsolidatedIssue[] = [];

    // 1. Poligonal
    const { vertices } = geodesyService.parseVertices(
      data.polygon.rawCoords,
      data.polygon.isGeo,
      data.polygon.order
    );
    if (vertices.length === 0) {
      list.push({
        origem: 'Poligonal',
        tipo: 'pend',
        categoria: 'Outros documentos',
        docACorrigir: 'Outros documentos',
        local: 'Coordenadas',
        erro: 'Coordenadas não lançadas — fechamento, área calculada e sobreposição não verificados',
        prioridade: 'Média',
        providencia: 'Lançar/importar coordenadas; validar sobreposição em software técnico',
      });
    } else {
      const polyRes = geodesyService.calculatePolygon(
        vertices,
        {
          areaPlanta: parseFloat(data.polygon.areaPlanta.replace(',', '.')),
          areaMemorial: parseFloat(data.polygon.areaMemorial.replace(',', '.')),
          perimPlanta: parseFloat(data.polygon.perimPlanta.replace(',', '.')),
          perimMemorial: parseFloat(data.polygon.perimMemorial.replace(',', '.')),
          tolDist: parseFloat(data.polygon.tolDist.replace(',', '.')),
          tolArea: parseFloat(data.polygon.tolArea.replace(',', '.')),
        },
        data.polygon.declaredSegments
      );

      polyRes.issues.forEach(iss => {
        if (iss.type === 'err' || iss.type === 'warn') {
          list.push({
            origem: 'Poligonal',
            tipo: iss.type === 'err' ? 'div' : 'pend',
            categoria: 'Planta',
            docACorrigir: 'Planta',
            local: 'Vértices e Coordenadas',
            erro: iss.text,
            prioridade: iss.type === 'err' ? 'Alta' : 'Média',
            providencia: 'Validar cálculo com o responsável técnico antes do protocolo.',
          });
        }
      });
    }

    // 2. Checklists dos Procedimentos
    const procsToEvaluate =
      data.info.procedimentos.length > 0
        ? data.info.procedimentos
        : ['desdobro', 'divisao', 'estremacao', 'reurb', 'retificacao', 'unificacao'];

    procsToEvaluate.forEach(procKey => {
      const checklist = PROCEDURE_CHECKLISTS.find(c => c.key === procKey);
      if (!checklist) return;
      const answers = data.checklists[procKey] || {};

      checklist.items.forEach(item => {
        const ans = answers[item.id];
        const doc = item.docACorrigir || item.category || 'Outros documentos';
        const itemLocal = item.originalLabel || item.id;

        if (!ans || !ans.status) {
          list.push({
            origem: `Checklist ${checklist.name}`,
            tipo: 'pend',
            categoria: doc,
            docACorrigir: doc,
            local: itemLocal,
            erro: `Item não respondido: ${item.text}`,
            prioridade: 'Média',
            providencia: 'Responder o item com status e evidência',
          });
        } else if (ans.status === 'DIVERGENTE') {
          list.push({
            origem: `Checklist ${checklist.name}`,
            tipo: 'div',
            categoria: doc,
            docACorrigir: doc,
            local: itemLocal,
            erro: `Divergente: ${item.text}${ans.evidence ? ` (Evidência: ${ans.evidence})` : ''}`,
            prioridade: 'Alta',
            providencia: ans.correction || 'Corrigir para atender ao requisito normativo.',
          });
        } else if (ans.status === 'PENDENTE' || ans.status === 'NÃO VERIFICÁVEL') {
          list.push({
            origem: `Checklist ${checklist.name}`,
            tipo: 'pend',
            categoria: doc,
            docACorrigir: doc,
            local: itemLocal,
            erro: `${ans.status}: ${item.text}`,
            prioridade: 'Média',
            providencia: ans.correction || 'Apresentar documento hábil para verificação.',
          });
        } else if (ans.status === 'NÃO APLICÁVEL' && (ans.evidence || '').trim().length < 8) {
          list.push({
            origem: `Checklist ${checklist.name}`,
            tipo: 'pend',
            categoria: doc,
            docACorrigir: doc,
            local: itemLocal,
            erro: `NÃO APLICÁVEL sem justificativa: ${item.text}`,
            prioridade: 'Baixa',
            providencia: 'Justificar no campo de evidência por que o item não se aplica.',
          });
        }
      });
    });

    // 3. Confrontantes
    if (data.neighbors.length === 0) {
      list.push({
        origem: 'Confrontantes',
        tipo: 'pend',
        categoria: 'Matrículas dos confrontantes',
        docACorrigir: 'Matrículas dos confrontantes',
        local: 'Matriz',
        erro: 'Nenhum confrontante inventariado na matriz nominal',
        prioridade: 'Alta',
        providencia: 'Inventariar todos os confrontantes por trecho',
      });
    } else {
      data.neighbors.forEach(n => {
        const res = nominalDiffService.compareRow(n);
        res.issues.forEach(iss => {
          list.push({
            origem: 'Confrontantes',
            tipo: iss.level === 'err' ? 'div' : 'pend',
            categoria: 'Matrículas dos confrontantes',
            docACorrigir: 'Matrículas dos confrontantes',
            local: `${n.trecho || 'Divisa'} (${n.lado || 'lado ?'})`,
            erro: iss.message,
            prioridade: iss.level === 'err' ? 'Alta' : 'Média',
            providencia:
              iss.level === 'err'
                ? 'Ajustar a grafia para coincidir exatamente com o titular da matrícula.'
                : 'Apresentar certidão de matrícula ou recolher assinatura de anuência.',
          });
        });
      });

      const secondPassAlerts = nominalDiffService.runSecondPass(data.neighbors);
      secondPassAlerts.forEach(alertText => {
        list.push({
          origem: 'Confrontantes',
          tipo: alertText.startsWith('❌') ? 'div' : 'pend',
          categoria: 'Matrículas dos confrontantes',
          docACorrigir: 'Matrículas dos confrontantes',
          local: 'Segunda Passagem (Sentido Inverso)',
          erro: alertText,
          prioridade: alertText.startsWith('❌') ? 'Alta' : 'Média',
          providencia: 'Validar confrontação física e registral.',
        });
      });
    }

    // 4. Documentos
    if (data.docs.length === 0) {
      list.push({
        origem: 'Documentos',
        tipo: 'pend',
        categoria: 'Outros documentos',
        docACorrigir: 'Outros documentos',
        local: 'Inventário',
        erro: 'Nenhum documento listado no inventário',
        prioridade: 'Alta',
        providencia: 'Listar os documentos recebidos',
      });
    } else {
      data.docs.forEach((doc, idx) => {
        if (['Ausente', 'Ilegível', 'Incompleto'].includes(doc.status)) {
          list.push({
            origem: 'Documentos',
            tipo: 'pend',
            categoria: doc.tipo || 'Outros documentos',
            docACorrigir: doc.tipo || 'Outros documentos',
            local: `Documento nº ${idx + 1} (${doc.nome || doc.tipo})`,
            erro: `${doc.status.toUpperCase()}: ${doc.nome}${doc.obs ? ' — ' + doc.obs : ''}`,
            prioridade: /Matr|Planta|Memorial|ART/i.test(doc.tipo) ? 'Alta' : 'Média',
            providencia:
              doc.status === 'Ilegível'
                ? 'Solicitar cópia ou certidão legível com alta resolução.'
                : 'Apresentar documento faltante antes do protocolo.',
          });
        }
      });
    }

    // 5. Inconsistências de Planta x Memorial
    PM_COMPARE_FIELDS.forEach(f => {
      const row = data.pm[f.key];
      if (!row) return;
      const p = (row.planta || '').trim();
      const m = (row.memorial || '').trim();
      if (!p && !m) return;

      if (!p) {
        list.push({
          origem: 'Planta × Memorial',
          tipo: 'pend',
          categoria: 'Planta',
          docACorrigir: 'Planta',
          local: f.label,
          erro: `Campo "${f.label}" informado no memorial, mas ausente na planta topográfica.`,
          prioridade: 'Média',
          providencia: 'Inserir a informação na planta ou padronizar.',
        });
      } else if (!m) {
        list.push({
          origem: 'Planta × Memorial',
          tipo: 'pend',
          categoria: 'Memorial descritivo',
          docACorrigir: 'Memorial descritivo',
          local: f.label,
          erro: `Campo "${f.label}" informado na planta, mas omitido no memorial descritivo.`,
          prioridade: 'Média',
          providencia: 'Inserir a informação no texto do memorial descritivo.',
        });
      } else if (f.isNumeric) {
        const numP = parseFloat(p.replace(/\./g, '').replace(',', '.'));
        const numM = parseFloat(m.replace(/\./g, '').replace(',', '.'));
        if (isFinite(numP) && isFinite(numM) && Math.abs(numP - numM) > 0.001) {
          list.push({
            origem: 'Planta × Memorial',
            tipo: 'div',
            categoria: 'Conferência Técnica',
            docACorrigir: 'Memorial descritivo e Planta',
            local: f.label,
            erro: `Divergência numérica: planta (${p}) × memorial (${m}) — diferença de ${Math.abs(numP - numM).toFixed(3)}.`,
            prioridade: 'Alta',
            providencia: 'Padronizar exatamente a mesma medida em ambas as peças.',
          });
        }
      } else if (p.toLowerCase() !== m.toLowerCase()) {
        list.push({
          origem: 'Planta × Memorial',
          tipo: 'div',
          categoria: 'Texto e Qualificação',
          docACorrigir: 'Memorial descritivo e Planta',
          local: f.label,
          erro: `Divergência textual entre planta ("${p}") e memorial ("${m}").`,
          prioridade: 'Alta',
          providencia: 'Revisar a redação e reproduzir o dado idêntico nas duas peças.',
        });
      }
    });

    // 6. Matriz de Amarração
    data.amarracoes.forEach((a, i) => {
      const where = `Divisa ${i + 1}${a.seg ? ` (${a.seg})` : ''}${a.mat ? ` × matr. ${a.mat}` : ''}`;
      const st = (a.status || '').toUpperCase();
      if (st === 'DIVERGENTE') {
        list.push({
          origem: 'Amarrações',
          tipo: 'div',
          categoria: 'Matrículas dos confrontantes',
          docACorrigir: 'Matrículas dos confrontantes',
          local: where,
          erro: `${a.critico ? '🚨 ALERTA CRÍTICO — ' : ''}Amarração divergente: ${a.comp || 'sem descrição da comparação'}`,
          prioridade: a.critico ? 'Alta' : a.prioridade,
          providencia: a.providencia || 'Revalidar a confrontação com o responsável técnico e as matrículas.',
        });
      } else if (!st || st === 'NÃO VERIFICÁVEL') {
        list.push({
          origem: 'Amarrações',
          tipo: 'pend',
          categoria: 'Matrículas dos confrontantes',
          docACorrigir: 'Matrículas dos confrontantes',
          local: where,
          erro: st ? 'Amarração não verificável com os documentos apresentados.' : 'Amarração sem status de comparação.',
          prioridade: a.prioridade || 'Média',
          providencia: a.providencia || 'Apresentar a matrícula do confrontante e comparar a descrição.',
        });
      }
    });

    // 7. Inconsistências manuais
    data.manualIssues.forEach(m => {
      list.push({
        origem: m.origem === 'ia' ? 'Conferência Automática por IA' : 'Apontamento Manual do Conferente',
        tipo: m.tipo,
        categoria: m.cat,
        docACorrigir: m.docACorrigir || m.cat,
        local: m.local,
        pagina: m.pagina,
        erro: m.erro,
        risco: m.risco,
        prioridade: m.prio,
        providencia: m.prov,
      });
    });

    return list;
  },

  /**
   * Determina o parecer automático com base no rigor de bloqueio de parecer positivo
   */
  computeAutomaticOpinion(data: ProjectData): {
    opinion: 'DOCUMENTAÇÃO COMPATÍVEL' | 'DOCUMENTAÇÃO COM DIVERGÊNCIAS' | 'DOCUMENTAÇÃO INCOMPLETA PARA CONFERÊNCIA';
    blocked: boolean;
    divCount: number;
    pendCount: number;
  } {
    const issues = projectConferenceService.consolidateIssues(data);
    const divCount = issues.filter(i => i.tipo === 'div').length;
    const pendCount = issues.filter(i => i.tipo !== 'div').length;

    let opinion:
      | 'DOCUMENTAÇÃO COMPATÍVEL'
      | 'DOCUMENTAÇÃO COM DIVERGÊNCIAS'
      | 'DOCUMENTAÇÃO INCOMPLETA PARA CONFERÊNCIA' = 'DOCUMENTAÇÃO COMPATÍVEL';

    if (divCount > 0) {
      opinion = 'DOCUMENTAÇÃO COM DIVERGÊNCIAS';
    } else if (pendCount > 0) {
      opinion = 'DOCUMENTAÇÃO INCOMPLETA PARA CONFERÊNCIA';
    }

    return {
      opinion,
      blocked: divCount > 0 || pendCount > 0,
      divCount,
      pendCount,
    };
  },

  /**
   * Constrói o texto do relatório técnico completo em Markdown
   */
  generateReportMarkdown(data: ProjectData): string {
    const issues = projectConferenceService.consolidateIssues(data);
    const { opinion } = projectConferenceService.computeAutomaticOpinion(data);
    const finalOpinion = data.parecer.final || opinion;
    const stats = nominalDiffService.calculateStats(data.neighbors);
    const petitionText = nominalDiffService.generateRegistryPetition(data.neighbors);

    const procsText = data.info.procedimentos
      .map(k => PROCEDURE_CHECKLISTS.find(c => c.key === k)?.name || k)
      .join(', ');

    return `# LAUDO PERICIAL DE AUDITORIA TÉCNICA E REGISTRAL
**ValidaImóvel Pericial AI — Auditoria Georreferenciada e Notarial Integrada**
*Elaborado em estrita conformidade com a ABNT NBR 17047/2022, Lei nº 6.015/73 e Provimento CNJ nº 149/2023*

---

### Qualificação do Projeto e Identificação Notarial
* **Projeto / Objeto:** ${data.info.nome || 'Não informado'}
* **Requerente(s):** ${data.info.cliente || 'Não informado'}
* **Matrícula Imobiliária:** nº ${data.info.matricula || 'S/N'} · **Serventia / CNS:** ${data.info.cartorio || 'Não informado'}
* **Localização / Comarca / UF:** ${[data.info.municipio, data.info.comarca, data.info.uf].filter(Boolean).join(' / ')}
* **Responsável Técnico (RT):** ${data.info.rt || 'Não informado'} (${data.info.prof || 'RT'} - ${data.info.reg || 'Reg.'}) · **ART/RRT:** ${data.info.art || 'N/A'}
* **Procedimento(s) Cartorário(s):** ${procsText || 'Não informado'}
* **Data da Perícia:** ${data.info.data ? data.info.data.split('-').reverse().join('/') : ''} · **Auditoria:** ${data.info.conferente || 'ValidaImóvel Pericial AI'}
* **Rigor da Análise:** ${data.info.modoMax ? 'Modo Rigor Máximo Notarial (Tolerância Zero para Discrepâncias)' : 'Padrão'}

---

## 📌 Conclusão Pericial & Parecer Notarial: ${finalOpinion}
${data.parecer.resumo ? `\n> ${data.parecer.resumo}\n` : ''}

* **Possibilidade de Exigência Cartorária:** ${data.parecer.exigenciaCartorio || issues.length > 0 ? 'SIM — há pendências impeditivas identificadas' : 'Baixo risco'}
* **Validação do Responsável Técnico:** ${data.parecer.validacaoRT ? 'Obrigatória antes do protocolo' : 'Dispensada'}
* **Validação Jurídica:** ${data.parecer.validacaoJuridica ? 'Recomendada' : 'A critério das partes'}

---

## 1. Inventário de Documentos Analisados
| # | Documento | Tipo | Status | Observação |
|---|---|---|---|---|
${data.docs.map((d, i) => `| ${i + 1} | ${d.nome} | ${d.tipo} | **${d.status}** | ${d.obs || '—'} |`).join('\n') || '| - | Nenhum documento cadastrado | - | - | - |'}

---

## 2. Matriz Nominal dos Confrontantes
Foram identificados **${stats.distinctPersons} confrontantes distintos** em **${stats.totalTrechos} trechos/divisas**.

| Trecho / Vértices | Lado | Planta (Desenho) | Memorial (Texto) | Memorial (Tabela) | Matrícula Confrontante | Assinatura / Anuência |
|---|---|---|---|---|---|---|
${data.neighbors.map(n => `| ${n.trecho || '—'} (${n.vertices || '—'}) | ${n.lado || '—'} | ${n.planta || '—'} | ${n.memTexto || '—'} | ${n.memTabela || '—'} | ${n.matConf || '—'} (Mat. ${n.matNum || '?'}) | ${n.assin || '—'} |`).join('\n') || '| - | - | Nenhuma divisa cadastrada | - | - | - | - |'}

${petitionText ? `\n> ⚠️ **Pedido de Certidões ao Cartório:**\n> ${petitionText}\n` : ''}

---

## 3. Tabela Única de Inconsistências e Pendências
Total de inconformidades registradas: **${issues.length}**.

| # | Origem | Tipo | Local | Inconsistência Encontrada | Providência / Correção |
|---|---|---|---|---|---|
${issues.map((iss, i) => `| ${i + 1} | ${iss.origem} | ${iss.tipo === 'div' ? '❌ Divergência' : '⚠️ Pendência'} | ${iss.local} | ${iss.erro} | ${iss.providencia} |`).join('\n') || '| - | - | ✅ Nenhuma divergência | - | - | - |'}

---

## 3.1 Matriz de Amarração — Matrícula Objeto × Matrículas Confrontantes
${data.amarracoes.length === 0 ? '_Nenhuma divisa lançada na matriz de amarração._' : `| # | Segmento | Matrícula confrontante | Fonte objeto | Fonte confrontante | Comparação | Status | Providência |
|---|---|---|---|---|---|---|---|
${data.amarracoes.map((a, i) => `| ${i + 1} | ${a.seg || '—'} | ${a.mat || '—'} | ${a.descObj || '—'} | ${a.descConf || '—'} | ${a.comp || '—'} | **${a.status || 'Não preenchido'}**${a.critico ? ' 🚨' : ''} | ${a.providencia || '—'} |`).join('\n')}`}

## 3.2 Análises Descritivas
${ANALISES_SECTIONS.filter(s => (data.analises?.[s.key] || '').trim()).map(s => `### ${s.label}\n${data.analises[s.key].trim()}`).join('\n\n') || '_Nenhuma análise descritiva registrada._'}

---

## 4. Correções Necessárias por Documento
${(() => {
  const groups = new Map<string, ConsolidatedIssue[]>();
  issues.forEach(iss => {
    const doc = iss.categoria || 'Geral';
    groups.set(doc, [...(groups.get(doc) || []), iss]);
  });
  if (groups.size === 0) return '✅ Nenhuma correção necessária nos documentos analisados.';
  return [...groups.entries()]
    .map(([doc, list]) => `### ${doc} (${list.length})\n${list.map(i => `* ${i.tipo === 'div' ? '❌' : '⚠️'} **${i.local}** — ${i.erro}\n  * *Correção:* ${i.providencia}`).join('\n')}`)
    .join('\n\n');
})()}

---

## 5. Declaração Final de Abrangência
* **Documentos Examinados:** ${data.docs.length}
* **Confrontantes Compatíveis:** ${stats.countOk} | **Divergentes:** ${stats.countErr} | **Sem Matrícula:** ${stats.missingTitles.length}
* **Depende de Software Técnico:** ${data.parecer.depSoftware || 'Conferência de sobreposição espacial'}
* **Limitação:** Este parecer é instrumento técnico pré-cartorário e não substitui a qualificação formal do Oficial de Registro de Imóveis.
${data.ai ? `* **Leitura dos documentos:** realizada por IA em ${new Date(data.ai.ranAt).toLocaleString('pt-BR')}; os dados extraídos devem ser conferidos pelo responsável técnico antes do protocolo.` : ''}
`;
  },

  /**
   * Exporta o relatório completo como documento Word (.doc)
   */
  exportToWord(data: ProjectData): void {
    const md = projectConferenceService.generateReportMarkdown(data);
    const htmlBody = md
      .replace(/^# (.*$)/gim, '<h1 style="color:#1d2320;font-size:18pt;margin-bottom:6pt;">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 style="color:#1f5f4a;font-size:14pt;margin-top:14pt;border-bottom:1px solid #ccc;padding-bottom:3pt;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="color:#333;font-size:12pt;margin-top:10pt;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*?)\*/gim, '<i>$1</i>')
      .replace(/\| (.*) \|/g, (match) => {
        const cells = match.split('|').slice(1, -1).map(c => `<td style="border:1px solid #aaa;padding:4pt 6pt;font-size:9.5pt;">${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      })
      .replace(/\n/g, '<br/>');

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>${data.info.nome || 'Relatório de Conferência'}</title>
          <style>
            @page WordSection1 { size: 842pt 595pt; mso-page-orientation: landscape; margin: 36pt; }
            div.WordSection1 { page: WordSection1; }
            body { font-family: Calibri, Arial, sans-serif; font-size: 10.5pt; color: #222; }
            table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
            th { background: #e3efe9; border: 1px solid #aaa; padding: 5pt; font-weight: bold; text-align: left; }
          </style>
        </head>
        <body>
          <div class="WordSection1">
            ${htmlBody}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (data.info.nome || 'conferencia_projeto').toLowerCase().replace(/\s+/g, '_');
    a.href = url;
    a.download = `${safeName}_parecer_tecnico.doc`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 500);
  },
};

export const createEmptyProject = projectConferenceService.createBlankProject;
export const loadProjectFromStorage = projectConferenceService.loadFromLocalStorage;
export const saveProjectToStorage = projectConferenceService.saveToLocalStorage;
export const consolidateIssues = projectConferenceService.consolidateIssues;
export const computeAutomaticOpinion = projectConferenceService.computeAutomaticOpinion;
export const generateReportMarkdown = projectConferenceService.generateReportMarkdown;
export const exportToWord = projectConferenceService.exportToWord;

