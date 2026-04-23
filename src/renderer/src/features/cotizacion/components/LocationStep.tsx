import { useFormContext } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";

export const LocationStep = ({ serviceIndex }: { serviceIndex: number }) => {
  const { register, formState: { errors } } = useFormContext<QuoteFormValues>();

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Ubicación de Recolección</h3>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de la sucursal / origen</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            {...register(`services.${serviceIndex}.location.street` as const)} 
          />
          {errors.services?.[serviceIndex]?.location?.street && (
            <p className="text-red-500 text-xs mt-1">{errors.services[serviceIndex].location.street.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad / Municipio</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-md" 
              {...register(`services.${serviceIndex}.location.municipality` as const)} 
            />
            {errors.services?.[serviceIndex]?.location?.municipality && (
              <p className="text-red-500 text-xs mt-1">{errors.services[serviceIndex].location.municipality.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Colonia</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-md" 
              {...register(`services.${serviceIndex}.location.neighborhood` as const)} 
            />
            {errors.services?.[serviceIndex]?.location?.neighborhood && (
              <p className="text-red-500 text-xs mt-1">{errors.services[serviceIndex].location.neighborhood.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-md" 
              {...register(`services.${serviceIndex}.location.state` as const)} 
            />
            {errors.services?.[serviceIndex]?.location?.state && (
              <p className="text-red-500 text-xs mt-1">{errors.services[serviceIndex].location.state.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};