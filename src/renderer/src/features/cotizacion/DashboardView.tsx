import { JSX, useState, useEffect } from 'react';
import { Pencil, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
// Importamos nuestro "contrato" de datos
import { QuoteSummary } from '../../../../shared/types/Cotizacion';

export const DashboardView = (): JSX.Element => {
  // 1. EL ESTADO: Aquí guardaremos la lista de cotizaciones que nos dé la base de datos
  const [drafts, setDrafts] = useState<QuoteSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 2. EL EFECTO: Se ejecuta automáticamente al abrir esta pantalla
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await window.api.getDrafts();
        if (response.success) {
          setDrafts(response.data || []);
        } else {
          toast.error('Error al cargar la base de datos');
        }
      } catch (error) {
        console.error('Error IPC:', error);
        toast.error('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, []); // El arreglo vacío [] significa "haz esto solo una vez al cargar"

  // 3. UTILIDAD: Función para formatear el número de fecha a texto legible
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    // Le quitamos el fondo y el min-h-screen porque nuestro App.tsx ya los tiene
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Borradores recientes
        </h1>
        <p className="text-sm text-gray-500">
          Administra tus borradores
        </p>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direccion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de residuo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de creacion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">

              {/* ESTADO DE CARGA O VACÍO */}
              {loading && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Cargando borradores...</td></tr>
              )}
              {!loading && drafts.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No se encontraron borradores. ¡Crea uno nuevo!</td></tr>
              )}

              {/* 4. EL MAPEO: Convertimos cada dato de SQLite en una fila HTML */}
              {drafts.map((draft) => (
                <tr key={draft.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{draft.folio || `#00${draft.id}`}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{draft.ubicacion}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900 capitalize">{draft.residuo}</div>
                      <div className="text-gray-500">{draft.volumen}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{formatDate(draft.fechaCreacion)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 capitalize">
                      {draft.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
