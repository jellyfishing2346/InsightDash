import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  PresentationChartLineIcon,
  CpuChipIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

import { analyticsAPI } from '../../services/api';
import { useAnalyticsStore, useDashboardStore } from '../../stores';
import { useDatasets } from '../../hooks/useData';
import LoadingSpinner from '../common/LoadingSpinner';
import StatsCards from '../dashboard/StatsCards';
import ForecastChart from '../dashboard/ForecastChart';
import DataVisualization from './DataVisualization';
import ForecastModal from './ForecastModal';
import ModelComparison from './ModelComparison';
import AIInsightsDashboard from './AIInsightsDashboard';
import RealTimeDashboard from '../dashboard/RealTimeDashboard';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [showForecastModal, setShowForecastModal] = useState(false);
  
  const { datasets } = useDashboardStore();
  const { forecasts, analyticsData } = useAnalyticsStore();

  // Load datasets
  const { isLoading: datasetsLoading } = useDatasets();

  // Fetch analytics summary
  const { data: analyticsSummaryResponse, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsAPI.getOverallSummary(),
  });

  // Extract data from response
  const analyticsSummary = analyticsSummaryResponse?.data || analyticsSummaryResponse;

  // Fetch recent forecasts
  const { data: recentForecastsResponse, isLoading: forecastsLoading } = useQuery({
    queryKey: ['recent-forecasts'],
    queryFn: () => analyticsAPI.getRecentForecasts(),
  });

  // Extract data from response
  const recentForecasts = recentForecastsResponse?.data || recentForecastsResponse;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'forecasting', name: 'Forecasting', icon: PresentationChartLineIcon },
    { id: 'models', name: 'Model Comparison', icon: CpuChipIcon },
    { id: 'ai-insights', name: 'AI Insights', icon: ArrowTrendingUpIcon },
    { id: 'realtime', name: 'Real-time Analytics', icon: ClockIcon },
  ];

  const handleCreateForecast = (datasetId) => {
    setSelectedDataset(datasetId);
    setShowForecastModal(true);
  };

  if (summaryLoading || datasetsLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Analyze your data, create forecasts, and gain insights with advanced analytics
            </p>
          </div>
          
          <button
            onClick={() => setShowForecastModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
            New Forecast
          </button>
        </div>
      </div>

      {/* Analytics Summary Stats */}
      {analyticsSummary && (
        <div className="mb-8">
          <StatsCards 
            stats={[
              {
                name: 'Total Datasets',
                value: analyticsSummary.total_datasets || 0,
                change: analyticsSummary.datasets_change || 0,
                icon: ChartBarIcon,
              },
              {
                name: 'Active Forecasts',
                value: analyticsSummary.active_forecasts || 0,
                change: analyticsSummary.forecasts_change || 0,
                icon: PresentationChartLineIcon,
              },
              {
                name: 'Data Points Analyzed',
                value: analyticsSummary.total_data_points || 0,
                change: analyticsSummary.data_points_change || 0,
                icon: CpuChipIcon,
              },
              {
                name: 'Average Accuracy',
                value: `${analyticsSummary.average_accuracy || 0}%`,
                change: analyticsSummary.accuracy_change || 0,
                icon: ArrowTrendingUpIcon,
              },
            ]}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Forecasts */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Recent Forecasts</h3>
                <button
                  onClick={() => setActiveTab('forecasting')}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  View all →
                </button>
              </div>
              
              {forecastsLoading ? (
                <LoadingSpinner />
              ) : recentForecasts && recentForecasts.length > 0 ? (
                <div className="space-y-4">
                  {recentForecasts.slice(0, 5).map((forecast) => (
                    <div key={forecast.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <PresentationChartLineIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{forecast.dataset_name}</h4>
                          <p className="text-sm text-gray-500">
                            {forecast.model_type} • {forecast.horizon} periods
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {forecast.accuracy ? `${forecast.accuracy.toFixed(2)}% accuracy` : 'Processing...'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(forecast.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PresentationChartLineIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No forecasts yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first forecast to get started with predictive analytics.
                  </p>
                  <button
                    onClick={() => setShowForecastModal(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Forecast
                  </button>
                </div>
              )}
            </div>

            {/* Dataset Analytics Overview */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Dataset Analytics</h3>
              
              {datasets && datasets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {datasets.map((dataset) => (
                    <div key={dataset.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">{dataset.name}</h4>
                        <button
                          onClick={() => handleCreateForecast(dataset.id)}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          <ArrowTrendingUpIcon className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Records:</span>
                          <span className="text-gray-900">{dataset.row_count?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Columns:</span>
                          <span className="text-gray-900">{dataset.column_count}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Last Updated:</span>
                          <span className="text-gray-900">
                            {new Date(dataset.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No datasets found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload a dataset to start analyzing your data.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'forecasting' && (
          <div className="space-y-6">
            <ForecastChart forecasts={forecasts} />
            
            {/* Forecast History */}
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">Forecast History</h3>
              </div>
              
              {forecasts && forecasts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dataset
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Model
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Horizon
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Accuracy
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {forecasts.map((forecast) => (
                        <tr key={forecast.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {forecast.dataset_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {forecast.model_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {forecast.horizon} periods
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {forecast.accuracy ? `${forecast.accuracy.toFixed(2)}%` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(forecast.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <PresentationChartLineIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No forecasts yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first forecast to see it here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <ModelComparison datasets={datasets} />
        )}

        {activeTab === 'ai-insights' && (
          <AIInsightsDashboard datasets={datasets} />
        )}

        {activeTab === 'realtime' && (
          <RealTimeDashboard datasetId={selectedDataset} />
        )}
      </div>

      {/* Forecast Modal */}
      {showForecastModal && (
        <ForecastModal
          datasetId={selectedDataset}
          onClose={() => {
            setShowForecastModal(false);
            setSelectedDataset(null);
          }}
        />
      )}
    </div>
  );
};

export default Analytics;
