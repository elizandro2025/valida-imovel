/**
 * Conferência automática de projetos por IA.
 *
 * Fluxo: o usuário envia planta, memorial, matrículas e documentos das partes → cada arquivo é lido por OCR →
 * uma única chamada de IA estrutura tudo (dados gerais, planta × memorial, confrontantes em 7 fontes, coordenadas,
 * checklists e inconsistências) → os motores determinísticos (geodesia, matriz nominal, bloqueio de parecer positivo)
 * calculam o que pode ser calculado. A IA só LÊ e RESPONDE; o veredito final nunca vem dela.
 *
 * Antialucinação: todo dado transcrito pela IA é conferido com o texto lido (OCR); o que não aparece nos documentos
 * vira pendência "conferir manualmente" em vez de entrar como fato.
 */
import { AIServiceError, aiClient, fileToBase64 } from './aiClient';
import { IncompleteAnalysisError, numberAppearsIn, parseAIJson } from '@/lib/reportNormalizer';
import {
  ANALISES_SECTIONS, PM_COMPARE_FIELDS, ProjectData, ProjectDocItem, computeAutomaticOpinion, consolidateIssues, projectConferenceService,
} from './projectConferenceService';
import { ChecklistAnswer, ChecklistStatus, PROCEDURE_CHECKLISTS } from './projectChecklists';
import { NeighborRow } from './nominalDiffService';

export const PROJECT_DOC_TYPES = [
  'Planta', 'Memorial', 'Matrícula Principal', 'Matrículas Confrontantes', 'Responsabilidade Técnica',
  'Documentos Pessoais', 'Documento Rural', 'Certidão Municipal', 'Requerimento', 'Anuência', 'Outro',
] as const;

export interface ProjectUploadFile {
  id: string;
  file: File;
  tipo: string;
}

export type ProjectProgress = (step: string, progress: number) => void;

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_FILES = 12;
const MAX_TOTAL_CHARS = 380_000;
const OCR_CONCURRENCY = 3;
const PROJECT_KEYS = ['info', 'docs', 'pm', 'neighbors', 'polygon', 'checklists', 'inconsistencias', 'resumo'];
const STATUSES: ChecklistStatus[] = ['CONFORME', 'DIVERGENTE', 'PENDENTE', 'NÃO APLICÁVEL', 'NÃO VERIFICÁVEL'];

// ─── Arquivos ────────────────────────────────────────────────────────────────
export function guessDocType(name: string): string {
  const n = name.toLowerCase();
  if (/confront|vizinh/.test(n) && /matr|certid/.test(n)) return 'Matrículas Confrontantes';
  if (/memorial/.test(n)) return 'Memorial';
  if (/planta|topograf|levantamento|georref/.test(n)) return 'Planta';
  if (/matr[ií]cula|certid[aã]o.*(im[oó]vel|[oô]nus|inteiro)|\bmat\b/.test(n)) return 'Matrícula Principal';
  if (/\b(art|rrt|trt)\b|responsabilidade/.test(n)) return 'Responsabilidade Técnica';
  if (/ccir|\bcar\b|\bitr\b|incra/.test(n)) return 'Documento Rural';
  if (/anu[eê]ncia/.test(n)) return 'Anuência';
  if (/requerimento/.test(n)) return 'Requerimento';
  if (/\brg\b|cpf|cnh|casamento|nascimento|estado.?civil|procura/.test(n)) return 'Documentos Pessoais';
  if (/alvar|habite|municipal|prefeitura|iptu/.test(n)) return 'Certidão Municipal';
  return 'Outro';
}

export function validateProjectFile(file: File): string | null {
  if (/\.(kmz|xlsx|xls|ods|docx|shp|dwg)$/i.test(file.name)) {
    return `"${file.name}": formato não lido diretamente. Exporte para PDF (documentos), ou para CSV/TXT/KML (coordenadas). Para planilhas, use "Salvar como CSV".`;
  }
  if (!/\.(pdf|png|jpe?g|txt|csv|tsv|kml|dxf|xml)$/i.test(file.name)) {
    return `"${file.name}": envie em PDF, PNG, JPG, TXT, CSV, KML ou DXF.`;
  }
  if (file.size > MAX_FILE_BYTES) return `"${file.name}" tem mais de 15 MB. Gere o arquivo novamente com resolução menor.`;
  return null;
}

// Arquivos de texto (coordenadas, tabelas, KML, DXF) não precisam de OCR: vão direto para a análise
const isTextFile = (file: File) => /\.(txt|csv|tsv|kml|dxf|xml)$/i.test(file.name);

export const PROJECT_LIMITS = { maxFiles: MAX_FILES };

let uploadCounter = 0;

// Junta arquivos à lista da leitura com IA (tela de envio, aba de leitura, aba de documentos e Hub): valida formato e
// tamanho, sugere o tipo pelo nome e respeita o limite de arquivos. Os problemas voltam em português para a tela.
export function appendUploadFiles(current: ProjectUploadFile[], incoming: File[]): { files: ProjectUploadFile[]; problems: string[] } {
  const problems: string[] = [];
  const added: ProjectUploadFile[] = [];
  incoming.forEach(file => {
    const problem = validateProjectFile(file);
    if (problem) problems.push(problem);
    else added.push({ id: `up-${Date.now()}-${++uploadCounter}`, file, tipo: guessDocType(file.name) });
  });
  let files = [...current, ...added];
  if (files.length > MAX_FILES) {
    problems.push(`Limite de ${MAX_FILES} arquivos por conferência.`);
    files = files.slice(0, MAX_FILES);
  }
  return { files, problems };
}

const ocrCache = new Map<string, { text: string; model: string | null }>();

async function ocrFile(file: File): Promise<{ text: string; model: string | null }> {
  const key = `${file.name}|${file.size}|${file.lastModified}`;
  const hit = ocrCache.get(key);
  if (hit) return hit;
  if (isTextFile(file)) {
    // Arquivos de texto às vezes trazem bytes nulos, que quebrariam o JSON enviado à IA
    const text = (await file.text()).split('\0').join('');
    const value = { text: `--- Página 1 ---\n${text}`, model: null };
    ocrCache.set(key, value);
    return value;
  }
  const result = await aiClient.ocr(await fileToBase64(file), 'projeto');
  const value = { text: result.text, model: result.model };
  ocrCache.set(key, value);
  return value;
}

async function mapPool<T, R>(items: T[], size: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }));
  return out;
}

// ─── Pacote enviado à IA ─────────────────────────────────────────────────────
export function buildChecklistBlock(procedimentos: string[]): string {
  return procedimentos
    .map(key => PROCEDURE_CHECKLISTS.find(c => c.key === key))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map(c => `[${c.key}] ${c.name}\n${c.items.map(i => `- ${i.id}: ${i.text}`).join('\n')}`)
    .join('\n\n');
}

export function buildBundle(
  docs: { name: string; tipo: string; text: string }[],
  procedimentos: string[],
  options: { observacoes?: string; modoMax?: boolean } = {},
): string {
  const perDoc = Math.max(8_000, Math.floor(MAX_TOTAL_CHARS / Math.max(docs.length, 1)));
  const body = docs
    .map(d => {
      const text = d.text.length > perDoc
        ? `${d.text.slice(0, Math.floor(perDoc * 0.6))}\n[... trecho do meio omitido por tamanho ...]\n${d.text.slice(d.text.length - Math.floor(perDoc * 0.4))}`
        : d.text;
      return `=== DOCUMENTO: ${d.tipo} — ${d.name} ===\n${text}`;
    })
    .join('\n\n');
  const header = [
    `PROCEDIMENTOS SOLICITADOS: ${procedimentos.join(', ') || 'não informado'}`,
    options.modoMax ? 'MODO CONFERÊNCIA MÁXIMA: ATIVADO' : '',
    options.observacoes?.trim() ? `OBSERVAÇÕES DO CONFERENTE (apenas contexto):\n${options.observacoes.trim().slice(0, 2000)}` : '',
  ].filter(Boolean).join('\n');
  return `${header}\n\n${body}\n\nCHECKLISTS A RESPONDER:\n${buildChecklistBlock(procedimentos)}`;
}

// ─── Saneamento da resposta ──────────────────────────────────────────────────
type Raw = Record<string, unknown>;
const asObj = (v: unknown): Raw => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Raw) : {});
const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function str(v: unknown, max = 800): string {
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v !== 'string') return '';
  const s = v.replace(/\s+/g, ' ').trim();
  return ['null', 'undefined', 'n/a', 'não consta'].includes(s.toLowerCase()) ? '' : s.slice(0, max);
}

const normLoose = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const normExact = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

function coordsText(v: unknown): string {
  if (typeof v === 'string') return v.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean).slice(0, 2000).join('\n');
  return asArr(v)
    .map(row => {
      const r = asObj(row);
      return [str(r.vertice ?? r.id, 30), str(r.x ?? r.e ?? r.lon ?? r.longitude, 30), str(r.y ?? r.n ?? r.lat ?? r.latitude, 30)].filter(Boolean).join(' ');
    })
    .filter(Boolean)
    .join('\n');
}

const PRIO = (v: unknown): 'Alta' | 'Média' | 'Baixa' => (v === 'Baixa' || v === 'Média' || v === 'Alta' ? v : 'Média');

export interface MergeInput {
  base: ProjectData;
  ai: Record<string, unknown>;
  files: { id: string; name: string; tipo: string; text: string }[];
  procedimentos: string[];
  model: string | null;
}

// Junta a resposta da IA ao projeto (sem executar nenhuma chamada de rede — testável)
export function mergeAiResult({ base, ai, files, procedimentos, model }: MergeInput): ProjectData {
  const notas: string[] = [];
  const source = files.map(f => f.text).join('\n');
  const looseSource = normLoose(source);
  const exactSource = normExact(source);
  const warnings: ProjectData['manualIssues'] = [];

  const warn = (local: string, valor: string, tipoCampo: 'nome' | 'numero') => {
    if (!valor) return;
    const ok = tipoCampo === 'numero' ? numberAppearsIn(source, valor) : looseSource.includes(normLoose(valor));
    if (!ok) {
      warnings.push({
        id: `ia-chk-${warnings.length}`, tipo: 'pend', cat: 'Leitura por IA', local,
        erro: `O valor "${valor}" lido pela IA não foi localizado literalmente nos documentos enviados.`,
        risco: 'Dado possivelmente interpretado incorretamente; pode gerar falso resultado na conferência.',
        prio: 'Alta', prov: 'Conferir o dado manualmente no documento original e corrigir o campo.', origem: 'ia',
      });
    } else if (tipoCampo === 'nome' && !exactSource.includes(normExact(valor))) {
      warnings.push({
        id: `ia-chk-${warnings.length}`, tipo: 'pend', cat: 'Leitura por IA', local,
        erro: `A grafia "${valor}" (acentos, abreviações ou pontuação) pode ter sido normalizada pela IA em relação ao documento.`,
        risco: 'Diferenças de grafia são motivo de exigência: a conferência nominal exige a grafia exata de cada fonte.',
        prio: 'Média', prov: 'Conferir a grafia exata no documento original e ajustar o campo.', origem: 'ia',
      });
    }
  };

  // Dados gerais — a IA só preenche o que estiver vazio (respeita o que o conferente já digitou)
  const aiInfo = asObj(ai.info);
  const info = { ...base.info };
  const fill = (k: 'nome' | 'cliente' | 'matricula' | 'cartorio' | 'municipio' | 'comarca' | 'uf' | 'rt' | 'prof' | 'reg' | 'art') => {
    if (!info[k]) info[k] = str(aiInfo[k], 200);
  };
  (['nome', 'cliente', 'matricula', 'cartorio', 'municipio', 'comarca', 'uf', 'rt', 'prof', 'reg', 'art'] as const).forEach(fill);
  if (!info.natureza && (aiInfo.natureza === 'urbano' || aiInfo.natureza === 'rural')) info.natureza = aiInfo.natureza;
  info.procedimentos = procedimentos;
  const suggested = asArr(aiInfo.procedimentos).map(p => str(p, 30)).filter(p => PROCEDURE_CHECKLISTS.some(c => c.key === p) && !procedimentos.includes(p));
  if (suggested.length) notas.push(`Os documentos também sugerem o(s) procedimento(s): ${suggested.join(', ')}. Marque-os e execute novamente para obter o checklist.`);
  warn('Matrícula objeto', info.matricula, 'numero');
  warn('ART / RRT / TRT', info.art, 'numero');
  warn('Responsável técnico', info.rt, 'nome');

  // Documentos: um item por arquivo enviado + exigidos que não vieram
  const aiDocs = asArr(ai.docs).map(asObj);
  const docs: ProjectDocItem[] = files.map((f, i) => {
    const match = aiDocs.find(d => normLoose(str(d.nome)) && (normLoose(f.name).includes(normLoose(str(d.nome))) || normLoose(str(d.nome)).includes(normLoose(f.name.replace(/\.[^.]+$/, '')))));
    const aiStatus = str(match?.status);
    const unreadable = f.text.trim().length < 100;
    const status: ProjectDocItem['status'] = unreadable || aiStatus === 'Ilegível' ? 'Ilegível' : aiStatus === 'Incompleto' ? 'Incompleto' : 'Recebido';
    const pages = (f.text.match(/---\s*P[aá]gina\s+\d+/gi) || []).length;
    return { id: `doc-ia-${i}`, nome: f.name, tipo: f.tipo, status, paginas: pages ? String(pages) : '', obs: str(match?.obs, 300) };
  });
  const sentTypes = new Set(files.map(f => f.tipo));
  projectConferenceService.getExpectedDocuments(procedimentos, info.natureza).forEach(exp => {
    if (!sentTypes.has(exp.tipo)) docs.push(exp);
  });

  // Planta × Memorial
  const aiPm = asObj(ai.pm);
  const pm: ProjectData['pm'] = {};
  PM_COMPARE_FIELDS.forEach(f => {
    const row = asObj(aiPm[f.key]);
    const planta = str(row.planta, 400);
    const memorial = str(row.memorial, 400);
    if (!planta && !memorial) return;
    pm[f.key] = { planta, memorial };
    const kind = f.isNumeric || ['matr', 'cpfp', 'art', 'reg', 'cns'].includes(f.key) ? 'numero' : 'nome';
    if (['area', 'perim', 'nvert', 'matr', 'cpfp', 'art', 'reg', 'cns', 'prop', 'rt', 'mun', 'comarca'].includes(f.key)) {
      warn(`${f.label} (planta)`, planta, kind);
      warn(`${f.label} (memorial)`, memorial, kind);
    }
  });

  // Confrontantes (7 fontes)
  const neighbors: NeighborRow[] = asArr(ai.neighbors).map((raw, i) => {
    const r = asObj(raw);
    const tipo = str(r.tipo, 10);
    const row: NeighborRow = {
      id: `viz-ia-${i}`,
      trecho: str(r.trecho, 60), vertices: str(r.vertices, 60), lado: str(r.lado, 60),
      tipo: (['imovel', 'via', 'agua', 'faixa', 'posse', 'outro'] as const).find(t => t === tipo),
      planta: str(r.planta, 200), quadro: str(r.quadro, 200), memTexto: str(r.memTexto, 200), memTabela: str(r.memTabela, 200),
      matPrinc: str(r.matPrinc, 200), matConf: str(r.matConf, 200), matNum: str(r.matNum, 40),
      assin: str(r.assin, 200), doc: str(r.doc, 40), obs: str(r.obs, 300),
    };
    (['planta', 'quadro', 'memTexto', 'memTabela', 'matPrinc', 'matConf', 'assin'] as const).forEach(k => warn(`Confrontante ${row.trecho || i + 1} — ${k}`, row[k] || '', 'nome'));
    warn(`Confrontante ${row.trecho || i + 1} — matrícula`, row.matNum || '', 'numero');
    return row;
  });

  // Poligonal
  const aiPoly = asObj(ai.polygon);
  const polygon = { ...base.polygon };
  const coords = coordsText(aiPoly.coords);
  if (coords) {
    polygon.rawCoords = coords;
    polygon.isGeo = aiPoly.isGeo === true;
    polygon.order = aiPoly.order === 'NE' ? 'NE' : 'EN';
  }
  polygon.areaPlanta = str(aiPoly.areaPlanta, 40) || polygon.areaPlanta;
  polygon.areaMemorial = str(aiPoly.areaMemorial, 40) || polygon.areaMemorial;
  polygon.perimPlanta = str(aiPoly.perimPlanta, 40) || polygon.perimPlanta;
  polygon.perimMemorial = str(aiPoly.perimMemorial, 40) || polygon.perimMemorial;
  const declared: ProjectData['polygon']['declaredSegments'] = {};
  asArr(aiPoly.segmentos).forEach(raw => {
    const s = asObj(raw);
    const from = str(s.de, 20); const to = str(s.para, 20);
    if (!from || !to) return;
    const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
    declared[`${from}>${to}`] = {
      distPlanta: num(s.distPlanta), distMemorial: num(s.distMemorial),
      azPlanta: str(s.azPlanta, 30) || undefined, azMemorial: str(s.azMemorial, 30) || undefined,
    };
  });
  if (Object.keys(declared).length) polygon.declaredSegments = declared;
  if (!coords) notas.push('Nenhuma tabela de coordenadas foi identificada nos documentos: o cálculo da poligonal não foi executado.');

  // Checklists — só ids existentes e status válidos
  const aiChecks = asObj(ai.checklists);
  const checklists: ProjectData['checklists'] = {};
  procedimentos.forEach(key => {
    const checklist = PROCEDURE_CHECKLISTS.find(c => c.key === key);
    if (!checklist) return;
    const answers = asObj(aiChecks[key]);
    const out: Record<string, ChecklistAnswer> = {};
    checklist.items.forEach(item => {
      const a = asObj(answers[item.id]);
      const status = STATUSES.find(s => s === a.status);
      if (!status) return;
      const evidence = str(a.evidence, 500);
      if (status === 'CONFORME' && !evidence) {
        // Sem evidência citada, "conforme" não é aceito: vira não verificável
        out[item.id] = { status: 'NÃO VERIFICÁVEL', evidence: '', correction: 'A IA marcou como conforme sem citar a evidência. Indique o documento e a localização.' };
        return;
      }
      out[item.id] = { status, evidence, correction: str(a.correction, 500) };
    });
    checklists[key] = out;
  });

  // Inconsistências apontadas pela IA, por documento
  const issues: ProjectData['manualIssues'] = asArr(ai.inconsistencias).map((raw, i) => {
    const r = asObj(raw);
    return {
      id: `ia-${i}`, tipo: (r.tipo === 'div' ? 'div' : 'pend') as 'div' | 'pend', cat: str(r.documento, 120) || 'Geral', local: str(r.local, 200),
      erro: str(r.erro, 700), risco: str(r.risco, 400), prio: PRIO(r.prio), prov: str(r.prov, 500), origem: 'ia' as const,
    };
  }).filter(i => i.erro);

  // Matriz de amarração
  const amarracoes: ProjectData['amarracoes'] = asArr(ai.amarracoes).map((raw, i) => {
    const r = asObj(raw);
    const st = str(r.status, 30).toUpperCase();
    const mat = str(r.mat, 40);
    warn(`Amarração ${i + 1} — matrícula`, mat, 'numero');
    return {
      id: `am-ia-${i}`, seg: str(r.seg, 80), mat, descObj: str(r.descObj, 600), descConf: str(r.descConf, 600), comp: str(r.comp, 800),
      status: ['COMPATÍVEL', 'DIVERGENTE', 'NÃO VERIFICÁVEL'].includes(st) ? st : '',
      prioridade: PRIO(r.prioridade), providencia: str(r.providencia, 500), critico: r.critico === true,
    };
  });

  // Análises descritivas por seção
  const aiAnal = asObj(ai.analises);
  const analises: Record<string, string> = { ...(base.analises || {}) };
  ANALISES_SECTIONS.forEach(s => {
    const text = typeof aiAnal[s.key] === 'string' ? (aiAnal[s.key] as string).trim().slice(0, 6000) : '';
    if (text) analises[s.key] = text;
  });

  const resumo = str(ai.resumo, 1500);
  return {
    ...base,
    info, docs, pm, neighbors, polygon, checklists, amarracoes, analises,
    manualIssues: [...base.manualIssues.filter(m => m.origem !== 'ia'), ...issues, ...warnings],
    parecer: { ...base.parecer, resumo: base.parecer.resumo || resumo },
    ai: {
      ranAt: new Date().toISOString(),
      files: files.map(f => ({ name: f.name, tipo: f.tipo, chars: f.text.length, legivel: f.text.trim().length >= 100 })),
      resumo, model, notas,
    },
  };
}

// ─── Execução ────────────────────────────────────────────────────────────────
async function runProjectTask(text: string) {
  try {
    const result = await aiClient.task('projeto', text);
    return { data: parseAIJson(result.text, PROJECT_KEYS), model: result.model };
  } catch (error) {
    if (!(error instanceof IncompleteAnalysisError)) throw error;
    const result = await aiClient.task('projeto', text); // a IA às vezes omite uma seção: repete uma vez
    return { data: parseAIJson(result.text, PROJECT_KEYS), model: result.model };
  }
}

export async function runProjectConference(
  input: { files: ProjectUploadFile[]; procedimentos: string[]; base: ProjectData; observacoes?: string },
  onProgress?: ProjectProgress,
): Promise<ProjectData> {
  const { files, base } = input;
  const procedimentos = input.procedimentos.length ? input.procedimentos : ['retificacao'];
  if (files.length === 0) throw new AIServiceError('Envie ao menos um documento (planta, memorial ou matrícula).');
  if (files.length > MAX_FILES) throw new AIServiceError(`Envie no máximo ${MAX_FILES} arquivos por conferência.`);
  const invalid = files.map(f => validateProjectFile(f.file)).find(Boolean);
  if (invalid) throw new AIServiceError(invalid);

  let done = 0;
  const read = await mapPool(files, OCR_CONCURRENCY, async f => {
    onProgress?.(`Lendo ${f.file.name}...`, 5 + Math.round((done / files.length) * 55));
    const result = await ocrFile(f.file);
    done++;
    onProgress?.(`Lido: ${f.file.name}`, 5 + Math.round((done / files.length) * 55));
    return { id: f.id, name: f.file.name, tipo: f.tipo, text: result.text, model: result.model };
  });

  onProgress?.('Cruzando planta, memorial, matrículas e documentos das partes...', 65);
  const { data, model } = await runProjectTask(
    buildBundle(read, procedimentos, { observacoes: input.observacoes, modoMax: base.info.modoMax }),
  );

  onProgress?.('Conferindo os dados lidos com os documentos...', 90);
  const merged = mergeAiResult({ base, ai: data, files: read, procedimentos, model });
  onProgress?.('Conferência concluída.', 100);
  return merged;
}

// Resumo enxuto da conferência enviado ao assistente (não inclui o texto bruto dos documentos)
export function buildQuestionContext(data: ProjectData): string {
  const issues = consolidateIssues(data).slice(0, 120);
  const { opinion } = computeAutomaticOpinion(data);
  return JSON.stringify({
    parecer_calculado: opinion,
    projeto: data.info,
    documentos: data.docs.map(d => ({ nome: d.nome, tipo: d.tipo, status: d.status })),
    planta_x_memorial: data.pm,
    confrontantes: data.neighbors,
    poligonal: { areaPlanta: data.polygon.areaPlanta, areaMemorial: data.polygon.areaMemorial, perimPlanta: data.polygon.perimPlanta, perimMemorial: data.polygon.perimMemorial },
    amarracoes: data.amarracoes,
    inconsistencias: issues,
    analises: data.analises,
  }).slice(0, 58_000);
}

// Pergunta complementar sobre a conferência já feita
export async function askAboutProject(question: string, data: ProjectData): Promise<string> {
  const result = await aiClient.chat(question, buildQuestionContext(data), 'projeto');
  try {
    const answer = parseAIJson(result.text, ['resposta']).resposta;
    return typeof answer === 'string' && answer.trim() ? answer : result.text;
  } catch {
    return result.text;
  }
}
