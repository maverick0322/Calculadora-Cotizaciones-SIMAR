import * as z from 'zod';

export const quoteSchema = z.object({
  ubicacion: z.object({
    direccion: z.string().min(5, 'Address must be at least 5 characters'),
    municipio: z.string().min(2, 'City is required'),
    colonia: z.string().min(2, 'Neighborhood is required'),
  }),
  actividad: z.enum(['recoleccion', 'transporte', 'transferencia', 'disposicion_final']),
  residuo: z.enum(['domestico', 'organico', 'reciclable', 'peligroso', 'voluminoso']),
  volumenCantidad: z.number().positive('Volume must be greater than 0'),
  volumenUnidad: z.enum(['kg', 'ton', 'm3', 'contenedores', 'viajes']),
  frecuencia: z.string().min(1, 'Frequency is required'),
});

// Exportamos el tipo TypeScript deducido automáticamente por Zod
export type QuoteFormValues = z.infer<typeof quoteSchema>;