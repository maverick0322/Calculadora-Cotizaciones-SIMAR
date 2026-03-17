// 1. Importamos la vista principal que Ana acaba de armar
import { JSX } from 'react'
import { NewQuoteView } from './features/cotizacion/NewQuoteView';

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <NewQuoteView />
    </div>
  );
}

export default App