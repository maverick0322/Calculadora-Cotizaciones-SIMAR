import { SqliteLocationRepository } from '../../infrastructure/database/repositories/SqliteLocationRepository';

export class GetLocationUseCase {
  constructor(private readonly repository: SqliteLocationRepository) {}

  execute(action: 'states' | 'municipalities' | 'colonies' | 'byCP', payload?: any) {
    try {
      if (action === 'states') {
        return this.repository.getStates();
      }
      if (action === 'municipalities') {
        if (!payload?.state) throw new Error("Se requiere el Estado");
        return this.repository.getMunicipalitiesByState(payload.state);
      }
      if (action === 'colonies') {
        if (!payload?.state || !payload?.municipality) throw new Error("Se requiere Estado y Municipio");
        return this.repository.getColonies(payload.state, payload.municipality);
      }
      if (action === 'byCP') {
        if (!payload?.cp) throw new Error("Se requiere el Código Postal");
        return this.repository.getLocationByCP(payload.cp);
      }

      throw new Error('Acción de localización no soportada');
    } catch (error) {
      console.error(`Error en GetLocationUseCase (${action}):`, error);
      throw error;
    }
  }
}