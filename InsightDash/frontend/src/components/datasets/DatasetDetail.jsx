import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

import { datasetsAPI, analyticsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import DataVisualization from '../analytics/DataVisualization';
import DataPreview from '../datasets/DataPreview';
import ForecastModal from '../analytics/ForecastModal';
import EditDatasetModal from './EditDatasetModal';

const DatasetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch dataset details
  const { data: dataset, isLoading, error } = useQuery({
    queryKey: ['dataset', id],
    queryFn: () => datasetsAPI.getById(id),
    enabled: !!id,
  });

  // Fetch dataset analytics
  const { data: analytics } = useQuery({
    queryKey: ['dataset-analytics', id],
    queryFn: () => analyticsAPI.getDatasetAnalytics(id),
    enabled: !!id,
  });

  // Delete dataset mutation
  const deleteMutation = useMutation({
    mutationFn: () => datasetsAPI.delete(id),
    onSuccess: () => {
      toast.success('Dataset deleted successfully');
      queryClient.invalidateQueries(['datasets']);
      navigate('/datasets');
    },
    onError: (error) => {
      toast.error(`Failed to delete dataset: ${error.message}`);
    },
  });

  // Export dataset mutation
  const exportMutation = useMutation({
    mutationFn: (format) => datasetsAPI.export(id, format),
    onSuccess: (data, format) => {
      // Create download link
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataset?.name || 'dataset'}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Dataset exported as ${format.toUpperCase()}`);
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleExport = (format) => {
    exportMutation.mutate(format);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error loading dataset: {error.message}</div>;
  if (!dataset) return <div>Dataset not found</div>;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: EyeIcon },
    { id: 'data', name: 'Data Preview', icon: ChartBarIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{dataset.name}</h1>
            <p className="mt-2 text-gray-600">{dataset.description}</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowForecastModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Create Forecast
            </button>
            
            <div className="relative inline-block text-left">
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
            
            <button
              onClick={() => handleExport('json')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export JSON
            </button>
            
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
        
        {/* Dataset metadata */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <dt className="text-sm font-medium text-gray-500">Records</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">{dataset.row_count?.toLocaleString()}</dd>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <dt className="text-sm font-medium text-gray-500">Columns</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">{dataset.column_count}</dd>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <dt className="text-sm font-medium text-gray-500">Size</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">{formatFileSize(dataset.file_size)}</dd>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {new Date(dataset.created_at).toLocaleDateString()}
            </dd>
          </div>
        </div>
      </div>

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
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dataset Information</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dataset.file_type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(dataset.created_at).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(dataset.updated_at).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      dataset.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dataset.status}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
            
            {/* Column information */}
            {dataset.columns && (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Columns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dataset.columns.map((column, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="font-medium text-gray-900">{column.name}</div>
                      <div className="text-sm text-gray-500">{column.type}</div>
                      {column.nullable && <div className="text-xs text-gray-400">Nullable</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <DataPreview datasetId={id} />
        )}

        {activeTab === 'analytics' && (
          <div>
            {analytics ? (
              <DataVisualization dataset={dataset} analytics={analytics} />
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Generate analytics to see visualizations and insights.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dataset Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Dataset Name</label>
                <input
                  type="text"
                  defaultValue={dataset.name}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  defaultValue={dataset.description}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Forecast Modal */}
      {showForecastModal && (
        <ForecastModal
          datasetId={id}
          onClose={() => setShowForecastModal(false)}
        />
      )}

      {/* Edit Dataset Modal */}
      {showEditModal && (
        <EditDatasetModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          dataset={dataset?.data}
        />
      )}
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default DatasetDetail;
