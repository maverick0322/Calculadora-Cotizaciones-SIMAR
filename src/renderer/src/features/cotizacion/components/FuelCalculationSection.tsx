import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";
import { CatalogData } from '../NewQuoteView';

interface FuelCalculationSectionProps {
  serviceIndex: number;
  catalogs?: CatalogData;
}

export const FuelCalculationSection = ({ serviceIndex, catalogs }: FuelCalculationSectionProps) => {
  const { register, setValue, control } = useFormContext<QuoteFormValues>();

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
        <input type="number" readOnly step="0.1" {...register(`services.${serviceIndex}.logistics.fuelLiters` as const, { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-blue-300 shadow-sm p-2 border bg-blue-100 text-blue-900 font-semibold" />
        <p className="text-[10px] text-gray-500 mt-1">Calculado por eficiencia vehicular</p>
      </div>
    </div>
  );
};
