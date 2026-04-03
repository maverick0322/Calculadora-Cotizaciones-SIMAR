import { useFormContext } from 'react-hook-form';
import { QuoteFormValues } from "src/shared/schemas/quoteSchema";

export const LocationStep = () => {
  const { register, formState: { errors } } = useFormContext<QuoteFormValues>();

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b">Detalles de Ubicación</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            {...register('location.street')} 
          />
          {errors.location?.street && <p className="text-red-500 text-xs mt-1">{errors.location.street.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
            <input type="text" className="w-full px-3 py-2 border rounded-md" {...register('location.municipality')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Colonia</label>
            <input type="text" className="w-full px-3 py-2 border rounded-md" {...register('location.neighborhood')} />
          </div>
        </div>
      </div>
    </div>
  );
};