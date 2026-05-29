import { Search } from 'lucide-react';

interface DashboardSearchBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  placeholder?: string;
}

export const DashboardSearchBar = ({ searchTerm, setSearchTerm, placeholder = "Buscar por folio, cliente o residuo..." }: DashboardSearchBarProps) => {
  return (
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
  );
};