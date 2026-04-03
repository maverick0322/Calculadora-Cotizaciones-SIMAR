// src/domain/repositories/IQuoteRepository.ts
import { QuoteDraft, QuoteSummary } from '../../../shared/types/Quote';

export interface IQuoteRepository {
  /**
   * Saves a new quote draft into the database.
   * @param quote The draft data to save.
   * @returns The ID of the newly inserted row.
   */
  saveDraft(quote: QuoteDraft): number | bigint;
  
  /**
   * Retrieves a summary list of all quotes currently in 'draft' status.
   * @returns An array of QuoteSummary objects.
   */
  getDrafts(): QuoteSummary[];

  /**
   * Retrieves the full details of a specific draft by its ID.
   * @param id The unique identifier of the draft.
   * @returns The QuoteDraft object if found, or null if it doesn't exist.
   */
  getDraftById(id: number): QuoteDraft | null;
}