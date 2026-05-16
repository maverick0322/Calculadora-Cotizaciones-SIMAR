import { useState, useEffect } from 'react';
import { CatalogData } from '../cotizacion/NewQuoteView';
import { Settings, Plus, Trash2, Truck, Package, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const VEHICLE_TYPES = ['Ligero', 'Mediano', 'Pesado', 'Especial'];
const SUPPLY_CATEGORIES = [
  { value: 'supply', label: 'Insumo (Consumible)' },
  { value: 'material', label: 'Material (Contenedores/Préstamo)' },
  { value: 'equipment', label: 'Maquinaria / Equipo' }
];

export const CatalogSettingsView = () => {
  const [catalogs, setCatalogs] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados locales actualizados a la nueva estructura
  const [newVehicle, setNewVehicle] = useState({
    plate: '', name: '', vehicleType: 'Pesado',
    usefulTonnage: 3.0, volumeM3: 15, drumCapacity: 75,
    pricePerDay: 0, pricePerTon: 0, pricePerM3: 0
  });
  
  const [newSupply, setNewSupply] = useState({ 
    name: '', category: 'supply', unit: 'pieza', suggestedPrice: 0 
  });
  
  const [newWarehouse, setNewWarehouse] = useState({ name: '', address: '' });

  const load = async () => {
    setLoading(true);
    const res = await window.api.getCatalogs();
    if (res.success) setCatalogs(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Calculadora automática: 1 tambor = 0.2 m3 (Reactivo)
  useEffect(() => {
    if (newVehicle.volumeM3 > 0) {
      setNewVehicle(prev => ({ ...prev, drumCapacity: Math.floor(prev.volumeM3 / 0.2) }));
    } else {
      setNewVehicle(prev => ({ ...prev, drumCapacity: 0 }));
    }
  }, [newVehicle.volumeM3]);

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
          if (type === 'vehicle') setNewVehicle({ plate: '', name: '', vehicleType: 'Pesado', usefulTonnage: 3.0, volumeM3: 15, drumCapacity: 75, pricePerDay: 0, pricePerTon: 0, pricePerM3: 0 });
          if (type === 'supply') setNewSupply({ name: '', category: 'supply', unit: 'pieza', suggestedPrice: 0 });
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
          <span className="flex items-center gap-2"><Truck /> Vehículos y Flota Operativa</span>
        </h3>
        
        {/* Formulario Agregar Vehículo (Rediseñado en Cuadrícula) */}
        <div className="bg-blue-50/50 p-5 rounded-lg mb-6 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Clave/Placa</label>
              <input type="text" value={newVehicle.plate} onChange={e => setNewVehicle({...newVehicle, plate: e.target.value})} className="w-full p-2 border rounded text-sm uppercase" placeholder="Ej. XY-123" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre / Modelo</label>
              <input type="text" value={newVehicle.name} onChange={e => setNewVehicle({...newVehicle, name: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Ej. Tractocamión Tolva" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
              <select value={newVehicle.vehicleType} onChange={e => setNewVehicle({...newVehicle, vehicleType: e.target.value})} className="w-full p-2 border rounded text-sm bg-white">
                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Carga Útil (Ton)</label>
              <input type="number" step="0.1" value={newVehicle.usefulTonnage} onChange={e => setNewVehicle({...newVehicle, usefulTonnage: Number(e.target.value)})} className="w-full p-2 border rounded text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-blue-700 mb-1">Volumen Caja (m³)</label>
              <input type="number" step="0.1" value={newVehicle.volumeM3} onChange={e => setNewVehicle({...newVehicle, volumeM3: Number(e.target.value)})} className="w-full p-2 border rounded border-blue-300 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Tambores (Auto)</label>
              <input type="number" readOnly value={newVehicle.drumCapacity} className="w-full p-2 border rounded bg-gray-100 text-gray-500 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio x Hora ($)</label>
              <input type="number" step="0.01" value={newVehicle.pricePerDay} onChange={e => setNewVehicle({...newVehicle, pricePerDay: Number(e.target.value)})} className="w-full p-2 border rounded text-sm font-semibold" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio x Ton ($)</label>
              <input type="number" step="0.01" value={newVehicle.pricePerTon} onChange={e => setNewVehicle({...newVehicle, pricePerTon: Number(e.target.value)})} className="w-full p-2 border rounded text-sm" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio x m³ ($)</label>
              <input type="number" step="0.01" value={newVehicle.pricePerM3} onChange={e => setNewVehicle({...newVehicle, pricePerM3: Number(e.target.value)})} className="w-full p-2 border rounded text-sm" />
            </div>
            <div className="md:col-span-1 flex justify-end">
              <button 
                disabled={!newVehicle.name || !newVehicle.plate}
                onClick={() => executeAction('add', 'vehicle', newVehicle)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Agregar Unidad
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Vehículos */}
        <div className="grid gap-2">
          {catalogs?.vehicles.map(v => (
            <div key={v.id} className="flex items-center justify-between p-4 hover:bg-gray-50 border border-gray-100 rounded-lg transition-colors">
              <div>
                <p className="font-bold text-gray-800">{v.name} <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded ml-2">{v.plate}</span></p>
                <p className="text-xs text-gray-500 mt-1">
                  📦 {v.useful_tonnage} Ton | {v.volume_m3} m³ ({v.drum_capacity} tambores)
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  💵 x Hora: ${v.price_per_day} | x Ton: ${v.price_per_ton} | x m³: ${v.price_per_m3}
                </p>
              </div>
              <button onClick={() => executeAction('delete', 'vehicle', { id: v.id })} className="text-gray-400 hover:text-red-500 p-2">
                <Trash2 className="w-5 h-5" />
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
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-orange-50/50 p-4 rounded-lg mb-6 border border-orange-100">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del Elemento</label>
            <input type="text" value={newSupply.name} onChange={e => setNewSupply({...newSupply, name: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Ej. Tambo 200L" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
            <select value={newSupply.category} onChange={e => setNewSupply({...newSupply, category: e.target.value})} className="w-full p-2 border rounded text-sm bg-white">
              {SUPPLY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Unidad</label>
            <input type="text" value={newSupply.unit} onChange={e => setNewSupply({...newSupply, unit: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Ej. pieza" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Precio ($)</label>
            <input type="number" step="0.01" value={newSupply.suggestedPrice} onChange={e => setNewSupply({...newSupply, suggestedPrice: Number(e.target.value)})} className="w-full p-2 border rounded text-sm" />
          </div>
          <div className="md:col-span-5 flex justify-end mt-2">
            <button 
              disabled={!newSupply.name}
              onClick={() => executeAction('add', 'supply', newSupply)}
              className="bg-orange-600 text-white px-6 py-2 rounded font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Agregar al Catálogo
            </button>
          </div>
        </div>

        <div className="grid gap-2">
          {catalogs?.supplies.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-0 transition-colors">
              <div>
                <p className="font-medium text-gray-800">{s.name}</p>
                <p className="text-xs text-gray-500">
                  <span className="capitalize font-semibold text-orange-700">{s.category || 'Insumo'}</span> | Se vende por: {s.unit} | Precio: ${s.suggested_price.toLocaleString()}
                </p>
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