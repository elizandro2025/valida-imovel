/**
 * Lê um número escrito no formato brasileiro ou internacional, como chega de plantas, memoriais e da IA:
 * "389.313,03", "1250,5", "225410.150", "7.481.200,320".
 * - Com vírgula: a vírgula é a casa decimal e os pontos separam milhares.
 * - Sem vírgula e com mais de um ponto: os pontos separam milhares.
 * - Um ponto só é casa decimal, exceto no formato "1.250" (1 a 3 dígitos sem zero à esquerda, ponto e 3 dígitos),
 *   que no Brasil é milhar.
 * Texto depois do número (ex.: "m²", "ha") é ignorado, como no parseFloat. Sem número, devolve NaN.
 */
export function parseBrNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  const text = String(value ?? '').trim().replace(/\s+/g, '');
  if (!text) return NaN;

  let normalized = text;
  if (text.includes(',')) normalized = text.replace(/\./g, '').replace(',', '.');
  else if ((text.match(/\./g) || []).length > 1) normalized = text.replace(/\./g, '');
  else if (/^-?[1-9]\d{0,2}\.\d{3}(?!\d)/.test(text)) normalized = text.replace('.', '');
  return parseFloat(normalized);
}
