import { IConditionRepository } from '../../domain/repositories/IConditionRepository';
import { ConditionType, ServiceType } from '../../../shared/types/Quote';
import { logger } from '../../infrastructure/logging/SafeLogger';

type ConditionAction = 'list' | 'add' | 'edit' | 'delete';

interface ManageConditionPayload {
  id?: number;
  type?: ConditionType;
  title?: string;
  description?: string;
  appliesToServiceTypes?: ServiceType[];
  serviceTypes?: ServiceType[];
}

const MIN_CONDITION_TEXT_LENGTH = 3;

export class ManageConditionsUseCase {
  constructor(private readonly conditionRepository: IConditionRepository) {}

  execute(action: ConditionAction, payload: ManageConditionPayload = {}) {
    try {
      if (action === 'list') {
        const data = payload.serviceTypes
          ? this.conditionRepository.listActiveByServiceTypes(payload.serviceTypes)
          : this.conditionRepository.listActive();
        return { success: true, data };
      }

      if (action === 'add') {
        const validPayload = this.validateCatalogPayload(payload);
        return { success: true, id: this.conditionRepository.add(validPayload) };
      }

      if (action === 'edit') {
        const id = this.validateId(payload.id);
        const validPayload = this.validateCatalogPayload(payload);
        return { success: true, changes: this.conditionRepository.update(id, validPayload) ? 1 : 0 };
      }

      if (action === 'delete') {
        const id = this.validateId(payload.id);
        return { success: true, changes: this.conditionRepository.deactivate(id) ? 1 : 0 };
      }

      return { success: false, error: 'La acción solicitada para condiciones no existe.' };
    } catch (error) {
      if (error instanceof Error) {
        logger.warn('Operación de condiciones rechazada por validación');
        return { success: false, error: error.message };
      }

      logger.error('Error inesperado al administrar condiciones', { error });
      return { success: false, error: 'Error inesperado al administrar condiciones.' };
    }
  }

  private validateCatalogPayload(payload: ManageConditionPayload) {
    if (payload.type !== 'commercial' && payload.type !== 'technical') {
      throw new Error('El tipo de condición es obligatorio.');
    }

    if (!payload.title || payload.title.trim().length < MIN_CONDITION_TEXT_LENGTH) {
      throw new Error('El título de la condición es obligatorio.');
    }

    if (!payload.description || payload.description.trim().length < MIN_CONDITION_TEXT_LENGTH) {
      throw new Error('La descripción de la condición es obligatoria.');
    }

    return {
      type: payload.type,
      title: payload.title,
      description: payload.description,
      appliesToServiceTypes: payload.appliesToServiceTypes ?? []
    };
  }

  private validateId(id?: number): number {
    if (!id || id <= 0) {
      throw new Error('El identificador de la condición es obligatorio.');
    }

    return id;
  }
}
