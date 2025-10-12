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

class DriveService {
  private baseUrl = 'http://localhost:5000/api/pfe';

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:5000');
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async fetchBooks(filters: any = {}): Promise<PFEBook[]> {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${this.baseUrl}/books?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async fetchFilters(): Promise<Filters> {
    try {
      const response = await fetch(`${this.baseUrl}/filters`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async importFromDrive(): Promise<{processed: number, errors: number}> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  async downloadBook(bookId: string, title: string, downloadUrl: string): Promise<void> {
    try {
      window.open(downloadUrl, '_blank');
    } catch (error) {
      throw error;
    }
  }
}

export default new DriveService();
