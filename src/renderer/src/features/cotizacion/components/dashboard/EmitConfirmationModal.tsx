import { AlertTriangle, FileText } from 'lucide-react';

interface EmitConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const EmitConfirmationModal = ({ isOpen, onCancel, onConfirm }: EmitConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
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
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Sí, Emitir PDF
          </button>
        </div>
      </div>
    </div>
  );
};