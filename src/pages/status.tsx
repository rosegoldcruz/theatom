import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface SystemStatus {
  backend: 'online' | 'offline' | 'degraded';
  bot: 'running' | 'stopped' | 'error';
  database: 'connected' | 'disconnected' | 'slow';
  blockchain: 'synced' | 'syncing' | 'error';
  dexes: {
    uniswap: 'available' | 'unavailable';
    balancer: 'available' | 'unavailable';
    curve: 'available' | 'unavailable';
    sushi: 'available' | 'unavailable';
  };
  metrics: {
    uptime: number;
    totalTrades: number;
    successRate: number;
    totalProfit: number;
    avgResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  lastUpdate: string;
}

const Status = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'running':
      case 'connected':
      case 'synced':
      case 'available':
        return 'bg-green-500';
      case 'degraded':
      case 'slow':
      case 'syncing':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'running':
      case 'connected':
      case 'synced':
      case 'available':
        return '✅';
      case 'degraded':
      case 'slow':
      case 'syncing':
        return '⚠️';
      default:
        return '❌';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) return <div className="p-8">Loading system status...</div>;
  if (!status) return <div className="p-8">Failed to load system status</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">System Status</h1>
        <Button onClick={fetchStatus} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Core Systems */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Backend API</p>
                <p className="text-lg font-semibold text-white">{status.backend}</p>
              </div>
              <span className="text-2xl">{getStatusIcon(status.backend)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Bot State</p>
                <p className="text-lg font-semibold text-white">{status.bot}</p>
              </div>
              <span className="text-2xl">{getStatusIcon(status.bot)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Database</p>
                <p className="text-lg font-semibold text-white">{status.database}</p>
              </div>
              <span className="text-2xl">{getStatusIcon(status.database)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Blockchain</p>
                <p className="text-lg font-semibold text-white">{status.blockchain}</p>
              </div>
              <span className="text-2xl">{getStatusIcon(status.blockchain)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DEX Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">DEX Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(status.dexes).map(([dex, dexStatus]) => (
              <div key={dex} className="flex items-center gap-2">
                <Badge className={getStatusColor(dexStatus)}>
                  {getStatusIcon(dexStatus)}
                </Badge>
                <span className="text-white capitalize">{dex}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Trading Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Uptime</span>
              <span className="text-white">{formatUptime(status.metrics.uptime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Trades</span>
              <span className="text-white">{status.metrics.totalTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Success Rate</span>
              <span className="text-white">{status.metrics.successRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Profit</span>
              <span className="text-green-400">${status.metrics.totalProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Response Time</span>
              <span className="text-white">{status.metrics.avgResponseTime}ms</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">System Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Memory Usage</span>
                <span className="text-white">{status.metrics.memoryUsage}%</span>
              </div>
              <Progress value={status.metrics.memoryUsage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">CPU Usage</span>
                <span className="text-white">{status.metrics.cpuUsage}%</span>
              </div>
              <Progress value={status.metrics.cpuUsage} className="h-2" />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Update</span>
              <span className="text-white text-sm">
                {new Date(status.lastUpdate).toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Status;
