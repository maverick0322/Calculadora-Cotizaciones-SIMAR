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
        frequency: { type: 'weekly', duration: 12 },
        location: { street: 'Av. Principal 100', municipality: 'Ciudad A', neighborhood: 'Centro', state: 'Estado X' },
        logistics: { origin: 'Punto A', primaryDestination: 'Planta 1', kilometers: 15, fuelLiters: 5, fuelPricePerLiter: 20, roadType: 'toll', tolls: 1, totalTollCost: 50, viaticos: 0 },
        wastes: [
          { name: 'Cartón', type: 'recyclable', classification: 'N/A', clave: 'N/A', quantity: 50, unit: 'kg', pricePerUnit: 0 }
        ],
        vehicles: [{ vehicleId: 1, name: 'Camioneta', quantity: 1, unitPrice: 500 }],
        crew: [{ type: 'driver', quantity: 1, dailySalary: 300 }],
        supplies: [{ supplyId: 1, name: 'Cajas', quantity: 10, unitPrice: 15 }],
        extraCosts: [{ description: 'Maniobra de carga', amount: 200 }]
      },
      {
        id: 's2',
        activity: 'final_disposal',
        frequency: { type: 'one_time' },
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
    expect(screen.getByText(/Semanal \(por 12 periodos\)/)).toBeDefined(); 
  });

  it('should render multiple services correctly', () => {
    render(<SummaryStep data={mockData} />);
    
    // Verifica elementos del Servicio 1
    expect(screen.getByText('Servicio 1: Av. Principal 100')).toBeDefined();
    expect(screen.getByText(/Recolección/)).toBeDefined(); // Traducción de 'collection'
    expect(screen.getByText('Ciudad A, Estado X')).toBeDefined();
    expect(screen.getByText('15 km (Cuota (Peaje))')).toBeDefined(); // roadType toll
    expect(screen.getByText('Cartón')).toBeDefined();
    expect(screen.getByText('50 kg')).toBeDefined();
    expect(screen.getByText('Maniobra de carga')).toBeDefined();
    
    // Verifica elementos del Servicio 2
    expect(screen.getByText('Servicio 2: Sucursal Norte')).toBeDefined();
    expect(screen.getByText(/Disposición Final/)).toBeDefined(); // Traducción
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

  it('should render summary details for non-residue service types', () => {
    const dataWithSpecialServices = {
      ...mockData,
      services: [
        {
          id: 'training',
          serviceType: 'training',
          activity: 'collection',
          frequency: { type: 'one_time' },
          location: { street: '', municipality: '', neighborhood: '', state: '' },
          logistics: { origin: '', primaryDestination: '', kilometers: 0, fuelLiters: 0, fuelPricePerLiter: 0, viaticos: 0 },
          wastes: [],
          vehicles: [],
          crew: [],
          supplies: [],
          tools: [],
          materials: [],
          equipment: [],
          specializedEpp: [],
          extraCosts: [],
          training: {
            attendeeCount: 12,
            educationLevels: ['operational'],
            objective: 'Capacitar al equipo operativo',
            modality: 'in_person',
            location: { street: 'Sala 1', municipality: 'Veracruz', neighborhood: 'Centro', state: 'Veracruz' },
            hours: 4,
            hourlyUnitPrice: 900,
            stationery: [{ description: 'Manual impreso', quantity: 12, unitPrice: 80 }],
            travelExpenses: { travel: 0, tolls: 0, lodging: 0, food: 0, taxis: 0 }
          }
        },
        {
          id: 'consulting',
          serviceType: 'environmental_consulting',
          activity: 'collection',
          frequency: { type: 'one_time' },
          location: { street: '', municipality: '', neighborhood: '', state: '' },
          logistics: { origin: '', primaryDestination: '', kilometers: 0, fuelLiters: 0, fuelPricePerLiter: 0, viaticos: 0 },
          wastes: [],
          vehicles: [],
          crew: [],
          supplies: [],
          tools: [],
          materials: [],
          equipment: [],
          specializedEpp: [],
          extraCosts: [{ description: 'Diagnostico ambiental', amount: 5000 }]
        },
        {
          id: 'cleaning',
          serviceType: 'ecological_cleaning',
          activity: 'collection',
          frequency: { type: 'one_time' },
          location: { street: '', municipality: '', neighborhood: '', state: '' },
          logistics: { origin: '', primaryDestination: '', kilometers: 0, fuelLiters: 0, fuelPricePerLiter: 0, viaticos: 0 },
          wastes: [],
          vehicles: [],
          crew: [],
          supplies: [],
          tools: [],
          materials: [],
          equipment: [],
          specializedEpp: [],
          extraCosts: [],
          ecologicalCleaning: {
            gasStationName: 'Servicio Norte',
            location: { street: 'Carretera 10', municipality: 'Boca del Rio', neighborhood: 'Norte', state: 'Veracruz' },
            surfaceM2: 250,
            viaticos: 500,
            hours: 6,
            hourlyUnitPrice: 700,
            labor: [{ description: 'Lavado especializado', amount: 2000 }],
            technicianCount: 3
          }
        },
        {
          id: 'conditioning',
          serviceType: 'conditioning',
          activity: 'collection',
          frequency: { type: 'one_time' },
          location: { street: '', municipality: '', neighborhood: '', state: '' },
          logistics: { origin: '', primaryDestination: '', kilometers: 0, fuelLiters: 0, fuelPricePerLiter: 0, viaticos: 0 },
          wastes: [],
          vehicles: [],
          crew: [],
          supplies: [],
          tools: [],
          materials: [],
          equipment: [],
          specializedEpp: [],
          extraCosts: [],
          conditioning: { labor: [{ description: 'Rotulado y acomodo', amount: 1500 }] }
        }
      ]
    } as any;

    render(<SummaryStep data={dataWithSpecialServices} />);

    expect(screen.getByText(/Capacitación · Recolección/)).toBeDefined();
    expect(screen.getByText('Capacitar al equipo operativo')).toBeDefined();
    expect(screen.getByText(/Manual impreso/)).toBeDefined();
    expect(screen.getByText('Diagnostico ambiental')).toBeDefined();
    expect(screen.getByText('Servicio Norte')).toBeDefined();
    expect(screen.getByText('Lavado especializado')).toBeDefined();
    expect(screen.getByText('Rotulado y acomodo')).toBeDefined();
  });
});
