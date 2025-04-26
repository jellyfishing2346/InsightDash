import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasetsAPI, analyticsAPI } from '../services/api';
import { useDashboardStore, useAnalyticsStore } from '../stores';
import toast from 'react-hot-toast';

// Dataset hooks
export const useDatasets = (params = {}) => {
  const setDatasets = useDashboardStore((state) => state.setDatasets);
  
  return useQuery({
    queryKey: ['datasets', params],
    queryFn: async () => {
      const response = await datasetsAPI.getAll(params);
      const data = response.data;
      setDatasets(data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDataset = (id) => {
  const setCurrentDataset = useDashboardStore((state) => state.setCurrentDataset);
  
  return useQuery({
    queryKey: ['dataset', id],
    queryFn: async () => {
      const response = await datasetsAPI.getById(id);
      const data = response.data;
      setCurrentDataset(data);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateDataset = () => {
  const queryClient = useQueryClient();
  const addDataset = useDashboardStore((state) => state.addDataset);

  return useMutation({
    mutationFn: (datasetData) => datasetsAPI.create(datasetData).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      addDataset(data);
      toast.success('Dataset created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create dataset');
    },
  });
};

export const useUpdateDataset = () => {
  const queryClient = useQueryClient();
  const updateDataset = useDashboardStore((state) => state.updateDataset);

  return useMutation({
    mutationFn: ({ id, data }) => datasetsAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dataset', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      updateDataset(variables.id, data.data);
      toast.success('Dataset updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update dataset');
    },
  });
};

export const useDeleteDataset = () => {
  const queryClient = useQueryClient();
  const removeDataset = useDashboardStore((state) => state.removeDataset);

  return useMutation({
    mutationFn: datasetsAPI.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      removeDataset(id);
      toast.success('Dataset deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete dataset');
    },
  });
};

// Analytics hooks
export const useGenerateForecast = () => {
  const addForecast = useAnalyticsStore((state) => state.addForecast);

  return useMutation({
    mutationFn: ({ datasetId, params }) => analyticsAPI.generateForecast(datasetId, params),
    onSuccess: (data) => {
      addForecast(data.data);
      toast.success('Forecast generated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to generate forecast');
    },
  });
};

export const useForecastHistory = (datasetId, params = {}) => {
  return useQuery({
    queryKey: ['forecasts', datasetId, params],
    queryFn: () => analyticsAPI.getForecastHistory(datasetId, params).then(res => res.data),
    enabled: !!datasetId,
    onSuccess: (data) => {
      useAnalyticsStore.getState().setForecasts(data);
    },
  });
};

export const useAnalyticsSummary = (datasetId) => {
  return useQuery({
    queryKey: ['analytics-summary', datasetId],
    queryFn: () => analyticsAPI.getDatasetSummary(datasetId).then(res => res.data),
    enabled: !!datasetId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    onSuccess: (data) => {
      useAnalyticsStore.getState().setAnalyticsData(datasetId, data);
    },
  });
};

// Overall analytics summary (no specific dataset)
export const useOverallAnalyticsSummary = () => {
  return useQuery({
    queryKey: ['overall-analytics-summary'],
    queryFn: () => analyticsAPI.getOverallSummary().then(res => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
    onSuccess: (data) => {
      useAnalyticsStore.getState().setOverallAnalytics(data);
    },
  });
};
