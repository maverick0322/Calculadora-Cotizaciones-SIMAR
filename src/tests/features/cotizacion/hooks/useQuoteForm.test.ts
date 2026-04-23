import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuoteForm } from '../../../../renderer/src/features/cotizacion/hooks/useQuoteForm';
import toast from 'react-hot-toast';
import { QuoteDraft } from '../../../../shared/types/Quote';

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(() => 'mock-toast-id')
  }
}));

describe('useQuoteForm Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.api = {
      getDraftById: vi.fn(),
      saveDraft: vi.fn()
    } as any;
  });

  const getValidMockDraft = (): QuoteDraft => ({
    id: 10,
    clientName: 'Empresa',
    clientRfc: 'EMP123',
    validityDays: 15,
    frequency: { type: 'weekly' },
    services: [
      {
        id: '123',
        activity: 'collection',
        location: { street: 'Av 1', municipality: 'X', neighborhood: 'Y', state: 'Z' },
        wastes: [{ name: 'B', type: 'domestic', quantity: 1, unit: 'kg' }],
        vehicles: [],
        crew: [],
        supplies: [],
        extraCosts: [],
        logistics: {
          origin: 'A',
          primaryDestination: 'B',
          kilometers: 10,
          fuelLiters: 10,
          fuelPricePerLiter: 20,
          roadType: 'toll', // Simulamos que trae "toll"
          tolls: 2,
          totalTollCost: 100,
          viaticos: 0
        }
      }
    ],
    status: 'draft',
    createdAt: 100000
  });

  it('should initialize with default values when no editId is provided', () => {
    const { result } = renderHook(() => useQuoteForm());
    expect(result.current.form.getValues().services[0].activity).toBe('collection');
  });

  it('should fetch draft data and show success toast when editId is provided', async () => {
    vi.mocked(window.api.getDraftById).mockResolvedValue({ success: true, data: getValidMockDraft() });
    const { result } = renderHook(() => useQuoteForm(10));
    await waitFor(() => {
      expect(window.api.getDraftById).toHaveBeenCalledWith(10);
      expect(toast.success).toHaveBeenCalledWith('Borrador listo para editar', expect.any(Object));
    });
  });

  it('should show error toast when fetchDraftData returns success false', async () => {
    vi.mocked(window.api.getDraftById).mockResolvedValue({ success: false, error: 'Not found' });
    renderHook(() => useQuoteForm(99));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No se pudo cargar el borrador', expect.any(Object));
    });
  });

  it('should format payload, clean roadType, and inject metadata before saving', async () => {
    vi.mocked(window.api.saveDraft).mockResolvedValue({ success: true, id: 5 });
    const { result } = renderHook(() => useQuoteForm(5)); // Simulamos que estamos editando el draft 5

    let successResult = false;
    
    // Obtenemos los valores por defecto
    const formValues = result.current.form.getValues();
    // Forzamos un roadType vacío para probar la limpieza
    formValues.services[0].logistics.roadType = '';

    await act(async () => {
      successResult = await result.current.submitDraft(formValues, 100, 116);
    });

    const calledPayload = vi.mocked(window.api.saveDraft).mock.calls[0][0];

    expect(successResult).toBe(true);
    expect(calledPayload.id).toBe(5);
    expect(calledPayload.status).toBe('draft');
    expect(calledPayload.subtotal).toBe(100);
    expect(calledPayload.total).toBe(116);
    // Verificamos que el roadType vacío se limpió a undefined
    expect(calledPayload.services[0].logistics.roadType).toBeUndefined(); 
  });

  it('should return false when saveDraft catches an exception', async () => {
    vi.mocked(window.api.saveDraft).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useQuoteForm());
    
    let successResult = true;
    await act(async () => {
      successResult = await result.current.submitDraft(result.current.form.getValues());
    });
    
    expect(successResult).toBe(false);
  });
});