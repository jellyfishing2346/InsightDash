import React, { useState } from 'react';
import { PlayIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const DataGenerator = () => {
  const [generating, setGenerating] = useState(false);
  const [generatedDataset, setGeneratedDataset] = useState(null);

  const generateSampleData = async (type) => {
    setGenerating(true);
    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(`http://localhost:8000/api/v1/demo/generate-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          rows: 100,
          start_date: '2023-01-01',
          end_date: '2023-12-31'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedDataset(data);
        toast.success(`Generated ${type.replace('_', ' ')} sample data with ${data.rows} rows!`);
      } else {
        throw new Error('Failed to generate data');
      }
    } catch (error) {
      toast.error('Failed to generate sample data. Make sure the backend server is running.');
      console.error('Data generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const runAnalytics = async () => {
    if (!generatedDataset) {
      toast.error('Please generate sample data first');
      return;
    }

    try {
      // Run various analytics on the generated data
      const analytics = await Promise.all([
        fetch(`http://localhost:8000/api/v1/analytics/trend?dataset_id=${generatedDataset.id}`),
        fetch(`http://localhost:8000/api/v1/analytics/forecast?dataset_id=${generatedDataset.id}&method=linear_regression&periods=30`),
        fetch(`http://localhost:8000/api/v1/analytics/forecast?dataset_id=${generatedDataset.id}&method=arima&periods=30`),
      ]);

      const results = await Promise.all(analytics.map(r => r.json()));
      
      toast.success('Analytics completed! Check the Analytics tab for results.');
    } catch (error) {
      toast.error('Failed to run analytics');
      console.error('Analytics error:', error);
    }
  };

  const dataTypes = [
    {
      id: 'sales',
      name: 'Sales Data',
      description: 'Monthly sales figures with seasonal trends',
      icon: ChartBarIcon,
      color: 'bg-blue-500'
    },
    {
      id: 'temperature',
      name: 'Temperature Data',
      description: 'Daily temperature readings with weather patterns',
      icon: DocumentTextIcon,
      color: 'bg-green-500'
    },
    {
      id: 'stock',
      name: 'Stock Prices',
      description: 'Historical stock price movements',
      icon: ChartBarIcon,
      color: 'bg-purple-500'
    },
    {
      id: 'website_traffic',
      name: 'Website Traffic',
      description: 'Daily website visitor counts and pageviews',
      icon: ChartBarIcon,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Data Generation Demo
        </h2>
        <p className="text-gray-600">
          Generate sample datasets to explore InsightDash's analytics and forecasting capabilities.
        </p>
      </div>

      {/* Data Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {dataTypes.map((type) => (
          <div
            key={type.id}
            className="relative group bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => generateSampleData(type.id)}
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${type.color} rounded-lg p-3`}>
                <type.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {type.description}
                </p>
              </div>
            </div>
            
            {generating && (
              <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Generated Dataset Info */}
      {generatedDataset && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-green-900">
                Dataset Generated Successfully!
              </h3>
              <p className="text-green-700 mt-1">
                {generatedDataset.name} - {generatedDataset.rows} rows
              </p>
            </div>
            <button
              onClick={runAnalytics}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Run Analytics
            </button>
          </div>
        </div>
      )}

      {/* Features Overview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What You Can Do
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Analyze Trends</h4>
            <p className="text-sm text-gray-600">
              Identify patterns and trends in your data
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Generate Forecasts</h4>
            <p className="text-sm text-gray-600">
              Predict future values using ML algorithms
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <PlayIcon className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Real-time Updates</h4>
            <p className="text-sm text-gray-600">
              Monitor data changes in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataGenerator;
