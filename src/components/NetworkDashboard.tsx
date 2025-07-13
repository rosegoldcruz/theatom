import { useState, useEffect } from 'react';
import { NetworkSelector } from '@/components/NetworkSelector';
import { MetaMaskConnect } from '@/components/MetaMaskConnect';
import { EnhancedBotDashboard } from '@/components/EnhancedBotDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NETWORKS } from '@/constants/networks';
import { Settings, Activity, Zap } from 'lucide-react';

export const NetworkDashboard = () => {
  const [selectedNetwork, setSelectedNetwork] = useState('sepolia');
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);

  const network = NETWORKS[selectedNetwork];
  const isCorrectNetwork = currentChainId === network.chainId;
  const canUseBotFeatures = isConnected && isCorrectNetwork;

  // Listen for MetaMask events
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount(null);
          setIsConnected(false);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setCurrentChainId(chainId);
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Get initial state
      window.ethereum.request({ method: 'eth_accounts' })
        .then(handleAccountsChanged);
      window.ethereum.request({ method: 'eth_chainId' })
        .then(handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleNetworkChange = (networkKey: string) => {
    setSelectedNetwork(networkKey);
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">THEATOM.AI</h1>
        <p className="text-muted-foreground">AI-Powered Multi-Chain DeFi Arbitrage Terminal</p>
      </div>

      {/* Network & Connection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Network Configuration
            </CardTitle>
            <CardDescription>
              Select your preferred blockchain network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NetworkSelector 
              current={selectedNetwork} 
              onChange={handleNetworkChange}
              disabled={isConnected}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Wallet Connection
            </CardTitle>
            <CardDescription>
              Connect your MetaMask wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MetaMaskConnect 
              selectedNetwork={selectedNetwork}
              onConnectionChange={handleConnectionChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Status Panel
            </CardTitle>
            <CardDescription>
              Current connection status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Network:</span>
              <Badge variant="outline">{network.name}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Account:</span>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Contract:</span>
              <Badge variant="outline" className="text-xs">
                {network.contracts.ATOM.slice(0, 8)}...
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bot Features */}
      {canUseBotFeatures ? (
        <EnhancedBotDashboard 
          selectedNetwork={selectedNetwork}
          contractAddress={network.contracts.ATOM}
        />
      ) : (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            {!isConnected 
              ? 'Please connect your wallet to access the arbitrage bot features.'
              : !isCorrectNetwork 
              ? `Please switch to ${network.name} to use the arbitrage bot.`
              : 'Loading bot features...'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};