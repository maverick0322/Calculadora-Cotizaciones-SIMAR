import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { TripStep } from '@renderer/features/cotizacion/components/TripStep';
import { QuoteFormValues } from '../../../../shared/schemas/quoteSchema';

const defaultValues: QuoteFormValues = {
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
      kilometers: 0,
      fuelLiters: 0,
      fuelPricePerLiter: 0,
      roadType: 'free',
      viaticos: 0
    },
    extraCosts: []
  }]
};

const renderWithForm = (values: QuoteFormValues = defaultValues) => {
  const Wrapper = () => {
    const form = useForm<QuoteFormValues>({ defaultValues: values });
    return (
      <FormProvider {...form}>
        <TripStep serviceIndex={0} catalogs={{ vehicles: [], supplies: [], warehouses: [] } as any} />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

describe('TripStep Component', () => {
  it('renders route and fuel inputs with free road selected by default', () => {
    renderWithForm();

    expect(screen.getByText('Logística del Viaje')).toBeDefined();
    expect(screen.getByText('Punto de Origen')).toBeDefined();
    expect(screen.getByText('Punto de Llegada')).toBeDefined();
    expect(screen.getByText('Kilómetros totales')).toBeDefined();
    expect(screen.queryByText('Número de Casetas')).toBeNull();
  });

  it('renders toll inputs when the toll road option is selected', () => {
    renderWithForm();

    fireEvent.click(screen.getByLabelText('Cuota (Peaje)'));

    expect(screen.getByText('Número de Casetas')).toBeDefined();
    expect(screen.getByText('Costo Total Casetas ($)')).toBeDefined();
  });

  it('renders warehouse suggestions when catalogs are provided', () => {
    const Wrapper = () => {
      const form = useForm<QuoteFormValues>({ defaultValues });
      return (
        <FormProvider {...form}>
          <TripStep
            serviceIndex={0}
            catalogs={{ vehicles: [], supplies: [], warehouses: [{ id: 1, name: 'Almacen Central', address: 'Av. 1' }] } as any}
          />
        </FormProvider>
      );
    };

    render(<Wrapper />);

    expect(document.querySelector('option[value="Almacen Central"]')).toBeDefined();
  });
});
