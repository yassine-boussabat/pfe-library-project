import { useState, useEffect } from 'react';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import BookCard from './components/BookCard';
import BookModal from './components/BookModal';
import Pagination from './components/Pagination';
import driveService, { PFEBook, Filters } from './services/driveService';
import { BookOpen, RefreshCw, AlertCircle, Filter, X, Heart, Linkedin } from 'lucide-react';

function App() {
  const [books, setBooks] = useState<PFEBook[]>([]);
  const [filters, setFilters] = useState<Filters>({ 
    departments: [], 
    years: [], 
    keywords: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal state
  const [selectedBook, setSelectedBook] = useState<PFEBook | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate pagination
  const totalPages = Math.ceil(books.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = books.slice(startIndex, endIndex);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowFilters(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDepartment, selectedYear, selectedKeywords, searchQuery]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchFilters: any = {};
      if (searchQuery) searchFilters.search = searchQuery;
      if (selectedDepartment) searchFilters.department = selectedDepartment;
      if (selectedYear) searchFilters.year = selectedYear.toString();
      if (selectedKeywords.length > 0) searchFilters.keywords = selectedKeywords.join(',');
      
      const data = await driveService.fetchBooks(searchFilters);
      setBooks(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch books';
      setError(errorMessage);
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const data = await driveService.fetchFilters();
      setFilters(data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const checkConnection = async () => {
    const isConnected = await driveService.checkConnection();
    if (!isConnected) {
      setError('Unable to connect to backend API. Please make sure the server is running on localhost:5000');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
  };

  const handleYearChange = (year: number | null) => {
    setSelectedYear(year);
  };

  const handleKeywordToggle = (keyword: string) => {
    const newKeywords = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter(k => k !== keyword)
      : [...selectedKeywords, keyword];
    setSelectedKeywords(newKeywords);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('');
    setSelectedYear(null);
    setSelectedKeywords([]);
  };

  const applyFilters = () => {
    fetchBooks();
    if (isMobile) {
      setShowFilters(false);
    }
  };

  const handleBookDownload = async (book: PFEBook) => {
    try {
      await driveService.downloadBook(book._id, book.title, book.downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleViewDetails = (book: PFEBook) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
    document.body.style.overflow = 'auto';
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    checkConnection();
    fetchBooks();
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [selectedDepartment, selectedYear, selectedKeywords]);

  if (loading && books.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading PFE Library</h3>
          <p className="text-gray-600">Fetching books from the database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearch={applyFilters}
      />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">📚 PFE Archive</h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">Browse and download final year projects</p>
            </div>
            
            {isMobile && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            )}
          </div>

          {isMobile ? (
            <div>
              {showFilters && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowFilters(false)} />
              )}
              
              {showFilters && (
                <div className="fixed top-0 left-0 w-80 max-w-[85vw] h-full bg-white z-50 overflow-y-auto shadow-xl">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <FilterSidebar
                      departments={filters.departments}
                      years={filters.years}
                      selectedDepartment={selectedDepartment}
                      selectedYear={selectedYear}
                      selectedKeywords={selectedKeywords}
                      availableKeywords={filters.keywords}
                      onDepartmentChange={handleDepartmentChange}
                      onYearChange={handleYearChange}
                      onKeywordToggle={handleKeywordToggle}
                      onClearFilters={clearFilters}
                      onApplyFilters={applyFilters}
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">PFE Collection</h2>
                  <p className="text-gray-600 text-sm">
                    {loading ? 'Loading...' : `${books.length} projects found • Page ${currentPage} of ${totalPages}`}
                  </p>
                </div>

                {books.length === 0 && !loading ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600 mb-4 px-4 text-sm">
                      {error 
                        ? 'Unable to connect to the server. Please check if the backend is running.' 
                        : 'Try adjusting your search criteria or contact the administrator to sync new projects.'
                      }
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 gap-4">
                      {currentBooks.map(book => (
                        <BookCard
                          key={book._id}
                          book={book}
                          onDownload={handleBookDownload}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                      isMobile={true}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-8">
              <div className="w-64 flex-shrink-0">
                <FilterSidebar
                  departments={filters.departments}
                  years={filters.years}
                  selectedDepartment={selectedDepartment}
                  selectedYear={selectedYear}
                  selectedKeywords={selectedKeywords}
                  availableKeywords={filters.keywords}
                  onDepartmentChange={handleDepartmentChange}
                  onYearChange={handleYearChange}
                  onKeywordToggle={handleKeywordToggle}
                  onClearFilters={clearFilters}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">PFE Collection</h2>
                  <p className="text-gray-600">
                    {loading ? 'Loading...' : `${books.length} projects found • Page ${currentPage} of ${totalPages}`}
                  </p>
                </div>

                {books.length === 0 && !loading ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600 mb-4">
                      {error 
                        ? 'Unable to connect to the server. Please check if the backend is running.' 
                        : 'Try adjusting your search criteria or contact the administrator to sync new projects.'
                      }
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                      {currentBooks.map(book => (
                        <BookCard
                          key={book._id}
                          book={book}
                          onDownload={handleBookDownload}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                      isMobile={false}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {loading && books.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-4 flex items-center gap-3 mx-4">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                <span>Updating results...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span>by</span>
              <a
                href="https://www.linkedin.com/in/yassine-boussabat-291157298/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700 transition-all duration-200 hover:scale-105 group"
              >
                <span>Yassine Boussabat</span>
                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 group-hover:bg-blue-200 rounded-full transition-colors">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                </div>
              </a>
            </div>
            
            <div className="text-sm text-gray-500 text-center">
              <span>Good luck with your PFE</span>
            </div>
          </div>
        </div>
      </footer>

      <BookModal
        book={selectedBook}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDownload={handleBookDownload}
      />
    </div>
  );
}

export default App;
