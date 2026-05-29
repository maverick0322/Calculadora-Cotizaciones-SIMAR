import { Trash2, Plus } from 'lucide-react';
import { LocationStep } from './LocationStep';
import { WasteStep } from './WasteStep';
import { TripStep } from './TripStep';
import { VehiclesAndCrewStep } from './VehiclesAndCrewStep';
import { SuppliesStep } from './SuppliesStep';
import { CatalogData } from '../NewQuoteView';

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
            
            <LocationStep serviceIndex={index} />
            <WasteStep serviceIndex={index} />
            <TripStep serviceIndex={index} catalogs={catalogs} />
            <VehiclesAndCrewStep serviceIndex={index} catalogs={catalogs} />
            <SuppliesStep serviceIndex={index} catalogs={catalogs} />
          </div>
        ))}
      </div>
    </div>
  );
};