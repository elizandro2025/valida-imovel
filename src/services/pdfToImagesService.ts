import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use compatible version
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface PDFToImagesOptions {
  scale?: number; // 1.0 = 72dpi, 2.0 = 144dpi, etc.
  quality?: number; // 0.1 to 1.0 for JPEG quality
  format?: 'jpeg' | 'png';
}

export interface PDFPageInfo {
  pageNumber: number;
  base64: string;
  width: number;
  height: number;
  hasTablesIndicator: boolean; // Basic detection
}

export const pdfToImagesService = {
  /**
   * Convert PDF to base64 images
   */
  async convertToImages(
    pdfBuffer: ArrayBuffer, 
    options: PDFToImagesOptions = {}
  ): Promise<PDFPageInfo[]> {
    const { scale = 2.0, quality = 0.9, format = 'jpeg' } = options;

    try {
      const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
      const totalPages = pdf.numPages;
      console.log(`PDF has ${totalPages} pages`);

      const pagePromises = Array.from({ length: totalPages }, (_, i) => 
        this.renderPage(pdf, i + 1, scale, quality, format)
      );

      const pages = await Promise.all(pagePromises);
      console.log(`Successfully converted ${pages.length} pages to images`);
      
      return pages;
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      throw new Error(`Falha na conversão PDF para imagens: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  /**
   * Render a single PDF page to base64 image
   */
  async renderPage(
    pdf: any, 
    pageNumber: number, 
    scale: number, 
    quality: number, 
    format: 'jpeg' | 'png'
  ): Promise<PDFPageInfo> {
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Cannot get canvas context');
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render page
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;

      // Basic table detection (look for grid-like patterns)
      const hasTablesIndicator = await this.detectTables(context, canvas);

      // Convert to base64
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const base64 = canvas.toDataURL(mimeType, quality).split(',')[1];

      return {
        pageNumber,
        base64,
        width: canvas.width,
        height: canvas.height,
        hasTablesIndicator
      };
    } catch (error) {
      console.error(`Error rendering page ${pageNumber}:`, error);
      throw error;
    }
  },

  /**
   * Basic table detection using canvas analysis
   */
  async detectTables(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): Promise<boolean> {
    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simple heuristic: count horizontal and vertical line patterns
      let horizontalLines = 0;
      let verticalLines = 0;
      const threshold = 200; // Brightness threshold for detecting lines
      
      // Sample every 10th row/column for performance
      const step = 10;
      
      // Check for horizontal lines
      for (let y = 0; y < canvas.height; y += step) {
        let linePixels = 0;
        for (let x = 0; x < canvas.width; x += step) {
          const index = (y * canvas.width + x) * 4;
          const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
          if (brightness < threshold) linePixels++;
        }
        if (linePixels > canvas.width / (step * 3)) horizontalLines++;
      }
      
      // Check for vertical lines
      for (let x = 0; x < canvas.width; x += step) {
        let linePixels = 0;
        for (let y = 0; y < canvas.height; y += step) {
          const index = (y * canvas.width + x) * 4;
          const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
          if (brightness < threshold) linePixels++;
        }
        if (linePixels > canvas.height / (step * 3)) verticalLines++;
      }
      
      // Consider it a table if we have both horizontal and vertical lines
      return horizontalLines >= 3 && verticalLines >= 3;
    } catch (error) {
      console.error('Error in table detection:', error);
      return false;
    }
  },

  /**
   * Convert File to ArrayBuffer
   */
  async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to ArrayBuffer'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }
};