import React, { useEffect, useState } from 'react';
import { useDatasets } from '../../hooks/useData';

const ApiTest = () => {
  const [apiUrl, setApiUrl] = useState('');
  const { data: datasets, isLoading, error } = useDatasets();

  useEffect(() => {
    setApiUrl(process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1');
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-4">
      <h3 className="text-lg font-medium mb-4">API Debug Information</h3>
      
      <div className="space-y-2">
        <p><strong>API URL:</strong> {apiUrl}</p>
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error ? error.message : 'None'}</p>
        <p><strong>Datasets Count:</strong> {datasets ? datasets.length : 'N/A'}</p>
        
        {datasets && datasets.length > 0 && (
          <div>
            <strong>Datasets:</strong>
            <ul className="list-disc list-inside ml-4">
              {datasets.map(dataset => (
                <li key={dataset.id}>{dataset.name} (ID: {dataset.id})</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTest;
