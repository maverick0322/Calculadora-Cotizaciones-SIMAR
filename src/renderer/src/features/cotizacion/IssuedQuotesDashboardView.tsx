import { FileText, CheckCircle, Copy, List, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { QuoteDraft, QuoteSummary } from '../../../../shared/types/Quote';
import { useIssuedQuotes } from './hooks/useIssuedQuotes';
import { usePdfWorkflow } from './hooks/usePdfWorkflow';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { useState, useMemo } from 'react';

export const IssuedQuotesDashboardView = ({ onCloneRedirect }: { onCloneRedirect?: (newId: number) => void }) => {  
  const { issuedQuotes, loading, fetchIssuedQuotes } = useIssuedQuotes();
  
  // 👇 Nuevo estado para el buscador
  const [searchTerm, setSearchTerm] = useState('');

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
        contactName: originalQuote.contactName || '',
        contactPhone: originalQuote.contactPhone || '',
        contactEmail: originalQuote.contactEmail || '',
        replacesQuoteId: originalQuote.id,
        services: originalQuote.services.map(s => ({
          ...s,
          wastes: s.wastes.map(w => ({
            ...w,
            pricePerUnit: w.pricePerUnit || 0
          })),
          logistics: {
            ...s.logistics,
            roadType: s.logistics.roadType || undefined
          }
        }))
      } as QuoteDraft; 

      const response = await window.api.saveDraft(clonedPayload);
      
      if (response.success) {
        toast.success('Borrador de reemplazo creado', { id: loadingId });
        
        const newDraftId = response.id || response.data?.id || response.data;

        if (onCloneRedirect && newDraftId) {
           onCloneRedirect(Number(newDraftId));
        }
      } else {
        console.error("Error validación backend:", response.details);
        toast.error('Error de validación al clonar', { id: loadingId });
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado al clonar', { id: loadingId });
    }
  };

  // 👇 Lógica de filtrado en tiempo real
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

        {/* 👇 Barra de búsqueda UI */}
        <div className="relative max-w-md w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
            placeholder="Buscar por folio, cliente o residuo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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

              {/* 👇 Mensaje de estado vacío para la búsqueda */}
              {!loading && issuedQuotes.length > 0 && filteredQuotes.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay resultados para "{searchTerm}".</td></tr>
              )}

              {/* 👇 Mapeamos sobre filteredQuotes en lugar de issuedQuotes */}
              {filteredQuotes.map((quote: QuoteSummary) => {
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
                        
                        {/* Botón PDF General */}
                        <button 
                          onClick={() => openPdfPreview(Number(quote.id), false)} 
                          disabled={isPdfLoading}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium text-sm gap-2" 
                          title="Ver PDF Estándar"
                        >
                          <FileText className="w-4 h-4" />
                          Gral
                        </button>

                        {/* Botón PDF Desglosado */}
                        <button 
                          onClick={() => openPdfPreview(Number(quote.id), true)} 
                          disabled={isPdfLoading}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 font-medium text-sm gap-2" 
                          title="Ver PDF con Precios Unitarios"
                        >
                          <List className="w-4 h-4 text-blue-600" />
                          Detalle
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