import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { buildEmissionInitials, EmitConfirmationModal } from '@renderer/features/cotizacion/components/dashboard/EmitConfirmationModal';
import { User } from '../../../../../../shared/types/Auth';

const buildUser = (overrides: Partial<User>): User => ({
  id: 1,
  central_id: 'V-001',
  full_name: 'Valeria Morales Ruiz',
  employee_key: 'V-001',
  initials: '',
  email: 'valeria.morales@simar.com',
  role: 'sales',
  is_active: true,
  ...overrides
});

describe('buildEmissionInitials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.api = {
      suggestQuoteFolio: vi.fn(),
      getQuoteById: vi.fn(),
      manageConditions: vi.fn()
    } as any;
  });

  it('uses explicit initials when available', () => {
    expect(buildEmissionInitials(buildUser({ initials: 'VMR' }))).toBe('VMR');
  });

  it('uses a sanitized employee key when initials are missing', () => {
    expect(buildEmissionInitials(buildUser({ initials: '', employee_key: 'V-001' }))).toBe('V001');
  });

  it('falls back to full name initials and never returns a single character', () => {
    expect(buildEmissionInitials(buildUser({ initials: '', employee_key: '', full_name: 'Ana Lopez' }))).toBe('AL');
    expect(buildEmissionInitials(buildUser({ initials: '', employee_key: '', full_name: 'A' }))).toBe('SIMAR');
  });

  it('loads emission data and confirms payload with selected and custom conditions', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = buildUser({ initials: '', employee_key: 'V-001' });

    vi.mocked(window.api.suggestQuoteFolio).mockResolvedValue({
      success: true,
      data: { folio: '001-0626-RME-V001', sequence: 1, quoteTypeCode: 'RME', preparedByInitials: 'V001', clientInitials: 'CLI' }
    });
    vi.mocked(window.api.getQuoteById).mockResolvedValue({
      services: [{ serviceType: 'rme' }]
    } as any);
    vi.mocked(window.api.manageConditions).mockResolvedValue({
      success: true,
      data: [
        { id: 1, type: 'commercial', title: 'Vigencia', description: '15 dias', appliesToServiceTypes: ['rme'], isActive: true },
        { id: 2, type: 'technical', title: 'Etiquetado', description: 'Correcto etiquetado', appliesToServiceTypes: ['rme'], isActive: true }
      ]
    });

    render(
      <EmitConfirmationModal
        isOpen
        quoteId={10}
        currentUser={user}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    expect(await screen.findByDisplayValue('001-0626-RME-V001')).toBeDefined();
    expect(screen.getByText('Vigencia')).toBeDefined();
    expect(screen.getByText('Etiquetado')).toBeDefined();
    expect(screen.getByText('V001')).toBeDefined();

    fireEvent.click(screen.getByLabelText(/Etiquetado/i));
    fireEvent.change(screen.getAllByPlaceholderText('Una condición por línea')[0], {
      target: { value: 'Condición comercial personalizada' }
    });

    fireEvent.click(screen.getByText('Emitir PDF'));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
      quoteId: 10,
      folio: '001-0626-RME-V001',
      preparedByUserId: 1,
      preparedByInitials: 'V001',
      quoteTypeCode: 'RME'
    }));
    expect(onConfirm.mock.calls[0][0].conditions).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: 'Vigencia', isCustom: false }),
      expect.objectContaining({ title: 'Etiquetado', isCustom: false }),
      expect.objectContaining({ description: 'Condición comercial personalizada', isCustom: true })
    ]));
  });

  it('renders loading and load errors', async () => {
    vi.mocked(window.api.suggestQuoteFolio).mockResolvedValue({ success: false, error: 'Sin folio' });
    vi.mocked(window.api.getQuoteById).mockResolvedValue({ services: [] } as any);

    render(
      <EmitConfirmationModal
        isOpen
        quoteId={10}
        currentUser={buildUser({})}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Preparando datos de emisión...')).toBeDefined();
    expect(await screen.findByText('Sin folio')).toBeDefined();
  });
});
