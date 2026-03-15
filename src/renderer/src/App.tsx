import { JSX } from 'react';
import { CotizacionBorrador } from '../../shared/types/Cotizacion'

function App(): JSX.Element {
  
  const probarGuardar = async () => {
    //Armamos un DTO falso que cumple perfectamente con el contrato
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
      //Disparamos la bala trazadora hacia el backend
      console.log('Enviando datos a SQLite...');
      const respuesta = await window.api.guardarBorrador(datosPrueba);
      
      // Vemos qué nos respondió el Caso de Uso
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

  // NUEVO: Función del botón 2 (Listar)
  const probarListar = async () => {
    try {
      console.log('Solicitando borradores al backend...');
      const respuesta = await window.api.getDrafts();
      
      if (respuesta.success) {
        console.log('✅ Borradores recibidos de SQLite:', respuesta.data);
        alert(`Se encontraron ${respuesta.data?.length} borradores. Revisa la consola.`);
      } else {
        console.error('Error del backend:', respuesta.error);
        alert(`Error al cargar: ${respuesta.error}`);
      }
    } catch (error) {
      console.error('Error IPC:', error);
    }
  }

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h2>Arquitectura Clean Electron 🚀</h2>
      <p>Pruebas de Integración (CRUD)</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button 
          onClick={probarGuardar}
          style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          1. Guardar Borrador
        </button>

        <button 
          onClick={probarListar}
          style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          2. Listar Borradores
        </button>
      </div>
    </div>
  )
}

export default App