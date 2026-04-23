import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WasteStep } from '@renderer/features/cotizacion/components/WasteStep';
import * as RHF from 'react-hook-form';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useFormContext: vi.fn(),
    useFieldArray: vi.fn(),
  };
});

describe('WasteStep Component', () => {
  const mockRegister = vi.fn();
  const mockWatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- AC 1: BASIC RENDERING ---
  it('should render all labels and register the fields correctly', () => {
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      control: {},
      watch: mockWatch,
      formState: { errors: {} }
    } as any);

    vi.mocked(RHF.useFieldArray).mockReturnValue({
      fields: [{ id: 'fake-uuid-1' }],
      append: vi.fn(),
      remove: vi.fn()
    } as any);

    mockWatch.mockReturnValue('weekly');

    render(<WasteStep serviceIndex={0} />);

    expect(screen.getByText('Especificaciones Operativas')).toBeDefined();
    expect(screen.getByText('Tipo de actividad')).toBeDefined();
    expect(screen.getByText('Frecuencia Global del Contrato')).toBeDefined();
    expect(screen.getByText('Residuos a recolectar en esta sucursal')).toBeDefined();
    expect(screen.getByText('Nombre del residuo')).toBeDefined();
    expect(screen.getByText('Clasificación')).toBeDefined(); // Cambiado de "Tipo de residuo"

    expect(mockRegister).toHaveBeenCalledWith('services.0.activity');
    expect(mockRegister).toHaveBeenCalledWith('services.0.wastes.0.name');
    expect(mockRegister).toHaveBeenCalledWith('services.0.wastes.0.type');
    expect(mockRegister).toHaveBeenCalledWith('services.0.wastes.0.quantity', { valueAsNumber: true }); // Agregado { valueAsNumber: true }
    expect(mockRegister).toHaveBeenCalledWith('services.0.wastes.0.unit');
  });

  // --- AC 2: SELECT OPTIONS VALIDATION ---
  it('should render the correct options in the select dropdowns', () => {
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      control: {},
      watch: mockWatch,
      formState: { errors: {} }
    } as any);

    vi.mocked(RHF.useFieldArray).mockReturnValue({
      fields: [{ id: 'fake-uuid-1' }],
      append: vi.fn(),
      remove: vi.fn()
    } as any);

    render(<WasteStep serviceIndex={0} />);

    expect(screen.getByRole('option', { name: 'Recolección' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Disposición Final' })).toBeDefined();
    
    expect(screen.getByRole('option', { name: 'Doméstico' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Peligroso' })).toBeDefined();
    
    expect(screen.getByRole('option', { name: 'kg' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'm³' })).toBeDefined();
    
    expect(screen.getByRole('option', { name: 'Diaria' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Evento Único' })).toBeDefined();
  });
});