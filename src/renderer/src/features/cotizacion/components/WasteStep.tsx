import { useFormContext } from 'react-hook-form';
import { QuoteFormValues } from "src/shared/schemas/quoteSchema"; 

export const WasteStep = () => {
  const { register } = useFormContext<QuoteFormValues>();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b">Especificaciones del residuo</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de actividad</label>
          <select className="w-full px-3 py-2 border rounded-md" {...register('activity')}>
            <option value="collection">Recolección</option>
            <option value="transport">Transporte</option>
            <option value="transfer">Transferencia</option>
            <option value="final_disposal">Disposición Final</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de residuo</label>
          <select className="w-full px-3 py-2 border rounded-md" {...register('waste')}>
            <option value="domestic">Doméstico</option>
            <option value="organic">Orgánico</option>
            <option value="recyclable">Reciclable</option>
            <option value="hazardous">Peligroso</option>
            <option value="bulky">Voluminoso</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
            <input type="number" step="0.01" className="w-full px-3 py-2 border rounded-md" {...register('volumeQuantity')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unidad</label>
            <select className="w-full px-3 py-2 border rounded-md" {...register('volumeUnit')}>
              <option value="kg">kg</option>
              <option value="ton">ton</option>
              <option value="m3">m³</option>
              <option value="containers">contenedores</option>
              <option value="viajes">viajes</option>
            </select>
          </div>
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
    </div>
  );
};