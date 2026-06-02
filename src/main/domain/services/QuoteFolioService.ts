import {
  DEFAULT_CLIENT_INITIALS,
  DEFAULT_WORKER_INITIALS,
  FOLIO_SEQUENCE_WIDTH
} from '../../../shared/constants/quoteConstants';
import { QuoteDraft, QuoteFolioSuggestion, QuoteTypeCode } from '../../../shared/types/Quote';

interface BuildSuggestionInput {
  annualIssuedCount: number;
  date: Date;
  preparedByInitials?: string | null;
  quote: QuoteDraft;
  quoteTypeCode: QuoteTypeCode;
}

export class QuoteFolioService {
  buildSuggestion(input: BuildSuggestionInput): QuoteFolioSuggestion {
    const sequence = input.annualIssuedCount + 1;
    const formattedSequence = String(sequence).padStart(FOLIO_SEQUENCE_WIDTH, '0');
    const formattedDate = this.formatMonthDay(input.date);
    const preparedByInitials = this.normalizeInitials(input.preparedByInitials, DEFAULT_WORKER_INITIALS);
    const clientInitials = this.buildClientInitials(input.quote);

    return {
      folio: `${formattedSequence}-${formattedDate}-${input.quoteTypeCode}-${clientInitials}`,
      sequence,
      quoteTypeCode: input.quoteTypeCode,
      preparedByInitials,
      clientInitials
    };
  }

  private formatMonthDay(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}${day}`;
  }

  private buildClientInitials(quote: QuoteDraft): string {
    const source = quote.personType === 'fisica' ? quote.clientName : quote.commercialName || quote.clientName;
    return this.normalizeInitials(source, DEFAULT_CLIENT_INITIALS);
  }

  private normalizeInitials(value: string | null | undefined, fallback: string): string {
    const words = (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9Ññ\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const initials = words.length > 1
      ? words.map((word) => word[0]).join('')
      : words[0] ?? '';

    const normalized = initials.toUpperCase().slice(0, 6);
    return normalized || fallback;
  }
}
