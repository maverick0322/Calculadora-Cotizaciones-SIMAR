import {
  CATALOG_SUPPLY_CATEGORIES,
  CREW_CATEGORIES,
  LEGACY_QUOTE_STATUS,
  QUOTE_STATUS_FLOW,
  QUOTE_TYPE_CODES,
  SERVICE_TYPES,
  TRAINING_EDUCATION_LEVELS,
  TRAINING_MODALITIES
} from '../constants/quoteConstants';

export type ActivityType = 'collection' | 'transport' | 'transfer' | 'final_disposal';
export type WasteType = 'domestic' | 'organic' | 'recyclable' | 'hazardous' | 'bulky';
export type ServiceFrequencyType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'one_time' | 'custom';
export type CurrentQuoteStatus = (typeof QUOTE_STATUS_FLOW)[number];
export type LegacyQuoteStatus = (typeof LEGACY_QUOTE_STATUS)[number];
export type QuoteStatus = CurrentQuoteStatus | LegacyQuoteStatus;
export type QuoteTypeCode = (typeof QUOTE_TYPE_CODES)[number];
export type RoadType = 'free' | 'toll';
export type ServiceType = (typeof SERVICE_TYPES)[number];
export type CatalogSupplyCategory = (typeof CATALOG_SUPPLY_CATEGORIES)[number] | 'warehouse';
export type CrewCategory = (typeof CREW_CATEGORIES)[number] | 'driver';
export type TrainingModality = (typeof TRAINING_MODALITIES)[number];
export type TrainingEducationLevel = (typeof TRAINING_EDUCATION_LEVELS)[number];

export interface Location {
  cp?: string;
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

export interface CatalogQuoteItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface SupplyItem extends CatalogQuoteItem {
  supplyId: number;
}

export interface MaterialItem extends CatalogQuoteItem {
  materialId: number;
}

export interface EquipmentItem extends CatalogQuoteItem {
  equipmentId: number;
}

export interface ToolItem extends CatalogQuoteItem {
  toolId: number;
}

export interface SpecializedEppItem extends CatalogQuoteItem {
  specializedEppId: number;
}

export interface CrewItem {
  type: CrewCategory;
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

export interface EcologicalCleaningDetails {
  gasStationName: string;
  location: Location;
  surfaceM2: number;
  viaticos: number;
  hours: number;
  hourlyUnitPrice: number;
  labor: ExtraCostItem[];
  technicianCount: number;
}

export interface TrainingStationeryItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface TrainingTravelExpenses {
  travel: number;
  tolls: number;
  lodging: number;
  food: number;
  taxis: number;
}

export interface TrainingDetails {
  attendeeCount: number;
  educationLevels: TrainingEducationLevel[];
  objective: string;
  modality: TrainingModality;
  location?: Location;
  hours: number;
  hourlyUnitPrice: number;
  stationery: TrainingStationeryItem[];
  travelExpenses?: TrainingTravelExpenses;
}

export interface ConditioningDetails {
  labor: ExtraCostItem[];
}

export interface ServiceItem {
  id: string;
  serviceType: ServiceType;
  activity: ActivityType;
  frequency: ServiceFrequencyDetail;
  location: Location;
  wastes: WasteItem[];
  vehicles: VehicleItem[];
  crew: CrewItem[];
  supplies: SupplyItem[];
  tools: ToolItem[];
  materials: MaterialItem[];
  equipment: EquipmentItem[];
  specializedEpp: SpecializedEppItem[];
  logistics: ServiceLogistics;
  extraCosts: ExtraCostItem[];
  ecologicalCleaning?: EcologicalCleaningDetails;
  training?: TrainingDetails;
  conditioning?: ConditioningDetails;
  trip?: unknown;
}

export interface QuoteDraft {
  id?: string | number;
  folio?: string;
  quoteTypeCode?: QuoteTypeCode;
  issuedAt?: number;
  preparedByUserId?: number;
  preparedByInitials?: string;
  conditions?: QuoteConditionSelection[];
  replacesQuoteId?: number | string;
  personType?: 'fisica' | 'moral';
  commercialName?: string;
  clientName: string;
  clientRfc: string;
  contactName?: string;
  contactPosition?: string;
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

export type ConditionType = 'commercial' | 'technical';

export interface QuoteCondition {
  id: number;
  type: ConditionType;
  title: string;
  description: string;
  appliesToServiceTypes: ServiceType[];
  isActive: boolean;
}

export interface QuoteConditionSelection {
  conditionId?: number;
  type: ConditionType;
  title: string;
  description: string;
  isCustom: boolean;
}

export interface QuoteFolioSuggestion {
  folio: string;
  sequence: number;
  quoteTypeCode: QuoteTypeCode;
  preparedByInitials: string;
  clientInitials: string;
}

export interface IssueQuoteRequest {
  quoteId: number;
  folio: string;
  preparedByUserId: number;
  preparedByInitials: string;
  quoteTypeCode: QuoteTypeCode;
  conditions: QuoteConditionSelection[];
}

export interface ApiResult<T = void> {
  success: boolean;
  id?: number | bigint;
  data?: T;
  error?: string;
  details?: unknown;
}
