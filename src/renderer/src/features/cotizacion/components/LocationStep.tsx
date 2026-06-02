import { ServiceLocationFields } from './ServiceLocationFields';

interface LocationStepProps {
  serviceIndex: number;
}

export const LocationStep = ({ serviceIndex }: LocationStepProps) => (
  <div className="mb-8">
    <ServiceLocationFields
      locationPath={`services.${serviceIndex}.location`}
      title="Ubicación de Recolección"
      streetLabel="Dirección de la sucursal / origen"
      streetPlaceholder="Ej. Av. Lázaro Cárdenas 100"
    />
  </div>
);
