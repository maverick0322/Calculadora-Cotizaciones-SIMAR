import { useState, useEffect } from 'react';
import { CatalogData } from '../cotizacion/NewQuoteView';
import { Settings, Save, Truck, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export const CatalogSettingsView = () => {
  const [catalogs, setCatalogs] = useState<CatalogData | null>(null);

  const load = async () => {
    const res = await window.api.getCatalogs();
    if (res.success) setCatalogs(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (type: 'vehicle' | 'supply', id: number, price: number) => {
    const res = await window.api.updateCatalogPrice(type, id, price);
    if (res.changes > 0) {
      toast.success('Precio base actualizado');
      load();
    }
  };

  if (!catalogs) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold flex items-center gap-2 border-b pb-4">
        <Settings className="w-6 h-6 text-gray-600" />
        Configuración de Precios Predeterminados
      </h2>

      <section>
        <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-4"><Truck /> Vehículos (Precio Base por Viaje)</h3>
        <div className="grid gap-3">
          {catalogs.vehicles.map(v => (
            <div key={v.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
              <span>{v.name}</span>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  defaultValue={v.base_price} 
                  onBlur={(e) => handleUpdate('vehicle', v.id, Number(e.target.value))}
                  className="w-32 p-2 border rounded text-right font-mono"
                />
                <span className="text-gray-400 text-sm">MXN</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-4"><Package /> Insumos (Precio Sugerido)</h3>
        <div className="grid gap-3">
          {catalogs.supplies.map(s => (
            <div key={s.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
              <span>{s.name} ({s.unit})</span>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  defaultValue={s.suggested_price} 
                  onBlur={(e) => handleUpdate('supply', s.id, Number(e.target.value))}
                  className="w-32 p-2 border rounded text-right font-mono"
                />
                <span className="text-gray-400 text-sm">MXN</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};