import { Pencil, FileText } from 'lucide-react';
import { QuoteSummary } from '../../../../shared/types/Quote';
import { useDrafts } from './hooks/useDrafts';
import { usePdfWorkflow } from './hooks/usePdfWorkflow';
import { PdfPreviewModal } from './components/PdfPreviewModal';

const wasteTranslations: Record<string, string> = {
  domestic: 'Doméstico',
  organic: 'Orgánico',
  recyclable: 'Reciclable',
  hazardous: 'Peligroso',
  bulky: 'Voluminoso'
};

const statusTranslations: Record<string, string> = {
  draft: 'Borrador',
  issued: 'Emitida',
  cancelled: 'Cancelada'
};

export const DashboardView = ({ onEditClick }: { onEditClick: (id: number) => void }) => {  
  const { drafts, loading, fetchDrafts } = useDrafts();

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de residuo</th>
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
                
                const wasteToShow = wasteTranslations[draft.waste] || draft.waste || 'No especificado';
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
                      <div className="text-sm">
                        <div className="text-gray-900 capitalize">{wasteToShow}</div>
                        <div className="text-gray-500">{draft.volume}</div>
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
                          onClick={() => openPdfPreview(Number(draft.id), true)}
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