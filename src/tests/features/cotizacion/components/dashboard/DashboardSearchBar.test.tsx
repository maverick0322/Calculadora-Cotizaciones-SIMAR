import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardSearchBar } from '@renderer/features/cotizacion/components/dashboard/DashboardSearchBar';

describe('DashboardSearchBar', () => {
  it('updates search text', () => {
    const setSearchTerm = vi.fn();

    render(<DashboardSearchBar searchTerm="" setSearchTerm={setSearchTerm} />);

    fireEvent.change(screen.getByPlaceholderText('Buscar por folio, cliente o residuo...'), {
      target: { value: 'folio-001' }
    });

    expect(setSearchTerm).toHaveBeenCalledWith('folio-001');
  });

  it('renders month filter, updates it and clears it', () => {
    const setSearchTerm = vi.fn();
    const setSelectedMonth = vi.fn();

    render(
      <DashboardSearchBar
        searchTerm=""
        setSearchTerm={setSearchTerm}
        selectedMonth="2026-06"
        setSelectedMonth={setSelectedMonth}
      />
    );

    const monthInput = screen.getByLabelText('Filtrar por mes');
    expect(monthInput.className).toContain('w-full');

    fireEvent.change(monthInput, { target: { value: '2026-07' } });
    expect(setSelectedMonth).toHaveBeenCalledWith('2026-07');

    fireEvent.click(screen.getByTitle('Limpiar filtro de mes'));
    expect(setSelectedMonth).toHaveBeenCalledWith('');
  });

  it('uses a custom placeholder and hides month filter when setter is missing', () => {
    render(
      <DashboardSearchBar
        searchTerm=""
        setSearchTerm={vi.fn()}
        placeholder="Buscar emitidas..."
      />
    );

    expect(screen.getByPlaceholderText('Buscar emitidas...')).toBeDefined();
    expect(screen.queryByLabelText('Filtrar por mes')).toBeNull();
  });
});
