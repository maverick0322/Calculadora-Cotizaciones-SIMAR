import { ipcMain } from 'electron';
import { SqliteResidueRepository } from '../infrastructure/database/repositories/SqliteResidueRepository';
import { ManageResiduesUseCase } from '../application/useCases/ManageResiduesUseCase';
import db from '../infrastructure/database/sqliteClient';

export const registerResidueHandlers = () => {
  const repository = new SqliteResidueRepository(db);
  const useCase = new ManageResiduesUseCase(repository);

  ipcMain.handle('residues:manage', async (_, { action, payload }) => {
    try {
      const result = useCase.execute(action, payload);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
};