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

  //Bloque de logística del viaje (COT-031)
  viaje: z.object({
    kilometros: z.number().min(0, 'Debe ser mayor a 0'),
    vehiculos: z.number().min(1, 'Mínimo 1 vehículo'),
    brigadistas: z.number().min(1, 'Mínimo 1 integrante'),
    rutas: z.number().min(1, 'Mínimo 1 ruta'),
    litrosCombustible: z.number().min(0, 'Estimación requerida'),
    tipoCarretera: z.enum(['libre', 'cuota']),
    casetas: z.number().min(0).optional(),
    costoTotalCasetas: z.number().min(0).optional(),
    origen: z.string().min(3, 'Ingresa el punto de origen'),
    almacenDestino: z.string().min(3, 'Ingresa el almacén de llegada'),
  }),
});

// Exportamos el tipo TypeScript deducido automáticamente por Zod
// Gracias a esto, React y el Backend ya "saben" que el viaje existe.
export type QuoteFormValues = z.infer<typeof quoteSchema>;