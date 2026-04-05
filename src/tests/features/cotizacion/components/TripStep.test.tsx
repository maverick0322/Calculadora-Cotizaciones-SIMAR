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
    // [ ARRANGE ]
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      watch: mockWatch,
      formState: { errors: {} },
    } as any);

    mockWatch.mockReturnValue('free');

    // [ ACT ]
    render(<TripStep />);

    // [ ASSERT ]
    expect(screen.getByText('Logística del Viaje')).toBeDefined();
    
    expect(mockRegister).toHaveBeenCalledWith('trip.origin');
    expect(mockRegister).toHaveBeenCalledWith('trip.destinationWarehouse');
    expect(mockRegister).toHaveBeenCalledWith('trip.kilometers');
    expect(mockRegister).toHaveBeenCalledWith('trip.roadType');
    
    expect(screen.queryByText('Número de Casetas')).toBeNull();
  });

  // --- AC 2: CONDITIONAL RENDERING (TOLL) ---
  it('should render toll inputs ONLY when roadType is "toll"', () => {
    // [ ARRANGE ]
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      watch: mockWatch,
      formState: { errors: {} },
    } as any);

    mockWatch.mockReturnValue('toll');

    // [ ACT ]
    render(<TripStep />);

    // [ ASSERT ]
    expect(screen.getByText('Número de Casetas')).toBeDefined();
    expect(screen.getByText('Costo Total Casetas ($)')).toBeDefined();

    expect(mockRegister).toHaveBeenCalledWith('trip.tolls');
    expect(mockRegister).toHaveBeenCalledWith('trip.totalTollCost');
  });

  // --- AC 3: VISUAL ERROR HANDLING ---
  it('should display error messages when origin or destination have validation errors', () => {
    // [ ARRANGE ]
    const originError = 'El origen no puede estar vacío';
    const destError = 'El destino es muy corto';

    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      watch: mockWatch,
      formState: { 
        errors: { 
          trip: {
            origin: { message: originError },
            destinationWarehouse: { message: destError }
          }
        } 
      },
    } as any);

    mockWatch.mockReturnValue('free');

    // [ ACT ]
    render(<TripStep />);

    // [ ASSERT ]
    expect(screen.getByText(originError)).toBeDefined();
    expect(screen.getByText(destError)).toBeDefined();
  });
});