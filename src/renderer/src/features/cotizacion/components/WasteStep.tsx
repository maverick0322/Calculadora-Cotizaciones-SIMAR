import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema"; 
import { Plus } from 'lucide-react';
import { useResiduesCatalog } from '../../catalogs/hooks/useResiduesCatalog';
import { WasteItemRow } from './WasteItemRow';

export const WasteStep = ({ serviceIndex }: { serviceIndex: number }) => {
  const { register, control, formState: { errors } } = useFormContext<QuoteFormValues>();
  const { residues } = useResiduesCatalog();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `services.${serviceIndex}.wastes` as const
  });

  const frequencyType = useWatch({ name: `services.${serviceIndex}.frequency.type` });

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Especificaciones Operativas</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de actividad</label>
            <select className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.activity` as const)}>
              <option value="collection">Recolección</option>
              <option value="transport">Transporte</option>
              <option value="transfer">Transferencia</option>
              <option value="final_disposal">Disposición Final</option>
            </select>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia del Servicio</label>
              <select className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.frequency.type` as const)}>
                <option value="one_time">Evento Único</option>
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="custom">Otra (Especificar)</option>
              </select>
            </div>

            {frequencyType !== 'one_time' && (
              <div className="animate-in fade-in slide-in-from-top-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Duración (ej. cantidad de semanas/meses)</label>
                <input type="number" placeholder="Ej. 6" className="w-full px-3 py-2 border rounded-md" {...register(`services.${serviceIndex}.frequency.duration` as const)} />
              </div>
            )}

            {frequencyType === 'custom' && (
              <div className="animate-in fade-in slide-in-from-top-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Especifique la frecuencia</label>
                <input type="text" placeholder="Ej. Cada tercer día" className="w-full px-3 py-2 border rounded-md" {...register(`services.${serviceIndex}.frequency.customDescription` as const)} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-800">Residuos a recolectar en esta sucursal</h3>
            <button
              type="button"
              onClick={() => append({ name: '', type: 'Residuo de Manejo Especial (RME)', classification: 'N/A', clave: 'N/A', quantity: 1, unit: 'Kilogramo', pricePerUnit: 0 })}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar Residuo
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <WasteItemRow 
                key={field.id}
                serviceIndex={serviceIndex}
                index={index}
                residues={residues}
                onRemove={() => remove(index)}
                showRemoveButton={fields.length > 1}
              />
            ))}
            
            {errors.services?.[serviceIndex]?.wastes?.root && (
              <p className="text-red-500 text-sm mt-2">{errors.services[serviceIndex].wastes.root.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};