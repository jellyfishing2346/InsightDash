import React from 'react';
import { 
  ChartBarIcon, 
  DocumentDuplicateIcon, 
  UserGroupIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { useDatasets } from '../../hooks/useData';

const StatsCards = () => {
  const { data: datasetsData } = useDatasets();
  
  const stats = [
    {
      name: 'Total Datasets',
      value: datasetsData?.data?.length || 0,
      icon: DocumentDuplicateIcon,
      change: '+2.1%',
      changeType: 'positive',
    },
    {
      name: 'Active Forecasts',
      value: '12',
      icon: ChartBarIcon,
      change: '+5.4%',
      changeType: 'positive',
    },
    {
      name: 'Data Points',
      value: '24.7K',
      icon: ClockIcon,
      change: '+12.3%',
      changeType: 'positive',
    },
    {
      name: 'Active Users',
      value: '8',
      icon: UserGroupIcon,
      change: '-1.2%',
      changeType: 'negative',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <stat.icon className="w-8 h-8 text-primary-600" />
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-600 truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'positive' 
                      ? 'text-success-600' 
                      : 'text-error-600'
                  }`}>
                    {stat.change}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
