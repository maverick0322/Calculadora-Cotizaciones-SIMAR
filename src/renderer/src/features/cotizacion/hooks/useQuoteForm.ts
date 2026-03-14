//Lógica de react-hook-form y zod 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CotizacionBorrador } from '../../../../../shared/types/Cotizacion';

// 1. Definimos las reglas estrictas con Zod
const quoteSchema = z.object({
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

// Extraemos el tipo de TypeScript a partir del esquema de Zod
export type QuoteFormValues = z.infer<typeof quoteSchema>;

export const useQuoteForm = () => {
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      ubicacion: { direccion: '', municipio: '', colonia: '' },
      actividad: 'recoleccion',
      residuo: 'domestico',
      volumenCantidad: 0,
      volumenUnidad: 'kg',
      frecuencia: 'semanal'
    }
  });

  const submitDraft = async (data: QuoteFormValues) => {
    // Mapeamos los datos del formulario al DTO exacto que espera el Backend
    const draftPayload: CotizacionBorrador = {
      ...data,
      fechaCreacion: Date.now(),
      estado: 'borrador'
    };

    try {
      const response = await window.api.guardarBorrador(draftPayload);
      if (response.success) {
        console.log('Draft saved successfully with ID:', response.id);
        return true;
      } else {
        console.error('Backend error:', response.error);
        return false;
      }
    } catch (error) {
      console.error('IPC error:', error);
      return false;
    }
  };

  return { form, submitDraft };
};