/**
 * Confere o arquivo enviado antes de gastar a análise.
 * Caso real: a pessoa envia o relatório que o próprio ValidaImóvel exportou (Analise_Matricula_<n>.pdf) no lugar
 * da certidão; a IA não encontra os atos do cartório e a análise falha com uma mensagem que não explica o motivo.
 */
export const OWN_REPORT_MESSAGE =
  'Este arquivo é um relatório gerado pelo ValidaImóvel (o PDF exportado de uma análise), não a certidão da matrícula. ' +
  'Escolha o PDF da certidão emitida pelo cartório de registro de imóveis.';

// O relatório exportado é gerado pelo jsPDF e traz "ValidaImóvel" no cabeçalho e no rodapé de cada página
export function isOwnReportPdf(bytes: Uint8Array): boolean {
  const raw = new TextDecoder('latin1').decode(bytes);
  return raw.includes('/Producer (jsPDF') && raw.includes('ValidaIm');
}

// O mesmo relatório impresso e escaneado: o texto lido traz o nome do serviço (sempre junto), que nenhuma certidão contém
export function isOwnReportText(text: string): boolean {
  return /validaim[óo]vel/i.test(text);
}
