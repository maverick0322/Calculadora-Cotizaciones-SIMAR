import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { SuppliesStep } from '@renderer/features/cotizacion/components/SuppliesStep';
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

const catalogs = {
  warehouses: [],
  vehicles: [],
  supplies: [
    { id: 1, name: 'Bolsas Negras', unit: 'paquete', suggested_price: 150, category: 'supply' },
    { id: 2, name: 'Kit Herramienta', unit: 'kit', suggested_price: 250, category: 'tool' },
    { id: 3, name: 'Contenedor', unit: 'pieza', suggested_price: 500, category: 'material' },
    { id: 4, name: 'Bomba', unit: 'dia', suggested_price: 850, category: 'equipment' },
    { id: 5, name: 'EPP Especial', unit: 'kit', suggested_price: 450, category: 'specialized_epp' }
  ]
};

const renderWithForm = (values = defaultValues) => {
  const Wrapper = () => {
    const form = useForm<QuoteFormValues>({ defaultValues: values });
    return (
      <FormProvider {...form}>
        <SuppliesStep serviceIndex={0} catalogs={catalogs as any} />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

describe('SuppliesStep Component', () => {
  it('renders catalog sections and empty states', () => {
    renderWithForm();

    expect(screen.getByText('1. Insumos (Venta)')).toBeDefined();
    expect(screen.getByText('2. Herramientas')).toBeDefined();
    expect(screen.getByText('3. Materiales')).toBeDefined();
    expect(screen.getByText('4. Maquinaria y Equipo')).toBeDefined();
    expect(screen.getByText('5. Equipo de Protección Personal Especializado (EPP)')).toBeDefined();
    expect(screen.getAllByText('No has agregado elementos. Haz clic en "Agregar" si los necesitas.')).toHaveLength(5);
    expect(screen.getByText('Sin costos adicionales configurados.')).toBeDefined();
  });

  it('renders fields when default values include supplies and extra costs', () => {
    renderWithForm({
      ...defaultValues,
      services: [{
        ...defaultValues.services[0],
        supplies: [{ supplyId: 1, name: 'Bolsas Negras', quantity: 2, unitPrice: 150 }],
        extraCosts: [{ description: 'Maniobra', amount: 200 }]
      }]
    });

    expect(screen.getByText('Elemento del Catálogo')).toBeDefined();
    expect(screen.getByText('Descripción del Cargo')).toBeDefined();
    expect(screen.getByText('Monto ($)')).toBeDefined();
  });

  it('adds a catalog item and an extra cost row when buttons are clicked', () => {
    renderWithForm();

    fireEvent.click(screen.getAllByRole('button', { name: /Agregar Item/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /Agregar Costo Extra/i }));

    expect(screen.getByText('Elemento del Catálogo')).toBeDefined();
    expect(screen.getByText('Descripción del Cargo')).toBeDefined();
  });
});
