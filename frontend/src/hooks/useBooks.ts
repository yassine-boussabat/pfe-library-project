import { useState, useEffect } from 'react';
import driveService, { PFEBook, Filters, SyncResult } from '../services/driveService';

interface UseBooksOptions {
  autoFetch?: boolean;
}

export const useBooks = (options: UseBooksOptions = { autoFetch: true }) => {
  const [books, setBooks] = useState<PFEBook[]>([]);
  const [filters, setFilters] = useState<Filters>({ 
    departments: [], 
    years: [], 
    keywords: [] 
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async (searchFilters: {
    search?: string;
    department?: string;
    year?: string;
    keywords?: string;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);
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

  const syncBooks = async (): Promise<SyncResult> => {
    try {
      setSyncing(true);
      setError(null);
      const result = await driveService.importFromDrive();
      
      await Promise.all([
        fetchBooks(),
        fetchFilters()
      ]);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      setError(errorMessage);
      console.error('Error syncing books:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const searchBooks = async (query: string) => {
    await fetchBooks({ search: query });
  };

  const downloadBook = async (book: PFEBook) => {
    try {
      await driveService.downloadBook(book._id, book.title, book.downloadUrl);
    } catch (error) {
      console.error('Error downloading book:', error);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const checkConnection = async () => {
    const isConnected = await driveService.checkConnection();
    if (!isConnected) {
      setError('Unable to connect to API. Please make sure the backend is running.');
    }
  };

  useEffect(() => {
    if (options.autoFetch) {
      checkConnection();
      fetchBooks();
      fetchFilters();
    }
  }, [options.autoFetch]);

  return {
    books,
    filters,
    loading,
    syncing,
    error,
    fetchBooks,
    syncBooks,
    searchBooks,
    downloadBook,
    clearError,
    checkConnection
  };
};

export default useBooks;
