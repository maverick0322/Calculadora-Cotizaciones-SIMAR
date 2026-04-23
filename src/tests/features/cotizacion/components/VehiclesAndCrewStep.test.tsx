import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VehiclesAndCrewStep } from '@renderer/features/cotizacion/components/VehiclesAndCrewStep';
import * as RHF from 'react-hook-form';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useFormContext: vi.fn(),
    useFieldArray: vi.fn(),
  };
});

describe('VehiclesAndCrewStep Component', () => {
  const mockRegister = vi.fn();
  const mockSetValue = vi.fn();
  
  const mockCatalogs = {
    warehouses: [],
    supplies: [],
    vehicles: [
      { id: 1, name: 'Camioneta 3.5T', vehicle_type: 'camioneta', capacity_kg: 3500, base_price: 1500 }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- AC 1: RENDER AND EMPTY STATES ---
  it('should render empty states when no vehicles or crew are added', () => {
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      setValue: mockSetValue,
      control: {},
      formState: { errors: {} }
    } as any);

    // Simulamos que ambos FieldArray están vacíos
    vi.mocked(RHF.useFieldArray).mockReturnValue({
      fields: [],
      append: vi.fn(),
      remove: vi.fn()
    } as any);

    render(<VehiclesAndCrewStep serviceIndex={0} catalogs={mockCatalogs} />);

    expect(screen.getByText('Vehículos Asignados')).toBeDefined();
    expect(screen.getByText('No has asignado ningún vehículo. Haz clic en "Agregar Vehículo".')).toBeDefined();
    
    expect(screen.getByText('Personal Operativo')).toBeDefined();
    expect(screen.getByText('No has asignado personal. Recuerda que se necesita al menos un chofer.')).toBeDefined();
  });

  // --- AC 2: RENDER FIELDS ---
  it('should render fields when items exist', () => {
    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      setValue: mockSetValue,
      control: {},
      formState: { errors: {} }
    } as any);

    // Simulamos que hay 1 vehículo y 1 tripulante
    vi.mocked(RHF.useFieldArray)
      .mockReturnValueOnce({ fields: [{ id: 'v1' }], append: vi.fn(), remove: vi.fn() } as any) // Vehicles
      .mockReturnValueOnce({ fields: [{ id: 'c1' }], append: vi.fn(), remove: vi.fn() } as any); // Crew

    render(<VehiclesAndCrewStep serviceIndex={0} catalogs={mockCatalogs} />);

    expect(screen.getByText('Tipo de Vehículo')).toBeDefined();
    expect(screen.getByText('Puesto Operativo')).toBeDefined();
    expect(mockRegister).toHaveBeenCalledWith('services.0.vehicles.0.vehicleId', { valueAsNumber: true });
    expect(mockRegister).toHaveBeenCalledWith('services.0.crew.0.dailySalary', { valueAsNumber: true });
  });

  // --- AC 3: APPEND FUNCTIONALITY ---
  it('should call append when add buttons are clicked', () => {
    const appendVehicleMock = vi.fn();
    const appendCrewMock = vi.fn();

    vi.mocked(RHF.useFormContext).mockReturnValue({
      register: mockRegister,
      setValue: mockSetValue,
      control: {},
      formState: { errors: {} }
    } as any);

    vi.mocked(RHF.useFieldArray)
      .mockReturnValueOnce({ fields: [], append: appendVehicleMock, remove: vi.fn() } as any)
      .mockReturnValueOnce({ fields: [], append: appendCrewMock, remove: vi.fn() } as any);

    render(<VehiclesAndCrewStep serviceIndex={0} catalogs={mockCatalogs} />);

    fireEvent.click(screen.getByRole('button', { name: /Agregar Vehículo/i }));
    fireEvent.click(screen.getByRole('button', { name: /Agregar Personal/i }));

    expect(appendVehicleMock).toHaveBeenCalledTimes(1);
    expect(appendCrewMock).toHaveBeenCalledTimes(1);
  });
});