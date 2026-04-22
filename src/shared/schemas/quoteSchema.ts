// src/shared/schemas/quoteSchema.ts
import * as z from 'zod';

export const quoteSchema = z.object({
  clientName: z.string().min(3),
  clientRfc: z.string().regex(/^[A-Z&Ñ]{3,4}\d{6}[A-Z\d]{3}$/i),

  location: z.object({
    street: z.string().min(5),
    municipality: z.string().min(2),
    neighborhood: z.string().min(2),
  }),
  
  activity: z.enum(['collection', 'transport', 'transfer', 'final_disposal']),
  
  wastes: z.array(z.object({
    name: z.string().min(2, 'El nombre es requerido'),
    type: z.enum(['domestic', 'organic', 'recyclable', 'hazardous', 'bulky']),
    quantity: z.coerce.number().positive(),
    unit: z.enum(['kg', 'ton', 'm3', 'containers', 'trips']),
  })).min(1),
  
  frequency: z.enum(['daily', 'weekly', 'monthly', 'one_time']),

  trip: z.object({
    kilometers: z.coerce.number().min(0),
    vehicles: z.coerce.number().min(1),
    crewMembers: z.coerce.number().min(1),
    fuelLiters: z.coerce.number().min(0),
    roadType: z.enum(['free', 'toll']).nullable().optional().or(z.literal('')),
    tolls: z.coerce.number().min(0).optional(),
    totalTollCost: z.coerce.number().min(0).optional(),
    origin: z.string().min(3),
    destinationWarehouse: z.string().min(3),
  }).optional(),
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;