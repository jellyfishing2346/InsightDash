import React from 'react';
import { 
  CheckCircleIcon, 
  ChartBarIcon, 
  SparklesIcon,
  CloudArrowUpIcon,
  BoltIcon,
  CogIcon,
  UserGroupIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const FeatureShowcase = () => {
  const implementedFeatures = [
    {
      category: "Data Management",
      features: [
        "Dataset upload and management",
        "Data preview with pagination", 
        "Multiple file format support",
        "Data validation and profiling"
      ],
      icon: CloudArrowUpIcon,
      status: "completed"
    },
    {
      category: "Analytics & Insights",
      features: [
        "Trend analysis and pattern detection",
        "Statistical summaries",
        "Data visualization charts",
        "Interactive dashboards"
      ],
      icon: ChartBarIcon,
      status: "completed"
    },
    {
      category: "Predictive Analytics",
      features: [
        "Linear regression forecasting",
        "ARIMA time series forecasting",
        "Moving average models",
        "Model accuracy metrics"
      ],
      icon: SparklesIcon,
      status: "completed"
    },
    {
      category: "Real-Time Features",
      features: [
        "WebSocket real-time updates",
        "Live data streaming",
        "Real-time dashboard monitoring",
        "Instant notifications"
      ],
      icon: BoltIcon,
      status: "completed"
    },
    {
      category: "Advanced Operations",
      features: [
        "Bulk data operations",
        "Batch processing",
        "Data transformation",
        "Export functionality"
      ],
      icon: CogIcon,
      status: "completed"
    },
    {
      category: "AI-Powered Insights",
      features: [
        "Automated pattern recognition",
        "Intelligent recommendations",
        "Anomaly detection",
        "Smart data insights"
      ],
      icon: SparklesIcon,
      status: "completed"
    },
    {
      category: "Security & Authentication",
      features: [
        "User authentication",
        "Role-based access control",
        "Secure API endpoints",
        "Token-based security"
      ],
      icon: ShieldCheckIcon,
      status: "completed"
    },
    {
      category: "Collaboration",
      features: [
        "Multi-user support",
        "Shared dashboards",
        "Team collaboration",
        "Activity tracking"
      ],
      icon: UserGroupIcon,
      status: "completed"
    }
  ];

  const technicalHighlights = [
    "React + TypeScript frontend with modern UI",
    "FastAPI backend with async/await support", 
    "WebSocket real-time communication",
    "Mock backend for demo purposes",
    "Responsive design with Tailwind CSS",
    "State management with Zustand",
    "Data fetching with React Query",
    "Comprehensive error handling",
    "Toast notifications for user feedback",
    "Modular component architecture"
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          InsightDash Feature Showcase
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A comprehensive analytics and forecasting platform with advanced features for data-driven insights.
        </p>
      </div>

      {/* Implementation Status */}
      <div className="mb-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-green-900">
                ✅ Platform Complete & Functional
              </h2>
              <p className="text-green-700 mt-1">
                All major features have been implemented and are working. The platform includes both 
                frontend and backend components with a mock server for demonstration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {implementedFeatures.map((category, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-lg p-2 mr-3">
                <category.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {category.category}
              </h3>
            </div>
            
            <ul className="space-y-2">
              {category.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Technical Implementation */}
      <div className="bg-gray-50 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Technical Implementation
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Frontend Stack</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">React 18 with modern hooks</span>
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">TypeScript for type safety</span>
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Tailwind CSS for styling</span>
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">React Query for data fetching</span>
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Zustand for state management</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Backend Features</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">FastAPI with async support</span>
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Machine learning integration</span>
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">WebSocket real-time updates</span>
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Mock server for demo</span>
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">RESTful API design</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
          How to Explore the Platform
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Try the Demo
            </h3>
            <p className="text-blue-700 text-sm">
              Visit the Demo page to generate sample data and see all features in action.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Explore Analytics
            </h3>
            <p className="text-blue-700 text-sm">
              Check out the Analytics section to see forecasting models and data insights.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              View Datasets
            </h3>
            <p className="text-blue-700 text-sm">
              Browse the Datasets page to see data management and preview capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
