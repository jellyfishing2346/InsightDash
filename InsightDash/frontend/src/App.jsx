import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores';

import Layout from './components/Layout';
import WelcomeDashboard from './components/WelcomeDashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DatasetList from './components/datasets/DatasetList';
import DatasetDetail from './components/datasets/DatasetDetail';
import Analytics from './components/analytics/Analytics';
import DataGenerator from './components/demo/DataGenerator';
import FeatureShowcase from './components/FeatureShowcase';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <WelcomeDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/datasets" element={
              <ProtectedRoute>
                <Layout>
                  <DatasetList />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/datasets/:id" element={
              <ProtectedRoute>
                <Layout>
                  <DatasetDetail />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/demo" element={
              <ProtectedRoute>
                <Layout>
                  <DataGenerator />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/features" element={
              <ProtectedRoute>
                <Layout>
                  <FeatureShowcase />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;// Cache bust 1752499625
