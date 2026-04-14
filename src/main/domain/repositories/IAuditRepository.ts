export interface AuditLog {
  userId: number;
  action: string;
  entity: string;
  entityId?: string | number;
  details?: string;
  createdAt?: number;
}

export interface IAuditRepository {
  logAction(audit: AuditLog): void;
}