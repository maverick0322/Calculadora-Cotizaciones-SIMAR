import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePdfWorkflow } from '../../../../renderer/src/features/cotizacion/hooks/usePdfWorkflow';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(() => 'mock-toast-id'),
    dismiss: vi.fn(),
  }
}));

describe('usePdfWorkflow Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    window.api = {
      issueQuote: vi.fn(),
      getQuoteById: vi.fn(),
      generatePdfPreview: vi.fn(),
      savePdf: vi.fn()
    } as any;
  });

  afterEach(() => {
    vi.useRealTimers(); 
  });

  // --- AC 1: HAPPY PATH ---
  it('should process a draft: issue it, fetch data, and generate PDF base64', async () => {
    // [ ARRANGE ]
    // AGREGAMOS clientName AL MOCK
    const mockQuote = { id: 1, folio: 'FOLIO-001', clientName: 'Cliente Prueba' } as any; 
    vi.mocked(window.api.issueQuote).mockResolvedValue({ success: true });
    vi.mocked(window.api.getQuoteById).mockResolvedValue(mockQuote);
    vi.mocked(window.api.generatePdfPreview).mockResolvedValue({ success: true, pdfBase64: 'abc_base64_xyz' });

    const { result } = renderHook(() => usePdfWorkflow());

    // [ ACT ]
    await act(async () => {
      await result.current.openPdfPreview(1, true);
    });

    // [ ASSERT ]
    expect(window.api.issueQuote).toHaveBeenCalledWith(1);
    expect(window.api.getQuoteById).toHaveBeenCalledWith(1);
    expect(window.api.generatePdfPreview).toHaveBeenCalledWith(mockQuote);
    
    expect(result.current.pdfBase64).toBe('abc_base64_xyz');
    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  // --- AC 2: HAPPY PATH ISSUED ---
  it('should skip issuing if isDraft is false, but fetch and generate PDF', async () => {
    // [ ARRANGE ]
    // AGREGAMOS clientName AL MOCK
    vi.mocked(window.api.getQuoteById).mockResolvedValue({ id: 5, clientName: 'Otro Cliente' } as any);
    vi.mocked(window.api.generatePdfPreview).mockResolvedValue({ success: true, pdfBase64: 'pdf_data' });

    const { result } = renderHook(() => usePdfWorkflow());

    // [ ACT ]
    await act(async () => {
      await result.current.openPdfPreview(5, false); 
    });

    // [ ASSERT ]
    expect(window.api.issueQuote).not.toHaveBeenCalled();
    expect(window.api.getQuoteById).toHaveBeenCalledWith(5);
    expect(result.current.pdfBase64).toBe('pdf_data');
  });

  // --- AC 3: ERROR HANDLING ---
  it('should catch error, show toast, and close modal if issuing fails', async () => {
    // [ ARRANGE ]
    vi.mocked(window.api.issueQuote).mockResolvedValue({ success: false, error: 'Database locked' });
    vi.spyOn(console, 'error').mockImplementation(() => {}); 

    const { result } = renderHook(() => usePdfWorkflow());

    // [ ACT ]
    await act(async () => {
      await result.current.openPdfPreview(1, true);
    });

    // [ ASSERT ]
    expect(toast.error).toHaveBeenCalledWith('Database locked');
    expect(result.current.isModalOpen).toBe(false);
    expect(window.api.generatePdfPreview).not.toHaveBeenCalled();
  });

  // --- AC 4: DOWNLOAD PDF (SUCCESS) ---
  it('should call savePdf and show success toast if download is successful', async () => {
    // [ ARRANGE ]
    // AGREGAMOS clientName AL MOCK
    vi.mocked(window.api.getQuoteById).mockResolvedValue({ id: 2, folio: 'FOLIO-002', clientName: 'Empresa SA de CV' } as any);
    vi.mocked(window.api.generatePdfPreview).mockResolvedValue({ success: true, pdfBase64: 'fake-base64' });
    vi.mocked(window.api.savePdf).mockResolvedValue({ success: true, filePath: 'C:/docs/file.pdf' });

    const { result } = renderHook(() => usePdfWorkflow());

    await act(async () => {
      await result.current.openPdfPreview(2, false);
    });

    // [ ACT ]
    await act(async () => {
      await result.current.downloadPdf();
    });

    // [ ASSERT ]
    // VERIFICAMOS EL NOMBRE LIMPIO EN LA ASERCIÓN
    expect(window.api.savePdf).toHaveBeenCalledWith('fake-base64', 'FOLIO-002_Empresa_SA_de_CV');
    expect(toast.success).toHaveBeenCalledWith('¡PDF guardado correctamente!', expect.any(Object));
  });

  // --- AC 5: CANCEL DOWNLOAD ---
  it('should dismiss loading toast silently if user cancels the save dialog', async () => {
    // [ ARRANGE ]
    // AGREGAMOS clientName AL MOCK
    vi.mocked(window.api.getQuoteById).mockResolvedValue({ id: 2, folio: 'FOLIO-002', clientName: 'Empresa' } as any);
    vi.mocked(window.api.generatePdfPreview).mockResolvedValue({ success: true, pdfBase64: 'fake-base64' });
    vi.mocked(window.api.savePdf).mockResolvedValue({ success: false, error: 'Operación cancelada por el usuario' });

    const { result } = renderHook(() => usePdfWorkflow());

    await act(async () => {
      await result.current.openPdfPreview(2, false);
    });

    // [ ACT ]
    await act(async () => {
      await result.current.downloadPdf();
    });

    // [ ASSERT ]
    expect(toast.dismiss).toHaveBeenCalledWith('mock-toast-id');
    expect(toast.error).not.toHaveBeenCalled(); 
  });

  // --- AC 6: CERRAR MODAL Y TEMPORIZADOR ---
  it('should set modal to false immediately, and clear base64/call callback after 300ms', () => {
    // [ ARRANGE ]
    vi.useFakeTimers();
    const mockCallback = vi.fn();
    const { result } = renderHook(() => usePdfWorkflow(mockCallback));

    act(() => {
      // Pasamos un objeto mínimo con clientName para evitar el error de replace
      vi.mocked(window.api.getQuoteById).mockResolvedValue({ id: 1, clientName: 'Test' } as any);
      result.current.openPdfPreview(1, false); 
    });

    // [ ACT ] 
    act(() => {
      result.current.closeModal();
    });

    // [ ASSERT ]
    expect(result.current.isModalOpen).toBe(false);
    expect(mockCallback).not.toHaveBeenCalled();

    // [ ACT ]
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // [ ASSERT ]
    expect(result.current.pdfBase64).toBeNull();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});