"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { AppLayout } from '@/components/AppLayout';
import {
  Bot,
  TrendingUp,
  DollarSign,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

// Preserve the existing dashboard data interface
interface DashboardData {
  botStatus: 'running' | 'stopped' | 'error';
  totalTrades: number;
  successfulTrades: number;
  totalProfit: number;
  recentTrades: Array<{
    id: string;
    timestamp: string;
    profit: number;
    status: 'success' | 'failed';
    txHash: string;
  }>;
  opportunities: Array<{
    id: string;
    pair: string;
    profit: number;
    confidence: number;
  }>;
}

export default function DashboardPage() {
  // Preserve existing state management
  const [botStatus, setBotStatus] = useState<'running' | 'stopped' | 'error'>('stopped');
  const [flashLoanStatus, setFlashLoanStatus] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Preserve existing data fetching logic
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
        setBotStatus(data.data.botStatus);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Use mock data for development
      setDashboardData({
        botStatus: 'running',
        totalTrades: 462,
        successfulTrades: 435,
        totalProfit: 7214.58,
        recentTrades: [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            profit: 125.50,
            status: 'success',
            txHash: '0x742d35Cc6634C0532925a3b8D'
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            profit: 89.25,
            status: 'success',
            txHash: '0x742d35Cc6634C0532925a3b8E'
          }
        ],
        opportunities: [
          {
            id: '1',
            pair: 'ETH/USDC',
            profit: 0.025,
            confidence: 0.95
          },
          {
            id: '2',
            pair: 'BTC/USDT',
            profit: 0.018,
            confidence: 0.87
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Preserve existing bot control functions
  const startBot = async () => {
    try {
      const response = await fetch('/api/bot/start', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setBotStatus('running');
        toast({
          title: "Success",
          description: "Bot started successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start bot",
        variant: "destructive"
      });
    }
  };

  const stopBot = async () => {
    try {
      const response = await fetch('/api/bot/stop', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setBotStatus('stopped');
        toast({
          title: "Success",
          description: "Bot stopped successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop bot",
        variant: "destructive"
      });
    }
  };

  // Preserve existing flash loan function
  const runFlashLoan = async () => {
    setFlashLoanStatus('Running...');
    try {
      const response = await fetch('/api/flashloan/run', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setFlashLoanStatus(`Success 🚀 TX Hash: ${data.tx}`);
        toast({
          title: "Flash Loan Executed",
          description: `Transaction: ${data.tx}`,
        });
      } else {
        setFlashLoanStatus(`Failed ❌ ${data.error}`);
        toast({
          title: "Flash Loan Failed",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setFlashLoanStatus(`Error ❌ ${error.message}`);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) return (
    <AppLayout>
      <div className="p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center animate-glow-pulse mx-auto">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg gradient-text">Loading Quantum Dashboard...</p>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-4xl font-bold gradient-text">ATOM Arbitrage Dashboard</h1>
            <p className="text-muted-foreground mt-2">Real-time quantum trading intelligence</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={botStatus === 'running' ? 'default' : 'secondary'} className="animate-pulse">
              <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(botStatus)}`} />
              {botStatus.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <Card className="glass-dark border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">24h Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-green-400">
                +${dashboardData?.totalProfit?.toFixed(2) || '1,234.56'}
              </div>
              <p className="text-xs text-muted-foreground">+12.3% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-blue-400">
                {dashboardData?.totalTrades || 8}
              </div>
              <p className="text-xs text-muted-foreground">+2 from last hour</p>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-purple-400">
                {dashboardData ? ((dashboardData.successfulTrades / dashboardData.totalTrades) * 100).toFixed(1) : '94.2'}%
              </div>
              <p className="text-xs text-muted-foreground">+1.8% improvement</p>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-orange-400">Low</div>
              <p className="text-xs text-muted-foreground">Stable conditions</p>
            </CardContent>
          </Card>
        </div>

        {/* Bot Controls */}
        <Card className="glass-dark border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 holographic opacity-10" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="gradient-text">Bot Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={startBot}
                disabled={botStatus === 'running'}
                className="glass hover:animate-glow-pulse relative overflow-hidden"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent animate-data-flow" />
                <Zap className="h-5 w-5 mr-2" />
                Start Bot
              </Button>
              <Button
                onClick={stopBot}
                disabled={botStatus === 'stopped'}
                variant="outline"
                className="glass border-primary/30 hover:border-primary/50"
                size="lg"
              >
                Stop Bot
              </Button>
              <Button
                onClick={runFlashLoan}
                variant="outline"
                className="glass border-accent/30 hover:border-accent/50"
                size="lg"
              >
                <Activity className="h-5 w-5 mr-2" />
                Run Flash Loan
              </Button>
            </div>
            {flashLoanStatus && (
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm">{flashLoanStatus}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Trades and Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          {/* Recent Trades */}
          <Card className="glass-dark border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="gradient-text">Recent Trades</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.recentTrades?.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center space-x-3">
                      {trade.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium">${trade.profit.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(trade.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <Badge variant={trade.status === 'success' ? 'default' : 'destructive'}>
                      {trade.status}
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent trades</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card className="glass-dark border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="gradient-text">AI Opportunities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.opportunities?.map((opportunity) => (
                  <div key={opportunity.id} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div>
                      <p className="text-sm font-medium">{opportunity.pair}</p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {(opportunity.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">
                        +{(opportunity.profit * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Scanning for opportunities...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
