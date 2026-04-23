import { useState, useEffect } from 'react';
import { CatalogData } from '../cotizacion/NewQuoteView';
import { Settings, Plus, Trash2, Truck, Package, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export const CatalogSettingsView = () => {
  const [catalogs, setCatalogs] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados locales para los formularios de "Agregar Nuevo"
  const [newVehicle, setNewVehicle] = useState({ name: '', capacityKg: 0, basePrice: 0 });
  const [newSupply, setNewSupply] = useState({ name: '', unit: 'pieza', suggestedPrice: 0 });
  const [newWarehouse, setNewWarehouse] = useState({ name: '', address: '' });

  const load = async () => {
    setLoading(true);
    const res = await window.api.getCatalogs();
    if (res.success) setCatalogs(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Función maestra para hablar con el Backend
  const executeAction = async (action: 'add' | 'delete', type: 'vehicle' | 'supply' | 'warehouse', payload: any) => {
    const toastId = toast.loading(`${action === 'add' ? 'Agregando' : 'Eliminando'}...`);
    try {
      const res = await window.api.manageCatalog(action, type, payload);
      if (res.success) {
        toast.success('Operación exitosa', { id: toastId });
        load(); // Recargamos para ver los cambios
        
        // Limpiamos los formularios si fue un "add"
        if (action === 'add') {
          if (type === 'vehicle') setNewVehicle({ name: '', capacityKg: 0, basePrice: 0 });
          if (type === 'supply') setNewSupply({ name: '', unit: 'pieza', suggestedPrice: 0 });
          if (type === 'warehouse') setNewWarehouse({ name: '', address: '' });
        }
      } else {
        toast.error(`Error: ${res.error}`, { id: toastId });
      }
    } catch (error) {
      toast.error('Error de conexión', { id: toastId });
    }
  };

  if (!catalogs && !loading) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10 animate-in fade-in">
      <h2 className="text-2xl font-bold flex items-center gap-2 border-b pb-4">
        <Settings className="w-6 h-6 text-gray-600" />
        Configuración de Catálogos Maestros
      </h2>

      {/* ========================================== */}
      {/* SECCIÓN VEHÍCULOS */}
      {/* ========================================== */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="flex items-center justify-between font-semibold text-gray-800 mb-6">
          <span className="flex items-center gap-2"><Truck /> Vehículos y Flota</span>
        </h3>
        
        {/* Formulario Agregar Vehículo */}
        <div className="flex gap-4 items-end bg-blue-50/50 p-4 rounded-lg mb-6 border border-blue-100">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre / Modelo</label>
            <input type="text" value={newVehicle.name} onChange={e => setNewVehicle({...newVehicle, name: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Ej. Tractocamión con Tolva" />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">Capacidad (Kg)</label>
            <input type="number" value={newVehicle.capacityKg} onChange={e => setNewVehicle({...newVehicle, capacityKg: Number(e.target.value)})} className="w-full p-2 border rounded text-sm" />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">Precio Base ($)</label>
            <input type="number" value={newVehicle.basePrice} onChange={e => setNewVehicle({...newVehicle, basePrice: Number(e.target.value)})} className="w-full p-2 border rounded text-sm" />
          </div>
          <button 
            disabled={!newVehicle.name}
            onClick={() => executeAction('add', 'vehicle', { ...newVehicle, vehicleType: 'generic' })}
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        {/* Lista de Vehículos */}
        <div className="grid gap-2">
          {catalogs?.vehicles.map(v => (
            <div key={v.id} className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-0 transition-colors">
              <div>
                <p className="font-medium text-gray-800">{v.name}</p>
                <p className="text-xs text-gray-500">Capacidad: {v.capacity_kg} kg | Base: ${v.base_price.toLocaleString()}</p>
              </div>
              <button onClick={() => executeAction('delete', 'vehicle', { id: v.id })} className="text-gray-400 hover:text-red-500 p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* SECCIÓN INSUMOS */}
      {/* ========================================== */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-6"><Package /> Insumos y Materiales</h3>
        
        <div className="flex gap-4 items-end bg-orange-50/50 p-4 rounded-lg mb-6 border border-orange-100">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del Insumo</label>
            <input type="text" value={newSupply.name} onChange={e => setNewSupply({...newSupply, name: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Ej. Tambo 200L" />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">Unidad</label>
            <input type="text" value={newSupply.unit} onChange={e => setNewSupply({...newSupply, unit: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Ej. pieza" />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">Precio Sugerido ($)</label>
            <input type="number" value={newSupply.suggestedPrice} onChange={e => setNewSupply({...newSupply, suggestedPrice: Number(e.target.value)})} className="w-full p-2 border rounded text-sm" />
          </div>
          <button 
            disabled={!newSupply.name}
            onClick={() => executeAction('add', 'supply', newSupply)}
            className="bg-orange-600 text-white px-4 py-2 rounded font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        <div className="grid gap-2">
          {catalogs?.supplies.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-0 transition-colors">
              <div>
                <p className="font-medium text-gray-800">{s.name}</p>
                <p className="text-xs text-gray-500">Se vende por: {s.unit} | Precio Sugerido: ${s.suggested_price.toLocaleString()}</p>
              </div>
              <button onClick={() => executeAction('delete', 'supply', { id: s.id })} className="text-gray-400 hover:text-red-500 p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* SECCIÓN ALMACENES */}
      {/* ========================================== */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-6"><MapPin /> Almacenes de Destino</h3>
        
        <div className="flex gap-4 items-end bg-green-50/50 p-4 rounded-lg mb-6 border border-green-100">
          <div className="w-1/3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre Corto</label>
            <input type="text" value={newWarehouse.name} onChange={e => setNewWarehouse({...newWarehouse, name: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Ej. Patio SIMAR Sur" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Dirección Completa</label>
            <input type="text" value={newWarehouse.address} onChange={e => setNewWarehouse({...newWarehouse, address: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Av. Principal #123, Colonia..." />
          </div>
          <button 
            disabled={!newWarehouse.name}
            onClick={() => executeAction('add', 'warehouse', newWarehouse)}
            className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        <div className="grid gap-2">
          {catalogs?.warehouses.map(w => (
            <div key={w.id} className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-0 transition-colors">
              <div>
                <p className="font-medium text-gray-800">{w.name}</p>
                <p className="text-xs text-gray-500">{w.address}</p>
              </div>
              <button onClick={() => executeAction('delete', 'warehouse', { id: w.id })} className="text-gray-400 hover:text-red-500 p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};