import { FormProvider } from 'react-hook-form';
import { useQuoteForm } from './hooks/useQuoteForm';
import { QuoteFormValues } from '../../../../shared/schemas/quoteSchema';
import { LocationStep } from './components/LocationStep';
import { WasteStep } from './components/WasteStep';
import { TripStep } from './components/TripStep'; // <-- El componente de Ana
import { JSX, useEffect } from 'react'; 
import toast from 'react-hot-toast';

export const NewQuoteView = ({editId}: {editId?: number | null}):  JSX.Element => {
  const { form, submitDraft } = useQuoteForm();

  // EFECTO DE AUTOLLENADO DE XCARET
  useEffect(() => {
    if (editId) {
      const fetchDraftData = async () => {
        const toastId = toast.loading('Cargando borrador...');
        try {
          const response = await window.api.getDraftById(editId);
          
          if (response.success && response.data) {
            form.reset(response.data);
            toast.success('Borrador listo para editar', { id: toastId });
          } else {
            toast.error('No se pudo cargar el borrador', { id: toastId });
          }
        } catch (error) {
          console.error('Error:', error);
          toast.error('Error de conexión', { id: toastId });
        }
      };

      fetchDraftData();
    } else {
      form.reset(); 
    }
  }, [editId, form]);

  const onSubmit = async (data: QuoteFormValues): Promise<void> => {
    const toastId = toast.loading('Guardando borrador...');
    
    // Lógica combinada: Mandar el ID si estamos editando
    const dataWithId = editId ? { ...data, id: editId } : data;
    const success = await submitDraft(dataWithId);

    if (success) {
      toast.success(editId ? '¡Borrador actualizado!' : '¡Borrador guardado exitosamente!', {id: toastId});
      if (!editId) form.reset();
    } else {
      toast.error('Error al guardar el borrador. Revisa tu conexión.', {id: toastId});
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {editId ? `Editando Borrador #${editId}` : 'Nueva Cotización'}
      </h1>
      
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <LocationStep />
          <WasteStep />
          <TripStep /> {/* <-- Integración del paso de Ana */}
          
          <div className="flex justify-end pt-4 border-t">
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
            >
              {editId ? 'Actualizar Borrador' : 'Guardar Borrador'}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};