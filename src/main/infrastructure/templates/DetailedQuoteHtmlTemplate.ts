import { QuoteDraft } from '../../../shared/types/Quote';

export const getDetailedQuoteHtml = (quoteData: QuoteDraft, logoBase64?: string): string => {
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

  const formatCurrency = (amount: number) => 
    `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const servicesHtmlBlocks = quoteData.services.map((service, index) => {
    const loc = service.location;
    const fullLocation = `${loc.street}, ${loc.neighborhood}, ${loc.municipality}, ${loc.state}`;
    const activityName = activityMap[service.activity] || service.activity;

    // 1. Residuos
    const wastesRows = service.wastes.length > 0 ? service.wastes.map((w, wIdx) => `
      <tr>
        <td style="text-align: center; width: 5%;">${wIdx + 1}</td>
        <td>${w.name} <span style="color:#666; font-size:0.9em;">(${w.type})</span></td>
        <td style="text-align: center; width: 12%;">${w.quantity}</td>
        <td style="text-align: center; width: 15%;">${w.unit}</td>
        <td style="text-align: right; width: 18%;">${formatCurrency(w.quantity * (w.pricePerUnit || 0))}</td>
      </tr>
    `).join('') : '';

    // 2. Vehículos
    const vehiclesRows = service.vehicles.length > 0 ? service.vehicles.map((v, vIdx) => `
      <tr>
        <td style="text-align: center; width: 5%;">${vIdx + 1}</td>
        <td>${v.name}</td>
        <td style="text-align: center; width: 12%;">${v.quantity}</td>
        <td style="text-align: right; width: 18%;">${formatCurrency(v.quantity * (v.unitPrice || 0))}</td>
      </tr>
    `).join('') : '';

    // 3. Personal
    const crewRows = service.crew.length > 0 ? service.crew.map((c, cIdx) => `
      <tr>
        <td style="text-align: center; width: 5%;">${cIdx + 1}</td>
        <td>${c.type === 'driver' ? 'Chofer' : 'Técnico Operativo'}</td>
        <td style="text-align: center; width: 12%;">${c.quantity}</td>
        <td style="text-align: right; width: 18%;">${formatCurrency(c.quantity * (c.dailySalary || 0))}</td>
      </tr>
    `).join('') : '';

    // 4. Insumos
    const suppliesRows = service.supplies.length > 0 ? service.supplies.map((s, sIdx) => `
      <tr>
        <td style="text-align: center; width: 5%;">${sIdx + 1}</td>
        <td>${s.name}</td>
        <td style="text-align: center; width: 12%;">${s.quantity}</td>
        <td style="text-align: right; width: 18%;">${formatCurrency(s.quantity * (s.unitPrice || 0))}</td>
      </tr>
    `).join('') : '';

    // 5. Extras
    const extrasRows = service.extraCosts.length > 0 ? service.extraCosts.map((e, eIdx) => `
      <tr>
        <td style="text-align: center; width: 5%;">${eIdx + 1}</td>
        <td colspan="2">${e.description}</td>
        <td style="text-align: right; width: 18%;">${formatCurrency(e.amount || 0)}</td>
      </tr>
    `).join('') : '';

    return `
      <div class="service-block">
        <h3 class="service-title">Sucursal / Servicio ${index + 1}: ${fullLocation}</h3>
        <p style="margin: 5px 0 10px 0; font-size: 0.9em; color: #444;">
          <strong>Actividad:</strong> ${activityName} | 
          <strong>Logística:</strong> Origen: ${service.logistics.origin || 'N/A'} ➔ Destino: ${service.logistics.primaryDestination || 'N/A'} (${service.logistics.kilometers} km)
        </p>
        
        ${service.wastes.length > 0 ? `
          <h4 class="sub-header" style="border-left-color: #3b82f6;">♻️ Desglose de Residuos</h4>
          <table>
            <thead><tr><th>No.</th><th>DESCRIPCIÓN</th><th>CANT.</th><th>UNIDAD</th><th>PRECIO ACUM.</th></tr></thead>
            <tbody>${wastesRows}</tbody>
          </table>
        ` : ''}

        ${service.vehicles.length > 0 ? `
          <h4 class="sub-header" style="border-left-color: #10b981;">🚛 Operación de Vehículos</h4>
          <table>
            <thead><tr><th>No.</th><th>DESCRIPCIÓN DEL VEHÍCULO</th><th>CANT.</th><th>PRECIO ACUM.</th></tr></thead>
            <tbody>${vehiclesRows}</tbody>
          </table>
        ` : ''}

        ${service.crew.length > 0 ? `
          <h4 class="sub-header" style="border-left-color: #f59e0b;">👷 Personal Asignado</h4>
          <table>
            <thead><tr><th>No.</th><th>CARGO OPERATIVO</th><th>CANT.</th><th>PRECIO ACUM.</th></tr></thead>
            <tbody>${crewRows}</tbody>
          </table>
        ` : ''}

        ${service.supplies.length > 0 ? `
          <h4 class="sub-header" style="border-left-color: #8b5cf6;">📦 Insumos y Materiales</h4>
          <table>
            <thead><tr><th>No.</th><th>DESCRIPCIÓN DEL INSUMO</th><th>CANT.</th><th>PRECIO ACUM.</th></tr></thead>
            <tbody>${suppliesRows}</tbody>
          </table>
        ` : ''}

        ${service.extraCosts.length > 0 ? `
          <h4 class="sub-header" style="border-left-color: #ef4444;">⚠️ Costos Extra</h4>
          <table>
            <thead><tr><th>No.</th><th colspan="2">DESCRIPCIÓN DEL CARGO</th><th>PRECIO</th></tr></thead>
            <tbody>${extrasRows}</tbody>
          </table>
        ` : ''}
      </div>
    `;
  }).join('');

  // Cálculos financieros globales
  const subtotal = quoteData.subtotal || 0;
  const iva = subtotal * 0.16;
  const total = quoteData.total || 0;

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
            .service-block { margin-bottom: 30px; border-left: 3px solid #1e3a5f; padding-left: 15px; }
            .service-title { color: #1e3a5f; font-size: 1.05em; margin: 0; padding-bottom: 3px; border-bottom: 1px dotted #e0e0e0; }
            .sub-header { font-size: 0.85em; color: #333; margin: 15px 0 5px 0; padding: 4px 8px; background: #f3f4f6; border-left: 3px solid #1e3a5f; }
            
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
                  ${quoteData.contactName ? `<br><strong>Atención a:</strong> ${quoteData.contactName}` : ''}
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

      <h2>I. Alcance y Precios por Sucursal (Desglosado)</h2>
      
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