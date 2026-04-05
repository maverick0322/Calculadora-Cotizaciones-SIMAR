import { FormProvider, FieldErrors } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useQuoteForm } from './hooks/useQuoteForm';
import { QuoteFormValues } from '../../../../shared/schemas/quoteSchema';
import { LocationStep } from './components/LocationStep';
import { WasteStep } from './components/WasteStep';
import { TripStep } from './components/TripStep';

interface INewQuoteViewProps {
  editId?: number | null;
}

export const NewQuoteView = ({ editId }: INewQuoteViewProps) => {
  const { form, submitDraft } = useQuoteForm(editId);

  const handleQuoteSubmit = async (data: QuoteFormValues): Promise<void> => {
    const toastId = toast.loading(editId ? 'Actualizando borrador...' : 'Guardando borrador...');

    try {
      // Le pasamos el problema al hook
      const isSuccess = await submitDraft(data);

      if (!isSuccess) {
        toast.error('Error al guardar el borrador. Revisa tu conexión.', { id: toastId });
        return;
      }

      toast.success(editId ? '¡Borrador actualizado!' : '¡Borrador guardado exitosamente!', { id: toastId });
      
      if (!editId) {
        form.reset();
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {editId ? `Editando Borrador #${editId}` : 'Nueva Cotización'}
      </h1>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleQuoteSubmit, onFormError)} className="space-y-8">
          <LocationStep />
          <WasteStep />
          <TripStep />

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