import { useWatch, Control } from 'react-hook-form';
import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';

export const useQuoteCalculator = (control: Control<QuoteFormValues>) => {
  const services = useWatch({ control, name: 'services' }) || [];

  let treatment = 0;
  let transport = 0;
  let conditioning = 0;
  let supplies = 0;

  services.forEach((service: any) => {
    // 1. TRATAMIENTO (Residuos)
    if (service.wastes) {
      service.wastes.forEach((w: any) => treatment += (Number(w.quantity || 0) * Number(w.pricePerUnit || 0)));
    }

    // 2. TRANSPORTE Y RECOLECCIÓN (Vehículos + Gasolina + Casetas + Viáticos logísticos)
    if (service.vehicles) {
      service.vehicles.forEach((v: any) => transport += (Number(v.quantity || 0) * Number(v.unitPrice || 0)));
    }
    if (service.logistics) {
      const fuel = Number(service.logistics.fuelLiters || 0) * Number(service.logistics.fuelPricePerLiter || 0);
      const tolls = Number(service.logistics.totalTollCost || 0);
      transport += (fuel + tolls);
    }

    // 3. ACONDICIONAMIENTO (Personal + Maquinaria/Equipo + Costos Extra/Maniobras)
    if (service.crew) {
      service.crew.forEach((c: any) => conditioning += (Number(c.quantity || 0) * Number(c.dailySalary || 0)));
    }
    if (service.equipment) {
      service.equipment.forEach((e: any) => conditioning += (Number(e.quantity || 0) * Number(e.unitPrice || 0)));
    }
    if (service.extraCosts) {
      service.extraCosts.forEach((e: any) => conditioning += Number(e.amount || 0));
    }

    // 4. INSUMOS (Venta de tambores, bolsas, supersacos)
    if (service.supplies) {
      service.supplies.forEach((s: any) => supplies += (Number(s.quantity || 0) * Number(s.unitPrice || 0)));
    }
    if (service.materials) {
      service.materials.forEach((m: any) => supplies += (Number(m.quantity || 0) * Number(m.unitPrice || 0)));
    }
  });

  const subtotal = treatment + transport + conditioning + supplies;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  return {
    total,
    subtotal,
    iva,
    breakdown: { treatment, transport, conditioning, supplies } // 👈 El objeto que lee la barra inferior
  };
};