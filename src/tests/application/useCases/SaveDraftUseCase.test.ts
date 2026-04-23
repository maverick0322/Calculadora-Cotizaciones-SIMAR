import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveDraftUseCase } from '../../../main/application/useCases/SaveDraftUseCase';
import { IQuoteRepository } from '../../../main/domain/repositories/IQuoteRepository';
import { QuoteDraft } from '../../../shared/types/Quote';

describe('SaveDraftUseCase', () => {
  let mockRepository: IQuoteRepository;
  let mockAuditUseCase: any;
  let saveDraftUseCase: SaveDraftUseCase;

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

    saveDraftUseCase = new SaveDraftUseCase(mockRepository, mockAuditUseCase);
  });

  // Helper para generar payloads válidos con la nueva estructura
  const getValidDraftPayload = (overrides = {}): QuoteDraft => ({
    clientName: 'Cliente Prueba',
    clientRfc: 'XAXX010101000',
    validityDays: 15,
    frequency: { type: 'weekly' },
    services: [
      {
        location: { street: 'Test St', municipality: 'Test City', neighborhood: 'Test Area' },
        wastes: [
          { name: 'domestic', quantity: 10, unit: 'kg' }
        ]
      }
    ],
    status: 'draft',
    createdAt: 1234567890,
    ...overrides
  } as any);

  // --- AC 1: HAPPY PATH (CREATE) ---
  it('should save a new draft and return success with generated ID when valid data is provided', () => {
    const newDraftPayload = getValidDraftPayload();
    const expectedGeneratedId = 100;
    vi.mocked(mockRepository.saveDraft).mockReturnValue(expectedGeneratedId);

    const result = saveDraftUseCase.execute(newDraftPayload);

    expect(mockRepository.saveDraft).toHaveBeenCalledTimes(1);
    expect(mockRepository.saveDraft).toHaveBeenCalledWith(newDraftPayload);
    expect(mockAuditUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ 
      success: true, 
      id: expectedGeneratedId, 
      message: 'Draft saved successfully' 
    });
  });

  // --- AC 2: HAPPY PATH (UPDATE) ---
  it('should update an existing draft when payload contains an ID', () => {
    const existingDraftPayload = getValidDraftPayload({ id: 5 });
    vi.mocked(mockRepository.saveDraft).mockReturnValue(5);

    const result = saveDraftUseCase.execute(existingDraftPayload);

    expect(mockRepository.saveDraft).toHaveBeenCalledTimes(1);
    expect(mockRepository.saveDraft).toHaveBeenCalledWith(existingDraftPayload);
    expect(mockAuditUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ 
      success: true, 
      id: 5, 
      message: 'Draft saved successfully' 
    });
  });

  // --- AC 3: EXCEPTION HANDLING ---
  it('should throw an error when repository fails', () => {
    const validPayload = getValidDraftPayload();
    const dbError = new Error('Database locked');
    vi.mocked(mockRepository.saveDraft).mockImplementation(() => {
      throw dbError;
    });

    expect(() => saveDraftUseCase.execute(validPayload)).toThrowError('Database locked');
    expect(mockRepository.saveDraft).toHaveBeenCalledTimes(1);
    expect(mockAuditUseCase.execute).not.toHaveBeenCalled();
  });
});