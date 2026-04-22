// src/shared/types/Quote.ts
// Nota: Recuerda renombrar el archivo físico de Cotizacion.ts a Quote.ts

export type ActivityType = 'collection' | 'transport' | 'transfer' | 'final_disposal';
export type WasteType = 'domestic' | 'organic' | 'recyclable' | 'hazardous' | 'bulky';
export type VolumeUnit = 'kg' | 'ton' | 'm3' | 'containers' | 'trips';
export type ServiceFrequency = 'daily' | 'weekly' | 'monthly' | 'one_time';
export type QuoteStatus = 'draft' | 'issued' | 'cancelled' | 'replaced';
export type RoadType = 'free' | 'toll';

export interface Location {
  street: string;
  municipality: string;
  neighborhood: string;
  coordinates?: string; // Optional for now, for future Maps integration
}

export interface WasteItem {
  name: string;
  type: WasteType;
  quantity: number;
  unit: VolumeUnit;
}

export interface QuoteDraft {
  id?: string | number;  // Supports both UUID (string) or SQLite auto-increment (number)
  folio?: string;        // Null while it's a draft
  replacesQuoteId?: number | string;
  clientName: string;
  clientRfc: string;
  location: Location;
  activity: ActivityType;
  wastes: WasteItem[];
  frequency: ServiceFrequency; 
  createdAt: number;     // Timestamp in milliseconds
  status: QuoteStatus;
  trip?: TripLogistics;  // Optional trip logistics block
}

export interface QuoteSummary {
  id: number | string;
  folio: string;
  location: string;
  wastesSummary: string;
  createdAt: number;
  status: string;
}

export interface TripLogistics {
  kilometers: number;
  vehicles: number;
  crewMembers: number;
  fuelLiters: number;
  roadType?: RoadType;
  tolls?: number;
  totalTollCost?: number;
  origin: string;
  destinationWarehouse: string;
}