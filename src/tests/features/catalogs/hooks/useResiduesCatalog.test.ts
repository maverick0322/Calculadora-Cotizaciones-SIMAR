import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useResiduesCatalog } from '@renderer/features/catalogs/hooks/useResiduesCatalog';

describe('useResiduesCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.api = {
      manageResidues: vi.fn()
    } as any;
  });

  const residue = {
    id: 1,
    name: 'Carton',
    residue_type: 'rme',
    classification: 'RME',
    clave: 'R-001',
    unit: 'Kilogramo',
    base_price: 2
  };

  it('loads residues on mount', async () => {
    vi.mocked(window.api.manageResidues).mockResolvedValue({ success: true, data: [residue] });

    const { result } = renderHook(() => useResiduesCatalog());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(window.api.manageResidues).toHaveBeenCalledWith('get');
    expect(result.current.residues).toEqual([residue]);
    expect(result.current.error).toBeNull();
  });

  it('sets error when initial load fails or throws', async () => {
    vi.mocked(window.api.manageResidues).mockResolvedValueOnce({ success: false, error: 'No disponible' });

    const { result, rerender } = renderHook(() => useResiduesCatalog());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('No disponible');

    vi.mocked(window.api.manageResidues).mockRejectedValueOnce(new Error('network'));
    rerender();
  });

  it('adds, deletes and updates residues then refreshes the list', async () => {
    vi.mocked(window.api.manageResidues)
      .mockResolvedValueOnce({ success: true, data: [residue] })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: [residue] })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: [] })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: [residue] });

    const { result } = renderHook(() => useResiduesCatalog());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      expect(await result.current.addResidue({ ...residue, id: undefined } as any)).toBe(true);
      expect(await result.current.deleteResidue(1)).toBe(true);
      expect(await result.current.updatePrice(1, 4)).toBe(true);
    });

    expect(window.api.manageResidues).toHaveBeenCalledWith('add', expect.objectContaining({ name: 'Carton' }));
    expect(window.api.manageResidues).toHaveBeenCalledWith('delete', { id: 1 });
    expect(window.api.manageResidues).toHaveBeenCalledWith('updatePrice', { id: 1, newPrice: 4 });
  });

  it('returns false and stores errors when mutations fail', async () => {
    vi.mocked(window.api.manageResidues)
      .mockResolvedValueOnce({ success: true, data: [] })
      .mockResolvedValueOnce({ success: false, error: 'No se agrego' })
      .mockResolvedValueOnce({ success: false, error: 'No se borro' })
      .mockResolvedValueOnce({ success: false, error: 'No se actualizo' });

    const { result } = renderHook(() => useResiduesCatalog());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      expect(await result.current.addResidue(residue)).toBe(false);
    });
    expect(result.current.error).toBe('No se agrego');

    await act(async () => {
      expect(await result.current.deleteResidue(1)).toBe(false);
    });
    expect(result.current.error).toBe('No se borro');

    await act(async () => {
      expect(await result.current.updatePrice(1, 5)).toBe(false);
    });
    expect(result.current.error).toBe('No se actualizo');
  });
});
