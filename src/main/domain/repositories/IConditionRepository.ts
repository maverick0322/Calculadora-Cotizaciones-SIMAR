import { ConditionType, QuoteCondition, QuoteConditionSelection, ServiceType } from '../../../shared/types/Quote';

export interface ConditionCatalogPayload {
  type: ConditionType;
  title: string;
  description: string;
  appliesToServiceTypes: ServiceType[];
}

export interface IConditionRepository {
  listActive(): QuoteCondition[];
  listActiveByServiceTypes(serviceTypes: ServiceType[]): QuoteCondition[];
  add(payload: ConditionCatalogPayload): number | bigint;
  update(id: number, payload: ConditionCatalogPayload): boolean;
  deactivate(id: number): boolean;
  saveQuoteSnapshot(quoteId: number, conditions: QuoteConditionSelection[]): void;
}
