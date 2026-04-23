// Shared application types.

export interface PageContent {
  page_number: number;
  text: string;
}

export interface ReportData {
  id: string;
  filename: string;
  file_size: number;
  upload_date: string;
  total_pages: number;
  text: string;
  pages: PageContent[];
  file_path: string;
}

export interface EquationItem {
  id: number;
  equation: string;
  format?: string;
  variables?: string[];
  explanation?: string;
  isFavorite?: boolean;
}

export interface RecentReport {
  id: string;
  filename: string;
  total_pages: number;
  file_size: number;
  upload_date: string;
  file_path: string;
}
