import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';

export class IssueQuoteUseCase {
  constructor(private readonly quoteRepository: IQuoteRepository) {}

  async execute(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const success = this.quoteRepository.issueQuote(id);
      if (!success) return { success: false, error: 'No se pudo emitir la cotización. Verifica que exista y sea un borrador.' };
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}