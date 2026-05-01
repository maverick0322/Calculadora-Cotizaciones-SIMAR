import { QuoteDraft } from '../../../shared/types/Quote';

export const getDetailedQuoteHtml = (data: QuoteDraft, logoBase64?: string) => {
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('es-MX');

  const servicesHtml = data.services.map((s, idx) => {
    // 1. Residuos (Descripción, Cantidad, Unidad, Precio Acumulado)
    const wastesRows = s.wastes.map(w => `
      <tr>
        <td style="padding: 6px; border-bottom: 1px solid #eee;">${w.name} <span style="color:#6b7280; font-size:10px;">(${w.type})</span></td>
        <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: center;">${w.quantity}</td>
        <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: center;">${w.unit}</td>
        <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: right;">$${(w.quantity * w.pricePerUnit).toFixed(2)}</td>
      </tr>
    `).join('');

    // 2. Vehículos
    const vehiclesRows = s.vehicles.map(v => `
      <tr>
        <td style="padding: 6px; border-bottom: 1px solid #eee;">${v.name}</td>
        <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: center;">${v.quantity}</td>
        <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: right;">$${(v.quantity * v.unitPrice).toFixed(2)}</td>
      </tr>
    `).join('');

    // 3. Personal (Choferes/Técnicos)
    const crewRows = s.crew.map(c => `
      <tr>
        <td style="padding: 6px; border-bottom: 1px solid #eee;">${c.type === 'driver' ? 'Chofer' : 'Técnico Operativo'}</td>
        <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: center;">${c.quantity}</td>
        <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: right;">$${(c.quantity * c.dailySalary).toFixed(2)}</td>
      </tr>
    `).join('');

    // 4. Insumos
    const suppliesRows = s.supplies.map(sup => `
      <tr>
        <td style="padding: 6px; border-bottom: 1px solid #eee;">${sup.name}</td>
        <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: center;">${sup.quantity}</td>
        <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: right;">$${(sup.quantity * sup.unitPrice).toFixed(2)}</td>
      </tr>
    `).join('');

    // 5. Extras
    const extrasRows = s.extraCosts.map(e => `
      <tr>
        <td style="padding: 6px; border-bottom: 1px solid #eee;">${e.description}</td>
        <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: right;">$${e.amount.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <div style="margin-top: 25px; border: 1px solid #d1d5db; border-radius: 8px; padding: 15px; background-color: #fff;">
        <h3 style="color: #1e3a8a; margin-top: 0; border-bottom: 2px solid #bfdbfe; padding-bottom: 5px; font-size: 16px;">
          Servicio #${idx + 1}: Sucursal ${s.location.municipality}
        </h3>
        
        ${s.wastes.length > 0 ? `
          <h4 style="font-size: 12px; color: #374151; margin: 15px 0 5px 0; background: #f3f4f6; padding: 4px 8px; border-left: 3px solid #3b82f6;">♻️ Residuos</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead><tr style="color: #6b7280;"><th style="text-align: left; padding: 4px;">Descripción</th><th style="text-align: center; padding: 4px;">Cantidad</th><th style="text-align: center; padding: 4px;">Unidad</th><th style="text-align: right; padding: 4px;">Precio Acumulado</th></tr></thead>
            <tbody>${wastesRows}</tbody>
          </table>
        ` : ''}

        ${s.vehicles.length > 0 ? `
          <h4 style="font-size: 12px; color: #374151; margin: 15px 0 5px 0; background: #f3f4f6; padding: 4px 8px; border-left: 3px solid #10b981;">🚛 Vehículos</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead><tr style="color: #6b7280;"><th style="text-align: left; padding: 4px;">Descripción</th><th style="text-align: center; padding: 4px;">Cantidad</th><th style="text-align: right; padding: 4px;">Precio Acumulado</th></tr></thead>
            <tbody>${vehiclesRows}</tbody>
          </table>
        ` : ''}

        ${s.crew.length > 0 ? `
          <h4 style="font-size: 12px; color: #374151; margin: 15px 0 5px 0; background: #f3f4f6; padding: 4px 8px; border-left: 3px solid #f59e0b;">👷 Personal</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead><tr style="color: #6b7280;"><th style="text-align: left; padding: 4px;">Descripción</th><th style="text-align: center; padding: 4px;">Cantidad</th><th style="text-align: right; padding: 4px;">Precio Acumulado</th></tr></thead>
            <tbody>${crewRows}</tbody>
          </table>
        ` : ''}

        ${s.supplies.length > 0 ? `
          <h4 style="font-size: 12px; color: #374151; margin: 15px 0 5px 0; background: #f3f4f6; padding: 4px 8px; border-left: 3px solid #8b5cf6;">📦 Insumos</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead><tr style="color: #6b7280;"><th style="text-align: left; padding: 4px;">Descripción</th><th style="text-align: center; padding: 4px;">Cantidad</th><th style="text-align: right; padding: 4px;">Precio Acumulado</th></tr></thead>
            <tbody>${suppliesRows}</tbody>
          </table>
        ` : ''}

        ${s.extraCosts.length > 0 ? `
          <h4 style="font-size: 12px; color: #374151; margin: 15px 0 5px 0; background: #fef2f2; padding: 4px 8px; border-left: 3px solid #ef4444;">⚠️ Costos Extra</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead><tr style="color: #6b7280;"><th style="text-align: left; padding: 4px;">Descripción</th><th style="text-align: right; padding: 4px;">Precio</th></tr></thead>
            <tbody>${extrasRows}</tbody>
          </table>
        ` : ''}
      </div>
    `;
  }).join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; padding: 40px; background-color: #f9fafb;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1d4ed8; padding-bottom: 20px;">
          <div>
            ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 70px; margin-bottom: 10px;" />` : ''}
            <h1 style="color: #1d4ed8; margin: 0; font-size: 24px;">COTIZACIÓN DETALLADA</h1>
            <p style="font-size: 13px; color: #666; margin: 5px 0 0 0;">Folio: <b>#${data.id || 'NUEVO'}</b> | Fecha: <b>${formatDate(data.createdAt)}</b></p>
          </div>
        </div>
        <div style="margin-top: 25px; background: #fff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px;">
          <h2 style="font-size: 15px; margin-top: 0; color: #111827;">DATOS DEL CLIENTE</h2>
          <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <div><p style="margin: 3px 0;"><b>Razón Social:</b> ${data.clientName || 'N/A'}</p><p style="margin: 3px 0;"><b>RFC:</b> ${data.clientRfc || '-'}</p></div>
            <div style="text-align: right;"><p style="margin: 3px 0;"><b>Atención a:</b> ${data.contactName || '-'}</p></div>
          </div>
        </div>
        ${servicesHtml}
        <div style="margin-top: 30px; text-align: right; border-top: 2px solid #1d4ed8; padding-top: 15px; background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="font-size: 14px; margin: 2px 0;">Subtotal: <b>$${(data.subtotal || 0).toFixed(2)}</b></p>
          <p style="font-size: 14px; margin: 2px 0;">IVA (16%): <b>$${((data.subtotal || 0) * 0.16).toFixed(2)}</b></p>
          <h2 style="color: #1d4ed8; margin: 10px 0 0 0; font-size: 22px;">TOTAL: $${(data.total || 0).toFixed(2)}</h2>
        </div>
      </body>
    </html>
  `;
};