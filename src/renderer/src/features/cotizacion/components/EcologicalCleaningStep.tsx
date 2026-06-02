import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { ServiceLocationFields } from './ServiceLocationFields';

export const EcologicalCleaningStep = ({ serviceIndex }: { serviceIndex: number }) => {
  const { register, control } = useFormContext<QuoteFormValues>();
  const cleaning = useWatch({ control, name: `services.${serviceIndex}.ecologicalCleaning` as const });
  const { fields, append, remove } = useFieldArray({
    control,
    name: `services.${serviceIndex}.ecologicalCleaning.labor` as const
  });

  const hourlyTotal = Number(cleaning?.hours || 0) * Number(cleaning?.hourlyUnitPrice || 0);
  const laborTotal = (cleaning?.labor || []).reduce((total, item) => total + Number(item.amount || 0), 0);
  const viaticosTotal = Number(cleaning?.viaticos || 0);
  const cleaningTotal = hourlyTotal + laborTotal + viaticosTotal;

  return (
    <div className="space-y-8 mb-8">
      <section className="bg-lime-50/40 border border-lime-100 rounded-lg p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Limpieza ecológica</h3>
        <p className="text-sm text-gray-500 mb-4">Servicio aplicable a estaciones de gasolinera.</p>

        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre de la Gasolinera</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md bg-white"
            {...register(`services.${serviceIndex}.ecologicalCleaning.gasStationName` as const)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Superficie m²</label>
            <input type="number" min="0.01" step="0.01" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.ecologicalCleaning.surfaceM2` as const, { valueAsNumber: true })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Viáticos</label>
            <input type="number" min="0" step="0.01" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.ecologicalCleaning.viaticos` as const, { valueAsNumber: true })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Horas</label>
            <input type="number" min="0.5" step="0.5" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.ecologicalCleaning.hours` as const, { valueAsNumber: true })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Precio por hora</label>
            <input type="number" min="0" step="0.01" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.ecologicalCleaning.hourlyUnitPrice` as const, { valueAsNumber: true })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Técnicos</label>
            <input type="number" min="0" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.ecologicalCleaning.technicianCount` as const, { valueAsNumber: true })} />
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <ServiceLocationFields
          locationPath={`services.${serviceIndex}.ecologicalCleaning.location`}
          title="Dirección de la Gasolinera"
          streetLabel="Dirección"
        />
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Mano de obra</h3>
            <p className="text-sm text-gray-500">Captura cargos manuales específicos de la operación.</p>
          </div>
          <button type="button" onClick={() => append({ description: '', amount: 0 })} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-lime-100 text-lime-700 rounded-md">
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-8">
                <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                <input className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.ecologicalCleaning.labor.${index}.description` as const)} />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Monto</label>
                <input type="number" min="0" step="0.01" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.ecologicalCleaning.labor.${index}.amount` as const, { valueAsNumber: true })} />
              </div>
              <button type="button" onClick={() => remove(index)} className="md:col-span-1 text-gray-400 hover:text-red-500 pb-2">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-lime-50/40 border border-lime-100 rounded-lg p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de viáticos</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-white border border-lime-100 rounded-md p-3">
            <p className="text-gray-500">Viáticos</p>
            <p className="font-semibold text-gray-900">{viaticosTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
          </div>
          <div className="bg-white border border-lime-100 rounded-md p-3">
            <p className="text-gray-500">Horas</p>
            <p className="font-semibold text-gray-900">{hourlyTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
          </div>
          <div className="bg-white border border-lime-100 rounded-md p-3">
            <p className="text-gray-500">Mano de obra</p>
            <p className="font-semibold text-gray-900">{laborTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
          </div>
          <div className="bg-white border border-lime-200 rounded-md p-3">
            <p className="text-gray-500">Total parcial</p>
            <p className="font-bold text-lime-800">{cleaningTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
