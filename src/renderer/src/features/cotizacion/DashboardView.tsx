import { useState, useMemo } from 'react';
import { QuoteSummary } from '../../../../shared/types/Quote';
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

  const { 
    isModalOpen, isLoading: isPdfLoading, pdfBase64, openPdfPreview, downloadPdf, closeModal 
  } = usePdfWorkflow(() => {
    fetchDrafts(); 
    if (onQuoteIssued) onQuoteIssued();
  });

  const filteredDrafts = useMemo(() => {
    if (!searchTerm.trim()) return drafts;
    const lowerTerm = searchTerm.toLowerCase();
    return drafts.filter((draft: QuoteSummary) => {
      const matchFolio = draft.folio?.toLowerCase().includes(lowerTerm) || String(draft.id).includes(lowerTerm);
      const matchLocation = draft.location?.toLowerCase().includes(lowerTerm);
      const matchWastes = draft.wastesSummary?.toLowerCase().includes(lowerTerm);
      return matchFolio || matchLocation || matchWastes;
    });
  }, [drafts, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Borradores recientes</h1>
          <p className="text-sm text-gray-500">Administra tus borradores editables</p>
        </div>
        <DashboardSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      <DraftsTable 
        drafts={filteredDrafts} 
        loading={loading} 
        searchTerm={searchTerm} 
        isPdfLoading={isPdfLoading}
        onEditClick={onEditClick}
        onEmitRequest={setQuoteToEmit}
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