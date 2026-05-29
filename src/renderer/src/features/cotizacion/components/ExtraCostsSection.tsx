import { useFormContext, useFieldArray } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";
import { Plus, Trash2 } from 'lucide-react';

export const ExtraCostsSection = ({ serviceIndex }: { serviceIndex: number }) => {
  const { register, control, formState: { errors } } = useFormContext<QuoteFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `services.${serviceIndex}.extraCosts` as const
  });

  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Costos Adicionales (Opcional)</h3>
          <p className="text-sm text-gray-500">Maniobras especiales, viáticos extra, permisos, etc.</p>
        </div>
        <button
          type="button"
          onClick={() => append({ description: '', amount: 0 })}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> Agregar Costo Extra
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
          Sin costos adicionales configurados.
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-end bg-orange-50/30 p-4 rounded-lg border border-orange-100 relative">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Descripción del Cargo</label>
              <input 
                type="text" 
                placeholder="Ej. Maniobra de carga con montacargas"
                className="w-full px-3 py-2 border rounded-md bg-white"
                {...register(`services.${serviceIndex}.extraCosts.${index}.description` as const)}
              />
              {errors.services?.[serviceIndex]?.extraCosts?.[index]?.description && <p className="text-red-500 text-xs mt-1">Requerido</p>}
            </div>

            <div className="w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">Monto ($)</label>
              <input 
                type="number" step="0.01" min="0"
                className="w-full px-3 py-2 border rounded-md bg-white"
                {...register(`services.${serviceIndex}.extraCosts.${index}.amount` as const, { valueAsNumber: true })}
              />
              {errors.services?.[serviceIndex]?.extraCosts?.[index]?.amount && <p className="text-red-500 text-xs mt-1">Inválido</p>}
            </div>

            <button type="button" onClick={() => remove(index)} className="mb-2 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};