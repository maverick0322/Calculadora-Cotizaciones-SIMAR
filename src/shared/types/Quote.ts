export type ActivityType = 'collection' | 'transport' | 'transfer' | 'final_disposal';
export type WasteType = 'domestic' | 'organic' | 'recyclable' | 'hazardous' | 'bulky';
export type ServiceFrequencyType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'one_time' | 'custom';
export type QuoteStatus = 'draft' | 'issued' | 'cancelled' | 'replaced';
export type RoadType = 'free' | 'toll';

export interface Location {
  street: string;
  municipality: string;
  neighborhood: string;
  state: string;
  coordinates?: string; 
}

export interface WasteItem {
  name: string;
  type: string;
  classification: string;
  clave: string;
  specificDescription?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

export interface ServiceFrequencyDetail {
  type: ServiceFrequencyType;
  duration?: number; 
  customDescription?: string;
}

export interface VehicleItem {
  vehicleId: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface SupplyItem {
  supplyId: number;
  name: string;
  quantity: number;
  unitPrice: number; 
}

export interface MaterialItem {
  materialId: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface EquipmentItem {
  equipmentId: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface CrewItem {
  type: 'driver' | 'technician';
  quantity: number;
  dailySalary: number; 
}

export interface ExtraCostItem {
  description: string;
  amount: number;
}

export interface ServiceLogistics {
  origin: string;
  primaryDestination: string; 
  secondaryDestination?: string; 
  kilometers: number;
  fuelLiters: number;
  fuelPricePerLiter: number; 
  roadType?: RoadType;
  tolls?: number;
  totalTollCost?: number;
  viaticos: number; 
}

export interface ServiceItem {
  id: string; 
  activity: ActivityType;
  frequency: ServiceFrequencyDetail; 
  location: Location; 
  wastes: WasteItem[];
  vehicles: VehicleItem[];
  crew: CrewItem[];
  
  supplies: SupplyItem[];
  materials: MaterialItem[];   
  equipment: EquipmentItem[];  
  
  logistics: ServiceLogistics;
  extraCosts: ExtraCostItem[];
  trip?: any;
}

// 👇 Aquí está el QuoteDraft que se había perdido
export interface QuoteDraft {
  id?: string | number;  
  folio?: string;        
  replacesQuoteId?: number | string;
  clientName: string;
  clientRfc: string;
  contactName?: string;  
  contactPhone?: string;
  contactEmail?: string;
  validityDays: number;
  
  services: ServiceItem[];

  subtotal?: number;
  total?: number;
  
  createdAt: number;     
  status: QuoteStatus;
}

export interface QuoteSummary {
  id: number | string;
  folio: string;
  location: string;
  wastesSummary: string;
  createdAt: number;
  status: string;
}