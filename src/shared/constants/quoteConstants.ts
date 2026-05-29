export const IVA_RATE = 0.16;

export const DEFAULT_VALIDITY_DAYS = 15;
export const STANDARD_VALIDITY_DAYS = [15, 30] as const;
export const MIN_CUSTOM_VALIDITY_DAYS = 1;

export const QUOTE_STATUS_FLOW = ['en_proceso', 'terminada', 'autorizada', 'emitida'] as const;
export const LEGACY_QUOTE_STATUS = ['draft', 'issued', 'cancelled', 'replaced'] as const;

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  en_proceso: 'En proceso',
  terminada: 'Terminada',
  autorizada: 'Autorizada',
  emitida: 'Emitida',
  draft: 'En proceso',
  issued: 'Emitida',
  cancelled: 'Cancelada',
  replaced: 'Reemplazada'
};

export const SERVICE_TYPES = [
  'rme',
  'hazardous_waste',
  'rpbi',
  'material_sale',
  'training',
  'environmental_consulting',
  'ecological_cleaning',
  'conditioning'
] as const;

export const SERVICE_TYPE_LABELS: Record<(typeof SERVICE_TYPES)[number], string> = {
  rme: 'Residuos de Manejo Especial (RME)',
  hazardous_waste: 'Residuos peligrosos',
  rpbi: 'Residuos Peligrosos Biológico-Infecciosos (RPBI)',
  material_sale: 'Venta de material, equipo e insumos',
  training: 'Capacitación',
  environmental_consulting: 'Asesoría y gestión ambiental',
  ecological_cleaning: 'Limpiezas ecológicas',
  conditioning: 'Acondicionamiento'
};

export const RESIDUE_SERVICE_TYPES = ['rme', 'hazardous_waste', 'rpbi'] as const;

export const CATALOG_SUPPLY_CATEGORIES = ['supply', 'tool', 'material', 'equipment', 'specialized_epp'] as const;

export const CREW_CATEGORIES = ['coordinator', 'operator', 'technician'] as const;

export const TRAINING_MODALITIES = ['online', 'in_person'] as const;

export const TRAINING_EDUCATION_LEVELS = [
  'basic',
  'middle_high',
  'higher',
  'operational',
  'administrative'
] as const;

export const VEHICLE_DRUM_VOLUME_M3 = 0.2;
