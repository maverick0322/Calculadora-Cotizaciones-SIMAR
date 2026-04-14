import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { LogAuditActionUseCase } from './LogAuditActionUseCase';

export class IssueQuoteUseCase {
  constructor(
    private readonly quoteRepository: IQuoteRepository,
    private readonly auditUseCase: LogAuditActionUseCase 
  ) {}

  async execute(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const success = this.quoteRepository.issueQuote(id);
      if (!success) return { success: false, error: 'No se pudo emitir la cotización. Verifica que exista y sea un borrador.' };
      
      this.auditUseCase.execute({
        action: 'ISSUE_QUOTE',
        entity: 'QUOTE',
        entityId: id,
        details: 'Cotización convertida a documento oficial inmutable'
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}
// Added new temporary feature that has to be replaced
