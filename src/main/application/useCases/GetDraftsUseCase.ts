import { ICotizacionRepository } from '../../domain/repositories/ICotizacionRepository';
import { QuoteSummary } from '../../../shared/types/Cotizacion';

export class GetDraftsUseCase {
  constructor(private readonly repository: ICotizacionRepository) {}

  execute(): { success: boolean; data?: QuoteSummary[]; error?: string } {
    try {
      const drafts = this.repository.getDrafts();
      return { success: true, data: drafts };
    } catch (error) {
      // Si SQLite falla por alguna razón, atrapamos el error limpiamente
      return { success: false, error: (error as Error).message };
    }
  }
}