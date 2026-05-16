import { useFormContext, useFieldArray } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";
import { Plus, Trash2 } from 'lucide-react';
import { CatalogData } from '../NewQuoteView';

interface CatalogItemSectionProps {
  serviceIndex: number;
  catalogs?: CatalogData['supplies'];
  type: 'supplies' | 'materials' | 'equipment';
  title: string;
  subtitle: string;
  colorScheme: {
    bg: string;
    text: string;
    hover: string;
    lightBg: string;
    borderColor: string;
  };
}

export const CatalogItemSection = ({ 
  serviceIndex, 
  catalogs = [], 
  type, 
  title, 
  subtitle, 
  colorScheme 
}: CatalogItemSectionProps) => {
  const { register, control, setValue, formState: { errors } } = useFormContext<QuoteFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `services.${serviceIndex}.${type}` as any 
  });

  const handleSelection = (index: number, id: string) => {
    const selectedItem = catalogs.find(s => s.id.toString() === id);
    if (selectedItem) {
      setValue(`services.${serviceIndex}.${type}.${index}.name` as any, selectedItem.name, { shouldValidate: true });
      setValue(`services.${serviceIndex}.${type}.${index}.unitPrice` as any, selectedItem.suggested_price, { shouldValidate: true });
    }
  };

  const idFieldName = type === 'supplies' ? 'supplyId' : type === 'materials' ? 'materialId' : 'equipmentId';

  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => append({ [idFieldName]: 0, name: '', quantity: 1, unitPrice: 0 } as any)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm ${colorScheme.bg} ${colorScheme.text} rounded-md ${colorScheme.hover} transition-colors`}
        >
          <Plus className="w-4 h-4" /> Agregar Item
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
          No has agregado elementos. Haz clic en "Agregar" si los necesitas.
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className={`flex gap-4 items-end ${colorScheme.lightBg} p-4 rounded-lg border ${colorScheme.borderColor} relative`}>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Elemento del Catálogo</label>
              <select 
                className="w-full px-3 py-2 border rounded-md bg-white"
                {...register(`services.${serviceIndex}.${type}.${index}.${idFieldName}` as any, { valueAsNumber: true })}
                onChange={(e) => {
                  register(`services.${serviceIndex}.${type}.${index}.${idFieldName}` as any).onChange(e); 
                  handleSelection(index, e.target.value); 
                }}
              >
                <option value="0">Seleccione una opción...</option>
                {catalogs.map(s => <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>)}
              </select>
              {(errors as any).services?.[serviceIndex]?.[type]?.[index]?.[idFieldName] && <p className="text-red-500 text-xs mt-1">Requerido</p>}
            </div>

            <input type="hidden" {...register(`services.${serviceIndex}.${type}.${index}.name` as any)} />

            <div className="w-24">
              <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
              <input 
                type="number" min="1"
                className="w-full px-3 py-2 border rounded-md bg-white"
                {...register(`services.${serviceIndex}.${type}.${index}.quantity` as any, { valueAsNumber: true })}
              />
            </div>

            <div className="w-32">
              <label className="block text-xs font-medium text-gray-500 mb-1">Precio Unit. ($)</label>
              <input 
                type="number" step="0.01" min="0"
                className="w-full px-3 py-2 border rounded-md bg-white"
                {...register(`services.${serviceIndex}.${type}.${index}.unitPrice` as any, { valueAsNumber: true })}
              />
            </div>

            <button type="button" onClick={() => remove(index)} className="mb-2 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};