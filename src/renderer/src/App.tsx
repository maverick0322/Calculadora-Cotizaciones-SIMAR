import { JSX, useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { NewQuoteView } from './features/cotizacion/NewQuoteView';
import logoImg from './assets/logo.png';
import { DashboardView } from './features/cotizacion/DashboardView';
// NUEVO: Importamos el trabajo de Lizeth
import { LoginView } from './features/auth/LoginView';

type View = 'splash' | 'newQuote' | 'dashboard';

function App(): JSX.Element {
  const [currentView, setCurrentView] = useState<View>('splash');
  const [fadeStatus, setFadeStatus] = useState<'in' | 'out'>('in');
  const [editDraftId, setEditDraftId] = useState<number | null>(null);

  // NUEVO: El estado de seguridad (Empieza como falso para bloquear la app)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (currentView !== 'splash') return;

    const fadeOutTimer = setTimeout(() => {
      setFadeStatus('out');
    }, 3000);

    const changeViewTimer = setTimeout(() => {
      // Cuando acaba el splash, por defecto preparamos el dashboard
      setCurrentView('dashboard');
    }, 4000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(changeViewTimer);
    };
  }, [currentView]);

  const handleNewDraft = () => {
    setEditDraftId(null);
    setCurrentView('newQuote');
  };

  const handleEditDraft = (id: number) => {
    setEditDraftId(id);
    setCurrentView('newQuote');
  };

  // --- FASE 1: SPLASH SCREEN ---
  if (currentView === 'splash') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div
          className={`transition-opacity duration-1000 flex flex-col items-center gap-6
            ${fadeStatus === 'in' ? 'opacity-100' : 'opacity-0'}`
          }
        >
          <img src={logoImg} alt="Company Logo" className="w-48 h-auto object-contain" />
          <h1 className="text-2xl font-bold text-gray-800">Bienvenido al Gestor de Cotizaciones</h1>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // --- FASE 2: EL CANDADO (LOGIN) ---
  // Si ya pasó el splash, pero el usuario NO está autenticado, lo atrapamos aquí
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" />
        {/* Le pasamos la llave para abrir el candado (setIsAuthenticated(true)) */}
        <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />
      </>
    );
  }

  // --- FASE 3: LA APLICACIÓN PRINCIPAL ---
  // El código de abajo SOLO se ejecuta si isAuthenticated es TRUE
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

            {/* Opcional: Un botón para cerrar sesión */}
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-full transition-colors ml-2"
            >
              Salir
            </button>
          </div>
        </nav>
      </header>

      {/* CONTENIDO DE LA VISTA SELECCIONADA */}
      <main className="py-8">
        {currentView === 'newQuote' && <NewQuoteView editId={editDraftId} />}
        {currentView === 'dashboard' && <DashboardView onEditClick={handleEditDraft} />}
      </main>
    </div>
  );
}

export default App;
