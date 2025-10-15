export interface PFEBook {
  _id: string;
  title: string;
  author: string;
  year: number;
  department: string;
  summary: string;
  keywords: string[];
  thumbnailPath: string;
  downloadUrl: string;
  fileSize: number;
  createdAt: string;
}

export interface Filters {
  departments: string[];
  years: number[];
  keywords: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


class DriveService {
  private baseUrl = `${API_URL}/api/pfe`;

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(API_URL);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async fetchBooks(filters: any = {}): Promise<PFEBook[]> {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseUrl}/books?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async fetchFilters(): Promise<Filters> {
    const response = await fetch(`${this.baseUrl}/filters`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async importFromDrive(): Promise<{processed: number, errors: number}> {
    const response = await fetch(`${this.baseUrl}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async downloadBook(bookId: string, title: string, downloadUrl: string): Promise<void> {
    window.open(downloadUrl, '_blank');
  }
}

export default new DriveService();
