import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { QuoteDraft, QuoteSummary } from '../../../../shared/types/Quote';
import { useIssuedQuotes } from './hooks/useIssuedQuotes';
import { usePdfWorkflow } from './hooks/usePdfWorkflow';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { useState, useMemo } from 'react';

// IMPORTAMOS LOS COMPONENTES MODULARES
import { DashboardSearchBar } from './components/dashboard/DashboardSearchBar';
import { IssuedQuotesTable } from './components/dashboard/IssuedQuotesTable';

export const IssuedQuotesDashboardView = ({ onCloneRedirect }: { onCloneRedirect?: (newId: number) => void }) => {  
  const { issuedQuotes, loading, fetchIssuedQuotes } = useIssuedQuotes();
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    isModalOpen, isLoading: isPdfLoading, pdfBase64, openPdfPreview, downloadPdf, closeModal 
  } = usePdfWorkflow(() => fetchIssuedQuotes());

  const handleCloneAndReplace = async (originalId: number | string) => {
    const loadingId = toast.loading('Generando clon editable...');
    try {
      const originalQuote = await window.api.getQuoteById(Number(originalId));
      if (!originalQuote) throw new Error("No se encontraron los datos originales");

      const clonedPayload = {
        ...originalQuote,
        id: undefined, folio: undefined, status: 'draft' as const, createdAt: Date.now(),
        contactName: originalQuote.contactName || '', contactPhone: originalQuote.contactPhone || '',
        contactEmail: originalQuote.contactEmail || '', replacesQuoteId: originalQuote.id,
        services: originalQuote.services.map(s => ({
          ...s,
          wastes: s.wastes.map(w => ({ ...w, pricePerUnit: w.pricePerUnit || 0 })),
          logistics: { ...s.logistics, roadType: s.logistics.roadType || undefined }
        }))
      } as QuoteDraft; 

      const response = await window.api.saveDraft(clonedPayload);
      
      if (response.success) {
        toast.success('Borrador de reemplazo creado', { id: loadingId });
        const newDraftId = response.id || response.data?.id || response.data;
        if (onCloneRedirect && newDraftId) onCloneRedirect(Number(newDraftId));
      } else {
        console.error("Error validación backend:", response.details);
        toast.error('Error de validación al clonar', { id: loadingId });
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado al clonar', { id: loadingId });
    }
  };

  const filteredQuotes = useMemo(() => {
    if (!searchTerm.trim()) return issuedQuotes;
    const lowerTerm = searchTerm.toLowerCase();
    return issuedQuotes.filter((quote: QuoteSummary) => {
      const matchFolio = quote.folio?.toLowerCase().includes(lowerTerm) || String(quote.id).includes(lowerTerm);
      const matchLocation = quote.location?.toLowerCase().includes(lowerTerm);
      const matchWastes = quote.wastesSummary?.toLowerCase().includes(lowerTerm);
      return matchFolio || matchLocation || matchWastes;
    });
  }, [issuedQuotes, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
            Cotizaciones Emitidas <CheckCircle className="w-6 h-6 text-green-500" />
          </h1>
          <p className="text-sm text-gray-500">
            Historial de documentos oficiales. Estos registros son inmutables.
          </p>
        </div>

        {/* 👇 REUTILIZAMOS EL COMPONENTE DE BÚSQUEDA */}
        <DashboardSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      <IssuedQuotesTable 
        quotes={filteredQuotes}
        loading={loading}
        searchTerm={searchTerm}
        isPdfLoading={isPdfLoading}
        onClone={handleCloneAndReplace}
        onPreview={openPdfPreview}
      />

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