import { useFormContext, useFieldArray } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";
import { Plus, Trash2 } from 'lucide-react';

interface CrewSectionProps {
  serviceIndex: number;
}

export const CrewSection = ({ serviceIndex }: CrewSectionProps) => {
  const { register, control } = useFormContext<QuoteFormValues>();

  const { fields: crewFields, append: appendCrew, remove: removeCrew } = useFieldArray({
    control,
    name: `services.${serviceIndex}.crew` as const
  });

  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Personal Operativo</h3>
          <p className="text-sm text-gray-500">Choferes y técnicos asignados al viaje</p>
        </div>
        <button
          type="button"
          onClick={() => appendCrew({ type: 'driver', quantity: 1, dailySalary: 400 })}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> Agregar Personal
        </button>
      </div>

      {crewFields.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
          No has asignado personal. Recuerda que se necesita al menos un chofer.
        </div>
      )}

      <div className="space-y-3">
        {crewFields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-end bg-indigo-50/30 p-4 rounded-lg border border-indigo-100 relative">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Puesto Operativo</label>
              <select 
                className="w-full px-3 py-2 border rounded-md bg-white"
                {...register(`services.${serviceIndex}.crew.${index}.type` as const)}
              >
                <option value="driver">Chofer</option>
                <option value="technician">Técnico / Auxiliar</option>
              </select>
            </div>

            <div className="w-24">
              <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
              <input 
                type="number" min="1"
                className="w-full px-3 py-2 border rounded-md bg-white"
                {...register(`services.${serviceIndex}.crew.${index}.quantity` as const, { valueAsNumber: true })}
              />
            </div>

            <div className="w-32">
              <label className="block text-xs font-medium text-gray-500 mb-1">Salario Diario ($)</label>
              <input 
                type="number" step="0.01" min="0"
                className="w-full px-3 py-2 border rounded-md bg-white"
                {...register(`services.${serviceIndex}.crew.${index}.dailySalary` as const, { valueAsNumber: true })}
              />
            </div>

            <button type="button" onClick={() => removeCrew(index)} className="mb-2 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};