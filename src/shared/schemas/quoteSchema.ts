import * as z from 'zod';

export const quoteSchema = z.object({
  clientName: z.string().min(3, 'El nombre del cliente es requerido'),
  clientRfc: z.string().regex(/^[A-Z&Ñ]{3,4}\d{6}[A-Z\d]{3}$/i, 'Formato de RFC inválido'),
  validityDays: z.coerce.number().refine(val => val === 15 || val === 30, 'Vigencia debe ser 15 o 30 días'),

  frequency: z.object({
    type: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'one_time', 'custom']),
    duration: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), 
      z.number().positive().optional()
    ),
    customDescription: z.string().optional()
  }),

  // EL ARREGLO DE SERVICIOS
  services: z.array(z.object({
    id: z.string(), // UUID de control interno
    activity: z.enum(['collection', 'transport', 'transfer', 'final_disposal']),
    
    location: z.object({
      street: z.string().min(5, 'Dirección requerida'),
      municipality: z.string().min(2, 'Requerido'),
      neighborhood: z.string().min(2, 'Requerido'),
    }),

    wastes: z.array(z.object({
      name: z.string().min(2, 'Requerido'),
      type: z.enum(['domestic', 'organic', 'recyclable', 'hazardous', 'bulky']),
      quantity: z.coerce.number().positive('Debe ser > 0'),
      unit: z.enum(['kg', 'ton', 'm3', 'containers', 'trips']),
    })).min(1, 'Debes agregar al menos un residuo al servicio'),

    vehicles: z.array(z.object({
      vehicleId: z.coerce.number(),
      name: z.string(),
      quantity: z.coerce.number().min(1, 'Mínimo 1'),
      unitPrice: z.coerce.number().min(0, 'Precio base inválido')
    })),

    crew: z.array(z.object({
      type: z.enum(['driver', 'technician']),
      quantity: z.coerce.number().min(1, 'Mínimo 1'),
      dailySalary: z.coerce.number().min(0, 'Salario inválido')
    })),

    supplies: z.array(z.object({
      supplyId: z.coerce.number(),
      name: z.string(),
      quantity: z.coerce.number().min(1, 'Mínimo 1'),
      unitPrice: z.coerce.number().min(0, 'Precio inválido')
    })),

    logistics: z.object({
      origin: z.string().min(3, 'Origen requerido'),
      primaryDestination: z.string().min(3, 'Destino requerido'),
      secondaryDestination: z.string().optional(),
      kilometers: z.coerce.number().min(0),
      fuelLiters: z.coerce.number().min(0),
      fuelPricePerLiter: z.coerce.number().min(0),
      roadType: z.enum(['free', 'toll']).nullable().optional().or(z.literal('')),
      tolls: z.coerce.number().min(0).optional(),
      totalTollCost: z.coerce.number().min(0).optional(),
      viaticos: z.coerce.number().min(0, 'Los viáticos no pueden ser negativos')
    }),

    extraCosts: z.array(z.object({
      description: z.string().min(2, 'Descripción requerida'),
      amount: z.coerce.number().min(0.01, 'Monto inválido')
    }))

  })).min(1, 'La cotización debe tener al menos un servicio configurado')
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;