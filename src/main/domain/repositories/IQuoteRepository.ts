// src/domain/repositories/IQuoteRepository.ts
import {
  CurrentQuoteStatus,
  IssueQuoteRequest,
  QuoteDraft,
  QuoteSummary
} from '../../../shared/types/Quote';

export interface IQuoteRepository {
  /**
   * Saves a new in-process quote into the database.
   * @param quote The quote data to save.
   * @returns The ID of the newly inserted row.
   */
  saveDraft(quote: QuoteDraft): number | bigint;
  
  /**
   * Retrieves a summary list of all quotes currently in progress.
   * @returns An array of QuoteSummary objects.
   */
  getDrafts(): QuoteSummary[];

  getQuotesByStatus(status: CurrentQuoteStatus): QuoteSummary[];

  /**
   * Retrieves the full details of a specific draft by its ID.
   * @param id The unique identifier of the draft.
   * @returns The QuoteDraft object if found, or null if it doesn't exist.
   */
  getDraftById(id: number): QuoteDraft | null;

  /**
   * Retrieves the full details of a specific quote by its ID.
   * @param id The unique identifier of the quote.
   * @returns The QuoteDraft object if found, or null if it doesn't exist.
   */
  getQuoteById(id: number): QuoteDraft | null;

  /**
   * Changes the status of a quote to the requested next status.
   * @param id The unique identifier of the quote.
   * @param nextStatus The requested next status.
   * @returns A boolean indicating whether the operation was successful.
   */
  updateQuoteStatus(id: number, nextStatus: CurrentQuoteStatus): boolean;

  /**
   * Changes an authorized quote to issued/emitted, making it a client document.
   * @param id The unique identifier of the draft to issue.
   * @returns A boolean indicating whether the operation was successful.
   */
  issueQuote(payload: IssueQuoteRequest): boolean;

  countIssuedQuotesByYear(year: number): number;

  folioExists(folio: string, excludeQuoteId?: number): boolean;

  /**
   * Retrieves a summary list of all quotes that have been issued (status 'issued').
   * @returns An array of QuoteSummary objects for issued quotes.
   */
  getIssuedQuotes(): QuoteSummary[];
}
