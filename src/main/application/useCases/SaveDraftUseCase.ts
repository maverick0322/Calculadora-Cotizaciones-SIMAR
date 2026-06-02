import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { RESIDUE_SERVICE_TYPES } from '../../../shared/constants/quoteConstants';
import { QuoteDraft, ServiceType } from '../../../shared/types/Quote';
import { AppError } from '../errors/AppError';

interface AuditUseCase {
  execute(payload: { action: string; entity: string; entityId: string; details: string }): unknown;
}

export class SaveDraftUseCase {
  constructor(
    private readonly repository: IQuoteRepository,
    private readonly auditUseCase: AuditUseCase
  ) {}

  execute(draftData: QuoteDraft): { success: boolean; id?: number | bigint; message?: string; error?: string } {
    this.validateQuote(draftData);

    const isUpdate = Boolean(draftData.id);
    const quoteId = this.repository.saveDraft({ ...draftData, status: 'en_proceso' });

    this.auditUseCase.execute({
      action: isUpdate ? 'UPDATE_QUOTE_IN_PROGRESS' : 'CREATE_QUOTE_IN_PROGRESS',
      entity: 'QUOTE',
      entityId: String(quoteId),
      details: isUpdate ? 'Cotización en proceso actualizada' : 'Cotización en proceso creada'
    });

    return { success: true, id: quoteId, message: 'Cotización en proceso guardada correctamente' };
  }

  private validateQuote(draftData: QuoteDraft): void {
    if (!draftData.services || draftData.services.length === 0) {
      throw new AppError('VALIDATION_ERROR', 'La cotización debe tener al menos un servicio.');
    }

    const serviceWithoutRequiredWaste = draftData.services.find((service) => {
      const serviceType = service.serviceType as ServiceType;
      return RESIDUE_SERVICE_TYPES.includes(serviceType as (typeof RESIDUE_SERVICE_TYPES)[number]) && service.wastes.length === 0;
    });

    if (serviceWithoutRequiredWaste) {
      throw new AppError('VALIDATION_ERROR', 'Los servicios de residuos deben incluir al menos un residuo.', {
        serviceId: serviceWithoutRequiredWaste.id
      });
    }

    const invalidWasteService = draftData.services.find((service) =>
      service.wastes.some((waste) => waste.quantity <= 0)
    );

    if (invalidWasteService) {
      throw new AppError('VALIDATION_ERROR', 'La cantidad de los residuos debe ser mayor a 0.', {
        serviceId: invalidWasteService.id
      });
    }
  }
}
