import { SqliteResidueRepository, Residue } from '../../infrastructure/database/repositories/SqliteResidueRepository';

export class ManageResiduesUseCase {
  constructor(private readonly repository: SqliteResidueRepository) {}

  execute(action: 'add' | 'delete' | 'updatePrice' | 'get', payload?: any) {
    switch (action) {
      case 'get':
        return this.repository.getAllActive();
      case 'add':
        return this.repository.add(payload as Residue);
      case 'delete':
        return this.repository.delete(payload.id);
      case 'updatePrice':
        return this.repository.updatePrice(payload.id, payload.newPrice);
      default:
        throw new Error(`Acción ${action} no soportada en Residuos`);
    }
  }
}