import React, { useState } from 'react';
import { 
  useOverallAnalyticsSummary, 
  useDatasets, 
  useAnalyticsSummary,
  useForecastHistory 
} from '../hooks/useData';
import { useCreateForecast } from '../hooks/useApi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  DatabaseIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  UserIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = () => {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [forecastConfig, setForecastConfig] = useState({
    periods: 10,
    model_type: 'linear_regression'
  });

  // Fetch data
  const { data: overallSummary, isLoading: summaryLoading } = useOverallAnalyticsSummary();
  const { data: datasets, isLoading: datasetsLoading } = useDatasets();
  const { data: datasetSummary, isLoading: datasetSummaryLoading } = useAnalyticsSummary(selectedDataset?.id);
  const { data: forecastHistory, isLoading: forecastLoading } = useForecastHistory(selectedDataset?.id);

  // Mutations
  const createForecast = useCreateForecast();

  const handleGenerateForecast = () => {
    if (!selectedDataset) {
      toast.error('Please select a dataset first');
      return;
    }

    createForecast.mutate({
      dataset_id: selectedDataset.id,
      periods: forecastConfig.periods,
      model_type: forecastConfig.model_type
    });
  };

  // Chart data preparation
  const getForecastChartData = () => {
    if (!forecastHistory || forecastHistory.length === 0) return null;

    const latestForecast = forecastHistory[0];
    const forecastData = latestForecast.forecast_data || [];
    
    return {
      labels: forecastData.map((_, index) => `Period ${index + 1}`),
      datasets: [
        {
          label: 'Forecast',
          data: forecastData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
        },
        ...(latestForecast.confidence_interval ? [
          {
            label: 'Upper Bound',
            data: latestForecast.confidence_interval.upper,
            borderColor: 'rgba(239, 68, 68, 0.5)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
          },
          {
            label: 'Lower Bound',
            data: latestForecast.confidence_interval.lower,
            borderColor: 'rgba(239, 68, 68, 0.5)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
          }
        ] : [])
      ],
    };
  };

  if (summaryLoading || datasetsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive analytics and forecasting insights for your data
        </p>
      </div>

      {/* Overall Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <DatabaseIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Datasets</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallSummary?.datasets_count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Data Points</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallSummary?.total_data_points || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recent Activity</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallSummary?.recent_activity || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <UserIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">User Role</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallSummary?.user_role || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Selection and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dataset Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Dataset</h3>
          <div className="space-y-3">
            {datasets?.map((dataset) => (
              <div
                key={dataset.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedDataset?.id === dataset.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedDataset(dataset)}
              >
                <p className="font-medium text-gray-900">{dataset.name}</p>
                <p className="text-sm text-gray-500">{dataset.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Type: {dataset.data_type} | Public: {dataset.is_public ? 'Yes' : 'No'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dataset Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Summary</h3>
          {selectedDataset ? (
            datasetSummaryLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : datasetSummary ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Data Points:</span>
                  <span className="font-semibold">{datasetSummary.total_data_points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Forecasts:</span>
                  <span className="font-semibold">{datasetSummary.total_forecasts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Columns:</span>
                  <span className="font-semibold">{datasetSummary.available_columns?.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Update:</span>
                  <span className="font-semibold text-sm">
                    {datasetSummary.latest_data_timestamp 
                      ? new Date(datasetSummary.latest_data_timestamp).toLocaleDateString()
                      : 'No data'
                    }
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No summary available</p>
            )
          ) : (
            <p className="text-gray-500">Select a dataset to view summary</p>
          )}
        </div>

        {/* Forecast Configuration */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Forecast</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forecast Periods
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={forecastConfig.periods}
                onChange={(e) => setForecastConfig(prev => ({ ...prev, periods: parseInt(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Type
              </label>
              <select
                value={forecastConfig.model_type}
                onChange={(e) => setForecastConfig(prev => ({ ...prev, model_type: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="linear_regression">Linear Regression</option>
                <option value="arima">ARIMA</option>
                <option value="moving_average">Moving Average</option>
              </select>
            </div>

            <button
              onClick={handleGenerateForecast}
              disabled={!selectedDataset || createForecast.isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createForecast.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </div>
              ) : (
                'Generate Forecast'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Forecast Visualization */}
      {selectedDataset && forecastHistory && forecastHistory.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Latest Forecast</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4" />
              <span>
                Generated: {new Date(forecastHistory[0]?.created_at).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="h-80">
            {getForecastChartData() && (
              <Line 
                data={getForecastChartData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: `${forecastHistory[0]?.model_type} Forecast (${forecastHistory[0]?.forecast_data?.length} periods)`,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                    },
                  },
                }}
              />
            )}
          </div>

          {/* Forecast Metrics */}
          {forecastHistory[0]?.accuracy_metrics && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">RMSE</p>
                <p className="text-lg font-bold text-gray-900">
                  {forecastHistory[0].accuracy_metrics.rmse?.toFixed(4)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">MAE</p>
                <p className="text-lg font-bold text-gray-900">
                  {forecastHistory[0].accuracy_metrics.mae?.toFixed(4)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">R² Score</p>
                <p className="text-lg font-bold text-gray-900">
                  {forecastHistory[0].accuracy_metrics.r2_score?.toFixed(4) || 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Forecast History */}
      {selectedDataset && forecastHistory && forecastHistory.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periods
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RMSE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forecastHistory.map((forecast) => (
                  <tr key={forecast.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {forecast.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {forecast.model_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {forecast.forecast_data?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {forecast.accuracy_metrics?.rmse?.toFixed(4) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(forecast.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
