import { useWatch, Control } from 'react-hook-form';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { useEffect, useState } from 'react';

export const useQuoteCalculator = (control: Control<QuoteFormValues>) => {
  const [totals, setTotals] = useState({
    subtotal: 0,
    iva: 0,
    total: 0,
    breakdown: {
      logistics: 0,
      vehicles: 0,
      crew: 0,
      supplies: 0,
      extras: 0
    }
  });

  const services = useWatch({
    control,
    name: 'services'
  });

  useEffect(() => {
    if (!services) return;

    let totalLogistics = 0;
    let totalVehicles = 0;
    let totalCrew = 0;
    let totalSupplies = 0;
    let totalExtras = 0;

    services.forEach((service) => {
      const fuelCost = (service.logistics.fuelLiters || 0) * (service.logistics.fuelPricePerLiter || 0);
      const tollCost = service.logistics.roadType === 'toll' ? (service.logistics.totalTollCost || 0) : 0;
      totalLogistics += fuelCost + tollCost + (service.logistics.viaticos || 0);

      service.vehicles?.forEach(v => {
        totalVehicles += (v.quantity || 0) * (v.unitPrice || 0);
      });

      service.crew?.forEach(c => {
        totalCrew += (c.quantity || 0) * (c.dailySalary || 0);
      });

      service.supplies?.forEach(s => {
        totalSupplies += (s.quantity || 0) * (s.unitPrice || 0);
      });

      service.extraCosts?.forEach(e => {
        totalExtras += (e.amount || 0);
      });
    });

    const subtotal = totalLogistics + totalVehicles + totalCrew + totalSupplies + totalExtras;
    const iva = subtotal * 0.16;

    setTotals({
      subtotal,
      iva,
      total: subtotal + iva,
      breakdown: {
        logistics: totalLogistics,
        vehicles: totalVehicles,
        crew: totalCrew,
        supplies: totalSupplies,
        extras: totalExtras
      }
    });
  }, [services]);

  return totals;
};