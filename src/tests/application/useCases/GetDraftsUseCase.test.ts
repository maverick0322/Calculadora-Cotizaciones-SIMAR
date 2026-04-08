import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDraftsUseCase } from '../../../main/application/useCases/GetDraftsUseCase';
import { IQuoteRepository } from '../../../main/domain/repositories/IQuoteRepository';

describe('GetDraftsUseCase', () => {
  let mockRepository: IQuoteRepository;
  let getDraftsUseCase: GetDraftsUseCase;

  beforeEach(() => {
    mockRepository = {
      saveDraft: vi.fn(),
      getDrafts: vi.fn(),
      getDraftById: vi.fn(),
      issueQuote: vi.fn(),
      getIssuedQuotes: vi.fn(),
      getQuoteById: vi.fn()
    };
    getDraftsUseCase = new GetDraftsUseCase(mockRepository);
  });

  // --- AC 1: HAPPY PATH (GET ALL) ---
  it('should return a list of draft summaries from the repository', () => {
    // [ ARRANGE ]
    const mockDraftsList = [
      { id: 1, folio: '#001', location: 'Centro', waste: 'domestic', volume: '10 kg', createdAt: 12345, status: 'draft' },
      { id: 2, folio: '#002', location: 'Sur', waste: 'organic', volume: '5 kg', createdAt: 12346, status: 'draft' }
    ];
    vi.mocked(mockRepository.getDrafts).mockReturnValue(mockDraftsList as any);

    // [ ACT ]
    const result = getDraftsUseCase.execute();

    // [ ASSERT ]
    expect(mockRepository.getDrafts).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, data: mockDraftsList });
  });

  // --- AC 2: EXCEPTION HANDLING ---
  it('should return success false and error message when repository fails', () => {
    // [ ARRANGE ]
    const dbError = new Error('Database connection lost');
    vi.mocked(mockRepository.getDrafts).mockImplementation(() => {
      throw dbError;
    });

    // [ ACT ]
    const result = getDraftsUseCase.execute();

    // [ ASSERT ]
    expect(mockRepository.getDrafts).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: false, error: 'Database connection lost' });
      });
});