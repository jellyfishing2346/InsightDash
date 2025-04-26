import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  CogIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  PlayIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useUIStore, useAuthStore } from '../stores';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Datasets', href: '/datasets', icon: DocumentDuplicateIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Demo', href: '/demo', icon: PlayIcon },
  { name: 'Features', href: '/features', icon: SparklesIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const Sidebar = () => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} lg:translate-x-0`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
          <h1 className="text-xl font-bold text-white">InsightDash</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-full">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {user?.full_name || user?.username}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
