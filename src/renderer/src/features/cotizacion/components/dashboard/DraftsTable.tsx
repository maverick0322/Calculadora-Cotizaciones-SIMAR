import { ArrowRight, FileText, Pencil } from 'lucide-react';
import { QUOTE_STATUS_LABELS } from '../../../../../../shared/constants/quoteConstants';
import { QuoteSummary } from '../../../../../../shared/types/Quote';

const nextStatusLabels: Record<string, string> = {
  en_proceso: 'Marcar terminada',
  terminada: 'Autorizar',
  autorizada: 'Emitir PDF'
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

interface DraftsTableProps {
  drafts: QuoteSummary[];
  loading: boolean;
  searchTerm: string;
  isPdfLoading: boolean;
  onEditClick: (id: number) => void;
  onEmitRequest: (id: number) => void;
  onAdvanceStatus: (id: number, status: string) => void;
}

export const DraftsTable = ({ drafts, loading, searchTerm, isPdfLoading, onEditClick, onEmitRequest, onAdvanceStatus }: DraftsTableProps) => {
  return (
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
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Cargando cotizaciones...</td></tr>
            )}
            
            {!loading && drafts.length === 0 && !searchTerm && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No se encontraron cotizaciones en seguimiento. Crea una nueva para iniciar.</td></tr>
            )}

            {!loading && drafts.length === 0 && searchTerm && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No hay resultados para "{searchTerm}".</td></tr>
            )}

            {drafts.map((draft) => {
              const dateToShow = draft.createdAt ? formatDate(Number(draft.createdAt)) : 'Fecha desconocida';
              const locationToShow = draft.location || 'Sin dirección';
              const wastesToShow = draft.wastesSummary || 'No especificado';
              const statusToShow = QUOTE_STATUS_LABELS[draft.status] || draft.status || 'En proceso';
              const canEdit = ['en_proceso', 'terminada', 'autorizada', 'draft'].includes(draft.status);
              const nextStatusLabel = nextStatusLabels[draft.status];

              return (
                <tr key={draft.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{draft.folio || `#00${draft.id}`}</span>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 capitalize">
                      {statusToShow}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onEditClick(Number(draft.id))} 
                        disabled={isPdfLoading || !canEdit}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50" 
                        title={canEdit ? 'Editar cotización en seguimiento' : 'Solo se editan cotizaciones sin emitir'}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => draft.status === 'autorizada' ? onEmitRequest(Number(draft.id)) : onAdvanceStatus(Number(draft.id), draft.status)}
                        disabled={isPdfLoading || !nextStatusLabel}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 text-xs font-medium"
                        title={nextStatusLabel}
                      >
                        {draft.status === 'autorizada' ? <FileText className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        {nextStatusLabel}
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
