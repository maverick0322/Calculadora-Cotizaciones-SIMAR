import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { QuoteDraft } from '../../../shared/types/Quote';
import { LogAuditActionUseCase } from './LogAuditActionUseCase';

export class SaveDraftUseCase {
  constructor(
    private readonly repository: IQuoteRepository,
    private readonly auditUseCase: LogAuditActionUseCase
  ) {}

  execute(draftData: QuoteDraft) {
    if (draftData.volumeQuantity <= 0) {
      throw new Error("Volume must be greater than 0 to save a draft.");
    }

    const isUpdate = !!draftData.id;
    const newId = this.repository.saveDraft(draftData);
    
    this.auditUseCase.execute({
      action: isUpdate ? 'UPDATE_DRAFT' : 'CREATE_DRAFT',
      entity: 'QUOTE',
      entityId: String(newId),
      details: draftData.replacesQuoteId ? `Clon generado a partir de cotización #${draftData.replacesQuoteId}` : 'Creación estándar'
    });
    
    return { 
      success: true, 
      id: newId, 
      message: "Draft saved successfully" 
    };
  }
}