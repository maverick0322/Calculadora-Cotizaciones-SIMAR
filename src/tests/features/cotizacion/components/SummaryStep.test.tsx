import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryStep } from '@renderer/features/cotizacion/components/SummaryStep';
import { QuoteFormValues } from '../../../../shared/schemas/quoteSchema';

describe('SummaryStep Component', () => {
  
  // Objeto simulado con 2 servicios para probar la iteración
  const mockData: QuoteFormValues = {
    clientName: 'Empresa ACME',
    clientRfc: 'ACME123456',
    validityDays: 30,
    frequency: { type: 'weekly', duration: 12 },
    services: [
      {
        id: 's1',
        activity: 'collection',
        location: { street: 'Av. Principal 100', municipality: 'Ciudad A', neighborhood: 'Centro', state: 'Estado X' },
        logistics: { origin: 'Punto A', primaryDestination: 'Planta 1', kilometers: 15, fuelLiters: 5, fuelPricePerLiter: 20, roadType: 'toll', tolls: 1, totalTollCost: 50, viaticos: 0 },
        wastes: [
          { name: 'Cartón', type: 'recyclable', quantity: 50, unit: 'kg' }
        ],
        vehicles: [{ vehicleId: 1, name: 'Camioneta', quantity: 1, unitPrice: 500 }],
        crew: [{ type: 'driver', quantity: 1, dailySalary: 300 }],
        supplies: [{ supplyId: 1, name: 'Cajas', quantity: 10, unitPrice: 15 }],
        extraCosts: [{ description: 'Maniobra de carga', amount: 200 }]
      },
      {
        id: 's2',
        activity: 'final_disposal',
        location: { street: 'Sucursal Norte', municipality: 'Ciudad B', neighborhood: 'Norte', state: 'Estado Y' },
        logistics: { origin: 'Punto B', primaryDestination: 'Planta 2', kilometers: 30, fuelLiters: 10, fuelPricePerLiter: 20, roadType: 'free', viaticos: 0 },
        wastes: [],
        vehicles: [],
        crew: [],
        supplies: [],
        extraCosts: []
      }
    ]
  } as any;

  it('should render global data correctly', () => {
    render(<SummaryStep data={mockData} />);
    
    expect(screen.getByText('Empresa ACME')).toBeDefined();
    expect(screen.getByText('ACME123456')).toBeDefined();
    expect(screen.getByText('30 Días')).toBeDefined();
    // Verifica que la función getFrequencyString formatea bien los periodos
    expect(screen.getByText('Semanal (por 12 periodos)')).toBeDefined(); 
  });

  it('should render multiple services correctly', () => {
    render(<SummaryStep data={mockData} />);
    
    // Verifica elementos del Servicio 1
    expect(screen.getByText('Servicio 1: Av. Principal 100')).toBeDefined();
    expect(screen.getByText('Recolección')).toBeDefined(); // Traducción de 'collection'
    expect(screen.getByText('Ciudad A, Estado X')).toBeDefined();
    expect(screen.getByText('15 km (Cuota (Peaje))')).toBeDefined(); // roadType toll
    expect(screen.getByText('Cartón')).toBeDefined();
    expect(screen.getByText('50 kg')).toBeDefined();
    expect(screen.getByText('Maniobra de carga')).toBeDefined();
    
    // Verifica elementos del Servicio 2
    expect(screen.getByText('Servicio 2: Sucursal Norte')).toBeDefined();
    expect(screen.getByText('Disposición Final')).toBeDefined(); // Traducción
    expect(screen.getByText('Ciudad B, Estado Y')).toBeDefined();
    expect(screen.getByText('30 km (Libre)')).toBeDefined(); // roadType free
  });

  it('should render empty state fallbacks for arrays when a service has no items', () => {
    render(<SummaryStep data={mockData} />);
    
    // El servicio 2 tiene sus arreglos vacíos, por lo que deberían aparecer estos textos
    expect(screen.getByText('Sin vehículos')).toBeDefined();
    expect(screen.getByText('Sin personal')).toBeDefined();
    expect(screen.getByText('Sin insumos adicionales')).toBeDefined();
  });
});