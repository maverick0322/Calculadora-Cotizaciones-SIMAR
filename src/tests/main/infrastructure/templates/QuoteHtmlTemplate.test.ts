import { describe, expect, it } from 'vitest';
import { buildQuoteHtml } from '../../../../main/infrastructure/templates/QuoteHtmlTemplate';
import { QuoteDraft } from '../../../../shared/types/Quote';

describe('buildQuoteHtml', () => {
  it('renders non-residue service details for emitted quote PDFs', () => {
    const quote = {
      id: 10,
      folio: '001-0626-GIR-VMR',
      clientName: 'Cliente Demo',
      clientRfc: 'CDE240101AB1',
      contactName: 'Mariana Torres',
      validityDays: 15,
      status: 'emitida',
      createdAt: 1780531200000,
      issuedAt: 1780531200000,
      preparedByInitials: 'VMR',
      quoteTypeCode: 'GIR',
      subtotal: 10000,
      total: 11600,
      services: [
        {
          id: 'training',
          serviceType: 'training',
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
          logistics: { origin: '', primaryDestination: '', kilometers: 0, fuelLiters: 0, fuelPricePerLiter: 0, viaticos: 0 },
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
            travelExpenses: { travel: 100, tolls: 50, lodging: 0, food: 100, taxis: 0 }
          }
        },
        {
          id: 'cleaning',
          serviceType: 'ecological_cleaning',
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
          logistics: { origin: '', primaryDestination: '', kilometers: 0, fuelLiters: 0, fuelPricePerLiter: 0, viaticos: 0 },
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
          wastes: [],
          vehicles: [],
          crew: [],
          supplies: [],
          tools: [],
          materials: [],
          equipment: [],
          specializedEpp: [],
          logistics: { origin: '', primaryDestination: '', kilometers: 0, fuelLiters: 0, fuelPricePerLiter: 0, viaticos: 0 },
          extraCosts: [{ description: 'Diagnostico ambiental', amount: 5000 }],
          conditioning: { labor: [{ description: 'Rotulado y acomodo', amount: 1500 }] }
        }
      ]
    } as QuoteDraft;

    const html = buildQuoteHtml(quote, '');

    expect(html).toContain('Datos de capacitación');
    expect(html).toContain('Capacitar al equipo operativo');
    expect(html).toContain('Manual impreso');
    expect(html).toContain('Datos de limpieza ecológica');
    expect(html).toContain('Servicio Norte');
    expect(html).toContain('Lavado especializado');
    expect(html).toContain('Mano de obra de acondicionamiento');
    expect(html).toContain('Rotulado y acomodo');
    expect(html).toContain('Cargos adicionales');
    expect(html).toContain('Diagnostico ambiental');
  });
});
