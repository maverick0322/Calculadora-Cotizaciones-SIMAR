import { SERVICE_TYPE_LABELS } from '../../../../../shared/constants/quoteConstants';
import type { ReactNode } from 'react';

const activityTranslates: Record<string, string> = {
  collection: 'Recolección', transport: 'Transporte', transfer: 'Transferencia', final_disposal: 'Disposición Final'
};

const crewLabels: Record<string, string> = {
  coordinator: 'Coordinador',
  technician: 'Técnico',
  operator: 'Operador',
  driver: 'Conductor'
};

const educationLabels: Record<string, string> = {
  basic: 'Básico',
  middle_high: 'Medio superior',
  higher: 'Superior',
  operational: 'Operativo',
  administrative: 'Administrativo'
};

const getFrequencyString = (f: any) => {
  if (!f) return 'No especificada';
  if (f.type === 'one_time') return 'Evento Único';
  if (f.type === 'custom') return f.customDescription || 'Personalizada';
  
  const translates: Record<string, string> = {
    daily: 'Diaria', weekly: 'Semanal', biweekly: 'Quincenal', monthly: 'Mensual'
  };
  const base = translates[f.type] || f.type;
  return f.duration ? `${base} (por ${f.duration} periodos)` : base;
};

const getRoadTypeString = (roadType: string | null | undefined) => {
  if (!roadType) return 'No especificado';
  return roadType === 'toll' ? 'Cuota (Peaje)' : 'Libre';
};

const formatMoney = (value: unknown) => Number(value || 0).toLocaleString('es-MX', {
  style: 'currency',
  currency: 'MXN'
});

const formatLocation = (location: any) => {
  if (!location) return 'Sin ubicación';
  const parts = [location.street, location.neighborhood, location.municipality, location.state].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Sin ubicación';
};

const SummarySection = ({ title, children }: { title: string; children: ReactNode }) => (
  <div>
    <h5 className="text-xs font-bold text-gray-500 uppercase border-b pb-1 mb-2">{title}</h5>
    {children}
  </div>
);

const EmptyText = ({ children }: { children: string }) => (
  <p className="text-gray-400 text-xs">{children}</p>
);

const CatalogItems = ({
  items,
  emptyText
}: {
  items?: Array<{ name?: string; description?: string; quantity?: number; unitPrice?: number }>;
  emptyText: string;
}) => {
  if (!items || items.length === 0) return <EmptyText>{emptyText}</EmptyText>;

  return (
    <div className="text-sm space-y-1">
      {items.map((item, idx) => (
        <p key={`${item.name || item.description || 'item'}-${idx}`} className="text-gray-700 flex justify-between gap-3">
          <span className="truncate">{item.quantity || 0}x {item.name || item.description || 'Concepto'}</span>
          <span className="text-gray-500 whitespace-nowrap">{formatMoney(item.unitPrice)}</span>
        </p>
      ))}
    </div>
  );
};

const ExtraCostItems = ({ items, emptyText = 'Sin cargos extra' }: { items?: Array<{ description?: string; amount?: number }>; emptyText?: string }) => {
  if (!items || items.length === 0) return <EmptyText>{emptyText}</EmptyText>;

  return (
    <ul className="space-y-1 text-sm">
      {items.map((item, idx) => (
        <li key={`${item.description || 'extra'}-${idx}`} className="flex justify-between gap-3 text-orange-700">
          <span className="truncate">{item.description || 'Extra'}</span>
          <span className="font-medium whitespace-nowrap">{formatMoney(item.amount)}</span>
        </li>
      ))}
    </ul>
  );
};

export const ServiceSummaryCard = ({ service, index }: { service: any, index: number }) => {
  const serviceTypeLabel = SERVICE_TYPE_LABELS[service.serviceType as keyof typeof SERVICE_TYPE_LABELS] || 'Servicio';
  const titleLocation = service.location?.street || service.training?.location?.street || service.ecologicalCleaning?.location?.street || serviceTypeLabel;

  return (
    <div className="border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm mb-6">
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
        <h3 className="font-bold text-gray-800">Servicio {index + 1}: {titleLocation}</h3>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">{serviceTypeLabel} · {activityTranslates[service.activity] || service.activity || 'Actividad no especificada'}</p>
          <span className="text-xs font-medium text-blue-700 bg-blue-100/50 px-2.5 py-1 rounded-md border border-blue-200">
            Frecuencia: {getFrequencyString(service.frequency)}
          </span>
        </div>
      </div>
      
      <div className="p-5 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummarySection title="Logística">
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Ciudad:</dt> <dd className="font-medium text-gray-900 text-right truncate pl-2">{service.location?.municipality || '-'}, {service.location?.state || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Origen:</dt> <dd className="font-medium text-gray-900 text-right truncate pl-2">{service.logistics?.origin || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Destino:</dt> <dd className="font-medium text-gray-900 text-right truncate pl-2">{service.logistics?.primaryDestination || '-'}</dd></div>
            <div className="flex justify-between mt-2 pt-2 border-t border-gray-50"><dt className="text-gray-500">Trayecto:</dt> <dd className="font-medium text-gray-900 text-right">{service.logistics?.kilometers || 0} km ({getRoadTypeString(service.logistics?.roadType)})</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Combustible:</dt> <dd className="font-medium text-gray-900 text-right">{service.logistics?.fuelLiters || 0} L · {formatMoney(service.logistics?.fuelPricePerLiter)}/L</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Viáticos:</dt> <dd className="font-medium text-gray-900 text-right">{formatMoney(service.logistics?.viaticos)}</dd></div>
          </dl>
        </SummarySection>

        <SummarySection title="Residuos a Recolectar">
          <ul className="space-y-2 mb-4">
            {(service.wastes || []).length > 0 ? service.wastes.map((waste: any, idx: number) => (
              <li key={idx} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-gray-900">{waste.name || 'Residuo'}</span>
                  <span className="text-xs text-gray-500 block">{waste.type} · {waste.classification || 'Sin clasificación'} · {waste.clave || 'Sin clave'}</span>
                </div>
                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 text-xs">{waste.quantity} {waste.unit}</span>
              </li>
            )) : <EmptyText>Sin residuos</EmptyText>}
          </ul>

          <h5 className="text-xs font-bold text-gray-500 uppercase border-b pb-1 mb-2 mt-4">Operación</h5>
          <div className="text-sm space-y-1">
              {(service.vehicles || []).length > 0 ? (
                service.vehicles.map((v: any, idx: number) => <p key={`v-${idx}`} className="text-gray-700 flex justify-between gap-3"><span className="truncate">{v.quantity}x {v.name || 'Vehículo'}</span> <span className="text-gray-500 whitespace-nowrap">{formatMoney(v.unitPrice)}</span></p>)
              ) : <p className="text-gray-400 text-xs">Sin vehículos</p>}
              
              {(service.crew || []).length > 0 ? (
                service.crew.map((c: any, idx: number) => <p key={`c-${idx}`} className="text-gray-700 flex justify-between gap-3 mt-1"><span className="truncate">{c.quantity}x {crewLabels[c.type] || c.type || 'Personal'}</span> <span className="text-gray-500 whitespace-nowrap">{formatMoney(c.dailySalary)}/d</span></p>)
              ) : <p className="text-gray-400 text-xs mt-1">Sin personal</p>}
          </div>
        </SummarySection>

        <SummarySection title="Insumos y materiales">
          <CatalogItems items={service.supplies} emptyText="Sin insumos adicionales" />
          <div className="mt-3"><CatalogItems items={service.tools} emptyText="Sin herramientas" /></div>
          <div className="mt-3"><CatalogItems items={service.materials} emptyText="Sin materiales" /></div>
          <div className="mt-3"><CatalogItems items={service.equipment} emptyText="Sin equipo" /></div>
          <div className="mt-3"><CatalogItems items={service.specializedEpp} emptyText="Sin EPP especializado" /></div>
        </SummarySection>

        <SummarySection title="Cargos extra">
          <ExtraCostItems items={service.extraCosts} />
        </SummarySection>

        {service.training && (
          <SummarySection title="Capacitación">
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Personal:</dt><dd className="font-medium text-gray-900">{service.training.attendeeCount || 0}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Modalidad:</dt><dd className="font-medium text-gray-900">{service.training.modality === 'in_person' ? 'Presencial' : 'En línea'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Horas:</dt><dd className="font-medium text-gray-900">{service.training.hours || 0} · {formatMoney(service.training.hourlyUnitPrice)}/h</dd></div>
              <div><dt className="text-gray-500">Nivel:</dt><dd className="font-medium text-gray-900">{(service.training.educationLevels || []).map((level: string) => educationLabels[level] || level).join(', ') || '-'}</dd></div>
              <div><dt className="text-gray-500">Objetivo:</dt><dd className="font-medium text-gray-900">{service.training.objective || '-'}</dd></div>
              {service.training.modality === 'in_person' && <div><dt className="text-gray-500">Ubicación:</dt><dd className="font-medium text-gray-900">{formatLocation(service.training.location)}</dd></div>}
            </dl>
            <div className="mt-3"><CatalogItems items={service.training.stationery} emptyText="Sin papelería" /></div>
          </SummarySection>
        )}

        {service.ecologicalCleaning && (
          <SummarySection title="Limpieza ecológica">
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Gasolinera:</dt><dd className="font-medium text-gray-900 text-right">{service.ecologicalCleaning.gasStationName || '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Superficie:</dt><dd className="font-medium text-gray-900">{service.ecologicalCleaning.surfaceM2 || 0} m²</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Técnicos:</dt><dd className="font-medium text-gray-900">{service.ecologicalCleaning.technicianCount || 0}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Horas:</dt><dd className="font-medium text-gray-900">{service.ecologicalCleaning.hours || 0} · {formatMoney(service.ecologicalCleaning.hourlyUnitPrice)}/h</dd></div>
              <div><dt className="text-gray-500">Ubicación:</dt><dd className="font-medium text-gray-900">{formatLocation(service.ecologicalCleaning.location)}</dd></div>
            </dl>
            <div className="mt-3"><ExtraCostItems items={service.ecologicalCleaning.labor} emptyText="Sin mano de obra adicional" /></div>
          </SummarySection>
        )}

        {service.conditioning && (
          <SummarySection title="Acondicionamiento">
            <ExtraCostItems items={service.conditioning.labor} emptyText="Sin mano de obra de acondicionamiento" />
          </SummarySection>
        )}
      </div>
    </div>
  );
};
