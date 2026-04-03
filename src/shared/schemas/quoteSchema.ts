// src/shared/schemas/quoteSchema.ts
import * as z from 'zod';

export const quoteSchema = z.object({
  location: z.object({
    street: z.string().min(5, 'Street must be at least 5 characters'),
    municipality: z.string().min(2, 'Municipality is required'),
    neighborhood: z.string().min(2, 'Neighborhood is required'),
  }),
  
  activity: z.enum(['collection', 'transport', 'transfer', 'final_disposal']),
  waste: z.enum(['domestic', 'organic', 'recyclable', 'hazardous', 'bulky']),
  
  volumeQuantity: z.coerce.number().positive('Volume must be greater than 0'),
  volumeUnit: z.enum(['kg', 'ton', 'm3', 'containers', 'trips']),
  
  frequency: z.enum(['daily', 'weekly', 'monthly', 'one_time'], {
    message: 'Frequency is required'
  }),

  trip: z.object({
    kilometers: z.coerce.number().min(0, 'Must be greater than or equal to 0'),
    vehicles: z.coerce.number().min(1, 'Minimum 1 vehicle'),
    crewMembers: z.coerce.number().min(1, 'Minimum 1 crew member'),
    routes: z.coerce.number().min(1, 'Minimum 1 route'),
    fuelLiters: z.coerce.number().min(0, 'Fuel estimation is required'),
    roadType: z.enum(['free', 'toll']).nullable().optional().or(z.literal('')),
    tolls: z.coerce.number().min(0).optional(),
    totalTollCost: z.coerce.number().min(0).optional(),
    origin: z.string().min(3, 'Origin point is required'),
    destinationWarehouse: z.string().min(3, 'Destination warehouse is required'),
  }).optional(),
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;