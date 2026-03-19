import { JSX } from 'react';
// 1. Importamos el Toaster
import { Toaster } from 'react-hot-toast'; 
import { NewQuoteView } from './features/cotizacion/NewQuoteView';

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      <NewQuoteView />
    </div>
  );
}

export default App;