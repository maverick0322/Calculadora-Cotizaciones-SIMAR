import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetIssuedQuotesUseCase } from '../../../main/application/useCases/GetIssuedQuotesUseCase';

describe('GetIssuedQuotesUseCase', () => {
  let mockRepository: any;
  let useCase: GetIssuedQuotesUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRepository = {
      getIssuedQuotes: vi.fn(),
    };
    
    useCase = new GetIssuedQuotesUseCase(mockRepository);
  });

  // --- AC 1: HAPPY PATH ---
  it('should return success true and the list of issued quotes', () => {
    // [ ARRANGE ]
    const mockIssuedQuotes = [
      { id: 10, folio: '#010', status: 'issued', waste: 'domestic' },
      { id: 11, folio: '#011', status: 'issued', waste: 'hazardous' }
    ];
    mockRepository.getIssuedQuotes.mockReturnValue(mockIssuedQuotes);

    // [ ACT ]
    const result = useCase.execute();

    // [ ASSERT ]
    expect(mockRepository.getIssuedQuotes).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: true,
      data: mockIssuedQuotes
    });
  });

  // --- AC 2: ERROR HANDLING ---
  it('should return success false and the error message if repository throws an error', () => {
    // [ ARRANGE ]
    mockRepository.getIssuedQuotes.mockImplementation(() => {
      throw new Error('Database locked');
    });

    // [ ACT ]
    const result = useCase.execute();

    // [ ASSERT ]
    expect(mockRepository.getIssuedQuotes).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: 'Database locked'
    });
  });
});