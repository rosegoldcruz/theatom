import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Dashboard: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [amount, setAmount] = useState('');

  const stats = [
    { label: 'Total Trades', value: '1,247', change: '+12.5%' },
    { label: 'Total Profit', value: '$45,892', change: '+8.3%' },
    { label: 'Success Rate', value: '99.7%', change: '+0.2%' },
    { label: 'Avg Gas Used', value: '0.003 ETH', change: '-5.1%' }
  ];

  const recentTrades = [
    { id: '0x1a2b...', profit: '$127.45', gas: '0.002 ETH', status: 'Success', time: '2 min ago' },
    { id: '0x3c4d...', profit: '$89.32', gas: '0.003 ETH', status: 'Success', time: '5 min ago' },
    { id: '0x5e6f...', profit: '$203.18', gas: '0.002 ETH', status: 'Success', time: '8 min ago' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              ATOM Dashboard
            </span>
          </h1>
          <p className="text-gray-400">Trustless arbitrage execution terminal</p>
        </div>

        {/* Wallet Connection */}
        <Card className="mb-8 bg-gray-900/50 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Wallet Status</h3>
                <p className="text-gray-400">
                  {isConnected ? 'Connected: 0x1234...5678' : 'Connect your wallet to start trading'}
                </p>
              </div>
              <Button 
                onClick={() => setIsConnected(!isConnected)}
                className={isConnected ? 
                  'bg-green-600 hover:bg-green-700' : 
                  'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600'
                }
              >
                {isConnected ? 'Disconnect' : 'Connect Wallet'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gray-900/50 border-purple-500/20">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400 mb-2">{stat.label}</div>
                <Badge variant={stat.change.startsWith('+') ? 'default' : 'secondary'} className="text-xs">
                  {stat.change}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Trading Panel */}
          <Card className="bg-gray-900/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Execute Arbitrage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="amount" className="text-white">Flash Loan Amount (ETH)</Label>
                <Input 
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-gray-800 border-gray-600 text-white"
                  disabled={!isConnected}
                />
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50"
                  disabled={!isConnected || !amount}
                >
                  Start Flash Loan
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 disabled:opacity-50"
                  disabled={!isConnected}
                >
                  Run Arbitrage
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                Contract: 0xa395a70b59bdDd537C6a8B33fa0dC3eA9dE068A9
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gray-900/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrades.map((trade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="text-white font-mono text-sm">{trade.id}</div>
                      <div className="text-gray-400 text-xs">{trade.time}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">{trade.profit}</div>
                      <div className="text-gray-400 text-xs">Gas: {trade.gas}</div>
                    </div>
                    <Badge className="bg-green-600">{trade.status}</Badge>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4 border-purple-500 text-purple-400 hover:bg-purple-500/10">
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;