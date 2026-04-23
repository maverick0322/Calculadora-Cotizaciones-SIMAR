import { useFormContext, useFieldArray } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";
import { Plus, Trash2 } from 'lucide-react';
import { CatalogData } from '../NewQuoteView';

interface VehiclesAndCrewStepProps {
  serviceIndex: number;
  catalogs?: CatalogData;
}

export const VehiclesAndCrewStep = ({ serviceIndex, catalogs }: VehiclesAndCrewStepProps) => {
  const { register, control, setValue, formState: { errors } } = useFormContext<QuoteFormValues>();

  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } = useFieldArray({
    control,
    name: `services.${serviceIndex}.vehicles` as const
  });

  const { fields: crewFields, append: appendCrew, remove: removeCrew } = useFieldArray({
    control,
    name: `services.${serviceIndex}.crew` as const
  });

  const handleVehicleSelection = (index: number, vehicleId: string) => {
    const selectedVehicle = catalogs?.vehicles.find(v => v.id.toString() === vehicleId);
    if (selectedVehicle) {
      setValue(`services.${serviceIndex}.vehicles.${index}.name` as const, selectedVehicle.name, { shouldValidate: true });
      setValue(`services.${serviceIndex}.vehicles.${index}.unitPrice` as const, selectedVehicle.base_price, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-10 mb-8">
      {/* SECCIÓN DE VEHÍCULOS */}
      <div>
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Vehículos Asignados</h3>
            <p className="text-sm text-gray-500">Selecciona las unidades necesarias para este servicio</p>
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
            <div key={field.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Vehículo</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  {...register(`services.${serviceIndex}.vehicles.${index}.vehicleId` as const, { valueAsNumber: true })}
                  onChange={(e) => {
                    register(`services.${serviceIndex}.vehicles.${index}.vehicleId` as const).onChange(e);
                    handleVehicleSelection(index, e.target.value); 
                  }}
                >
                  <option value="0">Seleccione un vehículo...</option>
                  {catalogs?.vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.capacity_kg}kg)</option>
                  ))}
                </select>
                {errors.services?.[serviceIndex]?.vehicles?.[index]?.vehicleId && <p className="text-red-500 text-xs mt-1">Requerido</p>}
              </div>

              <input type="hidden" {...register(`services.${serviceIndex}.vehicles.${index}.name` as const)} />

              <div className="w-24">
                <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                <input 
                  type="number" min="1"
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  {...register(`services.${serviceIndex}.vehicles.${index}.quantity` as const, { valueAsNumber: true })}
                />
              </div>

              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 mb-1">Precio Unit. ($)</label>
                <input 
                  type="number" step="0.01" min="0"
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  {...register(`services.${serviceIndex}.vehicles.${index}.unitPrice` as const, { valueAsNumber: true })}
                />
              </div>

              <button
                type="button"
                onClick={() => removeVehicle(index)}
                className="mb-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Quitar vehículo"
              >
                <Trash2 className="w-5 h-5" />
              </button>
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