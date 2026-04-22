import { useFormContext } from 'react-hook-form';
import { QuoteFormValues } from "src/shared/schemas/quoteSchema";

export const LocationStep = () => {
  const { register, formState: { errors } } = useFormContext<QuoteFormValues>();

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b">Datos del Cliente y Ubicación</h2>
      <div className="space-y-5">
        
        {/* Sección 1: Datos Generales del Cliente (Raíz) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Cliente</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('clientName')} 
            />
            {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">RFC</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md uppercase"
              {...register('clientRfc')} 
            />
            {errors.clientRfc && <p className="text-red-500 text-xs mt-1">{errors.clientRfc.message}</p>}
          </div>
        </div>

        {/* Sección 2: Vigencia (Raíz) */}
        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4">
          <label className="block text-sm font-medium text-gray-800 mb-3">Vigencia de la Cotización</label>
          <div className="flex gap-6">
            <label className="inline-flex items-center cursor-pointer">
              <input type="radio" value={15} {...register('validityDays')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
              <span className="ml-2 text-sm text-gray-700 font-medium">15 Días</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input type="radio" value={30} {...register('validityDays')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
              <span className="ml-2 text-sm text-gray-700 font-medium">30 Días</span>
            </label>
          </div>
          {errors.validityDays && <p className="text-red-500 text-xs mt-1">{errors.validityDays.message}</p>}
        </div>

        {/* Sección 3: Ubicación del Servicio (services.0) */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-md font-medium text-gray-800 mb-4">Ubicación de Recolección</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('services.0.location.street')} 
            />
            {errors.services?.[0]?.location?.street && <p className="text-red-500 text-xs mt-1">{errors.services[0].location.street.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad / Municipio</label>
              <input type="text" className="w-full px-3 py-2 border rounded-md" {...register('services.0.location.municipality')} />
              {errors.services?.[0]?.location?.municipality && <p className="text-red-500 text-xs mt-1">{errors.services[0].location.municipality.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Colonia</label>
              <input type="text" className="w-full px-3 py-2 border rounded-md" {...register('services.0.location.neighborhood')} />
              {errors.services?.[0]?.location?.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.services[0].location.neighborhood.message}</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};