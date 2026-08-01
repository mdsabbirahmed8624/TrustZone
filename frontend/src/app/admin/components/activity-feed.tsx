'use client';

import React from 'react';
import { 
  LogIn, 
  UserCheck, 
  Settings, 
  Database, 
  Wrench, 
  ShieldAlert 
} from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'auth' | 'settings' | 'rbac' | 'backup' | 'crud' | 'security';
  description: string;
  user: string;
  timestamp: string;
  ipAddress?: string;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  { id: '1', type: 'auth', description: 'System Administrator logged in successfully', user: 'admin@trustzone.care', timestamp: '5 mins ago', ipAddress: '103.113.152.63' },
  { id: '2', type: 'rbac', description: 'Permission level updated for role "MANAGER"', user: 'admin@trustzone.care', timestamp: '1 hour ago', ipAddress: '103.113.152.63' },
  { id: '3', type: 'backup', description: 'Automated database snapshot backup uploaded to S3', user: 'System Cron', timestamp: '3 hours ago' },
  { id: '4', type: 'crud', description: 'Registered new customer device: iPhone 13 Pro', user: 'k.hasan@trustzone.care', timestamp: '5 hours ago', ipAddress: '103.113.152.60' },
  { id: '5', type: 'security', description: 'Failed login attempt lockout triggered on desk accountant', user: 'unknown-user', timestamp: '6 hours ago', ipAddress: '192.168.1.1' },
  { id: '6', type: 'settings', description: 'Branch details modified for Mirpur Lab Desk', user: 'admin@trustzone.care', timestamp: '1 day ago', ipAddress: '103.113.152.63' },
];

interface ActivityFeedProps {
  activities?: ActivityItem[];
  maxItems?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities = DEFAULT_ACTIVITIES, 
  maxItems = 6 
}) => {
  const visibleActivities = activities.slice(0, maxItems);

  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'auth':
        return { icon: LogIn, color: 'text-green-500 bg-green-500/10 border-green-500/20' };
      case 'rbac':
        return { icon: UserCheck, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
      case 'backup':
        return { icon: Database, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
      case 'crud':
        return { icon: Wrench, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' };
      case 'security':
        return { icon: ShieldAlert, color: 'text-red-500 bg-red-500/10 border-red-500/20' };
      default:
        return { icon: Settings, color: 'text-muted-foreground bg-muted border-border/20' };
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {visibleActivities.map((activity, idx) => {
          const config = getActivityConfig(activity.type);
          const Icon = config.icon;
          const isLast = idx === visibleActivities.length - 1;

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {/* Connecting Line */}
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border/60"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  {/* Icon */}
                  <div>
                    <span className={`h-8.5 w-8.5 rounded-lg border flex items-center justify-center ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  {/* Text Details */}
                  <div className="flex-grow min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {activity.description}{' '}
                        <span className="text-[10px] text-muted-foreground font-normal block mt-0.5">
                          Triggered by {activity.user} {activity.ipAddress ? `from IP ${activity.ipAddress}` : ''}
                        </span>
                      </p>
                    </div>
                    <div className="text-right text-[9px] font-bold text-muted-foreground whitespace-nowrap pt-0.5">
                      <time>{activity.timestamp}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
