import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardView } from '@renderer/features/cotizacion/DashboardView';
import * as useDraftsModule from '@renderer/features/cotizacion/hooks/useDrafts';

vi.mock('@renderer/features/cotizacion/hooks/usePdfWorkflow', () => ({
  usePdfWorkflow: vi.fn(() => ({
    isModalOpen: false,
    isLoading: false,
    pdfBase64: null,
    openPdfPreview: vi.fn(),
    downloadPdf: vi.fn(),
    closeModal: vi.fn()
  }))
}));

describe('DashboardView Component', () => {
  const mockOnEditClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- AC 1: LOADING STATE ---
  it('should display the loading message when the hook returns loading true', () => {
    vi.spyOn(useDraftsModule, 'useDrafts').mockReturnValue({
      drafts: [],
      loading: true,
      fetchDrafts: vi.fn()
    } as any);

    render(<DashboardView onEditClick={mockOnEditClick} />);

    expect(screen.getByText('Cargando borradores...')).toBeDefined();
  });

  // --- AC 2: EMPTY STATE ---
  it('should display the empty state message when there are no drafts and loading is false', () => {
    vi.spyOn(useDraftsModule, 'useDrafts').mockReturnValue({
      drafts: [],
      loading: false,
      fetchDrafts: vi.fn()
    } as any);

    render(<DashboardView onEditClick={mockOnEditClick} />);

    expect(screen.getByText(/No se encontraron borradores/i)).toBeDefined();
  });

  // --- AC 3: DATA RENDERING & TRANSLATIONS ---
  it('should render table rows with correctly translated data from the dictionaries', () => {
    // ACTUALIZADO: Usamos la nueva estructura de QuoteSummary
    const mockDrafts = [
      {
        id: 10,
        folio: '#100',
        location: 'Centro Histórico',
        wastesSummary: '5 kg de Residuos Domésticos',
        status: 'draft',   
        createdAt: 1672531200000
      }
    ];

    vi.spyOn(useDraftsModule, 'useDrafts').mockReturnValue({
      drafts: mockDrafts,
      loading: false,
      fetchDrafts: vi.fn()
    } as any);

    render(<DashboardView onEditClick={mockOnEditClick} />);

    expect(screen.getByText('#100')).toBeDefined();
    expect(screen.getByText('Centro Histórico')).toBeDefined();
    
    // Verificamos el texto completo que trae el summary
    expect(screen.getByText('5 kg de Residuos Domésticos')).toBeDefined();
    expect(screen.getByText('Borrador')).toBeDefined();
  });

  // --- AC 4: USER INTERACTION ---
  it('should call onEditClick with the correct draft ID when the edit button is clicked', () => {
    const mockDrafts = [
      { id: 99, folio: '#099', wastesSummary: 'Orgánico', status: 'draft' }
    ];

    vi.spyOn(useDraftsModule, 'useDrafts').mockReturnValue({
      drafts: mockDrafts,
      loading: false,
      fetchDrafts: vi.fn()
    } as any);

    render(<DashboardView onEditClick={mockOnEditClick} />);

    const editButton = screen.getByTitle('Editar Borrador');
    fireEvent.click(editButton);

    expect(mockOnEditClick).toHaveBeenCalledTimes(1);
    expect(mockOnEditClick).toHaveBeenCalledWith(99); 
  });
});