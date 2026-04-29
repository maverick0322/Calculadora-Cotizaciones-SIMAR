import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocationStep } from '../../../../renderer/src/features/cotizacion/components/LocationStep';
import * as useLocationHook from '../../../../renderer/src/features/cotizacion/hooks/useLocationAutocomplete';

import { useFormContext } from 'react-hook-form';

vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
  useWatch: vi.fn()
}));

vi.spyOn(useLocationHook, 'useLocationAutocomplete').mockReturnValue({
  states: ['VERACRUZ'],
  municipalities: ['XALAPA'],
  colonies: ['CENTRO'],
  isLoading: false,
  saveCustomColony: vi.fn(),
  isMunicipalityDisabled: false,
  isColonyDisabled: false
});

describe('LocationStep Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useFormContext).mockReturnValue({
      register: vi.fn((name) => ({ name, onBlur: vi.fn() })),
      control: {},
      setValue: vi.fn(), 
      formState: { errors: {} }
    } as any);
  });

  it('should render labels and inputs correctly', () => {
    render(<LocationStep serviceIndex={0} />);

    expect(screen.getByText('Ubicación de Recolección')).toBeDefined();
    expect(screen.getByText('Dirección de la sucursal / origen (Calle y Número)')).toBeDefined();
    expect(screen.getByText('Código Postal')).toBeDefined();
    expect(screen.getByText('Estado')).toBeDefined();
    expect(screen.getByText('Ciudad / Municipio')).toBeDefined();
    expect(screen.getByText('Colonia')).toBeDefined();
  });

  it('should display a red error message when location fields have validation errors', () => {
    vi.mocked(useFormContext).mockReturnValue({
      register: vi.fn((name) => ({ name, onBlur: vi.fn() })),
      control: {},
      setValue: vi.fn(),
      formState: {
        errors: {
          services: [{
            location: {
              street: { message: 'La calle es obligatoria' }
            }
          }]
        }
      }
    } as any);

    render(<LocationStep serviceIndex={0} />);
    
    expect(screen.getByText('La calle es obligatoria')).toBeDefined();
  });
});