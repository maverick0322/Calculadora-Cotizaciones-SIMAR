import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { IssueQuoteUseCase } from '../../../main/application/useCases/IssueQuoteUseCase';
import { IQuoteRepository } from '../../../main/domain/repositories/IQuoteRepository';

describe('IssueQuoteUseCase', () => {
  let useCase: IssueQuoteUseCase;
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
    useCase = new IssueQuoteUseCase(mockRepository);
  });

  it('should return success true when the repository successfully issues the quote', async () => {
    mockRepository.issueQuote.mockReturnValue(true);

    const result = await useCase.execute(15);

    expect(mockRepository.issueQuote).toHaveBeenCalledWith(15);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return success false and an error message when the repository fails to issue the quote', async () => {
    mockRepository.issueQuote.mockReturnValue(false);

    const result = await useCase.execute(99);

    expect(result.success).toBe(false);
    expect(result.error).toContain('No se pudo emitir la cotización');
  });

  it('should return success false when the repository throws an exception', async () => {
    mockRepository.issueQuote.mockImplementation(() => {
      throw new Error('Database locked');
    });

    const result = await useCase.execute(15);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database locked');
  });
});