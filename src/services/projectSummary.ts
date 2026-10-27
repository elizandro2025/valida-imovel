/**
 * Resultado da conferência de projeto em linguagem simples, no mesmo formato do relatório da matrícula:
 * veredito, o que foi recebido, medidas, o que precisa de atenção (com o que fazer) e próximos passos.
 * Tudo é derivado das regras que já existem (consolidateIssues, finalOpinion, cálculo da poligonal): nada aqui
 * inventa conclusão; só organiza o que o sistema já apurou.
 */
import {
  ConsolidatedIssue, ProjectData, computeAutomaticOpinion, consolidateIssues, finalOpinion, polygonParams,
} from './projectConferenceService';
import { geodesyService } from './geodesyService';

// Nome e explicação de cada procedimento para quem não é da área
export const PLAIN_PROCEDURES: Record<string, { label: string; hint: string }> = {
  desdobro: { label: 'Desdobro de lote', hint: 'Dividir um lote urbano em dois ou mais' },
  retificacao: { label: 'Retificação de área', hint: 'Corrigir as medidas ou a área registradas na matrícula' },
  unificacao: { label: 'Unificação', hint: 'Juntar imóveis vizinhos do mesmo dono em uma matrícula' },
  estremacao: { label: 'Estremação', hint: 'Separar a parte de quem tem fração de uma área maior' },
  divisao: { label: 'Divisão de condomínio', hint: 'Dividir um imóvel entre os coproprietários' },
  reurb: { label: 'REURB', hint: 'Regularização fundiária urbana' },
};

export interface DocRecommendation {
  tipo: string;
  label: string;
  required: boolean;
}

// O que pedir à pessoa para cada procedimento (os tipos são os de PROJECT_DOC_TYPES / guessDocType)
export function recommendedDocTypes(procedimentos: string[], natureza: string): DocRecommendation[] {
  const list: DocRecommendation[] = [
    { tipo: 'Planta', label: 'Planta do levantamento', required: true },
    { tipo: 'Memorial', label: 'Memorial descritivo', required: true },
    { tipo: 'Matrícula Principal', label: 'Certidão da matrícula do imóvel', required: true },
    { tipo: 'Responsabilidade Técnica', label: 'ART, RRT ou TRT do responsável técnico', required: false },
  ];
  const add = (tipo: string, label: string) => {
    if (!list.some(d => d.tipo === tipo)) list.push({ tipo, label, required: false });
  };
  if (procedimentos.some(p => ['retificacao', 'estremacao', 'divisao'].includes(p))) {
    add('Matrículas Confrontantes', 'Matrículas dos vizinhos (confrontantes)');
    add('Anuência', 'Anuências (assinaturas) dos vizinhos');
  }
  if (procedimentos.some(p => ['desdobro', 'unificacao', 'reurb'].includes(p))) {
    add('Certidão Municipal', 'Aprovação ou certidão da prefeitura');
  }
  if (procedimentos.includes('reurb')) add('Requerimento', 'Requerimento');
  if (natureza === 'rural') add('Documento Rural', 'CCIR e CAR (imóvel rural)');
  return list;
}

export type SummaryTone = 'ok' | 'warn' | 'bad';

export interface AttentionItem {
  tipo: ConsolidatedIssue['tipo'];
  titulo: string;
  onde: string;
  documento: string;
  oQueFazer: string;
  prioridade: ConsolidatedIssue['prioridade'];
}

export interface ProjectSummary {
  opinion: string;
  tone: SummaryTone;
  headline: string;
  explanation: string;
  divergencias: number;
  pendencias: number;
  received: { name: string; tipo: string; legivel: boolean }[];
  missing: DocRecommendation[];
  measures: { hasCoords: boolean; areaM2: number | null; perimeter: number | null; areaDeclared: number | null; perimDeclared: number | null };
  neighbors: number;
  attention: AttentionItem[];
  checklistPending: number;
  nextSteps: string[];
}

const TYPE_ORDER: Record<ConsolidatedIssue['tipo'], number> = { div: 0, pend: 1, prov: 2 };
const PRIO_ORDER: Record<ConsolidatedIssue['prioridade'], number> = { Alta: 0, 'Média': 1, Baixa: 2 };
const isChecklist = (issue: ConsolidatedIssue) => issue.origem.startsWith('Checklist');
const finite = (n: number) => (Number.isFinite(n) ? n : null);

export function buildProjectSummary(data: ProjectData): ProjectSummary {
  const issues = consolidateIssues(data);
  const { divCount, pendCount } = computeAutomaticOpinion(data);
  const opinion = finalOpinion(data);

  const tone: SummaryTone = opinion === 'DOCUMENTAÇÃO COMPATÍVEL' ? 'ok' : opinion === 'DOCUMENTAÇÃO COM DIVERGÊNCIAS' ? 'bad' : 'warn';
  const headline = tone === 'ok'
    ? 'Nenhum problema encontrado nos documentos conferidos'
    : tone === 'bad'
      ? 'Há diferenças para corrigir antes de levar ao cartório'
      : 'Faltam documentos ou dados para concluir a conferência';
  const explanation = tone === 'ok'
    ? 'Pelo que foi lido e calculado, os documentos estão coerentes entre si. O responsável técnico deve validar antes do protocolo.'
    : tone === 'bad'
      ? `Encontramos ${divCount} divergência(s) entre os documentos. Sem a correção, o cartório costuma devolver o pedido com exigência.`
      : `Há ${pendCount} pendência(s): documentos que faltam, que não puderam ser lidos ou itens que ainda não foram conferidos.`;

  // Recebidos: o que a leitura automática leu; sem leitura, a lista de documentos marcados como recebidos
  const received = data.ai?.files.length
    ? data.ai.files.map(f => ({ name: f.name, tipo: f.tipo, legivel: f.legivel }))
    : data.docs.filter(d => d.status === 'Recebido').map(d => ({ name: d.nome, tipo: d.tipo, legivel: true }));
  const receivedTypes = new Set(received.map(r => r.tipo));
  const missing = recommendedDocTypes(data.info.procedimentos, data.info.natureza)
    .filter(d => d.required && !receivedTypes.has(d.tipo));

  const { vertices } = geodesyService.parseVertices(data.polygon.rawCoords, data.polygon.isGeo, data.polygon.order);
  const params = polygonParams(data.polygon);
  const calc = vertices.length >= 3 ? geodesyService.calculatePolygon(vertices, params, data.polygon.declaredSegments) : null;
  const measures = {
    hasCoords: Boolean(calc),
    areaM2: calc ? calc.areaM2 : null,
    perimeter: calc ? calc.perimeter : null,
    areaDeclared: finite(params.areaPlanta),
    perimDeclared: finite(params.perimPlanta),
  };

  // Itens do checklist ainda não respondidos viram um número (são muitos); o resto aparece um a um
  const attention = issues
    .filter(issue => !isChecklist(issue) || issue.tipo === 'div')
    .sort((a, b) => TYPE_ORDER[a.tipo] - TYPE_ORDER[b.tipo] || PRIO_ORDER[a.prioridade] - PRIO_ORDER[b.prioridade])
    .map(issue => ({
      tipo: issue.tipo,
      titulo: issue.erro,
      onde: issue.local,
      documento: issue.docACorrigir || issue.categoria,
      oQueFazer: issue.providencia,
      prioridade: issue.prioridade,
    }));
  const checklistPending = issues.filter(issue => isChecklist(issue) && issue.tipo !== 'div').length;

  const nextSteps: string[] = [];
  if (divCount > 0) nextSteps.push('Corrija os documentos indicados em "O que precisa de atenção" e confira de novo.');
  if (missing.length > 0) nextSteps.push(`Envie também: ${missing.map(m => m.label.toLowerCase()).join(', ')}.`);
  if (checklistPending > 0) nextSteps.push(`Responda os ${checklistPending} itens do checklist que a leitura não conseguiu confirmar.`);
  if (!measures.hasCoords) nextSteps.push('Envie o memorial ou um arquivo com as coordenadas (TXT, CSV, KML) para calcular a área.');
  nextSteps.push('Exporte o relatório e entregue ao responsável técnico para validação antes do protocolo.');

  return {
    opinion, tone, headline, explanation,
    divergencias: divCount,
    pendencias: pendCount,
    received, missing, measures,
    neighbors: data.neighbors.length,
    attention, checklistPending, nextSteps,
  };
}
