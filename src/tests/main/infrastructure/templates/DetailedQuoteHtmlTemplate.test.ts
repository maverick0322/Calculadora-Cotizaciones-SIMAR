import { describe, expect, it } from 'vitest';
import { getDetailedQuoteHtml } from '../../../../main/infrastructure/templates/DetailedQuoteHtmlTemplate';
import { QuoteDraft } from '../../../../shared/types/Quote';

describe('getDetailedQuoteHtml', () => {
  const quote = {
    id: 1,
    folio: '001-0626-RME-VMR',
    clientName: 'Cliente Detallado',
    clientRfc: 'CDE240101AB1',
    contactName: 'Ana Lopez',
    validityDays: 30,
    status: 'emitida',
    createdAt: 1780531200000,
    subtotal: 5000,
    total: 5800,
    services: [
      {
        id: 's1',
        serviceType: 'rme',
        activity: 'collection',
        frequency: { type: 'one_time' },
        location: { street: 'Av. Principal 100', neighborhood: 'Centro', municipality: 'Veracruz', state: 'Veracruz' },
        wastes: [{ name: 'Carton', type: 'RME', classification: 'RME', clave: 'R-001', quantity: 50, unit: 'Kilogramo', pricePerUnit: 2 }],
        vehicles: [{ vehicleId: 1, name: 'Camioneta', quantity: 1, unitPrice: 500 }],
        crew: [{ type: 'technician', quantity: 2, dailySalary: 300 }],
        supplies: [{ supplyId: 1, name: 'Bolsas', quantity: 10, unitPrice: 15 }],
        tools: [],
        materials: [],
        equipment: [],
        specializedEpp: [],
        logistics: { origin: 'Almacen', primaryDestination: 'Planta', kilometers: 15, fuelLiters: 5, fuelPricePerLiter: 20, viaticos: 0 },
        extraCosts: [{ description: 'Maniobra', amount: 200 }]
      },
      {
        id: 's2',
        serviceType: 'environmental_consulting',
        activity: 'collection',
        frequency: { type: 'one_time' },
        location: { street: '', neighborhood: '', municipality: '', state: '' },
        wastes: [],
        vehicles: [],
        crew: [],
        supplies: [],
        tools: [],
        materials: [],
        equipment: [],
        specializedEpp: [],
        logistics: { origin: '', primaryDestination: '', kilometers: 0, fuelLiters: 0, fuelPricePerLiter: 0, viaticos: 0 },
        extraCosts: []
      }
    ]
  } as QuoteDraft;

  it('renders detailed service sections, totals and fallback logo', () => {
    const html = getDetailedQuoteHtml(quote);

    expect(html).toContain('SIMAR');
    expect(html).toContain('Cliente Detallado');
    expect(html).toContain('Desglose de Residuos');
    expect(html).toContain('Carton');
    expect(html).toContain('Operación de Vehículos');
    expect(html).toContain('Personal Asignado');
    expect(html).toContain('Insumos y Materiales');
    expect(html).toContain('Costos Extra');
    expect(html).toContain('Maniobra');
    expect(html).toContain('Ubicación no requerida');
    expect(html).toContain('TOTAL');
    expect(html).toContain('$5,800.00');
  });

  it('renders provided logo as image', () => {
    const html = getDetailedQuoteHtml(quote, 'data:image/png;base64,abc');

    expect(html).toContain('<img src="data:image/png;base64,abc"');
  });
});
