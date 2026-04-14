import { QuoteFormValues } from '../../../../../shared/schemas/quoteSchema';
import { MapPin, Trash2, Truck } from 'lucide-react';

interface SummaryStepProps {
  data: QuoteFormValues;
}

export const SummaryStep = ({ data }: SummaryStepProps) => {
  const wasteTranslations: Record<string, string> = {
    domestic: 'Doméstico',
    organic: 'Orgánico',
    recyclable: 'Reciclable',
    hazardous: 'Peligroso',
    bulky: 'Voluminoso'
  };

  const frequencyTranslations: Record<string, string> = {
    daily: 'Diaria',
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
    single: 'Evento Único'
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <h3 className="text-blue-800 font-semibold">Resumen de Cotización</h3>
        <p className="text-sm text-blue-600">Revisa la información antes de generar el documento final.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-gray-800 border-b pb-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            <h4 className="font-semibold">Ubicación</h4>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Calle:</dt> <dd className="font-medium text-right">{data.location.street}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Colonia:</dt> <dd className="font-medium text-right">{data.location.neighborhood}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Municipio:</dt> <dd className="font-medium text-right">{data.location.municipality}</dd></div>
          </dl>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-gray-800 border-b pb-2">
            <Trash2 className="w-5 h-5 text-gray-500" />
            <h4 className="font-semibold">Detalles del Residuo</h4>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Tipo:</dt> <dd className="font-medium capitalize text-right">{wasteTranslations[data.waste] || data.waste}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Volumen:</dt> <dd className="font-medium text-right">{data.volumeQuantity} {data.volumeUnit}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Frecuencia:</dt> <dd className="font-medium capitalize text-right">{frequencyTranslations[data.frequency || ''] || 'No especificada'}</dd></div>
          </dl>
        </div>

        {data.trip && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm md:col-span-2">
            <div className="flex items-center gap-2 mb-3 text-gray-800 border-b pb-2">
              <Truck className="w-5 h-5 text-gray-500" />
              <h4 className="font-semibold">Logística y Viaje</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div><dt className="text-gray-500 text-xs uppercase tracking-wider">Distancia</dt> <dd className="font-medium text-lg">{data.trip.kilometers} km</dd></div>
              <div><dt className="text-gray-500 text-xs uppercase tracking-wider">Vehículos</dt> <dd className="font-medium text-lg">{data.trip.vehicles}</dd></div>
              <div><dt className="text-gray-500 text-xs uppercase tracking-wider">Tripulación</dt> <dd className="font-medium text-lg">{data.trip.crewMembers} personas</dd></div>
              <div><dt className="text-gray-500 text-xs uppercase tracking-wider">Combustible</dt> <dd className="font-medium text-lg">{data.trip.fuelLiters} L</dd></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};