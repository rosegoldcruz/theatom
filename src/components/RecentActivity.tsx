import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Zap
} from 'lucide-react';

interface ActivityItem {
  activity_type: string;
  activity_id: string;
  description: string;
  value: number;
  status: string;
  timestamp: string;
  metadata: any;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: string, status: string) => {
    if (type === 'trade') {
      return status === 'success' ? 
        <CheckCircle className="h-4 w-4 text-green-400" /> : 
        <XCircle className="h-4 w-4 text-red-400" />;
    } else if (type === 'opportunity') {
      return <Search className="h-4 w-4 text-blue-400" />;
    }
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Success' },
      failed: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Failed' },
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Pending' },
      detected: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Detected' },
      executing: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Executing' },
      completed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Completed' },
      expired: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Expired' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={`${config.color} border text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'trade') {
      const isProfit = value > 0;
      const Icon = isProfit ? TrendingUp : TrendingDown;
      const colorClass = isProfit ? 'text-green-400' : 'text-red-400';
      
      return (
        <div className={`flex items-center ${colorClass}`}>
          <Icon className="h-3 w-3 mr-1" />
          ${Math.abs(value).toFixed(4)}
        </div>
      );
    } else {
      return (
        <div className="text-blue-400">
          ${value.toFixed(4)}
        </div>
      );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No recent activity</p>
            <p className="text-sm text-gray-400 mt-2">
              Activity will appear here as your bot starts trading
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity, index) => (
              <div 
                key={`${activity.activity_id}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.activity_type, activity.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white text-sm font-medium truncate">
                        {activity.description}
                      </p>
                      {getStatusBadge(activity.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(activity.timestamp)}
                      </span>
                      
                      {activity.activity_type === 'trade' && activity.metadata?.gas_used && (
                        <span>
                          Gas: {(activity.metadata.gas_used / 1000).toFixed(0)}k
                        </span>
                      )}
                      
                      {activity.activity_type === 'opportunity' && activity.metadata?.profit_basis_points && (
                        <span>
                          {activity.metadata.profit_basis_points}bp profit
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  {formatValue(activity.value, activity.activity_type)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
