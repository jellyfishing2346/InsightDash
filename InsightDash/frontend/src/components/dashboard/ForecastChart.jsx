import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useGenerateForecast, useForecastHistory } from '../../hooks/useData';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const ForecastChart = ({ datasetId }) => {
  const [forecastParams, setForecastParams] = useState({
    target_column: 'value',
    model_type: 'arima',
    forecast_periods: 30
  });

  const { data: forecastHistory } = useForecastHistory(datasetId);
  const generateForecast = useGenerateForecast();

  const handleGenerateForecast = () => {
    generateForecast.mutate({
      datasetId,
      params: forecastParams
    });
  };

  // Sample forecast data for demo
  const sampleForecastData = Array.from({ length: 30 }, (_, i) => {
    const baseValue = 75 + Math.sin(i * 0.2) * 10;
    return {
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      predicted: baseValue + (Math.random() - 0.5) * 10,
      lower: baseValue - 15,
      upper: baseValue + 15,
      actual: i < 10 ? baseValue + (Math.random() - 0.5) * 5 : null
    };
  });

  const latestForecast = forecastHistory?.data?.[0];
  const displayData = latestForecast?.forecast_data || sampleForecastData;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Column
            </label>
            <select
              value={forecastParams.target_column}
              onChange={(e) => setForecastParams({ ...forecastParams, target_column: e.target.value })}
              className="input-field text-sm w-32"
            >
              <option value="value">Value</option>
              <option value="revenue">Revenue</option>
              <option value="users">Users</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={forecastParams.model_type}
              onChange={(e) => setForecastParams({ ...forecastParams, model_type: e.target.value })}
              className="input-field text-sm w-32"
            >
              <option value="arima">ARIMA</option>
              <option value="linear_regression">Linear Regression</option>
              <option value="moving_average">Moving Average</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Periods
            </label>
            <select
              value={forecastParams.forecast_periods}
              onChange={(e) => setForecastParams({ ...forecastParams, forecast_periods: parseInt(e.target.value) })}
              className="input-field text-sm w-20"
            >
              <option value={7}>7d</option>
              <option value={30}>30d</option>
              <option value={90}>90d</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateForecast}
          disabled={generateForecast.isLoading}
          className="btn-primary flex items-center space-x-2"
        >
          {generateForecast.isLoading ? (
            <div className="loading-spinner w-4 h-4"></div>
          ) : (
            <ChartBarIcon className="w-4 h-4" />
          )}
          <span>Generate Forecast</span>
        </button>
      </div>

      {/* Chart */}
      <div className="h-64">
        {displayData && displayData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              
              {/* Confidence interval */}
              <Area
                type="monotone"
                dataKey="upper"
                stackId="1"
                stroke="transparent"
                fill="#dbeafe"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stackId="1"
                stroke="transparent"
                fill="white"
                fillOpacity={1}
              />
              
              {/* Actual values */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3 }}
                connectNulls={false}
              />
              
              {/* Predicted values */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3b82f6', r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No forecast data available</p>
              <p className="text-sm">Generate a forecast to see predictions</p>
            </div>
          </div>
        )}
      </div>

      {/* Forecast Info */}
      {latestForecast && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Model</p>
            <p className="text-xs text-gray-600 capitalize">{latestForecast.model_type}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">RMSE</p>
            <p className="text-xs text-gray-600">
              {latestForecast.accuracy_metrics?.rmse?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">MAE</p>
            <p className="text-xs text-gray-600">
              {latestForecast.accuracy_metrics?.mae?.toFixed(2) || 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastChart;
