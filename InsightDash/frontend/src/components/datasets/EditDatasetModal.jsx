import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUpdateDataset } from '../../hooks/useData';

const EditDatasetModal = ({ isOpen, onClose, dataset }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false
  });

  const updateDataset = useUpdateDataset();

  useEffect(() => {
    if (dataset) {
      setFormData({
        name: dataset.name || '',
        description: dataset.description || '',
        is_public: dataset.is_public || false
      });
    }
  }, [dataset]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dataset?.id) return;

    try {
      await updateDataset.mutateAsync({
        id: dataset.id,
        data: formData
      });
      onClose();
    } catch (error) {
      console.error('Failed to update dataset:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Edit Dataset
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Dataset Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter dataset name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter dataset description"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_public"
              name="is_public"
              checked={formData.is_public}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
              Make this dataset public
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateDataset.isLoading}
              className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {updateDataset.isLoading ? 'Updating...' : 'Update Dataset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDatasetModal;
