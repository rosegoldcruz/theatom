import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Play, Pause, TrendingUp, DollarSign, Zap, Activity, ExternalLink } from 'lucide-react';
import { useArbitrageBot } from '@/hooks/useArbitrageBot';
import TradingMetrics from './TradingMetrics';
import BotControls from './BotControls';

const RealBotDashboard: React.FC = () => {
  const {
    isRunning,
    opportunities,
    stats,
    isLoading,
    startBot,
    stopBot,
    executeArbitrage,
    refreshData
  } = useArbitrageBot();

  const toggleBot = () => {
    if (isRunning) {
      stopBot();
    } else {
      startBot();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'executing': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
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
              <p className="text-purple-300">Real Arbitrage Bot - Connected to Supabase</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={refreshData} variant="outline" className="text-white border-slate-600">
              Refresh Data
            </Button>
            <Button
              onClick={toggleBot}
              size="lg"
              className={`${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-8`}
              disabled={isLoading}
            >
              {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              {isRunning ? 'Stop Bot' : 'Start Bot'}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">${stats.totalProfit.toFixed(2)}</div>
              <p className="text-xs text-slate-400">From executed trades</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.successRate.toFixed(1)}%</div>
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
              <p className="text-xs text-slate-400">Ready to execute</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{stats.totalTrades}</div>
              <p className="text-xs text-slate-400">All time executions</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="dashboard" className="text-white">Live Dashboard</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white">Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="text-white">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            {/* Bot Status */}
            <Card className="bg-slate-800/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  Bot Status: {isRunning ? 'SCANNING FOR OPPORTUNITIES' : 'INACTIVE'}
                  {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-300 space-y-2">
                  <p>🔗 <strong>Database:</strong> Connected to Supabase (Real data storage)</p>
                  <p>⚡ <strong>Flash Loans:</strong> Ready for AAVE, Balancer, dYdX integration</p>
                  <p>🔍 <strong>DEX Monitoring:</strong> Uniswap, SushiSwap, Curve, Balancer, PancakeSwap, 1inch</p>
                  <p>🛡️ <strong>Smart Contract:</strong> Your AtomArbitrage contract ready for integration</p>
                  {isRunning && <p className="text-green-400">✅ <strong>Status:</strong> Actively scanning for profitable arbitrage opportunities</p>}
                </div>
              </CardContent>
            </Card>

            {/* Smart Contract Integration */}
            <Card className="bg-slate-800/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Your Smart Contract Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 p-4 rounded-lg mb-4">
                  <code className="text-green-400 text-sm">
                    contract AtomArbitrage {'{'}<br/>
                    &nbsp;&nbsp;function requestFlashLoan(address token, uint amount) external onlyOwner<br/>
                    &nbsp;&nbsp;function withdrawETH() external onlyOwner<br/>
                    {'}'}
                  </code>
                </div>
                <p className="text-slate-300 mb-4">
                  This bot is designed to work with your existing AtomArbitrage smart contract. 
                  The detected opportunities can be executed through your contract's flash loan functionality.
                </p>
                <div className="text-sm text-slate-400">
                  <p>• Flash loan execution through your contract</p>
                  <p>• Profit withdrawal to owner address</p>
                  <p>• Gas optimization and MEV protection</p>
                </div>
              </CardContent>
            </Card>

            {/* Live Opportunities */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Live Arbitrage Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {opportunities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400">No opportunities in database yet.</p>
                      <p className="text-slate-500 text-sm mt-2">Start the bot to begin real opportunity detection.</p>
                    </div>
                  ) : (
                    opportunities.map((opp) => (
                      <div key={opp.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(opp.status)}>
                            {opp.status}
                          </Badge>
                          <div>
                            <p className="text-white font-medium">{opp.pair}</p>
                            <p className="text-sm text-slate-400">
                              {opp.exchange1} (${opp.price1?.toFixed(4)}) → {opp.exchange2} (${opp.price2?.toFixed(4)})
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <p className="text-green-400 font-bold">${opp.profit_estimate?.toFixed(2)}</p>
                            <p className="text-xs text-slate-400">Est. profit</p>
                          </div>
                          {opp.status === 'detected' && (
                            <Button
                              size="sm"
                              onClick={() => executeArbitrage(opp.id)}
                              className="bg-blue-500 hover:bg-blue-600"
                            >
                              Execute
                            </Button>
                          )}
                          {opp.tx_hash && (
                            <Button size="sm" variant="outline" className="p-2">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
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

export default RealBotDashboard;