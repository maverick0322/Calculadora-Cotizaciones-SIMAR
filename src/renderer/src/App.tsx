import { JSX, useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast'; 
import { NewQuoteView } from './features/cotizacion/NewQuoteView';
import logoImg from './assets/logo.png'; 
import { DashboardView } from './features/cotizacion/DashboardView';

type View = 'splash' | 'newQuote' | 'dashboard';

function App(): JSX.Element {
  const [currentView, setCurrentView] = useState<View>('splash');
  const [fadeStatus, setFadeStatus] = useState<'in' | 'out'>('in');

  // NUEVO: Estado para saber si estamos editando un borrador (guarda el ID)
  const [editDraftId, setEditDraftId] = useState<number | null>(null);

  useEffect(() => {
    if (currentView !== 'splash') return;

    const fadeOutTimer = setTimeout(() => {
      setFadeStatus('out');
    }, 3000); 

    const changeViewTimer = setTimeout(() => {
      setCurrentView('newQuote'); 
    }, 4000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(changeViewTimer);
    };
  }, [currentView]);

  // NUEVA FUNCIÓN: Para ir a crear uno en blanco
  const handleNewDraft = () => {
    setEditDraftId(null); // Limpiamos cualquier edición previa
    setCurrentView('newQuote');
  };

  // NUEVA FUNCIÓN: Para ir a editar uno existente
  const handleEditDraft = (id: number) => {
    setEditDraftId(id); // Guardamos el ID que queremos editar
    setCurrentView('newQuote'); // Cambiamos a la vista del formulario
  };

  if (currentView === 'splash') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        {/* Contenedor con animación de opacidad controlada por Tailwind y el estado fadeStatus */}
        <div 
          className={`transition-opacity duration-1000 flex flex-col items-center gap-6
            ${fadeStatus === 'in' ? 'opacity-100' : 'opacity-0'}`
          }
        >
          <img 
            src={logoImg} 
            alt="Company Logo" 
            className="w-48 h-auto object-contain" // Ajusta el ancho (w-48) según tu logo
          />
          <h1 className="text-2xl font-bold text-gray-800">Bienvenido al Gestor de Cotizaciones</h1>
          {/* Un spinner sutil de carga */}
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <img src={logoImg} alt="Logo" className="w-8 h-auto" />
             <span className="text-xl font-bold text-gray-900">Sistema de Cotizaciones SIMAR</span>
          </div>
          
          <div className="flex items-center gap-2 border border-gray-200 rounded-full p-1 bg-gray-50">
            {/* ACTUALIZADO: Botón 1 (Llama a handleNewDraft) */}
            <button
              onClick={handleNewDraft}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors
                ${currentView === 'newQuote' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600'}`
              }
            >
              ➕ Nueva Cotización
            </button>
            
            {/* Botón 2: Dashboard */}
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors
                ${currentView === 'dashboard' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600'}`
              }
            >
              📊 Borradores
            </button>
          </div>
        </nav>
      </header>

      {/* CONTENIDO DE LA VISTA SELECCIONADA */}
      <main className="py-8">
        {/* ACTUALIZADO: Pasamos las propiedades a los componentes */}
        {currentView === 'newQuote' && <NewQuoteView editId={editDraftId} />}
        
        {currentView === 'dashboard' && <DashboardView onEditClick={handleEditDraft} />}
      </main>
    </div>
  );
}

export default App;