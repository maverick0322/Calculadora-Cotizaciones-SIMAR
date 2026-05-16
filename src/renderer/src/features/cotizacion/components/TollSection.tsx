import { useFormContext, useWatch } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";

interface TollSectionProps {
  serviceIndex: number;
}

export const TollSection = ({ serviceIndex }: TollSectionProps) => {
  const { register, control } = useFormContext<QuoteFormValues>();
  const roadType = useWatch({ control, name: `services.${serviceIndex}.logistics.roadType` as const });

  return (
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
  );
};