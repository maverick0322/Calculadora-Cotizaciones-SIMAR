import { JSX } from 'react';
import { useFormContext } from 'react-hook-form';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';

export const TripStep = (): JSX.Element => {
  const { register, watch, formState: { errors } } = useFormContext<QuoteFormValues>();

  // Observamos el valor actual del tipo de carretera para el renderizado condicional
  const tipoCarretera = watch('viaje.tipoCarretera');

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Logística del Viaje</h3>
        <p className="text-sm text-gray-500">Detalles operativos para la recolección</p>
      </div>

      {/* Origen y Destino */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Punto de Origen</label>
          <input
            type="text"
            {...register('viaje.origen')}
            placeholder="Ej. Instalaciones del cliente"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
          {errors.viaje?.origen && <p className="mt-1 text-sm text-red-600">{errors.viaje.origen.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Almacén de Llegada</label>
          <input
            type="text"
            {...register('viaje.almacenDestino')}
            placeholder="Ej. Almacén Central SIMAR"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
        </div>
      </div>

      {/* Métricas del viaje */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Kilómetros</label>
          <input type="number" {...register('viaje.kilometros', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Vehículos</label>
          <input type="number" {...register('viaje.vehiculos', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Brigadistas</label>
          <input type="number" {...register('viaje.brigadistas', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rutas</label>
          <input type="number" {...register('viaje.rutas', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Litros Comb.</label>
          <input type="number" step="0.1" {...register('viaje.litrosCombustible', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
        </div>
      </div>

      {/* Peajes y Carretera */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Carretera</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input type="radio" value="libre" {...register('viaje.tipoCarretera')} className="text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700">Libre</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" value="cuota" {...register('viaje.tipoCarretera')} className="text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700">Cuota (Peaje)</span>
            </label>
          </div>
        </div>

        {/* RENDERIZADO CONDICIONAL: Solo aparece si selecciona "cuota" */}
        {tipoCarretera === 'cuota' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Casetas</label>
              <input type="number" {...register('viaje.casetas', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Costo Total Casetas ($)</label>
              <input type="number" step="0.01" {...register('viaje.costoTotalCasetas', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};