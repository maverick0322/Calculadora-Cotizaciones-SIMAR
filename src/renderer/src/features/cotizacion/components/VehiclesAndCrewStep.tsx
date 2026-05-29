import { CatalogData } from '../NewQuoteView';
import { VehiclesSection } from './VehiclesSection';
import { CrewSection } from './CrewSection';

interface VehiclesAndCrewStepProps {
  serviceIndex: number;
  catalogs?: CatalogData;
}

export const VehiclesAndCrewStep = ({ serviceIndex, catalogs }: VehiclesAndCrewStepProps) => {
  return (
    <div className="space-y-10 mb-8">
      <VehiclesSection 
        serviceIndex={serviceIndex} 
        catalogs={catalogs} 
      />

      <CrewSection 
        serviceIndex={serviceIndex} 
      />
    </div>
  );
};