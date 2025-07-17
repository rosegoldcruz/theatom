import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Settings from './Settings';
import Logs from './Logs';
import Status from './Status';

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

const MainDashboard = () => {
  const [botStatus, setBotStatus] = useState<'running' | 'stopped' | 'error'>('stopped');
  const [flashLoanStatus, setFlashLoanStatus] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">ATOM Arbitrage Dashboard</h1>
        <nav className="flex gap-4">
          <Link to="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline">Settings</Button>
          </Link>
          <Link to="/logs">
            <Button variant="outline">Logs</Button>
          </Link>
          <Link to="/status">
            <Button variant="outline">Status</Button>
          </Link>
        </nav>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(botStatus)} ${botStatus === 'running' ? 'animate-pulse' : ''}`} />
            Bot Status: {botStatus.toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={startBot} 
              disabled={botStatus === 'running'}
              className="bg-green-600 hover:bg-green-700"
            >
              Start Bot
            </Button>
            <Button 
              onClick={stopBot} 
              disabled={botStatus === 'stopped'}
              variant="destructive"
            >
              Stop Bot
            </Button>
            <Button 
              onClick={runFlashLoan}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Run Flash Loan
            </Button>
          </div>
          {flashLoanStatus && (
            <div className="p-3 bg-slate-700 rounded-lg">
              <p className="text-white">{flashLoanStatus}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Total Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-400">{dashboardData.totalTrades}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-400">
                {dashboardData.totalTrades > 0 
                  ? Math.round((dashboardData.successfulTrades / dashboardData.totalTrades) * 100)
                  : 0}%
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Total Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-400">
                ${dashboardData.totalProfit.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {dashboardData?.recentTrades && dashboardData.recentTrades.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardData.recentTrades.slice(0, 5).map((trade) => (
                <div key={trade.id} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <div>
                    <Badge variant={trade.status === 'success' ? 'default' : 'destructive'}>
                      {trade.status}
                    </Badge>
                    <span className="ml-2 text-white text-sm">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${trade.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${trade.profit.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">{trade.txHash.slice(0, 10)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const LiveAtomDashboard = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/status" element={<Status />} />
      </Routes>
    </Router>
  );
};

export default LiveAtomDashboard;
