import { ipcMain } from 'electron';
import { SqliteLocationRepository } from '../infrastructure/database/repositories/SqliteLocationRepository';
import { GetLocationUseCase } from '../application/useCases/GetLocationUseCase';
import { AddCustomLocationUseCase } from '../application/useCases/AddCustomLocationUseCase';

export const registerLocationHandlers = () => {
  const repository = new SqliteLocationRepository();
  const getLocationUseCase = new GetLocationUseCase(repository);
  const addCustomLocationUseCase = new AddCustomLocationUseCase(repository);

  ipcMain.handle('get-locations', async (_, { action, payload }) => {
    try {
      return { success: true, data: getLocationUseCase.execute(action, payload) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('add-custom-location', async (_, data) => {
    try {
      return addCustomLocationUseCase.execute(data);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
};