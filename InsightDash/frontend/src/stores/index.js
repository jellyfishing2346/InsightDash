import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, token) => {
        localStorage.setItem('access_token', token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      // Check if user has admin role
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export const useDashboardStore = create((set, get) => ({
  datasets: [],
  currentDataset: null,
  dashboards: [],
  currentDashboard: null,
  isLoading: false,
  error: null,

  // Dataset actions
  setDatasets: (datasets) => set({ datasets }),
  
  setCurrentDataset: (dataset) => set({ currentDataset: dataset }),
  
  addDataset: (dataset) => {
    set((state) => ({
      datasets: [...state.datasets, dataset],
    }));
  },
  
  updateDataset: (id, updatedData) => {
    set((state) => ({
      datasets: state.datasets.map((dataset) =>
        dataset.id === id ? { ...dataset, ...updatedData } : dataset
      ),
      currentDataset: state.currentDataset?.id === id 
        ? { ...state.currentDataset, ...updatedData } 
        : state.currentDataset,
    }));
  },
  
  removeDataset: (id) => {
    set((state) => ({
      datasets: state.datasets.filter((dataset) => dataset.id !== id),
      currentDataset: state.currentDataset?.id === id ? null : state.currentDataset,
    }));
  },

  // Dashboard actions
  setDashboards: (dashboards) => set({ dashboards }),
  
  setCurrentDashboard: (dashboard) => set({ currentDashboard: dashboard }),
  
  addDashboard: (dashboard) => {
    set((state) => ({
      dashboards: [...state.dashboards, dashboard],
    }));
  },
  
  updateDashboard: (id, updatedData) => {
    set((state) => ({
      dashboards: state.dashboards.map((dashboard) =>
        dashboard.id === id ? { ...dashboard, ...updatedData } : dashboard
      ),
      currentDashboard: state.currentDashboard?.id === id 
        ? { ...state.currentDashboard, ...updatedData } 
        : state.currentDashboard,
    }));
  },

  // Loading and error states
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
}));

export const useAnalyticsStore = create((set, get) => ({
  forecasts: [],
  currentForecast: null,
  analyticsData: {},
  realTimeData: [],
  isLoading: false,
  
  // Forecast actions
  setForecasts: (forecasts) => set({ forecasts }),
  
  addForecast: (forecast) => {
    set((state) => ({
      forecasts: [forecast, ...state.forecasts],
    }));
  },
  
  setCurrentForecast: (forecast) => set({ currentForecast: forecast }),
  
  // Analytics data
  setAnalyticsData: (datasetId, data) => {
    set((state) => ({
      analyticsData: {
        ...state.analyticsData,
        [datasetId]: data,
      },
    }));
  },
  
  // Real-time data
  addRealTimeData: (data) => {
    set((state) => ({
      realTimeData: [data, ...state.realTimeData.slice(0, 99)], // Keep last 100 points
    }));
  },
  
  clearRealTimeData: () => set({ realTimeData: [] }),
  
  setLoading: (loading) => set({ isLoading: loading }),
}));

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'light',
  notifications: [],

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setTheme: (theme) => set({ theme }),

  addNotification: (notification) => {
    const id = Date.now();
    set((state) => ({
      notifications: [
        { id, ...notification, timestamp: new Date() },
        ...state.notifications,
      ],
    }));
    return id;
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),
}));
