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
import { Save, ArrowLeft, CheckCircle, Plus, Trash2 } from 'lucide-react';

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
  const { form, serviceFields, addNewService, removeService, submitDraft } = useQuoteForm(editId);
  const { total, subtotal, iva, breakdown } = useQuoteCalculator(form.control);
  
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // Controla qué servicio estamos viendo
  
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
    toast.error('Hay campos inválidos o incompletos. Revisa las pestañas en rojo.');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md transition-all relative mb-20">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4 flex items-center gap-2">
        {isReviewMode ? <CheckCircle className="text-green-600" /> : null}
        {editId 
          ? (isReviewMode ? `Revisando Borrador #${editId}` : `Editando Borrador #${editId}`)
          : (isReviewMode ? 'Confirmar Nueva Cotización' : 'Nueva Cotización')}
      </h1>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleGoToReview, onFormError)} className="space-y-8">
          
          {/* SECCIÓN GLOBAL: Cliente y Frecuencia Global */}
          {!isReviewMode && (
             <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
               <h2 className="text-lg font-semibold text-gray-800 mb-4">1. Datos Generales del Contrato</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Cliente</label>
                   <input {...form.register('clientName')} className="w-full px-3 py-2 border rounded-md" placeholder="Empresa SA de CV" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">RFC</label>
                   <input {...form.register('clientRfc')} className="w-full px-3 py-2 border rounded-md uppercase" placeholder="XAXX010101000" />
                 </div>
               </div>
             </div>
          )}

          {!isReviewMode ? (
            <>
              {/* SISTEMA DE PESTAÑAS (TABS) MULTISERVICIO */}
              <div className="mt-8">
                <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
                  {serviceFields.map((field, index) => (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => setActiveTab(index)}
                      className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2
                        ${activeTab === index 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-b-0'}`}
                    >
                      Servicio {index + 1}
                      {serviceFields.length > 1 && (
                        <Trash2 
                          className="w-4 h-4 ml-2 hover:text-red-400" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeService(index);
                            if (activeTab >= index) setActiveTab(Math.max(0, activeTab - 1));
                          }}
                        />
                      )}
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addNewService}
                    className="ml-2 px-3 py-2 rounded-t-lg font-medium text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 border-b-0 flex items-center gap-1 transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> Agregar Servicio
                  </button>
                </div>

                {/* CONTENIDO DE LA PESTAÑA ACTIVA */}
                <div className="border border-t-0 border-gray-200 p-6 rounded-b-lg shadow-sm bg-white min-h-[500px]">
                  {serviceFields.map((field, index) => (
                    <div 
                      key={field.id} 
                      className={activeTab === index ? 'block animate-in fade-in' : 'hidden'}
                    >
                      <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
                        Configuración del Servicio {index + 1}
                      </h2>
                      
                      <LocationStep serviceIndex={index} />
                      <WasteStep serviceIndex={index} />
                      <TripStep serviceIndex={index} catalogs={catalogs} />
                      <VehiclesAndCrewStep serviceIndex={index} catalogs={catalogs} />
                      <SuppliesStep serviceIndex={index} catalogs={catalogs} />
                    </div>
                  ))}
                </div>
              </div>

              {/* --- BARRA DE TOTALES EN TIEMPO REAL --- */}
              <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] flex flex-wrap justify-center md:justify-between items-center px-10 z-50">
                <div className="flex gap-8 text-xs text-gray-400 hidden md:flex">
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
                
                <div className="text-right flex items-center gap-6">
                  <div>
                     <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Subtotal: ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                     <div className="flex items-baseline gap-2 justify-end">
                       <span className="text-sm text-gray-400">+ IVA</span>
                       <p className="text-3xl font-bold text-green-400 font-mono">
                         ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                       </p>
                     </div>
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition shadow-lg text-lg"
                  >
                    Revisar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* LA VISTA DE REVISIÓN NO SE TOCA POR AHORA */}
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