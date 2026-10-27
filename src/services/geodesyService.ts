/**
 * Serviço Geodésico e Topográfico — ValidaImóvel
 * 
 * Cálculos em UTM SIRGAS 2000 (elipsoide GRS80/WGS84),
 * cálculo de área (Fórmula de Gauss / Shoelace), perímetro,
 * azimutes, fechamento de poligonal, sentido horário (NBR 17047/2022)
 * e teste geométrico de autointerseção.
 */
import { parseBrNumber } from '@/lib/brNumber';

export interface Vertex {
  id: string;
  E: number;
  N: number;
  lat?: number;
  lon?: number;
  line: number;
}

export interface CalculatedSegment {
  index: number;
  fromId: string;
  toId: string;
  key: string;
  distance: number;
  azimuth: number;
  azimuthDms: string;
  declaredDistPlanta?: number;
  declaredDistMemorial?: number;
  declaredAzPlanta?: number;
  declaredAzMemorial?: number;
  results: { status: 'ok' | 'err' | 'warn'; message: string }[];
}

export interface PolygonCalculationResult {
  vertices: Vertex[];
  segments: CalculatedSegment[];
  areaM2: number;
  areaHa: number;
  perimeter: number;
  isClockwise: boolean;
  isValid: boolean;
  notes: { type: 'ok' | 'warn' | 'err' | 'info'; text: string }[];
  issues: { type: 'err' | 'warn' | 'ok'; text: string }[];
}

export const geodesyService = {
  /**
   * Converte Latitude e Longitude para coordenadas UTM planas SIRGAS 2000
   */
  toUTM(lat: number, lon: number, targetZone?: number): { E: number; N: number; zone: number } {
    const a = 6378137.0; // Semieixo maior
    const f = 1 / 298.257222101; // Achatamento
    const k0 = 0.9996; // Fator de escala no MC
    const e2 = f * (2 - f);
    const ep2 = e2 / (1 - e2);

    const zone = targetZone || Math.floor((lon + 180) / 6) + 1;
    const phi = (lat * Math.PI) / 180;
    const lam = (lon * Math.PI) / 180;
    const lam0 = (((zone - 1) * 6 - 180 + 3) * Math.PI) / 180;

    const N_radius = a / Math.sqrt(1 - e2 * Math.sin(phi) ** 2);
    const T = Math.tan(phi) ** 2;
    const C = ep2 * Math.cos(phi) ** 2;
    const A = Math.cos(phi) * (lam - lam0);

    const e4 = e2 * e2;
    const e6 = e4 * e2;
    const Mm =
      a *
      ((1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256) * phi -
        ((3 * e2) / 8 + (3 * e4) / 32 + (45 * e6) / 1024) * Math.sin(2 * phi) +
        ((15 * e4) / 256 + (45 * e6) / 1024) * Math.sin(4 * phi) -
        ((35 * e6) / 3072) * Math.sin(6 * phi));

    const E =
      500000 +
      k0 *
        N_radius *
        (A +
          ((1 - T + C) * A ** 3) / 6 +
          ((5 - 18 * T + T * T + 72 * C - 58 * ep2) * A ** 5) / 120);

    let Nn =
      k0 *
      (Mm +
        N_radius *
          Math.tan(phi) *
          ((A * A) / 2 +
            ((5 - T + 9 * C + 4 * C * C) * A ** 4) / 24 +
            ((61 - 58 * T + T * T + 600 * C - 330 * ep2) * A ** 6) / 720));

    if (lat < 0) Nn += 10000000; // Hemisfério Sul

    return { E, N: Nn, zone };
  },

  /**
   * Calcula azimute plano a partir das variações de Leste e Norte em graus [0, 360)
   */
  calculateAzimuth(dE: number, dN: number): number {
    let a = (Math.atan2(dE, dN) * 180) / Math.PI;
    if (a < 0) a += 360;
    return a;
  },

  /**
   * Formata graus decimais em Graus, Minutos e Segundos (GMS)
   */
  formatDMS(deg: number): string {
    if (!isFinite(deg)) return '—';
    let d = Math.floor(deg);
    const mf = (deg - d) * 60;
    let m = Math.floor(mf);
    let s = Math.round((mf - m) * 60 * 100) / 100;
    if (s >= 60) {
      s -= 60;
      m++;
    }
    if (m >= 60) {
      m -= 60;
      d++;
    }
    return `${d}°${String(m).padStart(2, '0')}'${s.toFixed(2).padStart(5, '0').replace('.', ',')}"`;
  },

  /**
   * Converte string GMS ou número decimal para graus decimais
   */
  parseDMS(s: unknown): number {
    if (s == null) return NaN;
    const str = String(s).trim();
    if (!str) return NaN;
    const isNeg = /^-|[SWO]$/i.test(str);
    const m = str
      .replace(',', '.')
      .match(/(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)?\D*(\d+(?:\.\d+)?)?/);
    if (m && /[°º'"]/.test(str)) {
      const v = +m[1] + (m[2] ? +m[2] / 60 : 0) + (m[3] ? +m[3] / 3600 : 0);
      return isNeg ? -v : v;
    }
    const clean = str.replace(/[^\d.,-]/g, '').replace(',', '.');
    const numVal = parseFloat(clean);
    return isFinite(numVal) ? (isNeg && numVal > 0 ? -numVal : numVal) : NaN;
  },

  /**
   * Teste de autointerseção entre dois segmentos de reta (p1-p2 e p3-p4)
   */
  checkSegmentIntersection(
    p1: { E: number; N: number },
    p2: { E: number; N: number },
    p3: { E: number; N: number },
    p4: { E: number; N: number }
  ): boolean {
    const d = (p2.E - p1.E) * (p4.N - p3.N) - (p2.N - p1.N) * (p4.E - p3.E);
    if (Math.abs(d) < 1e-12) return false;
    const ua = ((p4.E - p3.E) * (p1.N - p3.N) - (p4.N - p3.N) * (p1.E - p3.E)) / d;
    const ub = ((p2.E - p1.E) * (p1.N - p3.N) - (p2.N - p1.N) * (p1.E - p3.E)) / d;
    return ua > 1e-9 && ua < 1 - 1e-9 && ub > 1e-9 && ub < 1 - 1e-9;
  },

  /**
   * Interpreta o texto colado contendo vértices e coordenadas
   */
  parseVertices(
    rawText: string,
    isGeo = false,
    order: 'EN' | 'NE' = 'EN'
  ): { vertices: Vertex[]; notes: string[]; errors: string[] } {
    const notes: string[] = [];
    const errors: string[] = [];
    const vertices: Vertex[] = [];

    const lines = String(rawText || '')
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    let autoInverted = 0;

    lines.forEach((lineStr, lineIdx) => {
      let tokens: string[] = [];
      if (/[;\t]/.test(lineStr)) {
        tokens = lineStr.split(/[;\t]+/).map(t => t.trim()).filter(Boolean);
      } else if (/,\s/.test(lineStr) || (lineStr.match(/,/g) || []).length >= 2) {
        tokens = lineStr.split(/,\s*|\s+/).filter(Boolean);
      } else {
        tokens = lineStr.trim().split(/\s+/).filter(Boolean);
      }

      if (tokens.length < 2) return;

      let id = '';
      let valA = '';
      let valB = '';

      const isNumericToken = (x: string) => {
        const v = isGeo ? geodesyService.parseDMS(x) : parseBrNumber(x);
        return isFinite(v);
      };

      if (tokens.length >= 3 && !isNumericToken(tokens[0])) {
        id = tokens[0];
        valA = tokens[1];
        valB = tokens[2];
      } else if (
        tokens.length >= 3 &&
        isNumericToken(tokens[0]) &&
        isNumericToken(tokens[1]) &&
        isNumericToken(tokens[2]) &&
        Math.abs(parseFloat(tokens[0])) < 100000 &&
        !isGeo
      ) {
        id = tokens[0];
        valA = tokens[1];
        valB = tokens[2];
      } else {
        id = `V${String(vertices.length + 1).padStart(2, '0')}`;
        valA = tokens[0];
        valB = tokens[1];
      }

      const x = isGeo ? geodesyService.parseDMS(valA) : parseBrNumber(valA);
      const y = isGeo ? geodesyService.parseDMS(valB) : parseBrNumber(valB);

      if (!isFinite(x) || !isFinite(y)) {
        errors.push(`Linha ${lineIdx + 1}: coordenadas inválidas ("${valA}", "${valB}")`);
        return;
      }
      // Latitude vai até 90° e longitude até 180°: valores maiores são coordenadas planas (UTM) marcadas como geográficas
      if (isGeo && (Math.abs(x) > 180 || Math.abs(y) > 180 || Math.min(Math.abs(x), Math.abs(y)) > 90)) {
        errors.push(`Linha ${lineIdx + 1}: "${valA}", "${valB}" não são latitude e longitude. Se forem coordenadas UTM (em metros), desmarque a opção de coordenadas geográficas.`);
        return;
      }

      if (isGeo) {
        let lat = x;
        let lon = y;
        if (Math.abs(lat) > Math.abs(lon) || (lat < -35 && lon > -35)) {
          [lat, lon] = [lon, lat];
          autoInverted++;
        }
        vertices.push({ id, E: 0, N: 0, lat, lon, line: lineIdx + 1 });
      } else {
        let E = x;
        let N = y;
        if (order === 'NE') [E, N] = [N, E];
        if (E > 1e6 && N < 1e6) {
          [E, N] = [N, E];
          autoInverted++;
        }
        vertices.push({ id, E, N, line: lineIdx + 1 });
      }
    });

    if (autoInverted > 0) {
      notes.push(
        `⚠ ${autoInverted} linha(s) com coordenadas invertidas foram corrigidas automaticamente. Verifique a tabela original.`
      );
    }

    if (isGeo && vertices.length > 0) {
      const meanLon = vertices.reduce((acc, v) => acc + (v.lon || 0), 0) / vertices.length;
      const zone = Math.floor((meanLon + 180) / 6) + 1;
      vertices.forEach(v => {
        const utm = geodesyService.toUTM(v.lat || 0, v.lon || 0, zone);
        v.E = utm.E;
        v.N = utm.N;
      });
      notes.push(`ℹ Coordenadas geográficas convertidas para UTM SIRGAS 2000, Fuso ${zone}S.`);
    }

    return { vertices, notes, errors };
  },

  /**
   * Realiza todos os cálculos geométricos e de conformidade da poligonal
   */
  calculatePolygon(
    inputVertices: Vertex[],
    declaredValues: {
      areaPlanta?: number;
      areaMemorial?: number;
      perimPlanta?: number;
      perimMemorial?: number;
      tolDist?: number;
      tolArea?: number;
      tolAz?: number;
    } = {},
    declaredSegments: Record<
      string,
      { distPlanta?: number; distMemorial?: number; azPlanta?: string; azMemorial?: string }
    > = {}
  ): PolygonCalculationResult {
    const notes: { type: 'ok' | 'warn' | 'err' | 'info'; text: string }[] = [];
    const issues: { type: 'err' | 'warn' | 'ok'; text: string }[] = [];

    const vertices = inputVertices.slice();
    // Se o último vértice repetir o primeiro, remove a repetição final
    if (vertices.length > 2) {
      const first = vertices[0];
      const last = vertices[vertices.length - 1];
      if (Math.hypot(first.E - last.E, first.N - last.N) < 0.0005) {
        vertices.pop();
        notes.push({
          type: 'info',
          text: `O último vértice repetiu o primeiro (${last.id}) — fechamento explícito ajustado.`,
        });
      }
    }

    if (vertices.length < 3) {
      return {
        vertices,
        segments: [],
        areaM2: 0,
        areaHa: 0,
        perimeter: 0,
        isClockwise: false,
        isValid: false,
        notes,
        issues: [
          {
            type: 'warn',
            text: `São necessários ao menos 3 vértices válidos para fechar a poligonal (foram informados ${vertices.length}).`,
          },
        ],
      };
    }

    // 1. Verificação de identificadores e pontos duplicados
    const seenId = new Map<string, number>();
    const seenXY = new Map<string, string>();
    vertices.forEach(v => {
      const count = seenId.get(v.id) || 0;
      if (count > 0) {
        issues.push({ type: 'err', text: `Vértice "${v.id}" repetido na tabela.` });
      }
      seenId.set(v.id, count + 1);

      const coordKey = `${v.E.toFixed(3)}|${v.N.toFixed(3)}`;
      const existing = seenXY.get(coordKey);
      if (existing) {
        issues.push({
          type: 'err',
          text: `As coordenadas de "${v.id}" coincidem exatamente com as de "${existing}".`,
        });
      } else {
        seenXY.set(coordKey, v.id);
      }
    });

    // 2. Segmentos, distâncias e azimutes
    const segments: CalculatedSegment[] = vertices.map((v, i) => {
      const next = vertices[(i + 1) % vertices.length];
      const dE = next.E - v.E;
      const dN = next.N - v.N;
      const distance = Math.hypot(dE, dN);
      const azDeg = geodesyService.calculateAzimuth(dE, dN);
      const key = `${v.id}>${next.id}`;

      return {
        index: i,
        fromId: v.id,
        toId: next.id,
        key,
        distance,
        azimuth: azDeg,
        azimuthDms: geodesyService.formatDMS(azDeg),
        results: [],
      };
    });

    // 3. Área e Perímetro (Fórmula de Gauss / Shoelace)
    let s2 = 0;
    vertices.forEach((v, i) => {
      const next = vertices[(i + 1) % vertices.length];
      s2 += v.E * next.N - next.E * v.N;
    });

    const areaM2 = Math.abs(s2) / 2;
    const areaHa = areaM2 / 10000;
    const perimeter = segments.reduce((sum, s) => sum + s.distance, 0);
    const isClockwise = s2 < 0; // Determinante negativo em coordenadas cartesianas = sentido horário

    // 4. Verificação de autointerseção
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 2; j < vertices.length; j++) {
        if (i === 0 && j === vertices.length - 1) continue;
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % vertices.length];
        const p3 = vertices[j];
        const p4 = vertices[(j + 1) % vertices.length];
        if (geodesyService.checkSegmentIntersection(p1, p2, p3, p4)) {
          issues.push({
            type: 'err',
            text: `Os segmentos ${p1.id}–${p2.id} e ${p3.id}–${p4.id} se cruzam — poligonal autointersectante inválida.`,
          });
        }
      }
    }

    // 5. Verificação da ABNT NBR 17047/2022
    if (!isClockwise) {
      issues.push({
        type: 'warn',
        text: 'Poligonal descrita em sentido anti-horário — a norma ABNT NBR 17047/2022 exige descrição perimétrica no sentido horário.',
      });
    }

    segments.filter(s => s.distance < 0.01).forEach(s => {
      issues.push({
        type: 'err',
        text: `Segmento ${s.fromId}–${s.toId} com distância nula ou irrisória (${s.distance.toFixed(3)} m).`,
      });
    });

    // 6. Comparação com valores declarados
    const tolD = declaredValues.tolDist ?? 0.01;
    const tolA = declaredValues.tolArea ?? 1.0;
    const tolAz = (declaredValues.tolAz ?? 1.0) / 3600;

    const checkDeclared = (label: string, declared: number | undefined, calculated: number, tol: number, unit: string) => {
      if (declared == null || !isFinite(declared)) return;
      const diff = Math.abs(declared - calculated);
      if (diff > tol + 1e-9) {
        issues.push({
          type: 'err',
          text: `${label}: declarado ${declared.toLocaleString('pt-BR')} ${unit}, calculado ${calculated.toLocaleString('pt-BR', { maximumFractionDigits: 3 })} ${unit} — divergência de ${diff.toFixed(3)} ${unit} (tolerância ${tol.toFixed(3)}).`,
        });
      } else {
        issues.push({
          type: 'ok',
          text: `${label}: declarado ${declared.toLocaleString('pt-BR')} ${unit} confere com o calculado (${calculated.toFixed(2)} ${unit}).`,
        });
      }
    };

    checkDeclared('Área da planta', declaredValues.areaPlanta, areaM2, tolA, 'm²');
    checkDeclared('Área do memorial', declaredValues.areaMemorial, areaM2, tolA, 'm²');
    checkDeclared('Perímetro da planta', declaredValues.perimPlanta, perimeter, tolD * segments.length || tolD, 'm');
    checkDeclared('Perímetro do memorial', declaredValues.perimMemorial, perimeter, tolD * segments.length || tolD, 'm');

    // 7. Comparação dos segmentos individuais
    segments.forEach(s => {
      const decl = declaredSegments[s.key];
      if (!decl) return;

      if (decl.distPlanta != null) {
        const diffP = Math.abs(decl.distPlanta - s.distance);
        if (diffP > tolD + 1e-9) {
          s.results.push({
            status: 'err',
            message: `Planta: ${decl.distPlanta.toFixed(2)} m (dif. ${diffP.toFixed(3)} m)`,
          });
          issues.push({
            type: 'err',
            text: `Segmento ${s.fromId}–${s.toId}: distância na planta (${decl.distPlanta.toFixed(2)} m) difere da calculada (${s.distance.toFixed(3)} m).`,
          });
        } else {
          s.results.push({ status: 'ok', message: `Planta ok` });
        }
      }

      if (decl.distMemorial != null) {
        const diffM = Math.abs(decl.distMemorial - s.distance);
        if (diffM > tolD + 1e-9) {
          s.results.push({
            status: 'err',
            message: `Memorial: ${decl.distMemorial.toFixed(2)} m (dif. ${diffM.toFixed(3)} m)`,
          });
          issues.push({
            type: 'err',
            text: `Segmento ${s.fromId}–${s.toId}: distância no memorial (${decl.distMemorial.toFixed(2)} m) difere da calculada (${s.distance.toFixed(3)} m).`,
          });
        } else {
          s.results.push({ status: 'ok', message: `Memorial ok` });
        }
      }
    });

    return {
      vertices,
      segments,
      areaM2,
      areaHa,
      perimeter,
      isClockwise,
      isValid: !issues.some(i => i.type === 'err'),
      notes,
      issues,
    };
  },

  /**
   * Exporta a tabela de segmentos calculados no padrão CSV brasileiro
   */
  exportSegmentsCsv(segments: CalculatedSegment[], vertices: Vertex[]): string {
    const header = 'Segmento;Distancia_m;Azimute;E_Inicio;N_Inicio;E_Fim;N_Fim';
    const rows = segments.map((s, i) => {
      const startV = vertices[i];
      const endV = vertices[(i + 1) % vertices.length];
      return `${s.fromId}-${s.toId};${s.distance.toFixed(3).replace('.', ',')};${s.azimuthDms};${startV.E.toFixed(3).replace('.', ',')};${startV.N.toFixed(3).replace('.', ',')};${endV.E.toFixed(3).replace('.', ',')};${endV.N.toFixed(3).replace('.', ',')}`;
    });
    return '\uFEFF' + [header, ...rows].join('\r\n');
  },
};
