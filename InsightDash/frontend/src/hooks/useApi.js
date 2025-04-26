// Custom React hooks for API calls using React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, datasetsAPI, analyticsAPI } from './api';
import toast from 'react-hot-toast';

// Query keys for caching
export const QUERY_KEYS = {
  USER: 'user',
  DATASETS: 'datasets',
  DATASET: 'dataset',
  DATASET_DATA: 'dataset-data',
  ANALYTICS_SUMMARY: 'analytics-summary',
  DATASET_SUMMARY: 'dataset-summary',
  FORECAST_HISTORY: 'forecast-history',
};

// Auth hooks
export const useAuth = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER],
    queryFn: () => authAPI.getCurrentUser().then(res => res.data),
    enabled: !!localStorage.getItem('access_token'),
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ username, password }) => authAPI.login(username, password),
    onSuccess: (data) => {
      queryClient.invalidateQueries([QUERY_KEYS.USER]);
      toast.success('Login successful!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Login failed');
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (userData) => authAPI.register(userData).then(res => res.data),
    onSuccess: () => {
      toast.success('Registration successful! Please login.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => {
      authAPI.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
    },
  });
};

// Datasets hooks
export const useDatasets = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DATASETS, params],
    queryFn: () => datasetsAPI.getAll(params).then(res => res.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDataset = (datasetId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DATASET, datasetId],
    queryFn: () => datasetsAPI.getById(datasetId).then(res => res.data),
    enabled: !!datasetId,
  });
};

export const useDatasetData = (datasetId, params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DATASET_DATA, datasetId, params],
    queryFn: () => datasetsAPI.getData(datasetId, params).then(res => res.data),
    enabled: !!datasetId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCreateDataset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (datasetData) => datasetsAPI.create(datasetData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.DATASETS]);
      toast.success('Dataset created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create dataset');
    },
  });
};

export const useUpdateDataset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => datasetsAPI.update(id, data).then(res => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([QUERY_KEYS.DATASETS]);
      queryClient.invalidateQueries([QUERY_KEYS.DATASET, variables.id]);
      toast.success('Dataset updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update dataset');
    },
  });
};

export const useDeleteDataset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (datasetId) => datasetsAPI.delete(datasetId).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.DATASETS]);
      toast.success('Dataset deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete dataset');
    },
  });
};

export const useAddDataPoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, dataPoint }) => 
      datasetsAPI.addDataPoint(datasetId, dataPoint).then(res => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([QUERY_KEYS.DATASET_DATA, variables.datasetId]);
      queryClient.invalidateQueries([QUERY_KEYS.ANALYTICS_SUMMARY]);
      queryClient.invalidateQueries([QUERY_KEYS.DATASET_SUMMARY, variables.datasetId]);
      toast.success('Data point added successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to add data point');
    },
  });
};

export const useBulkImportData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, file }) => datasetsAPI.bulkImport(datasetId, file).then(res => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([QUERY_KEYS.DATASET_DATA, variables.datasetId]);
      queryClient.invalidateQueries([QUERY_KEYS.ANALYTICS_SUMMARY]);
      queryClient.invalidateQueries([QUERY_KEYS.DATASET_SUMMARY, variables.datasetId]);
      toast.success(`Bulk import completed! ${data.imported_count || 0} records imported.`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Bulk import failed');
    },
  });
};

// Analytics hooks
export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ANALYTICS_SUMMARY],
    queryFn: () => analyticsAPI.getOverallSummary().then(res => res.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDatasetSummary = (datasetId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DATASET_SUMMARY, datasetId],
    queryFn: () => analyticsAPI.getDatasetSummary(datasetId).then(res => res.data),
    enabled: !!datasetId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
};

export const useForecastHistory = (datasetId, params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FORECAST_HISTORY, datasetId, params],
    queryFn: () => analyticsAPI.getForecastHistory(datasetId, params).then(res => res.data),
    enabled: !!datasetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateForecast = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (forecastRequest) => analyticsAPI.createForecast(forecastRequest).then(res => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([QUERY_KEYS.FORECAST_HISTORY, variables.dataset_id]);
      queryClient.invalidateQueries([QUERY_KEYS.DATASET_SUMMARY, variables.dataset_id]);
      toast.success('Forecast generated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to generate forecast');
    },
  });
};

export const useGenerateForecast = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, targetColumn, modelType, periods }) => 
      analyticsAPI.generateForecast(datasetId, targetColumn, modelType, periods).then(res => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([QUERY_KEYS.FORECAST_HISTORY, variables.datasetId]);
      queryClient.invalidateQueries([QUERY_KEYS.DATASET_SUMMARY, variables.datasetId]);
      toast.success('Forecast generated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to generate forecast');
    },
  });
};
