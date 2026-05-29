import { CalendarDays, Search, X } from 'lucide-react';

interface DashboardSearchBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedMonth?: string;
  setSelectedMonth?: (val: string) => void;
  placeholder?: string;
}

export const DashboardSearchBar = ({ searchTerm, setSearchTerm, selectedMonth, setSelectedMonth, placeholder = "Buscar por folio, cliente o residuo..." }: DashboardSearchBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <div className="relative max-w-md w-full sm:w-72">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {setSelectedMonth && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 shadow-sm">
          <CalendarDays className="h-4 w-4 text-blue-600" />
          <label className="text-xs font-semibold text-blue-900 whitespace-nowrap" htmlFor="quote-month-filter">
            Mes
          </label>
          <input
            id="quote-month-filter"
            type="month"
            className="w-full sm:w-36 bg-white/80 border border-blue-100 rounded-md px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMonth || ''}
            onChange={(e) => setSelectedMonth(e.target.value)}
            aria-label="Filtrar por mes"
          />
          {selectedMonth && (
            <button
              type="button"
              onClick={() => setSelectedMonth('')}
              className="p-1 rounded-md text-blue-700 hover:bg-blue-100 transition-colors"
              title="Limpiar filtro de mes"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
