import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { useLocationAutocomplete } from '../hooks/useLocationAutocomplete';
import { CustomAutocomplete } from './CustomAutocomplete';

interface ServiceLocationFieldsProps {
  locationPath: string;
  title: string;
  streetLabel?: string;
  streetPlaceholder?: string;
}

const getPathValue = (source: unknown, path: string): any =>
  path.split('.').reduce((current: any, segment) => current?.[segment], source);

export const ServiceLocationFields = ({
  locationPath,
  title,
  streetLabel = 'Dirección',
  streetPlaceholder = 'Ej. Av. Lázaro Cárdenas 100'
}: ServiceLocationFieldsProps) => {
  const { register, control, setValue, formState: { errors } } = useFormContext<QuoteFormValues>();
  const {
    states,
    municipalities,
    colonies,
    isLoading,
    saveCustomColony,
    isMunicipalityDisabled,
    isColonyDisabled
  } = useLocationAutocomplete(locationPath);

  const [isSaving, setIsSaving] = useState(false);
  const currentNeighborhood = useWatch({ control, name: `${locationPath}.neighborhood` as any });
  const locationErrors = getPathValue(errors, locationPath);
  const normalizedNeighborhood = String(currentNeighborhood || '').toUpperCase();
  const isNewColony = normalizedNeighborhood && colonies.length > 0 && !colonies.includes(normalizedNeighborhood);

  const handleSaveColony = async () => {
    setIsSaving(true);
    await saveCustomColony(currentNeighborhood);
    setIsSaving(false);
  };

  return (
    <section className="space-y-5">
      <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">{title}</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{streetLabel}</label>
        <input
          type="text"
          placeholder={streetPlaceholder}
          className="w-full px-3 py-2 border rounded-md bg-white"
          {...register(`${locationPath}.street` as any)}
        />
        {locationErrors?.street && <p className="text-red-500 text-xs mt-1">{locationErrors.street.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="md:col-span-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código Postal {isLoading && <span className="text-blue-500 text-xs ml-2 animate-pulse">(Buscando...)</span>}
          </label>
          <input
            type="text"
            maxLength={5}
            placeholder="Ej. 91000"
            className={`w-full px-3 py-2 border rounded-md ${isLoading ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
            {...register(`${locationPath}.cp` as any)}
          />
        </div>

        <CustomAutocomplete
          label="Estado"
          options={states}
          registerName={register(`${locationPath}.state` as any)}
          placeholder="Escribe o selecciona..."
          error={locationErrors?.state}
          setValue={setValue}
        />

        <CustomAutocomplete
          label="Ciudad / Municipio"
          options={municipalities}
          disabled={isMunicipalityDisabled}
          registerName={register(`${locationPath}.municipality` as any)}
          placeholder={isMunicipalityDisabled ? 'Selecciona un Estado primero' : 'Escribe o selecciona...'}
          error={locationErrors?.municipality}
          setValue={setValue}
        />

        <CustomAutocomplete
          label="Colonia"
          options={colonies}
          disabled={isColonyDisabled}
          registerName={register(`${locationPath}.neighborhood` as any)}
          placeholder={isColonyDisabled ? 'Selecciona un Municipio' : 'Escribe o selecciona...'}
          error={locationErrors?.neighborhood}
          setValue={setValue}
        />
      </div>

      {isNewColony && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex justify-between items-center animate-in fade-in slide-in-from-top-2">
          <span className="text-sm">Esta colonia no está en el catálogo.</span>
          <button
            type="button"
            onClick={handleSaveColony}
            disabled={isSaving}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded transition-colors disabled:bg-blue-300"
          >
            {isSaving ? 'Guardando...' : 'Guardar en Catálogo'}
          </button>
        </div>
      )}
    </section>
  );
};
