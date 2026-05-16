import { useFormContext } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";
import { CatalogData } from '../NewQuoteView';

interface RoutePointsSectionProps {
  serviceIndex: number;
  catalogs?: CatalogData;
}

export const RoutePointsSection = ({ serviceIndex, catalogs }: RoutePointsSectionProps) => {
  const { register } = useFormContext<QuoteFormValues>();

  return (
    <>
      <datalist id="warehouse-list">
        {catalogs?.warehouses.map(w => (
          <option key={w.id} value={w.name} />
        ))}
      </datalist>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Punto de Origen</label>
          <input
            type="text" list="warehouse-list"
            {...register(`services.${serviceIndex}.logistics.origin` as const)}
            placeholder="Ej. Instalaciones del cliente"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Punto de Llegada</label>
          <input
            type="text" list="warehouse-list"
            {...register(`services.${serviceIndex}.logistics.primaryDestination` as const)}
            placeholder="Ej. Almacén Central SIMAR"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
      </div>
    </>
  );
};