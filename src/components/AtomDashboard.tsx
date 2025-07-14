import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw,
  DollarSign,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useBotControl } from '../hooks/useBotControl';
import { TradesTable } from './TradesTable';
import { ConfigurationPanel } from './ConfigurationPanel';
import { BotControlPanel } from './BotControlPanel';
import { ProfitChart } from './ProfitChart';
import { RecentActivity } from './RecentActivity';

interface DashboardStats {
  overview: {
    total_trades: number;
    successful_trades: number;
    total_profit: number;
    success_rate: number;
    avg_profit_per_trade: number;
    total_gas_used: number;
    avg_gas_per_trade: number;
  };
  profit_by_token: Array<{
    token_in: string;
    total_profit: number;
    trade_count: number;
    avg_profit: number;
  }>;
  profit_by_dex: Array<{
    dex_path: string;
    total_profit: number;
    trade_count: number;
    avg_profit: number;
    success_rate: number;
  }>;
  daily_summary: Array<{
    date: string;
    total_profit: number;
    trade_count: number;
    success_count: number;
    avg_profit: number;
  }>;
  recent_activity: Array<{
    activity_type: string;
    activity_id: string;
    description: string;
    value: number;
    status: string;
    timestamp: string;
    metadata: any;
  }>;
}

export const AtomDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { stats, loading: statsLoading, error: statsError, refreshStats } = useDashboardStats();
  const { botStatus, loading: botLoading, startBot, stopBot, pauseContract, unpauseContract } = useBotControl();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStats();
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading ATOM Dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const overview = stats?.overview || {
    total_trades: 0,
    successful_trades: 0,
    total_profit: 0,
    success_rate: 0,
    avg_profit_per_trade: 0,
    total_gas_used: 0,
    avg_gas_per_trade: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">ATOM Arbitrage</h1>
              <p className="text-gray-300">Professional Trading Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="text-right">
              <p className="text-sm text-gray-300">Welcome back,</p>
              <p className="font-semibold text-white">{user?.email}</p>
            </div>
            <Button onClick={logout} variant="outline" className="text-white border-white/20 hover:bg-white/10">
              Logout
            </Button>
          </div>
        </div>

        {/* Bot Status Alert */}
        {botStatus && (
          <Alert className={`${
            botStatus.contract?.paused ? 'border-red-500 bg-red-500/10' : 
            botStatus.bots?.some((bot: any) => bot.status === 'running') ? 'border-green-500 bg-green-500/10' : 
            'border-yellow-500 bg-yellow-500/10'
          }`}>
            <Activity className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Contract Status: {botStatus.contract?.paused ? 'PAUSED' : 'ACTIVE'} • 
                Active Bots: {botStatus.bots?.filter((bot: any) => bot.status === 'running').length || 0}
              </span>
              {user?.role === 'admin' && (
                <div className="flex gap-2">
                  {botStatus.contract?.paused ? (
                    <Button size="sm" onClick={unpauseContract} className="bg-green-600 hover:bg-green-700">
                      <Play className="h-3 w-3 mr-1" />
                      Unpause
                    </Button>
                  ) : (
                    <Button size="sm" onClick={pauseContract} variant="destructive">
                      <Pause className="h-3 w-3 mr-1" />
                      Pause
                    </Button>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total Profit</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(overview.total_profit)}
                  </p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400">
                  {formatCurrency(overview.avg_profit_per_trade)} avg per trade
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatPercentage(overview.success_rate)}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-2">
                <Progress 
                  value={overview.success_rate} 
                  className="h-2 bg-white/10"
                />
                <p className="text-sm text-gray-300 mt-1">
                  {overview.successful_trades} of {overview.total_trades} trades
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total Trades</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {overview.total_trades.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400">
                  {overview.successful_trades} successful
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Gas Used</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {(overview.total_gas_used / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Zap className="h-6 w-6 text-orange-400" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <Clock className="h-4 w-4 text-orange-400 mr-1" />
                <span className="text-orange-400">
                  {(overview.avg_gas_per_trade / 1000).toFixed(0)}k avg per trade
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="trades" className="text-white data-[state=active]:bg-white/20">
              Trades
            </TabsTrigger>
            <TabsTrigger value="config" className="text-white data-[state=active]:bg-white/20">
              Configuration
            </TabsTrigger>
            {user?.role === 'admin' && (
              <TabsTrigger value="control" className="text-white data-[state=active]:bg-white/20">
                Bot Control
              </TabsTrigger>
            )}
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProfitChart data={stats?.daily_summary || []} />
              <RecentActivity activities={stats?.recent_activity || []} />
            </div>
          </TabsContent>

          <TabsContent value="trades">
            <TradesTable />
          </TabsContent>

          <TabsContent value="config">
            <ConfigurationPanel />
          </TabsContent>

          {user?.role === 'admin' && (
            <TabsContent value="control">
              <BotControlPanel />
            </TabsContent>
          )}

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Profit by Token</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.profit_by_token?.slice(0, 5).map((token, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{token.token_in}</p>
                          <p className="text-sm text-gray-300">{token.trade_count} trades</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-400">
                            {formatCurrency(token.total_profit)}
                          </p>
                          <p className="text-sm text-gray-300">
                            {formatCurrency(token.avg_profit)} avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Profit by DEX</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.profit_by_dex?.slice(0, 5).map((dex, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{dex.dex_path}</p>
                          <p className="text-sm text-gray-300">
                            {dex.trade_count} trades • {formatPercentage(dex.success_rate)} success
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-400">
                            {formatCurrency(dex.total_profit)}
                          </p>
                          <p className="text-sm text-gray-300">
                            {formatCurrency(dex.avg_profit)} avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
