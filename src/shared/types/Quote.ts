export type ActivityType = 'collection' | 'transport' | 'transfer' | 'final_disposal';
export type WasteType = 'domestic' | 'organic' | 'recyclable' | 'hazardous' | 'bulky';
export type VolumeUnit = 'kg' | 'ton' | 'm3' | 'containers' | 'trips';
export type ServiceFrequencyType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'one_time' | 'custom';
export type QuoteStatus = 'draft' | 'issued' | 'cancelled' | 'replaced';
export type RoadType = 'free' | 'toll';

export interface Location {
  street: string;
  municipality: string;
  neighborhood: string;
  coordinates?: string; 
}

export interface WasteItem {
  name: string;
  type: WasteType;
  quantity: number;
  unit: VolumeUnit;
}

export interface ServiceFrequencyDetail {
  type: ServiceFrequencyType;
  duration?: number; 
  customDescription?: string;
}

export interface QuoteDraft {
  id?: string | number;  
  folio?: string;        
  replacesQuoteId?: number | string;
  clientName: string;
  clientRfc: string;
  validityDays: number;
  location: Location;
  activity: ActivityType;
  wastes: WasteItem[];
  frequency: ServiceFrequencyDetail;
  createdAt: number;     
  status: QuoteStatus;
  trip?: TripLogistics;  
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