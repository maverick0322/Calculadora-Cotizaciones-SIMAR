import { useEffect } from 'react';
import { useForm, useFieldArray, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { quoteSchema, QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { QuoteDraft, RoadType, ServiceItem } from '../../../../../shared/types/Quote';
import { DEFAULT_VALIDITY_DAYS } from '../../../../../shared/constants/quoteConstants';

const createDefaultService = (): ServiceItem => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
  serviceType: 'rme',
  activity: 'collection',
  frequency: {
    type: 'one_time',
    duration: undefined,
    customDescription: ''
  },
  location: { street: '', cp: '', municipality: '', neighborhood: '', state: '' },
  wastes: [{ name: '', type: 'Residuo de Manejo Especial (RME)', classification: 'N/A', clave: 'N/A', quantity: 1, unit: 'Kilogramo', pricePerUnit: 0 }],
  vehicles: [],
  crew: [],
  supplies: [],
  tools: [],
  materials: [],
  equipment: [],
  specializedEpp: [],
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
});

type FormRoadType = RoadType | '' | undefined;

const normalizeRoadType = (roadType: FormRoadType): RoadType | undefined => {
  if (!roadType) {
    return undefined;
  }

  return roadType;
};

export const useQuoteForm = (editId?: number | null) => {
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema) as unknown as Resolver<QuoteFormValues>,
    defaultValues: {
      personType: 'moral',
      commercialName: '',
      clientName: '',
      clientRfc: '',
      contactName: '',  
      contactPosition: '',
      contactPhone: '',
      contactEmail: '',
      validityDays: DEFAULT_VALIDITY_DAYS,
      services: [createDefaultService()]
    }
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: 'services'
  });

  const addNewService = () => {
    appendService(createDefaultService());
    toast.success('Nueva pestaña de servicio agregada');
  };

  useEffect(() => {
    if (!editId) {
      form.reset();
      return;
    }

    const fetchDraftData = async () => {
      const toastId = toast.loading('Cargando cotización...');
      try {
        const response = await window.api.getDraftById(editId);
        if (response.success && response.data) {
          const draft: QuoteDraft = response.data;
          
          form.reset({
            clientName: draft.clientName,
            clientRfc: draft.clientRfc,
            personType: draft.personType ?? 'moral',
            commercialName: draft.commercialName ?? '',
            contactName: draft.contactName || '',
            contactPosition: draft.contactPosition || '',
            contactPhone: draft.contactPhone || '',
            contactEmail: draft.contactEmail || '',
            validityDays: draft.validityDays,
            services: draft.services 
          } as unknown as QuoteFormValues);
          
          toast.success('Cotización lista para editar', { id: toastId });
        } else {
          toast.error('No se pudo cargar la cotización', { id: toastId });
        }
      } catch (error) {
        console.error('Failed to fetch draft:', error);
        toast.error(`Error de conexión`, { id: toastId });
      }
    };

    fetchDraftData();
  }, [editId, form]);

  const submitDraft = async (data: QuoteFormValues, subtotal: number = 0, total: number = 0): Promise<boolean> => {
    try {
      const cleanedServices = data.services.map(service => {
        return {
          ...service,
          logistics: {
            ...service.logistics,
            roadType: normalizeRoadType(service.logistics.roadType as FormRoadType)
          }
        };
      });

      const payload: QuoteDraft = {
        id: editId || undefined,
        status: 'en_proceso',
        personType: data.personType,
        commercialName: data.commercialName,
        createdAt: Date.now(),
        clientName: data.clientName,
        clientRfc: data.clientRfc,
        contactName: data.contactName,   
        contactPosition: data.contactPosition,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        validityDays: data.validityDays,
        services: cleanedServices,
        
        subtotal: subtotal,
        total: total
      };

      const response = await window.api.saveDraft(payload);
      return response.success;
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('No se pudo guardar la cotización');
      return false;
    }
  };

  return { form, serviceFields, addNewService, removeService, submitDraft };
};
