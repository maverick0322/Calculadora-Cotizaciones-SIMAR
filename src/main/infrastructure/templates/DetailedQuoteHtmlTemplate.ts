import { QuoteDraft } from '../../../shared/types/Quote';

export const getDetailedQuoteHtml = (data: QuoteDraft, logoBase64?: string) => {
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('es-MX');

  const servicesHtml = data.services.map((s, idx) => `
    <div style="margin-top: 25px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
      <h3 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">
        Servicio #${idx + 1}: ${s.activity.toUpperCase()}
      </h3>
      <p style="font-size: 12px; color: #6b7280;">
        <b>Ubicación:</b> ${s.location.street}, ${s.location.neighborhood}, ${s.location.municipality}, ${s.location.state}
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #eee;">Residuo</th>
            <th style="text-align: center; padding: 8px; border-bottom: 1px solid #eee;">Cant.</th>
            <th style="text-align: center; padding: 8px; border-bottom: 1px solid #eee;">Unidad</th>
            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">P. Unit</th>
            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${s.wastes.map(w => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${w.name} (${w.type})</td>
              <td style="text-align: center; padding: 8px; border-bottom: 1px solid #f3f4f6;">${w.quantity}</td>
              <td style="text-align: center; padding: 8px; border-bottom: 1px solid #f3f4f6;">${w.unit}</td>
              <td style="text-align: right; padding: 8px; border-bottom: 1px solid #f3f4f6;">$${w.pricePerUnit.toFixed(2)}</td>
              <td style="text-align: right; padding: 8px; border-bottom: 1px solid #f3f4f6;">$${(w.quantity * w.pricePerUnit).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 10px; color: #4b5563;">
        <div>
          <b>Logística y Viáticos:</b> $${(
            (s.logistics.fuelLiters * s.logistics.fuelPricePerLiter) + 
            (s.logistics.totalTollCost || 0) + 
            s.logistics.viaticos
          ).toFixed(2)}
        </div>
        <div>
          <b>Equipamiento e Insumos:</b> $${(
            s.vehicles.reduce((a, b) => a + (b.quantity * b.unitPrice), 0) +
            s.supplies.reduce((a, b) => a + (b.quantity * b.unitPrice), 0)
          ).toFixed(2)}
        </div>
      </div>
    </div>
  `).join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; padding: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 60px; margin-bottom: 10px;" />` : ''}
            <h1 style="color: #1d4ed8; margin: 0;">COTIZACIÓN DETALLADA</h1>
            <p style="font-size: 12px; color: #666;">Folio: #${data.id || 'NUEVO'} | Fecha: ${formatDate(data.createdAt)}</p>
          </div>
        </div>

        <div style="margin-top: 30px; background: #f3f4f6; padding: 15px; border-radius: 5px;">
          <h2 style="font-size: 14px; margin-top: 0;">DATOS DEL CLIENTE</h2>
          <p style="font-size: 12px; margin: 2px 0;"><b>Razón Social:</b> ${data.clientName}</p>
          <p style="font-size: 12px; margin: 2px 0;"><b>RFC:</b> ${data.clientRfc}</p>
          <p style="font-size: 12px; margin: 2px 0;"><b>Atención a:</b> ${data.contactName || 'N/A'}</p>
        </div>

        ${servicesHtml}

        <div style="margin-top: 30px; text-align: right; border-top: 2px solid #1d4ed8; padding-top: 10px;">
          <p style="font-size: 14px; margin: 2px 0;">Subtotal: $${(data.subtotal || 0).toFixed(2)}</p>
          <p style="font-size: 14px; margin: 2px 0;">IVA (16%): $${((data.subtotal || 0) * 0.16).toFixed(2)}</p>
          <h2 style="color: #1d4ed8; margin: 5px 0;">TOTAL: $${(data.total || 0).toFixed(2)}</h2>
        </div>
      </body>
    </html>
  `;
};