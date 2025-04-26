import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

import { analyticsAPI } from '../../services/api';
import { useDatasets } from '../../hooks/useData';

const ForecastModal = ({ datasetId, onClose }) => {
  const queryClient = useQueryClient();
  const { data: datasets = [], isLoading: datasetsLoading, error: datasetsError } = useDatasets();
  
  const [formData, setFormData] = useState({
    dataset_id: datasetId || '',
    target_column: '',
    date_column: '',
    model_type: 'linear_regression',
    horizon: 30,
    frequency: 'D',
    confidence_level: 0.95,
    seasonal: false,
    include_trend: true,
  });

  const selectedDataset = datasets.find(d => d.id === formData.dataset_id);

  // Create forecast mutation
  const createForecastMutation = useMutation({
    mutationFn: (data) => analyticsAPI.createForecast(data),
    onSuccess: (data) => {
      toast.success('Forecast created successfully!');
      queryClient.invalidateQueries(['recent-forecasts']);
      queryClient.invalidateQueries(['analytics-summary']);
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to create forecast: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.dataset_id) {
      toast.error('Please select a dataset');
      return;
    }
    if (!formData.target_column) {
      toast.error('Please select a target column');
      return;
    }
    if (!formData.date_column) {
      toast.error('Please select a date column');
      return;
    }

    createForecastMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Create New Forecast</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dataset Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dataset
            </label>
            {datasetsLoading ? (
              <div className="block w-full border-gray-300 rounded-md shadow-sm p-2 text-gray-500">
                Loading datasets...
              </div>
            ) : datasetsError ? (
              <div className="block w-full border-gray-300 rounded-md shadow-sm p-2 text-red-500">
                Error loading datasets
              </div>
            ) : datasets.length === 0 ? (
              <div className="block w-full border-gray-300 rounded-md shadow-sm p-3 text-gray-500 bg-gray-50">
                <p>No datasets available. Please create a dataset first or generate demo data.</p>
                <button
                  type="button"
                  onClick={() => window.location.href = '/demo'}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Generate Demo Data →
                </button>
              </div>
            ) : (
              <select
                name="dataset_id"
                value={formData.dataset_id}
                onChange={handleChange}
                required
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a dataset</option>
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Column Selection */}
          {selectedDataset && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Column (Value to Forecast)
                  </label>
                  <select
                    name="target_column"
                    value={formData.target_column}
                    onChange={handleChange}
                    required
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select target column</option>
                    {selectedDataset.columns?.filter(col => 
                      ['number', 'float', 'integer', 'decimal'].includes(col.type.toLowerCase())
                    ).map((column) => (
                      <option key={column.name} value={column.name}>
                        {column.name} ({column.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Column
                  </label>
                  <select
                    name="date_column"
                    value={formData.date_column}
                    onChange={handleChange}
                    required
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select date column</option>
                    {selectedDataset.columns?.filter(col => 
                      ['date', 'datetime', 'timestamp'].includes(col.type.toLowerCase())
                    ).map((column) => (
                      <option key={column.name} value={column.name}>
                        {column.name} ({column.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Model Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Type
              </label>
              <select
                name="model_type"
                value={formData.model_type}
                onChange={handleChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="linear_regression">Linear Regression</option>
                <option value="arima">ARIMA</option>
                <option value="moving_average">Moving Average</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forecast Horizon (periods)
              </label>
              <input
                type="number"
                name="horizon"
                value={formData.horizon}
                onChange={handleChange}
                min="1"
                max="365"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="D">Daily</option>
                <option value="W">Weekly</option>
                <option value="M">Monthly</option>
                <option value="Q">Quarterly</option>
                <option value="Y">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence Level
              </label>
              <select
                name="confidence_level"
                value={formData.confidence_level}
                onChange={handleChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="0.90">90%</option>
                <option value="0.95">95%</option>
                <option value="0.99">99%</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Advanced Options</h4>
            
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="seasonal"
                  checked={formData.seasonal}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Include Seasonality</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="include_trend"
                  checked={formData.include_trend}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Include Trend</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createForecastMutation.isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createForecastMutation.isLoading ? 'Creating...' : 'Create Forecast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForecastModal;
