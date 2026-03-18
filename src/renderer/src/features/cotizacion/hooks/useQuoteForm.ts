import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// 1. Importamos el esquema y el tipo desde la carpeta compartida
import { quoteSchema, QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { CotizacionBorrador } from '../../../../../shared/types/Cotizacion';

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

  const submitDraft = async (data: QuoteFormValues): Promise<boolean> => {
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