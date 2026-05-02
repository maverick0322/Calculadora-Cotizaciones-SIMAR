import { useState } from 'react';
import { useResiduesCatalog, Residue } from './hooks/useResiduesCatalog';

// Opciones globales extraídas para no "ensuciar" el componente
const RESIDUE_TYPES = ['Peligroso', 'Manejo Especial (RME)', 'Sólido Urbano (RSU)', 'Reciclable', 'Biológico-Infeccioso (RPBI)', 'Otro'];
const UNIT_TYPES = ['Kilogramo', 'Tonelada', 'Metro Cúbico', 'Litro', 'Pieza', 'Contenedor', 'Viaje'];

export const ResiduesCatalogView = () => {
  // Consumimos nuestro Hook limpio
  const { residues, isLoading, error, addResidue, deleteResidue, updatePrice } = useResiduesCatalog();

  // Estados exclusivos de la UI (Formulario y Edición)
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newType || !newUnit || newPrice === '') return;

    const success = await addResidue({
      name: newName.trim().toUpperCase(),
      residue_type: newType,
      unit: newUnit,
      base_price: Number(newPrice)
    });

    if (success) {
      setNewName(''); setNewType(''); setNewUnit(''); setNewPrice('');
    }
  };

  const handleConfirmDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este residuo? Las cotizaciones históricas no se verán afectadas.')) {
      deleteResidue(id);
    }
  };

  const handleSavePrice = async (id: number) => {
    const success = await updatePrice(id, editPriceValue);
    if (success) setEditingId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Catálogo de Residuos</h1>
        <p className="text-gray-600 mt-1">Administra los tipos de residuos, unidades de medida y precios base.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>
      )}

      {/* FORMULARIO */}
      <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Agregar Nuevo Residuo</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select required value={newType} onChange={e => setNewType(e.target.value)} className="w-full px-3 py-2 border rounded-md">
              <option value="">Seleccionar...</option>
              {RESIDUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
            <select required value={newUnit} onChange={e => setNewUnit(e.target.value)} className="w-full px-3 py-2 border rounded-md">
              <option value="">Seleccionar...</option>
              {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base ($)</label>
            <input type="number" required min="0" step="0.01" value={newPrice} onChange={e => setNewPrice(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">Guardar</button>
          </div>
        </form>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Base</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Cargando...</td></tr>
            ) : residues.map((residue) => (
              <tr key={residue.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{residue.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{residue.residue_type}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{residue.unit}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {editingId === residue.id ? (
                    <input type="number" min="0" step="0.01" autoFocus value={editPriceValue} onChange={e => setEditPriceValue(Number(e.target.value))} className="w-24 px-2 py-1 border rounded" />
                  ) : `$${residue.base_price.toFixed(2)}`}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  {editingId === residue.id ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="text-gray-500">Cancelar</button>
                      <button onClick={() => handleSavePrice(residue.id)} className="text-green-600 font-semibold">Guardar</button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-4">
                      <button onClick={() => { setEditingId(residue.id); setEditPriceValue(residue.base_price); }} className="text-blue-600">Editar Precio</button>
                      <button onClick={() => handleConfirmDelete(residue.id)} className="text-red-600">Eliminar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};