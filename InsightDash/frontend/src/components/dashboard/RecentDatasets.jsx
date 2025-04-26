import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentDuplicateIcon, EyeIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const RecentDatasets = ({ datasets, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!datasets || datasets.length === 0) {
    return (
      <div className="text-center py-8">
        <DocumentDuplicateIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No datasets found</p>
        <Link
          to="/datasets"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Create your first dataset
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {datasets.slice(0, 5).map((dataset) => (
        <div key={dataset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex-1 min-w-0">
            <Link 
              to={`/datasets/${dataset.id}`}
              className="block"
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {dataset.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {dataset.description || 'No description'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Updated {formatDistanceToNow(new Date(dataset.updated_at || dataset.created_at), { addSuffix: true })}
              </p>
            </Link>
          </div>
          <div className="flex-shrink-0 ml-4">
            <Link
              to={`/datasets/${dataset.id}`}
              className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ))}
      
      {datasets.length > 5 && (
        <div className="pt-2">
          <Link
            to="/datasets"
            className="block text-center text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all datasets
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentDatasets;
