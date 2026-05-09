import { useState, useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { Users, Save } from 'lucide-react';

interface ClientInfoStepProps {
  saveClient: boolean;
  setSaveClient: (val: boolean) => void;
}

export const ClientInfoStep = ({ saveClient, setSaveClient }: ClientInfoStepProps) => {
  const { register, setValue, formState: { errors }, control } = useFormContext<QuoteFormValues>();
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Observamos lo que el usuario escribe en Razón Social
  const clientNameValue = useWatch({ control, name: 'clientName' }) || '';

  // Buscador con delay (debounce) para no saturar SQLite
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (clientNameValue.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await window.api.manageClientDirectory('search', clientNameValue);
        if (response.success && response.data.length > 0) {
          // Solo mostramos si no hemos seleccionado exactamente el mismo nombre
          const exactMatch = response.data.find((c: any) => c.client_name === clientNameValue);
          if (!exactMatch) {
            setSuggestions(response.data);
            setShowSuggestions(true);
          } else {
            setShowSuggestions(false);
          }
        } else {
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [clientNameValue]);

  // Cerrar sugerencias al dar clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función mágica que llena todo de golpe
  const handleSelectClient = (client: any) => {
    setValue('clientName', client.client_name, { shouldValidate: true, shouldDirty: true });
    setValue('clientRfc', client.client_rfc || '', { shouldValidate: true, shouldDirty: true });
    setValue('contactName', client.contact_name || '', { shouldValidate: true, shouldDirty: true });
    setValue('contactPhone', client.contact_phone || '', { shouldValidate: true, shouldDirty: true });
    setValue('contactEmail', client.contact_email || '', { shouldValidate: true, shouldDirty: true });
    setShowSuggestions(false);
  };

  return (
    <div className="lg:col-span-2 flex flex-col justify-between h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Razón Social con Autocomplete */}
        <div className="relative" ref={wrapperRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
          <input 
            {...register('clientName')} 
            autoComplete="off"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Ej. Empresa SA de CV" 
          />
          {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName.message}</p>}

          {/* Menú desplegable de sugerencias */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((client) => (
                <li 
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">{client.client_name}</p>
                      <p className="text-xs text-gray-500 flex gap-2">
                        {client.client_rfc && <span>RFC: {client.client_rfc}</span>}
                        {client.contact_name && <span>• {client.contact_name}</span>}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
          <input 
            {...register('clientRfc')} 
            className="w-full px-3 py-2 border rounded-md uppercase focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="XAXX010101000" 
          />
          {errors.clientRfc && <p className="text-red-500 text-xs mt-1">{errors.clientRfc.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Responsable</label>
          <input 
            {...register('contactName')} 
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Ej. Ing. Juan Pérez" 
          />
          {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de Teléfono</label>
          <input 
            type="tel"
            {...register('contactPhone')} 
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Ej. 228 123 4567" 
          />
          {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo del Responsable</label>
          <input 
            type="email"
            {...register('contactEmail')} 
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Ej. juan.perez@empresa.com" 
          />
          {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail.message}</p>}
        </div>
      </div>

      {/* Checkbox para auto-guardar */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={saveClient}
            onChange={(e) => setSaveClient(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors flex items-center gap-1.5">
            <Save className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            Guardar/Actualizar en libreta de contactos
          </span>
        </label>
      </div>
    </div>
  );
};