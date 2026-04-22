import { FileText, CheckCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { QuoteDraft, QuoteSummary } from '../../../../shared/types/Quote';
import { useIssuedQuotes } from './hooks/useIssuedQuotes';
import { usePdfWorkflow } from './hooks/usePdfWorkflow';
import { PdfPreviewModal } from './components/PdfPreviewModal';

export const IssuedQuotesDashboardView = ({ onCloneRedirect }: { onCloneRedirect?: (newId: number) => void }) => {  
  const { issuedQuotes, loading, fetchIssuedQuotes } = useIssuedQuotes();

  const { 
    isModalOpen, 
    isLoading: isPdfLoading, 
    pdfBase64, 
    openPdfPreview, 
    downloadPdf, 
    closeModal 
  } = usePdfWorkflow(() => {
    fetchIssuedQuotes(); 
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const handleCloneAndReplace = async (originalId: number | string) => {
    const loadingId = toast.loading('Generando clon editable...');
    try {
      const originalQuote = await window.api.getQuoteById(Number(originalId));
      
      if (!originalQuote) throw new Error("No se encontraron los datos originales");

      const clonedPayload = {
        ...originalQuote,
        id: undefined,         
        folio: undefined,      
        status: 'draft' as const,
        createdAt: Date.now(), 
        replacesQuoteId: originalQuote.id 
      } as QuoteDraft; 

      const response = await window.api.saveDraft(clonedPayload);
      
      if (response.success) {
        toast.success('Borrador de reemplazo creado', { id: loadingId });
        
        const newDraftId = typeof response.data === 'object' ? response.data?.id : response.data;

        if (onCloneRedirect && newDraftId) {
           onCloneRedirect(Number(newDraftId));
        }
      } else {
        toast.error('Error al clonar', { id: loadingId });
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado al clonar', { id: loadingId });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
          Cotizaciones Emitidas <CheckCircle className="w-6 h-6 text-green-500" />
        </h1>
        <p className="text-sm text-gray-500">
          Historial de documentos oficiales. Estos registros son inmutables.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio Oficial</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Residuos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Emisión</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">

              {loading && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Cargando historial...</td></tr>
              )}
              
              {!loading && issuedQuotes.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aún no has emitido ninguna cotización.</td></tr>
              )}

              {issuedQuotes.map((quote: QuoteSummary) => {
                const dateToShow = quote.createdAt ? formatDate(Number(quote.createdAt)) : 'Fecha desconocida';
                const locationToShow = quote.location || 'Sin dirección';
                const wastesToShow = quote.wastesSummary || 'No especificado';

                return (
                  <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{quote.folio || `#00${quote.id}`}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{locationToShow}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {wastesToShow}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{dateToShow}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botón de Inmutabilidad (Clonar) */}
                        <button 
                          onClick={() => handleCloneAndReplace(quote.id)} 
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors font-medium text-sm gap-2" 
                          title="Crear un borrador basado en esta cotización para reemplazarla"
                        >
                          <Copy className="w-4 h-4" />
                          Modificar
                        </button>
                        
                        {/* Botón de PDF original */}
                        <button 
                          onClick={() => openPdfPreview(Number(quote.id), false)} 
                          disabled={isPdfLoading}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 font-medium text-sm gap-2" 
                          title="Ver Documento PDF"
                        >
                          <FileText className="w-4 h-4" />
                          Ver PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PdfPreviewModal 
        isOpen={isModalOpen}
        isLoading={isPdfLoading}
        pdfBase64={pdfBase64}
        onClose={closeModal}
        onDownload={downloadPdf}
      />

    </div>
  );
};