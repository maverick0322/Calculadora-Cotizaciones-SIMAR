import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IssueQuoteUseCase } from '../../../main/application/useCases/IssueQuoteUseCase';
import { AppError } from '../../../main/application/errors/AppError';
import { IConditionRepository } from '../../../main/domain/repositories/IConditionRepository';
import { IQuoteRepository } from '../../../main/domain/repositories/IQuoteRepository';
import { IssueQuoteRequest } from '../../../shared/types/Quote';

const buildIssuePayload = (): IssueQuoteRequest => ({
  quoteId: 15,
  folio: '001-0526-GIR-ADO',
  preparedByUserId: 3,
  preparedByInitials: 'EVL',
  quoteTypeCode: 'GIR',
  conditions: [{
    conditionId: 1,
    type: 'commercial',
    title: 'Vigencia',
    description: 'La cotización mantiene la vigencia indicada.',
    isCustom: false
  }]
});

describe('IssueQuoteUseCase', () => {
  let mockRepository: IQuoteRepository;
  let mockConditionRepository: IConditionRepository;
  let mockAuditUseCase: { execute: ReturnType<typeof vi.fn> };
  let issueQuoteUseCase: IssueQuoteUseCase;

  beforeEach(() => {
    mockRepository = {
      saveDraft: vi.fn(),
      getDrafts: vi.fn(),
      getQuotesByStatus: vi.fn(),
      getDraftById: vi.fn(),
      issueQuote: vi.fn(),
      getIssuedQuotes: vi.fn(),
      getQuoteById: vi.fn(),
      updateQuoteStatus: vi.fn(),
      countIssuedQuotesByYear: vi.fn(),
      folioExists: vi.fn()
    };

    mockConditionRepository = {
      listActive: vi.fn(),
      listActiveByServiceTypes: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      deactivate: vi.fn(),
      saveQuoteSnapshot: vi.fn()
    };

    mockAuditUseCase = {
      execute: vi.fn()
    };

    issueQuoteUseCase = new IssueQuoteUseCase(mockRepository, mockConditionRepository, mockAuditUseCase as any);
  });

  it('returns success and persists condition snapshot when the repository emits the quote', async () => {
    const payload = buildIssuePayload();
    vi.mocked(mockRepository.issueQuote).mockReturnValue(true);

    const result = await issueQuoteUseCase.execute(payload);

    expect(mockRepository.issueQuote).toHaveBeenCalledWith(payload);
    expect(mockConditionRepository.saveQuoteSnapshot).toHaveBeenCalledWith(payload.quoteId, payload.conditions);
    expect(mockAuditUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
      action: 'ISSUE_QUOTE',
      entityId: payload.quoteId
    }));
    expect(result).toEqual({ success: true });
  });

  it('returns a specific business error when repository rejects the transition', async () => {
    const payload = buildIssuePayload();
    vi.mocked(mockRepository.issueQuote).mockImplementation(() => {
      throw new AppError('INVALID_STATUS_TRANSITION', 'Solo una cotización autorizada puede emitirse.', {
        quoteId: payload.quoteId
      });
    });

    const result = await issueQuoteUseCase.execute(payload);

    expect(mockConditionRepository.saveQuoteSnapshot).not.toHaveBeenCalled();
    expect(mockAuditUseCase.execute).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Solo una cotización autorizada puede emitirse.');
  });

  it('keeps the quote emitted when the auxiliary condition table snapshot fails', async () => {
    const payload = buildIssuePayload();
    vi.mocked(mockRepository.issueQuote).mockReturnValue(true);
    vi.mocked(mockConditionRepository.saveQuoteSnapshot).mockImplementation(() => {
      throw new Error('Auxiliary table unavailable');
    });

    const result = await issueQuoteUseCase.execute(payload);

    expect(mockAuditUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });
});
