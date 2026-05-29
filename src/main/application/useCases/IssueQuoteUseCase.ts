import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { logger } from '../../infrastructure/logging/SafeLogger';
import { isAppError } from '../errors/AppError';
import { LogAuditActionUseCase } from './LogAuditActionUseCase';

export class IssueQuoteUseCase {
  constructor(
    private readonly quoteRepository: IQuoteRepository,
    private readonly auditUseCase: LogAuditActionUseCase
  ) {}

  async execute(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const success = this.quoteRepository.issueQuote(id);
      if (!success) return { success: false, error: 'No se pudo emitir la cotización autorizada.' };

      this.auditUseCase.execute({
        action: 'ISSUE_QUOTE',
        entity: 'QUOTE',
        entityId: id,
        details: 'Cotización emitida para cliente'
      });

      return { success: true };
    } catch (error) {
      if (isAppError(error)) {
        logger.warn('No se pudo emitir la cotización por una regla de negocio', error.context);
        return { success: false, error: error.message };
      }

      logger.error('Error inesperado al emitir cotización', { quoteId: id, error });
      return { success: false, error: 'Error inesperado al emitir la cotización.' };
    }
  }
}
