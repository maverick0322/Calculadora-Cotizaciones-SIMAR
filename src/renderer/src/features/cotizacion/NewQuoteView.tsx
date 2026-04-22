import { useState, useEffect } from 'react';
import { FormProvider, FieldErrors } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useQuoteForm } from './hooks/useQuoteForm';
import { QuoteFormValues } from '../../../../shared/schemas/quoteSchema';
import { LocationStep } from './components/LocationStep';
import { WasteStep } from './components/WasteStep';
import { TripStep } from './components/TripStep';
import { SummaryStep } from './components/SummaryStep';
import { VehiclesAndCrewStep } from './components/VehiclesAndCrewStep';
import { SuppliesStep } from './components/SuppliesStep';
import { useQuoteCalculator } from './hooks/useQuoteCalculator';
import { Save, ArrowLeft, CheckCircle } from 'lucide-react';

export interface CatalogData {
  warehouses: { id: number; name: string; address: string }[];
  vehicles: { id: number; name: string; vehicle_type: string; capacity_kg: number; base_price: number }[];
  supplies: { id: number; name: string; unit: string; suggested_price: number }[];
}

interface INewQuoteViewProps {
  editId?: number | null;
  onSaveSuccess?: () => void;
}

export const NewQuoteView = ({ editId, onSaveSuccess }: INewQuoteViewProps) => {
  const { form, submitDraft } = useQuoteForm(editId);
  const { total, subtotal, iva, breakdown } = useQuoteCalculator(form.control);
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  const [catalogs, setCatalogs] = useState<CatalogData>({ warehouses: [], vehicles: [], supplies: [] });

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const response = await window.api.getCatalogs();
        if (response.success && response.data) {
          setCatalogs(response.data);
        }
      } catch (error) {
        console.error("Error al cargar los catálogos:", error);
      }
    };
    fetchCatalogs();
  }, []);

  const handleGoToReview = (data: QuoteFormValues) => {
    setIsReviewMode(true);
  };

  const handleConfirmSave = async () => {
    const data = form.getValues(); 
    const toastId = toast.loading(editId ? 'Actualizando borrador...' : 'Guardando borrador...');

    try {
      const isSuccess = await submitDraft(data, subtotal, total);

      if (!isSuccess) {
        toast.error('Error al guardar el borrador. Revisa tu conexión.', { id: toastId });
        return;
      }

      toast.success(editId ? '¡Borrador actualizado!' : '¡Borrador guardado exitosamente!', { id: toastId });
      
      if (!editId) {
        form.reset();
        setIsReviewMode(false);
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error inesperado al guardar: ${errorMessage}`, { id: toastId });
    }
  };

  const onFormError = (errors: FieldErrors<QuoteFormValues>) => {
    console.error('❌ Errores de validación bloqueando el guardado:', errors);
    toast.error('Hay campos inválidos o incompletos. Revisa la consola.');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md transition-all relative">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4 flex items-center gap-2">
        {isReviewMode ? <CheckCircle className="text-green-600" /> : null}
        {editId 
          ? (isReviewMode ? `Revisando Borrador #${editId}` : `Editando Borrador #${editId}`)
          : (isReviewMode ? 'Confirmar Nueva Cotización' : 'Nueva Cotización')}
      </h1>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleGoToReview, onFormError)} className="space-y-8">
          
          {!isReviewMode ? (
            <>
              <LocationStep />
              <WasteStep />
              <TripStep catalogs={catalogs} />
              <VehiclesAndCrewStep catalogs={catalogs} />
              <SuppliesStep catalogs={catalogs} />

              {/* --- INICIO DE LA BARRA DE TOTALES EN TIEMPO REAL --- */}
              <div className="sticky bottom-0 bg-gray-900 text-white p-4 -mx-6 mt-10 rounded-t-xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] flex flex-wrap justify-between items-center px-10 animate-in slide-in-from-bottom-5 z-10">
                <div className="flex gap-8 text-xs text-gray-400">
                  <div>
                    <p>Logística</p>
                    <p className="text-white font-mono">${breakdown.logistics.toFixed(2)}</p>
                  </div>
                  <div>
                    <p>Operación</p>
                    <p className="text-white font-mono">${(breakdown.vehicles + breakdown.crew).toFixed(2)}</p>
                  </div>
                  <div>
                    <p>Insumos/Extras</p>
                    <p className="text-white font-mono">${(breakdown.supplies + breakdown.extras).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="text-right mt-4 md:mt-0">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Subtotal: ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  <div className="flex items-baseline gap-2 justify-end">
                    <span className="text-sm text-gray-400">+ IVA</span>
                    <p className="text-3xl font-bold text-green-400 font-mono">
                      ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
              {/* --- FIN DE LA BARRA DE TOTALES --- */}

              <div className="flex justify-end pt-6 mt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Revisar Cotización
                </button>
              </div>
            </>
          ) : (
            <>
              <SummaryStep data={form.getValues()} />

              {/* BARRA DE TOTALES EN LA VISTA DE REVISIÓN */}
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
                <button
                  type="button"
                  onClick={() => setIsReviewMode(false)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a Editar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {editId ? 'Confirmar Actualización' : 'Confirmar y Guardar'}
                </button>
              </div>
            </>
          )}

        </form>
      </FormProvider>
    </div>
  );
};