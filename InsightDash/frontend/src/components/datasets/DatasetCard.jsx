import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentDuplicateIcon,
  GlobeAltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { useDeleteDataset } from '../../hooks/useData';
import EditDatasetModal from './EditDatasetModal';

const DatasetCard = ({ dataset }) => {
  const deleteDataset = useDeleteDataset();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this dataset?')) {
      deleteDataset.mutate(dataset.id);
    }
  };

  return (
    <div className="card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <Link to={`/datasets/${dataset.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
              {dataset.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {dataset.description || 'No description provided'}
          </p>
        </div>
        
        <div className="flex items-center space-x-1 ml-4">
          {dataset.is_public ? (
            <GlobeAltIcon className="w-4 h-4 text-green-500" title="Public" />
          ) : (
            <LockClosedIcon className="w-4 h-4 text-gray-400" title="Private" />
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
        <div className="flex items-center space-x-1">
          <DocumentDuplicateIcon className="w-4 h-4" />
          <span className="capitalize">{dataset.data_source || 'Unknown'}</span>
        </div>
        <div>
          Updated {formatDistanceToNow(new Date(dataset.updated_at || dataset.created_at), { addSuffix: true })}
        </div>
      </div>

      {/* Schema preview */}
      {dataset.schema_config && Object.keys(dataset.schema_config).length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Columns:</p>
          <div className="flex flex-wrap gap-1">
            {Object.keys(dataset.schema_config).slice(0, 3).map((column) => (
              <span
                key={column}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {column}
              </span>
            ))}
            {Object.keys(dataset.schema_config).length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{Object.keys(dataset.schema_config).length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Link
            to={`/datasets/${dataset.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <EyeIcon className="w-4 h-4 mr-1" />
            View
          </Link>
          
          <button 
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <PencilIcon className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleteDataset.isLoading}
          className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <TrashIcon className="w-4 h-4 mr-1" />
          Delete
        </button>
      </div>

      {/* Edit Dataset Modal */}
      {showEditModal && (
        <EditDatasetModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          dataset={dataset}
        />
      )}
    </div>
  );
};

export default DatasetCard;
