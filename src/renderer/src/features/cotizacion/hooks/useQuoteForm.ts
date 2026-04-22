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
      clientName: '',
      clientRfc: '',
      validityDays: 15,
      location: { street: '', municipality: '', neighborhood: '' },
      activity: 'collection',
      wastes: [{ name: '', type: 'domestic', quantity: 1, unit: 'kg' }],
      frequency: {
        type: 'one_time',
        duration: undefined,
        customDescription: ''
      },
      trip: {
        origin: '',
        destinationWarehouse: '',
        kilometers: 0,
        vehicles: 1,
        crewMembers: 1,
        fuelLiters: 0,
        roadType: undefined,
        tolls: 0,
        totalTollCost: 0
      }
    }
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
          
          // Le decimos a TypeScript que confíe en que este objeto empata con el formulario
          form.reset({
            clientName: draft.clientName,
            clientRfc: draft.clientRfc,
            validityDays: draft.validityDays,
            location: draft.location, 
            activity: draft.activity,
            wastes: draft.wastes, 
            frequency: draft.frequency, 
            trip: draft.trip 
          } as unknown as QuoteFormValues);
          
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