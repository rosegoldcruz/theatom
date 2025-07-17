import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Database, Zap } from 'lucide-react';

type SystemStatus = {
  bot: 'running' | 'stopped' | 'error';
  backend: 'online' | 'offline' | 'error';
  database: 'connected' | 'disconnected' | 'error';
  blockchain: 'connected' | 'disconnected' | 'error';
  lastUpdate: string;
  uptime: string;
  version: string;
  network: string;
  gasPrice: string;
  blockNumber: number;
};

const Status = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'online':
      case 'connected':
        return 'bg-green-500';
      case 'stopped':
      case 'offline':
      case 'disconnected':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'running':
      case 'online':
      case 'connected':
        return 'default';
      case 'stopped':
      case 'offline':
      case 'disconnected':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) return <div className="p-8">Loading system status...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">System Status</h1>
        <Button onClick={fetchStatus} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {!status ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <p className="text-red-400">Failed to load system status</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Bot Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status.bot)} ${status.bot === 'running' ? 'animate-pulse' : ''}`} />
                  <Badge variant={getStatusVariant(status.bot)}>
                    {status.bot.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Backend API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status.backend)}`} />
                  <Badge variant={getStatusVariant(status.backend)}>
                    {status.backend.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status.database)}`} />
                  <Badge variant={getStatusVariant(status.database)}>
                    {status.database.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Blockchain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status.blockchain)}`} />
                  <Badge variant={getStatusVariant(status.blockchain)}>
                    {status.blockchain.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Version:</span>
                  <span className="text-white">{status.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Uptime:</span>
                  <span className="text-white">{status.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Update:</span>
                  <span className="text-white">
                    {new Date(status.lastUpdate).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Blockchain Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-white">{status.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gas Price:</span>
                  <span className="text-white">{status.gasPrice} Gwei</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Block Number:</span>
                  <span className="text-white">{status.blockNumber.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Status;
