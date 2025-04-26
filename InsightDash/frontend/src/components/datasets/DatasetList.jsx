import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useDatasets } from '../../hooks/useData';
import DatasetCard from './DatasetCard';
import CreateDatasetModal from './CreateDatasetModal';
import BulkOperationsModal from '../data/BulkOperationsModal';

const DatasetList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const { data: datasets, isLoading, error } = useDatasets();

  const filteredDatasets = datasets?.filter(dataset =>
    dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dataset.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading datasets</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
          <p className="text-gray-600">
            Manage your data sources and explore insights
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Cog6ToothIcon className="w-5 h-5 mr-2" />
            <span>Bulk Operations</span>
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Dataset</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
          placeholder="Search datasets..."
        />
      </div>

      {/* Dataset Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredDatasets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No datasets found' : 'No datasets yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? `No datasets match "${searchTerm}"`
              : 'Get started by creating your first dataset'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Dataset
            </button>
          )}
        </div>
      )}

      {/* Create Dataset Modal */}
      {showCreateModal && (
        <CreateDatasetModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Bulk Operations Modal */}
      {showBulkModal && (
        <BulkOperationsModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          datasets={datasets || []}
        />
      )}
    </div>
  );
};

export default DatasetList;
