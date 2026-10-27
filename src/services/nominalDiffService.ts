/**
 * Serviço de Auditoria Nominal e Cruzamento de Confrontantes — ValidaImóvel
 * 
 * Implementa a auditoria de rigor cartorário:
 * - Tolerância zero para nomes incompletos, invertidos ou com sobrenomes omitidos;
 * - Comparação simultânea de 7 fontes documentais;
 * - Dupla passagem (sentido inverso: memorial/matrículas -> planta);
 * - Gerador de pedido de matrículas faltantes para o Registro de Imóveis.
 */

export interface NeighborRow {
  id: string;
  trecho: string; // ex: V01–V02
  vertices?: string;
  lado?: string; // ex: Leste / Fundos
  tipo?: 'imovel' | 'via' | 'agua' | 'faixa' | 'posse' | 'outro';
  planta?: string;
  quadro?: string;
  memTexto?: string;
  memTabela?: string;
  matPrinc?: string;
  matConf?: string; // Titular atual comprovado pela certidão do confrontante
  matNum?: string; // Número da matrícula do confrontante
  assin?: string; // Nome de quem assinou a anuência
  doc?: string; // CPF/CNPJ
  obs?: string;
}

export interface NeighborIssue {
  level: 'err' | 'warn';
  message: string;
  column: string;
}

export interface NeighborComparisonResult {
  level: 'ok' | 'err' | 'warn';
  issues: NeighborIssue[];
  notes: string[];
}

export interface NeighborStats {
  totalTrechos: number;
  distinctPersons: number;
  countPlanta: number;
  countQuadro: number;
  countMemTexto: number;
  countMemTabela: number;
  countMatPrinc: number;
  countMatApres: number;
  countAssin: number;
  countOk: number;
  countErr: number;
  countWarn: number;
  nominalDivergences: number;
  missingTitles: NeighborRow[];
}

export const CONF_COLUMNS: [keyof NeighborRow, string][] = [
  ['planta', 'Planta (desenho/divisa)'],
  ['quadro', 'Planta (quadro/tabela)'],
  ['memTexto', 'Memorial (texto)'],
  ['memTabela', 'Memorial (tabela)'],
  ['matPrinc', 'Matrícula principal'],
  ['matConf', 'Matrícula do confrontante (titular)'],
  ['assin', 'Assinatura / anuência'],
];

export const nominalDiffService = {
  normalizeSpace(s?: string | null): string {
    return String(s || '').replace(/\s+/g, ' ').trim();
  },

  deaccent(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  tokens(s: string): string[] {
    return nominalDiffService.normalizeSpace(s).split(' ').filter(Boolean);
  },

  /**
   * Forma usada na comparação: sem pontuação solta e sem a ligação entre a designação e o nome.
   * "Lote 9 - PEDRO", "Lote 9, de PEDRO" e "Lote 9, de propriedade de PEDRO" viram "Lote 9 PEDRO".
   * Só cai a ligação logo depois de um número ou de pontuação: "ANA DA SILVA" e "Ana da Silva" continuam inteiros.
   */
  comparableName(s?: string | null): string {
    const out: string[] = [];
    let afterBreak = false;
    for (const tok of nominalDiffService.tokens(s || '')) {
      if (/^[-–—:,;/]+$/.test(tok)) {
        afterBreak = true;
        continue;
      }
      const word = tok.replace(/[,;:]+$/, '');
      if (afterBreak && (/^(de|do|da|dos|das|propriedade|pertencente)$/i.test(word) || /^(a|ao|aos|à|às)$/.test(word))) continue;
      out.push(word);
      afterBreak = word !== tok || /\d$/.test(word);
    }
    return out.join(' ');
  },

  classifyCell(val?: string | null): 'vazio' | 'naoapres' | 'ausente' | 'ilegivel' | 'naoloc' | 'na' | 'nome' {
    const s = nominalDiffService.normalizeSpace(val);
    if (!s) return 'vazio';
    const l = s.toLowerCase();
    if (l.startsWith('documento não apresentado')) return 'naoapres';
    if (l.startsWith('nome ausente')) return 'ausente';
    if (l.startsWith('conteúdo ilegível') || l.startsWith('ilegível')) return 'ilegivel';
    if (l.startsWith('confrontante não localizado') || l.startsWith('não localizado')) return 'naoloc';
    if (l.startsWith('não aplicável') || l === 'n/a') return 'na';
    return 'nome';
  },

  /**
   * Descreve com precisão cirúrgica a diferença entre dois nomes
   */
  describeDiff(ref: string, x: string, refName: string, xName: string): string {
    const A = nominalDiffService.tokens(ref);
    const B = nominalDiffService.tokens(x);
    const key = (t: string) => nominalDiffService.deaccent(t).toLowerCase().replace(/[.,;]$/, '');
    const kA = A.map(key);
    const kB = B.map(key);

    if (nominalDiffService.deaccent(ref).toLowerCase() === nominalDiffService.deaccent(x).toLowerCase()) {
      const diffs: string[] = [];
      A.forEach((t, i) => {
        if (B[i] && t.toLowerCase() !== B[i].toLowerCase()) diffs.push(`"${t}" × "${B[i]}"`);
      });
      return `Acentuação divergente: ${diffs.join(', ')}`;
    }

    const miss = A.filter((_, i) => !kB.includes(kA[i]));
    const extra = B.filter((_, i) => !kA.includes(kB[i]));
    const parts: string[] = [];

    if (miss.length > 0) parts.push(`${xName} omite ${miss.map(t => `"${t}"`).join(', ')}`);
    if (extra.length > 0) parts.push(`${xName} acrescenta ${extra.map(t => `"${t}"`).join(', ')}`);
    if (miss.length > 0 || extra.length > 0) {
      // Palavras presentes nos dois, mas com acento diferente ("FICTÍCIA" × "FICTICIA")
      const bare = (t: string) => t.toLowerCase().replace(/[.,;]$/, '');
      const accents = A.flatMap((t, i) => {
        const j = kB.indexOf(kA[i]);
        return j >= 0 && bare(B[j]) !== bare(t) ? [`"${t}" × "${B[j]}"`] : [];
      });
      if (accents.length > 0) parts.push(`acentuação diferente: ${accents.join(', ')}`);
    }

    if (miss.length === 0 && extra.length === 0) {
      parts.push(kA.join(' ') === kB.join(' ') ? 'Acentuação divergente' : 'Ordem dos nomes/sobrenomes invertida');
    }

    const abbr = B.filter(t => /^[A-ZÀ-Ú]\.?$/.test(t) || /^[A-Za-zÀ-ú]{1,4}\.$/.test(t));
    if (abbr.length > 0) parts.push(`abreviação sem comprovação documental (${abbr.join(' ')})`);

    return parts.join('; ') + ` (referência: ${refName})`;
  },

  /**
   * Compara uma linha da matriz de confrontantes.
   * Com allRows, as tabelas opcionais (quadro da planta, tabela do memorial) que não existem em nenhuma linha
   * não viram "campo não preenchido": o documento simplesmente não tem essa tabela.
   */
  compareRow(row: NeighborRow, allRows?: NeighborRow[]): NeighborComparisonResult {
    const out: NeighborComparisonResult = { level: 'ok', issues: [], notes: [] };
    const isImovel = !row.tipo || row.tipo === 'imovel';
    const absentTable = (colKey: keyof NeighborRow) =>
      Boolean(allRows) && (colKey === 'quadro' || colKey === 'memTabela') &&
      !allRows!.some(r => nominalDiffService.classifyCell(r[colKey] as string) === 'nome');

    const names = CONF_COLUMNS.filter(([colKey]) => {
      const val = row[colKey];
      return nominalDiffService.classifyCell(typeof val === 'string' ? val : '') === 'nome';
    });

    if (names.length === 0) {
      out.level = 'warn';
      out.issues.push({ level: 'warn', message: 'Nenhum nome transcrito para esta divisa', column: 'planta' });
      return out;
    }

    // A coluna de referência prioritária é a matrícula do confrontante (titular legal comprovado)
    let refCol: keyof NeighborRow = 'matConf';
    if (nominalDiffService.classifyCell(row.matConf) !== 'nome') {
      refCol = nominalDiffService.classifyCell(row.planta) === 'nome' ? 'planta' : names[0][0];
    }
    const refName = CONF_COLUMNS.find(c => c[0] === refCol)?.[1] || 'Referência';
    const refVal = nominalDiffService.normalizeSpace(row[refCol]);
    const refCmp = nominalDiffService.comparableName(refVal);

    for (const [colKey, colLabel] of CONF_COLUMNS) {
      if (colKey === refCol) continue;
      const rawVal = typeof row[colKey] === 'string' ? (row[colKey] as string) : '';
      const kind = nominalDiffService.classifyCell(rawVal);

      if (kind === 'nome') {
        const valClean = nominalDiffService.normalizeSpace(rawVal);
        if (refVal === valClean) continue;
        const valCmp = nominalDiffService.comparableName(valClean);
        if (refCmp === valCmp) {
          out.notes.push(`Mesmo nome em ${colLabel}, escrito com outra pontuação ou ligação ("de", "do")`);
          continue;
        }
        if (refCmp.toLowerCase() === valCmp.toLowerCase()) {
          out.notes.push(`Diferença de maiúsculas/minúsculas em ${colLabel}`);
          continue;
        }
        out.level = 'err';
        out.issues.push({
          level: 'err',
          message: `${colLabel}: "${valClean}" — ${nominalDiffService.describeDiff(refCmp, valCmp, refName, colLabel)}`,
          column: colKey,
        });
      } else if (kind === 'ausente') {
        out.level = 'err';
        out.issues.push({
          level: 'err',
          message: `${colLabel}: nome ausente no documento (consta "${refVal}" em ${refName})`,
          column: colKey,
        });
      } else if (kind === 'naoloc') {
        out.level = 'err';
        out.issues.push({ level: 'err', message: `${colLabel}: confrontante não localizado`, column: colKey });
      } else if (kind === 'ilegivel') {
        if (out.level !== 'err') out.level = 'warn';
        out.issues.push({ level: 'warn', message: `${colLabel}: conteúdo ilegível`, column: colKey });
      } else if (kind === 'naoapres') {
        if (out.level !== 'err') out.level = 'warn';
        out.issues.push({
          level: 'warn',
          message: `${colLabel}: documento não apresentado — conferência não realizada`,
          column: colKey,
        });
      } else if (kind === 'vazio') {
        if (!isImovel && (colKey === 'matConf' || colKey === 'assin' || colKey === 'matPrinc')) continue;
        if (absentTable(colKey)) continue;
        if (out.level !== 'err') out.level = 'warn';
        out.issues.push({ level: 'warn', message: `${colLabel}: campo não preenchido`, column: colKey });
      }
    }

    if (isImovel && !nominalDiffService.normalizeSpace(row.matNum)) {
      if (out.level !== 'err') out.level = 'warn';
      out.issues.push({
        level: 'warn',
        message: 'Número da matrícula do confrontante não identificado',
        column: 'matConf',
      });
    }

    if (row.tipo === 'posse') {
      out.notes.push('Área de posse — exigir prova de posse e anuência dos possuidores confinantes');
    } else if (['via', 'agua', 'faixa'].includes(row.tipo || '')) {
      out.notes.push(
        'Confrontante público/natural — verificar declaração de respeito às faixas de domínio público (art. 974, §9º CN)'
      );
    }

    return out;
  },

  /**
   * Gera métricas consolidadas dos confrontantes
   */
  calculateStats(rows: NeighborRow[]): NeighborStats {
    const hasName = (r: NeighborRow, k: keyof NeighborRow) =>
      nominalDiffService.classifyCell(typeof r[k] === 'string' ? r[k] : '') === 'nome';

    const evaluated = rows.map(r => nominalDiffService.compareRow(r, rows));
    const uniquePersons = new Set(
      rows
        .map(r => nominalDiffService.normalizeSpace(r.matConf || r.planta || r.memTexto).toLowerCase())
        .filter(Boolean)
    );

    const missingTitles = rows.filter(
      r =>
        (!r.tipo || r.tipo === 'imovel') &&
        (nominalDiffService.classifyCell(r.matConf) !== 'nome' || !nominalDiffService.normalizeSpace(r.matNum))
    );

    return {
      totalTrechos: rows.length,
      distinctPersons: uniquePersons.size,
      countPlanta: rows.filter(r => hasName(r, 'planta')).length,
      countQuadro: rows.filter(r => hasName(r, 'quadro')).length,
      countMemTexto: rows.filter(r => hasName(r, 'memTexto')).length,
      countMemTabela: rows.filter(r => hasName(r, 'memTabela')).length,
      countMatPrinc: rows.filter(r => hasName(r, 'matPrinc')).length,
      countMatApres: rows.filter(r => hasName(r, 'matConf') && nominalDiffService.normalizeSpace(r.matNum)).length,
      countAssin: rows.filter(r => hasName(r, 'assin')).length,
      countOk: evaluated.filter(e => e.level === 'ok').length,
      countErr: evaluated.filter(e => e.level === 'err').length,
      countWarn: evaluated.filter(e => e.level === 'warn').length,
      nominalDivergences: evaluated.reduce(
        (sum, e) => sum + e.issues.filter(i => i.level === 'err').length,
        0
      ),
      missingTitles,
    };
  },

  /**
   * Segunda Passagem (Sentido Inverso):
   * Analisa partindo das fontes registrais e das anuências em direção à planta gráfica.
   * requireNeighborTitles = false quando o procedimento não exige matrícula/anuência dos vizinhos.
   */
  runSecondPass(rows: NeighborRow[], options: { requireNeighborTitles?: boolean } = {}): string[] {
    const alerts: string[] = [];
    const requireNeighborTitles = options.requireNeighborTitles ?? true;
    // Texto corrido x tabela do memorial só se compara quando o memorial tem as duas formas
    const hasSource = (k: keyof NeighborRow) => rows.some(r => nominalDiffService.classifyCell(r[k] as string) === 'nome');
    const memHasText = hasSource('memTexto');
    const memHasTable = hasSource('memTabela');

    rows.forEach(r => {
      const label = `${r.trecho || 'Trecho sem identificação'} (${r.lado || 'lado ?'}): "${nominalDiffService.normalizeSpace(r.matConf || r.planta || r.memTexto)}"`;
      const inPlanta =
        nominalDiffService.classifyCell(r.planta) === 'nome' ||
        nominalDiffService.classifyCell(r.quadro) === 'nome';

      const othersPresent = (['memTexto', 'memTabela', 'matPrinc', 'matConf', 'assin'] as (keyof NeighborRow)[]).filter(
        k => nominalDiffService.classifyCell(typeof r[k] === 'string' ? r[k] : '') === 'nome'
      );

      if (!inPlanta && othersPresent.length > 0) {
        alerts.push(
          `❌ ${label}: consta no memorial/matrícula/anuência, mas foi esquecido no desenho da planta topográfica.`
        );
      }

      if (
        memHasText &&
        nominalDiffService.classifyCell(r.memTabela) === 'nome' &&
        nominalDiffService.classifyCell(r.memTexto) !== 'nome'
      ) {
        alerts.push(`❌ ${label}: consta na tabela do memorial, mas não no texto corrido.`);
      }

      if (
        memHasTable &&
        nominalDiffService.classifyCell(r.memTexto) === 'nome' &&
        nominalDiffService.classifyCell(r.memTabela) !== 'nome'
      ) {
        alerts.push(`❌ ${label}: consta no texto corrido do memorial, mas ausente na tabela técnica.`);
      }

      if (
        nominalDiffService.classifyCell(r.assin) === 'nome' &&
        nominalDiffService.classifyCell(r.matConf) === 'nome' &&
        nominalDiffService.normalizeSpace(r.assin).toLowerCase() !==
          nominalDiffService.normalizeSpace(r.matConf).toLowerCase()
      ) {
        alerts.push(
          `❌ ${label}: assinatura de anuência por "${nominalDiffService.normalizeSpace(r.assin)}", diferente do titular registral "${nominalDiffService.normalizeSpace(r.matConf)}" — necessária comprovação por procuração pública, inventário ou certidão de óbito.`
        );
      }

      if (requireNeighborTitles && (!r.tipo || r.tipo === 'imovel') && nominalDiffService.classifyCell(r.matConf) !== 'nome') {
        alerts.push(`⚠ ${label}: confrontante indicado sem certidão de matrícula apresentada.`);
      }
    });

    return alerts;
  },

  /**
   * Gera a minuta formal de requerimento de certidões para o Cartório
   */
  generateRegistryPetition(rows: NeighborRow[]): string {
    const stats = nominalDiffService.calculateStats(rows);
    const missingNames = [
      ...new Set(
        stats.missingTitles
          .map(r =>
            nominalDiffService.normalizeSpace(
              nominalDiffService.classifyCell(r.matConf) === 'nome'
                ? r.matConf
                : r.planta || r.memTexto || r.memTabela
            )
          )
          .filter(Boolean)
      ),
    ];

    if (missingNames.length === 0) return '';

    const listText =
      missingNames.length === 1
        ? `"${missingNames[0]}"`
        : missingNames.slice(0, -1).map(n => `"${n}"`).join(', ') +
          ' e "' +
          missingNames[missingNames.length - 1] +
          '"';

    return `Para conferência registral completa e amarração de divisas, é obrigatório solicitar ao Registro de Imóveis as certidões atualizadas dos confrontantes: ${listText}, conforme indicado na planta e no memorial descritivo.`;
  },
};
