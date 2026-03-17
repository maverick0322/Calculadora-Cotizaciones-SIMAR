//Solo los inputs de direccion

import { useFormContext } from 'react-hook-form';
import { QuoteFormValues } from '../hooks/useQuoteForm';
import { JSX } from 'react';

export const LocationStep = (): JSX.Element => {
  // Traemos la función register de nuestro "Cerebro"
  const { register, formState: { errors } } = useFormContext<QuoteFormValues>();

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
        Location Details
      </h2>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address <span className="text-gray-400 ml-2">(Dirección)</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej. Av. Lázaro Cárdenas 100"
            {...register('ubicacion.direccion')} 
          />
          {errors.ubicacion?.direccion && <p className="text-red-500 text-xs mt-1">{errors.ubicacion.direccion.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('ubicacion.municipio')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Neighborhood</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('ubicacion.colonia')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};