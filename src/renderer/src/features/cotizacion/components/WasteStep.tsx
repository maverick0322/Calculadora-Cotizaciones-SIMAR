import { useFormContext, useFieldArray } from 'react-hook-form';
import { QuoteFormValues } from "src/shared/schemas/quoteSchema"; 
import { Plus, Trash2 } from 'lucide-react';

export const WasteStep = () => {
  const { register, control, formState: { errors } } = useFormContext<QuoteFormValues>();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "wastes"
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b">Especificaciones del servicio</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de actividad principal</label>
            <select className="w-full px-3 py-2 border rounded-md" {...register('activity')}>
              <option value="collection">Recolección</option>
              <option value="transport">Transporte</option>
              <option value="transfer">Transferencia</option>
              <option value="final_disposal">Disposición Final</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia de servicio</label>
            <select className="w-full px-3 py-2 border rounded-md" {...register('frequency')}>
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="one_time">Única</option>
            </select>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-800">Residuos a recolectar</h3>
            <button
              type="button"
              onClick={() => append({ name: '', type: 'domestic', quantity: 1, unit: 'kg' })}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar Residuo
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar residuo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pr-8">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del residuo</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Cartón, Aceite..."
                      className="w-full px-3 py-2 border rounded-md bg-white" 
                      {...register(`wastes.${index}.name` as const)} 
                    />
                    {errors.wastes?.[index]?.name && <p className="text-red-500 text-xs mt-1">{errors.wastes[index]?.name?.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Clasificación</label>
                    <select className="w-full px-3 py-2 border rounded-md bg-white" {...register(`wastes.${index}.type` as const)}>
                      <option value="domestic">Doméstico</option>
                      <option value="organic">Orgánico</option>
                      <option value="recyclable">Reciclable</option>
                      <option value="hazardous">Peligroso</option>
                      <option value="bulky">Voluminoso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="w-full px-3 py-2 border rounded-md bg-white" 
                      {...register(`wastes.${index}.quantity` as const)} 
                    />
                    {errors.wastes?.[index]?.quantity && <p className="text-red-500 text-xs mt-1">{errors.wastes[index]?.quantity?.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Unidad</label>
                    <select className="w-full px-3 py-2 border rounded-md bg-white" {...register(`wastes.${index}.unit` as const)}>
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="m3">m³</option>
                      <option value="containers">contenedores</option>
                      <option value="trips">viajes</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {errors.wastes?.root && <p className="text-red-500 text-sm mt-2">{errors.wastes.root.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};