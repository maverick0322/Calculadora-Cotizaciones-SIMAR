import { useState } from 'react';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";
import toast from 'react-hot-toast';
import { FileText, List } from 'lucide-react';
import { PdfPreviewModal } from './PdfPreviewModal';

interface SummaryStepProps {
  data: QuoteFormValues;
}

export const SummaryStep = ({ data }: SummaryStepProps) => {
  // --- Estados para el Modal de PDF ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [currentFolio, setCurrentFolio] = useState<string>('');

  // 👇 AHORA RECIBE LA FRECUENCIA DEL SERVICIO COMO PARÁMETRO
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

  const activityTranslates: Record<string, string> = {
    collection: 'Recolección', transport: 'Transporte', transfer: 'Transferencia', final_disposal: 'Disposición Final'
  };

  const calculateTotals = () => {
    let calcSubtotal = 0;
    
    data.services.forEach(service => {
      service.wastes.forEach(w => calcSubtotal += (Number(w.quantity) * Number(w.pricePerUnit || 0)));
      service.vehicles.forEach(v => calcSubtotal += (Number(v.quantity) * Number(v.unitPrice || 0)));
      service.crew.forEach(c => calcSubtotal += (Number(c.quantity) * Number(c.dailySalary || 0)));
      service.supplies.forEach(s => calcSubtotal += (Number(s.quantity) * Number(s.unitPrice || 0)));
      service.extraCosts.forEach(e => calcSubtotal += Number(e.amount || 0));
      
      if (service.logistics) {
        const fuel = Number(service.logistics.fuelLiters || 0) * Number(service.logistics.fuelPricePerLiter || 0);
        const tolls = Number(service.logistics.totalTollCost || 0);
        const viaticos = Number(service.logistics.viaticos || 0);
        calcSubtotal += (fuel + tolls + viaticos);
      }
    });

    return { 
      subtotal: calcSubtotal, 
      total: calcSubtotal * 1.16 
    };
  };

  const handleGeneratePdf = async (detailed: boolean) => {
    const toastId = toast.loading('Generando documento PDF...');
    setIsModalOpen(true); 
    setPdfBase64(null);

    try {
      const { subtotal, total } = calculateTotals();
      const payloadConTotales = { ...data, subtotal, total };

      const response = await window.api.generatePdfPreview({ quoteData: payloadConTotales, isDetailed: detailed });
      
      if (response.success && response.pdfBase64) {
        setPdfBase64(response.pdfBase64); 
        setCurrentFolio(detailed ? 'Cotizacion_Desglosada' : 'Cotizacion_General');
        toast.success('Vista previa generada', { id: toastId });
      } else {
        setIsModalOpen(false);
        toast.error(`Error: ${response.error}`, { id: toastId });
      }
    } catch (error) {
      setIsModalOpen(false);
      toast.error('Error de conexión al generar el PDF', { id: toastId });
    }
  };

  const downloadPdf = async () => {
    if (!pdfBase64) return;
    const loadingToast = toast.loading('Guardando documento...');
    try {
      const result = await window.api.savePdf(pdfBase64, currentFolio);
      if (result.success) {
        toast.success('¡PDF guardado correctamente!', { id: loadingToast });
      } else if (!result.error?.includes('cancelada')) {
        toast.error(result.error || 'No se pudo guardar el archivo', { id: loadingToast });
      } else {
        toast.dismiss(loadingToast);
      }
    } catch (error) {
      toast.error('Error al guardar', { id: loadingToast });
    }
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
        {/* 👇 Modificamos las columnas a 3 para quitar el hueco que dejó la frecuencia global */}
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">Cliente:</dt> <dd className="font-medium text-gray-900 text-right">{data.clientName || 'Sin especificar'}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">RFC:</dt> <dd className="font-medium text-gray-900 text-right uppercase">{data.clientRfc}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Vigencia:</dt> <dd className="font-medium text-blue-600 text-right">{data.validityDays} Días</dd></div>
        </dl>
      </div>

      {data.services.map((service, index) => (
        <div key={service.id || index} className="border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Servicio {index + 1}: {service.location.street || 'Sin dirección'}</h3>
            {/* 👇 AHORA LA FRECUENCIA SE MUESTRA A NIVEL DE SERVICIO */}
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500 capitalize">{activityTranslates[service.activity]}</p>
              <span className="text-xs font-medium text-blue-700 bg-blue-100/50 px-2.5 py-1 rounded-md border border-blue-200">
                Frecuencia: {getFrequencyString(service.frequency)}
              </span>
            </div>
          </div>
          
          <div className="p-5 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div>
              <h5 className="text-xs font-bold text-gray-500 uppercase border-b pb-1 mb-2">Logística</h5>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Ciudad:</dt> <dd className="font-medium text-gray-900 text-right truncate pl-2">{service.location.municipality}, {service.location.state}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Origen:</dt> <dd className="font-medium text-gray-900 text-right truncate pl-2">{service.logistics.origin || '-'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Destino:</dt> <dd className="font-medium text-gray-900 text-right truncate pl-2">{service.logistics.primaryDestination || '-'}</dd></div>
                <div className="flex justify-between mt-2 pt-2 border-t border-gray-50"><dt className="text-gray-500">Trayecto:</dt> <dd className="font-medium text-gray-900 text-right">{service.logistics.kilometers} km ({getRoadTypeString(service.logistics.roadType)})</dd></div>
              </dl>
            </div>

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

      <div className="flex flex-col items-center gap-4 p-6 bg-blue-50 rounded-xl border border-blue-200 mt-6 shadow-inner">
        <h3 className="font-semibold text-blue-900">Vista Previa del Documento</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => handleGeneratePdf(false)}
            className="px-6 py-2 bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-100 transition-all shadow-sm flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            PDF General
          </button>
          
          <button
            type="button"
            onClick={() => handleGeneratePdf(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            PDF Desglosado
          </button>
        </div>
        <p className="text-xs text-blue-600 italic">
          * El PDF Desglosado incluye una tabla de precios unitarios por cada residuo e insumo.
        </p>
      </div>

      {/* Renderizamos el Modal */}
      <PdfPreviewModal 
        isOpen={isModalOpen}
        isLoading={pdfBase64 === null}
        pdfBase64={pdfBase64}
        onClose={() => setIsModalOpen(false)}
        onDownload={downloadPdf}
      />

    </div>
  );
};