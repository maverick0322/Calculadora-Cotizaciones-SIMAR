import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { QuoteFolioService } from '../../domain/services/QuoteFolioService';
import { QuoteTypeClassifier } from '../../domain/services/QuoteTypeClassifier';
import { QuoteFolioSuggestion } from '../../../shared/types/Quote';
import { logger } from '../../infrastructure/logging/SafeLogger';

interface SuggestQuoteFolioInput {
  quoteId: number;
  preparedByInitials?: string | null;
}

export class SuggestQuoteFolioUseCase {
  constructor(
    private readonly quoteRepository: IQuoteRepository,
    private readonly classifier: QuoteTypeClassifier,
    private readonly folioService: QuoteFolioService
  ) {}

  execute(input: SuggestQuoteFolioInput): { success: boolean; data?: QuoteFolioSuggestion; error?: string } {
    try {
      const quote = this.quoteRepository.getQuoteById(input.quoteId);
      if (!quote) {
        return { success: false, error: 'No se encontró la cotización para sugerir folio.' };
      }

      const quoteTypeCode = this.classifier.classify(quote.services);
      const annualIssuedCount = this.quoteRepository.countIssuedQuotesByYear(new Date().getFullYear());

      return {
        success: true,
        data: this.folioService.buildSuggestion({
          annualIssuedCount,
          date: new Date(),
          preparedByInitials: input.preparedByInitials,
          quote,
          quoteTypeCode
        })
      };
    } catch (error) {
      logger.error('Error inesperado al sugerir folio', { quoteId: input.quoteId, error });
      return { success: false, error: 'Error inesperado al sugerir el folio.' };
    }
  }
}
