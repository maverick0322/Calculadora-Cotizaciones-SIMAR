import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuoteCalculator } from '../../../../renderer/src/features/cotizacion/hooks/useQuoteCalculator';
import * as RHF from 'react-hook-form';

vi.mock('react-hook-form', () => ({
  useWatch: vi.fn(),
}));

describe('useQuoteCalculator Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- AC 1: ESTADO INICIAL / VACÍO ---
  it('should return all zeros when services array is empty or undefined', () => {
    vi.mocked(RHF.useWatch).mockReturnValue([]); // Simulamos que no hay servicios

    const { result } = renderHook(() => useQuoteCalculator({} as any));

    expect(result.current.subtotal).toBe(0);
    expect(result.current.iva).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.breakdown.logistics).toBe(0);
  });

  // --- AC 2: CÁLCULO DE LOGÍSTICA ---
  it('should calculate logistics correctly including tolls only if roadType is toll', () => {
    const mockServices = [
      {
        logistics: { fuelLiters: 10, fuelPricePerLiter: 20, roadType: 'toll', totalTollCost: 150, viaticos: 50 }
      },
      {
        logistics: { fuelLiters: 5, fuelPricePerLiter: 20, roadType: 'free', totalTollCost: 500, viaticos: 0 } // El peaje aquí debe ser ignorado
      }
    ];
    vi.mocked(RHF.useWatch).mockReturnValue(mockServices);

    const { result } = renderHook(() => useQuoteCalculator({} as any));

    // Servicio 1: (10 * 20) + 150 + 50 = 400
    // Servicio 2: (5 * 20) + 0 (free) + 0 = 100
    // Total = 500
    expect(result.current.breakdown.logistics).toBe(500);
  });

  // --- AC 3: CÁLCULO COMPLETO Y MANEJO DE INDEFINIDOS ---
  it('should calculate all breakdown categories and apply 16% IVA gracefully handling undefined/NaN inputs', () => {
    const mockServices = [
      {
        logistics: { fuelLiters: 10, fuelPricePerLiter: 22 }, // 220
        vehicles: [{ quantity: 2, unitPrice: 500 }, { quantity: null, unitPrice: 100 }], // 1000 + 0 (falla segura)
        crew: [{ quantity: 1, dailySalary: 400 }], // 400
        supplies: [{ quantity: 10, unitPrice: 15 }], // 150
        extraCosts: [{ amount: 230 }] // 230
      }
    ];
    vi.mocked(RHF.useWatch).mockReturnValue(mockServices);

    const { result } = renderHook(() => useQuoteCalculator({} as any));

    expect(result.current.breakdown.logistics).toBe(220);
    expect(result.current.breakdown.vehicles).toBe(1000);
    expect(result.current.breakdown.crew).toBe(400);
    expect(result.current.breakdown.supplies).toBe(150);
    expect(result.current.breakdown.extras).toBe(230);

    const expectedSubtotal = 220 + 1000 + 400 + 150 + 230; // 2000
    const expectedIva = expectedSubtotal * 0.16; // 320
    const expectedTotal = expectedSubtotal + expectedIva; // 2320

    expect(result.current.subtotal).toBe(expectedSubtotal);
    expect(result.current.iva).toBe(expectedIva);
    expect(result.current.total).toBe(expectedTotal);
  });
});