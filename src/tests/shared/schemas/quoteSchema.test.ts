import { describe, it, expect } from 'vitest';
import { quoteSchema, QuoteFormValues } from '../../../shared/schemas/quoteSchema';

describe('quoteSchema Validation', () => {
  
  const getValidBasePayload = (): QuoteFormValues => ({
    location: { street: 'Av. Lazaro Cardenas 100', municipality: 'Xalapa', neighborhood: 'Centro' },
    activity: 'collection',
    waste: 'domestic',
    volumeQuantity: 15.5,
    volumeUnit: 'kg',
    frequency: 'weekly',
  });

  describe('Happy Paths (Valid Data)', () => {
    it('should validate successfully when all required and optional data is correct', () => {
      // [ ARRANGE ]
      const validPayload = {
        ...getValidBasePayload(),
        trip: {
          kilometers: 10,
          vehicles: 2,
          crewMembers: 4,
          routes: 1,
          fuelLiters: 15.5,
          roadType: 'toll' as const,
          tolls: 2,
          totalTollCost: 150.50,
          origin: 'Cliente A',
          destinationWarehouse: 'Almacen SIMAR'
        }
      };

      // [ ACT ]
      const result = quoteSchema.safeParse(validPayload);

      // [ ASSERT ]
      expect(result.success).toBe(true);
    });

    it('should validate successfully when the optional trip object is completely missing', () => {
      // [ ARRANGE ]
      const validPayloadWithoutTrip = getValidBasePayload();

      // [ ACT ]
      const result = quoteSchema.safeParse(validPayloadWithoutTrip);

      // [ ASSERT ]
      expect(result.success).toBe(true);
    });
  });

  describe('Location Validation', () => {
    it('should fail when street name is less than 5 characters', () => {
      // [ ARRANGE ]
      const payload = getValidBasePayload();
      payload.location.street = 'Av.'; 

      // [ ACT ]
      const result = quoteSchema.safeParse(payload);

      // [ ASSERT ]
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['location', 'street']);
        expect(result.error.issues[0].message).toBe('Street must be at least 5 characters');
      }
    });

    it('should fail when municipality or neighborhood is empty', () => {
      // [ ARRANGE ]
      const payload = getValidBasePayload();
      payload.location.municipality = ''; 

      // [ ACT ]
      const result = quoteSchema.safeParse(payload);

      // [ ASSERT ]
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['location', 'municipality']);
      }
    });
  });

  describe('Enums Validation', () => {
    it('should fail when an invalid waste type is provided', () => {
      // [ ARRANGE ]
      const payload = getValidBasePayload() as any; 
      payload.waste = 'radioactive'; 

      // [ ACT ]
      const result = quoteSchema.safeParse(payload);

      // [ ASSERT ]
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['waste']);
      }
    });
  });

  describe('Volume Quantity Coercion and Validation', () => {
    it('should successfully coerce a string number to a real number', () => {
      // [ ARRANGE ]
      const payload = getValidBasePayload() as any;
      payload.volumeQuantity = "25.5"; 
      // [ ACT ]
      const result = quoteSchema.safeParse(payload);

      // [ ASSERT ]
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.volumeQuantity).toBe(25.5);
      }
    });

    it('should fail when volume quantity is 0 or negative', () => {
      // [ ARRANGE ]
      const payload = getValidBasePayload();
      payload.volumeQuantity = 0; 

      // [ ACT ]
      const result = quoteSchema.safeParse(payload);

      // [ ASSERT ]
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Volume must be greater than 0');
      }
    });
  });

  describe('Trip Logistics Edge Cases', () => {
    it('should pass when roadType is an empty string, null, or undefined', () => {
      // [ ARRANGE ]
      const payloadsToTest = ['', null, undefined];

      payloadsToTest.forEach(emptyValue => {
        const payload = {
          ...getValidBasePayload(),
          trip: {
            kilometers: 5, vehicles: 1, crewMembers: 1, routes: 1, fuelLiters: 10,
            origin: 'Instalaciones Cliente', 
            destinationWarehouse: 'Almacén Central',
            roadType: emptyValue as any 
          }
        };

        // [ ACT ]
        const result = quoteSchema.safeParse(payload);

        // [ ASSERT ]
        expect(result.success, !result.success ? result.error.message : '').toBe(true);
      });
    });

    it('should fail when vehicles or crewMembers are less than 1', () => {
      // [ ARRANGE ]
      const payload = {
        ...getValidBasePayload(),
        trip: {
          kilometers: 10, fuelLiters: 10, routes: 1,
          origin: 'Instalaciones Cliente', 
          destinationWarehouse: 'Almacén Central',
          vehicles: 0, 
          crewMembers: 0 
        }
      };

      // [ ACT ]
      const result = quoteSchema.safeParse(payload);

      // [ ASSERT ]
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBe(2);
        expect(result.error.issues[0].path).toEqual(['trip', 'vehicles']);
        expect(result.error.issues[1].path).toEqual(['trip', 'crewMembers']);
      }
    });
  });
});