import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Play, Pause, TrendingUp, DollarSign, Zap, Activity } from 'lucide-react';
import TradingMetrics from './TradingMetrics';
import BotControls from './BotControls';

interface ArbitrageOpportunity {
  id: string;
  pair: string;
  exchange1: string;
  exchange2: string;
  profit: number;
  status: 'detected' | 'executing' | 'completed';
}

const BotDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [stats, setStats] = useState({
    totalProfit: 1247.83,
    successRate: 94.2,
    activeOpportunities: 3,
    totalTrades: 156
  });

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        const newOpp: ArbitrageOpportunity = {
          id: Math.random().toString(36).substr(2, 9),
          pair: ['ETH/USDC', 'BTC/USDT', 'UNI/ETH'][Math.floor(Math.random() * 3)],
          exchange1: ['Uniswap', 'Curve', 'Balancer'][Math.floor(Math.random() * 3)],
          exchange2: ['SushiSwap', 'PancakeSwap', '1inch'][Math.floor(Math.random() * 3)],
          profit: Math.random() * 50 + 10,
          status: 'detected'
        };
        
        setOpportunities(prev => [newOpp, ...prev.slice(0, 4)]);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const toggleBot = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">THEATOM.AI</h1>
              <p className="text-purple-300">Arbitrage Trustless On-Chain Module</p>
            </div>
          </div>
          
          <Button
            onClick={toggleBot}
            size="lg"
            className={`${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-8`}
          >
            {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {isRunning ? 'Stop Bot' : 'Start Bot'}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">${stats.totalProfit}</div>
              <p className="text-xs text-slate-400">+12.3% from last week</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.successRate}%</div>
              <Progress value={stats.successRate} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Opportunities</CardTitle>
              <Zap className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.activeOpportunities}</div>
              <p className="text-xs text-slate-400">Currently scanning</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{stats.totalTrades}</div>
              <p className="text-xs text-slate-400">Lifetime executions</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="dashboard" className="text-white">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white">Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="text-white">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            {/* Bot Status */}
            <Card className="bg-slate-800/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  Bot Status: {isRunning ? 'ACTIVE' : 'INACTIVE'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-300">
                  {isRunning ? (
                    <div className="space-y-2">
                      <p>🔍 Scanning 12 DEXs for arbitrage opportunities...</p>
                      <p>⚡ Flash loan protocols: AAVE, Balancer, dYdX</p>
                      <p>🛡️ MEV protection: Flashbots relay active</p>
                      <p>💰 Gas optimization: Dynamic fee adjustment enabled</p>
                    </div>
                  ) : (
                    <p>Bot is currently stopped. Click "Start Bot" to begin scanning for arbitrage opportunities.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Arbitrage Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {opportunities.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No opportunities detected yet. Start the bot to begin scanning.</p>
                  ) : (
                    opportunities.map((opp) => (
                      <div key={opp.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge variant={opp.status === 'completed' ? 'default' : 'secondary'}>
                            {opp.status}
                          </Badge>
                          <div>
                            <p className="text-white font-medium">{opp.pair}</p>
                            <p className="text-sm text-slate-400">{opp.exchange1} → {opp.exchange2}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">${opp.profit.toFixed(2)}</p>
                          <p className="text-xs text-slate-400">Estimated profit</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <TradingMetrics />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <BotControls isRunning={isRunning} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BotDashboard;