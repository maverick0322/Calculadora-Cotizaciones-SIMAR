import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { NewQuoteView } from './features/cotizacion/NewQuoteView';
import logoImg from './assets/logo.png';
import { DashboardView } from './features/cotizacion/DashboardView';
import { IssuedQuotesDashboardView } from './features/cotizacion/IssuedQuotesDashboardView';
import { LoginView } from './features/auth/LoginView';
import { CatalogSettingsView } from './features/configuration/CatalogSettingsView';
import WorkerRegistrationView from './features/registro/WorkerRegistrationView';

type View = 'splash' | 'newQuote' | 'dashboard' | 'issuedQuotes' | 'settings' | 'registerWorker';

function App() {
  const [currentView, setCurrentView] = useState<View>('splash');
  const [fadeStatus, setFadeStatus] = useState<'in' | 'out'>('in');
  const [editDraftId, setEditDraftId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (currentView !== 'splash') return;

    const fadeOutTimer = setTimeout(() => {
      setFadeStatus('out');
    }, 3000);

    const changeViewTimer = setTimeout(() => {
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

  // --- 1. Pantalla de Bienvenida (Splash) ---
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

  return (
    <>
      <Toaster position="top-right" />

      {/* --- 2. Lógica cuando NO hay sesión iniciada --- */}
      {!isAuthenticated ? (
        currentView === 'registerWorker' ? (
          <WorkerRegistrationView onBack={() => setCurrentView('dashboard')} />
        ) : (
          <LoginView
            onLoginSuccess={() => setIsAuthenticated(true)}
            onGoToRegister={() => setCurrentView('registerWorker')}
          />
        )
      ) : (
        <div className="min-h-screen bg-gray-50">
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
                  📝 Borradores
                </button>

                <button
                  onClick={() => setCurrentView('issuedQuotes')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors
                    ${currentView === 'issuedQuotes'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-green-600'}`
                  }
                >
                  ✅ Emitidas
                </button>

                {/* Botón de Ajustes (Tu Rama) */}
                <button
                  onClick={() => setCurrentView('settings')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors
                    ${currentView === 'settings'
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'}`
                  }
                >
                  ⚙️ Ajustes
                </button>

                {/* Botón de Empleados (Rama de Lizeth) */}
                <button
                  onClick={() => setCurrentView('registerWorker')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors
                    ${currentView === 'registerWorker'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-purple-600'}`
                  }
                >
                  👥 Empleados
                </button>

                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-full transition-colors ml-2 border-l border-gray-300 rounded-none"
                >
                  Salir
                </button>
              </div>
            </nav>
          </header>

          <main className="py-8">
            {/* Vistas principales del dashboard */}
            {currentView === 'newQuote' && (
              <NewQuoteView
                editId={editDraftId}
                onSaveSuccess={() => setCurrentView('dashboard')}
              />
            )}
            {currentView === 'dashboard' && <DashboardView onEditClick={handleEditDraft} />}
            {currentView === 'issuedQuotes' && (
              // Conservamos la corrección de UX que hicimos hace un momento
              <IssuedQuotesDashboardView onCloneRedirect={() => setCurrentView('dashboard')} />
            )}
            {currentView === 'settings' && <CatalogSettingsView />}

            {/* Vista de registro (dentro de sesión) */}
            {currentView === 'registerWorker' && (
              <WorkerRegistrationView onBack={() => setCurrentView('dashboard')} />
            )}
          </main>
        </div>
      )}
    </>
  );
}

export default App;