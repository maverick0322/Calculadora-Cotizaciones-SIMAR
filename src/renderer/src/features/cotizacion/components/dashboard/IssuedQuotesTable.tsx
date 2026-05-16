import { Copy, FileText, List } from 'lucide-react';
import { QuoteSummary } from '../../../../../../shared/types/Quote';

interface IssuedQuotesTableProps {
  quotes: QuoteSummary[];
  loading: boolean;
  searchTerm: string;
  isPdfLoading: boolean;
  onClone: (id: number) => void;
  onPreview: (id: number, detailed: boolean) => void;  
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

export const IssuedQuotesTable = ({ 
  quotes, loading, searchTerm, isPdfLoading, onClone, onPreview 
}: IssuedQuotesTableProps) => {
  return (
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
            
            {!loading && quotes.length === 0 && !searchTerm && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aún no has emitido ninguna cotización.</td></tr>
            )}

            {!loading && quotes.length > 0 && quotes.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay resultados para "{searchTerm}".</td></tr>
            )}

            {quotes.map((quote) => {
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
                    <div className="text-sm text-gray-900">{wastesToShow}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{dateToShow}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onClone(Number(quote.id))} 
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors font-medium text-sm gap-2" 
                        title="Crear un borrador basado en esta cotización para reemplazarla"
                      >
                        <Copy className="w-4 h-4" /> Modificar
                      </button>
                      
                      <button 
                        onClick={() => onPreview(Number(quote.id), false)} 
                        disabled={isPdfLoading}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium text-sm gap-2" 
                        title="Ver PDF Estándar"
                      >
                        <FileText className="w-4 h-4" /> Gral
                      </button>

                      <button 
                        onClick={() => onPreview(Number(quote.id), true)} 
                        disabled={isPdfLoading}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 font-medium text-sm gap-2" 
                        title="Ver PDF con Precios Unitarios"
                      >
                        <List className="w-4 h-4 text-blue-600" /> Detalle
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
  );
};