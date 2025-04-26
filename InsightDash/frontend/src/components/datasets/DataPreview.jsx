import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

import { datasetsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const DataPreview = ({ datasetId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data preview
  const { data, isLoading, error } = useQuery({
    queryKey: ['dataset-preview', datasetId, currentPage, pageSize, sortColumn, sortDirection, filters, searchTerm],
    queryFn: () => datasetsAPI.getPreview(datasetId, {
      page: currentPage,
      limit: pageSize,
      sort_column: sortColumn,
      sort_direction: sortDirection,
      filters,
      search: searchTerm,
    }),
    enabled: !!datasetId,
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilter = (column, value) => {
    setFilters(prev => ({
      ...prev,
      [column]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error loading data: {error.message}</div>;
  if (!data) return <div>No data available</div>;

  const { records, total, columns } = data;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-white rounded-lg border">
      {/* Controls */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Page size selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Clear filters */}
            {(Object.keys(filters).length > 0 || searchTerm) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear filters
              </button>
            )}
            
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, total)} of {total.toLocaleString()} records
            </div>
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.name}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column.name)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.name}</span>
                    {sortColumn === column.name && (
                      <span className="text-indigo-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 normal-case mt-1">
                    {column.type}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={`${index}-${column.name}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCellValue(record[column.name], column.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNumber
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format cell values based on type
const formatCellValue = (value, type) => {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">null</span>;
  }
  
  if (type === 'datetime' || type === 'timestamp') {
    return new Date(value).toLocaleString();
  }
  
  if (type === 'date') {
    return new Date(value).toLocaleDateString();
  }
  
  if (type === 'number' || type === 'float' || type === 'decimal') {
    return typeof value === 'number' ? value.toLocaleString() : value;
  }
  
  if (typeof value === 'string' && value.length > 100) {
    return (
      <span title={value}>
        {value.substring(0, 100)}...
      </span>
    );
  }
  
  return String(value);
};

export default DataPreview;
