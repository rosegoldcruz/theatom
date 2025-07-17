import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { NetworkSelector } from './NetworkSelector';
import { ThemeCustomizer } from './ThemeCustomizer';
import { useRealData, useNetworkStats } from '../hooks/useRealData';
import OpportunitiesTable from './OpportunitiesTable';
import priceService, { ArbitrageOpportunity } from '../services/priceService';
import blockchainService from '../services/blockchainService';

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
  const [selectedNetwork, setSelectedNetwork] = useState('base'); // 🔥 DEFAULT TO BASE SEPOLIA
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colorTheme, setColorTheme] = useState('blue');
  const [brandingMode, setBrandingMode] = useState('arbitrage');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [walletAddress] = useState('0x742d35Cc6634C0532925a3b8D4e4D4c7b0e4c4e4');

  const [uiState, setUiState] = useState<UIState>({
    isLoading: false,
    isTestMode: false, // 🔥 NO MORE TEST MODE - THIS IS REAL!
    botStatus: 'idle',
    connectionStatus: 'connected'
  });

  // 🔥 REAL DATA STATE - REPLACING ALL FAKE DATA
  const [realOpportunities, setRealOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [networkStats, setNetworkStats] = useState<any>(null);
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);
  const [isEventListening, setIsEventListening] = useState(false);

  // 🔥 REAL DATA HOOKS - DEATH TO FAKE DATA!
  const realData = useRealData(walletAddress);
  const realNetworkStats = useNetworkStats(selectedNetwork);

  // 🔥 REAL-TIME DATA UPDATES
  useEffect(() => {
    if (selectedNetwork === 'base') {
      realData.refreshData();
    }
  }, [selectedNetwork, realData.refreshData]);

  // 🔥 REAL-TIME DATA FETCHING - NO MORE FAKE DATA!
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const [opportunities, stats] = await Promise.all([
          priceService.getArbitrageOpportunities(selectedNetwork),
          priceService.getNetworkStats(selectedNetwork)
        ]);
        setRealOpportunities(opportunities);
        setNetworkStats(stats);
      } catch (error) {
        console.error('Error fetching real data:', error);
      }
    };

    // Initial fetch
    fetchRealData();

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      if (uiState.botStatus === 'running') {
        fetchRealData();
      }
    }, 10000); // Update every 10 seconds for real data

    return () => clearInterval(interval);
  }, [uiState.botStatus, selectedNetwork]);

  // 🔥 REAL-TIME BLOCKCHAIN EVENT LISTENING
  useEffect(() => {
    if (uiState.botStatus === 'running' && selectedNetwork === 'base') {
      setIsEventListening(true);

      const handleBlockchainEvent = (event: any) => {
        console.log('🔥 Real-time blockchain event:', event);

        setRealtimeEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events

        if (event.type === 'trade_executed') {
          // Update real data when a trade is executed
          realData.refreshData();
        } else if (event.type === 'opportunity_detected') {
          // Refresh opportunities when new ones are detected
          priceService.getArbitrageOpportunities(selectedNetwork).then(setRealOpportunities);
        } else if (event.type === 'new_block') {
          // Update network stats on new blocks
          priceService.getNetworkStats(selectedNetwork).then(setNetworkStats);
        }
      };

      // Start listening for real-time events
      blockchainService.startEventListening(handleBlockchainEvent);

      return () => {
        blockchainService.stopEventListening();
        setIsEventListening(false);
      };
    }
  }, [uiState.botStatus, selectedNetwork, realData]);

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
            <TabsTrigger value="events">Live Events</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* 🔥 REAL STATS - NO MORE FAKE BULLSHIT */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ${realData.stats.totalProfit.toFixed(4)} ETH
                      </div>
                      <div className="text-sm text-gray-600">
                        Real Profit {realData.stats.networkStatus === 'connected' ? '🟢' : '🔴'}
                      </div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{realData.recentTrades.length}</div>
                  <div className="text-sm text-gray-600">Real Trades</div>
                  <Progress value={realData.stats.successRate} className="mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {realData.stats.successRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Live Success Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {realData.stats.activeOpportunities}
                  </div>
                  <div className="text-sm text-gray-600">Active Opportunities</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Gas: {realData.stats.gasPrice} gwei
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 🔥 REAL NETWORK STATISTICS */}
            {networkStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Live Network Stats - {selectedNetwork.toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-lg font-bold">{networkStats.blockNumber}</div>
                      <div className="text-sm text-gray-600">Current Block</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{networkStats.gasPrice.toFixed(2)} gwei</div>
                      <div className="text-sm text-gray-600">Gas Price</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{networkStats.avgBlockTime}s</div>
                      <div className="text-sm text-gray-600">Block Time</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        <Badge variant={networkStats.networkLoad === 'High' ? 'destructive' :
                                      networkStats.networkLoad === 'Medium' ? 'default' : 'secondary'}>
                          {networkStats.networkLoad}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">Network Load</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-lg font-bold text-green-600">{networkStats.totalOpportunities}</div>
                      <div className="text-sm text-gray-600">Total Opportunities</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">{networkStats.activeOpportunities}</div>
                      <div className="text-sm text-gray-600">Active Now</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{networkStats.successRate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🔥 Real-Time</span>
                      <Switch
                        checked={realData.isRealTimeEnabled}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            realData.enableRealTimeUpdates();
                          } else {
                            realData.disableRealTimeUpdates();
                          }
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {realData.isLoading ? 'Loading...' : `Updated: ${new Date(realData.lastUpdated).toLocaleTimeString()}`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Live Arbitrage Opportunities - {selectedNetwork.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {realOpportunities.length > 0 ? (
                  <div className="space-y-4">
                    {realOpportunities.map((opportunity) => (
                      <Card key={opportunity.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-lg">{opportunity.pair}</div>
                              <div className="text-sm text-gray-600">
                                Buy: {opportunity.buyExchange} → Sell: {opportunity.sellExchange}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Volume: {opportunity.volume.toFixed(4)} | Gas: ~${opportunity.gasEstimate}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600">
                                +{opportunity.profitPercent.toFixed(2)}%
                              </div>
                              <div className="text-sm text-gray-600">
                                ${opportunity.profitUSD.toFixed(4)}
                              </div>
                              <Badge variant="secondary" className="mt-1">
                                {opportunity.confidence.toFixed(0)}% confidence
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500">No arbitrage opportunities found</div>
                    <div className="text-sm text-gray-400 mt-2">
                      {uiState.botStatus === 'running' ? 'Scanning for opportunities...' : 'Start the bot to scan for opportunities'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-Time Blockchain Events
                  {isEventListening && (
                    <Badge variant="secondary" className="ml-2">
                      🔴 LIVE
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {realtimeEvents.length > 0 ? (
                  <div className="space-y-3">
                    {realtimeEvents.map((event, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">
                                {event.type === 'trade_executed' && '💰 Trade Executed'}
                                {event.type === 'opportunity_detected' && '🎯 Opportunity Detected'}
                                {event.type === 'new_block' && '⛏️ New Block'}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {event.type === 'trade_executed' && (
                                  <>Token: {event.data.token} | Profit: {event.data.profit} ETH</>
                                )}
                                {event.type === 'opportunity_detected' && (
                                  <>Pair: {event.data.pair} | Est. Profit: {event.data.profitEstimate} ETH</>
                                )}
                                {event.type === 'new_block' && (
                                  <>Block: {event.data.blockNumber}</>
                                )}
                              </div>
                              {event.data.txHash && (
                                <div className="text-xs text-gray-400 mt-1">
                                  TX: {event.data.txHash.slice(0, 10)}...{event.data.txHash.slice(-8)}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(event.data.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500">No real-time events yet</div>
                    <div className="text-sm text-gray-400 mt-2">
                      {uiState.botStatus === 'running'
                        ? 'Listening for blockchain events...'
                        : 'Start the bot to see real-time events'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedBotDashboard;