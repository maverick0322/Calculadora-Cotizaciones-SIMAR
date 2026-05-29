import { useFormContext } from 'react-hook-form';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { Save } from 'lucide-react';
import { ClientNameAutocomplete } from './ClientNameAutocomplete';

interface ClientInfoStepProps {
  saveClient: boolean;
  setSaveClient: (val: boolean) => void;
}

export const ClientInfoStep = ({ saveClient, setSaveClient }: ClientInfoStepProps) => {
  const { register, formState: { errors } } = useFormContext<QuoteFormValues>();

  return (
    <div className="lg:col-span-2 flex flex-col justify-between h-full">
      
      {/* Selector de Tipo de Persona */}
      <div className="flex gap-6 mb-4 pb-4 border-b border-gray-100">
        <label className="inline-flex items-center cursor-pointer">
          <input type="radio" value="moral" {...register('personType')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
          <span className="ml-2 text-sm font-medium text-gray-700">Persona Moral</span>
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <input type="radio" value="fisica" {...register('personType')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
          <span className="ml-2 text-sm font-medium text-gray-700">Persona Física</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Componente Modularizado del Buscador */}
        <ClientNameAutocomplete />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial (Opcional)</label>
          <input 
            {...register('commercialName')} 
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Ej. Restaurante El Fogón" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RFC *</label>
          <input 
            {...register('clientRfc')} 
            className="w-full px-3 py-2 border rounded-md uppercase focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="XAXX010101000" 
          />
          {errors.clientRfc && <p className="text-red-500 text-xs mt-1">{errors.clientRfc.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contacto y Cargo *</label>
          <input 
            {...register('contactName')} 
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Ej. Ing. Juan Pérez - Compras" 
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

        <div>
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