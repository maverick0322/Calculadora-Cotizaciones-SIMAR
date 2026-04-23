import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocationStep } from '@renderer/features/cotizacion/components/LocationStep';
import * as RHF from 'react-hook-form';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useFormContext: vi.fn(),
  };
});

describe('LocationStep Component', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- AC 1: BASIC RENDERING---
  it('should render labels, inputs, and register fields correctly when there are no errors', () => {
    // [ ARRANGE ]
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      formState: { errors: {} }
    } as any);

    // [ ACT ]
    // Ahora inyectamos el serviceIndex
    render(<LocationStep serviceIndex={0} />);

    // [ ASSERT ]
    expect(screen.getByText('Ubicación de Recolección')).toBeDefined();
    expect(screen.getByText('Dirección de la sucursal / origen')).toBeDefined();
    expect(screen.getByText('Ciudad / Municipio')).toBeDefined();
    expect(screen.getByText('Colonia')).toBeDefined();

    // Ahora busca la ruta multiservicio
    expect(mockRegister).toHaveBeenCalledWith('services.0.location.street');
    expect(mockRegister).toHaveBeenCalledWith('services.0.location.municipality');
    expect(mockRegister).toHaveBeenCalledWith('services.0.location.neighborhood');
  });

  // --- AC 2: VALIDATION ERROR HANDLING ---
  it('should display a red error message when location.street has a validation error', () => {
    // [ ARRANGE ]
    const errorMessage = 'La calle es obligatoria y debe tener al menos 3 caracteres';
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      formState: { 
        errors: { 
          services: [
            { location: { street: { message: errorMessage } } }
          ]
        } 
      }
    } as any);

    // [ ACT ]
    render(<LocationStep serviceIndex={0} />);

    // [ ASSERT ]
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeDefined();
    expect(errorElement.className).toContain('text-red-500');
  });
});