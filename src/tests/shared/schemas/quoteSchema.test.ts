import { describe, it, expect } from 'vitest';
import { quoteSchema } from '../../../shared/schemas/quoteSchema';

describe('quoteSchema Validation', () => {
  
  const getValidBasePayload = (): any => ({
    clientName: 'Empresa Test SA de CV',
    clientRfc: 'TEST010203XXX',
    contactName: 'Juan Pérez',
    contactPhone: '2288123456', 
    contactEmail: 'juan@empresatest.com',
    validityDays: 15,
    frequency: { type: 'weekly' },
    services: [
      {
        id: 'uuid-1234', 
        activity: 'collection',
        location: { street: 'Av. Lazaro Cardenas 100', municipality: 'Xalapa', neighborhood: 'Centro', state: 'Veracruz' },
        wastes: [
          { type: 'domestic', name: 'Basura general', quantity: 15.5, unit: 'kg', pricePerUnit: 10 }
        ],
        vehicles: [{ vehicleId: 1, name: 'Camion', quantity: 1, unitPrice: 100 }], 
        crew: [{ type: 'driver', quantity: 1, dailySalary: 200 }],
        supplies: [],
        extraCosts: [],
        logistics: { 
          origin: 'Cliente A',
          primaryDestination: 'Almacen SIMAR',
          kilometers: 10,
          fuelLiters: 15.5,
          fuelPricePerLiter: 24.5,
          viaticos: 0,
          roadType: 'toll',
          tolls: 2,
          totalTollCost: 150.50
        }
      }
    ],
    status: 'draft',
    createdAt: 1234567890
  });

  describe('Happy Paths (Valid Data)', () => {
    it('should validate successfully when all required and optional data is correct', () => {
      const result = quoteSchema.safeParse(getValidBasePayload());
      expect(result.success).toBe(true);
    });

    it('should validate successfully when the optional trip object is completely missing', () => {
      const payload = getValidBasePayload();
      delete payload.services[0].logistics.roadType;
      delete payload.services[0].logistics.tolls;
      delete payload.services[0].logistics.totalTollCost;
      
      const result = quoteSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('Location Validation', () => {
    it('should fail when street name is less than 5 characters', () => {
      const payload = getValidBasePayload();
      payload.services[0].location.street = 'Av.'; 

      const result = quoteSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('should fail when municipality or neighborhood is empty', () => {
      const payload = getValidBasePayload();
      payload.services[0].location.municipality = ''; 

      const result = quoteSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('Waste Details Validation', () => {
    it('should fail when waste type is completely empty', () => {
      const payload = getValidBasePayload();
      payload.services[0].wastes[0].type = ''; 

      const result = quoteSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('Volume Quantity Coercion and Validation', () => {
    it('should fail when volume quantity is provided as a string (requires strict number)', () => {
      const payload = getValidBasePayload();
      payload.services[0].wastes[0].quantity = "25.5"; 
      
      const result = quoteSchema.safeParse(payload);
      
      expect(result.success).toBe(false);
    });

    it('should fail when volume quantity is 0 or negative', () => {
      const payload = getValidBasePayload();
      payload.services[0].wastes[0].quantity = 0; 

      const result = quoteSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('Trip Logistics Edge Cases', () => {
    it('should pass when roadType is an empty string, null, or undefined', () => {
      const payloadsToTest = ['', null, undefined];

      payloadsToTest.forEach(emptyValue => {
        const payload = getValidBasePayload();
        payload.services[0].logistics.roadType = emptyValue; 

        const result = quoteSchema.safeParse(payload);
        expect(result.success, !result.success ? result.error.message : '').toBe(true);
      });
    });

    it('should fail when vehicles or crewMembers are less than 1', () => {
      const payload = getValidBasePayload();
      payload.services[0].vehicles[0].quantity = 0;
      payload.services[0].crew[0].quantity = 0; 

      const result = quoteSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});