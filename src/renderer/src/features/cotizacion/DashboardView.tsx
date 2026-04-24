import { Pencil, FileText, AlertTriangle, Search, X } from 'lucide-react';
import { QuoteSummary } from '../../../../shared/types/Quote';
import { useDrafts } from './hooks/useDrafts';
import { usePdfWorkflow } from './hooks/usePdfWorkflow';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { useState, useMemo } from 'react';

const statusTranslations: Record<string, string> = {
  draft: 'Borrador',
  issued: 'Emitida',
  cancelled: 'Cancelada'
};

export const DashboardView = ({ onEditClick }: { onEditClick: (id: number) => void }) => {
  const { drafts, loading, fetchDrafts } = useDrafts();
  const [quoteToEmit, setQuoteToEmit] = useState<number | null>(null);

  // --- Lógica de Búsqueda Manual ---
  const [tempSearch, setTempSearch] = useState('');     // Texto en el input
  const [appliedFilter, setAppliedFilter] = useState(''); // Filtro activo tras clic/Enter

  // Memorizamos el filtrado para que solo se ejecute cuando cambie appliedFilter o los drafts
  const filteredDrafts = useMemo(() => {
    // Si el filtro está vacío, mostramos la lista completa
    if (!appliedFilter.trim()) return drafts;

    const search = appliedFilter.toLowerCase();
    return drafts.filter((draft) => {
      return (
        (draft.folio?.toLowerCase() || '').includes(search) ||
        (draft.location?.toLowerCase() || '').includes(search) ||
        (draft.wastesSummary?.toLowerCase() || '').includes(search) ||
        (`#00${draft.id}`).includes(search)
      );
    });
  }, [drafts, appliedFilter]);

  const handleSearch = () => {
    setAppliedFilter(tempSearch);
  };

  const handleClear = () => {
    setTempSearch('');
    setAppliedFilter('');
  };
  // ---------------------------------

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
    setQuoteToEmit(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Encabezado y Barra de Búsqueda */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Borradores recientes
          </h1>
          <p className="text-sm text-gray-500">
            Administra tus borradores editables del sistema SIMAR
          </p>
        </div>

        {/* Buscador con disparador manual */}
        <div className="relative w-full md:w-96 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por folio o dirección..."
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="block w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm shadow-sm"
            />
            {tempSearch && (
              <button
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center min-w-[44px]"
            title="Presiona para buscar"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>



      {/* Contenedor de la Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Residuos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Cargando borradores...</td></tr>
              )}

              {/* CASO: La base de datos no tiene registros todavía */}
              {!loading && drafts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-10" />
                    <p className="text-sm font-medium">No hay borradores en el sistema.</p>
                    <p className="text-xs mt-1">Las cotizaciones que guardes aparecerán aquí.</p>
                  </td>
                </tr>
              )}

              {/* CASO: Hay registros pero la búsqueda filtró todo */}
              {!loading && drafts.length > 0 && filteredDrafts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-10" />
                    <p className="text-sm">No se encontraron coincidencias para <span className="font-bold text-gray-900">"{appliedFilter}"</span></p>
                    <button
                      onClick={handleClear}
                      className="text-blue-600 text-xs mt-3 font-semibold hover:underline"
                    >
                      Mostrar todos los borradores
                    </button>
                  </td>
                </tr>
              )}

              {/* Renderizado de la lista (filtrada o completa) */}
              {!loading && filteredDrafts.map((draft: QuoteSummary) => {
                const dateToShow = draft.createdAt ? formatDate(Number(draft.createdAt)) : '---';
                const statusToShow = statusTranslations[draft.status] || draft.status;

                return (
                  <tr key={draft.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{draft.folio || `#00${draft.id}`}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 leading-tight block max-w-xs truncate">
                        {draft.location || 'Sin dirección registrada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 italic">
                      {draft.wastesSummary || 'No especificado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dateToShow}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-tighter">
                        {statusToShow}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditClick(Number(draft.id))}
                          className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-all"
                          title="Continuar editando"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEmitRequest(Number(draft.id))}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all"
                          title="Emitir documento oficial"
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

      {/* --- Modal de Confirmación de Emisión --- */}
      {quoteToEmit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-md w-full mx-4 border border-gray-100 animate-in zoom-in-95">
            <div className="flex items-start gap-4 mb-5">
              <div className="bg-blue-50 p-3 rounded-full text-blue-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Emitir Cotización?</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Esta acción asignará un folio oficial y <strong>bloqueará futuras ediciones</strong> en este borrador. ¿Deseas continuar?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setQuoteToEmit(null)}
                className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
              >
                Todavía no
              </button>
              <button
                onClick={() => {
                  openPdfPreview(quoteToEmit, true);
                  setQuoteToEmit(null);
                }}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
              >
                <FileText className="w-4 h-4" />
                Sí, Emitir PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal de Previsualización del PDF --- */}
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
