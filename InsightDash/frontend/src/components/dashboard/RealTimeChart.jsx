import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const RealTimeChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate sample data for demo
      const now = new Date();
      return Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(now.getTime() - (19 - i) * 60000).toISOString(),
        value: Math.random() * 100 + 50,
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
      }));
    }
    
    return data.slice(-20).map(point => ({
      timestamp: point.timestamp,
      value: point.data?.value || point.value || Math.random() * 100,
      category: point.data?.category || point.category || 'A'
    }));
  }, [data]);

  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm:ss');
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p>Waiting for real-time data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatTime}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip 
            labelFormatter={(value) => `Time: ${formatTime(value)}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 5, fill: '#1d4ed8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RealTimeChart;
