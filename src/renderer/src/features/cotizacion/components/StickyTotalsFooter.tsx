interface StickyTotalsFooterProps {
  breakdown: { logistics: number; vehicles: number; crew: number; supplies: number; extras: number; wastes: number; };
  subtotal: number;
  total: number;
}

export const StickyTotalsFooter = ({ breakdown, subtotal, total }: StickyTotalsFooterProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] flex flex-wrap justify-center md:justify-between items-center px-10 z-50">
      <div className="flex gap-8 text-xs text-gray-400 hidden md:flex">
        <div>
          <p>Logística</p>
          <p className="text-white font-mono">${breakdown.logistics.toFixed(2)}</p>
        </div>
        <div>
          <p>Operación</p>
          <p className="text-white font-mono">${(breakdown.vehicles + breakdown.crew).toFixed(2)}</p>
        </div>
        <div>
          <p>Insumos/Extras</p>
          <p className="text-white font-mono">${(breakdown.supplies + breakdown.extras).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-blue-300">Residuos</p>
          <p className="text-white font-mono">${(breakdown.wastes || 0).toFixed(2)}</p>
        </div>
      </div>
      
      <div className="text-right flex items-center gap-6">
        <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Subtotal: ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-sm text-gray-400">+ IVA</span>
              <p className="text-3xl font-bold text-green-400 font-mono">
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
        </div>
        <button
          type="submit"
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition shadow-lg text-lg"
        >
          Revisar
        </button>
      </div>
    </div>
  );
};