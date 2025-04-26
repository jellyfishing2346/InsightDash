class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = process.env.REACT_APP_WS_URL || 'ws://localhost:8001/api/v1/ws/live-data';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3; // Reduced from 5
    this.reconnectDelay = 5000; // Increased from 1000ms to 5000ms
    this.listeners = new Map();
    this.isManuallyDisconnected = false;
  }

  connect() {
    // Don't try to connect if manually disconnected
    if (this.isManuallyDisconnected) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected');
        
        // Only attempt reconnect if not manually disconnected
        if (!this.isManuallyDisconnected) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  disconnect() {
    this.isManuallyDisconnected = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  subscribe(datasetId) {
    this.send({
      type: 'subscribe',
      dataset_id: datasetId,
      timestamp: new Date().toISOString()
    });
  }

  ping() {
    this.send({
      type: 'ping',
      timestamp: new Date().toISOString()
    });
  }

  handleMessage(message) {
    console.log('WebSocket message received:', message);
    
    switch (message.type) {
      case 'data_update':
        this.emit('dataUpdate', message.payload);
        break;
      case 'forecast_complete':
        this.emit('forecastComplete', message.payload);
        break;
      case 'connection':
        this.emit('connectionMessage', message.payload);
        break;
      case 'subscription_confirmed':
        this.emit('subscriptionConfirmed', message.payload);
        break;
      case 'pong':
        this.emit('pong', message.payload);
        break;
      default:
        this.emit('message', message);
    }
  }

  attemptReconnect() {
    if (this.isManuallyDisconnected) {
      return;
    }
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts; // Linear instead of exponential
      
      console.log(`Attempting to reconnect in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (!this.isManuallyDisconnected) {
          this.connect();
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  // Event listener methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event listener:', error);
        }
      });
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
