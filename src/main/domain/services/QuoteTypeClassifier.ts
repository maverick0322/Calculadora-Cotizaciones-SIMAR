import { RESIDUE_SERVICE_TYPES } from '../../../shared/constants/quoteConstants';
import { QuoteTypeCode, ServiceItem, ServiceType } from '../../../shared/types/Quote';

const WASTE_TYPE_TO_QUOTE_CODE: Partial<Record<ServiceType, QuoteTypeCode>> = {
  rme: 'RME',
  hazardous_waste: 'RP',
  rpbi: 'RPBI'
};

const SINGLE_SERVICE_TYPE_TO_QUOTE_CODE: Partial<Record<ServiceType, QuoteTypeCode>> = {
  material_sale: 'MAT',
  training: 'CAP',
  environmental_consulting: 'AGA',
  ecological_cleaning: 'LE',
  conditioning: 'AC'
};

const GIR_MINIMUM_SERVICE_TYPES = ['rme', 'hazardous_waste', 'rpbi'] as const;
const MR_SUPPORT_SERVICE_TYPES = ['training', 'environmental_consulting', 'ecological_cleaning'] as const;
const RPBI_GIR_SERVICE_TYPES = ['rpbi', 'material_sale', 'environmental_consulting', 'training'] as const;

export class QuoteTypeClassifier {
  classify(services: ServiceItem[]): QuoteTypeCode {
    const serviceTypes = new Set(services.map((service) => service.serviceType));

    if (
      this.isRpbiIntegralManagement(serviceTypes) ||
      this.hasAllResidueServices(serviceTypes) ||
      this.hasResidueWithTrainingAndConsulting(serviceTypes)
    ) {
      return 'GIR';
    }

    if (this.isResidueManagement(serviceTypes)) {
      return 'MR';
    }

    if (services.length === 1) {
      return this.classifySingleService(services[0].serviceType);
    }

    return this.classifySingleService(services[0]?.serviceType);
  }

  private hasAllResidueServices(serviceTypes: Set<ServiceType>): boolean {
    return GIR_MINIMUM_SERVICE_TYPES.every((serviceType) => serviceTypes.has(serviceType));
  }

  private isRpbiIntegralManagement(serviceTypes: Set<ServiceType>): boolean {
    return RPBI_GIR_SERVICE_TYPES.every((serviceType) => serviceTypes.has(serviceType));
  }

  private isResidueManagement(serviceTypes: Set<ServiceType>): boolean {
    const hasResidue = RESIDUE_SERVICE_TYPES.some((serviceType) => serviceTypes.has(serviceType));
    const hasSupportService = MR_SUPPORT_SERVICE_TYPES.some((serviceType) => serviceTypes.has(serviceType));
    return hasResidue && hasSupportService;
  }

  private hasResidueWithTrainingAndConsulting(serviceTypes: Set<ServiceType>): boolean {
    const hasResidue = RESIDUE_SERVICE_TYPES.some((serviceType) => serviceTypes.has(serviceType));
    return hasResidue && serviceTypes.has('training') && serviceTypes.has('environmental_consulting');
  }

  private classifySingleService(serviceType?: ServiceType): QuoteTypeCode {
    if (!serviceType) return 'MR';

    if (RESIDUE_SERVICE_TYPES.includes(serviceType as (typeof RESIDUE_SERVICE_TYPES)[number])) {
      return WASTE_TYPE_TO_QUOTE_CODE[serviceType] ?? 'MR';
    }

    return SINGLE_SERVICE_TYPE_TO_QUOTE_CODE[serviceType] ?? 'MR';
  }
}
