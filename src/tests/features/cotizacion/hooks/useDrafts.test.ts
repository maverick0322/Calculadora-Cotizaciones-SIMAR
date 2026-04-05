declare global {
  interface Window {
    api: any;
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDrafts } from '@renderer/features/cotizacion/hooks/useDrafts';

describe('useDrafts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    window.api = {
      getDrafts: vi.fn(),
    };
  });

  // --- AC 1: SUCCESFUL LOAD ---
  it('should fetch drafts on mount and update state successfully', async () => {
    // [ ARRANGE ]
    const mockDrafts = [
      { id: 1, folio: '#001', waste: 'domestic' }, 
      { id: 2, folio: '#002', waste: 'organic' }
    ];
    vi.mocked(window.api.getDrafts).mockResolvedValue({ success: true, data: mockDrafts });

    // [ ACT ]
    const { result } = renderHook(() => useDrafts());

    expect(result.current.loading).toBe(true);

    // [ ASSERT ]
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(window.api.getDrafts).toHaveBeenCalledTimes(1);
    expect(result.current.drafts).toEqual(mockDrafts);
  });

  // --- AC 2: HANDLED ERROR ---
  it('should handle API success false gracefully and keep drafts empty', async () => {
    // [ ARRANGE ]
    vi.mocked(window.api.getDrafts).mockResolvedValue({ success: false, error: 'No data' });

    // [ ACT ]
    const { result } = renderHook(() => useDrafts());

    // [ ASSERT ]
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.drafts).toEqual([]);
  });

  // --- AC 3: UNHANDLED ERROR (IPC EXCEPTION) ---
  it('should catch exceptions and keep drafts empty', async () => {
    // [ ARRANGE ]
    vi.mocked(window.api.getDrafts).mockRejectedValue(new Error('IPC Channel Closed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // [ ACT ]
    const { result } = renderHook(() => useDrafts());

    // [ ASSERT ]
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.drafts).toEqual([]);
  });
});