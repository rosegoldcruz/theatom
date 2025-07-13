import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Download, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { NETWORKS } from '../constants/networks';

interface FakeTradeData {
  id: string;
  timestamp: string;
  network: string;
  tokenA: string;
  tokenB: string;
  profit: number;
  volume: number;
  gasUsed: number;
  status: 'success' | 'failed' | 'pending';
}

interface FakeStatsData {
  totalProfit: number;
  totalTrades: number;
  successRate: number;
  avgGasUsed: number;
  topNetwork: string;
}

const TOKENS = ['ETH', 'USDC', 'USDT', 'WBTC', 'DAI', 'LINK', 'UNI', 'AAVE', 'COMP', 'MKR'];

export const generateFakeStats = (): FakeStatsData => ({
  totalProfit: Math.random() * 10000 + 1000,
  totalTrades: Math.floor(Math.random() * 500) + 100,
  successRate: Math.random() * 30 + 70,
  avgGasUsed: Math.random() * 100000 + 50000,
  topNetwork: Object.keys(NETWORKS)[Math.floor(Math.random() * Object.keys(NETWORKS).length)]
});

export const generateFakeOpportunities = (count: number = 20): FakeTradeData[] => {
  return Array.from({ length: count }, (_, i) => {
    const networks = Object.keys(NETWORKS);
    const network = networks[Math.floor(Math.random() * networks.length)];
    const tokenA = TOKENS[Math.floor(Math.random() * TOKENS.length)];
    const tokenB = TOKENS[Math.floor(Math.random() * TOKENS.length)];
    const statuses: FakeTradeData['status'][] = ['success', 'failed', 'pending'];
    
    return {
      id: `trade_${i + 1}_${Date.now()}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      network,
      tokenA,
      tokenB: tokenA === tokenB ? TOKENS[(TOKENS.indexOf(tokenA) + 1) % TOKENS.length] : tokenB,
      profit: (Math.random() - 0.3) * 1000,
      volume: Math.random() * 50000 + 1000,
      gasUsed: Math.random() * 200000 + 21000,
      status: statuses[Math.floor(Math.random() * statuses.length)]
    };
  });
};

export const FakeDataGenerator: React.FC = () => {
  const [trades, setTrades] = useState<FakeTradeData[]>(() => generateFakeOpportunities());
  const [stats, setStats] = useState<FakeStatsData>(() => generateFakeStats());
  const [isGenerating, setIsGenerating] = useState(false);

  const regenerateData = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTrades(generateFakeOpportunities());
    setStats(generateFakeStats());
    setIsGenerating(false);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Timestamp', 'Network', 'Token A', 'Token B', 'Profit', 'Volume', 'Gas Used', 'Status'];
    const csvContent = [
      headers.join(','),
      ...trades.map(trade => [
        trade.id,
        trade.timestamp,
        trade.network,
        trade.tokenA,
        trade.tokenB,
        trade.profit.toFixed(2),
        trade.volume.toFixed(2),
        trade.gasUsed.toString(),
        trade.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arbitrage_trades_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalProfit.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Profit</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalTrades}</div>
            <div className="text-sm text-gray-600">Total Trades</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.successRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {Math.floor(stats.avgGasUsed).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Avg Gas Used</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Fake Data Generator</span>
            <div className="flex gap-2">
              <Button onClick={regenerateData} disabled={isGenerating} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Regenerate'}
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.slice(0, 10).map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="text-xs">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={NETWORKS[trade.network]?.bgColor || 'bg-gray-500'}>
                        {NETWORKS[trade.network]?.name || trade.network}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {trade.tokenA}/{trade.tokenB}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${
                        trade.profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.profit > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        ${Math.abs(trade.profit).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>${trade.volume.toFixed(0)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        trade.status === 'success' ? 'default' : 
                        trade.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {trade.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FakeDataGenerator;