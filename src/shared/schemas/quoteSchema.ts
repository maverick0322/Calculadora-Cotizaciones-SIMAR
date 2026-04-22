import * as z from 'zod';

export const quoteSchema = z.object({
  clientName: z.string().min(3, 'El nombre del cliente es requerido'),
  clientRfc: z.string().regex(/^[A-Z&Ñ]{3,4}\d{6}[A-Z\d]{3}$/i, 'Formato de RFC inválido'),
  validityDays: z.coerce.number().refine(val => val === 15 || val === 30, 'Vigencia debe ser 15 o 30 días'),

  location: z.object({
    street: z.string().min(5, 'La dirección es muy corta'),
    municipality: z.string().min(2, 'Requerido'),
    neighborhood: z.string().min(2, 'Requerido'),
  }),
  
  activity: z.enum(['collection', 'transport', 'transfer', 'final_disposal']),
  
  wastes: z.array(z.object({
    name: z.string().min(2, 'Requerido'),
    type: z.enum(['domestic', 'organic', 'recyclable', 'hazardous', 'bulky']),
    quantity: z.coerce.number().positive('Debe ser > 0'),
    unit: z.enum(['kg', 'ton', 'm3', 'containers', 'trips']),
  })).min(1, 'Debes agregar al menos un residuo'),
  
  frequency: z.object({
    type: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'one_time', 'custom']),
    // Usamos preprocess para que si el input está vacío, lo convierta a undefined en lugar de NaN
    duration: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), 
      z.number().positive().optional()
    ),
    customDescription: z.string().optional()
  }),

  trip: z.object({
    kilometers: z.coerce.number().min(0),
    vehicles: z.coerce.number().min(1),
    crewMembers: z.coerce.number().min(1),
    fuelLiters: z.coerce.number().min(0),
    roadType: z.enum(['free', 'toll']).nullable().optional().or(z.literal('')),
    tolls: z.coerce.number().min(0).optional(),
    totalTollCost: z.coerce.number().min(0).optional(),
    origin: z.string().min(3, 'Requerido'),
    destinationWarehouse: z.string().min(3, 'Requerido'),
  }).optional(),
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;