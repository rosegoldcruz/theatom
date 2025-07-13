import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { NetworkSelector } from './NetworkSelector';
import { ThemeCustomizer } from './ThemeCustomizer';
import { FakeDataGenerator, generateFakeStats, generateFakeOpportunities } from './FakeDataGenerator';
import { generateMockOpportunities, generateNetworkStats, generateRecentTrades } from '../data/mockOpportunities';
import OpportunitiesTable from './OpportunitiesTable';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { NETWORKS } from '../constants/networks';
import { 
  Bot, 
  Settings, 
  Activity, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface UIState {
  isLoading: boolean;
  isTestMode: boolean;
  botStatus: 'idle' | 'running' | 'paused' | 'error';
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export const EnhancedBotDashboard: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colorTheme, setColorTheme] = useState('blue');
  const [brandingMode, setBrandingMode] = useState('arbitrage');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [walletAddress] = useState('0x742d35Cc6634C0532925a3b8D4e4D4c7b0e4c4e4');
  
  const [uiState, setUiState] = useState<UIState>({
    isLoading: false,
    isTestMode: true,
    botStatus: 'idle',
    connectionStatus: 'connected'
  });

  const [stats, setStats] = useState(() => generateFakeStats());
  const [opportunities, setOpportunities] = useState(() => generateFakeOpportunities(5));
  const [networkStats, setNetworkStats] = useState(() => generateNetworkStats(selectedNetwork));
  const [recentTrades, setRecentTrades] = useState(() => generateRecentTrades(selectedNetwork));
  const [realOpportunities, setRealOpportunities] = useState(() => generateMockOpportunities(selectedNetwork));

  useEffect(() => {
    // Update data when network changes
    setNetworkStats(generateNetworkStats(selectedNetwork));
    setRecentTrades(generateRecentTrades(selectedNetwork));
    setRealOpportunities(generateMockOpportunities(selectedNetwork));
  }, [selectedNetwork]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (uiState.botStatus === 'running') {
        setStats(generateFakeStats());
        setOpportunities(generateFakeOpportunities(5));
        setNetworkStats(generateNetworkStats(selectedNetwork));
        setRealOpportunities(generateMockOpportunities(selectedNetwork));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [uiState.botStatus, selectedNetwork]);

  const startBot = async () => {
    setUiState(prev => ({ ...prev, isLoading: true, botStatus: 'running' }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    setUiState(prev => ({ ...prev, isLoading: false }));
  };

  const stopBot = () => {
    setUiState(prev => ({ ...prev, botStatus: 'idle' }));
  };

  const toggleTestMode = () => {
    setUiState(prev => ({ ...prev, isTestMode: !prev.isTestMode }));
  };

  const getStatusIcon = () => {
    switch (uiState.botStatus) {
      case 'running': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Bot className="h-4 w-4 text-gray-500" />;
    }
  };

  const network = NETWORKS[selectedNetwork];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${network?.bgColor || 'bg-blue-500'}`}>
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ArbitrageBot Pro</h1>
              <p className="text-gray-600">Multi-chain arbitrage trading</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={uiState.botStatus === 'running' ? 'default' : 'secondary'}>
              {uiState.botStatus.toUpperCase()}
            </Badge>
            {uiState.isTestMode && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                TEST MODE
              </Badge>
            )}
          </div>
        </div>

        {/* Network Status Alert */}
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            Connected to {network?.name} • Contract: {network?.contracts.ATOM.slice(0, 10)}...
            {network?.faucetUrl && (
              <a href={network.faucetUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                Get testnet tokens
              </a>
            )}
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="data">Data Generator</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ${stats.totalProfit.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Total Profit</div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.totalTrades}</div>
                  <div className="text-sm text-gray-600">Total Trades</div>
                  <Progress value={stats.successRate} className="mt-2" />
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

            {/* Bot Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Bot Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={startBot} 
                    disabled={uiState.isLoading || uiState.botStatus === 'running'}
                    className={`${network?.bgColor || 'bg-blue-500'} hover:opacity-90`}
                  >
                    {uiState.isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    {uiState.botStatus === 'running' ? 'Running' : 'Start Bot'}
                  </Button>
                  <Button 
                    onClick={stopBot} 
                    variant="outline"
                    disabled={uiState.botStatus === 'idle'}
                  >
                    Stop Bot
                  </Button>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm">Test Mode</span>
                    <Switch 
                      checked={uiState.isTestMode} 
                      onCheckedChange={toggleTestMode}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities">
            <OpportunitiesTable
              network={selectedNetwork}
              isActive={uiState.botStatus === 'running'}
              onExecute={(opportunity) => {
                console.log('Executing opportunity:', opportunity);
                // Add execution logic here
              }}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Network Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <NetworkSelector
                    selectedNetwork={selectedNetwork}
                    onNetworkChange={setSelectedNetwork}
                    walletAddress={walletAddress}
                  />
                </CardContent>
              </Card>
              <ThemeCustomizer
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                colorTheme={colorTheme}
                onColorThemeChange={setColorTheme}
                brandingMode={brandingMode}
                onBrandingChange={setBrandingMode}
              />
            </div>
          </TabsContent>

          <TabsContent value="data">
            <FakeDataGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedBotDashboard;