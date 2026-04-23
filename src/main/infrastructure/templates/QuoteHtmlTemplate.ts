import { QuoteDraft } from '../../../shared/types/Quote';

export const buildQuoteHtml = (quoteData: QuoteDraft, logoBase64: string): string => {
  const createdAt = new Date(quoteData.createdAt);
  const dateStr = createdAt.toLocaleDateString('es-MX', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  // Extraemos el primer servicio (nuestro "carrito" actual)
  const service = quoteData.services[0];
  const loc = service.location;
  const fullLocation = `${loc.street}, ${loc.neighborhood}, ${loc.municipality}, ${loc.state}`;

  const activityMap: Record<string, string> = {
    collection: 'Recolección',
    transport: 'Transporte',
    transfer: 'Transferencia',
    final_disposal: 'Disposición Final'
  };
  const activityName = activityMap[service.activity] || service.activity;

  const logoHtml = logoBase64 
    ? `<img src="${logoBase64}" alt="Logo SIMAR" style="max-height: 70px;">`
    : `<h1 style="color: #1e3a5f; margin: 0;">SIMAR</h1>`;

  // Generamos dinámicamente las filas de los residuos
  const wasteRows = service.wastes.map((waste, index) => `
    <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>Servicio de ${activityName}, transporte y disposición de residuo: <strong>${waste.name}</strong> (Clasificación: ${waste.type}).</td>
        <td style="text-align: center;">${waste.quantity}</td>
        <td style="text-align: center;">${waste.unit}</td>
    </tr>
  `).join('');

  // Cálculos financieros para pintar en la tabla
  const subtotal = quoteData.subtotal || 0;
  const iva = subtotal * 0.16;
  const total = quoteData.total || 0;

  const formatCurrency = (amount: number) => 
    `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
            th { background-color: #eef4fc; text-align: center; }
            .totals-row td { padding: 6px 10px; border-top: none; }
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
                  <strong>${quoteData.clientName}</strong><br>
                  ${fullLocation}
              </div>
          </div>
          <div style="text-align: right;">
              <div class="ref">REF: ${quoteData.folio || `Borrador #${quoteData.id}`}</div>
              <div class="date-line">${dateStr} &nbsp;|&nbsp; Vigencia: ${quoteData.validityDays} días</div>
          </div>
      </div>

      <p style="font-size: 0.9em;">Por medio del presente envío propuesta económica referente al servicio de <strong>${activityName} de Residuos</strong>. Dicho servicio consiste en la Recolección, Transporte y Disposición Final de los residuos, en sitios autorizados por La Secretaría de Medio Ambiente del Estado de Veracruz.</p>

      <h2>I. Precios</h2>
      <table>
          <thead>
              <tr><th style="width: 5%;">No.</th><th>DESCRIPCIÓN</th><th style="width: 15%;">CANTIDAD</th><th style="width: 15%;">UNIDAD</th></tr>
          </thead>
          <tbody>
              ${wasteRows}
              
              <tr class="totals-row">
                  <td colspan="2" style="border: none;"></td>
                  <td style="text-align: right; font-weight: bold; border-left: 1px solid #aaa;">Subtotal:</td>
                  <td style="text-align: right;">${formatCurrency(subtotal)}</td>
              </tr>
              <tr class="totals-row">
                  <td colspan="2" style="border: none;"></td>
                  <td style="text-align: right; font-weight: bold; border-left: 1px solid #aaa;">IVA (16%):</td>
                  <td style="text-align: right;">${formatCurrency(iva)}</td>
              </tr>
              <tr class="totals-row">
                  <td colspan="2" style="border: none;"></td>
                  <td style="text-align: right; font-weight: bold; color: #1e3a5f; font-size: 1.1em; border-left: 1px solid #aaa; border-bottom: 1px solid #aaa;">Total:</td>
                  <td style="text-align: right; font-weight: bold; color: #1e3a5f; font-size: 1.1em; border-bottom: 1px solid #aaa;">${formatCurrency(total)}</td>
              </tr>
          </tbody>
      </table>

      <h2>II. Condiciones Comerciales</h2>
      <ol class="list">
          <li><strong>Impuestos:</strong> Los precios indicados son más 16% de IVA.</li>
          <li><strong>Términos de pago:</strong> Pago por adelantado del concepto de transporte al 100% para la programación del servicio.</li>
          <li><strong>Vigencia:</strong> La presente cotización tiene una vigencia de ${quoteData.validityDays} días y no cuenta con financiamiento.</li>
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
          Vigencia: ${quoteData.validityDays} días naturales a partir del ${dateStr}.
      </footer>
    </body>
    </html>
  `;
};