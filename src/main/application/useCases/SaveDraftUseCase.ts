import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { QuoteDraft } from '../../../shared/types/Quote';
export class SaveDraftUseCase {
  constructor(
    private readonly repository: IQuoteRepository,
    private readonly auditUseCase: any 
  ) {}

  execute(draftData: QuoteDraft): { success: boolean; id?: number | bigint; message?: string; error?: string } {
    try {
      // 1. NUEVA VALIDACIÓN: Revisamos el arreglo de residuos
      if (!draftData.wastes || draftData.wastes.length === 0) {
        throw new Error('Debe incluir al menos un residuo para guardar la cotización.');
      }

      // 2. Revisamos que ninguna cantidad sea 0 o negativa
      const hasInvalidWaste = draftData.wastes.some(w => w.quantity <= 0);
      if (hasInvalidWaste) {
        throw new Error('Volume must be greater than 0 to save a draft.');
      }

      const isUpdate = !!draftData.id;
      
      // 3. Guardamos
      const newId = this.repository.saveDraft(draftData);

      // 4. Auditoría silenciosa
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