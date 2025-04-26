import React from 'react';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { useUIStore, useAuthStore } from '../stores';

const Header = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const user = useAuthStore((state) => state.user);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {user?.full_name?.split(' ')[0] || user?.username}
            </h1>
            <p className="text-sm text-gray-600">
              Monitor your data insights in real-time
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User avatar */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
