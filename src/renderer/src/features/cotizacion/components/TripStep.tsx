import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";
import { CatalogData } from '../NewQuoteView';

interface TripStepProps {
  serviceIndex: number;
  catalogs?: CatalogData;
}

export const TripStep = ({ serviceIndex, catalogs }: TripStepProps) => {
  const { register, watch, setValue, control, formState: { errors } } = useFormContext<QuoteFormValues>();

  const roadType = watch(`services.${serviceIndex}.logistics.roadType` as const);
  const logisticsErrors = errors.services?.[serviceIndex]?.logistics;

  const kilometers = useWatch({ control, name: `services.${serviceIndex}.logistics.kilometers` as const }) || 0;
  const fuelPrice = useWatch({ control, name: `services.${serviceIndex}.logistics.fuelPricePerLiter` as const }) || 0;
  const fuelLiters = useWatch({ control, name: `services.${serviceIndex}.logistics.fuelLiters` as const }) || 0;
  const vehicles = useWatch({ control, name: `services.${serviceIndex}.vehicles` as const }) || [];

  useEffect(() => {
    let calculatedLiters = 0;
    if (kilometers > 0 && vehicles.length > 0) {
      vehicles.forEach((v: any) => {
        const vehicleObj = catalogs?.vehicles.find(catV => catV.id === v.vehicleId);
        if (vehicleObj && vehicleObj.fuel_efficiency_km_l > 0) {
          calculatedLiters += (kilometers / vehicleObj.fuel_efficiency_km_l) * (v.quantity || 1);
        }
      });
    }
    setValue(`services.${serviceIndex}.logistics.fuelLiters` as const, Number(calculatedLiters.toFixed(2)));
  }, [kilometers, vehicles, catalogs, setValue, serviceIndex]);

  const totalFuelCost = fuelLiters * fuelPrice;

  return (
    <div className="space-y-6 mb-8">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Logística del Viaje</h3>
        <p className="text-sm text-gray-500">Ruta y combustible del servicio</p>
      </div>

      <datalist id="warehouse-list">
        {catalogs?.warehouses.map(w => (
          <option key={w.id} value={w.name} />
        ))}
      </datalist>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Punto de Origen</label>
          <input
            type="text" list="warehouse-list"
            {...register(`services.${serviceIndex}.logistics.origin` as const)}
            placeholder="Ej. Instalaciones del cliente"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Punto de Llegada</label>
          <input
            type="text" list="warehouse-list"
            {...register(`services.${serviceIndex}.logistics.primaryDestination` as const)}
            placeholder="Ej. Almacén Central SIMAR"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
        <div>
          <label className="block text-sm font-medium text-gray-700">Kilómetros totales</label>
          <input type="number" {...register(`services.${serviceIndex}.logistics.kilometers` as const, { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Precio Comb. x Litro ($)</label>
          <input type="number" step="0.1" {...register(`services.${serviceIndex}.logistics.fuelPricePerLiter` as const, { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-800 flex justify-between">
            <span>Litros Requeridos</span>
            <span className="font-bold text-green-700">${totalFuelCost.toFixed(2)}</span>
          </label>
          {/* Campo bloqueado (readOnly) porque se auto-calcula */}
          <input type="number" readOnly step="0.1" {...register(`services.${serviceIndex}.logistics.fuelLiters` as const, { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-blue-300 shadow-sm p-2 border bg-blue-100 text-blue-900 font-semibold" />
          <p className="text-[10px] text-gray-500 mt-1">Calculado por eficiencia vehicular</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Carretera</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input type="radio" value="free" {...register(`services.${serviceIndex}.logistics.roadType` as const)} className="text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700">Libre</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" value="toll" {...register(`services.${serviceIndex}.logistics.roadType` as const)} className="text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700">Cuota (Peaje)</span>
            </label>
          </div>
        </div>

        {roadType === 'toll' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Casetas</label>
              <input type="number" {...register(`services.${serviceIndex}.logistics.tolls` as const, { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Costo Total Casetas ($)</label>
              <input type="number" step="0.01" {...register(`services.${serviceIndex}.logistics.totalTollCost` as const, { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};