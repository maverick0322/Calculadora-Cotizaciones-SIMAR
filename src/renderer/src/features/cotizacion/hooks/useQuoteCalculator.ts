import { useWatch, Control } from 'react-hook-form';
import { IVA_RATE } from '../../../../../shared/constants/quoteConstants';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';

const multiply = (quantity?: number, unitPrice?: number) => Number(quantity || 0) * Number(unitPrice || 0);
const sumAmounts = (items: Array<{ amount?: number }> = []) => items.reduce((total, item) => total + Number(item.amount || 0), 0);
const sumCatalogItems = (items: Array<{ quantity?: number; unitPrice?: number }> = []) => items.reduce((total, item) => total + multiply(item.quantity, item.unitPrice), 0);

export const useQuoteCalculator = (control: Control<QuoteFormValues>) => {
  const services = useWatch({ control, name: 'services' }) || [];

  const breakdown = services.reduce(
    (totals, service) => {
      const treatment = sumCatalogItems(service.wastes?.map((waste) => ({ quantity: waste.quantity, unitPrice: waste.pricePerUnit })) || []);
      const vehicleCost = sumCatalogItems(service.vehicles || []);
      const fuel = multiply(service.logistics?.fuelLiters, service.logistics?.fuelPricePerLiter);
      const tolls = service.logistics?.roadType === 'toll' ? Number(service.logistics?.totalTollCost || 0) : 0;
      const viaticos = Number(service.logistics?.viaticos || 0);
      const crew = sumCatalogItems(service.crew?.map((member) => ({ quantity: member.quantity, unitPrice: member.dailySalary })) || []);
      const supplies = sumCatalogItems(service.supplies || []) + sumCatalogItems(service.tools || []) + sumCatalogItems(service.materials || []);
      const equipment = sumCatalogItems(service.equipment || []) + sumCatalogItems(service.specializedEpp || []);
      const extraCosts = sumAmounts(service.extraCosts || []);

      const cleaning = service.ecologicalCleaning
        ? multiply(service.ecologicalCleaning.hours, service.ecologicalCleaning.hourlyUnitPrice)
          + Number(service.ecologicalCleaning.viaticos || 0)
          + sumAmounts(service.ecologicalCleaning.labor || [])
        : 0;

      const training = service.training
        ? multiply(service.training.hours, service.training.hourlyUnitPrice)
          + sumCatalogItems(service.training.stationery || [])
          + Object.values(service.training.travelExpenses || {}).reduce((total, amount) => total + Number(amount || 0), 0)
        : 0;

      const conditioningLabor = sumAmounts(service.conditioning?.labor || []);

      return {
        treatment: totals.treatment + treatment,
        transport: totals.transport + vehicleCost + fuel + tolls + viaticos,
        conditioning: totals.conditioning + crew + equipment + extraCosts + cleaning + conditioningLabor + training,
        supplies: totals.supplies + supplies,
        logistics: totals.logistics + fuel + tolls + viaticos,
        vehicles: totals.vehicles + vehicleCost,
        crew: totals.crew + crew,
        extras: totals.extras + extraCosts
      };
    },
    { treatment: 0, transport: 0, conditioning: 0, supplies: 0, logistics: 0, vehicles: 0, crew: 0, extras: 0 }
  );

  const subtotal = breakdown.treatment + breakdown.transport + breakdown.conditioning + breakdown.supplies;
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;

  return {
    total,
    subtotal,
    iva,
    breakdown
  };
};
