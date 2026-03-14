import { ICotizacionRepository } from '../../domain/repositories/ICotizacionRepository';
import { CotizacionBorrador } from '../../../shared/types/Cotizacion';

export class GuardarBorradorUseCase {
  // Inyección de dependencias: El caso de uso no sabe que es SQLite, solo sabe que es un repositorio
  constructor(private readonly repository: ICotizacionRepository) {}

  execute(datosBorrador: CotizacionBorrador) {
    // Aquí irían las validaciones de negocio del backend antes de guardar
    if (datosBorrador.volumenCantidad <= 0) {
      throw new Error("El volumen debe ser mayor a 0 para guardar un borrador.");
    }

    // Le pedimos al repositorio que guarde
    const nuevoId = this.repository.guardarBorrador(datosBorrador);
    
    return { success: true, id: nuevoId, message: "Borrador guardado correctamente" };
  }
}