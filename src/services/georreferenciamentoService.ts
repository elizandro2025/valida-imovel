// Specialized service for georeferencing analysis
import { chatJSON } from './mistralService';
import { tableAnalysisService, CoordinatePoint } from './tableAnalysisService';

export interface CoordinateGroup {
  tipo_agrupamento: 'marco_tipo' | 'zona_utm' | 'proximidade' | 'sistema_geodesico';
  nome_grupo: string;
  coordenadas: CoordinatePoint[];
  metadata: {
    quantidade_pontos: number;
    centro_geometrico?: {
      latitude?: number;
      longitude?: number;
      x_utm?: number;
      y_utm?: number;
    };
  };
}

export interface GeorreferencingData {
  memorial_descritivo_georreferenciamento: {
    ato_averbacao: string;
    data_ato: string;
    situacao_certificacao: string;
    area_total_ha: string;
    perimetro_total: string;
    coordenadas_geograficas: CoordinatePoint[];
    coordenadas_utm: CoordinatePoint[];
    coordenadas_agrupadas: {
      grupos_geograficas: CoordinateGroup[];
      grupos_utm: CoordinateGroup[];
    };
    sistema_geodesico: string;
    datum: string;
    zona_utm: string;
    responsavel_tecnico: {
      nome: string;
      crea_cft: string;
      anotacao_tecnica: string;
    };
    observacoes_tecnicas: string;
    qualidade_extracao: {
      confianca_coordenadas: number;
      tabelas_detectadas: number;
      metodo_extracao: 'manual' | 'tabela' | 'texto_livre';
    };
  };
}

export const georreferenciamentoService = {
  /**
   * Specialized georeferencing analysis with table support
   */
  async analyzeGeoreferencing(extractedText: string): Promise<GeorreferencingData> {
    // First, analyze tables in the text
    const tables = tableAnalysisService.analyzeTablesInText(extractedText);
    const coordinates = tableAnalysisService.extractCoordinatesFromTables(tables);
    
    console.log(`Detectadas ${tables.length} tabelas e ${coordinates.length} coordenadas`);

    const prompt = this.createGeoreferencingPrompt(extractedText, tables, coordinates);
    
    const messages = [
      { 
        role: "system", 
        content: "Você é um especialista em georreferenciamento e registros fundiários. Extraia dados com precisão técnica e retorne JSON válido." 
      },
      { role: "user", content: prompt }
    ];

    try {
      const result = await chatJSON(messages, 4000, 2);
      
      // Enhance with extracted coordinates
      if (result.memorial_descritivo_georreferenciamento) {
        const memorial = result.memorial_descritivo_georreferenciamento;
        
        // Merge AI-extracted coordinates with table-extracted ones
        memorial.coordenadas_geograficas = this.mergeCoordinates(
          memorial.coordenadas_geograficas || [],
          coordinates.filter(c => c.latitude || c.longitude)
        );
        
        memorial.coordenadas_utm = this.mergeCoordinates(
          memorial.coordenadas_utm || [],
          coordinates.filter(c => c.x_utm || c.y_utm)
        );

        // Add coordinate grouping
        memorial.coordenadas_agrupadas = {
          grupos_geograficas: this.groupCoordinates(memorial.coordenadas_geograficas, 'geograficas'),
          grupos_utm: this.groupCoordinates(memorial.coordenadas_utm, 'utm')
        };

        // Add quality metadata
        memorial.qualidade_extracao = {
          confianca_coordenadas: this.calculateCoordinateConfidence(coordinates, tables),
          tabelas_detectadas: tables.length,
          metodo_extracao: tables.length > 0 ? 'tabela' : 'texto_livre'
        };
      }

      return result;
    } catch (error) {
      console.error('Erro na análise de georreferenciamento:', error);
      
      // Fallback with table data
      return {
        memorial_descritivo_georreferenciamento: {
          ato_averbacao: "",
          data_ato: "",
          situacao_certificacao: "Análise automática falhou",
          area_total_ha: "",
          perimetro_total: "",
          coordenadas_geograficas: coordinates.filter(c => c.latitude || c.longitude),
          coordenadas_utm: coordinates.filter(c => c.x_utm || c.y_utm),
          coordenadas_agrupadas: {
            grupos_geograficas: this.groupCoordinates(coordinates.filter(c => c.latitude || c.longitude), 'geograficas'),
            grupos_utm: this.groupCoordinates(coordinates.filter(c => c.x_utm || c.y_utm), 'utm')
          },
          sistema_geodesico: "",
          datum: "",
          zona_utm: "",
          responsavel_tecnico: {
            nome: "",
            crea_cft: "",
            anotacao_tecnica: ""
          },
          observacoes_tecnicas: "Dados extraídos apenas de tabelas detectadas",
          qualidade_extracao: {
            confianca_coordenadas: this.calculateCoordinateConfidence(coordinates, tables),
            tabelas_detectadas: tables.length,
            metodo_extracao: 'tabela'
          }
        }
      };
    }
  },

  /**
   * Create specialized prompt for georeferencing
   */
  createGeoreferencingPrompt(text: string, tables: any[], coordinates: CoordinatePoint[]): string {
    const tableInfo = tables.length > 0 ? 
      `\n\n### TABELAS DETECTADAS:\n${tables.map((t, i) => 
        `Tabela ${i+1} (${t.metadata.tableType}): ${t.headers.join(' | ')}\nConfiança: ${t.metadata.confidence.toFixed(2)}`
      ).join('\n')}` : '';

    const coordInfo = coordinates.length > 0 ? 
      `\n\n### COORDENADAS PRÉ-EXTRAÍDAS:\n${coordinates.map(c => 
        `${c.vertice}: ${c.latitude || c.x_utm || 'N/A'}, ${c.longitude || c.y_utm || 'N/A'}`
      ).join('\n')}` : '';

    return `Você é um especialista em georreferenciamento e registros fundiários.

Analise o texto da matrícula imobiliária e extraia TODAS as informações de georreferenciamento e memorial descritivo.

INSTRUÇÕES CRÍTICAS:
- Interprete tabelas mal formatadas e coordenadas dispersas no texto
- Extraia TODOS os vértices/pontos com suas coordenadas
- Identifique o sistema geodésico (SIRGAS 2000, SAD 69, etc.)
- Localize dados do responsável técnico (CREA, ART)
- Use informações das tabelas detectadas como base

ESTRUTURA JSON ESPERADA:
{
  "memorial_descritivo_georreferenciamento": {
    "ato_averbacao": "",
    "data_ato": "",
    "situacao_certificacao": "",
    "area_total_ha": "",
    "perimetro_total": "",
    "coordenadas_geograficas": [
      {
        "vertice": "",
        "latitude": "",
        "longitude": "",
        "tipo_marco": "",
        "descricao": ""
      }
    ],
    "coordenadas_utm": [
      {
        "vertice": "",
        "x_utm": "",
        "y_utm": "",
        "zona_utm": "",
        "tipo_marco": "",
        "descricao": ""
      }
    ],
    "sistema_geodesico": "",
    "datum": "",
    "zona_utm": "",
    "responsavel_tecnico": {
      "nome": "",
      "crea_cft": "",
      "anotacao_tecnica": ""
    },
    "observacoes_tecnicas": ""
  }
}

TEXTO DA MATRÍCULA:
${text.substring(0, 15000)}${tableInfo}${coordInfo}`;
  },

  /**
   * Merge coordinates from different sources
   */
  mergeCoordinates(aiCoords: any[], tableCoords: CoordinatePoint[]): CoordinatePoint[] {
    const merged = [...tableCoords];
    
    // Add AI coordinates that don't overlap with table coordinates
    aiCoords.forEach(aiCoord => {
      const exists = merged.some(tc => 
        tc.vertice?.toLowerCase() === aiCoord.vertice?.toLowerCase()
      );
      
      if (!exists && aiCoord.vertice) {
        merged.push(aiCoord);
      }
    });
    
    return merged.sort((a, b) => a.vertice.localeCompare(b.vertice));
  },

  /**
   * Group coordinates by different criteria
   */
  groupCoordinates(coordinates: CoordinatePoint[], tipo: 'geograficas' | 'utm'): CoordinateGroup[] {
    if (!coordinates || coordinates.length === 0) return [];

    const groups: CoordinateGroup[] = [];

    // Agrupamento por tipo de marco
    const marcoGroups = this.groupByMarcoType(coordinates);
    groups.push(...marcoGroups);

    // Agrupamento por zona UTM (apenas para coordenadas UTM)
    if (tipo === 'utm') {
      const zonaGroups = this.groupByZonaUTM(coordinates);
      groups.push(...zonaGroups);
    }

    // Agrupamento por proximidade geográfica
    const proximityGroups = this.groupByProximity(coordinates, tipo);
    groups.push(...proximityGroups);

    return groups;
  },

  /**
   * Group coordinates by marco type
   */
  groupByMarcoType(coordinates: CoordinatePoint[]): CoordinateGroup[] {
    const tiposMarco = new Map<string, CoordinatePoint[]>();

    coordinates.forEach(coord => {
      const tipo = coord.tipo_marco || 'Não especificado';
      if (!tiposMarco.has(tipo)) {
        tiposMarco.set(tipo, []);
      }
      tiposMarco.get(tipo)!.push(coord);
    });

    return Array.from(tiposMarco.entries()).map(([tipo, coords]) => ({
      tipo_agrupamento: 'marco_tipo',
      nome_grupo: `Marcos do tipo: ${tipo}`,
      coordenadas: coords,
      metadata: {
        quantidade_pontos: coords.length,
        centro_geometrico: this.calculateCentroid(coords)
      }
    }));
  },

  /**
   * Group coordinates by UTM zone
   */
  groupByZonaUTM(coordinates: CoordinatePoint[]): CoordinateGroup[] {
    const zonas = new Map<string, CoordinatePoint[]>();

    coordinates.forEach(coord => {
      // Extract zone from coordinate or use default
      let zona = coord.zona_utm;
      if (!zona && coord.x_utm) {
        // Try to infer zone from x_utm value (Brazilian zones are typically 21-25)
        const x = parseFloat(coord.x_utm);
        if (x >= 166000 && x <= 834000) {
          zona = x < 500000 ? '23S' : '24S'; // Simplified zone inference
        }
      }
      zona = zona || 'Não especificada';
      
      if (!zonas.has(zona)) {
        zonas.set(zona, []);
      }
      zonas.get(zona)!.push(coord);
    });

    return Array.from(zonas.entries()).map(([zona, coords]) => ({
      tipo_agrupamento: 'zona_utm',
      nome_grupo: `Zona UTM: ${zona}`,
      coordenadas: coords,
      metadata: {
        quantidade_pontos: coords.length,
        centro_geometrico: this.calculateCentroid(coords)
      }
    }));
  },

  /**
   * Group coordinates by geographic proximity
   */
  groupByProximity(coordinates: CoordinatePoint[], tipo: 'geograficas' | 'utm'): CoordinateGroup[] {
    if (coordinates.length < 2) return [];

    const groups: CoordinateGroup[] = [];
    const processed = new Set<number>();
    const threshold = tipo === 'geograficas' ? 0.001 : 100; // ~100m for geographic, 100m for UTM

    coordinates.forEach((coord, index) => {
      if (processed.has(index)) return;

      const proximityGroup: CoordinatePoint[] = [coord];
      processed.add(index);

      // Find nearby coordinates
      coordinates.forEach((otherCoord, otherIndex) => {
        if (processed.has(otherIndex) || index === otherIndex) return;

        const distance = this.calculateDistance(coord, otherCoord, tipo);
        if (distance <= threshold) {
          proximityGroup.push(otherCoord);
          processed.add(otherIndex);
        }
      });

      if (proximityGroup.length > 1) {
        groups.push({
          tipo_agrupamento: 'proximidade',
          nome_grupo: `Grupo de ${proximityGroup.length} pontos próximos`,
          coordenadas: proximityGroup,
          metadata: {
            quantidade_pontos: proximityGroup.length,
            centro_geometrico: this.calculateCentroid(proximityGroup)
          }
        });
      }
    });

    return groups;
  },

  /**
   * Calculate distance between two coordinates
   */
  calculateDistance(coord1: CoordinatePoint, coord2: CoordinatePoint, tipo: 'geograficas' | 'utm'): number {
    if (tipo === 'geograficas' && coord1.latitude && coord1.longitude && coord2.latitude && coord2.longitude) {
      // Haversine formula for geographic coordinates
      const lat1 = parseFloat(coord1.latitude);
      const lon1 = parseFloat(coord1.longitude);
      const lat2 = parseFloat(coord2.latitude);
      const lon2 = parseFloat(coord2.longitude);

      const R = 6371000; // Earth's radius in meters
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
    
    if (tipo === 'utm' && coord1.x_utm && coord1.y_utm && coord2.x_utm && coord2.y_utm) {
      // Euclidean distance for UTM coordinates
      const x1 = parseFloat(coord1.x_utm);
      const y1 = parseFloat(coord1.y_utm);
      const x2 = parseFloat(coord2.x_utm);
      const y2 = parseFloat(coord2.y_utm);
      
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    return Infinity;
  },

  /**
   * Calculate geometric centroid of coordinates
   */
  calculateCentroid(coordinates: CoordinatePoint[]): any {
    if (coordinates.length === 0) return {};

    const hasGeo = coordinates.some(c => c.latitude && c.longitude);
    const hasUTM = coordinates.some(c => c.x_utm && c.y_utm);

    const centroid: any = {};

    if (hasGeo) {
      const validCoords = coordinates.filter(c => c.latitude && c.longitude);
      const avgLat = validCoords.reduce((sum, c) => sum + parseFloat(c.latitude!), 0) / validCoords.length;
      const avgLon = validCoords.reduce((sum, c) => sum + parseFloat(c.longitude!), 0) / validCoords.length;
      
      centroid.latitude = avgLat;
      centroid.longitude = avgLon;
    }

    if (hasUTM) {
      const validCoords = coordinates.filter(c => c.x_utm && c.y_utm);
      const avgX = validCoords.reduce((sum, c) => sum + parseFloat(c.x_utm!), 0) / validCoords.length;
      const avgY = validCoords.reduce((sum, c) => sum + parseFloat(c.y_utm!), 0) / validCoords.length;
      
      centroid.x_utm = avgX;
      centroid.y_utm = avgY;
    }

    return centroid;
  },

  /**
   * Calculate confidence score for coordinate extraction
   */
  calculateCoordinateConfidence(coordinates: CoordinatePoint[], tables: any[]): number {
    if (coordinates.length === 0) return 0;

    let score = 0.3; // Base score

    // Points from high-confidence tables
    const highConfidenceTables = tables.filter(t => t.metadata.confidence > 0.8);
    if (highConfidenceTables.length > 0) score += 0.3;

    // Complete coordinate pairs
    const completeCoords = coordinates.filter(c => 
      (c.latitude && c.longitude) || (c.x_utm && c.y_utm)
    );
    score += (completeCoords.length / coordinates.length) * 0.3;

    // Consistent vertex naming
    const hasConsistentNaming = coordinates.every(c => 
      c.vertice && /^[A-Z]\d*$|^P\d+$|^M\d+$/i.test(c.vertice)
    );
    if (hasConsistentNaming) score += 0.1;

    return Math.min(1.0, score);
  }
};