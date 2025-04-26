import React, { useState, useEffect } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { 
  WifiIcon, 
  SignalIcon,
  ClockIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

import { useWebSocket } from '../../hooks/useWebSocket';
import { useAnalyticsStore } from '../../stores';

const RealTimeDashboard = ({ datasetId }) => {
  const [isLive, setIsLive] = useState(true);
  const [dataPoints, setDataPoints] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  const { sendMessage, isConnected } = useWebSocket(datasetId, false); // Disabled for now
  const { realTimeData } = useAnalyticsStore();

  // Update local data points when new real-time data arrives
  useEffect(() => {
    if (realTimeData.length > 0) {
      setDataPoints(prev => {
        const latest = realTimeData[0];
        const newPoint = {
          timestamp: latest.timestamp || new Date().toISOString(),
          value: latest.value || Math.random() * 100, // Fallback for demo
          ...latest
        };
        
        setLastUpdate(new Date());
        
        // Keep last 50 points for smooth visualization
        return [newPoint, ...prev.slice(0, 49)];
      });
    }
  }, [realTimeData]);

  // Generate sample data for demo purposes
  useEffect(() => {
    if (!datasetId || !isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newPoint = {
        timestamp: now.toISOString(),
        value: Math.random() * 100 + 50,
        temperature: Math.random() * 30 + 15,
        humidity: Math.random() * 40 + 30,
      };
      
      setDataPoints(prev => [newPoint, ...prev.slice(0, 49)]);
      setLastUpdate(now);
    }, 2000);

    return () => clearInterval(interval);
  }, [datasetId, isLive]);

  const toggleLiveMode = () => {
    setIsLive(!isLive);
    if (!isLive && datasetId) {
      // Re-subscribe when turning live mode back on
      sendMessage({
        type: 'subscribe',
        dataset_id: datasetId,
      });
    }
  };

  const clearData = () => {
    setDataPoints([]);
    setLastUpdate(null);
  };

  // Prepare chart data (reverse for chronological order)
  const chartData = dataPoints.slice().reverse().map((point, index) => ({
    ...point,
    index,
    time: new Date(point.timestamp).toLocaleTimeString(),
  }));

  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">Real-time Data Stream</h3>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {/* Live Indicator */}
          {isLive && (
            <div className="flex items-center space-x-1 text-green-600">
              <SignalIcon className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">LIVE</span>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-3">
          {lastUpdate && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4" />
              <span>Last: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
          
          <button
            onClick={toggleLiveMode}
            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
              isLive 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isLive ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <WifiIcon className="h-4 w-4 mr-1" />
                Resume
              </>
            )}
          </button>
          
          <button
            onClick={clearData}
            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Data Points</div>
          <div className="text-2xl font-bold text-blue-900">{dataPoints.length}</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Current Value</div>
          <div className="text-2xl font-bold text-green-900">
            {dataPoints[0]?.value?.toFixed(2) || '--'}
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-yellow-600 font-medium">Average</div>
          <div className="text-2xl font-bold text-yellow-900">
            {dataPoints.length > 0 
              ? (dataPoints.reduce((sum, p) => sum + (p.value || 0), 0) / dataPoints.length).toFixed(2)
              : '--'
            }
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-purple-600 font-medium">Update Rate</div>
          <div className="text-2xl font-bold text-purple-900">
            {isLive ? '2s' : '--'}
          </div>
        </div>
      </div>

      {/* Real-time Chart */}
      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => `Time: ${value}`}
                formatter={(value, name) => [value?.toFixed(2), name]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={2}
                name="Value"
              />
              
              {/* Additional metrics if available */}
              {chartData[0]?.temperature !== undefined && (
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#10B981"
                  fill="transparent"
                  strokeWidth={2}
                  name="Temperature"
                />
              )}
              
              {chartData[0]?.humidity !== undefined && (
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#F59E0B"
                  fill="transparent"
                  strokeWidth={2}
                  name="Humidity"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <WifiIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Waiting for real-time data...</p>
              {!isConnected && (
                <p className="text-sm mt-2">Check WebSocket connection</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Data Stream Log */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Data Points</h4>
        <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-md p-3">
          {dataPoints.slice(0, 5).map((point, index) => (
            <div key={index} className="text-xs text-gray-600 font-mono py-1">
              {new Date(point.timestamp).toLocaleTimeString()} - 
              Value: {point.value?.toFixed(2)} 
              {point.temperature && `, Temp: ${point.temperature.toFixed(1)}°C`}
              {point.humidity && `, Humidity: ${point.humidity.toFixed(1)}%`}
            </div>
          ))}
          
          {dataPoints.length === 0 && (
            <div className="text-xs text-gray-400">No data points yet...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
