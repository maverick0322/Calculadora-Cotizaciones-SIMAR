import { useFormContext } from 'react-hook-form';
import { SERVICE_TYPE_LABELS, SERVICE_TYPES } from '../../../../../shared/constants/quoteConstants';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { ServiceType } from '../../../../../shared/types/Quote';

interface ServiceTypeSelectorProps {
  serviceIndex: number;
}

export const ServiceTypeSelector = ({ serviceIndex }: ServiceTypeSelectorProps) => {
  const { register, setValue } = useFormContext<QuoteFormValues>();

  const initializeServiceDetails = (serviceType: ServiceType) => {
    if (serviceType === 'training') {
      setValue(`services.${serviceIndex}.training`, {
        attendeeCount: 1,
        educationLevels: [],
        objective: '',
        modality: 'online',
        location: { street: '', cp: '', municipality: '', neighborhood: '', state: '' },
        hours: 1,
        hourlyUnitPrice: 0,
        stationery: [],
        travelExpenses: { travel: 0, tolls: 0, lodging: 0, food: 0, taxis: 0 }
      }, { shouldValidate: false });
    }

    if (serviceType === 'ecological_cleaning') {
      setValue(`services.${serviceIndex}.ecologicalCleaning`, {
        gasStationName: '',
        location: { street: '', cp: '', municipality: '', neighborhood: '', state: '' },
        surfaceM2: 1,
        viaticos: 0,
        hours: 1,
        hourlyUnitPrice: 0,
        labor: [],
        technicianCount: 0
      }, { shouldValidate: false });
    }

    if (serviceType === 'conditioning') {
      setValue(`services.${serviceIndex}.wastes`, [], { shouldValidate: true });
      setValue(`services.${serviceIndex}.conditioning`, { labor: [] }, { shouldValidate: false });
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
      <label className="block text-sm font-semibold text-slate-800 mb-2">Tipo de servicio</label>
      <select
        className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        {...register(`services.${serviceIndex}.serviceType` as const)}
        onChange={(event) => {
          register(`services.${serviceIndex}.serviceType` as const).onChange(event);
          initializeServiceDetails(event.target.value as ServiceType);
        }}
      >
        {SERVICE_TYPES.map((serviceType) => (
          <option key={serviceType} value={serviceType}>
            {SERVICE_TYPE_LABELS[serviceType]}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-500 mt-2">
        Cada pestaña representa un solo tipo de servicio. Para cotizar servicios distintos, agrega otra pestaña.
      </p>
    </div>
  );
};
