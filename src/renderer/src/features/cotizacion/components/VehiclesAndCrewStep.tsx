import { useFormContext, useFieldArray } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";
import { Plus, Trash2, Info } from 'lucide-react';
import { CatalogData } from '../NewQuoteView';

interface VehiclesAndCrewStepProps {
  serviceIndex: number;
  catalogs?: CatalogData;
}

export const VehiclesAndCrewStep = ({ serviceIndex, catalogs }: VehiclesAndCrewStepProps) => {
  // 👇 Agregamos getValues para leer el vehículo seleccionado en tiempo real
  const { register, control, setValue, getValues, formState: { errors } } = useFormContext<QuoteFormValues>();

  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } = useFieldArray({
    control,
    name: `services.${serviceIndex}.vehicles` as const
  });

  const { fields: crewFields, append: appendCrew, remove: removeCrew } = useFieldArray({
    control,
    name: `services.${serviceIndex}.crew` as const
  });

  const handleVehicleSelection = (index: number, vehicleId: string) => {
    const selectedVehicle = catalogs?.vehicles.find((v: any) => v.id.toString() === vehicleId);
    if (selectedVehicle) {
      setValue(`services.${serviceIndex}.vehicles.${index}.name` as const, selectedVehicle.name, { shouldValidate: true });
      // Por defecto, al seleccionar un vehículo, cargamos la tarifa por Hora/Día
      setValue(`services.${serviceIndex}.vehicles.${index}.unitPrice` as const, selectedVehicle.price_per_day || 0, { shouldValidate: true });
    }
  };

  // 👇 NUEVA FUNCIÓN: Cambia el precio unitario dependiendo del esquema que elija el vendedor
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
    <div className="space-y-10 mb-8">
      {/* SECCIÓN DE VEHÍCULOS */}
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
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
            No has asignado ningún vehículo. Haz clic en "Agregar Vehículo".
          </div>
        )}

        <div className="space-y-3">
          {vehicleFields.map((field, index) => (
            // 👇 Cambiado a Grid de 12 columnas para que quepa todo de forma limpia
            <div key={field.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
              
              {/* SELECTOR DE VEHÍCULO */}
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
                    // Se muestran los datos volumétricos para ayudar al vendedor
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.useful_tonnage} Ton | {v.drum_capacity} Tambores)
                    </option>
                  ))}
                </select>
                {errors.services?.[serviceIndex]?.vehicles?.[index]?.vehicleId && <p className="text-red-500 text-xs mt-1">Requerido</p>}
              </div>

              <input type="hidden" {...register(`services.${serviceIndex}.vehicles.${index}.name` as const)} />

              {/* 👇 NUEVO: SELECTOR DE ESQUEMA DE COBRO */}
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

              {/* CANTIDAD */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad (Horas/Tons/m³)</label>
                <input 
                  type="number" min="0.01" step="0.01"
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  {...register(`services.${serviceIndex}.vehicles.${index}.quantity` as const, { valueAsNumber: true })}
                />
              </div>

              {/* PRECIO UNITARIO */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Tarifa Aplicada ($)</label>
                <input 
                  type="number" step="0.01" min="0"
                  className="w-full px-3 py-2 border rounded-md bg-white font-semibold"
                  {...register(`services.${serviceIndex}.vehicles.${index}.unitPrice` as const, { valueAsNumber: true })}
                />
              </div>

              {/* BOTÓN ELIMINAR */}
              <div className="lg:col-span-1 flex justify-end pb-2">
                <button
                  type="button"
                  onClick={() => removeVehicle(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Quitar vehículo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN DE PERSONAL (CREW) */}
      <div>
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Personal Operativo</h3>
            <p className="text-sm text-gray-500">Choferes y técnicos asignados al viaje</p>
          </div>
          <button
            type="button"
            onClick={() => appendCrew({ type: 'driver', quantity: 1, dailySalary: 400 })}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-4 h-4" /> Agregar Personal
          </button>
        </div>

        {crewFields.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
            No has asignado personal. Recuerda que se necesita al menos un chofer.
          </div>
        )}

        <div className="space-y-3">
          {crewFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end bg-indigo-50/30 p-4 rounded-lg border border-indigo-100 relative">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Puesto Operativo</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  {...register(`services.${serviceIndex}.crew.${index}.type` as const)}
                >
                  <option value="driver">Chofer</option>
                  <option value="technician">Técnico / Auxiliar</option>
                </select>
              </div>

              <div className="w-24">
                <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                <input 
                  type="number" min="1"
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  {...register(`services.${serviceIndex}.crew.${index}.quantity` as const, { valueAsNumber: true })}
                />
              </div>

              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 mb-1">Salario Diario ($)</label>
                <input 
                  type="number" step="0.01" min="0"
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  {...register(`services.${serviceIndex}.crew.${index}.dailySalary` as const, { valueAsNumber: true })}
                />
              </div>

              <button
                type="button"
                onClick={() => removeCrew(index)}
                className="mb-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Quitar personal"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};