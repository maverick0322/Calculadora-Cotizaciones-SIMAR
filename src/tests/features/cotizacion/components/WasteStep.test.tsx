import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WasteStep } from '@renderer/features/cotizacion/components/WasteStep';
import * as RHF from 'react-hook-form';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useFormContext: vi.fn(),
  };
});

describe('WasteStep Component', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- AC 1: BASIC RENDERING ---
  it('should render all labels and register the fields correctly', () => {
    // [ ARRANGE ]
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
    } as any);

    // [ ACT ]
    render(<WasteStep />);

    // [ ASSERT ]
    expect(screen.getByText('Especificaciones del residuo')).toBeDefined();
    expect(screen.getByText('Tipo de actividad')).toBeDefined();
    expect(screen.getByText('Tipo de residuo')).toBeDefined();
    expect(screen.getByText('Cantidad')).toBeDefined();
    expect(screen.getByText('Unidad')).toBeDefined();
    expect(screen.getByText('Frecuencia de servicio')).toBeDefined();

    expect(mockRegister).toHaveBeenCalledWith('activity');
    expect(mockRegister).toHaveBeenCalledWith('waste');
    expect(mockRegister).toHaveBeenCalledWith('volumeQuantity');
    expect(mockRegister).toHaveBeenCalledWith('volumeUnit');
    expect(mockRegister).toHaveBeenCalledWith('frequency');
  });

  // --- AC 2: SELECT OPTIONS VALIDATION ---
  it('should render the correct options in the select dropdowns', () => {
    // [ ARRANGE ]
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
    } as any);

    // [ ACT ]
    render(<WasteStep />);

    // [ ASSERT ]
    expect(screen.getByRole('option', { name: 'Recolección' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Disposición Final' })).toBeDefined();
    
    expect(screen.getByRole('option', { name: 'Doméstico' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Peligroso' })).toBeDefined();
    
    expect(screen.getByRole('option', { name: 'kg' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'm³' })).toBeDefined();
    
    expect(screen.getByRole('option', { name: 'Diaria' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Única' })).toBeDefined();
  });
});