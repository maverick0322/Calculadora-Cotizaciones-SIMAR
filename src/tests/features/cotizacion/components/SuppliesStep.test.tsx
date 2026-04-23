import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuppliesStep } from '@renderer/features/cotizacion/components/SuppliesStep';
import * as RHF from 'react-hook-form';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useFormContext: vi.fn(),
    useFieldArray: vi.fn(),
  };
});

describe('SuppliesStep Component', () => {
  const mockRegister = vi.fn();
  const mockSetValue = vi.fn();
  
  const mockCatalogs = {
    warehouses: [],
    vehicles: [],
    supplies: [
      { id: 1, name: 'Bolsas Negras', unit: 'paquete', suggested_price: 150 }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- AC 1: RENDER AND EMPTY STATES ---
  it('should render empty states when no supplies or extra costs are added', () => {
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      setValue: mockSetValue,
      control: {},
      formState: { errors: {} }
    } as any);

    vi.mocked(RHF.useFieldArray).mockReturnValue({
      fields: [],
      append: vi.fn(),
      remove: vi.fn()
    } as any);

    render(<SuppliesStep serviceIndex={0} catalogs={mockCatalogs} />);

    expect(screen.getByText('Insumos y Materiales')).toBeDefined();
    expect(screen.getByText('No has agregado insumos. Haz clic en "Agregar Insumo" si los necesitas.')).toBeDefined();
    
    expect(screen.getByText('Costos Adicionales (Opcional)')).toBeDefined();
    expect(screen.getByText('Sin costos adicionales configurados.')).toBeDefined();
  });

  // --- AC 2: RENDER FIELDS ---
  it('should render fields when items exist', () => {
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      setValue: mockSetValue,
      control: {},
      formState: { errors: {} }
    } as any);

    vi.mocked(RHF.useFieldArray)
      .mockReturnValueOnce({ fields: [{ id: 's1' }], append: vi.fn(), remove: vi.fn() } as any) // Supplies
      .mockReturnValueOnce({ fields: [{ id: 'e1' }], append: vi.fn(), remove: vi.fn() } as any); // Extras

    render(<SuppliesStep serviceIndex={0} catalogs={mockCatalogs} />);

    expect(screen.getByText('Tipo de Insumo')).toBeDefined();
    expect(screen.getByText('Descripción del Cargo')).toBeDefined();
    
    expect(mockRegister).toHaveBeenCalledWith('services.0.supplies.0.supplyId', { valueAsNumber: true });
    expect(mockRegister).toHaveBeenCalledWith('services.0.extraCosts.0.amount', { valueAsNumber: true });
  });

  // --- AC 3: APPEND FUNCTIONALITY ---
  it('should call append when add buttons are clicked', () => {
    const appendSupplyMock = vi.fn();
    const appendExtraMock = vi.fn();

    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      setValue: mockSetValue,
      control: {},
      formState: { errors: {} }
    } as any);

    vi.mocked(RHF.useFieldArray)
      .mockReturnValueOnce({ fields: [], append: appendSupplyMock, remove: vi.fn() } as any)
      .mockReturnValueOnce({ fields: [], append: appendExtraMock, remove: vi.fn() } as any);

    render(<SuppliesStep serviceIndex={0} catalogs={mockCatalogs} />);

    fireEvent.click(screen.getByRole('button', { name: /Agregar Insumo/i }));
    fireEvent.click(screen.getByRole('button', { name: /Agregar Costo Extra/i }));

    expect(appendSupplyMock).toHaveBeenCalledTimes(1);
    expect(appendExtraMock).toHaveBeenCalledTimes(1);
  });
});