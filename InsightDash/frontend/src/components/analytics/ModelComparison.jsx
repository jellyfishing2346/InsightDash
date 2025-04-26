import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  CpuChipIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';

import { analyticsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ModelComparison = ({ datasets }) => {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [comparisonType, setComparisonType] = useState('accuracy');

  // Fetch model performance comparison
  const { data: modelComparisonResponse, isLoading } = useQuery({
    queryKey: ['model-comparison', selectedDataset],
    queryFn: () => analyticsAPI.getModelComparison(selectedDataset),
    // Always enabled - if selectedDataset is null, it will fetch all datasets comparison
  });

  // Extract data from response (API returns axios response with .data property)
  const modelComparison = modelComparisonResponse?.data || modelComparisonResponse;

  // Fetch general model statistics
  const { data: modelStatsResponse } = useQuery({
    queryKey: ['model-stats'],
    queryFn: () => analyticsAPI.getModelStats(),
  });

  // Extract data from response
  const modelStats = modelStatsResponse?.data || modelStatsResponse;

  const modelTypes = [
    { id: 'linear_regression', name: 'Linear Regression', color: '#3B82F6' },
    { id: 'arima', name: 'ARIMA', color: '#10B981' },
    { id: 'moving_average', name: 'Moving Average', color: '#F59E0B' },
  ];

  const comparisonMetrics = [
    { id: 'accuracy', name: 'Accuracy (%)', key: 'accuracy' },
    { id: 'mse', name: 'Mean Squared Error', key: 'mse' },
    { id: 'mae', name: 'Mean Absolute Error', key: 'mae' },
    { id: 'rmse', name: 'Root Mean Squared Error', key: 'rmse' },
  ];

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Model Performance Comparison</h3>
            <p className="text-sm text-gray-500">
              Compare the performance of different forecasting models across your datasets
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedDataset || ''}
              onChange={(e) => setSelectedDataset(e.target.value || null)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Datasets</option>
              {datasets?.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </option>
              ))}
            </select>
            
            <select
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {comparisonMetrics.map((metric) => (
                <option key={metric.id} value={metric.id}>
                  {metric.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Model Statistics Overview */}
      {modelStats && Array.isArray(modelStats) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modelTypes.map((model) => {
            const stats = modelStats.find(s => s.model_type === model.id);
            return (
              <div key={model.id} className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${model.color}20` }}>
                    <CpuChipIcon className="h-6 w-6" style={{ color: model.color }} />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Forecasts</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {stats?.total_forecasts || 0}
                    </div>
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-2">{model.name}</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Avg Accuracy:</span>
                    <span className="text-gray-900">
                      {stats?.average_accuracy?.toFixed(2) || 'N/A'}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Avg MSE:</span>
                    <span className="text-gray-900">
                      {stats?.average_mse?.toFixed(4) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Success Rate:</span>
                    <span className="text-gray-900">
                      {stats?.success_rate?.toFixed(1) || 'N/A'}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Performance Comparison Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Performance Comparison - {comparisonMetrics.find(m => m.id === comparisonType)?.name}
        </h3>
        
        {isLoading ? (
          <LoadingSpinner />
        ) : modelComparison && modelComparison.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model_type" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toFixed(4) : value,
                    comparisonMetrics.find(m => m.id === comparisonType)?.name
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey={comparisonMetrics.find(m => m.id === comparisonType)?.key}
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No comparison data</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedDataset 
                ? 'No forecasts found for the selected dataset'
                : 'Create forecasts to compare model performance'
              }
            </p>
          </div>
        )}
      </div>

      {/* Detailed Performance Table */}
      {modelComparison && modelComparison.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Detailed Performance Metrics</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MSE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MAE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RMSE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forecasts Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {modelComparison.map((model) => (
                  <tr key={model.model_type}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {modelTypes.find(m => m.id === model.model_type)?.name || model.model_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {model.accuracy?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {model.mse?.toFixed(6) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {model.mae?.toFixed(4) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {model.rmse?.toFixed(4) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {model.count || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Model Recommendations */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Model Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">Linear Regression</h4>
            </div>
            <p className="text-sm text-blue-700">
              Best for data with clear linear trends. Fast and interpretable, ideal for simple forecasting tasks.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">ARIMA</h4>
            </div>
            <p className="text-sm text-green-700">
              Excellent for time series with seasonality and complex patterns. More accurate but requires more data.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center mb-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <h4 className="font-medium text-yellow-900">Moving Average</h4>
            </div>
            <p className="text-sm text-yellow-700">
              Good for smoothing noisy data and short-term forecasts. Simple but effective for stable trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelComparison;
