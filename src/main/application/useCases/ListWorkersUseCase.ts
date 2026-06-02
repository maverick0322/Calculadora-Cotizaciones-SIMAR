import { IWorkerRepository } from '../../domain/repositories/IWorkerRepository';
import { WorkerSummary } from '../../../shared/types/Worker';
import { logger } from '../../infrastructure/logging/SafeLogger';

export class ListWorkersUseCase {
  constructor(private readonly workerRepository: IWorkerRepository) {}

  execute(): { success: boolean; data?: WorkerSummary[]; error?: string } {
    try {
      return { success: true, data: this.workerRepository.listActive() };
    } catch (error) {
      logger.error('Error inesperado al listar empleados', { error });
      return { success: false, error: 'Error inesperado al listar empleados.' };
    }
  }
}
