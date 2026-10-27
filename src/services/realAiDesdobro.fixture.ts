import { NeighborRow } from './nominalDiffService';

// Vizinhos como a leitura automática os devolveu no teste com a IA real (27/10/2026), com os arquivos fictícios de teste
export const REAL_AI_NEIGHBORS: NeighborRow[] = [
  { id: 'v1', trecho: 'P1-P2', lado: 'frente', tipo: 'via', planta: 'Rua A', quadro: '', memTexto: 'Rua A', memTabela: '', matPrinc: 'Rua A', matConf: '', matNum: '', assin: '' },
  { id: 'v2', trecho: 'P2-P3', lado: 'direito', tipo: 'imovel', planta: 'Lote 9 - PEDRO TESTE FICTÍCIO', quadro: '', memTexto: 'Lote 9, de PEDRO TESTE FICTÍCIO', memTabela: '', matPrinc: 'Lote 9, de PEDRO TESTE FICTÍCIO', matConf: '', matNum: '', assin: '' },
  { id: 'v3', trecho: 'P3-P4', lado: 'fundos', tipo: 'imovel', planta: 'Lote 20 - Município', quadro: '', memTexto: 'Lote 20, do Município', memTabela: '', matPrinc: 'Lote 20, de propriedade do Município', matConf: '', matNum: '', assin: '' },
  { id: 'v4', trecho: 'P4-P1', lado: 'esquerdo', tipo: 'imovel', planta: 'Lote 7 - ANA EXEMPLO FICTÍCIA', quadro: '', memTexto: 'Lote 7, de ANA EXEMPLO FICTICIA SOUZA', memTabela: '', matPrinc: 'Lote 7, de ANA EXEMPLO FICTÍCIA', matConf: '', matNum: '', assin: '' },
];

// Coordenadas exatamente como a IA escreveu, com os rótulos dos eixos
export const REAL_AI_COORDS = 'P1 E 288000,00 N 7464000,00\nP2 E 288020,00 N 7464000,00\nP3 E 288020,00 N 7464030,00\nP4 E 288000,00 N 7464030,00';
