import { useState } from 'react';
import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";
import toast from 'react-hot-toast';
import { FileText, List } from 'lucide-react';
import { PdfPreviewModal } from './PdfPreviewModal';
import { GeneralDataSummary } from './GeneralDataSummary';
import { ServiceSummaryCard } from './ServiceSummaryCard';

interface SummaryStepProps {
  data: QuoteFormValues;
}

export const SummaryStep = ({ data }: SummaryStepProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [currentFolio, setCurrentFolio] = useState<string>('');

  const calculateTotals = () => {
    let subtotal = 0;
    
    data.services.forEach(service => {
      // Tratamiento
      service.wastes?.forEach(w => subtotal += (Number(w.quantity) * Number(w.pricePerUnit || 0)));
      
      // Transporte
      service.vehicles?.forEach(v => subtotal += (Number(v.quantity) * Number(v.unitPrice || 0)));
      if (service.logistics) {
        const fuel = Number(service.logistics.fuelLiters || 0) * Number(service.logistics.fuelPricePerLiter || 0);
        const tolls = Number(service.logistics.totalTollCost || 0);
        subtotal += (fuel + tolls);
      }

      // Acondicionamiento
      service.crew?.forEach(c => subtotal += (Number(c.quantity) * Number(c.dailySalary || 0)));
      service.equipment?.forEach(e => subtotal += (Number(e.quantity) * Number(e.unitPrice || 0)));
      service.extraCosts?.forEach(e => subtotal += Number(e.amount || 0));

      // Insumos
      service.supplies?.forEach(s => subtotal += (Number(s.quantity) * Number(s.unitPrice || 0)));
      service.materials?.forEach(m => subtotal += (Number(m.quantity) * Number(m.unitPrice || 0)));
    });

    return { 
      subtotal, 
      total: subtotal * 1.16 
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

      <GeneralDataSummary data={data} />

      {data.services.map((service, index) => (
        <ServiceSummaryCard key={service.id || index} service={service} index={index} />
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