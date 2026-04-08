import { useState, useEffect } from 'react';
import { X, Download, Loader2 } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  isLoading: boolean;
  pdfBase64: string | null;
  onClose: () => void;
  onDownload: () => void;
}

export const PdfPreviewModal = ({ 
  isOpen, 
  isLoading, 
  pdfBase64, 
  onClose, 
  onDownload 
}: PdfPreviewModalProps) => {
  
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfBase64) {
      let objectUrl: string;
      
      try {
        const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
        
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(blob);
        
        setPdfUrl(objectUrl);
      } catch (error) {
        console.error("Error crítico decodificando el PDF:", error);
        setPdfUrl(null);
      }

      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    } else {
      setPdfUrl(null);
    }
  }, [pdfBase64]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Vista Previa de Cotización</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={onDownload}
              disabled={isLoading || !pdfBase64}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-200 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-700 font-medium">Generando documento oficial inviolable...</p>
              <p className="text-sm text-gray-500 mt-2">Este proceso bloquea la edición del borrador.</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0`} 
              className="w-full h-full border-0"
              title="Visor PDF SIMAR"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-red-500 font-medium text-lg">⚠️ No se pudo generar la vista previa.</p>
              <p className="text-gray-500 mt-2">Intenta cerrando y volviendo a abrir el documento.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};