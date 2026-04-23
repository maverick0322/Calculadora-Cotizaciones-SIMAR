import { QuoteDraft } from '../../../shared/types/Quote';

export const buildQuoteHtml = (quoteData: QuoteDraft, logoBase64: string): string => {
  const createdAt = new Date(quoteData.createdAt);
  const dateStr = createdAt.toLocaleDateString('es-MX', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  const logoHtml = logoBase64 
    ? `<img src="${logoBase64}" alt="Logo SIMAR" style="max-height: 70px;">`
    : `<h1 style="color: #1e3a5f; margin: 0;">SIMAR</h1>`;

  const activityMap: Record<string, string> = {
    collection: 'Recolección',
    transport: 'Transporte',
    transfer: 'Transferencia',
    final_disposal: 'Disposición Final'
  };

  const frequencyMap: Record<string, string> = {
    one_time: 'Evento Único', daily: 'Diaria', weekly: 'Semanal', biweekly: 'Quincenal', monthly: 'Mensual'
  };
  const freqString = quoteData.frequency.type === 'custom' 
    ? quoteData.frequency.customDescription 
    : frequencyMap[quoteData.frequency.type] || quoteData.frequency.type;

  const servicesHtmlBlocks = quoteData.services.map((service, index) => {
    const loc = service.location;
    const fullLocation = `${loc.street}, ${loc.neighborhood}, ${loc.municipality}, ${loc.state}`;
    const activityName = activityMap[service.activity] || service.activity;

    const wasteRows = service.wastes.length > 0 ? service.wastes.map((waste, wIdx) => `
      <tr>
          <td style="text-align: center;">${wIdx + 1}</td>
          <td>${waste.name} (Clasificación: ${waste.type})</td>
          <td style="text-align: center;">${waste.quantity}</td>
          <td style="text-align: center;">${waste.unit}</td>
      </tr>
    `).join('') : `<tr><td colspan="4" style="text-align: center; color: #666;">Sin residuos listados para recolección</td></tr>`;

    return `
      <div class="service-block">
        <h3 class="service-title">Sucursal / Servicio ${index + 1}: ${fullLocation}</h3>
        <p style="margin: 5px 0 10px 0; font-size: 0.9em; color: #444;">
          <strong>Actividad:</strong> ${activityName} | 
          <strong>Logística:</strong> Origen: ${service.logistics.origin || 'N/A'} ➔ Destino: ${service.logistics.primaryDestination || 'N/A'} (${service.logistics.kilometers} km)
        </p>
        
        <table class="waste-table">
            <thead>
                <tr><th style="width: 5%;">No.</th><th>DESCRIPCIÓN DE RESIDUO</th><th style="width: 15%;">CANTIDAD</th><th style="width: 15%;">UNIDAD</th></tr>
            </thead>
            <tbody>
                ${wasteRows}
            </tbody>
        </table>
      </div>
    `;
  }).join('');

  // Cálculos financieros globales
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
            body { font-family: Arial, sans-serif; margin: 0 auto; max-width: 1000px; line-height: 1.5; color: #1a1a1a; padding: 30px 40px; background: #fff; }
            .header { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
            .address { font-size: 0.95em; margin-top: 15px; }
            .ref { font-weight: bold; margin: 15px 0 5px; color: #1e3a5f; }
            .date-line { color: #2c3e66; margin-bottom: 20px; font-size: 0.9em; }
            h2 { border-bottom: 2px solid #ccc; padding-bottom: 5px; color: #1e3a5f; font-size: 1.1em; margin-top: 25px; }
            
            /* Estilos de la iteración de servicios */
            .service-block { margin-bottom: 25px; border-left: 3px solid #1e3a5f; padding-left: 15px; }
            .service-title { color: #1e3a5f; font-size: 1.05em; margin: 0; padding-bottom: 3px; border-bottom: 1px dotted #e0e0e0; }
            
            table { width: 100%; border-collapse: collapse; font-size: 0.85em; margin-bottom: 10px;}
            th, td { border: 1px solid #aaa; padding: 6px 10px; text-align: left; }
            th { background-color: #eef4fc; text-align: center; }
            
            /* Totales */
            .totals-container { width: 100%; display: flex; justify-content: flex-end; margin-top: 20px; }
            .totals-table { width: 40%; border: none; }
            .totals-table td { border: none; padding: 4px 10px; text-align: right; }
            .totals-table .label { font-weight: bold; color: #333; }
            .totals-table .total-row td { border-top: 1px solid #aaa; color: #1e3a5f; font-size: 1.2em; font-weight: bold; padding-top: 8px; }
            
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
                  <strong>Cliente:</strong> ${quoteData.clientName}<br>
                  <strong>RFC:</strong> ${quoteData.clientRfc || 'N/D'}
              </div>
          </div>
          <div style="text-align: right;">
              <div class="ref">REF: ${quoteData.folio || `Borrador #${quoteData.id}`}</div>
              <div class="date-line">${dateStr}</div>
              <div style="font-size: 0.85em; color: #555;">
                <strong>Vigencia:</strong> ${quoteData.validityDays} días<br>
                <strong>Frecuencia Global:</strong> ${freqString}
              </div>
          </div>
      </div>

      <p style="font-size: 0.9em; text-align: justify;">Por medio del presente envío propuesta económica referente a la prestación de servicios para el manejo integral de residuos. Dicho servicio se realizará en los sitios autorizados por La Secretaría de Medio Ambiente del Estado de Veracruz, desglosados de la siguiente manera:</p>

      <h2>I. Alcance y Precios por Sucursal</h2>
      
      ${servicesHtmlBlocks}
      
      <div class="totals-container">
        <table class="totals-table">
            <tr>
                <td class="label">Subtotal:</td>
                <td>${formatCurrency(subtotal)}</td>
            </tr>
            <tr>
                <td class="label">IVA (16%):</td>
                <td>${formatCurrency(iva)}</td>
            </tr>
            <tr class="total-row">
                <td class="label">TOTAL:</td>
                <td>${formatCurrency(total)}</td>
            </tr>
        </table>
      </div>

      <h2>II. Condiciones Comerciales</h2>
      <ol class="list">
          <li><strong>Impuestos:</strong> Los precios indicados son más 16% de IVA.</li>
          <li><strong>Términos de pago:</strong> Pago por adelantado del concepto de transporte al 100% para la programación del servicio.</li>
          <li><strong>Vigencia:</strong> La presente cotización tiene una vigencia de ${quoteData.validityDays} días y no cuenta con financiamiento.</li>
          <li><strong>Aceptación del servicio:</strong> Se requiere sea confirmada la aceptación de la presente cotización, con firma de recibido.</li>
          <li><strong>Programación del servicio:</strong> Solicitar por escrito al área comercial en un lapso de 8 días hábiles.</li>
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

      <div class="signature">
          <p>ATENTAMENTE</p>
          <p style="margin-top: 10px;">Departamento Comercial</p>
      </div>

      <footer>
          Todos los precios están expresados en moneda nacional más IVA.<br>
          Vigencia: ${quoteData.validityDays} días naturales a partir del ${dateStr}.
      </footer>
    </body>
    </html>
  `;
};