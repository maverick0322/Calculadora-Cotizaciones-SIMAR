import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { QuoteSummary } from '../../../shared/types/Quote';

export class GetIssuedQuotesUseCase {
  constructor(private readonly repository: IQuoteRepository) {}

  execute(): { success: boolean; data?: QuoteSummary[]; error?: string } {
    try {
      const issuedQuotes = this.repository.getIssuedQuotes();
      return { success: true, data: issuedQuotes };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}