import { QuoteFormValues } from "src/shared/schemas/quoteSchema";

interface SummaryStepProps {
  data: QuoteFormValues;
}

export const SummaryStep = ({ data }: SummaryStepProps) => {  const service = data.services[0];

  const getFrequencyString = () => {
    const f = data.frequency;
    if (f.type === 'one_time') return 'Evento Único';
    if (f.type === 'custom') return f.customDescription || 'Personalizada';
    
    const translates: Record<string, string> = {
      daily: 'Diaria', weekly: 'Semanal', biweekly: 'Quincenal', monthly: 'Mensual'
    };
    const base = translates[f.type] || f.type;
    return f.duration ? `${base} (por ${f.duration} periodos)` : base;
  };

  const getRoadTypeString = () => {
    if (!service.logistics.roadType) return 'No especificado';
    return service.logistics.roadType === 'toll' ? 'Cuota (Peaje)' : 'Libre';
  };

  const activityTranslates: Record<string, string> = {
    collection: 'Recolección', transport: 'Transporte', transfer: 'Transferencia', final_disposal: 'Disposición Final'
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h3 className="text-blue-800 font-semibold mb-2">Resumen de la Cotización</h3>
        <p className="text-sm text-blue-600">Revisa que todos los datos sean correctos antes de confirmar el guardado.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
          <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Datos Generales</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Cliente:</dt> <dd className="font-medium text-gray-900 text-right">{data.clientName}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">RFC:</dt> <dd className="font-medium text-gray-900 text-right uppercase">{data.clientRfc}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Vigencia:</dt> <dd className="font-medium text-blue-600 text-right">{data.validityDays} Días</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Frecuencia:</dt> <dd className="font-medium text-gray-900 text-right">{getFrequencyString()}</dd></div>
          </dl>
        </div>

        <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
          <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Logística (Servicio 1)</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Actividad:</dt> <dd className="font-medium text-gray-900 text-right">{activityTranslates[service.activity]}</dd></div>
            <div className="flex justify-between">
                <dt className="text-gray-500">Ubicación:</dt> 
                <dd className="font-medium text-gray-900 text-right">
                    {service.location.municipality}, {service.location.state}
                </dd>
            </div>
            <div className="flex justify-between"><dt className="text-gray-500">Origen:</dt> <dd className="font-medium text-gray-900 text-right">{service.logistics.origin || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Destino:</dt> <dd className="font-medium text-gray-900 text-right">{service.logistics.primaryDestination || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Trayecto:</dt> <dd className="font-medium text-gray-900 text-right">{service.logistics.kilometers} km ({getRoadTypeString()})</dd></div>
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
          <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Residuos a Recolectar</h4>
          <ul className="space-y-3">
            {service.wastes.map((waste, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-gray-900">{waste.name}</span>
                  <p className="text-xs text-gray-500 capitalize">{waste.type}</p>
                </div>
                <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{waste.quantity} {waste.unit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* VEHÍCULOS Y PERSONAL */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
          <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Operación</h4>
          
          <div className="mb-4">
            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Vehículos</h5>
            {service.vehicles.length === 0 ? <p className="text-sm text-gray-400">Ninguno</p> : (
              <ul className="space-y-1 text-sm">
                {service.vehicles.map((v, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span className="text-gray-700">{v.quantity}x {v.name || 'Vehículo'}</span>
                    <span className="text-gray-500">${v.unitPrice}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Personal</h5>
            {service.crew.length === 0 ? <p className="text-sm text-gray-400">Ninguno</p> : (
              <ul className="space-y-1 text-sm">
                {service.crew.map((c, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{c.quantity}x {c.type === 'driver' ? 'Chofer' : 'Técnico'}</span>
                    <span className="text-gray-500">${c.dailySalary}/día</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};