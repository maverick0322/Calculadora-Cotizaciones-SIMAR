import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { QuoteDraft } from '../../../shared/types/Quote';

export class FetchQuoteByIdUseCase {
  constructor(private readonly quoteRepository: IQuoteRepository) {}
  execute(id: number): QuoteDraft | null {
    return this.quoteRepository.getQuoteById(id);
  }
}