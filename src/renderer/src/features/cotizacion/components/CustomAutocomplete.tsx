import { useState } from 'react';
import { useWatch } from 'react-hook-form';

interface CustomAutocompleteProps {
  label: string;
  options?: string[];
  registerName: any;
  disabled?: boolean;
  placeholder?: string;
  error?: any;
  isLoading?: boolean;
  setValue: any;
}

export const CustomAutocomplete = ({ 
  label, 
  options = [], 
  registerName, 
  disabled, 
  placeholder, 
  error, 
  isLoading = false, 
  setValue 
}: CustomAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentValue = (useWatch({ name: registerName.name }) as string) || '';

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