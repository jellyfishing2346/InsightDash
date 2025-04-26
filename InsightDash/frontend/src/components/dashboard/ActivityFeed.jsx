import React from 'react';
import { 
  DocumentPlusIcon, 
  ChartBarIcon, 
  UserPlusIcon,
  ArrowUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const ActivityFeed = () => {
  // Sample activity data
  const activities = [
    {
      id: 1,
      type: 'dataset_created',
      title: 'New dataset created',
      description: 'Sales Q4 2024 dataset',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: DocumentPlusIcon,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      id: 2,
      type: 'forecast_generated',
      title: 'Forecast completed',
      description: 'ARIMA model prediction for Revenue',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      icon: ChartBarIcon,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      id: 3,
      type: 'user_joined',
      title: 'New team member',
      description: 'Sarah Johnson joined as analyst',
      time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      icon: UserPlusIcon,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      id: 4,
      type: 'data_updated',
      title: 'Real-time data spike',
      description: 'Traffic increased by 23%',
      time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      icon: ArrowUpIcon,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100'
    },
    {
      id: 5,
      type: 'system_update',
      title: 'System maintenance',
      description: 'Scheduled backup completed',
      time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      icon: ClockIcon,
      iconColor: 'text-gray-600',
      iconBg: 'bg-gray-100'
    }
  ];

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`${activity.iconBg} h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white`}>
                    <activity.icon className={`h-4 w-4 ${activity.iconColor}`} aria-hidden="true" />
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time dateTime={activity.time.toISOString()}>
                      {formatDistanceToNow(activity.time, { addSuffix: true })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
