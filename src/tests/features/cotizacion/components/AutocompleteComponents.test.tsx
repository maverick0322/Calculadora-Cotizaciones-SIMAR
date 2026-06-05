import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWatch } from 'react-hook-form';
import { CustomAutocomplete } from '@renderer/features/cotizacion/components/CustomAutocomplete';
import { ResidueAutocomplete } from '@renderer/features/cotizacion/components/ResidueAutocomplete';

vi.mock('react-hook-form', () => ({
  useWatch: vi.fn()
}));

describe('autocomplete components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters custom options and selects one with setValue', () => {
    const setValue = vi.fn();
    const onBlur = vi.fn();
    vi.mocked(useWatch).mockReturnValue('ver');

    render(
      <CustomAutocomplete
        label="Estado"
        options={['VERACRUZ', 'PUEBLA']}
        registerName={{ name: 'state', onBlur }}
        placeholder="Selecciona"
        setValue={setValue}
        isLoading
        error={{ message: 'Requerido' }}
      />
    );

    expect(screen.getByText('(Buscando...)')).toBeDefined();
    expect(screen.getByText('Requerido')).toBeDefined();

    const input = screen.getByPlaceholderText('Selecciona');
    fireEvent.focus(input);
    expect(screen.getByText('VERACRUZ')).toBeDefined();
    expect(screen.queryByText('PUEBLA')).toBeNull();

    fireEvent.mouseDown(screen.getByText('VERACRUZ'));
    expect(setValue).toHaveBeenCalledWith('state', 'VERACRUZ', { shouldValidate: true, shouldDirty: true });

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
  });

  it('does not show custom options while disabled', () => {
    vi.mocked(useWatch).mockReturnValue('');

    render(
      <CustomAutocomplete
        label="Municipio"
        options={['XALAPA']}
        registerName={{ name: 'municipality', onBlur: vi.fn() }}
        disabled
        setValue={vi.fn()}
      />
    );

    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.queryByText('XALAPA')).toBeNull();
  });

  it('filters residues by name or key and writes all selected fields', () => {
    const setValue = vi.fn();
    vi.mocked(useWatch).mockReturnValue('cart');
    const residues = [
      {
        id: 1,
        name: 'Carton',
        residue_type: 'RME',
        classification: 'RME',
        clave: 'R-001',
        unit: 'Kilogramo',
        base_price: 2.5
      },
      {
        id: 2,
        name: 'Aceite',
        residue_type: 'RP',
        unit: 'Litro',
        base_price: 4
      }
    ];

    render(
      <ResidueAutocomplete
        residues={residues}
        registerName={{ name: 'services.0.wastes.0.name', onBlur: vi.fn() }}
        serviceIndex={0}
        index={0}
        setValue={setValue}
        error={{ message: 'Selecciona residuo' }}
      />
    );

    expect(screen.getByText('Selecciona residuo')).toBeDefined();
    fireEvent.focus(screen.getByPlaceholderText('Ej. Cartón, Aceite...'));
    fireEvent.mouseDown(screen.getByText('Carton'));

    expect(setValue).toHaveBeenCalledWith('services.0.wastes.0.name', 'Carton', expect.any(Object));
    expect(setValue).toHaveBeenCalledWith('services.0.wastes.0.type', 'RME', expect.any(Object));
    expect(setValue).toHaveBeenCalledWith('services.0.wastes.0.classification', 'RME', expect.any(Object));
    expect(setValue).toHaveBeenCalledWith('services.0.wastes.0.clave', 'R-001', expect.any(Object));
    expect(setValue).toHaveBeenCalledWith('services.0.wastes.0.unit', 'Kilogramo', expect.any(Object));
    expect(setValue).toHaveBeenCalledWith('services.0.wastes.0.pricePerUnit', 2.5, expect.any(Object));
  });
});
