import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { STANDARD_VALIDITY_DAYS } from '../../../../../shared/constants/quoteConstants';

const CUSTOM_VALIDITY_VALUE = 'custom';

export const ValiditySelector = () => {
  const { register, setValue, control, formState: { errors } } = useFormContext<QuoteFormValues>();
  const validityDays = useWatch({ control, name: 'validityDays' });
  const [selectedOption, setSelectedOption] = useState<string>(STANDARD_VALIDITY_DAYS.includes(validityDays as 15 | 30) ? String(validityDays) : CUSTOM_VALIDITY_VALUE);

  useEffect(() => {
    setSelectedOption(STANDARD_VALIDITY_DAYS.includes(validityDays as 15 | 30) ? String(validityDays) : CUSTOM_VALIDITY_VALUE);
  }, [validityDays]);

  const handleStandardValidityChange = (days: number) => {
    setSelectedOption(String(days));
    setValue('validityDays', days, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100 h-full flex flex-col justify-center">
        <label className="block text-sm font-medium text-gray-800 mb-4">Vigencia de la Cotización</label>
        <div className="flex flex-wrap gap-4">
          {STANDARD_VALIDITY_DAYS.map((days) => (
            <label key={days} className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                checked={selectedOption === String(days)}
                onChange={() => handleStandardValidityChange(days)}
                className="text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">{days} días</span>
            </label>
          ))}

          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              checked={selectedOption === CUSTOM_VALIDITY_VALUE}
              onChange={() => setSelectedOption(CUSTOM_VALIDITY_VALUE)}
              className="text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="ml-2 text-sm text-gray-700 font-medium">Otro</span>
          </label>
        </div>

        {selectedOption === CUSTOM_VALIDITY_VALUE && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Número de días</label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              {...register('validityDays', { valueAsNumber: true })}
            />
          </div>
        )}

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
