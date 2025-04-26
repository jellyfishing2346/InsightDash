import { useEffect, useCallback } from 'react';
import webSocketService from '../services/websocket';
import { useAnalyticsStore } from '../stores';

export const useWebSocket = (datasetId, enabled = false) => {
  const addRealTimeData = useAnalyticsStore((state) => state.addRealTimeData);

  const handleDataUpdate = useCallback((data) => {
    if (data.dataset_id === datasetId) {
      addRealTimeData(data);
    }
  }, [datasetId, addRealTimeData]);

  const handleForecastComplete = useCallback((data) => {
    if (data.dataset_id === datasetId) {
      console.log('Forecast completed for dataset:', datasetId, data);
      // Could trigger a refetch of forecasts here
    }
  }, [datasetId]);

  useEffect(() => {
    // Only connect if explicitly enabled
    if (!enabled) {
      return;
    }

    // Connect to WebSocket
    webSocketService.connect();

    // Subscribe to events
    webSocketService.on('dataUpdate', handleDataUpdate);
    webSocketService.on('forecastComplete', handleForecastComplete);

    // Subscribe to dataset updates
    if (datasetId) {
      webSocketService.subscribe(datasetId);
    }

    // Cleanup
    return () => {
      webSocketService.off('dataUpdate', handleDataUpdate);
      webSocketService.off('forecastComplete', handleForecastComplete);
      webSocketService.disconnect(); // Disconnect when component unmounts
    };
  }, [datasetId, handleDataUpdate, handleForecastComplete, enabled]);

  const sendMessage = useCallback((message) => {
    webSocketService.send(message);
  }, []);

  return {
    sendMessage,
    isConnected: webSocketService.ws?.readyState === WebSocket.OPEN,
  };
};
