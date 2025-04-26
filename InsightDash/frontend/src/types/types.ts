export interface DataPoint {
  id: string;  // Recommended to use string IDs
  label: string;
  value: number;
  timestamp: string;  // ISO format preferred
  metadata?: Record<string, unknown>;  // Optional additional data
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  data: DataPoint[];
}

// API Response Type
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}