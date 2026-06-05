import type { Database } from 'better-sqlite3';
import { IVA_RATE } from '../../../../shared/constants/quoteConstants';
import { QuoteDraft, ServiceItem } from '../../../../shared/types/Quote';
import { logger } from '../../logging/SafeLogger';

const demoLocation = {
  cp: '94299',
  street: 'Blvd. Manuel Avila Camacho 1200',
  municipality: 'Boca del Rio',
  neighborhood: 'Costa de Oro',
  state: 'Veracruz',
  coordinates: '19.1502,-96.1069'
};

const emptyLogistics = {
  origin: '',
  primaryDestination: '',
  secondaryDestination: '',
  kilometers: 0,
  fuelLiters: 0,
  fuelPricePerLiter: 0,
  roadType: undefined,
  tolls: 0,
  totalTollCost: 0,
  viaticos: 0
};

const baseService = (id: string, overrides: Partial<ServiceItem>): ServiceItem => ({
  id,
  serviceType: 'rme',
  activity: 'collection',
  frequency: {
    type: 'one_time',
    duration: 1,
    customDescription: 'Servicio unico programado'
  },
  location: demoLocation,
  wastes: [],
  vehicles: [],
  crew: [],
  supplies: [],
  tools: [],
  materials: [],
  equipment: [],
  specializedEpp: [],
  logistics: emptyLogistics,
  extraCosts: [],
  ...overrides
});

const buildRmeService = (id = 'demo-rme-individual'): ServiceItem => baseService(id, {
  serviceType: 'rme',
  activity: 'collection',
  frequency: {
    type: 'one_time',
    duration: 1,
    customDescription: 'Servicio unico de recoleccion programada'
  },
  wastes: [{
    name: 'Residuos de manejo especial de hoteleria',
    type: 'Residuo de Manejo Especial (RME)',
    classification: 'RME',
    clave: 'RME-HOT-001',
    specificDescription: 'Mezcla de carton, plastico, embalajes y residuos no peligrosos generados por operacion hotelera',
    quantity: 850,
    unit: 'Kilogramo',
    pricePerUnit: 2.5
  }],
  vehicles: [{ vehicleId: 3, name: 'Camion Recolector Compactador', quantity: 1, unitPrice: 4200 }],
  crew: [
    { type: 'driver', quantity: 1, dailySalary: 650 },
    { type: 'operator', quantity: 2, dailySalary: 520 }
  ],
  supplies: [
    { supplyId: 1, name: 'Bolsas de plastico grueso (Paquete 100)', quantity: 2, unitPrice: 250 },
    { supplyId: 2, name: 'Etiquetas de RME', quantity: 50, unitPrice: 5 }
  ],
  tools: [{ toolId: 3, name: 'Kit de herramienta manual', quantity: 1, unitPrice: 300 }],
  materials: [{ materialId: 4, name: 'Contenedor de 200L (Prestamo)', quantity: 4, unitPrice: 50 }],
  equipment: [{ equipmentId: 6, name: 'Equipo de Proteccion Personal (Desechable)', quantity: 3, unitPrice: 120 }],
  specializedEpp: [{ specializedEppId: 8, name: 'EPP especializado para residuos peligrosos', quantity: 1, unitPrice: 450 }],
  logistics: {
    origin: 'Almacen Central SIMAR',
    primaryDestination: 'Sitio autorizado de disposicion Veracruz',
    secondaryDestination: 'Centro de acopio temporal SIMAR',
    kilometers: 72,
    fuelLiters: 18,
    fuelPricePerLiter: 24.5,
    roadType: 'toll',
    tolls: 2,
    totalTollCost: 340,
    viaticos: 600
  },
  extraCosts: [
    { description: 'Maniobras de carga en sitio', amount: 900 },
    { description: 'Documentacion operativa y manifiesto interno', amount: 350 }
  ]
});

const buildHazardousWasteService = (): ServiceItem => baseService('demo-hazardous-waste', {
  serviceType: 'hazardous_waste',
  wastes: [{
    name: 'Solidos impregnados con hidrocarburo',
    type: 'Residuo peligroso',
    classification: 'CRETI',
    clave: 'RP-HC-009',
    specificDescription: 'Trapos, absorbentes y filtros contaminados con aceite',
    quantity: 420,
    unit: 'Kilogramo',
    pricePerUnit: 7.8
  }],
  vehicles: [{ vehicleId: 1, name: 'Camioneta 3.5 Toneladas', quantity: 1, unitPrice: 1500 }],
  crew: [{ type: 'technician', quantity: 2, dailySalary: 700 }],
  specializedEpp: [{ specializedEppId: 8, name: 'EPP especializado para residuos peligrosos', quantity: 3, unitPrice: 450 }],
  logistics: {
    origin: 'Almacen Central SIMAR',
    primaryDestination: 'Confinamiento autorizado',
    secondaryDestination: '',
    kilometers: 110,
    fuelLiters: 34,
    fuelPricePerLiter: 24.5,
    roadType: 'toll',
    tolls: 3,
    totalTollCost: 520,
    viaticos: 900
  },
  extraCosts: [{ description: 'Etiquetado especial CRETI', amount: 650 }]
});

const buildRpbiService = (): ServiceItem => baseService('demo-rpbi', {
  serviceType: 'rpbi',
  wastes: [{
    name: 'Contenedores de punzocortantes',
    type: 'RPBI',
    classification: 'Biologico-infeccioso',
    clave: 'RPBI-PC-002',
    specificDescription: 'Contenedores rigidos sellados para disposicion autorizada',
    quantity: 65,
    unit: 'Kilogramo',
    pricePerUnit: 11
  }],
  vehicles: [{ vehicleId: 1, name: 'Camioneta 3.5 Toneladas', quantity: 1, unitPrice: 1500 }],
  crew: [{ type: 'technician', quantity: 1, dailySalary: 700 }],
  supplies: [{ supplyId: 2, name: 'Etiquetas de RME', quantity: 40, unitPrice: 5 }],
  specializedEpp: [{ specializedEppId: 8, name: 'EPP especializado para residuos peligrosos', quantity: 2, unitPrice: 450 }],
  logistics: {
    origin: 'Almacen Central SIMAR',
    primaryDestination: 'Tratamiento RPBI autorizado',
    secondaryDestination: '',
    kilometers: 48,
    fuelLiters: 12,
    fuelPricePerLiter: 24.5,
    roadType: 'free',
    tolls: 0,
    totalTollCost: 0,
    viaticos: 350
  }
});

const buildMaterialSaleService = (): ServiceItem => baseService('demo-material-sale', {
  serviceType: 'material_sale',
  location: { cp: '', street: '', municipality: '', neighborhood: '', state: '' },
  supplies: [{ supplyId: 1, name: 'Bolsas de plastico grueso (Paquete 100)', quantity: 5, unitPrice: 250 }],
  tools: [{ toolId: 3, name: 'Kit de herramienta manual', quantity: 2, unitPrice: 300 }],
  materials: [{ materialId: 5, name: 'Supersaco 1 Tonelada', quantity: 8, unitPrice: 180 }],
  equipment: [{ equipmentId: 6, name: 'Equipo de Proteccion Personal (Desechable)', quantity: 6, unitPrice: 120 }]
});

const buildTrainingService = (id = 'demo-training'): ServiceItem => baseService(id, {
  serviceType: 'training',
  location: { cp: '', street: '', municipality: '', neighborhood: '', state: '' },
  training: {
    attendeeCount: 18,
    educationLevels: ['operational', 'administrative'],
    objective: 'Capacitar al personal en segregacion, almacenamiento temporal y respuesta inicial ante incidentes.',
    modality: 'in_person',
    location: {
      cp: '91700',
      street: 'Av. Independencia 455',
      municipality: 'Veracruz',
      neighborhood: 'Centro',
      state: 'Veracruz'
    },
    hours: 6,
    hourlyUnitPrice: 950,
    stationery: [
      { description: 'Manual impreso para participante', quantity: 18, unitPrice: 85 },
      { description: 'Constancia individual', quantity: 18, unitPrice: 45 }
    ],
    travelExpenses: {
      travel: 700,
      tolls: 180,
      lodging: 0,
      food: 450,
      taxis: 180
    }
  }
});

const buildEnvironmentalConsultingService = (id = 'demo-environmental-consulting'): ServiceItem => baseService(id, {
  serviceType: 'environmental_consulting',
  location: { cp: '', street: '', municipality: '', neighborhood: '', state: '' },
  extraCosts: [
    { description: 'Diagnostico de cumplimiento ambiental', amount: 6800 },
    { description: 'Plan de manejo integral de residuos', amount: 9400 }
  ]
});

const buildEcologicalCleaningService = (): ServiceItem => baseService('demo-ecological-cleaning', {
  serviceType: 'ecological_cleaning',
  location: { cp: '', street: '', municipality: '', neighborhood: '', state: '' },
  ecologicalCleaning: {
    gasStationName: 'Servicio Boca Norte',
    location: {
      cp: '94290',
      street: 'Carretera Boca del Rio-Anton Lizardo Km 4',
      municipality: 'Boca del Rio',
      neighborhood: 'Ejido Primero de Mayo',
      state: 'Veracruz'
    },
    surfaceM2: 320,
    viaticos: 900,
    hours: 8,
    hourlyUnitPrice: 780,
    labor: [
      { description: 'Lavado especializado de trampa y zona de carga', amount: 2400 },
      { description: 'Recoleccion de lodos no peligrosos', amount: 1800 }
    ],
    technicianCount: 3
  }
});

const buildConditioningService = (): ServiceItem => baseService('demo-conditioning', {
  serviceType: 'conditioning',
  location: { cp: '', street: '', municipality: '', neighborhood: '', state: '' },
  supplies: [{ supplyId: 2, name: 'Etiquetas de RME', quantity: 100, unitPrice: 5 }],
  materials: [{ materialId: 4, name: 'Contenedor de 200L (Prestamo)', quantity: 6, unitPrice: 50 }],
  equipment: [{ equipmentId: 7, name: 'Bomba extractora (Renta dia)', quantity: 1, unitPrice: 850 }],
  conditioning: {
    labor: [
      { description: 'Separacion y acomodo por compatibilidad', amount: 3200 },
      { description: 'Rotulado y preparacion para transporte', amount: 1700 }
    ]
  }
});

const sumCatalogItems = (items: Array<{ quantity?: number; unitPrice?: number }> = []) =>
  items.reduce((total, item) => total + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);

const sumAmounts = (items: Array<{ amount?: number }> = []) =>
  items.reduce((total, item) => total + Number(item.amount || 0), 0);

const calculateSubtotal = (services: ServiceItem[]) => services.reduce((total, service) => {
  const logistics = service.logistics;
  const fuel = Number(logistics.fuelLiters || 0) * Number(logistics.fuelPricePerLiter || 0);
  const tolls = logistics.roadType === 'toll' ? Number(logistics.totalTollCost || 0) : 0;
  const travel = fuel + tolls + Number(logistics.viaticos || 0);
  const trainingTravel = service.training?.travelExpenses
    ? Object.values(service.training.travelExpenses).reduce((sum, amount) => sum + Number(amount || 0), 0)
    : 0;

  return total
    + sumCatalogItems(service.wastes?.map((waste) => ({ quantity: waste.quantity, unitPrice: waste.pricePerUnit })))
    + sumCatalogItems(service.vehicles)
    + sumCatalogItems(service.crew?.map((member) => ({ quantity: member.quantity, unitPrice: member.dailySalary })))
    + sumCatalogItems(service.supplies)
    + sumCatalogItems(service.tools)
    + sumCatalogItems(service.materials)
    + sumCatalogItems(service.equipment)
    + sumCatalogItems(service.specializedEpp)
    + sumAmounts(service.extraCosts)
    + travel
    + Number(service.ecologicalCleaning?.hours || 0) * Number(service.ecologicalCleaning?.hourlyUnitPrice || 0)
    + Number(service.ecologicalCleaning?.viaticos || 0)
    + sumAmounts(service.ecologicalCleaning?.labor)
    + Number(service.training?.hours || 0) * Number(service.training?.hourlyUnitPrice || 0)
    + sumCatalogItems(service.training?.stationery)
    + trainingTravel
    + sumAmounts(service.conditioning?.labor);
}, 0);

const buildQuote = (quote: Omit<QuoteDraft, 'subtotal' | 'total'>): QuoteDraft => {
  const subtotal = calculateSubtotal(quote.services);
  return {
    ...quote,
    subtotal,
    total: subtotal * (1 + IVA_RATE)
  };
};

const demoQuotes: QuoteDraft[] = [
  buildQuote({
    personType: 'moral',
    commercialName: 'DEMO - Hotel Costa Verde',
    clientName: 'Operadora Hotelera Costa Verde S.A. de C.V.',
    clientRfc: 'OHV240101AB1',
    contactName: 'Mariana Torres',
    contactPosition: 'Gerente de Operaciones',
    contactPhone: '2291234567',
    contactEmail: 'mariana.torres@costaverde.mx',
    validityDays: 15,
    status: 'en_proceso',
    createdAt: 1780531200000,
    services: [buildRmeService()]
  }),
  buildQuote({
    personType: 'moral',
    commercialName: 'DEMO - Corporativo Multiservicios del Golfo',
    clientName: 'Corporativo Multiservicios del Golfo S.A. de C.V.',
    clientRfc: 'CMG240201CD2',
    contactName: 'Roberto Salinas',
    contactPosition: 'Director Administrativo',
    contactPhone: '2297654321',
    contactEmail: 'roberto.salinas@multigol.mx',
    validityDays: 30,
    status: 'terminada',
    createdAt: 1780444800000,
    services: [
      buildRmeService('demo-all-rme'),
      buildHazardousWasteService(),
      buildRpbiService(),
      buildMaterialSaleService(),
      buildTrainingService(),
      buildEnvironmentalConsultingService(),
      buildEcologicalCleaningService(),
      buildConditioningService()
    ]
  }),
  buildQuote({
    personType: 'moral',
    commercialName: 'DEMO - Gestion Integral de Residuos',
    clientName: 'Industria Alimentaria del Sureste S.A. de C.V.',
    clientRfc: 'IAS240301EF3',
    contactName: 'Laura Mendoza',
    contactPosition: 'Responsable de Seguridad e Higiene',
    contactPhone: '2289876543',
    contactEmail: 'laura.mendoza@iasureste.mx',
    validityDays: 30,
    status: 'autorizada',
    createdAt: 1780358400000,
    quoteTypeCode: 'GIR',
    services: [
      buildRmeService('demo-gir-rme'),
      buildEnvironmentalConsultingService('demo-gir-consulting'),
      buildTrainingService('demo-gir-training')
    ]
  })
];

export const runDemoQuotesSeeder = (db: Database) => {
  const demoCount = (db.prepare(`SELECT COUNT(*) as count FROM quotes WHERE commercial_name LIKE 'DEMO - %'`).get() as { count: number }).count;
  if (demoCount > 0) return;

  logger.warn('Sembrando cotizaciones demo para seguimiento');
  const insertQuote = db.prepare(`
    INSERT INTO quotes (
      person_type, commercial_name, client_name, client_rfc, contact_name, contact_position, contact_phone, contact_email,
      validity_days, frequency_json, services_json, subtotal, total, created_at, status, quote_type_code, conditions_json
    ) VALUES (
      @personType, @commercialName, @clientName, @clientRfc, @contactName, @contactPosition, @contactPhone, @contactEmail,
      @validityDays, @frequencyJson, @servicesJson, @subtotal, @total, @createdAt, @status, @quoteTypeCode, @conditionsJson
    )
  `);

  demoQuotes.forEach((quote) => {
    insertQuote.run({
      personType: quote.personType ?? 'moral',
      commercialName: quote.commercialName ?? '',
      clientName: quote.clientName,
      clientRfc: quote.clientRfc,
      contactName: quote.contactName ?? '',
      contactPosition: quote.contactPosition ?? '',
      contactPhone: quote.contactPhone ?? '',
      contactEmail: quote.contactEmail ?? '',
      validityDays: quote.validityDays,
      frequencyJson: JSON.stringify({}),
      servicesJson: JSON.stringify(quote.services),
      subtotal: quote.subtotal ?? 0,
      total: quote.total ?? 0,
      createdAt: quote.createdAt,
      status: quote.status,
      quoteTypeCode: quote.quoteTypeCode ?? null,
      conditionsJson: JSON.stringify(quote.conditions ?? [])
    });
  });
};
