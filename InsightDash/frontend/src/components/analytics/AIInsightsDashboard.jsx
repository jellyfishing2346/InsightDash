import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

import LoadingSpinner from '../common/LoadingSpinner';

const AIInsightsDashboard = ({ datasets = [] }) => {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Generate AI insights (mock implementation)
  useEffect(() => {
    if (selectedDataset) {
      generateInsights(selectedDataset);
    }
  }, [selectedDataset]);

  const generateInsights = (dataset) => {
    // Simulate AI analysis with realistic insights
    const mockInsights = [
      {
        id: 1,
        type: 'trend',
        severity: 'info',
        title: 'Positive Growth Trend Detected',
        description: `Your ${dataset.name} shows a consistent 15% growth trend over the last 3 months. This indicates strong performance in the primary metrics.`,
        confidence: 92,
        action: 'Monitor and maintain current strategies',
        icon: ArrowTrendingUpIcon,
        category: 'Performance'
      },
      {
        id: 2,
        type: 'anomaly',
        severity: 'warning',
        title: 'Data Quality Issue Identified',
        description: `Approximately 3.2% of records in ${dataset.name} contain missing values in critical fields. This may impact analysis accuracy.`,
        confidence: 87,
        action: 'Review data collection process',
        icon: ExclamationTriangleIcon,
        category: 'Data Quality'
      },
      {
        id: 3,
        type: 'pattern',
        severity: 'success',
        title: 'Seasonal Pattern Recognition',
        description: `Strong seasonal patterns detected with peak performance in Q4. Consider adjusting forecasting models to account for this cyclical behavior.`,
        confidence: 95,
        action: 'Update forecasting parameters',
        icon: SparklesIcon,
        category: 'Seasonality'
      },
      {
        id: 4,
        type: 'correlation',
        severity: 'info',
        title: 'Strong Correlation Found',
        description: `High correlation (0.83) identified between marketing spend and revenue. This suggests effective marketing ROI.`,
        confidence: 89,
        action: 'Consider increasing marketing budget',
        icon: LightBulbIcon,
        category: 'Insights'
      },
      {
        id: 5,
        type: 'forecast',
        severity: 'warning',
        title: 'Model Accuracy Declining',
        description: `Forecast accuracy for linear regression model has dropped to 78%. Consider switching to ARIMA or retraining with recent data.`,
        confidence: 84,
        action: 'Retrain or switch models',
        icon: ArrowTrendingDownIcon,
        category: 'Modeling'
      }
    ];

    const mockRecommendations = [
      {
        id: 1,
        title: 'Optimize Data Collection',
        description: 'Implement automated data validation to reduce missing values',
        priority: 'high',
        estimatedImpact: 'Medium',
        timeToImplement: '2-3 weeks',
        category: 'Data Quality'
      },
      {
        id: 2,
        title: 'Enhance Forecasting Models',
        description: 'Implement ensemble methods combining multiple algorithms',
        priority: 'medium',
        estimatedImpact: 'High',
        timeToImplement: '4-6 weeks',
        category: 'Analytics'
      },
      {
        id: 3,
        title: 'Real-time Monitoring Setup',
        description: 'Configure alerts for significant trend changes',
        priority: 'medium',
        estimatedImpact: 'Medium',
        timeToImplement: '1-2 weeks',
        category: 'Monitoring'
      },
      {
        id: 4,
        title: 'Seasonal Adjustment Implementation',
        description: 'Update models to better handle seasonal variations',
        priority: 'low',
        estimatedImpact: 'Low',
        timeToImplement: '2-3 weeks',
        category: 'Modeling'
      }
    ];

    // Simulate AI processing delay
    setTimeout(() => {
      setInsights(mockInsights);
      setRecommendations(mockRecommendations);
    }, 1500);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <SparklesIcon className="h-8 w-8 mr-3" />
              AI-Powered Insights
            </h2>
            <p className="mt-2 text-purple-100">
              Automatically generated insights and recommendations for your data
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-purple-200">Analysis Status</div>
            <div className="flex items-center mt-1">
              {insights.length > 0 ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  <span>Complete</span>
                </>
              ) : (
                <>
                  <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                  <span>Analyzing...</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Selection */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Dataset for Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {datasets.map((dataset) => (
            <button
              key={dataset.id}
              onClick={() => setSelectedDataset(dataset)}
              className={`p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                selectedDataset?.id === dataset.id 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="font-medium text-gray-900">{dataset.name}</div>
              <div className="text-sm text-gray-500 mt-1">
                {dataset.row_count?.toLocaleString()} records
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Last updated: {new Date(dataset.updated_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedDataset && (
        <>
          {/* AI Insights */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              AI Insights for "{selectedDataset.name}"
            </h3>
            
            {insights.length === 0 ? (
              <div className="text-center py-8">
                <LoadingSpinner />
                <p className="mt-4 text-gray-500">Analyzing data patterns and trends...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <insight.icon className="h-6 w-6 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{insight.title}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                              {insight.category}
                            </span>
                            <span className="text-xs font-medium">
                              {insight.confidence}% confidence
                            </span>
                          </div>
                        </div>
                        
                        <p className="mt-1 text-sm opacity-80">
                          {insight.description}
                        </p>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Recommended Action: {insight.action}
                          </span>
                          
                          <div className="w-24 bg-white bg-opacity-50 rounded-full h-2">
                            <div 
                              className="bg-current h-2 rounded-full"
                              style={{ width: `${insight.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recommendations
            </h3>
            
            {recommendations.length === 0 && insights.length > 0 ? (
              <div className="text-center py-8">
                <LoadingSpinner />
                <p className="mt-4 text-gray-500">Generating recommendations...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(rec.priority)}`}>
                            {rec.priority} priority
                          </span>
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-600">
                          {rec.description}
                        </p>
                        
                        <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="font-medium text-gray-500">Impact:</span>
                            <span className="ml-1 text-gray-900">{rec.estimatedImpact}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Timeline:</span>
                            <span className="ml-1 text-gray-900">{rec.timeToImplement}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Category:</span>
                            <span className="ml-1 text-gray-900">{rec.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button className="ml-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        Implement
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Insights Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">{insights.length}</div>
                <div className="text-sm text-blue-600">Total Insights</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-900">
                  {insights.filter(i => i.severity === 'success').length}
                </div>
                <div className="text-sm text-green-600">Positive Findings</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-900">
                  {insights.filter(i => i.severity === 'warning').length}
                </div>
                <div className="text-sm text-yellow-600">Areas for Improvement</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-900">
                  {insights.length > 0 ? Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length) : 0}%
                </div>
                <div className="text-sm text-purple-600">Average Confidence</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIInsightsDashboard;
