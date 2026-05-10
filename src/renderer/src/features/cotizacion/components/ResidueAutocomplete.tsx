import { useState } from 'react';
import { useWatch } from 'react-hook-form';

interface ResidueAutocompleteProps {
  residues: any[];
  registerName: any;
  serviceIndex: number;
  index: number;
  setValue: any;
  error?: any;
}

export const ResidueAutocomplete = ({ 
  residues, registerName, serviceIndex, index, setValue, error 
}: ResidueAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Observamos lo que el usuario escribe
  const currentValue = (useWatch({ name: registerName.name }) as string) || '';

  // Filtramos por nombre o por clave
  const filteredResidues = residues.filter((r: any) => 
    r.name.toLowerCase().includes(currentValue.toLowerCase()) || 
    (r.clave && r.clave.toLowerCase().includes(currentValue.toLowerCase()))
  );

  const handleSelect = (residue: any) => {
    setValue(`services.${serviceIndex}.wastes.${index}.name`, residue.name, { shouldValidate: true, shouldDirty: true });
    setValue(`services.${serviceIndex}.wastes.${index}.type`, residue.residue_type, { shouldValidate: true, shouldDirty: true });
    setValue(`services.${serviceIndex}.wastes.${index}.classification`, residue.classification || 'N/A', { shouldValidate: true, shouldDirty: true });
    setValue(`services.${serviceIndex}.wastes.${index}.clave`, residue.clave || 'N/A', { shouldValidate: true, shouldDirty: true });
    setValue(`services.${serviceIndex}.wastes.${index}.unit`, residue.unit, { shouldValidate: true, shouldDirty: true });
    setValue(`services.${serviceIndex}.wastes.${index}.pricePerUnit`, residue.base_price, { shouldValidate: true, shouldDirty: true });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del residuo</label>
      <input 
        type="text" 
        autoComplete="off"
        placeholder="Ej. Cartón, Aceite..."
        className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
        {...registerName} 
        onFocus={() => setIsOpen(true)}
        onBlur={(e) => {
          registerName.onBlur(e); 
          setTimeout(() => setIsOpen(false), 200); 
        }}
      />
      
      {isOpen && filteredResidues.length > 0 && (
        <ul className="absolute z-20 w-full bg-white border border-gray-200 mt-1 max-h-48 overflow-y-auto rounded-md shadow-lg">
          {filteredResidues.map((r: any) => (
            <li 
              key={r.id}
              onMouseDown={() => handleSelect(r)}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-700 flex flex-col"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-900">
                  {r.name} {r.classification ? <span className="text-gray-400 text-xs font-normal">({r.classification})</span> : ''}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">${r.base_price.toFixed(2)} / {r.unit}</span>
              </div>
              {r.clave && <span className="text-[10px] text-gray-500 font-mono mt-0.5">Clave: {r.clave}</span>}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};