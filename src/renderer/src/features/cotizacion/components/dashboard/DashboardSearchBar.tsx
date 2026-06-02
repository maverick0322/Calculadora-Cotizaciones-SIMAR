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
        <div className="relative flex items-center rounded-lg border border-gray-200 bg-white shadow-sm ring-1 ring-transparent transition-all focus-within:border-blue-500 focus-within:ring-blue-100">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <CalendarDays className="h-4 w-4 text-blue-600" />
          </div>
          <input
            id="quote-month-filter"
            type="month"
            className="h-10 w-full min-w-40 rounded-lg border-0 bg-transparent pl-10 pr-10 text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400 sm:w-44"
            value={selectedMonth || ''}
            onChange={(e) => setSelectedMonth(e.target.value)}
            aria-label="Filtrar por mes"
          />
          <button
            type="button"
            onClick={() => setSelectedMonth('')}
            className={`absolute right-2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 ${
              selectedMonth ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            title="Limpiar filtro de mes"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
