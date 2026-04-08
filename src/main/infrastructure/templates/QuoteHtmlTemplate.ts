import { QuoteDraft } from '../../../shared/types/Quote';

export const buildQuoteHtml = (quoteData: QuoteDraft, logoBase64: string): string => {
  const createdAt = new Date(quoteData.createdAt);
  const dateStr = createdAt.toLocaleDateString('es-MX', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  const fullLocation = `${quoteData.location.street}, ${quoteData.location.neighborhood}, ${quoteData.location.municipality}`;

  const logoHtml = logoBase64 
    ? `<img src="${logoBase64}" alt="Logo SIMAR" style="max-height: 70px;">`
    : `<h1 style="color: #1e3a5f; margin: 0;">SIMAR</h1>`;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px auto; max-width: 1000px; line-height: 1.5; color: #1a1a1a; padding: 20px; background: #fff; }
            .header { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
            .address { font-size: 0.95em; margin-top: 15px; }
            .ref { font-weight: bold; margin: 15px 0 5px; color: #1e3a5f; }
            .date-line { color: #2c3e66; margin-bottom: 20px; font-size: 0.9em; }
            h2 { border-bottom: 2px solid #ccc; padding-bottom: 5px; color: #1e3a5f; font-size: 1.1em; margin-top: 25px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.85em; }
            th, td { border: 1px solid #aaa; padding: 8px 10px; text-align: left; }
            th { background-color: #eef4fc; }
            .list { margin: 15px 0; padding-left: 25px; font-size: 0.85em; }
            .list li { margin-bottom: 8px; text-align: justify; }
            .signature { margin-top: 40px; font-weight: bold; color: #1e3a5f; }
            footer { margin-top: 40px; font-size: 0.8em; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
        </style>
    </head>
    <body>
      <div class="header">
          <div>
              ${logoHtml}
              <div class="address">
                  <strong>${quoteData.location.neighborhood || 'Cliente'}</strong><br>
                  ${fullLocation}
              </div>
          </div>
          <div style="text-align: right;">
              <div class="ref">REF: ${quoteData.folio || `#00${quoteData.id}`}</div>
              <div class="date-line">${dateStr} &nbsp;|&nbsp; Vigencia: 15 días</div>
          </div>
      </div>

      <p style="font-size: 0.9em;">Por medio del presente envío propuesta económica referente al servicio de <strong>${quoteData.activity} de Residuos</strong>. Dicho servicio consiste en la Recolección, Transporte y Disposición Final de los residuos, en sitios autorizados por La Secretaría de Medio Ambiente del Estado de Veracruz.</p>

      <h2>I. Precios</h2>
      <table>
          <thead>
              <tr><th>No.</th><th>DESCRIPCIÓN</th><th>CANTIDAD</th><th>UNIDAD</th></tr>
          </thead>
          <tbody>
              <tr>
                  <td>1</td>
                  <td>Servicio de ${quoteData.activity}, transporte y disposición final de residuos ${quoteData.waste}.</td>
                  <td>${quoteData.volumeQuantity}</td>
                  <td>${quoteData.volumeUnit}</td>
              </tr>
          </tbody>
      </table>

      <h2>II. Condiciones Comerciales</h2>
      <ol class="list">
          <li><strong>Impuestos:</strong> Los precios indicados son más 16% de IVA.</li>
          <li><strong>Términos de pago:</strong> Pago por adelantado del concepto de transporte al 100% para la programación del servicio.</li>
          <li><strong>Vigencia:</strong> La presente cotización tiene una vigencia de quince días y no cuenta con financiamiento.</li>
          <li><strong>Aceptación del servicio:</strong> Se requiere sea confirmada la aceptación de la presente cotización, con firma de recibido.</li>
          <li><strong>Programación del servicio:</strong> Solicitar por escrito al área comercial en un lapso de 8 días hábiles.</li>
          <li><strong>Procedimientos de seguridad:</strong> En caso de demora imputable al cliente, se realizará cargo de <strong>$1,850.00 + IVA</strong> por hora ajustada.</li>
          <li><strong>Facturación:</strong> Cancelación o sustitución de facturas imputables al cliente causarán ajuste de <strong>$300.00 más IVA</strong>.</li>
          <li><strong>Recolector:</strong> Servicios exclusivos/urgentes presentarán ajustes correspondientes.</li>
          <li><strong>Ejecución del servicio:</strong> Programado para máximo 1 hora. Hora adicional causará cargo de <strong>$1,850.00</strong>.</li>
          <li><strong>Suministro de insumos:</strong> Tambos metálicos (200L) disponibles por <strong>$750.00 c/u</strong>.</li>
          <li><strong>Prestación del servicio:</strong> Residuos peligrosos deben estar envasados y etiquetados.</li>
      </ol>

      <h2>III. Garantías de Servicio</h2>
      <p style="font-size: 0.9em;"><strong>SISTEMAS EN MANEJO Y ADMINISTRACION DE RESIDUOS, S.A. DE C.V.</strong> se compromete a:</p>
      <ol class="list">
          <li>Puntualidad en la Recolección de los Residuos Peligrosos.</li>
          <li>Uso de Equipo de Seguridad acorde a la naturaleza de los residuos.</li>
          <li>Transporte en vehículos con autorización de SEDEMA, SCT y SEMARNAT.</li>
      </ol>

      <h2>IV. Condiciones y Restricciones</h2>
      <ul class="list">
          <li>Los precios corresponden al residuo con perfil asignado de acuerdo a información del cliente.</li>
          <li>Aplican si los residuos están correctamente separados, envasados e identificados.</li>
          <li>Si los residuos no se encuentran listos al recolectar, aplicarán gastos correspondientes.</li>
          <li>Desviaciones en el perfil original determinarán cambios en el costo.</li>
          <li>Cancelaciones con transporte ejecutado generarán cobro de los gastos generados.</li>
          <li>Situaciones fortuitas (marchas, bloqueos) causarán reprogramación del servicio.</li>
      </ul>

      <div class="signature">
          <p>ATENTAMENTE</p>
          <p style="margin-top: 10px;">Viridiana Mendoza / Departamento comercial</p>
      </div>

      <footer>
          Todos los precios están expresados en moneda nacional más IVA.<br>
          Vigencia: 15 días naturales a partir del ${dateStr}.
      </footer>
    </body>
    </html>
  `;
};