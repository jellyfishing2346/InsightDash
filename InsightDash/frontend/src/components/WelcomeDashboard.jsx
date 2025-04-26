import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  DocumentDuplicateIcon, 
  PlayIcon,
  SparklesIcon,
  ArrowRightIcon,
  LightBulbIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useDatasets } from '../hooks/useData';

const WelcomeDashboard = () => {
  const { data: datasets = [], isLoading } = useDatasets({ limit: 5 });

  const features = [
    {
      name: 'Smart Analytics',
      description: 'Discover patterns and trends in your data with advanced analytics',
      icon: ChartBarIcon,
      color: 'bg-blue-500',
      href: '/analytics'
    },
    {
      name: 'Predictive Forecasting',
      description: 'Use machine learning to predict future trends and outcomes',
      icon: SparklesIcon,
      color: 'bg-purple-500',
      href: '/analytics'
    },
    {
      name: 'Real-time Monitoring',
      description: 'Monitor your data in real-time with live dashboards',
      icon: BoltIcon,
      color: 'bg-green-500',
      href: '/'
    },
    {
      name: 'Interactive Demo',
      description: 'Try out all features with our interactive demo and sample data',
      icon: PlayIcon,
      color: 'bg-orange-500',
      href: '/demo'
    }
  ];

  const quickActions = [
    {
      name: 'Upload Dataset',
      description: 'Start by uploading your data files',
      icon: DocumentDuplicateIcon,
      href: '/datasets',
      primary: true
    },
    {
      name: 'Try Demo',
      description: 'Explore features with sample data',
      icon: PlayIcon,
      href: '/demo',
      primary: false
    },
    {
      name: 'View Analytics',
      description: 'See your data insights',
      icon: ChartBarIcon,
      href: '/analytics',
      primary: false
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasData = datasets && datasets.length > 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4">
            <LightBulbIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to InsightDash
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Transform your data into actionable insights with advanced analytics, 
          predictive forecasting, and real-time monitoring.
        </p>

        {!hasData && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/demo"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Try Interactive Demo
            </Link>
            <Link
              to="/datasets"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
              Upload Your Data
            </Link>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="py-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Powerful Analytics Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.name}
              to={feature.href}
              className="group relative bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center">
                <div className={`${feature.color} rounded-lg p-3 mr-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    {feature.name}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {feature.description}
              </p>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {!hasData && (
        <div className="py-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Get Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className={`group relative p-6 rounded-lg border-2 border-dashed transition-all duration-200 ${
                  action.primary
                    ? 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                }`}
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center rounded-lg p-3 mb-4 ${
                    action.primary ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <action.icon className={`h-8 w-8 ${
                      action.primary ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <h3 className={`text-lg font-medium mb-2 ${
                    action.primary ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {action.name}
                  </h3>
                  <p className={`text-sm ${
                    action.primary ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Existing data summary */}
      {hasData && (
        <div className="py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Data Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <DocumentDuplicateIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{datasets.length}</p>
                  <p className="text-sm text-gray-600">Datasets</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {datasets.reduce((sum, d) => sum + (d.row_count || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Rows</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <SparklesIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">Ready</p>
                  <p className="text-sm text-gray-600">For Analytics</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/analytics"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Start Analytics
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeDashboard;
