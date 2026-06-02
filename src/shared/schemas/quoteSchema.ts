import * as z from 'zod';
import {
  CATALOG_SUPPLY_CATEGORIES,
  CREW_CATEGORIES,
  DEFAULT_VALIDITY_DAYS,
  FOLIO_ALLOWED_PATTERN,
  MAX_FOLIO_LENGTH,
  MIN_FOLIO_LENGTH,
  MIN_CUSTOM_VALIDITY_DAYS,
  QUOTE_TYPE_CODES,
  RESIDUE_SERVICE_TYPES,
  SERVICE_TYPES,
  TRAINING_EDUCATION_LEVELS,
  TRAINING_MODALITIES
} from '../constants/quoteConstants';

const moneySchema = z.coerce.number().min(0, 'El monto no puede ser negativo');
const positiveQuantitySchema = z.number().min(0.01, 'La cantidad debe ser mayor a 0');

const locationSchema = z.object({
  cp: z.string().optional(),
  street: z.string().optional().default(''),
  municipality: z.string().optional().default(''),
  neighborhood: z.string().optional().default(''),
  state: z.string().optional().default('')
});

const requiredLocationSchema = locationSchema.superRefine((location, ctx) => {
  if (!location.street || location.street.trim().length < 5) {
    ctx.addIssue({ code: 'custom', path: ['street'], message: 'Dirección requerida' });
  }
  if (!location.municipality || location.municipality.trim().length < 2) {
    ctx.addIssue({ code: 'custom', path: ['municipality'], message: 'Municipio requerido' });
  }
  if (!location.neighborhood || location.neighborhood.trim().length < 2) {
    ctx.addIssue({ code: 'custom', path: ['neighborhood'], message: 'Colonia requerida' });
  }
  if (!location.state || location.state.trim().length < 2) {
    ctx.addIssue({ code: 'custom', path: ['state'], message: 'Estado requerido' });
  }
});

const wasteItemSchema = z.object({
  name: z.string().min(1, 'El nombre del residuo es obligatorio'),
  type: z.string().min(1, 'El tipo es obligatorio'),
  classification: z.string().min(1, 'La clasificación es obligatoria').default('N/A'),
  clave: z.string().min(1, 'La clave es obligatoria').default('N/A'),
  specificDescription: z.string().optional(),
  quantity: positiveQuantitySchema,
  unit: z.string().min(1, 'La unidad es obligatoria'),
  pricePerUnit: moneySchema.default(0)
});

const baseCatalogItemSchema = {
  name: z.string().optional().default(''),
  quantity: z.coerce.number().min(1, 'Mínimo 1'),
  unitPrice: moneySchema
};

const supplyItemSchema = z.object({ supplyId: z.coerce.number().min(0), ...baseCatalogItemSchema });
const toolItemSchema = z.object({ toolId: z.coerce.number().min(0), ...baseCatalogItemSchema });
const materialItemSchema = z.object({ materialId: z.coerce.number().min(0), ...baseCatalogItemSchema });
const equipmentItemSchema = z.object({ equipmentId: z.coerce.number().min(0), ...baseCatalogItemSchema });
const specializedEppItemSchema = z.object({ specializedEppId: z.coerce.number().min(0), ...baseCatalogItemSchema });

const extraCostSchema = z.object({
  description: z.string().min(2, 'Descripción requerida'),
  amount: z.coerce.number().min(0.01, 'Monto inválido')
});

const stationerySchema = z.object({
  description: z.string().min(2, 'Descripción requerida'),
  quantity: z.coerce.number().min(1, 'Mínimo 1'),
  unitPrice: moneySchema
});

const travelExpensesSchema = z.object({
  travel: moneySchema.default(0),
  tolls: moneySchema.default(0),
  lodging: moneySchema.default(0),
  food: moneySchema.default(0),
  taxis: moneySchema.default(0)
});

const trainingSchema = z.object({
  attendeeCount: z.coerce.number().min(1, 'Debe indicar al menos una persona'),
  educationLevels: z.array(z.enum(TRAINING_EDUCATION_LEVELS)).min(1, 'Seleccione al menos un nivel escolar'),
  objective: z.string().min(5, 'Objetivo requerido'),
  modality: z.enum(TRAINING_MODALITIES),
  location: locationSchema.optional(),
  hours: z.coerce.number().min(0.5, 'Las horas deben ser mayores a 0'),
  hourlyUnitPrice: moneySchema,
  stationery: z.array(stationerySchema).default([]),
  travelExpenses: travelExpensesSchema.optional()
}).superRefine((training, ctx) => {
  if (training.modality !== 'in_person') return;

  const validation = requiredLocationSchema.safeParse(training.location ?? {});
  if (!validation.success) {
    ctx.addIssue({
      code: 'custom',
      path: ['location'],
      message: 'La ubicación es obligatoria para capacitación presencial'
    });
  }
});

const ecologicalCleaningSchema = z.object({
  gasStationName: z.string().min(2, 'El nombre de la gasolinera es requerido'),
  location: requiredLocationSchema,
  surfaceM2: z.coerce.number().min(0.01, 'La superficie debe ser mayor a 0'),
  viaticos: moneySchema,
  hours: z.coerce.number().min(0.5, 'Las horas deben ser mayores a 0'),
  hourlyUnitPrice: moneySchema,
  labor: z.array(extraCostSchema).default([]),
  technicianCount: z.coerce.number().min(0, 'La cantidad no puede ser negativa')
});

const conditioningSchema = z.object({
  labor: z.array(extraCostSchema).default([])
});

const serviceSchema = z.object({
  id: z.string(),
  serviceType: z.enum(SERVICE_TYPES).default('rme'),
  activity: z.enum(['collection', 'transport', 'transfer', 'final_disposal']).default('collection'),
  frequency: z.object({
    type: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'one_time', 'custom']),
    duration: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number().positive().optional()
    ),
    customDescription: z.string().optional()
  }).default({ type: 'one_time', customDescription: '' }),
  location: locationSchema,
  wastes: z.array(wasteItemSchema).default([]),
  vehicles: z.array(z.object({
    vehicleId: z.coerce.number(),
    name: z.string().optional().default(''),
    quantity: z.coerce.number().min(0.01, 'Mínimo 0.01'),
    unitPrice: moneySchema
  })).default([]),
  crew: z.array(z.object({
    type: z.enum([...CREW_CATEGORIES, 'driver']),
    quantity: z.coerce.number().min(1, 'Mínimo 1'),
    dailySalary: moneySchema
  })).default([]),
  supplies: z.array(supplyItemSchema).default([]),
  tools: z.array(toolItemSchema).default([]),
  materials: z.array(materialItemSchema).default([]),
  equipment: z.array(equipmentItemSchema).default([]),
  specializedEpp: z.array(specializedEppItemSchema).default([]),
  logistics: z.object({
    origin: z.string().optional().default(''),
    primaryDestination: z.string().optional().default(''),
    secondaryDestination: z.string().optional(),
    kilometers: moneySchema,
    fuelLiters: moneySchema,
    fuelPricePerLiter: moneySchema,
    roadType: z.preprocess(
      (value) => (value === '' || value === null ? undefined : value),
      z.enum(['free', 'toll']).optional()
    ),
    tolls: moneySchema.optional(),
    totalTollCost: moneySchema.optional(),
    viaticos: moneySchema
  }),
  extraCosts: z.array(extraCostSchema).default([]),
  ecologicalCleaning: ecologicalCleaningSchema.optional(),
  training: trainingSchema.optional(),
  conditioning: conditioningSchema.optional()
}).superRefine((service, ctx) => {
  if (RESIDUE_SERVICE_TYPES.includes(service.serviceType as (typeof RESIDUE_SERVICE_TYPES)[number]) && service.wastes.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['wastes'],
      message: 'Debe incluir al menos un residuo para este tipo de servicio'
    });
  }

  if (RESIDUE_SERVICE_TYPES.includes(service.serviceType as (typeof RESIDUE_SERVICE_TYPES)[number])) {
    const validation = requiredLocationSchema.safeParse(service.location);
    if (!validation.success) {
      ctx.addIssue({
        code: 'custom',
        path: ['location'],
        message: 'La ubicación es obligatoria para servicios de residuos'
      });
    }
  }

  if (service.serviceType === 'training' && !service.training) {
    ctx.addIssue({ code: 'custom', path: ['training'], message: 'Debe capturar los datos de capacitación' });
  }

  if (service.serviceType === 'ecological_cleaning' && !service.ecologicalCleaning) {
    ctx.addIssue({ code: 'custom', path: ['ecologicalCleaning'], message: 'Debe capturar los datos de limpieza ecológica' });
  }
});

export const quoteSchema = z.object({
  personType: z.enum(['fisica', 'moral']).default('moral'),
  commercialName: z.string().optional(),
  clientName: z.string().min(3, 'La razón social / nombre legal es requerido'),
  clientRfc: z.string().regex(/^[A-Z&Ñ]{3,4}\d{6}[A-Z\d]{3}$/i, 'Formato de RFC inválido'),
  contactName: z.string().min(3, 'El nombre del contacto es requerido'),
  contactPosition: z.string().optional().default(''),
  contactPhone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  contactEmail: z.string().email('Formato de correo inválido'),
  validityDays: z.coerce
    .number()
    .int('La vigencia debe capturarse en días completos')
    .min(MIN_CUSTOM_VALIDITY_DAYS, 'La vigencia debe ser de al menos un día')
    .default(DEFAULT_VALIDITY_DAYS),
  services: z.array(serviceSchema).min(1, 'La cotización debe tener al menos un servicio configurado')
});

export const quoteConditionSelectionSchema = z.object({
  conditionId: z.coerce.number().int().positive().optional(),
  type: z.enum(['commercial', 'technical']),
  title: z.string().min(2, 'El título de la condición es obligatorio'),
  description: z.string().min(3, 'La descripción de la condición es obligatoria'),
  isCustom: z.boolean().default(false)
});

export const issueQuoteSchema = z.object({
  quoteId: z.coerce.number().int().positive('La cotización es obligatoria'),
  folio: z.string()
    .trim()
    .min(MIN_FOLIO_LENGTH, 'El folio es demasiado corto')
    .max(MAX_FOLIO_LENGTH, 'El folio es demasiado largo')
    .regex(FOLIO_ALLOWED_PATTERN, 'El folio contiene caracteres no permitidos'),
  preparedByUserId: z.coerce.number().int().positive('El empleado que elaboró es obligatorio'),
  preparedByInitials: z.string().trim().min(2, 'Las iniciales son obligatorias').max(12, 'Las iniciales son demasiado largas'),
  quoteTypeCode: z.enum(QUOTE_TYPE_CODES),
  conditions: z.array(quoteConditionSelectionSchema).default([])
});

export const catalogSupplyCategorySchema = z.enum(CATALOG_SUPPLY_CATEGORIES);

export type QuoteFormValues = z.infer<typeof quoteSchema>;
