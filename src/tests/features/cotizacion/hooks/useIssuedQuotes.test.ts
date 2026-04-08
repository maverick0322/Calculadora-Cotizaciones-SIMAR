import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { useIssuedQuotes } from '../../../../renderer/src/features/cotizacion/hooks/useIssuedQuotes';

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
  }
}));

describe('useIssuedQuotes Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    window.api = {
      getIssuedQuotes: vi.fn()
    } as any;
  });

  // --- AC 1: HAPPY PATH ---
  it('should fetch and return issued quotes successfully', async () => {
    // [ ARRANGE ]
    const mockData = [
      { id: 1, folio: 'FOLIO-001', status: 'issued' },
      { id: 2, folio: 'FOLIO-002', status: 'issued' }
    ];
    vi.mocked(window.api.getIssuedQuotes).mockResolvedValue({ success: true, data: mockData } as any);

    // [ ACT ]
    const { result } = renderHook(() => useIssuedQuotes());

    expect(result.current.loading).toBe(true);

    // [ ASSERT ]
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(window.api.getIssuedQuotes).toHaveBeenCalledTimes(1);
    expect(result.current.issuedQuotes).toEqual(mockData);
    expect(toast.error).not.toHaveBeenCalled();
  });

  // --- AC 2: BUSINESS LOGIC ERROR ---
  it('should show an error toast if API returns success false', async () => {
    // [ ARRANGE ]
    vi.mocked(window.api.getIssuedQuotes).mockResolvedValue({ success: false } as any);

    // [ ACT ]
    const { result } = renderHook(() => useIssuedQuotes());

    // [ ASSERT ]
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.issuedQuotes).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith('Error al cargar el historial de cotizaciones');
  });

  // --- AC 3: IPC ERROR ---
  it('should handle IPC errors and show connection error toast', async () => {
    // [ ARRANGE ]
    vi.mocked(window.api.getIssuedQuotes).mockRejectedValue(new Error('IPC Connection Failed'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // [ ACT ]
    const { result } = renderHook(() => useIssuedQuotes());

    // [ ASSERT ]
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.issuedQuotes).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith('Error de conexión con la base de datos');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
