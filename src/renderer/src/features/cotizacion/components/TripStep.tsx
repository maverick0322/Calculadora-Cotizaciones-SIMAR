import { CatalogData } from '../NewQuoteView';
import { RoutePointsSection } from './RoutePointsSection';
import { FuelCalculationSection } from './FuelCalculationSection';
import { TollSection } from './TollSection';

interface TripStepProps {
  serviceIndex: number;
  catalogs?: CatalogData;
}

export const TripStep = ({ serviceIndex, catalogs }: TripStepProps) => {
  return (
    <div className="space-y-6 mb-8">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Logística del Viaje</h3>
        <p className="text-sm text-gray-500">Ruta y combustible del servicio</p>
      </div>

      <RoutePointsSection serviceIndex={serviceIndex} catalogs={catalogs} />
      
      <FuelCalculationSection serviceIndex={serviceIndex} catalogs={catalogs} />
      
      <TollSection serviceIndex={serviceIndex} />
      
    </div>
  );
};