import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { TRAINING_EDUCATION_LEVELS } from '../../../../../shared/constants/quoteConstants';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { ServiceLocationFields } from './ServiceLocationFields';

const EDUCATION_LABELS: Record<string, string> = {
  basic: 'Básico',
  middle_high: 'Medio superior',
  higher: 'Superior',
  operational: 'Operativo',
  administrative: 'Administrativo'
};

export const TrainingStep = ({ serviceIndex }: { serviceIndex: number }) => {
  const { register, control, formState: { errors } } = useFormContext<QuoteFormValues>();
  const modality = useWatch({ control, name: `services.${serviceIndex}.training.modality` as const });
  const travelExpenses = useWatch({ control, name: `services.${serviceIndex}.training.travelExpenses` as const });
  const travelTotal = Object.values(travelExpenses || {}).reduce((total, value) => total + Number(value || 0), 0);

  const { fields, append, remove } = useFieldArray({
    control,
    name: `services.${serviceIndex}.training.stationery` as const
  });

  return (
    <div className="space-y-8 mb-8">
      <section className="bg-sky-50/40 border border-sky-100 rounded-lg p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Datos de capacitación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Número de personal a capacitar</label>
            <input type="number" min="1" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.training.attendeeCount` as const, { valueAsNumber: true })} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Modalidad</label>
            <select className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.training.modality` as const)}>
              <option value="online">En línea</option>
              <option value="in_person">Presencial</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-2">Nivel escolar</label>
            <div className="flex flex-wrap gap-3">
              {TRAINING_EDUCATION_LEVELS.map((level) => (
                <label key={level} className="inline-flex items-center gap-2 text-sm bg-white border rounded-md px-3 py-2">
                  <input type="checkbox" value={level} {...register(`services.${serviceIndex}.training.educationLevels` as const)} />
                  {EDUCATION_LABELS[level]}
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Objetivo de la capacitación</label>
            <textarea rows={3} className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.training.objective` as const)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Horas de capacitación</label>
            <input type="number" min="0.5" step="0.5" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.training.hours` as const, { valueAsNumber: true })} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Precio unitario por hora</label>
            <input type="number" min="0" step="0.01" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.training.hourlyUnitPrice` as const, { valueAsNumber: true })} />
          </div>
        </div>
        {errors.services?.[serviceIndex]?.training && <p className="text-red-500 text-xs mt-3">Revisa los datos obligatorios de capacitación.</p>}
      </section>

      {modality === 'in_person' && (
        <>
          <section className="bg-white border border-gray-200 rounded-lg p-5">
            <ServiceLocationFields
              locationPath={`services.${serviceIndex}.training.location`}
              title="Ubicación presencial"
              streetLabel="Dirección"
            />
          </section>

          <section className="bg-emerald-50/40 border border-emerald-100 rounded-lg p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Viáticos</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Viaje</label>
                <input type="number" min="0" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.training.travelExpenses.travel` as const, { valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Casetas</label>
                <input type="number" min="0" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.training.travelExpenses.tolls` as const, { valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hospedaje</label>
                <input type="number" min="0" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.training.travelExpenses.lodging` as const, { valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Alimentación</label>
                <input type="number" min="0" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.training.travelExpenses.food` as const, { valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Taxis</label>
                <input type="number" min="0" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.training.travelExpenses.taxis` as const, { valueAsNumber: true })} />
              </div>
            </div>

            <div className="mt-4 rounded-md border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 flex items-center justify-between">
              <span className="font-medium">Resumen de viáticos</span>
              <span className="font-bold">
                {travelTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
              </span>
            </div>
          </section>

          <section className="bg-orange-50/40 border border-orange-100 rounded-lg p-5">
            <div className="flex items-center justify-between border-b border-orange-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Papelería</h3>
                <p className="text-sm text-gray-500">Solo aplica para capacitación presencial.</p>
              </div>
              <button type="button" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-md">
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-6">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Material</label>
                    <input className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.training.stationery.${index}.description` as const)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
                    <input type="number" min="1" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.training.stationery.${index}.quantity` as const, { valueAsNumber: true })} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Precio Unitario</label>
                    <input type="number" min="0" className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.training.stationery.${index}.unitPrice` as const, { valueAsNumber: true })} />
                  </div>
                  <button type="button" onClick={() => remove(index)} className="md:col-span-1 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
