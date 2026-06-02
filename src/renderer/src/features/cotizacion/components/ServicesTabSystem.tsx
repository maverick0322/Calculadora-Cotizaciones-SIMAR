import { Trash2, Plus } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { LocationStep } from './LocationStep';
import { WasteStep } from './WasteStep';
import { TripStep } from './TripStep';
import { VehiclesAndCrewStep } from './VehiclesAndCrewStep';
import { SuppliesStep } from './SuppliesStep';
import { CatalogData } from '../NewQuoteView';
import { ServiceTypeSelector } from './ServiceTypeSelector';
import { RESIDUE_SERVICE_TYPES, SERVICE_TYPE_LABELS } from '../../../../../shared/constants/quoteConstants';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { TrainingStep } from './TrainingStep';
import { EcologicalCleaningStep } from './EcologicalCleaningStep';
import { ConditioningLaborSection } from './ConditioningLaborSection';
import { ExtraCostsSection } from './ExtraCostsSection';

interface ServicesTabSystemProps {
  serviceFields: Record<"id", string>[];
  activeTab: number;
  setActiveTab: (index: number) => void;
  removeService: (index: number) => void;
  addNewService: () => void;
  catalogs: CatalogData;
}

export const ServicesTabSystem = ({ 
  serviceFields, activeTab, setActiveTab, removeService, addNewService, catalogs 
}: ServicesTabSystemProps) => {
  const { control } = useFormContext<QuoteFormValues>();
  const services = useWatch({ control, name: 'services' }) || [];
  
  return (
    <div className="mt-8">
      {/* HEADER DE PESTAÑAS */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        {serviceFields.map((field, index) => (
          <button
            key={field.id}
            type="button"
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2
              ${activeTab === index 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-b-0'}`}
          >
            Servicio {index + 1}
            {serviceFields.length > 1 && (
              <Trash2 
                className="w-4 h-4 ml-2 hover:text-red-400" 
                onClick={(e) => {
                  e.stopPropagation();
                  removeService(index);
                  if (activeTab >= index) setActiveTab(Math.max(0, activeTab - 1));
                }}
              />
            )}
          </button>
        ))}
        
        <button
          type="button"
          onClick={addNewService}
          className="ml-2 px-3 py-2 rounded-t-lg font-medium text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 border-b-0 flex items-center gap-1 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Agregar Servicio
        </button>
      </div>

      {/* CONTENIDO DE LA PESTAÑA ACTIVA */}
      <div className="border border-t-0 border-gray-200 p-6 rounded-b-lg shadow-sm bg-white min-h-[500px]">
        {serviceFields.map((field, index) => (
          <div 
            key={field.id} 
            className={activeTab === index ? 'block animate-in fade-in' : 'hidden'}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
              Configuración del Servicio {index + 1}
            </h2>
            
            <ServiceTypeSelector serviceIndex={index} />

            {RESIDUE_SERVICE_TYPES.includes(services[index]?.serviceType as any) && (
              <>
                <LocationStep serviceIndex={index} />
                <WasteStep serviceIndex={index} />
                <TripStep serviceIndex={index} catalogs={catalogs} />
                <VehiclesAndCrewStep serviceIndex={index} catalogs={catalogs} />
                <SuppliesStep serviceIndex={index} catalogs={catalogs} />
              </>
            )}

            {services[index]?.serviceType === 'material_sale' && (
              <SuppliesStep serviceIndex={index} catalogs={catalogs} />
            )}

            {services[index]?.serviceType === 'conditioning' && (
              <>
                <SuppliesStep serviceIndex={index} catalogs={catalogs} />
                <ConditioningLaborSection serviceIndex={index} />
              </>
            )}

            {services[index]?.serviceType === 'training' && (
              <TrainingStep serviceIndex={index} />
            )}

            {services[index]?.serviceType === 'ecological_cleaning' && (
              <EcologicalCleaningStep serviceIndex={index} />
            )}

            {services[index]?.serviceType === 'environmental_consulting' && (
              <div className="space-y-8">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                  <h3 className="text-lg font-medium text-gray-900">{SERVICE_TYPE_LABELS.environmental_consulting}</h3>
                  <p className="text-sm text-gray-500">Captura el alcance económico como conceptos específicos.</p>
                </div>
                <ExtraCostsSection serviceIndex={index} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
