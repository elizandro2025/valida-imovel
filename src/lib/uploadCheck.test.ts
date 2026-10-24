import { describe, expect, it } from 'vitest';
import { jsPDF } from 'jspdf';
import { isOwnReportPdf, isOwnReportText } from './uploadCheck';

// Mesmo gerador e mesmos textos do botão "Exportar PDF" (src/components/AnalysisReport.tsx)
function exportedReport(header: string): Uint8Array {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  pdf.text(header, 15, 18);
  pdf.text('Matrícula 19.028 — Ônus ativos: nenhum', 15, 30);
  return new Uint8Array(pdf.output('arraybuffer'));
}

const ascii = (text: string) => new TextEncoder().encode(text);

describe('isOwnReportPdf', () => {
  it('reconhece o relatório exportado pelo ValidaImóvel', () => {
    expect(isOwnReportPdf(exportedReport('ValidaImóvel'))).toBe(true);
  });

  it('não confunde outro PDF feito com jsPDF', () => {
    expect(isOwnReportPdf(exportedReport('Certidão de matrícula'))).toBe(false);
  });

  it('aceita certidões de cartório', () => {
    const certidao = ascii('%PDF-1.7\n1 0 obj << /Producer (iText 7) >> endobj\nBT (MATRICULA 19.028 R-1 AV-2) Tj ET\n%%EOF');
    expect(isOwnReportPdf(certidao)).toBe(false);
  });
});

describe('isOwnReportText', () => {
  it('reconhece o relatório impresso e escaneado pelo texto lido', () => {
    expect(isOwnReportText('--- Página 1 ---\nValidaImóvel — análise automatizada • Matrícula 19.028')).toBe(true);
    expect(isOwnReportText('VALIDAIMOVEL Relatório')).toBe(true);
  });

  it('aceita o texto de uma certidão, mesmo com "valida" perto de "imóvel"', () => {
    expect(isOwnReportText('MATRÍCULA 19.028 — R-3 HIPOTECA em favor do Banco do Brasil. AV-5 PENHORA, processo válido.')).toBe(false);
    expect(isOwnReportText('AV-7 — escritura que convalida imóvel rural descrito no R-2')).toBe(false);
  });
});
