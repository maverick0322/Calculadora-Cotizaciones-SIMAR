import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardView } from '@renderer/features/cotizacion/DashboardView';
import * as useDraftsModule from '@renderer/features/cotizacion/hooks/useDrafts';

describe('DashboardView Component', () => {
  const mockOnEditClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- AC 1: LOADING STATE ---
  it('should display the loading message when the hook returns loading true', () => {
    // [ ARRANGE ]
    vi.spyOn(useDraftsModule, 'useDrafts').mockReturnValue({
      drafts: [],
      loading: true,
    } as any);

    // [ ACT ]
    render(<DashboardView onEditClick={mockOnEditClick} />);

    // [ ASSERT ]
    expect(screen.getByText('Cargando borradores...')).toBeDefined();
  });

  // --- AC 2: EMPTY STATE ---
  it('should display the empty state message when there are no drafts and loading is false', () => {
    // [ ARRANGE ]
    vi.spyOn(useDraftsModule, 'useDrafts').mockReturnValue({
      drafts: [],
      loading: false,
    } as any);

    // [ ACT ]
    render(<DashboardView onEditClick={mockOnEditClick} />);

    // [ ASSERT ]
    expect(screen.getByText(/No se encontraron borradores/i)).toBeDefined();
  });

  // --- AC 3: DATA RENDERING & TRANSLATIONS ---
  it('should render table rows with correctly translated data from the dictionaries', () => {
    // [ ARRANGE ]
    const mockDrafts = [
      {
        id: 10,
        folio: '#100',
        location: 'Centro Histórico',
        waste: 'domestic',
        volume: '5 kg',
        status: 'draft',   
        createdAt: 1672531200000
      }
    ];

    vi.spyOn(useDraftsModule, 'useDrafts').mockReturnValue({
      drafts: mockDrafts,
      loading: false,
    } as any);

    // [ ACT ]
    render(<DashboardView onEditClick={mockOnEditClick} />);

    // [ ASSERT ]
    expect(screen.getByText('#100')).toBeDefined();
    expect(screen.getByText('Centro Histórico')).toBeDefined();
    
    expect(screen.getByText('Doméstico')).toBeDefined();
    expect(screen.getByText('Borrador')).toBeDefined();
  });

  // --- AC 4: USER INTERACTION ---
  it('should call onEditClick with the correct draft ID when the edit button is clicked', () => {
    // [ ARRANGE ]
    const mockDrafts = [
      { id: 99, folio: '#099', waste: 'organic', status: 'draft' }
    ];

    vi.spyOn(useDraftsModule, 'useDrafts').mockReturnValue({
      drafts: mockDrafts,
      loading: false,
    } as any);

    render(<DashboardView onEditClick={mockOnEditClick} />);

    // [ ACT ]
    const editButton = screen.getByTitle('Editar Borrador');
    fireEvent.click(editButton);

    // [ ASSERT ]
    expect(mockOnEditClick).toHaveBeenCalledTimes(1);
    expect(mockOnEditClick).toHaveBeenCalledWith(99); 
  });
});