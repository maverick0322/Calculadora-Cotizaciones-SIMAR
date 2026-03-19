//El componente padre que une los pasos y tiene el botón Guardar
import { FormProvider } from 'react-hook-form';
import { useQuoteForm } from './hooks/useQuoteForm';
import { QuoteFormValues } from '../../../../shared/schemas/quoteSchema';
import { LocationStep } from './components/LocationStep';
import { WasteStep } from './components/WasteStep';
import { JSX } from 'react';
import toast from 'react-hot-toast';

export const NewQuoteView = ():  JSX.Element => {
  const { form, submitDraft } = useQuoteForm();

  const onSubmit = async (data: QuoteFormValues): Promise<void> => {
    const toastId = toast.loading('Saving draft...');
    const success = await submitDraft(data);

    if (success) {
      toast.success('Draft saved successfully!', {id: toastId});

      form.reset();
    } else {
      toast.error('Error saving draft. Check connection.', {id: toastId});
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Nueva Cotización</h1>
      
      {/* FormProvider inyecta el estado del formulario a todos los componentes hijos mágicamente */}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Aquí Ana y Xcaret irán acomodando sus componentes visuales */}
          <LocationStep />
          <WasteStep />
          
          <div className="flex justify-end pt-4 border-t">
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
            >
              Guardar Borrador
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};