export interface PFEBook {
  id: string;
  title: string;
  author: string;
  year: number;
  department: string;
  summary: string;
  keywords: string[];
  thumbnail_url: string;
  pdf_url: string;
  file_size: string;
  pages: number;
  created_at: string;
  drive_file_id: string;
}

export interface SearchFilters {
  query: string;
  department: string;
  year: number | null;
  keywords: string[];
}