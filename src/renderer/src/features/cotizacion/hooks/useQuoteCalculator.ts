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

    const safeNum = (val: any) => {
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };

    services.forEach((service) => {
      const fuelCost = safeNum(service.logistics?.fuelLiters) * safeNum(service.logistics?.fuelPricePerLiter);
      const tollCost = service.logistics?.roadType === 'toll' ? safeNum(service.logistics?.totalTollCost) : 0;
      totalLogistics += fuelCost + tollCost + safeNum(service.logistics?.viaticos);

      service.vehicles?.forEach(v => {
        totalVehicles += safeNum(v.quantity) * safeNum(v.unitPrice);
      });

      service.crew?.forEach(c => {
        totalCrew += safeNum(c.quantity) * safeNum(c.dailySalary);
      });

      service.supplies?.forEach(s => {
        totalSupplies += safeNum(s.quantity) * safeNum(s.unitPrice);
      });

      service.extraCosts?.forEach(e => {
        totalExtras += safeNum(e.amount);
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