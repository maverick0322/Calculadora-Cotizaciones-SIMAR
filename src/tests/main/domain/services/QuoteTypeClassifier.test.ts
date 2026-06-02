import { describe, expect, it } from 'vitest';
import { QuoteTypeClassifier } from '../../../../main/domain/services/QuoteTypeClassifier';
import { ServiceItem, ServiceType } from '../../../../shared/types/Quote';

const buildService = (serviceType: ServiceType): ServiceItem => ({
  id: serviceType,
  serviceType,
  activity: 'collection',
  frequency: { type: 'one_time' },
  location: {
    street: 'Calle 1',
    municipality: 'Xalapa',
    neighborhood: 'Centro',
    state: 'Veracruz'
  },
  wastes: serviceType === 'material_sale' || serviceType === 'training' || serviceType === 'environmental_consulting' || serviceType === 'ecological_cleaning' || serviceType === 'conditioning'
    ? []
    : [{
      name: 'Residuo',
      type: serviceType,
      classification: 'General',
      clave: 'R-001',
      quantity: 1,
      unit: 'kg',
      pricePerUnit: 1
    }],
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
    viaticos: 0
  },
  extraCosts: []
});

describe('QuoteTypeClassifier', () => {
  const classifier = new QuoteTypeClassifier();

  it('returns RME when the quote contains only RME collection', () => {
    const result = classifier.classify([buildService('rme')]);

    expect(result).toBe('RME');
  });

  it('returns RPBI when the quote contains only RPBI collection', () => {
    const result = classifier.classify([buildService('rpbi')]);

    expect(result).toBe('RPBI');
  });

  it('returns GIR when residue collection includes training and environmental consulting', () => {
    const result = classifier.classify([
      buildService('rme'),
      buildService('training'),
      buildService('environmental_consulting')
    ]);

    expect(result).toBe('GIR');
  });

  it('returns MR when a residue service includes a support service without the GIR combination', () => {
    const result = classifier.classify([
      buildService('hazardous_waste'),
      buildService('ecological_cleaning')
    ]);

    expect(result).toBe('MR');
  });

  it('returns GIR for RPBI with materials, consulting and training', () => {
    const result = classifier.classify([
      buildService('rpbi'),
      buildService('material_sale'),
      buildService('environmental_consulting'),
      buildService('training')
    ]);

    expect(result).toBe('GIR');
  });
});
