import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";

interface SummaryStepProps {
  data: QuoteFormValues;
}

export const SummaryStep = ({ data }: SummaryStepProps) => {
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

  const getRoadTypeString = (roadType: string | null | undefined) => {
    if (!roadType) return 'No especificado';
    return roadType === 'toll' ? 'Cuota (Peaje)' : 'Libre';
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

      {/* SECCIÓN GLOBAL */}
      <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
        <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Datos Generales del Contrato</h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">Cliente:</dt> <dd className="font-medium text-gray-900 text-right">{data.clientName}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">RFC:</dt> <dd className="font-medium text-gray-900 text-right uppercase">{data.clientRfc}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Vigencia:</dt> <dd className="font-medium text-blue-600 text-right">{data.validityDays} Días</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Frecuencia Global:</dt> <dd className="font-medium text-gray-900 text-right">{getFrequencyString()}</dd></div>
        </dl>
      </div>

      {/* ITERACIÓN MULTISERVICIO */}
      {data.services.map((service, index) => (
        <div key={service.id || index} className="border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Servicio {index + 1}: {service.location.street || 'Sin dirección'}</h3>
            <p className="text-xs text-gray-500 capitalize">{activityTranslates[service.activity]}</p>
          </div>
          
          <div className="p-5 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Col 1: Logística */}
            <div>
              <h5 className="text-xs font-bold text-gray-500 uppercase border-b pb-1 mb-2">Logística</h5>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Ciudad:</dt> <dd className="font-medium text-gray-900 text-right truncate pl-2">{service.location.municipality}, {service.location.state}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Origen:</dt> <dd className="font-medium text-gray-900 text-right truncate pl-2">{service.logistics.origin || '-'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Destino:</dt> <dd className="font-medium text-gray-900 text-right truncate pl-2">{service.logistics.primaryDestination || '-'}</dd></div>
                <div className="flex justify-between mt-2 pt-2 border-t border-gray-50"><dt className="text-gray-500">Trayecto:</dt> <dd className="font-medium text-gray-900 text-right">{service.logistics.kilometers} km ({getRoadTypeString(service.logistics.roadType)})</dd></div>
              </dl>
            </div>

            {/* Col 2: Residuos y Operación */}
            <div>
              <h5 className="text-xs font-bold text-gray-500 uppercase border-b pb-1 mb-2">Residuos a Recolectar</h5>
              <ul className="space-y-2 mb-4">
                {service.wastes.map((waste, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium text-gray-900">{waste.name || 'Residuo'}</span>
                      <span className="text-xs text-gray-500 block capitalize">{waste.type}</span>
                    </div>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 text-xs">{waste.quantity} {waste.unit}</span>
                  </li>
                ))}
              </ul>

              <h5 className="text-xs font-bold text-gray-500 uppercase border-b pb-1 mb-2 mt-4">Operación</h5>
              <div className="text-sm space-y-1">
                 {service.vehicles.length > 0 ? (
                   service.vehicles.map((v, idx) => <p key={`v-${idx}`} className="text-gray-700 flex justify-between"><span>🚗 {v.quantity}x {v.name || 'Vehículo'}</span> <span className="text-gray-400">${v.unitPrice}</span></p>)
                 ) : <p className="text-gray-400 text-xs">Sin vehículos</p>}
                 
                 {service.crew.length > 0 ? (
                   service.crew.map((c, idx) => <p key={`c-${idx}`} className="text-gray-700 flex justify-between mt-1"><span>👷 {c.quantity}x {c.type === 'driver' ? 'Chofer' : 'Técnico'}</span> <span className="text-gray-400">${c.dailySalary}/d</span></p>)
                 ) : <p className="text-gray-400 text-xs mt-1">Sin personal</p>}
              </div>
            </div>

            {/* Col 3: Insumos y Costos */}
            <div>
              <h5 className="text-xs font-bold text-gray-500 uppercase border-b pb-1 mb-2">Insumos / Extras</h5>
              <div className="text-sm space-y-1">
                 {service.supplies.length > 0 ? (
                   service.supplies.map((s, idx) => <p key={`s-${idx}`} className="text-gray-700 flex justify-between"><span>📦 {s.quantity}x {s.name || 'Insumo'}</span> <span className="text-gray-400">${s.unitPrice}</span></p>)
                 ) : <p className="text-gray-400 text-xs">Sin insumos adicionales</p>}
              </div>

              {service.extraCosts.length > 0 && (
                <div className="mt-3">
                  <h6 className="text-xs font-bold text-gray-400 uppercase mb-1">Cargos Extra</h6>
                  <ul className="space-y-1 text-sm">
                    {service.extraCosts.map((e, idx) => (
                      <li key={`e-${idx}`} className="flex justify-between text-orange-700">
                        <span className="truncate pr-2">{e.description || 'Extra'}</span>
                        <span className="font-medium">${e.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};