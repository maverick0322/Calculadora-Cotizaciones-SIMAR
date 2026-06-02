import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { VehiclesAndCrewStep } from '@renderer/features/cotizacion/components/VehiclesAndCrewStep';
import { QuoteFormValues } from '../../../../shared/schemas/quoteSchema';

const buildDefaultValues = (overrides: Partial<QuoteFormValues['services'][number]> = {}): QuoteFormValues => ({
  personType: 'moral',
  commercialName: '',
  clientName: 'Cliente Prueba',
  clientRfc: 'XAXX010101000',
  contactName: 'Contacto',
  contactPosition: '',
  contactPhone: '2281234567',
  contactEmail: 'contacto@cliente.test',
  validityDays: 15,
  services: [{
    id: 'service-1',
    serviceType: 'rme',
    activity: 'collection',
    frequency: { type: 'one_time' },
    location: { street: '', municipality: '', neighborhood: '', state: '' },
    wastes: [],
    vehicles: [],
    crew: [],
    supplies: [],
    tools: [],
    materials: [],
    equipment: [],
    specializedEpp: [],
    logistics: {
      origin: '',
      primaryDestination: '',
      kilometers: 10,
      fuelLiters: 0,
      fuelPricePerLiter: 20,
      roadType: 'free',
      viaticos: 0
    },
    extraCosts: [],
    ...overrides
  }]
});

const catalogs = {
  warehouses: [],
  supplies: [],
  vehicles: [{
    id: 1,
    vehicle_key: 'VH-001',
    plate: 'ABC-123',
    name: 'Camioneta 3.5T',
    model_name: 'Modelo 2026',
    price_per_day: 1500,
    price_per_ton: 400,
    price_per_m3: 120,
    fuel_efficiency_km_l: 8.5
  }]
};

const renderWithForm = (values = buildDefaultValues()) => {
  const Wrapper = () => {
    const form = useForm<QuoteFormValues>({ defaultValues: values });
    return (
      <FormProvider {...form}>
        <VehiclesAndCrewStep serviceIndex={0} catalogs={catalogs as any} />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

describe('VehiclesAndCrewStep Component', () => {
  it('renders empty states when no vehicles or crew are added', () => {
    renderWithForm();

    expect(screen.getByText('Vehículos Asignados')).toBeDefined();
    expect(screen.getByText('No has asignado ningún vehículo. Haz clic en "Agregar Vehículo".')).toBeDefined();
    expect(screen.getByText('Personal Operativo')).toBeDefined();
    expect(screen.getByText('No has asignado personal operativo.')).toBeDefined();
  });

  it('renders vehicle and crew fields when default values include rows', () => {
    renderWithForm(buildDefaultValues({
      vehicles: [{ vehicleId: 1, name: 'Camioneta 3.5T', quantity: 1, unitPrice: 1500 }],
      crew: [{ type: 'operator', quantity: 1, dailySalary: 400 }]
    }));

    expect(screen.getByText('Unidad Operativa')).toBeDefined();
    expect(screen.getByText('Puesto Operativo')).toBeDefined();
    expect(screen.getByText('Salario Diario ($)')).toBeDefined();
  });

  it('adds vehicle and crew rows when add buttons are clicked', () => {
    renderWithForm();

    fireEvent.click(screen.getByRole('button', { name: /Agregar Vehículo/i }));
    fireEvent.click(screen.getByRole('button', { name: /Agregar Personal/i }));

    expect(screen.getByText('Unidad Operativa')).toBeDefined();
    expect(screen.getByText('Puesto Operativo')).toBeDefined();
  });
});
