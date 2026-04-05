import { useEffect } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { quoteSchema, QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { QuoteDraft, RoadType } from '../../../../../shared/types/Quote';

export const useQuoteForm = (editId?: number | null) => {
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema) as unknown as Resolver<QuoteFormValues>,
    defaultValues: {
      location: { street: '', municipality: '', neighborhood: '' },
      activity: 'collection',
      waste: 'domestic',
      volumeQuantity: 0,
      volumeUnit: 'kg',
    } as Partial<QuoteFormValues>
  });

  useEffect(() => {
    if (!editId) {
      form.reset();
      return;
    }

    const fetchDraftData = async () => {
      const toastId = toast.loading('Cargando borrador...');
      try {
        const response = await window.api.getDraftById(editId);
        if (response.success && response.data) {
          const draft: QuoteDraft = response.data;
          form.reset({
            location: draft.location, activity: draft.activity,
            waste: draft.waste, volumeQuantity: draft.volumeQuantity,
            volumeUnit: draft.volumeUnit, frequency: draft.frequency, trip: draft.trip 
          });
          toast.success('Borrador listo para editar', { id: toastId });
        } else {
          toast.error('No se pudo cargar el borrador', { id: toastId });
        }
      } catch (error) {
        toast.error(`Error de conexión`, { id: toastId });
      }
    };

    fetchDraftData();
  }, [editId, form]);

  // AHORA EL HOOK RECIBE DATOS CRUDOS Y LOS FORMATEA
  const submitDraft = async (data: QuoteFormValues): Promise<boolean> => {
    try {
      let cleanTrip = data.trip as QuoteDraft['trip'];
      
      if (data.trip) {
        const cleanRoadType = (data.trip.roadType === '' || data.trip.roadType === null) 
          ? undefined 
          : data.trip.roadType as RoadType;

        cleanTrip = {
          ...data.trip,
          roadType: cleanRoadType,
        };
      }

      const payload: QuoteDraft = {
        id: editId || undefined,
        status: 'draft',
        createdAt: Date.now(),
        ...data,
        trip: cleanTrip
      };

      const response = await window.api.saveDraft(payload);
      return response.success;
    } catch (error) {
      return false;
    }
  };

  return { form, submitDraft };
};