import React from 'react';

const SimpleApp = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">InsightDash</h1>
        <p className="text-gray-600 mb-6">
          Analytics Platform Loading...
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">
            🚀 Platform Status: Ready
          </p>
          <p className="text-blue-700 text-sm mt-1">
            If you see this, the React app is working correctly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;
