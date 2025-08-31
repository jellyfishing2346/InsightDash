import axios from 'axios';

// Force production URL for deployment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://insightdash-backend.onrender.com/api/v1'
  : process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api/v1` 
    : process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    // Use fetch to bypass potential axios issues
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }
    
    const data = await response.json();
    return { data };
  },
  login: async (credentials) => {
    // Send JSON data for mock backend
    const response = await api.post('/auth/login', credentials);
    
    // Store the token
    localStorage.setItem('access_token', response.data.access_token);
    return response.data;
  },
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('access_token');
  }
};

// Datasets API
export const datasetsAPI = {
  getAll: (params = {}) => api.get('/datasets', { params }),
  getById: (id) => api.get(`/datasets/${id}`),
  create: (data) => api.post('/datasets', data),
  update: (id, data) => api.put(`/datasets/${id}`, data),
  delete: (id) => api.delete(`/datasets/${id}`),
  
  // Data points management
  getData: (datasetId, params = {}) => api.get(`/datasets/${datasetId}/data`, { params }),
  addDataPoint: (datasetId, dataPoint) => api.post(`/datasets/${datasetId}/data`, dataPoint),
  
  // Data preview with pagination
  getPreview: (datasetId, params = {}) => api.get(`/datasets/${datasetId}/preview`, { params }),
  
  // Export functionality
  export: async (datasetId, format = 'csv') => {
    const response = await api.get(`/datasets/${datasetId}/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  // Bulk operations
  bulkImport: async (datasetId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/datasets/${datasetId}/bulk-import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Analytics API
export const analyticsAPI = {
  // Overall analytics summary
  getOverallSummary: () => api.get('/analytics/summary'),
  
  // Dataset-specific analytics
  getDatasetSummary: (datasetId) => api.get(`/analytics/analytics/summary/${datasetId}`),
  getDatasetAnalytics: (datasetId) => api.get(`/analytics/datasets/${datasetId}/analytics`),
  
  // Forecasting - New endpoint (JSON body)
  createForecast: (forecastRequest) => api.post('/analytics/forecast', forecastRequest),
  
  // Forecasting - Original endpoint (query parameters)
  generateForecast: (datasetId, targetColumn = 'value', modelType = 'linear_regression', periods = 30) => 
    api.post(`/analytics/forecast/${datasetId}?target_column=${targetColumn}&model_type=${modelType}&forecast_periods=${periods}`),
  
  // Forecast history and management
  getForecastHistory: (datasetId, params = {}) => 
    api.get(`/analytics/forecast/${datasetId}/history`, { params }),
  getRecentForecasts: (params = {}) => api.get('/analytics/forecasts/recent', { params }),
  
  // Model comparison
  getModelComparison: (datasetId) => 
    datasetId ? api.get(`/analytics/models/compare/${datasetId}`) : api.get('/analytics/models/compare'),
  getModelStats: () => api.get('/analytics/models/stats'),
};

// Unified API export with simpler method names
export default {
  // Auth
  register: authAPI.register,
  login: authAPI.login,
  getCurrentUser: authAPI.getCurrentUser,
  logout: authAPI.logout,
  
  // Datasets
  getDatasets: datasetsAPI.getAll,
  getDataset: datasetsAPI.getById,
  createDataset: datasetsAPI.create,
  updateDataset: datasetsAPI.update,
  deleteDataset: datasetsAPI.delete,
  getDatasetData: datasetsAPI.getData,
  getDatasetPreview: datasetsAPI.getPreview,
  exportDataset: datasetsAPI.export,
  bulkImportData: datasetsAPI.bulkImport,
  
  // Analytics
  getAnalyticsSummary: analyticsAPI.getOverallSummary,
  getDatasetAnalytics: analyticsAPI.getDatasetAnalytics,
  createForecast: analyticsAPI.createForecast,
  generateForecast: analyticsAPI.generateForecast,
  getForecastHistory: analyticsAPI.getForecastHistory,
  getRecentForecasts: analyticsAPI.getRecentForecasts,
  getModelComparison: analyticsAPI.getModelComparison,
  getModelStats: analyticsAPI.getModelStats,
};
