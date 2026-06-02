import { QuoteDraft, ServiceItem, CatalogQuoteItem } from '../../../shared/types/Quote';
import { IVA_RATE, QUOTE_TYPE_LABELS, SERVICE_TYPE_LABELS } from '../../../shared/constants/quoteConstants';

const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const toRoman = (value: number): string => {
  const romanMap: Array<[number, string]> = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I']
  ];
  let remaining = value;
  let result = '';

  for (const [arabic, roman] of romanMap) {
    while (remaining >= arabic) {
      result += roman;
      remaining -= arabic;
    }
  }

  return result;
};

const buildLocation = (service: ServiceItem): string => {
  const location = service.location;
  const parts = [location?.street, location?.neighborhood, location?.municipality, location?.state].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Ubicación no requerida';
};

const buildResidueRows = (service: ServiceItem): string => {
  if (service.wastes.length === 0) {
    return `<tr><td colspan="5" class="empty">Sin residuos listados para recolección</td></tr>`;
  }

  return service.wastes.map((waste, index) => `
    <tr>
      <td class="center">${index + 1}</td>
      <td>${escapeHtml(waste.clave || 'N/D')}</td>
      <td>${escapeHtml(waste.name)}${waste.specificDescription ? `<br><span class="muted">${escapeHtml(waste.specificDescription)}</span>` : ''}</td>
      <td>${escapeHtml(waste.classification || waste.type || 'N/D')}</td>
      <td class="center">${escapeHtml(waste.quantity)} ${escapeHtml(waste.unit)}</td>
    </tr>
  `).join('');
};

const buildRpbiRows = (service: ServiceItem): string => {
  if (service.wastes.length === 0) {
    return `<tr><td colspan="4" class="empty">Sin residuos RPBI listados</td></tr>`;
  }

  return service.wastes.map((waste, index) => `
    <tr>
      <td class="center">${index + 1}</td>
      <td>${escapeHtml(waste.name)}</td>
      <td class="center">${escapeHtml(waste.quantity)}</td>
      <td class="center">${escapeHtml(waste.unit)}</td>
    </tr>
  `).join('');
};

const getProductItems = (service: ServiceItem): CatalogQuoteItem[] => [
  ...service.supplies,
  ...service.tools,
  ...service.materials,
  ...service.equipment,
  ...service.specializedEpp
];

const buildProductRows = (service: ServiceItem): string => {
  const items = getProductItems(service);
  if (items.length === 0) return '';

  return `
    <h4 class="sub-title">Materiales, herramientas, equipo e insumos</h4>
    <table>
      <thead>
        <tr><th>No.</th><th>Producto</th><th>Cantidad</th><th>Total</th></tr>
      </thead>
      <tbody>
        ${items.map((item, index) => `
          <tr>
            <td class="center">${index + 1}</td>
            <td>${escapeHtml(item.name)}</td>
            <td class="center">${escapeHtml(item.quantity)}</td>
            <td class="right">${formatCurrency(item.quantity * (item.unitPrice || 0))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};

const buildServiceTable = (service: ServiceItem): string => {
  if (service.serviceType === 'rpbi') {
    return `
      <table>
        <thead>
          <tr><th>No.</th><th>Residuo RPBI</th><th>Cantidad</th><th>Unidad</th></tr>
        </thead>
        <tbody>${buildRpbiRows(service)}</tbody>
      </table>
    `;
  }

  if (service.serviceType === 'rme' || service.serviceType === 'hazardous_waste') {
    return `
      <table>
        <thead>
          <tr><th>No.</th><th>Clave</th><th>Descripción del residuo</th><th>Clasificación</th><th>Cantidad</th></tr>
        </thead>
        <tbody>${buildResidueRows(service)}</tbody>
      </table>
    `;
  }

  return '';
};

const buildServicesHtml = (quoteData: QuoteDraft): string =>
  quoteData.services.map((service, index) => {
    const serviceName = SERVICE_TYPE_LABELS[service.serviceType] || service.serviceType;
    const serviceTable = buildServiceTable(service);
    const productTable = buildProductRows(service);

    return `
      <div class="service-block">
        <h3 class="service-title">Servicio ${index + 1}: ${escapeHtml(serviceName)}</h3>
        <p class="service-meta"><strong>Ubicación:</strong> ${escapeHtml(buildLocation(service))}</p>
        ${service.logistics?.origin || service.logistics?.primaryDestination ? `
          <p class="service-meta"><strong>Logística:</strong> Origen: ${escapeHtml(service.logistics.origin || 'N/A')} - Destino: ${escapeHtml(service.logistics.primaryDestination || 'N/A')}</p>
        ` : ''}
        ${serviceTable}
        ${productTable}
      </div>
    `;
  }).join('');

const buildConditionsHtml = (quoteData: QuoteDraft): string => {
  const conditions = quoteData.conditions ?? [];
  if (conditions.length === 0) return '';

  return `
    <h2>II. Anexos de condiciones</h2>
    <ol class="roman-list">
      ${conditions.map((condition, index) => `
        <li>
          <span class="roman">${toRoman(index + 1)}.</span>
          <span><strong>${escapeHtml(condition.title)}:</strong> ${escapeHtml(condition.description)}</span>
        </li>
      `).join('')}
    </ol>
  `;
};

export const buildQuoteHtml = (quoteData: QuoteDraft, logoBase64: string): string => {
  const issuedOrCreatedAt = new Date(quoteData.issuedAt ?? quoteData.createdAt);
  const dateStr = issuedOrCreatedAt.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const quoteTypeLabel = quoteData.quoteTypeCode ? QUOTE_TYPE_LABELS[quoteData.quoteTypeCode] : 'Propuesta de servicios';
  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" alt="Logo SIMAR" style="max-height: 70px;">`
    : `<h1 style="color: #1e3a5f; margin: 0;">SIMAR</h1>`;

  const subtotal = quoteData.subtotal || 0;
  const iva = subtotal * IVA_RATE;
  const total = quoteData.total || 0;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0 auto; max-width: 1000px; line-height: 1.5; color: #1a1a1a; padding: 30px 40px; background: #fff; }
        .header { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; gap: 30px; }
        .address { font-size: 0.95em; margin-top: 15px; }
        .meta-box { min-width: 240px; text-align: right; font-size: 0.86em; color: #333; }
        .meta-box div { margin-bottom: 5px; }
        .ref { font-weight: bold; color: #1e3a5f; }
        h2 { border-bottom: 2px solid #ccc; padding-bottom: 5px; color: #1e3a5f; font-size: 1.1em; margin-top: 25px; }
        .service-block { margin-bottom: 25px; border-left: 3px solid #1e3a5f; padding-left: 15px; break-inside: avoid; }
        .service-title { color: #1e3a5f; font-size: 1.05em; margin: 0; padding-bottom: 3px; border-bottom: 1px dotted #e0e0e0; }
        .service-meta { margin: 5px 0 10px 0; font-size: 0.9em; color: #444; }
        .sub-title { font-size: 0.9em; margin: 14px 0 6px; color: #1e3a5f; }
        table { width: 100%; border-collapse: collapse; font-size: 0.84em; margin-bottom: 10px; }
        th, td { border: 1px solid #aaa; padding: 6px 10px; text-align: left; vertical-align: top; }
        th { background-color: #eef4fc; text-align: center; }
        .center { text-align: center; }
        .right { text-align: right; }
        .empty { text-align: center; color: #666; }
        .muted { color: #666; font-size: 0.9em; }
        .totals-container { width: 100%; display: flex; justify-content: flex-end; margin-top: 20px; }
        .totals-table { width: 40%; border: none; }
        .totals-table td { border: none; padding: 4px 10px; text-align: right; }
        .totals-table .label { font-weight: bold; color: #333; }
        .totals-table .total-row td { border-top: 1px solid #aaa; color: #1e3a5f; font-size: 1.2em; font-weight: bold; padding-top: 8px; }
        .roman-list { margin: 15px 0; padding: 0; font-size: 0.85em; list-style: none; }
        .roman-list li { display: grid; grid-template-columns: 38px 1fr; gap: 8px; margin-bottom: 8px; text-align: justify; }
        .roman { font-weight: bold; color: #1e3a5f; }
        .signature { margin-top: 40px; font-weight: bold; color: #1e3a5f; }
        footer { margin-top: 40px; font-size: 0.8em; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          ${logoHtml}
          <div class="address">
            <strong>Cliente:</strong> ${escapeHtml(quoteData.clientName)}<br>
            <strong>RFC:</strong> ${escapeHtml(quoteData.clientRfc || 'N/D')}
            ${quoteData.contactName ? `<br><strong>Atención a:</strong> ${escapeHtml(quoteData.contactName)}` : ''}
          </div>
        </div>
        <div class="meta-box">
          <div><span class="ref">Folio:</span> ${escapeHtml(quoteData.folio || `Cotización #${quoteData.id}`)}</div>
          <div><strong>Fecha:</strong> ${escapeHtml(dateStr)}</div>
          <div><strong>Quién elaboró:</strong> ${escapeHtml(quoteData.preparedByInitials || 'N/D')}</div>
          <div><strong>Tipo:</strong> ${escapeHtml(quoteTypeLabel)}</div>
          <div><strong>Vigencia:</strong> ${escapeHtml(quoteData.validityDays)} días</div>
        </div>
      </div>

      <p style="font-size: 0.9em; text-align: justify;">
        Por medio del presente envío propuesta económica referente a la prestación de servicios solicitados,
        desglosados de la siguiente manera:
      </p>

      <h2>I. Alcance y precios</h2>
      ${buildServicesHtml(quoteData)}

      <div class="totals-container">
        <table class="totals-table">
          <tr><td class="label">Subtotal:</td><td>${formatCurrency(subtotal)}</td></tr>
          <tr><td class="label">IVA (16%):</td><td>${formatCurrency(iva)}</td></tr>
          <tr class="total-row"><td class="label">TOTAL:</td><td>${formatCurrency(total)}</td></tr>
        </table>
      </div>

      ${buildConditionsHtml(quoteData)}

      <div class="signature">
        <p>ATENTAMENTE</p>
        <p style="margin-top: 10px;">Departamento Comercial</p>
      </div>

      <footer>
        Todos los precios están expresados en moneda nacional más IVA.<br>
        Vigencia: ${escapeHtml(quoteData.validityDays)} días naturales a partir del ${escapeHtml(dateStr)}.
      </footer>
    </body>
    </html>
  `;
};
