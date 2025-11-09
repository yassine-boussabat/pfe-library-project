import * as React from 'react';
import { Filter, Heart } from 'lucide-react';

interface FilterSidebarProps {
  years: number[];
  selectedDepartment: string;
  selectedYear: number | null;
  selectedKeywords: string[];
  availableKeywords: string[];
  showFavoritesOnly: boolean;
  favoritesCount: number;
  onDepartmentChange: (department: string) => void;
  onYearChange: (year: number | null) => void;
  onKeywordToggle: (keyword: string) => void;
  onFavoritesToggle: (checked: boolean) => void;
  onClearFilters: () => void;
  onApplyFilters?: () => void;
}

const FilterSidebar = ({
  years,
  selectedDepartment,
  selectedYear,
  selectedKeywords,
  availableKeywords,
  showFavoritesOnly,
  favoritesCount,
  onDepartmentChange,
  onYearChange,
  onKeywordToggle,
  onFavoritesToggle,
  onClearFilters,
  onApplyFilters
}: FilterSidebarProps) => {

  const allDepartments = [
    'Informatique',
    'Génie Électrique', 
    'Génie Mécanique',
    'Génie Civil',
    'Sciences des Données',
    'Gestion et Administration',
    'Télécommunications'
  ];

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    onDepartmentChange(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value;
    onYearChange(value ? parseInt(value) : null);
  };

  const handleKeywordToggle = (keyword: string): void => {
    onKeywordToggle(keyword);
  };

  const handleFavoritesToggle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onFavoritesToggle(e.target.checked);
  };

  const handleClearFilters = (): void => {
    onClearFilters();
  };

  const handleApplyFilters = (): void => {
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtres
        </h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Réinitialiser
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Département
        </label>
        <select
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Tous les départements</option>
          {allDepartments.map((dept: string) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Année
        </label>
        <select
          value={selectedYear || ''}
          onChange={handleYearChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Toutes les années</option>
          {years.length > 0 ? (
            years.map((year: number) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))
          ) : (
            [2025, 2024, 2023, 2022, 2021].map((year: number) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mots-clés
        </label>
        <div className="max-h-48 overflow-y-auto space-y-1 border rounded-md p-2 bg-gray-50">
          {availableKeywords.length > 0 ? (
            availableKeywords.map((keyword: string) => (
              <label
                key={keyword}
                className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedKeywords.includes(keyword)}
                  onChange={() => handleKeywordToggle(keyword)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-sm text-gray-700 flex-1">{keyword}</span>
              </label>
            ))
          ) : (
            <div className="text-sm text-gray-500 p-2">Aucun mot-clé disponible - ajoutez d'abord des documents</div>
          )}
        </div>
      </div>

      <div className="mb-4 pt-4 border-t border-gray-200">
        <label className="flex items-center space-x-2 cursor-pointer group p-2 rounded hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={handleFavoritesToggle}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4"
          />
          <Heart 
            className={`h-4 w-4 transition-colors ${showFavoritesOnly ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-500'}`} 
          />
          <span className="text-sm font-medium text-gray-700 flex-1 group-hover:text-red-600 transition-colors">
            Mes favoris
          </span>
        </label>
        {showFavoritesOnly && (
          <div className="mt-2 ml-8 text-xs text-gray-500">
            {favoritesCount} livre{favoritesCount !== 1 ? 's' : ''} favori{favoritesCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {onApplyFilters && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={handleApplyFilters}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Appliquer les filtres
          </button>
        </div>
      )}

      {(selectedDepartment || selectedYear || selectedKeywords.length > 0 || showFavoritesOnly) && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-gray-500">
            Filtres actifs : {[
              selectedDepartment && 'Département',
              selectedYear && 'Année', 
              selectedKeywords.length > 0 && `${selectedKeywords.length} Mots-clés`,
              showFavoritesOnly && 'Favoris'
            ].filter(Boolean).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
