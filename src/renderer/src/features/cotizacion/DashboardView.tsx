import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { CurrentQuoteStatus, QuoteSummary } from '../../../../shared/types/Quote';
import { useDrafts } from './hooks/useDrafts';
import { usePdfWorkflow } from './hooks/usePdfWorkflow';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { DashboardSearchBar } from './components/dashboard/DashboardSearchBar';
import { EmitConfirmationModal } from './components/dashboard/EmitConfirmationModal';
import { DraftsTable } from './components/dashboard/DraftsTable';

export const DashboardView = ({ onEditClick, onQuoteIssued }: { onEditClick: (id: number) => void, onQuoteIssued?: () => void }) => {  
  const { drafts, loading, fetchDrafts } = useDrafts();
  const [quoteToEmit, setQuoteToEmit] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const { 
    isModalOpen, isLoading: isPdfLoading, pdfBase64, openPdfPreview, downloadPdf, closeModal 
  } = usePdfWorkflow(() => {
    fetchDrafts(); 
    if (onQuoteIssued) onQuoteIssued();
  });

  const handleAdvanceStatus = async (id: number, currentStatus: string) => {
    const nextStatusByCurrent: Record<string, CurrentQuoteStatus> = {
      en_proceso: 'terminada',
      draft: 'terminada',
      terminada: 'autorizada'
    };
    const nextStatus = nextStatusByCurrent[currentStatus];
    if (!nextStatus) return;

    const response = await window.api.updateQuoteStatus(id, nextStatus);
    if (response.success) {
      toast.success('Estado actualizado correctamente');
      fetchDrafts();
      return;
    }

    toast.error(response.error || 'No se pudo actualizar el estado');
  };

  const filteredDrafts = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();
    return drafts.filter((draft: QuoteSummary) => {
      const matchesMonth = !selectedMonth || new Date(Number(draft.createdAt)).toISOString().slice(0, 7) === selectedMonth;
      if (!matchesMonth) return false;
      if (!searchTerm.trim()) return true;

      const matchFolio = draft.folio?.toLowerCase().includes(lowerTerm) || String(draft.id).includes(lowerTerm);
      const matchLocation = draft.location?.toLowerCase().includes(lowerTerm);
      const matchWastes = draft.wastesSummary?.toLowerCase().includes(lowerTerm);
      return matchFolio || matchLocation || matchWastes;
    });
  }, [drafts, searchTerm, selectedMonth]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Cotizaciones en seguimiento</h1>
          <p className="text-sm text-gray-500">Administra cotizaciones en proceso, terminadas y autorizadas</p>
        </div>
        <DashboardSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
      </div>

      <DraftsTable 
        drafts={filteredDrafts} 
        loading={loading} 
        searchTerm={searchTerm} 
        isPdfLoading={isPdfLoading}
        onEditClick={onEditClick}
        onEmitRequest={setQuoteToEmit}
        onAdvanceStatus={handleAdvanceStatus}
      />

      <EmitConfirmationModal 
        isOpen={quoteToEmit !== null}
        onCancel={() => setQuoteToEmit(null)}
        onConfirm={() => {
          if (quoteToEmit !== null) { 
            openPdfPreview(quoteToEmit, false, true);
            setQuoteToEmit(null); 
          }
        }}
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
