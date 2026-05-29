import { useState, useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { Users } from 'lucide-react';

export const ClientNameAutocomplete = () => {
  const { register, setValue, formState: { errors }, control } = useFormContext<QuoteFormValues>();
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const clientNameValue = useWatch({ control, name: 'clientName' }) || '';

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (clientNameValue.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await window.api.manageClientDirectory('search', clientNameValue);
        if (response.success && response.data.length > 0) {
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectClient = (client: any) => {
    setValue('clientName', client.client_name, { shouldValidate: true, shouldDirty: true });
    setValue('clientRfc', client.client_rfc || '', { shouldValidate: true, shouldDirty: true });
    setValue('contactName', client.contact_name || '', { shouldValidate: true, shouldDirty: true });
    setValue('contactPhone', client.contact_phone || '', { shouldValidate: true, shouldDirty: true });
    setValue('contactEmail', client.contact_email || '', { shouldValidate: true, shouldDirty: true });
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social / Nombre Legal *</label>
      <input 
        {...register('clientName')} 
        autoComplete="off"
        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
        placeholder="Ej. Empresa SA de CV" 
      />
      {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName.message}</p>}

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
  );
};