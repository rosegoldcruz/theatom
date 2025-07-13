import { useState } from 'react';
import { NetworkDashboard } from '@/components/NetworkDashboard';
import { Web3Connection } from '@/components/Web3Connection';
import { useWeb3 } from '@/hooks/useWeb3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, Zap, ArrowLeft, Network } from 'lucide-react';

export const Web3Dashboard = () => {
  const { isConnected, isSepoliaNetwork, isBaseSepoliaNetwork } = useWeb3();
  const [showNetworkDashboard, setShowNetworkDashboard] = useState(false);
  const [showBot, setShowBot] = useState(false);

  const handleProceedToBot = () => {
    console.log('Proceeding to bot dashboard');
    setShowBot(true);
  };

  const handleShowNetworkDashboard = () => {
    setShowNetworkDashboard(true);
  };

  const handleBackToConnection = () => {
    setShowBot(false);
    setShowNetworkDashboard(false);
  };

  const isSupportedNetwork = isSepoliaNetwork || isBaseSepoliaNetwork;

  // Show the network dashboard with full multi-chain support
  if (showNetworkDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <Button 
              onClick={handleBackToConnection}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Connection
            </Button>
          </div>
          <NetworkDashboard />
        </div>
      </div>
    );
  }

  // Show connection screen for all other states
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="space-y-6 max-w-md w-full">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white mb-2">THEATOM.AI</h1>
          <p className="text-gray-300">AI-Powered Multi-Chain DeFi Arbitrage Terminal</p>
        </div>
        
        <Web3Connection onProceedToBot={handleProceedToBot} />
        
        {/* New Multi-Chain Dashboard Button */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Multi-Chain Dashboard
            </CardTitle>
            <CardDescription>
              Access the full network selection and trading interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleShowNetworkDashboard}
              className="w-full"
              variant="outline"
            >
              <Network className="h-4 w-4 mr-2" />
              Enter Multi-Chain Dashboard
            </Button>
          </CardContent>
        </Card>
        
        {isConnected && !isSupportedNetwork && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Supported Networks
              </CardTitle>
              <CardDescription>
                This arbitrage bot supports multiple testnets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  Switch networks in the Multi-Chain Dashboard to access Base Sepolia, Ethereum Sepolia, Goerli, and Arbitrum testnets.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};