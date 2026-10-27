import { describe, expect, it, vi } from 'vitest';

// O cliente da API usa o login do navegador; aqui só interessam as regras de validação
vi.mock('@/services/aiClient', () => ({ AIServiceError: class AIServiceError extends Error {}, aiClient: {}, fileToBase64: vi.fn() }));

import { AUDIENCES, FAQS, LANDING_PROCEDURES, MATRICULA_FEATURES, PRICE_FACTS, PROJECT_FEATURES, SAMPLE_VERTICES } from './landing';
import { geodesyService } from '@/services/geodesyService';
import { COMPANY_CONFIG } from '@/config/companyConfig';
import { PROCEDURE_CHECKLISTS } from '@/services/projectChecklists';
import { PLAIN_PROCEDURES } from '@/services/projectSummary';
import { PM_COMPARE_FIELDS } from '@/services/projectConferenceService';
import { CONF_COLUMNS } from '@/services/nominalDiffService';
import { PROJECT_LIMITS, validateProjectFile } from '@/services/projectAiService';
import { SAMPLE_PROJECT_DATA } from '@/services/projectSampleData';

const fileOfSize = (bytes: number) => {
  const file = new File(['x'], 'planta.pdf', { type: 'application/pdf' });
  Object.defineProperty(file, 'size', { value: bytes });
  return file;
};

const allText = JSON.stringify({ AUDIENCES, FAQS, LANDING_PROCEDURES, MATRICULA_FEATURES, PRICE_FACTS, PROJECT_FEATURES });

describe('página inicial: só o que o sistema faz', () => {
  it('os procedimentos são exatamente os que têm checklist, com o número certo de itens', () => {
    expect(LANDING_PROCEDURES.map(p => p.key).sort()).toEqual(PROCEDURE_CHECKLISTS.map(c => c.key).sort());
    LANDING_PROCEDURES.forEach(p => {
      expect(p.items).toBe(PROCEDURE_CHECKLISTS.find(c => c.key === p.key)!.items.length);
      expect(p.label).toBe(PLAIN_PROCEDURES[p.key].label);
    });
  });

  it('não anuncia procedimentos que não existem', () => {
    expect(allText).not.toMatch(/usucapi|institui[çc][ãa]o de condom|carta[s]? de anu[êe]ncia/i);
  });

  it('os números citados batem com o código', () => {
    expect(allText).toContain(`${PM_COMPARE_FIELDS.length} campos`);
    expect(allText).toContain(`até ${CONF_COLUMNS.length} fontes`);
    expect(allText).toContain(`até ${PROJECT_LIMITS.maxFiles} arquivos`);
    // 15 MB por arquivo (MAX_PDF_BYTES na matrícula, MAX_FILE_BYTES nos projetos)
    expect(validateProjectFile(fileOfSize(15 * 1024 * 1024))).toBeNull();
    expect(validateProjectFile(fileOfSize(15 * 1024 * 1024 + 1))).toMatch(/15 MB/);
    expect(allText).toContain('até 15 MB');
    const counts = PROCEDURE_CHECKLISTS.map(c => c.items.length);
    expect(allText).toContain(`de ${Math.min(...counts)} a ${Math.max(...counts)} itens`);
  });

  it('a poligonal desenhada é a do projeto de exemplo', () => {
    const { vertices } = geodesyService.parseVertices(SAMPLE_PROJECT_DATA.polygon.rawCoords);
    expect(SAMPLE_VERTICES).toEqual(vertices.map(v => [v.id, v.E, v.N]));
  });

  it('o exemplo de projeto citado é o que abre em /app?sample=desdobro', () => {
    const s = SAMPLE_PROJECT_DATA.polygon.declaredSegments['M-02>M-03'];
    expect(allText).toContain(`${String(s.distPlanta).replace('.', ',')} m × ${String(s.distMemorial).replace('.', ',')} m`);
    expect(allText).toContain(`${SAMPLE_PROJECT_DATA.polygon.perimMemorial.replace(/^(\d)(\d{3})/, '$1.$2')} m`);
  });

  it('preço, prazo e limite vêm da configuração (a mesma do servidor)', () => {
    const { offer } = COMPANY_CONFIG;
    const faqPrice = FAQS.find(f => /Quanto custa/.test(f.q))!.a;
    expect(faqPrice).toContain(offer.priceFormatted);
    expect(faqPrice).toContain(offer.period);
    expect(allText).toContain(`até ${offer.fairUseDailyLimit} análises de matrícula por dia`);
    expect(allText).not.toMatch(/ilimitad|gr[áa]tis por|teste gr[áa]tis|49,90/i);
  });
});
