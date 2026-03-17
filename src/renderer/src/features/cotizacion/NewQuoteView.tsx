//El componente padre que une los pasos y tiene el botón Guardar
import { FormProvider } from 'react-hook-form';
import { QuoteFormValues, useQuoteForm } from './hooks/useQuoteForm';
import { LocationStep } from './components/LocationStep';
import { WasteStep } from './components/WasteStep';
import { JSX } from 'react';
// Importa los demás steps...

export const NewQuoteView = ():  JSX.Element => {
  const { form, submitDraft } = useQuoteForm();

  const onSubmit = async (data: QuoteFormValues): Promise<void> => {
    const success = await submitDraft(data);
    if (success) {
      alert('Draft saved successfully!');
      form.reset();
    } else {
      alert('Error saving draft. Check console.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">New Quote</h1>
      
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
              Save Draft
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};