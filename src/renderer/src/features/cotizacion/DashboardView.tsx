import { Pencil, FileText, AlertTriangle } from 'lucide-react';
import { QuoteSummary } from '../../../../shared/types/Quote';
import { useDrafts } from './hooks/useDrafts';
import { usePdfWorkflow } from './hooks/usePdfWorkflow';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { useState } from 'react';

const statusTranslations: Record<string, string> = {
  draft: 'Borrador',
  issued: 'Emitida',
  cancelled: 'Cancelada'
};

export const DashboardView = ({ onEditClick }: { onEditClick: (id: number) => void }) => {  
  const { drafts, loading, fetchDrafts } = useDrafts();
  const [quoteToEmit, setQuoteToEmit] = useState<number | null>(null);

  const { 
    isModalOpen, 
    isLoading: isPdfLoading, 
    pdfBase64, 
    openPdfPreview, 
    downloadPdf, 
    closeModal 
  } = usePdfWorkflow(() => {
    fetchDrafts(); 
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const handleEmitRequest = (id: number) => {
  setQuoteToEmit(id); // Solo abre el modal, no dispara la acción aún
};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Borradores recientes
        </h1>
        <p className="text-sm text-gray-500">
          Administra tus borradores editables
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Residuos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de creación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">

              {loading && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Cargando borradores...</td></tr>
              )}
              {!loading && drafts.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No se encontraron borradores. ¡Crea uno nuevo!</td></tr>
              )}

              {drafts.map((draft: QuoteSummary) => {
                const dateToShow = draft.createdAt ? formatDate(Number(draft.createdAt)) : 'Fecha desconocida';
                const locationToShow = draft.location || 'Sin dirección';
                
                const wastesToShow = draft.wastesSummary || 'No especificado';
                const statusToShow = statusTranslations[draft.status] || draft.status || 'Borrador';

                return (
                  <tr key={draft.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{draft.folio || `#00${draft.id}`}</span>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 capitalize">
                        {statusToShow}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onEditClick(Number(draft.id))} 
                          disabled={isPdfLoading}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50" 
                          title="Editar Borrador"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => handleEmitRequest(Number(draft.id))}
                          disabled={isPdfLoading}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50" 
                          title="Emitir y Generar PDF Oficial"
                        >
                          <FileText className="w-4 h-4" />
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

      {quoteToEmit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-5">
              <div className="bg-blue-50 p-3 rounded-full text-blue-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">¿Emitir Cotización Oficial?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Al emitir este documento, se generará el PDF final, se le asignará un folio oficial y <strong>el borrador quedará bloqueado</strong>.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setQuoteToEmit(null)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  openPdfPreview(quoteToEmit, true);
                  setQuoteToEmit(null); // Cerramos el modal
                }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Sí, Emitir PDF
              </button>
            </div>
          </div>
        </div>
      )}

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