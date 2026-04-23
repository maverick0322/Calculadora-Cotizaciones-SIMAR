import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogAuditActionUseCase } from '../../../main/application/useCases/LogAuditActionUseCase';
import { IAuditRepository } from '../../../main/domain/repositories/IAuditRepository';

describe('LogAuditActionUseCase', () => {
  let mockRepository: IAuditRepository;
  let useCase: LogAuditActionUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = {
      logAction: vi.fn()
    };
    useCase = new LogAuditActionUseCase(mockRepository);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should inject userId and createdAt, and call the repository', () => {
    const auditData = {
      action: 'UPDATE',
      entity: 'QUOTE',
      entityId: 10,
      details: 'Updated price'
    };

    useCase.execute(auditData);

    expect(mockRepository.logAction).toHaveBeenCalledTimes(1);
    expect(mockRepository.logAction).toHaveBeenCalledWith({
      ...auditData,
      userId: 1, // Verifica que inyecte el ID duro por ahora
      createdAt: expect.any(Number) // Verifica que genere un timestamp numérico
    });
  });

  it('should catch errors and log a non-critical warning without throwing', () => {
    vi.mocked(mockRepository.logAction).mockImplementation(() => {
      throw new Error('Database disconnected');
    });

    const auditData = { action: 'DELETE', entity: 'USER' };

    // Si lanzara el error, esta línea haría explotar el test.
    // Como lo atrapamos con try/catch, el test pasa limpiamente.
    expect(() => useCase.execute(auditData)).not.toThrow();

    // Verificamos que sí dejó rastro en la consola
    expect(console.error).toHaveBeenCalledWith(
      "⚠️ Fallo no crítico: No se pudo guardar la auditoría",
      expect.any(Error)
    );
  });
});