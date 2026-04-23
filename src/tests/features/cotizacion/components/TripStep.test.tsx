import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TripStep } from '@renderer/features/cotizacion/components/TripStep';
import * as RHF from 'react-hook-form';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useFormContext: vi.fn(),
  };
});

describe('TripStep Component', () => {
  const mockRegister = vi.fn();
  const mockWatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- AC 1: BASIC RENDERING ---
  it('should render main inputs and register them without errors', () => {
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      watch: mockWatch,
      formState: { errors: {} },
    } as any);

    mockWatch.mockReturnValue('free');

    render(<TripStep serviceIndex={0} />);

    expect(screen.getByText('Logística del Viaje')).toBeDefined();
    
    expect(mockRegister).toHaveBeenCalledWith('services.0.logistics.origin');
    expect(mockRegister).toHaveBeenCalledWith('services.0.logistics.primaryDestination');
    // Ahora esperamos el objeto extra para los numéricos
    expect(mockRegister).toHaveBeenCalledWith('services.0.logistics.kilometers', { valueAsNumber: true });
    expect(mockRegister).toHaveBeenCalledWith('services.0.logistics.roadType');
    
    expect(screen.queryByText('Número de Casetas')).toBeNull();
  });

  // --- AC 2: CONDITIONAL RENDERING (TOLL) ---
  it('should render toll inputs ONLY when roadType is "toll"', () => {
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      watch: mockWatch,
      formState: { errors: {} },
    } as any);

    mockWatch.mockReturnValue('toll');

    render(<TripStep serviceIndex={0} />);

    expect(screen.getByText('Número de Casetas')).toBeDefined();
    expect(screen.getByText('Costo Total Casetas ($)')).toBeDefined();

    expect(mockRegister).toHaveBeenCalledWith('services.0.logistics.tolls', { valueAsNumber: true });
    expect(mockRegister).toHaveBeenCalledWith('services.0.logistics.totalTollCost', { valueAsNumber: true });
  });

  // --- AC 3: VISUAL ERROR HANDLING ---
  it('should display error messages when origin or destination have validation errors', () => {
    const originError = 'El origen no puede estar vacío';
    const destError = 'El destino es muy corto';

    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      watch: mockWatch,
      formState: { 
        errors: { 
          services: [
            {
              logistics: {
                origin: { message: originError },
                primaryDestination: { message: destError }
              }
            }
          ]
        } 
      },
    } as any);

    mockWatch.mockReturnValue('free');

    render(<TripStep serviceIndex={0} />);

    expect(screen.getByText(originError)).toBeDefined();
    expect(screen.getByText(destError)).toBeDefined();
  });
});