import { CatalogData } from '../NewQuoteView';
import { CatalogItemSection } from './CatalogItemSection';
import { ExtraCostsSection } from './ExtraCostsSection';

interface SuppliesStepProps {
  serviceIndex: number;
  catalogs?: CatalogData & { 
    supplies: Array<{id: number, name: string, unit: string, suggested_price: number, category?: string}> 
  };
}

export const SuppliesStep = ({ serviceIndex, catalogs }: SuppliesStepProps) => {

  const catSupplies = catalogs?.supplies.filter(s => s.category === 'supply' || !s.category) || [];
  const catTools = catalogs?.supplies.filter(s => s.category === 'tool') || [];
  const catMaterials = catalogs?.supplies.filter(s => s.category === 'material') || [];
  const catEquipment = catalogs?.supplies.filter(s => s.category === 'equipment') || [];
  const catSpecializedEpp = catalogs?.supplies.filter(s => s.category === 'specialized_epp') || [];

  return (
    <div className="space-y-10 mb-8">
      
      <CatalogItemSection 
        serviceIndex={serviceIndex}
        catalogs={catSupplies}
        type="supplies"
        title="1. Insumos (Venta)"
        subtitle="Bolsas, etiquetas, consumibles, etc."
        colorScheme={{ bg: 'bg-blue-50', text: 'text-blue-700', hover: 'hover:bg-blue-100', lightBg: 'bg-gray-50', borderColor: 'border-gray-200' }}
      />

      <CatalogItemSection 
        serviceIndex={serviceIndex}
        catalogs={catTools}
        type="tools"
        title="2. Herramientas"
        subtitle="Herramientas manuales o especializadas requeridas por el servicio."
        colorScheme={{ bg: 'bg-amber-50', text: 'text-amber-700', hover: 'hover:bg-amber-100', lightBg: 'bg-amber-50/30', borderColor: 'border-amber-100' }}
      />

      <CatalogItemSection 
        serviceIndex={serviceIndex}
        catalogs={catMaterials}
        type="materials"
        title="3. Materiales"
        subtitle="Contenedores, supersacos, tambores en préstamo, etc."
        colorScheme={{ bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100', lightBg: 'bg-purple-50/30', borderColor: 'border-purple-100' }}
      />

      <CatalogItemSection 
        serviceIndex={serviceIndex}
        catalogs={catEquipment}
        type="equipment"
        title="4. Maquinaria y Equipo"
        subtitle="Bombas, montacargas, equipo operativo, etc."
        colorScheme={{ bg: 'bg-teal-50', text: 'text-teal-700', hover: 'hover:bg-teal-100', lightBg: 'bg-teal-50/30', borderColor: 'border-teal-100' }}
      />

      <CatalogItemSection
        serviceIndex={serviceIndex}
        catalogs={catSpecializedEpp}
        type="specializedEpp"
        title="5. Equipo de Protección Personal Especializado (EPP)"
        subtitle="EPP especializado requerido por riesgo o tipo de operación."
        colorScheme={{ bg: 'bg-red-50', text: 'text-red-700', hover: 'hover:bg-red-100', lightBg: 'bg-red-50/30', borderColor: 'border-red-100' }}
      />

      <ExtraCostsSection serviceIndex={serviceIndex} />
      
    </div>
  );
};
