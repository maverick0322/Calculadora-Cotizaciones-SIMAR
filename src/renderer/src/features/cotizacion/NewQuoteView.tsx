import { useState, useEffect } from 'react';
import { FormProvider, FieldErrors } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useQuoteForm } from './hooks/useQuoteForm';
import { QuoteFormValues } from '../../../../shared/schemas/quoteSchema';
import { LocationStep } from './components/LocationStep';
import { WasteStep } from './components/WasteStep';
import { TripStep } from './components/TripStep';
import { SummaryStep } from './components/SummaryStep';
import { Save, ArrowLeft, CheckCircle } from 'lucide-react';

// Interfaz local para tipar la respuesta de los catálogos
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
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  // NUEVO ESTADO: Guardará los catálogos provenientes de SQLite
  const [catalogs, setCatalogs] = useState<CatalogData>({ warehouses: [], vehicles: [], supplies: [] });

  // Efecto para cargar los catálogos al montar el componente
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
      const isSuccess = await submitDraft(data);

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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md transition-all">
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
              {/* Le pasamos los catálogos como Props al componente hijo */}
              <TripStep catalogs={catalogs} />

              <div className="flex justify-end pt-6 border-t mt-8">
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