import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { QuoteSummary } from '../../../shared/types/Quote';

export class GetDraftsUseCase {
  constructor(private readonly repository: IQuoteRepository) {}

  execute(): { success: boolean; data?: QuoteSummary[]; error?: string } {
    try {
      const drafts = this.repository.getDrafts();
      return { success: true, data: drafts };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}