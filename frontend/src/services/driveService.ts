const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export interface PFEBook {
  _id: string;
  title: string;
  author: string;
  year: number;
  department: string;
  summary: string;
  keywords: string[];
  thumbnailPath: string | null;
  downloadUrl: string;
  fileSize: number;
  createdAt: string;
}

export interface PaginatedResponse {
  books: PFEBook[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface Filters {
  departments: string[];
  years: number[];
  keywords: string[];
}

export const fetchBooks = async (filters: any = {}): Promise<PaginatedResponse> => {
  try {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key].toString());
      }
    });

    const response = await fetch(`${API_URL}/api/pfe/books?${params}`);
    if (!response.ok) throw new Error('Failed to fetch books');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const fetchFilters = async (): Promise<Filters> => {
  try {
    const response = await fetch(`${API_URL}/api/pfe/filters`);
    if (!response.ok) throw new Error('Failed to fetch filters');
    return await response.json();
  } catch (error) {
    console.error('Error fetching filters:', error);
    throw error;
  }
};

export const checkConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/`);
    return response.ok;
  } catch {
    return false;
  }
};

export const downloadBook = async (bookId: string, title: string, downloadUrl: string): Promise<void> => {
  try {
    window.open(downloadUrl, '_blank');
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

const driveService = {
  fetchBooks,
  fetchFilters,
  checkConnection,
  downloadBook
};

export default driveService;
