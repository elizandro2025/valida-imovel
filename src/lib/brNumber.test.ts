import { describe, expect, it } from 'vitest';
import { parseBrNumber } from './brNumber';

describe('parseBrNumber', () => {
  it('regressão: "1.250,00" é mil duzentos e cinquenta, não 1,25', () => {
    expect(parseBrNumber('1.250,00')).toBe(1250);
    expect(parseBrNumber('389.313,03')).toBeCloseTo(389313.03);
  });

  it('vírgula decimal sem milhar e coordenadas com milhar', () => {
    expect(parseBrNumber('2349,58')).toBeCloseTo(2349.58);
    expect(parseBrNumber('7.481.200,320')).toBeCloseTo(7481200.32);
    expect(parseBrNumber('225410,150')).toBeCloseTo(225410.15);
  });

  it('ponto decimal internacional continua valendo', () => {
    expect(parseBrNumber('225410.150')).toBeCloseTo(225410.15);
    expect(parseBrNumber('441.37')).toBeCloseTo(441.37);
    expect(parseBrNumber('0.010')).toBeCloseTo(0.01);
  });

  it('vários pontos sem vírgula são milhares', () => {
    expect(parseBrNumber('7.481.200')).toBe(7481200);
  });

  it('ignora a unidade depois do número e devolve NaN sem número', () => {
    expect(parseBrNumber('2.349,58 m')).toBeCloseTo(2349.58);
    expect(parseBrNumber('')).toBeNaN();
    expect(parseBrNumber('n/d')).toBeNaN();
    expect(parseBrNumber(12.5)).toBe(12.5);
  });
});
