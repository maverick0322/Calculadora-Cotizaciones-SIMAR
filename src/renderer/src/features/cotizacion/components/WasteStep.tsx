//Solo los inputs de tipos y volumenes
import { useFormContext } from 'react-hook-form';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { JSX } from 'react';

export const WasteStep = (): JSX.Element => {
  const { register } = useFormContext<QuoteFormValues>();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
        Especificaciones del residuo
      </h2>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de actividad</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            {...register('actividad')}
          >
            <option value="recoleccion">Recolección</option>
            <option value="transporte">Transporte</option>
            <option value="transferencia">Transferencia</option>
            <option value="disposicion_final">Disposición Final</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de residuo</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            {...register('residuo')}
          >
            <option value="domestico">Doméstico</option>
            <option value="organico">Orgánico</option>
            <option value="reciclable">Reciclable</option>
            <option value="peligroso">Peligroso</option>
            <option value="voluminoso">Voluminoso</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              {...register('volumenCantidad', { valueAsNumber: true })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unidad</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              {...register('volumenUnidad')}
            >
              <option value="kg">kg</option>
              <option value="ton">ton</option>
              <option value="m3">m³</option>
              <option value="contenedores">contenedores</option>
              <option value="viajes">viajes</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia de servicio</label>
          <input
             type="text"
             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
             placeholder="Ej. Semanal, Mensual, etc."
             {...register('frecuencia')}
          />
        </div>
      </div>
    </div>
  );
};