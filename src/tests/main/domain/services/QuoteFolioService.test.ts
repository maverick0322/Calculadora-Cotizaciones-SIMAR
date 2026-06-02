import { describe, expect, it } from 'vitest';
import { QuoteFolioService } from '../../../../main/domain/services/QuoteFolioService';
import { QuoteDraft } from '../../../../shared/types/Quote';

const buildQuote = (override: Partial<QuoteDraft> = {}): QuoteDraft => ({
  id: 1,
  personType: 'moral',
  commercialName: 'Autobuses de Oriente',
  clientName: 'Autobuses de Oriente S.A. de C.V.',
  clientRfc: 'AOD000101AA1',
  contactName: 'Contacto Cliente',
  contactPhone: '2281234567',
  contactEmail: 'contacto@cliente.test',
  validityDays: 15,
  services: [],
  createdAt: 1,
  status: 'autorizada',
  ...override
});

describe('QuoteFolioService', () => {
  const service = new QuoteFolioService();

  it('builds a folio with sequence, month-day, quote type and client initials', () => {
    const result = service.buildSuggestion({
      annualIssuedCount: 0,
      date: new Date(2026, 4, 26),
      preparedByInitials: 'EVL',
      quote: buildQuote(),
      quoteTypeCode: 'GIR'
    });

    expect(result.folio).toBe('001-0526-GIR-ADO');
    expect(result.preparedByInitials).toBe('EVL');
  });

  it('pads the annual sequence to three digits', () => {
    const result = service.buildSuggestion({
      annualIssuedCount: 12,
      date: new Date(2026, 0, 5),
      preparedByInitials: 'UV',
      quote: buildQuote({ commercialName: 'UV' }),
      quoteTypeCode: 'RP'
    });

    expect(result.folio).toBe('013-0105-RP-UV');
  });

  it('uses physical person initials when the quote is for a person', () => {
    const result = service.buildSuggestion({
      annualIssuedCount: 1,
      date: new Date(2026, 5, 2),
      preparedByInitials: '',
      quote: buildQuote({ personType: 'fisica', clientName: 'Erickmel Vázquez López' }),
      quoteTypeCode: 'RPBI'
    });

    expect(result.folio).toBe('002-0602-RPBI-EVL');
    expect(result.preparedByInitials).toBe('SIMAR');
  });
});
