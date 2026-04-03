import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { QuoteDraft } from '../../../shared/types/Quote';

export class GetDraftByIdUseCase {
  constructor(private readonly repository: IQuoteRepository) {}

  execute(id: number): QuoteDraft | null {
    if (!id || id <= 0) {
      throw new Error("Invalid draft ID provided.");
    }

    return this.repository.getDraftById(id);
  }
}