import { useState, useEffect } from 'react';
import { FormProvider, FieldErrors } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useQuoteForm } from './hooks/useQuoteForm';
import { QuoteFormValues } from '../../../../shared/schemas/quoteSchema';
import { useQuoteCalculator } from './hooks/useQuoteCalculator';
import { Save, ArrowLeft, CheckCircle } from 'lucide-react';

// IMPORTACIÓN DE COMPONENTES MODULARIZADOS
import { ClientInfoStep } from './components/ClientInfoStep';
import { ValiditySelector } from './components/ValiditySelector';
import { ServicesTabSystem } from './components/ServicesTabSystem';
import { StickyTotalsFooter } from './components/StickyTotalsFooter';
import { SummaryStep } from './components/SummaryStep';

export interface CatalogData {
  warehouses: { id: number; name: string; address: string; }[];
  vehicles: { id: number; plate: string; name: string; vehicle_type: string; useful_tonnage: number; volume_m3: number; drum_capacity: number; fuel_efficiency_km_l: number; price_per_day: number; price_per_ton: number; price_per_m3: number; }[];
  supplies: { id: number; name: string; category: 'supply' | 'material' | 'equipment'; unit: string; suggested_price: number; }[];
}

interface INewQuoteViewProps {
  editId?: number | null;
  onSaveSuccess?: () => void;
}

export const NewQuoteView = ({ editId, onSaveSuccess }: INewQuoteViewProps) => {
  const { form, serviceFields, addNewService, removeService, submitDraft } = useQuoteForm(editId);
  const { total, subtotal, iva, breakdown } = useQuoteCalculator(form.control);
  
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0); 
  const [saveClientToDirectory, setSaveClientToDirectory] = useState(true);
  const [catalogs, setCatalogs] = useState<CatalogData>({ warehouses: [], vehicles: [], supplies: [] });

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const response = await window.api.getCatalogs();
        if (response.success && response.data) setCatalogs(response.data);
      } catch (error) {
        console.error("Error al cargar los catálogos:", error);
      }
    };
    fetchCatalogs();
  }, []);

  const handleGoToReview = (data: QuoteFormValues) => setIsReviewMode(true);

  const handleConfirmSave = async () => {
    const data = form.getValues(); 
    const toastId = toast.loading(editId ? 'Actualizando borrador...' : 'Guardando borrador...');

    try {
      const isSuccess = await submitDraft(data, subtotal, total);
      if (!isSuccess) {
        toast.error('Error al guardar el borrador. Revisa tu conexión.', { id: toastId });
        return;
      }

      if (saveClientToDirectory && data.clientName) {
        await window.api.manageClientDirectory('upsert', {
          clientName: data.clientName, clientRfc: data.clientRfc, contactName: data.contactName, contactPhone: data.contactPhone, contactEmail: data.contactEmail,
        });
      }

      toast.success(editId ? '¡Borrador actualizado!' : '¡Borrador guardado exitosamente!', { id: toastId });
      
      if (!editId) { form.reset(); setIsReviewMode(false); }
      if (onSaveSuccess) onSaveSuccess();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error inesperado al guardar: ${errorMessage}`, { id: toastId });
    }
  };

  const onFormError = (errors: FieldErrors<QuoteFormValues>) => {
    console.error('❌ Errores:', errors);
    toast.error('Hay campos inválidos o incompletos. Revisa las pestañas en rojo.');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md transition-all relative mb-20">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4 flex items-center gap-2">
        {isReviewMode && <CheckCircle className="text-green-600" />}
        {editId 
          ? (isReviewMode ? `Revisando Borrador #${editId}` : `Editando Borrador #${editId}`)
          : (isReviewMode ? 'Confirmar Nueva Cotización' : 'Nueva Cotización')}
      </h1>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleGoToReview, onFormError)} className="space-y-8">
          
          {!isReviewMode ? (
            <>
              {/* BLOQUE 1: DATOS GLOBALES */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">1. Datos Generales del Contrato</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <ClientInfoStep saveClient={saveClientToDirectory} setSaveClient={setSaveClientToDirectory} />
                  <ValiditySelector />
                </div>
              </div>

              {/* BLOQUE 2: PESTAÑAS Y SERVICIOS */}
              <ServicesTabSystem 
                serviceFields={serviceFields} activeTab={activeTab} setActiveTab={setActiveTab}
                removeService={removeService} addNewService={addNewService} catalogs={catalogs}
              />

              {/* BLOQUE 3: FOOTER DINÁMICO */}
              <StickyTotalsFooter breakdown={breakdown} subtotal={subtotal} total={total} />
            </>
          ) : (
            <>
              {/* MODO REVISIÓN */}
              <SummaryStep data={form.getValues()} />

              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mt-8 flex justify-end items-center">
                 <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Subtotal: ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <p className="text-sm text-gray-500 mb-2">IVA (16%): ${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <p className="text-2xl font-bold text-gray-900 border-t border-gray-300 pt-2">
                      Total: ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                 </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t mt-8">
                <button type="button" onClick={() => setIsReviewMode(false)} className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">
                  <ArrowLeft className="w-4 h-4" /> Volver a Editar
                </button>
                <button type="button" onClick={handleConfirmSave} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-sm">
                  <Save className="w-4 h-4" /> {editId ? 'Confirmar Actualización' : 'Confirmar y Guardar'}
                </button>
              </div>
            </>
          )}
        </form>
      </FormProvider>
    </div>
  );
};