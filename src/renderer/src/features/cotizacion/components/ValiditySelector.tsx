import { useFormContext } from 'react-hook-form';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';

export const ValiditySelector = () => {
  const { register, formState: { errors } } = useFormContext<QuoteFormValues>();

  return (
    <div className="lg:col-span-1">
      <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100 h-full flex flex-col justify-center">
        <label className="block text-sm font-medium text-gray-800 mb-4">Vigencia de la Cotización</label>
        <div className="flex gap-6">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="radio" 
              value={15} 
              {...register('validityDays', { valueAsNumber: true })} 
              className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
            />
            <span className="ml-2 text-sm text-gray-700 font-medium">15 Días</span>
          </label>
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="radio" 
              value={30} 
              {...register('validityDays', { valueAsNumber: true })} 
              className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
            />
            <span className="ml-2 text-sm text-gray-700 font-medium">30 Días</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-5 leading-relaxed">
          Los días comienzan a contar a partir de la fecha de emisión del documento oficial.
        </p>
        {errors.validityDays && (
          <p className="text-red-500 text-xs mt-2">{errors.validityDays.message}</p>
        )}
      </div>
    </div>
  );
};