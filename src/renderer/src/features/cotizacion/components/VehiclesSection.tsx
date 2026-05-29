import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";
import { Plus, Trash2, Info, Fuel } from 'lucide-react';
import { CatalogData } from '../NewQuoteView';

interface VehiclesSectionProps {
  serviceIndex: number;
  catalogs?: CatalogData;
}

export const VehiclesSection = ({ serviceIndex, catalogs }: VehiclesSectionProps) => {
  const { register, control, setValue, getValues, formState: { errors } } = useFormContext<QuoteFormValues>();

  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } = useFieldArray({
    control,
    name: `services.${serviceIndex}.vehicles` as const
  });

  const km = useWatch({ control, name: `services.${serviceIndex}.logistics.kilometers` as const }) || 0;
  const fuelLiters = useWatch({ control, name: `services.${serviceIndex}.logistics.fuelLiters` as const }) || 0;
  const fuelPrice = useWatch({ control, name: `services.${serviceIndex}.logistics.fuelPricePerLiter` as const }) || 0;

  const handleVehicleSelection = (index: number, vehicleId: string) => {
    const selectedVehicle = catalogs?.vehicles.find((v: any) => v.id.toString() === vehicleId);
    if (selectedVehicle) {
      setValue(`services.${serviceIndex}.vehicles.${index}.name` as const, selectedVehicle.name, { shouldValidate: true });
      setValue(`services.${serviceIndex}.vehicles.${index}.unitPrice` as const, selectedVehicle.price_per_day || 0, { shouldValidate: true });
    }
  };

  const handlePricingTypeChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const pricingType = e.target.value;
    const vehicleId = getValues(`services.${serviceIndex}.vehicles.${index}.vehicleId`);
    const selectedVehicle = catalogs?.vehicles.find((v: any) => v.id.toString() === vehicleId?.toString());
    
    if (selectedVehicle) {
      let newPrice = 0;
      if (pricingType === 'day') newPrice = selectedVehicle.price_per_day;
      if (pricingType === 'ton') newPrice = selectedVehicle.price_per_ton;
      if (pricingType === 'm3') newPrice = selectedVehicle.price_per_m3;
      
      setValue(`services.${serviceIndex}.vehicles.${index}.unitPrice` as const, newPrice || 0, { shouldValidate: true });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Vehículos Asignados</h3>
          <p className="text-sm text-gray-500">Selecciona las unidades y el esquema de cobro volumétrico o de tiempo.</p>
        </div>
        <button
          type="button"
          onClick={() => appendVehicle({ vehicleId: 0, name: '', quantity: 1, unitPrice: 0 })}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> Agregar Vehículo
        </button>
      </div>

      {vehicleFields.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm mb-4">
          No has asignado ningún vehículo. Haz clic en "Agregar Vehículo".
        </div>
      )}

      <div className="space-y-3 mb-4">
        {vehicleFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
            <div className="lg:col-span-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Unidad Operativa</label>
              <select 
                className="w-full px-3 py-2 border rounded-md bg-white"
                {...register(`services.${serviceIndex}.vehicles.${index}.vehicleId` as const, { valueAsNumber: true })}
                onChange={(e) => {
                  register(`services.${serviceIndex}.vehicles.${index}.vehicleId` as const).onChange(e);
                  handleVehicleSelection(index, e.target.value); 
                }}
              >
                <option value="0">Seleccione un vehículo...</option>
                {catalogs?.vehicles.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.useful_tonnage} Ton | {v.drum_capacity} Tambores)
                  </option>
                ))}
              </select>
              {errors.services?.[serviceIndex]?.vehicles?.[index]?.vehicleId && <p className="text-red-500 text-xs mt-1">Requerido</p>}
            </div>

            <input type="hidden" {...register(`services.${serviceIndex}.vehicles.${index}.name` as const)} />

            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-blue-600 mb-1 flex items-center gap-1">
                Esquema de Cobro <Info className="w-3 h-3 text-blue-400" />
              </label>
              <select 
                className="w-full px-3 py-2 border rounded-md bg-white border-blue-200 focus:ring-blue-500"
                onChange={(e) => handlePricingTypeChange(index, e)}
              >
                <option value="day">Por Hora / Operación</option>
                <option value="ton">Por Tonelada Útil</option>
                <option value="m3">Por Metro Cúbico (m³)</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad (Horas/Tons/m³)</label>
              <input 
                type="number" min="0.01" step="0.01"
                className="w-full px-3 py-2 border rounded-md bg-white"
                {...register(`services.${serviceIndex}.vehicles.${index}.quantity` as const, { valueAsNumber: true })}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Tarifa Aplicada ($)</label>
              <input 
                type="number" step="0.01" min="0"
                className="w-full px-3 py-2 border rounded-md bg-white font-semibold"
                {...register(`services.${serviceIndex}.vehicles.${index}.unitPrice` as const, { valueAsNumber: true })}
              />
            </div>

            <div className="lg:col-span-1 flex justify-end pb-2">
              <button type="button" onClick={() => removeVehicle(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {vehicleFields.length > 0 && km > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 text-blue-800 p-3 rounded-md text-sm border border-blue-200 animate-in fade-in">
          <Fuel className="w-5 h-5 text-blue-600" />
          <p>
            <strong>Resumen de Viáticos:</strong> Para la ruta de <strong>{km} km</strong>, 
            esta configuración vehicular requiere <strong>{fuelLiters} litros</strong> de combustible. 
            Costo logístico base: <span className="font-bold text-green-700">${(fuelLiters * fuelPrice).toFixed(2)}</span>
          </p>
        </div>
      )}
    </div>
  );
};