import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { CurrentQuoteStatus } from '../../../shared/types/Quote';
import { logger } from '../../infrastructure/logging/SafeLogger';
import { isAppError } from '../errors/AppError';
import { LogAuditActionUseCase } from './LogAuditActionUseCase';

export class UpdateQuoteStatusUseCase {
  constructor(
    private readonly quoteRepository: IQuoteRepository,
    private readonly auditUseCase: LogAuditActionUseCase
  ) {}

  execute(id: number, nextStatus: CurrentQuoteStatus): { success: boolean; error?: string } {
    try {
      const success = this.quoteRepository.updateQuoteStatus(id, nextStatus);
      if (!success) return { success: false, error: 'No se actualizó el estado de la cotización.' };

      this.auditUseCase.execute({
        action: 'UPDATE_QUOTE_STATUS',
        entity: 'QUOTE',
        entityId: id,
        details: `Estado actualizado a ${nextStatus}`
      });

      return { success: true };
    } catch (error) {
      if (isAppError(error)) {
        logger.warn('Transición de estado rechazada', error.context);
        return { success: false, error: error.message };
      }

      logger.error('Error inesperado al actualizar estado', { quoteId: id, nextStatus, error });
      return { success: false, error: 'Error inesperado al actualizar el estado de la cotización.' };
    }
  }
}
