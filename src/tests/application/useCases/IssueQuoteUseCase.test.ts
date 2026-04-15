import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IssueQuoteUseCase } from '../../../main/application/useCases/IssueQuoteUseCase';
import { IQuoteRepository } from '../../../main/domain/repositories/IQuoteRepository';

describe('IssueQuoteUseCase', () => {
  let mockRepository: IQuoteRepository;
  let mockAuditUseCase: any;
  let issueQuoteUseCase: IssueQuoteUseCase;

  beforeEach(() => {
    mockRepository = {
      saveDraft: vi.fn(),
      getDrafts: vi.fn(),
      getDraftById: vi.fn(),
      issueQuote: vi.fn(),
      getIssuedQuotes: vi.fn(),
      getQuoteById: vi.fn()
    };
    
    mockAuditUseCase = {
      execute: vi.fn()
    };

    issueQuoteUseCase = new IssueQuoteUseCase(mockRepository, mockAuditUseCase);
  });

  it('should return success true when the repository successfully issues the quote', async () => {
    vi.mocked(mockRepository.issueQuote).mockReturnValue(true);

    const result = await issueQuoteUseCase.execute(15);

    expect(mockRepository.issueQuote).toHaveBeenCalledWith(15);
    expect(mockAuditUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return success false and an error message when the repository fails to issue the quote', async () => {
    vi.mocked(mockRepository.issueQuote).mockReturnValue(false);

    const result = await issueQuoteUseCase.execute(99);

    expect(mockRepository.issueQuote).toHaveBeenCalledWith(99);
    expect(mockAuditUseCase.execute).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toBe('No se pudo emitir la cotización. Verifica que exista y sea un borrador.');
  });

  it('should return success false when the repository throws an exception', async () => {
    vi.mocked(mockRepository.issueQuote).mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const result = await issueQuoteUseCase.execute(15);

    expect(mockRepository.issueQuote).toHaveBeenCalledWith(15);
    expect(mockAuditUseCase.execute).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database connection failed');
  });
});