import React, { useState } from 'react';
import axios from 'axios';
import { Dataset } from '../types/types';
import '../styles/DataLoader.css'; // Adjust the path as needed

type Props = {
  onDataLoad: (data: Dataset) => void;
  onError?: (error: string) => void;
};

export default function DataLoader({ onDataLoad, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000/api/data');

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Dataset>(apiEndpoint);
      onDataLoad(response.data);
    } catch (error) {
      const errorMsg = axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message
        : 'Unknown error occurred';
      onError?.(errorMsg);
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-loader">
      <div className="api-input">
        <input
          type="text"
          value={apiEndpoint}
          onChange={(e) => setApiEndpoint(e.target.value)}
          placeholder="Enter API endpoint"
        />
      </div>
      <button 
        onClick={loadData}
        disabled={loading}
        className={loading ? 'loading' : ''}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Loading...
          </>
        ) : (
          'Load Data from API'
        )}
      </button>
    </div>
  );
}