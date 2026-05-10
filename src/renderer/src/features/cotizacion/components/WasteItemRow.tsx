import { useFormContext, useWatch } from 'react-hook-form';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema"; 
import { Trash2, AlertCircle } from 'lucide-react';
import { ResidueAutocomplete } from './ResidueAutocomplete';

const CLASSIFICATION_OTROS_CLAVE: Record<string, string> = {
  'RR': 'RR-5', 'RSA': 'RSA-11', 'RGA-PASFA': 'RGA-PASFA-8',
  'RINP': 'RINP-48', 'RST-PAFPA': 'RST-PAFPA-11', 'RLTAR': 'RLTAR-8',
  'RDP': 'RDP-6', 'RCA': 'RC-12', 'RTPII': 'RTPII-15',
  'RO': 'RO-9', 'RI': 'RI-11'
};

const CLASSIFICATIONS_LIST = Object.keys(CLASSIFICATION_OTROS_CLAVE);
const RESIDUE_TYPES = ['Residuo de Manejo Especial (RME)', 'Peligroso', 'Sólido Urbano (RSU)', 'Reciclable', 'Biológico-Infeccioso (RPBI)', 'Otro'];
const UNIT_TYPES = ['Kilogramo', 'Tonelada', 'Metro Cúbico', 'Litro', 'Pieza', 'Contenedor', 'Viaje'];

interface WasteItemRowProps {
  serviceIndex: number;
  index: number;
  residues: any[];
  onRemove: () => void;
  showRemoveButton: boolean;
}

export const WasteItemRow = ({ serviceIndex, index, residues, onRemove, showRemoveButton }: WasteItemRowProps) => {
  const { register, setValue, formState: { errors } } = useFormContext<QuoteFormValues>();
  
  const wastesWatcher = useWatch({ name: `services.${serviceIndex}.wastes` });
  const currentName = wastesWatcher?.[index]?.name?.toLowerCase() || '';
  
  const isExactCatalogMatch = residues.some((r: any) => r.name.toLowerCase() === currentName);
  const isOtros = currentName === 'otros' || wastesWatcher?.[index]?.clave?.includes('Otros');
  const isManualEntry = currentName.length > 0 && !isExactCatalogMatch;
  const requiresSpecificDescription = isOtros || isManualEntry;

  const handleClassificationChange = (newClassification: string) => {
    setValue(`services.${serviceIndex}.wastes.${index}.classification`, newClassification);
    if (CLASSIFICATION_OTROS_CLAVE[newClassification]) {
      setValue(`services.${serviceIndex}.wastes.${index}.clave`, CLASSIFICATION_OTROS_CLAVE[newClassification]);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
      {showRemoveButton && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
          title="Eliminar residuo"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 pr-8">
        <div className="lg:col-span-2">
          <ResidueAutocomplete
            residues={residues}
            serviceIndex={serviceIndex}
            index={index}
            setValue={setValue}
            registerName={register(`services.${serviceIndex}.wastes.${index}.name` as const)}
            error={errors.services?.[serviceIndex]?.wastes?.[index]?.name}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select 
            className="w-full px-3 py-2 border rounded-md bg-white disabled:bg-gray-100 disabled:text-gray-500" 
            disabled={isExactCatalogMatch}
            {...register(`services.${serviceIndex}.wastes.${index}.type` as const)}
          >
            {RESIDUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Clasificación</label>
          {isManualEntry ? (
            <select 
              className="w-full px-3 py-2 border rounded-md bg-white border-orange-300 focus:ring-orange-500"
              value={wastesWatcher?.[index]?.classification || ''}
              onChange={(e) => handleClassificationChange(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {CLASSIFICATIONS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input 
              type="text" 
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600" 
              {...register(`services.${serviceIndex}.wastes.${index}.classification` as const)} 
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Clave</label>
          <input 
            type="text" 
            readOnly
            className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600 font-mono text-sm" 
            {...register(`services.${serviceIndex}.wastes.${index}.clave` as const)} 
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Precio Unitario ($)</label>
          <input 
            type="number" 
            step="0.01" 
            min="0"
            className="w-full px-3 py-2 border rounded-md bg-white" 
            {...register(`services.${serviceIndex}.wastes.${index}.pricePerUnit` as const, { valueAsNumber: true })} 
          />
        </div>

        {requiresSpecificDescription ? (
          <div className="lg:col-span-4 animate-in fade-in slide-in-from-top-2">
            <label className="block text-xs font-medium text-orange-600 mb-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Especificar residuo (Obligatorio)
            </label>
            <input 
              type="text" 
              placeholder="Describa el residuo con precisión..."
              className="w-full px-3 py-2 border border-orange-300 rounded-md bg-orange-50 focus:ring-2 focus:ring-orange-500 outline-none" 
              {...register(`services.${serviceIndex}.wastes.${index}.specificDescription` as const, { required: "Especifique el residuo" })} 
            />
            {errors.services?.[serviceIndex]?.wastes?.[index]?.specificDescription && (
              <p className="text-red-500 text-xs mt-1">Obligatorio para residuos no catalogados u "Otros".</p>
            )}
          </div>
        ) : (
          <div className="lg:col-span-4"></div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
          <input 
            type="number" 
            step="0.01" 
            className="w-full px-3 py-2 border rounded-md bg-white" 
            {...register(`services.${serviceIndex}.wastes.${index}.quantity` as const, { valueAsNumber: true })} 
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Unidad</label>
          <select className="w-full px-3 py-2 border rounded-md bg-white" {...register(`services.${serviceIndex}.wastes.${index}.unit` as const)}>
            {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};