import React, { useEffect } from 'react';
import { useDatasets, useAnalyticsSummary } from '../hooks/useData';
import { useWebSocket } from '../hooks/useWebSocket';
import { useDashboardStore, useAnalyticsStore } from '../stores';
import StatsCards from './dashboard/StatsCards';
import RecentDatasets from './dashboard/RecentDatasets';
import RealTimeChart from './dashboard/RealTimeChart';
import ForecastChart from './dashboard/ForecastChart';
import ActivityFeed from './dashboard/ActivityFeed';

const Dashboard = () => {
  const { data: datasets, isLoading: datasetsLoading } = useDatasets({ limit: 5 });
  const currentDataset = useDashboardStore((state) => state.currentDataset);
  const realTimeData = useAnalyticsStore((state) => state.realTimeData);

  // Set up WebSocket connection for real-time updates
  useWebSocket(currentDataset?.id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Get insights from your data with real-time analytics and forecasting
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Data Chart */}
          <div className="chart-container">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Real-Time Data Stream
            </h3>
            <RealTimeChart data={realTimeData} />
          </div>

          {/* Forecast Chart */}
          {currentDataset && (
            <div className="chart-container">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Predictive Analytics
              </h3>
              <ForecastChart datasetId={currentDataset.id} />
            </div>
          )}
        </div>

        {/* Right Column - Sidebar Content */}
        <div className="space-y-6">
          {/* Recent Datasets */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Datasets
            </h3>
            <RecentDatasets 
              datasets={Array.isArray(datasets) ? datasets : []}
              loading={datasetsLoading}
            />
          </div>

          {/* Activity Feed */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;