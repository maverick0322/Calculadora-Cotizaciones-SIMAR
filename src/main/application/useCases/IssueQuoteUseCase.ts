import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { IConditionRepository } from '../../domain/repositories/IConditionRepository';
import { IssueQuoteRequest } from '../../../shared/types/Quote';
import { logger } from '../../infrastructure/logging/SafeLogger';
import { isAppError } from '../errors/AppError';
import { LogAuditActionUseCase } from './LogAuditActionUseCase';

export class IssueQuoteUseCase {
  constructor(
    private readonly quoteRepository: IQuoteRepository,
    private readonly conditionRepository: IConditionRepository,
    private readonly auditUseCase: LogAuditActionUseCase
  ) {}

  async execute(payload: IssueQuoteRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const success = this.quoteRepository.issueQuote(payload);
      if (!success) return { success: false, error: 'No se pudo emitir la cotización autorizada.' };

      try {
        this.conditionRepository.saveQuoteSnapshot(payload.quoteId, payload.conditions);
      } catch (snapshotError) {
        logger.warn('No se pudo guardar tabla auxiliar de condiciones de cotización', {
          quoteId: payload.quoteId,
          error: snapshotError
        });
      }

      this.auditUseCase.execute({
        action: 'ISSUE_QUOTE',
        entity: 'QUOTE',
        entityId: payload.quoteId,
        details: 'Cotización emitida para cliente'
      });

      return { success: true };
    } catch (error) {
      if (isAppError(error)) {
        logger.warn('No se pudo emitir la cotización por una regla de negocio', error.context);
        return { success: false, error: error.message };
      }

      logger.error('Error inesperado al emitir cotización', { quoteId: payload.quoteId, error });
      return { success: false, error: 'Error inesperado al emitir la cotización.' };
    }
  }
}
