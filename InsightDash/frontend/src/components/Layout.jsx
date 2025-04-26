import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useUIStore, useAuthStore } from '../stores';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className={`${
        sidebarOpen ? 'main-content-with-sidebar' : 'main-content-without-sidebar'
      } main-content`}>
        <Header />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
