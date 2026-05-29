import { QuoteFormValues } from "../../../../../shared/schemas/quoteSchema";

interface GeneralDataSummaryProps {
  data: QuoteFormValues;
}

export const GeneralDataSummary = ({ data }: GeneralDataSummaryProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm mb-6">
      <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Datos Generales del Contrato</h4>
      <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Cliente:</dt> 
          <dd className="font-medium text-gray-900 text-right">{data.clientName || 'Sin especificar'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">RFC:</dt> 
          <dd className="font-medium text-gray-900 text-right uppercase">{data.clientRfc}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Vigencia:</dt> 
          <dd className="font-medium text-blue-600 text-right">{data.validityDays} Días</dd>
        </div>
      </dl>
    </div>
  );
};