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
      frequency: {
        type: 'one_time',
        duration: undefined,
        customDescription: ''
      },
      // AQUÍ ESTÁ LA MAGIA: Todo se agrupa en el primer servicio por defecto
      services: [
        {
          id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
          activity: 'collection',
          location: { street: '', municipality: '', neighborhood: '' },
          wastes: [{ name: '', type: 'domestic', quantity: 1, unit: 'kg' }],
          vehicles: [],
          crew: [],
          supplies: [],
          logistics: {
            origin: '',
            primaryDestination: '',
            secondaryDestination: '',
            kilometers: 0,
            fuelLiters: 0,
            fuelPricePerLiter: 0,
            roadType: undefined,
            tolls: 0,
            totalTollCost: 0,
            viaticos: 0
          },
          extraCosts: []
        }
      ]
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
          
          form.reset({
            clientName: draft.clientName,
            clientRfc: draft.clientRfc,
            validityDays: draft.validityDays,
            frequency: draft.frequency,
            services: draft.services 
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
      // Limpiamos los roadType vacíos de cada servicio antes de enviar
      const cleanedServices = data.services.map(service => {
        const cleanRoadType = (service.logistics.roadType === '' || service.logistics.roadType === null) 
          ? undefined 
          : service.logistics.roadType as RoadType;

        return {
          ...service,
          logistics: {
            ...service.logistics,
            roadType: cleanRoadType
          }
        };
      });

      const payload: QuoteDraft = {
        id: editId || undefined,
        status: 'draft',
        createdAt: Date.now(),
        clientName: data.clientName,
        clientRfc: data.clientRfc,
        validityDays: data.validityDays,
        frequency: data.frequency,
        services: cleanedServices
      };

      const response = await window.api.saveDraft(payload);
      return response.success;
    } catch (error) {
      return false;
    }
  };

  return { form, submitDraft };
};