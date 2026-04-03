import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveDraftUseCase } from '../../../main/application/useCases/SaveDraftUseCase';
import { IQuoteRepository } from '../../../main/domain/repositories/IQuoteRepository';
import { QuoteDraft } from '../../../shared/types/Quote';

describe('SaveDraftUseCase', () => {
  let mockRepository: IQuoteRepository;
  let saveDraftUseCase: SaveDraftUseCase;

  beforeEach(() => {
    mockRepository = {
      saveDraft: vi.fn(),
      getDrafts: vi.fn(),
      getDraftById: vi.fn(),
    };
    
    saveDraftUseCase = new SaveDraftUseCase(mockRepository);
  });

  // --- AC 1: HAPPY PATH (CREATE) ---
  it('should save a new draft and return success with generated ID when valid data is provided', () => {
    // [ ARRANGE ]
    const newDraftPayload: QuoteDraft = {
      location: { street: 'Test St', municipality: 'Test City', neighborhood: 'Test Area' },
      activity: 'collection',
      waste: 'domestic',
      volumeQuantity: 10,
      volumeUnit: 'kg',
      frequency: 'weekly',
      status: 'draft',
      createdAt: 1234567890
    };
    const expectedGeneratedId = 100;
    vi.mocked(mockRepository.saveDraft).mockReturnValue(expectedGeneratedId);

    // [ ACT ]
    const result = saveDraftUseCase.execute(newDraftPayload);

    // [ ASSERT ]
    expect(mockRepository.saveDraft).toHaveBeenCalledTimes(1);
    expect(mockRepository.saveDraft).toHaveBeenCalledWith(newDraftPayload);
    expect(result).toEqual({ 
      success: true, 
      id: expectedGeneratedId, 
      message: 'Draft saved successfully' 
    });
  });

  // --- AC 2: HAPPY PATH (UPDATE) ---
  it('should update an existing draft when payload contains an ID', () => {
    // [ ARRANGE ]
    const existingDraftPayload: QuoteDraft = {
      id: 5,
      location: { street: 'Updated St', municipality: 'Test City', neighborhood: 'Test Area' },
      activity: 'collection',
      waste: 'domestic',
      volumeQuantity: 10,
      volumeUnit: 'kg',
      frequency: 'weekly',
      status: 'draft',
      createdAt: 1234567890
    };
    vi.mocked(mockRepository.saveDraft).mockReturnValue(5);

    // [ ACT ]
    const result = saveDraftUseCase.execute(existingDraftPayload);

    // [ ASSERT ]
    expect(mockRepository.saveDraft).toHaveBeenCalledTimes(1);
    expect(mockRepository.saveDraft).toHaveBeenCalledWith(existingDraftPayload);
    expect(result).toEqual({ 
      success: true, 
      id: 5, 
      message: 'Draft saved successfully' 
    });
  });

  // --- AC 3: EXCEPTION HANDLING ---
  it('should throw an error when repository fails', () => {
    // [ ARRANGE ]
    const validPayload: QuoteDraft = {
      location: { street: 'Test St', municipality: 'City', neighborhood: 'Area' },
      activity: 'collection',
      waste: 'domestic',
      volumeQuantity: 10,
      volumeUnit: 'kg',
      frequency: 'weekly',
      status: 'draft',
      createdAt: 1234567890
    };
    const dbError = new Error('Database locked');
    vi.mocked(mockRepository.saveDraft).mockImplementation(() => {
      throw dbError;
    });

    // [ ACT & ASSERT ]
    expect(() => saveDraftUseCase.execute(validPayload)).toThrowError('Database locked');
    expect(mockRepository.saveDraft).toHaveBeenCalledTimes(1);
  });
});