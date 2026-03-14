// src/shared/types/Cotizacion.ts

export type TipoActividad = 'recoleccion' | 'transporte' | 'transferencia' | 'disposicion_final';
export type TipoResiduo = 'domestico' | 'organico' | 'reciclable' | 'peligroso' | 'voluminoso';
export type UnidadVolumen = 'kg' | 'ton' | 'm3' | 'contenedores' | 'viajes';

export interface Ubicacion {
  direccion: string;
  municipio: string;
  colonia: string;
  coordenadas?: string; // Opcional por ahora, para futura integración con Maps
}

// Este es el DTO (Data Transfer Object) principal para este Sprint
export interface CotizacionBorrador {
  id?: string;               // UUID generado por el Main (SQLite)
  folio?: string;            // Nulo mientras sea borrador
  ubicacion: Ubicacion;
  actividad: TipoActividad;
  residuo: TipoResiduo;
  volumenCantidad: number;
  volumenUnidad: UnidadVolumen;
  frecuencia: string;        // 'diaria', 'semanal', 'mensual', 'unico'
  fechaCreacion: number;     // Timestamp en milisegundos (mejor que Date para SQLite/IPC)
  estado: 'borrador' | 'emitida' | 'cancelada';
}