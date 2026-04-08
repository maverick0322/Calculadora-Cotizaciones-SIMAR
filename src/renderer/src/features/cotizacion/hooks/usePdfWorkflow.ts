import { useState } from 'react';
import toast from 'react-hot-toast';

export const usePdfWorkflow = (onWorkflowComplete?: () => void) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [currentFolio, setCurrentFolio] = useState<string>('');

  const openPdfPreview = async (id: number | string, isDraft: boolean) => {
    setIsModalOpen(true);
    setIsLoading(true);
    setPdfBase64(null);

    try {
      if (isDraft) {
        const issueResult = await window.api.issueQuote(id);
        if (!issueResult.success) {
          throw new Error(issueResult.error || 'No se pudo emitir la cotización');
        }
      }

      const quoteData = await window.api.getQuoteById(id);
      if (!quoteData) {
        throw new Error('No se encontraron los datos de la cotización en la base de datos');
      }

      setCurrentFolio(quoteData.folio || `#00${quoteData.id}`);

      const pdfResult = await window.api.generatePdfPreview(quoteData);
      if (!pdfResult.success || !pdfResult.pdfBase64) {
        throw new Error(pdfResult.error || 'Fallo al generar la vista previa del PDF');
      }

      setPdfBase64(pdfResult.pdfBase64);

    } catch (error) {
      console.error('Error en el flujo de PDF:', error);
      toast.error((error as Error).message || 'Ocurrió un error inesperado al procesar el documento');
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!pdfBase64) return;
    
    const loadingToast = toast.loading('Guardando documento...');
    try {
      const result = await window.api.savePdf(pdfBase64, currentFolio);
      
      if (result.success) {
        toast.success('¡PDF guardado correctamente!', { id: loadingToast });
      } else {
        if (result.error?.includes('cancelada')) {
          toast.dismiss(loadingToast);
        } else {
          toast.error(result.error || 'No se pudo guardar el archivo', { id: loadingToast });
        }
      }
    } catch (error) {
      toast.error('Error crítico al guardar el archivo', { id: loadingToast });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setPdfBase64(null);
      if (onWorkflowComplete) {
        onWorkflowComplete();
      }
    }, 300); 
  };

  return {
    isModalOpen,
    isLoading,
    pdfBase64,
    openPdfPreview,
    downloadPdf,
    closeModal
  };
};