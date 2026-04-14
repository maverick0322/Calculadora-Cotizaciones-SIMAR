import { IAuditRepository, AuditLog } from '../../domain/repositories/IAuditRepository';

export class LogAuditActionUseCase {
  constructor(private readonly auditRepository: IAuditRepository) {}

  execute(audit: Omit<AuditLog, 'userId' | 'createdAt'>): void {
    try {
      this.auditRepository.logAction({
        ...audit,
        userId: 1,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error("⚠️ Fallo no crítico: No se pudo guardar la auditoría", error);
    }
  }
}