//Solo los inputs de tipos y volumenes
import { useFormContext } from 'react-hook-form';
import { QuoteFormValues } from '../hooks/useQuoteForm';
import { JSX } from 'react';

export const WasteStep = (): JSX.Element => {
  const { register } = useFormContext<QuoteFormValues>();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
        Waste Specifications
      </h2>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            {...register('actividad')}
          >
            <option value="recoleccion">Collection</option>
            <option value="transporte">Transport</option>
            <option value="transferencia">Transfer</option>
            <option value="disposicion_final">Final Disposal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Waste Type</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            {...register('residuo')}
          >
            <option value="domestico">Domestic</option>
            <option value="organico">Organic</option>
            <option value="reciclable">Recyclable</option>
            <option value="peligroso">Hazardous</option>
            <option value="voluminoso">Voluminous</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Volume Quantity</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              {...register('volumenCantidad', { valueAsNumber: true })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              {...register('volumenUnidad')}
            >
              <option value="kg">kg</option>
              <option value="ton">ton</option>
              <option value="m3">m³</option>
              <option value="contenedores">containers</option>
              <option value="viajes">trips</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Frequency</label>
          <input
             type="text"
             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
             placeholder="Ej. Semanal"
             {...register('frecuencia')}
          />
        </div>
      </div>
    </div>
  );
};