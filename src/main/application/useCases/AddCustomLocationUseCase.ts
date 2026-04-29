import { SqliteLocationRepository } from '../../infrastructure/database/repositories/SqliteLocationRepository';

export interface CustomLocationPayload {
  cp?: string;
  state: string;
  municipality: string;
  colony: string;
}

export class AddCustomLocationUseCase {
  constructor(private readonly repository: SqliteLocationRepository) {}

  execute(data: CustomLocationPayload) {
    if (!data.state || !data.municipality || !data.colony) {
      throw new Error("Estado, Municipio y Colonia son obligatorios para un nuevo registro.");
    }
    
    const cleanData = {
      cp: data.cp?.trim(),
      state: data.state.trim().toUpperCase(),
      municipality: data.municipality.trim().toUpperCase(),
      colony: data.colony.trim().toUpperCase()
    };

    return this.repository.addCustomLocation(cleanData);
  }
}