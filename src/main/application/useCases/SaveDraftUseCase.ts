import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { QuoteDraft } from '../../../shared/types/Quote';
export class SaveDraftUseCase {
  constructor(
    private readonly repository: IQuoteRepository,
    private readonly auditUseCase: any 
  ) {}

  execute(draftData: QuoteDraft): { success: boolean; id?: number | bigint; message?: string; error?: string } {
    try {
      if (!draftData.services || draftData.services.length === 0) {
        throw new Error('La cotización debe tener al menos un servicio.');
      }

      const hasNoWastes = draftData.services.some(service => !service.wastes || service.wastes.length === 0);
      if (hasNoWastes) {
        throw new Error('Debe incluir al menos un residuo para guardar la cotización.');
      }

      const hasInvalidWaste = draftData.services.some(service => 
        service.wastes.some(w => w.quantity <= 0)
      );
      if (hasInvalidWaste) {
        throw new Error('La cantidad de los residuos debe ser mayor a 0.');
      }

      const isUpdate = !!draftData.id;
      
      const newId = this.repository.saveDraft(draftData);

      this.auditUseCase.execute({
        action: isUpdate ? 'UPDATE_DRAFT' : 'CREATE_DRAFT',
        entity: 'QUOTE',
        entityId: String(newId),
        details: isUpdate ? 'Borrador actualizado' : 'Borrador creado'
      });

      return { success: true, id: newId, message: 'Draft saved successfully' };
    } catch (error: any) {
      console.error("Error saving draft:", error);
      throw error;
    }
  }
}