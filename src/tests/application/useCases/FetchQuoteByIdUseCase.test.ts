import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { FetchQuoteByIdUseCase } from '../../../main/application/useCases/FetchQuoteByIdUseCase';
import { IQuoteRepository } from '../../../main/domain/repositories/IQuoteRepository';

describe('FetchQuoteByIdUseCase', () => {
  let useCase: FetchQuoteByIdUseCase;
  let mockRepository: Mocked<IQuoteRepository>;

  beforeEach(() => {
    mockRepository = {
      saveDraft: vi.fn(),
      getDrafts: vi.fn(),
      getDraftById: vi.fn(),
      issueQuote: vi.fn(),
      getIssuedQuotes: vi.fn(),
      getQuoteById: vi.fn()
    };
    useCase = new FetchQuoteByIdUseCase(mockRepository);
  });

  it('should return a QuoteDraft when the repository finds the ID', () => {
    const mockQuote = { id: 1, activity: 'collection' } as any;
    mockRepository.getQuoteById.mockReturnValue(mockQuote);

    const result = useCase.execute(1);

    expect(mockRepository.getQuoteById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockQuote);
  });

  it('should return null when the repository does not find the ID', () => {
    mockRepository.getQuoteById.mockReturnValue(null);

    const result = useCase.execute(99);

    expect(mockRepository.getQuoteById).toHaveBeenCalledWith(99);
    expect(result).toBeNull();
  });
});