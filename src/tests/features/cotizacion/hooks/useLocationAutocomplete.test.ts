import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFormContext, useWatch } from 'react-hook-form';
import { useLocationAutocomplete } from '@renderer/features/cotizacion/hooks/useLocationAutocomplete';

vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
  useWatch: vi.fn()
}));

describe('useLocationAutocomplete', () => {
  const setValue = vi.fn();
  let values: Record<string, string>;

  beforeEach(() => {
    vi.clearAllMocks();
    values = {
      'services.0.location.cp': '',
      'services.0.location.state': '',
      'services.0.location.municipality': ''
    };

    vi.mocked(useFormContext).mockReturnValue({ control: {}, setValue } as any);
    vi.mocked(useWatch).mockImplementation(({ name }: any) => values[name]);

    window.api = {
      getLocations: vi.fn(),
      addCustomLocation: vi.fn()
    } as any;
  });

  it('loads states on mount', async () => {
    vi.mocked(window.api.getLocations).mockResolvedValue({ success: true, data: ['VERACRUZ'] });

    const { result } = renderHook(() => useLocationAutocomplete('services.0.location'));

    await waitFor(() => expect(result.current.states).toEqual(['VERACRUZ']));
    expect(window.api.getLocations).toHaveBeenCalledWith('states');
    expect(result.current.isMunicipalityDisabled).toBe(true);
    expect(result.current.isColonyDisabled).toBe(true);
  });

  it('autocompletes state, municipality and colonies from a 5 digit CP', async () => {
    values['services.0.location.cp'] = '94299';
    vi.mocked(window.api.getLocations).mockImplementation((action: string) => {
      if (action === 'states') return Promise.resolve({ success: true, data: ['VERACRUZ'] });
      if (action === 'byCP') return Promise.resolve({
        success: true,
        data: [
          { state: 'VERACRUZ', municipality: 'BOCA DEL RIO', colony: 'COSTA DE ORO' },
          { state: 'VERACRUZ', municipality: 'BOCA DEL RIO', colony: 'PLAYA DE ORO' }
        ]
      });
      if (action === 'municipalities') return Promise.resolve({ success: true, data: ['BOCA DEL RIO'] });
      return Promise.resolve({ success: true, data: [] });
    });

    const { result } = renderHook(() => useLocationAutocomplete('services.0.location'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(result.current.colonies).toEqual(['COSTA DE ORO', 'PLAYA DE ORO']));

    expect(setValue).toHaveBeenCalledWith('services.0.location.state', 'VERACRUZ', { shouldValidate: true });
    expect(setValue).toHaveBeenCalledWith('services.0.location.municipality', 'BOCA DEL RIO', { shouldValidate: true });
  });

  it('loads municipalities and colonies when state and municipality are selected manually', async () => {
    values['services.0.location.state'] = 'VERACRUZ';
    values['services.0.location.municipality'] = 'XALAPA';

    vi.mocked(window.api.getLocations).mockImplementation((action: string) => {
      if (action === 'states') return Promise.resolve({ success: true, data: ['VERACRUZ'] });
      if (action === 'municipalities') return Promise.resolve({ success: true, data: ['XALAPA'] });
      if (action === 'colonies') return Promise.resolve({ success: true, data: ['CENTRO'] });
      return Promise.resolve({ success: true, data: [] });
    });

    const { result } = renderHook(() => useLocationAutocomplete('services.0.location'));

    await waitFor(() => expect(result.current.municipalities).toEqual(['XALAPA']));
    await waitFor(() => expect(result.current.colonies).toEqual(['CENTRO']));
    expect(result.current.isMunicipalityDisabled).toBe(false);
    expect(result.current.isColonyDisabled).toBe(false);
  });

  it('saves a custom colony and refreshes colonies', async () => {
    values['services.0.location.cp'] = '91000';
    values['services.0.location.state'] = 'VERACRUZ';
    values['services.0.location.municipality'] = 'XALAPA';

    vi.mocked(window.api.getLocations).mockResolvedValue({ success: true, data: ['CENTRO'] });
    vi.mocked(window.api.addCustomLocation).mockResolvedValue({ success: true, id: 5 });

    const { result } = renderHook(() => useLocationAutocomplete('services.0.location'));
    await waitFor(() => expect(result.current.states).toEqual(['CENTRO']));

    await act(async () => {
      expect(await result.current.saveCustomColony('Nueva Colonia')).toBe(true);
    });

    expect(window.api.addCustomLocation).toHaveBeenCalledWith({
      cp: '91000',
      state: 'VERACRUZ',
      municipality: 'XALAPA',
      colony: 'Nueva Colonia'
    });
    expect(setValue).toHaveBeenCalledWith('services.0.location.neighborhood', 'NUEVA COLONIA', { shouldValidate: true });
  });

  it('returns false when custom colony cannot be saved or required fields are missing', async () => {
    vi.mocked(window.api.getLocations).mockResolvedValue({ success: true, data: [] });
    vi.mocked(window.api.addCustomLocation).mockResolvedValue({ success: false, error: 'No se guardo' });

    const { result } = renderHook(() => useLocationAutocomplete('services.0.location'));

    await act(async () => {
      expect(await result.current.saveCustomColony('Nueva')).toBe(false);
    });

    values['services.0.location.state'] = 'VERACRUZ';
    values['services.0.location.municipality'] = 'XALAPA';
    const { result: resultWithState } = renderHook(() => useLocationAutocomplete('services.0.location'));

    await act(async () => {
      expect(await resultWithState.current.saveCustomColony('Nueva')).toBe(false);
    });
  });
});
