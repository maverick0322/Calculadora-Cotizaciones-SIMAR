import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useQuoteForm } from '@renderer/features/cotizacion/hooks/useQuoteForm';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: { loading: vi.fn(() => 'mock-toast-id'), success: vi.fn(), error: vi.fn() }
}));

describe('useQuoteForm Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    window.api = { 
      getDraftById: vi.fn(), 
      saveDraft: vi.fn() 
    } as any;
  });

  it('should initialize with default values when no editId is provided', () => {
    const { result } = renderHook(() => useQuoteForm());
    expect(result.current.form).toBeDefined();
    expect(window.api.getDraftById).not.toHaveBeenCalled(); 
  });

  it('should fetch draft data and show success toast when editId is provided', async () => {
    const mockDraft = { activity: 'collection', waste: 'domestic', location: { street: 'Main' } };
    vi.mocked(window.api.getDraftById).mockResolvedValue({ success: true, data: mockDraft });
    renderHook(() => useQuoteForm(15));
    await waitFor(() => expect(window.api.getDraftById).toHaveBeenCalledWith(15));
    expect(toast.success).toHaveBeenCalledWith('Borrador listo para editar', { id: 'mock-toast-id' });
  });

  it('should show error toast when fetchDraftData returns success false', async () => {
    vi.mocked(window.api.getDraftById).mockResolvedValue({ success: false, error: 'Error' });
    renderHook(() => useQuoteForm(99));
    await waitFor(() => expect(window.api.getDraftById).toHaveBeenCalledWith(99));
    expect(toast.error).toHaveBeenCalledWith('No se pudo cargar el borrador', { id: 'mock-toast-id' });
  });

  it('should format payload, clean roadType, and inject metadata before saving', async () => {
    const rawData = { activity: 'collection', waste: 'hazardous', trip: { roadType: '', kilometers: 10 } };
    vi.mocked(window.api.saveDraft).mockResolvedValue({ success: true, data: 1 });
    
    const { result } = renderHook(() => useQuoteForm(5));

    let successResult = false;
    await act(async () => {
      successResult = await result.current.submitDraft(rawData as any);
    });

    const calledPayload = vi.mocked(window.api.saveDraft).mock.calls[0][0];
    
    expect(successResult).toBe(true);
    expect(calledPayload.status).toBe('draft'); 
    expect(calledPayload.id).toBe(5); 
    expect(calledPayload.createdAt).toBeTypeOf('number'); 
    expect(calledPayload.trip!.roadType).toBeUndefined(); 
    expect(calledPayload.trip!.kilometers).toBe(10);
  });

  it('should return false when saveDraft catches an exception', async () => {
    vi.mocked(window.api.saveDraft).mockRejectedValue(new Error('DB Lock'));
    const { result } = renderHook(() => useQuoteForm());

    let successResult = true;
    await act(async () => {
      successResult = await result.current.submitDraft({} as any);
    });
    expect(successResult).toBe(false); 
  });
});