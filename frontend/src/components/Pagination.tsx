import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isMobile?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isMobile = false
}) => {
  if (totalPages <= 1) return null;

  const goToPrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  if (isMobile) {
    return (
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={goToPrevious}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        
        <span className="text-sm text-gray-600 px-4">
          {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={goToNext}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={goToPrevious}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <div className="flex gap-1">
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let pageNumber;
          if (totalPages <= 7) {
            pageNumber = i + 1;
          } else if (currentPage <= 4) {
            pageNumber = i + 1;
          } else if (currentPage >= totalPages - 3) {
            pageNumber = totalPages - 6 + i;
          } else {
            pageNumber = currentPage - 3 + i;
          }

          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`
                w-10 h-10 rounded-lg text-sm font-medium transition-colors
                ${currentPage === pageNumber
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      <button
        onClick={goToNext}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
