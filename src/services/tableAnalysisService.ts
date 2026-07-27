// Service for analyzing and interpreting tables from OCR text
export interface TableData {
  headers: string[];
  rows: string[][];
  metadata: {
    confidence: number;
    tableType: 'coordinates' | 'measurements' | 'legal' | 'general';
    hasErrors: boolean;
  };
}

export interface CoordinatePoint {
  vertice: string;
  latitude?: string;
  longitude?: string;
  x_utm?: string;
  y_utm?: string;
  zona_utm?: string;
  tipo_marco?: string;
  descricao?: string;
}

export const tableAnalysisService = {
  /**
   * Extract and analyze tables from OCR text
   */
  analyzeTablesInText(ocrText: string): TableData[] {
    const tables: TableData[] = [];
    
    // Look for table patterns in the text
    const tablePatterns = [
      // Pattern 1: Pipe-separated tables
      /\|[^|\n]+\|[^|\n]+\|[^|\n]*\|/gm,
      // Pattern 2: Multiple spaces/tabs as separators
      /^[\s]*\S+[\s]{3,}\S+[\s]{3,}\S+/gm,
      // Pattern 3: Coordinate tables (common patterns)
      /(?:vértice|ponto|marco)[\s\S]*?(?:coordenada|utm|geográfica)[\s\S]*?(?:\d+[°'".])/gim
    ];

    tablePatterns.forEach((pattern, index) => {
      const matches = ocrText.match(pattern);
      if (matches && matches.length > 2) { // At least 3 rows to consider it a table
        const table = this.parseTableFromMatches(matches, index);
        if (table) tables.push(table);
      }
    });

    return tables;
  },

  /**
   * Parse table from regex matches
   */
  parseTableFromMatches(matches: string[], patternIndex: number): TableData | null {
    try {
      const rows = matches.map(match => {
        // Clean and split the match based on pattern type
        switch (patternIndex) {
          case 0: // Pipe-separated
            return match.split('|').map(cell => cell.trim()).filter(cell => cell);
          case 1: // Space-separated
            return match.split(/\s{3,}/).map(cell => cell.trim()).filter(cell => cell);
          case 2: // Coordinate pattern
            return match.split(/\s+/).map(cell => cell.trim()).filter(cell => cell);
          default:
            return [match.trim()];
        }
      });

      if (rows.length < 2) return null;

      // Try to identify headers (first row or most descriptive row)
      const headers = this.identifyHeaders(rows);
      const dataRows = rows.slice(headers.length > 0 ? 1 : 0);

      // Determine table type
      const tableType = this.determineTableType(headers, dataRows);
      
      // Calculate confidence based on structure consistency
      const confidence = this.calculateTableConfidence(headers, dataRows);

      return {
        headers,
        rows: dataRows,
        metadata: {
          confidence,
          tableType,
          hasErrors: confidence < 0.7
        }
      };
    } catch (error) {
      console.error('Error parsing table:', error);
      return null;
    }
  },

  /**
   * Identify table headers
   */
  identifyHeaders(rows: string[][]): string[] {
    if (rows.length === 0) return [];

    const firstRow = rows[0];
    
    // Check if first row contains header-like terms
    const headerKeywords = [
      'vértice', 'ponto', 'marco', 'coordenada', 'latitude', 'longitude',
      'x', 'y', 'utm', 'área', 'perímetro', 'azimute', 'distância',
      'norte', 'sul', 'leste', 'oeste', 'ato', 'data', 'tipo'
    ];

    const headerScore = firstRow.reduce((score, cell) => {
      const cellLower = cell.toLowerCase();
      return score + headerKeywords.filter(keyword => 
        cellLower.includes(keyword)
      ).length;
    }, 0);

    // If first row has header-like content, use it as headers
    return headerScore > 0 ? firstRow : [];
  },

  /**
   * Determine the type of table based on content
   */
  determineTableType(headers: string[], rows: string[][]): TableData['metadata']['tableType'] {
    const allText = [...headers, ...rows.flat()].join(' ').toLowerCase();

    if (allText.includes('coordenada') || allText.includes('utm') || 
        allText.includes('latitude') || allText.includes('longitude') ||
        allText.includes('vértice') || allText.includes('marco')) {
      return 'coordinates';
    }

    if (allText.includes('área') || allText.includes('perímetro') || 
        allText.includes('distância') || allText.includes('azimute')) {
      return 'measurements';
    }

    if (allText.includes('ato') || allText.includes('registro') || 
        allText.includes('averbação') || allText.includes('matrícula')) {
      return 'legal';
    }

    return 'general';
  },

  /**
   * Calculate confidence score for table structure
   */
  calculateTableConfidence(headers: string[], rows: string[][]): number {
    if (rows.length === 0) return 0;

    let score = 0.5; // Base score

    // Consistent column count
    const expectedColumns = headers.length || rows[0]?.length || 0;
    const consistentRows = rows.filter(row => row.length === expectedColumns).length;
    score += (consistentRows / rows.length) * 0.3;

    // Headers present
    if (headers.length > 0) score += 0.2;

    // Data quality (non-empty cells)
    const totalCells = rows.reduce((total, row) => total + row.length, 0);
    const nonEmptyCells = rows.reduce((total, row) => 
      total + row.filter(cell => cell && cell.trim()).length, 0
    );
    score += (nonEmptyCells / totalCells) * 0.2;

    return Math.min(1.0, score);
  },

  /**
   * Extract coordinate points from tables
   */
  extractCoordinatesFromTables(tables: TableData[]): CoordinatePoint[] {
    const coordinates: CoordinatePoint[] = [];

    tables
      .filter(table => table.metadata.tableType === 'coordinates')
      .forEach(table => {
        table.rows.forEach((row, index) => {
          const point = this.parseCoordinateRow(row, table.headers);
          if (point) {
            coordinates.push({
              ...point,
              vertice: point.vertice || `P${index + 1}`
            });
          }
        });
      });

    return coordinates;
  },

  /**
   * Parse a single coordinate row
   */
  parseCoordinateRow(row: string[], headers: string[]): CoordinatePoint | null {
    try {
      const point: CoordinatePoint = { vertice: '' };

      row.forEach((cell, index) => {
        const header = headers[index]?.toLowerCase() || '';
        const cellValue = cell.trim();

        if (!cellValue) return;

        // Map based on header or content pattern
        if (header.includes('vértice') || header.includes('ponto') || header.includes('marco')) {
          point.vertice = cellValue;
        } else if (header.includes('latitude') || this.isLatitude(cellValue)) {
          point.latitude = cellValue;
        } else if (header.includes('longitude') || this.isLongitude(cellValue)) {
          point.longitude = cellValue;
        } else if (header.includes('x') || header.includes('utm')) {
          point.x_utm = cellValue;
        } else if (header.includes('y') || header.includes('utm')) {
          point.y_utm = cellValue;
        } else if (header.includes('tipo') || header.includes('marco')) {
          point.tipo_marco = cellValue;
        } else if (header.includes('descrição') || header.includes('obs')) {
          point.descricao = cellValue;
        } else if (!point.vertice && index === 0) {
          // First column often contains vertex identifier
          point.vertice = cellValue;
        }
      });

      // Validate that we have at least a vertex and some coordinate
      return (point.vertice && (point.latitude || point.x_utm)) ? point : null;
    } catch (error) {
      console.error('Error parsing coordinate row:', error);
      return null;
    }
  },

  /**
   * Check if a string looks like a latitude
   */
  isLatitude(value: string): boolean {
    // Pattern for latitude (degrees, minutes, seconds or decimal)
    return /^-?([0-8]?\d(\.\d+)?|90(\.0+)?)°?['"]?[NS]?$/i.test(value.trim()) ||
           /^-?([0-8]?\d[°'"][\d.]+['"]?[NS]?)$/i.test(value.trim());
  },

  /**
   * Check if a string looks like a longitude
   */
  isLongitude(value: string): boolean {
    // Pattern for longitude (degrees, minutes, seconds or decimal)
    return /^-?(1[0-7]\d(\.\d+)?|[0-9]?\d(\.\d+)?|180(\.0+)?)°?['"]?[EW]?$/i.test(value.trim()) ||
           /^-?(1[0-7]\d[°'"][\d.]+['"]?[EW]?|[0-9]?\d[°'"][\d.]+['"]?[EW]?)$/i.test(value.trim());
  }
};