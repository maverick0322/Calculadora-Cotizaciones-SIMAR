import { WorkerData, WorkerSummary } from '../../../shared/types/Worker';

export interface IWorkerRepository {
  save(worker: WorkerData): { lastInsertRowid: number | bigint };
  listActive(): WorkerSummary[];
}
