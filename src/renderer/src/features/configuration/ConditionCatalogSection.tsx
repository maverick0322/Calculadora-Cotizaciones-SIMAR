import { useEffect, useState } from 'react';
import { Edit2, FileText, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { SERVICE_TYPE_LABELS, SERVICE_TYPES } from '../../../../shared/constants/quoteConstants';
import { ConditionType, QuoteCondition, ServiceType } from '../../../../shared/types/Quote';

interface ConditionFormState {
  type: ConditionType;
  title: string;
  description: string;
  appliesToServiceTypes: ServiceType[];
}

const DEFAULT_FORM_STATE: ConditionFormState = {
  type: 'commercial',
  title: '',
  description: '',
  appliesToServiceTypes: []
};

export const ConditionCatalogSection = () => {
  const [conditions, setConditions] = useState<QuoteCondition[]>([]);
  const [formData, setFormData] = useState<ConditionFormState>(DEFAULT_FORM_STATE);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadConditions = async () => {
    try {
      const response = await window.api.manageConditions('list');
      if (response.success && response.data) {
        setConditions(response.data);
        return;
      }

      toast.error(response.error || 'No se pudieron cargar las condiciones');
    } catch {
      toast.error('Error de comunicación al cargar condiciones');
    }
  };

  useEffect(() => {
    loadConditions();
  }, []);

  const resetForm = () => {
    setFormData(DEFAULT_FORM_STATE);
    setEditingId(null);
  };

  const handleServiceTypeToggle = (serviceType: ServiceType) => {
    setFormData((current) => {
      const exists = current.appliesToServiceTypes.includes(serviceType);
      return {
        ...current,
        appliesToServiceTypes: exists
          ? current.appliesToServiceTypes.filter((item) => item !== serviceType)
          : [...current.appliesToServiceTypes, serviceType]
      };
    });
  };

  const handleSubmit = async () => {
    const action = editingId ? 'edit' : 'add';
    try {
      const response = await window.api.manageConditions(action, { ...formData, id: editingId ?? undefined });

      if (response.success) {
        toast.success(editingId ? 'Condición actualizada' : 'Condición agregada');
        resetForm();
        loadConditions();
        return;
      }

      toast.error(response.error || 'No se pudo guardar la condición');
    } catch {
      toast.error('Error de comunicación al guardar condición');
    }
  };

  const handleEdit = (condition: QuoteCondition) => {
    setEditingId(condition.id);
    setFormData({
      type: condition.type,
      title: condition.title,
      description: condition.description,
      appliesToServiceTypes: condition.appliesToServiceTypes
    });
  };

  const handleDelete = async (conditionId: number) => {
    try {
      const response = await window.api.manageConditions('delete', { id: conditionId });
      if (response.success) {
        toast.success('Condición desactivada');
        loadConditions();
        return;
      }

      toast.error(response.error || 'No se pudo desactivar la condición');
    } catch {
      toast.error('Error de comunicación al desactivar condición');
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-6">
        <FileText className="w-5 h-5" />
        Condiciones comerciales y técnicas
      </h3>

      <div className={`${editingId ? 'bg-yellow-50 border-yellow-300' : 'bg-slate-50 border-slate-200'} p-4 rounded-lg mb-6 border`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select
              value={formData.type}
              onChange={(event) => setFormData((current) => ({ ...current, type: event.target.value as ConditionType }))}
              className="w-full p-2 border rounded text-sm bg-white"
            >
              <option value="commercial">Comercial</option>
              <option value="technical">Técnica</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              className="w-full min-h-20 resize-none p-2 border rounded text-sm"
            />
          </div>
        </div>

        {formData.type === 'technical' && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Aplica a servicios</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {SERVICE_TYPES.map((serviceType) => (
                <label key={serviceType} className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.appliesToServiceTypes.includes(serviceType)}
                    onChange={() => handleServiceTypeToggle(serviceType)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {SERVICE_TYPE_LABELS[serviceType]}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          {editingId && (
            <button type="button" onClick={resetForm} className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded">
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formData.title.trim() || !formData.description.trim()}
            className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {editingId ? 'Actualizar' : 'Agregar'}
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        {conditions.map((condition) => (
          <div key={condition.id} className="flex items-start justify-between gap-4 rounded-lg border border-gray-100 p-4 hover:bg-gray-50">
            <div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${condition.type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {condition.type === 'commercial' ? 'Comercial' : 'Técnica'}
                </span>
                <p className="font-medium text-gray-900">{condition.title}</p>
              </div>
              <p className="mt-1 text-sm text-gray-600">{condition.description}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button type="button" onClick={() => handleEdit(condition)} className="p-2 text-gray-400 hover:text-blue-600">
                <Edit2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => handleDelete(condition.id)} className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
