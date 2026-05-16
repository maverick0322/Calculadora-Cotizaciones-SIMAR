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

  // Filtramos el catálogo global en las 3 categorías
  const catSupplies = catalogs?.supplies.filter(s => s.category === 'supply' || !s.category) || [];
  const catMaterials = catalogs?.supplies.filter(s => s.category === 'material') || [];
  const catEquipment = catalogs?.supplies.filter(s => s.category === 'equipment') || [];

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
        catalogs={catMaterials}
        type="materials"
        title="2. Materiales y Herramientas"
        subtitle="Contenedores, supersacos, tambores en préstamo, etc."
        colorScheme={{ bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100', lightBg: 'bg-purple-50/30', borderColor: 'border-purple-100' }}
      />

      <CatalogItemSection 
        serviceIndex={serviceIndex}
        catalogs={catEquipment}
        type="equipment"
        title="3. Maquinaria y Equipo"
        subtitle="Bombas, equipo de protección, montacargas, etc."
        colorScheme={{ bg: 'bg-teal-50', text: 'text-teal-700', hover: 'hover:bg-teal-100', lightBg: 'bg-teal-50/30', borderColor: 'border-teal-100' }}
      />

      <ExtraCostsSection serviceIndex={serviceIndex} />
      
    </div>
  );
};