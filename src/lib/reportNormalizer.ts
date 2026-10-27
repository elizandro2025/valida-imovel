/**
 * Regras aplicadas ao resultado da IA antes de mostrar o relatório.
 *
 * Princípios:
 * - resposta quebrada ou incompleta vira erro, nunca um relatório "sem ônus";
 * - um ônus só conta como cancelado com prova (ato ou data de cancelamento);
 * - a nota de risco nunca fica abaixo do mínimo exigido pelos ônus ativos encontrados;
 * - CPFs, números de atos e trechos citados são conferidos no texto lido do PDF.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- o relatório vem da IA e tem forma livre */
import { LEGAL_STATUS_BY_LEVEL, LienStatus, describesEmbargo, riskLevelFromScore } from './reportView';

// Muda sempre que os prompts ou estas regras mudarem: invalida relatórios guardados no navegador
export const PIPELINE_VERSION = 3;

// O servidor aceita até 450 mil caracteres por etapa
export const MAX_ANALYSIS_CHARS = 400_000;

export const EXTRACTION_KEYS = [
  'identificacao_geral', 'caracteristicas_fisicas', 'memorial_descritivo_georreferenciamento', 'regimes_especiais',
  'registro_ambiental', 'imoveis_especiais', 'proprietarios_atuais', 'cadeia_dominial', 'onus_garantias_financeiras',
  'indisponividades_e_penhoras', 'usufruto_servidoes_e_direitos', 'averbacoes_diversas',
];

export class IncompleteAnalysisError extends Error {
  // Seções que faltaram na resposta (para o registro técnico; a mensagem mostrada ao usuário não cita nomes de campo)
  constructor(message: string, readonly missing: string[] = []) {
    super(message);
  }
}

// ─── Texto enviado à análise ────────────────────────────────────────────────
export interface PreparedText {
  text: string;
  truncated: boolean;
  omittedChars: number;
}

// Documento longo demais: mantém o começo (abertura e descrição) e principalmente o fim (atos mais recentes)
export function prepareText(full: string, limit = MAX_ANALYSIS_CHARS): PreparedText {
  if (full.length <= limit) return { text: full, truncated: false, omittedChars: 0 };
  const head = Math.floor(limit * 0.25);
  const omitted = full.length - limit;
  const marker = `\n\n[... ${omitted} caracteres do meio do documento não foram analisados por limite de tamanho ...]\n\n`;
  return { text: full.slice(0, head) + marker + full.slice(full.length - (limit - head)), truncated: true, omittedChars: omitted };
}

// ─── Resposta da IA ─────────────────────────────────────────────────────────
export function parseAIJson(raw: string, requiredKeys: string[]): Record<string, any> {
  const cleaned = raw.replace(/```(?:json)?/g, '').trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new IncompleteAnalysisError('A IA devolveu uma resposta incompleta. Tente analisar de novo em instantes.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new IncompleteAnalysisError('A IA devolveu uma resposta em formato inesperado. Tente analisar de novo.');
  }
  const missing = requiredKeys.filter(key => !(key in (parsed as object)));
  if (missing.length > 0) {
    throw new IncompleteAnalysisError(
      'A IA não devolveu todas as partes da análise e, para não mostrar um relatório incompleto, paramos aqui. Tente analisar de novo.',
      missing,
    );
  }
  return parsed as Record<string, any>;
}

// Remove valores vazios ("", "null", {}, []) para a tela não mostrar lixo
export function sanitizeDeep(value: any): any {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || ['null', 'undefined', '{}', '[]'].includes(trimmed)) return null;
    return trimmed;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map(sanitizeDeep).filter(item => item !== null);
  if (typeof value === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, item] of Object.entries(value)) {
      const v = sanitizeDeep(item);
      if (v !== null) cleaned[key] = v;
    }
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  }
  return null;
}

// ─── Status dos ônus ────────────────────────────────────────────────────────
const ACT_RE = /\b(AV|R)\s*[.\-–]?\s*\d+/i;
const DATE_RE = /\d{1,2}\/\d{1,2}\/\d{2,4}/;

// Cancelado só com prova; a IA dizendo "cancelado" sem citar o ato vira INDEFINIDO (conferir na certidão)
export function resolveLienStatus(item: any): LienStatus {
  const status = String(item?.status ?? '').trim().toUpperCase();
  const hasProof = (typeof item?.ato_cancelamento === 'string' && ACT_RE.test(item.ato_cancelamento))
    || (typeof item?.data_cancelamento === 'string' && DATE_RE.test(item.data_cancelamento));
  if (hasProof) return 'CANCELADO';
  if (status.startsWith('CANCEL') || status.includes('BAIXAD') || status.includes('QUITAD') || status.includes('EXTINT')) return 'INDEFINIDO';
  if (status === 'INDEFINIDO') return 'INDEFINIDO';
  return 'ATIVO';
}

// ─── Conferência com o texto lido ───────────────────────────────────────────
const normalizeText = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Entre os dígitos pode haver espaço, ponto, vírgula decimal, hífen ou barra ("100,40", "12.345", "016.765.718-68")
function digitsPattern(digits: string): RegExp {
  return new RegExp(digits.split('').join('[\\s.,\\-/]*'));
}

export function numberAppearsIn(source: string, value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 3) return true; // curto demais para conferir com segurança
  return digitsPattern(digits).test(source);
}

export function actAppearsIn(source: string, act: string): boolean {
  const match = act.match(/\b(AV|R)\s*[.\-–]?\s*0*(\d+)/i);
  if (!match) return true;
  return new RegExp(`\\b${match[1]}\\s*[.\\-–]?\\s*0*${match[2]}\\b`, 'i').test(source);
}

export function excerptAppearsIn(normalizedSource: string, excerpt: string): boolean {
  const normalized = normalizeText(excerpt);
  if (normalized.length < 15) return true;
  return normalizedSource.includes(normalized.slice(0, 60));
}

export function verifyAgainstSource(report: any, source: string): string[] {
  const warnings: string[] = [];
  const normalizedSource = normalizeText(source);

  const matricula = report.identificacao_geral?.matricula;
  if (typeof matricula === 'string' && !numberAppearsIn(source, matricula)) {
    warnings.push(`O número da matrícula (${matricula}) não foi localizado no texto lido. Confira na certidão.`);
  }

  for (const owner of report.proprietarios_atuais ?? []) {
    if (typeof owner.cpf_cnpj === 'string' && owner.cpf_cnpj.replace(/\D/g, '').length >= 11 && !numberAppearsIn(source, owner.cpf_cnpj)) {
      owner._cpf_nao_confirmado = true;
      warnings.push(`O CPF/CNPJ ${owner.cpf_cnpj} (${owner.nome ?? 'proprietário'}) não foi localizado no texto lido. Confira na certidão.`);
    }
  }

  const lists = ['onus_garantias_financeiras', 'indisponividades_e_penhoras', 'usufruto_servidoes_e_direitos'];
  for (const key of lists) {
    for (const item of report[key] ?? []) {
      if (typeof item.numero_ato === 'string' && !actAppearsIn(source, item.numero_ato)) {
        item._ato_nao_confirmado = true;
        warnings.push(`O ato ${item.numero_ato} (${item.tipo ?? 'ônus'}) não foi localizado no texto lido. Confira na certidão.`);
      }
      if (typeof item.trecho_origem === 'string') item._trecho_confirmado = excerptAppearsIn(normalizedSource, item.trecho_origem);
    }
  }

  for (const risk of report.parecer_analise?.riscos_identificados ?? []) {
    if (typeof risk.trecho_origem === 'string') risk._trecho_confirmado = excerptAppearsIn(normalizedSource, risk.trecho_origem);
  }

  return warnings;
}

// ─── Nota de risco mínima pelos ônus ativos ─────────────────────────────────
const SEVERE_RE = /penhor(?!\s*(rural|agr|mercantil|industrial|cedular))|arresto|sequestro|indisponib|bloqueio/i;

export function riskFloor(report: any): { minimum: number; reason: string | null } {
  const active = (list: any[]) => (list ?? []).filter(item => item.status !== 'CANCELADO');
  const penhoras = active(report.indisponividades_e_penhoras);
  const garantias = active(report.onus_garantias_financeiras);
  const direitos = active(report.usufruto_servidoes_e_direitos);
  const embargo = describesEmbargo(report.registro_ambiental?.embargos_ambientais);

  const severe = penhoras.filter(p => SEVERE_RE.test(String(p.tipo ?? '')));
  if (severe.length > 0) return { minimum: 75, reason: `${severe.length} penhora(s) ou indisponibilidade(s) sem cancelamento comprovado` };
  if (embargo) return { minimum: 75, reason: 'embargo ambiental citado na matrícula' };
  if (penhoras.length > 0) return { minimum: 50, reason: `${penhoras.length} ação(ões) ou restrição(ões) judicial(is) sem cancelamento comprovado` };
  if (garantias.length > 0) return { minimum: 50, reason: `${garantias.length} garantia(s) (hipoteca, alienação fiduciária ou cédula) sem cancelamento comprovado` };
  if (direitos.length > 0) return { minimum: 25, reason: `${direitos.length} usufruto(s), servidão(ões) ou cláusula(s) restritiva(s) ativa(s)` };
  return { minimum: 0, reason: null };
}

// ─── Montagem do relatório final ────────────────────────────────────────────
export interface NormalizeInput {
  extracao: Record<string, any>;
  parecer: Record<string, any>;
  geo?: Record<string, any> | null;
}

export interface NormalizeMeta {
  source: string;
  models: Array<string | null>;
  truncated: boolean;
  omittedChars: number;
  ocrCut?: boolean;
}

export function normalizeReport(input: NormalizeInput, meta: NormalizeMeta): Record<string, any> {
  const report: Record<string, any> = sanitizeDeep({ ...input.extracao, ...input.parecer }) || {};

  const geo = sanitizeDeep(input.geo?.memorial_descritivo_georreferenciamento);
  for (const key of ['identificacao_geral', 'caracteristicas_fisicas', 'memorial_descritivo_georreferenciamento', 'regimes_especiais',
    'registro_ambiental', 'imoveis_especiais', 'parecer_analise']) {
    if (!report[key] || typeof report[key] !== 'object' || Array.isArray(report[key])) report[key] = {};
  }
  if (geo) report.memorial_descritivo_georreferenciamento = { ...report.memorial_descritivo_georreferenciamento, ...geo };

  for (const key of ['proprietarios_atuais', 'cadeia_dominial', 'onus_garantias_financeiras', 'indisponividades_e_penhoras',
    'usufruto_servidoes_e_direitos', 'averbacoes_diversas']) {
    if (!Array.isArray(report[key])) report[key] = [];
  }
  for (const key of ['onus_garantias_financeiras', 'indisponividades_e_penhoras', 'usufruto_servidoes_e_direitos']) {
    report[key] = report[key].filter((item: any) => item && typeof item === 'object');
    for (const item of report[key]) item.status = resolveLienStatus(item);
  }

  const parecer = report.parecer_analise;
  if (typeof parecer.score_risco !== 'number' || !Number.isFinite(parecer.score_risco)) {
    throw new IncompleteAnalysisError('O parecer veio sem a nota de risco. Tente analisar de novo.');
  }
  for (const key of ['riscos_identificados', 'pendencias_formais', 'regularidades_e_conformidade', 'certidoes_complementares_recomendadas']) {
    if (!Array.isArray(parecer[key])) parecer[key] = [];
  }

  const pontos: string[] = [];
  let score = Math.min(100, Math.max(0, Math.round(parecer.score_risco)));
  const floor = riskFloor(report);
  if (score < floor.minimum) {
    pontos.push(`A nota de risco foi elevada de ${score} para ${floor.minimum}: a leitura encontrou ${floor.reason}.`);
    score = floor.minimum;
  }
  const level = riskLevelFromScore(score);
  parecer.score_risco = score;
  parecer.nivel_risco = level;
  parecer.status_juridico = LEGAL_STATUS_BY_LEVEL[level];

  pontos.push(...verifyAgainstSource(report, meta.source));
  const indefinidos = [...report.onus_garantias_financeiras, ...report.indisponividades_e_penhoras]
    .filter((item: any) => item.status === 'INDEFINIDO');
  if (indefinidos.length > 0) {
    pontos.push(`${indefinidos.length} ônus aparece(m) como cancelado(s), mas sem o ato de cancelamento identificado. Confira na certidão.`);
  }
  // Sem número, proprietário, registro, averbação ou ônus, o arquivo não traz uma matrícula legível: em vez de uma nota
  // que pareceria resultado (a IA já deu 0 e 100 ao mesmo contrato de aluguel), o relatório fica "sem nota"
  const semDadosDeMatricula = !report.identificacao_geral.matricula && ['proprietarios_atuais', 'cadeia_dominial',
    'onus_garantias_financeiras', 'indisponividades_e_penhoras', 'usufruto_servidoes_e_direitos', 'averbacoes_diversas']
    .every(key => report[key].length === 0);
  if (semDadosDeMatricula) {
    parecer.score_risco = null;
    parecer.nivel_risco = 'INDEFINIDO';
    parecer.status_juridico = LEGAL_STATUS_BY_LEVEL.INDEFINIDO;
    pontos.unshift('Não encontramos os dados de uma certidão de matrícula neste arquivo (número, proprietários, registros ou averbações). '
      + 'Confira se enviou o documento certo e se o PDF está legível. Sem esses dados, não há nota de risco.');
  } else {
    if (report.proprietarios_atuais.length === 0) pontos.push('Nenhum proprietário atual foi identificado na leitura.');
    if (!report.identificacao_geral.matricula) pontos.push('O número da matrícula não foi identificado na leitura.');
  }
  if (meta.truncated || meta.ocrCut) {
    pontos.push('O documento é muito longo: parte do texto não foi analisada. Confira os atos diretamente na certidão.');
  }
  report.detector_inconsistencias = pontos;

  const models = [...new Set(meta.models.filter((m): m is string => Boolean(m)))];
  report._meta = {
    versao: PIPELINE_VERSION,
    gerado_em: new Date().toISOString(),
    modelos: models,
    modo_economico: models.some(m => m.includes('lite')),
    texto_truncado: meta.truncated || Boolean(meta.ocrCut),
    caracteres_omitidos: meta.omittedChars,
    caracteres_lidos: meta.source.length,
  };

  return report;
}
