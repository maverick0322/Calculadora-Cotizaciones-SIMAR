import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";
import { GeneralDataSummary } from './GeneralDataSummary';
import { ServiceSummaryCard } from './ServiceSummaryCard';

interface SummaryStepProps {
  data: QuoteFormValues;
}

export const SummaryStep = ({ data }: SummaryStepProps) => {
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

      <div className="flex flex-col items-center gap-2 p-6 bg-blue-50 rounded-xl border border-blue-200 mt-6 shadow-inner">
        <h3 className="font-semibold text-blue-900">Documento para cliente</h3>
        <p className="text-sm text-blue-700 text-center">
          El PDF se generará únicamente cuando la cotización avance a estado Emitida.
        </p>
      </div>
    </div>
  );
};
