/**
 * Leitura do relatório em um formato único para a tela e o PDF.
 * Aceita os nomes de campo atuais (definidos nos prompts do servidor) e os antigos
 * (relatórios salvos antes da versão 3 e a demonstração), sem inventar valores ausentes.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- o relatório vem da IA e tem forma livre */

export type LienStatus = 'ATIVO' | 'CANCELADO' | 'INDEFINIDO';
export type RiskLevel = 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO' | 'INDEFINIDO';

type Field = Record<string, any>;

const obj = (value: any): Field =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const arr = (value: any): any[] => (Array.isArray(value) ? value : []);
const first = (...values: any[]) => values.find(v => v !== undefined && v !== null && v !== '');

export function statusOf(item: any): LienStatus {
  const status = String(item?.status ?? '').trim().toUpperCase();
  if (status.startsWith('CANCEL') || status.includes('BAIXAD') || status.includes('QUITAD') || status.includes('EXTINT')) return 'CANCELADO';
  if (status === 'INDEFINIDO') return 'INDEFINIDO';
  return 'ATIVO';
}

export const isActiveStatus = (item: any) => statusOf(item) !== 'CANCELADO';

export function riskLevelFromScore(score: number | null): RiskLevel {
  if (score === null) return 'INDEFINIDO';
  if (score >= 75) return 'CRÍTICO';
  if (score >= 50) return 'ALTO';
  if (score >= 25) return 'MÉDIO';
  return 'BAIXO';
}

export const LEGAL_STATUS_BY_LEVEL: Record<RiskLevel, string> = {
  CRÍTICO: 'RESTRIÇÃO GRAVE',
  ALTO: 'RESTRIÇÃO ATIVA',
  MÉDIO: 'EM ANÁLISE / PENDÊNCIA',
  BAIXO: 'REGULAR',
  INDEFINIDO: 'NÃO AVALIADO',
};

// Texto de embargo que de fato descreve um embargo (e não uma frase de ausência)
export function describesEmbargo(value: any): boolean {
  if (!value || typeof value !== 'string') return Boolean(value && typeof value === 'object');
  return !/^\s*(n[ãa]o\s+(consta|h[áa]|identificad)|nenhum|inexist|sem\s+embargo)/i.test(value);
}

export function getReportView(report: any) {
  const ident0 = obj(report?.identificacao_geral);
  const carac0 = obj(report?.caracteristicas_fisicas);
  const geo0 = obj(report?.memorial_descritivo_georreferenciamento);
  const regimes0 = obj(report?.regimes_especiais);
  const ambiental0 = obj(first(report?.registro_ambiental, report?.registro_ambiental_recursos_hidricos));
  const especiais0 = obj(first(report?.imoveis_especiais, report?.imoveis_especiais_spu_marinha));
  const parecer = obj(report?.parecer_analise);
  const meta = obj(report?._meta);

  const ident: Field = { ...ident0, origem_transcricao: first(ident0.origem_transcricao, ident0.origem_transcricao_anterior) };
  const carac: Field = {
    ...carac0,
    area_construida: first(carac0.area_construida, carac0.area_construida_m2),
    area_privativa: first(carac0.area_privativa, carac0.area_privativa_m2),
    area_comum: first(carac0.area_comum, carac0.area_comum_m2),
  };
  const geo: Field = {
    ...geo0,
    situacao_certificacao: first(geo0.situacao_certificacao, geo0.status_sigef),
    codigo_car: first(geo0.codigo_car, geo0.car_registro),
    codigo_ccir: first(geo0.codigo_ccir, geo0.codigo_incra),
  };
  const regimes: Field = {
    ...regimes0,
    eh_condominio: first(regimes0.eh_condominio, regimes0.e_condominio_edilicio),
    eh_loteamento: first(regimes0.eh_loteamento, regimes0.e_loteamento),
    eh_reurb: first(regimes0.eh_reurb, regimes0.e_reurb),
  };
  const ambiental: Field = {
    ...ambiental0,
    embargos_ambientais: first(ambiental0.embargos_ambientais, ambiental0.area_embargada),
    reserva_legal_averbada: first(ambiental0.reserva_legal_averbada, regimes0.reserva_legal_averbada),
    area_preservacao_permanente_app: first(ambiental0.area_preservacao_permanente_app, regimes0.app_preservacao_permanente),
  };
  const especiais: Field = {
    ...especiais0,
    terra_indigena_quilombola: first(especiais0.terra_indigena_quilombola, especiais0.area_quilombola_indigena),
    laudemio: first(especiais0.laudemio, especiais0.laudemic_inscrito),
    faixa_dominio: first(especiais0.faixa_dominio, especiais0.faixa_nao_edificavel),
  };

  const proprietarios = arr(report?.proprietarios_atuais);
  const cadeia = arr(report?.cadeia_dominial);
  const garantias = arr(report?.onus_garantias_financeiras);
  const penhoras = arr(report?.indisponividades_e_penhoras);
  const direitos = arr(report?.usufruto_servidoes_e_direitos);
  const averbacoes = arr(report?.averbacoes_diversas);

  // Relatórios antigos guardavam só a lista combinada
  const onusTodos = garantias.length || penhoras.length ? [...garantias, ...penhoras] : arr(report?.onus_gravames_ativos);
  const onusAtivos = onusTodos.filter(isActiveStatus);
  const direitosAtivos = direitos.filter(isActiveStatus);

  const score = typeof parecer.score_risco === 'number' && Number.isFinite(parecer.score_risco)
    ? Math.min(100, Math.max(0, Math.round(parecer.score_risco)))
    : null;
  const nivelRisco = riskLevelFromScore(score);

  return {
    ident, carac, geo, regimes, ambiental, especiais, parecer, meta,
    proprietarios, cadeia, garantias, penhoras, direitos, direitosAtivos, averbacoes, onusTodos, onusAtivos,
    score,
    nivelRisco,
    statusJuridico: LEGAL_STATUS_BY_LEVEL[nivelRisco],
    temEmbargo: describesEmbargo(ambiental.embargos_ambientais),
    pontosParaConferir: arr(report?.detector_inconsistencias).filter((p: any) => typeof p === 'string'),
  };
}

export type ReportView = ReturnType<typeof getReportView>;
