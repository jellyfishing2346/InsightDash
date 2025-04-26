import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

import { datasetsAPI } from '../../services/api';

const BulkOperationsModal = ({ isOpen, onClose, datasets = [] }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const [importFile, setImportFile] = useState(null);
  const [importConfig, setImportConfig] = useState({
    hasHeader: true,
    delimiter: ',',
    encoding: 'utf-8',
    skipRows: 0,
  });

  // Export multiple datasets
  const exportMutation = useMutation({
    mutationFn: async ({ datasetIds, format }) => {
      const exports = await Promise.all(
        datasetIds.map(id => datasetsAPI.export(id, format))
      );
      return { exports, format };
    },
    onSuccess: ({ exports, format }) => {
      exports.forEach((data, index) => {
        const dataset = datasets.find(d => d.id === selectedDatasets[index]);
        const blob = new Blob([data], {
          type: format === 'csv' ? 'text/csv' : 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${dataset?.name || 'dataset'}_export.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
      
      toast.success(`${exports.length} datasets exported successfully`);
      onClose();
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    },
  });

  // Import data to existing dataset
  const importMutation = useMutation({
    mutationFn: async ({ datasetId, file, config }) => {
      return datasetsAPI.bulkImport(datasetId, file, config);
    },
    onSuccess: () => {
      toast.success('Data imported successfully');
      setImportFile(null);
      onClose();
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });

  const handleDatasetSelection = (datasetId) => {
    setSelectedDatasets(prev => 
      prev.includes(datasetId)
        ? prev.filter(id => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  const handleSelectAll = () => {
    setSelectedDatasets(
      selectedDatasets.length === datasets.length 
        ? [] 
        : datasets.map(d => d.id)
    );
  };

  const handleExport = () => {
    if (selectedDatasets.length === 0) {
      toast.error('Please select at least one dataset');
      return;
    }
    
    exportMutation.mutate({
      datasetIds: selectedDatasets,
      format: exportFormat,
    });
  };

  const handleImport = () => {
    if (!importFile || selectedDatasets.length !== 1) {
      toast.error('Please select exactly one dataset and a file to import');
      return;
    }
    
    importMutation.mutate({
      datasetId: selectedDatasets[0],
      file: importFile,
      config: importConfig,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImportFile(file);
    
    // Auto-detect some settings based on file type
    if (file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.csv')) {
        setImportConfig(prev => ({ ...prev, delimiter: ',' }));
      } else if (fileName.endsWith('.tsv')) {
        setImportConfig(prev => ({ ...prev, delimiter: '\t' }));
      }
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'export', name: 'Bulk Export', icon: DocumentArrowDownIcon },
    { id: 'import', name: 'Bulk Import', icon: DocumentArrowUpIcon },
    { id: 'transform', name: 'Data Transform', icon: Cog6ToothIcon },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-gray-900">Bulk Operations</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
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

        {/* Dataset Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Select Datasets</h4>
            <button
              onClick={handleSelectAll}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              {selectedDatasets.length === datasets.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="max-h-40 overflow-y-auto border rounded-lg">
            {datasets.map((dataset) => (
              <label
                key={dataset.id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selectedDatasets.includes(dataset.id)}
                  onChange={() => handleDatasetSelection(dataset.id)}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <div className="ml-3 flex-1">
                  <div className="font-medium text-gray-900">{dataset.name}</div>
                  <div className="text-sm text-gray-500">
                    {dataset.row_count?.toLocaleString()} rows • {dataset.file_type?.toUpperCase()}
                  </div>
                </div>
              </label>
            ))}
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            {selectedDatasets.length} of {datasets.length} datasets selected
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'export' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Export Configuration</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="xlsx">Excel</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include Metadata
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-600">Export with headers and metadata</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={selectedDatasets.length === 0 || exportMutation.isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exportMutation.isLoading ? 'Exporting...' : `Export ${selectedDatasets.length} Dataset(s)`}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Import Configuration</h4>
              
              {selectedDatasets.length !== 1 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-700">
                    Please select exactly one dataset to import data into.
                  </p>
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".csv,.json,.xlsx,.tsv"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
                
                {importFile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delimiter
                      </label>
                      <select
                        value={importConfig.delimiter}
                        onChange={(e) => setImportConfig(prev => ({ ...prev, delimiter: e.target.value }))}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value=",">Comma (,)</option>
                        <option value=";">Semicolon (;)</option>
                        <option value="\t">Tab</option>
                        <option value="|">Pipe (|)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skip Rows
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={importConfig.skipRows}
                        onChange={(e) => setImportConfig(prev => ({ ...prev, skipRows: parseInt(e.target.value) || 0 }))}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={importConfig.hasHeader}
                          onChange={(e) => setImportConfig(prev => ({ ...prev, hasHeader: e.target.checked }))}
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-600">File has header row</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile || selectedDatasets.length !== 1 || importMutation.isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importMutation.isLoading ? 'Importing...' : 'Import Data'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'transform' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Data Transformation</h4>
              
              <div className="text-center py-12">
                <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Data Transformation Coming Soon</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Advanced data transformation features including column mapping, data cleaning, and format conversion will be available soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsModal;
