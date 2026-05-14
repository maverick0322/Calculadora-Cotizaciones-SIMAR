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
  // 👇 Nuevos campos para RME y catálogos avanzados
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
  unitPrice: number; // Precio sugerido editable
}

export interface CrewItem {
  type: 'driver' | 'technician';
  quantity: number;
  dailySalary: number; // Salario editable para cálculo rápido
}

export interface ExtraCostItem {
  description: string;
  amount: number;
}

export interface ServiceLogistics {
  origin: string;
  primaryDestination: string; // Ej. Almacén SIMAR
  secondaryDestination?: string; // Tercer lugar opcional
  kilometers: number;
  fuelLiters: number;
  fuelPricePerLiter: number; // Costo de combustible editable
  roadType?: RoadType;
  tolls?: number;
  totalTollCost?: number;
  viaticos: number; // Gastos de viaje ocultos al cliente
}

export interface ServiceItem {
  id: string; // UUID local para que React Hook Form iteré correctamente
  activity: ActivityType;
  
  // 👇 La frecuencia ahora pertenece a cada servicio individualmente
  frequency: ServiceFrequencyDetail; 
  
  location: Location; // Cada servicio puede tener una dirección distinta
  wastes: WasteItem[];
  vehicles: VehicleItem[];
  crew: CrewItem[];
  supplies: SupplyItem[];
  logistics: ServiceLogistics;
  extraCosts: ExtraCostItem[];
  trip?: any;
}

// --- FIN NUEVAS INTERFACES ---

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
  
  // ❌ La frecuencia global fue eliminada de aquí
  
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