import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IssuedQuotesDashboardView } from '../../../renderer/src/features/cotizacion/IssuedQuotesDashboardView';

vi.mock('../../../../renderer/src/features/cotizacion/components/PdfPreviewModal', () => ({
  PdfPreviewModal: () => <div data-testid="mock-pdf-modal">Modal PDF</div>
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn(), loading: vi.fn(), dismiss: vi.fn() }
}));

describe('IssuedQuotesDashboardView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    window.api = {
      getIssuedQuotes: vi.fn(),
      getQuoteById: vi.fn(),
      generatePdfPreview: vi.fn(),
      savePdf: vi.fn(),
      issueQuote: vi.fn()
    } as any;
  });

  // --- AC 1: LOAD STATE ---
  it('should display loading state initially', () => {
    vi.mocked(window.api.getIssuedQuotes).mockReturnValue(new Promise(() => {}));

    render(<IssuedQuotesDashboardView />);

    expect(screen.getByText('Cargando historial...')).toBeDefined();
  });

  // --- AC 2: EMPTY STATE ---
  it('should display empty state message when there are no issued quotes', async () => {
    vi.mocked(window.api.getIssuedQuotes).mockResolvedValue({ success: true, data: [] } as any);

    render(<IssuedQuotesDashboardView />);

    await waitFor(() => {
      expect(screen.getByText('Aún no has emitido ninguna cotización.')).toBeDefined();
    });
  });

  // --- AC 3: RENDERING BOARD ---
  it('should render the table with correctly mapped data and translated waste types', async () => {
    // ACTUALIZADO: Usamos wastesSummary
    const mockQuotes = [
      {
        id: 1,
        folio: 'SIMAR-001',
        location: 'Calle Falsa 123',
        wastesSummary: '500 kg de Residuos Peligrosos',
        createdAt: 1712534400000,
        status: 'issued'
      }
    ];

    vi.mocked(window.api.getIssuedQuotes).mockResolvedValue({ success: true, data: mockQuotes } as any);

    render(<IssuedQuotesDashboardView />);

    expect(await screen.findByText('SIMAR-001')).toBeDefined();
    expect(screen.getByText('Calle Falsa 123')).toBeDefined();
    expect(screen.getByText('500 kg de Residuos Peligrosos')).toBeDefined(); 
  });

  // --- AC 4: PDF VISUALIZATION BUTTON ---
  it('should trigger PDF workflow when PDF button is clicked', async () => {
    const mockQuotes = [{ id: 99, folio: 'SIMAR-099', status: 'issued', wastesSummary: 'domestico' }];
    
    vi.mocked(window.api.getIssuedQuotes).mockResolvedValue({ success: true, data: mockQuotes } as any);
    // IMPORTANTE: Le pasamos clientName para que el generador de PDF (y su replace) no exploten
    vi.mocked(window.api.getQuoteById).mockResolvedValue({ ...mockQuotes[0], clientName: 'Empresa Test' } as any);
    vi.mocked(window.api.generatePdfPreview).mockResolvedValue({ success: true, pdfBase64: 'abc' });

    render(<IssuedQuotesDashboardView />);

    const pdfButton = await screen.findByRole('button', { name: /ver pdf/i });

    fireEvent.click(pdfButton);

    await waitFor(() => {
      expect(window.api.getQuoteById).toHaveBeenCalledWith(99);
      expect(window.api.generatePdfPreview).toHaveBeenCalled();
    });
  });
});