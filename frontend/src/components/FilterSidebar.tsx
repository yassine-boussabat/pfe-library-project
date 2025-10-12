import * as React from 'react';
import { Filter, X } from 'lucide-react';

interface FilterSidebarProps {
  years: number[];
  selectedDepartment: string;
  selectedYear: number | null;
  selectedKeywords: string[];
  availableKeywords: string[];
  onDepartmentChange: (department: string) => void;
  onYearChange: (year: number | null) => void;
  onKeywordToggle: (keyword: string) => void;
  onClearFilters: () => void;
  onApplyFilters?: () => void;
}

const FilterSidebar = ({
  years,
  selectedDepartment,
  selectedYear,
  selectedKeywords,
  availableKeywords,
  onDepartmentChange,
  onYearChange,
  onKeywordToggle,
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
          Filters
        </h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Department
        </label>
        <select
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">All Departments</option>
          {allDepartments.map((dept: string) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Year
        </label>
        <select
          value={selectedYear || ''}
          onChange={handleYearChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">All Years</option>
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
          Keywords
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
            <div className="text-sm text-gray-500 p-2">No keywords available - add some documents first</div>
          )}
        </div>
      </div>

      {onApplyFilters && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={handleApplyFilters}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply Filters
          </button>
        </div>
      )}

      {(selectedDepartment || selectedYear || selectedKeywords.length > 0) && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-gray-500">
            Active filters: {[
              selectedDepartment && 'Department',
              selectedYear && 'Year', 
              selectedKeywords.length > 0 && `${selectedKeywords.length} Keywords`
            ].filter(Boolean).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
