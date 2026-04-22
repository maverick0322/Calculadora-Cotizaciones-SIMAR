import { useFormContext, useFieldArray } from 'react-hook-form';
import { QuoteFormValues } from "src/shared/schemas/quoteSchema";
import { Plus, Trash2 } from 'lucide-react';
import { CatalogData } from '../NewQuoteView';

interface SuppliesStepProps {
  catalogs?: CatalogData;
}

export const SuppliesStep = ({ catalogs }: SuppliesStepProps) => {
  const { register, control, setValue, formState: { errors } } = useFormContext<QuoteFormValues>();

  // FieldArray para los Insumos
  const { fields: supplyFields, append: appendSupply, remove: removeSupply } = useFieldArray({
    control,
    name: "services.0.supplies"
  });

  const { fields: extraCostFields, append: appendExtraCost, remove: removeExtraCost } = useFieldArray({
    control,
    name: "services.0.extraCosts"
  });

  const handleSupplySelection = (index: number, supplyId: string) => {
    const selectedSupply = catalogs?.supplies.find(s => s.id.toString() === supplyId);
    if (selectedSupply) {
      setValue(`services.0.supplies.${index}.name`, selectedSupply.name, { shouldValidate: true });
      setValue(`services.0.supplies.${index}.unitPrice`, selectedSupply.suggested_price, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-10">
      
      <div>
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Insumos y Materiales</h3>
            <p className="text-sm text-gray-500">Bolsas, contenedores, equipo de protección, etc.</p>
          </div>
          <button
            type="button"
            onClick={() => appendSupply({ supplyId: 0, name: '', quantity: 1, unitPrice: 0 })}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-4 h-4" /> Agregar Insumo
          </button>
        </div>

        {supplyFields.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
            No has agregado insumos. Haz clic en "Agregar Insumo" si los necesitas.
          </div>
        )}

        <div className="space-y-3">
          {supplyFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Insumo</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  {...register(`services.0.supplies.${index}.supplyId`)}
                  onChange={(e) => {
                    register(`services.0.supplies.${index}.supplyId`).onChange(e); 
                    handleSupplySelection(index, e.target.value); 
                  }}
                >
                  <option value="0">Seleccione un insumo...</option>
                  {catalogs?.supplies.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                  ))}
                </select>
                {errors.services?.[0]?.supplies?.[index]?.supplyId && <p className="text-red-500 text-xs mt-1">Requerido</p>}
              </div>

              <input type="hidden" {...register(`services.0.supplies.${index}.name`)} />

              <div className="w-24">
                <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                <input 
                  type="number" min="1"
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  {...register(`services.0.supplies.${index}.quantity`)}
                />
              </div>

              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 mb-1">Precio Unit. ($)</label>
                <input 
                  type="number" step="0.01" min="0"
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  {...register(`services.0.supplies.${index}.unitPrice`)}
                />
              </div>

              <button
                type="button"
                onClick={() => removeSupply(index)}
                className="mb-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Quitar insumo"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Costos Adicionales (Opcional)</h3>
            <p className="text-sm text-gray-500">Maniobras especiales, viáticos extra, permisos, etc.</p>
          </div>
          <button
            type="button"
            onClick={() => appendExtraCost({ description: '', amount: 0 })}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors"
          >
            <Plus className="w-4 h-4" /> Agregar Costo Extra
          </button>
        </div>

        {extraCostFields.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
            Sin costos adicionales configurados.
          </div>
        )}

        <div className="space-y-3">
          {extraCostFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end bg-orange-50/30 p-4 rounded-lg border border-orange-100 relative">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Descripción del Cargo</label>
                <input 
                  type="text" 
                  placeholder="Ej. Maniobra de carga con montacargas"
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  {...register(`services.0.extraCosts.${index}.description`)}
                />
                {errors.services?.[0]?.extraCosts?.[index]?.description && <p className="text-red-500 text-xs mt-1">Requerido</p>}
              </div>

              <div className="w-40">
                <label className="block text-xs font-medium text-gray-500 mb-1">Monto ($)</label>
                <input 
                  type="number" step="0.01" min="0"
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  {...register(`services.0.extraCosts.${index}.amount`)}
                />
                {errors.services?.[0]?.extraCosts?.[index]?.amount && <p className="text-red-500 text-xs mt-1">Inválido</p>}
              </div>

              <button
                type="button"
                onClick={() => removeExtraCost(index)}
                className="mb-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Quitar costo extra"
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