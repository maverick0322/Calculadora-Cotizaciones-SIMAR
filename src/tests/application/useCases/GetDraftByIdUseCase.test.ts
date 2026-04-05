import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDraftByIdUseCase } from '../../../main/application/useCases/GetDraftByIdUseCase';
import { IQuoteRepository } from '../../../main/domain/repositories/IQuoteRepository';

describe('GetDraftByIdUseCase', () => {
  let mockRepository: IQuoteRepository;
  let getDraftByIdUseCase: GetDraftByIdUseCase;

  beforeEach(() => {
    mockRepository = {
      saveDraft: vi.fn(),
      getDrafts: vi.fn(),
      getDraftById: vi.fn(),
    };
    getDraftByIdUseCase = new GetDraftByIdUseCase(mockRepository);
  });

  // --- AC 1: HAPPY PATH (FOUND) ---
  it('should return the draft when a valid existing ID is provided', () => {
    // [ ARRANGE ]
    const draftId = 5;
    const mockDraftData = { id: 5, activity: 'collection', waste: 'domestic' };
    vi.mocked(mockRepository.getDraftById).mockReturnValue(mockDraftData as any);

    // [ ACT ]
    const result = getDraftByIdUseCase.execute(draftId);

    // [ ASSERT ]
    expect(mockRepository.getDraftById).toHaveBeenCalledTimes(1);
    expect(mockRepository.getDraftById).toHaveBeenCalledWith(draftId);
    expect(result).toEqual(mockDraftData); 
  });

  // --- AC 2: NOT FOUND ---
  it('should return null when the requested ID does not exist', () => {
    // [ ARRANGE ]
    const nonExistentId = 999;
    vi.mocked(mockRepository.getDraftById).mockReturnValue(null);

    // [ ACT ]
    const result = getDraftByIdUseCase.execute(nonExistentId);

    // [ ASSERT ]
    expect(mockRepository.getDraftById).toHaveBeenCalledTimes(1);
    expect(mockRepository.getDraftById).toHaveBeenCalledWith(nonExistentId);
    expect(result).toBeNull();
  });

  // --- AC 3: EXCEPTION HANDLING ---
  it('should throw an error when repository fails', () => {
    // [ ARRANGE ]
    const draftId = 5;
    const dbError = new Error('Disk read error');
    vi.mocked(mockRepository.getDraftById).mockImplementation(() => {
      throw dbError;
    });

    // [ ACT & ASSERT ]
    expect(() => getDraftByIdUseCase.execute(draftId)).toThrowError('Disk read error');
  });
});