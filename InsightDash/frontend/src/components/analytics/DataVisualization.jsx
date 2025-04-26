import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  AreaChart,
  Area
} from 'recharts';

const DataVisualization = ({ dataset, analytics }) => {
  if (!analytics || !analytics.summary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const { summary, correlations, time_series } = analytics;

  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Summary Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Column
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mean
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Std Dev
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Null Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(summary).map(([column, stats]) => (
                <tr key={column}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {column}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stats.mean?.toFixed(2) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stats.std?.toFixed(2) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stats.min?.toFixed(2) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stats.max?.toFixed(2) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stats.null_count || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Series Visualization */}
      {time_series && time_series.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Time Series Data</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={time_series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [value?.toFixed(2), name]}
                />
                <Legend />
                {/* Dynamically render lines for each numeric column */}
                {Object.keys(time_series[0] || {}).filter(key => 
                  key !== 'date' && typeof time_series[0][key] === 'number'
                ).map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Correlation Matrix */}
      {correlations && Object.keys(correlations).length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Correlation Matrix</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Variable
                  </th>
                  {Object.keys(correlations).map(col => (
                    <th key={col} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(correlations).map(([row, values]) => (
                  <tr key={row}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {row}
                    </td>
                    {Object.entries(correlations).map(([col]) => {
                      const value = values[col];
                      const bgColor = value 
                        ? `rgba(${value > 0 ? '59, 130, 246' : '239, 68, 68'}, ${Math.abs(value)})`
                        : 'transparent';
                      
                      return (
                        <td 
                          key={col} 
                          className="px-4 py-2 text-center text-sm"
                          style={{ backgroundColor: bgColor }}
                        >
                          <span className={value && Math.abs(value) > 0.5 ? 'text-white' : 'text-gray-900'}>
                            {value?.toFixed(2) || '—'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Color intensity represents correlation strength. Blue = positive, Red = negative.
          </p>
        </div>
      )}

      {/* Distribution Charts */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Distribution</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sample distribution chart - replace with actual histogram data */}
          <div className="h-64">
            <h4 className="text-md font-medium text-gray-700 mb-2">Value Distribution</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generateSampleDistribution(summary)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Box plot representation */}
          <div className="h-64">
            <h4 className="text-md font-medium text-gray-700 mb-2">Statistical Summary</h4>
            <div className="space-y-2 pt-4">
              {Object.entries(summary).slice(0, 5).map(([column, stats]) => (
                <div key={column} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-gray-600 truncate">{column}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div 
                      className="bg-blue-500 h-4 rounded-full absolute"
                      style={{ 
                        left: '25%', 
                        width: '50%' 
                      }}
                    />
                    <div 
                      className="absolute top-0 h-4 w-1 bg-red-500"
                      style={{ left: '50%' }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.min?.toFixed(1)} - {stats.max?.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate sample distribution data
const generateSampleDistribution = (summary) => {
  const numericColumns = Object.entries(summary).filter(([_, stats]) => 
    stats.mean !== undefined
  );
  
  if (numericColumns.length === 0) return [];
  
  const [firstColumn, stats] = numericColumns[0];
  const min = stats.min || 0;
  const max = stats.max || 100;
  const range = max - min;
  const binSize = range / 10;
  
  return Array.from({ length: 10 }, (_, i) => ({
    range: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
    count: Math.floor(Math.random() * 50) + 1, // Sample data
  }));
};

export default DataVisualization;
