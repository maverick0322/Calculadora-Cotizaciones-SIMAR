import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";
import { useLocationAutocomplete } from '../hooks/useLocationAutocomplete';

const CustomAutocomplete = ({ 
  label, options = [], registerName, disabled, placeholder, error, isLoading = false, setValue 
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // ¡CORRECCIÓN AQUÍ! Extraemos el .name del objeto registerName
  const currentValue = (useWatch({ name: registerName.name }) as string) || '';

  // Filtramos las opciones localmente (protegemos con options || [] por si acaso)
  const filteredOptions = options.filter((opt: string) => 
    opt.toLowerCase().includes(currentValue.toLowerCase())
  );

  return (
    <div className="relative md:col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {isLoading && <span className="text-blue-500 text-xs ml-2 animate-pulse">(Buscando...)</span>}
      </label>
      
      <input 
        type="text" 
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-md bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
        {...registerName} 
        onFocus={() => setIsOpen(true)}
        onBlur={(e) => {
          registerName.onBlur(e); 
          setTimeout(() => setIsOpen(false), 200);
        }}
      />
      
      {isOpen && filteredOptions.length > 0 && !disabled && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 max-h-48 overflow-y-auto rounded-md shadow-lg">
          {filteredOptions.map((opt: string) => (
            <li 
              key={opt}
              onMouseDown={() => {
                setValue(registerName.name, opt, { shouldValidate: true, shouldDirty: true });
                setIsOpen(false);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-700"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};

export const LocationStep = ({ serviceIndex }: { serviceIndex: number }) => {
  const { register, control, setValue, formState: { errors } } = useFormContext<QuoteFormValues>();
  
  const {
    states,
    municipalities,
    colonies,
    isLoading,
    saveCustomColony,
    isMunicipalityDisabled,
    isColonyDisabled
  } = useLocationAutocomplete(serviceIndex);

  const [isSaving, setIsSaving] = useState(false);

  const currentNeighborhood = useWatch({ control, name: `services.${serviceIndex}.location.neighborhood` as const });
  
  const isNewColony = currentNeighborhood 
    && colonies.length > 0 
    && !colonies.includes(currentNeighborhood.toUpperCase());

  const handleSaveColony = async () => {
    setIsSaving(true);
    await saveCustomColony(currentNeighborhood);
    setIsSaving(false);
  };

  const locErrors = errors.services?.[serviceIndex]?.location;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Ubicación de Recolección</h3>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de la sucursal / origen (Calle y Número)</label>
          <input
            type="text"
            placeholder="Ej. Av. Lázaro Cárdenas 100"
            className="w-full px-3 py-2 border rounded-md"
            {...register(`services.${serviceIndex}.location.street` as const)} 
          />
          {locErrors?.street && <p className="text-red-500 text-xs mt-1">{locErrors.street.message}</p>}
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
              className={`w-full px-3 py-2 border rounded-md ${isLoading ? 'bg-blue-50 border-blue-300' : ''}`}
              {...register(`services.${serviceIndex}.location.cp` as any)} 
            />
          </div>

          <CustomAutocomplete
            label="Estado"
            options={states}
            registerName={register(`services.${serviceIndex}.location.state` as const)}
            placeholder="Escribe o selecciona..."
            error={locErrors?.state}
            setValue={setValue}
          />

          <CustomAutocomplete
            label="Ciudad / Municipio"
            options={municipalities}
            disabled={isMunicipalityDisabled}
            registerName={register(`services.${serviceIndex}.location.municipality` as const)}
            placeholder={isMunicipalityDisabled ? 'Selecciona un Estado primero' : 'Escribe o selecciona...'}
            error={locErrors?.municipality}
            setValue={setValue}
          />

          <CustomAutocomplete
            label="Colonia"
            options={colonies}
            disabled={isColonyDisabled}
            registerName={register(`services.${serviceIndex}.location.neighborhood` as const)}
            placeholder={isColonyDisabled ? 'Selecciona un Municipio' : 'Escribe o selecciona...'}
            error={locErrors?.neighborhood}
            setValue={setValue}
          />

        </div>

        {isNewColony && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex justify-between items-center animate-in fade-in slide-in-from-top-2">
            <span className="text-sm">
              ℹ️ Esta colonia no está en el catálogo.
            </span>
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

      </div>
    </div>
  );
};