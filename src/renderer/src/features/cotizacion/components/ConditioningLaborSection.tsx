import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';

export const ConditioningLaborSection = ({ serviceIndex }: { serviceIndex: number }) => {
  const { register, control } = useFormContext<QuoteFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `services.${serviceIndex}.conditioning.labor` as const
  });

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Mano de obra</h3>
          <p className="text-sm text-gray-500">Cargo manual similar a costos extra, específico de acondicionamiento.</p>
        </div>
        <button type="button" onClick={() => append({ description: '', amount: 0 })} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-md">
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-end">
            <input placeholder="Descripción" className="flex-1 px-3 py-2 border rounded-md" {...register(`services.${serviceIndex}.conditioning.labor.${index}.description` as const)} />
            <input placeholder="Monto" type="number" min="0" step="0.01" className="w-40 px-3 py-2 border rounded-md" {...register(`services.${serviceIndex}.conditioning.labor.${index}.amount` as const, { valueAsNumber: true })} />
            <button type="button" onClick={() => remove(index)} className="text-gray-400 hover:text-red-500 pb-2">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
