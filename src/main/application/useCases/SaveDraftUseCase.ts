import { IQuoteRepository } from '../../domain/repositories/IQuoteRepository';
import { QuoteDraft } from '../../../shared/types/Quote';

export class SaveDraftUseCase {
  constructor(private readonly repository: IQuoteRepository) {}

  execute(draftData: QuoteDraft) {
    if (draftData.volumeQuantity <= 0) {
      throw new Error("Volume must be greater than 0 to save a draft.");
    }

    const newId = this.repository.saveDraft(draftData);
    
    return { 
      success: true, 
      id: newId, 
      message: "Draft saved successfully" 
    };
  }
}