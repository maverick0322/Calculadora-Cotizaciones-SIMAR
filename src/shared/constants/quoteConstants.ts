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

export const QUOTE_TYPE_CODES = [
  'GIR',
  'MR',
  'RME',
  'RPBI',
  'RP',
  'MAT',
  'CAP',
  'AGA',
  'LE',
  'AC'
] as const;

export const QUOTE_TYPE_LABELS: Record<(typeof QUOTE_TYPE_CODES)[number], string> = {
  GIR: 'Gestión integral de residuos',
  MR: 'Manejo de residuos',
  RME: 'Recolección de RME',
  RPBI: 'Recolección de RPBI',
  RP: 'Recolección de RP',
  MAT: 'Venta de material, equipo e insumos',
  CAP: 'Capacitación',
  AGA: 'Asesoría y gestión ambiental',
  LE: 'Limpiezas ecológicas',
  AC: 'Acondicionamiento'
};

export const FOLIO_SEQUENCE_WIDTH = 3;
export const DEFAULT_CLIENT_INITIALS = 'CLI';
export const DEFAULT_WORKER_INITIALS = 'SIMAR';
export const MIN_FOLIO_LENGTH = 6;
export const MAX_FOLIO_LENGTH = 64;
export const FOLIO_ALLOWED_PATTERN = /^[A-Z0-9Ñ&._-]+$/i;

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
