import { JSX } from 'react';
import { CotizacionBorrador } from '../../shared/types/Cotizacion'

function App(): JSX.Element {
  
  const probarBackend = async () => {
    // 1. Armamos un DTO falso que cumple perfectamente con el contrato
    const datosPrueba: CotizacionBorrador = {
      ubicacion: {
        direccion: 'Av. Lázaro Cárdenas 100',
        municipio: 'Xalapa',
        colonia: 'Centro'
      },
      actividad: 'recoleccion',
      residuo: 'peligroso',
      volumenCantidad: 50,
      volumenUnidad: 'kg',
      frecuencia: 'semanal',
      fechaCreacion: Date.now(),
      estado: 'borrador'
    }

    try {
      // 2. Disparamos la bala trazadora hacia el backend
      console.log('Enviando datos a SQLite...');
      const respuesta = await window.api.guardarBorrador(datosPrueba);
      
      // 3. Vemos qué nos respondió el Caso de Uso
      console.log('Respuesta del Backend:', respuesta);
      
      if (respuesta.success) {
        alert(`¡Éxito! Cotización guardada en SQLite con el ID: ${respuesta.id}`);
      } else {
        alert(`Error del backend: ${respuesta.error}`);
      }
    } catch (error) {
      console.error('Error en el puente IPC:', error);
    }
  }

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h2>Arquitectura Clean Electron 🚀</h2>
      <p>Prueba de integración End-to-End</p>
      
      <button 
        onClick={probarBackend}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Guardar Borrador de Prueba en SQLite
      </button>
    </div>
  )
}

export default App