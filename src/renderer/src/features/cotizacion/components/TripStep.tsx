import { useFormContext } from 'react-hook-form';
import { QuoteFormValues } from "src/shared/schemas/quoteSchema";
import { CatalogData } from '../NewQuoteView';

// Recibimos los catálogos como propiedades
interface TripStepProps {
  catalogs?: CatalogData;
}

export const TripStep = ({ catalogs }: TripStepProps) => {
  const { register, watch, formState: { errors } } = useFormContext<QuoteFormValues>();

  const roadType = watch('trip.roadType');

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Logística del Viaje</h3>
        <p className="text-sm text-gray-500">Detalles operativos para la recolección</p>
      </div>

      {/* Datalists ocultos para las sugerencias del catálogo */}
      <datalist id="warehouse-list">
        {catalogs?.warehouses.map(w => (
          <option key={w.id} value={w.name} />
        ))}
      </datalist>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Punto de Origen</label>
          <input
            type="text"
            list="warehouse-list"
            {...register('trip.origin')}
            placeholder="Ej. Instalaciones del cliente"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
          {errors.trip?.origin && <p className="mt-1 text-sm text-red-600">{errors.trip.origin.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Almacén de Llegada</label>
          <input
            type="text"
            list="warehouse-list"
            {...register('trip.destinationWarehouse')}
            placeholder="Ej. Almacén Central SIMAR"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
          {errors.trip?.destinationWarehouse && <p className="mt-1 text-sm text-red-600">{errors.trip.destinationWarehouse.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Kilómetros</label>
          <input type="number" {...register('trip.kilometers')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Vehículos</label>
          <input type="number" {...register('trip.vehicles')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Brigadistas</label>
          <input type="number" {...register('trip.crewMembers')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Litros Comb.</label>
          <input type="number" step="0.1" {...register('trip.fuelLiters')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Carretera</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input type="radio" value="free" {...register('trip.roadType')} className="text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700">Libre</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" value="toll" {...register('trip.roadType')} className="text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700">Cuota (Peaje)</span>
            </label>
          </div>
        </div>

        {roadType === 'toll' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Casetas</label>
              <input type="number" {...register('trip.tolls')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Costo Total Casetas ($)</label>
              <input type="number" step="0.01" {...register('trip.totalTollCost')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};