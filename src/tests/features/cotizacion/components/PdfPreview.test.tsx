import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PdfPreviewModal } from '../../../../renderer/src/features/cotizacion/components/PdfPreviewModal';

describe('PdfPreviewModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnDownload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/fake-uuid');
    global.URL.revokeObjectURL = vi.fn();
  });

  // --- AC 1: NO RENDERING IF CLOSED ---
  it('should not render anything if isOpen is false', () => {
    const { container } = render(
      <PdfPreviewModal 
        isOpen={false} 
        isLoading={false}
        pdfBase64={null} 
        onClose={mockOnClose} 
        onDownload={mockOnDownload} 
      />
    );
    expect(container.firstChild).toBeNull();
  });

  // --- AC 2: LOADING STATE ---
  it('should show the loading state and disable download button when isLoading is true', () => {
    render(
      <PdfPreviewModal 
        isOpen={true} 
        isLoading={true} 
        pdfBase64={null} 
        onClose={mockOnClose} 
        onDownload={mockOnDownload} 
      />
    );

    expect(screen.getByText('Generando documento oficial inviolable...')).toBeDefined();
    
    const downloadBtn = screen.getByRole('button', { name: /descargar pdf/i });
    expect((downloadBtn as HTMLButtonElement).disabled).toBe(true);
  });

  // --- AC 3: IFRAME RENDERING ---
  it('should render the iframe with the blob URL when pdfBase64 is provided', () => {
    render(
      <PdfPreviewModal 
        isOpen={true} 
        isLoading={false} 
        pdfBase64="YmFzZTY0" 
        onClose={mockOnClose} 
        onDownload={mockOnDownload} 
      />
    );

    const iframe = screen.getByTitle('Visor PDF SIMAR');
    expect(iframe).toBeDefined();
    
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
    
    const downloadBtn = screen.getByRole('button', { name: /descargar pdf/i });
    expect((downloadBtn as HTMLButtonElement).disabled).toBe(false);
  });

  // --- AC 4: USER INTERACTION (BUTTONS) ---
  it('should call onClose and onDownload when respective buttons are clicked', () => {
    render(
      <PdfPreviewModal 
        isOpen={true} 
        isLoading={false} 
        pdfBase64="YmFzZTY0"
        onClose={mockOnClose} 
        onDownload={mockOnDownload} 
      />
    );

    const downloadBtn = screen.getByRole('button', { name: /descargar pdf/i });
    fireEvent.click(downloadBtn);
    expect(mockOnDownload).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByTitle('Cerrar vista previa');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // --- AC 5: ERROR STATE ---
  it('should show error message if not loading and no pdfBase64 is provided', () => {
    render(
      <PdfPreviewModal 
        isOpen={true} 
        isLoading={false} 
        pdfBase64={null}
        onClose={mockOnClose} 
        onDownload={mockOnDownload} 
      />
    );

    expect(screen.getByText('⚠️ No se pudo generar la vista previa.')).toBeDefined();
  });
});